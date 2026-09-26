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

let html = rd('index.html');
const scripts = [...html.matchAll(/<script src="(src\/[^"?]+)[^"]*"><\/script>/g)].map((m) => m[1]);
const js = scripts.map((s) => `/* ---- ${s} ---- */\n` + rd(s)).join('\n');
let css = rd('style.css')
  .replace('url(fonts/cinzel.woff2)', 'url(data:font/woff2;base64,' + b64('fonts/cinzel.woff2') + ')')
  .replace('url(fonts/cormorant-700.woff2)', 'url(data:font/woff2;base64,' + b64('fonts/cormorant-700.woff2') + ')');
const icon = 'data:image/png;base64,' + b64('icons/apple-touch-icon.png');

let out = html
  .replace('<link rel="manifest" href="manifest.webmanifest">\n', '')
  .replace('href="icons/apple-touch-icon.png"', 'href="' + icon + '"')
  .replace('href="icons/icon-192.png"', 'href="' + icon + '"')
  .replace(/<link rel="stylesheet"[^>]*>/, () => '<style>\n' + css + '\n</style>')
  .replace(/<!--SCRIPTS-->[\s\S]*<!--\/SCRIPTS-->/, () => '<script>\n' + js + '\n</script>')
  .replace(/<script>\s*if \('serviceWorker'[\s\S]*?<\/script>/, '');
fs.writeFileSync(path.join(root, 'nachtfall-standalone.html'), out);
console.log('nachtfall-standalone.html —', (out.length / 1024).toFixed(0), 'KB');

// Service-Worker-Version = Hash ueber alle Spieldateien
const hash = crypto.createHash('sha1').update(js + css + html).digest('hex').slice(0, 10);
const sw = rd('sw.js').replace(/const CACHE = '[^']*';/, `const CACHE = 'nachtfall-${hash}';`);
fs.writeFileSync(path.join(root, 'sw.js'), sw);
console.log('sw.js Cache-Version:', hash);
