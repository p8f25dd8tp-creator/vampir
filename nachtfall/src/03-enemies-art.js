'use strict';
/* ==========================================================================
   GEGNER-GRAFIK — gemalte Gegner. Normale Gegner werden beim Start in
   Animations-Frames vorgerendert (schnell bei Hunderten Gegnern), Bosse
   werden live aus ihrer Pose gemalt.
   ========================================================================== */

const EPAL = {
  ghoul: { skin: '#7d8a6c', skinL: '#aab794', skinD: '#3b4432', rag: '#4a3a2c', eye: '#ffd54a', claw: '#e8dcc0' },
  bat: { fur: '#2a1c22', furL: '#5a3a44', wing: '#4a1a26', wingL: '#8a2a3a', eye: '#ff3040' },
  knight: { bone: '#ddd3bb', boneD: '#8f866f', iron: '#4a4650', ironL: '#8a8494', ironD: '#1c1a20', rust: '#7a4a2a', wood: '#4a3020', eye: '#6ef0ff', cloth: '#3a2a3a' },
  witch: { robe: '#3c4640', robeL: '#6c7a70', robeD: '#141a16', skin: '#9aa89a', flame: '#7dff9a', eye: '#b8ff7a' },
  brute: { skin: '#8a6a68', skinL: '#c09690', skinD: '#3e2828', stitch: '#2a1010', bone: '#e0d6c0', eye: '#ffb030' },
  captain: { bone: '#e4dac2', boneD: '#8f866f', iron: '#3a3440', ironL: '#8c7c90', ironD: '#141018', cape: '#7a0a1a', capeD: '#2a0208', eye: '#ff4a2a', gold: '#c9a24c' }
};

/* ------------------------------------------------------------- GHUL */
const SPEC_GHOUL = { hipY: -19, torso: 14, headOff: 6, shoulderW: 8, legL: 9.5, legL2: 10, armL: 9.5, armL2: 10, stride: 6.5, lift: 3.5, lean: 0.75, shoulderDrop: 2, armRest: -0.9, stance: 1.2 };
function drawGhoul(g, ph, o) {
  const C = EPAL.ghoul;
  const P = makePose(SPEC_GHOUL, { t: ph * 2, run: 1, phase: ph * TAU, guard: 0 });
  // Klauen nach vorne gestreckt
  const reach = (A, i) => { const k = ik(A.sx, A.sy, A.sx + 12 + Math.sin(ph * TAU + i * 3) * 3, A.sy + 6 + Math.cos(ph * TAU + i) * 2, 9.5, 10, 1); A.ex = k[0]; A.ey = k[1]; A.hx = k[2]; A.hy = k[3]; };
  reach(P.armF, 0); reach(P.armB, 1.5);
  const leg = (L, dk) => {
    limb(g, L.hx, L.hy, L.kx, L.ky, 2.4, 1.8); paint(g, shade(C.skin, dk), 'rgba(0,0,0,0.6)', 0.6);
    limb(g, L.kx, L.ky, L.fx, L.fy - 1, 1.8, 1.4); paint(g, shade(C.skinD, dk + 0.1), 'rgba(0,0,0,0.6)', 0.6);
    g.beginPath(); g.moveTo(L.fx - 2, L.fy - 1.5); g.lineTo(L.fx + 4.5, L.fy + 0.2); g.lineTo(L.fx - 2.2, L.fy + 0.2); g.closePath(); paint(g, shade(C.skinD, dk), null);
  };
  const arm = (A, dk) => {
    limb(g, A.sx, A.sy, A.ex, A.ey, 2, 1.5); paint(g, shade(C.skin, dk), 'rgba(0,0,0,0.6)', 0.6);
    limb(g, A.ex, A.ey, A.hx, A.hy, 1.5, 1.3); paint(g, shade(C.skinL, dk - 0.1), 'rgba(0,0,0,0.6)', 0.6);
    const a = Math.atan2(A.hy - A.ey, A.hx - A.ex);
    g.save(); g.translate(A.hx, A.hy); g.rotate(a);
    g.fillStyle = shade(C.claw, dk);
    for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(0.5, k * 0.9); g.quadraticCurveTo(4, k * 1.6, 5.5, k * 2.2 + 1.2); g.lineTo(1, k * 0.9 + 0.7); g.fill(); }
    g.restore();
  };
  leg(P.legB, -0.35); arm(P.armB, -0.35);
  // Rumpf (ausgemergelt, Rippen)
  g.save(); g.translate(P.hipX, P.hipY); g.rotate(P.lean);
  g.beginPath(); g.moveTo(-4, 1.5); g.bezierCurveTo(-5.5, -6, -5.5, -12, -3, -14.5); g.lineTo(3.5, -14.5); g.bezierCurveTo(5.5, -10, 4.5, -5, 3.5, 1.5); g.closePath();
  paint(g, lg(g, -4, -14, 5, 0, [0, C.skinL, 0.4, C.skin, 1, C.skinD]), 'rgba(0,0,0,0.6)', 0.6);
  g.strokeStyle = 'rgba(30,40,20,0.55)'; g.lineWidth = 0.6;
  for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-3.5, -11 + k * 2.4); g.quadraticCurveTo(0, -10 + k * 2.4, 4, -11.5 + k * 2.4); g.stroke(); }
  // Wirbelsaeule (Buckel)
  g.fillStyle = shade(C.skinL, 0.1);
  for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(-4.8 + k * 0.2, -3 - k * 3, 0.9, 0, TAU); g.fill(); }
  // Lendentuch (Fetzen)
  g.beginPath(); g.moveTo(-4.5, -1); g.lineTo(4, -1); g.lineTo(3.5, 4 + Math.sin(ph * TAU) * 0.8); g.lineTo(1, 2.5); g.lineTo(-1.5, 5); g.lineTo(-4.5, 2.5); g.closePath();
  paint(g, C.rag, 'rgba(0,0,0,0.6)', 0.5);
  g.restore();
  leg(P.legF, 0);
  // Kopf: vorgestreckt, offener Kiefer
  g.save(); g.translate(P.headX + 2, P.headY + 3); g.rotate(P.lean * 0.3);
  g.beginPath(); g.moveTo(-3.5, -3); g.quadraticCurveTo(0, -6.5, 4, -4); g.quadraticCurveTo(5.8, -2.4, 5.5, 0); g.lineTo(3, 0.8); g.lineTo(-3, 2); g.closePath();
  paint(g, lg(g, 0, -6, 0, 2, [0, C.skinL, 1, C.skin]), 'rgba(0,0,0,0.6)', 0.55);
  const jaw = 1.5 + Math.sin(ph * TAU * 2) * 1;
  g.beginPath(); g.moveTo(-2.5, 1.5); g.lineTo(4.5, 0.5 + jaw); g.lineTo(3.5, 2.5 + jaw); g.lineTo(-2, 3); g.closePath();
  paint(g, C.skinD, 'rgba(0,0,0,0.6)', 0.5);
  g.fillStyle = '#2a0808'; g.beginPath(); g.moveTo(-1, 1.6); g.lineTo(4.5, 0.5); g.lineTo(4.5, 0.4 + jaw); g.closePath(); g.fill();
  g.fillStyle = '#efe6cc'; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(1.4 + k * 1.1, 0.8); g.lineTo(1.9 + k * 1.1, 1.8); g.lineTo(2.4 + k * 1.1, 0.7); g.fill(); }
  eye(g, 2.6, -2.3, 0.8, C.eye);
  // duennes Haar
  g.strokeStyle = '#2a2a22'; g.lineWidth = 0.4;
  for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-2 + k, -4.6); g.quadraticCurveTo(-4 + k, -3, -5 + k * 0.5, 0 + Math.sin(ph * TAU + k)); g.stroke(); }
  g.restore();
  arm(P.armF, 0);
}

