const fs = require('fs');
const txt = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');
const start = txt.indexOf('<h1 style="margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: 1px; color: #fff;">${selectedHisse}</h1>');
if (start !== -1) {
    console.log(txt.substring(Math.max(0, start - 300), start + 800));
}
