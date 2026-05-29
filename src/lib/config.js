function cleanUrl(value) {
  return String(value || "").replace(/\/+$/, "");
}

const port = Number(process.env.PORT || 3000);
const explicitWebAppUrl = cleanUrl(process.env.WEBAPP_URL || "");
const renderBase = cleanUrl(process.env.RENDER_EXTERNAL_URL || "");
const fallbackLocalUrl = `http://localhost:${port}/app`;

export const cfg = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
  WEBAPP_URL: explicitWebAppUrl || (renderBase ? `${renderBase}/app` : fallbackLocalUrl),
  WEBAPP_URL_CONFIGURED: Boolean(explicitWebAppUrl || renderBase),
  PORT: Number.isFinite(port) && port > 0 ? port : 3000
};
