'use strict';
/* ==========================================================================
   ANIMIERTE FIGUREN — Helden, Begleiter und menschliche Bosse.
   Koerper und Animationen: KayKit (Kay Lousberg, CC0, models/LICENSE-KayKit.txt).
   Nur Stoffkoerper (Schurke, Magier, Barbar), keine Ruestungen. Die Kleidung
   wird pro Held umgefaerbt; der Kopf ist unser eigener Chibi-Kopf am
   Kopfknochen, mit Frisur, Augen, Brille usw. wie im Buch.
   Solange die Modelle nicht geladen sind (oder ohne WebGL), bleiben die
   bisherigen gebauten Chibi-Figuren.
   ========================================================================== */

const FIG = { ready: false, loading: false, failed: false, gltf: {}, clips: {}, tex: {} };
const FIG_SCALE = 34;

/* ------------------------------------------------------------ Aussehen je Figur
   body: schurke | magier | barbar
   hair: kurz | mittel | lang | sehrlang | zopf | stachel | seite | glatze
   Farben: top (Hauptstoff), acc (Besatz), pants, boots, cape (Umhang, optional) */
const LOOK = {
  finn: { body: 'schurke', top: '#555866', pants: '#2c3346', boots: '#d8d8dc', skin: '#f0cfb4', hair: 'mittel', hairCol: '#2a1c16', eye: '#5a3a1a', glasses: true, weapon: 'none' },
  peter: { body: 'barbar', top: '#6a5a3a', acc: '#8a7a50', pants: '#3a3020', boots: '#2a2014', skin: '#e8c6ac', hair: 'kurz', hairCol: '#3a2a1a', eye: '#5a4028', weapon: 'staff' },
  emma: { body: 'magier', top: '#243a66', acc: '#c8d8ff', pants: '#1a2030', boots: '#141820', skin: '#f4e0d4', hair: 'lang', hairCol: '#eeeef6', eye: '#4aa8ff', weapon: 'sword', blade: '#bfe8ff' },
  lena: { body: 'magier', top: '#3a2a5a', acc: '#b8a0ff', pants: '#1a1028', boots: '#1a1420', skin: '#f0dcd0', hair: 'sehrlang', hairCol: '#2a1a3a', eye: '#a07aff', weapon: 'bow' },
  fabian: { body: 'schurke', top: '#2a3a5a', pants: '#1e2434', boots: '#1a1a20', skin: '#ecd8c8', hair: 'stachel', hairCol: '#e8cf7a', eye: '#4a7ac8', weapon: 'none' },
  sil: { body: 'schurke', top: '#2a2f5a', pants: '#1e2434', boots: '#1a1a20', skin: '#ecd8c8', hair: 'seite', hairCol: '#e8cf7a', eye: '#a07aff', weapon: 'knife' },
  fex: { body: 'schurke', top: '#3a0a18', pants: '#14040a', boots: '#1a0a10', cape: '#6a1a2a', skin: '#f0e4e0', hair: 'seite', hairCol: '#141014', eye: '#ff2a44', fangs: true, weapon: 'knife2' },
  leo: { body: 'magier', top: '#e0dcd0', acc: '#8a867a', pants: '#8a867a', boots: '#3a3028', skin: '#e0c0a0', hair: 'glatze', eye: '#d8e0e8', blind: true, hat: '#8a6a3e', weapon: 'katana' },
  chris: { body: 'schurke', top: '#1a2a28', pants: '#0a1210', boots: '#101010', skin: '#e8c8b0', hair: 'kurz', hairCol: '#141414', eye: '#4ff0cc', mask: '#1e3a36', weapon: 'none' },
  leander: { body: 'schurke', top: '#4a5260', pants: '#2a2e38', boots: '#3a3e48', skin: '#e8c6ac', hair: 'mittel', hairCol: '#3a2a1e', eye: '#6ab8e8', goggles: true, scale: 0.8, weapon: 'none' },
  agathon: { body: 'magier', top: '#1a1424', acc: '#8a6aff', pants: '#06040a', boots: '#0a0810', cape: '#2a1a4a', skin: '#d8d0e0', hair: 'sehrlang', hairCol: '#14101c', eye: '#8a6aff', weapon: 'sword', blade: '#c8b0ff' },
  sam: { body: 'schurke', top: '#3a5a4a', pants: '#2a3040', boots: '#1a1a20', skin: '#e8c8a8', hair: 'mittel', hairCol: '#6a4a2a', eye: '#3a8a6a', weapon: 'none' },
  mia: { body: 'magier', top: '#2a2438', acc: '#a07aff', pants: '#0c0a14', boots: '#2a2030', skin: '#8a5a3e', hair: 'zopf', hairCol: '#1a100c', eye: '#e8e0ff', scale: 0.85, weapon: 'none' },
  draco: { body: 'barbar', top: '#2a2018', acc: '#c8902a', pants: '#0c0806', boots: '#3a2204', cape: '#8a5a10', skin: '#d8c0b0', hair: 'stachel', hairCol: '#8a1a14', eye: '#ffc040', horns: true, weapon: 'axe' },
  // menschliche Bosse
  b_kyle: { body: 'schurke', top: '#8a4a1a', pants: '#2a1a10', boots: '#1a1010', skin: '#e8c8a8', hair: 'stachel', hairCol: '#d8801a', eye: '#e8a020', weapon: 'none' },
  b_rylee: { body: 'barbar', top: '#4a4a52', acc: '#8a8a94', pants: '#2a2a30', boots: '#1a1a20', skin: '#e0c4a8', hair: 'kurz', hairCol: '#1a1a1a', eye: '#5a4030', weapon: 'none' },
  b_brandon: { body: 'schurke', top: '#2a4a6a', pants: '#1a2230', boots: '#101418', skin: '#ecd0b8', hair: 'seite', hairCol: '#6a4a2a', eye: '#4a6a8a', weapon: 'staff' },
  b_nate: { body: 'barbar', top: '#6a6e78', acc: '#c8ccd8', pants: '#3a3e48', boots: '#1a1c20', skin: '#b8bcc8', hair: 'kurz', hairCol: '#2a2a2a', eye: '#3a3a4a', weapon: 'none' },
  b_ben: { body: 'barbar', top: '#5a3a1a', acc: '#8a6a3a', pants: '#2a1c10', boots: '#1a120a', skin: '#e0b898', hair: 'kurz', hairCol: '#3a2a18', eye: '#3a2a18', weapon: 'axe' },
  b_kenny: { body: 'schurke', top: '#3a6a3a', pants: '#1a3a1a', boots: '#102010', skin: '#d8c0a8', hair: 'kurz', hairCol: '#2a2a1a', eye: '#6ab86a', weapon: 'knife' },
  b_multi: { body: 'schurke', top: '#3a2a4a', pants: '#1a1424', boots: '#100c14', skin: '#e0c8b8', hair: 'mittel', hairCol: '#1a1420', eye: '#a07aff', mask: '#2a2030', weapon: 'knife2' },
  b_dillan: { body: 'barbar', top: '#5a5a3a', acc: '#8a7a4a', pants: '#3a3a28', boots: '#2a2014', skin: '#d8b898', hair: 'kurz', hairCol: '#4a3a28', eye: '#4a3a28', weapon: 'axe' },
  b_clark: { body: 'schurke', top: '#2a1a3a', pants: '#140c1e', boots: '#0c0810', cape: '#3a1a5a', skin: '#ecdcd8', hair: 'mittel', hairCol: '#8a4ac8', eye: '#ff3a4e', fangs: true, weapon: 'knife' },
  b_jin: { body: 'barbar', top: '#3a2a2a', acc: '#8a2a2a', pants: '#1a1414', boots: '#100c0c', cape: '#5a1a1a', skin: '#e0ccc4', hair: 'kurz', hairCol: '#2a2020', eye: '#ff3a3a', fangs: true, weapon: 'axe' },
  b_edward: { body: 'magier', top: '#2a2e3a', acc: '#a8b0c8', pants: '#14161e', boots: '#0c0e14', cape: '#3a4058', skin: '#e4e0e4', hair: 'lang', hairCol: '#c8ccd8', eye: '#ff4a5a', fangs: true, weapon: 'none' },
  b_vadeen: { body: 'barbar', top: '#4a2a14', acc: '#c8903a', pants: '#1e140c', boots: '#140c08', cape: '#6a3a14', skin: '#dcc8c0', hair: 'stachel', hairCol: '#1a1410', eye: '#ff3a2a', fangs: true, weapon: 'staff' },
  b_paul: { body: 'barbar', top: '#3a4a3a', acc: '#c8b060', pants: '#1e281e', boots: '#101410', cape: '#2a3a2a', skin: '#e0c0a0', hair: 'kurz', hairCol: '#6a6a6a', eye: '#4a4a3a', weapon: 'none' },
  b_linda: { body: 'magier', top: '#e8e0d0', acc: '#c8a040', pants: '#d8d0c0', boots: '#8a7040', skin: '#f0d8c8', hair: 'mittel', hairCol: '#1a1418', eye: '#5a4a6a', girl: true, weapon: 'none' },
  b_lemon: { body: 'schurke', top: '#e8e0a0', pants: '#4a4a2a', boots: '#2a2a1a', skin: '#ecd0b8', hair: 'stachel', hairCol: '#e8d040', eye: '#8ad8ff', weapon: 'none' },
  b_gox: { body: 'barbar', top: '#7a1a14', acc: '#ff8a2a', pants: '#3a0c0a', boots: '#1e0806', cape: '#a02a14', skin: '#d8a888', hair: 'stachel', hairCol: '#ff6a1a', eye: '#ffb02a', weapon: 'axe' },
  b_kiln: { body: 'schurke', top: '#1a1a2a', pants: '#0a0a14', boots: '#08080e', cape: '#4a0a1a', skin: '#ece4e4', hair: 'seite', hairCol: '#e8e8f0', eye: '#ff2a3a', fangs: true, weapon: 'knife2' },
  b_vicky: { body: 'magier', top: '#e8e8f0', acc: '#4a8ac8', pants: '#1a2a4a', boots: '#0a1428', skin: '#f4e0d4', hair: 'zopf', hairCol: '#f0dc8a', eye: '#4a8ac8', girl: true, weapon: 'none' },
  bloodsucker: { body: 'schurke', top: '#6a3a38', pants: '#4a3030', boots: '#2a1a1a', skin: '#d0ccc4', hair: 'glatze', eye: '#0a0000', fangs: true, weapon: 'none', scale: 1.1 },
  b_mono: { body: 'schurke', top: '#1a2440', pants: '#0a1020', boots: '#101018', skin: '#e8d0c0', hair: 'stachel', hairCol: '#1a1a2a', eye: '#6a8ad8', weapon: 'sword', blade: '#d8e8ff' },
  b_ian: { body: 'schurke', top: '#6a4a2a', pants: '#3a2a1a', boots: '#2a1a10', cape: '#4a3a2a', skin: '#e0c0a0', hair: 'kurz', hairCol: '#6a4a2a', eye: '#4a3020', hat: '#6a4a2a', weapon: 'staff' },
  b_duke: { body: 'schurke', top: '#3a3a44', pants: '#1a1a20', boots: '#101014', cape: '#2a2a34', skin: '#e8c8b0', hair: 'kurz', hairCol: '#c8c8d0', eye: '#4a4a5a', weapon: 'sword' },
  b_hilston: { body: 'schurke', top: '#2a2a3a', pants: '#141420', boots: '#101014', cape: '#5a1a1a', skin: '#e8d0c0', hair: 'lang', hairCol: '#e8e0d0', eye: '#8a3a2a', weapon: 'katana' },
  b_silva: { body: 'schurke', top: '#2a1a24', pants: '#0e080c', boots: '#0a0608', cape: '#6a0a18', skin: '#e4dcd8', hair: 'kurz', hairCol: '#1a1418', eye: '#ff2a3a', fangs: true, weapon: 'sword' },
  b_cindy: { body: 'magier', top: '#5a1a3a', acc: '#e8a0c0', pants: '#1a0610', boots: '#1a0610', cape: '#8a1a3a', skin: '#f0e4e4', hair: 'sehrlang', hairCol: '#e8a0c0', eye: '#ff3a6a', fangs: true, weapon: 'none' },
  b_laxmus: { body: 'magier', top: '#3a0a14', acc: '#ff3a4e', pants: '#12040a', boots: '#0a0206', cape: '#5a0610', skin: '#dcd0d8', hair: 'lang', hairCol: '#c8c0d0', eye: '#ff1a2a', fangs: true, crown: '#ff3a4e', wings: '#3a0a18', weapon: 'none' },
  b_jim: { body: 'magier', top: '#1a1a24', acc: '#6a6a7a', pants: '#0a0a10', boots: '#08080c', cape: '#2a0a14', skin: '#e0d4d0', hair: 'stachel', hairCol: '#2a2a30', eye: '#ff4a3a', fangs: true, glasses: true, weapon: 'staff' }
};
// Formen im Lauf: Augen, Umhang, Krone, dunklere Kleidung
function lookFor(id, tier) {
  const L0 = LOOK[id]; if (!L0) return null;
  const L = Object.assign({}, L0), t = tier || 0, acc = typeof heroTierCol === 'function' ? heroTierCol(id, t) : '#ff3a4e';
  const evo = id === 'finn' || (HEROES[id] && HEROES[id].evoHero);
  if (!evo) return L;
  if (id === 'finn') { if (t >= 2) L.eye = '#ff2a3a'; if (t >= 3) { L.top = '#262230'; L.cape = shadeHex(acc, -0.45); } }
  else if (t >= 3 && !L.cape) L.cape = shadeHex(acc, -0.45);
  if (id === 'peter' && t >= 1) { L.skin = t >= 2 ? '#d8dcd0' : '#c8d4b8'; L.eye = '#9aff9a'; }
  if (t >= 4) L.crown = acc;
  L.tierKey = t;
  return L;
}

