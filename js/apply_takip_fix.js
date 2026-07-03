const fs = require('fs');

const path = 'e:/Yunvest/js/app_v45.js';
let txt = fs.readFileSync(path, 'utf8');

// 1. Remove the icon from Takip Listesi
const searchIcon = '<div class="table-header" style="font-size:1.2rem; display:flex; align-items:center; gap:0.5rem;"><i class="fas fa-list" style="color:var(--accent-color);"></i> Takip Listesi</div>';
const replaceIcon = '<div class="table-header" style="font-size:1.2rem; display:flex; align-items:center; gap:0.5rem;">Takip Listesi</div>';

if (txt.includes(searchIcon)) {
    txt = txt.replace(searchIcon, replaceIcon);
    console.log("Icon removed successfully!");
} else {
    console.log("Icon text not found!");
}

// 2. Fix localStorage QuotaExceededError by splitting the try-catch
const searchSave = `        // 2. Time-Based Local Backups
        try {
            localStorage.setItem('borsa_app_data', JSON.stringify(this.data));
            
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
            
            // Daily backup (overwrites if same day)
            localStorage.setItem(\`borsa_app_backup_\${dateStr}\`, JSON.stringify(this.data));
            
            // Maintain a rolling list of last 10 days
            let dailyKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('borsa_app_backup_20')) {
                    dailyKeys.push(key);
                }
            }
            dailyKeys.sort().reverse(); // Newest first
            if (dailyKeys.length > 10) {
                for (let i = 10; i < dailyKeys.length; i++) {
                    localStorage.removeItem(dailyKeys[i]);
                }
            }
        } catch (e) {
            console.error('Backup error', e);
        }`;

const replaceSave = `        // 2. Main Local Storage Save
        try {
            localStorage.setItem('borsa_app_data', JSON.stringify(this.data));
        } catch (e) {
            console.error('Main LocalStorage save error', e);
            // If quota exceeded, try to clear old backups and save again
            try {
                let keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('borsa_app_backup_')) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(k => localStorage.removeItem(k));
                localStorage.setItem('borsa_app_data', JSON.stringify(this.data));
            } catch (err) {}
        }
        
        // 3. Time-Based Local Backups (separated to prevent breaking main save)
        try {
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            localStorage.setItem(\`borsa_app_backup_\${dateStr}\`, JSON.stringify(this.data));
            
            let dailyKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('borsa_app_backup_20')) {
                    dailyKeys.push(key);
                }
            }
            dailyKeys.sort().reverse();
            if (dailyKeys.length > 10) {
                for (let i = 10; i < dailyKeys.length; i++) {
                    localStorage.removeItem(dailyKeys[i]);
                }
            }
        } catch (e) {
            // Backup failed (likely quota), ignore.
            console.error('Backup error', e);
        }`;

if (txt.includes(searchSave)) {
    txt = txt.replace(searchSave, replaceSave);
    console.log("Save logic patched successfully!");
} else {
    console.log("Save logic not found!");
}

fs.writeFileSync(path, txt, 'utf8');
console.log("Done.");
