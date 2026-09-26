'use strict';
/* ==========================================================================
   ART-KIT — Werkzeuge fuer die prozedural gemalten Figuren und Effekte.
   Stil: dunkle, gemalte Dark-Fantasy-Figuren mit kraeftiger Kontur,
   Mondlicht von links oben und farbigem Randlicht je nach Element.
   ========================================================================== */

const OUTLINE = '#07030a';
function mkCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
  return c;
}

/* ------------------------------------------------ glatte Kurven / Formen */
// geschlossene, weiche Form durch Punkte (Catmull-Rom -> Bezier)
function blobPath(g, pts, tension) {
  const n = pts.length, tt = (tension === undefined ? 0.5 : tension) / 3;
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    g.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) * tt, p1[1] + (p2[1] - p0[1]) * tt,
      p2[0] - (p3[0] - p1[0]) * tt, p2[1] - (p3[1] - p1[1]) * tt,
      p2[0], p2[1]);
  }
  g.closePath();
}
// offene weiche Linie
function curvePath(g, pts, tension) {
  const n = pts.length, tt = (tension === undefined ? 0.5 : tension) / 3;
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    g.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) * tt, p1[1] + (p2[1] - p0[1]) * tt,
      p2[0] - (p3[0] - p1[0]) * tt, p2[1] - (p3[1] - p1[1]) * tt,
      p2[0], p2[1]);
  }
}
// verjuengtes Band entlang einer Linie (Umhaenge, Schals, Haare, Tentakel)
function ribbonPts(pts, w0, w1) {
  const L = [], R = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const w = typeof w0 === 'function' ? w0(i / (n - 1)) : lerp(w0, w1, i / (n - 1));
    L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
    R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  return L.concat(R.reverse());
}
function ribbon(g, pts, w0, w1) {
  const poly = ribbonPts(pts, w0, w1);
  g.beginPath(); g.moveTo(poly[0][0], poly[0][1]);
  for (let i = 1; i < poly.length; i++) g.lineTo(poly[i][0], poly[i][1]);
  g.closePath();
}
// Gliedmasse als verjuengte Kapsel zwischen zwei Punkten
function limb(g, ax, ay, bx, by, wa, wb) {
  const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1;
  const nx = -dy / d, ny = dx / d;
  const ang = Math.atan2(dy, dx);
  g.beginPath();
  g.moveTo(ax + nx * wa, ay + ny * wa);
  g.lineTo(bx + nx * wb, by + ny * wb);
  g.arc(bx, by, wb, ang + Math.PI / 2, ang - Math.PI / 2, true);
  g.lineTo(ax - nx * wa, ay - ny * wa);
  g.arc(ax, ay, wa, ang - Math.PI / 2, ang + Math.PI / 2, true);
  g.closePath();
}
// 2-Segment-IK: liefert Gelenk (Knie / Ellbogen)
function ik(ax, ay, bx, by, l1, l2, bend) {
  let dx = bx - ax, dy = by - ay;
  let d = Math.hypot(dx, dy);
  const maxD = l1 + l2 - 0.01;
  if (d > maxD) { bx = ax + dx / d * maxD; by = ay + dy / d * maxD; dx = bx - ax; dy = by - ay; d = maxD; }
  d = Math.max(d, 0.01);
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const mx = ax + dx * a / d, my = ay + dy * a / d;
  return [mx + bend * (-dy) * h / d, my + bend * dx * h / d, bx, by];
}
function lg(g, x0, y0, x1, y1, stops) {
  const gr = g.createLinearGradient(x0, y0, x1, y1);
  for (let i = 0; i < stops.length; i += 2) gr.addColorStop(stops[i], stops[i + 1]);
  return gr;
}
function rg(g, x, y, r0, r1, stops, fx, fy) {
  const gr = g.createRadialGradient(fx === undefined ? x : fx, fy === undefined ? y : fy, r0, x, y, r1);
  for (let i = 0; i < stops.length; i += 2) gr.addColorStop(stops[i], stops[i + 1]);
  return gr;
}
// Fuellen + innere Trennlinie
function paint(g, fill, line, lw) {
  g.fillStyle = fill; g.fill();
  if (line) { g.strokeStyle = line; g.lineWidth = lw || 0.7; g.lineJoin = 'round'; g.stroke(); }
}
function glowDot(g, x, y, r, col, a) {
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = rg(g, x, y, 0, r, [0, rgba(col, a === undefined ? 0.9 : a), 0.4, rgba(col, (a || 0.9) * 0.35), 1, rgba(col, 0)]);
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.restore();
}
function eye(g, x, y, r, col) {
  glowDot(g, x, y, r * 3.2, col, 0.55);
  g.fillStyle = '#fff8f0'; g.beginPath(); g.ellipse(x, y, r, r * 0.7, 0, 0, TAU); g.fill();
  g.fillStyle = col; g.beginPath(); g.ellipse(x, y, r * 0.75, r * 0.55, 0, 0, TAU); g.fill();
}

