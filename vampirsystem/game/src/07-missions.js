'use strict';
/* ==========================================================================
   MISSIONEN — Akt I, Bogen 1 (Kapitel 1–11). Datengetrieben.
   Szenen sind eigene Nacherzaehlungen des Romans, keine Zitate.
   ========================================================================== */

/* ------------------------------------------------------------ Kyle (Kap. 10–11)
   Schueler mit Faehigkeitsstufe 1, Tigerkrallen. Phase 2: Verwandlung. */
const KYLE_ATK = {
  swipe: { type: 'swipe', wind: 0.55, act: 0.1, rec: 0.55, reach: 44, arc: 1.0, dmg: 1 },
  lunge: { type: 'lunge', wind: 0.65, act: 0.24, rec: 0.7, speed: 320, dmg: 2, shout: '!' },
  swipe2: { type: 'swipe', wind: 0.4, act: 0.1, rec: 0.1, reach: 50, arc: 1.05, dmg: 1, col: '#ff8a2a',
    chain: { type: 'swipe', wind: 0.3, act: 0.1, rec: 0.55, reach: 52, arc: 1.15, dmg: 1, col: '#ff8a2a' } },
  lunge2: { type: 'lunge', wind: 0.45, act: 0.26, rec: 0.55, speed: 380, dmg: 2, shout: '!' }
};
const AI_KYLE = {
  params: (e) => (e.phase === 1 ? { range: 40, speed: 92, cd: 1.1 } : { range: 42, speed: 126, cd: 0.55 }),
  choose(e, d) {
    const two = e.phase === 2;
    if (d > 85) return Math.random() < (two ? 0.7 : 0.5) ? (two ? KYLE_ATK.lunge2 : KYLE_ATK.lunge) : null;
    if (d < 62) return two ? KYLE_ATK.swipe2 : KYLE_ATK.swipe;
    return null;
  },
  onHurt(e) {
    if (e.phase === 1 && e.hp <= e.maxHp * 0.5) {
      e.phase = 2; e.extra = { claws: 1, glow: true }; e.spr = null;
      setState(e, 'transform'); G.tele = G.tele.filter((T) => T.owner !== e);
      e.poise = e.maxPoise = 5;
      banner('VERWANDLUNG'); sfx('roar'); G.shake = 8;
      burst(e.x, e.y - 30, 18, '#ff9a3a');
      sysMsg({ head: 'SYSTEM', lines: ['Kyle setzt seine Fähigkeit ein: Tigerkrallen.', 'Seine Angriffe werden schneller und kommen doppelt.'] }, 3600);
    }
  }
};

/* ------------------------------------------------------------ KI: Trainingsgeraet, Mono */
const GERAET_ATK = { type: 'beam', wind: 0.7, act: 0.12, rec: 0.35, len: 420, width: 26, dmg: 1 };
const AI_GERAET = {
  params: (e) => ({ range: 999, speed: 0, cd: Math.max(0.45, 1.1 - G.t * 0.03) }),
  choose: () => GERAET_ATK
};
const MONO_ATK = { type: 'swipe', wind: 0.5, act: 0.1, rec: 0.6, reach: 40, arc: 0.9, dmg: 1, col: '#6ab0ff' };
const AI_MONO = {
  foresight: true,
  params: () => ({ range: 60, speed: 90, cd: 1.6 }),
  choose: (e, d) => (d < 55 ? MONO_ATK : null)
};

