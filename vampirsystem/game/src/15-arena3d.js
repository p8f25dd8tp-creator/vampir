'use strict';
/* ==========================================================================
   3D-ARENEN — eigene Gestaltung
   Kantine der Militaerakademie: Fliesen mit Fugen und Abnutzung, Fensterfront
   mit Lichtbahnen und Staub im Licht, Essensausgabe, Pfeiler, Aushaenge,
   lange Tische mit Baenken und Tabletts.
   ========================================================================== */

function floorTex(base1, base2, seed, reps) {
  const k = mkCanvas(512, 512), g = k.getContext('2d'), rnd = mulberry(seed);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const b = (x + y) % 2 ? base1 : base2, v = rnd() * 0.06 - 0.03;
    const gr = g.createLinearGradient(x * 64, y * 64, x * 64 + 64, y * 64 + 64); gr.addColorStop(0, shade(b, v + 0.05)); gr.addColorStop(1, shade(b, v - 0.04));
    g.fillStyle = gr; g.fillRect(x * 64, y * 64, 64, 64);
  }
  for (let i = 0; i < 2500; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'; g.fillRect(rnd() * 512, rnd() * 512, 2, 2); }
  for (let i = 0; i < 18; i++) { g.strokeStyle = 'rgba(40,30,30,0.08)'; g.lineWidth = 1 + rnd() * 2; g.beginPath(); const x = rnd() * 512, y = rnd() * 512; g.moveTo(x, y); g.lineTo(x + rnd() * 60 - 30, y + rnd() * 60 - 30); g.stroke(); }
  g.strokeStyle = 'rgba(30,30,44,0.45)'; g.lineWidth = 3; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 512); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(512, i * 64); g.stroke(); }
  const tex = new THREE.CanvasTexture(k); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(reps[0], reps[1]); tex.anisotropy = 8;
  return tex;
}
function box3(scene, w, h, d, col, x, y, z, o) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toonMat(col)); m.position.set(x, y, z); m.castShadow = !(o && o.noCast); m.receiveShadow = true;
  if (!(o && o.noOutline)) addOutline(m, 0.02); scene.add(m); return m;
}

