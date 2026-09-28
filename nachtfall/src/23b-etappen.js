'use strict';
/* ==========================================================================
   ETAPPEN NACH DEM BUCH — jede Etappe ist ein grosser Handlungsbogen, jede
   Stufe ein Ereignis daraus (eigene Nacherzaehlung, keine Textuebernahme).
   Stufenarten:
     survive  — ueberlebe bis zur Zeit (Wellen laufen mit Tempo `pace`)
     duel     — ein benannter Gegner erscheint sofort; besiege ihn
     endure   — ein uebermaechtiger Gegner: halte bis zur Zeit durch
     waveboss — ueberlebe bis `at`, dann erscheint der benannte Gegner
     hunt     — erlege `n` Gegner der Rolle `role`
     boss     — Etappen-Finale: Wellen, dann der Boss
     berserk  — Finn als wahnsinniger Bloodsucker (doppelte Kraft, halbes Leben)
   Zusatz `berserk: true` macht jede andere Stufenart zum Bloodsucker-Kampf.
   Etappen 15 ff. nutzen vorerst die bisherigen Kapitel mit 8 Stufen.
   ========================================================================== */

/* ------------------------------------------------------------ Gegner der Etappe 1 */
defEnemy('e1_schueler', 'ghoul', 'h_schueler', 'Schüler (Stufe 1–2)', { hp: 9, spd: 58 });
defEnemy('e1_rowdy', 'knight', 'h_schueler', 'Schläger aus dem zweiten Jahr', { armor: 1 });
defEnemy('e1_eis', 'witch', 'h_truedream', 'Fähigkeitsnutzer', { shot: 'soul', flier: false });
defEnemy('e1_echse', 'bat', 'bat_aas', 'Flügelechse', { hp: 22 });
defEnemy('e1_wurm', 'ghoul', 'q_kanal', 'Zahnwurm', { hp: 14 });
defEnemy('e1_trav', 'knight', 'h_wache', 'Bens Leute', { armor: 2 });
const B1 = { r: 26, scale: 0.8 };
defBoss('b1_kyle', 'mono', 'Kyle Main (Tigerkrallen)', 650, Object.assign({ look: 'b_kyle', bellShot: 'soul', spd: 66 }, B1));
defBoss('b1_rylee', 'mono', 'Rylee (Verhärtung)', 950, Object.assign({ look: 'b_rylee', bellShot: 'soul', armor: 6 }, B1));
defBoss('b1_brandon', 'mono', 'Brandon Richardson (Speer)', 1250, Object.assign({ look: 'b_brandon', bellShot: 'spike' }, B1));
defBoss('b1_leo', 'hagon', 'Leo Suiyan, der blinde Schwertkämpfer', 60000, Object.assign({ look: 'leo', bellShot: 'spike', spd: 58 }, B1));
defBoss('b1_nate', 'mono', 'Nick Messing', 1900, Object.assign({ look: 'b_nate', bellShot: 'spike', armor: 6 }, B1));
defBoss('b1_scordana', 'krabbe', 'Scordana (Mittelstufen-Bestie)', 2200, { model: 'scordana', bellShot: 'acid', r: 40 });
defBoss('b1_ben', 'mono', 'Ben Richter', 1900, Object.assign({ look: 'b_ben', bellShot: 'spike' }, B1));

/* ------------------------------------------------------------ Etappe 1: Die Militaerakademie (Kapitel 1–138) */
const R_SCHULE = { ghoul: 'e1_schueler', bat: 'e1_schueler', knight: 'e1_rowdy', witch: 'e1_eis', brute: 'e1_rowdy', captain: 'c1_vier' };
const R_NACHT = { ghoul: 'e1_schueler', bat: 'e1_schueler', knight: 'e1_rowdy', witch: 'e1_eis', brute: 'e1_rowdy', captain: 'c1_vier' };
const R_CALADI = { ghoul: 'e1_wurm', bat: 'e1_echse', knight: 'c3_panzer', witch: 'c3_spucker', brute: 'c3_koenig', captain: 'c3_koenigB' };
const ETAPPE1 = {
  title: 'Die Militärakademie', place: 'Zweite Militärbasis · rotes Portal · Caladi', src: 'Kapitel 1–138', theme: 'akademie', ch: 1,
  levels: [
    { name: 'Das Buch der Eltern', type: 'survive', dur: 120, pace: 1.0, theme: 'akademie', roles: R_SCHULE,
      text: 'Ein Blutstropfen öffnet das Buch der Eltern, eine Systemstimme erwacht. Finn, der schwächste Schüler, kommt an die Akademie – und die Stärkeren lassen ihn das spüren.' },
    { name: 'Kyle, der Tigerkrallen-Schüler', type: 'duel', foe: 'b1_kyle', crowd: 0.25, theme: 'akademie', roles: R_SCHULE,
      text: 'Kyle schikaniert Peter in der Kantine. Finn stellt sich dazwischen – sein erster echter Kampf, und das System zählt mit.' },
    { name: 'Die ungeschriebenen Regeln', type: 'survive', dur: 170, pace: 1.35, theme: 'akademie', roles: R_SCHULE,
      text: 'Die Zweitjährigen erklären, wie die Schule wirklich läuft: Wer schwach ist, zahlt. Erpresser sammeln Credits ein – Finn zahlt nicht.' },
    { name: 'Maskiert im dunklen Park', type: 'duel', foe: 'b1_rylee', crowd: 0.2, theme: 'basisnacht', roles: R_NACHT, evo: 'Halbling',
      text: 'Mit einer schwarzen Maske lauert Finn Rylee im nächtlichen Park auf. Rylee kann seinen Körper verhärten – aber immer nur an einer Stelle.' },
    { name: 'Rache an Rylees Bande', type: 'survive', dur: 180, pace: 1.45, theme: 'basisnacht', roles: R_NACHT, comp: ['lena'], elites: 3,
      text: 'Rylee kommt mit Verstärkung zurück. Diesmal ist Finn nicht allein: Lena hält ihm mit dem Bogen den Rücken frei.' },
    { name: 'Die Waffenklasse', type: 'duel', foe: 'b1_brandon', crowd: 0.25, theme: 'akademie', roles: R_SCHULE,
      text: 'In der Waffenhalle unter Lehrer Leo gilt: keine Fähigkeiten, nur Waffen. Brandon Richardson will den Neuen mit dem Speer vorführen.' },
    { name: 'Duell gegen Leo', type: 'endure', foe: 'b1_leo', dur: 75, crowd: 0, theme: 'akademie', roles: R_SCHULE,
      text: 'Leo, der blinde Schwertkämpfer, will wissen, was in Finn steckt. Besiegen kann ihn niemand – aber wer lange genug steht, verdient seinen Respekt.' },
    { name: 'Aufstand in der Aula', type: 'waveboss', at: 150, foe: 'c1_boss', pace: 1.5, theme: 'akademie', roles: R_SCHULE, comp: ['emma'],
      text: 'Die Zweitjährigen treiben hundert Erstjährige in die Aula und hängen Fabian als Zielscheibe auf. Emma friert Angreifer ein – dann tritt Mono vor, der jedem Schlag schon vorher ausweicht.' },
    { name: 'Power Fighter: Hardsteely', type: 'duel', foe: 'b1_nate', crowd: 0.2, theme: 'goetter', roles: R_SCHULE,
      text: 'Im Kampfspiel Power Fighter tritt „Blood Evolver“ gegen Nick an, der seinen Körper zu Metall härtet. Nur Schläge mit voller Wucht kommen durch.' },
    { name: 'Das rote Portal', type: 'survive', dur: 190, pace: 1.6, theme: 'rotezone', ch: 2,
      text: 'Ein Stoß, und Finn stürzt durch ein rotes Portal auf einen dunklen Planeten mit zwei Monden. Zehn Rattaclaws jagen ihn in eine Ruine – halte die Treppe!' },
    { name: 'Scordana im Hangar', type: 'waveboss', at: 90, foe: 'b1_scordana', pace: 1.6, theme: 'rotezone', ch: 2,
      text: 'Im alten Militärhangar hat eine Scordana Eier gelegt. Ihr Panzer schluckt Blutschnitte – der Schwachpunkt liegt oben.' },
    { name: 'Der Bloodsucker', type: 'berserk', dur: 150, pace: 1.7, theme: 'rotezone', ch: 2, evo: 'Vampir',
      text: 'Der Hunger siegt: Finn verwandelt sich in einen wahnsinnigen Bloodsucker. Doppelte Kraft, keine Vernunft – nur Klauen und Blut. Am Ende steht er als Vampir auf.' },
    { name: 'Caladi: Jagd auf Flügelechsen', type: 'hunt', role: 'bat', n: 45, theme: 'caladi', roles: R_CALADI, pace: 1.5,
      text: 'Erste Portal-Exkursion nach Caladi, einem Wüstenplaneten mit 72-Stunden-Tagen. Aus Flügelechsen-Kristallen ließe sich Schutz vor der Sonne bauen.' },
    { name: 'Verrat in der Wüste', type: 'waveboss', at: 120, foe: 'b1_ben', pace: 1.55, theme: 'caladi', roles: Object.assign({}, R_CALADI, { knight: 'e1_trav', witch: 'e1_eis', ghoul: 'e1_trav' }),
      text: 'Bens Gruppe hat es auf die Kristalle der Stufe-1-Schüler abgesehen. Finn legt eine Schattenleere über sie – und zeigt, was er wirklich kann.' },
    { name: 'Der Dalki', type: 'boss', at: 100, foe: 'c3_boss', pace: 1.5, theme: 'caladi', roles: R_CALADI, comp: ['peter'],
      text: 'Ein schuppiges Schiff stürzt ab, ein Dalki steigt aus. Er wird mit jeder Wunde stärker. Peter wirft sich dazwischen – und nur ein Blutritual kann ihn noch retten.' }
  ]
};

/* ------------------------------------------------------------ Etappe 2: Die zweite Basis (Kapitel 139–383) */
defEnemy('e2_wache', 'knight', 'h_wache', 'Truedreams Wächter', { armor: 2 });
defEnemy('e2_schnecke', 'ghoul', 'q_panzer', 'Felsschnecke', { hp: 22, spd: 44 });
defEnemy('e2_schlange', 'bat', 'bat_aas', 'Mittelstufen-Schlange', { hp: 20 });
defEnemy('e2_koeder', 'ghoul', 'q_spore', 'Köder-Bestie', { hp: 20 });
defEnemy('e2_ranke', 'witch', 'q_kroete', 'Rankenspucker', { shot: 'acid', flier: false });
defEnemy('e2_hund', 'ghoul', 'q_rot', 'Blinder Furry Hound', { hp: 20, spd: 74 });
defEnemy('e2_klon', 'ghoul', 'h_blade', 'Klon von Multiplier', { hp: 14, spd: 66 });
defBoss('b2_fex', 'mono', 'Fex Sanguini', 1500, Object.assign({ look: 'fex', bellShot: 'blood' }, B1));
defBoss('b2_emma', 'erin', 'Emma, von Fex gelenkt', 1700, Object.assign({ look: 'emma', bellShot: 'light' }, B1));
defBoss('b2_leander', 'mono', 'Leander im Nanobot-Anzug', 1900, Object.assign({ look: 'leander', bellShot: 'spike', armor: 4 }, B1));
defBoss('b2_kenny', 'mono', 'Kenny (Giftnadeln)', 2200, Object.assign({ look: 'b_kenny', bellShot: 'acid' }, B1));
defBoss('b2_ranken', 'krabbe', 'Rankenbestie (Hochstufe)', 4600, { model: 'ranken', bellShot: 'acid', r: 44 });
defBoss('b2_likmorn', 'dalki1', 'Likmorn, König der Unterstadt', 6000, { model: 'likmorn', bellShot: 'spike', r: 34 });
defBoss('b2_multi', 'mono', 'Multiplier (Klone)', 2600, Object.assign({ look: 'b_multi', bellShot: 'spike' }, B1));
defBoss('b2_sil', 'mono', 'Sil (Fabian)', 3200, Object.assign({ look: 'sil', bellShot: 'soul' }, B1));
defBoss('b2_dillan', 'stahlmann', 'Sergeant Dillan Wyte (Erde)', 3300, Object.assign({ look: 'b_dillan', bellShot: 'spike', armor: 5 }, B1));
const R_BASIS = { ghoul: 'e1_schueler', bat: 'e1_schueler', knight: 'e2_wache', witch: 'c4_agent', brute: 'e1_rowdy', captain: 'c4_wache' };
const R_DSCHUNGEL = { ghoul: 'e2_schnecke', bat: 'e2_schlange', knight: 'c3_panzer', witch: 'e2_ranke', brute: 'c3_koenig', captain: 'c3_koenigB' };
const R_KOEDER = { ghoul: 'e2_koeder', bat: 'e2_schlange', knight: 'e2_koeder', witch: 'e2_ranke', brute: 'c3_koenig', captain: 'c3_koenigB' };
const R_UNTER = { ghoul: 'e2_hund', bat: 'c2_flatter', knight: 'e2_hund', witch: 'e2_ranke', brute: 'c3_koenig', captain: 'c3_koenigB' };
const R_TURNIER = { ghoul: 'e2_klon', bat: 'e2_klon', knight: 'e2_klon', witch: 'e1_eis', brute: 'e2_klon', captain: 'c1_vier' };
const ETAPPE2 = {
  title: 'Die zweite Basis', place: 'Militärbasis 2 · oranger Planet · Basis 1', src: 'Kapitel 139–383', theme: 'basisnacht', ch: 4,
  levels: [
    { name: 'Der hungrige Ghul', type: 'duel', foe: 'b2_fex', crowd: 0.2, theme: 'basisnacht', roles: R_BASIS,
      text: 'Peter ist ausgehungert verschwunden. In einer dunklen Gasse fesselt ihn ein Fremder mit unsichtbaren Fäden – Fex Sanguini, ein echter Vampir. Finn greift im Sonnenanzug an.' },
    { name: 'Emma als Fäden-Puppe', type: 'duel', foe: 'b2_emma', crowd: 0.15, theme: 'basisnacht', roles: R_BASIS,
      text: 'Treffen auf dem Dach: Fex steckt Emma zwölf Nadeln in den Rücken und lenkt sie wie eine Puppe. Ihre Eisklinge tanzt eine fremde, wunderschöne Schwertkunst.' },
    { name: 'Leander im Mech-Anzug', type: 'duel', foe: 'b2_leander', crowd: 0.2, theme: 'akademie', roles: R_BASIS,
      text: 'Leander hat alles belauscht. Im selbstgebauten Nanobot-Anzug mit drei Kanonen stürmt er das Zimmer – er fühlt sich benutzt und will Antworten.' },
    { name: 'Truedreams Besuch', type: 'waveboss', at: 120, foe: 'b2_kenny', pace: 1.5, theme: 'basisnacht', roles: R_BASIS,
      text: 'Jack Truedream kommt, um armen Schülern die Fähigkeiten zu stehlen – Emma und Peter stehen auf seiner Liste. Maskiert stellt sich Finn seinem Wächter mit den Giftnadeln.' },
    { name: 'Der orange Planet', type: 'hunt', role: 'ghoul', n: 60, pace: 1.5, theme: 'bestienplanet', roles: R_DSCHUNGEL,
      text: 'Expedition auf einen schwülen Dschungelplaneten: Punkte für jede Bestie. Felsschnecken gelten als unknackbar – für einen Blood Hammer nicht.' },
    { name: 'Die Rankenbestie', type: 'waveboss', at: 100, foe: 'b2_ranken', pace: 1.6, theme: 'bestienplanet', roles: R_DSCHUNGEL,
      text: 'Eine Hochstufen-Bestie, groß wie ein Haus, packt Schüler mit sechs Ranken. Der Lehrer flieht. Finn, Peter und Fex holen die Verletzten raus.' },
    { name: 'Köder-Bestien im Regen', type: 'survive', dur: 180, pace: 1.8, theme: 'bestienplanet', roles: R_KOEDER,
      text: 'Es beginnt zu regnen, und das violette Gras erwacht: Köder-Bestien schießen aus dem Boden und verschlucken alles, was sich bewegt.' },
    { name: 'Die Stadt unter dem Berg', type: 'hunt', role: 'ghoul', n: 100, pace: 1.6, theme: 'burg', roles: R_UNTER, comp: ['fex'],
      text: 'Der Pflanzenmagen führt in Höhlen voller wachsender Kristalle – und zu einer uralten Stadt aus schwarzem Stein. Blinde Hunde mit Peitschenzungen bewachen den Turm.' },
    { name: 'Likmorn, König der Unterstadt', type: 'waveboss', at: 60, foe: 'b2_likmorn', pace: 1.6, theme: 'burg', roles: R_UNTER, comp: ['fex'],
      text: 'Eine Bestie aus Schlamm und Wurzeln, Skelette im Leib, Klingen aus grüner Jade: Likmorn, Königsstufe. Seine Arme wachsen nach – und im Rausch wird er noch gefährlicher.' },
    { name: 'Das Kampfturnier', type: 'duel', foe: 'b2_multi', crowd: 0.8, theme: 'goetter', roles: R_TURNIER,
      text: 'Turnier aller Basen unter der Glaskuppel. Als „Cursed Child“ tritt Finn gegen Multiplier an, der ein Dutzend Klone ruft und mit ihnen die Plätze tauscht.' },
    { name: 'Sil im Kerker', type: 'duel', foe: 'b2_sil', crowd: 0.1, theme: 'basisnacht', roles: R_BASIS,
      text: 'Die Freunde wollen Finn aus der Befreiung Peters heraushalten. Sil stellt sich ihm in den Weg – mit Feuerkuppel und Blitzen, die er sich eben erst geliehen hat.' },
    { name: 'Der Nachtdämon', type: 'waveboss', at: 150, foe: 'b2_dillan', pace: 1.6, theme: 'basisnacht', roles: R_BASIS,
      text: 'Maskiert als „Nachtdämon“ rächt Finn gemobbte Schüler. Dann schnappt die Falle zu: Sergeant Dillan Wyte, Erd-Fähigkeit und Rüstung der oberen Stufe.' },
    { name: 'General Duke', type: 'boss', at: 90, foe: 'c4_boss', pace: 1.5, theme: 'akademie', roles: R_BASIS,
      text: 'Vor der ganzen Schule fordert Duke den Nachtdämon heraus. Seine Seelenwaffe macht ihn zum Felsgolem. Finn darf nichts verraten – kein Schatten, kein Charme, nur Fäuste und Qi.' }
  ]
};

