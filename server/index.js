const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "production",
  tracesSampleRate: 0.1,
});
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const puppeteer = require("puppeteer");
const cron = require("node-cron");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const {
  categorizeCookie,
  enrichCookieDescription,
  normalizeUrl,
} = require("./utils");

const DEBUG = process.env.DEBUG === "true";
function dbg(...args) {
  if (DEBUG) console.log(...args);
}

// ─── Credentials from environment (never hardcoded) ───────────────────────────
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const IP_SALT = process.env.IP_SALT || "uterms-default-salt-change-me";
if (!process.env.IP_SALT) {
  console.warn("[server] IP_SALT is not set — IP anonymisation uses a weak default. Set IP_SALT in .env for production.");
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "[server] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing from .env",
  );
  process.exit(1);
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "[server] SUPABASE_SERVICE_ROLE_KEY is not set — scheduled scan endpoints will not work.",
  );
}

// ─── Supabase fetch headers ───────────────────────────────────────────────────
function anonHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

function serviceHeaders() {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };
}

// ─── Supabase fetch with timeout ──────────────────────────────────────────────
async function supabaseFetch(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── IP anonymization ─────────────────────────────────────────────────────────
function anonymizeIp(ip) {
  if (!ip) return null;
  const clean = ip.replace(/^::ffff:/i, "");
  const ipv4Match = clean.match(/^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
  if (ipv4Match) return `${ipv4Match[1]}.${ipv4Match[2]}.x.x`;
  return crypto
    .createHash("sha256")
    .update(clean + IP_SALT)
    .digest("hex")
    .slice(0, 16);
}

// ─── SSRF protection ──────────────────────────────────────────────────────────
function validatePublicUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return "Invalid URL format";
  }
  if (!["http:", "https:"].includes(parsed.protocol))
    return "Only http and https URLs are allowed";
  const h = parsed.hostname.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1" || h === "::1" || h === "0.0.0.0")
    return "Scanning localhost is not allowed";
  if (
    /^10\./.test(h) ||
    /^172\.(1[6-9]|2[0-9]|3[01])\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^169\.254\./.test(h) ||
    /^fc00:/i.test(h) ||
    /^fe80:/i.test(h)
  )
    return "Scanning private IP ranges is not allowed";
  if (
    h === "169.254.169.254" ||        // AWS / Azure IMDS
    h === "168.63.129.16" ||          // Azure internal DNS
    h === "metadata.google.internal"  // GCP metadata
  )
    return "Scanning metadata endpoints is not allowed";
  return null;
}

// ─── UUID validation ──────────────────────────────────────────────────────────
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(id) {
  return UUID_RE.test(id);
}

// ─── Generic published-policy fetcher (used by embed routes) ──────────────────
async function fetchPublishedPolicy(table, userId) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?user_id=eq.${encodeURIComponent(userId)}&status=eq.published&select=id,title,status,generated,updated_at&order=updated_at.desc&limit=1`;
  const response = await supabaseFetch(url, { headers: anonHeaders() });
  if (!response.ok) {
    const err = new Error(await response.text());
    err.status = response.status;
    throw err;
  }
  const data = await response.json();
  return data && data.length > 0 ? data[0] : null;
}

// ─── API key validation middleware ────────────────────────────────────────────
async function validateApiKey(req, res, next) {
  const key = req.headers["x-api-key"];
  if (!key)
    return res.status(401).json({
      error: "API key required. Add the X-API-Key header to your request.",
    });
  if (!/^utk_[0-9a-f]{32}$/.test(key))
    return res.status(401).json({ error: "Invalid API key format." });
  try {
    const response = await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/api_keys?api_key=eq.${encodeURIComponent(key)}&select=user_id&limit=1`,
      { headers: anonHeaders() },
      5000,
    );
    const data = await response.json();
    if (!data || data.length === 0)
      return res.status(401).json({ error: "Invalid API key." });
    const { userId } = req.params;
    if (userId && data[0].user_id !== userId)
      return res
        .status(403)
        .json({ error: "API key does not belong to this user ID." });
    req.apiKeyUserId = data[0].user_id;
    next();
  } catch (err) {
    console.error("[validateApiKey] Error:", err.message);
    res.status(500).json({ error: "Could not validate API key." });
  }
}

// ─── Puppeteer browser helper ─────────────────────────────────────────────────
const BROWSER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-gpu",
  "--disable-dev-shm-usage",
  "--no-zygote",
  "--single-process",
];

function launchBrowser() {
  return puppeteer.launch({ headless: true, args: BROWSER_ARGS });
}

// ─── Warm browser pool (avoids cold-start cost on every scan) ─────────────────
let _sharedBrowser = null;

async function getSharedBrowser() {
  if (_sharedBrowser && _sharedBrowser.connected) return _sharedBrowser;
  _sharedBrowser = await puppeteer.launch({ headless: true, args: BROWSER_ARGS });
  _sharedBrowser.on("disconnected", () => {
    console.warn("[browser-pool] Browser disconnected — will relaunch on next scan.");
    _sharedBrowser = null;
  });
  console.log("[browser-pool] Warm browser launched.");
  return _sharedBrowser;
}

// Block resources that don't affect cookie setting (images, fonts, media)
// This significantly speeds up networkidle2 by eliminating irrelevant network activity.
const BLOCKED_RESOURCE_TYPES = new Set(["image", "media", "font", "other"]);

async function newScanPage(browser) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (BLOCKED_RESOURCE_TYPES.has(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });
  return page;
}

