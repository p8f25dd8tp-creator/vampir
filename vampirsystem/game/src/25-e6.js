'use strict';
/* ==========================================================================
   ETAPPE 6 in 3D (eigene Gestaltung)
   Der rote Planet: ewige Nacht, zwei Monde, verfallene Menschenstadt ·
   Treppenhaus in der Ruine · Hangar des Militaerlagers mit Nest ·
   Trainings-Dom mit Mech-Wracks · Rattenkrallen, Scordana und Eier als
   eigene 3D-Bestien.
   ========================================================================== */

/* ------------------------------------------------------------ Bausteine */
// Zylinder zwischen zwei Punkten in eine PartSet legen (Beine, Schwanz, Arme)
function addSeg(S, bone, a, b, r0, r1, col, seg) {
  const T = THREE, A = new T.Vector3(a[0], a[1], a[2]), d = new T.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), len = d.length();
  const geom = fgeo(`sg${r0}_${r1}_${len.toFixed(2)}_${seg || 8}`, () => new T.CylinderGeometry(r1, r0, len, seg || 8));
  const m = new T.Object3D(); m.position.copy(A).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); m.updateMatrix();
  if (!S.has(bone)) S.set(bone, []);
  S.get(bone).push({ geom, col: new T.Color(col), mat: m.matrix.clone() });
}
function beastMat(rim) { const m = rimToon({ vertexColors: true }, rim); m.userData.own = true; return m; }
const bSph = () => fgeo('bsph', () => new THREE.SphereGeometry(1, 16, 12));
const bCone = () => fgeo('bcone', () => new THREE.ConeGeometry(1, 1, 7));
function beastEye(parent, x, y, z, r, col) {
  const m = new THREE.Mesh(fgeo('beye', () => new THREE.SphereGeometry(1, 10, 8)), new THREE.MeshBasicMaterial({ color: col }));
  m.scale.setScalar(r); m.position.set(x, y, z); parent.add(m);
  const gl = glowSprite3(col, r * 4.5, 0.6); gl.position.set(x, y, z + r); parent.add(gl);
  return { m, gl };
}
function beastDt(o) { const d = clamp(G.t - (o.lt === undefined ? G.t : o.lt), 0, 0.05); o.lt = G.t; return d; }
function beastYaw(o, e, want, dt, rate) { if (o.yaw === undefined) o.yaw = want; o.yaw += angDiff(o.yaw, want) * (1 - Math.exp(-dt * rate)); return o.yaw; }
function yawTo(e, t) { return Math.atan2(t.x - e.x, t.y - e.y); }

/* ------------------------------------------------------------ Rattenkralle */
function buildRat(e) {
  const T = THREE, root = new T.Group(), S = PartSet();
  const body = grp(root, 0, 0.42, 0), head = grp(body, 0, 0.1, 0.4), jaw = grp(head, 0, -0.05, 0.06), tail = grp(body, 0, 0.06, -0.38);
  addP(S, body, bSph(), '#6e5a50', 0, 0, 0, 0, 0, 0, 0.26, 0.25, 0.42);
  addP(S, body, bSph(), '#6e5a50', 0, 0.03, 0.22, 0, 0, 0, 0.23, 0.24, 0.22);
  addP(S, body, bSph(), '#3e302c', 0, -0.07, 0.04, 0, 0, 0, 0.2, 0.16, 0.36);
  for (let k = 0; k < 6; k++) addP(S, body, bCone(), '#1a1210', 0, 0.2 + Math.sin(k / 5 * Math.PI) * 0.03, -0.3 + k * 0.1, -0.55, 0, 0, 0.035, 0.13 + (k % 2) * 0.05, 0.035);
  addP(S, head, bSph(), '#66524a', 0, 0, 0, 0, 0, 0, 0.18, 0.16, 0.19);
  addP(S, head, bCone(), '#4a3a36', 0, 0.0, 0.2, Math.PI / 2, 0, 0, 0.08, 0.24, 0.07);
  addP(S, head, bSph(), '#1a1010', 0, 0.0, 0.32, 0, 0, 0, 0.025, 0.02, 0.02);
  for (const s of [-1, 1]) {
    addP(S, head, bCone(), '#6a4a4a', s * 0.08, 0.13, -0.05, -0.2, 0, -s * 0.35, 0.045, 0.12, 0.03);
    addP(S, head, bCone(), '#e8e0d0', s * 0.03, -0.06, 0.22, Math.PI, 0, 0, 0.012, 0.05, 0.012);
  }
  addP(S, jaw, bCone(), '#3a2a26', 0, 0, 0.12, Math.PI / 2, 0, 0, 0.055, 0.18, 0.04);
  const legs = [];
  for (const [x, z, front] of [[-0.15, 0.24, 1], [0.15, 0.24, 1], [-0.15, -0.24, 0], [0.15, -0.24, 0]]) {
    const hip = grp(body, x, -0.1, z), knee = grp(hip, 0, -0.17, front ? 0.03 : -0.04);
    addSeg(S, hip, [0, 0.04, 0], [0, -0.17, front ? 0.03 : -0.04], 0.08, 0.055, '#5a463e');
    addSeg(S, knee, [0, 0, 0], [0, -0.16, 0.03], 0.05, 0.035, '#2a1e1c');
    if (front) for (let c = -1; c <= 1; c++) addP(S, knee, bCone(), '#f0e8d8', c * 0.02, -0.16, 0.08, Math.PI / 2 + 0.3, 0, 0, 0.01, 0.07, 0.01);
    legs.push({ hip, knee, o: (legs.length === 0 || legs.length === 3) ? 0 : Math.PI });
  }
  const segs = []; let t = tail;
  for (let i = 0; i < 6; i++) {
    const s = i ? grp(t, 0, 0, -0.12) : t;
    addSeg(S, s, [0, 0, 0], [0, 0, -0.13], 0.03 * (1 - i * 0.12), 0.03 * (1 - (i + 1) * 0.12), '#8a6a6a', 6);
    segs.push(s); t = s;
  }
  bakeSet(S, beastMat('#ff6a5a'), 0.008);
  const eyes = [beastEye(head, -0.07, 0.05, 0.11, 0.025, '#ff3a3a'), beastEye(head, 0.07, 0.05, 0.11, 0.025, '#ff3a3a')];
  const st = { yaw: rand(0, TAU) };
  return {
    root, update(e) {
      const dt = beastDt(st), down = e.state === 'down', asleep = typeof ratAsleep === 'function' && ratAsleep(e) && !down;
      const tg = e.target || G.player, run = e.anim.run || 0, ph = e.anim.phase || 0;
      if (!down && !asleep) beastYaw(st, e, (e.state === 'active' && Math.hypot(e.vx, e.vy) > 30) ? Math.atan2(e.vx, e.vy) : yawTo(e, tg), dt, e.state === 'wind' ? 14 : 8);
      root.rotation.y = st.yaw;
      const wind = e.state === 'wind' && e.atk ? Math.min(1, e.stateT / e.atk.wind) : 0, act = e.state === 'active' ? 1 : 0;
      for (const L of legs) {
        const s = Math.sin(ph + L.o);
        L.hip.rotation.x = act ? (L.o ? -0.9 : 0.9) : s * 0.75 * run + (asleep ? 1.2 : 0) - wind * 0.3;
        L.knee.rotation.x = act ? 0.2 : Math.max(0, -Math.cos(ph + L.o)) * 0.9 * run - (asleep ? 1.6 : 0) + wind * 0.5;
      }
      body.position.y = 0.42 - wind * 0.1 - (asleep ? 0.24 : 0) + Math.abs(Math.sin(ph)) * 0.035 * run + (act ? 0.08 : 0) + (asleep ? Math.sin(G.t * 2 + e.id) * 0.01 : 0);
      body.position.z = -wind * 0.08;
      body.rotation.x = wind * 0.18 - act * 0.22;
      head.rotation.x = asleep ? 0.45 : -wind * 0.35 + Math.sin(G.t * 3 + e.id) * 0.04 * (1 - run);
      head.rotation.y = asleep ? 0 : Math.sin(G.t * 1.3 + e.id) * 0.2 * (1 - run) * (1 - wind);
      jaw.rotation.x = wind * 0.5 + act * 0.7 + (e.state === 'hurt' ? 0.4 : 0);
      segs.forEach((s, i) => { s.rotation.x = i ? -0.1 : 0.35; s.rotation.y = Math.sin(G.t * (asleep ? 2 : 7) - i * 0.8) * (asleep ? 0.1 : 0.22 + run * 0.1); });
      root.rotation.z = down ? Math.min(1, e.stateT * 3) * 1.45 : e.state === 'stagger' ? Math.sin(G.t * 16) * 0.12 : 0;
      for (const E of eyes) { E.m.scale.y = asleep ? 0.006 : 0.025; E.gl.material.opacity = down ? 0 : asleep ? 0.12 : 0.75; }
    }
  };
}

