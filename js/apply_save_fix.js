const fs = require('fs');
const filePath = 'js/app_v45.js';
let code = fs.readFileSync(filePath, 'utf8');

const target = `    save() {
        if (this.data) {
            this.data.lastUpdated = Date.now();
            // ROLLING BACKUP SYSTEM
            try {
                for (let i = 4; i >= 1; i--) {
                    const prev = localStorage.getItem(\`borsa_app_data_backup_\${i}\`);
                    if (prev) localStorage.setItem(\`borsa_app_data_backup_\${i+1}\`, prev);
                }
                const currentLocal = localStorage.getItem('borsa_app_data');
                if (currentLocal) localStorage.setItem('borsa_app_data_backup_1', currentLocal);
            } catch (e) {
                console.error('Backup error', e);
            }
            
            localStorage.setItem('borsa_app_data', JSON.stringify(this.data));

            // FILE SYSTEM BACKUP (ABSOLUTELY BULLETPROOF)
            try {
                if (typeof require !== 'undefined') {
                    const fs = require('fs');
                    const path = require('path');
                    const backupPath = path.join(__dirname, 'robust_backup.json');
                    fs.writeFileSync(backupPath, JSON.stringify(this.data));
                }
            } catch (fsErr) {
                console.error("FS backup error:", fsErr);
            }
        }
        if (!currentUser || !this.data) return;
        db.collection('app_data').doc(currentUser.uid).set(this.data);
    },`;

const replacement = `    save() {
        if (!this.data) return;
        
        // 1. Data Integrity Check (Sanity Check)
        const getScore = (parsed) => {
            if (!parsed) return -1;
            return (parsed.takipListesi ? parsed.takipListesi.length : 0) +
                   (parsed.ekstre ? parsed.ekstre.length : 0) +
                   (parsed.hedefFiyatlar ? Object.keys(parsed.hedefFiyatlar).length : 0) +
                   (parsed.hisseNotlari ? Object.keys(parsed.hisseNotlari).length : 0) +
                   (parsed.analizler ? parsed.analizler.length : 0);
        };

        const newScore = getScore(this.data);
        
        try {
            const currentLocal = localStorage.getItem('borsa_app_data');
            if (currentLocal) {
                const oldData = JSON.parse(currentLocal);
                const oldScore = getScore(oldData);
                
                // If the new data drops by more than 80% and the old score was significant, prevent save!
                if (oldScore > 10 && newScore < (oldScore * 0.2)) {
                    console.error("CATASTROPHIC DATA WIPE PREVENTED! Old Score:", oldScore, "New Score:", newScore);
                    if (window.alert) alert("Uyarı: Çok büyük miktarda veri silinmesi algılandı. Veri güvenliği için bu işlem kaydedilmedi. Lütfen sayfayı yenileyin.");
                    return; 
                }
            }
        } catch(e) {}

        this.data.lastUpdated = Date.now();
        
        // 2. Time-Based Local Backups
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
        }

        if (!currentUser) return;
        
        // 3. Firebase Save and Snapshot History
        db.collection('app_data').doc(currentUser.uid).set(this.data)
            .then(() => {
                // Save a daily snapshot to a history subcollection
                const dateStr = new Date().toISOString().split('T')[0];
                db.collection('app_data').doc(currentUser.uid)
                  .collection('history').doc(dateStr).set(this.data)
                  .catch(err => console.error("History snapshot failed", err));
            })
            .catch(err => console.error("Firebase save failed", err));
    },`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync(filePath, code, 'utf8');
    console.log("Successfully replaced save()!");
} else {
    console.log("Target not found!");
}
