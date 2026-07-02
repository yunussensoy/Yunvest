const fs = require('fs');
let content = fs.readFileSync('e:\\Yunvest\\js\\app_v44_final.js', 'utf8');
let enflasyonIndex = content.indexOf('<!-- Enflasyon -->');
console.log(content.substring(enflasyonIndex - 50, enflasyonIndex + 500));
