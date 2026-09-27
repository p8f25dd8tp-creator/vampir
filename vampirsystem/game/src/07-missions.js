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

/* ------------------------------------------------------------ Rylee (Kap. 15–19)
   Faehigkeit Verhaertung: immer nur EINE Koerperstelle. Die gehaertete Seite dreht
   sich langsam zu Quinn; wer schnell die Seite wechselt (Ausweichen, Finte), trifft. */
const RYLEE_ATK = {
  punch: { type: 'swipe', wind: 0.45, act: 0.1, rec: 0.5, reach: 40, arc: 0.9, dmg: 1, col: '#c8d0dc' },
  rush: { type: 'lunge', wind: 0.6, act: 0.24, rec: 0.7, speed: 300, dmg: 2, shout: '!' }
};
const AI_RYLEE = {
  harden: true,
  params: () => ({ range: 42, speed: 88, cd: 1.0 }),
  choose: (e, d) => (d > 90 ? (Math.random() < 0.5 ? RYLEE_ATK.rush : null) : d < 60 ? RYLEE_ATK.punch : null),
  onTick(e, dt) {
    const p = G.player, want = Math.atan2(p.y - e.y, p.x - e.x);
    if (e.hardDir === undefined) e.hardDir = want;
    const turn = e.state === 'wind' || e.state === 'active' ? 1.2 : 2.2; // beim Angreifen dreht er langsamer
    e.hardDir += clamp(angDiff(e.hardDir, want), -turn * dt, turn * dt);
  }
};

