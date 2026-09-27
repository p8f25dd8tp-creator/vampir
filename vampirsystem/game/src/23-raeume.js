'use strict';
/* ==========================================================================
   BEGEHBARE RAEUME der Akademie (eigene Gestaltung)
   Im Hof hat jedes Gebaeude eine Tuer. Drinnen laeuft man frei herum; alle
   Ziele, die vorher vor dem Gebaeude lagen (Schlafen, Buecher, Kaempfe,
   Layla, VR-Raum …), liegen jetzt an passenden Stellen im Raum.
   Dazu ein paar Dinge zum Erkunden (einmalig +2 EP). Raus geht es durch die
   Tuer – man steht wieder davor.
   ========================================================================== */

const ROOMS = {
  WOHNHEIM: {
    name: 'Wohnheim · Zimmer 23', art: 'zimmer23', w: 380, h: 520, exit: [190, 490],
    blocks: [{ x: 20, y: 60, w: 70, h: 120 }, { x: 155, y: 60, w: 70, h: 120 }, { x: 290, y: 60, w: 70, h: 120 }, { x: 20, y: 250, w: 90, h: 40 }, { x: 270, y: 250, w: 90, h: 40 }],
    spots: { Schlafen: [55, 205], Zimmer: [55, 205], Nacht: [190, 205], Vorden: [300, 320], System: [65, 320], Peter: [190, 330], Nachricht: [65, 320], Shop: [65, 320], default: [[190, 400], [300, 400], [80, 400]] },
    lore: [
      { key: 'buch', label: 'Das schwarze Buch', at: [40, 245], text: 'Das Buch deiner Eltern. Seit dem Blutstropfen öffnet es sich nur noch für dich.' },
      { key: 'fenster', label: 'Fenster', at: [330, 205], text: 'Draußen die Militärstadt: Lichter, Drohnen, Mauern. Hier beginnt die Wehrpflicht.' }
    ],
    npcs: (night) => (night ? [] : [{ id: 'vorden', at: [330, 300], watch: 'player' }, { id: 'peter', at: [220, 250], watch: 'player' }])
  },
  BIBLIOTHEK: {
    name: 'Bibliothek', art: 'bibliothek', w: 420, h: 600, exit: [210, 570],
    blocks: [{ x: 20, y: 60, w: 30, h: 200 }, { x: 370, y: 60, w: 30, h: 200 }, { x: 100, y: 80, w: 70, h: 24 }, { x: 250, y: 80, w: 70, h: 24 }, { x: 100, y: 180, w: 70, h: 24 }, { x: 250, y: 180, w: 70, h: 24 }, { x: 130, y: 330, w: 160, h: 40 }],
    spots: { Bibliothek: [210, 140], Layla: [110, 300], Blut: [110, 300], Logan: [320, 300], Labor: [320, 300], default: [[210, 460], [320, 460], [100, 460]] },
    lore: [
      { key: 'regal', label: 'Regal: Fähigkeitsbücher', at: [75, 200], text: 'Fähigkeitsbücher, sortiert nach Stufen. Die wertvollen stehen hinter Glas – für Stufe-1er unerreichbar.' },
      { key: 'lesesaal', label: 'Lesesaal', at: [210, 400], text: 'Leise Seiten, müde Gesichter. Hier lernen die Schüler für die nächste Prüfung.' }
    ],
    npcs: (night) => (night ? [] : [{ id: 's2', at: [250, 400], watch: 'player' }, { id: 's4', at: [170, 270] }])
  },
  KANTINE: {
    name: 'Kantine', art: 'kantine', w: 340, h: 600, exit: [170, 570],
    blocks: [{ x: 18, y: 150, w: 70, h: 26 }, { x: 252, y: 150, w: 70, h: 26 }, { x: 18, y: 440, w: 70, h: 26 }, { x: 252, y: 440, w: 70, h: 26 }],
    spots: { Kantine: [170, 300], default: [[170, 300], [170, 200], [100, 330]] },
    lore: [{ key: 'ausgabe', label: 'Essensausgabe', at: [170, 60], text: 'Wer hier wo sitzt, entscheidet die Stufe. Die Stufe-1er bekommen die Tische am Rand.' }],
    npcs: (night) => (night ? [] : [{ id: 's1', at: [60, 200], watch: 'player' }, { id: 's3', at: [290, 210] }, { id: 'zweit', at: [290, 480] }])
  },
  TRAININGSHALLE: {
    name: 'Trainingshalle', art: 'halle', w: 340, h: 680, exit: [170, 650],
    blocks: [],
    spots: { 'VR': [270, 200], Power: [270, 200], Training: [170, 300], Waffenklasse: [170, 300], Duell: [170, 300], Trainingshalle: [170, 300], Herausforderung: [270, 200], default: [[170, 300], [80, 220], [270, 200]] },
    lore: [{ key: 'geraete', label: 'Geräteregal', at: [40, 420], text: 'Bälle, Gewichte, Übungswaffen. Wer nachts trainiert, hat die Halle für sich.' }],
    npcs: (night) => (night ? [] : [{ id: 's3', at: [80, 500], watch: 'player' }])
  }
};
if (typeof ARENA_ART !== 'undefined') { ARENA_ART.zimmer23 = ARENA_ART.zimmer23 || ARENA_ART.halle; ARENA_ART.bibliothek = ARENA_ART.bibliothek || ARENA_ART.halle; }