/* ------------------------------------------------------------ Etappe 3: Die Vampirsiedlung (Kapitel 384–534) */
defEnemy('e3_wendigo', 'ghoul', 'v_thrall', 'Wendigo', { hp: 22, spd: 72 });
defEnemy('e3_hase', 'ghoul', 'q_hase', 'Horn-Häschen', { hp: 9, spd: 86 });
defEnemy('e3_kroko', 'brute', 'q_fort', 'Krokodilschlange', { splits: 0, hp: 140 });
defEnemy('e3_deathbat', 'bat', 'bat_void', 'Deathbat', { hp: 30 });
defEnemy('e3_nachkomme', 'knight', 'v_ritter', 'Nachkomme der ersten Familie', { armor: 2 });
defEnemy('e3_schueler', 'ghoul', 'v_wache', 'Vampirschüler', { hp: 16 });
defEnemy('e3_fortuna', 'knight', 'v_ritter', 'Fortuna-Wächter (9. Familie)', { armor: 3 });
defEnemy('e3_blutmagier', 'witch', 'v_magier', 'Blutmagier', { shot: 'blood', flier: false });
defEnemy('e3_bande', 'ghoul', 'v_wache', 'Bande aus dem Armenviertel', { hp: 18 });
defEnemy('e3_schleim', 'witch', 'v_magier', 'Schleim-Vampir', { shot: 'acid', flier: false });
defEnemy('e3_wache', 'ghoul', 'v_wache', 'Wache der ersten Familie', { hp: 20 });
defEnemy('e3_ritter', 'knight', 'v_ritter', 'Ritter eines Anführers', { armor: 3 });
defEnemy('e3_hauptmann', 'captain', 'v_ritter', 'Vampirritter', { scale: 1.25, hp: 2200 });
defEnemy('e3_soldat', 'knight', 'h_wache', 'Soldat von Basis 2', { armor: 2 });
defEnemy('e3_erd', 'witch', 'h_truedream', 'Erd-Fähigkeitsnutzer', { shot: 'spike', flier: false });
defBoss('b3_boneclaw', 'blutsauger', 'Der Boneclaw', 60000, { model: 'boneclaw', bellShot: 'spike', r: 30, spd: 64 });
defBoss('b3_hase', 'blutsauger', 'Schwarzes Horn-Kaninchen (Familiar)', 2200, { model: 'hornhase', bellShot: 'soul', r: 26, spd: 80, scale: 1.3 });
defBoss('b3_clark', 'silva', 'Clark Talon (Vampirritter)', 3000, Object.assign({ look: 'b_clark', bellShot: 'blood' }, B1));
defBoss('b3_jin', 'silva', 'Jin Talon, vierter Anführer', 60000, Object.assign({ look: 'b_jin', bellShot: 'blood', spd: 56 }, B1));
defBoss('b3_edward', 'silva', 'Edward Eno (Nebel)', 3300, Object.assign({ look: 'b_edward', bellShot: 'soul' }, B1));
defBoss('b3_borden', 'dalki1', 'Borden, der Dalki-Klon', 3800, { model: 'borden', bellShot: 'spike', r: 30, scale: 0.85 });
defBoss('b3_vadeen', 'silva', 'Vadeen Muscat, sechster Anführer', 4600, Object.assign({ look: 'b_vadeen', bellShot: 'blood', armor: 4 }, B1));
defBoss('b3_paul', 'stahlmann', 'Hauptgeneral Paul Snealleart', 5200, Object.assign({ look: 'b_paul', bellShot: 'spike', armor: 5 }, B1));
const R_LABOR = { ghoul: 'e3_wendigo', bat: 'e3_wendigo', knight: 'e3_wendigo', witch: 'e3_wendigo', brute: 'c5_thrall', captain: 'c5_boneclaw' };
const R_WALD = { ghoul: 'e3_hase', bat: 'c5_fleder', knight: 'e3_hase', witch: 'e3_hase', brute: 'e3_kroko', captain: 'e3_kroko' };
const R_OEDLAND = { ghoul: 'c2_ratta', bat: 'e3_deathbat', knight: 'e3_nachkomme', witch: 'c2_spore', brute: 'c2_mutter', captain: 'c2_alpha' };
const R_TUNNEL = { ghoul: 'e3_fortuna', bat: 'c5_fleder', knight: 'e3_fortuna', witch: 'e3_blutmagier', brute: 'c5_thrall', captain: 'e3_hauptmann' };
const R_ZEHN = { ghoul: 'e3_bande', bat: 'c5_fleder', knight: 'e3_bande', witch: 'e3_schleim', brute: 'c5_thrall', captain: 'e3_hauptmann' };
const R_PLAZA = { ghoul: 'e3_wache', bat: 'c5_fleder', knight: 'e3_ritter', witch: 'e3_blutmagier', brute: 'c5_thrall', captain: 'e3_hauptmann' };
const R_INVASION = { ghoul: 'e3_wendigo', bat: 'c5_fleder', knight: 'e3_soldat', witch: 'e3_erd', brute: 'c5_thrall', captain: 'e3_hauptmann' };
const ETAPPE3 = {
  title: 'Die Vampirsiedlung', place: 'Enos Labor · Vampirschule · zehnte Burg · Plaza des Königs', src: 'Kapitel 384–534', theme: 'siedlung', ch: 5,
  levels: [
    { name: 'Das Labor im Berg', type: 'hunt', role: 'ghoul', n: 40, pace: 1.4, theme: 'burg', roles: R_LABOR, comp: ['fabian'],
      text: 'Das Würfelportal führt in ein dunkles Labor aus Glathrium. Ein Prüfungsroboter wirft Wendigos in die Zellen – gierige Untote, die nur sterben, wenn der Kopf fällt.' },
    { name: 'Die Brücke über dem Abgrund', type: 'endure', foe: 'b3_boneclaw', dur: 80, crowd: 0.7, theme: 'burg', roles: R_LABOR,
      text: 'Hunderte Wendigos an Wänden und Decke. Auf einer Brücke hält Finn die Horde auf, damit die anderen fliehen können. Dann kommt etwas, vor dem selbst die Wendigos zittern.' },
    { name: 'Das schwarze Horn-Kaninchen', type: 'duel', foe: 'b3_hase', crowd: 0.6, theme: 'friedhof', roles: R_WALD,
      text: 'Im Wald mit grauem Laub jagt eine Armee aus Häschen unter einem schwarzen Kaninchen mit Blitzhorn. Das System sagt: ein Familiar – und ein Sieg bringt ein ganzes Level.' },
    { name: 'Deathbats auf dem Ödland', type: 'hunt', role: 'bat', n: 30, pace: 1.5, theme: 'rotezone', roles: R_OEDLAND,
      text: 'Die Vampirprüfung der Nachkommen: zehn Deathbats pro Kopf, drei Tage Zeit. Ihre Schüsse hört man nicht. Und Siryus stiehlt jeden Kill, den er kriegen kann.' },
    { name: 'Clark Talon, Vampirritter', type: 'duel', foe: 'b3_clark', crowd: 0.25, theme: 'rotezone', roles: R_OEDLAND, evo: 'Vampiradliger',
      text: 'Der Boneclaw hat Finns dunkelsten Gedanken wahr gemacht. Clarks Rabe hat alles gesehen – und der Ausbilder erkennt den Schatten der Punisher. Sein Blut explodiert auf Fingerschnipp.' },
    { name: 'Flucht durch die Tunnel', type: 'survive', dur: 170, pace: 1.55, theme: 'burg', roles: R_TUNNEL, comp: ['peter'],
      text: 'Unter den Burgen spürt Peter Finns neue Kraft. Er zerreißt seine Ketten und erweckt die toten Wächter als kleine Wights. Jetzt muss er einen Weg durch die Tunnel der neunten Familie finden.' },
    { name: 'Jin Talon, vierter Anführer', type: 'endure', foe: 'b3_jin', dur: 75, crowd: 0.2, theme: 'burg', roles: R_TUNNEL, comp: ['peter'],
      text: 'Ein Anführer mit Narbe und Rundschild stellt die beiden. Sein Schild regnet explodierendes Blut. Das System rät nur eins: Halte durch und flieh – gegen einen Anführer hast du keine Chance.' },
    { name: 'Der Nebel der zehnten Burg', type: 'duel', foe: 'b3_edward', crowd: 0.1, theme: 'siedlung', roles: R_ZEHN, comp: ['peter'],
      text: 'Die zehnte Burg leuchtet kurz auf und erlischt. In der Halle schlägt ein unsichtbarer Riesenkopf aus Nebel zu – der letzte Ritter der Familie bewacht das Erbe.' },
    { name: 'Blut für die Zehnten', type: 'survive', dur: 180, pace: 1.6, theme: 'siedlung', roles: R_ZEHN, elites: 3,
      text: 'Mit einer Kühlkiste voller Blutbeutel zieht Finn durch das verfallene Viertel der zehnten Familie. Eine Bande will die Kiste – ein Schleim-Vampir klebt ihn am Boden fest.' },
    { name: 'Borden, der Klon', type: 'duel', foe: 'b3_borden', crowd: 0.1, theme: 'siedlung', roles: R_ZEHN,
      text: 'Etwas schlägt im Burggarten ein wie ein Meteor: ein Dalki mit Schuppen und Stachel, der Fabian verblüffend ähnlich sieht. Finn wirft ihm die Blutkiste entgegen.' },
    { name: 'Die Hinrichtung', type: 'hunt', role: 'ghoul', n: 120, pace: 1.7, theme: 'siedlung', roles: R_PLAZA, comp: ['fabian', 'lena'],
      text: 'Auf der Plaza vor dem Königsschloss soll Fex ausbluten. Eine Blutkuppel schließt alle ein, zweihundert Wachen halten sie aufrecht. Sie fällt erst, wenn die Wachen fallen.' },
    { name: 'Vadeen Muscat', type: 'waveboss', at: 90, foe: 'b3_vadeen', pace: 1.6, theme: 'siedlung', roles: R_PLAZA, comp: ['agathon'],
      text: 'Agathon tritt aus dem Schatten und die Anführer erstarren. Vadeen, der sechste Anführer, legt unsichtbare Fallen-Marken und will Finn zu Boden prügeln.' },
    { name: 'Die Invasion der Menschen', type: 'boss', at: 100, foe: 'b3_paul', pace: 1.6, theme: 'friedhof', roles: R_INVASION, comp: ['leo', 'emma'],
      text: 'Zweihundert Soldaten von Basis 2 stranden in der Vampirwelt. Als Beweis seiner Treue soll Finn sie unterwerfen. Ihr Hauptgeneral presst Felsen zu schwarzen Kugeln, die sogar Dalki-Haut durchschlagen.' }
  ]
};

/* ------------------------------------------------------------ Etappe 4: Die Verfluchten (Kapitel 535–668) */
defEnemy('e4_hypo', 'ghoul', 'q_fort', 'Hypocen', { hp: 26, spd: 52 });
defEnemy('e4_pomplee', 'ghoul', 'q_hase', 'Pomplee', { hp: 12, spd: 60 });
defEnemy('e4_kaefer', 'bat', 'bat_aas', 'Kakuen-Käfer', { hp: 24 });
defEnemy('e4_hoehle', 'ghoul', 'q_caladi', 'Höhlenbestie', { hp: 22 });
defEnemy('e4_kristall', 'knight', 'q_panzer', 'Kristallpanzer', { armor: 3 });
defEnemy('e4_graylash', 'knight', 'h_wache', 'Graylash-Schüler', { armor: 2 });
defEnemy('e4_blitz', 'witch', 'h_truedream', 'Blitznutzer', { shot: 'light', flier: false });
defEnemy('e4_altum', 'captain', 'h_wache', 'Graylash-Anführer', { scale: 1.25, hp: 2400 });
defEnemy('e4_sun', 'ghoul', 'h_sunshield', 'Sunshield-Fußvolk', { hp: 22 });
defEnemy('e4_sunR', 'knight', 'h_sunshield', 'Sunshield-Elite', { armor: 3 });
defEnemy('e4_feuer', 'witch', 'h_pure', 'Feuernutzer', { shot: 'bell', flier: false });
defEnemy('e4_trupp', 'captain', 'h_sunshield', 'Sunshield-Zugführer', { scale: 1.25, hp: 2600 });
defEnemy('e4_tentakel', 'ghoul', 'q_void', 'Augenloser Tentakelhund', { hp: 24, spd: 78 });
defEnemy('e4_insel', 'knight', 'q_panzer', 'Inselbestie', { armor: 3 });
defEnemy('e4_katze', 'brute', 'q_koenig', 'Zweikiefer-Katze', { splits: 0, hp: 170 });
defEnemy('e4_dorf', 'knight', 'h_blade', 'Dorfkrieger der Blades', { armor: 3 });
defEnemy('e4_dorfL', 'ghoul', 'h_blade', 'Blade-Diener', { hp: 24 });
defEnemy('e4_chained', 'witch', 'h_seherin', 'Kopierte Fähigkeit', { shot: 'soul', flier: false });
defEnemy('e4_brock', 'captain', 'h_blade', 'Blade-Veteran', { scale: 1.3, hp: 3000 });
defBoss('b4_linda', 'mono', 'Linda (Rang B)', 60000, Object.assign({ look: 'b_linda', bellShot: 'soul', spd: 70 }, B1));
defBoss('b4_hypolord', 'krabbe', 'Hypolord (Advanced)', 4200, { model: 'hypolord', bellShot: 'acid', r: 42 });
defBoss('b4_hundR', 'krabbe', 'Roter King-Hund', 5000, { model: 'hundR', bellShot: 'spike', r: 40 });
defBoss('b4_hundS', 'krabbe', 'Schwarzer King-Hund', 6500, { model: 'hundS', bellShot: 'spike', r: 40 });
defBoss('b4_lemon', 'mono', 'Lemon (Graylash-Schüler)', 2800, Object.assign({ look: 'b_lemon', bellShot: 'light', spd: 66 }, B1));
defBoss('b4_gox', 'stahlmann', 'Gox, Kommandant der Sunshields', 6200, Object.assign({ look: 'b_gox', bellShot: 'bell', armor: 4 }, B1));
defBoss('b4_kiln', 'silva', 'Kiln und Tupple (Adlige)', 4200, Object.assign({ look: 'b_kiln', bellShot: 'blood' }, B1));
defBoss('b4_borden', 'dalki1', 'Borden (drei Stacheln)', 60000, { model: 'borden3', bellShot: 'spike', r: 30 });
defBoss('b4_chrimeta', 'kronker', 'Chrimeta (Emperor-Tier)', 9000, { model: 'chrimeta', bellShot: 'bell', r: 46 });
defBoss('b4_twins', 'erin', 'Vicky und Pai Blade', 60000, Object.assign({ look: 'b_vicky', bellShot: 'soul', spd: 70 }, B1));
defBoss('b4_twinsF', 'erin', 'Vicky und Pai Blade', 9500, Object.assign({ look: 'b_vicky', bellShot: 'soul', spd: 66 }, B1));
const R_FLUSS = { ghoul: 'e4_hypo', bat: 'c3_aas', knight: 'e4_hypo', witch: 'c3_spucker', brute: 'c3_koenig', captain: 'c3_koenigB' };
const R_WIESE = { ghoul: 'e4_pomplee', bat: 'e4_kaefer', knight: 'e4_pomplee', witch: 'c2_spore', brute: 'c2_mutter', captain: 'c2_alpha' };
const R_BERG = { ghoul: 'e4_hoehle', bat: 'c3_aas', knight: 'e4_kristall', witch: 'c3_spucker', brute: 'c3_koenig', captain: 'c3_koenigB' };
const R_EAGLES = { ghoul: 'e4_graylash', bat: 'e4_graylash', knight: 'e4_graylash', witch: 'e4_blitz', brute: 'e4_graylash', captain: 'e4_altum' };
const R_SUN = { ghoul: 'e4_sun', bat: 'e4_sun', knight: 'e4_sunR', witch: 'e4_feuer', brute: 'e4_sunR', captain: 'e4_trupp' };
const R_INSEL = { ghoul: 'e4_tentakel', bat: 'c3_aas', knight: 'e4_insel', witch: 'c3_spucker', brute: 'e4_katze', captain: 'c3_koenigB' };
const R_DORF = { ghoul: 'e4_dorfL', bat: 'e4_dorfL', knight: 'e4_dorf', witch: 'e4_chained', brute: 'e4_dorf', captain: 'e4_brock' };
const ETAPPE4 = {
  title: 'Die Verfluchten', place: 'Crows · Eagles-Basis · Blade-Insel', src: 'Kapitel 535–668', theme: 'ruinen', ch: 6,
  levels: [
    { name: 'Die Aufnahmeprüfung der Crows', type: 'endure', foe: 'b4_linda', dur: 60, crowd: 0.15, theme: 'basisnacht', roles: R_EAGLES,
      text: 'Die Basis liegt in Trümmern, der Bürgerkrieg hat begonnen. Finn tarnt sich als Reisender mit Tempo-Fähigkeit und bewirbt sich bei den Crows. Im Sparring wartet Linda, Blips Schwester – und Finn darf nicht zeigen, was er kann.' },
    { name: 'Der Hypolord', type: 'waveboss', at: 110, foe: 'b4_hypolord', pace: 1.5, theme: 'rotezone', roles: R_FLUSS, comp: ['fex'],
      text: 'Erste Jagd auf einem roten Flussplaneten. Fex angelt Hypocen mit seinen Fäden aus dem Wasser. Dann bricht der Hypolord aus dem Fluss – und Freddy, der gute Kartenhändler, kommt nicht mehr heim.' },
    { name: 'Käfer auf der Pomplee-Wiese', type: 'hunt', role: 'bat', n: 26, pace: 1.5, theme: 'bestienplanet', roles: R_WIESE, comp: ['fex'],
      text: 'Wo die flauschigen Pomplees grasen, schlüpfen springende Käfer. Die Sonne brennt, die Ringe werden leer – und Suze, die neue Fünfte im Team, soll eigentlich spionieren.' },
    { name: 'Der rote King-Hund', type: 'waveboss', at: 90, foe: 'b4_hundR', pace: 1.6, theme: 'burg', roles: R_BERG, comp: ['sam'],
      text: 'Unter dem schwarzen Berg schläft ein King-Tier: ein Hund mit Keulenschwanz, die Kristalle pulsieren mit seinem Atem. Kong schickt ein Mädchen als Köder vor. Finn geht mit.' },
    { name: 'Der schwarze King-Hund', type: 'duel', foe: 'b4_hundS', crowd: 0.3, theme: 'burg', roles: R_BERG, comp: ['sam'],
      text: 'Der Gefährte heult über den toten Hund und rollt als Stachelkugel durch die Höhle. Seine Rückenstacheln fliegen wie Geschosse. Jetzt hilft nur noch der Hammer-Hook.' },
    { name: 'Sparring bei den Eagles', type: 'duel', foe: 'b4_lemon', crowd: 0.35, theme: 'basisnacht', roles: R_EAGLES,
      text: 'Die Graylash zeigen bei den Eagles ihre Macht: Sparring bis kurz vor den Tod. Finn meldet sich freiwillig – ohne Schatten, nur mit Phantomschlägen.' },
    { name: 'Die Sunshields greifen an', type: 'survive', dur: 180, pace: 1.7, theme: 'schlachtfeld', roles: R_SUN, elites: 3,
      text: 'Laserschiffe beschießen den Shelter, hundert Elitekrieger in dunkelroter Rüstung landen. Feuer gegen Blitz – und mittendrin Zivilisten, die zum Teleporter müssen.' },
    { name: 'Twin Tail Chain', type: 'waveboss', at: 140, foe: 'b4_gox', pace: 1.7, theme: 'schlachtfeld', roles: R_SUN, comp: ['sam', 'fex'],
      text: 'Die Crows sind von zweihundert auf sechzig geschrumpft. Finn steigt allein aus dem Schatten in der Mitte der Plaza: Seine Seelenwaffe erwacht – zwei Knochenketten, die mit jedem Treffer Blut trinken.' },
    { name: 'Kiln und Tupple', type: 'duel', foe: 'b4_kiln', crowd: 0.15, theme: 'schlachtfeld', roles: R_SUN,
      text: 'Bryce schickt zwei Adlige, die offene Blutjagden veranstalten sollen – der Zehnte soll die Schuld bekommen. Paul stellt sich schützend vor einen alten Mann und wird zerfetzt. Finn spürt es über das Blutband.' },
    { name: 'Die Blade-Insel', type: 'hunt', role: 'ghoul', n: 60, pace: 1.6, theme: 'bestienplanet', roles: R_INSEL, comp: ['peter', 'leander'],
      text: 'Ein Seeungeheuer schlägt das U-Boot wie einen Ball auf die Insel. Im Dschungel lauern King-Tiere: Zweikiefer-Katzen und augenlose Tentakelhunde.' },
    { name: 'Zehn Minuten gegen Borden', type: 'endure', foe: 'b4_borden', dur: 90, crowd: 0.1, theme: 'bestienplanet', roles: R_INSEL,
      text: 'Borden hat auf der Insel gegen King-Tiere trainiert. „Besiege mich, dann komme ich mit.“ Jeder seiner Schläge frisst Schatten – halte durch, bis seine Dalki-Form erlischt.' },
    { name: 'Chrimeta im Vulkan', type: 'duel', foe: 'b4_chrimeta', crowd: 0.2, theme: 'roterhimmel', roles: R_INSEL,
      text: 'Auf einer Brücke über Lavaseen erwacht ein Emperor-Tier: vier Meter, goldene Mähne, Dutzende gelbe Augen und drei Schlangenschwänze, die Feuer spucken.' },
    { name: 'Die Blade-Zwillinge', type: 'endure', foe: 'b4_twins', dur: 80, crowd: 0.3, theme: 'bestienplanet', roles: R_DORF, comp: ['fabian'],
      text: 'Vicky und Pai fassen sich an den Händen und teilen ihre Kräfte – fast so stark wie Hilston. Das System gibt nur ein Ziel vor: Überlebe die Begegnung.' },
    { name: 'Rette sie', type: 'boss', at: 60, foe: 'b4_twinsF', pace: 1.7, theme: 'bestienplanet', roles: R_DORF, berserk: true, comp: ['sil'],
      text: 'Finn trinkt von den Dorfkriegern und wird zum wahnsinnigen Bloodsucker. Fabian und Raten verabschieden sich lächelnd – Sil bleibt allein zurück und bändigt die Wasserhose, damit das Schiff entkommt.' }
  ]
};

