'use strict';
/* ==========================================================================
   MACHT UND HELDENSTAND
   - Feste Machtstufen 1–30 fuer Bosse und Etappen (nach dem Buch, nichts passt sich an)
   - Jeder Held hat eine Start- und Hoechststufe; seine Heldenstufe (EP aus Laeufen)
     hebt ihn von der Start- zur Hoechststufe. Finn waechst ueber die Story.
   - Macht wirkt auf Schaden und Leben, und zu starke Stufen sind gesperrt.
   ========================================================================== */

const MACHT_MAX = 30;
const MACHT_BAND = [[1, 'Mensch'], [2, 'Erwachter'], [4, 'Kämpfer'], [8, 'Adliger'], [11, 'Vampirritter'], [12, 'Anführer'], [14, 'Lord'], [17, 'König'], [20, 'Halbgott'], [24, 'Dämonenstufe'], [26, 'Gottbezwinger'], [28, 'Urgewalt'], [30, 'Der letzte Vampir']];
function machtName(m) { let n = MACHT_BAND[0][1]; for (const [v, nm] of MACHT_BAND) if (m >= v - 0.001) n = nm; return n; }

// [Start, Hoechststufe] je Held
const HERO_MACHT = { finn: [1, 30], peter: [1, 20], lena: [2, 17], emma: [5, 25], fabian: [5, 13], fex: [8, 15], leo: [10, 15], sil: [6, 25], chris: [6, 20], leander: [4, 14], agathon: [14, 17], sam: [4, 12], mia: [4, 18], draco: [20, 29] };
// normale Kaempfe je Etappe (zugleich Finns Storymacht in dieser Etappe)
const ET_MACHT = [0, 2, 4, 7, 9, 11, 12, 13, 13, 14, 16, 17, 20, 24, 25, 26];
// Bosse (Durchhalte-Kaempfe zaehlen mit der Etappe)
const BOSS_MACHT = { b1_kyle: 2, b1_rylee: 2, b1_brandon: 2, b1_leo: 14, b1_nate: 6, b1_scordana: 4, b1_ben: 4, b2_fex: 8, b2_emma: 4, b2_leander: 4, b2_kenny: 4, b2_ranken: 8, b2_multi: 4, b2_sil: 8, b2_dillan: 8, b3_boneclaw: 24, b3_hase: 8, b3_clark: 8, b3_jin: 12, b3_edward: 11, b3_vadeen: 12, b3_paul: 11, b4_linda: 14, b4_hypolord: 11, b4_hundR: 11, b4_hundS: 12, b4_lemon: 4, b4_gox: 11, b4_kiln: 11, b4_chrimeta: 12, b4_twins: 14, b4_twinsF: 12, b5_sand: 12, b5_feuerstein: 12, b5_mantis: 11, b5_rowa: 14, b5_helen: 11, b5_tulk: 11, b5_lucy: 12, b5_krabbe: 24, b5_chris: 12, b5_hilston: 16, b5_krabbeF: 14, b6_bryce: 12, b6_amber: 11, b6_leader: 14, b6_ovinnik: 14, b6_remus: 14, b6_cindy: 14, b6_cindyF: 12, b7_sach: 12, b7_boneclaw: 14, b7_mag: 12, b7_motte: 14, b7_baum: 14, b7_drache: 24, b7_longblade: 12, b7_agent2: 12, b7_erde: 14, b8_graham: 16, b8_eno: 14, b8_sechs: 14, b8_wurm: 14, b8_dullahan: 14, b8_laxmus: 24, b8_laxmusF: 16, b9_samantha: 14, b9_agent3: 14, b9_genbu: 24, b9_ape: 14, b9_doppel: 14, b9_dhelen: 14, b9_blob: 14, b9_drache2: 16, b9_greenhorn: 14, b9_graham: 16, b10_tikker: 14, b10_werwolf: 16, b10_derik: 16, b10_andy: 16, b10_lock: 16, b10_russ: 26, b10_chris: 16, b10_laxmus: 26, b10_sedi: 16, b11_athos: 24, b11_laxmus: 26, b11_laser: 16, b11_yanny: 16, b11_zero: 26, b11_chris: 24, b11_hinto: 24, b11_kipo: 24, b11_gorgath: 24, b11_erin: 24, b11_escam: 24, b12_edvard: 24, b12_nell: 16, b12_ranke: 16, b12_eule: 16, b12_grenlet: 24, b12_spinne: 24, b12_prophet: 24, b12_magnus: 24, b12_ray: 27, b12_jim: 24, b13_h: 27, b13_stark: 24, b13_mundus: 27, b13_affe: 26, b13_phoenix: 26, b13_behemoth: 26, b13_asura: 26, b13_pine: 26, b13_sera: 26, b13_chris: 24, b13_h10: 26, b13_ray: 26, b14_magnus: 24, b14_general: 24, b14_lexor: 24, b14_kronker: 26, b14_kronkerW: 26, b14_unzoku: 27, b14_immortui: 30, b14_yakgen: 24, b15_cia: 16, b15_bisha: 26, b15_luce: 26, b15_calva: 24, b15_tenbris: 26, b15_luceW: 26, b15_unzoku: 26, b15_immortui: 27, b15_final: 27, b2_likmorn: 8, b3_borden: 8, b4_borden: 11, b7_dred: 12, b8_zweizack: 11, b8_slicer: 13, b9_onehorn: 17, b9_newgen: 14 };

