'use strict';
/* ==========================================================================
   WELT — mehrere Schauplaetze (Themen): der Aschefriedhof (Arcade) und die
   Kapitel-Welten des Story-Modus. Jedes Thema hat eigenen kachelbaren Boden,
   eigene Requisiten, eigenes Umgebungslicht und eigenen Nebel.
   Alles wird beim ersten Betreten eines Themas erzeugt und zwischengespeichert.
   ========================================================================== */

const WORLD = { groundTile: null, tileSize: 512, props: {}, fog: null, patches: [], theme: null, ambient: 'rgb(116,110,150)', cache: {} };

const THEMES = {
  friedhof: {
    name: 'Aschefriedhof von Varn', ambient: 'rgb(116,110,150)', fog: [150, 160, 200], fogA: 1,
    ground: { base: [34, 30, 36], vary: [18, 14, 14], moss: [30, 46, 34], mossVar: [12, 16, 8], detail: 'grass', grass: ['#3c5a34', '#50683a', '#2a3e2a'], pebble: [60, 56, 66], leaves: ['#5a3a24', '#6a4222', '#4a2c1c', '#7a4a20', '#3a2418'], cracks: 'rgba(8,6,10,0.55)' },
    patches: ['flag', 'moss', 'puddle', 'ash'],
    props: [['grave', 10], ['cross', 3], ['tree', 3], ['lantern', 1.3], ['candles', 1.6], ['shrooms', 2], ['bones', 3], ['pillar', 1.5], ['fence', 1.4], ['coffin', 0.7]],
    cluster: 'grave'
  },
  akademie: {
    name: 'Militärakademie — Übungsgelände', ambient: 'rgb(118,124,152)', fog: [150, 170, 200], fogA: 0.7,
    ground: { base: [58, 60, 66], vary: [14, 14, 16], moss: [40, 56, 40], mossVar: [10, 14, 8], mossAmt: 0.5, detail: 'concrete', grass: ['#4a6a3a', '#5a7a44', '#3a5230'], pebble: [80, 80, 86], leaves: null, cracks: 'rgba(20,20,26,0.6)' },
    patches: ['moss', 'puddle', 'marking'],
    props: [['barrier', 5], ['crate', 4], ['lamp', 1.4], ['dummy', 2], ['fence', 1.5], ['rock', 2]],
    cluster: 'barrier'
  },
  bestienplanet: {
    name: 'Bestien-Planet', ambient: 'rgb(104,92,136)', fog: [170, 130, 220], fogA: 0.7,
    ground: { base: [30, 34, 44], vary: [10, 16, 18], moss: [34, 70, 64], mossVar: [14, 30, 26], detail: 'grass', grass: ['#6a3a8a', '#3a8a7a', '#8a4aa0', '#2a6a64'], pebble: [70, 60, 90], leaves: ['#8a3a9a', '#2a8a8a', '#5a2a7a'], cracks: 'rgba(10,6,20,0.5)' },
    patches: ['spore', 'moss', 'puddle'],
    props: [['alienplant', 5], ['crystal', 2.5], ['rock', 3], ['bones', 1.5], ['shrooms', 2.5]],
    cluster: 'alienplant'
  },
  schlachtfeld: {
    name: 'Schlachtfeld des Dalki-Kriegs', ambient: 'rgb(124,100,100)', fog: [190, 150, 130], fogA: 0.6,
    ground: { base: [46, 38, 34], vary: [18, 12, 10], moss: [26, 22, 22], mossVar: [10, 8, 8], detail: 'scorched', grass: ['#4a4430', '#3a3424'], pebble: [74, 66, 62], leaves: null, cracks: 'rgba(10,6,4,0.6)' },
    patches: ['crater', 'ash', 'crater'],
    props: [['wreck', 3], ['spikes', 3], ['barrier', 2.5], ['brazier', 1.2], ['rock', 2.5], ['bones', 2]],
    cluster: 'spikes'
  },
  siedlung: {
    name: 'Die Vampir-Siedlung', ambient: 'rgb(114,92,116)', fog: [180, 110, 130], fogA: 1,
    ground: { base: [40, 30, 34], vary: [12, 8, 10], moss: [30, 22, 26], mossVar: [6, 4, 6], detail: 'tiles', tile: [70, 46, 52], grass: ['#3a2a30'], pebble: [70, 56, 62], leaves: ['#5a1a24', '#3a1018'], cracks: 'rgba(10,4,6,0.5)' },
    patches: ['flag', 'blood'],
    props: [['banner', 3], ['pillar', 2.5], ['brazier', 2], ['candles', 2], ['fence', 1.5], ['coffin', 1]],
    cluster: 'pillar'
  },
  ruinen: {
    name: 'Die brennenden Ruinen', ambient: 'rgb(126,96,86)', fog: [200, 140, 110], fogA: 1,
    ground: { base: [36, 30, 30], vary: [14, 10, 10], moss: [22, 18, 18], mossVar: [6, 5, 5], detail: 'tiles', tile: [60, 52, 54], grass: ['#3a302a'], pebble: [66, 58, 56], leaves: null, cracks: 'rgba(8,4,2,0.6)', glowCracks: '#ff6a1a' },
    patches: ['crater', 'ash', 'blood'],
    props: [['wreck', 2.5], ['pillar', 3], ['spikes', 2], ['brazier', 2], ['banner', 1.2], ['rock', 2]],
    cluster: 'pillar'
  },
  himmel: {
    name: 'Die Himmelsebene', ambient: 'rgb(168,162,184)', fog: [240, 235, 255], fogA: 1.2,
    ground: { base: [120, 116, 128], vary: [16, 16, 18], moss: [150, 140, 120], mossVar: [10, 10, 8], mossAmt: 0.4, detail: 'marble', tile: [170, 166, 176], gold: '#c9a24c', grass: ['#d8d0b0'], pebble: [180, 176, 186], leaves: null, cracks: 'rgba(80,70,90,0.35)' },
    patches: ['gold', 'cloud'],
    props: [['marble', 4], ['goldcrystal', 2.5], ['goldbrazier', 1.5], ['rock', 1]],
    cluster: 'marble'
  },
  basisnacht: {
    name: 'Militärbasis 2 — nach der Sperrstunde', ambient: 'rgb(92,98,138)', fog: [110, 130, 190], fogA: 0.9,
    ground: { base: [48, 50, 58], vary: [12, 12, 14], moss: [34, 46, 36], mossVar: [8, 12, 8], mossAmt: 0.35, detail: 'concrete', grass: ['#3a5a3a', '#4a6a40'], pebble: [70, 70, 78], leaves: null, cracks: 'rgba(14,14,22,0.6)' },
    patches: ['puddle', 'marking', 'blood'],
    props: [['barrier', 4], ['crate', 5], ['lamp', 1.8], ['fence', 2], ['wreck', 0.8], ['rock', 1.5]],
    cluster: 'crate'
  },
  rotezone: {
    name: 'Rote Zone — hinter dem roten Portal', ambient: 'rgb(150,86,92)', fog: [220, 90, 90], fogA: 1.1,
    ground: { base: [44, 22, 26], vary: [16, 8, 8], moss: [70, 24, 30], mossVar: [20, 8, 8], detail: 'grass', grass: ['#7a2a30', '#5a1a24', '#9a3a2a', '#3a1418'], pebble: [80, 50, 54], leaves: ['#8a2a2a', '#5a1a1a'], cracks: 'rgba(20,4,6,0.55)' },
    patches: ['blood', 'spore', 'ash'],
    props: [['alienplant', 3.5], ['crystal', 2], ['bones', 3], ['rock', 3], ['spikes', 1.2]],
    cluster: 'bones'
  },
  caladi: {
    name: 'Planet Caladi — zwei Sonnen', ambient: 'rgb(170,150,120)', fog: [240, 210, 160], fogA: 0.55,
    ground: { base: [92, 76, 54], vary: [22, 18, 12], moss: [84, 90, 50], mossVar: [16, 16, 10], mossAmt: 0.45, detail: 'scorched', grass: ['#8a8a4a', '#6a6a34', '#a09050'], pebble: [120, 104, 84], leaves: null, cracks: 'rgba(40,24,10,0.45)' },
    patches: ['crater', 'ash', 'moss'],
    props: [['rock', 5], ['wreck', 2], ['barrier', 1.5], ['bones', 2], ['crate', 1.5], ['spikes', 0.8]],
    cluster: 'rock'
  },
  burg: {
    name: 'Die zehnte Burg', ambient: 'rgb(104,84,124)', fog: [150, 100, 170], fogA: 1.1,
    ground: { base: [34, 28, 38], vary: [10, 8, 12], moss: [26, 20, 32], mossVar: [6, 4, 8], detail: 'tiles', tile: [64, 50, 72], grass: ['#2a2030'], pebble: [66, 56, 76], leaves: ['#4a1a3a', '#2a1024'], cracks: 'rgba(8,4,12,0.55)', glowCracks: '#b04aff' },
    patches: ['flag', 'blood', 'nebula'],
    props: [['pillar', 3], ['banner', 2.5], ['coffin', 2], ['candles', 2.5], ['obelisk', 1], ['brazier', 1.5]],
    cluster: 'pillar'
  },
  roterhimmel: {
    name: 'Die letzte Linie — roter Himmel', ambient: 'rgb(150,80,76)', fog: [230, 90, 70], fogA: 1.1,
    ground: { base: [40, 26, 24], vary: [16, 10, 8], moss: [30, 18, 18], mossVar: [8, 6, 6], detail: 'scorched', grass: ['#4a2a24', '#3a201c'], pebble: [80, 58, 54], leaves: null, cracks: 'rgba(12,2,2,0.6)', glowCracks: '#ff3a1a' },
    patches: ['crater', 'blood', 'ash'],
    props: [['wreck', 3.5], ['spikes', 3], ['rock', 2.5], ['brazier', 1.2], ['bones', 2]],
    cluster: 'wreck'
  },
  redspace: {
    name: 'Red Space', ambient: 'rgb(120,56,64)', fog: [200, 50, 60], fogA: 1.2,
    ground: { base: [26, 8, 12], vary: [14, 6, 8], moss: [50, 10, 16], mossVar: [14, 6, 6], detail: 'stars', grass: ['#6a1a24'], pebble: [70, 30, 36], leaves: null, cracks: 'rgba(255,60,60,0.3)', glowCracks: '#ff2a2a' },
    patches: ['blood', 'nebula', 'crater'],
    props: [['obelisk', 2.5], ['spikes', 3], ['crystal', 2], ['bones', 2], ['rock', 2]],
    cluster: 'spikes'
  },
  goetter: {
    name: 'Das Reich der Götter', ambient: 'rgb(96,92,146)', fog: [150, 130, 230], fogA: 1,
    ground: { base: [20, 20, 36], vary: [10, 10, 20], moss: [30, 24, 56], mossVar: [10, 8, 20], detail: 'stars', grass: ['#6a5aa0'], pebble: [60, 56, 90], leaves: null, cracks: 'rgba(160,120,255,0.35)', glowCracks: '#8a6aff' },
    patches: ['nebula', 'gold'],
    props: [['crystal', 3], ['goldcrystal', 2], ['obelisk', 2.5], ['rock', 2]],
    cluster: 'obelisk'
  }
};