// ─── Rate limiters ─────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const scanLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Scan limit reached. You can perform up to 5 scans per hour.",
  },
});

const deleteAccountLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many account deletion attempts. Try again later." },
});

const bannerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests." },
});

// ─── App setup ────────────────────────────────────────────────────────────────
const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", SUPABASE_URL || ""],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embed scripts to be loaded cross-origin
}));
app.use(compression());
app.use(
  cors({
    origin: ["https://uterms.io", "https://www.uterms.io", /\.uterms\.io$/],
    credentials: true,
  }),
);
app.use(express.json());

// Rate limit groups
app.use("/api/banner", bannerLimiter);
app.use("/api/embed", generalLimiter);
app.use("/api/consent", generalLimiter);
app.use("/api/policy", generalLimiter);
app.use("/api/cookie-policy", generalLimiter);
app.use("/api/tos", generalLimiter);
app.use("/api/eula", generalLimiter);
app.use("/api/return-policy", generalLimiter);
app.use("/api/disclaimer", generalLimiter);
app.use("/api/shipping-policy", generalLimiter);
app.use("/api/aup", generalLimiter);
app.use("/api/impressum", generalLimiter);
app.use("/api/accessibility", generalLimiter);
app.use("/api/scan", scanLimiter);
app.use("/api/analyze-policy", scanLimiter);
Sentry.setupExpressErrorHandler(app);
// ─── Cookie category templates ────────────────────────────────────────────────
const CATEGORY_TEMPLATES = [
  {
    id: "essential",
    name: "Essential",
    description:
      "These cookies are strictly necessary for your website to properly function, and therefore cannot be disabled by your users.",
    providers: [],
  },
  {
    id: "functional",
    name: "Functional",
    description:
      "These cookies are used to enhance the performance and functionality of our websites but are non-essential to their use. However, without these cookies, certain functionality (like videos) may become unavailable.",
    providers: [],
  },
  {
    id: "analytics",
    name: "Analytics",
    description:
      "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.",
    providers: [],
  },
  {
    id: "marketing",
    name: "Marketing",
    description:
      "These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, and in some cases selecting advertisements that are based on your interests.",
    providers: [],
  },
  {
    id: "social",
    name: "Social",
    description:
      "These cookies are set by a range of social media services that we have added to the site to enable you to share our content with your friends and networks. They are capable of tracking your browser across other sites and building up a profile of your interests.",
    providers: [],
  },
  {
    id: "unclassified",
    name: "Unclassified",
    description:
      "Unclassified cookies are cookies that we are in the process of classifying, together with the providers of individual cookies.",
    providers: [],
  },
];

// ─── Shared scan function ─────────────────────────────────────────────────────
async function performScan(url) {
  const targetUrl = normalizeUrl(url);
  dbg(`[scan] Scanning URL: ${targetUrl}`);

  const browser = await getSharedBrowser();
  const page = await newScanPage(browser); // resource-blocked page

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    try {
      await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 20000 });
    } catch {
      console.warn(
        `networkidle2 timeout for ${targetUrl}, retrying with domcontentloaded`,
      );
      await page.goto(targetUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
    }

    // Auto-scroll to trigger lazy-loaded scripts (cap at 2 s — enough for most sites)
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const deadline = Date.now() + 2_000;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;
            if (
              totalHeight >= scrollHeight - window.innerHeight ||
              Date.now() >= deadline
            ) {
              clearInterval(timer);
              resolve(undefined);
            }
          }, 100);
        }),
    );

    // Try clicking common accept buttons — only wait if a button was actually found
    try {
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(
          document.querySelectorAll('button, a, div[role="button"]'),
        );
        const acceptBtn = buttons.find((b) => {
          const text = (b.textContent || "").toLowerCase().trim();
          return [
            "accept",
            "accept all",
            "allow all",
            "agree",
            "accept all cookies",
            "ok",
          ].includes(text);
        });
        if (acceptBtn) { acceptBtn.click(); return true; }
        return false;
      });
      // Only wait if a button was clicked — no point sleeping otherwise
      if (clicked) await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (e) {
      console.error("Error clicking consent banner:", e);
    }

    // Collect CDP cookies and storage in parallel
    const client = await page.createCDPSession();
    const [{ cookies: cdpCookies }, storageKeys] = await Promise.all([
      client.send("Network.getAllCookies"),
      page.evaluate(() => {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++)
          keys.push({ name: localStorage.key(i), type: "Local Storage" });
        for (let i = 0; i < sessionStorage.length; i++)
          keys.push({ name: sessionStorage.key(i), type: "Session Storage" });
        return keys;
      }),
    ]);

    const cookies = [...cdpCookies];
    for (const item of storageKeys) {
      cookies.push({
        name: item.name,
        domain: new URL(targetUrl).hostname,
        expires: -1,
        session: true,
        isStorage: true,
        storageType: item.type,
      });
    }

    const categories = JSON.parse(JSON.stringify(CATEGORY_TEMPLATES));

    for (const cookie of cookies) {
      const catId = categorizeCookie(cookie);
      const category = categories.find((c) => c.id === catId);
      const providerName = cookie.domain || "Unknown Provider";
      let provider = category.providers.find((p) => p.name === providerName);
      if (!provider) {
        provider = { name: providerName, cookies: [] };
        category.providers.push(provider);
      }
      let fallbackDescription;
      if (cookie.isStorage) {
        fallbackDescription = `Stored in ${cookie.storageType} by ${providerName}.`;
      } else {
        const daysLeft =
          cookie.expires > 0
            ? Math.round((cookie.expires - Date.now() / 1000) / 86400)
            : null;
        fallbackDescription = `Set by ${providerName}. ${daysLeft !== null ? `Expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}.` : "Session cookie — expires when the browser is closed."}`;
      }
      provider.cookies.push({
        name: cookie.name,
        description: enrichCookieDescription(cookie, fallbackDescription),
        domain: cookie.domain,
        expiration: cookie.isStorage
          ? cookie.storageType
          : cookie.expires > 0
            ? `${Math.round((cookie.expires - Date.now() / 1000) / 86400)} days`
            : "Session",
      });
    }

    return { url: targetUrl, cookiesCount: cookies.length, categories };
  } finally {
    await page.close(); // close page only — keep shared browser warm
  }
}

