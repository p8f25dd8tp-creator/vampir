const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 1.5 });
  const errs = []; p.on('pageerror', e => errs.push(e.message + e.stack));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => { document.getElementById('ui').style.display = 'none'; });
  for (const id of (process.argv[2] || 'akademie,bestienplanet,schlachtfeld,siedlung,ruinen,himmel,goetter').split(',')) {
    const t0 = Date.now();
    await p.evaluate((id) => setTheme(id), id);
    console.log(id, Date.now() - t0, 'ms');
    await p.waitForTimeout(700);
    await p.screenshot({ path: `/tmp/claude-0/th-${id}.png` });
  }
  console.log(errs.join('\n'));
  await b.close();
})();
