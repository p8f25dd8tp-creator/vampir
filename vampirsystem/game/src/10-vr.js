'use strict';
/* ==========================================================================
   ETAPPE 5 — Power Fighter (VR-Raum der Akademie) und Kapitel 49–64
   Roman: leere Arena, Duelle, Lebensbalken ohne echten Schaden, frei gestaltbares
   Aussehen, Quinns Name „Blood Evolver“. Im Spiel kostet Blood Swipe keine HP,
   die Blutbank wirkt nicht, ein Sieg gibt 25 EP. Eigene Gestaltung aller Figuren.
   ========================================================================== */

Object.assign(LOOKS, {
  // Quinns VR-Figur: roter Stachelkopf in Arbeitskleidung
  bloodevolver: { outfit: 'shirt', top: '#6a4a2a', topL: '#9a7248', topD: '#2e1e0e', leg: '#3a4a6a', legD: '#1a2234', shoe: '#3a2a1a', skin: '#e8c6ac', skinD: '#b08a74', hair: '#c01a2a', eye: '#ff4a5a', hairStyle: 'spiky', rim: '#ff4a5a' },
  windklinge: { outfit: 'uniform', top: '#3a5a4a', topL: '#5e8a74', topD: '#18281e', leg: '#1e2a24', legD: '#0c120e', shoe: '#1a1a14', skin: '#e0c0a0', skinD: '#a08060', hair: '#d8d8c8', eye: '#8ad8b0', hairStyle: 'long', trim: '#d0c0a0', rim: '#8ad8b0', weapon: 'sword' },
  nate: { outfit: 'shirt', top: '#5a6272', topL: '#9aa4b8', topD: '#2a303c', leg: '#2a303c', legD: '#141820', shoe: '#1a1a1e', skin: '#dcc0a8', skinD: '#9c8068', hair: '#3a2a1a', eye: '#5a6a7a', hairStyle: 'spiky', rim: '#c8d8f0' },
  sam: { outfit: 'uniform', top: '#4a3a2a', topL: '#7a6248', topD: '#20160e', leg: '#221a14', legD: '#100c08', shoe: '#1a1410', skin: '#f0d8c4', skinD: '#b09888', hair: '#2a1a14', eye: '#5a4a3a', hairStyle: 'messy', trim: '#d0c0a0', rim: '#d0c0a0' },
  logan: { outfit: 'shirt', top: '#2a3a4a', topL: '#4a6278', topD: '#101820', leg: '#1e2630', legD: '#0c1016', shoe: '#e8e8ea', skin: '#f0dccc', skinD: '#b09888', hair: '#3a5a2a', eye: '#6ad8a0', glasses: true, hairStyle: 'messy', rim: '#6ad8a0' },
  earl: { outfit: 'uniform', top: '#3a2a2a', topL: '#664646', topD: '#1a0e0e', leg: '#221818', legD: '#100a0a', shoe: '#141010', skin: '#e0c0a8', skinD: '#a08068', hair: '#1a1410', eye: '#5a2a2a', hairStyle: 'short', trim: '#b0a070', angry: true, rim: '#d08080' },
  duke: { outfit: 'uniform', top: '#3a4230', topL: '#6a7456', topD: '#161a10', leg: '#20241a', legD: '#0e100a', shoe: '#141410', skin: '#d8c0a8', skinD: '#8a7058', hair: '#8a8a8a', eye: '#e0c050', hairStyle: 'short', trim: '#e0c050', angry: true, rim: '#e0c050' }
});
CHARS.quinn.vrName = 'Blood Evolver';

// VR-Arena: dunkler Boden mit leuchtendem Raster
ARENA_ART.vr = function (A) {
  const S = 2, c = mkCanvas(A.w * S, A.h * S), g = c.getContext('2d');
  g.scale(S, S);
  g.fillStyle = rg(g, A.w / 2, A.h / 2, 20, Math.max(A.w, A.h) * 0.7, [0, '#12203a', 1, '#04060e']); g.fillRect(0, 0, A.w, A.h);
  g.strokeStyle = 'rgba(95,240,255,0.18)'; g.lineWidth = 1;
  for (let x = 0; x <= A.w; x += 20) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, A.h); g.stroke(); }
  for (let y = 0; y <= A.h; y += 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(A.w, y); g.stroke(); }
  g.strokeStyle = 'rgba(95,240,255,0.7)'; g.lineWidth = 2.5; g.strokeRect(14, 50, A.w - 28, A.h - 70);
  g.beginPath(); g.arc(A.w / 2, A.h / 2 + 10, 60, 0, TAU); g.stroke();
  g.fillStyle = 'rgba(95,240,255,0.08)'; g.fillRect(14, 50, A.w - 28, A.h - 70);
  g.font = '800 14px Cinzel, serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(95,240,255,0.55)'; g.fillText('POWER FIGHTER', A.w / 2, 34);
  return c;
};

