const fs = require('fs');
const filePath = 'js/app_v45.js';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Replace save()
const targetStart1 = "    save() {";
const targetEnd1 = "    // TAKİP LİSTESİ";
let startIdx1 = code.indexOf(targetStart1);
let endIdx1 = code.indexOf(targetEnd1, startIdx1);

if (startIdx1 !== -1 && endIdx1 !== -1) {
    const replacement1 = `    save() {
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
    code = code.substring(0, startIdx1) + replacement1 + code.substring(endIdx1);
} else {
    console.log("Failed to find save target");
}

// 2. Add UI to renderAyarlar
const targetHtmlStart = "        </div>\\n    `;";
const targetHtmlEnd = "    db.collection('users').doc(currentUser.uid).get().then(doc => {";
let idx2 = code.indexOf(targetHtmlStart);
if (idx2 !== -1) {
    const replacementHtml = `                <div style="height: 1px; background: var(--surface-border); margin: 2rem 0;"></div>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <h3 style="margin-bottom: 0.5rem; color: var(--text-primary); font-size: 1.1rem;"><i class="fas fa-database"></i> Veri Yedekleme ve Kurtarma</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.4;">Tüm hisse notlarınızı, değerlemelerinizi ve portföy geçmişinizi güvence altına almak için verilerinizi bilgisayarınıza indirebilirsiniz.</p>
                    <button class="btn" style="background: #28a745; display: flex; align-items: center; justify-content: center; gap: 0.5rem;" onclick="window.downloadBackup()"><i class="fas fa-download"></i> Tüm Verilerimi İndir (.json)</button>
                    
                    <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.4; margin-top: 1rem;">Daha önce indirdiğiniz bir yedeği sisteme yükleyerek tüm verilerinizi eski haline getirebilirsiniz. (Dikkat: Mevcut verilerinizin üzerine yazılır)</p>
                    <input type="file" id="backup-file-upload" accept=".json" style="display: none;" onchange="window.restoreBackup(event)">
                    <button class="btn" style="background: #ffc107; color: #000; display: flex; align-items: center; justify-content: center; gap: 0.5rem;" onclick="document.getElementById('backup-file-upload').click()"><i class="fas fa-upload"></i> Yedekten Geri Yükle</button>
                </div>
            </div>
        </div>
    \`;`;
    // using regex replace for first match
    code = code.replace(targetHtmlStart, replacementHtml);
} else {
    console.log("Failed to find html target");
}

// 3. Add window.downloadBackup and window.restoreBackup
const targetFuncs = "const renderHedef = (container) => {";
const replacementFuncs = `window.downloadBackup = () => {
    if (!State.data) return alert("İndirilecek veri bulunamadı.");
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(State.data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    const date = new Date().toISOString().split('T')[0];
    downloadAnchorNode.setAttribute("download", \`Yunvest_Yedek_\${date}.json\`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};

window.restoreBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!confirm("DİKKAT: Yüklediğiniz dosyadaki veriler, mevcut tüm verilerinizin (hisseler, notlar, portföy) üzerine yazılacaktır. Onaylıyor musunuz?")) {
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsed = JSON.parse(e.target.result);
            if (!parsed || typeof parsed !== 'object') throw new Error("Geçersiz format");
            
            State.data = parsed;
            State.save();
            alert("Yedek başarıyla yüklendi!");
            if (typeof renderPage === 'function') renderPage();
        } catch (err) {
            alert("Yedek dosyası okunamadı veya bozuk: " + err.message);
        }
        event.target.value = '';
    };
    reader.readAsText(file);
};

const renderHedef = (container) => {`;

code = code.replace(targetFuncs, replacementFuncs);

fs.writeFileSync(filePath, code, 'utf8');
console.log("Successfully applied all UI changes!");
