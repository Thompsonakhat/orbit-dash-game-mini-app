import "dotenv/config";
import { run } from "@grammyjs/runner";
import { log, safeErr } from "./lib/log.js";

process.on("unhandledRejection", (err) => {
  log.error("unhandled rejection", { err: safeErr(err) });
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  log.error("uncaught exception", { err: safeErr(err) });
  process.exit(1);
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startMemoryLog() {
  setInterval(() => {
    const m = process.memoryUsage();
    log.info("memory", {
      rssMB: Math.round(m.rss / 1e6),
      heapUsedMB: Math.round(m.heapUsed / 1e6)
    });
  }, 60_000).unref();
}

async function startPollingWithRetry(bot) {
  let backoffMs = 2000;

  while (true) {
    let runner = null;

    try {
      log.info("telegram polling preparing", { dropPendingUpdates: true });
      await bot.api.deleteWebhook({ drop_pending_updates: true });

      log.info("telegram polling started", { concurrency: 1 });
      runner = run(bot, {
        sink: {
          concurrency: 1
        }
      });

      await runner.task();
      backoffMs = 2000;
    } catch (err) {
      const message = safeErr(err);
      const isConflict = message.includes("409") || message.toLowerCase().includes("conflict");

      log.warn("telegram polling failure", {
        err: message,
        conflict: isConflict,
        retryInMs: backoffMs
      });

      try {
        await runner?.stop?.();
      } catch (stopErr) {
        log.warn("telegram polling stop failure", { err: safeErr(stopErr) });
      }

      await sleep(backoffMs);
      backoffMs = Math.min(backoffMs === 2000 ? 5000 : backoffMs * 2, 20000);
    }
  }
}

async function boot() {
  log.info("boot start", { platform: "telegram", app: "orbit-dash" });

  try {
    const { cfg } = await import("./lib/config.js");

    log.info("config loaded", {
      telegramTokenSet: Boolean(cfg.TELEGRAM_BOT_TOKEN),
      webappUrlSet: Boolean(cfg.WEBAPP_URL_CONFIGURED),
      portSet: Boolean(cfg.PORT)
    });

    if (!cfg.TELEGRAM_BOT_TOKEN) {
      console.error("TELEGRAM_BOT_TOKEN is required. Add it to your environment and restart the service.");
      process.exit(1);
    }

    const { startServer } = await import("./server.js");
    const { createBot } = await import("./bot.js");

    await startServer(cfg);

    const bot = createBot(cfg);
    await bot.init();

    await bot.api.setMyCommands([
      { command: "start", description: "Open Orbit Dash" },
      { command: "help", description: "How to play Orbit Dash" }
    ]).catch((err) => {
      log.warn("set bot commands failed", { err: safeErr(err) });
    });

    startMemoryLog();
    await startPollingWithRetry(bot);
  } catch (err) {
    log.error("boot failed", { err: safeErr(err), code: err?.code || null });
    process.exit(1);
  }
}

boot();