/* ---------------------------------------------------------------- Boden */
function buildGroundTheme(th) {
  const G0 = th.ground;
  const T = WORLD.tileSize, PX = 2, S = T * PX;
  const N = 256;
  const seed = th.name.length * 13;
  const n1 = tileNoise(N, 4, 11 + seed, 4), n2 = tileNoise(N, 8, 23 + seed, 3), n3 = tileNoise(N, 16, 5 + seed, 2);
  const low = mkCanvas(N, N), lg0 = low.getContext('2d');
  const img = lg0.createImageData(N, N);
  const mA = G0.mossAmt === undefined ? 1 : G0.mossAmt;
  for (let i = 0; i < N * N; i++) {
    const moss = smooth(clamp((n1[i] - 0.45) * 3.2, 0, 1)) * mA;
    const dirt = n2[i], grain = n3[i];
    let r = G0.base[0] + dirt * G0.vary[0] + grain * 10, gg = G0.base[1] + dirt * G0.vary[1] + grain * 8, b = G0.base[2] + dirt * G0.vary[2] + grain * 8;
    r = lerp(r, G0.moss[0] + grain * G0.mossVar[0], moss); gg = lerp(gg, G0.moss[1] + grain * G0.mossVar[1] + dirt * 10, moss); b = lerp(b, G0.moss[2] + grain * G0.mossVar[2], moss);
    img.data[i * 4] = r; img.data[i * 4 + 1] = gg; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255;
  }
  lg0.putImageData(img, 0, 0);
  const c = mkCanvas(S, S), g = c.getContext('2d');
  g.imageSmoothingEnabled = true;
  for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) g.drawImage(low, ox * S, oy * S, S, S);
  const rnd = mulberry(99 + seed);
  const wrapDraw = (x, y, r, fn) => {
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const xx = x + ox * S, yy = y + oy * S;
      if (xx + r < 0 || yy + r < 0 || xx - r > S || yy - r > S) continue;
      fn(xx, yy);
    }
  };
  // Grundstruktur je nach Art
  if (G0.detail === 'concrete') { // Betonplatten mit Fugen und Markierungen
    const P = 128;
    g.strokeStyle = 'rgba(20,20,26,0.5)'; g.lineWidth = 2;
    for (let x = 0; x <= S; x += P) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, S); g.stroke(); }
    for (let y = 0; y <= S; y += P) { g.beginPath(); g.moveTo(0, y); g.lineTo(S, y); g.stroke(); }
    g.strokeStyle = 'rgba(200,200,210,0.08)'; g.lineWidth = 1;
    for (let x = 2; x <= S; x += P) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, S); g.stroke(); }
    for (let i = 0; i < 20; i++) { const x = (rnd() * 8 | 0) * P, y = (rnd() * 8 | 0) * P; g.fillStyle = rgba('#000000', 0.05 + rnd() * 0.08); g.fillRect(x, y, P, P); }
  } else if (G0.detail === 'tiles' || G0.detail === 'marble') {
    const tc = G0.tile;
    const P = G0.detail === 'marble' ? 96 : 72;
    for (let y = 0; y < S; y += P / 2) for (let x = ((y / (P / 2)) % 2) * P / 2; x < S; x += P) {
      const v = (rnd() - 0.5) * (G0.detail === 'marble' ? 20 : 26);
      g.fillStyle = `rgba(${tc[0] + v},${tc[1] + v},${tc[2] + v},0.55)`;
      g.fillRect(x + 1.5, y + 1.5, P - 3, P / 2 - 3);
      g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1.5; g.strokeRect(x + 1, y + 1, P - 2, P / 2 - 2);
      if (G0.detail === 'marble') { g.strokeStyle = 'rgba(120,110,140,0.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + rnd() * P, y); g.bezierCurveTo(x + rnd() * P, y + 10, x + rnd() * P, y + 20, x + rnd() * P, y + P / 2); g.stroke(); }
    }
    if (G0.gold) { g.strokeStyle = rgba(G0.gold, 0.55); g.lineWidth = 2.5; for (let i = 0; i < 6; i++) { const cx = rnd() * S, cy = rnd() * S, r = 60 + rnd() * 60; wrapDraw(cx, cy, r + 4, (xx, yy) => { g.beginPath(); g.arc(xx, yy, r, 0, TAU); g.stroke(); g.beginPath(); g.arc(xx, yy, r * 0.7, 0, TAU); g.stroke(); }); } }
  } else if (G0.detail === 'stars') {
    for (let i = 0; i < 900; i++) { const x = rnd() * S, y = rnd() * S, r = rnd() * rnd() * 2.4 + 0.4; g.fillStyle = rgba(pick(['#ffffff', '#c8b8ff', '#9ad8ff', '#ffe6a0']), 0.3 + rnd() * 0.6); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  } else if (G0.detail === 'scorched') {
    for (let i = 0; i < 60; i++) { const x = rnd() * S, y = rnd() * S, r = 20 + rnd() * 60; wrapDraw(x, y, r, (xx, yy) => { g.fillStyle = rg(g, xx, yy, 0, r, [0, 'rgba(10,6,4,0.35)', 1, 'rgba(0,0,0,0)']); g.fillRect(xx - r, yy - r, r * 2, r * 2); }); }
  }
  // Grasbueschel
  const grassN = G0.detail === 'grass' ? 1400 : G0.detail === 'concrete' ? 260 : G0.detail === 'scorched' ? 200 : 60;
  for (let i = 0; i < grassN; i++) {
    const x = rnd() * S, y = rnd() * S;
    const mossy = n1[((y / S * N) | 0) * N + ((x / S * N) | 0)] > 0.48;
    if (!mossy && rnd() < 0.7) continue;
    const len = 6 + rnd() * 12, cnt = 3 + (rnd() * 5 | 0);
    const col = pick(G0.grass);
    wrapDraw(x, y, 30, (xx, yy) => {
      g.strokeStyle = col; g.lineWidth = 1.6; g.lineCap = 'round';
      for (let k = 0; k < cnt; k++) {
        const a = -Math.PI / 2 + (rnd() - 0.5) * 1.2;
        g.beginPath(); g.moveTo(xx + (k - cnt / 2) * 2, yy);
        g.quadraticCurveTo(xx + (k - cnt / 2) * 2 + Math.cos(a) * len * 0.5, yy + Math.sin(a) * len * 0.5, xx + (k - cnt / 2) * 2 + Math.cos(a) * len, yy + Math.sin(a) * len);
        g.stroke();
      }
    });
  }
  // Steinchen
  const pv = G0.pebble;
  for (let i = 0; i < (G0.detail === 'stars' ? 200 : 700); i++) {
    const x = rnd() * S, y = rnd() * S, r = 1.5 + rnd() * rnd() * 7;
    const v = rnd() * 40;
    wrapDraw(x, y, r + 4, (xx, yy) => {
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(xx + r * 0.3, yy + r * 0.35, r, r * 0.7, 0, 0, TAU); g.fill();
      g.fillStyle = `rgb(${pv[0] + v},${pv[1] + v - 4},${pv[2] + v + 6})`; g.beginPath(); g.ellipse(xx, yy, r, r * 0.72, rnd(), 0, TAU); g.fill();
      g.fillStyle = 'rgba(220,220,240,0.18)'; g.beginPath(); g.ellipse(xx - r * 0.3, yy - r * 0.3, r * 0.45, r * 0.3, 0, 0, TAU); g.fill();
    });
  }
  // Blaetter / Sporen
  if (G0.leaves) for (let i = 0; i < 500; i++) {
    const x = rnd() * S, y = rnd() * S, r = 2.5 + rnd() * 3, a = rnd() * TAU;
    const col = pick(G0.leaves);
    wrapDraw(x, y, 8, (xx, yy) => {
      g.save(); g.translate(xx, yy); g.rotate(a);
      g.fillStyle = col; g.beginPath(); g.ellipse(0, 0, r, r * 0.45, 0, 0, TAU); g.fill();
      g.restore();
    });
  }
  // Risse (optional gluehend)
  for (let i = 0; i < 40; i++) {
    let x = rnd() * S, y = rnd() * S, a = rnd() * TAU;
    const pts = [[x, y]];
    for (let k = 0; k < 6; k++) { a += (rnd() - 0.5) * 1.2; x += Math.cos(a) * 10; y += Math.sin(a) * 10; pts.push([x, y]); }
    const glowIt = G0.glowCracks && rnd() < 0.4;
    wrapDraw(pts[0][0], pts[0][1], 80, (xx, yy) => {
      const dx = xx - pts[0][0], dy = yy - pts[0][1];
      g.strokeStyle = G0.cracks; g.lineWidth = glowIt ? 3 : 1.4;
      g.beginPath(); g.moveTo(pts[0][0] + dx, pts[0][1] + dy); for (const p of pts) g.lineTo(p[0] + dx, p[1] + dy); g.stroke();
      if (glowIt) { g.strokeStyle = rgba(G0.glowCracks, 0.75); g.lineWidth = 1.2; g.stroke(); }
    });
  }
  // Tiefenflecken
  for (let i = 0; i < 26; i++) {
    const x = rnd() * S, y = rnd() * S, r = 60 + rnd() * 140;
    const dark = rnd() < 0.6;
    wrapDraw(x, y, r, (xx, yy) => {
      g.fillStyle = rg(g, xx, yy, 0, r, [0, dark ? 'rgba(0,0,0,0.22)' : 'rgba(160,160,200,0.06)', 1, 'rgba(0,0,0,0)']);
      g.fillRect(xx - r, yy - r, r * 2, r * 2);
    });
  }
  return c;
}

/* ---------------------------------------------------------------- Bodenflecken */
const PATCH_MAKERS = {
  flag: () => mkPatch(360, 240, (g, w, h) => {
    const rnd = mulberry(4);
    g.save(); g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 4, h / 2 - 4, 0, 0, TAU); g.clip();
    for (let y = 0; y < h; y += 34) for (let x = -20 + ((y / 34) % 2) * 26; x < w; x += 52) {
      if (rnd() < 0.18) continue;
      const v = 58 + rnd() * 26;
      const px = x + rnd() * 4, py = y + rnd() * 4, pw = 46 + rnd() * 4, ph = 30;
      g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(px + 2, py + 3, pw, ph);
      g.fillStyle = lg(g, px, py, px + pw, py + ph, [0, `rgb(${v + 12},${v + 10},${v + 18})`, 1, `rgb(${v - 10},${v - 12},${v - 4})`]);
      g.fillRect(px, py, pw, ph);
      g.strokeStyle = 'rgba(0,0,0,0.4)'; g.lineWidth = 1; g.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
      if (rnd() < 0.4) { g.fillStyle = 'rgba(60,90,50,0.45)'; g.beginPath(); g.arc(px + rnd() * pw, py + rnd() * ph, 4 + rnd() * 8, 0, TAU); g.fill(); }
    }
    g.restore();
    fadeEdges(g, w, h);
  }),
  moss: () => blobPatch(260, 180, 8, ['#3e6a34', '#2e5a2a', '#4a7a3a'], 0.5),
  spore: () => blobPatch(260, 180, 9, ['#6a3a9a', '#3a9a8a', '#9a4ab0'], 0.45),
  blood: () => blobPatch(220, 150, 12, ['#5a0a14', '#7a0a1a', '#3a0408'], 0.6),
  gold: () => mkPatch(220, 150, (g, w, h) => { g.strokeStyle = 'rgba(230,190,90,0.55)'; g.lineWidth = 3; g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.42, h * 0.38, 0, 0, TAU); g.stroke(); g.lineWidth = 1.5; g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.3, h * 0.26, 0, 0, TAU); g.stroke(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * w * 0.3, h / 2 + Math.sin(a) * h * 0.26); g.lineTo(w / 2 + Math.cos(a) * w * 0.42, h / 2 + Math.sin(a) * h * 0.38); g.stroke(); } }),
  cloud: () => blobPatch(300, 200, 3, ['#ffffff', '#e8e4f8'], 0.3),
  nebula: () => blobPatch(300, 200, 5, ['#5a3aa0', '#2a4aa0', '#8a3aa0'], 0.35),
  puddle: () => mkPatch(180, 110, (g, w, h) => {
    g.fillStyle = 'rgba(0,0,0,0.3)'; blobPath(g, [[20, 55], [60, 18], [130, 22], [168, 58], [120, 96], [50, 92]]); g.fill();
    g.fillStyle = lg(g, 0, 0, w, h, [0, 'rgba(60,70,100,0.85)', 0.5, 'rgba(26,32,52,0.85)', 1, 'rgba(50,60,90,0.85)']);
    blobPath(g, [[26, 55], [62, 24], [128, 28], [160, 58], [118, 90], [52, 86]]); g.fill();
    g.strokeStyle = 'rgba(170,190,255,0.35)'; g.lineWidth = 2; g.beginPath(); g.ellipse(80, 48, 30, 6, -0.1, 0, TAU); g.stroke();
  }),
  ash: () => mkPatch(240, 170, (g, w, h) => {
    const rnd = mulberry(15);
    g.fillStyle = rg(g, w / 2, h / 2, 0, w / 2, [0, 'rgba(10,8,10,0.55)', 1, 'rgba(10,8,10,0)']);
    g.save(); g.scale(1, h / w); g.beginPath(); g.arc(w / 2, w / 2, w / 2, 0, TAU); g.fill(); g.restore();
    for (let i = 0; i < 40; i++) { g.fillStyle = rgba('#8a8488', 0.18 + rnd() * 0.2); g.beginPath(); g.arc(w / 2 + (rnd() - 0.5) * w * 0.7, h / 2 + (rnd() - 0.5) * h * 0.7, 1 + rnd() * 2.5, 0, TAU); g.fill(); }
  }),
  crater: () => mkPatch(220, 150, (g, w, h) => {
    g.fillStyle = rg(g, w / 2, h / 2, 0, w / 2, [0, 'rgba(8,4,2,0.85)', 0.55, 'rgba(30,20,16,0.6)', 0.8, 'rgba(90,70,60,0.35)', 1, 'rgba(0,0,0,0)']);
    g.save(); g.scale(1, h / w); g.beginPath(); g.arc(w / 2, w / 2, w / 2, 0, TAU); g.fill(); g.restore();
    g.strokeStyle = 'rgba(140,110,90,0.35)'; g.lineWidth = 3; g.beginPath(); g.ellipse(w / 2, h / 2 - 3, w * 0.36, h * 0.3, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  }),
  marking: () => mkPatch(260, 120, (g, w, h) => { g.strokeStyle = 'rgba(230,200,60,0.45)'; g.lineWidth = 6; g.setLineDash([22, 14]); g.beginPath(); g.moveTo(10, h / 2); g.lineTo(w - 10, h / 2); g.stroke(); g.setLineDash([]); g.strokeStyle = 'rgba(230,230,230,0.25)'; g.lineWidth = 4; g.strokeRect(30, 20, w - 60, h - 40); })
};
function mkPatch(w, h, fn) { const c = mkCanvas(w, h); fn(c.getContext('2d'), w, h); return c; }
function blobPatch(w, h, seed, cols, a) {
  return mkPatch(w, h, (g) => {
    const rnd = mulberry(seed);
    for (let i = 0; i < 70; i++) {
      const an = rnd() * TAU, d = Math.sqrt(rnd()) * 0.45;
      const x = w / 2 + Math.cos(an) * d * w, y = h / 2 + Math.sin(an) * d * h, r = 8 + rnd() * 18;
      g.fillStyle = rg(g, x, y, 0, r, [0, rgba(pick(cols), a), 1, rgba(cols[0], 0)]);
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }
  });
}
function fadeEdges(g, w, h) {
  g.globalCompositeOperation = 'destination-in';
  g.save(); g.translate(w / 2, h / 2); g.scale(1, h / w);
  g.fillStyle = rg(g, 0, 0, 0, w / 2, [0, 'rgba(0,0,0,1)', 0.7, 'rgba(0,0,0,0.9)', 1, 'rgba(0,0,0,0)']);
  g.fillRect(-w / 2, -w / 2, w, w); g.restore();
  g.globalCompositeOperation = 'source-over';
}

