const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const puppeteer = require("puppeteer");
const cron = require("node-cron");

require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const {
  categorizeCookie,
  enrichCookieDescription,
  normalizeUrl,
} = require("./utils");

// ─── Credentials from environment (never hardcoded) ───────────────────────────
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY || "";

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

// Service-role fetch helper — bypasses RLS, server-side only, never exposed to clients
function serviceHeaders() {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };
}

// ─── UUID validation helper ───────────────────────────────────────────────────
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(id) {
  return UUID_RE.test(id);
}

// ─── Supabase fetch helper ────────────────────────────────────────────────────
async function fetchPublishedPolicy(table, userId) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?user_id=eq.${encodeURIComponent(userId)}&status=eq.published&select=id,title,status,generated,updated_at&order=updated_at.desc&limit=1`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  clearTimeout(timeoutId);
  if (!response.ok) {
    const text = await response.text();
    const err = new Error(text);
    err.status = response.status;
    throw err;
  }
  const data = await response.json();
  return data && data.length > 0 ? data[0] : null;
}

// ─── API key validation middleware ────────────────────────────────────────────
async function validateApiKey(req, res, next) {
  const key = req.headers["x-api-key"];
  if (!key) {
    return res.status(401).json({
      error: "API key required. Add the X-API-Key header to your request.",
    });
  }
  const apiKeyRe = /^utk_[0-9a-f]{32}$/;
  if (!apiKeyRe.test(key)) {
    return res.status(401).json({ error: "Invalid API key format." });
  }
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/api_keys?api_key=eq.${encodeURIComponent(key)}&select=user_id&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    );
    const data = await response.json();
    if (!data || data.length === 0) {
      return res.status(401).json({ error: "Invalid API key." });
    }
    const { userId } = req.params;
    if (userId && data[0].user_id !== userId) {
      return res.status(403).json({
        error: "API key does not belong to this user ID.",
      });
    }
    req.apiKeyUserId = data[0].user_id;
    next();
  } catch (err) {
    console.error("[validateApiKey] Error:", err.message);
    res.status(500).json({ error: "Could not validate API key." });
  }
}

// ─── Rate limiting ─────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const scanLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Scan rate limit exceeded. Please wait before scanning again.",
  },
});

const app = express();
app.use(cors({
  origin: [
    'https://uterms.io',
    'https://www.uterms.io',
    /\.uterms\.io$/,
  ],
  credentials: true,
}));
app.use(express.json());
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

// ─── Shared scan function (used by /api/scan and the scheduled cron job) ──────
async function performScan(url) {
  const targetUrl = normalizeUrl(url);
  console.log(`[scan] Scanning URL: ${targetUrl}`);

  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Set a common user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    // Go to URL and wait until network is mostly idle, with extended timeout
    try {
      await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 60000 });
    } catch (timeoutErr) {
      // If networkidle2 times out, try with a faster condition
      console.warn(
        `networkidle2 timeout for ${targetUrl}, retrying with domcontentloaded`,
      );
      await page.goto(targetUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
    }

    // Auto-scroll to trigger lazy-loaded scripts (cap at 10 s to avoid infinite-scroll hangs)
    await page.evaluate(() => {
      return new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const deadline = Date.now() + 10_000;
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
      });
    });

    // Try clicking common accept buttons
    try {
      await page.evaluate(() => {
        const buttons = Array.from(
          document.querySelectorAll('button, a, div[role="button"]'),
        );
        const acceptBtn = buttons.find((b) => {
          const text = (b.textContent || "").toLowerCase().trim();
          return (
            text === "accept" ||
            text === "accept all" ||
            text === "allow all" ||
            text === "agree" ||
            text === "accept all cookies" ||
            text === "ok"
          );
        });
        if (acceptBtn) {
          acceptBtn.click();
        }
      });
      // Wait for scripts to execute and drop cookies
      await new Promise((resolve) => setTimeout(resolve, 4000));
    } catch (e) {
      console.error("Error clicking consent banner:", e);
    }

    // Use CDP session to get ALL cookies (including HttpOnly and third-party)
    const client = await page.createCDPSession();
    const { cookies: cdpCookies } = await client.send("Network.getAllCookies");
    let cookies = cdpCookies;

    const storageKeys = await page.evaluate(() => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push({ name: localStorage.key(i), type: "Local Storage" });
      }
      for (let i = 0; i < sessionStorage.length; i++) {
        keys.push({ name: sessionStorage.key(i), type: "Session Storage" });
      }
      return keys;
    });

    // Map storage items into our cookies format
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

    // Deep clone the templates
    const categories = JSON.parse(JSON.stringify(CATEGORY_TEMPLATES));

    // Group cookies by category and provider (domain)
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
    if (browser) await browser.close();
  }
}

app.post("/api/scan", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });
  try {
    const result = await performScan(url);
    res.json(result);
  } catch (err) {
    console.error("Scan Error:", err);
    res
      .status(500)
      .json({ error: "Failed to scan website", details: err.message });
  }
});

app.get("/api/banner/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    return res.status(400).json({
      error:
        "Invalid user ID. Use a UUID, e.g. /api/banner/123e4567-e89b-12d3-a456-426614174000",
    });
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/user_cookie_settings?user_id=eq.${id}&select=banner_config,scanned_data`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Profile": "public",
        },
      },
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch from DB" });
    }

    const data = await response.json();
    if (data && data.length > 0) {
      res.json(data[0]);
    } else {
      res.status(404).json({ error: "Settings not found for user" });
    }
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

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
    const url =
      `${SUPABASE_URL}/rest/v1/visitor_consent` +
      `?user_id=eq.${encodeURIComponent(userId)}` +
      `&select=id,visitor_id,consent_data,url,created_at` +
      `&order=created_at.desc` +
      `&limit=${limit}&offset=${offset}${from}`;

    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "count=exact",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Consent GET] Error:", errorText);
      return res
        .status(response.status)
        .json({ error: "Failed to fetch consent records", details: errorText });
    }

    const data = await response.json();
    const totalCount = parseInt(
      response.headers.get("content-range")?.split("/")[1] || "0",
    );

    res.json({
      records: data,
      total: totalCount,
      limit,
      offset,
    });
  } catch (err) {
    console.error("[Consent GET] Error:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch consent records", details: err.message });
  }
});

