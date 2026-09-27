'use strict';
/* ==========================================================================
   ETAPPE 7 in 3D (eigene Gestaltung)
   Caladi: Wueste in greller Sonne, Duenen, Oase mit Palmen, verlassenes
   Brunnenhaus · Tag, Nacht und Schattenleere (lila Daemmerlicht) wechseln
   im Kampf · Laylas Schirm ueber Quinn · Zahnwurm, Fluegelechse ·
   Schwanz und Stachel des Dalki.
   ========================================================================== */

/* ------------------------------------------------------------ Bausteine */
function palm3d(scene, x, z, h, seed) {
  const T = THREE, g = new T.Group(); g.position.set(x, 0, z); scene.add(g); const rnd = mulberry(seed);
  const lean = rnd() * 0.5 - 0.25, dir = rnd() * TAU; let px = 0, py = 0, pz = 0;
  for (let i = 0; i < 6; i++) {
    const nx = px + Math.cos(dir) * lean * 0.35 * i * 0.3, nz = pz + Math.sin(dir) * lean * 0.35 * i * 0.3, ny = py + h / 6;
    const s = new T.Mesh(fgeo('ptrunk', () => new T.CylinderGeometry(0.1, 0.13, 1, 7)), toonMat(i % 2 ? '#8a6a44' : '#7a5a38'));
    s.scale.y = h / 6 + 0.02; s.position.set((px + nx) / 2, (py + ny) / 2, (pz + nz) / 2); s.castShadow = true; addOutline(s, 0.01); g.add(s);
    px = nx; py = ny; pz = nz;
  }
  for (let k = 0; k < 7; k++) {
    const a = k / 7 * TAU + rnd(), f = new T.Mesh(fgeo('pfrond', () => { const sh = new T.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(0.6, 0.28, 1.5, -0.2); sh.quadraticCurveTo(0.7, -0.05, 0, 0); return new T.ShapeGeometry(sh, 6); }), toonMat(k % 2 ? '#3e7a32' : '#4e8a3a', { side: T.DoubleSide }));
    f.position.set(px, py, pz); f.rotation.set(-Math.PI / 2 + 0.35, 0, 0); f.rotation.order = 'YXZ'; f.rotation.y = a; f.castShadow = true; g.add(f);
  }
  r3Occluder(g, x - 1.2, x + 1.2, z - 1.2, z + 1.2, h + 0.6);
  return g;
}
function dune(scene, x, z, rx, ry, rz, col) {
  const m = new THREE.Mesh(fgeo('dune', () => new THREE.SphereGeometry(1, 20, 10, 0, TAU, 0, Math.PI / 2)), toonMat(col));
  m.scale.set(rx, ry, rz); m.position.set(x, -0.02, z); m.receiveShadow = true; scene.add(m); return m;
}
function shrub(scene, x, z, seed) {
  const T = THREE, rnd = mulberry(seed);
  for (let k = 0; k < 6; k++) { const c = new T.Mesh(fgeo('shrub', () => new T.ConeGeometry(0.03, 0.5, 4)), toonMat('#8a8a4a')); c.position.set(x, 0.2, z); c.rotation.set(rnd() - 0.5, 0, rnd() - 0.5); scene.add(c); }
}
// Stimmung umschalten: Tag in greller Sonne, Nacht, Schattenleere
const MOOD7 = {
  day: { bg: '#f4d6a0', fog: '#f0d0a0', f0: 22, f1: 60, sky: '#fff0d0', gnd: '#b08a58', hemi: 1.25, sun: '#fff0c8', si: 3.4 },
  night: { bg: '#0e1428', fog: '#121a30', f0: 16, f1: 46, sky: '#6a7ab8', gnd: '#2a2230', hemi: 0.9, sun: '#b8c8f0', si: 1.3 },
  leere: { bg: '#1e0c38', fog: '#2a1248', f0: 12, f1: 38, sky: '#8a6af0', gnd: '#20104a', hemi: 1.1, sun: '#a890ff', si: 1.1 }
};
function mood7(mode) {
  const E = R3.e7; if (!E || E.mode === mode) return; E.mode = mode;
  const M = MOOD7[mode];
  E.scene.background = new THREE.Color(M.bg); E.scene.fog.color.set(M.fog); E.scene.fog.near = M.f0; E.scene.fog.far = M.f1;
  E.hemi.color.set(M.sky); E.hemi.groundColor.set(M.gnd); E.hemi.intensity = M.hemi;
  E.sun.color.set(M.sun); E.sun.intensity = M.si;
  E.stars.visible = mode !== 'day'; E.motes.material.color.set(mode === 'day' ? '#fff0c0' : mode === 'leere' ? '#c88aff' : '#bfd0ff');
}

