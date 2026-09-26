const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage();
 await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1500);
 console.log(await p.evaluate(() => { UI.selChapter = 4; UI.showStory(); return [...document.querySelectorAll('.sysnote')].map(n=>n.textContent).filter(t=>t.includes('Storymissionen')).join('\n'); }));
 await b.close(); })();
