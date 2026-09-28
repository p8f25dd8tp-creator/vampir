'use strict';
/* ==========================================================================
   HELDEN — vier gemalte, skelettanimierte Figuren.
   Jede Figur wird pro Frame aus ihrer Pose neu gemalt (Umhang, Haare,
   Schal und Aufwertungs-Leuchten reagieren live auf Bewegung und Build).
   Koordinaten: Blick nach rechts, Fuesse bei y = 0, Einheit = Welt-Einheit.
   ========================================================================== */

/* ---------------------------------------------------------------- Pose */
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

/* Farbpaletten */
const HERO_PAL = {
  vorian: { skin: '#cfc6d2', skinD: '#8d8298', armor: '#3a3244', armorL: '#6c607a', armorD: '#16121c', red: '#b0142a', redL: '#ff3448', redD: '#4a0510', hair: '#ece8f0', eye: '#ff2a40', rim: '#ff3048', gold: '#b08a52' },
  liora: { skin: '#ecdcd6', skinD: '#b29a98', coat: '#8e1428', coatL: '#d02a44', coatD: '#3e0612', black: '#1a1016', blackL: '#3c2a36', hair: '#170d16', hairL: '#4a2238', bone: '#e9e0cf', eye: '#ff3a52', rim: '#ff4058', band: '#cdbba9' },
  nyx: { cloak: '#221c3a', cloakL: '#433868', cloakD: '#0c0916', scarf: '#4b2a86', scarfL: '#9a6cff', mask: '#ddd4c2', maskD: '#8d8474', steel: '#4a4a5e', steelL: '#b9b6d8', eye: '#c9a8ff', rim: '#a77bff', wrap: '#3a3244' },
  shen: { robe: '#1f5a50', robeL: '#3fa38c', robeD: '#0b2723', inner: '#dcd3be', innerD: '#9a917e', sash: '#9a1e2a', sashL: '#d63a44', hat: '#8a6a3e', hatL: '#c29a5c', hatD: '#3a2a14', skin: '#c89d7a', skinD: '#8b664b', beard: '#eeeae2', bead: '#2a1a12', eye: '#5ff0d0', rim: '#5ff0d0', gold: '#c9a24c' }
};

/* ============================================================ VORIAN
   Der Blutgraf — massig, riesiger Stehkragen-Umhang, Stachelkrone,
   gepanzerte Klauenhand. Adern auf der Ruestung gluehen mit jeder Blutstufe. */
