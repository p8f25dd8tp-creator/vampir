'use strict';
/* ==========================================================================
   FIGUREN — Skelett-Posen (aus der Nachtfall-Engine) und ein frei
   konfigurierbarer Mensch fuer alle Figuren dieses Spiels. Eigene Gestaltung.
   ========================================================================== */

function makePose(spec, st) {
  const run = st.run || 0, ph = st.phase || 0, t = st.t || 0;
  const cast = st.cast || 0, hurt = st.hurt || 0, dead = st.dead || 0, dodge = st.dodge || 0;
  const rooted = st.rooted || 0;
  const P = { t, run, ph, cast, hurt, dead, dodge, rooted, aim: st.aim || 0, spec };
  const breathe = Math.sin(t * 2.3) * 0.5 * (1 - run);
  const kneel = smooth(clamp(dead * 1.6, 0, 1));
  const crouch = (spec.crouch || 0) + rooted * 4 + dodge * 5;
  const stride = spec.stride * run * (1 - kneel);
  const lift = spec.lift * run * (1 - kneel);
  const bob = -(Math.abs(Math.cos(ph))) * 1.6 * run;
  P.hipX = 0;
  P.hipY = spec.hipY + bob + crouch + kneel * spec.legL * 0.75 + breathe * 0.3;
  P.lean = (spec.lean || 0) + 0.16 * run - hurt * 0.32 + cast * 0.06 + kneel * 0.45 + dodge * 0.35 - rooted * 0.05;
  const tor = spec.torso;
  P.neckX = P.hipX + Math.sin(P.lean) * tor;
  P.neckY = P.hipY - Math.cos(P.lean) * tor + breathe;
  const hl = P.lean * 0.7 - hurt * 0.35 + kneel * 0.3;
  P.headX = P.neckX + Math.sin(hl) * spec.headOff;
  P.headY = P.neckY - Math.cos(hl) * spec.headOff;
  P.headA = hl;
  // Schultern (vorne / hinten, leichte 3/4-Sicht)
  const sa = P.lean;
  const sx = Math.cos(sa), sy = Math.sin(sa);
  const shDrop = spec.shoulderDrop || 3;
  P.shF = [P.neckX + sx * spec.shoulderW * 0.5 - sy * shDrop, P.neckY + sy * spec.shoulderW * 0.5 + sx * shDrop];
  P.shB = [P.neckX - sx * spec.shoulderW * 0.5 - sy * shDrop, P.neckY - sy * spec.shoulderW * 0.5 + sx * shDrop];
  // Beine
  const legs = [];
  for (let i = 0; i < 2; i++) {
    const p = ph + i * Math.PI;
    const hx = P.hipX + (i === 0 ? 2 : -2) * (spec.hipSpread || 1);
    let fx = hx + Math.sin(p) * stride + (i === 0 ? 1.5 : -1.5) * (spec.stance || 1);
    let fy = -Math.max(0, Math.cos(p)) * lift;
    if (rooted > 0) { fx = lerp(fx, hx + (i === 0 ? 7 : -7), rooted); fy = lerp(fy, 0, rooted); }
    if (dodge > 0) { fx = lerp(fx, hx + (i === 0 ? 6 : -9), dodge); fy = lerp(fy, i === 0 ? 0 : -2, dodge); }
    if (kneel > 0) { fx = lerp(fx, hx + (i === 0 ? 7 : -9), kneel); fy = lerp(fy, 0, kneel); }
    const k = ik(hx, P.hipY, fx, fy, spec.legL, spec.legL2 || spec.legL, -1);
    legs.push({ hx, hy: P.hipY, kx: k[0], ky: k[1], fx: k[2], fy: k[3], lift: -fy });
  }
  P.legF = legs[0]; P.legB = legs[1];
  // Arme
  const arms = [];
  for (let i = 0; i < 2; i++) {
    const sh = i === 0 ? P.shF : P.shB;
    const p = ph + i * Math.PI;
    const swing = -Math.sin(p) * 0.75 * run;
    let ang = Math.PI / 2 + 0.15 + swing - P.lean * 0.4 + (spec.armRest || 0) * (i === 0 ? 1 : 0.6);
    const reach = (spec.armL + spec.armL2) * 0.94;
    let hx = sh[0] + Math.cos(ang) * reach, hy = sh[1] + Math.sin(ang) * reach;
    if (st.guard !== undefined && i === 0) { hx = lerp(hx, sh[0] + 7, st.guard); hy = lerp(hy, sh[1] + 4, st.guard); }
    if (cast > 0 && (i === 0 || spec.twoHandCast)) {
      const a = P.aim + (i === 1 ? -0.5 : 0);
      const cx = sh[0] + Math.cos(a) * reach * 0.98, cy = sh[1] + Math.sin(a) * reach * 0.98;
      hx = lerp(hx, cx, cast); hy = lerp(hy, cy, cast);
    }
    if (rooted > 0 && !cast) { // Meditations-/Kampfhaltung: Handflaechen vor der Brust
      const cx = sh[0] + (i === 0 ? 8 : 5), cy = sh[1] + (i === 0 ? 3 : 8);
      hx = lerp(hx, cx, rooted); hy = lerp(hy, cy, rooted);
    }
    if (dodge > 0) { hx = lerp(hx, sh[0] - 8, dodge * 0.8); hy = lerp(hy, sh[1] + 4, dodge * 0.8); }
    if (hurt > 0) { hx = lerp(hx, sh[0] - 6, hurt * 0.6); hy = lerp(hy, sh[1] - 2, hurt * 0.6); }
    if (kneel > 0) { hx = lerp(hx, sh[0] + (i === 0 ? 5 : -2), kneel); hy = lerp(hy, sh[1] + reach * 0.95, kneel); }
    const e = ik(sh[0], sh[1], hx, hy, spec.armL, spec.armL2, 1);
    arms.push({ sx: sh[0], sy: sh[1], ex: e[0], ey: e[1], hx: e[2], hy: e[3] });
  }
  P.armF = arms[0]; P.armB = arms[1];
  return P;
}

