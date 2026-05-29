# Orbit Dash

Orbit Dash is a Telegram Mini App game served by one Node.js service. The same process runs the grammY Telegram bot, hosts the React and Phaser web game at `/app`, and exposes a small health endpoint.

## Features

- Telegram bot commands: `/start` and `/help`
- Telegram Web App button that opens Orbit Dash
- Mobile-first Telegram WebView UI
- Phaser 3 arcade loop with spaceship movement, asteroids, coins, score, survival timer, difficulty progression, and restart flow
- Local high score and total coin persistence in the browser
- Production-safe startup logs that only print environment booleans

## Setup

1. Install dependencies:

bash
npm run install:root
npm run install:webapp


2. Copy `.env.sample` to `.env` and set `TELEGRAM_BOT_TOKEN`.

3. Build the web app:

bash
npm run build:webapp


4. Start the single service:

bash
npm start


The game is served at `http://localhost:3000/app` by default.

## Environment variables

- `TELEGRAM_BOT_TOKEN`: required. Telegram bot token from BotFather.
- `WEBAPP_URL`: optional but recommended. Full public URL to the game, for example `https://your-service.onrender.com/app`.
- `PORT`: optional. HTTP port for the Node service. Defaults to `3000`.

## Commands

- `/start`: welcomes the player and shows the Play Orbit Dash Web App button.
- `/help`: explains the objective, touch controls, scoring, coins, asteroids, and restart flow.

## Deployment

Deploy as one Render web service or similar Node host.

Build command:

bash
npm run build


Start command:

bash
npm start


Set `TELEGRAM_BOT_TOKEN`. Set `WEBAPP_URL` to your deployed `/app` URL when available.

## Troubleshooting

If the bot exits at startup, confirm `TELEGRAM_BOT_TOKEN` is set. Logs only show whether the token is present, never the token value.

If the button opens a local URL inside Telegram, set `WEBAPP_URL` to a public HTTPS URL ending in `/app`.

If the game shows a WebGL error, update Telegram, try another device, or confirm the WebView supports WebGL.
