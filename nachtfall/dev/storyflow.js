const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const ch = +(process.argv[2] || 1), tier = process.argv[3];
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message + '\n' + e.stack));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2500);
  await p.screenshot({ path: '/tmp/claude-0/sf-title.png' });
  await p.evaluate(([ch, tier]) => { if (tier !== undefined) UI.finnPick = +tier; UI.selChapter = ch; UI.act('story', {}); }, [ch, tier]);
  await p.waitForTimeout(1200); await p.screenshot({ path: '/tmp/claude-0/sf-story.png' });
  await p.evaluate(() => UI.act('chapterGo', {})); await p.waitForTimeout(500); await p.screenshot({ path: '/tmp/claude-0/sf-intro.png' });
  await p.evaluate(() => UI.act('chapterStart', {}));
  await p.keyboard.down('KeyD'); await p.waitForTimeout(1200); await p.keyboard.up('KeyD');
  await p.waitForTimeout(2500); await p.screenshot({ path: '/tmp/claude-0/sf-play.png' });
  console.log(await p.evaluate(() => JSON.stringify({ theme: WORLD.theme, tier: GAME.p.tier, en: GAME.enemies.length, types: [...new Set(GAME.enemies.map(e => e.type))], state: GAME.state })));
  console.log(errs.join('\n'));
  await b.close();
})();
