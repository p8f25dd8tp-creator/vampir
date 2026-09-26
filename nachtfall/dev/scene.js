const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const hero = process.argv[2] || 'vorian', T = +(process.argv[3] || 200), out = process.argv[4] || '/tmp/claude-0/s';
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--enable-gpu-rasterization','--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message + '\n' + e.stack));
  await p.goto('http://localhost:8765/index.html');
  await p.waitForTimeout(2500);
  await p.addScriptTag({ path: 'dev/bot.js' });
  await p.evaluate(([h, T]) => {
    const sl = UI.showLevelUp;
    UI.showLevelUp = function () {}; UI.hideLevelUp = function () {};
    startGame(h);
    let n = 0;
    while (GAME.t < T && GAME.state !== 'over' && n++ < 60 * 1000) { if (GAME.state === 'levelup') botPick(); if (GAME.state === 'play') updateGame(1 / 30); }
    UI.showLevelUp = sl; UI.hideLevelUp = function () { UI.clear(); };
    window.__pick = true;
  }, [hero, T]);
  // Bot waehrend der Echtzeit weiter Karten waehlen lassen
  await p.evaluate(() => { setInterval(() => { if (GAME.state === 'levelup') botPick(); }, 300); });
  for (let i = 0; i < 3; i++) {
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${out}-${i}.png` });
  }
  const perf = await p.evaluate(() => { const t0 = performance.now(); for (let i = 0; i < 30; i++) renderWorld(GAME, GAME.realT + i / 60); return { ms: ((performance.now() - t0) / 30).toFixed(2), en: GAME.enemies.length, parts: FX.parts.length, t: GAME.t.toFixed(0), lvl: GAME.level, state: GAME.state }; });
  console.log(JSON.stringify(perf));
  console.log(errs.slice(0, 5).join('\n'));
  await b.close();
})();
