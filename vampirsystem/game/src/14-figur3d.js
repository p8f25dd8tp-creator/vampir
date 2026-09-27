'use strict';
/* ==========================================================================
   3D-FIGUREN (Anime-Stil) — eigene Gestaltung
   Glatt geformte Koerper (Drehkoerper statt Kapseln), Anime-Kopf mit spitzem
   Kinn, Haarstraehnen mit Glanzring, Kleidung mit Kragen und Knoepfen.
   Alle Teile eines Knochens werden zu EINEM Netz mit Vertexfarben verschmolzen
   (wenige Zeichenaufrufe -> fluessig am Handy). Animation mit Ausholen,
   Wucht und Nachschwingen, Haare federn nach.
   ========================================================================== */

/* ------------------------------------------------------------ Gesicht */
function faceTexture(L) {
  const k = mkCanvas(512, 256), g = k.getContext('2d');
  g.fillStyle = L.skin; g.fillRect(0, 0, 512, 256);
  const cx = 128, ey = 140; // Gesichtsmitte liegt bei u = 0.25 (vorn)
  if (L.mask) { g.fillStyle = '#0c0a0e'; g.beginPath(); g.ellipse(cx, 190, 70, 60, 0, 0, TAU); g.fill(); g.fillStyle = '#b0102a'; for (const [x, y, r] of [[150, 200, 6], [110, 215, 5], [168, 176, 4]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } }
  g.fillStyle = 'rgba(255,110,120,0.2)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 46, ey + 30, 15, 7, 0, 0, TAU); g.fill(); }
  for (const s of [-1, 1]) {
    const x = cx + s * 31;
    if (L.blind) { g.strokeStyle = '#3a2a24'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(x - 13, ey + 2); g.quadraticCurveTo(x, ey + 8, x + 13, ey + 2); g.stroke(); continue; }
    g.save(); g.translate(x, ey); g.rotate(s * (L.angry ? -0.12 : 0.05));
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(0, 0, 14, 18, 0, 0, TAU); g.fill();
    const ir = g.createLinearGradient(0, -17, 0, 17); ir.addColorStop(0, shade(L.eye, -0.55)); ir.addColorStop(0.6, L.eye); ir.addColorStop(1, shade(L.eye, 0.45));
    g.fillStyle = ir; g.beginPath(); g.ellipse(s * 1, 2, 10.5, 15, 0, 0, TAU); g.fill();
    g.strokeStyle = shade(L.eye, -0.6); g.lineWidth = 1.5; g.stroke();
    g.fillStyle = L.glow ? '#fff4c0' : '#12080c'; g.beginPath(); g.ellipse(s * 1, 3, 4.8, 7.5, 0, 0, TAU); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(-4, -6, 4.2, 5, -0.4, 0, TAU); g.fill(); g.beginPath(); g.arc(4, 8, 2, 0, TAU); g.fill();
    // Oberlid mit Wimpernschwung
    g.strokeStyle = '#1a0c12'; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-16, -6); g.quadraticCurveTo(0, -23, 16, -9); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.moveTo(s * 15, -8); g.lineTo(s * 21, -13); g.stroke();
    g.lineWidth = 1.5; g.beginPath(); g.moveTo(-10, 17); g.quadraticCurveTo(0, 20, 10, 17); g.stroke();
    g.restore();
    g.strokeStyle = shade(L.hair, -0.25); g.lineWidth = 4.5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x - s * 13, ey - 31 + (L.angry ? 8 : 0)); g.quadraticCurveTo(x, ey - 37 + (L.angry ? 2 : 0), x + s * 14, ey - 33 + (L.angry ? -4 : 0)); g.stroke();
  }
  g.strokeStyle = shade(L.skin, -0.28); g.lineWidth = 2; g.beginPath(); g.moveTo(cx + 2, ey + 24); g.lineTo(cx - 1, ey + 31); g.stroke();
  g.strokeStyle = '#6a2830'; g.lineWidth = 3; g.beginPath();
  if (L.angry) { g.moveTo(cx - 10, ey + 49); g.quadraticCurveTo(cx, ey + 43, cx + 10, ey + 49); } else { g.moveTo(cx - 7, ey + 46); g.quadraticCurveTo(cx, ey + 50, cx + 7, ey + 46); }
  g.stroke();
  const t = new THREE.CanvasTexture(k); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

