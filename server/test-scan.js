const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.goto('https://mmob.com', { waitUntil: 'networkidle0', timeout: 45000 });
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Scroll down
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
  });
  await new Promise(resolve => setTimeout(resolve, 2000));
  await page.screenshot({ path: 'mmob-before.png' });

  // Try clicking common accept buttons
  try {
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
      const acceptBtn = buttons.find(b => {
        const text = (b.textContent || '').toLowerCase().trim();
        return text === 'accept' || text === 'accept all' || text === 'allow all' || text === 'agree' || text === 'accept all cookies' || text === 'ok';
      });
      if (acceptBtn) {
        acceptBtn.click();
        return true;
      }
      return false;
    });
    console.log("Banner clicked:", clicked);
  } catch(e) {
    console.error("Error clicking banner:", e);
  }
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  await page.screenshot({ path: 'mmob-after.png' });

  // 1. CDP Network.getAllCookies
  const client = await page.target().createCDPSession();
  const { cookies: cdpCookies } = await client.send('Network.getAllCookies');
  console.log(`\nNetwork.getAllCookies() count: ${cdpCookies.length}`);
  console.log("CDP cookies names:", cdpCookies.map(c => c.name).join(', '));

  await browser.close();
})();
