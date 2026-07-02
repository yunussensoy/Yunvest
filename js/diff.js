const fs = require('fs');
const txtFixed = fs.readFileSync('e:\\Yunvest\\js\\app_v44_fixed.js', 'utf8');
const txt45 = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

const getHisseler = (txt) => {
    const start = txt.indexOf('const renderHisseler = (container) => {');
    const nextFn = txt.indexOf('const renderPortfoy = (container) => {');
    return txt.substring(start, nextFn);
};

const histFixed = getHisseler(txtFixed);
const hist45 = getHisseler(txt45);

if (histFixed === hist45) {
    console.log("renderHisseler is EXACTLY the same in both files!");
} else {
    console.log("Differences found!");
    const linesFixed = histFixed.split('\n');
    const lines45 = hist45.split('\n');
    console.log('Lines in app_v44_fixed.js:', linesFixed.length);
    console.log('Lines in app_v45.js:', lines45.length);
    // Print first 5 different lines
    let diffs = 0;
    for(let i=0; i<Math.max(linesFixed.length, lines45.length); i++) {
        if(linesFixed[i] !== lines45[i]) {
            console.log(`Line ${i}:`);
            console.log(`Fixed: ${linesFixed[i]}`);
            console.log(`  v45: ${lines45[i]}`);
            diffs++;
            if(diffs >= 5) break;
        }
    }
}