const SPEC_VORIAN = { hipY: -25, torso: 22, headOff: 8.5, shoulderW: 13, legL: 12.5, legL2: 12.5, armL: 11, armL2: 11, stride: 7.5, lift: 4.5, lean: 0.04, shoulderDrop: 3.5, hipSpread: 1.2, armRest: 0.15 };
function drawVorian(g, P, H) {
  const C = HERO_PAL.vorian, t = P.t, flow = clamp(P.run * 1.1 + P.dodge, 0, 1.3);
  const glow = H.glow || 0; // 0..1 Blutmacht
  // --- Umhang (hinten) -----------------------------------------------
  const cpA = flowCurve(P.neckX - 3, P.neckY + 1, 42, 7, flow, t, 0, 0.18, 0.1);
  const cpB = flowCurve(P.neckX + 2, P.neckY + 2, 40, 7, flow * 0.85, t, 1.3, 0.05, -0.1);
  const cape = [];
  for (let i = 0; i < cpA.length; i++) cape.push([cpA[i][0] - 3 - i * 0.9, cpA[i][1]]);
  const tail = [];
  for (let i = cpB.length - 1; i >= 0; i--) {
    const jag = (i === cpB.length - 1 || i === cpB.length - 2) ? 0 : 0;
    tail.push([cpB[i][0] + 3 + i * 0.35 + jag, cpB[i][1]]);
  }
  const capePoly = cape.concat(tail);
  // gezackter Saum
  g.save();
  blobPath(g, capePoly, 0.35);
  g.fillStyle = lg(g, P.neckX, P.neckY, P.neckX - 20, 0, [0, '#2a0b14', 0.6, '#1b060c', 1, '#0e0306']);
  g.fill();
  g.clip();
  // Innenfutter blitzt am Rand
  g.strokeStyle = rgba(C.red, 0.55); g.lineWidth = 3.5;
  curvePath(g, cpA.map((p, i) => [p[0] - 3 - i * 0.9, p[1]])); g.stroke();
  g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 1.1;
  for (let k = 1; k <= 3; k++) {
    const f = k / 4;
    curvePath(g, cpA.map((p, i) => [lerp(p[0] - 3 - i * 0.9, cpB[i][0] + 3 + i * 0.35, f), lerp(p[1], cpB[i][1], f) - 2])); g.stroke();
  }
  g.restore();
  // Saumfetzen
  const hem = cape[cape.length - 1], hem2 = tail[0];
  g.fillStyle = '#12040a';
  g.beginPath();
  g.moveTo(hem[0], hem[1] - 3);
  for (let k = 0; k <= 5; k++) {
    const x = lerp(hem[0], hem2[0], k / 5), y = lerp(hem[1], hem2[1], k / 5);
    g.lineTo(x + 1, y + (k % 2 ? 4 + Math.sin(t * 7 + k) * flow * 1.5 : 0));
  }
  g.lineTo(hem2[0], hem2[1] - 3); g.closePath(); g.fill();

  // --- hinteres Bein & Arm --------------------------------------------
  drawArmoredLeg(g, P.legB, C, true);
  drawClawArm(g, P.armB, C, true, 0);
  // --- Waffenrock (Tabard) zwischen den Beinen --------------------------
  const sw = Math.sin(P.ph) * 2.2 * P.run;
  g.beginPath();
  g.moveTo(P.hipX - 7, P.hipY - 2);
  g.lineTo(P.hipX + 7, P.hipY - 2);
  g.quadraticCurveTo(P.hipX + 8 + sw, P.hipY + 8, P.hipX + 5 + sw * 1.5, P.hipY + 15);
  g.lineTo(P.hipX + 1 + sw, P.hipY + 13);
  g.lineTo(P.hipX - 3 - sw, P.hipY + 15.5);
  g.quadraticCurveTo(P.hipX - 8 - sw, P.hipY + 8, P.hipX - 7, P.hipY - 2);
  paint(g, lg(g, 0, P.hipY, 0, P.hipY + 15, [0, C.red, 1, C.redD]), 'rgba(0,0,0,0.5)', 0.8);
  g.strokeStyle = rgba(C.gold, 0.7); g.lineWidth = 0.7;
  g.beginPath(); g.moveTo(P.hipX + 5 + sw * 1.5, P.hipY + 14.2); g.lineTo(P.hipX + 1 + sw, P.hipY + 12.3); g.lineTo(P.hipX - 3 - sw, P.hipY + 14.7); g.stroke();
  // --- Rumpf ----------------------------------------------------------
  g.save();
  g.translate(P.hipX, P.hipY); g.rotate(P.lean);
  const T = SPEC_VORIAN.torso;
  // Brustpanzer
  g.beginPath();
  g.moveTo(-6.5, 0);
  g.bezierCurveTo(-9, -T * 0.45, -10, -T * 0.8, -7.5, -T - 1);
  g.lineTo(7.5, -T - 1);
  g.bezierCurveTo(11.5, -T * 0.75, 10, -T * 0.35, 6.5, 0);
  g.closePath();
  paint(g, lg(g, -8, -T, 9, 0, [0, C.armorL, 0.35, C.armor, 1, C.armorD]), 'rgba(0,0,0,0.6)', 0.9);
  // Plattenkanten
  g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 0.8;
  for (let k = 1; k <= 3; k++) { g.beginPath(); g.moveTo(-7.5, -k * 4.2); g.quadraticCurveTo(0, -k * 4.2 + 2, 8.5, -k * 4.2 - 0.5); g.stroke(); }
  // Blutrune / Adern
  const pulse = 0.55 + 0.45 * Math.sin(t * 4);
  const ga = 0.35 + glow * 0.65;
  g.save(); g.globalCompositeOperation = 'lighter';
  g.strokeStyle = rgba(C.redL, ga * (0.6 + 0.4 * pulse)); g.lineWidth = 1.1 + glow * 0.8;
  g.beginPath();
  g.moveTo(1.5, -T + 2); g.lineTo(1.5, -T * 0.45); g.lineTo(-2.5, -T * 0.25); g.moveTo(1.5, -T * 0.45); g.lineTo(5.5, -T * 0.2);
  g.moveTo(1.5, -T * 0.7); g.lineTo(-3.5, -T * 0.62); g.moveTo(1.5, -T * 0.7); g.lineTo(6.5, -T * 0.66);
  g.stroke();
  glowDot(g, 1.5, -T * 0.6, 4 + glow * 4, C.redL, ga * pulse);
  g.restore();
  // Guertel mit Schaedelschnalle
  g.fillStyle = '#1a1318'; g.fillRect(-7, -2.8, 14.5, 3);
  g.fillStyle = C.skin; g.beginPath(); g.ellipse(2.5, -1.3, 2.3, 2, 0, 0, TAU); g.fill();
  g.fillStyle = '#1a0a10'; g.fillRect(1.4, -1.8, 0.8, 0.8); g.fillRect(2.9, -1.8, 0.8, 0.8);
  g.restore();

  // --- vorderes Bein -------------------------------------------------
  drawArmoredLeg(g, P.legF, C, false);
  // --- Kopf -----------------------------------------------------------
  // hoher Stehkragen hinter dem Kopf
  g.save(); g.translate(P.neckX, P.neckY); g.rotate(P.lean * 0.6);
  g.beginPath();
  g.moveTo(-3, 2); g.lineTo(-11, -13); g.lineTo(-7.5, -9.5); g.lineTo(-7, -16); g.lineTo(-3.5, -9); g.lineTo(-1, -12.5); g.lineTo(2, 1.5); g.closePath();
  paint(g, lg(g, -8, -14, 0, 2, [0, '#3a0d18', 1, '#14050a']), 'rgba(0,0,0,0.6)', 0.7);
  g.strokeStyle = rgba(C.red, 0.7); g.lineWidth = 0.7;
  g.beginPath(); g.moveTo(-10, -12); g.lineTo(-3, 1); g.stroke();
  g.restore();
  drawVorianHead(g, P, C, H);
  // --- Schulterplatte vorne -------------------------------------------
  drawPauldron(g, P.shF[0], P.shF[1], P.lean, C, 1);
  // --- vorderer Arm ---------------------------------------------------
  drawClawArm(g, P.armF, C, false, P.cast);
}
function drawArmoredLeg(g, L, C, back) {
  const dk = back ? -0.35 : 0;
  // Oberschenkel
  limb(g, L.hx, L.hy, L.kx, L.ky, 3.4, 2.8);
  paint(g, lg(g, L.hx - 3, L.hy, L.hx + 3, L.ky, [0, shade(C.armor, dk + 0.1), 1, shade(C.armorD, dk)]), 'rgba(0,0,0,0.6)', 0.7);
  // Unterschenkel / Beinschiene
  limb(g, L.kx, L.ky, L.fx, L.fy - 2, 2.9, 2.3);
  paint(g, lg(g, L.kx - 3, L.ky, L.kx + 3, L.fy, [0, shade(C.armorL, dk), 0.5, shade(C.armor, dk), 1, shade(C.armorD, dk)]), 'rgba(0,0,0,0.6)', 0.7);
  // Kniekachel
  g.beginPath(); g.ellipse(L.kx + 0.8, L.ky, 2.8, 3.2, 0, 0, TAU);
  paint(g, rg(g, L.kx, L.ky - 1, 0, 3.4, [0, shade(C.armorL, dk + 0.15), 1, shade(C.armorD, dk)]), 'rgba(0,0,0,0.7)', 0.6);
  g.fillStyle = shade(C.red, dk); g.beginPath(); g.moveTo(L.kx + 2.5, L.ky - 1); g.lineTo(L.kx + 5, L.ky - 0.3); g.lineTo(L.kx + 2.5, L.ky + 1); g.fill();
  // Stiefel (spitz)
  g.beginPath();
  g.moveTo(L.fx - 3, L.fy - 3.5); g.lineTo(L.fx + 2, L.fy - 3.8); g.quadraticCurveTo(L.fx + 5, L.fy - 1.5, L.fx + 7.5, L.fy + 0.2);
  g.lineTo(L.fx - 3.5, L.fy + 0.2); g.closePath();
  paint(g, shade('#1c161f', dk), 'rgba(0,0,0,0.8)', 0.6);
}
function drawClawArm(g, A, C, back, cast) {
  const dk = back ? -0.38 : 0;
  limb(g, A.sx, A.sy, A.ex, A.ey, 3.2, 2.6);
  paint(g, lg(g, A.sx, A.sy, A.ex, A.ey, [0, shade(C.armor, dk), 1, shade(C.armorD, dk)]), 'rgba(0,0,0,0.6)', 0.7);
  limb(g, A.ex, A.ey, A.hx, A.hy, 2.8, 2.5);
  paint(g, lg(g, A.ex, A.ey, A.hx, A.hy, [0, shade(C.armorL, dk), 1, shade(C.armor, dk)]), 'rgba(0,0,0,0.6)', 0.7);
  // Stulpe
  g.beginPath(); g.ellipse(lerp(A.ex, A.hx, 0.55), lerp(A.ey, A.hy, 0.55), 3.3, 2.4, Math.atan2(A.hy - A.ey, A.hx - A.ex), 0, TAU);
  paint(g, shade(C.red, dk - 0.1), 'rgba(0,0,0,0.6)', 0.6);
  // Klauenhand
  const a = Math.atan2(A.hy - A.ey, A.hx - A.ex);
  g.save(); g.translate(A.hx, A.hy); g.rotate(a);
  g.beginPath(); g.ellipse(1.2, 0, 2.8, 2.3, 0, 0, TAU);
  paint(g, shade(C.armorL, dk), 'rgba(0,0,0,0.7)', 0.6);
  g.fillStyle = shade('#d8d0dc', dk);
  const open = cast;
  for (let k = -1; k <= 1; k++) {
    g.beginPath();
    const sp = k * (0.45 + open * 0.35);
    g.moveTo(3, k * 1.2); g.quadraticCurveTo(6.5, k * 1.4 + sp * 3, 7.5 + open, k * 1.4 + sp * 4.5); g.lineTo(3.5, k * 1.2 + 0.8); g.closePath(); g.fill();
  }
  g.restore();
  if (!back && cast > 0.05) { // Blutkugel in der Hand
    const r = 3 + cast * 3 + Math.sin(performance.now() / 70) * 0.5;
    const hx = A.hx + Math.cos(a) * 6, hy = A.hy + Math.sin(a) * 6;
    g.fillStyle = rg(g, hx - 1, hy - 1, 0, r, [0, '#ff8a96', 0.4, '#d0102a', 1, '#40000a']);
    g.beginPath(); g.arc(hx, hy, r, 0, TAU); g.fill();
    glowDot(g, hx, hy, r * 3, C.redL, 0.6 * cast);
  }
}
function drawPauldron(g, x, y, lean, C, s) {
  g.save(); g.translate(x, y); g.rotate(lean * 0.8); g.scale(s, s);
  for (let k = 2; k >= 0; k--) { // drei Lamellen
    g.beginPath();
    g.moveTo(-6.5 + k * 0.4, -2 + k * 2.6);
    g.quadraticCurveTo(0, -6 + k * 2.6, 7.5 - k * 0.6, -1.2 + k * 2.8);
    g.quadraticCurveTo(5, 3 + k * 2.6, 0, 3.2 + k * 2.4);
    g.quadraticCurveTo(-5, 3 + k * 2.4, -6.5 + k * 0.4, -2 + k * 2.6);
    paint(g, lg(g, -6, -5, 6, 4 + k * 2, [0, C.armorL, 0.5, C.armor, 1, C.armorD]), 'rgba(0,0,0,0.75)', 0.7);
    g.strokeStyle = rgba(C.red, 0.85); g.lineWidth = 0.6;
    g.beginPath(); g.moveTo(-5.8 + k * 0.4, 2.2 + k * 2.4); g.quadraticCurveTo(0, 3.6 + k * 2.4, 6.5 - k * 0.6, -0.4 + k * 2.8); g.stroke();
  }
  // Stacheln
  g.fillStyle = '#cfc8d6';
  const spikes = [[-3, -4.5, -5, -11.5], [0.5, -5.3, 0, -13], [4, -4.3, 5.2, -10.5]];
  for (const sp of spikes) {
    g.beginPath(); g.moveTo(sp[0] - 1.4, sp[1] + 0.8); g.lineTo(sp[2], sp[3]); g.lineTo(sp[0] + 1.4, sp[1] + 0.6); g.closePath();
    g.fillStyle = lg(g, sp[0], sp[1], sp[2], sp[3], [0, '#6b6474', 1, '#efe8f4']); g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.7)'; g.lineWidth = 0.5; g.stroke();
  }
  g.restore();
}
function drawVorianHead(g, P, C, H) {
  const x = P.headX, y = P.headY, t = P.t;
  g.save(); g.translate(x, y); g.rotate(P.headA);
  // wehendes weisses Haar
  const flow = clamp(P.run + P.dodge, 0, 1);
  const hp = flowCurve(-2.5, -3, 14, 5, flow, t, 2.1, 0.55, -0.3);
  ribbon(g, hp, (s) => 3.6 * (1 - s) + 0.6);
  paint(g, lg(g, -3, -5, -12, 8, [0, C.hair, 1, '#9d97ad']), 'rgba(40,30,50,0.6)', 0.6);
  // Gesicht (Profil)
  g.beginPath();
  g.moveTo(-4.5, -5.5);
  g.quadraticCurveTo(-1, -8.2, 3.2, -6.2);
  g.quadraticCurveTo(4.6, -3.8, 4.2, -2.2);
  g.lineTo(6, -0.4);           // Nase
  g.lineTo(4.4, 0.4);
  g.quadraticCurveTo(4.8, 1.8, 4, 2.6);   // Mund
  g.quadraticCurveTo(3.4, 5, 1.2, 5.6);    // Kinn
  g.quadraticCurveTo(-3, 5.2, -4.8, 2);
  g.closePath();
  paint(g, lg(g, 2, -6, -3, 5, [0, '#efe8f2', 0.55, C.skin, 1, C.skinD]), 'rgba(40,20,40,0.7)', 0.6);
  // Wangenschatten
  g.fillStyle = 'rgba(70,40,80,0.35)';
  g.beginPath(); g.moveTo(0.5, 0.5); g.quadraticCurveTo(3, 2.5, 1.5, 4.6); g.quadraticCurveTo(-0.5, 2.4, 0.5, 0.5); g.fill();
  // spitzes Ohr
  g.beginPath(); g.moveTo(-1.8, -1.6); g.lineTo(-6.2, -4.8); g.lineTo(-2.4, 1.2); g.closePath();
  paint(g, C.skinD, 'rgba(40,20,40,0.7)', 0.5);
  // Augenbraue & Auge
  g.strokeStyle = '#2a1a2a'; g.lineWidth = 0.9;
  g.beginPath(); g.moveTo(0.8, -3.6); g.lineTo(4, -2.6); g.stroke();
  eye(g, 2.6, -1.8, 0.95, C.eye);
  // Fangzahn
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(3.6, 2.4); g.lineTo(4.1, 4); g.lineTo(4.4, 2.3); g.fill();
  // Haar oben
  g.beginPath();
  g.moveTo(-5, -3); g.quadraticCurveTo(-4.5, -9, 1.5, -8.2); g.quadraticCurveTo(4.5, -7.5, 4, -5.6);
  g.quadraticCurveTo(0, -6.6, -2, -3.8); g.closePath();
  paint(g, H.plain ? lg(g, 0, -9, 0, -3, [0, C.hair, 1, C.armorD]) : lg(g, 0, -9, 0, -3, [0, '#ffffff', 1, '#b6b0c4']), 'rgba(40,30,50,0.6)', 0.5);
  if (H.plain) { g.restore(); return; } // Mensch: ohne Krone
  // Krone mit Dornen
  const lvl = H.crown || 0;
  g.save(); g.translate(-0.3, -7.2); g.rotate(-0.08);
  g.beginPath();
  g.moveTo(-5, 1.2); g.lineTo(5, 0.4); g.lineTo(5, -1.2); g.lineTo(-5, -0.4); g.closePath();
  paint(g, lg(g, 0, -1, 0, 1, [0, '#e6d7aa', 1, '#6b5530']), 'rgba(0,0,0,0.7)', 0.5);
  const sp = [[-4.5, -5.5], [-2, -8], [0.6, -6], [3, -9], [5, -5.5]];
  for (let i = 0; i < sp.length; i++) {
    const bx = -4.5 + i * 2.35;
    g.beginPath(); g.moveTo(bx - 1, -0.6); g.lineTo(sp[i][0], sp[i][1] - lvl * 1.2); g.lineTo(bx + 1, -0.8); g.closePath();
    g.fillStyle = lg(g, bx, 0, sp[i][0], sp[i][1], [0, '#8b7448', 1, '#f5ecd0']); g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 0.4; g.stroke();
  }
  // Rubin
  g.fillStyle = rg(g, 0.6, -0.2, 0, 1.6, [0, '#ffb0b8', 0.5, '#e0102c', 1, '#500010']);
  g.beginPath(); g.arc(0.6, -0.2, 1.3, 0, TAU); g.fill();
  if (lvl > 0) glowDot(g, 0.6, -0.2, 4 + lvl * 2, C.redL, 0.5);
  g.restore();
  g.restore();
}