// ─── POST /api/scan ───────────────────────────────────────────────────────────
app.post("/api/scan", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });
  const normalised = normalizeUrl(url);
  const urlError = validatePublicUrl(normalised);
  if (urlError) return res.status(400).json({ error: urlError });
  try {
    const result = await performScan(normalised);
    res.json(result);
  } catch (err) {
    console.error("Scan Error:", err);
    res.status(500).json({ error: "Failed to scan website" });
  }
});

// ─── GET /api/banner/:id ──────────────────────────────────────────────────────
app.get("/api/banner/:id", async (req, res) => {
  const { id } = req.params;
  if (!isValidUUID(id)) {
    return res.status(400).json({
      error:
        "Invalid user ID. Use a UUID, e.g. /api/banner/123e4567-e89b-12d3-a456-426614174000",
    });
  }
  try {
    const response = await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/user_cookie_settings?user_id=eq.${id}&select=banner_config,scanned_data`,
      { headers: anonHeaders() },
    );
    if (!response.ok)
      return res
        .status(response.status)
        .json({ error: "Failed to fetch from DB" });
    const data = await response.json();
    if (data && data.length > 0) {
      res.set("Cache-Control", "public, max-age=60"); // 60s — banner config changes are near-instant
      res.json(data[0]);
    } else {
      res.status(404).json({ error: "Settings not found for user" });
    }
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// ─── GET /api/consent/:userId ─────────────────────────────────────────────────
app.get("/api/consent/:userId", validateApiKey, async (req, res) => {
  const { userId } = req.params;
  if (!isValidUUID(userId))
    return res.status(400).json({ error: "Invalid user ID" });

  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const offset = parseInt(req.query.offset) || 0;
  const from = req.query.from
    ? `&created_at=gte.${encodeURIComponent(req.query.from)}`
    : "";

  try {
    const response = await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/visitor_consent?user_id=eq.${encodeURIComponent(userId)}&select=id,visitor_id,consent_data,url,created_at&order=created_at.desc&limit=${limit}&offset=${offset}${from}`,
      { headers: { ...anonHeaders(), Prefer: "count=exact" } },
    );
    if (!response.ok) {
      console.error("[Consent GET] Error:", await response.text());
      return res
        .status(response.status)
        .json({ error: "Failed to fetch consent records" });
    }
    const data = await response.json();
    const totalCount = parseInt(
      response.headers.get("content-range")?.split("/")[1] || "0",
    );
    res.json({ records: data, total: totalCount, limit, offset });
  } catch (err) {
    console.error("[Consent GET] Error:", err.message);
    res.status(500).json({ error: "Failed to fetch consent records" });
  }
});

// ─── POST /api/consent ────────────────────────────────────────────────────────
app.post("/api/consent", async (req, res) => {
  const { user_id, visitor_id, consent_data, url } = req.body;
  if (!user_id || !visitor_id || !consent_data)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    const payload = {
      user_id,
      visitor_id,
      consent_data,
      url: url || req.headers.referer || req.get("origin") || "",
      ip_address: anonymizeIp(req.ip),
      user_agent: req.get("user-agent"),
    };
    const response = await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/visitor_consent`,
      {
        method: "POST",
        headers: { ...anonHeaders(), Prefer: "return=representation" },
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok) {
      console.error("Supabase Insert Error:", await response.text());
      return res
        .status(response.status)
        .json({ error: "Failed to write to DB" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Consent API Error:", err);
    res.status(500).json({ error: "Failed to record consent" });
  }
});

// ─── DELETE /api/consent/:userId ──────────────────────────────────────────────
app.delete("/api/consent/:userId", validateApiKey, async (req, res) => {
  const { userId } = req.params;
  if (!isValidUUID(userId))
    return res.status(400).json({ error: "Invalid user ID" });
  try {
    const response = await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/visitor_consent?user_id=eq.${encodeURIComponent(userId)}`,
      {
        method: "DELETE",
        headers: { ...serviceHeaders(), Prefer: "return=minimal" },
      },
    );
    if (!response.ok) {
      console.error("[Consent DELETE] Error:", await response.text());
      return res
        .status(response.status)
        .json({ error: "Failed to delete consent records" });
    }
    res.json({ success: true, message: "All consent records deleted." });
  } catch (err) {
    console.error("[Consent DELETE] Error:", err.message);
    res.status(500).json({ error: "Failed to delete consent records" });
  }
});

