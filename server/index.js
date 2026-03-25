const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
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
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Set a common user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    // Go to URL and wait until network is mostly idle
    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 30000 });

    // Auto-scroll to trigger lazy-loaded scripts
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight - window.innerHeight) {
            clearInterval(timer);
            resolve();
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
    const client = await page.target().createCDPSession();
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Scanner API running on http://localhost:${PORT}`);
});