/* ------------------------------------------------------------ Wueste von Caladi */
ARENA3D.wueste = function (A, scene) {
  const T = THREE, W = A.w * S3, H = A.h * S3, rnd = mulberry(A.seed || 71);
  const sand = noiseTex('#d8b07a', ['rgba(160,110,60,0.22)', 'rgba(255,240,200,0.25)', 'rgba(140,90,50,0.15)'], A.seed || 71, [(W + 60) / 4, (H + 60) / 4], (g) => { g.strokeStyle = 'rgba(150,100,50,0.28)'; g.lineWidth = 2; for (let y = 20; y < 256; y += 40) { g.beginPath(); for (let x = 0; x <= 256; x += 8) g.lineTo(x, y + Math.sin(x * 0.05 + y) * 6); g.stroke(); } });
  groundPlane(scene, W + 60, H + 60, sand, { std: true, rough: 0.95 }).position.set(W / 2, 0, H / 2);
  // Duenen ringsum und am Horizont
  const dc = ['#d0a26a', '#c8985e', '#dcae74'];
  for (let z = -4; z < H + 10; z += 5) { dune(scene, -5 - rnd() * 3, z, 4 + rnd() * 3, 1.2 + rnd() * 1.6, 3 + rnd() * 2, dc[Math.floor(rnd() * 3)]); dune(scene, W + 5 + rnd() * 3, z, 4 + rnd() * 3, 1.2 + rnd() * 1.6, 3 + rnd() * 2, dc[Math.floor(rnd() * 3)]); }
  for (let i = 0; i < 12; i++) dune(scene, -30 + i * 6 + rnd() * 3, -6 - rnd() * 20, 6 + rnd() * 6, 1.5 + rnd() * 3.5, 4 + rnd() * 3, dc[i % 3]);
  // Oase
  if (A.oase) {
    const [ox, oz] = [A.oase[0] * S3, A.oase[1] * S3];
    const gr = new T.Mesh(fgeo('ograss', () => new T.CircleGeometry(1, 40)), toonMat('#6a8a4a')); gr.rotation.x = -Math.PI / 2; gr.scale.set(2.2, 1.1, 1); gr.position.set(ox, 0.01, oz); gr.receiveShadow = true; scene.add(gr);
    const wa = new T.Mesh(fgeo('owater', () => new T.CircleGeometry(1, 40)), new T.MeshStandardMaterial({ color: '#3a8ac0', roughness: 0.08, metalness: 0.3, emissive: new T.Color('#0a3050'), emissiveIntensity: 0.5 }));
    wa.rotation.x = -Math.PI / 2; wa.scale.set(1.55, 0.68, 1); wa.position.set(ox, 0.02, oz); scene.add(wa); R3.e7Water = wa;
    for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; const r = part(fgeo('orock', () => new T.DodecahedronGeometry(0.14, 0)), toonMat('#9a8a6a'), scene, ox + Math.cos(a) * 1.7, 0.05, oz + Math.sin(a) * 0.8); r.rotation.set(a, a * 2, 0); }
    palm3d(scene, ox - 2.6, oz - 0.6, 3.4, 1); palm3d(scene, ox + 2.5, oz - 0.9, 3.8, 2); palm3d(scene, ox + 1.2, oz - 1.6, 3.0, 3);
  }
  // Mauerreste oder das verlassene Brunnenhaus an den Hindernissen
  for (const b of A.blocks || []) {
    const g = new T.Group(); scene.add(g);
    const bx = (b.x + b.w / 2) * S3, bz = (b.y + b.h / 2) * S3, bw = b.w * S3, bd = b.h * S3;
    if (A.brunnen) {
      box3(g, bw, 1.9, bd, '#b89468', bx, 0.95, bz); box3(g, bw + 0.3, 0.14, bd + 0.3, '#8a6a48', bx, 1.95, bz);
      const door = new T.Mesh(fgeo('bhdoor', () => new T.PlaneGeometry(0.6, 1.1)), new T.MeshBasicMaterial({ color: '#2a1a10' })); door.position.set(bx + bw * 0.2, 0.55, bz + bd / 2 + 0.01); g.add(door);
      const win = new T.Mesh(fgeo('bhwin', () => new T.PlaneGeometry(0.35, 0.3)), new T.MeshBasicMaterial({ color: '#2a1a10' })); win.position.set(bx - bw * 0.25, 1.2, bz + bd / 2 + 0.01); g.add(win);
      for (let k = 0; k < 5; k++) part(fgeo('bhbeam', () => new T.CylinderGeometry(0.04, 0.04, 0.5, 5)), toonMat('#5a4028'), g, bx - bw / 2 + 0.2 + k * (bw - 0.4) / 4, 1.85, bz + bd / 2 + 0.2, true).rotation.x = Math.PI / 2;
      r3Occluder(g, bx - bw / 2, bx + bw / 2, bz - bd / 2, bz + bd / 2, 2.2);
    } else {
      const r = mulberry(b.x + 5);
      box3(g, bw, 0.8, bd * 0.6, '#b89468', bx, 0.4, bz);
      for (let k = 0; k < 3; k++) { const w = bw * (0.2 + r() * 0.3); box3(g, w, 0.3 + r() * 0.6, bd * 0.6, '#c8a47a', bx - bw / 2 + w / 2 + r() * (bw - w), 0.95, bz, { noOutline: true }); }
      rubblePile(g, bx + bw * 0.6, bz + 0.3, 5, '#b89468', b.y);
      r3Occluder(g, bx - bw / 2, bx + bw / 2, bz - bd / 2, bz + bd / 2, 1.8);
    }
  }
  if (A.brunnen) {
    const [wx, wz] = [A.brunnen[0] * S3, A.brunnen[1] * S3];
    part(fgeo('well', () => new T.CylinderGeometry(0.5, 0.55, 0.6, 18, 1, true)), toonMat('#8a7a64', { side: T.DoubleSide }), scene, wx, 0.3, wz);
    part(fgeo('wellrim', () => new T.TorusGeometry(0.52, 0.07, 6, 20)), toonMat('#a8987e'), scene, wx, 0.6, wz).rotation.x = Math.PI / 2;
    const hole = new T.Mesh(fgeo('wellhole', () => new T.CircleGeometry(0.48, 18)), new T.MeshBasicMaterial({ color: '#0e0a08' })); hole.rotation.x = -Math.PI / 2; hole.position.set(wx, 0.4, wz); scene.add(hole);
    for (const s of [-1, 1]) part(fgeo('wpost', () => new T.CylinderGeometry(0.05, 0.05, 1.5, 6)), toonMat('#5a4028'), scene, wx + s * 0.55, 0.75, wz);
    part(fgeo('wbeam', () => new T.CylinderGeometry(0.04, 0.04, 1.2, 6)), toonMat('#5a4028'), scene, wx, 1.45, wz).rotation.z = Math.PI / 2;
    part(fgeo('bucket', () => new T.CylinderGeometry(0.1, 0.08, 0.16, 10)), toonMat('#6a5038'), scene, wx + 0.1, 1.0, wz);
  }
  // Knochen einer grossen Bestie, Steine, Straeucher
  const bx0 = W * (0.15 + rnd() * 0.7), bz0 = H * (0.3 + rnd() * 0.4);
  for (let k = 0; k < 6; k++) { const rib = part(fgeo('rib', () => new T.TorusGeometry(0.6, 0.05, 5, 14, Math.PI * 0.8)), toonMat('#ece4d0'), scene, bx0 + k * 0.32, 0, bz0, true); rib.rotation.set(0, Math.PI / 2, Math.PI * 0.1); }
  for (let i = 0; i < 10; i++) { const r = part(fgeo('drock', () => new T.DodecahedronGeometry(1, 0)), toonMat(i % 2 ? '#a0845e' : '#8a7050'), scene, rnd() * W, 0.05, rnd() * H); const s = 0.1 + rnd() * 0.25; r.scale.set(s * 1.3, s * 0.7, s); r.rotation.set(rnd() * 3, rnd() * 3, 0); }
  for (let i = 0; i < 7; i++) shrub(scene, rnd() * W, rnd() * H, 90 + i);
  // Licht (wird bei Tag/Nacht/Leere umgestellt)
  scene.fog = new T.Fog('#f0d0a0', 22, 60);
  const hemi = new T.HemisphereLight('#fff0d0', '#b08a58', 1.25); scene.add(hemi);
  const sun = sunLight(scene, W / 2, H / 2, 18, '#fff0c8', 3.4, [6, 22, -4]);
  const n = 300, pos = new Float32Array(n * 3), r2 = mulberry(7);
  for (let i = 0; i < n; i++) { pos[i * 3] = W / 2 + (r2() - 0.5) * 160; pos[i * 3 + 1] = 3 + r2() * 40; pos[i * 3 + 2] = -40 - r2() * 40; }
  const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pos, 3));
  const stars = new T.Points(pg, new T.PointsMaterial({ size: 0.4, color: '#ffffff', fog: false, transparent: true, opacity: 0.8 })); scene.add(stars);
  e6Motes(scene, W, H, '#fff0c0', 200);
  R3.e7 = { scene, hemi, sun, stars, motes: R3.motes, mode: null };
  mood7(A.leere ? 'leere' : A.night ? 'night' : 'day');
};

