const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

global.window = {};
global.window.stockData = {};
global.window.stockReports = {};
global.process = process;

// Evaluate the robust parser
eval(fs.readFileSync(path.join(__dirname, 'excel_parser_v2.js'), 'utf8'));

const hisselerDir = path.join(__dirname, '..', 'Hisseler');
let folders = [];
try {
    folders = fs.readdirSync(hisselerDir).filter(f => fs.statSync(path.join(hisselerDir, f)).isDirectory());
} catch(e) {
    console.error("Hisseler directory not found: ", e.message);
}

folders.forEach(hisse => {
    const hisseFolder = path.join(hisselerDir, hisse);
    
    // Raporlari topla
    window.stockReports[hisse] = [];
    if (fs.existsSync(hisseFolder)) {
        const files = fs.readdirSync(hisseFolder);
        const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
        pdfFiles.sort((a, b) => a.localeCompare(b, 'tr'));
        window.stockReports[hisse] = pdfFiles;
    }
    
    const filePath = path.join(hisseFolder, 'bilanco.xlsx');
    if (fs.existsSync(filePath)) {
        try {
            window.parseExcelData(hisse);
        } catch (e) {
            console.error(`Error processing ${hisse}:`, e.message);
        }
    }
});

const outputJs = 'window.stockData = ' + JSON.stringify(window.stockData, null, 2) + ';\nwindow.stockReports = ' + JSON.stringify(window.stockReports, null, 2) + ';
';
fs.writeFileSync(path.join(__dirname, 'stock_data_compiled.js'), outputJs);
console.log('Derleme basariyla tamamlandi. Toplam hisse sayisi: ' + Object.keys(window.stockData).length);