/* ------------------------------------------------------------ Etappe 5: Bürgerkrieg (Kapitel 669–808) */
defEnemy('e5_sand', 'ghoul', 'q_caladi', 'Sandkriecher', { hp: 28 });
defEnemy('e5_panzer', 'knight', 'q_panzer', 'Wüstenpanzer', { armor: 4 });
defEnemy('e5_neunauge', 'witch', 'q_kroete', 'Neunaugen-Mantis', { shot: 'acid', flier: false });
defEnemy('e5_glut', 'ghoul', 'q_orange', 'Glutbestie', { hp: 28 });
defEnemy('e5_feuerkroete', 'witch', 'q_kroete', 'Feuerspucker', { shot: 'bell', flier: false });
defEnemy('e5_kapuze', 'ghoul', 'h_truedream', 'Vergifteter Kapuzenmann', { hp: 34, spd: 62 });
defEnemy('e5_parasit', 'knight', 'h_wache', 'Parasites-Kämpfer', { armor: 3 });
defEnemy('e5_gift', 'witch', 'h_pure', 'Giftnutzer', { shot: 'acid', flier: false });
defEnemy('e5_mune', 'brute', 'h_koloss', 'Mune (Riesenkraft)', { splits: 0, hp: 220 });
defEnemy('e5_hana', 'captain', 'h_wache', 'Hana (Wind)', { scale: 1.2, hp: 2800 });
defEnemy('e5_bs', 'ghoul', 'v_thrall', 'Süchtiger Bloodsucker', { hp: 30, spd: 78 });
defEnemy('e5_bsR', 'knight', 'v_ritter', 'Bloodsucker mit Verstand', { armor: 4 });
defEnemy('e5_bsRiese', 'captain', 'v_thrall', 'Riesen-Bloodsucker', { scale: 1.4, hp: 3200 });
defEnemy('e5_pure', 'ghoul', 'h_pure', 'Pure-Kämpfer', { hp: 28 });
defEnemy('e5_pureN', 'knight', 'h_pure', 'Nummern-Agent', { armor: 4 });
defEnemy('e5_qi', 'witch', 'h_pure', 'Qi-Nutzer', { shot: 'light', flier: false });
defEnemy('e5_narbe', 'captain', 'h_pure', 'Narbengesicht', { scale: 1.25, hp: 3000 });
defEnemy('e5_krabbe', 'knight', 'q_panzer', 'Diamantkrabbe (Emperor)', { armor: 5, hp: 60 });
defEnemy('e5_krabbeK', 'ghoul', 'q_panzer', 'Kleine Diamantkrabbe', { hp: 30, armor: 2 });
defEnemy('e5_lanze', 'bat', 'bat_licht', 'Lanzenschnabel', { hp: 30 });
defEnemy('e5_innen', 'ghoul', 'q_caladi', 'Bestie der Innenwelt', { hp: 32 });
defBoss('b5_sand', 'krabbe', 'Sand Ruler (Emperor)', 6500, { model: 'sandruler', bellShot: 'spike', r: 44 });
defBoss('b5_feuerstein', 'kronker', 'Feuer-Stein-Bestie (Emperor)', 7000, { model: 'feuerstein', bellShot: 'bell', r: 44 });
defBoss('b5_mantis', 'mono', 'Mantis (Gifthand)', 5400, Object.assign({ look: 'b_mantis', bellShot: 'acid' }, B1));
defBoss('b5_rowa', 'silva', 'Rowa, gefallener Königsritter', 60000, Object.assign({ look: 'b_rowa', bellShot: 'blood', spd: 70 }, B1));
defBoss('b5_helen', 'cindy', 'Helen (Daisy)', 6000, Object.assign({ look: 'b_helen', bellShot: 'spike' }, B1));
defBoss('b5_tulk', 'stahlmann', 'Tulk, Fareen und Kubo', 6400, Object.assign({ look: 'b_tulk', bellShot: 'spike', armor: 5 }, B1));
defBoss('b5_lucy', 'erin', 'Lucy, Agent Fünf', 6800, Object.assign({ look: 'b_lucy', bellShot: 'light', spd: 72 }, B1));
defBoss('b5_krabbe', 'krabbe', 'Diamant-Krabbe (Demon-Tier)', 60000, { model: 'krabbe', bellShot: 'spike', r: 60, scale: 1.4 });
defBoss('b5_chris', 'mono', 'Chris, Meister des Qi', 7200, Object.assign({ look: 'chris', bellShot: 'light', spd: 74 }, B1));
defBoss('b5_hilston', 'hagon', 'Hilston Blade', 60000, Object.assign({ look: 'b_hilston', bellShot: 'bell', spd: 70 }, B1));
defBoss('b5_krabbeF', 'krabbe', 'Diamant-Krabbe (schwer verwundet)', 13000, { model: 'krabbe', bellShot: 'spike', r: 60, scale: 1.4 });
const R_NEU = { ghoul: 'e5_sand', bat: 'c3_aas', knight: 'e5_panzer', witch: 'e5_neunauge', brute: 'c3_koenig', captain: 'c3_koenigB' };
const R_GLUT = { ghoul: 'e5_glut', bat: 'c2_flatter', knight: 'e5_panzer', witch: 'e5_feuerkroete', brute: 'c3_koenig', captain: 'c3_koenigB' };
const R_PARA = { ghoul: 'e5_kapuze', bat: 'e5_kapuze', knight: 'e5_parasit', witch: 'e5_gift', brute: 'e5_mune', captain: 'e5_hana' };
const R_ROWA = { ghoul: 'e5_bs', bat: 'c5_fleder', knight: 'e5_bsR', witch: 'e3_blutmagier', brute: 'c5_thrall', captain: 'e5_bsRiese' };
const R_PURE = { ghoul: 'e5_pure', bat: 'e5_pure', knight: 'e5_pureN', witch: 'e5_qi', brute: 'e5_pureN', captain: 'e5_narbe' };
const R_DEMON = { ghoul: 'e5_krabbeK', bat: 'e5_lanze', knight: 'e5_krabbe', witch: 'c3_spucker', brute: 'c3_koenig', captain: 'c3_koenigB' };
const R_INNEN = { ghoul: 'e5_innen', bat: 'e5_lanze', knight: 'e4_insel', witch: 'c3_spucker', brute: 'e4_katze', captain: 'c3_koenigB' };
const ETAPPE5 = {
  title: 'Bürgerkrieg', place: 'Neuland · Parasites · zehnte Burg · Dämonen-Planet', src: 'Kapitel 669–808', theme: 'schlachtfeld', ch: 7,
  levels: [
    { name: 'Der Sand Ruler', type: 'waveboss', at: 100, foe: 'b5_sand', pace: 1.6, theme: 'caladi', roles: R_NEU, comp: ['fex', 'sil'],
      text: 'Im Neuland jagt die Gruppe Emperor-Tiere für eine eigene Rüstung. Aus dem Sand wächst ein Riese aus Knochen, dreistöckig, mit einem Wurmhals und Saugmaul. Und dann taucht ein zweiter auf.' },
    { name: 'Die Feuer-Stein-Bestie', type: 'duel', foe: 'b5_feuerstein', crowd: 0.3, theme: 'roterhimmel', roles: R_GLUT,
      text: 'Allein, ohne Rücksicht auf fremde Blicke: Finn jagt an den Dampfspalten nach Feuerkristallen für seine Handschuhe. Karte und Uhr versagen – nur die Bestie weiß, wo er ist.' },
    { name: 'Das Duell mit den Parasites', type: 'duel', foe: 'b5_mantis', crowd: 0.4, theme: 'ruinen', roles: R_PARA, comp: ['fex', 'sil'],
      text: 'Graylash und Daisy schauen zu. Mantis verliert das Duell um den Planeten – aber seine Gifthand hat jeden berührt, der gegen ihn angetreten ist.' },
    { name: 'Mantis’ Gift', type: 'survive', dur: 180, pace: 1.8, theme: 'ruinen', roles: R_PARA, comp: ['sil'], elites: 3,
      text: 'Dennis spuckt Blut, Fex und Sil krümmen sich. Finn sprengt mit dem Bluthammer das Tor der Parasites. Hinter ihm: Kapuzenmänner ohne Schmerz, mit Riesenkraft – Mantis’ Gift hat sie so gemacht.' },
    { name: 'Nacht der Bloodsucker', type: 'hunt', role: 'ghoul', n: 140, pace: 1.7, theme: 'siedlung', roles: R_ROWA, comp: ['leo', 'emma'],
      text: 'In der Vampirwelt fallen süchtige Bloodsucker mit Verstand über die zehnte Burg her. Die Hälfte der Familie stirbt in einer Nacht. Leo und Emma stellen sich vor die Schüler.' },
    { name: 'Rowa', type: 'endure', foe: 'b5_rowa', dur: 80, crowd: 0.4, theme: 'siedlung', roles: R_ROWA, comp: ['leo', 'emma'],
      text: 'Ihr Anführer war einst Königsritter und ein Wunderkind. „Gebt mir das Mädchen.“ Edward stellt sich ihm allein. Haltet durch, bis der König in seiner schwarzen Rüstung erscheint.' },
    { name: 'Hundert Mann von Pure', type: 'survive', dur: 180, pace: 1.8, theme: 'schlachtfeld', roles: R_PURE, elites: 3,
      text: 'Live vor der Kamera von Bonny wählt Finn einen Pure-Planeten als Bühne. Hundert Mann kommen, angeführt von einem Narbengesicht, das alle Zeugen töten will. Finn nimmt nur die Fäuste.' },
    { name: 'Die Daisy-Schwestern', type: 'duel', foe: 'b5_helen', crowd: 0.35, theme: 'goetter', roles: R_PURE, comp: ['fex', 'peter'],
      text: 'Das Turnier der drei neuen Mächte auf dem Dämonen-Planeten. Die Daisy-Schwestern säen Pflanzen, die Dornen wie Kugeln schießen. Helens Dornenpeitsche reißt jeden zu sich heran.' },
    { name: 'Tulk, Fareen und Kubo', type: 'duel', foe: 'b5_tulk', crowd: 0.3, theme: 'goetter', roles: R_PURE,
      text: 'Pures Team B trägt Legendary-Rüstungen. „Gibt es Regeln für versehentliche Tode?“ Schattenschloss, Qi-Hammer, Schattenpfad – die Welt draußen hält die Gegner danach für schwach.' },
    { name: 'Lucy, Agent Fünf', type: 'duel', foe: 'b5_lucy', crowd: 0.1, theme: 'goetter', roles: R_PURE,
      text: 'Lenas Mutter hat Peter mit einem Qi-Stoß den Arm genommen. Ihre Klinge schneidet, ohne zu berühren, und ihre Wunden heilt kein Blut. Sie teilt sogar den Schatten wie Wolken.' },
    { name: 'Die Diamant-Krabbe', type: 'endure', foe: 'b5_krabbe', dur: 100, crowd: 0.8, theme: 'goetter', roles: R_DEMON, comp: ['sil', 'fex'],
      text: 'Die gemeinsame Jagd auf den Dämonen: eine Krabbe mit einem hotelgroßen Diamantrücken und sechzehn Stechbeinen. Sie wirft Hunderte kleiner Krabben ab – jede davon ein Emperor-Tier.' },
    { name: 'Die Welt im Planeten', type: 'hunt', role: 'ghoul', n: 70, pace: 1.7, theme: 'bestienplanet', roles: R_INNEN, comp: ['chris'],
      text: 'Finn stürzt durch eine Spalte in eine zweite Welt mitten im Planeten: Hügel, Seen und ein Himmel aus blauem Kristall. Am Wasserfall wartet ein Mann mit roter Mähne und Kettenklingen.' },
    { name: 'Meister gegen Schüler', type: 'duel', foe: 'b5_chris', crowd: 0, theme: 'bestienplanet', roles: R_INNEN,
      text: 'Chris lehrt Finn die zweite Qi-Stufe: Qi blitzschnell im Körper umverteilen. Zum Abschluss die letzte Prüfung – ein Duell ohne Schatten und ohne Blut.' },
    { name: 'Hilston Blade', type: 'endure', foe: 'b5_hilston', dur: 90, crowd: 0.4, theme: 'goetter', roles: R_DORF, comp: ['agathon'],
      text: 'Oben liegen alle Jäger tot. Hilston steigt herab, bricht Duke das Genick und will den Dämonenkristall. Kein Quest, keine Chance – bis Finns Schatten Agathon ruft.' },
    { name: 'Der Dämonenkristall', type: 'boss', at: 80, foe: 'b5_krabbeF', pace: 1.7, theme: 'goetter', roles: R_DEMON, comp: ['agathon'], evo: 'Vampirlord',
      text: 'Ohne Schatten, ohne Ausdauer, mit fünf Leben: Finn rennt den Scherenarm der Krabbe hinauf. Aus ihrem Kristall wächst die Evolution – zum Vampirlord.' }
  ]
};

/* ------------------------------------------------------------ Etappe 6: Kampf um den Thron (Kapitel 809–945) */
defEnemy('e6_sub', 'knight', 'v_ritter', 'Gebrochene Subklasse', { armor: 4 });
defEnemy('e6_banshee', 'witch', 'v_magier', 'Gefangene Banshee', { shot: 'soul', flier: false });
defEnemy('e6_garde', 'ghoul', 'v_wache', 'Königsgarde', { hp: 32 });
defEnemy('e6_ritterK', 'knight', 'v_ritter', 'Königsritter', { armor: 5 });
defEnemy('e6_blut', 'witch', 'v_magier', 'Blutkontrolleur', { shot: 'blood', flier: false });
defEnemy('e6_hauptK', 'captain', 'v_ritter', 'Ritter eines Leaders', { scale: 1.3, hp: 3800 });
defEnemy('e6_leucht', 'ghoul', 'q_hase', 'Leuchtwesen', { hp: 28, spd: 84 });
defEnemy('e6_irrlicht', 'bat', 'bat_licht', 'Irrlicht der Vertrautenwelt', { hp: 30 });
defEnemy('e6_hirsch', 'knight', 'q_panzer', 'Riesengeweih-Hirsch', { armor: 4 });
defEnemy('e6_pilz', 'witch', 'q_spore', 'Pilzspucker', { shot: 'soul', flier: false });
defEnemy('e6_riese', 'brute', 'q_koenig', 'Einäugiger Riese', { splits: 0, hp: 240 });
defEnemy('e6_acht', 'ghoul', 'v_wache', 'Krieger der 8. Familie', { hp: 32 });
defEnemy('e6_wahn', 'ghoul', 'v_thrall', 'Wahnsinniger der 8. Familie', { hp: 30, spd: 82 });
defEnemy('e6_noble', 'knight', 'v_ritter', 'Adliger der 8. Familie', { armor: 5 });
defEnemy('e6_telepath', 'witch', 'v_magier', 'Telepath', { shot: 'soul', flier: false });
defEnemy('e6_tifu', 'captain', 'v_ritter', 'Tifu, Ritter der 8. Familie', { scale: 1.3, hp: 3800 });
defBoss('b6_bryce', 'silva', 'Bryce Cane, erster Leader', 8200, Object.assign({ look: 'b_bryce', bellShot: 'blood', armor: 4 }, B1));
defBoss('b6_amber', 'silva', 'Amber, Ritterin der 8. Familie', 6800, Object.assign({ look: 'b_amber', bellShot: 'soul', spd: 72 }, B1));
defBoss('b6_leader', 'silva', 'Suzan, Kyle, Jin und Prima', 60000, Object.assign({ look: 'b_suzan', bellShot: 'blood', spd: 70 }, B1));
defBoss('b6_ovinnik', 'krabbe', 'Ovinnik, Herrin des Gebiets', 7800, { model: 'ovinnik', bellShot: 'soul', r: 40 });
defBoss('b6_remus', 'silva', 'Remus Snacker, achter Original', 9800, Object.assign({ look: 'b_remus', bellShot: 'blood', spd: 70 }, B1));
defBoss('b6_cindy', 'cindy', 'Cindy in der Königsrüstung', 60000, Object.assign({ look: 'b_cindyR', bellShot: 'blood' }, B1));
defBoss('b6_cindyF', 'cindy', 'Cindy in der Königsrüstung', 11500, Object.assign({ look: 'b_cindyR', bellShot: 'blood' }, B1));
const R_KERKER = { ghoul: 'e3_wendigo', bat: 'c5_fleder', knight: 'e6_sub', witch: 'e6_banshee', brute: 'c5_thrall', captain: 'c5_boneclaw' };
const R_KOENIG = { ghoul: 'e6_garde', bat: 'c5_fleder', knight: 'e6_ritterK', witch: 'e6_blut', brute: 'c5_thrall', captain: 'e6_hauptK' };
const R_VERTRAUT = { ghoul: 'e6_leucht', bat: 'e6_irrlicht', knight: 'e6_hirsch', witch: 'e6_pilz', brute: 'e6_riese', captain: 'c3_koenigB' };
const R_JILL = { ghoul: 'e6_acht', bat: 'c5_fleder', knight: 'e6_noble', witch: 'e6_telepath', brute: 'c5_thrall', captain: 'e6_tifu' };
const R_WAHN = { ghoul: 'e6_wahn', bat: 'c5_fleder', knight: 'e6_noble', witch: 'e6_telepath', brute: 'e5_bsRiese', captain: 'e6_tifu' };
const ETAPPE6 = {
  title: 'Kampf um den Thron', place: 'Vampirsiedlung · 14. Schloss · Vertrautenwelt', src: 'Kapitel 809–945', theme: 'burg', ch: 8,
  levels: [
    { name: 'Das Gefängnis im 14. Schloss', type: 'survive', dur: 170, pace: 1.8, theme: 'burg', roles: R_KERKER, comp: ['sil'],
      text: 'Der König ist tot, die Wahl beginnt. Muka führt Finn durch die Tunnel ins verlassene Schloss der Punisher – heute ein Gefängnis für alles, was keiner bändigen kann: gebrochene Subklassen und eine Armee Wendigos.' },
    { name: 'Bryce Cane', type: 'duel', foe: 'b6_bryce', crowd: 0.15, theme: 'burg', roles: R_KOENIG,
      text: 'Maskiert schleicht Finn ins erste Schloss. Bryce greift sofort an. Sein Stockschwert schmilzt zu einem Raum aus Blut, in dem jede Klinge abprallt und dabei wächst.' },
    { name: 'Die Höhle hinter dem Wasserfall', type: 'hunt', role: 'ghoul', n: 80, pace: 1.8, theme: 'friedhof', roles: R_ROWA, comp: ['leo'],
      text: 'Ham, der geflügelte Stier, führt die Retter zu Fex. Leo teilt mit einem Hieb den Wasserfall. Dahinter: Hütten voller leerer Blutbeutel und die Bloodsucker, die sie trinken.' },
    { name: 'Die Vermummte', type: 'duel', foe: 'b6_amber', crowd: 0.2, theme: 'friedhof', roles: R_ROWA, comp: ['leo'],
      text: 'Eine vermummte Vampirin hat Fex wochenlang Blut abgezapft. „Wir haben schon, was wir brauchten.“ Unter der Kapuze: eine Ritterin der achten Familie.' },
    { name: 'Flucht aus dem Königsschloss', type: 'survive', dur: 160, pace: 1.9, theme: 'burg', roles: R_KOENIG, elites: 4,
      text: 'Dwight liegt gepfählt im Thronsaal, und alle halten Finn für den Mörder. Königsgarde, Ritter und Leader stellen sich ihm in den Weg. Quest: Flucht.' },
    { name: 'Vier Leader', type: 'endure', foe: 'b6_leader', dur: 75, crowd: 0.3, theme: 'burg', roles: R_KOENIG,
      text: 'Suzans rote Nadel versiegelt den Schatten, Kyles Umhang schluckt Qi, Jins Explosionen fressen Kraft, und Prima wird mit jedem Treffer schneller. Fünf Leben, leere Blutbank – halte durch.' },
    { name: 'Die Welt der Vertrauten', type: 'hunt', role: 'bat', n: 40, pace: 1.8, theme: 'himmel', roles: R_VERTRAUT, comp: ['leo', 'fex'],
      text: 'Ein Riss führt in die Parallelwelt der Vertrauten: grünblauer Himmel, Riesenpilze und Millionen Leuchtkugeln. Diese Welt frisst Lebensenergie – wer hier trödelt, wird schwach.' },
    { name: 'Ovinnik', type: 'duel', foe: 'b6_ovinnik', crowd: 0.3, theme: 'himmel', roles: R_VERTRAUT, comp: ['leo'],
      text: 'Eine fette schwarze Katze mit roter Schlitzmarke herrscht über dieses Gebiet. Sie ist klug, trickreich und spürt jedes Verlangen nach Stärke – und sie will es prüfen.' },
    { name: 'Die Türme des Zehnten', type: 'survive', dur: 200, pace: 2.0, theme: 'siedlung', roles: R_JILL, comp: ['peter', 'emma'], elites: 4,
      text: 'Jill marschiert mit fünfhundert Mann auf die zehnte Burg. Finn steuert aus der Zelle heraus Türme und Gargoyles. Paul, Peter und Emma halten das Tor. Jede Zahl auf der Karte ist ein echtes Leben.' },
    { name: 'Remus Snacker', type: 'duel', foe: 'b6_remus', crowd: 0.3, theme: 'siedlung', roles: R_JILL, comp: ['sil'],
      text: 'Ein Original ist erwacht, der erste Leader der achten Familie. „Ich rieche dich, Blut-Fee!“ Seine Blutkanone reißt Mauern ein, und jeder abgetrennte Arm wächst sofort nach.' },
    { name: 'Die Zuchtstätte', type: 'hunt', role: 'ghoul', n: 130, pace: 1.9, theme: 'himmel', roles: R_ROWA, comp: ['leo', 'fex'],
      text: 'Unter einer Kuppel in der Vertrautenwelt: Zellen voller gebrochener Subklassen, darunter vierhundert Bloodsucker – nur Männer. Im zweiten Schloss gibt es nur Frauen und Kinder.' },
    { name: 'Blutregen', type: 'survive', dur: 180, pace: 2.0, theme: 'siedlung', roles: R_WAHN, comp: ['peter', 'leander'], elites: 3,
      text: 'Zum ersten Mal regnet es auf dem Vampirplaneten – Blut. Remus macht die achte Familie mit einem Fingerschnipp wahnsinnig, Hunderte stürzen sich auf Leander. Peter steht allein vor der Wand.' },
    { name: 'Überlebe die Begegnung', type: 'endure', foe: 'b6_cindy', dur: 70, crowd: 0.2, theme: 'siedlung', roles: R_WAHN,
      text: 'Cindy trägt die Königsrüstung aus reinen Blutkristallen und zieht das Blut der ganzen Siedlung zu sich. Jin und Kyle liegen am Boden, Bryce steht noch. Das System sagt: überleben.' },
    { name: 'Shadow Overload', type: 'boss', at: 60, foe: 'b6_cindyF', pace: 1.9, theme: 'siedlung', roles: R_WAHN, comp: ['agathon'],
      text: '„System, du irrst – ich muss gewinnen.“ Der Schatten fließt in Finns Mund und durch jede Zelle, lila Schattenfell wächst über seinen Körper. Für kurze Zeit kostet kein Schatten mehr etwas.' }
  ]
};