/* ------------------------------------------------------------- BLUTFLEDERMAUS */
function drawBat(g, ph, o) {
  const C = EPAL.bat;
  const flap = Math.sin(ph * TAU);           // -1 .. 1
  const y0 = -22 + Math.sin(ph * TAU + 1) * 2;
  g.save(); g.translate(0, y0);
  const wing = (dir, dk) => {
    g.save(); g.scale(dir, 1);
    const up = flap * 11;
    const tipX = 17 - Math.abs(flap) * 3, tipY = -up - 2;
    const midX = 9, midY = -up * 0.55 - 3;
    g.beginPath();
    g.moveTo(1.5, -1.5);
    g.quadraticCurveTo(midX - 2, midY - 3, midX, midY);
    g.lineTo(tipX, tipY);
    // Membranbuchten
    g.quadraticCurveTo(tipX - 1, tipY + 6, tipX - 3, tipY + 9 + flap * 2);
    g.quadraticCurveTo(12, 3 - up * 0.2, 10, 4 - up * 0.2);
    g.quadraticCurveTo(7, 3.5, 6, 5.5 - up * 0.1);
    g.quadraticCurveTo(4, 3, 1.5, 2.5);
    g.closePath();
    paint(g, lg(g, 0, midY, tipX, tipY + 8, [0, shade(C.wingL, dk), 0.6, shade(C.wing, dk), 1, shade('#1a060a', dk)]), 'rgba(0,0,0,0.7)', 0.6);
    g.strokeStyle = shade('#1a0a10', dk); g.lineWidth = 0.7;
    g.beginPath(); g.moveTo(1.5, -1); g.lineTo(midX, midY); g.lineTo(tipX, tipY);
    g.moveTo(midX, midY); g.lineTo(tipX - 3, tipY + 9 + flap * 2);
    g.moveTo(midX, midY); g.lineTo(10, 4 - up * 0.2);
    g.moveTo(midX, midY); g.lineTo(6, 5.5 - up * 0.1); g.stroke();
    g.restore();
  };
  wing(-1, -0.25);
  wing(1, 0);
  // Koerper
  g.beginPath(); g.ellipse(0, 1, 4.2, 5.5, 0, 0, TAU);
  paint(g, rg(g, -1, -1, 0, 6, [0, C.furL, 1, C.fur]), 'rgba(0,0,0,0.7)', 0.6);
  // Kopf mit Ohren
  g.beginPath(); g.moveTo(-3.2, -3); g.lineTo(-3.8, -9); g.lineTo(-1.2, -5); g.lineTo(1.2, -5); g.lineTo(3.8, -9); g.lineTo(3.2, -3); g.quadraticCurveTo(0, 0.5, -3.2, -3); g.closePath();
  paint(g, lg(g, 0, -9, 0, -1, [0, C.furL, 1, C.fur]), 'rgba(0,0,0,0.7)', 0.5);
  eye(g, -1.4, -3.4, 0.7, C.eye); eye(g, 1.4, -3.4, 0.7, C.eye);
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-0.8, -1.6); g.lineTo(-0.5, -0.4); g.lineTo(-0.2, -1.6); g.moveTo(0.8, -1.6); g.lineTo(0.5, -0.4); g.lineTo(0.2, -1.6); g.fill();
  // Fuesse
  g.strokeStyle = '#140a0e'; g.lineWidth = 0.8;
  g.beginPath(); g.moveTo(-1.5, 6); g.lineTo(-2, 8.5); g.moveTo(1.5, 6); g.lineTo(2, 8.5); g.stroke();
  g.restore();
}

