const fs = require('fs');
let content = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');
const lines = content.split('\n');
for (let i=0; i<lines.length; i++) {
    if (lines[i].includes("if (currentPage !== 'hisse_detay') window.currentHisseTab =")) {
        lines[i] = "    if (currentPage !== 'hisse_detay') window.currentHisseTab = 'Özet Rapor';";
    }
}
fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', lines.join('\n'), 'utf8');