/* ------------------------------------------------------------ Zahnwurm */
function buildWurm(e) {
  const T = THREE, root = new T.Group(), S = PartSet();
  const hole = new T.Mesh(fgeo('whole2', () => new T.CircleGeometry(0.45, 20)), new T.MeshBasicMaterial({ color: '#4a3018', transparent: true, opacity: 0.8 })); hole.rotation.x = -Math.PI / 2; hole.position.y = 0.015; root.add(hole);
  for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, m = part(fgeo('wmound', () => new T.DodecahedronGeometry(0.14, 0)), toonMat('#c8a06a'), root, Math.cos(a) * 0.48, 0.04, Math.sin(a) * 0.48, true); m.scale.y = 0.5; }
  const body = grp(root), segs = [];
  for (let i = 0; i < 6; i++) {
    const s = grp(body), r = 0.27 - i * 0.02;
    addP(S, s, bSph(), i % 2 ? '#c89a7a' : '#b8866a', 0, 0, 0, 0, 0, 0, r, 0.2, r);
    addP(S, s, fgeo('wring', () => new T.TorusGeometry(1, 0.03, 5, 16)), '#8a5a44', 0, 0.02, 0, Math.PI / 2, 0, 0, r * 0.98, r * 0.98, 1);
    segs.push(s);
  }
  const head = grp(body);
  addP(S, head, fgeo('wlip', () => new T.TorusGeometry(0.19, 0.07, 8, 18)), '#b8866a', 0, 0, 0, Math.PI / 2, 0, 0);
  for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; addP(S, head, bCone(), '#f0e8d8', Math.cos(a) * 0.15, 0.03, Math.sin(a) * 0.15, 0, 0, 0, 0.025, 0.1, 0.025); }
  bakeSet(S, beastMat('#ffd0a0'), 0.01);
  const maw = new T.Mesh(fgeo('wmaw', () => new T.CircleGeometry(0.16, 16)), new T.MeshBasicMaterial({ color: '#3a0a0a' })); maw.rotation.x = -Math.PI / 2; maw.position.y = 0.01; head.add(maw);
  const st = { up: 0 };
  return {
    root, update(e) {
      const dt = beastDt(st), tg = e.target || G.player, asleep = typeof ratAsleep === 'function' && ratAsleep(e);
      const want = e.state === 'down' ? 0 : e.state === 'wind' || e.state === 'active' ? 1 : asleep ? 0.12 : 0.5 + Math.sin(G.t * 2 + e.id) * 0.08;
      st.up = lerpA(st.up, want, 1 - Math.exp(-dt * (want > st.up ? 10 : 4)));
      const h = 0.15 + st.up * 1.25, yaw = yawTo(e, tg), lean = st.up * (e.state === 'wind' ? -0.25 : e.state === 'active' ? 0.5 : 0.12), sw = Math.sin(G.t * 3 + e.id) * 0.1 * st.up;
      body.rotation.y = yaw;
      segs.forEach((s, i) => { const k = i / 5; s.position.set(sw * k, h * k, lean * k * k); s.visible = h * k > 0.02 || i === 0; });
      head.position.set(sw, h + 0.12, lean + 0.02); head.rotation.x = 0.4 + lean * 0.8 + (e.state === 'wind' ? 0.5 : 0);
      body.visible = !(e.state === 'down' && e.stateT > 0.8);
      hole.scale.setScalar(0.8 + st.up * 0.4 + (asleep ? Math.sin(G.t * 4 + e.id) * 0.05 : 0));
    }
  };
}