/* ------------------------------------------------------------- GRABRITTER (Skelettritter) */
const SPEC_KNIGHT = { hipY: -25, torso: 18, headOff: 8, shoulderW: 11, legL: 12, legL2: 12.5, armL: 10, armL2: 10, stride: 5.5, lift: 3, lean: 0.08, shoulderDrop: 3, armRest: 0.1, stance: 1.2 };
function drawKnight(g, ph, o) {
  const cap = o && o.captain;
  const C = cap ? EPAL.captain : EPAL.knight;
  const atk = (o && o.atk) || 0; // 0..1 Ausholen
  const P = makePose(SPEC_KNIGHT, { t: ph * 2, run: o && o.idle ? 0 : 1, phase: ph * TAU, guard: 0.8 });
  // Schwertarm hinten: erhoben
  {
    const A = P.armB;
    const up = lerp(-1.9, -2.6, atk) + Math.sin(ph * TAU) * 0.08;
    const tx = A.sx + Math.cos(up) * 16, ty = A.sy + Math.sin(up) * 16;
    const k = ik(A.sx, A.sy, tx, ty, 10, 10, -1); A.ex = k[0]; A.ey = k[1]; A.hx = k[2]; A.hy = k[3];
  }
  if (cap) { // Umhang
    const cp = flowCurve(P.neckX - 2, P.neckY + 1, 30, 6, 0.8, ph * 3, 0, 0.2, 0);
    const cp2 = flowCurve(P.neckX + 3, P.neckY + 1, 28, 6, 0.6, ph * 3, 1, 0.05, -0.1);
    const poly = cp.map((p, i) => [p[0] - i, p[1]]).concat(cp2.reverse().map((p, i) => [p[0] + 2, p[1]]));
    blobPath(g, poly, 0.3); paint(g, lg(g, 0, -45, -10, 0, [0, C.cape, 1, C.capeD]), 'rgba(0,0,0,0.6)', 0.7);
  }
  // Schwert (hinter dem Kopf erhoben)
  const sword = (A) => {
    const a = Math.atan2(A.hy - A.ey, A.hx - A.ex);
    g.save(); g.translate(A.hx, A.hy); g.rotate(a);
    g.fillStyle = '#2a1a10'; g.fillRect(-2, -0.8, 4, 1.6);
    g.fillStyle = cap ? C.gold : '#6a5a40'; g.fillRect(1.5, -3.5, 1.4, 7);
    g.beginPath(); g.moveTo(2.9, -1.3); g.lineTo(cap ? 26 : 20, -0.5); g.lineTo(cap ? 28 : 22, 0.2); g.lineTo(2.9, 1.3); g.closePath();
    paint(g, lg(g, 3, -1.3, 3, 1.3, [0, cap ? '#e8e0f0' : '#a8a098', 0.5, cap ? '#9a90a8' : '#6a625c', 1, cap ? '#4a4050' : '#3a322c']), 'rgba(0,0,0,0.8)', 0.5);
    if (!cap) { g.fillStyle = 'rgba(120,60,20,0.7)'; g.beginPath(); g.arc(9, 0.3, 1, 0, TAU); g.arc(14, -0.2, 0.8, 0, TAU); g.fill(); }
    else { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba('#ff5a2a', 0.8); g.lineWidth = 0.7; g.beginPath(); g.moveTo(4, 0); g.lineTo(26, 0); g.stroke(); g.restore(); }
    g.restore();
  };
  const boneArm = (A, dk) => {
    limb(g, A.sx, A.sy, A.ex, A.ey, 1.3, 1.1); paint(g, shade(C.bone, dk), 'rgba(0,0,0,0.7)', 0.5);
    limb(g, A.ex, A.ey, A.hx, A.hy, 1.1, 1); paint(g, shade(C.bone, dk - 0.05), 'rgba(0,0,0,0.7)', 0.5);
    g.beginPath(); g.arc(A.ex, A.ey, 1.7, 0, TAU); paint(g, shade(C.boneD, dk), 'rgba(0,0,0,0.7)', 0.4);
    // Armschiene
    g.beginPath(); g.ellipse(lerp(A.ex, A.hx, 0.5), lerp(A.ey, A.hy, 0.5), 3, 2.2, Math.atan2(A.hy - A.ey, A.hx - A.ex), 0, TAU);
    paint(g, shade(C.iron, dk), 'rgba(0,0,0,0.7)', 0.5);
  };
  const boneLeg = (L, dk) => {
    limb(g, L.hx, L.hy, L.kx, L.ky, 1.5, 1.2); paint(g, shade(C.bone, dk), 'rgba(0,0,0,0.7)', 0.5);
    limb(g, L.kx, L.ky, L.fx, L.fy - 2, 2.6, 2.2); paint(g, lg(g, L.kx, L.ky, L.fx, L.fy, [0, shade(C.ironL, dk), 1, shade(C.ironD, dk)]), 'rgba(0,0,0,0.7)', 0.5);
    g.beginPath(); g.arc(L.kx, L.ky, 2.2, 0, TAU); paint(g, shade(C.iron, dk), 'rgba(0,0,0,0.7)', 0.5);
    g.beginPath(); g.moveTo(L.fx - 3, L.fy - 3); g.lineTo(L.fx + 2.5, L.fy - 3); g.lineTo(L.fx + 5, L.fy + 0.2); g.lineTo(L.fx - 3.2, L.fy + 0.2); g.closePath();
    paint(g, shade(C.ironD, dk), 'rgba(0,0,0,0.8)', 0.5);
  };
  boneLeg(P.legB, -0.35);
  boneArm(P.armB, -0.3);
  sword(P.armB);
  // Rumpf: Kettenhemd, Brustplatte, freiliegende Rippen
  g.save(); g.translate(P.hipX, P.hipY); g.rotate(P.lean);
  const T = SPEC_KNIGHT.torso;
  // Kettenrock
  g.beginPath(); g.moveTo(-6, -3); g.lineTo(6, -3); g.lineTo(7, 8); g.lineTo(-7, 8); g.closePath();
  paint(g, lg(g, 0, -3, 0, 8, [0, shade(C.iron, 0.1), 1, C.ironD]), 'rgba(0,0,0,0.7)', 0.6);
  g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 0.35;
  for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(-6.5, -1 + k * 2); g.lineTo(6.5, -1 + k * 2); g.stroke(); }
  g.fillStyle = C.cloth || '#3a2a3a';
  g.beginPath(); g.moveTo(-2, -3); g.lineTo(2.5, -3); g.lineTo(2, 12); g.lineTo(0, 10.5); g.lineTo(-2.2, 12); g.closePath(); g.fill();
  // Brustplatte (vorne) mit Loch, durch das Rippen sichtbar sind
  g.beginPath(); g.moveTo(-6, -2); g.bezierCurveTo(-8, -T * 0.5, -7, -T * 0.85, -5.5, -T); g.lineTo(5.5, -T); g.bezierCurveTo(8.5, -T * 0.6, 7, -T * 0.3, 6, -2); g.closePath();
  paint(g, lg(g, -6, -T, 6, 0, [0, C.ironL, 0.4, C.iron, 1, C.ironD]), 'rgba(0,0,0,0.7)', 0.7);
  g.beginPath(); g.ellipse(1, -T * 0.55, 3.2, 4, 0.2, 0, TAU); g.fillStyle = '#0c080a'; g.fill();
  g.strokeStyle = C.bone; g.lineWidth = 0.8;
  for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(-1.5, -T * 0.55 - 2.4 + k * 2); g.quadraticCurveTo(1, -T * 0.55 - 1.4 + k * 2, 3.8, -T * 0.55 - 2.4 + k * 2); g.stroke(); }
  if (!cap) { g.fillStyle = rgba(C.rust, 0.7); g.beginPath(); g.arc(-3.5, -T * 0.3, 1.6, 0, TAU); g.arc(4.2, -T * 0.8, 1.1, 0, TAU); g.fill(); }
  else { g.strokeStyle = C.gold; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-5.5, -T + 0.6); g.lineTo(5.5, -T + 0.6); g.stroke(); }
  g.restore();
  boneLeg(P.legF, 0);
  // Kopf: Topfhelm mit Sehschlitz, Totenschaedel dahinter
  g.save(); g.translate(P.headX, P.headY); g.rotate(P.headA);
  g.beginPath(); g.moveTo(-5, 4.5); g.lineTo(-5.5, -4); g.quadraticCurveTo(-5, -7.5, 0, -7.8); g.quadraticCurveTo(5, -7.5, 5.8, -4); g.lineTo(5.5, 4.5); g.closePath();
  paint(g, lg(g, -4, -8, 5, 4, [0, C.ironL, 0.45, C.iron, 1, C.ironD]), 'rgba(0,0,0,0.8)', 0.7);
  g.fillStyle = '#050305'; g.fillRect(0, -2.4, 6, 1.6);
  g.fillStyle = '#050305'; for (let k = 0; k < 3; k++) g.fillRect(2.4 + k * 1.2, 0.6, 0.6, 2.4);
  eye(g, 3.4, -1.6, 0.7, C.eye);
  g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(0, -7.8); g.lineTo(0.4, 4.5); g.stroke();
  if (cap) { // Hoerner
    g.fillStyle = lg(g, 0, -8, 0, -16, [0, '#8a7a60', 1, '#f0e6cc']);
    g.beginPath(); g.moveTo(-4, -6); g.quadraticCurveTo(-9, -10, -6, -16); g.quadraticCurveTo(-6, -10, -1.5, -7.5); g.fill();
    g.beginPath(); g.moveTo(3.5, -6.5); g.quadraticCurveTo(8, -11, 6, -17); g.quadraticCurveTo(5, -11, 1, -7.5); g.fill();
  } else { // zerfetzter Helmbusch
    g.fillStyle = '#5a1a22';
    g.beginPath(); g.moveTo(-1, -7.6); g.quadraticCurveTo(-7, -10, -11, -6 + Math.sin(ph * TAU) * 1.5); g.quadraticCurveTo(-6, -7, -2, -6); g.fill();
  }
  g.restore();
  boneArm(P.armF, 0);
  // Turmschild vorne
  {
    const A = P.armF;
    g.save(); g.translate(A.hx + 2, A.hy - 4); g.rotate(0.06);
    g.beginPath(); g.moveTo(-4.5, -9); g.quadraticCurveTo(0, -11, 5, -9); g.lineTo(5, 6); g.quadraticCurveTo(0, 13, -4.5, 6); g.closePath();
    paint(g, lg(g, -4, -9, 5, 9, [0, cap ? '#5a0a14' : '#6a4a30', 1, cap ? '#200208' : '#2a1a10']), 'rgba(0,0,0,0.85)', 0.9);
    g.strokeStyle = cap ? C.gold : '#7a7684'; g.lineWidth = 1.1;
    g.beginPath(); g.moveTo(-4.5, -9); g.quadraticCurveTo(0, -11, 5, -9); g.lineTo(5, 6); g.quadraticCurveTo(0, 13, -4.5, 6); g.closePath(); g.stroke();
    // Wappen: verblasster Totenkopf / Krone
    g.fillStyle = cap ? rgba(C.gold, 0.9) : 'rgba(210,200,170,0.55)';
    g.beginPath(); g.arc(0.3, -1.5, 2.4, 0, TAU); g.fill();
    g.fillRect(-1, 0.3, 2.6, 2);
    g.fillStyle = cap ? '#300008' : '#3a2616';
    g.beginPath(); g.arc(-0.6, -1.6, 0.7, 0, TAU); g.arc(1.2, -1.6, 0.7, 0, TAU); g.fill();
    g.restore();
  }
}

