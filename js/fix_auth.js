const fs = require('fs');
let content = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

// Disable Sign Up precisely
content = content.replace(/auth\.createUserWithEmailAndPassword\(email, password\)[\s\S]*?\.catch\(err => alert\(err\.message\)\);/g, 
`alert("Yeni üye alımı güvenlik nedeniyle kapatılmıştır.");
                btn.innerText = originalBtnText;
                btn.disabled = false;`);

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', content, 'utf8');
console.log("Signup disabled.");