/* ------------------------------------------------------------ Heldenstand */
const HERO_LV_MAX = 60;
function heroXpNeed(lv) { return 120 + 30 * lv; }
function heroSave(id) {
  const C = campSave(); C.heroes = C.heroes || {};
  return C.heroes[id] || (C.heroes[id] = { lv: 1, xp: 0 });
}
function heroAddXp(id, xp) {
  const h = heroSave(id), lv0 = h.lv;
  h.xp += xp;
  while (h.lv < HERO_LV_MAX && h.xp >= heroXpNeed(h.lv)) { h.xp -= heroXpNeed(h.lv); h.lv++; }
  if (h.lv >= HERO_LV_MAX) h.xp = 0;
  return h.lv - lv0;
}
function heroRange(id) { return HERO_MACHT[id] || [1, 12]; }
function heroMax(id) { return heroRange(id)[1]; }
// hoechste offene Etappe (Finns Storypunkt)
function storyEtappe() { let e = 1; for (let k = 1; k <= ETAPPEN.length; k++) if (etappeOpen(k)) e = k; return e; }
function heroMacht(id) {
  const [a, b] = heroRange(id), h = heroSave(id), f = (h.lv - 1) / (HERO_LV_MAX - 1);
  if (id === 'finn') {
    if (etappeCleared(ETAPPEN.length)) return MACHT_MAX;
    return Math.min(b, ET_MACHT[storyEtappe()] + 2 * f); // Story plus bis zu +2 durch Training
  }
  return a + (b - a) * f;
}

/* ------------------------------------------------------------ Stufen bewerten */
function levelMacht(e, l) {
  const L = lvDef(e, l);
  if (L && L.foe && L.type !== 'endure' && BOSS_MACHT[L.foe]) return BOSS_MACHT[L.foe];
  return ET_MACHT[e] || 1;
}
// Werte-Abstand: Held gegenueber dem Stand, fuer den die Etappe gebaut ist
function machtGap(id, e) { return heroMacht(id) - (ET_MACHT[e] || 1); }
function machtMul(id, e) { return Math.max(0.45, Math.min(4, Math.pow(1.09, machtGap(id, e)))); }
function machtRating(id, e, l) {
  const lm = levelMacht(e, l), hm = heroMacht(id), g = machtGap(id, e), N = id === 'draco' ? HEROES[id].name : HEROES[id].name.split(' ')[0];
  if (id !== 'finn' && heroMax(id) < lm) return { key: 'nie', lock: true, txt: `Unmöglich für ${N}`, why: `Selbst in voller Kraft (Macht ${heroMax(id)}) reicht ${N} nicht an diesen Gegner heran (Macht ${lm}).` };
  if (id !== 'finn' && g < -3) return { key: 'schwach', lock: true, txt: `${N} ist noch zu schwach`, why: `Macht ${hm.toFixed(1)}, gebraucht wird etwa ${Math.ceil((ET_MACHT[e] || 1) - 3)}. Heldenstufe steigern.` };
  if (g >= 4) return { key: 'leicht', txt: 'leicht' };
  if (g >= 1.5) return { key: 'fair', txt: 'fair' };
  if (g >= -1) return { key: 'hart', txt: 'hart' };
  return { key: 'sehrhart', txt: 'sehr hart' };
}

/* ------------------------------------------------------------ Datenpruefung (Entwicklung) */
function datenCheck() {
  const err = [];
  for (let e = 1; e <= ETAPPEN.length; e++) for (let l = 1; l <= lvCount(e); l++) {
    const L = lvDef(e, l), at = `Etappe ${e}-${l}`;
    if (!L || !L.name || !L.text) err.push(at + ': Name oder Text fehlt');
    if (L.foe && !ENEMIES[L.foe]) err.push(at + ': Boss fehlt ' + L.foe);
    if (L.foe && /^b\d/.test(L.foe) && !BOSS_MACHT[L.foe]) err.push(at + ': keine Macht für ' + L.foe);
    for (const r in (L.roles || {})) if (!ENEMIES[L.roles[r]]) err.push(at + ': Gegner fehlt ' + L.roles[r]);
    for (const c of (L.comp || [])) if (!COMPANIONS[c]) err.push(at + ': Begleiter fehlt ' + c);
  }
  for (const id of HERO_ORDER) if (HERO_UNLOCK[id] !== undefined && !HERO_MACHT[id]) err.push('Held ohne Macht: ' + id);
  for (const id in ENEMIES) if (!ENEMIES[id].name || /undefined/.test(ENEMIES[id].name)) err.push('Gegner ohne Namen: ' + id);
  if (err.length) console.error('DATENFEHLER:\n' + err.join('\n'));
  return err;
}
setTimeout(datenCheck, 0);