/* ------------------------------------------------------------ Scordana */
function buildScordana(e) {
  const T = THREE, root = new T.Group(), S = PartSet(), body = grp(root, 0, 0, 0);
  const shell = '#5a5a40', dark = '#2e2e20', skin = '#9a7062', claw = '#4a4a30';
  // Unterleib aus Segmenten mit Rueckenplatten
  const segZ = [-1.2, -0.88, -0.56, -0.24, 0.06], segR = [0.28, 0.36, 0.42, 0.4, 0.34];
  segZ.forEach((z, i) => {
    addP(S, body, bSph(), shell, 0, 0.62, z, 0, 0, 0, segR[i] * 1.05, segR[i] * 0.72, 0.24);
    addP(S, body, bSph(), dark, 0, 0.5, z, 0, 0, 0, segR[i] * 0.9, segR[i] * 0.5, 0.22);
    addP(S, body, fgeo('bbox', () => new T.BoxGeometry(1, 1, 1)), '#6e6e50', 0, 0.62 + segR[i] * 0.68, z, 0, 0, 0, segR[i] * 1.2, 0.05, 0.16);
  });
  // sechs Beine
  const legs = [];
  for (const z of [-0.95, -0.55, -0.15]) for (const s of [-1, 1]) {
    const hip = grp(body, s * 0.3, 0.58, z);
    addSeg(S, hip, [0, 0, 0], [s * 0.55, 0.35, 0], 0.07, 0.05, dark);
    addSeg(S, hip, [s * 0.55, 0.35, 0], [s * 0.9, -0.58, 0.05], 0.05, 0.015, '#1a1612');
    legs.push({ hip, s, o: z * 3 + (s > 0 ? Math.PI : 0) });
  }
  // Stachelschwanz, rollt sich ueber den Ruecken
  const tail = []; let t = grp(body, 0, 0.72, -1.38);
  for (let i = 0; i < 8; i++) {
    const s = i ? grp(t, 0, 0.27, 0) : t, r = 0.15 * (1 - i * 0.07);
    addP(S, s, bSph(), i % 2 ? shell : '#4e4e36', 0, 0.13, 0, 0, 0, 0, r, 0.16, r);
    tail.push(s); t = s;
  }
  const tip = grp(t, 0, 0.3, 0);
  addP(S, tip, bSph(), '#6a6a48', 0, 0, 0, 0, 0, 0, 0.14, 0.17, 0.14);
  addP(S, tip, bCone(), '#d8d0a0', 0, 0.26, 0, 0, 0, 0, 0.05, 0.34, 0.05);
  // weicher Oberkoerper vorn
  const torso = grp(body, 0, 0.78, 0.36);
  addSeg(S, torso, [0, 0, 0], [0, 0.62, 0.06], 0.2, 0.17, skin, 12);
  addP(S, torso, bSph(), '#8a6456', 0, 0.5, 0.08, 0, 0, 0, 0.2, 0.14, 0.14);
  for (const s of [-1, 1]) addP(S, torso, bSph(), shell, s * 0.2, 0.56, 0.02, 0, 0, s * 0.4, 0.13, 0.08, 0.13);
  for (let k = 0; k < 3; k++) addP(S, torso, fgeo('bbox', () => new T.BoxGeometry(1, 1, 1)), '#6e5044', 0, 0.12 + k * 0.13, 0.17, 0, 0, 0, 0.2, 0.03, 0.05);
  addSeg(S, torso, [0, 0.6, 0.06], [0, 0.76, 0.08], 0.07, 0.06, '#8a6456');
  const head = grp(torso, 0, 0.88, 0.1);
  addP(S, head, bSph(), '#8a6456', 0, 0, 0, 0, 0, 0, 0.13, 0.16, 0.14);
  for (const s of [-1, 1]) addP(S, head, bCone(), '#d8d0a0', s * 0.05, -0.13, 0.1, Math.PI - 0.3, 0, s * 0.3, 0.02, 0.1, 0.02);
  for (const s of [-1, 1]) addP(S, head, bCone(), dark, s * 0.08, 0.16, -0.04, -0.4, 0, -s * 0.3, 0.035, 0.16, 0.035);
  // vier Scheren-Arme
  const arms = [];
  for (const [s, y] of [[-1, 0.5], [1, 0.5], [-1, 0.28], [1, 0.28]]) {
    const a = grp(torso, s * 0.22, y, 0.02);
    addSeg(S, a, [0, 0, 0], [s * 0.2, -0.06, 0.34], 0.06, 0.05, dark);
    addSeg(S, a, [s * 0.2, -0.06, 0.34], [s * 0.12, 0.12, 0.66], 0.05, 0.06, dark);
    addP(S, a, bCone(), claw, s * 0.1, 0.2, 0.84, 1.2, 0, 0, 0.07, 0.3, 0.05);
    addP(S, a, bCone(), claw, s * 0.13, 0.06, 0.82, 1.9, 0, 0, 0.05, 0.24, 0.04);
    arms.push({ a, s, k: arms.length });
  }
  bakeSet(S, beastMat('#d8e080'), 0.012);
  const eyes = [beastEye(head, -0.06, 0.03, 0.14, 0.03, '#ff4a3a'), beastEye(head, 0.06, 0.03, 0.14, 0.03, '#ff4a3a')];
  const sting = glowSprite3('#b8ff6a', 0.9, 0); sting.position.y = 0.5; tip.add(sting);
  // Exoskelett vorn: gleiches Blau wie jede andere gehaertete Seite
  const cg = new T.CylinderGeometry(1.0, 1.05, 1.4, 24, 1, true, -1.0, 2.0);
  const carapace = new T.Mesh(cg, new T.MeshStandardMaterial({ color: '#6a6a48', metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0.22, depthWrite: false, side: T.DoubleSide, emissive: new T.Color('#2a3a50') }));
  carapace.position.y = 0.75; root.add(carapace);
  const edge = new T.Mesh(new T.CylinderGeometry(1.04, 1.09, 1.44, 24, 1, true, -1.0, 2.0), new T.MeshBasicMaterial({ color: '#9ad8ff', transparent: true, opacity: 0.3, blending: T.AdditiveBlending, side: T.BackSide, depthWrite: false }));
  carapace.add(edge);
  const st = {};
  return {
    root, update(e) {
      const dt = beastDt(st), down = e.state === 'down', tg = e.target || G.player, run = e.anim.run || 0, ph = e.anim.phase || 0;
      if (!down) beastYaw(st, e, e.hardDir !== undefined ? Math.atan2(Math.cos(e.hardDir), Math.sin(e.hardDir)) : yawTo(e, tg), dt, 10);
      root.rotation.y = st.yaw;
      const w = e.state === 'wind' && e.atk ? Math.min(1, e.stateT / e.atk.wind) : 0, act = e.state === 'active';
      const sg = e.atk && e.atk.type === 'beam' ? (e.state === 'wind' ? w : act ? 1 : 0) : 0;
      const cl = e.atk && e.atk.type === 'swipe' ? (e.state === 'wind' ? w : act ? -1 : 0) : 0;
      for (const L of legs) { const s = Math.sin(ph * 1.3 + L.o); L.hip.rotation.y = s * 0.35 * run * L.s; L.hip.rotation.z = Math.max(0, Math.cos(ph * 1.3 + L.o)) * 0.25 * run * L.s; }
      tail.forEach((s, i) => { s.rotation.x = i ? 0.4 + sg * 0.1 + (act && sg ? 0.06 : 0) : -0.55 + sg * 0.35; s.rotation.z = Math.sin(G.t * 1.6 - i * 0.5) * 0.04; });
      sting.material.opacity = sg * 0.9; sting.scale.setScalar(0.6 + sg * 0.8);
      arms.forEach((A) => { A.a.rotation.x = cl > 0 ? -1.1 * cl : cl < 0 ? 0.7 : Math.sin(G.t * 2 + A.k) * 0.1; A.a.rotation.y = cl < 0 ? -A.s * 0.5 : Math.sin(G.t * 1.7 + A.k) * 0.06; });
      torso.rotation.x = -0.12 - (cl > 0 ? cl * 0.25 : 0) + (cl < 0 ? 0.25 : 0) + (e.state === 'hurt' ? -0.3 : 0);
      body.position.y = Math.abs(Math.sin(ph * 1.3)) * 0.03 * run - (down ? Math.min(1, e.stateT * 2) * 0.3 : 0);
      root.rotation.z = down ? Math.min(1, e.stateT * 2) * 0.5 : e.state === 'stagger' ? Math.sin(G.t * 12) * 0.08 : 0;
      carapace.visible = !down && e.state !== 'stagger';
      carapace.material.emissiveIntensity = 0.5 + Math.min(1, e.flash * 10) * 2; carapace.material.opacity = 0.18 + Math.min(1, e.flash * 10) * 0.5;
      for (const E of eyes) E.gl.material.opacity = down ? 0 : 0.8;
    }
  };
}

