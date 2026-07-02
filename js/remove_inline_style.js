const fs = require('fs');
let content = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

// Clean up the inline style I added earlier
content = content.replace(/<style>#takip-table th, #takip-table td \{ padding: 2px 6px !important; height: auto !important; \}<\/style>\s*/g, '');

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', content, 'utf8');
console.log("Removed inline style injection.");