/* ---------------------------------------------------------------- Requisiten */
const PROP_PX = 2.2;
function makeProp(w, h, anchorY, fn, opt) {
  const PX = PROP_PX;
  const raw = mkCanvas(w * PX, h * PX), g = raw.getContext('2d');
  g.setTransform(PX, 0, 0, PX, w * PX / 2, anchorY * PX);
  g.lineCap = 'round'; g.lineJoin = 'round';
  fn(g);
  const fin = finishSprite(raw, { outline: 1.6, moonW: 1.4, moonA: 0.3, rim: opt && opt.rim, rimW: 1.6, rimA: 0.35 });
  return Object.assign({ c: fin, ax: w * PX / 2, ay: anchorY * PX, px: PX }, opt || {});
}
const NEW_PROPS = {
  barrier: () => [0, 1].map((v) => makeProp(52, 34, 28, (g) => {
    g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.ellipse(2, 0, 26, 5, 0, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(-24, 0); g.lineTo(-20, -8); g.lineTo(-14, -22); g.lineTo(14, -22); g.lineTo(20, -8); g.lineTo(24, 0); g.closePath();
    paint(g, lg(g, 0, -22, 0, 0, [0, '#9a9aa4', 0.5, '#6e6e78', 1, '#3a3a42']), 'rgba(0,0,0,0.6)', 1);
    g.fillStyle = v ? 'rgba(220,180,40,0.8)' : 'rgba(200,40,40,0.7)';
    for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(k * 8 - 3, -18); g.lineTo(k * 8 + 1, -18); g.lineTo(k * 8 + 5, -12); g.lineTo(k * 8 + 1, -12); g.closePath(); g.fill(); }
    g.strokeStyle = 'rgba(20,20,26,0.6)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-6, -22); g.lineTo(-3, -12); g.lineTo(-7, -4); g.stroke();
  })),
  crate: () => [makeProp(36, 34, 30, (g) => {
    g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.ellipse(2, 0, 18, 5, 0, 0, TAU); g.fill();
    g.beginPath(); g.rect(-15, -24, 26, 24); paint(g, lg(g, -15, -24, 11, 0, [0, '#6a7a4a', 1, '#34402a']), 'rgba(0,0,0,0.7)', 1);
    g.beginPath(); g.moveTo(11, 0); g.lineTo(16, -3); g.lineTo(16, -27); g.lineTo(11, -24); g.closePath(); paint(g, '#2a3420', null);
    g.beginPath(); g.moveTo(-15, -24); g.lineTo(-10, -27); g.lineTo(16, -27); g.lineTo(11, -24); g.closePath(); paint(g, '#7a8a58', 'rgba(0,0,0,0.5)', 0.6);
    g.fillStyle = 'rgba(230,220,180,0.7)'; g.font = '700 7px sans-serif'; g.textAlign = 'center'; g.fillText('M-07', -2, -9);
    g.strokeStyle = 'rgba(0,0,0,0.4)'; g.lineWidth = 1.2; g.strokeRect(-13, -22, 22, 20);
  })],
  lamp: () => [makeProp(34, 80, 76, (g) => {
    g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.ellipse(0, 0, 8, 3, 0, 0, TAU); g.fill();
    g.fillStyle = lg(g, -2, 0, 2, 0, [0, '#6a6a74', 1, '#2a2a30']); g.fillRect(-1.6, -66, 3.2, 66);
    g.beginPath(); g.moveTo(-2, -66); g.lineTo(10, -70); g.lineTo(14, -64); g.lineTo(2, -60); g.closePath(); paint(g, '#3a3a42', 'rgba(0,0,0,0.6)', 0.6);
    g.fillStyle = '#eaf4ff'; g.beginPath(); g.ellipse(9, -64, 4, 1.6, -0.3, 0, TAU); g.fill();
  }, { light: { x: 9, y: -60, col: '#cfe4ff', r: 170 }, glowCol: '#dff0ff' })],
  dummy: () => [makeProp(30, 52, 48, (g) => {
    g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.ellipse(0, 0, 10, 3, 0, 0, TAU); g.fill();
    g.fillStyle = '#4a3420'; g.fillRect(-1.5, -26, 3, 26);
    g.beginPath(); g.ellipse(0, -30, 8, 11, 0, 0, TAU); paint(g, lg(g, -8, -40, 8, -20, [0, '#c8a868', 1, '#7a6030']), 'rgba(0,0,0,0.6)', 0.8);
    g.fillStyle = '#4a3420'; g.fillRect(-11, -32, 22, 2.5);
    g.beginPath(); g.arc(0, -44, 5.5, 0, TAU); paint(g, '#b89858', 'rgba(0,0,0,0.6)', 0.8);
    g.strokeStyle = '#a02020'; g.lineWidth = 1.2; g.beginPath(); g.arc(0, -30, 3.5, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, -30, 1.2, 0, TAU); g.stroke();
  })],
  rock: () => [0, 1, 2].map((v) => makeProp(44, 34, 28, (g) => {
    const rnd = mulberry(40 + v);
    g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.ellipse(2, 0, 20, 5, 0, 0, TAU); g.fill();
    const pts = []; for (let i = 0; i < 8; i++) { const a = Math.PI + i / 7 * Math.PI; pts.push([Math.cos(a) * (14 + rnd() * 6), Math.sin(a) * (10 + rnd() * 10 + v * 3)]); }
    pts.push([12, 1], [-12, 1]);
    blobPath(g, pts, 0.4); paint(g, lg(g, -10, -24, 10, 0, [0, '#8a8694', 0.5, '#5a5664', 1, '#26242c']), 'rgba(0,0,0,0.6)', 1);
    g.strokeStyle = 'rgba(10,8,14,0.6)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-4, -14); g.lineTo(0, -6); g.lineTo(-2, 0); g.stroke();
  })),
  alienplant: () => [['#b060ff', '#6a2aa0'], ['#40f0d0', '#1a7a6a']].map((c, v) => makeProp(40, 74, 70, (g) => {
    g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.ellipse(0, 0, 14, 4, 0, 0, TAU); g.fill();
    for (let k = -1; k <= 1; k++) {
      const h = 40 + (k === 0 ? 20 : 0) + v * 4, sway = k * 8;
      g.strokeStyle = '#2a3a34'; g.lineWidth = 3.2; g.beginPath(); g.moveTo(k * 4, 0); g.quadraticCurveTo(k * 6, -h * 0.5, sway, -h); g.stroke();
      g.strokeStyle = '#4a6a5a'; g.lineWidth = 1; g.stroke();
      g.fillStyle = rg(g, sway - 1, -h - 2, 0, 7, [0, '#ffffff', 0.3, c[0], 1, c[1]]);
      g.beginPath(); g.ellipse(sway, -h, 5.5, 7, 0, 0, TAU); g.fill();
    }
    g.fillStyle = '#2a4a3a'; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(-8 + k * 4, -3, 5, 2, -0.5 + k * 0.25, 0, TAU); g.fill(); }
  }, { light: { x: 0, y: -50, col: c[0], r: 110 }, glowCol: c[0], flames: [[-8, -44 - v * 4], [0, -64 - v * 4], [8, -44 - v * 4]] })),
  crystal: () => [['#6ac8ff', '#2a5aa0'], ['#b080ff', '#4a2a9a']].map((c) => makeProp(40, 50, 44, (g) => crystalCluster(g, c), { light: { x: 0, y: -18, col: c[0], r: 120 }, glowCol: c[0], flames: [[0, -26]] })),
  goldcrystal: () => [makeProp(40, 50, 44, (g) => crystalCluster(g, ['#ffe6a0', '#b08a30']), { light: { x: 0, y: -18, col: '#ffd27a', r: 130 }, glowCol: '#ffe6a0', flames: [[0, -26]] })],
  wreck: () => [0, 1].map((v) => makeProp(70, 40, 32, (g) => {
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(2, 0, 32, 6, 0, 0, TAU); g.fill();
    g.save(); g.rotate(v ? -0.12 : 0.08);
    g.beginPath(); g.moveTo(-28, 0); g.lineTo(-24, -14); g.lineTo(-8, -18); g.lineTo(2, -26); g.lineTo(14, -24); g.lineTo(26, -12); g.lineTo(30, 0); g.closePath();
    paint(g, lg(g, 0, -26, 0, 0, [0, '#5a5048', 0.5, '#3a3430', 1, '#1a1614']), 'rgba(0,0,0,0.7)', 1);
    g.fillStyle = '#141010'; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(-20 + k * 10, -3, 3.5, 0, TAU); g.fill(); }
    g.strokeStyle = '#6a5a4a'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(4, -22); g.lineTo(26, -34); g.stroke();
    g.fillStyle = 'rgba(160,70,20,0.5)'; g.beginPath(); g.arc(-10, -12, 4, 0, TAU); g.arc(12, -16, 3, 0, TAU); g.fill();
    g.restore();
  }, { light: { x: -10, y: -10, col: '#ff7a2a', r: 70, flicker: 1 } })),
  spikes: () => [0, 1].map((v) => makeProp(50, 60, 54, (g) => {
    const rnd = mulberry(60 + v);
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(0, 0, 22, 5, 0, 0, TAU); g.fill();
    for (let k = 0; k < 5; k++) {
      const x = -16 + k * 8 + rnd() * 3, h = 22 + rnd() * 26, lean = (rnd() - 0.5) * 0.6;
      g.save(); g.translate(x, 0); g.rotate(lean);
      g.beginPath(); g.moveTo(-4, 0); g.quadraticCurveTo(-2, -h * 0.6, 0, -h); g.quadraticCurveTo(2, -h * 0.6, 4, 0); g.closePath();
      paint(g, lg(g, -4, 0, 4, 0, [0, '#4a4a58', 0.5, '#8a8aa0', 1, '#262630']), 'rgba(0,0,0,0.7)', 0.8);
      g.restore();
    }
  })),
  brazier: () => [makeProp(30, 44, 40, (g) => brazier(g, '#3a3036'), { light: { x: 0, y: -26, col: '#ff8a3a', r: 160, flicker: 1 }, glowCol: '#ffb060', flames: [[-3, -30], [3, -32], [0, -34]] })],
  goldbrazier: () => [makeProp(30, 44, 40, (g) => brazier(g, '#b08a40'), { light: { x: 0, y: -26, col: '#fff0c0', r: 170, flicker: 1 }, glowCol: '#fff4d0', flames: [[-3, -30], [3, -32], [0, -34]] })],
  banner: () => [makeProp(34, 84, 80, (g) => {
    g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.ellipse(0, 0, 8, 3, 0, 0, TAU); g.fill();
    g.fillStyle = lg(g, -2, 0, 2, 0, [0, '#2a2226', 1, '#0e0a0c']); g.fillRect(-1.6, -74, 3.2, 74);
    g.fillStyle = '#c9a24c'; g.beginPath(); g.arc(0, -75, 2.4, 0, TAU); g.fill(); g.fillRect(-1, -72, 16, 2);
    g.beginPath(); g.moveTo(1, -70); g.lineTo(15, -70); g.lineTo(15, -36); g.lineTo(8, -42); g.lineTo(1, -36); g.closePath();
    paint(g, lg(g, 0, -70, 0, -36, [0, '#9a0a1e', 1, '#4a0410']), 'rgba(0,0,0,0.6)', 0.7);
    g.fillStyle = '#e8c070'; g.beginPath(); g.moveTo(8, -64); g.lineTo(11, -56); g.lineTo(8, -48); g.lineTo(5, -56); g.closePath(); g.fill();
    g.fillStyle = '#9a0a1e'; g.beginPath(); g.arc(8, -56, 1.6, 0, TAU); g.fill();
  })],
  marble: () => [0, 1].map((v) => makeProp(36, 86, 80, (g) => {
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(2, 0, 16, 5, 0, 0, TAU); g.fill();
    g.fillStyle = lg(g, -13, 0, 13, 0, [0, '#f4f0f8', 1, '#a8a4b4']); g.fillRect(-13, -7, 26, 7);
    const top = v ? -50 : -70;
    g.beginPath(); g.moveTo(-9, -7); g.lineTo(-9, top); g.lineTo(9, top); g.lineTo(9, -7); g.closePath();
    paint(g, lg(g, -9, 0, 9, 0, [0, '#ffffff', 0.4, '#dcd8e4', 1, '#9a96a8']), 'rgba(60,50,80,0.5)', 1);
    g.strokeStyle = 'rgba(120,110,140,0.35)'; g.lineWidth = 1; for (let k = -6; k <= 6; k += 4) { g.beginPath(); g.moveTo(k, -9); g.lineTo(k, top + 2); g.stroke(); }
    g.fillStyle = '#d8b050'; g.fillRect(-12, top - 5, 24, 5); g.fillRect(-11, -10, 22, 3);
    if (v) { g.fillStyle = '#c8c4d4'; g.beginPath(); g.moveTo(-9, top - 5); g.lineTo(-4, top - 12); g.lineTo(2, top - 6); g.lineTo(9, top - 10); g.lineTo(9, top - 5); g.fill(); }
  })),
  obelisk: () => [makeProp(34, 90, 84, (g) => {
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(2, 0, 16, 5, 0, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(-10, 0); g.lineTo(-7, -70); g.lineTo(0, -80); g.lineTo(7, -70); g.lineTo(10, 0); g.closePath();
    paint(g, lg(g, -10, 0, 10, 0, [0, '#3a3450', 0.5, '#1c1830', 1, '#0a0814']), 'rgba(0,0,0,0.7)', 1);
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = '#b090ff'; g.font = '700 7px serif'; g.textAlign = 'center';
    'ᚱᛟᛞᚨᛉᚷ'.split('').forEach((r, i) => g.fillText(r, 0, -60 + i * 9)); g.restore();
  }, { light: { x: 0, y: -40, col: '#9a7aff', r: 120 }, glowCol: '#b090ff', flames: [[0, -58], [0, -40], [0, -22]] })]
};
function crystalCluster(g, c) {
  g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.ellipse(0, 0, 16, 4, 0, 0, TAU); g.fill();
  const shards = [[-9, 18, -0.4], [0, 32, 0], [8, 22, 0.35], [-3, 14, -0.15], [5, 12, 0.6]];
  for (const s of shards) {
    g.save(); g.translate(s[0], 0); g.rotate(s[2]);
    g.beginPath(); g.moveTo(-4, 0); g.lineTo(-3.5, -s[1] * 0.75); g.lineTo(0, -s[1]); g.lineTo(3.5, -s[1] * 0.75); g.lineTo(4, 0); g.closePath();
    paint(g, lg(g, -4, 0, 4, -s[1], [0, c[1], 0.6, c[0], 1, '#ffffff']), 'rgba(0,0,0,0.6)', 0.7);
    g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(0, -2); g.lineTo(0, -s[1] + 2); g.stroke();
    g.restore();
  }
}
function brazier(g, metal) {
  g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.ellipse(0, 0, 10, 3, 0, 0, TAU); g.fill();
  g.strokeStyle = shade(metal, -0.3); g.lineWidth = 2; g.beginPath(); g.moveTo(-7, 0); g.lineTo(-2, -20); g.moveTo(7, 0); g.lineTo(2, -20); g.moveTo(0, 0); g.lineTo(0, -20); g.stroke();
  g.beginPath(); g.moveTo(-11, -26); g.quadraticCurveTo(0, -16, 11, -26); g.lineTo(9, -22); g.quadraticCurveTo(0, -14, -9, -22); g.closePath();
  paint(g, lg(g, 0, -26, 0, -16, [0, shade(metal, 0.2), 1, shade(metal, -0.4)]), 'rgba(0,0,0,0.7)', 0.8);
  g.fillStyle = '#ffe6a0'; g.beginPath(); g.ellipse(0, -26, 9, 2.2, 0, 0, TAU); g.fill();
}

