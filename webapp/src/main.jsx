import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.jsx";

function applyTelegramTheme() {
  const tg = window.Telegram?.WebApp;

  try {
    tg?.ready?.();
    tg?.expand?.();
    tg?.disableVerticalSwipes?.();
  } catch (err) {
    console.debug("Telegram WebApp init skipped", err?.message || String(err));
  }

  const theme = tg?.themeParams || {};
  const root = document.documentElement;

  root.style.setProperty("--tg-bg", theme.bg_color || "#050816");
  root.style.setProperty("--tg-text", theme.text_color || "#f8fbff");
  root.style.setProperty("--tg-hint", theme.hint_color || "#9ca3af");
  root.style.setProperty("--tg-button", theme.button_color || "#7c3aed");
  root.style.setProperty("--tg-button-text", theme.button_text_color || "#ffffff");
}

applyTelegramTheme();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
