'use strict';
/* ==========================================================================
   3D-KAMPAGNENKARTE — jede Etappe ist eine schwebende Insel im Nachthimmel,
   mit einem Wahrzeichen ihres Schauplatzes. Senkrecht scrollbar, gesperrte
   Etappen liegen dunkel und mit Schloss. Auf der gewaehlten Insel steht der
   aktuelle Held. Ohne WebGL bleibt die bisherige Etappen-Ansicht.
   ========================================================================== */

const MAP3 = { ready: false, scroll: 0, target: 0, vel: 0, isles: [], labels: [], sel: 1 };
const ISLE_GAP = 420;
const _homeK2d = UI.homeKampagne;

/* ------------------------------------------------------------ Farben je Schauplatz */
const ISLE_LOOK = {
  friedhof: { top: '#4a5a4a', rock: '#5a5068', acc: '#a0ffd0' },
  akademie: { top: '#5a8a4a', rock: '#7a6a5a', acc: '#ffd860' },
  rotezone: { top: '#8a3a3a', rock: '#5a2a30', acc: '#ff3a4e' },
  caladi: { top: '#c8a060', rock: '#8a6a4a', acc: '#ffb040' },
  basisnacht: { top: '#3a4a6a', rock: '#4a4a60', acc: '#8ad8ff' },
  siedlung: { top: '#5a3a5a', rock: '#4a3048', acc: '#ff5a7a' },
  ruinen: { top: '#7a5a3a', rock: '#5a4038', acc: '#ff8a3a' },
  schlachtfeld: { top: '#6a6a3a', rock: '#5a5040', acc: '#ffb060' },
  burg: { top: '#4a3a6a', rock: '#3a2e50', acc: '#c070ff' },
  roterhimmel: { top: '#7a2a2a', rock: '#4a2024', acc: '#ff5a3a' },
  himmel: { top: '#e8e4f8', rock: '#a8a0c8', acc: '#ffe8a0' },
  bestienplanet: { top: '#3a7a4a', rock: '#4a4a5a', acc: '#6affd8' },
  goetter: { top: '#5a5aa0', rock: '#40407a', acc: '#ffd860' },
  redspace: { top: '#3a1a24', rock: '#1e0e14', acc: '#ff2a4a' }
};

/* ------------------------------------------------------------ Bauhelfer */
function isleKit(grp, dim) {
  const T = THREE, gray = new T.Color('#241c30');
  const col = (c) => { const x = new T.Color(c); if (dim) x.lerp(gray, 0.72); return x; };
  const B = (g, c, p, s, r, o) => {
    o = o || {};
    const mat = o.glow ? new T.MeshBasicMaterial({ color: col(c), transparent: !!o.alpha, opacity: o.alpha || 1, blending: o.add ? T.AdditiveBlending : T.NormalBlending, depthWrite: !o.add })
      : new T.MeshToonMaterial({ color: col(c), gradientMap: R3N.grad, side: o.side || T.FrontSide });
    const m = new T.Mesh(g, mat);
    m.position.set(p[0], p[1], p[2]); if (s) m.scale.set(s[0], s[1], s[2]); if (r) m.rotation.set(r[0], r[1], r[2]);
    (o.parent || grp).add(m);
    if (!o.glow && o.line !== false) { const ol = new T.Mesh(g, R3N.outline); ol.scale.setScalar(o.line || 1.07); m.add(ol); }
    return m;
  };
  return { B, col };
}
const PRISM = () => geo('prism', () => new THREE.CylinderGeometry(1, 1, 1, 3));
const ROCKG = () => geo('rockg', () => new THREE.CylinderGeometry(1, 0.2, 1, 9, 2));
const TOPG = () => geo('topg', () => new THREE.CylinderGeometry(1, 0.96, 1, 9));
const HEX = () => geo('hexg', () => new THREE.CylinderGeometry(1, 1, 1, 6));

