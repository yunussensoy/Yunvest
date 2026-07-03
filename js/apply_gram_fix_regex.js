const fs = require('fs');

const path = 'e:/Yunvest/js/app_v45.js';
let txt = fs.readFileSync(path, 'utf8');

const regex = /if\s*\(\s*usd\s*&&\s*ons\s*\)\s*\{\s*const\s*graPrice\s*=\s*\(ons\.d\[0\]\s*\*\s*usd\.d\[0\]\)\s*\/\s*31\.1035;\s*tData\['gram-altin'\]\s*=\s*\{\s*Selling:\s*graPrice\.toLocaleString\('tr-TR',\s*\{\s*minimumFractionDigits:\s*2,\s*maximumFractionDigits:\s*2\s*\}\),\s*Change:\s*null\s*\};\s*\}/g;

const replaceStr = `if (usd && ons) {
                    const graPrice = (ons.d[0] * usd.d[0]) / 31.1035;
                    const graChange = ((1 + ons.d[1]/100) * (1 + usd.d[1]/100) - 1) * 100;
                    tData['gram-altin'] = { Selling: graPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), Change: graChange };
                }`;

if (txt.match(regex)) {
    txt = txt.replace(regex, replaceStr);
    fs.writeFileSync(path, txt, 'utf8');
    console.log("Gram Altin change rate fixed successfully using regex!");
} else {
    console.log("Target string not found using regex!");
}