/* ------------------------------------------------------------ Etappe 7: Die Rückkehr der Dalki (Kapitel 946–1197) */
defEnemy('e7_schueler', 'ghoul', 'h_schueler', 'Earthborn-Schüler', { hp: 30 });
defEnemy('e7_rowdy', 'knight', 'h_wache', 'Schläger aus der 3B', { armor: 4 });
defEnemy('e7_erd', 'witch', 'h_truedream', 'Erdnutzer', { shot: 'spike', flier: false });
defEnemy('e7_capt', 'captain', 'h_wache', 'Innus Vertrauter', { scale: 1.25, hp: 3400 });
defEnemy('e7_sandwurm', 'ghoul', 'q_caladi', 'Sandwurm', { hp: 38 });
defEnemy('e7_d1', 'ghoul', 'dalki1', 'Ein-Stachel-Dalki', { hp: 44 });
defEnemy('e7_d2', 'knight', 'dalki2', 'Zwei-Stachel-Dalki', { armor: 6 });
defEnemy('e7_dS', 'witch', 'dalki5', 'Dalki-Schütze', { shot: 'spike', flier: false });
defEnemy('e7_dB', 'brute', 'dalki6', 'Dalki-Brecher', { splits: 0, hp: 280 });
defEnemy('e7_dK', 'captain', 'dalkiW', 'Dalki-Kommandant', { scale: 1.3, hp: 4400 });
defEnemy('e7_frosch', 'ghoul', 'q_kroete', 'Froschbestie', { hp: 36 });
defEnemy('e7_motte', 'bat', 'bat_licht', 'Mottenschwarm', { hp: 30 });
defEnemy('e7_mark', 'ghoul', 'h_schueler', 'Markierter', { hp: 36, spd: 82 });
defEnemy('e7_heu', 'bat', 'bat_aas', 'Stabheuschrecke', { hp: 32 });
defEnemy('e7_markG', 'knight', 'h_wache', 'Markierter Graylash', { armor: 5 });
defEnemy('e7_markR', 'brute', 'h_koloss', 'Rasender Markierter', { splits: 0, hp: 280 });
defEnemy('e7_zahm', 'ghoul', 'q_rot', 'Gezähmte Bestie', { hp: 36 });
defEnemy('e7_cruncher', 'brute', 'q_fort', 'Cruncher', { splits: 0, hp: 280 });
defEnemy('e7_koeder', 'ghoul', 'q_spore', 'Köder-Bestie', { hp: 36 });
defEnemy('e7_soeldner', 'knight', 'h_pure', 'Pure-Söldner', { armor: 5 });
defEnemy('e7_king', 'brute', 'q_koenig', 'King-Humanoider', { splits: 0, hp: 300 });
defBoss('b7_sach', 'stahlmann', 'Sach (Knochenstiefel)', 7000, Object.assign({ look: 'b_sach', bellShot: 'spike', armor: 5 }, B1));
defBoss('b7_boneclaw', 'blutsauger', 'Der Boneclaw (Training)', 8500, { model: 'boneclaw', bellShot: 'spike', r: 30, spd: 72 });
defBoss('b7_mag', 'mono', 'Martial Art God (Rang 50)', 8400, Object.assign({ look: 'b_mag', bellShot: 'soul', spd: 76 }, B1));
defBoss('b7_motte', 'krabbe', 'Weiße Motte (Demi-God)', 10500, { model: 'motte', bellShot: 'soul', r: 46 });
defBoss('b7_baum', 'krabbe', 'Der rosa Baum', 11000, { model: 'baum', bellShot: 'spike', r: 52, spd: 30 });
defBoss('b7_dred', 'dalki1', 'Dred, Dalki-Kommandant', 11500, { model: 'dred', bellShot: 'spike', r: 34 });
defBoss('b7_drache', 'kronker', 'Der schwarze Drache', 60000, { model: 'drache', bellShot: 'bell', r: 80, scale: 1.6 });
defBoss('b7_longblade', 'stahlmann', 'Colonel Longblade', 9500, Object.assign({ look: 'b_longblade', bellShot: 'spike', armor: 5 }, B1));
defBoss('b7_agent2', 'mono', 'Agent 2 (Pure)', 10500, Object.assign({ look: 'b_agent2', bellShot: 'light', spd: 74 }, B1));
defBoss('b7_erde', 'krabbe', 'Demi-God aus Erde', 15000, { model: 'erdgott', bellShot: 'spike', r: 50 });
const R_SCHULE7 = { ghoul: 'e7_schueler', bat: 'e7_schueler', knight: 'e7_rowdy', witch: 'e7_erd', brute: 'e7_rowdy', captain: 'e7_capt' };
const R_WUESTE7 = { ghoul: 'e7_sandwurm', bat: 'c3_aas', knight: 'e5_panzer', witch: 'e5_neunauge', brute: 'c3_koenig', captain: 'c3_koenigB' };
const R_DALKI7 = { ghoul: 'e7_d1', bat: 'e7_d1', knight: 'e7_d2', witch: 'e7_dS', brute: 'e7_dB', captain: 'e7_dK' };
const R_WALD7 = { ghoul: 'e7_frosch', bat: 'e7_motte', knight: 'e5_panzer', witch: 'c3_spucker', brute: 'c3_koenig', captain: 'c3_koenigB' };
const R_MARK = { ghoul: 'e7_mark', bat: 'e7_heu', knight: 'e7_markG', witch: 'e4_blitz', brute: 'e7_markR', captain: 'e4_altum' };
const R_ZOO = { ghoul: 'e7_zahm', bat: 'c2_flatter', knight: 'e7_d2', witch: 'e7_dS', brute: 'e7_cruncher', captain: 'e7_dK' };
const R_ROHR = { ghoul: 'e7_koeder', bat: 'c3_aas', knight: 'e7_soeldner', witch: 'e5_qi', brute: 'e7_king', captain: 'e5_narbe' };
const ETAPPE7 = {
  title: 'Die Rückkehr der Dalki', place: 'Die neue Schule · Graylash-Planet · ZOO · Blade-Insel · Rohrbahnen', src: 'Kapitel 946–1197', theme: 'ruinen', ch: 9,
  levels: [
    { name: 'Lehrer Hardy', type: 'survive', dur: 160, pace: 1.9, theme: 'akademie', roles: R_SCHULE7, comp: ['peter'],
      text: 'Unter dem Namen „Hardy“ unterrichtet Finn an der neuen Militärschule – die schwächste Klasse, fast nur Stufe 1 bis 3. Die 3B hält das für eine Einladung.' },
    { name: 'Das Kolosseum', type: 'duel', foe: 'b7_sach', crowd: 0.3, theme: 'akademie', roles: R_SCHULE7,
      text: 'Über Nacht entsteht ein Kolosseum. Die Schüler ohne Fähigkeit schlagen sich besser als gedacht. Dann will Sach selbst gegen Hardy antreten – in Knochenstiefeln der Emperor-Stufe.' },
    { name: 'Training mit dem Boneclaw', type: 'duel', foe: 'b7_boneclaw', crowd: 0, theme: 'burg', roles: R_KERKER,
      text: 'Im Schloss der Punisher lernt Finn, den Boneclaw zu bändigen. Er greift durch zwei Portale zugleich an. Kuppel auf Kuppel, Schattenportale wie Minen – bis er stillhält.' },
    { name: 'Martial Art God', type: 'duel', foe: 'b7_mag', crowd: 0, theme: 'goetter', roles: R_SCHULE7,
      text: 'In Power Fighters versteckt Finn seine Kraft hinter einem Limiter. Auf Rang 50 wartet der Torwächter: barfuß, grüne Shorts, ein Oberschenkeltritt wie eine Peitsche.' },
    { name: 'Sandwurm-Jagd', type: 'hunt', role: 'ghoul', n: 60, pace: 1.9, theme: 'caladi', roles: R_WUESTE7, comp: ['peter'],
      text: 'Erste Portalexkursion der Schule. Finn lehrt seine Klasse heimlich Qi. Dann meldet sich ein Fremder, der aussieht wie Richard Eno: „Die Dalki kommen.“' },
    { name: 'Die Dalki kommen', type: 'survive', dur: 190, pace: 1.85, theme: 'ruinen', roles: R_DALKI7, comp: ['fex'], elites: 3,
      text: 'Teleporter und Masken sind blockiert, dreißigtausend Schüler stehen allein. Finn zeigt den Lehrern Schatten und Platinausweis: „Die Dalki kommen!“' },
    { name: 'Fünfundvierzig Dalki', type: 'hunt', role: 'ghoul', n: 45, pace: 2.0, theme: 'ruinen', roles: R_DALKI7, comp: ['fex'],
      text: 'Zehn Zwei-Stachel, fünfunddreißig Ein-Stachel. Die Knochenketten trinken Dalki-Blut und machen Finn stärker. Die Schüler erkennen ihn: Das ist der Blood Evolver.' },
    { name: 'Die weiße Motte', type: 'waveboss', at: 100, foe: 'b7_motte', pace: 1.9, theme: 'bestienplanet', roles: R_WALD7, comp: ['sil'],
      text: 'Auf einem Graylash-Planeten greifen Hunderte Bestien den Shelter an. Über ihnen: eine riesige weiße Motte, deren Flaum Energie absaugt. Ihr Bauch ist die Schwachstelle.' },
    { name: 'Die Markierten', type: 'survive', dur: 200, pace: 2.1, theme: 'bestienplanet', roles: R_MARK, comp: ['lena', 'peter'], elites: 3,
      text: 'Verschwundene kehren zurück – ohne Erinnerung, mit einem roten Wurzelmal auf dem Rücken. Wer gebissen wird, kippt in Sekunden. Tausende strömen durch die offenen Tore.' },
    { name: 'Der rosa Baum', type: 'waveboss', at: 80, foe: 'b7_baum', pace: 1.8, theme: 'bestienplanet', roles: R_MARK, comp: ['lena'],
      text: 'Der Shelter wurde wegen der Schönheit eines Baumes gebaut. Unter seiner Rinde: rosa Kristall und schwarzes Blut. Der Baum ist der Dämon, der alle markiert.' },
    { name: 'Dred im Kolosseum von ZOO', type: 'duel', foe: 'b7_dred', crowd: 0.4, theme: 'schlachtfeld', roles: R_ZOO, comp: ['leo', 'emma'],
      text: 'In der Bestienstadt ZOO kämpfen Zähmer im Kolosseum. Dann steigt ein Dalki-Kommandant in die Arena, dessen Brüllen doppelt so laut ist wie jedes Bellen.' },
    { name: 'Der schwarze Drache', type: 'endure', foe: 'b7_drache', dur: 80, crowd: 0.2, theme: 'bestienplanet', roles: R_INSEL,
      text: 'Vor der Steintafel der Blade-Insel schläft ein schwarzer Drache, größer als die Burg. Man kann ihn nicht töten – nur beide Hälften zugleich. Sein Brüllen wirft alle zu Boden.' },
    { name: 'Colonel Longblade', type: 'duel', foe: 'b7_longblade', crowd: 0.2, theme: 'schlachtfeld', roles: R_ROHR,
      text: 'In einem Shelter mit Rohrbahnen und Bergbau-Mechs tritt „Bucky“ gegen den Mech-Fan Longblade an. Sein Katana sieht einen Augenblick in die Zukunft.' },
    { name: 'Agent 2', type: 'duel', foe: 'b7_agent2', crowd: 0.2, theme: 'ruinen', roles: R_ROHR, comp: ['lena'],
      text: 'Pures zweiter Agent hat seinen Männern das Qi geraubt. Sein stumpfer Stab schlägt Blutschnitte einfach weg, und Qi ist neben der Sonne der Albtraum der Vampire.' },
    { name: 'Der Demi-God aus Erde', type: 'boss', at: 90, foe: 'b7_erde', pace: 2.0, theme: 'ruinen', roles: R_ROHR, comp: ['fex', 'sil'],
      text: 'Ein dunkelbrauner Riese mit eckigen grünen Augen zerstört die Bergbau-Mechs. Er spricht: Die Kristalle sind die Lebenskraft des Planeten. Und in ihm soll Raten eine neue Heimat finden.' }
  ]
};

/* ------------------------------------------------------------ Etappe 8: Der König mit Bedingungen (Kapitel 1198–1408) */
defEnemy('e8_dorf', 'ghoul', 'h_blade', 'Blade-Diener', { hp: 42 });
defEnemy('e8_chainedG', 'knight', 'h_blade', 'Chained-Krieger', { armor: 6 });
defEnemy('e8_chained', 'witch', 'h_seherin', 'Chained (Schall)', { shot: 'soul', flier: false });
defEnemy('e8_mutter', 'captain', 'h_blade', 'Blade-„Mutter“ in goldener Rüstung', { scale: 1.3, hp: 5200 });
defEnemy('e8_d3', 'knight', 'dalki3', 'Drei-Stachel-Dalki', { armor: 7 });
defEnemy('e8_dK', 'captain', 'dalki4', 'Vier-Stachel-Dalki', { scale: 1.35, hp: 6200 });
defEnemy('e8_klon', 'ghoul', 'h_wache', 'Maskierter Klon', { hp: 42 });
defEnemy('e8_klonR', 'knight', 'h_wache', 'Klon mit Blutkraft', { armor: 6 });
defEnemy('e8_trued', 'witch', 'h_truedream', 'Maskierter der Truedream-Familie', { shot: 'soul', flier: false });
defEnemy('e8_hund', 'ghoul', 'q_rot', 'Laborhund', { hp: 40, spd: 86 });
defEnemy('e8_mouth', 'ghoul', 'q_void', 'Mouth Splitter', { hp: 50 });
defEnemy('e8_mouthK', 'knight', 'q_panzer', 'Knochen-Mouth-Splitter', { armor: 5 });
defEnemy('e8_mouthR', 'brute', 'q_alienM', 'Riesiger Mouth Splitter', { splits: 0, hp: 340 });
defBoss('b8_zweizack', 'dalki1', 'Zwei-Stachel-Dalki (markiert)', 10500, { model: 'zweizackB', bellShot: 'spike', r: 36, scale: 1.2 });
defBoss('b8_graham', 'graham', 'Arian (fünf Stacheln)', 60000, { model: 'graham5', bellShot: 'spike', r: 36, spd: 72 });
defBoss('b8_slicer', 'dalki1', 'Slicer (Klingenschweif)', 14000, { model: 'slicer', bellShot: 'spike', r: 36 });
defBoss('b8_eno', 'silva', 'Eno, der erste König', 13000, Object.assign({ look: 'b_eno', bellShot: 'blood', armor: 6 }, B1));
defBoss('b8_sechs', 'graham', 'Sechs-Stachel-Dalki', 15000, { model: 'sechs', bellShot: 'spike', r: 38, scale: 1.2 });
defBoss('b8_wurm', 'krabbe', 'Galaktischer Wurm (Demi-God)', 15500, { model: 'wurm', bellShot: 'acid', r: 50 });
defBoss('b8_dullahan', 'kronker', 'Der Dullahan', 16000, { model: 'dullahan', bellShot: 'blood', r: 44, spd: 80 });
defBoss('b8_laxmus', 'original', 'Laxmus, der wahre erste König', 60000, Object.assign({ look: 'b_laxmus', bellShot: 'blood', spd: 70 }, B1));
defBoss('b8_laxmusF', 'original', 'Laxmus, der wahre erste König', 19000, Object.assign({ look: 'b_laxmus', bellShot: 'blood', spd: 66 }, B1));
const R_CHAINED = { ghoul: 'e8_dorf', bat: 'e8_dorf', knight: 'e8_chainedG', witch: 'e8_chained', brute: 'e8_chainedG', captain: 'e8_mutter' };
const R_DALKI8 = { ghoul: 'e7_d1', bat: 'e7_d1', knight: 'e8_d3', witch: 'e7_dS', brute: 'e7_dB', captain: 'e8_dK' };
const R_KLON = { ghoul: 'e8_klon', bat: 'e7_heu', knight: 'e8_klonR', witch: 'e8_trued', brute: 'e7_markR', captain: 'e8_dK' };
const R_LABOR8 = { ghoul: 'e8_hund', bat: 'c5_fleder', knight: 'e8_klonR', witch: 'e8_trued', brute: 'e7_king', captain: 'e8_dK' };
const R_MOUTH = { ghoul: 'e8_mouth', bat: 'c5_fleder', knight: 'e8_mouthK', witch: 'c3_spucker', brute: 'e8_mouthR', captain: 'c3_koenigB' };
const ETAPPE8 = {
  title: 'Der König mit Bedingungen', place: 'Cursed-Schiff · Mutterschiffe · Blade-Insel · Enos Labor · Vampirsiedlung', src: 'Kapitel 1198–1408', theme: 'burg', ch: 9,
  levels: [
    { name: 'Die Chained-Schlacht', type: 'survive', dur: 190, pace: 1.9, theme: 'schlachtfeld', roles: R_CHAINED, comp: ['sil', 'peter'], elites: 3,
      text: 'Hilstons Schiff greift an. Gefangene Chained lähmen mit Schall und Schwerkraft die Vampirohren. Die Blade-Kinder kämpfen in Dreierteams – kopieren, weitergeben, zuschlagen.' },
    { name: 'Das Mutterschiff', type: 'hunt', role: 'ghoul', n: 60, pace: 1.8, theme: 'bestienplanet', roles: R_DALKI8,
      text: 'Schwarze Mutterschiffe werfen Kapseln auf jeden Menschenplaneten. Über dem Daisy-Planeten stürmt Finn mit einer Schildkröten-Formation ins Innere eines Schiffs – gebaut aus Vampirmaterial.' },
    { name: 'Branching Link', type: 'duel', foe: 'b8_zweizack', crowd: 0.4, theme: 'ruinen', roles: R_DALKI8,
      text: 'Alex schmiedet aus dem Dämonenkristall ein Amulett, halb schwarz, halb weiß. Es trinkt die Energie jedes Getöteten – und kann einen Dalki markieren, der dann für Finn kämpft.' },
    { name: 'Arian', type: 'endure', foe: 'b8_graham', dur: 80, crowd: 0.3, theme: 'caladi', roles: R_DALKI8,
      text: 'Ein Dalki in Menschenkleidung, der Klügste von allen. Er imitiert Finns Oberschenkeltritt beiläufig und bricht ihm damit das Bein. Grünes Blut hält Finn am Leben.' },
    { name: 'Slicer', type: 'waveboss', at: 80, foe: 'b8_slicer', pace: 1.9, theme: 'caladi', roles: R_CHAINED, comp: ['sil'],
      text: 'Die Dalki-Kommandantin mit dem Klingenschweif hat Hilston getötet und will Sil. Ihr dritter Schnitt lässt den Schwanz auf dreifache Körperlänge wachsen. Vincent übernimmt Finns Körper.' },
    { name: 'Eno, der erste König', type: 'duel', foe: 'b8_eno', crowd: 0.2, theme: 'bestienplanet', roles: R_KLON,
      text: 'Neben der Tafel wächst ein Baum mit rosa Blüten. Eno trägt eine dunkelrote Blutrüstung mit dreizackiger Krone: „Ich war der erste König. Ich schuf die Punisher.“' },
    { name: 'Zwanzig Portale', type: 'survive', dur: 200, pace: 2.1, theme: 'bestienplanet', roles: R_KLON, comp: ['lena', 'fabian'], elites: 4,
      text: 'Aus dem Nichts öffnen sich zwanzig Portale. Maskierte stürmen die Insel – alle mit demselben Gesicht. Klone. Nur wenige Menschen unter ihnen haben Fähigkeiten.' },
    { name: 'Der Sechs-Stachel-Dalki', type: 'waveboss', at: 70, foe: 'b8_sechs', pace: 2.0, theme: 'bestienplanet', roles: R_KLON, comp: ['peter'],
      text: 'Jim zwingt einen Dalki zur Evolution: sechs Stacheln, jede Wunde macht ihn stärker. Doch sein Herz hält das nur Minuten aus – wer so lange überlebt, gewinnt.' },
    { name: 'Die galaktischen Würmer', type: 'waveboss', at: 80, foe: 'b8_wurm', pace: 1.9, theme: 'goetter', roles: R_LABOR8, comp: ['leander'],
      text: 'Vor einer Sonne steht ein riesiges Objekt und schluckt ihr Licht: die Vampirwelt. Aus Containern springen Würmer der Demi-God-Stufe – Tentakel, Hammerkopf, viele Mäuler.' },
    { name: 'Richards Labor', type: 'hunt', role: 'ghoul', n: 110, pace: 2.0, theme: 'burg', roles: R_LABOR8, comp: ['leander'],
      text: 'Endlose Laborhunde bewachen einen Nest-Kristall, der sie immer wieder erschafft. Hinter der Grenze liegt Oscars Kopf in einem Tank – und seine Augen folgen jedem.' },
    { name: 'Der Dullahan', type: 'duel', foe: 'b8_dullahan', crowd: 0.2, theme: 'burg', roles: R_LABOR8,
      text: 'Ein kopfloser Reiter auf einem Pferd, das kein Licht zurückwirft, mit roten Vampiraugen. Keine bekannte Subklasse – neu erschaffen oder aus alten Mythen geweckt.' },
    { name: 'Mouth Splitter', type: 'hunt', role: 'ghoul', n: 80, pace: 2.0, theme: 'friedhof', roles: R_MOUTH, comp: ['fex'],
      text: 'In Jims altem Labor unter der Vampirwelt: hautlose Riesen mit langen Haaren, aus deren Körpern Schädel wachsen. Die Tunnel sind voll davon.' },
    { name: 'Dalki über der Siedlung', type: 'survive', dur: 180, pace: 2.1, theme: 'siedlung', roles: R_DALKI8, comp: ['leo', 'emma'], elites: 4,
      text: 'Fünfzig Zwei- und Dreizack-Dalki fallen über die Vampirsiedlung her, die Burgen lassen niemanden hinein. Leo und Emma schützen die Flüchtlinge des Armenviertels.' },
    { name: 'Laxmus', type: 'endure', foe: 'b8_laxmus', dur: 80, crowd: 0.3, theme: 'burg', roles: R_KOENIG, comp: ['leo', 'emma'],
      text: 'Unter der Königsburg lag der wahre erste König, aus der Geschichte getilgt. Er erwacht mit denselben Kräften wie Agathon. Davids Faust zerbricht, Jins Schild wird zerquetscht.' },
    { name: 'Der König mit Bedingungen', type: 'boss', at: 70, foe: 'b8_laxmusF', pace: 2.0, theme: 'burg', roles: R_KOENIG, comp: ['agathon'], evo: 'König der Vampire',
      text: 'Paul stirbt in Kazz’ Armen. Agathon schenkt Finn sein Wissen über Aura und Blut und seine rote Blutrüstung. Twin Tails durch hundert Schattenportale – „Bleib am Boden!“' }
  ]
};

