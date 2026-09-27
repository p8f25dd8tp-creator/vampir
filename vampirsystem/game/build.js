/*
 * Baut das Spiel als EINE Datei: mvs-standalone.html
 * (Schriften, Stil, Skripte und Icon eingebettet — laeuft ohne Server, offline.)
 *   node build.js
 */
const fs = require('fs');
const path = require('path');
const root = __dirname;
const rd = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const b64 = (f) => fs.readFileSync(path.join(root, f)).toString('base64');
let html = rd('index.html');
const scripts = [...html.matchAll(/<script src="(src\/[^"?]+)[^"]*"><\/script>/g)].map((m) => m[1]);
const js = scripts.map((s) => `/* ---- ${s} ---- */\n` + rd(s)).join('\n');
const css = rd('style.css')
  .replace('url(fonts/cinzel.woff2)', 'url(data:font/woff2;base64,' + b64('fonts/cinzel.woff2') + ')')
  .replace('url(fonts/cormorant-700.woff2)', 'url(data:font/woff2;base64,' + b64('fonts/cormorant-700.woff2') + ')');
const icon = 'data:image/png;base64,' + b64('icons/apple-touch-icon.png');
const out = html
  .replace('href="icons/apple-touch-icon.png"', 'href="' + icon + '"')
  .replace('href="icons/icon-192.png"', 'href="' + icon + '"')
  .replace(/<link rel="stylesheet"[^>]*>/, () => '<style>\n' + css + '\n</style>')
  .replace(/<!--SCRIPTS-->[\s\S]*<!--\/SCRIPTS-->/, () => '<script>\n' + js + '\n</script>');
fs.writeFileSync(path.join(root, 'mvs-standalone.html'), out);
console.log('mvs-standalone.html —', (out.length / 1024).toFixed(0), 'KB');
