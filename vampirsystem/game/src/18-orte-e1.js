'use strict';
/* ==========================================================================
   3D-ORTE ETAPPE 1 (eigene Gestaltung)
   Pruefplatz in praller Sonne · Akademiehof (begehbar, Tag/Nacht) ·
   Trainingshalle bei Nacht · Messsaeule und Trainingsgeraet als 3D-Objekte.
   ========================================================================== */

/* ------------------------------------------------------------ Bausteine */
function noiseTex(base, dots, seed, reps, extra) {
  const k = mkCanvas(256, 256), g = k.getContext('2d'), rnd = mulberry(seed);
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) { g.fillStyle = dots[Math.floor(rnd() * dots.length)]; const s = 1 + rnd() * 2.5; g.fillRect(rnd() * 256, rnd() * 256, s, s); }
  if (extra) extra(g, rnd);
  const t = new THREE.CanvasTexture(k); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(reps[0], reps[1]); t.anisotropy = 8; return t;
}
function groundPlane(scene, W, H, tex, o) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(W, H), o && o.std ? new THREE.MeshStandardMaterial({ map: tex, roughness: o.rough || 0.8 }) : new THREE.MeshLambertMaterial({ map: tex }));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true; scene.add(m); return m;
}
function labelTex(text, col, bg) {
  const k = mkCanvas(512, 96), g = k.getContext('2d');
  g.fillStyle = bg || '#1a2030'; g.fillRect(0, 0, 512, 96); g.strokeStyle = col || '#c8b070'; g.lineWidth = 6; g.strokeRect(6, 6, 500, 84);
  g.font = '800 54px Cinzel, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col || '#e8d8a0'; g.fillText(text, 256, 52);
  const t = new THREE.CanvasTexture(k); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function tree3d(scene, x, z, s, night) {
  const T = THREE, g = new T.Group(); g.position.set(x, 0, z); g.scale.setScalar(s || 1);
  const trunk = part(fgeo('trunk', () => new T.CylinderGeometry(0.12, 0.18, 1.8, 8)), toonMat('#5a3a24'), g, 0, 0.9, 0);
  const leaf = toonMat(night ? '#1e3a28' : '#3e7a3a'), leaf2 = toonMat(night ? '#28482e' : '#5a9a48');
  for (const [dx, dy, dz, r, m] of [[0, 2.3, 0, 1.0, leaf], [-0.55, 1.95, 0.2, 0.7, leaf2], [0.55, 2.0, -0.15, 0.72, leaf2], [0.1, 2.85, 0.1, 0.62, leaf2]]) {
    const b = part(fgeo('leaf' + r, () => new T.IcosahedronGeometry(r, 1)), m, g, dx, dy, dz); b.receiveShadow = true;
  }
  trunk.receiveShadow = true; scene.add(g); return g;
}
function bench3d(scene, x, z, rot) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot || 0;
  box3(g, 1.3, 0.06, 0.4, '#8a5a36', 0, 0.45, 0); box3(g, 1.3, 0.35, 0.05, '#8a5a36', 0, 0.7, -0.18);
  for (const s of [-1, 1]) box3(g, 0.06, 0.45, 0.36, '#2a2a30', s * 0.55, 0.22, 0, { noOutline: true });
  scene.add(g); return g;
}
function lampPost3d(scene, x, z, on) {
  const T = THREE;
  part(fgeo('lpost', () => new T.CylinderGeometry(0.05, 0.07, 3.2, 8)), toonMat('#1e2028'), scene, x, 1.6, z);
  const head = new T.Mesh(fgeo('lhead', () => new T.SphereGeometry(0.16, 12, 10)), new T.MeshBasicMaterial({ color: on ? '#fff0c8' : '#8a8a90' })); head.position.set(x, 3.25, z); scene.add(head);
  if (on) { const gl = glowSprite3('#ffd890', 0.8, 0.45); gl.position.set(x, 3.25, z); scene.add(gl); }
}
function building3d(scene, b, night) {
  const T = THREE, x = (b.x + b.w / 2) * S3, z = (b.y + b.h / 2) * S3, w = b.w * S3, d = b.h * S3, h = 6.2;
  box3(scene, w, h, d, '#7e889c', x, h / 2, z);
  box3(scene, w + 0.3, 0.3, d + 0.3, '#4a5264', x, h + 0.1, z);
  box3(scene, w + 0.1, 0.5, d + 0.1, '#3a4252', x, 0.25, z, { noOutline: true });
  const front = z + d / 2 + 0.01;
  const winMat = new T.MeshBasicMaterial({ color: night ? '#ffcf80' : '#9ec4e0' }), winOff = new T.MeshBasicMaterial({ color: night ? '#2a3044' : '#6a8aa8' });
  for (let fl = 0; fl < 3; fl++) for (let wx = x - w / 2 + 0.7; wx < x + w / 2 - 0.5; wx += 1.1) {
    if (fl === 0 && b.door && Math.abs(wx - b.door * S3) < 0.8) continue;
    const m = new T.Mesh(fgeo('win', () => new T.PlaneGeometry(0.6, 0.8)), (hash2(Math.round(wx * 10), fl, 7) % 3 === 0) ? winOff : winMat);
    m.position.set(wx, 1.4 + fl * 1.6, front); scene.add(m);
  }
  if (b.door) {
    const dx = b.door * S3;
    box3(scene, 1.1, 1.8, 0.1, '#2a2018', dx, 0.9, front, { noOutline: true });
    box3(scene, 1.6, 0.12, 0.8, '#3a4252', dx, 2.05, front + 0.35);
    if (night) { const gl = glowSprite3('#ffd890', 0.8, 0.4); gl.position.set(dx, 1.95, front + 0.3); scene.add(gl); }
  }
  if (b.label) { const s = new T.Mesh(new T.PlaneGeometry(2.6, 0.5), new T.MeshBasicMaterial({ map: labelTex(b.label) })); s.position.set(x, h - 0.6, front + 0.02); scene.add(s); }
}
function sunLight(scene, cx, cz, span, col, inten, pos) {
  const T = THREE, sun = new T.DirectionalLight(col, inten);
  sun.position.set(cx + pos[0], pos[1], cz + pos[2]); sun.target.position.set(cx, 0, cz);
  sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  const sc = sun.shadow.camera; sc.left = -span; sc.right = span; sc.top = span; sc.bottom = -span; sc.near = 1; sc.far = 80; sun.shadow.bias = -0.0012; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target); return sun;
}

