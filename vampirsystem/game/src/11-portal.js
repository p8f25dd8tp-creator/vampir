'use strict';
/* ==========================================================================
   ETAPPE 6 — Das rote Portal (Kapitel 65–110)
   Peters Stoß, der dunkle Planet, Rattaclaws, Scordana, der Bloodsucker,
   die Evolution zum Vampir, Schatten und MC, Rückkehr zur Akademie.
   Alle Texte eigene Zusammenfassungen, alle Figuren eigene Gestaltung.
   ========================================================================== */

Object.assign(LOOKS, {
  // Quinn nach der Evolution: blasser, dunkelrote Augen
  quinnvamp: Object.assign({}, LOOKS.quinn, { skin: '#f2e2da', skinD: '#b8a098', eye: '#9a1a2a', rim: '#ff5a6a' }),
  ian: { outfit: 'shirt', top: '#4a4a36', topL: '#72725a', topD: '#20200e', leg: '#34302a', legD: '#18160e', shoe: '#2a2018', skin: '#d8b494', skinD: '#987454', hair: '#3a2a1e', eye: '#6a6a5a', hairStyle: 'short', rim: '#c8d0dc' },
  // „Der Kleine“: Vordens dritte Persoenlichkeit
  kleiner: Object.assign({}, LOOKS.vorden, { eye: '#8ac8ff', rim: '#bfe0ff', angry: false }),
  // der wahnsinnige Bloodsucker: Glatze, Klauen, schwarze Augen
  bloodsucker: { outfit: 'uniform', top: '#3a3e48', topL: '#5a5e6a', topD: '#16181e', leg: '#262a34', legD: '#101218', shoe: '#e8e8ea', skin: '#d8d4cc', skinD: '#8a8480', hair: '#d8d4cc', eye: '#000000', hairStyle: 'bald', claws: 1, clawCol: '#c8c4bc', angry: true, trim: '#707480', rim: '#ff3a4e' },
  erdnutzer: { outfit: 'uniform', top: '#5a4a2a', topL: '#8a7648', topD: '#2a200e', leg: '#3a3020', legD: '#1a140a', shoe: '#2a2014', skin: '#e0c0a0', skinD: '#a08060', hair: '#4a3a24', eye: '#c8a060', hairStyle: 'short', trim: '#c8a070', angry: true, rim: '#c8a070' },
  schlaeger: Object.assign({}, LOOKS.s3, { angry: true })
});

/* ------------------------------------------------------------ „Der Kleine“ als spielbare Figur */
KITS.metall = { // Metallspiesse (von Ian kopiert), aufgeladen ein durchschlagender Spiess
  combo: [{ dmg: 1.2, win: 0.12, act: 0.05, rec: 0.24, cost: 8, lunge: -20, proj: { sp: 470, max: 230, col: '#c8d8f0', kind: 'spike' } }],
  charged: { dmg: 3, win: 0.1, act: 0.05, rec: 0.4, cost: 20, lunge: -40, poise: 3, proj: { sp: 580, max: 300, col: '#e8eef8', kind: 'spike', pierce: true } }
};
CHARS.kleiner = { name: 'Der Kleine', look: 'kleiner', kit: 'metall', hp: 22, str: 12, agi: 12, range: 140 };

/* ------------------------------------------------------------ Szenen-Hintergruende */
SCENE_ART.rotplanet = function (g, W, H, u, t, glowField) {
  // ewige Nacht, zwei Monde, verfallene Menschenstadt
  g.fillStyle = lg(g, 0, 0, 0, H, [0, '#0a0610', 0.6, '#1c0e1c', 1, '#2a1018']); g.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { const x = (hash2(i, 3, 9) % 1000) / 1000 * W, y = (hash2(i, 4, 9) % 1000) / 1000 * H * 0.55; g.globalAlpha = 0.25 + 0.4 * Math.abs(Math.sin(t * 0.7 + i)); g.fillStyle = '#ffd8e0'; g.fillRect(x, y, u * 0.3, u * 0.3); }
  g.globalAlpha = 1;
  g.fillStyle = '#e8c8b8'; g.beginPath(); g.arc(W * 0.24, H * 0.13, u * 6, 0, TAU); g.fill();
  g.fillStyle = '#c86a5a'; g.beginPath(); g.arc(W * 0.72, H * 0.2, u * 3.4, 0, TAU); g.fill();
  g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35; g.drawImage(glowSprite('#ff8a7a'), W * 0.72 - u * 12, H * 0.2 - u * 12, u * 24, u * 24); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  // kaputte Hochhaeuser
  for (let i = 0; i < 11; i++) {
    const x = W * i / 10 - W * 0.04, bw = W * 0.09, bh = H * (0.18 + (hash2(i, 7, 1) % 100) / 380);
    g.fillStyle = i % 2 ? '#120a12' : '#170d15';
    g.beginPath(); g.moveTo(x, H * 0.72); g.lineTo(x, H * 0.72 - bh); g.lineTo(x + bw * 0.4, H * 0.72 - bh - u * 2); g.lineTo(x + bw * 0.55, H * 0.72 - bh + u * 3); g.lineTo(x + bw, H * 0.72 - bh + u); g.lineTo(x + bw, H * 0.72); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.5)'; for (let k = 0; k < 5; k++) g.fillRect(x + bw * 0.2, H * 0.72 - bh + u * 3 + k * u * 3.5, bw * 0.2, u * 1.6);
  }
  g.fillStyle = '#0a060a'; g.fillRect(0, H * 0.72, W, H);
  glowField('#ff6a7a', 8);
};
SCENE_ART.portal = function (g, W, H, u, t, glowField) {
  g.fillStyle = '#08040a'; g.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H * 0.42;
  for (let k = 0; k < 7; k++) {
    g.save(); g.translate(cx, cy); g.rotate(t * (0.4 + k * 0.12) * (k % 2 ? -1 : 1));
    g.strokeStyle = `rgba(255,${40 + k * 12},${50 + k * 6},${0.5 - k * 0.05})`; g.lineWidth = u * (2.4 - k * 0.2);
    g.beginPath(); g.ellipse(0, 0, u * (10 + k * 5), u * (16 + k * 7), 0, k * 0.7, k * 0.7 + 4.4); g.stroke();
    g.restore();
  }
  g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.6 + Math.sin(t * 3) * 0.15;
  g.drawImage(glowSprite('#ff2a40'), cx - u * 30, cy - u * 40, u * 60, u * 80);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  glowField('#ff4a5a', 14);
};