function buildIsle(n, dim) {
  const T = THREE, ch = ET(n), L = ISLE_LOOK[ch.theme] || ISLE_LOOK.friedhof;
  const grp = new T.Group(), { B } = isleKit(grp, dim);
  // Felsenkoerper mit haengenden Brocken, Grasdecke, Wolkenkranz
  B(ROCKG(), L.rock, [0, -48, 0], [100, 92, 100], null, { flat: true });
  B(DOD(), L.rock, [-58, -64, 22], [26, 30, 26], [0.3, 0.2, 0], { flat: true });
  B(DOD(), L.rock, [50, -78, -18], [20, 26, 20], [0.1, 0.8, 0], { flat: true });
  B(TOPG(), L.top, [0, 3, 0], [104, 12, 104]);
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + n; B(SPH(), L.top, [Math.cos(a) * 96, 4, Math.sin(a) * 96], [16, 9, 16], null, { line: false }); }
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + n * 0.7; B(SPH(), '#e8e0ff', [Math.cos(a) * 88, -40 - (i % 3) * 8, Math.sin(a) * 88], [34, 16, 30], null, { glow: true, alpha: dim ? 0.18 : 0.42 }); }
  const lm = new T.Group(); grp.add(lm);
  (ISLE_BUILD[ch.theme] || ISLE_BUILD.friedhof)(isleKit(lm, dim).B, L, n);
  grp.userData = { n, dim, lm };
  return grp;
}

