'use strict';
/* ==========================================================================
   3D-ANIMATION — Bewegungsablaeufe aus Schluesselposen (eigene Gestaltung)
   Jede Aktion ist eine Zeitleiste: Ausholen (0–0.3) · Kontakt (0.3–0.5) ·
   Nachschwingen/Erholen (0.5–1). Die Zeitleiste wird aus dem Kampfzustand
   berechnet, so passen Bild und Trefferzeitpunkt immer zusammen.
   Ebenen darueber: Treffer-Reaktion (richtungsabhaengig, schwere Treffer
   schleudern), Taumeln, Ausweichen je Richtung, Lehne in Kurven, Haarfeder.
   Arm/Bein-Index 0 = rechte Seite der Figur, 1 = linke Seite.
   ========================================================================== */

/* ------------------------------------------------------------ Posen */
function pose(o) {
  const p = { y: 0, air: 0, fwd: 0, spin: 0, bodyX: 0, lean: 0, twist: 0, roll: 0, hipYaw: 0, headX: 0, headY: 0,
    sh: [[0.05, 0.1], [0.05, 0.1]], el: [-0.35, -0.35], th: [[0, 0.03], [0, 0.03]], kn: [0.08, 0.08] };
  if (o) for (const k in o) p[k] = Array.isArray(o[k]) ? o[k].map((v) => (Array.isArray(v) ? v.slice() : v)) : o[k];
  return p;
}
function with_(base, o) { const p = pose(base); for (const k in o) p[k] = Array.isArray(o[k]) ? o[k].map((v) => (Array.isArray(v) ? v.slice() : v)) : o[k]; return p; }
function mixPose(A, B, k) {
  const out = {}, L = (a, b) => a + (b - a) * k;
  for (const key in A) {
    const a = A[key], b = B[key];
    if (Array.isArray(a)) out[key] = a.map((v, i) => (Array.isArray(v) ? v.map((w, j) => L(w, b[i][j])) : L(v, b[i])));
    else out[key] = L(a, b);
  }
  return out;
}
const easeIO = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
function keysAt(u, K) {
  if (u <= K[0][0]) return K[0][1];
  for (let i = 0; i < K.length - 1; i++) if (u <= K[i + 1][0]) { const k = (u - K[i][0]) / Math.max(1e-4, K[i + 1][0] - K[i][0]); return mixPose(K[i][1], K[i + 1][1], (K[i + 1][2] || easeIO)(k)); }
  return K[K.length - 1][1];
}
const snap = (k) => 1 - Math.pow(1 - k, 4); // schneller Einschlag
const slowIn = (k) => k * k * k;

// Grundhaltungen
const P_NEUTRAL = pose();
const P_GUARD = pose({ y: -0.05, twist: -0.22, hipYaw: 0.15, headY: 0.18, sh: [[-0.55, 0.32], [-0.85, 0.28]], el: [-2.05, -1.9], th: [[-0.28, 0.06], [0.18, 0.06]], kn: [0.42, 0.26] });
const P_LOOSE = pose({ y: -0.03, sh: [[-0.35, 0.3], [-0.45, 0.3]], el: [-1.5, -1.4], th: [[-0.15, 0.06], [0.1, 0.06]], kn: [0.25, 0.2] });
const P_PROWL = pose({ y: -0.2, lean: 0.5, headX: -0.4, sh: [[-1.05, 0.5], [-1.0, 0.5]], el: [-0.55, -0.6], th: [[-0.45, 0.18], [0.35, 0.18]], kn: [1.0, 0.75] });

