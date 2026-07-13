global.window = {};
require('./js/stock_data_compiled.js');

const data = window.stockData;
const yeotk = data['YEOTK'];
if (!yeotk) {
    console.log("YEOTK not found in data");
    process.exit(0);
}

const rows = yeotk.bilanco.rows || [];
rows.forEach((r, idx) => {
    if (!r[0]) return;
    const name = r[0].toLocaleLowerCase('tr-TR');
    if (name.includes('finansal yatırımlar') || name.includes('dönen varlıklar') || name.includes('duran varlıklar')) {
        console.log(`[${idx}] ${r[0]}`);
    }
});
