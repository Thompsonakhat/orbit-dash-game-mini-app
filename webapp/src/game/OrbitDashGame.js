import Phaser from "phaser";

export function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

const bounds = {
  x: 150,
  y: 120
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

class OrbitScene extends Phaser.Scene {
  constructor(callbacks, inputState) {
    super("OrbitDash");
    this.callbacks = callbacks;
    this.inputState = inputState;
  }

  preload() {
    this.createTextures();
  }

  create() {
    this.running = false;
    this.score = 0;
    this.coins = 0;
    this.survival = 0;
    this.distance = 0;
    this.level = 1;
    this.energy = 100;
    this.speed = 210;
    this.spawnTimer = 0;
    this.coinTimer = 0;
    this.boostFlash = 0;
    this.target = { x: 0, y: 0 };

    this.cameras.main.setBackgroundColor("#050816");
    this.physics.world.setBounds(-240, -180, 480, 360);

    this.add.tileSprite(0, 0, this.scale.width, this.scale.height, "stars")
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0.9);

    this.ship = this.physics.add.sprite(0, 85, "ship");
    this.ship.setCircle(18);
    this.ship.setDepth(5);

    this.asteroids = this.physics.add.group({ allowGravity: false });
    this.coinGroup = this.physics.add.group({ allowGravity: false });

    this.physics.add.overlap(this.ship, this.asteroids, () => this.endRun());
    this.physics.add.overlap(this.ship, this.coinGroup, (_ship, coin) => this.collectCoin(coin));

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keys = this.input.keyboard?.addKeys("W,A,S,D");

    this.input.on("pointermove", (pointer) => {
      if (!this.running || !pointer.isDown) return;
      const cx = this.scale.width / 2;
      const cy = this.scale.height / 2;
      this.target.x = clamp((pointer.x - cx) * 0.95, -bounds.x, bounds.x);
      this.target.y = clamp((pointer.y - cy) * 0.75, -bounds.y, bounds.y);
    });

    this.scale.on("resize", this.handleResize, this);
    this.handleResize();
    this.callbacks.onReady?.();
  }

  createTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    g.clear();
    g.fillStyle(0x86f7ff, 1);
    g.fillTriangle(24, 0, 0, 52, 48, 52);
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(24, 10, 14, 42, 34, 42);
    g.fillStyle(0x7c3aed, 1);
    g.fillTriangle(8, 48, 0, 62, 18, 52);
    g.fillTriangle(40, 48, 48, 62, 30, 52);
    g.generateTexture("ship", 48, 64);

    g.clear();
    g.fillStyle(0x8b8b98, 1);
    g.fillCircle(28, 28, 25);
    g.fillStyle(0x4b5563, 1);
    g.fillCircle(18, 20, 6);
    g.fillCircle(36, 34, 7);
    g.fillCircle(27, 43, 4);
    g.generateTexture("asteroid", 56, 56);

    g.clear();
    g.fillStyle(0xfacc15, 1);
    g.fillCircle(22, 22, 20);
    g.fillStyle(0xfffbeb, 1);
    g.fillCircle(16, 15, 5);
    g.fillStyle(0xf59e0b, 1);
    g.fillCircle(22, 22, 11);
    g.generateTexture("coin", 44, 44);

    g.clear();
    g.fillStyle(0xffffff, 1);
    for (let i = 0; i < 160; i += 1) {
      g.fillCircle(Math.random() * 512, Math.random() * 512, Math.random() * 1.7 + 0.4);
    }
    g.generateTexture("stars", 512, 512);
    g.destroy();
  }

  handleResize() {
    this.cameras.main.centerOn(0, 0);
  }

  startRun() {
    this.clearObjects();
    this.running = true;
    this.score = 0;
    this.coins = 0;
    this.survival = 0;
    this.distance = 0;
    this.level = 1;
    this.energy = 100;
    this.speed = 210;
    this.spawnTimer = 0;
    this.coinTimer = 0;
    this.target = { x: 0, y: 75 };
    this.ship.setPosition(0, 85);
    this.ship.setAlpha(1);
    this.ship.setScale(1);
    this.callbacks.onUpdate?.(this.snapshot());
  }

  update(_time, deltaMs) {
    const dt = Math.min(deltaMs / 1000, 0.04);

    if (!this.running) {
      this.ship.rotation += dt * 0.8;
      return;
    }

    this.survival += dt;
    this.distance += this.speed * dt * 0.08;
    this.level = Math.max(1, Math.floor(this.survival / 12) + 1);
    this.speed = 210 + this.level * 24 + this.survival * 2.2;
    this.score = Math.floor(this.distance * 2 + this.coins * 125);
    this.energy = clamp(Math.round(100 - this.level * 4 + this.coins * 2), 18, 100);

    this.updateInput(dt);
    this.updateObjects(dt);
    this.spawnTimer -= dt;
    this.coinTimer -= dt;

    if (this.spawnTimer <= 0) {
      this.spawnAsteroid();
      this.spawnTimer = clamp(1.1 - this.level * 0.055, 0.42, 1.1);
    }

    if (this.coinTimer <= 0) {
      this.spawnCoin();
      this.coinTimer = clamp(1.45 - this.level * 0.035, 0.7, 1.45);
    }

    this.ship.rotation = Phaser.Math.Linear(this.ship.rotation, (this.target.x - this.ship.x) / 180, 0.16);
    this.callbacks.onUpdate?.(this.snapshot());
  }

  updateInput(dt) {
    const keyboardSpeed = 230 * dt;

    if (this.cursors?.left?.isDown || this.keys?.A?.isDown) this.target.x -= keyboardSpeed;
    if (this.cursors?.right?.isDown || this.keys?.D?.isDown) this.target.x += keyboardSpeed;
    if (this.cursors?.up?.isDown || this.keys?.W?.isDown) this.target.y -= keyboardSpeed;
    if (this.cursors?.down?.isDown || this.keys?.S?.isDown) this.target.y += keyboardSpeed;

    this.target.x += this.inputState.dx * 260 * dt;
    this.target.y += this.inputState.dy * 220 * dt;

    this.target.x = clamp(this.target.x, -bounds.x, bounds.x);
    this.target.y = clamp(this.target.y, -bounds.y, bounds.y);

    this.ship.x = Phaser.Math.Linear(this.ship.x, this.target.x, 0.23);
    this.ship.y = Phaser.Math.Linear(this.ship.y, this.target.y, 0.23);
  }

  updateObjects(dt) {
    const drift = this.speed * dt;

    this.asteroids.children.iterate((asteroid) => {
      if (!asteroid) return;
      asteroid.y += drift;
      asteroid.rotation += dt * asteroid.getData("spin");
      asteroid.scale = Phaser.Math.Linear(asteroid.scale, 1.25, 0.01);
      if (asteroid.y > this.scale.height / 2 + 90) asteroid.destroy();
    });

    this.coinGroup.children.iterate((coin) => {
      if (!coin) return;
      coin.y += drift * 0.95;
      coin.rotation += dt * 4;
      if (coin.y > this.scale.height / 2 + 90) coin.destroy();
    });
  }

  spawnAsteroid() {
    const x = Phaser.Math.Between(-bounds.x, bounds.x);
    const y = -this.scale.height / 2 - 70;
    const asteroid = this.asteroids.create(x, y, "asteroid");
    asteroid.setCircle(24);
    asteroid.setScale(Phaser.Math.FloatBetween(0.75, 1.15));
    asteroid.setData("spin", Phaser.Math.FloatBetween(-2.4, 2.4));
  }

  spawnCoin() {
    const x = Phaser.Math.Between(-bounds.x + 25, bounds.x - 25);
    const y = -this.scale.height / 2 - 80;
    const coin = this.coinGroup.create(x, y, "coin");
    coin.setCircle(18);
    coin.setScale(0.85);
  }

  collectCoin(coin) {
    coin.destroy();
    this.coins += 1;
    this.score += 125;
    this.cameras.main.flash(70, 250, 224, 90, false);
  }

  endRun() {
    if (!this.running) return;
    this.running = false;
    this.ship.setAlpha(0.35);
    this.cameras.main.shake(180, 0.01);
    this.callbacks.onGameOver?.({
      score: Math.max(0, this.score),
      coins: this.coins,
      survival: Math.floor(this.survival),
      distance: Math.floor(this.distance)
    });
  }

  clearObjects() {
    this.asteroids?.clear(true, true);
    this.coinGroup?.clear(true, true);
  }

  snapshot() {
    return {
      score: Math.max(0, this.score),
      coins: this.coins,
      survival: Math.floor(this.survival),
      level: this.level,
      energy: this.energy
    };
  }
}

export function createOrbitDashGame(parent, callbacks) {
  const inputState = { dx: 0, dy: 0 };
  let scene = null;

  const game = new Phaser.Game({
    type: Phaser.WEBGL,
    parent,
    backgroundColor: "#050816",
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: parent.clientWidth || window.innerWidth,
      height: parent.clientHeight || window.innerHeight
    },
    physics: {
      default: "arcade",
      arcade: { debug: false }
    },
    scene: [new OrbitScene({
      ...callbacks,
      onReady: () => {
        scene = game.scene.getScene("OrbitDash");
        callbacks.onReady?.();
      }
    }, inputState)]
  });

  window.addEventListener("contextmenu", preventDefault, { passive: false });
  window.addEventListener("touchmove", preventDefault, { passive: false });

  return {
    restart() {
      scene?.startRun?.();
    },
    move(dx, dy) {
      inputState.dx = dx;
      inputState.dy = dy;
    },
    destroy() {
      window.removeEventListener("contextmenu", preventDefault);
      window.removeEventListener("touchmove", preventDefault);
      game.destroy(true);
    }
  };
}

function preventDefault(event) {
  event.preventDefault();
}
