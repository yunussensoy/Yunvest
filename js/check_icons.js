const fs = require('fs');
console.log('Fixed:', fs.readFileSync('e:\\Yunvest\\js\\app_v44_fixed.js', 'utf8').includes('nakit-edit-btn'));
console.log('Final:', fs.readFileSync('e:\\Yunvest\\js\\app_v44_final.js', 'utf8').includes('nakit-edit-btn'));
console.log('app_v45:', fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8').includes('nakit-edit-btn'));