function roomOf(A, P) {
  const k = HUB_SCALE;
  return (A.buildings || []).find((b) => b.door !== undefined && Math.abs(P.x - b.door) < 60 * k && P.y > b.y && P.y < b.y + b.h + 70 * k);
}
function enterRoom(b) {
  SAVE.hubPos = { x: b.door, y: b.y + b.h + 36 * HUB_SCALE };
  SAVE.hubRoom = b.label; SAVE.roomPos = null; writeSave();
  G = null; sfx('card'); startMission('akademie');
  banner(ROOMS[b.label].name.toUpperCase());
}
function exitRoom() { SAVE.hubRoom = null; SAVE.roomPos = null; writeSave(); G = null; sfx('card'); startMission('akademie'); banner('AKADEMIEHOF'); }

const _hubSetupRooms = hubSetup;
hubSetup = function () {
  const opt = _hubSetupRooms();
  const A = opt.arena, inside = {};
  for (const b of A.buildings || []) inside[b.label] = [];
  const keep = [];
  for (const P of A.pois || []) { const b = /Aula/.test(P.label) ? null : roomOf(A, P); if (b && ROOMS[b.label]) inside[b.label].push(P); else keep.push(P); }
  const cur = SAVE.hubRoom;
  if (cur && ROOMS[cur]) return roomSetup(cur, inside[cur], opt);
  for (const b of A.buildings || []) {
    if (!ROOMS[b.label]) continue;
    const list = inside[b.label], story = () => list.some((P) => !(P.hidden && P.hidden()) && P.col === '#ff9ab0');
    const name = b.label.charAt(0) + b.label.slice(1).toLowerCase();
    keep.push({ x: b.door, y: b.y + b.h + 16 * HUB_SCALE, label: name + ' betreten', get col() { return story() ? '#ff9ab0' : '#e8dcc0'; }, action: () => enterRoom(b) });
  }
  A.pois = keep;
  return opt;
};
function roomSetup(key, pois, hubOpt) {
  const R = ROOMS[key], night = SAVE.day.night;
  const used = new Set(), place = (P) => {
    for (const kw in R.spots) if (kw !== 'default' && P.label.includes(kw) && !used.has(kw)) { used.add(kw); return R.spots[kw]; }
    const d = R.spots.default.find((s) => !used.has('d' + s)); if (d) { used.add('d' + d); return d; }
    return R.spots.default[0];
  };
  const list = pois.map((P) => { const [x, y] = place(P); P.x = x; P.y = y; return P; });
  for (const L of R.lore) list.push({ x: L.at[0], y: L.at[1], label: L.label, col: '#9ad8ff', hidden: () => false, action: () => {
    const first = !SAVE.flags['lore_' + L.key]; SAVE.flags['lore_' + L.key] = true; writeSave();
    sysMsg({ head: L.label.toUpperCase(), lines: [L.text], kv: first ? [['EP', '+2']] : [] }, 3800); if (first) addExp(2); sfx('card');
  } });
  list.push({ x: R.exit[0], y: R.exit[1], label: 'Hinaus in den Hof', col: '#e8dcc0', action: exitRoom });
  const at = SAVE.roomPos && SAVE.roomPos.room === key ? [SAVE.roomPos.x, SAVE.roomPos.y] : [R.exit[0], R.exit[1] - 50];
  return {
    arena: { art: R.art, w: R.w, h: R.h, blocks: R.blocks.map((b) => Object.assign({}, b, { invisible: true })), pois: list, night, sun: [], shade: [], room: key, roomName: R.name },
    playerAt: at, foes: [], npcs: R.npcs(night),
    inspect: hubOpt.inspect, hub: true, room: key, onTick: hubOpt.onTick
  };
}
// beim Verlassen fuer Missionen: Position im Raum merken (der Hof behaelt seine Tuerposition)
leaveHub = function (fn) {
  if (G && G.opt.hub && G.player) { if (G.opt.room) SAVE.roomPos = { room: G.opt.room, x: G.player.x, y: G.player.y + 20 }; else SAVE.hubPos = { x: G.player.x, y: G.player.y + 24 }; }
  G = null; writeSave(); fn();
};

