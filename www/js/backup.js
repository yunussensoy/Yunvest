const fs = require('fs');
const path = require('path');

const backupDir = 'e:\\Yunvest\\Yedekler';
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
const filesToBackup = ['index.html', 'js/app_v45.js', 'css/styles.css'];

filesToBackup.forEach(file => {
    const src = path.join('e:\\Yunvest', file);
    if (fs.existsSync(src)) {
        const basename = path.basename(file, path.extname(file));
        const ext = path.extname(file);
        const dest = path.join(backupDir, `_`);
        fs.copyFileSync(src, dest);

        // Eski yedekleri temizle (son 2 yedeði tut)
        const backups = fs.readdirSync(backupDir)
            .filter(f => f.startsWith(basename + '_') && f.endsWith(ext))
            .map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtime.getTime() }))
            .sort((a, b) => b.time - a.time);

        if (backups.length > 2) {
            for (let i = 2; i < backups.length; i++) {
                fs.unlinkSync(path.join(backupDir, backups[i].name));
            }
        }
    }
});
console.log('Sistem yedeði baþarýyla alýndý ve eski yedekler temizlendi!');
