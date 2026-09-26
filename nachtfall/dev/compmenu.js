const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2000);
  await p.evaluate(() => { SAVE.settings.testUnlock = false; storySave().cleared = { 1: true, 2: true }; storySave().party = []; UI.showStory(); });
  await p.click('.comp[data-id=peter]'); await p.click('.comp[data-id=lena]');
  await p.evaluate(() => { const el = document.querySelector('.comps'); el.scrollIntoView(); });
  await p.waitForTimeout(300);
  await p.screenshot({ path: '/tmp/claude-0/menu.png' });
  console.log(await p.evaluate(() => JSON.stringify(storySave().party)), errs);
  await b.close();
})();
