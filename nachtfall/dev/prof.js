const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8765/index.html');
  await p.waitForTimeout(2500);
  await p.addScriptTag({ path: 'dev/bot.js' });
  const r = await p.evaluate(() => {
    UI.showLevelUp = function () {}; UI.hideLevelUp = function () {};
    startGame('nyx');
    let n = 0; while (GAME.t < 480 && n++ < 60000) { if (GAME.state === 'levelup') botPick(); if (GAME.state === 'play') updateGame(1 / 30); }
    const fns = ['drawDecals', 'drawEffects', 'drawPickups', 'drawProp', 'drawEnemy', 'drawPlayer', 'drawParts', 'renderLightmap', 'drawFog', 'drawTexts', 'drawEnemyGlows', 'drawEnemyShots', 'drawPropGlows', 'drawImagesOne', 'drawBluternte', 'chunkProps'];
    const acc = {};
    for (const f of fns) { const o = window[f]; acc[f] = 0; window[f] = function () { const t = performance.now(); const r = o.apply(this, arguments); acc[f] += performance.now() - t; return r; }; }
    const t0 = performance.now(); const N = 30;
    for (let i = 0; i < N; i++) renderWorld(GAME, GAME.realT + i / 60);
    const tot = (performance.now() - t0) / N;
    const u0 = performance.now(); for (let i = 0; i < N; i++) updateGame(1 / 60); const upd = (performance.now() - u0) / N;
    const out = { total: tot.toFixed(2), update: upd.toFixed(2), en: GAME.enemies.length, parts: FX.parts.length, fx: FX.effects.length };
    for (const f of fns) out[f] = (acc[f] / N).toFixed(2);
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