/* ============================================================ LIORA
   Die Aderlasserin — schlank, langer Karmesin-Gehrock mit wehenden Schoessen,
   Pferdeschwanz, Knochen-Sichel. Riskant: je weniger Leben, desto heller brennt sie. */
const SPEC_LIORA = { hipY: -27, torso: 19, headOff: 8, shoulderW: 9, legL: 14, legL2: 13.5, armL: 10.5, armL2: 10.5, stride: 9, lift: 5, lean: 0.06, shoulderDrop: 2.5, armRest: 0.1 };
function drawLiora(g, P, H) {
  const C = HERO_PAL.liora, t = P.t, flow = clamp(P.run * 1.1 + P.dodge, 0, 1.3);
  const rage = H.rage || 0; // 0..1 Blutrausch
  // --- Pferdeschwanz (hinten)
  {
    const hx = P.headX - 3, hy = P.headY - 4;
    const hp = flowCurve(hx, hy, 24, 7, flow, t, 0.7, 0.35, 0.05);
    ribbon(g, hp, (s) => 3.2 * (1 - s * 0.8));
    paint(g, lg(g, hx, hy, hx - 10, hy + 22, [0, C.hairL, 0.5, C.hair, 1, '#050205']), 'rgba(0,0,0,0.5)', 0.5);
    g.strokeStyle = rgba(C.coatL, 0.8); g.lineWidth = 0.8;
    curvePath(g, hp.map((p) => [p[0] + 0.6, p[1]])); g.stroke();
  }
  // --- Rockschoesse hinten
  for (let k = 0; k < 2; k++) {
    const ax = P.hipX - 3 + k * 2, ay = P.hipY - 3;
    const cp = flowCurve(ax, ay, 22 - k * 2, 6, flow, t, k * 1.7, 0.18, -0.2);
    ribbon(g, cp, (s) => (4.2 - k) * (1 - s * 0.55));
    paint(g, lg(g, ax, ay, ax - 10, ay + 20, [0, k ? C.coatD : C.coat, 1, '#20030a']), 'rgba(0,0,0,0.6)', 0.6);
  }
  // --- hinteres Bein & Arm
  drawBootLeg(g, P.legB, C, true);
  drawSlimArm(g, P.armB, C, true);
  // --- Rumpf
  g.save(); g.translate(P.hipX, P.hipY); g.rotate(P.lean);
  const T = SPEC_LIORA.torso;
  // Mantel (Oberkoerper)
  g.beginPath();
  g.moveTo(-5, 3);
  g.bezierCurveTo(-6.5, -T * 0.4, -6, -T * 0.8, -4.5, -T - 0.5);
  g.lineTo(5, -T - 0.5);
  g.bezierCurveTo(6.5, -T * 0.7, 4.5, -T * 0.45, 4.5, 3);
  g.closePath();
  paint(g, lg(g, -5, -T, 6, 2, [0, C.coatL, 0.4, C.coat, 1, C.coatD]), 'rgba(0,0,0,0.6)', 0.8);
  // Korsett
  g.beginPath();
  g.moveTo(-3.5, 1); g.quadraticCurveTo(-4.5, -T * 0.4, -2.5, -T * 0.72); g.lineTo(4, -T * 0.72); g.quadraticCurveTo(5, -T * 0.4, 3.5, 1); g.closePath();
  paint(g, lg(g, -3, -T * 0.7, 4, 0, [0, C.blackL, 1, C.black]), 'rgba(0,0,0,0.6)', 0.6);
  g.strokeStyle = rgba(C.coatL, 0.9); g.lineWidth = 0.45;
  for (let k = 0; k < 5; k++) { const yy = -2 - k * 2.6; g.beginPath(); g.moveTo(0, yy); g.lineTo(2.2, yy - 1.3); g.moveTo(2.2, yy); g.lineTo(0, yy - 1.3); g.stroke(); }
  // Halstuch (Rueschen)
  g.fillStyle = '#efe6dc';
  g.beginPath(); g.moveTo(0.5, -T + 0.5); g.quadraticCurveTo(4, -T + 3, 2.2, -T + 6); g.quadraticCurveTo(3.8, -T + 7.5, 1.4, -T + 8.5); g.quadraticCurveTo(-0.5, -T + 5, 0.5, -T + 0.5); g.fill();
  g.strokeStyle = 'rgba(80,50,60,0.6)'; g.lineWidth = 0.4; g.stroke();
  // Blutphiolen am Guertel
  g.fillStyle = '#20121a'; g.fillRect(-5, 0.5, 10, 2);
  for (let k = 0; k < 3; k++) {
    const vx = -3.6 + k * 2.4;
    g.fillStyle = 'rgba(210,220,230,0.6)'; g.fillRect(vx, 1.8, 1.6, 3.4);
    g.fillStyle = rgba('#e0183a', 0.6 + rage * 0.4); g.fillRect(vx + 0.2, 3, 1.2, 2);
  }
  g.restore();
  // Vorderer Schoss (leicht vor dem Bein)
  {
    const ax = P.hipX + 2.5, ay = P.hipY - 2;
    const cp = flowCurve(ax, ay, 19, 5, flow * 0.8, t, 2.4, 0.02, -0.4);
    ribbon(g, cp, (s) => 3.4 * (1 - s * 0.5));
    paint(g, lg(g, ax, ay, ax, ay + 18, [0, C.coat, 1, C.coatD]), 'rgba(0,0,0,0.6)', 0.6);
  }
  drawBootLeg(g, P.legF, C, false);
  // --- Kopf
  drawLioraHead(g, P, C, H);
  // hoher Mantelkragen
  g.save(); g.translate(P.neckX, P.neckY); g.rotate(P.lean);
  g.beginPath(); g.moveTo(-4.5, 1.5); g.quadraticCurveTo(-7, -4, -5.5, -8); g.lineTo(-2.5, -3); g.lineTo(0, 1.5); g.closePath();
  paint(g, lg(g, -6, -8, -1, 1, [0, C.coatL, 1, C.coatD]), 'rgba(0,0,0,0.6)', 0.6);
  g.restore();
  // --- vorderer Arm mit Sichel
  drawSlimArm(g, P.armF, C, false);
  if (H.weapon) drawCompanionWeapon(g, P.armF, H.weapon, P); else drawSickle(g, P.armF, C, P, H);
}
function drawBootLeg(g, L, C, back) {
  const dk = back ? -0.4 : 0;
  limb(g, L.hx, L.hy, L.kx, L.ky, 2.8, 2.2);
  paint(g, lg(g, L.hx, L.hy, L.kx + 3, L.ky, [0, shade(C.blackL, dk), 1, shade(C.black, dk)]), 'rgba(0,0,0,0.6)', 0.6);
  limb(g, L.kx, L.ky, L.fx, L.fy - 1.5, 2.4, 1.8);
  paint(g, lg(g, L.kx - 2, L.ky, L.kx + 2, L.fy, [0, shade('#2e1c26', dk), 1, shade('#0c060a', dk)]), 'rgba(0,0,0,0.7)', 0.6);
  // Stiefelkrempe
  g.beginPath(); g.ellipse(L.kx + 0.3, L.ky + 1.5, 3, 1.6, Math.atan2(L.fy - L.ky, L.fx - L.kx), 0, TAU);
  paint(g, shade(C.coat, dk), 'rgba(0,0,0,0.6)', 0.5);
  g.beginPath(); g.moveTo(L.fx - 2, L.fy - 2.5); g.lineTo(L.fx + 1.5, L.fy - 2.8); g.quadraticCurveTo(L.fx + 4, L.fy - 0.8, L.fx + 5.5, L.fy + 0.2); g.lineTo(L.fx - 2.4, L.fy + 0.2); g.closePath();
  paint(g, shade('#140a10', dk), 'rgba(0,0,0,0.8)', 0.5);
  g.fillStyle = shade('#3a2a30', dk); g.fillRect(L.fx - 2.4, L.fy - 0.4, 2, 0.8);
}
function drawSlimArm(g, A, C, back) {
  const dk = back ? -0.4 : 0;
  limb(g, A.sx, A.sy, A.ex, A.ey, 2.6, 2.1);
  paint(g, lg(g, A.sx, A.sy, A.ex, A.ey, [0, shade(C.coatL, dk - 0.1), 1, shade(C.coat, dk)]), 'rgba(0,0,0,0.6)', 0.6);
  limb(g, A.ex, A.ey, A.hx, A.hy, 1.9, 1.5);
  paint(g, shade(C.band, dk), 'rgba(60,40,40,0.8)', 0.5);
  g.strokeStyle = shade('#8a7462', dk); g.lineWidth = 0.4;
  for (let k = 1; k < 4; k++) {
    const x = lerp(A.ex, A.hx, k / 4.3), y = lerp(A.ey, A.hy, k / 4.3);
    g.beginPath(); g.moveTo(x - 1.4, y - 0.8); g.lineTo(x + 1.4, y + 0.6); g.stroke();
  }
  g.fillStyle = rgba('#b0102a', 0.8); g.beginPath(); g.arc(lerp(A.ex, A.hx, 0.5), lerp(A.ey, A.hy, 0.5) + 0.6, 0.7, 0, TAU); g.fill();
  g.beginPath(); g.arc(A.hx, A.hy, 1.8, 0, TAU); paint(g, shade(C.skin, dk), 'rgba(60,40,40,0.8)', 0.5);
}
function drawSickle(g, A, C, P, H) {
  const a = Math.atan2(A.hy - A.ey, A.hx - A.ex) + (P.cast > 0 ? -0.6 * P.cast : -0.4);
  g.save(); g.translate(A.hx, A.hy); g.rotate(a);
  // Griff
  g.beginPath(); g.moveTo(-3, -0.8); g.lineTo(9, -0.8); g.lineTo(9, 0.8); g.lineTo(-3, 0.8); g.closePath();
  paint(g, lg(g, 0, -1, 0, 1, [0, '#5a3a2c', 1, '#1e120c']), 'rgba(0,0,0,0.8)', 0.5);
  g.fillStyle = C.coatL; g.fillRect(-1, -1, 1.2, 2); g.fillRect(3, -1, 1.2, 2);
  // Klinge (Knochen mit Blutschneide)
  g.beginPath();
  g.moveTo(8.5, -1.2);
  g.bezierCurveTo(12, -9, 4, -16, -5, -14.5);
  g.bezierCurveTo(2, -12.5, 7, -8, 6, -1);
  g.closePath();
  paint(g, lg(g, 8, -2, -4, -14, [0, '#8e8272', 0.35, C.bone, 1, '#fff8ee']), 'rgba(0,0,0,0.8)', 0.6);
  g.strokeStyle = rgba('#ff2844', 0.85 + (H.rage || 0) * 0.15); g.lineWidth = 1;
  g.beginPath(); g.moveTo(9, -2); g.bezierCurveTo(12, -9.5, 4, -16.2, -5, -14.6); g.stroke();
  // Tropfen
  const dt = (P.t * 1.3) % 1;
  g.fillStyle = '#c0102a'; g.beginPath(); g.arc(-4 + dt * 0.5, -14 + dt * 7, 0.7 * (1 - dt * 0.5), 0, TAU); g.fill();
  g.restore();
}
function drawLioraHead(g, P, C, H) {
  const x = P.headX, y = P.headY;
  g.save(); g.translate(x, y); g.rotate(P.headA);
  // Haar hinten
  g.beginPath(); g.moveTo(-5.5, 3); g.quadraticCurveTo(-6.5, -7, 0, -7.6); g.quadraticCurveTo(-3, -3, -2, 4); g.closePath();
  paint(g, C.hair, null);
  // Gesicht
  g.beginPath();
  g.moveTo(-3.8, -5.2); g.quadraticCurveTo(0, -7.6, 3, -5.3); g.quadraticCurveTo(4.2, -3, 3.8, -1.6);
  g.lineTo(5.2, 0); g.lineTo(3.9, 0.6); g.quadraticCurveTo(4.3, 1.6, 3.6, 2.4); g.quadraticCurveTo(2.8, 4.6, 0.8, 5);
  g.quadraticCurveTo(-2.8, 4.6, -4, 1.5); g.closePath();
  paint(g, lg(g, 2, -6, -3, 5, [0, '#fff4ee', 0.6, C.skin, 1, C.skinD]), 'rgba(60,30,40,0.7)', 0.55);
  // Lippen
  g.fillStyle = '#9a0f24'; g.beginPath(); g.moveTo(3.2, 1.9); g.lineTo(4.1, 2.1); g.lineTo(3.3, 2.6); g.fill();
  // Auge + Wimpern
  eye(g, 2.2, -1.5, 0.85 + (H.rage || 0) * 0.35, C.eye);
  g.strokeStyle = '#120810'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(1, -2.3); g.quadraticCurveTo(2.6, -3, 3.8, -2.2); g.stroke();
  // Pony / Scheitel mit roter Straehne
  g.beginPath();
  g.moveTo(-5, -1); g.quadraticCurveTo(-5, -8.5, 1.5, -8); g.quadraticCurveTo(5, -7.5, 4.5, -3.5);
  g.quadraticCurveTo(2.5, -6, 0, -5.5); g.quadraticCurveTo(-2, -4, -2.5, 0); g.closePath();
  paint(g, lg(g, 0, -8, 0, 0, [0, C.hairL, 1, C.hair]), 'rgba(0,0,0,0.5)', 0.5);
  g.strokeStyle = '#d0203a'; g.lineWidth = 0.9;
  g.beginPath(); g.moveTo(-1, -7.5); g.quadraticCurveTo(2.5, -7, 3.8, -4); g.stroke();
  // Haarband
  g.fillStyle = '#b0142a'; g.beginPath(); g.ellipse(-4.2, -4.6, 1.2, 1.8, 0.4, 0, TAU); g.fill();
  g.restore();
}

