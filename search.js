const fs = require('fs');
const lines = fs.readFileSync('e:/Yunvest/yunvest/js/app_v53.js', 'utf8').split('\n');
for(let i=0; i<lines.length; i++) {
    if (lines[i].includes("activeTab === 'Akış'")) {
        console.log(i + ': ' + lines[i].trim());
    }
}
