const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const [,, page, out, w, h, wait] = process.argv;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args:['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: +w||1400, height: +h||900 } });
  p.on('console', m => console.log('console:', m.text()));
  p.on('pageerror', e => console.log('ERR:', e.message));
  await p.goto(page.startsWith('http')?page:'file://' + require('path').resolve(page));
  await p.waitForTimeout(+wait||800);
  await p.screenshot({ path: out });
  await b.close();
})();
