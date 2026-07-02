const fs = require('fs');
let txt = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

// Nakit edit removal
const nakitSearch = /<button id="nakit-edit-btn"[\s\S]*?<\/form>/g;
txt = txt.replace(nakitSearch, '');

// Hedef edit removal
const hedefSearch = /<button id="hedef-edit-btn"[\s\S]*?<\/form>/g;
txt = txt.replace(hedefSearch, '');

// Make sure the span is just the span without space-between taking up weird space if button is gone
txt = txt.replace(/justify-content:space-between;/g, 'justify-content:flex-end;');

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', txt, 'utf8');
console.log("Removed inline edit icons and forms.");