ARENA3D.kantine = function (A, scene) {
  const T = THREE, W = A.w * S3, H = A.h * S3;
  const floor = new T.Mesh(new T.PlaneGeometry(W + 8, H + 8), new T.MeshLambertMaterial({ map: floorTex('#aeb3bd', '#959aa6', 11, [(W + 8) / 3.2, (H + 8) / 3.2]) }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(W / 2, 0, H / 2); floor.receiveShadow = true; scene.add(floor);
  // Rueckwand, Sockel, Fensterfront
  box3(scene, W + 8, 3.6, 0.35, '#48506a', W / 2, 1.8, -0.2, { noOutline: true });
  box3(scene, W + 8, 0.45, 0.4, '#262c3a', W / 2, 0.22, -0.02, { noOutline: true });
  for (let x = 1.1; x < W - 0.5; x += 2.2) {
    const win = new T.Mesh(new T.PlaneGeometry(1.5, 1.5), new T.MeshBasicMaterial({ color: new T.Color('#e4f2ff') })); win.position.set(x, 2.0, -0.01); scene.add(win);
    box3(scene, 0.07, 1.5, 0.06, '#262c3a', x, 2.0, 0.0, { noOutline: true, noCast: true }); box3(scene, 1.5, 0.07, 0.06, '#262c3a', x, 2.0, 0.0, { noOutline: true, noCast: true });
    box3(scene, 1.7, 0.1, 0.18, '#3a4258', x, 1.2, 0.05, { noOutline: true });
    const shaft = new T.Mesh(new T.PlaneGeometry(1.5, 6), new T.MeshBasicMaterial({ color: new T.Color('#fff2d4'), transparent: true, opacity: 0.07, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
    shaft.position.set(x + 0.3, 1.2, 2.6); shaft.rotation.x = -1.02; scene.add(shaft);
  }
  // Essensausgabe an der Rueckwand
  const cx = W / 2;
  box3(scene, 3.4, 0.95, 0.7, '#8a93a6', cx, 0.48, 0.55);
  box3(scene, 3.5, 0.06, 0.8, '#c8ced8', cx, 0.98, 0.55);
  for (let i = 0; i < 4; i++) { box3(scene, 0.6, 0.12, 0.4, ['#d8a040', '#6a9a4a', '#c85a3a', '#e8d8a0'][i], cx - 1.2 + i * 0.8, 1.06, 0.5, { noCast: true }); }
  box3(scene, 3.5, 0.08, 0.5, '#5a6278', cx, 1.8, 0.35);
  // Pfeiler und Aushaenge an den Seiten
  for (const x of [-0.3, W + 0.3]) {
    box3(scene, 0.45, 1.1, H + 0.6, '#3a4256', x, 0.55, H / 2, { noOutline: true });
    for (let z = 2; z < H; z += 4) {
      box3(scene, 0.55, 2.8, 0.55, '#525b72', x, 1.4, z);
      const poster = new T.Mesh(new T.PlaneGeometry(0.6, 0.8), toonMat(['#c8a050', '#5a8ac8', '#c85a6a'][Math.floor(z) % 3]));
      poster.position.set(x + (x < 0 ? 0.25 : -0.25), 1.6, z + 1.2); poster.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(poster);
    }
  }
  // Tische mit Baenken, Tabletts, Bechern
  const rnd = mulberry(4);
  for (const b of A.blocks || []) {
    const x = (b.x + b.w / 2) * S3, z = (b.y + b.h / 2) * S3, w = b.w * S3, d = b.h * S3 + 0.3;
    box3(scene, w, 0.08, d, '#9a6a40', x, 0.76, z);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box3(scene, 0.07, 0.72, 0.07, '#4a3020', x + sx * (w / 2 - 0.12), 0.36, z + sz * (d / 2 - 0.1), { noOutline: true });
    for (const s of [-1, 1]) { box3(scene, w, 0.06, 0.28, '#6a4428', x, 0.45, z + s * (d / 2 + 0.32)); for (const sx of [-1, 1]) box3(scene, 0.06, 0.42, 0.06, '#3a2418', x + sx * (w / 2 - 0.15), 0.21, z + s * (d / 2 + 0.32), { noOutline: true }); }
    for (let i = 0; i < 3; i++) {
      const tx = x - w / 2 + 0.35 + i * (w - 0.7) / 2;
      box3(scene, 0.36, 0.03, 0.26, '#6a8aa8', tx, 0.815, z - 0.05 + (rnd() - 0.5) * 0.1, { noOutline: true, noCast: true });
      const food = new T.Mesh(fgeo('food', () => new T.SphereGeometry(0.07, 10, 7)), toonMat(['#e8c070', '#c86a4a', '#8ab860'][i])); food.position.set(tx + 0.06, 0.85, z - 0.05); food.scale.y = 0.6; scene.add(food);
      const cup = new T.Mesh(fgeo('cup', () => new T.CylinderGeometry(0.035, 0.03, 0.1, 10)), toonMat('#e8ecf0')); cup.position.set(tx - 0.1, 0.87, z + 0.06); cup.castShadow = true; scene.add(cup);
    }
  }
  // Licht: helles Tageslicht von den Fenstern, weiche Aufhellung
  scene.background = new T.Color('#1c2130');
  scene.fog = new T.Fog('#1c2130', 16, 36);
  scene.add(new T.HemisphereLight('#e2ecff', '#6a5a50', 1.15));
  const sun = new T.DirectionalLight('#ffeed6', 2.4); sun.position.set(W / 2 - 2, 12, -3); sun.target.position.set(W / 2, 0, H / 2);
  sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); const sc = sun.shadow.camera; sc.left = -W; sc.right = W; sc.top = H * 0.8; sc.bottom = -H * 0.8; sc.near = 1; sc.far = 40; sun.shadow.bias = -0.0015; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
  const fill = new T.DirectionalLight('#a8b8ff', 0.5); fill.position.set(W / 2 + 4, 6, H + 6); scene.add(fill);
  // Staub im Licht
  const n = 160, pos = new Float32Array(n * 3), r2 = mulberry(8);
  for (let i = 0; i < n; i++) { pos[i * 3] = r2() * W; pos[i * 3 + 1] = 0.2 + r2() * 2.8; pos[i * 3 + 2] = r2() * H * 0.7; }
  const mg = new T.BufferGeometry(); mg.setAttribute('position', new T.BufferAttribute(pos, 3));
  R3.motes = new T.Points(mg, new T.PointsMaterial({ size: 0.05, map: R3.glowTex, color: '#fff4d8', transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false }));
  scene.add(R3.motes);
};
