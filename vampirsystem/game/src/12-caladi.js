'use strict';
/* ==========================================================================
   ETAPPE 7 — Caladi (Kapitel 111–138)
   Erste Portal-Exkursion: 72 Stunden Sonne, Zahnwuermer und Fluegelechsen,
   Berg Redshield, Sil, die Schattenleere, der Dalki und Peters Blutritual.
   Alle Texte eigene Zusammenfassungen, alle Figuren eigene Gestaltung.
   ========================================================================== */

Object.assign(LOOKS, {
  berg: { outfit: 'shirt', top: '#6a1a14', topL: '#9a3a26', topD: '#2e0a06', leg: '#2a1a16', legD: '#140c0a', shoe: '#1a1210', skin: '#ecccb0', skinD: '#ac8c70', hair: '#d8401e', eye: '#ffa030', hairStyle: 'spiky', angry: true, rim: '#ff8a3a', handGlow: '#ff8a3a' },
  vordenf: Object.assign({}, LOOKS.vorden, { handGlow: '#ff8a3a' }),
  sil: Object.assign({}, LOOKS.vorden, { eye: '#c8a0ff', glow: true, angry: true, rim: '#c8a0ff', handGlow: '#bfe8ff' }),
  ben: { outfit: 'uniform', top: '#4a3a2a', topL: '#76604a', topD: '#201810', leg: '#2a2218', legD: '#120e0a', shoe: '#1a1410', skin: '#d8b494', skinD: '#987454', hair: '#1a1410', eye: '#4a3a2a', hairStyle: 'short', trim: '#b0a070', angry: true, rim: '#c0a080' },
  erdschueler: Object.assign({}, LOOKS.s1, { angry: true, rim: '#c8a070' }),
  windschuetze: Object.assign({}, LOOKS.s2, { angry: true, rim: '#bff0d8' }),
  messerschueler: Object.assign({}, LOOKS.s4, { angry: true, rim: '#d0d0d8' }),
  dalki: { outfit: 'shirt', top: '#2a3a2a', topL: '#46604a', topD: '#101a10', leg: '#1e2a1e', legD: '#0c140c', shoe: '#101410', skin: '#5a6a4a', skinD: '#2e3a26', hair: '#5a6a4a', eye: '#ffd040', glow: true, hairStyle: 'bald', claws: 0.6, clawCol: '#4a5a3a', angry: true, tail: '#4a5a3a', spikes: 1, rim: '#b8e060' },
  eno: { outfit: 'shirt', top: '#e8ecf0', topL: '#ffffff', topD: '#a8b0b8', leg: '#3a3a44', legD: '#1a1a22', shoe: '#2a2020', skin: '#e0c4a8', skinD: '#a08468', hair: '#b8b0a8', eye: '#4a4a4a', glasses: true, hairStyle: 'bald', rim: '#9ad8ff' },
  leoruestung: Object.assign({}, LOOKS.leo, { outfit: 'uniform', top: '#1a1014', topL: '#3a1a22', topD: '#080406', leg: '#140a0c', legD: '#060203', trim: '#c01a2a', rim: '#ff3a4e' }),
  peterghul: Object.assign({}, LOOKS.peter, { skin: '#e8dcd4', skinD: '#a89890', eye: '#a060e0', rim: '#c080ff' })
});

/* ------------------------------------------------------------ Vorden (Feuer) und Sil als spielbare Figuren */
KITS.feuer = { // Vorden mit kopiertem Feuer: Faustkombo, aufgeladen ein Feuerstoss
  combo: COMBO,
  charged: { dmg: 3.5, win: 0.1, act: 0.05, rec: 0.42, cost: 22, lunge: -30, poise: 3, proj: { sp: 420, max: 200, col: '#ff8a3a', kind: 'fire', pierce: true } }
};
KITS.sil = { // Sil: Feuer, Eis und Erde zugleich (Kap. 120)
  combo: [
    { dmg: 1.5, win: 0.06, act: 0.07, rec: 0.16, reach: 36, arc: 1.1, kb: 60, cost: 8, lunge: 50 },
    { dmg: 1.5, win: 0.06, act: 0.07, rec: 0.18, reach: 36, arc: 1.1, kb: 70, cost: 8, lunge: 50 },
    { dmg: 2.5, win: 0.1, act: 0.09, rec: 0.3, reach: 50, arc: 1.4, kb: 160, cost: 12, lunge: 80, kick: true, ice: true }
  ],
  charged: { dmg: 5, win: 0.1, act: 0.05, rec: 0.4, cost: 20, lunge: -30, poise: 4, proj: { sp: 520, max: 280, col: '#c8a070', kind: 'spike', pierce: true } }
};
CHARS.vordenf = { name: 'Vorden', look: 'vordenf', kit: 'feuer', hp: 24, str: 13, agi: 13 };
CHARS.sil = { name: 'Sil', look: 'sil', kit: 'sil', hp: 30, str: 16, agi: 15 };

