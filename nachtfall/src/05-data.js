'use strict';
/* ==========================================================================
   DATEN — Helden, Karten (Faehigkeiten & Passive), Fusionen, Gegner,
   Wellen und dauerhafte Freischaltungen.
   ========================================================================== */

const SCHOOL = {
  blood: { name: 'Blut', col: '#ff3a4e', dim: '#6a0a18', glow: '#ff5a6a', icon: '🩸' },
  shadow: { name: 'Schatten', col: '#a77bff', dim: '#2c1a5a', glow: '#c7a6ff', icon: '◐' },
  qi: { name: 'Qi', col: '#4ff0cc', dim: '#0d4d43', glow: '#9affe6', icon: '☯' },
  none: { name: 'Neutral', col: '#e0c890', dim: '#4a3a20', glow: '#ffe6a8', icon: '✦' }
};

/* ------------------------------------------------------------- HELDEN */
const HEROES = {
  vorian: {
    name: 'Graf Vorian', title: 'Der Blutgraf', school: 'blood', diff: 1,
    role: 'Blutexplosionen · zäh · langsam',
    hp: 175, speed: 152, armor: 3, dodgeCd: 3.2, dodge: 'mist',
    start: 'blutnova', slots: 4,
    mech: { name: 'Blutsaat', desc: 'Blut-Treffer setzen Blutmale (bis 5). Besiegte Gegner mit 3+ Malen platzen, reißen Nachbarn mit und jede Explosion heilt dich ein wenig — je mehr Male, desto größer der Knall.' },
    ult: { id: 'karminsturm', name: 'Karminsturm', cd: 13, desc: 'Lässt jedes Blutmal auf dem Feld gleichzeitig explodieren und entfesselt eine riesige Blutnova um dich.' },
    strengths: ['Räumt große Horden', 'Viel Leben und Rüstung', 'Kettenreaktionen'],
    weaknesses: ['Langsam', 'Kurze Reichweite', 'Langes Ausweich-Abklingen'],
    builds: [
      { name: 'Kettenreaktion', desc: 'Blutnova + Kettenreaktion + Grabesmacht: Jede Leiche wird zur Bombe.' },
      { name: 'Karmesinfinsternis', desc: 'Blutnova + Schattenflammen → Fusion: Sog, Detonation, Schattenfeuer.' },
      { name: 'Unsterblicher Graf', desc: 'Bluternte + Lebensraub + Vampirblut → Blutmondsicheln.' }
    ],
    pool: ['blutnova', 'blutwisch', 'bluternte', 'schattenflammen', 'lebensraub', 'kettenreaktion', 'vampirblut', 'nebelgang', 'grabesmacht', 'seelenmagnet'],
    unlock: { desc: 'Von Anfang an verfügbar.', cost: 0, check: () => true }
  },
  liora: {
    name: 'Liora', title: 'Die Aderlasserin', school: 'blood', diff: 2,
    role: 'Blutmagie · riskant · Lebensraub',
    hp: 95, speed: 168, armor: 0, dodgeCd: 2.4, dodge: 'roll',
    start: 'blutwisch', slots: 4,
    mech: { name: 'Blutrausch', desc: 'Je weniger Leben sie hat, desto stärker und schneller schlägt sie zu (bis +90 % Schaden, +40 % Tempo bei wenig Leben). Lebensraub ist ab Start aktiv (3 %).' },
    ult: { id: 'aderlass', name: 'Aderlass', cd: 15, desc: 'Opfert 20 % des aktuellen Lebens: 6 s lang +60 % Schaden, dreifacher Lebensraub und doppelte Blutwische.' },
    strengths: ['Sehr hoher Einzelschaden', 'Heilt sich im Kampf', 'Beweglich'],
    weaknesses: ['Wenig Leben', 'Keine natürliche Regeneration', 'Nahkampf'],
    builds: [
      { name: 'Drachenherz', desc: 'Blutwisch + Qi-Handfläche → Fusion: eine Drachenwelle aus Blut und Qi.' },
      { name: 'Glaskanone', desc: 'Niedriges Leben halten, Aderlass spammen, Grabesmacht stapeln.' },
      { name: 'Erntezirkel', desc: 'Bluternte + Lebensraub → Blutmondsicheln als ewiger Schutzkreis.' }
    ],
    pool: ['blutwisch', 'bluternte', 'blutnova', 'qihand', 'lebensraub', 'kettenreaktion', 'vampirblut', 'nebelgang', 'grabesmacht', 'seelenmagnet'],
    unlock: { desc: 'Erreiche Stufe 12 in einem Lauf — oder opfere 400 Seelen.', cost: 400, check: (s) => s.stats.maxLevel >= 12 }
  },
  nyx: {
    name: 'Nyx', title: 'Der Schattenläufer', school: 'shadow', diff: 2,
    role: 'Schatten · schnell · taktisch',
    hp: 85, speed: 188, armor: 0, dodgeCd: 1.7, dodge: 'shadowstep',
    start: 'schattenflammen', slots: 4,
    mech: { name: 'Schattenfluss', desc: 'Bewegung lädt den Fluss (bis +45 % Schaden, +15 % Krit). Stillstand lässt ihn verfliegen. Ausweichen ist ein Schattenschritt: Teleport-Sprint, der Gegner auf dem Weg zerschneidet und ein Nachbild zurücklässt, das Gegner ablenkt.' },
    ult: { id: 'mitternacht', name: 'Mitternacht', cd: 16, desc: '4 s reine Schattengestalt: unverwundbar, +45 % Tempo, jede Berührung schneidet und verlangsamt, Schattenflammen feuern doppelt.' },
    strengths: ['Schnellster Held', 'Kurzes Ausweichen', 'Nachbilder lenken ab'],
    weaknesses: ['Wenig Leben', 'Schwach im Stillstand', 'Wenig Flächenschaden am Anfang'],
    builds: [
      { name: 'Leerer Spiegel', desc: 'Nachbilder + Qi-Kette → Fusion: Spiegel-Mönche, die Qi-Blitze schleudern.' },
      { name: 'Schlund-Tänzer', desc: 'Nachtschlund + Nebelgang: Gegner in Risse locken und umkreisen.' },
      { name: 'Finsternis', desc: 'Schattenflammen + Blutnova → Karmesinfinsternis.' }
    ],
    pool: ['schattenflammen', 'nachbilder', 'nachtschlund', 'qikette', 'blutnova', 'lebensraub', 'vampirblut', 'nebelgang', 'grabesmacht', 'seelenmagnet'],
    unlock: { desc: 'Überlebe 6 Minuten — oder opfere 700 Seelen.', cost: 700, check: (s) => s.stats.bestTime >= 360 }
  },
  shen: {
    name: 'Meister Shen', title: 'Hüter der drei Kräfte', school: 'qi', diff: 3,
    role: 'Qi · Blut · Schatten · Kombinationen',
    hp: 115, speed: 158, armor: 1, dodgeCd: 2.6, dodge: 'slide',
    start: 'qihand', slots: 4,
    mech: { name: 'Qi-Kreislauf', desc: 'Steh still, um Wurzel zu fassen: Qi-Perlen sammeln sich schnell (bis 5) und du nimmst 30 % weniger Schaden. In Bewegung sammelt sich Qi nur langsam. Jede Perle: +5 % Schaden. Blut- und Schattenkräfte wirken bei ihm nur zu 85 %.' },
    ult: { id: 'harmonie', name: 'Harmonie', cd: 2, desc: 'Verbraucht alle Qi-Perlen: Druckwelle, Heilung, ab 3 Perlen Schatten-Klone, bei 5 Perlen Vollkommene Harmonie (Zeitlupe + alle Fähigkeiten sofort bereit).' },
    strengths: ['Zugriff auf alle drei Schulen', 'Höchstes Kombinations-Potenzial', 'Dreifaltiges Siegel'],
    weaknesses: ['Langsamer Start', 'Muss stillstehen, um Qi zu sammeln', 'Nur 4 Fähigkeiten-Plätze für 8 Möglichkeiten'],
    builds: [
      { name: 'Dreiklang', desc: 'Je eine Blut-, Schatten- und Qi-Fähigkeit auf Stufe 3 → Dreifaltiges Siegel.' },
      { name: 'Eiserner Berg', desc: 'Qi-Handfläche + Eiserne Meridiane: stehen, sammeln, alles zurückschleudern.' },
      { name: 'Wanderer', desc: 'Qi-Kette + Nachbilder + Nebelgang: in Bewegung bleiben, Klone kämpfen lassen.' }
    ],
    pool: ['qihand', 'qikette', 'blutnova', 'blutwisch', 'bluternte', 'schattenflammen', 'nachbilder', 'nachtschlund', 'eisenmeridiane', 'lebensraub', 'kettenreaktion', 'vampirblut', 'nebelgang', 'grabesmacht', 'seelenmagnet'],
    unlock: { desc: 'Besiege Vaelgor, den Gruftkoloss — oder opfere 1500 Seelen.', cost: 1500, check: (s) => s.stats.bossKills >= 1 }
  }
};
const HERO_ORDER = ['vorian', 'liora', 'nyx', 'shen'];