/* ------------------------------------------------------------ Pruefplatz: Sand, Linien, Tribuene, Kasernenwand, Sonne */
ARENA3D.pruefplatz = function (A, scene) {
  const T = THREE, W = A.w * S3, H = A.h * S3;
  const sand = noiseTex('#cdb68a', ['rgba(140,110,60,0.25)', 'rgba(255,240,210,0.3)', 'rgba(100,80,50,0.18)'], 9, [(W + 20) / 4, (H + 20) / 4]);
  groundPlane(scene, W + 20, H + 20, sand).position.set(W / 2, 0, H / 2);
  const line = new T.MeshBasicMaterial({ color: '#f4f0e6' });
  for (const [x, z, w, d] of [[W / 2, 60 * S3, W - 40 * S3, 0.06], [W / 2, (A.h - 30) * S3, W - 40 * S3, 0.06], [20 * S3, H / 2 + 15 * S3, 0.06, H - 90 * S3], [(A.w - 20) * S3, H / 2 + 15 * S3, 0.06, H - 90 * S3]]) { const m = new T.Mesh(new T.PlaneGeometry(w, d), line); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.01, z); scene.add(m); }
  const ring = new T.Mesh(new T.RingGeometry(1.42, 1.5, 48), line); ring.rotation.x = -Math.PI / 2; ring.position.set(W / 2, 0.01, (A.h / 2 + 15) * S3); scene.add(ring);
  // Kasernenwand und Tribuene hinten
  box3(scene, W + 20, 5, 0.6, '#6a7488', W / 2, 2.5, -2.5);
  for (let x = -6; x < W + 6; x += 1.6) { const m = new T.Mesh(fgeo('win', () => new T.PlaneGeometry(0.6, 0.8)), new T.MeshBasicMaterial({ color: '#9ec4e0' })); m.position.set(x, 3.4, -2.19); scene.add(m); }
  for (let r = 0; r < 3; r++) box3(scene, W + 6, 0.35, 0.7, r % 2 ? '#8a94a8' : '#9aa4b8', W / 2, 0.18 + r * 0.35, -1.6 + r * 0.7 - 1.4, { noOutline: true });
  for (const x of [1, W - 1]) { part(fgeo('flag', () => new T.CylinderGeometry(0.04, 0.05, 5, 8)), toonMat('#c8ccd4'), scene, x, 2.5, -0.6); const fl = new T.Mesh(new T.PlaneGeometry(1.1, 0.7), toonMat('#2a4a7a', { side: T.DoubleSide })); fl.position.set(x + 0.58, 4.5, -0.6); scene.add(fl); }
  // Seitliche Zuschauerbaenke
  for (let z = 4; z < H - 2; z += 3.5) { bench3d(scene, -1.2, z, Math.PI / 2); bench3d(scene, W + 1.2, z, -Math.PI / 2); }
  scene.background = new T.Color('#9ecbf0'); scene.fog = new T.Fog('#bcdcf4', 22, 55);
  scene.add(new T.HemisphereLight('#dcecff', '#a08a60', 1.3));
  sunLight(scene, W / 2, H / 2, 16, '#fff2d8', 3.2, [4, 16, 6]);
};