/* ------------------------------------------------------------ Wahrzeichen je Schauplatz */
const WIN = (B, x, y, z, s, c) => B(BOX(), c || '#ffd060', [x, y, z], [s * 0.8, s, 1], null, { glow: true });
const ISLE_BUILD = {
  akademie(B, L) { // Akademie mit Uhrturm
    B(BOX(), '#d8ccb0', [0, 34, -10], [120, 60, 60]); B(PRISM(), '#6a3a3a', [0, 76, -10], [44, 124, 44], [Math.PI / 2, 0, Math.PI / 2]);
    B(BOX(), '#e4d8bc', [0, 70, 22], [34, 130, 34]); B(CON(), '#6a3a3a', [0, 152, 22], [30, 40, 30], [0, Math.PI / 4, 0]);
    B(CYL(), '#fff4d0', [0, 110, 40], [11, 2, 11], [Math.PI / 2, 0, 0], { line: 1.2 });
    for (let i = -2; i <= 2; i++) if (i) { WIN(B, i * 20, 40, 21, 12); WIN(B, i * 20, 20, 21, 12); }
    B(CYL(), '#3a3a3a', [48, 70, 30], [1.5, 80, 1.5]); B(BOX(), '#3a6ad8', [60, 100, 30], [24, 14, 1]);
    for (const x of [-72, 72]) B(SPH(), '#3a7a3a', [x, 22, 40], [16, 18, 16]);
  },
  rotezone(B) { // das rote Portal
    B(TOR(), '#4a2a30', [0, 72, -10], [58, 58, 40], null, { line: 1.05 });
    B(CYL(), '#ff2a3a', [0, 72, -10], [48, 2, 48], [Math.PI / 2, 0, 0], { glow: true, alpha: 0.75, add: true });
    B(CYL(), '#ffb0a0', [0, 72, -9], [24, 2, 24], [Math.PI / 2, 0, 0], { glow: true, alpha: 0.6, add: true });
    for (const [x, z, h] of [[-66, 30, 40], [70, 20, 56], [-40, -60, 30], [52, -56, 36]]) B(OCT(), '#8a2a3a', [x, h / 2, z], [12, h, 12], [0, x, 0.2], { flat: true });
    B(BOX(), '#5a2a30', [0, 8, -10], [90, 14, 20]);
  },
  caladi(B) { // Shelter-Kuppel unter zwei Sonnen
    B(SPH(), '#d8e8f0', [0, 8, -14], [54, 46, 54]); B(TOR(), '#8a9aa8', [0, 10, -14], [54, 54, 26], [Math.PI / 2, 0, 0]);
    B(BOX(), '#3a4a5a', [0, 20, 40], [28, 26, 10]); WIN(B, 0, 20, 46, 14, '#8ad8ff');
    B(CYL(), '#8a8a94', [44, 80, -30], [2, 70, 2]); B(SPH(), '#ff5a3a', [44, 118, -30], [5, 5, 5], null, { glow: true });
    B(SPH(), '#ffc860', [-60, 150, -80], [16, 16, 16], null, { glow: true }); B(SPH(), '#ff8a40', [-30, 170, -90], [10, 10, 10], null, { glow: true });
    for (const [x, z] of [[-70, 40], [70, 46]]) B(BOX(), '#8a6a40', [x, 10, z], [20, 18, 20], [0, x, 0]);
  },
  basisnacht(B) { // Militaerbasis bei Nacht, Wachtuerme mit Suchlicht
    B(BOX(), '#5a6070', [0, 26, -20], [110, 44, 50]); for (let i = -2; i <= 2; i++) WIN(B, i * 20, 30, 6, 10, '#8ad8ff');
    for (const x of [-70, 70]) { B(BOX(), '#4a4e5e', [x, 50, 30], [16, 96, 16]); B(BOX(), '#3a3e4c', [x, 104, 30], [28, 14, 28]); B(CON(), '#fff0a0', [x * 0.6, 60, 60], [26, 110, 26], [0.6, 0, x > 0 ? 0.5 : -0.5], { glow: true, alpha: 0.18, add: true }); }
    for (let i = -4; i <= 4; i++) B(BOX(), '#3a3e4c', [i * 22, 10, 80], [4, 20, 4], null, { line: false });
    B(BOX(), '#3a3e4c', [0, 16, 80], [180, 2, 2], null, { line: false });
  },
  siedlung(B, L) { // Vampirburg mit spitzen Tuermen
    B(BOX(), '#4a3a50', [0, 36, -10], [90, 70, 60]);
    for (const [x, z, h] of [[-50, 20, 110], [50, 20, 110], [-40, -40, 90], [40, -40, 90], [0, -20, 150]]) { B(CYL(), '#5a4660', [x, h / 2, z], [15, h, 15]); B(CON(), '#8a1a2a', [x, h + 20, z], [20, 42, 20]); WIN(B, x, h - 20, z + 15.5, 8, '#ff5a7a'); }
    B(BOX(), '#1a0a10', [0, 24, 21], [22, 34, 2]);
  },
  ruinen(B) { // gebrochene Saeulen und ein Bogen
    for (const [x, z, h] of [[-60, -20, 90], [-20, -40, 60], [30, -30, 100], [66, 10, 40], [-70, 40, 30]]) { B(CYL(), '#b8a890', [x, h / 2, z], [10, h, 10]); B(BOX(), '#a09078', [x, h + 3, z], [26, 6, 26], [0, 0, 0.08]); }
    B(TOR(), '#a89880', [0, 30, 20], [44, 44, 70], [0, 0, 0], { line: 1.05 });
    for (let i = 0; i < 5; i++) B(DOD(), '#8a7a66', [-30 + i * 18, 6, 60 - i * 8], [9, 7, 9], [i, i, 0], { flat: true });
    B(CON(), '#ff8a3a', [60, 20, 50], [10, 26, 10], null, { glow: true, alpha: 0.8, add: true });
  },
  schlachtfeld(B) { // Stellung mit Zelten, Sandsaecken, Fahnen
    for (const [x, z] of [[-40, -30], [40, -40]]) B(PRISM(), '#6a6a4a', [x, 22, z], [28, 60, 40], [Math.PI / 2, 0, Math.PI / 2]);
    for (let i = 0; i < 8; i++) B(CAP(), '#a8986a', [-70 + i * 20, 8, 50], [10, 5, 7], [0, 0, Math.PI / 2]);
    for (const [x, c] of [[-20, '#3a6ad8'], [20, '#d83a3a']]) { B(CYL(), '#3a3a3a', [x, 60, 0], [1.6, 120, 1.6]); B(BOX(), c, [x + 16, 106, 0], [30, 20, 1]); }
    B(BOX(), '#4a4a3a', [70, 18, -10], [30, 22, 50], [0, 0.2, 0.1]); B(CYL(), '#3a3a30', [76, 34, 26], [4, 50, 4], [1.3, 0, 0]);
  },
  burg(B) { // die zehnte Burg mit Thronsaal
    B(BOX(), '#3a3050', [0, 46, -10], [110, 90, 70]);
    for (let i = -2; i <= 2; i++) B(BOX(), '#3a3050', [i * 24, 96, 25], [12, 12, 8]);
    for (const x of [-62, 62]) { B(CYL(), '#46385e', [x, 70, 20], [20, 140, 20]); for (let k = 0; k < 6; k++) B(BOX(), '#46385e', [x + Math.cos(k) * 18, 144, 20 + Math.sin(k) * 18], [8, 10, 8]); }
    B(BOX(), '#c070ff', [0, 40, 26], [24, 40, 1], null, { glow: true }); WIN(B, -30, 70, 26, 10, '#c070ff'); WIN(B, 30, 70, 26, 10, '#c070ff');
    B(CYL(), '#3a3a3a', [0, 130, -10], [2, 90, 2]); B(BOX(), '#8a1a2a', [16, 160, -10], [30, 20, 1]);
  },
  roterhimmel(B) { // rote Kristallspitzen
    for (const [x, z, h, r] of [[0, -10, 150, 18], [-50, 20, 90, 12], [48, 10, 110, 14], [-20, -60, 80, 10], [60, -50, 70, 10], [20, 60, 50, 8]]) B(OCT(), '#ff3a2a', [x, h / 2, z], [r, h / 2, r], [0, x, 0], { flat: true });
    B(SPH(), '#ff5a3a', [0, 80, -10], [60, 60, 60], null, { glow: true, alpha: 0.12, add: true });
  },
  himmel(B) { // weisser Tempel mit goldener Kuppel
    B(HEX(), '#f0ecf8', [0, 8, 0], [90, 12, 90]);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; B(CYL(), '#ffffff', [Math.cos(a) * 60, 50, Math.sin(a) * 60], [7, 76, 7]); }
    B(CYL(), '#f0ecf8', [0, 92, 0], [72, 10, 72]); B(SPH(), '#ffd860', [0, 100, 0], [52, 44, 52]); B(CON(), '#ffd860', [0, 156, 0], [6, 24, 6]);
    B(SPH(), '#fff4c0', [0, 60, 0], [18, 18, 18], null, { glow: true });
  },
  bestienplanet(B) { // Dschungel mit riesigem Bestienschaedel
    for (const [x, z, h] of [[-60, -30, 110], [60, -40, 130], [-30, 50, 80], [70, 40, 70]]) { B(CYL(), '#5a3a2a', [x, h / 2, z], [6, h, 6], [0, 0, 0.08]); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; B(SPH(), '#2a8a4a', [x + Math.cos(a) * 20, h, z + Math.sin(a) * 20], [24, 8, 12], [0, -a, 0.3]); } }
    B(SPH(), '#e8e0c8', [0, 30, 0], [36, 30, 36]); for (const s of [-1, 1]) { B(SPH(), '#1a1010', [s * 14, 36, 30], [9, 10, 6], null, { line: false }); B(CON(), '#e8e0c8', [s * 30, 60, 0], [8, 40, 8], [0, 0, -s * 0.6]); }
    for (let i = 0; i < 4; i++) B(CON(), '#f0e8d0', [-12 + i * 8, 8, 34], [3, 12, 3], [Math.PI, 0, 0]);
    B(SPH(), '#6affd8', [0, 36, 34], [4, 4, 4], null, { glow: true });
  },
  goetter(B) { // goldene Stufenpyramide der Goetter
    for (let k = 0; k < 5; k++) B(BOX(), k % 2 ? '#e8c860' : '#c8a040', [0, 10 + k * 22, -10], [140 - k * 26, 22, 140 - k * 26]);
    B(OCT(), '#fff0a0', [0, 150, -10], [16, 26, 16], null, { glow: true }); B(SPH(), '#ffd860', [0, 150, -10], [44, 44, 44], null, { glow: true, alpha: 0.2, add: true });
    for (const x of [-80, 80]) { B(CYL(), '#e8e4f0', [x, 40, 50], [8, 80, 8]); B(CON(), '#ff9a30', [x, 92, 50], [8, 20, 8], null, { glow: true, alpha: 0.85, add: true }); }
  },
  redspace(B) { // schwarze Obelisken und schwebende Splitter
    for (const [x, z, h] of [[0, -20, 170], [-60, 20, 100], [60, 10, 120]]) { B(CON(), '#1a1016', [x, h / 2, z], [18, h, 18], [0, Math.PI / 4, 0]); B(BOX(), '#ff2a4a', [x, h * 0.45, z + 9], [3, h * 0.35, 1], [0, Math.PI / 4, 0], { glow: true }); }
    for (let i = 0; i < 6; i++) B(OCT(), '#ff2a4a', [Math.cos(i) * 80, 90 + i * 14, Math.sin(i) * 60], [5, 10, 5], [i, i, 0], { glow: true });
    B(SPH(), '#ff2a4a', [0, 80, 0], [90, 70, 90], null, { glow: true, alpha: 0.1, add: true });
  },
  friedhof(B) {
    for (let i = 0; i < 6; i++) B(CAP(), '#8a8a9a', [-60 + i * 24, 20, (i % 2) * 30 - 10], [10, 10, 4]);
    B(BOX(), '#8a8a9a', [0, 50, -50], [5, 100, 5]); B(BOX(), '#8a8a9a', [0, 76, -50], [40, 5, 5]);
  }
};

