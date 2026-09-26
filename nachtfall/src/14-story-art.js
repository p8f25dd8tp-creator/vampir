'use strict';
/* ==========================================================================
   STORY-GEGNER — Bestien (Vierbeiner in Stufen), Dalki (mit 1–8 Stacheln),
   Vampire (umgefaerbte Heldenfiguren), Himmlische und Goetter.
   Werden erst beim Kapitelstart vorgerendert (spart Ladezeit & Speicher).
   ========================================================================== */

/* ---------------------------------------------------------------- Vierbeiner */
function drawQuad(g, ph, o, Q) {
  const C = Q.cols;
  const L = Q.L, H = Q.H, B = Q.bulk;
  const rear = (o && o.rear) || 0;          // Aufbaeumen (Boss-Ausholen)
  const atk = (o && o.atk) || 0;
  const t = ph * TAU;
  const bob = Math.abs(Math.sin(t)) * 1.2;
  g.save();
  g.translate(0, -bob);
  if (rear) { g.translate(-L * 0.3, 0); g.rotate(-rear * 0.45); g.translate(L * 0.3, 0); }
  const by = -H - B * 0.45;
  const legs = [
    { x: L * 0.3, p: t, near: true }, { x: -L * 0.32, p: t + Math.PI, near: true },
    { x: L * 0.26, p: t + Math.PI, near: false }, { x: -L * 0.36, p: t, near: false }
  ];
  const leg = (lg0, front) => {
    const dk = lg0.near ? 0 : -0.35;
    const hx = lg0.x, hy = by + B * 0.25;
    const stride = L * 0.16, lift = H * 0.35;
    const fx = hx + Math.sin(lg0.p) * stride, fy = -Math.max(0, Math.cos(lg0.p)) * lift + (rear && front ? -H * rear * 0.8 : 0);
    const k = ik(hx, hy, fx, fy, H * 0.62, H * 0.62, front ? 1 : -1);
    limb(g, hx, hy, k[0], k[1], Q.legW, Q.legW * 0.8); paint(g, shade(C.body, dk), 'rgba(0,0,0,0.6)', 0.6);
    limb(g, k[0], k[1], k[2], k[3], Q.legW * 0.8, Q.legW * 0.6); paint(g, shade(C.bodyD, dk), 'rgba(0,0,0,0.6)', 0.6);
    g.fillStyle = shade(C.horn, dk);
    for (let c = -1; c <= 1; c++) { g.beginPath(); g.moveTo(k[2] + c * 1.2, k[3]); g.lineTo(k[2] + c * 1.2 + 2.4, k[3] + 0.6); g.lineTo(k[2] + c * 1.2 + 0.6, k[3] - 1.4); g.fill(); }
  };
  leg(legs[2], true); leg(legs[3], false);
  // Schwanz
  if (Q.tail) {
    const tp = []; for (let i = 0; i <= 5; i++) tp.push([-L * 0.5 - i * Q.tail * 0.2, by - B * 0.1 + Math.sin(t * 2 + i) * i * 0.6 - i * 0.8]);
    ribbon(g, tp, (s) => B * 0.18 * (1 - s)); paint(g, C.bodyD, 'rgba(0,0,0,0.5)', 0.5);
  }
  // Koerper
  g.beginPath(); g.ellipse(0, by, L * 0.55, B * 0.55, 0, 0, TAU);
  paint(g, lg(g, 0, by - B * 0.55, 0, by + B * 0.55, [0, C.bodyL, 0.45, C.body, 1, C.bodyD]), 'rgba(0,0,0,0.6)', 0.8);
  g.beginPath(); g.ellipse(L * 0.05, by + B * 0.3, L * 0.4, B * 0.22, 0, 0, TAU); g.fillStyle = rgba(C.belly, 0.7); g.fill();
  // Panzerplatten
  if (Q.plates) for (let i = 0; i < Q.plates; i++) {
    const x = -L * 0.4 + i * (L * 0.8 / (Q.plates - 1 || 1));
    g.beginPath(); g.ellipse(x, by - B * 0.35, L * 0.14, B * 0.28, 0, Math.PI, 0);
    paint(g, lg(g, x, by - B * 0.6, x, by - B * 0.2, [0, shade(C.horn, 0.2), 1, shade(C.horn, -0.4)]), 'rgba(0,0,0,0.6)', 0.6);
  }
  // Rueckenstacheln
  for (let i = 0; i < (Q.spikes || 0); i++) {
    const x = -L * 0.35 + i * (L * 0.7 / Math.max(1, Q.spikes - 1)), y = by - B * 0.5 + Math.abs(x) * 0.08;
    g.beginPath(); g.moveTo(x - 2, y + 1); g.lineTo(x - 1, y - B * 0.45 - (i % 2) * 2); g.lineTo(x + 2, y + 1); g.closePath();
    g.fillStyle = lg(g, x, y, x, y - B * 0.5, [0, C.horn, 1, '#ffffff']); g.fill();
  }
  // leuchtende Flecken
  if (C.glow) for (let i = 0; i < 4; i++) { const x = -L * 0.3 + i * L * 0.18, y = by - B * 0.1 + (i % 2) * 3; glowDot(g, x, y, 3.5, C.glow, 0.7); }
  leg(legs[0], true); leg(legs[1], false);
  // Kopf
  g.save(); g.translate(L * 0.52, by - B * 0.2); g.rotate(-0.1 + Math.sin(t) * 0.05 - atk * 0.2);
  const hs = Q.head, jaw = 1 + atk * 3 + Math.sin(t * 2) * 0.6;
  if (hs === 'toad') {
    g.beginPath(); g.ellipse(4, 0, B * 0.5, B * 0.36, 0, 0, TAU); paint(g, lg(g, 0, -B * 0.3, 0, B * 0.3, [0, C.bodyL, 1, C.body]), 'rgba(0,0,0,0.6)', 0.7);
    g.fillStyle = '#2a0a0a'; g.beginPath(); g.ellipse(6, B * 0.12, B * 0.38, 1 + jaw * 0.8, 0, 0, TAU); g.fill();
    eye(g, 2, -B * 0.3, 1.6, C.eye); eye(g, 8, -B * 0.28, 1.4, C.eye);
  } else {
    const len = hs === 'rhino' ? B * 0.75 : B * 0.95;
    g.beginPath(); g.moveTo(-3, -B * 0.35); g.quadraticCurveTo(len * 0.5, -B * 0.42, len, -B * 0.08); g.lineTo(len, 0.5); g.lineTo(2, B * 0.25); g.closePath();
    paint(g, lg(g, 0, -B * 0.4, 0, B * 0.2, [0, C.bodyL, 1, C.body]), 'rgba(0,0,0,0.6)', 0.7);
    g.beginPath(); g.moveTo(2, B * 0.18); g.lineTo(len * 0.95, 0.5 + jaw); g.lineTo(len * 0.8, B * 0.16 + jaw); g.closePath(); paint(g, C.bodyD, 'rgba(0,0,0,0.6)', 0.5);
    g.fillStyle = '#fff4e0'; for (let k = 0; k < 4; k++) { const x = len * 0.35 + k * len * 0.16; g.beginPath(); g.moveTo(x, 0.4); g.lineTo(x + 0.8, 2 + jaw * 0.3); g.lineTo(x + 1.6, 0.4); g.fill(); }
    eye(g, len * 0.4, -B * 0.22, 1.3, C.eye);
    if (hs === 'wolf' || hs === 'king') { g.beginPath(); g.moveTo(0, -B * 0.3); g.lineTo(-2, -B * 0.75); g.lineTo(4, -B * 0.36); g.closePath(); paint(g, C.bodyD, null); }
    if (hs === 'rhino') { g.beginPath(); g.moveTo(len * 0.7, -B * 0.2); g.quadraticCurveTo(len * 0.95, -B * 0.7, len * 1.05, -B * 0.95); g.quadraticCurveTo(len * 0.9, -B * 0.4, len * 0.95, -B * 0.1); g.closePath(); paint(g, lg(g, 0, 0, 0, -B, [0, C.horn, 1, '#ffffff']), 'rgba(0,0,0,0.6)', 0.5); }
    if (hs === 'king') { for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(-1 + k * 4, -B * 0.35); g.quadraticCurveTo(-6 + k * 3, -B * 0.9, -10 + k * 4, -B * 1.1); g.quadraticCurveTo(-4 + k * 4, -B * 0.6, 2 + k * 4, -B * 0.33); g.closePath(); paint(g, lg(g, 0, 0, 0, -B, [0, C.horn, 1, '#ffffff']), 'rgba(0,0,0,0.6)', 0.5); } }
  }
  g.restore();
  g.restore();
}

