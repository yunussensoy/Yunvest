const fs = require('fs');
let content = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');
content = content.replace('Takip listeniz bo.', 'Takip listeniz boş.');
content = content.replace('Listeniz bo</div>', 'Listeniz boş</div>');
fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', content, 'utf8');
console.log('Fixed real boş instances.');