/* ------------------------------------------------------------ 3D: Zimmer 23 */
ARENA3D.zimmer23 = function (A, scene) {
  const T = THREE, W = A.w * S3, H = A.h * S3, night = !!A.night;
  const floor = noiseTex('#7a6a58', ['rgba(0,0,0,0.08)', 'rgba(255,240,220,0.06)'], 51, [(W + 2) / 2.5, (H + 2) / 2.5], (g) => { g.strokeStyle = 'rgba(40,30,20,0.35)'; g.lineWidth = 2; for (let y = 0; y < 256; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); } });
  groundPlane(scene, W + 2, H + 2, floor, { std: true, rough: 0.5 }).position.set(W / 2, 0, H / 2);
  const wallC = night ? '#3a3a4e' : '#c8c0b0';
  box3(scene, W + 1, 3.2, 0.3, wallC, W / 2, 1.6, -0.15, { noOutline: true });
  for (const x of [-0.15, W + 0.15]) box3(scene, 0.3, 3.2, H + 1, wallC, x, 1.6, H / 2, { noOutline: true });
  const win = new T.Mesh(new T.PlaneGeometry(2.2, 1.4), new T.MeshBasicMaterial({ color: night ? '#2a3a6a' : '#bfe0ff' })); win.position.set(W - 1.6, 1.9, 0.01); scene.add(win);
  box3(scene, 2.4, 0.08, 0.2, '#6a5a4a', W - 1.6, 1.15, 0.1, { noOutline: true });
  // drei Betten (Quinn, Vorden, Peter) mit Decken und Kissen
  const blanket = ['#3a4a7a', '#7a2a3a', '#3a6a4a'];
  (A.blocks || []).slice(0, 3).forEach((b, i) => {
    const x = (b.x + b.w / 2) * S3, z = (b.y + b.h / 2) * S3, w = b.w * S3, d = b.h * S3;
    box3(scene, w, 0.35, d, '#5a4030', x, 0.25, z); box3(scene, w - 0.08, 0.14, d - 0.1, '#e8e4dc', x, 0.49, z, { noOutline: true });
    box3(scene, w - 0.06, 0.1, d * 0.62, blanket[i], x, 0.58, z + d * 0.18, { noOutline: true });
    box3(scene, w * 0.6, 0.12, 0.35, '#f4f0e8', x, 0.6, b.y * S3 + 0.3, { noOutline: true });
    box3(scene, w, 0.8, 0.08, '#5a4030', x, 0.6, b.y * S3 + 0.02);
  });
  // Schreibtische mit Lampe, das schwarze Buch
  (A.blocks || []).slice(3).forEach((b, i) => {
    const x = (b.x + b.w / 2) * S3, z = (b.y + b.h / 2) * S3, w = b.w * S3, d = b.h * S3;
    box3(scene, w, 0.06, d, '#8a6a4a', x, 0.75, z); for (const s of [-1, 1]) box3(scene, 0.05, 0.72, d - 0.1, '#5a4030', x + s * (w / 2 - 0.05), 0.36, z, { noOutline: true });
    const lamp = new T.PointLight('#ffd8a0', night ? 5 : 1.5, 4, 1.6); lamp.position.set(x + w / 3, 1.2, z); scene.add(lamp);
    part(fgeo('dlamp', () => new T.ConeGeometry(0.1, 0.15, 10, 1, true)), toonMat('#2a3a2a'), scene, x + w / 3, 1.05, z);
    if (i === 0) { const book = new T.Mesh(new T.BoxGeometry(0.32, 0.06, 0.24), toonMat('#0c0a0e')); book.position.set(x - 0.2, 0.81, z); scene.add(book); const gl = glowSprite3('#ff2a40', 0.7, 0.5); gl.position.set(x - 0.2, 0.9, z); scene.add(gl); R3.bookGlow = gl; }
  });
  // Spinde an der Seite, Teppich
  for (let k = 0; k < 3; k++) box3(scene, 0.5, 1.9, 0.5, '#6a7488', 0.3, 0.95, H * 0.62 + k * 0.52);
  const rug = new T.Mesh(new T.PlaneGeometry(2.6, 1.6), toonMat('#6a3a3a')); rug.rotation.x = -Math.PI / 2; rug.position.set(W / 2, 0.01, H * 0.62); scene.add(rug);
  scene.background = new T.Color(night ? '#0a0c16' : '#2a2a30'); scene.fog = new T.Fog(scene.background, 14, 30);
  scene.add(new T.HemisphereLight(night ? '#5a6aa8' : '#fff4e8', '#3a3026', night ? 0.6 : 1.1));
  sunLight(scene, W / 2, H / 2, 10, night ? '#8aa0ff' : '#fff0d8', night ? 0.8 : 1.6, [4, 8, -3]);
  const ceil = new T.PointLight('#fff0dc', night ? 2 : 5, 10, 1.6); ceil.position.set(W / 2, 3, H / 2); scene.add(ceil);
};
/* ------------------------------------------------------------ 3D: Bibliothek */
ARENA3D.bibliothek = function (A, scene) {
  const T = THREE, W = A.w * S3, H = A.h * S3, night = !!A.night;
  const carpet = noiseTex('#5a2a2a', ['rgba(0,0,0,0.12)', 'rgba(255,200,160,0.06)'], 61, [(W + 2) / 3, (H + 2) / 3]);
  groundPlane(scene, W + 2, H + 2, carpet).position.set(W / 2, 0, H / 2);
  box3(scene, W + 1, 5, 0.3, '#5a4638', W / 2, 2.5, -0.15, { noOutline: true });
  for (const x of [-0.15, W + 0.15]) box3(scene, 0.3, 5, H + 1, '#5a4638', x, 2.5, H / 2, { noOutline: true });
  for (let x = 1.5; x < W - 1; x += 3) { const w = new T.Mesh(new T.PlaneGeometry(1.2, 2.6), new T.MeshBasicMaterial({ color: night ? '#2a3a6a' : '#f0e0c0' })); w.position.set(x, 3.0, 0.01); scene.add(w); }
  const bookCols = ['#7a2a2a', '#2a4a7a', '#3a6a3a', '#8a6a2a', '#5a3a6a', '#2a2a2a'];
  const shelf = (b) => {
    const x = (b.x + b.w / 2) * S3, z = (b.y + b.h / 2) * S3, w = b.w * S3, d = b.h * S3, h = 2.4;
    box3(scene, w, h, d, '#4a3020', x, h / 2, z);
    const along = w > d, n = Math.floor((along ? w : d) / 0.09);
    for (let r = 0; r < 4; r++) for (const side of [-1, 1]) {
      const g = new T.Group();
      for (let i = 0; i < n; i++) { const bh = 0.28 + (hash2(i, r, 3) % 10) / 70; const m = new T.Mesh(fgeo('bk' + Math.round(bh * 100), () => new T.BoxGeometry(0.07, bh, 0.22)), toonMat(bookCols[hash2(i, r + side, 5) % bookCols.length])); m.position.set(along ? -w / 2 + 0.06 + i * 0.09 : 0, bh / 2, along ? 0 : -d / 2 + 0.06 + i * 0.09); if (!along) m.rotation.y = Math.PI / 2; g.add(m); }
      g.position.set(x + (along ? 0 : side * (w / 2 + 0.02)), 0.15 + r * 0.58, z + (along ? side * (d / 2 + 0.02) : 0)); scene.add(g);
    }
  };
  (A.blocks || []).slice(0, 6).forEach(shelf);
  const tb = (A.blocks || [])[6];
  if (tb) {
    const x = (tb.x + tb.w / 2) * S3, z = (tb.y + tb.h / 2) * S3, w = tb.w * S3, d = tb.h * S3;
    box3(scene, w, 0.08, d, '#6a4428', x, 0.76, z); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box3(scene, 0.07, 0.72, 0.07, '#3a2418', x + sx * (w / 2 - 0.1), 0.36, z + sz * (d / 2 - 0.1), { noOutline: true });
    for (const s of [-0.3, 0.3]) { part(fgeo('glamp', () => new T.CylinderGeometry(0.1, 0.16, 0.12, 12)), toonMat('#2a6a3a'), scene, x + s * w, 1.1, z); const pl = new T.PointLight('#ffe0a0', 4, 5, 1.6); pl.position.set(x + s * w, 1.3, z); scene.add(pl); const gl = glowSprite3('#ffe0a0', 0.5, 0.6); gl.position.set(x + s * w, 1.05, z); scene.add(gl); }
    for (let k = 0; k < 4; k++) { const bk = new T.Mesh(new T.BoxGeometry(0.28, 0.04, 0.2), toonMat(bookCols[k])); bk.position.set(x - w / 3 + k * w / 5, 0.82, z + (k % 2 ? 0.2 : -0.2)); bk.rotation.y = k * 0.4; scene.add(bk); }
  }
  scene.background = new T.Color('#140e0c'); scene.fog = new T.Fog('#140e0c', 14, 32);
  scene.add(new T.HemisphereLight(night ? '#5a6aa8' : '#ffe8d0', '#2a1a14', night ? 0.6 : 1.0));
  sunLight(scene, W / 2, H / 2, 12, night ? '#8aa0ff' : '#ffe0b0', night ? 0.7 : 1.6, [-3, 10, -5]);
  for (const z of [H * 0.3, H * 0.7]) { const pl = new T.PointLight('#ffe6c0', 5, 10, 1.6); pl.position.set(W / 2, 4, z); scene.add(pl); }
  const motes = 120, pos = new Float32Array(motes * 3), r2 = mulberry(9);
  for (let i = 0; i < motes; i++) { pos[i * 3] = r2() * W; pos[i * 3 + 1] = 0.3 + r2() * 3.5; pos[i * 3 + 2] = r2() * H * 0.6; }
  const mg = new T.BufferGeometry(); mg.setAttribute('position', new T.BufferAttribute(pos, 3));
  R3.motes = new T.Points(mg, new T.PointsMaterial({ size: 0.04, map: R3.glowTex, color: '#fff0d0', transparent: true, opacity: 0.5, blending: T.AdditiveBlending, depthWrite: false })); scene.add(R3.motes);
};
