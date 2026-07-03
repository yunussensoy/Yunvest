const fs = require('fs');
let app = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

app = app.replace(/if\(!this\.data\) this\.data = this\.load\(\) \|\| \{\};/g, "");

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', app, 'utf8');
console.log("✅ Removed invalid this.load()");
