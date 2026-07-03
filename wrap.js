const fs = require('fs');
let code = fs.readFileSync('js/app_v45.js', 'utf8');
if (!code.startsWith('try {')) {
    code = `try {\n${code}\n} catch(e) {\n  const errDiv = document.createElement('div');\n  errDiv.style.color = 'white'; errDiv.style.background = 'blue'; errDiv.style.padding = '10px'; errDiv.style.position = 'fixed'; errDiv.style.top = '150px'; errDiv.style.zIndex = '9999';\n  errDiv.innerText = 'REAL ERROR: ' + e.message + ' | ' + e.stack;\n  document.body.appendChild(errDiv);\n}`;
    fs.writeFileSync('js/app_v45.js', code);
}
