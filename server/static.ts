import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html — inject absolute OG image URL for social media previews
  app.use("/{*path}", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    fs.readFile(indexPath, "utf-8", (err, html) => {
      if (err) return res.sendFile(indexPath);
      const proto = req.headers["x-forwarded-proto"] || "https";
      const host = req.headers.host || "localhost:5000";
      const baseUrl = `${proto}://${host}`;
      const injected = html
        .replace(/content="\/og-image\.png"/g, `content="${baseUrl}/og-image.png"`)
        .replace(`property="og:url" content=""`, `property="og:url" content="${baseUrl}"`);
      res.set("Content-Type", "text/html").send(injected);
    });
  });
}