function buildBaseProps() {
  const make = makeProp;
  const P = WORLD.props;
  // Grabsteine (mehrere Varianten)
  const stone = (g, shape, tilt, seed) => {
    const rnd = mulberry(seed);
    g.rotate(tilt);
    g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.ellipse(2, 0, 14, 4, 0, 0, TAU); g.fill();
    g.beginPath();
    if (shape === 0) { g.moveTo(-10, 0); g.lineTo(-10, -24); g.quadraticCurveTo(-10, -36, 0, -36); g.quadraticCurveTo(10, -36, 10, -24); g.lineTo(10, 0); }
    else if (shape === 1) { g.moveTo(-9, 0); g.lineTo(-9, -28); g.lineTo(-3, -34); g.lineTo(3, -34); g.lineTo(9, -28); g.lineTo(9, 0); }
    else { g.moveTo(-11, 0); g.lineTo(-11, -18); g.lineTo(-6, -22); g.lineTo(-2, -19); g.lineTo(4, -25); g.lineTo(11, -20); g.lineTo(11, 0); }
    g.closePath();
    paint(g, lg(g, -10, -36, 10, 0, [0, '#8a8898', 0.4, '#5c5a68', 1, '#2a2832']), 'rgba(0,0,0,0.6)', 1);
    // Seitenflaeche (Tiefe)
    g.beginPath(); g.moveTo(10, 0); g.lineTo(13, -2); g.lineTo(13, shape === 2 ? -21 : -26); g.lineTo(10, shape === 2 ? -20 : -24); g.closePath();
    paint(g, '#24222c', null);
    // Inschrift / Kreuz
    g.strokeStyle = 'rgba(20,18,26,0.7)'; g.lineWidth = 1.2;
    if (shape !== 2) { g.beginPath(); g.moveTo(0, -30); g.lineTo(0, -18); g.moveTo(-4, -26); g.lineTo(4, -26); g.stroke(); }
    g.lineWidth = 0.7; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(-6, -13 + k * 3.5); g.lineTo(6 - rnd() * 4, -13 + k * 3.5); g.stroke(); }
    // Moos
    for (let k = 0; k < 6; k++) { g.fillStyle = rgba(pick(['#4a7a3a', '#3a6a30', '#5a8a44']), 0.7); g.beginPath(); g.arc(-8 + rnd() * 16, -rnd() * 8, 1.5 + rnd() * 2.5, 0, TAU); g.fill(); }
    // Riss
    g.strokeStyle = 'rgba(10,8,14,0.8)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-3 + rnd() * 6, -34 + rnd() * 6); g.lineTo(rnd() * 4 - 2, -24); g.lineTo(3, -18); g.stroke();
  };
  P.grave = [0, 1, 2].map((s, i) => make(34, 46, 42, (g) => stone(g, s, (i - 1) * 0.08, 30 + i)));
  // Steinkreuz
  P.cross = [make(34, 56, 52, (g) => {
    g.rotate(0.1);
    g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.ellipse(2, 0, 12, 4, 0, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(-3.5, 0); g.lineTo(-3.5, -30); g.lineTo(-12, -30); g.lineTo(-12, -37); g.lineTo(-3.5, -37); g.lineTo(-3.5, -46); g.lineTo(3.5, -46); g.lineTo(3.5, -37); g.lineTo(12, -37); g.lineTo(12, -30); g.lineTo(3.5, -30); g.lineTo(3.5, 0); g.closePath();
    paint(g, lg(g, -12, -46, 12, 0, [0, '#9290a0', 0.5, '#5a5866', 1, '#2a2832']), 'rgba(0,0,0,0.6)', 1);
    g.fillStyle = '#3a2a4a'; g.beginPath(); g.arc(0, -33.5, 2.2, 0, TAU); g.fill();
    g.fillStyle = 'rgba(80,120,60,0.7)'; g.beginPath(); g.arc(-2, -4, 3, 0, TAU); g.arc(2, -8, 2, 0, TAU); g.fill();
  })];
  // Toter Baum (gross, verdreht)
  const tree = (seed) => (g) => {
    const rnd = mulberry(seed);
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(0, 0, 30, 8, 0, 0, TAU); g.fill();
    const branch = (x, y, a, len, w, depth) => {
      const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
      const mx = (x + ex) / 2 + (rnd() - 0.5) * len * 0.3, my = (y + ey) / 2 + (rnd() - 0.5) * len * 0.3;
      g.beginPath(); g.moveTo(x - w, y); g.quadraticCurveTo(mx - w * 0.8, my, ex - w * 0.3, ey); g.lineTo(ex + w * 0.3, ey); g.quadraticCurveTo(mx + w * 0.8, my, x + w, y); g.closePath();
      g.fillStyle = lg(g, x - w, y, x + w, y, [0, '#3a3240', 0.5, '#241e2a', 1, '#100c14']); g.fill();
      if (depth > 0) {
        const n = depth > 2 ? 2 : 2 + (rnd() < 0.5 ? 1 : 0);
        for (let i = 0; i < n; i++) branch(ex, ey, a + (rnd() - 0.5) * 1.3 + (i - (n - 1) / 2) * 0.5, len * (0.62 + rnd() * 0.15), w * 0.62, depth - 1);
      }
    };
    // Wurzeln
    for (let i = 0; i < 4; i++) { const a = (i - 1.5) * 0.7; g.beginPath(); g.moveTo(0, -6); g.quadraticCurveTo(Math.sin(a) * 14, -2, Math.sin(a) * 24, 2); g.lineTo(Math.sin(a) * 20, 3); g.closePath(); g.fillStyle = '#1a1420'; g.fill(); }
    branch(0, 0, -Math.PI / 2 + (rnd() - 0.5) * 0.2, 44, 7, 4);
    // Astloch
    g.fillStyle = '#050307'; g.beginPath(); g.ellipse(1, -22, 2.5, 4, 0, 0, TAU); g.fill();
  };
  P.tree = [make(150, 170, 160, tree(3)), make(150, 170, 160, tree(12)), make(150, 170, 160, tree(21))];
  // Laterne auf Pfahl (Lichtquelle!)
  P.lantern = [make(30, 72, 68, (g) => {
    g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.ellipse(0, 0, 8, 3, 0, 0, TAU); g.fill();
    g.fillStyle = lg(g, -2, 0, 2, 0, [0, '#3a2a1a', 1, '#1a1008']); g.fillRect(-1.8, -58, 3.6, 58);
    g.strokeStyle = '#1a1410'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, -56); g.lineTo(9, -56); g.stroke();
    g.beginPath(); g.moveTo(9, -56); g.lineTo(9, -52); g.stroke();
    g.beginPath(); g.moveTo(5, -52); g.lineTo(13, -52); g.lineTo(12, -42); g.lineTo(6, -42); g.closePath();
    g.fillStyle = 'rgba(255,190,90,0.9)'; g.fill(); g.strokeStyle = '#141008'; g.lineWidth = 1; g.stroke();
    g.beginPath(); g.moveTo(9, -52); g.lineTo(9, -42); g.stroke();
    g.fillStyle = '#fff4c0'; g.beginPath(); g.ellipse(9, -46, 1.6, 2.4, 0, 0, TAU); g.fill();
  }, { light: { x: 9, y: -46, col: '#ffb45a', r: 150, flicker: 1 }, glowCol: '#ffb45a' })];
  // Kerzengruppe (Lichtquelle)
  P.candles = [make(30, 26, 22, (g) => {
    const cs = [[-7, 0, 9], [-1, 2, 13], [5, -1, 7], [9, 2, 5]];
    for (const c of cs) {
      g.fillStyle = lg(g, c[0] - 2, 0, c[0] + 2, 0, [0, '#e8dcc4', 1, '#9a8a70']);
      g.fillRect(c[0] - 1.8, c[1] - c[2], 3.6, c[2]);
      g.fillStyle = '#d8ccb4'; g.beginPath(); g.ellipse(c[0] + 1.5, c[1] - c[2] + 3, 0.9, 2.2, 0, 0, TAU); g.fill();
      g.fillStyle = '#fff2b0'; g.beginPath(); g.ellipse(c[0], c[1] - c[2] - 2.2, 1.1, 2.2, 0, 0, TAU); g.fill();
    }
  }, { light: { x: 0, y: -12, col: '#ffa040', r: 90, flicker: 1 }, glowCol: '#ffc060', flames: [[-7, -11.2], [-1, -13.2], [5, -10.2], [9, -5.2]] })];
  // leuchtende Geisterpilze (Lichtquelle, kalt)
  P.shrooms = [make(30, 22, 18, (g) => {
    const ms = [[-6, 0, 6], [2, 1, 9], [8, -1, 5], [-1, 2, 4]];
    for (const m of ms) {
      g.fillStyle = '#c8d8d0'; g.fillRect(m[0] - 0.8, m[1] - m[2], 1.6, m[2]);
      g.fillStyle = rg(g, m[0], m[1] - m[2], 0, 4, [0, '#c0fff4', 0.5, '#40d8c0', 1, '#107060']);
      g.beginPath(); g.ellipse(m[0], m[1] - m[2], 3.6 * m[2] / 7, 2.2 * m[2] / 7, 0, Math.PI, 0); g.fill();
    }
  }, { light: { x: 1, y: -6, col: '#40e0c0', r: 80 }, glowCol: '#60ffe0' })];
  // Knochenhaufen
  P.bones = [make(40, 22, 18, (g) => {
    const rnd = mulberry(77);
    for (let i = 0; i < 7; i++) {
      g.save(); g.translate(-12 + rnd() * 24, -rnd() * 6); g.rotate(rnd() * TAU);
      g.fillStyle = '#d8cfb8'; g.fillRect(-6, -0.9, 12, 1.8);
      g.beginPath(); g.arc(-6, -1, 1.3, 0, TAU); g.arc(-6, 1, 1.3, 0, TAU); g.arc(6, -1, 1.3, 0, TAU); g.arc(6, 1, 1.3, 0, TAU); g.fill();
      g.restore();
    }
    g.fillStyle = lg(g, 0, -12, 0, 0, [0, '#f0e8d4', 1, '#a89c80']); g.beginPath(); g.arc(3, -5, 4.5, 0, TAU); g.fill();
    g.fillStyle = '#1a1010'; g.beginPath(); g.arc(4.6, -5.5, 1.1, 0, TAU); g.arc(1.8, -5.5, 1.1, 0, TAU); g.fill();
  })];
  // zerbrochene Saeule
  P.pillar = [make(36, 72, 66, (g) => {
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(2, 0, 16, 5, 0, 0, TAU); g.fill();
    g.fillStyle = lg(g, -12, 0, 12, 0, [0, '#8a8898', 1, '#34323c']); g.fillRect(-13, -6, 26, 6);
    g.beginPath(); g.moveTo(-9, -6); g.lineTo(-9, -50); g.lineTo(-4, -56); g.lineTo(1, -49); g.lineTo(5, -58); g.lineTo(9, -46); g.lineTo(9, -6); g.closePath();
    paint(g, lg(g, -9, 0, 9, 0, [0, '#a8a6b4', 0.35, '#6e6c7a', 1, '#2c2a34']), 'rgba(0,0,0,0.6)', 1);
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1; for (let k = -6; k <= 6; k += 4) { g.beginPath(); g.moveTo(k, -8); g.lineTo(k, -46); g.stroke(); }
    g.fillStyle = 'rgba(70,110,60,0.75)'; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(-8 + k * 3, -8 - k * 5, 2 + (k % 2), 0, TAU); g.fill(); }
    // abgebrochenes Stueck am Boden
    g.save(); g.translate(14, -3); g.rotate(1.3); g.fillStyle = '#5a5866'; g.fillRect(-4, -6, 8, 12); g.restore();
  })];
  // Eisenzaun-Stueck
  P.fence = [make(70, 44, 40, (g) => {
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(-32, -1, 64, 3);
    g.strokeStyle = '#1a1820'; g.lineWidth = 2.2;
    g.beginPath(); g.moveTo(-32, -26); g.lineTo(32, -28); g.moveTo(-32, -8); g.lineTo(32, -9); g.stroke();
    for (let k = -30; k <= 30; k += 7) {
      const bent = k === 9 ? 0.4 : 0;
      g.save(); g.translate(k, 0); g.rotate(bent);
      g.lineWidth = 1.8; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -34); g.stroke();
      g.fillStyle = '#1a1820'; g.beginPath(); g.moveTo(-2.2, -33); g.lineTo(0, -38); g.lineTo(2.2, -33); g.fill();
      g.restore();
    }
  })];
  // Sarg (offen) — kleiner Blickfang
  P.coffin = [make(44, 30, 24, (g) => {
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(0, 0, 22, 5, 0, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(-18, -2); g.lineTo(-12, -10); g.lineTo(14, -10); g.lineTo(19, -5); g.lineTo(14, 0); g.lineTo(-12, 1); g.closePath();
    paint(g, lg(g, 0, -10, 0, 1, [0, '#5a3a2a', 1, '#2a180e']), 'rgba(0,0,0,0.7)', 1);
    g.beginPath(); g.moveTo(-14, -3.5); g.lineTo(-10, -8); g.lineTo(12, -8); g.lineTo(15.5, -5); g.lineTo(12, -2); g.lineTo(-10, -1.4); g.closePath();
    g.fillStyle = '#12080a'; g.fill();
    g.fillStyle = 'rgba(120,20,30,0.7)'; g.fillRect(-9, -7, 20, 4.5);
    g.save(); g.translate(-8, -16); g.rotate(-0.5);
    g.beginPath(); g.moveTo(-10, 4); g.lineTo(-5, -4); g.lineTo(18, -4); g.lineTo(22, 1); g.lineTo(18, 6); g.lineTo(-5, 6); g.closePath();
    paint(g, lg(g, 0, -4, 0, 6, [0, '#6a4632', 1, '#34200e']), 'rgba(0,0,0,0.7)', 1);
    g.strokeStyle = '#a08050'; g.lineWidth = 1; g.beginPath(); g.moveTo(6, -2); g.lineTo(6, 4); g.moveTo(3, 0.5); g.lineTo(9, 0.5); g.stroke();
    g.restore();
  })];
}

