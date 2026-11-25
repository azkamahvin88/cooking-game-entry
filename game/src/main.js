// Sizzle & Serve — boot and game loop: sizes the canvas, starts the clock,
// draws every frame, and (for the maker's own screenshots) can open the game
// straight into a staged scene with ?shot=cover|mid|ready|rush.

import { createGame, tick, spawnOrder, startGame } from './state.js';
import { draw, W, H } from './render.js';
import { attachInput } from './input.js';
import { RECIPES } from './data.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function fitCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

fitCanvas();
window.addEventListener('resize', fitCanvas);

const game = createGame();
// Test hook: lets automated play-tests read score, orders and tray state.
window.__game = game;
attachInput(canvas, game, () => {});

// --- Screenshot staging ---------------------------------------------------
// The maker photographs the game with ?shot=... : each value stages a real,
// playable state of the same code (orders on the board, food on the counter,
// a dish mid-assembly, a timer running, a plate ready to serve).
function stageShot(name) {
  startGame(game);
  const byName = (n) => RECIPES.find((r) => r.name === n);
  if (name === 'cover') {
    game.screen = 'title';
    game.orders = [
      { id: 1, recipe: byName('Classic Burger'), left: 38, total: 46, flash: 0 },
    ];
    game.tray = ['bun'];
    game.grill = [{ state: 'cooking', t: 2.5 }, null];
    game.board = [{ ing: 'tomato', chops: 1 }];
  } else if (name === 'mid') {
    game.orders = [
      { id: 1, recipe: byName('Cheese Melt'), left: 29, total: 46, flash: 0 },
      { id: 2, recipe: byName('Garden Stack'), left: 41, total: 42, flash: 0 },
    ];
    game.tray = ['bun', 'cheese'];
    game.grill = [{ state: 'perfect', t: 6.2 }, { state: 'cooking', t: 3.1 }];
    game.board = [{ ing: 'lettuce', chops: 1 }, { ing: 'tomato', chops: 0 }];
    game.score = 340;
    game.coins = 34;
    game.combo = 2;
    game.served = 3;
  } else if (name === 'ready') {
    game.orders = [
      { id: 1, recipe: byName('Classic Burger'), left: 22, total: 46, flash: 0 },
      { id: 2, recipe: byName('Cheese Melt'), left: 35, total: 46, flash: 0 },
    ];
    game.tray = ['bun', 'patty', 'lettuce'];
    game.grill = [{ state: 'cooking', t: 4.0 }, null];
    game.score = 520;
    game.coins = 52;
    game.combo = 3;
    game.served = 5;
    game.level = 2;
    game.serveFlash = 0.4;
  } else if (name === 'rush') {
    game.orders = [
      { id: 1, recipe: byName('Double Trouble'), left: 7, total: 38, flash: 0.4 },
      { id: 2, recipe: byName('Warung Special'), left: 26, total: 38, flash: 0 },
      { id: 3, recipe: byName('Garden Stack'), left: 33, total: 42, flash: 0 },
    ];
    game.tray = ['bun', 'patty', 'cheese'];
    game.grill = [{ state: 'perfect', t: 6.8 }, { state: 'burnt', t: 9.6 }];
    game.board = [{ ing: 'tomato', chops: 1 }];
    game.score = 1480;
    game.coins = 148;
    game.combo = 4;
    game.served = 11;
    game.level = 3;
    game.shiftLeft = 41;
  }
}

const shot = new URLSearchParams(window.location.search).get('shot');
if (shot) {
  stageShot(shot);
  // Freeze the staged scene's clock a touch so the screenshot is stable.
  game.paused = false;
}

// --- Main loop --------------------------------------------------------------

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  tick(game, dt);
  draw(ctx, game);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
