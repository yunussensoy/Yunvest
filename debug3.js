global.window = {};
require('./js/stock_data_compiled.js');

const data = window.stockData;
const yeotk = data['YEOTK'];
if (!yeotk) {
    console.log("YEOTK not found in data");
    process.exit(0);
}

const rows = yeotk.bilanco.rows || [];
let fb = 0;
let nakit = 0;
let fy = 0;

rows.forEach(r => {
    if (!r[0]) return;
    const name = r[0].toLocaleLowerCase('tr-TR');
    const r1 = r[1] || '';
    const valStr = String(r1).replace(/\./g, '').replace(/,/g, '.');
    const val = typeof r[1] === 'number' ? r[1] : parseFloat(valStr) || 0;
    
    if (name.includes('finansal borçlar') && !name.includes('kısımlar') && !name.includes('ksmlar') && rows.indexOf(r) < rows.length - 2) {
        console.log(`FB matched: ${r[0]} = ${val}`);
        fb += val;
    }
    if (name.includes('nakit ve nakit benzerleri') || name.includes('nakit ve nakit değerler')) {
        console.log(`Nakit matched: ${r[0]} = ${val}`);
        nakit += val;
    }
    if (name.includes('finansal yatırımlar')) {
        console.log(`FY matched: ${r[0]} = ${val}`);
        fy += val;
    }
});

const netBorc = fb - nakit - fy;
console.log(`\nTotals -> FB: ${fb}, Nakit: ${nakit}, FY: ${fy}`);
console.log(`NetBorc: ${netBorc}`);