/* ------------------------------------------------------------ Bewegungen (Zeitleisten) */
const MOVES = {
  jab: (G0) => [[0, G0], [0.3, with_(G0, { twist: -0.35, sh: [G0.sh[0], [-0.95, 0.3]], el: [G0.el[0], -2.25] }), slowIn],
    [0.42, with_(G0, { twist: -0.55, lean: 0.12, fwd: 0.1, sh: [G0.sh[0], [-1.62, 0.04]], el: [G0.el[0], -0.02] }), snap], [0.62, with_(G0, { twist: -0.5, lean: 0.1, fwd: 0.1, sh: [G0.sh[0], [-1.58, 0.06]], el: [G0.el[0], -0.1] })], [1, G0]],
  cross: (G0) => [[0, G0], [0.3, with_(G0, { twist: -0.45, y: -0.08, sh: [[-0.4, 0.45], G0.sh[1]], el: [-2.3, G0.el[1]] }), slowIn],
    [0.43, with_(G0, { twist: 0.8, hipYaw: 0.4, lean: 0.22, fwd: 0.2, sh: [[-1.66, 0.0], [-0.6, 0.35]], el: [-0.02, -2.2], th: [[0.25, 0.05], [-0.3, 0.05]], kn: [0.25, 0.35] }), snap],
    [0.64, with_(G0, { twist: 0.7, hipYaw: 0.35, lean: 0.18, fwd: 0.2, sh: [[-1.55, 0.05], [-0.6, 0.35]], el: [-0.12, -2.2] })], [1, G0]],
  // Drehtritt: dreht sich einmal um die eigene Achse und trifft frontal mit gestrecktem Bein
  spinkick: (G0) => [[0, G0], [0.18, with_(G0, { twist: -0.6, y: -0.12, spin: -0.3, sh: [[-0.3, 0.6], [-0.3, 0.6]], el: [-1.4, -1.4] }), slowIn],
    [0.3, with_(G0, { spin: Math.PI * 1.1, air: 0.14, lean: -0.2, sh: [[-0.4, 1.1], [-0.4, 1.1]], el: [-0.6, -0.6], th: [[-0.6, 0.2], [0.2, 0.05]], kn: [1.4, 0.4] })],
    [0.42, with_(G0, { spin: Math.PI * 2, air: 0.16, lean: -0.5, roll: 0.15, sh: [[-0.3, 1.2], [-0.5, 1.0]], el: [-0.5, -0.8], th: [[-1.6, 0.15], [0.3, 0.05]], kn: [0.02, 0.45] }), snap],
    [0.64, with_(G0, { spin: Math.PI * 2, air: 0.05, lean: -0.35, sh: [[-0.4, 1.0], [-0.5, 0.9]], el: [-0.7, -0.8], th: [[-1.4, 0.15], [0.2, 0.05]], kn: [0.15, 0.4] })],
    [1, with_(G0, { spin: Math.PI * 2 })]],
  uppercut: (G0) => [[0, G0], [0.3, with_(G0, { y: -0.3, lean: 0.4, twist: -0.55, sh: [[0.55, 0.25], [-0.9, 0.3]], el: [-1.3, -2.0], kn: [0.9, 0.8], th: [[-0.6, 0.1], [0.2, 0.1]] }), slowIn],
    [0.45, with_(G0, { air: 0.6, lean: -0.3, twist: 0.55, sh: [[-2.95, 0.12], [-0.6, 0.5]], el: [-0.15, -1.8], th: [[-1.1, 0.1], [0.45, 0.05]], kn: [1.5, 0.7] }), snap],
    [0.66, with_(G0, { air: 0.52, lean: -0.25, twist: 0.5, sh: [[-2.9, 0.12], [-0.6, 0.5]], el: [-0.2, -1.8], th: [[-0.9, 0.1], [0.3, 0.05]], kn: [1.3, 0.8] })],
    [0.84, with_(G0, { air: 0, y: -0.18, kn: [0.8, 0.8] }), easeInQ], [1, G0]],
  hammer: (G0) => [[0, G0], [0.28, with_(G0, { air: 0.85, lean: -0.35, sh: [[-3.05, 0.15], [-3.05, 0.15]], el: [-0.45, -0.45], th: [[-0.9, 0.2], [-0.8, 0.2]], kn: [1.4, 1.3] }), easeIO],
    [0.36, with_(G0, { air: 0, y: -0.32, lean: 0.8, sh: [[-1.15, 0.12], [-1.15, 0.12]], el: [-0.08, -0.08], th: [[-0.6, 0.3], [0.4, 0.3]], kn: [1.2, 0.9] }), easeInQ],
    [0.72, with_(G0, { y: -0.3, lean: 0.75, sh: [[-1.1, 0.15], [-1.1, 0.15]], el: [-0.1, -0.1], th: [[-0.6, 0.3], [0.4, 0.3]], kn: [1.2, 0.9] })], [1, G0]],
  shoot: (G0) => [[0, G0], [0.3, with_(G0, { twist: -0.5, sh: [[-0.5, 0.2], G0.sh[1]], el: [-1.9, G0.el[1]] }), slowIn], [0.42, with_(G0, { twist: 0.45, lean: 0.1, sh: [[-1.6, 0.0], G0.sh[1]], el: [-0.03, G0.el[1]] }), snap], [1, G0]],
  bow: (G0) => [[0, G0], [0.3, with_(G0, { twist: 0.35, sh: [[-1.5, 0.05], [-1.55, 0.0]], el: [-2.3, -0.05] })], [0.42, with_(G0, { twist: 0.4, sh: [[-1.5, 0.3], [-1.55, 0.0]], el: [-0.8, -0.05] }), snap], [1, G0]],
  sword: (G0) => [[0, G0], [0.3, with_(G0, { twist: 0.8, y: -0.06, sh: [G0.sh[0], [-2.6, 0.7]], el: [G0.el[0], -0.5] }), slowIn],
    [0.45, with_(G0, { twist: -0.85, lean: 0.25, fwd: 0.2, sh: [G0.sh[0], [-1.0, -0.6]], el: [G0.el[0], -0.15] }), snap], [1, G0]],
  // Gegner
  haymaker: (G0, alt) => { const i = alt ? 1 : 0, o = 1 - i, sgn = alt ? -1 : 1;
    const wa = with_(G0, { twist: -0.85 * sgn, y: -0.07, lean: -0.05 }); wa.sh[i] = [-0.3, 1.15]; wa.el[i] = -1.0;
    const hit = with_(G0, { twist: 0.95 * sgn, lean: 0.3, fwd: 0.22 }); hit.sh[i] = [-1.5, -0.55]; hit.el[i] = -0.3; hit.sh[o] = [-0.2, 0.4];
    return [[0, G0], [0.3, wa, easeIO], [0.46, hit, snap], [0.62, hit], [1, G0]]; },
  clawx: (G0, alt) => { const i = alt ? 1 : 0, sgn = alt ? -1 : 1;
    const wa = with_(G0, { twist: -0.75 * sgn, y: -0.12, lean: 0.3 }); wa.sh[i] = [-2.45, 0.95]; wa.el[i] = -0.55;
    const hit = with_(G0, { twist: 0.85 * sgn, y: -0.2, lean: 0.5, fwd: 0.28 }); hit.sh[i] = [-0.85, -0.75]; hit.el[i] = -0.15;
    return [[0, G0], [0.3, wa, easeIO], [0.45, hit, snap], [0.6, hit], [1, G0]]; },
  pounce: (G0) => [[0, G0], [0.3, with_(G0, { y: -0.34, lean: 0.65, sh: [[0.6, 0.4], [0.6, 0.4]], el: [-0.5, -0.5], kn: [1.3, 1.1] }), slowIn],
    [0.4, with_(G0, { air: 0.65, lean: 0.95, sh: [[-2.3, 0.35], [-2.3, 0.35]], el: [-0.2, -0.2], th: [[0.5, 0.1], [0.7, 0.1]], kn: [1.3, 1.4] }), snap],
    [0.5, with_(G0, { air: 0.15, lean: 0.9, sh: [[-1.6, 0.2], [-1.6, 0.2]], el: [-0.1, -0.1], th: [[-0.5, 0.1], [0.3, 0.1]], kn: [0.6, 0.8] }), easeInQ],
    [0.62, with_(G0, { y: -0.3, lean: 0.6 })], [1, G0]],
  tackle: (G0) => [[0, G0], [0.3, with_(G0, { y: -0.22, lean: 0.55, twist: -0.4, sh: [[0.5, 0.3], [0.4, 0.3]], el: [-1.2, -1.2], kn: [1.0, 0.8] }), slowIn],
    [0.4, with_(G0, { lean: 0.95, twist: 0.5, fwd: 0.3, sh: [[-1.3, 0.3], [-1.2, 0.3]], el: [-0.2, -0.3], th: [[-1.0, 0.05], [0.8, 0.05]], kn: [0.5, 1.0] }), snap], [0.6, with_(G0, { lean: 0.8, fwd: 0.2 })], [1, G0]],
  throw_: (G0) => [[0, G0], [0.3, with_(G0, { twist: -0.7, lean: -0.3, sh: [[-2.85, 0.3], [-0.8, 0.6]], el: [-0.8, -0.8] }), slowIn],
    [0.44, with_(G0, { twist: 0.6, lean: 0.35, fwd: 0.12, sh: [[-1.45, 0.0], [-0.3, 0.5]], el: [-0.05, -0.8] }), snap], [1, G0]]
};
const CLIP_CACHE = new Map();
function clip(name, G0, alt) { const k = name + (alt ? '1' : '0') + (G0 === P_GUARD ? 'g' : G0 === P_PROWL ? 'p' : 'l'); if (!CLIP_CACHE.has(k)) CLIP_CACHE.set(k, MOVES[name](G0, alt)); return CLIP_CACHE.get(k); }
// Zeitleiste aus dem Zustand: Ausholen 0–0.3, Kontakt 0.3–0.5, Erholen 0.5–1
function timeline(e) {
  const K = e.atk, s = e.stateT || 0;
  if (e.team === 0) { const w = K.win, a = K.act + 0.05, r = Math.max(0.1, K.rec); return s < w ? 0.3 * s / w : s < w + a ? 0.3 + 0.2 * (s - w) / a : Math.min(1, 0.5 + 0.5 * (s - w - a) / r); }
  if (e.state === 'wind') return 0.3 * Math.min(1, s / K.wind);
  if (e.state === 'active') return 0.3 + 0.2 * Math.min(1, s / Math.max(0.05, K.act));
  return Math.min(1, 0.5 + 0.5 * s / Math.max(0.1, K.rec));
}