/* ------------------------------------------------------------- LATERNENWITWE (schwebt, schiesst Seelenfeuer) */
function drawWitch(g, ph, o) {
  const C = EPAL.witch;
  const bob = Math.sin(ph * TAU) * 2;
  const atk = (o && o.atk) || 0;
  g.save(); g.translate(0, -8 + bob);
  // zerfetzter Robensaum (wehende Streifen nach unten)
  for (let k = 0; k < 6; k++) {
    const x0 = -7 + k * 2.6;
    const pts = [];
    for (let i = 0; i <= 5; i++) pts.push([x0 - i * 1.2 + Math.sin(ph * TAU * 2 + k + i * 0.9) * i * 0.5, -6 + i * 2.6]);
    ribbon(g, pts, (s) => 1.6 * (1 - s));
    paint(g, k % 2 ? C.robeD : shade(C.robe, -0.3), null);
  }
  // Robe
  g.beginPath();
  g.moveTo(-8, 2); g.quadraticCurveTo(-9, -18, -4, -34); g.quadraticCurveTo(2, -38, 6, -32); g.quadraticCurveTo(9, -16, 8, 2);
  g.quadraticCurveTo(4, -1, 2, 3); g.quadraticCurveTo(-2, -1, -4, 3); g.quadraticCurveTo(-6, 0, -8, 2); g.closePath();
  paint(g, lg(g, -6, -36, 6, 2, [0, C.robeL, 0.35, C.robe, 1, C.robeD]), 'rgba(0,0,0,0.7)', 0.7);
  g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 0.6;
  g.beginPath(); g.moveTo(-3, -28); g.quadraticCurveTo(-4, -12, -5, 0); g.moveTo(2, -28); g.quadraticCurveTo(3, -14, 3, 0); g.stroke();
  // Kapuze mit leerem Gesicht
  g.beginPath(); g.moveTo(-6, -28); g.quadraticCurveTo(-7, -40, 0, -43); g.quadraticCurveTo(-3, -46, -8, -48); g.quadraticCurveTo(3, -48, 6, -40); g.quadraticCurveTo(8, -33, 6, -28); g.closePath();
  paint(g, lg(g, 0, -48, 0, -28, [0, C.robeL, 1, C.robe]), 'rgba(0,0,0,0.7)', 0.6);
  g.beginPath(); g.ellipse(2.5, -35, 3.5, 5, 0.2, 0, TAU); g.fillStyle = '#040604'; g.fill();
  eye(g, 1.8, -36, 0.7, C.eye); eye(g, 4, -35.6, 0.6, C.eye);
  // Klauenarm vorne mit Laterne
  const ax = 4, ay = -27;
  const lx = 12 + atk * 4, ly = -18 - atk * 8 + Math.sin(ph * TAU + 1) * 1.2;
  limb(g, ax, ay, lx, ly - 3, 1.6, 1.1); paint(g, C.skin, 'rgba(0,0,0,0.7)', 0.5);
  // Aermel
  g.beginPath(); g.moveTo(1, -30); g.quadraticCurveTo(8, -28, 9, -22); g.lineTo(5, -21); g.quadraticCurveTo(3, -25, 0, -24); g.closePath(); paint(g, C.robe, 'rgba(0,0,0,0.6)', 0.5);
  // Kette + Laterne
  g.strokeStyle = '#2a2a2a'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(lx, ly - 3); g.lineTo(lx, ly); g.stroke();
  g.beginPath(); g.moveTo(lx - 2.6, ly); g.lineTo(lx + 2.6, ly); g.lineTo(lx + 2, ly + 6); g.lineTo(lx - 2, ly + 6); g.closePath();
  g.fillStyle = rgba(C.flame, 0.35); g.fill(); g.strokeStyle = '#1a1a14'; g.lineWidth = 0.8; g.stroke();
  g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx, ly + 6); g.stroke();
  const fl = 1 + Math.sin(ph * TAU * 3) * 0.2 + atk * 0.8;
  g.fillStyle = rg(g, lx, ly + 3.5, 0, 2.6 * fl, [0, '#ffffff', 0.35, C.flame, 1, rgba(C.flame, 0)]);
  g.beginPath(); g.arc(lx, ly + 3.5, 2.6 * fl, 0, TAU); g.fill();
  glowDot(g, lx, ly + 3, 9 * fl, C.flame, 0.5);
  g.restore();
}

