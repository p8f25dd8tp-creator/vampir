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
   Etappen 6 ff. nutzen vorerst die bisherigen Kapitel mit 8 Stufen.
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
defBoss('b1_leo', 'hagon', 'Leo, der blinde Schwertkämpfer', 60000, Object.assign({ look: 'leo', bellShot: 'spike', spd: 58 }, B1));
defBoss('b1_nate', 'mono', 'Nate „Hardsteely“ Snell', 1900, Object.assign({ look: 'b_nate', bellShot: 'spike', armor: 6 }, B1));
defBoss('b1_scordana', 'krabbe', 'Scordana (Mittelstufen-Bestie)', 2200, { model: 'scordana', bellShot: 'acid', r: 40 });
defBoss('b1_ben', 'mono', 'Ben (Keule)', 1900, Object.assign({ look: 'b_ben', bellShot: 'spike' }, B1));

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
      text: 'Im Kampfspiel Power Fighter tritt „Blood Evolver“ gegen Nate an, der seinen Körper zu Metall härtet. Nur Schläge mit voller Wucht kommen durch.' },
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
defBoss('b2_fex', 'mono', 'Fex Sanguinis (Vampir)', 1500, Object.assign({ look: 'fex', bellShot: 'blood' }, B1));
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
      text: 'Peter ist ausgehungert verschwunden. In einer dunklen Gasse fesselt ihn ein Fremder mit unsichtbaren Fäden – Fex Sanguinis, ein echter Vampir. Finn greift im Sonnenanzug an.' },
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
defBoss('b4_lemon', 'mono', 'Lemon (Graylash-Schüler)', 3200, Object.assign({ look: 'b_lemon', bellShot: 'light', spd: 72 }, B1));
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
defBoss('b5_lucy', 'erin', 'Lucy, Agent Fünf', 7600, Object.assign({ look: 'b_lucy', bellShot: 'light', spd: 72 }, B1));
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
    { name: 'Nacht der Bloodsucker', type: 'hunt', role: 'ghoul', n: 90, pace: 1.7, theme: 'siedlung', roles: R_ROWA, comp: ['leo', 'emma'],
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

/* ------------------------------------------------------------ Alle Etappen */
// Etappen 6 ff.: bisherige Kapitel, bis sie Bogen fuer Bogen neu gebaut sind
function autoLevels(ch) {
  const out = [];
  for (let l = 1; l <= 8; l++) {
    if (l < 8) out.push({ name: 'Stufe ' + l, type: 'survive', dur: [150, 180, 210, 240, 270, 300, 330][l - 1], pace: [1.3, 1.45, 1.6, 1.75, 1.8, 1.85, 1.9][l - 1], text: ch.intro[Math.min(ch.intro.length - 1, l === 1 ? 0 : 1)] });
    else out.push({ name: ENEMIES[ch.roles.boss].name, type: 'boss', full: true, text: ch.intro[ch.intro.length - 1] });
  }
  return out;
}
const ETAPPEN = [ETAPPE1, ETAPPE2, ETAPPE3, ETAPPE4, ETAPPE5].concat(CHAPTERS.slice(7).map((ch) => ({ title: ch.title, place: ch.place, src: ch.src, theme: ch.theme, ch: ch.n, levels: autoLevels(ch) })));
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