/* ------------------------------------------------------------ Pose je Figur und Zustand */
function stanceOf(e) {
  if (e.npc) return P_NEUTRAL;
  if (e.kind === 'kyle' && e.phase === 2) return P_PROWL;
  if (e.team === 0 && (e.kit === 'fist' || e.kit === 'raten' || e.kit === 'sil' || e.kit === 'feuer')) return P_GUARD;
  return e.team === 1 ? P_LOOSE : P_GUARD;
}
function playerMove(e) {
  const K = e.atk;
  if (K.hammer) return 'hammer';
  if (K.proj) return e.kit === 'bow' ? 'bow' : 'shoot';
  if (e.kit === 'sword') return 'sword';
  if (e.charged) return 'uppercut';
  if (K.kick) return 'spinkick';
  return e.combo % 2 ? 'cross' : 'jab';
}
function foeMove(e) {
  const K = e.atk, tiger = e.kind === 'kyle' && e.phase === 2;
  if (K.type === 'lunge') return tiger ? 'pounce' : 'tackle';
  if (K.type === 'beam') return 'throw_';
  return tiger ? 'clawx' : 'haymaker';
}
function locomotion(p, e, st0) {
  const A = e.anim, run = A.run || 0, ph = A.phase || 0;
  if (run < 0.02) return p;
  const r = with_(p, {});
  const k = Math.min(1, run * 1.3);
  r.th = [[lerpA(p.th[0][0], Math.sin(ph) * 0.9, k), p.th[0][1]], [lerpA(p.th[1][0], -Math.sin(ph) * 0.9, k), p.th[1][1]]];
  r.kn = [lerpA(p.kn[0], Math.max(0, -Math.cos(ph)) * 1.3 + 0.1, k), lerpA(p.kn[1], Math.max(0, Math.cos(ph)) * 1.3 + 0.1, k)];
  r.lean = p.lean + 0.22 * k; r.y = p.y - Math.abs(Math.cos(ph)) * 0.04 * k;
  r.twist = lerpA(p.twist, -Math.sin(ph) * 0.2, k);
  if (st0 !== P_PROWL && e.state === 'idle') { // Arme schwingen beim Sprinten, im Kampfschritt bleibt die Deckung
    const sw = Math.max(0, (run - 0.5) / 0.5);
    r.sh = [[lerpA(p.sh[0][0], -Math.sin(ph) * 0.9, sw), lerpA(p.sh[0][1], 0.15, sw)], [lerpA(p.sh[1][0], Math.sin(ph) * 0.9, sw), lerpA(p.sh[1][1], 0.15, sw)]];
    r.el = [lerpA(p.el[0], -1.5, sw), lerpA(p.el[1], -1.5, sw)];
  }
  return r;
}
function poseHuman(R, e, dt) {
  const A = e.anim, t = A.t || 0, st = e.state, sT = e.stateT || 0;
  const G0 = stanceOf(e);
  let P;
  // neue Aktion erkannt -> Seite wechseln (Ketten-Angriffe abwechselnd)
  if (st === 'wind' && R.lastSt !== 'wind') R.alt = R.lastSt === 'active' ? !R.alt : false;
  R.lastSt = st;
  if (st === 'attack' && e.atk) P = keysAt(timeline(e), clip(playerMove(e), G0));
  else if ((st === 'wind' || st === 'active' || st === 'recover') && e.atk) P = keysAt(timeline(e), clip(foeMove(e), G0, R.alt));
  else if (st === 'charge') { const k = snap(Math.min(1, sT / 0.3)); P = mixPose(G0, with_(G0, { y: -0.2, twist: -0.8, lean: 0.2, sh: [[0.6, 0.35], [-1.0, 0.3]], el: [-2.2, -1.6], kn: [0.8, 0.6] }), k); P.twist += Math.sin(t * 50) * 0.02 * k; }
  else if (st === 'dodge') P = dodgePose(R, e, G0, sT);
  else if (st === 'stagger') { const k = Math.sin(t * 9); P = with_(G0, { lean: -0.35, headX: -0.4, roll: k * 0.18, y: -0.1, sh: [[0.4, 0.7], [0.3, 0.8]], el: [-0.5, -0.4], th: [[-0.4 * k, 0.2], [0.4 * k, 0.2]], kn: [0.5, 0.5] }); }
  else if (st === 'transform') P = with_(G0, { y: -0.2, lean: 0.5, headX: 0.35, sh: [[0.25 + Math.sin(t * 34) * 0.12, 0.8], [0.25 - Math.sin(t * 34) * 0.12, 0.8]], el: [-1.8, -1.8], kn: [0.8, 0.8] });
  else if (st === 'hurt') P = with_(G0, { lean: -0.45, headX: -0.4, sh: [[0.35, 0.6], [0.3, 0.6]], el: [-0.6, -0.6] });
  else P = locomotion(with_(G0, {}), e, G0);
  // Idle-Leben: Federn in der Deckung, Atmen, Schleichen
  if (st === 'idle' && (A.run || 0) < 0.3) {
    if (G0 === P_GUARD) { P.y += Math.sin(t * 6.5) * 0.014; P.headX += Math.sin(t * 3.1) * 0.03; }
    else if (G0 === P_PROWL) { P.roll += Math.sin(t * 2.2) * 0.08; P.headY += Math.sin(t * 1.3) * 0.3; P.y += Math.sin(t * 4.4) * 0.02; }
    else P.y += Math.sin(t * 2.3) * 0.006;
  }
  if (A.cast > 0.15 && st !== 'attack' && st !== 'wind' && st !== 'active') { // Blutschnitt / Spray / Schatten: Hieb quer durch die Luft
    const c = A.cast; P.sh[0] = [lerpA(P.sh[0][0], -1.45, c), lerpA(P.sh[0][1], lerpA(-0.6, 1.0, c), c)]; P.el[0] = lerpA(P.el[0], -0.1, c); P.twist = lerpA(P.twist, lerpA(0.7, -0.6, c), c); P.lean += 0.15 * c;
  }
  if (e.npc) npcPose(P, e, t);
  if (e.rootT > 0) { P.th = [[0, 0.1], [0, 0.1]]; P.kn = [0.15, 0.15]; P.roll += Math.sin(t * 22) * 0.06; P.headX -= 0.2; }
  // Treffer-Reaktion (richtungsabhaengig), schwere Treffer schleudern kurz durch die Luft
  const H = R.hit;
  if (H) {
    H.t += dt; const k = Math.max(0, 1 - H.t / 0.45);
    if (H.dir === 'front') { P.lean -= 0.65 * k; P.headX -= 0.55 * k; P.sh[0][1] += 0.5 * k; P.sh[1][1] += 0.5 * k; }
    else if (H.dir === 'back') { P.lean += 0.5 * k; P.headX += 0.3 * k; }
    else { P.roll += 0.45 * k * H.side; P.headY += 0.7 * k * H.side; P.twist += 0.4 * k * H.side; }
    if (H.heavy) { const u = Math.min(1, H.t / 0.55); P.air += Math.sin(u * Math.PI) * 0.55; P.bodyX -= Math.sin(u * Math.PI) * 0.7; P.kn = [P.kn[0] + 0.8 * (1 - u), P.kn[1] + 0.9 * (1 - u)]; if (u >= 1 && H.t < 0.75) P.y -= 0.18 * (1 - (H.t - 0.55) / 0.2); }
    if (H.t > 0.8) R.hit = null;
  }
  // Lehne in Kurven
  P.roll += clamp(R.turnV || 0, -1, 1) * 0.12;
  applyPose(R, P, e, dt);
}
function dodgePose(R, e, G0, sT) {
  const k = Math.min(1, sT / 0.3), s = Math.sin(k * Math.PI);
  const face = Math.atan2(Math.cos(R.yaw), Math.sin(R.yaw)), rel = angDiff(face, e.dodgeA || 0);
  if (Math.abs(rel) < 0.8) return with_(G0, { y: -0.12 * s, lean: 0.85 * s, fwd: 0.1 * s, sh: [[0.9 * s - 0.2, 0.25], [0.9 * s - 0.2, 0.25]], el: [-0.35, -0.35], th: [[-1.0 * s, 0.05], [0.9 * s, 0.05]], kn: [0.6 + 0.6 * s, 1.2 * s] });
  if (Math.abs(rel) > 2.3) return with_(G0, { air: 0.32 * s, lean: -0.4 * s, headX: 0.2 * s, sh: [[-0.8, 0.5], [-0.8, 0.5]], el: [-1.6, -1.6], th: [[-0.9 * s, 0.1], [-0.6 * s, 0.1]], kn: [1.5 * s + 0.2, 1.3 * s + 0.2] });
  const side = rel > 0 ? 1 : -1;
  return with_(G0, { air: 0.28 * s, y: -0.1 * s, roll: -0.55 * s * side, lean: 0.2 * s, sh: [[-0.9, 0.9], [-0.9, 0.9]], el: [-1.4, -1.4], th: [[-1.1 * s, 0.25], [-1.0 * s, 0.25]], kn: [1.7 * s, 1.6 * s] });
}
function npcPose(P, e, t) {
  if (e.npc.pose === 'cower') { P.y = -0.36; P.lean = 0.6; P.sh = [[-2.5, 0.5], [-2.5, 0.5]]; P.el = [-1.9, -1.9]; P.th = [[-1.1, 0.1], [-1.1, 0.1]]; P.kn = [2.0, 2.0]; P.roll = Math.sin(t * 20) * 0.02; }
  if (e.npc.pose === 'cheer' && e.anim.cast > 0.1) { P.sh = [[-2.9, 0.35], [-2.9, 0.35]]; P.el = [-0.3, -0.3]; P.y = Math.abs(Math.sin(t * 9)) * 0.04; }
}
// Pose auf die Knochen uebertragen (weich; Drehung beim Drehtritt direkt, damit sie nicht zurueckdreht)
function applyPose(R, P, e, dt) {
  const st = e.state, fast = st === 'attack' || st === 'active' || st === 'wind' || st === 'dodge' || st === 'hurt' || !!R.hit;
  const k = 1 - Math.exp(-dt * (fast ? 38 : 16)), set = (o, prop, v) => { o[prop] = lerpA(o[prop], v, k); };
  const L = R.legs, Ar = R.arms, out = (i, v) => (i === 0 ? -v : v);
  set(R.hips.position, 'y', 1.0 + P.y);
  set(R.torso.rotation, 'x', P.lean); set(R.torso.rotation, 'y', P.twist); set(R.torso.rotation, 'z', P.roll);
  set(R.hips.rotation, 'y', P.hipYaw - P.twist * 0.25);
  set(R.head.rotation, 'x', P.headX - P.lean * 0.45); set(R.head.rotation, 'y', P.headY - P.twist * 0.45);
  for (const i of [0, 1]) {
    set(L[i].thigh.rotation, 'x', P.th[i][0]); set(L[i].thigh.rotation, 'z', out(i, P.th[i][1])); set(L[i].knee.rotation, 'x', P.kn[i]); set(L[i].foot.rotation, 'x', -P.th[i][0] * 0.25 - P.kn[i] * 0.25);
    set(Ar[i].sh.rotation, 'x', P.sh[i][0]); set(Ar[i].sh.rotation, 'z', out(i, P.sh[i][1])); set(Ar[i].el.rotation, 'x', P.el[i]);
  }
  // Koerper: Sprung, Vorschub, Drehung, Sturz
  const dead = st === 'down' ? Math.min(1, (e.stateT || 0) * 2.4) : 0, fall = dead < 1 ? dead * dead : 1;
  const bounce = st === 'down' && e.stateT > 0.42 ? Math.max(0, Math.sin(Math.min(1, (e.stateT - 0.42) * 3) * Math.PI)) * 0.08 : 0;
  R.body.position.y = lerpA(R.body.position.y, P.air, 1 - Math.exp(-dt * 30)) * (1 - fall) + 0.1 * fall;
  R.body.position.z = lerpA(R.body.position.z, P.fwd, k) - 0.3 * fall;
  R.body.rotation.y = P.spin;
  R.body.rotation.x = lerpA(R.body.rotation.x, P.bodyX, k) * (1 - fall) + (-1.48 * fall + bounce);
  // Haare federn nach
  const sp = R.spr, fwd = Math.hypot(e.vx, e.vy) / 150;
  sp.hv += ((-fwd * 0.35 - P.lean * 0.3 - (P.air > 0.1 ? 0.25 : 0) - sp.hx) * 90 - sp.hv * 9) * dt; sp.hx += sp.hv * dt;
  R.hairPivot.rotation.x = clamp(sp.hx, -0.5, 0.4);
}
