const fs = require('fs');
const path = 'index.html';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(/app_v45\.js\?v=\d+/, 'app_v45.js?v=50');
fs.writeFileSync(path, code);
console.log("Updated index.html to v=50");