/* ------------------------------------------------------------- AASBROCKEN (Fleischkoloss, zerplatzt in Ghule) */
const SPEC_BRUTE = { hipY: -22, torso: 20, headOff: 5, shoulderW: 16, legL: 10, legL2: 11, armL: 12, armL2: 12, stride: 5, lift: 2.5, lean: 0.25, shoulderDrop: 4, armRest: 0.2, hipSpread: 1.6, stance: 1.5 };
function drawBrute(g, ph, o) {
  const C = EPAL.brute;
  const P = makePose(SPEC_BRUTE, { t: ph * 2, run: 1, phase: ph * TAU });
  const leg = (L, dk) => {
    limb(g, L.hx, L.hy, L.kx, L.ky, 4.5, 3.6); paint(g, shade(C.skin, dk), 'rgba(0,0,0,0.6)', 0.7);
    limb(g, L.kx, L.ky, L.fx, L.fy - 1.5, 3.6, 3); paint(g, shade(C.skinD, dk + 0.15), 'rgba(0,0,0,0.6)', 0.7);
    g.beginPath(); g.ellipse(L.fx + 1.5, L.fy - 1, 4.5, 2, 0, 0, TAU); paint(g, shade(C.skinD, dk), null);
  };
  const arm = (A, dk) => {
    limb(g, A.sx, A.sy, A.ex, A.ey, 4, 3.4); paint(g, shade(C.skin, dk), 'rgba(0,0,0,0.6)', 0.7);
    limb(g, A.ex, A.ey, A.hx, A.hy, 3.6, 4.2); paint(g, shade(C.skinL, dk - 0.1), 'rgba(0,0,0,0.6)', 0.7);
    // Knochenspiess im Unterarm
    g.fillStyle = shade(C.bone, dk);
    g.beginPath(); g.moveTo(A.ex, A.ey - 2); g.lineTo(A.ex - 4, A.ey - 7); g.lineTo(A.ex + 1.5, A.ey - 1); g.fill();
  };
  leg(P.legB, -0.35); arm(P.armB, -0.35);
  g.save(); g.translate(P.hipX, P.hipY); g.rotate(P.lean);
  // aufgeblaehter Leib
  g.beginPath(); g.moveTo(-8, 3); g.bezierCurveTo(-13, -8, -11, -20, -5, -22); g.lineTo(7, -22); g.bezierCurveTo(15, -16, 15, -2, 8, 4); g.quadraticCurveTo(0, 7, -8, 3); g.closePath();
  paint(g, rg(g, 2, -12, 2, 16, [0, C.skinL, 0.5, C.skin, 1, C.skinD]), 'rgba(0,0,0,0.6)', 0.8);
  // Naehte
  g.strokeStyle = C.stitch; g.lineWidth = 0.8;
  g.beginPath(); g.moveTo(3, -20); g.quadraticCurveTo(9, -10, 4, 2); g.stroke();
  g.lineWidth = 0.5;
  for (let k = 0; k < 7; k++) { const tt = k / 6; const x = lerp(3, 4, tt) + Math.sin(tt * Math.PI) * 5, y = lerp(-20, 2, tt); g.beginPath(); g.moveTo(x - 1.4, y); g.lineTo(x + 1.4, y + 0.3); g.stroke(); }
  // pulsierende Beule
  const pb = 2.5 + Math.sin(ph * TAU * 2) * 0.5;
  g.beginPath(); g.arc(-3, -8, pb, 0, TAU); paint(g, rg(g, -3.5, -8.5, 0, pb, [0, '#e8a0a0', 1, '#7a3a3a']), 'rgba(0,0,0,0.5)', 0.5);
  g.restore();
  leg(P.legF, 0);
  // kleiner Kopf tief zwischen den Schultern
  g.save(); g.translate(P.headX + 1, P.headY + 3);
  g.beginPath(); g.ellipse(0, 0, 4, 3.6, 0, 0, TAU); paint(g, lg(g, 0, -4, 0, 4, [0, C.skinL, 1, C.skin]), 'rgba(0,0,0,0.6)', 0.6);
  eye(g, 2, -0.8, 0.7, C.eye);
  g.fillStyle = '#2a0a0a'; g.fillRect(0.5, 1.2, 3.2, 1);
  g.restore();
  arm(P.armF, 0);
}

