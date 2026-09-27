'use strict';
/* ==========================================================================
   ETAPPE 3 in 3D (eigene Gestaltung)
   Speer (Brandon, Fei): Stoss und Fegen, Windwirbel · Leo: blinder
   Schwertkaempfer mit Schwerthieben aus der tiefen Haltung und Nachbildern,
   wenn er schneller wird · Dach des Wohnheims bei Nacht.
   ========================================================================== */

// Waffe je Kampfstil (nur Darstellung)
function weaponFor(e) {
  if (typeof AI_BRANDON !== 'undefined' && e.ai === AI_BRANDON) return 'spear';
  return null;
}
// Speer an der Figur
function addSpear(S, hand) {
  const T = THREE, w = grp(hand); w.rotation.x = -Math.PI / 2;
  addP(S, w, fgeo('shaft', () => new T.CylinderGeometry(0.018, 0.018, 2.0, 8)), '#6a4a2a', 0, 0.45, 0);
  addP(S, w, fgeo('spearTip', () => new T.ConeGeometry(0.045, 0.28, 6)), '#dfe8f4', 0, 1.58, 0);
  addP(S, w, fgeo('spearRing', () => new T.CylinderGeometry(0.03, 0.03, 0.05, 8)), '#c8b070', 0, 1.42, 0);
}
const _buildHumanE3 = buildHuman;
buildHuman = function (L0, extra) {
  if (extra && extra.weapon === 'spear') {
    const R = _buildHumanE3(L0, Object.assign({}, extra, { weapon: null }));
    const S = PartSet(); addSpear(S, R.arms[1].hand); bakeSet(S, R.mats[0]);
    return R;
  }
  return _buildHumanE3(L0, extra);
};

/* ------------------------------------------------------------ Bewegungen */
const P_BLADE = pose({ y: -0.04, headX: -0.06, sh: [[0.1, 0.12], [-0.35, 0.25]], el: [-0.45, -0.6], th: [[-0.12, 0.06], [0.1, 0.06]], kn: [0.2, 0.15] });
const P_SPEAR = pose({ y: -0.08, twist: -0.35, sh: [[-0.6, 0.35], [-1.1, 0.2]], el: [-1.4, -0.9], th: [[-0.3, 0.08], [0.25, 0.08]], kn: [0.5, 0.3] });
Object.assign(MOVES, {
  spearthrust: (G0) => [[0, G0], [0.3, with_(G0, { y: -0.18, twist: -0.7, lean: -0.05, sh: [[-0.6, 0.35], [0.25, 0.3]], el: [-1.4, -1.9], kn: [0.8, 0.6] }), slowIn],
    [0.42, with_(G0, { y: -0.1, twist: 0.35, lean: 0.45, fwd: 0.4, sh: [[-1.2, 0.2], [-1.62, 0.0]], el: [-0.6, -0.02], th: [[-0.9, 0.05], [0.7, 0.05]], kn: [0.6, 0.2] }), snap],
    [0.62, with_(G0, { twist: 0.3, lean: 0.4, fwd: 0.35, sh: [[-1.2, 0.2], [-1.6, 0.0]], el: [-0.6, -0.05] })], [1, G0]],
  spearsweep: (G0) => [[0, G0], [0.3, with_(G0, { twist: -1.0, y: -0.1, sh: [[-0.5, 0.4], [-1.2, 1.25]], el: [-1.2, -0.2] }), slowIn],
    [0.45, with_(G0, { twist: 1.0, lean: 0.2, y: -0.14, sh: [[-0.6, 0.4], [-1.4, -0.7]], el: [-1.2, -0.1] }), snap], [0.62, with_(G0, { twist: 0.9, lean: 0.15, sh: [[-0.6, 0.4], [-1.3, -0.6]], el: [-1.2, -0.15] })], [1, G0]],
  fslash: (G0, alt) => { const sgn = alt ? -1 : 1;
    return [[0, G0], [0.3, with_(G0, { y: -0.22, lean: 0.35, twist: -0.8 * sgn, sh: [[0.1, 0.1], [alt ? -2.2 : 0.35, alt ? -0.6 : 0.7]], el: [-0.4, alt ? -0.4 : -1.2], kn: [0.9, 0.7], th: [[-0.6, 0.12], [0.4, 0.12]] }), slowIn],
      [0.4, with_(G0, { y: -0.16, lean: 0.4, fwd: 0.35, twist: 1.05 * sgn, sh: [[0.2, 0.3], [-1.5, alt ? 1.0 : -0.85]], el: [-0.3, -0.05], kn: [0.8, 0.5], th: [[-0.8, 0.12], [0.5, 0.12]] }), snap],
      [0.6, with_(G0, { y: -0.14, lean: 0.35, fwd: 0.3, twist: 1.0 * sgn, sh: [[0.2, 0.3], [-1.45, alt ? 1.05 : -0.9]], el: [-0.3, -0.1], kn: [0.8, 0.5] })], [1, G0]]; }
});
const _stanceOfE3 = stanceOf;
stanceOf = function (e) {
  if (!e.npc && typeof AI_LEO !== 'undefined' && e.ai === AI_LEO) return P_BLADE;
  if (!e.npc && typeof AI_BRANDON !== 'undefined' && e.ai === AI_BRANDON) return P_SPEAR;
  return _stanceOfE3(e);
};
const _foeMoveE3 = foeMove;
foeMove = function (e) {
  if (e.ai === AI_BRANDON) return e.atk.type === 'lunge' ? 'spearthrust' : 'spearsweep';
  if (e.ai === AI_LEO || (e.look && e.look.weapon === 'sword' && e.atk.type === 'swipe')) return 'fslash';
  return _foeMoveE3(e);
};
const _clipE3 = clip;
clip = function (name, G0, alt) {
  const k = name + (alt ? '1' : '0') + (G0 === P_BLADE ? 'b' : G0 === P_SPEAR ? 's' : '');
  if (G0 === P_BLADE || G0 === P_SPEAR) { if (!CLIP_CACHE.has(k)) CLIP_CACHE.set(k, MOVES[name](G0, alt)); return CLIP_CACHE.get(k); }
  return _clipE3(name, G0, alt);
};

