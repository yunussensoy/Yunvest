const fs = require('fs');
const path = require('path');

const backupDir = 'e:\\Yunvest\\Yedekler';
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
const filesToBackup = ['index.html', 'js/app_v45.js', 'css/index.css'];

filesToBackup.forEach(file => {
    const src = path.join('e:\\Yunvest', file);
    if (fs.existsSync(src)) {
        const dest = path.join(backupDir, `${path.basename(file, path.extname(file))}_${dateStr}${path.extname(file)}`);
        fs.copyFileSync(src, dest);
    }
});
console.log('Sistem yedeği başarıyla alındı!');
