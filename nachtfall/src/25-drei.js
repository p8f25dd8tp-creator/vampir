'use strict';
/* ==========================================================================
   3D-KAMPF (Three.js) — duester-bunt, Chibi-Figuren.
   Die Spiellogik bleibt 2D. Boden, Deko, Held, Begleiter und Gegner werden
   in 3D gezeichnet; die leuchtenden Effekte der Faehigkeiten liegen als
   2D-Ebene deckungsgleich darueber. Orthografische Schraegsicht:
   ein Bodenpunkt (x, y) liegt in 3D bei (x, 0, y / sin(Neigung)), damit
   er auf dem Bildschirm genau dort erscheint, wo die 2D-Ebene zeichnet.
   Faellt WebGL aus oder ist es abgeschaltet, bleibt alles wie bisher in 2D.
   ========================================================================== */

const R3N = { ready: false, failed: false, errors: 0 };
const TILT = 42 * Math.PI / 180, SA = Math.sin(TILT), CA = Math.cos(TILT);
function r3nOn() { return !R3N.failed && SAVE.settings.gfx3d !== false && !!window.THREE && !!GAME && !MENU && GAME.state !== 'menu'; }
const zOf = (y) => y / SA;

/* ------------------------------------------------------------ Grundlagen */
// Gemeinsame Bausteine (auch fuer die 3D-Karte im Menue)
function r3nShared() {
  if (R3N.grad) return;
  const T = THREE, g = new Uint8Array([70, 150, 215, 255]);
  const gm = new T.DataTexture(g, 4, 1, T.RedFormat); gm.minFilter = gm.magFilter = T.NearestFilter; gm.needsUpdate = true; R3N.grad = gm;
  R3N.outline = new T.MeshBasicMaterial({ color: '#0a0408', side: T.BackSide });
}
function r3nInit() {
  const T = THREE;
  const c = document.createElement('canvas'); c.id = 'game3d';
  c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:none;pointer-events:none';
  cv.parentNode.insertBefore(c, cv);
  const ren = new T.WebGLRenderer({ canvas: c, antialias: true, powerPreference: 'high-performance' });
  ren.outputColorSpace = T.SRGBColorSpace;
  R3N.canvas = c; R3N.ren = ren;
  R3N.scene = new T.Scene();
  R3N.cam = new T.OrthographicCamera(-100, 100, 100, -100, 1, 6000);
  r3nShared();
  R3N.hemi = new T.HemisphereLight('#b0a8d8', '#302838', 1.9); R3N.scene.add(R3N.hemi);
  R3N.sun = new T.DirectionalLight('#e8e0ff', 2.2); R3N.sun.position.set(-0.6, 1.4, 0.8); R3N.scene.add(R3N.sun);
  R3N.plight = new T.PointLight('#ffd8b0', 3, 380, 1.1); R3N.scene.add(R3N.plight);
  R3N.rim = new T.DirectionalLight('#ff4a8a', 1.2); R3N.rim.position.set(0.8, 0.6, -1); R3N.scene.add(R3N.rim);
  R3N.lamps = []; for (let i = 0; i < 6; i++) { const l = new T.PointLight('#ffb050', 0, 260, 1.3); R3N.scene.add(l); R3N.lamps.push(l); }
  // Boden
  R3N.ground = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshLambertMaterial({ color: '#d8d0e8' }));
  R3N.ground.rotation.x = -Math.PI / 2; R3N.scene.add(R3N.ground);
  // Bodenschatten (instanziert)
  R3N.shadows = new T.InstancedMesh(new T.CircleGeometry(1, 20), new T.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.38, depthWrite: false }), 400);
  R3N.shadows.frustumCulled = false; R3N.scene.add(R3N.shadows);
  R3N.enemyMeshes = {}; R3N.propMeshes = {}; R3N.heroes = new Map(); R3N.bosses = new Map();
  R3N.dummy = new T.Object3D(); R3N.tmpC = new T.Color();
  R3N.ready = true;
}
function toon(col, o) { return new THREE.MeshToonMaterial(Object.assign({ color: new THREE.Color(col), gradientMap: R3N.grad }, o || {})); }
// Teile zu einem Netz mit Vertexfarben verschmelzen
function mergeParts(parts) {
  const T = THREE, pos = [], nor = [], col = [];
  const m = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), s = new T.Vector3(), p = new T.Vector3(), cc = new T.Color();
  for (const P of parts) {
    let g = P.g.index ? P.g.toNonIndexed() : P.g.clone();
    e.set(P.r ? P.r[0] : 0, P.r ? P.r[1] : 0, P.r ? P.r[2] : 0); q.setFromEuler(e);
    s.set(P.s ? P.s[0] : 1, P.s ? P.s[1] : 1, P.s ? P.s[2] : 1); p.set(P.p ? P.p[0] : 0, P.p ? P.p[1] : 0, P.p ? P.p[2] : 0);
    m.compose(p, q, s); g.applyMatrix4(m);
    pos.push(g.attributes.position.array); nor.push(g.attributes.normal.array);
    cc.set(P.c); const n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = cc.r; a[i * 3 + 1] = cc.g; a[i * 3 + 2] = cc.b; } col.push(a);
  }
  const cat = (arrs) => { const n = arrs.reduce((a, x) => a + x.length, 0), out = new Float32Array(n); let o = 0; for (const x of arrs) { out.set(x, o); o += x.length; } return out; };
  const G = new T.BufferGeometry();
  G.setAttribute('position', new T.BufferAttribute(cat(pos), 3)); G.setAttribute('normal', new T.BufferAttribute(cat(nor), 3)); G.setAttribute('color', new T.BufferAttribute(cat(col), 3));
  return G;
}
const GEO = {};
function geo(k, f) { return GEO[k] || (GEO[k] = f()); }
const SPH = () => geo('sph', () => new THREE.SphereGeometry(1, 16, 12));
const CYL = () => geo('cyl', () => new THREE.CylinderGeometry(1, 1, 1, 12));
const CON = () => geo('con', () => new THREE.ConeGeometry(1, 1, 10));
const BOX = () => geo('box', () => new THREE.BoxGeometry(1, 1, 1));
const CAP = () => geo('cap', () => new THREE.CapsuleGeometry(1, 1, 4, 10));
const TOR = () => geo('tor', () => new THREE.TorusGeometry(1, 0.25, 8, 20));
const DOD = () => geo('dod', () => new THREE.DodecahedronGeometry(1, 0));
const OCT = () => geo('oct', () => new THREE.OctahedronGeometry(1, 0));
function shadeHex(hex, k) { const c = new THREE.Color(hex); if (k < 0) c.multiplyScalar(1 + k); else c.lerp(new THREE.Color('#ffffff'), k); return '#' + c.getHexString(); }

