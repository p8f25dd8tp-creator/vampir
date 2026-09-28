'use strict';
/* ==========================================================================
   HELDEN-CHARAKTERRAUM: Portraitleiste, grosse Buehne mit Held, Reiter
   Uebersicht · Formen · Faehigkeiten · Meisterschaft · Ausruestung · Lore.
   Formbilder (form_1 … form_8) erscheinen, sobald sie vorhanden sind.
   ========================================================================== */

const HR_TABS = [['over', 'Übersicht'], ['formen', 'Formen'], ['faehig', 'Fähigkeiten'], ['mast', 'Meisterschaft'], ['gear', 'Ausrüstung'], ['lore', 'Lore']];
const SCHOOL_NAME = { blood: 'Blut', shadow: 'Schatten', qi: 'Qi', none: 'Ohne Schule' };
UI.heroTab = UI.heroTab || 'over';
UI.formSel = null;

function heroPortrait(id) { return typeof imgUrl === 'function' ? imgUrl('held_' + id) : null; }
function formImg(id, i) { return id === 'finn' && typeof imgUrl === 'function' ? imgUrl('form_' + (i + 1)) : null; }
// alle Faehigkeiten, die ein Held im Lauf bekommen kann (Formen und Karten)
function heroAbilities(id) {
  const out = [], seen = new Set(), add = (k, from) => { if (!k || seen.has(k)) return; seen.add(k); out.push({ k, from }); };
  const T = evoTiersOf(id), H = HEROES[id];
  if (T) T.forEach((t, i) => { (t.grants || []).forEach((k) => add(k, t.name)); (t.unlocks || []).forEach((k) => add(k, t.name)); });
  if (H.start) add(H.start, 'Start');
  if (id === 'finn' && typeof FINN_ARC_POOL !== 'undefined') FINN_ARC_POOL.forEach((arr, i) => arr.forEach((k) => add(k, FINN_TIERS[i] ? FINN_TIERS[i].name : '')));
  return out.filter((x) => CARDS[x.k] || SRC_NAMES[x.k]);
}