/* ------------------------------------------------------------ Laden */
function figLoad() {
  if (FIG.loading || FIG.ready || FIG.failed || !window.GLTFLoader || !window.THREE) return;
  FIG.loading = true;
  const L = new GLTFLoader(), names = ['schurke', 'magier', 'barbar', 'anim'];
  const B = window.FIG_B64; // Einzeldatei: Modelle eingebettet
  const one = (n) => (B && B[n] ? L.parseAsync(Uint8Array.from(atob(B[n]), (c) => c.charCodeAt(0)).buffer, '') : L.loadAsync('models/' + n + '.glb'));
  Promise.all(names.map(one)).then((res) => {
    names.forEach((n, i) => { FIG.gltf[n] = res[i]; });
    for (const c of res[3].animations) FIG.clips[c.name] = c;
    FIG.ready = true; FIG.loading = false;
    figRebuildAll();
  }).catch((e) => { console.warn('Figuren nicht geladen', e); FIG.failed = true; FIG.loading = false; });
}
window.addEventListener('three-ready', figLoad);
if (window.THREE && window.GLTFLoader) figLoad();
// bereits gebaute Chibi-Figuren durch die neuen ersetzen
function figRebuildAll() {
  if (typeof R3N !== 'undefined' && R3N.ready) {
    for (const [, R] of R3N.heroes) R.root.removeFromParent(); R3N.heroes.clear();
    for (const [k, B] of R3N.bosses) if (B.human) { B.root.removeFromParent(); R3N.bosses.delete(k); }
  }
  if (typeof MAP3 !== 'undefined' && MAP3.hero) { MAP3.hero.root.removeFromParent(); MAP3.hero = null; MAP3.heroId = null; if (MAP3.ready) try { mapSetHero(); } catch (e) { /* egal */ } }
}

