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
  const root = new T.Group(), body = grp(root), hips = grp(body, 0, 1.0, 0);
  const torso = grp(hips), chest = grp(torso, 0, 0.42, 0), neck = grp(chest, 0, 0.06, 0), head = grp(neck, 0, 0.19, 0), hairPivot = grp(head);
  head.scale.setScalar(0.9);
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
    addP(S, thigh, taper(0.082, 0.064, 0.44), leg, 0, 0, 0);
    const knee = grp(thigh, 0, -0.44, 0);
    addP(S, knee, fgeo('knee', () => new T.SphereGeometry(0.064, 10, 8)), leg, 0, 0, 0);
    addP(S, knee, taper(0.06, 0.047, 0.43), leg, 0, 0, 0);
    const foot = grp(knee, 0, -0.47, 0);
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
  if (hs === 'messy') { // fallende Straehnen: Seiten, Hinterkopf, Oberkopf nach hinten gekaemmt
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) addP(S, pivot, lock, col, s * 0.155, 0.06 - k * 0.05, 0.07 - k * 0.07, Math.PI - 0.15, s * 0.3, s * (0.25 + k * 0.1), 1.0, 1.1, 1.0);
    for (let k = 0; k < 7; k++) { const x = (k / 6 - 0.5) * 0.28; addP(S, pivot, lock, col, x, 0.02 - Math.abs(x) * 0.2, -0.16, Math.PI - 0.55, 0, -x * 1.5, 1.15, 1.25, 1.15); }
    for (let k = 0; k < 6; k++) { const x = (k / 5 - 0.5) * 0.22; addP(S, pivot, lock, col, x, 0.17, 0.02 - k % 2 * 0.05, -1.25, 0, -x * 2.2, 1.1, 1.2, 1.1); }
  }
  if (hs === 'short') for (let k = 0; k < 6; k++) { const a = Math.PI + k / 5 * Math.PI; addP(S, pivot, lock, col, Math.cos(a) * 0.13, 0.08, Math.sin(a) * 0.1 - 0.06, -1.3, a, -Math.cos(a) * 1.2, 0.8, 0.7, 0.8); }
  if (hs === 'long') { addP(S, pivot, fgeo('hback', () => new T.CylinderGeometry(0.17, 0.12, 0.5, 14, 1, true, Math.PI * 0.55, Math.PI * 0.9)), col, 0, -0.17, -0.02, 0.08); for (const s of [-1, 1]) addP(S, pivot, lock, col, s * 0.15, -0.08, 0.04, Math.PI, 0, s * -0.1, 1.2, 2.0, 1.2); }
  if (hs === 'bun') { addP(S, pivot, fgeo('hbun', () => new T.SphereGeometry(0.085, 12, 10)), col, 0, 0.13, -0.16); addP(S, pivot, lock, col, 0, -0.02, -0.16, 0.2, 0, 0, 1.3, 1.1, 1.3); }
}

/* Animation: siehe 17-anim3d.js */
const lerpA = (a, b, k) => a + (b - a) * k;
const easeInQ = (k) => k * k, easeSnap = (k) => 1 - Math.pow(1 - clamp(k, 0, 1), 3);