/* ------------------------------------------------------------- KARTEN
   kind: 'ability' (aktive Auto-Faehigkeit, belegt Faehigkeiten-Platz)
         'passive' (belegt Passiv-Platz)
   lv[i]: Beschreibung der Stufe i+1 (was DIESE Karte bewirkt). */
const CARDS = {
  blutnova: {
    name: 'Blutnova', school: 'blood', kind: 'ability', max: 5, tags: ['Fläche'],
    lv: [
      'Alle 2,2 s explodiert Blut um dich: 16 Schaden im Umkreis.',
      '+30 % Schaden, +15 % Radius.',
      'Doppelschlag: eine zweite, kleinere Nova folgt nach 0,3 s.',
      '+30 % Schaden, +20 % Radius, Abklingzeit 1,8 s.',
      'Blutlache: jede Nova hinterlässt eine Lache, die Gegner verlangsamt und verätzt.'
    ]
  },
  blutwisch: {
    name: 'Blutwisch', school: 'blood', kind: 'ability', max: 5, tags: ['Nahkampf'],
    lv: [
      'Eine Blutsichel fegt vor dir im Bogen: 20 Schaden.',
      '+35 % Schaden.',
      'Rückhand: ein zweiter Wisch trifft auch hinter dir.',
      '+25 % Reichweite, Treffer lassen 3 s bluten.',
      'Blutklinge: der dritte Hieb schleudert eine durchbohrende Blutsichel weit nach vorn.'
    ]
  },
  bluternte: {
    name: 'Bluternte', school: 'blood', kind: 'ability', max: 5, tags: ['Schutz', 'Dauer'],
    lv: [
      'Zwei Blutsicheln kreisen um dich: 9 Schaden je Treffer.',
      '+1 Sichel.',
      '+40 % Schaden, größerer Kreis.',
      '+1 Sichel, schnellere Rotation.',
      'Ernte: Kills durch Sicheln heilen 1 Leben.'
    ]
  },
  schattenflammen: {
    name: 'Schattenflammen', school: 'shadow', kind: 'ability', max: 5, tags: ['Fernkampf', 'Zielsuchend'],
    lv: [
      'Alle 1,3 s jagen 2 Schattenflammen die nächsten Gegner: 13 Schaden.',
      '+1 Flamme.',
      '+30 % Schaden, durchbohren 1 weiteren Gegner.',
      '+1 Flamme, Abklingzeit 1,05 s.',
      'Flächenbrand: Treffer entzünden einen Nachbarn mit Schattenfeuer.'
    ]
  },
  nachbilder: {
    name: 'Nachbilder', school: 'shadow', kind: 'ability', max: 5, tags: ['Ablenkung', 'Fläche'],
    lv: [
      'Alle 3,5 s bleibt ein Nachbild zurück: lenkt Gegner ab und schneidet um sich (10 Schaden).',
      '+40 % Schaden.',
      'Bis zu 2 Nachbilder gleichzeitig, halten länger.',
      'Größerer Schnittradius, schnellere Schnitte.',
      'Zerfall: Nachbilder explodieren am Ende in Schattensplitter.'
    ]
  },
  nachtschlund: {
    name: 'Nachtschlund', school: 'shadow', kind: 'ability', max: 5, tags: ['Kontrolle', 'Fläche'],
    lv: [
      'Öffnet alle 3 s einen Riss unter einem Gegner: zieht an, verlangsamt, 5 Schaden pro Puls.',
      '+1 Riss.',
      'Größere Risse, stärkerer Sog.',
      '+1 Riss, +40 % Schaden.',
      'Kollaps: Risse brechen am Ende mit 30 Schaden zusammen.'
    ]
  },
  qihand: {
    name: 'Qi-Handfläche', school: 'qi', kind: 'ability', max: 5, tags: ['Rückstoß', 'Kegel'],
    lv: [
      'Eine geisterhafte Handfläche stößt nach vorn: 24 Schaden und starker Rückstoß.',
      '+30 % Schaden.',
      '+25 % Reichweite, Abklingzeit 2,0 s.',
      'Zwillingshand: zwei Handflächen im V.',
      'Erschütterung: getroffene Gegner sind 0,8 s betäubt.'
    ]
  },
  qikette: {
    name: 'Qi-Kette', school: 'qi', kind: 'ability', max: 5, tags: ['Kette', 'Fernkampf'],
    lv: [
      'Eine Jadekugel springt zwischen 3 Gegnern: 14 Schaden je Sprung.',
      '+1 Sprung.',
      '+35 % Schaden.',
      '+2 Sprünge, Abklingzeit 1,4 s.',
      'Resonanz: jeder Sprung stößt einen kleinen Qi-Ring aus.'
    ]
  },
  lebensraub: {
    name: 'Lebensraub', school: 'blood', kind: 'passive', max: 5, tags: ['Überleben'],
    lv: ['Heilt 2 % des verursachten Schadens.', 'Heilt 4 % des Schadens.', 'Heilt 6 % des Schadens.', 'Heilt 8 % des Schadens.', 'Heilt 10 % des Schadens, höheres Heil-Limit.']
  },
  kettenreaktion: {
    name: 'Kettenreaktion', school: 'blood', kind: 'passive', max: 5, tags: ['Fläche', 'Kombo'], needsSchool: 'blood',
    lv: [
      'Von Blut getroffene Gegner platzen mit 35 % Chance beim Tod (Flächenschaden).',
      '50 % Chance, größere Explosion.',
      '65 % Chance, mehr Schaden.',
      '80 % Chance, größere Explosion.',
      '95 % Chance — Explosionen können weitere Explosionen auslösen.'
    ]
  },
  vampirblut: {
    name: 'Vampirblut', school: 'blood', kind: 'passive', max: 5, tags: ['Überleben'],
    lv: ['+20 max. Leben, +0,4 Leben/s.', '+20 max. Leben, +0,4 Leben/s.', '+20 max. Leben, +0,4 Leben/s.', '+20 max. Leben, +0,4 Leben/s.', '+30 max. Leben, +0,6 Leben/s.']
  },
  nebelgang: {
    name: 'Nebelgang', school: 'shadow', kind: 'passive', max: 5, tags: ['Bewegung'],
    lv: ['+8 % Tempo, −12 % Ausweich-Abklingzeit.', '+8 % Tempo, −12 % Ausweich-Abklingzeit.', 'Ausweichen hinterlässt eine schneidende Nebelspur.', '+8 % Tempo, −12 % Ausweich-Abklingzeit.', '+10 % Tempo, Nebelspur verlangsamt.']
  },
  grabesmacht: {
    name: 'Grabesmacht', school: 'none', kind: 'passive', max: 5, tags: ['Schaden'],
    lv: ['+10 % Schaden, +6 % Fläche.', '+10 % Schaden, +6 % Fläche.', '+10 % Schaden, +6 % Fläche.', '+10 % Schaden, +6 % Fläche.', '+15 % Schaden, +10 % Fläche.']
  },
  seelenmagnet: {
    name: 'Seelenmagnet', school: 'none', kind: 'passive', max: 4, tags: ['Sammeln'],
    lv: ['+35 % Sammelradius, +8 % Erfahrung.', '+35 % Sammelradius, +8 % Erfahrung.', '+35 % Sammelradius, +8 % Erfahrung.', '+50 % Sammelradius, +12 % Erfahrung.']
  },
  eisenmeridiane: {
    name: 'Eiserne Meridiane', school: 'qi', kind: 'passive', max: 5, tags: ['Überleben', 'Qi'], needsSchool: 'qi',
    lv: ['−7 % erlittener Schaden, +20 % Qi-Sammeln, +10 % Rückstoß.', '−7 % Schaden, +20 % Qi, +10 % Rückstoß.', '−7 % Schaden, +20 % Qi, +10 % Rückstoß.', '−7 % Schaden, +20 % Qi, +10 % Rückstoß.', '−10 % Schaden, +30 % Qi, Wurzelstand heilt.']
  }
};

