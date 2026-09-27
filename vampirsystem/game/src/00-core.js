'use strict';
/* ==========================================================================
   MY VAMPIRE SYSTEM — Kern: Mathe, Farben, Speicherstand, Audio
   ========================================================================== */

const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const dist2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
const easeOut = (t) => 1 - (1 - t) * (1 - t);
const easeIn = (t) => t * t;
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const smooth = (t) => t * t * (3 - 2 * t);
function angDiff(a, b) { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; }

/* deterministischer Zufall (fuer Welt-Chunks und Texturen) */
function mulberry(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash2(x, y, s) {
  let h = (x * 374761393 + y * 668265263 + (s || 0) * 982451653) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

/* Farbhilfen */
function hexRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgba(h, a) { const c = hexRgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
function shade(h, f) {
  const c = hexRgb(h);
  const m = (v) => clamp(Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)), 0, 255);
  return `rgb(${m(c[0])},${m(c[1])},${m(c[2])})`;
}

/* ------------------------------------------------------------ Speicherstand */
const SAVE_KEY = 'mvs.save.v1';
const DEFAULT_SAVE = {
  progress: {},        // missionId -> { done, best }
  quinn: { level: 1, exp: 0, points: 0, stats: { str: 10, agi: 10, sta: 10 }, skills: [], blood: {}, gear: {}, bank: 0, bloodFrom: {} },
  day: { n: 1, night: false, sun: 0, water: false },
  flags: {},
  credits: 10,
  settings: { sfx: 0.8, music: 0.5, shake: 1, easyCombo: false, wideDodge: false }
};
let SAVE = loadSave();
function loadSave() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { s = null; }
  const base = JSON.parse(JSON.stringify(DEFAULT_SAVE));
  if (!s || typeof s !== 'object') return base;
  for (const k in base) {
    if (s[k] === undefined) s[k] = base[k];
    else if (typeof base[k] === 'object' && !Array.isArray(base[k])) for (const kk in base[k]) if (s[k][kk] === undefined) s[k][kk] = base[k][kk];
  }
  return s;
}
function writeSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* privat/gesperrt */ } }
function resetSave() { SAVE = JSON.parse(JSON.stringify(DEFAULT_SAVE)); writeSave(); }