/* ---------------------------------------------------------------- Dalki */
const SPEC_DALKI = { hipY: -27, torso: 22, headOff: 7.5, shoulderW: 15, legL: 13, legL2: 13.5, armL: 12, armL2: 12, stride: 7, lift: 3.5, lean: 0.18, shoulderDrop: 4, hipSpread: 1.4, stance: 1.4, armRest: 0.25 };
function drawDalki(g, ph, o, D) {
  const C = D.cols, n = D.spikes || 1;
  const st = { t: ph * 2, run: o && o.idle ? 0.2 : 1, phase: ph * TAU, cast: o && o.atk ? 1 : 0, aim: -0.6 };
  const P = makePose(SPEC_DALKI, st);
  const spike = (x, y, a, len, w) => {
    g.save(); g.translate(x, y); g.rotate(a);
    g.beginPath(); g.moveTo(-w, 0); g.quadraticCurveTo(-w * 0.3, -len * 0.6, 0, -len); g.quadraticCurveTo(w * 0.3, -len * 0.6, w, 0); g.closePath();
    paint(g, lg(g, -w, 0, w, -len, [0, C.spikeD, 0.6, C.spike, 1, '#ffffff']), 'rgba(0,0,0,0.7)', 0.5);
    g.restore();
  };
  // Rueckenstacheln (hinter dem Koerper)
  const back = [[-4, -18, -1.1, 14], [-5, -12, -1.3, 12], [-3, -6, -1.45, 10], [-5, -22, -0.8, 12]];
  g.save(); g.translate(P.hipX, P.hipY); g.rotate(P.lean);
  for (let i = 0; i < Math.min(n, 4); i++) spike(back[i][0], back[i][1], back[i][2], back[i][3] * (D.big ? 1.2 : 1), 2.4);
  g.restore();
  const leg = (L, dk) => {
    limb(g, L.hx, L.hy, L.kx, L.ky, 4, 3.2); paint(g, lg(g, L.hx, L.hy, L.kx, L.ky, [0, shade(C.skinL, dk), 1, shade(C.skin, dk)]), 'rgba(0,0,0,0.6)', 0.7);
    limb(g, L.kx, L.ky, L.fx, L.fy - 1.5, 3.2, 2.6); paint(g, shade(C.skinD, dk), 'rgba(0,0,0,0.6)', 0.7);
    g.beginPath(); g.moveTo(L.fx - 3, L.fy - 2.5); g.lineTo(L.fx + 5, L.fy - 1); g.lineTo(L.fx + 5.5, L.fy + 0.2); g.lineTo(L.fx - 3.2, L.fy + 0.2); g.closePath(); paint(g, shade(C.skinD, dk - 0.1), null);
  };
  const arm = (A, dk, front) => {
    limb(g, A.sx, A.sy, A.ex, A.ey, 4, 3.4); paint(g, lg(g, A.sx, A.sy, A.ex, A.ey, [0, shade(C.skinL, dk), 1, shade(C.skin, dk)]), 'rgba(0,0,0,0.6)', 0.7);
    limb(g, A.ex, A.ey, A.hx, A.hy, 3.4, 3); paint(g, shade(C.skin, dk - 0.05), 'rgba(0,0,0,0.6)', 0.7);
    g.beginPath(); g.arc(A.hx, A.hy, 3.2, 0, TAU); paint(g, shade(C.skinD, dk), 'rgba(0,0,0,0.6)', 0.6);
    if (D.fur) { g.fillStyle = shade(C.horn || '#e8e0d0', dk); for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(A.hx + 2, A.hy + k * 1.5); g.lineTo(A.hx + 6, A.hy + k * 2.2 + 1); g.lineTo(A.hx + 2, A.hy + k * 1.5 + 1); g.fill(); } }
    if (n >= 5 && front) spike(A.ex, A.ey, -2.2, 8, 1.6);
  };
  leg(P.legB, -0.35); arm(P.armB, -0.35, false);
  g.save(); g.translate(P.hipX, P.hipY); g.rotate(P.lean);
  const T = SPEC_DALKI.torso;
  g.beginPath(); g.moveTo(-6.5, 1); g.bezierCurveTo(-10, -T * 0.4, -11, -T * 0.85, -7, -T - 1); g.lineTo(8, -T - 1); g.bezierCurveTo(12, -T * 0.7, 9, -T * 0.35, 6.5, 1); g.closePath();
  paint(g, lg(g, -8, -T, 8, 0, [0, C.skinL, 0.4, C.skin, 1, C.skinD]), 'rgba(0,0,0,0.6)', 0.8);
  // Muskelzeichnung
  g.strokeStyle = rgba('#000000', 0.3); g.lineWidth = 0.7;
  g.beginPath(); g.moveTo(1, -T + 2); g.lineTo(1, -4); g.moveTo(-5, -T * 0.62); g.quadraticCurveTo(1, -T * 0.52, 8, -T * 0.64); g.moveTo(-3, -T * 0.35); g.lineTo(6, -T * 0.35); g.stroke();
  if (D.fur) { g.fillStyle = C.fur; for (let k = 0; k < 7; k++) { g.beginPath(); g.moveTo(-8 + k * 2.4, -T - 1); g.lineTo(-9 + k * 2.4, -T + 5 + (k % 2) * 2); g.lineTo(-6 + k * 2.4, -T - 1); g.fill(); } }
  // Lendenschurz / Riemen
  g.fillStyle = C.cloth; g.beginPath(); g.moveTo(-6.5, -2); g.lineTo(6.5, -2); g.lineTo(5, 8); g.lineTo(0, 6); g.lineTo(-5, 8); g.closePath(); g.fill();
  if (D.armor) { g.strokeStyle = '#1a1414'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-7, -T + 1); g.lineTo(7, -4); g.stroke(); }
  g.restore();
  leg(P.legF, 0);
  // Kopf: kahl, schwere Brauen, rote Augen, ab 3 Stacheln Kopfstachel
  g.save(); g.translate(P.headX + 1, P.headY + 2); g.rotate(P.headA * 0.5);
  if (n >= 3) spike(-2, -5, -0.7, 8 + n, 1.8);
  if (D.fur) { g.beginPath(); g.moveTo(-5, 4); g.quadraticCurveTo(-8, -4, -2, -7); g.quadraticCurveTo(-8, -1, -6, 5); g.closePath(); paint(g, C.fur, null); }
  g.beginPath(); g.moveTo(-4.5, -4); g.quadraticCurveTo(0, -7.5, 4, -4.8); g.lineTo(5.2, -1.2); g.lineTo(D.fur ? 9 : 5.5, D.fur ? 1 : 0.8); g.lineTo(4.5, 3.8); g.quadraticCurveTo(0, 6, -4, 3); g.closePath();
  paint(g, lg(g, 0, -7, 0, 5, [0, C.skinL, 1, C.skin]), 'rgba(0,0,0,0.7)', 0.6);
  g.fillStyle = rgba('#000000', 0.35); g.fillRect(0.5, -3.4, 5, 1.2);
  eye(g, 3, -1.8, 0.95, C.eye);
  g.fillStyle = '#f4ecd6'; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(1.5 + k * 1.3, 2.4); g.lineTo(2 + k * 1.3, 3.8); g.lineTo(2.5 + k * 1.3, 2.4); g.fill(); }
  g.restore();
  // Schulterstacheln
  if (n >= 4) { spike(P.shF[0] - 1, P.shF[1] - 2, -0.4, 10, 2); }
  if (n >= 6) { spike(P.shB[0], P.shB[1] - 2, -0.9, 10, 2); spike(P.shF[0] + 2, P.shF[1] - 1, 0.2, 9, 1.8); }
  if (n >= 7) spike(P.neckX - 2, P.neckY - 2, -1.2, 13, 2.2);
  if (n >= 8) spike(P.neckX + 1, P.neckY - 3, -0.2, 14, 2.4);
  arm(P.armF, 0, true);
}