app.post("/api/consent", async (req, res) => {
  const { user_id, visitor_id, consent_data, url } = req.body;
  if (!user_id || !visitor_id || !consent_data) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const payload = {
      user_id,
      visitor_id,
      consent_data,
      url: url || req.headers.referer || req.get("origin") || "",
      ip_address: req.ip,
      user_agent: req.get("user-agent"),
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/visitor_consent`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Supabase Insert Error:", errorText);
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

app.get("/api/policy/:userId", validateApiKey, async (req, res) => {
  const { userId } = req.params;
  if (!isValidUUID(userId))
    return res.status(400).json({ error: "Invalid user ID" });

  try {
    const url = `${SUPABASE_URL}/rest/v1/privacy_policies?user_id=eq.${encodeURIComponent(userId)}&status=eq.published&select=id,title,generated,updated_at&order=updated_at.desc&limit=1`;
    console.log("[Privacy Policy API] Fetching from URL:", url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    clearTimeout(timeoutId);

    console.log("[Privacy Policy API] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Privacy Policy API] Error response:", errorText);
      return res
        .status(response.status)
        .json({ error: "Failed to fetch policy", details: errorText });
    }

    const data = await response.json();
    console.log("[Privacy Policy API] Response data length:", data?.length);

    if (data && data.length > 0) {
      res.json(data[0]);
    } else {
      console.warn("[Privacy Policy API] No data found for userId:", userId);
      res
        .status(404)
        .json({ error: "No published policy found for this user" });
    }
  } catch (err) {
    console.error("Policy API Error:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch policy", details: err.message });
  }
});

app.post("/api/analyze-policy", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const targetUrl = normalizeUrl(url);
  console.log(`Analyzing policy for: ${targetUrl}`);

  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );
    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 30000 });

    // Extract homepage metadata, content, and legal registration data
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

      // Grab footer + last portion of body (legal text often lives here)
      const footerEl = document.querySelector(
        "footer, .footer, #footer, [class*='footer'], [id*='footer']",
      );
      const footer = (footerEl?.innerText || "").slice(0, 3000);
      const bodyTail = (document.body?.innerText || "").slice(-10000);
      const corpus = footer + "\n" + bodyTail;

      // ── Legal registration extraction ──────────────────────────────────────
      // Company number: matches "Company No. 12345678", "registered under
      // reference number 12570147", "registration number SC123456", etc.
      const coNoMatch = corpus.match(
        /(?:company\s*(?:no|number|reg(?:istration)?)[\s.:#]*|(?:reference|registration)\s+number\s+)([A-Z0-9]{6,12})/i,
      );
      const companyNo = coNoMatch ? coNoMatch[1].trim() : "";

      // Registered address: matches "registered office address: ...",
      // "registered offices are located at ...", "registered office at ..."
      const addrMatch = corpus.match(
        /registered\s+offices?\s+(?:address[:\s]+|(?:is\s+)?(?:are\s+)?located\s+at\s+|at\s+)([^.\n]{10,200})/i,
      );
      const registeredAddress = addrMatch ? addrMatch[1].trim() : "";

      // VAT number
      const vatMatch = corpus.match(
        /vat\s*(?:no|number|reg(?:istration)?)[\s.:]*([A-Z]{0,2}[0-9]{9,12})/i,
      );
      const vatNo = vatMatch ? vatMatch[1].trim() : "";

      // Country from "registered in England & Wales / Scotland / ..."
      let detectedCountry = "";
      const regInMatch = corpus.match(
        /registered\s+in\s+(England\s*(?:&|and)\s*Wales|Scotland|Northern\s+Ireland|Wales|United\s+Kingdom|United\s+States|Canada|Australia|Germany|France|Netherlands|Singapore|India|Malaysia)/i,
      );
      if (regInMatch) detectedCountry = regInMatch[1].trim();

      const bodyText = (document.body?.innerText || "").slice(0, 5000);
      return {
        title,
        description,
        ogSiteName,
        footer,
        bodyText,
        companyNo,
        registeredAddress,
        vatNo,
        detectedCountry,
      };
    });

    // Try to find and visit the privacy policy page
    let privacyPageContent = "";
    try {
      const privacyLink = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll("a[href]"));
        const found = links.find((l) => {
          const text = (l.textContent || "").toLowerCase();
          const href = (l.getAttribute("href") || "").toLowerCase();
          return text.includes("privacy") || href.includes("privacy");
        });
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
      console.log("Could not fetch privacy page:", e.message);
    }

    // ── Local Analysis (No AI) ────────────────────────────────────────────────
    // Infer Company Name
    let companyName = homepageContent.ogSiteName;
    if (!companyName) {
      // Try to get from title (e.g. "My Company - Home")
      const titleParts = homepageContent.title.split(/[-|]/);
      if (titleParts.length > 0) {
        companyName = titleParts[0].trim();
      } else {
        // Fallback to domain
        try {
          const u = new URL(targetUrl);
          companyName = u.hostname.replace("www.", "");
          companyName =
            companyName.charAt(0).toUpperCase() + companyName.slice(1);
        } catch (e) {
          companyName = "My Company";
        }
      }
    }

    // Attempt to find email
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const combinedText = (
      homepageContent.footer +
      " " +
      privacyPageContent
    ).slice(0, 10000);
    const emails = combinedText.match(emailRegex) || [];
    // Filter out common false positives if necessary, or just take first unique
    const uniqueEmails = [...new Set(emails.map((e) => e.toLowerCase()))];
    // Prefer info@, contact@, privacy@, support@
    const privacyEmail =
      uniqueEmails.find((e) => /privacy|legal|compliance|dpo/i.test(e)) ||
      uniqueEmails.find((e) => /info|contact|support|hello/i.test(e)) ||
      uniqueEmails[0] ||
      "";

    // Default structure without AI
    const analysis = {
      companyName: companyName,
      websiteUrl: targetUrl,
      country: homepageContent.detectedCountry || "United Kingdom", // heuristic default? or empty
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
      privacyEmail: privacyEmail,
      scrapedDetails: {
        // Keep these for debug/display if frontend wants them
        companyNo: homepageContent.companyNo,
        vatNo: homepageContent.vatNo,
        registeredAddress: homepageContent.registeredAddress,
      },
    };

    res.json({ success: true, analysis });
  } catch (err) {
    console.error("Analyze Policy Error:", err);
    res
      .status(500)
      .json({ error: "Failed to analyze website", details: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.get("/uterms-policy-embed.js", async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res
      .status(400)
      .type("text/javascript")
      .send('console.error("User ID required");');
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/privacy_policies?user_id=eq.${encodeURIComponent(id)}&select=id,title,generated,updated_at&order=updated_at.desc&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    );

    if (!response.ok) {
      return res
        .type("text/javascript")
        .send('console.error("Failed to fetch policy");');
    }

    const data = await response.json();
    if (data && data.length > 0) {
      if (data[0].generated) {
        const policyHtml = data[0].generated;

        // Serve as JavaScript that injects the HTML into the DOM
        const script = `
(function() {
  const container = document.getElementById('uterms-policy');
  if (!container) {
    console.error('uterms-policy container not found');
    return;
  }
  container.innerHTML = ${JSON.stringify(policyHtml)};
  
  // Style the policy
  const style = document.createElement('style');
  style.textContent = \`
    #uterms-policy {
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    #uterms-policy h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    #uterms-policy h2 {
      font-size: 1.5rem;
      margin: 1.5rem 0 1rem 0;
    }
    #uterms-policy section {
      margin-bottom: 2rem;
    }
    #uterms-policy table {
      width: 100%;
      border-collapse: collapse;
    }
    #uterms-policy th, #uterms-policy td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    #uterms-policy th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    #uterms-policy ul {
      margin-left: 20px;
    }
    #uterms-policy li {
      margin-bottom: 0.5rem;
    }
  \`;
  document.head.appendChild(style);
})();
      `;

        res.type("text/javascript").send(script);
      } else {
        res
          .type("text/javascript")
          .send(
            'console.error("Policy found but not yet generated. Please generate the policy first.");',
          );
      }
    } else {
      res
        .type("text/javascript")
        .send(
          'console.error("No policy found for this user. Please create and generate a privacy policy first.");',
        );
    }
  } catch (err) {
    console.error("Policy Embed Error:", err);
    res.type("text/javascript").send('console.error("Failed to load policy");');
  }
});

