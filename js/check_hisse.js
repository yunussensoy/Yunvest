const fs = require('fs');
const lines = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('Hisse İşlemleri') || l.includes('hisse_islemleri'));
if (idx !== -1) {
    console.log(lines.slice(idx - 10, idx + 20).join('\n'));
} else {
    console.log('Not found');
}