/* ------------------------------------------------------------ Arenen */
function crackedFloor(g, A, base, seed, n) {
  const rnd = mulberry(seed);
  g.fillStyle = base; g.fillRect(0, 0, A.w, A.h);
  for (let i = 0; i < 700; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.04)'; g.fillRect(rnd() * A.w, rnd() * A.h, 2, 2); }
  g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 1.2;
  for (let i = 0; i < n; i++) { let x = rnd() * A.w, y = rnd() * A.h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += rnd() * 30 - 15; y += rnd() * 30 - 15; g.lineTo(x, y); } g.stroke(); }
  return rnd;
}
function rubble(g, rnd, x, y, n, col) {
  for (let i = 0; i < n; i++) { const s = 3 + rnd() * 7; g.fillStyle = shade(col, rnd() * 0.3 - 0.2); g.beginPath(); g.moveTo(x + rnd() * 30 - 15, y + rnd() * 16 - 8); g.lineTo(x + rnd() * 30 - 15 + s, y + rnd() * 16 - 8); g.lineTo(x + rnd() * 30 - 15, y + rnd() * 16 - 8 + s); g.fill(); }
}
function wallBlock(g, b, top, side) {
  g.fillStyle = side; g.fillRect(b.x, b.y + 8, b.w, b.h - 8);
  g.fillStyle = top; g.fillRect(b.x, b.y, b.w, 10);
  g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 1; g.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
}
// Treppenhaus in der Ruinenstadt: oben die Treppe, darunter eine schmale Tuer
ARENA_ART.ruine = function (A) {
  const S = 2, c = mkCanvas(A.w * S, A.h * S), g = c.getContext('2d');
  g.scale(S, S);
  const rnd = crackedFloor(g, A, '#34303a', 21, 26);
  // Treppe
  for (let k = 0; k < 7; k++) { g.fillStyle = shade('#5a5462', -k * 0.05); g.fillRect(96, 40 + k * 20, 148, 18); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(96, 56 + k * 20, 148, 2); }
  g.fillStyle = '#1e1a22'; g.fillRect(84, 30, 12, 172); g.fillRect(244, 30, 12, 172);
  for (const b of A.blocks) wallBlock(g, b, '#6a6070', '#2a2430');
  for (let i = 0; i < 12; i++) rubble(g, rnd, rnd() * A.w, 260 + rnd() * (A.h - 280), 6, '#5a5260');
  // Autowrack
  g.fillStyle = '#2a1e1e'; g.fillRect(40, 420, 60, 30); g.fillStyle = '#3a2a2a'; g.fillRect(48, 410, 40, 14);
  g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, A.w - 3, A.h - 3);
  return c;
};
// Hangar des Militaerlagers: Beton, gelbe Linien, Kisten, Nest mit Eiern
ARENA_ART.hangar = function (A) {
  const S = 2, c = mkCanvas(A.w * S, A.h * S), g = c.getContext('2d');
  g.scale(S, S);
  const rnd = crackedFloor(g, A, '#46484e', 33, 14);
  g.strokeStyle = 'rgba(220,180,40,0.55)'; g.lineWidth = 4; g.setLineDash([16, 10]);
  g.beginPath(); g.moveTo(30, 60); g.lineTo(30, A.h - 30); g.moveTo(A.w - 30, 60); g.lineTo(A.w - 30, A.h - 30); g.stroke(); g.setLineDash([]);
  g.fillStyle = lg(g, 0, 0, 0, 44, [0, '#1e2026', 1, '#34363e']); g.fillRect(0, 0, A.w, 44);
  g.fillStyle = 'rgba(180,200,220,0.5)'; g.font = '800 10px Cinzel, serif'; g.textAlign = 'center'; g.fillText('HANGAR 3', A.w / 2, 28);
  for (const b of A.blocks) wallBlock(g, b, '#7a6a4a', '#4a3e2a');
  // Nest: Fasern und Schleim
  g.fillStyle = 'rgba(120,150,60,0.35)'; g.beginPath(); g.ellipse(A.w - 70, 90, 50, 22, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(160,190,90,0.4)'; g.lineWidth = 1; for (let i = 0; i < 20; i++) { g.beginPath(); g.moveTo(A.w - 70 + rnd() * 90 - 45, 90 + rnd() * 36 - 18); g.lineTo(A.w - 70 + rnd() * 90 - 45, 90 + rnd() * 36 - 18); g.stroke(); }
  g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, A.w - 3, A.h - 3);
  return c;
};
// Trainings-Dom: runde Arena, zerstoerte Lampen, Mech-Wracks am Rand
ARENA_ART.dom = function (A) {
  const S = 2, c = mkCanvas(A.w * S, A.h * S), g = c.getContext('2d');
  g.scale(S, S);
  const rnd = crackedFloor(g, A, '#2a2c34', 44, 10);
  g.strokeStyle = 'rgba(160,170,190,0.25)'; g.lineWidth = 3; g.beginPath(); g.ellipse(A.w / 2, A.h / 2 + 10, A.w * 0.42, A.h * 0.36, 0, 0, TAU); g.stroke();
  g.lineWidth = 1.5; g.beginPath(); g.arc(A.w / 2, A.h / 2 + 10, 40, 0, TAU); g.stroke();
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, x = A.w / 2 + Math.cos(a) * A.w * 0.46, y = A.h / 2 + 10 + Math.sin(a) * A.h * 0.42; g.fillStyle = '#16181e'; g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill(); g.fillStyle = 'rgba(200,220,255,0.35)'; for (let k = 0; k < 4; k++) g.fillRect(x + rnd() * 16 - 8, y + rnd() * 16 - 8, 2, 2); }
  for (const b of A.blocks || []) { // Mech-Wracks
    g.fillStyle = '#3a3e48'; g.fillRect(b.x, b.y + 6, b.w, b.h - 6); g.fillStyle = '#5a606c'; g.fillRect(b.x + 4, b.y, b.w - 8, 12);
    g.fillStyle = '#1a1c22'; g.fillRect(b.x + b.w * 0.3, b.y + 3, b.w * 0.4, 5);
  }
  g.strokeStyle = 'rgba(0,0,0,0.4)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, A.w - 3, A.h - 3);
  return c;
};

