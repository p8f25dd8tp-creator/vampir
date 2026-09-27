'use strict';
/* ==========================================================================
   ETAPPE 4 in 3D (eigene Gestaltung)
   Aula: Parkett, Buehne mit Vorhang und Scheinwerfern, Stuhlreihen, Banner ·
   Monos Seelenwaffe als lebende Peitsche · leuchtende Haende (Raten u. a.) ·
   Staub beim Erdnutzer, Tropfen beim Wasserstrahl.
   ========================================================================== */

if (typeof ARENA_ART !== 'undefined' && !ARENA_ART.aula) ARENA_ART.aula = ARENA_ART.kantine;
ARENA3D.aula = function (A, scene) {
  const T = THREE, W = A.w * S3, H = A.h * S3;
  const parkett = noiseTex('#9a7250', ['rgba(0,0,0,0.1)', 'rgba(255,220,170,0.08)'], 45, [(W + 4) / 2.4, (H + 4) / 2.4], (g) => { g.strokeStyle = 'rgba(40,20,10,0.5)'; g.lineWidth = 2; for (let y = 0; y < 256; y += 32) for (let x = 0; x < 256; x += 64) { const o = (y / 32) % 2 ? 32 : 0; g.strokeRect(x + o, y, 64, 32); } });
  groundPlane(scene, W + 4, H + 4, parkett, { std: true, rough: 0.38 }).position.set(W / 2, 0, H / 2);
  // Buehne hinten mit Vorhang und Rednerpult
  box3(scene, W - 1, 0.9, 3.0, '#5a3a24', W / 2, 0.45, -1.2);
  box3(scene, W - 1, 0.08, 3.1, '#7a5030', W / 2, 0.92, -1.2, { noOutline: true });
  for (let i = 0; i < 3; i++) box3(scene, 2.2, 0.3 * (i + 1), 0.45, '#5a3a24', W / 2, 0.15 * (i + 1), 0.5 - i * 0.45, { noOutline: true });
  const curtain = new T.Mesh(new T.CylinderGeometry(1, 1, 5, 40, 1, true, 0, Math.PI), toonMat('#8a1a24', { side: T.DoubleSide }));
  curtain.scale.set(W / 2 + 0.5, 1, 0.25); curtain.rotation.y = Math.PI / 2 + Math.PI / 2; curtain.position.set(W / 2, 3.4, -2.6); scene.add(curtain);
  for (const s of [-1, 1]) { const side = new T.Mesh(new T.BoxGeometry(1.4, 5, 0.3), toonMat('#7a1420')); side.position.set(W / 2 + s * (W / 2 - 0.6), 3.4, -2.2); scene.add(side); }
  box3(scene, 0.8, 1.1, 0.5, '#3a2418', W / 2 + 1.8, 1.45, -1.0);
  const logo = new T.Mesh(new T.CircleGeometry(0.9, 32), new T.MeshBasicMaterial({ map: labelTex('★', '#e8c060', '#1a2a4a') })); logo.position.set(W / 2, 4.6, -2.5); scene.add(logo);
  // Waende mit hohen Fenstern und Bannern
  box3(scene, 0.4, 6, H + 4, '#5a4a4a', -0.3, 3, H / 2, { noOutline: true }); box3(scene, 0.4, 6, H + 4, '#5a4a4a', W + 0.3, 3, H / 2, { noOutline: true });
  for (let z = 2; z < H; z += 3.4) for (const [x, r] of [[-0.08, Math.PI / 2], [W + 0.08, -Math.PI / 2]]) {
    const win = new T.Mesh(fgeo('awin', () => new T.PlaneGeometry(1.1, 2.4)), new T.MeshBasicMaterial({ color: '#ffb880' })); win.position.set(x, 3.6, z); win.rotation.y = r; scene.add(win);
    const ban = new T.Mesh(fgeo('aban', () => new T.PlaneGeometry(0.7, 1.6)), toonMat(z % 2 < 1 ? '#1a3a7a' : '#7a1a2a', { side: T.DoubleSide })); ban.position.set(x + (r > 0 ? 0.05 : -0.05), 3.2, z + 1.7); ban.rotation.y = r; scene.add(ban);
  }
  // Stuhlreihen (an den Hindernissen der Kampflogik) und weitere Reihen am Rand
  const chair = (x, z) => { box3(scene, 0.42, 0.05, 0.42, '#2a3a5a', x, 0.45, z, { noOutline: true }); box3(scene, 0.42, 0.45, 0.05, '#2a3a5a', x, 0.7, z + 0.2, { noOutline: true }); for (const s of [-1, 1]) box3(scene, 0.04, 0.45, 0.04, '#1a1a20', x + s * 0.18, 0.22, z, { noOutline: true }); };
  for (const b of A.blocks || []) for (let x = b.x * S3 + 0.3; x < (b.x + b.w) * S3; x += 0.5) chair(x, (b.y + b.h / 2) * S3);
  for (let z = 3; z < H - 1; z += 1.3) { chair(0.4, z); chair(W - 0.4, z); }
  // Licht: warme Buehnenscheinwerfer, Abendlicht, Deckenlampen
  scene.background = new T.Color('#120c10'); scene.fog = new T.Fog('#120c10', 14, 34);
  scene.add(new T.HemisphereLight('#c8c8d8', '#2a2226', 1.0));
  sunLight(scene, W / 2, H / 2, 14, '#ffc890', 1.6, [-6, 10, 4]);
  for (const x of [W * 0.3, W * 0.7]) { const sp = new T.SpotLight('#fff4e4', 18, 16, 0.45, 0.5, 1.4); sp.position.set(x, 7, H * 0.45); sp.target.position.set(W / 2, 0.9, -0.6); scene.add(sp, sp.target); }
  for (const z of [H * 0.35, H * 0.7]) { const pl = new T.PointLight('#ffe6c0', 6, 9, 1.6); pl.position.set(W / 2, 5, z); scene.add(pl); }
};
for (const id of ['aula', 'aula2']) if (typeof MISSIONS !== 'undefined' && MISSIONS[id] && MISSIONS[id].fight) MISSIONS[id].fight.arena.art = 'aula';

