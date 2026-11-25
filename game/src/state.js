// Sizzle & Serve — game state: orders, grill, chopping board, tray, score and shift clock.
// Pure state and rules; drawing lives in render.js, input in input.js.

import {
  INGREDIENT_ORDER, RECIPES, recipesForLevel, levelForServed,
  orderPatienceSeconds, spawnIntervalSeconds, SHIFT_SECONDS,
  MAX_HEARTS, MAX_ORDERS, GRILL_COOK_SECONDS, GRILL_BURN_SECONDS, CHOPS_NEEDED,
} from './data.js';

export function createGame() {
  return {
    screen: 'title', // title | playing | paused | gameover | shiftDone
    time: 0,
    score: 0,
    coins: 0,
    served: 0,
    combo: 0,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    level: 1,
    shiftLeft: SHIFT_SECONDS,
    orders: [], // {id, recipe, left, total, flash}
    nextOrderId: 1,
    spawnIn: 6,
    grill: [null, null], // {state:'raw'|'cooking'|'perfect'|'burnt', t} per slot
    board: [], // chopping items {ing, chops}
    tray: [], // ingredient ids on the assembly plate, in stack order
    trayFlash: 0, // >0 while the tray shakes after a wrong serve
    serveFlash: 0, // >0 right after a successful serve
    floating: [], // {x,y,text,color,t,life}
    toast: '', toastT: 0,
    muted: false,
    paused: false,
    rngSeed: (Date.now() % 2147483647) || 1,
  };
}

function rand(g) {
  // Small deterministic-ish PRNG so replays feel fair; seeded per game.
  g.rngSeed = (g.rngSeed * 48271) % 2147483647;
  return g.rngSeed / 2147483647;
}

export function pickRecipe(g) {
  const pool = recipesForLevel(g.level);
  return pool[Math.floor(rand(g) * pool.length)];
}

export function spawnOrder(g) {
  if (g.orders.length >= MAX_ORDERS) return;
  const recipe = pickRecipe(g);
  const total = orderPatienceSeconds(g.level);
  g.orders.push({ id: g.nextOrderId++, recipe, left: total, total, flash: 0 });
}

function countsOf(list) {
  const c = {};
  for (const id of list) c[id] = (c[id] || 0) + 1;
  return c;
}

// The tray matches an order when it holds exactly the recipe's ingredients.
export function matchingOrder(g) {
  const tray = countsOf(g.tray);
  for (const order of g.orders) {
    const need = countsOf(order.recipe.needs);
    const keys = new Set([...Object.keys(tray), ...Object.keys(need)]);
    let ok = true;
    for (const k of keys) if ((tray[k] || 0) !== (need[k] || 0)) { ok = false; break; }
    if (ok) return order;
  }
  return null;
}

export function addFloat(g, x, y, text, color) {
  g.floating.push({ x, y, text, color, t: 0, life: 1.1 });
}

export function addToast(g, text) {
  g.toast = text;
  g.toastT = 2.2;
}

export function startGame(g) {
  const fresh = createGame();
  fresh.screen = 'playing';
  fresh.rngSeed = g.rngSeed;
  Object.assign(g, fresh);
  spawnOrder(g);
  spawnOrder(g);
}

export function serveTray(g) {
  if (g.screen !== 'playing' || g.tray.length === 0) return false;
  const order = matchingOrder(g);
  if (!order) {
    g.combo = 0;
    g.trayFlash = 0.5;
    addToast(g, 'That is not what anyone ordered!');
    return false;
  }
  const timeBonus = Math.round(order.left) * 5;
  const comboBonus = g.combo * 25;
  const gained = order.recipe.base + timeBonus + comboBonus;
  g.score += gained;
  g.coins += Math.round(gained / 10);
  g.served += 1;
  g.combo += 1;
  g.bestCombo = Math.max(g.bestCombo, g.combo);
  g.level = levelForServed(g.served);
  g.orders = g.orders.filter((o) => o.id !== order.id);
  g.tray = [];
  g.serveFlash = 0.6;
  addFloat(g, 1010, 330, `+${gained}`, '#ffd94d');
  if (g.combo >= 2) addFloat(g, 1010, 360, `COMBO x${g.combo}`, '#ff8c42');
  return true;
}