/* ---------------------------------------------------------------- Heldenfiguren als Gegner */
function heroAsEnemy(heroId, look) {
  return (g, ph, o) => {
    const art = HERO_ART[heroId];
    const P = makePose(art.spec, { t: ph * 2, run: o && o.idle ? 0.2 : 1, phase: ph * TAU, cast: o && o.atk ? 1 : 0, aim: 0.1 });
    art.draw(g, P, look || {});
  };
}
// Palettenwechsel waehrend des Malens (fuer Varianten derselben Figur)
function withPal(pairs, fn) {
  const saved = pairs.map(([obj, ov]) => { const old = {}; for (const k in ov) old[k] = obj[k]; Object.assign(obj, ov); return [obj, old]; });
  try { return fn(); } finally { for (const [obj, old] of saved) Object.assign(obj, old); }
}

/* ---------------------------------------------------------------- Registrierung */
const QCOL = {
  grau: { body: '#6a6e62', bodyL: '#9aa08e', bodyD: '#3a3e34', belly: '#8a8a78', eye: '#ffd24a', horn: '#d8d0bc' },
  panzer: { body: '#5a5048', bodyL: '#8a7c6a', bodyD: '#2e2822', belly: '#7a6a5a', eye: '#ff7a3a', horn: '#b0a490' },
  kroete: { body: '#4a6a3a', bodyL: '#7a9a5a', bodyD: '#24361c', belly: '#b8c090', eye: '#ffea6a', horn: '#c8d0a0', glow: '#9aff5a' },
  wolfK: { body: '#3a3440', bodyL: '#6a6070', bodyD: '#1a161e', belly: '#5a5060', eye: '#ff3a3a', horn: '#e8e0d0' },
  alien: { body: '#3a2a5a', bodyL: '#6a4a9a', bodyD: '#1a1030', belly: '#5a4a7a', eye: '#5affe0', horn: '#c8b8ff', glow: '#5affe0' },
  alienK: { body: '#2a3a5a', bodyL: '#4a6a9a', bodyD: '#10182e', belly: '#4a5a7a', eye: '#ff5ae0', horn: '#b8e8ff', glow: '#ff5ae0' },
  gold: { body: '#b8a070', bodyL: '#f0e0b0', bodyD: '#6a5a30', belly: '#fff4d8', eye: '#ffffff', horn: '#fff0c0', glow: '#fff0a0' },
  void: { body: '#2a2046', bodyL: '#5a4a8a', bodyD: '#100a20', belly: '#4a3a70', eye: '#c08aff', horn: '#e0d0ff', glow: '#9a6aff' }
};
const DCOL = {
  grau: { skin: '#7c808e', skinL: '#aeb2c0', skinD: '#44475a', spike: '#c8cad8', spikeD: '#4a4c5a', eye: '#ff2a2a', cloth: '#1a1414' },
  wolf: { skin: '#6e6a74', skinL: '#a09aa8', skinD: '#3a3640', spike: '#d8d0e0', spikeD: '#4a4250', eye: '#ffb02a', cloth: '#1a1010', fur: '#3a302c', horn: '#e8e0d0' }
};
function quadArt(Q, box, rim) { return { draw: (g, ph, o) => drawQuad(g, ph, o, Q), frames: 8, box, anchor: 0.86, rim, h: Q.H + Q.bulk * 1.2 }; }
function dalkiArt(D, box, rim) { return { draw: (g, ph, o) => drawDalki(g, ph, o, D), frames: 8, box: box || 80, anchor: 0.82, rim: rim || '#ff5a5a', h: 60 }; }
function heroArt(heroId, pal, look, rim, box) { return { draw: (g, ph, o) => withPal(pal, () => heroAsEnemy(heroId, look)(g, ph, o)), frames: 8, box: box || 120, anchor: 0.78, rim, h: 64 }; }
function palArt(baseId, pal, rim) { const A = ENEMY_ART[baseId]; return Object.assign({}, A, { draw: (g, ph, o) => withPal(pal, () => A.draw(g, ph, o)), rim: rim || A.rim }); }

