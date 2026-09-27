'use strict';
/* ==========================================================================
   STORY-MODUS „Das Vampirsystem“ — Finn Müllers Weg in 15 Kapiteln.
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

// Kapitel folgen dem Recherche-Dossier (story/story-bible.json, 80 Missionen).
// Kapitelzahlen „Vorlage“ = englischer Webroman. Originalnamen, wo kein deutscher Name belegt ist.
const CHAPTERS = [
  {
    n: 1, id: 'aula', title: 'Die Aula', src: 'Kapitel 1–64', missions: [1, 6], place: 'Zweite Militärbasis — Akademie', theme: 'akademie', tier: 1,
    intro: [
      'Finn Müller ist sechzehn, Waise und gilt als fähigkeitslos. Sein Blut öffnet das schwarze Buch seiner Eltern — das System erwacht.',
      'In der Aula steht Fabian Schneider gefesselt vor hundert Erstjährigen. Mono, Stufe sechs, will zeigen, was Rang bedeutet.'
    ],
    diff: { hp: 0.5, count: 0.8, dmg: 0.75 },
    roles: {
      ghoul: defEnemy('c1_gruen', 'ghoul', 'q_kanal', 'Grünzonen-Bestie'),
      bat: defEnemy('c1_flatter', 'bat', 'bat_braun', 'Flatterbestie'),
      knight: defEnemy('c1_zweit', 'knight', 'h_schueler', 'Zweitjähriger (Stufe 2)', { armor: 1 }),
      witch: defEnemy('c1_wasser', 'witch', 'h_truedream', 'Wasser-Anwender', { shot: 'soul', flier: false }),
      brute: defEnemy('c1_mutter', 'brute', 'q_mutter', 'Brutmutter'),
      captain: defEnemy('c1_vier', 'captain', 'h_schueler', 'Monos Vertrauter (Stufe 4)', { scale: 1.2, hp: 900 }),
      boss: defBoss('c1_boss', 'mono', 'Mono (Stufe 6)', 2400, { bellShot: 'soul' })
    },
    texts: { swarm: 'Flatterbestien aus dem Übungsportal!', ring: 'Die Älteren kreisen dich ein …', boss: 'Mono zieht den Vorhang weg. Er sieht zwei Sekunden in die Zukunft.' },
    quests: [
      { type: 'kill', role: 'knight', n: 30, text: 'Besiege 30 Zweitjährige', reward: { crystals: 15, bonus: 'level' } },
      { type: 'survive', n: 240, text: 'Überlebe 4 Minuten', reward: { crystals: 15, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege Monos Vertrauten', reward: { crystals: 25, bonus: 'level' } }
    ],
    reward: { skills: ['technik'], text: 'Hammerschlag und Blitzschritt (Hammer Strike & Flash Step)' }
  },
  {
    n: 2, id: 'portal', title: 'Das rote Portal', src: 'Kapitel 65–110', missions: [7, 8], place: 'Roter Portalplanet (Pioletic)', theme: 'rotezone', tier: 1,
    intro: [
      'Unter Druck von Dukes Leuten stößt Peter Finn durch ein rotes Portal. Fabian springt hinterher.',
      'Rattaclaws, verlassene Militäranlagen — und ein Reisender namens Ian. Hier wird Finn zum Vampir und findet das Schattenbuch.'
    ],
    diff: { hp: 0.72, count: 0.85, dmg: 0.88 },
    roles: {
      ghoul: defEnemy('c2_ratta', 'ghoul', 'q_rot', 'Rattaclaw'),
      bat: defEnemy('c2_flatter', 'bat', 'bat_blut', 'Blutflatterer'),
      knight: defEnemy('c2_panzer', 'knight', 'q_rotP', 'Panzer-Rattaclaw', { armor: 2 }),
      witch: defEnemy('c2_spore', 'witch', 'q_spore', 'Sporenbestie', { shot: 'acid', flier: false }),
      brute: defEnemy('c2_mutter', 'brute', 'q_alienM', 'Bestienmutter'),
      captain: defEnemy('c2_alpha', 'captain', 'q_orange', 'Rattaclaw-Alpha', { scale: 1.3, hp: 1200 }),
      boss: defBoss('c2_boss', 'ian', 'Ian, der Reisende', 4500, { bellShot: 'spike' })
    },
    texts: { swarm: 'Blutflatterer aus dem roten Himmel!', ring: 'Die Rattaclaws kreisen dich ein …', boss: 'Ian stellt sich dir in den Weg.' },
    quests: [
      { type: 'kill', role: 'ghoul', n: 150, text: 'Besiege 150 Rattaclaws', reward: { crystals: 25, bonus: 'level' } },
      { type: 'crystals', n: 20, text: 'Sammle 20 Bestienkristalle', reward: { crystals: 20, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege den Rattaclaw-Alpha', reward: { crystals: 35, bonus: 'level' } }
    ],
    reward: { tier: 2, skills: ['schatten'], text: 'Evolution: Vampir (Kap. 86) · das Schattenbuch' }
  },
  {
    n: 3, id: 'caladi', title: 'Caladi', src: 'Kapitel 111–138', missions: [9, 10], place: 'Planet Caladi — Shelter und rote Zone', theme: 'caladi', tier: 2,
    intro: [
      'Die Gruppenexkursion führt zum Shelter von Caladi und in die rote Zone. Dort wartet etwas, das es nicht geben dürfte: ein Dalki.',
      'Peter wird tödlich verletzt. Finn hat nur einen Weg, ihn zu retten.'
    ],
    diff: { hp: 0.92, count: 0.92, dmg: 0.98 },
    roles: {
      ghoul: defEnemy('c3_laeufer', 'ghoul', 'q_caladi', 'Caladi-Bestie'),
      bat: defEnemy('c3_aas', 'bat', 'bat_aas', 'Aasflieger'),
      knight: defEnemy('c3_panzer', 'knight', 'q_panzer', 'Panzerbestie der roten Zone', { armor: 2 }),
      witch: defEnemy('c3_spucker', 'witch', 'q_kroete', 'Säurekröte', { shot: 'acid', flier: false }),
      brute: defEnemy('c3_koenig', 'brute', 'q_fort', 'Grubenbestie'),
      captain: defEnemy('c3_koenigB', 'captain', 'q_koenig', 'Königsstufen-Bestie', { scale: 1.25, hp: 1800 }),
      boss: defBoss('c3_boss', 'dalki1', 'Dalki', 7000, { bellShot: 'spike' })
    },
    texts: { swarm: 'Aasflieger über der roten Zone!', ring: 'Die Bestien von Caladi umzingeln euch!', boss: 'Ein Dalki. Der Krieg ist seit Jahren vorbei — und trotzdem steht er da.' },
    quests: [
      { type: 'kill', role: 'ghoul', n: 180, text: 'Besiege 180 Caladi-Bestien', reward: { crystals: 35, bonus: 'level' } },
      { type: 'level', n: 18, text: 'Erreiche Stufe 18', reward: { crystals: 25, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege die Königsstufen-Bestie', reward: { crystals: 45, bonus: 'level' } }
    ],
    reward: { skills: ['ghoul', 'blut'], text: 'Blutritual: Peter wird Ghoul (Cursed Family) · Blutnova und Bluternte' }
  },
  {
    n: 4, id: 'nachtdaemon', title: 'Der Nachtdämon', src: 'Kapitel 139–383', missions: [11, 19], place: 'Zweite Militärbasis — bei Nacht', theme: 'basisnacht', tier: 2,
    intro: [
      'Fex Sanguini, Ausreißer der dreizehnten Familie, kommt an die Akademie. Peter wird zum Wight, Jack Truedream nimmt Menschen ihre Fähigkeiten, Leo lehrt Qi.',
      'Nachts schützt der Nachtdämon die Schwachen. Am Ende steht die Konfrontation mit Duke.'
    ],
    diff: { hp: 0.94, count: 0.93, dmg: 0.96 },
    roles: {
      ghoul: defEnemy('c4_bestie', 'ghoul', 'q_kanal', 'Portalbestie', { hp: 16 }),
      bat: defEnemy('c4_flatter', 'bat', 'bat_braun', 'Flatterbestie'),
      knight: defEnemy('c4_wache', 'knight', 'h_wache', 'Dukes Leute', { armor: 2 }),
      witch: defEnemy('c4_agent', 'witch', 'h_truedream', 'Truedream-Agent', { shot: 'soul', flier: false }),
      brute: defEnemy('c4_mutter', 'brute', 'q_orange', 'Bestie aus dem orangen Portal', { splits: 0, hp: 130 }),
      captain: defEnemy('c4_jack', 'captain', 'h_jack', 'Jack Truedream', { scale: 1.2, hp: 2200 }),
      boss: defBoss('c4_boss', 'stahlmann', 'Duke', 7000, { bellShot: 'spike' })
    },
    texts: { swarm: 'Flatterbestien über dem Kasernenhof!', ring: 'Dukes Leute schließen den Kreis.', boss: 'Duke erwartet dich.' },
    quests: [
      { type: 'kill', role: 'knight', n: 35, text: 'Besiege 35 von Dukes Leuten', reward: { crystals: 40, bonus: 'level' } },
      { type: 'survive', n: 360, text: 'Überlebe 6 Minuten', reward: { crystals: 30, bonus: 'heal' } },
      { type: 'mini', text: 'Widersetze dich Jack Truedream', reward: { crystals: 50, bonus: 'level' } }
    ],
    reward: { skills: ['qi'], text: 'Leo lehrt dich Qi (Kap. 333–351): Qi-Hand und Eisenmeridiane' }
  },
  {
    n: 5, id: 'siedlung', title: 'Die Vampirsiedlung', src: 'Kapitel 384–534', missions: [20, 29], place: 'Vampirsiedlung — Schule, Rat und zehnte Burg', theme: 'siedlung', tier: 2,
    intro: [
      'Unter Decknamen schleicht sich die Gruppe in die Vampirschule. Fex droht die Hinrichtung, Peter ist ein nicht registrierter Wight.',
      'Finns Schatten verweist auf die verbannten Punisher — und die zehnte Familie hat keinen Leiter.'
    ],
    diff: { hp: 1.1, count: 0.98, dmg: 1.08 },
    roles: {
      ghoul: defEnemy('c5_wache', 'ghoul', 'v_wache', 'Vampirwache', { hp: 18 }),
      bat: defEnemy('c5_fleder', 'bat', 'bat_blut', 'Blutfledermaus'),
      knight: defEnemy('c5_ritter', 'knight', 'v_ritter', 'Vampirritter', { armor: 3 }),
      witch: defEnemy('c5_magier', 'witch', 'v_magier', 'Blutmagierin', { shot: 'blood', flier: false }),
      brute: defEnemy('c5_thrall', 'brute', 'v_thrall', 'Thrall', { splits: 0, hp: 150 }),
      captain: defEnemy('c5_boneclaw', 'captain', 'boneclaw', 'Boneclaw', { scale: 1.3, hp: 2600 }),
      boss: defBoss('c5_boss', 'silva', 'Vollstrecker des Vampirrats', 9000, { bellShot: 'blood' })
    },
    texts: { swarm: 'Blutfledermäuse aus den Türmen!', ring: 'Die Wachen des Rates schließen den Kreis.', boss: 'Der Rat schickt seinen Vollstrecker.' },
    quests: [
      { type: 'kill', role: 'knight', n: 40, text: 'Besiege 40 Vampirritter', reward: { crystals: 50, bonus: 'level' } },
      { type: 'survive', n: 420, text: 'Überlebe 7 Minuten', reward: { crystals: 40, bonus: 'heal' } },
      { type: 'mini', text: 'Überstehe die Begegnung mit Boneclaw', reward: { crystals: 60, bonus: 'level' } }
    ],
    reward: { tier: 3, text: 'Evolution: Vampiradliger (Kap. 428) · zehnter Familienleiter' }
  },
  {
    n: 6, id: 'blade', title: 'Die Verfluchten', src: 'Kapitel 535–668', missions: [30, 33], place: 'Blade Island', theme: 'ruinen', tier: 3,
    intro: [
      'Aus Überlebenden und Ausgestoßenen wächst die Cursed Faction; Sam gibt ihr Struktur.',
      'Auf Blade Island hält Hilston Blade Kinder als Träger von Fähigkeiten. Fabian und Raten opfern ihren Platz im gemeinsamen Körper, damit Sil und die Kinder frei werden.'
    ],
    diff: { hp: 1.25, count: 1.02, dmg: 1.18 },
    roles: {
      ghoul: defEnemy('c6_bestie', 'ghoul', 'q_caladi', 'Inselbestie', { hp: 18 }),
      bat: defEnemy('c6_aas', 'bat', 'bat_aas', 'Aasflieger'),
      knight: defEnemy('c6_blade', 'knight', 'h_blade', 'Blade-Wächter', { armor: 3 }),
      witch: defEnemy('c6_kopie', 'witch', 'h_pure', 'Fähigkeitsträger', { shot: 'soul', flier: false }),
      brute: defEnemy('c6_koenig', 'brute', 'q_koenig', 'Königsstufen-Bestie', { splits: 0, hp: 170 }),
      captain: defEnemy('c6_champ', 'captain', 'h_blade', 'Champion des Blade-Turniers', { scale: 1.25, hp: 3000 }),
      boss: defBoss('c6_boss', 'hagon', 'Hilston Blade', 10000, { bellShot: 'spike' })
    },
    texts: { swarm: 'Aasflieger über der Insel!', ring: 'Die Blade-Wächter kreisen dich ein!', boss: 'Hilston Blade — fünf vorbereitete Fähigkeiten.' },
    quests: [
      { type: 'kill', role: 'knight', n: 45, text: 'Besiege 45 Blade-Wächter', reward: { crystals: 55, bonus: 'level' } },
      { type: 'level', n: 24, text: 'Erreiche Stufe 24', reward: { crystals: 45, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege den Champion des Blade-Turniers', reward: { crystals: 65, bonus: 'level' } }
    ],
    reward: { skills: ['fraktion'], text: 'Die Cursed Faction — ab jetzt bis zu 3 Begleiter' }
  },
  {
    n: 7, id: 'buergerkrieg', title: 'Bürgerkrieg', src: 'Kapitel 669–808', missions: [34, 38], place: 'Fronten des Menschenbürgerkriegs', theme: 'schlachtfeld', tier: 3,
    intro: [
      'Truedream, Blade, Militär und Pure treiben die Menschen in einen Bürgerkrieg. Bloodsucker fallen über die zehnte Burg her, Emma trägt als Dhampir gelbe Augen.',
      'Auf einem fernen Planeten gräbt sich eine Bestie der Dämonenstufe ein: eine Krabbe mit einem Rücken aus Diamant. Ihr Kristall ist der Schlüssel zu Finns nächster Evolution.'
    ],
    diff: { hp: 1.4, count: 1.05, dmg: 1.26 },
    roles: {
      ghoul: defEnemy('c7_d1', 'ghoul', 'dalki1', 'Dalki (1 Stachel)', { hp: 20 }),
      bat: defEnemy('c7_aas', 'bat', 'bat_aas', 'Aasflieger'),
      knight: defEnemy('c7_sold', 'knight', 'h_sunshield', 'Fraktionssoldat', { armor: 3 }),
      witch: defEnemy('c7_pure', 'witch', 'h_pure', 'Agent von Pure', { shot: 'soul', flier: false }),
      brute: defEnemy('c7_d5', 'brute', 'dalki5', 'Dalki (5 Stacheln)', { splits: 0, hp: 170 }),
      captain: defEnemy('c7_sauger', 'captain', 'q_orange', 'Bloodsucker', { scale: 1.3, hp: 3400 }),
      boss: defBoss('c7_boss', 'krabbe', 'Diamantkrabbe (Dämonenstufe)', 12500, { bellShot: 'spike', r: 50 })
    },
    texts: { swarm: 'Aasflieger über der Front!', ring: 'Fraktionssoldaten umzingeln dich!', boss: 'Die Diamantkrabbe bricht aus dem Schlamm.' },
    quests: [
      { type: 'kill', role: 'ghoul', n: 250, text: 'Besiege 250 Gegner an der Front', reward: { crystals: 60, bonus: 'level' } },
      { type: 'survive', n: 450, text: 'Halte die Linie 7:30 Minuten', reward: { crystals: 50, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege den Bloodsucker', reward: { crystals: 70, bonus: 'level' } }
    ],
    reward: { tier: 4, text: 'Evolution: Vampirlord aus dem Kristall der Krabbe (Kap. 805–807)' }
  },
  {
    n: 8, id: 'krone', title: 'Kampf um den Thron', src: 'Kapitel 809–945', missions: [39, 45], place: 'Vampirsiedlung — der Rat brennt', theme: 'burg', tier: 4,
    intro: [
      'Fex entdeckt die innere Blutwaffe. Cindy Cha manipuliert die Thronfolge, stiehlt das Wissen um die Absolute Blutkontrolle und lässt Bloodsucker auf die Siedlung los.',
      'Finn muss ihre Pläne aufdecken, bevor die Siedlung fällt.'
    ],
    diff: { hp: 1.8, count: 1.1, dmg: 1.42 },
    roles: {
      ghoul: defEnemy('c8_sauger', 'ghoul', 'q_hase', 'Bloodsucker', { hp: 20 }),
      bat: defEnemy('c8_fleder', 'bat', 'bat_blut', 'Blutfledermaus'),
      knight: defEnemy('c8_ritter', 'knight', 'v_ritter', 'Ritter einer Familie', { armor: 4 }),
      witch: defEnemy('c8_magier', 'witch', 'v_magier', 'Cindys Blutmagierin', { shot: 'blood', flier: false }),
      brute: defEnemy('c8_thrall', 'brute', 'v_thrall', 'Thrall', { splits: 0, hp: 180 }),
      captain: defEnemy('c8_alpha', 'captain', 'q_orange', 'Bloodsucker-Alpha', { scale: 1.4, hp: 3800 }),
      boss: defBoss('c8_boss', 'cindy', 'Cindy Cha', 17500, { bellShot: 'blood' })
    },
    texts: { swarm: 'Blutfledermäuse aus den Türmen!', ring: 'Bloodsucker fallen über die Siedlung her!', boss: 'Cindy Cha greift selbst nach dem Thron.' },
    quests: [
      { type: 'kill', role: 'knight', n: 50, text: 'Besiege 50 Ritter', reward: { crystals: 65, bonus: 'level' } },
      { type: 'level', n: 28, text: 'Erreiche Stufe 28', reward: { crystals: 55, bonus: 'heal' } },
      { type: 'mini', text: 'Töte den Bloodsucker-Alpha', reward: { crystals: 75, bonus: 'level' } }
    ],
    reward: { skills: ['absolut'], text: 'Absolute Blutkontrolle (+25 % Blut- und Schattenschaden)' }
  },
  {
    n: 9, id: 'krieg', title: 'Der König mit Bedingungen', src: 'Kapitel 946–1408', missions: [46, 54], place: 'Jagdplaneten und Vampirsiedlung', theme: 'ruinen', tier: 4,
    intro: [
      'Finn unterrichtet an der alten Akademie. Auf einer Jagd lehrt ihn Chris die zweite Qi-Stufe. Laxmus kehrt als Gefahr zurück.',
      'Danach nimmt Finn die Krone an — unter einer Bedingung: Vampire behandeln Menschen als gleichwertig.'
    ],
    diff: { hp: 2.0, count: 1.12, dmg: 1.5 },
    roles: {
      ghoul: defEnemy('c9_d2', 'ghoul', 'dalki2', 'Dalki (2 Stacheln)', { hp: 22 }),
      bat: defEnemy('c9_aas', 'bat', 'bat_aas', 'Aasflieger'),
      knight: defEnemy('c9_d3', 'knight', 'dalki3', 'Dalki (3 Stacheln)', { armor: 4 }),
      witch: defEnemy('c9_rot', 'witch', 'h_rotvamp', 'Anhänger von Laxmus', { shot: 'blood', flier: false }),
      brute: defEnemy('c9_d5', 'brute', 'dalki5', 'Dalki (5 Stacheln)', { splits: 0, hp: 190 }),
      captain: defEnemy('c9_daemon', 'captain', 'q_daemon', 'Dämonenbestie', { scale: 1.3, hp: 4200 }),
      boss: defBoss('c9_boss', 'original', 'Laxmus', 20000, { bellShot: 'blood' })
    },
    texts: { swarm: 'Aasflieger über dem Jagdplaneten!', ring: 'Die Dalki kreisen dich ein!', boss: 'Laxmus ist zurück.' },
    quests: [
      { type: 'kill', role: 'ghoul', n: 350, text: 'Besiege 350 Dalki', reward: { crystals: 70, bonus: 'level' } },
      { type: 'survive', n: 480, text: 'Überlebe 8 Minuten', reward: { crystals: 60, bonus: 'heal' } },
      { type: 'mini', text: 'Töte die Dämonenbestie', reward: { crystals: 80, bonus: 'level' } }
    ],
    reward: { king: true, skills: ['qi2'], text: 'Vampirkönig (Kap. 1371) · zweite Qi-Stufe von Chris · Sen Draco erwacht in der Steintafel' }
  },
  {
    n: 10, id: 'graham', title: 'Graham', src: 'Kapitel 1409–1572', missions: [55, 57], place: 'Grahams Front', theme: 'roterhimmel', tier: 4,
    intro: [
      'Vampire und Menschen kämpfen offen zusammen. Finn infiltriert Mutterschiffe, Emma geht ins Exil. Aus der Steintafel in seinem System spricht nun Sen Draco zu ihm — ein uraltes Wesen, das sich über ihn lustig macht und ihm doch seine Kraft leiht.',
      'An der entscheidenden Front stellt sich Finn dem Anführer der Dalki — mit einer Belastung, die sein eigenes Überleben gefährdet.'
    ],
    diff: { hp: 2.25, count: 1.15, dmg: 1.6 },
    roles: {
      ghoul: defEnemy('c10_d3', 'ghoul', 'dalki3', 'Dalki (3 Stacheln)', { hp: 24 }),
      bat: defEnemy('c10_aas', 'bat', 'bat_aas', 'Aasflieger'),
      knight: defEnemy('c10_elite', 'knight', 'dalki4', 'Dalki-Elite (4 Stacheln)', { armor: 5 }),
      witch: defEnemy('c10_speer', 'witch', 'dalki5', 'Dalki-Speerwerfer (5 Stacheln)', { shot: 'spike', flier: false }),
      brute: defEnemy('c10_d6', 'brute', 'dalki6', 'Dalki (6 Stacheln)', { splits: 0, hp: 210 }),
      captain: defEnemy('c10_general', 'captain', 'dalkiW', 'Grahams General', { scale: 1.6, hp: 4800 }),
      boss: defBoss('c10_boss', 'graham', 'Graham', 24000, { bellShot: 'spike', r: 48 })
    },
    texts: { swarm: 'Aasflieger verdunkeln den Himmel!', ring: 'Grahams Armee umzingelt dich!', boss: 'Graham ist hier.' },
    quests: [
      { type: 'kill', role: 'knight', n: 60, text: 'Besiege 60 Dalki der Elite', reward: { crystals: 80, bonus: 'level' } },
      { type: 'level', n: 32, text: 'Erreiche Stufe 32', reward: { crystals: 70, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege Grahams General', reward: { crystals: 90, bonus: 'level' } }
    ],
    reward: { tier: 5, text: 'Herrscher des Blutes — Evolution: Himmlischer Vampirlord (Kap. 1565)' }
  },
  {
    n: 11, id: 'legende', title: 'Die Rückkehr einer Legende', src: 'Kapitel 1573–1985', missions: [58, 66], place: 'Celestial Space und die Welt nach tausend Jahren', theme: 'himmel', tier: 5,
    intro: [
      'Nach einem Jahrtausend ist Finn eine Legende. Peter hat an seiner Gruft gewacht; Leo ist tot. Unter dem Decknamen BB misstraut Finn den Celestials.',
      'Emma Wagner ist als Dhampir-Königin zur Gefahr für alle Vampire geworden. Es gibt keinen anderen Ausgang.'
    ],
    diff: { hp: 2.6, count: 1.15, dmg: 1.65 },
    roles: {
      ghoul: defEnemy('c11_dhampir', 'ghoul', 'h_dhampir', 'Dhampir', { hp: 20, gore: 'light' }),
      bat: defEnemy('c11_funke', 'bat', 'bat_licht', 'Lichtfunke', { gore: 'light' }),
      knight: defEnemy('c11_ritter', 'knight', 'h_ritter', 'Celestial-Wächter', { armor: 4, gore: 'light' }),
      witch: defEnemy('c11_seherin', 'witch', 'h_seherin', 'Celestial-Seherin', { shot: 'light', gore: 'light' }),
      brute: defEnemy('c11_koloss', 'brute', 'h_koloss', 'Lichtkoloss', { gore: 'light' }),
      captain: defEnemy('c11_waechter', 'captain', 'h_waechter', 'Vertrautenkönig', { hp: 5200, gore: 'light' }),
      boss: defBoss('c11_boss', 'erin', 'Emma Wagner (Dhampir-Königin)', 33000, { bellShot: 'light' })
    },
    texts: { swarm: 'Ein Regen aus Lichtfunken!', ring: 'Die Dhampire umringen dich.', boss: 'Emmas Augen leuchten gelb.' },
    quests: [
      { type: 'kill', role: 'ghoul', n: 400, text: 'Halte 400 Dhampire auf', reward: { crystals: 90, bonus: 'level' } },
      { type: 'survive', n: 480, text: 'Überlebe 8 Minuten', reward: { crystals: 80, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege den Vertrautenkönig', reward: { crystals: 100, bonus: 'level' } }
    ],
    reward: { tier: 6, text: 'Evolution: Gottbezwinger (Kap. 1688) · Emma Wagners Kristall bleibt zurück' }
  },
  {
    n: 12, id: 'vergessen', title: 'Die vergessene Legende', src: 'Kapitel 1986–2107', missions: [67, 70], place: 'Vampirsiedlung und der Dschungel des Daisy-Planeten', theme: 'bestienplanet', tier: 6,
    intro: [
      'Das Portal ist geschlossen, doch der Preis ist hoch: Kaum jemand erinnert sich noch an Finn — nur Minny. Unerkannt dient er als einfacher Wachmann der neunten Familie, trainiert Ronkin und wird Vater: Galen kommt zur Welt.',
      'Auf dem Daisy-Planeten brechen Dämonen-Bestien aus dem Dschungel. Sen Draco hat Finns System verlassen und trägt einen eigenen Drachenkörper — jetzt stellt er sich gegen ihn. Und Jim Eno ist zurück, gestärkt durch fremdes Blut.'
    ],
    diff: { hp: 2.75, count: 1.16, dmg: 1.7 },
    roles: {
      ghoul: defEnemy('c12_ranke', 'ghoul', 'q_caladi', 'Dschungelbestie', { hp: 22 }),
      bat: defEnemy('c12_aas', 'bat', 'bat_aas', 'Aasflieger'),
      knight: defEnemy('c12_wache', 'knight', 'v_ritter', 'Söldner der dritten Familie', { armor: 5 }),
      witch: defEnemy('c12_xblut', 'witch', 'v_magier', 'Vampir mit X-Blut', { shot: 'blood', flier: false }),
      brute: defEnemy('c12_horde', 'brute', 'q_koenig', 'Dämonen-Bestie', { splits: 0, hp: 220 }),
      captain: defEnemy('c12_draco', 'captain', 'sendraco_h', 'Sen Draco', { scale: 1.35, hp: 6400 }),
      boss: defBoss('c12_boss', 'jim', 'Jim Eno', 38000, { bellShot: 'blood' })
    },
    texts: { swarm: 'Aasflieger über dem leuchtenden Dschungel!', ring: 'Drei Hordenwellen zugleich!', boss: 'Jim Eno spürt deine Aura — und kommt selbst.' },
    quests: [
      { type: 'kill', role: 'ghoul', n: 400, text: 'Halte 400 Dschungelbestien auf', reward: { crystals: 100, bonus: 'level' } },
      { type: 'survive', n: 480, text: 'Beschütze die Schüler 8 Minuten', reward: { crystals: 90, bonus: 'heal' } },
      { type: 'mini', text: 'Überstehe den Kampf gegen Sen Draco', reward: { crystals: 110, bonus: 'level' } }
    ],
    reward: { text: 'Minny Talen kämpft ab jetzt an deiner Seite' }
  },
  {
    n: 13, id: 'godslayer', title: 'Gottbezwinger', src: 'Kapitel 2108–2305', missions: [71, 72], place: 'Mundus’ Prüfungswelten und Jims Kriegsplaneten', theme: 'goetter', tier: 6,
    intro: [
      'Mundus schickt Finn gegen die Stärksten ferner Welten. Seine Seelenwaffe erwacht zum Schattennebel, und mit Amra, Penswi und Mermerials zieht er gegen Jims Armee.',
      'Dann stellt sich ihm Sen Draco entgegen: ein Mensch, der sich in einen Drachen verwandeln kann — das stärkste Wesen überhaupt. Mit voller Kraft wäre er selbst für Finn unbesiegbar. Nur weil er nicht alles entfesselt, kann Finn ihn mit der Kraft der Asura niederringen. Der Sieg kostet viele Freunde das Leben.'
    ],
    diff: { hp: 2.95, count: 1.18, dmg: 1.76 },
    roles: {
      ghoul: defEnemy('c13_kapsel', 'ghoul', 'v_wache', 'Kapsel-Vampir (Stufe-5-Blut)', { hp: 22 }),
      bat: defEnemy('c13_schwinge', 'bat', 'bat_void', 'Leerenschwinge', { gore: 'void' }),
      knight: defEnemy('c13_d4', 'knight', 'dalki4', 'Dalki mit Fähigkeiten (4 Stacheln)', { armor: 5 }),
      witch: defEnemy('c13_magier', 'witch', 'v_magier', 'Jims Blutmagier', { shot: 'blood', flier: false }),
      brute: defEnemy('c13_d6', 'brute', 'dalki6', 'Dalki (6 Stacheln)', { splits: 0, hp: 230 }),
      captain: defEnemy('c13_h', 'captain', 'dalkiW', 'H (zehn Stacheln)', { scale: 1.6, hp: 6200 }),
      boss: defBoss('c13_boss', 'sendraco', 'Sen Draco', 44000, { bellShot: 'light', enrageText: 'Sen Draco wird zum Drachen!' })
    },
    texts: { swarm: 'Leerenschwingen über Jims Planeten!', ring: 'Jims Kapsel-Vampire greifen ohne Pause an!', boss: 'Sen Draco tritt vor — noch in Menschengestalt.' },
    quests: [
      { type: 'kill', role: 'knight', n: 70, text: 'Besiege 70 Dalki mit Fähigkeiten', reward: { crystals: 110, bonus: 'level' } },
      { type: 'level', n: 36, text: 'Erreiche Stufe 36', reward: { crystals: 100, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege H', reward: { crystals: 120, bonus: 'level' } }
    ],
    reward: { skills: ['asura'], text: 'God-Slayer-Rüstung und Asura-Handschuhe (Kap. 2257–2294)' }
  },
  {
    n: 14, id: 'koenige', title: 'Dämonenkönige', src: 'Kapitel 2306–2470', missions: [73, 76], place: 'Zeathun — der Red Space', theme: 'redspace', tier: 6,
    intro: [
      'Magnus zeichnet Menschen mit Immortuis Mal und öffnet mit Jessicas Blut ein Portal. Finn geht hindurch — allein in den Red Space, wo Dämonenkönige über Champions und Horden herrschen.',
      'Der erste König, der sich ihm stellt, ist Kronker: ein Riese, aus dessen Brust Kristallstacheln wachsen.'
    ],
    diff: { hp: 3.15, count: 1.2, dmg: 1.82 },
    roles: {
      ghoul: defEnemy('c14_daemon', 'ghoul', 'q_void', 'Dämon', { hp: 24, gore: 'void' }),
      bat: defEnemy('c14_schwinge', 'bat', 'bat_void', 'Leerenschwinge', { gore: 'void' }),
      knight: defEnemy('c14_chrono', 'knight', 'g_ritter', 'Chrono-Krieger', { armor: 5, gore: 'void' }),
      witch: defEnemy('c14_rot', 'witch', 'g_seherin', 'Dämonenseherin', { shot: 'void', gore: 'void' }),
      brute: defEnemy('c14_wolf', 'brute', 'q_voidP', 'Glutton-Wolf', { splits: 2, gore: 'void' }),
      captain: defEnemy('c14_shinto', 'captain', 'g_diener', 'Champion Shinto', { scale: 1.4, hp: 6800 }),
      boss: defBoss('c14_boss', 'kronker', 'Kronker, Dämonenkönig', 46000, { bellShot: 'void' })
    },
    texts: { swarm: 'Leerenschwingen verdunkeln den roten Himmel!', ring: 'Die Horden des Königs schließen den Kreis.', boss: 'Kronker hebt seine Klinge.' },
    quests: [
      { type: 'kill', role: 'knight', n: 70, text: 'Besiege 70 Chrono-Krieger', reward: { crystals: 120, bonus: 'level' } },
      { type: 'survive', n: 480, text: 'Überlebe 8 Minuten im Red Space', reward: { crystals: 110, bonus: 'heal' } },
      { type: 'mini', text: 'Bezwinge den Champion Shinto', reward: { crystals: 130, bonus: 'level' } }
    ],
    reward: { skills: ['daemon'], text: 'Dämonenform (Kap. 2388) · Kronkers Blut' }
  },
  {
    n: 15, id: 'letzter', title: 'Der letzte Vampir', src: 'Kapitel 2471–2545', missions: [77, 80], place: 'Red Space — Immortuis Reich', theme: 'roterhimmel', tier: 6,
    intro: [
      'Finn fällt im Kampf gegen Immortui — und die Flamme des Phönix erschafft ihn neu. Seine Freunde stellen sich den übrigen Königen, während die Divine Brigade überall zugleich angreift.',
      'Gegen Immortuis letzte Form hilft nur noch das Blut aller dreizehn Familien. Doch stirbt Immortui, verliert jeder Vampir seine Kraft.'
    ],
    diff: { hp: 3.35, count: 1.22, dmg: 1.9 },
    roles: {
      ghoul: defEnemy('c15_daemon', 'ghoul', 'q_void', 'Dämon', { hp: 26, gore: 'void' }),
      bat: defEnemy('c15_funke', 'bat', 'bat_licht', 'Divine-Späher', { gore: 'light' }),
      knight: defEnemy('c15_divine', 'knight', 'h_ritter', 'Krieger der Divine Brigade', { armor: 5, gore: 'light' }),
      witch: defEnemy('c15_rot', 'witch', 'h_rotvamp', 'Gezeichneter Vampir', { shot: 'blood' }),
      brute: defEnemy('c15_titan', 'brute', 'q_voidP', 'Dämonenbestie', { splits: 2, gore: 'void' }),
      captain: defEnemy('c15_koenig', 'captain', 'q_daemon', 'Tenbris, Dämonenkönig', { scale: 1.45, hp: 7400 }),
      boss: defBoss('c15_boss', 'immortui', 'Immortui', 52000, { bellShot: 'void' })
    },
    texts: { swarm: 'Divine-Späher stürzen vom Himmel!', ring: 'Gezeichnete Vampire kreisen dich ein.', boss: 'Immortui nimmt seine letzte Form an.' },
    quests: [
      { type: 'kill', role: 'knight', n: 70, text: 'Halte 70 Krieger der Divine Brigade auf', reward: { crystals: 130, bonus: 'level' } },
      { type: 'level', n: 38, text: 'Erreiche Stufe 38', reward: { crystals: 120, bonus: 'heal' } },
      { type: 'mini', text: 'Besiege Tenbris', reward: { crystals: 140, bonus: 'level' } }
    ],
    reward: { tier: 7, text: 'Der letzte Vampir — das Blut aller dreizehn Familien (Kap. 2537–2540)' },
    outro: [
      'Immortui ist gefallen, der rote Nebel verschwunden. Mit ihm ist alle Kraft vergangen, die er je verliehen hat: Dämonen werden zu Menschen — und alle Vampire ebenso. Peter spürt zum ersten Mal wieder seinen Herzschlag. Finns Kraft aber gehört jetzt ihm allein. Er ist der letzte Vampir.',
      'Die Jahre vergehen. Freunde gründen Familien, die Erde wird neu aufgebaut, das Bündnis der Völker hält. Nur Finn altert nicht.',
      'Als Layla alt geworden ist, nimmt er Abschied von seiner Familie und legt sich in der Gruft der Siedlung zum ewigen Schlaf. Eine Quest steht noch offen: Finde etwas über die Familie Talen heraus. Er wird wieder gebraucht werden.'
    ]
  }
];

/* ---------------------------------------------------------------- Kräfte (dauerhaft, pro Kapitel) */
// Unabhaengig von der Evolution: Kraefte kommen dort, wo sie laut Dossier auftauchen.
const FINN_SKILLS = {
  technik: { name: 'Kampftechniken', cards: ['hammerschlag', 'blitzschritt'], desc: 'Hammerschlag und Blitzschritt erscheinen als Karten.' },
  schatten: { name: 'Schatten', cards: ['schattenflammen', 'nachtschlund', 'nachbilder'], desc: 'Schattenschritt statt Ausweichen; Schattenflammen, Nachtschlund und Nachbilder erscheinen als Karten.' },
  ghoul: { name: 'Cursed Family', cards: [], desc: 'Peter Kraus kämpft deutlich stärker.' },
  blut: { name: 'Blutkräfte', cards: ['blutnova', 'bluternte'], desc: 'Blutnova und Bluternte erscheinen als Karten.' },
  qi: { name: 'Qi (Leo)', cards: ['qihand', 'eisenmeridiane'], desc: 'Qi stärkt den Körper: Qi-Hand und Eisenmeridiane erscheinen als Karten.' },
  fraktion: { name: 'Cursed Faction', cards: [], desc: 'Bis zu 3 Begleiter gleichzeitig.' },
  absolut: { name: 'Absolute Blutkontrolle', cards: [], desc: '+25 % Blut- und Schattenschaden.' },
  qi2: { name: 'Zweite Qi-Stufe (Chris)', cards: ['qikette'], desc: 'Qi außerhalb des Körpers: die Qi-Kette erscheint als Karte.' },
  asura: { name: 'Asura-Handschuhe', cards: [], desc: 'God-Slayer-Rüstung: +15 % Schaden und +15 % Leben.' },
  daemon: { name: 'Dämonenform', cards: [], desc: 'Die beherrschte Dämonenform: weitere +15 % Schaden.' }
};
// welche Kraefte eine Form mindestens voraussetzt (Testmodus / alte Spielstaende)
const SKILLS_BY_TIER = { 2: ['technik', 'schatten'], 3: ['ghoul', 'blut', 'qi'], 4: ['fraktion'], 5: ['absolut', 'qi2'], 7: ['asura', 'daemon'] };
function finnSkills() {
  const S = storySave(), F = finnSave(), out = new Set((S.skills || []).filter((k) => FINN_SKILLS[k]));
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
  if (!S.v3) { // Kapitelgrenzen nach dem Recherche-Dossier: Kraefte aus geschafften Kapiteln neu berechnen
    S.v2 = S.v3 = true;
    if (!Object.keys(S.cleared).length && (SAVE.finn && SAVE.finn.tier) >= 2) { const t = SAVE.finn.tier; for (let n = 1; n <= [0, 0, 2, 5, 7, 10, 11, 12][Math.min(7, t)]; n++) S.cleared[n] = true; }
    S.skills = [];
    for (let n = 1; n <= CHAPTERS.length; n++) if (S.cleared[n]) (CHAPTERS[n - 1].reward.skills || []).forEach((k) => { if (!S.skills.includes(k)) S.skills.push(k); });
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
  const S = storySave(), gr = S.gear, sk = finnSkills();
  const asura = sk.has('asura') ? 1.15 : 1, daemon = sk.has('daemon') ? 1.15 : 1;
  G.statMod = (st) => {
    st.might *= (1 + 0.08 * (gr.handschuhe || 0) + (S.king ? 0.1 : 0)) * asura * daemon;
    st.maxHp *= asura;
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
