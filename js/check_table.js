const fs = require('fs');
const lines = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('takip-table'));
if (idx !== -1) {
    console.log(lines.slice(Math.max(0, idx - 5), idx + 5).join('\n'));
} else {
    console.log('Not found');
}