/* ------------------------------------------------------------ Szenen-Hintergrund und Arena */
SCENE_ART.wueste = function (g, W, H, u, t, glowField) {
  g.fillStyle = lg(g, 0, 0, 0, H * 0.6, [0, '#e8a860', 0.6, '#f8d8a0', 1, '#fff0d0']); g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.8; g.drawImage(glowSprite('#fff4c0'), W * 0.66 - u * 20, H * 0.14 - u * 20, u * 40, u * 40); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#fffbe8'; g.beginPath(); g.arc(W * 0.66, H * 0.14, u * 5, 0, TAU); g.fill();
  for (let k = 0; k < 4; k++) {
    const y = H * (0.5 + k * 0.12);
    g.fillStyle = shade('#d8a060', -k * 0.1); g.beginPath(); g.moveTo(0, H);
    for (let i = 0; i <= 10; i++) g.lineTo(W * i / 10, y + Math.sin(i * 1.3 + k * 2) * u * 4);
    g.lineTo(W, H); g.fill();
  }
  glowField('#fff0c0', 6);
};
// Wueste von Caladi: Sand, Duenen-Rippen, eine Oase, das verlassene Brunnenhaus
ARENA_ART.wueste = function (A) {
  const S = 2, c = mkCanvas(A.w * S, A.h * S), g = c.getContext('2d');
  g.scale(S, S);
  const rnd = mulberry(A.seed || 71);
  g.fillStyle = '#d8b07a'; g.fillRect(0, 0, A.w, A.h);
  for (let i = 0; i < 900; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(160,110,60,0.22)' : 'rgba(255,240,200,0.2)'; g.fillRect(rnd() * A.w, rnd() * A.h, 2, 2); }
  g.strokeStyle = 'rgba(150,100,50,0.28)'; g.lineWidth = 2;
  for (let y = 30; y < A.h; y += 46) { g.beginPath(); for (let x = 0; x <= A.w; x += 10) g.lineTo(x, y + Math.sin(x * 0.04 + y) * 6); g.stroke(); }
  if (A.oase) { // Oase
    const [ox, oy] = A.oase;
    g.fillStyle = '#6a8a4a'; g.beginPath(); g.ellipse(ox, oy, 70, 34, 0, 0, TAU); g.fill();
    g.fillStyle = lg(g, 0, oy - 20, 0, oy + 20, [0, '#4a9ac8', 1, '#2a6a9a']); g.beginPath(); g.ellipse(ox, oy, 52, 22, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(ox - 20, oy - 6, 24, 2);
  }
  for (const b of A.blocks || []) { // Mauerreste / Brunnenhaus
    g.fillStyle = '#9a7a5a'; g.fillRect(b.x, b.y + 8, b.w, b.h - 8); g.fillStyle = '#c8a07a'; g.fillRect(b.x, b.y, b.w, 10);
    g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 1; g.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
  }
  if (A.brunnen) { const [bx, by] = A.brunnen; g.fillStyle = '#7a6a5a'; g.beginPath(); g.arc(bx, by, 16, 0, TAU); g.fill(); g.fillStyle = '#1a1410'; g.beginPath(); g.arc(bx, by, 10, 0, TAU); g.fill(); }
  g.strokeStyle = 'rgba(0,0,0,0.2)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, A.w - 3, A.h - 3);
  return c;
};

/* ------------------------------------------------------------ Bestien von Caladi */
Object.assign(OBJ_ART, {
  zahnwurm(g, e) {
    const t = e.anim.t, up = e.state === 'wind' || e.state === 'active' ? 1 : e.state === 'down' ? 0 : 0.45 + Math.sin(t * 2 + e.id) * 0.08;
    const h = 8 + up * 30;
    g.fillStyle = 'rgba(120,80,40,0.5)'; g.beginPath(); g.ellipse(e.x, e.y, 18, 6, 0, 0, TAU); g.fill();
    g.fillStyle = '#b08858'; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + t * 0.3; g.beginPath(); g.arc(e.x + Math.cos(a) * 16, e.y + Math.sin(a) * 5, 3, 0, TAU); g.fill(); }
    if (e.state === 'down' && e.stateT > 0.8) return;
    g.save(); g.translate(e.x, e.y);
    if (e.state === 'down') g.globalAlpha = Math.max(0, 1 - e.stateT * 1.3);
    const sway = Math.sin(t * 3 + e.id) * 3 * up, lean = (e.face || 1) * up * 4;
    for (let k = 0; k < 6; k++) {
      const s = k / 5, x = sway * s + lean * s, y = -h * s;
      g.fillStyle = k % 2 ? '#c89a7a' : '#b8866a'; g.beginPath(); g.ellipse(x, y, 9 - s * 2, 5, 0, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(80,40,30,0.5)'; g.lineWidth = 0.8; g.stroke();
    }
    // Maul mit Zahnkranz
    const mx = sway + lean, my = -h - 3;
    g.fillStyle = '#3a1010'; g.beginPath(); g.ellipse(mx, my, 7, 4.5, 0, 0, TAU); g.fill();
    g.fillStyle = '#f0e8d8'; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; g.beginPath(); g.moveTo(mx + Math.cos(a) * 7, my + Math.sin(a) * 4.5); g.lineTo(mx + Math.cos(a) * 4, my + Math.sin(a) * 2.5); g.lineTo(mx + Math.cos(a + 0.3) * 7, my + Math.sin(a + 0.3) * 4.5); g.fill(); }
    if (e.flash > 0) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(1, e.flash * 10) * 0.6; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(mx * 0.5, -h * 0.5, 9, h * 0.6, 0, 0, TAU); g.fill(); }
    g.restore();
  },
  echse(g, e) {
    const t = e.anim.t, run = e.anim.run, ph = e.anim.phase;
    const shield = e.state !== 'stagger' && e.state !== 'down' && e.state !== 'active';
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(e.x, e.y + 1, 24, 6, 0, 0, TAU); g.fill();
    g.save(); g.translate(e.x, e.y); g.scale(e.face, 1);
    beastDown(g, e);
    g.strokeStyle = '#6a4a2a'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-14, -10); g.quadraticCurveTo(-28, -6 + Math.sin(t * 4) * 3, -36, -12); g.stroke();
    for (const [lx, o] of [[-9, 0], [-4, Math.PI], [7, Math.PI * 0.5], [11, Math.PI * 1.5]]) { const s = Math.sin(ph + o) * 5 * run; g.beginPath(); g.moveTo(lx, -9); g.lineTo(lx + s, 0); g.stroke(); }
    // Rumpf mit hellem, weichem Bauch
    g.fillStyle = lg(g, 0, -22, 0, -4, [0, '#a8783a', 1, '#6a4420']); g.beginPath(); g.ellipse(0, -13, 17, 8, 0, 0, TAU); g.fill();
    g.fillStyle = '#f0d8a8'; g.beginPath(); g.ellipse(2, -8, 12, 3, 0, 0, TAU); g.fill();
    g.fillStyle = '#9a6a30'; g.beginPath(); g.ellipse(18, -17, 8, 5, -0.15, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(22, -20); g.lineTo(31, -16); g.lineTo(22, -13); g.fill();
    glowDot(g, 20, -19, 3, '#ffd040', 0.8);
    // Fluegel: gefaltet vor dem Koerper als Panzer, sonst ausgebreitet
    g.fillStyle = 'rgba(120,70,40,0.92)'; g.strokeStyle = '#3a2210'; g.lineWidth = 1;
    if (shield) { g.beginPath(); g.moveTo(-6, -22); g.quadraticCurveTo(16, -34, 26, -10); g.lineTo(18, -4); g.quadraticCurveTo(10, -22, -6, -16); g.closePath(); g.fill(); g.stroke(); }
    else { const f = Math.sin(t * 14) * 6; g.beginPath(); g.moveTo(-4, -18); g.lineTo(-16, -38 - f); g.lineTo(-2, -32 - f); g.lineTo(8, -40 - f); g.lineTo(6, -18); g.closePath(); g.fill(); g.stroke(); }
    beastFlash(g, e, () => { g.beginPath(); g.ellipse(0, -13, 17, 8, 0, 0, TAU); g.fill(); });
    g.restore();
    if (e.state === 'stagger') { g.fillStyle = '#8ad8ff'; for (let k = 0; k < 3; k++) { const a = G.t * 6 + k * TAU / 3; g.beginPath(); g.arc(e.x + Math.cos(a) * 10, e.y - 40 + Math.sin(a) * 3, 1.8, 0, TAU); g.fill(); } }
  }
});

