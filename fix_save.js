const fs = require('fs');
let data = fs.readFileSync('e:/Yunvest/yunvest/js/app_v53.js', 'utf8');

// Fix notText deletion
if (!data.includes("const notText = (document.getElementById('analiz-not')")) {
    data = data.replace(
        /const tarih = \(document\.getElementById\('analiz-tarih'\) \? document\.getElementById\('analiz-tarih'\)\.value\.trim\(\) : ''\);\r?\n\s*const hisse = \(document\.getElementById\('analiz-hisse'\)/,
        "const tarih = (document.getElementById('analiz-tarih') ? document.getElementById('analiz-tarih').value.trim() : '');\n    const notText = (document.getElementById('analiz-not') ? document.getElementById('analiz-not').value.trim() : '');\n    const hisse = (document.getElementById('analiz-hisse')"
    );
}

// Fix isKisiselNot undefined assignment
data = data.replace(
    /isKisiselNot = \(borsaci === 'Yunus Şensoy' \|\| \(window\.currentUser && borsaci === window\.currentUser\.displayName\)\);/g,
    "isKisiselNot = !!(borsaci === 'Yunus Şensoy' || (window.currentUser && borsaci === window.currentUser.displayName));"
);

fs.writeFileSync('e:/Yunvest/yunvest/js/app_v53.js', data);
console.log('Fixed successfully');
