'use strict';
/* ==========================================================================
   3D-KAMPFTEST (Kantine) — Spielwiese fuer Grafik und Kampfgefuehl
   Quinn mit allen Nahkampf- und Blutfaehigkeiten gegen drei Schlaeger und Kyle.
   Eigene Faehigkeiten und Werte nur fuer diesen Kampf: der Spielstand bleibt
   unveraendert, es gibt keine EP.
   ========================================================================== */

MISSIONS.test3d = {
  id: 'test3d', title: '3D-Kampftest', type: 'gefecht',
  fight: {
    arena: { art: 'kantine', w: 340, h: 600, blocks: [{ x: 18, y: 150, w: 70, h: 26 }, { x: 252, y: 150, w: 70, h: 26 }, { x: 18, y: 440, w: 70, h: 26 }, { x: 252, y: 440, w: 70, h: 26 }] },
    playerAt: [170, 470], test: true, inspect: true,
    skills: ['inspect', 'bloodswipe', 'flashstep', 'hammer', 'bloodspray', 'hammerspray'],
    foes: [
      { id: 'kyle', name: 'Kyle · Tigerkrallen', hp: 30, poise: 4, at: [170, 230], ai: AI_KYLE, expRate: 0, info: { name: 'Kyle Main', race: 'Mensch', ability: 'Verwandlung (Tigerkrallen)', blood: 'B+' } },
      { id: 'schlaeger', look: 'schlaeger', name: 'Schläger', hp: 7, poise: 2, at: [90, 320], ai: AI_THUG, expRate: 0, info: { name: 'Schläger', race: 'Mensch', ability: 'Stufe 1', blood: 'A' } },
      { id: 's1', look: 's1', name: 'Schläger', hp: 7, poise: 2, at: [250, 330], ai: AI_THUG, expRate: 0, info: { name: 'Schläger', race: 'Mensch', ability: 'Stufe 1', blood: '0' } },
      { id: 's3', look: 's3', name: 'Schläger', hp: 7, poise: 2, at: [170, 300], ai: AI_THUG, expRate: 0, info: { name: 'Schläger', race: 'Mensch', ability: 'Stufe 2', blood: 'B' } }
    ],
    npcs: [{ id: 'peter', at: [300, 520], pose: 'cower', face: -1 }, { id: 's2', at: [40, 210], pose: 'cheer', watch: 'foe' }, { id: 's4', at: [305, 210], pose: 'cheer', watch: 'foe' }, { id: 'zweit', at: [40, 520], watch: 'foe' }],
    expBonus: () => 0,
    onTick: (G) => {
      const p = G.player;
      if (!G.testSet) { G.testSet = true; p.maxHp = p.hp = 40; p.str = 16; p.agi = 16; p.maxStam = p.stam = 150; }
      G.hint = G.t < 5 ? { text: 'Tippen: Combo · Halten: aufgeladen<br>Rote Fläche: im letzten Moment ausweichen' } : null;
    }
  },
  repeat: true, next: null
};

function startTest3d() {
  if (!window.THREE) { sysMsg({ head: '3D', lines: ['Die 3D-Grafik lädt noch oder braucht Internet.'] }, 2400); }
  SAVE.settings.gfx3d = true;
  startMission('test3d', true, true);
}
