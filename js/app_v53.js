
window.toggleExpandCard = function (btnElement) {
    const card = btnElement.closest('.dash-card');
    const titleText = card.querySelector('.dash-title span').innerText;
    const canvasContainer = card.querySelector('canvas').parentElement;

    let modal = document.getElementById('chart-expand-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'chart-expand-modal';
        modal.style.cssText = 'display: none; justify-content: center; align-items: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(3px); z-index: 20000;';
        modal.innerHTML = `
            <div class="glass" style="width: 85%; height: 60vh; min-height: 400px; max-height: 600px; padding: 2rem; position: relative; border-radius: 12px; display: flex; flex-direction: column; background: var(--overlay-bg); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 id="expanded-chart-title" style="color: var(--text-primary); margin: 0; font-size: 1.2rem; font-weight: 600;">Grafik</h3>
                    <i class="fas fa-times" style="font-size: 1.5rem; cursor: pointer; color: #ccc; transition: color 0.3s;" onmouseover="this.style.color='var(--text-primary)'" onmouseout="this.style.color='#ccc'" onclick="window.closeExpandedChart()"></i>
                </div>
                <div id="expanded-chart-body" style="flex: 1; position: relative; min-height: 0; width: 100%;">
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        window.closeExpandedChart = function () {
            const m = document.getElementById('chart-expand-modal');
            if (m && window.currentExpandedChartPlaceholder) {
                const body = document.getElementById('expanded-chart-body');
                const content = body.children[0];
                if (content) {
                    window.currentExpandedChartPlaceholder.appendChild(content);
                    const canvas = content.querySelector('canvas');
                    if (canvas) {
                        const chart = Chart.getChart(canvas.id);
                        if (chart) chart.resize();
                    }
                }
                m.style.display = 'none';
                window.currentExpandedChartPlaceholder = null;
            }
        };
    }

    window.currentExpandedChartPlaceholder = card;
    const body = document.getElementById('expanded-chart-body');
    document.getElementById('expanded-chart-title').innerText = titleText;

    body.appendChild(canvasContainer);
    modal.style.display = 'flex';

    setTimeout(() => {
        const canvas = canvasContainer.querySelector('canvas');
        if (canvas) {
            const chart = Chart.getChart(canvas.id);
            if (chart) chart.resize();
        }
    }, 50);
};

window.loadRapor = (raporTipi, ext = 'pdf') => {
    const hisse = window.currentSelectedHisse;
    if (!hisse) return;

    let folderName = '';
    if (raporTipi === 'Araştırma Raporu') folderName = 'Arastirma_Raporu';
    else if (raporTipi === 'Finansal Rapor') folderName = 'Finansal_Rapor';
    else if (raporTipi === 'Faaliyet Raporu') folderName = 'Faaliyet_Raporu';
    else if (raporTipi === 'Yatırımcı Sunumu') folderName = 'Yatirimci_Sunumu';
    else return;

    const container = document.getElementById('rapor-viewer-container');
    if (!container) return;

    try {
        const fs = require('fs');
        const path = require('path');

        let appRoot = __dirname;
        if (appRoot.endsWith('js') || appRoot.endsWith('js\\') || appRoot.endsWith('js/')) {
            appRoot = path.join(appRoot, '..');
        }

        const relPath = `Hisse_Verileri/${folderName}/${hisse}.${ext}`;
        const absPath = path.join(appRoot, relPath);

        if (fs.existsSync(absPath)) {
            container.innerHTML = `<embed src="${relPath}" width="100%" height="100%" type="application/pdf">`;
        } else {
            container.innerHTML = `<div style="flex:1; display:flex; justify-content:center; align-items:center; opacity:0.5; font-style:italic; font-size:1.2rem;">${hisse} ${raporTipi.toLowerCase()} bulunamadı.</div>`;
        }
    } catch (e) {
        container.innerHTML = `<div style="flex:1; display:flex; justify-content:center; align-items:center; opacity:0.5; font-style:italic; font-size:1.2rem;">Sistem hatası: ${e.message}</div>`;
    }
};


// --- DASHBOARD TABLES DEFINITIONS ---
const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};


const genFintablesBilanco = (title, headers, rows) => {
    const docIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px; vertical-align:middle; color:#888;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
    const leftArrow = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor:pointer; color:#555;"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
    const rightArrow = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor:pointer; color:var(--text-primary);"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

    let html = `<div style="background:#111216; border-radius:12px; border:1px solid rgba(255,255,255,0.05); overflow:hidden; font-family:var(--font-family);">
        <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; color:var(--text-primary); font-size:13px; text-align:right;">
                <thead>
                    <tr style="background:#111216; border-bottom:1px solid var(--table-border);">
                        <th style="text-align:left; padding:16px; font-size:15px; font-weight:700;  white-space:nowrap;">Bilanço Kalemleri</th>`;

    headers.forEach((h, i) => {
        if (i === 0) return;
        let arrowL = i === 1 ? `<span style="margin-right:8px; vertical-align:middle;">${leftArrow}</span>` : '';
        let arrowR = i === headers.length - 1 ? `<span style="margin-left:8px; vertical-align:middle;">${rightArrow}</span>` : '';
        let eSpan = `<span style="color:#2196f3; font-weight:bold; font-size:10px; margin-left:2px; vertical-align:top;">E</span>`;
        html += `<th style="padding:16px;  white-space:nowrap; color:var(--accent-color); text-align:right;">${h}</th>`;
    });
    html += `</tr></thead><tbody>`;

    const mainCategories = ['dönen varlıklar', 'duran varlıklar', 'toplam varlıklar', 'kısa vadeli yükümlülükler', 'uzun vadeli yükümlülükler', 'özkaynaklar', 'toplam kaynaklar'];

    rows.forEach(r => {
        const rowName = r[0] ? r[0].trim() : '';
        const isMainCat = mainCategories.includes(rowName.toLocaleLowerCase('tr-TR'));

        let trStyle = isMainCat ? `background:rgba(255,255,255,0.03); font-weight:600;` : `transition: background 0.2s;`;
        html += `<tr style="${trStyle} border-bottom:1px solid rgba(255,255,255,0.03);" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='${isMainCat ? 'rgba(255,255,255,0.03)' : 'transparent'}'">`;

        r.forEach((cell, i) => {
            if (i === 0) {
                let cellColor = isMainCat ? '#fff' : '#aaa';
                html += `<td style="text-align:left; padding:12px 16px; color:${cellColor}; white-space:nowrap; border-right:none;">${cell}</td>`;
            } else {
                html += `<td style="padding:12px 16px; color:#e0e0e0; white-space:nowrap; border-right:none;">${cell}</td>`;
            }
        });
        html += `</tr>`;
    });

    html += `</tbody></table></div></div>`;
    return html;
};

const genTable = (title, headers, rows) => {
    let html = `<div class="dash-card" style="display:flex; flex-direction:column; height:100%;"><div class="dash-title">${title}</div><div style="flex:1; display:flex; flex-direction:column; justify-content:center;"><table class="dash-table compact-table" style="height:100%;"><thead><tr>`;
    headers.forEach((h, i) => {
        html += `<th style="text-align:${i === 0 ? 'left' : 'center'}; font-weight: 500;">${h}</th>`;
    });
    html += `</tr></thead><tbody>`;
    rows.forEach(r => {
        html += `<tr>`;
        r.forEach((cell, i) => {
            let align = i === 0 ? 'left' : 'right';
            if (cell && cell.toString().includes('%')) align = 'center';
            html += `<td style="text-align:${align};">${cell}</td>`;
        });
        html += `</tr>`;
    });
    html += `</tbody></table></div></div>`;
    return html;
};

const guncelRows = [
    ['Fiyat', '45.80'],
    ['Ödenmiş Sermaye', '150.000.000'],
    ['Piyasa Değeri', '6.870.000.000'],
    ['Piyasa Değeri $', '215.500.000'],
    ['FD/FAVÖK', '8.50'],
    ['F/K', '12.40'],
    ['PD/DD', '3.15'],
    ['PD/Satışlar', '1.80'],
    ['Net Borç/FAVÖK', '0.45'],
    ['Cari Oran', '1.60']
];
const tGuncel = genTable('Güncel', ['Metrik', 'Değer'], guncelRows);

const degerlemeRows = [
    ['Satış Gelirleri', '1.2M', '1.5M', '1.9M'],
    ['Net Kar Marjı', '%15', '%16', '%18'],
    ['FAVÖK', '250B', '320B', '450B'],
    ['Net Kar', '180B', '240B', '342B'],
    ['FD/FAVÖK', '7.2', '5.8', '4.1'],
    ['F/K', '10.5', '8.2', '6.0'],
    ['PD/DD', '2.8', '2.3', '1.9'],
    ['Hedef Fiyat', '65.00', '82.50', '110.00'],
    ['Potansiyel', '%42', '%80', '%140']
];
const tDegerleme = genTable('Değerleme', ['Kalem', '2026', '2027', '2028'], degerlemeRows);

const qHeaders = ['Kalem', '2024/3', '2024/6', '2024/9', '2024/12'];
const qRows = [
    ['Satış Gelirleri', '450.000', '480.000', '520.000', '580.000'],
    ['Brüt Kar', '120.000', '135.000', '150.000', '175.000'],
    ['Esas Faaliyet Karı', '90.000', '105.000', '118.000', '140.000'],
    ['FAVÖK', '95.000', '110.000', '125.000', '148.000'],
    ['Net Dönem Karı', '65.000', '78.000', '88.000', '110.000']
];
const tGelirQ = genTable('Gelir Tablosu (Çeyreklik)', qHeaders, qRows);
const tGelirY = genTable('Gelir Tablosu (Yıllıklandırılmış)', qHeaders, qRows.map(r => [r[0], r[1] + ' (Y)', r[2] + ' (Y)', r[3] + ' (Y)', r[4] + ' (Y)']));

const bRows = [
    ['Dönen Varlıklar', '1.200.000', '1.350.000', '1.500.000', '1.750.000'],
    ['Duran Varlıklar', '800.000', '820.000', '850.000', '900.000'],
    ['Toplam Varlıklar', '2.000.000', '2.170.000', '2.350.000', '2.650.000'],
    ['Kısa Vadeli Yük.', '500.000', '520.000', '550.000', '580.000'],
    ['Uzun Vadeli Yük.', '300.000', '290.000', '280.000', '270.000'],
    ['Özkaynaklar', '1.200.000', '1.360.000', '1.520.000', '1.800.000']
];
const tBilanco = genTable('Bilanço', qHeaders, bRows);

const chartsHtml = `
<div class="dash-card"><div class="dash-title">Brüt Kar Marjı (%)</div><canvas id="chart-brut" height="150"></canvas></div>
<div class="dash-card"><div class="dash-title">FAVÖK Marjı (%)</div><canvas id="chart-favok" height="150"></canvas></div>
<div class="dash-card"><div class="dash-title">Net Kar Marjı (%)</div><canvas id="chart-net" height="150"></canvas></div>
`;
// ----------------------------------------

// js/app.js

// --- FIREBASE SETUP ---
const firebaseConfig = {
    apiKey: "AIzaSyBfGArrNWxZT02JkeWqNZ0PqqZaGTyIJjU",
    authDomain: "exchangepro-48000.firebaseapp.com",
    projectId: "exchangepro-48000",
    storageBucket: "exchangepro-48000.firebasestorage.app",
    messagingSenderId: "361891852133",
    appId: "1:361891852133:web:96d08eb68a47ab935afb8c"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let currentUser = null;

// --- UTILS ---

const formatNumber = (val, decimals = 2) => {
    if (val === null || val === undefined || val === '' || isNaN(val)) return '-';
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(val);
};

const formatCurrency = (val, decimals = 2, symbol = '₺') => {
    if (val === null || val === undefined || isNaN(val)) return decimals === 0 ? (symbol === '€' ? '0' + symbol : symbol + '0') : (symbol === '€' ? '0,00' + symbol : symbol + '0,00');
    const isNegative = val < 0;
    const absVal = Math.abs(val);
    const numStr = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(absVal);
    return (isNegative ? '-' : '') + (symbol === '€' ? numStr + symbol : symbol + numStr);
};
const formatPercent = (val, decimals = 2) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(val * 100) + '%';
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear().toString().slice(-2);
    return `${day}.${month}.${year}`;
};
const calcDaysBetween = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = date2 ? new Date(date2) : new Date();
    return Math.max(0, Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)));
};

// --- CALCULATIONS ---
const calculatePortfoy = (ekstre, getFiyat, nakitHareketleri) => {
    const historyByMenkul = {};
    const sortedEkstre = [...ekstre].sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
    const arsivList = [];

    sortedEkstre.forEach(islem => {
        if (!historyByMenkul[islem.menkul]) {
            historyByMenkul[islem.menkul] = {
                kalanAdet: 0,
                alisToplamTutar: 0,
                alisToplamAdet: 0,
                satisToplamTutar: 0,
                satisToplamAdet: 0,
                ilkAlimTarihi: islem.tarih,
                maxAdet: 0
            };
        }

        const h = historyByMenkul[islem.menkul];
        h.kalanAdet += islem.adet;
        if (h.kalanAdet > h.maxAdet) h.maxAdet = h.kalanAdet;

        if (islem.adet > 0) {
            h.alisToplamTutar += (islem.adet * islem.fiyat);
            h.alisToplamAdet += islem.adet;
        } else if (islem.adet < 0) {
            const satilanAdet = Math.abs(islem.adet);
            h.satisToplamTutar += (satilanAdet * islem.fiyat);
            h.satisToplamAdet += satilanAdet;
        }

        // Sıfırlanma Durumu (Döngü kapanışı - Nakit hariç)
        if (Math.abs(h.kalanAdet) < 0.0001 && islem.menkul !== 'NAKIT' && h.alisToplamAdet > 0) {
            const kar = h.satisToplamTutar - h.alisToplamTutar;
            arsivList.push({
                menkul: islem.menkul,
                adet: h.maxAdet,
                alisFiyati: h.alisToplamTutar / h.alisToplamAdet,
                satisFiyati: h.satisToplamTutar / h.satisToplamAdet,
                kar: kar,
                karYuzde: h.alisToplamTutar > 0 ? kar / h.alisToplamTutar : 0,
                ilkAlimTarihi: h.ilkAlimTarihi,
                sonSatimTarihi: islem.tarih,
                tasimaSuresi: calcDaysBetween(h.ilkAlimTarihi, islem.tarih)
            });

            // Reset for next cycle
            h.kalanAdet = 0;
            h.alisToplamTutar = 0;
            h.alisToplamAdet = 0;
            h.satisToplamTutar = 0;
            h.satisToplamAdet = 0;
            h.maxAdet = 0;
            h.ilkAlimTarihi = null; // Next buy will set this
        } else if (h.kalanAdet > 0 && !h.ilkAlimTarihi) {
            h.ilkAlimTarihi = islem.tarih;
        }
    });

    const portfoyList = [];
    let toplamGuncelTutar = 0;

    Object.keys(historyByMenkul).forEach(menkul => {
        if (menkul.includes('NAK')) return; // Nakit artk bamsz hesaplanyor
        const h = historyByMenkul[menkul];
        const isNakit = false;

        // Aktif portföyde olanlar (0'dan büyükler) ve NAKİT
        if (h.kalanAdet > 0.0001 || isNakit) {
            const guncelFiyat = getFiyat(menkul);
            const guncelTutar = isNakit ? h.kalanAdet : (h.kalanAdet * guncelFiyat);

            toplamGuncelTutar += guncelTutar;

            let guncelMaliyet = 0;
            let netMaliyet = 0;

            if (!isNakit) {
                if (h.alisToplamAdet > 0) guncelMaliyet = h.alisToplamTutar / h.alisToplamAdet;
                if (h.kalanAdet > 0) netMaliyet = (h.alisToplamTutar - h.satisToplamTutar) / h.kalanAdet;
            } else {
                guncelMaliyet = 1;
                netMaliyet = 1;
            }

            const odenenTutar = h.kalanAdet * guncelMaliyet;
            const kar = isNakit ? 0 : guncelTutar - odenenTutar;
            const karYuzde = isNakit ? 0 : (odenenTutar > 0 ? kar / odenenTutar : 0);

            portfoyList.push({
                menkul,
                guncelFiyat,
                adet: h.kalanAdet,
                guncelMaliyet,
                netMaliyet,
                odenenTutar,
                guncelTutar,
                kar,
                karYuzde,
                ilkAlimTarihi: h.ilkAlimTarihi,
                gecenSure: isNakit ? 0 : calcDaysBetween(h.ilkAlimTarihi),
                isNakit
            });
        }
    });

    // Nakiti manuel olarak State'den ekle
    const guncelNakitTutar = State.data.manuelNakitTutar || 0;
    if (guncelNakitTutar !== 0 || true) {
        toplamGuncelTutar += guncelNakitTutar;
        portfoyList.push({
            menkul: 'NAKIT',
            guncelFiyat: 1,
            adet: guncelNakitTutar,
            guncelMaliyet: 1,
            netMaliyet: 1,
            odenenTutar: guncelNakitTutar,
            guncelTutar: guncelNakitTutar,
            kar: 0,
            karYuzde: 0,
            ilkAlimTarihi: new Date().toISOString(),
            gecenSure: 0,
            isNakit: true
        });
    }

    portfoyList.forEach(p => {
        p.portfoyOrani = toplamGuncelTutar > 0 ? p.guncelTutar / toplamGuncelTutar : 0;
    });

    portfoyList.sort((a, b) => {
        if (a.isNakit) return 1;
        if (b.isNakit) return -1;
        return b.guncelTutar - a.guncelTutar;
    });

    // --- Portföy Bilgileri Hesaplama ---
    let anapara = 0;
    let virtualAltinGr = 0;
    let virtualDolar = 0;
    let virtualBist = 0;
    let virtualPry = 0;
    let enflasyonAnapara = 0;

    (nakitHareketleri || []).forEach(n => {
        const tutar = parseFloat(n.tutar);
        anapara += tutar;

        let compoundingFactor = 1;
        const [y, m, d] = n.tarih.split('-');
        let nakitTarih = new Date(y, m - 1, 1);

        if (State.data.enflasyonListesi) {
            State.data.enflasyonListesi.forEach(enf => {
                const [ey, em] = enf.tarih.split('-');
                let enfTarih = new Date(ey, em - 1, 1);
                if (enfTarih >= nakitTarih) {
                    compoundingFactor *= (1 + (parseFloat(enf.oran) / 100));
                }
            });
        }

        const enfAdjustedTutar = tutar * compoundingFactor;

        if (tutar > 0) {
            enflasyonAnapara += enfAdjustedTutar;
            if (n.gramAltin) virtualAltinGr += (tutar / parseFloat(n.gramAltin));
            if (n.dolar) virtualDolar += (tutar / parseFloat(n.dolar));
            if (n.bist100) virtualBist += (tutar / parseFloat(n.bist100));
            if (n.pry) virtualPry += (tutar / parseFloat(n.pry));
        } else {
            // Çıkış varsa oransal düşürme (Basitleştirilmiş)
            if (anapara - tutar > 0) {
                const oran = Math.abs(tutar) / (anapara - tutar);
                enflasyonAnapara -= (enflasyonAnapara * oran);
                virtualAltinGr -= (virtualAltinGr * oran);
                virtualDolar -= (virtualDolar * oran);
                virtualBist -= (virtualBist * oran);
                virtualPry -= (virtualPry * oran);
            }
        }
    });

    const guncelAltin = getFiyat('Gram Altın') || 1;
    const guncelDolar = getFiyat('Dolar') > 1 ? getFiyat('Dolar') : 46.08;
    const guncelBist = getFiyat('BIST') || 1;
    const guncelPry = getFiyat('PRY') || 1;

    const reelAltinDeger = virtualAltinGr * guncelAltin;
    const reelDolarDeger = virtualDolar * guncelDolar;
    const reelBistDeger = virtualBist * guncelBist;
    const brutPryDeger = virtualPry * guncelPry;
    const pryKar = brutPryDeger - anapara;
    const netPryKar = pryKar > 0 ? pryKar * (1 - 0.175) : pryKar;
    const reelPryDeger = anapara + netPryKar;

    const reelGetiriEnflasyon = enflasyonAnapara > 0 ? (toplamGuncelTutar - enflasyonAnapara) / enflasyonAnapara : 0;

    const portfoyBilgileri = {
        toplamPortfoy: toplamGuncelTutar,
        anapara: anapara,
        kar: toplamGuncelTutar - anapara,
        nominalGetiri: anapara > 0 ? (toplamGuncelTutar - anapara) / anapara : 0,
        reelGetiriEnflasyon: reelGetiriEnflasyon,
        reelGetiriAltin: reelAltinDeger > 0 ? (toplamGuncelTutar - reelAltinDeger) / reelAltinDeger : 0,
        reelGetiriDolar: reelDolarDeger > 0 ? (toplamGuncelTutar - reelDolarDeger) / reelDolarDeger : 0,
        reelGetiriBist: reelBistDeger > 0 ? (toplamGuncelTutar - reelBistDeger) / reelBistDeger : 0,
        reelGetiriPry: reelPryDeger > 0 ? (toplamGuncelTutar - reelPryDeger) / reelPryDeger : 0,
        hedefPortfoy: State.data.hedefPortfoyTL || 0,
    };
    portfoyBilgileri.hedefArtis = portfoyBilgileri.hedefPortfoy > toplamGuncelTutar ? (portfoyBilgileri.hedefPortfoy - toplamGuncelTutar) / toplamGuncelTutar : 0;

    arsivList.sort((a, b) => a.menkul.localeCompare(b.menkul));
    return { portfoyList, arsivList, portfoyBilgileri };
};

// --- STATE ---
const DEFAULT_STATE = {
    ekstre: [],
    nakitHareketleri: [],
    enflasyon: [],
    hisseFiyatlari: [
        { menkul: 'BIST', fiyat: 10500 },
        { menkul: 'DOLAR', fiyat: 32.50 },
        { menkul: 'EURO', fiyat: 35.00 },
        { menkul: 'GRAM ALTIN', fiyat: 2450 }
    ],
    hedefFiyatlar: {},
    analizler: [],
    portfoyGecmisi: []
};

const State = {
    data: null,
    unsubscribe: null,

    init(callback) {
        if (this.unsubscribe) this.unsubscribe();
        let isInitialLoad = true;
        this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));

        const processLoadedData = () => {
            if (!this.data.takipListesi) this.data.takipListesi = [];
            if (!this.data.analizler) this.data.analizler = [];
            if (!this.data.portfoyGecmisi) this.data.portfoyGecmisi = [];
            if (!this.data.hedefFiyatlar || Array.isArray(this.data.hedefFiyatlar)) this.data.hedefFiyatlar = {};
            if (this.data.ekstre) {
                this.data.ekstre.forEach(e => {
                    if (e.menkul) {
                        e.menkul = e.menkul.trim().toUpperCase();
                        if (e.menkul === 'NAKİT' || e.menkul === 'NAKT' || e.menkul === 'NAKIT') {
                            e.menkul = 'NAKIT';
                        }
                    }
                });
            }
            if (this.data.hisseFiyatlari) {
                this.data.hisseFiyatlari.forEach(h => { if (h.menkul) h.menkul = h.menkul.trim().toUpperCase(); });
            } else {
                this.data.hisseFiyatlari = [];
            }
        };

        if (!currentUser) {
            const localData = localStorage.getItem('borsa_app_data');
            if (localData) {
                try {
                    this.data = { ...DEFAULT_STATE, ...JSON.parse(localData) };
                } catch (e) {
                    this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
                }
            } else {
                this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
            }
            processLoadedData();
            this.syncHisseFolders();
            if (callback) callback();
            return;
        }

        this.unsubscribe = db.collection('app_data').doc(currentUser.uid).onSnapshot((doc) => {
            if (doc.exists) {
                this.data = { ...DEFAULT_STATE, ...doc.data() };

                // AUTO-RESCUE: If Firebase is empty but local storage or filesystem has data, rescue it!
                let rescuedStr = null;
                try {
                    if (typeof require !== 'undefined') {
                        const fs = require('fs');
                        const path = require('path');
                        const backupPath = path.join(__dirname, 'robust_backup.json');
                        if (fs.existsSync(backupPath)) {
                            rescuedStr = fs.readFileSync(backupPath, 'utf8');
                        }
                    }
                } catch (e) { }

                if (!rescuedStr) rescuedStr = localStorage.getItem('borsa_app_data');

                // ACİL KURTARMA: Eğer veriler silindiyse, en dolu yedeği bul
                if (this.data && (!this.data.ekstre || this.data.ekstre.length === 0)) {
                    let maxLen = 0;
                    for (let i = 1; i <= 4; i++) {
                        try {
                            const bStr = localStorage.getItem('borsa_app_data_backup_' + i);
                            if (bStr) {
                                const bData = JSON.parse(bStr);
                                const len = bData.ekstre ? bData.ekstre.length : 0;
                                if (len > maxLen) {
                                    maxLen = len;
                                    rescuedStr = bStr;
                                }
                            }
                        } catch (e) { }
                    }
                }

                if (rescuedStr) {
                    try {
                        const parsedLocal = JSON.parse(rescuedStr);
                        const localEkstreLen = parsedLocal.ekstre ? parsedLocal.ekstre.length : 0;
                        const fbEkstreLen = this.data.ekstre ? this.data.ekstre.length : 0;

                        const localDataTs = parsedLocal.dataUpdated || parsedLocal.lastUpdated || 0;
                        const fbDataTs = this.data.dataUpdated || this.data.lastUpdated || 0;

                        // KURTARMA ŞARTI: Firebase tamamen boşsa (ekstre yok) ve yerelde ekstre varsa DİREKT KURTAR.
                        // Veya yerel zaman damgası daha yeniyse kurtar.
                        const useLocal = (localDataTs > fbDataTs) || (fbEkstreLen === 0 && localEkstreLen > 0);

                        if (useLocal) {
                            this.data = { ...this.data, ...parsedLocal };
                            this.save(); // Save rescued data back to Firebase
                            console.log("Rescued data from local system based on timestamp!");
                        }
                    } catch (e) { }
                }

                if (window.IMPORT_EKSTRE_DATA && window.IMPORT_EKSTRE_DATA.length > 0) {
                    this.data.ekstre = window.IMPORT_EKSTRE_DATA;
                    this.data.takipListesi = Array.from(new Set([...(this.data.takipListesi || []), ...(window.IMPORT_TAKIP_DATA || [])]));
                    window.IMPORT_EKSTRE_DATA = null;
                    if (window.IMPORT_NAKIT_DATA && window.IMPORT_NAKIT_DATA.length > 0) {
                        this.data.nakitHareketleri = window.IMPORT_NAKIT_DATA;
                        window.IMPORT_NAKIT_DATA = null;
                    }
                    this.save();
                    console.log("IMPORTED EXCEL DATA!");
                }

                processLoadedData();
            } else {
                const localData = localStorage.getItem('borsa_app_data');
                if (localData) {
                    try {
                        this.data = { ...DEFAULT_STATE, ...JSON.parse(localData) };
                    } catch (e) {
                        this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
                    }
                } else {
                    this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
                }

                if (window.IMPORT_EKSTRE_DATA && window.IMPORT_EKSTRE_DATA.length > 0) {
                    this.data.ekstre = window.IMPORT_EKSTRE_DATA;
                    this.data.takipListesi = Array.from(new Set([...(this.data.takipListesi || []), ...(window.IMPORT_TAKIP_DATA || [])]));
                    window.IMPORT_EKSTRE_DATA = null;
                    if (window.IMPORT_NAKIT_DATA && window.IMPORT_NAKIT_DATA.length > 0) {
                        this.data.nakitHareketleri = window.IMPORT_NAKIT_DATA;
                        window.IMPORT_NAKIT_DATA = null;
                    }
                }

                processLoadedData();
                this.syncHisseFolders();
                this.save();
            }
            if (callback && isInitialLoad) {
                callback();
            } else if (!isInitialLoad && typeof renderPage === 'function') {
                // Kendi yaptığımız değişikliklerden sonra Firebase'in döndürdüğü yankıları (echo) 1.5 saniye boyunca yoksay
                if (Date.now() - (this.lastSaveTime || 0) > 1500) {
                    renderPage();
                }
            }
            if (isInitialLoad) {
                isInitialLoad = false;
            }
        }, (error) => {
            console.error("Firebase Hatasi:", error);
            const localData = localStorage.getItem('borsa_app_data');
            if (localData) {
                try {
                    this.data = { ...DEFAULT_STATE, ...JSON.parse(localData) };
                } catch (e) {
                    this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
                }
            }
            if (window.IMPORT_EKSTRE_DATA && window.IMPORT_EKSTRE_DATA.length > 0) {
                this.data.ekstre = window.IMPORT_EKSTRE_DATA;
                this.data.takipListesi = Array.from(new Set([...(this.data.takipListesi || []), ...(window.IMPORT_TAKIP_DATA || [])]));
                window.IMPORT_EKSTRE_DATA = null;
                if (window.IMPORT_NAKIT_DATA && window.IMPORT_NAKIT_DATA.length > 0) {
                    this.data.nakitHareketleri = window.IMPORT_NAKIT_DATA;
                    window.IMPORT_NAKIT_DATA = null;
                }
            }
            if (callback && isInitialLoad) {
                callback();
                isInitialLoad = false;
            }
        });
    },

    save(skipFirebase = false, isUserDataChange = true) {
        if (this.data) {
            if (isUserDataChange) {
                this.data.dataUpdated = Date.now();
            }
            // HACK: Eski web versiyonunun (cache'te kalmış eski kodun) veriyi ezmesini önlemek için
            // lastUpdated değerini suni olarak çok yüksek (yıl 2030) yapıyoruz.
            // Böylece eski kod her halükarda Firebase verisini kendi verisinden daha "yeni" sanıp kabul edecek.
            this.data.lastUpdated = Date.now() + (1000 * 60 * 60 * 24 * 365 * 10);
            this.lastSaveTime = Date.now();

            // ROLLING BACKUP SYSTEM
            try {
                for (let i = 4; i >= 1; i--) {
                    const prev = localStorage.getItem(`borsa_app_data_backup_${i}`);
                    if (prev) localStorage.setItem(`borsa_app_data_backup_${i + 1}`, prev);
                }
                const currentLocal = localStorage.getItem('borsa_app_data');
                if (currentLocal) localStorage.setItem('borsa_app_data_backup_1', currentLocal);
            } catch (e) {
                console.error('Backup error', e);
            }

            try { localStorage.setItem('borsa_app_data', JSON.stringify(this.data)); } catch (e) { console.warn('Quota exceeded, clearing backups'); for (let i = 1; i <= 4; i++) localStorage.removeItem('borsa_app_data_backup_' + i); localStorage.setItem('borsa_app_data', JSON.stringify(this.data)); }

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
        if (skipFirebase) return;
        if (!currentUser || !this.data) return;
        db.collection('app_data').doc(currentUser.uid).set(this.data);
    },


    // TAKİP LİSTESİ
    addTakip(menkul) {
        if (!this.data.takipListesi) this.data.takipListesi = [];
        if (!this.data.takipListesi.includes(menkul)) {
            this.data.takipListesi.push(menkul);
            this.save();
            this.syncHisseFolders();
        }
    },
    removeTakip(menkul) {
        if (!this.data.takipListesi) this.data.takipListesi = [];
        this.data.takipListesi = this.data.takipListesi.filter(m => m !== menkul);
        this.save();
        this.syncHisseFolders();
    },

    syncHisseFolders() {
        try {
            if (typeof require === 'undefined' || typeof __dirname === 'undefined') return;
            const fs = require('fs');
            const path = require('path');

            let appRoot = __dirname;
            if (appRoot.endsWith('js') || appRoot.endsWith('js\\') || appRoot.endsWith('js/')) {
                appRoot = path.join(appRoot, '..');
            }
            if (appRoot.endsWith('www') || appRoot.endsWith('www\\') || appRoot.endsWith('www/')) {
                appRoot = path.join(appRoot, '..');
            }

            const targetDirs = [
                path.join(appRoot, 'Hisseler'),
                path.join(appRoot, 'www', 'Hisseler')
            ];

            const activeTakip = this.data.takipListesi || [];

            targetDirs.forEach(hisselerDir => {
                if (!fs.existsSync(hisselerDir)) {
                    try { fs.mkdirSync(hisselerDir, { recursive: true }); } catch (e) { }
                }

                if (fs.existsSync(hisselerDir)) {
                    activeTakip.forEach(menkul => {
                        const folderPath = path.join(hisselerDir, menkul);
                        if (!fs.existsSync(folderPath)) {
                            try { fs.mkdirSync(folderPath); } catch (e) { }
                        }
                    });

                    const existingFolders = fs.readdirSync(hisselerDir);
                    existingFolders.forEach(folder => {
                        const folderPath = path.join(hisselerDir, folder);
                        if (fs.statSync(folderPath).isDirectory()) {
                            if (!activeTakip.includes(folder)) {
                                try { fs.rmSync(folderPath, { recursive: true, force: true }); } catch (e) { }
                            }
                        }
                    });
                }
            });
        } catch (e) {
            console.log("Klasör senkronizasyonu bu ortamda desteklenmiyor:", e);
        }
    },

    addEkstre(islem) {
        let islemAdet = parseFloat(islem.adet);
        if (islem.islemTip === 'SATIŞ') islemAdet = -Math.abs(islemAdet);

        const tutar = Math.abs(islemAdet) * parseFloat(islem.fiyat);

        this.data.ekstre.push({
            id: Date.now().toString(),
            tarih: islem.tarih,
            islemTip: islem.islemTip,
            menkul: islem.menkul.trim().toUpperCase(),
            adet: islemAdet,
            fiyat: parseFloat(islem.fiyat),
            tutar: tutar
        });

        this.save(false, true);
    },

    deleteEkstre(id) {
        this.data.ekstre = this.data.ekstre.filter(e => e.id !== id);
        this.save(false, true);
    },

    updateEkstre(id, islem) {
        const index = this.data.ekstre.findIndex(e => e.id === id);
        if (index > -1) {
            let islemAdet = parseFloat(islem.adet);
            if (islem.islemTip === 'SATIŞ') islemAdet = -Math.abs(islemAdet);
            const tutar = Math.abs(islemAdet) * parseFloat(islem.fiyat);
            this.data.ekstre[index] = {
                ...this.data.ekstre[index],
                tarih: islem.tarih,
                islemTip: islem.islemTip,
                menkul: islem.menkul.trim().toUpperCase(),
                adet: islemAdet,
                fiyat: parseFloat(islem.fiyat),
                tutar: tutar
            };
            this.save(false, true);
        }
    },

    addNakitHareket(islem) {
        this.data.nakitHareketleri.push({
            id: Date.now().toString(),
            ...islem
        });
        this.save(false, true);
    },
    deleteNakitHareket(id) {
        this.data.nakitHareketleri = this.data.nakitHareketleri.filter(n => n.id !== id);
        this.save(false, true);
    },
    updateNakitHareket(id, islem) {
        const index = this.data.nakitHareketleri.findIndex(n => n.id === id);
        if (index > -1) {
            this.data.nakitHareketleri[index] = { ...this.data.nakitHareketleri[index], ...islem };
            this.save(false, true);
        }
    },

    getFiyat(menkul) {
        if (!menkul) return 0;
        let m = menkul.trim().toUpperCase();
        if (m === 'NAKIT') return 1;
        if (!this.data || !this.data.hisseFiyatlari) return 0;
        const h = this.data.hisseFiyatlari.find(x => x.menkul.trim().toUpperCase() === m);
        return h ? h.fiyat : 0;
    },

    updateFiyat(menkul, fiyat, skipSave = false) {
        if (!menkul) return;
        let m = menkul.trim().toUpperCase();
        if (!this.data) return;
        if (!this.data.hisseFiyatlari) this.data.hisseFiyatlari = [];
        let hf = this.data.hisseFiyatlari.find(h => h.menkul.trim().toUpperCase() === m);
        if (hf) {
            hf.fiyat = parseFloat(fiyat);
            hf.tarih = new Date().toISOString();
        } else {
            this.data.hisseFiyatlari.push({ menkul: m, fiyat: parseFloat(fiyat), tarih: new Date().toISOString() });
        }
        if (!skipSave) this.save(true, false);
    }
};

const ensureDatalist = () => {
    let dl = document.getElementById('bist-hisse-list');
    if (!dl) {
        dl = document.createElement('datalist');
        dl.id = 'bist-hisse-list';
        document.body.appendChild(dl);
    }
    window.defaultStocksArray = ["HLGYO", "KAYSE", "OZRDN", "FONET", "AVGYO", "METRO", "DARDL", "GOODY", "CATES", "KRGYO", "CIMSA", "MPARK", "ARASE", "AVTUR", "BRSAN", "IHAAS", "ZRE20", "ARFYE", "MERKO", "TDGYO", "OFSYM", "EGSER", "AEFES", "TCKRC", "VERTU", "HTTBT", "RUZYE", "EDIP", "BIGCH", "ISYAT", "BALAT", "MEYSU", "TRGYO", "KUTPO", "SEGMN", "BJKAS", "INTEK", "VBTYZ", "AVPGY", "GLBMD", "IEYHO", "BEYAZ", "GENIL", "PAMEL", "MERIT", "ISBIR", "ARMGD", "CEOEM", "EUHOL", "ALARK", "HUNER", "OPTGY", "OZYSR", "SODSN", "SELEC", "BARMA", "UNLU", "ENTRA", "EDATA", "TMSN", "DURDO", "LXGYO", "EKSUN", "KUYAS", "ISCTR", "ARCLK", "DITAS", "TSGYO", "EKIZ", "ACSEL", "AKMGY", "ADEL", "GLCVY", "AKSEN", "RODRG", "ETYAT", "YONGA", "PRKAB", "ISMEN", "VESTL", "INFO", "PNLSN", "MAKIM", "KCHOL", "EKGYO", "AYEN", "GLYHO", "AVOD", "ALGYO", "BRKVY", "CLEBI", "DOFER", "AKHAN", "BRISA", "RUBNS", "VAKBN", "ISGYO", "GLRMK", "OSMEN", "SUNTK", "BASCM", "GMTAS", "BRMEN", "SUWEN", "AGESA", "BULGS", "GWIND", "VKING", "VERUS", "MARTI", "SMRTG", "TRHOL", "YATAS", "CMENT", "DMSAS", "TUCLK", "KARTN", "CWENE", "ZERGY", "SKBNK", "KRDMD", "BANVT", "ALKA", "PINSU", "TGSAS", "KOPOL", "FADE", "TKFEN", "SONME", "PRKME", "SELVA", "AKSGY", "LYDHO", "EUPWR", "PEKGY", "EKOS", "AYCES", "QNBTR", "ADGYO", "TERA", "YESIL", "BIGTK", "A1YEN", "ASGYO", "ESCAR", "CRDFA", "MARMR", "VAKKO", "KFEIN", "KLSER", "SVGYO", "AYGAZ", "KZGYO", "AHGAZ", "OYAKC", "PSDTC", "PKART", "BALSU", "EGEEN", "LMKDC", "BAKAB", "DOCO", "HATSN", "ALCTL", "LIDER", "DIRIT", "MHRGY", "SURGY", "EREGL", "KRTEK", "MOBTL", "TEZOL", "NATEN", "BESTE", "LOGO", "GEDIK", "DENGE", "VKGYO", "ISKPL", "LILAK", "AKFIS", "HEDEF", "PNSUT", "MERCN", "ALKLC", "TURGG", "PAPIL", "ENPRA", "BURVA", "OYAYO", "BEGYO", "YKSLN", "VAKFN", "TLMAN", "BESLR", "UCAYM", "POLTK", "MSGYO", "MAVI", "EUKYO", "ORCAY", "CASA", "AKYHO", "TATGD", "FORTE", "HRKET", "NETAS", "KMPUR", "BIOEN", "ADESE", "KAPLM", "AYDEM", "ULUFA", "HATEK", "ODAS", "ANELE", "KRVGD", "ZPT10", "OPX30", "GOZDE", "AGYO", "PSGYO", "GLDTR", "PAHOL", "GARFA", "ULUUN", "DURKN", "ONRYT", "SEKFK", "DSTKF", "KOCMT", "INGRM", "BSOKE", "EUREN", "GENKM", "MEDTR", "SNPAM", "KUVVA", "SANKO", "AZTEK", "SKTAS", "KENT", "JANTS", "MEGAP", "ULAS", "OZKGY", "VAKFA", "FMIZP", "AGROT", "ANHYT", "VRGYO", "GENTS", "BRKO", "CEMZY", "AKCNS", "EGEPO", "OPT25", "AFYON", "MIATK", "GOKNR", "TSKB", "GRNYO", "KONKA", "SAMAT", "LKMNH", "LINK", "ECOGR", "BTCIM", "ALBRK", "TARKM", "TRALT", "KBORU", "REEDR", "FLAP", "GUNDG", "KTSKR", "EGPRO", "IHEVA", "CVKMD", "KLYPV", "BOSSA", "KOTON", "ISFIN", "DGGYO", "GEDZA", "GRTHO", "VANGD", "DOFRB", "YGGYO", "IZINV", "KRPLS", "TEHOL", "TUPRS", "AGHOL", "APBDL", "TMPOL", "KONTR", "NUGYO", "TTRAK", "HEKTS", "AKBNK", "DMLKT", "IZFAS", "PRZMA", "TRMET", "NIBAS", "MARKA", "OZSUB", "FORMT", "BAGFS", "RNPOL", "MNDRS", "AKFYE", "ALVES", "LYDYE", "QUAGR", "SKYLP", "RYSAS", "KORDS", "VSNMD", "ARDYZ", "ONCSM", "ORMA", "OYLUM", "ZPBDL", "GEREL", "ENJSA", "KRONT", "BINHO", "CANTE", "FZLGY", "TABGD", "PENGD", "ATAKP", "BINBN", "BAHKM", "GARAN", "FENER", "RALYH", "GMSTR", "ARSAN", "BASGZ", "RYGYO", "AVHOL", "AHSGY", "USDTR", "ICUGS", "MACKO", "Z30KP", "DUNYH", "OBAMS", "EBEBK", "NTGAZ", "DGNMO", "SUMAS", "AYES", "DOGUB", "SKYMD", "MANAS", "ISKUR", "PARSN", "HKTM", "YIGIT", "ARZUM", "EMPAE", "ZRGYO", "DOAS", "KATMR", "TURSG", "KLGYO", "KLRHO", "PASEU", "KRDMB", "TNZTP", "BORLS", "TAVHL", "BRKSN", "ULKER", "KERVN", "INVES", "FRMPL", "A1CAP", "OTTO", "BERA", "BFREN", "IZENR", "KLSYN", "YUNSA", "TOASO", "PKENT", "SEYKM", "EGEGY", "ASTOR", "PETKM", "MZHLD", "BNTAS", "PENTA", "ALTNY", "DYOBY", "GUBRF", "ENDAE", "MAGEN", "TSPOR", "CRFSA", "ASUZU", "CUSAN", "ISSEN", "ZEDUR", "CMBTN", "GESAN", "LUKSK", "KSTUR", "ICBCT", "ATEKS", "PAGYO", "EMKEL", "ERBOS", "KAREL", "ODINE", "YYAPI", "TBORG", "OPK30", "MTRYO", "APX30", "MEPET", "SEKUR", "TCELL", "BIGEN", "QNBFK", "ZGYO", "ISDMR", "AKFGY", "INVEO", "ISGLK", "OBASE", "DCTTR", "YEOTK", "LRSHO", "SASA", "KLNMA", "ENERY", "TRILC", "IHYAY", "SAYAS", "SISE", "INDES", "KLMSN", "TKNSA", "MTRKS", "ECZYT", "CELHA", "ANGEN", "CONSE", "SANEL", "HURGZ", "IHGZT", "ESCOM", "OTKAR", "CGCAM", "YAPRK", "HOROZ", "SAHOL", "UFUK", "EYGYO", "CEMTS", "RAYSG", "SNICA", "USAK", "GZNMI", "SERNT", "PLTUR", "SOKM", "ALKIM", "BAYRK", "MRGYO", "DMRGD", "YYLGD", "NUHCM", "ATSYH", "GRSEL", "SEGYO", "MNDTR", "COSMO", "ENSRI", "ERCB", "ENKAI", "FRIGO", "MMCAS", "ASELS", "KRSTL", "KNFRT", "ARENA", "MOGAN", "BUCIM", "Z30KE", "IDGYO", "PRDGS", "DOHOL", "ALCAR", "EGGUB", "DNISI", "ZPLIB", "KCAER", "QTEMZ", "SDTTR", "YBTAS", "BIENY", "MAKTK", "BURCE", "ISBTR", "DAPGM", "BRYAT", "KRDMA", "MEGMT", "TUREX", "BYDNR", "BVSAN", "ATAGY", "GOLTS", "BIMAS", "ETILR", "AKSUE", "ANSGR", "BIZIM", "MARBL", "YAYLA", "EFOR", "EMNIS", "HDFGS", "SAFKR", "DERHL", "TATEN", "TTKOM", "SRVGY", "MRSHL", "CEMAS", "NETCD", "KGYO", "ZOREN", "VESBE", "BLUME", "IMASM", "POLHO", "ALTIN", "SNGYO", "FROTO", "TRCAS", "ORGE", "ALFAS", "SILVR", "MEKAG", "GSDHO", "PATEK", "HALKB", "SARKY", "ATLAS", "ARTMS", "TUKAS", "AAGYO", "IHLAS", "KONYA", "GIPTA", "MCARD", "PCILT", "ATATR", "RGYAS", "TEKTU", "SMART", "EUYO", "SMRVA", "AKSA", "ELITE", "YKBNK", "KIMMR", "BMSTL", "BOBET", "AKENR", "ULUSE", "KZBGY", "INTEM", "BRLSM", "CCOLA", "OZGYO", "BMSCH", "DEVA", "GSDDE", "DESPC", "DESA", "ERSU", "MAALT", "DAGI", "IZMDC", "KTLEV", "PETUN", "OSTIM", "RTALB", "DZGYO", "IHLGM", "OPTLR", "MOPAS", "PGSUS", "DGATE", "NTHOL", "ZGOLD", "SOKE", "EKDMR", "SANFM", "ATATP", "MGROS", "ECILC", "KARSN", "GLRYH", "OYYAT", "LIDFA", "OZATD", "THYAO", "DERIM", "ZSR25", "DOKTA", "HUBVC", "VKFYO", "EPLAS", "GATEG", "GSRAY", "AKGRT", "KLKIM", "TRENJ", "BORSK", "ESEN", "ISGSY", "BLCYT"];
    const stocks = (State.bistStocks && State.bistStocks.length > 0) ? State.bistStocks : window.defaultStocksArray;
    dl.innerHTML = stocks.map(s => `<option value="${s}"></option>`).join('');
};

window.fetchGuncelFiyatlar = async () => {
    // 1. Dolar ve Altın (TradingView)
    try {
        const trRes = await fetch('https://scanner.tradingview.com/global/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ symbols: { tickers: ['OANDA:XAUUSD', 'FX:USDTRY', 'FX:EURTRY'] }, columns: ['close'] })
        });
        if (trRes.ok) {
            const trJson = await trRes.json();
            const usdObj = trJson.data.find(x => x.s === 'FX:USDTRY');
            const onsObj = trJson.data.find(x => x.s === 'OANDA:XAUUSD');
            if (usdObj) {
                State.updateFiyat('DOLAR', usdObj.d[0], true);
            }
            if (usdObj && onsObj) {
                const graPrice = (onsObj.d[0] * usdObj.d[0]) / 31.1035;
                State.updateFiyat('GRAM ALTIN', graPrice, true);
            }
        }
    } catch (e) {
        console.error('TradingView Dolar/Altın çekilemedi:', e);
    }

    // 2. Hisse Senetleri
    let tvBasarili = false;
    try {
        const tvResponse = await fetch('https://scanner.tradingview.com/turkey/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: JSON.stringify({
                filter: [{ "left": "type", "operation": "in_range", "right": ["stock", "dr", "fund"] }],
                markets: ["turkey"],
                columns: ["name", "close", "change"],
                range: [0, 5000]
            })
        });

        if (tvResponse.ok) {
            const tvData = await tvResponse.json();
            if (!State.bistStocks) State.bistStocks = [];
            tvData.data.forEach(item => {
                let menkul = item.d[0];
                const fiyat = item.d[1];
                const degisim = item.d[2];
                window.tickerData = window.tickerData || {};
                window.tickerData[menkul] = { c: fiyat, chp: degisim };
                if (menkul === "ALTIN") menkul = "ALTINS1"; // Darphane Altın Sertifikası Eşleştirmesi
                State.updateFiyat(menkul, fiyat, true);
                if (!State.bistStocks.includes(menkul)) State.bistStocks.push(menkul);
            });
            tvBasarili = true;
            if (typeof ensureDatalist === 'function') ensureDatalist();
        }
    } catch (e) {
        console.warn('TradingView engellendi, Yahoo Finance v8 çoklu proxy üzerinden çekilecek...');
    }

    try {
        const symbolsSet = new Set();
        State.data.hisseFiyatlari.forEach(h => { if (h.menkul) symbolsSet.add(h.menkul.trim().toUpperCase()); });
        State.data.ekstre.forEach(e => { if (e.menkul) symbolsSet.add(e.menkul.trim().toUpperCase()); });
        const exclude = ['DOLAR', 'GRAM ALTIN', 'NAKIT', 'BIST'];

        const symbolsToFetch = Array.from(symbolsSet).filter(m => !exclude.includes(m) && (!tvBasarili || !State.bistStocks.includes(m) || State.getFiyat(m) === 0));

        if (symbolsToFetch.length > 0) {
            const fetchPromises = symbolsToFetch.map(async (menkul) => {
                let yfSym = menkul;
                if (menkul === "ALTINS1") yfSym = "ALTIN-S1";
                const targetUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${yfSym}.IS?interval=1d`;
                const proxies = [
                    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
                    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
                ];

                for (const proxy of proxies) {
                    try {
                        const yfResponse = await fetch(proxy);
                        if (!yfResponse.ok) continue;
                        const yfData = await yfResponse.json();
                        if (yfData && yfData.chart && yfData.chart.result && yfData.chart.result.length > 0) {
                            const meta = yfData.chart.result[0].meta;
                            const fiyat = meta.regularMarketPrice;
                            if (fiyat) {
                                State.updateFiyat(menkul, fiyat, true);
                                window.tickerData = window.tickerData || {};
                                let degisim = 0;
                                if (meta.previousClose && meta.previousClose > 0) {
                                    degisim = ((fiyat - meta.previousClose) / meta.previousClose) * 100;
                                }
                                window.tickerData[menkul] = { c: fiyat, chp: degisim };
                                break;
                            }
                        }
                    } catch (err) { }
                }
            });
            await Promise.all(fetchPromises);
        }
    } catch (e2) {
        console.error('Yahoo Finance yedek sistemi başarısız oldu.', e2);
    }

    // 2.5 Native TEFAS Fetcher (Electron Masaüstü Uygulaması İçin)
    try {
        const symbolsSet = new Set();
        State.data.hisseFiyatlari.forEach(h => { if (h.menkul) symbolsSet.add(h.menkul.trim().toUpperCase()); });
        State.data.ekstre.forEach(e => { if (e.menkul) symbolsSet.add(e.menkul.trim().toUpperCase()); });
        const exclude = ['DOLAR', 'GRAM ALTIN', 'NAKIT', 'BIST'];
        const symbolsToFetch = Array.from(symbolsSet).filter(m => !exclude.includes(m) && State.getFiyat(m) === 0);

        if (symbolsToFetch.length > 0) {
            const fetchPromises = symbolsToFetch.map(async (menkul) => {
                if (menkul.length === 3 && !menkul.match(/[0-9]/)) {
                    try {
                        const tefasUrl = `https://www.tefas.gov.tr/tr/fon-detayli-analiz/${menkul}`;
                        const tefasRes = await fetch(tefasUrl);
                        if (tefasRes.ok) {
                            const html = await tefasRes.text();
                            let match = html.match(/"sonFiyat\\":([\\d\\.]+)/);
                            if (!match) match = html.match(/"sonFiyat":([\\d\\.]+)/);
                            if (match) {
                                State.updateFiyat(menkul, parseFloat(match[1]), true);
                            }
                        }
                    } catch (err) { }
                }
            });
            await Promise.all(fetchPromises);
        }
    } catch (e) { }

    // 3. TEFAS Fonları ve Özel Hisseler (Google Apps Script API)
    const gasUrl = localStorage.getItem('exchangeApp_gasUrl');
    if (gasUrl) {
        try {
            const symbolsSet = new Set();
            State.data.hisseFiyatlari.forEach(h => { if (h.menkul) symbolsSet.add(h.menkul.trim().toUpperCase()); });
            State.data.ekstre.forEach(e => { if (e.menkul) symbolsSet.add(e.menkul.trim().toUpperCase()); });
            const symbolsToFetch = Array.from(symbolsSet).filter(m => m !== 'DOLAR' && m !== 'GRAM ALTIN' && m !== 'NAKIT' && !State.bistStocks.includes(m));

            if (symbolsToFetch.length > 0) {
                const gasRes = await fetch(gasUrl + '?symbols=' + symbolsToFetch.join(','));
                if (gasRes.ok) {
                    const gasData = await gasRes.json();
                    for (const sym in gasData) {
                        if (gasData[sym] > 0) {
                            State.updateFiyat(sym, gasData[sym], true);
                        }
                    }
                }
            }
        } catch (e) {
            console.error("GAS API hatası:", e);
        }
    }

    ensureDatalist();
    State.save(true, false);
    if (typeof renderPage === 'function' && (currentPage === 'giris' || currentPage === 'hedef' || currentPage === 'gorunum')) {
        renderPage();
    }
};

// --- PAGES ---
const renderPortfoy = (container) => {
    window.portfoyTab = window.portfoyTab || 'varliklar';
    window.setPortfoyTab = window.setPortfoyTab || ((tab) => {
        window.portfoyTab = tab;
        if (typeof renderPage === 'function') renderPage();
    });
    const { portfoyList, arsivList, portfoyBilgileri } = calculatePortfoy(State.data.ekstre, (m) => State.getFiyat(m), State.data.nakitHareketleri);

    let totalOdenen = 0, totalGuncel = 0, totalKar = 0;
    let hissePortfoyTutar = 0, fonPortfoyTutar = 0;

    const filteredPortfoy = portfoyList.filter(p => !p.isNakit);

    window.varliklarSort = window.varliklarSort || { col: null, asc: true };
    filteredPortfoy.sort((a, b) => {
        if (!window.varliklarSort.col) {
            const aTur = a.menkul.length === 3 ? 1 : 0;
            const bTur = b.menkul.length === 3 ? 1 : 0;
            if (aTur !== bTur) return aTur - bTur;
            return b.guncelTutar - a.guncelTutar;
        }

        let valA, valB;
        if (window.varliklarSort.col === 'menkul') {
            valA = a.menkul; valB = b.menkul;
            return window.varliklarSort.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else if (window.varliklarSort.col === 'odenenTutar') {
            valA = a.odenenTutar; valB = b.odenenTutar;
        } else if (window.varliklarSort.col === 'guncelTutar') {
            valA = a.guncelTutar; valB = b.guncelTutar;
        } else if (window.varliklarSort.col === 'kar') {
            valA = a.kar; valB = b.kar;
        } else if (window.varliklarSort.col === 'karYuzde') {
            valA = a.karYuzde; valB = b.karYuzde;
        } else if (window.varliklarSort.col === 'portfoyOrani') {
            valA = a.portfoyOrani; valB = b.portfoyOrani;
        } else if (window.varliklarSort.col === 'ilkAlimTarihi') {
            valA = new Date(a.ilkAlimTarihi).getTime(); valB = new Date(b.ilkAlimTarihi).getTime();
        } else if (window.varliklarSort.col === 'gecenSure') {
            valA = new Date(a.ilkAlimTarihi).getTime(); valB = new Date(b.ilkAlimTarihi).getTime();
            return window.varliklarSort.asc ? valB - valA : valA - valB;
        }

        return window.varliklarSort.asc ? valA - valB : valB - valA;
    });

    let portfoyHtml = filteredPortfoy.map((p, i) => {
        totalOdenen += p.odenenTutar;
        totalKar += p.kar;
        totalGuncel += p.guncelTutar;

        if (p.menkul.length === 3) fonPortfoyTutar += p.guncelTutar;
        else hissePortfoyTutar += p.guncelTutar;

        const tur = p.menkul.length === 3 ? 'Fon' : 'Hisse';
        let fiyatHtml = `<td style="text-align: right !important;">${formatCurrency(p.guncelFiyat)}</td>`;
        if (tur === 'Fon') {
            if (p.menkul === 'PRY') {
                fiyatHtml = `<td style="text-align: right !important;">
                    <div style="display:flex; justify-content:flex-end; align-items:center; gap:0.5rem;">
                        <span class="pry-text" style="cursor:pointer;" onclick="this.style.display='none'; this.nextElementSibling.style.display='inline-block'; this.nextElementSibling.focus();" title="Düzenlemek için tıklayın">₺${p.guncelFiyat.toLocaleString('tr-TR', { minimumFractionDigits: 6, maximumFractionDigits: 6 })}</span>
                        <input type="number" step="0.000001" class="form-control glass-input inline-pry-input" style="display:none; width: 80px; text-align: right; padding: 2px 4px; font-size: 12px; height: 24px;" value="${p.guncelFiyat}" onblur="window.saveVarliklarEdit()" onkeydown="if(event.key==='Enter') window.saveVarliklarEdit()">
                    </div>
                </td>`;
            } else {
                fiyatHtml = `<td style="text-align: right !important;">${formatCurrency(p.guncelFiyat)}</td>`;
            }
        }


        let menkulHtml = `<td style="text-align: left !important;" class="takip-hisse-link" onclick="window.goToHisse('${p.menkul}')">${p.menkul}</td>`;
        if (tur === 'Fon') {
            menkulHtml = `<td style="text-align: left !important;" class="takip-hisse-link" onclick="window.goToHisse('${p.menkul}')">${p.menkul}</td>`;
        }

        return `<tr>
            <td style="text-align: center !important;">${i + 1}</td>
            ${menkulHtml}
            <td style="text-align: left !important;">${tur}</td>
            ${fiyatHtml}
            <td style="text-align: right !important;">${p.adet.toLocaleString('tr-TR')}</td>
            <td style="text-align: right !important;">${formatCurrency(p.guncelMaliyet)}</td>
            <td style="text-align: right !important;">${formatCurrency(p.netMaliyet)}</td>
            <td style="text-align: right !important;">${formatCurrency(p.odenenTutar, 0)}</td>
            <td style="text-align: right !important;">${formatCurrency(p.guncelTutar, 0)}</td>
            <td class="${p.kar >= 0 ? 'text-success' : 'text-danger'}" style="text-align: right !important;">${formatCurrency(p.kar, 0)}</td>
            <td class="${p.kar >= 0 ? 'text-success' : 'text-danger'}" style="text-align: right !important;">${formatPercent(p.karYuzde, 0)}</td>
            <td style="text-align: right !important;">${formatPercent(p.portfoyOrani, 0)}</td>
            <td style="text-align: right !important;">${formatDate(p.ilkAlimTarihi)}</td>
            <td style="text-align: right !important;">${p.gecenSure}</td>
        </tr>`;
    }).join('');

    const nakitItemForTable = portfoyList.find(p => p.isNakit);
    let guncelNakitDeger = State.data.manuelNakitTutar || 0;
    
    // We add Nakit to totals regardless of value since we now show it
    totalGuncel += guncelNakitDeger;
    totalOdenen += guncelNakitDeger;
    
    const nakitOran = (totalGuncel > 0) ? (guncelNakitDeger / totalGuncel) : 0;

    portfoyHtml += `<tr>
        <td style="text-align: center !important;">${filteredPortfoy.length + 1}</td>
        <td style="text-align: left !important;">Nakit</td>
        <td style="text-align: left !important;">Nakit</td>
        <td style="text-align: right !important;"></td>
        <td style="text-align: right !important;"></td>
        <td style="text-align: right !important;"></td>
        <td style="text-align: right !important;"></td>
        <td style="text-align: right !important;"></td>
        <td style="text-align: right !important; border-right: 1px solid rgba(255, 255, 255, 0.03);">
            <div style="display:flex; justify-content:flex-end; align-items:center; gap:0.5rem;">
                <span style="cursor:pointer;" onclick="this.style.display='none'; this.nextElementSibling.style.display='inline-block'; this.nextElementSibling.focus();" title="Düzenlemek için tıklayın">${formatCurrency(guncelNakitDeger, 2)}</span>
                <input type="number" step="0.01" class="form-control glass-input" style="display:none; width: 100px; text-align: right; padding: 2px 4px; font-size: 12px; height: 24px;" value="${guncelNakitDeger}" onblur="window.saveNakitVarlikEdit(this)" onkeydown="if(event.key==='Enter') window.saveNakitVarlikEdit(this)">
            </div>
        </td>
        <td style="text-align: right !important;"></td>
        <td style="text-align: right !important;"></td>
        <td style="text-align: right !important;">${formatPercent(nakitOran, 0)}</td>
        <td style="text-align: right !important;"></td>
        <td style="text-align: right !important;"></td>
    </tr>`;

    let arsivKarTotal = 0;

    window.arsivSort = window.arsivSort || { col: null, asc: true };
    arsivList.sort((a, b) => {
        if (!window.arsivSort.col) return 0;

        let valA, valB;
        if (window.arsivSort.col === 'menkul') {
            valA = a.menkul; valB = b.menkul;
            return window.arsivSort.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else if (window.arsivSort.col === 'kar') {
            valA = a.kar; valB = b.kar;
        } else if (window.arsivSort.col === 'karYuzde') {
            valA = a.karYuzde; valB = b.karYuzde;
        } else if (window.arsivSort.col === 'ilkAlimTarihi') {
            valA = new Date(a.ilkAlimTarihi).getTime(); valB = new Date(b.ilkAlimTarihi).getTime();
        } else if (window.arsivSort.col === 'sonSatimTarihi') {
            valA = new Date(a.sonSatimTarihi).getTime(); valB = new Date(b.sonSatimTarihi).getTime();
        } else if (window.arsivSort.col === 'tasimaSuresi') {
            valA = new Date(a.sonSatimTarihi).getTime() - new Date(a.ilkAlimTarihi).getTime();
            valB = new Date(b.sonSatimTarihi).getTime() - new Date(b.ilkAlimTarihi).getTime();
        }

        return window.arsivSort.asc ? valA - valB : valB - valA;
    });

    const arsivHtml = arsivList.map((a, i) => {
        arsivKarTotal += a.kar;
        const guncelFiyat = State.getFiyat(a.menkul);
        return `<tr>
            <td style="text-align: center !important;">${i + 1}</td>
            <td style="text-align: left !important;" class="takip-hisse-link" onclick="window.goToHisse('${a.menkul}')">${a.menkul}</td>
            <td style="text-align: right !important;">${formatCurrency(guncelFiyat)}</td>
            <td style="text-align: right !important;">${a.adet.toLocaleString('tr-TR')}</td>
            <td style="text-align: right !important;">${formatCurrency(a.alisFiyati)}</td>
            <td style="text-align: right !important;">${formatCurrency(a.satisFiyati)}</td>
            <td class="${a.kar >= 0 ? 'text-success' : 'text-danger'}" style="text-align: right !important;">${formatCurrency(a.kar, 0)}</td>
            <td class="${a.kar >= 0 ? 'text-success' : 'text-danger'}" style="text-align: right !important;">${formatPercent(a.karYuzde, 0)}</td>
            <td style="text-align: right !important;">${formatDate(a.ilkAlimTarihi)}</td>
            <td style="text-align: right !important;">${formatDate(a.sonSatimTarihi)}</td>
            <td style="text-align: right !important;">${a.tasimaSuresi}</td>
        </tr>`;
    }).join('');

    const nakitItem = portfoyList.find(p => p.isNakit);
    const guncelNakitTutar = nakitItem ? nakitItem.guncelTutar : 0;



    const getTabBg = (tab) => window.portfoyTab === tab ? 'var(--overlay-bg)' : 'transparent';
    const getTabColor = (tab) => window.portfoyTab === tab ? 'var(--active-text-color)' : 'var(--text-secondary)';
    const tabsHtml = `
        <style>
            .portfoy-tab-btn:hover { color: var(--active-text-color) !important; background: var(--overlay-bg) !important; }
        </style>
        <div style="display: flex; gap: 0.5rem; align-items: center; justify-content: flex-start; overflow-x: auto; white-space: nowrap; width: 100%;">
            <span class="portfoy-tab-btn" style="cursor: pointer; font-size: 12px !important; font-weight: normal; padding: 6px 12px; border-radius: 4px; background: ${getTabBg('varliklar')}; color: ${getTabColor('varliklar')}; transition: color 0.2s;" onclick="window.setPortfoyTab('varliklar')">Varlıklarım</span>
            <span class="portfoy-tab-btn" style="cursor: pointer; font-size: 12px !important; font-weight: normal; padding: 6px 12px; border-radius: 4px; background: ${getTabBg('bilgiler')}; color: ${getTabColor('bilgiler')}; transition: color 0.2s;" onclick="window.setPortfoyTab('bilgiler')">Portföy Bilgileri</span>
            <span class="portfoy-tab-btn" style="cursor: pointer; font-size: 12px !important; font-weight: normal; padding: 6px 12px; border-radius: 4px; background: ${getTabBg('gecmis')}; color: ${getTabColor('gecmis')}; transition: color 0.2s;" onclick="window.setPortfoyTab('gecmis')">Günlük Portföy Değişimi</span>
            ${!(window.Capacitor && window.Capacitor.isNative) ? `<span class="portfoy-tab-btn" style="cursor: pointer; font-size: 12px !important; font-weight: normal; padding: 6px 12px; border-radius: 4px; background: ${getTabBg('arsiv')}; color: ${getTabColor('arsiv')}; transition: color 0.2s;" onclick="window.setPortfoyTab('arsiv')">Arşiv</span>` : ''}
        </div>
    `;

    let tabContentHtml = '';

    if (window.portfoyTab === 'bilgiler') {
        tabContentHtml = `
            <div id="portfoy-bilgiler" class="portfoy-tab-content" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 0;">
                <div class="flex-row" style="align-items: stretch; gap: 2rem; flex-wrap: wrap; padding: 0;">
                    <div class="table-container" style="margin-bottom: 0; width: max-content; overflow-x: auto;">
                        <table class="dash-table compact-table" style="width: max-content; white-space: nowrap;">
                            <tbody>
                                <tr>
                                    <td style="text-align:left !important; width:50%;">Toplam Portföy</td>
                                    <td style="text-align:right !important; width:50%; border-right: 1px solid rgba(255, 255, 255, 0.03);">${formatCurrency(portfoyBilgileri.toplamPortfoy)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Nakit</td>
                                    <td style="text-align:right !important; border-right: 1px solid rgba(255, 255, 255, 0.03);">
                                        <span id="nakit-text">${formatCurrency(guncelNakitTutar, 2)}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Hisse Portföyü</td>
                                    <td style="text-align:right !important; border-right: 1px solid rgba(255, 255, 255, 0.03);">${formatCurrency(hissePortfoyTutar)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Fon Portföyü</td>
                                    <td style="text-align:right !important; border-right: 1px solid rgba(255, 255, 255, 0.03);">${formatCurrency(fonPortfoyTutar)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Anapara</td>
                                    <td style="text-align:right !important; border-right: 1px solid rgba(255, 255, 255, 0.03);">${formatCurrency(portfoyBilgileri.anapara)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Kar</td>
                                    <td style="text-align:right !important; border-right: 1px solid rgba(255, 255, 255, 0.03);" class="${portfoyBilgileri.kar >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(portfoyBilgileri.kar)}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                                    <td style="text-align:left !important;">Nominal Getiri Oranı</td>
                                    <td style="text-align:right !important; border-right: 1px solid rgba(255, 255, 255, 0.03);" class="${portfoyBilgileri.nominalGetiri >= 0 ? 'text-success' : 'text-danger'}">${formatPercent(portfoyBilgileri.nominalGetiri)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Reel Getiri Oranı (Enflasyon)</td>
                                    <td style="text-align:right !important; border-right: 1px solid rgba(255, 255, 255, 0.03);" class="${portfoyBilgileri.reelGetiriEnflasyon >= 0 ? 'text-success' : 'text-danger'}">${formatPercent(portfoyBilgileri.reelGetiriEnflasyon)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">BIST 100'e Göre Reel Getiri Oranı</td>
                                    <td style="text-align:right !important; border-right: 1px solid rgba(255, 255, 255, 0.03);" class="${portfoyBilgileri.reelGetiriBist >= 0 ? 'text-success' : 'text-danger'}">${formatPercent(portfoyBilgileri.reelGetiriBist)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Dolar Kuruna Göre Reel Getiri Oranı</td>
                                    <td style="text-align:right !important; border-right: 1px solid rgba(255, 255, 255, 0.03);" class="${portfoyBilgileri.reelGetiriDolar >= 0 ? 'text-success' : 'text-danger'}">${formatPercent(portfoyBilgileri.reelGetiriDolar)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Gram Altına Göre Reel Getiri Oranı</td>
                                    <td style="text-align:right !important; border-right: 1px solid rgba(255, 255, 255, 0.03);" class="${portfoyBilgileri.reelGetiriAltin >= 0 ? 'text-success' : 'text-danger'}">${formatPercent(portfoyBilgileri.reelGetiriAltin)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">PRY Fonuna Göre Reel Getiri Oranı</td>
                                    <td style="text-align:right !important; border-right: 1px solid rgba(255, 255, 255, 0.03);" class="${portfoyBilgileri.reelGetiriPry >= 0 ? 'text-success' : 'text-danger'}">${formatPercent(portfoyBilgileri.reelGetiriPry)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Hedef Portföy</td>
                                    <td style="text-align:right !important; border-right: 1px solid rgba(255, 255, 255, 0.03); cursor: pointer;" ondblclick="window.togglePortfoyEdit()" title="Düzenlemek için çift tıklayın">
                                        <div style="display:flex; justify-content:flex-end; align-items:center; gap:0.5rem;">
                                            <span id="hedef-text">${formatCurrency(portfoyBilgileri.hedefPortfoy, 0)}</span>
                                            <input type="number" id="inline-hedef-input" class="form-control glass-input" style="display:none; width: 100px; text-align: right; padding: 2px 4px; font-size: 12px; height: 24px;" value="${portfoyBilgileri.hedefPortfoy}" onblur="window.savePortfoyEdit()" onkeydown="if(event.key==='Enter') window.savePortfoyEdit()">
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Hedefe Ulaşmak İçin Gereken Artış %</td>
                                    <td style="text-align:right !important; border-right: 1px solid rgba(255, 255, 255, 0.03);">${formatPercent(portfoyBilgileri.hedefArtis, 0)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="flex: 1; min-width: 300px; max-width: 500px; display: flex; justify-content: center; align-items: center; padding: 1rem;">
                        <canvas id="chart-ozet" style="max-height: 100%; max-width: 100%;"></canvas>
                    </div>
                </div>
            </div>
        `;
    } else if (window.portfoyTab === 'gecmis') {
        tabContentHtml = `
            <style>
            .chart-filter {
                font-size: 12px !important;
                color: #cccccc !important;
                font-weight: normal !important;
                transition: color 0.2s, background 0.2s;
            }
            .chart-filter:hover, .chart-filter.active-filter {
                color: var(--active-text-color) !important;
            }
            </style>
            <div style="display: flex; flex-direction: column; width: 100%; min-height: 350px; margin-bottom: 0;">
                <div style="padding: 8px 1rem 0 1rem;">
                    <div id="portfoy-chart-filters" style="display:flex; gap:0.5rem; font-size:13px; color:var(--text-primary);">
                        <span class="chart-filter" data-range="1H" style="cursor:pointer; padding:2px 6px; border-radius:4px;" onclick="window.setPortfoyChartRange('1H')">1H</span>
                        <span class="chart-filter" data-range="1A" style="cursor:pointer; padding:2px 6px; border-radius:4px;" onclick="window.setPortfoyChartRange('1A')">1A</span>
                        <span class="chart-filter" data-range="6A" style="cursor:pointer; padding:2px 6px; border-radius:4px;" onclick="window.setPortfoyChartRange('6A')">6A</span>
                        <span class="chart-filter" data-range="YBK" style="cursor:pointer; padding:2px 6px; border-radius:4px;" onclick="window.setPortfoyChartRange('YBK')">YBK</span>
                        <span class="chart-filter" data-range="1Y" style="cursor:pointer; padding:2px 6px; border-radius:4px;" onclick="window.setPortfoyChartRange('1Y')">1Y</span>
                        <span class="chart-filter" data-range="5Y" style="cursor:pointer; padding:2px 6px; border-radius:4px;" onclick="window.setPortfoyChartRange('5Y')">5Y</span>
                        <span class="chart-filter" data-range="MAX" style="cursor:pointer; padding:2px 6px; border-radius:4px;" onclick="window.setPortfoyChartRange('MAX')">Maks.</span>
                    </div>
                </div>
                <div style="width: 100%; height: 300px; position: relative; padding: 1rem;">
                    <canvas id="chart-portfoy-gecmisi"></canvas>
                </div>
            </div>
        `;
    } else if (window.portfoyTab === 'varliklar') {
        tabContentHtml = `
            <div id="portfoy-varliklar" class="portfoy-tab-content" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 0;">

                <div class="table-container" style="margin-bottom: 0; overflow-x: auto;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 0px;">
                    <div style="width: 100%; overflow-x: auto;">
                        <table class="dash-table compact-table varliklar-table" style="text-align: center; border-collapse: separate; border-spacing: 0;">
                            <thead style="position: sticky; top: 0; z-index: 10; background: var(--table-header-bg);">
                                <tr><th>S.N.</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleVarliklarSort('menkul')">Menkul${getVarliklarSortIcon('menkul')}</th><th>Tür</th><th>Güncel Fiyat</th><th>Adet</th><th>Güncel Maliyet</th><th>Net Maliyet</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleVarliklarSort('odenenTutar')">Ödenen Tutar${getVarliklarSortIcon('odenenTutar')}</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleVarliklarSort('guncelTutar')">Güncel Tutar${getVarliklarSortIcon('guncelTutar')}</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleVarliklarSort('kar')">Kar/Zarar${getVarliklarSortIcon('kar')}</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleVarliklarSort('karYuzde')">Kar/Zarar %${getVarliklarSortIcon('karYuzde')}</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleVarliklarSort('portfoyOrani')">Portföy Oranı${getVarliklarSortIcon('portfoyOrani')}</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleVarliklarSort('ilkAlimTarihi')">İlk Alım Tarihi${getVarliklarSortIcon('ilkAlimTarihi')}</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleVarliklarSort('gecenSure')">Geçen Süre${getVarliklarSortIcon('gecenSure')}</th></tr>
                            </thead>
                            <tbody>
                                ${portfoyHtml}
                                <tr class="total-row" style="background: transparent !important;">
                                    <td style="text-align: center !important; font-weight: normal !important; border: none; background: transparent !important;"></td>
                                    <td style="text-align: left !important; font-weight: normal !important; border: none; background: transparent !important;">TOPLAM</td>
                                    <td colspan="5" style="text-align: right !important; font-weight: normal !important; border: none; background: transparent !important;"></td>
                                    <td style="text-align: right !important; font-weight: normal !important; border: none; background: transparent !important;">${formatCurrency(totalOdenen, 0)}</td>
                                    <td style="text-align: right !important; font-weight: normal !important; border: none; background: transparent !important;">${formatCurrency(totalGuncel, 0)}</td>
                                    <td style="text-align: right !important; font-weight: normal !important; border: none; background: transparent !important; color: ${totalKar >= 0 ? 'var(--success-color)' : 'var(--danger-color)'} !important;">${formatCurrency(totalKar, 0)}</td>
                                    <td colspan="4" style="text-align: right !important; font-weight: normal !important; border: none; background: transparent !important;"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="position: relative; width: 330px; height: 330px; display: block; margin: 0 auto;">
                        <canvas id="chart-varliklar"></canvas>
                    </div>
                </div>
                </div>
            </div>
        `;
    } else if (window.portfoyTab === 'arsiv') {
        tabContentHtml = `
            <div id="portfoy-arsiv" class="portfoy-tab-content" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 0; flex: 1; height: calc(100vh - 140px);">
                <div class="table-container custom-scroll" style="margin-bottom: 0; overflow-x: auto; overflow-y: auto; height: 100%;">

                    <table class="dash-table compact-table" style="min-width: 1000px; text-align: center; border-collapse: separate; border-spacing: 0;">
                        <thead style="position: sticky; top: 0; z-index: 10; background: var(--table-header-bg);">
                            <tr><th style="font-size: 14px;">S.N.</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleArsivSort('menkul')">Menkul${getArsivSortIcon('menkul')}</th><th>Güncel Fiyat</th><th>Adet</th><th>Alış Fiyatı</th><th>Satış Fiyatı</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleArsivSort('kar')">Kar / Zarar${getArsivSortIcon('kar')}</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleArsivSort('karYuzde')">Kar / Zarar %${getArsivSortIcon('karYuzde')}</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleArsivSort('ilkAlimTarihi')">İlk Alım Tarihi${getArsivSortIcon('ilkAlimTarihi')}</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleArsivSort('sonSatimTarihi')">Son Satım Tarihi${getArsivSortIcon('sonSatimTarihi')}</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleArsivSort('tasimaSuresi')">Taşıma Süresi${getArsivSortIcon('tasimaSuresi')}</th></tr>
                        </thead>
                        <tbody>
                            ${arsivHtml}
                            <tr class="total-row" style="background: transparent !important;">
                                <td style="text-align: center !important; font-weight: normal !important; border: none; background: transparent !important;"></td>
                                <td style="text-align: left !important; font-weight: normal !important; border: none; background: transparent !important;">TOPLAM</td>
                                <td colspan="4" style="text-align: right !important; font-weight: normal !important; border: none; background: transparent !important;"></td>
                                <td style="text-align: right !important; font-weight: normal !important; border: none; background: transparent !important; color: ${arsivKarTotal >= 0 ? 'var(--success-color)' : 'var(--danger-color)'} !important;">${formatCurrency(arsivKarTotal, 0)}</td>
                                <td colspan="4" style="text-align: right !important; font-weight: normal !important; border: none; background: transparent !important;"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    const html = `
        <style>
            .portfoy-tab-content table th {
                padding: 12px 4px !important;
            }
            .portfoy-tab-content table th, .portfoy-tab-content table td {
                font-size: 12px !important;
                font-weight: normal !important;
            }
            table .total-row td, .std-table .total-row td, .dash-table .total-row td {
                font-size: 12px !important;
            }
        </style>
        <div class="page-section active" style="display: flex; flex-direction: column; padding: 0px; gap: 1rem;">
            <div class="glass" style="display: flex; flex-direction: column; padding: 0.5rem 1rem; width: 100%;">
                <div style="border-bottom: 1px solid var(--surface-border); padding-bottom: 0px; margin-bottom: 0;">
                    ${tabsHtml}
                </div>
                <div style="display: flex; flex-direction: column; width: 100%;">
                    ${tabContentHtml}
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;


    window.togglePortfoyEdit = () => {
        const hedefText = document.getElementById('hedef-text');
        const isEditing = hedefText.style.display === 'none';

        hedefText.style.display = isEditing ? 'inline' : 'none';
        document.getElementById('inline-hedef-input').style.display = isEditing ? 'none' : 'inline-block';

        if (!isEditing) {
            document.getElementById('inline-hedef-input').focus();
        }
    };

    window.savePortfoyEdit = () => {
        const hedefVal = document.getElementById('inline-hedef-input').value;

        if (hedefVal !== '') State.data.hedefPortfoyTL = parseFloat(hedefVal) || 0;

        State.save();
        if (typeof renderPage === "function") renderPage();
    };

    window.saveNakitVarlikEdit = (input) => {
        const nakitVal = input.value;
        if (nakitVal !== '') State.data.manuelNakitTutar = parseFloat(nakitVal) || 0;
        State.save();
        if (typeof renderPage === "function") renderPage();
    };

    window.toggleVarliklarEdit = () => {
        const isEditing = document.getElementById('varliklar-save-btn').style.display !== 'none';

        const pryText = document.querySelector('.pry-text');
        const pryInput = document.querySelector('.inline-pry-input');

        if (pryText && pryInput) {
            pryText.style.display = isEditing ? 'inline' : 'none';
            pryInput.style.display = isEditing ? 'none' : 'inline-block';
        }

        document.getElementById('varliklar-edit-btn').style.display = isEditing ? 'inline-block' : 'none';
        document.getElementById('varliklar-save-btn').style.display = isEditing ? 'none' : 'inline-block';

        if (!isEditing && pryInput) {
            pryInput.focus();
        }
    };

    window.saveVarliklarEdit = () => {
        const pryInput = document.querySelector('.inline-pry-input');
        if (pryInput && pryInput.value !== '') {
            State.data.manuelFonFiyatlari = State.data.manuelFonFiyatlari || {};
            const newVal = parseFloat(pryInput.value.replace(',', '.'));
            State.data.manuelFonFiyatlari['PRY'] = newVal;
            State.updateFiyat('PRY', newVal);
            State.save();
            if (typeof renderPage === "function") renderPage();
        }
    };

    window.setPortfoyChartRange = (range) => {
        window.portfoyChartRange = range;
        const activeTabBtn = document.querySelector('.portfoy-tab-btn[style*="var(--accent-color)"]');
        const activeTabId = activeTabBtn ? activeTabBtn.getAttribute('data-tab') : 'bilgiler';
        if (typeof renderPage === "function") {
            renderPage();

        }
    };

    if (window.Chart) {
        if (window.ChartDataLabels) Chart.register(ChartDataLabels);

        if (window.chartOzetInstance) window.chartOzetInstance.destroy();
        if (window.chartVarliklarInstance) window.chartVarliklarInstance.destroy();

        const pieLinesPlugin = {
            id: 'pieLines',
            afterDraw(chart) {
                const ctx = chart.ctx;
                chart.data.datasets.forEach((dataset, i) => {
                    let sum = 0;
                    dataset.data.forEach(d => sum += d);

                    chart.getDatasetMeta(i).data.forEach((arc, index) => {
                        const dataVal = dataset.data[index];
                        const percentage = (dataVal * 100 / sum);
                        
                        // 0% (veya 0.5'ten küçük) dilimleri gösterme
                        if (percentage < 0.5) return;

                        const centerPoint = arc.tooltipPosition();
                        const chartCenter = { x: chart.chartArea.left + chart.chartArea.width / 2, y: chart.chartArea.top + chart.chartArea.height / 2 };

                        let angle = Math.atan2(centerPoint.y - chartCenter.y, centerPoint.x - chartCenter.x);
                        
                        // Çizgilerin tam aşağı inip alttaki yazılara (legend) çarpmasını engelle
                        if (angle > 1.2 && angle < 1.94) {
                            angle = (angle < 1.57) ? 1.0 : 2.14; 
                        }

                        const radius = arc.outerRadius;

                        const startX = chartCenter.x + Math.cos(angle) * radius;
                        const startY = chartCenter.y + Math.sin(angle) * radius;

                        const endX = startX + Math.cos(angle) * 15;
                        const endY = startY + Math.sin(angle) * 15;

                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(endX, endY);

                        const lineLen = 10;
                        const finalX = endX + (Math.cos(angle) >= 0 ? lineLen : -lineLen);
                        ctx.lineTo(finalX, endY);
                        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                        ctx.stroke();

                        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#fff';
                        ctx.font = 'normal 12px Inter, Arial';
                        ctx.textBaseline = 'middle';
                        ctx.textAlign = Math.cos(angle) >= 0 ? 'left' : 'right';

                        const text = percentage.toFixed(0) + '%';
                        ctx.fillText(text, finalX + (Math.cos(angle) >= 0 ? 3 : -3), endY);
                        ctx.restore();
                    });
                });
            }
        };

        const ctxOzet = document.getElementById('chart-ozet');
        if (ctxOzet) {
            window.chartOzetInstance = new Chart(ctxOzet, {
                type: 'doughnut',
                data: {
                    labels: ['Nakit', 'Hisse', 'Fon'],
                    datasets: [{
                        data: [guncelNakitTutar, hissePortfoyTutar, fonPortfoyTutar],
                        backgroundColor: ['#4caf50', '#2196f3', '#ff9800'],
                        borderWidth: 0
                    }]
                },
                options: {
                    layout: { padding: 40 },
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#fff',
                                font: { size: 12 },
                                boxWidth: 10,
                                boxHeight: 10,
                                padding: 15
                            }
                        },
                        datalabels: {
                            display: false
                        }
                    }
                },
                plugins: [pieLinesPlugin]
            });
        }

        const ctxVarliklar = document.getElementById('chart-varliklar');
        if (ctxVarliklar && (filteredPortfoy.length > 0 || (nakitItemForTable && nakitItemForTable.guncelTutar > 0))) {
            const labels = filteredPortfoy.map(p => p.menkul);
            const data = filteredPortfoy.map(p => p.guncelTutar);

            if (nakitItemForTable && nakitItemForTable.guncelTutar > 0) {
                labels.push('Nakit');
                data.push(nakitItemForTable.guncelTutar);
            }

            const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

            if (window.chartVarliklarInstance) {
                window.chartVarliklarInstance.destroy();
            }

            window.chartVarliklarInstance = new Chart(ctxVarliklar, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: colors,
                        borderWidth: 0
                    }]
                },
                options: {
                    layout: { padding: 40 },
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#fff',
                                font: { size: 12 },
                                boxWidth: 10,
                                boxHeight: 10,
                                padding: 10
                            }
                        },
                        datalabels: {
                            display: false
                        }
                    }
                },
                plugins: [pieLinesPlugin]
            });
        }

        // --- GÜNLÜK PORTFÖY KAYDI VE ÇİZGİ GRAFİĞİ ---
        const now = new Date();
        const timeInMins = now.getHours() * 60 + now.getMinutes();
        const dayOfWeek = now.getDay();
        const isBefore0950 = timeInMins <= (9 * 60 + 50);
        const isAfter1830 = timeInMins >= (18 * 60 + 30);

        let targetDate = null;
        if (dayOfWeek === 6) { // Cumartesi -> Cuma
            targetDate = new Date(now);
            targetDate.setDate(targetDate.getDate() - 1);
        } else if (dayOfWeek === 0) { // Pazar -> Cuma
            targetDate = new Date(now);
            targetDate.setDate(targetDate.getDate() - 2);
        } else if (dayOfWeek === 1 && isBefore0950) { // Pazartesi 09:50 öncesi -> Cuma
            targetDate = new Date(now);
            targetDate.setDate(targetDate.getDate() - 3);
        } else if (dayOfWeek >= 2 && dayOfWeek <= 5 && isBefore0950) { // Salı-Cuma 09:50 öncesi -> Dün
            targetDate = new Date(now);
            targetDate.setDate(targetDate.getDate() - 1);
        } else if (isAfter1830) { // Hafta içi 18:30 sonrası -> Bugün
            targetDate = new Date(now);
        }

        if (!State.data.portfoyGecmisi) State.data.portfoyGecmisi = [];

        // Hatalı kaydedilmiş olabilecek hafta sonu (Cumartesi, Pazar) verilerini ve mükerrerleri temizle
        let needsSave = false;
        const uniqueGecmis = [];
        const seenDates = new Set();

        // Sondan başa doğru giderek en güncel kaydı tutalım
        for (let i = State.data.portfoyGecmisi.length - 1; i >= 0; i--) {
            const r = State.data.portfoyGecmisi[i];
            const dw = new Date(r.tarih).getDay();
            if (dw === 0 || dw === 6) {
                needsSave = true; // Hafta sonu varsa silincek
                continue;
            }
            if (!seenDates.has(r.tarih)) {
                seenDates.add(r.tarih);
                uniqueGecmis.unshift(r);
            } else {
                needsSave = true; // Mükerrer bulundu
            }
        }

        if (needsSave) {
            State.data.portfoyGecmisi = uniqueGecmis;
            State.save();
        }

        // Hedeflenen kapanış günü için kayıt
        if (targetDate) {
            const yyyyMmDd = targetDate.getFullYear() + '-' + String(targetDate.getMonth() + 1).padStart(2, '0') + '-' + String(targetDate.getDate()).padStart(2, '0');
            const targetRecord = State.data.portfoyGecmisi.find(r => r.tarih === yyyyMmDd);
            if (!targetRecord) {
                State.data.portfoyGecmisi.push({
                    tarih: yyyyMmDd,
                    tutar: portfoyBilgileri.toplamPortfoy,
                    anapara: portfoyBilgileri.anapara
                });
                State.save();
            } else {
                if (targetRecord.tutar !== portfoyBilgileri.toplamPortfoy || targetRecord.anapara !== portfoyBilgileri.anapara) {
                    targetRecord.tutar = portfoyBilgileri.toplamPortfoy;
                    targetRecord.anapara = portfoyBilgileri.anapara;
                    State.save();
                }
            }
        }

        const ctxPortfoyGecmisi = document.getElementById('chart-portfoy-gecmisi');
        if (ctxPortfoyGecmisi) {
            let historyData = [...State.data.portfoyGecmisi];
            historyData.sort((a, b) => new Date(a.tarih) - new Date(b.tarih));

            // Aradaki boş günleri doldur
            if (historyData.length > 0) {
                const filledData = [];
                let curr = new Date(historyData[0].tarih);
                const lastRecordDate = new Date(historyData[historyData.length - 1].tarih);
                let lastKnownVal = historyData[0].tutar;
                let lastKnownAnapara = historyData[0].anapara !== undefined ? historyData[0].anapara : historyData[0].tutar;

                while (curr <= lastRecordDate) {
                    const dw = curr.getDay();
                    if (dw !== 0 && dw !== 6) { // Hafta sonlarını atla
                        const dStr = curr.getFullYear() + '-' + String(curr.getMonth() + 1).padStart(2, '0') + '-' + String(curr.getDate()).padStart(2, '0');
                        const existing = historyData.find(r => r.tarih === dStr);
                        if (existing) {
                            lastKnownVal = existing.tutar;
                            lastKnownAnapara = existing.anapara !== undefined ? existing.anapara : existing.tutar;
                        }
                        filledData.push({ tarih: dStr, tutar: lastKnownVal, anapara: lastKnownAnapara, isAnlik: false });
                    }
                    curr.setDate(curr.getDate() + 1);
                }
                historyData = filledData;
            }

            // Anlık (Güncel) durumu ekle (Hafta içi piyasa açıkken)
            if (dayOfWeek >= 1 && dayOfWeek <= 5 && !isBefore0950 && !isAfter1830) {
                const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
                if (!historyData.find(r => r.tarih === todayStr)) {
                    historyData.push({
                        tarih: todayStr,
                        tutar: portfoyBilgileri.toplamPortfoy,
                        anapara: portfoyBilgileri.anapara,
                        isAnlik: true
                    });
                }
            }

            const currentRange = window.portfoyChartRange || '1A';

            // Highlight active filter
            setTimeout(() => {
                document.querySelectorAll('.chart-filter').forEach(el => {
                    el.style.background = 'transparent';
                    el.classList.remove('active-filter');
                    if (el.dataset.range === currentRange) {
                        el.style.background = 'rgba(255,255,255,0.1)';
                        el.classList.add('active-filter');
                    }
                });
            }, 0);

            // Filter logic
            if (historyData.length > 0) {
                const lastDate = new Date(historyData[historyData.length - 1].tarih);
                let cutoffDate = new Date(lastDate);

                switch (currentRange) {
                    case '1H': cutoffDate.setDate(cutoffDate.getDate() - 7); break;
                    case '1A': cutoffDate.setMonth(cutoffDate.getMonth() - 1); break;
                    case '6A': cutoffDate.setMonth(cutoffDate.getMonth() - 6); break;
                    case 'YBK': cutoffDate = new Date(lastDate.getFullYear(), 0, 1); break;
                    case '1Y': cutoffDate.setFullYear(cutoffDate.getFullYear() - 1); break;
                    case '5Y': cutoffDate.setFullYear(cutoffDate.getFullYear() - 5); break;
                    case 'MAX': cutoffDate = new Date(0); break;
                }
                historyData = historyData.filter(d => new Date(d.tarih) >= cutoffDate);
            }

            const labels = historyData.map(d => {
                const parts = d.tarih.split('-');
                if (d.isAnlik) return 'Güncel';
                if (currentRange === 'MAX' || currentRange === '1Y' || currentRange === '5Y') {
                    return `${parts[2]}.${parts[1]}.${parts[0].slice(-2)}`;
                }
                return `${parts[2]}.${parts[1]}`;
            });
            const data = historyData.map(d => d.tutar);
            const dataAnapara = historyData.map(d => d.anapara !== undefined ? d.anapara : d.tutar);

            if (window.chartPortfoyGecmisiInstance) {
                window.chartPortfoyGecmisiInstance.destroy();
            }

            window.chartPortfoyGecmisiInstance = new Chart(ctxPortfoyGecmisi, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Portföy',
                            data: data,
                            borderColor: '#2ecc71',
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            pointBackgroundColor: '#2ecc71',
                            pointRadius: 0,
                            pointHoverRadius: 6,
                            fill: false,
                            tension: 0
                        },
                        {
                            label: 'Anapara',
                            data: dataAnapara,
                            borderColor: '#f39c12',
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            pointBackgroundColor: '#f39c12',
                            pointRadius: 0,
                            pointHoverRadius: 6,
                            fill: false,
                            tension: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        legend: { display: true, position: 'bottom', labels: { color: '#aaa', font: { size: 10 }, boxWidth: 12 } },
                        datalabels: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return ' ' + context.dataset.label + ': ₺' + context.parsed.y.toLocaleString('tr-TR', { maximumFractionDigits: 0 });
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(255, 255, 255, 0.03)' },
                            ticks: { color: '#aaa', font: { size: 10 } }
                        },
                        y: {
                            grid: { color: 'rgba(255, 255, 255, 0.03)' },
                            ticks: {
                                color: '#aaa',
                                font: { size: 10 },
                                callback: function (value) {
                                    return value.toLocaleString('tr-TR');
                                }
                            }
                        }
                    }
                }
            });
        } else {
            ctxPortfoyGecmisi.parentElement.innerHTML = '<div style="padding: 3rem 1rem; text-align: center; color: var(--text-secondary);">Henüz geçmiş veri bulunmuyor. Yeni bir portföy değeri kaydedildiğinde grafik burada oluşturulacaktır.</div>';
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
    } catch (e) { console.warn("Node integration not available", e); }

    const hisse = window.currentSelectedHisse;
    let selectedHisse = window.currentSelectedHisse || null;
    window.currentSelectedHisse = selectedHisse; // sync it back
    const hName = selectedHisse || 'Hisse';

    const validTabs = ['Özet Rapor', 'Akış', 'Değerleme', 'Gelir Tablosu'];
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
                    <a href="${filePath}" target="_blank" style="display: inline-block; padding: 0.8rem 2rem; background: #2b579a; color: var(--text-primary); text-decoration: none; border-radius: var(--border-radius); font-weight: bold; transition: all 0.3s ease;">
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
        
        let exactRow = sheet.rows.find(r => r[0] && r[0].toString().toLowerCase().replace(/[öçşğıü]/g, '').trim() === searchStr.trim());
        const row = exactRow || sheet.rows.find(r => {
            if (!r[0]) return false;
            const t = r[0].toString().toLowerCase().replace(/[öçşğıü]/g, '');
            if (searchStr.includes('sermaye') && (t.includes('fark') || t.includes('duzeltme'))) return false;
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

            'Değerleme': 'fas fa-gem',
            'Gelir Tablosu': 'fas fa-file-invoice-dollar',
            'Gelir Tablosu': 'fas fa-file-invoice-dollar',
            'Nakit Akım Tablosu': 'fas fa-water',
            'Rasyo Analiz Tablosu': 'fas fa-percentage',
            'Bilanço': 'fas fa-balance-scale'
        };

        const makeBtn = (t) => `<button class="nav-btn ${activeTab === t ? 'active' : ''}" style="margin:0; font-size:12px; font-weight:normal; padding:0.4rem 0.8rem; white-space:nowrap;" onclick="window.setHisseTab('${t}')"><i class="${tabIcons[t] || 'fas fa-file'}" style="margin-right:4px;"></i>${t}</button>`;
        const makeDropdown = (title, items) => `
            <div class="nav-dropdown">
                <button class="nav-btn ${items.includes(activeTab) ? 'active' : ''}" style="margin:0; font-size:12px; font-weight:normal; padding:0.4rem 0.8rem; white-space:nowrap;"><i class="fas fa-caret-down" style="margin-right:4px;"></i>${title}</button>
                <div class="nav-dropdown-content">
                    ${items.map(t => `<a onclick="window.setHisseTab('${t}')">${t}</a>`).join('')}
                </div>
            </div>`;

        let tabsHtml = makeBtn('Özet Rapor') + makeBtn('Akış') + makeBtn('Değerleme') + makeBtn('Gelir Tablosu');

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
                        <button class="btn btn-icon" style="padding: 2px; background: transparent; color: #888888; border: none;" onclick="window.deleteGenelNot('${not.id}')"><i class="fas fa-trash-alt"></i></button>
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
                window.updateGenelNot = (id, text) => { const not = State.data.genelNotlar.find(n => n.id === id); if (not) { not.text = text; State.save(); } };
                window.deleteGenelNot = (id) => { if (confirm('Bu notu silmek istediğinize emin misiniz?')) { State.data.genelNotlar = State.data.genelNotlar.filter(n => n.id !== id); State.save(); renderUI(); } };
                window.changeGenelNotColor = (id, color) => { const not = State.data.genelNotlar.find(n => n.id === id); if (not) { not.color = color; State.save(); renderUI(); } };
            }
        } else {
            if (window.parseExcelData && (!window.stockData || !window.stockData[selectedHisse] || !window.stockData[selectedHisse].bilanco)) {
                try { window.parseExcelData(selectedHisse); } catch (e) { console.error(e); }
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
                    const rName = r[0].toString().toLocaleLowerCase('tr-TR');
                    if (rName.includes('finansal borçlar') && !rName.includes('kısımlar') && !rName.includes('ksmlar') && (!sData.bilanco.rows.length || sData.bilanco.rows.indexOf(r) < sData.bilanco.rows.length - 2)) {
                        const val = typeof r[1] === 'number' ? r[1] : parseFloat((r[1] || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
                        finansalBorclarTotal += val;
                    }
                    if (rName.includes('nakit ve nakit benzerleri') || rName.includes('nakit ve nakit değerler')) {
                        const val = typeof r[1] === 'number' ? r[1] : parseFloat((r[1] || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
                        nakitTotal += val;
                    }
                });
            }
            const netBorc = finansalBorclarTotal - nakitTotal;
            const firmaDegeri = piyasaDegeri + netBorc;
            // Yıllıklandırılmış FAVÖK (TTM)
            let favok = 0;
            if (sData.gelirYillik && sData.gelirYillik.rows) {
                const fR = sData.gelirYillik.rows.find(x => x[0] && x[0].toString().toLocaleLowerCase('tr-TR').includes('favök'));
                if (fR) {
                    favok = typeof fR[1] === 'number' ? fR[1] : parseFloat((fR[1] || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
                }
            }
            if (favok === 0) favok = getVal(sData.gelirYillik, 'FAVÖK');

            const fdFavok = favok !== 0 ? (firmaDegeri / favok) : 0;
            const netBorcFavok = favok !== 0 ? (netBorc / favok) : 0;

            // Yıllıklandırılmış Net Kar (TTM)
            let yilliklandirilmisNetKar = 0;
            if (sData.gelirYillik && sData.gelirYillik.rows) {
                const nR = sData.gelirYillik.rows.find(x => x[0] && (x[0].toString().toLocaleLowerCase('tr-TR').includes('ana ortaklık payları') || x[0].toString().toLocaleLowerCase('tr-TR').includes('dönem net kar')));
                if (nR) {
                    yilliklandirilmisNetKar = typeof nR[1] === 'number' ? nR[1] : parseFloat((nR[1] || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
                }
            }
            if (yilliklandirilmisNetKar === 0) yilliklandirilmisNetKar = getVal(sData.gelirYillik, 'Net Dönem Karı');

            const fk = yilliklandirilmisNetKar !== 0 ? (piyasaDegeri / yilliklandirilmisNetKar) : 0;

            // PD/DD Hesaplaması (Ana Ortaklığa Ait Özkaynaklar)
            let anaOrtaklikOzkaynaklar = 0;
            if (sData.bilanco && sData.bilanco.rows) {
                const aoRow = sData.bilanco.rows.find(x => x[0] && x[0].toString().toLocaleLowerCase('tr-TR').includes('ana ortaklığa ait özkaynaklar'));
                if (aoRow) {
                    anaOrtaklikOzkaynaklar = typeof aoRow[1] === 'number' ? aoRow[1] : parseFloat((aoRow[1] || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
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

            if (activeTab === hName || activeTab === 'Özet Rapor' || activeTab === 'Gelir Tablosu') {
                // FINTABLES STYLE SUMMARY DASHBOARD

                const fmtVal = (val) => {
                    if (val === null || val === undefined || isNaN(val)) return '-';
                    return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(val);
                };

                const calcPct = (current, previous, options = {}) => {
                    if (!current || !previous || previous === 0) return { text: 'N/A', color: 'gray' };
                    const pct = ((current - previous) / Math.abs(previous)) * 100;
                    const isNegative = pct < 0;

                    let color = isNegative ? '#e74c3c' : '#2ecc71';
                    if (options.reverseColor) {
                        color = isNegative ? '#2ecc71' : '#e74c3c';
                    }

                    const text = isNegative ? `% -${Math.abs(pct).toFixed(0)}` : `% ${Math.abs(pct).toFixed(0)}`;
                    return { text: text, color: color };
                };

                let gelirHtml = '';
                let bilancoHtml = '';
                let chartLabels = [];
                let chartSatislar = [];
                let chartBrutKar = [];
                let chartFaaliyet = [];
                let chartFavok = [];
                let chartNetKar = [];
                let chartYSatislar = []; let chartYBrutKar = []; let chartYFaaliyet = []; let chartYFavok = []; let chartYNetKar = [];
                let chartDSatislar = []; let chartDBrutKar = []; let chartDFaaliyet = []; let chartDFavok = []; let chartDNetKar = [];
                let chartBKM = []; let chartFKM = []; let chartNKM = [];
                let chartYBKM = []; let chartYFKM = []; let chartYNKM = [];
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
                        const r = (sData.gelirDonemsel.rows || []).find(x => x[0] && x[0].toString().toLocaleLowerCase('tr-TR').includes(name.toString().toLocaleLowerCase('tr-TR')));
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
                            <tr style="border-bottom: 1px solid var(--table-border);">
                                <th style="text-align:left !important; font-size:13px !important; color: var(--text-primary) !important; font-weight:normal !important;">Özet Gelir Tablosu</th>
                                <th style="text-align:center !important;">${p1}</th>
                                <th style="text-align:center !important;">${p2}</th>
                                <th style="text-align:center !important;">%</th>
                            </tr>
                        </thead>
                        <tbody>`;

                    gItems.forEach(item => {
                        const vals = getG(item.key);
                        const pct = calcPct(vals.v1, vals.v2);
                        gelirHtml += `<tr>
                            <td style="text-align:left !important;">${item.label}</td>
                            <td style="text-align:right !important;">${fmtVal(vals.v1)}</td>
                            <td style="text-align:right !important;">${fmtVal(vals.v2)}</td>
                            <td style="color: ${pct.color} !important; font-weight:normal; text-align:right !important;">${pct.text}</td>
                        </tr>`;
                    });
                    gelirHtml += `</tbody></table>`;

                    // Bilanço Items
                    const b_headers = sData.bilanco.headers;
                    const bp1 = b_headers[1];
                    let bp2_idx = 2; // always use previous quarter
                    if (b_headers.length <= 2) bp2_idx = 1; // fallback
                    const bp2 = b_headers[bp2_idx];

                    const getB = (name) => {
                        if (name === 'net borç' || name === 'net bor') {
                            const fBorc = getB('finansal borçlar');
                            const nakit = getB('nakit ve nakit');
                            const finYat = getB('finansal yatırımlar');
                            return { v1: fBorc.v1 - nakit.v1 - finYat.v1, v2: fBorc.v2 - nakit.v2 - finYat.v2 };
                        }
                        const searchName = name.toString().toLocaleLowerCase('tr-TR');
                        if (searchName.includes('finansal bor') || searchName.includes('finansal yatırımlar') || searchName.includes('nakit ve nakit')) {
                            let v1 = 0, v2 = 0;
                            let addedRows = [];
                            let inDuran = false;
                            sData.bilanco.rows.forEach((x, idx) => {
                                if (x[0]) {
                                    const rName = x[0].toString().toLocaleLowerCase('tr-TR');
                                    if (rName.trim() === 'duran varlıklar') inDuran = true;
                                    let match = false;
                                    if (searchName.includes('finansal bor') && rName.includes('finansal borçlar') && !rName.includes('kısımlar') && !rName.includes('ksmlar') && idx < sData.bilanco.rows.length - 2) {
                                        match = true;
                                    } else if (searchName.includes('finansal yatırımlar') && rName.includes('finansal yatırımlar') && !inDuran) {
                                        match = true;
                                    } else if (searchName.includes('nakit ve nakit') && (rName.includes('nakit ve nakit benzerleri') || rName.includes('nakit ve nakit değerler'))) {
                                        match = true;
                                    }
                                    if (match) {
                                        let val1 = parseTRNumber(x[1]);
                                        v1 += val1;
                                        v2 += parseTRNumber(x[bp2_idx]);
                                        addedRows.push(idx + 1 + '. satır: ' + x[0].trim() + ' (' + val1 + ')');
                                    }
                                }
                            });
                            return { v1, v2, debug: addedRows.join(' + ') };
                        }
                        const r = sData.bilanco.rows.find(x => x[0] && x[0].toString().toLocaleLowerCase('tr-TR').includes(searchName));
                        return r ? { v1: parseTRNumber(r[1]), v2: parseTRNumber(r[bp2_idx]) } : { v1: 0, v2: 0 };
                    };

                    const bItems = [
                        { label: 'Dönen Varlıklar', key: 'toplam dönen varlıklar' },
                        { label: 'Duran Varlıklar', key: 'toplam duran varlıklar' },
                        { label: 'Toplam Varlıklar', key: 'toplam varlıklar' },
                        { label: 'Finansal Borçlar', key: 'finansal borçlar', reverseColor: true },
                        { label: 'Net Borç', key: 'net borç', reverseColor: true },
                        { label: 'Özkaynaklar', key: 'ana ortaklığa ait özkaynaklar' }
                    ];

                    bilancoHtml = `<table class="dash-table compact-table">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--table-border);">
                                <th style="text-align:left !important; font-size:13px !important; color: var(--text-primary) !important; font-weight:normal !important;">Özet Bilanço</th>
                                <th style="text-align:center !important;">${bp1}</th>
                                <th style="text-align:center !important;">${bp2}</th>
                                <th style="text-align:center !important;">%</th>
                            </tr>
                        </thead>
                        <tbody>`;

                    bItems.forEach(item => {
                        const vals = getB(item.key);
                        const pct = calcPct(vals.v1, vals.v2, { reverseColor: item.reverseColor });
                        bilancoHtml += `<tr>
                            <td style="text-align:left !important;" title="${vals.debug || ''}">${item.label}</td>
                            <td style="text-align:right !important;" title="${vals.debug || ''}">${fmtVal(vals.v1)}</td>
                            <td style="text-align:right !important;">${fmtVal(vals.v2)}</td>
                            <td style="color: ${pct.color} !important; font-weight:normal; text-align:right !important;">${pct.text}</td>
                        </tr>`;
                    });
                    bilancoHtml += `</tbody></table>`;

                    // Chart Data
                    let limit = headers.length - 1;
                    const idx20243 = headers.indexOf('2024/3');
                    if (idx20243 !== -1) limit = idx20243;

                    const getCQ = (array, i, headers) => {
                        if (!array || !array[i]) return 0;
                        const currentHeader = headers[i];
                        const val = parseTRNumber(array[i]);
                        if (!currentHeader) return val;
                        if (currentHeader.endsWith('/3')) return val;
                        if (i + 1 < array.length) {
                            const prevHeader = headers[i + 1];
                            if (prevHeader && prevHeader.split('/')[0] === currentHeader.split('/')[0]) {
                                return val - parseTRNumber(array[i + 1]);
                            }
                        }
                        return val;
                    };

                    const brutR = (sData.gelirDonemsel.rows || []).find(x => x[0] && x[0].toString().toLocaleLowerCase('tr-TR').includes('brüt kar'));
                    const donenR = (sData.bilanco.rows || []).find(x => x[0] && x[0].toString().toLocaleLowerCase('tr-TR').includes('toplam dönen varlıklar'));
                    const kisaR = (sData.bilanco.rows || []).find(x => x[0] && x[0].toString().toLocaleLowerCase('tr-TR').includes('toplam kısa vadeli'));
                    const uzunR = (sData.bilanco.rows || []).find(x => x[0] && x[0].toString().toLocaleLowerCase('tr-TR').includes('toplam uzun vadeli'));
                    const toplamVR = (sData.bilanco.rows || []).find(x => x[0] && x[0].toString().toLocaleLowerCase('tr-TR').includes('toplam varlıklar'));
                    const ozR = (sData.bilanco.rows || []).find(x => x[0] && x[0].toString().toLocaleLowerCase('tr-TR').includes('ana ortaklığa ait özkaynaklar'));

                    chartLabels = []; chartSatislar = []; chartBrutKar = []; chartFaaliyet = []; chartFavok = []; chartNetKar = [];
                    chartYSatislar = []; chartYBrutKar = []; chartYFaaliyet = []; chartYFavok = []; chartYNetKar = [];
                    chartDSatislar = []; chartDBrutKar = []; chartDFaaliyet = []; chartDFavok = []; chartDNetKar = [];
                    chartBKM = []; chartFKM = []; chartNKM = [];
                    chartYBKM = []; chartYFKM = []; chartYNKM = [];
                    chartCari = []; chartKaldirac = []; chartROE = [];
                    for (let i = limit; i >= 1; i--) {
                        chartLabels.push(headers[i]);
                        const sR = (sData.gelirDonemsel.rows || []).find(x => x[0] && x[0].toString().toLocaleLowerCase('tr-TR').includes('satış gelirleri'));
                        const faaliyetR = (sData.gelirDonemsel.rows || []).find(x => x[0] && x[0].toString().toLocaleLowerCase('tr-TR').includes('esas faaliyet kar'));
                        const fR = (sData.gelirDonemsel.rows || []).find(x => x[0] && x[0].toString().toLocaleLowerCase('tr-TR').includes('favök'));
                        const nR = (sData.gelirDonemsel.rows || []).find(x => x[0] && (x[0].toString().toLocaleLowerCase('tr-TR').includes('ana ortaklık payları') || x[0].toString().toLocaleLowerCase('tr-TR').includes('dönem net kar')));

                        const cqSatis = getCQ(sR, i, headers);
                        const cqBrut = getCQ(brutR, i, headers);
                        const cqFaaliyet = getCQ(faaliyetR, i, headers);
                        const cqFavok = getCQ(fR, i, headers);
                        const cqNetKar = getCQ(nR, i, headers);

                        chartSatislar.push(cqSatis);
                        chartBrutKar.push(cqBrut);
                        chartFaaliyet.push(cqFaaliyet);
                        chartFavok.push(cqFavok);
                        chartNetKar.push(cqNetKar);

                        const rawSatis = sR && sR[i] !== undefined ? parseTRNumber(sR[i]) : 0;
                        const rawBrut = brutR && brutR[i] !== undefined ? parseTRNumber(brutR[i]) : 0;
                        const rawFaaliyet = faaliyetR && faaliyetR[i] !== undefined ? parseTRNumber(faaliyetR[i]) : 0;
                        const rawFavok = fR && fR[i] !== undefined ? parseTRNumber(fR[i]) : 0;
                        const rawNetKar = nR && nR[i] !== undefined ? parseTRNumber(nR[i]) : 0;
                        chartDSatislar.push(rawSatis);
                        chartDBrutKar.push(rawBrut);
                        chartDFaaliyet.push(rawFaaliyet);
                        chartDFavok.push(rawFavok);
                        chartDNetKar.push(rawNetKar);

                        let ySatis = 0, yFavok = 0, yNetKar = 0, yBrut = 0, yFaaliyet = 0;
                        if (sData.gelirYillik && sData.gelirYillik.rows) {
                            const ySR = sData.gelirYillik.rows.find(x => x[0] && String(x[0]).toLocaleLowerCase('tr-TR').includes('satış gelirleri'));
                            const yFaaliyetR = sData.gelirYillik.rows.find(x => x[0] && String(x[0]).toLocaleLowerCase('tr-TR').includes('esas faaliyet kar'));
                            const yFR = sData.gelirYillik.rows.find(x => x[0] && String(x[0]).toLocaleLowerCase('tr-TR').includes('favök'));
                            const yNR = sData.gelirYillik.rows.find(x => x[0] && (String(x[0]).toLocaleLowerCase('tr-TR').includes('ana ortaklık payları') || String(x[0]).toLocaleLowerCase('tr-TR').includes('dönem net kar')));
                            const yBR = sData.gelirYillik.rows.find(x => x[0] && String(x[0]).toLocaleLowerCase('tr-TR').includes('brüt kar'));
                            if (ySR && ySR[i] !== undefined) ySatis = parseTRNumber(ySR[i]);
                            if (yFaaliyetR && yFaaliyetR[i] !== undefined) yFaaliyet = parseTRNumber(yFaaliyetR[i]);
                            if (yFR && yFR[i] !== undefined) yFavok = parseTRNumber(yFR[i]);
                            if (yNR && yNR[i] !== undefined) yNetKar = parseTRNumber(yNR[i]);
                            if (yBR && yBR[i] !== undefined) yBrut = parseTRNumber(yBR[i]);
                        }
                        chartYSatislar.push(ySatis);
                        chartYBrutKar.push(yBrut);
                        chartYFaaliyet.push(yFaaliyet);
                        chartYFavok.push(yFavok);
                        chartYNetKar.push(yNetKar);

                        chartBKM.push(cqSatis ? (cqBrut / cqSatis) * 100 : 0);
                        chartFKM.push(cqSatis ? (cqFavok / cqSatis) * 100 : 0);
                        chartNKM.push(cqSatis ? (cqNetKar / cqSatis) * 100 : 0);

                        chartYBKM.push(ySatis ? (yBrut / ySatis) * 100 : 0);
                        chartYFKM.push(ySatis ? (yFavok / ySatis) * 100 : 0);
                        chartYNKM.push(ySatis ? (yNetKar / ySatis) * 100 : 0);

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
                            const yNkR = sData.gelirYillik.rows.find(x => x[0] && (x[0].toString().toLocaleLowerCase('tr-TR').includes('ana ortaklık payları') || x[0].toString().toLocaleLowerCase('tr-TR').includes('dönem net kar')));
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
                                else if (headers[i].endsWith('/9')) annNk = rawNetKar * (4 / 3);
                            }
                        }

                        let currentOz = ozR ? parseTRNumber(ozR[i]) : 0;
                        let previousOz = currentOz;
                        if (ozR && ozR.length > i + 4) {
                            previousOz = parseTRNumber(ozR[i + 4]);
                            if (previousOz === 0) previousOz = currentOz; // fallback if empty
                        }
                        let ortalamaOz = (currentOz + previousOz) / 2;
                        chartROE.push(ortalamaOz > 0 ? (annNk / ortalamaOz) * 100 : 0);
                    }
                }

                // Karne Hesaplamaları
                let karlilikPuan = 0;
                let buyumePuan = 0;
                let borclulukPuan = 0;

                if (chartSatislar.length >= 2) {
                    const l = chartSatislar.length - 1;
                    // Büyüme (Satışlar, FAVÖK, Net Kar)
                    if (chartSatislar[l] > chartSatislar[l - 1]) buyumePuan += 2;
                    if (chartFavok[l] > chartFavok[l - 1]) buyumePuan += 2;
                    if (chartNetKar[l] > chartNetKar[l - 1]) buyumePuan += 2;

                    // Karlılık (BKM, FKM, NKM)
                    if (chartBKM[l] > chartBKM[l - 1]) karlilikPuan += 2;
                    if (chartFKM[l] > chartFKM[l - 1]) karlilikPuan += 2;
                    if (chartNKM[l] > chartNKM[l - 1]) karlilikPuan += 2;

                    // Borçluluk (Cari Oran artmışsa iyi, Kaldıraç düşmüşse iyi)
                    if (chartCari[l] > chartCari[l - 1]) borclulukPuan += 3;
                    if (chartKaldirac[l] < chartKaldirac[l - 1]) borclulukPuan += 3;
                }

                const vOzCurrent = (sData.bilanco && sData.bilanco.rows) ? sData.bilanco.rows.find(x => x[0] && x[0].toString().toLocaleLowerCase('tr-TR').includes('ana ortaklığa ait özkaynaklar')) : null;
                const vKisaCurrent = (sData.bilanco && sData.bilanco.rows) ? sData.bilanco.rows.find(x => x[0] && x[0].toString().toLocaleLowerCase('tr-TR').includes('toplam kısa vadeli')) : null;
                const vUzunCurrent = (sData.bilanco && sData.bilanco.rows) ? sData.bilanco.rows.find(x => x[0] && x[0].toString().toLocaleLowerCase('tr-TR').includes('toplam uzun vadeli')) : null;

                let pctOz = 0, pctKisa = 0, pctUzun = 0;
                if (sData.bilanco && sData.bilanco.headers.length > 1) {
                    const parseTRNumberLocal = (str) => {
                        if (!str) return 0;
                        if (typeof str === 'number') return str;
                        return parseFloat(str.replace(/\./g, '').replace(/,/g, '.')) || 0;
                    };
                    const idx1 = 1;
                    const vO = vOzCurrent ? parseTRNumberLocal(vOzCurrent[idx1]) : 0;
                    const vK = vKisaCurrent ? parseTRNumberLocal(vKisaCurrent[idx1]) : 0;
                    const vU = vUzunCurrent ? parseTRNumberLocal(vUzunCurrent[idx1]) : 0;
                    const tot = vO + vK + vU;
                    if (tot > 0) {
                        pctOz = Math.round((vO / tot) * 100);
                        pctKisa = Math.round((vK / tot) * 100);
                        pctUzun = Math.round((vU / tot) * 100);
                    }
                }

                // Hisse Başına Kar (HBK)
                const parseTRNumberForHBK = (str) => {
                    if (!str) return 0;
                    if (typeof str === 'number') return str;
                    return parseFloat(str.replace(/\./g, '').replace(/,/g, '.')) || 0;
                };

                const hbk = (odenmisSermaye && odenmisSermaye > 0) ? (yilliklandirilmisNetKar / odenmisSermaye) : 0;

                contentHtml = `
                <style>
                .compact-table { table-layout: auto !important; width: 100%; border-collapse: collapse; }
                .compact-table th, .compact-table td { padding: 0.6rem 0.5rem !important; white-space: nowrap; }
                .compact-table th { font-size: 12px !important; font-weight: normal !important; color: var(--text-primary) !important; height: 39px; }
                .compact-table td:first-child { font-size: 12px !important; font-weight: normal !important; color: #cccccc !important; }
                .compact-table tr { height: 39px !important; }
                .compact-table td { font-size: 12px !important; font-weight: normal !important; color: #cccccc; height: 34px !important; line-height: 1 !important; }
                /* nav-btn override removed to protect main sidebar */
                .nav-dropdown-content a { font-size: 12px !important; font-weight: normal !important; }
                .dash-title { font-size: 12px !important; font-weight: normal !important; color: var(--text-primary) !important; }
                .compact-card { padding: 1.2rem !important; }
                .gauge-container { display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; width: 80px; height: 50px; }
                .gauge-bg { position: absolute; width: 100%; height: 100%; border-radius: 40px 40px 0 0; border: 8px solid rgba(255,255,255,0.1); border-bottom: none; box-sizing: border-box; }
                .gauge-fill { position: absolute; width: 100%; height: 100%; border-radius: 40px 40px 0 0; border: 8px solid #2ecc71; border-bottom: none; box-sizing: border-box; transform-origin: bottom center; transform: rotate(0deg); transition: transform 1s; }
                .gauge-text { position: absolute; bottom: 0; font-size: 12px; font-weight: normal; color: var(--text-primary); line-height: 1; }
                .gauge-label { font-size: 12px; font-weight: normal; color: #aaa; margin-top: 4px; text-align: center; }
                </style>
                <div style="display:flex; flex-direction:column; gap: 1rem; margin-top: 0;">
                        
                        <!-- Row 1: Özet Gelir & Bilanço -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-items: stretch;">
                            <div class="dash-card compact-card" style="margin-bottom:0;">
                                ${gelirHtml || '<div style="opacity:0.5; text-align:center;">Veri bulunamadı</div>'}
                            </div>
                            <div class="dash-card compact-card" style="margin-bottom:0;">
                                ${bilancoHtml || '<div style="opacity:0.5; text-align:center;">Veri bulunamadı</div>'}
                            </div>
                        </div>

                        <!-- Row 2: Çarpanlar, Karne, Şirket Detayları -->
                        <div style="display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; align-items: stretch;">
                            
                            <!-- Çarpanlar -->
                            <div class="dash-card compact-card" style="margin-bottom:0; display:flex; flex-direction:column;">
                                <div class="dash-title" style="font-size: 12px; font-weight: normal; margin-bottom: 1rem;">Çarpanlar</div>
                                <table class="dash-table compact-table" style="flex: 1;">
                                    <tbody>
                                        <tr style="border-bottom: 1px solid var(--table-border);">
                                            <td style="text-align: left !important;">F/K</td>
                                            <td style="text-align: right !important;">${fmtDec(fk)}</td>
                                        </tr>
                                        <tr style="border-bottom: 1px solid var(--table-border);">
                                            <td style="text-align: left !important;">FD/FAVÖK</td>
                                            <td style="text-align: right !important;">${fmtDec(fdFavok)}</td>
                                        </tr>
                                        <tr style="border-bottom: 1px solid var(--table-border);">
                                            <td style="text-align: left !important;">PD/DD</td>
                                            <td style="text-align: right !important;">${fmtDec(pdDd)}</td>
                                        </tr>
                                        
                                        <tr>
                                            <td style="text-align: left !important;">Net Borç / FAVÖK</td>
                                            <td style="text-align: right !important;">${fmtDec(netBorcFavok)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <!-- Kaynak Dağılımı -->
                            <div class="dash-card compact-card" style="margin-bottom:0; display:flex; flex-direction:column;">
                                <div class="dash-title" style="font-size: 12px; font-weight: normal; margin-bottom: 0.8rem;">Kaynak Dağılımı</div>
                                <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
                                    <div style="display:flex; height: 12px; border-radius: 6px; overflow:hidden; margin-bottom: 1.5rem;">
                                        <div style="width:${pctOz}%; background:#6c5ce7;" title="Özkaynaklar: %${pctOz}"></div>
                                        <div style="width:${pctKisa}%; background:#fd79a8;" title="Kısa Vade Yükümlülükler: %${pctKisa}"></div>
                                        <div style="width:${pctUzun}%; background:#636e72;" title="Uzun Vade Yükümlülükler: %${pctUzun}"></div>
                                    </div>
                                    <div style="display:flex; flex-wrap:wrap; justify-content:center; gap: 1rem; font-size: 12px; font-weight: normal; color:#aaa;">
                                        <div style="display:flex; align-items:center; gap:4px;"><div style="width:8px;height:8px;border-radius:50%;background:#6c5ce7;"></div>Özkaynaklar: %${pctOz}</div>
                                        <div style="display:flex; align-items:center; gap:4px;"><div style="width:8px;height:8px;border-radius:50%;background:#fd79a8;"></div>Kısa Vade Yük.: %${pctKisa}</div>
                                        <div style="display:flex; align-items:center; gap:4px;"><div style="width:8px;height:8px;border-radius:50%;background:#636e72;"></div>Uzun Vade Yük.: %${pctUzun}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Şirket Detayları -->
                            <div class="dash-card compact-card" style="margin-bottom:0; display:flex; flex-direction:column;">
                                <div class="dash-title" style="font-size: 12px; font-weight: normal; margin-bottom: 1rem;">Şirket Detayları</div>
                                <table class="dash-table compact-table" style="flex: 1;">
                                    <tbody>
                                        <tr style="border-bottom: 1px solid var(--table-border);">
                                            <td style="text-align: left !important;">Hisse Başına Kar</td>
                                            <td style="text-align: right !important;">${fmtDec(hbk)}</td>
                                        </tr>
                                        <tr style="border-bottom: 1px solid var(--table-border);">
                                            <td style="text-align: left !important;">Ödenmiş Sermaye</td>
                                            <td style="text-align: right !important;">${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(odenmisSermaye)}</td>
                                        </tr>
                                        <tr>
                                            <td style="text-align: left !important;">Piyasa Değeri</td>
                                            <td style="text-align: right !important;">${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(piyasaDegeri)}</td>
                                        </tr>
                                        <tr>
                                            <td style="text-align: left !important;">Piyasa Değeri $</td>
                                            <td style="text-align: right !important;">$${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(piyasaDegeriUsd)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>


                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="font-size: 12px; font-weight: normal;">Brüt Kar Marjı</div>
                            <div style="flex: 1; min-height: 250px; position: relative;"><canvas id="chart-bkm"></canvas></div>
                        </div>

                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="font-size: 12px; font-weight: normal;">FAVÖK Marjı</div>
                            <div style="flex: 1; min-height: 250px; position: relative;"><canvas id="chart-fkm"></canvas></div>
                        </div>

                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="font-size: 12px; font-weight: normal;">Net Kar Marjı</div>
                            <div style="flex: 1; min-height: 250px; position: relative;"><canvas id="chart-nkm"></canvas></div>
                        </div>

                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="font-size: 12px; font-weight: normal;">Cari Oran</div>
                            <div style="flex: 1; min-height: 250px; position: relative;"><canvas id="chart-cari"></canvas></div>
                        </div>

                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="font-size: 12px; font-weight: normal;">Kaldıraç Oranı</div>
                            <div style="flex: 1; min-height: 250px; position: relative;"><canvas id="chart-kaldirac"></canvas></div>
                        </div>

                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="font-size: 12px; font-weight: normal;">Özkaynak Karlılığı</div>
                            <div style="flex: 1; min-height: 250px; position: relative;"><canvas id="chart-roe"></canvas></div>
                        </div>
                    </div>
                </div>
                `;

                window.shouldRenderDashboardCharts = true;
                window.dashboardChartData = {
                    labels: chartLabels,
                    satislar: chartSatislar,
                    brutkar: chartBrutKar,
                    faaliyet: chartFaaliyet,
                    favok: chartFavok,
                    netkar: chartNetKar,
                    ySatislar: chartYSatislar,
                    yBrutkar: chartYBrutKar,
                    yFaaliyet: chartYFaaliyet,
                    yFavok: chartYFavok,
                    yNetKar: chartYNetKar,
                    dSatislar: chartDSatislar,
                    dBrutkar: chartDBrutKar,
                    dFaaliyet: chartDFaaliyet,
                    dFavok: chartDFavok,
                    dNetKar: chartDNetKar,
                    bkm: chartBKM, fkm: chartFKM, nkm: chartNKM,
                    ybkm: chartYBKM, yfkm: chartYFKM, ynkm: chartYNKM,
                    cari: chartCari, kaldirac: chartKaldirac, roe: chartROE
                };
            }
            if (activeTab === 'Gelir Tablosu') {
                contentHtml = `
                <style>
                .compact-table { table-layout: auto !important; width: 100%; }
                .compact-table th, .compact-table td { padding: 0.4rem 0.3rem !important; white-space: nowrap; font-size: 0.8rem !important; }
                .compact-card { padding: 1rem 0.5rem !important; }
                </style>
                <div style="display:flex; flex-direction:column; gap: 1rem; margin-top: 0;">
                    
                    <div style="display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; align-items: stretch; margin-bottom: 1rem;">
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Satış Gelirleri (Çeyreklik)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-ceyreklik-satislar"></canvas></div>
                        </div>

                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Satış Gelirleri (Dönemsel)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-donemsel-satislar"></canvas></div>
                        </div>

                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Satış Gelirleri (Yıllıklandırılmış)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-yillik-satislar"></canvas></div>
                        </div>
                    </div>

                    <div class="dash-card" style="margin-bottom:1rem; display:flex; flex-direction:column; padding: 1.2rem;">
                        <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                            <span>Satış Gelirleri</span>
                            <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                        </div>
                        <div style="flex:1; min-height:400px; min-width: 0; position:relative;"><canvas id="chart-combined-satislar"></canvas></div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; align-items: stretch; margin-bottom: 1rem;">
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Brüt Kar (Çeyreklik)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-ceyreklik-brut"></canvas></div>
                        </div>

                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Brüt Kar (Dönemsel)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-donemsel-brut"></canvas></div>
                        </div>

                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Brüt Kar (Yıllıklandırılmış)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-yillik-brut"></canvas></div>
                        </div>
                    </div>

                    <div class="dash-card" style="margin-bottom:1rem; display:flex; flex-direction:column; padding: 1.2rem;">
                        <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                            <span>Brüt Kar</span>
                            <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                        </div>
                        <div style="flex:1; min-height:400px; min-width: 0; position:relative;"><canvas id="chart-combined-brut"></canvas></div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; align-items: stretch; margin-bottom: 1rem;">
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Esas Faaliyet Karı (Çeyreklik)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-ceyreklik-faaliyet"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Esas Faaliyet Karı (Dönemsel)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-donemsel-faaliyet"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Esas Faaliyet Karı (Yıllıklandırılmış)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-yillik-faaliyet"></canvas></div>
                        </div>
                    </div>
                    <div class="dash-card" style="margin-bottom:1rem; display:flex; flex-direction:column; padding: 1.2rem;">
                        <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                            <span>Esas Faaliyet Karı</span>
                            <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                        </div>
                        <div style="flex:1; min-height:400px; min-width: 0; position:relative;"><canvas id="chart-combined-faaliyet"></canvas></div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; align-items: stretch; margin-bottom: 1rem;">
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>FAVÖK (Çeyreklik)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-ceyreklik-favok2"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>FAVÖK (Dönemsel)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-donemsel-favok"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>FAVÖK (Yıllıklandırılmış)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-yillik-favok"></canvas></div>
                        </div>
                    </div>
                    <div class="dash-card" style="margin-bottom:1rem; display:flex; flex-direction:column; padding: 1.2rem;">
                        <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                            <span>FAVÖK</span>
                            <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                        </div>
                        <div style="flex:1; min-height:400px; min-width: 0; position:relative;"><canvas id="chart-combined-favok"></canvas></div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; align-items: stretch; margin-bottom: 1rem;">
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Net Kar (Çeyreklik)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-ceyreklik-netkar2"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Net Kar (Dönemsel)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-donemsel-netkar"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Net Kar (Yıllıklandırılmış)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-yillik-netkar"></canvas></div>
                        </div>
                    </div>
                    <div class="dash-card" style="margin-bottom:1rem; display:flex; flex-direction:column; padding: 1.2rem;">
                        <div class="dash-title" style="position:relative; font-size: 13px !important; color: var(--text-primary) !important; font-weight: normal !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                            <span>Net Kar</span>
                            <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                        </div>
                        <div style="flex:1; min-height:400px; min-width: 0; position:relative;"><canvas id="chart-combined-netkar"></canvas></div>
                    </div>
                </div>
                `;
                window.shouldRenderDashboardCharts = true;
            } else if (activeTab === 'Bilanço') {
                let tBilancoTabDynamic = tBilanco;
                if (sData.bilanco) tBilancoTabDynamic = genFintablesBilanco('Bilanço', sData.bilanco.headers, sData.bilanco.rows);
                contentHtml = `
                <style>
                .compact-table { table-layout: auto !important; width: 100%; }
                .compact-table th, .compact-table td { padding: 0.4rem 0.3rem !important; white-space: nowrap; font-size: 0.8rem !important; }
                .compact-card { padding: 1rem 0.5rem !important; }
                </style>
                <div style="display:flex; flex-direction:column; gap: 1rem; margin-top: 0;">
                    ${tBilancoTabDynamic}
                </div>
                `;
            } else if (activeTab === 'Nakit Akım Tablosu') {
                let tNakitDynamic = tNakit;
                if (sData.nakit) tNakitDynamic = genTable('Nakit Akım Tablosu', sData.nakit.headers, sData.nakit.rows);
                contentHtml = `
                <style>
                .compact-table { table-layout: auto !important; width: 100%; }
                .compact-table th, .compact-table td { padding: 0.4rem 0.3rem !important; white-space: nowrap; font-size: 0.8rem !important; }
                .compact-card { padding: 1rem 0.5rem !important; }
                </style>
                <div style="display:flex; flex-direction:column; gap: 1rem; margin-top: 0;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="dash-card" style="margin-bottom: 0;">
                            <div class="dash-title">Çeyreklik Nakit Akışı</div>
                            <div style="position: relative; height: 250px;"><canvas id="chart-nakit-q"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom: 0;">
                            <div class="dash-title">Yıllık Nakit Akışı</div>
                            <div style="position: relative; height: 250px;"><canvas id="chart-nakit-y"></canvas></div>
                        </div>
                    </div>
                    ${tNakitDynamic}
                </div>
                `;
                window.shouldRenderDashboardCharts = true;
            } else if (['Likidite Oranları', 'Kaldıraç Oranları', 'Faaliyet Etkinlik Oranları', 'Karlılık Oranları', 'Diğer Kalemler'].includes(activeTab)) {
                contentHtml = `<div style="display:flex; justify-content:center; align-items:center; height:200px; opacity:0.5; font-style:italic;">${activeTab} sayfası henüz yapım aşamasındadır.</div>`;
            } else if (activeTab === 'Değerleme') {
                // Initialize default edit modes if not present
                if (!window.degerlemeEditMode) window.degerlemeEditMode = {};
                if (!window.araDegerlemeEditMode) window.araDegerlemeEditMode = {};

                window.enterDegerlemeEdit = (p, key) => {
                    if (p.includes('/')) window.araDegerlemeEditMode[p] = true;
                    else window.degerlemeEditMode[p] = true;
                    window.degerlemeFocusPeriod = p;
                    window.degerlemeFocusKey = key;
                    if (typeof renderUI === 'function') renderUI(); else if (typeof renderPage === 'function') renderPage();
                };

                window.exitDegerlemeEdit = (p) => {
                    if (p.includes('/')) window.araDegerlemeEditMode[p] = false;
                    else window.degerlemeEditMode[p] = false;
                    if (typeof renderUI === 'function') renderUI(); else if (typeof renderPage === 'function') renderPage();
                };

                // Read saved target price data for this hisse
                if (!State.data.degerleme) State.data.degerleme = {};
                if (!State.data.degerleme[selectedHisse]) State.data.degerleme[selectedHisse] = {};
                if (!State.data.araDegerleme) State.data.araDegerleme = {};
                if (!State.data.araDegerleme[selectedHisse]) State.data.araDegerleme[selectedHisse] = {};

                const stateData = State.data.degerleme[selectedHisse];
                const araStateData = State.data.araDegerleme[selectedHisse];

                // Combine notes if both exist, else use one
                let savedNotYil = stateData.genelNotYil !== undefined ? stateData.genelNotYil : (stateData.genelNot || '');
                let savedNotAra = stateData.genelNotAra || '';
                let combinedNot = savedNotYil;
                if (savedNotAra && savedNotAra !== savedNotYil) {
                    combinedNot = combinedNot ? (combinedNot + "\n\n" + savedNotAra) : savedNotAra;
                }

                window.updateDegerlemeInputUnified = (hisse, p, field, value, shouldRender = true) => {
                    if (p.includes('/')) {
                        if (!State.data.araDegerleme[hisse]) State.data.araDegerleme[hisse] = {};
                        if (!State.data.araDegerleme[hisse][p]) State.data.araDegerleme[hisse][p] = {};
                        State.data.araDegerleme[hisse][p][field] = value;
                    } else {
                        if (!State.data.degerleme[hisse]) State.data.degerleme[hisse] = {};
                        if (!State.data.degerleme[hisse][p]) State.data.degerleme[hisse][p] = {};
                        State.data.degerleme[hisse][p][field] = value;
                    }
                    State.save();
                    if (shouldRender) {
                        if (typeof renderUI === 'function') renderUI(); else if (typeof renderPage === 'function') renderPage();
                    }
                };

                window.saveDegerlemeNotUnified = (hisse) => {
                    if (!State.data.degerleme[hisse]) State.data.degerleme[hisse] = {};
                    const input = document.getElementById('degerleme-not-input');
                    if (!input) return;
                    State.data.degerleme[hisse].genelNotYil = input.value;
                    // clear ara note to avoid duplication in future
                    if (State.data.degerleme[hisse].genelNotAra) State.data.degerleme[hisse].genelNotAra = "";
                    State.save();
                };

                const sDataDeg = window.stockData && window.stockData[selectedHisse] ? window.stockData[selectedHisse] : null;
                const bilancoHeaders = (sDataDeg && sDataDeg.bilanco && sDataDeg.bilanco.headers) ? sDataDeg.bilanco.headers : [];

                // Determine past quarters (up to 4)
                let pastQuarters = [];
                let pastIndices = [];
                for (let i = 1; i <= Math.min(4, bilancoHeaders.length - 1); i++) {
                    pastQuarters.push(bilancoHeaders[i]);
                    pastIndices.push(i);
                }
                pastQuarters.reverse();
                pastIndices.reverse();

                // Determine next quarter
                let nextQuarter = "Gelecek Çeyrek";
                if (pastQuarters.length > 0) {
                    const latest = pastQuarters[pastQuarters.length - 1];
                    if (latest.includes('/')) {
                        let parts = latest.split('/');
                        let y = parseInt(parts[0]);
                        let m = parseInt(parts[1]);
                        m += 3;
                        if (m > 12) {
                            m = m % 12 || 12;
                            y += 1;
                        }
                        nextQuarter = y + '/' + m;
                    }
                }

                // Determine next annual years (5 years)
                let nextYearNum = new Date().getFullYear();
                if (nextQuarter !== "Gelecek Çeyrek" && nextQuarter.includes('/')) {
                    nextYearNum = parseInt(nextQuarter.split('/')[0]);
                }
                let annualYears = [];
                for (let i = 0; i < 5; i++) {
                    annualYears.push((nextYearNum + i).toString());
                }

                const allPeriods = [...pastQuarters, nextQuarter, ...annualYears];

                let headerHtml = `<tr><th style="width: 140px;">Kalem</th>`;
                const colWidthStyle = `width: calc((100% - 140px) / ${allPeriods.length});`;
                allPeriods.forEach(p => {
                    const isPast = pastQuarters.includes(p);
                    let dotsHtml = '';
                    if (!isPast) {
                        const d = (p.includes('/') ? araStateData[p] : stateData[p]) || {};
                        const curCurrency = d.currency || 'TRY';
                        dotsHtml = `
                        <div style="position:absolute; right:0; top:0; bottom:0; padding:0 8px; display:flex; align-items:center; cursor:pointer;" onmouseenter="document.querySelectorAll('.currency-dropdown').forEach(el => el.style.display='none'); this.querySelector('.currency-dropdown').style.display='block';" onmouseleave="this.querySelector('.currency-dropdown').style.display='none';">
                            <i class="fas fa-ellipsis-v" style="color:var(--text-secondary);"></i>
                            <div class="currency-dropdown" style="display:none; position:absolute; right:0; top:100%; background:#1e1e1e; border:1px solid #444; border-radius:4px; z-index:999; padding:5px; box-shadow: 0 4px 6px rgba(0,0,0,0.5); text-align:left;">
                                <div style="padding:4px 10px; cursor:pointer; color:${curCurrency === 'TRY' ? '#ffffff' : '#cccccc'}; font-size:12px; font-weight:normal; white-space:nowrap;" onclick="window.updateDegerlemeInputUnified('${selectedHisse}', '${p}', 'currency', 'TRY'); this.parentElement.style.display='none';">₺ TRY</div>
                                <div style="padding:4px 10px; cursor:pointer; color:${curCurrency === 'USD' ? '#ffffff' : '#cccccc'}; font-size:12px; font-weight:normal; white-space:nowrap;" onclick="window.updateDegerlemeInputUnified('${selectedHisse}', '${p}', 'currency', 'USD'); this.parentElement.style.display='none';">$ USD</div>
                                <div style="padding:4px 10px; cursor:pointer; color:${curCurrency === 'EUR' ? '#ffffff' : '#cccccc'}; font-size:12px; font-weight:normal; white-space:nowrap;" onclick="window.updateDegerlemeInputUnified('${selectedHisse}', '${p}', 'currency', 'EUR'); this.parentElement.style.display='none';">€ EUR</div>
                            </div>
                        </div>`;
                    }
                    headerHtml += `<th style="font-size: 12px; text-align:center; position:relative; ${colWidthStyle}">
                        <div>${p}</div>
                        ${dotsHtml}
                    </th>`;
                });
                headerHtml += `</tr>`;

                let html = `<div class="dash-card" style="display:flex; flex-direction:column; margin-top: 0;">
                    <style>.degerleme-table td, .degerleme-table th, .degerleme-table input { color: #cccccc !important; }</style>
                    <div style="overflow-x:auto;">
                    <table class="dash-table compact-table degerleme-table" style="width: 100%; min-width: 1200px; table-layout: fixed !important;" onclick="document.querySelectorAll('.currency-dropdown').forEach(el => el.style.display='none');">
                            <thead>${headerHtml}</thead>
                            <tbody>`;

                // Common calculations
                let odenmisSermayeDeg = 0;
                if (sDataDeg && sDataDeg.bilanco && sDataDeg.bilanco.rows) {
                    const osRow_deg = sDataDeg.bilanco.rows.find(r => r[0] && r[0].toString().toLowerCase().includes('ödenmiş sermaye') && !r[0].toString().toLowerCase().includes('fark') && !r[0].toString().toLowerCase().includes('düzeltme'));
                    if (osRow_deg && osRow_deg.length > 1) {
                        odenmisSermayeDeg = parseFloat(String(osRow_deg[1]).replace(/\./g, '').replace(/,/g, '.')) || 0;
                    }
                }
                let netBorc_deg = 0;
                if (sDataDeg && sDataDeg.bilanco && sDataDeg.bilanco.rows) {
                    let finansalBorclarTotal_deg = 0;
                    let nakitTotal_deg = 0;
                    let finYatTotal_deg = 0;
                    let inDuran = false;
                    sDataDeg.bilanco.rows.forEach(r => {
                        if (!r[0]) return;
                        const rName = r[0].toString().toLocaleLowerCase('tr-TR');
                        if (rName.trim() === 'duran varlıklar') inDuran = true;
                        if (rName.includes('finansal borçlar') && !rName.includes('kısımlar') && !rName.includes('ksmlar') && (!sDataDeg.bilanco.rows.length || sDataDeg.bilanco.rows.indexOf(r) < sDataDeg.bilanco.rows.length - 2)) {
                            const val = typeof r[1] === 'number' ? r[1] : parseFloat((r[1] || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
                            finansalBorclarTotal_deg += val;
                        }
                        if (rName.includes('nakit ve nakit benzerleri') || rName.includes('nakit ve nakit değerler')) {
                            const val = typeof r[1] === 'number' ? r[1] : parseFloat((r[1] || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
                            nakitTotal_deg += val;
                        }
                        if (rName.includes('finansal yatırımlar') && !inDuran) {
                            const val = typeof r[1] === 'number' ? r[1] : parseFloat((r[1] || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
                            finYatTotal_deg += val;
                        }
                    });
                    netBorc_deg = finansalBorclarTotal_deg - nakitTotal_deg - finYatTotal_deg;
                }

                const guncelFiyat = parseFloat(State.getFiyat ? State.getFiyat(selectedHisse) : (window.fiyatlar ? window.fiyatlar[selectedHisse] : 0)) || 0;
                const usdKuru = (State.getFiyat ? parseFloat(State.getFiyat('USDTRY')) : null) || window.dolarKuru || 46.99;
                const eurKuru = (State.getFiyat ? parseFloat(State.getFiyat('EURTRY')) : null) || window.euroKuru || 50;

                const parseTRNumberForAra = (str) => {
                    if (str === undefined || str === null || str === '') return 0;
                    if (typeof str === 'number') return str;
                    return parseFloat(str.replace(/\./g, '').replace(/,/g, '.')) || 0;
                };

                const fetchHistVal = (key, idx) => {
                    if (!sDataDeg) return '';
                    let r = null;
                    let val = '';
                    if (key === 'ciro') {
                        if (sDataDeg.gelirCeyrek && sDataDeg.gelirCeyrek.rows) {
                            r = sDataDeg.gelirCeyrek.rows.find(x => x[0] && String(x[0]).toLocaleLowerCase('tr-TR').includes('satış gelirleri'));
                        }
                    } else if (key === 'favok') {
                        if (sDataDeg.gelirCeyrek && sDataDeg.gelirCeyrek.rows) {
                            r = sDataDeg.gelirCeyrek.rows.find(x => x[0] && String(x[0]).toLocaleLowerCase('tr-TR').includes('favök'));
                        }
                    } else if (key === 'net_kar') {
                        if (sDataDeg.gelirCeyrek && sDataDeg.gelirCeyrek.rows) {
                            r = sDataDeg.gelirCeyrek.rows.find(x => x[0] && (String(x[0]).toLocaleLowerCase('tr-TR').includes('ana ortaklık payları') || String(x[0]).toLocaleLowerCase('tr-TR').includes('dönem net kar')));
                        }
                    } else if (key === 'ozkaynaklar') {
                        if (sDataDeg.bilanco && sDataDeg.bilanco.rows) {
                            r = sDataDeg.bilanco.rows.find(x => x[0] && String(x[0]).toLocaleLowerCase('tr-TR').includes('ana ortaklığa ait özkaynaklar'));
                        }
                    }
                    if (r && r[idx] !== undefined && r[idx] !== '') val = parseTRNumberForAra(r[idx]);
                    return val;
                };

                const rows = [
                    { key: 'ciro', label: 'Satış Gelirleri', type: 'currency_int' },
                    { key: 'favok_marji', label: 'FAVÖK Marjı', type: 'percent' },
                    { key: 'net_kar_marji', label: 'Net Kar Marjı', type: 'percent' },
                    { key: 'favok', label: 'FAVÖK', readonly: true, type: 'currency_int' },
                    { key: 'net_kar', label: 'Net Kar', readonly: true, type: 'currency_int' },
                    { key: 'ozkaynaklar', label: 'Özkaynaklar', type: 'currency_int' },
                    { key: 'fd_favok', label: 'FD/FAVÖK', type: 'decimal' },
                    { key: 'f_k', label: 'F/K', type: 'decimal' },
                    { key: 'pd_dd', label: 'PD/DD', type: 'decimal' },
                    { key: 'hedef_fiyat', label: 'Hedef Fiyat', readonly: true, isTarget: true, type: 'target' },
                    { key: 'potansiyel', label: 'Potansiyel', readonly: true, type: 'percent_target' }
                ];

                rows.forEach(r => {
                    html += `<tr><td style="text-align:left !important; font-weight:normal;">${r.label}</td>`;
                    allPeriods.forEach(p => {
                        const isPast = pastQuarters.includes(p);
                        let d = {};
                        if (isPast) {
                            const pIdx = pastIndices[pastQuarters.indexOf(p)];
                            const ciro = fetchHistVal('ciro', pIdx);
                            const favok = fetchHistVal('favok', pIdx);
                            const net_kar = fetchHistVal('net_kar', pIdx);
                            const ozkaynaklar = fetchHistVal('ozkaynaklar', pIdx);

                            d.ciro = ciro;
                            d.favok = favok;
                            d.net_kar = net_kar;
                            d.ozkaynaklar = ozkaynaklar;
                            d.favok_marji = (ciro !== '' && ciro !== 0 && favok !== '') ? (favok / ciro) * 100 : '';
                            d.net_kar_marji = (ciro !== '' && ciro !== 0 && net_kar !== '') ? (net_kar / ciro) * 100 : '';
                            d.fd_favok = '';
                            d.f_k = '';
                            d.pd_dd = '';
                            d.hedef_fiyat = '';
                            d.potansiyel = '';
                        } else if (p.includes('/')) {
                            d = araStateData[p] || {};
                        } else {
                            d = stateData[p] || {};
                        }

                        const editMode = !isPast && (p.includes('/') ? window.araDegerlemeEditMode[p] : window.degerlemeEditMode[p]);
                        const curCurrency = d.currency || 'TRY';
                        let currencySymbol = '₺';
                        if (curCurrency === 'USD') currencySymbol = '$';
                        if (curCurrency === 'EUR') currencySymbol = '€';

                        let val = d[r.key] !== undefined ? d[r.key] : '';
                        let displayVal = val;

                        if (isPast && ['fd_favok', 'f_k', 'pd_dd', 'hedef_fiyat', 'potansiyel'].includes(r.key)) {
                            displayVal = val = '---';
                        } else if (!isPast) {
                            const ciro = parseFloat(d.ciro) || 0;
                            const favokMarji = parseFloat(d.favok_marji) || 0;
                            const netKarMarji = parseFloat(d.net_kar_marji) || 0;

                            let favok = 0;
                            let net_kar = 0;
                            let hasFavok = false;
                            let hasNetKar = false;

                            let past3Favok = 0;
                            let past3NetKar = 0;

                            if (p.includes('/') && sDataDeg && sDataDeg.gelirCeyrek && sDataDeg.gelirCeyrek.rows) {
                                const favokRow = sDataDeg.gelirCeyrek.rows.find(x => x[0] && String(x[0]).toLocaleLowerCase('tr-TR').includes('favök'));
                                const netKarRow = sDataDeg.gelirCeyrek.rows.find(x => x[0] && (String(x[0]).toLocaleLowerCase('tr-TR').includes('ana ortaklık payları') || String(x[0]).toLocaleLowerCase('tr-TR').includes('dönem net kar')));
                                
                                for (let i = 1; i <= Math.min(3, sDataDeg.gelirCeyrek.headers.length - 1); i++) {
                                    if (favokRow && favokRow[i] !== undefined && favokRow[i] !== '') {
                                        past3Favok += (typeof favokRow[i] === 'number' ? favokRow[i] : parseFloat(String(favokRow[i]).replace(/\./g, '').replace(/,/g, '.')) || 0);
                                    }
                                    if (netKarRow && netKarRow[i] !== undefined && netKarRow[i] !== '') {
                                        past3NetKar += (typeof netKarRow[i] === 'number' ? netKarRow[i] : parseFloat(String(netKarRow[i]).replace(/\./g, '').replace(/,/g, '.')) || 0);
                                    }
                                }
                            }

                            if (d.ciro !== undefined && d.ciro !== '' && d.favok_marji !== undefined && d.favok_marji !== '') {
                                favok = (ciro * (favokMarji / 100));
                                hasFavok = true;
                            }
                            if (d.ciro !== undefined && d.ciro !== '' && d.net_kar_marji !== undefined && d.net_kar_marji !== '') {
                                net_kar = (ciro * (netKarMarji / 100));
                                hasNetKar = true;
                            }

                            if (r.key === 'favok') displayVal = val = hasFavok ? favok : '---';
                            if (r.key === 'net_kar') displayVal = val = hasNetKar ? net_kar : '---';

                            let validPDs = [];
                            let currentNetBorc = netBorc_deg;
                            if (curCurrency === 'USD') currentNetBorc = netBorc_deg / usdKuru;
                            else if (curCurrency === 'EUR') currentNetBorc = netBorc_deg / eurKuru;

                            let yFdFavok = parseFloat(d.fd_favok) || 0;
                            let yFk = parseFloat(d.f_k) || 0;
                            let yPdDd = parseFloat(d.pd_dd) || 0;

                            let ttmFavok = favok + (p.includes('/') ? past3Favok : 0);
                            let ttmNetKar = net_kar + (p.includes('/') ? past3NetKar : 0);

                            if (hasFavok && yFdFavok > 0) {
                                validPDs.push((ttmFavok * yFdFavok) - currentNetBorc);
                            }
                            if (hasNetKar && yFk > 0) {
                                validPDs.push(ttmNetKar * yFk);
                            }
                            if (d.ozkaynaklar !== undefined && d.ozkaynaklar !== '' && yPdDd > 0) {
                                validPDs.push((parseFloat(d.ozkaynaklar) || 0) * yPdDd);
                            }

                            let avgPD = 0;
                            if (validPDs.length > 0) avgPD = validPDs.reduce((a, b) => a + b, 0) / validPDs.length;

                            let hedefFiyatTL = 0;
                            let hasHedef = false;

                            let currentOdenmisSermaye = odenmisSermayeDeg;
                            if (d.sermaye !== undefined && d.sermaye !== '') currentOdenmisSermaye = parseFloat(d.sermaye) || currentOdenmisSermaye;

                            if (validPDs.length > 0 && currentOdenmisSermaye > 0) {
                                let hedefFiyatForeign = avgPD / currentOdenmisSermaye;
                                if (curCurrency === 'USD') hedefFiyatTL = hedefFiyatForeign * usdKuru;
                                else if (curCurrency === 'EUR') hedefFiyatTL = hedefFiyatForeign * eurKuru;
                                else hedefFiyatTL = hedefFiyatForeign;
                                hasHedef = true;
                            }

                            if (r.key === 'hedef_fiyat') displayVal = val = hasHedef ? hedefFiyatTL : '---';

                            let potansiyelNum = 0;
                            if (hasHedef && guncelFiyat > 0) potansiyelNum = ((hedefFiyatTL - guncelFiyat) / guncelFiyat) * 100;

                            if (r.key === 'potansiyel') {
                                if (hasHedef && guncelFiyat > 0) displayVal = val = potansiyelNum;
                                else displayVal = val = '---';
                            }
                            if (r.key === 'sermaye' && !editMode && (d.sermaye === undefined || d.sermaye === '')) {
                                displayVal = odenmisSermayeDeg;
                            }
                        }

                        if (displayVal !== '---' && displayVal !== '') {
                            let numVal = parseFloat(displayVal);
                            if (!isNaN(numVal)) {
                                if (r.type === 'target') displayVal = '₺' + new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numVal);
                                else if (r.type === 'currency') displayVal = currencySymbol === '€' ? new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(numVal) + '€' : currencySymbol + new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(numVal);
                                else if (r.type === 'currency_int') displayVal = currencySymbol === '€' ? new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(numVal) + '€' : currencySymbol + new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(numVal);
                                else if (r.type === 'percent') {
                                    let formatted = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(Math.abs(numVal));
                                    displayVal = numVal < 0 ? '%-' + formatted : '%' + formatted;
                                } else if (r.type === 'percent_target') {
                                    let formatted = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(numVal));
                                    displayVal = numVal < 0 ? '%-' + formatted : '%' + formatted;
                                } else if (r.type === 'decimal') {
                                    displayVal = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numVal);
                                }
                            }
                        }

                        let extraStyle = '';
                        if (!isPast && r.isTarget && displayVal !== '---') {
                            const numPot = ((parseFloat(String(displayVal).replace('₺', '').replace(/\./g, '').replace(',', '.')) - guncelFiyat) / guncelFiyat) * 100;
                            extraStyle = numPot > 0 ? 'color: #2ecc71 !important; font-weight: normal; font-size:1.1rem;' : 'color: #e74c3c !important; font-weight: normal; font-size:1.1rem;';
                        }
                        if (!isPast && r.key === 'potansiyel' && val !== '---') {
                            extraStyle = val > 0 ? 'color: #2ecc71 !important; font-weight: normal;' : 'color: #e74c3c !important; font-weight: normal;';
                        }

                        const pSafe = p.replace('/', '-');
                        if (editMode && !r.readonly) {
                            html += `<td class="editing-column-${pSafe}" style="text-align: right !important; padding: 2px !important; ${colWidthStyle}">
                                <input id="edit-input-${pSafe}-${r.key}" type="number" step="any" style="width:100%; min-width:0; box-sizing: border-box; background:var(--input-bg); color:var(--text-primary); border:1px solid var(--accent-color); padding:4px; text-align:right; border-radius:4px;" 
                                value="${val !== '---' ? val : ''}" 
                                oninput="window.updateDegerlemeInputUnified('${selectedHisse}', '${p}', '${r.key}', this.value, false)" 
                                onkeydown="if(event.key === 'Enter') { event.preventDefault(); window.exitDegerlemeEdit('${p}'); }"
                                onblur="setTimeout(() => { if (!document.activeElement.closest('.editing-column-${pSafe}')) { window.exitDegerlemeEdit('${p}'); } }, 100)">
                            </td>`;
                        } else {
                            const dblClick = (!isPast && !r.readonly) ? `ondblclick="window.enterDegerlemeEdit('${p}', '${r.key}')" style="cursor:text; text-align: right !important; ${extraStyle}" title="Düzenlemek için çift tıklayın"` : `style="text-align: right !important; ${extraStyle}"`;
                            html += `<td class="editing-column-${pSafe}" ${dblClick}>${displayVal === '' ? '---' : displayVal}</td>`;
                        }
                    });
                    html += `</tr>`;
                });

                if (window.degerlemeFocusPeriod && window.degerlemeFocusKey) {
                    setTimeout(() => {
                        const el = document.getElementById(`edit-input-${window.degerlemeFocusPeriod.replace('/', '-')}-${window.degerlemeFocusKey}`);
                        if (el) {
                            el.focus();
                            el.select();
                        }
                        window.degerlemeFocusPeriod = null;
                        window.degerlemeFocusKey = null;
                    }, 50);
                }

                html += `</tbody></table></div>`; // End of table wrapper
                html += `
                    <div style="margin-top: 1rem; border-top: 1px solid var(--surface-border); padding-top: 1rem;">
                        <textarea id="degerleme-not-input" class="form-control" style="width: 100%; height: 60px; resize: vertical; font-size: 12px; font-family: inherit; margin-bottom: 0.5rem; color: #cccccc;" placeholder="Bu hisse için değerleme notlarınızı buraya yazabilirsiniz..." onblur="window.saveDegerlemeNotUnified('${selectedHisse}')">${combinedNot}</textarea>
                    </div>
                </div>`; // End of dash-card
                contentHtml += html;
            } else if (activeTab === 'Akış') {
                let analizler = State.data.analizler || [];
                analizler = analizler.filter(a => (a.hisse || '').toUpperCase() === selectedHisse.toUpperCase());

                // Get Reports
                let foundReports = [];
                const availablePdfs = (window.stockReports && window.stockReports[selectedHisse]) ? window.stockReports[selectedHisse] : [];
                availablePdfs.forEach(file => {
                    let baseName = file.toLowerCase();
                    if (baseName.endsWith('.pdf')) baseName = baseName.substring(0, baseName.length - 4);

                    const trMap = {
                        'arastirma': 'Araştırma', 'raporu': 'Raporu', 'faaliyet': 'Faaliyet',
                        'finansal': 'Finansal', 'toplanti': 'Toplantı', 'notlari': 'Notları',
                        'yatirimci': 'Yatırımcı', 'sunumu': 'Sunumu', 'fiyat': 'Fiyat',
                        'tespit': 'Tespit', 'degerleme': 'Değerleme', 'sirket': 'Şirket',
                        'yatirim': 'Yatırım', 'degerler': 'Değerler', 'is': 'İş',
                        'unlu': 'Ünlü', 'yapi': 'Yapı', 'vakif': 'Vakıf', 'araci': 'Aracı',
                        'info': 'İnfo', 'teb': 'TEB', 'qnb': 'QNB', 'a1': 'A1',
                        'capital': 'Capital', 'tacirler': 'Tacirler', 'ak': 'Ak',
                        'tera': 'Tera', 'bulls': 'Bulls', 'ziyaretci': 'Ziyaretçi',
                        'ziyareti': 'Ziyareti', 'notu': 'Notu', 'rapor': 'Rapor',
                        'degerlendirme': 'Değerlendirme', 'degerlendirmesi': 'Değerlendirmesi',
                        'ceyrek': 'Çeyrek', 'yillik': 'Yıllık', 'bilanco': 'Bilanço',
                        'gelir': 'Gelir', 'tablosu': 'Tablosu', 'nakit': 'Nakit', 'akisi': 'Akışı',
                        'gelecege': 'Geleceğe', 'donuk': 'Dönük', 'beklentiler': 'Beklentiler',
                        'aciklama': 'Açıklama'
                    };

                    const cols = baseName.split('-');
                    let sirket = '-';
                    let tarih = '-';
                    let ad = '-';
                    let sn = '-';

                    const formatWords = (str) => {
                        if (!str) return '-';
                        return str.split('_').map(w => trMap[w] || w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    };

                    if (/^\d+$/.test(cols[0])) {
                        sn = cols[0];
                        if (cols.length >= 4) { ad = formatWords(cols[1]); tarih = formatWords(cols[2]); sirket = formatWords(cols[3]); }
                        else if (cols.length === 3) { ad = formatWords(cols[1]); tarih = formatWords(cols[2]); }
                        else if (cols.length === 2) { ad = formatWords(cols[1]); }
                    } else {
                        if (cols.length >= 3) { ad = formatWords(cols[0]); tarih = formatWords(cols[1]); sirket = formatWords(cols[2]); }
                        else if (cols.length === 2) { ad = formatWords(cols[0]); tarih = formatWords(cols[1]); }
                        else if (cols.length === 1) { ad = formatWords(cols[0]); }
                    }

                    foundReports.push({ type: 'report', file: file, sn: sn, name: ad, tarih: tarih, company: sirket });
                });

                const parseDateStr = (dStr) => {
                    if (!dStr || dStr === '-') return 0;
                    let s = dStr.replace(/[\s\._]/g, '-');
                    let p = s.split('-');
                    if (p.length >= 3) {
                        if (p[0].length === 4) {
                            return parseInt(p[0] + p[1].padStart(2, '0') + p[2].padStart(2, '0'));
                        } else if (p[2].length === 4) {
                            return parseInt(p[2] + p[1].padStart(2, '0') + p[0].padStart(2, '0'));
                        }
                    }
                    let clean = dStr.replace(/\D/g, '');
                    if (clean.length === 8) {
                        if (clean.startsWith('20')) return parseInt(clean);
                        return parseInt(clean.substring(4, 8) + clean.substring(2, 4) + clean.substring(0, 2));
                    }
                    return parseInt(clean) || 0;
                };

                const today = new Date().toISOString().split('T')[0];
                let unifiedList = [];

                analizler.forEach(a => {
                    let d = 0;
                    if (a.tarih) {
                        d = parseDateStr(a.tarih);
                    }
                    unifiedList.push({
                        type: 'analiz',
                        data: a,
                        sortTarih: d,
                        gosterimTarih: a.tarih ? a.tarih.split('-').reverse().join('.') : '-'
                    });
                });

                foundReports.forEach(r => {
                    let d = parseDateStr(r.tarih);
                    unifiedList.push({
                        type: 'report',
                        data: r,
                        sortTarih: d,
                        gosterimTarih: r.tarih !== '-' ? r.tarih : '-'
                    });
                });

                // Kişisel analiz her zaman en üstte, sonra yeniden eskiye sıralama
                const isPersonal = (item) => item.type === 'analiz' && item.data && (item.data.kurum === 'Yunus Şensoy' || (window.currentUser && item.data.kurum === window.currentUser.displayName));
                unifiedList.sort((a, b) => {
                    const aPers = isPersonal(a);
                    const bPers = isPersonal(b);
                    if (aPers && !bPers) return -1;
                    if (!aPers && bPers) return 1;
                    return b.sortTarih - a.sortTarih;
                });

                let tableHtml = `
                <div class="dash-card" style="display: flex; flex-direction: column; flex: 1; padding-bottom: 0; margin-bottom: 0; min-height: 0;">
                    <div style="display: flex; align-items: center; justify-content: center; padding: 3px 5px; border-bottom: 1px solid var(--table-border); position: relative;">
                        <div style="font-size: 15px; font-weight: normal; color: var(--text-primary); text-align: center;">Akış</div>
                        <button class="btn" style="padding: 0 0.5rem; display: flex; align-items: center; justify-content: center; background: transparent; color: #888888; border: none; box-shadow: none; position: absolute; right: 5px;" onclick="window.toggleInlineAnaliz()" title="Yeni Not Ekle"><i class="fas fa-plus" style="font-size: 15px;"></i></button>
                    </div>
                    
                                            <div id="inline-analiz-row" class="glass" style="display: none; flex-direction: column; gap: 1rem; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid var(--accent-color);">
    <input type="hidden" id="analiz-hisse" value="${selectedHisse || ''}">
    
    <div style="display: flex; gap: 1rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--table-border); padding-bottom: 0.5rem;">
        <label style="color: #cccccc; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
            <input type="radio" name="akisTipi" value="analiz" checked onchange="window.toggleAkisTipi()"> Genel Analiz/Rapor
        </label>
        <label style="color: #cccccc; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
            <input type="radio" name="akisTipi" value="kisisel" onchange="window.toggleAkisTipi()"> Kişisel Not
        </label>
    </div>

    <div id="akis-genel-inputs" style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <!-- 1. Link -->
        <div style="flex: 2; min-width: 250px;">
            <label style="font-size: 0.8rem; color: #cccccc;">Link</label>
            <input type="text" id="analiz-baglanti" class="form-control" style="width:100%;" placeholder="https://...">
        </div>
        
        <!-- 2. Analist/Şirket -->
        <div style="flex: 1; min-width: 150px;">
            <label style="font-size: 0.8rem; color: #cccccc;">Analist/Şirket</label>
            <input type="text" id="analiz-borsaci" list="analiz-borsaci-list" class="form-control" style="width:100%;" placeholder="Örn: Ak Yatırım">
        </div>
        
        <!-- 3. Tarih -->
        <div style="flex: 1; min-width: 120px;">
            <label style="font-size: 0.8rem; color: #cccccc;">Tarih</label>
            <input type="date" id="analiz-tarih" class="form-control" style="width:100%; color-scheme: dark;" value="${today}">
        </div>
        
        <!-- 4. Başlık -->
        <div style="flex: 1.5; min-width: 200px;">
            <label style="font-size: 0.8rem; color: #cccccc;">Başlık (Opsiyonel)</label>
            <input type="text" id="analiz-baslik" class="form-control" style="width:100%;" placeholder="Not/Rapor/Video Başlığı">
        </div>
        
        <!-- 5. Dosya Ekle -->
        <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column;">
            <label style="font-size: 0.8rem; color: #cccccc;">Dosya Ekle (Opsiyonel)</label>
            <style>
                #upload-file { display: none; }
            </style>
            <label for="upload-file" class="upload-file-label" title="Bir Dosya Seç" style="padding: 3px 7px 3px 4px; background: #000000; color: #ffffff; display: flex; align-items: center; justify-content: center; border-radius: 4px; cursor: pointer; border: none; font-size: 12px; font-weight: normal; margin-top: 2px;">
                <span class="fa-stack" style="font-size: 8px; width: 2em; height: 2em;"><i class="fas fa-folder-open fa-stack-2x" style="color: #ffffff;"></i></span>
                <span style="margin-left: 5px;">PDF Seç</span>
            </label>
            <input type="file" id="upload-file" accept="application/pdf" onchange="const f = this.files[0]; if(f) this.previousElementSibling.innerHTML = '<i class=\'fas fa-file-pdf\' style=\'color:var(--danger-color); font-size: 14px;\'></i> <span style=\'color: #fff; margin-left: 5px; font-size:11px;\'>' + (f.name.length > 15 ? f.name.substring(0,15)+'...' : f.name) + '</span>'">
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
                      <div class="table-container custom-scroll" style="overflow-x: auto; overflow-y: auto; flex: 1; min-height: 0;">
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
                `;

                if (unifiedList.length === 0) {
                    tableHtml += `<tr><td colspan="7" style="text-align: center; padding: 2rem; opacity: 0.5;">Henüz akış verisi bulunmuyor.</td></tr>`;
                } else {
                    let sn = 1;
                    unifiedList.forEach(item => {
                        if (item.type === 'report') {
                            const r = item.data;
                            let filePath = 'Hisseler/' + selectedHisse + '/' + r.file;
                            tableHtml += `
                            <tr style="border-bottom:1px solid var(--table-border); background: var(--table-row-bg);">
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:center !important; padding:8px 5px; vertical-align:top !important; width:1%; white-space:nowrap;">${sn++}</td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:center !important; padding:8px 5px; vertical-align:top !important; width:1%; white-space:nowrap;">
                                    <a href="${filePath}" target="_blank" style="text-decoration: none;" title="PDF'i Görüntüle">
                                        <i class="fas fa-file-pdf" style="color: #3b82f6; font-size: 12px; transition: color 0.2s;" onmouseover="this.style.color='#ffffff';" onmouseout="this.style.color='#3b82f6';"></i>
                                    </a>
                                </td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:left !important; padding:8px 5px; vertical-align:top !important; width:200px; max-width:200px; white-space:normal !important; word-break:break-word;">
                                    ${r.name !== '-' && r.name ? r.name : r.file}
                                </td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:center !important; padding:8px 5px; vertical-align:top !important; width:1%; white-space:nowrap;">${item.gosterimTarih}</td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:left !important; padding:8px 5px; vertical-align:top !important; width:1%; white-space:nowrap;">${r.company !== '-' ? r.company : '-'}</td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:left !important; padding:8px 5px; vertical-align:top !important; white-space:pre-wrap;">-</td>
                                <td style="padding:8px 5px; text-align:center !important; vertical-align:top !important; width:1%; white-space:nowrap;">
                                    <button class="btn btn-icon" style="background: transparent; color: #888888; padding: 2px !important; font-size: 14px; border: none;" onclick="window.deleteAnaliz('${r.id || r.file}')" title="Sil"><i class="fas fa-trash-alt"></i></button>
                                </td>
                            </tr>
                            `;
                        } else {
                            const a = item.data;
                            let platformIcon = '<i class="fas fa-sticky-note" style="color: #888; font-size: 12px;"></i>';
                            let titleText = a.baslik || '-';
                            let titleLinkHtml = titleText;
                            
                            if (a.baglanti) {
                                let iconStr = 'fas fa-external-link-alt" style="color: #888; font-size: 12px;';
                                if (a.baglanti.includes('youtube.com') || a.baglanti.includes('youtu.be')) { 
                                    iconStr = 'fab fa-youtube" style="color:#FF0000; font-size: 12px;'; 
                                } else if (a.baglanti.includes('twitter.com') || a.baglanti.includes('x.com')) { 
                                    iconStr = 'fa-brands fa-x-twitter" style="color: var(--text-primary); font-size: 12px;'; 
                                }
                                platformIcon = `<a href="${a.baglanti}" target="_blank" style="text-decoration: none;" title="Bağlantıya Git"><i class="${iconStr}"></i></a>`;
                                titleLinkHtml = titleText;
                            } else if (a.isKisiselNot) {
                                platformIcon = '<i class="fas fa-user-edit" style="color: var(--accent-color); font-size: 12px;"></i>';
                            }
                            
                            tableHtml += `
                            <tr style="border-bottom:1px solid var(--table-border); background: var(--table-row-bg);">
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:center !important; padding:8px 5px; vertical-align:top !important; width:1%; white-space:nowrap;">${sn++}</td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:center !important; padding:8px 5px; vertical-align:top !important; width:1%; white-space:nowrap;">${platformIcon}</td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:left !important; padding:8px 5px; vertical-align:top !important; width:200px; max-width:200px; white-space:normal !important; word-break:break-word;">${titleLinkHtml}</td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:center !important; padding:8px 5px; vertical-align:top !important; width:1%; white-space:nowrap;">${item.gosterimTarih}</td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:left !important; padding:8px 5px; vertical-align:top !important; width:1%; white-space:nowrap;">${a.borsaci || '-'}</td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:left !important; padding:8px 5px; vertical-align:top !important; white-space:pre-wrap;">${a.notText || '-'}</td>
                                <td style="padding:8px 5px; text-align:center !important; vertical-align:top !important; width:1%; white-space:nowrap;">
                                    <button class="btn btn-icon" style="color: var(--accent-color); padding: 4px !important; font-size: 14px;" onclick="window.editAnaliz('${a.id}')" title="Düzenle"><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-icon" style="background: transparent; color: #888888; padding: 2px !important; font-size: 14px; border: none;" onclick="window.deleteAnaliz('${a.id}')" title="Sil"><i class="fas fa-trash-alt"></i></button>
                                </td>
                            </tr>
                            `;
                        }
                    });
                }
                tableHtml += `
                        </tbody>
                    </table>
                    </div>
                </div>`;
                contentHtml += tableHtml;
                setTimeout(() => {
                    const uniqueBorsacilar = [...new Set((State.data.analizler || []).map(a => a.borsaci ? a.borsaci.trim() : '').filter(b => b))].sort();
                    if (typeof window.setupCustomDropdown === 'function') {
                        window.setupCustomDropdown('analiz-borsaci', uniqueBorsacilar);
                    }
                }, 50);
            }
            let stockHeaderHtml = '';
            if (selectedHisse) {
                window.stockChanges = window.stockChanges || {};
                const hFiyat = parseFloat(State.getFiyat(selectedHisse)) || 0;
                let hDegisim = 0;
                if (window.stockChanges[selectedHisse] !== undefined) {
                    hDegisim = window.stockChanges[selectedHisse];
                } else {
                    const hKayit = State.data.hisseFiyatlari && State.data.hisseFiyatlari.find(h => h.hisse === selectedHisse);
                    const oKapanis = hKayit && hKayit.onceki_kapanis ? parseFloat(hKayit.onceki_kapanis) : hFiyat;
                    hDegisim = oKapanis > 0 ? ((hFiyat - oKapanis) / oKapanis) * 100 : 0;
                }

                const isPos = hDegisim >= 0;
                const hColor = isPos ? 'var(--success-color)' : 'var(--danger-color)';

                let initChangeStr = Math.abs(hDegisim).toFixed(2).replace('.', ',');
                if (isPos && hDegisim > 0) initChangeStr = '+' + initChangeStr;
                else if (!isPos) initChangeStr = '-' + initChangeStr;

                stockHeaderHtml = `
            <div id="hisse-header-border" class="glass" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-radius: 12px; border-left: 5px solid ${hColor}; margin: 0; flex-shrink: 0;">
                <div>
                    <h1 style="margin: 0; font-size: 16px; font-weight: 800; letter-spacing: 1px; color: var(--text-primary);">${selectedHisse}</h1>
                </div>
                <div style="display: flex; align-items: baseline; gap: 0.8rem;">
                    <div style="font-size: 16px; font-weight: bold; color: var(--text-primary);">${new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(hFiyat)} ₺</div>
                    <div id="hisse-header-change" style="font-size: 13px; font-weight: 600; color: ${hColor}; display: block;">
                        <i class="fas fa-caret-${isPos ? 'up' : 'down'}"></i> %${initChangeStr}
                    </div>
                </div>
            </div>
            `;
            }

            container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 1rem; height: 100%;">
                ${stockHeaderHtml}
                <div style="display: flex; gap: 0.5rem; padding: 0.5rem 1rem; border-bottom: 1px solid var(--table-border); border-radius: 12px; flex-wrap: wrap; align-items: center; background: var(--overlay-bg); flex-shrink: 0;">
                    ${tabsHtml}
                </div>
                <div class="page-section active" style="display: flex; flex-direction: column; gap: 1rem; padding: 0; flex: 1; overflow: hidden; min-height: 0;">
                    ${contentHtml}
                </div>
            </div>
        `;

            if (selectedHisse) {
                setTimeout(() => {
                    fetch('https://scanner.tradingview.com/turkey/scan', {
                        method: 'POST',
                        headers: { 'Content-Type': 'text/plain' },
                        body: JSON.stringify({ symbols: { tickers: ['BIST:' + selectedHisse] }, columns: ['close', 'change'] })
                    }).then(res => res.json()).then(data => {
                        if (data && data.data && data.data.length > 0) {
                            const change = data.data[0].d[1];
                            const changeEl = document.getElementById('hisse-header-change');
                            const borderEl = document.getElementById('hisse-header-border');
                            if (changeEl) {
                                window.stockChanges[selectedHisse] = change;
                                const isPos = change >= 0;
                                const color = isPos ? 'var(--success-color)' : 'var(--danger-color)';
                                changeEl.style.color = color;
                                changeEl.style.display = 'block';
                                let changeStr = Math.abs(change).toFixed(2).replace('.', ',');
                                if (isPos && change > 0) changeStr = '+' + changeStr;
                                else if (!isPos) changeStr = '-' + changeStr;
                                changeEl.innerHTML = '<i class="fas fa-caret-' + (isPos ? 'up' : 'down') + '"></i> %' + changeStr;
                                if (borderEl) borderEl.style.borderLeftColor = color;
                            }
                        }
                    }).catch(e => {
                        const changeEl = document.getElementById('hisse-header-change');
                        if (changeEl) changeEl.innerHTML = '-';
                    });
                }, 100);
            }


            if (window.shouldRenderDashboardCharts) {
                window.shouldRenderDashboardCharts = false;
                setTimeout(() => {
                    if (!window.dashboardChartData) return;
                    const dData = window.dashboardChartData;
                    if (!dData.labels || dData.labels.length === 0) return;

                    const labels = dData.labels;
                    const cOpts = {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                enabled: true,
                                callbacks: {
                                    label: function (context) {
                                        let label = context.dataset.label || '';
                                        if (label) label += ': ';
                                        if (context.parsed.y !== null) {
                                            label += new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(context.parsed.y);
                                        }
                                        return label;
                                    }
                                }
                            },
                            datalabels: { display: false }
                        },
                        scales: {
                            x: { ticks: { color: '#888', font: { size: 10 } }, grid: { display: false } },
                            y: { ticks: { display: false }, grid: { display: false }, border: { display: false } }
                        }
                    };


                    if (document.getElementById('chart-bkm')) {
                        const commonOpts = {
                            responsive: true, maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                datalabels: { display: false },
                                tooltip: {
                                    callbacks: {
                                        label: (ctx) => {
                                            let val = ctx.parsed.y !== null ? new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(ctx.parsed.y) : '';
                                            if (ctx.dataset.label && ctx.dataset.label.includes('%') && val) {
                                                return '%' + val;
                                            }
                                            return val;
                                        }
                                    }
                                }
                            },
                            scales: {
                                x: { ticks: { font: { size: 10 }, color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255, 255, 255, 0.03)' } },
                                y: { ticks: { font: { size: 10 }, color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255, 255, 255, 0.03)' } }
                            }
                        };
                        const pinkColor = '#d6336c';

                        const createChart = (id, data, label) => {
                            let chartCanvas = document.getElementById(id);
                            let existingChart = Chart.getChart(chartCanvas);
                            if (existingChart) existingChart.destroy();
                            new Chart(chartCanvas.getContext('2d'), {
                                type: 'line',
                                data: {
                                    labels: labels,
                                    datasets: [{
                                        label: label,
                                        data: data,
                                        borderColor: pinkColor,
                                        backgroundColor: 'rgba(214, 51, 108, 0.1)',
                                        borderWidth: 2,
                                        pointBackgroundColor: pinkColor,
                                        pointRadius: 4,
                                        tension: 0
                                    }]
                                },
                                options: commonOpts
                            });
                        };

                        const createMarjChart = (id, ceyreklikData, yillikData) => {
                            let chartCanvas = document.getElementById(id);
                            if (!chartCanvas) return;
                            let existingChart = Chart.getChart(chartCanvas);
                            if (existingChart) existingChart.destroy();
                            new Chart(chartCanvas.getContext('2d'), {
                                type: 'line',
                                data: {
                                    labels: labels,
                                    datasets: [
                                        {
                                            label: 'Çeyreklik',
                                            data: ceyreklikData,
                                            borderColor: '#10b981', // yeşil
                                            backgroundColor: 'transparent',
                                            borderWidth: 2,
                                            pointRadius: 4,
                                            pointBackgroundColor: '#10b981',
                                            tension: 0.3
                                        },
                                        {
                                            label: 'Yıllıklandırılmış',
                                            data: yillikData,
                                            borderColor: '#3b82f6', // mavi
                                            backgroundColor: 'transparent',
                                            borderWidth: 2,
                                            pointRadius: 4,
                                            pointBackgroundColor: '#3b82f6',
                                            tension: 0.3
                                        }
                                    ]
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: { size: 10, color: '#aaa' } } },
                                        tooltip: {
                                            callbacks: {
                                                label: (ctx) => '%' + (ctx.parsed.y || 0).toFixed(1)
                                            }
                                        },
                                        datalabels: {
                                            color: '#fff',
                                            align: 'top',
                                            formatter: (value) => '%' + (value || 0).toFixed(1),
                                            font: { size: 10, weight: 'bold' }
                                        }
                                    },
                                    scales: {
                                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888', callback: v => '%' + v } },
                                        x: { grid: { display: false }, ticks: { color: '#888', maxRotation: 45, minRotation: 45, font: { size: 10 } } }
                                    }
                                }
                            });
                        };

                        createMarjChart('chart-bkm', dData.bkm, dData.ybkm);
                        createMarjChart('chart-fkm', dData.fkm, dData.yfkm);
                        createMarjChart('chart-nkm', dData.nkm, dData.ynkm);
                        createChart('chart-cari', dData.cari, 'Cari Oran');
                        createChart('chart-kaldirac', dData.kaldirac, 'Kaldıraç Oranı (%)');
                        createChart('chart-roe', dData.roe, 'Özkaynak Karlılığı (%)');
                    }

                    const lineOpts = {
                        ...cOpts,
                        plugins: {
                            ...cOpts.plugins,
                            legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: { size: 10, color: '#aaa' } } },
                            tooltip: {
                                ...cOpts.plugins.tooltip,
                                callbacks: {
                                    ...cOpts.plugins.tooltip.callbacks,
                                    label: function (context) {
                                        if (context.parsed.y !== null) {
                                            return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(context.parsed.y);
                                        }
                                        return '';
                                    }
                                }
                            }
                        },
                        scales: {
                            x: { ticks: { font: { size: 10 }, color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255, 255, 255, 0.03)' } },
                            y: {
                                ticks: {
                                    font: { size: 10 }, color: 'rgba(255,255,255,0.5)',
                                    callback: function (value) {
                                        if (Math.abs(value) >= 1e9) return (value / 1e9).toFixed(1) + 'Mlyr';
                                        if (Math.abs(value) >= 1e6) return (value / 1e6).toFixed(1) + 'Mn';
                                        return value;
                                    }
                                },
                                grid: { color: 'rgba(255, 255, 255, 0.03)' }
                            }
                        }
                    };

                    const bgColors = labels.map(l => {
                        if (l.includes('/3') || l.includes('/03') || l.includes('-3')) return 'rgba(255, 99, 132, 0.8)'; // Kırmızı
                        if (l.includes('/6') || l.includes('/06') || l.includes('-6')) return 'rgba(75, 192, 192, 0.8)'; // Yeşil
                        if (l.includes('/9') || l.includes('/09') || l.includes('-9')) return 'rgba(54, 162, 235, 0.8)'; // Mavi
                        if (l.includes('/12') || l.includes('-12')) return 'rgba(255, 206, 86, 0.8)'; // Sarı
                        return 'rgba(77, 166, 255, 0.8)';
                    });
                    const borderColors = labels.map(l => {
                        if (l.includes('/3') || l.includes('/03') || l.includes('-3')) return 'rgb(255, 99, 132)';
                        if (l.includes('/6') || l.includes('/06') || l.includes('-6')) return 'rgb(75, 192, 192)';
                        if (l.includes('/9') || l.includes('/09') || l.includes('-9')) return 'rgb(54, 162, 235)';
                        if (l.includes('/12') || l.includes('-12')) return 'rgb(255, 206, 86)';
                        return 'rgb(77, 166, 255)';
                    });

                    const barOpts = {
                        ...lineOpts,
                        plugins: {
                            ...lineOpts.plugins,
                            legend: { display: false }
                        }
                    };

                    const ctxSatislarYillik = document.getElementById('chart-yillik-satislar');
                    if (ctxSatislarYillik) {
                        let ex = Chart.getChart(ctxSatislarYillik); if (ex) ex.destroy();
                        new Chart(ctxSatislarYillik, {
                            type: 'bar',
                            data: {
                                labels: labels,
                                datasets: [{
                                    data: dData.ySatislar,
                                    backgroundColor: bgColors,
                                    borderColor: borderColors,
                                    borderWidth: 1,
                                    borderRadius: 4
                                }]
                            },
                            options: barOpts
                        });
                    }

                    const ctxSatislarCeyreklik = document.getElementById('chart-ceyreklik-satislar');
                    if (ctxSatislarCeyreklik) {
                        let ex = Chart.getChart(ctxSatislarCeyreklik); if (ex) ex.destroy();
                        new Chart(ctxSatislarCeyreklik, {
                            type: 'bar',
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: 'Satışlar',
                                    data: dData.satislar,
                                    backgroundColor: bgColors,
                                    borderColor: borderColors,
                                    borderWidth: 1
                                }]
                            },
                            options: barOpts
                        });
                    }

                    const ctxSatislarDonemsel = document.getElementById('chart-donemsel-satislar');
                    if (ctxSatislarDonemsel) {
                        let ex = Chart.getChart(ctxSatislarDonemsel); if (ex) ex.destroy();
                        new Chart(ctxSatislarDonemsel, {
                            type: 'bar',
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: 'Dönemsel Satışlar',
                                    data: dData.dSatislar,
                                    backgroundColor: bgColors,
                                    borderColor: borderColors,
                                    borderWidth: 1
                                }]
                            },
                            options: barOpts
                        });
                    }

                    const ctxCombined = document.getElementById('chart-combined-satislar');
                    if (ctxCombined) {
                        let ex = Chart.getChart(ctxCombined); if (ex) ex.destroy();
                        new Chart(ctxCombined, {
                            type: 'bar',
                            data: {
                                labels: labels,
                                datasets: [
                                    {
                                        label: 'Çeyreklik',
                                        data: dData.satislar,
                                        backgroundColor: bgColors,
                                        borderColor: borderColors,
                                        borderWidth: 1,
                                        borderRadius: 2
                                    },
                                    {
                                        label: 'Dönemsel',
                                        data: dData.dSatislar,
                                        backgroundColor: bgColors,
                                        borderColor: borderColors,
                                        borderWidth: 1,
                                        borderRadius: 2
                                    },
                                    {
                                        label: 'Yıllıklandırılmış',
                                        data: dData.ySatislar,
                                        backgroundColor: bgColors,
                                        borderColor: borderColors,
                                        borderWidth: 1,
                                        borderRadius: 2
                                    }
                                ]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        mode: 'index',
                                        intersect: false,
                                        callbacks: {
                                            label: function (c) {
                                                let v = c.raw;
                                                return c.dataset.label + ': ' + (v ? new Intl.NumberFormat('tr-TR').format(v) : '-');
                                            }
                                        }
                                    },
                                    datalabels: { display: false }
                                },
                                scales: {
                                    x: {
                                        ticks: { color: '#ccc', font: { size: 10 } },
                                        grid: { color: 'rgba(255,255,255,0.05)' }
                                    },
                                    y: {
                                        ticks: { color: '#ccc', font: { size: 10 } },
                                        grid: { color: 'rgba(255,255,255,0.05)' }
                                    }
                                }
                            }
                        });
                    }

                    const ctxBrutCeyreklik = document.getElementById('chart-ceyreklik-brut');
                    if (ctxBrutCeyreklik) {
                        let ex = Chart.getChart(ctxBrutCeyreklik); if (ex) ex.destroy();
                        new Chart(ctxBrutCeyreklik, {
                            type: 'bar',
                            data: { labels: labels, datasets: [{ data: dData.brutkar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] },
                            options: barOpts
                        });
                    }

                    const ctxBrutDonemsel = document.getElementById('chart-donemsel-brut');
                    if (ctxBrutDonemsel) {
                        let ex = Chart.getChart(ctxBrutDonemsel); if (ex) ex.destroy();
                        new Chart(ctxBrutDonemsel, {
                            type: 'bar',
                            data: { labels: labels, datasets: [{ data: dData.dBrutkar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] },
                            options: barOpts
                        });
                    }

                    const ctxBrutYillik = document.getElementById('chart-yillik-brut');
                    if (ctxBrutYillik) {
                        let ex = Chart.getChart(ctxBrutYillik); if (ex) ex.destroy();
                        new Chart(ctxBrutYillik, {
                            type: 'bar',
                            data: { labels: labels, datasets: [{ data: dData.yBrutkar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] },
                            options: barOpts
                        });
                    }

                    const ctxBrutCombined = document.getElementById('chart-combined-brut');
                    if (ctxBrutCombined) {
                        let ex = Chart.getChart(ctxBrutCombined); if (ex) ex.destroy();
                        new Chart(ctxBrutCombined, {
                            type: 'bar',
                            data: {
                                labels: labels,
                                datasets: [
                                    { label: 'Çeyreklik', data: dData.brutkar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 },
                                    { label: 'Dönemsel', data: dData.dBrutkar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 },
                                    { label: 'Yıllıklandırılmış', data: dData.yBrutkar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }
                                ]
                            },
                            options: {
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, callbacks: { label: function (c) { let v = c.raw; return c.dataset.label + ': ' + (v ? new Intl.NumberFormat('tr-TR').format(v) : '-'); } } }, datalabels: { display: false } },
                                scales: { x: { ticks: { color: '#ccc', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#ccc', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } } }
                            }
                        });
                    }
                    // --- Faaliyet Karı ---
                    const ctxFaaliyetCeyreklik = document.getElementById('chart-ceyreklik-faaliyet');
                    if (ctxFaaliyetCeyreklik) { let ex = Chart.getChart(ctxFaaliyetCeyreklik); if (ex) ex.destroy(); new Chart(ctxFaaliyetCeyreklik, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.faaliyet, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }
                    const ctxFaaliyetDonemsel = document.getElementById('chart-donemsel-faaliyet');
                    if (ctxFaaliyetDonemsel) { let ex = Chart.getChart(ctxFaaliyetDonemsel); if (ex) ex.destroy(); new Chart(ctxFaaliyetDonemsel, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.dFaaliyet, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }
                    const ctxFaaliyetYillik = document.getElementById('chart-yillik-faaliyet');
                    if (ctxFaaliyetYillik) { let ex = Chart.getChart(ctxFaaliyetYillik); if (ex) ex.destroy(); new Chart(ctxFaaliyetYillik, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.yFaaliyet, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }
                    const ctxFaaliyetCombined = document.getElementById('chart-combined-faaliyet');
                    if (ctxFaaliyetCombined) { let ex = Chart.getChart(ctxFaaliyetCombined); if (ex) ex.destroy(); new Chart(ctxFaaliyetCombined, { type: 'bar', data: { labels: labels, datasets: [{ label: 'Çeyreklik', data: dData.faaliyet, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }, { label: 'Dönemsel', data: dData.dFaaliyet, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }, { label: 'Yıllıklandırılmış', data: dData.yFaaliyet, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, callbacks: { label: function (c) { let v = c.raw; return c.dataset.label + ': ' + (v ? new Intl.NumberFormat('tr-TR').format(v) : '-'); } } }, datalabels: { display: false } }, scales: { x: { ticks: { color: '#ccc', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#ccc', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } } } } }); }

                    // --- FAVÖK ---
                    const ctxFavokCeyreklik2 = document.getElementById('chart-ceyreklik-favok2');
                    if (ctxFavokCeyreklik2) { let ex = Chart.getChart(ctxFavokCeyreklik2); if (ex) ex.destroy(); new Chart(ctxFavokCeyreklik2, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.favok, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }
                    const ctxFavokDonemsel = document.getElementById('chart-donemsel-favok');
                    if (ctxFavokDonemsel) { let ex = Chart.getChart(ctxFavokDonemsel); if (ex) ex.destroy(); new Chart(ctxFavokDonemsel, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.dFavok, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }
                    const ctxFavokYillik = document.getElementById('chart-yillik-favok');
                    if (ctxFavokYillik) { let ex = Chart.getChart(ctxFavokYillik); if (ex) ex.destroy(); new Chart(ctxFavokYillik, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.yFavok, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }
                    const ctxFavokCombined = document.getElementById('chart-combined-favok');
                    if (ctxFavokCombined) { let ex = Chart.getChart(ctxFavokCombined); if (ex) ex.destroy(); new Chart(ctxFavokCombined, { type: 'bar', data: { labels: labels, datasets: [{ label: 'Çeyreklik', data: dData.favok, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }, { label: 'Dönemsel', data: dData.dFavok, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }, { label: 'Yıllıklandırılmış', data: dData.yFavok, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, callbacks: { label: function (c) { let v = c.raw; return c.dataset.label + ': ' + (v ? new Intl.NumberFormat('tr-TR').format(v) : '-'); } } }, datalabels: { display: false } }, scales: { x: { ticks: { color: '#ccc', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#ccc', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } } } } }); }

                    // --- Net Kar ---
                    const ctxNetKarCeyreklik2 = document.getElementById('chart-ceyreklik-netkar2');
                    if (ctxNetKarCeyreklik2) { let ex = Chart.getChart(ctxNetKarCeyreklik2); if (ex) ex.destroy(); new Chart(ctxNetKarCeyreklik2, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.netkar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }
                    const ctxNetKarDonemsel = document.getElementById('chart-donemsel-netkar');
                    if (ctxNetKarDonemsel) { let ex = Chart.getChart(ctxNetKarDonemsel); if (ex) ex.destroy(); new Chart(ctxNetKarDonemsel, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.dNetKar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }
                    const ctxNetKarYillik = document.getElementById('chart-yillik-netkar');
                    if (ctxNetKarYillik) { let ex = Chart.getChart(ctxNetKarYillik); if (ex) ex.destroy(); new Chart(ctxNetKarYillik, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.yNetKar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }
                    const ctxNetKarCombined = document.getElementById('chart-combined-netkar');
                    if (ctxNetKarCombined) { let ex = Chart.getChart(ctxNetKarCombined); if (ex) ex.destroy(); new Chart(ctxNetKarCombined, { type: 'bar', data: { labels: labels, datasets: [{ label: 'Çeyreklik', data: dData.netkar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }, { label: 'Dönemsel', data: dData.dNetKar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }, { label: 'Yıllıklandırılmış', data: dData.yNetKar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, callbacks: { label: function (c) { let v = c.raw; return c.dataset.label + ': ' + (v ? new Intl.NumberFormat('tr-TR').format(v) : '-'); } } }, datalabels: { display: false } }, scales: { x: { ticks: { color: '#ccc', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#ccc', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } } } } }); }


                    // Clear the temporary data
                    window.dashboardChartData = null;

                }, 300);
            }
        };

        window.handleIsYatirimUpdate = async (hisse) => {
            if (!hisse) return;
            const btn = document.getElementById('btn-isyatirim-update');
            const originalHtml = btn ? btn.innerHTML : '';
            if (btn) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:4px;"></i>Güncelleniyor...';
                btn.disabled = true;
            }

            try {
                if (typeof window.fetchIsYatirimData === 'function') {
                    await window.fetchIsYatirimData(hisse);
                } else {
                    alert('Güncelleme modülü bulunamadı.');
                }
            } catch (e) {
                console.error(e);
                alert('Güncelleme sırasında hata oluştu.');
            } finally {
                if (btn) {
                    btn.innerHTML = originalHtml;
                    btn.disabled = false;
                }
            }
        };

    };

    window.setHisseTab = (tab) => {
        activeTab = tab;
        window.currentHisseTab = tab;
        renderUI();
    };

    renderUI();
};


window.toggleHisseSort = (col) => {
    if (!window.hisseSort) window.hisseSort = { col: null, asc: true };
    if (window.hisseSort.col === col) {
        window.hisseSort.asc = !window.hisseSort.asc;
    } else {
        window.hisseSort = { col: col, asc: true };
    }
    if (typeof renderPage === 'function') renderPage();
};

const getHisseSortIcon = (col) => {
    if (window.hisseSort && window.hisseSort.col === col) {
        return window.hisseSort.asc ? ' <i class="fas fa-sort-up"></i>' : ' <i class="fas fa-sort-down"></i>';
    }
    return ' <i class="fas fa-sort" style="color: rgba(255,255,255,0.3);"></i>';
};

window.toggleHisseTableCollapse = () => {
    window.hisseTableCollapsed = !window.hisseTableCollapsed;
    if (typeof renderPage === 'function') renderPage();
};

window.toggleArsivSort = (col) => {
    if (!window.arsivSort) window.arsivSort = { col: null, asc: true };
    if (window.arsivSort.col === col) {
        window.arsivSort.asc = !window.arsivSort.asc;
    } else {
        window.arsivSort = { col: col, asc: true };
    }
    if (typeof renderPage === 'function') renderPage();

};

const getArsivSortIcon = (col) => {
    if (window.arsivSort && window.arsivSort.col === col) {
        return window.arsivSort.asc ? ' <i class="fas fa-sort-up"></i>' : ' <i class="fas fa-sort-down"></i>';
    }
    return ' <i class="fas fa-sort" style="color: rgba(255,255,255,0.3);"></i>';
};

window.toggleVarliklarSort = (col) => {
    if (!window.varliklarSort) window.varliklarSort = { col: null, asc: true };
    if (window.varliklarSort.col === col) {
        window.varliklarSort.asc = !window.varliklarSort.asc;
    } else {
        window.varliklarSort = { col: col, asc: true };
    }
    if (typeof renderPage === 'function') renderPage();

};

const getVarliklarSortIcon = (col) => {
    if (window.varliklarSort && window.varliklarSort.col === col) {
        return window.varliklarSort.asc ? ' <i class="fas fa-sort-up"></i>' : ' <i class="fas fa-sort-down"></i>';
    }
    return ' <i class="fas fa-sort" style="color: rgba(255,255,255,0.3);"></i>';
};

window.toggleNakitSort = (col) => {
    if (!window.nakitSort) window.nakitSort = { col: null, asc: true };
    if (window.nakitSort.col === col) {
        window.nakitSort.asc = !window.nakitSort.asc;
    } else {
        window.nakitSort = { col: col, asc: true };
    }
    if (typeof renderPage === 'function') renderPage();
};

const getNakitSortIcon = (col) => {
    if (window.nakitSort && window.nakitSort.col === col) {
        return window.nakitSort.asc ? ' <i class="fas fa-sort-up"></i>' : ' <i class="fas fa-sort-down"></i>';
    }
    return ' <i class="fas fa-sort" style="color: rgba(255,255,255,0.3);"></i>';
};

window.toggleNakitTableCollapse = () => {
    window.nakitTableCollapsed = !window.nakitTableCollapsed;
    if (typeof renderPage === 'function') renderPage();
};

window.toggleHisseGroup = (menkul) => {
    window.hisseGroupCollapsed = window.hisseGroupCollapsed || {};
    if (window.hisseGroupCollapsed[menkul] === undefined) {
        window.hisseGroupCollapsed[menkul] = false;
    } else {
        window.hisseGroupCollapsed[menkul] = !window.hisseGroupCollapsed[menkul];
    }
    if (typeof renderPage === 'function') renderPage();
};

const renderHisseIslemleri = (container) => {
    window.currentEditId = window.currentEditId || null;
    window.hisseSort = window.hisseSort || { col: null, asc: true };
    if (window.hisseTableCollapsed === undefined) window.hisseTableCollapsed = true;

    const hisseFonEkstre = [...State.data.ekstre].filter(e => e.menkul !== 'NAKİT');

    hisseFonEkstre.sort((a, b) => {
        if (window.hisseSort.col === 'tarih') {
            const dateA = new Date(a.tarih);
            const dateB = new Date(b.tarih);
            return window.hisseSort.asc ? dateA - dateB : dateB - dateA;
        } else if (window.hisseSort.col === 'tutar') {
            const tutarA = a.fiyat * Math.abs(a.adet);
            const tutarB = b.fiyat * Math.abs(b.adet);
            return window.hisseSort.asc ? tutarA - tutarB : tutarB - tutarA;
        } else if (window.hisseSort.col === 'tur') {
            const turA = a.menkul.length === 3 ? 'Fon' : 'Hisse';
            const turB = b.menkul.length === 3 ? 'Fon' : 'Hisse';
            if (turA !== turB) return window.hisseSort.asc ? turA.localeCompare(turB) : turB.localeCompare(turA);
            return new Date(b.tarih) - new Date(a.tarih);
        } else if (window.hisseSort.col === 'menkul') {
            if (a.menkul !== b.menkul) return window.hisseSort.asc ? a.menkul.localeCompare(b.menkul) : b.menkul.localeCompare(a.menkul);
            return new Date(b.tarih) - new Date(a.tarih);
        } else {
            if (a.menkul !== b.menkul) return a.menkul.localeCompare(b.menkul);
            return new Date(b.tarih) - new Date(a.tarih);
        }
    });

    window.hisseGroupCollapsed = window.hisseGroupCollapsed || {};

    const groupedItems = [];
    const groupMap = {};

    hisseFonEkstre.forEach(e => {
        if (!groupMap[e.menkul]) {
            groupMap[e.menkul] = [];
            groupedItems.push({ menkul: e.menkul, rows: groupMap[e.menkul] });
        }
        groupMap[e.menkul].push(e);
    });

    let rowIndex = 1;
    let ekstreRowsHtml = '';

    groupedItems.forEach(g => {
        const isCollapsed = window.hisseGroupCollapsed[g.menkul] !== false;
        const iconClass = isCollapsed ? 'fa-chevron-right' : 'fa-chevron-down';

        ekstreRowsHtml += `<tr class="group-header-row" style="background: rgba(255,255,255,0.05); font-weight: bold; cursor: pointer;" onclick="window.toggleHisseGroup('${g.menkul}')">
            <td colspan="8" style="text-align: left !important; color: var(--accent-color); padding-left: 1rem !important;">
                <i class="fas ${iconClass}" style="margin-right: 8px; width: 12px; display: inline-block; text-align: center;"></i>${g.menkul}
            </td>
        </tr>`;

        if (!isCollapsed) {
            g.rows.forEach(e => {
                const isFon = e.menkul.length === 3;
                const tur = isFon ? 'Fon' : 'Hisse';

                if (e.id === window.currentEditId) {
                    ekstreRowsHtml += `<tr style="background: rgba(0,0,0,0.4);">
                        <td>${rowIndex++}</td>
                        <td>
                            <select id="edit-tur" class="form-control" style="width:100%; font-size:12px; padding:2px;" onchange="window.updateEditDatalist()">
                                <option value="Hisse" ${!isFon ? 'selected' : ''}>Hisse</option>
                                <option value="Fon" ${isFon ? 'selected' : ''}>Fon</option>
                            </select>
                        </td>
                        <td><input type="text" id="edit-menkul" class="form-control" style="width:100%; font-size:12px; padding:2px;" value="${e.menkul}" list="${isFon ? 'fon-list' : 'bist-hisse-list'}"></td>
                        <td><input type="date" id="edit-tarih" class="form-control" style="width:100%; font-size:12px; padding:2px; text-align:right;" value="${e.tarih}"></td>
                        <td><input type="number" step="0.000001" id="edit-fiyat" class="form-control" style="width:100%; font-size:12px; padding:2px;" value="${e.fiyat}"></td>
                        <td><input type="number" step="0.0001" id="edit-adet" class="form-control" style="width:100%; font-size:12px; padding:2px;" value="${e.adet}"></td>
                        <td><input type="text" id="edit-tutar" class="form-control" style="width:100%; font-size:12px; padding:2px;" value="${formatCurrency(e.fiyat * Math.abs(e.adet), 0)}" disabled></td>
                        <td>
                            <button class="btn" style="padding: 0.1rem 0.3rem; font-size: 12px; background: var(--accent-color);" onclick="window.saveEditEkstre('${e.id}')">Kaydet</button>
                            <button class="btn" style="padding: 0.1rem 0.3rem; font-size: 12px; background: var(--input-bg);" onclick="window.cancelEdit()">İptal</button>
                        </td>
                    </tr>`;
                } else {
                    ekstreRowsHtml += `<tr>
                        <td>${rowIndex++}</td>
                        <td style="font-weight:600; color: var(--text-primary); text-align:left;">${tur}</td>
                        <td style="font-weight:600; color: var(--text-primary); text-align:left;">${e.menkul}</td>
                        <td style="text-align: right;">${formatDate(e.tarih)}</td>
                        <td>${formatCurrency(e.fiyat)}</td>
                        <td class="${e.adet >= 0 ? 'text-success' : 'text-danger'}">${e.adet.toLocaleString('tr-TR')}</td>
                        <td>${formatCurrency(e.fiyat * Math.abs(e.adet), 0)}</td>
                        <td>
                            <button class="btn" style="padding: 2px 4px; font-size: 12px; background: #000000; color: var(--accent-color); border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; border: none;" onclick="window.setEditEkstre('${e.id}')" title="Düzenle"><i class="fas fa-edit" style="color: var(--accent-color) !important;"></i></button>
                            <button class="btn" style="padding: 2px 4px; font-size: 12px; background: transparent; color: #888888; border: none;" onclick="window.deleteEkstre('${e.id}')" title="Sil"><i class="fas fa-trash-alt"></i></button>
                        </td>
                    </tr>`;
                }
            });
        }
    });

    const ekstreRows = ekstreRowsHtml;

    const todayStr = new Date().toISOString().split('T')[0];

    const fonSet = new Set();
    State.data.ekstre.forEach(e => {
        if (e.menkul !== 'NAKIT' && e.menkul.length === 3) fonSet.add(e.menkul);
    });
    let fonDatalistOptions = '';
    fonSet.forEach(fon => {
        fonDatalistOptions += `<option value="${fon}">`;
    });

    window.ekstreTab = window.ekstreTab || 'hisse';
    window.setEkstreTab = window.setEkstreTab || ((tab) => {
        window.ekstreTab = tab;
        if (typeof renderPage === 'function') renderPage();
    });
    const getTabBg = (tab) => window.ekstreTab === tab ? 'rgba(255,255,255,0.1)' : 'transparent';
    const getTabColor = (tab) => window.ekstreTab === tab ? '#ffffff' : 'var(--text-secondary)';

    container.innerHTML = `
        <style>
            .ekstre-table th, .ekstre-table td {
                font-size: 12px !important;
                font-weight: normal !important;
            }
            .ekstre-table thead, .ekstre-table thead tr, .ekstre-table thead th {
                position: sticky;
                top: 0;
                z-index: 10;
                background: var(--table-header-bg) !important;
            }
        </style>
        <datalist id="fon-list">${fonDatalistOptions}</datalist>
        <div class="page-section active" style="display: flex; flex-direction: column; padding: 0px; gap: 0;">
            <div class="glass" style="display: flex; flex-direction: column; padding: 0.5rem 1rem; width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--surface-border); padding-bottom: 0px; margin-bottom: 8px;">
                    <div style="display: flex; gap: 0.5rem; align-items: center; overflow-x: auto; white-space: nowrap;">
                        <span style="cursor: pointer; font-size: 12px !important; font-weight: normal; padding: 4px 8px; border-radius: 4px; background: ${getTabBg('hisse')}; color: ${getTabColor('hisse')};" onclick="window.setEkstreTab('hisse')">Hisse ve Fon İşlemleri</span>
                        <span style="cursor: pointer; font-size: 12px !important; font-weight: normal; padding: 4px 8px; border-radius: 4px; background: ${getTabBg('nakit')}; color: ${getTabColor('nakit')};" onclick="window.setEkstreTab('nakit')">Nakit İşlemleri</span>
                    </div>
                    <button class="btn" style="padding: 0 0.5rem; display: flex; align-items: center; justify-content: center; background: transparent; color: #888888; border: none; box-shadow: none;" onclick="window.toggleInlineForm(window.ekstreTab)"><i class="fas fa-plus" style="font-size: 15px;"></i></button>
                </div>
                <div id="ekstreler-tables-wrapper" style="display: flex; flex-direction: column; width: 100%;">
                    <div class="page-section ${window.ekstreTab === 'hisse' ? 'active' : ''}" style="${window.ekstreTab === 'hisse' ? '' : 'display: none !important;'} margin-top: 0;">
                        <div class="table-container" style="overflow-x: auto; padding: 0;">
                
                <table class="dash-table compact-table ekstre-table" style="table-layout: fixed; width: 100%;">
                    <thead>
                        <tr><th style="width: 5%; cursor: pointer; user-select: none;" onclick="window.toggleHisseTableCollapse()"><i class="fas ${window.hisseTableCollapsed ? 'fa-chevron-right' : 'fa-chevron-down'}" style="margin-right: 4px;"></i>S.N.</th><th style="width: 8%; text-align: left; cursor: pointer; user-select: none;" onclick="window.toggleHisseSort('tur')">Tür${getHisseSortIcon('tur')}</th><th style="width: 12%; text-align: left; cursor: pointer; user-select: none;" onclick="window.toggleHisseSort('menkul')">Menkul${getHisseSortIcon('menkul')}</th><th style="width: 15%; text-align: right; cursor: pointer; user-select: none;" onclick="window.toggleHisseSort('tarih')">Tarih${getHisseSortIcon('tarih')}</th><th style="width: 14%;">Fiyat</th><th style="width: 15%;">Adet</th><th style="width: 13%; cursor: pointer; user-select: none;" onclick="window.toggleHisseSort('tutar')">Tutar${getHisseSortIcon('tutar')}</th><th style="width: 18%;">İşlem</th></tr>
                    </thead>
                    <tbody id="hisse-ekle-section" style="display: none;">
                        <tr style="background: rgba(0,0,0,0.4);">
                            <td style="text-align: center;">-</td>
                            <td>
                                <select id="i-tur" class="form-control" style="width:100%; font-size:12px; padding:4px;" onchange="window.updateInlineDatalist()">
                                    <option value="Hisse" selected>Hisse</option>
                                    <option value="Fon">Fon</option>
                                </select>
                            </td>
                            <td><input type="text" id="i-menkul" class="form-control" style="width:100%; font-size:12px; padding:4px;" placeholder="Hisse Adı" list="bist-hisse-list" autocomplete="off" onkeydown="if(event.key==='Enter') window.saveInlineHisse()"></td>
                            <td><input type="date" id="i-tarih" class="form-control" style="width:100%; font-size:12px; padding:4px; text-align:right;" value="${todayStr}" onkeydown="if(event.key==='Enter') window.saveInlineHisse()"></td>
                            <td><input type="number" step="0.000001" id="i-fiyat" class="form-control" style="width:100%; font-size:12px; padding:4px;" placeholder="Fiyat" onkeydown="if(event.key==='Enter') window.saveInlineHisse()"></td>
                            <td><input type="number" step="0.0001" id="i-adet" class="form-control" style="width:100%; font-size:12px; padding:4px;" placeholder="Adet" onkeydown="if(event.key==='Enter') window.saveInlineHisse()"></td>
                            <td><input type="text" id="i-tutar" class="form-control" style="width:100%; font-size:12px; padding:4px;" placeholder="Tutar" disabled></td>
                            <td>
                                <button class="btn" id="i-submit-btn" style="padding: 2px 4px; font-size: 14px; background: #000000; color: var(--accent-color); border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; border: none;" onclick="window.saveInlineHisse()" title="Ekle"><i class="fas fa-check" style="color: var(--accent-color) !important; font-size: 14px;"></i></button>
                                <button class="btn" style="padding: 2px 4px; font-size: 14px; background: #000000; color: var(--danger-color); border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; border: none;" onclick="window.toggleInlineForm('hisse')" title="İptal"><i class="fas fa-times" style="color: var(--danger-color) !important; font-size: 14px;"></i></button>
                            </td>
                        </tr>
                    </tbody>
                    <tbody id="hisse-tbody" style="${window.hisseTableCollapsed ? 'display: none;' : ''}">
                        ${ekstreRows}
                    </tbody>
                </table>
                </div>
            </div>
            </div>
            </div>
        </div>
    `;

    // listeners
    window.updateInlineDatalist = () => {
        const tur = document.getElementById('i-tur').value;
        const menkulInput = document.getElementById('i-menkul');
        menkulInput.value = ''; // clear when switching
        if (tur === 'Fon') {
            menkulInput.setAttribute('list', 'fon-list');
            menkulInput.placeholder = 'Fon (3 Harf)';
            menkulInput.setAttribute('maxlength', '3');
        } else {
            menkulInput.setAttribute('list', 'bist-hisse-list');
            menkulInput.placeholder = 'Hisse Adı';
            menkulInput.removeAttribute('maxlength');
        }
    };

    window.updateEditDatalist = () => {
        const tur = document.getElementById('edit-tur').value;
        const menkulInput = document.getElementById('edit-menkul');
        if (tur === 'Fon') {
            menkulInput.setAttribute('list', 'fon-list');
            menkulInput.setAttribute('maxlength', '3');
        } else {
            menkulInput.setAttribute('list', 'bist-hisse-list');
            menkulInput.removeAttribute('maxlength');
        }
    };

    const calcTutar = (fiyatId, adetId, tutarId) => {
        const f = parseFloat(document.getElementById(fiyatId)?.value) || 0;
        const a = parseFloat(document.getElementById(adetId)?.value) || 0;
        const target = document.getElementById(tutarId);
        if (target) target.value = formatCurrency(f * Math.abs(a), 0);
    };

    document.getElementById('i-fiyat')?.addEventListener('input', () => calcTutar('i-fiyat', 'i-adet', 'i-tutar'));
    document.getElementById('i-adet')?.addEventListener('input', () => calcTutar('i-fiyat', 'i-adet', 'i-tutar'));

    if (document.getElementById('edit-fiyat')) {
        document.getElementById('edit-fiyat').addEventListener('input', () => calcTutar('edit-fiyat', 'edit-adet', 'edit-tutar'));
        document.getElementById('edit-adet').addEventListener('input', () => calcTutar('edit-fiyat', 'edit-adet', 'edit-tutar'));
    }

    window.toggleInlineForm = (type) => {
        const section = document.getElementById(`${type}-ekle-section`);
        if (section) section.style.display = section.style.display === 'none' ? '' : 'none';

        if (type === 'nakit' && typeof window.cancelNakitEdit === 'function') window.cancelNakitEdit();
        else if (typeof window.cancelEdit === 'function') window.cancelEdit();

        // focus the first input if opening
        if (section && section.style.display === '') {
            const firstInput = section.querySelector('input, select');
            if (firstInput) firstInput.focus();
        }
    };

    window.deleteEkstre = (id) => {
        if (confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
            State.deleteEkstre(id);
            if (typeof renderPage === 'function') renderPage();
        }
    };

    window.setEditEkstre = (id) => {
        window.currentEditId = id;
        if (typeof renderPage === 'function') renderPage();
    };
    window.cancelEdit = () => {
        if (window.currentEditId) {
            window.currentEditId = null;
            if (typeof renderPage === 'function') renderPage();
        }
    };

    window.saveEditEkstre = (id) => {
        const menkul = document.getElementById('edit-menkul').value.trim().toUpperCase();
        if (!menkul) return;
        const islem = {
            tarih: document.getElementById('edit-tarih').value,
            islemTip: parseFloat(document.getElementById('edit-adet').value) < 0 ? 'SATIŞ' : 'ALIŞ',
            menkul: menkul,
            fiyat: document.getElementById('edit-fiyat').value,
            adet: document.getElementById('edit-adet').value
        };
        State.updateEkstre(id, islem);
        window.currentEditId = null;
        if (typeof renderPage === 'function') renderPage();
    };

    window.saveInlineHisse = () => {
        const menkul = document.getElementById('i-menkul').value.trim().toUpperCase();
        if (!menkul) return;
        const islem = {
            tarih: document.getElementById('i-tarih').value,
            islemTip: parseFloat(document.getElementById('i-adet').value) < 0 ? 'SATIŞ' : 'ALIŞ',
            menkul: menkul,
            fiyat: document.getElementById('i-fiyat').value,
            adet: document.getElementById('i-adet').value
        };
        State.addEkstre(islem);
        if (typeof renderPage === 'function') renderPage();
    };

    renderNakitIslemleri(container, true);
};

const renderNakitIslemleri = (container, append = false) => {
    window.currentNakitEditId = window.currentNakitEditId || null;
    window.nakitSort = window.nakitSort || { col: null, asc: true };
    if (window.nakitTableCollapsed === undefined) window.nakitTableCollapsed = true;
    const nakitHareketleriList = [...(State.data.nakitHareketleri || [])].sort((a, b) => {
        if (!window.nakitSort.col) return new Date(b.tarih) - new Date(a.tarih);

        let valA, valB;
        if (window.nakitSort.col === 'tarih') {
            valA = new Date(a.tarih).getTime(); valB = new Date(b.tarih).getTime();
        } else if (window.nakitSort.col === 'tutar') {
            valA = a.tutar; valB = b.tutar;
        } else if (window.nakitSort.col === 'bist100') {
            valA = a.bist100 || 0; valB = b.bist100 || 0;
        } else if (window.nakitSort.col === 'dolar') {
            valA = a.dolar || 0; valB = b.dolar || 0;
        } else if (window.nakitSort.col === 'gramAltin') {
            valA = a.gramAltin || 0; valB = b.gramAltin || 0;
        } else if (window.nakitSort.col === 'pry') {
            valA = a.pry || 0; valB = b.pry || 0;
        }
        return window.nakitSort.asc ? valA - valB : valB - valA;
    });

    const nakitRows = nakitHareketleriList.map((n, i) => {
        if (n.id === window.currentNakitEditId) {
            return `<tr style="background: rgba(0,0,0,0.4);">
                <td>${i + 1}</td>
                <td><input type="date" id="edit-n-tarih" class="form-control" style="width:100%; font-size:12px; padding:2px; text-align:right;" value="${n.tarih}" onkeydown="if(event.key==='Enter') window.saveEditNakit('${n.id}')"></td>
                <td><input type="number" step="0.01" id="edit-n-tutar" class="form-control" style="width:100%; font-size:12px; padding:2px;" value="${n.tutar}" onkeydown="if(event.key==='Enter') window.saveEditNakit('${n.id}')"></td>
                <td><input type="number" step="0.01" id="edit-n-bist" class="form-control" style="width:100%; font-size:12px; padding:2px;" value="${n.bist100 || ''}" onkeydown="if(event.key==='Enter') window.saveEditNakit('${n.id}')"></td>
                <td><input type="number" step="0.01" id="edit-n-dolar" class="form-control" style="width:100%; font-size:12px; padding:2px;" value="${n.dolar || ''}" onkeydown="if(event.key==='Enter') window.saveEditNakit('${n.id}')"></td>
                <td><input type="number" step="0.01" id="edit-n-altin" class="form-control" style="width:100%; font-size:12px; padding:2px;" value="${n.gramAltin || ''}" onkeydown="if(event.key==='Enter') window.saveEditNakit('${n.id}')"></td>
                <td><input type="text" inputmode="decimal" id="edit-n-pry" class="form-control" style="width:100%; font-size:12px; padding:2px;" value="${n.pry || ''}" onkeydown="if(event.key==='Enter') window.saveEditNakit('${n.id}')"></td>
                <td>
                    <button class="btn" style="padding: 0.1rem 0.3rem; font-size: 12px; background: var(--accent-color);" onclick="window.saveEditNakit('${n.id}')">Kaydet</button>
                    <button class="btn" style="padding: 0.1rem 0.3rem; font-size: 12px; background: var(--input-bg);" onclick="window.cancelNakitEdit()">İptal</button>
                </td>
            </tr>`;
        }
        return `<tr>
            <td>${i + 1}</td><td style="text-align: right;">${formatDate(n.tarih)}</td><td class="${n.tutar >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(n.tutar, 0)}</td><td>${formatNumber(n.bist100)}</td><td>${formatNumber(n.dolar)}</td><td>${formatNumber(n.gramAltin)}</td><td>${formatNumber(n.pry, 6)}</td>
            <td>
                <button class="btn" style="padding: 2px 4px; font-size: 12px; background: #000000; color: var(--accent-color); border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; border: none;" onclick="window.setEditNakit('${n.id}')" title="Düzenle"><i class="fas fa-edit" style="color: var(--accent-color) !important;"></i></button>
                <button class="btn" style="padding: 2px 4px; font-size: 12px; background: transparent; color: #888888; border: none;" onclick="window.deleteNakit('${n.id}')" title="Sil"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>`;
    }).join('');

    const todayStr = new Date().toISOString().split('T')[0];

    const htmlContent = `
        <div class="page-section ${window.ekstreTab === 'nakit' ? 'active' : ''}" style="${window.ekstreTab === 'nakit' ? '' : 'display: none !important;'} margin-top: 0;">
            <div class="table-container" style="overflow-x: auto; padding: 0;">
                
                <table class="dash-table compact-table ekstre-table" style="table-layout: fixed; width: 100%;">
                    <thead>
                        <tr><th style="width: 5%; cursor: pointer; user-select: none;" onclick="window.toggleNakitTableCollapse()"><i class="fas ${window.nakitTableCollapsed ? 'fa-chevron-right' : 'fa-chevron-down'}" style="margin-right: 4px;"></i>S.N.</th><th style="width: 15%; text-align: right; cursor: pointer; user-select: none;" onclick="window.toggleNakitSort('tarih')">Tarih${getNakitSortIcon('tarih')}</th><th style="width: 15%; cursor: pointer; user-select: none;" onclick="window.toggleNakitSort('tutar')">Tutar${getNakitSortIcon('tutar')}</th><th style="width: 15%; cursor: pointer; user-select: none;" onclick="window.toggleNakitSort('bist100')">XU100${getNakitSortIcon('bist100')}</th><th style="width: 15%; cursor: pointer; user-select: none;" onclick="window.toggleNakitSort('dolar')">USDTRY${getNakitSortIcon('dolar')}</th><th style="width: 15%; cursor: pointer; user-select: none;" onclick="window.toggleNakitSort('gramAltin')">GRAMALTIN${getNakitSortIcon('gramAltin')}</th><th style="width: 15%; cursor: pointer; user-select: none;" onclick="window.toggleNakitSort('pry')">PRY${getNakitSortIcon('pry')}</th><th style="width: 20%;">İşlem</th></tr>
                    </thead>
                    <tbody id="nakit-ekle-section" style="display: none;">
                        <tr style="background: rgba(0,0,0,0.4);">
                            <td style="text-align: center;">-</td>
                            <td><input type="date" id="n-tarih" class="form-control" style="width:100%; font-size:12px; padding:4px; text-align:right;" value="${todayStr}" onkeydown="if(event.key==='Enter') window.saveInlineNakitEntry()"></td>
                            <td><input type="number" step="0.01" id="n-tutar" class="form-control" style="width:100%; font-size:12px; padding:4px;" placeholder="Tutar" onkeydown="if(event.key==='Enter') window.saveInlineNakitEntry()"></td>
                            <td><input type="number" step="0.01" id="n-bist" class="form-control" style="width:100%; font-size:12px; padding:4px;" placeholder="XU100" onkeydown="if(event.key==='Enter') window.saveInlineNakitEntry()"></td>
                            <td><input type="number" step="0.01" id="n-dolar" class="form-control" style="width:100%; font-size:12px; padding:4px;" placeholder="Dolar" onkeydown="if(event.key==='Enter') window.saveInlineNakitEntry()"></td>
                            <td><input type="number" step="0.01" id="n-altin" class="form-control" style="width:100%; font-size:12px; padding:4px;" placeholder="GRAMALTIN" onkeydown="if(event.key==='Enter') window.saveInlineNakitEntry()"></td>
                            <td><input type="text" inputmode="decimal" id="n-pry" class="form-control" style="width:100%; font-size:12px; padding:4px;" placeholder="PRY" onkeydown="if(event.key==='Enter') window.saveInlineNakitEntry()"></td>
                            <td>
                                <button class="btn" id="n-submit-btn" style="padding: 2px 4px; font-size: 14px; background: #000000; color: var(--accent-color); border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; border: none;" onclick="window.saveInlineNakitEntry()" title="Ekle"><i class="fas fa-check" style="color: var(--accent-color) !important; font-size: 14px;"></i></button>
                                <button class="btn" style="padding: 2px 4px; font-size: 14px; background: #000000; color: var(--danger-color); border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; border: none;" onclick="window.toggleInlineForm('nakit')" title="İptal"><i class="fas fa-times" style="color: var(--danger-color) !important; font-size: 14px;"></i></button>
                            </td>
                        </tr>
                    </tbody>
                    <tbody id="nakit-tbody" style="${window.nakitTableCollapsed ? 'display: none;' : ''}">
                        ${nakitRows}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    `;
    if (append) {
        const wrapper = container.querySelector('#ekstreler-tables-wrapper');
        if (wrapper) wrapper.insertAdjacentHTML('beforeend', htmlContent);
        else container.insertAdjacentHTML('beforeend', htmlContent);
    } else {
        container.innerHTML = htmlContent;
    }

    window.toggleInlineForm = (type) => {
        const section = document.getElementById(`${type}-ekle-section`);
        if (section) {
            section.style.display = section.style.display === 'none' ? '' : 'none';
        }
        if (type === 'nakit' && typeof window.cancelNakitEdit === 'function') window.cancelNakitEdit();
        else if (typeof window.cancelEdit === 'function') window.cancelEdit();

        // focus the first input if opening
        if (section && section.style.display === '') {
            const firstInput = section.querySelector('input, select');
            if (firstInput) firstInput.focus();
        }
    };

    window.deleteNakit = (id) => {
        if (confirm('Bu nakit hareketini silmek istediğinize emin misiniz?')) {
            State.deleteNakitHareket(id);
            if (typeof renderPage === 'function') renderPage();
        }
    };
    window.setEditNakit = (id) => {
        window.currentNakitEditId = id;
        if (typeof renderPage === 'function') renderPage();
    };
    window.cancelNakitEdit = () => {
        if (window.currentNakitEditId) {
            window.currentNakitEditId = null;
            if (typeof renderPage === 'function') renderPage();
        }
    };
    window.saveEditNakit = (id) => {
        const islem = {
            tarih: document.getElementById('edit-n-tarih').value,
            tutar: parseFloat(document.getElementById('edit-n-tutar').value) || 0,
            bist100: parseFloat(document.getElementById('edit-n-bist').value) || 0,
            dolar: parseFloat(document.getElementById('edit-n-dolar').value) || 0,
            gramAltin: parseFloat(document.getElementById('edit-n-altin').value) || 0,
            pry: parseFloat((document.getElementById('edit-n-pry').value || '').toString().replace(',', '.')) || 0
        };
        State.updateNakitHareket(id, islem);
        window.currentNakitEditId = null;
        if (typeof renderPage === 'function') renderPage();
    };
    window.saveInlineNakitEntry = () => {
        const islem = {
            tarih: document.getElementById('n-tarih').value,
            tutar: parseFloat(document.getElementById('n-tutar').value) || 0,
            bist100: parseFloat(document.getElementById('n-bist').value) || 0,
            dolar: parseFloat(document.getElementById('n-dolar').value) || 0,
            gramAltin: parseFloat(document.getElementById('n-altin').value) || 0,
            pry: parseFloat((document.getElementById('n-pry').value || '').toString().replace(',', '.')) || 0
        };
        State.addNakitHareket(islem);
        if (typeof renderPage === 'function') renderPage();
    };
};

const renderVeriler = (container) => {
    // We will place Enflasyon Form, Hedef Portföy input, and Fon Fiyatlari input here.
    const hedefPortfoy = State.data.hedefPortfoyTL || 0;

    // Fon Set
    const fonSet = new Set();
    State.data.ekstre.forEach(e => {
        if (e.menkul !== 'NAKIT' && e.menkul.length === 3) fonSet.add(e.menkul);
    });

    let fonHtml = '';
    fonSet.forEach(fon => {
        const pFiyat = State.getFiyat(fon);
        fonHtml += `
            <div style="display:flex; gap: 0.5rem; width: 100%;">
                <input type="number" step="0.000001" id="v-fon-input-${fon}" value="${pFiyat}" class="form-control" style="width: 100%; text-align:right; padding: 0.3rem; font-size: 12px; font-weight: normal; color: var(--text-secondary);" onkeydown="if(event.key === 'Enter') { State.updateFiyat('${fon}', this.value); this.blur(); }">
                <button class="btn" style="padding: 0; width: 26px; height: 26px; background: #000000; border: none; box-shadow: none; color: var(--success-color); display: flex; align-items: center; justify-content: center; border-radius: 4px;" onclick="State.updateFiyat('${fon}', document.getElementById('v-fon-input-${fon}').value);" title="Kaydet"><i class="fas fa-save" style="font-size: 18px; color: var(--success-color) !important;"></i></button>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="page-section active" style="display: flex; flex-direction: column; gap: 16px;">
            
                        

            

            <!-- Enflasyon -->
            <div class="table-container glass" style="margin-bottom: 0;">
                <div class="table-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 13px; color: var(--text-primary);">Aylık Enflasyon Verileri</span>
                    <button class="btn" style="padding: 0 0.5rem; display: flex; align-items: center; justify-content: center; background: transparent; color: #888888; border: none; box-shadow: none;" onclick="window.toggleEnfForm()" title="Ekle"><i class="fas fa-plus" style="font-size: 14px;"></i></button>
                </div>
                
                <div style="max-height: 400px; overflow-y: auto; margin-bottom: 0;">
                    <table class="dash-table compact-table" style="width: 100%;">
                        <thead style="position: sticky; top: 0; background: var(--bg-card); z-index: 10;">
                            <tr style="font-size: 12px; font-weight: normal;">
                                <th style="text-align:center; font-size: 12px; font-weight: normal;">Dönem (Yıl-Ay)</th>
                                <th style="text-align:right; font-size: 12px; font-weight: normal;">Aylık Enflasyon (%)</th>
                                <th style="text-align:right; font-size: 12px; font-weight: normal;">Kümülatif Enflasyon (%)</th>
                                <th style="text-align:center; width: 80px; font-size: 12px; font-weight: normal;">İşlem</th>
                            </tr>
                        </thead>
                        <tbody id="enf-form-tbody">
                            <tr id="enf-form-row" style="display:none; background: var(--overlay-bg);">
                                <td style="text-align:center;">
                                    <input type="month" id="i-enf-tarih" class="form-control" style="padding:2px 5px; font-size:12px; height:auto; width:100%;" required>
                                </td>
                                <td style="text-align:right;">
                                    <input type="number" id="i-enf-oran" class="form-control" step="0.01" style="padding:2px 5px; font-size:12px; height:auto; width:100%; text-align:right;" required>
                                </td>
                                <td style="text-align:right; color: var(--text-secondary);">-</td>
                                <td style="text-align:center;">
                                    <div style="display:flex; gap:0.2rem; justify-content:center;">
                                        <button class="btn btn-icon" style="color: var(--success-color); font-size: 14px; padding: 4px; border: none; background: transparent;" onclick="window.addEnflasyon(event)" title="Ekle"><i class="fas fa-check"></i></button>
                                        <button class="btn btn-icon" style="color: var(--danger-color); font-size: 14px; padding: 4px; border: none; background: transparent;" onclick="window.toggleEnfForm()" title="İptal"><i class="fas fa-times"></i></button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                        <tbody id="enf-data-tbody">
                            <!-- JS ile doldurulacak -->
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    `;

    setTimeout(() => {
        if (typeof window.renderEnflasyonData === 'function') {
            window.renderEnflasyonData();
        }
        const hisselerList = (State.bistStocks && State.bistStocks.length > 0) ? State.bistStocks : window.defaultStocksArray || [];
        if (typeof window.setupCustomDropdown === 'function') {
            window.setupCustomDropdown('upload-hisse', hisselerList);
        }
    }, 50);
};

window.toggleEnfForm = () => {
    const row = document.getElementById('enf-form-row');
    if (row) {
        row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
        if (row.style.display !== 'none') {
            const today = new Date();
            const y = today.getFullYear();
            const m = String(today.getMonth() + 1).padStart(2, '0');
            document.getElementById('i-enf-tarih').value = `${y}-${m}`;
            document.getElementById('i-enf-oran').value = '';
            document.getElementById('i-enf-oran').focus();
        }
    }
};

window.renderEnflasyonData = () => {
    const tbody = document.getElementById('enf-data-tbody');
    if (!tbody) return;

    let html = '';
    if (!State.data.enflasyonListesi || State.data.enflasyonListesi.length === 0) {
        State.data.enflasyonListesi = [
            { id: 'enf_1719792000005', tarih: '2026-06', oran: 1.64 },
            { id: 'enf_1719792000004', tarih: '2026-05', oran: 3.37 },
            { id: 'enf_1719792000003', tarih: '2026-04', oran: 3.18 },
            { id: 'enf_1719792000002', tarih: '2026-03', oran: 3.16 },
            { id: 'enf_1719792000001', tarih: '2026-02', oran: 4.53 },
            { id: 'enf_1719792000000', tarih: '2026-01', oran: 6.70 }
        ];
    }
    const list = State.data.enflasyonListesi || [];

    if (list.length === 0) {
        html = `<tr><td colspan="4" style="text-align:center; padding:1rem; opacity:0.5;">Henüz enflasyon verisi eklenmemiş.</td></tr>`;
    } else {
        const sorted = [...list].sort((a, b) => b.tarih.localeCompare(a.tarih));

        let cumulative = 1;
        const ascSorted = [...list].sort((a, b) => a.tarih.localeCompare(b.tarih));
        const cumMap = {};
        ascSorted.forEach(item => {
            cumulative *= (1 + (parseFloat(item.oran) / 100));
            cumMap[item.tarih] = (cumulative - 1) * 100;
        });

        sorted.forEach(item => {
            const pct = parseFloat(item.oran);
            const color = pct >= 0 ? 'var(--danger-color)' : 'var(--success-color)';
            const cumColor = cumMap[item.tarih] >= 0 ? 'var(--danger-color)' : 'var(--success-color)';
            html += `<tr>
                <td style="text-align:center;">${item.tarih}</td>
                <td style="text-align:right; color:${color}; font-weight:bold;">${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(pct)}%</td>
                <td style="text-align:right; color:${cumColor}; font-weight:bold;">${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(cumMap[item.tarih])}%</td>
                <td style="text-align:center;">
                    <button class="btn" style="padding: 2px 4px; font-size: 12px; background: transparent; color: #888888; border: none;" onclick="window.deleteEnflasyon('${item.id}')" title="Sil"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>`;
        });
    }
    tbody.innerHTML = html;
};

window.addEnflasyon = (e) => {
    if (e) e.preventDefault();
    const tarih = document.getElementById('i-enf-tarih').value;
    const oranStr = document.getElementById('i-enf-oran').value;

    if (!tarih || !oranStr) {
        alert('Lütfen tarih ve oran giriniz.');
        return;
    }

    if (!State.data.enflasyonListesi) State.data.enflasyonListesi = [];

    const existingIdx = State.data.enflasyonListesi.findIndex(x => x.tarih === tarih);
    if (existingIdx !== -1) {
        State.data.enflasyonListesi[existingIdx].oran = oranStr;
    } else {
        State.data.enflasyonListesi.push({
            id: 'enf_' + Date.now(),
            tarih: tarih,
            oran: oranStr
        });
    }

    State.save();
    window.toggleEnfForm();
    if (typeof renderPage === 'function') renderPage();
};

window.deleteEnflasyon = (id) => {
    if (confirm('Bu enflasyon verisini silmek istediğinize emin misiniz?')) {
        State.data.enflasyonListesi = (State.data.enflasyonListesi || []).filter(x => x.id !== id);
        State.save();
        if (typeof renderPage === 'function') renderPage();
    }
};

window.toggleInlineAnaliz = () => {
    const row = document.getElementById('inline-analiz-row');
    if (row) {
        const displayType = row.tagName.toUpperCase() === 'TR' ? 'table-row' : 'flex';
        row.style.display = row.style.display === 'none' ? displayType : 'none';
        if (row.style.display !== 'none') {
            document.getElementById('analiz-baglanti').focus();
            const akisAnalizRadio = document.querySelector('input[name="akisTipi"][value="analiz"]');
            if (akisAnalizRadio) {
                akisAnalizRadio.checked = true;
                if (typeof window.toggleAkisTipi === 'function') window.toggleAkisTipi();
            }
        } else {
            window.currentEditingAnalizId = null;
            if(document.getElementById('analiz-baslik')) document.getElementById('analiz-baslik').value = '';
            if(document.getElementById('analiz-baglanti')) document.getElementById('analiz-baglanti').value = '';
            if(document.getElementById('analiz-borsaci')) document.getElementById('analiz-borsaci').value = '';
            if(document.getElementById('analiz-not')) document.getElementById('analiz-not').value = '';
        }
    }
};

window.sortAnalizler = (analizlerList) => {
    return analizlerList.sort((a, b) => {
        if (a.isKisiselNot && !b.isKisiselNot) return -1;
        if (!a.isKisiselNot && b.isKisiselNot) return 1;

        const hA = (a.hisse || '').toUpperCase();
        const hB = (b.hisse || '').toUpperCase();
        if (hA !== hB) {
            return hA.localeCompare(hB);
        }
        const d1 = new Date(a.tarih);
        const d2 = new Date(b.tarih);
        return d1 - d2;
    });
};



window.toggleAkisTipi = () => {
    const isKisisel = document.querySelector('input[name="akisTipi"][value="kisisel"]').checked;
    const genelInputs = document.getElementById('akis-genel-inputs');
    if(genelInputs) {
        genelInputs.style.display = isKisisel ? 'none' : 'flex';
    }
};

window.saveUnifiedAnaliz = async () => {
    const fileInput = document.getElementById('upload-file');
    const status = document.getElementById('upload-status');
    const baslik = (document.getElementById('analiz-baslik') ? document.getElementById('analiz-baslik').value.trim() : '');
    const baglanti = (document.getElementById('analiz-baglanti') ? document.getElementById('analiz-baglanti').value.trim() : '');
    const borsaci = (document.getElementById('analiz-borsaci') ? document.getElementById('analiz-borsaci').value.trim() : '');
    const tarih = (document.getElementById('analiz-tarih') ? document.getElementById('analiz-tarih').value.trim() : '');
    const notText = (document.getElementById('analiz-not') ? document.getElementById('analiz-not').value.trim() : '');
    const hisse = (document.getElementById('analiz-hisse') ? document.getElementById('analiz-hisse').value.trim().toUpperCase() : (State.ui.selectedHisse || ''));

    const akisTipiRadio = document.querySelector('input[name="akisTipi"]:checked');
    const akisTipi = akisTipiRadio ? akisTipiRadio.value : 'analiz';
    
    let isKisiselNot = false;
    let finalBorsaci = borsaci;
    let finalTarih = tarih;
    let finalBaslik = baslik;
    
    if (akisTipi === 'kisisel') {
        isKisiselNot = true;
        finalBorsaci = window.currentUser ? window.currentUser.displayName : 'Yunus Şensoy';
        const d = new Date();
        finalTarih = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        finalBaslik = '-';
    } else {
        isKisiselNot = !!(borsaci === 'Yunus Şensoy' || (window.currentUser && borsaci === window.currentUser.displayName));
    }

    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        if (!hisse) {
            if (status) { status.style.display = 'block'; status.style.color = 'var(--danger-color)'; status.innerText = 'Lütfen Hisse kodunu doldurun.'; }
            return;
        }
        if (status) { status.style.display = 'block'; status.style.color = 'var(--text-primary)'; status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GitHub\'a yükleniyor...'; }

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
                
                const row = document.getElementById('inline-analiz-row');
                if (row) row.style.display = 'none';
                window.currentEditingAnalizId = null;
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
                State.data.analizler[index] = { ...State.data.analizler[index], tarih: finalTarih, borsaci: finalBorsaci, hisse, baslik: finalBaslik, baglanti, notText, isKisiselNot };
            }
            window.currentEditingAnalizId = null;
        } else {
            State.data.analizler.push({ tarih: finalTarih, borsaci: finalBorsaci, hisse, baslik: finalBaslik, baglanti, notText, isKisiselNot, id: Date.now() });
        }
        
        if(document.getElementById('analiz-baslik')) document.getElementById('analiz-baslik').value = '';
        if(document.getElementById('analiz-baglanti')) document.getElementById('analiz-baglanti').value = '';
        if(document.getElementById('analiz-borsaci')) document.getElementById('analiz-borsaci').value = '';
        if(document.getElementById('analiz-not')) document.getElementById('analiz-not').value = '';
        
        State.save();
        State.save();
        const row = document.getElementById('inline-analiz-row');
        if (row) row.style.display = 'none';
        window.currentEditingAnalizId = null;
        if (typeof renderPage === 'function') renderPage();
    }
};
window.addAnaliz = () => {
    try {
        const tarihEl = document.getElementById('analiz-tarih');
        const borsaciEl = document.getElementById('analiz-borsaci');
        const hisseEl = document.getElementById('analiz-hisse');
        const baglantiEl = document.getElementById('analiz-baglanti');
        const notTextEl = document.getElementById('analiz-not');

        if (!tarihEl || !borsaciEl || !hisseEl) {
            alert('DOM elements not found! ' + (!tarihEl ? 'tarih ' : '') + (!borsaciEl ? 'borsaci ' : '') + (!hisseEl ? 'hisse' : ''));
            return;
        }

        const notTipiEl = document.querySelector('input[name="notTipi"]:checked');
        const isKisiselNot = notTipiEl && notTipiEl.value === 'kisisel';

        const tarih = tarihEl.value;
        const borsaci = borsaciEl.value.trim();
        const hisse = hisseEl.value.trim().toUpperCase();
        const baslikEl = document.getElementById('analiz-baslik');
        const baslik = baslikEl ? baslikEl.value.trim() : '';
        const baglanti = baglantiEl ? baglantiEl.value.trim() : '';
        const notText = notTextEl ? notTextEl.value.trim() : '';

        if (isKisiselNot) {
            if (!notText || !hisse) {
                alert('Lütfen Hisse ve Notlar alanlarını doldurun.');
                return;
            }
        } else {
            if (!tarih || !borsaci || !hisse) {
                alert('Lütfen Tarih, Analist ve Hisse alanlarını doldurun.');
                return;
            }
        }

        if (!State.data.analizler) State.data.analizler = [];

        if (window.currentEditingAnalizId) {
            const index = State.data.analizler.findIndex(a => String(a.id) === String(window.currentEditingAnalizId));
            if (index !== -1) {
                State.data.analizler[index] = { ...State.data.analizler[index], tarih, borsaci, hisse, baslik, baglanti, notText, isKisiselNot };
            }
            window.currentEditingAnalizId = null;
        } else {
            State.data.analizler.push({
                tarih,
                borsaci,
                hisse,
                baslik,
                baglanti,
                notText,
                isKisiselNot,
                id: Date.now()
            });
        }

        State.data.analizler = window.sortAnalizler(State.data.analizler);

        // Add to Takip Listesi if not exists
        if (!State.data.takipListesi) State.data.takipListesi = [];
        if (!State.data.takipListesi.includes(hisse)) {
            State.data.takipListesi.push(hisse);

            if (!State.data.tickerData) State.data.tickerData = [];
            if (!State.data.tickerData.includes(hisse)) {
                State.data.tickerData.push(hisse);
            }
            if (window.initTicker) window.initTicker();
        }

        State.save();

        // Reset the form so it is ready for the next one
        tarihEl.value = new Date().toISOString().split('T')[0];
        borsaciEl.value = '';
        hisseEl.value = '';
        if (baglantiEl) baglantiEl.value = '';
        if (notTextEl) notTextEl.value = '';

        renderPage();

        const row = document.getElementById('inline-analiz-row');
        if (row) row.style.display = 'none';

    } catch (e) {
        alert('Hata oluştu: ' + e.message);
        console.error(e);
    }
};

window.editAnaliz = (id) => {
    const analiz = State.data.analizler.find(a => String(a.id) === String(id));
    if (!analiz) return;

    window.currentEditingAnalizId = id;

    setTimeout(() => {
        const row = document.getElementById('inline-analiz-row');
        if (row) row.style.display = row.tagName.toUpperCase() === 'TR' ? 'table-row' : 'flex';

        const tEl = document.getElementById('analiz-tarih');
        if (tEl) tEl.value = analiz.tarih;
        const bEl = document.getElementById('analiz-borsaci');
        if (bEl) bEl.value = analiz.borsaci;
        const hEl = document.getElementById('analiz-hisse');
        if (hEl) hEl.value = analiz.hisse;
        const bslEl = document.getElementById('analiz-baslik');
        if (bslEl) bslEl.value = analiz.baslik || '';
        const lEl = document.getElementById('analiz-baglanti');
        if (lEl) lEl.value = analiz.baglanti || '';
        const nEl = document.getElementById('analiz-not');
        if (nEl) nEl.value = analiz.notText || '';

        const radioAnaliz = document.querySelector('input[name="notTipi"][value="analiz"]');
        const radioKisisel = document.querySelector('input[name="notTipi"][value="kisisel"]');
        const detayAlanlari = document.getElementById('analiz-detay-alanlari');

        if (analiz.isKisiselNot) {
            if (radioKisisel) radioKisisel.checked = true;
            if (detayAlanlari) detayAlanlari.style.display = 'none';
        } else {
            if (radioAnaliz) radioAnaliz.checked = true;
            if (detayAlanlari) detayAlanlari.style.display = 'flex';
        }

        if (bEl && !analiz.isKisiselNot) bEl.focus();
        else if (nEl) nEl.focus();
    }, 50);
};

window.deleteAnaliz = (id) => {
    if (!confirm('Bu analizi silmek istediğinize emin misiniz?')) return;
    State.data.analizler = State.data.analizler.filter(a => String(a.id) !== String(id));
    State.save();
    renderPage();
};

window.setupCustomDropdown = (inputId, optionsList) => {
    const input = document.getElementById(inputId);
    if (!input) return;

    // Remove native list attribute
    input.removeAttribute('list');

    if (!input.parentNode.classList.contains('custom-dropdown-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-dropdown-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';
        wrapper.style.zIndex = '9999'; // Ensure wrapper is on top
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const list = document.createElement('div');
        list.id = inputId + '-custom-list';
        list.className = 'custom-dropdown-list';
        list.style.display = 'none';
        list.style.position = 'absolute';
        list.style.top = '100%';
        list.style.left = '0';
        list.style.width = '100%';
        list.style.maxHeight = '250px';
        list.style.overflowY = 'auto';
        list.style.flexDirection = 'column';
        list.style.padding = '0.5rem 0';
        list.style.borderRadius = '12px';
        list.style.boxShadow = '0 4px 15px rgba(0,0,0,0.8)';
        list.style.marginTop = '5px';
        // Give list a massive z-index
        list.style.zIndex = '99999';
        list.style.background = '#1e1e24';
        list.style.border = '1px solid var(--surface-border)';
        wrapper.appendChild(list);
    }

    const list = document.getElementById(inputId + '-custom-list');
    const wrapper = input.parentNode;
    let activeIndex = -1;

    const handler = function () {
        let val = this.value.toUpperCase();
        list.innerHTML = '';
        activeIndex = -1;

        let matches = [];
        if (val) {
            // Only show matches
            matches = optionsList.filter(s => s && s.toUpperCase().startsWith(val));
        }

        // Find the table container and disable overflow while dropdown is open so it isn't clipped
        const tableContainer = input.closest('.table-container');
        if (tableContainer) {
            tableContainer.style.overflow = 'visible';
            tableContainer.style.overflowX = 'visible';
            tableContainer.style.overflowY = 'visible';
        }

        if (matches.length > 0) {
            matches.forEach((match, index) => {
                const item = document.createElement('div');
                item.className = 'custom-dropdown-item';
                item.style.padding = '10px 15px';
                item.style.cursor = 'pointer';
                item.style.color = '#fff';
                item.style.textAlign = 'left';
                item.style.background = 'transparent';

                if (val) {
                    item.innerHTML = `<strong style="color: var(--accent-color);">${match.substr(0, val.length)}</strong>${match.substr(val.length)}`;
                } else {
                    item.innerHTML = match;
                }

                item.addEventListener('click', (e) => {
                    if(e) e.stopPropagation();
                    input.value = match;
                    list.style.display = 'none';
                    if (tableContainer) {
                        tableContainer.style.overflow = '';
                        tableContainer.style.overflowX = 'auto';
                        tableContainer.style.overflowY = 'auto';
                    }
                });
                item.addEventListener('mouseover', () => {
                    activeIndex = index;
                    updateActiveStyle();
                });
                item.addEventListener('mouseout', () => {
                    item.style.background = 'transparent';
                });
                list.appendChild(item);
            });
            list.style.display = 'flex';
        } else {
            list.style.display = 'none';
            if (tableContainer) {
                tableContainer.style.overflow = '';
                tableContainer.style.overflowX = 'auto';
                tableContainer.style.overflowY = 'auto';
            }
        }
    };

    const updateActiveStyle = () => {
        const items = list.querySelectorAll('.custom-dropdown-item');
        items.forEach((item, index) => {
            if (index === activeIndex) {
                item.style.background = 'rgba(255,255,255,0.1)';
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.style.background = 'transparent';
            }
        });
    };

    input.addEventListener('input', handler);
    input.addEventListener('focus', handler);
    input.addEventListener('click', (e) => { e.stopPropagation(); handler.call(input); });
    
    // Add keyboard navigation
    input.addEventListener('keydown', (e) => {
        if (list.style.display !== 'flex') return;
        
        const items = list.querySelectorAll('.custom-dropdown-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex++;
            if (activeIndex >= items.length) activeIndex = 0;
            updateActiveStyle();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex--;
            if (activeIndex < 0) activeIndex = items.length - 1;
            updateActiveStyle();
        } else if (e.key === 'Enter') {
            if (activeIndex > -1 && items[activeIndex]) {
                e.preventDefault();
                items[activeIndex].click();
            }
        }
    });

    if (window['dropdown_listener_' + inputId]) {
        document.removeEventListener('click', window['dropdown_listener_' + inputId]);
    }
    window['dropdown_listener_' + inputId] = (e) => {
        if (e.target !== input && !list.contains(e.target)) {
            list.style.display = 'none';
            const tableContainer = input.closest('.table-container');
            if (tableContainer) {
                tableContainer.style.overflow = '';
                tableContainer.style.overflowX = 'auto';
                tableContainer.style.overflowY = 'auto';
            }
        }
    };
    document.addEventListener('click', window['dropdown_listener_' + inputId]);
};

const renderAnalizler = (container) => {
    let analizler = State.data.analizler || [];
    analizler = window.sortAnalizler([...analizler]);

    const uniqueBorsacilar = [...new Set(analizler.map(a => a.borsaci).filter(b => b))].sort();
    const borsaciOptions = uniqueBorsacilar.map(b => `<option value="${b}">`).join('');

    let tableRows = analizler.map(a => {
        const linkHtml = a.baglanti ? `<a href="${a.baglanti}" target="_blank" style="color: var(--accent-color); text-decoration: none;"><i class="fas fa-external-link-alt"></i> Link</a>` : '-';
        return `
            <tr>
                <td style="text-align: right; white-space: nowrap; width: 100px; color: var(--text-secondary);">${a.tarih ? a.tarih.split('-').reverse().join('.') : ''}</td>
                <td style="text-align: left; word-break: break-word; width: 140px; padding-left: 10px; color: var(--text-secondary);">${(a.borsaci || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}]/gu, '').trim()}</td>
                <td style="text-align: left; font-weight: bold; white-space: nowrap; width: 100px; padding-left: 10px;">${a.hisse}</td>
                <td style="text-align: left; white-space: nowrap; width: 100px; padding-left: 10px;">${linkHtml}</td>
                <td style="text-align: left; word-break: break-word; width: 100%;">${a.notText || ''}</td>
                <td style="text-align: center; white-space: nowrap; width: 90px;">
                    <div style="display: flex; gap: 0.5rem; justify-content: center;">
                        <button class="btn btn-icon" style="color: var(--accent-color);" onclick="window.editAnaliz(${a.id})" title="Düzenle"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-icon" style="background: transparent; color: #888888; padding: 2px; font-size: 14px; border: none;" onclick="window.deleteAnaliz(${a.id})" title="Sil"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    if (analizler.length === 0) {
        tableRows += `<tr><td colspan="6" style="text-align: center; padding: 2rem; opacity: 0.5;">Henüz eklenmiş bir analiz bulunmuyor.</td></tr>`;
    }

    const today = new Date().toISOString().split('T')[0];

    container.innerHTML = `
        
        <div class="page-section active" style="display: flex; flex-direction: column; gap: 1rem; max-width: 1200px; margin: 0 auto; padding: 0 1rem; padding-top: 0.5rem; min-height: 100%;">
            
            <div class="table-container glass" style="flex: 1;">
                <div class="table-header" style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.5rem; border-bottom: 1px solid var(--surface-border); margin-bottom: 0.5rem;">
                    <span>Takip Edilen Analizler</span>
                    <button class="btn" style="font-size: 12px; padding: 0.3rem 0.8rem; background: var(--success-color);" onclick="window.toggleInlineAnaliz()">+</button>
                </div>
                <div style="overflow-x: auto;">
                    <table class="dash-table" style="table-layout: fixed; width: 100%;">
                        <thead>
                            <tr>
                                <th style="text-align: center; color: var(--text-primary); width: 100px; white-space: nowrap;">Tarih</th>
                                <th style="text-align: center; color: var(--text-primary); width: 140px; white-space: nowrap;">Analist</th>
                                <th style="text-align: center; color: var(--text-primary); width: 100px; white-space: nowrap;">Hisse</th>
                                <th style="text-align: center; color: var(--text-primary); width: 100px; white-space: nowrap;">Bağlantı</th>
                                <th style="text-align: left; color: var(--text-primary); width: 100%;">Not</th>
                                <th style="text-align: center; color: var(--text-primary); width: 90px; white-space: nowrap;">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr id="inline-analiz-row" style="display: none; background: rgba(0,0,0,0.4);">
                                <td><input type="date" id="analiz-tarih" class="form-control" style="width:100%; font-size:12px; padding:4px; text-align:right; color-scheme: dark;" value="${today}"></td>
                                <td><input type="text" id="analiz-borsaci" list="analiz-borsaci-list" class="form-control" style="width:100%; font-size:12px; padding:4px; text-align:left;" placeholder="Analist"></td>
                                <td><input type="text" id="analiz-hisse" list="bist-hisse-list" class="form-control" style="width:100%; font-size:12px; padding:4px; text-transform:uppercase; text-align:left;" placeholder="Hisse"></td>
                                <td><input type="text" id="analiz-baglanti" class="form-control" style="width:100%; font-size:12px; padding:4px; text-align:left;" placeholder="Link"></td>
                                <td><input type="text" id="analiz-not" class="form-control" style="width:100%; font-size:12px; padding:4px;" placeholder="Not..."></td>
                                <td style="text-align: center;">
                                    <div style="display: flex; gap: 0.5rem; justify-content: center;">
                                        <button class="btn" style="background: var(--success-color); color: var(--btn-text); padding: 2px 6px !important; font-size: 12px !important; min-width: 0 !important; width: fit-content !important; border-radius: 4px; border: none; cursor: pointer; box-sizing: border-box !important;" onclick="window.addAnaliz()">Kaydet</button>
                                        <button class="btn" style="background: var(--danger-color); color: #fff; padding: 2px 6px !important; font-size: 12px !important; min-width: 0 !important; width: fit-content !important; border-radius: 4px; border: none; cursor: pointer; box-sizing: border-box !important;" onclick="window.toggleInlineAnaliz()">İptal</button>
                                    </div>
                                </td>
                            </tr>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    setTimeout(() => {
        const uniqueBorsacilar = [...new Set((State.data.analizler || []).map(a => a.borsaci ? a.borsaci.trim() : '').filter(b => b))].sort();
        const hisseler = (State.bistStocks && State.bistStocks.length > 0) ? State.bistStocks : window.defaultStocksArray || [];
        window.setupCustomDropdown('analiz-borsaci', uniqueBorsacilar);
        window.setupCustomDropdown('analiz-hisse', hisseler);
    }, 50);
};


const renderAyarlar = (container) => {
    container.innerHTML = `
        <div class="page-section active">
            <h2 style="margin-bottom:1rem;"><i class="fas fa-user-cog"></i> Hesap Ayarları</h2>
            <div class="glass" style="padding: 2rem; max-width: 500px; margin: 0 auto;">
                <form id="profile-form" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.3rem; display: block;">E-posta (Değiştirilemez)</label>
                        <input type="email" id="profile-email" class="form-control" disabled value="${currentUser.email}">
                    </div>
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.3rem; display: block;">Adı Soyadı</label>
                        <input type="text" id="profile-name" class="form-control" value="${currentUser.displayName || ''}" required>
                    </div>
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.3rem; display: block;">Telefon No</label>
                        <input type="tel" id="profile-phone" class="form-control">
                    </div>
                    <button type="submit" class="btn" style="background: var(--accent-color); margin-top: 1rem;">Profili Kaydet</button>
                </form>
                <div style="height: 1px; background: var(--surface-border); margin: 2rem 0;"></div>

                <form id="password-form" style="display: flex; flex-direction: column; gap: 1rem;">
                    <h3 style="margin-bottom: 0.5rem; color: var(--text-primary); font-size: 1.1rem;">Parola Güncelleme</h3>
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.3rem; display: block;">Yeni Parola</label>
                        <input type="password" id="profile-new-password" class="form-control" required minlength="6">
                    </div>
                    <button type="submit" class="btn btn-danger" style="margin-top: 0.5rem;">Parolayı Güncelle</button>
                </form>
                
                <div style="height: 1px; background: var(--surface-border); margin: 2rem 0;"></div>
                
                <h3 style="margin-bottom: 0.5rem; color: var(--text-primary); font-size: 1.1rem;">Veri Yönetimi</h3>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1rem;">Yerel ve web (tarayıcı) verilerinizi kaybetmeden birleştirmek için verilerinizi indirebilir ve diğer tarafa aktarabilirsiniz.</p>
                <div style="display: flex; gap: 1rem;">
                    <button type="button" class="btn" style="background: var(--success-color); flex:1; justify-content:center;" onclick="window.exportData()"><i class="fas fa-download"></i> Dışa Aktar</button>
                    <button type="button" class="btn" style="background: var(--accent-color); flex:1; justify-content:center;" onclick="document.getElementById('import-file-input').click()"><i class="fas fa-upload"></i> İçe Aktar (Birleştir)</button>
                    <input type="file" id="import-file-input" style="display: none;" accept=".json" onchange="window.importData(event)">
                </div>
            </div>
        </div>
    `;

    db.collection('users').doc(currentUser.uid).get().then(doc => {
        if (doc.exists && doc.data().phone) {
            document.getElementById('profile-phone').value = doc.data().phone;
        }
    });

    document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = document.getElementById('profile-name').value;
        const newPhone = document.getElementById('profile-phone').value;
        currentUser.updateProfile({ displayName: newName }).then(() => {
            const unEl = document.getElementById('user-name');
            if (unEl) unEl.innerText = newName;
            return db.collection('users').doc(currentUser.uid).set({ phone: newPhone, displayName: newName }, { merge: true });
        }).then(() => {
            alert('Profil güncellendi!');
        }).catch(err => alert(err.message));
    });

    document.getElementById('password-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newPass = document.getElementById('profile-new-password').value;
        currentUser.updatePassword(newPass).then(() => {
            alert('Parola başarıyla güncellendi!');
            document.getElementById('password-form').reset();
        }).catch(err => alert(err.message));
    });
};
window.getGBHF = (hisse) => {
    if (!State.data.araDegerleme || !State.data.araDegerleme[hisse]) return null;
    let qKeys = Object.keys(State.data.araDegerleme[hisse]).sort((a, b) => {
        let [yA, mA] = a.split('/').map(Number);
        let [yB, mB] = b.split('/').map(Number);
        if (yA !== yB) return yB - yA;
        return mB - mA;
    });
    
    // Find the latest quarter that actually has data and generates a target price
    for (let period of qKeys) {
        const d = State.data.araDegerleme[hisse][period];
        if (!d || Object.keys(d).length === 0) continue;
        
        const sData = (window.stockData && window.stockData[hisse]) ? window.stockData[hisse] : null;
        if (!sData) continue;
        
        if (sData.gelirCeyrek && sData.gelirCeyrek.headers && sData.gelirCeyrek.headers.includes(period)) {
            continue;
        }
        
        let past3Favok = 0; let past3NetKar = 0;
        if (sData.gelirCeyrek && sData.gelirCeyrek.rows) {
            const fRow = sData.gelirCeyrek.rows.find(x => x[0] && String(x[0]).toLocaleLowerCase('tr-TR').includes('favök'));
            const nRow = sData.gelirCeyrek.rows.find(x => x[0] && (String(x[0]).toLocaleLowerCase('tr-TR').includes('ana ortaklık payları') || String(x[0]).toLocaleLowerCase('tr-TR').includes('dönem net kar')));
            for (let i = 1; i <= Math.min(3, sData.gelirCeyrek.headers.length - 1); i++) {
                if (fRow && fRow[i] !== undefined && fRow[i] !== '') past3Favok += (typeof fRow[i] === 'number' ? fRow[i] : parseFloat(String(fRow[i]).replace(/\./g, '').replace(/,/g, '.')) || 0);
                if (nRow && nRow[i] !== undefined && nRow[i] !== '') past3NetKar += (typeof nRow[i] === 'number' ? nRow[i] : parseFloat(String(nRow[i]).replace(/\./g, '').replace(/,/g, '.')) || 0);
            }
        }
        
        let finansalBorclarTotal = 0; let nakitTotal = 0; let finYatTotal = 0; let inDuran = false;
        if (sData.bilanco && sData.bilanco.rows) {
            sData.bilanco.rows.forEach(r => {
                if (!r[0]) return;
                const rName = r[0].toString().toLocaleLowerCase('tr-TR');
                if (rName.trim() === 'duran varlıklar') inDuran = true;
                if (rName.includes('finansal borçlar') && !rName.includes('kısımlar') && !rName.includes('ksmlar') && (!sData.bilanco.rows.length || sData.bilanco.rows.indexOf(r) < sData.bilanco.rows.length - 2)) {
                    finansalBorclarTotal += typeof r[1] === 'number' ? r[1] : parseFloat((r[1] || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
                }
                if (rName.includes('nakit ve nakit benzerleri') || rName.includes('nakit ve nakit değerler')) {
                    nakitTotal += typeof r[1] === 'number' ? r[1] : parseFloat((r[1] || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
                }
                if (rName.includes('finansal yatırımlar') && !inDuran) {
                    finYatTotal += typeof r[1] === 'number' ? r[1] : parseFloat((r[1] || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
                }
            });
        }
        const netBorc = finansalBorclarTotal - nakitTotal - finYatTotal;
        
        let odenmisSermayeDeg = 0;
        if (sData.bilanco && sData.bilanco.rows) {
            const osRow = sData.bilanco.rows.find(x => x[0] && String(x[0]).toLocaleLowerCase('tr-TR').includes('ödenmiş sermaye') && !String(x[0]).toLocaleLowerCase('tr-TR').includes('fark') && !String(x[0]).toLocaleLowerCase('tr-TR').includes('düzeltme'));
            if (osRow && osRow[1]) odenmisSermayeDeg = typeof osRow[1] === 'number' ? osRow[1] : parseFloat(String(osRow[1]).replace(/\./g, '').replace(/,/g, '.')) || 0;
        }
        
        const curCurrency = d.currency || 'TRY';
        const usdKuru = (State.getFiyat ? parseFloat(State.getFiyat('USDTRY')) : null) || window.dolarKuru || 46.99;
        const eurKuru = (State.getFiyat ? parseFloat(State.getFiyat('EURTRY')) : null) || window.euroKuru || 50.00;
        const guncelFiyat = parseFloat(State.getFiyat(hisse)) || 0;
        
        let ciro = parseFloat(d.ciro) || 0;
        let favokMarji = parseFloat(d.favok_marji) || 0;
        let netKarMarji = parseFloat(d.net_kar_marji) || 0;
        
        let favok = 0; let hasFavok = false;
        if (d.ciro !== undefined && d.ciro !== '' && d.favok_marji !== undefined && d.favok_marji !== '') {
            favok = (ciro * (favokMarji / 100));
            hasFavok = true;
        }
        
        let net_kar = 0; let hasNetKar = false;
        if (d.ciro !== undefined && d.ciro !== '' && d.net_kar_marji !== undefined && d.net_kar_marji !== '') {
            net_kar = (ciro * (netKarMarji / 100));
        }
        
        let validPDs = [];
        let currentNetBorc = netBorc;
        if (curCurrency === 'USD') currentNetBorc = netBorc / usdKuru;
        else if (curCurrency === 'EUR') currentNetBorc = netBorc / eurKuru;
        
        let yFdFavok = parseFloat(d.fd_favok) || 0;
        let yFk = parseFloat(d.f_k) || 0;
        let yPdDd = parseFloat(d.pd_dd) || 0;
        
        let ttmFavok = favok + (period.includes('/') ? past3Favok : 0);
        let ttmNetKar = net_kar + (period.includes('/') ? past3NetKar : 0);
        
        if (hasFavok && yFdFavok > 0) validPDs.push((ttmFavok * yFdFavok) - currentNetBorc);
        if (hasNetKar && yFk > 0) validPDs.push(ttmNetKar * yFk);
        if (d.ozkaynaklar !== undefined && d.ozkaynaklar !== '' && yPdDd > 0) validPDs.push((parseFloat(d.ozkaynaklar) || 0) * yPdDd);
        
        let currentOdenmisSermaye = odenmisSermayeDeg;
        if (d.sermaye !== undefined && d.sermaye !== '') currentOdenmisSermaye = parseFloat(d.sermaye) || currentOdenmisSermaye;
        
        if (validPDs.length > 0 && currentOdenmisSermaye > 0) {
            let avgPD = validPDs.reduce((a, b) => a + b, 0) / validPDs.length;
            let hedefFiyatForeign = avgPD / currentOdenmisSermaye;
            let hedefFiyatTL = 0;
            if (curCurrency === 'USD') hedefFiyatTL = hedefFiyatForeign * usdKuru;
            else if (curCurrency === 'EUR') hedefFiyatTL = hedefFiyatForeign * eurKuru;
            else hedefFiyatTL = hedefFiyatForeign;
            
            let potansiyelNum = 0;
            if (guncelFiyat > 0) potansiyelNum = ((hedefFiyatTL - guncelFiyat) / guncelFiyat) * 100;
            
            return { hedefFiyat: hedefFiyatTL, potansiyel: potansiyelNum, period: period };
        }
    }
    return null;
};

const renderHedef = (container) => {
    if (window.recalculateHedefFiyatlar) window.recalculateHedefFiyatlar();
    let rowsHtml = '';

    if (State.data.hedefFiyatlar || State.data.araDegerleme) {
        const fmtDec = (val) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(val);
        const fmtPct = (val) => { let num = val / 100; let formatted = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(Math.abs(val)); return val < 0 ? '%-' + formatted : '%' + formatted; };
        
        let allHisseler = new Set([...Object.keys(State.data.hedefFiyatlar || {}), ...Object.keys(State.data.araDegerleme || {})]);
        
        for (const hisse of Array.from(allHisseler).sort()) {
            const hData = State.data.hedefFiyatlar[hisse] || {};
            const gbhfData = window.getGBHF(hisse);
            
            let hasYillik = hData['2026'] || hData['2027'] || hData['2028'] || hData['2029'] || hData['2030'];
            if (!hasYillik && !gbhfData) continue;

            const guncelFiyat = parseFloat(State.getFiyat(hisse)) || 0;
            let guncelPct = 0;
            if (window.stockData && window.stockData[hisse]) {
                guncelPct = parseFloat(window.stockData[hisse].yuzde) || 0;
            }
            const gColor = guncelPct >= 0 ? '#2ecc71' : '#e74c3c';
            const guncelFiyatHtml = `<td style="text-align: right !important;">${fmtDec(guncelFiyat)}<br><span style="color:${gColor}; font-size:10px;">${guncelPct > 0 ? '+' : ''}${guncelPct.toFixed(2)}%</span></td>`;

            const renderCell = (year) => {
                if (!hData[year]) return `<td style="text-align: right !important;">-</td><td style="text-align: right !important;">-</td>`;
                const color = hData[year].potansiyel > 0 ? '#2ecc71' : '#e74c3c';
                return `<td style="text-align: right !important;">${fmtDec(hData[year].hedefFiyat)}</td><td style="text-align: right !important; color:${color} !important; font-weight:bold;">${fmtPct(hData[year].potansiyel)}</td>`;
            };

            let gbhfHtml = `<td style="text-align: right !important;">-</td><td style="text-align: right !important;">-</td>`;
            if (gbhfData) {
                const color = gbhfData.potansiyel > 0 ? '#2ecc71' : '#e74c3c';
                gbhfHtml = `<td style="text-align: right !important; color:${color} !important; font-weight:bold;" title="${gbhfData.period}">${fmtDec(gbhfData.hedefFiyat)}</td><td style="text-align: right !important; color:${color} !important; font-weight:bold;">${fmtPct(gbhfData.potansiyel)}</td>`;
            }

            rowsHtml += `<tr>
                <td style="text-align: center !important;">${sn++}</td>
                <td class="takip-hisse-link" style="text-align: left !important;" onclick="window.goToHisse('${hisse}')">${hisse}</td>
                ${guncelFiyatHtml}
                ${gbhfHtml}
                ${renderCell('2026')}
                ${renderCell('2027')}
                ${renderCell('2028')}
                ${renderCell('2029')}
                ${renderCell('2030')}
            </tr>`;
        }
    }

    if (!rowsHtml) {
        rowsHtml = `<tr><td colspan="9" style="text-align:center; padding:2rem; opacity:0.5;">Henüz hiçbir hisse için Hedef Fiyat hesaplaması (Değerleme girişi) yapılmamış.</td></tr>`;
    }


    container.innerHTML = `
        <div class="page-section active">
            <div class="table-container glass" style="margin-bottom: 0;">
                <div class="table-header">Hedef Fiyatlar</div>
                <table class="dash-table compact-table" style="min-width: 1000px;">
                    <thead>
                        <tr>
                            <th>S.N.</th>
                            <th>Hisse</th>
                            <th>Güncel Fiyat</th>
                            <th title="Gelecek Bilanço Hedef Fiyat">G.B.H.F.</th>
                            <th title="Gelecek Bilanço Potansiyeli">Pot.</th>
                            <th>2026<br>H.</th>
                            <th>2026<br>P.</th>
                            <th>2027<br>H.</th>
                            <th>2027<br>P.</th>
                            <th>2028<br>H.</th>
                            <th>2028<br>P.</th>
                            <th>2029<br>H.</th>
                            <th>2029<br>P.</th>
                            <th>2030<br>H.</th>
                            <th>2030<br>P.</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
            <p style="font-size:0.85rem; color:#aaa;"><i class="fas fa-info-circle"></i> Tablodaki değerler, Hisseler > Anasayfa > Değerleme panelinde girdiğiniz tahminlere göre otomatik hesaplanır ve buraya yansır.</p>
        </div>
    `;
};

window.goToHisse = (h) => {
    window.currentSelectedHisse = h;
    if (currentPage !== 'hisse_detay') window.currentHisseTab = 'Özet Rapor';
    document.querySelectorAll('#primary-sidebar .nav-btn').forEach(btn => btn.classList.remove('active'));
    currentPage = 'hisse_detay';
    if (typeof renderPage === 'function') renderPage();
    window.scrollTo(0, 0);
};

window.openHisseFromDropdown = (h) => {
    window.currentSelectedHisse = h;
    if (currentPage !== 'hisse_detay') window.currentHisseTab = 'Özet Rapor';
    window.hideHisseDropdown();
    document.querySelectorAll('#primary-sidebar .nav-btn').forEach(btn => btn.classList.remove('active'));
    currentPage = 'hisse_detay';
    if (typeof renderPage === 'function') renderPage();
    window.scrollTo(0, 0);
};

window.removeHisseFromTakip = (hisseKodu) => {
    document.getElementById('theme-confirm-message').innerText = hisseKodu + ' takip listesinden çıkarılacak. Emin misiniz?';
    window.themeConfirmAction = () => {
        State.removeTakip(hisseKodu);
        if (currentPage === 'anasayfa') renderPage();
        document.getElementById('hisse-sil-modal').style.display = 'none';
    };
    document.getElementById('theme-confirm-modal').style.display = 'flex';
};

// Takip Listesi Modal Functions
window.toggleTakipEditModal = (event) => {
    const modal = document.getElementById('takip-edit-modal');
    const glass = document.getElementById('takip-edit-glass');
    const btn = document.getElementById('takip-edit-btn');

    if (modal.style.display === 'block') {
        modal.style.display = 'none';
        if (btn) {
            btn.className = 'fas fa-pen';
            btn.innerHTML = '';
            btn.style.fontSize = '13px';
        }
    } else {
        modal.style.display = 'block';
        if (event && event.target) {
            const rect = (btn ? btn.getBoundingClientRect() : event.target.getBoundingClientRect());
            glass.style.top = (rect.bottom) + 'px';
            glass.style.left = (rect.right - 195) + 'px';
            glass.style.bottom = '20px';
        }
        if (btn) {
            btn.className = 'fas fa-pen';
            btn.innerHTML = '';
            btn.style.fontSize = '13px';
        }
        document.getElementById('takip-edit-arama-input').value = '';
        document.getElementById('takip-edit-autocomplete-list').style.display = 'none';
        window.renderTakipEditList();
        setTimeout(() => document.getElementById('takip-edit-arama-input').focus(), 100);
    }
};

window.renderTakipEditList = () => {
    const container = document.getElementById('takip-edit-list-container');
    if (!container) return;
    const list = (State.data.takipListesi || []).slice().sort((a, b) => a.localeCompare(b));

    if (list.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:var(--text-secondary); padding:1rem; font-size:13px;">Takip listeniz boş.</div>';
        return;
    }

    container.innerHTML = list.map(hisse => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.15rem 0.25rem; border-bottom: 1px solid var(--surface-border);">
              <span style="color: var(--text-secondary); font-weight: 500; font-size: 12px;">${hisse}</span>
                <i class="fas fa-trash-alt" style="cursor: pointer; color: var(--text-secondary); font-size: 12px; padding: 4px;" onclick="window.removeHisseFromTakipModal('${hisse}')"></i>
          </div>
      `).join('');
};

window.addHisseToTakipFromModal = () => {
    const input = document.getElementById('takip-edit-arama-input');
    if (!input) return;
    let val = input.value.trim().toUpperCase();
    if (!val) return;

    const validStocks = (State.bistStocks && State.bistStocks.length > 0) ? State.bistStocks : (window.defaultStocksArray || []);
    if (!validStocks.includes(val)) {
        alert('Geçersiz hisse kodu: ' + val);
        return;
    }

    if (!State.data.takipListesi) State.data.takipListesi = [];
    if (!State.data.takipListesi.includes(val)) {
        State.data.takipListesi.push(val);
        input.value = '';
        document.getElementById('takip-edit-autocomplete-list').style.display = 'none';
        State.save();
        window.renderTakipEditList();
        if (currentPage === 'anasayfa') renderPage();
    } else {
        alert('Bu hisse zaten takip listesinde.');
    }
};

window.removeHisseFromTakipModal = (hisse) => {
    State.removeTakip(hisse);
    State.save();
    window.renderTakipEditList();
    if (currentPage === 'anasayfa') renderPage();
};

window.toggleTakipSort = (col) => {
    if (!window.takipSort) window.takipSort = { col: null, asc: true };
    if (window.takipSort.col === col) {
        window.takipSort.asc = !window.takipSort.asc;
    } else {
        window.takipSort = { col: col, asc: true };
    }
    if (typeof renderPage === 'function') renderPage();
};

const getTakipSortIcon = (col) => {
    if (window.takipSort && window.takipSort.col === col) {
        return window.takipSort.asc ? ' <i class="fas fa-sort-up"></i>' : ' <i class="fas fa-sort-down"></i>';
    }
    return ' <i class="fas fa-sort" style="color: rgba(255,255,255,0.3);"></i>';
};

const renderAnasayfa = (container) => {
    try {
        window.takipTab = window.takipTab || 'degerleme';
    window.setTakipTab = window.setTakipTab || ((tab) => {
        window.takipTab = tab;
        if (typeof renderPage === 'function') renderPage();
    });

    if (window.recalculateHedefFiyatlar) window.recalculateHedefFiyatlar();
    let takipList = State.data.takipListesi ? [...State.data.takipListesi] : [];

    const fmtDec = (val) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(val);
    const fmtPct = (val) => { let num = val * 100; let formatted = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(Math.round(Math.abs(num))); return num < 0 ? '%-' + formatted : '%' + formatted; };
    const fmtNum = (val) => {
        if (val === 0 || isNaN(val) || !val) return '-';
        if (val >= 1000000000) return (val / 1000000000).toFixed(2) + ' Mlr';
        if (val >= 1000000) return (val / 1000000).toFixed(2) + ' M';
        return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(Math.round(val));
    };
    const fmtFullNum = (val) => {
        if (val === 0 || isNaN(val) || !val) return '-';
        return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(Math.round(val));
    };
    const fmtCurrency = (val, symbol) => {
        if (val === 0 || isNaN(val) || !val) return '-';
        return symbol + ' ' + new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(Math.round(val));
    };
    const fmtMet = (val) => {
        if (val === 0 || isNaN(val) || !val || !isFinite(val)) return '-';
        return fmtDec(val);
    };

    const dolarKuru = State.getFiyat('DOLAR') || 1;

    let takipDataList = takipList.map(hisse => {
        let fiyat = 0;
        let gunlukYuzde = null;
        const td = window.tickerData && window.tickerData[hisse];
        if (td) {
            fiyat = td.c || 0;
            gunlukYuzde = td.chp;
        } else {
            fiyat = State.getFiyat(hisse);
        }

        if (window.parseExcelData && (!window.stockData || !window.stockData[hisse] || !window.stockData[hisse].bilanco)) {
            try { window.parseExcelData(hisse); } catch (e) { }
        }

        let piyasaDegeri = 0, fdFavok = 0, fk = 0, pdDd = 0, firmaDegeri = 0;
        let araHedefFiyat = -Infinity, araPotansiyel = -Infinity, araPeriod = null;
        const sData = (window.stockData && window.stockData[hisse]) ? window.stockData[hisse] : null;

        if (sData) {
            const getVal = (sheet, rowName) => {
                if (!sheet || !sheet.rows) return 0;
                const searchStr = rowName.toLowerCase().replace(/[öçşğıü]/g, '');
                let exactRow = sheet.rows.find(r => r[0] && r[0].toString().toLowerCase().replace(/[öçşğıü]/g, '').trim() === searchStr.trim());
                const row = exactRow || sheet.rows.find(r => {
                    if (!r[0]) return false;
                    const t = r[0].toString().toLowerCase().replace(/[öçşğıü]/g, '');
                    if (searchStr.includes('sermaye') && (t.includes('fark') || t.includes('duzeltme'))) return false;
                    return t.includes(searchStr);
                });
                if (!row) return 0;
                const v = row[1];
                if (typeof v === 'number') return v;
                if (typeof v === 'string') {
                    const p = parseFloat(v.replace(/\./g, '').replace(/,/g, '.'));
                    return isNaN(p) ? 0 : p;
                }
                return 0;
            };

            const odenmisSermaye = getVal(sData.bilanco, 'Ödenmiş Sermaye');
            piyasaDegeri = fiyat * odenmisSermaye;

            let finansalBorclarTotal = 0;
            let nakitTotal = 0;
            if (sData.bilanco && sData.bilanco.rows) {
                sData.bilanco.rows.forEach(r => {
                    if (!r[0]) return;
                    const rName = r[0].toString().toLocaleLowerCase('tr-TR');
                    if (rName.includes('finansal borçlar') && !rName.includes('kısımlar') && !rName.includes('ksmlar') && (!sData.bilanco.rows.length || sData.bilanco.rows.indexOf(r) < sData.bilanco.rows.length - 2)) {
                        const val = typeof r[1] === 'number' ? r[1] : parseFloat((r[1] || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
                        finansalBorclarTotal += val;
                    }
                    if (rName.includes('nakit ve nakit benzerleri') || rName.includes('nakit ve nakit değerler')) {
                        const val = typeof r[1] === 'number' ? r[1] : parseFloat((r[1] || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
                        nakitTotal += val;
                    }
                });
            }
            const netBorc = finansalBorclarTotal - nakitTotal;
            firmaDegeri = piyasaDegeri + netBorc;

            let favok = 0;
            if (sData.gelirYillik && sData.gelirYillik.rows) {
                const fR = sData.gelirYillik.rows.find(x => x[0] && x[0].toString().toLocaleLowerCase('tr-TR').includes('favök'));
                if (fR) {
                    favok = typeof fR[1] === 'number' ? fR[1] : parseFloat((fR[1] || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
                }
            }
            if (favok === 0) favok = getVal(sData.gelirYillik, 'FAVÖK');
            fdFavok = favok !== 0 ? (firmaDegeri / favok) : 0;

            let yilliklandirilmisNetKar = 0;
            if (sData.gelirYillik && sData.gelirYillik.rows) {
                const nR = sData.gelirYillik.rows.find(x => x[0] && (x[0].toString().toLocaleLowerCase('tr-TR').includes('ana ortaklık payları') || x[0].toString().toLocaleLowerCase('tr-TR').includes('dönem net kar')));
                if (nR) {
                    yilliklandirilmisNetKar = typeof nR[1] === 'number' ? nR[1] : parseFloat((nR[1] || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
                }
            }
            if (yilliklandirilmisNetKar === 0) yilliklandirilmisNetKar = getVal(sData.gelirYillik, 'Net Dönem Karı');
            fk = yilliklandirilmisNetKar !== 0 ? (piyasaDegeri / yilliklandirilmisNetKar) : 0;

            let anaOrtaklikOzkaynaklar = 0;
            if (sData.bilanco && sData.bilanco.rows) {
                const aoRow = sData.bilanco.rows.find(x => x[0] && x[0].toString().toLocaleLowerCase('tr-TR').includes('ana ortaklığa ait özkaynaklar'));
                if (aoRow) {
                    anaOrtaklikOzkaynaklar = typeof aoRow[1] === 'number' ? aoRow[1] : parseFloat((aoRow[1] || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
                }
            }
            if (anaOrtaklikOzkaynaklar === 0) anaOrtaklikOzkaynaklar = getVal(sData.bilanco, 'Özkaynaklar');
            pdDd = anaOrtaklikOzkaynaklar !== 0 ? (piyasaDegeri / anaOrtaklikOzkaynaklar) : 0;

            araPeriod = null;
            const gbhfData = window.getGBHF(hisse);
            if (gbhfData) {
                araHedefFiyat = gbhfData.hedefFiyat;
                araPotansiyel = gbhfData.potansiyel / 100;
                araPeriod = gbhfData.period;
            }
        }

        const getPot = (year) => {
            if (State.data.hedefFiyatlar && State.data.hedefFiyatlar[hisse] && State.data.hedefFiyatlar[hisse][year]) {
                return State.data.hedefFiyatlar[hisse][year].potansiyel !== undefined ? State.data.hedefFiyatlar[hisse][year].potansiyel : -Infinity;
            }
            return -Infinity;
        };

        return {
            hisse, fiyat, gunlukYuzde, piyasaDegeri, piyasaDegeriUsd: piyasaDegeri / dolarKuru, firmaDegeri, fdFavok, fk, pdDd,
            araHedefFiyat, araPotansiyel, araPeriod,
            pot2026: getPot('2026'), pot2027: getPot('2027'),
            pot2028: getPot('2028'), pot2029: getPot('2029'), pot2030: getPot('2030')
        };
    });

    window.takipSort = window.takipSort || { col: null, asc: true };
    takipDataList.sort((a, b) => {
        const multiLevelSort = () => {
            if (b.araPotansiyel !== a.araPotansiyel) return b.araPotansiyel - a.araPotansiyel;
            if (b.pot2026 !== a.pot2026) return b.pot2026 - a.pot2026;
            if (b.pot2027 !== a.pot2027) return b.pot2027 - a.pot2027;
            if (b.pot2028 !== a.pot2028) return b.pot2028 - a.pot2028;
            if (b.pot2029 !== a.pot2029) return b.pot2029 - a.pot2029;
            if (b.pot2030 !== a.pot2030) return b.pot2030 - a.pot2030;
            return a.hisse.localeCompare(b.hisse);
        };

        if (!window.takipSort.col) {
            return multiLevelSort();
        }

        if (window.takipSort.col === 'hisse') {
            let diff = window.takipSort.asc ? a.hisse.localeCompare(b.hisse) : b.hisse.localeCompare(a.hisse);
            if (diff !== 0) return diff;
            return multiLevelSort();
        }

        let valA = a[window.takipSort.col];
        let valB = b[window.takipSort.col];
        if (valA === -Infinity) valA = -999999999;
        if (valB === -Infinity) valB = -999999999;
        
        let diff = window.takipSort.asc ? valA - valB : valB - valA;
        if (diff !== 0 && !isNaN(diff)) return diff;
        
        return multiLevelSort();
    });

    let rowsHtml = '';
    takipDataList.forEach((item, i) => {
        const { hisse, fiyat, gunlukYuzde, piyasaDegeri, piyasaDegeriUsd, firmaDegeri, fdFavok, fk, pdDd, araHedefFiyat, araPotansiyel, araPeriod, pot2026, pot2027, pot2028, pot2029, pot2030 } = item;

        const formatGunluk = (val) => {
            if (val === null || val === undefined || isNaN(val)) return `<td style="text-align: right !important;">-</td>`;
            const color = val > 0 ? '#2ecc71' : (val < 0 ? '#e74c3c' : 'var(--text-primary)');
            const formatted = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(val));
            const prefix = val > 0 ? '%+' : (val < 0 ? '%-' : '%');
            return `<td style="text-align: right !important; color:${color} !important; font-weight:bold;">${prefix}${formatted}</td>`;
        };

        const hData = State.data.hedefFiyatlar && State.data.hedefFiyatlar[hisse] ? State.data.hedefFiyatlar[hisse] : null;
        const renderCell = (year) => {
            if (!hData || !hData[year]) return `<td style="text-align: right !important;">-</td><td style="text-align: right !important;">-</td>`;
            const color = hData[year].potansiyel > 0 ? '#2ecc71' : '#e74c3c';
            return `<td style="text-align: right !important; color:${color} !important; font-weight:bold;">${fmtDec(hData[year].hedefFiyat)}</td><td style="text-align: right !important; color:${color} !important; font-weight:bold;">${fmtPct(hData[year].potansiyel)}</td>`;
        };

        const renderAraCell = (hf, pot, period) => {
            if (hf === -Infinity || pot === -Infinity) return `<td style="text-align: right !important;">-</td><td style="text-align: right !important;">-</td>`;
            const color = pot > 0 ? '#2ecc71' : '#e74c3c';
            return `<td style="text-align: right !important; color:${color} !important; font-weight:bold;">${fmtDec(hf)}</td><td style="text-align: right !important; color:${color} !important; font-weight:bold;">${fmtPct(pot)}</td>`;
        };

        const oranlarHtml = `
                <td style="text-align: right !important;">${fmtCurrency(piyasaDegeri, '₺')}</td>
                <td style="text-align: right !important;">${fmtCurrency(piyasaDegeriUsd, '$')}</td>
                <td style="text-align: right !important;">${fmtCurrency(firmaDegeri, '₺')}</td>
                <td style="text-align: right !important;">${fmtMet(fdFavok)}</td>
                <td style="text-align: right !important;">${fmtMet(fk)}</td>
                <td style="text-align: right !important;">${fmtMet(pdDd)}</td>
        `;

        const degerlemeHtml = `
                ${renderAraCell(araHedefFiyat, araPotansiyel, araPeriod)}
                ${renderCell('2026')}
                ${renderCell('2027')}
                ${renderCell('2028')}
                ${renderCell('2029')}
                ${renderCell('2030')}
        `;

        const restHtml = window.takipTab === 'degerleme' ? degerlemeHtml : oranlarHtml;

        rowsHtml += `
            <tr>
                <td style="text-align: center !important;">${i + 1}</td>
                <td class="takip-hisse-link" style="text-align: left !important;" onclick="window.goToHisse('${hisse}')">${hisse}</td>
                <td style="text-align: right !important;">${fmtDec(fiyat)}</td>
                ${formatGunluk(gunlukYuzde)}
                ${restHtml}
            </tr>
        `;
    });

    if (takipList.length === 0) {
        const colspan = window.takipTab === 'degerleme' ? 14 : 10;
        rowsHtml = `<tr><td colspan="${colspan}" style="text-align: center; padding: 2rem;">Takip listeniz boş. Kalem simgesine tıklayarak hisse ekleyebilirsiniz.</td></tr>`;
    }

    container.innerHTML = `
        <style>
            .takip-table th, .takip-table td {
                font-size: 12px !important;
                font-weight: normal !important;
            }
        </style>
        <div class="page-section active" style="display: flex; flex-direction: column; flex: 1; min-height: 0; padding: 0px;">

            <!-- Takip Listesi Tablosu -->
            <div class="glass" style="display: flex; flex-direction: column; flex: 1; overflow: hidden; padding: 0.5rem 1rem 1rem 1rem;">

                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; justify-content: space-between; align-items: center;">
                    <div style="display: flex; gap: 0.5rem;">
                        <span style="cursor: pointer; font-size: 12px; font-weight: normal; padding: 4px 8px; border-radius: 4px; color: ${window.takipTab === 'degerleme' ? 'var(--active-text-color)' : 'var(--text-secondary)'}; background: ${window.takipTab === 'degerleme' ? 'var(--overlay-bg)' : 'transparent'}" onclick="window.setTakipTab('degerleme')">Değerleme</span>
                        <span style="cursor: pointer; font-size: 12px; font-weight: normal; padding: 4px 8px; border-radius: 4px; color: ${window.takipTab === 'oranlar' ? 'var(--active-text-color)' : 'var(--text-secondary)'}; background: ${window.takipTab === 'oranlar' ? 'var(--overlay-bg)' : 'transparent'}" onclick="window.setTakipTab('oranlar')">Oranlar</span>
                    </div>
                    <span id="takip-edit-btn" class="fas fa-pen" style="color: var(--text-secondary); cursor: pointer; font-size: 13px; padding: 4px;" onclick="window.toggleTakipEditModal(event)"></span>
                </div>
                <div style="flex: 1; overflow: auto; min-height: 0; border-radius: 8px;">
                    <table class="dash-table compact-table takip-table" style="text-align: center; border-collapse: separate; border-spacing: 0;">
                        <thead style="position: sticky; top: 0; z-index: 10; background: var(--table-header-bg);">
                            <tr>
                                <th style="text-align: center;">S.N</th>
                                <th style="text-align: center; cursor: pointer; user-select: none;" onclick="window.toggleTakipSort('hisse')">Hisse${getTakipSortIcon('hisse')}</th>
                                <th style="text-align: center;">Fiyat</th>
                                <th style="text-align: center; cursor: pointer; user-select: none;" onclick="window.toggleTakipSort('gunlukYuzde')">Gün %${getTakipSortIcon('gunlukYuzde')}</th>
                                ${window.takipTab === 'degerleme' ? `
                                <th style="text-align: center; cursor: pointer; user-select: none;" onclick="window.toggleTakipSort('araHedefFiyat')" title="Gelecek Bilanço Hedef Fiyat">G. B. H. F.${getTakipSortIcon('araHedefFiyat')}</th>
                                <th style="text-align: center; cursor: pointer; user-select: none;" onclick="window.toggleTakipSort('araPotansiyel')" title="Gelecek Bilanço Potansiyel">G. B. Pot.${getTakipSortIcon('araPotansiyel')}</th>
                                <th style="text-align: center;" title="2026 Hedef Fiyat">2026 H. F.</th>
                                <th style="text-align: center; cursor: pointer; user-select: none;" onclick="window.toggleTakipSort('pot2026')" title="2026 Potansiyel">2026 Pot.${getTakipSortIcon('pot2026')}</th>
                                <th style="text-align: center;" title="2027 Hedef Fiyat">2027 H. F.</th>
                                <th style="text-align: center; cursor: pointer; user-select: none;" onclick="window.toggleTakipSort('pot2027')" title="2027 Potansiyel">2027 Pot.${getTakipSortIcon('pot2027')}</th>
                                <th style="text-align: center;" title="2028 Hedef Fiyat">2028 H. F.</th>
                                <th style="text-align: center; cursor: pointer; user-select: none;" onclick="window.toggleTakipSort('pot2028')" title="2028 Potansiyel">2028 Pot.${getTakipSortIcon('pot2028')}</th>
                                <th style="text-align: center;" title="2029 Hedef Fiyat">2029 H. F.</th>
                                <th style="text-align: center; cursor: pointer; user-select: none;" onclick="window.toggleTakipSort('pot2029')" title="2029 Potansiyel">2029 Pot.${getTakipSortIcon('pot2029')}</th>
                                <th style="text-align: center;" title="2030 Hedef Fiyat">2030 H. F.</th>
                                <th style="text-align: center; cursor: pointer; user-select: none;" onclick="window.toggleTakipSort('pot2030')" title="2030 Potansiyel">2030 Pot.${getTakipSortIcon('pot2030')}</th>
                                ` : `
                                <th style="text-align: center; cursor: pointer; user-select: none;" onclick="window.toggleTakipSort('piyasaDegeri')">Piyasa Değeri${getTakipSortIcon('piyasaDegeri')}</th>
                                <th style="text-align: center; cursor: pointer; user-select: none;" onclick="window.toggleTakipSort('piyasaDegeriUsd')">Piyasa Değeri $${getTakipSortIcon('piyasaDegeriUsd')}</th>
                                <th style="text-align: center; cursor: pointer; user-select: none;" onclick="window.toggleTakipSort('firmaDegeri')">Firma Değeri${getTakipSortIcon('firmaDegeri')}</th>
                                <th style="text-align: center; cursor: pointer; user-select: none;" onclick="window.toggleTakipSort('fdFavok')">FD/FAVÖK${getTakipSortIcon('fdFavok')}</th>
                                <th style="text-align: center; cursor: pointer; user-select: none;" onclick="window.toggleTakipSort('fk')">F/K${getTakipSortIcon('fk')}</th>
                                <th style="text-align: center; cursor: pointer; user-select: none;" onclick="window.toggleTakipSort('pdDd')">PD/DD${getTakipSortIcon('pdDd')}</th>
                                `}
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    } catch(err) {
        container.innerHTML = `<div style="padding: 20px; color: #ff6b6b; font-family: monospace; font-size: 14px;">
            <h3>Takip Listesi Yüklenirken Hata Oluştu!</h3>
            <p>${err.message}</p>
            <pre style="margin-top: 10px; color: #ffcccc;">${err.stack}</pre>
        </div>`;
    }
};

// --- APP ENTRY & ROUTING ---
let currentPage = 'anasayfa';




window.confirmAddHisse = () => {
    const input = document.getElementById('modal-hisse-input');
    if (!input) return;
    const hisseKodu = input.value.trim().toUpperCase();
    if (hisseKodu) {
        const defaultStocks = ["THYAO", "KCHOL", "TUPRS", "AKBNK", "GARAN", "ISCTR", "YKBNK", "SISE", "BIMAS", "FROTO", "EREGL", "SAHOL", "ASELS", "TCELL", "ENKAI", "PGSUS", "PETKM", "TOASO", "TTKOM", "ARCLK"];
        const validStocks = (State.bistStocks && State.bistStocks.length > 0) ? State.bistStocks : defaultStocks;
        if (!validStocks.includes(hisseKodu)) {
            alert('Lütfen geçerli bir BİST hisse kodu giriniz veya listeden seçiniz.');
            return;
        }
        if (!State.data.takipListesi) State.data.takipListesi = [];
        if (!State.data.takipListesi.includes(hisseKodu)) {
            State.data.takipListesi.push(hisseKodu);
            State.save();
        }
        window.currentSelectedHisse = hisseKodu;
        input.value = '';
        document.getElementById('hisse-modal').style.display = 'none';
        if (typeof window.updateGlobalHisseDropdown === 'function') window.updateGlobalHisseDropdown();
        if (typeof renderPage === 'function') renderPage();
    }
};




window.exportData = () => {
    const dataStr = JSON.stringify(State.data);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Yunvest_Yedek_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

window.forceSyncToWeb = () => {
    if (!currentUser) {
        alert("Web'e eşitlemek için giriş yapmalısınız!");
        return;
    }
    if (!State.data || !State.data.ekstre || State.data.ekstre.length === 0) {
        alert("Eşitlenecek yerel veri bulunamadı!");
        return;
    }
    if (confirm("Bu işlem bilgisayarınızdaki TÜM verileri zorla Web'e yükleyecek. Emin misiniz?")) {
        State.data.dataUpdated = Date.now();
        State.data.lastUpdated = Date.now() + (1000 * 60 * 60 * 24 * 365 * 10);
        db.collection('app_data').doc(currentUser.uid).set(State.data).then(() => {
            alert("Verileriniz başarıyla Web'e yüklendi! Artık telefonunuzdan veya webden görebilirsiniz.");
        }).catch(err => {
            alert("Hata oluştu: " + err.message);
        });
    }
};

window.importData = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const importedData = JSON.parse(ev.target.result);
            if (!importedData || typeof importedData !== 'object') throw new Error("Geçersiz veri");

            if (confirm("Bu işlem dosyadan yüklediğiniz verileri mevcut verilerinizle BİRLEŞTİRECEK (Nakit hareketleri, hisse notları vb. kaybolmayacak). Onaylıyor musunuz?")) {
                const mergeData = (target, source) => {
                    for (const key of Object.keys(source)) {
                        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                            if (!target[key]) target[key] = {};
                            mergeData(target[key], source[key]);
                        } else if (Array.isArray(source[key])) {
                            if (!target[key]) target[key] = [];
                            const combined = [...target[key], ...source[key]];
                            const unique = [];
                            const seen = new Set();
                            for (const item of combined) {
                                const str = JSON.stringify(item);
                                if (!seen.has(str)) {
                                    seen.add(str);
                                    unique.push(item);
                                }
                            }
                            target[key] = unique;
                        } else {
                            if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
                                target[key] = source[key];
                            }
                        }
                    }
                    return target;
                };

                State.data = mergeData(State.data || {}, importedData);
                State.save();
                alert("Veriler başarıyla birleştirildi!");
                if (typeof renderPage === 'function') renderPage();
            }
        } catch (err) {
            alert("Dosya okunamadı: " + err.message);
        }
        e.target.value = '';
    };
    reader.readAsText(file);
};

let notSaveTimeout;
window.saveHisseNotu = (hisse, not) => {
    if (!State.data.hisseNotlari) State.data.hisseNotlari = {};
    State.data.hisseNotlari[hisse] = not;

    // Save locally immediately
    localStorage.setItem('borsa_app_data', JSON.stringify(State.data));

    // Debounce the full save (Firebase sync)
    clearTimeout(notSaveTimeout);
    notSaveTimeout = setTimeout(() => {
        State.save();
    }, 1500);
};

window.confirmRemoveHisse = () => {
    const input = document.getElementById('modal-hisse-sil-input');
    if (!input) return;
    const hisseKodu = input.value.trim().toUpperCase();
    if (hisseKodu) {
        if (State.data.takipListesi && State.data.takipListesi.includes(hisseKodu)) {
            State.removeTakip(hisseKodu);
            if (window.currentSelectedHisse === hisseKodu) {
                window.currentSelectedHisse = null;
            }
            if (typeof window.updateGlobalHisseDropdown === 'function') window.updateGlobalHisseDropdown();
            if (typeof renderPage === 'function') renderPage();
            document.getElementById('hisse-sil-modal').style.display = 'none';
            input.value = '';
        } else {
            alert(hisseKodu + ' takip listesinde bulunamadı!');
        }
    }
};

window.openRemoveModal = () => {
    const silModal = document.getElementById('hisse-sil-modal');
    const silInput = document.getElementById('modal-hisse-sil-input');
    if (silModal && silInput) {
        if (State.data.takipListesi) {
            silInput.innerHTML = State.data.takipListesi.map(h => `<option value="${h}">${h}</option>`).join('');
        }
        silModal.style.display = 'flex';
        if (window.currentSelectedHisse && State.data.takipListesi && State.data.takipListesi.includes(window.currentSelectedHisse)) {
            silInput.value = window.currentSelectedHisse;
        }
        window.hideHisseDropdown();
        silInput.focus();
    }
};

window.removeTakip = (hisse) => {
    if (!hisse) return;
    if (confirm(hisse + ' hissesini takip listesinden çıkarmak istediğinize emin misiniz?')) {
        State.removeTakip(hisse);
        window.currentSelectedHisse = null;
        if (typeof window.updateGlobalHisseDropdown === 'function') window.updateGlobalHisseDropdown();
        if (typeof renderPage === 'function') renderPage();
    }
};

window.showHisseDropdown = () => {
    const el = document.getElementById('global-hisse-dropdown');
    if (el) el.style.display = 'flex';
};

window.hideHisseDropdown = () => {
    const el = document.getElementById('global-hisse-dropdown');
    if (el) el.style.display = 'none';
};

window.openHisseFromDropdown = (h) => {
    window.currentSelectedHisse = h;
    if (currentPage !== 'hisse_detay') window.currentHisseTab = 'Özet Rapor';

    // Bypass the button click entirely to avoid event quirks
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    currentPage = 'hisse_detay';
    if (typeof renderPage === 'function') renderPage();
    window.hideHisseDropdown();
};

window.updateGlobalHisseDropdown = () => {
    const hisseDropdown = document.getElementById('global-hisse-dropdown');
    if (hisseDropdown && State.data && State.data.takipListesi) {
        let dropdownHtml = '';
        const sortedTakip = [...State.data.takipListesi].sort((a, b) => a.localeCompare(b));
        sortedTakip.forEach(h => {
            dropdownHtml += `<div class="hisse-menu-item" style="padding: 0.3rem 0.8rem; cursor: pointer; border-bottom: 1px solid var(--table-border); font-size: 13px; color: #eee;" onclick="window.openHisseFromDropdown('${h}')">${h}</div>`;
        });
        dropdownHtml += `<div style="display:flex; justify-content:flex-end; align-items:center; padding: 0.3rem 0.8rem;">
            <div style="font-size: 1rem; font-weight:bold; cursor: pointer; color: var(--accent-color);" onclick="document.getElementById('hisse-modal').style.display='flex'; window.hideHisseDropdown(); document.getElementById('modal-hisse-input').focus();">+</div>
            <div style="font-size: 1.5rem; font-weight:bold; cursor: pointer; color: #ff6b6b; margin-top:-4px;" onclick="window.openRemoveModal()">-</div>
        </div>`;
        hisseDropdown.innerHTML = dropdownHtml;
    }
};


window.goToAyarlar = () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    currentPage = 'ayarlar';
    if (typeof renderPage === 'function') renderPage();
    window.scrollTo(0, 0);
};

// deleted bad goToGiris


window.toggleSidebar = () => {
    const sidebar = document.getElementById('primary-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('show-mobile');
            if (overlay) overlay.classList.toggle('show-mobile');
        } else {
            sidebar.classList.toggle('collapsed');
        }
    }
};

window.openSecondarySidebar = (title) => {
    const sidebar = document.getElementById('secondary-sidebar');
    const titleEl = document.getElementById('secondary-sidebar-title');
    if (sidebar && titleEl) {
        titleEl.innerText = title;
        sidebar.style.display = 'flex';
    }
};

window.closeSecondarySidebar = () => {
    const sidebar = document.getElementById('secondary-sidebar');
    if (sidebar) sidebar.style.display = 'none';
};

window.goToAnasayfa = () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const homeBtn = document.querySelector('.nav-btn[data-target="anasayfa"]');
    if (homeBtn) homeBtn.classList.add('active');
    currentPage = 'anasayfa';
    if (typeof renderPage === 'function') renderPage();
};

let renderPageTimer = null;
const renderPage = () => {
    if (renderPageTimer) cancelAnimationFrame(renderPageTimer);
    renderPageTimer = requestAnimationFrame(() => {
        _renderPageActual();
    });
};

const _renderPageActual = () => {
    // update active nav
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.nav-btn[data-target="${currentPage}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    const container = document.getElementById('main-content');
    if (!container) return;

    if (window.Chart) {
        Object.values(Chart.instances).forEach(chart => {
            if (chart) chart.destroy();
        });
        window.chartOzetInstance = null;
        window.chartVarliklarInstance = null;
        window.chartPortfoyGecmisiInstance = null;
    }

    // Top Bar visibility:
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
        topBar.style.display = currentPage === 'anasayfa' ? 'flex' : 'none';
    }

    switch (currentPage) {
        case 'anasayfa': renderAnasayfa(container); break;
        case 'portfoy': renderPortfoy(container); break;
        case 'hedef': renderHedef(container); break;
        case 'hisse_islemleri': renderHisseIslemleri(container); break;
        case 'nakit_islemleri': renderNakitIslemleri(container); break;
        case 'veriler': renderVeriler(container); break;
        case 'notlar': renderNotlar(container); break;
        case 'analizler': renderAnalizler(container); break;
        case 'hisse_detay': renderHisseler(container); break;
        case 'ayarlar': renderAyarlar(container); break;
        default: renderAnasayfa(container); break;
    }
};

// --- NOTLAR SAYFASI ---
window.renderNotlar = (container) => {
    container.innerHTML = `
        <div class="header-section" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0px;">
            <h2 style="margin: 0; font-size: 17px; font-weight: 700; background: linear-gradient(90deg, #fff, #aaa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Notlarım</h2>
            <button class="btn" style="background: var(--accent-color); color: #fff;" onclick="window.openNoteModal()"><i class="fas fa-plus"></i> Yeni Not Ekle</button>
        </div>
        <div id="notes-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; align-items: start; margin-top: -10px;">
        </div>
    `;

    const grid = document.getElementById('notes-grid');
    const notes = State.data.notlar || [];

    if (notes.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 4rem 1rem; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
            <i class="fas fa-sticky-note" style="font-size: 3rem; opacity: 0.5; margin-bottom: 1rem;"></i><br>
            Henüz hiç not eklemediniz.<br>
            <span style="font-size: 0.9rem; opacity: 0.7;">Fikirlerinizi, al-sat stratejilerinizi veya hatırlatıcılarınızı buraya kaydedebilirsiniz.</span>
        </div>`;
    } else {
        notes.sort((a, b) => b.timestamp - a.timestamp).forEach(note => {
            const card = document.createElement('div');
            card.className = 'dash-card';
            card.style.cssText = `position: relative; display: flex; flex-direction: column; background: var(--surface-color); padding: 1.5rem; border-radius: 12px; border-left: 4px solid ${note.color || 'var(--accent-color)'}; box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: transform 0.2s, box-shadow 0.2s;`;
            card.onmouseover = () => { card.style.transform = 'translateY(-3px)'; card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.4)'; };
            card.onmouseout = () => { card.style.transform = 'none'; card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'; };

            const dateStr = new Date(note.timestamp).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

            const urlRegex = /(https?:\/\/[^\s<]+)/g;
            const formattedContent = (note.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>').replace(urlRegex, '<a href="$1" target="_blank" style="color: #3498db; text-decoration: underline;">$1</a>');
            const formattedTitle = (note.title || 'Başlıksız').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <h3 style="margin: 0; font-size: 12px; font-weight: normal; color: var(--text-primary); word-break: break-word;">${formattedTitle}</h3>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: -0.2rem; margin-right: -0.5rem;">
                        <button class="btn" style="background: transparent; color: var(--danger-color); padding: 0.2rem 0.5rem; font-size: 12px;" onclick="window.deleteNote('${note.id}')" title="Sil"><i class="fas fa-trash-alt"></i></button>
                        <div style="position: relative;">
                            <button class="btn" style="background: transparent; color: var(--text-secondary); padding: 0.2rem 0.5rem; font-size: 12px;" onclick="window.toggleNoteColorMenu('${note.id}', event)" title="Renk Seçenekleri"><i class="fas fa-ellipsis-v"></i></button>
                            <div id="note-color-menu-${note.id}" style="display: none; position: absolute; right: 0; top: 100%; background: #2c2c2e; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; box-shadow: 0 8px 25px rgba(0,0,0,0.7); z-index: 10; padding: 0.5rem; min-width: 150px;">
                                <div style="display: flex; gap: 0.4rem; justify-content: space-between;">
                                    <div class="color-swatch" style="width:18px; height:18px; border-radius:50%; background:#3498db; cursor:pointer;" onclick="window.changeNoteColor('${note.id}', '#3498db')"></div>
                                    <div class="color-swatch" style="width:18px; height:18px; border-radius:50%; background:#2ecc71; cursor:pointer;" onclick="window.changeNoteColor('${note.id}', '#2ecc71')"></div>
                                    <div class="color-swatch" style="width:18px; height:18px; border-radius:50%; background:#e74c3c; cursor:pointer;" onclick="window.changeNoteColor('${note.id}', '#e74c3c')"></div>
                                    <div class="color-swatch" style="width:18px; height:18px; border-radius:50%; background:#f1c40f; cursor:pointer;" onclick="window.changeNoteColor('${note.id}', '#f1c40f')"></div>
                                    <div class="color-swatch" style="width:18px; height:18px; border-radius:50%; background:#9b59b6; cursor:pointer;" onclick="window.changeNoteColor('${note.id}', '#9b59b6')"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="note-content-display-${note.id}" style="color: var(--text-secondary); font-size: calc(0.95rem - 3px); line-height: 1.6; word-break: break-word; margin-bottom: 6px; cursor: text;" ondblclick="window.enterNoteEditMode('${note.id}')">${formattedContent}</div>
                <textarea id="note-content-edit-${note.id}" class="form-control" style="display:none; width: 100%; font-size: calc(0.95rem - 3px); line-height: 1.6; font-family: inherit; resize: vertical; margin-bottom: 6px; min-height: 100px; box-sizing: border-box;" onblur="window.saveNoteInline('${note.id}')"></textarea>
                <div style="font-size: 0.75rem; color: #777; text-align: right; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 6px; margin-bottom: -0.5rem;"><i class="far fa-clock"></i> ${dateStr}</div>
            `;
            grid.appendChild(card);
        });
    }

    if (!document.getElementById('note-modal')) {
        const modal = document.createElement('div');
        modal.id = 'note-modal';
        modal.className = 'app-container';
        modal.style.cssText = 'display: none; justify-content: center; align-items: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); z-index: 2000; opacity: 0; transition: opacity 0.3s;';
        modal.innerHTML = `
            <div class="glass" style="width: 90%; max-width: 500px; height: 700px; display: flex; flex-direction: column; padding: 1rem; border-radius: 8px; position: relative; transform: scale(0.95); transition: transform 0.3s;">
                <h3 id="note-modal-title" style="margin-top: 0; margin-bottom: 0.8rem; color: var(--text-primary); font-size: calc(1.2rem - 3px); flex-shrink: 0;">Yeni Not Ekle</h3>
                <input type="hidden" id="note-id-input" value="">
                <input type="text" id="note-title-input" placeholder="Not Başlığı (İsteğe bağlı)" style="width: 100%; padding: 0.5rem; margin-bottom: 0.5rem; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: var(--text-primary); outline: none; font-size: calc(1.2rem - 3px); flex-shrink: 0;">
                <textarea id="note-content-input" placeholder="Notunuzu buraya yazın..." style="width: 100%; flex: 1; padding: 0.5rem; margin-bottom: 0.5rem; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: var(--text-primary); outline: none; font-family: inherit; font-size: calc(0.95rem - 3px); resize: none; line-height: 1.4;"></textarea>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.8rem; align-items: center; flex-shrink: 0;">
                    <label style="color: #ccc; font-size: calc(0.95rem - 3px);">Etiket Rengi:</label>
                    <div style="display: flex; gap: 0.3rem;" id="note-color-picker">
                        <div class="color-swatch active" data-color="#3498db" style="width:18px; height:18px; border-radius:50%; background:#3498db; cursor:pointer; border: 2px solid #fff;"></div>
                        <div class="color-swatch" data-color="#2ecc71" style="width:18px; height:18px; border-radius:50%; background:#2ecc71; cursor:pointer; border: 2px solid transparent;"></div>
                        <div class="color-swatch" data-color="#e74c3c" style="width:18px; height:18px; border-radius:50%; background:#e74c3c; cursor:pointer; border: 2px solid transparent;"></div>
                        <div class="color-swatch" data-color="#f1c40f" style="width:18px; height:18px; border-radius:50%; background:#f1c40f; cursor:pointer; border: 2px solid transparent;"></div>
                        <div class="color-swatch" data-color="#9b59b6" style="width:18px; height:18px; border-radius:50%; background:#9b59b6; cursor:pointer; border: 2px solid transparent;"></div>
                    </div>
                    <input type="hidden" id="note-color-input" value="#3498db">
                </div>
                <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                    <button class="btn" style="flex: 1; background: var(--success-color); padding: 0.4rem; font-size: calc(0.95rem - 3px);" onclick="window.saveNote()"><i class="fas fa-check"></i> Kaydet</button>
                    <button class="btn" style="flex: 1; background: rgba(255,255,255,0.1); padding: 0.4rem; font-size: calc(0.95rem - 3px);" onclick="window.closeNoteModal()">İptal</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.querySelectorAll('#note-color-picker .color-swatch').forEach(sw => {
            sw.addEventListener('click', (e) => {
                document.querySelectorAll('#note-color-picker .color-swatch').forEach(s => s.style.border = '2px solid transparent');
                e.target.style.border = '2px solid #fff';
                document.getElementById('note-color-input').value = e.target.getAttribute('data-color');
            });
        });
    }
};

window.enterNoteEditMode = (id) => {
    const displayDiv = document.getElementById(`note-content-display-${id}`);
    const editArea = document.getElementById(`note-content-edit-${id}`);
    if (displayDiv && editArea) {
        const note = State.data.notlar.find(n => n.id === id);
        if (note) {
            editArea.value = note.content || '';

            // Set the exact height before switching display
            const rect = displayDiv.getBoundingClientRect();
            editArea.style.height = Math.max(100, rect.height) + 'px';

            displayDiv.style.display = 'none';
            editArea.style.display = 'block';
            editArea.focus();
        }
    }
};

window.saveNoteInline = (id) => {
    const editArea = document.getElementById(`note-content-edit-${id}`);
    if (editArea) {
        const note = State.data.notlar.find(n => n.id === id);
        if (note && note.content !== editArea.value) {
            note.content = editArea.value;
            note.timestamp = Date.now();
            State.save();
            if (currentPage === 'notlar') renderPage();
        } else {
            const displayDiv = document.getElementById(`note-content-display-${id}`);
            if (displayDiv) {
                editArea.style.display = 'none';
                displayDiv.style.display = 'block';
            }
        }
    }
};

window.changeNoteColor = (id, color) => {
    const note = State.data.notlar.find(n => n.id === id);
    if (note) {
        note.color = color;
        State.save();
        if (currentPage === 'notlar') renderPage();
    }
};

window.openNoteModal = () => {
    document.getElementById('note-modal-title').innerText = 'Yeni Not Ekle';
    document.getElementById('note-id-input').value = '';
    document.getElementById('note-title-input').value = '';
    document.getElementById('note-content-input').value = '';

    const swatches = document.querySelectorAll('#note-color-picker .color-swatch');
    if (swatches.length > 0) {
        swatches.forEach(s => s.style.border = '2px solid transparent');
        swatches[0].style.border = '2px solid #fff';
        document.getElementById('note-color-input').value = swatches[0].getAttribute('data-color');
    }

    const modal = document.getElementById('note-modal');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('.glass').style.transform = 'scale(1)';
        document.getElementById('note-content-input').focus();
    }, 10);
};

window.closeNoteModal = () => {
    const modal = document.getElementById('note-modal');
    modal.style.opacity = '0';
    modal.querySelector('.glass').style.transform = 'scale(0.95)';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
};

window.saveNote = () => {
    const id = document.getElementById('note-id-input').value;
    const title = document.getElementById('note-title-input').value.trim();
    const content = document.getElementById('note-content-input').value.trim();
    const color = document.getElementById('note-color-input').value;

    if (!content) {
        const contentInput = document.getElementById('note-content-input');
        contentInput.style.borderColor = 'var(--danger-color)';
        setTimeout(() => contentInput.style.borderColor = 'rgba(255,255,255,0.1)', 2000);
        return;
    }

    if (!State.data.notlar) State.data.notlar = [];

    if (id) {
        const existing = State.data.notlar.find(n => n.id === id);
        if (existing) {
            existing.title = title;
            existing.content = content;
            existing.color = color;
            existing.timestamp = Date.now();
        }
    } else {
        State.data.notlar.push({
            id: 'note_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            title: title,
            content: content,
            color: color,
            timestamp: Date.now()
        });
    }

    State.save();
    window.closeNoteModal();
    if (currentPage === 'notlar') {
        setTimeout(() => renderPage(), 300);
    }
};

window.deleteNote = (id) => {
    if (!confirm('Bu notu silmek istediğinize emin misiniz?')) return;
    if (State.data.notlar) {
        State.data.notlar = State.data.notlar.filter(n => n.id !== id);
        State.save();
        if (currentPage === 'notlar') renderPage();
    }
};

window.toggleNoteColorMenu = (id, event) => {
    event.stopPropagation();
    const menu = document.getElementById('note-color-menu-' + id);
    if (!menu) return;
    const isVisible = menu.style.display === 'block';

    document.querySelectorAll('[id^="note-color-menu-"]').forEach(m => m.style.display = 'none');

    if (!isVisible) {
        menu.style.display = 'block';
    }
};

if (!window.noteMenuListenerAdded) {
    document.addEventListener('click', (e) => {
        if (!e.target.closest('[id^="note-color-menu-"]') && !e.target.closest('button[onclick^="window.toggleNoteColorMenu"]')) {
            document.querySelectorAll('[id^="note-color-menu-"]').forEach(m => m.style.display = 'none');
        }
    });
    window.noteMenuListenerAdded = true;
}

// --- TICKER DATA ---

window.fetchTickerData = async () => {
    try {
        let tData = {};
        try {
            const trRes = await fetch('https://scanner.tradingview.com/global/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ symbols: { tickers: ['OANDA:XAUUSD', 'FX:USDTRY', 'FX_IDC:EURTRY'] }, columns: ['close', 'change'] })
            });
            if (trRes.ok) {
                const trJson = await trRes.json();
                const usd = trJson.data.find(x => x.s === 'FX:USDTRY');
                const eur = trJson.data.find(x => x.s === 'FX_IDC:EURTRY');
                const ons = trJson.data.find(x => x.s === 'OANDA:XAUUSD');

                if (usd) tData['USD'] = { Selling: usd.d[0].toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), Change: usd.d[1] };
                if (eur) tData['EUR'] = { Selling: eur.d[0].toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), Change: eur.d[1] };
                if (ons) tData['ons'] = { Selling: ons.d[0].toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), Change: ons.d[1] };

                if (usd && ons) {
                    const graPrice = (ons.d[0] * usd.d[0]) / 31.1035;
                    const graChange = ((1 + ons.d[1] / 100) * (1 + usd.d[1] / 100) - 1) * 100;
                    tData['gram-altin'] = { Selling: graPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), Change: graChange };
                }
            }
        } catch (e) { console.error(e); }

        let xu100 = null, brent = null;

        const renderTicker = () => {
            const items = [
                { id: 'XU100', label: 'XU100', data: xu100 || { Selling: '...', Change: null } },
                { id: 'USD', label: 'USDTRY', data: tData['USD'] },
                { id: 'EUR', label: 'EURTRY', data: tData['EUR'] },
                { id: 'GRA', label: 'GRAMALTIN', data: tData['gram-altin'] },
                { id: 'ONS', label: 'XAUUSD', data: tData['ons'] },
                { id: 'BRENT', label: 'BRENTPETROL', data: brent || { Selling: '...', Change: null } }
            ];

            const tickerBar = document.getElementById('ticker-bar');
            if (tickerBar) {
                tickerBar.innerHTML = items.map(item => {
                    if (!item.data || (!item.data.Selling && !item.data.Buying)) return '';

                    let changeHtml = '';
                    if (item.data.Change !== null && item.data.Change !== undefined) {
                        let changeStr = String(item.data.Change).replace('%', '').replace(',', '.');
                        const change = parseFloat(changeStr);
                        const color = change > 0 ? 'var(--success-color)' : (change < 0 ? 'var(--danger-color)' : 'var(--text-secondary)');
                        let displayChange = change.toFixed(2).replace('.', ',');
                        if (change > 0 && !displayChange.startsWith('+')) displayChange = '+' + displayChange;
                        changeHtml = `<span style="font-size: 12px; font-weight: 400; color: ${color}; margin-left: 0.3rem;">%${displayChange}</span>`;
                    }

                    const val = item.data.Selling || item.data.Buying || 0;

                    return `<div style="display: flex; flex-direction: column; align-items: flex-start; min-width: 100px; flex: 1; justify-content: center;">
                        <span style="color: var(--text-secondary); font-size: 12px; font-weight: 500; margin-bottom: 0.1rem; letter-spacing: 0.5px;">${item.label}</span>
                        <div style="font-size: 12px; font-weight: 400; color: var(--text-primary);">
                            ${val} ${changeHtml}
                        </div>
                    </div>`;
                }).join('');
            }
        };

        // İlk render (Truncgil verileri + Loading yazıları)
        renderTicker();

        const fetchTV = async (market, symbol) => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2500);
                const r = await fetch(`https://scanner.tradingview.com/${market}/scan`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ symbols: { tickers: [symbol] }, columns: ['close', 'change'] }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                const d = await r.json();
                if (d.data && d.data.length > 0) {
                    const price = d.data[0].d[0];
                    const change = d.data[0].d[1];
                    return {
                        Selling: price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                        Change: change.toFixed(2).replace('.', ',')
                    };
                }
            } catch (e) { }
            return null;
        };

        // XU100 ve BRENT'i arka planda çekip tekrar renderla
        Promise.all([fetchTV('turkey', 'BIST:XU100'), fetchTV('global', 'FX:UKOIL')]).then(([x, b]) => {
            if (x) xu100 = x;
            if (b) brent = b;
            renderTicker();
        });

    } catch (e) {
        console.error('Ticker verisi alınamadı:', e);
    }
};

let isAppInitialized = false;
const initApp = () => {
    if (isAppInitialized) return;
    isAppInitialized = true;

    ensureDatalist();

    const savedTheme = localStorage.getItem('borsa_theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);

    const navButtons = document.querySelectorAll('.nav-btn[data-target]');
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.getAttribute('data-target');
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPage = target;
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('primary-sidebar');
                const overlay = document.querySelector('.sidebar-overlay');
                if (sidebar) sidebar.classList.remove('show-mobile');
                if (overlay) overlay.classList.remove('show-mobile');
            }
            renderPage();
        });
    });

    // İlk açılışta fiyatları webden al
    if (window.fetchGuncelFiyatlar) {
        window.fetchGuncelFiyatlar();
        // İsteğe bağlı olarak her 5 dakikada bir güncelleyebiliriz
        setInterval(window.fetchGuncelFiyatlar, 5 * 60 * 1000);
    }

    if (window.fetchTickerData) {
        window.fetchTickerData();
        setInterval(window.fetchTickerData, 5 * 60 * 1000);
    }
};

// --- AUTHENTICATION ---
let isLoginMode = true;

const toggleAuthMode = () => {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? 'Giriş Yap' : 'Kayıt Ol';
    document.getElementById('auth-submit-btn').innerText = isLoginMode ? 'Giriş Yap' : 'Kayıt Ol';
    document.getElementById('auth-toggle').innerHTML = isLoginMode ?
        'Hesabınız yok mu? <span style="color: var(--accent-color);">Kayıt Olun</span>' :
        'Zaten hesabınız var mı? <span style="color: var(--accent-color);">Giriş Yapın</span>';

    document.getElementById('auth-name').style.display = isLoginMode ? 'none' : 'block';
    document.getElementById('auth-phone').style.display = isLoginMode ? 'none' : 'block';
    if (!isLoginMode) {
        document.getElementById('auth-name').required = true;
        document.getElementById('auth-phone').required = true;
    } else {
        document.getElementById('auth-name').required = false;
        document.getElementById('auth-phone').required = false;
    }
};

document.getElementById('auth-toggle').addEventListener('click', toggleAuthMode);

document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) { errorDiv.style.display = 'none'; errorDiv.innerText = ''; }
    const btn = document.getElementById('auth-submit-btn');
    const originalBtnText = btn.innerText;
    btn.innerText = 'Bekleyiniz...';
    btn.disabled = true;

    if (isLoginMode) {
        auth.signInWithEmailAndPassword(email, password).catch(err => {
            if (errorDiv) { errorDiv.style.display = 'block'; errorDiv.innerText = "Hata: " + err.message; }
            else alert(err.message);
            btn.innerText = originalBtnText;
            btn.disabled = false;
        });
    } else {
        if (errorDiv) { errorDiv.style.display = 'block'; errorDiv.innerText = "Yeni üye alımı güvenlik nedeniyle kapatılmıştır."; }
        else alert("Yeni üye alımı güvenlik nedeniyle kapatılmıştır.");
        btn.innerText = originalBtnText;
        btn.disabled = false;
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('borsa_app_data');
    for (let i = 1; i <= 4; i++) {
        localStorage.removeItem('borsa_app_data_backup_' + i);
    }
    localStorage.removeItem('borsa_state');
    auth.signOut().then(() => {
        window.location.reload();
    });
});

// Auth Listener
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        let displayName = user.displayName;
        if (!displayName && user.email) {
            displayName = user.email.split('@')[0];
            displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        }
        const unEl = document.getElementById('user-name');
        if (unEl) unEl.innerText = displayName || 'Kullanıcı';

        window.setTheme = (newTheme) => {
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('borsa_theme', newTheme);
        };
        initApp();
        State.init(renderPage);
    } else {
        currentUser = null;
        if (State.unsubscribe) State.unsubscribe();
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
    }
});


document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#primary-sidebar .nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.getAttribute('data-target');
            if (target) {
                currentPage = target;
                if (target !== 'hisse_detay') window.closeSecondarySidebar();
                renderPage();
            }
        });
    });
});


// Setup Custom Autocomplete for Search Box
const setupSearchAutocomplete = () => {
    const input = document.getElementById('takip-edit-arama-input');
    const list = document.getElementById('takip-edit-autocomplete-list');
    if (!input || !list) return;

    if (input._searchAutocompleteHandler) {
    input.removeEventListener('input', input._searchAutocompleteHandler);
}
input._searchAutocompleteHandler = function () {
        let val = this.value.toUpperCase();
        list.innerHTML = '';
        if (!val) {
            list.style.display = 'none';
            return;
        }

        const validStocks = (State.bistStocks && State.bistStocks.length > 0) ? State.bistStocks : (window.defaultStocksArray || []);

        let matches = validStocks.filter(s => s.startsWith(val));
        if (matches.length === 0) {
            list.style.display = 'none';
            return;
        }

        matches.slice(0, 10).forEach(hisse => {
            let div = document.createElement('div');
            div.innerHTML = `<strong style="color: var(--text-primary);">${hisse.substr(0, val.length)}</strong>${hisse.substr(val.length)}`;
            div.style.padding = '0.5rem 1rem';
            div.style.cursor = 'pointer';
            div.style.fontSize = '12px';
            div.style.color = 'var(--text-secondary)';
            div.className = 'autocomplete-item';
            div.onmouseover = () => div.style.background = 'rgba(255,255,255,0.1)';
            div.onmouseout = () => div.style.background = 'transparent';

            div.addEventListener('mousedown', function (e) {
                e.stopPropagation();
                input.value = hisse;
                list.style.display = 'none';
            });
            list.appendChild(div);
        });
        list.style.display = 'flex';
    };
input.addEventListener('input', input._searchAutocompleteHandler);

    // Hide when clicking outside
    if (window.takipEditListener) {
        document.removeEventListener('click', window.takipEditListener);
    }
    window.takipEditListener = function (e) {
        if (e.target !== input && e.target !== list) {
            list.style.display = 'none';
        }
    };
    document.addEventListener('click', window.takipEditListener);
};

setTimeout(setupSearchAutocomplete, 1000);

let takipHideTimeout = null;

window.showSidebarTakip = (btn) => {
    if (takipHideTimeout) clearTimeout(takipHideTimeout);
    const dropdown = document.getElementById('sidebar-takip-dropdown');
    if (!dropdown) return;

    const takipList = (State.data.takipListesi || []).slice().sort((a, b) => a.localeCompare(b));
    if (takipList.length === 0) {
        dropdown.innerHTML = '<div style="padding: 0.5rem; color: var(--text-secondary); font-size: 12px; white-space: nowrap; text-align: center;">Listeniz boş</div>';
    } else {
        dropdown.innerHTML = takipList.map(hisse =>
            `<button class="nav-btn" style="text-align: left; width: 100%; border-radius: 4px; font-size: 12px; padding: 0.5rem 1rem;" onclick="window.goToHisse('${hisse}'); if(window.hideSidebarTakip) window.hideSidebarTakip(true);">${hisse}</button>`
        ).join('');
    }

    const rect = btn.getBoundingClientRect();
    dropdown.style.left = (rect.right - 5) + 'px';
    dropdown.style.top = rect.top + 'px';
    dropdown.style.display = 'flex';
};

window.hideSidebarTakip = (immediate) => {
    if (immediate === true) {
        const dropdown = document.getElementById('sidebar-takip-dropdown');
        if (dropdown) dropdown.style.display = 'none';
        return;
    }
    takipHideTimeout = setTimeout(() => {
        const dropdown = document.getElementById('sidebar-takip-dropdown');
        if (dropdown) dropdown.style.display = 'none';
    }, 300);
};

window.cancelHideTakip = () => {
    if (takipHideTimeout) clearTimeout(takipHideTimeout);
};












window.recalculateHedefFiyatlar = () => {
    if (!State.data.degerleme && !State.data.araDegerleme) return;
    if (!State.data.hedefFiyatlar) State.data.hedefFiyatlar = {};

    const getVal = (sheet, rowName) => {
        if (!sheet || !sheet.rows) return 0;
        const searchStr = rowName.toLowerCase().replace(/[öçşğıü]/g, '');
        let exactRow = sheet.rows.find(r => r[0] && r[0].toString().toLowerCase().replace(/[öçşğıü]/g, '').trim() === searchStr.trim());
        const row = exactRow || sheet.rows.find(r => {
            if (!r[0]) return false;
            const t = r[0].toString().toLowerCase().replace(/[öçşğıü]/g, '');
            if (searchStr.includes('sermaye') && (t.includes('fark') || t.includes('duzeltme'))) return false;
            return t.includes(searchStr);
        });
        if (!row) return 0;
        const v = row[1];
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
            const p = parseFloat(v.replace(/\./g, '').replace(/,/g, '.'));
            return isNaN(p) ? 0 : p;
        }
        return 0;
    };

    const allHisseler = new Set([
        ...Object.keys(State.data.degerleme || {}),
        ...Object.keys(State.data.araDegerleme || {})
    ]);

    for (const hisse of allHisseler) {
        if (window.parseExcelData && (!window.stockData || !window.stockData[hisse] || !window.stockData[hisse].bilanco)) {
            try { window.parseExcelData(hisse); } catch (e) { }
        }
        const sData = (window.stockData && window.stockData[hisse]) ? window.stockData[hisse] : null;
        if (!sData) continue;

        let finansalBorclarTotal = 0;
        let nakitTotal = 0;
        if (sData.bilanco && sData.bilanco.rows) {
            sData.bilanco.rows.forEach(r => {
                if (!r[0]) return;
                const rName = r[0].toString().toLocaleLowerCase('tr-TR');
                if (rName.includes('finansal borçlar') && !rName.includes('kısımlar') && !rName.includes('ksmlar') && (!sData.bilanco.rows.length || sData.bilanco.rows.indexOf(r) < sData.bilanco.rows.length - 2)) {
                    const val = typeof r[1] === 'number' ? r[1] : parseFloat((r[1] || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
                    finansalBorclarTotal += val;
                }
                if (rName.includes('nakit ve nakit benzerleri') || rName.includes('nakit ve nakit değerler')) {
                    const val = typeof r[1] === 'number' ? r[1] : parseFloat((r[1] || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
                    nakitTotal += val;
                }
            });
        }
        let finYatTotal = 0;
        let inDuran = false;
        if (sData.bilanco && sData.bilanco.rows) {
            sData.bilanco.rows.forEach(r => {
                if (!r[0]) return;
                const rName = r[0].toString().toLocaleLowerCase('tr-TR');
                if (rName.trim() === 'duran varlıklar') inDuran = true;
                if (rName.includes('finansal yatırımlar') && !inDuran) {
                    finYatTotal += typeof r[1] === 'number' ? r[1] : parseFloat((r[1] || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
                }
            });
        }
        const netBorc = finansalBorclarTotal - nakitTotal - finYatTotal;
        const odenmisSermaye = getVal(sData.bilanco, 'Ödenmiş Sermaye');
        const guncelFiyat = parseFloat(State.getFiyat(hisse)) || 0;
        const usdtry = parseFloat(State.getFiyat('USDTRY')) || 32.50;
        const eurKuru = (State.getFiyat ? parseFloat(State.getFiyat('EURTRY')) : null) || window.euroKuru || 50.00;
        const usdKuru = (State.getFiyat ? parseFloat(State.getFiyat('USDTRY')) : null) || window.dolarKuru || 46.99;

        // CLEAR ALL STALE TARGET PRICES FOR THIS STOCK BEFORE RECALCULATING
        State.data.hedefFiyatlar[hisse] = {};

        const years = ['2026', '2027', '2028', '2029', '2030'];
        if (State.data.degerleme && State.data.degerleme[hisse]) {
            years.forEach(y => {
                const d = State.data.degerleme[hisse][y];
                if (!d) return;
                const pNum = (val) => (val === undefined || val === null || val === '') ? null : parseFloat(val);
                const curCurrency = d.currency || 'TRY';

                let ySatis = pNum(d['ciro']);
                let yFavokMarji = pNum(d['favok_marji']);
                let yNetKarMarji = pNum(d['net_kar_marji']);
                let yFdFavok = pNum(d['fd_favok']);
                let yFk = pNum(d['fk']);
                let yPdDd = pNum(d['pddd']);
                let yOzkaynak = pNum(d['ozkaynaklar']);

                let favok = (ySatis !== null && yFavokMarji !== null) ? ySatis * (yFavokMarji / 100) : null;
                let netKar = (ySatis !== null && yNetKarMarji !== null) ? ySatis * (yNetKarMarji / 100) : null;

                let currentNetBorc = netBorc;
                if (curCurrency === 'USD') currentNetBorc = netBorc / usdKuru;
                else if (curCurrency === 'EUR') currentNetBorc = netBorc / eurKuru;

                let pd1 = (favok !== null && yFdFavok !== null && yFdFavok > 0) ? (favok * yFdFavok) - currentNetBorc : null;
                let pd2 = (netKar !== null && yFk !== null && yFk > 0) ? (netKar * yFk) : null;
                let pd3 = (yOzkaynak !== null && yPdDd !== null && yPdDd > 0) ? (yOzkaynak * yPdDd) : null;

                let validPDs = [];
                if (pd1 !== null) validPDs.push(pd1);
                if (pd2 !== null) validPDs.push(pd2);
                if (pd3 !== null) validPDs.push(pd3);

                if (validPDs.length > 0 && odenmisSermaye > 0) {
                    let avgPD = validPDs.reduce((a, b) => a + b, 0) / validPDs.length;
                    let hedefFiyatForeign = avgPD / odenmisSermaye;
                    let hedefFiyatTL = 0;
                    if (curCurrency === 'USD') hedefFiyatTL = hedefFiyatForeign * usdKuru;
                    else if (curCurrency === 'EUR') hedefFiyatTL = hedefFiyatForeign * eurKuru;
                    else hedefFiyatTL = hedefFiyatForeign;

                    let potansiyel = 0;
                    if (guncelFiyat > 0) {
                        potansiyel = (hedefFiyatTL - guncelFiyat) / guncelFiyat;
                    }
                    State.data.hedefFiyatlar[hisse][y] = { hedefFiyat: hedefFiyatTL, potansiyel: potansiyel };
                } else {
                    delete State.data.hedefFiyatlar[hisse][y];
                }
            });
        }

        if (State.data.araDegerleme && State.data.araDegerleme[hisse]) {
            Object.keys(State.data.araDegerleme[hisse]).forEach(y => {
                const d = State.data.araDegerleme[hisse][y];
                if (!d) return;
                const pNum = (val) => (val === undefined || val === null || val === '') ? null : parseFloat(val);
                const curCurrency = d.currency || 'TRY';

                let ySatis = pNum(d['ciro']);
                let yFavokMarji = pNum(d['favok_marji']);
                let yNetKarMarji = pNum(d['net_kar_marji']);
                let yFdFavok = pNum(d['fd_favok']);
                let yFk = pNum(d['f_k']);
                let yPdDd = pNum(d['pd_dd']);
                let yOzkaynak = pNum(d['ozkaynaklar']);

                let past3Favok = 0;
                let past3NetKar = 0;

                if (y.includes('/') && sData && sData.gelirCeyrek && sData.gelirCeyrek.rows) {
                    const favokRow = sData.gelirCeyrek.rows.find(x => x[0] && String(x[0]).toLocaleLowerCase('tr-TR').includes('favök'));
                    const netKarRow = sData.gelirCeyrek.rows.find(x => x[0] && (String(x[0]).toLocaleLowerCase('tr-TR').includes('ana ortaklık payları') || String(x[0]).toLocaleLowerCase('tr-TR').includes('dönem net kar')));
                    
                    for (let i = 1; i <= Math.min(3, sData.gelirCeyrek.headers.length - 1); i++) {
                        if (favokRow && favokRow[i] !== undefined && favokRow[i] !== '') {
                            past3Favok += (typeof favokRow[i] === 'number' ? favokRow[i] : parseFloat(String(favokRow[i]).replace(/\./g, '').replace(/,/g, '.')) || 0);
                        }
                        if (netKarRow && netKarRow[i] !== undefined && netKarRow[i] !== '') {
                            past3NetKar += (typeof netKarRow[i] === 'number' ? netKarRow[i] : parseFloat(String(netKarRow[i]).replace(/\./g, '').replace(/,/g, '.')) || 0);
                        }
                    }
                }

                let favok = past3Favok;
                if (ySatis !== null && yFavokMarji !== null) {
                    favok = (ySatis * (yFavokMarji / 100));
                }
                
                let netKar = past3NetKar;
                if (ySatis !== null && yNetKarMarji !== null) {
                    netKar = (ySatis * (yNetKarMarji / 100));
                }

                let currentNetBorc = netBorc;
                if (curCurrency === 'USD') currentNetBorc = netBorc / usdKuru;
                else if (curCurrency === 'EUR') currentNetBorc = netBorc / eurKuru;

                let pd1 = (favok !== null && yFdFavok !== null && yFdFavok > 0) ? (favok * yFdFavok) - currentNetBorc : null;
                let pd2 = (netKar !== null && yFk !== null && yFk > 0) ? (netKar * yFk) : null;
                let pd3 = (yOzkaynak !== null && yPdDd !== null && yPdDd > 0) ? (yOzkaynak * yPdDd) : null;

                let validPDs = [];
                if (pd1 !== null) validPDs.push(pd1);
                if (pd2 !== null) validPDs.push(pd2);
                if (pd3 !== null) validPDs.push(pd3);

                let inputSermaye = pNum(d['sermaye']);
                let finalSermaye = (inputSermaye !== null && inputSermaye !== 0) ? inputSermaye : odenmisSermaye;

                if (validPDs.length > 0 && finalSermaye > 0) {
                    let avgPD = validPDs.reduce((a, b) => a + b, 0) / validPDs.length;
                    let hedefFiyatForeign = avgPD / finalSermaye;
                    let hedefFiyatTL = 0;
                    if (curCurrency === 'USD') hedefFiyatTL = hedefFiyatForeign * usdKuru;
                    else if (curCurrency === 'EUR') hedefFiyatTL = hedefFiyatForeign * eurKuru;
                    else hedefFiyatTL = hedefFiyatForeign;

                    let potansiyel = 0;
                    if (guncelFiyat > 0) {
                        potansiyel = (hedefFiyatTL - guncelFiyat) / guncelFiyat;
                    }
                    State.data.hedefFiyatlar[hisse][y] = { hedefFiyat: hedefFiyatTL, potansiyel: potansiyel };
                } else {
                    delete State.data.hedefFiyatlar[hisse][y];
                }
            });
        }
    }
};


window.uploadRapor = async () => {
    const fileInput = document.getElementById('upload-file');
    const hisse = State.ui.selectedHisse;
    const sn = document.getElementById('upload-sn')?.value.trim() || '';
    const ad = document.getElementById('upload-ad').value.trim();
    const tarih = document.getElementById('upload-tarih').value.trim();
    const sirket = document.getElementById('upload-sirket').value.trim();
    const status = document.getElementById('upload-status');

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        if (status) { status.style.color = 'var(--danger-color)'; status.innerText = 'Lütfen bir dosya seçin.'; }
        return;
    }
    if (!hisse) {
        if (status) { status.style.color = 'var(--danger-color)'; status.innerText = 'Lütfen Hisse kodunu doldurun.'; }
        return;
    }

    if (status) { status.style.color = 'var(--text-primary)'; status.innerHTML = `<i class="fas fa-spinner fa-spin"></i> GitHub'a yükleniyor, lütfen bekleyin...`; }

    const file = fileInput.files[0];

    // Format characters
    const formatStr = (str) => {
        if (!str) return '';
        return str.toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/\s+/g, '_');
    };

    const parts = [];
    if (sn) parts.push(sn);
    if (ad) parts.push(formatStr(ad));
    if (tarih) parts.push(formatStr(tarih));
    if (sirket) parts.push(formatStr(sirket));

    const newFileName = parts.length > 0 ? parts.join('-') + '.pdf' : file.name;

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    try {
        const base64Content = await toBase64(file);

        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                hisse: hisse,
                filename: newFileName,
                content: base64Content
            })
        });

        const result = await response.json();

        if (response.ok) {
            if (status) {
                status.style.color = 'var(--success-color)';
                status.innerHTML = `<i class="fas fa-check-circle"></i> Dosyanız başarıyla yüklendi.`;
            }
            // Clear inputs
            fileInput.value = '';
            const label = fileInput.previousElementSibling;
            if (label) label.innerHTML = '<i class="fas fa-folder-open"></i> Bir Dosya Seç';
            if (document.getElementById('upload-sn')) document.getElementById('upload-sn').value = '';
            document.getElementById('upload-ad').value = '';
            document.getElementById('upload-tarih').value = '';
            document.getElementById('upload-sirket').value = '';
        } else {
            if (status) {
                status.style.color = 'var(--danger-color)';
                status.innerHTML = `<i class="fas fa-times-circle"></i> Hata: ${result.error || 'Bilinmeyen bir hata oluştu.'}`;
            }
        }
    } catch (error) {
        console.error('Upload Error:', error);
        if (status) {
            status.style.color = 'var(--danger-color)';
            status.innerHTML = `<i class="fas fa-times-circle"></i> Ağ veya sunucu hatası oluştu.`;
        }
    }
};

// Takip listesi linkleri icin ozel CSS
(function () {
    if (!document.getElementById('takip-link-style')) {
        const style = document.createElement('style');
        style.id = 'takip-link-style';
        style.textContent = `
            table td.takip-hisse-link[onclick] {
                color: var(--text-muted) !important;
                font-weight: normal !important;
                cursor: pointer !important;
                text-decoration: none !important;
                transition: color 0.2s ease, text-shadow 0.2s ease !important;
            }
            table td.takip-hisse-link[onclick]:hover {
                color: #ffffff !important;
                text-decoration: none !important;
                text-shadow: 0 0 8px rgba(255,255,255,0.3) !important;
            }
            .takip-table th {
                color: var(--text-primary) !important;
            }
        `;
        document.head.appendChild(style);
    }
})();
