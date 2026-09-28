/*
 * Baut Nachtfall als EINE Datei: nachtfall-standalone.html
 * (Schriften, Stil, Skripte und Icon eingebettet — laeuft ohne Server und offline.)
 *   node build.js
 * Ausserdem wird die Cache-Version im Service Worker aus dem Inhalt abgeleitet,
 * damit installierte Geraete Updates automatisch bekommen.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = __dirname;
const rd = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const b64 = (f) => fs.readFileSync(path.join(root, f)).toString('base64');

let html = rd('index.html').replace('./vendor/three.module.min.js', 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js').replace('./vendor/addons/', 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/');
const scripts = [...html.matchAll(/<script src="(src\/[^"?]+)[^"]*"><\/script>/g)].map((m) => m[1]);
const js = scripts.map((s) => `/* ---- ${s} ---- */\n` + rd(s)).join('\n');
let css = rd('style.css')
  .replace('url(fonts/cinzel.woff2)', 'url(data:font/woff2;base64,' + b64('fonts/cinzel.woff2') + ')')
  .replace('url(fonts/cormorant-700.woff2)', 'url(data:font/woff2;base64,' + b64('fonts/cormorant-700.woff2') + ')');
const icon = 'data:image/png;base64,' + b64('icons/apple-touch-icon.png');

const imgs = {}; const idir = path.join(root, 'img'); if (fs.existsSync(idir)) for (const f of fs.readdirSync(idir)) if (f.endsWith('.webp')) imgs[f.slice(0, -5)] = 'data:image/webp;base64,' + fs.readFileSync(path.join(idir, f)).toString('base64');
let out = html
  .replace('<link rel="manifest" href="manifest.webmanifest">\n', '')
  .replace('href="icons/apple-touch-icon.png"', 'href="' + icon + '"')
  .replace('href="icons/icon-192.png"', 'href="' + icon + '"')
  .replace(/<link rel="stylesheet"[^>]*>/, () => '<style>\n' + css + '\n</style>')
  .replace(/<!--SCRIPTS-->[\s\S]*<!--\/SCRIPTS-->/, () => '<script>window.IMG_B64 = ' + JSON.stringify(imgs) + ';</script>\n<script>\n' + js + '\n</script>')
  .replace(/<script>\s*if \('serviceWorker'[\s\S]*?<\/script>/, '');
// 3D-Figuren (KayKit, CC0) eingebettet, damit die Einzeldatei ohne Zusatzdateien laeuft
const figs = {}; for (const n of ['schurke', 'magier', 'barbar', 'anim']) { const f = path.join(root, 'models', n + '.glb'); if (fs.existsSync(f)) figs[n] = fs.readFileSync(f).toString('base64'); }
out = out.replace('</body>', () => '<script>window.FIG_B64 = ' + JSON.stringify(figs) + ';</script>\n</body>');
fs.writeFileSync(path.join(root, 'nachtfall-standalone.html'), out);
console.log('nachtfall-standalone.html —', (out.length / 1024).toFixed(0), 'KB');

// Service-Worker-Version = Hash ueber alle Spieldateien
const hash = crypto.createHash('sha1').update(js + css + html).digest('hex').slice(0, 10);
const sw = rd('sw.js').replace(/const CACHE = '[^']*';/, `const CACHE = 'nachtfall-${hash}';`);
fs.writeFileSync(path.join(root, 'sw.js'), sw);
console.log('sw.js Cache-Version:', hash);