/* ------------------------------------------------------------ Szene */
function mapInit() {
  const T = THREE; r3nShared();
  const c = document.createElement('canvas'); c.className = 'map3dcv';
  const ren = new T.WebGLRenderer({ canvas: c, antialias: true });
  ren.outputColorSpace = T.SRGBColorSpace;
  const sc = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 10, 5000);
  // Nachthimmel: Indigo oben, Violett und Rosa am Horizont
  const bg = mkCanvas(4, 256), bgc = bg.getContext('2d');
  bgc.fillStyle = lg(bgc, 0, 0, 0, 256, [0, '#0c0824', 0.35, '#221650', 0.7, '#4a2266', 1, '#7a2c5a']); bgc.fillRect(0, 0, 4, 256);
  const bt = new T.CanvasTexture(bg); bt.colorSpace = T.SRGBColorSpace; sc.background = bt;
  sc.fog = new T.Fog('#2a1a4a', 900, 2200);
  sc.add(new T.HemisphereLight('#d0c8ff', '#40285a', 1.9));
  const sun = new T.DirectionalLight('#ffe4c8', 2.4); sun.position.set(-1, 2, 1.4); sc.add(sun);
  const rim = new T.DirectionalLight('#ff5aa0', 1.3); rim.position.set(1.2, 0.6, -1.5); sc.add(rim);
  const sel = new T.PointLight('#ffd8a0', 5, 420, 1.2); sc.add(sel);
  // Sterne und Funken
  const N = 700, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 1400; pos[i * 3 + 1] = -500 + Math.random() * 500; pos[i * 3 + 2] = 600 - Math.random() * (ETAPPEN.length * ISLE_GAP + 1400); }
  const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(pos, 3));
  const stars = new T.Points(sg, new T.PointsMaterial({ color: '#d8c8ff', size: 3.2, transparent: true, opacity: 0.8, depthWrite: false }));
  sc.add(stars);
  // Mond, fest am Himmel (an der Kamera)
  const mc = mkCanvas(128, 128), mg = mc.getContext('2d');
  mg.fillStyle = rg(mg, 64, 64, 0, 64, [0, 'rgba(255,240,210,1)', 0.38, 'rgba(255,230,190,1)', 0.42, 'rgba(255,200,170,0.45)', 1, 'rgba(255,120,160,0)']); mg.fillRect(0, 0, 128, 128);
  const mt = new T.CanvasTexture(mc); mt.colorSpace = T.SRGBColorSpace;
  const moon = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: mt, transparent: true, depthWrite: false, fog: false }));
  moon.position.set(120, 260, -1200); moon.scale.setScalar(360); cam.add(moon); sc.add(cam);
  // Leuchtring um die gewaehlte Insel
  const ring = new T.Mesh(new T.RingGeometry(106, 116, 48), new T.MeshBasicMaterial({ color: '#ffd860', transparent: true, opacity: 0.7, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; sc.add(ring);
  Object.assign(MAP3, { T, c, ren, sc, cam, sel, ring, stars, ready: true });
  // Eingabe: ziehen scrollt, tippen waehlt eine Insel
  let down = null;
  c.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, y0: e.clientY, t: performance.now(), moved: 0 }; MAP3.vel = 0; try { c.setPointerCapture(e.pointerId); } catch (err) { /* egal */ } });
  c.addEventListener('pointermove', (e) => { if (!down) return; const dy = e.clientY - down.y; down.y = e.clientY; down.moved += Math.abs(dy); const k = dy / mapPxPerIsle(); MAP3.target = clamp(MAP3.target + k, -0.2, ETAPPEN.length - 0.8); MAP3.vel = k / Math.max(0.008, (performance.now() - down.t) / 1000); down.t = performance.now(); });
  const up = (e) => { if (!down) return; const tap = down.moved < 10; down = null; if (tap) mapTap(e.clientX, e.clientY); };
  c.addEventListener('pointerup', up); c.addEventListener('pointercancel', () => { down = null; });
  c.addEventListener('wheel', (e) => { MAP3.target = clamp(MAP3.target - e.deltaY / mapPxPerIsle(), -0.2, ETAPPEN.length - 0.8); e.preventDefault(); }, { passive: false });
}
function mapPxPerIsle() { return Math.max(160, (MAP3.h || 600) * 0.42); }
function islePos(n) { return { x: Math.sin(n * 1.7) * 40, z: -(n - 1) * ISLE_GAP }; }
function mapBuildIsles() {
  const key = ETAPPEN.map((_, i) => etappeOpen(i + 1) ? 1 : 0).join('');
  if (MAP3.key === key) return;
  MAP3.key = key;
  for (const g of MAP3.isles) g.removeFromParent();
  MAP3.isles = ETAPPEN.map((_, i) => { const n = i + 1, g = buildIsle(n, !etappeOpen(n)), p = islePos(n); g.position.set(p.x, 0, p.z); g.rotation.y = Math.sin(n * 2.3) * 0.35; MAP3.sc.add(g); return g; });
}
function mapSetHero() {
  const C = campSave(), id = C.hero;
  if (MAP3.hero && MAP3.heroId === id) return;
  if (MAP3.hero) MAP3.hero.root.removeFromParent();
  MAP3.hero = buildChibi(id, 0); MAP3.heroId = id; MAP3.hero.aura.visible = false; MAP3.sc.add(MAP3.hero.root);
}

