const puppeteer = require("puppeteer");
const path = require("path");

(async () => {
  const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

  const file = path.resolve(__dirname, "og-image.html");
  await page.goto(`file://${file}`, { waitUntil: "networkidle0" });

  // Wait for Google Fonts to load
  await new Promise(r => setTimeout(r, 1500));

  const out = path.resolve(__dirname, "../public/og-image.png");
  await page.screenshot({ path: out, type: "png", clip: { x: 0, y: 0, width: 1200, height: 630 } });

  await browser.close();
  console.log(`✓ OG image saved to public/og-image.png`);
})();