/* ------------------------------------------------------------ Etappe 9: Arian (Kapitel 1409–1572) */
defEnemy('e9_pureb', 'ghoul', 'q_spore', 'Pure-Bestie', { hp: 52 });
defEnemy('e9_halb', 'knight', 'h_pure', 'Halb verwandelter Mensch', { armor: 7 });
defEnemy('e9_qi', 'witch', 'h_pure', 'Qi-Agent', { shot: 'light', flier: false });
defEnemy('e9_pureB', 'brute', 'q_mutter', 'Große Pure-Bestie', { splits: 0, hp: 380 });
defEnemy('e9_agent', 'captain', 'h_pure', 'Pure-Agent', { scale: 1.3, hp: 6500 });
defEnemy('e9_sumpf', 'ghoul', 'q_kroete', 'Sumpfbestie', { hp: 52 });
defEnemy('e9_prog', 'knight', 'q_panzer', 'Progressive Bestie', { armor: 7 });
defEnemy('e9_affe', 'brute', 'q_koenig', 'Grauer Gorilla', { splits: 0, hp: 380 });
defEnemy('e9_d2', 'ghoul', 'dalki2', 'Zwei-Stachel-Krieger', { hp: 62 });
defEnemy('e9_newgen', 'knight', 'dalki4', 'Dalki der neuen Generation', { armor: 8 });
defEnemy('e9_lava', 'ghoul', 'q_orange', 'Lavabestie', { hp: 52 });
defEnemy('e9_auge', 'bat', 'bat_blut', 'Doppelkugel-Auge', { hp: 46 });
defBoss('b9_samantha', 'erin', 'Samantha (neun Erdschwänze)', 13000, Object.assign({ look: 'b_samantha', bellShot: 'spike' }, B1));
defBoss('b9_agent3', 'kronker', 'Agent 3 (Pure)', 16000, { model: 'agent3', bellShot: 'light', r: 38 });
defBoss('b9_genbu', 'krabbe', 'Genbu, König der Vertrauten', 60000, { model: 'genbu', bellShot: 'spike', r: 80, scale: 1.5, spd: 30 });
defBoss('b9_ape', 'kronker', 'Vorti Ape (Emperor)', 15000, { model: 'ape', bellShot: 'spike', r: 44 });
defBoss('b9_doppel', 'mono', 'Der Doppelgänger', 15000, Object.assign({ look: 'b_doppel', bellShot: 'blood', spd: 76 }, B1));
defBoss('b9_onehorn', 'dalki1', 'One Horn', 60000, { model: 'onehorn', bellShot: 'spike', r: 40, scale: 1.2 });
defBoss('b9_newgen', 'dalki1', 'Dalki mit Doppelellenbogen', 17000, { model: 'newgen', bellShot: 'spike', r: 36 });
defBoss('b9_dhelen', 'graham', 'Dalki-Helen (fünf Stacheln)', 18000, { model: 'dhelen', bellShot: 'acid', r: 36 });
defBoss('b9_blob', 'graham', 'Blob (fünf Stacheln)', 19000, { model: 'blob', bellShot: 'spike', r: 44, armor: 8, spd: 40 });
defBoss('b9_drache2', 'kronker', 'Die zweite Drachenhälfte', 22000, { model: 'drache2', bellShot: 'bell', r: 80, scale: 1.6 });
defBoss('b9_greenhorn', 'graham', 'Green Horn (vier Stacheln)', 18000, { model: 'greenhorn', bellShot: 'spike', r: 36 });
defBoss('b9_graham', 'graham', 'Arian (acht Stacheln)', 21000, { model: 'graham8', bellShot: 'spike', r: 40, scale: 1.15, spd: 74 });
const R_PUREB = { ghoul: 'e9_pureb', bat: 'e7_heu', knight: 'e9_halb', witch: 'e9_qi', brute: 'e9_pureB', captain: 'e9_agent' };
const R_SUMPF = { ghoul: 'e9_sumpf', bat: 'e7_heu', knight: 'e9_prog', witch: 'c3_spucker', brute: 'e9_affe', captain: 'c3_koenigB' };
const R_DALKI9 = { ghoul: 'e9_d2', bat: 'e7_d1', knight: 'e8_d3', witch: 'e7_dS', brute: 'e7_dB', captain: 'e8_dK' };
const R_NEWGEN = { ghoul: 'e9_d2', bat: 'e7_d1', knight: 'e9_newgen', witch: 'e7_dS', brute: 'e7_dB', captain: 'e8_dK' };
const R_LAVA = { ghoul: 'e9_lava', bat: 'e9_auge', knight: 'e5_panzer', witch: 'e5_feuerkroete', brute: 'c3_koenig', captain: 'c3_koenigB' };
const ETAPPE9 = {
  title: 'Arian', place: 'Das Board · Vertrautenwelt · Dalki-Planeten · Daisy-Siedlung', src: 'Kapitel 1409–1572', theme: 'roterhimmel', ch: 10,
  levels: [
    { name: 'Das Spiel des Boards', type: 'duel', foe: 'b9_samantha', crowd: 0.3, theme: 'caladi', roles: R_PUREB, comp: ['fex'],
      text: 'Die Mächtigen der Menschen laden die Vampire zu einem Spiel in der Simulation: ein Wüstendorf mit Holzbrücke. Samantha greift mit neun Erdschwänzen an – und Fex hat sich in sie verliebt.' },
    { name: 'Die Falle im Stadion', type: 'survive', dur: 180, pace: 1.67, theme: 'schlachtfeld', roles: R_PUREB, elites: 3,
      text: 'Grünes Schlafgas flutet die Logen, und aus der Südbox strömen Pure-Bestien – zehntausend halb verwandelte Menschen. Das Board wollte die Vampire nie gewinnen lassen.' },
    { name: 'Agent 3', type: 'duel', foe: 'b9_agent3', crowd: 0.3, theme: 'burg', roles: R_PUREB,
      text: 'Hautlose Muskeln, Knochen wie herabhängende Hände auf dem Rücken. Sein Qi-Faustschlag bricht Sach das Knie, und die Wunde heilt nicht.' },
    { name: 'Genbu', type: 'endure', foe: 'b9_genbu', dur: 75, crowd: 0.2, theme: 'himmel', roles: R_VERTRAUT, comp: ['leo'],
      text: 'In der Welt der Vertrauten schläft ein König im Berg: eine Schildkröte, größer als jede Burg. Stärkste Verteidigung aller Könige – eine einzige Schuppe zu brechen ist schon ein Sieg.' },
    { name: 'Vorti Ape', type: 'duel', foe: 'b9_ape', crowd: 0.4, theme: 'bestienplanet', roles: R_SUMPF,
      text: 'Auf der Jagd nach einem Nest-Kristall: ein vierarmiger Gorilla der Emperor-Stufe. Finns Drainimo-Handschuh wird dabei zur Dämonenwaffe und saugt Energie für immer ab.' },
    { name: 'Der Doppelgänger', type: 'duel', foe: 'b9_doppel', crowd: 0.2, theme: 'bestienplanet', roles: R_SUMPF,
      text: 'Im grünen Smog des Sumpfplaneten kopiert eine Bestie jeden, der sie ansieht – mit Ausrüstung, Muay Thai und Blitzschritt. Finn kämpft gegen sich selbst.' },
    { name: 'One Horn', type: 'endure', foe: 'b9_onehorn', dur: 90, crowd: 0.3, theme: 'ruinen', roles: R_DALKI9, comp: ['fex'],
      text: 'Der Anführer des ersten Krieges hat inzwischen mehr Stacheln, als er zeigt. „Je mehr Blut ich verliere, desto stärker werde ich.“ Sach und Oscar fallen hier.' },
    { name: 'Der Lavaplanet', type: 'hunt', role: 'bat', n: 45, pace: 1.80, theme: 'roterhimmel', roles: R_LAVA, comp: ['emma'],
      text: 'Emma jagt im Exil mit einem Menschenteam: schwebende Doppelkugeln mit je einem Auge, die aus Tentakeln Feuerbälle schleudern.' },
    { name: 'Doppelellenbogen', type: 'duel', foe: 'b9_newgen', crowd: 0.4, theme: 'schlachtfeld', roles: R_NEWGEN, comp: ['emma'],
      text: 'Arians neue Dalki sind aus der DNA starker Menschen gezüchtet. Einer mit doppelten Ellenbogen hat Hermes getötet. Emma rettet Owens Gruppe – und ihre Augen glühen gelb.' },
    { name: 'Peters Wights', type: 'survive', dur: 190, pace: 1.89, theme: 'himmel', roles: R_DALKI9, comp: ['peter'], elites: 4,
      text: 'Auf einem violetten Eisplaneten ist Peter die perfekte Nemesis: Jeder besiegte Gegner kämpft danach für ihn – ein kopfloser Hilston, Slicers Beine.' },
    { name: 'Dalki-Helen', type: 'duel', foe: 'b9_dhelen', crowd: 0.3, theme: 'bestienplanet', roles: R_DALKI9, comp: ['lena'],
      text: 'Arian hat aus Helens DNA einen Dalki mit fünf Stacheln gemacht. Ihre Ranken packen Lenas Schwert. In Lenas Kopf schreien die Verdammten.' },
    { name: 'Der Blob', type: 'duel', foe: 'b9_blob', crowd: 0.2, theme: 'ruinen', roles: R_NEWGEN, comp: ['sil', 'peter'],
      text: 'Die Dalki-Heimat ist ein Planetenschiff aus geraubten Landmassen. Aus einem Turm bricht ein Fünfzack mit doppelt dicken Schuppen – ein Panzer auf zwei Beinen.' },
    { name: 'Die zweite Drachenhälfte', type: 'waveboss', at: 60, foe: 'b9_drache2', pace: 1.80, theme: 'roterhimmel', roles: R_NEWGEN, comp: ['sil', 'fabian'],
      text: 'Der Drache der Dalki fliegt durchs geöffnete Dach. Sils Seelenwaffe erwacht: ein Regenbogenbuch, jede Seite eine kopierte Fähigkeit – beliebig tauschbar.' },
    { name: 'Green Horn', type: 'duel', foe: 'b9_greenhorn', crowd: 0.4, theme: 'siedlung', roles: R_DALKI9,
      text: 'Das letzte Mutterschiff greift die Siedlung auf dem Daisy-Planeten an. Finn hat den Nest-Kristall aufgenommen, Ray ist zurück. „Wo ist Arian?!“' },
    { name: 'Acht Stacheln', type: 'boss', at: 50, foe: 'b9_graham', pace: 1.80, theme: 'siedlung', roles: R_NEWGEN, comp: ['sil'],
      text: 'Arian hält Sunny und ein kleines Mädchen in den Händen. Finn wählt das Kind. Arian frisst Dalki und wächst zu acht Stacheln mit Fellflügeln – seine Wunden heilen in Sekunden.' }
  ]
};

/* ------------------------------------------------------------ Etappe 10: Die Rückkehr einer Legende (Kapitel 1573–1758) */
defEnemy('e10_dh', 'ghoul', 'h_dhampir', 'Dhampir', { hp: 62 });
defEnemy('e10_dhK', 'knight', 'h_dhampir', 'Dhampir-Krieger', { armor: 8 });
defEnemy('e10_dhS', 'witch', 'h_seherin', 'Dhampir-Schützin', { shot: 'light', flier: false });
defEnemy('e10_dhB', 'brute', 'h_koloss', 'Dhampir-Koloss', { splits: 0, hp: 400 });
defEnemy('e10_dhC', 'captain', 'h_dhampir', 'Dhampir-Hauptmann', { scale: 1.3, hp: 7000 });
defEnemy('e10_trav', 'ghoul', 'h_wache', 'Gilden-Traveller', { hp: 62 });
defEnemy('e10_axt', 'knight', 'h_blade', 'Axtträger', { armor: 8 });
defEnemy('e10_eis', 'witch', 'h_truedream', 'Eisnutzer', { shot: 'soul', flier: false });
defEnemy('e10_hammer', 'brute', 'h_koloss', 'Hammermann', { splits: 0, hp: 400 });
defEnemy('e10_gilde', 'captain', 'h_wache', 'Gildenmeister', { scale: 1.3, hp: 7000 });
defEnemy('e10_insekt', 'ghoul', 'q_kanal', 'Mars-Insekt', { hp: 62 });
defEnemy('e10_flug', 'bat', 'bat_aas', 'Säureflieger', { hp: 50 });
defEnemy('e10_panzer', 'knight', 'q_panzer', 'Panzerinsekt', { armor: 8 });
defEnemy('e10_saeure', 'witch', 'q_kroete', 'Säurespucker', { shot: 'acid', flier: false });
defEnemy('e10_brut', 'brute', 'q_mutter', 'Brutmutter', { splits: 0, hp: 420 });
defEnemy('e10_rot', 'ghoul', 'h_rotvamp', 'Roter Vampir', { hp: 62 });
defEnemy('e10_rotR', 'knight', 'v_ritter', 'Roter Krieger', { armor: 8 });
defEnemy('e10_rotB', 'witch', 'v_magier', 'Roter Blutschütze', { shot: 'blood', flier: false });
defEnemy('e10_guard', 'captain', 'v_ritter', 'Guardian der Roten', { scale: 1.3, hp: 7500 });
defEnemy('e10_bot', 'ghoul', 'h_sunshield', 'Schwarzer Roboter', { hp: 70 });
defEnemy('e10_botK', 'knight', 'h_sunshield', 'KI-Roboter', { armor: 9 });
defEnemy('e10_botL', 'witch', 'h_sunshield', 'Laserroboter', { shot: 'light', flier: false });
defEnemy('e10_sedi', 'ghoul', 'q_orange', 'Sedi', { hp: 66 });
defEnemy('e10_sediK', 'knight', 'q_panzer', 'Turmwächter', { armor: 8 });
defBoss('b10_tikker', 'silva', 'Tikker (Roter Vampir)', 14000, Object.assign({ look: 'b_tikker', bellShot: 'blood' }, B1));
defBoss('b10_werwolf', 'kronker', 'Hybrid-Werwolf', 17000, { model: 'werwolf', bellShot: 'spike', r: 38, spd: 80 });
defBoss('b10_derik', 'silva', 'Derik, Vize der Roten', 15000, Object.assign({ look: 'b_derik', bellShot: 'blood', spd: 74 }, B1));
defBoss('b10_andy', 'stahlmann', 'Andy Sanguini (Colossal Draugr)', 17000, Object.assign({ look: 'b_andy', bellShot: 'blood', armor: 8 }, B1));
defBoss('b10_lock', 'mono', 'Lock (Schwerkraft)', 16000, Object.assign({ look: 'b_lock', bellShot: 'soul' }, B1));
defBoss('b10_russ', 'silva', 'Russ, der God Slayer', 60000, Object.assign({ look: 'b_russ', bellShot: 'blood', spd: 72 }, B1));
defBoss('b10_chris', 'mono', 'Chris mit Werwolf-DNA', 16000, Object.assign({ look: 'chris', bellShot: 'light', spd: 72 }, B1));
defBoss('b10_laxmus', 'original', 'Laxmus mit dem roten Herzen', 60000, Object.assign({ look: 'b_laxmus', bellShot: 'blood', spd: 70 }, B1));
defBoss('b10_sedi', 'kronker', 'Sedi-Riese im Vulkan', 17000, { model: 'sedi', bellShot: 'bell', r: 48, scale: 1.2 });
const R_DHAMPIR = { ghoul: 'e10_dh', bat: 'e10_dh', knight: 'e10_dhK', witch: 'e10_dhS', brute: 'e10_dhB', captain: 'e10_dhC' };
const R_GILDE = { ghoul: 'e10_trav', bat: 'e10_trav', knight: 'e10_axt', witch: 'e10_eis', brute: 'e10_hammer', captain: 'e10_gilde' };
const R_MARS = { ghoul: 'e10_insekt', bat: 'e10_flug', knight: 'e10_panzer', witch: 'e10_saeure', brute: 'e10_brut', captain: 'c3_koenigB' };
const R_ROT = { ghoul: 'e10_rot', bat: 'c5_fleder', knight: 'e10_rotR', witch: 'e10_rotB', brute: 'e5_bsRiese', captain: 'e10_guard' };
const R_ROBOT = { ghoul: 'e10_bot', bat: 'e7_heu', knight: 'e10_botK', witch: 'e10_botL', brute: 'e7_king', captain: 'e8_dK' };
const R_TURM = { ghoul: 'e10_sedi', bat: 'e9_auge', knight: 'e10_sediK', witch: 'e5_feuerkroete', brute: 'e9_affe', captain: 'c3_koenigB' };
const ETAPPE10 = {
  title: 'Die Rückkehr einer Legende', place: 'Das Jahr 1016 · Mars-Basis · Chained-Anwesen · Green City · Turm der Amra', src: 'Kapitel 1573–1758', theme: 'himmel', ch: 11,
  levels: [
    { name: 'Das Jahr 1016', type: 'survive', dur: 160, pace: 1.7, theme: 'basisnacht', roles: R_DHAMPIR, comp: ['peter', 'minny'],
      text: 'Finn erwacht in einem fremden Apartment, Peter und die kleine Minny bei ihm. Der Kalender zählt „nach Quinn“. Überall Ringe, die Vampire erkennen – und Dhampire, die sie jagen.' },
    { name: 'Die Gilden', type: 'hunt', role: 'knight', n: 40, pace: 1.8, theme: 'schlachtfeld', roles: R_GILDE, comp: ['peter'],
      text: 'Auf Finns Kopf ist ein Kopfgeld ausgesetzt. Gilden-Traveller mit Riesenäxten und Eisstrahlen stürmen ein friedliches Viertel. Peter fängt eine Axt mit festem Qi an den Fingern.' },
    { name: 'Tikker', type: 'duel', foe: 'b10_tikker', crowd: 0.3, theme: 'bestienplanet', roles: R_ROT, comp: ['peter'],
      text: 'Die Roten Vampire tragen Laxmus’ Zeichen. Tikker – schwarze Haut, lippenloser Mund voller Zähne – will ein Dorf überfallen und die Schuld den Travellern zuschieben.' },
    { name: 'Die Horden vom Mars', type: 'survive', dur: 190, pace: 1.8, theme: 'rotezone', roles: R_MARS, comp: ['peter'], elites: 3,
      text: 'Riesige Mauern teilen den Mars in Wohn- und Bestienzonen. Die Horden kommen in Wellen, gesteuert von einem Schwarmverstand. Ihre Säure brennt sogar durch Peters festes Qi.' },
    { name: 'Der Hybrid-Werwolf', type: 'duel', foe: 'b10_werwolf', crowd: 0.3, theme: 'rotezone', roles: R_MARS,
      text: 'Die Werwölfe wurden einst von den Vampiren ausgerottet. Dieser ist eine Züchtung, und das Qi in seinen Klauen lässt keine Wunde heilen. Finns Schattenflügel blocken ohne jeden Verbrauch.' },
    { name: 'Derik', type: 'duel', foe: 'b10_derik', crowd: 0.2, theme: 'basisnacht', roles: R_ROT,
      text: 'Während Finn fort ist, entführen die Roten Vampire Lucia als „Versicherung“. Ihr Vize Derik erfährt, was ein Schattenfresser ist – ein Schlangendrache, der den Schatten raubt.' },
    { name: 'Andy Sanguini', type: 'duel', foe: 'b10_andy', crowd: 0.1, theme: 'burg', roles: R_ROT,
      text: 'Der Kommandant des Vampire Corps trägt einen Dämonen-Brustpanzer und Fäden wie seine Familie. Er ist ein kolossaler Draugr – und er will wissen, wer dieser „Nate“ wirklich ist.' },
    { name: 'Das Chained-Anwesen', type: 'survive', dur: 180, pace: 1.9, theme: 'siedlung', roles: R_CHAINED, comp: ['peter', 'minny'], elites: 3,
      text: 'Ein Luxusresort voller roter Rosen, „ein Meer aus Blut für meine Braut“. Die neuen Chained haben Fähigkeiten, die die Welt nie gesehen hat. Jessica ist ihre Gefangene.' },
    { name: 'Lock und Clicker', type: 'duel', foe: 'b10_lock', crowd: 0.3, theme: 'siedlung', roles: R_CHAINED, comp: ['peter'],
      text: 'Clicker teleportiert mit jedem Schnipsen, Lock drückt alles mit Schwerkraft nieder. Peter in seiner Celestial-Form ignoriert die Schwerkraft einfach.' },
    { name: 'Russ, der God Slayer', type: 'endure', foe: 'b10_russ', dur: 80, crowd: 0.2, theme: 'siedlung', roles: R_CHAINED,
      text: 'Der Anführer der Chained hat Schatten, die Finns Bohrer stoppen, und einen Kristall mit der Kraft eines God Slayers. Finns Blut spürt seines nicht. Bis Finn begreift, wie Celestial-Energie im Blut wirkt.' },
    { name: 'Chris mit Werwolf-DNA', type: 'duel', foe: 'b10_chris', crowd: 0.1, theme: 'ruinen', roles: R_GILDE,
      text: 'Graues Werwolffell bis zu den Ellbogen, rote Haut von Qi-Stufe 4. „Du warst mein bester Schüler.“ Der alte Lehrer arbeitet jetzt für Zero.' },
    { name: 'Die schwarzen Roboter', type: 'hunt', role: 'ghoul', n: 80, pace: 1.9, theme: 'goetter', roles: R_ROBOT, comp: ['peter'],
      text: 'Logans große Challenge: über tausend Teilnehmer gegen hundert Roboter aus Darkrock mit Demi-God-Kernen. Das Publikum fragt: Wer würde gewinnen – der Crazy Bloodlord oder Peter?' },
    { name: 'Die Guardians', type: 'survive', dur: 170, pace: 1.9, theme: 'goetter', roles: R_ROT, comp: ['peter', 'minny'], elites: 4,
      text: 'Die stärksten Roten Vampire reisen durch Schatten. Ihr Anführer ist Ashley, einst Pauls rechte Hand. Minny weint rote Tränen, Lavaschuppen wachsen an ihren Armen.' },
    { name: 'Laxmus’ Schatten', type: 'endure', foe: 'b10_laxmus', dur: 80, crowd: 0.2, theme: 'goetter', roles: R_ROT, comp: ['peter'],
      text: 'Laxmus’ Druck lässt Zuschauer ohnmächtig werden. Seine Schattenhände packen alle, nichts verletzt sie. Er reißt Vincent das rote Herz aus der Brust.' },
    { name: 'Der Turm der Amra', type: 'duel', foe: 'b10_sedi', crowd: 0.4, theme: 'roterhimmel', roles: R_TURM, evo: 'Celestial-Vampir',
      text: 'Auf einem fremden Planeten mit drei Monden und zwanzigfacher Schwerkraft steht ein Turm mit hundert Etagen voller Prüfungen. Im Vulkan wartet ein Riese, den noch niemand so besiegt hat.' }
  ]
};