/* ------------------------------------------------------------ Kleidung umfaerben */
// Klassen nach Farbton/Helligkeit des KayKit-Farbatlas: Haut bleibt, Stoff/Besatz/Leder/Umhang werden umgefaerbt
const BODY_CLOTH = { schurke: [90, 200], magier: [215, 275], barbar: [185, 235] };
function figTexture(body, L) {
  const key = body + '|' + L.top + L.acc + L.pants + L.boots + L.cape + L.skin;
  if (FIG.tex[key]) return FIG.tex[key];
  const T = THREE;
  let map = null; FIG.gltf[body].scene.traverse((x) => { if (!map && x.isMesh && x.material.map) map = x.material.map; });
  const img = map.image, c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const D = g.getImageData(0, 0, c.width, c.height), a = D.data, col = new T.Color(), hsl = {};
  const tg = (hex) => { const h = {}; new T.Color(hex).getHSL(h); return h; };
  const top = tg(L.top), acc = tg(L.acc || shadeHex(L.top, 0.35)), pants = tg(L.pants || shadeHex(L.top, -0.4)), boots = tg(L.boots || '#1a1414'), cape = tg(L.cape || L.top);
  const cloth = BODY_CLOTH[body], tgt = [top, cape, acc, boots, pants];
  // Klassen: 0 Stoff, 1 Umhang, 2 Besatz, 3 Stiefel, 4 Hose/Leder, -1 unveraendert (Haut, Metall)
  const cls = (h, s, l) => {
    if (h >= 8 && h <= 38 && l > 0.64 && s > 0.3) return -1;
    if (s < 0.13) return -1;
    if (h >= cloth[0] && h <= cloth[1]) return 0;
    if (h >= 300 || (h <= 6 && s > 0.5)) return 1;
    if (h > 12 && h < 40 && s > 0.58) return 2;
    if (h <= 45) return l < 0.33 ? 3 : 4;
    return -1;
  };
  const sum = [0, 0, 0, 0, 0], n = [0, 0, 0, 0, 0], K = new Int8Array(a.length / 4);
  for (let i = 0, q = 0; i < a.length; i += 4, q++) { col.setRGB(a[i] / 255, a[i + 1] / 255, a[i + 2] / 255); col.getHSL(hsl); const k = cls(hsl.h * 360, hsl.s, hsl.l); K[q] = k; if (k >= 0) { sum[k] += hsl.l; n[k]++; } }
  const avg = sum.map((v, k) => (n[k] ? v / n[k] : 0.4));
  for (let i = 0, q = 0; i < a.length; i += 4, q++) {
    const k = K[q]; if (k < 0) continue;
    col.setRGB(a[i] / 255, a[i + 1] / 255, a[i + 2] / 255); col.getHSL(hsl);
    const t = tgt[k], rel = hsl.l / avg[k];
    col.setHSL(t.h, Math.min(1, t.s * 1.1), clamp((0.12 + t.l * 1.15) * (0.6 + 0.4 * rel), 0.05, 0.95)); // etwas aufgehellt: Toon-Licht dunkelt ab
    a[i] = col.r * 255; a[i + 1] = col.g * 255; a[i + 2] = col.b * 255;
  }
  g.putImageData(D, 0, 0);
  const t = new T.CanvasTexture(c); t.flipY = map.flipY; t.colorSpace = T.SRGBColorSpace; t.magFilter = T.NearestFilter; t.minFilter = T.NearestFilter;
  return (FIG.tex[key] = t);
}