/* ------------------------------------------------------------ Gegner-KI */
const WIND_ATK = {
  stab: { type: 'swipe', wind: 0.36, act: 0.08, rec: 0.35, reach: 38, arc: 0.8, dmg: 1, col: '#8ad8b0', chain: { type: 'swipe', wind: 0.22, act: 0.08, rec: 0.45, reach: 38, arc: 0.8, dmg: 1, col: '#8ad8b0' } },
  gust: { type: 'beam', wind: 0.55, act: 0.12, rec: 0.5, len: 220, width: 26, dmg: 1, col: '#bff0d8' }
};
// Windklinge: schnelle Dolche, Windstoss auf Distanz; der Bestien-Umhang blockt Blood Swipe (Kap. 54)
const AI_WIND = { cloak: true, params: () => ({ range: 42, speed: 120, cd: 0.8 }), choose: (e, d) => (d > 90 ? WIND_ATK.gust : d < 56 ? WIND_ATK.stab : null) };
const NATE_ATK = {
  punch: { type: 'swipe', wind: 0.5, act: 0.1, rec: 0.5, reach: 42, arc: 1.0, dmg: 2, col: '#c8d8f0' },
  charge: { type: 'lunge', wind: 0.7, act: 0.26, rec: 0.8, speed: 300, dmg: 2, shout: '!' }
};
// Hardsteely (Nate): ganzer Koerper aus Metall; nur Hammer Strike und Konter gehen durch (Kap. 55–56)
const AI_NATE = { steel: true, params: () => ({ range: 42, speed: 85, cd: 1.0 }), choose: (e, d) => (d > 100 ? NATE_ATK.charge : d < 60 ? NATE_ATK.punch : null) };