/* ------------------------------------------------------------- Vorrendern */
const ENEMY_ART = {
  ghoul: { draw: drawGhoul, frames: 8, box: 64, anchor: 0.82, rim: '#c8ff9a', h: 42 },
  bat: { draw: drawBat, frames: 6, box: 56, anchor: 0.9, rim: '#ff5a6a', h: 30, fly: true },
  knight: { draw: drawKnight, frames: 8, box: 80, anchor: 0.82, rim: '#8af0ff', h: 58 },
  witch: { draw: drawWitch, frames: 8, box: 76, anchor: 0.86, rim: '#a8ff9a', h: 56, fly: true },
  brute: { draw: drawBrute, frames: 8, box: 84, anchor: 0.84, rim: '#ffb07a', h: 54 },
  captain: { draw: (g, ph, o) => drawKnight(g, ph, Object.assign({ captain: true }, o)), frames: 8, box: 90, anchor: 0.8, rim: '#ff5a3a', h: 64 }
};
const ENEMY_SPR = {};
function bakeEnemies(px) {
  for (const id in ENEMY_ART) {
    const A = ENEMY_ART[id];
    const S = Math.ceil(A.box * px);
    const frames = [], flashes = [], atk = [];
    for (let f = 0; f < A.frames; f++) {
      const raw = mkCanvas(S, S), g = raw.getContext('2d');
      g.setTransform(px, 0, 0, px, S / 2, S * A.anchor);
      g.lineCap = 'round'; g.lineJoin = 'round';
      A.draw(g, f / A.frames, {});
      const fin = finishSprite(raw, { outline: Math.max(1.2, px * 0.6), rim: A.rim, rimW: px * 0.7, rimA: 0.55, moonW: px * 0.5 });
      frames.push(fin); flashes.push(flashSprite(fin, '#ffffff'));
    }
    if (id === 'witch' || id === 'knight' || id === 'captain') { // Angriffsframes
      for (let f = 0; f < 4; f++) {
        const raw = mkCanvas(S, S), g = raw.getContext('2d');
        g.setTransform(px, 0, 0, px, S / 2, S * A.anchor);
        g.lineCap = 'round'; g.lineJoin = 'round';
        A.draw(g, f / 4, { atk: 1, idle: true });
        atk.push(finishSprite(raw, { outline: Math.max(1.2, px * 0.6), rim: A.rim, rimW: px * 0.7, rimA: 0.55, moonW: px * 0.5 }));
      }
    }
    ENEMY_SPR[id] = { frames, flashes, atk, S, px, ax: S / 2, ay: S * A.anchor };
  }
}

/* ============================================================ BOSS: VAELGOR, DER GRUFTKOLOSS
   Ein aus Leichen genaehter Riese mit einer Kirchenglocke auf dem Ruecken,
   Ketten und einem gluehenden Herz. Live gemalt (nur einer auf dem Feld). */