app.get("/api/cookie-policy/:userId", validateApiKey, async (req, res) => {
  const { userId } = req.params;
  if (!isValidUUID(userId))
    return res.status(400).json({ error: "Invalid user ID" });

  try {
    const url = `${SUPABASE_URL}/rest/v1/cookie_policies?user_id=eq.${encodeURIComponent(userId)}&status=eq.published&select=id,title,generated,updated_at&order=updated_at.desc&limit=1`;
    console.log("[Cookie Policy API] Fetching from URL:", url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    clearTimeout(timeoutId);

    console.log("[Cookie Policy API] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Cookie Policy API] Error response:", errorText);
      return res
        .status(response.status)
        .json({ error: "Failed to fetch cookie policy", details: errorText });
    }

    const data = await response.json();
    console.log("[Cookie Policy API] Response data length:", data?.length);

    if (data && data.length > 0) {
      res.json(data[0]);
    } else {
      console.warn("[Cookie Policy API] No data found for userId:", userId);
      res
        .status(404)
        .json({ error: "No published cookie policy found for this user" });
    }
  } catch (err) {
    console.error("Cookie Policy API Error:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch cookie policy", details: err.message });
  }
});

app.get("/uterms-cookie-embed.js", async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res
      .status(400)
      .type("text/javascript")
      .send('console.error("User ID required");');
  }

  // Serve the static embed script from public/
  const path = require("path");
  res
    .type("text/javascript")
    .sendFile(path.resolve(__dirname, "../public/uterms-cookie-embed.js"));
});