/* ------------------------------------------------------------ Geometrie-Bausteine */
const FG = {};
function fgeo(key, make) { return FG[key] || (FG[key] = make()); }
function taper(r0, r1, len, seg) { return fgeo(`tp${r0}_${r1}_${len}`, () => { const g = new THREE.CylinderGeometry(r1, r0, len, seg || 12, 1); g.translate(0, -len / 2, 0); return g; }); }
function lathe(key, pts, seg) { return fgeo(key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg || 18)); }
function animeHead() {
  return fgeo('head', () => {
    const g = new THREE.SphereGeometry(0.165, 28, 20), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      x *= 0.93;
      if (y < 0) { const t = -y / 0.165; x *= 1 - 0.32 * t * t; z *= 1 - 0.12 * t; y *= 1 + 0.18 * t; if (z > 0) z += 0.012 * t; } // spitzes Kinn
      p.setXYZ(i, x, y, z);
    }
    g.computeVertexNormals(); return g;
  });
}
// Sammler: Teile je Knochen, am Ende zu einem Netz mit Vertexfarben verschmolzen
function PartSet() { return new Map(); }
function addP(S, bone, geom, col, x, y, z, rx, ry, rz, sx, sy, sz) {
  if (!S.has(bone)) S.set(bone, []);
  const m = new THREE.Object3D(); m.position.set(x || 0, y || 0, z || 0); m.rotation.set(rx || 0, ry || 0, rz || 0); if (sx !== undefined) m.scale.set(sx, sy, sz); m.updateMatrix();
  S.get(bone).push({ geom, col: new THREE.Color(col), mat: m.matrix.clone() });
}
function bakeSet(S, mat, outlineW, noShadow) {
  for (const [bone, list] of S) {
    const pos = [], nor = [], colA = [];
    for (const it of list) {
      let q = it.geom.clone(); if (q.index) q = q.toNonIndexed(); q.applyMatrix4(it.mat);
      pos.push(q.attributes.position.array); nor.push(q.attributes.normal.array);
      const n = q.attributes.position.count, c = new Float32Array(n * 3); for (let i = 0; i < n; i++) { c[i * 3] = it.col.r; c[i * 3 + 1] = it.col.g; c[i * 3 + 2] = it.col.b; } colA.push(c);
    }
    const cat = (arrs) => { const n = arrs.reduce((a, x) => a + x.length, 0), out = new Float32Array(n); let o = 0; for (const x of arrs) { out.set(x, o); o += x.length; } return out; };
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(cat(pos), 3)); g.setAttribute('normal', new THREE.BufferAttribute(cat(nor), 3)); g.setAttribute('color', new THREE.BufferAttribute(cat(colA), 3));
    const mesh = new THREE.Mesh(g, mat); mesh.castShadow = !noShadow;
    const o = new THREE.Mesh(g, outlineW ? outlineMat(outlineW) : R3.outline); mesh.add(o);
    bone.add(mesh);
  }
}
const _outl = {};
function outlineMat(w) { if (!_outl[w]) { _outl[w] = R3.outline.clone(); _outl[w].uniforms.w.value = w; } return _outl[w]; }
// Toon-Material mit Randlicht (Anime-Rim) in der Figurfarbe
function rimToon(o, rimCol) {
  const m = new THREE.MeshToonMaterial(Object.assign({ gradientMap: R3.grad }, o));
  m.userData.rim = { value: new THREE.Color(rimCol || '#9ab0ff') };
  m.onBeforeCompile = (sh) => {
    sh.uniforms.rimCol = m.userData.rim;
    sh.fragmentShader = 'uniform vec3 rimCol;\n' + sh.fragmentShader.replace('#include <opaque_fragment>',
      'float rimF = 1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0);\n outgoingLight += rimCol * smoothstep(0.62, 0.8, rimF) * 0.55;\n#include <opaque_fragment>');
  };
  return m;
}

