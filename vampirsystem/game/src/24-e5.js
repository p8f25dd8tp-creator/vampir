'use strict';
/* ==========================================================================
   ETAPPE 5 in 3D (eigene Gestaltung)
   VR-Raum „Power Fighter“: schwebende Neon-Arena im digitalen Raum ·
   Windklinge mit wehendem Bestienumhang · Hardsteely (Metallkoerper) in Chrom.
   ========================================================================== */

ARENA3D.vr = function (A, scene) {
  const T = THREE, W = A.w * S3, H = A.h * S3;
  // Boden: dunkles Glas mit leuchtendem Raster
  const k = mkCanvas(256, 256), g = k.getContext('2d');
  g.fillStyle = '#060a18'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(95,240,255,0.55)'; g.lineWidth = 2; g.strokeRect(1, 1, 254, 254);
  g.strokeStyle = 'rgba(95,240,255,0.18)'; g.lineWidth = 1; for (let i = 0; i < 256; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); }
  const tex = new T.CanvasTexture(k); tex.colorSpace = T.SRGBColorSpace; tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.repeat.set(W / 2, H / 2); tex.anisotropy = 8;
  const floor = new T.Mesh(new T.PlaneGeometry(W, H), new T.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new T.Color('#ffffff'), emissiveIntensity: 0.9, roughness: 0.7, metalness: 0.1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(W / 2, 0, H / 2); floor.receiveShadow = true; scene.add(floor);
  // Plattformkante und Ring in der Mitte
  const edge = new T.MeshBasicMaterial({ color: '#5ff0ff' });
  for (const [x, z, w, d] of [[W / 2, 0, W, 0.06], [W / 2, H, W, 0.06], [0, H / 2, 0.06, H], [W, H / 2, 0.06, H]]) { const m = new T.Mesh(new T.BoxGeometry(w, 0.08, d), edge); m.position.set(x, 0.04, z); scene.add(m); }
  const side = new T.Mesh(new T.BoxGeometry(W, 1.2, H), new T.MeshBasicMaterial({ color: '#0a1a3a', transparent: true, opacity: 0.7 })); side.position.set(W / 2, -0.62, H / 2); scene.add(side);
  const ring = new T.Mesh(new T.RingGeometry(1.7, 1.78, 64), edge); ring.rotation.x = -Math.PI / 2; ring.position.set(W / 2, 0.02, H / 2 + 0.3); scene.add(ring);
  // schwebende Hologramm-Tafeln und Datenwuerfel
  const title = new T.Mesh(new T.PlaneGeometry(5, 0.9), new T.MeshBasicMaterial({ map: labelTex('POWER FIGHTER', '#5ff0ff', '#04101e'), transparent: true, opacity: 0.9 })); title.position.set(W / 2, 2.2, -5.5); scene.add(title);
  R3.vrCubes = [];
  for (let i = 0; i < 16; i++) { const c = new T.Mesh(fgeo('vcube', () => new T.BoxGeometry(0.5, 0.5, 0.5)), new T.MeshBasicMaterial({ color: i % 3 ? '#2a6aff' : '#5ff0ff', wireframe: true })); const a = i / 16 * TAU; c.position.set(W / 2 + Math.cos(a) * (W * 0.9 + (i % 3)), 1 + (i % 5) * 1.3, H / 2 + Math.sin(a) * (H * 0.7 + (i % 4))); scene.add(c); R3.vrCubes.push(c); }
  // Datenstroeme im Hintergrund
  const n = 400, pos = new Float32Array(n * 3), rnd = mulberry(5);
  for (let i = 0; i < n; i++) { pos[i * 3] = W / 2 + (rnd() - 0.5) * 60; pos[i * 3 + 1] = -6 + rnd() * 24; pos[i * 3 + 2] = H / 2 + (rnd() - 0.5) * 60; }
  const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pos, 3));
  R3.motes = new T.Points(pg, new T.PointsMaterial({ size: 0.12, map: R3.glowTex, color: '#5ff0ff', transparent: true, opacity: 0.6, blending: T.AdditiveBlending, depthWrite: false, fog: false })); scene.add(R3.motes);
  scene.background = new T.Color('#02040c'); scene.fog = new T.Fog('#02040c', 18, 50);
  scene.add(new T.HemisphereLight('#6ab8ff', '#0a0a20', 1.0));
  sunLight(scene, W / 2, H / 2, 12, '#bfe8ff', 1.4, [2, 12, 6]);
  const pl = new T.PointLight('#5ff0ff', 8, 12, 1.6); pl.position.set(W / 2, 3, H / 2); scene.add(pl);
};

// Umhang (Windklinge) und Metallkoerper (Hardsteely)
const _r3ExtrasE5 = r3Extras;
r3Extras = function (e, R, rdt) {
  _r3ExtrasE5(e, R, rdt);
  if (R3.vrCubes && e === G.player) R3.vrCubes.forEach((c, i) => { c.rotation.x += rdt * (0.4 + i % 3 * 0.2); c.rotation.y += rdt * 0.5; });
  if (e.ai && e.ai.cloak && !R.cape) {
    const geo = new THREE.PlaneGeometry(0.55, 1.1, 4, 8); geo.translate(0, -0.55, 0);
    R.cape = new THREE.Mesh(geo, toonMat('#6a5a3a', { side: THREE.DoubleSide })); R.cape.position.set(0, 0.02, -0.14); R.chest.add(R.cape); addOutline(R.cape, 0.008);
    R.capeBase = geo.attributes.position.array.slice();
  }
  if (R.cape) { // wehen: je schneller, desto weiter nach hinten
    const a = R.cape.geometry.attributes.position, b = R.capeBase, sp = Math.min(1, Math.hypot(e.vx, e.vy) / 150);
    for (let i = 0; i < a.count; i++) { const y = b[i * 3 + 1], u = -y / 1.1; a.setZ(i, b[i * 3 + 2] - u * (0.15 + sp * 0.55) - Math.sin(G.t * 7 + u * 4 + b[i * 3] * 3) * 0.06 * u); a.setY(i, y + u * sp * 0.25); }
    a.needsUpdate = true; R.cape.geometry.computeVertexNormals();
  }
  if (e.ai && e.ai.steel && !R.chrome) { // ganzer Koerper aus Metall
    R.chrome = true;
    for (const m of R.mats) { if (m.color) m.color.set('#dfe8f4'); if (m.userData.rim) m.userData.rim.value.set('#ffffff'); m.emissive.set('#2a3444'); }
  }
  if (R.chrome) { const f = Math.min(1, e.flash * 9); for (const m of R.mats) m.emissive.setRGB(0.16 + f, 0.2 + f, 0.27 + f); }
};