/* ============================================================ NYX
   Der Schattenlaeufer — geduckt, spitze Kapuze, Knochenmaske, zwei
   Dolche im Rueckhandgriff und ein endlos langer, gluehender Schal. */
const SPEC_NYX = { hipY: -24, torso: 17, headOff: 8, shoulderW: 8.5, legL: 12.5, legL2: 12.5, armL: 9.5, armL2: 9.5, stride: 10, lift: 5.5, lean: 0.22, crouch: 1.5, shoulderDrop: 2.5, armRest: -0.2, stance: 1.6 };
function drawNyx(g, P, H) {
  const C = HERO_PAL.nyx, t = P.t, flow = clamp(P.run * 1.2 + P.dodge, 0, 1.4);
  const surge = H.flow || 0; // Schattenfluss 0..1
  // --- Schal (zwei lange Bahnen)
  for (let k = 0; k < 2; k++) {
    const ax = P.neckX - 1.5, ay = P.neckY + 1.2;
    const len = (30 - k * 7) * (0.62 + 0.38 * clamp(flow, 0, 1)) * (1 + surge * 0.35);
    const sp = flowCurve(ax, ay, len, 9, flow, t * 1.1, k * 2.3, 0.95, 0.15 + k * 0.1);
    ribbon(g, sp, (s) => (2.6 - k * 0.5) * (1 - s * 0.35));
    paint(g, lg(g, ax, ay, sp[sp.length - 1][0], sp[sp.length - 1][1], [0, C.scarf, 0.7, '#2a1650', 1, C.scarfL]), 'rgba(0,0,0,0.5)', 0.5);
    // leuchtende, zerfaserte Enden
    const e = sp[sp.length - 1];
    glowDot(g, e[0], e[1], 5 + surge * 4, C.scarfL, 0.45 + surge * 0.4);
  }
  drawWrapLeg(g, P.legB, C, true);
  drawDaggerArm(g, P.armB, C, true, P);
  // --- Rumpf mit kurzem, zerfetztem Umhang
  g.save(); g.translate(P.hipX, P.hipY); g.rotate(P.lean);
  const T = SPEC_NYX.torso;
  g.beginPath();
  g.moveTo(-4.5, 2); g.bezierCurveTo(-6, -T * 0.4, -5.5, -T * 0.8, -4, -T);
  g.lineTo(4, -T); g.bezierCurveTo(5.5, -T * 0.6, 4.5, -T * 0.3, 4, 2); g.closePath();
  paint(g, lg(g, -4, -T, 5, 2, [0, C.cloakL, 0.45, C.cloak, 1, C.cloakD]), 'rgba(0,0,0,0.6)', 0.7);
  // Riemen ueber der Brust
  g.strokeStyle = '#120e1c'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(-4, -T + 1); g.lineTo(4, -2); g.stroke();
  g.fillStyle = '#8c86a8'; g.fillRect(-0.6, -T * 0.5 - 0.6, 1.4, 1.4);
  // Schattenkern (leuchtet mit Fluss)
  glowDot(g, 0.5, -T * 0.55, 3 + surge * 5, C.rim, 0.25 + surge * 0.6);
  g.restore();
  // Umhangfetzen um die Huefte
  for (let k = 0; k < 4; k++) {
    const ax = P.hipX - 4 + k * 2.4, ay = P.hipY - 1;
    const cp = flowCurve(ax, ay, 9 + (k % 2) * 3, 4, flow, t, k * 1.1, 0.12, -0.3);
    ribbon(g, cp, (s) => 1.8 * (1 - s));
    paint(g, k % 2 ? C.cloakD : C.cloak, 'rgba(0,0,0,0.5)', 0.4);
  }
  drawWrapLeg(g, P.legF, C, false);
  drawNyxHead(g, P, C, H);
  drawDaggerArm(g, P.armF, C, false, P);
}
function drawWrapLeg(g, L, C, back) {
  const dk = back ? -0.4 : 0;
  limb(g, L.hx, L.hy, L.kx, L.ky, 2.7, 2.1);
  paint(g, lg(g, L.hx, L.hy, L.kx, L.ky, [0, shade(C.cloakL, dk - 0.1), 1, shade(C.cloakD, dk)]), 'rgba(0,0,0,0.6)', 0.6);
  limb(g, L.kx, L.ky, L.fx, L.fy - 1.3, 2.2, 1.7);
  paint(g, shade(C.wrap, dk), 'rgba(0,0,0,0.7)', 0.6);
  g.strokeStyle = shade('#6a6080', dk); g.lineWidth = 0.4;
  for (let k = 1; k < 5; k++) { const x = lerp(L.kx, L.fx, k / 5.5), y = lerp(L.ky, L.fy, k / 5.5); g.beginPath(); g.moveTo(x - 1.8, y - 0.6); g.lineTo(x + 1.8, y + 0.5); g.stroke(); }
  g.beginPath(); g.moveTo(L.fx - 2.2, L.fy - 2.2); g.lineTo(L.fx + 1, L.fy - 2.4); g.quadraticCurveTo(L.fx + 3.6, L.fy - 0.8, L.fx + 4.6, L.fy + 0.2); g.lineTo(L.fx - 2.5, L.fy + 0.2); g.closePath();
  paint(g, shade('#16121e', dk), 'rgba(0,0,0,0.8)', 0.5);
}
function drawDaggerArm(g, A, C, back, P) {
  const dk = back ? -0.4 : 0;
  limb(g, A.sx, A.sy, A.ex, A.ey, 2.4, 1.9);
  paint(g, shade(C.cloak, dk), 'rgba(0,0,0,0.6)', 0.6);
  limb(g, A.ex, A.ey, A.hx, A.hy, 1.9, 1.6);
  paint(g, shade(C.wrap, dk), 'rgba(0,0,0,0.7)', 0.5);
  g.beginPath(); g.arc(A.hx, A.hy, 1.7, 0, TAU); paint(g, shade('#2a2436', dk), 'rgba(0,0,0,0.7)', 0.5);
  // Dolch im Rueckhandgriff: Klinge zeigt nach hinten/unten am Unterarm entlang
  const fa = Math.atan2(A.hy - A.ey, A.hx - A.ex);
  const a = fa + Math.PI * 0.92 + (P.cast * (back ? 0 : 1.6));
  g.save(); g.translate(A.hx, A.hy); g.rotate(a);
  g.fillStyle = '#1a1420'; g.fillRect(-2.2, -0.7, 2.6, 1.4);
  g.fillStyle = '#6a6484'; g.fillRect(0.2, -1.6, 0.9, 3.2);
  g.beginPath(); g.moveTo(1, -1); g.quadraticCurveTo(7, -1.6, 11, 0.8); g.quadraticCurveTo(6, 0.6, 1, 1); g.closePath();
  paint(g, lg(g, 1, -1, 10, 1, [0, shade(C.steelL, dk), 1, shade(C.steel, dk)]), 'rgba(0,0,0,0.8)', 0.4);
  g.save(); g.globalCompositeOperation = 'lighter';
  g.strokeStyle = rgba(C.rim, back ? 0.35 : 0.8); g.lineWidth = 0.5;
  g.beginPath(); g.moveTo(1.5, -1.2); g.quadraticCurveTo(7, -1.7, 10.8, 0.6); g.stroke();
  g.restore();
  g.restore();
}
function drawNyxHead(g, P, C, H) {
  g.save(); g.translate(P.headX, P.headY); g.rotate(P.headA);
  // Kapuze mit langer, nach hinten fallender Spitze
  const flow = clamp(P.run + P.dodge, 0, 1);
  g.beginPath();
  g.moveTo(-6, 5.5);
  g.quadraticCurveTo(-8, -3, -3, -8.2);
  g.quadraticCurveTo(-8 - flow * 3, -9 - flow, -14 - flow * 5, -5 + Math.sin(P.t * 7) * flow);
  g.quadraticCurveTo(-8, -6.5, -6.8, 2);
  g.quadraticCurveTo(-4, -8.6, 2.5, -8);
  g.quadraticCurveTo(6.8, -6.5, 6, -1);
  g.quadraticCurveTo(5.5, 3.5, 3.5, 6);
  g.lineTo(-6, 5.5);
  g.closePath();
  paint(g, lg(g, 2, -8, -8, 6, [0, C.cloakL, 0.5, C.cloak, 1, C.cloakD]), 'rgba(0,0,0,0.7)', 0.6);
  // dunkles Kapuzeninneres
  g.beginPath(); g.moveTo(-1, 5.5); g.quadraticCurveTo(-2.5, -5, 2.5, -6); g.quadraticCurveTo(5.8, -4.5, 5, 0.5); g.quadraticCurveTo(4.5, 4, 3, 5.5); g.closePath();
  paint(g, '#06030c', null);
  // Knochen-Halbmaske
  g.beginPath(); g.moveTo(0.4, -3.2); g.quadraticCurveTo(3.8, -4.6, 5.4, -2); g.lineTo(5.6, 0.8); g.quadraticCurveTo(3.5, 1.8, 1.4, 1.2); g.quadraticCurveTo(0, -0.8, 0.4, -3.2); g.closePath();
  paint(g, lg(g, 2, -4, 4, 1, [0, '#fff8ea', 0.5, C.mask, 1, C.maskD]), 'rgba(0,0,0,0.7)', 0.5);
  g.strokeStyle = 'rgba(60,40,40,0.8)'; g.lineWidth = 0.35;
  g.beginPath(); g.moveTo(1.6, 0.9); g.lineTo(2, -0.3); g.moveTo(3, 1.3); g.lineTo(3.2, 0); g.stroke();
  eye(g, 3.4, -1.6, 0.85 + (H.flow || 0) * 0.3, C.eye);
  g.restore();
}