/* ------------------------------------------------------------ Scordana-Ei */
function buildEgg(e) {
  const T = THREE, root = new T.Group();
  const egg = part(fgeo('egg', () => { const g = new T.SphereGeometry(0.2, 16, 12); g.scale(1, 1.4, 1); return g; }), toonMat('#b8bc8a'), root, 0, 0.28, 0);
  const veins = new T.Mesh(fgeo('eggv', () => { const g = new T.SphereGeometry(0.205, 10, 8); g.scale(1, 1.4, 1); return g; }), new T.MeshBasicMaterial({ color: '#7a9a3a', wireframe: true, transparent: true, opacity: 0.35 }));
  egg.add(veins);
  const gl = glowSprite3('#b8ff6a', 0.7, 0.2); gl.position.y = 0.3; root.add(gl);
  const broken = new T.Group(); broken.visible = false; root.add(broken);
  const slime = new T.Mesh(fgeo('eslime', () => new T.CircleGeometry(0.36, 18)), new T.MeshBasicMaterial({ color: '#8ab84a', transparent: true, opacity: 0.6 }));
  slime.rotation.x = -Math.PI / 2; slime.position.y = 0.02; broken.add(slime);
  for (let k = 0; k < 3; k++) { const sh = part(fgeo('eshard', () => new T.SphereGeometry(0.2, 8, 6, 0, 1.6, 0, 1.2)), toonMat('#dfe4b0', { side: T.DoubleSide }), broken, Math.cos(k * 2.2) * 0.2, 0.06, Math.sin(k * 2.2) * 0.2, true); sh.rotation.set(2.4 + k * 0.4, k * 2.1, 0.3); }
  return {
    root, update(e) {
      const down = e.state === 'down', p = 0.5 + Math.sin(G.t * 3 + e.id) * 0.5;
      egg.visible = !down; broken.visible = down; gl.material.opacity = down ? 0 : 0.1 + p * 0.2;
      egg.scale.set(1 + p * 0.03, 1 - p * 0.02, 1 + p * 0.03); egg.rotation.z = e.flash > 0 ? Math.sin(G.t * 40) * 0.15 : 0;
    }
  };
}
Object.assign(OBJ3D, { rattaclaw: buildRat, scordana: buildScordana, ei: buildEgg });

