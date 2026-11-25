// Sizzle & Serve — every pixel is drawn here on one canvas: the kitchen, the order
// board, the grill, the chopping board, the plate, and every ingredient icon.
// No images are loaded; the art is all canvas paths, so the game needs no files.

import { INGREDIENTS, INGREDIENT_ORDER, GRILL_COOK_SECONDS, GRILL_BURN_SECONDS, MAX_HEARTS } from './data.js';

export const W = 1280;
export const H = 800;

// Layout: where each station lives on the 1280x800 board.
export const LAYOUT = {
  bins: INGREDIENT_ORDER.map((id, i) => ({ id, x: 24 + i * 208, y: 616, w: 192, h: 118 })),
  grillSlots: [{ x: 48, y: 300, w: 160, h: 120 }, { x: 228, y: 300, w: 160, h: 120 }],
  boardSlots: [{ x: 452, y: 300, w: 140, h: 120 }, { x: 612, y: 300, w: 140, h: 120 }],
  plate: { x: 800, y: 240, w: 456, h: 260 },
  serveBtn: { x: 812, y: 516, w: 210, h: 64 },
  trashBtn: { x: 1038, y: 516, w: 206, h: 64 },
  tickets: [0, 1, 2].map((i) => ({ x: 24 + i * 420, y: 84, w: 404, h: 112 })),
};

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, weight = '700', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}

