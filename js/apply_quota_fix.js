const fs = require('fs');
let code = fs.readFileSync('e:/Yunvest/js/app_v45.js', 'utf8');
code = code.replace(
    "localStorage.setItem('borsa_app_data', JSON.stringify(this.data));",
    "try { localStorage.setItem('borsa_app_data', JSON.stringify(this.data)); } catch(e) { console.warn('Quota exceeded, clearing backups'); for(let i=1; i<=4; i++) localStorage.removeItem('borsa_app_data_backup_'+i); localStorage.setItem('borsa_app_data', JSON.stringify(this.data)); }"
);
fs.writeFileSync('e:/Yunvest/js/app_v45.js', code, 'utf8');
console.log('Quota fix applied!');