/* ------------------------------------------------------------ Bestien (eigene Gestaltung) */
function beastFlash(g, e, fn) { // weisses Aufblitzen bei Treffern
  if (e.flash <= 0) return;
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(1, e.flash * 10) * 0.6; g.fillStyle = '#ffffff'; fn(); g.restore();
}
function beastDown(g, e) {
  const k = e.state === 'down' ? Math.min(1, e.stateT * 1.5) : 0;
  if (k) { g.globalAlpha = Math.max(0.35, 1 - k * 0.5); g.scale(1, 1 - k * 0.35); }
  return k;
}
Object.assign(OBJ_ART, {
  rattaclaw(g, e) {
    const t = e.anim.t, run = e.anim.run, ph = e.anim.phase, w = e.state === 'wind' ? Math.min(1, e.stateT / e.atk.wind) : 0;
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(e.x, e.y + 1, 18, 5, 0, 0, TAU); g.fill();
    g.save(); g.translate(e.x, e.y); g.scale(e.face, 1);
    const dead = beastDown(g, e);
    const lean = -w * 0.25 + (e.state === 'active' ? 0.2 : 0);
    g.rotate(lean);
    // Schwanz
    g.strokeStyle = '#8a6a6a'; g.lineWidth = 2; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-14, -11); g.quadraticCurveTo(-26, -4 + Math.sin(t * 7) * 3, -34, -10 + Math.sin(t * 5) * 4); g.stroke();
    // Beine
    g.strokeStyle = '#2a1e1c'; g.lineWidth = 3;
    const legs = [[-10, 0], [-6, Math.PI], [8, Math.PI * 0.5], [11, Math.PI * 1.5]];
    for (const [lx, o] of legs) { const s = Math.sin(ph + o) * 5 * run; g.beginPath(); g.moveTo(lx, -9); g.lineTo(lx + s, -Math.max(0, Math.cos(ph + o)) * 3 * run); g.stroke(); }
    // Rumpf mit Stachelkamm
    g.fillStyle = lg(g, 0, -22, 0, -4, [0, '#6a5850', 1, '#2a1e1c']);
    g.beginPath(); g.ellipse(-1, -13, 16, 8.5, 0, 0, TAU); g.fill();
    g.fillStyle = '#1a1210'; for (let k = 0; k < 5; k++) { const x = -12 + k * 5; g.beginPath(); g.moveTo(x - 2, -19); g.lineTo(x + 1, -26 - (k % 2) * 2); g.lineTo(x + 3, -19); g.fill(); }
    // Kopf mit Schnauze
    g.fillStyle = '#5a4842'; g.beginPath(); g.ellipse(15, -17, 8, 6, -0.2, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(19, -20); g.lineTo(28, -15 + w * 2); g.lineTo(19, -12); g.fill();
    g.fillStyle = '#e8e0d0'; g.beginPath(); g.moveTo(22, -14); g.lineTo(23, -10); g.lineTo(24.5, -14); g.fill();
    g.fillStyle = '#6a4a4a'; g.beginPath(); g.ellipse(11, -23, 2.5, 4, -0.4, 0, TAU); g.fill();
    if (!dead) glowDot(g, 17, -19, 4, '#ff3a3a', 0.8);
    g.fillStyle = '#ff5a4a'; g.beginPath(); g.arc(17, -19, 1.2, 0, TAU); g.fill();
    // Krallen vorn
    g.strokeStyle = '#f0e8d8'; g.lineWidth = 1.2;
    const cy = e.state === 'wind' || e.state === 'active' ? -14 : -1;
    for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(11, cy); g.lineTo(17 + k, cy + 3 - k * 2); g.stroke(); }
    beastFlash(g, e, () => { g.beginPath(); g.ellipse(-1, -13, 16, 8.5, 0, 0, TAU); g.ellipse(15, -17, 8, 6, -0.2, 0, TAU); g.fill(); });
    g.restore();
    if (e.state === 'stagger') { g.fillStyle = '#8ad8ff'; for (let k = 0; k < 3; k++) { const a = G.t * 6 + k * TAU / 3; g.beginPath(); g.arc(e.x + Math.cos(a) * 10, e.y - 34 + Math.sin(a) * 3, 1.8, 0, TAU); g.fill(); } }
  },
  scordana(g, e) {
    const t = e.anim.t, run = e.anim.run, ph = e.anim.phase;
    const sting = e.state === 'wind' && e.atk && e.atk.type === 'beam' ? Math.min(1, e.stateT / e.atk.wind) : 0;
    const claw = e.state === 'wind' && e.atk && e.atk.type === 'swipe' ? Math.min(1, e.stateT / e.atk.wind) : 0;
    g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.ellipse(e.x, e.y + 2, 40, 10, 0, 0, TAU); g.fill();
    g.save(); g.translate(e.x, e.y); g.scale(e.face, 1);
    const dead = beastDown(g, e);
    // sechs Beine
    g.strokeStyle = '#1a1612'; g.lineWidth = 3; g.lineCap = 'round';
    for (let k = 0; k < 6; k++) { const bx = -30 + k * 8, o = k * 1.3, s = Math.sin(ph + o) * 5 * run; g.beginPath(); g.moveTo(bx, -14); g.quadraticCurveTo(bx - 8, -26, bx - 10 + s, -Math.max(0, Math.cos(ph + o)) * 3 * run); g.stroke(); }
    // Skorpion-Unterleib aus Segmenten
    for (let k = 0; k < 5; k++) { const x = -32 + k * 9; g.fillStyle = lg(g, 0, -26, 0, -6, [0, '#5a5a40', 1, '#22221a']); g.beginPath(); g.ellipse(x, -15, 9, 8, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 1; g.stroke(); }
    // Stachelschwanz: rollt sich ueber den Ruecken, zeigt beim Stich nach vorn
    g.strokeStyle = '#3a3a28'; g.lineWidth = 6;
    const tx = -8 + sting * 22, ty = -72 + sting * 16;
    g.beginPath(); g.moveTo(-36, -18); g.bezierCurveTo(-58, -40, -46, -76, tx - 12, ty); g.stroke();
    g.strokeStyle = '#5a5a40'; g.lineWidth = 3; g.stroke();
    g.fillStyle = sting ? '#b8ff6a' : '#d8d0a0'; g.beginPath(); g.moveTo(tx - 14, ty - 4); g.lineTo(tx + 4, ty + 6); g.lineTo(tx - 12, ty + 5); g.fill();
    if (sting) glowDot(g, tx - 4, ty + 3, 10, '#b8ff6a', 0.5 + sting * 0.4);
    // weicher Oberkoerper (menschenaehnlich)
    g.fillStyle = lg(g, 4, -50, 14, -14, [0, '#c89a86', 1, '#8a6454']);
    g.beginPath(); g.moveTo(2, -16); g.quadraticCurveTo(0, -40, 8, -50); g.lineTo(18, -48); g.quadraticCurveTo(18, -30, 14, -16); g.closePath(); g.fill();
    g.fillStyle = '#b48a78'; g.beginPath(); g.ellipse(14, -56, 6, 7, 0.2, 0, TAU); g.fill();
    if (!dead) glowDot(g, 17, -57, 5, '#ff4a3a', 0.8);
    // vier Scheren
    for (let k = 0; k < 4; k++) {
      const sx = 10 + (k % 2) * 4, sy = -44 + Math.floor(k / 2) * 10, a = -0.6 + k * 0.28 - claw * 0.9 + Math.sin(t * 2 + k) * 0.08;
      const ex = sx + Math.cos(a) * 16, ey = sy + Math.sin(a) * 16, fx = ex + Math.cos(a + 0.5) * 12, fy = ey + Math.sin(a + 0.5) * 12;
      g.strokeStyle = '#2e2e20'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.lineTo(fx, fy); g.stroke();
      g.fillStyle = '#4a4a30'; g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + Math.cos(a + 0.2) * 9, fy + Math.sin(a + 0.2) * 9); g.lineTo(fx + Math.cos(a + 1.0) * 7, fy + Math.sin(a + 1.0) * 7); g.fill();
    }
    beastFlash(g, e, () => { g.beginPath(); g.ellipse(-14, -15, 30, 9, 0, 0, TAU); g.ellipse(10, -34, 8, 18, 0, 0, TAU); g.fill(); });
    g.restore();
    if (e.state === 'stagger') { g.fillStyle = '#8ad8ff'; for (let k = 0; k < 3; k++) { const a = G.t * 6 + k * TAU / 3; g.beginPath(); g.arc(e.x + Math.cos(a) * 14, e.y - 76 + Math.sin(a) * 3, 2, 0, TAU); g.fill(); } }
  },
  ei(g, e) {
    const p = 0.5 + Math.sin(e.anim.t * 3 + e.id) * 0.5;
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(e.x, e.y + 1, 9, 3.5, 0, 0, TAU); g.fill();
    if (e.state === 'down') { g.fillStyle = 'rgba(160,200,90,0.6)'; g.beginPath(); g.ellipse(e.x, e.y, 12, 4, 0, 0, TAU); g.fill(); g.fillStyle = '#d8d8b0'; g.fillRect(e.x - 6, e.y - 3, 4, 3); g.fillRect(e.x + 3, e.y - 2, 3, 2); return; }
    g.fillStyle = lg(g, e.x - 6, e.y - 20, e.x + 6, e.y, [0, '#f0f0c8', 1, '#9aa868']); g.beginPath(); g.ellipse(e.x, e.y - 9, 7, 10, 0, 0, TAU); g.fill();
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.2 + p * 0.25; g.drawImage(glowSprite('#b8ff6a'), e.x - 12, e.y - 22, 24, 26); g.restore();
    if (e.flash > 0) { g.fillStyle = `rgba(255,255,255,${e.flash * 6})`; g.beginPath(); g.ellipse(e.x, e.y - 9, 7, 10, 0, 0, TAU); g.fill(); }
  }
});

