const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");

require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const {
  categorizeCookie,
  enrichCookieDescription,
  normalizeUrl,
} = require("./utils");

const app = express();
app.use(cors());
app.use(express.json());

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

app.post("/api/scan", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  // Basic URL validation
  const targetUrl = normalizeUrl(url);

  console.log(`Scanning URL: ${targetUrl}`);

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

    res.json({
      url: targetUrl,
      cookiesCount: cookies.length,
      categories,
    });
  } catch (err) {
    console.error("Scan Error:", err);
    res
      .status(500)
      .json({ error: "Failed to scan website", details: err.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.get("/api/banner/:id", async (req, res) => {
  const { id } = req.params;
  const SUPABASE_URL = "https://oyfjwneybhlybfmbgiln.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95Zmp3bmV5YmhseWJmbWJnaWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzk3NTYsImV4cCI6MjA4OTYxNTc1Nn0.mPTYIf5q3OnWK88elyPqI_tfX4EJ4h91SmEuRN3AK44";

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

app.post("/api/consent", async (req, res) => {
  const { user_id, visitor_id, consent_data, url } = req.body;
  if (!user_id || !visitor_id || !consent_data) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const SUPABASE_URL = "https://oyfjwneybhlybfmbgiln.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95Zmp3bmV5YmhseWJmbWJnaWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzk3NTYsImV4cCI6MjA4OTYxNTc1Nn0.mPTYIf5q3OnWK88elyPqI_tfX4EJ4h91SmEuRN3AK44";

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

app.get("/api/policy/:userId", async (req, res) => {
  const { userId } = req.params;
  const SUPABASE_URL = "https://oyfjwneybhlybfmbgiln.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95Zmp3bmV5YmhseWJmbWJnaWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzk3NTYsImV4cCI6MjA4OTYxNTc1Nn0.mPTYIf5q3OnWK88elyPqI_tfX4EJ4h91SmEuRN3AK44";

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

  const SUPABASE_URL = "https://oyfjwneybhlybfmbgiln.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95Zmp3bmV5YmhseWJmbWJnaWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzk3NTYsImV4cCI6MjA4OTYxNTc1Nn0.mPTYIf5q3OnWK88elyPqI_tfX4EJ4h91SmEuRN3AK44";

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

app.get("/api/cookie-policy/:userId", async (req, res) => {
  const { userId } = req.params;
  const SUPABASE_URL = "https://oyfjwneybhlybfmbgiln.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95Zmp3bmV5YmhseWJmbWJnaWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzk3NTYsImV4cCI6MjA4OTYxNTc1Nn0.mPTYIf5q3OnWK88elyPqI_tfX4EJ4h91SmEuRN3AK44";

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

app.get("/api/tos/:userId", async (req, res) => {
  const { userId } = req.params;
  const SUPABASE_URL = "https://oyfjwneybhlybfmbgiln.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95Zmp3bmV5YmhseWJmbWJnaWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzk3NTYsImV4cCI6MjA4OTYxNTc1Nn0.mPTYIf5q3OnWK88elyPqI_tfX4EJ4h91SmEuRN3AK44";

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

app.get("/api/eula/:userId", async (req, res) => {
  const { userId } = req.params;
  const SUPABASE_URL = "https://oyfjwneybhlybfmbgiln.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95Zmp3bmV5YmhseWJmbWJnaWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzk3NTYsImV4cCI6MjA4OTYxNTc1Nn0.mPTYIf5q3OnWK88elyPqI_tfX4EJ4h91SmEuRN3AK44";

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

app.get("/api/return-policy/:userId", async (req, res) => {
  const { userId } = req.params;
  const SUPABASE_URL = "https://oyfjwneybhlybfmbgiln.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95Zmp3bmV5YmhseWJmbWJnaWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzk3NTYsImV4cCI6MjA4OTYxNTc1Nn0.mPTYIf5q3OnWK88elyPqI_tfX4EJ4h91SmEuRN3AK44";

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

app.get("/api/disclaimer/:userId", async (req, res) => {
  const { userId } = req.params;
  const SUPABASE_URL = "https://oyfjwneybhlybfmbgiln.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95Zmp3bmV5YmhseWJmbWJnaWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzk3NTYsImV4cCI6MjA4OTYxNTc1Nn0.mPTYIf5q3OnWK88elyPqI_tfX4EJ4h91SmEuRN3AK44";

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

app.get("/api/shipping-policy/:userId", async (req, res) => {
  const { userId } = req.params;
  const SUPABASE_URL = "https://oyfjwneybhlybfmbgiln.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95Zmp3bmV5YmhseWJmbWJnaWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzk3NTYsImV4cCI6MjA4OTYxNTc1Nn0.mPTYIf5q3OnWK88elyPqI_tfX4EJ4h91SmEuRN3AK44";

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

app.get("/api/aup/:userId", async (req, res) => {
  const { userId } = req.params;
  const SUPABASE_URL = "https://oyfjwneybhlybfmbgiln.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95Zmp3bmV5YmhseWJmbWJnaWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzk3NTYsImV4cCI6MjA4OTYxNTc1Nn0.mPTYIf5q3OnWK88elyPqI_tfX4EJ4h91SmEuRN3AK44";

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

app.get("/api/impressum/:userId", async (req, res) => {
  const { userId } = req.params;
  const SUPABASE_URL = "https://oyfjwneybhlybfmbgiln.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95Zmp3bmV5YmhseWJmbWJnaWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzk3NTYsImV4cCI6MjA4OTYxNTc1Nn0.mPTYIf5q3OnWK88elyPqI_tfX4EJ4h91SmEuRN3AK44";

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
      res.status(404).json({ error: "No published Impressum found for this user" });
    }
  } catch (err) {
    console.error("Impressum API Error:", err);
    res.status(500).json({ error: "Failed to fetch Impressum", details: err.message });
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Scanner API running on http://localhost:${PORT}`);
});
