import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright-core");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "docs", "preview");
fs.mkdirSync(outDir, { recursive: true });

function findBrowser() {
  const candidates = [];
  for (const base of [process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], process.env.LOCALAPPDATA]) {
    if (!base) continue;
    candidates.push(path.join(base, "Microsoft", "Edge", "Application", "msedge.exe"));
    candidates.push(path.join(base, "Google", "Chrome", "Application", "chrome.exe"));
  }
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function contentType(file) {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".js")) return "application/javascript";
  if (file.endsWith(".css")) return "text/css";
  if (file.endsWith(".woff2")) return "font/woff2";
  if (file.endsWith(".svg")) return "image/svg+xml";
  if (file.endsWith(".json")) return "application/json";
  if (file.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

const skillAssets = path.join(root, "skills", "zhongguose-ppt-skill", "assets");
const serverRoot = skillAssets;

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const rel = urlPath === "/" ? "/template-zhongguose/index.html" : urlPath;
  const file = path.normalize(path.join(serverRoot, rel.replace(/^\//, "")));
  if (!file.startsWith(serverRoot) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  res.writeHead(200, { "Content-Type": contentType(file) });
  fs.createReadStream(file).pipe(res);
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const base = `http://127.0.0.1:${port}`;
const browserPath = findBrowser();
if (!browserPath) {
  console.error("No browser found");
  process.exit(1);
}

const browser = await chromium.launch({ executablePath: browserPath, headless: true });
const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1.25,
});
const page = await context.newPage();

async function waitFonts(p) {
  await p.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
  await p.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  });
  await p.waitForTimeout(400);
}

// Theme gallery full page
await page.goto(`${base}/theme-cover-gallery.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
await waitFonts(page);
const galleryH = await page.evaluate(() =>
  Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
);
await page.setViewportSize({ width: 1440, height: Math.min(galleryH + 40, 3600) });
await page.screenshot({ path: path.join(outDir, "theme-cover-gallery.png"), fullPage: true });
console.log("saved theme-cover-gallery.png");

// Template slides
await page.setViewportSize({ width: 1600, height: 900 });
await page.goto(`${base}/template-zhongguose/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
await waitFonts(page);
await page.keyboard.press("b").catch(() => {});
await page.waitForTimeout(300);

const slides = await page.locator("section.slide").count();
console.log("slides:", slides);

const capture = async (index, name) => {
  await page.evaluate((i) => {
    const all = document.querySelectorAll("section.slide");
    all.forEach((el, idx) => {
      el.style.display = idx === i ? "flex" : "none";
      el.classList.toggle("active", idx === i);
    });
    if (typeof window.goTo === "function") window.goTo(i);
    if (window.deck && typeof window.deck.goTo === "function") window.deck.goTo(i);
  }, index);
  await page.waitForTimeout(250);
  await page.screenshot({
    path: path.join(outDir, name),
    clip: { x: 0, y: 0, width: 1600, height: 900 },
  });
  console.log("saved", name);
};

const picks = [
  [0, "template-01-cover.png"],
  [1, "template-02-divider.png"],
  [2, "template-03-cards.png"],
  [4, "template-05-grid.png"],
  [7, "template-08-split.png"],
  [10, "template-11-timeline.png"],
  [12, "template-13-closing.png"],
];
for (const [i, name] of picks) {
  if (i < slides) await capture(i, name);
}

await browser.close();
server.close();
console.log("done ->", outDir);