/* ------------------------------------------------------------ Extras: Peitsche, leuchtende Haende, Erde, Wasser */
const _r3ExtrasE4 = r3Extras;
r3Extras = function (e, R, rdt) {
  _r3ExtrasE4(e, R, rdt);
  const L = e.look || {};
  // leuchtende Haende (Raten: Telekinese/Wasser, Feuer usw.)
  if (L.handGlow && !R.hands) { R.hands = R.arms.map((a) => { const s = glowSprite3(L.handGlow, 0.5, 0.6); a.hand.add(s); return s; }); }
  if (R.hands) R.hands.forEach((s, i) => { const on = e.state === 'attack' || e.state === 'charge' || e.anim.cast > 0.2; s.material.opacity = (on ? 0.9 : 0.35) + Math.sin(G.t * 9 + i) * 0.1; s.scale.setScalar(on ? 0.75 : 0.45); });
  // Monos Seelenwaffe: lebende Peitsche ab Phase 2
  if (e.kind === 'mono' && e.phase === 2 && e.state !== 'down') r3Whip(e, R);
  else if (R.whip) R.whip.visible = false;
  // Erdnutzer: Staub und Brocken beim Ansturm
  if (e.ai && typeof AI_EARTH !== 'undefined' && e.ai === AI_EARTH && e.state === 'active' && Math.random() < 0.5) G.fx.push({ k: 'dust', x: e.x + rand(-8, 8), y: e.y + rand(-4, 4), vx: rand(-40, 40), vy: rand(-20, 20), life: 0.6, t: 0, size: 8 });
  if (e.ai && typeof AI_WATER !== 'undefined' && e.ai === AI_WATER && e.state === 'active') for (let k = 0; k < 3; k++) { const d = rand(20, 190); G.fx.push({ k: 'spark', x: e.x + Math.cos(e.aim) * d, y: e.y + Math.sin(e.aim) * d - 24, vx: rand(-30, 30), vy: rand(-60, 10), life: 0.4, t: 0, col: '#8ad8ff', size: 3 }); }
};
function r3Whip(e, R) {
  const T = THREE, N = 18;
  if (!R.whip) {
    R.whip = new T.Group(); R3.scene.add(R.whip);
    const m = new T.MeshBasicMaterial({ color: '#6ab0ff' });
    R.whipSeg = Array.from({ length: N }, (_, i) => { const s = new T.Mesh(fgeo('wseg', () => new T.SphereGeometry(0.06, 8, 6)), m); s.scale.setScalar(1.3 - i / N * 0.8); R.whip.add(s); return s; });
    const head = glowSprite3('#9ad8ff', 0.5, 0.9); R.whipSeg[N - 1].add(head);
  }
  R.whip.visible = true;
  const hp = new T.Vector3(); R.arms[0].hand.getWorldPosition(hp);
  const lashing = e.state === 'active' || (e.state === 'wind' && e.stateT > e.atk.wind * 0.7);
  const a = e.aim !== undefined ? e.aim : 0, fx = Math.cos(a), fz = Math.sin(a), len = lashing ? 170 * S3 : 1.8;
  for (let i = 0; i < N; i++) {
    const u = (i + 1) / N;
    let x, y, z;
    if (lashing) { const k = e.state === 'active' ? 1 : (e.stateT / e.atk.wind - 0.7) / 0.3; x = hp.x + fx * len * u * k; z = hp.z + fz * len * u * k; y = hp.y - u * 0.3 + Math.sin(u * 9 - G.t * 30) * 0.08 * (1 - u); }
    else { const sw = Math.sin(G.t * 3 + u * 5) * 0.35 * u; x = hp.x - fz * sw + fx * 0.3 * u; z = hp.z + fx * sw + fz * 0.3 * u; y = hp.y - u * 0.9 + Math.max(0, u - 0.8) * 1.2 + Math.sin(G.t * 4 + u * 6) * 0.08; }
    R.whipSeg[i].position.set(x, Math.max(0.05, y), z);
  }
}