app.get("/api/tos/:userId", validateApiKey, async (req, res) => {
  const { userId } = req.params;
  if (!isValidUUID(userId))
    return res.status(400).json({ error: "Invalid user ID" });

  try {
    const url = `${SUPABASE_URL}/rest/v1/terms_of_service?user_id=eq.${encodeURIComponent(userId)}&status=eq.published&select=id,title,generated,updated_at&order=updated_at.desc&limit=1`;
    console.log("[Terms of Service API] Fetching from URL:", url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    clearTimeout(timeoutId);

    console.log("[Terms of Service API] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Terms of Service API] Error response:", errorText);
      return res.status(response.status).json({
        error: "Failed to fetch Terms of Service",
        details: errorText,
      });
    }

    const data = await response.json();
    console.log("[Terms of Service API] Response data length:", data?.length);

    if (data && data.length > 0) {
      res.json(data[0]);
    } else {
      console.warn("[Terms of Service API] No data found for userId:", userId);
      res
        .status(404)
        .json({ error: "No published Terms of Service found for this user" });
    }
  } catch (err) {
    console.error("ToS API Error:", err);
    res.status(500).json({
      error: "Failed to fetch Terms of Service",
      details: err.message,
    });
  }
});

app.get("/uterms-tos-embed.js", (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res
      .status(400)
      .type("text/javascript")
      .send('console.error("User ID required");');
  }

  const path = require("path");
  res
    .type("text/javascript")
    .sendFile(path.resolve(__dirname, "../public/uterms-tos-embed.js"));
});