/* ------------------------------------------------------------- FUSIONEN
   Werden als goldene Karte angeboten, sobald die Voraussetzungen erfuellt sind.
   consumes: diese Faehigkeiten gehen in der Fusion auf (Platz wird frei). */
const FUSIONS = {
  finsternis: {
    name: 'Karmesinfinsternis', schools: ['blood', 'shadow'],
    req: { blutnova: 4, schattenflammen: 3 }, consumes: ['blutnova', 'schattenflammen'],
    desc: 'Eine schwarz-rote Sonne: saugt Gegner ein, detoniert gewaltig und speit Schattenfeuer aus jedem Opfer.',
    heroes: ['vorian', 'nyx', 'shen']
  },
  drachenherz: {
    name: 'Drachenherz', schools: ['blood', 'qi'],
    req: { blutwisch: 4, qihand: 3 }, consumes: ['blutwisch', 'qihand'],
    desc: 'Aus Blut und Qi wird ein Drache: eine Welle, die sich durch Horden schlängelt, zurückschleudert und dich heilt.',
    heroes: ['liora', 'shen']
  },
  spiegel: {
    name: 'Leerer Spiegel', schools: ['shadow', 'qi'],
    req: { nachbilder: 3, qikette: 3 }, consumes: ['nachbilder', 'qikette'],
    desc: 'Deine Nachbilder werden meditierende Spiegel-Mönche, die Qi-Blitze zwischen allen Gegnern springen lassen.',
    heroes: ['nyx', 'shen']
  },
  blutmond: {
    name: 'Blutmondsicheln', schools: ['blood'],
    req: { bluternte: 4, lebensraub: 2 }, consumes: ['bluternte'],
    desc: 'Die Sicheln werden zu drei gewaltigen Blutmonden, die pulsierend kreisen, bluten lassen und heilen.',
    heroes: ['vorian', 'liora', 'shen']
  },
  siegel: {
    name: 'Dreifaltiges Siegel', schools: ['blood', 'shadow', 'qi'],
    req: { anyBlood: 3, anyShadow: 3, anyQi: 3 }, consumes: [],
    desc: 'Ein rotierendes Siegel aller drei Kräfte: feuert Nova, Schattenflammen und Qi-Ring im Takt — jeder Treffer setzt alle drei Male.',
    heroes: ['shen']
  }
};