/* ------------------------------------------------------------ Einbau ins Menue */
UI.homeKampagne = function () {
  if (!window.THREE || R3N.failed || SAVE.settings.gfx3d === false) return _homeK2d.call(this);
  const C = campSave();
  this.selEtappe = this.selEtappe || C.etappe || 1;
  if (!MAP3.placed) { MAP3.scroll = MAP3.target = this.selEtappe - 1; MAP3.placed = true; }
  const labels = ETAPPEN.map((ch, i) => { const n = i + 1, o = etappeOpen(n);
    return `<div class="mlab ${o ? '' : 'locked'}" data-n="${n}"><div class="mlt"><span class="mnum">${n}</span><b>${ch.title}</b></div>${o ? `<small>${starsOf(n)}/${lvCount(n) * 3} ★${etappeCleared(n) ? ' · geschafft' : ''}</small>` : ''}</div>${o ? '' : `<div class="mlab mlk" data-k="${n}"><div class="mlock">🔒</div><small>Schließe Etappe ${n - 1} ab</small></div>`}`; }).join('');
  return `<div class="map3d"><div class="mapslot"></div><div class="maplabels">${labels}</div>
      <button class="backcur" data-act="mapcur" hidden>Zur aktuellen Etappe <span>⌄</span></button></div>
    ${this.campSheet()}`;
};
function machtLine(hero, e, l) {
  const R = machtRating(hero, e, l), lm = levelMacht(e, l);
  return `<div class="mrate r-${R.key}"><span>Gegner: Macht ${lm} · ${machtName(lm)}</span><b>${R.txt}</b></div>${R.why ? `<small class="mwhy">${R.why}</small>` : ''}`;
}
UI.campSheet = function () {
  const C = campSave(), e = this.selEtappe || C.etappe || 1, ch = ET(e), open = etappeOpen(e), N = lvCount(e);
  if (!this.selLevel || !lvOpen(e, this.selLevel)) { this.selLevel = 1; for (let l = 1; l <= N; l++) if (lvOpen(e, l)) this.selLevel = l; }
  const l = this.selLevel, boss = l === N, L = lvDef(e, l);
  const nodes = Array.from({ length: N }, (_, i) => { const k = i + 1, s = lvStars(e, k), o = lvOpen(e, k), b = k === N;
    return `<button class="lvdot ${b ? 'boss' : ''} ${o ? '' : 'locked'} ${k === l ? 'sel' : ''} ${s ? 'done' : ''}" data-act="lvsel" data-l="${k}" ${o ? '' : 'disabled'}><b>${b ? '☠' : k}</b><i>${o ? '★'.repeat(s) + '<u>' + '★'.repeat(3 - s) + '</u>' : '🔒'}</i></button>`; }).join('');
  const goal = lvGoal(e, l);
  return `<div class="campsheet"><div class="cshead"><span class="csnum">ETAPPE ${e}</span><b>${ch.title}</b><small>${ch.place}</small></div>
    <div class="lvrow">${nodes}</div>
    <div class="csinfo">${open ? `<b class="csname">Stufe ${l}: ${L.name}${boss ? ' · Finale' : ''}</b><p class="cstext">${L.text}</p><div class="csgoal">▸ ${goal}</div>${machtLine(C.hero, e, l)}<small style="color:#b8a8e8">★★ nie unter 30 % Leben · ★★★ nie unter 60 %</small>` : `🔒 Schließe zuerst Etappe ${e - 1} ab`}</div>
    <button class="bigplay" data-act="campgo" ${open && lvOpen(e, l) && !machtRating(C.hero, e, l).lock ? '' : 'disabled'}><b>STARTEN</b><small>mit ${HEROES[C.hero].name}</small></button></div>`;
};
function mapRefreshSheet() {
  const s = document.querySelector('.campsheet'); if (!s) return;
  const tmp = document.createElement('div'); tmp.innerHTML = UI.campSheet(); const n = tmp.firstElementChild;
  n.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', (e) => { AudioSys.init(); sfx('click'); UI.act(b.dataset.act, b.dataset, e); }));
  s.replaceWith(n);
}
function mapTap(x, y) {
  const r = MAP3.c.getBoundingClientRect(), v = new THREE.Vector3();
  let best = 0, bd = 1e9;
  MAP3.isles.forEach((g, i) => { v.set(g.position.x, 40, g.position.z).project(MAP3.cam); const sx = (v.x + 1) / 2 * r.width + r.left, sy = (1 - v.y) / 2 * r.height + r.top, d = Math.hypot(sx - x, sy - y); if (d < bd) { bd = d; best = i + 1; } });
  if (!best || bd > Math.min(150, r.width * 0.36)) return;
  sfx('click');
  if (!etappeOpen(best) && !SAVE.settings.testUnlock) { UI.toast(`Schließe zuerst Etappe ${best - 1} ab`); return; }
  UI.selEtappe = best; UI.selLevel = 0; MAP3.target = best - 1;
  mapRefreshSheet();
}
const _showHomeMap = UI.showHome;
UI.showHome = function (tab) {
  const d = _showHomeMap.call(this, tab);
  const slot = d && d.querySelector('.mapslot');
  if (slot) {
    d.querySelector('.hbody').classList.add('k3');
    try {
      if (!MAP3.ready) mapInit();
      slot.appendChild(MAP3.c); mapBuildIsles(); mapSetHero();
      MAP3.labels = [...d.querySelectorAll('.mlab[data-n]')]; MAP3.locks = [...d.querySelectorAll('.mlk')];
      MAP3.back = d.querySelector('.backcur');
      if (!MAP3.loop) { MAP3.loop = true; MAP3.last = performance.now(); requestAnimationFrame(mapFrame); }
    } catch (err) { console.warn('Karte', err); R3N.failed = true; return _showHomeMap.call(this, tab); }
  }
  return d;
};
const _actMap = UI.act;
UI.act = function (a, ds, e) {
  if (a === 'mapcur') { const C = campSave(); MAP3.target = (C.etappe || 1) - 1; this.selEtappe = C.etappe || 1; this.selLevel = 0; mapRefreshSheet(); return; }
  if (a === 'lvsel' && document.querySelector('.campsheet') && document.querySelector('.map3d')) { this.selLevel = +ds.l; mapRefreshSheet(); return; }
  return _actMap.call(this, a, ds, e);
};
// Wenn Three.js erst nach dem Menue fertig geladen ist
window.addEventListener('three-ready', () => { if (document.querySelector('.home') && UI.tab === 'kampagne' && !document.querySelector('.map3d')) UI.showHome('kampagne'); });

