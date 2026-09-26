const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const jobs = (process.argv[2] || '1:1,2:2,3:3,4:4,5:4,6:5,7:6').split(',').map(s => s.split(':').map(Number));
  const runs = +(process.argv[3] || 1);
  const jobGear = { 1: 0, 2: 1, 3: 2, 4: 3, 5: +(process.env.G5 || 3), 6: 4, 7: 5 };
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + '\n' + e.stack));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2500);
  await p.addScriptTag({ path: 'dev/bot.js' });
  for (const [ch, tier] of jobs) for (let r = 0; r < runs; r++) {
    const res = await p.evaluate(([c, t, gr, k]) => simStory(c, t, 720, gr, k), [ch, tier, jobGear[ch] || 0, ch >= 5]);
    console.log(JSON.stringify(res));
    if (errs.length) { console.log(errs.slice(0, 3).join('\n')); errs.length = 0; }
  }
  await b.close();
})();