function buildFogTheme(th) {
  const S = 256, c = mkCanvas(S, S), g = c.getContext('2d');
  const n = tileNoise(S, 4, 71, 4);
  const img = g.createImageData(S, S);
  const f = th.fog, fa = th.fogA || 1;
  for (let i = 0; i < S * S; i++) {
    const v = smooth(clamp((n[i] - 0.42) * 2.4, 0, 1));
    img.data[i * 4] = f[0]; img.data[i * 4 + 1] = f[1]; img.data[i * 4 + 2] = f[2]; img.data[i * 4 + 3] = Math.min(255, v * 200 * fa);
  }
  g.putImageData(img, 0, 0);
  return c;
}

/* Thema aktivieren (Boden, Flecken, Requisiten, Nebel, Licht) */
function setTheme(id) {
  if (WORLD.theme === id) return;
  const th = THEMES[id] || THEMES.friedhof;
  let C = WORLD.cache[id];
  if (!C) {
    C = WORLD.cache[id] = {
      ground: buildGroundTheme(th),
      patches: th.patches.map((p) => PATCH_MAKERS[p]()),
      fog: buildFogTheme(th)
    };
  }
  for (const [type] of th.props) if (!WORLD.props[type] && NEW_PROPS[type]) WORLD.props[type] = NEW_PROPS[type]();
  WORLD.theme = id;
  WORLD.groundTile = C.ground; WORLD.patches = C.patches; WORLD.fog = C.fog;
  WORLD.props.list = th.props; WORLD.cluster = th.cluster;
  WORLD.ambient = th.ambient;
  _chunkCache.clear();
}
// Kompatibilitaet: Start mit dem Friedhof
function buildGround() { buildBaseProps(); setTheme('friedhof'); }
function buildPatches() {}
function buildProps() {}
function buildFog() {}