/* ------------------------------------------------------------ Bildschleife */
function mapFrame(now) {
  if (!MAP3.c.isConnected) { MAP3.loop = false; return; }
  requestAnimationFrame(mapFrame);
  const dt = Math.min(0.05, (now - MAP3.last) / 1000); MAP3.last = now;
  const t = now / 1000, par = MAP3.c.parentNode, w = par.clientWidth, h = par.clientHeight;
  if (w !== MAP3.w || h !== MAP3.h) { MAP3.w = w; MAP3.h = h; MAP3.ren.setPixelRatio(Math.min(VIEW.dpr, 2)); MAP3.ren.setSize(w, h, false); MAP3.cam.aspect = w / Math.max(1, h); MAP3.cam.updateProjectionMatrix(); }
  // Schwung nach dem Loslassen, dann sanft einrasten
  if (Math.abs(MAP3.vel) > 0.05) { MAP3.target = clamp(MAP3.target + MAP3.vel * dt, -0.2, ETAPPEN.length - 0.8); MAP3.vel *= Math.exp(-dt * 5); }
  MAP3.scroll += (MAP3.target - MAP3.scroll) * (1 - Math.exp(-dt * 8));
  const z = -MAP3.scroll * ISLE_GAP, cam = MAP3.cam, narrow = clamp(420 / Math.max(300, w), 0.8, 1.35);
  cam.position.set(0, 700 * narrow, z + 640 * narrow); cam.lookAt(0, -10, z - 150);
  MAP3.isles.forEach((g, i) => { const p = islePos(i + 1); g.position.y = Math.sin(t * 0.9 + i * 1.3) * 6; g.position.x = p.x; });
  // Held und Ring auf der gewaehlten Insel
  const e = UI.selEtappe || 1, gi = MAP3.isles[e - 1];
  if (gi) {
    MAP3.ring.position.set(gi.position.x, gi.position.y + 10, gi.position.z); MAP3.ring.material.opacity = 0.45 + Math.sin(t * 3) * 0.2; MAP3.ring.rotation.z = t * 0.4;
    MAP3.sel.position.set(gi.position.x, 160, gi.position.z + 120);
    if (MAP3.hero) { poseChibi(MAP3.hero, { x: 0, y: 0, t, run: 0, phase: 0 }, dt); MAP3.hero.root.position.set(gi.position.x + 52, gi.position.y + 9, gi.position.z + 62); MAP3.hero.root.scale.setScalar(0.8); MAP3.hero.root.rotation.y = -0.3; }
  }
  MAP3.stars.material.opacity = 0.6 + Math.sin(t * 2) * 0.15;
  MAP3.ren.render(MAP3.sc, cam);
  // Namensschilder ueber den Inseln
  const v = new THREE.Vector3();
  MAP3.labels.forEach((el, i) => {
    const g = MAP3.isles[i]; if (!g) return;
    v.set(g.position.x, g.position.y + 150, g.position.z - 20).project(cam);
    const sx = (v.x + 1) / 2 * w, sy = (1 - v.y) / 2 * h, vis = v.z < 1 && sy > -60 && sy < h + 40;
    el.style.display = vis ? '' : 'none';
    if (vis) { el.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) translate(-50%, -50%)`; el.classList.toggle('sel', i + 1 === e); }
  });
  (MAP3.locks || []).forEach((el) => {
    const g = MAP3.isles[+el.dataset.k - 1]; if (!g) return;
    v.set(g.position.x, g.position.y + 30, g.position.z).project(cam);
    const sx = (v.x + 1) / 2 * w, sy = (1 - v.y) / 2 * h, vis = v.z < 1 && sy > -60 && sy < h + 40;
    el.style.display = vis ? '' : 'none'; if (vis) el.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) translate(-50%, -50%)`;
  });
  if (MAP3.back) MAP3.back.hidden = Math.abs(MAP3.scroll - ((campSave().etappe || 1) - 1)) < 1.2;
}