app.get("/api/eula/:userId", validateApiKey, async (req, res) => {
  const { userId } = req.params;
  if (!isValidUUID(userId))
    return res.status(400).json({ error: "Invalid user ID" });

  try {
    const url = `${SUPABASE_URL}/rest/v1/eula?user_id=eq.${encodeURIComponent(userId)}&status=eq.published&select=id,title,generated,updated_at&order=updated_at.desc&limit=1`;
    console.log("[EULA API] Fetching from URL:", url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    clearTimeout(timeoutId);

    console.log("[EULA API] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[EULA API] Error response:", errorText);
      return res
        .status(response.status)
        .json({ error: "Failed to fetch EULA", details: errorText });
    }

    const data = await response.json();
    console.log("[EULA API] Response data length:", data?.length);

    if (data && data.length > 0) {
      res.json(data[0]);
    } else {
      console.warn("[EULA API] No data found for userId:", userId);
      res.status(404).json({ error: "No published EULA found for this user" });
    }
  } catch (err) {
    console.error("EULA API Error:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch EULA", details: err.message });
  }
});

app.get("/uterms-eula-embed.js", (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res
      .status(400)
      .type("text/javascript")
      .send('console.error("User ID required");');
  }

  const path = require("path");
  res
    .type("text/javascript")
    .sendFile(path.resolve(__dirname, "../public/uterms-eula-embed.js"));
});

app.get("/api/return-policy/:userId", validateApiKey, async (req, res) => {
  const { userId } = req.params;
  if (!isValidUUID(userId))
    return res.status(400).json({ error: "Invalid user ID" });

  try {
    const url = `${SUPABASE_URL}/rest/v1/return_policy?user_id=eq.${encodeURIComponent(userId)}&status=eq.published&select=id,title,generated,updated_at&order=updated_at.desc&limit=1`;
    console.log("[Return Policy API] Fetching from URL:", url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    clearTimeout(timeoutId);

    console.log("[Return Policy API] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Return Policy API] Error response:", errorText);
      return res
        .status(response.status)
        .json({ error: "Failed to fetch Return Policy", details: errorText });
    }

    const data = await response.json();
    console.log("[Return Policy API] Response data length:", data?.length);

    if (data && data.length > 0) {
      res.json(data[0]);
    } else {
      console.warn("[Return Policy API] No data found for userId:", userId);
      res
        .status(404)
        .json({ error: "No published Return Policy found for this user" });
    }
  } catch (err) {
    console.error("Return Policy API Error:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch Return Policy", details: err.message });
  }
});

app.get("/uterms-return-policy-embed.js", (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res
      .status(400)
      .type("text/javascript")
      .send('console.error("User ID required");');
  }

  const path = require("path");
  res
    .type("text/javascript")
    .sendFile(
      path.resolve(__dirname, "../public/uterms-return-policy-embed.js"),
    );
});

