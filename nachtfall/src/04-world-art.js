'use strict';
/* ==========================================================================
   WELT — der Aschefriedhof von Varn.
   Kachelbarer Boden (Rauschen + gemalte Details), weltweit verteilte
   Requisiten (Grabsteine, tote Baeume, Laternen, Kerzen, Pilze …) und
   Nebel-Texturen. Alles wird einmal beim Start erzeugt.
   ========================================================================== */

const WORLD = { groundTile: null, tileSize: 512, props: {}, fog: null, patches: [] };

function buildGround() {
  const T = WORLD.tileSize, PX = 2, S = T * PX;
  // 1) Farbrauschen auf halber Aufloesung (schnell), dann hochskaliert
  const N = 256;
  const n1 = tileNoise(N, 4, 11, 4), n2 = tileNoise(N, 8, 23, 3), n3 = tileNoise(N, 16, 5, 2);
  const low = mkCanvas(N, N), lg0 = low.getContext('2d');
  const img = lg0.createImageData(N, N);
  for (let i = 0; i < N * N; i++) {
    const moss = smooth(clamp((n1[i] - 0.45) * 3.2, 0, 1));
    const dirt = n2[i], grain = n3[i];
    // dunkle Erde -> moosiges Gruen -> kaltes Grau
    let r = 34 + dirt * 18 + grain * 10, gg = 30 + dirt * 14 + grain * 8, b = 36 + dirt * 14 + grain * 8;
    r = lerp(r, 30 + grain * 12, moss); gg = lerp(gg, 46 + grain * 16 + dirt * 10, moss); b = lerp(b, 34 + grain * 8, moss);
    img.data[i * 4] = r; img.data[i * 4 + 1] = gg; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255;
  }
  lg0.putImageData(img, 0, 0);
  const c = mkCanvas(S, S), g = c.getContext('2d');
  g.imageSmoothingEnabled = true;
  // 3x3 zeichnen, damit die Kanten beim Hochskalieren nahtlos bleiben
  for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) g.drawImage(low, ox * S, oy * S, S, S);
  const rnd = mulberry(99);
  const wrapDraw = (x, y, r, fn) => {
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const xx = x + ox * S, yy = y + oy * S;
      if (xx + r < 0 || yy + r < 0 || xx - r > S || yy - r > S) continue;
      fn(xx, yy);
    }
  };
  // 2) Grasbueschel
  for (let i = 0; i < 1400; i++) {
    const x = rnd() * S, y = rnd() * S;
    const mossy = n1[((y / S * N) | 0) * N + ((x / S * N) | 0)] > 0.48;
    if (!mossy && rnd() < 0.7) continue;
    const len = 6 + rnd() * 12, cnt = 3 + (rnd() * 5 | 0);
    const col = rnd() < 0.5 ? '#3c5a34' : (rnd() < 0.5 ? '#50683a' : '#2a3e2a');
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
  // 3) Steinchen & Kiesel
  for (let i = 0; i < 700; i++) {
    const x = rnd() * S, y = rnd() * S, r = 1.5 + rnd() * rnd() * 7;
    const v = 60 + rnd() * 40;
    wrapDraw(x, y, r + 4, (xx, yy) => {
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(xx + r * 0.3, yy + r * 0.35, r, r * 0.7, 0, 0, TAU); g.fill();
      g.fillStyle = `rgb(${v},${v - 4},${v + 6})`; g.beginPath(); g.ellipse(xx, yy, r, r * 0.72, rnd(), 0, TAU); g.fill();
      g.fillStyle = 'rgba(200,200,230,0.18)'; g.beginPath(); g.ellipse(xx - r * 0.3, yy - r * 0.3, r * 0.45, r * 0.3, 0, 0, TAU); g.fill();
    });
  }
  // 4) tote Blaetter
  for (let i = 0; i < 500; i++) {
    const x = rnd() * S, y = rnd() * S, r = 2.5 + rnd() * 3, a = rnd() * TAU;
    const col = pick(['#5a3a24', '#6a4222', '#4a2c1c', '#7a4a20', '#3a2418']);
    wrapDraw(x, y, 8, (xx, yy) => {
      g.save(); g.translate(xx, yy); g.rotate(a);
      g.fillStyle = col; g.beginPath(); g.ellipse(0, 0, r, r * 0.45, 0, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(-r, 0); g.lineTo(r, 0); g.stroke();
      g.restore();
    });
  }
  // 5) Risse
  for (let i = 0; i < 40; i++) {
    let x = rnd() * S, y = rnd() * S, a = rnd() * TAU;
    const pts = [[x, y]];
    for (let k = 0; k < 6; k++) { a += (rnd() - 0.5) * 1.2; x += Math.cos(a) * 10; y += Math.sin(a) * 10; pts.push([x, y]); }
    wrapDraw(pts[0][0], pts[0][1], 80, (xx, yy) => {
      const dx = xx - pts[0][0], dy = yy - pts[0][1];
      g.strokeStyle = 'rgba(8,6,10,0.55)'; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(pts[0][0] + dx, pts[0][1] + dy); for (const p of pts) g.lineTo(p[0] + dx, p[1] + dy); g.stroke();
    });
  }
  // 6) leichte Vignettierung von Flecken (Tiefe)
  for (let i = 0; i < 26; i++) {
    const x = rnd() * S, y = rnd() * S, r = 60 + rnd() * 140;
    const dark = rnd() < 0.6;
    wrapDraw(x, y, r, (xx, yy) => {
      g.fillStyle = rg(g, xx, yy, 0, r, [0, dark ? 'rgba(0,0,0,0.22)' : 'rgba(120,130,160,0.06)', 1, 'rgba(0,0,0,0)']);
      g.fillRect(xx - r, yy - r, r * 2, r * 2);
    });
  }
  WORLD.groundTile = c;
}

/* --------------------------------------------------------- Bodenflecken (per Chunk) */
function buildPatches() {
  const mk = (w, h, fn) => { const c = mkCanvas(w, h); fn(c.getContext('2d'), w, h); return c; };
  // Steinplatten eines alten Weges
  WORLD.patches.push(mk(360, 240, (g, w, h) => {
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
    g.globalCompositeOperation = 'destination-in';
    g.save(); g.translate(w / 2, h / 2); g.scale(1, h / w);
    g.fillStyle = rg(g, 0, 0, 0, w / 2, [0, 'rgba(0,0,0,1)', 0.7, 'rgba(0,0,0,0.9)', 1, 'rgba(0,0,0,0)']);
    g.fillRect(-w / 2, -w / 2, w, w); g.restore();
  }));
  // Moospolster
  WORLD.patches.push(mk(260, 180, (g, w, h) => {
    const rnd = mulberry(8);
    for (let i = 0; i < 70; i++) {
      const a = rnd() * TAU, d = Math.sqrt(rnd()) * 0.45;
      const x = w / 2 + Math.cos(a) * d * w, y = h / 2 + Math.sin(a) * d * h, r = 8 + rnd() * 18;
      g.fillStyle = rg(g, x, y, 0, r, [0, rgba(pick(['#3e6a34', '#2e5a2a', '#4a7a3a']), 0.5), 1, 'rgba(40,80,40,0)']);
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }
  }));
  // Pfuetze (spiegelt das Mondlicht)
  WORLD.patches.push(mk(180, 110, (g, w, h) => {
    g.fillStyle = 'rgba(0,0,0,0.3)'; blobPath(g, [[20, 55], [60, 18], [130, 22], [168, 58], [120, 96], [50, 92]]); g.fill();
    g.fillStyle = lg(g, 0, 0, w, h, [0, 'rgba(60,70,100,0.85)', 0.5, 'rgba(26,32,52,0.85)', 1, 'rgba(50,60,90,0.85)']);
    blobPath(g, [[26, 55], [62, 24], [128, 28], [160, 58], [118, 90], [52, 86]]); g.fill();
    g.strokeStyle = 'rgba(170,190,255,0.35)'; g.lineWidth = 2; g.beginPath(); g.ellipse(80, 48, 30, 6, -0.1, 0, TAU); g.stroke();
    g.strokeStyle = 'rgba(170,190,255,0.18)'; g.beginPath(); g.ellipse(95, 64, 46, 10, -0.1, 0, TAU); g.stroke();
  }));
  // dunkle, verbrannte Erde (Ascheflecken)
  WORLD.patches.push(mk(240, 170, (g, w, h) => {
    const rnd = mulberry(15);
    g.fillStyle = rg(g, w / 2, h / 2, 0, w / 2, [0, 'rgba(10,8,10,0.55)', 1, 'rgba(10,8,10,0)']);
    g.save(); g.scale(1, h / w); g.beginPath(); g.arc(w / 2, w / 2, w / 2, 0, TAU); g.fill(); g.restore();
    for (let i = 0; i < 40; i++) { g.fillStyle = rgba('#8a8488', 0.18 + rnd() * 0.2); g.beginPath(); g.arc(w / 2 + (rnd() - 0.5) * w * 0.7, h / 2 + (rnd() - 0.5) * h * 0.7, 1 + rnd() * 2.5, 0, TAU); g.fill(); }
  }));
}

/* --------------------------------------------------------- Requisiten */
// jede Requisite: { c: Canvas, ax, ay (Ankerpunkt Fuss), light?: {x,y,col,r}, tall }
function buildProps() {
  const PX = 2.2;
  const make = (w, h, anchorY, fn, opt) => {
    const raw = mkCanvas(w * PX, h * PX), g = raw.getContext('2d');
    g.setTransform(PX, 0, 0, PX, w * PX / 2, anchorY * PX);
    g.lineCap = 'round'; g.lineJoin = 'round';
    fn(g);
    const fin = finishSprite(raw, { outline: 1.6, moonW: 1.4, moonA: 0.3, rim: opt && opt.rim, rimW: 1.6, rimA: 0.35 });
    return Object.assign({ c: fin, ax: w * PX / 2, ay: anchorY * PX, px: PX }, opt || {});
  };
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
  P.list = [
    ['grave', 10], ['cross', 3], ['tree', 3], ['lantern', 1.3], ['candles', 1.6], ['shrooms', 2], ['bones', 3], ['pillar', 1.5], ['fence', 1.4], ['coffin', 0.7]
  ];
}

function buildFog() {
  const S = 256, c = mkCanvas(S, S), g = c.getContext('2d');
  const n = tileNoise(S, 4, 71, 4);
  const img = g.createImageData(S, S);
  for (let i = 0; i < S * S; i++) {
    const v = smooth(clamp((n[i] - 0.42) * 2.4, 0, 1));
    img.data[i * 4] = 150; img.data[i * 4 + 1] = 160; img.data[i * 4 + 2] = 200; img.data[i * 4 + 3] = v * 200;
  }
  g.putImageData(img, 0, 0);
  WORLD.fog = c;
}

/* Requisiten pro Chunk (deterministisch, unendliche Welt) */
const CHUNK = 420;
const _chunkCache = new Map();
function chunkProps(cx, cy) {
  const key = cx * 100000 + cy;
  let list = _chunkCache.get(key);
  if (list) return list;
  list = [];
  const rnd = mulberry(hash2(cx, cy, 5));
  // Startbereich frei halten
  const near = Math.abs(cx) <= 0 && Math.abs(cy) <= 0;
  const weights = WORLD.props.list;
  const total = weights.reduce((s, w) => s + w[1], 0);
  const n = near ? 3 : 4 + (rnd() * 5 | 0);
  // manche Chunks bilden kleine Grabfelder
  const cluster = rnd() < 0.35;
  const clx = rnd() * CHUNK, cly = rnd() * CHUNK;
  for (let i = 0; i < n; i++) {
    let r = rnd() * total, type = weights[0][0];
    for (const w of weights) { r -= w[1]; if (r <= 0) { type = w[0]; break; } }
    let x = cx * CHUNK + rnd() * CHUNK, y = cy * CHUNK + rnd() * CHUNK;
    if (cluster && type === 'grave') { x = cx * CHUNK + clx + (i % 3) * 38 - 38; y = cy * CHUNK + cly + Math.floor(i / 3) * 44; }
    if (near && Math.hypot(x, y) < 160) continue;
    const vars = WORLD.props[type];
    list.push({ type, v: vars[(rnd() * vars.length) | 0], x, y, flip: rnd() < 0.5, seed: rnd() * 10 });
  }
  // Bodenflecken
  const pn = 1 + (rnd() * 2 | 0);
  list.patches = [];
  for (let i = 0; i < pn; i++) list.patches.push({ c: WORLD.patches[(rnd() * WORLD.patches.length) | 0], x: cx * CHUNK + rnd() * CHUNK, y: cy * CHUNK + rnd() * CHUNK, rot: (rnd() - 0.5) * 0.4 });
  if (_chunkCache.size > 400) _chunkCache.clear();
  _chunkCache.set(key, list);
  return list;
}