/* ============================================================ SHEN
   Meister der drei Kraefte — breiter Strohhut, langer weisser Bart,
   Robe mit weiten Aermeln und roter Schaerpe. Qi-Tattoos leuchten mit
   jeder gesammelten Qi-Perle. */
const SPEC_SHEN = { hipY: -25, torso: 19, headOff: 8, shoulderW: 11, legL: 12.5, legL2: 12.5, armL: 10.5, armL2: 10.5, stride: 8, lift: 4, lean: 0.02, shoulderDrop: 3, stance: 1.3, armRest: 0.05 };
function drawShen(g, P, H) {
  const C = HERO_PAL.shen, t = P.t, flow = clamp(P.run * 1.1 + P.dodge, 0, 1.3);
  const qi = H.qi || 0; // 0..1
  // Schaerpenbaender hinten
  for (let k = 0; k < 2; k++) {
    const ax = P.hipX - 3, ay = P.hipY - 3;
    const sp = flowCurve(ax, ay, 20 - k * 4, 6, flow + P.rooted * 0.4, t, k * 1.9, 0.25, -0.1);
    ribbon(g, sp, (s) => 1.9 - k * 0.3);
    paint(g, lg(g, ax, ay, ax - 8, ay + 18, [0, C.sash, 1, '#4a0a12']), 'rgba(0,0,0,0.5)', 0.4);
  }
  drawRobeLeg(g, P.legB, C, true);
  drawSleeveArm(g, P.armB, C, true, P, qi);
  // Robe: Rumpf + Rockteil
  g.save(); g.translate(P.hipX, P.hipY); g.rotate(P.lean);
  const T = SPEC_SHEN.torso;
  const sw = Math.sin(P.ph) * 2 * P.run;
  // Rockteil
  g.beginPath();
  g.moveTo(-6, -2); g.lineTo(6, -2);
  g.quadraticCurveTo(8.5 + sw, 6, 7.5 + sw * 1.4, 14 - P.rooted * 2);
  g.lineTo(-7.5 - sw, 13.5 - P.rooted * 2);
  g.quadraticCurveTo(-8.5 - sw, 6, -6, -2); g.closePath();
  paint(g, lg(g, 0, -2, 0, 14, [0, C.robe, 1, C.robeD]), 'rgba(0,0,0,0.55)', 0.7);
  g.strokeStyle = rgba(C.gold, 0.8); g.lineWidth = 0.7;
  g.beginPath(); g.moveTo(7.2 + sw * 1.4, 13 - P.rooted * 2); g.lineTo(-7.2 - sw, 12.6 - P.rooted * 2); g.stroke();
  g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 0.6;
  g.beginPath(); g.moveTo(1, -1); g.lineTo(1.5 + sw, 13); g.moveTo(-3, -1); g.lineTo(-4 - sw, 12.5); g.stroke();
  // Oberkoerper
  g.beginPath();
  g.moveTo(-6, 0); g.bezierCurveTo(-7.5, -T * 0.4, -7, -T * 0.8, -5.5, -T);
  g.lineTo(5.5, -T); g.bezierCurveTo(7.5, -T * 0.7, 7, -T * 0.4, 6, 0); g.closePath();
  paint(g, lg(g, -6, -T, 6, 0, [0, C.robeL, 0.45, C.robe, 1, C.robeD]), 'rgba(0,0,0,0.55)', 0.7);
  // Wickelkragen (weisses Unterkleid)
  g.beginPath(); g.moveTo(-1, -T); g.lineTo(3, -T); g.lineTo(5, -T * 0.45); g.lineTo(2.5, -T * 0.4); g.closePath();
  paint(g, lg(g, 0, -T, 3, -T * 0.4, [0, C.inner, 1, C.innerD]), 'rgba(0,0,0,0.5)', 0.5);
  g.strokeStyle = '#111'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(3, -T); g.lineTo(5, -T * 0.45); g.stroke();
  // Schaerpe
  g.beginPath(); g.moveTo(-6.5, -1); g.lineTo(6.5, -1.5); g.lineTo(6.8, -5); g.lineTo(-6.8, -4.5); g.closePath();
  paint(g, lg(g, 0, -5, 0, -1, [0, C.sashL, 1, C.sash]), 'rgba(0,0,0,0.6)', 0.6);
  // Knoten
  g.beginPath(); g.arc(3.8, -3, 1.6, 0, TAU); paint(g, C.sash, 'rgba(0,0,0,0.6)', 0.5);
  // Gebetskette (grosse Perlen)
  for (let k = 0; k < 7; k++) {
    const a = 0.25 + k * 0.36;
    const bx = -1 + Math.cos(a) * 5, by = -T + 2 + Math.sin(a) * 6;
    g.beginPath(); g.arc(bx, by, 1.05, 0, TAU);
    paint(g, rg(g, bx - 0.3, by - 0.3, 0, 1.2, [0, '#7a5a40', 1, C.bead]), 'rgba(0,0,0,0.6)', 0.3);
  }
  // Qi-Siegel auf der Brust
  if (qi > 0) glowDot(g, 1, -T * 0.6, 3 + qi * 6, C.eye, 0.25 + qi * 0.5);
  g.restore();
  drawRobeLeg(g, P.legF, C, false);
  drawShenHead(g, P, C, H);
  drawSleeveArm(g, P.armF, C, false, P, qi);
}
function drawRobeLeg(g, L, C, back) {
  const dk = back ? -0.4 : 0;
  limb(g, L.hx, L.hy, L.kx, L.ky, 3.2, 2.8);
  paint(g, shade('#1c1c20', dk), 'rgba(0,0,0,0.6)', 0.6);
  limb(g, L.kx, L.ky, L.fx, L.fy - 1.5, 2.9, 2.2);
  paint(g, lg(g, L.kx, L.ky, L.fx, L.fy, [0, shade('#26262c', dk), 1, shade('#121216', dk)]), 'rgba(0,0,0,0.6)', 0.6);
  // Wickelgamaschen (hell)
  g.strokeStyle = shade(C.inner, dk - 0.2); g.lineWidth = 0.8;
  for (let k = 3; k < 6; k++) { const x = lerp(L.kx, L.fx, k / 6.5), y = lerp(L.ky, L.fy, k / 6.5); g.beginPath(); g.moveTo(x - 2, y - 0.5); g.lineTo(x + 2, y + 0.5); g.stroke(); }
  // Holzsandale
  g.beginPath(); g.moveTo(L.fx - 2.6, L.fy - 2); g.quadraticCurveTo(L.fx + 2, L.fy - 3, L.fx + 4.5, L.fy - 0.5); g.lineTo(L.fx + 4.5, L.fy + 0.3); g.lineTo(L.fx - 2.8, L.fy + 0.3); g.closePath();
  paint(g, shade(C.skin, dk - 0.1), 'rgba(0,0,0,0.7)', 0.5);
  g.fillStyle = shade('#4a3220', dk); g.fillRect(L.fx - 3, L.fy - 0.2, 7.8, 1.2);
}
function drawSleeveArm(g, A, C, back, P, qi) {
  const dk = back ? -0.4 : 0;
  // weiter Aermel haengt vom Oberarm
  const a = Math.atan2(A.ey - A.sy, A.ex - A.sx);
  g.save(); g.translate(A.sx, A.sy); g.rotate(a);
  const L = Math.hypot(A.ex - A.sx, A.ey - A.sy);
  const hang = 5 + (1 - Math.abs(Math.cos(a))) * 1;
  g.beginPath();
  g.moveTo(-1, -3); g.lineTo(L + 1, -3.2); g.quadraticCurveTo(L + 4, 2, L + 2.5, hang + 2); g.lineTo(L - 3, hang + 3.5); g.quadraticCurveTo(0, 4, -1, 3); g.closePath();
  paint(g, lg(g, 0, -3, 0, hang + 3, [0, shade(C.robeL, dk - 0.1), 0.5, shade(C.robe, dk), 1, shade(C.robeD, dk)]), 'rgba(0,0,0,0.6)', 0.6);
  g.strokeStyle = rgba(C.gold, back ? 0.35 : 0.7); g.lineWidth = 0.6;
  g.beginPath(); g.moveTo(L + 2.4, hang + 1.6); g.lineTo(L - 2.8, hang + 3); g.stroke();
  g.restore();
  // Unterarm (nackt, Qi-Tattoo)
  limb(g, A.ex, A.ey, A.hx, A.hy, 2.1, 1.8);
  paint(g, lg(g, A.ex, A.ey, A.hx, A.hy, [0, shade(C.skin, dk), 1, shade(C.skinD, dk)]), 'rgba(40,20,10,0.7)', 0.5);
  if (!back || qi > 0) {
    g.save(); g.globalCompositeOperation = 'lighter';
    g.strokeStyle = rgba(C.eye, (back ? 0.2 : 0.4) + qi * 0.6); g.lineWidth = 0.55;
    const mx = lerp(A.ex, A.hx, 0.5), my = lerp(A.ey, A.hy, 0.5);
    g.beginPath(); g.arc(mx, my, 1, 0, TAU); g.moveTo(lerp(A.ex, A.hx, 0.2), lerp(A.ey, A.hy, 0.2)); g.lineTo(lerp(A.ex, A.hx, 0.8), lerp(A.ey, A.hy, 0.8)); g.stroke();
    g.restore();
  }
  // offene Hand (Handflaeche)
  const ha = Math.atan2(A.hy - A.ey, A.hx - A.ex);
  g.save(); g.translate(A.hx, A.hy); g.rotate(ha + (P.cast > 0 ? -1.2 * P.cast : 0));
  g.beginPath(); g.moveTo(-0.5, -1.8); g.lineTo(3.2, -2); g.quadraticCurveTo(4.6, -0.2, 3.2, 1.8); g.lineTo(-0.5, 1.8); g.closePath();
  paint(g, shade(C.skin, dk + 0.05), 'rgba(40,20,10,0.7)', 0.5);
  g.restore();
  if (!back && P.cast > 0.05) {
    const hx = A.hx + Math.cos(ha) * 4, hy = A.hy + Math.sin(ha) * 4;
    glowDot(g, hx, hy, 6 + P.cast * 5, C.eye, 0.7 * P.cast);
    glowDot(g, hx, hy, 2.5, '#ffffff', 0.8 * P.cast);
  }
}
function drawShenHead(g, P, C, H) {
  const t = P.t;
  g.save(); g.translate(P.headX, P.headY); g.rotate(P.headA);
  const flow = clamp(P.run + P.dodge, 0, 1);
  // Zopf
  const hp = flowCurve(-3.5, -4, 12, 4, flow, t, 0.3, 0.6, -0.2);
  ribbon(g, hp, (s) => 1.4 * (1 - s * 0.5)); paint(g, '#d6d2ca', 'rgba(0,0,0,0.4)', 0.4);
  // Gesicht
  g.beginPath();
  g.moveTo(-3.8, -4.5); g.quadraticCurveTo(0, -6.8, 3.2, -5); g.quadraticCurveTo(4.4, -3, 4, -1.4);
  g.lineTo(5.4, 0.3); g.lineTo(4, 0.8); g.quadraticCurveTo(4.3, 2.4, 3.2, 3.5);
  g.quadraticCurveTo(0, 5, -3.8, 2); g.closePath();
  paint(g, lg(g, 2, -5, -3, 4, [0, '#e0b896', 0.6, C.skin, 1, C.skinD]), 'rgba(40,20,10,0.7)', 0.55);
  // Falten, Brauen (lang, weiss)
  g.strokeStyle = C.beard; g.lineWidth = 0.9;
  g.beginPath(); g.moveTo(0.5, -2.9); g.quadraticCurveTo(3, -3.6, 5.5, -2.2); g.stroke();
  // Auge: gesammelt, halb geschlossen -> leuchtet mit Qi
  const q = H.qi || 0;
  if (q > 0.05 || P.cast > 0) eye(g, 2.7, -1.5, 0.75 + q * 0.3, C.eye);
  else { g.strokeStyle = '#2a1a10'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(1.8, -1.4); g.lineTo(3.6, -1.3); g.stroke(); }
  // langer Bart (weht)
  const bp = flowCurve(2.5, 2.5, 13, 5, flow * 0.7, t, 1.2, 0.05, -0.6);
  ribbon(g, bp, (s) => 2.4 * (1 - s * 0.8));
  paint(g, lg(g, 2, 2, 0, 14, [0, '#ffffff', 1, '#b9b4aa']), 'rgba(60,50,40,0.5)', 0.45);
  // Schnurrbart
  g.beginPath(); g.moveTo(3.2, 1.3); g.quadraticCurveTo(5, 2.5, 5.5, 5.5); g.quadraticCurveTo(4.2, 3.2, 2.4, 2.6); g.closePath(); paint(g, C.beard, null);
  // Strohhut: breit, flach-konisch — die Silhouette des Meisters
  g.save(); g.translate(0.4, -5.2); g.rotate(-0.06);
  g.beginPath();
  g.moveTo(-13.5, 1.4); g.quadraticCurveTo(-6, -2, 0, -7.6); g.quadraticCurveTo(6, -2, 13.5, 1.2);
  g.quadraticCurveTo(0, 3.2, -13.5, 1.4); g.closePath();
  paint(g, lg(g, -6, -7, 6, 2, [0, C.hatL, 0.5, C.hat, 1, C.hatD]), 'rgba(0,0,0,0.75)', 0.7);
  g.strokeStyle = 'rgba(40,25,10,0.55)'; g.lineWidth = 0.45;
  for (let k = -4; k <= 4; k++) { g.beginPath(); g.moveTo(0, -7.3); g.lineTo(k * 3.2, 1.8 - Math.abs(k) * 0.12); g.stroke(); }
  g.strokeStyle = rgba(C.sash, 0.9); g.lineWidth = 0.9;
  g.beginPath(); g.moveTo(-5.5, -2.2); g.quadraticCurveTo(0, -0.8, 5.5, -2.2); g.stroke();
  g.restore();
  g.restore();
}