/* ------------------------------------------------------------ Etappe 11: Die Königin der Dhampire (Kapitel 1759–1985) */
defEnemy('e11_soldat', 'ghoul', 'h_sunshield', 'Marpo-Soldat', { hp: 72 });
defEnemy('e11_dreizack', 'knight', 'h_wache', 'Dreizack-Krieger', { armor: 9 });
defEnemy('e11_wasser', 'witch', 'h_seherin', 'Wassernutzer', { shot: 'soul', flier: false });
defEnemy('e11_wels', 'brute', 'q_fort', 'Welsmann', { splits: 0, hp: 460 });
defEnemy('e11_kom', 'captain', 'h_wache', 'Kommandant mit goldblauem Dreizack', { scale: 1.3, hp: 8000 });
defEnemy('e11_fisch', 'ghoul', 'q_kanal', 'Predator-Fisch', { hp: 72, spd: 88 });
defEnemy('e11_rochen', 'bat', 'bat_void', 'Rochen', { hp: 56 });
defEnemy('e11_qualle', 'witch', 'q_spore', 'Qualle', { shot: 'acid', flier: false });
defEnemy('e11_see', 'brute', 'q_alienM', 'Tiefseemonster', { splits: 0, hp: 460 });
defEnemy('e11_cel', 'ghoul', 'q_void', 'Niederer Celestial', { hp: 74 });
defEnemy('e11_celK', 'knight', 'q_panzer', 'Celestial-Wächter', { armor: 9 });
defEnemy('e11_celS', 'witch', 'g_seherin', 'Celestial-Seherin', { shot: 'light', flier: false });
defEnemy('e11_celC', 'captain', 'g_diener', 'Celestial-Diener', { scale: 1.3, hp: 8200 });
defEnemy('e11_tent', 'ghoul', 'q_void', 'Tentakelauge', { hp: 74 });
defEnemy('e11_daemon', 'knight', 'q_panzer', 'Dämon aus dem Portal', { armor: 9 });
defEnemy('e11_pflanze', 'witch', 'q_spore', 'Pflanzenkopf', { shot: 'acid', flier: false });
defEnemy('e11_fleisch', 'brute', 'q_alienM', 'Fleischklumpen', { splits: 0, hp: 480 });
defEnemy('e11_dC', 'captain', 'q_daemon', 'Dämonenhauptmann', { scale: 1.3, hp: 8500 });
defBoss('b11_athos', 'kronker', 'Athos, Celestial des Turms', 20000, { model: 'athos', bellShot: 'light', r: 40 });
defBoss('b11_laxmus', 'original', 'Laxmus', 60000, Object.assign({ look: 'b_laxmus', bellShot: 'blood', spd: 70 }, B1));
defBoss('b11_laser', 'graham', 'Dalki mit Augenlaser', 20000, { model: 'laserdalki', bellShot: 'light', r: 36 });
defBoss('b11_yanny', 'mono', 'Yanny, der falsche König', 19000, Object.assign({ look: 'b_yanny', bellShot: 'soul' }, B1));
defBoss('b11_zero', 'mono', 'Zero, Anführer von Pure', 60000, Object.assign({ look: 'b_zero', bellShot: 'light', spd: 76 }, B1));
defBoss('b11_chris', 'kronker', 'Chris als roter Werwolf', 20000, { model: 'werwolfR', bellShot: 'spike', r: 40, spd: 82 });
defBoss('b11_hinto', 'kronker', 'Hinto aus dem roten Celestial-Raum', 22000, { model: 'hinto', bellShot: 'bell', r: 40 });
defBoss('b11_kipo', 'mono', 'Kipo (Celestial)', 22000, Object.assign({ look: 'b_kipo', bellShot: 'light', armor: 8 }, B1));
defBoss('b11_gorgath', 'kronker', 'Gorgath (Celestial)', 24000, { model: 'gorgath', bellShot: 'bell', r: 46 });
defBoss('b11_erin', 'erin', 'Emma, Königin der Dhampire', 26000, Object.assign({ look: 'b_erinD', bellShot: 'light', spd: 78 }, B1));
defBoss('b11_escam', 'kronker', 'Escam, General Immortuis', 24000, { model: 'escam', bellShot: 'blood', r: 44 });
const R_MARPO = { ghoul: 'e11_soldat', bat: 'e11_soldat', knight: 'e11_dreizack', witch: 'e11_wasser', brute: 'e11_wels', captain: 'e11_kom' };
const R_MEER = { ghoul: 'e11_fisch', bat: 'e11_rochen', knight: 'e5_krabbe', witch: 'e11_qualle', brute: 'e11_see', captain: 'c3_koenigB' };
const R_CELEST = { ghoul: 'e11_cel', bat: 'e6_irrlicht', knight: 'e11_celK', witch: 'e11_celS', brute: 'e6_riese', captain: 'e11_celC' };
const R_PORTAL = { ghoul: 'e11_tent', bat: 'e9_auge', knight: 'e11_daemon', witch: 'e11_pflanze', brute: 'e11_fleisch', captain: 'e11_dC' };
const ETAPPE11 = {
  title: 'Die Königin der Dhampire', place: 'Turm der Amra · Rote Vampire · Marpo-Kreuzfahrt · Mercil · Mars · Portal des Todesgottes', src: 'Kapitel 1759–1985', theme: 'redspace', ch: 11,
  levels: [
    { name: 'Athos', type: 'duel', foe: 'b11_athos', crowd: 0.3, theme: 'roterhimmel', roles: R_TURM, comp: ['sil'],
      text: 'Der Turm ist die Waffe eines Celestials. Athos hat seinen eigenen Vater getötet, um dessen Platz zu nehmen, und lässt die Schwerkraft tausendfach wirken. Sil ist zurück – mit Klonen und Voraussicht.' },
    { name: 'Die Siedlung der Roten', type: 'survive', dur: 180, pace: 1.9, theme: 'himmel', roles: R_ROT, comp: ['lena'], elites: 3,
      text: 'Auf einem Eisplaneten liegt die unterirdische Siedlung der Roten Vampire. Lena war all die Jahre ihre Doppelagentin. Ihr schwarzes Schwert spricht zu ihr – mit Schreien.' },
    { name: 'Laxmus fällt', type: 'endure', foe: 'b11_laxmus', dur: 80, crowd: 0.2, theme: 'himmel', roles: R_ROT, comp: ['peter', 'lena'],
      text: 'Laxmus zerschlägt Eisspuren mit bloßer Kraft. Am Ende erweckt Peter ihn mit Celestial-Kraft als kleinen Wight – der erste König als Marionette.' },
    { name: 'Die Marpo-Kreuzfahrt', type: 'survive', dur: 180, pace: 1.9, theme: 'schlachtfeld', roles: R_MARPO, comp: ['sil'], elites: 3,
      text: 'Eine Luxusreise für die Reichsten vieler Galaxien. Durch fünf Decks schlägt ein Loch: zweihundert Soldaten mit bläulichem Blut, angeführt von einem Kommandanten mit goldblauem Dreizack.' },
    { name: 'Der Dalki-Kapitän', type: 'duel', foe: 'b11_laser', crowd: 0.3, theme: 'schlachtfeld', roles: R_MARPO,
      text: 'Ein Dalki – achthundert Jahre nach dem Aussterben. Ab dem fünften Stachel haben Dalki angeborene Merkmale, doch dieser hat eine echte Fähigkeit: Laser aus den Augen.' },
    { name: 'Die Stadt unter dem Meer', type: 'hunt', role: 'ghoul', n: 100, pace: 1.9, theme: 'goetter', roles: R_MEER, comp: ['sil'],
      text: 'Die Schwestern werden zu Meerjungfrauen und kehren nach Mercil heim. Berggroße Tiefseemonster umkreisen die Stadt, Predator-Fische jagen alles, was schwimmt.' },
    { name: 'Yanny', type: 'waveboss', at: 80, foe: 'b11_yanny', pace: 1.9, theme: 'goetter', roles: R_MEER, comp: ['sil'],
      text: 'Mitten in Yannys Krönung. Er hat Winces Vater ermordet und führt die Predator-Fische und zehn Generäle. Sil hebt die ganze Stadt durch die Meeresoberfläche.' },
    { name: 'Leos letzter Hieb', type: 'endure', foe: 'b11_zero', dur: 80, crowd: 0.2, theme: 'bestienplanet', roles: R_DHAMPIR, comp: ['leo'],
      text: 'Vor tausend Jahren: Leo übt auf einer einsamen Insel einen einzigen Hieb, jeden Tag 0,02 Sekunden schneller. Dann kommt Zero mit einem weißen Schwert, das mit einem unsichtbaren Hieb das Meer teilt.' },
    { name: 'Chris als roter Werwolf', type: 'duel', foe: 'b11_chris', crowd: 0.2, theme: 'ruinen', roles: R_DHAMPIR,
      text: 'Auf Pures Schiff „Rein“ verwandelt sich Chris teilweise: graues Fell, Klauen, gelbe Augen. Er absorbiert einen Kanonenstrahl. Ein einziger Schlag von Finn schleudert ihn weg – aber er steht immer wieder auf.' },
    { name: 'Die größte Welle', type: 'survive', dur: 200, pace: 2.0, theme: 'rotezone', roles: R_MARS, comp: ['minny'], elites: 4,
      text: 'Urlaub auf dem Mars, sagt Finn zu Minny. Dann kommt die größte Welle aller Zeiten: fünfzehntausend Biester, Hunderte davon Demi-God, und eine Dämonen-Schnecke.' },
    { name: 'Hinto', type: 'duel', foe: 'b11_hinto', crowd: 0.3, theme: 'schlachtfeld', roles: R_CELEST, comp: ['peter', 'chris'],
      text: 'Ein Celestial aus dem roten Raum: lila Körper mit Hufen, Rasiermesserzähne, schwarze Flammen. Chris in Wolfsform, Peter als Reiter – und Arme aus gehärtetem Blut.' },
    { name: 'Kipo', type: 'duel', foe: 'b11_kipo', crowd: 0.3, theme: 'himmel', roles: R_CELEST, comp: ['sil'],
      text: 'Weiße Haut, schwarze Muster, nackt. Kipo geht durch Blitzbolzen, Feuerfäuste und Säureschlangen einfach hindurch. Zwölf Sil-Klone mit Dämonenwaffen verstärken einander.' },
    { name: 'Gorgath', type: 'duel', foe: 'b11_gorgath', crowd: 0.3, theme: 'roterhimmel', roles: R_CELEST, comp: ['emma'],
      text: 'Auf einem Lavaplaneten viermal so groß wie die Erde suchen Emma, Zero und Agent Four Dämonenkristalle. Ein Celestial-Gesandter namens Gorgath will sie aufhalten.' },
    { name: 'Finn gegen Emma', type: 'duel', foe: 'b11_erin', crowd: 0.1, theme: 'bestienplanet', roles: R_DHAMPIR,
      text: 'Emma hat Fex, Samantha, Owen und Leo getötet. Tausend Blutschwerter, Schattenkugeln, Nitro – und ihre Dhampir-Energie wirkt auf Finn wie Sonnenlicht. Dann versteht er: Sie wurde kontrolliert.' },
    { name: 'Das Portal schließen', type: 'duel', foe: 'b11_escam', crowd: 0.5, theme: 'redspace', roles: R_PORTAL, comp: ['fex', 'minny'],
      text: 'Aus dem Magiekreis wächst ein Tentakel mit hunderten Augen. Escam, der General des Todesgottes Immortui, tritt hindurch. Minny fängt das fallende rote Herz: „Das gehört meinem Papa!“' }
  ]
};

/* ------------------------------------------------------------ Etappe 12: Die vergessene Legende (Kapitel 1986–2107) */
defEnemy('e12_leucht', 'ghoul', 'q_spore', 'Leuchtpflanzen-Bestie', { hp: 78 });
defEnemy('e12_eule', 'bat', 'bat_licht', 'Nachteule', { hp: 62 });
defEnemy('e12_geweih', 'knight', 'q_panzer', 'Geweih-Bestie', { armor: 9 });
defEnemy('e12_ranke', 'witch', 'q_kroete', 'Rankenspucker', { shot: 'acid', flier: false });
defEnemy('e12_riese', 'brute', 'q_koenig', 'Dschungelriese', { splits: 0, hp: 500 });
defEnemy('e12_alpha', 'captain', 'q_koenig', 'Alpha-Bestie', { scale: 1.3, hp: 8800 });
defEnemy('e12_verm', 'ghoul', 'v_wache', 'Vermummter Attentäter', { hp: 78 });
defEnemy('e12_vermK', 'knight', 'v_ritter', 'Viscount-Wache', { armor: 9 });
defEnemy('e12_vermS', 'witch', 'v_magier', 'Blutschütze', { shot: 'blood', flier: false });
defEnemy('e12_visc', 'captain', 'v_ritter', 'Viscount der dritten Familie', { scale: 1.3, hp: 8800 });
defEnemy('e12_nam', 'ghoul', 'h_sunshield', 'Namrik-Soldat', { hp: 80 });
defEnemy('e12_namF', 'bat', 'bat_void', 'Namrik-Drohne', { hp: 62 });
defEnemy('e12_namK', 'knight', 'h_wache', 'Namrik-Wache', { armor: 9 });
defEnemy('e12_namB', 'witch', 'h_truedream', 'Blaster-Schütze', { shot: 'light', flier: false });
defEnemy('e12_namM', 'brute', 'h_koloss', 'Namrik-Mech', { splits: 0, hp: 500 });
defEnemy('e12_gouv', 'captain', 'h_wache', 'Namrik-Gouverneur', { scale: 1.3, hp: 8800 });
defBoss('b12_edvard', 'silva', 'Edvard Fortuna (Original)', 22000, Object.assign({ look: 'b_edvard', bellShot: 'soul', spd: 74 }, B1));
defBoss('b12_nell', 'mono', 'Nell Holland (Wachenturnier)', 20000, Object.assign({ look: 'b_nell', bellShot: 'spike' }, B1));
defBoss('b12_ranke', 'krabbe', 'Der Rankenmensch', 19500, { model: 'rankenmensch', bellShot: 'acid', r: 40 });
defBoss('b12_eule', 'kronker', 'Die graue Eule', 19500, { model: 'eule', bellShot: 'soul', r: 42 });
defBoss('b12_grenlet', 'silva', 'Grenlet Toppy (Original)', 21000, Object.assign({ look: 'b_grenlet', bellShot: 'blood' }, B1));
defBoss('b12_spinne', 'krabbe', 'Der Spinnenfels (Demon-Tier)', 23000, { model: 'spinnenfels', bellShot: 'spike', r: 56 });
defBoss('b12_prophet', 'kronker', 'Der Prophet der Namriks', 25000, { model: 'prophet', bellShot: 'light', r: 40 });
defBoss('b12_magnus', 'stahlmann', 'Magnus Muscat (Original)', 26000, Object.assign({ look: 'b_magnus', bellShot: 'blood', armor: 9 }, B1));
defBoss('b12_ray', 'kronker', 'Ray Talen, der rote Drache', 60000, { model: 'raydrache', bellShot: 'bell', r: 44, spd: 76 });
defBoss('b12_jim', 'jim', 'Jim Eno mit dem X-Blut', 30000, Object.assign({ look: 'b_jim', bellShot: 'blood', spd: 72 }, B1));
const R_DAISY = { ghoul: 'e12_leucht', bat: 'e12_eule', knight: 'e12_geweih', witch: 'e12_ranke', brute: 'e12_riese', captain: 'e12_alpha' };
const R_ATTENTAT = { ghoul: 'e12_verm', bat: 'c5_fleder', knight: 'e12_vermK', witch: 'e12_vermS', brute: 'e5_bsRiese', captain: 'e12_visc' };
const R_NAMRIK = { ghoul: 'e12_nam', bat: 'e12_namF', knight: 'e12_namK', witch: 'e12_namB', brute: 'e12_namM', captain: 'e12_gouv' };
const ETAPPE12 = {
  title: 'Die vergessene Legende', place: 'Vampirsiedlung auf dem Daisy-Planeten · leuchtender Dschungel · Namrik-Welt', src: 'Kapitel 1986–2107', theme: 'bestienplanet', ch: 12,
  levels: [
    { name: 'Niemand kennt Finn Müller', type: 'duel', foe: 'b12_edvard', crowd: 0.2, theme: 'siedlung', roles: R_ATTENTAT, comp: ['minny'],
      text: 'Die Vampirgesellschaft ist neu aufgebaut. In der vollen Taverne kennt niemand den Namen des alten Königs – alle seine Taten gehören jetzt Jim Eno. Der Original Edvard lacht ihn aus und weicht jedem Schwert mit Glück aus.' },
    { name: 'Das Wachenturnier', type: 'duel', foe: 'b12_nell', crowd: 0.05, theme: 'burg', roles: R_ATTENTAT,
      text: 'Zwei Monate später ist Finn ein einfacher Wachmann der neunten Familie. Im Energiekäfig des Turniers wartet Nell mit ihren Gelenkhebeln – und Finn kämpft nur mit Technik.' },
    { name: 'Der leuchtende Dschungel', type: 'hunt', role: 'ghoul', n: 100, pace: 1.8, theme: 'bestienplanet', roles: R_DAISY, comp: ['minny'],
      text: 'Eine Expedition durch die Pflanzen der alten Daisy-Fraktion. Endlose Bestienwellen – doch die drei Wachen bleiben seltsam unbehelligt.' },
    { name: 'Der Rankenmensch', type: 'duel', foe: 'b12_ranke', crowd: 0.3, theme: 'bestienplanet', roles: R_DAISY,
      text: 'Wände aus nachwachsenden Ranken, ein Pfad einen Berg hinauf. „Keine Sorge, Ronkin, du wirst deine Familie sehen.“ Finn legt den Rucksack ab und tritt vor.' },
    { name: 'Die Horde über der Schule', type: 'survive', dur: 200, pace: 1.9, theme: 'siedlung', roles: R_DAISY, comp: ['minny'], elites: 4,
      text: 'Alarm: Eine Bestienhorde fällt über die Siedlung her, jede Welle stärker. Minny säubert die Schule Stockwerk für Stockwerk – und benutzt dabei viel mehr als „nur zehn Prozent“.' },
    { name: 'Die graue Eule', type: 'duel', foe: 'b12_eule', crowd: 0.3, theme: 'bestienplanet', roles: R_DAISY,
      text: 'Eine Eule, so groß wie ein Haus, speit einen grauen Tornado. Finn kontert mit einem Blutwirbel. Ein hellvioletter Schatten dringt aus seinen Poren in die Bestien.' },
    { name: 'Die Vermummten', type: 'hunt', role: 'knight', n: 35, pace: 1.8, theme: 'siedlung', roles: R_ATTENTAT, comp: ['minny'],
      text: 'Sechs Vermummte mit roten Bestiendolchen, eine Schweigekugel, die keine Hilfe durchlässt. Ihr Ziel: Abby und Minny. Finn bleibt ruhig – und rasend.' },
    { name: 'Grenlet', type: 'duel', foe: 'b12_grenlet', crowd: 0.2, theme: 'burg', roles: R_ATTENTAT,
      text: 'Der Auftrag kam aus der dritten Familie. Vor dem Schloss liegen alle Wachen tot. Der Original Grenlet trägt einen Flakon mit Jims Blut – und sieht Finns Schattendrachen.' },
    { name: 'Der Spinnenfels', type: 'duel', foe: 'b12_spinne', crowd: 0.2, theme: 'bestienplanet', roles: R_DAISY,
      text: 'Auf einem Grasplaneten erhebt sich ein berggroßer Felsbrocken auf Spinnenbeinen – eine Bestie der Dämonen-Stufe. Galen ist gerade geboren, und Finn will nach Hause.' },
    { name: 'Krieg gegen die Namriks', type: 'survive', dur: 170, pace: 1.5, theme: 'goetter', roles: R_NAMRIK, elites: 2,
      text: 'Dalki, Menschen und Vampire kämpfen gemeinsam gegen die Namriks, die die Marpo-Kreuzfahrt angegriffen haben. Einmannkapseln durchbrechen den Energieschild, Blasterstrahlen überall.' },
    { name: 'Der Prophet', type: 'duel', foe: 'b12_prophet', crowd: 0.3, theme: 'goetter', roles: R_NAMRIK,
      text: 'Die Namriks vertrauen ihrem Propheten blind. Er ist ein Celestial – und er wundert sich, warum er Finn, den God Slayer, nicht vorhergesehen hat.' },
    { name: 'Magnus Muscat', type: 'duel', foe: 'b12_magnus', crowd: 0.2, theme: 'burg', roles: R_ATTENTAT,
      text: '„Nell Holland starb für nichts – Jim ist ein Betrüger.“ Der Original der sechsten Familie, einst König im zweiten Bürgerkrieg, will Finn dafür töten.' },
    { name: 'Ray Talen', type: 'endure', foe: 'b12_ray', dur: 80, crowd: 0.1, theme: 'goetter', roles: R_NAMRIK,
      text: 'Jims gefürchteter Leibwächter ist Ray Talen – Finns Ahnherr, einst der rote Drache, dessen Macht den Menschen ihre Fähigkeiten gab. Keine Kugel wirkt gegen seine Drachenrüstung.' },
    { name: 'Jim Eno', type: 'duel', foe: 'b12_jim', crowd: 0.3, theme: 'goetter', roles: R_NAMRIK, evo: 'Vampir-Dämonenform',
      text: 'Jim hat X-Blut getrunken und ist stark wie aus Bestienkristallen. Er spielt vor den Originals den Helden: „Du Dämon, der die Originals verfluchte!“ Zeit, die Wahrheit zu zeigen.' }
  ]
};

