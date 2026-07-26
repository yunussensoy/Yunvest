const fs = require('fs');

const raw = fs.readFileSync('js/stock_data_compiled.js', 'utf8');
// Evaluate it safely by mocking window
const sandbox = { window: {} };
const script = new (require('vm').Script)(raw);
script.runInNewContext(sandbox);

let stockData = sandbox.window.stockData;

for (let hisse in stockData) {
    let dataObj = stockData[hisse];
    for (let key in dataObj) {
        if (!dataObj[key] || !dataObj[key].headers) continue;
        
        let rawHeaders = dataObj[key].headers;
        let numPeriods = rawHeaders.length - 1;
        
        let maxYear = 0;
        for (let i = 1; i <= numPeriods; i++) {
            const h = rawHeaders[i];
            if (h) {
                const parts = h.split('/');
                if (parts.length > 0) {
                    const year = parseInt(parts[0], 10);
                    if (!isNaN(year) && year > maxYear) maxYear = year;
                }
            }
        }
        
        const cutoffYear = maxYear > 0 ? maxYear - 5 : 0;
        let keepIndices = [0];
        for (let i = 1; i <= numPeriods; i++) {
            const h = rawHeaders[i];
            if (h) {
                const parts = h.split('/');
                if (parts.length > 0) {
                    const year = parseInt(parts[0], 10);
                    if (!isNaN(year)) {
                        if (year >= cutoffYear) keepIndices.push(i);
                    } else {
                        keepIndices.push(i);
                    }
                } else {
                    keepIndices.push(i);
                }
            } else {
                keepIndices.push(i);
            }
        }
        
        let newHeaders = [];
        for (let i of keepIndices) {
            newHeaders.push(rawHeaders[i]);
        }
        dataObj[key].headers = newHeaders;
        
        let newRows = [];
        for (let row of dataObj[key].rows) {
            if (!row) continue;
            let newRow = [row[0]];
            for (let j = 1; j < keepIndices.length; j++) {
                let cIdx = keepIndices[j];
                newRow.push(row[cIdx]);
            }
            newRows.push(newRow);
        }
        dataObj[key].rows = newRows;
    }
}

fs.writeFileSync('js/stock_data_compiled.js', 'window.stockData = ' + JSON.stringify(stockData, null, 2) + ';');
console.log('Filtered stock_data_compiled.js successfully!');