/* Element-Reaktionen: zwei verschiedene Male auf einem Gegner + neuer Treffer */
const REACTIONS = {
  bs: { name: 'Verderbnis', col: '#c0306a', desc: 'Blut + Schatten: Gegner verrottet (Schaden über Zeit) und speit beim Tod Schattenfeuer.' },
  bq: { name: 'Aderbruch', col: '#ff9a6a', desc: 'Blut + Qi: sofortiger Zusatzschaden und ein Schluck Leben für dich.' },
  sq: { name: 'Leere', col: '#6ab0ff', desc: 'Schatten + Qi: Gegner wird betäubt und zieht Nachbarn in sich hinein.' },
  bsq: { name: 'Dreiklang', col: '#ffffff', desc: 'Alle drei Male: große Explosion aus drei Farben.' }
};

/* ------------------------------------------------------------- GEGNER */
const ENEMIES = {
  ghoul: { name: 'Ghul', hp: 13, spd: 50, dmg: 7, r: 11, xp: 1, mass: 1, art: 'ghoul', scale: 1 },
  bat: { name: 'Blutfledermaus', hp: 6, spd: 92, dmg: 5, r: 9, xp: 1, mass: 0.5, art: 'bat', scale: 1, flier: true },
  knight: { name: 'Grabritter', hp: 58, spd: 36, dmg: 13, r: 14, xp: 4, mass: 3, art: 'knight', scale: 1, armor: 2 },
  witch: { name: 'Laternenwitwe', hp: 22, spd: 44, dmg: 9, r: 12, xp: 3, mass: 1, art: 'witch', scale: 1, ranged: true, flier: true },
  brute: { name: 'Aasbrocken', hp: 110, spd: 30, dmg: 16, r: 18, xp: 7, mass: 5, art: 'brute', scale: 1, splits: 3 },
  captain: { name: 'Hauptmann Kharn', hp: 1600, spd: 42, dmg: 20, r: 22, xp: 60, mass: 30, art: 'captain', scale: 1.9, armor: 4, miniboss: true },
  boss: { name: 'Vaelgor, der Gruftkoloss', hp: 10000, spd: 52, dmg: 28, r: 44, xp: 0, mass: 200, art: 'boss', scale: 1, boss: true, armor: 3 }
};

