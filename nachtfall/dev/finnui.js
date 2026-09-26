const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message + e.stack));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => { SAVE.finn = { tier: 1, essence: 420, wins: 0, runs: 1 }; UI.finnPick = undefined; UI.selHero = 'finn'; UI.showSelect(); document.querySelector('#select').scrollTop = 330; });
  await p.waitForTimeout(800); await p.screenshot({ path: '/tmp/claude-0/fu-select.png' });
  await p.evaluate(() => { startGame('finn'); GAME.t = 320; GAME.kills = 2500; GAME.level = 20; endRun(false); });
  await p.waitForTimeout(700); await p.screenshot({ path: '/tmp/claude-0/fu-end.png' });
  console.log(await p.evaluate(() => JSON.stringify(SAVE.finn)));
  console.log(errs.join('\n'));
  await b.close();
})();