/* ------------------------------------------------------------ Figur bauen */
function buildHuman(L0, extra) {
  const T = THREE, L = extra ? Object.assign({}, L0, extra) : L0;
  const mat = rimToon({ vertexColors: true }, L.rim);
  const faceMat = rimToon({ map: faceTexture(L) }, L.rim);
  const mats = [mat, faceMat];
  const S = PartSet();
  const root = new T.Group(), body = grp(root), hips = grp(body, 0, 0.93, 0);
  const torso = grp(hips), chest = grp(torso, 0, 0.42, 0), neck = grp(chest, 0, 0.06, 0), head = grp(neck, 0, 0.2, 0), hairPivot = grp(head);
  const top = L.top, topD = L.topD, topL = L.topL || L.top, leg = L.leg, skin = L.skin;
  // Becken und Hose
  addP(S, hips, lathe('pelvis', [[0.02, -0.13], [0.12, -0.11], [0.145, -0.03], [0.135, 0.05], [0.02, 0.06]]), leg, 0, 0, 0, 0, 0, 0, 1, 1, 0.76);
  addP(S, hips, fgeo('belt', () => new T.TorusGeometry(0.138, 0.02, 6, 20)), '#16121a', 0, 0.045, 0, Math.PI / 2, 0, 0, 1, 0.76, 1);
  addP(S, hips, fgeo('buckle', () => new T.BoxGeometry(0.05, 0.035, 0.02)), '#c8b070', 0, 0.045, 0.105);
  // Oberkoerper: Taille, Brust, Schultern
  addP(S, torso, lathe('torso', [[0.02, 0.0], [0.13, 0.02], [0.122, 0.12], [0.14, 0.24], [0.165, 0.34], [0.172, 0.4], [0.12, 0.46], [0.02, 0.47]]), top, 0, 0, 0, 0, 0, 0, 1, 1, 0.72);
  if (L.outfit === 'uniform') {
    for (const s of [-1, 1]) addP(S, torso, fgeo('lapel', () => new T.BoxGeometry(0.06, 0.2, 0.02)), topD, s * 0.055, 0.36, 0.108, -0.12, 0, s * 0.35);
    for (let k = 0; k < 3; k++) addP(S, torso, fgeo('btn', () => new T.SphereGeometry(0.014, 6, 5)), L.trim || '#c8b070', 0.028, 0.28 - k * 0.09, 0.118);
    for (const s of [-1, 1]) addP(S, torso, fgeo('epau', () => new T.BoxGeometry(0.1, 0.02, 0.07)), L.trim || '#c8b070', s * 0.14, 0.43, 0, 0, 0, s * -0.25);
    addP(S, torso, fgeo('hem', () => new T.CylinderGeometry(0.135, 0.13, 0.05, 18, 1, true)), topD, 0, 0.02, 0, 0, 0, 0, 1, 1, 0.74);
  } else if (L.outfit === 'hoodie') {
    addP(S, torso, fgeo('hood', () => new T.TorusGeometry(0.1, 0.055, 8, 18)), topD, 0, 0.45, -0.05, Math.PI / 2 - 0.45, 0, 0, 1.15, 1, 1);
    addP(S, torso, fgeo('pocket', () => new T.BoxGeometry(0.17, 0.08, 0.02)), topD, 0, 0.1, 0.098);
    for (const s of [-1, 1]) addP(S, torso, fgeo('str', () => new T.CylinderGeometry(0.007, 0.007, 0.13, 5)), '#e8e8f0', s * 0.035, 0.34, 0.11);
  } else {
    addP(S, torso, fgeo('collarT', () => new T.TorusGeometry(0.07, 0.018, 6, 16)), topD, 0, 0.46, 0.01, Math.PI / 2, 0, 0, 1, 0.8, 1);
  }
  // Hals und Kopf
  addP(S, neck, taper(0.045, 0.04, 0.1), skin, 0, 0.1, 0);
  for (const s of [-1, 1]) addP(S, head, fgeo('ear', () => new T.SphereGeometry(0.03, 8, 6)), skin, s * 0.148, -0.01, -0.01, 0, 0, 0, 0.5, 1, 0.8);
  const faceMesh = new T.Mesh(animeHead(), faceMat); faceMesh.castShadow = true; faceMesh.add(new T.Mesh(faceMesh.geometry, R3.outline)); head.add(faceMesh);
  hairParts(S, hairPivot, L);
  const SG = PartSet();
  if (L.glasses) {
    for (const s of [-1, 1]) addP(SG, head, fgeo('lens', () => new T.TorusGeometry(0.04, 0.005, 6, 18)), '#16141a', s * 0.058, -0.005, 0.152, 0, 0, 0, 1, 0.78, 1);
    addP(SG, head, fgeo('bridge', () => new T.BoxGeometry(0.035, 0.008, 0.008)), '#16141a', 0, 0.0, 0.16);
    for (const s of [-1, 1]) addP(SG, head, fgeo('temple', () => new T.BoxGeometry(0.006, 0.008, 0.15)), '#16141a', s * 0.098, 0, 0.08, 0, s * 0.12, 0);
  }
  // Arme
  const arms = [];
  for (const s of [-1, 1]) {
    const sh = grp(chest, s * 0.19, -0.03, 0);
    addP(S, sh, fgeo('shoulder', () => new T.SphereGeometry(0.068, 12, 10)), top, 0, 0, 0);
    addP(S, sh, taper(0.06, 0.052, 0.27), top, 0, -0.02, 0);
    const el = grp(sh, 0, -0.29, 0);
    addP(S, el, fgeo('elbow', () => new T.SphereGeometry(0.052, 10, 8)), top, 0, 0, 0);
    if (L.claws) { addP(S, el, taper(0.07, 0.06, 0.24), '#d8862a', 0, 0, 0); for (let k = 0; k < 3; k++) addP(S, el, fgeo('stripe', () => new T.TorusGeometry(0.066, 0.008, 4, 14)), '#2a1406', 0, -0.06 - k * 0.06, 0, Math.PI / 2); }
    else { addP(S, el, taper(0.05, 0.043, 0.23), top, 0, 0, 0); addP(S, el, fgeo('cuff', () => new T.CylinderGeometry(0.047, 0.047, 0.03, 12)), topD, 0, -0.215, 0); }
    const hand = grp(el, 0, -0.29, 0);
    const hc = L.gauntlets ? '#16121a' : skin;
    addP(S, hand, fgeo('palm', () => new T.SphereGeometry(0.052, 10, 8)), hc, 0, 0, 0.005, 0, 0, 0, 0.85, 1.05, 0.72);
    addP(S, hand, fgeo('thumb', () => new T.CapsuleGeometry(0.016, 0.03, 3, 6)), hc, s * -0.03, 0.005, 0.03, 0.5, 0, s * 0.4);
    if (L.gauntlets) for (const k of [-1, 1]) addP(S, hand, fgeo('horn', () => new T.ConeGeometry(0.012, 0.06, 5)), '#d8d0c0', k * 0.02, 0.03, -0.03, -0.6, 0, 0);
    if (L.claws) for (let k = -1; k <= 1; k++) addP(S, hand, fgeo('claw', () => new T.ConeGeometry(0.012, 0.13, 5)), '#f6efe0', k * 0.026, -0.08, 0.02, Math.PI + 0.25, 0, 0);
    arms.push({ sh, el, hand });
  }
  // Waffen
  if (L.weapon === 'sword') { const w = grp(arms[1].hand); w.rotation.x = -Math.PI / 2; addP(S, w, fgeo('blade', () => new T.BoxGeometry(0.03, 0.74, 0.01)), '#e8f0fa', 0, 0.43, 0); addP(S, w, fgeo('guard', () => new T.BoxGeometry(0.14, 0.025, 0.04)), '#2a3a5a', 0, 0.06, 0); addP(S, w, fgeo('grip', () => new T.CylinderGeometry(0.016, 0.016, 0.12, 6)), '#3a2a1a', 0, 0, 0); }
  if (L.weapon === 'bow') addP(S, arms[0].hand, fgeo('bow', () => new T.TorusGeometry(0.36, 0.013, 6, 24, Math.PI)), '#5a3a2a', 0, 0, 0.02, 0, Math.PI / 2, Math.PI / 2);
  // Beine
  const legs = [];
  for (const s of [-1, 1]) {
    const thigh = grp(hips, s * 0.085, -0.04, 0);
    addP(S, thigh, taper(0.082, 0.066, 0.41), leg, 0, 0, 0);
    const knee = grp(thigh, 0, -0.41, 0);
    addP(S, knee, fgeo('knee', () => new T.SphereGeometry(0.064, 10, 8)), leg, 0, 0, 0);
    addP(S, knee, taper(0.062, 0.05, 0.4), leg, 0, 0, 0);
    const foot = grp(knee, 0, -0.43, 0);
    addP(S, foot, fgeo('shoe', () => new T.SphereGeometry(0.07, 12, 8)), L.shoe, 0, 0.0, 0.05, 0, 0, 0, 0.82, 0.62, 1.5);
    addP(S, foot, fgeo('sole', () => new T.BoxGeometry(0.1, 0.02, 0.22)), shade(L.shoe, -0.5), 0, -0.035, 0.05);
    legs.push({ thigh, knee, foot });
  }
  bakeSet(S, mat);
  if (SG.size) bakeSet(SG, mat, 0.0025, true);
  let eyeGlow = null;
  if (L.glow) { eyeGlow = glowSprite3(L.eye, 0.4, 0.5); eyeGlow.position.set(0, 0.01, 0.17); head.add(eyeGlow); }
  return { root, body, hips, torso, chest, neck, head, hairPivot, legs, arms, mats, yaw: 0, flashK: 0, eyeGlow, spr: { hx: 0, hv: 0, lx: 0, lv: 0 }, hitK: 0 };
}
// Frisuren: flache, gebogene Straehnen + Kappe + Glanzring
function hairParts(S, pivot, L) {
  const T = THREE, hs = L.hairStyle || 'messy', col = L.hair, hi = shade(L.hair, 0.35);
  if (hs === 'bald') return;
  addP(S, pivot, fgeo('hcap', () => new T.SphereGeometry(0.18, 20, 12, 0, TAU, 0, Math.PI * 0.55)), col, 0, 0.014, -0.014, -0.3);
  addP(S, pivot, fgeo('hring', () => new T.TorusGeometry(0.15, 0.012, 5, 20, Math.PI * 1.1)), hi, 0, 0.1, 0.02, -Math.PI / 2 + 0.25, 0, -0.05 + Math.PI * -0.05); // Glanzring
  const lock = fgeo('lock', () => { const g = new T.ConeGeometry(0.05, 0.2, 5); g.scale(1, 1, 0.45); return g; });
  const tuft = (x, y, z, rx, rz, s) => addP(S, pivot, lock, col, x, y, z, rx, 0, rz, s, s, s);
  // Pony
  const bangs = hs === 'long' || hs === 'bun' ? [[-0.1, 0.25, 1], [-0.02, 0.05, 1.1], [0.07, -0.15, 1], [0.13, -0.35, 0.9]] : [[-0.11, 0.3, 0.9], [-0.04, 0.08, 1.05], [0.04, -0.1, 1], [0.11, -0.32, 0.9]];
  for (const [x, rz, s] of bangs) tuft(x, 0.09, 0.13, Math.PI - 0.45, rz, s);
  if (hs === 'spiky') for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; addP(S, pivot, lock, col, Math.cos(a) * 0.1, 0.16, Math.sin(a) * 0.1 - 0.04, -0.35 - Math.sin(a) * 0.55, a, -Math.cos(a) * 0.75, 1.5, 1.4, 1.5); }
  if (hs === 'messy') for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; addP(S, pivot, lock, col, Math.cos(a) * 0.12, 0.12, Math.sin(a) * 0.12 - 0.05, -0.95 - Math.sin(a) * 0.55, a, -Math.cos(a) * 1.05, 1.05, 0.95, 1.05); }
  if (hs === 'short') for (let k = 0; k < 6; k++) { const a = Math.PI + k / 5 * Math.PI; addP(S, pivot, lock, col, Math.cos(a) * 0.13, 0.08, Math.sin(a) * 0.1 - 0.06, -1.3, a, -Math.cos(a) * 1.2, 0.8, 0.7, 0.8); }
  if (hs === 'long') { addP(S, pivot, fgeo('hback', () => new T.CylinderGeometry(0.17, 0.12, 0.5, 14, 1, true, Math.PI * 0.55, Math.PI * 0.9)), col, 0, -0.17, -0.02, 0.08); for (const s of [-1, 1]) addP(S, pivot, lock, col, s * 0.15, -0.08, 0.04, Math.PI, 0, s * -0.1, 1.2, 2.0, 1.2); }
  if (hs === 'bun') { addP(S, pivot, fgeo('hbun', () => new T.SphereGeometry(0.085, 12, 10)), col, 0, 0.13, -0.16); addP(S, pivot, lock, col, 0, -0.02, -0.16, 0.2, 0, 0, 1.3, 1.1, 1.3); }
}

