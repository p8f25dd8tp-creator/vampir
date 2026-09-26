const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  p.on('requestfailed', r => errs.push('REQFAIL ' + r.url().slice(0, 80)));
  await p.goto('file://' + require('path').resolve('nachtfall-standalone.html'));
  await p.waitForTimeout(3000);
  await p.evaluate(() => startGame('nyx'));
  await p.waitForTimeout(3000);
  console.log(JSON.stringify(await p.evaluate(() => ({ t: GAME.t.toFixed(1), en: GAME.enemies.length, fonts: document.fonts.check('800 20px Cinzel') }))));
  console.log(errs.join('\n'));
  await b.close();
})();