/* ------------------------------------------------------------ Gegner-KI */
const RAT_ATK = {
  bite: { type: 'swipe', wind: 0.42, act: 0.08, rec: 0.45, reach: 34, arc: 0.9, dmg: 1, col: '#d0b0a0' },
  pounce: { type: 'lunge', wind: 0.55, act: 0.22, rec: 0.6, speed: 300, dmg: 1, shout: '!' }
};
// Rattaclaw (Basic-Bestie, Kap. 66): rudelweise, springt an; wartet im Dunkeln, bis sie Witterung aufnimmt
const ratAsleep = (e) => e.wakeT === undefined || G.t < e.wakeT;
const AI_RAT = {
  params: (e) => (ratAsleep(e) ? { range: 9999, speed: 0, cd: 1 } : { range: 32, speed: 125, cd: 1.0 }),
  choose: (e, d) => (ratAsleep(e) ? null : d > 70 && d < 150 && Math.random() < 0.5 ? RAT_ATK.pounce : d < 50 ? RAT_ATK.bite : null),
  onTick: (e) => { if (!e.awake && !ratAsleep(e)) { e.awake = true; floatText(e.x, e.y - 40, 'KRIII', '#ff8a7a'); } },
  onHurt: (e) => { e.wakeT = 0; }
};
const SCOR_ATK = {
  pincer: { type: 'swipe', wind: 0.55, act: 0.1, rec: 0.35, reach: 60, arc: 1.2, dmg: 2, col: '#c8c890', chain: { type: 'swipe', wind: 0.3, act: 0.1, rec: 0.6, reach: 60, arc: 1.2, dmg: 2, col: '#c8c890' } },
  sting: { type: 'beam', wind: 0.5, act: 0.1, rec: 0.8, len: 160, width: 20, dmg: 4, col: '#b8ff6a', shout: 'STACHEL!' }
};
// Panzer dreht sich langsam zum Ziel: vorn blockt das Exoskelett, hinten ist der Oberkoerper weich
function turnShell(e, rate, dt) {
  if (e.state === 'stagger' || e.state === 'down') return;
  const t = e.target || G.player, want = Math.atan2(t.y - e.y, t.x - e.x);
  if (e.hardDir === undefined) e.hardDir = want;
  const d = angDiff(e.hardDir, want);
  e.hardDir += clamp(d, -rate * dt, rate * dt);
}
// Scordana (Mittelstufe, Kap. 74–75)
const AI_SCORDANA = {
  harden: true,
  params: (e) => ({ range: 58, speed: 58, cd: e.hp < e.maxHp / 2 ? 0.75 : 1.1 }),
  choose: (e, d) => (d < 74 ? SCOR_ATK.pincer : d < 170 && Math.random() < 0.6 ? SCOR_ATK.sting : null),
  onTick: (e, dt) => turnShell(e, 1.2, dt)
};
const AI_EGG = { params: () => ({ range: 9999, speed: 0, cd: 9 }), choose: () => null };
const BS_ATK = {
  claw: { type: 'swipe', wind: 0.38, act: 0.08, rec: 0.3, reach: 40, arc: 1.1, dmg: 2, col: '#ff4a5a', chain: { type: 'swipe', wind: 0.24, act: 0.08, rec: 0.5, reach: 40, arc: 1.1, dmg: 2, col: '#ff4a5a' } },
  leap: { type: 'lunge', wind: 0.5, act: 0.24, rec: 0.55, speed: 360, dmg: 2, shout: '!' },
  back: { type: 'beam', wind: 0.55, act: 0.12, rec: 0.5, len: 220, width: 14, dmg: 2, col: '#c8d8f0', shout: 'Spieße!' }
};
// der Bloodsucker (Kap. 80–81): schnell, regeneriert, wirft die Metallspiesse zurueck
const AI_BLOODSUCKER = {
  params: () => ({ range: 36, speed: 150, cd: 0.7 }),
  choose: (e, d) => (d > 110 && G.t - (e.backT || 0) > 5 ? ((e.backT = G.t), BS_ATK.back) : d > 80 ? BS_ATK.leap : d < 56 ? BS_ATK.claw : null),
  onTick: (e, dt) => { e.hp = Math.min(e.maxHp, e.hp + 0.45 * dt); }
};
const VORDEN_ATK = {
  balls: { type: 'beam', wind: 0.55, act: 0.12, rec: 0.55, len: 210, width: 18, dmg: 1, col: '#c8d0dc', shout: 'Metall' },
  dagger: { type: 'swipe', wind: 0.4, act: 0.08, rec: 0.45, reach: 38, arc: 1.0, dmg: 1, col: '#c8a070' }
};
// Vorden im Uebungskampf (Kap. 93): Metallkugeln (Ians kopierte Faehigkeit), Erd-Dolch im Nahkampf
const AI_VORDEN = { params: () => ({ range: 100, speed: 95, cd: 1.0 }), choose: (e, d) => (d < 54 ? VORDEN_ATK.dagger : d < 230 ? VORDEN_ATK.balls : null) };
const ERDE_ATK = {
  spear: { type: 'beam', wind: 0.6, act: 0.12, rec: 0.6, len: 200, width: 18, dmg: 2, col: '#c8a070', shout: 'Erdspeer' },
  ram: { type: 'lunge', wind: 0.7, act: 0.26, rec: 0.8, speed: 260, dmg: 2, shout: '!' },
  hit: { type: 'swipe', wind: 0.5, act: 0.1, rec: 0.5, reach: 42, arc: 1.0, dmg: 2, col: '#c8a070' }
};
// Stufe-4-Erdnutzer in Bestienruestung (Kap. 106–107): Steinwand vorn; nur Hammer Strike bricht sie
const AI_ERDE = {
  harden: true,
  params: () => ({ range: 70, speed: 70, cd: 1.2 }),
  choose: (e, d) => (d < 56 ? ERDE_ATK.hit : d < 110 ? ERDE_ATK.ram : ERDE_ATK.spear),
  onTick: (e, dt) => turnShell(e, 1.4, dt)
};

/* ------------------------------------------------------------ neue Faehigkeiten */
// Blood Spray (Kap. 66): Faecher aus Blut wie eine Schrotflinte, kostet 5 HP
function sprayFan(p, n, spread, dmg) {
  const f = nearestFoe(p, 200), [mx, my] = readMove();
  const a = f ? Math.atan2(f.y - p.y, f.x - p.x) : (mx || my) ? Math.atan2(my, mx) : (p.face > 0 ? 0 : Math.PI);
  p.face = Math.cos(a) >= 0 ? 1 : -1; p.anim.cast = 1; p.anim.aim = p.face > 0 ? a : Math.PI - a;
  const k = SAVE.quinn.gear.hands === 'standard' ? 1.05 : 1;
  for (let i = 0; i < n; i++) {
    const b = a + (n > 1 ? (i / (n - 1) - 0.5) * spread : 0);
    G.proj.push({ x: p.x + Math.cos(b) * 10, y: p.y + Math.sin(b) * 10, a: b, sp: 320, dist: 0, max: 95, dmg: dmg * k * (p.str * sunFactor(p) / 10), hit: new Set(), col: '#ff3a4e', kind: 'blood', kb: 60 });
  }
  sfx('splat', 0, 0.03); sfx('whip', 0, 0.05);
}
function castBloodSpray(p) {
  if (p.char !== 'quinn' || !SAVE.quinn.skills.includes('bloodspray') || p.state === 'down' || p.state === 'hurt') return;
  if ((p.sprayCd || 0) > G.t) return;
  if (!G.opt.vr && p.hp <= 5) { floatText(p.x, p.y - 72, 'Zu wenig HP', '#ff8a8a'); return; }
  if (!G.opt.vr) { p.hp -= 5; floatText(p.x, p.y - 72, '-5 HP', '#ff5a6a'); }
  p.sprayCd = G.t + 0.9; G.stats.swipes = (G.stats.swipes || 0) + 1;
  sprayFan(p, 5, 1.0, 1.6);
}
// Hammer Spray (Kap. 104): Hammer Strike plus Blutfaecher; frisst Ausdauer und etwas Blut
function hammerSpray(p) {
  if (p.stam < 12 || (!G.opt.vr && p.hp <= 3)) return;
  spendStam(p, 12, 0.4);
  if (!G.opt.vr) p.hp -= 2;
  sprayFan(p, 3, 0.6, 1.4);
  floatText(p.x, p.y - 86, 'HAMMER SPRAY', '#ff8a9a');
}
// Schattenkontrolle (Kap. 89–93): der Schatten packt die Beine des naechsten Gegners
function castShadow(p) {
  if (p.char !== 'quinn' || !SAVE.quinn.skills.includes('schatten') || p.state === 'down') return;
  if (G.opt.vr) { floatText(p.x, p.y - 80, 'Im Spiel nicht verfügbar', '#c8a0ff'); return; }
  if (!p.maxMc || p.mc < 25) { floatText(p.x, p.y - 80, 'Zu wenig MC', '#c8a0ff'); return; }
  const f = nearestFoe(p, 180);
  if (!f) { floatText(p.x, p.y - 80, 'Kein Ziel', '#c8a0ff'); return; }
  p.mc -= 25; f.rootT = 1.8; p.anim.cast = 1;
  G.stats.shadow = (G.stats.shadow || 0) + 1;
  for (let k = 0; k < 10; k++) G.fx.push({ k: 'spark', x: f.x + rand(-14, 14), y: f.y + rand(-6, 2), vx: 0, vy: 0, life: 0.4, t: 0, col: '#8a4aff', size: 5 });
  floatText(f.x, f.y - 80, 'SCHATTEN', '#c8a0ff'); sfx('shadowstep');
}
function learn(...ids) { const Q = SAVE.quinn; for (const s of ids) if (!Q.skills.includes(s)) Q.skills.push(s); writeSave(); }

