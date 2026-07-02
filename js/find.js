const fs = require('fs');
const txt = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

const s2 = txt.indexOf('[\'Finansal Rapor\'');
console.log(txt.substring(s2 - 200, s2 + 800));
