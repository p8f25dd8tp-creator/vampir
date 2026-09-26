const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const [ch, tier, T] = process.argv.slice(2, 5).map(Number); const party = (process.argv[5] || 'peter,lena').split(',');
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message + '\n' + e.stack));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2500);
  await p.addScriptTag({ path: 'dev/bot.js' });
  await p.evaluate(([ch, tier, T, party]) => {
    const sl = UI.showLevelUp; UI.showLevelUp = function () {};
    const S = storySave(); S.party = party; S.gear = { handschuhe: 3, stiefel: 3, panzer: 4, amulett: 3 };
    SAVE.settings.testUnlock = true; UI.finnPick = tier; storyStart(ch);
    let n = 0; while (GAME.t < T && GAME.state !== 'over' && n++ < 60000) { if (GAME.state === 'levelup') botPick(); if (GAME.state === 'play') updateGame(1 / 30); }
    setInterval(() => { if (GAME.state === 'levelup') botPick(); }, 200);
  }, [ch, tier, T, party]);
  await p.waitForTimeout(1600);
  await p.screenshot({ path: `/tmp/claude-0/cp-${ch}.png` });
  console.log(await p.evaluate(() => JSON.stringify({ comps: (GAME.comps||[]).map(c=>[c.id,c.x-GAME.p.x|0,c.y-GAME.p.y|0]), t: GAME.t | 0, boss: !!(GAME.boss && !GAME.boss.dead), state: GAME.state })));
  console.log(errs.join('\n'));
  await b.close();
})();