app.get("/api/disclaimer/:userId", validateApiKey, async (req, res) => {
  const { userId } = req.params;
  if (!isValidUUID(userId))
    return res.status(400).json({ error: "Invalid user ID" });

  try {
    const url = `${SUPABASE_URL}/rest/v1/disclaimer?user_id=eq.${encodeURIComponent(userId)}&status=eq.published&select=id,title,generated,updated_at&order=updated_at.desc&limit=1`;
    console.log("[Disclaimer API] Fetching from URL:", url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    clearTimeout(timeoutId);

    console.log("[Disclaimer API] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Disclaimer API] Error response:", errorText);
      return res
        .status(response.status)
        .json({ error: "Failed to fetch Disclaimer", details: errorText });
    }

    const data = await response.json();
    console.log("[Disclaimer API] Response data length:", data?.length);

    if (data && data.length > 0) {
      res.json(data[0]);
    } else {
      console.warn("[Disclaimer API] No data found for userId:", userId);
      res
        .status(404)
        .json({ error: "No published Disclaimer found for this user" });
    }
  } catch (err) {
    console.error("Disclaimer API Error:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch Disclaimer", details: err.message });
  }
});

app.get("/uterms-disclaimer-embed.js", (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res
      .status(400)
      .type("text/javascript")
      .send('console.error("User ID required");');
  }
  const path = require("path");
  res
    .type("text/javascript")
    .sendFile(path.resolve(__dirname, "../public/uterms-disclaimer-embed.js"));
});

app.get("/api/shipping-policy/:userId", validateApiKey, async (req, res) => {
  const { userId } = req.params;
  if (!isValidUUID(userId))
    return res.status(400).json({ error: "Invalid user ID" });

  try {
    const url = `${SUPABASE_URL}/rest/v1/shipping_policy?user_id=eq.${encodeURIComponent(userId)}&status=eq.published&select=id,title,generated,updated_at&order=updated_at.desc&limit=1`;
    console.log("[Shipping Policy API] Fetching from URL:", url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    clearTimeout(timeoutId);

    console.log("[Shipping Policy API] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Shipping Policy API] Error response:", errorText);
      return res
        .status(response.status)
        .json({ error: "Failed to fetch Shipping Policy", details: errorText });
    }

    const data = await response.json();
    console.log("[Shipping Policy API] Response data length:", data?.length);

    if (data && data.length > 0) {
      res.json(data[0]);
    } else {
      console.warn("[Shipping Policy API] No data found for userId:", userId);
      res
        .status(404)
        .json({ error: "No published Shipping Policy found for this user" });
    }
  } catch (err) {
    console.error("Shipping Policy API Error:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch Shipping Policy", details: err.message });
  }
});

app.get("/uterms-shipping-embed.js", (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res
      .status(400)
      .type("text/javascript")
      .send('console.error("User ID required");');
  }
  const path = require("path");
  res
    .type("text/javascript")
    .sendFile(path.resolve(__dirname, "../public/uterms-shipping-embed.js"));
});

app.get("/api/aup/:userId", validateApiKey, async (req, res) => {
  const { userId } = req.params;
  if (!isValidUUID(userId))
    return res.status(400).json({ error: "Invalid user ID" });

  try {
    const url = `${SUPABASE_URL}/rest/v1/acceptable_use_policy?user_id=eq.${encodeURIComponent(userId)}&status=eq.published&select=id,title,generated,updated_at&order=updated_at.desc&limit=1`;
    console.log("[AUP API] Fetching from URL:", url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    clearTimeout(timeoutId);

    console.log("[AUP API] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AUP API] Error response:", errorText);
      return res.status(response.status).json({
        error: "Failed to fetch Acceptable Use Policy",
        details: errorText,
      });
    }

    const data = await response.json();
    console.log("[AUP API] Response data length:", data?.length);

    if (data && data.length > 0) {
      res.json(data[0]);
    } else {
      console.warn("[AUP API] No data found for userId:", userId);
      res.status(404).json({
        error: "No published Acceptable Use Policy found for this user",
      });
    }
  } catch (err) {
    console.error("AUP API Error:", err);
    res.status(500).json({
      error: "Failed to fetch Acceptable Use Policy",
      details: err.message,
    });
  }
});

app.get("/uterms-aup-embed.js", (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res
      .status(400)
      .type("text/javascript")
      .send('console.error("User ID required");');
  }
  const path = require("path");
  res
    .type("text/javascript")
    .sendFile(path.resolve(__dirname, "../public/uterms-aup-embed.js"));
});

