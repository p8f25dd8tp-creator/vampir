'use strict';
/* ==========================================================================
   3D-ORTE ETAPPE 2 (eigene Gestaltung)
   Park bei Nacht (Kiesring, Laternen, Baeume, Hecken, Baenke) ·
   Kulisse fuer Kaempfe im Hof (Gebaeude hinter dem Kampffeld) ·
   Verhaertung (Rylee) als metallischer Schild an der gehaerteten Seite.
   ========================================================================== */

ARENA3D.park = function (A, scene) {
  const T = THREE, W = A.w * S3, H = A.h * S3;
  const grass = noiseTex('#24402a', ['rgba(0,0,0,0.3)', 'rgba(60,100,60,0.3)', 'rgba(20,40,20,0.3)'], 21, [(W + 30) / 3, (H + 30) / 3]);
  groundPlane(scene, W + 30, H + 30, grass).position.set(W / 2, 0, H / 2);
  const gravel = noiseTex('#7a746a', ['rgba(0,0,0,0.25)', 'rgba(255,255,255,0.15)', 'rgba(90,80,60,0.3)'], 22, [4, 4]);
  // Kiesring um die Mitte, Wege nach Norden und Sueden
  const ring = new T.Mesh(new T.RingGeometry(0.72, 1.0, 64), new T.MeshLambertMaterial({ map: gravel }));
  ring.rotation.x = -Math.PI / 2; ring.scale.set(W * 0.38, H * 0.3, 1); ring.position.set(W / 2, 0.012, H / 2); ring.receiveShadow = true; scene.add(ring);
  for (const [z, d] of [[H * 0.125, H * 0.25], [H * 0.875, H * 0.25]]) { const m = new T.Mesh(new T.PlaneGeometry(44 * S3, d), new T.MeshLambertMaterial({ map: gravel })); m.rotation.x = -Math.PI / 2; m.position.set(W / 2, 0.013, z); m.receiveShadow = true; scene.add(m); }
  // Hecken aussen, Blumenbeete, Baenke am Ring
  const hedge = toonMat('#1e3a22');
  for (const [x, z, w, d] of [[-0.8, H / 2, 0.9, H + 4], [W + 0.8, H / 2, 0.9, H + 4], [W * 0.2, -1.2, W * 0.4, 0.9], [W * 0.8, -1.2, W * 0.4, 0.9]]) { const m = new T.Mesh(new T.BoxGeometry(w, 1.1, d), hedge); m.position.set(x, 0.55, z); m.castShadow = true; m.receiveShadow = true; scene.add(m); addOutline(m, 0.02); }
  for (const [x, z] of [[W * 0.22, H * 0.5], [W * 0.78, H * 0.5]]) { const bed = new T.Mesh(new T.CylinderGeometry(0.7, 0.75, 0.25, 18), toonMat('#3a2a20')); bed.position.set(x, 0.12, z); scene.add(bed); for (let k = 0; k < 9; k++) { const f = new T.Mesh(fgeo('flower', () => new T.SphereGeometry(0.08, 6, 5)), toonMat(['#c84a6a', '#e8c040', '#8a6ad8'][k % 3])); f.position.set(x + Math.cos(k) * 0.45, 0.32, z + Math.sin(k) * 0.45); scene.add(f); } }
  for (const [x, z, r] of [[W * 0.5, H * 0.24, 0], [W * 0.5, H * 0.76, Math.PI]]) bench3d(scene, x + 1.6, z, r);
  for (const [x, y] of A.trees || []) tree3d(scene, x * S3, y * S3, 1.3, true);
  for (const [x, z] of [[-2.5, 3], [W + 2.5, 5], [-2.8, H - 4], [W + 2.6, H - 2]]) tree3d(scene, x, z, 1.5, true);
  for (const [x, y] of A.lamps || []) { lampPost3d(scene, x * S3, y * S3, true); const pl = new T.PointLight('#ffd890', 8, 7.5, 1.6); pl.position.set(x * S3, 3.0, y * S3); scene.add(pl); const pool = new T.Mesh(new T.CircleGeometry(1.8, 24), new T.MeshBasicMaterial({ map: R3.glowTex, color: '#6a5020', transparent: true, opacity: 0.45, blending: T.AdditiveBlending, depthWrite: false })); pool.rotation.x = -Math.PI / 2; pool.position.set(x * S3, 0.02, y * S3); scene.add(pool); }
  // Stadtsilhouette hinter dem Park
  for (let i = 0; i < 12; i++) { const h = 6 + (hash2(i, 3, 3) % 60) / 6, w = 2.5 + (hash2(i, 5, 3) % 20) / 10; const m = new T.Mesh(new T.BoxGeometry(w, h, 2), new T.MeshBasicMaterial({ color: '#0e1224' })); m.position.set(-8 + i * 3.2, h / 2, -9 - (i % 3) * 2); scene.add(m); for (let k = 0; k < 5; k++) { const lw = new T.Mesh(fgeo('cwin', () => new T.PlaneGeometry(0.3, 0.4)), new T.MeshBasicMaterial({ color: '#ffcf80' })); lw.position.set(m.position.x - w / 3 + (hash2(i, k, 9) % 10) / 10 * w * 0.6, 1 + (hash2(k, i, 4) % 10) / 10 * (h - 2), m.position.z + 1.01); scene.add(lw); } }
  scene.background = new T.Color('#050814'); scene.fog = new T.Fog('#050814', 12, 32);
  scene.add(new T.HemisphereLight('#3a4a8a', '#0c100c', 0.8));
  sunLight(scene, W / 2, H / 2, 16, '#9ab0ff', 1.3, [-5, 16, -8]);
  const moon = glowSprite3('#e8eeff', 5, 0.9); moon.position.set(W * 0.2, 15, -16); scene.add(moon);
  R3.motes = null;
};

