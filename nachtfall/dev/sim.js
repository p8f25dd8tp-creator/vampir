const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const heroes = (process.argv[2] || 'vorian,liora,nyx,shen').split(',');
  const runs = +(process.argv[3] || 1);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message + '\n' + e.stack));
  await p.goto('http://localhost:8765/index.html');
  await p.waitForTimeout(2500);
  await p.addScriptTag({ path: 'dev/bot.js' });
  for (const h of heroes) for (let r = 0; r < runs; r++) {
    const t0 = Date.now();
    const res = await p.evaluate((h) => simRun(h, 720), h);
    res.sec = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(JSON.stringify(res));
    if (errs.length) { console.log(errs.slice(0, 5).join('\n')); errs.length = 0; }
  }
  await b.close();
})();