const SPEC_BOSS = { hipY: -62, torso: 58, headOff: 12, shoulderW: 40, legL: 30, legL2: 33, armL: 34, armL2: 36, stride: 14, lift: 8, lean: 0.3, shoulderDrop: 10, hipSpread: 3, stance: 3, armRest: 0.25 };
const BPAL = { skin: '#6a5a5e', skinL: '#a08c8c', skinD: '#2a1e22', bone: '#e2d8c0', boneD: '#8a7e66', iron: '#3a3638', ironL: '#7a7478', bell: '#6a5a3a', bellL: '#b09a60', heart: '#ff5a1a', chain: '#4a4448' };
function drawBoss(g, st) {
  const C = BPAL, t = st.t;
  const slam = st.slam || 0;      // 0..1 Ausholen (Arme hoch), >1 = Aufschlag
  const P = makePose(SPEC_BOSS, { t, run: st.run || 0, phase: st.phase || 0, hurt: st.hurt || 0, dead: st.dead || 0 });
  // Arme: bei Slam ueber den Kopf, dann herunter
  const armPose = (A, i) => {
    let tx, ty;
    const up = slam <= 1 ? easeOut(slam) : 1 - easeIn(clamp((slam - 1) * 4, 0, 1));
    const down = slam > 1 ? 1 : 0;
    const restX = A.sx + 14 + i * -8 + Math.sin(t * 2 + i) * 2, restY = A.sy + 58;
    const upX = A.sx + 10, upY = A.sy - 50;
    const dnX = A.sx + 40, dnY = 0;
    tx = lerp(restX, upX, up); ty = lerp(restY, upY, up);
    if (down) { const d = clamp((slam - 1) * 4, 0, 1); tx = lerp(upX, dnX, d); ty = lerp(upY, dnY, d); }
    const k = ik(A.sx, A.sy, tx, ty, 34, 36, 1);
    A.ex = k[0]; A.ey = k[1]; A.hx = k[2]; A.hy = k[3];
  };
  armPose(P.armF, 0); armPose(P.armB, 1);
  // Glocke auf dem Ruecken (hinter allem)
  g.save(); g.translate(P.neckX - 26, P.neckY + 10); g.rotate(-0.25 + P.lean * 0.5 + Math.sin(t * 1.5) * 0.04 + (st.bell || 0) * Math.sin(t * 20) * 0.1);
  g.beginPath(); g.moveTo(-10, -18); g.quadraticCurveTo(-12, 2, -20, 16); g.lineTo(20, 16); g.quadraticCurveTo(12, 2, 10, -18); g.quadraticCurveTo(0, -24, -10, -18); g.closePath();
  paint(g, lg(g, -18, -20, 18, 16, [0, C.bellL, 0.4, C.bell, 1, '#2a2010']), 'rgba(0,0,0,0.8)', 1.2);
  g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-17, 10); g.quadraticCurveTo(0, 13, 17, 10); g.stroke();
  g.fillStyle = 'rgba(60,110,90,0.5)'; g.beginPath(); g.arc(-6, -4, 3, 0, TAU); g.arc(5, 6, 2.2, 0, TAU); g.fill();
  g.fillStyle = '#2a2418'; g.beginPath(); g.arc(0, 18, 3.5, 0, TAU); g.fill();
  g.restore();
  // Ketten
  g.strokeStyle = C.chain; g.lineWidth = 2;
  g.beginPath(); g.moveTo(P.neckX - 30, P.neckY - 6); g.quadraticCurveTo(P.neckX - 5, P.neckY + 22, P.hipX + 16, P.hipY - 12); g.stroke();
  g.setLineDash([2.2, 1.6]); g.strokeStyle = '#8a8488'; g.lineWidth = 1.1; g.stroke(); g.setLineDash([]);
  const leg = (L, dk) => {
    limb(g, L.hx, L.hy, L.kx, L.ky, 10, 8); paint(g, lg(g, L.hx, L.hy, L.kx, L.ky, [0, shade(C.skin, dk), 1, shade(C.skinD, dk)]), 'rgba(0,0,0,0.6)', 1.1);
    limb(g, L.kx, L.ky, L.fx, L.fy - 4, 8, 6.5); paint(g, lg(g, L.kx, L.ky, L.fx, L.fy, [0, shade(C.skin, dk - 0.05), 1, shade(C.skinD, dk)]), 'rgba(0,0,0,0.6)', 1.1);
    g.beginPath(); g.ellipse(L.kx + 2, L.ky, 7, 8, 0, 0, TAU); paint(g, lg(g, L.kx, L.ky - 8, L.kx, L.ky + 8, [0, shade(C.bone, dk), 1, shade(C.boneD, dk)]), 'rgba(0,0,0,0.7)', 1);
    g.beginPath(); g.moveTo(L.fx - 8, L.fy - 6); g.lineTo(L.fx + 8, L.fy - 6); g.lineTo(L.fx + 14, L.fy + 0.5); g.lineTo(L.fx - 9, L.fy + 0.5); g.closePath();
    paint(g, shade(C.skinD, dk), 'rgba(0,0,0,0.8)', 1);
    g.fillStyle = shade(C.bone, dk); for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(L.fx + 8 + k * 2, L.fy - 1.5); g.lineTo(L.fx + 12 + k * 2, L.fy + 0.5); g.lineTo(L.fx + 8 + k * 2, L.fy + 0.5); g.fill(); }
  };
  const arm = (A, dk) => {
    limb(g, A.sx, A.sy, A.ex, A.ey, 9.5, 8); paint(g, lg(g, A.sx, A.sy, A.ex, A.ey, [0, shade(C.skinL, dk - 0.1), 1, shade(C.skin, dk)]), 'rgba(0,0,0,0.6)', 1.1);
    limb(g, A.ex, A.ey, A.hx, A.hy, 8.5, 11); paint(g, lg(g, A.ex, A.ey, A.hx, A.hy, [0, shade(C.skin, dk), 1, shade(C.skinD, dk)]), 'rgba(0,0,0,0.6)', 1.1);
    // Eisenmanschette
    const mx = lerp(A.ex, A.hx, 0.4), my = lerp(A.ey, A.hy, 0.4), a = Math.atan2(A.hy - A.ey, A.hx - A.ex);
    g.save(); g.translate(mx, my); g.rotate(a);
    g.beginPath(); g.rect(-4, -10, 8, 20); paint(g, lg(g, 0, -10, 0, 10, [0, shade(C.ironL, dk), 1, shade(C.iron, dk)]), 'rgba(0,0,0,0.8)', 1);
    g.fillStyle = shade('#a8a0a4', dk); for (let k = -1; k <= 1; k++) { g.beginPath(); g.arc(0, k * 6, 1.1, 0, TAU); g.fill(); }
    g.restore();
    // Faust mit Knochenstacheln
    g.save(); g.translate(A.hx, A.hy); g.rotate(a);
    g.beginPath(); g.ellipse(4, 0, 11, 10, 0, 0, TAU); paint(g, rg(g, 2, -3, 1, 12, [0, shade(C.skinL, dk), 1, shade(C.skinD, dk)]), 'rgba(0,0,0,0.7)', 1.1);
    g.fillStyle = shade(C.bone, dk);
    for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(9, k * 5 - 2); g.lineTo(19, k * 7); g.lineTo(9, k * 5 + 2); g.fill(); }
    g.restore();
  };
  leg(P.legB, -0.35); arm(P.armB, -0.35);
  // Rumpf
  g.save(); g.translate(P.hipX, P.hipY); g.rotate(P.lean);
  const T = SPEC_BOSS.torso;
  g.beginPath();
  g.moveTo(-20, 6); g.bezierCurveTo(-34, -20, -32, -48, -20, -T - 4); g.quadraticCurveTo(0, -T - 12, 22, -T - 4);
  g.bezierCurveTo(36, -40, 30, -12, 18, 8); g.quadraticCurveTo(0, 14, -20, 6); g.closePath();
  paint(g, rg(g, 4, -T * 0.6, 6, 55, [0, C.skinL, 0.5, C.skin, 1, C.skinD]), 'rgba(0,0,0,0.6)', 1.3);
  // Rippenkaefig um das Herz
  const hb = 1 + Math.sin(t * 5) * 0.12 + (st.enrage ? 0.2 : 0);
  glowDot(g, 4, -T * 0.55, 30 * hb, C.heart, 0.55);
  g.beginPath(); g.ellipse(4, -T * 0.55, 11, 13, 0, 0, TAU); g.fillStyle = '#1a0806'; g.fill();
  g.fillStyle = rg(g, 4, -T * 0.55, 0, 10 * hb, [0, '#ffffff', 0.25, '#ffcc40', 0.6, C.heart, 1, '#5a1004']);
  g.beginPath(); g.ellipse(4, -T * 0.55, 7.5 * hb, 8.5 * hb, 0, 0, TAU); g.fill();
  g.strokeStyle = C.bone; g.lineWidth = 2.6;
  for (let k = 0; k < 4; k++) { const y = -T * 0.55 - 10 + k * 6.5; g.beginPath(); g.moveTo(-10, y + 2); g.quadraticCurveTo(4, y - 4, 18, y + 2); g.stroke(); }
  g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 0.8;
  for (let k = 0; k < 4; k++) { const y = -T * 0.55 - 10 + k * 6.5; g.beginPath(); g.moveTo(-10, y + 3.3); g.quadraticCurveTo(4, y - 2.7, 18, y + 3.3); g.stroke(); }
  // Naehte
  g.strokeStyle = '#1a0a0a'; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(-22, -40); g.quadraticCurveTo(-12, -20, -18, 2); g.stroke();
  g.lineWidth = 0.8;
  for (let k = 0; k < 8; k++) { const tt = k / 7; const x = lerp(-22, -18, tt) + Math.sin(tt * Math.PI) * 7, y = lerp(-40, 2, tt); g.beginPath(); g.moveTo(x - 2.5, y); g.lineTo(x + 2.5, y + 0.5); g.stroke(); }
  // Lendenschurz aus Ketten und Leichentuch
  g.beginPath(); g.moveTo(-20, 2); g.lineTo(20, 4); g.lineTo(16, 22); g.lineTo(6, 16); g.lineTo(-2, 24); g.lineTo(-10, 16); g.lineTo(-19, 20); g.closePath();
  paint(g, lg(g, 0, 0, 0, 24, [0, '#5a4a40', 1, '#1a1410']), 'rgba(0,0,0,0.7)', 1);
  g.restore();
  leg(P.legF, 0);
  // Schaedelkopf mit Hoernern (tief zwischen den Schultern)
  g.save(); g.translate(P.headX + 6, P.headY + 12); g.rotate(P.headA * 0.5);
  g.fillStyle = lg(g, 0, -10, 0, -34, [0, '#6a5a40', 1, '#f0e6cc']);
  g.beginPath(); g.moveTo(-8, -6); g.quadraticCurveTo(-24, -14, -18, -34); g.quadraticCurveTo(-16, -20, -4, -11); g.fill();
  g.beginPath(); g.moveTo(6, -8); g.quadraticCurveTo(22, -18, 14, -36); g.quadraticCurveTo(14, -20, 0, -11); g.fill();
  g.beginPath(); g.moveTo(-10, 2); g.quadraticCurveTo(-11, -13, 1, -14); g.quadraticCurveTo(13, -13, 12, 0); g.lineTo(9, 8); g.lineTo(-7, 8); g.closePath();
  paint(g, lg(g, 0, -14, 0, 8, [0, '#f4ecd6', 0.5, C.bone, 1, C.boneD]), 'rgba(0,0,0,0.8)', 1);
  const ec = st.enrage ? '#ff2a1a' : C.heart;
  g.fillStyle = '#0a0404'; g.beginPath(); g.ellipse(-3, -3, 3.3, 3, 0, 0, TAU); g.ellipse(6, -3, 3.3, 3, 0, 0, TAU); g.fill();
  eye(g, -3, -3, 1.4, ec); eye(g, 6, -3, 1.4, ec);
  g.fillStyle = '#0a0404'; g.beginPath(); g.moveTo(1.5, 1); g.lineTo(0, 4); g.lineTo(3, 4); g.fill();
  const jaw = 2 + (st.roar || 0) * 6;
  g.beginPath(); g.moveTo(-6, 6); g.lineTo(9, 6); g.lineTo(8, 10 + jaw); g.lineTo(-5, 10 + jaw); g.closePath();
  paint(g, C.boneD, 'rgba(0,0,0,0.8)', 0.8);
  g.fillStyle = '#f4ecd6'; for (let k = 0; k < 5; k++) g.fillRect(-5 + k * 2.8, 5.5, 1.6, 2.4);
  g.restore();
  arm(P.armF, 0);
}