/* ------------------------------------------------------------ Gegner-KI */
const WURM_ATK = {
  bite: { type: 'swipe', wind: 0.5, act: 0.1, rec: 0.5, reach: 46, arc: 1.0, dmg: 1, col: '#e8c8a0' },
  dive: { type: 'lunge', wind: 0.6, act: 0.28, rec: 0.7, speed: 260, dmg: 1.5, shout: 'Sand!' }
};
// Zahnwurm (Basis, Kap. 113): gräbt sich unter dem Sand vor, beisst aus dem Boden
const AI_WURM = { pack: true,
  params: (e) => (ratAsleep(e) ? { range: 9999, speed: 0, cd: 1 } : { range: 40, speed: 50, cd: 1.3 }),
  choose: (e, d) => (ratAsleep(e) ? null : d < 60 ? WURM_ATK.bite : d < 170 ? WURM_ATK.dive : null) };
const ECHSE_ATK = {
  claw: { type: 'swipe', wind: 0.45, act: 0.1, rec: 0.45, reach: 44, arc: 1.0, dmg: 1.5, col: '#e8b870' },
  dive: { type: 'lunge', wind: 0.6, act: 0.24, rec: 0.7, speed: 320, dmg: 2, shout: '!' }
};
// Fluegelechse (Basis, Kap. 117): panzert sich vorn mit den Fluegeln, der Bauch ist weich
const AI_ECHSE = { pack: true, harden: true,
  params: (e) => (ratAsleep(e) ? { range: 9999, speed: 0, cd: 1 } : { range: 42, speed: 90, cd: 1.2 }),
  choose: (e, d) => (ratAsleep(e) ? null : d < 60 ? ECHSE_ATK.claw : d < 180 ? ECHSE_ATK.dive : null),
  onTick: (e, dt) => turnShell(e, 1.6, dt) };