/* ------------------------------------------------------------ Himmel des roten Planeten */
function twoMoons(scene, cx) {
  const T = THREE;
  const big = new T.Mesh(new T.CircleGeometry(9, 48), new T.MeshBasicMaterial({ color: '#e8c8b8', fog: false })); big.position.set(cx - 12, 3, -78); scene.add(big);
  const g1 = glowSprite3('#ffd8c8', 34, 0.25); g1.material.fog = false; g1.position.copy(big.position); scene.add(g1);
  for (let k = 0; k < 5; k++) { const c = new T.Mesh(new T.CircleGeometry(0.8 + k * 0.4, 20), new T.MeshBasicMaterial({ color: '#d0aea0', fog: false })); c.position.set(big.position.x - 4 + k * 2.2, big.position.y + 2 - (k % 3) * 2, -77.9); scene.add(c); }
  const red = new T.Mesh(new T.CircleGeometry(4, 40), new T.MeshBasicMaterial({ color: '#c86a5a', fog: false })); red.position.set(cx + 14, 2, -64); scene.add(red);
  const g2 = glowSprite3('#ff6a5a', 22, 0.4); g2.material.fog = false; g2.position.copy(red.position); scene.add(g2);
  const n = 260, pos = new Float32Array(n * 3), rnd = mulberry(66);
  for (let i = 0; i < n; i++) { pos[i * 3] = cx + (rnd() - 0.5) * 200; pos[i * 3 + 1] = 2 + rnd() * 50; pos[i * 3 + 2] = -60 - rnd() * 40; }
  const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pos, 3));
  scene.add(new T.Points(pg, new T.PointsMaterial({ size: 0.5, color: '#ffd8e0', fog: false, transparent: true, opacity: 0.7 })));
}
// Pfuetze, in der sich die beiden Monde spiegeln
function moonPuddle(scene, x, z, r) {
  const T = THREE, g = new T.Group(); g.position.set(x, 0.012, z); scene.add(g);
  const w = new T.Mesh(fgeo('puddle', () => new T.CircleGeometry(1, 28)), new T.MeshStandardMaterial({ color: '#120a14', roughness: 0.05, metalness: 0.6 }));
  w.rotation.x = -Math.PI / 2; w.scale.set(r, r * 0.6, 1); g.add(w);
  for (const [dx, dz, s, c] of [[-0.3, -0.1, 0.28, '#e8c8b8'], [0.35, 0.05, 0.14, '#c86a5a']]) {
    const m = new T.Mesh(fgeo('pmoon', () => new T.CircleGeometry(1, 20)), new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.55 }));
    m.rotation.x = -Math.PI / 2; m.position.set(dx * r, 0.003, dz * r); m.scale.set(s * r, s * r * 0.6, 1); g.add(m);
  }
}
// verfallenes Hochhaus mit gezackter Kante und leeren Fenstern
function ruinTower(scene, x, z, w, d, h, seed, occ) {
  const T = THREE, g = new T.Group(); scene.add(g); const rnd = mulberry(seed);
  const col = rnd() < 0.5 ? '#2a2230' : '#322838';
  box3(g, w, h, d, col, x, h / 2, z, { noOutline: occ === false });
  for (let k = 0; k < 3; k++) { const bw = w * (0.2 + rnd() * 0.35), bh = 0.6 + rnd() * 1.8; box3(g, bw, bh, d * (0.5 + rnd() * 0.5), col, x - w / 2 + bw / 2 + rnd() * (w - bw), h + bh / 2, z, { noOutline: true }); }
  const dark = new T.MeshBasicMaterial({ color: '#0a060c' }), lit = new T.MeshBasicMaterial({ color: '#ff5a4a' });
  for (let y = 1.4; y < h - 0.6; y += 1.6) for (let wx = x - w / 2 + 0.6; wx < x + w / 2 - 0.4; wx += 1.1) {
    const r = rnd(); if (r < 0.12) continue;
    const m = new T.Mesh(fgeo('rwin', () => new T.PlaneGeometry(0.55, 0.8)), r > 0.97 ? lit : dark); m.position.set(wx, y, z + d / 2 + 0.01); g.add(m);
  }
  if (occ !== false) r3Occluder(g, x - w / 2, x + w / 2, z - d / 2, z + d / 2, h + 2);
  return g;
}
function rubblePile(scene, x, z, n, col, seed) {
  const T = THREE, rnd = mulberry(seed);
  for (let i = 0; i < n; i++) {
    const s = 0.07 + rnd() * 0.2, m = new T.Mesh(fgeo('rub', () => new T.DodecahedronGeometry(1, 0)), toonMat(shade(col, rnd() * 0.3 - 0.2)));
    m.scale.set(s * (0.8 + rnd() * 0.6), s * (0.5 + rnd() * 0.5), s); m.position.set(x + (rnd() - 0.5) * 1.2, s * 0.35, z + (rnd() - 0.5) * 0.8); m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
    m.castShadow = m.receiveShadow = true; scene.add(m);
  }
}
function e6Motes(scene, W, H, col, n) {
  const T = THREE, pos = new Float32Array(n * 3), rnd = mulberry(61);
  for (let i = 0; i < n; i++) { pos[i * 3] = rnd() * W; pos[i * 3 + 1] = 0.2 + rnd() * 2.8; pos[i * 3 + 2] = rnd() * H; }
  const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pos, 3));
  R3.motes = new T.Points(pg, new T.PointsMaterial({ size: 0.06, map: R3.glowTex, color: col, transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false })); scene.add(R3.motes);
}

