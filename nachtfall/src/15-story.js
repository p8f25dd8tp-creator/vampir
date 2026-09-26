'use strict';
/* ==========================================================================
   STORY-MODUS „Das Vampirsystem“ — Finn Müllers Weg in 12 Kapiteln.
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

// Kapitel 1–10 folgen den zehn Akten des Storybooks „Vampirsystem Basis Zwei“
// (Vorlage Kapitel 1–1572), Kapitel 11–12 spielen nach dem Zeitsprung.
const CHAPTERS = [
  {
    n: 1, id: 'basis', title: 'Militärbasis 2', src: 'Kapitel 1–75', place: 'Militärbasis 2 — Übungsgelände bei Nacht', theme: 'akademie', tier: 1,
    intro: [
      'Kampfwert 1. Keine verwertbare Fähigkeit. Finn Müller ist sechzehn, seine Eltern sind tot — geblieben ist nur ein Buch, das sich nicht öffnen lässt.',
      'Nachts brechen Bestien aus Stahlmanns Container. Irgendwo auf dem Gelände liegt das Buch …'
    ],
    diff: { hp: 0.5, count: 0.8, dmg: 0.75 },
    roles: {
      ghoul: defEnemy('c1_kanal', 'ghoul', 'q_kanal', 'Kanalisationsbestie'),
      bat: defEnemy('c1_flatter', 'bat', 'bat_braun', 'Flatterbestie'),
      knight: defEnemy('c1_panzer', 'knight', 'q_panzer', 'Panzerbestie (Mittelstufe)', { armor: 1 }),
      witch: defEnemy('c1_spucker', 'witch', 'q_kroete', 'Säurekröte', { shot: 'acid', flier: false }),
      brute: defEnemy('c1_mutter', 'brute', 'q_mutter', 'Brutmutter'),
      captain: defEnemy('c1_laeufer', 'captain', 'h_laeufer', 'Stahlmanns Läufer', { scale: 1.2, hp: 900 }),
      boss: defBoss('c1_boss', 'container', 'Das Ding aus dem Container', 2400, { bellShot: 'acid' })
    },
    texts: { swarm: 'Ein Schwarm Flatterbestien!', ring: 'Die Bestien kreisen dich ein …', boss: 'Der überzählige Container bricht auf.' },
    quests: [
      { type: 'kill', role: 'ghoul', n: 120, text: 'Besiege 120 Kanalisationsbestien', reward: { crystals: 15, bonus: 'level' } },
      { type: 'survive', n: 240, text: 'Überlebe 4 Minuten', reward: { crystals: 15, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege Stahlmanns Läufer', reward: { crystals: 25, bonus: 'level' } }
    ],
    reward: { tier: 2, text: 'Evolution: Vampir — „Es ist Zeit zu fressen“' }
  },
  {
    n: 2, id: 'portal', title: 'Das rote Portal', src: 'Kapitel 76–110', place: 'Rote Zone — keine Sonne, kein Schatten', theme: 'rotezone', tier: 2,
    intro: [
      'Stahlmanns Läufer stoßen Fabian Skala ins rote Portal. Finn springt hinterher.',
      'Kein Sonnenlicht: zum ersten Mal arbeitet sein Körper mit voller Kraft. Im Zentrum der Zone wartet der Blutsauger.'
    ],
    diff: { hp: 0.85, count: 0.9, dmg: 0.95 },
    roles: {
      ghoul: defEnemy('c2_rot', 'ghoul', 'q_rot', 'Rotzonen-Bestie'),
      bat: defEnemy('c2_gleiter', 'bat', 'bat_blut', 'Blutflatterer'),
      knight: defEnemy('c2_panzer', 'knight', 'q_rotP', 'Panzerbestie (Fortgeschritten)', { armor: 2 }),
      witch: defEnemy('c2_spore', 'witch', 'q_spore', 'Sporenbestie', { shot: 'acid', flier: false }),
      brute: defEnemy('c2_mutter', 'brute', 'q_alienM', 'Bestienmutter'),
      captain: defEnemy('c2_orange', 'captain', 'q_orange', 'Mittelstufen-Bestie', { scale: 1.3, hp: 1400 }),
      boss: defBoss('c2_boss', 'blutsauger', 'Blutsauger (Rote Zone)', 6000, { bellShot: 'blood' })
    },
    texts: { swarm: 'Blutflatterer aus dem roten Himmel!', ring: 'Die rote Zone schließt sich um dich …', boss: 'Dünn wie ein Skelett, zu lang für seine Haut: der Blutsauger.' },
    quests: [
      { type: 'kill', role: 'knight', n: 25, text: 'Besiege 25 Panzerbestien', reward: { crystals: 30, bonus: 'level' } },
      { type: 'crystals', n: 20, text: 'Sammle 20 Bestienkristalle', reward: { crystals: 20, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege die Mittelstufen-Bestie', reward: { crystals: 40, bonus: 'level' } }
    ],
    reward: { skills: ['schatten', 'qi'], text: 'Schatten freigeschaltet — „Diese Fähigkeit ist älter als du“ · Leo lehrt dich Qi' }
  },
  {
    n: 3, id: 'caladi', title: 'Caladi und die Dalki', src: 'Kapitel 111–140', place: 'Planet Caladi — der Vorposten', theme: 'caladi', tier: 2,
    intro: [
      'Bewertungsreise nach Caladi: zwei Sonnen, lange Tage, vierhundert Namen auf der Rangliste — Finn auf Platz 397.',
      'Der Gleiter stürzt ab. Im zerstörten Vorposten steht etwas, das es nicht mehr geben dürfte: ein Dalki.'
    ],
    diff: { hp: 0.92, count: 0.92, dmg: 0.98 },
    roles: {
      ghoul: defEnemy('c3_laeufer', 'ghoul', 'q_caladi', 'Caladi-Läufer'),
      bat: defEnemy('c3_aas', 'bat', 'bat_aas', 'Aasflieger'),
      knight: defEnemy('c3_panzer', 'knight', 'q_panzer', 'Grubenbestie', { armor: 2 }),
      witch: defEnemy('c3_spucker', 'witch', 'q_kroete', 'Säurekröte', { shot: 'acid', flier: false }),
      brute: defEnemy('c3_koenig', 'brute', 'q_fort', 'Grubenkönig'),
      captain: defEnemy('c3_torres', 'captain', 'h_torres', 'Torres — Rang A, Feuer', { scale: 1.2, hp: 1800 }),
      boss: defBoss('c3_boss', 'dalki1', 'Dalki (Ein Stachel)', 7000, { bellShot: 'spike' })
    },
    texts: { swarm: 'Aasflieger über der Ebene!', ring: 'Die Bestien von Caladi umzingeln euch!', boss: '„Dalki.“ Fabian sagt es so leise, dass es fast untergeht.' },
    quests: [
      { type: 'kill', role: 'ghoul', n: 180, text: 'Besiege 180 Caladi-Läufer', reward: { crystals: 35, bonus: 'level' } },
      { type: 'level', n: 18, text: 'Erreiche Stufe 18', reward: { crystals: 25, bonus: 'heal' } },
      { type: 'mini', text: 'Gewinne das Duell gegen Torres', reward: { crystals: 45, bonus: 'level' } }
    ],
    reward: { skills: ['qi2', 'ghoul'], text: 'Grünes Blut: Peter wird Ghoul · Qi-Kette und Eisenmeridiane' }
  },
  {
    n: 4, id: 'nachtdaemon', title: 'Der Nachtdämon', src: 'Kapitel 141–382', place: 'Militärbasis 2 — nach der Sperrstunde', theme: 'basisnacht', tier: 2,
    intro: [
      'Fex Sanguini hat Finn gerochen — und ihn nicht verraten. Leander baut ihm eine Maske: kein Gesicht, kein Geruch, keine Stimme.',
      'Unter der Maske geht Finn gegen General Viktor Stahlmann vor, Rang S, Kommandant von Basis 2.'
    ],
    diff: { hp: 1.0, count: 0.95, dmg: 1.02 },
    roles: {
      ghoul: defEnemy('c4_kanal', 'ghoul', 'q_kanal', 'Container-Bestie', { hp: 16 }),
      bat: defEnemy('c4_flatter', 'bat', 'bat_braun', 'Flatterbestie'),
      knight: defEnemy('c4_wache', 'knight', 'h_wache', 'Stahlmanns Leibwache', { armor: 2 }),
      witch: defEnemy('c4_agent', 'witch', 'h_truedream', 'Truedream-Agent', { shot: 'soul', flier: false }),
      brute: defEnemy('c4_mutter', 'brute', 'q_orange', 'Bestie aus dem orangen Portal', { splits: 0, hp: 130 }),
      captain: defEnemy('c4_jack', 'captain', 'h_jack', 'Jack Truedream', { scale: 1.2, hp: 2200 }),
      boss: defBoss('c4_boss', 'stahlmann', 'General Viktor Stahlmann (Rang S)', 7800, { bellShot: 'spike' })
    },
    texts: { swarm: 'Flatterbestien über dem Kasernenhof!', ring: 'Stahlmanns Leute schließen den Kreis.', boss: '„Endlich“, sagt General Stahlmann und zieht das Jackett aus.' },
    quests: [
      { type: 'kill', role: 'knight', n: 35, text: 'Besiege 35 Leibwächter', reward: { crystals: 40, bonus: 'level' } },
      { type: 'survive', n: 360, text: 'Überlebe 6 Minuten', reward: { crystals: 30, bonus: 'heal' } },
      { type: 'mini', text: 'Widersetze dich Jack Truedream', reward: { crystals: 50, bonus: 'level' } }
    ],
    reward: { skills: ['blut'], text: 'Der Nachtdämon: Blutnova und Bluternte' }
  },
  {
    n: 5, id: 'lintarnia', title: 'Die Vampirsiedlung', src: 'Kapitel 383–510', place: 'Lintarnia — der Blutdom', theme: 'siedlung', tier: 2,
    intro: [
      'Die Heimatwelt der Vampire: dreizehn Burgen, ein Rat, und ein Todesurteil gegen Fex — an seinem Geburtstag, im Blutdom.',
      '„Beanspruche den zehnten Sitz.“ Doch zuerst steht Silva Sanguini zwischen Finn und seinem Freund.'
    ],
    diff: { hp: 1.1, count: 0.98, dmg: 1.08 },
    roles: {
      ghoul: defEnemy('c5_hase', 'ghoul', 'q_hase', 'Schwarzer Hase', { hp: 18 }),
      bat: defEnemy('c5_fleder', 'bat', 'bat_blut', 'Todesfledermaus'),
      knight: defEnemy('c5_ritter', 'knight', 'v_ritter', 'Vampirritter der Achten', { armor: 3 }),
      witch: defEnemy('c5_magier', 'witch', 'v_magier', 'Blutmagierin', { shot: 'blood', flier: false }),
      brute: defEnemy('c5_wache', 'brute', 'v_thrall', 'Wache des Rates', { splits: 0, hp: 150 }),
      captain: defEnemy('c5_xander', 'captain', 'h_xander', 'Xander', { scale: 1.2, hp: 2600 }),
      boss: defBoss('c5_boss', 'silva', 'Silva Sanguini (Vampirritterin)', 9000, { bellShot: 'blood' })
    },
    texts: { swarm: 'Zehn Todesfledermäuse — ein Wetterphänomen!', ring: 'Die Wachen des Rates schließen den Kreis.', boss: 'Silva Sanguini erfüllt eine Vorschrift. Das macht es schlimmer.' },
    quests: [
      { type: 'kill', role: 'knight', n: 40, text: 'Besiege 40 Vampirritter', reward: { crystals: 50, bonus: 'level' } },
      { type: 'survive', n: 420, text: 'Überlebe 7 Minuten', reward: { crystals: 40, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege Xander vor der Vampirschule', reward: { crystals: 60, bonus: 'level' } }
    ],
    reward: { tier: 3, text: 'Oberhaupt der zehnten Familie — Evolution: Vampiradliger' }
  },
  {
    n: 6, id: 'verfluchte', title: 'Die Verfluchten', src: 'Kapitel 511–611', place: 'Cudenti — der Außenposten der Crows', theme: 'ruinen', tier: 3,
    intro: [
      'Elf Mutterschiffe: der zweite Dalki-Krieg. Die Freunde trennen sich, Finn geht mit Leander und 31 Überlebenden zu den Crows.',
      'Sunshield greift den Außenposten an — dreißig Traveller ohne Kampfrang. Ihr Kommandant ist Rang S.'
    ],
    diff: { hp: 1.25, count: 1.02, dmg: 1.18 },
    roles: {
      ghoul: defEnemy('c6_d1', 'ghoul', 'dalki1', 'Dalki (1 Stachel)', { hp: 18 }),
      bat: defEnemy('c6_aas', 'bat', 'bat_aas', 'Aasflieger'),
      knight: defEnemy('c6_sun', 'knight', 'h_sunshield', 'Sunshield-Sturmsoldat', { armor: 3 }),
      witch: defEnemy('c6_speer', 'witch', 'dalki2', 'Dalki-Speerwerfer (2 Stacheln)', { shot: 'spike', flier: false }),
      brute: defEnemy('c6_koenig', 'brute', 'q_koenig', 'Königsstufen-Bestie', { splits: 0, hp: 170 }),
      captain: defEnemy('c6_d2', 'captain', 'dalki3', 'Dalki (Zwei Stacheln)', { scale: 1.5, hp: 3000 }),
      boss: defBoss('c6_boss', 'sunshield', 'Sunshield-Kommandant (Rang S)', 10000, { bellShot: 'spike' })
    },
    texts: { swarm: 'Aasflieger über dem Außenposten!', ring: 'Sunshield kreist den Posten ein!', boss: 'Für ihn sind Traveller kein Gegner, sondern Gelände.' },
    quests: [
      { type: 'kill', role: 'knight', n: 45, text: 'Besiege 45 Sunshield-Soldaten', reward: { crystals: 55, bonus: 'level' } },
      { type: 'level', n: 24, text: 'Erreiche Stufe 24', reward: { crystals: 45, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege den Dalki mit zwei Stacheln', reward: { crystals: 65, bonus: 'level' } }
    ],
    reward: { skills: ['fraktion'], text: 'Die Verfluchten sind gegründet — ab jetzt bis zu 3 Begleiter' }
  },
  {
    n: 7, id: 'weltmacht', title: 'Weltmacht', src: 'Kapitel 612–811', place: 'Kolonie Vermill — die Front', theme: 'schlachtfeld', tier: 3,
    intro: [
      'Peter kehrt als Wight zurück. Die Verfluchten sitzen am Tisch der Weltmächte — elf Monate nach ihrer Gründung.',
      'Hagon Skala, der stärkste Mensch der Welt, hat Sil in sein Labor gesperrt. Er kopiert alles, was er sieht.'
    ],
    diff: { hp: 1.4, count: 1.05, dmg: 1.26 },
    roles: {
      ghoul: defEnemy('c7_d2', 'ghoul', 'dalki2', 'Dalki (2 Stacheln)', { hp: 20 }),
      bat: defEnemy('c7_aas', 'bat', 'bat_aas', 'Aasflieger'),
      knight: defEnemy('c7_d3', 'knight', 'dalki3', 'Dalki (3 Stacheln)', { armor: 3 }),
      witch: defEnemy('c7_pure', 'witch', 'h_pure', 'Agent der Wahrhaftigen', { shot: 'soul', flier: false }),
      brute: defEnemy('c7_d5', 'brute', 'dalki5', 'Dalki (5 Stacheln)', { splits: 0, hp: 170 }),
      captain: defEnemy('c7_drei', 'captain', 'dalki4', 'Dreistachler von Vermill', { scale: 1.55, hp: 3400 }),
      boss: defBoss('c7_boss', 'hagon', 'Hagon Skala (Stärkster Mensch)', 12500, { bellShot: 'light' })
    },
    texts: { swarm: 'Aasflieger über Vermill!', ring: 'Die Dalki umzingeln die Kolonie!', boss: '„Ich werde mir deine Kräfte ansehen, während du sie benutzt.“' },
    quests: [
      { type: 'kill', role: 'ghoul', n: 250, text: 'Besiege 250 Dalki', reward: { crystals: 60, bonus: 'level' } },
      { type: 'survive', n: 450, text: 'Halte die Linie 7:30 Minuten', reward: { crystals: 50, bonus: 'heal' } },
      { type: 'mini', text: 'Stelle den Dreistachler allein', reward: { crystals: 70, bonus: 'level' } }
    ],
    reward: { tier: 4, text: 'Evolution: Vampirlord — der Sonnenmalus ist herausgewachsen' }
  },
  {
    n: 8, id: 'krone', title: 'Die Krone', src: 'Kapitel 812–1000', place: 'Die zehnte Burg', theme: 'burg', tier: 4,
    intro: [
      'Samuel Eno hat die Dalki erschaffen — und er stirbt nicht richtig. Sechs Familienoberhäupter kommen gleichzeitig in die zehnte Burg.',
      'In der Nacht bricht etwas durch das Haupttor, das älter ist als die dreizehn Familien: ein Original.'
    ],
    diff: { hp: 1.8, count: 1.1, dmg: 1.42 },
    roles: {
      ghoul: defEnemy('c8_rot', 'ghoul', 'h_rotvamp', 'Roter Vampir', { hp: 20 }),
      bat: defEnemy('c8_fleder', 'bat', 'bat_blut', 'Blutfledermaus'),
      knight: defEnemy('c8_ritter', 'knight', 'v_ritter', 'Ritter der Achten', { armor: 4 }),
      witch: defEnemy('c8_magier', 'witch', 'v_magier', 'Blutmagierin', { shot: 'blood', flier: false }),
      brute: defEnemy('c8_thrall', 'brute', 'v_thrall', 'Diener des Untoten Königs', { splits: 0, hp: 180 }),
      captain: defEnemy('c8_klon', 'captain', 'h_klon', 'Samuel Eno — Klon', { scale: 1.2, hp: 3800 }),
      boss: defBoss('c8_boss', 'original', 'Ein Original', 17500, { bellShot: 'blood' })
    },
    texts: { swarm: 'Blutfledermäuse aus den Türmen!', ring: 'Rote Vampire umzingeln die Burg!', boss: 'Signatur unbekannt. Älter als die Gesetze.' },
    quests: [
      { type: 'kill', role: 'knight', n: 50, text: 'Besiege 50 Ritter der Achten', reward: { crystals: 65, bonus: 'level' } },
      { type: 'level', n: 28, text: 'Erreiche Stufe 28', reward: { crystals: 55, bonus: 'heal' } },
      { type: 'mini', text: 'Töte den Klon von Samuel Eno', reward: { crystals: 75, bonus: 'level' } }
    ],
    reward: { skills: ['absolut'], text: 'Absoluter Schatten & Absolute Blutkontrolle (+25 % Blut- und Schattenschaden)' }
  },
  {
    n: 9, id: 'krieg', title: 'Der lange Krieg', src: 'Kapitel 1001–1400', place: 'Welt Kadar — achtzehn Fronten', theme: 'ruinen', tier: 4,
    intro: [
      'Achtzehn Welten, derselbe Tag. Das rote Mal breitet sich aus, die Familie Skala erlischt, Menschen und Vampire kämpfen in derselben Linie.',
      'Auf einem Hügel wartet ein Dalki, der spricht: Arian, sechs Stacheln. „Ich wollte sehen, ob du interessant bist.“'
    ],
    diff: { hp: 2.0, count: 1.12, dmg: 1.5 },
    roles: {
      ghoul: defEnemy('c9_mark', 'ghoul', 'h_markiert', 'Markierter', { hp: 22 }),
      bat: defEnemy('c9_aas', 'bat', 'bat_aas', 'Aasflieger'),
      knight: defEnemy('c9_d3', 'knight', 'dalki3', 'Dalki-Horde (3 Stacheln)', { armor: 4 }),
      witch: defEnemy('c9_rot', 'witch', 'h_rotvamp', 'Roter Vampir', { shot: 'blood', flier: false }),
      brute: defEnemy('c9_d5', 'brute', 'dalki5', 'Dalki (5 Stacheln)', { splits: 0, hp: 190 }),
      captain: defEnemy('c9_daemon', 'captain', 'q_daemon', 'Bestie der Dämonenstufe', { scale: 1.3, hp: 4200 }),
      boss: defBoss('c9_boss', 'arian', 'Arian (Sechs Stacheln)', 20000, { bellShot: 'spike', r: 46 })
    },
    texts: { swarm: 'Aasflieger über Kadar!', ring: 'Die Markierten umzingeln dich — ihre Augen glühen rot.', boss: '„Du bist der, der die Schiffe aufmacht.“' },
    quests: [
      { type: 'kill', role: 'ghoul', n: 350, text: 'Halte 350 Markierte auf', reward: { crystals: 70, bonus: 'level' } },
      { type: 'survive', n: 480, text: 'Überlebe 8 Minuten', reward: { crystals: 60, bonus: 'heal' } },
      { type: 'mini', text: 'Töte die Bestie der Dämonenstufe', reward: { crystals: 80, bonus: 'level' } }
    ],
    reward: { king: true, skills: ['handschuh'], text: 'Vampirkönig (+10 % Leben und Schaden) · Leanders Bluthandschuh (+10 % Schaden)' }
  },
  {
    n: 10, id: 'atemzug', title: 'Der letzte Atemzug', src: 'Kapitel 1401–1572', place: 'Die letzte Linie — roter Himmel', theme: 'roterhimmel', tier: 4,
    intro: [
      'Zwölf Jahre Krieg. Alle neun Mutterschiffe sind zerstört. Was übrig ist, steht an einem Ort — und Arian kommt allein. Sieben Stacheln.',
      'Wenn alles nicht reicht, wird der Himmel rot.'
    ],
    diff: { hp: 2.25, count: 1.15, dmg: 1.6 },
    roles: {
      ghoul: defEnemy('c10_d3', 'ghoul', 'dalki3', 'Dalki (3 Stacheln)', { hp: 24 }),
      bat: defEnemy('c10_aas', 'bat', 'bat_aas', 'Aasflieger'),
      knight: defEnemy('c10_elite', 'knight', 'dalki4', 'Dalki-Elite (4 Stacheln)', { armor: 5 }),
      witch: defEnemy('c10_speer', 'witch', 'dalki5', 'Dalki-Speerwerfer (5 Stacheln)', { shot: 'spike', flier: false }),
      brute: defEnemy('c10_d6', 'brute', 'dalki6', 'Dalki (6 Stacheln)', { splits: 0, hp: 210 }),
      captain: defEnemy('c10_klon', 'captain', 'h_klon', 'Samuel Enos letzter Klon', { scale: 1.2, hp: 4800 }),
      boss: defBoss('c10_boss', 'arianF', 'Arian (Letzte Form)', 24000, { bellShot: 'spike', r: 50 })
    },
    texts: { swarm: 'Aasflieger verdunkeln den roten Himmel!', ring: 'Die Dalki-Elite schließt den Kreis!', boss: '„Ich habe gewartet. Du warst es wert.“' },
    quests: [
      { type: 'kill', role: 'knight', n: 60, text: 'Besiege 60 Dalki der Elite', reward: { crystals: 80, bonus: 'level' } },
      { type: 'level', n: 32, text: 'Erreiche Stufe 32', reward: { crystals: 70, bonus: 'heal' } },
      { type: 'mini', text: 'Beende Samuel Enos letzten Klon', reward: { crystals: 90, bonus: 'level' } }
    ],
    reward: { tier: 5, text: 'Herrscher des Blutes — Evolution: Himmlischer Vampirlord' }
  },
  {
    n: 11, id: 'rueckkehr', title: 'Die Rückkehr einer Legende', src: 'ab Kapitel 1573', place: 'Die Himmelsebene', theme: 'himmel', tier: 5,
    intro: [
      'Leander hatte sich geirrt: Finn schläft nicht ein paar Jahre, sondern über tausend. Peter hat die ganze Zeit vor der Gruft gewacht.',
      'Finn erwacht in einer veränderten Welt. Seine himmlische Kraft wächst mit denen, die an ihn glauben — die Diener des Himmels prüfen, ob er würdig ist.'
    ],
    diff: { hp: 2.6, count: 1.15, dmg: 1.65 },
    roles: {
      ghoul: defEnemy('c11_juenger', 'ghoul', 'h_juenger', 'Lichtjünger', { hp: 20, gore: 'light' }),
      bat: defEnemy('c11_funke', 'bat', 'bat_licht', 'Lichtfunke', { gore: 'light' }),
      knight: defEnemy('c11_ritter', 'knight', 'h_ritter', 'Himmelsritter', { armor: 4, gore: 'light' }),
      witch: defEnemy('c11_seherin', 'witch', 'h_seherin', 'Himmelsseherin', { shot: 'light', gore: 'light' }),
      brute: defEnemy('c11_koloss', 'brute', 'h_koloss', 'Lichtkoloss', { gore: 'light' }),
      captain: defEnemy('c11_waechter', 'captain', 'h_waechter', 'Erster Wächter', { hp: 5200, gore: 'light' }),
      boss: defBoss('c11_boss', 'himmlisch', 'Der Himmlische Richter', 33000, { bellShot: 'light' })
    },
    texts: { swarm: 'Ein Regen aus Lichtfunken!', ring: 'Die Jünger des Lichts umringen dich.', boss: 'Der Himmlische Richter steigt herab.' },
    quests: [
      { type: 'kill', role: 'ghoul', n: 400, text: 'Besiege 400 Lichtjünger', reward: { crystals: 90, bonus: 'level' } },
      { type: 'survive', n: 480, text: 'Überlebe 8 Minuten', reward: { crystals: 80, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege den Ersten Wächter', reward: { crystals: 100, bonus: 'level' } }
    ],
    reward: { tier: 6, text: 'Evolution: Reiner Himmlischer' }
  },
  {
    n: 12, id: 'goetter', title: 'Gottbezwinger', src: 'spätere Kapitel', place: 'Das Reich der Götter', theme: 'goetter', tier: 6,
    intro: [
      'Götter sind keine Legende. Und Emma Wagners Gottbezwinger-Kristall trägt die Macht, sie zu bezwingen.',
      'Um diese Macht zu tragen, muss Finn einen Gott besiegen.'
    ],
    diff: { hp: 3.1, count: 1.2, dmg: 1.8 },
    roles: {
      ghoul: defEnemy('c12_bestie', 'ghoul', 'q_void', 'Götterbestie', { hp: 22, gore: 'void' }),
      bat: defEnemy('c12_schwinge', 'bat', 'bat_void', 'Leerenschwinge', { gore: 'void' }),
      knight: defEnemy('c12_ritter', 'knight', 'g_ritter', 'Götterritter', { armor: 5, gore: 'void' }),
      witch: defEnemy('c12_priesterin', 'witch', 'g_seherin', 'Priesterin der Leere', { shot: 'void', gore: 'void' }),
      brute: defEnemy('c12_titan', 'brute', 'q_voidP', 'Titanbestie', { splits: 2, gore: 'void' }),
      captain: defEnemy('c12_diener', 'captain', 'g_diener', 'Auserwählter eines Gottes', { hp: 6500, gore: 'void' }),
      boss: defBoss('c12_boss', 'gott', 'Ein Gott', 46000, { bellShot: 'void' })
    },
    texts: { swarm: 'Leerenschwingen verdunkeln den Himmel!', ring: 'Die Diener der Götter schließen den Kreis.', boss: 'Ein Gott wendet sich dir zu.' },
    quests: [
      { type: 'kill', role: 'knight', n: 60, text: 'Besiege 60 Götterritter', reward: { crystals: 110, bonus: 'level' } },
      { type: 'level', n: 35, text: 'Erreiche Stufe 35', reward: { crystals: 100, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege den Auserwählten', reward: { crystals: 120, bonus: 'level' } }
    ],
    reward: { tier: 7, text: 'Emma Wagners Kristall — Evolution: Vampir-Gottbezwinger' }
  }
];

/* ---------------------------------------------------------------- Kräfte (dauerhaft, pro Kapitel) */
// Unabhaengig von der Evolution: Kraefte kommen dort, wo sie in der Geschichte auftauchen.
const FINN_SKILLS = {
  schatten: { name: 'Schatten', cards: ['schattenflammen', 'nachtschlund', 'nachbilder'], desc: 'Schattenschritt statt Ausweichen; Schattenflammen, Nachtschlund und Nachbilder erscheinen als Karten.' },
  qi: { name: 'Qi (Leo)', cards: ['qihand'], desc: 'Leos Grundform: die Qi-Hand erscheint als Karte.' },
  qi2: { name: 'Qi vertieft', cards: ['qikette', 'eisenmeridiane'], desc: 'Qi-Kette und Eisenmeridiane erscheinen als Karten.' },
  ghoul: { name: 'Peter, der Ghoul', cards: [], desc: 'Peter Kraus kämpft deutlich stärker.' },
  blut: { name: 'Blutkräfte', cards: ['blutnova', 'bluternte'], desc: 'Blutnova und Bluternte erscheinen als Karten.' },
  fraktion: { name: 'Die Verfluchten', cards: [], desc: 'Bis zu 3 Begleiter gleichzeitig.' },
  absolut: { name: 'Absolute Kontrolle', cards: [], desc: '+25 % Blut- und Schattenschaden.' },
  handschuh: { name: 'Bluthandschuh', cards: [], desc: '+10 % Schaden.' }
};
// welche Kraefte eine Form mindestens voraussetzt (Testmodus / alte Spielstaende)
const SKILLS_BY_TIER = { 3: ['schatten', 'qi', 'qi2', 'ghoul', 'blut'], 4: ['fraktion'], 5: ['absolut', 'handschuh'] };
function finnSkills() {
  const S = storySave(), F = finnSave(), out = new Set(S.skills || []);
  const tier = GAME && GAME.p && GAME.p.hero === 'finn' ? (GAME.p.tier || 0) : F.tier;
  for (const t in SKILLS_BY_TIER) if (tier >= +t || F.tier >= +t) SKILLS_BY_TIER[t].forEach((k) => out.add(k));
  if (SAVE.settings.testUnlock && (UI.finnPick || 0) >= 2) Object.keys(FINN_SKILLS).forEach((k) => out.add(k));
  return out;
}

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
  S.cleared = S.cleared || {}; S.gear = S.gear || {}; S.best = S.best || {}; S.skills = S.skills || [];
  if (S.crystals === undefined) S.crystals = 0;
  if (!S.v2) { // Spielstand aus der 7-Kapitel-Fassung: nach erreichter Form umrechnen
    S.v2 = true;
    const t = (SAVE.finn && SAVE.finn.tier) || 0, old = Object.keys(S.cleared).length;
    const upTo = old ? [0, 0, 1, 5, 7, 10, 11, 12][Math.min(7, t)] : 0;
    S.cleared = {};
    for (let n = 1; n <= upTo; n++) { S.cleared[n] = true; (CHAPTERS[n - 1].reward.skills || []).forEach((k) => { if (!S.skills.includes(k)) S.skills.push(k); }); }
  }
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
  G.schoolMul = finnSkills().has('absolut') ? { blood: 1.25, shadow: 1.25 } : null;
  spawnCompanions(G);
  const S = storySave(), gr = S.gear;
  G.statMod = (st) => {
    const sk = finnSkills();
    st.might *= 1 + 0.08 * (gr.handschuhe || 0) + (S.king ? 0.1 : 0) + (sk.has('handschuh') ? 0.1 : 0);
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
      const neu = (R.skills || []).filter((k) => !S.skills.includes(k));
      if (neu.length) { S.skills.push(...neu); res.reward = R; res.skills = neu; }
    }
  }
  return res;
}
// Finn: im Story-Modus zaehlt das Kapitel, nicht mehr die Essenz
const _finnEndOld = HEROES.finn.onEnd;
HEROES.finn.onEnd = function (won) { return GAME.story ? storyEnd(won) : _finnEndOld(won); };
HEROES.finn.mech.desc = 'Finn beginnt als Mensch ohne jede Fähigkeit — im ersten Kapitel findet er das Buch und wird zum Halbling. Evolutionen und Kräfte (Schatten, Qi, Blut) erhält er dauerhaft an den Stellen, an denen sie auch in der Geschichte auftauchen: beim ersten Sieg über den Boss des Kapitels. Im Lauf kämpft er mit den Kräften seiner aktuellen Form; Bestienkristalle aus den Läufen werden zu dauerhafter Ausrüstung.';

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