/* ---------------------------------------------- Nachbearbeitung: Kontur + Randlicht */
const _tmpA = mkCanvas(8, 8), _tmpB = mkCanvas(8, 8);
function ensureSize(c, w, h) { if (c.width < w || c.height < h) { c.width = Math.max(c.width, w); c.height = Math.max(c.height, h); } }
/**
 * Veredelt eine gemalte Figur:
 *  - duenne dunkle Aussenkontur (liest sich auf jedem Boden)
 *  - Randlicht in Elementfarbe auf der dem Licht abgewandten Kante
 *  - weiches Mondlicht-Randlicht oben links
 * src muss transparenten Rand haben. Liefert ein neues Canvas (oder schreibt in dst).
 */
function finishSprite(src, opt, dst) {
  const w = src.width, h = src.height;
  const o = opt || {};
  const ow = o.outline === undefined ? 2 : o.outline;
  const out = dst || mkCanvas(w, h);
  const g = out.getContext('2d');
  g.clearRect(0, 0, w, h);
  // 1) Kontur: Silhouette in 8 Richtungen versetzt
  ensureSize(_tmpA, w, h);
  const ta = _tmpA.getContext('2d');
  ta.clearRect(0, 0, w, h);
  ta.globalCompositeOperation = 'source-over';
  ta.drawImage(src, 0, 0);
  ta.globalCompositeOperation = 'source-in';
  ta.fillStyle = o.outlineColor || OUTLINE; ta.fillRect(0, 0, w, h);
  ta.globalCompositeOperation = 'source-over';
  if (ow > 0) {
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]];
    for (const d of dirs) g.drawImage(_tmpA, 0, 0, w, h, d[0] * ow, d[1] * ow, w, h);
  }
  if (o.glow) { // farbiger Halo fuer die Spielfigur
    g.save(); g.globalAlpha = o.glowA || 0.5;
    ta.globalCompositeOperation = 'source-in'; ta.fillStyle = o.glow; ta.fillRect(0, 0, w, h); ta.globalCompositeOperation = 'source-over';
    const gw = ow + 1.6;
    for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) g.drawImage(_tmpA, 0, 0, w, h, d[0] * gw, d[1] * gw, w, h);
    g.restore();
    // Kontur erneut dunkel darueber
    ta.fillStyle = o.outlineColor || OUTLINE; ta.globalCompositeOperation = 'source-in'; ta.fillRect(0, 0, w, h); ta.globalCompositeOperation = 'source-over';
    for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) g.drawImage(_tmpA, 0, 0, w, h, d[0] * ow, d[1] * ow, w, h);
  }
  g.drawImage(src, 0, 0);
  // 2) Randlicht
  if (o.rim) addRim(g, src, w, h, o.rim, o.rimW || 2.2, o.rimA || 0.85, o.rimDx === undefined ? 1 : o.rimDx, o.rimDy === undefined ? 0.35 : o.rimDy);
  if (o.moon !== false) addRim(g, src, w, h, o.moonCol || '#b9c4ff', o.moonW || 1.6, o.moonA || 0.35, -0.8, -1);
  return out;
}
function addRim(g, src, w, h, col, rw, ra, dx, dy) {
  ensureSize(_tmpB, w, h);
  const tb = _tmpB.getContext('2d');
  tb.clearRect(0, 0, w, h);
  tb.globalCompositeOperation = 'source-over';
  tb.drawImage(src, 0, 0);
  tb.globalCompositeOperation = 'source-in';
  tb.fillStyle = col; tb.fillRect(0, 0, w, h);
  tb.globalCompositeOperation = 'destination-out';
  const d = Math.hypot(dx, dy) || 1;
  tb.drawImage(src, -dx / d * rw, -dy / d * rw);
  tb.globalCompositeOperation = 'source-over';
  g.save();
  g.globalAlpha = ra;
  g.globalCompositeOperation = 'lighter';
  g.drawImage(_tmpB, 0, 0, w, h, 0, 0, w, h);
  g.restore();
}
// weisse Silhouette (Treffer-Blitz)
function flashSprite(src, col) {
  const c = mkCanvas(src.width, src.height), g = c.getContext('2d');
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = col || '#fff'; g.fillRect(0, 0, c.width, c.height);
  return c;
}