/* ------------------------------------------------------------ Rangliste */
const VR_LIST = [
  { id: 'vr1', look: 's1', name: 'Funkenkind · Feuer', hp: 14, ai: AI_THUG, blurb: 'Ein Anfänger mit viel Mut und wenig Deckung.' },
  { id: 'vr2', look: 's2', name: 'Lanzenfuchs', hp: 18, ai: AI_BRANDON, blurb: 'Hält dich mit der Lanze auf Abstand.' },
  { id: 'vr3', look: 's3', name: 'Felsbrecher · Erde', hp: 22, ai: AI_EARTH, blurb: 'Stürmt nach vorn, wenn du zu weit weg bist.' },
  { id: 'vr4', look: 's4', name: 'Nasse Katze · Wasser', hp: 20, ai: AI_WATER, blurb: 'Schießt Wasserstrahlen aus der Ferne.' },
  { id: 'windklinge', look: 'windklinge', name: 'Windklinge · Bestien-Umhang', hp: 24, ai: AI_WIND, blurb: 'Schnelle Dolche. Der Umhang schluckt Blood Swipe.' },
  { id: 'hardsteely', look: 'nate', name: 'Hardsteely · Metall', hp: 30, ai: AI_NATE, blurb: 'Ganz aus Metall. Nur Hammer Strike und Konter gehen durch.' },
  { id: 'vr7', look: 'zweit', name: 'Doppelklinge', hp: 32, ai: AI_LEO, blurb: 'Wird mit jeder Sekunde schneller.' },
  { id: 'vr8', look: 'rylee', name: 'Eisenhaut', hp: 34, ai: AI_RYLEE, blurb: 'Verhärtet immer nur eine Seite.' },
  { id: 'vr9', look: 'mono', name: 'Champion der Woche', hp: 44, ai: AI_MONO_BOSS, blurb: 'Sieht deine Schläge kommen.' }
];
const VR_COST = 5;
function vrFight(o, extra) {
  return Object.assign({
    arena: { art: 'vr', w: 340, h: 640 },
    playerAt: [170, 470], vr: true, inspect: true,
    foes: [{ id: o.id, look: o.look, name: o.name, hp: o.hp, poise: o.poise || 4, at: [170, 290], ai: o.ai, expRate: 0, info: { name: o.name, race: 'VR-Figur', ability: o.blurb, blood: '—' } }],
    expBonus: (G, won) => (won ? 25 : 5)
  }, extra || {});
}
function showVrMenu(back) {
  const V = SAVE.vr || (SAVE.vr = { rank: 0, wins: 0 });
  const el = document.createElement('div');
  el.className = 'screen dim'; el.style.pointerEvents = 'auto'; el.style.zIndex = 20; el.style.justifyContent = 'flex-start'; el.style.overflowY = 'auto';
  const rows = VR_LIST.map((o, i) => {
    const open = i <= V.rank, beaten = i < V.rank;
    return `<button class="vrrow ${open ? '' : 'locked'}" data-i="${i}" ${open ? '' : 'disabled'}><b>${i + 1}. ${open ? o.name : '???'}</b><small>${open ? o.blurb : 'Besiege zuerst Platz ' + i}</small><span>${beaten ? '✔' : open ? '+25 EP' : '🔒'}</span></button>`;
  }).join('');
  el.innerHTML = `${sysBox({ head: 'POWER FIGHTER', lines: ['Spieler: Blood Evolver', `Credits: ${SAVE.credits} · ein Kampf kostet ${VR_COST} Credits`, 'Kein echter Schaden. Blood Swipe kostet hier keine HP, die Blutbank wirkt nicht.'], kv: [['Siege', V.wins], ['Rang', V.rank + 1 + ' / ' + VR_LIST.length]] })}
    <div class="vrlist">${rows}</div><button class="btn ghost" id="vrBack">Zurück</button>`;
  el.querySelectorAll('.vrrow').forEach((b) => b.addEventListener('click', () => {
    if (SAVE.credits < VR_COST) { b.querySelector('small').textContent = 'Zu wenig Credits – jeder Tag bringt 10.'; return; }
    SAVE.credits -= VR_COST; writeSave();
    const i = +b.dataset.i, o = VR_LIST[i];
    MISSIONS.vrfree = { id: 'vrfree', title: 'Power Fighter', type: 'duell', fight: vrFight(o), repeat: true, next: 'akademie',
      after: () => {}, onWinExtra: () => { V.wins++; if (i === V.rank && V.rank < VR_LIST.length - 1) V.rank++; writeSave(); } };
    el.remove(); leaveHub(() => startMission('vrfree'));
  }));
  el.querySelector('#vrBack').onclick = () => { el.remove(); back && back(); };
  UI.root.appendChild(el);
}