/* ------------------------------------------------------------ Chibi-Kopf mit Frisur */
function figHead(L, mats) {
  const T = THREE, G = new T.Group(), r = 0.52;
  const M = (c, o) => { const m = new T.MeshToonMaterial(Object.assign({ color: new T.Color(c), gradientMap: R3N.grad }, o || {})); mats.push(m); return m; };
  const S = geo('fh_s', () => new T.SphereGeometry(1, 24, 18)), CAPG = geo('fh_c', () => new T.CapsuleGeometry(1, 1, 6, 12)), CONE = geo('fh_k', () => new T.ConeGeometry(1, 1, 10));
  const add = (g, m, p, s, rot, par) => { const x = new T.Mesh(g, m); x.position.set(p[0] * r, p[1] * r, p[2] * r); x.scale.set(s[0] * r, s[1] * r, s[2] * r); if (rot) x.rotation.set(rot[0], rot[1], rot[2]); (par || G).add(x); return x; };
  add(S, M(L.skin), [0, 0, 0], [1, 0.94, 0.92]);
  // Ohren
  for (const sd of [-1, 1]) add(S, M(L.skin), [sd * 0.93, -0.08, 0], [0.16, 0.24, 0.14]);
  // Gesicht
  const eyeM = new T.MeshBasicMaterial({ color: L.eye }), wM = new T.MeshBasicMaterial({ color: '#ffffff' }), dk = new T.MeshBasicMaterial({ color: '#1a1212' });
  for (const sd of [-1, 1]) {
    if (L.blind) add(S, eyeM, [sd * 0.36, -0.08, 0.88], [0.2, 0.04, 0.06]);
    else { add(S, dk, [sd * 0.36, -0.08, 0.855], [0.19, 0.26, 0.08]); add(S, eyeM, [sd * 0.36, -0.1, 0.87], [0.15, 0.2, 0.08]); add(S, wM, [sd * 0.36 - 0.05, 0.02, 0.93], [0.05, 0.06, 0.03]); }
    add(S, dk, [sd * 0.36, 0.22, 0.86], [0.16, 0.03, 0.04], [0, 0, -sd * 0.12]); // Augenbraue
  }
  add(S, new T.MeshBasicMaterial({ color: shadeHex(L.skin, -0.35) }), [0, -0.46, 0.86], [0.12, 0.04, 0.04]);
  if (L.fangs) for (const sd of [-1, 1]) add(CONE, wM, [sd * 0.06, -0.52, 0.87], [0.035, 0.08, 0.035], [Math.PI, 0, 0]);
  if (L.glasses) { const gm = new T.MeshBasicMaterial({ color: '#141414' }); for (const sd of [-1, 1]) add(geo('fh_t', () => new T.TorusGeometry(1, 0.12, 8, 24)), gm, [sd * 0.36, -0.08, 0.95], [0.27, 0.27, 0.2]); add(S, gm, [0, -0.06, 0.98], [0.1, 0.025, 0.025]); }
  if (L.mask) add(S, M(L.mask), [0, -0.4, 0.3], [0.94, 0.5, 0.72]);
  // Frisur
  if (L.hair !== 'glatze') {
    const H = M(L.hairCol), hs = L.hair;
    add(S, H, [0, 0.26, -0.14], [1.07, 0.84, 1.0]); // Kappe
    if (hs !== 'stachel') add(S, H, [0, 0.62, 0.44], [0.92, 0.3, 0.46], [0.35, 0, 0]); // Stirnfransen
    if (hs === 'seite') add(S, H, [0.32, 0.46, 0.66], [0.62, 0.22, 0.3], [0.5, 0.3, -0.5]);
    if (hs === 'mittel' || hs === 'lang' || hs === 'sehrlang') for (const sd of [-1, 1]) add(CAPG, H, [sd * 0.88, -0.12, 0.06], [0.2, hs === 'mittel' ? 0.3 : 0.55, 0.3], [0, 0, sd * 0.08]);
    if (hs === 'mittel') add(S, H, [0, -0.2, -0.55], [0.95, 0.7, 0.55]);
    if (hs === 'lang') { add(S, H, [0, -0.35, -0.55], [1.0, 0.95, 0.5]); for (const sd of [-1, 1]) add(CAPG, H, [sd * 0.78, -0.75, 0.2], [0.2, 0.4, 0.22]); }
    if (hs === 'sehrlang') { add(CAPG, H, [0, -1.05, -0.62], [0.92, 1.1, 0.42]); for (const sd of [-1, 1]) add(CAPG, H, [sd * 0.8, -1.0, 0.18], [0.2, 0.75, 0.22]); }
    if (hs === 'zopf') { add(S, H, [0, 0.35, -0.95], [0.3, 0.3, 0.3]); add(CAPG, H, [0, -0.35, -1.12], [0.2, 0.7, 0.2], [0.25, 0, 0]); }
    if (hs === 'stachel') for (let k = 0; k < 9; k++) { const aa = -1.3 + k * 0.33; add(CONE, H, [Math.sin(aa) * 0.7, 1.0 - Math.abs(aa) * 0.15, Math.cos(aa) * 0.25 - 0.1], [0.24, 0.75, 0.24], [-0.35, 0, -aa * 0.8]); }
    if (hs === 'kurz') add(S, H, [0, -0.02, -0.5], [0.94, 0.66, 0.5]);
  }
  if (L.hat) { add(geo('fh_h', () => new T.ConeGeometry(1, 1, 16)), M(L.hat), [0, 0.95, 0], [1.6, 0.6, 1.6]); add(geo('fh_hb', () => new T.CylinderGeometry(1, 1, 1, 16)), M(shadeHex(L.hat, -0.2)), [0, 0.7, 0], [1.75, 0.06, 1.75]); }
  if (L.goggles) { add(geo('fh_cy', () => new T.CylinderGeometry(1, 1, 1, 12)), M('#3a2a20'), [0, 0.5, 0.2], [1.02, 0.12, 1.02]); for (const sd of [-1, 1]) add(S, new T.MeshBasicMaterial({ color: '#6ab8e8' }), [sd * 0.3, 0.58, 0.9], [0.2, 0.16, 0.1]); }
  if (L.horns) for (const sd of [-1, 1]) add(CONE, M('#e8d8b0'), [sd * 0.55, 0.9, 0], [0.14, 0.6, 0.14], [0, 0, -sd * 0.5]);
  if (L.crown) for (let k = 0; k < 5; k++) { const aa = -1 + k * 0.5; add(CONE, M(L.crown, { emissive: new T.Color(L.crown), emissiveIntensity: 0.5 }), [Math.sin(aa) * 0.62, 1.05, Math.cos(aa) * 0.3 - 0.1], [0.1, 0.36, 0.1]); }
  return G;
}

