const fs = require('fs');
const txt = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');
const match = txt.match(/<table[^>]*id="takip-table"[^>]*>[\s\S]*?<\/table>/);
if(match) {
    console.log(match[0]);
} else {
    console.log("Not found");
}

const match2 = txt.match(/window\.renderHisseIslemleri[\s\S]*?<\/table>/);
if (match2) {
    console.log("\n\n--- Hisse Islemleri ---");
    console.log(match2[0].slice(-200)); // Just show the table part
}
