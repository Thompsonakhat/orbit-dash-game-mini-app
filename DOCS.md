# Orbit Dash Documentation

Orbit Dash is a Telegram-only Mini App game. Players pilot a small spaceship through a space runner course, dodge asteroids, collect coins, and survive as long as possible.

The project runs as a single Node.js service. It starts a grammY Telegram bot and hosts the Mini App web game from the same process at `/app`.

## Public commands

### /start

Usage: `/start`

Welcomes the user to Orbit Dash and shows a Telegram Web App button that opens the game.

### /help

Usage: `/help`

Explains how to play: move the spaceship with touch controls, dodge asteroids, collect coins, survive longer for more score, and restart after game over.

## Environment variables

### TELEGRAM_BOT_TOKEN

Required. The Telegram bot token from BotFather. The service exits with a clear message if this is missing.

### WEBAPP_URL

Optional. The public URL that Telegram should open for the game, normally ending in `/app`.

Example:

text
https://your-service.onrender.com/app


If it is missing, the app falls back to `http://localhost:<PORT>/app` for local development. This keeps startup safe, but Telegram mobile users need a public HTTPS URL.

### PORT

Optional. HTTP port for the single Node service. Defaults to `3000`.

## Local run

Install root dependencies and web app dependencies:

bash
npm run install:root
npm run install:webapp


Build the Mini App:

bash
npm run build:webapp


Start the service:

bash
npm start


Open the local game at:

text
http://localhost:3000/app


## Telegram Mini App URL setup

For Telegram mobile testing, deploy the service to a public HTTPS URL and set:

text
WEBAPP_URL=https://your-public-host/app


Then send `/start` to the bot and tap Play Orbit Dash.

## Gameplay

The game includes a start screen, live game screen, and game over screen.

During a run:

1. Move the spaceship with drag or the on-screen controls.
2. Avoid asteroids. Hitting one ends the run.
3. Collect coins for bonus points.
4. Survive longer to increase score and difficulty.
5. Press Restart after game over to reset the run without leaving Telegram.

Desktop testing supports arrow keys and WASD.

## Deployment notes

Use one Node web service. Do not run a separate worker. The root `start` script runs the HTTP server and the Telegram bot together.

Recommended Render settings:

Build command:

bash
npm run build


Start command:

bash
npm start


Required environment variable:

text
TELEGRAM_BOT_TOKEN


Recommended environment variable:

text
WEBAPP_URL=https://your-service.onrender.com/app


## Troubleshooting

If the service exits, check that `TELEGRAM_BOT_TOKEN` is set.

If Telegram says the Web App cannot open, confirm `WEBAPP_URL` is public, HTTPS, and ends with `/app`.

If the game shows a WebGL error, update Telegram, try a newer mobile device, or test in a browser that supports WebGL.

If the web page says the app is not built, run `npm run build:webapp` before `npm start`.

Logs print only safe booleans such as whether `TELEGRAM_BOT_TOKEN` and `WEBAPP_URL` are set. Secrets are never printed.