/* ------------------------------------------------------- Licht & Glow-Sprites */
const _lightCache = {};
function lightSprite(col) {
  if (_lightCache[col]) return _lightCache[col];
  const S = 128, c = mkCanvas(S, S), g = c.getContext('2d');
  const [r, gg, b] = hexRgb(col);
  const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  gr.addColorStop(0, `rgba(${r},${gg},${b},1)`);
  gr.addColorStop(0.25, `rgba(${r},${gg},${b},0.62)`);
  gr.addColorStop(0.55, `rgba(${r},${gg},${b},0.22)`);
  gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  return (_lightCache[col] = c);
}
const _glowCache = {};
function glowSprite(col, hard) {
  const key = col + (hard ? 'h' : '');
  if (_glowCache[key]) return _glowCache[key];
  const S = 64, c = mkCanvas(S, S), g = c.getContext('2d');
  const [r, gg, b] = hexRgb(col);
  const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  if (hard) {
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.18, `rgba(${r},${gg},${b},1)`);
    gr.addColorStop(0.45, `rgba(${r},${gg},${b},0.35)`);
  } else {
    gr.addColorStop(0, `rgba(${r},${gg},${b},0.9)`);
    gr.addColorStop(0.35, `rgba(${r},${gg},${b},0.35)`);
  }
  gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  return (_glowCache[key] = c);
}
// weicher Schatten unter Figuren
const SHADOW_SPR = (() => {
  const c = mkCanvas(64, 32), g = c.getContext('2d');
  g.fillStyle = rg(g, 32, 16, 0, 32, [0, 'rgba(0,0,0,0.62)', 0.6, 'rgba(0,0,0,0.3)', 1, 'rgba(0,0,0,0)']);
  g.scale(1, 0.5); g.beginPath(); g.arc(32, 32, 32, 0, TAU); g.fill();
  return c;
})();

/* ------------------------------------------------------- periodisches Rauschen */
function tileNoise(size, cells, seed, octaves) {
  const out = new Float32Array(size * size);
  const rnd = mulberry(seed);
  let amp = 1, tot = 0, c = cells;
  for (let o = 0; o < (octaves || 4); o++) {
    const grid = new Float32Array(c * c);
    for (let i = 0; i < grid.length; i++) grid[i] = rnd();
    for (let y = 0; y < size; y++) {
      const gy = (y / size) * c, y0 = Math.floor(gy), fy = smooth(gy - y0);
      const y1 = (y0 + 1) % c;
      for (let x = 0; x < size; x++) {
        const gx = (x / size) * c, x0 = Math.floor(gx), fx = smooth(gx - x0);
        const x1 = (x0 + 1) % c;
        const a = grid[y0 * c + x0], b = grid[y0 * c + x1], cc = grid[y1 * c + x0], d = grid[y1 * c + x1];
        out[y * size + x] += amp * lerp(lerp(a, b, fx), lerp(cc, d, fx), fy);
      }
    }
    tot += amp; amp *= 0.5; c *= 2;
  }
  for (let i = 0; i < out.length; i++) out[i] /= tot;
  return out;
}

