#!/usr/bin/env node
/* Build minter.html: the minting desk as one self-contained file.
 *
 * index.html loads its four scripts from assets/, which is right for working on
 * the project but means the folder has to travel with it. This inlines them so
 * there is a single file you can keep anywhere, email to yourself, or open on a
 * machine that has never seen the repo -- double-click and mint.
 *
 *     node tools/build-minter.js
 *
 * Regenerate it after changing anything under assets/.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const tag = /<script src="(assets\/[^"]+)"><\/script>/g;
let inlined = 0;

html = html.replace(tag, (match, rel) => {
  const code = fs.readFileSync(path.join(root, rel), 'utf8')
    // a literal </script anywhere inside would close the block early
    .replace(/<\/script/gi, '<\\/script');
  inlined++;
  return '<script>\n/* ' + rel + ' */\n' + code + '\n</script>';
});

if (inlined !== 4) {
  throw new Error('expected to inline 4 asset scripts, inlined ' + inlined);
}

html = html.replace(
  '<title>Briotto Family Airline — minting desk</title>',
  '<title>Briotto Family Airline — minting desk</title>\n' +
  '<!-- Self-contained build of index.html. Regenerate: node tools/build-minter.js -->'
);

const out = path.join(root, 'minter.html');
fs.writeFileSync(out, html);
console.log('wrote minter.html (' + Math.round(html.length / 1024) + ' KB, ' + inlined + ' scripts inlined)');
