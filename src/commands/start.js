import { InlineKeyboard } from "grammy";

export function register(bot, cfg) {
  bot.command("start", async (ctx) => {
    const keyboard = new InlineKeyboard().webApp("Play Orbit Dash", cfg.WEBAPP_URL);
    const note = cfg.WEBAPP_URL_CONFIGURED
      ? "Tap the button below to launch the game inside Telegram."
      : "Local fallback URL is active. Set WEBAPP_URL to your deployed https://.../app URL before opening from Telegram on mobile.";

    await ctx.reply(
      [
        "Welcome to Orbit Dash.",
        "Pilot your spaceship, dodge asteroids, collect coins, and survive as long as you can.",
        note
      ].join("\n\n"),
      { reply_markup: keyboard }
    );
  });
}
