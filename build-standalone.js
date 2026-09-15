/*
 * Baut aus index.html + game.js eine einzige HTML-Datei: blutmond-standalone.html
 * Diese Datei laeuft ohne Server, direkt aus der Dateien-App oder per Doppelklick.
 *   node build-standalone.js
 */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
const icon = fs.readFileSync(path.join(root, 'icons', 'apple-touch-icon.png')).toString('base64');
const dataIcon = 'data:image/png;base64,' + icon;

const out = html
  .replace('<link rel="manifest" href="manifest.webmanifest">', '')
  .replace(/href="icons\/apple-touch-icon\.png"/, 'href="' + dataIcon + '"')
  .replace(/href="icons\/icon-192\.png"/, 'href="' + dataIcon + '"')
  .replace('<script src="game.js?v=1"></script>', '<script>\n' + game + '\n</script>')
  .replace(/<script>\s*if \('serviceWorker'[\s\S]*?<\/script>/, '');

fs.writeFileSync(path.join(root, 'blutmond-standalone.html'), out);
console.log('blutmond-standalone.html geschrieben —', (out.length / 1024).toFixed(1), 'KB');