/* ------------------------------------------------------------ Trainingshalle bei Nacht */
ARENA3D.halle = function (A, scene) {
  const T = THREE, W = A.w * S3, H = A.h * S3;
  const planks = noiseTex('#6a4a34', ['rgba(0,0,0,0.12)', 'rgba(255,220,180,0.08)'], 4, [(W + 4) / 3, (H + 4) / 3], (g, rnd) => { g.strokeStyle = 'rgba(30,18,10,0.55)'; g.lineWidth = 2; for (let y = 0; y <= 256; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); for (let x = (y / 32 % 2) * 64; x < 256; x += 128) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 32); g.stroke(); } } });
  groundPlane(scene, W + 4, H + 4, planks, { std: true, rough: 0.45 }).position.set(W / 2, 0, H / 2);
  const court = new T.MeshBasicMaterial({ color: '#e8c070', transparent: true, opacity: 0.55 });
  for (const [x, z, w, d] of [[W / 2, 64 * S3, W - 48 * S3, 0.06], [W / 2, (A.h - 32) * S3, W - 48 * S3, 0.06], [24 * S3, H / 2 + 16 * S3, 0.06, H - 96 * S3], [(A.w - 24) * S3, H / 2 + 16 * S3, 0.06, H - 96 * S3]]) { const m = new T.Mesh(new T.PlaneGeometry(w, d), court); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.01, z); scene.add(m); }
  box3(scene, W + 4, 6, 0.4, '#2e2838', W / 2, 3, -0.2, { noOutline: true });
  for (let x = 1; x < W; x += 2.3) { const m = new T.Mesh(new T.PlaneGeometry(1.4, 1.0), new T.MeshBasicMaterial({ color: '#8aa8e8' })); m.position.set(x, 4.3, 0.01); scene.add(m); const sh = new T.Mesh(new T.PlaneGeometry(1.4, 7), new T.MeshBasicMaterial({ color: '#7a98ff', transparent: true, opacity: 0.05, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); sh.position.set(x, 2.2, 2.6); sh.rotation.x = -0.9; scene.add(sh); }
  for (const x of [-0.25, W + 0.25]) box3(scene, 0.5, 2.4, H + 1, '#3a3246', x, 1.2, H / 2, { noOutline: true });
  // Geraeteregale und Matten an den Seiten
  for (let z = 3; z < H - 2; z += 4.5) { box3(scene, 0.5, 1.4, 1.6, '#4a3a2a', 0.35, 0.7, z); for (let k = 0; k < 3; k++) part(fgeo('ball', () => new T.SphereGeometry(0.14, 10, 8)), toonMat(['#c85a3a', '#3a7ac8', '#e8c040'][k]), scene, 0.35, 1.55, z - 0.5 + k * 0.5); box3(scene, 1.4, 0.12, 2.2, '#3a4a7a', W - 1.0, 0.06, z + 1, { noOutline: true }); }
  scene.background = new T.Color('#06070e'); scene.fog = new T.Fog('#06070e', 12, 30);
  scene.add(new T.HemisphereLight('#4a5a9a', '#1a1420', 0.7));
  sunLight(scene, W / 2, H / 2, 14, '#8aa8ff', 1.4, [-2, 10, -6]);
  for (const z of [H * 0.35, H * 0.7]) { const pl = new T.PointLight('#ffe0b0', 6, 8, 1.6); pl.position.set(W / 2, 4.5, z); scene.add(pl); const s = new T.Mesh(new T.CircleGeometry(1.6, 24), new T.MeshBasicMaterial({ map: R3.glowTex, color: '#8a6a40', transparent: true, opacity: 0.4, blending: T.AdditiveBlending, depthWrite: false })); s.rotation.x = -Math.PI / 2; s.position.set(W / 2, 0.02, z); scene.add(s); }
};

/* ------------------------------------------------------------ Akademiehof (Hub): Gebaeude, Wege, Rasen, Baeume, Tag/Nacht */
ARENA3D.hof = function (A, scene) {
  const T = THREE, W = A.w * S3, H = A.h * S3, night = !!A.night;
  const grass = noiseTex(night ? '#2a4a2a' : '#5e8a42', night ? ['rgba(0,0,0,0.25)', 'rgba(60,90,60,0.3)'] : ['rgba(30,60,20,0.35)', 'rgba(150,190,90,0.3)', 'rgba(90,130,50,0.3)'], 5, [(W + 30) / 3, (H + 30) / 3]);
  groundPlane(scene, W + 30, H + 30, grass).position.set(W / 2, 0, H / 2);
  const stone = noiseTex(night ? '#6a6660' : '#bab4a6', ['rgba(0,0,0,0.12)', 'rgba(255,255,255,0.12)'], 6, [1, 1], (g) => { g.strokeStyle = 'rgba(40,36,30,0.35)'; g.lineWidth = 2; for (let i = 0; i <= 256; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); } });
  for (const r of A.paths || []) { const t = stone.clone(); t.needsUpdate = true; t.repeat.set(r.w * S3 / 1.9, r.h * S3 / 1.9); const m = new T.Mesh(new T.PlaneGeometry(r.w * S3, r.h * S3), new T.MeshLambertMaterial({ map: t })); m.rotation.x = -Math.PI / 2; m.position.set((r.x + r.w / 2) * S3, 0.012, (r.y + r.h / 2) * S3); m.receiveShadow = true; scene.add(m); }
  for (const b of A.buildings || []) building3d(scene, b, night);
  // ueberdachter Hauptweg (wirft den Schatten, in dem Quinn sicher ist)
  const px = 220 * S3, z0 = 130 * S3, z1 = H;
  if (!A.noRoof) {
  const roof = new T.Mesh(new T.BoxGeometry(56 * S3 + 0.4, 0.1, z1 - z0), toonMat(night ? '#3a3a44' : '#8a3a3a', { transparent: true })); roof.position.set(px, 2.8, (z0 + z1) / 2); roof.castShadow = true; scene.add(roof);
  R3.fade.push({ mat: roof.material, x0: px - 1.2, x1: px + 1.2, z0: z0 - 1, z1: z1 + 2 });
  for (let z = z0 + 1; z < z1; z += 3) for (const s of [-1, 1]) part(fgeo('pillar', () => new T.CylinderGeometry(0.06, 0.06, 2.8, 6)), toonMat('#2a2a30'), scene, px + s * (28 * S3 + 0.15), 1.4, z);
  }
  for (const [x, y] of A.trees || []) tree3d(scene, x * S3, y * S3, 1.1, night);
  for (const [x, y] of A.benches || []) bench3d(scene, x * S3, y * S3, 0);
  // Mauer am Rand
  for (const [x, z, w, d] of [[-0.6, H / 2, 0.4, H + 2], [W + 0.6, H / 2, 0.4, H + 2]]) box3(scene, w, 1.2, d, '#8a8478', x, 0.6, z, { noOutline: true });
  if (night) {
    scene.background = new T.Color('#070b18'); scene.fog = new T.Fog('#070b18', 14, 34);
    scene.add(new T.HemisphereLight('#3a4a88', '#10141a', 0.8));
    sunLight(scene, W / 2, H / 2, 16, '#8aa0ff', 1.2, [-5, 18, -8]);
    for (const [x, z] of [[190 * S3, 200 * S3], [250 * S3, 420 * S3], [190 * S3, 560 * S3], [60 * S3, 470 * S3]]) { lampPost3d(scene, x, z, true); const pl = new T.PointLight('#ffd890', 7, 8, 1.6); pl.position.set(x, 3, z); scene.add(pl); }
    const moon = glowSprite3('#dfe8ff', 6, 0.9); moon.position.set(W * 0.8, 16, -14); scene.add(moon);
  } else {
    scene.background = new T.Color('#8ec4f0'); scene.fog = new T.Fog('#b4d8f4', 24, 60);
    scene.add(new T.HemisphereLight('#dcecff', '#6a7a4a', 1.25));
    sunLight(scene, W / 2, H / 2, 18, '#fff0d4', 3.0, [0, 22, -5]);
  }
};

