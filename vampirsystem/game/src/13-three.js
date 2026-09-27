'use strict';
/* ==========================================================================
   3D-DARSTELLUNG (Anime-Stil) — Three.js / WebGL
   Die Kampflogik bleibt 2D (x, y am Boden); hier wird sie in 3D gezeigt:
   Toon-Schattierung mit Umrisslinien, prozedurale Figuren mit Anime-Gesicht,
   Posen aus dem Kampfzustand, echte Schatten, Effekte, Kamera.
   Arenen ohne 3D-Fassung fallen automatisch auf die 2D-Darstellung zurueck.
   Alle Figuren und Orte sind eigene Gestaltung.
   ========================================================================== */

const S3 = 1 / 34; // Welteinheiten (Pixel der Kampflogik) -> Meter
const R3 = { ready: false, G: null, rigs: new Map(), fx: new Map(), tele: new Map(), proj: new Map(), ghosts: [], impacts: [] };
const ARENA3D = {};
function r3Wanted() { return SAVE.settings.gfx3d !== false && !!window.THREE && !!G && !!ARENA3D[G.arena.art]; }

/* ------------------------------------------------------------ Grundlagen */
function r3Init() {
  const T = THREE;
  const c = document.createElement('canvas');
  c.id = 'gl'; c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:none;pointer-events:none';
  cv.parentNode.insertBefore(c, cv);
  const r = new T.WebGLRenderer({ canvas: c, antialias: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
  r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.08;
  R3.r = r; R3.canvas = c;
  R3.cam = new T.PerspectiveCamera(42, 1, 0.1, 120);
  const g = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 225, 225, 225, 255, 255, 255, 255, 255]);
  R3.grad = new T.DataTexture(g, 4, 1, T.RGBAFormat); R3.grad.minFilter = R3.grad.magFilter = T.NearestFilter; R3.grad.needsUpdate = true;
  R3.outline = new T.ShaderMaterial({
    uniforms: { w: { value: 0.012 }, c: { value: new T.Color('#140c14') } },
    vertexShader: 'uniform float w; void main(){ vec4 mv = modelViewMatrix * vec4(position + normal * w, 1.0); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 c; void main(){ gl_FragColor = vec4(c, 1.0); }', side: T.BackSide
  });
  R3.glowTex = (() => { const k = mkCanvas(64, 64), x = k.getContext('2d'); const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); const t = new T.CanvasTexture(k); t.colorSpace = T.SRGBColorSpace; return t; })();
  window.addEventListener('resize', r3Resize); r3Resize();
  R3.ready = true;
}
function r3Resize() { if (!R3.r) return; R3.r.setSize(window.innerWidth, window.innerHeight, false); R3.cam.aspect = window.innerWidth / window.innerHeight; R3.cam.updateProjectionMatrix(); }
function toonMat(col, o) { return new THREE.MeshToonMaterial(Object.assign({ color: new THREE.Color(col), gradientMap: R3.grad }, o || {})); }
function addOutline(mesh, w) { const o = new THREE.Mesh(mesh.geometry, R3.outline); if (w) { o.material = R3.outline.clone(); o.material.uniforms.w.value = w; } o.castShadow = false; mesh.add(o); return mesh; }
function part(geo, mat, parent, x, y, z, noOutline) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); m.castShadow = true;
  if (!noOutline) addOutline(m); parent.add(m); return m;
}
function grp(parent, x, y, z) { const g = new THREE.Group(); g.position.set(x || 0, y || 0, z || 0); parent.add(g); return g; }
function glowSprite3(col, size, opacity) {
  const m = new THREE.SpriteMaterial({ map: R3.glowTex, color: new THREE.Color(col), transparent: true, opacity: opacity === undefined ? 1 : opacity, blending: THREE.AdditiveBlending, depthWrite: false });
  const s = new THREE.Sprite(m); s.scale.set(size, size, 1); return s;
}

/* ------------------------------------------------------------ Anime-Gesicht */
function faceTexture(L) {
  const k = mkCanvas(512, 256), g = k.getContext('2d');
  g.fillStyle = L.skin; g.fillRect(0, 0, 512, 256);
  if (L.mask) { g.fillStyle = '#0c0a0e'; g.fillRect(64, 100, 128, 110); g.fillStyle = '#b0102a'; for (const [x, y, r] of [[150, 170, 5], [110, 185, 4], [165, 140, 3]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } }
  const cx = 128, ey = 140; // Gesichtsmitte liegt bei u = 0.25
  // Wangenroete
  g.fillStyle = 'rgba(255,120,120,0.18)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 44, ey + 30, 14, 7, 0, 0, TAU); g.fill(); }
  for (const s of [-1, 1]) {
    const x = cx + s * 30;
    if (L.blind) { g.strokeStyle = '#3a2a24'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 12, ey + 2); g.quadraticCurveTo(x, ey + 8, x + 12, ey + 2); g.stroke(); continue; }
    // grosse Anime-Augen: Weiss, Iris mit Verlauf, Pupille, zwei Lichtpunkte, kraeftige Oberlidlinie
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x, ey, 13, 17, 0, 0, TAU); g.fill();
    const ir = g.createLinearGradient(0, ey - 16, 0, ey + 16); ir.addColorStop(0, shade(L.eye, -0.45)); ir.addColorStop(1, shade(L.eye, 0.35));
    g.fillStyle = ir; g.beginPath(); g.ellipse(x + s * 1, ey + 2, 9.5, 14, 0, 0, TAU); g.fill();
    g.fillStyle = L.glow ? L.eye : '#140a10'; g.beginPath(); g.ellipse(x + s * 1, ey + 3, 4.5, 7, 0, 0, TAU); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x - 3, ey - 6, 3.6, 0, TAU); g.fill(); g.beginPath(); g.arc(x + 3, ey + 7, 1.8, 0, TAU); g.fill();
    g.strokeStyle = '#1a0e12'; g.lineWidth = 4.5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x - 15, ey - 8 + (L.angry ? s * 0 : 0)); g.quadraticCurveTo(x, ey - 21, x + 15, ey - 10); g.stroke();
    // Augenbraue (innen tiefer = wuetend)
    g.strokeStyle = shade(L.hair, -0.2); g.lineWidth = 4;
    g.beginPath(); g.moveTo(x - s * 13, ey - 30 + (L.angry ? 7 : -1)); g.lineTo(x + s * 13, ey - 33 + (L.angry ? -3 : 0)); g.stroke();
  }
  // Nase und Mund
  g.strokeStyle = shade(L.skin, -0.3); g.lineWidth = 2; g.beginPath(); g.moveTo(cx + 1, ey + 22); g.lineTo(cx - 2, ey + 30); g.stroke();
  g.strokeStyle = '#6a3036'; g.lineWidth = 3; g.beginPath();
  if (L.angry) { g.moveTo(cx - 9, ey + 46); g.quadraticCurveTo(cx, ey + 41, cx + 9, ey + 46); } else { g.moveTo(cx - 7, ey + 43); g.quadraticCurveTo(cx, ey + 47, cx + 7, ey + 43); }
  g.stroke();
  const t = new THREE.CanvasTexture(k); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