Object.assign(ENEMY_ART, {
  // Kapitel 1: Akademie — Basis- & Mittelstufen-Bestien
  q_basis: quadArt({ L: 26, H: 12, bulk: 14, legW: 2.4, head: 'wolf', tail: 8, cols: QCOL.grau }, 64, '#c8ff9a'),
  q_panzer: quadArt({ L: 34, H: 12, bulk: 20, legW: 3.6, head: 'rhino', plates: 3, cols: QCOL.panzer }, 84, '#ffb07a'),
  q_kroete: quadArt({ L: 26, H: 8, bulk: 18, legW: 3, head: 'toad', cols: QCOL.kroete }, 68, '#c8ff7a'),
  q_mutter: quadArt({ L: 40, H: 14, bulk: 26, legW: 4, head: 'toad', spikes: 5, cols: QCOL.kroete }, 96, '#c8ff7a'),
  q_fort: quadArt({ L: 40, H: 18, bulk: 22, legW: 4, head: 'king', spikes: 4, tail: 12, cols: QCOL.wolfK }, 100, '#ff5a5a'),
  bat_braun: palArt('bat', [[EPAL.bat, { fur: '#3a2a1a', furL: '#6a4a2a', wing: '#4a3a24', wingL: '#7a5a34', eye: '#ffd24a' }]], '#ffd27a'),
  // Kapitel 2: Bestien-Planet
  q_alien: quadArt({ L: 28, H: 13, bulk: 15, legW: 2.4, head: 'wolf', tail: 10, spikes: 3, cols: QCOL.alien }, 66, '#9a7aff'),
  q_alienP: quadArt({ L: 36, H: 13, bulk: 22, legW: 3.8, head: 'rhino', plates: 4, cols: QCOL.alienK }, 90, '#7ac8ff'),
  q_spore: quadArt({ L: 26, H: 8, bulk: 18, legW: 3, head: 'toad', spikes: 3, cols: QCOL.alien }, 70, '#b07aff'),
  q_alienM: quadArt({ L: 42, H: 15, bulk: 27, legW: 4.2, head: 'toad', spikes: 6, cols: QCOL.alienK }, 100, '#7ac8ff'),
  q_koenig: quadArt({ L: 46, H: 20, bulk: 26, legW: 4.6, head: 'king', spikes: 6, tail: 14, cols: QCOL.alienK }, 116, '#ff5ae0'),
  bat_alien: palArt('bat', [[EPAL.bat, { fur: '#2a1a4a', furL: '#5a3a8a', wing: '#3a2a6a', wingL: '#6a4aaa', eye: '#5affe0' }]], '#9a7aff'),
  // Kapitel 3 & 5: Dalki
  dalki1: dalkiArt({ spikes: 1, cols: DCOL.grau }),
  dalki2: dalkiArt({ spikes: 2, cols: DCOL.grau }),
  dalki3: dalkiArt({ spikes: 3, cols: DCOL.grau, armor: true }),
  dalki5: dalkiArt({ spikes: 5, cols: DCOL.grau, armor: true, big: true }, 90),
  dalki6: dalkiArt({ spikes: 6, cols: DCOL.grau, armor: true, big: true }, 96),
  dalkiW: dalkiArt({ spikes: 4, cols: DCOL.wolf, fur: true }, 84, '#ffb02a'),
  bat_aas: palArt('bat', [[EPAL.bat, { fur: '#2a2420', furL: '#5a4a40', wing: '#3a302a', wingL: '#6a5a4a', eye: '#ff6a2a' }]], '#ff8a5a'),
  // Kapitel 4: Vampir-Siedlung (Heldenfiguren umgefaerbt)
  v_wache: heroArt('nyx', [[HERO_PAL.nyx, { cloak: '#2a1418', cloakL: '#5a2a32', cloakD: '#100608', scarf: '#6a0a18', scarfL: '#ff3a4e', eye: '#ff3a4e', rim: '#ff3a4e' }]], { flow: 0.2 }, '#ff3a4e', 110),
  v_ritter: heroArt('vorian', [[HERO_PAL.vorian, { armor: '#2a2a32', armorL: '#5a5a66', red: '#6a0a1a', redL: '#c0183a', hair: '#1a1418' }]], { glow: 0.4 }, '#ff3a4e', 120),
  v_magier: heroArt('liora', [[HERO_PAL.liora, { coat: '#3a0a2a', coatL: '#7a1a5a', coatD: '#1a0410', hair: '#e8e0e8', hairL: '#ffffff' }]], { rage: 0.5 }, '#ff5ab0', 110),
  bat_blut: palArt('bat', [], '#ff5a6a'),
  v_thrall: palArt('brute', [[EPAL.brute, { skin: '#9a8a90', skinL: '#d0c4c8', skinD: '#4a3a40', eye: '#ff2a3a' }]], '#ff5a6a'),
  // Storybook: Menschen, Fraktionen, neue Bestien
  h_laeufer: heroArt('vorian', [[HERO_PAL.vorian, { skin: '#d8c0a8', armor: '#3a4230', armorL: '#6a7456', armorD: '#161a10', red: '#4a5a2a', redL: '#a0c050', redD: '#1a2208', hair: '#3a2a1a', eye: '#e0c050', rim: '#e0c050' }]], { plain: true, glow: 0 }, '#e0c050', 116),
  h_wache: heroArt('vorian', [[HERO_PAL.vorian, { skin: '#d8c0a8', armor: '#22261c', armorL: '#4a5040', armorD: '#0a0c08', red: '#6a5a2a', redL: '#e0c050', redD: '#2a2208', hair: '#1a1a1a', eye: '#e0c050', rim: '#e0c050' }]], { plain: true, glow: 0.2 }, '#e0c050', 120),
  h_truedream: heroArt('liora', [[HERO_PAL.liora, { coat: '#d8d8e0', coatL: '#ffffff', coatD: '#7a7a88', hair: '#2a2430', hairL: '#5a5068', eye: '#8ab0ff', rim: '#8ab0ff' }]], { weapon: 'sword' }, '#8ab0ff', 110),
  h_torres: heroArt('vorian', [[HERO_PAL.vorian, { skin: '#e0c0a0', armor: '#5a2a14', armorL: '#a0582a', armorD: '#200a04', red: '#e05a1a', redL: '#ffb040', redD: '#5a1a04', hair: '#c04a1a', eye: '#ffb040', rim: '#ff8a2a' }]], { plain: true, glow: 0.8 }, '#ff8a2a', 120),
  h_jack: heroArt('vorian', [[HERO_PAL.vorian, { skin: '#e0d0c0', armor: '#e8e8f0', armorL: '#ffffff', armorD: '#8a8a98', red: '#2a4a8a', redL: '#8ab0ff', redD: '#0a1a3a', hair: '#d8c070', eye: '#8ab0ff', rim: '#8ab0ff' }]], { plain: true, glow: 0.5 }, '#8ab0ff', 120),
  h_sunshield: heroArt('vorian', [[HERO_PAL.vorian, { skin: '#e0c8b0', armor: '#a89060', armorL: '#e8d8a0', armorD: '#4a3a18', red: '#c07a1a', redL: '#ffd04a', redD: '#4a2a04', hair: '#3a2a1a', eye: '#ffd04a', rim: '#ffd04a' }]], { plain: true, glow: 0.2 }, '#ffd04a', 116),
  h_pure: heroArt('shen', [[HERO_PAL.shen, { robe: '#1a1a22', robeL: '#3a3a4a', robeD: '#08080c', sash: '#e8e8f0', sashL: '#ffffff', hat: '#1a1a22', hatL: '#3a3a4a', hatD: '#050508', eye: '#e8f0ff', rim: '#e8f0ff' }]], { qi: 0.6 }, '#e8f0ff', 110),
  h_markiert: heroArt('nyx', [[HERO_PAL.nyx, { cloak: '#3a3a40', cloakL: '#6a6a74', cloakD: '#16161a', scarf: '#5a0a10', scarfL: '#ff1a2a', mask: '#c8b8b0', eye: '#ff1a2a', rim: '#ff1a2a' }]], { flow: 0.1 }, '#ff1a2a', 106),
  h_rotvamp: heroArt('nyx', [[HERO_PAL.nyx, { cloak: '#4a0a10', cloakL: '#8a1a24', cloakD: '#1a0206', scarf: '#1a0206', scarfL: '#ff3a1a', mask: '#e8d0c8', eye: '#ff3a1a', rim: '#ff3a1a' }]], { flow: 0.6 }, '#ff3a1a', 110),
  h_xander: heroArt('vorian', [[HERO_PAL.vorian, { armor: '#2a1a30', armorL: '#5a3a66', red: '#5a0a3a', redL: '#d02a8a', hair: '#e8e0e8', eye: '#ff3a8a', rim: '#ff3a8a' }]], { plain: true, glow: 0.6 }, '#ff3a8a', 120),
  h_klon: heroArt('shen', [[HERO_PAL.shen, { robe: '#e8e8ec', robeL: '#ffffff', robeD: '#9a9aa4', sash: '#2a8a5a', sashL: '#6aff9a', hat: '#e8e8ec', hatL: '#ffffff', hatD: '#8a8a94', eye: '#6aff9a', rim: '#6aff9a' }]], { qi: 0.3 }, '#6aff9a', 114),
  q_kanal: quadArt({ L: 26, H: 11, bulk: 13, legW: 2.2, head: 'wolf', tail: 10, cols: { body: '#4a4a44', bodyL: '#7a7a6a', bodyD: '#22221c', belly: '#6a6a5a', eye: '#b8ff3a', horn: '#c8c8b0' } }, 62, '#b8ff3a'),
  q_rot: quadArt({ L: 30, H: 14, bulk: 15, legW: 2.4, head: 'wolf', tail: 12, spikes: 3, cols: { body: '#5a1a1e', bodyL: '#9a3a3a', bodyD: '#2a0608', belly: '#7a3030', eye: '#ffe06a', horn: '#e8d0c0', glow: '#ff5a3a' } }, 70, '#ff5a3a'),
  q_rotP: quadArt({ L: 38, H: 14, bulk: 22, legW: 3.8, head: 'rhino', plates: 4, cols: { body: '#4a1418', bodyL: '#8a3034', bodyD: '#200406', belly: '#6a2a2a', eye: '#ffb02a', horn: '#e8d0c0' } }, 90, '#ff7a3a'),
  q_orange: quadArt({ L: 44, H: 19, bulk: 25, legW: 4.4, head: 'king', spikes: 5, tail: 14, cols: { body: '#6a3a14', bodyL: '#b06a2a', bodyD: '#2a1404', belly: '#8a5a2a', eye: '#ffe06a', horn: '#f0e0c0' } }, 112, '#ffa03a'),
  q_caladi: quadArt({ L: 30, H: 12, bulk: 14, legW: 2.2, head: 'rhino', tail: 6, spikes: 2, cols: { body: '#8a7050', bodyL: '#c0a878', bodyD: '#4a3a24', belly: '#a89070', eye: '#ff5a2a', horn: '#f0e8d0' } }, 66, '#ffb07a'),
  q_hase: quadArt({ L: 20, H: 10, bulk: 12, legW: 2, head: 'wolf', tail: 4, cols: { body: '#16141a', bodyL: '#3a3440', bodyD: '#050406', belly: '#2a2430', eye: '#ff2a3a', horn: '#e8e0e8' } }, 56, '#ff2a3a'),
  q_daemon: quadArt({ L: 48, H: 20, bulk: 28, legW: 5, head: 'king', spikes: 8, tail: 16, plates: 3, cols: { body: '#2a0a0e', bodyL: '#6a1a20', bodyD: '#0a0204', belly: '#4a1016', eye: '#ffffff', horn: '#ff5a3a', glow: '#ff2a1a' } }, 120, '#ff3a1a'),
  dalki4: dalkiArt({ spikes: 4, cols: DCOL.grau, armor: true }, 84),
  // Kapitel 6: Himmelsebene
  h_juenger: heroArt('shen', [[HERO_PAL.shen, { robe: '#d8d0b8', robeL: '#ffffff', robeD: '#9a9278', sash: '#c9a24c', sashL: '#ffe6a0', hat: '#e8d8a0', hatL: '#fff4d0', hatD: '#9a8a50', eye: '#ffe6a0', rim: '#ffe6a0' }]], { qi: 0.6 }, '#ffe6a0', 110),
  h_ritter: palArt('knight', [[EPAL.knight, { iron: '#b8a878', ironL: '#fff0c8', ironD: '#6a5a30', bone: '#ffffff', eye: '#ffe6a0', rust: '#d8b050', wood: '#e8d8b0' }]], '#ffe6a0'),
  h_seherin: palArt('witch', [[EPAL.witch, { robe: '#d8d4e0', robeL: '#ffffff', robeD: '#8a8698', skin: '#fff0e0', flame: '#ffe6a0', eye: '#ffd27a' }]], '#ffe6a0'),
  bat_licht: palArt('bat', [[EPAL.bat, { fur: '#d8d0b0', furL: '#ffffff', wing: '#e8d8a0', wingL: '#fff8e0', eye: '#ffb040' }]], '#ffe6a0'),
  h_koloss: palArt('brute', [[EPAL.brute, { skin: '#d8c8a0', skinL: '#fff4d8', skinD: '#8a7a50', stitch: '#c9a24c', eye: '#ffffff' }]], '#ffe6a0'),
  h_waechter: palArt('captain', [[EPAL.captain, { iron: '#c8b890', ironL: '#fff4d8', ironD: '#6a5a30', cape: '#f4eee4', capeD: '#b0a898', eye: '#ffe6a0', gold: '#ffe6a0' }]], '#ffe6a0'),
  // Kapitel 7: Reich der Goetter
  q_void: quadArt({ L: 30, H: 13, bulk: 16, legW: 2.6, head: 'wolf', tail: 12, spikes: 4, cols: QCOL.void }, 70, '#c08aff'),
  q_voidP: quadArt({ L: 38, H: 14, bulk: 23, legW: 4, head: 'rhino', plates: 4, cols: QCOL.void }, 92, '#c08aff'),
  g_seherin: palArt('witch', [[EPAL.witch, { robe: '#2a2046', robeL: '#5a4a8a', robeD: '#0a0614', skin: '#c8b8ff', flame: '#c08aff', eye: '#ffe6a0' }]], '#c08aff'),
  bat_void: palArt('bat', [[EPAL.bat, { fur: '#1a1030', furL: '#4a3a7a', wing: '#2a1a5a', wingL: '#6a4aaa', eye: '#ffe6a0' }]], '#c08aff'),
  g_ritter: palArt('knight', [[EPAL.knight, { iron: '#2a2046', ironL: '#6a5a9a', ironD: '#0a0616', eye: '#ffe6a0', bone: '#e0d8ff' }]], '#c08aff'),
  g_diener: palArt('captain', [[EPAL.captain, { iron: '#2a2046', ironL: '#6a5a9a', ironD: '#0a0616', cape: '#4a2a8a', capeD: '#140a2a', eye: '#ffe6a0', gold: '#ffe6a0' }]], '#c08aff')
});

