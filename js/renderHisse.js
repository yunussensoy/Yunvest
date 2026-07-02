        }
                    }
                }
            });
        }
    }
};

const renderHisseler = (container) => {

    // Requires nodeIntegration
    let fsNode, pathNode, shellNode;
    try {
        fsNode = require('fs');
        pathNode = require('path');
        shellNode = require('electron').shell;
    } catch(e) { console.warn("Node integration not available", e); }

    const hisse = window.currentSelectedHisse;
    let selectedHisse = window.currentSelectedHisse || null;
    window.currentSelectedHisse = selectedHisse; // sync it back
    const hName = selectedHisse || 'Hisse';
    
    const validTabs = ['Özet Rapor', 'Gelir Tablosu', 'Bilanço', 'Nakit Akım Tablosu', 'Raporlar', 'Değerleme', 'Likidite Oranları', 'Kaldıraç Oranları', 'Faaliyet Etkinlik Oranları', 'Karlılık Oranları', 'Diğer Kalemler', 'Finansal Rapor', 'Faaliyet Raporu', 'Yatırımcı Sunumu', 'Araştırma Raporu', 'Özet Rapor Notları', 'Hisse Notları'];
    let activeTab = window.currentHisseTab || 'Özet Rapor';
    if (!validTabs.includes(activeTab)) {
        activeTab = 'Özet Rapor';
        window.currentHisseTab = activeTab;
    }

    const renderFolderContents = (folderName, hisseAdi, extension = 'pdf') => {
        const filePath = 'Hisse_Verileri/' + folderName + '/' + hisseAdi + '.' + extension;
        if (extension === 'docx' || extension === 'doc') {
            return `
                <div class="glass" style="margin-top: 0; padding: 3rem; text-align: center; border-radius: var(--border-radius);">
                    <div style="font-size: 3rem; margin-bottom: 1rem; color: #2b579a;">📄</div>
                    <h3 style="color: var(--text-primary); margin-bottom: 1rem;">${hisseAdi} - Notlar</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 0;">Word dosyası bilgisayarınıza / uygulamanıza yönlendirildi.</p>
                    <a href="${filePath}" target="_blank" style="display: inline-block; padding: 0.8rem 2rem; background: #2b579a; color: #fff; text-decoration: none; border-radius: var(--border-radius); font-weight: bold; transition: all 0.3s ease;">
                        Eğer açılmadıysa buraya tıklayın
                    </a>
                    <iframe src="${filePath}" style="display:none;"></iframe>
                </div>
            `;
        }
        return `
            <div style="margin-top: 0;">
                <embed src="${filePath}" type="application/pdf" width="100%" height="800px" style="border-radius: var(--border-radius); border: 1px solid rgba(255,255,255,0.05);" />
            </div>
        `;
    };

    // Helper: extract a value from a financial sheet by row name
    const getVal = (sheet, rowName) => {
        if (!sheet || !sheet.rows) return 0;
        const searchStr = rowName.toLowerCase().replace(/[öçşğıü]/g, '');
        const row = sheet.rows.find(r => {
            if (!r[0]) return false;
            const t = r[0].toLowerCase().replace(/[öçşğıü]/g, '');
            return t.includes(searchStr);
        });
        if (!row) return 0;
        const v = row[1]; // Most recent period
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
            const p = parseFloat(v.replace(/\./g, '').replace(/,/g, '.'));
            return isNaN(p) ? 0 : p;
        }
        return 0;
    };

    window.updateDegerlemeInput = (hisse, year, field, val) => {
        if (!State.data.degerleme) State.data.degerleme = {};
        if (!State.data.degerleme[hisse]) State.data.degerleme[hisse] = {};
        if (!State.data.degerleme[hisse][year]) State.data.degerleme[hisse][year] = {};

        if (field === 'currency') {
            State.data.degerleme[hisse][year][field] = val;
        } else {
            let num = null;
            if (val && val.trim() !== '') {
                let clean = val.replace(/%/g, '').replace(/\./g, '').replace(/,/g, '.').replace(/[$€]/g, '').trim();
                num = parseFloat(clean);
            }
            if (num === null || isNaN(num)) {
                delete State.data.degerleme[hisse][year][field];
            } else {
                State.data.degerleme[hisse][year][field] = num;
            }
        }
        State.save();
        renderUI();
    };

    const renderUI = () => {
        const tabIcons = {
            'Özet Rapor': 'fas fa-chart-pie',
            'Diğer Raporlar': 'fas fa-folder-open',
            'Değerleme': 'fas fa-gem',
            'Gelir Tablosu': 'fas fa-file-invoice-dollar',
            'Nakit Akım Tablosu': 'fas fa-water',
            'Rasyo Analiz Tablosu': 'fas fa-percentage',
            'Bilanço': 'fas fa-balance-scale'
        };

        const makeBtn = (t) => `<button class="nav-btn ${activeTab === t ? 'active' : ''}" style="margin:0; font-size:0.85rem; font-weight:600; padding:0.4rem 0.8rem; white-space:nowrap;" onclick="window.setHisseTab('${t}')"><i class="${tabIcons[t] || 'fas fa-file'}" style="margin-right:4px;"></i>${t}</button>`;
        const makeDropdown = (title, items) => `
            <div class="nav-dropdown">
                <button class="nav-btn ${items.includes(activeTab) ? 'active' : ''}" style="margin:0; font-size:0.85rem; font-weight:600; padding:0.4rem 0.8rem; white-space:nowrap;"><i class="fas fa-caret-down" style="margin-right:4px;"></i>${title}</button>
                <div class="nav-dropdown-content">
                    ${items.map(t => `<a onclick="window.setHisseTab('${t}')">${t}</a>`).join('')}
                </div>
            </div>`;

        let tabsHtml = makeBtn('Özet Rapor') + 
                       makeDropdown('Finansal Tablolar', ['Bilanço', 'Gelir Tablosu', 'Nakit Akım Tablosu']) +
                       makeDropdown('Oran Analizi', ['Likidite Oranları', 'Kaldıraç Oranları', 'Faaliyet Etkinlik Oranları', 'Karlılık Oranları']) +
                       makeBtn('Diğer Kalemler') +
                       makeDropdown('Raporlar', ['Finansal Rapor', 'Faaliyet Raporu', 'Yatırımcı Sunumu', 'Araştırma Raporu']) +
                       makeBtn('Değerleme') + makeBtn('Hisse Notları');
                       
        let contentHtml = '';

        if (!selectedHisse) {
            // GENEL NOTLAR (STICKY NOTES) EKRANI
            if (!State.data.genelNotlar) State.data.genelNotlar = [];
            const colors = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#e67e22'];
            let notesHtml = State.data.genelNotlar.map(not => `
                <div class="sticky-note" style="background-color: ${not.color || '#f1c40f'}; padding: 1rem; border-radius: 8px; color: #000; box-shadow: 0 4px 6px rgba(0,0,0,0.3); position: relative; display: flex; flex-direction: column; min-height: 200px;">
                    <textarea 
                        style="flex: 1; background: transparent; border: none; color: #000; font-family: 'Comic Sans MS', 'Gochi Hand', sans-serif; font-size: 1.1rem; resize: none; outline: none;" 
                        oninput="window.updateGenelNot('${not.id}', this.value)"
                        placeholder="Notunuzu buraya yazın..."
                    >${not.text}</textarea>
                    <div style="display:flex; justify-content:flex-end; align-items:center; margin-top: 0.5rem; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 0.5rem;">
                        <div style="display:flex; gap: 4px;">
                            ${colors.map(col => `<div onclick="window.changeGenelNotColor('${not.id}', '${col}')" style="width:15px; height:15px; border-radius:50%; background:${col}; cursor:pointer; border: 1px solid rgba(0,0,0,0.2);"></div>`).join('')}
                        </div>
                        <i class="fas fa-trash" style="cursor:pointer; color: rgba(0,0,0,0.5);" onclick="window.deleteGenelNot('${not.id}')"></i>
                    </div>
                </div>
            `).join('');

            contentHtml = `
                <div style="padding: 1rem; display: flex; flex-direction: column; height: 100%;">
                    <div style="display:flex; justify-content:flex-end; align-items:center; margin-bottom: 0;">
                        <h2 style="color: var(--accent-color);"><i class="fas fa-sticky-note"></i> Genel Piyasa Notları</h2>
                        <button class="btn btn-primary" onclick="window.addGenelNot()" style="padding: 0.5rem 1rem; font-weight:bold; font-size: 1.1rem;"><i class="fas fa-plus"></i> Yeni Not Ekle</button>
                    </div>
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; align-items: start;">
                        ${notesHtml}
                    </div>
                    ${State.data.genelNotlar.length === 0 ? '<div style="text-align:center; opacity:0.5; margin-top:3rem;">Henüz hiç not eklemediniz. Sağ üstten yeni not ekleyebilirsiniz.</div>' : ''}
                </div>
            `;

            if (!window.addGenelNot) {
                window.addGenelNot = () => { State.data.genelNotlar.push({ id: Date.now().toString(), text: '', color: '#f1c40f' }); State.save(); renderUI(); };
                window.updateGenelNot = (id, text) => { const not = State.data.genelNotlar.find(n => n.id === id); if(not) { not.text = text; State.save(); } };
                window.deleteGenelNot = (id) => { if(confirm('Bu notu silmek istediğinize emin misiniz?')) { State.data.genelNotlar = State.data.genelNotlar.filter(n => n.id !== id); State.save(); renderUI(); } };
                window.changeGenelNotColor = (id, color) => { const not = State.data.genelNotlar.find(n => n.id === id); if(not) { not.color = color; State.save(); renderUI(); } };
            }
        } else {
            if (window.parseExcelData && (!window.stockData || !window.stockData[selectedHisse] || !window.stockData[selectedHisse].bilanco)) {
                try { window.parseExcelData(selectedHisse); } catch(e) { console.error(e); }
            }
            const sData = (window.stockData && window.stockData[selectedHisse]) ? window.stockData[selectedHisse] : {};
            const fiyat = parseFloat(State.getFiyat(selectedHisse)) || 0;
            const usdtry = parseFloat(State.getFiyat('USDTRY')) || 32.50;

            const odenmisSermaye = getVal(sData.bilanco, 'Ödenmiş Sermaye');
            const piyasaDegeri = fiyat * odenmisSermaye;
            const piyasaDegeriUsd = piyasaDegeri / usdtry;
                        let finansalBorclarTotal = 0;
            let nakitTotal = 0;
            if (sData.bilanco && sData.bilanco.rows) {
                sData.bilanco.rows.forEach(r => {
                    if (!r[0]) return;
                    const rName = r[0].toLocaleLowerCase('tr-TR');
                    if (rName.includes('finansal borçlar') && !rName.includes('kısımlar') && !rName.includes('ksmlar') && (!sData.bilanco.rows.length || sData.bilanco.rows.indexOf(r) < sData.bilanco.rows.length - 2)) {
                        const val = typeof r[1] === 'number' ? r[1] : parseFloat((r[1]||'').replace(/\./g, '').replace(/,/g, '.')) || 0;
                        finansalBorclarTotal += val;
                    }
                    if (rName.includes('nakit ve nakit benzerleri') || rName.includes('nakit ve nakit değerler')) {
                        const val = typeof r[1] === 'number' ? r[1] : parseFloat((r[1]||'').replace(/\./g, '').replace(/,/g, '.')) || 0;
                        nakitTotal += val;
                    }
                });
            }
            const netBorc = finansalBorclarTotal - nakitTotal;
            const firmaDegeri = piyasaDegeri + netBorc;
                        // Yıllıklandırılmış FAVÖK (TTM)
            let favok = 0;
            if (sData.gelirYillik && sData.gelirYillik.rows) {
                const fR = sData.gelirYillik.rows.find(x => x[0] && x[0].toLocaleLowerCase('tr-TR').includes('favök'));
                if (fR) {
                    favok = typeof fR[1] === 'number' ? fR[1] : parseFloat((fR[1]||'').replace(/\./g, '').replace(/,/g, '.')) || 0;
                }
            }
            if (favok === 0) favok = getVal(sData.gelirYillik, 'FAVÖK');
            
            const fdFavok = favok !== 0 ? (firmaDegeri / favok) : 0;
            const netBorcFavok = favok !== 0 ? (netBorc / favok) : 0;
            
            // Yıllıklandırılmış Net Kar (TTM)
            let yilliklandirilmisNetKar = 0;
            if (sData.gelirYillik && sData.gelirYillik.rows) {
                const nR = sData.gelirYillik.rows.find(x => x[0] && (x[0].toLocaleLowerCase('tr-TR').includes('ana ortaklık payları') || x[0].toLocaleLowerCase('tr-TR').includes('dönem net kar')));
                if (nR) {
                    yilliklandirilmisNetKar = typeof nR[1] === 'number' ? nR[1] : parseFloat((nR[1]||'').replace(/\./g, '').replace(/,/g, '.')) || 0;
                }
            }
            if (yilliklandirilmisNetKar === 0) yilliklandirilmisNetKar = getVal(sData.gelirYillik, 'Net Dönem Karı');
            
            const fk = yilliklandirilmisNetKar !== 0 ? (piyasaDegeri / yilliklandirilmisNetKar) : 0;
            
            // PD/DD Hesaplaması (Ana Ortaklığa Ait Özkaynaklar)
            let anaOrtaklikOzkaynaklar = 0;
            if (sData.bilanco && sData.bilanco.rows) {
                const aoRow = sData.bilanco.rows.find(x => x[0] && x[0].toLocaleLowerCase('tr-TR').includes('ana ortaklığa ait özkaynaklar'));
                if (aoRow) {
                    anaOrtaklikOzkaynaklar = typeof aoRow[1] === 'number' ? aoRow[1] : parseFloat((aoRow[1]||'').replace(/\./g, '').replace(/,/g, '.')) || 0;
                }
            }
            if (anaOrtaklikOzkaynaklar === 0) anaOrtaklikOzkaynaklar = getVal(sData.bilanco, 'Özkaynaklar');
            const pdDd = anaOrtaklikOzkaynaklar !== 0 ? (piyasaDegeri / anaOrtaklikOzkaynaklar) : 0;
            
            const satislar = getVal(sData.gelirYillik, 'Satış Gelirleri');
            const pdSatislar = satislar !== 0 ? (piyasaDegeri / satislar) : 0;
            
            let peg = 0;
            if (fk > 0) {
                const nkRow = (sData.gelirYillik && sData.gelirYillik.rows) ? sData.gelirYillik.rows.find(r => r[0] === 'Net Dönem Karı') : null;
                if (nkRow && nkRow.length >= 3) {
                    const pNum = (str) => str ? parseFloat(str.replace(/\./g, '').replace(',', '.')) : 0;
                    const nk1 = pNum(nkRow[1]);
                    const nk2 = pNum(nkRow[2]);
                    if (nk2 > 0) {
                        const growth = ((nk1 - nk2) / nk2) * 100;
                        if (growth > 0) peg = fk / growth;
                    }
                }
            }

            const donenVarliklar = getVal(sData.bilanco, 'Dönen Varlıklar');
            const kisaYukum = getVal(sData.bilanco, 'Kısa Vadeli Yükümlülükler');
            const cariOran = kisaYukum !== 0 ? (donenVarliklar / kisaYukum) : 0;

            const fmtNum = (val) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(Math.round(val));
            const fmtDec = (val) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(val);

            const gRows = [
                ['Fiyat', fmtDec(fiyat)],
                ['Ödenmiş Sermaye', fmtNum(odenmisSermaye)],
                ['Piyasa Değeri', fmtNum(piyasaDegeri)],
                ['Piyasa Değeri $', fmtNum(piyasaDegeriUsd) + ' $'],
                ['Firma Değeri', fmtNum(firmaDegeri)],
                ['FD/FAVÖK', fmtDec(fdFavok)],
                ['F/K', fmtDec(fk)],
                ['PD/DD', fmtDec(pdDd)],
                ['PD/Satışlar', fmtDec(pdSatislar)],
                ['Net Borç/FAVÖK', fmtDec(netBorcFavok)],
                ['Cari Oran', fmtDec(cariOran)]
            ];
            const tGuncelDynamic = genTable('Güncel Metrikler', ['Metrik', 'Değer'], gRows);

            if (activeTab === hName || activeTab === 'Özet Rapor') {
                // FINTABLES STYLE SUMMARY DASHBOARD
                
                const fmtVal = (val) => {
                    if (val === null || val === undefined || isNaN(val)) return '-';
                    return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(val);
                };
                
                const calcPct = (current, previous) => {
                    if (!current || !previous || previous === 0) return { text: 'N/A', color: 'gray' };
                    const pct = ((current - previous) / Math.abs(previous)) * 100;
                    const color = pct >= 0 ? '#2ecc71' : '#e74c3c';
                    return { text: '% ' + Math.abs(pct).toFixed(0), color: color };
                };

                let gelirHtml = '';
                let bilancoHtml = '';
                let chartLabels = [];
                let chartSatislar = [];
                let chartFavok = [];
                let chartNetKar = [];
                let chartBKM = []; let chartFKM = []; let chartNKM = [];
                let chartCari = []; let chartKaldirac = []; let chartROE = [];

                if (sData.gelirDonemsel && sData.bilanco && sData.gelirDonemsel.headers.length > 2) {
                    const headers = sData.gelirDonemsel.headers;
                    const p1 = headers[1]; // e.g. 2024/9
                    // find same quarter last year
                    let p2_idx = -1;
                    if (p1) {
                        const parts = p1.split('/');
                        const lastYear = (parseInt(parts[0]) - 1) + '/' + parts[1];
                        p2_idx = headers.indexOf(lastYear);
                    }
                    if (p2_idx === -1) p2_idx = 2; // fallback to previous quarter
                    
                    const p2 = headers[p2_idx];

                    // Gelir Tablosu Items
                    
                    const parseTRNumber = (str) => {
                        if (!str) return 0;
                        if (typeof str === 'number') return str;
                        return parseFloat(str.replace(/\./g, '').replace(/,/g, '.')) || 0;
                    };
                    const getG = (name) => {
                        const r = sData.gelirDonemsel.rows.find(x => x[0] && x[0].toLocaleLowerCase('tr-TR').includes(name.toLocaleLowerCase('tr-TR')));
                        return r ? { v1: parseTRNumber(r[1]), v2: parseTRNumber(r[p2_idx]) } : { v1: 0, v2: 0 };
                    };
                    
                    const gItems = [
                        { label: 'Satış Gelirleri', key: 'satış gelirleri' },
                        { label: 'Brüt Kar', key: 'brüt kar' },
                        { label: 'Esas Faaliyet Karı', key: 'faaliyet kar' },
                        { label: 'FAVÖK', key: 'favök' },
                        { label: 'Net Parasal Pozisyon<br>Kazançları (Kayıpları)', key: 'net parasal pozisyon' },
                        { label: 'Net Dönem Karı', key: 'ana ortaklık payları' }
                    ];

                    gelirHtml = `<table class="dash-table compact-table">
                        <thead>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                                <th style="text-align:left;">Özet Gelir Tablosu</th>
                                <th style="text-align:right;">${p1}</th>
                                <th style="text-align:right;">${p2}</th>
                                <th style="text-align:right;">%</th>
                            </tr>
                        </thead>
                        <tbody>`;
                    
                    gItems.forEach(item => {
                        const vals = getG(item.key);
                        const pct = calcPct(vals.v1, vals.v2);
                        gelirHtml += `<tr>
                            <td>${item.label}</td>
                            <td>${fmtVal(vals.v1)}</td>
                            <td>${fmtVal(vals.v2)}</td>
                            <td style="color: ${pct.color}; font-weight:bold;">${pct.text}</td>
                        </tr>`;
                    });
                    gelirHtml += `</tbody></table>`;

                    // Bilanço Items
                    const b_headers = sData.bilanco.headers;
                    const bp1 = b_headers[1];
                    let bp2_idx = 2; // fallback to previous quarter
                    // try to find previous year end
                    if (bp1) {
                        const parts = bp1.split('/');
                        const lastYearEnd = (parseInt(parts[0]) - 1) + '/12';
                        const foundIdx = b_headers.indexOf(lastYearEnd);
                        if (foundIdx !== -1) bp2_idx = foundIdx;
                    }
                    const bp2 = b_headers[bp2_idx];

                    const getB = (name) => {
                        if (name === 'net borç' || name === 'net bor') {
                            const fBorc = getB('finansal borçlar');
                            const nakit = getB('nakit ve nakit');
                            return { v1: fBorc.v1 - nakit.v1, v2: fBorc.v2 - nakit.v2 };
                        }
                        const searchName = name.toLocaleLowerCase('tr-TR');
                        if (searchName.includes('finansal bor')) {
                            let v1 = 0, v2 = 0;
                            let addedRows = [];
                            sData.bilanco.rows.forEach((x, idx) => {
                                if (x[0]) {
                                    const rName = x[0].toLocaleLowerCase('tr-TR');
                                    if (rName.includes('finansal borçlar') && !rName.includes('kısımlar') && !rName.includes('ksmlar') && idx < sData.bilanco.rows.length - 2) {
                                        let val1 = parseTRNumber(x[1]);
                                        v1 += val1;
                                        v2 += parseTRNumber(x[bp2_idx]);
                                        addedRows.push(idx + 1 + '. satır: ' + x[0].trim() + ' (' + val1 + ')');
                                    }
                                }
                            });
                            return { v1, v2, debug: addedRows.join(' + ') };
                        }
                        const r = sData.bilanco.rows.find(x => x[0] && x[0].toLocaleLowerCase('tr-TR').includes(searchName));
                        return r ? { v1: parseTRNumber(r[1]), v2: parseTRNumber(r[bp2_idx]) } : { v1: 0, v2: 0 };
                    };

                    const bItems = [
                        { label: 'Dönen Varlıklar', key: 'toplam dönen varlıklar' },
                        { label: 'Duran Varlıklar', key: 'toplam duran varlıklar' },
                        { label: 'Toplam Varlıklar', key: 'toplam varlıklar' },
                        { label: 'Finansal Borçlar', key: 'finansal borçlar' },
                        { label: 'Net Borç', key: 'net borç' },
                        { label: 'Özkaynaklar', key: 'ana ortaklığa ait özkaynaklar' }
                    ];

                    bilancoHtml = `<table class="dash-table compact-table">
                        <thead>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                                <th style="text-align:left;">Özet Bilanço</th>
                                <th style="text-align:right;">${bp1}</th>
                                <th style="text-align:right;">${bp2}</th>
                                <th style="text-align:right;">%</th>
                            </tr>
                        </thead>
                        <tbody>`;
                    
                    bItems.forEach(item => {
                        const vals = getB(item.key);
                        const pct = calcPct(vals.v1, vals.v2);
                        bilancoHtml += `<tr>
                            <td title="${vals.debug || ''}">${item.label}</td>
                            <td title="${vals.debug || ''}">${fmtVal(vals.v1)}</td>
                            <td>${fmtVal(vals.v2)}</td>
                            <td style="color: ${pct.color}; font-weight:bold;">${pct.text}</td>
                        </tr>`;
                    });
                    bilancoHtml += `</tbody></table>`;

                    // Chart Data
                    const limit = Math.min(5, headers.length - 1);
                    
                    const getCQ = (array, i, headers) => {
                        if (!array || !array[i]) return 0;
                        const currentHeader = headers[i];
                        const val = parseTRNumber(array[i]);
                        if (!currentHeader) return val;
                        if (currentHeader.endsWith('/3')) return val;
                        if (i + 1 < array.length) {
                            const prevHeader = headers[i+1];
                            if (prevHeader && prevHeader.split('/')[0] === currentHeader.split('/')[0]) {
                                return val - parseTRNumber(array[i+1]);
                            }
                        }
                        return val;
                    };
                    
                    const brutR = sData.gelirDonemsel.rows.find(x => x[0] && x[0].toLocaleLowerCase('tr-TR').includes('brüt kar'));
                    const donenR = sData.bilanco.rows.find(x => x[0] && x[0].toLocaleLowerCase('tr-TR').includes('toplam dönen varlıklar'));
                    const kisaR = sData.bilanco.rows.find(x => x[0] && x[0].toLocaleLowerCase('tr-TR').includes('toplam kısa vadeli'));
                    const uzunR = sData.bilanco.rows.find(x => x[0] && x[0].toLocaleLowerCase('tr-TR').includes('toplam uzun vadeli'));
                    const toplamVR = sData.bilanco.rows.find(x => x[0] && x[0].toLocaleLowerCase('tr-TR').includes('toplam varlıklar'));
                    const ozR = sData.bilanco.rows.find(x => x[0] && x[0].toLocaleLowerCase('tr-TR').includes('ana ortaklığa ait özkaynaklar'));

                    for (let i = limit; i >= 1; i--) {
                        chartLabels.push(headers[i]);
                        chartSatislar.push(getG('satış gelirleri').v2); // actually we need the values for each period
                    }
                    // re-fetch chart data correctly
                    chartLabels = []; chartSatislar = []; chartFavok = []; chartNetKar = [];
                    chartBKM = []; chartFKM = []; chartNKM = []; chartCari = []; chartKaldirac = []; chartROE = [];
                    for (let i = limit; i >= 1; i--) {
                        chartLabels.push(headers[i]);
                        const sR = sData.gelirDonemsel.rows.find(x => x[0] && x[0].toLocaleLowerCase('tr-TR').includes('satış gelirleri'));
                                                const fR = sData.gelirDonemsel.rows.find(x => x[0] && x[0].toLocaleLowerCase('tr-TR').includes('favök'));
                        const nR = sData.gelirDonemsel.rows.find(x => x[0] && (x[0].toLocaleLowerCase('tr-TR').includes('ana ortaklık payları') || x[0].toLocaleLowerCase('tr-TR').includes('dönem net kar')));
                          
                          const cqSatis = getCQ(sR, i, headers);
                          const cqBrut = getCQ(brutR, i, headers);
                          const cqFavok = getCQ(fR, i, headers);
                          const cqNetKar = getCQ(nR, i, headers);
                          
                        chartSatislar.push(cqSatis);
                        chartFavok.push(cqFavok);
                        chartNetKar.push(cqNetKar);

                          chartBKM.push(cqSatis ? (cqBrut / cqSatis) * 100 : 0);
                          chartFKM.push(cqSatis ? (cqFavok / cqSatis) * 100 : 0);
                          chartNKM.push(cqSatis ? (cqNetKar / cqSatis) * 100 : 0);

                          const vDonen = donenR ? parseTRNumber(donenR[i]) : 0;
                          const vKisa = kisaR ? parseTRNumber(kisaR[i]) : 0;
                          const vUzun = uzunR ? parseTRNumber(uzunR[i]) : 0;
                          const vToplamV = toplamVR ? parseTRNumber(toplamVR[i]) : 0;
                          const vOz = ozR ? parseTRNumber(ozR[i]) : 0;

                          chartCari.push(vKisa ? vDonen / vKisa : 0);
                          chartKaldirac.push(vToplamV ? ((vKisa + vUzun) / vToplamV) * 100 : 0);

                                                    // Özkaynak Karlılığı (ROE) Hesaplaması
                          let annNk = 0;
                          if (sData.gelirYillik && sData.gelirYillik.rows) {
                              const yNkR = sData.gelirYillik.rows.find(x => x[0] && (x[0].toLocaleLowerCase('tr-TR').includes('ana ortaklık payları') || x[0].toLocaleLowerCase('tr-TR').includes('dönem net kar')));
                              if (yNkR && yNkR[i] !== undefined) {
                                  annNk = parseTRNumber(yNkR[i]);
                              }
                          }
                          if (annNk === 0) { // Fallback if Yilliklanmis sheet is not found
                              const rawNetKar = nR ? parseTRNumber(nR[i]) : 0;
                              annNk = rawNetKar;
                              if (headers[i]) {
                                  if (headers[i].endsWith('/3')) annNk = rawNetKar * 4;
                                  else if (headers[i].endsWith('/6')) annNk = rawNetKar * 2;
                                  else if (headers[i].endsWith('/9')) annNk = rawNetKar * (4/3);
                              }
                          }
                          
                          let currentOz = ozR ? parseTRNumber(ozR[i]) : 0;
                          let previousOz = currentOz;
                          if (o