app.get("/api/impressum/:userId", validateApiKey, async (req, res) => {
  const { userId } = req.params;
  if (!isValidUUID(userId))
    return res.status(400).json({ error: "Invalid user ID" });

  try {
    const url = `${SUPABASE_URL}/rest/v1/impressum?user_id=eq.${encodeURIComponent(userId)}&status=eq.published&select=id,title,generated,updated_at&order=updated_at.desc&limit=1`;
    console.log("[Impressum API] Fetching from URL:", url);

    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    console.log("[Impressum API] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Impressum API] Error response:", errorText);
      return res
        .status(response.status)
        .json({ error: "Failed to fetch Impressum", details: errorText });
    }

    const data = await response.json();
    console.log("[Impressum API] Response data length:", data?.length);

    if (data && data.length > 0) {
      res.json(data[0]);
    } else {
      console.warn("[Impressum API] No data found for userId:", userId);
      res
        .status(404)
        .json({ error: "No published Impressum found for this user" });
    }
  } catch (err) {
    console.error("Impressum API Error:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch Impressum", details: err.message });
  }
});

app.get("/uterms-impressum-embed.js", (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res
      .status(400)
      .type("text/javascript")
      .send('console.error("User ID required");');
  }
  const path = require("path");
  res
    .type("text/javascript")
    .sendFile(path.resolve(__dirname, "../public/uterms-impressum-embed.js"));
});

app.get("/api/accessibility/:userId", validateApiKey, async (req, res) => {
  const { userId } = req.params;
  if (!isValidUUID(userId))
    return res.status(400).json({ error: "Invalid user ID" });
  console.log("[Accessibility API] Fetching for userId:", userId);

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/accessibility_statement?user_id=eq.${encodeURIComponent(userId)}&status=eq.published&order=updated_at.desc&limit=1&select=id,title,status,generated,updated_at`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    );

    console.log("[Accessibility API] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Accessibility API] Error response:", errorText);
      return res.status(response.status).json({
        error: "Failed to fetch Accessibility Statement",
        details: errorText,
      });
    }

    const data = await response.json();
    console.log("[Accessibility API] Response data length:", data?.length);

    if (data && data.length > 0) {
      res.json(data[0]);
    } else {
      console.warn("[Accessibility API] No data found for userId:", userId);
      res.status(404).json({
        error: "No published Accessibility Statement found for this user",
      });
    }
  } catch (err) {
    console.error("Accessibility API Error:", err);
    res.status(500).json({
      error: "Failed to fetch Accessibility Statement",
      details: err.message,
    });
  }
});

app.get("/uterms-accessibility-embed.js", (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res
      .status(400)
      .type("text/javascript")
      .send('console.error("User ID required");');
  }
  const path = require("path");
  res
    .type("text/javascript")
    .sendFile(
      path.resolve(__dirname, "../public/uterms-accessibility-embed.js"),
    );
});

// ─── Public embed API routes (no auth — used by embed scripts on third-party sites) ──
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

EMBED_POLICY_ROUTES.forEach(({ path, table }) => {
  app.get(path, async (req, res) => {
    const { userId } = req.params;
    if (!isValidUUID(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    try {
      const policy = await fetchPublishedPolicy(table, userId);
      if (!policy) {
        return res
          .status(404)
          .json({ error: "No published document found for this user" });
      }
      res.json(policy);
    } catch (err) {
      console.error(`[embed ${path}] Error:`, err.message);
      res
        .status(err.status || 500)
        .json({ error: err.message || "Failed to fetch document" });
    }
  });
});

// ─── GCM Compliance Scan ─────────────────────────────────────────────────────
app.post("/api/gcm-scan", scanLimiter, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const targetUrl = normalizeUrl(url);
  console.log(`[GCM Scan] Scanning: ${targetUrl}`);

  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    // Track Google Tag network requests
    const googleTagUrls = [];
    page.on("request", (request) => {
      const u = request.url();
      if (
        u.includes("googletagmanager.com/gtm.js") ||
        u.includes("googletagmanager.com/gtag/js") ||
        u.includes("google-analytics.com/analytics.js") ||
        u.includes("googletagservices.com")
      ) {
        googleTagUrls.push(u);
      }
    });

    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 30000 });

    // Inspect page scripts and dataLayer for GCM signals
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

      const consentDefaultInDL = dl.some((e) => {
        if (Array.isArray(e)) return e[0] === "consent" && e[1] === "default";
        return false;
      });

      // Check ordering: does consent default appear before the GTM script element?
      const scriptEls = Array.from(document.querySelectorAll("script"));
      let consentIdx = -1;
      let gtmIdx = -1;
      scriptEls.forEach((s, i) => {
        const src = s.src || "";
        const text = s.textContent || "";
        if (
          (src.includes("googletagmanager.com/gtm.js") ||
            src.includes("gtag/js")) &&
          gtmIdx === -1
        ) {
          gtmIdx = i;
        }
        if (
          CONSENT_DEFAULT_PATTERNS.some((p) => text.includes(p)) &&
          consentIdx === -1
        ) {
          consentIdx = i;
        }
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
    if (!hasGoogleTag) {
      status = "not_applicable";
    } else if (requiredPassed === requiredChecks.length) {
      status = "compliant";
    } else if (requiredPassed > 0) {
      status = "partial";
    } else {
      status = "non_compliant";
    }

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
    res.status(500).json({
      error: "Failed to scan for GCM compliance",
      details: err.message,
    });
  } finally {
    if (browser) await browser.close();
  }
});

// ─── Scan Schedule endpoints ──────────────────────────────────────────────────

// GET /api/scan-schedule/:userId — fetch current schedule for a user
app.get("/api/scan-schedule/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!isValidUUID(userId))
    return res.status(400).json({ error: "Invalid user ID" });

  try {
    const response = await fetch(
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
    res
      .status(500)
      .json({ error: "Failed to fetch schedule", details: err.message });
  }
});

// POST /api/scan-schedule — create or update a schedule
app.post("/api/scan-schedule", async (req, res) => {
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
    const response = await fetch(`${SUPABASE_URL}/rest/v1/scan_schedules`, {
      method: "POST",
      headers: {
        ...serviceHeaders(),
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const text = await response.text();
      return res
        .status(response.status)
        .json({ error: "Failed to save schedule", details: text });
    }
    const data = await response.json();
    res.json(Array.isArray(data) ? data[0] : data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to save schedule", details: err.message });
  }
});

// DELETE /api/scan-schedule/:userId — remove a schedule
app.delete("/api/scan-schedule/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!isValidUUID(userId))
    return res.status(400).json({ error: "Invalid user ID" });

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/scan_schedules?user_id=eq.${encodeURIComponent(userId)}`,
      {
        method: "DELETE",
        headers: serviceHeaders(),
      },
    );
    if (!response.ok)
      return res
        .status(response.status)
        .json({ error: "Failed to delete schedule" });
    res.json({ success: true });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete schedule", details: err.message });
  }
});