function shadow(ctx, x, y, w, h, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  rr(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.restore();
}

// --- Ingredient icons -----------------------------------------------------

export function drawIngredient(ctx, id, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'bun') {
    ctx.fillStyle = '#e89b3c';
    ctx.beginPath(); ctx.arc(0, s * 0.08, s * 0.52, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f2b25c';
    ctx.beginPath(); ctx.arc(0, s * 0.08, s * 0.46, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff3d6';
    for (const [dx, dy] of [[-0.22, -0.22], [0.05, -0.32], [0.26, -0.16]]) {
      ctx.beginPath(); ctx.ellipse(dx * s, dy * s, s * 0.05, s * 0.03, 0.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#e89b3c';
    rr(ctx, -s * 0.52, s * 0.06, s * 1.04, s * 0.16, s * 0.07); ctx.fill();
  } else if (id === 'patty') {
    ctx.fillStyle = '#6e4525';
    rr(ctx, -s * 0.52, -s * 0.14, s * 1.04, s * 0.3, s * 0.14); ctx.fill();
    ctx.fillStyle = '#8a5a33';
    rr(ctx, -s * 0.48, -s * 0.18, s * 0.96, s * 0.26, s * 0.12); ctx.fill();
    ctx.fillStyle = '#5d3a1e';
    for (const [dx, dy] of [[-0.3, -0.05], [0.1, -0.08], [0.32, 0.02]]) {
      ctx.beginPath(); ctx.arc(dx * s, dy * s, s * 0.04, 0, Math.PI * 2); ctx.fill();
    }
  } else if (id === 'lettuce') {
    ctx.fillStyle = '#5aa832';
    for (const a of [-0.5, 0, 0.5]) {
      ctx.beginPath(); ctx.arc(Math.sin(a) * s * 0.3, Math.cos(a) * s * 0.08, s * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#7dc242';
    ctx.beginPath(); ctx.arc(0, 0, s * 0.34, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#a8e063';
    ctx.lineWidth = s * 0.04;
    ctx.beginPath(); ctx.moveTo(-s * 0.25, 0); ctx.quadraticCurveTo(0, s * 0.18, s * 0.25, 0); ctx.stroke();
  } else if (id === 'tomato') {
    ctx.fillStyle = '#c93338';
    ctx.beginPath(); ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e5484d';
    ctx.beginPath(); ctx.arc(0, 0, s * 0.44, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff8a80';
    ctx.beginPath(); ctx.arc(-s * 0.12, -s * 0.12, s * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7dc242';
    ctx.beginPath(); ctx.arc(0, -s * 0.42, s * 0.1, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'cheese') {
    ctx.fillStyle = '#f5a623';
    ctx.beginPath(); ctx.moveTo(-s * 0.5, s * 0.3); ctx.lineTo(s * 0.5, s * 0.3); ctx.lineTo(s * 0.5, -s * 0.3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffc93c';
    ctx.beginPath(); ctx.moveTo(-s * 0.44, s * 0.24); ctx.lineTo(s * 0.44, s * 0.24); ctx.lineTo(s * 0.44, -s * 0.22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f5a623';
    ctx.beginPath(); ctx.arc(0.1 * s, 0.05 * s, s * 0.06, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'sauce') {
    ctx.strokeStyle = '#ff8c42';
    ctx.lineWidth = s * 0.16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 0.45, -s * 0.1);
    ctx.bezierCurveTo(-s * 0.2, -s * 0.4, s * 0.1, s * 0.3, s * 0.45, -s * 0.05);
    ctx.stroke();
    ctx.fillStyle = '#ff6b1a';
    ctx.beginPath(); ctx.arc(s * 0.45, -s * 0.05, s * 0.09, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// --- Kitchen chrome ---------------------------------------------------------

function drawTopBar(ctx, g) {
  ctx.fillStyle = '#3a2418';
  ctx.fillRect(0, 0, W, 64);
  text(ctx, '🍳 SIZZLE & SERVE', 24, 42, 28, '#ffd94d');
  text(ctx, 'Warung Kitchen Rush', 330, 40, 15, '#e8c9a0', '600');
  text(ctx, `SCORE ${g.score}`, 560, 42, 24, '#ffffff', '800');
  text(ctx, `🪙 ${g.coins}`, 760, 42, 22, '#ffd94d', '800');
  if (g.combo >= 2) text(ctx, `COMBO x${g.combo}`, 860, 42, 22, '#ff8c42', '800');
  // Hearts
  for (let i = 0; i < MAX_HEARTS; i++) {
    const x = 990 + i * 34;
    ctx.fillStyle = i < g.hearts ? '#ff5b6a' : '#5a3a30';
    ctx.beginPath();
    ctx.arc(x, 30, 11, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 11, 30, 11, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 9, 34); ctx.lineTo(x + 22, 34); ctx.lineTo(x + 6, 52); ctx.closePath(); ctx.fill();
  }
  text(ctx, `LVL ${g.level}`, 1100, 42, 20, '#7dc242', '800');
  const mm = Math.floor(g.shiftLeft / 60);
  const ss = String(Math.floor(g.shiftLeft % 60)).padStart(2, '0');
  text(ctx, `⏱ ${mm}:${ss}`, 1256, 42, 20, g.shiftLeft < 30 ? '#ff5b6a' : '#ffffff', '800', 'right');
}

function drawTicket(ctx, slot, order) {
  const { x, y, w, h } = slot;
  if (!order) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#4a3226';
    rr(ctx, x, y, w, h, 14); ctx.fill();
    ctx.strokeStyle = '#6b4a35';
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    rr(ctx, x, y, w, h, 14); ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, 'waiting for the next order…', x + w / 2, y + h / 2 + 6, 16, '#c9a586', '600', 'center');
    ctx.restore();
    return;
  }
  const urgent = order.left < 8 && Math.floor(order.flash * 4) % 2 === 0;
  ctx.fillStyle = urgent ? '#5c2a20' : '#fff8ec';
  rr(ctx, x, y, w, h, 14); ctx.fill();
  ctx.strokeStyle = urgent ? '#ff5b6a' : '#d9b380';
  ctx.lineWidth = 3;
  rr(ctx, x, y, w, h, 14); ctx.stroke();
  text(ctx, `#${order.id}  ${order.recipe.name.toUpperCase()}`, x + 16, y + 30, 19, '#3a2418', '800');
  text(ctx, `${Math.ceil(order.left)}s`, x + w - 16, y + 30, 19, order.left < 8 ? '#e5484d' : '#3a2418', '800', 'right');
  // Needed ingredients.
  order.recipe.needs.forEach((id, i) => {
    const ix = x + 34 + i * 52;
    ctx.fillStyle = '#f3e2c7';
    ctx.beginPath(); ctx.arc(ix, y + 68, 22, 0, Math.PI * 2); ctx.fill();
    drawIngredient(ctx, id, ix, y + 68, 30);
  });
  // Patience bar.
  const frac = Math.max(0, order.left / order.total);
  ctx.fillStyle = '#e5d3b3';
  rr(ctx, x + 16, y + h - 18, w - 32, 9, 4); ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#7dc242' : frac > 0.25 ? '#ffc93c' : '#e5484d';
  rr(ctx, x + 16, y + h - 18, (w - 32) * frac, 9, 4); ctx.fill();
}

function drawOrderBoard(ctx, g) {
  ctx.fillStyle = '#241610';
  ctx.fillRect(0, 64, W, 136);
  text(ctx, 'ORDER BOARD', 24, 78, 13, '#c9a586', '800');
  text(ctx, 'serve the dish exactly as ordered — fast service earns a time bonus', 160, 78, 13, '#8a6a52', '600');
  LAYOUT.tickets.forEach((slot, i) => drawTicket(ctx, slot, g.orders[i] || null));
}

function drawGrill(ctx, g) {
  text(ctx, 'GRILL  (click a patty to pull it off)', 48, 240, 15, '#e8c9a0', '800');
  LAYOUT.grillSlots.forEach((slot, i) => {
    const patty = g.grill[i];
    ctx.fillStyle = '#1d1a18';
    rr(ctx, slot.x, slot.y, slot.w, slot.h, 12); ctx.fill();
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 3;
    for (let k = 1; k < 5; k++) {
      ctx.beginPath(); ctx.moveTo(slot.x + 12, slot.y + (slot.h / 5) * k); ctx.lineTo(slot.x + slot.w - 12, slot.y + (slot.h / 5) * k); ctx.stroke();
    }
    if (patty) {
      const cx = slot.x + slot.w / 2;
      const cy = slot.y + slot.h / 2 - 6;
      // Patty colour by doneness.
      ctx.save();
      ctx.translate(cx, cy);
      const col = patty.state === 'burnt' ? '#17120f' : patty.state === 'perfect' ? '#a06a35' : patty.state === 'cooking' ? '#8a5a33' : '#c98a7a';
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(0, 0, 52, 30, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath(); ctx.ellipse(-8, -8, 30, 14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      if (patty.state === 'perfect') {
        ctx.fillStyle = '#ffd94d';
        ctx.font = '800 13px "Trebuchet MS", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★ PERFECT — PULL IT!', cx, slot.y + slot.h - 10);
      } else if (patty.state === 'burnt') {
        ctx.fillStyle = '#ff8a80';
        ctx.font = '800 13px "Trebuchet MS", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BURNT — click to toss', cx, slot.y + slot.h - 10);
      } else {
        const frac = Math.min(1, patty.t / GRILL_COOK_SECONDS);
        ctx.fillStyle = '#3a3a3a';
        rr(ctx, slot.x + 16, slot.y + slot.h - 14, slot.w - 32, 7, 3); ctx.fill();
        ctx.fillStyle = '#ff8c42';
        rr(ctx, slot.x + 16, slot.y + slot.h - 14, (slot.w - 32) * frac, 7, 3); ctx.fill();
      }
      // Sizzle wisps while cooking.
      if (patty.state === 'cooking' || patty.state === 'perfect') {
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 3;
        const wob = Math.sin(g.time * 6 + i * 2) * 4;
        ctx.beginPath(); ctx.moveTo(cx - 20 + wob, slot.y + 18); ctx.quadraticCurveTo(cx - 26 + wob, slot.y - 2, cx - 18 + wob, slot.y - 12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 18 - wob, slot.y + 18); ctx.quadraticCurveTo(cx + 24 - wob, slot.y - 2, cx + 16 - wob, slot.y - 12); ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#6b6b6b';
      ctx.font = '600 13px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('empty · press 2', slot.x + slot.w / 2, slot.y + slot.h / 2 + 5);
    }
  });
}

function drawBoard(ctx, g) {
  text(ctx, 'CHOPPING BOARD  (click twice to chop)', 452, 240, 15, '#e8c9a0', '800');
  // Wooden board.
  ctx.fillStyle = '#b07a45';
  rr(ctx, 440, 252, 330, 190, 16); ctx.fill();
  ctx.fillStyle = '#c98f52';
  rr(ctx, 452, 264, 306, 166, 12); ctx.fill();
  LAYOUT.boardSlots.forEach((slot, i) => {
    const item = g.board[i];
    if (!item) return;
    const cx = slot.x + slot.w / 2;
    const cy = slot.y + slot.h / 2;
    drawIngredient(ctx, item.ing, cx, cy - 8, 64);
    const frac = item.chops / 2;
    ctx.fillStyle = '#3a2418';
    rr(ctx, slot.x + 10, slot.y + slot.h - 16, slot.w - 20, 8, 4); ctx.fill();
    ctx.fillStyle = '#7dc242';
    rr(ctx, slot.x + 10, slot.y + slot.h - 16, (slot.w - 20) * frac, 8, 4); ctx.fill();
    text(ctx, `${item.chops}/2 chops`, cx, slot.y + slot.h + 2, 12, '#e8c9a0', '700', 'center');
  });
  if (g.board.length === 0) {
    ctx.fillStyle = '#7a5230';
    ctx.font = '600 14px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('press 3 for lettuce, 4 for tomato', 605, 350);
  }
}

function drawPlate(ctx, g) {
  const p = LAYOUT.plate;
  text(ctx, 'ASSEMBLY PLATE', p.x, 240, 15, '#e8c9a0', '800');
  const shake = g.trayFlash > 0 ? Math.sin(g.time * 40) * 6 * g.trayFlash : 0;
  ctx.save();
  ctx.translate(shake, 0);
  // Plate.
  ctx.fillStyle = '#f5f0e6';
  ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + 150, 200, 78, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#d9cdb4';
  ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + 150, 160, 58, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fffdf6';
  ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + 148, 150, 52, 0, 0, Math.PI * 2); ctx.fill();
  // Stacked ingredients on the plate.
  const cx = p.x + p.w / 2;
  let cy = p.y + 168;
  g.tray.forEach((id) => {
    drawIngredient(ctx, id, cx, cy, 54);
    cy -= 20;
  });
  if (g.tray.length === 0) {
    ctx.fillStyle = '#9a8a76';
    ctx.font = '600 15px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('build the dish here', cx, p.y + 152);
  }
  ctx.restore();
  // Serve + trash buttons.
  const s = LAYOUT.serveBtn;
  const ready = g.tray.length > 0;
  const glow = ready && g.serveFlash <= 0;
  ctx.save();
  if (glow) { ctx.shadowColor = '#7dc242'; ctx.shadowBlur = 18; }
  ctx.fillStyle = ready ? '#5aa832' : '#6b5a4a';
  rr(ctx, s.x, s.y, s.w, s.h, 14); ctx.fill();
  ctx.restore();
  text(ctx, 'SERVE  ⏎', s.x + s.w / 2, s.y + 40, 24, '#ffffff', '800', 'center');
  const t = LAYOUT.trashBtn;
  ctx.fillStyle = '#8a3a30';
  rr(ctx, t.x, t.y, t.w, t.h, 14); ctx.fill();
  text(ctx, 'TRASH  (T)', t.x + t.w / 2, t.y + 40, 20, '#ffffff', '800', 'center');
  if (g.serveFlash > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, g.serveFlash * 2);
    text(ctx, 'SERVED!', cx, p.y + 30, 34, '#ffd94d', '800', 'center');
    ctx.restore();
  }
}

function drawBins(ctx, g) {
  text(ctx, 'INGREDIENT COUNTER — click a bin or press its number key', 24, 606, 15, '#e8c9a0', '800');
  LAYOUT.bins.forEach((bin) => {
    const ing = INGREDIENTS[bin.id];
    ctx.fillStyle = '#4a3226';
    rr(ctx, bin.x, bin.y, bin.w, bin.h, 14); ctx.fill();
    ctx.strokeStyle = '#8a6a52';
    ctx.lineWidth = 2;
    rr(ctx, bin.x, bin.y, bin.w, bin.h, 14); ctx.stroke();
    drawIngredient(ctx, bin.id, bin.x + bin.w / 2, bin.y + 44, 52);
    text(ctx, ing.label, bin.x + bin.w / 2, bin.y + 96, 17, '#ffffff', '800', 'center');
    // Key hint badge.
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath(); ctx.arc(bin.x + bin.w - 18, bin.y + 18, 13, 0, Math.PI * 2); ctx.fill();
    text(ctx, ing.key, bin.x + bin.w - 18, bin.y + 23, 15, '#3a2418', '800', 'center');
  });
}

function drawKitchen(ctx, g) {
  // Warm tiled wall + counter.
  ctx.fillStyle = '#f7e8d0';
  ctx.fillRect(0, 200, W, 8);
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(0, 200, W, 400);
  ctx.fillStyle = '#a06a42';
  ctx.fillRect(0, 200, W, 14);
  // Wall tiles above the counter.
  ctx.fillStyle = '#f3e2c7';
  for (let x = 0; x < W; x += 64) {
    ctx.fillRect(x, 208, 60, 26);
  }
  // Hanging lamps.
  for (const x of [200, 640, 1080]) {
    ctx.strokeStyle = '#3a2418';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x, 208); ctx.lineTo(x, 226); ctx.stroke();
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath(); ctx.arc(x, 234, 12, 0, Math.PI * 2); ctx.fill();
  }
  drawGrill(ctx, g);
  drawBoard(ctx, g);
  drawPlate(ctx, g);
  drawBins(ctx, g);
  // Floating score popups.
  for (const f of g.floating) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - f.t / f.life);
    text(ctx, f.text, f.x, f.y - f.t * 40, 26, f.color, '800', 'center');
    ctx.restore();
  }
  // Toast banner.
  if (g.toastT > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, g.toastT);
    ctx.fillStyle = 'rgba(30,16,8,0.9)';
    const tw = ctx.measureText(g.toast).width + 60;
    rr(ctx, (W - 460) / 2, 566, 460, 40, 12); ctx.fill();
    text(ctx, g.toast, W / 2, 593, 17, '#ffd94d', '700', 'center');
    ctx.restore();
  }
  // Bottom hints.
  ctx.fillStyle = '#241610';
  ctx.fillRect(0, 748, W, 52);
  text(ctx, '1–6 ingredients   •   SPACE serve   •   T trash tray   •   P pause   •   R restart   •   M mute', W / 2, 780, 15, '#c9a586', '600', 'center');
}

function overlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(20,10,5,0.82)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, title, W / 2, 300, 54, accent, '800', 'center');
  lines.forEach((line, i) => text(ctx, line, W / 2, 360 + i * 36, 22, '#f3e2c7', '600', 'center'));
}

export function drawTitle(ctx, g) {
  drawOrderBoard(ctx, g);
  drawKitchen(ctx, g);
  ctx.fillStyle = 'rgba(20,10,5,0.72)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, '🍳', W / 2, 210, 80, '#ffd94d', '800', 'center');
  text(ctx, 'SIZZLE & SERVE', W / 2, 300, 64, '#ffd94d', '800', 'center');
  text(ctx, 'Warung Kitchen Rush', W / 2, 350, 28, '#ffffff', '700', 'center');
  text(ctx, 'Orders fly in. Grill the patty, chop the veg, stack the dish,', W / 2, 420, 22, '#f3e2c7', '600', 'center');
  text(ctx, 'and serve it before the customer walks out. Three strikes and the shift ends.', W / 2, 452, 22, '#f3e2c7', '600', 'center');
  text(ctx, 'CLICK or press ENTER to start your shift', W / 2, 540, 24, '#7dc242', '800', 'center');
  text(ctx, 'Mouse + keyboard  •  1–6 ingredients  •  SPACE to serve', W / 2, 580, 17, '#c9a586', '600', 'center');
}

export function draw(ctx, g) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#241610';
  ctx.fillRect(0, 0, W, H);
  if (g.screen === 'title') {
    drawTitle(ctx, g);
    return;
  }
  drawTopBar(ctx, g);
  drawOrderBoard(ctx, g);
  drawKitchen(ctx, g);
  if (g.screen === 'paused') {
    overlay(ctx, 'PAUSED', ['Take a breath, chef.', 'Press P or click to get back to the pass.'], '#ffd94d');
  } else if (g.screen === 'gameover') {
    overlay(ctx, 'SHIFT OVER', [
      `Three customers walked out. Final score: ${g.score}`,
      `Dishes served: ${g.served}   •   Best combo: x${g.bestCombo}   •   Coins earned: ${g.coins}`,
      'Press R or click to run another shift.',
    ], '#ff5b6a');
  } else if (g.screen === 'shiftDone') {
    overlay(ctx, 'SHIFT COMPLETE!', [
      `What a service! Final score: ${g.score}`,
      `Dishes served: ${g.served}   •   Best combo: x${g.bestCombo}   •   Coins earned: ${g.coins}`,
      'Press R or click to cook another shift.',
    ], '#7dc242');
  }
}
