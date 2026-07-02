const fs = require('fs');
const txt = fs.readFileSync('e:\\Yunvest\\js\\renderHisse.js', 'utf8');

const s2 = txt.indexOf('activeTab === \'Hisse Notları\'');
console.log(txt.substring(s2, s2 + 3000));
