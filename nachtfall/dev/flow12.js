const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message + '\n' + e.stack));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2000);
  await p.addScriptTag({ path: 'dev/bot.js' });
  const out = await p.evaluate(() => {
    SAVE.story = { v2: true }; SAVE.finn = { tier: 1, essence: 0, wins: 0, runs: 0 }; SAVE.settings.testUnlock = false;
    const S = storySave(); S.cleared = { 1: true };
    UI.finnPick = undefined; storyStart(2);
    GAME.won = true; const r = storyEnd(true);
    return { skills: S.skills, cleared: S.cleared, rew: r.reward && r.reward.text, neu: r.skills, dodge: finnDodge(2), pool: HEROES.finn.poolOf({ tier: 2 }).join(',') };
  });
  console.log(JSON.stringify(out));
  // Endbildschirm
  await p.evaluate(() => { const r = { story: true, ch: CHAPTERS[1], crystals: 55, firstClear: true, reward: CHAPTERS[1].reward, skills: ['schatten', 'qi'] }; GAME.state = 'over'; UI.showEnd(true, 0, [], r); });
  await p.waitForTimeout(400); await p.screenshot({ path: '/tmp/claude-0/end.png' });
  await p.evaluate(() => { UI.selChapter = 3; UI.showStory(); });
  await p.waitForTimeout(600); await p.screenshot({ path: '/tmp/claude-0/menu12.png', fullPage: false });
  await p.evaluate(() => document.querySelector('.syswin:last-of-type') && document.querySelectorAll('.syswin')[3].scrollIntoView());
  await p.waitForTimeout(300); await p.screenshot({ path: '/tmp/claude-0/menu12b.png' });
  console.log(errs.join('\n'));
  await b.close();
})();