// ─── Authenticated policy fetch endpoints (10 routes → 1 helper) ─────────────
const POLICY_ROUTES = [
  {
    route: "/api/policy/:userId",
    table: "privacy_policies",
    label: "Privacy Policy",
  },
  {
    route: "/api/cookie-policy/:userId",
    table: "cookie_policies",
    label: "Cookie Policy",
  },
  {
    route: "/api/tos/:userId",
    table: "terms_of_service",
    label: "Terms of Service",
  },
  { route: "/api/eula/:userId", table: "eula", label: "EULA" },
  {
    route: "/api/return-policy/:userId",
    table: "return_policy",
    label: "Return Policy",
  },
  {
    route: "/api/disclaimer/:userId",
    table: "disclaimer",
    label: "Disclaimer",
  },
  {
    route: "/api/shipping-policy/:userId",
    table: "shipping_policy",
    label: "Shipping Policy",
  },
  {
    route: "/api/aup/:userId",
    table: "acceptable_use_policy",
    label: "Acceptable Use Policy",
  },
  { route: "/api/impressum/:userId", table: "impressum", label: "Impressum" },
  {
    route: "/api/accessibility/:userId",
    table: "accessibility_statement",
    label: "Accessibility Statement",
  },
];

POLICY_ROUTES.forEach(({ route, table, label }) => {
  app.get(route, validateApiKey, async (req, res) => {
    const { userId } = req.params;
    if (!isValidUUID(userId))
      return res.status(400).json({ error: "Invalid user ID" });
    try {
      const policy = await fetchPublishedPolicy(table, userId);
      if (!policy)
        return res
          .status(404)
          .json({ error: `No published ${label} found for this user` });
      res.json(policy);
    } catch (err) {
      console.error(`[${label} API] Error:`, err.message);
      res.status(err.status || 500).json({ error: `Failed to fetch ${label}` });
    }
  });
});

// ─── Test / preview HTML pages ───────────────────────────────────────────────
const TEST_HTML_FILES = [
  "test-embed.html",
  "test-policy.html",
  "test-cookie-policy.html",
  "test-tos.html",
  "test-eula.html",
  "test-return-policy.html",
  "test-disclaimer.html",
  "test-shipping.html",
  "test-aup.html",
  "test-impressum.html",
  "test-accessibility.html",
];

TEST_HTML_FILES.forEach((file) => {
  app.get(`/${file}`, (req, res) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src *; img-src *",
    );
    res.sendFile(path.resolve(__dirname, "../public", file));
  });
});

// ─── Policy embed JS file routes ──────────────────────────────────────────────
const EMBED_FILE_ROUTES = [
  { route: "/uterms-embed.js", file: "uterms-embed.js" },
  { route: "/uterms-policy-embed.js", file: "uterms-policy-embed.js" },
  { route: "/uterms-cookie-embed.js", file: "uterms-cookie-embed.js" },
  { route: "/uterms-tos-embed.js", file: "uterms-tos-embed.js" },
  { route: "/uterms-eula-embed.js", file: "uterms-eula-embed.js" },
  {
    route: "/uterms-return-policy-embed.js",
    file: "uterms-return-policy-embed.js",
  },
  { route: "/uterms-disclaimer-embed.js", file: "uterms-disclaimer-embed.js" },
  { route: "/uterms-shipping-embed.js", file: "uterms-shipping-embed.js" },
  { route: "/uterms-aup-embed.js", file: "uterms-aup-embed.js" },
  { route: "/uterms-impressum-embed.js", file: "uterms-impressum-embed.js" },
  {
    route: "/uterms-accessibility-embed.js",
    file: "uterms-accessibility-embed.js",
  },
];

EMBED_FILE_ROUTES.forEach(({ route, file }) => {
  app.get(route, (req, res) => {
    if (!req.query.id)
      return res
        .status(400)
        .type("text/javascript")
        .send('console.error("User ID required");');
    res
      .type("text/javascript")
      .set("Cache-Control", "public, max-age=3600") // 1 hour — embed scripts rarely change
      .sendFile(path.resolve(__dirname, "../public", file));
  });
});

// ─── Public embed API routes (no auth — used by embed scripts) ────────────────
const EMBED_POLICY_ROUTES = [
  { path: "/api/embed/policy/:userId", table: "privacy_policies" },
  { path: "/api/embed/cookie-policy/:userId", table: "cookie_policies" },
  { path: "/api/embed/tos/:userId", table: "terms_of_service" },
  { path: "/api/embed/eula/:userId", table: "eula" },
  { path: "/api/embed/return-policy/:userId", table: "return_policy" },
  { path: "/api/embed/disclaimer/:userId", table: "disclaimer" },
  { path: "/api/embed/shipping-policy/:userId", table: "shipping_policy" },
  { path: "/api/embed/aup/:userId", table: "acceptable_use_policy" },
  { path: "/api/embed/impressum/:userId", table: "impressum" },
  {
    path: "/api/embed/accessibility/:userId",
    table: "accessibility_statement",
  },
];

EMBED_POLICY_ROUTES.forEach(({ path: routePath, table }) => {
  app.get(routePath, async (req, res) => {
    const { userId } = req.params;
    if (!isValidUUID(userId))
      return res.status(400).json({ error: "Invalid user ID" });
    try {
      const policy = await fetchPublishedPolicy(table, userId);
      if (!policy)
        return res
          .status(404)
          .json({ error: "No published document found for this user" });
      res.json(policy);
    } catch (err) {
      console.error(`[embed ${routePath}] Error:`, err.message);
      res.status(err.status || 500).json({ error: "Failed to fetch document" });
    }
  });
});