/* ------------------------------------------------------------ Figur aus Teilen */
const GEO = {};
function geo(key, make) { return GEO[key] || (GEO[key] = make()); }
function buildHuman(L, extra) {
  const T = THREE, Lx = extra ? Object.assign({}, L, extra) : L;
  const mats = [];
  const M = (col, o) => { const m = toonMat(col, o); mats.push(m); return m; };
  const mSkin = M(Lx.skin), mTop = M(Lx.top), mTopD = M(Lx.topD), mLeg = M(Lx.leg), mShoe = M(Lx.shoe), mHair = M(Lx.hair);
  const root = new T.Group(), body = grp(root), hips = grp(body, 0, 0.9, 0);
  const cap = (r, l) => geo('cap' + r + l, () => new T.CapsuleGeometry(r, l, 4, 10));
  const sph = (r) => geo('sph' + r, () => new T.SphereGeometry(r, 18, 14));
  // Beine
  const legs = [];
  for (const s of [-1, 1]) {
    const thigh = grp(hips, s * 0.1, -0.02, 0);
    part(cap(0.078, 0.3), mLeg, thigh, 0, -0.2, 0);
    const knee = grp(thigh, 0, -0.41, 0);
    part(cap(0.066, 0.3), mLeg, knee, 0, -0.19, 0);
    const foot = part(geo('foot', () => new T.BoxGeometry(0.11, 0.08, 0.22)), mShoe, knee, 0, -0.42, 0.04);
    legs.push({ thigh, knee, foot });
  }
  // Rumpf
  const torso = grp(hips, 0, 0, 0);
  const tm = part(cap(0.16, 0.26), mTop, torso, 0, 0.24, 0); tm.scale.set(1.12, 1, 0.74);
  part(geo('belt', () => new T.CylinderGeometry(0.165, 0.165, 0.06, 16)), M('#141018'), torso, 0, 0.04, 0).scale.set(1.08, 1, 0.76);
  const chest = grp(torso, 0, 0.44, 0);
  if (Lx.outfit === 'uniform') {
    const trim = M(Lx.trim || '#c8b070');
    for (let k = 0; k < 3; k++) part(sph(0.018), trim, chest, 0.03, -0.08 - k * 0.1, 0.125, true);
    part(geo('collar', () => new T.TorusGeometry(0.1, 0.03, 8, 16)), mTopD, chest, 0, 0.03, 0).rotation.x = Math.PI / 2;
  } else if (Lx.outfit === 'hoodie') {
    const hood = part(geo('hood', () => new T.TorusGeometry(0.12, 0.06, 8, 16)), mTopD, chest, 0, 0.03, -0.03); hood.rotation.x = Math.PI / 2 - 0.3;
    const str = M('#e0e0e8'); for (const s of [-1, 1]) part(geo('str', () => new T.CylinderGeometry(0.008, 0.008, 0.14, 5)), str, chest, s * 0.04, -0.1, 0.12, true);
  }
  // Kopf
  const neck = grp(chest, 0, 0.07, 0);
  part(cap(0.05, 0.05), mSkin, neck, 0, 0.02, 0, true);
  const head = grp(neck, 0, 0.2, 0);
  const faceMat = new T.MeshToonMaterial({ map: faceTexture(Lx), gradientMap: R3.grad }); mats.push(faceMat);
  const hm = part(sph(0.165), faceMat, head, 0, 0, 0); hm.scale.set(0.95, 1.05, 1);
  buildHair(head, Lx, mHair);
  if (Lx.glasses) {
    const gm = M('#18161c');
    for (const s of [-1, 1]) { const r = part(geo('lens', () => new T.TorusGeometry(0.04, 0.008, 6, 16)), gm, head, s * 0.06, 0.005, 0.158, true); r.scale.y = 0.8; }
    part(geo('bridge', () => new T.BoxGeometry(0.04, 0.008, 0.008)), gm, head, 0, 0.01, 0.165, true);
  }
  // Arme
  const arms = [];
  for (const s of [-1, 1]) {
    const sh = grp(chest, s * 0.215, -0.02, 0);
    part(cap(0.055, 0.2), mTop, sh, 0, -0.14, 0);
    const el = grp(sh, 0, -0.29, 0);
    const fore = part(cap(0.05, 0.18), Lx.claws ? M('#d8862a') : mTop, el, 0, -0.13, 0);
    const hand = part(sph(Lx.gauntlets ? 0.07 : 0.058), Lx.gauntlets ? M('#16121a') : mSkin, el, 0, -0.29, 0);
    if (Lx.claws) { fore.scale.set(1.35, 1.1, 1.35); const cm = M('#f4ecdc'); for (let k = -1; k <= 1; k++) { const c = part(geo('claw', () => new T.ConeGeometry(0.014, 0.12, 6)), cm, hand, k * 0.03, -0.07, 0.03, true); c.rotation.x = Math.PI + 0.3; } }
    arms.push({ sh, el, hand });
  }
  // Waffen
  if (Lx.weapon === 'sword') {
    const w = grp(arms[1].hand, 0, 0, 0); w.rotation.x = -Math.PI / 2;
    part(geo('blade', () => new T.BoxGeometry(0.03, 0.72, 0.012)), M('#dfe8f4', { emissive: new T.Color('#223044') }), w, 0, 0.42, 0);
    part(geo('guard', () => new T.BoxGeometry(0.14, 0.025, 0.04)), M('#2a3a5a'), w, 0, 0.06, 0);
  }
  if (Lx.weapon === 'bow') {
    const b = part(geo('bow', () => new T.TorusGeometry(0.34, 0.014, 6, 24, Math.PI)), M('#5a3a2a'), arms[0].hand, 0, 0, 0.02); b.rotation.set(0, Math.PI / 2, Math.PI / 2);
  }
  // Leuchtende Augen / Haende
  let eyeGlow = null;
  if (Lx.glow) { eyeGlow = glowSprite3(Lx.eye, 0.35, 0.5); eyeGlow.position.set(0, 0.0, 0.16); head.add(eyeGlow); }
  root.traverse((o) => { if (o.isMesh && o.material !== R3.outline) o.castShadow = true; });
  return { root, body, hips, torso, chest, neck, head, legs, arms, mats, yaw: 0, flashK: 0, eyeGlow };
}
// Teile zu einem Netz verschmelzen (spart am Handy viele Zeichenaufrufe)
function mergeGroup(g) {
  g.updateMatrixWorld(true);
  const pos = [], nor = [];
  g.traverse((o) => {
    if (!o.isMesh) return;
    let q = o.geometry.clone(); if (q.index) q = q.toNonIndexed(); q.applyMatrix4(o.matrixWorld);
    pos.push(q.attributes.position.array); nor.push(q.attributes.normal.array);
  });
  const cat = (arrs) => { const n = arrs.reduce((a, x) => a + x.length, 0), out = new Float32Array(n); let o = 0; for (const x of arrs) { out.set(x, o); o += x.length; } return out; };
  const m = new THREE.BufferGeometry();
  m.setAttribute('position', new THREE.BufferAttribute(cat(pos), 3)); m.setAttribute('normal', new THREE.BufferAttribute(cat(nor), 3));
  return m;
}
const HAIR_GEO = {};
function buildHair(head, L, mHair) {
  const T = THREE, hs = L.hairStyle || 'messy';
  if (hs === 'bald') return;
  if (!HAIR_GEO[hs]) {
    const hg = new T.Group();
    const add = (geom, x, y, z, rx, ry, rz, sx, sy, sz) => { const m = new T.Mesh(geom); m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, rz || 0); if (sx) m.scale.set(sx, sy, sz); hg.add(m); return m; };
    add(new T.SphereGeometry(0.178, 18, 12, 0, TAU, 0, Math.PI * 0.56), 0, 0.012, -0.012, -0.28);
    const spike = (r, h, x, y, z, rx, rz) => add(new T.ConeGeometry(r, h, 6), x, y, z, rx, 0, rz);
    const bangs = hs === 'long' || hs === 'bun' ? [[-0.09, 0.2], [0, 0.1], [0.09, -0.2]] : [[-0.1, 0.25], [-0.03, 0.05], [0.05, -0.1], [0.11, -0.3]];
    for (const [x, rz] of bangs) spike(0.045, 0.16, x, 0.11, 0.12, Math.PI - 0.6, rz);
    if (hs === 'spiky') for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; spike(0.06, 0.26, Math.cos(a) * 0.1, 0.15, Math.sin(a) * 0.1 - 0.03, -0.5 - Math.sin(a) * 0.5, -Math.cos(a) * 0.8); }
    if (hs === 'messy') for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; spike(0.05, 0.15, Math.cos(a) * 0.12, 0.12, Math.sin(a) * 0.12 - 0.04, -0.9 - Math.sin(a) * 0.6, -Math.cos(a) * 1.1); }
    if (hs === 'short') for (let k = 0; k < 5; k++) { const a = Math.PI + k / 4 * Math.PI; spike(0.05, 0.1, Math.cos(a) * 0.13, 0.1, Math.sin(a) * 0.1 - 0.05, -1.2, -Math.cos(a) * 1.2); }
    if (hs === 'long') { add(new T.BoxGeometry(0.32, 0.5, 0.08), 0, -0.18, -0.13, 0.12); for (const s of [-1, 1]) add(new T.BoxGeometry(0.06, 0.34, 0.1), s * 0.16, -0.1, 0.02); }
    if (hs === 'bun') add(new T.SphereGeometry(0.085, 12, 10), 0, 0.12, -0.16);
    HAIR_GEO[hs] = mergeGroup(hg);
  }
  part(HAIR_GEO[hs], mHair, head, 0, 0, 0);
}

