const fs = require('fs');
let content = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

// 1. FIX ROUTING
const regex = /const validTabs = \[[^;]+\];\s*let activeTab = window\.currentHisseTab \|\| '[^']+';\s*if \(\!validTabs\.includes\(activeTab\)\) \{\s*activeTab = '[^']+';\s*window\.currentHisseTab = activeTab;\s*\}/;
const replacement = `const validTabs = ['Özet Rapor', 'Gelir Tablosu', 'Bilanço', 'Nakit Akım Tablosu', 'Raporlar', 'Değerleme', 'Likidite Oranları', 'Kaldıraç Oranları', 'Faaliyet Etkinlik Oranları', 'Karlılık Oranları', 'Diğer Kalemler', 'Finansal Rapor', 'Faaliyet Raporu', 'Yatırımcı Sunumu', 'Araştırma Raporu', 'Özet Rapor Notları', 'Hisse Notları'];
    let activeTab = window.currentHisseTab || 'Özet Rapor';
    if (!validTabs.includes(activeTab)) {
        activeTab = 'Özet Rapor';
        window.currentHisseTab = activeTab;
    }`;
content = content.replace(regex, replacement);
content = content.replace(/window\.currentHisseTab = '[^']+zet Rapor'/g, "window.currentHisseTab = 'Özet Rapor'");
const lines = content.split('\n');
for (let i=0; i<lines.length; i++) {
    if (lines[i].includes("if (currentPage !== 'hisse_detay') window.currentHisseTab =")) {
        lines[i] = "    if (currentPage !== 'hisse_detay') window.currentHisseTab = 'Özet Rapor';";
    }
}
content = lines.join('\n');

// 2. FIX AUTH
content = content.replace(/auth\.createUserWithEmailAndPassword\(email, password\)[\s\S]*?\.catch\(err => alert\(err\.message\)\);/g, 
`alert("Yeni üye alımı güvenlik nedeniyle kapatılmıştır.");
                btn.innerText = originalBtnText;
                btn.disabled = false;`);

// 3. FIX LAYOUT
let newLayout = `            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <!-- Nakit Düzenleme -->
                <div class="glass" style="flex: 1; padding: 8px 1rem; min-width: 200px;">
                    <h3 style="color: var(--accent-color); margin-bottom: 0.5rem; font-size: 1rem;">Mevcut Nakit Tutarı</h3>
                    <div style="display:flex; gap: 0.5rem;">
                        <input type="number" step="0.01" id="v-nakit-input" value="\${State.data.manuelNakitTutar || 0}" class="form-control" style="width:100%;">
                        <button class="btn btn-icon" style="color: var(--success-color); padding: 4px 8px; font-size: 16px;" onclick="State.data.manuelNakitTutar = parseFloat(document.getElementById('v-nakit-input').value) || 0; State.save(); alert('Kaydedildi!');" title="Kaydet"><i class="fas fa-save"></i></button>
                    </div>
                </div>
                <!-- Fon Fiyatları -->
                <div class="glass" style="flex: 1; padding: 8px 1rem; min-width: 200px;">
                    <h3 style="color: var(--accent-color); margin-bottom: 0.5rem; font-size: 1rem;">Fon Fiyatları</h3>
                    <div style="max-height: 150px; overflow-y: auto; padding-right: 0.5rem;">
                        \${fonHtml || '<p style="color:var(--text-secondary);">Portföyde fon bulunmuyor.</p>'}
                    </div>
                </div>
                <!-- Hedef Portföy -->
                <div class="glass" style="flex: 1; padding: 8px 1rem; min-width: 200px;">
                    <h3 style="color: var(--accent-color); margin-bottom: 0.5rem; font-size: 1rem;">Hedef Portföy</h3>
                    <div style="display:flex; gap: 0.5rem;">
                        <input type="number" step="1" id="v-hedef-input" value="\${hedefPortfoy}" class="form-control" style="width:100%;">
                        <button class="btn btn-icon" style="color: var(--success-color); padding: 4px 8px; font-size: 16px;" onclick="State.data.hedefPortfoyTL = parseFloat(document.getElementById('v-hedef-input').value) || 0; State.save(); alert('Kaydedildi!');" title="Kaydet"><i class="fas fa-save"></i></button>
                    </div>
                </div>
            </div>

            <!-- Rapor Yükle (Bulut) -->
            <div class="glass" style="padding: 8px 1rem; margin-top: 1rem;">
                <h3 style="color: var(--accent-color); margin-bottom: 0.5rem; font-size: 1rem;"><i class="fas fa-cloud-upload-alt"></i> Buluta Rapor Yükle</h3>
                <div style="display:flex; flex-direction:row; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
                    <input type="text" id="upload-hisse" placeholder="Hisse Kodu (Örn: THYAO)" class="form-control" style="flex: 1; min-width: 120px; text-transform: uppercase; padding: 0.3rem;">
                    <select id="upload-type" class="form-control" style="flex: 2; min-width: 150px; appearance: auto; padding: 0.3rem;">
                        <option value="">-- Rapor Türü Seçin --</option>
                        <option value="arastirma_raporu.pdf">Araştırma Raporu</option>
                        <option value="faaliyet_raporu.pdf">Faaliyet Raporu</option>
                        <option value="finansal_rapor.pdf">Finansal Rapor</option>
                        <option value="toplanti_notlari.pdf">Toplantı Notları</option>
                        <option value="yatirimci_sunumu.pdf">Yatırımcı Sunumu</option>
                        <option value="fiyat_tespit_raporu.pdf">Fiyat Tespit Raporu</option>
                    </select>
                    <input type="file" id="upload-file" accept="application/pdf" class="form-control" style="flex: 2; min-width: 180px; padding: 0.3rem; cursor: pointer;">
                    <button class="btn" style="background: var(--accent-color); flex: 1; min-width: 80px; padding: 0.3rem;" onclick="window.uploadRapor()">Yükle</button>
                    <div id="upload-status" style="font-size: 13px; font-weight: 500; min-height: 10px; width: 100%;"></div>
                </div>
            </div>

            <!-- Enflasyon -->
            <div class="glass" style="padding: 8px 1rem; margin-top: 1rem;">`;

let hedefPortfoyIndex = content.indexOf('<!-- Hedef Portf');
if (hedefPortfoyIndex !== -1) {
    let startTag = '<div style="display: flex; gap: 1rem; flex-wrap: wrap;">';
    let startIndex = content.lastIndexOf(startTag, hedefPortfoyIndex);
    let enflasyonIndex = content.indexOf('<!-- Enflasyon -->', startIndex);
    let glassIndex = content.indexOf('<div class="glass" style="padding: 2rem;">', enflasyonIndex);
    if (startIndex !== -1 && glassIndex !== -1) {
        let endIndex = glassIndex + '<div class="glass" style="padding: 2rem;">'.length;
        let before = content.substring(0, startIndex);
        let after = content.substring(endIndex);
        content = before + newLayout + after;
        console.log("Layout applied!");
    } else {
        console.log("Layout replace failed to find tags.");
    }
} else {
    console.log("Layout replace failed to find Hedef Portfoy.");
}

// 4. FIX TAKIP TABLE PADDING (the thing I fixed earlier)
const targetButton = `<button class="btn btn-icon" style="color: var(--danger-color);" onclick="window.removeHisseFromTakip('\${hisse}')">`;
const fixedButton = `<button class="btn btn-icon" style="color: var(--danger-color); padding: 0.1rem 0.3rem;" onclick="window.removeHisseFromTakip('\${hisse}')">`;
content = content.replace(targetButton, fixedButton);

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', content, 'utf8');
console.log("All fixes applied successfully.");