/* ------------------------------------------------------------ Etappe 13: Gottbezwinger (Kapitel 2108–2305) */
defEnemy('e13_d3', 'ghoul', 'dalki3', 'Drei-Stachel-Dalki mit Fähigkeit', { hp: 92 });
defEnemy('e13_d4', 'knight', 'dalki4', 'Vier-Stachel mit Stahlhaut', { armor: 10 });
defEnemy('e13_dS', 'witch', 'dalki5', 'Laser-Dalki', { shot: 'light', flier: false });
defEnemy('e13_dB', 'brute', 'dalki6', 'Dalki-Brecher', { splits: 0, hp: 560 });
defEnemy('e13_d5', 'captain', 'dalkiW', 'Fünf-Stachel-Dalki', { scale: 1.35, hp: 9800 });
defEnemy('e13_vamp', 'ghoul', 'v_wache', 'Vampir mit Stufe-5-Blut', { hp: 92 });
defEnemy('e13_vampR', 'knight', 'v_ritter', 'Wache der Originals', { armor: 10 });
defEnemy('e13_explo', 'witch', 'v_magier', 'Explosivblut-Nutzer', { shot: 'blood', flier: false });
defEnemy('e13_orig', 'captain', 'v_ritter', 'Original der alten Familien', { scale: 1.35, hp: 9800 });
defBoss('b13_h', 'graham', 'H (acht Stacheln)', 60000, { model: 'hproj', bellShot: 'light', r: 38, spd: 78 });
defBoss('b13_stark', 'mono', 'Stark, der schnellste Penswi', 24000, Object.assign({ look: 'b_stark', bellShot: 'soul', spd: 96 }, B1));
defBoss('b13_mundus', 'kronker', 'Mundus, Bote der Alten', 60000, { model: 'mundus', bellShot: 'light', r: 40, spd: 50 });
defBoss('b13_affe', 'kronker', 'Der Affenkönig (God Slayer)', 28000, { model: 'affe', bellShot: 'spike', r: 38, spd: 80 });
defBoss('b13_phoenix', 'kronker', 'Der Phönix (God Slayer)', 30000, { model: 'phoenix', bellShot: 'bell', r: 48 });
defBoss('b13_behemoth', 'kronker', 'King Behemoth (God Slayer)', 34000, { model: 'behemoth', bellShot: 'spike', r: 60, scale: 1.3, spd: 36 });
defBoss('b13_asura', 'kronker', 'Asura, der erste God Slayer', 32000, { model: 'asura', bellShot: 'blood', r: 42, spd: 78 });
defBoss('b13_pine', 'graham', 'Pine (sieben Stacheln)', 30000, { model: 'pine', bellShot: 'light', r: 38 });
defBoss('b13_sera', 'stahlmann', 'Sera, Gott des Krieges', 30000, Object.assign({ look: 'b_sera', bellShot: 'spike', armor: 10 }, B1));
defBoss('b13_chris', 'kronker', 'Chris und Peter', 30000, { model: 'werwolfR', bellShot: 'spike', r: 40, spd: 84 });
defBoss('b13_h10', 'graham', 'H (zehn Stacheln)', 34000, { model: 'h10', bellShot: 'light', r: 40, spd: 76 });
defBoss('b13_ray', 'kronker', 'Ray Talen in der Drachenrüstung', 38000, { model: 'raydrache', bellShot: 'bell', r: 44, spd: 80 });
const R_DALKI13 = { ghoul: 'e13_d3', bat: 'e7_d1', knight: 'e13_d4', witch: 'e13_dS', brute: 'e13_dB', captain: 'e13_d5' };
const R_ORIG = { ghoul: 'e13_vamp', bat: 'c5_fleder', knight: 'e13_vampR', witch: 'e13_explo', brute: 'e5_bsRiese', captain: 'e13_orig' };
const ETAPPE13 = {
  title: 'Gottbezwinger', place: 'Alte Siedlung · Paranium · Mermerial-Planet · Welten der God Slayer · Amra-Planet', src: 'Kapitel 2108–2305', theme: 'goetter', ch: 13,
  levels: [
    { name: 'Projekt H', type: 'endure', foe: 'b13_h', dur: 80, crowd: 0.4, theme: 'ruinen', roles: R_DALKI13, comp: ['sil'],
      text: 'Ein menschenähnlicher Dalki mit acht Stacheln, Blitzen und dem Gesicht der Blades: H, gebaut aus Hilstons DNA und sechs gestohlenen Fähigkeiten. Er schmilzt Bordens Gesicht. Sil schickt alle fort und bleibt allein.' },
    { name: 'Das Planetenturnier', type: 'duel', foe: 'b13_stark', crowd: 0, theme: 'goetter', roles: R_CELEST,
      text: 'Auf Paranium leben die Penswi – lila, dünn und unfassbar schnell. Im Finale „King of Tag“ trägt Stark die Marke. Finn wird immer schneller … und dann: Nitro.' },
    { name: 'Mundus hält die Zeit an', type: 'endure', foe: 'b13_mundus', dur: 60, crowd: 0.1, theme: 'himmel', roles: R_CELEST, comp: ['lena', 'minny'],
      text: 'Der Bote der Alten will Galen, einen unvollständigen Celestial. Die Zeit steht still – nur Lena bewegt sich, mit blutenden Augen. Minny holt Finns Geschenk aus dem Schatten: einen Ring, der den Raum beherrscht.' },
    { name: 'Der Affenkönig', type: 'duel', foe: 'b13_affe', crowd: 0.1, theme: 'basisnacht', roles: R_CELEST,
      text: 'Der erste von fünf God Slayern: ein Affe im goldenen Kettenhemd, sein Stab wächst zu einer hausdicken Säule, Rauchklone überall. Finns Seelenwaffe erwacht neu – Shadow Mist.' },
    { name: 'Der Phönix', type: 'duel', foe: 'b13_phoenix', crowd: 0.1, theme: 'roterhimmel', roles: R_CELEST,
      text: 'Es gibt immer nur einen Phönix. Seine Flammen wirken auf Vampire wie Sonnenlicht, und die brennende Welt heilt ihn. Nur im Schattenraum kann er nicht heilen.' },
    { name: 'King Behemoth', type: 'duel', foe: 'b13_behemoth', crowd: 0.3, theme: 'redspace', roles: R_CELEST,
      text: 'Der König der Bestien: Widderhörner bis in die Wolken, so schwer, dass der Planet bebt. Nichts hat ihn je verletzt. Finn wählt die Dämonenform – und wacht erst Monate später wieder auf.' },
    { name: 'Asura', type: 'duel', foe: 'b13_asura', crowd: 0.1, theme: 'goetter', roles: R_CELEST,
      text: 'Der erste God Slayer meditiert, um seinen Zorn loszuwerden. Dann wachsen ihm sechs Arme. Finn mischt Schatten und Blut zum Blutschatten – jeder Treffer schlägt ein zweites Mal ein.' },
    { name: 'Dalki mit Fähigkeiten', type: 'survive', dur: 170, pace: 1.5, theme: 'roterhimmel', roles: R_DALKI13, elites: 2,
      text: 'Jacks schwarze Kapseln regnen auf die Planeten der Allianz: Dalki mit Metallhaut, Unsichtbarkeit und Regeneration, dazu menschliche Truppen, die nichts mehr von Finn wissen.' },
    { name: 'Die Originals greifen an', type: 'survive', dur: 180, pace: 1.7, theme: 'roterhimmel', roles: R_ORIG, elites: 3,
      text: 'Jim schickt die Originals gegen die Amra. Hikel sprengt Straßen, Biancas Python spuckt Säure. Geo fängt Explosivblut mit goldenen Händen ab – und aus dem Wald helfen Finns Schattenbestien.' },
    { name: 'Pine', type: 'duel', foe: 'b13_pine', crowd: 0.3, theme: 'roterhimmel', roles: R_DALKI13, comp: ['lena'],
      text: 'Ein Horn, sieben Stacheln: Pine absorbiert jede Fähigkeit mit den Handflächen und schickt sie als Regenbogenwelle zurück. Nur Celestial-Energie schmerzt ihn – und das schwarze Schwert.' },
    { name: 'Sera, Gott des Krieges', type: 'duel', foe: 'b13_sera', crowd: 0.3, theme: 'schlachtfeld', roles: R_ORIG,
      text: '„Wo Krieg ist, bin ich.“ Jede Waffe in Seras Hand wird zur Dämonenwaffe – Speere, zielsuchende Dolche, Sprengscheiben. Auf seinem Schlachtfeld greift er jede Klinge blitzschnell auf.' },
    { name: 'Chris und Peter', type: 'duel', foe: 'b13_chris', crowd: 0.2, theme: 'ruinen', roles: R_ORIG,
      text: 'In der neuen God-Slayer-Rüstung tritt Finn aus dem Turm. Zwei alte Freunde ohne Erinnerung stellen sich ihm in den Weg: der rote Werwolf und Peter mit dem Doppelschweif. Finn will sie nicht töten.' },
    { name: 'H mit zehn Stacheln', type: 'duel', foe: 'b13_h10', crowd: 0.3, theme: 'ruinen', roles: R_DALKI13, comp: ['sil', 'minny'],
      text: 'H hat Wince und Ceril getötet und alle Blades außer Shiro. Sil ist ausgezehrt, aber frei – und verwandelt sich mit einer kopierten Fähigkeit in den, den alle für den Stärksten halten.' },
    { name: 'Ray Talen', type: 'duel', foe: 'b13_ray', crowd: 0.1, theme: 'redspace', roles: R_CELEST, evo: 'God-Slayer-Rüstung',
      text: 'Jim ist tot. Aus dem Himmel schlägt ein roter Laser ein: Ray in der Drachenrüstung, fast wieder der alte. Seine gelbe Aura löscht jeden Schatten. Asuras Zorn erwacht in den Handschuhen.' }
  ]
};

