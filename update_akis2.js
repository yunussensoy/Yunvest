const fs = require('fs');
const file = 'e:/Yunvest/yunvest/js/app_v53.js';
let d = fs.readFileSync(file, 'utf8');

const saveUnifiedLogic = `
window.saveUnifiedAnaliz = async () => {
    const fileInput = document.getElementById('upload-file');
    const status = document.getElementById('upload-status');
    const baslik = (document.getElementById('analiz-baslik') ? document.getElementById('analiz-baslik').value.trim() : '');
    const baglanti = (document.getElementById('analiz-baglanti') ? document.getElementById('analiz-baglanti').value.trim() : '');
    const borsaci = (document.getElementById('analiz-borsaci') ? document.getElementById('analiz-borsaci').value.trim() : '');
    const tarih = (document.getElementById('analiz-tarih') ? document.getElementById('analiz-tarih').value.trim() : '');
    const notText = (document.getElementById('analiz-not') ? document.getElementById('analiz-not').value.trim() : '');
    const hisse = (document.getElementById('analiz-hisse') ? document.getElementById('analiz-hisse').value.trim().toUpperCase() : (State.ui.selectedHisse || ''));

    const isKisiselNot = (borsaci === 'Yunus Şensoy' || (window.currentUser && borsaci === window.currentUser.displayName));

    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        if (!hisse) {
            if (status) { status.style.display = 'block'; status.style.color = 'var(--danger-color)'; status.innerText = 'Lütfen Hisse kodunu doldurun.'; }
            return;
        }
        if (status) { status.style.display = 'block'; status.style.color = 'var(--text-primary)'; status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GitHub\\'a yükleniyor...'; }

        const file = fileInput.files[0];
        const toBase64 = (f) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(f);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });

        try {
            const base64Content = await toBase64(file);
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileContent: base64Content, fileName: file.name, hisse: hisse })
            });

            if (response.ok) {
                if (status) { status.style.color = 'var(--success-color)'; status.innerText = 'Başarıyla yüklendi!'; }
                if (!window.stockReports) window.stockReports = {};
                if (!window.stockReports[hisse]) window.stockReports[hisse] = [];
                window.stockReports[hisse].push({
                    name: baslik || file.name,
                    tarih: tarih || '-',
                    company: borsaci || '-',
                    file: file.name
                });
                
                fileInput.value = '';
                if(fileInput.previousElementSibling) {
                    fileInput.previousElementSibling.innerHTML = '<span class="fa-stack" style="font-size: 8px; width: 2em; height: 2em;"><i class="fas fa-folder-open fa-stack-2x" style="color: #ffffff;"></i></span><span style="margin-left: 5px;">PDF Seç</span>';
                }
                
                if (typeof renderPage === 'function') renderPage();
            } else {
                const errText = await response.text();
                if (status) { status.style.color = 'var(--danger-color)'; status.innerText = 'Hata: ' + errText; }
            }
        } catch (error) {
            console.error('Yükleme hatası:', error);
            if (status) { status.style.color = 'var(--danger-color)'; status.innerText = 'Yükleme sırasında hata oluştu.'; }
        }
    } else {
        if (isKisiselNot) {
            if (!notText || !hisse) { alert('Lütfen Hisse ve Notlar alanlarını doldurun.'); return; }
        } else {
            if (!tarih || !borsaci || !hisse) { alert('Lütfen Tarih, Analist/Şirket ve Hisse alanlarını doldurun.'); return; }
        }

        if (!State.data.analizler) State.data.analizler = [];

        if (window.currentEditingAnalizId) {
            const index = State.data.analizler.findIndex(a => String(a.id) === String(window.currentEditingAnalizId));
            if (index !== -1) {
                State.data.analizler[index] = { ...State.data.analizler[index], tarih, borsaci, hisse, baslik, baglanti, notText, isKisiselNot };
            }
            window.currentEditingAnalizId = null;
        } else {
            State.data.analizler.push({ tarih, borsaci, hisse, baslik, baglanti, notText, isKisiselNot, id: Date.now() });
        }
        
        if(document.getElementById('analiz-baslik')) document.getElementById('analiz-baslik').value = '';
        if(document.getElementById('analiz-baglanti')) document.getElementById('analiz-baglanti').value = '';
        if(document.getElementById('analiz-borsaci')) document.getElementById('analiz-borsaci').value = '';
        if(document.getElementById('analiz-not')) document.getElementById('analiz-not').value = '';
        
        State.save();
        if (typeof renderPage === 'function') renderPage();
    }
};

`;

