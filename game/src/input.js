// Sizzle & Serve — mouse and keyboard: every click and keypress routes to the
// station it hit, so the game plays fully with either hand.

import { INGREDIENTS, INGREDIENT_ORDER } from './data.js';
import { LAYOUT } from './render.js';
import {
  takeIngredient, grillClick, boardClick, serveTray, trashTray, startGame,
} from './state.js';
import { sfx, unlockAudio, startSizzle, stopSizzle } from './audio.js';

function inside(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function toGameCoords(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * 1280,
    y: ((clientY - rect.top) / rect.height) * 800,
  };
}

export function attachInput(canvas, g, onScreenChange) {
  const status = document.getElementById('status');

  function announce(msg) {
    if (status) status.textContent = msg;
  }

  function maybeSizzle() {
    const cooking = g.grill.some((s) => s && (s.state === 'cooking' || s.state === 'perfect'));
    if (cooking) startSizzle();
    else stopSizzle();
  }

  function handleClick(clientX, clientY) {
    unlockAudio();
    const { x, y } = toGameCoords(canvas, clientX, clientY);
    if (g.screen === 'title') {
      startGame(g);
      sfx.levelUp();
      announce('Shift started. First orders are on the board.');
      onScreenChange();
      return;
    }
    if (g.screen === 'gameover' || g.screen === 'shiftDone') {
      startGame(g);
      sfx.levelUp();
      onScreenChange();
      return;
    }
    if (g.screen === 'paused') {
      g.screen = 'playing';
      g.paused = false;
      onScreenChange();
      return;
    }
    // Ingredient bins.
    for (const bin of LAYOUT.bins) {
      if (inside(x, y, bin)) {
        const result = takeIngredient(g, bin.id);
        if (result === 'tray') { sfx.plop(); announce(`${INGREDIENTS[bin.id].label} on the plate.`); }
        else if (result === 'grill') { sfx.grill(); announce('Patty on the grill.'); }
        else if (result === 'board') { sfx.click(); announce(`${INGREDIENTS[bin.id].label} on the chopping board.`); }
        else if (result === 'full') sfx.error();
        maybeSizzle();
        return;
      }
    }
    // Grill slots.
    for (let i = 0; i < LAYOUT.grillSlots.length; i++) {
      if (inside(x, y, LAYOUT.grillSlots[i])) {
        const result = grillClick(g, i);
        if (result === 'plated') { sfx.ding(); announce('Perfect patty on the plate.'); }
        else if (result === 'trashed') { sfx.error(); announce('Burnt patty tossed.'); }
        else if (result === 'raw') sfx.error();
        maybeSizzle();
        return;
      }
    }
    // Chopping board slots.
    for (let i = 0; i < LAYOUT.boardSlots.length; i++) {
      if (inside(x, y, LAYOUT.boardSlots[i])) {
        const result = boardClick(g, i);
        if (result === 'plated') { sfx.ding(); announce('Chopped and on the plate.'); }
        else if (result === 'chopped') sfx.chop();
        return;
      }
    }
    // Serve / trash buttons.
    if (inside(x, y, LAYOUT.serveBtn)) {
      if (serveTray(g)) { sfx.ding(); announce('Order served!'); }
      else if (g.tray.length > 0) sfx.error();
      return;
    }
    if (inside(x, y, LAYOUT.trashBtn)) {
      trashTray(g);
      sfx.error();
    }
  }

  function handleKey(event) {
    const key = event.key.toLowerCase();
    if (g.screen === 'title' && (key === 'enter' || key === ' ')) {
      unlockAudio();
      startGame(g);
      sfx.levelUp();
      onScreenChange();
      event.preventDefault();
      return;
    }
    if ((g.screen === 'gameover' || g.screen === 'shiftDone') && (key === 'r' || key === 'enter' || key === ' ')) {
      startGame(g);
      sfx.levelUp();
      onScreenChange();
      event.preventDefault();
      return;
    }
    if (g.screen !== 'playing') return;
    if (key === 'p') {
      g.paused = !g.paused;
      g.screen = g.paused ? 'paused' : 'playing';
      sfx.click();
      onScreenChange();
      return;
    }
    if (g.paused) return;
    if (key === ' ') {
      unlockAudio();
      if (serveTray(g)) { sfx.ding(); announce('Order served!'); }
      else if (g.tray.length > 0) sfx.error();
      event.preventDefault();
      return;
    }
    if (key === 't') { trashTray(g); sfx.error(); return; }
    if (key === 'm') { g.muted = !g.muted; return; }
    const ingId = INGREDIENT_ORDER.find((id) => INGREDIENTS[id].key === key);
    if (ingId) {
      unlockAudio();
      const result = takeIngredient(g, ingId);
      if (result === 'tray') sfx.plop();
      else if (result === 'grill') sfx.grill();
      else if (result === 'board') sfx.click();
      else if (result === 'full') sfx.error();
      maybeSizzle();
    }
  }

  canvas.addEventListener('pointerdown', (e) => handleClick(e.clientX, e.clientY));
  window.addEventListener('keydown', handleKey);
}