/* ------------------------------------------------------------ Waffen */
function figWeapon(kind, L, mats) {
  const T = THREE, G = new T.Group();
  const M = (c, o) => { const m = new T.MeshToonMaterial(Object.assign({ color: new T.Color(c), gradientMap: R3N.grad }, o || {})); mats.push(m); return m; };
  const box = (c, p, s, o) => { const x = new T.Mesh(BOX(), M(c, o)); x.position.set(...p); x.scale.set(...s); G.add(x); return x; };
  if (kind === 'sword' || kind === 'katana') { const bl = L.blade || (kind === 'katana' ? '#e8e8f0' : '#c8d0dc'); box(bl, [0, 0.62, 0], [0.07, 1.05, 0.03], { emissive: new T.Color(bl), emissiveIntensity: 0.15 }); box('#c9a24c', [0, 0.1, 0], [0.3, 0.06, 0.08]); box('#3a2a20', [0, -0.05, 0], [0.06, 0.26, 0.06]); }
  else if (kind === 'bow') { const x = new T.Mesh(geo('fw_bow', () => new T.TorusGeometry(0.6, 0.035, 6, 16, Math.PI)), M('#6a4a2a')); x.rotation.set(0, Math.PI / 2, Math.PI / 2); G.add(x); }
  else return null;
  return G;
}

