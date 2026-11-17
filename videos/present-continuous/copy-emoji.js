// Copies the Twemoji SVGs used by the video into public/emoji
const fs = require('fs'), path = require('path');
const codes = ['1f35c','1f4fa','1f633','1f602','2753','1f914','1f3c6','1f389','2615','1f44b','1f447','2705','274c','1f4de','1f1ec-1f1e7','1f525','1f605','1f64c','1f4cd','1f501','26a0','1f4ac','1f60b','1f440','2b50','1f4a1','1f3c3','1f4f9','1f60e','1f929','2728','1f446','1f512','1f4cc','1f399'];
const src = path.join(__dirname, 'node_modules/@twemoji/svg'), dst = path.join(__dirname, 'public/emoji');
fs.mkdirSync(dst, {recursive: true});
for (const c of codes) fs.copyFileSync(path.join(src, c + '.svg'), path.join(dst, c + '.svg'));
console.log('emoji copied:', codes.length);
