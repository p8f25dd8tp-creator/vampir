const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage();
  await p.goto('http://localhost:8765/dev/icons.html'); await p.waitForTimeout(500);
  for (const [n, s] of [['icon-512', 512], ['icon-192', 192], ['apple-touch-icon', 180]]) {
    const d = await p.evaluate((s) => makeIcon(s), s);
    fs.writeFileSync('icons/' + n + '.png', Buffer.from(d.split(',')[1], 'base64'));
  }
  await b.close();
})();
