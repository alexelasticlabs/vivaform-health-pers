import { chromium } from '@playwright/test';
import { preview as vitePreview } from 'vite';
import { setTimeout as delay } from 'node:timers/promises';
import * as fs from 'node:fs';
import * as path from 'node:path';

const PORT = 5174;
const BASE_URL = `http://localhost:${PORT}`;
const OUT_DIR = path.resolve(process.cwd(), 'screenshots');

async function waitForServer(url: string, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return;
    } catch {}
    await delay(300);
  }
  throw new Error(`Server not responding at ${url}`);
}

async function run() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // Start vite preview programmatically on a fixed port
  const server = await vitePreview({ preview: { port: PORT, strictPort: true } });

  try {
    await waitForServer(`${BASE_URL}/`);

    const browser = await chromium.launch();
    const context = await browser.newContext({ deviceScaleFactor: 1 });
    const page = await context.newPage();

    const widths = [360, 768, 1280];
    const modes: Array<'light' | 'dark'> = ['light', 'dark'];

    for (const mode of modes) {
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${BASE_URL}/#faq-free-trial`, { waitUntil: 'domcontentloaded' });
        // Apply theme explicitly for Tailwind dark mode
        await page.addInitScript((m) => {
          document.documentElement.dataset.theme = m;
          (document.documentElement as HTMLElement).style.colorScheme = m;
          if (m === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }, mode);
        await page.reload({ waitUntil: 'networkidle' });
        // Gentle wait for animations
        await delay(600);
        const file = path.join(OUT_DIR, `landing-faq-${mode}-${width}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log(`Saved: ${file}`);
      }
    }

    await browser.close();
  } finally {
    await server.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
