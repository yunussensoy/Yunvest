const fs = require('fs');
const path = require('path');

const stockDataPath = path.join(__dirname, 'js', 'stock_data_compiled.js');
let content = fs.readFileSync(stockDataPath, 'utf8');

const startIndex = content.indexOf('window.stockReports = {');
if (startIndex === -1) {
    console.error("Could not find window.stockReports");
    process.exit(1);
}

const hisselerDir = path.join(__dirname, 'Hisseler');
const reports = {};

const hisseler = fs.readdirSync(hisselerDir);
hisseler.forEach(hisse => {
    const hissePath = path.join(hisselerDir, hisse);
    if (fs.statSync(hissePath).isDirectory()) {
        const files = fs.readdirSync(hissePath).filter(f => f.endsWith('.pdf'));
        reports[hisse] = files;
    }
});

const newReportsStr = 'window.stockReports = ' + JSON.stringify(reports, null, 2) + ';\n';
content = content.substring(0, startIndex) + newReportsStr;

fs.writeFileSync(stockDataPath, content, 'utf8');
console.log("Updated stock_data_compiled.js with dynamic reports.");