const BERG_ATK = {
  boost: { type: 'lunge', wind: 0.5, act: 0.22, rec: 0.6, speed: 380, dmg: 2, shout: 'Flammenantrieb' },
  spin: { type: 'swipe', wind: 0.6, act: 0.12, rec: 0.55, reach: 54, arc: 3.1, dmg: 2, col: '#ff8a3a', shout: 'Drehtritt' },
  elbow: { type: 'swipe', wind: 0.3, act: 0.08, rec: 0.5, reach: 40, arc: 0.9, dmg: 2.5, col: '#ffb040' }
};
// Berg Redshield (Kap. 118): Flammenantrieb, Drehflammentritt, Ellbogen-Boost
const AI_BERG = {
  params: (e) => ({ range: 40, speed: 105, cd: e.hp < e.maxHp / 2 ? 0.8 : 1.05 }),
  choose: (e, d) => (d > 100 ? BERG_ATK.boost : d < 50 ? (Math.random() < 0.45 ? BERG_ATK.spin : BERG_ATK.elbow) : null)
};
const BOLZEN = { type: 'beam', wind: 0.55, act: 0.1, rec: 0.6, len: 230, width: 12, dmg: 1.5, col: '#bff0d8', shout: 'Bolzen' };
const AI_BOLZEN = { params: () => ({ range: 150, speed: 70, cd: 1.6 }), choose: (e, d) => (d < 240 ? BOLZEN : null) };
const MESSER = { type: 'swipe', wind: 0.35, act: 0.08, rec: 0.4, reach: 36, arc: 0.9, dmg: 1.5, col: '#e0e0e8', chain: { type: 'swipe', wind: 0.2, act: 0.08, rec: 0.5, reach: 36, arc: 0.9, dmg: 1.5, col: '#e0e0e8' } };
const AI_MESSER = { params: () => ({ range: 34, speed: 110, cd: 1.0 }), choose: (e, d) => (d < 52 ? MESSER : null) };
const DALKI_ATK = {
  punch: { type: 'swipe', wind: 0.5, act: 0.1, rec: 0.45, reach: 44, arc: 1.0, dmg: 2.5, col: '#b8e060' },
  kick: { type: 'lunge', wind: 0.55, act: 0.24, rec: 0.6, speed: 340, dmg: 3, shout: '!' },
  spear: { type: 'beam', wind: 0.6, act: 0.12, rec: 0.6, len: 240, width: 16, dmg: 3, col: '#c8d0dc', shout: 'Speer' }
};
// Dalki mit einem Stachel (Kap. 131–135): Haut haelt Blutskills ab, jede Wunde macht ihn schneller
const AI_DALKI = { skin: true,
  params: (e) => { const w = 1 - e.hp / e.maxHp; return { range: 42, speed: 85 + w * 90, cd: Math.max(0.5, 1.2 - w * 0.8) }; },
  choose: (e, d) => (d < 60 ? DALKI_ATK.punch : d < 130 ? DALKI_ATK.kick : DALKI_ATK.spear)
};

/* ------------------------------------------------------------ Hilfen */
function umbrella(G) { // Laylas Schirm: Schatten wandert mit Quinn (volle Kraft darunter)
  const q = G.party.find((m) => m.char === 'quinn');
  if (q && q.state !== 'down') G.arena.shade = [{ x: q.x - 16, y: q.y - 14, w: 32, h: 22, umb: true }];
}
function beastPack(kind, draw, ai, n, spots, hp, info) {
  return Array.from({ length: n }, (_, i) => ({ id: kind + i, draw, name: info.name, hp, poise: 3, r: 14, at: spots[i % spots.length], ai, expRate: 1, expKill: 12, info }));
}
function sunArena(extra) { const A = Object.assign({ art: 'wueste', w: 380, h: 620 }, extra); A.sun = [{ x: 0, y: 0, w: A.w, h: A.h }]; return A; }
const QUINN_SUN_HINT = 'Sonne: Quinns Werte halbiert – bleib unter Laylas Schirm';

