import { useEffect, useMemo, useRef, useState } from "react";
import { createOrbitDashGame, hasWebGL } from "./game/OrbitDashGame.js";

const bestKey = "orbitDash.bestScore";
const coinsKey = "orbitDash.totalCoins";

function readNumber(key) {
  const value = Number(localStorage.getItem(key) || 0);
  return Number.isFinite(value) ? value : 0;
}

function haptic(type = "light") {
  const feedback = window.Telegram?.WebApp?.HapticFeedback;
  try {
    if (type === "success" || type === "warning" || type === "error") {
      feedback?.notificationOccurred?.(type);
    } else {
      feedback?.impactOccurred?.(type);
    }
  } catch {}
}

export function App() {
  const mountRef = useRef(null);
  const gameRef = useRef(null);
  const [screen, setScreen] = useState("empty");
  const [stats, setStats] = useState({ score: 0, coins: 0, survival: 0, level: 1, energy: 100 });
  const [finalStats, setFinalStats] = useState(null);
  const [error, setError] = useState("");
  const [bestScore, setBestScore] = useState(() => readNumber(bestKey));
  const [totalCoins, setTotalCoins] = useState(() => readNumber(coinsKey));

  const statusText = useMemo(() => {
    if (screen === "loading") return "Calibrating engines...";
    if (screen === "empty") return "Waiting to initialize...";
    if (screen === "playing") return "Swipe or tap controls to dodge.";
    if (screen === "gameover") return "Run complete. Ready for another orbit.";
    return "Ready for launch.";
  }, [screen]);

  useEffect(() => {
    let disposed = false;
    setScreen("loading");

    const timer = window.setTimeout(() => {
      try {
        if (!hasWebGL()) {
          throw new Error("WebGL is not available in this WebView. Update Telegram or try another device.");
        }

        if (disposed || !mountRef.current) return;

        gameRef.current = createOrbitDashGame(mountRef.current, {
          onReady: () => setScreen("ready"),
          onUpdate: (nextStats) => setStats(nextStats),
          onGameOver: (result) => {
            haptic("error");
            setFinalStats(result);
            setScreen("gameover");

            const nextBest = Math.max(readNumber(bestKey), result.score);
            const nextCoins = readNumber(coinsKey) + result.coins;
            localStorage.setItem(bestKey, String(nextBest));
            localStorage.setItem(coinsKey, String(nextCoins));
            setBestScore(nextBest);
            setTotalCoins(nextCoins);
          },
          onError: (message) => {
            setError(message);
            setScreen("error");
          }
        });
      } catch (err) {
        setError(err?.message || "Orbit Dash could not start in this WebView.");
        setScreen("error");
      }
    }, 250);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      gameRef.current?.destroy?.();
      gameRef.current = null;
    };
  }, []);

  function play() {
    haptic("success");
    setFinalStats(null);
    setStats({ score: 0, coins: 0, survival: 0, level: 1, energy: 100 });
    setScreen("playing");
    gameRef.current?.restart?.();
  }

  function retryInit() {
    window.location.reload();
  }

  function move(dx, dy) {
    gameRef.current?.move?.(dx, dy);
  }

  return (
    <main className="relative h-dvh w-screen overflow-hidden bg-[#050816] text-white">
      <div className="starfield" />
      <section ref={mountRef} className="absolute inset-0" aria-label="Orbit Dash 3D game viewport" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 px-4 pt-safeTop">
        <div className="hud-card">
          <span>Score</span>
          <strong>{stats.score}</strong>
        </div>
        <div className="hud-card">
          <span>Coins</span>
          <strong>{stats.coins}</strong>
        </div>
        <div className="hud-card">
          <span>Time</span>
          <strong>{stats.survival}s</strong>
        </div>
      </div>

      {screen === "playing" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-4 pb-safeBottom">
          <div className="mx-auto mb-3 flex max-w-md items-center justify-between rounded-3xl border border-white/10 bg-black/30 p-3 text-xs text-white/80 shadow-2xl backdrop-blur-xl">
            <span>Level {stats.level}</span>
            <span>Energy {stats.energy}%</span>
            <span>Drag anywhere</span>
          </div>
          <div className="pointer-events-auto mx-auto grid max-w-sm grid-cols-3 gap-3 rounded-[2rem] border border-white/10 bg-black/35 p-4 shadow-2xl backdrop-blur-xl">
            <button className="control-btn col-start-2" onPointerDown={() => move(0, -1)} onPointerUp={() => move(0, 0)}>Up</button>
            <button className="control-btn" onPointerDown={() => move(-1, 0)} onPointerUp={() => move(0, 0)}>Left</button>
            <button className="control-btn" onPointerDown={() => move(0, 1)} onPointerUp={() => move(0, 0)}>Down</button>
            <button className="control-btn" onPointerDown={() => move(1, 0)} onPointerUp={() => move(0, 0)}>Right</button>
          </div>
        </div>
      )}

      {screen !== "playing" && (
        <div className="absolute inset-0 z-40 grid place-items-center px-4 py-safeY">
          <div className="panel w-full max-w-md text-center">
            {(screen === "empty" || screen === "loading") && (
              <>
                <div className="mx-auto mb-5 h-14 w-14 animate-pulse rounded-2xl bg-cyan-300/20 ring-1 ring-cyan-200/30" />
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Orbit Dash</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight">Loading Runway</h1>
                <p className="mt-4 text-base text-white/70">{statusText}</p>
              </>
            )}

            {screen === "ready" && (
              <>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Telegram Space Runner</p>
                <h1 className="mt-3 text-5xl font-black tracking-tight">Orbit Dash</h1>
                <p className="mt-4 text-base leading-7 text-white/75">
                  Pilot a neon ship through asteroid lanes, collect coins, build energy boosts, and survive the rising speed.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                  <div className="mini-card"><span>Best</span><strong>{bestScore}</strong></div>
                  <div className="mini-card"><span>Total Coins</span><strong>{totalCoins}</strong></div>
                </div>
                <button className="primary-btn mt-7" onClick={play}>Play</button>
                <p className="mt-4 text-sm text-white/55">Touch controls are tuned for Telegram WebView. Keyboard works on desktop.</p>
              </>
            )}

            {screen === "gameover" && finalStats && (
              <>
                <p className="text-sm uppercase tracking-[0.35em] text-fuchsia-200/80">Game Over</p>
                <h1 className="mt-3 text-4xl font-black">Final Run</h1>
                <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                  <div className="mini-card"><span>Score</span><strong>{finalStats.score}</strong></div>
                  <div className="mini-card"><span>Coins</span><strong>{finalStats.coins}</strong></div>
                  <div className="mini-card"><span>Survival</span><strong>{finalStats.survival}s</strong></div>
                  <div className="mini-card"><span>Distance</span><strong>{finalStats.distance}m</strong></div>
                </div>
                <button className="primary-btn mt-7" onClick={play}>Restart</button>
              </>
            )}

            {screen === "error" && (
              <>
                <p className="text-sm uppercase tracking-[0.35em] text-red-200/80">Engine Error</p>
                <h1 className="mt-3 text-3xl font-black">WebGL could not start</h1>
                <p className="mt-4 text-base leading-7 text-white/75">{error}</p>
                <button className="primary-btn mt-7" onClick={retryInit}>Retry</button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