// ─── Inline policy embed (privacy policy HTML injection) ─────────────────────
app.get("/uterms-policy-embed.js", async (req, res) => {
  const { id } = req.query;
  if (!id)
    return res
      .status(400)
      .type("text/javascript")
      .send('console.error("User ID required");');
  try {
    const response = await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/privacy_policies?user_id=eq.${encodeURIComponent(id)}&select=id,title,generated,updated_at&order=updated_at.desc&limit=1`,
      { headers: anonHeaders() },
    );
    if (!response.ok)
      return res
        .type("text/javascript")
        .send('console.error("Failed to fetch policy");');
    const data = await response.json();
    if (!data || data.length === 0)
      return res
        .type("text/javascript")
        .send('console.error("No policy found for this user.");');
    if (!data[0].generated)
      return res
        .type("text/javascript")
        .send('console.error("Policy not yet generated.");');

    const script = `
(function() {
  var container = document.getElementById('uterms-policy');
  if (!container) { console.error('uterms-policy container not found'); return; }
  (function(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    doc.querySelectorAll('script,iframe,object,embed').forEach(function(el) { el.remove(); });
    doc.querySelectorAll('*').forEach(function(el) {
      Array.from(el.attributes).forEach(function(a) { if (a.name.startsWith('on')) el.removeAttribute(a.name); });
    });
    container.innerHTML = doc.body.innerHTML;
  })(${JSON.stringify(data[0].generated)});
  var style = document.createElement('style');
  style.textContent = '#uterms-policy{padding:20px;font-family:system-ui,sans-serif;line-height:1.6;color:#333}#uterms-policy h1{font-size:2rem;margin-bottom:1rem}#uterms-policy h2{font-size:1.5rem;margin:1.5rem 0 1rem}#uterms-policy section{margin-bottom:2rem}#uterms-policy table{width:100%;border-collapse:collapse}#uterms-policy th,#uterms-policy td{border:1px solid #ddd;padding:8px;text-align:left}#uterms-policy th{background:#f5f5f5;font-weight:bold}#uterms-policy ul{margin-left:20px}#uterms-policy li{margin-bottom:.5rem}';
  document.head.appendChild(style);
})();`;
    res.type("text/javascript").send(script);
  } catch (err) {
    console.error("Policy Embed Error:", err);
    res.type("text/javascript").send('console.error("Failed to load policy");');
  }
});

// ─── POST /api/analyze-policy ─────────────────────────────────────────────────
app.post("/api/analyze-policy", validateApiKey, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });
  const targetUrl = normalizeUrl(url);
  const urlError = validatePublicUrl(targetUrl);
  if (urlError) return res.status(400).json({ error: urlError });

  const browser = await getSharedBrowser();
  const page = await browser.newPage();
  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );
    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 30000 });

    const homepageContent = await page.evaluate(() => {
      const title = document.title || "";
      const description =
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") || "";
      const ogSiteName =
        document
          .querySelector('meta[property="og:site_name"]')
          ?.getAttribute("content") || "";
      const footerEl = document.querySelector(
        "footer, .footer, #footer, [class*='footer'], [id*='footer']",
      );
      const footer = (footerEl?.innerText || "").slice(0, 3000);
      const bodyTail = (document.body?.innerText || "").slice(-10000);
      const corpus = footer + "\n" + bodyTail;

      const coNoMatch = corpus.match(
        /(?:company\s*(?:no|number|reg(?:istration)?)[\s.:#]*|(?:reference|registration)\s+number\s+)([A-Z0-9]{6,12})/i,
      );
      const addrMatch = corpus.match(
        /registered\s+offices?\s+(?:address[:\s]+|(?:is\s+)?(?:are\s+)?located\s+at\s+|at\s+)([^.\n]{10,200})/i,
      );
      const vatMatch = corpus.match(
        /vat\s*(?:no|number|reg(?:istration)?)[\s.:]*([A-Z]{0,2}[0-9]{9,12})/i,
      );
      const regInMatch = corpus.match(
        /registered\s+in\s+(England\s*(?:&|and)\s*Wales|Scotland|Northern\s+Ireland|Wales|United\s+Kingdom|United\s+States|Canada|Australia|Germany|France|Netherlands|Singapore|India|Malaysia)/i,
      );

      return {
        title,
        description,
        ogSiteName,
        footer,
        bodyText: (document.body?.innerText || "").slice(0, 5000),
        companyNo: coNoMatch ? coNoMatch[1].trim() : "",
        registeredAddress: addrMatch ? addrMatch[1].trim() : "",
        vatNo: vatMatch ? vatMatch[1].trim() : "",
        detectedCountry: regInMatch ? regInMatch[1].trim() : "",
      };
    });

    let privacyPageContent = "";
    try {
      const privacyLink = await page.evaluate(() => {
        const found = Array.from(document.querySelectorAll("a[href]")).find(
          (l) => {
            const text = (l.textContent || "").toLowerCase();
            const href = (l.getAttribute("href") || "").toLowerCase();
            return text.includes("privacy") || href.includes("privacy");
          },
        );
        return found ? found.href : null;
      });
      if (privacyLink) {
        await page.goto(privacyLink, {
          waitUntil: "networkidle2",
          timeout: 15000,
        });
        privacyPageContent = await page.evaluate(() =>
          (document.body?.innerText || "").slice(0, 8000),
        );
      }
    } catch (e) {
      dbg("Could not fetch privacy page:", e.message);
    }

    let companyName = homepageContent.ogSiteName;
    if (!companyName) {
      const titleParts = homepageContent.title.split(/[-|]/);
      companyName =
        titleParts.length > 0
          ? titleParts[0].trim()
          : (() => {
              try {
                const u = new URL(targetUrl);
                const h = u.hostname.replace("www.", "");
                return h.charAt(0).toUpperCase() + h.slice(1);
              } catch {
                return "My Company";
              }
            })();
    }

    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const combinedText = (
      homepageContent.footer +
      " " +
      privacyPageContent
    ).slice(0, 10000);
    const uniqueEmails = [
      ...new Set(
        (combinedText.match(emailRegex) || []).map((e) => e.toLowerCase()),
      ),
    ];
    const privacyEmail =
      uniqueEmails.find((e) => /privacy|legal|compliance|dpo/i.test(e)) ||
      uniqueEmails.find((e) => /info|contact|support|hello/i.test(e)) ||
      uniqueEmails[0] ||
      "";

    const analysis = {
      companyName,
      websiteUrl: targetUrl,
      country: homepageContent.detectedCountry || "United Kingdom",
      state: "",
      collectsName: false,
      collectsEmail: false,
      collectsPhone: false,
      collectsAddress: false,
      collectsPayment: false,
      collectsDeviceInfo: false,
      collectsUsageData: false,
      collectsLocation: false,
      purposeServiceDelivery: false,
      purposeMarketing: false,
      purposeAnalytics: false,
      purposeLegal: false,
      purposeSecurity: false,
      sharesData: false,
      sharesWithAdNetworks: false,
      sharesWithAnalytics: false,
      sharesWithPaymentProcessors: false,
      sharesWithSocialMedia: false,
      sharesWithCloud: false,
      rightToAccess: false,
      rightToDeletion: false,
      rightToPortability: false,
      rightToRestriction: false,
      rightToOptOut: false,
      usesCookies: false,
      cookieTypes: [],
      privacyEmail,
      scrapedDetails: {
        companyNo: homepageContent.companyNo,
        vatNo: homepageContent.vatNo,
        registeredAddress: homepageContent.registeredAddress,
      },
    };
    res.json({ success: true, analysis });
  } catch (err) {
    console.error("Analyze Policy Error:", err);
    res.status(500).json({ error: "Failed to analyze website" });
  } finally {
    await page.close(); // keep shared browser warm
  }
});

// ─── POST /api/gcm-scan ───────────────────────────────────────────────────────
app.post("/api/gcm-scan", scanLimiter, validateApiKey, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });
  const targetUrl = normalizeUrl(url);
  const urlError = validatePublicUrl(targetUrl);
  if (urlError) return res.status(400).json({ error: urlError });

  const browser = await getSharedBrowser();
  const page = await browser.newPage();
  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    const googleTagUrls = [];
    page.on("request", (request) => {
      const u = request.url();
      if (
        u.includes("googletagmanager.com/gtm.js") ||
        u.includes("googletagmanager.com/gtag/js") ||
        u.includes("google-analytics.com/analytics.js") ||
        u.includes("googletagservices.com")
      )
        googleTagUrls.push(u);
    });

    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 30000 });

    const gcm = await page.evaluate(() => {
      const dl = Array.isArray(window.dataLayer) ? window.dataLayer : [];
      const scripts = Array.from(document.querySelectorAll("script")).map(
        (s) => s.textContent || "",
      );
      const allText = scripts.join("\n");

      const hasGtag = typeof window.gtag === "function";
      const hasDataLayer = dl.length > 0;
      const hasGtmId = /GTM-[A-Z0-9]+/.test(allText);

      const CONSENT_DEFAULT_PATTERNS = [
        "gtag('consent','default'",
        'gtag("consent","default"',
        "gtag('consent', 'default'",
        'gtag("consent", "default"',
      ];
      const CONSENT_UPDATE_PATTERNS = [
        "gtag('consent','update'",
        'gtag("consent","update"',
        "gtag('consent', 'update'",
        'gtag("consent", "update"',
      ];

      const gtagConsentDefault = CONSENT_DEFAULT_PATTERNS.some((p) =>
        allText.includes(p),
      );
      const gtagConsentUpdate = CONSENT_UPDATE_PATTERNS.some((p) =>
        allText.includes(p),
      );
      const consentDefaultInDL = dl.some(
        (e) => Array.isArray(e) && e[0] === "consent" && e[1] === "default",
      );

      const scriptEls = Array.from(document.querySelectorAll("script"));
      let consentIdx = -1,
        gtmIdx = -1;
      scriptEls.forEach((s, i) => {
        const src = s.src || "",
          text = s.textContent || "";
        if (
          (src.includes("googletagmanager.com/gtm.js") ||
            src.includes("gtag/js")) &&
          gtmIdx === -1
        )
          gtmIdx = i;
        if (
          CONSENT_DEFAULT_PATTERNS.some((p) => text.includes(p)) &&
          consentIdx === -1
        )
          consentIdx = i;
      });

      return {
        hasGtag,
        hasDataLayer,
        hasGtmId,
        gtagConsentDefault,
        gtagConsentUpdate,
        consentDefaultInDL,
        adStorage: allText.includes("ad_storage"),
        analyticsStorage: allText.includes("analytics_storage"),
        adUserData: allText.includes("ad_user_data"),
        adPersonalization: allText.includes("ad_personalization"),
        consentBeforeGtm:
          consentIdx !== -1 && gtmIdx !== -1 ? consentIdx < gtmIdx : null,
      };
    });

    const hasGoogleTag =
      googleTagUrls.length > 0 ||
      gcm.hasGtag ||
      gcm.hasGtmId ||
      gcm.hasDataLayer;
    const hasConsentDefault = gcm.gtagConsentDefault || gcm.consentDefaultInDL;

    const checks = [
      {
        id: "gtm_detected",
        label: "Google Tag Manager / gtag.js detected",
        description: "GTM or gtag.js is loaded on the page.",
        pass: hasGoogleTag,
        required: true,
      },
      {
        id: "consent_default",
        label: "Consent default configured",
        description: "gtag('consent', 'default', {...}) is called on the page.",
        pass: hasConsentDefault,
        required: true,
      },
      {
        id: "consent_before_gtm",
        label: "Consent default fires before GTM",
        description:
          "The consent default command must be placed before the GTM/gtag script tag.",
        pass:
          gcm.consentBeforeGtm === true
            ? true
            : gcm.consentBeforeGtm === false
              ? false
              : null,
        required: true,
      },
      {
        id: "ad_storage",
        label: "ad_storage parameter set",
        description: "Required GCM parameter controlling Google Ads cookies.",
        pass: gcm.adStorage,
        required: true,
      },
      {
        id: "analytics_storage",
        label: "analytics_storage parameter set",
        description:
          "Required GCM parameter controlling Google Analytics cookies.",
        pass: gcm.analyticsStorage,
        required: true,
      },
      {
        id: "ad_user_data",
        label: "ad_user_data parameter set (GCM v2)",
        description:
          "Controls sending user data to Google for advertising. Required by GCM v2.",
        pass: gcm.adUserData,
        required: true,
      },
      {
        id: "ad_personalization",
        label: "ad_personalization parameter set (GCM v2)",
        description: "Controls personalized advertising. Required by GCM v2.",
        pass: gcm.adPersonalization,
        required: true,
      },
      {
        id: "consent_update",
        label: "Consent update mechanism present",
        description:
          "gtag('consent', 'update', {...}) is called when visitors make a consent decision.",
        pass: gcm.gtagConsentUpdate,
        required: false,
      },
    ];

    const requiredChecks = checks.filter((c) => c.required);
    const requiredPassed = requiredChecks.filter((c) => c.pass === true).length;
    let status;
    if (!hasGoogleTag) status = "not_applicable";
    else if (requiredPassed === requiredChecks.length) status = "compliant";
    else if (requiredPassed > 0) status = "partial";
    else status = "non_compliant";

    res.json({
      url: targetUrl,
      scannedAt: new Date().toISOString(),
      status,
      passCount: checks.filter((c) => c.pass === true).length,
      totalChecks: checks.length,
      checks,
    });
  } catch (err) {
    console.error("[GCM Scan] Error:", err.message);
    res.status(500).json({ error: "Failed to scan for GCM compliance" });
  } finally {
    await page.close(); // keep shared browser warm
  }
});

// ─── Scan schedule endpoints ──────────────────────────────────────────────────
app.get("/api/scan-schedule/:userId", validateApiKey, async (req, res) => {
  const { userId } = req.params;
  if (!isValidUUID(userId))
    return res.status(400).json({ error: "Invalid user ID" });
  try {
    const response = await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/scan_schedules?user_id=eq.${encodeURIComponent(userId)}&select=*&limit=1`,
      { headers: serviceHeaders() },
    );
    if (!response.ok)
      return res
        .status(response.status)
        .json({ error: "Failed to fetch schedule" });
    const data = await response.json();
    res.json(data && data.length > 0 ? data[0] : null);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
});

