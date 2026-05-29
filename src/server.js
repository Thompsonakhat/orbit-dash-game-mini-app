import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { log, safeErr } from "./lib/log.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export async function startServer(cfg) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "128kb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, app: "orbit-dash", webapp: "/app" });
  });

  app.post("/api/miniapp/ping", (_req, res) => {
    res.json({ ok: true, ts: Date.now() });
  });

  const distDir = path.join(currentDir, "..", "webapp", "dist");
  const indexHtml = path.join(distDir, "index.html");

  function sendIndex(_req, res) {
    if (fs.existsSync(indexHtml)) {
      return res.sendFile(indexHtml);
    }

    return res.status(200).send(
      "Orbit Dash web app is not built yet. Run npm run build:webapp, then start the server again."
    );
  }

  if (fs.existsSync(distDir)) {
    app.use("/app", express.static(distDir, {
      index: false,
      maxAge: "1h"
    }));
  }

  app.get("/app", sendIndex);
  app.get("/app/*splat", sendIndex);
  app.get("/", (_req, res) => res.redirect("/app"));

  const port = cfg.PORT || 3000;

  await new Promise((resolve, reject) => {
    const server = app.listen(port, () => resolve(server));
    server.on("error", reject);
  }).catch((err) => {
    log.error("web server startup failure", { err: safeErr(err), port });
    throw err;
  });

  log.info("web server started", {
    port,
    appPath: "/app",
    webappUrlSet: Boolean(cfg.WEBAPP_URL_CONFIGURED)
  });
}
