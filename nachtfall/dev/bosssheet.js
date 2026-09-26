const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2000);
  await p.evaluate(() => {
    document.body.innerHTML = ''; const c = document.createElement('canvas'); c.width = 1400; c.height = 900; document.body.appendChild(c);
    const g = c.getContext('2d'); g.fillStyle = '#556'; g.fillRect(0, 0, 1400, 900);
    const ids = ['mono','ian','dalki1','stahlmann','silva','hagon','sunshield','cindy','original','graham','erin','immortui'];
    ids.forEach((id, i) => { g.save(); g.translate(90 + (i % 6) * 225, 330 + Math.floor(i / 6) * 400); BOSS_ART[id](g, { t: 1.3, run: 0 }); g.restore(); g.fillStyle = '#fff'; g.font = '16px sans-serif'; g.fillText(id, 40 + (i % 6) * 225, 360 + Math.floor(i / 6) * 400); });
  });
  await p.screenshot({ path: '/tmp/claude-0/bosses.png' });
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2000);
  await p.evaluate(() => {
    const ids = ['h_laeufer','h_wache','h_truedream','h_torres','h_jack','h_sunshield','h_pure','h_markiert','h_rotvamp','h_xander','h_klon','q_kanal','q_rot','q_rotP','q_orange','q_caladi','q_hase','q_daemon','dalki4'];
    document.body.innerHTML = ''; const c = document.createElement('canvas'); c.width = 1400; c.height = 500; document.body.appendChild(c);
    const g = c.getContext('2d'); g.fillStyle = '#556'; g.fillRect(0, 0, 1400, 500);
    ids.forEach((id, i) => { const A = ENEMY_ART[id]; g.save(); g.translate(60 + (i % 10) * 135, 170 + Math.floor(i / 10) * 230); g.scale(1.6, 1.6); A.draw(g, 0.3, {}); g.restore(); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText(id, 20 + (i % 10) * 135, 200 + Math.floor(i / 10) * 230); });
  });
  await p.screenshot({ path: '/tmp/claude-0/enemies.png' });
  console.log(errs.join('\n'));
  await b.close();
})();
