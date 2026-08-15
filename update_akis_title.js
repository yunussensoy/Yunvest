const fs = require('fs');
let content = fs.readFileSync('e:/Yunvest/yunvest/js/app_v53.js', 'utf8');

// Looking for: <div style="font-size: 13px; font-weight: normal; color: var(--text-primary); text-align: center;">Akış</div>
const targetString1 = 'font-size: 13px; font-weight: normal; color: var(--text-primary); text-align: center;">Ak';
const replaceString1 = 'font-size: 15px; font-weight: normal; color: var(--text-primary); text-align: center;">Ak';

let updatedContent = content.split(targetString1).join(replaceString1);

fs.writeFileSync('e:/Yunvest/yunvest/js/app_v53.js', updatedContent);
console.log('Replaced successfully');
