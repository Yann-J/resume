import http from "node:http";
import { stat } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const outputFileName = process.env.PDF_FILENAME || "resume.pdf";
const OUTPUT_PDF = path.resolve(ROOT_DIR, outputFileName);
const HOST = "127.0.0.1";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".yml": "text/yaml; charset=utf-8",
  ".yaml": "text/yaml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function safePathname(rawPathname) {
  const decoded = decodeURIComponent(rawPathname.split("?")[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return normalized === "/" ? "/index.html" : normalized;
}

async function serveFile(req, res) {
  const pathname = safePathname(req.url || "/");
  const absolutePath = path.join(ROOT_DIR, pathname);
  const rootWithSep = `${ROOT_DIR}${path.sep}`;

  if (!absolutePath.startsWith(rootWithSep) && absolutePath !== ROOT_DIR) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!existsSync(absolutePath)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const stats = await stat(absolutePath);
  const ext = path.extname(absolutePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
    "Content-Length": stats.size,
    "Cache-Control": "no-store",
  });
  createReadStream(absolutePath).pipe(res);
}

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      serveFile(req, res).catch((error) => {
        res.writeHead(500);
        res.end("Internal server error");
        console.error(error);
      });
    });

    server.listen(0, HOST, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("Unable to determine export server address");
      }
      resolve({ server, port: address.port });
    });
  });
}

async function exportPdf() {
  const { server, port } = await startServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`http://${HOST}:${port}/`, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    await page.pdf({
      path: OUTPUT_PDF,
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
      outline: true,
    });
    console.log(`PDF exported: ${OUTPUT_PDF}`);
  } finally {
    if (browser) {
      await browser.close();
    }
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

exportPdf().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