app.post("/api/scan-schedule", validateApiKey, async (req, res) => {
  const { userId, url, intervalMonths, enabled } = req.body;
  if (!userId || !isValidUUID(userId))
    return res.status(400).json({ error: "Invalid user ID" });
  if (!url) return res.status(400).json({ error: "URL is required" });
  if (![1, 3, 6, 12].includes(Number(intervalMonths)))
    return res
      .status(400)
      .json({ error: "intervalMonths must be 1, 3, 6, or 12" });

  const now = new Date();
  const nextScanAt = new Date(now);
  nextScanAt.setMonth(nextScanAt.getMonth() + Number(intervalMonths));

  const payload = {
    user_id: userId,
    url: normalizeUrl(url),
    interval_months: Number(intervalMonths),
    enabled: enabled !== false,
    next_scan_at: nextScanAt.toISOString(),
    updated_at: now.toISOString(),
  };

  try {
    const response = await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/scan_schedules`,
      {
        method: "POST",
        headers: {
          ...serviceHeaders(),
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok)
      return res
        .status(response.status)
        .json({ error: "Failed to save schedule" });
    const data = await response.json();
    res.json(Array.isArray(data) ? data[0] : data);
  } catch (err) {
    res.status(500).json({ error: "Failed to save schedule" });
  }
});

app.delete("/api/scan-schedule/:userId", validateApiKey, async (req, res) => {
  const { userId } = req.params;
  if (!isValidUUID(userId))
    return res.status(400).json({ error: "Invalid user ID" });
  try {
    const response = await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/scan_schedules?user_id=eq.${encodeURIComponent(userId)}`,
      { method: "DELETE", headers: serviceHeaders() },
    );
    if (!response.ok)
      return res
        .status(response.status)
        .json({ error: "Failed to delete schedule" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete schedule" });
  }
});

// ─── Shared cron runner ───────────────────────────────────────────────────────
async function runDueScans() {
  const now = new Date().toISOString();
  const fetchRes = await supabaseFetch(
    `${SUPABASE_URL}/rest/v1/scan_schedules?enabled=eq.true&next_scan_at=lte.${encodeURIComponent(now)}&select=*`,
    { headers: serviceHeaders() },
  );
  if (!fetchRes.ok) throw new Error(await fetchRes.text());
  const schedules = await fetchRes.json();

  const results = [];
  for (const schedule of schedules) {
    try {
      console.log(
        `[cron] Scanning ${schedule.url} for user ${schedule.user_id}`,
      );
      const result = await performScan(schedule.url);
      const scannedData = {
        url: result.url,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        pages: Math.floor(Math.random() * 50) + 10,
        cookiesCount: result.cookiesCount,
        categories: result.categories,
      };
      await supabaseFetch(`${SUPABASE_URL}/rest/v1/user_cookie_settings`, {
        method: "POST",
        headers: { ...anonHeaders(), Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({
          user_id: schedule.user_id,
          scanned_data: scannedData,
        }),
      });
      const nextScanAt = new Date();
      nextScanAt.setMonth(nextScanAt.getMonth() + schedule.interval_months);
      await supabaseFetch(
        `${SUPABASE_URL}/rest/v1/scan_schedules?user_id=eq.${encodeURIComponent(schedule.user_id)}`,
        {
          method: "PATCH",
          headers: serviceHeaders(),
          body: JSON.stringify({
            last_scan_at: new Date().toISOString(),
            next_scan_at: nextScanAt.toISOString(),
            updated_at: new Date().toISOString(),
          }),
        },
      );
      results.push({
        userId: schedule.user_id,
        url: schedule.url,
        status: "ok",
        cookiesCount: result.cookiesCount,
        nextScanAt: nextScanAt.toISOString(),
      });
    } catch (err) {
      console.error(`[cron] Failed for user ${schedule.user_id}:`, err.message);
      results.push({
        userId: schedule.user_id,
        url: schedule.url,
        status: "error",
        error: err.message,
      });
    }
  }
  return results;
}

app.post("/api/scan-schedule/trigger", validateApiKey, async (req, res) => {
  try {
    const results = await runDueScans();
    res.json({ triggered: results.length, results });
  } catch (err) {
    res.status(500).json({ error: "Trigger failed" });
  }
});

app.post(
  "/api/scan-schedule/:userId/run-now",
  validateApiKey,
  async (req, res) => {
    const { userId } = req.params;
    if (!isValidUUID(userId))
      return res.status(400).json({ error: "Invalid user ID" });
    await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/scan_schedules?user_id=eq.${encodeURIComponent(userId)}`,
      {
        method: "PATCH",
        headers: serviceHeaders(),
        body: JSON.stringify({ next_scan_at: new Date().toISOString() }),
      },
    );
    try {
      const results = await runDueScans();
      res.json(
        results.find((r) => r.userId === userId) || {
          status: "no schedule found",
        },
      );
    } catch (err) {
      res.status(500).json({ error: "Run-now failed" });
    }
  },
);

// ─── Cron jobs ────────────────────────────────────────────────────────────────
cron.schedule("0 2 * * *", async () => {
  console.log("[cron] Checking for due scheduled scans...");
  try {
    const results = await runDueScans();
    console.log(`[cron] Completed ${results.length} scan(s)`);
  } catch (err) {
    console.error("[cron] Unexpected error:", err.message);
  }
});

cron.schedule("30 2 * * *", async () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 180);
  const cutoffIso = cutoff.toISOString();
  console.log(`[cron] Purging consent records older than ${cutoffIso}...`);
  try {
    const response = await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/visitor_consent?created_at=lt.${encodeURIComponent(cutoffIso)}`,
      {
        method: "DELETE",
        headers: { ...serviceHeaders(), Prefer: "return=minimal" },
      },
    );
    if (!response.ok) {
      console.error("[cron] Consent purge failed:", await response.text());
    } else {
      console.log("[cron] Consent purge complete.");
    }
  } catch (err) {
    console.error("[cron] Consent purge error:", err.message);
  }
});

