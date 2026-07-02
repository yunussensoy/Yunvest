const fs = require('fs');
let content = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');
let before = content.length;
content = content.replace(/boş/g, 'bo');
content = content.replace(/bo\uFFFD/g, 'bo');
let after = content.length;
fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', content, 'utf8');
console.log('Fixed ' + (before - after) + ' occurrences.');