/* ------------------------------------------------------------ Animation */
const lerpA = (a, b, k) => a + (b - a) * k;
const easeInQ = (k) => k * k, easeSnap = (k) => 1 - Math.pow(1 - clamp(k, 0, 1), 3), overshoot = (k) => { k = clamp(k, 0, 1); return 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2); };
// liefert Ausholen (-1..0), Schlag (0..1), Nachschwingen aus dem Angriffszeitplan
function strikeCurve(sT, K) {
  const w = K.win, a = K.act + 0.05, r = Math.max(0.12, K.rec);
  if (sT < w) return -easeInQ(sT / w) * 0.45;
  if (sT < w + a) return easeSnap((sT - w) / a) * 1.08;
  return Math.max(0, 1.08 - easeSnap((sT - w - a) / r) * 1.08);
}
function poseHuman(R, e, dt) {
  const A = e.anim, run = A.run || 0, ph = A.phase || 0, t = A.t || 0;
  const L = R.legs, Ar = R.arms, st = e.state, sT = e.stateT || 0, fighter = !e.npc;
  let lean = 0.2 * run, twist = -Math.sin(ph) * 0.18 * run, crouch = 0, headX = 0, side = 0, bob = 0;
  let thigh = [Math.sin(ph) * 0.85 * run, -Math.sin(ph) * 0.85 * run];
  let knee = [Math.max(0, -Math.cos(ph)) * 1.25 * run + 0.08, Math.max(0, Math.cos(ph)) * 1.25 * run + 0.08];
  const guard = fighter && run < 0.55 ? 1 - run / 0.55 : 0;
  // Kaempferhaltung: Faeuste vor dem Gesicht, leichtes Federn
  const sh = [[lerpA(-Math.sin(ph) * 0.8 * run, -0.55, guard), 0, lerpA(0.12, 0.3, guard)], [lerpA(Math.sin(ph) * 0.8 * run, -0.8, guard), 0, lerpA(-0.12, -0.28, guard)]];
  const el = [lerpA(-0.45 - run * 0.9, -2.05, guard), lerpA(-0.45 - run * 0.9, -1.95, guard)];
  if (guard > 0) { bob = Math.sin(t * 6.5) * 0.012 * guard; crouch = 0.05 * guard; thigh = [thigh[0] - 0.25 * guard, thigh[1] + 0.15 * guard]; knee = [knee[0] + 0.35 * guard, knee[1] + 0.2 * guard]; }
  if (st === 'attack' && e.atk) {
    const K = e.atk, c = strikeCurve(sT, K), p = Math.max(0, c), n = Math.max(0, -c) / 0.45;
    if (K.hammer) {
      const up = sT < K.win ? easeInQ(sT / K.win) : 0;
      for (const i of [0, 1]) { sh[i][0] = sT < K.win ? lerpA(-0.8, -3.0, up) : lerpA(-3.0, -1.0, easeSnap((sT - K.win) / 0.12)); el[i] = -0.3; sh[i][2] = i ? -0.2 : 0.2; }
      lean = sT < K.win ? -0.25 * up : 0.6 * p; crouch = 0.18 * p;
    } else if (K.kick) {
      thigh[1] = lerpA(0.3 * n, -1.6, p); knee[1] = lerpA(1.2, 0.05, p); thigh[0] = 0.15 * p; knee[0] = 0.3; lean = -0.35 * p; twist = lerpA(0.5 * n, -0.9, p);
      sh[0][0] = -0.3; sh[1][0] = 0.2; side = 0.1 * p;
    } else if (K.proj) {
      if (e.kit === 'bow') { sh[0][0] = -1.55; el[0] = -0.05; sh[1][0] = -1.5; el[1] = lerpA(-2.3, -1.2, p); twist = 0.35; }
      else { sh[1][0] = lerpA(-0.5 - n, -1.6, p); el[1] = lerpA(-1.6, -0.05, p); twist = lerpA(-0.5 * n, 0.45, p); lean = 0.1 * p; }
    } else {
      const i = e.charged ? 1 : e.combo % 2 ? 0 : 1, big = e.charged ? 1.4 : 1;
      if (e.kit === 'sword') { sh[1][0] = lerpA(-2.6, -0.8, p); sh[1][2] = lerpA(-0.8, 0.9, p); el[1] = -0.25; twist = lerpA(0.8 * (1 + n), -0.8, p) * big; lean = 0.2 * p; }
      else {
        sh[i][0] = lerpA(-0.6 + 0.6 * n, -1.62, p); el[i] = lerpA(-2.0, -0.02, p); sh[i][2] = (i ? -0.1 : 0.1);
        sh[1 - i][0] = -0.6; el[1 - i] = -2.2;
        twist = (i ? 1 : -1) * lerpA(-0.35 * n * big, 0.65 * big, p); lean = lerpA(-0.08 * n, 0.22 * big, p);
        thigh = [i ? -0.35 * p : 0.2 * p, i ? 0.2 * p : -0.35 * p]; knee = [0.3, 0.3];
      }
    }
  } else if (st === 'charge') {
    const k = easeSnap(Math.min(1, sT / 0.3));
    sh[1][0] = lerpA(-0.8, 0.6, k); el[1] = -2.2; twist = -0.75 * k; crouch = 0.14 * k; lean = 0.12; sh[0][0] = -1.0; el[0] = -1.6;
    bob = Math.sin(t * 40) * 0.006 * k;
  } else if (st === 'dodge') {
    const k = Math.sin(Math.min(1, sT / 0.3) * Math.PI);
    crouch = 0.3 * k; lean = 0.7 * k; for (const i of [0, 1]) { sh[i][0] = 0.9 * k - 0.4; el[i] = -1.3; }
    thigh = [-1.0 * k, 1.0 * k]; knee = [1.5 * k, 0.7 * k];
  } else if (st === 'hurt') {
    const k = Math.max(A.hurt || 0, 0.6); lean = -0.55 * k; headX = -0.5 * k; side = 0.15 * k; for (const i of [0, 1]) { sh[i][0] = 0.5 * k; sh[i][2] = (i ? -0.5 : 0.5) * k; el[i] = -0.5; }
  } else if (st === 'wind' && e.atk) {
    const K = e.atk, k = easeInQ(Math.min(1, sT / K.wind));
    if (K.type === 'lunge') { crouch = 0.22 * k; lean = 0.55 * k; for (const i of [0, 1]) { sh[i][0] = 0.7 * k; el[i] = -1.0; } thigh = [-0.6 * k, 0.4 * k]; knee = [1.1 * k, 0.8 * k]; }
    else if (K.type === 'beam') { sh[1][0] = -2.7 * k; el[1] = -0.7; lean = -0.25 * k; twist = -0.6 * k; }
    else { sh[1][0] = lerpA(-0.8, -2.5, k); sh[1][2] = -1.0 * k; el[1] = -1.1 * k - 0.4; twist = -0.85 * k; crouch = 0.08 * k; lean = -0.1 * k; }
  } else if (st === 'active' && e.atk) {
    const K = e.atk, k = easeSnap(Math.min(1, sT / Math.max(0.05, K.act)));
    if (K.type === 'lunge') { lean = 0.85; sh[1][0] = -1.65; el[1] = -0.05; sh[0][0] = -1.35; el[0] = -0.2; thigh = [-1.0, 0.8]; knee = [0.4, 1.0]; crouch = 0.1; }
    else if (K.type === 'beam') { sh[1][0] = lerpA(-2.7, -1.45, k); el[1] = -0.05; lean = 0.3; twist = 0.35; }
    else { sh[1][0] = -1.5; sh[1][2] = lerpA(-1.0, 1.0, k); el[1] = -0.12; twist = lerpA(-0.85, 0.95, k); lean = 0.3; }
  } else if (st === 'recover' && e.atk) {
    const k = 1 - easeSnap(sT / Math.max(0.12, e.atk.rec)); sh[1][0] = lerpA(sh[1][0], -1.35, k); el[1] = lerpA(el[1], -0.25, k); twist = 0.7 * k; lean = 0.2 * k;
  } else if (st === 'stagger') {
    lean = -0.3 + Math.sin(t * 14) * 0.1; headX = -0.35; side = Math.sin(t * 9) * 0.12; for (const i of [0, 1]) { sh[i][0] = 0.35; el[i] = -0.35; sh[i][2] = i ? -0.3 : 0.3; }
  } else if (st === 'transform') {
    crouch = 0.18; lean = 0.45; headX = 0.2; for (const i of [0, 1]) { sh[i][0] = 0.2 + Math.sin(t * 34) * 0.12; sh[i][2] = i ? -0.7 : 0.7; el[i] = -1.7; }
  }
  if (A.cast > 0.2 && fighter && st !== 'attack' && st !== 'wind' && st !== 'active') { sh[1][0] = lerpA(sh[1][0], -1.6, A.cast); el[1] = lerpA(el[1], -0.05, A.cast); twist = lerpA(twist, 0.4, A.cast); }
  if (e.npc) {
    if (e.npc.pose === 'cower') { crouch = 0.34; lean = 0.55; for (const i of [0, 1]) { sh[i][0] = -2.5; sh[i][2] = i ? -0.5 : 0.5; el[i] = -1.9; } thigh = [-1.1, -1.1]; knee = [2.0, 2.0]; }
    if (e.npc.pose === 'cheer' && A.cast > 0.1) { for (const i of [0, 1]) { sh[i][0] = -2.9; sh[i][2] = i ? -0.35 : 0.35; el[i] = -0.3; } bob = Math.abs(Math.sin(t * 9)) * 0.04; }
  }
  if (e.rootT > 0) { thigh = [0, 0]; knee = [0.15, 0.15]; lean += Math.sin(t * 20) * 0.05; }
  // Treffer-Reaktion (federt nach)
  R.hitK = Math.max(0, R.hitK - dt * 3.5);
  lean -= R.hitK * 0.5; headX -= R.hitK * 0.5;
  // Nachschwingen: Haare folgen der Bewegung verzoegert (Feder)
  const sp = R.spr, fwd = Math.hypot(e.vx, e.vy) / 150;
  const hTarget = -fwd * 0.35 - lean * 0.3;
  sp.hv += ((hTarget - sp.hx) * 90 - sp.hv * 9) * dt; sp.hx += sp.hv * dt;
  R.hairPivot.rotation.x = clamp(sp.hx, -0.5, 0.4);
  // anwenden, weich ueberblendet (Angriffe schneller, damit sie knackig bleiben)
  const fast = st === 'attack' || st === 'active' || st === 'dodge' || st === 'hurt';
  const k = 1 - Math.exp(-dt * (fast ? 40 : 18)), set = (o, prop, v) => { o[prop] = lerpA(o[prop], v, k); };
  set(R.hips.position, 'y', 0.93 - crouch + bob - Math.abs(Math.cos(ph)) * 0.035 * run + Math.sin(t * 2.3) * 0.005);
  set(R.torso.rotation, 'x', lean); set(R.torso.rotation, 'y', twist); set(R.torso.rotation, 'z', side);
  set(R.hips.rotation, 'y', -twist * 0.35);
  set(R.head.rotation, 'x', headX - lean * 0.45); set(R.head.rotation, 'y', -twist * 0.4);
  for (const i of [0, 1]) {
    set(L[i].thigh.rotation, 'x', thigh[i]); set(L[i].knee.rotation, 'x', knee[i]); set(L[i].foot.rotation, 'x', -thigh[i] * 0.25 - knee[i] * 0.2);
    set(Ar[i].sh.rotation, 'x', sh[i][0]); set(Ar[i].sh.rotation, 'z', sh[i][2] + (i ? -0.1 : 0.1)); set(Ar[i].el.rotation, 'x', el[i]);
  }
  const dead = st === 'down' ? Math.min(1, sT * 2.4) : 0;
  const fall = dead < 1 ? easeInQ(dead) : 1, bounce = st === 'down' ? Math.max(0, Math.sin(Math.min(1, (sT - 0.42) * 3) * Math.PI)) * 0.08 * (sT > 0.42 ? 1 : 0) : 0;
  R.body.rotation.x = -1.48 * fall + bounce; R.body.position.y = 0.1 * fall; R.body.position.z = -0.3 * fall;
}