/* ------------------------------------------------------------ Etappe 14: Dämonenkönige (Kapitel 2306–2470) */
defEnemy('e14_mark', 'ghoul', 'v_thrall', 'Gezeichneter Häftling', { hp: 96 });
defEnemy('e14_vet', 'knight', 'v_ritter', 'Gezeichneter Kriegsveteran', { armor: 10 });
defEnemy('e14_blutk', 'witch', 'v_magier', 'Blutklingen-Werfer', { shot: 'blood', flier: false });
defEnemy('e14_jared', 'captain', 'v_ritter', 'Gezeichneter Vampirritter', { scale: 1.35, hp: 10000 });
defEnemy('e14_swan', 'ghoul', 'h_sunshield', 'Dieb der Black Swans', { hp: 96 });
defEnemy('e14_swanK', 'knight', 'h_wache', 'Schläger der Black Swans', { armor: 10 });
defEnemy('e14_swanS', 'witch', 'h_truedream', 'Kristallschütze', { shot: 'light', flier: false });
defEnemy('e14_swanM', 'brute', 'h_koloss', 'Fabrik-Lademaschine', { splits: 0, hp: 560 });
defEnemy('e14_swanC', 'captain', 'h_blade', 'Anführer der Black Swans', { scale: 1.35, hp: 10000 });
defEnemy('e14_fam', 'ghoul', 'q_rot', 'Wilder Familiar', { hp: 96 });
defEnemy('e14_famF', 'bat', 'bat_braun', 'Flug-Familiar', { hp: 66 });
defEnemy('e14_famK', 'knight', 'q_panzer', 'Bohrer-Familiar', { armor: 10 });
defEnemy('e14_famS', 'witch', 'q_spore', 'Nebel-Familiar', { shot: 'acid', flier: false });
defEnemy('e14_famB', 'brute', 'q_koenig', 'Familiar-Koloss', { splits: 0, hp: 560 });
defEnemy('e14_famC', 'captain', 'q_daemon', 'Familiar-Fürst', { scale: 1.35, hp: 10000 });
defEnemy('e14_dem', 'ghoul', 'q_void', 'Dämon', { hp: 98, gore: 'void' });
defEnemy('e14_lesser', 'bat', 'bat_void', 'Lesser Demon', { hp: 68, gore: 'void' });
defEnemy('e14_loewe', 'knight', 'q_daemon', 'Löwenkopf-Fledermaus', { armor: 10, gore: 'void' });
defEnemy('e14_rotv', 'witch', 'h_rotvamp', 'Gezeichneter Vampir', { shot: 'blood', flier: false });
defEnemy('e14_bestie', 'brute', 'q_voidP', 'Furchtlose Bestie', { splits: 0, hp: 560, gore: 'void' });
defEnemy('e14_barbra', 'captain', 'h_rotvamp', 'Barbra mit Dämonenklauen', { scale: 1.35, hp: 10000 });
defEnemy('e14_durum', 'ghoul', 'q_rotP', 'Durum-Dämon', { hp: 100, gore: 'void' });
defEnemy('e14_splitter', 'bat', 'bat_blut', 'Kristallsplitter-Schwinge', { hp: 68 });
defEnemy('e14_durumK', 'knight', 'q_panzer', 'Durum mit Panzerrücken', { armor: 12, gore: 'void' });
defEnemy('e14_kristall', 'witch', 'q_rot', 'Kristallschleuderer', { shot: 'void', flier: false });
defEnemy('e14_durumB', 'brute', 'q_fort', 'Durum-Brecher', { splits: 0, hp: 580 });
defEnemy('e14_jaeger', 'captain', 'q_koenig', 'Durum-Jäger', { scale: 1.35, hp: 10500 });
defEnemy('e14_glut', 'ghoul', 'q_rotP', 'Glutton-Werwolf', { hp: 104, spd: 92 });
defEnemy('e14_glutK', 'knight', 'q_koenig', 'Glutton-Alpha', { armor: 10 });
defEnemy('e14_glutS', 'witch', 'q_kroete', 'Glutton-Heuler', { shot: 'void', flier: false });
defEnemy('e14_glutB', 'brute', 'q_alienM', 'Satter Glutton-Koloss', { splits: 0, hp: 600 });
defEnemy('e14_shinto', 'captain', 'g_diener', 'Champion Shinto', { scale: 1.4, hp: 11000 });
defEnemy('e14_divD', 'ghoul', 'h_ritter', 'Dunkler Divine', { hp: 100, gore: 'light' });
defEnemy('e14_divG', 'bat', 'bat_licht', 'Goldener Divine', { hp: 70, gore: 'light' });
defEnemy('e14_divK', 'knight', 'h_waechter', 'Divine-Speerträger', { armor: 11, gore: 'light' });
defEnemy('e14_divS', 'witch', 'h_seherin', 'Heilender Divine', { shot: 'light', flier: false, gore: 'light' });
defEnemy('e14_divB', 'brute', 'h_koloss', 'Divine-Koloss', { splits: 0, hp: 580, gore: 'light' });
defEnemy('e14_xox', 'captain', 'g_diener', 'Xox, der Gestaltwandler', { scale: 1.3, hp: 10500 });
defEnemy('e14_yak', 'ghoul', 'q_orange', 'Yak-Arbeiter', { hp: 100 });
defEnemy('e14_yakK', 'knight', 'q_panzer', 'Yak-Wache', { armor: 12 });
defEnemy('e14_yakS', 'witch', 'q_kanal', 'Yak-Kanonier', { shot: 'light', flier: false });
defEnemy('e14_yakB', 'brute', 'q_koenig', 'Yak-Schmied', { splits: 0, hp: 600 });
defEnemy('e14_yakC', 'captain', 'q_koenig', 'Yak-Vorarbeiter', { scale: 1.35, hp: 10500 });
defBoss('b14_magnus', 'kronker', 'Magnus in Albtraumform', 30000, { model: 'albtraum', bellShot: 'void', r: 40, spd: 82 });
defBoss('b14_general', 'kronker', 'Demon General (die blaue Hand)', 17000, { model: 'general', bellShot: 'soul', r: 58, scale: 1.3, spd: 40 });
defBoss('b14_lexor', 'kronker', 'Lexor, Durum-Dämonengeneral', 28000, { model: 'durum', bellShot: 'spike', r: 42, spd: 62, armor: 8 });
defBoss('b14_kronker', 'kronker', 'Kronker, Durum-Dämonenkönig', 32000, { model: 'kronker', bellShot: 'spike', r: 46, spd: 50, armor: 10 });
defBoss('b14_kronkerW', 'kronker', 'Kronkers wahre Form', 38000, { model: 'kronkerW', bellShot: 'void', r: 62, scale: 1.3, spd: 42 });
defBoss('b14_unzoku', 'kronker', 'Unzoku, der Allesverschlinger', 60000, { model: 'unzoku', bellShot: 'spike', r: 46, spd: 84 });
defBoss('b14_immortui', 'mono', 'Immortui', 90000, Object.assign({ look: 'b_immortui', bellShot: 'void', spd: 80 }, B1));
defBoss('b14_yakgen', 'kronker', 'Yak-General der Werft', 24000, { model: 'yakgen', bellShot: 'bell', r: 44, spd: 60 });
const R_MAL = { ghoul: 'e14_mark', bat: 'c5_fleder', knight: 'e14_vet', witch: 'e14_blutk', brute: 'e5_bsRiese', captain: 'e14_jared' };
const R_SWANS = { ghoul: 'e14_swan', bat: 'e12_namF', knight: 'e14_swanK', witch: 'e14_swanS', brute: 'e14_swanM', captain: 'e14_swanC' };
const R_FAM14 = { ghoul: 'e14_fam', bat: 'e14_famF', knight: 'e14_famK', witch: 'e14_famS', brute: 'e14_famB', captain: 'e14_famC' };
const R_LESSER = { ghoul: 'e14_dem', bat: 'e14_lesser', knight: 'e14_loewe', witch: 'e14_rotv', brute: 'e14_bestie', captain: 'e14_barbra' };
const R_DURUM = { ghoul: 'e14_durum', bat: 'e14_splitter', knight: 'e14_durumK', witch: 'e14_kristall', brute: 'e14_durumB', captain: 'e14_jaeger' };
const R_GLUTTON = { ghoul: 'e14_glut', bat: 'e14_lesser', knight: 'e14_glutK', witch: 'e14_glutS', brute: 'e14_glutB', captain: 'e14_shinto' };
const R_DIVINE = { ghoul: 'e14_divD', bat: 'e14_divG', knight: 'e14_divK', witch: 'e14_divS', brute: 'e14_divB', captain: 'e14_xox' };
const R_YAK = { ghoul: 'e14_yak', bat: 'e14_splitter', knight: 'e14_yakK', witch: 'e14_yakS', brute: 'e14_yakB', captain: 'e14_yakC' };
const ETAPPE14 = {
  title: 'Dämonenkönige', place: 'Siedlung · Erde · Insel der Runen · Zeathun, der rote Raum', src: 'Kapitel 2306–2470', theme: 'redspace', ch: 14,
  levels: [
    { name: 'Das Mal des Immortui', type: 'survive', dur: 150, pace: 1.5, theme: 'siedlung', roles: R_MAL, elites: 2,
      text: 'Ein Auge mit Fledermausflügeln, eingebrannt in die Handfläche. Wer das Mal trägt, spricht mit Immortuis Stimme – und es tauchen immer mehr Gezeichnete auf, im Gefängnis, in der Stadt, sogar an Minnys Schule.' },
    { name: 'Ich rette beide', type: 'hunt', role: 'witch', n: 45, pace: 1.5, theme: 'siedlung', roles: R_MAL,
      text: 'Auf einem Dach hält ein Gezeichneter Ronkin und ein kleines Waisenmädchen fest: Finn soll wählen, wen er rettet. Er wählt nicht. Ein Schattenklon bleibt stehen, der echte Finn schleicht lautlos hinter die Täter.' },
    { name: 'Die Black Swans', type: 'survive', dur: 150, pace: 1.4, theme: 'basisnacht', roles: R_SWANS, elites: 1,
      text: 'Getarnt als Rekrut „Bake“ dient Finn im Vampire Corps der Erde, bei Captain Jessica. Eine Diebesbande überfällt die Kristallfabrik. Regel für heute: keine Aura, nur Fäuste und Knie.' },
    { name: 'Magnus in Albtraumform', type: 'duel', foe: 'b14_magnus', crowd: 0.2, theme: 'schlachtfeld', roles: R_MAL,
      text: 'Magnus verliert einen Arm gegen Andy, den ersten Colossal Draugr – und verwandelt sich mit Immortuis Kraft in ein Albtraumwesen mit Schädelpanzer und Klauen. Er will Jessica, und er will sie lebend.' },
    { name: 'Der Aufstand der Familiars', type: 'survive', dur: 160, pace: 1.6, theme: 'siedlung', roles: R_FAM14, comp: ['peter'], elites: 2,
      text: 'Aus Portalen im Wald stürmen Familiar-Horden, und in der Siedlung beißen Familiars plötzlich ihre eigenen Besitzer. Peter trägt Finns Gesicht – und muss so tun, als wäre er Finn.' },
    { name: 'Die Insel der Runen', type: 'duel', foe: 'b14_general', crowd: 0.2, theme: 'schlachtfeld', roles: R_LESSER,
      text: 'Magnus öffnet mit Jessicas Blut ein Portal nach Zeathun. Lesser Demons quellen hervor, dann greift eine riesige blaue Hand hindurch: ein Demon General. Das System legt eine neue Rangliste an.' },
    { name: 'Das Jagdgebiet', type: 'survive', dur: 160, pace: 1.45, theme: 'redspace', roles: R_DURUM, elites: 1,
      text: 'Allein im roten Raum. In einem Wald aus Riesenbäumen jagen Durum-Dämonen die Skullys – ein Punkt pro Kreatur, fünf pro Skully. Die Splitter kommen aus drei Richtungen. Finn fängt sie mit bloßen Händen.' },
    { name: 'Lexor', type: 'duel', foe: 'b14_lexor', crowd: 0.3, theme: 'redspace', roles: R_DURUM,
      text: 'Im Dämonenlager türmen sich Skully-Köpfe, auf der Rangliste verschwinden ständig Namen. Der Durum-General Lexor will wissen, wer seine Jäger frisst.' },
    { name: 'Kronker', type: 'duel', foe: 'b14_kronker', crowd: 0.2, theme: 'redspace', roles: R_DURUM,
      text: 'Ein Dämonenkönig ganz aus rotem Kristall. Seine Klinge saugt Blutspeere auf, seine Stacheln wachsen aus der Brust. Finns Schläge verschieben seinen Kopf nur um Zentimeter – vorerst.' },
    { name: 'Kronkers wahre Form', type: 'duel', foe: 'b14_kronkerW', crowd: 0.3, theme: 'roterhimmel', roles: R_DURUM, berserk: true,
      text: 'Die Kristallhülle platzt: ein zehn Meter hoher Riese mit Hörnern und Tentakeln. Finn verliert die Kontrolle. Aus seinen Flügeln tropfen Blutbomben – und das System meldet Fehler.' },
    { name: 'Unzoku, der Allesverschlinger', type: 'endure', foe: 'b14_unzoku', dur: 80, crowd: 0.4, theme: 'ruinen', roles: R_GLUTTON, comp: ['chris'],
      text: 'Ein Gefängnis, in dem Chronos gemästet werden, bis die Glutton-Wölfe sie fressen. Dann kommt ihr König: ein Werwolf mit Löwenmähne, dessen Stimme allein Übelkeit auslöst. Chris weicht jedem Hieb nur knapp aus.' },
    { name: 'Immortui', type: 'endure', foe: 'b14_immortui', dur: 70, crowd: 0.1, theme: 'redspace', roles: R_LESSER,
      text: 'Er sieht jung aus, grau, mit schwarz-weißem Haar. In seiner Nähe verliert alles seine Energie: Blut zerfällt, sogar der Schatten wird ausgesaugt. Finn weiß, dass er diesen Kampf verliert. Er muss nur lange genug durchhalten.' },
    { name: 'Die Divine Brigade', type: 'survive', dur: 170, pace: 1.7, theme: 'akademie', roles: R_DIVINE, comp: ['minny', 'lena'], elites: 3,
      text: 'Mitten im großen Schulsportfest reißt der Himmel auf: dunkle Divines werfen Speere in die Menge, goldene heilen sie wieder. Lena gibt die Befehle, Minny sperrt die goldenen in ihren Schattenraum.' },
    { name: 'Die Werft der Yaks', type: 'waveboss', at: 60, foe: 'b14_yakgen', pace: 1.5, theme: 'redspace', roles: R_YAK, comp: ['chris'], evo: 'Dämonenform',
      text: 'Auf dem Planeten der Riesen bauen Yak-Dämonen Schiffe für den Krieg gegen die Celestials. Chris jagt nachts unter dem roten Mond – und jede Beute macht ihn hungriger.' }
  ]
};

/* ------------------------------------------------------------ Etappe 15: Der letzte Vampir (Kapitel 2471–2545) */
defEnemy('e15_toter', 'ghoul', 'v_thrall', 'Ruheloser Toter', { hp: 106, gore: 'void' });
defEnemy('e15_geist', 'bat', 'bat_aas', 'Nebelgeist', { hp: 74, gore: 'void' });
defEnemy('e15_dalkiT', 'knight', 'dalki4', 'Toter Dalki', { armor: 12 });
defEnemy('e15_vampT', 'witch', 'v_magier', 'Toter Vampir', { shot: 'soul', flier: false });
defEnemy('e15_riese', 'brute', 'q_fort', 'Toter Riese', { splits: 0, hp: 620 });
defEnemy('e15_graham', 'captain', 'dalkiW', 'Arians Schatten', { scale: 1.4, hp: 11500 });
defEnemy('e15_divD', 'ghoul', 'h_ritter', 'Dunkler Divine', { hp: 106, gore: 'light' });
defEnemy('e15_divG', 'bat', 'bat_licht', 'Goldener Divine', { hp: 74, gore: 'light' });
defEnemy('e15_divK', 'knight', 'h_waechter', 'Divine-Speerträger', { armor: 12, gore: 'light' });
defEnemy('e15_divS', 'witch', 'h_seherin', 'Heilender Divine', { shot: 'light', flier: false, gore: 'light' });
defEnemy('e15_divB', 'brute', 'h_koloss', 'Divine-Koloss', { splits: 0, hp: 620, gore: 'light' });
defEnemy('e15_divC', 'captain', 'g_diener', 'Heerführer der Divine Brigade', { scale: 1.35, hp: 11500 });
defEnemy('e15_wolf', 'ghoul', 'q_rotP', 'Werwolf aus dem Portal', { hp: 110, spd: 92 });
defEnemy('e15_yak', 'brute', 'q_koenig', 'Yak-Krieger', { splits: 0, hp: 640 });
defEnemy('e15_yakC', 'captain', 'q_koenig', 'Yak-Kapitän', { scale: 1.35, hp: 11500 });
defEnemy('e15_flug', 'bat', 'bat_void', 'Flugdämon', { hp: 74, gore: 'void' });
defBoss('b15_cia', 'mono', 'Cia, die Banshee', 22000, Object.assign({ look: 'b_cia', bellShot: 'soul', spd: 84 }, B1));
defBoss('b15_bisha', 'kronker', 'Bisha, König der Yaks', 36000, { model: 'bisha', bellShot: 'bell', r: 54, scale: 1.2, spd: 50 });
defBoss('b15_luce', 'mono', 'Luce, der rechte Arm', 32000, Object.assign({ look: 'b_luce', bellShot: 'light', spd: 86 }, B1));
defBoss('b15_calva', 'kronker', 'Calva, Champion der Skullys', 24000, { model: 'calva', bellShot: 'spike', r: 44, spd: 70 });
defBoss('b15_tenbris', 'kronker', 'Tenbris, Dämonenkönig', 30000, { model: 'tenbris', bellShot: 'soul', r: 44, spd: 64 });
defBoss('b15_luceW', 'kronker', 'Luces Dämonenform', 30000, { model: 'luceW', bellShot: 'light', r: 46, spd: 70 });
defBoss('b15_unzoku', 'kronker', 'Unzoku, satt von Tenbris', 38000, { model: 'unzoku', bellShot: 'spike', r: 50, scale: 1.15, spd: 80 });
defBoss('b15_immortui', 'mono', 'Immortui mit Schlangenrüstung', 36000, Object.assign({ look: 'b_immortui', bellShot: 'void', spd: 84 }, B1));
defBoss('b15_final', 'immortui', 'Immortuis Endform', 44000, { model: 'immortui', bellShot: 'void', r: 50, scale: 1.2, spd: 70 });
const R_TOTE = { ghoul: 'e15_toter', bat: 'e15_geist', knight: 'e15_dalkiT', witch: 'e15_vampT', brute: 'e15_riese', captain: 'e15_graham' };
const R_DIV15 = { ghoul: 'e15_divD', bat: 'e15_divG', knight: 'e15_divK', witch: 'e15_divS', brute: 'e15_divB', captain: 'e15_divC' };
const R_KRIEG = { ghoul: 'e15_wolf', bat: 'e15_divG', knight: 'e15_divK', witch: 'e14_yakS', brute: 'e15_yak', captain: 'e15_yakC' };
const R_ROTRAUM = { ghoul: 'e14_durum', bat: 'e15_flug', knight: 'e14_yakK', witch: 'e14_glutS', brute: 'e15_yak', captain: 'e15_yakC' };
const ETAPPE15 = {
  title: 'Der letzte Vampir', place: 'Nebelwelt · Planet der Riesen · Zeathun · die Siedlung', src: 'Kapitel 2471–2545', theme: 'roterhimmel', ch: 15,
  levels: [
    { name: 'Die Nebelwelt', type: 'survive', dur: 150, pace: 1.4, theme: 'friedhof', roles: R_TOTE, elites: 1,
      text: 'Finn erwacht als halb durchsichtige Gestalt im grauen Nebel. Jeder Tote, den er je getötet hat, kommt zurück – und jeder Treffer lässt ihn ihre letzten Schmerzen fühlen.' },
    { name: 'Cia, die Banshee', type: 'duel', foe: 'b15_cia', crowd: 0.2, theme: 'friedhof', roles: R_TOTE,
      text: 'Cia ist wütend über ihre gelöschten Erinnerungen und schreit wie eine Banshee. Finn wehrt sich kaum. Er erzählt ihr, dass Lena lebt und dass sie ein Kind haben.' },
    { name: 'Die Toten stehen bei ihm', type: 'survive', dur: 160, pace: 1.6, theme: 'friedhof', roles: R_TOTE, comp: ['leo', 'emma'], elites: 3,
      text: 'Als Finn zu zerbrechen droht, formen sich neue Gestalten zu seinem Schutz: Leo, Emma und alle, die ihm etwas bedeutet haben. „Wir sind die Vergangenheit. Rette du die Welt.“' },
    { name: 'Bisha, König der Yaks', type: 'duel', foe: 'b15_bisha', crowd: 0.2, theme: 'redspace', roles: R_ROTRAUM, comp: ['chris'],
      text: 'Der gelangweilte Yak-König kommt selbst, als sein Bautrupp schweigt. Eine Hülle aus rotem Nebel schützt ihn, seine Fäuste schlagen ein wie Meteore. Chris, satt vom Fressen, lenkt sie ab.' },
    { name: 'Luce', type: 'duel', foe: 'b15_luce', crowd: 0.1, theme: 'redspace', roles: R_ROTRAUM, comp: ['peter'],
      text: 'Immortuis rechter Arm. Seine weißen Kugeln ziehen Lichtspuren durch die Luft, und wer die Spur berührt, wird von ihrer ganzen Länge getroffen. Peter landet in einer Schale aus weißem Eis.' },
    { name: 'Training mit den Champions', type: 'duel', foe: 'b15_calva', crowd: 0, theme: 'rotezone', roles: R_ROTRAUM,
      text: 'In einer grauen Ödnis kämpft Finn ohne Rüstung gegen drei Champions zugleich. Calvas Knochenregen, Pultras Tritte, Shintos schwarze Flammen. Die Antwort ist der Schatten – mit allem anderen verbunden.' },
    { name: 'Die Divine-Invasion', type: 'survive', dur: 170, pace: 1.55, theme: 'redspace', roles: R_DIV15, elites: 2,
      text: 'Überall im roten Raum öffnen sich weiße Portale. Zehntausende Divines fallen ein und töten alles: Dämonen, Skullys, ganze Dörfer. Finn hört das Leid – und greift ein.' },
    { name: 'Tenbris', type: 'waveboss', at: 60, foe: 'b15_tenbris', pace: 1.6, theme: 'redspace', roles: R_GLUTTON, comp: ['chris'],
      text: 'Chris in seiner neuen roten Werwolfform, Mähne und Schweif, gegen Unzoku. Dann kommt Tenbris hinzu: Seine blauen Wirbel machen alles, was sie berühren, unendlich schwer.' },
    { name: 'Luces Dämonenform', type: 'duel', foe: 'b15_luceW', crowd: 0.2, theme: 'goetter', roles: R_DIV15, comp: ['peter'],
      text: 'Ein Körper ganz aus weißer Substanz. Klingen heilen sofort, nur Celestial-Schläge wirken nach. Peter vereint seine Kopfschweife zu einer Axt.' },
    { name: 'Unzoku, satt von Tenbris', type: 'duel', foe: 'b15_unzoku', crowd: 0.3, theme: 'redspace', roles: R_GLUTTON, comp: ['chris'],
      text: 'Unzoku hat Tenbris geköpft und gefressen. Sein Heulen legt ganze Divine-Schwärme lahm, ein Hieb zerreißt die Yak-Stadt. Chris setzt ihm schwarze Flammen an Hände und Beine.' },
    { name: 'Immortui mit Schlangenrüstung', type: 'duel', foe: 'b15_immortui', crowd: 0.1, theme: 'roterhimmel', roles: R_ROTRAUM,
      text: 'Blutwirbel gegen Nebelhände, sechs Schattenarme gegen Schlangenstrahlen. Finn formt eine riesige, blitzgeladene Blutschatten-Sense. Und er verliert trotzdem.' },
    { name: 'Krieg um die Siedlung', type: 'survive', dur: 180, pace: 1.8, theme: 'siedlung', roles: R_KRIEG, comp: ['lena', 'minny'], elites: 3,
      text: 'Ein rotes Portal neben der Siedlung, ein schwarzes Schiff voller Werwölfe, dazu Divines vom Himmel. Die Schläfer in den Grüften werden geweckt. Lena kämpft mit Feueratem und Qi-Pfeilen.' },
    { name: 'Eine neue Flamme', type: 'waveboss', at: 70, foe: 'b15_unzoku', pace: 1.7, theme: 'siedlung', roles: R_KRIEG, comp: ['peter', 'chris'],
      text: 'Die Phönixflamme im Brustpanzer erschafft Finn neu: Herz, Körper, Blutkristall. Mundus hält Unzoku für einen Wimpernschlag in der Zeit fest – und alle feuern zugleich ihren stärksten Angriff.' },
    { name: 'Der letzte Vampir', type: 'duel', foe: 'b15_final', crowd: 0.2, theme: 'roterhimmel', roles: R_DIV15, evo: 'Blut der dreizehn Familien', outro: CHAPTERS[14].outro,
      text: 'Immortuis Endform ist eine Verschmelzung aller Dämonen. Finn trägt das Blut aller dreizehn Familien in sich. Doch stirbt Immortui, verschwindet alle Kraft, die er je gegeben hat – auch die der Vampire.' }
  ]
};

/* ------------------------------------------------------------ Alle Etappen */
const ETAPPEN = [ETAPPE1, ETAPPE2, ETAPPE3, ETAPPE4, ETAPPE5, ETAPPE6, ETAPPE7, ETAPPE8, ETAPPE9, ETAPPE10, ETAPPE11, ETAPPE12, ETAPPE13, ETAPPE14, ETAPPE15];
ETAPPEN.forEach((E, i) => { E.n = i + 1; E.levels.forEach((L, j) => { L.l = j + 1; }); });
// Kapitel (Gegner-/Boss-Sammlungen) -> Etappe, fuer den Boss-Turm
const ET_OF_CH = {}; ETAPPEN.forEach((E) => { const chs = new Set([E.ch]); E.levels.forEach((L) => L.ch && chs.add(L.ch)); if (E.n === 1) chs.add(3); chs.forEach((c) => { ET_OF_CH[c] = E.n; }); });
function ET(e) { return ETAPPEN[e - 1]; }
function lvCount(e) { return ET(e).levels.length; }
function lvDef(e, l) { return ET(e).levels[l - 1]; }
function lvIsBoss(e, l) { const L = lvDef(e, l); return L.type === 'boss'; }
function lvChapter(e, l) { const L = lvDef(e, l); return CHAPTERS[(L.ch || ET(e).ch) - 1]; }
// Ziel-Text fuer Menue und Systemfenster
function lvGoal(e, l) {
  const g = lvGoal0(e, l), L = lvDef(e, l);
  return L.berserk && L.type !== 'berserk' ? g + ' – als Bloodsucker' : g;
}
function lvGoal0(e, l) {
  const L = lvDef(e, l), foe = L.foe && ENEMIES[L.foe] ? ENEMIES[L.foe].name : L.type === 'boss' ? ENEMIES[lvChapter(e, l).roles.boss].name : '';
  switch (L.type) {
    case 'duel': return 'Besiege ' + foe;
    case 'endure': return 'Halte ' + fmtTime(L.dur) + ' gegen ' + foe + ' durch';
    case 'waveboss': return 'Überlebe ' + fmtTime(L.at) + ', dann besiege ' + foe;
    case 'hunt': return 'Erlege ' + L.n + ' × ' + ENEMIES[(L.roles || lvChapter(e, l).roles)[L.role]].name;
    case 'boss': return L.full ? 'Überlebe die Nacht und besiege ' + foe : 'Besiege ' + foe;
    case 'berserk': return 'Wüte ' + fmtTime(L.dur) + ' als Bloodsucker';
    default: return 'Überlebe ' + fmtTime(L.dur);
  }
}
