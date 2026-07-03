const fs = require('fs');
const filePath = 'js/app_v45.js';
let code = fs.readFileSync(filePath, 'utf8');

const targetStr = `            } else if (activeTab === 'Raporlar') {
                const fsN = require('fs');
                const pathN = require('path');
                let reportsDir = pathN.join(process.cwd(), 'Hisseler', selectedHisse);
                // Fallback to Hisse_Verileri if Hisseler doesn't exist
                if (!fsN.existsSync(reportsDir)) {
                    reportsDir = pathN.join(process.cwd(), 'Hisse_Verileri', selectedHisse);
                }
                
                let files = [];
                if (fsN.existsSync(reportsDir)) {
                    files = fsN.readdirSync(reportsDir).filter(f => f.toLowerCase().endsWith('.pdf') || f.toLowerCase().endsWith('.doc') || f.toLowerCase().endsWith('.docx') || f.toLowerCase().endsWith('.xlsx'));
                }
                
                if (files.length === 0) {
                    contentHtml += \`<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>Bu hisseye ait rapor bulunamadı.</p>
                    </div>\`;
                } else {
                    contentHtml += \`<div class="dash-card"><div class="dash-title">Mevcut Raporlar</div><ul style="list-style: none; padding: 0;">\`;
                    files.forEach(file => {
                        let filePath = 'Hisseler/' + selectedHisse + '/' + file;
                        if (!fsN.existsSync(pathN.join(process.cwd(), 'Hisseler', selectedHisse))) {
                            filePath = 'Hisse_Verileri/' + selectedHisse + '/' + file;
                        }
                        
                        let icon = 'fa-file-pdf';
                        if (file.toLowerCase().endsWith('.xlsx')) icon = 'fa-file-excel';
                        else if (file.toLowerCase().endsWith('.doc') || file.toLowerCase().endsWith('.docx')) icon = 'fa-file-word';
                        
                        contentHtml += \`<li style="margin-bottom: 0.5rem; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 4px;">
                            <a href="\${filePath}" target="_blank" style="color: #3498db; text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas \${icon}"></i> \${file}
                            </a>
                        </li>\`;
                    });
                    contentHtml += \`</ul></div>\`;
                }
            } else if (activeTab === 'Değerleme') {`;

const replacementStr = `            } else if (activeTab === 'Raporlar') {
                contentHtml += \`
                    <div id="raporlar-container" style="text-align:center; padding: 3rem 1rem;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 2.5rem; color: var(--accent-color); margin-bottom: 1rem;"></i>
                        <p style="color: var(--text-secondary); font-size: 1.1rem;">Raporlar taranıyor, lütfen bekleyin...</p>
                    </div>
                \`;
                setTimeout(() => { if (typeof window.loadRaporlar === 'function') window.loadRaporlar(selectedHisse); }, 0);
            } else if (activeTab === 'Değerleme') {`;

let idx = code.indexOf(targetStr);
if (idx !== -1) {
    code = code.replace(targetStr, replacementStr);
    
    // Add window.loadRaporlar at the end of the file
    const loadRaporlarCode = `
window.loadRaporlar = async (hisse) => {
    const container = document.getElementById('raporlar-container');
    if (!container) return;
    
    const possibleFiles = [
        'arastirma_raporu.pdf', 
        'faaliyet_raporu.pdf', 
        'finansal_rapor.pdf', 
        'toplanti_notlari.pdf', 
        'yatirimci_sunumu.pdf', 
        'fiyat_tespit_raporu.pdf'
    ];
    
    let foundFiles = [];
    
    // Check in 'Hisseler' folder
    for (const file of possibleFiles) {
        const url = \`Hisseler/\${hisse}/\${file}\`;
        try {
            const res = await fetch(url, { method: 'HEAD' });
            if (res.ok) foundFiles.push({ file, url });
        } catch(e) {}
    }
    
    // Fallback: Check in 'Hisse_Verileri' if none found in Hisseler
    if (foundFiles.length === 0) {
        for (const file of possibleFiles) {
            const url = \`Hisse_Verileri/\${hisse}/\${file}\`;
            try {
                const res = await fetch(url, { method: 'HEAD' });
                if (res.ok) foundFiles.push({ file, url });
            } catch(e) {}
        }
    }
    
    if (foundFiles.length === 0) {
        container.innerHTML = \`
            <div style="color: var(--text-secondary); text-align: center; padding: 2rem;">
                <i class="fas fa-exclamation-circle" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p style="font-size: 1.1rem;">Bu hisseye ait standart rapor dosyası bulunamadı.</p>
                <p style="font-size: 0.85rem; margin-top: 0.5rem; opacity: 0.7;">(Desteklenen İsimler: arastirma_raporu.pdf, faaliyet_raporu.pdf, finansal_rapor.pdf, toplanti_notlari.pdf, yatirimci_sunumu.pdf, fiyat_tespit_raporu.pdf)</p>
            </div>
        \`;
    } else {
        let html = \`<div class="dash-card" style="text-align:left; margin-bottom: 0;">
            <div class="dash-title" style="margin-bottom: 1rem;"><i class="fas fa-file-pdf" style="margin-right: 0.5rem; color: #e74c3c;"></i> Mevcut Raporlar</div>
            <ul style="list-style: none; padding: 0; margin: 0;">\`;
            
        foundFiles.forEach(f => {
            html += \`<li style="margin-bottom: 0.5rem; padding: 0.8rem 1rem; background: rgba(255,255,255,0.03); border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;">
                <a href="\${f.url}" target="_blank" style="color: #3498db; text-decoration: none; font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 0.8rem;">
                    <i class="fas fa-file-pdf" style="color: #e74c3c; font-size: 1.2rem;"></i> \${f.file}
                </a>
            </li>\`;
        });
        html += \`</ul></div>\`;
        
        container.innerHTML = html;
        container.style.padding = "0";
    }
};
`;
    code += loadRaporlarCode;

    fs.writeFileSync(filePath, code, 'utf8');
    console.log("Successfully replaced Raporlar logic!");
} else {
    console.log("Target not found!");
}