/* ============================================================ Registratur */
const HERO_ART = {
  vorian: { spec: SPEC_VORIAN, draw: drawVorian, rim: HERO_PAL.vorian.rim, h: 66 },
  liora: { spec: SPEC_LIORA, draw: drawLiora, rim: HERO_PAL.liora.rim, h: 64 },
  nyx: { spec: SPEC_NYX, draw: drawNyx, rim: HERO_PAL.nyx.rim, h: 58 },
  shen: { spec: SPEC_SHEN, draw: drawShen, rim: HERO_PAL.shen.rim, h: 66 }
};

/* Rendert eine Heldenpose in ein Canvas (mit Kontur + Randlicht). */
const HERO_BOX = 120; // Welt-Einheiten
function renderHero(id, st, H, px, target, opts) {
  const art = HERO_ART[id];
  const S = Math.ceil(HERO_BOX * px);
  const raw = target && target.raw ? target.raw : mkCanvas(S, S);
  if (raw.width !== S) { raw.width = S; raw.height = S; }
  const g = raw.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, S, S);
  g.setTransform(px, 0, 0, px, S / 2, S * 0.78);
  g.lineCap = 'round'; g.lineJoin = 'round';
  const P = makePose(art.spec, st);
  art.draw(g, P, H || {});
  g.setTransform(1, 0, 0, 1, 0, 0);
  const out = target && target.out ? target.out : mkCanvas(S, S);
  if (out.width !== S) { out.width = S; out.height = S; }
  finishSprite(raw, {
    outline: Math.max(1.2, px * 0.62),
    rim: (H && H.rim) || art.rim, rimW: px * 0.75, rimA: 0.9,
    glow: opts && opts.glow ? ((H && H.rim) || art.rim) : null, glowA: 0.6,
    moonW: px * 0.55
  }, out);
  return { raw, out, P, S, anchorY: S * 0.78 };
}

