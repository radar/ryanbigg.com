// Renders scripts/og.html to images/og.png (1200x630). Usage: node scripts/og.js
const path = require("path");
const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });
  await page.goto("file://" + path.join(__dirname, "og.html"), { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(__dirname, "..", "images", "og.png") });
  await browser.close();
})();
