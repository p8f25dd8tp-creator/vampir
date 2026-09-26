const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message + '\n' + e.stack));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2500);
  await p.addScriptTag({ path: 'dev/bot.js' });
  const tiers = [1,2,2,2,2,3,3,4,4,4,5,6];
  for (let ch = 1; ch <= 12; ch++) {
    const r = await p.evaluate(([ch, tier]) => {
      UI.showLevelUp = function () {};
      const S = storySave(); S.party = ['peter','fabian','emma'];
      SAVE.settings.testUnlock = true; UI.finnPick = tier; storyStart(ch);
      let n = 0; while (GAME.t < 20 && GAME.state !== 'over' && n++ < 3000) { if (GAME.state === 'levelup') botPick(); if (GAME.state === 'play') updateGame(1 / 30); }
      // Boss direkt holen fuer Grafiktest
      return { ch, t: GAME.t | 0, comps: GAME.comps.length, dodge: dodgeKind(GAME.p), ab: Object.keys(GAME.p.ab).join(',') };
    }, [ch, tiers[ch-1]]);
    await p.waitForTimeout(400);
    await p.screenshot({ path: `/tmp/claude-0/ch${ch}.png` });
    console.log(JSON.stringify(r));
    if (errs.length) { console.log(errs.join('\n')); errs.length = 0; }
  }
  await b.close();
})();
