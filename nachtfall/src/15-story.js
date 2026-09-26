'use strict';
/* ==========================================================================
   STORY-MODUS „Das Vampirsystem“ — Finn Müllers Weg in 7 Kapiteln.
   Fan-Umsetzung, angelehnt an „My Vampire System“ (dt. Hörspiel „Das
   Vampirsystem“). Nur fuer den privaten Gebrauch.
   Alle Namen und Texte stehen hier gesammelt und lassen sich leicht aendern.
   ========================================================================== */

/* ---------------------------------------------------------------- Gegner je Kapitel */
function defEnemy(id, role, art, name, o) {
  ENEMIES[id] = Object.assign({}, ENEMIES[role], { name, art, role }, o || {});
  return id;
}
function defBoss(id, draw, name, hp, o) {
  ENEMIES[id] = Object.assign({}, ENEMIES.boss, { name, bossDraw: draw, hp, role: 'boss' }, o || {});
  return id;
}

const CHAPTERS = [
  {
    n: 1, id: 'buch', title: 'Das Buch', place: 'Militärakademie — Übungsgelände bei Nacht', theme: 'akademie', tier: 1,
    intro: [
      'Finn Müller ist sechzehn, hat keine Fähigkeit und ist an der Militärakademie der Außenseiter. Nur Peter Kraus hält zu ihm.',
      'In dieser Nacht brechen Bestien durch den Zaun des Übungsgeländes. Irgendwo hier liegt das alte Buch seiner Familie …'
    ],
    diff: { hp: 0.5, count: 0.8, dmg: 0.75 },
    roles: {
      ghoul: defEnemy('c1_basis', 'ghoul', 'q_basis', 'Basis-Bestie'),
      bat: defEnemy('c1_flatter', 'bat', 'bat_braun', 'Flatterbestie'),
      knight: defEnemy('c1_panzer', 'knight', 'q_panzer', 'Panzerbestie (Mittelstufe)', { armor: 1 }),
      witch: defEnemy('c1_spucker', 'witch', 'q_kroete', 'Säurekröte', { shot: 'acid', flier: false }),
      brute: defEnemy('c1_mutter', 'brute', 'q_mutter', 'Brutmutter'),
      captain: defEnemy('c1_rudel', 'captain', 'q_fort', 'Rudelführer (Fortgeschritten)', { scale: 1.35, hp: 900 }),
      boss: defBoss('c1_boss', 'bestieF', 'Fortgeschrittene Bestie', 2400, { bellShot: 'acid' })
    },
    texts: { swarm: 'Ein Schwarm Flatterbestien!', ring: 'Die Bestien kreisen dich ein …', boss: 'Das Heulen einer Fortgeschrittenen Bestie hallt über das Gelände.' },
    quests: [
      { type: 'kill', role: 'ghoul', n: 120, text: 'Besiege 120 Basis-Bestien', reward: { crystals: 15, bonus: 'level' } },
      { type: 'survive', n: 240, text: 'Überlebe 4 Minuten', reward: { crystals: 15, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege den Rudelführer', reward: { crystals: 25, bonus: 'level' } }
    ],
    reward: { tier: 2, text: 'Evolution: Vampir' }
  },
  {
    n: 2, id: 'mission', title: 'Die erste Mission', place: 'Bestien-Planet', theme: 'bestienplanet', tier: 2,
    intro: [
      'Ein Einsatz auf einem Bestien-Planeten. Hier ist jede Bestie stärker als alles auf dem Übungsgelände.',
      'Tief im leuchtenden Dschungel wartet eine Bestie der Kaiserstufe.'
    ],
    diff: { hp: 0.9, count: 0.9, dmg: 1 },
    roles: {
      ghoul: defEnemy('c2_laeufer', 'ghoul', 'q_alien', 'Schattenläufer'),
      bat: defEnemy('c2_gleiter', 'bat', 'bat_alien', 'Gleiter'),
      knight: defEnemy('c2_panzer', 'knight', 'q_alienP', 'Panzerbestie (Königsstufe)', { armor: 2 }),
      witch: defEnemy('c2_spore', 'witch', 'q_spore', 'Sporenbestie', { shot: 'acid', flier: false }),
      brute: defEnemy('c2_mutter', 'brute', 'q_alienM', 'Bestienmutter'),
      captain: defEnemy('c2_koenig', 'captain', 'q_koenig', 'Königsstufen-Bestie', { scale: 1.3, hp: 1600 }),
      boss: defBoss('c2_boss', 'bestieK', 'Kaiserstufen-Bestie', 7500, { bellShot: 'acid' })
    },
    texts: { swarm: 'Gleiter stürzen aus den Baumkronen!', ring: 'Der Dschungel schließt sich um dich …', boss: 'Der Boden bebt. Eine Kaiserstufen-Bestie erhebt sich.' },
    quests: [
      { type: 'kill', role: 'knight', n: 25, text: 'Besiege 25 Panzerbestien', reward: { crystals: 30, bonus: 'level' } },
      { type: 'crystals', n: 20, text: 'Sammle 20 Bestienkristalle', reward: { crystals: 20, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege die Königsstufen-Bestie', reward: { crystals: 40, bonus: 'level' } }
    ],
    reward: { tier: 3, text: 'Evolution: Vampiradliger — die Schatten erwachen' }
  },
  {
    n: 3, id: 'dalki', title: 'Der Dalki-Krieg', place: 'Schlachtfeld', theme: 'schlachtfeld', tier: 3,
    intro: [
      'Die Dalki greifen an: graue Krieger mit Stacheln. Je mehr Stacheln, desto gefährlicher.',
      'Halte die Linie. Irgendwo hinter der Front führt ein Dalki mit sieben Stacheln den Angriff.'
    ],
    diff: { hp: 1.2, count: 1, dmg: 1.15 },
    roles: {
      ghoul: defEnemy('c3_d1', 'ghoul', 'dalki1', 'Dalki (1 Stachel)', { hp: 16 }),
      bat: defEnemy('c3_aas', 'bat', 'bat_aas', 'Aasflieger'),
      knight: defEnemy('c3_d3', 'knight', 'dalki3', 'Dalki (3 Stacheln)', { armor: 3 }),
      witch: defEnemy('c3_speer', 'witch', 'dalki2', 'Dalki-Speerwerfer (2 Stacheln)', { shot: 'spike', flier: false }),
      brute: defEnemy('c3_d5', 'brute', 'dalki5', 'Dalki (5 Stacheln)', { splits: 0, hp: 150 }),
      captain: defEnemy('c3_d6', 'captain', 'dalki6', 'Dalki (6 Stacheln)', { scale: 1.45, hp: 2400 }),
      boss: defBoss('c3_boss', 'dalkiK', 'Dalki-Kommandant (7 Stacheln)', 11500, { bellShot: 'spike' })
    },
    texts: { swarm: 'Aasflieger kreisen über dem Schlachtfeld!', ring: 'Die Dalki umzingeln deine Stellung!', boss: 'Der Dalki-Kommandant tritt vor.' },
    quests: [
      { type: 'kill', role: 'ghoul', n: 200, text: 'Besiege 200 Dalki', reward: { crystals: 40, bonus: 'level' } },
      { type: 'level', n: 20, text: 'Erreiche Stufe 20', reward: { crystals: 30, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege den Dalki mit sechs Stacheln', reward: { crystals: 50, bonus: 'level' } }
    ],
    reward: { tier: 4, text: 'Evolution: Vampirlord — Leo lehrt dich Qi, dazu gewaltige Blutkräfte' }
  },
  {
    n: 4, id: 'siedlung', title: 'Die Vampir-Siedlung', place: 'Siedlung der Vampirfamilien', theme: 'siedlung', tier: 4,
    intro: [
      'Unter falschem Namen betritt Finn die Welt der Vampirfamilien. Ihre Anführer verteidigen ihre Gesetze mit Blut.',
      'Wer die Siedlung führen will, muss sich ihrem Stärksten stellen.'
    ],
    diff: { hp: 1.55, count: 1.05, dmg: 1.3 },
    roles: {
      ghoul: defEnemy('c4_wache', 'ghoul', 'v_wache', 'Vampir-Wache', { hp: 18 }),
      bat: defEnemy('c4_fleder', 'bat', 'bat_blut', 'Blutfledermaus'),
      knight: defEnemy('c4_ritter', 'knight', 'v_ritter', 'Vampirritter', { armor: 3 }),
      witch: defEnemy('c4_magier', 'witch', 'v_magier', 'Blutmagierin', { shot: 'blood', flier: false }),
      brute: defEnemy('c4_thrall', 'brute', 'v_thrall', 'Thrall-Koloss'),
      captain: defEnemy('c4_ober', 'captain', 'v_ritter', 'Familienoberhaupt', { scale: 1.4, hp: 3200 }),
      boss: defBoss('c4_boss', 'vampF', 'Der Anführer der Familien', 16500, { bellShot: 'blood' })
    },
    texts: { swarm: 'Blutfledermäuse aus den Türmen!', ring: 'Die Wachen der Familien schließen den Kreis.', boss: 'Der Anführer der Familien erhebt sich von seinem Thron.' },
    quests: [
      { type: 'kill', role: 'knight', n: 40, text: 'Besiege 40 Vampirritter', reward: { crystals: 50, bonus: 'level' } },
      { type: 'survive', n: 420, text: 'Überlebe 7 Minuten', reward: { crystals: 40, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege das Familienoberhaupt', reward: { crystals: 60, bonus: 'level' } }
    ],
    reward: { king: true, text: 'Titel: Vampirkönig (+10 % Leben und Schaden, dauerhaft)' }
  },
  {
    n: 5, id: 'graham', title: 'Graham', place: 'Die brennenden Ruinen', theme: 'ruinen', tier: 4,
    intro: [
      'Graham, der Anführer der Dalki: acht Stacheln und der Hunger eines Werwolfs, der seine Beute frisst und dadurch wächst.',
      'Um ihn zu besiegen, braucht Finn die Macht eines Nest-Kristalls.'
    ],
    diff: { hp: 1.8, count: 1.1, dmg: 1.4 },
    roles: {
      ghoul: defEnemy('c5_d2', 'ghoul', 'dalki2', 'Dalki (2 Stacheln)', { hp: 20 }),
      bat: defEnemy('c5_aas', 'bat', 'bat_aas', 'Aasflieger'),
      knight: defEnemy('c5_wolf', 'knight', 'dalkiW', 'Dalki-Werwolf', { armor: 3, spd: 46 }),
      witch: defEnemy('c5_speer', 'witch', 'dalki3', 'Dalki-Speerwerfer (3 Stacheln)', { shot: 'spike', flier: false }),
      brute: defEnemy('c5_d5', 'brute', 'dalki5', 'Dalki (5 Stacheln)', { splits: 0, hp: 170 }),
      captain: defEnemy('c5_d6', 'captain', 'dalki6', 'Dalki-General', { scale: 1.6, hp: 4200 }),
      boss: defBoss('c5_boss', 'graham', 'Graham', 20000, { bellShot: 'spike', r: 48 })
    },
    texts: { swarm: 'Aasflieger über den Ruinen!', ring: 'Grahams Armee umzingelt dich!', boss: 'Graham ist hier.' },
    quests: [
      { type: 'kill', role: 'knight', n: 50, text: 'Besiege 50 Dalki-Werwölfe', reward: { crystals: 60, bonus: 'level' } },
      { type: 'level', n: 28, text: 'Erreiche Stufe 28', reward: { crystals: 50, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege den Dalki-General', reward: { crystals: 70, bonus: 'level' } }
    ],
    reward: { tier: 5, text: 'Nest-Kristall aufgenommen — Evolution: Himmlischer Vampirlord' }
  },
  {
    n: 6, id: 'himmel', title: 'Die Himmlischen', place: 'Die Himmelsebene', theme: 'himmel', tier: 5,
    intro: [
      'Als erster Vampir hat Finn himmlischen Rang erreicht. Seine Macht wächst jetzt mit denen, die an ihn glauben.',
      'Die Diener des Himmels prüfen, ob er würdig ist.'
    ],
    diff: { hp: 2.5, count: 1.15, dmg: 1.6 },
    roles: {
      ghoul: defEnemy('c6_juenger', 'ghoul', 'h_juenger', 'Lichtjünger', { hp: 20, gore: 'light' }),
      bat: defEnemy('c6_funke', 'bat', 'bat_licht', 'Lichtfunke', { gore: 'light' }),
      knight: defEnemy('c6_ritter', 'knight', 'h_ritter', 'Himmelsritter', { armor: 4, gore: 'light' }),
      witch: defEnemy('c6_seherin', 'witch', 'h_seherin', 'Himmelsseherin', { shot: 'light', gore: 'light' }),
      brute: defEnemy('c6_koloss', 'brute', 'h_koloss', 'Lichtkoloss', { gore: 'light' }),
      captain: defEnemy('c6_waechter', 'captain', 'h_waechter', 'Erster Wächter', { hp: 5200, gore: 'light' }),
      boss: defBoss('c6_boss', 'himmlisch', 'Der Himmlische Richter', 33000, { bellShot: 'light' })
    },
    texts: { swarm: 'Ein Regen aus Lichtfunken!', ring: 'Die Jünger des Lichts umringen dich.', boss: 'Der Himmlische Richter steigt herab.' },
    quests: [
      { type: 'kill', role: 'ghoul', n: 400, text: 'Besiege 400 Lichtjünger', reward: { crystals: 70, bonus: 'level' } },
      { type: 'survive', n: 480, text: 'Überlebe 8 Minuten', reward: { crystals: 60, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege den Ersten Wächter', reward: { crystals: 80, bonus: 'level' } }
    ],
    reward: { tier: 6, text: 'Evolution: Reiner Himmlischer' }
  },
  {
    n: 7, id: 'goetter', title: 'Gottbezwinger', place: 'Das Reich der Götter', theme: 'goetter', tier: 6,
    intro: [
      'Götter sind keine Legende. Und Emma Wagners Gottbezwinger-Kristall trägt die Macht, sie zu bezwingen.',
      'Um die Macht zu tragen, muss Finn einen Gott besiegen.'
    ],
    diff: { hp: 3.1, count: 1.2, dmg: 1.8 },
    roles: {
      ghoul: defEnemy('c7_bestie', 'ghoul', 'q_void', 'Götterbestie', { hp: 22, gore: 'void' }),
      bat: defEnemy('c7_schwinge', 'bat', 'bat_void', 'Leerenschwinge', { gore: 'void' }),
      knight: defEnemy('c7_ritter', 'knight', 'g_ritter', 'Götterritter', { armor: 5, gore: 'void' }),
      witch: defEnemy('c7_priesterin', 'witch', 'g_seherin', 'Priesterin der Leere', { shot: 'void', gore: 'void' }),
      brute: defEnemy('c7_titan', 'brute', 'q_voidP', 'Titanbestie', { splits: 2, gore: 'void' }),
      captain: defEnemy('c7_diener', 'captain', 'g_diener', 'Auserwählter eines Gottes', { hp: 6500, gore: 'void' }),
      boss: defBoss('c7_boss', 'gott', 'Ein Gott', 46000, { bellShot: 'void' })
    },
    texts: { swarm: 'Leerenschwingen verdunkeln den Himmel!', ring: 'Die Diener der Götter schließen den Kreis.', boss: 'Ein Gott wendet sich dir zu.' },
    quests: [
      { type: 'kill', role: 'knight', n: 60, text: 'Besiege 60 Götterritter', reward: { crystals: 90, bonus: 'level' } },
      { type: 'level', n: 35, text: 'Erreiche Stufe 35', reward: { crystals: 80, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege den Auserwählten', reward: { crystals: 100, bonus: 'level' } }
    ],
    reward: { tier: 7, text: 'Emma Wagners Kristall — Evolution: Vampir-Gottbezwinger' }
  }
];

/* ---------------------------------------------------------------- Bestienausruestung (dauerhaft) */
const GEAR = {
  handschuhe: { name: 'Bestienhandschuhe', desc: '+8 % Schaden je Stufe', max: 5, cost: [30, 80, 160, 300, 500] },
  stiefel: { name: 'Bestienstiefel', desc: '+5 % Tempo, −6 % Ausweich-Abklingzeit je Stufe', max: 5, cost: [30, 80, 160, 300, 500] },
  panzer: { name: 'Bestienpanzer', desc: '+10 % Leben je Stufe', max: 5, cost: [40, 100, 200, 360, 600] },
  amulett: { name: 'Kristallamulett', desc: '+12 % Sammelradius, +5 % Erfahrung je Stufe', max: 5, cost: [25, 60, 120, 240, 420] }
};
function storySave() {
  if (!SAVE.story) SAVE.story = {};
  const S = SAVE.story;
  S.cleared = S.cleared || {}; S.gear = S.gear || {}; S.best = S.best || {};
  if (S.crystals === undefined) S.crystals = 0;
  return S;
}

/* ---------------------------------------------------------------- Lauf einrichten */
function storySetup(G, ch) {
  G.story = ch;
  G.roles = ch.roles;
  G.diffHp = ch.diff.hp; G.diffCount = ch.diff.count; G.diffDmg = ch.diff.dmg;
  G.events = EVENTS.map((ev) => {
    const e2 = Object.assign({}, ev);
    if (ev.kind === 'swarm') e2.text = ch.texts.swarm;
    else if (ev.kind === 'ring') e2.text = ch.texts.ring;
    else if (ev.kind === 'boss') e2.text = ch.texts.boss;
    else if (ev.kind === 'miniboss') e2.text = null;
    return e2;
  });
  G.quests = ch.quests.map((q) => ({ q, prog: 0, done: false }));
  G.questRoleKills = {};
  G.onKill = storyOnKill;
  spawnCompanions(G);
  const S = storySave(), gr = S.gear;
  G.statMod = (st) => {
    st.might *= 1 + 0.08 * (gr.handschuhe || 0) + (S.king ? 0.1 : 0);
    st.speed *= 1 + 0.05 * (gr.stiefel || 0);
    st.dodgeCdMul *= Math.pow(0.94, gr.stiefel || 0);
    st.maxHp *= 1 + 0.1 * (gr.panzer || 0) + (S.king ? 0.1 : 0);
    st.pickup *= 1 + 0.12 * (gr.amulett || 0);
    st.xpMul *= 1 + 0.05 * (gr.amulett || 0);
  };
  // Kristalle vorrendern, damit waehrend des Laufs nichts ruckelt
  for (const r in ch.roles) { const d = ENEMIES[ch.roles[r]]; if (d.art && ENEMY_ART[d.art]) ensureArt(d.art); }
}
function storyOnKill(e) {
  const G = GAME, ch = G.story, n = ch.n;
  // Bestienkristalle
  let c = 0;
  if (e.boss) c = 40 * n; else if (e.mini) c = 15 * n; else if (e.elite) c = 5 * n; else if (Math.random() < 0.03) c = Math.ceil(n / 2);
  if (c) { const k = Math.min(8, c); for (let i = 0; i < k; i++) dropPickup(e.x + rand(-20, 20), e.y + rand(-14, 14), 'crystal', Math.round(c / k)); }
  G.questRoleKills[e.role] = (G.questRoleKills[e.role] || 0) + 1;
  if (e.mini) G.miniKilled = true;
}
function storyQuestTick() {
  const G = GAME;
  if (!G.quests) return;
  for (const Q of G.quests) {
    if (Q.done) continue;
    const q = Q.q;
    if (q.type === 'kill') Q.prog = G.questRoleKills[q.role] || 0;
    else if (q.type === 'survive') Q.prog = Math.floor(G.t);
    else if (q.type === 'level') Q.prog = G.level;
    else if (q.type === 'crystals') Q.prog = G.crystals || 0;
    else if (q.type === 'mini') Q.prog = G.miniKilled ? 1 : 0;
    const goal = q.type === 'mini' ? 1 : q.n;
    if (Q.prog >= goal) {
      Q.done = true;
      G.crystals = (G.crystals || 0) + q.reward.crystals;
      if (q.reward.bonus === 'level') G.pendingLevels++;
      if (q.reward.bonus === 'heal') healPlayer(G.p.st.maxHp * 0.4);
      sfx('level');
      UI.sysWindow('QUEST ABGESCHLOSSEN', q.text, `Belohnung: ${q.reward.crystals} Bestienkristalle${q.reward.bonus === 'level' ? ' · Stufenaufstieg' : ' · Heilung'}`);
    }
  }
}

/* ---------------------------------------------------------------- Laufende */
function storyEnd(won) {
  const G = GAME, ch = G.story, S = storySave(), F = finnSave();
  const res = { story: true, ch, crystals: G.crystals || 0, firstClear: false, reward: null, test: !!G.finnTest };
  S.crystals += res.crystals;
  S.best[ch.n] = Math.max(S.best[ch.n] || 0, G.t);
  if (won) {
    if (!S.cleared[ch.n]) { S.cleared[ch.n] = true; res.firstClear = true; }
    const R = ch.reward;
    if (!G.finnTest) {
      if (R.tier && F.tier < R.tier) { F.tier = R.tier; res.reward = R; res.evolved = FINN_TIERS[R.tier]; }
      if (R.king && !S.king) { S.king = true; res.reward = R; }
    }
  }
  return res;
}
// Finn: im Story-Modus zaehlt das Kapitel, nicht mehr die Essenz
const _finnEndOld = HEROES.finn.onEnd;
HEROES.finn.onEnd = function (won) { return GAME.story ? storyEnd(won) : _finnEndOld(won); };
HEROES.finn.mech.desc = 'Finn beginnt als Mensch ohne jede Fähigkeit — im ersten Kapitel findet er das Buch und wird zum Halbling. Jede weitere Evolution erhält er dauerhaft, wenn er den Boss des passenden Kapitels besiegt. Im Lauf kämpft er mit den Kräften seiner aktuellen Form; Bestienkristalle aus den Läufen werden zu dauerhafter Ausrüstung.';

// Finn gehoert in den Story-Modus, nicht in die Arcade-Heldenwahl
(function () { const i = HERO_ORDER.indexOf('finn'); if (i >= 0) HERO_ORDER.splice(i, 1); })();

function storyStart(chN) {
  const ch = CHAPTERS[chN - 1];
  const F = finnSave();
  // Form: gespeicherte Form (Testmodus: frei waehlbar); Mensch nur im ersten Kapitel
  let tier = UI.finnPick !== undefined && SAVE.settings.testUnlock ? UI.finnPick : F.tier;
  if (tier === 0 && ch.n > 1) tier = 1;
  UI.finnPick = tier;
  startGame('finn', { story: ch });
}