// Umhang / Band-Kurve, die im Lauf nach hinten weht (deterministisch)
function flowCurve(ax, ay, len, n, flow, t, seed, droop, lift) {
  const pts = [[ax, ay]];
  let x = ax, y = ay;
  const seg = len / n;
  for (let i = 1; i <= n; i++) {
    const s = i / n;
    const wave = Math.sin(t * (6 + flow * 5) - s * 5 + seed) * (0.18 + flow * 0.32) * s;
    const back = lerp(droop === undefined ? 0.12 : droop, 1.25 + (lift || 0), flow) * Math.pow(s, 0.7);
    const a = Math.PI / 2 + back + wave;
    x += Math.cos(a) * seg; y += Math.sin(a) * seg;
    pts.push([x, y]);
  }
  return pts;
}


const SPEC_HUMAN = { hipY: -26, torso: 20, headOff: 8.5, shoulderW: 11, legL: 13, legL2: 13, armL: 10.5, armL2: 10.5, stride: 8.5, lift: 4.6, lean: 0.05, shoulderDrop: 3, armRest: 0.1 };

/* Aussehen:
   top/topL/topD, leg/legD, shoe, skin/skinD, hair, eye, glasses, outfit ('hoodie' | 'uniform' | 'shirt'),
   hairStyle ('messy' | 'short' | 'spiky' | 'long' | 'bun'), claws (Tigerkrallen), glow (Augenleuchten) */