/* ------------------------------------------------------------ Ruine: Treppenhaus eines halb eingestuerzten Hauses */
ARENA3D.ruine = function (A, scene) {
  const T = THREE, W = A.w * S3, H = A.h * S3, rnd = mulberry(21);
  const crack = (g, r) => { g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 1.5; for (let i = 0; i < 14; i++) { let x = r() * 256, y = r() * 256; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += r() * 40 - 20; y += r() * 40 - 20; g.lineTo(x, y); } g.stroke(); } };
  groundPlane(scene, W + 30, H + 30, noiseTex('#48424e', ['rgba(0,0,0,0.25)', 'rgba(255,220,230,0.06)', 'rgba(60,40,50,0.3)'], 21, [(W + 30) / 3, (H + 30) / 3], crack), { std: true, rough: 0.85 }).position.set(W / 2, 0, H / 2);
  // Hausboden (Fliesen) bis zur Vorderwand
  const zf = 232 * S3;
  const tiles = new T.Mesh(new T.PlaneGeometry(W, zf + 3), new T.MeshStandardMaterial({ map: floorTex('#5a5262', '#4c4656', 23, [W / 1.6, (zf + 3) / 1.6]), roughness: 0.7 }));
  tiles.rotation.x = -Math.PI / 2; tiles.position.set(W / 2, 0.005, (zf - 3) / 2); tiles.receiveShadow = true; scene.add(tiles);
  // Treppe: flache Stufenkanten im Kampfbereich, dahinter die echte Treppe nach oben
  const x0 = 96 * S3, x1 = 244 * S3, sw = x1 - x0;
  for (let k = 0; k < 7; k++) box3(scene, sw, 0.03, 20 * S3 - 0.02, shade('#5a5462', -k * 0.04), x0 + sw / 2, 0.015, (40 + k * 20 + 10) * S3, { noOutline: true, noCast: true });
  for (let k = 0; k < 9; k++) box3(scene, sw, 0.3 * (k + 1), 0.34, '#5a5462', x0 + sw / 2, 0.15 * (k + 1), 40 * S3 - 0.17 - k * 0.34, { noCast: true });
  box3(scene, sw + 0.8, 0.25, 2.0, '#4a4452', x0 + sw / 2, 2.9, 40 * S3 - 3.9);
  for (const x of [84 * S3, 244 * S3]) box3(scene, 12 * S3, 1.05, 172 * S3, '#1e1a22', x + 6 * S3, 0.52, (30 + 86) * S3);
  for (const x of [x0 - 0.1, x1 + 0.1]) for (let z = 1.6; z < 5.8; z += 0.7) part(fgeo('rail', () => new T.CylinderGeometry(0.02, 0.02, 0.5, 6)), toonMat('#4a4450'), scene, x, 1.3, z, true);
  // Hauswaende: seitlich, hinten, und die Vorderwand mit Tuerloch (Hindernisse der Kampflogik)
  const wall = '#5e5466', wallTop = '#7e7488';
  const ragged = (g, x, z, w, d, h, seed) => { const r = mulberry(seed); box3(g, w, h, d, wall, x, h / 2, z); for (let i = 0; i < 4; i++) { const bw = w * (0.12 + r() * 0.25), bh = 0.2 + r() * 0.9; box3(g, bw, bh, d, wall, x - w / 2 + bw / 2 + r() * (w - bw), h + bh / 2, z, { noOutline: true }); } box3(g, w, 0.08, d + 0.04, wallTop, x, h, z, { noOutline: true }); };
  const back = new T.Group(); scene.add(back); ragged(back, W / 2, -5.2, W + 0.6, 0.4, 6.2, 3);
  for (const x of [-0.2, W + 0.2]) { const s = new T.Group(); scene.add(s); ragged(s, x, (zf - 5.4) / 2, 0.4, zf + 5.4, 4.4, x > 1 ? 5 : 4); }
  box3(scene, W * 0.55, 0.3, 3.4, '#3a3440', W * 0.3, 3.6, -3.4); // Rest der oberen Etage
  rubblePile(scene, W * 0.78, -1.2, 10, '#5a5260', 7);
  for (const b of A.blocks) {
    const fg = new T.Group(); scene.add(fg);
    const bx = (b.x + b.w / 2) * S3, bz = (b.y + b.h / 2) * S3, bw = b.w * S3, bd = b.h * S3;
    ragged(fg, bx, bz, bw, bd, 1.7, b.x + 11);
    const hole = new T.Mesh(fgeo('whole', () => new T.PlaneGeometry(0.9, 0.8)), new T.MeshBasicMaterial({ color: '#0a060c' })); hole.position.set(bx, 1.1, bz + bd / 2 + 0.01); fg.add(hole);
    r3Occluder(fg, bx - bw / 2, bx + bw / 2, bz - bd / 2, bz + bd / 2, 3.6);
  }
  // Strasse: Truemmer, Autowrack, geknickte Laternen, Pfuetzen
  for (let i = 0; i < 12; i++) rubblePile(scene, rnd() * W, (260 + rnd() * (A.h - 280)) * S3, 5, '#5a5260', 30 + i);
  const car = new T.Group(); car.position.set(70 * S3, 0, 432 * S3); car.rotation.y = 0.25; scene.add(car);
  box3(car, 1.9, 0.55, 0.95, '#3a2a2a', 0, 0.42, 0); box3(car, 1.0, 0.4, 0.85, '#2a1e1e', -0.1, 0.88, 0);
  for (const [x, z] of [[-0.6, 0.48], [0.6, 0.48], [-0.6, -0.48], [0.6, -0.48]]) part(fgeo('cwheel', () => new T.CylinderGeometry(0.2, 0.2, 0.14, 12)), toonMat('#141014'), car, x, 0.12, z, true).rotation.x = Math.PI / 2;
  const glass = new T.Mesh(fgeo('cglass', () => new T.PlaneGeometry(0.8, 0.32)), new T.MeshBasicMaterial({ color: '#2a3040' })); glass.position.set(0.41, 0.88, 0); glass.rotation.y = Math.PI / 2; car.add(glass);
  for (const [x, z, a] of [[W + 0.4, 9.5, 0.3], [-0.4, 14.5, -0.5]]) { const lp = new T.Group(); lp.position.set(x, 0, z); lp.rotation.z = a; scene.add(lp); part(fgeo('lpost', () => new T.CylinderGeometry(0.05, 0.07, 3.2, 8)), toonMat('#1e1a22'), lp, 0, 1.6, 0); }
  moonPuddle(scene, W * 0.62, 10.5, 0.9); moonPuddle(scene, W * 0.25, 15.8, 0.7); moonPuddle(scene, W * 0.8, 16.6, 0.5);
  // Ruinenstadt ringsum und am Horizont
  for (let z = 8; z < H + 8; z += 4.2) { ruinTower(scene, -3.2, z, 4.4, 3.6, 6 + rnd() * 6, 40 + z * 3); ruinTower(scene, W + 3.2, z, 4.4, 3.6, 6 + rnd() * 6, 90 + z * 3); }
  for (let i = 0; i < 14; i++) ruinTower(scene, -30 + i * 5.2 + rnd() * 2, -14 - rnd() * 18, 3.5 + rnd() * 3, 3.5, 8 + rnd() * 14, 200 + i, false);
  twoMoons(scene, W / 2);
  // Licht: fahles Mondlicht, roter Schein vom kleinen Mond
  scene.background = new T.Color('#140a14'); scene.fog = new T.Fog('#1a0e18', 16, 60);
  scene.add(new T.HemisphereLight('#a888b8', '#2a1a24', 1.35));
  sunLight(scene, W / 2, H / 2, 16, '#e8d8f4', 2.3, [-6, 14, -10]);
  const red = new T.DirectionalLight('#ff5a4a', 1.1); red.position.set(W + 10, 6, -8); red.target.position.set(W / 2, 0, H / 2); scene.add(red, red.target);
  e6Motes(scene, W, H, '#ff8a7a', 260);
};