/* ------------------------------------------------------------ Fluegelechse */
function buildEchse(e) {
  const T = THREE, root = new T.Group(), S = PartSet(), body = grp(root, 0, 0.4, 0);
  addP(S, body, bSph(), '#a8783a', 0, 0, 0, 0, 0, 0, 0.24, 0.2, 0.46);
  addP(S, body, bSph(), '#f0d8a8', 0, -0.08, 0.04, 0, 0, 0, 0.19, 0.12, 0.38);
  for (let k = 0; k < 5; k++) addP(S, body, bCone(), '#6a4420', 0, 0.18, -0.25 + k * 0.12, -0.4, 0, 0, 0.03, 0.1, 0.03);
  const head = grp(body, 0, 0.12, 0.44);
  addP(S, head, bSph(), '#9a6a30', 0, 0, 0, 0, 0, 0, 0.13, 0.11, 0.17);
  addP(S, head, bCone(), '#8a5a28', 0, -0.02, 0.2, Math.PI / 2, 0, 0, 0.08, 0.24, 0.06);
  for (const s of [-1, 1]) addP(S, head, bCone(), '#5a3a18', s * 0.07, 0.1, -0.08, -0.8, 0, -s * 0.3, 0.025, 0.14, 0.025);
  const legs = [];
  for (const [x, z] of [[-0.17, 0.24], [0.17, 0.24], [-0.17, -0.22], [0.17, -0.22]]) {
    const hip = grp(body, x, -0.08, z);
    addSeg(S, hip, [0, 0.02, 0], [x * 0.6, -0.2, 0.03], 0.06, 0.04, '#8a5a28');
    addSeg(S, hip, [x * 0.6, -0.2, 0.03], [x * 0.6, -0.32, 0.1], 0.035, 0.02, '#6a4420');
    legs.push({ hip, o: legs.length % 3 ? Math.PI : 0 });
  }
  const tail = []; let t = grp(body, 0, 0.02, -0.42);
  for (let i = 0; i < 6; i++) { const s = i ? grp(t, 0, 0, -0.14) : t; addSeg(S, s, [0, 0, 0], [0, 0, -0.15], 0.07 * (1 - i * 0.14), 0.07 * (1 - (i + 1) * 0.14), '#8a5a28', 6); tail.push(s); t = s; }
  bakeSet(S, beastMat('#ffd080'), 0.009);
  const eyes = [beastEye(head, -0.08, 0.04, 0.08, 0.022, '#ffd040'), beastEye(head, 0.08, 0.04, 0.08, 0.022, '#ffd040')];
  // Fluegel: gefaltet vorn als Panzer, sonst ausgebreitet
  const wingGeo = fgeo('ewing', () => { const sh = new T.Shape(); sh.moveTo(0, 0); sh.lineTo(0.45, 0.35); sh.lineTo(0.95, 0.3); sh.lineTo(0.8, 0.05); sh.lineTo(0.95, -0.15); sh.lineTo(0.55, -0.12); sh.lineTo(0.5, -0.35); sh.lineTo(0.2, -0.2); sh.lineTo(0, -0.1); return new T.ShapeGeometry(sh); });
  const wmat = toonMat('#7a4628', { side: T.DoubleSide, transparent: true, opacity: 0.95 });
  const wings = [-1, 1].map((s) => {
    const g = grp(body, s * 0.16, 0.14, 0.12); const m = new T.Mesh(wingGeo, wmat); m.scale.x = s; m.rotation.x = -Math.PI / 2; m.castShadow = true; addOutline(m, 0.008); g.add(m);
    const bone = new T.Mesh(fgeo('ewbone', () => new T.CylinderGeometry(0.018, 0.012, 1, 5)), toonMat('#3a2210')); bone.scale.y = 0.95; bone.rotation.z = -s * Math.PI / 2; bone.position.x = s * 0.47; bone.position.z = -0.3; g.add(bone);
    return { g, s };
  });
  const st = {};
  return {
    root, update(e) {
      const dt = beastDt(st), down = e.state === 'down', asleep = typeof ratAsleep === 'function' && ratAsleep(e) && !down;
      const run = e.anim.run || 0, ph = e.anim.phase || 0, tg = e.target || G.player, act = e.state === 'active';
      if (!down && !asleep) beastYaw(st, e, e.hardDir !== undefined && !act ? Math.atan2(Math.cos(e.hardDir), Math.sin(e.hardDir)) : yawTo(e, tg), dt, act ? 16 : 9);
      if (st.yaw === undefined) st.yaw = rand(0, TAU);
      root.rotation.y = st.yaw;
      const shield = !asleep && e.state !== 'stagger' && !down && !act, w = e.state === 'wind' && e.atk ? Math.min(1, e.stateT / e.atk.wind) : 0;
      const flap = Math.sin(G.t * 16);
      wings.forEach(({ g, s }) => {
        if (shield) { g.rotation.set(0.1, -s * 1.35, -s * 0.25); }
        else if (asleep) { g.rotation.set(0, s * 0.2, -s * 0.6); }
        else { g.rotation.set(0, s * 0.15, s * (act ? 0.2 + flap * 0.6 : down ? -0.3 : 0.3 + flap * 0.2)); }
      });
      for (const L of legs) L.hip.rotation.x = act ? 0.8 : Math.sin(ph + L.o) * 0.7 * run;
      body.position.y = 0.4 + (act ? 0.5 : 0) - w * 0.08 - (asleep ? 0.12 : 0);
      body.rotation.x = act ? 0.25 : w * 0.15;
      head.rotation.x = asleep ? 0.4 : -w * 0.3;
      tail.forEach((s, i) => { s.rotation.y = Math.sin(G.t * 4 - i * 0.7) * 0.18; s.rotation.x = i ? 0.02 : -0.1; });
      root.rotation.z = down ? Math.min(1, e.stateT * 3) * 1.4 : e.state === 'stagger' ? Math.sin(G.t * 16) * 0.12 : 0;
      for (const E of eyes) E.gl.material.opacity = down ? 0 : asleep ? 0.1 : 0.6;
    }
  };
}
Object.assign(OBJ3D, { zahnwurm: buildWurm, echse: buildEchse });

