const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const hero = process.argv[2] || 'vorian';
  const out = process.argv[3] || '/tmp/claude-0/p';
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('console', m => { if (m.type() === 'error' || m.type()==='warning') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message + '\n' + e.stack));
  await p.goto('http://localhost:8765/index.html');
  await p.waitForTimeout(2500);
  await p.screenshot({ path: out + '-title.png' });
  await p.evaluate(() => UI.act('play', {}));
  await p.waitForTimeout(600);
  await p.evaluate((h) => { UI.selHero = h; UI.renderSelectDetail(); }, hero);
  await p.waitForTimeout(400);
  await p.screenshot({ path: out + '-select.png' });
  await p.evaluate((h) => startGame(h), hero);
  // Joystick: Tasten simulieren
  await p.keyboard.down('KeyD'); await p.waitForTimeout(1500); await p.keyboard.up('KeyD');
  await p.keyboard.down('KeyW'); await p.waitForTimeout(1500); await p.keyboard.up('KeyW');
  await p.waitForTimeout(3000);
  await p.screenshot({ path: out + '-play1.png' });
  const info = await p.evaluate(() => ({ t: GAME.t, lvl: GAME.level, en: GAME.enemies.length, hp: GAME.p.hp, state: GAME.state }));
  console.log(JSON.stringify(info));
  console.log(errs.slice(0, 10).join('\n'));
  await b.close();
})();
