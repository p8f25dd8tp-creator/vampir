// Bot spielt Kapitel mit realistischem Fortschritt (Form, Kraefte, Begleiter, Ausruestung)
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const chs = (process.argv[2] || '1,2,3,4,5,6,7,8,9,10,11,12').split(',').map(Number);
  const runs = +(process.argv[3] || 1);
  const gearBy = JSON.parse(process.env.GEAR || '[0,0,1,1,2,2,3,3,4,4,4,5]');
  const party = (process.env.PARTY || 'peter,lena').split(',').filter(Boolean);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + '\n' + e.stack));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2500);
  await p.addScriptTag({ path: 'dev/bot.js' });
  for (const ch of chs) for (let r = 0; r < runs; r++) {
    const res = await p.evaluate(([ch, gear, party]) => {
      const tierAt = [1, 2, 2, 2, 2, 3, 3, 4, 4, 4, 5, 6][ch - 1];
      const S = storySave(), F = finnSave();
      S.cleared = {}; S.skills = []; S.king = false;
      for (let n = 1; n < ch; n++) { S.cleared[n] = true; (CHAPTERS[n - 1].reward.skills || []).forEach((k) => S.skills.push(k)); if (CHAPTERS[n - 1].reward.king) S.king = true; }
      S.gear = { handschuhe: gear, stiefel: gear, panzer: gear, amulett: gear };
      S.party = party.slice(0, S.skills.includes('fraktion') ? 3 : 2);
      F.tier = tierAt;
      UI.showLevelUp = function () {}; UI.hideLevelUp = function () {}; UI.showEnd = function () {}; UI.announce = function () {}; UI.toast = function () {}; UI.hurtFlash = function () {}; UI.sysWindow = function () {}; UI.evolution = function () {};
      SAVE.settings.testUnlock = false; UI.finnPick = undefined; storyStart(ch);
      AudioSys.stopMusic(); GAME.finnTest = true;
      let steps = 0;
      while (GAME.state !== 'over' && GAME.t < 720 && steps < 60 * 900) { if (GAME.state === 'levelup') botPick(); if (GAME.state === 'play') updateGame(1 / 30); steps++; }
      const G = GAME;
      return { ch, tier: G.p.tier, comps: G.comps.length, t: Math.round(G.t), won: G.won, lvl: G.level, boss: G.boss ? Math.round(G.boss.hp) + '/' + Math.round(G.boss.maxHp) : '-', q: G.quests.filter(q => q.done).length, taken: Math.round(G.stats.taken) };
    }, [ch, gearBy[ch - 1], party]);
    console.log(JSON.stringify(res));
    if (errs.length) { console.log(errs.slice(0, 3).join('\n')); errs.length = 0; }
  }
  await b.close();
})();