// ─── Shared cron runner (called by cron and the test endpoint) ────────────────
async function runDueScans() {
  const now = new Date().toISOString();
  const fetchRes = await fetch(
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
      await fetch(`${SUPABASE_URL}/rest/v1/user_cookie_settings`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          user_id: schedule.user_id,
          scanned_data: scannedData,
        }),
      });
      const nextScanAt = new Date();
      nextScanAt.setMonth(nextScanAt.getMonth() + schedule.interval_months);
      await fetch(
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

// POST /api/scan-schedule/trigger — manually run all due scans (for testing)
app.post("/api/scan-schedule/trigger", async (req, res) => {
  console.log("[trigger] Manual scan trigger called");
  try {
    const results = await runDueScans();
    res.json({ triggered: results.length, results });
  } catch (err) {
    res.status(500).json({ error: "Trigger failed", details: err.message });
  }
});

// POST /api/scan-schedule/:userId/run-now — force-run scan for one user immediately
app.post("/api/scan-schedule/:userId/run-now", async (req, res) => {
  const { userId } = req.params;
  if (!isValidUUID(userId))
    return res.status(400).json({ error: "Invalid user ID" });

  // Temporarily set next_scan_at to now so runDueScans picks it up
  await fetch(
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
    res.status(500).json({ error: "Run-now failed", details: err.message });
  }
});

// ─── Daily cron job — runs due scheduled scans at 2 AM ────────────────────────
cron.schedule("0 2 * * *", async () => {
  console.log("[cron] Checking for due scheduled scans...");
  try {
    const results = await runDueScans();
    console.log(`[cron] Completed ${results.length} scan(s)`);
  } catch (err) {
    console.error("[cron] Unexpected error:", err.message);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Scanner API running on http://localhost:${PORT}`);
});
