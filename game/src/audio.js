// Sizzle & Serve — all sounds are synthesized live with WebAudio. No audio files,
// no network: every sizzle, chop, ding and buzz is built from oscillators and noise.

let ctx = null;
let sizzleNodes = null;

function ac() {
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function unlockAudio() {
  ac();
}

function tone(freq, dur, type = 'sine', vol = 0.12, when = 0, slideTo = null) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noiseBurst(dur, vol = 0.15, filterFreq = 1800) {
  const c = ac();
  if (!c) return;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buffer = c.createBuffer(1, len, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  const gain = c.createGain();
  gain.gain.value = vol;
  src.connect(filter).connect(gain).connect(c.destination);
  src.start();
}

export const sfx = {
  click() { tone(660, 0.06, 'triangle', 0.08); },
  plop() { tone(320, 0.09, 'sine', 0.12, 0, 180); },
  chop() { noiseBurst(0.08, 0.2, 900); tone(180, 0.05, 'square', 0.05); },
  grill() { noiseBurst(0.25, 0.1, 3200); },
  ding() { tone(880, 0.18, 'sine', 0.14); tone(1320, 0.3, 'sine', 0.1, 0.08); },
  error() { tone(160, 0.22, 'sawtooth', 0.09, 0, 110); },
  levelUp() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, 'triangle', 0.1, i * 0.09)); },
  gameOver() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.25, 'triangle', 0.1, i * 0.16)); },
  shiftDone() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.22, 'sine', 0.11, i * 0.1)); },
};

export function startSizzle() {
  const c = ac();
  if (!c || sizzleNodes) return;
  const len = c.sampleRate;
  const buffer = c.createBuffer(1, len, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 4000;
  const gain = c.createGain();
  gain.gain.value = 0.02;
  src.connect(filter).connect(gain).connect(c.destination);
  src.start();
  sizzleNodes = { src, gain };
}

export function stopSizzle() {
  if (!sizzleNodes) return;
  try { sizzleNodes.src.stop(); } catch { /* already stopped */ }
  sizzleNodes = null;
}
