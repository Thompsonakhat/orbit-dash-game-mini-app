export function register(bot) {
  bot.command("help", async (ctx) => {
    await ctx.reply(
      [
        "Orbit Dash help",
        "Goal: pilot the spaceship through a 3D space run, dodge asteroids, collect coins, and survive as long as possible.",
        "Controls: use the on-screen touch pad on mobile. Drag or tap directions to move left, right, up, and down. On desktop, use arrow keys or WASD for testing.",
        "Scoring: your score rises with distance and survival time. Coins add bonus points. Difficulty increases as your run continues.",
        "Commands: /start opens the game. /help shows this guide."
      ].join("\n\n")
    );
  });
}
