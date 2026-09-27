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
      { narr: 'Am nächsten Morgen bringt ihn ein Transport zur Militärschule. Draußen in der Sonne fühlt er sich seltsam kraftlos.' },
      { sys: { head: 'SYSTEM', lines: ['Warnung: Direktes Sonnenlicht halbiert alle Werte.'], quests: ['Tagesquest: Meide 8 Stunden die Sonne'] } }
    ],
    next: 'kyle'
  },
  kyle: {
    id: 'kyle', title: 'Der erste Kampf', src: 'Kapitel 10–11', type: 'gefecht',
    scene: [
      { bg: 'kantine', portrait: 'peter' },
      { narr: 'Die Kantine der Militärschule. Ein Schüler mit Fähigkeit bedrängt einen schmächtigen Jungen namens Peter. Niemand greift ein.' },
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
      { sys: { head: 'QUEST ERFÜLLT', lines: ['Erster Kampf gewonnen.'], kv: [['EP', '+50'], ['Bis Stufe 2', '50 / 100']] } },
      { sys: { head: 'NEUE FÄHIGKEIT', lines: ['Inspect (Stufe 1)', 'Zeigt Name, Rasse, Fähigkeitstyp, HP und Blutgruppe eines Ziels.'] } },
      { bg: 'nacht' },
      { narr: 'Ende der ersten Etappe. Als Nächstes: die Akademie, der Fähigkeitstest und das erste Duell.' }
    ],
    reward: { exp: 50, skills: ['inspect'] }
  }
};
const MISSION_ORDER = ['prolog', 'kyle'];

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