/* ------------------------------------------------------------ Hangar 3 des Militaerlagers */
ARENA3D.hangar = function (A, scene) {
  const T = THREE, W = A.w * S3, H = A.h * S3, rnd = mulberry(33);
  const crack = (g, r) => { g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1.2; for (let i = 0; i < 6; i++) { let x = r() * 256, y = r() * 256; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += r() * 40 - 20; y += r() * 40 - 20; g.lineTo(x, y); } g.stroke(); } };
  groundPlane(scene, W + 4, H + 6, noiseTex('#4a4c52', ['rgba(0,0,0,0.12)', 'rgba(255,255,255,0.05)', 'rgba(30,30,34,0.2)'], 33, [(W + 4) / 3, (H + 6) / 3], crack), { std: true, rough: 0.7 }).position.set(W / 2, 0, H / 2 + 1);
  const yellow = new T.MeshBasicMaterial({ color: '#c8a030' });
  for (const x of [30 * S3, W - 30 * S3]) for (let z = 60 * S3; z < H - 1; z += 0.8) { const m = new T.Mesh(fgeo('ydash', () => new T.PlaneGeometry(0.1, 0.48)), yellow); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.01, z); scene.add(m); }
  for (let i = 0; i < 6; i++) { const m = new T.Mesh(fgeo('oil', () => new T.CircleGeometry(1, 18)), new T.MeshBasicMaterial({ color: '#1a1a1e', transparent: true, opacity: 0.45 })); m.rotation.x = -Math.PI / 2; m.position.set(1 + rnd() * (W - 2), 0.008, 3 + rnd() * (H - 4)); m.scale.set(0.3 + rnd() * 0.6, 0.2 + rnd() * 0.4, 1); scene.add(m); }
  // Rueckwand mit halb offenem Rolltor
  const zb = 22 * S3;
  box3(scene, W + 1, 8, 0.4, '#34363e', W / 2, 4, zb - 0.2);
  for (let k = 0; k < 7; k++) box3(scene, 5.2, 0.4, 0.12, k % 2 ? '#5a5e66' : '#4e5258', W / 2, 1.9 + k * 0.42, zb + 0.02, { noOutline: true });
  const gap = new T.Mesh(new T.PlaneGeometry(5.2, 1.7), new T.MeshBasicMaterial({ color: '#1e0e14' })); gap.position.set(W / 2, 0.85, zb + 0.01); scene.add(gap);
  const sign = new T.Mesh(new T.PlaneGeometry(3.2, 0.6), new T.MeshBasicMaterial({ map: labelTex('HANGAR 3', '#b4c8dc', '#1e2026') })); sign.position.set(W / 2, 5.4, zb + 0.03); scene.add(sign);
  // Seitenwaende mit hohen, kaputten Fenstern und Lichtbahnen
  for (const [x, r] of [[-0.35, 1], [W + 0.35, -1]]) {
    box3(scene, 0.4, 8, H + 2, '#2e3036', x, 4, H / 2);
    for (let z = 2.5; z < H; z += 3.2) {
      const win = new T.Mesh(fgeo('hwin', () => new T.PlaneGeometry(1.6, 1.2)), new T.MeshBasicMaterial({ color: '#9aaad0' })); win.position.set(x + r * 0.21, 5.8, z); win.rotation.y = r * Math.PI / 2; scene.add(win);
      const shaft = new T.Mesh(fgeo('hshaft', () => { const g = new T.PlaneGeometry(1.6, 7); g.translate(0, -3.5, 0); return g; }), new T.MeshBasicMaterial({ color: '#8a9ad0', transparent: true, opacity: 0.06, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
      shaft.position.set(x + r * 0.3, 6.2, z); shaft.rotation.set(0, r * Math.PI / 2, r * -0.55); scene.add(shaft);
    }
  }
  // Stahlboegen
  for (let z = 2; z < H + 1; z += 3.4) { const a = new T.Mesh(fgeo('harch', () => new T.TorusGeometry(W / 2 + 0.35, 0.09, 6, 30, Math.PI)), toonMat('#3a3c44')); a.position.set(W / 2, 3.2, z); scene.add(a); }
  // Kisten und Faesser an den Hindernissen der Kampflogik
  const crate = (g, x, y, z, s, col) => { box3(g, s, s, s, col, x, y + s / 2, z); box3(g, s + 0.02, 0.06, s + 0.02, '#2e2e1e', x, y + s * 0.2, z, { noOutline: true }); box3(g, s + 0.02, 0.06, s + 0.02, '#2e2e1e', x, y + s * 0.8, z, { noOutline: true }); };
  for (const b of A.blocks) {
    const g = new T.Group(); scene.add(g);
    const bx = (b.x + b.w / 2) * S3, bz = (b.y + b.h / 2) * S3, bw = b.w * S3;
    crate(g, bx - bw * 0.22, 0, bz - 0.1, 0.7, '#5a5a3a'); crate(g, bx + bw * 0.25, 0, bz + 0.15, 0.65, '#4e5236'); crate(g, bx - 0.05, 0.7, bz - 0.05, 0.55, '#626244');
    const lab = new T.Mesh(fgeo('clab', () => new T.PlaneGeometry(0.5, 0.18)), new T.MeshBasicMaterial({ map: labelTex('MIL', '#d8d0a0', '#4a4a30') })); lab.position.set(bx - bw * 0.22, 0.4, bz + 0.26); g.add(lab);
    r3Occluder(g, bx - bw / 2, bx + bw / 2, bz - 0.5, bz + 0.5, 1.5);
  }
  for (const [x, z] of [[0.3, 6], [0.3, 6.6], [W - 0.3, 13.5], [W - 0.35, 3.2]]) part(fgeo('barrel', () => new T.CylinderGeometry(0.26, 0.26, 0.85, 14)), toonMat('#7a2a1a'), scene, x, 0.43, z);
  // Nest: Schleim, Fasern, Knochen
  const nx = (A.w - 70) * S3, nz = 90 * S3;
  const slime = new T.Mesh(new T.CircleGeometry(1, 32), new T.MeshStandardMaterial({ color: '#6a8a3a', emissive: new T.Color('#3a5a1a'), emissiveIntensity: 0.25, roughness: 0.15, transparent: true, opacity: 0.8 }));
  slime.rotation.x = -Math.PI / 2; slime.scale.set(1.5, 0.7, 1); slime.position.set(nx, 0.012, nz); scene.add(slime);
  const fib = toonMat('#a0be5a');
  for (let i = 0; i < 16; i++) {
    const a = rnd() * TAU, b = a + 0.6 + rnd() * 1.4, p0 = new T.Vector3(nx + Math.cos(a) * 1.4, 0, nz + Math.sin(a) * 0.65), p2 = new T.Vector3(nx + Math.cos(b) * 1.3, 0, nz + Math.sin(b) * 0.6);
    const p1 = p0.clone().lerp(p2, 0.5); p1.y = 0.4 + rnd() * 0.6;
    scene.add(new T.Mesh(new T.TubeGeometry(new T.QuadraticBezierCurve3(p0, p1, p2), 10, 0.025, 5), fib));
  }
  for (let i = 0; i < 5; i++) { const m = part(fgeo('bone', () => new T.CylinderGeometry(0.03, 0.03, 0.5, 6)), toonMat('#e8e0c8'), scene, nx - 1.6 + rnd() * 1.2, 0.04, nz + 0.6 + rnd() * 0.6, true); m.rotation.set(Math.PI / 2, 0, rnd() * 3); }
  const nl = new T.PointLight('#b8ff6a', 2, 4, 1.8); nl.position.set(nx, 0.8, nz); scene.add(nl);
  // Haengelampen, eine flackert
  R3.e6Flick = [];
  for (const [x, z, flick] of [[W / 2, 5, false], [W / 2, 10.5, true], [W / 2, 15, false]]) {
    part(fgeo('hcord', () => new T.CylinderGeometry(0.015, 0.015, 3, 4)), toonMat('#1a1a1e'), scene, x, 8.2, z, true);
    part(fgeo('hshade', () => new T.ConeGeometry(0.45, 0.35, 16, 1, true)), toonMat('#3a4a3a', { side: T.DoubleSide }), scene, x, 6.6, z);
    const bulb = glowSprite3('#fff0c8', 1.2, 0.8); bulb.position.set(x, 6.45, z); scene.add(bulb);
    const pl = new T.PointLight('#ffe8c0', 9, 11, 1.4); pl.position.set(x, 6.2, z); scene.add(pl);
    if (flick) R3.e6Flick.push({ pl, bulb, base: 9 });
  }
  scene.background = new T.Color('#0c0c12'); scene.fog = new T.Fog('#0c0c12', 16, 40);
  scene.add(new T.HemisphereLight('#8a9ab8', '#1a1c22', 0.8));
  sunLight(scene, W / 2, H / 2, 14, '#b8c8e8', 1.1, [3, 12, -10]);
  e6Motes(scene, W, H, '#c8d0e8', 180);
};

/* ------------------------------------------------------------ Trainings-Dom: runde Arena, Kuppel, Mech-Wracks */
function mechWreck(scene, x, z, rot, seed) {
  const T = THREE, g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g); const rnd = mulberry(seed);
  const c1 = '#4a4e58', c2 = '#5a606c', c3 = '#2a2c34';
  for (const s of [-1, 1]) { box3(g, 0.32, 0.7, 0.36, c1, s * 0.34, 0.35, 0.25); box3(g, 0.34, 0.26, 0.6, c3, s * 0.34, 0.13, 0.55); box3(g, 0.36, 0.65, 0.34, c2, s * 0.34, 0.75, -0.05).rotation.x = -0.7; }
  const torso = box3(g, 1.1, 0.9, 0.75, c2, 0, 1.35, 0.05); torso.rotation.x = 0.35; torso.rotation.z = rnd() * 0.2 - 0.1;
  box3(g, 1.14, 0.12, 0.8, c3, 0, 1.0, 0.1, { noOutline: true });
  const head = box3(g, 0.46, 0.36, 0.46, c1, 0.1, 1.95, 0.25); head.rotation.set(0.6, 0.3, 0.2);
  const visor = new T.Mesh(fgeo('mvisor', () => new T.PlaneGeometry(0.34, 0.1)), new T.MeshBasicMaterial({ color: '#1a0a0c' })); visor.position.set(0, 0, 0.235); head.add(visor);
  const arm = box3(g, 0.26, 0.9, 0.26, c1, -0.72, 0.75, 0.35); arm.rotation.set(0.5, 0, 0.35);
  box3(g, 0.34, 0.3, 0.4, c3, -0.95, 0.15, 0.7);
  for (let k = 0; k < 3; k++) { const p0 = new T.Vector3(0.55, 1.5, 0), p2 = new T.Vector3(0.9 + rnd() * 0.3, 0, 0.2 + rnd() * 0.6), p1 = new T.Vector3(0.9, 1.3, 0.3); g.add(new T.Mesh(new T.TubeGeometry(new T.QuadraticBezierCurve3(p0, p1, p2), 8, 0.025, 5), toonMat(k ? '#1a1a1e' : '#8a2a2a'))); }
  const sp = glowSprite3('#9ad8ff', 0.5, 0); sp.position.set(0.55, 1.5, 0); g.add(sp);
  return { g, sp };
}
ARENA3D.dom = function (A, scene) {
  const T = THREE, W = A.w * S3, H = A.h * S3, cx = W / 2, cz = H / 2 + 10 * S3;
  const floor = new T.Mesh(new T.PlaneGeometry(W + 20, H + 20), new T.MeshStandardMaterial({ map: floorTex('#30323a', '#282a32', 44, [(W + 20) / 2.2, (H + 20) / 2.2]), roughness: 0.45, metalness: 0.3 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(cx, 0, H / 2); floor.receiveShadow = true; scene.add(floor);
  const lineM = new T.MeshBasicMaterial({ color: '#a0aac0', transparent: true, opacity: 0.35 });
  const ring = new T.Mesh(new T.RingGeometry(0.985, 1, 96), lineM); ring.rotation.x = -Math.PI / 2; ring.scale.set(W * 0.42, H * 0.36, 1); ring.position.set(cx, 0.01, cz); scene.add(ring);
  const mid = new T.Mesh(new T.RingGeometry(1.12, 1.18, 64), lineM); mid.rotation.x = -Math.PI / 2; mid.position.set(cx, 0.01, cz); scene.add(mid);
  // zerstoerte Flutlichter im Kreis
  R3.e6Spark = [];
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU, x = cx + Math.cos(a) * W * 0.5, z = cz + Math.sin(a) * H * 0.45;
    const pg = new T.Group(); scene.add(pg);
    part(fgeo('dpost', () => new T.CylinderGeometry(0.06, 0.09, 3.6, 8)), toonMat('#1e2028'), pg, x, 1.8, z);
    const h = box3(pg, 0.5, 0.3, 0.2, '#16181e', x, 3.6, z);
    r3Occluder(pg, x - 0.5, x + 0.5, z - 0.5, z + 0.5, 4); h.rotation.set(0.4 + (i % 3) * 0.3, -a + Math.PI / 2, i % 2 ? 0.5 : -0.2);
    if (i % 3 === 1) { const s = glowSprite3('#bfe0ff', 0.6, 0); s.position.set(x, 3.5, z); scene.add(s); R3.e6Spark.push(s); }
  }
  // Mech-Wracks an den Hindernissen
  for (const b of A.blocks || []) {
    const x = (b.x + b.w / 2) * S3, z = (b.y + b.h / 2) * S3, M = mechWreck(scene, x, z, x < cx ? 0.6 : -2.4, b.x);
    R3.e6Spark.push(M.sp); r3Occluder(M.g, x - 1, x + 1, z - 0.7, z + 0.7, 2.4);
  }
  // Kuppel: Ringmauer (blendet aus, wenn sie im Weg ist), Rippen bis zum Scheitel
  const rx = W * 0.72, rz = H * 0.62, n = 22;
  for (let i = 0; i < n; i++) {
    const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, am = (a0 + a1) / 2;
    const x = cx + Math.cos(am) * rx, z = cz + Math.sin(am) * rz, len = Math.hypot(Math.cos(a1) * rx - Math.cos(a0) * rx, Math.sin(a1) * rz - Math.sin(a0) * rz) + 0.05;
    const g = new T.Group(); scene.add(g);
    const w = box3(g, len, 2.6, 0.4, '#2a2c34', x, 1.3, z); w.rotation.y = -Math.atan2(Math.sin(a1) * rz - Math.sin(a0) * rz, Math.cos(a1) * rx - Math.cos(a0) * rx);
    const strip = new T.Mesh(fgeo('dstrip', () => new T.BoxGeometry(1, 0.06, 0.42)), new T.MeshBasicMaterial({ color: i % 5 === 0 ? '#ff3a3a' : '#5a7aa8' })); strip.scale.x = len; strip.position.set(x, 2.2, z); strip.rotation.y = w.rotation.y; g.add(strip);
    if (Math.sin(am) > -0.2) r3Occluder(g, x - 1.4, x + 1.4, z - 1.4, z + 1.4, 3);
    if (i % 2 === 0) {
      const p0 = new T.Vector3(cx + Math.cos(a0) * rx, 2.6, cz + Math.sin(a0) * rz), p1 = new T.Vector3(cx + Math.cos(a0) * rx * 0.85, 13, cz + Math.sin(a0) * rz * 0.85), p2 = new T.Vector3(cx, 15, cz);
      scene.add(new T.Mesh(new T.TubeGeometry(new T.QuadraticBezierCurve3(p0, p1, p2), 16, 0.12, 6), toonMat('#20222a')));
    }
  }
  // Zuschauerraenge hinten
  for (let k = 0; k < 4; k++) box3(scene, W * 1.3, 0.5, 0.9, k % 2 ? '#24262e' : '#2a2c36', cx, 2.85 + k * 0.5, cz - rz - 0.9 - k * 0.9, { noOutline: true });
  // Licht: kaltes Restlicht, ein intaktes Flutlicht, rote Warnleuchte
  scene.background = new T.Color('#0a0a10'); scene.fog = new T.Fog('#0a0a10', 18, 44);
  scene.add(new T.HemisphereLight('#8090b0', '#14161c', 0.85));
  sunLight(scene, cx, cz, 14, '#c8d8f0', 1.2, [5, 13, -6]);
  const sp = new T.SpotLight('#dfe8ff', 26, 26, 0.5, 0.6, 1.2); sp.position.set(cx + W * 0.45, 9, cz - H * 0.4); sp.target.position.set(cx, 0, cz); scene.add(sp, sp.target);
  const beacon = new T.PointLight('#ff2a2a', 0, 14, 1.4); beacon.position.set(cx, 3.2, cz - rz + 0.4); scene.add(beacon);
  const bg = glowSprite3('#ff3a3a', 1.4, 0.6); bg.position.copy(beacon.position); scene.add(bg);
  R3.e6Beacon = { l: beacon, s: bg };
  e6Motes(scene, W, H, '#bfd0f0', 160);
};

/* ------------------------------------------------------------ Lebendiges Licht: Flackern, Funken, Warnleuchte */
const _r3ExtrasE6 = r3Extras;
r3Extras = function (e, R, rdt) {
  _r3ExtrasE6(e, R, rdt);
  if (e !== G.player) return;
  for (const F of R3.e6Flick || []) { const on = Math.sin(G.t * 23) + Math.sin(G.t * 7.3) > -0.6 || Math.sin(G.t * 1.1) > 0.4; F.pl.intensity = on ? F.base : 0.4; F.bulb.material.opacity = on ? 0.8 : 0.1; }
  (R3.e6Spark || []).forEach((s, i) => { s.material.opacity = Math.max(0, Math.sin(G.t * (9 + i * 3) + i) * Math.sin(G.t * 2.3 + i * 5)) * 0.9; });
  if (R3.e6Beacon) { const k = Math.max(0, Math.sin(G.t * 3)); R3.e6Beacon.l.intensity = k * 7; R3.e6Beacon.s.material.opacity = 0.15 + k * 0.7; }
};