export function trashTray(g) {
  if (g.tray.length === 0 && g.board.length === 0) return;
  g.tray = [];
  g.board = [];
  g.combo = 0;
  addToast(g, 'Tray cleared — start the dish again.');
}

export function tick(g, dt) {
  if (g.screen !== 'playing' || g.paused) return;
  g.time += dt;
  g.shiftLeft -= dt;
  if (g.trayFlash > 0) g.trayFlash -= dt;
  if (g.serveFlash > 0) g.serveFlash -= dt;
  if (g.toastT > 0) g.toastT -= dt;
  for (const f of g.floating) f.t += dt;
  g.floating = g.floating.filter((f) => f.t < f.life);

  // Grill: raw -> cooking -> perfect -> burnt.
  for (const slot of g.grill) {
    if (!slot) continue;
    slot.t += dt;
    if (slot.state === 'raw' && slot.t > 0.4) slot.state = 'cooking';
    if (slot.state === 'cooking' && slot.t >= GRILL_COOK_SECONDS) slot.state = 'perfect';
    if (slot.state === 'perfect' && slot.t >= GRILL_BURN_SECONDS) slot.state = 'burnt';
  }

  // Orders: patience drains; an expired order costs a heart.
  for (const order of g.orders) {
    order.left -= dt;
    if (order.left < 8) order.flash += dt;
  }
  const expired = g.orders.filter((o) => o.left <= 0);
  if (expired.length > 0) {
    g.orders = g.orders.filter((o) => o.left > 0);
    g.hearts -= expired.length;
    g.combo = 0;
    addToast(g, expired.length > 1 ? `${expired.length} orders walked out!` : 'An order walked out — too slow!');
    if (g.hearts <= 0) {
      g.hearts = 0;
      g.screen = 'gameover';
      return;
    }
  }

  // New orders keep arriving while the shift runs.
  g.spawnIn -= dt;
  if (g.spawnIn <= 0) {
    spawnOrder(g);
    g.spawnIn = spawnIntervalSeconds(g.level);
  }

  if (g.shiftLeft <= 0) {
    g.shiftLeft = 0;
    g.screen = 'shiftDone';
  }
}

// --- Player actions -------------------------------------------------------

export function takeIngredient(g, ingId) {
  if (g.screen !== 'playing' || g.paused) return null;
  if (ingId === 'patty') {
    const slot = g.grill.findIndex((s) => s === null);
    if (slot === -1) { addToast(g, 'Grill is full — pull a patty first!'); return 'full'; }
    g.grill[slot] = { state: 'raw', t: 0 };
    return 'grill';
  }
  if (ingId === 'lettuce' || ingId === 'tomato') {
    if (g.board.length >= 2) { addToast(g, 'Chopping board is full!'); return 'full'; }
    g.board.push({ ing: ingId, chops: 0 });
    return 'board';
  }
  // Bun, cheese and sauce go straight onto the plate.
  g.tray.push(ingId);
  return 'tray';
}

export function grillClick(g, slotIndex) {
  if (g.screen !== 'playing' || g.paused) return null;
  const slot = g.grill[slotIndex];
  if (!slot) return null;
  if (slot.state === 'burnt') {
    g.grill[slotIndex] = null;
    addToast(g, 'Burnt patty tossed.');
    return 'trashed';
  }
  if (slot.state === 'perfect') {
    g.grill[slotIndex] = null;
    g.tray.push('patty');
    return 'plated';
  }
  // Still cooking: tapping early pulls a raw patty off the grill.
  if (slot.t < 1.5) {
    g.grill[slotIndex] = null;
    addToast(g, 'Too soon — that patty was still raw.');
    return 'raw';
  }
  return 'cooking';
}

export function boardClick(g, boardIndex) {
  if (g.screen !== 'playing' || g.paused) return null;
  const item = g.board[boardIndex];
  if (!item) return null;
  item.chops += 1;
  if (item.chops >= CHOPS_NEEDED) {
    g.board.splice(boardIndex, 1);
    g.tray.push(item.ing);
    return 'plated';
  }
  return 'chopped';
}

export { INGREDIENT_ORDER, RECIPES };