/* ------------------------------------------------------------ Missionen */
Object.assign(MISSIONS, {
  caladi: {
    id: 'caladi', title: 'Caladi', src: 'Kapitel 111–113',
    scene: [
      { bg: 'kantine', portrait: 'vorden' },
      { narr: 'Die erste Portal-Exkursion: ein grünes Portal, eine Woche, Fünferteams, Kristalle sammeln. Ein Zehntel geht ans Militär.' },
      { narr: 'Vorden hat herausgefunden, dass der Stoß ins rote Portal eigentlich ihm galt. Die Spur führt ins Gebäude der Zweitklässler.' },
      { bg: 'wueste', portrait: 'layla' },
      { narr: 'Der Planet heißt Caladi: 72 Stunden Tag, 72 Stunden Nacht. Und sie kommen mitten in der Sonne an. Layla hat an einen Schirm gedacht, Vorden an Sonnencreme.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'WARNUNG', lines: ['Starke Sonne: Werte stark gesenkt.'] } },
      { bg: 'wueste', portrait: 'quinnvamp' },
      { narr: 'In der Schutzstation gibt es eine Reisendenhalle mit Schmiede, Ködern und einem Questbrett. Quinn erinnert sich an Sams Umhang – das Material stammt von einem geflügelten Wüstenwesen auf genau diesem Planeten.' },
      { narr: 'Ein Ladenbesitzer bedient lieber Militäranwärter als Stufe-1er. Quinn liest sein verschlossenes Bestiarium einfach per Analyse.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'BESTIARIUM', kv: [['Zahnwurm', 'Basis · an der Oase'], ['Flügelechse', 'Basis · Flügel hart, Bauch weich'], ['Brennschlange', 'Mittelstufe']] } },
      { sys: { head: 'KI', lines: ['Wer von dir „geblutet“ wurde, gehört zur Familie.', 'Die Kills deiner Familie bringen auch dir EP.'] } }
    ],
    after: () => { stepDone('caladi'); },
    next: 'zahnwurm'
  },
  zahnwurm: {
    id: 'zahnwurm', title: 'Die Oase', src: 'Kapitel 113–115', type: 'gefecht',
    scene: [
      { bg: 'wueste', portrait: 'erin' },
      { narr: 'An der Oase lauern Zahnwürmer unter dem Sand. Das Team teilt sich auf: Erin und Layla vorn, Quinn bleibt unter dem Schirm.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'TIPP', lines: ['Unter dem Schirm hat Quinn volle Kraft.', 'Mit den Team-Knöpfen links wechselst du zu Erin oder Layla.'] } }
    ],
    fight: {
      arena: sunArena({ oase: [190, 300] }), playerAt: [190, 520], party: ['quinn', 'erin', 'layla'], inspect: true, noFoeBar: true,
      foes: beastPack('wurm', 'zahnwurm', AI_WURM, 6, [[80, 200], [300, 180], [120, 400], [270, 420], [190, 140], [60, 320]], 6, { name: 'Zahnwurm', race: 'Bestie · Basis', ability: 'gräbt sich unter dem Sand vor', blood: 'ungenießbar' }),
      onTick: (G) => { umbrella(G); wakeTick(G, 3); const n = G.ents.filter((e) => e.team === 1 && e.state !== 'down').length; G.hint = G.t < 5 ? { text: QUINN_SUN_HINT } : { text: `Zahnwürmer: ${n}` }; }
    },
    won: [
      { bg: 'wueste', portrait: 'quinnvamp' },
      { narr: 'Unter dem Schirm zerdrückt Quinn einen Zahnwurm mit einer Hand. Peter bekommt Panik, Erin rettet ihn.' },
      { portrait: 'ben' },
      { narr: 'Aus der Ferne beobachtet Ben, ein Schüler mit einer Keule aus einem anderen Team. Ein Team ist nur so stark wie sein schwächstes Glied, meint er – und schaut auf Quinn und Peter.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'SYSTEM', lines: ['Als Vampir gibt jede Stufe zwei Wertepunkte.', 'Basis-Bestien geben dir nur noch wenig EP.'] } },
      { sys: { head: 'ANZEIGETAFEL', kv: [['Platz 1', '30 Kristalle'], ['Platz 2 · Logan', '24'], ['Euer Team', '15']] } }
    ],
    reward: { exp: 50 },
    after: () => { stepDone('zahnwurm'); },
    next: 'echsen'
  },
  echsen: {
    id: 'echsen', title: 'Flügelechsen', src: 'Kapitel 115–117', type: 'gefecht',
    scene: [
      { bg: 'wueste', portrait: 'erin' },
      { narr: 'Erin will in die rote Zone, wo die Flügelechsen leben. Quinn und Peter sollen am sicheren Rand warten – doch Quinn geht mit, der Schirm bleibt über ihm.' },
      { portrait: 'logan' },
      { narr: 'Unterwegs überholt sie Logan auf einem selbstgebauten Laufstuhl mit Hundebeinen.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'TAKTIK', lines: ['Die Echsen panzern sich vorn mit den Flügeln.', 'Greif von der Seite an – oder brich die Deckung mit Hammerschlag. Erins Eis bremst sie.'] } }
    ],
    fight: {
      arena: sunArena({ seed: 72, blocks: [{ x: 60, y: 250, w: 60, h: 30, invisible: true }, { x: 270, y: 360, w: 60, h: 30, invisible: true }] }), playerAt: [190, 520], party: ['quinn', 'erin', 'layla'], inspect: true, noFoeBar: true,
      foes: beastPack('echse', 'echse', AI_ECHSE, 4, [[100, 150], [290, 170], [190, 110], [300, 260]], 12, { name: 'Flügelechse', race: 'Bestie · Basis', ability: 'Flügelpanzer, Sturzflug', blood: '—' }),
      onTick: (G) => { umbrella(G); wakeTick(G, 2); const n = G.ents.filter((e) => e.team === 1 && e.state !== 'down').length; G.hint = G.t < 5 ? { text: 'Flügel vorn sind hart · von der Seite angreifen' } : { text: `Flügelechsen: ${n}` }; }
    },
    won: [
      { bg: 'wueste', portrait: 'berg' },
      { narr: 'Plötzlich brennen die Echsen: Berg Redshield, rote Haare, Feuerfähigkeit, Sohn einer der Großen Vier, jagt im selben Gebiet.' },
      { portrait: 'layla' },
      { narr: 'Layla „wirft“ Vorden in Bergs Richtung. Ein Handschlag – und Vorden hat das Feuer kopiert. Seine Uhr zeigt 8. Berg wird misstrauisch.' },
      { portrait: 'berg' },
      { who: 'Berg', text: 'Du verbrennst meine Beute mit meinem Feuer? Wir haben ein paar Fragen an dich.' }
    ],
    reward: { exp: 50 },
    after: () => { stepDone('echsen'); },
    next: 'berg'
  },
  berg: {
    id: 'berg', title: 'Berg Redshield', src: 'Kapitel 118, 120', type: 'boss',
    scene: [
      { bg: 'wueste', portrait: 'berg' },
      { narr: 'Berg hält Vorden für einen Dieb, der Familiengeheimnisse stiehlt. Er greift an: Flammenantrieb, Drehtritt mit Feuerklingen, ein Ellbogen-Boost, der seine Schläge beschleunigt.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'DUELL', lines: ['Du spielst Vorden mit kopiertem Feuer.', 'ANGRIFF halten: Feuerstoß.'] } }
    ],
    fight: {
      arena: sunArena({ seed: 73 }), playerAt: [190, 480], party: ['vordenf'], inspect: false, noDeath: true,
      foes: [{ id: 'berg', name: 'Berg Redshield', hp: 50, poise: 5, at: [190, 240], ai: AI_BERG, expRate: 0, info: { name: 'Berg Redshield', race: 'Mensch', ability: 'Feuer', blood: '—' } }],
      expBonus: () => 30,
      onTick: (G) => {
        const p = G.player;
        G.hint = G.silOn ? (G.t - G.silOn < 4 ? { text: '<b>SIL</b> sitzt auf dem Stuhl · Feuer, Eis und Erde' } : null) : G.t < 5 ? { text: 'Berg ist stark · weich aus, konter mit Feuer' } : null;
        if (!G.silOn && p.hp <= 2) { // Vorden geht k.o. – Sil uebernimmt (Kap. 118–120)
          G.silOn = G.t; p.char = 'sil'; p.kit = 'sil'; p.look = LOOKS.sil; p.maxHp = p.hp = CHARS.sil.hp; p.str = CHARS.sil.str; p.agi = CHARS.sil.agi; p.stam = p.maxStam;
          setState(p, 'idle'); G.tele.length = 0; G.slowT = 1; G.whiteFlash = 0.3; burst(p.x, p.y - 30, 20, '#c8a0ff'); banner('WER SITZT JETZT AUF DEM STUHL?');
        }
      }
    },
    won: [
      { bg: 'wueste', portrait: 'sil' },
      { narr: 'Das war nicht mehr Vorden. Sil treibt Berg mit Feuer, Eis und Erde zugleich in die Enge – er kann alle kopierten Zellen frei umwandeln.' },
      { who: 'Sil', text: 'Wo ist Quinn?' },
      { portrait: 'vorden' },
      { narr: 'Vorden holt sich die Kontrolle zurück und nennt seinen Namen: Blade. Berg erstarrt, verbeugt sich – sein Vater verlangt absoluten Respekt vor den Blades – und übergibt alle Kristalle.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'BEUTE', lines: ['39 Flügelechsen-Kristalle – Material für einen Sonnenschutz.', 'Fremde Kristalle übertragen ihre Punkte auf das eigene Team.'] } }
    ],
    after: () => { stepDone('berg'); },
    next: 'schattenleere'
  },
  schattenleere: {
    id: 'schattenleere', title: 'Die Schattenleere', src: 'Kapitel 119, 123–125', type: 'gefecht',
    scene: [
      { bg: 'wueste', portrait: 'peter' },
      { narr: 'Quinn stellt Peter zur Rede: Er habe aufgegeben, bevor er es überhaupt versucht hat. Die beiden warten am verlassenen Brunnenhaus, dann geht Quinn allein auf Echsenjagd.' },
      { portrait: 'ben' },
      { narr: 'Bens Gruppe hat recherchiert: zwei Stufe-1er, leichte Beute. Drei folgen Quinn – ein Stufe-4-Erdnutzer, ein Windschütze mit Armbrust und einer mit Messer. Ben und Hugo gehen zu Peter.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'SCHATTENLEERE', lines: ['50 MC: lila Dämmerlicht über dem ganzen Gebiet. Keine Sonne mehr.', 'In der Leere lädt MC nicht nach – teile es dir ein.', 'Die Uhr zeigt jetzt Stufe 6.'] } }
    ],
    fight: {
      arena: { art: 'wueste', w: 380, h: 600, seed: 74, night: true, leere: true, brunnen: [300, 110], blocks: [{ x: 40, y: 80, w: 90, h: 50, invisible: true }] },
      playerAt: [190, 470], inspect: true, leere: true,
      foes: [
        { id: 'erdschueler', name: 'Erdnutzer · Stufe 4', hp: 22, poise: 4, at: [190, 220], ai: AI_EARTH, expRate: 1, info: { name: 'Zweitklässler', race: 'Mensch', ability: 'Erde · Stufe 4', blood: 'A' } },
        { id: 'windschuetze', name: 'Windschütze', hp: 14, poise: 3, at: [80, 180], ai: AI_BOLZEN, expRate: 1, info: { name: 'Zweitklässler', race: 'Mensch', ability: 'Wind · Armbrust · Stufe 3', blood: 'B' } },
        { id: 'messerschueler', name: 'Messer', hp: 14, poise: 3, at: [300, 260], ai: AI_MESSER, expRate: 1, info: { name: 'Zweitklässler', race: 'Mensch', ability: 'Messer · Stufe 3', blood: '0' } }
      ],
      onTick: (G) => { const p = G.player; if (!G.leereSet) { G.leereSet = true; if (p.maxMc) p.mc = Math.max(0, p.mc - 50); } G.hint = G.t < 6 ? { text: 'MC lädt hier nicht · <b>SCHATTEN</b> gezielt einsetzen' } : null; }
    },
    won: [
      { bg: 'nacht', portrait: 'quinnvamp' },
      { narr: 'Der Erdnutzer trifft im Chaos seinen eigenen Kameraden und zielt dann auf Quinns Kopf. Da hält Quinn nichts mehr zurück. Am Ende stehen nur noch er und der Armbrustschütze.' },
      { narr: 'Quinn merkt erschrocken, wie wenig Mitgefühl er noch spürt.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'NEUE FÄHIGKEIT', lines: ['Beeinflussung', 'Blickkontakt, rote Ringe um die Augen – der andere vergisst, was geschehen ist.'], kv: [['Voraussetzung', 'Charme 10']] } },
      { call: () => learn('beeinflussung') },
      { bg: 'wueste', portrait: 'quinnvamp' },
      { narr: 'Der Schütze erinnert sich an nichts mehr. Der Schirm ist kaputt, die Sonne brennt wieder. In der Ferne steigt schwarzer Rauch auf.' }
    ],
    reward: { exp: 140 },
    after: () => { stepDone('schattenleere'); },
    next: 'absturz'
  },
  absturz: {
    id: 'absturz', title: 'Der Absturz', src: 'Kapitel 122, 126–129',
    scene: [
      { bg: 'wueste', portrait: 'ben' },
      { narr: 'Am Brunnenhaus verteidigt Peter die Kristalle mit seinem Erdstab. Ben behauptet, Duke stecke hinter allem, und schlägt Peter mit der Keule durch eine Wand. Kristalle und Geldkarte sind weg.' },
      { bg: 'rotplanet', portrait: null },
      { narr: 'Dann bebt der Boden: Ein schwarzes, schuppiges Schiff stürzt ab. Heraus steigt ein Wesen mit einem Schwanz – ein Dalki.' },
      { bg: 'system', portrait: 'eno' },
      { narr: 'Auf einer fernen Insel steht ein Beobachtungsturm. Richard Eno, der Erfinder der Bestienwaffen, überwacht von dort alle Portalplaneten. Der Alarm schrillt: ein Dalki auf einem grünen Planeten.' },
      { bg: 'wueste', portrait: 'vorden' },
      { narr: 'Vorden findet Peter, der sich mit gebrochenen Beinen weiterschleppt, weil ihn sonst alle hassen würden. Vorden sagt ihm, dass er genug getan hat. Peter entschuldigt sich.' },
      { portrait: 'peter' },
      { narr: 'Erins Medizin-Droide versorgt ihn. Dann erzählt Peter: Seine ältere Schwester starb auf einer Expedition. Er wollte ihren Platz einnehmen – und wurde erpresst. Hinter allem stehe jemand ganz oben.' },
      { portrait: 'erin' },
      { narr: 'Den Namen kann er nicht mehr sagen. Erin und Layla rasen auf einer Eisbahn heran – Ben ist tot, und der Dalki ist ihnen dicht auf den Fersen.' }
    ],
    after: () => { stepDone('absturz'); },
    next: 'dalki'
  },
  dalki: {
    id: 'dalki', title: 'Der Dalki', src: 'Kapitel 130–135', type: 'boss',
    scene: [
      { bg: 'wueste', portrait: 'quinnvamp' },
      { narr: 'Die Sonne steht seit Stunden über ihnen. Quinns Haut juckt und brennt, seine Werte sind am Boden.' },
      { portrait: 'dalki' },
      { narr: 'Der Dalki hat nur einen Stachel – und ist trotzdem stärker als alles, was Quinn je gesehen hat.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'TAKTIK', lines: ['Blutskills prallen an seiner Haut ab.', 'Greif von innen an: Hammerschlag, Konter, Schatten.', 'Jede Wunde macht ihn schneller.'] } }
    ],
    fight: {
      arena: sunArena({ seed: 75, brunnen: [300, 120] }), playerAt: [190, 480], inspect: true,
      npcs: [{ id: 'peter', at: [320, 520], pose: 'cower', watch: 'foe' }, { id: 'layla', at: [60, 520], watch: 'foe' }],
      foes: [{ id: 'dalki', name: 'Dalki · 1 Stachel', hp: 60, poise: 6, at: [190, 230], ai: AI_DALKI, expRate: 1, info: { name: 'Dalki', race: 'Dalki · 1 Stachel', ability: 'Stärke, harte Haut', blood: 'grün' } }],
      onTick: (G) => {
        const d = G.foe, p = G.player;
        if (!G.init) { G.init = true; G.arena.sun = [{ x: 0, y: 0, w: G.arena.w, h: G.arena.h }]; G.arena.night = false; }
        if (!G.drank && d.hp <= d.maxHp * 0.75) { // Sil haelt ihn fest, Quinn trinkt das Blut der anderen (Kap. 132–133)
          G.drank = true; d.rootT = 3; G.tele.length = 0; setState(d, 'idle');
          p.hp = p.maxHp; SAVE.quinn.bank = 100; if (!SAVE.flags.dalkiBlut) { SAVE.flags.dalkiBlut = true; SAVE.quinn.stats.agi += 2; } learn('sense'); applyStats(p);
          G.arena.sun = []; G.arena.night = true; G.whiteFlash = 0.3;
          sysMsg({ head: 'BLUT', lines: ['Sil hält den Dalki mit Telekinese fest. Layla sammelt Blut von allen.', 'HP voll · Blutbank voll · Agilität +2', 'Die Sonne geht unter.', 'Neu: Schattensense – SCHATTEN trifft jetzt auch.'] }, 5200);
          banner('NACHT');
        }
        if (d.hp <= d.maxHp * 0.3 && G.state === 'play') { G.state = 'won'; G.tele.length = 0; banner('PETER!'); later(1.4, () => G.opt.onWin(G)); }
        G.hint = G.t < 6 ? { text: 'Blutskills prallen ab · <b>HAMMERSCHLAG</b> und Konter' } : null;
      }
    },
    won: [
      { bg: 'nacht', portrait: 'dalki' },
      { narr: 'Mit jeder Wunde wird der Dalki schneller. Ein Tritt, die Blutbank springt ein. Quinn rennt zu den anderen, um Blut zu holen – und der Dalki folgt ihm.' },
      { portrait: 'peter' },
      { narr: 'Peter wirft sich dazwischen. Der Arm des Dalki durchbohrt ihn. Er bittet Quinn um Vergebung.' },
      { portrait: 'quinnvamp' },
      { narr: 'Quinns erster Gedanke gilt dem vergossenen Blut. Dann erst kommt das Entsetzen. Er feuert Blutspray um Blutspray, bis der Dalki grün blutet.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'SYSTEM', lines: ['Blutspray erreicht Stufe 2.'] } }
    ],
    reward: { exp: 150 },
    after: () => { stepDone('dalki'); },
    next: 'ghul'
  },
  ghul: {
    id: 'ghul', title: 'The Cursed', src: 'Kapitel 135–138',
    scene: [
      { bg: 'nacht', portrait: 'vorden' },
      { narr: 'Zwei Mechs landen und werfen sich auf den Dalki. Vorden will Peter von seinen Schmerzen erlösen.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'KI', lines: ['Du kannst ihn retten.', 'Aber nur, wenn er danach kein Mensch mehr ist.'] } },
      { bg: 'nacht', portrait: 'quinnvamp' },
      { narr: 'Das Blutritual: Quinns Blut in Peters Mund, dann das Blut aller anderen. Die Wunde schließt sich.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'BLUTRITUAL', lines: ['Vampir-Ghul erschaffen (1/2).', 'Eine neue Familie wurde gegründet.'], kv: [['Name', 'The Cursed']] } },
      { call: () => learn('ritual') },
      { bg: 'nacht', portrait: 'leoruestung' },
      { narr: 'Leo erscheint in schwarz-roter Bestienrüstung mit einer Dämonenmaske auf der Brust. Für einen Dalki mit nur einem Stachel braucht er nicht einmal seine Seelenwaffe.' },
      { bg: 'kantine', portrait: 'duke' },
      { narr: 'Rückblick: Nathan und Duke erfahren vom Absturz. Der Rat der Dalki nennt ihn einen Abtrünnigen. Leo meldet sich freiwillig – man sagt, er hege einen tiefen Groll gegen die Dalki.' },
      { bg: 'nacht', portrait: 'quinnvamp' },
      { narr: 'Leo hat den Dalki getötet. Quinn kostet heimlich sein Blut: Es schmeckt nach Minze und macht ihn für eine Stunde spürbar stärker.' },
      { portrait: 'leoruestung' },
      { narr: 'Die Prüfung wird abgebrochen. Leo meint, Quinn habe die anderen beschützt – also stehe er wohl auf ihrer Seite. Dann sieht er Peters Aura: lila, wie die von Quinn. Er wird die beiden im Auge behalten.' },
      { portrait: 'peterghul' },
      { narr: 'Peter wacht auf. Er fühlt sich gut. Nur ein bisschen hungrig.' },
      { bg: 'nacht', portrait: null },
      { narr: 'Ende der siebten Etappe. Als Nächstes: Fex.' }
    ],
    after: () => { stepDone('ghul'); },
    next: null
  }
});
MISSION_ORDER.push('caladi', 'zahnwurm', 'echsen', 'berg', 'schattenleere', 'absturz', 'dalki', 'ghul');
const E7_CHAIN = ['caladi', 'zahnwurm', 'echsen', 'berg', 'schattenleere', 'absturz', 'dalki', 'ghul'];