/* ------------------------------------------------------------ Figur bauen */
function buildFig(id, tier) {
  const T = THREE, L = lookFor(id, tier); if (!L) return null;
  r3nShared();
  const src = FIG.gltf[L.body], model = SkeletonUtils.clone(src.scene), mats = [];
  const tex = figTexture(L.body, L), bodyMat = new T.MeshToonMaterial({ map: tex, gradientMap: R3N.grad }); mats.push(bodyMat);
  let headBone = null, handR = null, handL = null;
  const keepW = { knife: /^Knife$/, knife2: /^Knife(_Offhand)?$/, staff: /^2H_Staff$/, axe: /^1H_Axe$/ }[L.weapon];
  model.traverse((x) => {
    if (x.isBone && x.name === 'head') headBone = x;
    if (x.isBone && x.name === 'handslotr') handR = x;
    if (x.isBone && x.name === 'handslotl') handL = x;
    if (!x.isMesh) return;
    x.frustumCulled = false;
    if (/Head|Hat/.test(x.name)) { x.visible = false; return; }
    if (/Cape/.test(x.name)) { x.visible = !!L.cape; x.material = bodyMat; return; }
    if (!x.isSkinnedMesh) { x.visible = !!(keepW && keepW.test(x.name)); if (x.visible) x.material = new T.MeshToonMaterial({ map: x.material.map, gradientMap: R3N.grad }); return; }
    x.material = bodyMat;
  });
  const head = figHead(L, mats); head.position.set(0, 0.5, 0.02); headBone.add(head);
  const w = figWeapon(L.weapon, L, mats); if (w && handR) handR.add(w);
  const root = new T.Group(), body = new T.Group(); root.add(body); body.add(model);
  body.scale.setScalar(FIG_SCALE * (L.scale || 1));
  // Fledermausfluegel (Vampirfuersten)
  let wings = null;
  if (L.wings) {
    const wg = geo('wingg', () => { const s = new T.Shape(); s.moveTo(0, 0); s.lineTo(34, 16); s.lineTo(30, 4); s.lineTo(26, -6); s.lineTo(18, -2); s.lineTo(12, -12); s.lineTo(6, -4); s.lineTo(0, -8); s.lineTo(0, 0); return new T.ShapeGeometry(s); });
    const wm = new T.MeshToonMaterial({ color: new T.Color(L.wings), gradientMap: R3N.grad, side: T.DoubleSide }); mats.push(wm);
    wings = [-1, 1].map((sd) => { const x = new T.Mesh(wg, wm); x.position.set(sd * 3, 38, -8); x.scale.set(sd, 1, 1); root.add(x); return x; });
  }
  const acc = heroTierCol(id, tier || 0);
  const aura = new T.Mesh(geo('ring', () => new T.RingGeometry(18, 22, 40)), new T.MeshBasicMaterial({ color: acc, transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
  aura.rotation.x = -Math.PI / 2; aura.position.y = 0.6; root.add(aura);
  const mixer = new T.AnimationMixer(model), act = {};
  for (const n in FIG.clips) act[n] = mixer.clipAction(FIG.clips[n]);
  const once = ['1H_Melee_Attack_Slice_Diagonal', 'Spellcast_Shoot', 'Unarmed_Melee_Attack_Punch_A', 'Dodge_Forward', 'Hit_A', 'Death_A', '2H_Melee_Attack_Spin', 'Cheer'];
  for (const n of once) if (act[n]) { act[n].setLoop(T.LoopOnce, 1); act[n].clampWhenFinished = true; }
  const attack = L.body === 'magier' || L.weapon === 'staff' ? 'Spellcast_Shoot' : L.weapon === 'none' ? 'Unarmed_Melee_Attack_Punch_A' : '1H_Melee_Attack_Slice_Diagonal';
  const R = { kay: true, root, body, model, mixer, act, cur: null, attack, mats, aura, wings, tier: tier || 0, id, yaw: 0, capeM: null, busyT: 0 };
  figPlay(R, 'Idle', 0);
  return R;
}
function figPlay(R, name, fade) {
  const a = R.act[name]; if (!a || R.cur === name) return a;
  const prev = R.cur && R.act[R.cur];
  a.reset(); a.setEffectiveWeight(1); a.play();
  if (prev && fade) prev.crossFadeTo(a, fade, false); else if (prev) prev.stop();
  R.cur = name; return a;
}
function poseFig(R, o, dt) {
  const run = o.run || 0;
  R.root.position.set(o.x, 0, zOf(o.y));
  if (o.face !== undefined) { const want = o.aimYaw !== undefined ? o.aimYaw : (o.face > 0 ? Math.PI / 2 : -Math.PI / 2); R.yaw += angDiff(R.yaw, want) * (1 - Math.exp(-dt * 14)); }
  R.root.rotation.y = R.yaw;
  R.busyT = Math.max(0, R.busyT - dt);
  if (o.dead) { if (R.cur !== 'Death_A') figPlay(R, 'Death_A', 0.1); }
  else if (o.dodge && R.cur !== 'Dodge_Forward') { figPlay(R, 'Dodge_Forward', 0.05); R.busyT = 0.45; }
  else if (o.cast > 0 && !R.casting && R.busyT <= 0) { const a = figPlay(R, R.attack, 0.06); if (a) a.timeScale = 1.6; R.busyT = 0.42; R.casting = true; }
  else if (R.busyT <= 0) {
    const want = run > 0.2 ? 'Running_A' : 'Idle';
    const a = figPlay(R, want, 0.15); if (a && want === 'Running_A') a.timeScale = 0.75 + run * 0.45;
  }
  if (!(o.cast > 0)) R.casting = false;
  R.mixer.update(dt);
  if (R.wings) R.wings.forEach((w, i) => { const sd = i ? 1 : -1; w.rotation.y = sd * (0.5 + Math.sin((o.t || 0) * 5) * 0.35); });
  R.aura.rotation.z += dt * 1.5; R.aura.material.opacity = 0.35 + Math.sin((o.t || 0) * 3) * 0.15;
  const f = (o.flash || 0) * 0.45;
  for (const m of R.mats) { if (!m.userData.e0) { m.userData.e0 = m.emissive.clone(); m.userData.ei0 = m.emissiveIntensity; } if (f > 0) { m.emissive.set(o.flashCol || '#ff3a3a'); m.emissiveIntensity = f; } else { m.emissive.copy(m.userData.e0); m.emissiveIntensity = m.userData.ei0; } }
  R.root.visible = o.visible !== false;
}

/* ------------------------------------------------------------ Einklinken */
const _buildChibiFig = buildChibi, _poseChibiFig = poseChibi;
buildChibi = function (id, tier) {
  if (FIG.ready && LOOK[id]) { try { const R = buildFig(id, tier); if (R) return R; } catch (e) { console.warn('Figur', id, e); } }
  return _buildChibiFig(id, tier);
};
poseChibi = function (R, o, dt) { return R.kay ? poseFig(R, o, dt) : _poseChibiFig(R, o, dt); };