/* ------------------------------------------------------------ Etappe 4: Gegner */
const THUG_ATK = { type: 'swipe', wind: 0.5, act: 0.1, rec: 0.55, reach: 40, arc: 0.9, dmg: 1, col: '#c8b8a0' };
const AI_THUG = { params: () => ({ range: 40, speed: 85, cd: 1.3 }), choose: (e, d) => (d < 58 ? THUG_ATK : null) };
// Brandon: Speer mit grosser Reichweite, Stoss nach vorn (Kap. 30)
const BRANDON_ATK = {
  thrust: { type: 'lunge', wind: 0.55, act: 0.18, rec: 0.6, speed: 280, dmg: 2, shout: '!' },
  sweep: { type: 'swipe', wind: 0.5, act: 0.1, rec: 0.5, reach: 58, arc: 1.3, dmg: 1, col: '#9ad0b0' }
};
const AI_BRANDON = { params: () => ({ range: 55, speed: 90, cd: 0.9 }), choose: (e, d) => (d > 70 ? BRANDON_ATK.thrust : d < 72 ? BRANDON_ATK.sweep : null) };
// Leo: unglaublich schnell, wird immer schneller; Analyse zeigt nichts (Kap. 32)
const LEO_ATK = { type: 'swipe', wind: 0.42, act: 0.08, rec: 0.3, reach: 50, arc: 1.4, dmg: 1, col: '#5ff0d0' };
const AI_LEO = {
  params: () => ({ range: 46, speed: 120 + G.t * 2, cd: Math.max(0.35, 1.0 - G.t * 0.016) }),
  choose: (e, d) => (d < 64 ? Object.assign({}, LEO_ATK, { wind: Math.max(0.28, 0.42 - G.t * 0.004), chain: G.t > 15 ? Object.assign({}, LEO_ATK, { wind: 0.25 }) : null }) : null)
};
// Zweitjaehrige in der Aula: Wasser, Erde, Schlaeger
const WATER_ATK = { type: 'beam', wind: 0.7, act: 0.12, rec: 0.6, len: 200, width: 20, dmg: 1, col: '#6ec8ff' };
const EARTH_ATK = { type: 'lunge', wind: 0.7, act: 0.26, rec: 0.8, speed: 260, dmg: 2, shout: '!' };
const AI_WATER = { params: () => ({ range: 130, speed: 70, cd: 1.6 }), choose: (e, d) => (d < 210 ? WATER_ATK : null) };
const AI_EARTH = { params: () => ({ range: 50, speed: 70, cd: 1.4 }), choose: (e, d) => (d > 80 ? EARTH_ATK : d < 60 ? THUG_ATK : null) };
// Mono in der Aula: Voraussicht + Seelenwaffe (lebende Peitsche) ab halber Kraft (Kap. 45–46)
const MONO_WHIP = { type: 'beam', wind: 0.6, act: 0.14, rec: 0.55, len: 170, width: 16, dmg: 2, col: '#6ab0ff' };
const AI_MONO_BOSS = {
  foresight: true,
  params: (e) => ({ range: e.phase === 2 ? 110 : 60, speed: 95, cd: e.phase === 2 ? 1.0 : 1.3 }),
  choose: (e, d) => (e.phase === 2 ? (d < 180 ? MONO_WHIP : null) : d < 55 ? MONO_ATK : null),
  onHurt(e) {
    if (e.phase === 1 && e.hp <= e.maxHp * 0.6) {
      e.phase = 2; setState(e, 'transform'); G.tele = G.tele.filter((T) => T.owner !== e);
      banner('SEELENWAFFE'); sfx('roar');
      sysMsg({ head: 'SYSTEM', lines: ['Mono ruft seine Seelenwaffe: eine lebende Peitsche.', 'Voraussicht: Einzelne Angriffe sieht er kommen. Ratens Doppelangriff (ANGRIFF halten) nicht.'] }, 4200);
    }
  }
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
      npcs: [{ id: 'jane', at: [80, 300], face: 1 }, { id: 'layla', at: [280, 420], watch: 'player' }, { id: 'erin', at: [300, 360], watch: 'player' }, { id: 'vorden', at: [60, 420], watch: 'player' }, { id: 'peter', at: [50, 470], pose: 'cower' }, { id: 's1', at: [290, 250] }, { id: 's3', at: [300, 300] }],
      inspect: false, noFoeBar: true,
      expBonus: (G) => Math.round((G.tut && G.tut.total) || 0),
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
      foes: [{ id: 'kyle', name: 'Kyle · Fähigkeit: Tigerkrallen', hp: 26, poise: 4, at: [170, 260], ai: AI_KYLE, expRate: 1, expKill: 20, info: { name: 'Kyle Main', race: 'Mensch', ability: 'Verwandlung (Tigerkrallen)', blood: 'B+' } }],
      npcs: [{ id: 'peter', at: [300, 320], pose: 'cower', face: -1 }, { id: 's1', at: [45, 200], pose: 'cheer', watch: 'foe' }, { id: 's2', at: [60, 240], watch: 'foe' }, { id: 's3', at: [300, 205], pose: 'cheer', watch: 'foe' }, { id: 's4', at: [45, 500], watch: 'foe' }, { id: 'zweit', at: [295, 505], pose: 'cheer', watch: 'foe' }],
      inspect: false,
      onTick: tutorialTick
    },
    won: [
      { bg: 'kantine', portrait: 'peter' },
      { who: 'Peter', text: 'Danke … Bisher hat sich noch nie jemand für mich eingesetzt.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'QUEST ERFÜLLT', lines: ['Erster Kampf gewonnen.'], kv: [['EP', '+50']] } },
      { sys: { head: 'NEUE FÄHIGKEIT', lines: ['Analyse (Stufe 1)', 'Zeigt Name, Rasse, Fähigkeitstyp, HP und Blutgruppe eines Ziels. Knopf ANALYSE.'] } },
      { sys: { head: 'OPTIONALE QUEST', lines: ['Trinke das Blut deines Gegners.'], kv: [['Belohnung', '1 Wertepunkt']] } },
      { bg: 'kantine', portrait: 'quinn' },
      { narr: 'Quinn lehnt ab – und kann trotzdem den Blick nicht vom Blut auf dem Boden lösen.' }
    ],
    reward: { exp: 50, skills: ['inspect'] }, // Quest-Belohnung beim ersten Sieg
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
      expBonus: (G) => Math.round(Math.min(20, (G.tut && G.tut.t) || 0) * 2 + G.stats.perfect * 6),
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
      { sys: { head: 'KAMPF', lines: ['Mono, Stufe 6.', 'Versuche, ihn zu treffen. Probier auch ANALYSE.'] } }
    ],
    fight: {
      arena: { art: 'hof', w: 440, h: 700, sun: [{ x: 0, y: 0, w: 440, h: 700 }], paths: [{ x: 192, y: 0, w: 56, h: 700 }] },
      playerAt: [220, 440],
      foes: [{ id: 'mono', name: 'Mono · Stufe 6', hp: 60, poise: 99, at: [220, 320], ai: AI_MONO, info: { name: 'Mono', race: 'Mensch', ability: '?', blood: '?' } }],
      npcs: [{ id: 'peter', at: [120, 380], pose: 'cower', face: 1 }, { id: 'vorden', at: [330, 400], face: -1 }, { id: 'zweit', at: [110, 250], face: 1 }, { id: 'zweit', at: [340, 260], face: -1 }],
      inspect: true, noDeath: true,
      onInspect: (G) => { (G.tut || (G.tut = { t: 0 })).inspected = true; },
      expBonus: (G) => Math.min(40, (G.stats.evaded || 0) * 4),
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
    next: 'credits'
  },

  /* Credits und Erpressung (Kap. 15) */
  credits: {
    id: 'credits', title: 'Credits', src: 'Kapitel 15',
    scene: [
      { bg: 'kantine', portrait: null },
      { narr: 'An der Schule bekommt jeder Schüler zehn Credits am Tag. Dafür gibt es Essen, Kleidung und Kleinkram im Laden.' },
      { portrait: 'rylee' },
      { narr: 'Drei Schüler mit Stufe 2 verlangen von den Stufe-1ern ihre Credits – angeblich für einen gewissen Dan. Einer von ihnen heißt Rylee.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'NEUE QUEST', lines: ['Besiege Rylee.', 'Bonus-EP für den Stufenunterschied.'] } },
      { bg: 'kantine', portrait: 'quinn' },
      { narr: 'Quinn will nicht, dass jemand ihn erkennt. Er braucht etwas, um sein Gesicht zu verbergen.' }
    ],
    after: () => { SAVE.flags.credits = true; },
    next: 'akademie'
  },

  /* Rylee im Park (Kap. 16–17) */
  rylee: {
    id: 'rylee', title: 'Maske im Park', src: 'Kapitel 16–17', type: 'duell',
    scene: [
      { bg: 'nacht', portrait: 'quinn', extra: { mask: true } },
      { narr: 'Nachts ist Quinns Körper ein anderer: Er läuft ohne Mühe, und im Dunkeln sieht er fast so gut wie am Tag.' },
      { narr: 'Mit der schwarzen Maske wartet er im Park auf Rylee.' },
      { portrait: 'rylee' },
      { who: 'Rylee', text: 'Wer bist du denn? Nimm das Ding ab!' },
      { bg: 'system', portrait: null },
      { sys: { head: 'KAMPF', lines: ['Rylee kann immer nur EINE Körperstelle verhärten (graue Platte).', 'Schläge dorthin prallen ab. Wechsle schnell die Seite – z. B. durch Ausweichen – und triff, wo er weich ist.'] } }
    ],
    fight: {
      arena: { art: 'park', w: 420, h: 700, night: true, lamps: [[120, 260], [300, 260], [120, 460], [300, 460]], trees: [[40, 150], [390, 170], [30, 600], [400, 620]] },
      playerAt: [210, 470], mask: true,
      foes: [{ id: 'rylee', name: 'Rylee · Verhärtung', hp: 22, poise: 3, at: [210, 300], ai: AI_RYLEE, expRate: 1.5, expKill: 25, info: { name: 'Rylee', race: 'Mensch', ability: 'Verhärtung (eine Körperstelle)', blood: '0+' } }],
      inspect: true,
      expBonus: (G, won) => (won ? 40 : 0)
    },
    won: [
      { bg: 'nacht', portrait: 'quinn', extra: { mask: true } },
      { narr: 'Rylee bleibt am Boden liegen. Quinn spürt, wie etwas in ihm zerreißt und neu zusammenwächst.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'EVOLUTION', lines: ['Rasse: Mensch → Halbling'], kv: [['HP', '+5']] } },
      { sys: { head: 'NEUE FÄHIGKEIT', lines: ['Blutschnitt (Stufe 1)', 'Ein Hieb aus Blut, etwa 5 Meter weit. Keine Abklingzeit – kostet 1 HP pro Einsatz.'] } },
      { sys: { head: 'WARNUNG', lines: ['Blutdurst: Ohne Menschenblut verliert Quinn mit der Zeit HP.'] } },
      { bg: 'nacht', portrait: 'quinn' },
      { who: 'Quinn', text: 'Blut? Bin ich etwa … ein Vampir?' },
      { narr: 'Er beugt sich über Rylee – und bringt es nicht fertig. Layla, die ihm heimlich gefolgt ist, versteht die Szene völlig falsch.' }
    ],
    reward: { exp: 0, skills: ['bloodswipe'] },
    after: () => { const Q = SAVE.quinn; Q.race = 'Halbling'; Q.thirst = 10; SAVE.flags.rylee = true; },
    next: 'akademie'
  },

  /* Durst, Rylee und Dan (Kap. 19) */
  dan: {
    id: 'dan', title: 'Durst', src: 'Kapitel 18–19', type: 'gefecht',
    scene: [
      { bg: 'zimmer', portrait: 'quinn' },
      { narr: 'Über Nacht ist Quinn von 15 auf 5 HP gefallen. Seine Sinne sind überempfindlich, jeder Herzschlag im Raum dröhnt.' },
      { bg: 'kantine', portrait: 'rylee' },
      { who: 'Rylee', text: 'Du warst das im Park, oder? Das zahl ich dir heim.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'KAMPF', lines: ['Nur 5 HP. Blutschnitt kostet Leben – überleg dir jeden Einsatz.'] } }
    ],
    fight: {
      arena: { art: 'kantine', w: 340, h: 600, blocks: [{ x: 18, y: 150, w: 70, h: 26 }, { x: 252, y: 150, w: 70, h: 26 }, { x: 18, y: 440, w: 70, h: 26 }, { x: 252, y: 440, w: 70, h: 26 }] },
      playerAt: [170, 400],
      foes: [{ id: 'rylee', name: 'Rylee · Verhärtung', hp: 30, poise: 3, at: [170, 260], ai: AI_RYLEE, expRate: 1.5, info: { name: 'Rylee', race: 'Mensch', ability: 'Verhärtung (eine Körperstelle)', blood: '0+' } }],
      npcs: [{ id: 'vorden', at: [300, 320], watch: 'player' }, { id: 'peter', at: [50, 330], pose: 'cower' }, { id: 's1', at: [300, 200], watch: 'foe' }, { id: 's4', at: [45, 500], watch: 'foe' }],
      inspect: true, noDeath: true,
      onTick: (G, dt) => {
        const T = G.tut || (G.tut = { t: 0 });
        T.t += dt;
        if (G.state === 'play' && (T.t > 16 || G.foe.hp < G.foe.maxHp * 0.5 || G.player.hp <= 1)) {
          G.state = 'won'; G.tele.length = 0; banner('DAN'); later(1.0, () => G.opt.onWin(G));
        }
      }
    },
    won: [
      { bg: 'kantine', portrait: 'dan' },
      { narr: 'Bevor Quinn sich auf Rylee stürzen kann, packt ihn ein riesiger Schüler und schleudert ihn quer durch den Raum: Dan, Rylees Beschützer.' },
      { portrait: 'vorden' },
      { who: 'Vorden', text: 'Stufe 5, Original. Willst du wirklich weitermachen?' },
      { narr: 'Dan zögert – und zieht ab. Quinn liegt am Boden. Noch 1 HP.' }
    ],
    after: () => { SAVE.quinn.thirst = 14; SAVE.flags.dan = true; },
    next: 'akademie'
  },

  /* Der Biss und die Abmachung (Kap. 19–23) */
  biss: {
    id: 'biss', title: 'Der erste Biss', src: 'Kapitel 19–23',
    scene: [
      { bg: 'zimmer', portrait: 'layla' },
      { narr: 'In der Bibliothek lernt Layla allein. Quinn steht plötzlich hinter ihr – der Hunger ist stärker als er.' },
      { narr: 'Der Biss lähmt sie, ohne ihr wehzutun. Quinn trinkt nur so viel, wie er braucht.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'SYSTEM', lines: ['Blutdurst gestillt.', 'Blutgruppe A+ getrunken.'], kv: [['Stärke', '+1']] } },
      { bg: 'zimmer', portrait: 'hayley' },
      { narr: 'Quinn bringt Layla zur Schulärztin Hayley, die die kleinen Wunden schließt. Layla erzählt von einer Bestie und schweigt über den Rest.' },
      { portrait: 'layla' },
      { who: 'Layla', text: 'Ich weiß, was du bist. Und ich verrate dich nicht – aber du erklärst mir alles.' },
      { portrait: 'quinn' },
      { narr: 'Quinn behauptet, es sei ein seltenes Fähigkeitsbuch gewesen. Die beiden treffen eine Abmachung: Layla hält dicht, hilft ihm und gibt ihm ihr Blut, wenn er es braucht.' },
    ],
    after: () => { const Q = SAVE.quinn; Q.thirst = 0; drinkBlood('layla', 'A+'); stepDone('biss'); },
    next: 'akademie'
  }
};
MISSIONS.training = {
  id: 'training', title: 'Training', src: 'frei', type: 'pruefung',
  fight: {
    arena: { art: 'halle', w: 340, h: 680 },
    playerAt: [170, 460],
    foes: [{ id: 'geraet', name: 'Trainingsgerät', hp: 9999, poise: 999, at: [170, 280], draw: 'geraet', fixed: true, r: 16, cd: 1.2, ai: AI_GERAET, info: { name: 'Trainingsgerät', race: '—', ability: 'Strahl', blood: '—' } }],
    inspect: true, noDeath: true, noFoeBar: true,
    expBonus: (G) => Math.round(Math.min(30, (G.tut && G.tut.t) || 0) * 2 + G.stats.perfect * 5 - G.stats.taken * 2),
    onTick: survivalTick(30)
  },
  next: 'akademie', repeat: true
};
Object.assign(MISSIONS, {
  /* Rylees Bande (Kap. 26): erstes Tag-Team */
  bande: {
    id: 'bande', title: 'Zu zweit', src: 'Kapitel 26', type: 'gefecht',
    scene: [
      { bg: 'nacht', portrait: 'layla' },
      { narr: 'Layla hält sich an die Abmachung – und will mehr als nur zusehen. In dieser Nacht warten Rylee und zwei seiner Leute im Park.' },
      { who: 'Layla', text: 'Ich decke dich mit dem Bogen. Du musst nur nah genug rankommen.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'TAG-TEAM', lines: ['Unten links wechselst du zwischen Quinn und Layla.', 'Wen du nicht steuerst, kämpft selbstständig weiter.', 'Layla: ANGRIFF schießt Pfeile, halten = durchschlagender Schuss.'] } }
    ],
    fight: {
      arena: { art: 'park', w: 420, h: 700, night: true, lamps: [[120, 260], [300, 260], [120, 460], [300, 460]], trees: [[40, 150], [390, 170], [30, 600], [400, 620]] },
      playerAt: [210, 500], mask: true, party: ['quinn', 'layla'],
      foes: [
        { id: 'rylee', name: 'Rylee · Verhärtung', hp: 22, poise: 3, at: [210, 280], ai: AI_RYLEE, expRate: 1.5, expKill: 20, info: { name: 'Rylee', race: 'Mensch', ability: 'Verhärtung', blood: '0+' } },
        { id: 'fei', look: 's3', name: 'Helfer', hp: 12, at: [130, 310], ai: AI_THUG, expRate: 1, expKill: 10, info: { name: 'Helfer', race: 'Mensch', ability: 'Stufe 2', blood: 'A-' } },
        { id: 'loop', look: 's1', name: 'Helfer', hp: 12, at: [290, 310], ai: AI_THUG, expRate: 1, expKill: 10, info: { name: 'Helfer', race: 'Mensch', ability: 'Stufe 2', blood: 'B+' } }
      ],
      inspect: true
    },
    won: [
      { bg: 'nacht', portrait: 'layla' },
      { narr: 'Ein Pfeil ins Knie, und Rylee geht zu Boden. Die beiden nehmen ihnen die erpressten Credits ab – und füllen heimlich etwas Blut in kleine Glasröhrchen.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'BLUTGRUPPEN', lines: ['Das Blut verschiedener Menschen wirkt verschieden:', 'A → Stärke · B → Agilität · AB → Ausdauer · 0 → freier Wertepunkt', 'Jede Person bringt nur beim ersten Mal einen Wert.'] } },
      { call: () => {
        const g = [drinkBlood('bande1', 'A-'), drinkBlood('bande2', 'B+'), drinkBlood('rylee', '0+')].filter(Boolean);
        MISSIONS.bande.won[5].sys.lines = g.length ? g : ['Nichts Neues.'];
      } },
      { sys: { head: 'BLUT GETRUNKEN', lines: [] } }
    ],
    reward: { exp: 30 },
    after: () => { stepDone('bande'); SAVE.credits += 20; },
    next: 'akademie'
  },

  /* Waffenklasse (Kap. 27–30) und Brandon */
  waffen: {
    id: 'waffen', title: 'Die Waffenklasse', src: 'Kapitel 27–29',
    scene: [
      { bg: 'kantine', portrait: 'leo' },
      { narr: 'Jeder wählt eine Kampfklasse. Quinn nimmt die Waffenklasse – und zu seiner Überraschung auch Erin.' },
      { narr: 'Die Waffenhalle ist zwanzig Meter hoch. Der Lehrer ist ein kahlköpfiger Mann mit einem Katana aus Bestienmaterial: Leo.' },
      { who: 'Leo', text: 'Eine Waffe ist nur so gut wie der, der sie hält. Heute kämpft ihr ohne Fähigkeiten.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'SYSTEM', lines: ['Analyse zeigt jetzt auch Waffenwerte und ob eine Waffe zu dir passt.', 'Waffen gibt es in acht Stufen, von Basic bis zu Dämonenwaffen.'] } },
      { bg: 'kantine', portrait: 'brandon' },
      { narr: 'Im Übungskampf bekommt Quinn Brandon als Gegner, Stufe 3, mit einem Speer. Brandon lacht über den Stufe-1er.' }
    ],
    next: 'brandon'
  },
  brandon: {
    id: 'brandon', title: 'Brandon', src: 'Kapitel 30–31', type: 'duell',
    scene: [{ bg: 'system' }, { sys: { head: 'DUELL', lines: ['Brandon, Stufe 3, Speer.', 'Große Reichweite – geh nah ran oder weiche dem Stoß seitlich aus.'] } }],
    fight: {
      arena: { art: 'halle', w: 340, h: 680 },
      playerAt: [170, 460],
      foes: [{ id: 'brandon', name: 'Brandon · Stufe 3 · Speer', hp: 28, poise: 4, at: [170, 290], ai: AI_BRANDON, expRate: 1.5, expKill: 25, info: { name: 'Brandon Richardson', race: 'Mensch', ability: 'Wind (Stufe 3)', blood: 'AB+' } }],
      npcs: [{ id: 'leo', at: [60, 250], watch: 'player' }, { id: 'erin', at: [290, 260], watch: 'player' }, { id: 's2', at: [50, 520] }, { id: 's3', at: [295, 530] }],
      inspect: true
    },
    won: [
      { bg: 'kantine', portrait: 'brandon' },
      { narr: 'Brandons Speer bricht. Die Halle ist still, dann gewinnt der Stufe-1er.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'NEUE FÄHIGKEIT', lines: ['Blutbank (Stufe 1)', 'Speichert bis zu 100 ml Blut. Fällt Quinn unter 5 HP, heilt sie automatisch: 10 ml = 5 HP.', 'Getrunkenes Blut füllt sie auf.'] } },
      { bg: 'kantine', portrait: 'leo' },
      { narr: 'Leo hat den Kampf nicht gesehen – er ist blind. Aber er hat Quinns Aura gespürt. Sie erinnert ihn an etwas, das er aus dem Krieg kennt.' }
    ],
    reward: { exp: 20, skills: ['bloodbank'] },
    after: () => { SAVE.quinn.bank = 60; stepDone('waffen'); },
    next: 'akademie'
  },
  leo: {
    id: 'leo', title: 'Der blinde Schwertkämpfer', src: 'Kapitel 32–33', type: 'duell',
    scene: [
      { bg: 'kantine', portrait: 'leo' },
      { who: 'Leo', text: 'Ich will selbst sehen, was du bist. Auf deine Art.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'QUEST', lines: ['Duell gegen Leo.', 'Analyse zeigt bei ihm – nichts.', 'Halte 40 Sekunden durch. Er wird immer schneller.'] } }
    ],
    fight: {
      arena: { art: 'halle', w: 340, h: 680 },
      playerAt: [170, 460],
      foes: [{ id: 'leo', name: 'Leo · ???', hp: 999, poise: 99, at: [170, 290], ai: AI_LEO, expRate: 0.5, info: { name: '???', race: '???', ability: '???', blood: '???' } }],
      inspect: true, noDeath: true, noFoeBar: true,
      expBonus: (G) => Math.round(Math.min(40, (G.tut && G.tut.t) || 0) + G.stats.perfect * 6),
      onTick: survivalTick(40)
    },
    won: [
      { bg: 'kantine', portrait: 'leo' },
      { narr: 'Nach vierzig Sekunden hebt Leo die Hand. Kein Sieger. Er lächelt zum ersten Mal.' },
      { who: 'Leo', text: 'Nimm die hier. Bei mir liegen sie nur herum.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'AUSRÜSTUNG', lines: ['Schwarzhorn-Handschuhe'], kv: [['Stärke', '+3'], ['Verteidigung', '+2'], ['Blutschnitt', '+5 %']] } },
      { bg: 'zimmer', portrait: 'vorden' },
      { narr: 'Am Abend sieht Vorden Quinns blutige Kleidung. Seine Augen verändern sich. Es klingt, als stritten in ihm mehrere Stimmen.' }
    ],
    reward: { exp: 30 },
    after: () => { SAVE.quinn.gear.hands = 'gauntlets'; stepDone('leo'); },
    next: 'akademie'
  },

  /* Fei und Loop auf dem Dach (Kap. 36–37) */
  dach: {
    id: 'dach', title: 'Auf dem Dach', src: 'Kapitel 33–37', type: 'gefecht',
    scene: [
      { bg: 'nacht', portrait: 'fei' },
      { narr: 'Brandons Freunde Fei und Loop wollen Rache für die Blamage. Nachts locken sie Quinn aufs Dach des Wohnheims. Layla folgt ihm.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'KAMPF', lines: ['Zwei Gegner. Wechsle zwischen Quinn und Layla.'] } }
    ],
    fight: {
      arena: { art: 'halle', w: 340, h: 640, night: true },
      playerAt: [170, 440], party: ['quinn', 'layla'],
      foes: [
        { id: 'fei', name: 'Fei', hp: 20, poise: 3, at: [120, 280], ai: AI_BRANDON, expRate: 1.2, expKill: 15, info: { name: 'Fei', race: 'Mensch', ability: 'Stufe 2', blood: 'B-' } },
        { id: 'loop', name: 'Loop', hp: 20, poise: 3, at: [220, 270], ai: AI_THUG, expRate: 1.2, expKill: 15, info: { name: 'Loop', race: 'Mensch', ability: 'Stufe 2', blood: '0-' } }
      ],
      inspect: true
    },
    won: [
      { bg: 'nacht', portrait: 'quinn' },
      { narr: 'Quinn beißt Loop. Als er vom Dach springt, bremst Layla seinen Fall mit Telekinese.' },
      { bg: 'system', portrait: null, call: () => { MISSIONS.dach.won[3].sys.lines = [drinkBlood('loop', '0-'), drinkBlood('fei', 'B-')].filter(Boolean).concat(['Die Blutbank ist aufgefüllt.']); } },
      { sys: { head: 'BLUT GETRUNKEN', lines: [] } },
      { bg: 'nacht', portrait: 'loop' },
      { narr: 'Loop bettelt um Gnade – und erzählt, was an der Schule niemand weiß: Brandon ist tot.' }
    ],
    reward: { exp: 20 },
    after: () => { stepDone('dach'); },
    next: 'akademie'
  },

  /* System-Tutorial und Verhoer (Kap. 39–41) */
  tutorial: {
    id: 'tutorial', title: 'Nahkampf', src: 'Kapitel 39–41',
    scene: [
      { bg: 'system' },
      { sys: { head: 'TUTORIAL', lines: ['Nahkampf (Stufe 1)', 'Ein Video spielt ab: Ein blonder Mann mit roten Augen führt zwei Techniken vor.'] } },
      { sys: { head: 'NEUE FÄHIGKEITEN', lines: ['Blitzschritt – ein Sprung über bis zu 5 Meter. Braucht Agilität 15, kostet viel Ausdauer.', 'Hammerschlag – ein vernichtender Schlag, der den Gegner taumeln lässt. Braucht Stärke 15.'] } },
      { bg: 'kantine', portrait: 'quinn' },
      { narr: 'Am nächsten Tag holt das Militär Quinn zum Verhör. Eine Frau mit einer Wahrheits-Fähigkeit stellt Fragen, gegen die das System nichts tun kann. Quinn hat Brandon nicht getötet – und kommt frei.' }
    ],
    reward: { exp: 0, skills: ['flashstep', 'hammer'] },
    after: () => { stepDone('tutorial'); },
    next: 'akademie'
  },

  /* Die Aula (Kap. 41–47) */
  aula: {
    id: 'aula', title: 'Die Aula', src: 'Kapitel 41–45', type: 'gefecht',
    scene: [
      { bg: 'kantine', portrait: 'mono' },
      { narr: 'Die Zweitjährigen treiben hundert Erstjährige in die Aula. Auf der Bühne hängt Vorden gefesselt vor einer Platte.' },
      { who: 'Mono', text: 'Das hier ist eine Lektion. Für alle, die glauben, ihre Stufe bedeute nichts.' },
      { portrait: 'erin' },
      { narr: 'Als die Zweitjährigen die Neuen zwingen, auf Vorden zu werfen, reicht es Quinn. Erin und Layla stellen sich an seine Seite.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'KAMPF', lines: ['Zweitjährige mit Wasser und Erde.', 'Tag-Team: Quinn, Erin (Schwert, halten = Eis) und Layla (Bogen).'] } }
    ],
    fight: {
      arena: { art: 'kantine', w: 380, h: 680, blocks: [{ x: 18, y: 180, w: 70, h: 26 }, { x: 292, y: 180, w: 70, h: 26 }, { x: 18, y: 500, w: 70, h: 26 }, { x: 292, y: 500, w: 70, h: 26 }] },
      playerAt: [190, 520], party: ['quinn', 'erin', 'layla'],
      foes: [
        { id: 'z1', look: 'zweit', name: 'Zweitjähriger · Wasser', hp: 16, at: [120, 250], ai: AI_WATER, expRate: 1, expKill: 12, info: { name: 'Zweitjähriger', race: 'Mensch', ability: 'Wasser', blood: 'B-' } },
        { id: 'z2', look: 'zweit', name: 'Zweitjähriger · Erde (Stufe 4)', hp: 22, at: [260, 240], ai: AI_EARTH, expRate: 1, expKill: 15, info: { name: 'Zweitjähriger', race: 'Mensch', ability: 'Erde (Stufe 4)', blood: 'AB-' } },
        { id: 'z3', look: 's3', name: 'Zweitjähriger', hp: 14, at: [190, 300], ai: AI_THUG, expRate: 1, expKill: 10, info: { name: 'Zweitjähriger', race: 'Mensch', ability: 'Stufe 3', blood: 'A+' } },
        { id: 'z4', look: 's1', name: 'Zweitjähriger', hp: 14, at: [90, 330], ai: AI_THUG, expRate: 1, expKill: 10, info: { name: 'Zweitjähriger', race: 'Mensch', ability: 'Stufe 3', blood: '0+' } }
      ],
      npcs: [{ id: 'vorden', at: [190, 120], pose: 'cower' }, { id: 'mono', at: [300, 130], watch: 'player' }, { id: 'peter', at: [40, 610], pose: 'cower' }, { id: 's2', at: [340, 620], watch: 'foe' }, { id: 's4', at: [30, 420], watch: 'foe' }],
      inspect: true
    },
    won: [
      { bg: 'kantine', portrait: 'vorden' },
      { narr: 'Die Zweitjährigen liegen am Boden. Da verändert sich Vorden auf der Bühne. Er lässt sich von Layla berühren, kopiert ihre Telekinese und reißt sich los.' },
      { portrait: 'raten' },
      { who: 'Raten', text: 'Vorden ist gerade nicht da. Ich bin Raten. Und Mono gehört mir.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'NEUE FIGUR', lines: ['Raten', 'Schnelle Schlagfolgen. ANGRIFF halten: Telekinese und Wasser gleichzeitig – ein Doppelangriff, den selbst Voraussicht nicht ausweichen kann.'] } }
    ],
    reward: { exp: 30 },
    next: 'aula2'
  },
  aula2: {
    id: 'aula2', title: 'Raten gegen Mono', src: 'Kapitel 45–47', type: 'boss',
    fight: {
      arena: { art: 'kantine', w: 380, h: 680, blocks: [{ x: 18, y: 180, w: 70, h: 26 }, { x: 292, y: 180, w: 70, h: 26 }, { x: 18, y: 500, w: 70, h: 26 }, { x: 292, y: 500, w: 70, h: 26 }] },
      playerAt: [190, 480], party: ['raten', 'quinn'],
      foes: [{ id: 'mono', name: 'Mono · Voraussicht', hp: 90, poise: 5, at: [190, 280], ai: AI_MONO_BOSS, expRate: 1.2, expKill: 40, info: { name: 'Mono', race: 'Mensch', ability: 'Voraussicht (zwei Sekunden)', blood: 'A-' } }],
      npcs: [{ id: 'erin', at: [60, 600], watch: 'foe' }, { id: 'layla', at: [320, 600], watch: 'foe' }, { id: 's2', at: [340, 150], watch: 'foe' }, { id: 's4', at: [30, 150], watch: 'foe' }],
      inspect: true, noDeath: true,
      onTick: (G, dt) => {
        const T = G.tut || (G.tut = { t: 0 }); T.t += dt;
        if (T.t < 6) G.hint = { text: 'Einzelne Schläge sieht Mono kommen.<br><b>ANGRIFF halten</b>: Ratens Doppelangriff' };
        else if (!T.h2) { T.h2 = true; G.hint = null; }
        if (G.state === 'play' && (G.foe.hp <= G.foe.maxHp * 0.3 || T.t > 60)) { G.state = 'won'; G.tele.length = 0; banner('FAY'); later(1.0, () => G.opt.onWin(G)); }
      }
    },
    won: [
      { bg: 'kantine', portrait: 'fay' },
      { narr: 'Ein Windstoß, ein Aufblitzen – und Mono liegt am Boden. Sergeant Fay ist so schnell, dass niemand ihre Bewegung gesehen hat. Peter hat sie geholt.' },
      { portrait: 'hayley' },
      { narr: 'Hayley versorgt die Verletzten. Dass Quinns Wunden schon fast verheilt sind, erklärt er mit einem Freund, der heilen kann.' },
      { portrait: 'del' },
      { narr: 'Die Führung der Akademie berät. Echte Strafen gibt es keine – aber in der nächsten Woche beginnen die ersten Portalmissionen.' },
      { bg: 'nacht', portrait: null },
      { narr: 'Ende der vierten Etappe. Als Nächstes: Earl, Peters Geheimnis und die Portale.' }
    ],
    reward: { exp: 40 },
    after: () => { stepDone('aula'); },
    next: null
  }
});
const MISSION_ORDER = ['prolog', 'test', 'kyle', 'nacht', 'mono', 'rylee', 'dan', 'biss', 'bande', 'waffen', 'brandon', 'leo', 'dach', 'tutorial', 'aula', 'aula2'];

/* ------------------------------------------------------------ Etappe 4 im Hof: Story-Schritte */
const STORY4 = [
  { id: 'bande', need: 'biss', night: true, label: 'Park (mit Layla)', x: 220, y: 680, goal: 'Nachts mit Layla und Maske in den Park', mission: 'bande' },
  { id: 'waffen', need: 'bande', newDay: true, label: 'Waffenklasse', x: 335, y: 420, goal: 'Geh zur Waffenklasse (Trainingshalle)', mission: 'waffen' },
  { id: 'leo', need: 'waffen', newDay: true, label: 'Duell mit Leo', x: 335, y: 420, goal: 'Leo erwartet dich in der Trainingshalle', mission: 'leo' },
  { id: 'dach', need: 'leo', night: true, label: 'Dach des Wohnheims', x: 110, y: 150, goal: 'Nachts aufs Dach des Wohnheims', mission: 'dach' },
  { id: 'tutorial', need: 'dach', newDay: true, label: 'Zimmer 23 · System', x: 110, y: 150, goal: 'Ruh dich im Zimmer 23 aus', mission: 'tutorial' },
  { id: 'aula', need: 'tutorial', label: 'Aula', x: 105, y: 420, goal: 'Unruhe in der Aula – geh hin', mission: 'aula' }
];
function stepDone(id) { SAVE.flags[id] = true; SAVE.flags[id + 'Day'] = SAVE.day.n; writeSave(); }
// aktueller Schritt und was davor noetig ist ('sleep' | 'wait' | 'go')
function story4State() {
  const F = SAVE.flags, D = SAVE.day;
  if (!F.biss) return null;
  const st = STORY4.concat(typeof STORY5 !== 'undefined' ? STORY5 : [], typeof STORY6 !== 'undefined' ? STORY6 : []).find((x) => !F[x.id]);
  if (!st) return null;
  if (st.newDay && D.n <= (F[st.need + 'Day'] || 0)) return { st, need: 'sleep' };
  if (st.night && !D.night) return { st, need: 'wait' };
  if (!st.night && D.night) return { st, need: 'sleep' };
  return { st, need: 'go' };
}

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
  G.hint = { text: ev < 2 ? 'Greif Mono an' : T.inspected ? '' : 'Tippe <b>ANALYSE</b>' };
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
  pois.push({ x: 330, y: 150, label: 'Bibliothek', col: '#ff6a7a', hidden: () => night || !(F.dan && !F.biss), action: go('biss') });
  pois.push({ x: 330, y: 150, label: 'Bibliothek', hidden: () => F.book || night, action: () => leaveHub(() => runScene(SCENE_BOOK, () => { F.book = true; addExp(10); writeSave(); startMission('akademie'); })) });
  // Wohnheim: Zimmer 23 (Kap. 8–9), Schlafen
  pois.push({ x: 110, y: 150, label: F.room ? 'Zimmer 23 · Schlafen' : 'Zimmer 23', col: '#ffe6a0', hidden: () => !canSleep() && F.room, action: () => leaveHub(() => (F.room ? sleep() : runScene(SCENE_ROOM, () => { F.room = true; writeSave(); startMission('akademie'); }))) });
  // Kantine: Kyle (Tag 2), Mono (Tag 3)
  pois.push({ x: 105, y: 420, label: 'Kantine', col: '#ffb040', hidden: () => night || (!(D.n === 2 && !F.kyle) && !(D.n >= 3 && F.nacht && !F.mono) && !(F.rylee && !F.dan && D.n >= 4)), action: () => leaveHub(() => startMission(D.n === 2 ? 'kyle' : !F.mono ? 'mono' : 'dan')) });
  // Etappe 3: Vorden steckt Quinn Credits zu (Kap. 16)
  pois.push({ x: 110, y: 150, label: 'Zimmer 23 · Vorden', col: '#ffd27a', hidden: () => night || !(F.credits && !F.vordenGift), action: () => leaveHub(() => runScene(SCENE_VORDEN_GIFT, () => { F.vordenGift = true; SAVE.credits += 20; writeSave(); startMission('akademie'); })) });
  // Laden: schwarze Maske
  pois.push({ x: 262, y: 470, label: 'Laden', col: '#e8c77a', hidden: () => night || !F.credits, action: () => { G.paused = true; showShop(() => { if (G) G.paused = false; startMission('akademie'); }); } });
  // Bis zur Nacht warten (Tag 3)
  pois.push({ x: 110, y: 150, label: 'Zimmer 23 · Bis zur Nacht warten', col: '#9ab0ff', hidden: () => night || !(F.mask && !F.rylee), action: () => leaveHub(() => { D.night = true; writeSave(); startMission('akademie'); }) });
  // Park (Nacht, mit Maske)
  pois.push({ x: 220, y: 680, label: 'Park', col: '#c8a0ff', hidden: () => !(night && F.mask && !F.rylee), action: go('rylee') });
  // Etappe 4: Story-Schritte
  const S4 = story4State();
  if (S4 && S4.need === 'go') pois.push({ x: S4.st.x, y: S4.st.y, label: S4.st.label, col: '#ff9ab0', action: go(S4.st.mission) });
  if (S4 && S4.need === 'wait') pois.push({ x: 110, y: 150, label: 'Zimmer 23 · Bis zur Nacht warten', col: '#9ab0ff', action: () => leaveHub(() => { D.night = true; writeSave(); startMission('akademie'); }) });
  // Laylas Blut: einmal am Tag die Blutbank auffuellen (Abmachung, Kap. 23)
  pois.push({ x: 330, y: 150, label: 'Layla (Blut)', col: '#ff6a7a', hidden: () => night || !F.biss || !SAVE.quinn.skills.includes('bloodbank') || D.layla, action: () => { D.layla = true; SAVE.quinn.bank = Math.min(100, SAVE.quinn.bank + 40); writeSave(); sfx('heal'); sysMsg({ head: 'BLUTBANK', lines: ['Layla gibt dir etwas Blut.'], kv: [['Blutbank', SAVE.quinn.bank + ' / 100 ml']] }); } });
  // Wasserspender (Tagesquest)
  pois.push({ x: 175, y: 440, label: 'Wasser trinken', col: '#6ec8ff', hidden: () => night || D.water, action: () => { D.water = true; writeSave(); sfx('heal'); sysMsg({ head: 'TAGESQUEST ERFÜLLT', lines: ['2 Liter Wasser getrunken.'], kv: [['EP', '+5']] }); addExp(5); } });
  // Trainingshalle tagsueber: freies Training fuer EP
  pois.push({ x: 335, y: 420, label: 'Training (EP)', col: '#9ad8ff', hidden: () => night || D.n < 2 || F.vrintro, action: go('training') });
  // Power Fighter: VR-Raum, frei spielbar (Kap. 51)
  pois.push({ x: 290, y: 445, label: 'VR-Raum · Power Fighter', col: '#5ff0ff', hidden: () => night || !F.vrintro, action: () => { G.paused = true; showVrMenu(() => { if (G) G.paused = false; }); } });
  // Trainingshalle nachts (Kap. 12)
  pois.push({ x: 335, y: 420, label: 'Trainingshalle', col: '#c8a0ff', hidden: () => !(night && F.kyle && !F.nacht), action: go('nacht') });
  const blocks = buildings.map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h - 8, invisible: true }));
  // Schatten: unter den Gebaeuden und unter dem ueberdachten Hauptweg (sicherer Weg durch den Hof)
  const shade = buildings.map((b) => ({ x: b.x - 4, y: b.y + b.h - 8, w: b.w + 8, h: 46 })).concat([{ x: 192, y: 130, w: 56, h: H - 130 }]);
  return {
    arena: { art: 'hof', w: W, h: H, buildings, blocks, pois, paths: [{ x: 192, y: 130, w: 56, h: H - 130 }, { x: 0, y: 452, w: W, h: 44 }, { x: 0, y: 160, w: W, h: 40 }],
      sun: night ? [] : [{ x: 0, y: 0, w: W, h: H }], shade, night,
      trees: [[40, 520], [400, 510], [30, 650], [410, 660], [150, 250], [300, 255]], benches: [[130, 560], [300, 580]] },
    playerAt: [220, 620], foes: [],
    npcs: night ? [] : [
      { id: 's1', at: [60, 540], path: [[60, 540], [150, 600], [60, 620]] },
      { id: 's2', at: [380, 560], path: [[380, 560], [300, 640], [390, 620]], speed: 45 },
      { id: 's3', at: [300, 230], path: [[300, 230], [420, 240], [360, 270]] },
      { id: 's4', at: [80, 240], path: [[80, 240], [20, 270], [150, 280]], speed: 40 }
    ],
    inspect: SAVE.quinn.skills.includes('inspect'), hub: true, onTick: hubTick
  };
}
function canSleep() {
  const D = SAVE.day, F = SAVE.flags;
  if (D.n === 1) return F.book && F.room;
  if (D.n === 2) return F.kyle && F.nacht;
  if (D.n === 3) return F.rylee;
  const S4 = story4State();
  if (S4) return S4.need === 'sleep';
  if (F.dan && !F.biss) return false;
  return D.n >= 4;
}
function hubGoal() {
  const D = SAVE.day, F = SAVE.flags;
  if (D.n === 1) return !F.room ? 'Sieh dir Zimmer 23 im Wohnheim an' : !F.book ? 'Rundgang: Besuche die Bibliothek' : 'Geh schlafen (Zimmer 23)';
  if (D.n === 2 && !F.kyle) return 'Geh in die Kantine';
  if (D.n === 2 && !F.nacht) return 'Nacht: Schleich in die Trainingshalle';
  if (D.n === 2) return 'Geh schlafen (Zimmer 23)';
  if (!F.mono) return 'Geh in die Kantine';
  if (!F.vordenGift) return 'Geh ins Zimmer 23 (Vorden)';
  if (!F.mask) return `Kaufe im Laden eine Maske (${SAVE.credits} Credits)`;
  if (!F.rylee) return D.night ? 'Geh in den Park (unten)' : 'Warte im Zimmer 23 auf die Nacht';
  if (D.n === 3) return 'Geh schlafen (Zimmer 23)';
  if (!F.dan) return 'Geh in die Kantine';
  if (!F.biss) return 'Geh in die Bibliothek – der Hunger ist unerträglich';
  const S4 = story4State();
  if (S4) return S4.need === 'sleep' ? 'Geh schlafen (Zimmer 23)' : S4.need === 'wait' ? 'Warte im Zimmer 23 auf die Nacht' : S4.st.goal;
  return '';
}
function hubTick(G, dt) {
  const D = SAVE.day;
  if (G.inSun) D.sun += dt;
  G.hint = null;
  G.hubInfo = { goal: hubGoal(), sun: G.inSun };
}
function leaveHub(fn) { if (G && G.opt.hub && G.player) SAVE.hubPos = { x: G.player.x, y: G.player.y + 24 }; G = null; writeSave(); fn(); }
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
  SAVE.credits += 10; lines.push('+10 Credits');
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
const SCENE_VORDEN_GIFT = [
  { bg: 'zimmer', portrait: 'vorden' },
  { narr: 'Vorden kommt spät zurück, mit aufgeschürften Fingerknöcheln. Wo er war, sagt er nicht.' },
  { who: 'Vorden', text: 'Hier, nimm. Ich brauche die Credits gerade nicht.' },
  { bg: 'system', portrait: null },
  { sys: { head: 'SYSTEM', kv: [['Credits', '+20']] } }
];
function showShop(done) {
  const el = document.createElement('div');
  el.className = 'screen dim'; el.style.pointerEvents = 'auto'; el.style.zIndex = 20;
  const draw = () => {
    const F = SAVE.flags, price = 25;
    el.innerHTML = `${sysBox({ head: 'LADEN', lines: ['Credits: ' + SAVE.credits], kv: [['Schwarze Maske (mit roten Spritzern)', F.mask ? 'gekauft' : price + ' Cr.']] })}
      ${F.mask ? '' : `<button class="btn" id="buyMask" ${SAVE.credits >= price ? '' : 'disabled'}>Maske kaufen</button>`}
      ${!F.mask && SAVE.credits < price ? '<div class="subtitle">Zu wenig Credits. Jeder Tag bringt 10 Credits.</div>' : ''}
      <button class="btn ghost" id="shopBack">Zurück</button>`;
    const b = el.querySelector('#buyMask');
    if (b) b.onclick = () => { if (SAVE.credits < price) return; SAVE.credits -= price; F.mask = true; writeSave(); sfx('level'); draw(); };
    el.querySelector('#shopBack').onclick = () => { el.remove(); done && done(); };
  };
  draw(); UI.root.appendChild(el);
}
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
