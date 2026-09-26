// Zeigt eine Faehigkeit in Aktion: Held + Gegnerring, Screenshots in Folge
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const hero = process.argv[2], cards = (process.argv[3] || '').split(',').filter(Boolean), out = process.argv[4], shots = +(process.argv[5] || 4), gap = +(process.argv[6] || 250), ult = process.argv[7] === 'ult';
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message + e.stack));
  await p.goto('http://localhost:8765/index.html');
  await p.waitForTimeout(2500);
  await p.evaluate((t0) => { window.__T0 = t0; }, +(process.env.T0 || 0.5));
  await p.evaluate(([h, cards, ult]) => {
    startGame(h); openLevelUp = function(){}; GAME.pendingLevels = 0;
    GAME.eventIdx = 999; WAVES.forEach(w => w.target = 0);
    for (const c of cards) { const [id, n] = c.split(':'); for (let i = 0; i < (+n || 1); i++) giveCard(id, true); }
    recomputeStats(); GAME.p.hp = GAME.p.st.maxHp;
    for (const id in GAME.p.ab) GAME.p.ab[id].t = +(window.__T0 || 0.5);
    for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2, r = 70 + (i % 3) * 45; const e = makeEnemy(['ghoul','knight','bat','ghoul'][i % 4], Math.cos(a) * r, Math.sin(a) * r * 0.8); e.hp = e.maxHp = 400; }
    GAME.p.qi = 5; damagePlayer = () => false;
    if (ult) GAME.later(0.45, () => { GAME.p.ultCd = 0; castUlt(GAME.p); });
    const H = document.getElementById('hint'); if (H) H.remove();
  }, [hero, cards, ult]);
  for (let i = 0; i < shots; i++) { await p.waitForTimeout(gap); await p.screenshot({ path: `${out}-${i}.png`, clip: { x: 45, y: 250, width: 300, height: 330 } }); }
  if (errs.length) console.log(errs.join('\n'));
  await b.close();
})();