/* ------------------------------------------------------------ Posen aus dem Kampfzustand */
const lerpA = (a, b, k) => a + (b - a) * k;
function poseHuman(R, e, dt) {
  const A = e.anim, run = A.run || 0, ph = A.phase || 0, t = A.t || 0;
  const L = R.legs, Ar = R.arms;
  const fighter = !e.npc;
  const st = e.state, sT = e.stateT || 0;
  let lean = 0.14 * run, twist = 0, crouch = 0, headX = 0;
  let thigh = [Math.sin(ph) * 0.8 * run, -Math.sin(ph) * 0.8 * run];
  let knee = [Math.max(0, -Math.cos(ph)) * 1.1 * run + 0.05, Math.max(0, Math.cos(ph)) * 1.1 * run + 0.05];
  // Grundhaltung Arme: Kaempfer mit Deckung, sonst locker
  const guard = fighter && run < 0.5 ? 1 - run * 2 : 0;
  let sh = [[-Math.sin(ph) * 0.7 * run + lerpA(0.05, -0.55, guard), 0, lerpA(0.12, 0.25, guard)], [Math.sin(ph) * 0.7 * run + lerpA(0.05, -0.75, guard), 0, lerpA(-0.12, -0.25, guard)]];
  let el = [lerpA(-0.35 - run * 0.5, -1.9, guard), lerpA(-0.35 - run * 0.5, -1.8, guard)];
  const breathe = Math.sin(t * 2.4) * 0.012;
  // Angriffe der Spielfiguren
  if (st === 'attack' && e.atk) {
    const K = e.atk, w = K.win, k = sT < w ? sT / w : 1;
    const ext = sT < w ? -0.35 * k : sT < w + K.act + 0.06 ? 1 : Math.max(0, 1 - (sT - w - K.act - 0.06) / Math.max(0.1, K.rec));
    if (K.hammer) { // Ueberkopf-Schlag mit beiden Faeusten
      const up = sT < w ? k : 0, down = sT >= w ? ext : 0;
      for (const i of [0, 1]) { sh[i][0] = lerpA(-2.9 * up, -1.2, down); el[i] = lerpA(-0.4, -0.1, down); sh[i][2] = i ? -0.25 : 0.25; }
      lean = -0.2 * up + 0.5 * down; crouch = 0.12 * down;
    } else if (K.kick) { // Drehtritt
      thigh[1] = lerpA(0.2, -1.5, Math.max(0, ext)); knee[1] = lerpA(0.8, 0.1, Math.max(0, ext)); lean = -0.3 * Math.max(0, ext); twist = -0.6 * ext;
    } else if (K.proj) { // Schuss / Wurf
      sh[1][0] = lerpA(-0.6, -1.55, Math.max(0, ext)); el[1] = lerpA(-1.4, -0.05, Math.max(0, ext)); twist = 0.3 * ext;
      if (e.kit === 'bow') { sh[0][0] = -1.5; el[0] = -0.05; sh[1][0] = -1.5; el[1] = lerpA(-2.2, -1.4, Math.max(0, ext)); }
    } else { // Faust / Klinge: abwechselnd rechts und links, aufgeladen mit Koerpereinsatz
      const i = e.charged ? 1 : e.combo % 2 ? 0 : 1, big = e.charged ? 1 : 0;
      sh[i][0] = lerpA(-0.6, -1.6, Math.max(0, ext)) + (ext < 0 ? 0.6 * -ext : 0); el[i] = lerpA(-1.9, -0.05, Math.max(0, ext));
      twist = (i ? 0.55 : -0.55) * ext * (1 + big * 0.5); lean = 0.18 * ext + big * 0.15 * ext;
      if (e.kit === 'sword') { sh[1][0] = lerpA(-2.4, -0.9, Math.max(0, ext)); el[1] = -0.2; twist = lerpA(0.7, -0.7, Math.max(0, ext)); }
    }
  } else if (st === 'charge') {
    const k = Math.min(1, sT / 0.3);
    sh[1][0] = lerpA(-0.75, 0.5, k); el[1] = -2.1; twist = -0.6 * k; crouch = 0.1 * k; lean = 0.1;
  } else if (st === 'dodge') {
    const k = Math.sin(Math.min(1, sT / 0.3) * Math.PI);
    crouch = 0.28 * k; lean = 0.6 * k; for (const i of [0, 1]) { sh[i][0] = 0.8 * k - 0.4; el[i] = -1.2; }
    thigh = [-0.9 * k, 0.9 * k]; knee = [1.4 * k, 0.6 * k];
  } else if (st === 'hurt' || A.hurt > 0.5) {
    const k = A.hurt || 0.8; lean = -0.45 * k; headX = -0.4 * k; for (const i of [0, 1]) { sh[i][0] = 0.4 * k; el[i] = -0.6; }
  } else if (st === 'wind' && e.atk) { // Gegner holt aus
    const K = e.atk, k = Math.min(1, sT / K.wind);
    if (K.type === 'lunge') { crouch = 0.18 * k; lean = 0.5 * k; sh[1][0] = 0.6 * k; sh[0][0] = 0.6 * k; }
    else if (K.type === 'beam') { sh[1][0] = -2.6 * k; el[1] = -0.8; lean = -0.2 * k; twist = -0.5 * k; }
    else { sh[1][0] = lerpA(-0.75, -2.4, k); sh[1][2] = -0.9 * k; el[1] = -1.2 * k - 0.4; twist = -0.7 * k; crouch = 0.06 * k; }
  } else if (st === 'active' && e.atk) {
    const K = e.atk, k = Math.min(1, sT / Math.max(0.05, K.act));
    if (K.type === 'lunge') { lean = 0.75; sh[1][0] = -1.6; el[1] = -0.1; sh[0][0] = -1.3; el[0] = -0.2; thigh = [-0.9, 0.7]; knee = [0.4, 0.9]; }
    else if (K.type === 'beam') { sh[1][0] = lerpA(-2.6, -1.4, k); el[1] = -0.05; lean = 0.25; twist = 0.3; }
    else { sh[1][0] = -1.45; sh[1][2] = lerpA(-0.9, 0.9, k); el[1] = -0.15; twist = lerpA(-0.7, 0.8, k); lean = 0.25; }
  } else if (st === 'recover' && e.atk) {
    const k = Math.max(0, 1 - sT / Math.max(0.1, e.atk.rec)); sh[1][0] = lerpA(sh[1][0], -1.3, k); el[1] = lerpA(el[1], -0.2, k); twist = 0.6 * k;
  } else if (st === 'stagger') {
    lean = -0.25 + Math.sin(t * 14) * 0.08; headX = -0.3; for (const i of [0, 1]) { sh[i][0] = 0.3; el[i] = -0.3; }
  } else if (st === 'transform') {
    crouch = 0.15; lean = 0.4; for (const i of [0, 1]) { sh[i][0] = 0.2 + Math.sin(t * 30) * 0.1; sh[i][2] = i ? -0.6 : 0.6; el[i] = -1.6; }
  }
  if (A.cast > 0.2 && st !== 'attack' && st !== 'wind' && st !== 'active' && fighter) { sh[1][0] = lerpA(sh[1][0], -1.55, A.cast); el[1] = lerpA(el[1], -0.05, A.cast); }
  if (e.npc) {
    if (e.npc.pose === 'cower') { crouch = 0.3; lean = 0.5; for (const i of [0, 1]) { sh[i][0] = -2.4; sh[i][2] = i ? -0.5 : 0.5; el[i] = -1.8; } thigh = [-1.0, -1.0]; knee = [1.8, 1.8]; }
    if (e.npc.pose === 'cheer' && A.cast > 0.1) { for (const i of [0, 1]) { sh[i][0] = -2.8; sh[i][2] = i ? -0.3 : 0.3; el[i] = -0.3; } }
  }
  if (e.rootT > 0) { crouch = Math.max(crouch, 0.05); thigh = [0, 0]; knee = [0.1, 0.1]; }
  // anwenden (weich ueberblenden, damit nichts ruckelt)
  const k = 1 - Math.exp(-dt * 22), set = (o, prop, v) => { o[prop] = lerpA(o[prop], v, k); };
  set(R.hips.position, 'y', 0.9 - crouch + breathe - Math.abs(Math.cos(ph)) * 0.03 * run);
  set(R.torso.rotation, 'x', lean); set(R.torso.rotation, 'y', twist);
  set(R.head.rotation, 'x', headX - lean * 0.4);
  for (const i of [0, 1]) {
    set(L[i].thigh.rotation, 'x', thigh[i]); set(L[i].knee.rotation, 'x', knee[i]); set(L[i].foot.rotation, 'x', -thigh[i] * 0.3);
    set(Ar[i].sh.rotation, 'x', sh[i][0]); set(Ar[i].sh.rotation, 'z', sh[i][2] + (i ? -0.08 : 0.08)); set(Ar[i].el.rotation, 'x', el[i]);
  }
  // umfallen
  const dead = st === 'down' ? Math.min(1, sT * 2.2) : 0;
  R.body.rotation.x = -1.45 * easeOut(dead); R.body.position.y = 0.1 * dead; R.body.position.z = -0.25 * dead;
}

