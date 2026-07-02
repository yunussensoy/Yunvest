const fs = require('fs');
const lines = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('const renderAnasayfa ='));
const end = lines.findIndex((l, i) => i > start && l.includes('};'));
console.log(lines.slice(start, end).join('\n'));
