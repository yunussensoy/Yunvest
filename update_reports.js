const fs = require('fs');
const path = require('path');

const stockDataPath = path.join(__dirname, 'js', 'stock_data_compiled.js');
let content = fs.readFileSync(stockDataPath, 'utf8');

// Parse existing data
const mockWindow = {};
try {
    const fn = new Function('window', content);
    fn(mockWindow);
} catch (e) {
    console.error("Failed to parse existing stock_data_compiled.js:", e);
    process.exit(1);
}

if (!mockWindow.stockData) mockWindow.stockData = {};
if (!mockWindow.stockReports) mockWindow.stockReports = {};

// Prepare global window for excel_parser_v2.js
global.window = mockWindow;
const originalCwd = process.cwd;
process.cwd = () => __dirname;

try {
    require(path.join(__dirname, 'js', 'excel_parser_v2.js'));
} catch (e) {
    console.error("Failed to load excel_parser_v2.js", e);
}

const hisselerDir = path.join(__dirname, 'Hisseler');
const reports = {};

const hisseler = fs.readdirSync(hisselerDir);
hisseler.forEach(hisse => {
    const hissePath = path.join(hisselerDir, hisse);
    if (fs.statSync(hissePath).isDirectory()) {
        // PDF Reports
        const files = fs.readdirSync(hissePath).filter(f => f.endsWith('.pdf'));
        reports[hisse] = files;
        
        // Excel Data Parsing
        const excelPath = path.join(hissePath, 'bilanco.xlsx');
        if (fs.existsSync(excelPath)) {
            if (global.window.parseExcelData) {
                const success = global.window.parseExcelData(hisse);
                if (success) {
                    console.log(`Parsed Excel for ${hisse}`);
                } else {
                    console.log(`Failed to parse Excel for ${hisse}`);
                }
            }
        }
    }
});

// Restore cwd
process.cwd = originalCwd;

mockWindow.stockReports = reports;

// Serialize back
const newContent = `window.stockData = ${JSON.stringify(mockWindow.stockData, null, 2)};\nwindow.stockReports = ${JSON.stringify(mockWindow.stockReports, null, 2)};\n`;

fs.writeFileSync(stockDataPath, newContent, 'utf8');
console.log("Updated stock_data_compiled.js with dynamic reports and Excel data.");