/* ------------------------------------------------------------ 3D-Objekte (Messsaeule, Trainingsgeraet) */
const OBJ3D = {
  saeule(e) {
    const T = THREE, g = new T.Group();
    part(fgeo('sbase', () => new T.CylinderGeometry(0.42, 0.5, 0.2, 20)), toonMat('#2a303c'), g, 0, 0.1, 0);
    part(fgeo('sbody', () => new T.CylinderGeometry(0.3, 0.34, 2.0, 20)), toonMat('#b8c2d0'), g, 0, 1.2, 0);
    part(fgeo('stop', () => new T.CylinderGeometry(0.38, 0.38, 0.14, 20)), toonMat('#2a303c'), g, 0, 2.25, 0);
    const scr = new T.Mesh(new T.PlaneGeometry(0.26, 1.5), new T.MeshBasicMaterial({ color: '#10141e' })); scr.position.set(0, 1.2, 0.34); g.add(scr);
    const bar = new T.Mesh(new T.PlaneGeometry(0.2, 1.44), new T.MeshBasicMaterial({ color: '#4affa0' })); bar.geometry.translate(0, 0.72, 0); bar.position.set(0, 0.48, 0.345); g.add(bar);
    const top = glowSprite3('#8ad8ff', 0.8, 0.8); top.position.y = 2.4; g.add(top);
    return { root: g, update(e) { const k = clamp(e.meter || 0, 0.02, 1); bar.scale.y = k; bar.material.color.set(k > 0.75 ? '#ff4a4a' : k > 0.45 ? '#ffe04a' : '#4affa0'); top.material.opacity = 0.4 + k * 0.6; } };
  },
  geraet(e) {
    const T = THREE, g = new T.Group();
    part(fgeo('gbase', () => new T.CylinderGeometry(0.5, 0.65, 0.5, 16)), toonMat('#3a4252'), g, 0, 0.25, 0);
    part(fgeo('gneck', () => new T.CylinderGeometry(0.14, 0.18, 0.7, 12)), toonMat('#5a6474'), g, 0, 0.85, 0);
    const head = new T.Group(); head.position.y = 1.3; g.add(head);
    part(fgeo('ghead', () => new T.BoxGeometry(0.6, 0.4, 0.7)), toonMat('#8a94a8'), head, 0, 0, 0);
    part(fgeo('gbar', () => new T.CylinderGeometry(0.08, 0.1, 0.5, 10)), toonMat('#2a303c'), head, 0, 0, 0.55).rotation.x = Math.PI / 2;
    const lens = new T.Mesh(fgeo('glens', () => new T.CircleGeometry(0.08, 14)), new T.MeshBasicMaterial({ color: '#8ad8ff' })); lens.position.set(0, 0, 0.81); head.add(lens);
    const glow = glowSprite3('#8ad8ff', 0.9, 0.7); glow.position.set(0, 0, 0.85); head.add(glow);
    return { root: g, update(e) { const a = e.aim || Math.PI / 2; head.rotation.y = Math.atan2(Math.cos(a), Math.sin(a)); const hot = e.state === 'wind' || e.state === 'active'; const c = hot ? '#ff4a3a' : '#8ad8ff'; lens.material.color.set(c); glow.material.color.set(c); glow.material.opacity = hot ? 0.6 + Math.min(1, e.stateT / 0.7) * 0.4 : 0.5; } };
  }
};
