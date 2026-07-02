const fs = require('fs');
const lines = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('const renderHisseIslemleri =') || l.includes('function renderHisseIslemleri'));
if (idx !== -1) {
    const end = Math.min(lines.length, idx + 50);
    console.log(lines.slice(idx, end).join('\n'));
} else {
    console.log('Not found');
}