/* Requisiten pro Chunk (deterministisch, unendliche Welt) */
const CHUNK = 420;
const _chunkCache = new Map();
function chunkProps(cx, cy) {
  const key = cx * 100000 + cy;
  let list = _chunkCache.get(key);
  if (list) return list;
  list = [];
  const rnd = mulberry(hash2(cx, cy, 5 + (WORLD.theme || '').length));
  const near = Math.abs(cx) <= 0 && Math.abs(cy) <= 0;
  const weights = WORLD.props.list;
  const total = weights.reduce((s, w) => s + w[1], 0);
  const n = near ? 3 : 4 + (rnd() * 5 | 0);
  const cluster = rnd() < 0.35;
  const clx = rnd() * CHUNK, cly = rnd() * CHUNK;
  for (let i = 0; i < n; i++) {
    let r = rnd() * total, type = weights[0][0];
    for (const w of weights) { r -= w[1]; if (r <= 0) { type = w[0]; break; } }
    let x = cx * CHUNK + rnd() * CHUNK, y = cy * CHUNK + rnd() * CHUNK;
    if (cluster && type === WORLD.cluster) { x = cx * CHUNK + clx + (i % 3) * 42 - 42; y = cy * CHUNK + cly + Math.floor(i / 3) * 46; }
    if (near && Math.hypot(x, y) < 160) continue;
    const vars = WORLD.props[type];
    if (!vars) continue;
    list.push({ type, v: vars[(rnd() * vars.length) | 0], x, y, flip: rnd() < 0.5, seed: rnd() * 10 });
  }
  const pn = 1 + (rnd() * 2 | 0);
  list.patches = [];
  for (let i = 0; i < pn; i++) list.patches.push({ c: WORLD.patches[(rnd() * WORLD.patches.length) | 0], x: cx * CHUNK + rnd() * CHUNK, y: cy * CHUNK + rnd() * CHUNK, rot: (rnd() - 0.5) * 0.4 });
  if (_chunkCache.size > 400) _chunkCache.clear();
  _chunkCache.set(key, list);
  return list;
}
