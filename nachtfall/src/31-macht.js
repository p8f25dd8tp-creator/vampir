'use strict';
/* ==========================================================================
   MACHT UND HELDENSTAND
   - Feste Machtstufen 1–30 fuer Bosse und Etappen (nach dem Buch, nichts passt sich an)
   - Jeder Held hat eine Start- und Hoechststufe; seine Heldenstufe (EP aus Laeufen)
     hebt ihn von der Start- zur Hoechststufe. Finn waechst ueber die Story.
   - Macht wirkt auf Schaden und Leben, und zu starke Stufen sind gesperrt.
   ========================================================================== */

const MACHT_MAX = 30;
const MACHT_BAND = [[1, 'Mensch'], [4, 'Erwachter'], [6, 'Kämpfer'], [9, 'Elite'], [12, 'Adliger'], [14, 'Anführer'], [17, 'Original'], [20, 'Halbgott'], [22, 'Dämonenstufe'], [25, 'Gottbezwinger'], [28, 'Urgewalt'], [30, 'Der letzte Vampir']];
function machtName(m) { let n = MACHT_BAND[0][1]; for (const [v, nm] of MACHT_BAND) if (m >= v - 0.001) n = nm; return n; }

// [Start, Hoechststufe] je Held
const HERO_MACHT = { finn: [1, 30], peter: [1, 22], lena: [4, 20], emma: [4, 22], fabian: [6, 17], fex: [9, 17], leo: [14, 17], sil: [6, 25], chris: [6, 22], leander: [4, 14], agathon: [17, 22], sam: [4, 12], mia: [4, 20], draco: [20, 25] };
// normale Kaempfe je Etappe (zugleich Finns Storymacht in dieser Etappe)
const ET_MACHT = [0, 3, 6, 8, 10, 12, 13, 15, 16, 17, 19, 20, 21, 22, 23, 25];
// Bosse (Durchhalte-Kaempfe zaehlen mit der Etappe)
const BOSS_MACHT = { b1_kyle: 4, b1_rylee: 4, b1_brandon: 4, b1_leo: 17, b1_nate: 6, b1_scordana: 6, b1_ben: 6, b2_fex: 9, b2_emma: 6, b2_leander: 6, b2_kenny: 6, b2_ranken: 9, b2_multi: 6, b2_sil: 9, b2_dillan: 9, b3_boneclaw: 22, b3_hase: 9, b3_clark: 9, b3_jin: 14, b3_edward: 12, b3_vadeen: 14, b3_paul: 12, b4_linda: 17, b4_hypolord: 12, b4_hundR: 12, b4_hundS: 14, b4_lemon: 6, b4_gox: 12, b4_kiln: 12, b4_chrimeta: 14, b4_twins: 17, b4_twinsF: 14, b5_sand: 14, b5_feuerstein: 14, b5_mantis: 12, b5_rowa: 17, b5_helen: 12, b5_tulk: 12, b5_lucy: 14, b5_krabbe: 22, b5_chris: 14, b5_hilston: 19, b5_krabbeF: 17, b6_bryce: 14, b6_amber: 12, b6_leader: 17, b6_ovinnik: 17, b6_remus: 17, b6_cindy: 17, b6_cindyF: 14, b7_sach: 14, b7_boneclaw: 17, b7_mag: 14, b7_motte: 17, b7_baum: 17, b7_drache: 22, b7_longblade: 14, b7_agent2: 14, b7_erde: 17, b8_graham: 19, b8_eno: 17, b8_sechs: 17, b8_wurm: 17, b8_dullahan: 17, b8_laxmus: 22, b8_laxmusF: 19, b9_samantha: 17, b9_agent3: 17, b9_genbu: 22, b9_ape: 17, b9_doppel: 17, b9_dhelen: 17, b9_blob: 17, b9_drache2: 19, b9_greenhorn: 17, b9_graham: 19, b10_tikker: 17, b10_werwolf: 19, b10_derik: 19, b10_andy: 19, b10_lock: 19, b10_russ: 25, b10_chris: 19, b10_laxmus: 25, b10_sedi: 19, b11_athos: 22, b11_laxmus: 25, b11_laser: 19, b11_yanny: 19, b11_zero: 25, b11_chris: 22, b11_hinto: 22, b11_kipo: 22, b11_gorgath: 22, b11_erin: 22, b11_escam: 22, b12_edvard: 22, b12_nell: 19, b12_ranke: 19, b12_eule: 19, b12_grenlet: 22, b12_spinne: 22, b12_prophet: 22, b12_magnus: 22, b12_ray: 27, b12_jim: 22, b13_h: 27, b13_stark: 22, b13_mundus: 27, b13_affe: 25, b13_phoenix: 25, b13_behemoth: 25, b13_asura: 25, b13_pine: 25, b13_sera: 25, b13_chris: 22, b13_h10: 25, b13_ray: 25, b14_magnus: 22, b14_general: 22, b14_lexor: 22, b14_kronker: 25, b14_kronkerW: 25, b14_unzoku: 27, b14_immortui: 30, b14_yakgen: 22, b15_cia: 19, b15_bisha: 25, b15_luce: 25, b15_calva: 22, b15_tenbris: 25, b15_luceW: 25, b15_unzoku: 25, b15_immortui: 27, b15_final: 27, b2_likmorn: 9, b3_borden: 9, b4_borden: 12, b7_dred: 14, b8_zweizack: 12, b8_slicer: 15, b9_onehorn: 20, b9_newgen: 17 };

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