function drawPerson(g, P, L) {
  const t = P.t;
  const claws = L.claws || 0;
  // --- lange Haare hinter dem Kopf
  if (L.hairStyle === 'long') {
    g.save(); g.translate(P.headX, P.headY); g.rotate(P.headA);
    g.beginPath(); g.moveTo(-5, -5); g.quadraticCurveTo(-8, 4, -6, 12); g.lineTo(-1, 10); g.quadraticCurveTo(-2, 2, 0, -4); g.closePath();
    paint(g, L.hair, 'rgba(0,0,0,0.5)', 0.5);
    g.restore();
  }
  const leg = (Lg, dk) => {
    limb(g, Lg.hx, Lg.hy, Lg.kx, Lg.ky, 2.9, 2.4); paint(g, lg(g, Lg.hx, Lg.hy, Lg.kx + 3, Lg.ky, [0, shade(L.leg, dk + 0.05), 1, shade(L.legD, dk)]), 'rgba(0,0,0,0.6)', 0.6);
    limb(g, Lg.kx, Lg.ky, Lg.fx, Lg.fy - 1.8, 2.4, 2); paint(g, shade(L.leg, dk - 0.05), 'rgba(0,0,0,0.6)', 0.6);
    g.beginPath(); g.moveTo(Lg.fx - 2.6, Lg.fy - 3); g.lineTo(Lg.fx + 2, Lg.fy - 3.2); g.quadraticCurveTo(Lg.fx + 5, Lg.fy - 1.4, Lg.fx + 5.4, Lg.fy + 0.2); g.lineTo(Lg.fx - 2.8, Lg.fy + 0.2); g.closePath();
    paint(g, shade(L.shoe, dk), 'rgba(0,0,0,0.75)', 0.5);
  };
  const arm = (A, dk, front) => {
    limb(g, A.sx, A.sy, A.ex, A.ey, 2.6, 2.1); paint(g, lg(g, A.sx, A.sy, A.ex, A.ey, [0, shade(L.topL, dk - 0.1), 1, shade(L.top, dk)]), 'rgba(0,0,0,0.6)', 0.6);
    if (claws) { // Unterarm verwandelt sich: Fell mit Streifen, grosse Pranke
      limb(g, A.ex, A.ey, A.hx, A.hy, 2.1 + claws * 0.9, 1.8 + claws * 1.4); paint(g, shade('#d8862a', dk), 'rgba(0,0,0,0.7)', 0.6);
      g.strokeStyle = shade('#2a1406', dk); g.lineWidth = 0.7;
      for (let k = 1; k <= 3; k++) { const s = k / 4, x = lerp(A.ex, A.hx, s), y = lerp(A.ey, A.hy, s), a0 = Math.atan2(A.hy - A.ey, A.hx - A.ex) + Math.PI / 2; g.beginPath(); g.moveTo(x - Math.cos(a0) * 1.8, y - Math.sin(a0) * 1.8); g.lineTo(x + Math.cos(a0) * 1.2, y + Math.sin(a0) * 1.2); g.stroke(); }
      const a = Math.atan2(A.hy - A.ey, A.hx - A.ex);
      g.fillStyle = '#f4ecdc';
      for (let k = -1; k <= 1; k++) { const b = a + k * 0.35; g.beginPath(); g.moveTo(A.hx + Math.cos(b + 1.4) * 1.1, A.hy + Math.sin(b + 1.4) * 1.1); g.lineTo(A.hx + Math.cos(b) * (3 + claws * 4), A.hy + Math.sin(b) * (3 + claws * 4)); g.lineTo(A.hx + Math.cos(b - 1.4) * 1.1, A.hy + Math.sin(b - 1.4) * 1.1); g.fill(); }
    } else {
      limb(g, A.ex, A.ey, A.hx, A.hy, 2.1, 1.8); paint(g, shade(L.top, dk - 0.05), 'rgba(0,0,0,0.6)', 0.6);
      g.beginPath(); g.arc(A.hx, A.hy, 1.9, 0, TAU); paint(g, shade(L.skin, dk), 'rgba(40,20,20,0.7)', 0.5);
    }
    if (front && L.handGlow && P.cast > 0.05) glowDot(g, A.hx, A.hy, 5 + P.cast * 5, L.handGlow, 0.7 * P.cast);
  };
  leg(P.legB, -0.38); arm(P.armB, -0.38, false);
  // --- Rumpf
  g.save(); g.translate(P.hipX, P.hipY); g.rotate(P.lean);
  const T = SPEC_HUMAN.torso;
  g.beginPath();
  g.moveTo(-5.5, 2); g.bezierCurveTo(-7.5, -T * 0.4, -7.2, -T * 0.8, -5.5, -T - 0.5);
  g.lineTo(5.5, -T - 0.5); g.bezierCurveTo(7.6, -T * 0.7, 6.4, -T * 0.4, 5.5, 2); g.closePath();
  paint(g, lg(g, -6, -T, 6, 2, [0, L.topL, 0.45, L.top, 1, L.topD]), 'rgba(0,0,0,0.6)', 0.7);
  if (L.outfit === 'hoodie') {
    g.strokeStyle = 'rgba(0,0,0,0.4)'; g.lineWidth = 0.7;
    g.beginPath(); g.moveTo(-3.5, -2); g.lineTo(-2.5, -7); g.lineTo(4.5, -7); g.lineTo(5, -2); g.stroke();
    g.strokeStyle = '#d8d8e0'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(1.5, -T + 1); g.lineTo(1.2, -T + 6); g.moveTo(3.5, -T + 1); g.lineTo(3.8, -T + 5.5); g.stroke();
  } else if (L.outfit === 'uniform') {
    g.strokeStyle = shade(L.topD, -0.3); g.lineWidth = 0.8; g.beginPath(); g.moveTo(1.5, -T); g.lineTo(2, 1); g.stroke();
    g.fillStyle = L.trim || '#c8b070'; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(2.8, -T + 4 + k * 5, 0.55, 0, TAU); g.fill(); }
    g.fillStyle = L.trim || '#c8b070'; g.fillRect(-4.6, -T + 3, 3, 1.1);
    g.fillStyle = '#100a0c'; g.fillRect(-5.5, -1.5, 11.5, 2.2);
  } else {
    g.fillStyle = '#100a0c'; g.fillRect(-5.5, -1.5, 11.5, 2.2);
  }
  g.restore();
  leg(P.legF, 0);
  // --- Kopf
  g.save(); g.translate(P.headX, P.headY); g.rotate(P.headA);
  g.beginPath();
  g.moveTo(-4, -5.2); g.quadraticCurveTo(-0.5, -7.8, 3, -5.8); g.quadraticCurveTo(4.4, -3.6, 4, -1.8);
  g.lineTo(5.6, 0); g.lineTo(4.1, 0.6); g.quadraticCurveTo(4.5, 1.8, 3.8, 2.6); g.quadraticCurveTo(3, 5, 0.8, 5.4);
  g.quadraticCurveTo(-3, 5, -4.4, 1.8); g.closePath();
  paint(g, lg(g, 2, -6, -3, 5, [0, shade(L.skin, 0.3), 0.6, L.skin, 1, L.skinD]), 'rgba(50,30,30,0.7)', 0.55);
  g.beginPath(); g.moveTo(-1.8, -1.4); g.lineTo(-4.2, -3.6); g.lineTo(-2.2, 1.2); g.closePath(); paint(g, L.skinD, 'rgba(50,30,30,0.6)', 0.4);
  if (L.glow) eye(g, 2.6, -1.6, 1, L.eye);
  else { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(2.5, -1.6, 0.9, 0.7, 0, 0, TAU); g.fill(); g.fillStyle = L.eye; g.beginPath(); g.arc(2.8, -1.6, 0.5, 0, TAU); g.fill(); }
  g.strokeStyle = shade(L.hair, 0.1); g.lineWidth = 0.8; g.beginPath(); g.moveTo(1, -3); g.lineTo(4, L.angry ? -2 : -2.6); g.stroke();
  if (L.glasses) {
    g.strokeStyle = '#1a1a1e'; g.lineWidth = 0.7;
    g.beginPath(); g.rect(1.2, -2.8, 3.4, 2.4); g.moveTo(1.2, -1.8); g.lineTo(-2, -2.4); g.stroke();
    g.fillStyle = 'rgba(200,220,255,0.25)'; g.fillRect(1.2, -2.8, 3.4, 2.4);
  }
  g.beginPath();
  const hs = L.hairStyle || 'messy';
  if (hs === 'short') { g.moveTo(-5, -1); g.quadraticCurveTo(-6, -6, -2, -7.8); g.quadraticCurveTo(3, -8.6, 4.6, -4.6); g.quadraticCurveTo(2, -5.8, -0.5, -5.4); g.quadraticCurveTo(-2.5, -4, -3, -1); }
  else if (hs === 'spiky') { g.moveTo(-5, 0); g.lineTo(-7, -4); g.lineTo(-4.5, -5); g.lineTo(-5.5, -9); g.lineTo(-2, -7.5); g.lineTo(-0.5, -11); g.lineTo(1.5, -7.8); g.lineTo(4.5, -9.5); g.lineTo(3.6, -6.4); g.lineTo(6, -5); g.quadraticCurveTo(2, -5.6, -0.5, -5); g.quadraticCurveTo(-2.5, -3.5, -3, -0.5); }
  else if (hs === 'bun') { g.moveTo(-5, 0); g.quadraticCurveTo(-6.5, -6, -2, -8); g.quadraticCurveTo(3.5, -8.4, 4.8, -4.4); g.quadraticCurveTo(2, -5.8, -0.5, -5.3); g.quadraticCurveTo(-2.5, -3.5, -3, 0); g.closePath(); g.moveTo(-3.5, -7.5); g.arc(-4.5, -8.6, 2.4, 0, TAU); }
  else if (hs === 'long') { g.moveTo(-5, 2); g.quadraticCurveTo(-7, -6, -2, -8.2); g.quadraticCurveTo(4, -8.6, 5, -4); g.quadraticCurveTo(2, -6, -0.5, -5.2); g.quadraticCurveTo(-2.5, -3.5, -2.8, 2); }
  else { g.moveTo(-5, 0); g.quadraticCurveTo(-6.5, -5, -3.5, -7.6); g.lineTo(-2, -9); g.lineTo(-0.5, -7.8); g.lineTo(1.5, -9.2); g.lineTo(2.6, -7.6); g.quadraticCurveTo(5.4, -7.2, 4.8, -4); g.quadraticCurveTo(3, -5.6, 0.5, -5.2); g.quadraticCurveTo(-1.5, -4, -2.5, -1); }
  g.closePath();
  paint(g, lg(g, 0, -9, 0, 0, [0, shade(L.hair, 0.25), 1, L.hair]), 'rgba(0,0,0,0.5)', 0.5);
  g.restore();
  if (L.outfit === 'hoodie') { // Kapuze im Nacken
    g.save(); g.translate(P.neckX, P.neckY); g.rotate(P.lean);
    g.beginPath(); g.moveTo(-5, 2); g.quadraticCurveTo(-8, -2, -5, -5); g.quadraticCurveTo(-2, -3, 0, 1.5); g.closePath();
    paint(g, L.topD, 'rgba(0,0,0,0.5)', 0.5);
    g.restore();
  }
  arm(P.armF, 0, true);
}