UI.homeHelden = function () {
  const C = campSave();
  if (!this.selHero || !HERO_ORDER.includes(this.selHero) || !HEROES[this.selHero] || HERO_UNLOCK[this.selHero] === undefined) this.selHero = C.hero;
  const id = this.selHero, H = HEROES[id], un = isUnlocked(id), tab = un ? this.heroTab : (this.heroTab === 'lore' ? 'lore' : 'over');
  const ids = HERO_ORDER.filter((h) => HERO_UNLOCK[h] !== undefined);
  const strip = ids.map((h) => { const u = heroPortrait(h), ok = isUnlocked(h);
    return `<button class="hrp ${h === id ? 'sel' : ''} ${ok ? '' : 'locked'}" data-act="hsel" data-id="${h}">${u ? `<img src="${u}" alt="">` : `<canvas data-prev="${h}"></canvas>`}${h === C.hero ? '<i class="hrcur">✔</i>' : ''}${ok ? '' : '<i class="hrlock">🔒</i>'}</button>`; }).join('');
  const T = evoTiersOf(id), cap = T ? Math.min(T.length - 1, evoCap(id)) : 0, form = T ? T[cap] : null;
  const big = formImg(id, this.formSel != null ? this.formSel : cap) || heroPortrait(id);
  const hs = heroSave(id), m = heroMacht(id);
  const stage = `<div class="hrstage ${un ? '' : 'locked'}">
      <div class="hrart">${big ? `<img src="${big}" alt="">` : `<canvas data-prev="${id}"></canvas>`}</div>
      <div class="hrinfo"><div class="hrname">${H.name}</div><div class="hrtitle">${H.title || ''}</div>
        ${un ? `<div class="hrtags"><span style="color:${form ? form.col : '#ffe6a0'}">${form ? form.name : SCHOOL_NAME[H.school] || ''}</span><span>Lv ${hs.lv}</span><span>Macht ${m.toFixed(1)}</span></div>
        <div class="hrmacht">${machtName(m)} · höchstens ${heroMax(id)} ${machtName(heroMax(id))}</div>` : `<div class="hrunl">🔒 ${HERO_UNLOCK[id] ? unlockText(HERO_UNLOCK[id]) : H.unlock.desc}</div>`}
        <div class="hrrole">${H.role || ''}</div>
        ${un ? (id === C.hero ? '<div class="selbadge">✔ Ausgewählt</div>' : '<button class="btn primary" data-act="hpick">Auswählen</button>') : ''}</div></div>`;
  const tabs = HR_TABS.filter(([k]) => un || k === 'over' || k === 'lore').map(([k, nm]) => `<button class="hrtab ${k === tab ? 'on' : ''}" data-act="htab" data-t="${k}">${nm}</button>`).join('');
  const body = ({ over: hrOver, formen: hrFormen, faehig: hrFaehig, mast: hrMast, gear: hrGear, lore: hrLore })[tab].call(this, id, un);
  return `<div class="hroom"><div class="hrstrip">${strip}</div>${stage}<div class="hrtabs">${tabs}</div><div class="hrbody">${body}</div></div>`;
};
function hrList(title, arr, col) { return arr && arr.length ? `<div class="hrblk"><b class="lbl" style="color:${col}">${title}</b><ul>${arr.map((x) => `<li>${x}</li>`).join('')}</ul></div>` : ''; }
function hrOver(id, un) {
  const H = HEROES[id];
  return `${un && HERO_MACHT[id] ? machtBlock(id) : ''}
    <div class="hrblk"><b class="lbl">MECHANIK · ${H.mech.name.toUpperCase()}</b><p>${H.mech.desc}</p></div>
    <div class="hrblk"><b class="lbl">SPEZIAL · ${H.ult.name.toUpperCase()}</b><p>${H.ult.desc}</p></div>
    <div class="hrcols">${hrList('STÄRKEN', H.strengths, '#9affb0')}${hrList('SCHWÄCHEN', H.weaknesses, '#ff9a9a')}</div>
    ${H.builds && H.builds.length ? `<div class="hrblk"><b class="lbl">BUILDS</b>${H.builds.map((b) => `<p><b>${b.name}</b> — ${b.desc}</p>`).join('')}</div>` : ''}`;
}
function hrFormen(id) {
  const T = evoTiersOf(id); if (!T) return '<div class="hrblk"><p>Dieser Held hat keine Formen.</p></div>';
  const cap = Math.min(T.length - 1, evoCap(id)), sel = this.formSel != null ? this.formSel : cap, t = T[sel];
  const path = T.map((f, i) => `<button class="hrform ${i <= cap ? 'open' : ''} ${i === sel ? 'sel' : ''}" data-act="hform" data-i="${i}" style="--fc:${f.col}"><i></i><span>${f.name}</span></button>`).join('<b class="hrarrow">›</b>');
  const abil = (t.grants || []).concat(t.unlocks || []).filter((k, i, a) => a.indexOf(k) === i && (CARDS[k] || SRC_NAMES[k])).map((k) => `<span class="hrchip"><img src="${icon(k)}" alt="">${CARDS[k] ? CARDS[k].name : SRC_NAMES[k]}</span>`).join('');
  return `<div class="hrpath">${path}</div>
    <div class="hrblk hrformcard" style="--fc:${t.col}"><b class="lbl" style="color:${t.col}">${t.name.toUpperCase()}${sel <= cap ? ' · FREI' : ' · GESPERRT'}</b><p>${t.desc || ''}</p>
      <div class="hrstat"><span>Leben <b>${t.hp}</b></span><span>Tempo <b>${t.speed}</b></span><span>Kraft <b>×${(t.might || 1).toFixed(2)}</b></span><span>Plätze <b>${t.slots}</b></span></div>
      ${abil ? `<div class="hrchips">${abil}</div>` : ''}</div>
    ${UI.evoUnlockHtml ? UI.evoUnlockHtml(id) : ''}`;
}
function hrFaehig(id) {
  const L = heroAbilities(id);
  if (!L.length) return '<div class="hrblk"><p>Keine Fähigkeiten gefunden.</p></div>';
  return `<div class="hrblk"><b class="lbl">FÄHIGKEITEN IM LAUF</b>${L.map(({ k, from }) => { const C0 = CARDS[k];
    return `<div class="hrab"><img src="${icon(k)}" alt=""><div><b>${C0 ? C0.name : SRC_NAMES[k]}</b><small>${from ? 'ab ' + from + ' · ' : ''}${C0 && C0.kind === 'ability' ? 'Fähigkeit' : 'Passiv'}</small><p>${C0 && C0.lv ? C0.lv[0] : ''}</p></div></div>`; }).join('')}</div>`;
}
function hrMast(id) { return typeof sysFaehig === 'function' ? sysFaehig(id).replace('class="swin"', 'class="hrblk"').replace('class="swhead"', 'class="lbl"') : ''; }
function hrGear(id) {
  const S = gearStore(id), rows = Object.keys(GEAR2).map((g) => { const G0 = GEAR2[g], x = S[g] || { r: 0, l: 0 }, R = RARITY[x.r], u = typeof gearImg === 'function' ? gearImg(g, x.r) : null;
    return `<div class="hrab"><img src="${u || iconImg('gear_' + g)}" alt=""><div><b>${G0.name}</b><small style="color:${R.col}">${x.l ? R.name + '-Stufe · Lv ' + x.l : 'noch nicht geschmiedet'}</small><p>${G0.stat} je Punkt · ${x.r * 10 + x.l} Punkte</p></div></div>`; }).join('');
  return `<div class="hrblk"><b class="lbl">AUSRÜSTUNG VON ${HEROES[id].name.toUpperCase()}</b>${rows}<button class="btn" data-act="hgear">Zur Schmiede</button></div>`;
}
const HERO_LORE = { finn: 'Der schwächste Schüler der Militärakademie – bis ein Tropfen Blut das Buch seiner Eltern öffnet und eine Stimme erwacht, die sich das System nennt. Aus dem Halbling wird ein Vampir, aus dem Außenseiter der Anführer der Verfluchten, später der König der Vampire. Am Ende steht er Immortui gegenüber, dem Ursprung aller Vampirkraft.' };
function hrLore(id) {
  const Cp = COMPANIONS[id], H = HEROES[id];
  return `<div class="hrblk"><b class="lbl">WER IST ${H.name.toUpperCase()}?</b><p>${HERO_LORE[id] || (Cp ? Cp.desc : H.mech.desc)}</p>
    ${Cp ? `<p class="small">Als Begleiter: ${Cp.role}</p>` : ''}
    <p class="small">${HERO_UNLOCK[id] ? 'Freigeschaltet durch: ' + unlockText(HERO_UNLOCK[id]) : 'Von Anfang an dabei.'}</p></div>`;
}

