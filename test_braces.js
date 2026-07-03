const fs = require('fs');
const code = fs.readFileSync('e:/Yunvest/js/app_v45.js', 'utf8');

// Use a simple bracket counter to see what level we are at line 2405
const lines = code.split('\n');
let level = 0;
for (let i = 0; i < 2445; i++) {
    const l = lines[i];
    if (!l) continue;
    // count { and }
    const opens = (l.match(/\{/g) || []).length;
    const closes = (l.match(/\}/g) || []).length;
    level += opens - closes;
    if (i >= 2400 && i <= 2442) {
        console.log(`Line ${i+1}: Level=${level} | ${l}`);
    }
}
