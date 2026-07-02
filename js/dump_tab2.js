const fs = require('fs');
const txt = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

const s2 = txt.indexOf('activeTab === \'Hisse Notları\'');
console.log(txt.substring(s2, s2 + 4000));
