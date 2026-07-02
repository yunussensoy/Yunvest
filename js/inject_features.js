const fs = require('fs');
let app = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

const oldRaporlarStr = `} else if (['Finansal Rapor', 'Faaliyet Raporu', 'Yatırımcı Sunumu', 'Araştırma Raporu'].includes(activeTab)) {
                contentHtml = \`
                <div style="display:flex; gap: 1rem; padding-top: 0; height: calc(100vh - 250px);">
                    <div class="dash-card" style="flex:1; margin-bottom: 0; display:flex; flex-direction:column; padding:0; overflow:hidden;" id="rapor-viewer-container">
                        <div style="flex:1; display:flex; justify-content:center; align-items:center; opacity:0.5; font-style:italic;">Yükleniyor...</div>
                    </div>
                </div>
                \`;
                
                setTimeout(() => {
                    if (window.loadRapor) {
                        window.loadRapor(activeTab, 'pdf');
                    }
                }, 100);`;

const newRaporlarStr = `} else if (activeTab === 'Raporlar') {
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
            } else if (activeTab === 'Değerleme') {
                // Initialize default edit modes if not present
                if (!window.degerlemeEditMode) window.degerlemeEditMode = { '2026': false, '2027': false, '2028': false };
                window.toggleDegerlemeEdit = (y) => {
                    window.degerlemeEditMode[y] = !window.degerlemeEditMode[y];
                    if (typeof renderUI === 'function') renderUI(); else if (typeof renderPage === 'function') renderPage();
                };

                // Read saved target price data for this hisse
                if(!State.data.degerleme) State.data.degerleme = {};
                if(!State.data.degerleme[selectedHisse]) State.data.degerleme[selectedHisse] = {};
                const stateData = State.data.degerleme[selectedHisse];
                const years = ['2026', '2027', '2028'];
                
                window.updateDegerlemeInput = (hisse, year, field, value) => {
                    if (!State.data.degerleme[hisse]) State.data.degerleme[hisse] = {};
                    if (!State.data.degerleme[hisse][year]) State.data.degerleme[hisse][year] = {};
                    State.data.degerleme[hisse][year][field] = value;
                    State.save();
                    if (typeof renderUI === 'function') renderUI(); else if (typeof renderPage === 'function') renderPage();
                };

                let headerHtml = \`<tr><th>Kalem</th>\`;
                years.forEach(y => {
                    const curCurrency = stateData[y]?.currency || 'TRY';
                    headerHtml += \`<th style="font-size: 14px;">
                        <div style="display:flex; align-items:center; justify-content:center; gap:0.5rem;">
                            <span>\${y}</span>
                            <i class="fas fa-edit" style="cursor:pointer; color:var(--accent-color);" onclick="window.toggleDegerlemeEdit('\${y}')" title="Düzenle"></i>
                            <select style="background:rgba(255,255,255,0.1); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:4px; padding:2px 4px; font-size:0.8rem;" onchange="window.updateDegerlemeInput('\${selectedHisse}', '\${y}', 'currency', this.value)">
                                <option value="TRY" \${curCurrency === 'TRY' ? 'selected' : ''}>TL</option>
                                <option value="USD" \${curCurrency === 'USD' ? 'selected' : ''}>USD</option>
                            </select>
                        </div>
                    </th>\`;
                });
                headerHtml += \`</tr>\`;

                let html = \`<div class="dash-card" style="display:flex; flex-direction:column; height:100%;">
                    <div class="dash-title">Geleceğe İlişkin Beklentileriniz</div>
                    <div style="flex:1; overflow-x:auto;">
                        <table class="dash-table compact-table" style="min-width: 1000px;">
                            <thead>\${headerHtml}</thead>
                            <tbody>\`;
                
                const rows = [
                    { key: 'ciro', label: 'Ciro' },
                    { key: 'favok_marji', label: 'FAVÖK Marjı (%)' },
                    { key: 'favok', label: 'FAVÖK', readonly: true, formula: (d) => (d.ciro || 0) * ((d.favok_marji || 0) / 100) },
                    { key: 'fd_favok', label: 'FD/FAVÖK' },
                    { key: 'piyasa_degeri', label: 'Piyasa Değeri', readonly: true, formula: (d, fv) => fv * (d.fd_favok || 0) },
                    { key: 'net_borc', label: 'Net Borç' },
                    { key: 'odenmis_sermaye', label: 'Ödenmiş Sermaye' },
                    { key: 'hedef_fiyat', label: 'Hedef Fiyat', readonly: true, isTarget: true, formula: (d, fv, pd) => d.odenmis_sermaye ? (pd - (d.net_borc || 0)) / d.odenmis_sermaye : 0 }
                ];
                
                // Add Kur input row for USD entries
                let hasUSD = years.some(y => stateData[y]?.currency === 'USD');
                if (hasUSD) {
                    rows.splice(1, 0, { key: 'usd_kur', label: 'USD/TL Kuru' });
                }

                rows.forEach(r => {
                    html += \`<tr><td style="text-align:left; font-weight:bold;">\${r.label}</td>\`;
                    years.forEach(y => {
                        const d = stateData[y] || {};
                        const editMode = window.degerlemeEditMode[y];
                        
                        let val = d[r.key] || '';
                        let displayVal = val;
                        
                        // Calculate read-only fields
                        let fv = (d.ciro || 0) * ((d.favok_marji || 0) / 100);
                        if (r.key === 'favok') displayVal = val = fv;
                        
                        let pd = fv * (d.fd_favok || 0);
                        if (r.key === 'piyasa_degeri') displayVal = val = pd;
                        
                        if (r.key === 'hedef_fiyat') {
                            let pd_tl = pd;
                            let net_borc_tl = d.net_borc || 0;
                            if (d.currency === 'USD') {
                                const kur = d.usd_kur || window.dolarKuru || 33;
                                pd_tl = pd * kur;
                                net_borc_tl = (d.net_borc || 0) * kur;
                            }
                            displayVal = val = d.odenmis_sermaye ? (pd_tl - net_borc_tl) / d.odenmis_sermaye : 0;
                        }
                        
                        if (typeof displayVal === 'number' && displayVal !== 0) {
                            if (r.key === 'hedef_fiyat') {
                                displayVal = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(displayVal);
                            } else if (r.key === 'favok_marji') {
                                displayVal = displayVal + '%';
                            } else {
                                displayVal = new Intl.NumberFormat('tr-TR').format(displayVal);
                            }
                        } else if (displayVal === 0 || displayVal === '') {
                            displayVal = '---';
                        }
                        
                        if (editMode && !r.readonly) {
                            html += \`<td style="text-align: center;"><input type="number" step="any" style="width:100%; background:rgba(255,255,255,0.1); color:#fff; border:1px solid var(--accent-color); padding:4px; text-align:center; border-radius:4px;" value="\${val}" onchange="window.updateDegerlemeInput('\${selectedHisse}', '\${y}', '\${r.key}', parseFloat(this.value)||0)"></td>\`;
                        } else {
                            html += \`<td style="text-align: center; \${r.isTarget ? 'font-weight:bold; color:var(--success-color); font-size:1.1rem;' : ''}">\${displayVal}</td>\`;
                        }
                    });
                    html += \`</tr>\`;
                });
                
                html += \`</tbody></table></div></div>\`;
                contentHtml += html;`;

// Using split/join to replace because regex with newlines can be messy.
const oldParts = app.split(oldRaporlarStr);
if(oldParts.length > 1) {
    app = oldParts.join(newRaporlarStr);
    fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', app, 'utf8');
    console.log('✅ Replaced Raporlar and added Değerleme');
} else {
    console.log('❌ EXACT REPLACE FAILED. Trying to fallback via RegExp.');
    // fallback if indentation varies slightly
    const safeReg = /\} else if \(\['Finansal Rapor', 'Faaliyet Raporu', 'Yatırımcı Sunumu', 'Araştırma Raporu'\]\.includes\(activeTab\)\) \{[\s\S]*?\}, 100\);/m;
    if (app.match(safeReg)) {
        app = app.replace(safeReg, newRaporlarStr);
        fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', app, 'utf8');
        console.log('✅ Regex replace successful!');
    } else {
        console.log('❌ Regex failed too!');
    }
}