/* ---------------------------------------------------------------- Bosse (live gemalt) */
function humanBoss(g, st, hero, pal, look, sc) {
  g.scale(sc, sc);
  const SP = { vorian: SPEC_VORIAN, liora: SPEC_LIORA, nyx: SPEC_NYX, shen: SPEC_SHEN }[hero];
  const DR = { vorian: drawVorian, liora: drawLiora, nyx: drawNyx, shen: drawShen }[hero];
  withPal(pal, () => { const P = makePose(SP, { t: st.t, run: st.run || 0, phase: st.phase || 0, cast: Math.min(1, st.slam || 0), aim: -1.1, hurt: st.hurt || 0, dead: st.dead || 0 }); DR(g, P, look || {}); });
}
const BOSS_ART = {
  // Kapitel 1: Fortgeschrittene Bestie (gross)
  bestieF: (g, st) => { g.scale(2.4, 2.4); drawQuad(g, (st.t * 0.9) % 1, { rear: Math.min(1, st.slam || 0), atk: st.roar || 0 }, { L: 40, H: 18, bulk: 22, legW: 4, head: 'king', spikes: 5, tail: 12, cols: QCOL.wolfK }); },
  // Kapitel 2: Kaiserstufen-Bestie
  bestieK: (g, st) => { g.scale(2.9, 2.9); drawQuad(g, (st.t * 0.8) % 1, { rear: Math.min(1, st.slam || 0), atk: st.roar || 0 }, { L: 48, H: 20, bulk: 28, legW: 5, head: 'king', spikes: 8, tail: 16, plates: 3, cols: QCOL.alienK }); },
  // Kapitel 3: Dalki-Kommandant (7 Stacheln)
  dalkiK: (g, st) => { g.scale(3, 3); drawDalki(g, (st.t * 0.6) % 1, { atk: st.slam > 0.2 ? 1 : 0, idle: !st.run }, { spikes: 7, cols: DCOL.grau, armor: true, big: true }); },
  // Kapitel 4: Anfuehrer der Vampirfamilien
  vampF: (g, st) => { g.scale(2.4, 2.4); withPal([[HERO_PAL.vorian, { armor: '#1a1418', armorL: '#4a3a44', red: '#8a0a1a', redL: '#ff2a40', hair: '#d8d0d8' }]], () => { const P = makePose(SPEC_VORIAN, { t: st.t, run: st.run || 0, phase: st.phase || 0, cast: Math.min(1, st.slam || 0), aim: -1.1, hurt: st.hurt || 0, dead: st.dead || 0 }); drawVorian(g, P, { glow: 1, crown: 2 }); }); },
  // Kapitel 5: Graham — Dalki-Werwolf mit acht Stacheln
  graham: (g, st) => { g.scale(3.4, 3.4); drawDalki(g, (st.t * 0.55) % 1, { atk: st.slam > 0.2 ? 1 : 0, idle: !st.run }, { spikes: 8, cols: Object.assign({}, DCOL.wolf, { eye: st.enrage ? '#ff2a1a' : '#ffb02a' }), fur: true, armor: true, big: true }); },
  // Kapitel 6: der Himmlische Waechter (Lichtfluegel & Heiligenschein)
  himmlisch: (g, st) => {
    g.scale(2.4, 2.4);
    // Fluegel aus Licht
    for (const side of [-1, 1]) { g.save(); g.translate(-2, -52); g.scale(side, 1); g.rotate(-0.3 + Math.sin(st.t * 2) * 0.12); for (let f = 0; f < 6; f++) { g.save(); g.rotate(-0.4 - f * 0.22); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(14, -4, 34 - f * 3, -1); g.quadraticCurveTo(16, 4, 0, 3); g.closePath(); g.fillStyle = lg(g, 0, 0, 34, 0, [0, 'rgba(230,200,120,0.8)', 1, 'rgba(255,255,255,0.95)']); g.fill(); g.restore(); } g.restore(); }
    g.strokeStyle = '#ffe6a0'; g.lineWidth = 1.8; g.beginPath(); g.ellipse(-2, -74, 9, 3.2, -0.2, 0, TAU); g.stroke(); glowDot(g, -2, -74, 12, '#ffe6a0', 0.5);
    withPal([[HERO_PAL.shen, { robe: '#e8e0c8', robeL: '#ffffff', robeD: '#a8a088', sash: '#c9a24c', sashL: '#ffe6a0', hat: '#f4e8c0', hatL: '#ffffff', hatD: '#b0a060', skin: '#f0dcc8', eye: '#ffe6a0' }]], () => { const P = makePose(SPEC_SHEN, { t: st.t, run: st.run || 0, phase: st.phase || 0, cast: Math.min(1, st.slam || 0), aim: -1.2, rooted: st.run ? 0 : 0.6, hurt: st.hurt || 0, dead: st.dead || 0 }); drawShen(g, P, { qi: 1 }); });
  },
  // Storybook-Bosse ------------------------------------------------------
  container: (g, st) => { g.scale(2.3, 2.3); drawQuad(g, (st.t * 0.9) % 1, { rear: Math.min(1, st.slam || 0), atk: st.roar || 0 }, { L: 40, H: 16, bulk: 24, legW: 4, head: 'toad', spikes: 6, tail: 10, cols: Object.assign({}, QCOL.alien, { body: '#5a3a1a', bodyL: '#9a6a3a', bodyD: '#2a1808', eye: '#ffb02a', glow: '#ff8a2a' }) }); },
  blutsauger: (g, st) => { g.scale(2.6, 2.6); drawQuad(g, (st.t * 1.1) % 1, { rear: Math.min(1, st.slam || 0), atk: st.roar || 0 }, { L: 44, H: 26, bulk: 12, legW: 2.2, head: 'wolf', spikes: 3, tail: 18, cols: { body: '#c8b8b0', bodyL: '#f4ece8', bodyD: '#6a5a58', belly: '#e0d0cc', eye: '#ff1a2a', horn: '#fff4f0', glow: '#ff2a3a' } }); },
  dalki1: (g, st) => { g.scale(3, 3); drawDalki(g, (st.t * 0.6) % 1, { atk: st.slam > 0.2 ? 1 : 0, idle: !st.run }, { spikes: 1, cols: DCOL.grau, big: true }); },
  stahlmann: (g, st) => humanBoss(g, st, 'vorian', [[HERO_PAL.vorian, { skin: '#d8c0a8', skinD: '#8a7058', armor: '#3a4230', armorL: '#6a7456', armorD: '#161a10', red: '#6a5a2a', redL: '#e0c050', redD: '#2a2208', hair: '#8a8a8a', eye: '#e0c050', rim: '#e0c050' }]], { glow: 0.2, plain: true }, 2.3),
  silva: (g, st) => humanBoss(g, st, 'liora', [[HERO_PAL.liora, { skin: '#f0e0e8', coat: '#2a0a1a', coatL: '#6a1a3a', coatD: '#10040a', hair: '#e8e0f0', hairL: '#ffffff', eye: '#ff2a4a', rim: '#ff2a4a' }]], { rage: 0.7, weapon: 'sword' }, 2.3),
  sunshield: (g, st) => humanBoss(g, st, 'vorian', [[HERO_PAL.vorian, { skin: '#e0c8b0', armor: '#c8b070', armorL: '#fff0c0', armorD: '#6a5a28', red: '#e08a1a', redL: '#ffd04a', redD: '#6a3a08', hair: '#3a2a1a', eye: '#ffd04a', rim: '#ffd04a' }]], { glow: 0.6, plain: true }, 2.4),
  hagon: (g, st) => humanBoss(g, st, 'shen', [[HERO_PAL.shen, { robe: '#1a1a24', robeL: '#4a4a5a', robeD: '#08080c', inner: '#c8c8d8', sash: '#3a6aa0', sashL: '#8ac8ff', hat: '#2a2a34', hatL: '#5a5a6a', hatD: '#0a0a10', beard: '#d8d8e0', eye: '#8ac8ff', rim: '#8ac8ff' }]], { qi: 1 }, 2.5),
  original: (g, st) => humanBoss(g, st, 'nyx', [[HERO_PAL.nyx, { cloak: '#e8e0d8', cloakL: '#ffffff', cloakD: '#8a8278', scarf: '#6a0a14', scarfL: '#ff1a2a', mask: '#1a1418', maskD: '#000000', eye: '#ff1a2a', rim: '#ff1a2a' }]], { flow: 1 }, 2.7),
  samuel: (g, st) => humanBoss(g, st, 'shen', [[HERO_PAL.shen, { robe: '#e8e8ec', robeL: '#ffffff', robeD: '#9a9aa4', sash: '#2a8a5a', sashL: '#6aff9a', hat: '#e8e8ec', hatL: '#ffffff', hatD: '#8a8a94', eye: '#6aff9a', rim: '#6aff9a' }]], { qi: 0.3 }, 2.2),
  finnklon: (g, st) => { g.scale(2.3, 2.3); const P = makePose(SPEC_FINN, { t: st.t, run: st.run || 0, phase: st.phase || 0, cast: Math.min(1, st.slam || 0), aim: -1.1, hurt: st.hurt || 0, dead: st.dead || 0 }); drawFinn(g, P, { tier: 4 }); },
  arian: (g, st) => { g.scale(3.2, 3.2); drawDalki(g, (st.t * 0.55) % 1, { atk: st.slam > 0.2 ? 1 : 0, idle: !st.run }, { spikes: 6, cols: { skin: '#4a3a46', skinL: '#8a7486', skinD: '#1e141c', spike: '#f0e0e8', spikeD: '#6a4a5a', eye: st.enrage ? '#ff1a1a' : '#ff6a2a', cloth: '#2a0a10' }, armor: true, big: true }); },
  arianF: (g, st) => { glowDot(g, 0, -90, 120, '#ff2a1a', 0.35); g.scale(3.6, 3.6); drawDalki(g, (st.t * 0.5) % 1, { atk: st.slam > 0.2 ? 1 : 0, idle: !st.run }, { spikes: 7, cols: { skin: '#5a1a1e', skinL: '#a0444a', skinD: '#200608', spike: '#ffe0d0', spikeD: '#8a2a1a', eye: '#ffffff', cloth: '#100204' }, armor: true, big: true }); },
  // Kapitel 7: ein Gott — kosmischer Koloss mit Krone
  gott: (g, st) => {
    withPal([[BPAL, { skin: '#2a2046', skinL: '#5a4a8a', skinD: '#0a0616', bone: '#e8e0ff', boneD: '#8a7ab0', bell: '#4a3a8a', bellL: '#9a8ad0', heart: '#c08aff', iron: '#2a2440', ironL: '#6a5a9a' }]], () => drawBoss(g, st));
    g.save(); g.translate(22, -112); g.fillStyle = lg(g, 0, -30, 0, 0, [0, '#ffffff', 1, '#e6b050']);
    for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(k * 9 - 4, 0); g.lineTo(k * 9, -18 - (2 - Math.abs(k)) * 6); g.lineTo(k * 9 + 4, 0); g.fill(); }
    g.restore();
  }
};
