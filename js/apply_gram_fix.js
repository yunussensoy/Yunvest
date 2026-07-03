const fs = require('fs');

const path = 'e:/Yunvest/js/app_v45.js';
let txt = fs.readFileSync(path, 'utf8');

const searchStr = `                if (usd && ons) {
                    const graPrice = (ons.d[0] * usd.d[0]) / 31.1035;
                    tData['gram-altin'] = { Selling: graPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), Change: null };
                }`;

const replaceStr = `                if (usd && ons) {
                    const graPrice = (ons.d[0] * usd.d[0]) / 31.1035;
                    const graChange = ((1 + ons.d[1]/100) * (1 + usd.d[1]/100) - 1) * 100;
                    tData['gram-altin'] = { Selling: graPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), Change: graChange };
                }`;

if (txt.includes(searchStr)) {
    txt = txt.replace(searchStr, replaceStr);
    fs.writeFileSync(path, txt, 'utf8');
    console.log("Gram Altin change rate fixed successfully!");
} else {
    console.log("Target string not found!");
}