/* ------------------------------------------------------------ Kampf-Hilfen */
function ratPack(n, spots, t0, dt) {
  return Array.from({ length: n }, (_, i) => ({ id: 'rat' + i, draw: 'rattaclaw', name: 'Rattaclaw', hp: 3, poise: 2, r: 13, at: spots[i % spots.length].map((v, j) => v + (j ? (i >> 2) * 12 : 0)), ai: AI_RAT, expRate: 1, expKill: 14,
    info: { name: 'Rattaclaw', race: 'Bestie · Basic-Stufe', ability: 'Rudeljäger, scharfe Krallen', blood: 'giftig – nicht trinkbar' } }));
}
function wakeTick(G, maxAwake) { // Rudel: hoechstens maxAwake greifen gleichzeitig an, die naechste folgt mit kurzem Abstand
  const rats = G.ents.filter((e) => e.team === 1 && e.ai === AI_RAT);
  const busy = rats.filter((e) => e.state !== 'down' && !ratAsleep(e)).length;
  const next = rats.find((e) => e.state !== 'down' && e.wakeT === undefined);
  if (next && busy < maxAwake && G.t - (G.lastWake || -9) > 1.2) { next.wakeT = G.t; G.lastWake = G.t; }
}
function lowHpStart(frac) {
  return (G) => { if (G.lowSet) return; G.lowSet = true; const p = G.player; p.hp = Math.max(1, Math.ceil(p.maxHp * frac)); };
}