/* Lauf-Ablauf (Sekunden). Gewichte = Anteil der Gegnertypen beim Nachschub. */
const RUN_LEN = 600;            // 10 Minuten bis zum Boss-Auftritt (danach Bosskampf)
const BOSS_AT = 540;
const WAVES = [
  { t: 0, target: 16, rate: 1.8, mix: { ghoul: 1 } },
  { t: 35, target: 34, rate: 3.2, mix: { ghoul: 3, bat: 2 } },
  { t: 75, target: 52, rate: 4.5, mix: { ghoul: 3, bat: 3 } },
  { t: 120, target: 75, rate: 6, mix: { ghoul: 4, bat: 2, witch: 1 } },
  { t: 180, target: 100, rate: 8, mix: { ghoul: 4, bat: 2, witch: 1, knight: 1 } },
  { t: 240, target: 130, rate: 10, mix: { ghoul: 4, bat: 3, witch: 1.2, knight: 1.5 } },
  { t: 300, target: 90, rate: 7, mix: { ghoul: 3, bat: 2, knight: 1 } }, // Hauptmann-Auftritt
  { t: 340, target: 165, rate: 12, mix: { ghoul: 4, bat: 3, witch: 1.5, knight: 2, brute: 0.6 } },
  { t: 400, target: 200, rate: 14, mix: { ghoul: 4, bat: 3, witch: 2, knight: 2.5, brute: 1 } },
  { t: 460, target: 240, rate: 16, mix: { ghoul: 5, bat: 3, witch: 2, knight: 3, brute: 1.4 } },
  { t: 540, target: 70, rate: 5, mix: { ghoul: 3, bat: 3, knight: 1 } }            // Boss
];
const EVENTS = [
  { t: 50, kind: 'swarm', type: 'bat', n: 22, text: 'Ein Fledermausschwarm!' },
  { t: 150, kind: 'ring', type: 'ghoul', n: 34, text: 'Die Toten umzingeln dich …' },
  { t: 210, kind: 'elite', type: 'knight' },
  { t: 270, kind: 'swarm', type: 'bat', n: 40, text: 'Die Nacht wird schwarz vor Flügeln!' },
  { t: 300, kind: 'miniboss', type: 'captain', text: 'Hauptmann Kharn erhebt sich!' },
  { t: 380, kind: 'ring', type: 'knight', n: 18, text: 'Ein Ring aus Grabrittern!' },
  { t: 420, kind: 'elite', type: 'brute' },
  { t: 450, kind: 'swarm', type: 'bat', n: 50, text: 'Blutschwarm!' },
  { t: 500, kind: 'ring', type: 'ghoul', n: 60, text: 'Die Gruft öffnet sich …' },
  { t: 510, kind: 'elite', type: 'witch' },
  { t: BOSS_AT, kind: 'boss', type: 'boss', text: 'Die Glocke läutet. Vaelgor erwacht.' }
];
function hpScale(t) { const m = t / 60; return 1 + m * 0.3 + m * m * 0.034; }

