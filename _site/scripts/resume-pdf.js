const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const target = process.argv.includes("--ai") ? "resume-ai" : "resume";
const url = process.env.RESUME_URL || `http://localhost:4000/${target}.html`;
const outPath = `${target}.pdf`;
const watch = process.argv.includes("--watch");

const watchPaths = [
  path.join(__dirname, "..", `${target}.html`),
  path.join(__dirname, "..", "css", "style.css"),
];

async function generate(page) {
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    margin: { top: "0", bottom: "0", left: "0", right: "0" },
  });
  console.log(`${outPath} written ${new Date().toLocaleTimeString()}`);
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await generate(page);

  if (!watch) {
    await browser.close();
    return;
  }

  console.log("Watching for changes:", watchPaths.join(", "));

  let pending = false;
  const trigger = () => {
    if (pending) return;
    pending = true;
    setTimeout(async () => {
      pending = false;
      try {
        await generate(page);
      } catch (err) {
        console.error(err);
      }
    }, 200);
  };

  watchPaths.forEach((p) => fs.watch(p, trigger));
})();