// ─── POST /api/delete-account ─────────────────────────────────────────────────
// Verifies the caller's JWT, then permanently deletes their Supabase auth user.
// Supabase ON DELETE CASCADE removes all related rows automatically.
app.post("/api/delete-account", deleteAccountLimiter, async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token)
    return res.status(401).json({ error: "Authorization token required." });

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return res
      .status(503)
      .json({ error: "Account deletion is not configured on this server." });
  }

  // Verify token and get user ID
  let userId;
  try {
    const verifyRes = await supabaseFetch(
      `${SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
        },
      },
      5000,
    );
    if (!verifyRes.ok)
      return res.status(401).json({ error: "Invalid or expired token." });
    const user = await verifyRes.json();
    userId = user.id;
  } catch (err) {
    console.error("[delete-account] Token verification error:", err.message);
    return res.status(500).json({ error: "Could not verify authentication." });
  }

  // Delete user via admin API (service role required)
  try {
    const deleteRes = await supabaseFetch(
      `${SUPABASE_URL}/auth/v1/admin/users/${userId}`,
      { method: "DELETE", headers: serviceHeaders() },
      10000,
    );
    if (!deleteRes.ok) {
      const errBody = await deleteRes.text();
      console.error("[delete-account] Supabase delete error:", errBody);
      return res.status(500).json({ error: "Account deletion failed." });
    }
    console.log(`[delete-account] Deleted user ${userId}`);
    res.json({ success: true });
  } catch (err) {
    console.error("[delete-account] Error:", err.message);
    res.status(500).json({ error: "Account deletion failed." });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Scanner API running on http://localhost:${PORT}`);
});