/* ------------------------------------------------------------- ERFAHRUNG */
function xpNeed(lvl) { return Math.floor(6 + lvl * 3.2 + lvl * lvl * 0.5); }

/* ------------------------------------------------------------- DAUERHAFTE GABEN (Altar der Nacht) */
const META = {
  vitae: { name: 'Uraltes Blut', desc: '+8 % max. Leben', max: 5, cost: [60, 130, 220, 340, 500] },
  macht: { name: 'Finstere Macht', desc: '+5 % Schaden', max: 5, cost: [80, 160, 260, 400, 600] },
  eile: { name: 'Nachtschwingen', desc: '+4 % Tempo', max: 3, cost: [70, 160, 300] },
  magnet: { name: 'Seelenzug', desc: '+15 % Sammelradius', max: 3, cost: [50, 110, 200] },
  gier: { name: 'Seelengier', desc: '+12 % Seelen pro Lauf', max: 5, cost: [60, 120, 200, 320, 480] },
  wurf: { name: 'Schicksalsfaden', desc: '+1 Neu-Würfeln der Karten pro Lauf', max: 3, cost: [120, 260, 450] },
  wiedergeburt: { name: 'Zweite Nacht', desc: 'Einmal pro Lauf mit 50 % Leben auferstehen', max: 1, cost: [900] }
};
