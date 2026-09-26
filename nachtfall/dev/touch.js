const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message + e.stack));
  await p.goto('http://localhost:8765/index.html');
  await p.waitForTimeout(2500);
  // echtes Tippen durch die Menues
  await p.locator('button[data-act=play]').tap();
  await p.waitForTimeout(400);
  await p.locator('.hcard[data-id=liora]').tap();
  await p.waitForTimeout(200);
  await p.locator('#startbtn').tap();
  await p.waitForTimeout(500);
  const pos0 = await p.evaluate(() => [GAME.p.x, GAME.p.y, GAME.hero]);
  // Joystick: Zeiger-Ereignisse (wie ein Finger) auf dem Canvas
  const cdp = await ctx.newCDPSession(p);
  const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
  await touch('touchStart', 150, 600);
  for (let i = 1; i <= 10; i++) { await touch('touchMove', 150 + i * 8, 600 - i * 4); await p.waitForTimeout(30); }
  await p.waitForTimeout(1200);
  const pos1 = await p.evaluate(() => [GAME.p.x, GAME.p.y, INPUT.joy.active, INPUT.moveX.toFixed(2), INPUT.moveY.toFixed(2)]);
  await p.screenshot({ path: '/tmp/claude-0/touch.png' });
  await touch('touchEnd');
  await p.waitForTimeout(300);
  const pos2 = await p.evaluate(() => [INPUT.joy.active, GAME.p.vx.toFixed(1)]);
  // Ausweichen & Ultimate antippen
  await p.locator('#dbtn').tap();
  await p.waitForTimeout(100);
  const d = await p.evaluate(() => [GAME.p.dodgeCd.toFixed(2)]);
  await p.locator('#ubtn').tap();
  await p.waitForTimeout(100);
  const u = await p.evaluate(() => [GAME.p.ultCd.toFixed(2), GAME.p.buffAder.toFixed(2)]);
  await p.locator('#pbtn').tap(); await p.waitForTimeout(200);
  const st = await p.evaluate(() => GAME.state);
  console.log(JSON.stringify({ pos0, pos1, pos2, d, u, st }));
  console.log(errs.join('\n'));
  await b.close();
})();
