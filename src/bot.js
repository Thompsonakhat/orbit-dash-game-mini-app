import { Bot } from "grammy";
import { register as registerStart } from "./commands/start.js";
import { register as registerHelp } from "./commands/help.js";
import { buildBotProfile } from "./lib/botProfile.js";
import { log, safeErr } from "./lib/log.js";

export function createBot(cfg) {
  const bot = new Bot(cfg.TELEGRAM_BOT_TOKEN);
  const botProfile = buildBotProfile(cfg);

  log.info("bot profile ready", {
    platform: "telegram",
    commands: ["/start", "/help"],
    profileChars: botProfile.length
  });

  registerStart(bot, cfg);
  registerHelp(bot, cfg);

  bot.catch((err) => {
    log.error("telegram handler failure", {
      updateId: err.ctx?.update?.update_id || null,
      err: safeErr(err.error)
    });
  });

  return bot;
}