/* ------------------------------------------------------------ Missionen: auf dem roten Planeten */
Object.assign(MISSIONS, {
  portalsturz: {
    id: 'portalsturz', title: 'Das rote Portal', src: 'Kapitel 65, 68–69',
    scene: [
      { bg: 'nacht', portrait: 'peter' },
      { narr: 'Tag der ersten Portalmission. In der Trainingshalle schimmern die Portale. Vor einem roten fehlt die Wache – der Wachwechsel ist ausgefallen.' },
      { narr: 'Peter steht dicht hinter Quinn und Vorden. Seine Hände zittern.' },
      { bg: 'portal', portrait: null },
      { narr: 'Ein Stoß in den Rücken. Quinn stolpert – und das rote Licht verschluckt ihn.' },
      { portrait: 'vorden' },
      { who: 'Vorden', text: 'Quinn! … Verdammt.' },
      { narr: 'Ohne nachzudenken springt Vorden hinterher.' },
      { bg: 'rotplanet', portrait: null },
      { narr: 'Dunkelheit. Zwei Monde hängen über einer verfallenen Stadt, die einmal Menschen gehört hat. Von Vorden keine Spur.' },
      { bg: 'system' },
      { sys: { head: 'WARNUNG', lines: ['Unbekannter Planet.', 'Rote Portale sind unerforscht.'], quests: ['Überlebe', 'Finde einen Weg zurück'] } }
    ],
    after: () => { stepDone('portalsturz'); },
    next: 'rattaclaw'
  },
  rattaclaw: {
    id: 'rattaclaw', title: 'Die Treppe halten', src: 'Kapitel 66–67', type: 'gefecht',
    scene: [
      { bg: 'rotplanet', portrait: null },
      { narr: 'Zwischen den Ruinen bewegt sich etwas: eine Bestie, groß wie ein Hund, mit Rattenschnauze und langen Krallen. Quinn erledigt sie knapp – und die Handschuhe tragen die ersten Kratzer.' },
      { bg: 'system' },
      { sys: { head: 'NEUE FÄHIGKEIT', lines: ['Blood Spray', 'Ein Fächer aus Blut, wie eine Schrotflinte. Kostet 5 HP.'], kv: [['Hinweis', 'Rattaclaw-Blut ist giftig']] } },
      { call: () => { learn('bloodspray'); SAVE.quinn.bank = Math.max(SAVE.quinn.bank, 60); writeSave(); } },
      { bg: 'rotplanet' },
      { narr: 'Der Kampflärm lockt das Rudel an. Zehn Rattaclaws jagen Quinn in ein halb eingestürztes Haus. Oben auf der Treppe ist der einzige Ort, an dem sie nur von vorn kommen können.' }
    ],
    fight: {
      arena: { art: 'ruine', w: 340, h: 600, night: true, blocks: [{ x: 0, y: 206, w: 132, h: 26, invisible: true }, { x: 208, y: 206, w: 132, h: 26, invisible: true }] },
      playerAt: [170, 150], inspect: true, noFoeBar: true,
      foes: ratPack(10, [[60, 470], [280, 480], [170, 560], [100, 360], [250, 350]], 0.6, 1.8),
      onTick: (G) => { wakeTick(G, 2); const n = G.ents.filter((e) => e.team === 1 && e.state !== 'down').length; G.hint = { text: G.t < 5 ? 'Halte die Treppe. <b>BLOOD SPRAY</b> trifft mehrere' : `Rattaclaws: ${n}` }; }
    },
    won: [
      { bg: 'system' },
      { sys: { head: 'SYSTEM', lines: ['Alle zehn Rattaclaws besiegt.', 'Blood Swipe erreicht Stufe 2.', 'Inventar freigeschaltet: 10 Basis-Kristalle (je etwa 10 Credits wert).'] } },
      { bg: 'rotplanet' },
      { narr: 'Vom Dach aus sieht Quinn ein Lagerhaus des Militärs – mit dem Wappen seiner Akademie.' }
    ],
    reward: { exp: 40 },
    after: () => { stepDone('rattaclaw'); },
    next: 'lagerhaus'
  },
  lagerhaus: {
    id: 'lagerhaus', title: 'Das Lagerhaus', src: 'Kapitel 69–73',
    scene: [
      { bg: 'rotplanet', portrait: 'vorden' },
      { narr: 'Vorden ist in einer anderen Lagerhalle gelandet. In seinem Kopf gibt es einen dunklen Raum mit einem Stuhl im Licht – wer darauf sitzt, steuert den Körper.' },
      { portrait: 'kleiner' },
      { narr: 'Neben Raten lebt dort noch jemand: „der Kleine“, eine dritte, ängstliche Persönlichkeit. Seine früheren Freunde sind alle gestorben.' },
      { portrait: 'ian' },
      { narr: 'Vorden trifft Ian, einen Traveller, der hier festsitzt. Auf dem Planeten dauert eine Nacht ein halbes Jahr – und die Nacht hat gerade erst begonnen.' },
      { portrait: 'raten' },
      { who: 'Raten', text: 'Der hat einen seltenen Kristall dabei. Lass ihn uns einfach nehmen.' },
      { portrait: 'vorden' },
      { who: 'Vorden', text: 'Nein. Wir brauchen ihn, um hier rauszukommen.' },
      { bg: 'rotplanet', portrait: 'quinn' },
      { narr: 'Quinn kriecht ins Militärlager. Fast alles ist zerstört – bis auf einen gesicherten Container mit Zahlenschloss.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'INSPECT · STUFE 2', lines: ['Berührung verrät mehr.', 'Der Code des Containers wird sichtbar.'] } },
      { bg: 'rotplanet', portrait: 'quinn' },
      { narr: 'Der Container ist voller Fähigkeits- und Skillbücher. Lernen kann Quinn sie nicht – aber das System verwandelt sie in Erfahrung.' }
    ],
    won: [
      { bg: 'system' },
      { sys: { head: 'SYSTEM', lines: ['Nicht lernbare Bücher wurden in EP umgewandelt.'], kv: [['EP', '+800']] } },
      { sys: { head: 'FUND', lines: ['Fähigkeitsbuch Stufe 6: Schatten-Element', 'Mit dem System kompatibel!', 'Ins Inventar gelegt – noch nicht gelernt.'] } },
      { bg: 'rotplanet', portrait: 'quinn' },
      { narr: 'Zwischen all dem Glück sitzt ein Stachel: Peter. Quinn weiß jetzt, dass der Stoß kein Versehen war.' }
    ],
    reward: { exp: 800 },
    after: () => { stepDone('lagerhaus'); SAVE.flags.schattenbuch = true; },
    next: 'scordana'
  },
  scordana: {
    id: 'scordana', title: 'Scordana', src: 'Kapitel 74–75', type: 'boss',
    scene: [
      { bg: 'rotplanet', portrait: 'quinn' },
      { narr: 'Der Blutdurst meldet sich. In der Blutbank sind nur noch wenige Reserven. Im Hangar nebenan hat eine größere Bestie ein Nest gebaut.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'INSPECT', kv: [['Name', 'Scordana'], ['Stufe', 'Mittelstufe'], ['Körper', 'Skorpion-Unterleib, vier Scheren'], ['Nest', 'drei Eier']] } },
      { sys: { head: 'TAKTIK', lines: ['Der Panzer vorn blockt Schläge und Blood Swipe.', 'Der Oberkörper ist weich: Flash Step hinter sie, dann Hammer Strike.', 'Hammer Strike bringt sie auch von vorn ins Taumeln.', 'Achtung vor dem Stachel!'] } }
    ],
    fight: {
      arena: { art: 'hangar', w: 360, h: 560, night: true, blocks: [{ x: 30, y: 250, w: 50, h: 40, invisible: true }, { x: 280, y: 330, w: 50, h: 40, invisible: true }] },
      playerAt: [180, 470], inspect: true,
      foes: [
        { id: 'scordana', draw: 'scordana', name: 'Scordana', hp: 48, poise: 6, r: 24, at: [180, 220], ai: AI_SCORDANA, expRate: 2, expKill: 60, info: { name: 'Scordana', race: 'Bestie · Mittelstufe', ability: 'Exoskelett, Giftstachel', blood: 'unbekannt' } },
        { id: 'ei1', draw: 'ei', name: 'Ei', hp: 3, poise: 99, r: 9, fixed: true, at: [270, 90], ai: AI_EGG, expKill: 15, info: { name: 'Scordana-Ei', race: 'Bestie', ability: '—', blood: '—' } },
        { id: 'ei2', draw: 'ei', name: 'Ei', hp: 3, poise: 99, r: 9, fixed: true, at: [292, 100], ai: AI_EGG, expKill: 15, info: { name: 'Scordana-Ei', race: 'Bestie', ability: '—', blood: '—' } },
        { id: 'ei3', draw: 'ei', name: 'Ei', hp: 3, poise: 99, r: 9, fixed: true, at: [314, 86], ai: AI_EGG, expKill: 15, info: { name: 'Scordana-Ei', race: 'Bestie', ability: '—', blood: '—' } }
      ],
      onTick: (G) => { const s = G.foe; G.hint = s.state === 'down' ? { text: 'Die Eier (oben rechts)' } : G.t < 6 ? { text: 'Von hinten angreifen · <b>FLASH STEP</b> + <b>HAMMER</b>' } : null; }
    },
    won: [
      { bg: 'rotplanet', portrait: 'quinn' },
      { narr: 'Scordana bricht zusammen. Quinn zertritt die Eier – auch sie zählen als Kills.' },
      { narr: 'Dann knackt es an seinen Händen: Die Black Horned Gauntlets sind zerbrochen.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'SYSTEM', lines: ['Ausrüstung zerstört: Black Horned Gauntlets.', 'Ein Stufenaufstieg heilt nicht.', 'Blutdurst: −1 HP pro Stunde.'] } }
    ],
    reward: { exp: 60 },
    after: () => { stepDone('scordana'); SAVE.quinn.gear.hands = null; },
    next: 'dom'
  },
  dom: {
    id: 'dom', title: 'Der Trainings-Dom', src: 'Kapitel 76–77', type: 'gefecht',
    scene: [
      { bg: 'rotplanet', portrait: 'quinn' },
      { narr: 'Quinn schleicht durch die Ruinenstadt. In einer unzerstörbaren Kuppel stehen ausgeschlachtete Mechs – vielleicht ist dort das Portal.' },
      { narr: 'Mit einem geworfenen Stück Metall lenkt er ein Rudel ab, Inspect knackt den Türcode. Doch vor der Tür warten noch mehr Rattaclaws – und er ist am Ende seiner Kräfte.' },
      { call: () => { SAVE.quinn.bank = 0; writeSave(); } },
      { bg: 'system', portrait: null },
      { sys: { head: 'ZUSTAND', lines: ['Blutbank leer.', 'Der Hunger frisst die letzten HP.'] } }
    ],
    fight: {
      arena: { art: 'dom', w: 360, h: 560, night: true, blocks: [{ x: 40, y: 150, w: 56, h: 36, invisible: true }, { x: 264, y: 400, w: 56, h: 36, invisible: true }] },
      playerAt: [180, 460], inspect: true, noFoeBar: true,
      foes: ratPack(5, [[80, 90], [280, 100], [180, 70]], 0.4, 1.1),
      onTick: (G) => { wakeTick(G, 2); lowHpStart(0.4)(G); G.hint = G.t < 4 ? { text: 'Wenig HP · weich aus und kontere' } : null; }
    },
    won: [
      { bg: 'rotplanet', portrait: 'quinn' },
      { narr: 'Drinnen: eine leere Arena. Kein Portal.' },
      { narr: 'Quinns Beine geben nach. Der Hunger hat seine HP auf null gebracht.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'WARNUNG', lines: ['HP 0', 'Verwandlung beginnt …'] } }
    ],
    reward: { exp: 30 },
    after: () => { stepDone('dom'); },
    next: 'bloodsucker'
  },
  bloodsucker: {
    id: 'bloodsucker', title: 'Der Bloodsucker', src: 'Kapitel 78–81', type: 'boss',
    scene: [
      { bg: 'rotplanet', portrait: 'ian' },
      { narr: 'Einäugige Schneckenbestien greifen das Bibliotheksversteck an. Ian zeigt seine Fähigkeit: Er zieht Metall an und stößt es ab – erst ein Schild aus Metallkugeln, dann eine Explosion nach außen.' },
      { portrait: 'vorden' },
      { narr: 'Später finden Vorden und Ian tote Rattaclaws vor dem Dom. Gemeinsam biegen sie die Tür auf. Drinnen sind alle Lichter zerstört.' },
      { bg: 'system', portrait: null },
      { sys: { head: '???', kv: [['Rasse', '(Wahnsinniger) Bloodsucker'], ['Werte', 'verdoppelt'], ['HP', 'halbiert'], ['Verstand', 'keiner']] } },
      { bg: 'nacht', portrait: 'bloodsucker' },
      { narr: 'Ein Wesen ohne Haare, mit Klauen und schwarzen Augen stürmt schreiend aus der Dunkelheit. Ian ist sofort gelähmt.' },
      { portrait: 'kleiner' },
      { narr: 'Vorden zittert – und „der Kleine“ setzt sich auf den Stuhl. Er kämpft mit Ians Metallspießen.' }
    ],
    fight: {
      arena: { art: 'dom', w: 360, h: 560, night: true, blocks: [{ x: 40, y: 150, w: 56, h: 36, invisible: true }, { x: 264, y: 400, w: 56, h: 36, invisible: true }] },
      playerAt: [180, 420], party: ['kleiner'], inspect: false,
      npcs: [{ id: 'ian', at: [110, 470], pose: 'cower', watch: 'foe' }],
      foes: [{ id: 'bloodsucker', name: 'Bloodsucker', hp: 42, poise: 5, at: [180, 200], ai: AI_BLOODSUCKER, expRate: 0, info: { name: '???', race: 'Bloodsucker', ability: 'Regeneration', blood: '—' } }],
      expBonus: () => 20,
      onTick: (G) => {
        const b = G.foe;
        G.hint = G.t < 5 ? { text: 'Du spielst den Kleinen · <b>ANGRIFF</b> wirft Metallspieße' } : b.hp < b.maxHp * 0.6 ? { text: 'Etwas an der Uniform kommt dir bekannt vor …' } : null;
        if (b.hp <= b.maxHp * 0.35 && G.state === 'play') { G.state = 'won'; G.tele.length = 0; b.vx = 0; b.vy = 0; banner('ER HÄLT INNE'); later(1.4, () => G.opt.onWin(G)); }
      }
    },
    won: [
      { bg: 'nacht', portrait: 'kleiner' },
      { narr: 'Der Kleine erkennt die Uniform. Das ist Quinn. Er weint – und stellt sich zwischen den Bloodsucker und Ian, um den tödlichen Schlag zu verhindern.' },
      { portrait: 'bloodsucker' },
      { narr: 'Doch das Wesen ist schneller. Es verletzt Ian schwer und schleift ihn in die Dunkelheit.' }
    ],
    after: () => { stepDone('bloodsucker'); },
    next: 'evolution'
  },
  evolution: {
    id: 'evolution', title: 'Evolution', src: 'Kapitel 82–88',
    scene: [
      { bg: 'kantine', portrait: 'erin' },
      { narr: 'An der Akademie suchen Layla und Erin nach Peter. Erin nagelt Earl mit Eisspeeren an die Stärkemaschine und friert seine Bande ein.' },
      { portrait: 'peter' },
      { narr: 'Ein Mitläufer verrät alles: Peter sollte eigentlich Vorden ins Portal stoßen. Peter bricht zusammen – er habe sich nie wehren können.' },
      { portrait: 'layla' },
      { who: 'Layla', text: 'Eine Wahl hat man immer, Peter.' },
      { portrait: 'del' },
      { narr: 'Krisensitzung: Der Planet heißt Pioletic, die erste Siedlung der Menschen dort ging in der langen Nacht an starken Bestien zugrunde. Ein Rettungsteam wird geschickt – Fay, Leo, Del und Hayley. Vorrang hat Vorden. Quinn nicht.' },
      { bg: 'rotplanet', portrait: 'vorden' },
      { narr: 'Auf Pioletic zieht sich der Kleine weinend zurück. Vorden übernimmt wieder und folgt der Blutspur.' },
      { portrait: 'quinnvamp' },
      { narr: 'Am Ende der Spur: Quinn, mit roten Augen. Er verletzt Vorden an der Brust und fleht um Blut. Vorden verriegelt die Tür von außen.' },
      { bg: 'system', portrait: null },
      { narr: 'Fünfzehn Minuten Schmerz.' },
      { sys: { head: 'EVOLUTION', lines: ['Rasse: Vampir'], kv: [['Stärke / Agilität / Ausdauer', 'mindestens 15'], ['HP', 'stark erhöht'], ['Neu', 'Charme, Blutfamilien-Bonus'], ['Skills', 'Blutritual (0/2), Daze']] } },
      { sys: { head: 'SYSTEM · STUFE 2', lines: ['Eine Aufzeichnung mit der Stimme des blonden Mannes meldet sich. Eine KI hilft ab jetzt.', 'Andere Vampire leben versteckt unter den Menschen.', 'Werde stärker. Bau dir eine eigene Streitmacht.'] } },
      { call: () => { const Q = SAVE.quinn; Q.race = 'Vampir'; for (const k of ['str', 'agi', 'sta']) Q.stats[k] = Math.max(15, Q.stats[k]); learn('daze'); } },
      { bg: 'rotplanet', portrait: 'quinnvamp' },
      { narr: 'Durch die Tür erzählt Quinn Vorden fast alles. Vorden hat keine Angst – nur eine Sorge: Regierung, Militär und Familien würden Quinn benutzen wollen, wenn sie davon wüssten.' },
      { narr: 'Und das Schattenbuch? Inspect verrät: Nur wer Vampirblut in sich trägt, kann es lernen.' }
    ],
    after: () => { stepDone('evolution'); },
    next: 'schatten'
  },
  schatten: {
    id: 'schatten', title: 'Schatten', src: 'Kapitel 89–93', type: 'duell',
    scene: [
      { bg: 'rotplanet', portrait: 'vorden' },
      { narr: 'Vorden erklärt, was die Stufen wirklich messen: wie viele Mutantenzellen jemand aktivieren kann – nicht, wie stark er ist. Die Uhren zeigen das heimlich an.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'SYSTEM', lines: ['Fähigkeitsbuch gelernt: Schatten, Stufe 6.'], kv: [['MC', '100 / 100'], ['Neu', 'Schattenkontrolle Lv. 1'], ['Neu', 'Dimensionslager'], ['Shop', 'fertigt Gegenstände aus Kristallen']] } },
      { sys: { head: 'SCHATTENMANTEL', lines: ['Für 10 Punkte gekauft: Tarnung im Dunkeln.'] } },
      { call: () => learn('schatten', 'lager', 'mantel') },
      { bg: 'rotplanet', portrait: 'vorden' },
      { who: 'Vorden', text: 'Zeig mal, was der Schatten kann. Ich halte mit Ians Metallkugeln dagegen.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'TUTORIAL', lines: ['SCHATTEN packt die Beine des nächsten Gegners (25 MC).', 'Wer festgehalten wird, kann sich nicht bewegen – nur noch zuschlagen, was in Reichweite ist.'] } }
    ],
    fight: {
      arena: { art: 'dom', w: 360, h: 560, night: true, blocks: [{ x: 40, y: 150, w: 56, h: 36, invisible: true }, { x: 264, y: 400, w: 56, h: 36, invisible: true }] },
      playerAt: [180, 440], inspect: true, noDeath: true,
      foes: [{ id: 'vorden', name: 'Vorden', hp: 30, poise: 4, at: [180, 220], ai: AI_VORDEN, expRate: 1, info: { name: 'Vorden Blade', race: 'Mensch', ability: 'Kopieren (gerade: Metall)', blood: 'B' } }],
      onTick: (G) => { G.hint = G.t < 6 ? { text: '<b>SCHATTEN</b> hält Vorden fest, dann rein!' } : null; }
    },
    won: [
      { bg: 'rotplanet', portrait: 'vorden' },
      { narr: 'Die Schattenwand bremst die Kugeln nur. Stärkere Treffer kosten mehr MC, bei null verschwindet der Schatten. Und Quinn kann ihn immer nur für eine Sache nutzen – Angriff oder Verteidigung.' },
      { who: 'Vorden', text: 'Das sind ja drei Fähigkeiten in einer.' },
      { portrait: 'quinnvamp' },
      { narr: 'Vorsichtig fragt Quinn, ob Vorden sich vorstellen könnte, auch so zu werden. Vorden lehnt ab: tagsüber schwach, die eigene Fähigkeit weg. Die KI bestätigt es.' }
    ],
    reward: { exp: 40 },
    after: () => { stepDone('schatten'); },
    next: 'rettung'
  },
  rettung: {
    id: 'rettung', title: 'Das Rettungsteam', src: 'Kapitel 94–99',
    scene: [
      { bg: 'rotplanet', portrait: 'leo' },
      { narr: 'Das Rettungsteam landet: Del trägt einen tragbaren Teleporter, Hayley eine schwere Bestienrüstung und ein riesiges Schwert. Leo sieht Auren durch Wände – Bestien rot, Menschen gelb.' },
      { portrait: 'hayley' },
      { narr: 'An Ians Leiche findet Hayley zwei Bissmale – wie bei den toten Schülern an der Akademie. Ian trug eine Hundemarke: Truedream, eine der vier großen Familien.' },
      { portrait: 'vorden' },
      { who: 'Vorden', text: 'Versteck den Schatten bis zum Turnier. Und such dir jemanden, der deine Uhr umbauen kann.' },
      { portrait: 'hayley' },
      { narr: 'Hayley merkt, dass Quinn sich verändert hat. Normales Essen stößt sein Körper ab, ihre Heilkraft wirkt trotzdem. Leo trägt Ians Leiche – und Quinn zapft heimlich ihr Blut für die Blutbank ab.' },
      { call: () => { if (SAVE.quinn.skills.includes('bloodbank')) SAVE.quinn.bank = 90; writeSave(); } },
      { bg: 'portal', portrait: null },
      { narr: 'Durch das Portal zurück in die Trainingshalle der Akademie.' },
      { bg: 'zimmer', portrait: 'vorden' },
      { narr: 'Am Abend wirft Vorden Peter aus dem Zimmer. Quinn sagt kein Wort. Peter schläft weinend im Flur.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'SYSTEM', kv: [['Blutbank', '90 / 100 ml']], quests: ['Zurück an der Akademie'] } }
    ],
    after: () => { stepDone('rettung'); SAVE.day.night = true; writeSave(); },
    next: 'akademie'
  },

  /* ------------------------------------------------------------ zurück an der Akademie (Kap. 99–110) */
  kiefer: {
    id: 'kiefer', title: 'Nicht für dich', src: 'Kapitel 99–100', type: 'duell',
    scene: [
      { bg: 'kantine', portrait: 'peter' },
      { narr: 'Am Morgen schlägt ein Stufe-2-Schüler auf Peter ein. Die anderen schauen weg.' },
      { portrait: 'quinnvamp' },
      { narr: 'Quinn geht dazwischen. Ein einziger, aufgeladener Schlag soll reichen.' }
    ],
    fight: {
      arena: { art: 'kantine', w: 340, h: 520 }, playerAt: [170, 400], inspect: true,
      foes: [{ id: 'schlaeger', look: 'schlaeger', name: 'Stufe-2-Schüler', hp: 6, poise: 3, at: [170, 250], ai: AI_THUG, expRate: 0, info: { name: 'Stufe-2-Schüler', race: 'Mensch', ability: 'Stufe 2', blood: 'A' } }],
      expBonus: () => 0,
      onTick: (G) => { G.hint = G.t < 6 ? { text: '<b>ANGRIFF</b> halten: aufgeladener Schlag' } : null; }
    },
    won: [
      { bg: 'kantine', portrait: 'quinnvamp' },
      { narr: 'Der Kiefer des Schülers ist gebrochen. Peter will sich bedanken – doch Quinn macht klar, dass er es nicht für ihn getan hat.' },
      { narr: 'Ein paar Mädchen tuscheln über den „Neuen“. Quinn ist größer und blasser geworden.' },
      { bg: 'nacht', portrait: null },
      { narr: 'Währenddessen in Dreamland, einer ummauerten Elitestadt: Jack Truedream erfährt von Ians Tod. Die Bissmale kennt er – von einem anderen toten Traveller, vor Jahren.' }
    ],
    after: () => { stepDone('kiefer'); },
    next: 'akademie'
  },
  systemshop: {
    id: 'systemshop', title: 'Der System-Shop', src: 'Kapitel 101–103',
    scene: [
      { bg: 'kantine', portrait: 'leo' },
      { narr: 'Leo will wissen, auf wessen Seite Quinn steht. Quinn antwortet, er stehe auf seiner eigenen – aber dort gebe es Menschen, die er beschützen will.' },
      { narr: 'Leo geht wortlos. Quinns Aura ist eine lila Flamme. Später bietet Leo ihm Duelle an.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'SHOP', lines: ['Kristalle verkauft: 13.630 Credits.', 'Jeder Gegenstand kann nur einmal gekauft werden.'] } },
      { sys: { head: 'GEKAUFT', lines: ['Schwarzhorn-Wolfsstiefel'], kv: [['Agilität', '+4'], ['Verteidigung', '+2']] } },
      { sys: { head: 'GEFERTIGT', lines: ['Best-Standard-Handschuhe'], kv: [['Stärke', '+6'], ['Verteidigung', '+4'], ['Blutskills', '+5 %']] } },
      { sys: { head: 'NEU', lines: ['Schattenausrüstung: Ausrüstung aus dem Dimensionslager sofort anlegen.'] } }
    ],
    after: () => { stepDone('systemshop'); SAVE.quinn.gear.hands = 'standard'; SAVE.quinn.gear.feet = 'wolf'; writeSave(); },
    next: 'akademie'
  },
  hammerspray: {
    id: 'hammerspray', title: 'Hammer Spray', src: 'Kapitel 104',
    scene: [
      { bg: 'zimmer', portrait: 'peter' },
      { narr: 'Peter sitzt verprügelt vor der Tür. Vorden forscht nach, wer die Schuld für den Portal-Stoß übernommen hat – dahinter steckt wohl mindestens ein Sergeant.' },
      { portrait: 'vorden' },
      { narr: 'Quinn drängt ihn, sich mit Layla zu versöhnen. Vor ihr bringt Vorden kaum einen Satz heraus.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'TUTORIAL · KOMBINATION', lines: ['Hammer Spray', 'Hammer Strike plus ein Blutfächer.', 'Frisst Ausdauer und etwas Blut.'] } },
      { call: () => learn('hammerspray') }
    ],
    after: () => { stepDone('hammerspray'); },
    next: 'akademie'
  },
  vrerde: {
    id: 'vrerde', title: 'Die Steinwand', src: 'Kapitel 105–107', type: 'duell',
    scene: [
      { bg: 'system', portrait: null },
      { sys: { head: 'KI', lines: ['Die Baupläne des Shops gehören den Vampiren.', 'Wer sie in Massen nachbaut, lockt sie an.'] } },
      { sys: { head: 'POWER FIGHTER', lines: ['Blutskills funktionieren im Spiel. Der Schatten nicht.', 'Gegen Stufe 1 und 2 gibt es keine EP mehr.'] } },
      { bg: 'kantine', portrait: 'nate' },
      { narr: 'Zuschauer strömen herbei, Nate staunt. Der Gegner: ein Stufe-4-Erdnutzer in voller Bestienausrüstung.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'TAKTIK', lines: ['Vorn hält eine Steinwand alles ab.', 'Hammer Strike (mit Hammer Spray) bricht sie.'] } }
    ],
    fight: vrFight({ id: 'erde', look: 'erdnutzer', name: 'Erdnutzer · Stufe 4', hp: 40, poise: 5, ai: AI_ERDE, blurb: 'Steinwand vorn, Erdspeer auf Distanz.' }),
    won: [
      { bg: 'kantine', portrait: 'nate' },
      { narr: 'Ein Blood Hammer sprengt die letzte Steinwand. Danach kann Quinn kaum noch stehen. Nate zittert vor Begeisterung.' }
    ],
    reward: { exp: 40 },
    after: () => { stepDone('vrerde'); },
    next: 'akademie'
  },
  logan2: {
    id: 'logan2', title: 'Logans Labor', src: 'Kapitel 108–110',
    scene: [
      { bg: 'kantine', portrait: 'logan' },
      { narr: 'Logan sucht den „Hacker“. Seine Fähigkeit reagiert auf Technik. Beim Handschlag blockt das System seine Versuche, etwas zu verändern – und beide sehen die Meldungen.' },
      { portrait: 'vorden' },
      { narr: 'Vorden bittet Layla um Hilfe, sie verweist auf Earl. Peter stößt er absichtlich weg – damit er zu seinem Auftraggeber zurückläuft. Erin lässt ihre Eisfähigkeit kopieren.' },
      { who: 'Vorden', text: 'Raten, bald hab ich einen Job für dich.' },
      { bg: 'zimmer', portrait: 'logan' },
      { narr: 'Quinn tischt Logan die Portal-Geschichte auf. Logan scannt die Fähigkeit in einem Glasrohr und nimmt ihn in eine private Beta auf. Den Schatten soll Quinn im Spiel nicht öffentlich zeigen.' },
      { bg: 'system', portrait: null },
      { sys: { head: 'UHR', lines: ['Dreimal tippen: Anzeige wechselt zwischen Stufe 1 und Stufe 6.'] } },
      { sys: { head: 'EINE WOCHE SPÄTER', lines: ['Schattenkontrolle und Schattenausrüstung: Lv. 2', 'Gekauft: Schattenleere (eine Stunde Schattenzone, 50 MC).'], quests: ['Vorerst tabu: Schattenfresser'] } },
      { call: () => learn('leere') },
      { bg: 'nacht' },
      { narr: 'Ende der sechsten Etappe. Als Nächstes: die Reise nach Caladi.' }
    ],
    after: () => { stepDone('logan2'); },
    next: null
  }
});
MISSION_ORDER.push('portalsturz', 'rattaclaw', 'lagerhaus', 'scordana', 'dom', 'bloodsucker', 'evolution', 'schatten', 'rettung', 'kiefer', 'systemshop', 'hammerspray', 'vrerde', 'logan2');
const E6_CHAIN = ['portalsturz', 'rattaclaw', 'lagerhaus', 'scordana', 'dom', 'bloodsucker', 'evolution', 'schatten', 'rettung'];

const STORY6 = [
  { id: 'kiefer', need: 'rettung', newDay: true, label: 'Kantine · Peter', x: 105, y: 420, goal: 'Etwas stimmt nicht in der Kantine', mission: 'kiefer' },
  { id: 'systemshop', need: 'kiefer', label: 'Zimmer 23 · System-Shop', x: 110, y: 150, goal: 'Öffne im Zimmer 23 den System-Shop', mission: 'systemshop' },
  { id: 'hammerspray', need: 'systemshop', newDay: true, label: 'Zimmer 23 · Peter', x: 110, y: 150, goal: 'Vor Zimmer 23 sitzt jemand', mission: 'hammerspray' },
  { id: 'vrerde', need: 'hammerspray', label: 'VR-Raum · Herausforderung', x: 290, y: 445, goal: 'Im VR-Raum wartet ein starker Gegner', mission: 'vrerde' },
  { id: 'logan2', need: 'vrerde', newDay: true, label: 'Logans Labor', x: 330, y: 150, goal: 'Logan will dich sprechen (Bibliothek)', mission: 'logan2' }
];
