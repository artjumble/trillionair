// Synthesized sound via WebAudio — no asset files. Lazily creates the AudioContext on
// first use (browsers require a user gesture). Everything is a no-op when muted or when
// WebAudio is unavailable, so callers never need to guard.

let ctx = null;
let muted = false;
let curdled = false; // after the dark turn, the cheerful sound sours

export function setMuted(m) {
  muted = !!m;
}
export function isMuted() {
  return muted;
}
export function setCurdled(c) {
  curdled = !!c;
}

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

/** One short enveloped tone. */
function blip(freq, { type = 'triangle', dur = 0.08, gain = 0.05 } = {}) {
  const c = ensureCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = c.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur);
}

/**
 * Coin "cha-ching" on click. Pitch is randomized per click and rises with wealth
 * magnitude (orders of ten), so the soundscape escalates as the number climbs.
 */
export function playClick(magnitude = 0) {
  if (muted) return;
  if (curdled) {
    // Low, detuned, descending — the triumphant "ching" rots into a sour buzz.
    const base = 170 + Math.random() * 16;
    blip(base, { type: 'sawtooth', dur: 0.13, gain: 0.05 });
    setTimeout(() => blip(base * 0.97, { type: 'sawtooth', dur: 0.16, gain: 0.05 }), 60);
    return;
  }
  const base = 620 + Math.min(magnitude, 14) * 28 + (Math.random() * 40 - 20);
  blip(base, { dur: 0.06, gain: 0.045 });
  setTimeout(() => blip(base * 1.5, { dur: 0.08, gain: 0.045 }), 55);
}

/** A short rising arpeggio when you buy something. */
export function playBuy() {
  if (muted) return;
  const base = 300 + Math.random() * 30;
  blip(base, { type: 'square', dur: 0.05, gain: 0.035 });
  setTimeout(() => blip(base * 1.33, { type: 'square', dur: 0.06, gain: 0.035 }), 45);
  setTimeout(() => blip(base * 1.66, { type: 'square', dur: 0.08, gain: 0.035 }), 90);
}