/* ------------------------------------------------------------ Chibi-Helden */
const CHIBI = {
  finn: { skin: '#f0cfb4', hair: '#2a1c16', hs: 'short', top: '#5c5e6c', bot: '#34405a', shoe: '#e8e8ea', eye: '#6a4a2a', glasses: true },
  peter: { skin: '#e8c6ac', hair: '#3a2a1a', hs: 'short', top: '#6a5a3a', bot: '#3a3020', shoe: '#2a2014', eye: '#6a4a2a', weapon: 'staff' },
  emma: { skin: '#f4e0d4', hair: '#e8e8f0', hs: 'long', top: '#2a3a5a', bot: '#1a2030', shoe: '#1a1a20', eye: '#6ab8ff', weapon: 'sword', girl: true },
  lena: { skin: '#f0dcd0', hair: '#2a1a3a', hs: 'long', top: '#3a2a5a', bot: '#1a1028', shoe: '#1a1420', eye: '#a07aff', weapon: 'bow', girl: true },
  fabian: { skin: '#ecd8c8', hair: '#e8cf7a', hs: 'spiky', top: '#2a3a5a', bot: '#1e2434', shoe: '#1a1a20', eye: '#4a7ac8' },
  sil: { skin: '#ecd8c8', hair: '#e8cf7a', hs: 'spiky', top: '#2a3a5a', bot: '#1e2434', shoe: '#1a1a20', eye: '#a07aff' },
  fex: { skin: '#f0e4e0', hair: '#1a1014', hs: 'short', top: '#3a0a18', bot: '#14040a', shoe: '#1a0a10', eye: '#ff3a5a', cape: '#6a1a2a' },
  leo: { skin: '#e0c0a0', hair: '#2a2420', hs: 'bald', top: '#e0dcd0', bot: '#8a867a', shoe: '#3a3028', eye: '#ffffff', hat: true, blind: true, weapon: 'katana' },
  chris: { skin: '#e8c8b0', hair: '#1a1a1a', hs: 'short', top: '#1a2a28', bot: '#0a1210', shoe: '#101010', eye: '#4ff0cc', mask: true, weapon: 'chains' },
  leander: { skin: '#e8c6ac', hair: '#3a2a1e', hs: 'short', top: '#4a5260', bot: '#2a2e38', shoe: '#3a3e48', eye: '#6ab8e8', scale: 0.82, goggles: true },
  agathon: { skin: '#d8d0e0', hair: '#14101c', hs: 'long', top: '#1a1424', bot: '#06040a', shoe: '#0a0810', eye: '#8a6aff', cape: '#2a1a4a', weapon: 'sword' },
  sam: { skin: '#e8c8a8', hair: '#6a4a2a', hs: 'short', top: '#3a5a4a', bot: '#2a3040', shoe: '#1a1a20', eye: '#3a8a6a' },
  mia: { skin: '#a06a4a', hair: '#1a100c', hs: 'pony', top: '#2a2438', bot: '#0c0a14', shoe: '#2a2030', eye: '#e8e0ff', scale: 0.85, girl: true },
  draco: { skin: '#d8c0b0', hair: '#8a1a14', hs: 'spiky', top: '#2a2018', bot: '#0c0806', shoe: '#3a2204', eye: '#ffc040', cape: '#8a5a10', horns: true },
  vorian: { skin: '#cfc6d2', hair: '#ece8f0', hs: 'long', top: '#3a3244', bot: '#16121c', shoe: '#1a1420', eye: '#ff2a40', cape: '#8a1020' },
  liora: { skin: '#ecdcd6', hair: '#170d16', hs: 'long', top: '#8e1428', bot: '#1a1016', shoe: '#1a1016', eye: '#ff3a52', girl: true },
  nyx: { skin: '#ddd4c2', hair: '#221c3a', hs: 'short', top: '#221c3a', bot: '#0c0916', shoe: '#0c0916', eye: '#c9a8ff', mask: true },
  shen: { skin: '#c89d7a', hair: '#eeeae2', hs: 'bald', top: '#1f5a50', bot: '#0b2723', shoe: '#3a2a14', eye: '#5ff0d0', hat: true }
};
const COMP_CHIBI = { peter: 'peter', lena: 'lena', fabian: 'fabian', leo: 'leo', emma: 'emma', fex: 'fex', sendraco: 'draco', minny: 'mia' };
function heroTierCol(hero, tier) {
  const H = HEROES[hero];
  if (hero === 'finn') return FINN_TIERS[tier || 0].col;
  if (H && H.tiers) return H.tiers[tier || 0].col;
  return (HERO_ART[hero] && HERO_ART[hero].rim) || '#ff3a4e';
}
function buildChibi(id, tier) {
  const T = THREE, L = CHIBI[id] || CHIBI.finn, acc = heroTierCol(id, tier), t = tier || 0;
  const root = new T.Group(), body = new T.Group(); root.add(body);
  const mats = [];
  const M = (c, o) => { const m = toon(c, o); mats.push(m); return m; };
  const add = (parent, g, mat, p, s, r, outline) => { const m = new T.Mesh(g, mat); if (p) m.position.set(p[0], p[1], p[2]); if (s) m.scale.set(s[0], s[1], s[2]); if (r) m.rotation.set(r[0], r[1], r[2]); parent.add(m); if (outline !== false) { const o = new T.Mesh(g, R3N.outline); o.scale.setScalar(1.12); m.add(o); } return m; };
  const top = L.top, dark = shadeHex(top, -0.35);
  // Beine
  const legs = [-1, 1].map((sd) => { const hip = new T.Group(); hip.position.set(sd * 5, 17, 0); body.add(hip); add(hip, CAP(), M(L.bot), [0, -7, 0], [3.4, 4.2, 3.4]); add(hip, SPH(), M(L.shoe), [0, -15, 1.5], [4, 3, 5.2]); return hip; });
  // Rumpf
  const torso = new T.Group(); torso.position.y = 18; body.add(torso);
  add(torso, CAP(), M(top), [0, 8, 0], [9, 7, 7]);
  add(torso, CYL(), M(acc, { emissive: new T.Color(acc), emissiveIntensity: 0.35 }), [0, 2.5, 0], [9.4, 1.6, 7.4], null, false);
  if (L.girl) add(torso, CON(), M(dark), [0, 0, 0], [11, 8, 9], [Math.PI, 0, 0]);
  // Arme
  const arms = [-1, 1].map((sd) => { const sh = new T.Group(); sh.position.set(sd * 10, 14, 0); torso.add(sh); add(sh, CAP(), M(top), [0, -5, 0], [2.8, 3.6, 2.8]); add(sh, SPH(), M(L.skin), [0, -11, 0], [3, 3, 3]); return sh; });
  // Waffe in der rechten Hand
  const wp = new T.Group(); wp.position.set(0, -11, 2); arms[1].add(wp);
  if (L.weapon === 'sword' || L.weapon === 'katana') { add(wp, BOX(), M(L.weapon === 'katana' ? '#e8e8f0' : '#bfe8ff', { emissive: new T.Color('#406080'), emissiveIntensity: 0.4 }), [0, 0, 14], [1.2, 1.6, 26]); add(wp, BOX(), M('#c9a24c'), [0, 0, 1], [7, 1.6, 1.6]); }
  else if (L.weapon === 'bow') add(wp, TOR(), M('#6a4a2a'), [0, 0, 4], [12, 12, 2], [0, Math.PI / 2, 0]);
  else if (L.weapon === 'staff') add(wp, CYL(), M('#a8845a'), [0, 0, 6], [1.3, 34, 1.3], [Math.PI / 2, 0, 0]);
  else if (L.weapon === 'chains') for (let k = 0; k < 4; k++) add(wp, TOR(), M('#8a8a94'), [0, -k * 3, 2], [2, 2, 2], [k % 2 ? Math.PI / 2 : 0, 0, 0], false);
  // Kopf (gross)
  const head = new T.Group(); head.position.y = 50; body.add(head);
  add(head, SPH(), M(L.skin), [0, 0, 0], [17, 16, 16]);
  // Augen
  const eyeM = new T.MeshBasicMaterial({ color: L.blind ? '#d8e0e8' : (t >= 2 && (id === 'finn' || id === 'sam' || id === 'fex')) ? '#ff2a3a' : L.eye });
  const whiteM = new T.MeshBasicMaterial({ color: '#ffffff' });
  for (const sd of [-1, 1]) {
    const e = new T.Mesh(SPH(), eyeM); e.position.set(sd * 6, -2, 14.4); e.scale.set(L.blind ? 3.6 : 3.3, L.blind ? 0.8 : 4.6, 1.8); head.add(e);
    if (!L.blind) { const w = new T.Mesh(SPH(), whiteM); w.position.set(sd * 6 - 1, 0.4, 15.6); w.scale.set(1, 1.2, 0.6); head.add(w); }
  }
  if (L.glasses) for (const sd of [-1, 1]) { const g2 = new T.Mesh(TOR(), new T.MeshBasicMaterial({ color: '#1a1a1a' })); g2.position.set(sd * 6, -1, 15.4); g2.scale.set(4.4, 4.4, 1.5); head.add(g2); }
  if (L.goggles) { const g2 = new T.Mesh(CYL(), new T.MeshBasicMaterial({ color: '#6ab8e8' })); g2.position.set(0, 9, 12); g2.scale.set(13, 3, 3); g2.rotation.z = Math.PI / 2; head.add(g2); }
  // Haare
  const hairM = M(L.hair);
  if (L.hs !== 'bald') {
    add(head, SPH(), hairM, [0, 6, -4], [18, 14, 16]);
    if (L.hs === 'spiky') for (let k = 0; k < 7; k++) { const a = -1.2 + k * 0.4; add(head, CON(), hairM, [Math.sin(a) * 10, 14, -2 + Math.cos(a) * 4], [4, 12, 4], [-0.5, 0, -a * 0.7], false); }
    else { add(head, SPH(), hairM, [0, 11, 7], [15, 5, 7], null, false); }
    if (L.hs === 'long') add(head, CAP(), hairM, [0, -10, -9], [13, 10, 6]);
    if (L.hs === 'pony') add(head, SPH(), hairM, [0, 4, -18], [6, 8, 6]);
  }
  if (L.hat) { add(head, CON(), M('#8a6a3e'), [0, 16, 0], [26, 10, 26]); }
  if (L.mask) { add(head, SPH(), M(shadeHex(top, 0.1)), [0, 3, -1], [18.6, 17.4, 17.8]); const mm = new T.Mesh(SPH(), new T.MeshBasicMaterial({ color: L.eye })); mm.position.set(0, -1, 16); mm.scale.set(9, 2, 1); head.add(mm); }
  if (L.horns) for (const sd of [-1, 1]) add(head, CON(), M('#e8d8b0'), [sd * 10, 14, 0], [3.4, 12, 3.4], [0, 0, -sd * 0.5]);
  if (L.fangs) for (const sd of [-1, 1]) add(head, CON(), M('#ffffff'), [sd * 3, -9, 15], [1.2, 3.2, 1.2], [Math.PI, 0, 0], false);
  if (L.crown) for (let k = 0; k < 5; k++) { const a = -1 + k * 0.5; add(head, CON(), M(L.crown, { emissive: new T.Color(L.crown), emissiveIntensity: 0.5 }), [Math.sin(a) * 12, 17, Math.cos(a) * 6 - 3], [2.4, 8, 2.4], null, false); }
  // Fledermausfluegel (Vampirfuersten)
  let wings = null;
  if (L.wings) {
    const wg = geo('wingg', () => { const s = new T.Shape(); s.moveTo(0, 0); s.lineTo(34, 16); s.lineTo(30, 4); s.lineTo(26, -6); s.lineTo(18, -2); s.lineTo(12, -12); s.lineTo(6, -4); s.lineTo(0, -8); s.lineTo(0, 0); return new T.ShapeGeometry(s); });
    wings = [-1, 1].map((sd) => { const w = new T.Mesh(wg, M(L.wings, { side: T.DoubleSide })); w.position.set(sd * 4, 14, -6); w.scale.set(sd, 1, 1); torso.add(w); return w; });
  }
  // Form: Umhang, Krone, Aura
  const cape = L.cape || ((id === 'finn' && t >= 3) || (HEROES[id] && HEROES[id].tiers && t >= 3) ? shadeHex(acc, -0.45) : null);
  let capeM = null;
  if (cape) { const g2 = geo('capeg', () => { const g = new T.PlaneGeometry(22, 30, 3, 5); g.translate(0, -15, 0); return g; }); capeM = new T.Mesh(g2, M(cape, { side: T.DoubleSide })); capeM.position.set(0, 16, -7); torso.add(capeM); }
  if ((id === 'finn' && t >= 4) || (HEROES[id] && HEROES[id].tiers && t >= 4)) for (let k = 0; k < 5; k++) { const a = -1 + k * 0.5; add(head, CON(), M(acc, { emissive: new T.Color(acc), emissiveIntensity: 0.6 }), [Math.sin(a) * 12, 16, Math.cos(a) * 6 - 3], [2, 7, 2], null, false); }
  // Schimmer in der Formfarbe
  const aura = new T.Mesh(geo('ring', () => new T.RingGeometry(18, 22, 40)), new T.MeshBasicMaterial({ color: acc, transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
  aura.rotation.x = -Math.PI / 2; aura.position.y = 0.6; root.add(aura);
  const sc = (L.scale || 1) * 1.3; body.scale.setScalar(sc);
  return { root, body, legs, arms, torso, head, capeM, aura, mats, wings, tier: t, id, yaw: 0 };
}
function poseChibi(R, o, dt) {
  const run = o.run || 0, ph = o.phase || 0;
  R.root.position.set(o.x, 0, zOf(o.y));
  if (o.face !== undefined) { const want = o.aimYaw !== undefined ? o.aimYaw : (o.face > 0 ? Math.PI / 2 : -Math.PI / 2); R.yaw += angDiff(R.yaw, want) * (1 - Math.exp(-dt * 14)); }
  R.root.rotation.y = R.yaw;
  const sw = Math.sin(ph) * 0.8 * run;
  R.legs[0].rotation.x = sw; R.legs[1].rotation.x = -sw;
  R.arms[0].rotation.x = -sw * 0.8; R.arms[1].rotation.x = sw * 0.8;
  if (o.cast > 0) { R.arms[1].rotation.x = -1.6 * o.cast; R.arms[1].rotation.z = 0.2; } else R.arms[1].rotation.z = 0;
  R.arms[0].rotation.z = -0.15; R.arms[1].rotation.z += 0.15;
  R.body.position.y = Math.abs(Math.sin(ph)) * 3 * run + Math.sin((o.t || 0) * 2.4) * 0.6;
  R.body.rotation.x = run * 0.12;
  R.head.rotation.z = Math.sin((o.t || 0) * 1.7) * 0.04; R.head.rotation.x = -0.32;
  if (R.capeM) R.capeM.rotation.x = 0.25 + run * 0.5 + Math.sin((o.t || 0) * 6) * 0.05;
  if (R.wings) R.wings.forEach((w, i) => { const sd = i ? 1 : -1; w.rotation.y = sd * (0.5 + Math.sin((o.t || 0) * 5) * 0.35); w.rotation.z = sd * 0.15; });
  R.aura.rotation.z += dt * 1.5; R.aura.material.opacity = 0.35 + Math.sin((o.t || 0) * 3) * 0.15;
  if (o.dead) { R.body.rotation.x = Math.min(1.5, (o.deadT || 0) * 4); }
  const f = o.flash || 0; for (const m of R.mats) { if (!m.userData.e0) m.userData.e0 = m.emissive.clone(), m.userData.ei0 = m.emissiveIntensity; if (f > 0) { m.emissive.set(o.flashCol || '#ff3a3a'); m.emissiveIntensity = f; } else { m.emissive.copy(m.userData.e0); m.emissiveIntensity = m.userData.ei0; } }
  R.root.visible = o.visible !== false;
}

/* ------------------------------------------------------------ Gegner (instanziert) */
function spriteColors(id) {
  const out = { main: '#6a6a7a', dark: '#2a2a34', rim: (ENEMY_ART[id] && ENEMY_ART[id].rim) || '#ff3a4e' };
  try {
    const spr = ensureArt(id), c = spr.frames[0], g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data;
    let r = 0, gg = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 16) if (d[i + 3] > 200) { const l = d[i] + d[i + 1] + d[i + 2]; if (l < 40 || l > 700) continue; r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; }
    if (n) { const C = new THREE.Color(r / n / 255, gg / n / 255, b / n / 255); const hsl = {}; C.getHSL(hsl); C.setHSL(hsl.h, Math.min(0.7, hsl.s * 1.9 + 0.12), clamp(hsl.l * 1.3, 0.3, 0.58)); out.main = '#' + C.getHexString(); out.dark = shadeHex(out.main, -0.45); }
  } catch (e) { /* Standardfarben */ }
  return out;
}
function enemyParts(role, C) {
  const m = C.main, d = C.dark, eye = C.rim, P = [];
  const eyes = (y, z, x, s) => { for (const sd of [-1, 1]) P.push({ g: SPH(), c: eye, p: [sd * x, y, z], s: [s, s * 1.2, s * 0.6] }); };
  if (role === 'bat') {
    P.push({ g: SPH(), c: m, p: [0, 0.5, 0], s: [0.3, 0.28, 0.28] });
    for (const sd of [-1, 1]) { P.push({ g: CON(), c: d, p: [sd * 0.42, 0.55, 0], s: [0.1, 0.5, 0.26], r: [0, 0, -sd * 1.45] }); P.push({ g: CON(), c: d, p: [sd * 0.14, 0.82, 0], s: [0.07, 0.18, 0.07], r: [0, 0, -sd * 0.3] }); }
    eyes(0.55, 0.24, 0.1, 0.06);
  } else if (role === 'knight' || role === 'captain') {
    P.push({ g: CAP(), c: d, p: [0, 0.3, 0], s: [0.26, 0.2, 0.22] });
    P.push({ g: CAP(), c: m, p: [0, 0.5, 0], s: [0.3, 0.14, 0.26] });
    P.push({ g: SPH(), c: shadeHex(m, 0.15), p: [0, 0.78, 0], s: [0.3, 0.28, 0.28] });
    P.push({ g: BOX(), c: '#0a0808', p: [0, 0.76, 0.24], s: [0.34, 0.07, 0.1] });
    P.push({ g: CYL(), c: shadeHex(m, 0.2), p: [-0.36, 0.45, 0.1], s: [0.2, 0.05, 0.2], r: [Math.PI / 2, 0, 0.2] });
    P.push({ g: BOX(), c: '#c8ccd8', p: [0.36, 0.5, 0.3], s: [0.05, 0.05, 0.6] });
    if (role === 'captain') { P.push({ g: CON(), c: '#e8d8b0', p: [-0.2, 1.05, 0], s: [0.06, 0.24, 0.06], r: [0, 0, 0.5] }); P.push({ g: CON(), c: '#e8d8b0', p: [0.2, 1.05, 0], s: [0.06, 0.24, 0.06], r: [0, 0, -0.5] }); P.push({ g: BOX(), c: shadeHex(eye, -0.4), p: [0, 0.45, -0.28], s: [0.5, 0.6, 0.04] }); }
    eyes(0.77, 0.3, 0.08, 0.04);
  } else if (role === 'witch') {
    P.push({ g: CON(), c: d, p: [0, 0.35, 0], s: [0.34, 0.7, 0.34] });
    P.push({ g: SPH(), c: m, p: [0, 0.78, 0], s: [0.24, 0.24, 0.24] });
    P.push({ g: CON(), c: d, p: [0, 1.0, -0.04], s: [0.26, 0.34, 0.26], r: [-0.3, 0, 0] });
    P.push({ g: SPH(), c: shadeHex(eye, 0.3), p: [0.3, 0.5, 0.2], s: [0.1, 0.12, 0.1] });
    eyes(0.78, 0.2, 0.08, 0.05);
  } else if (role === 'brute') {
    P.push({ g: SPH(), c: m, p: [0, 0.45, 0], s: [0.5, 0.45, 0.45] });
    P.push({ g: SPH(), c: shadeHex(m, 0.2), p: [0, 0.4, 0.2], s: [0.36, 0.3, 0.3] });
    for (const sd of [-1, 1]) { P.push({ g: CAP(), c: d, p: [sd * 0.22, 0.08, 0], s: [0.12, 0.1, 0.12] }); P.push({ g: CAP(), c: d, p: [sd * 0.52, 0.4, 0.1], s: [0.12, 0.2, 0.12], r: [0.3, 0, sd * 0.4] }); P.push({ g: CON(), c: '#f0e8d0', p: [sd * 0.12, 0.62, 0.42], s: [0.05, 0.14, 0.05] }); }
    eyes(0.75, 0.38, 0.14, 0.06);
  } else { // ghoul und alles andere: gebueckter Chibi-Untoter
    for (const sd of [-1, 1]) { P.push({ g: CAP(), c: d, p: [sd * 0.12, 0.14, 0], s: [0.08, 0.1, 0.08] }); P.push({ g: CAP(), c: m, p: [sd * 0.28, 0.42, 0.18], s: [0.07, 0.2, 0.07], r: [1.0, 0, sd * 0.3] }); }
    P.push({ g: CAP(), c: m, p: [0, 0.42, 0.04], s: [0.2, 0.14, 0.16], r: [0.5, 0, 0] });
    P.push({ g: SPH(), c: shadeHex(m, 0.12), p: [0, 0.72, 0.16], s: [0.26, 0.24, 0.24] });
    P.push({ g: SPH(), c: '#1a0808', p: [0, 0.64, 0.38], s: [0.1, 0.05, 0.04] });
    eyes(0.76, 0.36, 0.09, 0.05);
  }
  return P;
}
function enemyMesh(art, role) {
  const key = art + '|' + role;
  if (R3N.enemyMeshes[key]) return R3N.enemyMeshes[key];
  const C = spriteColors(art);
  if (role === 'bat') { C.main = '#' + new THREE.Color(C.main).lerp(new THREE.Color('#5a2a6a'), 0.6).getHexString(); C.dark = shadeHex(C.main, -0.45); }
  const G = mergeParts(isHumanArt(art) ? humanParts(role, C, art) : enemyParts(role, C));
  const mat = toon('#ffffff', { vertexColors: true });
  const im = new THREE.InstancedMesh(G, mat, 300); im.frustumCulled = false; im.count = 0;
  im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(300 * 3).fill(1), 3);
  const out = new THREE.InstancedMesh(G, R3N.outline, 300); out.frustumCulled = false; out.count = 0;
  R3N.scene.add(im); R3N.scene.add(out);
  return (R3N.enemyMeshes[key] = { im, out, n: 0, C });
}
function bossColors(e) {
  const k = 'boss:' + (e.def.bossDraw || e.type);
  if (R3N.enemyMeshes[k]) return R3N.enemyMeshes[k];
  let main = '#6a2a3a';
  try { const c = mkCanvas(120, 160), g = c.getContext('2d'); g.setTransform(0.4, 0, 0, 0.4, 60, 150); BOSS_ART[e.def.bossDraw](g, { t: 1, run: 0 }); const d = g.getImageData(0, 0, 120, 160).data; let r = 0, gg = 0, b = 0, n = 0; for (let i = 0; i < d.length; i += 8) if (d[i + 3] > 200) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; } if (n) { const C = new THREE.Color(r / n / 255, gg / n / 255, b / n / 255); const h = {}; C.getHSL(h); C.setHSL(h.h, Math.min(1, h.s * 1.3 + 0.1), clamp(h.l * 1.2, 0.2, 0.5)); main = '#' + C.getHexString(); } } catch (err) { /* egal */ }
  return (R3N.enemyMeshes[k] = { main });
}
function buildBoss(e) {
  const T = THREE, C = bossColors(e), m = C.main, d = shadeHex(m, -0.5), acc = '#ff3a4e';
  const root = new T.Group(), body = new T.Group(); root.add(body);
  const mats = [], M = (c, o) => { const x = toon(c, o); mats.push(x); return x; };
  const add = (g, mat, p, s, r) => { const x = new T.Mesh(g, mat); x.position.set(...p); x.scale.set(...s); if (r) x.rotation.set(...r); body.add(x); const o = new T.Mesh(g, R3N.outline); o.scale.setScalar(1.06); x.add(o); return x; };
  const own = BOSS_BUILD[e.def.model || e.def.bossDraw];
  if (own) own(add, M, body);
  else {
  add(CAP(), M(d), [0, 50, 0], [34, 30, 28]);
  add(SPH(), M(m), [0, 88, 0], [40, 32, 34]);
  add(SPH(), M(shadeHex(m, 0.15)), [0, 136, 8], [30, 28, 28]);
  for (const sd of [-1, 1]) { add(CON(), M('#e8d8b0'), [sd * 20, 166, 0], [6, 30, 6], [0, 0, -sd * 0.6]); add(CAP(), M(m), [sd * 50, 90, 10], [12, 22, 12], [0.4, 0, sd * 0.5]); add(CAP(), M(d), [sd * 18, 18, 0], [12, 14, 12]); }
  const eyeM = new T.MeshBasicMaterial({ color: '#ffd23a' });
  for (const sd of [-1, 1]) { const x = new T.Mesh(SPH(), eyeM); x.position.set(sd * 11, 138, 34); x.scale.set(5, 3, 2); body.add(x); }
  }
  const aura = new T.Mesh(geo('bring', () => new T.RingGeometry(70, 80, 48)), new T.MeshBasicMaterial({ color: acc, transparent: true, opacity: 0.5, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
  aura.rotation.x = -Math.PI / 2; aura.position.y = 1; root.add(aura);
  R3N.scene.add(root);
  return { root, body, mats, aura, yaw: 0 };
}

/* ------------------------------------------------------------ Menschliche Gegner
   Schueler, Agenten, Soldaten, Waechter: Chibi-Menschen statt Monster.
   (Vampire, Bestien, Dalki und Daemonen bleiben Kreaturen.) */
function isHumanArt(art) { return /^h_/.test(art) && art !== 'h_rotvamp' || art === 'sendraco_h'; }
const HUMAN_HAIR = ['#2a1c16', '#4a3020', '#1a1a1a', '#7a4a22', '#d8c070', '#3a2a1e'];
const HUMAN_HELM = { h_wache: 1, h_sunshield: 1, h_blade: 1, h_ritter: 1, h_waechter: 1 };
function humanParts(role, C, art) {
  let hsh = 0; for (const ch of art) hsh = (hsh * 31 + ch.charCodeAt(0)) >>> 0;
  const PL = (ENEMY_ART[art] && ENEMY_ART[art].pal && ENEMY_ART[art].pal[0] && ENEMY_ART[art].pal[0][1]) || {};
  const skin = PL.skin || ['#f0d0b8', '#e0b898', '#c89070', '#f4dcc8'][hsh % 4], hair = PL.hair || HUMAN_HAIR[(hsh >> 3) % HUMAN_HAIR.length];
  const top = PL.armorL || PL.coat || PL.robeL || PL.cloakL || C.main, pants = shadeHex(PL.armor || PL.coatD || PL.robe || PL.cloak || C.main, -0.35), acc = C.rim, P = [];
  const big = role === 'brute' ? 1.35 : 1;
  for (const sd of [-1, 1]) {
    P.push({ g: CAP(), c: pants, p: [sd * 0.08, 0.13, 0], s: [0.065, 0.075, 0.065] });
    P.push({ g: SPH(), c: '#1a1a1e', p: [sd * 0.08, 0.03, 0.03], s: [0.07, 0.045, 0.095] });
    P.push({ g: CAP(), c: top, p: [sd * 0.2 * big, 0.36, 0.02], s: [0.05 * big, 0.09, 0.05 * big], r: [0.25, 0, sd * 0.2] });
    P.push({ g: SPH(), c: skin, p: [sd * 0.23 * big, 0.23, 0.07], s: [0.05, 0.05, 0.05] });
  }
  P.push({ g: CAP(), c: top, p: [0, 0.37, 0], s: [0.16 * big, 0.11, 0.12 * big] });
  P.push({ g: CYL(), c: shadeHex(top, -0.35), p: [0, 0.28, 0], s: [0.165 * big, 0.03, 0.125 * big] });
  P.push({ g: CYL(), c: shadeHex(top, 0.25), p: [0, 0.47, 0.02], s: [0.1, 0.03, 0.09] });
  // grosser Chibi-Kopf mit Frisur und ruhigen, dunklen Augen
  P.push({ g: SPH(), c: skin, p: [0, 0.66, 0.02], s: [0.23, 0.21, 0.21] });
  if (HUMAN_HELM[art]) { P.push({ g: SPH(), c: shadeHex(top, -0.15), p: [0, 0.73, -0.01], s: [0.25, 0.17, 0.23] }); P.push({ g: CYL(), c: shadeHex(top, -0.3), p: [0, 0.7, 0], s: [0.26, 0.02, 0.24] }); }
  else { P.push({ g: SPH(), c: hair, p: [0, 0.72, -0.03], s: [0.24, 0.18, 0.22] }); P.push({ g: SPH(), c: hair, p: [0, 0.8, 0.1], s: [0.2, 0.07, 0.11] }); }
  for (const sd of [-1, 1]) { P.push({ g: SPH(), c: '#1e1612', p: [sd * 0.075, 0.64, 0.205], s: [0.03, 0.045, 0.02] }); P.push({ g: SPH(), c: '#ffffff', p: [sd * 0.075 - 0.01, 0.655, 0.22], s: [0.01, 0.012, 0.006] }); }
  P.push({ g: SPH(), c: shadeHex(skin, -0.3), p: [0, 0.585, 0.21], s: [0.03, 0.01, 0.01] });
  if (role === 'knight') { P.push({ g: BOX(), c: '#c8ccd8', p: [0.25, 0.26, 0.28], s: [0.025, 0.025, 0.38] }); P.push({ g: BOX(), c: '#8a6a3a', p: [0.25, 0.24, 0.08], s: [0.1, 0.025, 0.025] }); if (HUMAN_HELM[art]) P.push({ g: CYL(), c: shadeHex(top, 0.15), p: [-0.25, 0.3, 0.1], s: [0.13, 0.03, 0.13], r: [Math.PI / 2, 0, 0.3] }); }
  else if (role === 'witch') { P.push({ g: CON(), c: shadeHex(top, -0.2), p: [0, 0.2, 0], s: [0.2, 0.3, 0.18] }); P.push({ g: SPH(), c: acc, p: [-0.24, 0.5, 0.16], s: [0.075, 0.075, 0.075] }); }
  else if (role === 'captain') { P.push({ g: BOX(), c: shadeHex(acc, -0.45), p: [0, 0.3, -0.14], s: [0.34, 0.42, 0.025], r: [0.15, 0, 0] }); for (const sd of [-1, 1]) P.push({ g: SPH(), c: '#e0c050', p: [sd * 0.16, 0.47, 0], s: [0.06, 0.03, 0.06] }); P.push({ g: BOX(), c: '#d8dce8', p: [0.25, 0.26, 0.3], s: [0.03, 0.03, 0.44] }); }
  else if (role === 'brute') { P.push({ g: SPH(), c: shadeHex(top, 0.1), p: [0, 0.38, 0.06], s: [0.2, 0.12, 0.12] }); }
  return P;
}
// Menschliche Bosse als grosse Chibi-Figuren
// (auch Vampirfuersten: menschliche Gestalt, aber bleich, rote Augen, Fangzaehne, Umhang)
const BOSS_HUMAN = { mono: 'b_mono', ian: 'b_ian', stahlmann: 'b_duke', hagon: 'b_hilston', erin: 'emma', sendraco: 'draco', silva: 'b_silva', cindy: 'b_cindy', original: 'b_laxmus', jim: 'b_jim' };
Object.assign(CHIBI, {
  b_mono: { skin: '#e8d0c0', hair: '#1a1a2a', hs: 'spiky', top: '#1a2440', bot: '#0a1020', shoe: '#101018', eye: '#6a8ad8', weapon: 'sword' },
  b_ian: { skin: '#e0c0a0', hair: '#6a4a2a', hs: 'short', top: '#6a4a2a', bot: '#3a2a1a', shoe: '#2a1a10', eye: '#4a3020', hat: true, weapon: 'staff', cape: '#4a3a2a' },
  b_duke: { skin: '#e8c8b0', hair: '#c8c8d0', hs: 'short', top: '#3a3a44', bot: '#1a1a20', shoe: '#101014', eye: '#4a4a5a', weapon: 'sword', cape: '#2a2a34' },
  b_hilston: { skin: '#e8d0c0', hair: '#e8e0d0', hs: 'long', top: '#2a2a3a', bot: '#141420', shoe: '#101014', eye: '#8a3a2a', weapon: 'katana', cape: '#5a1a1a' },
  b_silva: { skin: '#e4dcd8', hair: '#1a1418', hs: 'short', top: '#2a1a24', bot: '#0e080c', shoe: '#0a0608', eye: '#ff2a3a', fangs: true, weapon: 'sword', cape: '#6a0a18' },
  b_cindy: { skin: '#f0e4e4', hair: '#e8a0c0', hs: 'long', top: '#5a1a3a', bot: '#1a0610', shoe: '#1a0610', eye: '#ff3a6a', fangs: true, girl: true, cape: '#8a1a3a' },
  b_laxmus: { skin: '#dcd0d8', hair: '#c8c0d0', hs: 'long', top: '#3a0a14', bot: '#12040a', shoe: '#0a0206', eye: '#ff1a2a', fangs: true, cape: '#5a0610', wings: '#3a0a18', crown: '#ff3a4e' },
  b_jim: { skin: '#e0d4d0', hair: '#2a2a30', hs: 'spiky', top: '#1a1a24', bot: '#0a0a10', shoe: '#08080c', eye: '#ff4a3a', fangs: true, glasses: true, cape: '#2a0a14', weapon: 'staff' }
});
// Eigene Kreaturen-Bosse: Dalki, Diamantkrabbe, Daemonenkoenige
const BOSS_BUILD = {
  dalki1: (add, M, body) => dalkiBody(add, M, body, 1, '#6a7a8a', '#c8d0d8'),
  graham: (add, M, body) => dalkiBody(add, M, body, 10, '#5a5a6a', '#ffd060'),
  scordana(add, M, body) { // Skorpion-Unterleib, vier Scheren, Stachelschwanz
    add(SPH(), M('#6a3a2a'), [0, 34, -10], [46, 22, 58]);
    add(SPH(), M('#8a4a30'), [0, 58, 30], [30, 30, 28]);
    for (const sd of [-1, 1]) {
      for (let k = 0; k < 3; k++) add(CAP(), M('#4a2418'), [sd * (44 + k * 3), 16, -34 + k * 22], [5, 22, 5], [0, 0, sd * 1.1]);
      for (const y of [70, 50]) { add(CAP(), M('#7a4028'), [sd * 38, y, 50], [7, 18, 7], [1.1, 0, sd * 0.6]); add(CON(), M('#c86a3a'), [sd * 44, y, 76], [9, 20, 9], [Math.PI / 2, 0, 0]); }
      const eye = new THREE.Mesh(SPH(), new THREE.MeshBasicMaterial({ color: '#ffd23a' })); eye.position.set(sd * 10, 66, 54); eye.scale.setScalar(4.5); body.add(eye);
    }
    for (let k = 0; k < 5; k++) add(SPH(), M('#6a3a2a'), [0, 40 + k * 16, -58 - k * 6 + k * k * 1.5], [12 - k, 12 - k, 12 - k]);
    add(CON(), M('#e8c060', { emissive: new THREE.Color('#ff8a2a'), emissiveIntensity: 0.4 }), [0, 118, -52], [7, 26, 7], [-0.6, 0, 0]);
  },
  krabbe(add, M, body) {
    add(SPH(), M('#4a6a8a'), [0, 40, 0], [70, 30, 56]);
    add(SPH(), M('#6a8aa8'), [0, 52, 6], [54, 18, 42]);
    for (let i = 0; i < 7; i++) { const a = i * 0.9; add(OCT(), M('#9af0ff', { emissive: new THREE.Color('#4ad8ff'), emissiveIntensity: 0.7 }), [Math.cos(a) * 30, 72 + (i % 3) * 6, Math.sin(a) * 22 - 6], [9, 20 + (i % 2) * 8, 9], [0, a, 0.2]); }
    for (const sd of [-1, 1]) {
      for (let k = 0; k < 3; k++) add(CAP(), M('#3a5a7a'), [sd * (60 + k * 4), 22, -24 + k * 22], [6, 26, 6], [0, 0, sd * 1.1]);
      add(CAP(), M('#4a6a8a'), [sd * 64, 44, 44], [10, 22, 10], [1.2, 0, sd * 0.5]);
      add(SPH(), M('#5a7a9a'), [sd * 70, 50, 78], [22, 14, 26]);
      add(CON(), M('#9af0ff'), [sd * 62, 50, 100], [6, 22, 6], [Math.PI / 2, 0, 0]);
      add(CYL(), M('#3a5a7a'), [sd * 14, 66, 36], [3, 22, 3]);
      const eye = new THREE.Mesh(SPH(), new THREE.MeshBasicMaterial({ color: '#ffd23a' })); eye.position.set(sd * 14, 80, 36); eye.scale.setScalar(6); body.add(eye);
    }
  },
  kronker(add, M, body) {
    add(CAP(), M('#4a0a0a'), [0, 50, 0], [36, 32, 30]); add(SPH(), M('#8a1a14'), [0, 92, 0], [44, 34, 36]); add(SPH(), M('#a02a1a'), [0, 140, 8], [30, 28, 28]);
    for (const sd of [-1, 1]) {
      add(CON(), M('#1a0a0a'), [sd * 26, 176, -4], [8, 44, 8], [0.3, 0, -sd * 0.8]);
      for (const y of [100, 72]) add(CAP(), M('#8a1a14'), [sd * 54, y, 10], [11, 22, 11], [0.5, 0, sd * 0.7]);
      add(CAP(), M('#2a0808'), [sd * 18, 18, 0], [13, 15, 13]);
    }
    add(SPH(), M('#ff6a2a', { emissive: new THREE.Color('#ff4a1a'), emissiveIntensity: 0.8 }), [0, 96, 34], [12, 12, 6]);
    for (const sd of [-1, 1]) { const x = new THREE.Mesh(SPH(), new THREE.MeshBasicMaterial({ color: '#ffb02a' })); x.position.set(sd * 11, 142, 34); x.scale.set(5, 3, 2); body.add(x); }
  },
  immortui(add, M, body) {
    add(CON(), M('#140c1e'), [0, 60, 0], [46, 120, 46]); add(SPH(), M('#1e1430'), [0, 108, 0], [34, 26, 28]); add(SPH(), M('#2a1a40'), [0, 146, 6], [26, 26, 26]);
    for (let k = 0; k < 7; k++) { const a = -1.2 + k * 0.4; add(CON(), M('#8a5aff', { emissive: new THREE.Color('#6a3aff'), emissiveIntensity: 0.8 }), [Math.sin(a) * 22, 176, Math.cos(a) * 10 - 4], [3.5, 16, 3.5]); }
    for (const sd of [-1, 1]) { add(CAP(), M('#1e1430'), [sd * 44, 110, 12], [9, 26, 9], [0.6, 0, sd * 0.5]); add(SPH(), M('#b08aff', { emissive: new THREE.Color('#8a5aff'), emissiveIntensity: 1 }), [sd * 58, 86, 34], [10, 10, 10]); }
    for (const sd of [-1, 1]) { const x = new THREE.Mesh(SPH(), new THREE.MeshBasicMaterial({ color: '#d0b0ff' })); x.position.set(sd * 9, 148, 30); x.scale.set(5, 2.5, 2); body.add(x); }
  }
};
function dalkiBody(add, M, body, spikes, skin, acc) {
  add(CAP(), M(shadeHex(skin, -0.35)), [0, 46, 0], [30, 28, 26]);
  add(SPH(), M(skin), [0, 86, 0], [38, 30, 32]);
  add(SPH(), M(shadeHex(skin, 0.15)), [0, 130, 10], [26, 24, 24]);
  for (const sd of [-1, 1]) { add(CAP(), M(skin), [sd * 46, 84, 12], [11, 24, 11], [0.5, 0, sd * 0.4]); add(SPH(), M(shadeHex(skin, 0.1)), [sd * 52, 58, 32], [13, 12, 13]); add(CAP(), M(shadeHex(skin, -0.35)), [sd * 16, 16, 0], [12, 14, 12]); }
  const n = Math.min(spikes, 10);
  // Stacheln als Kranz auf dem Kopf, von vorn gut sichtbar
  for (let i = 0; i < n; i++) { const a = n === 1 ? 0 : -1.3 + i * 2.6 / (n - 1); add(CON(), M(acc, { emissive: new THREE.Color(acc), emissiveIntensity: 0.35 }), [Math.sin(a) * 22, 156 - Math.abs(a) * 12, 8 - Math.abs(a) * 6], [5.5, 34 + (1 - Math.abs(a)) * 10, 5.5], [0.25, 0, -a * 0.7]); }
  add(BOX(), M('#1a1414'), [0, 122, 33], [16, 3, 3]);
  for (const sd of [-1, 1]) { const x = new THREE.Mesh(SPH(), new THREE.MeshBasicMaterial({ color: '#ff8a2a' })); x.position.set(sd * 9, 134, 32); x.scale.set(4.5, 2.6, 2); body.add(x); }
}

/* ------------------------------------------------------------ Deko (instanziert je Art) */
function propParts(type) {
  const P = [];
  const stone = '#6a6878', stoneD = '#3a3844', wood = '#5a3a24', glowY = '#ffc860';
  switch (type) {
    case 'grave': P.push({ g: CAP(), c: stone, p: [0, 22, 0], s: [14, 10, 5] }, { g: BOX(), c: stoneD, p: [0, 3, 6], s: [30, 6, 16] }); break;
    case 'cross': P.push({ g: BOX(), c: stone, p: [0, 26, 0], s: [5, 52, 5] }, { g: BOX(), c: stone, p: [0, 38, 0], s: [26, 5, 5] }); break;
    case 'tree': P.push({ g: CYL(), c: '#3a2a22', p: [0, 30, 0], s: [6, 60, 6] }, { g: SPH(), c: '#2a3a30', p: [0, 70, 0], s: [34, 26, 30] }, { g: SPH(), c: '#324836', p: [-18, 58, 8], s: [20, 16, 18] }, { g: SPH(), c: '#324836', p: [18, 62, -6], s: [22, 16, 20] }); break;
    case 'lantern': case 'lamp': P.push({ g: CYL(), c: '#1e1e26', p: [0, 34, 0], s: [2.5, 68, 2.5] }, { g: BOX(), c: glowY, p: [0, 70, 0], s: [9, 11, 9] }); break;
    case 'candles': for (let k = 0; k < 4; k++) P.push({ g: CYL(), c: '#e8e0c8', p: [(k % 2) * 8 - 4, 5 + k, Math.floor(k / 2) * 6 - 3], s: [2.4, 10 + k * 3, 2.4] }, { g: SPH(), c: glowY, p: [(k % 2) * 8 - 4, 11 + k * 2.5, Math.floor(k / 2) * 6 - 3], s: [1.6, 2.6, 1.6] }); break;
    case 'shrooms': for (let k = 0; k < 3; k++) P.push({ g: CYL(), c: '#d8d0c0', p: [k * 8 - 8, 4, (k % 2) * 6], s: [2, 8, 2] }, { g: SPH(), c: '#6aa8ff', p: [k * 8 - 8, 9, (k % 2) * 6], s: [6, 3.5, 6] }); break;
    case 'bones': P.push({ g: CAP(), c: '#e8e0cc', p: [0, 2, 0], s: [2, 8, 2], r: [0, 0, Math.PI / 2] }, { g: SPH(), c: '#e8e0cc', p: [12, 5, 4], s: [6, 5, 5] }); break;
    case 'pillar': case 'marble': P.push({ g: CYL(), c: type === 'marble' ? '#e8e4ec' : stone, p: [0, 36, 0], s: [11, 72, 11] }, { g: BOX(), c: type === 'marble' ? '#d8d0c0' : stoneD, p: [0, 3, 0], s: [28, 6, 28] }, { g: BOX(), c: type === 'marble' ? '#d8d0c0' : stoneD, p: [0, 73, 0], s: [26, 6, 26] }); break;
    case 'fence': for (let k = 0; k < 4; k++) P.push({ g: BOX(), c: '#2a2630', p: [k * 14 - 21, 16, 0], s: [3, 32, 3] }); P.push({ g: BOX(), c: '#2a2630', p: [0, 24, 0], s: [48, 3, 2] }); break;
    case 'coffin': P.push({ g: BOX(), c: wood, p: [0, 6, 0], s: [18, 12, 38] }, { g: BOX(), c: '#3a2416', p: [0, 13, 0], s: [20, 3, 40] }); break;
    case 'barrier': P.push({ g: BOX(), c: '#9a9aa4', p: [0, 10, 0], s: [44, 20, 12] }, { g: BOX(), c: '#e8c030', p: [0, 16, 6.2], s: [40, 4, 1] }); break;
    case 'crate': P.push({ g: BOX(), c: '#7a6040', p: [0, 12, 0], s: [24, 24, 24] }, { g: BOX(), c: '#4a3620', p: [0, 12, 0], s: [25, 4, 25] }); break;
    case 'dummy': P.push({ g: CYL(), c: wood, p: [0, 22, 0], s: [3, 44, 3] }, { g: CAP(), c: '#c8b080', p: [0, 34, 0], s: [9, 10, 9] }, { g: SPH(), c: '#c8b080', p: [0, 54, 0], s: [8, 8, 8] }); break;
    case 'rock': P.push({ g: DOD(), c: '#5a5660', p: [0, 8, 0], s: [18, 12, 15] }, { g: DOD(), c: '#4a4650', p: [14, 5, 6], s: [9, 7, 8] }); break;
    case 'alienplant': P.push({ g: CYL(), c: '#3a6a5a', p: [0, 14, 0], s: [2.5, 28, 2.5] }, { g: SPH(), c: '#c070ff', p: [0, 30, 0], s: [8, 10, 8] }, { g: SPH(), c: '#4ff0cc', p: [9, 18, 3], s: [5, 6, 5] }); break;
    case 'crystal': case 'goldcrystal': { const c = type === 'crystal' ? '#8a6aff' : '#ffc860'; P.push({ g: OCT(), c, p: [0, 18, 0], s: [8, 20, 8] }, { g: OCT(), c, p: [10, 10, 4], s: [5, 12, 5], r: [0, 0, -0.4] }, { g: OCT(), c, p: [-9, 9, -3], s: [5, 11, 5], r: [0, 0, 0.4] }); break; }
    case 'spikes': for (let k = 0; k < 4; k++) P.push({ g: CON(), c: '#3a2a2a', p: [k * 9 - 13, 12, (k % 2) * 8 - 4], s: [4, 24 + (k % 2) * 10, 4] }); break;
    case 'wreck': P.push({ g: BOX(), c: '#4a4448', p: [0, 10, 0], s: [40, 18, 22], r: [0, 0.3, 0.15] }, { g: BOX(), c: '#2a2628', p: [8, 22, 0], s: [18, 10, 18], r: [0, 0.2, -0.2] }); break;
    case 'brazier': case 'goldbrazier': P.push({ g: CYL(), c: type === 'goldbrazier' ? '#c9a24c' : '#2a2628', p: [0, 12, 0], s: [4, 24, 4] }, { g: CYL(), c: type === 'goldbrazier' ? '#c9a24c' : '#3a3438', p: [0, 26, 0], s: [12, 5, 12] }, { g: CON(), c: '#ff8a2a', p: [0, 34, 0], s: [8, 14, 8] }); break;
    case 'banner': P.push({ g: CYL(), c: '#2a2020', p: [0, 34, 0], s: [2, 68, 2] }, { g: BOX(), c: '#8a1020', p: [9, 50, 0], s: [16, 30, 1.5] }); break;
    case 'obelisk': P.push({ g: CON(), c: '#2a2438', p: [0, 40, 0], s: [12, 80, 12], r: [0, Math.PI / 4, 0] }, { g: BOX(), c: '#ff4a6a', p: [0, 34, 6], s: [3, 20, 1] }); break;
    default: P.push({ g: DOD(), c: '#5a5660', p: [0, 8, 0], s: [14, 10, 12] });
  }
  return P;
}
function propMesh(type) {
  if (R3N.propMeshes[type]) return R3N.propMeshes[type];
  const G = mergeParts(propParts(type));
  const im = new THREE.InstancedMesh(G, toon('#ffffff', { vertexColors: true }), 160); im.frustumCulled = false; im.count = 0;
  const out = new THREE.InstancedMesh(G, R3N.outline, 160); out.frustumCulled = false; out.count = 0;
  R3N.scene.add(im); R3N.scene.add(out);
  return (R3N.propMeshes[type] = { im, out, n: 0 });
}

const PROP_LIGHT = { lantern: ['#ffb050', 5], lamp: ['#ffd890', 5], candles: ['#ffa040', 4], brazier: ['#ff7a2a', 6], goldbrazier: ['#ffc040', 6], crystal: ['#9a6aff', 5], goldcrystal: ['#ffd060', 4], shrooms: ['#5ab0ff', 4], alienplant: ['#4ff0cc', 4], obelisk: ['#ff3a6a', 5] };
/* ------------------------------------------------------------ Bild */
function r3nTheme() {
  const T = THREE;
  if (R3N.theme === WORLD.theme && R3N.tile === WORLD.groundTile) return;
  R3N.theme = WORLD.theme; R3N.tile = WORLD.groundTile;
  const tex = new T.CanvasTexture(WORLD.groundTile); tex.colorSpace = T.SRGBColorSpace; tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.anisotropy = 4;
  if (R3N.ground.material.map) R3N.ground.material.map.dispose();
  R3N.ground.material.map = tex; R3N.ground.material.needsUpdate = true;
  const th = THEMES[WORLD.theme] || THEMES.friedhof;
  const amb = new T.Color(th.ambient);
  R3N.hemi.color.copy(amb).lerp(new T.Color('#ffffff'), 0.35); R3N.hemi.groundColor.copy(amb).multiplyScalar(0.35);
  R3N.sun.color.copy(amb).lerp(new T.Color('#ffffff'), 0.6);
  R3N.scene.background = amb.clone().multiplyScalar(0.25);
  R3N.ground.material.color.copy(amb).lerp(new T.Color('#ffffff'), 0.55);
}
function r3nResize() {
  const pr = Math.min(VIEW.dpr, R3N.lowRes ? 1 : 1.6);
  if (R3N.w === VIEW.cssW && R3N.h === VIEW.cssH && R3N.pr === pr) return;
  R3N.w = VIEW.cssW; R3N.h = VIEW.cssH; R3N.pr = pr;
  R3N.ren.setPixelRatio(pr); R3N.ren.setSize(VIEW.cssW, VIEW.cssH, false);
}
function setInst(M, i, x, y, z, yaw, sx, sy, sz, tilt, roll) {
  const D = R3N.dummy; D.position.set(x, y, z); D.rotation.set(tilt || 0, yaw || 0, roll || 0, 'YXZ'); D.scale.set(sx, sy, sz); D.updateMatrix();
  M.im.setMatrixAt(i, D.matrix); if (M.out) { D.scale.set(sx * 1.08, sy * 1.06, sz * 1.08); D.updateMatrix(); M.out.setMatrixAt(i, D.matrix); }
}
let _shadowN = 0;
function addShadow(x, y, r) { if (_shadowN >= 400) return; const D = R3N.dummy; D.position.set(x, 0.4, zOf(y)); D.rotation.set(-Math.PI / 2, 0, 0); D.scale.set(r, r * 0.8, 1); D.updateMatrix(); R3N.shadows.setMatrixAt(_shadowN++, D.matrix); }

function r3nRender(G, time, dt) {
  if (!r3nOn()) { if (R3N.canvas) R3N.canvas.style.display = 'none'; return false; }
  try {
    if (!R3N.ready) r3nInit();
    r3nResize(); r3nTheme();
    R3N.canvas.style.display = 'block';
    const T = THREE, cam = G.cam;
    let sx = 0, sy = 0; if (G.shake > 0) { sx = (Math.random() - 0.5) * G.shake; sy = (Math.random() - 0.5) * G.shake; }
    R3N.sx = sx; R3N.sy = sy;
    const cx = cam.x + sx, cy = cam.y + sy;
    // Kamera: orthografisch, schraeg von Sueden
    const C3 = R3N.cam; C3.left = -VIEW.w / 2; C3.right = VIEW.w / 2; C3.top = VIEW.h / 2; C3.bottom = -VIEW.h / 2; C3.updateProjectionMatrix();
    const tz = zOf(cy); C3.position.set(cx, Math.sin(TILT) * 2000, tz + Math.cos(TILT) * 2000); C3.lookAt(cx, 0, tz);
    // Boden
    const Wp = VIEW.w + 600, Hp = VIEW.h + 800;
    R3N.ground.scale.set(Wp, Hp / SA, 1); R3N.ground.position.set(cx, 0, tz);
    const tex = R3N.ground.material.map; if (tex) { const TS = WORLD.tileSize; tex.repeat.set(Wp / TS, Hp / TS); tex.offset.set(((cx - Wp / 2) / TS) % 1, (-(cy + Hp / 2) / TS) % 1); }
    _shadowN = 0;
    // Deko
    for (const k in R3N.propMeshes) R3N.propMeshes[k].n = 0;
    const lampC = [];
    const x0 = cx - VIEW.w / 2, y0 = cy - VIEW.h / 2;
    const c0x = Math.floor((x0 - 160) / CHUNK), c1x = Math.floor((x0 + VIEW.w + 160) / CHUNK), c0y = Math.floor((y0 - 200) / CHUNK), c1y = Math.floor((y0 + VIEW.h + 260) / CHUNK);
    for (let yy = c0y; yy <= c1y; yy++) for (let xx = c0x; xx <= c1x; xx++) for (const pr of chunkProps(xx, yy)) {
      if (pr.x < x0 - 100 || pr.x > x0 + VIEW.w + 100 || pr.y < y0 - 40 || pr.y > y0 + VIEW.h + 260) continue;
      const LC = PROP_LIGHT[pr.type]; if (LC) lampC.push({ x: pr.x, y: pr.y, c: LC, d: Math.hypot(pr.x - cx, pr.y - cy) });
      const M = propMesh(pr.type); if (M.n >= 160) continue;
      let fade = 1; if (pr.type === 'tree' && G.p && G.p.y < pr.y && G.p.y > pr.y - 150 && Math.abs(G.p.x - pr.x) < 60) fade = 0.6;
      const s = (0.85 + (pr.seed % 1) * 0.3);
      setInst(M, M.n++, pr.x, 0, zOf(pr.y), pr.seed * 2 + (pr.flip ? Math.PI : 0), s, s * fade, s);
    }
    lampC.sort((a, b) => a.d - b.d);
    R3N.lamps.forEach((l, i) => { const L = lampC[i]; if (!L) { l.intensity = 0; return; } l.color.set(L.c[0]); l.intensity = L.c[1] * (0.9 + Math.sin(time * 9 + i * 3) * 0.08); l.position.set(L.x, 40, zOf(L.y) + 10); });
    for (const k in R3N.propMeshes) { const M = R3N.propMeshes[k]; M.im.count = M.out.count = M.n; M.im.instanceMatrix.needsUpdate = true; M.out.instanceMatrix.needsUpdate = true; }
    // Gegner
    for (const k in R3N.enemyMeshes) if (R3N.enemyMeshes[k].im) R3N.enemyMeshes[k].n = 0;
    const p = G.p, seenB = new Set();
    for (const e of G.enemies) {
      if (!inView3(e, cx, cy)) continue;
      if (e.boss) { seenB.add(e.id); r3nBoss(e, p, time, dt); continue; }
      const A = ENEMY_ART[e.def.art], role = e.def.role || e.role, M = enemyMesh(e.def.art, role);
      if (M.n >= 300) continue;
      const h = ((A && A.h) || 34) * (e.scale || 1) * 1.4;
      const fps = role === 'bat' ? 12 : 8, ph = e.animT * fps;
      let yaw = p ? Math.atan2(p.x - e.x, p.y - e.y) : 0, lift = e.def.flier ? 22 + Math.sin(e.animT * 6) * 5 : Math.abs(Math.sin(ph * 0.5)) * 2.5;
      let sxz = h, sy2 = h * (1 + Math.sin(ph) * 0.05), tilt = 0.12, roll = 0;
      if (e.flash > 0) { sy2 *= 1 - e.flash * 1.5; sxz *= 1 + e.flash * 1.2; }
      if (e.dead) { const k = clamp(e.deathT / 0.55, 0, 1); tilt = easeOut(k) * 1.4; sxz *= 1 - k * 0.6; sy2 *= 1 - k * 0.6; lift *= 1 - k; }
      else if (e.stunT > 0) roll = Math.sin(time * 20) * 0.15;
      const i = M.n++;
      setInst(M, i, e.x, lift, zOf(e.y), yaw, sxz, sy2, sxz, tilt, roll);
      const f = e.dead ? 0.6 : e.flash > 0 ? 3.2 : e.elite ? 1.35 : 1;
      M.im.instanceColor.setXYZ(i, f, e.elite && !e.dead ? f * 1.05 : f, e.elite && !e.dead ? f * 0.8 : f);
      if (!e.dead) addShadow(e.x, e.y, (e.r || 11) * 1.2 * (e.def.flier ? 0.7 : 1));
    }
    for (const k in R3N.enemyMeshes) { const M = R3N.enemyMeshes[k]; if (!M.im) continue; M.im.count = M.out.count = M.n; M.im.instanceMatrix.needsUpdate = true; M.out.instanceMatrix.needsUpdate = true; M.im.instanceColor.needsUpdate = true; }
    for (const [id, B] of R3N.bosses) if (!seenB.has(id)) { B.root.removeFromParent(); R3N.bosses.delete(id); }
    // Held und Begleiter
    const seenH = new Set();
    if (p) {
      const key = 'p';
      seenH.add(key);
      const R = r3nHero(key, GAME.berserk ? 'bloodsucker' : p.hero, GAME.berserk ? 0 : p.tier || 0);
      const aimYaw = p.castT > 0 ? Math.atan2(Math.cos(p.castAim), Math.sin(p.castAim)) : (Math.abs(p.lastMoveX) + Math.abs(p.lastMoveY) > 0.1 ? Math.atan2(p.lastMoveX, p.lastMoveY) : undefined);
      poseChibi(R, { x: p.x, y: p.y, face: p.face, aimYaw, run: p.runAmt || 0, phase: p.phase || 0, t: time, cast: p.castT > 0 ? clamp(p.castT / (p.castMax || 0.3), 0, 1) : 0, flash: p.hurtT > 0 ? Math.min(0.5, p.hurtT * 2) : 0, dead: !p.alive, deadT: p.deadT, dodge: p.dodgeT > 0, visible: !(p.dodgeT > 0 && p.dodgeKind === 'shadowstep') }, dt);
      if (p.dodgeT > 0 && !R.kay) R.body.rotation.y = (1 - p.dodgeT / (p.dodgeMax || 0.3)) * Math.PI * 2;
      else R.body.rotation.y = 0;
      addShadow(p.x, p.y, 16);
      R3N.plight.position.set(p.x, 70, zOf(p.y) + 30);
    }
    if (G.comps) for (const c of G.comps) {
      const key = 'c' + c.id; seenH.add(key);
      const R = r3nHero(key, COMP_CHIBI[c.id] || 'finn', 0);
      poseChibi(R, { x: c.x, y: c.y, face: c.face, run: c.run || 0, phase: c.phase || 0, t: time + c.t, cast: c.castT > 0 ? 1 : 0 }, dt);
      addShadow(c.x, c.y, 13);
    }
    for (const [k, R] of R3N.heroes) if (!seenH.has(k)) { R.root.removeFromParent(); R3N.heroes.delete(k); }
    R3N.shadows.count = _shadowN; R3N.shadows.instanceMatrix.needsUpdate = true;
    R3N.ren.render(R3N.scene, R3N.cam);
    R3N.errors = 0;
    return true;
  } catch (err) {
    console.warn('3D-Fehler', err);
    if (++R3N.errors > 20 || !R3N.ready) { R3N.failed = true; if (R3N.canvas) R3N.canvas.style.display = 'none'; }
    return false;
  }
}
function inView3(e, cx, cy) { return Math.abs(e.x - cx) < VIEW.w / 2 + 120 && Math.abs(e.y - cy) < VIEW.h / 2 + 200; }
function r3nHero(key, hero, tier) {
  let R = R3N.heroes.get(key);
  if (R && (R.id !== hero || R.tier !== tier)) { R.root.removeFromParent(); R = null; }
  if (!R) { R = buildChibi(hero, tier); R3N.scene.add(R.root); R3N.heroes.set(key, R); }
  return R;
}
function r3nBoss(e, p, time, dt) {
  let B = R3N.bosses.get(e.id);
  const hum = e.def.look || BOSS_HUMAN[e.def.bossDraw];
  if (!B) { if (hum) { B = buildChibi(hum, 2); B.human = true; R3N.scene.add(B.root); } else B = buildBoss(e); R3N.bosses.set(e.id, B); }
  if (B.human) {
    const s = 1.6 * (e.def.scale || 1), mv = Math.min(1, Math.hypot(e.vx || 0, e.vy || 0) / 40 + (e.run || 0));
    poseChibi(B, { x: e.x, y: e.y, face: 1, aimYaw: p ? Math.atan2(p.x - e.x, p.y - e.y) : 0, run: e.dead ? 0 : Math.max(0.35, mv), phase: e.animT * 9, t: time, cast: e.state === 'wind' ? 1 : 0, flash: e.flash > 0 ? 0.7 : 0, flashCol: '#ffffff', dead: e.dead, deadT: e.deathT }, dt);
    B.root.scale.setScalar(s); B.aura.material.color.set('#ff3a4e');
    addShadow(e.x, e.y, 30 * s); return;
  }
  const s = (e.def.scale || 1) * 1.0;
  B.root.position.set(e.x, 0, zOf(e.y)); B.root.scale.setScalar(s);
  const want = p ? Math.atan2(p.x - e.x, p.y - e.y) : 0; B.yaw += angDiff(B.yaw, want) * (1 - Math.exp(-dt * 4)); B.root.rotation.y = B.yaw;
  B.body.position.y = Math.abs(Math.sin(e.animT * 3)) * 4; B.body.rotation.x = e.state === 'wind' ? -0.25 : 0.05;
  B.aura.material.opacity = 0.35 + Math.sin(time * 4) * 0.2; B.aura.rotation.z += dt;
  const f = e.flash > 0 ? 1 : 0; for (const m of B.mats) { m.emissive.set('#ffffff'); m.emissiveIntensity = f * 0.8; }
  if (e.dead) { const k = clamp(e.deathT / 1.5, 0, 1); B.body.rotation.x = k * 1.4; B.root.scale.setScalar(s * (1 - k * 0.3)); }
  addShadow(e.x, e.y, 70 * s);
}
// Lebensbalken starker Gegner (werden in 3D nicht vom 2D-Gegner mitgezeichnet)
function drawEnemyBars3(g, G) {
  for (const e of G.enemies) {
    if (e.dead || e.boss || !(e.elite || e.mini) || e.hp >= e.maxHp || !inView(e.x, e.y, 60)) continue;
    const A = ENEMY_ART[e.def.art], w = e.mini ? 70 : 40, y = e.y - ((A && A.h) || 34) * (e.scale || 1) * 1.4 * CA - 12;
    g.fillStyle = 'rgba(10,0,6,0.8)'; g.fillRect(e.x - w / 2 - 1, y - 1, w + 2, 6);
    g.fillStyle = e.mini ? '#ff5a3a' : '#ffb040'; g.fillRect(e.x - w / 2, y, w * clamp(e.hp / e.maxHp, 0, 1), 4);
  }
}

/* ------------------------------------------------------------ Einstellungen */
if (SAVE.settings.gfx3d === undefined) SAVE.settings.gfx3d = true;
const _setShow3 = UI.showSettings;
UI.showSettings = function () {
  const d = _setShow3.call(this);
  const first = document.querySelector('.panel .setrow'), box = first && first.parentNode;
  if (box) {
    const row = document.createElement('div'); row.className = 'setrow';
    row.innerHTML = `<span>3D-Grafik<br><small style="color:var(--dim)">Held, Gegner und Welt in 3D. Aus = klassische 2D-Grafik (schneller auf alten Handys).</small></span><div class="toggle interactive ${SAVE.settings.gfx3d !== false ? 'on' : ''}" data-act="toggle" data-k="gfx3d"></div>`;
    box.insertBefore(row, box.firstChild);
    row.querySelector('[data-act]').addEventListener('click', () => { AudioSys.init(); sfx('click'); this.act('toggle', { k: 'gfx3d' }); });
  }
  return d;
};