/* ------------------------------------------------------------ Missionen */
const MISSIONS = {
  prolog: {
    id: 'prolog', title: 'Das schwarze Buch', src: 'Kapitel 1–3',
    scene: [
      { bg: 'zimmer' },
      { narr: 'In dieser Welt erwacht in fast jedem Menschen eine Fähigkeit. Quinn Talen ist sechzehn, Waise – und bei ihm hat sich nie etwas gezeigt.' },
      { narr: 'Von seinen Eltern ist ihm nur ein schwarzes Buch geblieben. Es ließ sich nie öffnen, was er auch versuchte.' },
      { narr: 'Morgen beginnt seine Wehrpflicht an der Militärschule. Beim letzten Versuch mit dem Buch schneidet er sich, und ein Tropfen Blut fällt auf den Einband.' },
      { bg: 'system' },
      { sys: { head: 'SYSTEM', lines: ['Blut erkannt.', 'Das System wurde aktiviert.'] } },
      { sys: { head: 'STATUS', kv: [['Name', 'Quinn Talen'], ['Rasse', 'Mensch'], ['Stufe', '1'], ['HP', '10 / 10'], ['Stärke', '10'], ['Agilität', '10'], ['Ausdauer', '10']],
        quests: ['Hauptquest: Erreiche Stufe 10', 'Tagesquest: Trinke 2 Liter Wasser'] } },
      { bg: 'zimmer', portrait: 'quinn' },
      { who: 'Quinn', text: 'Ein Statusfenster? Wie in einem Spiel …' },
      { bg: 'bus', portrait: null },
      { narr: 'Am nächsten Morgen bringt ihn ein Transport in eine Militärstadt voller Technik. Draußen in der Sonne fühlt er sich seltsam kraftlos.' },
      { sys: { head: 'SYSTEM', lines: ['Warnung: Direktes Sonnenlicht halbiert alle Werte.'], quests: ['Tagesquest: Meide die Sonne'] } }
    ],
    next: 'test'
  },

  /* Faehigkeitstest (Kap. 4–7) */
  test: {
    id: 'test', title: 'Der Fähigkeitstest', src: 'Kapitel 4–7', type: 'pruefung',
    scene: [
      { bg: 'kantine', portrait: 'vorden' },
      { narr: 'Auf dem Prüfplatz stehen die Neuen in Gruppen. Ein blonder Junge streckt Quinn freundlich die Hand entgegen.' },
      { who: 'Vorden', text: 'Ich bin Vorden. Wir sind in derselben Testgruppe, schätze ich.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'SYSTEM', lines: ['Eine fremde Fähigkeit hat versucht, auf dich zuzugreifen.', 'Zugriff blockiert.'] } },
      { bg: 'kantine', portrait: 'peter' },
      { narr: 'In Quinns Gruppe sind außerdem Peter, der vor Nervosität zittert, Layla mit einem Bogen aus Bestienmaterial und Erin, deren Kälte man fast spürt.' },
      { portrait: 'jane' },
      { who: 'Jane', text: 'Wer noch keine Fähigkeit hat, bekommt ein kostenloses Fähigkeitsbuch. Danach wird gemessen. Nächster.' },
      { portrait: 'quinn' },
      { narr: 'Quinn lehnt das Buch ab. Er will wissen, was das System mit ihm vorhat. Der Test findet draußen statt – mitten in der Sonne.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'PRÜFUNG', lines: ['Triff die Messsäule so oft und so hart du kannst.', 'Die Sonne halbiert deine Werte.'], kv: [['Zeit', '12 Sekunden']] } }
    ],
    fight: {
      arena: { art: 'pruefplatz', w: 340, h: 680, sun: [{ x: 0, y: 0, w: 340, h: 680 }] },
      playerAt: [170, 440],
      foes: [{ id: 'saeule', name: 'Messsäule', hp: 9999, poise: 999, at: [170, 330], draw: 'saeule', fixed: true, r: 14, ai: { params: () => ({ range: 999, speed: 0, cd: 99 }), choose: () => null } }],
      inspect: false, noFoeBar: true,
      onTick: testTick
    },
    won: [
      { bg: 'kantine', portrait: 'layla' },
      { narr: 'Die Ergebnisse werden laut vorgelesen. Layla lässt ihren Pfeil mit schwacher Telekinese nachlenken: Stufe 2.' },
      { portrait: 'erin' },
      { narr: 'Erin lässt Eissäulen aus dem Boden schießen: Stufe 5. Vorden berührt sie kurz an der Schulter – und wirft danach dasselbe Eis. Ebenfalls Stufe 5.' },
      { portrait: 'quinn' },
      { narr: 'Quinn, geschwächt von der Sonne: Stufe 1. Die anderen lachen. Nur ein Offizier am Rand sieht ihm länger nach, als nötig wäre.' },
      { portrait: 'vorden' },
      { who: 'Quinn', text: 'Du kopierst Fähigkeiten, wenn du jemanden berührst. Deshalb der Handschlag.' },
      { who: 'Vorden', text: 'Scharf beobachtet. Dann teilen wir uns wohl besser ein Zimmer.' }
    ],
    reward: { exp: 0 },
    next: 'akademie'
  },

  /* Akademie: begehbarer Hub mit Tagesquests */
  akademie: { id: 'akademie', title: 'Die Akademie', src: 'Kapitel 8–14', type: 'hub' },

  kyle: {
    id: 'kyle', title: 'Der erste Kampf', src: 'Kapitel 10–11', type: 'gefecht',
    scene: [
      { bg: 'kantine', portrait: 'peter' },
      { narr: 'Die Kantine. Ein Schüler mit Fähigkeitsstufe 1 bedrängt Peter. Niemand greift ein.' },
      { portrait: 'kyle' },
      { who: 'Kyle', text: 'Wer keine Fähigkeit hat, tut, was ich sage. Kapiert?' },
      { portrait: 'quinn' },
      { who: 'Quinn', text: 'Lass ihn in Ruhe.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'KAMPFMODUS', lines: ['Quest: Gewinne deinen ersten Kampf.'], kv: [['Belohnung', '50 EP']] } }
    ],
    fight: {
      arena: { art: 'kantine', w: 340, h: 600, blocks: [{ x: 18, y: 150, w: 70, h: 26 }, { x: 252, y: 150, w: 70, h: 26 }, { x: 18, y: 440, w: 70, h: 26 }, { x: 252, y: 440, w: 70, h: 26 }] },
      playerAt: [170, 400],
      foes: [{ id: 'kyle', name: 'Kyle · Fähigkeit: Tigerkrallen', hp: 26, poise: 4, at: [170, 260], ai: AI_KYLE }],
      npcs: [{ id: 'peter', at: [300, 320], pose: 'cower', face: -1 }],
      inspect: false,
      onTick: tutorialTick
    },
    won: [
      { bg: 'kantine', portrait: 'peter' },
      { who: 'Peter', text: 'Danke … Bisher hat sich noch nie jemand für mich eingesetzt.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'QUEST ERFÜLLT', lines: ['Erster Kampf gewonnen.'], kv: [['EP', '+50']] } },
      { sys: { head: 'NEUE FÄHIGKEIT', lines: ['Inspect (Stufe 1)', 'Zeigt Name, Rasse, Fähigkeitstyp, HP und Blutgruppe eines Ziels. Knopf INSPECT.'] } },
      { sys: { head: 'OPTIONALE QUEST', lines: ['Trinke das Blut deines Gegners.'], kv: [['Belohnung', '1 Wertepunkt']] } },
      { bg: 'kantine', portrait: 'quinn' },
      { narr: 'Quinn lehnt ab – und kann trotzdem den Blick nicht vom Blut auf dem Boden lösen.' }
    ],
    reward: { exp: 50, skills: ['inspect'] },
    after: () => { SAVE.day.night = true; SAVE.flags.kyle = true; },
    next: 'akademie'
  },

  /* Heimliches Nachttraining (Kap. 12) */
  nacht: {
    id: 'nacht', title: 'Training bei Nacht', src: 'Kapitel 12', type: 'pruefung',
    scene: [
      { bg: 'nacht', portrait: 'quinn' },
      { narr: 'Seine Wunden aus dem Kampf sind schon fast verheilt – und die Heilung macht ihn hungrig. Nachts schleicht Quinn in die Trainingshalle. Ohne Sonne will er wissen, was er wirklich kann.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'AUSWEICHTEST', lines: ['Das Trainingsgerät feuert Strahlen. Die rote Bahn zeigt, wohin.', 'Halte 20 Sekunden durch.'] } }
    ],
    fight: {
      arena: { art: 'halle', w: 340, h: 680 },
      playerAt: [170, 460],
      foes: [{ id: 'geraet', name: 'Trainingsgerät', hp: 9999, poise: 999, at: [170, 280], draw: 'geraet', fixed: true, r: 16, cd: 1.2, ai: AI_GERAET, info: { name: 'Trainingsgerät', race: '—', ability: 'Strahl', blood: '—' } }],
      inspect: true, noDeath: true, noFoeBar: true,
      onTick: survivalTick(20)
    },
    won: [
      { bg: 'system', portrait: null },
      { sys: { head: 'ERGEBNIS', lines: ['Ohne Sonne entsprechen deine Werte genau den Werten des Systems.'] } },
      { bg: 'nacht', portrait: 'layla' },
      { narr: 'Was Quinn nicht bemerkt: Hinter der Tür der Halle steht Layla und hat alles gesehen. Sie ist jetzt sehr neugierig.' }
    ],
    reward: { exp: 0 },
    after: () => { SAVE.flags.nacht = true; },
    next: 'akademie'
  },

  /* Monos Warnung (Kap. 13–14) */
  mono: {
    id: 'mono', title: 'Ungeschriebene Regeln', src: 'Kapitel 13–14', type: 'duell',
    scene: [
      { bg: 'kantine', portrait: 'vorden' },
      { narr: 'In der Kantine sitzt jeder nach seiner Stufe. Vorden, ein Original mit Stufe 5, setzt sich demonstrativ zu den Stufe-1ern.' },
      { narr: 'Nach dem Essen holen sechs Zweitjährige Quinn, Vorden und Peter ab und führen sie nach draußen.' },
      { portrait: 'mono' },
      { who: 'Mono', text: 'Hier gibt es Regeln, die nirgends stehen. Wer sie nicht kennt, lernt sie auf die harte Tour.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'KAMPF', lines: ['Mono, Stufe 6.', 'Versuche, ihn zu treffen. Probier auch INSPECT.'] } }
    ],
    fight: {
      arena: { art: 'hof', w: 440, h: 700, sun: [{ x: 0, y: 0, w: 440, h: 700 }], paths: [{ x: 192, y: 0, w: 56, h: 700 }] },
      playerAt: [220, 440],
      foes: [{ id: 'mono', name: 'Mono · Stufe 6', hp: 60, poise: 99, at: [220, 320], ai: AI_MONO, info: { name: 'Mono', race: 'Mensch', ability: '?', blood: '?' } }],
      npcs: [{ id: 'peter', at: [120, 380], pose: 'cower', face: 1 }, { id: 'vorden', at: [330, 400], face: -1 }, { id: 'zweit', at: [110, 250], face: 1 }, { id: 'zweit', at: [340, 260], face: -1 }],
      inspect: true, noDeath: true,
      onInspect: (G) => { (G.tut || (G.tut = { t: 0 })).inspected = true; },
      onTick: monoTick
    },
    won: [
      { bg: 'kantine', portrait: 'mono' },
      { narr: 'Egal wie Quinn angreift – Mono ist immer schon einen Schritt weiter, als hätte er den Schlag vorher gesehen.' },
      { who: 'Mono', text: 'Das reicht. Merkt euch einfach, wo euer Platz ist.' },
      { portrait: 'quinn' },
      { narr: 'Er sieht voraus, was passiert, denkt Quinn. Und im Sonnenlicht konnte das System ihn nicht einmal lesen.' },
      { bg: 'nacht', portrait: null },
      { narr: 'Ende der zweiten Etappe. Als Nächstes: Credits, eine schwarze Maske – und Rylee.' }
    ],
    reward: { exp: 10 },
    after: () => { SAVE.flags.mono = true; },
    next: null
  }
};
const MISSION_ORDER = ['prolog', 'test', 'kyle', 'nacht', 'mono'];

/* ------------------------------------------------------------ Ablauf-Hilfen */
function testTick(G, dt) {
  const T = G.tut || (G.tut = { t: 0, best: 0, total: 0 });
  T.t += dt;
  const s = G.foe;
  s.meter = Math.max(0, (s.meter || 0) - dt * 0.6);
  const dealt = s.maxHp - s.hp;
  if (dealt > T.total) { s.meter = Math.min(1, s.meter + (dealt - T.total) * 0.12); T.total = dealt; }
  G.hint = { text: T.t < 12 ? `Messung läuft · ${Math.ceil(12 - T.t)} s<br><b>ANGRIFF</b> tippen oder halten` : 'Messung beendet' };
  if (T.t >= 12 && G.state === 'play') {
    G.state = 'won'; G.result = { total: T.total };
    sysMsg({ head: 'MESSUNG', kv: [['Gesamtwert', T.total.toFixed(1)], ['Einstufung', 'Stufe 1']] }, 2600);
    later(2.4, () => G.opt.onWin(G));
  }
}
function survivalTick(sec) {
  return function (G, dt) {
    const T = G.tut || (G.tut = { t: 0 });
    T.t += dt;
    G.hint = { text: T.t < sec ? `Durchhalten · ${Math.ceil(sec - T.t)} s` : '' };
    if (T.t >= sec && G.state === 'play') { G.state = 'won'; G.tele.length = 0; banner('GESCHAFFT'); later(1.2, () => G.opt.onWin(G)); }
  };
}
function monoTick(G, dt) {
  const T = G.tut || (G.tut = { t: 0 });
  T.t += dt;
  const ev = G.stats.evaded || 0;
  G.hint = { text: ev < 2 ? 'Greif Mono an' : T.inspected ? '' : 'Tippe <b>INSPECT</b>' };
  if ((ev >= 6 && T.inspected) || T.t > 32) { if (G.state === 'play') { G.state = 'won'; G.tele.length = 0; later(0.8, () => G.opt.onWin(G)); } }
}

/* ------------------------------------------------------------ Hub: die Akademie */
function hubSetup() {
  const D = SAVE.day, F = SAVE.flags, night = D.night;
  const W = 440, H = 700;
  const buildings = [
    { x: 20, y: 20, w: 180, h: 110, door: 110, label: 'WOHNHEIM' },
    { x: 240, y: 20, w: 180, h: 110, door: 330, label: 'BIBLIOTHEK' },
    { x: 20, y: 300, w: 170, h: 100, door: 105, label: 'KANTINE' },
    { x: 250, y: 300, w: 170, h: 100, door: 335, label: 'TRAININGSHALLE' }
  ];
  const pois = [];
  const go = (id) => () => leaveHub(() => startMission(id));
  // Bibliothek (Kap. 9): Buch ueber Vampire
  pois.push({ x: 330, y: 150, label: 'Bibliothek', hidden: () => F.book || night, action: () => leaveHub(() => runScene(SCENE_BOOK, () => { F.book = true; addExp(10); writeSave(); startMission('akademie'); })) });
  // Wohnheim: Zimmer 23 (Kap. 8–9), Schlafen
  pois.push({ x: 110, y: 150, label: F.room ? 'Zimmer 23 · Schlafen' : 'Zimmer 23', col: '#ffe6a0', hidden: () => !canSleep() && F.room, action: () => leaveHub(() => (F.room ? sleep() : runScene(SCENE_ROOM, () => { F.room = true; writeSave(); startMission('akademie'); }))) });
  // Kantine: Kyle (Tag 2), Mono (Tag 3)
  pois.push({ x: 105, y: 420, label: 'Kantine', col: '#ffb040', hidden: () => night || !(D.n === 2 && !F.kyle) && !(D.n >= 3 && F.nacht && !F.mono), action: () => leaveHub(() => startMission(D.n === 2 ? 'kyle' : 'mono')) });
  // Wasserspender (Tagesquest)
  pois.push({ x: 175, y: 440, label: 'Wasser trinken', col: '#6ec8ff', hidden: () => night || D.water, action: () => { D.water = true; writeSave(); sfx('heal'); sysMsg({ head: 'TAGESQUEST ERFÜLLT', lines: ['2 Liter Wasser getrunken.'], kv: [['EP', '+5']] }); addExp(5); } });
  // Trainingshalle nachts (Kap. 12)
  pois.push({ x: 335, y: 420, label: 'Trainingshalle', col: '#c8a0ff', hidden: () => !(night && F.kyle && !F.nacht), action: go('nacht') });
  const blocks = buildings.map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h - 8, invisible: true }));
  // Schatten: unter den Gebaeuden und unter dem ueberdachten Hauptweg (sicherer Weg durch den Hof)
  const shade = buildings.map((b) => ({ x: b.x - 4, y: b.y + b.h - 8, w: b.w + 8, h: 46 })).concat([{ x: 192, y: 130, w: 56, h: H - 130 }]);
  return {
    arena: { art: 'hof', w: W, h: H, buildings, blocks, pois, paths: [{ x: 192, y: 130, w: 56, h: H - 130 }, { x: 0, y: 452, w: W, h: 44 }, { x: 0, y: 160, w: W, h: 40 }],
      sun: night ? [] : [{ x: 0, y: 0, w: W, h: H }], shade, night },
    playerAt: [220, 620], foes: [], npcs: [], inspect: SAVE.quinn.skills.includes('inspect'), hub: true, onTick: hubTick
  };
}
function canSleep() {
  const D = SAVE.day, F = SAVE.flags;
  if (D.n === 1) return F.book && F.room;
  if (D.n === 2) return F.kyle && F.nacht;
  return false;
}
function hubGoal() {
  const D = SAVE.day, F = SAVE.flags;
  if (D.n === 1) return !F.room ? 'Sieh dir Zimmer 23 im Wohnheim an' : !F.book ? 'Rundgang: Besuche die Bibliothek' : 'Geh schlafen (Zimmer 23)';
  if (D.n === 2 && !F.kyle) return 'Geh in die Kantine';
  if (D.n === 2 && !F.nacht) return 'Nacht: Schleich in die Trainingshalle';
  if (D.n === 2) return 'Geh schlafen (Zimmer 23)';
  if (!F.mono) return 'Geh in die Kantine';
  return '';
}
function hubTick(G, dt) {
  const D = SAVE.day;
  if (G.inSun) D.sun += dt;
  G.hint = null;
  G.hubInfo = { goal: hubGoal(), sun: G.inSun };
}
function leaveHub(fn) { G = null; writeSave(); fn(); }
function addExp(n) { SAVE.quinn.exp += n; writeSave(); }
function sleep() {
  const D = SAVE.day, sunOk = D.sun < 6, lines = [];
  let ep = 0;
  lines.push(D.water ? '✔ 2 Liter Wasser getrunken (+5 EP)' : '✘ Kein Wasser getrunken');
  if (D.water) ep += 5;
  lines.push(sunOk ? '✔ Die Sonne gemieden (+5 EP)' : `✘ Zu lange in der Sonne (${Math.round(D.sun)} s)`);
  if (sunOk) ep += 5;
  addExp(ep - (D.water ? 5 : 0)); // Wasser wurde schon beim Trinken gutgeschrieben
  const n = D.n;
  SAVE.day = { n: n + 1, night: false, sun: 0, water: false };
  writeSave();
  SCENE_BG.cur = 'nacht';
  runScene([{ bg: 'system' }, { sys: { head: `TAG ${n} BEENDET`, lines } }, { sys: { head: 'NEUER TAG', lines: [`Tag ${n + 1}`], quests: ['Tagesquest: Trinke 2 Liter Wasser', 'Tagesquest: Meide die Sonne'] } }], () => startMission('akademie'));
}
const SCENE_BOOK = [
  { bg: 'zimmer', portrait: null },
  { narr: 'Die Bibliothek hat drei Etagen. In einem abgelegenen Regal findet Quinn ein Buch über Vampire – eigentlich eine Sammlung von Legenden.' },
  { bg: 'system' },
  { sys: { head: 'SYSTEM', lines: ['Wissen erlangt.'], kv: [['EP', '+10']] } }
];
const SCENE_ROOM = [
  { bg: 'zimmer', portrait: 'vorden' },
  { narr: 'Zimmer 23. Vorden hat dafür gesorgt, dass er mit Quinn zusammenwohnt. Der Dritte im Zimmer ist Peter.' },
  { who: 'Vorden', text: 'Ein Originalkind, ein Stufe-1er und einer ohne Fähigkeit. Das wird lustig.' },
  { portrait: 'peter' },
  { who: 'Peter', text: 'Ich … versuche einfach, niemandem im Weg zu stehen.' }
];

/* ------------------------------------------------------------ Tutorial im ersten Kampf */
function tutorialTick(G, dt) {
  const T = G.tut || (G.tut = { step: 0, moved: 0, t: 0 });
  T.t += dt;
  const p = G.player;
  if (T.step === 0) {
    G.hint = { text: 'Links auf den Bildschirm tippen und ziehen, um zu laufen' };
    if (Math.hypot(p.vx, p.vy) > 40) T.moved += dt;
    if (T.moved > 0.6 || T.t > 7) { T.step = 1; T.t = 0; }
  } else if (T.step === 1) {
    G.hint = { text: '<b>ANGRIFF</b> tippen: drei Schläge in Folge' };
    if (G.stats.hits >= 3 || T.t > 10) { T.step = 2; T.t = 0; }
  } else if (T.step === 2) {
    G.hint = { text: 'Rote Fläche = Angriff kommt.<br>Im letzten Moment <b>AUSWEICHEN</b> → Konter' };
    if (G.stats.perfect >= 1) { T.step = 3; T.t = 0; }
    else if (T.t > 22) { T.step = 3; T.t = 0; }
  } else if (T.step === 3) {
    G.hint = { text: '<b>ANGRIFF</b> gedrückt halten: aufgeladener Schlag, bricht die Deckung' };
    if (T.t > 6) { T.step = 4; G.hint = null; }
  }
}