/* ------------------------------------------------------------------ Audio */
const AudioSys = (() => {
  let ac = null, master = null, sfxBus = null, musicBus = null, comp = null;
  let noiseBuf = null;
  const last = {};
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 5;
    master = ac.createGain(); master.gain.value = 0.9;
    sfxBus = ac.createGain(); musicBus = ac.createGain();
    sfxBus.connect(comp); musicBus.connect(master); comp.connect(master); master.connect(ac.destination);
    applyVolumes();
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 1.5, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  function applyVolumes() {
    if (!ac) return;
    sfxBus.gain.value = SAVE.settings.sfx * 0.55;
    musicBus.gain.value = SAVE.settings.music * 0.35;
  }
  function env(g, t, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function tone(type, f0, f1, dur, vol, when, bus) {
    const t = ac.currentTime + (when || 0);
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    env(g, t, 0.006, vol, dur);
    o.connect(g); g.connect(bus || sfxBus); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, fType, f0, f1, q, when) {
    const t = ac.currentTime + (when || 0);
    const s = ac.createBufferSource(); s.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = fType; f.Q.value = q || 1;
    f.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ac.createGain(); env(g, t, 0.004, vol, dur);
    s.connect(f); f.connect(g); g.connect(sfxBus);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }
  /* Soundbibliothek: alles synthetisch, keine Dateien */
  const S = {
    nova() { tone('sine', 120, 38, 0.45, 0.7); noise(0.35, 0.5, 'lowpass', 1400, 200, 0.8); tone('triangle', 260, 90, 0.18, 0.25); },
    bigNova() { tone('sine', 90, 28, 0.9, 0.9); noise(0.8, 0.6, 'lowpass', 900, 90, 0.7); tone('sawtooth', 70, 35, 0.6, 0.15); },
    whip() { noise(0.2, 0.45, 'bandpass', 900, 3500, 2.5); tone('triangle', 420, 160, 0.12, 0.12); },
    sickle() { noise(0.08, 0.12, 'highpass', 4000, 6000, 1); },
    flame() { noise(0.25, 0.22, 'bandpass', 500, 1600, 1.2); tone('sine', 220, 440, 0.2, 0.06); },
    palm() { tone('sine', 180, 60, 0.3, 0.6); noise(0.18, 0.35, 'lowpass', 2500, 300, 1); tone('sine', 880, 870, 0.5, 0.05, 0.02); tone('sine', 1320, 1310, 0.4, 0.03, 0.02); },
    chain() { noise(0.12, 0.25, 'highpass', 3000, 8000, 3); tone('square', 1200, 600, 0.08, 0.05); },
    rift() { tone('sine', 60, 40, 0.8, 0.3); noise(0.7, 0.18, 'lowpass', 400, 120, 2); },
    hit() { noise(0.05, 0.16, 'bandpass', 1800, 900, 1.5); },
    crit() { noise(0.07, 0.25, 'bandpass', 2400, 900, 2); tone('square', 900, 300, 0.07, 0.06); },
    kill() { noise(0.12, 0.18, 'lowpass', 1200, 200, 1); tone('sine', 140, 60, 0.12, 0.15); },
    splat() { noise(0.16, 0.3, 'lowpass', 900, 150, 0.8); tone('sine', 90, 45, 0.18, 0.3); },
    gem(p) { tone('sine', 900 + p * 60, 1300 + p * 60, 0.09, 0.08); },
    heal() { tone('sine', 520, 780, 0.35, 0.12); tone('sine', 780, 1040, 0.35, 0.08, 0.08); },
    hurt() { tone('sawtooth', 160, 70, 0.22, 0.3); noise(0.15, 0.3, 'lowpass', 900, 200, 1); },
    dodge() { noise(0.22, 0.3, 'bandpass', 600, 2400, 1.5); },
    shadowstep() { noise(0.3, 0.3, 'bandpass', 300, 2600, 3); tone('sine', 300, 900, 0.25, 0.08); },
    level() { [0, 4, 7, 12].forEach((s, i) => tone('triangle', 330 * Math.pow(2, s / 12), 330 * Math.pow(2, s / 12), 0.35, 0.12, i * 0.07)); },
    card() { tone('sine', 660, 990, 0.12, 0.1); },
    fusion() { [0, 3, 7, 10, 15].forEach((s, i) => { tone('sawtooth', 220 * Math.pow(2, s / 12), 220 * Math.pow(2, s / 12), 0.8, 0.05, i * 0.09); tone('sine', 440 * Math.pow(2, s / 12), 440 * Math.pow(2, s / 12), 1, 0.08, i * 0.09); }); tone('sine', 60, 30, 1.4, 0.6); },
    reaction(k) { const f = { b: 300, s: 200, q: 700, t: 500 }[k] || 400; tone('triangle', f, f * 2, 0.18, 0.12); noise(0.2, 0.2, 'bandpass', f * 3, f, 2); },
    ult() { tone('sawtooth', 55, 110, 0.8, 0.25); tone('sine', 110, 220, 0.8, 0.3); noise(0.9, 0.4, 'lowpass', 300, 3000, 1); },
    bell() { [1, 2.76, 5.4, 8.93].forEach((m, i) => tone('sine', 98 * m, 98 * m * 0.995, 2.4 - i * 0.4, 0.28 / (i + 1))); },
    roar() { tone('sawtooth', 90, 45, 1.1, 0.3); noise(1.1, 0.4, 'lowpass', 700, 150, 3); },
    stomp() { tone('sine', 70, 25, 0.6, 0.9); noise(0.4, 0.5, 'lowpass', 500, 60, 0.7); },
    enemyShot() { tone('sine', 500, 800, 0.15, 0.05); },
    click() { tone('triangle', 800, 600, 0.05, 0.08); },
    win() { [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => tone('triangle', 262 * Math.pow(2, s / 12), 262 * Math.pow(2, s / 12), 0.9, 0.1, i * 0.12)); },
    lose() { [0, -3, -7, -12].forEach((s, i) => tone('sawtooth', 220 * Math.pow(2, s / 12), 220 * Math.pow(2, s / 12), 0.9, 0.06, i * 0.3)); }
  };
  function play(name, arg, minGap) {
    if (!ac || ac.state !== 'running' || SAVE.settings.sfx <= 0) return;
    const now = ac.currentTime, gap = minGap === undefined ? 0.035 : minGap;
    if (last[name] && now - last[name] < gap) return;
    last[name] = now;
    try { S[name](arg); } catch (e) { /* ignorieren */ }
  }
  /* sehr einfache prozedurale Ambient-Musik: tiefe Flaechen in Moll + ferne Glocke */
  let musicOn = false, musicTimer = 0, chordIdx = 0;
  const CHORDS = [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [-5, -1, 2]];
  function musicTick(dt, intensity) {
    if (!ac || !musicOn || SAVE.settings.music <= 0) return;
    musicTimer -= dt;
    if (musicTimer > 0) return;
    musicTimer = 6;
    const base = 55, ch = CHORDS[chordIdx++ % CHORDS.length];
    const t = ac.currentTime;
    ch.forEach((s) => {
      const f = base * 2 * Math.pow(2, s / 12);
      [f, f * 1.005].forEach((ff) => {
        const o = ac.createOscillator(), g = ac.createGain(), fl = ac.createBiquadFilter();
        o.type = 'sawtooth'; o.frequency.value = ff; fl.type = 'lowpass'; fl.frequency.value = 380 + intensity * 500;
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.05, t + 2); g.gain.linearRampToValueAtTime(0.0001, t + 6.4);
        o.connect(fl); fl.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 6.5);
      });
    });
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = base; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.14, t + 1); g.gain.linearRampToValueAtTime(0.0001, t + 6.2);
    o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 6.3);
    if (intensity > 0.3) { // Herzschlag-Trommel
      for (let i = 0; i < 6; i++) {
        const tt = t + i * 1;
        const k = ac.createOscillator(), kg = ac.createGain();
        k.frequency.setValueAtTime(70, tt); k.frequency.exponentialRampToValueAtTime(35, tt + 0.2);
        kg.gain.setValueAtTime(0.0001, tt); kg.gain.exponentialRampToValueAtTime(0.18 * intensity, tt + 0.01); kg.gain.exponentialRampToValueAtTime(0.0001, tt + 0.25);
        k.connect(kg); kg.connect(musicBus); k.start(tt); k.stop(tt + 0.3);
        const k2 = ac.createOscillator(), kg2 = ac.createGain(), tt2 = tt + 0.22;
        k2.frequency.setValueAtTime(60, tt2); k2.frequency.exponentialRampToValueAtTime(30, tt2 + 0.2);
        kg2.gain.setValueAtTime(0.0001, tt2); kg2.gain.exponentialRampToValueAtTime(0.11 * intensity, tt2 + 0.01); kg2.gain.exponentialRampToValueAtTime(0.0001, tt2 + 0.22);
        k2.connect(kg2); kg2.connect(musicBus); k2.start(tt2); k2.stop(tt2 + 0.3);
      }
    }
  }
  return {
    init, play, applyVolumes, musicTick,
    startMusic() { musicOn = true; musicTimer = 0; },
    stopMusic() { musicOn = false; },
    get ready() { return !!ac; }
  };
})();
const sfx = (n, a, g) => AudioSys.play(n, a, g);
function haptic(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* iOS kann das nicht */ } }


// Faehigkeit vorhanden? Im 3D-Kampftest gelten eigene Faehigkeiten, der Spielstand bleibt unberuehrt.
function hasSkill(id) { return typeof G !== 'undefined' && G && G.opt && G.opt.skills ? G.opt.skills.includes(id) : SAVE.quinn.skills.includes(id); }