/* ------------------------------------------------------------ Kantine in 3D */
ARENA3D.kantine = function (A, scene) {
  const T = THREE, W = A.w * S3, H = A.h * S3;
  // Fliesenboden
  const k = mkCanvas(512, 512), g = k.getContext('2d'), rnd = mulberry(11);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = shade((x + y) % 2 ? '#b4b8c2' : '#9a9ea8', rnd() * 0.05 - 0.025); g.fillRect(x * 64, y * 64, 64, 64); g.strokeStyle = 'rgba(40,40,60,0.25)'; g.lineWidth = 2; g.strokeRect(x * 64 + 1, y * 64 + 1, 62, 62); }
  const tex = new T.CanvasTexture(k); tex.colorSpace = T.SRGBColorSpace; tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.repeat.set(W / 3.5, H / 3.5); tex.anisotropy = 8;
  const floor = new T.Mesh(new T.PlaneGeometry(W + 6, H + 6), new T.MeshLambertMaterial({ map: tex }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(W / 2, 0, H / 2); floor.receiveShadow = true; scene.add(floor);
  // Rueckwand mit Fenstern (leuchten) und Lichtbahnen
  const wall = new T.Mesh(new T.BoxGeometry(W + 6, 3.4, 0.3), toonMat('#4a5266')); wall.position.set(W / 2, 1.7, -0.15); wall.receiveShadow = true; scene.add(wall);
  const base = new T.Mesh(new T.BoxGeometry(W + 6, 0.5, 0.34), toonMat('#2a303c')); base.position.set(W / 2, 0.25, -0.1); scene.add(base);
  for (let x = 1.2; x < W - 0.6; x += 2.4) {
    const win = new T.Mesh(new T.PlaneGeometry(1.5, 1.4), new T.MeshBasicMaterial({ color: new T.Color('#cfe8ff') })); win.position.set(x, 1.9, 0.01); scene.add(win);
    const fr = new T.Mesh(new T.BoxGeometry(0.06, 1.4, 0.05), toonMat('#2a303c')); fr.position.set(x, 1.9, 0.03); scene.add(fr);
    const shaft = new T.Mesh(new T.PlaneGeometry(1.5, 5), new T.MeshBasicMaterial({ color: new T.Color('#fff4d8'), transparent: true, opacity: 0.08, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
    shaft.position.set(x + 0.2, 1.1, 2.2); shaft.rotation.x = -1.05; scene.add(shaft);
  }
  // Seitenwaende (niedrig, damit die Kamera frei bleibt)
  for (const x of [-0.15, W + 0.15]) { const s = new T.Mesh(new T.BoxGeometry(0.3, 1.0, H + 0.3), toonMat('#3a4050')); s.position.set(x, 0.5, H / 2); s.receiveShadow = true; scene.add(s); }
  // Tische mit Baenken und Tabletts (aus den Hindernissen der Kampflogik)
  const wood = toonMat('#8a5a36'), woodD = toonMat('#5a3a22'), tray = toonMat('#6a8aa8'), food = toonMat('#e8c070');
  for (const b of A.blocks || []) {
    const x = (b.x + b.w / 2) * S3, z = (b.y + b.h / 2) * S3, w = b.w * S3, d = b.h * S3 + 0.3;
    const top = part(new T.BoxGeometry(w, 0.08, d), wood, scene, x, 0.76, z); top.receiveShadow = true;
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) part(geo('tleg', () => new T.BoxGeometry(0.07, 0.72, 0.07)), woodD, scene, x + sx * (w / 2 - 0.1), 0.36, z + sz * (d / 2 - 0.08), true);
    for (const s of [-1, 1]) { const bench = part(new T.BoxGeometry(w, 0.06, 0.28), woodD, scene, x, 0.45, z + s * (d / 2 + 0.3)); bench.receiveShadow = true; }
    for (let i = 0; i < 3; i++) { const tx = x - w / 2 + 0.3 + i * (w - 0.6) / 2; part(geo('tray', () => new T.BoxGeometry(0.34, 0.03, 0.24)), tray, scene, tx, 0.815, z - 0.05, true); part(geo('food', () => new T.SphereGeometry(0.06, 8, 6)), food, scene, tx + 0.06, 0.84, z - 0.05, true); }
  }
  scene.background = new T.Color('#1a1e2a');
  scene.fog = new T.Fog('#1a1e2a', 22, 45);
  const hemi = new T.HemisphereLight('#dfe8ff', '#6a5a52', 1.25); scene.add(hemi);
  const sun = new T.DirectionalLight('#fff0dc', 2.2); sun.position.set(W / 2 - 2, 12, -3); sun.target.position.set(W / 2, 0, H / 2);
  sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); const sc = sun.shadow.camera; sc.left = -W; sc.right = W; sc.top = H * 0.8; sc.bottom = -H * 0.8; sc.near = 1; sc.far = 40; sun.shadow.bias = -0.0015; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
};

/* ------------------------------------------------------------ Szene fuer einen Kampf aufbauen */
function r3Build() {
  const T = THREE;
  for (const R of R3.rigs.values()) R.root.removeFromParent();
  R3.rigs.clear(); R3.fx.clear(); R3.tele.clear(); R3.proj.clear(); R3.ghosts.length = 0; R3.impacts.length = 0;
  const scene = new T.Scene();
  ARENA3D[G.arena.art](G.arena, scene);
  // Partikel: Funken (leuchtend) und Staub
  const mkPts = (n, add, size) => {
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(new Float32Array(n * 3), 3)); geo.setAttribute('color', new T.BufferAttribute(new Float32Array(n * 3), 3));
    const m = new T.PointsMaterial({ size, map: R3.glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: add ? T.AdditiveBlending : T.NormalBlending, opacity: add ? 1 : 0.55 });
    const p = new T.Points(geo, m); p.frustumCulled = false; scene.add(p); return p;
  };
  R3.sparks = mkPts(600, true, 0.16); R3.dust = mkPts(300, false, 0.5);
  R3.scene = scene; R3.G = G;
  R3.playerLight = new T.PointLight('#9ab0ff', 0, 7); scene.add(R3.playerLight);
}

/* ------------------------------------------------------------ Rendern */
const _v3 = { a: null };
function r3Pos(x, y, h) { return new THREE.Vector3(x * S3, h || 0, y * S3); }
function render3d(rdt) {
  if (!R3.ready) r3Init();
  if (R3.G !== G) r3Build();
  const T = THREE, scene = R3.scene, dt = rdt * (G.scale || 1);
  R3.canvas.style.display = 'block';
  // Figuren
  const seen = new Set();
  for (const e of G.ents) {
    if (e.draw) continue; // Bestien/Objekte kommen in 3D spaeter
    seen.add(e.id);
    let R = R3.rigs.get(e.id);
    const key = e.look;
    if (!R || R.look !== key || R.extra !== e.extra) {
      if (R) R.root.removeFromParent();
      R = buildHuman(e.look, e.extra); R.look = key; R.extra = e.extra; R.yaw = e.face > 0 ? Math.PI / 2 : -Math.PI / 2;
      if (e.npc) R.root.traverse((o) => { o.castShadow = false; });
      R3.rigs.set(e.id, R); scene.add(R.root);
    }
    // Blickrichtung: beim Angriff zum Ziel, sonst in Laufrichtung, sonst seitlich
    let a = null;
    if ((e.state === 'attack' || e.state === 'charge') && e.aim !== undefined) a = e.aim;
    else if ((e.state === 'wind' || e.state === 'active' || e.state === 'recover') && e.aim !== undefined) a = e.aim;
    else if (e.state === 'dodge' && e.dodgeA !== undefined) a = e.dodgeA;
    else if (Math.hypot(e.vx, e.vy) > 25) a = Math.atan2(e.vy, e.vx);
    else if (e.team === 1 && e.target) a = Math.atan2(e.target.y - e.y, e.target.x - e.x);
    else if (e.team === 0) { const f = nearestFoe(e, 300); if (f) a = Math.atan2(f.y - e.y, f.x - e.x); }
    else if (e.npc) a = e.face > 0 ? 0.6 : Math.PI - 0.6;
    if (a !== null) { const want = Math.atan2(Math.cos(a), Math.sin(a)); R.yaw += angDiff(R.yaw, want) * (1 - Math.exp(-rdt * (e.state === 'attack' ? 30 : 12))); }
    R.root.rotation.y = R.yaw;
    R.root.position.set(e.x * S3, 0, e.y * S3);
    poseHuman(R, e, rdt);
    // Treffer-Aufblitzen und kurzes Stauchen
    if (e.flash > R.flashK + 0.02) { r3Impact(e); }
    R.flashK = e.flash;
    const f = Math.min(1, e.flash * 9);
    for (const m of R.mats) m.emissive && m.emissive.setRGB(f, f * 0.95, f * 0.9);
    const sq = 1 + f * 0.08; R.body.scale.set(sq, 1 / sq, sq);
    if (R.eyeGlow) R.eyeGlow.material.opacity = 0.35 + Math.sin(G.t * 8) * 0.15;
    // Ausweich-Nachbilder
    if (e.team === 0 && e.state === 'dodge' && (R.ghostT = (R.ghostT || 0) - rdt) <= 0) { R.ghostT = 0.045; r3Ghost(R, e.counterT > 0 ? '#ffd070' : '#8ad8ff'); }
    // Konterfenster / Aufladen: Glanz
    if (!R.aura) { R.aura = glowSprite3('#ffd070', 1.6, 0); R.aura.position.y = 1.0; R.root.add(R.aura); }
    const auraA = e.team === 0 && e.counterT > 0 ? 0.5 + Math.sin(G.t * 20) * 0.2 : e.team === 0 && e.state === 'charge' ? Math.min(1, e.stateT / 0.3) * 0.6 : e.state === 'transform' ? 0.6 : 0;
    R.aura.material.opacity = auraA; R.aura.material.color.set(e.state === 'charge' && e.stateT < 0.3 ? '#8ad8ff' : e.state === 'transform' ? '#ff8a2a' : '#ffd070');
    R.root.visible = !(e.team === 0 && e.iframes > 0 && e.state !== 'dodge' && e.state !== 'down' && Math.sin(G.t * 40) < -0.3);
  }
  for (const [id, R] of R3.rigs) if (!seen.has(id)) { R.root.removeFromParent(); R3.rigs.delete(id); }
  r3Ghosts(rdt);
  r3Tele();
  r3Fx(rdt);
  r3Proj();
  r3Impacts(rdt);
  // Licht um den Spieler (nachts)
  const p = G.player;
  R3.playerLight.position.set(p.x * S3, 2.2, p.y * S3); R3.playerLight.intensity = G.arena.night ? 6 : 0;
  // Kamera: schraeg von oben, Breite passend zum Hochformat
  const cam = R3.cam, asp = cam.aspect, vf = cam.fov * Math.PI / 180;
  const want = (window.R3DIST || 4.8), dist = clamp(want / (2 * Math.tan(vf / 2) * asp), 6, 14) * (1 - (G.punch || 0) * 0.06 * (SAVE.settings.shake || 0));
  const tx = G.cam.x * S3, tz = G.cam.y * S3 + 0.6, pitch = window.R3PITCH || 0.88;
  const sh = G.shake * (SAVE.settings.shake || 1) * 0.012;
  cam.position.set(tx + rand(-sh, sh), Math.sin(pitch) * dist + rand(-sh, sh), tz + Math.cos(pitch) * dist);
  cam.lookAt(tx, 0.7, tz);
  if (window.R3CAM) window.R3CAM(cam);
  R3.r.render(scene, cam);
  renderOverlay3d();
}

function r3Impact(e) {
  const s = glowSprite3('#ffffff', 0.2, 1); s.position.set(e.x * S3, 1.05, e.y * S3); R3.scene.add(s);
  const ring = new THREE.Mesh(geo('iring', () => new THREE.RingGeometry(0.3, 0.42, 28)), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(e.x * S3, 0.04, e.y * S3); R3.scene.add(ring);
  R3.impacts.push({ s, ring, t: 0 });
}
function r3Impacts(dt) {
  for (let i = R3.impacts.length - 1; i >= 0; i--) {
    const I = R3.impacts[i]; I.t += dt; const k = I.t / 0.22;
    I.s.scale.setScalar(0.2 + k * 1.6); I.s.material.opacity = Math.max(0, 1 - k);
    I.ring.scale.setScalar(0.5 + k * 2.2); I.ring.material.opacity = Math.max(0, 0.8 * (1 - k));
    if (k >= 1) { I.s.removeFromParent(); I.ring.removeFromParent(); I.s.material.dispose(); I.ring.material.dispose(); R3.impacts.splice(i, 1); }
  }
}
function r3Ghost(R, col) {
  const m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false });
  const c = R.root.clone(true);
  c.traverse((o) => { if (o.isMesh) { o.material = m; o.castShadow = false; } if (o.isSprite) o.visible = false; });
  R3.scene.add(c); R3.ghosts.push({ c, m, t: 0 });
}
function r3Ghosts(dt) {
  for (let i = R3.ghosts.length - 1; i >= 0; i--) { const G0 = R3.ghosts[i]; G0.t += dt; G0.m.opacity = 0.45 * (1 - G0.t / 0.28); if (G0.t >= 0.28) { G0.c.removeFromParent(); G0.m.dispose(); R3.ghosts.splice(i, 1); } }
}
// Angriffsmarkierungen am Boden
function r3Tele() {
  const T = THREE, seen = new Set();
  for (const Te of G.tele) {
    seen.add(Te);
    let o = R3.tele.get(Te);
    if (!o) {
      const g = new T.Group(), base = new T.MeshBasicMaterial({ color: '#ff3a2a', transparent: true, opacity: 0.22, depthWrite: false }), fill = new T.MeshBasicMaterial({ color: '#ff6a3a', transparent: true, opacity: 0.45, depthWrite: false, blending: T.AdditiveBlending });
      let gb, gf;
      if (Te.type === 'lunge' || Te.type === 'beam') { gb = new T.PlaneGeometry(1, 1); gb.translate(0.5, 0, 0); gf = gb; }
      else { gb = new T.CircleGeometry(1, 28, -Te.arc, Te.arc * 2); gf = gb; }
      const mb = new T.Mesh(gb, base), mf = new T.Mesh(gf, fill); mb.rotation.x = mf.rotation.x = -Math.PI / 2; mf.position.y = 0.005;
      g.add(mb, mf); R3.scene.add(g); o = { g, mb, mf, base, fill }; R3.tele.set(Te, o);
    }
    const k = clamp(Te.t / Te.dur, 0, 1), done = Te.t >= Te.dur;
    o.g.position.set(Te.x * S3, 0.03, Te.y * S3); o.g.rotation.y = -Te.a;
    const r = Te.r * S3;
    if (Te.type === 'lunge' || Te.type === 'beam') { const w = (Te.type === 'beam' ? Te.w : 18) * S3; o.mb.scale.set(r, w, 1); o.mf.scale.set(r * k, w, 1); }
    else { o.mb.scale.set(r, r, 1); o.mf.scale.set(r * k, r * k, 1); }
    o.base.opacity = done ? 0.5 : 0.18 + k * 0.2; o.base.color.set(done ? '#ffffff' : '#ff3a2a');
  }
  for (const [Te, o] of R3.tele) if (!seen.has(Te)) { o.g.removeFromParent(); o.base.dispose(); o.fill.dispose(); o.mb.geometry.dispose(); R3.tele.delete(Te); }
}
// Effekte: Schlagboegen, Strahlen, Funken, Staub
function r3Fx(dt) {
  const T = THREE, seen = new Set(), col = new T.Color();
  let ns = 0, nd = 0;
  const sp = R3.sparks.geometry.attributes, du = R3.dust.geometry.attributes;
  for (const f of G.fx) {
    const k = f.t / f.life;
    if (f.k === 'spark') {
      if (ns >= 600) continue;
      sp.position.setXYZ(ns, f.x * S3, 0.9 + (-(f.y - (f._y0 === undefined ? (f._y0 = f.y) : f._y0))) * S3 * 0.9, (f._y0 + 30) * S3);
      col.set(f.col || '#ffffff').multiplyScalar(1 - k); sp.color.setXYZ(ns, col.r, col.g, col.b); ns++;
    } else if (f.k === 'dust') {
      if (nd >= 300) continue;
      du.position.setXYZ(nd, f.x * S3, 0.08 + k * 0.2, f.y * S3); const v = (G.arena.night ? 0.5 : 0.9) * (1 - k); du.color.setXYZ(nd, v, v * 0.97, v * 0.92); nd++;
    } else if (f.k === 'swoosh' || f.k === 'slash' || f.k === 'beam') {
      seen.add(f);
      let o = R3.fx.get(f);
      if (!o) {
        const m = new T.MeshBasicMaterial({ color: new T.Color(f.col || '#ffffff'), transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });
        let g;
        if (f.k === 'beam') { g = new T.BoxGeometry(1, 0.12, 1); g.translate(0.5, 0, 0); }
        else { const R = Math.max(0.3, f.r * S3); g = new T.RingGeometry(R * 0.55, R * 1.05, 28, 1, -f.arc, f.arc * 2); }
        const mesh = new T.Mesh(g, m); const holder = new T.Group(); holder.add(mesh); R3.scene.add(holder);
        if (f.k === 'beam') { holder.position.set(f.x * S3, 1.0, (f.y + 24) * S3); holder.rotation.y = -f.a; mesh.scale.set(f.len * S3, 1, f.w * S3); }
        else { mesh.rotation.x = -Math.PI / 2; holder.position.set(f.x * S3, f.k === 'swoosh' ? 0.95 : 0.9, (f.y + (f.k === 'swoosh' ? 26 : 30)) * S3); holder.rotation.y = -f.a; }
        o = { holder, mesh, m }; R3.fx.set(f, o);
      }
      o.m.opacity = (1 - k) * (f.k === 'beam' ? 0.9 : 0.85);
      if (f.k === 'swoosh') { const e0 = easeOut(Math.min(1, k * 1.6)); o.mesh.rotation.z = (f.dir || 1) * (e0 - 0.5) * f.arc; o.mesh.scale.setScalar(0.9 + e0 * 0.25); }
      else if (f.k === 'slash') o.mesh.scale.setScalar(0.9 + k * 0.2);
      else o.mesh.scale.y = 1 - k;
    }
  }
  for (const [f, o] of R3.fx) if (!seen.has(f)) { o.holder.removeFromParent(); o.m.dispose(); o.mesh.geometry.dispose(); R3.fx.delete(f); }
  for (let i = ns; i < 600; i++) sp.position.setXYZ(i, 0, -50, 0);
  for (let i = nd; i < 300; i++) du.position.setXYZ(i, 0, -50, 0);
  sp.position.needsUpdate = sp.color.needsUpdate = du.position.needsUpdate = du.color.needsUpdate = true;
}
// Geschosse: Blutsichel, Pfeil, Wasser, Feuer, Spiess
function r3Proj() {
  const T = THREE, seen = new Set();
  for (const P of G.proj) {
    seen.add(P);
    let o = R3.proj.get(P);
    if (!o) {
      const holder = new T.Group(); let body;
      if (P.kind === 'blood') { body = new T.Mesh(geo('pblood', () => new T.TorusGeometry(0.34, 0.07, 6, 18, Math.PI * 0.9)), new T.MeshBasicMaterial({ color: '#ff1a3a' })); body.rotation.set(-Math.PI / 2, 0, -Math.PI * 0.45); holder.add(glowSprite3('#ff2a40', 1.3, 0.8)); }
      else if (P.kind === 'arrow' || P.kind === 'spike') { body = new T.Mesh(geo('parrow', () => { const g = new T.ConeGeometry(0.04, 0.6, 6); g.rotateZ(-Math.PI / 2); return g; }), new T.MeshBasicMaterial({ color: P.col || '#e8e0d0' })); holder.add(glowSprite3(P.col || '#c8a0ff', 0.6, 0.6)); }
      else { body = glowSprite3(P.kind === 'fire' ? '#ff8a3a' : '#6ec8ff', 0.8, 1); holder.add(glowSprite3('#ffffff', 0.3, 0.9)); }
      holder.add(body); R3.scene.add(holder); o = { holder }; R3.proj.set(P, o);
    }
    o.holder.position.set(P.x * S3, 0.95, (P.y + 22) * S3); o.holder.rotation.y = -P.a;
  }
  for (const [P, o] of R3.proj) if (!seen.has(P)) { o.holder.removeFromParent(); R3.proj.delete(P); }
}

