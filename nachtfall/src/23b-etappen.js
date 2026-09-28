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
   Etappen 2 ff. nutzen vorerst die bisherigen Kapitel mit 8 Stufen.
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
defBoss('b1_scordana', 'krabbe', 'Scordana (Mittelstufen-Bestie)', 2600, { model: 'scordana', bellShot: 'acid', r: 40 });
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

/* ------------------------------------------------------------ Alle Etappen */
// Etappen 2 ff.: bisherige Kapitel, bis sie Bogen fuer Bogen neu gebaut sind
function autoLevels(ch) {
  const out = [];
  for (let l = 1; l <= 8; l++) {
    if (l < 8) out.push({ name: 'Stufe ' + l, type: 'survive', dur: [150, 180, 210, 240, 270, 300, 330][l - 1], pace: [1.3, 1.45, 1.6, 1.75, 1.8, 1.85, 1.9][l - 1], text: ch.intro[Math.min(ch.intro.length - 1, l === 1 ? 0 : 1)] });
    else out.push({ name: ENEMIES[ch.roles.boss].name, type: 'boss', full: true, text: ch.intro[ch.intro.length - 1] });
  }
  return out;
}
const ETAPPEN = [ETAPPE1, ETAPPE2].concat(CHAPTERS.slice(4).map((ch) => ({ title: ch.title, place: ch.place, src: ch.src, theme: ch.theme, ch: ch.n, levels: autoLevels(ch) })));
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