/* ------------------------------------------------------------ Schirm, Dalki, Stimmung */
const _r3ExtrasE7 = r3Extras;
r3Extras = function (e, R, rdt) {
  _r3ExtrasE7(e, R, rdt);
  if (e === G.player && R3.e7) {
    mood7(G.arena.leere ? 'leere' : G.arena.night ? 'night' : 'day');
    if (R3.e7Water) R3.e7Water.material.emissiveIntensity = 0.4 + Math.sin(G.t * 1.5) * 0.15;
  }
  // Laylas Schirm ueber Quinn: wirft echten Schatten
  if (e.char === 'quinn') {
    const umb = (G.arena.shade || []).some((r) => r.umb);
    if (umb && !R.umb) {
      const T = THREE, g = new T.Group(); g.position.set(0.1, 2.25, 0.05); g.rotation.z = -0.12;
      const can = new T.Mesh(fgeo('umbc', () => new T.ConeGeometry(0.8, 0.32, 12, 1, true)), toonMat('#4a3a5e', { side: T.DoubleSide, transparent: true, opacity: 0.5, depthWrite: false })); can.castShadow = true; g.add(can);
      const pole = new T.Mesh(fgeo('umbp', () => new T.CylinderGeometry(0.015, 0.015, 1.1, 6)), toonMat('#1a1a1e')); pole.position.y = -0.5; g.add(pole);
      const rim = new T.Mesh(fgeo('umbr', () => new T.TorusGeometry(0.8, 0.015, 4, 24)), toonMat('#c8a0ff')); rim.rotation.x = Math.PI / 2; rim.position.y = -0.16; g.add(rim);
      R.root.add(g); R.umb = g;
    }
    if (R.umb) { R.umb.visible = umb && e.state !== 'down'; R.umb.rotation.x = Math.sin(G.t * 1.3) * 0.05; }
  }
  // Dalki: Schwanz und der eine Stachel
  const L = LOOKS[R.look];
  if (L && L.tail && !R.tail7) {
    const T = THREE; R.tail7 = []; let t = grp(R.hips, 0, -0.02, -0.12);
    for (let i = 0; i < 7; i++) { const s = i ? grp(t, 0, 0, -0.13) : t; const m = new T.Mesh(fgeo('dtail' + i, () => { const g = new T.CylinderGeometry(0.045 * (1 - (i + 1) * 0.11), 0.045 * (1 - i * 0.11), 0.14, 6); g.rotateX(Math.PI / 2); g.translate(0, 0, -0.07); return g; }), toonMat(L.tail)); addOutline(m, 0.006); s.add(m); R.tail7.push(s); t = s; }
    const tip = new T.Mesh(fgeo('dtip', () => { const g = new T.ConeGeometry(0.03, 0.14, 5); g.rotateX(-Math.PI / 2); g.translate(0, 0, -0.07); return g; }), toonMat('#e8e0c8')); t.add(tip); tip.position.z = -0.13;
    if (L.spikes) { const sp = new T.Mesh(fgeo('dspike', () => new T.ConeGeometry(0.05, 0.34, 6)), toonMat('#e8e0c8')); sp.position.set(0, 0.2, -0.13); sp.rotation.x = -0.7; addOutline(sp, 0.008); R.chest.add(sp); }
  }
  if (R.tail7) R.tail7.forEach((s, i) => { s.rotation.x = i ? 0.1 : 0.5 + (e.state === 'wind' ? -0.3 : 0); s.rotation.y = Math.sin(G.t * 4 - i * 0.6) * (0.12 + (e.anim.run || 0) * 0.1); });
};