/* ------------------------------------------------------- kleine Sprite-Bibliothek */
// Blutstropfen / Schattenfetzen / Qi-Funken als vorgerenderte Partikel
const PART = {};
function buildParticleSprites() {
  const mk = (name, S, fn) => { const c = mkCanvas(S, S); fn(c.getContext('2d'), S); PART[name] = c; };
  mk('drop', 24, (g, S) => { // dicker Bluttropfen mit Glanz
    g.fillStyle = rg(g, S * 0.42, S * 0.4, 0, S * 0.45, [0, '#ff4a5a', 0.45, '#b3001b', 1, '#3a0008']);
    g.beginPath(); g.arc(S / 2, S / 2, S * 0.38, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,220,220,0.8)'; g.beginPath(); g.arc(S * 0.38, S * 0.36, S * 0.09, 0, TAU); g.fill();
  });
  mk('splat', 64, (g, S) => { // Blutspritzer (Bodendecal)
    const rnd = mulberry(7);
    g.fillStyle = '#5c0010';
    for (let i = 0; i < 14; i++) {
      const a = rnd() * TAU, d = rnd() * S * 0.3, r = S * (0.04 + rnd() * 0.1);
      g.beginPath(); g.arc(S / 2 + Math.cos(a) * d, S / 2 + Math.sin(a) * d, r, 0, TAU); g.fill();
    }
    g.fillStyle = '#7d0618';
    g.beginPath(); g.arc(S / 2, S / 2, S * 0.2, 0, TAU); g.fill();
    for (let i = 0; i < 9; i++) {
      const a = rnd() * TAU, d = S * (0.3 + rnd() * 0.16);
      g.beginPath(); g.arc(S / 2 + Math.cos(a) * d, S / 2 + Math.sin(a) * d, S * 0.025, 0, TAU); g.fill();
    }
  });
  mk('smoke', 64, (g, S) => {
    g.fillStyle = rg(g, S / 2, S / 2, 0, S / 2, [0, 'rgba(255,255,255,0.55)', 0.5, 'rgba(255,255,255,0.2)', 1, 'rgba(255,255,255,0)']);
    g.fillRect(0, 0, S, S);
  });
  mk('shadowwisp', 64, (g, S) => {
    g.fillStyle = rg(g, S / 2, S / 2, 0, S / 2, [0, 'rgba(10,0,20,0.95)', 0.5, 'rgba(25,5,45,0.6)', 1, 'rgba(20,0,40,0)']);
    g.fillRect(0, 0, S, S);
  });
  mk('spark', 32, (g, S) => {
    g.fillStyle = rg(g, S / 2, S / 2, 0, S / 2, [0, 'rgba(255,255,255,1)', 0.2, 'rgba(255,255,255,0.8)', 1, 'rgba(255,255,255,0)']);
    g.fillRect(0, 0, S, S);
  });
  mk('ash', 16, (g, S) => {
    g.fillStyle = 'rgba(40,34,38,0.9)'; g.beginPath(); g.ellipse(S / 2, S / 2, S * 0.4, S * 0.22, 0.5, 0, TAU); g.fill();
  });
}
// eingefaerbte Partikel (fuer additive Effekte)
const _tintCache = {};
function tinted(name, col) {
  const key = name + col;
  if (_tintCache[key]) return _tintCache[key];
  const src = PART[name] || glowSprite(col);
  const c = mkCanvas(src.width, src.height), g = c.getContext('2d');
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = col; g.fillRect(0, 0, c.width, c.height);
  // weisser Kern bleibt ueber 'lighter' erhalten
  return (_tintCache[key] = c);
}
