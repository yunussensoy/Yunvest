const fs = require('fs');
const content = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

const tables = content.match(/<table[^>]*>/g);
if (tables) {
    console.log(Array.from(new Set(tables)).join('\n'));
} else {
    console.log("No tables found.");
}
