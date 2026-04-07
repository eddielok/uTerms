/**
 * Prerender public routes to static HTML for SEO.
 *
 * Run after `vite build`:  node scripts/prerender.mjs
 * The script starts `vite preview`, visits each public route via Puppeteer,
 * and writes the fully-rendered HTML back into dist/.
 */

import { spawn } from 'child_process';
import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const PORT = 4174; // avoid clashing with default 4173
const BASE = `http://localhost:${PORT}`;

const ROUTES = [
  '/',
  '/features',
  '/about',
  '/policies',
  '/login',
  '/register',
  '/do-not-sell',
];

function startPreviewServer() {
  const proc = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Preview server timed out')), 30_000);

    proc.stdout.on('data', (chunk) => {
      if (chunk.toString().includes(String(PORT))) {
        clearTimeout(timeout);
        resolve(proc);
      }
    });
    proc.stderr.on('data', (chunk) => {
      const msg = chunk.toString();
      if (msg.includes(String(PORT))) {
        clearTimeout(timeout);
        resolve(proc);
      }
    });
    proc.on('error', (err) => { clearTimeout(timeout); reject(err); });
  });
}

async function waitForServer(url, retries = 20) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Server at ${url} never became ready`);
}

async function prerender() {
  console.log('[prerender] Starting preview server...');
  const server = await startPreviewServer();
  await waitForServer(BASE);
  console.log(`[prerender] Preview server ready at ${BASE}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const route of ROUTES) {
      const url = `${BASE}${route}`;
      console.log(`[prerender] Rendering ${route}`);

      const page = await browser.newPage();
      // Block analytics/ads so they don't delay networkidle
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const type = req.resourceType();
        if (['image', 'media', 'font'].includes(type)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 });

      // Let React finish any deferred renders
      await new Promise(r => setTimeout(r, 500));

      const html = await page.content();
      await page.close();

      // Write to dist/[route]/index.html  (dist/index.html for /)
      const outDir = route === '/' ? DIST : join(DIST, ...route.split('/').filter(Boolean));
      await mkdir(outDir, { recursive: true });
      await writeFile(join(outDir, 'index.html'), html, 'utf8');

      console.log(`[prerender] ✓ ${route}`);
    }
  } finally {
    await browser.close();
    server.kill();
  }

  console.log('[prerender] Done. All routes prerendered into dist/.');
}

prerender().catch((err) => {
  console.error('[prerender] Failed:', err);
  process.exit(1);
});
