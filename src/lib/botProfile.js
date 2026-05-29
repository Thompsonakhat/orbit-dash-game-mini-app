export function buildBotProfile(cfg) {
  const urlState = cfg.WEBAPP_URL_CONFIGURED ? "configured" : "using local development fallback";

  return [
    "Orbit Dash is a Telegram-only Mini App game where players pilot a spaceship, dodge asteroids, collect coins, and survive as long as possible.",
    "Public commands: /start opens the game with a Telegram Web App button. /help explains the objective, controls, scoring, and restart flow.",
    `Features: hosted game at /app, mobile touch controls, desktop keyboard testing, score, coins, survival timer, and local high score persistence. Web App URL is ${urlState}.`,
    "Key rules: this bot only supports Telegram, runs the bot and game web server in one Node.js process, and does not expose admin actions."
  ].join("\n");
}