// Waffen der Begleiter (Bogen, Schwert) statt Lioras Sichel
function drawCompanionWeapon(g, A, kind, P) {
  if (kind === 'none') return;
  const a = Math.atan2(A.hy - A.ey, A.hx - A.ex);
  g.save(); g.translate(A.hx, A.hy);
  if (kind === 'bow') {
    g.rotate(P.cast > 0 ? P.aim : -0.2);
    g.strokeStyle = '#4a2e1a'; g.lineWidth = 1.8;
    g.beginPath(); g.arc(-3, 0, 12, -1.2, 1.2); g.stroke();
    g.strokeStyle = '#e8e0d0'; g.lineWidth = 0.5;
    g.beginPath(); g.moveTo(-3 + Math.cos(-1.2) * 12, Math.sin(-1.2) * 12); g.lineTo(-3 - P.cast * 5, 0); g.lineTo(-3 + Math.cos(1.2) * 12, Math.sin(1.2) * 12); g.stroke();
    if (P.cast > 0.2) { g.strokeStyle = '#d8d0c0'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(-3 - P.cast * 5, 0); g.lineTo(12, 0); g.stroke(); }
  } else {
    g.rotate(a - 0.9 - P.cast * 1.4);
    g.fillStyle = '#2a2430'; g.fillRect(-2, -0.9, 4, 1.8);
    g.fillStyle = '#c9a24c'; g.fillRect(1.6, -2.6, 1.2, 5.2);
    g.beginPath(); g.moveTo(2.8, -1); g.lineTo(22, -0.4); g.lineTo(24, 0.3); g.lineTo(2.8, 1); g.closePath();
    paint(g, lg(g, 3, -1, 3, 1, [0, '#ffffff', 0.5, '#b8d8f0', 1, '#6a88a8']), 'rgba(0,0,0,0.7)', 0.4);
  }
  g.restore();
}
