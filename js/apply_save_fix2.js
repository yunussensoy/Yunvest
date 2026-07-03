const fs = require('fs');
const filePath = 'js/app_v45.js';
let code = fs.readFileSync(filePath, 'utf8');

const targetStart = "    save() {";
const targetEnd = "    // TAKİP LİSTESİ";

let startIdx = code.indexOf(targetStart);
let endIdx = code.indexOf(targetEnd, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
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
    },

`;
    
    code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
    fs.writeFileSync(filePath, code, 'utf8');
    console.log("Successfully replaced save() using index search!");
} else {
    console.log("Target strings not found!");
}