const _actHR = UI.act;
UI.act = function (a, ds, e) {
  if (a === 'htab') { this.heroTab = ds.t; return this.showHome('helden'); }
  if (a === 'hform') { this.formSel = +ds.i; return this.showHome('helden'); }
  if (a === 'hgear') { const C = campSave(); if (isUnlocked(this.selHero)) { C.hero = this.selHero; writeSave(); } return this.showHome('ausruestung'); }
  if (a === 'hsel') this.formSel = null;
  return _actHR.call(this, a, ds, e);
};

(function hrCss() {
  const st = document.createElement('style'); st.id = 'heldenraumcss';
  st.textContent = `
.hroom { width: min(560px, 100%); margin: 0 auto; display: flex; flex-direction: column; gap: 10px; }
.hrstrip { display: flex; gap: 6px; overflow-x: auto; padding: 2px 2px 6px; scrollbar-width: none; }
.hrstrip::-webkit-scrollbar { display: none; }
.hrp { position: relative; flex: none; width: 54px; height: 64px; padding: 0; border-radius: 10px; overflow: hidden; border: 1.5px solid rgba(201,162,76,.45); background: #1a0e2a; cursor: pointer; }
.hrp img, .hrp canvas { width: 100%; height: 100%; object-fit: cover; object-position: 50% 15%; display: block; }
.hrp.sel { border-color: #ffd070; box-shadow: 0 0 12px rgba(255,200,90,.6); transform: translateY(-2px); }
.hrp.locked img { filter: brightness(.15) saturate(0); }
.hrp .hrcur { position: absolute; right: 2px; top: 1px; color: #9affb0; font-size: 11px; font-style: normal; text-shadow: 0 0 4px #000; }
.hrp .hrlock { position: absolute; inset: 0; display: grid; place-items: center; font-style: normal; font-size: 16px; }
.hrstage { position: relative; display: grid; grid-template-columns: 44% 1fr; gap: 10px; align-items: end; min-height: 230px; padding: 10px; border-radius: 14px; background: radial-gradient(ellipse at 28% 95%, rgba(200,40,60,.35), transparent 60%), linear-gradient(180deg, rgba(20,8,30,.35), rgba(10,4,20,.8)); border: 1px solid rgba(201,162,76,.35); overflow: hidden; }
.hrart { position: relative; align-self: stretch; display: flex; align-items: flex-end; justify-content: center; }
.hrart::after { content: ''; position: absolute; left: 10%; right: 10%; bottom: 0; height: 14px; border-radius: 50%; background: radial-gradient(ellipse, rgba(255,60,80,.55), transparent 70%); }
.hrart img, .hrart canvas { width: 100%; max-height: 250px; object-fit: contain; object-position: 50% 100%; filter: drop-shadow(0 6px 14px rgba(0,0,0,.7)); position: relative; z-index: 1; border-radius: 10px; }
.hrstage.locked .hrart img { filter: brightness(.12) saturate(0) drop-shadow(0 0 2px #6a4a5a); }
.hrinfo { display: flex; flex-direction: column; gap: 5px; padding-bottom: 4px; }
.hrname { font-family: 'Cinzel', serif; font-weight: 800; font-size: 21px; color: #fff4c0; line-height: 1.1; text-shadow: 0 2px 0 #0a0418; }
.hrtitle { color: #d8c0ff; font-style: italic; font-size: 14px; }
.hrtags { display: flex; flex-wrap: wrap; gap: 4px; }
.hrtags span { font: 700 11.5px 'Cinzel', serif; padding: 2px 8px; border-radius: 999px; background: rgba(0,0,0,.45); border: 1px solid rgba(255,255,255,.18); color: #ffe6a0; }
.hrmacht { font-size: 12.5px; color: #bfe8ff; }
.hrrole { font-size: 13px; color: #cdbdb0; }
.hrunl { color: #ffb0b0; font-size: 14px; }
.hrinfo .btn, .hrinfo .selbadge { margin-top: 4px; }
.hrtabs { display: flex; gap: 5px; overflow-x: auto; scrollbar-width: none; }
.hrtabs::-webkit-scrollbar { display: none; }
.hrtab { flex: none; padding: 7px 12px; border-radius: 999px; border: 1px solid rgba(201,162,76,.4); background: rgba(20,8,30,.75); color: #d8c8b0; font: 700 12px 'Cinzel', serif; cursor: pointer; }
.hrtab.on { background: linear-gradient(180deg, #ffe27a, #e0901a); color: #3a1a00; border-color: #ffe27a; }
.hrbody { display: flex; flex-direction: column; gap: 8px; }
.hrblk { padding: 10px 12px; border-radius: 12px; background: rgba(16,6,24,.82); border: 1px solid rgba(201,162,76,.28); }
.hrblk p { margin: 4px 0; font-size: 14.5px; } .hrblk ul { margin: 4px 0; padding-left: 18px; font-size: 14px; }
.hrcols { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.hrpath { display: flex; align-items: center; gap: 2px; overflow-x: auto; padding: 4px 2px; scrollbar-width: none; }
.hrpath::-webkit-scrollbar { display: none; }
.hrarrow { color: #6a5a7a; flex: none; }
.hrform { flex: none; display: flex; flex-direction: column; align-items: center; gap: 3px; width: 70px; overflow-wrap: anywhere; hyphens: auto; padding: 4px 2px; border: 0; background: none; cursor: pointer; color: #8a7a9a; font: 700 9.5px 'Cinzel', serif; text-align: center; line-height: 1.1; }
.hrform i { width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--fc); background: #120818; opacity: .45; }
.hrform.open i { background: var(--fc); opacity: 1; box-shadow: 0 0 10px var(--fc); }
.hrform.open { color: #efe0ff; }
.hrform.sel i { transform: scale(1.25); outline: 2px solid #fff; outline-offset: 2px; }
.hrformcard { border-color: var(--fc); box-shadow: inset 0 0 20px rgba(0,0,0,.4); }
.hrstat { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin: 6px 0; font-size: 12px; color: #b8a8c8; text-align: center; }
.hrstat b { display: block; color: #fff; font-size: 15px; }
.hrchips { display: flex; flex-wrap: wrap; gap: 5px; }
.hrchip { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px 2px 3px; border-radius: 999px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.15); font-size: 12.5px; }
.hrchip img { width: 22px; height: 22px; }
.hrab { display: flex; gap: 10px; align-items: flex-start; padding: 6px 0; border-bottom: 1px dashed rgba(201,162,76,.18); }
.hrab:last-of-type { border-bottom: 0; }
.hrab img { width: 40px; height: 40px; flex: none; border-radius: 8px; }
.hrab > div { min-width: 0; } .hrab small { display: block; color: #b8a8c8; font-size: 12px; } .hrab p { margin: 2px 0 0; font-size: 13.5px; color: #e0d4c8; }
.hrblk .sfa small, .hrblk .snote { color: #b8a8c8; }
.hrblk .sfa .lv { color: #ffd070; }
.hrblk .sbar i { background: linear-gradient(90deg, #e0901a, #ffe27a); box-shadow: none; }
`;
  document.head.appendChild(st);
})();
