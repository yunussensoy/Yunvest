const fs = require('fs');
const txt = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

const s1 = txt.indexOf('notlar-table');
console.log('--- Notlar Table ---');
console.log(txt.substring(Math.max(0, s1 - 200), s1 + 1500));

const s2 = txt.indexOf('Takip Listesi');
console.log('\n--- Takip Listesi ---');
console.log(txt.substring(Math.max(0, s2 - 200), s2 + 1000));

const s3 = txt.indexOf('Buluttan raporlar');
console.log('\n--- Raporlar ---');
console.log(txt.substring(Math.max(0, s3 - 100), s3 + 100));

const s4 = txt.indexOf('analizler =');
console.log('\n--- Analizler Array ---');
console.log(txt.substring(Math.max(0, s4 - 100), s4 + 500));