/* Aussehen der Figuren (eigene Gestaltung) */
const LOOKS = {
  quinn: { outfit: 'hoodie', top: '#5c5e6c', topL: '#8a8c9a', topD: '#2c2e38', leg: '#34405a', legD: '#1a2030', shoe: '#e8e8ea', skin: '#e8c6ac', skinD: '#b08a74', hair: '#2a1c16', eye: '#6a4a2a', glasses: true, hairStyle: 'messy', rim: '#9ab0ff' },
  peter: { outfit: 'uniform', top: '#4a5a44', topL: '#76866e', topD: '#222a1e', leg: '#2e3628', legD: '#161a12', shoe: '#2a2420', skin: '#e8cdb0', skinD: '#a88a70', hair: '#8a6a3a', eye: '#4a6a3a', hairStyle: 'short', trim: '#b0a070', rim: '#9aff9a' },
  kyle: { outfit: 'uniform', top: '#6a2a1e', topL: '#9a4a36', topD: '#30100a', leg: '#2a1c18', legD: '#140c0a', shoe: '#1a1414', skin: '#e0b894', skinD: '#9a7458', hair: '#c8781e', eye: '#ffa030', hairStyle: 'spiky', trim: '#d0a060', angry: true, rim: '#ff9a3a' }
};
const HUMAN_BOX = 120;
function renderFigure(look, st, px, target, extra) {
  const S = Math.ceil(HUMAN_BOX * px);
  const raw = target && target.raw ? target.raw : mkCanvas(S, S);
  if (raw.width !== S) { raw.width = S; raw.height = S; }
  const g = raw.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, S, S);
  g.setTransform(px, 0, 0, px, S / 2, S * 0.78);
  g.lineCap = 'round'; g.lineJoin = 'round';
  const P = makePose(SPEC_HUMAN, st);
  drawPerson(g, P, extra ? Object.assign({}, look, extra) : look);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const out = target && target.out ? target.out : mkCanvas(S, S);
  if (out.width !== S) { out.width = S; out.height = S; }
  finishSprite(raw, { outline: Math.max(1.2, px * 0.62), rim: look.rim || '#9ab0ff', rimW: px * 0.75, rimA: 0.8, moonW: px * 0.55 }, out);
  return { raw, out, P, S, anchorY: S * 0.78 };
}