/* ------------------------------------------------------------ 2D-Ebene ueber dem 3D-Bild: Zahlen, Leisten, Bildschirmeffekte */
function r3Screen(x, y, h) { const v = new THREE.Vector3(x * S3, h, y * S3).project(R3.cam); return [(v.x * 0.5 + 0.5) * cv.width, (-v.y * 0.5 + 0.5) * cv.height, v.z < 1]; }
function renderOverlay3d() {
  const g = ctx, W = cv.width, H = cv.height, d = VIEW.dpr;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  g.textAlign = 'center';
  for (const T of G.texts) {
    const k = T.t / T.life, [sx, sy] = r3Screen(T.x, T._y0 === undefined ? (T._y0 = T.y + 72) : T._y0, 2.0 + k * 0.6);
    g.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
    g.font = `800 ${(T.txt.length > 4 ? 12 : 17) * d}px Cinzel, serif`;
    g.lineWidth = 3.5 * d; g.strokeStyle = 'rgba(0,0,0,0.85)'; g.strokeText(T.txt, sx, sy); g.fillStyle = T.col; g.fillText(T.txt, sx, sy);
  }
  g.globalAlpha = 1;
  if (G.party && G.party.length > 1) for (const m of G.party) {
    if (m.state === 'down') continue;
    const [sx, sy] = r3Screen(m.x, m.y, 2.15), col = LOOKS[m.char] && LOOKS[m.char].rim || '#fff';
    if (m === G.player) { g.fillStyle = col; g.beginPath(); g.moveTo(sx - 6 * d, sy - 6 * d); g.lineTo(sx + 6 * d, sy - 6 * d); g.lineTo(sx, sy + 2 * d); g.fill(); }
    else { g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(sx - 18 * d, sy, 36 * d, 5 * d); g.fillStyle = col; g.fillRect(sx - 18 * d, sy, 36 * d * m.hp / m.maxHp, 5 * d); }
  }
  for (const e of G.ents) if (e.state === 'stagger') { const [sx, sy] = r3Screen(e.x, e.y, 2.1); g.fillStyle = '#8ad8ff'; for (let k = 0; k < 3; k++) { const a = G.t * 6 + k * TAU / 3; g.beginPath(); g.arc(sx + Math.cos(a) * 14 * d, sy + Math.sin(a) * 4 * d, 3 * d, 0, TAU); g.fill(); } }
  if (G.whiteFlash > 0) { G.whiteFlash -= 1 / 60; g.fillStyle = `rgba(255,245,220,${Math.max(0, G.whiteFlash) * 2})`; g.fillRect(0, 0, W, H); }
  const slow = clamp((1 - G.scale) / 0.7, 0, 1);
  if (slow > 0.01) { g.fillStyle = rg(g, W / 2, H / 2, Math.min(W, H) * 0.3, Math.max(W, H) * 0.75, [0, 'rgba(20,60,120,0)', 1, `rgba(20,60,140,${0.45 * slow})`]); g.fillRect(0, 0, W, H); }
  const p = G.player;
  if (p && p.hp / p.maxHp < 0.35 && p.state !== 'down') { const a = 0.25 + Math.sin(G.t * 6) * 0.08; g.fillStyle = rg(g, W / 2, H / 2, Math.min(W, H) * 0.35, Math.max(W, H) * 0.8, [0, 'rgba(120,0,20,0)', 1, `rgba(140,0,20,${a})`]); g.fillRect(0, 0, W, H); }
  g.globalAlpha = 1;
}
function hide3d() { if (R3.canvas) R3.canvas.style.display = 'none'; }