if (!d.includes('window.saveUnifiedAnaliz =')) {
    d = d.replace('window.addAnaliz = () => {', saveUnifiedLogic + 'window.addAnaliz = () => {');
}

const htmlToReplace = \`                      <div id="inline-analiz-row" class="glass" style="display: none; flex-direction: column; gap: 1rem; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid var(--accent-color);">
    <input type="hidden" id="analiz-hisse" value="\${selectedHisse || ''}">
    
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <!-- 1. Başlık -->
        <div style="flex: 1.5; min-width: 200px;">
            <label style="font-size: 0.8rem; color: #cccccc;">Başlık</label>
            <input type="text" id="analiz-baslik" class="form-control" style="width:100%;" placeholder="Not/Rapor/Video Başlığı">
        </div>
        
        <!-- 2. Link -->
        <div style="flex: 2; min-width: 250px;">
            <label style="font-size: 0.8rem; color: #cccccc;">Link (Opsiyonel)</label>
            <input type="text" id="analiz-baglanti" class="form-control" style="width:100%;" placeholder="https://...">
        </div>
        
        <!-- 3. Dosya Ekle -->
        <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column;">
            <label style="font-size: 0.8rem; color: #cccccc;">Dosya Ekle (Opsiyonel)</label>
            <style>
                #upload-file { display: none; }
            </style>
            <label for="upload-file" class="upload-file-label" title="Bir Dosya Seç" style="padding: 3px 7px 3px 4px; background: #000000; color: #ffffff; display: flex; align-items: center; justify-content: center; border-radius: 4px; cursor: pointer; border: none; font-size: 12px; font-weight: normal; margin-top: 2px;">
                <span class="fa-stack" style="font-size: 8px; width: 2em; height: 2em;"><i class="fas fa-folder-open fa-stack-2x" style="color: #ffffff;"></i></span>
                <span style="margin-left: 5px;">PDF Seç</span>
            </label>
            <input type="file" id="upload-file" accept="application/pdf" onchange="const f = this.files[0]; if(f) this.previousElementSibling.innerHTML = '<i class=\\'fas fa-file-pdf\\' style=\\'color:var(--danger-color); font-size: 14px;\\'></i> <span style=\\'color: #fff; margin-left: 5px; font-size:11px;\\'>' + (f.name.length > 15 ? f.name.substring(0,15)+'...' : f.name) + '</span>'">
        </div>
        
        <!-- 4. Analist/Şirket -->
        <div style="flex: 1; min-width: 150px;">
            <label style="font-size: 0.8rem; color: #cccccc;">Analist/Şirket</label>
            <input type="text" id="analiz-borsaci" list="analiz-borsaci-list" class="form-control" style="width:100%;" placeholder="Örn: Ak Yatırım">
        </div>
        
        <!-- 5. Tarih -->
        <div style="flex: 1; min-width: 120px;">
            <label style="font-size: 0.8rem; color: #cccccc;">Tarih</label>
            <input type="date" id="analiz-tarih" class="form-control" style="width:100%; color-scheme: dark;" value="\${today}">
        </div>
    </div>
    
    <!-- 6. Notunuz -->
    <div style="display: flex; flex-direction: column; width: 100%;">
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <label style="font-size: 0.8rem; color: #cccccc;">Notunuz</label>
            <textarea id="analiz-not" class="form-control" style="width:100%; min-height: 50px; resize: vertical;" placeholder="Notlarınızı buraya yazın..."></textarea>
        </div>
        
        <div id="upload-status" style="font-size: 12px; font-weight: normal; min-height: 0; width: 100%; margin-top: 0.5rem; display: none;"></div>
        
        <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 0.5rem;">
            <button class="btn" style="background: var(--danger-color); color: #fff; padding: 6px 16px;" onclick="window.toggleInlineAnaliz()">İptal</button>
            <button class="btn" style="background: var(--success-color); color: #fff; padding: 6px 16px;" onclick="window.saveUnifiedAnaliz()">Kaydet</button>
        </div>
    </div>
</div>
                      <div class="table-container custom-scroll" style="overflow-x: auto; overflow-y: auto; height: calc(100vh - 240px);">
                      <table class="dash-table compact-table" style="width:100%; min-width:800px; border-collapse:collapse;">
                          <thead style="position: sticky; top: 0; z-index: 10; background: var(--table-header-bg);">
                            <tr style="border-bottom:1px solid var(--table-border); background:var(--table-header-bg);">
                                <th style="font-size:12px; font-weight:normal; color:var(--text-primary); text-align:center !important; padding:8px 5px; vertical-align:middle; width:1%; white-space:nowrap;">S.N.</th>
                                <th style="font-size:12px; font-weight:normal; color:var(--text-primary); text-align:center !important; padding:8px 5px; vertical-align:middle; width:1%; white-space:nowrap;">Platform</th>
                                <th style="font-size:12px; font-weight:normal; color:var(--text-primary); text-align:left !important; padding:8px 5px; vertical-align:middle; width:200px; max-width:200px; white-space:normal !important; word-break:break-word;">Başlık</th>
                                <th style="font-size:12px; font-weight:normal; color:var(--text-primary); text-align:center !important; padding:8px 5px; vertical-align:middle; width:1%; white-space:nowrap;">Tarih</th>
                                <th style="font-size:12px; font-weight:normal; color:var(--text-primary); text-align:left !important; padding:8px 5px; vertical-align:middle; width:1%; white-space:nowrap;">Analist/Şirket</th>
                                <th style="font-size:12px; font-weight:normal; color:var(--text-primary); text-align:left !important; padding:8px 5px; vertical-align:middle;">Notlar</th>
                                <th style="font-size:12px; font-weight:normal; color:var(--text-primary); text-align:center !important; padding:8px 5px; vertical-align:middle; width:1%; white-space:nowrap;">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                \`;

                if (unifiedList.length === 0) {
                    tableHtml += \`<tr><td colspan="7" style="text-align: center; padding: 2rem; opacity: 0.5;">Henüz akış verisi bulunmuyor.</td></tr>\`;
                } else {
                    let sn = 1;
                    unifiedList.forEach(item => {
                        if (item.type === 'report') {
                            const r = item.data;
                            let filePath = 'Hisseler/' + selectedHisse + '/' + r.file;
                            tableHtml += \`
                            <tr style="border-bottom:1px solid var(--table-border); background: var(--table-row-bg);">
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:center !important; padding:8px 5px; vertical-align:top !important; width:1%; white-space:nowrap;">\${sn++}</td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:center !important; padding:8px 5px; vertical-align:top !important; width:1%; white-space:nowrap;">
                                    <i class="fas fa-file-pdf" style="color: #3b82f6; font-size: 16px;"></i>
                                </td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:left !important; padding:8px 5px; vertical-align:top !important; width:200px; max-width:200px; white-space:normal !important; word-break:break-word;">
                                    <a href="\${filePath}" target="_blank" style="color:#cccccc; text-decoration: none; font-weight: normal; word-break: break-word; transition: color 0.2s;" onmouseover="this.style.color='#ffffff';" onmouseout="this.style.color='#cccccc';">
                                        \${r.name !== '-' && r.name ? r.name : r.file}
                                    </a>
                                </td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:center !important; padding:8px 5px; vertical-align:top !important; width:1%; white-space:nowrap;">\${item.gosterimTarih}</td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:left !important; padding:8px 5px; vertical-align:top !important; width:1%; white-space:nowrap;">\${r.company !== '-' ? r.company : '-'}</td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:left !important; padding:8px 5px; vertical-align:top !important; white-space:pre-wrap;">-</td>
                                <td style="padding:8px 5px; text-align:center !important; vertical-align:top !important; width:1%; white-space:nowrap;">
                                    <button class="btn btn-icon" style="background: transparent; color: #888888; padding: 2px !important; font-size: 14px; border: none;" onclick="window.deleteAnaliz('\${r.id || r.file}')" title="Sil"><i class="fas fa-trash-alt"></i></button>
                                </td>
                            </tr>
                            \`;
                        } else {
                            const a = item.data;
                            let platformIcon = '<i class="fas fa-sticky-note" style="color: #888; font-size: 16px;"></i>';
                            let titleText = a.baslik || '-';
                            let titleLinkHtml = titleText;
                            
                            if (a.baglanti) {
                                let iconStr = 'fas fa-external-link-alt" style="color: #888; font-size: 16px;';
                                if (a.baglanti.includes('youtube.com') || a.baglanti.includes('youtu.be')) { 
                                    iconStr = 'fab fa-youtube" style="color:#FF0000; font-size: 16px;'; 
                                } else if (a.baglanti.includes('twitter.com') || a.baglanti.includes('x.com')) { 
                                    iconStr = 'fa-brands fa-x-twitter" style="color: var(--text-primary); font-size: 16px;'; 
                                }
                                platformIcon = \`<i class="\${iconStr}"></i>\`;
                                titleLinkHtml = \`<a href="\${a.baglanti}" target="_blank" style="color:#cccccc; text-decoration: none; word-break: break-word; transition: color 0.2s;" onmouseover="this.style.color='#ffffff';" onmouseout="this.style.color='#cccccc';">\${titleText}</a>\`;
                            } else if (a.isKisiselNot) {
                                platformIcon = '<i class="fas fa-user-edit" style="color: var(--accent-color); font-size: 16px;"></i>';
                            }
                            
                            tableHtml += \`
                            <tr style="border-bottom:1px solid var(--table-border); background: var(--table-row-bg);">
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:center !important; padding:8px 5px; vertical-align:top !important; width:1%; white-space:nowrap;">\${sn++}</td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:center !important; padding:8px 5px; vertical-align:top !important; width:1%; white-space:nowrap;">\${platformIcon}</td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:left !important; padding:8px 5px; vertical-align:top !important; width:200px; max-width:200px; white-space:normal !important; word-break:break-word;">\${titleLinkHtml}</td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:center !important; padding:8px 5px; vertical-align:top !important; width:1%; white-space:nowrap;">\${item.gosterimTarih}</td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:left !important; padding:8px 5px; vertical-align:top !important; width:1%; white-space:nowrap;">\${a.borsaci || '-'}</td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:left !important; padding:8px 5px; vertical-align:top !important; white-space:pre-wrap;">\${a.notText || '-'}</td>
                                <td style="padding:8px 5px; text-align:center !important; vertical-align:top !important; width:1%; white-space:nowrap;">
                                    <button class="btn btn-icon" style="color: var(--accent-color); padding: 4px !important; font-size: 14px;" onclick="window.editAnaliz('\${a.id}')" title="Düzenle"><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-icon" style="background: transparent; color: #888888; padding: 2px !important; font-size: 14px; border: none;" onclick="window.deleteAnaliz('\${a.id}')" title="Sil"><i class="fas fa-trash-alt"></i></button>
                                </td>
                            </tr>
                            \`;
                        }\`;

// We need to replace the old HTML block precisely.
const startMarker = '<div id="inline-analiz-row" class="glass" style="display: none; flex-direction: column;';
const endMarker = '                            }';
const endMarker2 = '                        }';

let s = d.indexOf(startMarker);
// Actually, it's safer to use regex to replace between the start marker and the end of the unifiedList.forEach loop.
const regex = /<div id="inline-analiz-row" class="glass" style="display: none; flex-direction: column;[\s\S]*?\}\s*else\s*\{\s*const a = item\.data;[\s\S]*?\}\s*<\/script>/;
// Wait, </script>? No.
const startIdx = d.indexOf(startMarker);
const searchString = \`                            }
                        }
                    });
                    
                    tableHtml += '\\n                        </tbody>\\n                    </table>\\n                </div>\\n            </div>\\n        </div>\\n    \`;\`;

const endIdx = d.indexOf(searchString, startIdx);
if (startIdx !== -1 && endIdx !== -1) {
    const chunkToReplace = d.substring(startIdx, endIdx);
    // Find the end of the if-else blocks inside forEach
    let exactReplaceTarget = d.substring(startIdx, d.indexOf('                        }', d.indexOf('item.type === \\'report\\'')) + 1000); // Rough estimation
    // It's much easier to just slice based on familiar text.
    let oldBlock = d.substring(startIdx, d.indexOf('                        }', d.indexOf('const a = item.data;')) + 26);
    
    // Check if we matched the correct block
    if (oldBlock.includes('a.isKisiselNot') && oldBlock.includes('item.type === \\'report\\'')) {
        d = d.replace(oldBlock, htmlToReplace);
        fs.writeFileSync(file, d);
        console.log("Success: Replaced HTML block");
    } else {
        console.log("Failed: Could not correctly identify the block to replace.", oldBlock.slice(-100));
    }
} else {
    console.log("Failed to find start or end index.");
}