// Kampf im Hof ohne Hub-Gebaeude: Kulisse hinter dem Kampffeld (ausserhalb der Arena)
const _hof3d = ARENA3D.hof;
ARENA3D.hof = function (A, scene) {
  if (A.buildings) return _hof3d(A, scene);
  const B = Object.assign({}, A, { noRoof: true, buildings: [
    { x: 10, y: -150, w: 190, h: 110, door: 105, label: 'KANTINE' },
    { x: 240, y: -150, w: 190, h: 110, door: 335, label: 'TRAININGSHALLE' }
  ], trees: (A.trees || []).concat([[40, 560], [400, 540], [30, 120], [410, 140]]), benches: A.benches || [[110, 620], [330, 620]] });
  _hof3d(B, scene);
};

/* ------------------------------------------------------------ Verhaertung: Metallschild an der gehaerteten Seite */
function r3Harden(e, R) {
  if (!e.ai || !e.ai.harden) return;
  if (!R.shield) {
    const g = new THREE.CylinderGeometry(0.46, 0.46, 1.2, 20, 1, true, -0.95, 1.9);
    const m = new THREE.MeshStandardMaterial({ color: '#c8d4e4', metalness: 0.9, roughness: 0.25, transparent: true, opacity: 0.85, side: THREE.DoubleSide, emissive: new THREE.Color('#3a4a60') });
    R.shield = new THREE.Mesh(g, m); R.shield.position.y = 1.1; R.root.add(R.shield);
    const edge = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 1.24, 20, 1, true, -0.95, 1.9), new THREE.MeshBasicMaterial({ color: '#9ad8ff', transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false }));
    R.shield.add(edge);
  }
  const vis = e.state !== 'down' && e.state !== 'stagger' && e.hardDir !== undefined;
  R.shield.visible = vis; if (!vis) return;
  // Welt-Richtung -> lokal zur Figur (die Wurzel ist schon gedreht)
  const worldYaw = Math.atan2(Math.cos(e.hardDir), Math.sin(e.hardDir)) - Math.PI / 2;
  R.shield.rotation.y = worldYaw - R.root.rotation.y + Math.PI / 2;
  R.shield.material.emissiveIntensity = 0.6 + Math.min(1, e.flash * 10) * 2;
}