/* ------------------------------------------------------------ Extras je Figur: Windwirbel, Nachbilder bei Tempo */
function r3Extras(e, R, rdt) {
  if (e.ai === AI_BRANDON && e.state !== 'down') {
    if (!R.wind) { R.wind = []; for (let k = 0; k < 3; k++) { const s = glowSprite3('#bff0d8', 0.35, 0.5); R.root.add(s); R.wind.push(s); } }
    const act = e.state === 'wind' || e.state === 'active' ? 1.8 : 1;
    R.wind.forEach((s, k) => { const a = G.t * 5 * act + k * TAU / 3; s.position.set(Math.cos(a) * 0.55, 0.4 + k * 0.45 + Math.sin(G.t * 3 + k) * 0.1, Math.sin(a) * 0.55); s.material.opacity = 0.25 + 0.2 * act; });
  }
  if (e.ai === AI_LEO && e.state !== 'down' && G.t > 8 && (Math.hypot(e.vx, e.vy) > 60 || e.state === 'active')) {
    if ((R.fastT = (R.fastT || 0) - rdt) <= 0) { R.fastT = G.t > 20 ? 0.05 : 0.09; r3Ghost(R, '#5ff0d0'); }
  }
}

/* ------------------------------------------------------------ Dach des Wohnheims bei Nacht */
if (typeof ARENA_ART !== 'undefined' && !ARENA_ART.dach) ARENA_ART.dach = ARENA_ART.halle;
ARENA3D.dach = function (A, scene) {
  const T = THREE, W = A.w * S3, H = A.h * S3;
  const conc = noiseTex('#4a4a52', ['rgba(0,0,0,0.25)', 'rgba(255,255,255,0.06)', 'rgba(30,30,40,0.3)'], 31, [(W + 2) / 3, (H + 2) / 3], (g) => { g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 2; for (let i = 0; i <= 256; i += 128) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); } });
  groundPlane(scene, W + 2, H + 2, conc, { std: true, rough: 0.7 }).position.set(W / 2, 0, H / 2);
  // Gelaender rundum (nur hinten und seitlich hoch, vorn niedrig fuer die Kamera)
  const rail = toonMat('#8a8e98');
  for (const [x0, z0, x1, z1, h] of [[-0.5, -0.5, W + 0.5, -0.5, 1.0], [-0.5, -0.5, -0.5, H + 0.5, 1.0], [W + 0.5, -0.5, W + 0.5, H + 0.5, 1.0]]) {
    const len = Math.hypot(x1 - x0, z1 - z0), m = new T.Mesh(new T.BoxGeometry(len, 0.06, 0.06), rail); m.position.set((x0 + x1) / 2, h, (z0 + z1) / 2); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); scene.add(m);
    for (let s = 0; s <= len; s += 1.2) { const post = new T.Mesh(fgeo('rpost', () => new T.BoxGeometry(0.05, 1.0, 0.05)), rail); post.position.set(x0 + (x1 - x0) * s / len, 0.5, z0 + (z1 - z0) * s / len); scene.add(post); }
  }
  box3(scene, W + 1.2, 0.3, 0.3, '#3a3a44', W / 2, 0.15, H + 0.45, { noOutline: true });
  // Aufbauten: Treppenhaus, Lueftung, Wassertank, Antenne
  box3(scene, 2.2, 2.6, 1.8, '#5a5e6a', 1.4, 1.3, 1.2); box3(scene, 0.9, 1.9, 0.08, '#2a2a30', 1.4, 0.95, 2.12, { noOutline: true });
  const lampE = new T.PointLight('#ffe0a0', 5, 6, 1.6); lampE.position.set(1.4, 2.3, 2.4); scene.add(lampE); const lg0 = glowSprite3('#ffe0a0', 0.6, 0.6); lg0.position.set(1.4, 2.2, 2.2); scene.add(lg0);
  for (const [x, z] of [[W - 1.4, 1.4], [W - 1.2, H * 0.55]]) { box3(scene, 1.3, 0.9, 1.1, '#6a707c', x, 0.45, z); part(fgeo('fan', () => new T.CylinderGeometry(0.4, 0.4, 0.08, 16)), toonMat('#2a2e36'), scene, x, 0.95, z); }
  part(fgeo('tank', () => new T.CylinderGeometry(0.9, 0.9, 1.8, 18)), toonMat('#7a6a5a'), scene, 1.3, 2.9 + 0.9, 1.2);
  part(fgeo('ant', () => new T.CylinderGeometry(0.03, 0.03, 3.2, 6)), toonMat('#9aa0aa'), scene, W - 1.4, 1.6, 0.4);
  const red = glowSprite3('#ff3a3a', 0.5, 0.9); red.position.set(W - 1.4, 3.25, 0.4); scene.add(red);
  // Stadt in der Tiefe unter dem Dach
  for (let i = 0; i < 24; i++) {
    const h = 4 + (hash2(i, 1, 9) % 70) / 6, w = 2 + (hash2(i, 2, 9) % 25) / 10, side = i % 3;
    const x = side === 0 ? -6 - (hash2(i, 4, 9) % 40) / 4 : side === 1 ? W + 6 + (hash2(i, 5, 9) % 40) / 4 : -8 + (i * 2.3) % (W + 16), z = side === 2 ? -8 - (hash2(i, 6, 9) % 30) / 4 : (hash2(i, 7, 9) % 100) / 100 * H;
    const m = new T.Mesh(new T.BoxGeometry(w, h, w), new T.MeshBasicMaterial({ color: '#0c1022' })); m.position.set(x, h / 2 - 12, z); scene.add(m);
    for (let k = 0; k < 6; k++) { const lw = new T.Mesh(fgeo('cwin', () => new T.PlaneGeometry(0.3, 0.4)), new T.MeshBasicMaterial({ color: hash2(i, k, 1) % 4 ? '#ffcf80' : '#8ab8ff' })); lw.position.set(x + ((hash2(i, k, 3) % 10) / 10 - 0.5) * w * 0.7, m.position.y - h / 2 + 1 + (hash2(k, i, 8) % 10) / 10 * (h - 2), z + w / 2 + 0.01); scene.add(lw); }
  }
  // Sterne
  const n = 300, pos = new Float32Array(n * 3), rnd = mulberry(77);
  for (let i = 0; i < n; i++) { const a = rnd() * TAU, e = 0.15 + rnd() * 1.2, r = 60; pos[i * 3] = W / 2 + Math.cos(a) * Math.cos(e) * r; pos[i * 3 + 1] = Math.sin(e) * r; pos[i * 3 + 2] = H / 2 + Math.sin(a) * Math.cos(e) * r - 20; }
  const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(pos, 3));
  scene.add(new T.Points(sg, new T.PointsMaterial({ size: 0.25, color: '#dfe8ff', transparent: true, opacity: 0.85, fog: false })));
  const moon = glowSprite3('#eef2ff', 7, 0.95); moon.position.set(W * 0.75, 20, -22); moon.material.fog = false; scene.add(moon);
  scene.background = new T.Color('#050a1c'); scene.fog = new T.Fog('#050a1c', 16, 60);
  scene.add(new T.HemisphereLight('#4a5aa0', '#15141c', 0.85));
  sunLight(scene, W / 2, H / 2, 14, '#9ab4ff', 1.5, [3, 14, -8]);
};