/* ------------------------------------------------------------ Missionen (Kap. 49–64) */
Object.assign(MISSIONS, {
  vrintro: {
    id: 'vrintro', title: 'Power Fighter', src: 'Kapitel 50–53', type: 'duell',
    scene: [
      { bg: 'kantine', portrait: 'vorden' },
      { narr: 'Vorden erzählt von einem VR-Spiel, das an der Akademie alle spielen: Power Fighter. Eine leere Arena, Duelle, jede öffentlich bekannte Fähigkeit ist wählbar.' },
      { who: 'Vorden', text: 'Mein Name dort ist VBCopy. Komm mit, ich zahl die erste Stunde.' },
      { narr: 'Im VR-Raum darf man sein Aussehen frei wählen. Quinn wird zu einem Bauern mit roten Stachelhaaren und nennt sich Blood Evolver.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'SYSTEM', lines: ['Das System funktioniert auch hier.', 'Blood Swipe kostet im Spiel keine HP. Die Blutbank wirkt nicht.', 'Ein Sieg bringt 25 EP.'] } }
    ],
    fight: vrFight(VR_LIST[0]),
    won: [
      { bg: 'system' },
      { sys: { head: 'POWER FIGHTER', lines: ['Erster Sieg als Blood Evolver.', 'Der VR-Raum steht dir ab jetzt tagsüber offen (neben der Trainingshalle).'] } }
    ],
    after: () => { stepDone('vrintro'); SAVE.vr = SAVE.vr || { rank: 1, wins: 1 }; },
    next: 'akademie'
  },
  windklinge: {
    id: 'windklinge', title: 'Die Windklinge', src: 'Kapitel 54', type: 'duell',
    scene: [
      { bg: 'system' },
      { sys: { head: 'SCHNELLSPIEL', lines: ['Ein Gegner mit Winddolchen und einem Umhang aus Bestienmaterial.', 'Der Umhang schluckt Blood Swipe. Komm nah ran – Flash Step hilft.'] } }
    ],
    fight: vrFight(VR_LIST[4]),
    won: [
      { bg: 'kantine', portrait: 'nate' },
      { narr: 'Nach dem Kampf wartet ein Zuschauer in der Lobby: ein Zweitjähriger von einer anderen Akademie, Kampfkunst-Fan. Im Spiel heißt er Hardsteely.' },
      { who: 'Nate', text: 'Du kämpfst wie keiner hier. Ich will gegen dich antreten.' },
      { portrait: 'sam' },
      { narr: 'Sein Freund Sam, in einen auffälligen Umhang gehüllt, verliert gerade eine Wette nach der anderen.' }
    ],
    reward: { exp: 20 },
    after: () => { stepDone('windklinge'); const V = SAVE.vr || (SAVE.vr = { rank: 0, wins: 0 }); V.rank = Math.max(V.rank, 5); },
    next: 'akademie'
  },
  nate: {
    id: 'nate', title: 'Hardsteely', src: 'Kapitel 55–56', type: 'duell',
    scene: [
      { bg: 'system' },
      { sys: { head: 'DUELL', lines: ['Hardsteely macht sich komplett zu Metall.', 'Normale Treffer richten kaum etwas an. Hammer Strike trifft nach innen – und Konter nach perfektem Ausweichen gehen durch.'] } }
    ],
    fight: vrFight(VR_LIST[5]),
    won: [
      { bg: 'kantine', portrait: 'nate' },
      { narr: 'Nate lacht, obwohl er verloren hat. Hammer Strike ist ein Schlag, der nach innen wirkt – genau das, was gegen Verhärtung hilft.' },
      { who: 'Nate', text: 'Nächstes Mal krieg ich dich. Ab jetzt sind wir Rivalen.' }
    ],
    reward: { exp: 30 },
    after: () => { stepDone('nate'); const V = SAVE.vr || (SAVE.vr = { rank: 0, wins: 0 }); V.rank = Math.max(V.rank, 6); },
    next: 'akademie'
  },
  sonne: {
    id: 'sonne', title: 'Sonnentests', src: 'Kapitel 56–58',
    scene: [
      { bg: 'kantine', portrait: 'layla' },
      { narr: 'Layla hilft Quinn herauszufinden, was ihm in der Sonne hilft. Ein UV-Schirm schützt vollständig, ist aber unpraktisch. Sonnencreme nützt nichts. Erst dicke schwarze Kleidung wirkt.' },
      { who: 'Layla', text: 'Und Knoblauch? Ein Kreuz? Silber?' },
      { portrait: 'quinn' },
      { narr: 'Nichts davon macht ihm etwas aus – Inspect bestätigt es. Süßes schmeckt ihm fad, Fleisch gut, Blut wie Karamell. Und die Frage bleibt: Altert er überhaupt noch?' },
      { bg: 'system', portrait: null },
      { sys: { head: 'IDEE', lines: ['Sams Umhang ist aus Bestienmaterial.', 'Ein Anzug aus so einem Material könnte gegen die Sonne helfen.'] } }
    ],
    after: () => { stepDone('sonne'); },
    next: 'akademie'
  },
  portalteam: {
    id: 'portalteam', title: 'Die Portale', src: 'Kapitel 59–61',
    scene: [
      { bg: 'kantine', portrait: 'del' },
      { narr: 'Del erklärt die Portale, die aus Dalki-Technik gebaut wurden. Grüne sind erforscht und haben Shelter, orange nur teilweise, rote gar nicht.' },
      { narr: 'Für die ersten Portalmissionen bilden sich Fünferteams: Quinn, Layla, Vorden, Peter – und Erin will unbedingt dazu.' },
      { portrait: 'erin' },
      { who: 'Erin', text: 'Peter hat keine richtige Fähigkeit. Er bremst uns.' },
      { portrait: 'quinn' },
      { who: 'Quinn', text: 'Peter bleibt. Wenn dir das nicht passt, such dir ein anderes Team.' },
      { narr: 'Erin bleibt trotzdem. Die Formation steht: Erin und Vorden vorn, Layla hinten. Quinn tut so, als käme seine Kraft von einer Bestienwaffe.' }
    ],
    after: () => { stepDone('portal'); },
    next: 'akademie'
  },
  logan: {
    id: 'logan', title: 'Ein Hacker?', src: 'Kapitel 62–63',
    scene: [
      { bg: 'zimmer', portrait: 'nate' },
      { narr: 'Nate verrät einen Tipp: Auf Caladi lebt eine geflügelte Wüstenbestie. Aus ihrem Kern ist Sams Umhang gemacht.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'POWER FIGHTER', lines: ['Ein Verlierer hat ein Video hochgeladen:', 'Welche Fähigkeit ist das? Spielt Blood Evolver mit Hacks?'] } },
      { bg: 'kantine', portrait: 'logan' },
      { narr: 'Logan Green, Schüler und Sohn des Erfinders von Power Fighter, ist der Chef-Programmierer des Spiels. Er findet keinen Hack – nur etwas, das er sich nicht erklären kann.' },
      { who: 'Logan', text: 'Keine Manipulation. Dann ist es eine Fähigkeit, die niemand kennt. Ich finde heraus, wer du bist, Blood Evolver.' }
    ],
    after: () => { stepDone('logan'); },
    next: 'akademie'
  },
  earl: {
    id: 'earl', title: 'Peters Auftrag', src: 'Kapitel 49, 64',
    scene: [
      { bg: 'nacht', portrait: 'peter' },
      { narr: 'Peter ist in letzter Zeit kaum noch im Zimmer. Quinn findet heraus, warum.' },
      { portrait: 'earl' },
      { narr: 'Earl, Stufe 4, führt eine Gruppe von Erstjährigen, die für Mono arbeiten. Seit Wochen setzt er Peter unter Druck – mit Schmerzen, die ein Heiler danach wieder verschwinden lässt.' },
      { portrait: 'duke' },
      { narr: 'Schließlich empfängt General Duke Peter persönlich. Als Lohn bietet er Fähigkeitsbücher für Erde – wenn bei der ersten Portalmission jemand aus Peters Team verschwindet.' },
      { portrait: 'peter' },
      { narr: 'Peter sagt nichts. Aber er nimmt die Bücher.' },
      { bg: 'nacht', portrait: null },
      { narr: 'Ende der fünften Etappe. Als Nächstes: das rote Portal.' }
    ],
    after: () => { stepDone('earl'); },
    next: null
  }
});
MISSION_ORDER.push('vrintro', 'windklinge', 'nate', 'sonne', 'portalteam', 'logan', 'earl');

const STORY5 = [
  { id: 'vrintro', need: 'aula', newDay: true, label: 'VR-Raum (mit Vorden)', x: 290, y: 445, goal: 'Vorden will dir Power Fighter zeigen (VR-Raum)', mission: 'vrintro' },
  { id: 'windklinge', need: 'vrintro', label: 'VR-Raum · Herausforderung', x: 290, y: 445, goal: 'Nimm im VR-Raum ein Schnellspiel an', mission: 'windklinge' },
  { id: 'nate', need: 'windklinge', newDay: true, label: 'VR-Raum · Hardsteely', x: 290, y: 445, goal: 'Hardsteely wartet im VR-Raum', mission: 'nate' },
  { id: 'sonne', need: 'nate', label: 'Layla (Sonnentest)', x: 330, y: 150, goal: 'Teste mit Layla, was gegen die Sonne hilft', mission: 'sonne' },
  { id: 'portal', need: 'sonne', newDay: true, label: 'Kantine · Einteilung', x: 105, y: 420, goal: 'Einteilung der Portal-Teams (Kantine)', mission: 'portalteam' },
  { id: 'logan', need: 'portal', label: 'Zimmer 23 · Nachrichten', x: 110, y: 150, goal: 'Im Zimmer 23 wartet eine Nachricht', mission: 'logan' },
  { id: 'earl', need: 'logan', night: true, label: 'Peter suchen', x: 220, y: 680, goal: 'Nachts: Wo ist Peter?', mission: 'earl' }
];
