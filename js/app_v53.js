
// --- GLOBAL SECURITY, UI & LIVE PRICE HELPERS ---
window.livePrices = window.livePrices || {};
window.pricesLoadedOnce = false;

window.escapeHtml = (val) => {
    if (val === null || val === undefined) return '';
    return String(val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

window.sanitizeUrl = (url) => {
    if (!url) return '';
    const trimmed = String(url).trim();
    try {
        const parsed = new URL(trimmed, window.location.origin);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            return parsed.href;
        }
    } catch (e) {}
    return '';
};

window.showToast = (message, type = 'info', duration = 3500) => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    const toast = document.createElement('div');
    toast.className = 'yunvest-toast ' + (icons[type] ? type : 'info');
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${window.escapeHtml(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 220);
    }, duration);
};

window.showConfirm = (message, okLabel = 'Evet, Sil') => {
    return new Promise((resolve) => {
        const modal = document.getElementById('theme-confirm-modal');
        const msgEl = document.getElementById('theme-confirm-message');
        const okBtn = document.getElementById('theme-confirm-ok-btn');
        if (!modal || !msgEl) {
            resolve(window.confirm(message));
            return;
        }
        msgEl.textContent = message;
        if (okBtn) okBtn.textContent = okLabel;
        window._resolveConfirm = (result) => {
            modal.style.display = 'none';
            window._resolveConfirm = null;
            document.removeEventListener('keydown', escHandler);
            resolve(!!result);
        };
        const escHandler = (e) => {
            if (e.key === 'Escape' && window._resolveConfirm) {
                window._resolveConfirm(false);
            }
        };
        document.addEventListener('keydown', escHandler);
        modal.style.display = 'flex';
    });
};

window.manualRefreshPrices = async () => {
    const btn = document.getElementById('live-price-refresh-btn');
    const txt = document.getElementById('live-price-status-text');
    if (btn) btn.classList.add('loading');
    if (txt) txt.textContent = 'Güncelleniyor...';
    try {
        await Promise.all([
            window.fetchGuncelFiyatlar ? window.fetchGuncelFiyatlar() : Promise.resolve(),
            window.fetchTickerData ? window.fetchTickerData() : Promise.resolve()
        ]);
        window.showToast('Piyasa fiyatları güncellendi.', 'success', 2200);
    } catch (e) {
        window.showToast('Fiyatlar güncellenirken hata oluştu.', 'error');
    } finally {
        if (btn) btn.classList.remove('loading');
    }
};

window.filterTakipTable = (query) => {
    window.takipSearchQuery = query || '';
    if (typeof window.updateTakipViewOnly === 'function') {
        window.updateTakipViewOnly();
    } else if (typeof renderPage === 'function') {
        renderPage();
    }
};

window.filterEkstreTable = (query) => {
    window.ekstreSearchQuery = query || '';
    if (typeof window.updateEkstreViewOnly === 'function') {
        window.updateEkstreViewOnly();
    } else if (typeof renderPage === 'function') {
        renderPage();
    }
};


window.toggleExpandCard = function (btnElement) {
    const card = btnElement.closest('.dash-card');
    const titleText = card.querySelector('.dash-title span').innerText;
    const canvasContainer = card.querySelector('canvas').parentElement;

    let modal = document.getElementById('chart-expand-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'chart-expand-modal';
        modal.style.cssText = 'display: none; justify-content: center; align-items: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(4px); z-index: 20000;';
        modal.innerHTML = `
            <div class="glass" style="width: 85%; height: 60vh; min-height: 400px; max-height: 600px; padding: 2rem; position: relative; border-radius: 12px; display: flex; flex-direction: column; background: var(--surface-color); border: 1px solid var(--surface-border); box-shadow: var(--shadow-lg);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 id="expanded-chart-title" style="color: var(--text-primary); margin: 0; font-size: 1.2rem; font-weight: 600;">Grafik</h3>
                    <i class="fas fa-times" style="font-size: 1.5rem; cursor: pointer; color: var(--text-secondary); transition: color 0.2s;" onmouseover="this.style.color='var(--text-primary)'" onmouseout="this.style.color='var(--text-secondary)'" onclick="window.closeExpandedChart()"></i>
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
    const col0Label = title === 'Bilanço' ? 'Bilanço Kalemleri' : `${title} Kalemleri`;

    let html = `<div style="background:var(--surface-color); border-radius:12px; border:1px solid var(--surface-border); overflow:hidden; font-family:var(--font-family);">
        <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:separate; border-spacing:0; color:var(--text-primary); font-size:13px; text-align:right;">
                <thead>
                    <tr style="background:var(--table-header-bg); border-bottom:1px solid var(--surface-border);">
                        <th style="position:sticky; left:0; z-index:5; background:var(--table-header-bg); text-align:left !important; padding:12px 14px; font-size:13.5px; font-weight:700; white-space:nowrap; box-shadow: 2px 0 6px -2px rgba(15,23,42,0.08);">${col0Label}</th>`;

    headers.forEach((h, i) => {
        if (i === 0) return;
        html += `<th style="padding:12px 14px; white-space:nowrap; color:var(--accent-color); text-align:right !important;">${h}</th>`;
    });
    html += `</tr></thead><tbody>`;

    const mainCategories = [
        'dönen varlıklar', 'duran varlıklar', 'toplam varlıklar',
        'kısa vadeli yükümlülükler', 'uzun vadeli yükümlülükler', 'özkaynaklar', 'toplam kaynaklar',
        'işletme faaliyetlerinden nakit akışları', 'faaliyetlerden elde edilen nakit akışları',
        'yatırım faaliyetlerinden kaynaklanan nakit akışları', 'finansman faaliyetlerinden nakit akışları',
        'dönem sonu nakit ve nakit benzerleri'
    ];

    rows.forEach(r => {
        const rowName = r[0] ? r[0].trim() : '';
        if (!rowName || rowName.startsWith('Sistem_')) return;
        const isMainCat = mainCategories.includes(rowName.toLocaleLowerCase('tr-TR'));
        const rowBg = isMainCat ? '#f1f5f9' : '#ffffff';

        html += `<tr style="background:${rowBg}; ${isMainCat ? 'font-weight:700;' : ''} border-bottom:1px solid var(--table-border);">`;

        r.forEach((cell, i) => {
            if (i === 0) {
                const cellColor = isMainCat ? '#0f172a' : 'var(--text-secondary)';
                html += `<td style="position:sticky; left:0; z-index:2; background:${rowBg}; text-align:left !important; padding:9px 14px; color:${cellColor} !important; ${isMainCat ? 'font-weight:700 !important;' : ''} white-space:nowrap; border-right:1px solid var(--table-border); box-shadow: 2px 0 6px -2px rgba(15,23,42,0.06);">${window.escapeHtml(cell)}</td>`;
            } else {
                html += `<td style="text-align:right !important; padding:9px 14px; color:var(--text-primary) !important; ${isMainCat ? 'font-weight:700 !important;' : ''} white-space:nowrap; border-right:none;">${window.escapeHtml(cell)}</td>`;
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
                if (!enf || !enf.tarih) return;
                const [ey, em] = String(enf.tarih).split('-');
                let enfTarih = new Date(ey, em - 1, 1);
                const parsedOran = parseFloat(String(enf.oran).replace(',', '.'));
                if (!isNaN(parsedOran) && enfTarih >= nakitTarih) {
                    compoundingFactor *= (1 + (parsedOran / 100));
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
        enflasyonAnapara: enflasyonAnapara,
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
    takipYildizlar: [],
    takipAlimHedefleri: {},
    analizler: [],
    uploadedReports: [],
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
            if (!Array.isArray(this.data.takipYildizlar)) this.data.takipYildizlar = [];
            if (!this.data.takipAlimHedefleri || Array.isArray(this.data.takipAlimHedefleri)) this.data.takipAlimHedefleri = {};
            if (!this.data.analizler) this.data.analizler = [];
            if (!this.data.uploadedReports) this.data.uploadedReports = [];
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
                this.data.hisseFiyatlari.forEach(h => {
                    if (h.menkul) {
                        h.menkul = h.menkul.trim().toUpperCase();
                        if (h.fiyat > 0 && !window.livePrices[h.menkul]) {
                            window.livePrices[h.menkul] = h.fiyat;
                        }
                    }
                });
                this.pruneHisseFiyatlari();
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

        if (this.unsubscribe) {
            this.unsubscribe();
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

            this.pruneHisseFiyatlari();

            // SINGLE ROLLING BACKUP (avoids 5x localStorage bloat)
            try {
                const currentLocal = localStorage.getItem('borsa_app_data');
                if (currentLocal) localStorage.setItem('borsa_app_data_backup_1', currentLocal);
                for (let i = 2; i <= 5; i++) localStorage.removeItem('borsa_app_data_backup_' + i);
            } catch (e) {
                console.warn('Backup skipped:', e);
            }

            try {
                localStorage.setItem('borsa_app_data', JSON.stringify(this.data));
            } catch (e) {
                console.warn('Quota exceeded, clearing backup');
                localStorage.removeItem('borsa_app_data_backup_1');
                try { localStorage.setItem('borsa_app_data', JSON.stringify(this.data)); } catch (e2) {}
            }

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
        db.collection('app_data').doc(currentUser.uid).set(this.data).catch(err => {
            console.error('Firestore kayıt hatası:', err);
            window.showToast('Buluta kaydedilirken hata oluştu: ' + (err.message || 'Bağlantı hatası'), 'error');
        });
    },


    // TAKİP LİSTESİ
    addTakip(menkul) {
        const sym = String(menkul || '').trim().toUpperCase();
        if (!sym) return false;
        if (!this.data.takipListesi) this.data.takipListesi = [];
        if (!this.data.takipListesi.includes(sym)) {
            this.data.takipListesi.push(sym);
            this.save();
            this.syncHisseFolders();
            return true;
        }
        return false;
    },
    removeTakip(menkul) {
        const sym = String(menkul || '').trim().toUpperCase();
        if (!this.data.takipListesi) this.data.takipListesi = [];
        this.data.takipListesi = this.data.takipListesi.filter(m => m !== sym);
        if (Array.isArray(this.data.takipYildizlar)) {
            this.data.takipYildizlar = this.data.takipYildizlar.filter(m => m !== sym);
        }
        this.save();
        this.syncHisseFolders();
    },
    toggleTakipYildiz(menkul) {
        const sym = String(menkul || '').trim().toUpperCase();
        if (!sym) return false;
        if (!Array.isArray(this.data.takipYildizlar)) this.data.takipYildizlar = [];
        const idx = this.data.takipYildizlar.indexOf(sym);
        let starred = false;
        if (idx >= 0) {
            this.data.takipYildizlar.splice(idx, 1);
            starred = false;
        } else {
            this.data.takipYildizlar.push(sym);
            starred = true;
        }
        this.save();
        return starred;
    },
    setTakipAlimHedefi(menkul, fiyat) {
        const sym = String(menkul || '').trim().toUpperCase();
        if (!sym) return;
        if (!this.data.takipAlimHedefleri || Array.isArray(this.data.takipAlimHedefleri)) {
            this.data.takipAlimHedefleri = {};
        }
        const num = parseFloat(String(fiyat || '').replace(',', '.'));
        if (!isNaN(num) && num > 0) {
            this.data.takipAlimHedefleri[sym] = num;
        } else {
            delete this.data.takipAlimHedefleri[sym];
        }
        this.save();
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
        const parsedFiyat = parseFloat(String(islem.fiyat).replace(',', '.'));
        const parsedAdet = parseFloat(String(islem.adet).replace(',', '.'));
        let islemAdet = Math.abs(parsedAdet);
        if (islem.islemTip === 'SATIŞ') islemAdet = -islemAdet;

        const tutar = Math.abs(islemAdet) * parsedFiyat;

        this.data.ekstre.push({
            id: Date.now().toString(),
            tarih: islem.tarih,
            islemTip: islem.islemTip,
            menkul: islem.menkul.trim().toUpperCase(),
            adet: islemAdet,
            fiyat: parsedFiyat,
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
            const parsedFiyat = parseFloat(String(islem.fiyat).replace(',', '.'));
            const parsedAdet = parseFloat(String(islem.adet).replace(',', '.'));
            let islemAdet = Math.abs(parsedAdet);
            if (islem.islemTip === 'SATIŞ') islemAdet = -islemAdet;
            const tutar = Math.abs(islemAdet) * parsedFiyat;
            this.data.ekstre[index] = {
                ...this.data.ekstre[index],
                tarih: islem.tarih,
                islemTip: islem.islemTip,
                menkul: islem.menkul.trim().toUpperCase(),
                adet: islemAdet,
                fiyat: parsedFiyat,
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

    getRelevantSymbols() {
        const set = new Set(['DOLAR', 'GRAM ALTIN', 'BIST', 'USDTRY', 'EURTRY']);
        if (!this.data) return set;
        (this.data.takipListesi || []).forEach(s => { if (s) set.add(String(s).trim().toUpperCase()); });
        (this.data.ekstre || []).forEach(e => { if (e && e.menkul) set.add(String(e.menkul).trim().toUpperCase()); });
        if (this.data.manuelFonFiyatlari) {
            Object.keys(this.data.manuelFonFiyatlari).forEach(k => set.add(k.trim().toUpperCase()));
        }
        if (window.currentSelectedHisse) set.add(String(window.currentSelectedHisse).trim().toUpperCase());
        return set;
    },

    pruneHisseFiyatlari() {
        if (!this.data || !Array.isArray(this.data.hisseFiyatlari)) return;
        const relevant = this.getRelevantSymbols();
        const seen = new Set();
        this.data.hisseFiyatlari = this.data.hisseFiyatlari.filter(h => {
            if (!h || !h.menkul) return false;
            const sym = h.menkul.trim().toUpperCase();
            if (!relevant.has(sym) || seen.has(sym)) return false;
            seen.add(sym);
            return true;
        });
    },

    getFiyat(menkul) {
        if (!menkul) return 0;
        let m = menkul.trim().toUpperCase();
        if (m === 'NAKIT') return 1;
        if (window.livePrices && window.livePrices[m] > 0) return window.livePrices[m];
        if (!this.data || !this.data.hisseFiyatlari) return 0;
        const h = this.data.hisseFiyatlari.find(x => x.menkul.trim().toUpperCase() === m);
        return h ? h.fiyat : 0;
    },

    updateFiyat(menkul, fiyat, skipSave = false, isLiveMarket = false) {
        if (!menkul) return;
        let m = menkul.trim().toUpperCase();
        const numVal = parseFloat(fiyat);
        if (isNaN(numVal)) return;
        window.livePrices[m] = numVal;
        if (!this.data) return;
        if (isLiveMarket && !this.getRelevantSymbols().has(m)) return;
        if (!this.data.hisseFiyatlari) this.data.hisseFiyatlari = [];
        let hf = this.data.hisseFiyatlari.find(h => h.menkul.trim().toUpperCase() === m);
        if (hf) {
            hf.fiyat = numVal;
            hf.tarih = new Date().toISOString();
        } else {
            this.data.hisseFiyatlari.push({ menkul: m, fiyat: numVal, tarih: new Date().toISOString() });
        }
        if (!skipSave) this.save(false, true);
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
    if (dl.getAttribute('data-loaded-count') == stocks.length) return; // FIX: Prevent datalist innerHTML memory leak!
    
    const newHtml = stocks.map(s => `<option value="${s}"></option>`).join('');
    dl.innerHTML = newHtml;
    dl.setAttribute('data-loaded-count', stocks.length);
};

window.fetchWithTimeout = async (resource, options = {}) => {
    const { timeout = 8000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        
        // CRITICAL MEMORY LEAK FIX: If response is not ok, consume the body to release the stream!
        if (!response.ok) {
            try { await response.text(); } catch (e) {}
        }
        
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};

window.isFetchingGuncelFiyatlar = false;
window.fetchGuncelFiyatlar = async () => {
    if (window.isFetchingGuncelFiyatlar) return;
    window.isFetchingGuncelFiyatlar = true;
    const refreshBtn = document.getElementById('live-price-refresh-btn');
    const statusText = document.getElementById('live-price-status-text');
    if (refreshBtn) refreshBtn.classList.add('loading');
    if (statusText) statusText.textContent = 'Güncelleniyor...';
    try {
    // 1. Dolar ve Altın (TradingView)
    try {
        const trRes = await window.fetchWithTimeout('https://scanner.tradingview.com/global/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ symbols: { tickers: ['OANDA:XAUUSD', 'FX:USDTRY', 'FX:EURTRY'] }, columns: ['close'] })
        });
        if (trRes.ok) {
            const trJson = await trRes.json();
            const usdObj = trJson.data.find(x => x.s === 'FX:USDTRY');
            const onsObj = trJson.data.find(x => x.s === 'OANDA:XAUUSD');
            if (usdObj) {
                State.updateFiyat('DOLAR', usdObj.d[0], true, true);
            }
            if (usdObj && onsObj) {
                const graPrice = (onsObj.d[0] * usdObj.d[0]) / 31.1035;
                State.updateFiyat('GRAM ALTIN', graPrice, true, true);
            }
        }
    } catch (e) {
        console.error('TradingView Dolar/Altın çekilemedi:', e);
    }

    // 2. Hisse Senetleri
    let tvBasarili = false;
    try {
        const tvResponse = await window.fetchWithTimeout('https://scanner.tradingview.com/turkey/scan', {
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
                State.updateFiyat(menkul, fiyat, true, true);
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
                        const yfResponse = await window.fetchWithTimeout(proxy);
                        if (!yfResponse.ok) continue;
                        const yfData = await yfResponse.json();
                        if (yfData && yfData.chart && yfData.chart.result && yfData.chart.result.length > 0) {
                            const meta = yfData.chart.result[0].meta;
                            const fiyat = meta.regularMarketPrice;
                            if (fiyat) {
                                State.updateFiyat(menkul, fiyat, true, true);
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
                        const tefasRes = await window.fetchWithTimeout(tefasUrl);
                        if (tefasRes.ok) {
                            const html = await tefasRes.text();
                            let match = html.match(/"sonFiyat\\":([\d.]+)/);
                            if (!match) match = html.match(/"sonFiyat":([\d.]+)/);
                            if (match) {
                                State.updateFiyat(menkul, parseFloat(match[1]), true, true);
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
                const gasRes = await window.fetchWithTimeout(gasUrl + '?symbols=' + symbolsToFetch.join(','));
                if (gasRes.ok) {
                    const gasData = await gasRes.json();
                    for (const sym in gasData) {
                        if (gasData[sym] > 0) {
                            State.updateFiyat(sym, gasData[sym], true, true);
                        }
                    }
                }
            }
        } catch (e) {
            console.error("GAS API hatası:", e);
        }
    }

    ensureDatalist();
    window.pricesLoadedOnce = true;
    State.save(true, false);
    const nowTime = new Date();
    const hhmm = String(nowTime.getHours()).padStart(2, '0') + ':' + String(nowTime.getMinutes()).padStart(2, '0');
    if (statusText) statusText.textContent = hhmm;

    const mainEl = document.getElementById('main-content');
    const activeEl = document.activeElement;
    const isEditingField = mainEl && activeEl && mainEl.contains(activeEl) && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName);
    if (typeof renderPage === 'function' && !isEditingField && (currentPage === 'anasayfa' || currentPage === 'portfoy' || currentPage === 'hisse_detay')) {
        renderPage();
    }
    } finally {
        window.isFetchingGuncelFiyatlar = false;
        if (refreshBtn) refreshBtn.classList.remove('loading');
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
                        <input type="number" step="0.000001" class="form-control glass-input inline-pry-input" style="display:none; width: 88px; text-align: right; padding: 2px 4px; font-size: 13px; height: 26px;" value="${p.guncelFiyat}" onblur="window.saveVarliklarEdit()" onkeydown="if(event.key==='Enter') window.saveVarliklarEdit()">
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
        <td style="text-align: right !important; border-right: 1px solid var(--table-border);">
            <div style="display:flex; justify-content:flex-end; align-items:center; gap:0.5rem;">
                <span style="cursor:pointer;" onclick="this.style.display='none'; this.nextElementSibling.style.display='inline-block'; this.nextElementSibling.focus();" title="Düzenlemek için tıklayın">${formatCurrency(guncelNakitDeger, 2)}</span>
                <input type="number" step="0.01" class="form-control glass-input" style="display:none; width: 108px; text-align: right; padding: 2px 4px; font-size: 13px; height: 26px;" value="${guncelNakitDeger}" onblur="window.saveNakitVarlikEdit(this)" onkeydown="if(event.key==='Enter') window.saveNakitVarlikEdit(this)">
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
            <span class="portfoy-tab-btn" style="cursor: pointer; font-size: 13.5px !important; font-weight: 600; padding: 6px 12px; border-radius: 6px; background: ${getTabBg('varliklar')}; color: ${getTabColor('varliklar')}; transition: color 0.2s;" onclick="window.setPortfoyTab('varliklar')">Varlıklarım</span>
            <span class="portfoy-tab-btn" style="cursor: pointer; font-size: 13.5px !important; font-weight: 600; padding: 6px 12px; border-radius: 6px; background: ${getTabBg('bilgiler')}; color: ${getTabColor('bilgiler')}; transition: color 0.2s;" onclick="window.setPortfoyTab('bilgiler')">Portföy Bilgileri</span>
            <span class="portfoy-tab-btn" style="cursor: pointer; font-size: 13.5px !important; font-weight: 600; padding: 6px 12px; border-radius: 6px; background: ${getTabBg('gecmis')}; color: ${getTabColor('gecmis')}; transition: color 0.2s;" onclick="window.setPortfoyTab('gecmis')">Günlük Portföy Değişimi</span>
            ${!(window.Capacitor && window.Capacitor.isNative) ? `<span class="portfoy-tab-btn" style="cursor: pointer; font-size: 13.5px !important; font-weight: 600; padding: 6px 12px; border-radius: 6px; background: ${getTabBg('arsiv')}; color: ${getTabColor('arsiv')}; transition: color 0.2s;" onclick="window.setPortfoyTab('arsiv')">Arşiv</span>` : ''}
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
                                    <td style="text-align:right !important; width:50%; border-right: 1px solid var(--table-border);">${formatCurrency(portfoyBilgileri.toplamPortfoy)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Nakit</td>
                                    <td style="text-align:right !important; border-right: 1px solid var(--table-border);">
                                        <span id="nakit-text">${formatCurrency(guncelNakitTutar, 2)}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Hisse Portföyü</td>
                                    <td style="text-align:right !important; border-right: 1px solid var(--table-border);">${formatCurrency(hissePortfoyTutar)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Fon Portföyü</td>
                                    <td style="text-align:right !important; border-right: 1px solid var(--table-border);">${formatCurrency(fonPortfoyTutar)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Anapara</td>
                                    <td style="text-align:right !important; border-right: 1px solid var(--table-border);">${formatCurrency(portfoyBilgileri.anapara)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Kar</td>
                                    <td style="text-align:right !important; border-right: 1px solid var(--table-border);" class="${portfoyBilgileri.kar >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(portfoyBilgileri.kar)}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--surface-border);">
                                    <td style="text-align:left !important;">Nominal Getiri Oranı</td>
                                    <td style="text-align:right !important; border-right: 1px solid var(--table-border);" class="${portfoyBilgileri.nominalGetiri >= 0 ? 'text-success' : 'text-danger'}">${formatPercent(portfoyBilgileri.nominalGetiri)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Reel Getiri Oranı (Enflasyon)</td>
                                    <td style="text-align:right !important; border-right: 1px solid var(--table-border);" class="${portfoyBilgileri.reelGetiriEnflasyon >= 0 ? 'text-success' : 'text-danger'}">${formatPercent(portfoyBilgileri.reelGetiriEnflasyon)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">BIST 100'e Göre Reel Getiri Oranı</td>
                                    <td style="text-align:right !important; border-right: 1px solid var(--table-border);" class="${portfoyBilgileri.reelGetiriBist >= 0 ? 'text-success' : 'text-danger'}">${formatPercent(portfoyBilgileri.reelGetiriBist)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Dolar Kuruna Göre Reel Getiri Oranı</td>
                                    <td style="text-align:right !important; border-right: 1px solid var(--table-border);" class="${portfoyBilgileri.reelGetiriDolar >= 0 ? 'text-success' : 'text-danger'}">${formatPercent(portfoyBilgileri.reelGetiriDolar)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Gram Altına Göre Reel Getiri Oranı</td>
                                    <td style="text-align:right !important; border-right: 1px solid var(--table-border);" class="${portfoyBilgileri.reelGetiriAltin >= 0 ? 'text-success' : 'text-danger'}">${formatPercent(portfoyBilgileri.reelGetiriAltin)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">PRY Fonuna Göre Reel Getiri Oranı</td>
                                    <td style="text-align:right !important; border-right: 1px solid var(--table-border);" class="${portfoyBilgileri.reelGetiriPry >= 0 ? 'text-success' : 'text-danger'}">${formatPercent(portfoyBilgileri.reelGetiriPry)}</td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Hedef Portföy</td>
                                    <td style="text-align:right !important; border-right: 1px solid var(--table-border); cursor: pointer;" ondblclick="window.togglePortfoyEdit()" title="Düzenlemek için çift tıklayın">
                                        <div style="display:flex; justify-content:flex-end; align-items:center; gap:0.5rem;">
                                            <span id="hedef-text">${formatCurrency(portfoyBilgileri.hedefPortfoy, 0)}</span>
                                            <input type="number" id="inline-hedef-input" class="form-control glass-input" style="display:none; width: 108px; text-align: right; padding: 2px 4px; font-size: 13px; height: 26px;" value="${portfoyBilgileri.hedefPortfoy}" onblur="window.savePortfoyEdit()" onkeydown="if(event.key==='Enter') window.savePortfoyEdit()">
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align:left !important;">Hedefe Ulaşmak İçin Gereken Artış %</td>
                                    <td style="text-align:right !important; border-right: 1px solid var(--table-border);">${formatPercent(portfoyBilgileri.hedefArtis, 0)}</td>
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
                font-size: 13px !important;
                color: var(--text-secondary) !important;
                font-weight: 600 !important;
                transition: color 0.2s, background 0.2s;
            }
            .chart-filter:hover, .chart-filter.active-filter {
                color: var(--active-text-color) !important;
            }
            </style>
            <div style="display: flex; flex-direction: column; width: 100%; min-height: 350px; margin-bottom: 0;">
                <div style="padding: 8px 1rem 0 1rem;">
                    <div id="portfoy-chart-filters" style="display:flex; gap:0.5rem; font-size:13.5px; color:var(--text-primary);">
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
                                <tr><th>S.N.</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleVarliklarSort('menkul')">Menkul</th><th>Tür</th><th>Güncel Fiyat</th><th>Adet</th><th>Güncel Maliyet</th><th>Net Maliyet</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleVarliklarSort('odenenTutar')">Ödenen Tutar</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleVarliklarSort('guncelTutar')">Güncel Tutar</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleVarliklarSort('kar')">Kar/Zarar</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleVarliklarSort('karYuzde')">Kar/Zarar %</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleVarliklarSort('portfoyOrani')">Portföy Oranı</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleVarliklarSort('ilkAlimTarihi')">İlk Alım Tarihi</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleVarliklarSort('gecenSure')">Geçen Süre</th></tr>
                            </thead>
                            <tbody>
                                ${portfoyHtml}
                                <tr class="total-row">
                                    <td style="text-align: center !important;"></td>
                                    <td style="text-align: left !important;">TOPLAM</td>
                                    <td colspan="5"></td>
                                    <td style="text-align: right !important;">${formatCurrency(totalOdenen, 0)}</td>
                                    <td style="text-align: right !important;">${formatCurrency(totalGuncel, 0)}</td>
                                    <td class="${totalKar >= 0 ? 'text-success' : 'text-danger'}" style="text-align: right !important;">${formatCurrency(totalKar, 0)}</td>
                                    <td colspan="4"></td>
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
            <div id="portfoy-arsiv" class="portfoy-tab-content" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 0;">
                <div class="table-container" style="margin-bottom: 0; overflow-x: auto; overflow-y: visible;">

                    <table class="dash-table compact-table" style="min-width: 1000px; text-align: center; border-collapse: separate; border-spacing: 0;">
                        <thead style="position: sticky; top: 0; z-index: 10; background: var(--table-header-bg);">
                            <tr><th>S.N.</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleArsivSort('menkul')">Menkul</th><th>Güncel Fiyat</th><th>Adet</th><th>Alış Fiyatı</th><th>Satış Fiyatı</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleArsivSort('kar')">Kar / Zarar</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleArsivSort('karYuzde')">Kar / Zarar %</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleArsivSort('ilkAlimTarihi')">İlk Alım Tarihi</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleArsivSort('sonSatimTarihi')">Son Satım Tarihi</th><th style="cursor: pointer; user-select: none;" onclick="window.toggleArsivSort('tasimaSuresi')">Taşıma Süresi</th></tr>
                        </thead>
                        <tbody>
                            ${arsivHtml}
                            <tr class="total-row">
                                <td style="text-align: center !important;"></td>
                                <td style="text-align: left !important;">TOPLAM</td>
                                <td colspan="4"></td>
                                <td class="${arsivKarTotal >= 0 ? 'text-success' : 'text-danger'}" style="text-align: right !important;">${formatCurrency(arsivKarTotal, 0)}</td>
                                <td colspan="4"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    const kpiKarPos = portfoyBilgileri.kar >= 0;
    const kpiGetiriPos = portfoyBilgileri.nominalGetiri >= 0;
    const kpiCardsHtml = `
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-icon-box navy"><i class="fas fa-wallet"></i></div>
                <div class="kpi-info">
                    <div class="kpi-label">Toplam Portföy</div>
                    <div class="kpi-value">${formatCurrency(portfoyBilgileri.toplamPortfoy, 0)}</div>
                    <div class="kpi-sub">Hisse: ${formatCurrency(hissePortfoyTutar, 0)} · Fon: ${formatCurrency(fonPortfoyTutar, 0)}</div>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon-box slate"><i class="fas fa-coins"></i></div>
                <div class="kpi-info">
                    <div class="kpi-label">Toplam Anapara</div>
                    <div class="kpi-value">${formatCurrency(portfoyBilgileri.anapara, 0)}</div>
                    <div class="kpi-sub">Nakit: ${formatCurrency(guncelNakitTutar, 0)}</div>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon-box ${kpiKarPos ? 'green' : 'red'}"><i class="fas fa-chart-line"></i></div>
                <div class="kpi-info">
                    <div class="kpi-label">Net Kâr / Zarar</div>
                    <div class="kpi-value" style="color: ${kpiKarPos ? 'var(--success-color)' : 'var(--danger-color)'};">${kpiKarPos ? '+' : ''}${formatCurrency(portfoyBilgileri.kar, 0)}</div>
                    <div class="kpi-sub">Açık Pozisyon: ${filteredPortfoy.length} menkul</div>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon-box ${kpiGetiriPos ? 'green' : 'red'}"><i class="fas fa-percentage"></i></div>
                <div class="kpi-info">
                    <div class="kpi-label">Nominal Getiri</div>
                    <div class="kpi-value" style="color: ${kpiGetiriPos ? 'var(--success-color)' : 'var(--danger-color)'};">${kpiGetiriPos ? '+' : ''}${formatPercent(portfoyBilgileri.nominalGetiri)}</div>
                    <div class="kpi-sub">Reel (Enf.): ${formatPercent(portfoyBilgileri.reelGetiriEnflasyon)}</div>
                </div>
            </div>
        </div>
    `;

    const html = `
        <style>
            .portfoy-tab-content table th {
                padding: 10px 8px !important;
                font-size: 13px !important;
                font-weight: 700 !important;
            }
            .portfoy-tab-content table td {
                font-size: 13.5px !important;
            }
        </style>
        <div class="page-section active" style="display: flex; flex-direction: column; padding: 0px; gap: 1rem;">
            ${kpiCardsHtml}
            <div class="glass" style="display: flex; flex-direction: column; padding: 0.75rem 1rem; width: 100%;">
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
                        ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
                        ctx.stroke();

                        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#0f172a';
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
            if (window.chartOzetInstance) {
                window.chartOzetInstance.destroy();
            }
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
                                color: getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#0f172a',
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
                                color: getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#0f172a',
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

        // Hedeflenen kapanış günü için kayıt (yalnızca geçerli/yüklenmiş portföy değeriyle)
        if (targetDate && portfoyBilgileri.toplamPortfoy > 0) {
            const yyyyMmDd = targetDate.getFullYear() + '-' + String(targetDate.getMonth() + 1).padStart(2, '0') + '-' + String(targetDate.getDate()).padStart(2, '0');
            const targetRecord = State.data.portfoyGecmisi.find(r => r.tarih === yyyyMmDd);
            if (!targetRecord) {
                State.data.portfoyGecmisi.push({
                    tarih: yyyyMmDd,
                    tutar: portfoyBilgileri.toplamPortfoy,
                    anapara: portfoyBilgileri.anapara
                });
                State.save();
            } else if (window.pricesLoadedOnce && (targetRecord.tutar !== portfoyBilgileri.toplamPortfoy || targetRecord.anapara !== portfoyBilgileri.anapara)) {
                targetRecord.tutar = portfoyBilgileri.toplamPortfoy;
                targetRecord.anapara = portfoyBilgileri.anapara;
                State.save();
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
                        el.style.background = 'var(--overlay-bg)';
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
                            borderColor: '#059669',
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            pointBackgroundColor: '#059669',
                            pointRadius: 0,
                            pointHoverRadius: 6,
                            fill: false,
                            tension: 0
                        },
                        {
                            label: 'Anapara',
                            data: dataAnapara,
                            borderColor: '#d97706',
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            pointBackgroundColor: '#d97706',
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
                        legend: { display: true, position: 'bottom', labels: { color: '#475569', font: { size: 12 }, boxWidth: 12 } },
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
                            grid: { color: 'rgba(15, 23, 42, 0.08)' },
                            ticks: { color: '#475569', font: { size: 12 } }
                        },
                        y: {
                            grid: { color: 'rgba(15, 23, 42, 0.08)' },
                            ticks: {
                                color: '#475569',
                                font: { size: 12 },
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

// --- UNIFIED VALUATION MATH ENGINE (Used by Değerleme UI, getGBHF & recalculateHedefFiyatlar) ---
window.getDegerlemeFxRates = () => {
    const getLive = (keys) => {
        for (const k of keys) {
            const v = State.getFiyat ? parseFloat(State.getFiyat(k)) : 0;
            if (v && isFinite(v) && v > 1) return v;
        }
        return 0;
    };
    const usdKuru = getLive(['DOLAR', 'USDTRY']) || (window.latestMarketBenchmarks && window.latestMarketBenchmarks.dolar) || window.dolarKuru || 38.0;
    const eurKuru = getLive(['EURO', 'EURTRY']) || window.euroKuru || (usdKuru * 1.08);
    return { usdKuru, eurKuru };
};

window.getDegerlemeStockContext = (hisse) => {
    const sym = String(hisse || '').trim().toUpperCase();
    if (window.parseExcelData && (!window.stockData || !window.stockData[sym] || !window.stockData[sym].bilanco)) {
        try { window.parseExcelData(sym); } catch (e) { }
    }
    const sData = (window.stockData && window.stockData[sym]) ? window.stockData[sym] : null;
    const parseTR = (v) => {
        if (typeof v === 'number') return isFinite(v) ? v : 0;
        if (!v || v === '-') return 0;
        const p = parseFloat(String(v).replace(/\./g, '').replace(/,/g, '.'));
        return isNaN(p) ? 0 : p;
    };

    let odenmisSermaye = 0;
    let netBorc = 0;
    let anaOrtaklikOzkaynak = 0;
    let ttmSatis = 0;
    let ttmFavok = 0;
    let ttmNetKar = 0;
    let past3Favok = 0;
    let past3NetKar = 0;

    if (sData && sData.bilanco && sData.bilanco.rows) {
        let finBorc = 0, nakit = 0, finYat = 0, inDuran = false;
        const totalRows = sData.bilanco.rows.length;
        sData.bilanco.rows.forEach((r, idx) => {
            if (!r[0]) return;
            const low = r[0].toString().toLocaleLowerCase('tr-TR');
            if (low.trim() === 'duran varlıklar') inDuran = true;
            if (low.includes('ödenmiş sermaye') && !low.includes('fark') && !low.includes('düzeltme') && odenmisSermaye === 0) {
                odenmisSermaye = parseTR(r[1]);
            }
            if (low.includes('ana ortaklığa ait özkaynaklar') && anaOrtaklikOzkaynak === 0) {
                anaOrtaklikOzkaynak = parseTR(r[1]);
            }
            if (low.includes('finansal borçlar') && !low.includes('kısımlar') && !low.includes('ksmlar') && idx < totalRows - 2) {
                finBorc += parseTR(r[1]);
            }
            if (low.includes('nakit ve nakit benzerleri') || low.includes('nakit ve nakit değerler')) {
                nakit += parseTR(r[1]);
            }
            if (low.includes('finansal yatırımlar') && !inDuran) {
                finYat += parseTR(r[1]);
            }
        });
        if (anaOrtaklikOzkaynak === 0) {
            const ozR = sData.bilanco.rows.find(r => r[0] && r[0].toString().toLocaleLowerCase('tr-TR').trim() === 'özkaynaklar');
            if (ozR) anaOrtaklikOzkaynak = parseTR(ozR[1]);
        }
        netBorc = finBorc - nakit - finYat;
    }

    if (sData && sData.gelirYillik && sData.gelirYillik.rows) {
        const sR = sData.gelirYillik.rows.find(x => x[0] && (String(x[0]).toLocaleLowerCase('tr-TR').includes('satış gelirleri') || String(x[0]).toLocaleLowerCase('tr-TR').includes('hasılat')));
        const fR = sData.gelirYillik.rows.find(x => x[0] && String(x[0]).toLocaleLowerCase('tr-TR').includes('favök'));
        const nR = sData.gelirYillik.rows.find(x => x[0] && (String(x[0]).toLocaleLowerCase('tr-TR').includes('ana ortaklık payları') || String(x[0]).toLocaleLowerCase('tr-TR').includes('dönem net kar')));
        if (sR) ttmSatis = parseTR(sR[1]);
        if (fR) ttmFavok = parseTR(fR[1]);
        if (nR) ttmNetKar = parseTR(nR[1]);
    }

    if (sData && sData.gelirCeyrek && sData.gelirCeyrek.rows && sData.gelirCeyrek.headers) {
        const fR = sData.gelirCeyrek.rows.find(x => x[0] && String(x[0]).toLocaleLowerCase('tr-TR').includes('favök'));
        const nR = sData.gelirCeyrek.rows.find(x => x[0] && (String(x[0]).toLocaleLowerCase('tr-TR').includes('ana ortaklık payları') || String(x[0]).toLocaleLowerCase('tr-TR').includes('dönem net kar')));
        const maxQ = Math.min(3, sData.gelirCeyrek.headers.length - 1);
        for (let i = 1; i <= maxQ; i++) {
            if (fR && fR[i] !== undefined && fR[i] !== '') past3Favok += parseTR(fR[i]);
            if (nR && nR[i] !== undefined && nR[i] !== '') past3NetKar += parseTR(nR[i]);
        }
    }

    const td = window.tickerData && window.tickerData[sym];
    const guncelFiyat = (td && td.c > 0) ? td.c : (parseFloat(State.getFiyat ? State.getFiyat(sym) : 0) || 0);
    const { usdKuru, eurKuru } = window.getDegerlemeFxRates();

    const piyasaDegeri = guncelFiyat * odenmisSermaye;
    const firmaDegeri = piyasaDegeri + netBorc;
    const guncelFdFavok = ttmFavok !== 0 ? (firmaDegeri / ttmFavok) : 0;
    const guncelFk = ttmNetKar !== 0 ? (piyasaDegeri / ttmNetKar) : 0;
    const guncelPdDd = anaOrtaklikOzkaynak !== 0 ? (piyasaDegeri / anaOrtaklikOzkaynak) : 0;

    return {
        hisse: sym, sData, guncelFiyat, usdKuru, eurKuru,
        odenmisSermaye, netBorc, anaOrtaklikOzkaynak,
        ttmSatis, ttmFavok, ttmNetKar, past3Favok, past3NetKar,
        piyasaDegeri, firmaDegeri, guncelFdFavok, guncelFk, guncelPdDd
    };
};

window.computeDegerlemePeriod = (period, dRaw, ctx) => {
    const d = dRaw || {};
    const isQuarterly = String(period || '').includes('/');
    const curCurrency = d.currency || 'TRY';
    const fxMult = curCurrency === 'USD' ? ctx.usdKuru : (curCurrency === 'EUR' ? ctx.eurKuru : 1);

    const pNum = (v) => {
        if (v === undefined || v === null || v === '') return null;
        const n = parseFloat(String(v).replace(',', '.'));
        return isNaN(n) || !isFinite(n) ? null : n;
    };

    const ciro = pNum(d.ciro);
    const favokMarji = pNum(d.favok_marji);
    const netKarMarji = pNum(d.net_kar_marji);
    const ozkaynaklar = pNum(d.ozkaynaklar);
    const yFdFavok = pNum(d.fd_favok);
    const yFk = pNum(d.f_k !== undefined && d.f_k !== '' ? d.f_k : d.fk);
    const yPdDd = pNum(d.pd_dd !== undefined && d.pd_dd !== '' ? d.pd_dd : d.pddd);
    const customSermaye = pNum(d.sermaye);
    const sermaye = (customSermaye !== null && customSermaye > 0) ? customSermaye : ctx.odenmisSermaye;

    const hasFavok = ciro !== null && favokMarji !== null;
    const hasNetKar = ciro !== null && netKarMarji !== null;
    const favok = hasFavok ? ciro * (favokMarji / 100) : null;
    const netKar = hasNetKar ? ciro * (netKarMarji / 100) : null;

    const past3FavokConv = isQuarterly ? (ctx.past3Favok / fxMult) : 0;
    const past3NetKarConv = isQuarterly ? (ctx.past3NetKar / fxMult) : 0;
    const netBorcConv = ctx.netBorc / fxMult;

    const ttmFavok = hasFavok ? (favok + past3FavokConv) : null;
    const ttmNetKar = hasNetKar ? (netKar + past3NetKarConv) : null;

    const pdByFdFavok = (hasFavok && yFdFavok !== null && yFdFavok > 0) ? ((ttmFavok * yFdFavok) - netBorcConv) : null;
    const pdByFk = (hasNetKar && yFk !== null && yFk > 0) ? (ttmNetKar * yFk) : null;
    const pdByPdDd = (ozkaynaklar !== null && yPdDd !== null && yPdDd > 0) ? (ozkaynaklar * yPdDd) : null;

    const validPDs = [pdByFdFavok, pdByFk, pdByPdDd].filter(v => v !== null && isFinite(v));
    const hfByFdFavok = (pdByFdFavok !== null && sermaye > 0) ? (pdByFdFavok / sermaye) * fxMult : null;
    const hfByFk = (pdByFk !== null && sermaye > 0) ? (pdByFk / sermaye) * fxMult : null;
    const hfByPdDd = (pdByPdDd !== null && sermaye > 0) ? (pdByPdDd / sermaye) * fxMult : null;

    let hedefFiyatTL = null;
    let potansiyelPct = null;
    let potansiyelRatio = null;

    if (validPDs.length > 0 && sermaye > 0) {
        const avgPD = validPDs.reduce((s, v) => s + v, 0) / validPDs.length;
        hedefFiyatTL = (avgPD / sermaye) * fxMult;
        if (ctx.guncelFiyat > 0) {
            potansiyelRatio = (hedefFiyatTL - ctx.guncelFiyat) / ctx.guncelFiyat;
            potansiyelPct = potansiyelRatio * 100;
        }
    }

    return {
        period, isQuarterly, currency: curCurrency, fxMult,
        ciro, favokMarji, netKarMarji, ozkaynaklar,
        yFdFavok, yFk, yPdDd, sermaye,
        hasFavok, hasNetKar, favok, netKar, ttmFavok, ttmNetKar,
        pdByFdFavok, pdByFk, pdByPdDd,
        hfByFdFavok, hfByFk, hfByPdDd,
        methodCount: validPDs.length,
        hasHedef: hedefFiyatTL !== null,
        hedefFiyatTL, potansiyelPct, potansiyelRatio
    };
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

    const validTabs = ['Özet Rapor', 'Değerleme', 'Bilanço', 'Gelir Tablosu', 'Nakit Akım Tablosu', 'Akış'];
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
                    <a href="${filePath}" target="_blank" style="display: inline-block; padding: 0.8rem 2rem; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: var(--border-radius); font-weight: bold; transition: all 0.3s ease;">
                        Eğer açılmadıysa buraya tıklayın
                    </a>
                    <iframe src="${filePath}" style="display:none;"></iframe>
                </div>
            `;
        }
        return `
            <div style="margin-top: 0;">
                <embed src="${filePath}" type="application/pdf" width="100%" height="800px" style="border-radius: var(--border-radius); border: 1px solid var(--surface-border);" />
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
        if (window.Chart) {
            Object.values(Chart.instances).forEach(chart => {
                if (chart) chart.destroy();
            });
        }
        const tabIcons = {
            'Özet Rapor': 'fas fa-chart-pie',
            'Değerleme': 'fas fa-gem',
            'Bilanço': 'fas fa-balance-scale',
            'Gelir Tablosu': 'fas fa-file-invoice-dollar',
            'Nakit Akım Tablosu': 'fas fa-water',
            'Akış': 'fas fa-stream'
        };

        const makeBtn = (t) => `<button type="button" class="ekstre-tab-pill ${activeTab === t ? 'active' : ''}" onclick="window.setHisseTab('${t}')"><i class="${tabIcons[t] || 'fas fa-file'}"></i><span>${t}</span></button>`;

        let tabsHtml = makeBtn('Özet Rapor') + makeBtn('Değerleme') + makeBtn('Bilanço') + makeBtn('Gelir Tablosu') + makeBtn('Nakit Akım Tablosu') + makeBtn('Akış');

        let contentHtml = '';

        if (!selectedHisse) {
            // GENEL NOTLAR (STICKY NOTES) EKRANI
            if (!State.data.genelNotlar) State.data.genelNotlar = [];
            const colors = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#e67e22'];
            let notesHtml = State.data.genelNotlar.map(not => `
                <div class="sticky-note" style="background-color: ${not.color || '#f1c40f'}; padding: 1rem; border-radius: 8px; color: #000; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12); position: relative; display: flex; flex-direction: column; min-height: 200px;">
                    <textarea 
                        style="flex: 1; background: transparent; border: none; color: #000; font-family: 'Comic Sans MS', 'Gochi Hand', sans-serif; font-size: 1.1rem; resize: none; outline: none;" 
                        oninput="window.updateGenelNot('${not.id}', this.value)"
                        placeholder="Notunuzu buraya yazın..."
                    >${not.text}</textarea>
                    <div style="display:flex; justify-content:flex-end; align-items:center; margin-top: 0.5rem; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 0.5rem;">
                        <div style="display:flex; gap: 4px;">
                            ${colors.map(col => `<div onclick="window.changeGenelNotColor('${not.id}', '${col}')" style="width:15px; height:15px; border-radius:50%; background:${col}; cursor:pointer; border: 1px solid rgba(0,0,0,0.2);"></div>`).join('')}
                        </div>
                        <button class="btn btn-icon" style="padding: 2px; background: transparent; color: var(--text-secondary); border: none;" onclick="window.deleteGenelNot('${not.id}')"><i class="fas fa-trash-alt"></i></button>
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
                window.deleteGenelNot = async (id) => { if (await window.showConfirm('Bu notu silmek istediğinize emin misiniz?')) { State.data.genelNotlar = State.data.genelNotlar.filter(n => n.id !== id); State.save(); renderUI(); window.showToast('Not silindi.', 'info'); } };
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

                    let color = isNegative ? '#dc2626' : '#059669';
                    if (options.reverseColor) {
                        color = isNegative ? '#059669' : '#dc2626';
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
                                <th style="text-align:left !important; font-size:13.5px !important; color: var(--table-header-text) !important; font-weight:700 !important;">Özet Gelir Tablosu</th>
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
                                <th style="text-align:left !important; font-size:13.5px !important; color: var(--table-header-text) !important; font-weight:700 !important;">Özet Bilanço</th>
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
                <div style="display:flex; flex-direction:column; gap: 1rem; margin-top: 0;">
                        
                        <!-- Row 1: Özet Gelir & Bilanço -->
                        <div class="grid-2-col">
                            <div class="dash-card" style="margin-bottom:0; padding: 1.15rem;">
                                <div class="ozet-table-scroll">
                                    ${gelirHtml || '<div style="opacity:0.5; text-align:center;">Veri bulunamadı</div>'}
                                </div>
                            </div>
                            <div class="dash-card" style="margin-bottom:0; padding: 1.15rem;">
                                <div class="ozet-table-scroll">
                                    ${bilancoHtml || '<div style="opacity:0.5; text-align:center;">Veri bulunamadı</div>'}
                                </div>
                            </div>
                        </div>

                        <!-- Row 2: Çarpanlar, Kaynak Dağılımı, Şirket Detayları -->
                        <div class="grid-3-col">
                            
                            <!-- Çarpanlar -->
                            <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.15rem;">
                                <div class="dash-title" style="font-size: 15px; font-weight: 700; margin-bottom: 0.75rem;">Çarpanlar</div>
                                <table class="dash-table compact-table" style="flex: 1;">
                                    <tbody>
                                        <tr style="border-bottom: 1px solid var(--table-border);">
                                            <td style="text-align: left !important;">F/K</td>
                                            <td style="text-align: right !important; font-weight:600 !important;">${fmtDec(fk)}</td>
                                        </tr>
                                        <tr style="border-bottom: 1px solid var(--table-border);">
                                            <td style="text-align: left !important;">FD/FAVÖK</td>
                                            <td style="text-align: right !important; font-weight:600 !important;">${fmtDec(fdFavok)}</td>
                                        </tr>
                                        <tr style="border-bottom: 1px solid var(--table-border);">
                                            <td style="text-align: left !important;">PD/DD</td>
                                            <td style="text-align: right !important; font-weight:600 !important;">${fmtDec(pdDd)}</td>
                                        </tr>
                                        <tr>
                                            <td style="text-align: left !important;">Net Borç / FAVÖK</td>
                                            <td style="text-align: right !important; font-weight:600 !important;">${fmtDec(netBorcFavok)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <!-- Kaynak Dağılımı -->
                            <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.15rem;">
                                <div class="dash-title" style="font-size: 15px; font-weight: 700; margin-bottom: 0.8rem;">Kaynak Dağılımı</div>
                                <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
                                    <div style="display:flex; height: 12px; border-radius: 6px; overflow:hidden; margin-bottom: 1.25rem;">
                                        <div style="width:${pctOz}%; background:#6c5ce7;" title="Özkaynaklar: %${pctOz}"></div>
                                        <div style="width:${pctKisa}%; background:#fd79a8;" title="Kısa Vade Yükümlülükler: %${pctKisa}"></div>
                                        <div style="width:${pctUzun}%; background:#636e72;" title="Uzun Vade Yükümlülükler: %${pctUzun}"></div>
                                    </div>
                                    <div style="display:flex; flex-wrap:wrap; justify-content:center; gap: 0.85rem; font-size: 13px; font-weight: 500; color:var(--text-secondary);">
                                        <div style="display:flex; align-items:center; gap:5px;"><div style="width:9px;height:9px;border-radius:50%;background:#6c5ce7;"></div>Özkaynaklar: %${pctOz}</div>
                                        <div style="display:flex; align-items:center; gap:5px;"><div style="width:9px;height:9px;border-radius:50%;background:#fd79a8;"></div>Kısa Vade Yük.: %${pctKisa}</div>
                                        <div style="display:flex; align-items:center; gap:5px;"><div style="width:9px;height:9px;border-radius:50%;background:#636e72;"></div>Uzun Vade Yük.: %${pctUzun}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Şirket Detayları -->
                            <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.15rem;">
                                <div class="dash-title" style="font-size: 15px; font-weight: 700; margin-bottom: 0.75rem;">Şirket Detayları</div>
                                <table class="dash-table compact-table" style="flex: 1;">
                                    <tbody>
                                        <tr style="border-bottom: 1px solid var(--table-border);">
                                            <td style="text-align: left !important;">Hisse Başına Kar</td>
                                            <td style="text-align: right !important; font-weight:600 !important;">${fmtDec(hbk)}</td>
                                        </tr>
                                        <tr style="border-bottom: 1px solid var(--table-border);">
                                            <td style="text-align: left !important;">Ödenmiş Sermaye</td>
                                            <td style="text-align: right !important; font-weight:600 !important;">${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(odenmisSermaye)}</td>
                                        </tr>
                                        <tr>
                                            <td style="text-align: left !important;">Piyasa Değeri</td>
                                            <td style="text-align: right !important; font-weight:600 !important;">₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(piyasaDegeri)}</td>
                                        </tr>
                                        <tr>
                                            <td style="text-align: left !important;">Piyasa Değeri $</td>
                                            <td style="text-align: right !important; font-weight:600 !important;">$${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(piyasaDegeriUsd)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Row 3: Marj ve Oran Grafikleri (3 Sütunlu Grid) -->
                        <div class="grid-3-col">
                            <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.15rem;">
                                <div class="dash-title" style="font-size: 15px; font-weight: 700;">Brüt Kar Marjı</div>
                                <div style="flex: 1; min-height: 235px; position: relative;"><canvas id="chart-bkm"></canvas></div>
                            </div>

                            <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.15rem;">
                                <div class="dash-title" style="font-size: 15px; font-weight: 700;">FAVÖK Marjı</div>
                                <div style="flex: 1; min-height: 235px; position: relative;"><canvas id="chart-fkm"></canvas></div>
                            </div>

                            <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.15rem;">
                                <div class="dash-title" style="font-size: 15px; font-weight: 700;">Net Kar Marjı</div>
                                <div style="flex: 1; min-height: 235px; position: relative;"><canvas id="chart-nkm"></canvas></div>
                            </div>

                            <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.15rem;">
                                <div class="dash-title" style="font-size: 15px; font-weight: 700;">Cari Oran</div>
                                <div style="flex: 1; min-height: 235px; position: relative;"><canvas id="chart-cari"></canvas></div>
                            </div>

                            <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.15rem;">
                                <div class="dash-title" style="font-size: 15px; font-weight: 700;">Kaldıraç Oranı</div>
                                <div style="flex: 1; min-height: 235px; position: relative;"><canvas id="chart-kaldirac"></canvas></div>
                            </div>

                            <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.15rem;">
                                <div class="dash-title" style="font-size: 15px; font-weight: 700;">Özkaynak Karlılığı (ROE)</div>
                                <div style="flex: 1; min-height: 235px; position: relative;"><canvas id="chart-roe"></canvas></div>
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
                <div style="display:flex; flex-direction:column; gap: 1rem; margin-top: 0;">
                    
                    <div class="grid-3-col" style="margin-bottom: 1rem;">
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Satış Gelirleri (Çeyreklik)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-ceyreklik-satislar"></canvas></div>
                        </div>

                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Satış Gelirleri (Dönemsel)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-donemsel-satislar"></canvas></div>
                        </div>

                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Satış Gelirleri (Yıllıklandırılmış)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-yillik-satislar"></canvas></div>
                        </div>
                    </div>

                    <div class="dash-card" style="margin-bottom:1rem; display:flex; flex-direction:column; padding: 1.2rem;">
                        <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                            <span>Satış Gelirleri</span>
                            <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                        </div>
                        <div style="flex:1; min-height:400px; min-width: 0; position:relative;"><canvas id="chart-combined-satislar"></canvas></div>
                    </div>

                    <div class="grid-3-col" style="margin-bottom: 1rem;">
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Brüt Kar (Çeyreklik)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-ceyreklik-brut"></canvas></div>
                        </div>

                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Brüt Kar (Dönemsel)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-donemsel-brut"></canvas></div>
                        </div>

                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Brüt Kar (Yıllıklandırılmış)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-yillik-brut"></canvas></div>
                        </div>
                    </div>

                    <div class="dash-card" style="margin-bottom:1rem; display:flex; flex-direction:column; padding: 1.2rem;">
                        <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                            <span>Brüt Kar</span>
                            <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                        </div>
                        <div style="flex:1; min-height:400px; min-width: 0; position:relative;"><canvas id="chart-combined-brut"></canvas></div>
                    </div>

                    <div class="grid-3-col" style="margin-bottom: 1rem;">
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Esas Faaliyet Karı (Çeyreklik)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-ceyreklik-faaliyet"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Esas Faaliyet Karı (Dönemsel)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-donemsel-faaliyet"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Esas Faaliyet Karı (Yıllıklandırılmış)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-yillik-faaliyet"></canvas></div>
                        </div>
                    </div>
                    <div class="dash-card" style="margin-bottom:1rem; display:flex; flex-direction:column; padding: 1.2rem;">
                        <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                            <span>Esas Faaliyet Karı</span>
                            <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                        </div>
                        <div style="flex:1; min-height:400px; min-width: 0; position:relative;"><canvas id="chart-combined-faaliyet"></canvas></div>
                    </div>

                    <div class="grid-3-col" style="margin-bottom: 1rem;">
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>FAVÖK (Çeyreklik)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-ceyreklik-favok2"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>FAVÖK (Dönemsel)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-donemsel-favok"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>FAVÖK (Yıllıklandırılmış)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-yillik-favok"></canvas></div>
                        </div>
                    </div>
                    <div class="dash-card" style="margin-bottom:1rem; display:flex; flex-direction:column; padding: 1.2rem;">
                        <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                            <span>FAVÖK</span>
                            <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                        </div>
                        <div style="flex:1; min-height:400px; min-width: 0; position:relative;"><canvas id="chart-combined-favok"></canvas></div>
                    </div>

                    <div class="grid-3-col" style="margin-bottom: 1rem;">
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Net Kar (Çeyreklik)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-ceyreklik-netkar2"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Net Kar (Dönemsel)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-donemsel-netkar"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                                <span>Net Kar (Yıllıklandırılmış)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-yillik-netkar"></canvas></div>
                        </div>
                    </div>
                    <div class="dash-card" style="margin-bottom:1rem; display:flex; flex-direction:column; padding: 1.2rem;">
                        <div class="dash-title" style="position:relative; font-size: 15px !important; color: #113A5D !important; font-weight: 700 !important; text-align: left !important; justify-content: flex-start !important; padding-right: 20px;">
                            <span>Net Kar</span>
                            <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                        </div>
                        <div style="flex:1; min-height:400px; min-width: 0; position:relative;"><canvas id="chart-combined-netkar"></canvas></div>
                    </div>
                </div>
                `;
                window.shouldRenderDashboardCharts = true;
            } else if (activeTab === 'Bilanço') {
                const hasBilanco = sData && sData.bilanco && sData.bilanco.headers && sData.bilanco.rows && sData.bilanco.rows.length > 0;
                const latestPeriod = hasBilanco && sData.bilanco.headers[1] ? sData.bilanco.headers[1] : null;
                const cloudMeta = window._cloudFinancialsMeta && window._cloudFinancialsMeta[selectedHisse];
                const safeSelB = window.escapeHtml(selectedHisse);
                const cloudDateStr = cloudMeta && cloudMeta.updatedAt
                    ? new Date(cloudMeta.updatedAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : '';

                const statusBadgeHtml = cloudMeta
                    ? `<span class="ekstre-badge ekstre-badge-acik" title="Buluta yüklenme: ${window.escapeHtml(cloudDateStr)}"><i class="fas fa-cloud-check"></i> Bulut Güncel (${window.escapeHtml(cloudMeta.latestPeriod || latestPeriod || '-')})</span>`
                    : (hasBilanco
                        ? `<span class="ekstre-badge ekstre-badge-hisse">Son Dönem: ${window.escapeHtml(latestPeriod || '-')}</span>`
                        : `<span class="ekstre-badge ekstre-badge-kapali">Bilanço Yok</span>`);

                const bilancoToolbarHtml = `
                    <div class="glass" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.65rem; padding:0.75rem 1rem; border-radius:12px;">
                        <div style="display:flex; align-items:center; flex-wrap:wrap; gap:0.6rem;">
                            <span class="enf-panel-title">
                                <i class="fas fa-balance-scale" style="color:#0284c7;"></i>
                                <span>${safeSelB} Finansal Tablolar</span>
                            </span>
                            ${statusBadgeHtml}
                            ${cloudDateStr ? `<span style="font-size:12px; color:#64748b;">Yükleme: ${window.escapeHtml(cloudDateStr)}</span>` : ''}
                        </div>
                        <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                            ${cloudMeta ? `<button type="button" class="ekstre-ghost-btn reset" onclick="window.deleteCloudFinancials('${safeSelB}')" title="Buluta yüklenen bilançoyu kaldır"><i class="fas fa-trash-alt"></i><span>Bulutu Kaldır</span></button>` : ''}
                            <button type="button" class="btn ekstre-primary-cta" onclick="window.openBilancoUploadModal('${safeSelB}')">
                                <i class="fas fa-cloud-arrow-up" style="color:#ffffff !important;"></i>
                                <span>Bilanço Yükle</span>
                            </button>
                        </div>
                    </div>
                `;

                const tBilancoTabDynamic = hasBilanco
                    ? genFintablesBilanco('Bilanço', sData.bilanco.headers, sData.bilanco.rows)
                    : `<div class="glass ekstre-empty-state" style="border-radius:12px;">
                        <i class="fas fa-balance-scale"></i>
                        <strong>${safeSelB} için bilanço verisi bulunamadı</strong>
                        <span>Fintables mali tablo dosyasını yüklediğinizde Bilanço, Gelir Tablosu, Nakit Akışı ve Değerleme verileri anında güncellenir.</span>
                        <button type="button" class="btn ekstre-primary-cta" style="margin-top:8px;" onclick="window.openBilancoUploadModal('${safeSelB}')">
                            <i class="fas fa-cloud-arrow-up" style="color:#ffffff !important;"></i>
                            <span>Bilanço Yükle</span>
                        </button>
                    </div>`;
                contentHtml = `
                <div style="display:flex; flex-direction:column; gap: 0.9rem; margin-top: 0;">
                    ${bilancoToolbarHtml}
                    ${tBilancoTabDynamic}
                </div>
                `;
            } else if (activeTab === 'Nakit Akım Tablosu') {
                window.nakitTabMode = window.nakitTabMode || 'yillik';
                window.setNakitTabMode = (mode) => {
                    window.nakitTabMode = mode;
                    renderUI();
                };

                const sheetYillik = sData && sData.nakitYillik && sData.nakitYillik.rows ? sData.nakitYillik : (sData && sData.nakitAkim && sData.nakitAkim.rows ? sData.nakitAkim : null);
                const sheetCeyrek = sData && sData.nakitCeyrek && sData.nakitCeyrek.rows ? sData.nakitCeyrek : null;
                const sheetDonemsel = sData && sData.nakitDonemsel && sData.nakitDonemsel.rows ? sData.nakitDonemsel : null;

                let activeNakitSheet = sheetYillik;
                if (window.nakitTabMode === 'ceyrek' && sheetCeyrek) activeNakitSheet = sheetCeyrek;
                else if (window.nakitTabMode === 'donemsel' && sheetDonemsel) activeNakitSheet = sheetDonemsel;
                else if (!activeNakitSheet) activeNakitSheet = sheetDonemsel || sheetCeyrek;

                const hasNakit = activeNakitSheet && activeNakitSheet.headers && activeNakitSheet.rows && activeNakitSheet.rows.length > 0;

                const extractCashSeries = (sheet) => {
                    if (!sheet || !sheet.headers || !sheet.rows) return null;
                    const parseN = (v) => {
                        if (typeof v === 'number') return isFinite(v) ? v : 0;
                        if (!v || v === '-') return 0;
                        const p = parseFloat(String(v).replace(/\./g, '').replace(/,/g, '.'));
                        return isNaN(p) ? 0 : p;
                    };
                    const findRow = (substr) => sheet.rows.find(r => r[0] && r[0].toString().toLocaleLowerCase('tr-TR').includes(substr));
                    const rIsl = findRow('işletme faaliyetlerinden nakit akış');
                    const rYat = findRow('yatırım faaliyetlerinden kaynaklanan nakit akış');
                    const rFin = findRow('finansman faaliyetlerinden nakit akış');
                    if (!rIsl && !rYat && !rFin) return null;
                    const maxPts = Math.min(sheet.headers.length - 1, 12);
                    const labels = [];
                    const isletme = [], yatirim = [], finansman = [];
                    for (let i = maxPts; i >= 1; i--) {
                        labels.push(String(sheet.headers[i] || ''));
                        isletme.push(rIsl ? parseN(rIsl[i]) : 0);
                        yatirim.push(rYat ? parseN(rYat[i]) : 0);
                        finansman.push(rFin ? parseN(rFin[i]) : 0);
                    }
                    return { labels, isletme, yatirim, finansman };
                };

                window.nakitChartPayload = hasNakit ? {
                    ceyrek: extractCashSeries(sheetCeyrek || sheetDonemsel),
                    yillik: extractCashSeries(sheetYillik || sheetDonemsel)
                } : null;

                if (hasNakit) {
                    const tNakitDynamic = genFintablesBilanco('Nakit Akım', activeNakitSheet.headers, activeNakitSheet.rows);
                    contentHtml = `
                    <div style="display:flex; flex-direction:column; gap: 1rem; margin-top: 0;">
                        ${(window.nakitChartPayload.ceyrek || window.nakitChartPayload.yillik) ? `
                        <div class="grid-2-col">
                            <div class="dash-card" style="margin-bottom: 0;">
                                <div class="dash-title">Çeyreklik Nakit Akışları</div>
                                <div style="position: relative; height: 250px;"><canvas id="chart-nakit-q"></canvas></div>
                            </div>
                            <div class="dash-card" style="margin-bottom: 0;">
                                <div class="dash-title">Yıllıklandırılmış Nakit Akışları</div>
                                <div style="position: relative; height: 250px;"><canvas id="chart-nakit-y"></canvas></div>
                            </div>
                        </div>` : ''}
                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                            <div class="ekstre-segmented">
                                ${sheetYillik ? `<button type="button" class="ekstre-seg-btn ${window.nakitTabMode === 'yillik' ? 'active' : ''}" onclick="window.setNakitTabMode('yillik')">Yıllıklandırılmış</button>` : ''}
                                ${sheetCeyrek ? `<button type="button" class="ekstre-seg-btn ${window.nakitTabMode === 'ceyrek' ? 'active' : ''}" onclick="window.setNakitTabMode('ceyrek')">Çeyreklik</button>` : ''}
                                ${sheetDonemsel ? `<button type="button" class="ekstre-seg-btn ${window.nakitTabMode === 'donemsel' ? 'active' : ''}" onclick="window.setNakitTabMode('donemsel')">Dönemsel</button>` : ''}
                            </div>
                        </div>
                        ${tNakitDynamic}
                    </div>
                    `;
                    window.shouldRenderDashboardCharts = true;
                } else {
                    contentHtml = `<div class="glass ekstre-empty-state" style="border-radius:12px;"><i class="fas fa-water"></i><strong>${window.escapeHtml(selectedHisse)} için nakit akım tablosu bulunamadı</strong><span>Bu hissenin Excel mali tablosu eklendiğinde nakit akışı grafikleri ve tablosu burada görüntülenir.</span></div>`;
                }
            } else if (['Likidite Oranları', 'Kaldıraç Oranları', 'Faaliyet Etkinlik Oranları', 'Karlılık Oranları', 'Diğer Kalemler'].includes(activeTab)) {
                contentHtml = `<div style="display:flex; justify-content:center; align-items:center; height:200px; opacity:0.5; font-style:italic;">${activeTab} sayfası henüz yapım aşamasındadır.</div>`;
            } else if (activeTab === 'Değerleme') {
                if (!window.degerlemeEditMode) window.degerlemeEditMode = {};
                if (!window.araDegerlemeEditMode) window.araDegerlemeEditMode = {};
                if (window.degShowPast === undefined) window.degShowPast = true;

                const degCtx = window.getDegerlemeStockContext(selectedHisse);
                const sDataDeg = degCtx.sData;
                const bilancoHeaders = (sDataDeg && sDataDeg.bilanco && sDataDeg.bilanco.headers) ? sDataDeg.bilanco.headers : [];

                if (!State.data.degerleme) State.data.degerleme = {};
                if (!State.data.degerleme[selectedHisse]) State.data.degerleme[selectedHisse] = {};
                if (!State.data.araDegerleme) State.data.araDegerleme = {};
                if (!State.data.araDegerleme[selectedHisse]) State.data.araDegerleme[selectedHisse] = {};

                const stateData = State.data.degerleme[selectedHisse];
                const araStateData = State.data.araDegerleme[selectedHisse];

                // Combine notes cleanly
                let savedNotYil = stateData.genelNotYil !== undefined ? stateData.genelNotYil : (stateData.genelNot || '');
                let savedNotAra = stateData.genelNotAra || '';
                let combinedNot = savedNotYil;
                if (savedNotAra && savedNotAra !== savedNotYil) {
                    combinedNot = combinedNot ? (combinedNot + '\n\n' + savedNotAra) : savedNotAra;
                }

                // Determine past quarters (up to 4)
                const pastQuarters = [];
                const pastIndices = [];
                for (let i = 1; i <= Math.min(4, bilancoHeaders.length - 1); i++) {
                    pastQuarters.push(bilancoHeaders[i]);
                    pastIndices.push(i);
                }
                pastQuarters.reverse();
                pastIndices.reverse();

                // Determine next quarter
                let nextQuarter = 'Gelecek Çeyrek';
                if (pastQuarters.length > 0) {
                    const latestQ = pastQuarters[pastQuarters.length - 1];
                    if (latestQ.includes('/')) {
                        const parts = latestQ.split('/');
                        let y = parseInt(parts[0], 10);
                        let m = parseInt(parts[1], 10) + 3;
                        if (m > 12) { m = m % 12 || 12; y += 1; }
                        nextQuarter = `${y}/${m}`;
                    }
                }

                // Determine next 5 annual years
                let nextYearNum = new Date().getFullYear();
                if (nextQuarter !== 'Gelecek Çeyrek' && nextQuarter.includes('/')) {
                    nextYearNum = parseInt(nextQuarter.split('/')[0], 10);
                }
                const annualYears = [];
                for (let i = 0; i < 5; i++) annualYears.push(String(nextYearNum + i));

                const forecastPeriods = [nextQuarter, ...annualYears];
                const visiblePeriods = window.degShowPast ? [...pastQuarters, ...forecastPeriods] : [...forecastPeriods];

                const getPeriodRaw = (p) => (p.includes('/') ? (araStateData[p] || {}) : (stateData[p] || {}));

                const setPeriodField = (hisse, p, field, value) => {
                    const store = p.includes('/') ? State.data.araDegerleme : State.data.degerleme;
                    if (!store[hisse]) store[hisse] = {};
                    if (!store[hisse][p]) store[hisse][p] = {};
                    if (value === '' || value === null || value === undefined) {
                        delete store[hisse][p][field];
                    } else {
                        store[hisse][p][field] = value;
                    }
                    // Keep legacy fk/pddd keys synchronized/cleaned so all readers agree
                    if (field === 'f_k') delete store[hisse][p].fk;
                    if (field === 'pd_dd') delete store[hisse][p].pddd;
                };

                window.enterDegerlemeEdit = (p, key) => {
                    window.degerlemeEditMode = {};
                    window.araDegerlemeEditMode = {};
                    if (p.includes('/')) window.araDegerlemeEditMode[p] = true;
                    else window.degerlemeEditMode[p] = true;
                    window.degerlemeFocusPeriod = p;
                    window.degerlemeFocusKey = key;
                    renderUI();
                };

                window.exitDegerlemeEdit = (p) => {
                    if (p.includes('/')) window.araDegerlemeEditMode[p] = false;
                    else window.degerlemeEditMode[p] = false;
                    if (typeof window.recalculateHedefFiyatlar === 'function') window.recalculateHedefFiyatlar();
                    renderUI();
                };

                window.updateDegerlemeInputUnified = (hisse, p, field, value, shouldRender = true) => {
                    setPeriodField(hisse, p, field, value);
                    if (typeof window.recalculateHedefFiyatlar === 'function') window.recalculateHedefFiyatlar();
                    State.save();
                    if (shouldRender) renderUI();
                };

                window.cycleDegerlemeCurrency = (hisse, p) => {
                    const cur = (getPeriodRaw(p).currency || 'TRY');
                    const next = cur === 'TRY' ? 'USD' : (cur === 'USD' ? 'EUR' : 'TRY');
                    window.updateDegerlemeInputUnified(hisse, p, 'currency', next, true);
                };

                window.setDegShowPast = (show) => {
                    window.degShowPast = !!show;
                    renderUI();
                };

                window.setDegBreakdownPeriod = (p) => {
                    window.degBreakdownPeriod = p;
                    renderUI();
                };

                window.saveDegerlemeNotUnified = (hisse) => {
                    if (!State.data.degerleme[hisse]) State.data.degerleme[hisse] = {};
                    const input = document.getElementById('degerleme-not-input');
                    if (!input) return;
                    State.data.degerleme[hisse].genelNotYil = input.value;
                    if (State.data.degerleme[hisse].genelNotAra) State.data.degerleme[hisse].genelNotAra = '';
                    State.save();
                    const badge = document.getElementById('deg-note-save-badge');
                    if (badge) {
                        badge.classList.add('visible');
                        setTimeout(() => badge.classList.remove('visible'), 1800);
                    }
                };

                // Helper to fetch historical quarterly data
                const parseTRLocal = (str) => {
                    if (str === undefined || str === null || str === '' || str === '-') return '';
                    if (typeof str === 'number') return str;
                    const p = parseFloat(String(str).replace(/\./g, '').replace(/,/g, '.'));
                    return isNaN(p) ? '' : p;
                };
                const fetchHistVal = (key, idx) => {
                    if (!sDataDeg) return '';
                    let r = null;
                    if (key === 'ciro' && sDataDeg.gelirCeyrek && sDataDeg.gelirCeyrek.rows) {
                        r = sDataDeg.gelirCeyrek.rows.find(x => x[0] && (String(x[0]).toLocaleLowerCase('tr-TR').includes('satış gelirleri') || String(x[0]).toLocaleLowerCase('tr-TR').includes('hasılat')));
                    } else if (key === 'favok' && sDataDeg.gelirCeyrek && sDataDeg.gelirCeyrek.rows) {
                        r = sDataDeg.gelirCeyrek.rows.find(x => x[0] && String(x[0]).toLocaleLowerCase('tr-TR').includes('favök'));
                    } else if (key === 'net_kar' && sDataDeg.gelirCeyrek && sDataDeg.gelirCeyrek.rows) {
                        r = sDataDeg.gelirCeyrek.rows.find(x => x[0] && (String(x[0]).toLocaleLowerCase('tr-TR').includes('ana ortaklık payları') || String(x[0]).toLocaleLowerCase('tr-TR').includes('dönem net kar')));
                    } else if (key === 'ozkaynaklar' && sDataDeg.bilanco && sDataDeg.bilanco.rows) {
                        r = sDataDeg.bilanco.rows.find(x => x[0] && String(x[0]).toLocaleLowerCase('tr-TR').includes('ana ortaklığa ait özkaynaklar'));
                        if (!r) r = sDataDeg.bilanco.rows.find(x => x[0] && String(x[0]).toLocaleLowerCase('tr-TR').trim() === 'özkaynaklar');
                    }
                    return (r && r[idx] !== undefined && r[idx] !== '') ? parseTRLocal(r[idx]) : '';
                };

                // Precompute all forecast periods with unified engine
                const forecastComputed = {};
                forecastPeriods.forEach(p => {
                    forecastComputed[p] = window.computeDegerlemePeriod(p, getPeriodRaw(p), degCtx);
                });

                // Period Modal Editor (full input form + 1-click baseline / growth fill + live preview)
                window.openDegerlemePeriodModal = (hisse, period) => {
                    const existingOverlay = document.getElementById('deg-period-modal-overlay');
                    if (existingOverlay) existingOverlay.remove();

                    const ctxModal = window.getDegerlemeStockContext(hisse);
                    const isQ = String(period).includes('/');
                    const raw = isQ ? ((State.data.araDegerleme[hisse] && State.data.araDegerleme[hisse][period]) || {}) : ((State.data.degerleme[hisse] && State.data.degerleme[hisse][period]) || {});
                    let modalCurr = raw.currency || 'TRY';

                    const fmtDecM = (v) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
                    const fmtIntM = (v) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(Math.round(v));
                    const initFk = raw.f_k !== undefined && raw.f_k !== '' ? raw.f_k : (raw.fk !== undefined ? raw.fk : '');
                    const initPdDd = raw.pd_dd !== undefined && raw.pd_dd !== '' ? raw.pd_dd : (raw.pddd !== undefined ? raw.pddd : '');

                    // Previous year key for +%20 growth shortcut
                    const prevYearKey = !isQ ? String(parseInt(period, 10) - 1) : null;
                    const hasPrevYear = prevYearKey && State.data.degerleme[hisse] && State.data.degerleme[hisse][prevYearKey] && Object.keys(State.data.degerleme[hisse][prevYearKey]).length > 0;

                    const overlay = document.createElement('div');
                    overlay.id = 'deg-period-modal-overlay';
                    overlay.className = 'ekstre-modal-overlay';
                    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

                    overlay.innerHTML = `
                        <div class="ekstre-modal-card" role="dialog" aria-modal="true" style="width: min(560px, 100%);">
                            <div class="ekstre-modal-header">
                                <h3>
                                    <i class="fas fa-gem" style="color: #0284c7;"></i>
                                    <span>${window.escapeHtml(hisse)} · ${window.escapeHtml(period)} Tahmin Modeli</span>
                                </h3>
                                <button type="button" class="ekstre-modal-close" aria-label="Kapat" onclick="document.getElementById('deg-period-modal-overlay')?.remove()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <form id="deg-period-modal-form" class="ekstre-modal-body">
                                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
                                    <div class="ekstre-segmented" id="dpm-curr-group">
                                        <button type="button" class="ekstre-seg-btn ${modalCurr === 'TRY' ? 'active' : ''}" data-curr="TRY">₺ TRY</button>
                                        <button type="button" class="ekstre-seg-btn ${modalCurr === 'USD' ? 'active' : ''}" data-curr="USD">$ USD</button>
                                        <button type="button" class="ekstre-seg-btn ${modalCurr === 'EUR' ? 'active' : ''}" data-curr="EUR">€ EUR</button>
                                    </div>
                                    <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                                        <button type="button" class="ekstre-shortcut-pill" id="dpm-fill-base" title="Mevcut gerçekleşen veriyi baz şablon olarak doldur">
                                            <i class="fas fa-magic"></i> ${isQ ? 'Son Çeyreği Baz Al' : 'Son TTM Baz Al'}
                                        </button>
                                        ${hasPrevYear ? `<button type="button" class="ekstre-shortcut-pill" id="dpm-fill-grow" title="${prevYearKey} tahminini %20 büyüterek aktar"><i class="fas fa-arrow-trend-up"></i> ${prevYearKey} +%20</button>` : ''}
                                        <button type="button" class="ekstre-shortcut-pill danger" id="dpm-clear-btn">Temizle</button>
                                    </div>
                                </div>

                                <div class="ekstre-form-grid-2">
                                    <div class="ekstre-field">
                                        <label for="dpm-ciro">Satış Gelirleri (<span class="dpm-curr-sym">${modalCurr}</span>)</label>
                                        <input type="number" id="dpm-ciro" class="form-control" step="any" placeholder="Örn: 35000000000" value="${raw.ciro !== undefined ? raw.ciro : ''}">
                                    </div>
                                    <div class="ekstre-field">
                                        <label for="dpm-ozkaynak">Özkaynaklar (<span class="dpm-curr-sym">${modalCurr}</span>)</label>
                                        <input type="number" id="dpm-ozkaynak" class="form-control" step="any" placeholder="Örn: 28000000000" value="${raw.ozkaynaklar !== undefined ? raw.ozkaynaklar : ''}">
                                    </div>
                                </div>

                                <div class="ekstre-form-grid-2">
                                    <div class="ekstre-field">
                                        <label for="dpm-favok-m">FAVÖK Marjı (%)</label>
                                        <input type="number" id="dpm-favok-m" class="form-control" step="any" placeholder="Örn: 22.5" value="${raw.favok_marji !== undefined ? raw.favok_marji : ''}">
                                    </div>
                                    <div class="ekstre-field">
                                        <label for="dpm-netkar-m">Net Kâr Marjı (%)</label>
                                        <input type="number" id="dpm-netkar-m" class="form-control" step="any" placeholder="Örn: 14.0" value="${raw.net_kar_marji !== undefined ? raw.net_kar_marji : ''}">
                                    </div>
                                </div>

                                <div class="ekstre-form-grid-3">
                                    <div class="ekstre-field">
                                        <label for="dpm-fdfavok">Hedef FD/FAVÖK</label>
                                        <input type="number" id="dpm-fdfavok" class="form-control" step="any" min="0" placeholder="${ctxModal.guncelFdFavok > 0 ? ctxModal.guncelFdFavok.toFixed(1) : '7.0'}" value="${raw.fd_favok !== undefined ? raw.fd_favok : ''}">
                                    </div>
                                    <div class="ekstre-field">
                                        <label for="dpm-fk">Hedef F/K</label>
                                        <input type="number" id="dpm-fk" class="form-control" step="any" min="0" placeholder="${ctxModal.guncelFk > 0 ? ctxModal.guncelFk.toFixed(1) : '10.0'}" value="${initFk}">
                                    </div>
                                    <div class="ekstre-field">
                                        <label for="dpm-pddd">Hedef PD/DD</label>
                                        <input type="number" id="dpm-pddd" class="form-control" step="any" min="0" placeholder="${ctxModal.guncelPdDd > 0 ? ctxModal.guncelPdDd.toFixed(1) : '2.0'}" value="${initPdDd}">
                                    </div>
                                </div>

                                <div id="dpm-live-preview" class="ekstre-total-preview"></div>

                                <div class="ekstre-modal-footer" style="margin: 0.25rem -1.35rem -1.25rem -1.35rem;">
                                    <button type="button" class="ekstre-ghost-btn" onclick="document.getElementById('deg-period-modal-overlay')?.remove()">İptal</button>
                                    <button type="submit" class="btn" style="padding: 9px 22px;">
                                        <i class="fas fa-check" style="margin-right: 6px; color: #ffffff !important;"></i>Tahmini Kaydet
                                    </button>
                                </div>
                            </form>
                        </div>
                    `;

                    document.body.appendChild(overlay);

                    const fCiro = document.getElementById('dpm-ciro');
                    const fOz = document.getElementById('dpm-ozkaynak');
                    const fFm = document.getElementById('dpm-favok-m');
                    const fNm = document.getElementById('dpm-netkar-m');
                    const fFd = document.getElementById('dpm-fdfavok');
                    const fFk = document.getElementById('dpm-fk');
                    const fPd = document.getElementById('dpm-pddd');
                    const previewBox = document.getElementById('dpm-live-preview');

                    const getFormDraft = () => ({
                        currency: modalCurr,
                        ciro: fCiro.value,
                        ozkaynaklar: fOz.value,
                        favok_marji: fFm.value,
                        net_kar_marji: fNm.value,
                        fd_favok: fFd.value,
                        f_k: fFk.value,
                        pd_dd: fPd.value
                    });

                    const updatePreview = () => {
                        const res = window.computeDegerlemePeriod(period, getFormDraft(), ctxModal);
                        overlay.querySelectorAll('.dpm-curr-sym').forEach(el => { el.textContent = modalCurr; });
                        if (res.hasHedef) {
                            const isUp = res.potansiyelPct === null || res.potansiyelPct >= 0;
                            previewBox.className = 'ekstre-total-preview ' + (isUp ? 'alis' : 'satis');
                            const parts = [];
                            if (res.hfByFdFavok !== null) parts.push(`FD/FAVÖK: ₺${fmtDecM(res.hfByFdFavok)}`);
                            if (res.hfByFk !== null) parts.push(`F/K: ₺${fmtDecM(res.hfByFk)}`);
                            if (res.hfByPdDd !== null) parts.push(`PD/DD: ₺${fmtDecM(res.hfByPdDd)}`);
                            const potTxt = res.potansiyelPct !== null ? `${res.potansiyelPct >= 0 ? '%+' : '%-'}${fmtDecM(Math.abs(res.potansiyelPct))}` : '-';
                            previewBox.innerHTML = `
                                <div>
                                    <div class="ekstre-total-preview-label">Hesaplanan Hedef Fiyat (${res.methodCount} yöntem ort.)</div>
                                    <div style="font-size:12px; color:#475569; margin-top:3px;">${parts.join(' · ')}</div>
                                </div>
                                <div style="text-align:right;">
                                    <div class="ekstre-total-preview-value" style="color:${isUp ? '#047857' : '#b91c1c'};">₺${fmtDecM(res.hedefFiyatTL)}</div>
                                    <div style="font-size:12.5px; font-weight:700; color:${isUp ? '#059669' : '#dc2626'};">Potansiyel: ${potTxt}</div>
                                </div>
                            `;
                        } else {
                            previewBox.className = 'ekstre-total-preview';
                            const fkSub = res.hasFavok ? `FAVÖK: ${fmtIntM(res.favok)}` : 'Satış + Marj ve en az bir çarpan girin';
                            previewBox.innerHTML = `
                                <div>
                                    <div class="ekstre-total-preview-label">Canlı Değerleme Önizlemesi</div>
                                    <div style="font-size:12px; color:#64748b; margin-top:2px;">${fkSub}</div>
                                </div>
                                <div class="ekstre-total-preview-value" style="color:#64748b;">---</div>
                            `;
                        }
                    };

                    overlay.querySelectorAll('#dpm-curr-group button').forEach(b => {
                        b.addEventListener('click', () => {
                            modalCurr = b.getAttribute('data-curr') || 'TRY';
                            overlay.querySelectorAll('#dpm-curr-group button').forEach(x => x.classList.toggle('active', x === b));
                            updatePreview();
                        });
                    });

                    document.getElementById('dpm-fill-base')?.addEventListener('click', () => {
                        const fxDiv = modalCurr === 'USD' ? ctxModal.usdKuru : (modalCurr === 'EUR' ? ctxModal.eurKuru : 1);
                        let baseCiro = 0, baseFavok = 0, baseNetKar = 0;
                        if (isQ && pastIndices.length > 0) {
                            const lastIdx = pastIndices[pastIndices.length - 1];
                            baseCiro = parseFloat(fetchHistVal('ciro', lastIdx)) || 0;
                            baseFavok = parseFloat(fetchHistVal('favok', lastIdx)) || 0;
                            baseNetKar = parseFloat(fetchHistVal('net_kar', lastIdx)) || 0;
                        } else {
                            baseCiro = ctxModal.ttmSatis || 0;
                            baseFavok = ctxModal.ttmFavok || 0;
                            baseNetKar = ctxModal.ttmNetKar || 0;
                        }
                        if (baseCiro > 0) {
                            fCiro.value = Math.round(baseCiro / fxDiv);
                            if (baseFavok) fFm.value = ((baseFavok / baseCiro) * 100).toFixed(2);
                            if (baseNetKar) fNm.value = ((baseNetKar / baseCiro) * 100).toFixed(2);
                        }
                        if (ctxModal.anaOrtaklikOzkaynak > 0) fOz.value = Math.round(ctxModal.anaOrtaklikOzkaynak / fxDiv);
                        if (ctxModal.guncelFdFavok > 0 && ctxModal.guncelFdFavok < 40) fFd.value = ctxModal.guncelFdFavok.toFixed(2);
                        if (ctxModal.guncelFk > 0 && ctxModal.guncelFk < 60) fFk.value = ctxModal.guncelFk.toFixed(2);
                        if (ctxModal.guncelPdDd > 0 && ctxModal.guncelPdDd < 20) fPd.value = ctxModal.guncelPdDd.toFixed(2);
                        updatePreview();
                    });

                    document.getElementById('dpm-fill-grow')?.addEventListener('click', () => {
                        const prev = State.data.degerleme[hisse] && State.data.degerleme[hisse][prevYearKey];
                        if (!prev) return;
                        if (prev.currency) {
                            modalCurr = prev.currency;
                            overlay.querySelectorAll('#dpm-curr-group button').forEach(x => x.classList.toggle('active', x.getAttribute('data-curr') === modalCurr));
                        }
                        if (prev.ciro) fCiro.value = Math.round(parseFloat(prev.ciro) * 1.2);
                        if (prev.ozkaynaklar) fOz.value = Math.round(parseFloat(prev.ozkaynaklar) * 1.2);
                        if (prev.favok_marji !== undefined) fFm.value = prev.favok_marji;
                        if (prev.net_kar_marji !== undefined) fNm.value = prev.net_kar_marji;
                        if (prev.fd_favok !== undefined) fFd.value = prev.fd_favok;
                        const prevFk = prev.f_k !== undefined ? prev.f_k : prev.fk;
                        const prevPd = prev.pd_dd !== undefined ? prev.pd_dd : prev.pddd;
                        if (prevFk !== undefined) fFk.value = prevFk;
                        if (prevPd !== undefined) fPd.value = prevPd;
                        updatePreview();
                    });

                    document.getElementById('dpm-clear-btn')?.addEventListener('click', () => {
                        [fCiro, fOz, fFm, fNm, fFd, fFk, fPd].forEach(el => { el.value = ''; });
                        updatePreview();
                    });

                    [fCiro, fOz, fFm, fNm, fFd, fFk, fPd].forEach(el => el.addEventListener('input', updatePreview));
                    updatePreview();

                    const onKeyDown = (ke) => {
                        if (ke.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onKeyDown); }
                    };
                    document.addEventListener('keydown', onKeyDown);

                    document.getElementById('deg-period-modal-form').addEventListener('submit', (ev) => {
                        ev.preventDefault();
                        const draft = getFormDraft();
                        Object.entries(draft).forEach(([k, v]) => setPeriodField(hisse, period, k, v));
                        if (typeof window.recalculateHedefFiyatlar === 'function') window.recalculateHedefFiyatlar();
                        State.save();
                        document.removeEventListener('keydown', onKeyDown);
                        overlay.remove();
                        window.showToast(`${hisse} · ${period} tahmini kaydedildi.`, 'success');
                        renderUI();
                    });

                    setTimeout(() => fCiro.focus(), 30);
                };

                // --- Formatters ---
                const fmtDecD = (v) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
                const fmtIntD = (v) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(Math.round(v));
                const fmtCompactM = (v, sym = '₺') => {
                    if (!v || isNaN(v) || !isFinite(v)) return '-';
                    const abs = Math.abs(v);
                    const sign = v < 0 ? '-' : '';
                    if (abs >= 1e9) return `${sign}${sym}${fmtDecD(abs / 1e9)} Mlr`;
                    if (abs >= 1e6) return `${sign}${sym}${fmtDecD(abs / 1e6)} Mn`;
                    return `${sign}${sym}${fmtIntD(abs)}`;
                };
                const fmtPotStr = (pct) => {
                    if (pct === null || pct === undefined || isNaN(pct)) return '-';
                    const formatted = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Math.abs(pct));
                    return pct < 0 ? `%-${formatted}` : `%+${formatted}`;
                };

                // --- 4 Executive KPI Cards ---
                const gbRes = forecastComputed[nextQuarter];
                const y1Key = annualYears[0];
                const y1Res = forecastComputed[y1Key];
                // Find furthest annual year with target price for Long-Term CAGR KPI
                let longKey = annualYears[annualYears.length - 1];
                let longRes = null;
                for (let i = annualYears.length - 1; i >= 0; i--) {
                    if (forecastComputed[annualYears[i]] && forecastComputed[annualYears[i]].hasHedef) {
                        longKey = annualYears[i];
                        longRes = forecastComputed[annualYears[i]];
                        break;
                    }
                }
                let longCagr = null;
                if (longRes && longRes.hasHedef && degCtx.guncelFiyat > 0) {
                    const yrsAhead = Math.max(1, parseInt(longKey, 10) - new Date().getFullYear() + 0.5);
                    if (longRes.hedefFiyatTL > 0) {
                        longCagr = (Math.pow(longRes.hedefFiyatTL / degCtx.guncelFiyat, 1 / yrsAhead) - 1) * 100;
                    }
                }

                const kpiDegHtml = `
                    <div class="kpi-grid">
                        <div class="kpi-card">
                            <div class="kpi-icon-box slate"><i class="fas fa-tag"></i></div>
                            <div class="kpi-info">
                                <div class="kpi-label">Güncel Fiyat & Çarpanlar</div>
                                <div class="kpi-value">${degCtx.guncelFiyat > 0 ? '₺' + fmtDecD(degCtx.guncelFiyat) : '-'}</div>
                                <div class="kpi-sub">F/K: ${degCtx.guncelFk > 0 ? fmtDecD(degCtx.guncelFk) : '-'} · FD/FAVÖK: ${degCtx.guncelFdFavok > 0 ? fmtDecD(degCtx.guncelFdFavok) : '-'} · PD/DD: ${degCtx.guncelPdDd > 0 ? fmtDecD(degCtx.guncelPdDd) : '-'}</div>
                            </div>
                        </div>
                        <div class="kpi-card takip-kpi-clickable" onclick="window.openDegerlemePeriodModal('${window.escapeHtml(selectedHisse)}', '${window.escapeHtml(nextQuarter)}')" title="${window.escapeHtml(nextQuarter)} tahminini düzenle">
                            <div class="kpi-icon-box ${gbRes && gbRes.hasHedef ? (gbRes.potansiyelPct >= 0 ? 'green' : 'red') : 'navy'}"><i class="fas fa-bolt"></i></div>
                            <div class="kpi-info">
                                <div class="kpi-label">Gelecek Bilanço (${window.escapeHtml(nextQuarter)})</div>
                                <div class="kpi-value" style="color:${gbRes && gbRes.hasHedef ? (gbRes.potansiyelPct >= 0 ? 'var(--success-color)' : 'var(--danger-color)') : 'var(--text-primary)'};">${gbRes && gbRes.hasHedef ? '₺' + fmtDecD(gbRes.hedefFiyatTL) : 'Tahmin Gir'}</div>
                                <div class="kpi-sub">${gbRes && gbRes.hasHedef ? `Potansiyel: <strong>${fmtPotStr(gbRes.potansiyelPct)}</strong> · ${gbRes.methodCount} çarpan` : 'Düzenlemek için tıklayın'}</div>
                            </div>
                        </div>
                        <div class="kpi-card takip-kpi-clickable" onclick="window.openDegerlemePeriodModal('${window.escapeHtml(selectedHisse)}', '${window.escapeHtml(y1Key)}')" title="${window.escapeHtml(y1Key)} tahminini düzenle">
                            <div class="kpi-icon-box ${y1Res && y1Res.hasHedef ? (y1Res.potansiyelPct >= 0 ? 'green' : 'red') : 'navy'}"><i class="fas fa-bullseye"></i></div>
                            <div class="kpi-info">
                                <div class="kpi-label">${y1Key} Yıl Sonu Hedef</div>
                                <div class="kpi-value" style="color:${y1Res && y1Res.hasHedef ? (y1Res.potansiyelPct >= 0 ? 'var(--success-color)' : 'var(--danger-color)') : 'var(--text-primary)'};">${y1Res && y1Res.hasHedef ? '₺' + fmtDecD(y1Res.hedefFiyatTL) : 'Tahmin Gir'}</div>
                                <div class="kpi-sub">${y1Res && y1Res.hasHedef ? `Potansiyel: <strong>${fmtPotStr(y1Res.potansiyelPct)}</strong> · ${y1Res.methodCount} çarpan` : 'Düzenlemek için tıklayın'}</div>
                            </div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-icon-box ${longRes && longRes.hasHedef ? (longRes.potansiyelPct >= 0 ? 'green' : 'red') : 'slate'}"><i class="fas fa-arrow-trend-up"></i></div>
                            <div class="kpi-info">
                                <div class="kpi-label">Uzun Vade (${longKey}) & CAGR</div>
                                <div class="kpi-value" style="color:${longRes && longRes.hasHedef ? (longRes.potansiyelPct >= 0 ? 'var(--success-color)' : 'var(--danger-color)') : 'var(--text-primary)'};">${longRes && longRes.hasHedef ? '₺' + fmtDecD(longRes.hedefFiyatTL) : '-'}</div>
                                <div class="kpi-sub">${longRes && longRes.hasHedef ? `Pot: ${fmtPotStr(longRes.potansiyelPct)}${longCagr !== null ? ` · Yıllık CAGR: ${fmtPotStr(longCagr)}` : ''}` : `Net Borç: ${fmtCompactM(degCtx.netBorc)}`}</div>
                            </div>
                        </div>
                    </div>
                `;

                // --- Analytics Row: Target Trajectory Chart + Method Breakdown ---
                const periodsWithTarget = forecastPeriods.filter(p => forecastComputed[p] && forecastComputed[p].hasHedef);
                if (!window.degBreakdownPeriod || !forecastPeriods.includes(window.degBreakdownPeriod)) {
                    window.degBreakdownPeriod = periodsWithTarget[0] || nextQuarter;
                }
                const activeBrkPeriod = window.degBreakdownPeriod;
                const brkRes = forecastComputed[activeBrkPeriod];

                window.degerlemeChartPayload = periodsWithTarget.length > 0 ? {
                    labels: periodsWithTarget,
                    targets: periodsWithTarget.map(p => Number(forecastComputed[p].hedefFiyatTL.toFixed(2))),
                    potentials: periodsWithTarget.map(p => forecastComputed[p].potansiyelPct !== null ? Number(forecastComputed[p].potansiyelPct.toFixed(1)) : 0),
                    currentPrice: degCtx.guncelFiyat
                } : null;

                const netBorcLabel = degCtx.netBorc < 0 ? 'Net Nakit Pozisyonu' : 'Net Borç';
                const netBorcColor = degCtx.netBorc < 0 ? '#059669' : '#0f172a';

                const analyticsHtml = `
                    <div class="deg-analytics-grid">
                        <div class="enf-panel-card">
                            <div class="enf-panel-header">
                                <span class="enf-panel-title">
                                    <i class="fas fa-chart-bar" style="color:#0284c7;"></i>
                                    <span>Hedef Fiyat Yörüngesi (₺)</span>
                                </span>
                                ${degCtx.guncelFiyat > 0 ? `<span class="hisse-metric-chip">Güncel Fiyat: <strong>₺${fmtDecD(degCtx.guncelFiyat)}</strong></span>` : ''}
                            </div>
                            <div class="enf-chart-canvas-wrap" style="height: 235px;">
                                ${periodsWithTarget.length > 0
                                    ? `<canvas id="chart-degerleme-trajectory"></canvas>`
                                    : `<div class="ekstre-empty-state" style="padding: 2rem;"><i class="fas fa-chart-line"></i><strong>Henüz hedef fiyat oluşmadı</strong><span>Aşağıdaki tablodan bir dönem seçip satış, marj ve çarpan girdiğinizde grafik otomatik çizilir.</span></div>`
                                }
                            </div>
                        </div>

                        <div class="enf-panel-card">
                            <div class="enf-panel-header">
                                <span class="enf-panel-title">
                                    <i class="fas fa-layer-group" style="color:#059669;"></i>
                                    <span>Çarpan Kırılımı</span>
                                </span>
                                <select class="ekstre-select" style="height:30px; font-size:12px; padding:0 24px 0 8px !important;" onchange="window.setDegBreakdownPeriod(this.value)">
                                    ${forecastPeriods.map(p => `<option value="${window.escapeHtml(p)}" ${p === activeBrkPeriod ? 'selected' : ''}>${window.escapeHtml(p)}</option>`).join('')}
                                </select>
                            </div>
                            <div class="deg-breakdown-list">
                                <div class="deg-breakdown-row">
                                    <span>FD/FAVÖK Bazlı Hedef</span>
                                    <strong>${brkRes && brkRes.hfByFdFavok !== null ? '₺' + fmtDecD(brkRes.hfByFdFavok) : '-'}</strong>
                                </div>
                                <div class="deg-breakdown-row">
                                    <span>F/K Bazlı Hedef</span>
                                    <strong>${brkRes && brkRes.hfByFk !== null ? '₺' + fmtDecD(brkRes.hfByFk) : '-'}</strong>
                                </div>
                                <div class="deg-breakdown-row">
                                    <span>PD/DD Bazlı Hedef</span>
                                    <strong>${brkRes && brkRes.hfByPdDd !== null ? '₺' + fmtDecD(brkRes.hfByPdDd) : '-'}</strong>
                                </div>
                                <div class="deg-breakdown-row highlight">
                                    <span>Ortalama Hedef (${window.escapeHtml(activeBrkPeriod)})</span>
                                    <strong>${brkRes && brkRes.hasHedef ? '₺' + fmtDecD(brkRes.hedefFiyatTL) : '-'}</strong>
                                </div>
                                <div style="height:1px; background:#e2e8f0; margin:2px 0;"></div>
                                <div style="display:flex; justify-content:space-between; font-size:12px; color:#64748b;">
                                    <span>Ödenmiş Sermaye: <strong style="color:#0f172a;">${degCtx.odenmisSermaye > 0 ? fmtIntD(degCtx.odenmisSermaye) : '-'}</strong></span>
                                    <span>${netBorcLabel}: <strong style="color:${netBorcColor};">${fmtCompactM(Math.abs(degCtx.netBorc))}</strong></span>
                                </div>
                                <div style="display:flex; justify-content:space-between; font-size:11.5px; color:#64748b;">
                                    <span>USD Kur: <strong>₺${fmtDecD(degCtx.usdKuru)}</strong></span>
                                    <span>EUR Kur: <strong>₺${fmtDecD(degCtx.eurKuru)}</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // --- 2-Tier Grouped Valuation Matrix Table (ZERO icons inside <th>!) ---
                const pastColCount = window.degShowPast ? pastQuarters.length : 0;
                const groupHeaderHtml = `
                    <tr class="deg-group-head">
                        <th class="deg-sticky-label" rowspan="2" style="vertical-align: middle;">Kalem</th>
                        ${pastColCount > 0 ? `<th colspan="${pastColCount}" class="deg-th-past">Gerçekleşen Son ${pastColCount} Çeyrek</th>` : ''}
                        <th colspan="1" class="deg-th-next">Gelecek Bilanço</th>
                        <th colspan="${annualYears.length}" class="deg-th-year">Yıllık Projeksiyonlar (${annualYears[0]}–${annualYears[annualYears.length - 1]})</th>
                    </tr>
                    <tr>
                        ${visiblePeriods.map(p => {
                            const cls = pastQuarters.includes(p) ? 'deg-th-past' : (p === nextQuarter ? 'deg-th-next' : 'deg-th-year');
                            return `<th class="${cls} deg-col-min">${window.escapeHtml(p)}</th>`;
                        }).join('')}
                    </tr>
                `;

                // Control row inside tbody (Currency toggle + Modal Edit button per forecast period)
                const ctrlRowHtml = `
                    <tr class="deg-ctrl-row">
                        <td class="deg-sticky-label">Dönem Kontrolü</td>
                        ${visiblePeriods.map(p => {
                            if (pastQuarters.includes(p)) {
                                return `<td style="text-align:center !important; font-size:11.5px !important; color:#94a3b8 !important;">Gerçekleşen</td>`;
                            }
                            const curr = getPeriodRaw(p).currency || 'TRY';
                            const currSym = curr === 'USD' ? '$' : (curr === 'EUR' ? '€' : '₺');
                            const safeP = window.escapeHtml(p);
                            const safeH = window.escapeHtml(selectedHisse);
                            return `
                                <td class="${p === nextQuarter ? 'deg-cell-next-col' : ''}" style="text-align:center !important;">
                                    <div class="deg-col-controls">
                                        <button type="button" class="deg-curr-btn" onclick="window.cycleDegerlemeCurrency('${safeH}', '${safeP}')" title="Para birimini değiştir (TRY / USD / EUR)">${currSym} ${curr}</button>
                                        <button type="button" class="deg-edit-col-btn" onclick="window.openDegerlemePeriodModal('${safeH}', '${safeP}')" title="${safeP} tahminlerini formdan düzenle"><i class="fas fa-pen"></i> Düzenle</button>
                                    </div>
                                </td>
                            `;
                        }).join('')}
                    </tr>
                `;

                const matrixRows = [
                    { key: 'ciro', label: 'Satış Gelirleri', type: 'currency_int' },
                    { key: 'favok_marji', label: 'FAVÖK Marjı (%)', type: 'percent' },
                    { key: 'net_kar_marji', label: 'Net Kâr Marjı (%)', type: 'percent' },
                    { key: 'favok', label: 'FAVÖK', readonly: true, computed: true, type: 'currency_int' },
                    { key: 'net_kar', label: 'Net Kâr', readonly: true, computed: true, type: 'currency_int' },
                    { key: 'ozkaynaklar', label: 'Özkaynaklar', type: 'currency_int' },
                    { key: 'fd_favok', label: 'FD/FAVÖK', type: 'decimal', sectionSep: true },
                    { key: 'f_k', label: 'F/K', type: 'decimal' },
                    { key: 'pd_dd', label: 'PD/DD', type: 'decimal' },
                    { key: 'hedef_fiyat', label: 'Hedef Fiyat (₺)', readonly: true, isTarget: true, type: 'target' },
                    { key: 'potansiyel', label: 'Potansiyel (%)', readonly: true, isPot: true, type: 'percent_target' }
                ];

                let matrixBodyHtml = ctrlRowHtml;
                matrixRows.forEach(r => {
                    const trClasses = [];
                    if (r.computed) trClasses.push('deg-row-computed');
                    if (r.sectionSep) trClasses.push('deg-row-section-sep');
                    if (r.isTarget) trClasses.push('deg-row-target');
                    if (r.isPot) trClasses.push('deg-row-pot');

                    matrixBodyHtml += `<tr class="${trClasses.join(' ')}"><td class="deg-sticky-label">${r.label}</td>`;

                    visiblePeriods.forEach(p => {
                        const isPast = pastQuarters.includes(p);
                        const isNext = p === nextQuarter;
                        const pSafe = p.replace(/[^a-zA-Z0-9_-]/g, '-');
                        const safeH = window.escapeHtml(selectedHisse);
                        const safeP = window.escapeHtml(p);

                        let rawVal = '';
                        let displayStr = '---';
                        let currencySymbol = '₺';
                        let cellTitle = '';
                        let extraStyle = '';
                        let heatCls = '';

                        if (isPast) {
                            const pIdx = pastIndices[pastQuarters.indexOf(p)];
                            const ciro = fetchHistVal('ciro', pIdx);
                            const favok = fetchHistVal('favok', pIdx);
                            const netKar = fetchHistVal('net_kar', pIdx);
                            const oz = fetchHistVal('ozkaynaklar', pIdx);
                            const histMap = {
                                ciro,
                                favok,
                                net_kar: netKar,
                                ozkaynaklar: oz,
                                favok_marji: (ciro !== '' && ciro !== 0 && favok !== '') ? (favok / ciro) * 100 : '',
                                net_kar_marji: (ciro !== '' && ciro !== 0 && netKar !== '') ? (netKar / ciro) * 100 : ''
                            };
                            rawVal = histMap[r.key] !== undefined ? histMap[r.key] : '';
                        } else {
                            const d = getPeriodRaw(p);
                            const comp = forecastComputed[p];
                            currencySymbol = comp.currency === 'USD' ? '$' : (comp.currency === 'EUR' ? '€' : '₺');

                            if (r.key === 'favok') rawVal = comp.hasFavok ? comp.favok : '';
                            else if (r.key === 'net_kar') rawVal = comp.hasNetKar ? comp.netKar : '';
                            else if (r.key === 'hedef_fiyat') {
                                rawVal = comp.hasHedef ? comp.hedefFiyatTL : '';
                                if (comp.hasHedef) {
                                    const parts = [];
                                    if (comp.hfByFdFavok !== null) parts.push(`FD/FAVÖK: ₺${fmtDecD(comp.hfByFdFavok)}`);
                                    if (comp.hfByFk !== null) parts.push(`F/K: ₺${fmtDecD(comp.hfByFk)}`);
                                    if (comp.hfByPdDd !== null) parts.push(`PD/DD: ₺${fmtDecD(comp.hfByPdDd)}`);
                                    cellTitle = parts.join(' · ');
                                    const isPos = comp.potansiyelPct === null || comp.potansiyelPct >= 0;
                                    extraStyle = `color:${isPos ? '#047857' : '#b91c1c'} !important;`;
                                }
                            } else if (r.key === 'potansiyel') {
                                rawVal = (comp.hasHedef && comp.potansiyelPct !== null) ? comp.potansiyelPct : '';
                                if (rawVal !== '') {
                                    extraStyle = `color:${rawVal >= 0 ? '#059669' : '#dc2626'} !important;`;
                                    if (rawVal >= 100) heatCls = 'takip-heat-high';
                                    else if (rawVal >= 50) heatCls = 'takip-heat-mid';
                                    else if (rawVal <= -15) heatCls = 'takip-heat-neg';
                                }
                            } else if (r.key === 'f_k') {
                                rawVal = d.f_k !== undefined && d.f_k !== '' ? d.f_k : (d.fk !== undefined ? d.fk : '');
                            } else if (r.key === 'pd_dd') {
                                rawVal = d.pd_dd !== undefined && d.pd_dd !== '' ? d.pd_dd : (d.pddd !== undefined ? d.pddd : '');
                            } else {
                                rawVal = d[r.key] !== undefined ? d[r.key] : '';
                            }
                        }

                        if (rawVal !== '' && rawVal !== null && rawVal !== undefined) {
                            const numVal = parseFloat(String(rawVal).replace(',', '.'));
                            if (!isNaN(numVal) && isFinite(numVal)) {
                                if (r.type === 'target') displayStr = '₺' + fmtDecD(numVal);
                                else if (r.type === 'currency_int') displayStr = currencySymbol === '€' ? (fmtIntD(numVal) + '€') : (currencySymbol + fmtIntD(numVal));
                                else if (r.type === 'percent') {
                                    const f = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(Math.abs(numVal));
                                    displayStr = numVal < 0 ? '%-' + f : '%' + f;
                                } else if (r.type === 'percent_target') {
                                    const f = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Math.abs(numVal));
                                    displayStr = numVal < 0 ? '%-' + f : '%+' + f;
                                } else if (r.type === 'decimal') {
                                    displayStr = fmtDecD(numVal);
                                }
                            }
                        }

                        const editMode = !isPast && (p.includes('/') ? window.araDegerlemeEditMode[p] : window.degerlemeEditMode[p]);
                        const colExtraCls = isNext ? 'deg-cell-next-col' : '';

                        if (editMode && !r.readonly) {
                            matrixBodyHtml += `
                                <td class="editing-column-${pSafe} ${colExtraCls}" style="text-align:right !important; padding:4px 6px !important;">
                                    <input id="edit-input-${pSafe}-${r.key}" class="deg-inline-input" type="number" step="any"
                                        value="${rawVal !== '' ? window.escapeHtml(rawVal) : ''}"
                                        oninput="window.updateDegerlemeInputUnified('${safeH}', '${safeP}', '${r.key}', this.value, false)"
                                        onkeydown="if(event.key === 'Enter' || event.key === 'Escape') { event.preventDefault(); window.exitDegerlemeEdit('${safeP}'); }"
                                        onblur="setTimeout(() => { if (!document.activeElement || !document.activeElement.closest('.editing-column-${pSafe}')) { window.exitDegerlemeEdit('${safeP}'); } }, 120)">
                                </td>`;
                        } else if (!isPast && !r.readonly) {
                            matrixBodyHtml += `<td class="editing-column-${pSafe} deg-cell-editable ${colExtraCls}" style="text-align:right !important; ${extraStyle}" onclick="window.enterDegerlemeEdit('${safeP}', '${r.key}')" title="Düzenlemek için tıklayın">${displayStr}</td>`;
                        } else {
                            const pastCls = isPast ? 'deg-cell-past' : '';
                            matrixBodyHtml += `<td class="${pastCls} ${colExtraCls} ${heatCls}" style="text-align:right !important; ${extraStyle}" ${cellTitle ? `title="${window.escapeHtml(cellTitle)}"` : ''}>${displayStr}</td>`;
                        }
                    });
                    matrixBodyHtml += `</tr>`;
                });

                if (window.degerlemeFocusPeriod && window.degerlemeFocusKey) {
                    const fpSafe = window.degerlemeFocusPeriod.replace(/[^a-zA-Z0-9_-]/g, '-');
                    const fkKey = window.degerlemeFocusKey;
                    setTimeout(() => {
                        const el = document.getElementById(`edit-input-${fpSafe}-${fkKey}`);
                        if (el) { el.focus(); el.select(); }
                        window.degerlemeFocusPeriod = null;
                        window.degerlemeFocusKey = null;
                    }, 40);
                }

                contentHtml = `
                    <div style="display:flex; flex-direction:column; gap:0.95rem;">
                        ${kpiDegHtml}
                        ${analyticsHtml}

                        <!-- Valuation Matrix Card -->
                        <div class="glass ekstre-card-shell">
                            <div class="ekstre-toolbar-top">
                                <div>
                                    <span class="enf-panel-title">
                                        <i class="fas fa-table" style="color:#0284c7;"></i>
                                        <span>${window.escapeHtml(selectedHisse)} Değerleme Modeli</span>
                                    </span>
                                    <div style="font-size:12px; color:#64748b; margin-top:2px;">Hücreye tek tıklayarak hızlı düzenleyin veya sütundaki <strong>Düzenle</strong> butonuyla tüm varsayımları girin.</div>
                                </div>
                                <div style="display:flex; align-items:center; gap:0.55rem; flex-wrap:wrap;">
                                    ${pastQuarters.length > 0 ? `
                                    <div class="ekstre-segmented">
                                        <button type="button" class="ekstre-seg-btn ${window.degShowPast ? 'active' : ''}" onclick="window.setDegShowPast(true)">Geçmiş + Tahmin</button>
                                        <button type="button" class="ekstre-seg-btn ${!window.degShowPast ? 'active' : ''}" onclick="window.setDegShowPast(false)">Sadece Tahminler</button>
                                    </div>` : ''}
                                    <button type="button" class="btn ekstre-primary-cta" onclick="window.openDegerlemePeriodModal('${window.escapeHtml(selectedHisse)}', '${window.escapeHtml(nextQuarter)}')">
                                        <i class="fas fa-sliders" style="color:#ffffff !important;"></i>
                                        <span>Tahmin Düzenle</span>
                                    </button>
                                </div>
                            </div>

                            <div class="deg-table-scroll">
                                <table class="dash-table compact-table deg-table">
                                    <thead>${groupHeaderHtml}</thead>
                                    <tbody>${matrixBodyHtml}</tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Valuation Notes Card -->
                        <div class="deg-notes-card">
                            <div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem;">
                                <span class="enf-panel-title">
                                    <i class="fas fa-note-sticky" style="color:#d97706;"></i>
                                    <span>Değerleme Varsayımları & Notlar</span>
                                </span>
                                <span id="deg-note-save-badge" class="deg-save-badge"><i class="fas fa-check-circle"></i> Kaydedildi</span>
                            </div>
                            <textarea id="degerleme-not-input" class="takip-note-textarea" style="min-height: 92px;" placeholder="Bu hisse için büyüme beklentisi, marj varsayımları, hedef çarpan gerekçesi veya risk notlarınız..." onblur="window.saveDegerlemeNotUnified('${window.escapeHtml(selectedHisse)}')">${window.escapeHtml(combinedNot)}</textarea>
                        </div>
                    </div>
                `;
                window.shouldRenderDashboardCharts = true;
            } else if (activeTab === 'Akış') {
                window.akisViewMode = window.akisViewMode || 'feed';
                window.akisFilterType = window.akisFilterType || 'all';
                window.akisFilterAuthor = window.akisFilterAuthor || 'all';
                window.akisSearchQuery = window.akisSearchQuery || '';

                window.setAkisViewMode = (mode) => {
                    window.akisViewMode = mode;
                    renderUI();
                };
                window.setAkisFilter = (key, val) => {
                    if (key === 'type') window.akisFilterType = val;
                    else if (key === 'author') window.akisFilterAuthor = val;
                    renderUI();
                };
                window.filterAkisFeed = (q) => {
                    window.akisSearchQuery = q || '';
                    if (typeof window.updateAkisViewOnly === 'function') window.updateAkisViewOnly();
                    else renderUI();
                };
                window.resetAkisFilters = () => {
                    window.akisSearchQuery = '';
                    window.akisFilterType = 'all';
                    window.akisFilterAuthor = 'all';
                    renderUI();
                };
                window.toggleAkisNoteExpand = (btn) => {
                    const noteEl = btn && btn.previousElementSibling;
                    if (!noteEl) return;
                    const expanded = !noteEl.classList.toggle('clamped');
                    btn.textContent = expanded ? 'Daha az göster' : 'Devamını gör';
                };

                const parseDateStr = (dStr) => {
                    if (!dStr || dStr === '-') return 0;
                    const s = String(dStr).replace(/[\s\._]/g, '-');
                    const p = s.split('-');
                    if (p.length >= 3) {
                        if (p[0].length === 4) return parseInt(p[0] + p[1].padStart(2, '0') + p[2].padStart(2, '0'), 10);
                        if (p[2].length === 4) return parseInt(p[2] + p[1].padStart(2, '0') + p[0].padStart(2, '0'), 10);
                    }
                    const clean = String(dStr).replace(/\D/g, '');
                    if (clean.length === 8) {
                        if (clean.startsWith('20')) return parseInt(clean, 10);
                        return parseInt(clean.substring(4, 8) + clean.substring(2, 4) + clean.substring(0, 2), 10);
                    }
                    return parseInt(clean, 10) || 0;
                };

                const detectLinkPlatform = (safeHref) => {
                    if (!safeHref) return { key: 'note', label: 'Analiz Notu', icon: 'fas fa-sticky-note', badgeCls: 'akis-badge-note', cardCls: '' };
                    const low = safeHref.toLowerCase();
                    if (low.includes('youtube.com') || low.includes('youtu.be')) {
                        return { key: 'youtube', label: 'YouTube', icon: 'fab fa-youtube', badgeCls: 'akis-badge-youtube', cardCls: 'type-youtube' };
                    }
                    if (low.includes('twitter.com') || low.includes('x.com')) {
                        return { key: 'x', label: 'X / Twitter', icon: 'fa-brands fa-x-twitter', badgeCls: 'akis-badge-x', cardCls: 'type-x' };
                    }
                    if (low.includes('kap.org.tr')) {
                        return { key: 'kap', label: 'KAP', icon: 'fas fa-landmark', badgeCls: 'akis-badge-kap', cardCls: 'type-kap' };
                    }
                    return { key: 'link', label: 'Web / Analiz', icon: 'fas fa-globe', badgeCls: 'akis-badge-link', cardCls: 'type-link' };
                };

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
                const formatWords = (str) => {
                    if (!str) return '-';
                    return str.split('_').map(w => trMap[w] || w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                };

                const buildUnifiedAkis = () => {
                    const list = [];
                    const upperSel = selectedHisse.toUpperCase();

                    // 1. Analizler & Kişisel Notlar
                    const analizler = (State.data.analizler || []).filter(a => (a.hisse || '').toUpperCase() === upperSel);
                    analizler.forEach(a => {
                        const isPers = !!(a.isKisiselNot || a.kurum === 'Yunus Şensoy' || (window.currentUser && (a.kurum === window.currentUser.displayName || a.borsaci === window.currentUser.displayName)));
                        const safeHref = window.sanitizeUrl ? window.sanitizeUrl(a.baglanti) : (a.baglanti || '');
                        const plat = isPers
                            ? { key: 'personal', label: 'Kişisel Not', icon: 'fas fa-thumbtack', badgeCls: 'akis-badge-personal', cardCls: 'type-personal' }
                            : detectLinkPlatform(safeHref);

                        const rawTitle = (a.baslik && a.baslik !== '-') ? a.baslik : (isPers ? 'Kişisel Yatırım Notu' : (safeHref ? safeHref.replace(/^https?:\/\/(www\.)?/, '').slice(0, 64) : 'Analiz Kaydı'));
                        list.push({
                            uid: 'an_' + a.id,
                            id: String(a.id),
                            type: 'analiz',
                            category: isPers ? 'personal' : 'link',
                            isPersonal: isPers,
                            plat,
                            title: rawTitle,
                            href: safeHref || '',
                            author: (a.borsaci && a.borsaci !== '-') ? a.borsaci : '',
                            note: (a.notText || '').trim(),
                            sortTarih: parseDateStr(a.tarih),
                            displayDate: a.tarih ? a.tarih.split('-').reverse().join('.') : '-',
                            editable: true,
                            deletable: true,
                            data: a
                        });
                    });

                    // 2. Local PDF Reports (Hisseler/<HISSE>/*.pdf)
                    const availablePdfs = (window.stockReports && window.stockReports[selectedHisse]) ? window.stockReports[selectedHisse] : [];
                    availablePdfs.forEach((file, idx) => {
                        let baseName = file.toLowerCase();
                        if (baseName.endsWith('.pdf')) baseName = baseName.substring(0, baseName.length - 4);
                        const cols = baseName.split('-');
                        let sirket = '-', tarih = '-', ad = '-';
                        if (/^\d+$/.test(cols[0])) {
                            if (cols.length >= 4) { ad = formatWords(cols[1]); tarih = formatWords(cols[2]); sirket = formatWords(cols[3]); }
                            else if (cols.length === 3) { ad = formatWords(cols[1]); tarih = formatWords(cols[2]); }
                            else if (cols.length === 2) { ad = formatWords(cols[1]); }
                        } else {
                            if (cols.length >= 3) { ad = formatWords(cols[0]); tarih = formatWords(cols[1]); sirket = formatWords(cols[2]); }
                            else if (cols.length === 2) { ad = formatWords(cols[0]); tarih = formatWords(cols[1]); }
                            else if (cols.length === 1) { ad = formatWords(cols[0]); }
                        }
                        const filePath = 'Hisseler/' + encodeURIComponent(selectedHisse) + '/' + encodeURIComponent(file);
                        list.push({
                            uid: 'loc_' + idx + '_' + file,
                            id: file,
                            type: 'report',
                            category: 'pdf',
                            isPersonal: false,
                            plat: { key: 'pdf', label: 'PDF Rapor', icon: 'fas fa-file-pdf', badgeCls: 'akis-badge-pdf', cardCls: 'type-pdf' },
                            title: (ad && ad !== '-') ? ad : file,
                            href: filePath,
                            author: (sirket && sirket !== '-') ? sirket : '',
                            note: '',
                            sortTarih: parseDateStr(tarih),
                            displayDate: (tarih && tarih !== '-') ? tarih : '-',
                            editable: false,
                            deletable: false,
                            isLocalPdf: true
                        });
                    });

                    // 3. Firebase Cloud PDF Reports
                    const uploadedPdfs = (State.data.uploadedReports || []).filter(r => (r.hisse || '').toUpperCase() === upperSel);
                    uploadedPdfs.forEach(r => {
                        let displayDate = '-';
                        if (r.tarih && r.tarih !== '-') {
                            displayDate = (r.tarih.includes('-') && r.tarih.split('-')[0].length === 4)
                                ? r.tarih.split('-').reverse().join('.')
                                : r.tarih;
                        }
                        list.push({
                            uid: 'fb_' + r.id,
                            id: String(r.id),
                            type: 'firebase_pdf',
                            category: 'pdf',
                            isPersonal: false,
                            plat: { key: 'pdf', label: 'Bulut PDF', icon: 'fas fa-file-pdf', badgeCls: 'akis-badge-pdf', cardCls: 'type-pdf' },
                            title: (r.name && r.name !== '-') ? r.name : (r.fileName || 'Rapor.pdf'),
                            href: '',
                            author: (r.company && r.company !== '-') ? r.company : '',
                            note: (r.notText || '').trim(),
                            sortTarih: parseDateStr(r.tarih),
                            displayDate,
                            editable: true,
                            deletable: true,
                            data: r
                        });
                    });

                    list.sort((a, b) => {
                        if (a.isPersonal && !b.isPersonal) return -1;
                        if (!a.isPersonal && b.isPersonal) return 1;
                        return b.sortTarih - a.sortTarih;
                    });
                    return list;
                };

                const filterAkisItems = (allItems) => {
                    const q = (window.akisSearchQuery || '').trim().toLocaleLowerCase('tr-TR');
                    const tF = window.akisFilterType || 'all';
                    const aF = window.akisFilterAuthor || 'all';

                    return allItems.filter(it => {
                        if (tF !== 'all' && it.category !== tF) return false;
                        if (aF !== 'all' && it.author !== aF) return false;
                        if (q) {
                            const hay = `${it.title} ${it.author} ${it.note} ${it.href} ${it.displayDate} ${it.plat.label}`.toLocaleLowerCase('tr-TR');
                            if (!hay.includes(q)) return false;
                        }
                        return true;
                    });
                };

                const renderCardItem = (it) => {
                    const safeTitle = window.escapeHtml(it.title);
                    const safeAuthor = window.escapeHtml(it.author);
                    const safeDate = window.escapeHtml(it.displayDate);
                    const safeNote = window.escapeHtml(it.note);
                    const safeId = window.escapeHtml(it.id);
                    const safeHisse = window.escapeHtml(selectedHisse);
                    const isLongNote = it.note.length > 360 || (it.note.match(/\n/g) || []).length >= 5;

                    let titleHtml = safeTitle;
                    let openBtnHtml = '';
                    if (it.type === 'firebase_pdf') {
                        titleHtml = `<a href="javascript:void(0)" onclick="window.openFirebasePdf('${safeId}')">${safeTitle} <i class="fas fa-arrow-up-right-from-square" style="font-size:11.5px; opacity:0.65;"></i></a>`;
                        openBtnHtml = `<button type="button" class="ekstre-action-btn edit" onclick="window.openFirebasePdf('${safeId}')" title="PDF'i Aç"><i class="fas fa-external-link-alt"></i></button>`;
                    } else if (it.href) {
                        const safeHrefAttr = window.escapeHtml(it.href);
                        titleHtml = `<a href="${safeHrefAttr}" target="_blank" rel="noopener noreferrer">${safeTitle} <i class="fas fa-arrow-up-right-from-square" style="font-size:11.5px; opacity:0.65;"></i></a>`;
                        openBtnHtml = `<a href="${safeHrefAttr}" target="_blank" rel="noopener noreferrer" class="ekstre-action-btn edit" title="Aç"><i class="fas fa-external-link-alt"></i></a>`;
                    }

                    const editBtnHtml = it.editable
                        ? `<button type="button" class="ekstre-action-btn edit" onclick="window.openAkisModal({ hisse: '${safeHisse}', editType: '${it.type}', editId: '${safeId}' })" title="Düzenle"><i class="fas fa-pen"></i></button>`
                        : '';
                    const delBtnHtml = it.deletable
                        ? `<button type="button" class="ekstre-action-btn delete" onclick="${it.type === 'firebase_pdf' ? `window.deleteFirebasePdf('${safeId}')` : `window.deleteAnaliz('${safeId}')`}" title="Sil"><i class="fas fa-trash-alt"></i></button>`
                        : '';

                    return `
                        <article class="akis-card ${it.plat.cardCls}" data-akis-uid="${window.escapeHtml(it.uid)}">
                            <div class="akis-card-top">
                                <div class="akis-card-meta">
                                    <span class="akis-source-badge ${it.plat.badgeCls}">
                                        <i class="${it.plat.icon}"></i>
                                        <span>${it.plat.label}</span>
                                    </span>
                                    ${it.author ? `<span class="akis-author-chip"><i class="fas fa-building-columns" style="font-size:10.5px; opacity:0.65;"></i> ${safeAuthor}</span>` : ''}
                                    <span class="akis-date-chip"><i class="far fa-calendar" style="font-size:11px;"></i> ${safeDate}</span>
                                </div>
                                <div class="ekstre-row-actions">
                                    ${openBtnHtml}${editBtnHtml}${delBtnHtml}
                                </div>
                            </div>
                            <h4 class="akis-card-title">${titleHtml}</h4>
                            ${it.note ? `<div class="akis-card-note ${isLongNote ? 'clamped' : ''}">${safeNote}</div>` : ''}
                            ${isLongNote ? `<button type="button" class="akis-expand-btn" onclick="window.toggleAkisNoteExpand(this)">Devamını gör</button>` : ''}
                        </article>
                    `;
                };

                const buildAkisBodyHtml = (allItems, visibleItems) => {
                    const safeHisse = window.escapeHtml(selectedHisse);
                    if (allItems.length === 0) {
                        return `
                            <div class="ekstre-empty-state">
                                <i class="fas fa-stream"></i>
                                <strong>${safeHisse} için henüz akış kaydı bulunmuyor</strong>
                                <span>Aracı kurum PDF raporları, YouTube/X analiz bağlantıları veya kişisel yatırım notlarınızı buradan takip edebilirsiniz.</span>
                                <div style="display:flex; gap:0.5rem; margin-top:8px;">
                                    <button type="button" class="btn ekstre-primary-cta" onclick="window.openAkisModal({ hisse: '${safeHisse}', mode: 'analiz' })"><i class="fas fa-plus" style="color:#ffffff !important;"></i> İlk Kaydı Ekle</button>
                                </div>
                            </div>
                        `;
                    }
                    if (visibleItems.length === 0) {
                        return `
                            <div class="ekstre-empty-state">
                                <i class="fas fa-filter"></i>
                                <strong>Arama veya filtrelere uygun kayıt bulunamadı</strong>
                                <button type="button" class="ekstre-ghost-btn reset" style="margin-top:6px;" onclick="window.resetAkisFilters()"><i class="fas fa-rotate-left"></i> Filtreleri Sıfırla</button>
                            </div>
                        `;
                    }

                    if (window.akisViewMode === 'table') {
                        const rowsHtml = visibleItems.map(it => {
                            const safeTitle = window.escapeHtml(it.title);
                            const safeId = window.escapeHtml(it.id);
                            let titleCell = safeTitle;
                            let openAct = '';
                            if (it.type === 'firebase_pdf') {
                                titleCell = `<a href="javascript:void(0)" class="akis-table-title-link" onclick="window.openFirebasePdf('${safeId}')">${safeTitle}</a>`;
                                openAct = `<button type="button" class="ekstre-action-btn edit" onclick="window.openFirebasePdf('${safeId}')" title="PDF'i Aç"><i class="fas fa-external-link-alt"></i></button>`;
                            } else if (it.href) {
                                const safeHrefAttr = window.escapeHtml(it.href);
                                titleCell = `<a href="${safeHrefAttr}" target="_blank" rel="noopener noreferrer" class="akis-table-title-link">${safeTitle}</a>`;
                                openAct = `<a href="${safeHrefAttr}" target="_blank" rel="noopener noreferrer" class="ekstre-action-btn edit" title="Aç"><i class="fas fa-external-link-alt"></i></a>`;
                            }
                            const editAct = it.editable
                                ? `<button type="button" class="ekstre-action-btn edit" onclick="window.openAkisModal({ hisse: '${safeHisse}', editType: '${it.type}', editId: '${safeId}' })" title="Düzenle"><i class="fas fa-pen"></i></button>`
                                : '';
                            const delAct = it.deletable
                                ? `<button type="button" class="ekstre-action-btn delete" onclick="${it.type === 'firebase_pdf' ? `window.deleteFirebasePdf('${safeId}')` : `window.deleteAnaliz('${safeId}')`}" title="Sil"><i class="fas fa-trash-alt"></i></button>`
                                : '';
                            return `
                                <tr data-akis-uid="${window.escapeHtml(it.uid)}">
                                    <td style="text-align:center !important;">
                                        <span class="akis-source-badge ${it.plat.badgeCls}"><i class="${it.plat.icon}"></i> ${it.plat.label}</span>
                                    </td>
                                    <td style="text-align:left !important; white-space:normal !important; min-width:190px; max-width:260px;">${titleCell}</td>
                                    <td style="text-align:center !important;">${window.escapeHtml(it.displayDate)}</td>
                                    <td style="text-align:left !important;">${window.escapeHtml(it.author || '-')}</td>
                                    <td style="text-align:left !important; white-space:pre-wrap !important; min-width:220px;">${window.escapeHtml(it.note || '-')}</td>
                                    <td style="text-align:center !important;">
                                        <div class="ekstre-row-actions">${openAct}${editAct}${delAct}</div>
                                    </td>
                                </tr>
                            `;
                        }).join('');

                        return `
                            <div class="takip-table-scroll">
                                <table class="dash-table compact-table akis-table" style="width:100%;">
                                    <thead>
                                        <tr>
                                            <th style="width:120px;">Kaynak</th>
                                            <th style="text-align:left !important;">Başlık</th>
                                            <th style="width:96px;">Tarih</th>
                                            <th style="text-align:left !important; width:145px;">Analist / Kurum</th>
                                            <th style="text-align:left !important;">Notlar</th>
                                            <th style="width:96px;">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody>${rowsHtml}</tbody>
                                </table>
                            </div>
                        `;
                    }

                    // Card Feed Mode: Separate Pinned Personal Notes from Chronological Research Feed
                    const personalItems = visibleItems.filter(x => x.isPersonal);
                    const externalItems = visibleItems.filter(x => !x.isPersonal);

                    let feedHtml = '';
                    if (personalItems.length > 0) {
                        feedHtml += `
                            <div>
                                <div class="akis-section-label"><i class="fas fa-thumbtack" style="color:#f59e0b;"></i> Sabitlenmiş Kişisel Notlar (${personalItems.length})</div>
                                <div class="akis-feed-list">${personalItems.map(renderCardItem).join('')}</div>
                            </div>
                        `;
                    }
                    if (externalItems.length > 0) {
                        feedHtml += `
                            <div style="${personalItems.length > 0 ? 'margin-top:0.5rem;' : ''}">
                                <div class="akis-section-label"><i class="fas fa-newspaper" style="color:#0284c7;"></i> Raporlar & Analiz Akışı (${externalItems.length})</div>
                                <div class="akis-feed-list">${externalItems.map(renderCardItem).join('')}</div>
                            </div>
                        `;
                    }
                    return feedHtml;
                };

                const allAkis = buildUnifiedAkis();
                const visibleAkis = filterAkisItems(allAkis);

                const personalCount = allAkis.filter(x => x.category === 'personal').length;
                const pdfItems = allAkis.filter(x => x.category === 'pdf');
                const localPdfCount = pdfItems.filter(x => x.isLocalPdf).length;
                const cloudPdfCount = pdfItems.length - localPdfCount;
                const linkItems = allAkis.filter(x => x.category === 'link');
                const distinctAuthors = [...new Set(allAkis.map(x => x.author).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr'));
                if (window.akisFilterAuthor !== 'all' && !distinctAuthors.includes(window.akisFilterAuthor)) {
                    window.akisFilterAuthor = 'all';
                }
                const latestDateStr = allAkis.find(x => x.displayDate && x.displayDate !== '-')?.displayDate || '-';
                const hasAkisFilters = !!(
                    (window.akisSearchQuery && window.akisSearchQuery.trim()) ||
                    window.akisFilterType !== 'all' ||
                    window.akisFilterAuthor !== 'all'
                );
                const safeSelH = window.escapeHtml(selectedHisse);

                const akisKpiHtml = `
                    <div class="kpi-grid">
                        <div class="kpi-card">
                            <div class="kpi-icon-box navy"><i class="fas fa-stream"></i></div>
                            <div class="kpi-info">
                                <div class="kpi-label">Toplam Akış Kaydı</div>
                                <div class="kpi-value">${allAkis.length}</div>
                                <div class="kpi-sub">Son güncelleme: ${window.escapeHtml(latestDateStr)}</div>
                            </div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-icon-box slate"><i class="fas fa-thumbtack"></i></div>
                            <div class="kpi-info">
                                <div class="kpi-label">Kişisel Notlar</div>
                                <div class="kpi-value">${personalCount}</div>
                                <div class="kpi-sub">Üstte sabitlenen yatırım tezleri</div>
                            </div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-icon-box red"><i class="fas fa-file-pdf"></i></div>
                            <div class="kpi-info">
                                <div class="kpi-label">PDF Raporları</div>
                                <div class="kpi-value">${pdfItems.length}</div>
                                <div class="kpi-sub">${localPdfCount} Klasör · ${cloudPdfCount} Bulut PDF</div>
                            </div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-icon-box green"><i class="fas fa-link"></i></div>
                            <div class="kpi-info">
                                <div class="kpi-label">Analiz & Video / Link</div>
                                <div class="kpi-value">${linkItems.length}</div>
                                <div class="kpi-sub">${distinctAuthors.length} farklı analist / kurum</div>
                            </div>
                        </div>
                    </div>
                `;

                contentHtml = `
                    <div style="display:flex; flex-direction:column; gap:0.95rem;">
                        ${akisKpiHtml}

                        <div class="glass ekstre-card-shell">
                            <div class="ekstre-toolbar-top">
                                <div class="ekstre-tab-group">
                                    <button type="button" class="ekstre-tab-pill ${window.akisViewMode !== 'table' ? 'active' : ''}" onclick="window.setAkisViewMode('feed')">
                                        <i class="fas fa-layer-group"></i>
                                        <span>Araştırma Akışı</span>
                                        <span class="ekstre-tab-count">${allAkis.length}</span>
                                    </button>
                                    <button type="button" class="ekstre-tab-pill ${window.akisViewMode === 'table' ? 'active' : ''}" onclick="window.setAkisViewMode('table')">
                                        <i class="fas fa-table"></i>
                                        <span>Kompakt Tablo</span>
                                    </button>
                                </div>

                                <div style="display:flex; align-items:center; gap:0.55rem; flex-wrap:wrap;">
                                    <button type="button" class="ekstre-ghost-btn" style="color:#b45309; border-color:#fde68a; background:#fffbeb;" onclick="window.openAkisModal({ hisse: '${safeSelH}', mode: 'kisisel' })">
                                        <i class="fas fa-thumbtack"></i>
                                        <span>Kişisel Not</span>
                                    </button>
                                    <button type="button" class="btn ekstre-primary-cta" onclick="window.openAkisModal({ hisse: '${safeSelH}', mode: 'analiz' })">
                                        <i class="fas fa-plus" style="color:#ffffff !important;"></i>
                                        <span>Yeni Kayıt</span>
                                    </button>
                                </div>
                            </div>

                            <div class="ekstre-filter-bar">
                                <div class="ekstre-filter-left">
                                    <div class="ekstre-search-wrap">
                                        <i class="fas fa-search"></i>
                                        <input type="text" id="akis-search-input" class="ekstre-search-input" placeholder="Başlık, kurum veya not ara..." value="${window.escapeHtml(window.akisSearchQuery || '')}" oninput="window.filterAkisFeed(this.value)">
                                        <button type="button" id="akis-search-clear-btn" class="ekstre-search-clear" style="display: ${window.akisSearchQuery ? 'inline-flex' : 'none'};" onclick="const i=document.getElementById('akis-search-input'); if(i){i.value=''; i.focus();} window.filterAkisFeed('');" title="Aramayı temizle">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>

                                    <div class="ekstre-segmented" role="group" aria-label="Akış türü filtresi">
                                        <button type="button" class="ekstre-seg-btn ${window.akisFilterType === 'all' ? 'active' : ''}" onclick="window.setAkisFilter('type', 'all')">Tümü</button>
                                        <button type="button" class="ekstre-seg-btn ${window.akisFilterType === 'personal' ? 'active' : ''}" onclick="window.setAkisFilter('type', 'personal')">Kişisel Not</button>
                                        <button type="button" class="ekstre-seg-btn ${window.akisFilterType === 'pdf' ? 'active' : ''}" onclick="window.setAkisFilter('type', 'pdf')">PDF Rapor</button>
                                        <button type="button" class="ekstre-seg-btn ${window.akisFilterType === 'link' ? 'active' : ''}" onclick="window.setAkisFilter('type', 'link')">Video / Link</button>
                                    </div>

                                    ${distinctAuthors.length > 0 ? `
                                    <select class="ekstre-select" aria-label="Analist veya kurum filtresi" onchange="window.setAkisFilter('author', this.value)">
                                        <option value="all" ${window.akisFilterAuthor === 'all' ? 'selected' : ''}>Tüm Kaynaklar (${distinctAuthors.length})</option>
                                        ${distinctAuthors.map(a => `<option value="${window.escapeHtml(a)}" ${window.akisFilterAuthor === a ? 'selected' : ''}>${window.escapeHtml(a)}</option>`).join('')}
                                    </select>` : ''}
                                </div>

                                <div class="ekstre-filter-right">
                                    <span id="akis-reset-wrap" style="display: ${hasAkisFilters ? 'inline-flex' : 'none'};">
                                        <button type="button" class="ekstre-ghost-btn reset" onclick="window.resetAkisFilters()">
                                            <i class="fas fa-rotate-left"></i>
                                            <span>Sıfırla</span>
                                        </button>
                                    </span>
                                </div>
                            </div>

                            <div id="akis-content-wrap">
                                ${buildAkisBodyHtml(allAkis, visibleAkis)}
                            </div>
                        </div>
                    </div>
                `;

                window.updateAkisViewOnly = () => {
                    const wrap = document.getElementById('akis-content-wrap');
                    if (!wrap) { renderUI(); return; }
                    const freshAll = buildUnifiedAkis();
                    const freshVis = filterAkisItems(freshAll);
                    wrap.innerHTML = buildAkisBodyHtml(freshAll, freshVis);
                    const clr = document.getElementById('akis-search-clear-btn');
                    if (clr) clr.style.display = window.akisSearchQuery ? 'inline-flex' : 'none';
                    const rst = document.getElementById('akis-reset-wrap');
                    if (rst) {
                        const active = !!((window.akisSearchQuery && window.akisSearchQuery.trim()) || window.akisFilterType !== 'all' || window.akisFilterAuthor !== 'all');
                        rst.style.display = active ? 'inline-flex' : 'none';
                    }
                };
            }
            let stockHeaderHtml = '';
            if (selectedHisse) {
                window.stockChanges = window.stockChanges || {};
                const hCtx = window.getDegerlemeStockContext(selectedHisse);
                const hFiyat = hCtx.guncelFiyat || 0;
                const tdH = window.tickerData && window.tickerData[selectedHisse];
                let hDegisim = 0;
                if (tdH && tdH.chp !== undefined && tdH.chp !== null && !isNaN(tdH.chp)) {
                    hDegisim = tdH.chp;
                } else if (window.stockChanges[selectedHisse] !== undefined) {
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

                const switcherSymbols = Array.from(new Set([
                    selectedHisse,
                    ...((State.data && State.data.takipListesi) ? State.data.takipListesi : []),
                    ...Object.keys((State.data && State.data.degerleme) ? State.data.degerleme : {})
                ])).filter(Boolean).sort((a, b) => a.localeCompare(b));
                const curIdx = switcherSymbols.indexOf(selectedHisse);
                const prevSym = switcherSymbols.length > 1 ? switcherSymbols[(curIdx - 1 + switcherSymbols.length) % switcherSymbols.length] : null;
                const nextSym = switcherSymbols.length > 1 ? switcherSymbols[(curIdx + 1) % switcherSymbols.length] : null;

                const isStarredH = Array.isArray(State.data.takipYildizlar) && State.data.takipYildizlar.includes(selectedHisse);
                const safeSel = window.escapeHtml(selectedHisse);
                const fmtHdrDec = (v) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
                const fmtHdrPd = (v) => {
                    if (!v || v <= 0) return null;
                    if (v >= 1e9) return `₺${fmtHdrDec(v / 1e9)} Mlr`;
                    if (v >= 1e6) return `₺${fmtHdrDec(v / 1e6)} Mn`;
                    return `₺${Math.round(v).toLocaleString('tr-TR')}`;
                };

                const chips = [];
                const pdStr = fmtHdrPd(hCtx.piyasaDegeri);
                if (pdStr) chips.push(`<span class="hisse-metric-chip">PD: <strong>${pdStr}</strong></span>`);
                if (hCtx.guncelFk > 0) chips.push(`<span class="hisse-metric-chip">F/K: <strong>${fmtHdrDec(hCtx.guncelFk)}</strong></span>`);
                if (hCtx.guncelFdFavok > 0) chips.push(`<span class="hisse-metric-chip">FD/FAVÖK: <strong>${fmtHdrDec(hCtx.guncelFdFavok)}</strong></span>`);
                if (hCtx.guncelPdDd > 0) chips.push(`<span class="hisse-metric-chip">PD/DD: <strong>${fmtHdrDec(hCtx.guncelPdDd)}</strong></span>`);

                stockHeaderHtml = `
            <div id="hisse-header-border" class="hisse-hero-card" style="border-left-color: ${hColor};">
                <div class="hisse-hero-left">
                    <div class="hisse-nav-stepper">
                        ${prevSym ? `<button type="button" class="hisse-step-btn" onclick="window.switchSelectedHisse('${window.escapeHtml(prevSym)}')" title="Önceki hisse (${window.escapeHtml(prevSym)})"><i class="fas fa-chevron-left"></i></button>` : ''}
                        <select id="hisse-switcher-select" class="ekstre-select" style="height: 30px; font-weight: 800; color: #113A5D; border: none; background-color: transparent; min-width: 100px;" title="Başka hisseye geç" onchange="window.switchSelectedHisse && window.switchSelectedHisse(this.value)">
                            ${switcherSymbols.map(s => `<option value="${window.escapeHtml(s)}" ${s === selectedHisse ? 'selected' : ''}>${window.escapeHtml(s)}</option>`).join('')}
                        </select>
                        ${nextSym ? `<button type="button" class="hisse-step-btn" onclick="window.switchSelectedHisse('${window.escapeHtml(nextSym)}')" title="Sonraki hisse (${window.escapeHtml(nextSym)})"><i class="fas fa-chevron-right"></i></button>` : ''}
                    </div>
                    <h1 class="hisse-hero-ticker">${safeSel}</h1>
                    ${chips.length > 0 ? `<div class="hisse-metric-chips">${chips.join('')}</div>` : ''}
                </div>

                <div class="hisse-hero-right">
                    <div class="hisse-price-block">
                        <span class="hisse-price-val">₺${fmtHdrDec(hFiyat)}</span>
                        <span id="hisse-header-change" class="hisse-change-pill ${isPos ? 'pos' : 'neg'}">
                            <i class="fas fa-caret-${isPos ? 'up' : 'down'}"></i> %${initChangeStr}
                        </span>
                    </div>
                    <button type="button" class="takip-star-filter-btn ${isStarredH ? 'active' : ''}" style="height:34px; padding:0 10px;" onclick="if(window.toggleTakipStar) window.toggleTakipStar('${safeSel}', event); renderPage();" title="${isStarredH ? 'Yıldızı kaldır' : 'Öncelikli olarak yıldızla'}">
                        <i class="${isStarredH ? 'fas' : 'far'} fa-star" style="color:#f59e0b;"></i>
                    </button>
                    <button type="button" class="ekstre-ghost-btn" style="height:34px; color:#0369a1; border-color:#bae6fd; background:#f0f9ff;" onclick="window.openBilancoUploadModal && window.openBilancoUploadModal('${safeSel}')" title="${safeSel} için güncel bilanço dosyası yükle">
                        <i class="fas fa-cloud-arrow-up"></i>
                        <span>Bilanço</span>
                    </button>
                    <button type="button" class="ekstre-ghost-btn" style="height:34px; color:#059669; border-color:#a7f3d0; background:#ecfdf5;" onclick="window.openEkstreModal && window.openEkstreModal(null, '${safeSel}')" title="${safeSel} için alım/satım işlemi ekle">
                        <i class="fas fa-plus"></i>
                        <span>İşlem</span>
                    </button>
                </div>
            </div>
            `;
            }

            if (window.Chart) {
                Object.values(Chart.instances).forEach(chart => {
                    if (chart && chart.canvas && container.contains(chart.canvas)) {
                        chart.destroy();
                    }
                });
            }

            container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 0.9rem;">
                ${stockHeaderHtml}
                <div class="hisse-tab-strip">
                    <div class="ekstre-tab-group">
                        ${tabsHtml}
                    </div>
                </div>
                <div class="page-section active" style="display: flex; flex-direction: column; gap: 1rem; padding: 0;">
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
                            if (changeEl && change !== null && change !== undefined && !isNaN(change)) {
                                window.stockChanges[selectedHisse] = change;
                                const isPos = change >= 0;
                                const color = isPos ? 'var(--success-color)' : 'var(--danger-color)';
                                changeEl.className = 'hisse-change-pill ' + (isPos ? 'pos' : 'neg');
                                let changeStr = Math.abs(change).toFixed(2).replace('.', ',');
                                if (isPos && change > 0) changeStr = '+' + changeStr;
                                else if (!isPos) changeStr = '-' + changeStr;
                                changeEl.innerHTML = '<i class="fas fa-caret-' + (isPos ? 'up' : 'down') + '"></i> %' + changeStr;
                                if (borderEl) borderEl.style.borderLeftColor = color;
                            }
                        }
                    }).catch(() => { });
                }, 100);
            }


            if (window.shouldRenderDashboardCharts) {
                window.shouldRenderDashboardCharts = false;
                setTimeout(() => {
                    // --- Değerleme Hedef Fiyat Yörüngesi Grafiği ---
                    if (window.degerlemeChartPayload && typeof Chart !== 'undefined') {
                        const dp = window.degerlemeChartPayload;
                        const cvDeg = document.getElementById('chart-degerleme-trajectory');
                        if (cvDeg && dp.labels && dp.labels.length > 0) {
                            let ex = Chart.getChart ? Chart.getChart(cvDeg) : null;
                            if (ex) ex.destroy();
                            const barColors = dp.targets.map(v => (!dp.currentPrice || v >= dp.currentPrice) ? 'rgba(16, 185, 129, 0.82)' : 'rgba(239, 68, 68, 0.78)');
                            const datasets = [
                                {
                                    type: 'bar',
                                    label: 'Hedef Fiyat (₺)',
                                    data: dp.targets,
                                    backgroundColor: barColors,
                                    borderRadius: 7,
                                    maxBarThickness: 46
                                }
                            ];
                            if (dp.currentPrice > 0) {
                                datasets.push({
                                    type: 'line',
                                    label: 'Güncel Fiyat (₺)',
                                    data: dp.labels.map(() => dp.currentPrice),
                                    borderColor: '#113A5D',
                                    borderWidth: 2,
                                    borderDash: [6, 4],
                                    pointRadius: 0,
                                    fill: false
                                });
                            }
                            new Chart(cvDeg.getContext('2d'), {
                                type: 'bar',
                                data: { labels: dp.labels, datasets },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    interaction: { mode: 'index', intersect: false },
                                    plugins: {
                                        datalabels: { display: false },
                                        legend: { position: 'top', align: 'end', labels: { boxWidth: 12, usePointStyle: true, font: { size: 11.5, weight: '600' } } },
                                        tooltip: {
                                            callbacks: {
                                                label: (c) => {
                                                    const val = c.parsed.y;
                                                    if (c.datasetIndex === 0) {
                                                        const pot = dp.potentials[c.dataIndex];
                                                        const potS = dp.currentPrice > 0 ? ` (${pot >= 0 ? '%+' : '%-'}${Math.abs(pot).toFixed(1).replace('.', ',')})` : '';
                                                        return `Hedef: ₺${new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)}${potS}`;
                                                    }
                                                    return `Güncel Fiyat: ₺${new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)}`;
                                                }
                                            }
                                        }
                                    },
                                    scales: {
                                        x: { grid: { display: false }, ticks: { font: { size: 12, weight: '600' }, color: '#334155' } },
                                        y: {
                                            beginAtZero: true,
                                            ticks: { callback: (v) => '₺' + new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(v), font: { size: 11 }, color: '#64748b' },
                                            grid: { color: 'rgba(148, 163, 184, 0.16)' }
                                        }
                                    }
                                }
                            });
                        }
                        window.degerlemeChartPayload = null;
                    }

                    // --- Nakit Akım Grafikleri (Çeyreklik & Yıllıklandırılmış) ---
                    if (window.nakitChartPayload && typeof Chart !== 'undefined') {
                        const renderNakitChart = (canvasId, series) => {
                            const cv = document.getElementById(canvasId);
                            if (!cv || !series || !series.labels || series.labels.length === 0) return;
                            let ex = Chart.getChart ? Chart.getChart(cv) : null;
                            if (ex) ex.destroy();
                            new Chart(cv.getContext('2d'), {
                                type: 'bar',
                                data: {
                                    labels: series.labels,
                                    datasets: [
                                        { label: 'İşletme', data: series.isletme, backgroundColor: 'rgba(16, 185, 129, 0.8)', borderRadius: 3 },
                                        { label: 'Yatırım', data: series.yatirim, backgroundColor: 'rgba(239, 68, 68, 0.75)', borderRadius: 3 },
                                        { label: 'Finansman', data: series.finansman, backgroundColor: 'rgba(2, 132, 199, 0.78)', borderRadius: 3 }
                                    ]
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    interaction: { mode: 'index', intersect: false },
                                    plugins: {
                                        datalabels: { display: false },
                                        legend: { display: true, position: 'bottom', labels: { boxWidth: 10, color: '#475569', font: { size: 11 } } },
                                        tooltip: {
                                            callbacks: {
                                                label: (c) => `${c.dataset.label}: ${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(c.parsed.y || 0)}`
                                            }
                                        }
                                    },
                                    scales: {
                                        x: { ticks: { font: { size: 10 }, color: '#475569' }, grid: { display: false } },
                                        y: {
                                            ticks: {
                                                font: { size: 10 },
                                                color: '#475569',
                                                callback: (v) => {
                                                    if (Math.abs(v) >= 1e9) return (v / 1e9).toFixed(1) + ' Mlr';
                                                    if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(0) + ' M';
                                                    return v;
                                                }
                                            },
                                            grid: { color: 'rgba(15, 23, 42, 0.08)' }
                                        }
                                    }
                                }
                            });
                        };
                        renderNakitChart('chart-nakit-q', window.nakitChartPayload.ceyrek);
                        renderNakitChart('chart-nakit-y', window.nakitChartPayload.yillik);
                        window.nakitChartPayload = null;
                    }

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
                            x: { ticks: { color: '#475569', font: { size: 10 } }, grid: { display: false } },
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
                                x: { ticks: { font: { size: 10 }, color: '#475569' }, grid: { color: 'rgba(15, 23, 42, 0.08)' } },
                                y: { ticks: { font: { size: 10 }, color: '#475569' }, grid: { color: 'rgba(15, 23, 42, 0.08)' } }
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
                                        legend: { display: true, position: 'bottom', labels: { boxWidth: 10, color: '#475569', font: { size: 10 } } },
                                        tooltip: {
                                            callbacks: {
                                                label: (ctx) => '%' + (ctx.parsed.y || 0).toFixed(1)
                                            }
                                        },
                                        datalabels: {
                                            color: '#0f172a',
                                            align: 'top',
                                            formatter: (value) => '%' + (value || 0).toFixed(1),
                                            font: { size: 10, weight: 'bold' }
                                        }
                                    },
                                    scales: {
                                        y: { grid: { color: 'rgba(15, 23, 42, 0.08)' }, ticks: { color: '#475569', callback: v => '%' + v } },
                                        x: { grid: { display: false }, ticks: { color: '#475569', maxRotation: 45, minRotation: 45, font: { size: 10 } } }
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
                            legend: { display: true, position: 'bottom', labels: { boxWidth: 10, color: '#475569', font: { size: 10 } } },
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
                            x: { ticks: { font: { size: 10 }, color: '#475569' }, grid: { color: 'rgba(15, 23, 42, 0.08)' } },
                            y: {
                                ticks: {
                                    font: { size: 10 }, color: '#475569',
                                    callback: function (value) {
                                        if (Math.abs(value) >= 1e9) return (value / 1e9).toFixed(1) + 'Mlyr';
                                        if (Math.abs(value) >= 1e6) return (value / 1e6).toFixed(1) + 'Mn';
                                        return value;
                                    }
                                },
                                grid: { color: 'rgba(15, 23, 42, 0.08)' }
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
                                        ticks: { color: '#475569', font: { size: 10 } },
                                        grid: { color: 'rgba(15, 23, 42, 0.08)' }
                                    },
                                    y: {
                                        ticks: { color: '#475569', font: { size: 10 } },
                                        grid: { color: 'rgba(15, 23, 42, 0.08)' }
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
                                scales: { x: { ticks: { color: '#475569', font: { size: 10 } }, grid: { color: 'rgba(15, 23, 42, 0.08)' } }, y: { ticks: { color: '#475569', font: { size: 10 } }, grid: { color: 'rgba(15, 23, 42, 0.08)' } } }
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
                    if (ctxFaaliyetCombined) { let ex = Chart.getChart(ctxFaaliyetCombined); if (ex) ex.destroy(); new Chart(ctxFaaliyetCombined, { type: 'bar', data: { labels: labels, datasets: [{ label: 'Çeyreklik', data: dData.faaliyet, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }, { label: 'Dönemsel', data: dData.dFaaliyet, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }, { label: 'Yıllıklandırılmış', data: dData.yFaaliyet, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, callbacks: { label: function (c) { let v = c.raw; return c.dataset.label + ': ' + (v ? new Intl.NumberFormat('tr-TR').format(v) : '-'); } } }, datalabels: { display: false } }, scales: { x: { ticks: { color: '#475569', font: { size: 10 } }, grid: { color: 'rgba(15, 23, 42, 0.08)' } }, y: { ticks: { color: '#475569', font: { size: 10 } }, grid: { color: 'rgba(15, 23, 42, 0.08)' } } } } }); }

                    // --- FAVÖK ---
                    const ctxFavokCeyreklik2 = document.getElementById('chart-ceyreklik-favok2');
                    if (ctxFavokCeyreklik2) { let ex = Chart.getChart(ctxFavokCeyreklik2); if (ex) ex.destroy(); new Chart(ctxFavokCeyreklik2, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.favok, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }
                    const ctxFavokDonemsel = document.getElementById('chart-donemsel-favok');
                    if (ctxFavokDonemsel) { let ex = Chart.getChart(ctxFavokDonemsel); if (ex) ex.destroy(); new Chart(ctxFavokDonemsel, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.dFavok, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }
                    const ctxFavokYillik = document.getElementById('chart-yillik-favok');
                    if (ctxFavokYillik) { let ex = Chart.getChart(ctxFavokYillik); if (ex) ex.destroy(); new Chart(ctxFavokYillik, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.yFavok, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }
                    const ctxFavokCombined = document.getElementById('chart-combined-favok');
                    if (ctxFavokCombined) { let ex = Chart.getChart(ctxFavokCombined); if (ex) ex.destroy(); new Chart(ctxFavokCombined, { type: 'bar', data: { labels: labels, datasets: [{ label: 'Çeyreklik', data: dData.favok, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }, { label: 'Dönemsel', data: dData.dFavok, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }, { label: 'Yıllıklandırılmış', data: dData.yFavok, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, callbacks: { label: function (c) { let v = c.raw; return c.dataset.label + ': ' + (v ? new Intl.NumberFormat('tr-TR').format(v) : '-'); } } }, datalabels: { display: false } }, scales: { x: { ticks: { color: '#475569', font: { size: 10 } }, grid: { color: 'rgba(15, 23, 42, 0.08)' } }, y: { ticks: { color: '#475569', font: { size: 10 } }, grid: { color: 'rgba(15, 23, 42, 0.08)' } } } } }); }

                    // --- Net Kar ---
                    const ctxNetKarCeyreklik2 = document.getElementById('chart-ceyreklik-netkar2');
                    if (ctxNetKarCeyreklik2) { let ex = Chart.getChart(ctxNetKarCeyreklik2); if (ex) ex.destroy(); new Chart(ctxNetKarCeyreklik2, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.netkar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }
                    const ctxNetKarDonemsel = document.getElementById('chart-donemsel-netkar');
                    if (ctxNetKarDonemsel) { let ex = Chart.getChart(ctxNetKarDonemsel); if (ex) ex.destroy(); new Chart(ctxNetKarDonemsel, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.dNetKar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }
                    const ctxNetKarYillik = document.getElementById('chart-yillik-netkar');
                    if (ctxNetKarYillik) { let ex = Chart.getChart(ctxNetKarYillik); if (ex) ex.destroy(); new Chart(ctxNetKarYillik, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.yNetKar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }
                    const ctxNetKarCombined = document.getElementById('chart-combined-netkar');
                    if (ctxNetKarCombined) { let ex = Chart.getChart(ctxNetKarCombined); if (ex) ex.destroy(); new Chart(ctxNetKarCombined, { type: 'bar', data: { labels: labels, datasets: [{ label: 'Çeyreklik', data: dData.netkar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }, { label: 'Dönemsel', data: dData.dNetKar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }, { label: 'Yıllıklandırılmış', data: dData.yNetKar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, callbacks: { label: function (c) { let v = c.raw; return c.dataset.label + ': ' + (v ? new Intl.NumberFormat('tr-TR').format(v) : '-'); } } }, datalabels: { display: false } }, scales: { x: { ticks: { color: '#475569', font: { size: 10 } }, grid: { color: 'rgba(15, 23, 42, 0.08)' } }, y: { ticks: { color: '#475569', font: { size: 10 } }, grid: { color: 'rgba(15, 23, 42, 0.08)' } } } } }); }


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
                    window.showToast('Güncelleme modülü bulunamadı.', 'warning');
                }
            } catch (e) {
                console.error(e);
                window.showToast('Güncelleme sırasında hata oluştu.', 'error');
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
        if (tab === 'Değerleme' && currentPage === 'hisse_detay') {
            currentPage = 'hisse_degerleme';
        } else if (tab !== 'Değerleme' && currentPage === 'hisse_degerleme') {
            currentPage = 'hisse_detay';
        }
        const headerTitleEl = document.getElementById('header-active-title');
        const headerIconEl = document.getElementById('header-active-icon');
        if (headerTitleEl && selectedHisse) {
            headerTitleEl.textContent = tab === 'Değerleme' ? `${selectedHisse} · Değerleme` : `${selectedHisse} · ${tab}`;
        }
        if (headerIconEl) {
            headerIconEl.className = tab === 'Değerleme' ? 'fas fa-gem' : 'fas fa-chart-bar';
        }
        document.querySelectorAll('.nav-btn[data-target]').forEach(b => b.classList.remove('active'));
        if (tab === 'Değerleme') {
            document.querySelectorAll('.nav-btn[data-target="hisse_degerleme"]').forEach(b => b.classList.add('active'));
        }
        renderUI();
    };

    window.switchSelectedHisse = (sym) => {
        const clean = String(sym || '').trim().toUpperCase();
        if (!clean) return;
        window.currentSelectedHisse = clean;
        window.currentHisseTab = activeTab;
        if (typeof renderPage === 'function') renderPage();
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

const getHisseSortIcon = () => '';

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

const getArsivSortIcon = () => '';

window.toggleVarliklarSort = (col) => {
    if (!window.varliklarSort) window.varliklarSort = { col: null, asc: true };
    if (window.varliklarSort.col === col) {
        window.varliklarSort.asc = !window.varliklarSort.asc;
    } else {
        window.varliklarSort = { col: col, asc: true };
    }
    if (typeof renderPage === 'function') renderPage();

};

const getVarliklarSortIcon = () => '';

window.toggleNakitSort = (col) => {
    if (!window.nakitSort) window.nakitSort = { col: null, asc: true };
    if (window.nakitSort.col === col) {
        window.nakitSort.asc = !window.nakitSort.asc;
    } else {
        window.nakitSort = { col: col, asc: true };
    }
    if (typeof renderPage === 'function') renderPage();
};

const getNakitSortIcon = () => '';

window.toggleNakitTableCollapse = () => {
    window.nakitTableCollapsed = !window.nakitTableCollapsed;
    if (typeof renderPage === 'function') renderPage();
};

window.toggleHisseGroup = (menkul) => {
    window.hisseGroupCollapsed = window.hisseGroupCollapsed || {};
    const currentlyCollapsed = window.hisseGroupCollapsed[menkul] === true;
    window.hisseGroupCollapsed[menkul] = !currentlyCollapsed;
    if (typeof window.updateEkstreViewOnly === 'function') window.updateEkstreViewOnly();
    else if (typeof renderPage === 'function') renderPage();
};

const getEkstreSymbolStats = (allRows) => {
    const stats = {};
    (allRows || []).forEach(e => {
        if (!e || !e.menkul) return;
        const sym = String(e.menkul).trim().toUpperCase();
        if (sym === 'NAKIT' || sym === 'NAKİT') return;
        if (!stats[sym]) {
            stats[sym] = {
                menkul: sym,
                isFon: sym.length === 3,
                netAdet: 0,
                alisAdet: 0,
                alisTutar: 0,
                satisAdet: 0,
                satisTutar: 0,
                count: 0,
                isAcik: false
            };
        }
        const s = stats[sym];
        const adet = parseFloat(e.adet) || 0;
        const fiyat = parseFloat(e.fiyat) || 0;
        const tutar = Math.abs(adet) * fiyat;
        s.netAdet += adet;
        s.count += 1;
        if (adet >= 0) {
            s.alisAdet += adet;
            s.alisTutar += tutar;
        } else {
            s.satisAdet += Math.abs(adet);
            s.satisTutar += tutar;
        }
    });
    Object.values(stats).forEach(s => {
        if (Math.abs(s.netAdet) < 0.0001) s.netAdet = 0;
        s.isAcik = s.netAdet > 0;
        s.ortAlis = s.alisAdet > 0 ? (s.alisTutar / s.alisAdet) : 0;
    });
    return stats;
};

const formatEkstrePrice = (fiyat, isFon) => {
    const num = parseFloat(fiyat) || 0;
    if (isFon && num > 0 && num < 50) {
        return '₺' + num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
    }
    return formatCurrency(num, 2);
};

const formatEkstreQty = (adet) => {
    const num = parseFloat(adet) || 0;
    const absStr = Math.abs(num).toLocaleString('tr-TR', { maximumFractionDigits: 4 });
    return num > 0 ? `+${absStr}` : (num < 0 ? `-${absStr}` : '0');
};

const closeAllEkstreModals = () => {
    const m1 = document.getElementById('ekstre-modal-overlay');
    if (m1) m1.remove();
    const m2 = document.getElementById('nakit-modal-overlay');
    if (m2) m2.remove();
};

if (!window._ekstreEscBound) {
    window._ekstreEscBound = true;
    document.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') {
            if (document.getElementById('ekstre-modal-overlay') || document.getElementById('nakit-modal-overlay')) {
                closeAllEkstreModals();
            }
        }
    });
}

window.openEkstreModal = (editId = null, prefillMenkul = '') => {
    closeAllEkstreModals();
    const allEkstre = (State.data.ekstre || []).filter(e => e && e.menkul && e.menkul !== 'NAKİT' && e.menkul !== 'NAKIT');
    const symbolStats = getEkstreSymbolStats(allEkstre);

    const existing = editId ? allEkstre.find(x => String(x.id) === String(editId)) : null;
    const todayStr = new Date().toISOString().split('T')[0];

    const initMenkul = existing ? String(existing.menkul).trim().toUpperCase() : String(prefillMenkul || '').trim().toUpperCase();
    const initIsFon = initMenkul ? (initMenkul.length === 3) : false;
    const initSide = existing ? ((parseFloat(existing.adet) || 0) < 0 ? 'SATIŞ' : 'ALIŞ') : 'ALIŞ';
    const initTarih = existing ? (existing.tarih || todayStr) : todayStr;
    const initFiyat = existing ? (parseFloat(existing.fiyat) || '') : (initMenkul && State.getFiyat(initMenkul) > 0 ? State.getFiyat(initMenkul) : '');
    const initAdet = existing ? Math.abs(parseFloat(existing.adet) || 0) : '';

    // Ensure fon datalist exists
    const fonSet = new Set();
    allEkstre.forEach(e => { if (e.menkul && e.menkul.length === 3) fonSet.add(e.menkul.toUpperCase()); });
    let fonDl = document.getElementById('fon-list');
    if (!fonDl) {
        fonDl = document.createElement('datalist');
        fonDl.id = 'fon-list';
        document.body.appendChild(fonDl);
    }
    fonDl.innerHTML = [...fonSet].sort().map(f => `<option value="${window.escapeHtml(f)}">`).join('');

    let currentSide = initSide;
    let currentTur = initIsFon ? 'Fon' : 'Hisse';

    const overlay = document.createElement('div');
    overlay.id = 'ekstre-modal-overlay';
    overlay.className = 'ekstre-modal-overlay';
    overlay.addEventListener('click', (ev) => {
        if (ev.target === overlay) closeAllEkstreModals();
    });

    overlay.innerHTML = `
        <div class="ekstre-modal-card" role="dialog" aria-modal="true">
            <div class="ekstre-modal-header">
                <h3>
                    <i class="fas ${existing ? 'fa-pen-to-square' : 'fa-plus-circle'}" style="color: #2563eb;"></i>
                    <span>${existing ? 'İşlemi Düzenle' : 'Yeni Hisse / Fon İşlemi'}</span>
                </h3>
                <button type="button" class="ekstre-modal-close" aria-label="Kapat" onclick="document.getElementById('ekstre-modal-overlay')?.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="ekstre-modal-form" class="ekstre-modal-body">
                <div>
                    <div class="ekstre-side-toggle">
                        <button type="button" id="em-btn-alis" class="ekstre-side-btn ${currentSide === 'ALIŞ' ? 'active-alis' : ''}">
                            <i class="fas fa-arrow-down"></i> ALIŞ
                        </button>
                        <button type="button" id="em-btn-satis" class="ekstre-side-btn ${currentSide === 'SATIŞ' ? 'active-satis' : ''}">
                            <i class="fas fa-arrow-up"></i> SATIŞ
                        </button>
                    </div>
                </div>

                <div class="ekstre-form-grid-2">
                    <div class="ekstre-field">
                        <label>Menkul Türü</label>
                        <div class="ekstre-segmented" style="height: 40px; width: 100%; display: grid; grid-template-columns: 1fr 1fr;">
                            <button type="button" id="em-tur-hisse" class="ekstre-seg-btn ${currentTur === 'Hisse' ? 'active' : ''}" style="justify-content: center;">Hisse</button>
                            <button type="button" id="em-tur-fon" class="ekstre-seg-btn ${currentTur === 'Fon' ? 'active' : ''}" style="justify-content: center;">Fon (3 Harf)</button>
                        </div>
                    </div>
                    <div class="ekstre-field">
                        <label for="em-menkul">Menkul Kodu</label>
                        <input type="text" id="em-menkul" class="form-control" style="text-transform: uppercase; font-weight: 600;"
                               placeholder="${currentTur === 'Fon' ? 'Örn: PRY, MAC' : 'Örn: THYAO, AKSA'}"
                               value="${window.escapeHtml(initMenkul)}"
                               ${currentTur === 'Fon' ? 'list="fon-list" maxlength="3"' : 'list="bist-hisse-list"'}
                               autocomplete="off" required>
                    </div>
                </div>

                <div id="em-hint-bar" class="ekstre-hint-bar" style="display: none;"></div>

                <div class="ekstre-form-grid-3">
                    <div class="ekstre-field">
                        <label for="em-tarih">İşlem Tarihi</label>
                        <input type="date" id="em-tarih" class="form-control" value="${window.escapeHtml(initTarih)}" required>
                    </div>
                    <div class="ekstre-field">
                        <label for="em-fiyat">Birim Fiyat (₺)</label>
                        <input type="number" id="em-fiyat" class="form-control" step="any" min="0" placeholder="0,00" value="${initFiyat !== '' ? initFiyat : ''}" required>
                    </div>
                    <div class="ekstre-field">
                        <label for="em-adet">Adet</label>
                        <input type="number" id="em-adet" class="form-control" step="any" min="0" placeholder="0" value="${initAdet !== '' ? initAdet : ''}" required>
                    </div>
                </div>

                <div id="em-total-preview" class="ekstre-total-preview ${currentSide === 'SATIŞ' ? 'satis' : 'alis'}">
                    <div>
                        <div class="ekstre-total-preview-label" id="em-total-label">${currentSide === 'SATIŞ' ? 'Tahmini Satış Tutarı' : 'Toplam Alış Tutarı'}</div>
                        <div id="em-total-sub" style="font-size: 12px; color: #64748b; margin-top: 2px;">Adet ve birim fiyat girdikçe otomatik hesaplanır</div>
                    </div>
                    <div id="em-total-value" class="ekstre-total-preview-value">₺0,00</div>
                </div>

                <div class="ekstre-modal-footer" style="margin: 0.25rem -1.35rem -1.25rem -1.35rem;">
                    <button type="button" class="ekstre-ghost-btn" onclick="document.getElementById('ekstre-modal-overlay')?.remove()">İptal</button>
                    <button type="submit" class="btn" id="em-submit-btn" style="padding: 9px 22px;">
                        <i class="fas fa-check" style="margin-right: 6px; color: #ffffff !important;"></i>${existing ? 'Değişiklikleri Kaydet' : 'İşlemi Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    const btnAlis = document.getElementById('em-btn-alis');
    const btnSatis = document.getElementById('em-btn-satis');
    const btnTurHisse = document.getElementById('em-tur-hisse');
    const btnTurFon = document.getElementById('em-tur-fon');
    const inpMenkul = document.getElementById('em-menkul');
    const inpTarih = document.getElementById('em-tarih');
    const inpFiyat = document.getElementById('em-fiyat');
    const inpAdet = document.getElementById('em-adet');
    const hintBar = document.getElementById('em-hint-bar');
    const totalBox = document.getElementById('em-total-preview');
    const totalLabel = document.getElementById('em-total-label');
    const totalSub = document.getElementById('em-total-sub');
    const totalVal = document.getElementById('em-total-value');

    const refreshHintsAndTotal = () => {
        const sym = (inpMenkul.value || '').trim().toUpperCase();
        const fiyat = parseFloat(String(inpFiyat.value || '').replace(',', '.')) || 0;
        const adet = Math.abs(parseFloat(String(inpAdet.value || '').replace(',', '.')) || 0);
        const tutar = fiyat * adet;

        totalBox.className = 'ekstre-total-preview ' + (currentSide === 'SATIŞ' ? 'satis' : 'alis');
        totalLabel.textContent = currentSide === 'SATIŞ' ? 'Toplam Satış Tutarı' : 'Toplam Alış Tutarı';
        totalVal.textContent = formatCurrency(tutar, 2);
        totalVal.style.color = currentSide === 'SATIŞ' ? '#b91c1c' : '#047857';
        if (fiyat > 0 && adet > 0) {
            totalSub.textContent = `${adet.toLocaleString('tr-TR', { maximumFractionDigits: 4 })} adet × ${formatEkstrePrice(fiyat, currentTur === 'Fon')}`;
        } else {
            totalSub.textContent = 'Adet ve birim fiyat girdikçe otomatik hesaplanır';
        }

        if (!sym) {
            hintBar.style.display = 'none';
            return;
        }

        const livePrice = State.getFiyat(sym) || 0;
        const st = symbolStats[sym];
        const netHolding = st ? st.netAdet : 0;
        const chips = [];

        if (livePrice > 0) {
            chips.push(`<button type="button" class="ekstre-shortcut-pill" id="em-use-price"><i class="fas fa-bolt"></i> Güncel Fiyatı Kullan (${formatEkstrePrice(livePrice, currentTur === 'Fon')})</button>`);
        }
        if (netHolding > 0) {
            chips.push(`<span style="font-weight: 600; color: #334155;">Portföyde: <strong>${netHolding.toLocaleString('tr-TR', { maximumFractionDigits: 4 })}</strong> adet</span>`);
            if (currentSide === 'SATIŞ') {
                chips.push(`<button type="button" class="ekstre-shortcut-pill danger" id="em-sell-all"><i class="fas fa-layer-group"></i> Tümünü Sat</button>`);
            }
        }
        if (st && st.ortAlis > 0) {
            chips.push(`<span style="color: #64748b;">Ort. Alış: ${formatEkstrePrice(st.ortAlis, st.isFon)}</span>`);
        }

        if (chips.length > 0) {
            hintBar.innerHTML = chips.join('');
            hintBar.style.display = 'flex';
            const usePriceBtn = document.getElementById('em-use-price');
            if (usePriceBtn) {
                usePriceBtn.addEventListener('click', () => {
                    inpFiyat.value = livePrice;
                    refreshHintsAndTotal();
                    inpAdet.focus();
                });
            }
            const sellAllBtn = document.getElementById('em-sell-all');
            if (sellAllBtn) {
                sellAllBtn.addEventListener('click', () => {
                    inpAdet.value = netHolding;
                    refreshHintsAndTotal();
                });
            }
        } else {
            hintBar.style.display = 'none';
        }
    };

    const setSide = (side) => {
        currentSide = side;
        btnAlis.className = 'ekstre-side-btn' + (side === 'ALIŞ' ? ' active-alis' : '');
        btnSatis.className = 'ekstre-side-btn' + (side === 'SATIŞ' ? ' active-satis' : '');
        refreshHintsAndTotal();
    };

    const setTur = (tur, clearInput = false) => {
        currentTur = tur;
        btnTurHisse.className = 'ekstre-seg-btn' + (tur === 'Hisse' ? ' active' : '');
        btnTurFon.className = 'ekstre-seg-btn' + (tur === 'Fon' ? ' active' : '');
        if (clearInput) inpMenkul.value = '';
        if (tur === 'Fon') {
            inpMenkul.removeAttribute('data-custom-list');
            inpMenkul.setAttribute('list', 'fon-list');
            inpMenkul.setAttribute('maxlength', '3');
            inpMenkul.placeholder = 'Örn: PRY, MAC';
        } else {
            inpMenkul.removeAttribute('maxlength');
            inpMenkul.setAttribute('list', 'bist-hisse-list');
            inpMenkul.setAttribute('data-custom-list', 'bist-hisse-list');
            inpMenkul.placeholder = 'Örn: THYAO, AKSA';
        }
        refreshHintsAndTotal();
    };

    btnAlis.addEventListener('click', () => setSide('ALIŞ'));
    btnSatis.addEventListener('click', () => setSide('SATIŞ'));
    btnTurHisse.addEventListener('click', () => setTur('Hisse', true));
    btnTurFon.addEventListener('click', () => setTur('Fon', true));

    inpMenkul.addEventListener('input', () => {
        const val = (inpMenkul.value || '').trim().toUpperCase();
        if (val.length === 3 && fonSet.has(val) && currentTur !== 'Fon') {
            setTur('Fon', false);
        } else if (val.length >= 4 && currentTur !== 'Hisse') {
            setTur('Hisse', false);
        }
        refreshHintsAndTotal();
    });
    inpMenkul.addEventListener('change', refreshHintsAndTotal);
    inpFiyat.addEventListener('input', refreshHintsAndTotal);
    inpAdet.addEventListener('input', refreshHintsAndTotal);

    document.getElementById('ekstre-modal-form').addEventListener('submit', (ev) => {
        ev.preventDefault();
        const menkul = (inpMenkul.value || '').trim().toUpperCase();
        const tarih = inpTarih.value;
        const fiyat = parseFloat(String(inpFiyat.value || '').replace(',', '.'));
        const adet = Math.abs(parseFloat(String(inpAdet.value || '').replace(',', '.')));

        if (!menkul) {
            window.showToast('Lütfen geçerli bir hisse veya fon kodu girin.', 'warning');
            inpMenkul.focus();
            return;
        }
        if (currentTur === 'Fon' && menkul.length !== 3) {
            window.showToast('Fon kodları 3 harfli olmalıdır (Örn: PRY).', 'warning');
            inpMenkul.focus();
            return;
        }
        if (!tarih) {
            window.showToast('Lütfen işlem tarihini seçin.', 'warning');
            inpTarih.focus();
            return;
        }
        if (isNaN(fiyat) || fiyat <= 0) {
            window.showToast('Lütfen 0\'dan büyük bir birim fiyat girin.', 'warning');
            inpFiyat.focus();
            return;
        }
        if (isNaN(adet) || adet <= 0) {
            window.showToast('Lütfen 0\'dan büyük bir adet girin.', 'warning');
            inpAdet.focus();
            return;
        }

        const payload = {
            tarih,
            islemTip: currentSide,
            menkul,
            fiyat,
            adet
        };

        if (existing) {
            State.updateEkstre(existing.id, payload);
            window.showToast(`${menkul} işlemi güncellendi.`, 'success');
        } else {
            State.addEkstre(payload);
            window.showToast(`${menkul} ${currentSide === 'ALIŞ' ? 'alış' : 'satış'} işlemi eklendi.`, 'success');
        }
        closeAllEkstreModals();
        if (typeof renderPage === 'function') renderPage();
    });

    refreshHintsAndTotal();
    setTimeout(() => {
        if (!initMenkul) inpMenkul.focus();
        else if (!initFiyat) inpFiyat.focus();
        else inpAdet.focus();
    }, 30);
};

window.openNakitModal = (editId = null) => {
    closeAllEkstreModals();
    const list = State.data.nakitHareketleri || [];
    const existing = editId ? list.find(x => String(x.id) === String(editId)) : null;
    const todayStr = new Date().toISOString().split('T')[0];

    let currentDir = existing ? ((parseFloat(existing.tutar) || 0) < 0 ? 'CIKIS' : 'GIRIS') : 'GIRIS';
    const initTutar = existing ? Math.abs(parseFloat(existing.tutar) || 0) : '';
    const initTarih = existing ? (existing.tarih || todayStr) : todayStr;

    const overlay = document.createElement('div');
    overlay.id = 'nakit-modal-overlay';
    overlay.className = 'ekstre-modal-overlay';
    overlay.addEventListener('click', (ev) => {
        if (ev.target === overlay) closeAllEkstreModals();
    });

    overlay.innerHTML = `
        <div class="ekstre-modal-card" role="dialog" aria-modal="true">
            <div class="ekstre-modal-header">
                <h3>
                    <i class="fas ${existing ? 'fa-pen-to-square' : 'fa-money-bill-transfer'}" style="color: #059669;"></i>
                    <span>${existing ? 'Nakit Hareketini Düzenle' : 'Yeni Nakit Hareketi'}</span>
                </h3>
                <button type="button" class="ekstre-modal-close" aria-label="Kapat" onclick="document.getElementById('nakit-modal-overlay')?.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="nakit-modal-form" class="ekstre-modal-body">
                <div class="ekstre-side-toggle">
                    <button type="button" id="nm-btn-giris" class="ekstre-side-btn ${currentDir === 'GIRIS' ? 'active-alis' : ''}">
                        <i class="fas fa-arrow-down"></i> Nakit Girişi (+)
                    </button>
                    <button type="button" id="nm-btn-cikis" class="ekstre-side-btn ${currentDir === 'CIKIS' ? 'active-satis' : ''}">
                        <i class="fas fa-arrow-up"></i> Nakit Çıkışı (-)
                    </button>
                </div>

                <div class="ekstre-form-grid-2">
                    <div class="ekstre-field">
                        <label for="nm-tarih">Tarih</label>
                        <input type="date" id="nm-tarih" class="form-control" value="${window.escapeHtml(initTarih)}" required>
                    </div>
                    <div class="ekstre-field">
                        <label for="nm-tutar">Tutar (₺)</label>
                        <input type="number" id="nm-tutar" class="form-control" step="any" min="0" placeholder="0,00" value="${initTutar !== '' ? initTutar : ''}" required>
                    </div>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 2px;">
                    <span style="font-size: 12.5px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.4px;">Karşılaştırma Kurları (Opsiyonel)</span>
                    <button type="button" id="nm-fill-rates" class="ekstre-shortcut-pill">
                        <i class="fas fa-sync-alt"></i> Güncel Kurları Doldur
                    </button>
                </div>

                <div class="ekstre-form-grid-2">
                    <div class="ekstre-field">
                        <label for="nm-bist">XU100</label>
                        <input type="number" id="nm-bist" class="form-control" step="any" placeholder="Örn: 9850,00" value="${existing && existing.bist100 ? existing.bist100 : ''}">
                    </div>
                    <div class="ekstre-field">
                        <label for="nm-dolar">USDTRY</label>
                        <input type="number" id="nm-dolar" class="form-control" step="any" placeholder="Örn: 38,50" value="${existing && existing.dolar ? existing.dolar : ''}">
                    </div>
                    <div class="ekstre-field">
                        <label for="nm-altin">GRAMALTIN</label>
                        <input type="number" id="nm-altin" class="form-control" step="any" placeholder="Örn: 3650,00" value="${existing && existing.gramAltin ? existing.gramAltin : ''}">
                    </div>
                    <div class="ekstre-field">
                        <label for="nm-pry">PRY</label>
                        <input type="text" inputmode="decimal" id="nm-pry" class="form-control" placeholder="Örn: 1,452300" value="${existing && existing.pry ? existing.pry : ''}">
                    </div>
                </div>

                <div class="ekstre-modal-footer" style="margin: 0.25rem -1.35rem -1.25rem -1.35rem;">
                    <button type="button" class="ekstre-ghost-btn" onclick="document.getElementById('nakit-modal-overlay')?.remove()">İptal</button>
                    <button type="submit" class="btn" style="padding: 9px 22px;">
                        <i class="fas fa-check" style="margin-right: 6px; color: #ffffff !important;"></i>${existing ? 'Değişiklikleri Kaydet' : 'Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    const btnGiris = document.getElementById('nm-btn-giris');
    const btnCikis = document.getElementById('nm-btn-cikis');
    btnGiris.addEventListener('click', () => {
        currentDir = 'GIRIS';
        btnGiris.className = 'ekstre-side-btn active-alis';
        btnCikis.className = 'ekstre-side-btn';
    });
    btnCikis.addEventListener('click', () => {
        currentDir = 'CIKIS';
        btnCikis.className = 'ekstre-side-btn active-satis';
        btnGiris.className = 'ekstre-side-btn';
    });

    document.getElementById('nm-fill-rates').addEventListener('click', () => {
        const bm = window.latestMarketBenchmarks || {};
        const bistVal = bm.bist100 || State.getFiyat('BIST') || State.getFiyat('XU100') || '';
        const usdVal = bm.dolar || State.getFiyat('DOLAR') || State.getFiyat('USDTRY') || '';
        const altinVal = bm.gramAltin || State.getFiyat('GRAM ALTIN') || '';
        const pryVal = State.getFiyat('PRY') || '';

        if (bistVal) document.getElementById('nm-bist').value = bistVal;
        if (usdVal) document.getElementById('nm-dolar').value = usdVal;
        if (altinVal) document.getElementById('nm-altin').value = altinVal;
        if (pryVal) document.getElementById('nm-pry').value = pryVal;

        if (bistVal || usdVal || altinVal || pryVal) {
            window.showToast('Güncel piyasa kurları dolduruldu.', 'info');
        } else {
            window.showToast('Canlı kur verisi henüz yüklenmedi.', 'warning');
        }
    });

    document.getElementById('nakit-modal-form').addEventListener('submit', (ev) => {
        ev.preventDefault();
        const tarih = document.getElementById('nm-tarih').value;
        const rawTutar = Math.abs(parseFloat(String(document.getElementById('nm-tutar').value || '').replace(',', '.')) || 0);
        if (!tarih || rawTutar <= 0) {
            window.showToast('Lütfen geçerli tarih ve tutar girin.', 'warning');
            return;
        }
        const payload = {
            tarih,
            tutar: currentDir === 'CIKIS' ? -rawTutar : rawTutar,
            bist100: parseFloat(String(document.getElementById('nm-bist').value || '').replace(',', '.')) || 0,
            dolar: parseFloat(String(document.getElementById('nm-dolar').value || '').replace(',', '.')) || 0,
            gramAltin: parseFloat(String(document.getElementById('nm-altin').value || '').replace(',', '.')) || 0,
            pry: parseFloat(String(document.getElementById('nm-pry').value || '').replace(',', '.')) || 0
        };
        if (existing) {
            State.updateNakitHareket(existing.id, payload);
            window.showToast('Nakit hareketi güncellendi.', 'success');
        } else {
            State.addNakitHareket(payload);
            window.showToast('Nakit hareketi eklendi.', 'success');
        }
        closeAllEkstreModals();
        if (typeof renderPage === 'function') renderPage();
    });

    setTimeout(() => document.getElementById('nm-tutar')?.focus(), 30);
};

window.setEkstreViewMode = (mode) => {
    window.ekstreViewMode = mode;
    if (typeof renderPage === 'function') renderPage();
};

window.setEkstreFilter = (key, val) => {
    if (key === 'tur') window.ekstreFilterTur = val;
    else if (key === 'yon') window.ekstreFilterYon = val;
    else if (key === 'durum') window.ekstreFilterDurum = val;
    else if (key === 'yil') window.ekstreFilterYil = val;
    if (typeof renderPage === 'function') renderPage();
};

window.resetEkstreFilters = () => {
    window.ekstreSearchQuery = '';
    window.ekstreFilterTur = 'all';
    window.ekstreFilterYon = 'all';
    window.ekstreFilterDurum = 'all';
    window.ekstreFilterYil = 'all';
    if (typeof renderPage === 'function') renderPage();
};

window.toggleAllEkstreGroups = (expand) => {
    window.hisseGroupCollapsed = window.hisseGroupCollapsed || {};
    const allRows = (State.data.ekstre || []).filter(e => e && e.menkul && e.menkul !== 'NAKİT' && e.menkul !== 'NAKIT');
    allRows.forEach(e => {
        const sym = String(e.menkul).trim().toUpperCase();
        window.hisseGroupCollapsed[sym] = !expand;
    });
    if (typeof window.updateEkstreViewOnly === 'function') window.updateEkstreViewOnly();
    else if (typeof renderPage === 'function') renderPage();
};

const renderHisseIslemleri = (container) => {
    window.ekstreTab = window.ekstreTab || 'hisse';
    window.ekstreViewMode = window.ekstreViewMode || 'chrono';
    window.ekstreFilterTur = window.ekstreFilterTur || 'all';
    window.ekstreFilterYon = window.ekstreFilterYon || 'all';
    window.ekstreFilterDurum = window.ekstreFilterDurum || 'all';
    window.ekstreFilterYil = window.ekstreFilterYil || 'all';
    window.ekstreSearchQuery = window.ekstreSearchQuery || '';
    window.hisseSort = window.hisseSort || { col: 'tarih', asc: false };
    window.hisseGroupCollapsed = window.hisseGroupCollapsed || {};

    window.setEkstreTab = (tab) => {
        window.ekstreTab = tab;
        if (typeof renderPage === 'function') renderPage();
    };

    window.deleteEkstre = async (id) => {
        if (await window.showConfirm('Bu işlemi silmek istediğinize emin misiniz?')) {
            State.deleteEkstre(id);
            if (typeof renderPage === 'function') renderPage();
            window.showToast('İşlem silindi.', 'info');
        }
    };

    window.deleteNakit = async (id) => {
        if (await window.showConfirm('Bu nakit hareketini silmek istediğinize emin misiniz?')) {
            State.deleteNakitHareket(id);
            if (typeof renderPage === 'function') renderPage();
            window.showToast('Nakit hareketi silindi.', 'info');
        }
    };

    const allHisseFon = [...(State.data.ekstre || [])].filter(e => e && e.menkul && e.menkul !== 'NAKİT' && e.menkul !== 'NAKIT');
    const allNakit = [...(State.data.nakitHareketleri || [])];
    const symbolStats = getEkstreSymbolStats(allHisseFon);

    const yearsSet = new Set();
    allHisseFon.forEach(e => {
        if (e.tarih && String(e.tarih).length >= 4) yearsSet.add(String(e.tarih).slice(0, 4));
    });
    const allYears = [...yearsSet].sort((a, b) => b.localeCompare(a));

    const computeFilteredHisse = () => {
        const q = (window.ekstreSearchQuery || '').trim().toUpperCase();
        const turF = window.ekstreFilterTur || 'all';
        const yonF = window.ekstreFilterYon || 'all';
        const durumF = window.ekstreFilterDurum || 'all';
        const yilF = window.ekstreFilterYil || 'all';

        const filtered = allHisseFon.filter(e => {
            const sym = String(e.menkul).trim().toUpperCase();
            const isFon = sym.length === 3;
            const adet = parseFloat(e.adet) || 0;
            const isAlis = adet >= 0;
            const st = symbolStats[sym];

            if (turF === 'hisse' && isFon) return false;
            if (turF === 'fon' && !isFon) return false;
            if (yonF === 'alis' && !isAlis) return false;
            if (yonF === 'satis' && isAlis) return false;
            if (durumF === 'acik' && (!st || !st.isAcik)) return false;
            if (durumF === 'kapali' && st && st.isAcik) return false;
            if (yilF !== 'all' && !(e.tarih && String(e.tarih).startsWith(yilF))) return false;
            if (q) {
                const haystack = `${sym} ${isFon ? 'FON' : 'HISSE'} ${isAlis ? 'ALIS ALIŞ' : 'SATIS SATIŞ'} ${e.tarih || ''} ${formatDate(e.tarih)}`.toUpperCase();
                if (!haystack.includes(q)) return false;
            }
            return true;
        });

        filtered.sort((a, b) => {
            const col = window.hisseSort?.col || 'tarih';
            const asc = !!window.hisseSort?.asc;
            if (col === 'tarih') {
                const diff = new Date(a.tarih) - new Date(b.tarih);
                if (diff !== 0) return asc ? diff : -diff;
                return String(b.id || '').localeCompare(String(a.id || ''));
            }
            if (col === 'tutar') {
                const tA = (parseFloat(a.fiyat) || 0) * Math.abs(parseFloat(a.adet) || 0);
                const tB = (parseFloat(b.fiyat) || 0) * Math.abs(parseFloat(b.adet) || 0);
                return asc ? tA - tB : tB - tA;
            }
            if (col === 'fiyat') {
                return asc ? ((parseFloat(a.fiyat) || 0) - (parseFloat(b.fiyat) || 0)) : ((parseFloat(b.fiyat) || 0) - (parseFloat(a.fiyat) || 0));
            }
            if (col === 'adet') {
                return asc ? ((parseFloat(a.adet) || 0) - (parseFloat(b.adet) || 0)) : ((parseFloat(b.adet) || 0) - (parseFloat(a.adet) || 0));
            }
            if (col === 'tur') {
                const turA = a.menkul.length === 3 ? 'Fon' : 'Hisse';
                const turB = b.menkul.length === 3 ? 'Fon' : 'Hisse';
                if (turA !== turB) return asc ? turA.localeCompare(turB) : turB.localeCompare(turA);
                return new Date(b.tarih) - new Date(a.tarih);
            }
            if (col === 'menkul') {
                const cmp = String(a.menkul).localeCompare(String(b.menkul));
                if (cmp !== 0) return asc ? cmp : -cmp;
                return new Date(b.tarih) - new Date(a.tarih);
            }
            return new Date(b.tarih) - new Date(a.tarih);
        });

        return filtered;
    };

    const buildHisseKpiHtml = (rows) => {
        let alisCount = 0, satisCount = 0, alisTutar = 0, satisTutar = 0;
        let hisseAlisTutar = 0, fonAlisTutar = 0;
        const uniqueSyms = new Set();
        rows.forEach(e => {
            const sym = String(e.menkul).trim().toUpperCase();
            uniqueSyms.add(sym);
            const adet = parseFloat(e.adet) || 0;
            const fiyat = parseFloat(e.fiyat) || 0;
            const tutar = Math.abs(adet) * fiyat;
            if (adet >= 0) {
                alisCount++;
                alisTutar += tutar;
                if (sym.length === 3) fonAlisTutar += tutar;
                else hisseAlisTutar += tutar;
            } else {
                satisCount++;
                satisTutar += tutar;
            }
        });
        const netAkis = alisTutar - satisTutar;
        const acikCount = [...uniqueSyms].filter(sym => symbolStats[sym] && symbolStats[sym].isAcik).length;

        return `
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-icon-box navy"><i class="fas fa-receipt"></i></div>
                    <div class="kpi-info">
                        <div class="kpi-label">Toplam İşlem</div>
                        <div class="kpi-value">${rows.length.toLocaleString('tr-TR')}</div>
                        <div class="kpi-sub">${alisCount} Alış · ${satisCount} Satış · ${uniqueSyms.size} Menkul</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon-box green"><i class="fas fa-arrow-down"></i></div>
                    <div class="kpi-info">
                        <div class="kpi-label">Toplam Alış</div>
                        <div class="kpi-value" style="color: var(--success-color);">${formatCurrency(alisTutar, 0)}</div>
                        <div class="kpi-sub">Hisse: ${formatCurrency(hisseAlisTutar, 0)} · Fon: ${formatCurrency(fonAlisTutar, 0)}</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon-box red"><i class="fas fa-arrow-up"></i></div>
                    <div class="kpi-info">
                        <div class="kpi-label">Toplam Satış</div>
                        <div class="kpi-value" style="color: var(--danger-color);">${formatCurrency(satisTutar, 0)}</div>
                        <div class="kpi-sub">${satisCount > 0 ? `Ort. Satış: ${formatCurrency(satisTutar / satisCount, 0)}` : 'Satış kaydı yok'}</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon-box slate"><i class="fas fa-scale-balanced"></i></div>
                    <div class="kpi-info">
                        <div class="kpi-label">Net Yatırım Akışı</div>
                        <div class="kpi-value">${formatCurrency(netAkis, 0)}</div>
                        <div class="kpi-sub">Açık Pozisyon: ${acikCount} menkul</div>
                    </div>
                </div>
            </div>
        `;
    };

    const buildTradeRowHtml = (e, sn) => {
        const sym = String(e.menkul).trim().toUpperCase();
        const safeSym = window.escapeHtml(sym);
        const safeId = window.escapeHtml(String(e.id));
        const isFon = sym.length === 3;
        const adet = parseFloat(e.adet) || 0;
        const fiyat = parseFloat(e.fiyat) || 0;
        const tutar = Math.abs(adet) * fiyat;
        const isAlis = adet >= 0;

        return `<tr>
            <td style="text-align: center !important; color: #64748b !important;">${sn}</td>
            <td style="text-align: center !important;">${formatDate(e.tarih)}</td>
            <td style="text-align: left !important;">
                <span class="ekstre-symbol-link" onclick="window.goToHisse('${safeSym}')" title="${safeSym} detayına git">
                    ${safeSym}
                    <span class="ekstre-badge ${isFon ? 'ekstre-badge-fon' : 'ekstre-badge-hisse'}">${isFon ? 'Fon' : 'Hisse'}</span>
                </span>
            </td>
            <td style="text-align: center !important;">
                <span class="ekstre-badge ${isAlis ? 'ekstre-badge-alis' : 'ekstre-badge-satis'}">
                    <i class="fas ${isAlis ? 'fa-arrow-down' : 'fa-arrow-up'}" style="font-size: 10px;"></i>
                    ${isAlis ? 'ALIŞ' : 'SATIŞ'}
                </span>
            </td>
            <td style="text-align: right !important;">${formatEkstrePrice(fiyat, isFon)}</td>
            <td style="text-align: right !important; font-weight: 600 !important;" class="${isAlis ? 'text-success' : 'text-danger'}">${formatEkstreQty(adet)}</td>
            <td style="text-align: right !important; font-weight: 700 !important; color: #0f172a !important;">${formatCurrency(tutar, 0)}</td>
            <td style="text-align: center !important;">
                <div class="ekstre-row-actions">
                    <button type="button" class="ekstre-action-btn edit" onclick="window.openEkstreModal('${safeId}')" title="Düzenle"><i class="fas fa-edit"></i></button>
                    <button type="button" class="ekstre-action-btn delete" onclick="window.deleteEkstre('${safeId}')" title="Sil"><i class="fas fa-trash-alt"></i></button>
                </div>
            </td>
        </tr>`;
    };

    const buildHisseTableHtml = (rows) => {
        if (rows.length === 0) {
            return `
                <div class="ekstre-empty-state">
                    <i class="fas fa-receipt"></i>
                    <div style="font-size: 15px; font-weight: 700; color: #1e293b;">Eşleşen işlem bulunamadı</div>
                    <div style="font-size: 13.5px; color: #64748b;">Filtreleri temizleyebilir veya sağ üstten yeni bir hisse/fon işlemi ekleyebilirsiniz.</div>
                </div>
            `;
        }

        const isGrouped = window.ekstreViewMode === 'grouped';
        const hasSearch = (window.ekstreSearchQuery || '').trim().length > 0;
        let tbodyHtml = '';
        let totalTutarSum = 0;
        let netFlowSum = 0;

        rows.forEach(e => {
            const adet = parseFloat(e.adet) || 0;
            const fiyat = parseFloat(e.fiyat) || 0;
            const t = Math.abs(adet) * fiyat;
            totalTutarSum += t;
            netFlowSum += adet >= 0 ? t : -t;
        });

        if (!isGrouped) {
            rows.forEach((e, idx) => {
                tbodyHtml += buildTradeRowHtml(e, idx + 1);
            });
        } else {
            const groupMap = {};
            const groups = [];
            rows.forEach(e => {
                const sym = String(e.menkul).trim().toUpperCase();
                if (!groupMap[sym]) {
                    groupMap[sym] = { menkul: sym, rows: [] };
                    groups.push(groupMap[sym]);
                }
                groupMap[sym].rows.push(e);
            });
            groups.sort((a, b) => a.menkul.localeCompare(b.menkul));

            let snCounter = 1;
            groups.forEach(g => {
                const st = symbolStats[g.menkul] || { isFon: g.menkul.length === 3, netAdet: 0, ortAlis: 0, alisTutar: 0, satisTutar: 0, isAcik: false };
                const safeSym = window.escapeHtml(g.menkul);
                const isCollapsed = hasSearch ? false : (window.hisseGroupCollapsed[g.menkul] === true);
                const chevron = isCollapsed ? 'fa-chevron-right' : 'fa-chevron-down';

                tbodyHtml += `
                    <tr class="ekstre-group-row" onclick="window.toggleHisseGroup('${safeSym}')">
                        <td colspan="8" style="text-align: left !important;">
                            <div class="ekstre-group-flex">
                                <div class="ekstre-group-left">
                                    <i class="fas ${chevron} ekstre-group-chevron"></i>
                                    <span class="ekstre-symbol-link" onclick="event.stopPropagation(); window.goToHisse('${safeSym}')" title="${safeSym} detayına git">${safeSym}</span>
                                    <span class="ekstre-badge ${st.isFon ? 'ekstre-badge-fon' : 'ekstre-badge-hisse'}">${st.isFon ? 'Fon' : 'Hisse'}</span>
                                    <span class="ekstre-badge ${st.isAcik ? 'ekstre-badge-acik' : 'ekstre-badge-kapali'}">${st.isAcik ? 'Açık' : 'Kapatıldı'}</span>
                                </div>
                                <div class="ekstre-group-meta">
                                    <span class="ekstre-group-chip"><strong>${g.rows.length}</strong> işlem</span>
                                    <span class="ekstre-group-chip">Net: <strong>${st.netAdet.toLocaleString('tr-TR', { maximumFractionDigits: 4 })}</strong> adet</span>
                                    ${st.ortAlis > 0 ? `<span class="ekstre-group-chip">Ort. Alış: <strong>${formatEkstrePrice(st.ortAlis, st.isFon)}</strong></span>` : ''}
                                    <span class="ekstre-group-chip">Alış: <strong style="color: #059669;">${formatCurrency(st.alisTutar, 0)}</strong></span>
                                    ${st.satisTutar > 0 ? `<span class="ekstre-group-chip">Satış: <strong style="color: #dc2626;">${formatCurrency(st.satisTutar, 0)}</strong></span>` : ''}
                                    <button type="button" class="ekstre-group-add-btn" onclick="event.stopPropagation(); window.openEkstreModal(null, '${safeSym}')" title="${safeSym} için yeni işlem ekle">
                                        <i class="fas fa-plus"></i> İşlem
                                    </button>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;

                if (!isCollapsed) {
                    g.rows.forEach(e => {
                        tbodyHtml += buildTradeRowHtml(e, snCounter++);
                    });
                }
            });
        }

        return `
            <div class="table-container" style="margin-bottom: 0; padding-top: 0;">
                <table class="dash-table ekstre-table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th style="width: 52px;">S.N.</th>
                            <th style="cursor: pointer; user-select: none;" onclick="window.toggleHisseSort('tarih')">Tarih</th>
                            <th style="text-align: left !important; cursor: pointer; user-select: none;" onclick="window.toggleHisseSort('menkul')">Menkul</th>
                            <th>Yön</th>
                            <th style="text-align: right !important; cursor: pointer; user-select: none;" onclick="window.toggleHisseSort('fiyat')">Birim Fiyat</th>
                            <th style="text-align: right !important; cursor: pointer; user-select: none;" onclick="window.toggleHisseSort('adet')">Adet</th>
                            <th style="text-align: right !important; cursor: pointer; user-select: none;" onclick="window.toggleHisseSort('tutar')">Tutar</th>
                            <th style="width: 92px;">İşlem</th>
                        </tr>
                    </thead>
                    <tbody id="hisse-tbody">
                        ${tbodyHtml}
                        <tr class="total-row">
                            <td colspan="3" style="text-align: left !important; padding-left: 12px !important;">FİLTRELENEN TOPLAM (${rows.length} işlem)</td>
                            <td colspan="3" style="text-align: right !important;">Net Akış: ${formatCurrency(netFlowSum, 0)}</td>
                            <td style="text-align: right !important;">${formatCurrency(totalTutarSum, 0)}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    };

    const buildNakitSectionHtml = () => {
        window.nakitSort = window.nakitSort || { col: 'tarih', asc: false };
        const sortedNakit = [...allNakit].sort((a, b) => {
            const col = window.nakitSort.col || 'tarih';
            const asc = !!window.nakitSort.asc;
            let vA, vB;
            if (col === 'tarih') { vA = new Date(a.tarih).getTime() || 0; vB = new Date(b.tarih).getTime() || 0; }
            else if (col === 'tutar') { vA = a.tutar || 0; vB = b.tutar || 0; }
            else if (col === 'bist100') { vA = a.bist100 || 0; vB = b.bist100 || 0; }
            else if (col === 'dolar') { vA = a.dolar || 0; vB = b.dolar || 0; }
            else if (col === 'gramAltin') { vA = a.gramAltin || 0; vB = b.gramAltin || 0; }
            else if (col === 'pry') { vA = a.pry || 0; vB = b.pry || 0; }
            else { vA = new Date(a.tarih).getTime() || 0; vB = new Date(b.tarih).getTime() || 0; }
            return asc ? vA - vB : vB - vA;
        });

        let girisCount = 0, cikisCount = 0, girisTutar = 0, cikisTutar = 0;
        sortedNakit.forEach(n => {
            const t = parseFloat(n.tutar) || 0;
            if (t >= 0) { girisCount++; girisTutar += t; }
            else { cikisCount++; cikisTutar += Math.abs(t); }
        });
        const netNakit = girisTutar - cikisTutar;

        const kpiHtml = `
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-icon-box navy"><i class="fas fa-money-bill-transfer"></i></div>
                    <div class="kpi-info">
                        <div class="kpi-label">Nakit Hareketleri</div>
                        <div class="kpi-value">${sortedNakit.length}</div>
                        <div class="kpi-sub">${girisCount} Giriş · ${cikisCount} Çıkış</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon-box green"><i class="fas fa-arrow-down"></i></div>
                    <div class="kpi-info">
                        <div class="kpi-label">Toplam Giriş</div>
                        <div class="kpi-value" style="color: var(--success-color);">+${formatCurrency(girisTutar, 0)}</div>
                        <div class="kpi-sub">Portföye eklenen anapara</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon-box red"><i class="fas fa-arrow-up"></i></div>
                    <div class="kpi-info">
                        <div class="kpi-label">Toplam Çıkış</div>
                        <div class="kpi-value" style="color: var(--danger-color);">-${formatCurrency(cikisTutar, 0)}</div>
                        <div class="kpi-sub">Portföyden çekilen tutar</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon-box slate"><i class="fas fa-wallet"></i></div>
                    <div class="kpi-info">
                        <div class="kpi-label">Net Nakit Girişi</div>
                        <div class="kpi-value">${formatCurrency(netNakit, 0)}</div>
                        <div class="kpi-sub">Kümülatif anapara akışı</div>
                    </div>
                </div>
            </div>
        `;

        const rowsHtml = sortedNakit.length === 0 ? '' : sortedNakit.map((n, i) => {
            const t = parseFloat(n.tutar) || 0;
            const isGiris = t >= 0;
            const safeId = window.escapeHtml(String(n.id));
            return `<tr>
                <td style="text-align: center !important; color: #64748b !important;">${i + 1}</td>
                <td style="text-align: center !important;">${formatDate(n.tarih)}</td>
                <td style="text-align: center !important;">
                    <span class="ekstre-badge ${isGiris ? 'ekstre-badge-alis' : 'ekstre-badge-satis'}">
                        <i class="fas ${isGiris ? 'fa-arrow-down' : 'fa-arrow-up'}" style="font-size: 10px;"></i>
                        ${isGiris ? 'GİRİŞ' : 'ÇIKIŞ'}
                    </span>
                </td>
                <td style="text-align: right !important; font-weight: 700 !important;" class="${isGiris ? 'text-success' : 'text-danger'}">${isGiris ? '+' : '-'}${formatCurrency(Math.abs(t), 0)}</td>
                <td style="text-align: right !important;">${formatNumber(n.bist100)}</td>
                <td style="text-align: right !important;">${formatNumber(n.dolar)}</td>
                <td style="text-align: right !important;">${formatNumber(n.gramAltin)}</td>
                <td style="text-align: right !important;">${formatNumber(n.pry, 6)}</td>
                <td style="text-align: center !important;">
                    <div class="ekstre-row-actions">
                        <button type="button" class="ekstre-action-btn edit" onclick="window.openNakitModal('${safeId}')" title="Düzenle"><i class="fas fa-edit"></i></button>
                        <button type="button" class="ekstre-action-btn delete" onclick="window.deleteNakit('${safeId}')" title="Sil"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            </tr>`;
        }).join('');

        const tableHtml = sortedNakit.length === 0 ? `
            <div class="ekstre-empty-state">
                <i class="fas fa-money-bill-transfer"></i>
                <div style="font-size: 15px; font-weight: 700; color: #1e293b;">Henüz nakit hareketi eklenmemiş</div>
                <div style="font-size: 13.5px; color: #64748b;">Sağ üstteki butondan portföye nakit girişi veya çıkışı ekleyebilirsiniz.</div>
            </div>
        ` : `
            <div class="table-container" style="margin-bottom: 0; padding-top: 0;">
                <table class="dash-table ekstre-table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th style="width: 52px;">S.N.</th>
                            <th style="cursor: pointer; user-select: none;" onclick="window.toggleNakitSort('tarih')">Tarih</th>
                            <th>Yön</th>
                            <th style="text-align: right !important; cursor: pointer; user-select: none;" onclick="window.toggleNakitSort('tutar')">Tutar</th>
                            <th style="text-align: right !important; cursor: pointer; user-select: none;" onclick="window.toggleNakitSort('bist100')">XU100</th>
                            <th style="text-align: right !important; cursor: pointer; user-select: none;" onclick="window.toggleNakitSort('dolar')">USDTRY</th>
                            <th style="text-align: right !important; cursor: pointer; user-select: none;" onclick="window.toggleNakitSort('gramAltin')">GRAMALTIN</th>
                            <th style="text-align: right !important; cursor: pointer; user-select: none;" onclick="window.toggleNakitSort('pry')">PRY</th>
                            <th style="width: 92px;">İşlem</th>
                        </tr>
                    </thead>
                    <tbody id="nakit-tbody">
                        ${rowsHtml}
                        <tr class="total-row">
                            <td colspan="3" style="text-align: left !important; padding-left: 12px !important;">TOPLAM NET NAKİT</td>
                            <td style="text-align: right !important;" class="${netNakit >= 0 ? 'text-success' : 'text-danger'}">${netNakit >= 0 ? '+' : '-'}${formatCurrency(Math.abs(netNakit), 0)}</td>
                            <td colspan="5"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        return { kpiHtml, tableHtml };
    };

    const isHisseTab = window.ekstreTab !== 'nakit';
    const filteredHisse = isHisseTab ? computeFilteredHisse() : [];
    const nakitRendered = !isHisseTab ? buildNakitSectionHtml() : null;

    const hasActiveFilter = (window.ekstreSearchQuery || '').trim() !== '' ||
        window.ekstreFilterTur !== 'all' ||
        window.ekstreFilterYon !== 'all' ||
        window.ekstreFilterDurum !== 'all' ||
        window.ekstreFilterYil !== 'all';

    const anyGroupExpanded = isHisseTab && window.ekstreViewMode === 'grouped' &&
        Object.keys(symbolStats).some(sym => window.hisseGroupCollapsed[sym] !== true);

    const filterBarHtml = isHisseTab ? `
        <div class="ekstre-filter-bar">
            <div class="ekstre-filter-left">
                <div class="ekstre-search-wrap">
                    <i class="fas fa-search"></i>
                    <input type="text" id="ekstre-search-input" class="ekstre-search-input" placeholder="Menkul veya tarih ara..."
                           value="${window.escapeHtml(window.ekstreSearchQuery || '')}"
                           oninput="window.filterEkstreTable(this.value)">
                    <button type="button" id="ekstre-search-clear-btn" class="ekstre-search-clear"
                            style="display: ${(window.ekstreSearchQuery || '').trim() ? 'inline-flex' : 'none'};"
                            onclick="window.filterEkstreTable(''); const el=document.getElementById('ekstre-search-input'); if(el){el.value=''; el.focus();}" title="Aramayı Temizle">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="ekstre-segmented" title="Menkul Türü">
                    <button type="button" class="ekstre-seg-btn ${window.ekstreFilterTur === 'all' ? 'active' : ''}" onclick="window.setEkstreFilter('tur', 'all')">Tümü</button>
                    <button type="button" class="ekstre-seg-btn ${window.ekstreFilterTur === 'hisse' ? 'active' : ''}" onclick="window.setEkstreFilter('tur', 'hisse')">Hisse</button>
                    <button type="button" class="ekstre-seg-btn ${window.ekstreFilterTur === 'fon' ? 'active' : ''}" onclick="window.setEkstreFilter('tur', 'fon')">Fon</button>
                </div>

                <div class="ekstre-segmented" title="İşlem Yönü">
                    <button type="button" class="ekstre-seg-btn ${window.ekstreFilterYon === 'all' ? 'active' : ''}" onclick="window.setEkstreFilter('yon', 'all')">Tümü</button>
                    <button type="button" class="ekstre-seg-btn alis ${window.ekstreFilterYon === 'alis' ? 'active' : ''}" onclick="window.setEkstreFilter('yon', 'alis')">Alış</button>
                    <button type="button" class="ekstre-seg-btn satis ${window.ekstreFilterYon === 'satis' ? 'active' : ''}" onclick="window.setEkstreFilter('yon', 'satis')">Satış</button>
                </div>

                <select class="ekstre-select" aria-label="Pozisyon Durumu" onchange="window.setEkstreFilter('durum', this.value)">
                    <option value="all" ${window.ekstreFilterDurum === 'all' ? 'selected' : ''}>Durum: Tümü</option>
                    <option value="acik" ${window.ekstreFilterDurum === 'acik' ? 'selected' : ''}>Portföyde Açık</option>
                    <option value="kapali" ${window.ekstreFilterDurum === 'kapali' ? 'selected' : ''}>Kapatılmış</option>
                </select>

                ${allYears.length > 0 ? `
                <select class="ekstre-select" aria-label="Yıl Filtresi" onchange="window.setEkstreFilter('yil', this.value)">
                    <option value="all" ${window.ekstreFilterYil === 'all' ? 'selected' : ''}>Yıl: Tümü</option>
                    ${allYears.map(y => `<option value="${y}" ${window.ekstreFilterYil === y ? 'selected' : ''}>${y}</option>`).join('')}
                </select>
                ` : ''}

                <span id="ekstre-filter-reset-slot">
                    ${hasActiveFilter ? `<button type="button" class="ekstre-ghost-btn reset" onclick="window.resetEkstreFilters()"><i class="fas fa-rotate-left"></i> Temizle</button>` : ''}
                </span>
            </div>

            <div class="ekstre-filter-right">
                <div class="ekstre-segmented" title="Görünüm Modu">
                    <button type="button" class="ekstre-seg-btn ${window.ekstreViewMode === 'chrono' ? 'active' : ''}" onclick="window.setEkstreViewMode('chrono')">
                        <i class="fas fa-clock"></i> Son İşlemler
                    </button>
                    <button type="button" class="ekstre-seg-btn ${window.ekstreViewMode === 'grouped' ? 'active' : ''}" onclick="window.setEkstreViewMode('grouped')">
                        <i class="fas fa-layer-group"></i> Gruplu
                    </button>
                </div>
                ${window.ekstreViewMode === 'grouped' ? `
                    <button type="button" id="ekstre-toggle-all-btn" class="ekstre-ghost-btn" onclick="window.toggleAllEkstreGroups(${anyGroupExpanded ? 'false' : 'true'})">
                        <i class="fas ${anyGroupExpanded ? 'fa-compress-alt' : 'fa-expand-alt'}"></i>
                        ${anyGroupExpanded ? 'Tümünü Daralt' : 'Tümünü Aç'}
                    </button>
                ` : ''}
            </div>
        </div>
    ` : '';

    container.innerHTML = `
        <div class="page-section active" style="display: flex; flex-direction: column; padding: 0; gap: 1rem;">
            <div id="ekstre-kpi-slot">
                ${isHisseTab ? buildHisseKpiHtml(filteredHisse) : nakitRendered.kpiHtml}
            </div>

            <div class="glass ekstre-card-shell">
                <div class="ekstre-toolbar-top">
                    <div class="ekstre-tab-group">
                        <button type="button" class="ekstre-tab-pill ${isHisseTab ? 'active' : ''}" onclick="window.setEkstreTab('hisse')">
                            <i class="fas fa-chart-bar"></i>
                            <span>Hisse ve Fon İşlemleri</span>
                            <span class="ekstre-tab-count">${allHisseFon.length}</span>
                        </button>
                        <button type="button" class="ekstre-tab-pill ${!isHisseTab ? 'active' : ''}" onclick="window.setEkstreTab('nakit')">
                            <i class="fas fa-money-bill-transfer"></i>
                            <span>Nakit İşlemleri</span>
                            <span class="ekstre-tab-count">${allNakit.length}</span>
                        </button>
                    </div>

                    <button type="button" class="btn ekstre-primary-cta" onclick="${isHisseTab ? 'window.openEkstreModal()' : 'window.openNakitModal()'}">
                        <i class="fas fa-plus"></i>
                        <span>${isHisseTab ? 'Yeni İşlem Ekle' : 'Yeni Nakit Hareketi'}</span>
                    </button>
                </div>

                ${filterBarHtml}

                <div id="ekstre-table-slot">
                    ${isHisseTab ? buildHisseTableHtml(filteredHisse) : nakitRendered.tableHtml}
                </div>
            </div>
        </div>
    `;

    window.updateEkstreViewOnly = () => {
        if (window.ekstreTab !== 'hisse') return;
        const rows = computeFilteredHisse();
        const kpiSlot = document.getElementById('ekstre-kpi-slot');
        const tableSlot = document.getElementById('ekstre-table-slot');
        const clearBtn = document.getElementById('ekstre-search-clear-btn');
        const resetSlot = document.getElementById('ekstre-filter-reset-slot');
        const toggleAllBtn = document.getElementById('ekstre-toggle-all-btn');
        if (kpiSlot) kpiSlot.innerHTML = buildHisseKpiHtml(rows);
        if (tableSlot) tableSlot.innerHTML = buildHisseTableHtml(rows);
        if (clearBtn) clearBtn.style.display = (window.ekstreSearchQuery || '').trim() ? 'inline-flex' : 'none';
        if (toggleAllBtn) {
            const anyOpen = Object.keys(symbolStats).some(sym => window.hisseGroupCollapsed[sym] !== true);
            toggleAllBtn.setAttribute('onclick', `window.toggleAllEkstreGroups(${anyOpen ? 'false' : 'true'})`);
            toggleAllBtn.innerHTML = `<i class="fas ${anyOpen ? 'fa-compress-alt' : 'fa-expand-alt'}"></i> ${anyOpen ? 'Tümünü Daralt' : 'Tümünü Aç'}`;
        }
        if (resetSlot) {
            const active = (window.ekstreSearchQuery || '').trim() !== '' ||
                window.ekstreFilterTur !== 'all' ||
                window.ekstreFilterYon !== 'all' ||
                window.ekstreFilterDurum !== 'all' ||
                window.ekstreFilterYil !== 'all';
            resetSlot.innerHTML = active ? `<button type="button" class="ekstre-ghost-btn reset" onclick="window.resetEkstreFilters()"><i class="fas fa-rotate-left"></i> Temizle</button>` : '';
        }
    };
};

const renderNakitIslemleri = (container) => {
    window.ekstreTab = 'nakit';
    renderHisseIslemleri(container);
};

const ENF_MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const ENF_MONTHS_SHORT_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

const parseEnfRate = (val) => {
    if (typeof val === 'number') return isFinite(val) ? val : NaN;
    const cleaned = String(val ?? '').trim().replace('%', '').replace(/\s+/g, '').replace(',', '.');
    const n = parseFloat(cleaned);
    return isFinite(n) ? n : NaN;
};

const formatEnfPeriodLabel = (ym, shortForm = false) => {
    const parts = String(ym || '').split('-');
    if (parts.length !== 2) return String(ym || '');
    const y = parts[0];
    const mIdx = parseInt(parts[1], 10) - 1;
    if (mIdx < 0 || mIdx > 11) return String(ym || '');
    return shortForm ? `${ENF_MONTHS_SHORT_TR[mIdx]} ${y.slice(-2)}` : `${ENF_MONTHS_TR[mIdx]} ${y}`;
};

const addMonthsYm = (ym, delta) => {
    const [y, m] = String(ym).split('-').map(Number);
    const dt = new Date(y, (m - 1) + delta, 1);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
};

const ensureEnflasyonList = () => {
    if (!Array.isArray(State.data.enflasyonListesi)) {
        State.data.enflasyonListesi = [
            { id: 'enf_1719792000005', tarih: '2026-06', oran: 1.64 },
            { id: 'enf_1719792000004', tarih: '2026-05', oran: 3.37 },
            { id: 'enf_1719792000003', tarih: '2026-04', oran: 3.18 },
            { id: 'enf_1719792000002', tarih: '2026-03', oran: 3.16 },
            { id: 'enf_1719792000001', tarih: '2026-02', oran: 4.53 },
            { id: 'enf_1719792000000', tarih: '2026-01', oran: 6.70 }
        ];
    }
    return State.data.enflasyonListesi
        .filter(x => x && /^\d{4}-\d{2}$/.test(String(x.tarih || '').trim()) && !isNaN(parseEnfRate(x.oran)))
        .map(x => ({
            id: x.id || ('enf_' + x.tarih),
            tarih: String(x.tarih).trim(),
            oran: parseEnfRate(x.oran)
        }));
};

const buildEnflasyonAnalytics = () => {
    const raw = ensureEnflasyonList();
    // Deduplicate by tarih keeping latest
    const byYm = {};
    raw.forEach(item => { byYm[item.tarih] = item; });
    const asc = Object.values(byYm).sort((a, b) => a.tarih.localeCompare(b.tarih));

    const monthRateMap = {};
    asc.forEach(it => { monthRateMap[it.tarih] = it.oran; });

    let overallFactor = 1;
    const yearFactorMap = {};
    const enriched = asc.map((item, idx) => {
        const year = item.tarih.slice(0, 4);
        const factor = 1 + (item.oran / 100);
        overallFactor *= factor;
        yearFactorMap[year] = (yearFactorMap[year] || 1) * factor;

        const prevItem = idx > 0 ? asc[idx - 1] : null;
        const momDiff = prevItem ? (item.oran - prevItem.oran) : null;

        // Exact trailing 12 consecutive calendar months
        let yoy = null;
        let hasAll12 = true;
        let yoyFactor = 1;
        for (let k = 0; k < 12; k++) {
            const targetYm = addMonthsYm(item.tarih, -k);
            if (monthRateMap[targetYm] === undefined) {
                hasAll12 = false;
                break;
            }
            yoyFactor *= (1 + monthRateMap[targetYm] / 100);
        }
        if (hasAll12) yoy = (yoyFactor - 1) * 100;

        return {
            ...item,
            year,
            month: parseInt(item.tarih.slice(5, 7), 10),
            momDiff,
            ytd: (yearFactorMap[year] - 1) * 100,
            yoy,
            cum: (overallFactor - 1) * 100,
            cumFactor: overallFactor,
            index100: 100 * overallFactor
        };
    });

    // Missing period detection (internal gaps + trailing gap up to previous completed month)
    const missingMonths = [];
    if (enriched.length > 0) {
        const firstYm = enriched[0].tarih;
        const lastYm = enriched[enriched.length - 1].tarih;
        const now = new Date();
        const prevCompletedYm = addMonthsYm(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`, -1);
        const scanEnd = prevCompletedYm > lastYm ? prevCompletedYm : lastYm;

        let cursor = firstYm;
        let guard = 0;
        while (cursor <= scanEnd && guard < 180) {
            if (monthRateMap[cursor] === undefined) {
                missingMonths.push(cursor);
            }
            cursor = addMonthsYm(cursor, 1);
            guard++;
        }
    }

    // Suggest next natural month when adding a new record
    let suggestedNextYm = '';
    if (missingMonths.length > 0) {
        suggestedNextYm = missingMonths[0];
    } else if (enriched.length > 0) {
        suggestedNextYm = addMonthsYm(enriched[enriched.length - 1].tarih, 1);
    } else {
        const now = new Date();
        suggestedNextYm = addMonthsYm(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`, -1);
    }

    return { asc: enriched, monthRateMap, missingMonths, suggestedNextYm };
};

const parseBulkEnflasyonLines = (rawText) => {
    const trMonthMap = {
        'ocak': '01', 'oca': '01', 'jan': '01', 'january': '01',
        'subat': '02', 'şubat': '02', 'sub': '02', 'şub': '02', 'feb': '02',
        'mart': '03', 'mar': '03',
        'nisan': '04', 'nis': '04', 'apr': '04',
        'mayis': '05', 'mayıs': '05', 'may': '05',
        'haziran': '06', 'haz': '06', 'jun': '06',
        'temmuz': '07', 'tem': '07', 'jul': '07',
        'agustos': '08', 'ağustos': '08', 'agu': '08', 'ağu': '08', 'aug': '08',
        'eylul': '09', 'eylül': '09', 'eyl': '09', 'sep': '09',
        'ekim': '10', 'eki': '10', 'oct': '10',
        'kasim': '11', 'kasım': '11', 'kas': '11', 'nov': '11',
        'aralik': '12', 'aralık': '12', 'ara': '12', 'dec': '12'
    };

    const parsed = [];
    const skipped = [];
    const lines = String(rawText || '').split(/\r?\n/);

    lines.forEach((rawLine) => {
        const line = rawLine.trim();
        if (!line) return;

        let ym = null;
        let rest = line;

        // Pattern 1: YYYY-MM or YYYY.MM or YYYY/MM
        let m = line.match(/\b(20\d{2}|19\d{2})[-./](\d{1,2})\b/);
        if (m) {
            const mo = parseInt(m[2], 10);
            if (mo >= 1 && mo <= 12) {
                ym = `${m[1]}-${String(mo).padStart(2, '0')}`;
                rest = line.replace(m[0], ' ');
            }
        }

        // Pattern 2: MM.YYYY or MM/YYYY or MM-YYYY
        if (!ym) {
            m = line.match(/\b(\d{1,2})[-./](20\d{2}|19\d{2})\b/);
            if (m) {
                const mo = parseInt(m[1], 10);
                if (mo >= 1 && mo <= 12) {
                    ym = `${m[2]}-${String(mo).padStart(2, '0')}`;
                    rest = line.replace(m[0], ' ');
                }
            }
        }

        // Pattern 3: Turkish/English Month Name + Year (e.g. "Haziran 2026 1,64")
        if (!ym) {
            const lower = line.toLocaleLowerCase('tr-TR');
            const yMatch = lower.match(/\b(20\d{2}|19\d{2})\b/);
            if (yMatch) {
                for (const [key, moStr] of Object.entries(trMonthMap)) {
                    if (new RegExp(`(^|[^a-zçğıöşü])${key}([^a-zçğıöşü]|$)`, 'i').test(lower)) {
                        ym = `${yMatch[1]}-${moStr}`;
                        rest = line.replace(yMatch[0], ' ');
                        break;
                    }
                }
            }
        }

        if (!ym) {
            skipped.push(line);
            return;
        }

        const numMatches = rest.match(/-?\d+(?:[.,]\d+)?/g);
        if (!numMatches || numMatches.length === 0) {
            skipped.push(line);
            return;
        }
        const oran = parseEnfRate(numMatches[numMatches.length - 1]);
        if (isNaN(oran)) {
            skipped.push(line);
            return;
        }
        parsed.push({ tarih: ym, oran });
    });

    // Deduplicate preserving last occurrence
    const dedup = {};
    parsed.forEach(p => { dedup[p.tarih] = p; });
    return { items: Object.values(dedup).sort((a, b) => a.tarih.localeCompare(b.tarih)), skipped };
};

window.setEnfViewMode = (mode) => {
    window.enfViewMode = mode;
    if (typeof renderPage === 'function') renderPage();
};

window.setEnfChartMode = (mode) => {
    window.enfChartMode = mode;
    if (typeof renderPage === 'function') renderPage();
};

window.setEnfYearFilter = (year) => {
    window.enfYearFilter = year;
    if (typeof renderPage === 'function') renderPage();
};

window.toggleEnfSort = (col) => {
    if (!window.enfSort) window.enfSort = { col: 'tarih', asc: false };
    if (window.enfSort.col === col) {
        window.enfSort.asc = !window.enfSort.asc;
    } else {
        window.enfSort = { col, asc: false };
    }
    if (typeof renderPage === 'function') renderPage();
};

window.toggleEnfForm = () => {
    window.openEnflasyonModal(null);
};

window.openEnflasyonModal = (editId = null, prefillYm = null) => {
    const existingOverlay = document.getElementById('enf-modal-overlay');
    if (existingOverlay) existingOverlay.remove();

    const { asc, suggestedNextYm } = buildEnflasyonAnalytics();
    const existing = editId
        ? (State.data.enflasyonListesi || []).find(x => String(x.id) === String(editId))
        : (prefillYm ? (State.data.enflasyonListesi || []).find(x => x.tarih === prefillYm) : null);

    const initTarih = existing ? existing.tarih : (prefillYm || suggestedNextYm);
    const initOran = existing ? parseEnfRate(existing.oran) : '';

    const overlay = document.createElement('div');
    overlay.id = 'enf-modal-overlay';
    overlay.className = 'ekstre-modal-overlay';
    overlay.addEventListener('click', (ev) => {
        if (ev.target === overlay) overlay.remove();
    });

    overlay.innerHTML = `
        <div class="ekstre-modal-card" role="dialog" aria-modal="true" style="width: min(440px, 100%);">
            <div class="ekstre-modal-header">
                <h3>
                    <i class="fas ${existing ? 'fa-pen-to-square' : 'fa-plus-circle'}" style="color: #0284c7;"></i>
                    <span>${existing ? 'Enflasyon Verisini Düzenle' : 'Yeni Aylık Enflasyon Ekle'}</span>
                </h3>
                <button type="button" class="ekstre-modal-close" aria-label="Kapat" onclick="document.getElementById('enf-modal-overlay')?.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="enf-modal-form" class="ekstre-modal-body">
                <div class="ekstre-form-grid-2">
                    <div class="ekstre-field">
                        <label for="enf-m-tarih">Dönem (Yıl-Ay)</label>
                        <input type="month" id="enf-m-tarih" class="form-control" value="${window.escapeHtml(initTarih)}" required>
                    </div>
                    <div class="ekstre-field">
                        <label for="enf-m-oran">Aylık Enflasyon (%)</label>
                        <input type="number" id="enf-m-oran" class="form-control" step="0.01" placeholder="Örn: 2,45" value="${initOran !== '' && !isNaN(initOran) ? initOran : ''}" required>
                    </div>
                </div>
                <div class="ekstre-hint-bar">
                    <span><i class="fas fa-info-circle" style="margin-right:5px; color:#0284c7;"></i>Aynı dönem zaten kayıtlıysa oranı otomatik güncellenir.</span>
                </div>
                <div class="ekstre-modal-footer" style="margin: 0.25rem -1.35rem -1.25rem -1.35rem;">
                    <button type="button" class="ekstre-ghost-btn" onclick="document.getElementById('enf-modal-overlay')?.remove()">İptal</button>
                    <button type="submit" class="btn" style="padding: 9px 22px;">
                        <i class="fas fa-check" style="margin-right: 6px; color: #ffffff !important;"></i>${existing ? 'Güncelle' : 'Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);
    const inpTarih = document.getElementById('enf-m-tarih');
    const inpOran = document.getElementById('enf-m-oran');

    const onKeyDown = (ke) => {
        if (ke.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', onKeyDown);
        }
    };
    document.addEventListener('keydown', onKeyDown);

    document.getElementById('enf-modal-form').addEventListener('submit', (ev) => {
        ev.preventDefault();
        const tarih = (inpTarih.value || '').trim();
        const oran = parseEnfRate(inpOran.value);

        if (!/^\d{4}-\d{2}$/.test(tarih) || isNaN(oran)) {
            window.showToast('Lütfen geçerli bir dönem ve enflasyon oranı giriniz.', 'warning');
            return;
        }

        if (!Array.isArray(State.data.enflasyonListesi)) State.data.enflasyonListesi = [];

        // If editing and period changed, remove old record id to avoid duplicates
        if (existing && existing.tarih !== tarih) {
            State.data.enflasyonListesi = State.data.enflasyonListesi.filter(x => String(x.id) !== String(existing.id));
        }

        const existingIdx = State.data.enflasyonListesi.findIndex(x => x.tarih === tarih);
        if (existingIdx !== -1) {
            State.data.enflasyonListesi[existingIdx].oran = oran;
        } else {
            State.data.enflasyonListesi.push({
                id: existing ? existing.id : ('enf_' + Date.now() + '_' + Math.floor(Math.random() * 1000)),
                tarih,
                oran
            });
        }

        State.save();
        document.removeEventListener('keydown', onKeyDown);
        overlay.remove();
        window.showToast(`${formatEnfPeriodLabel(tarih)} enflasyon verisi kaydedildi.`, 'success');
        if (typeof renderPage === 'function') renderPage();
    });

    setTimeout(() => inpOran.focus(), 30);
};

window.openEnflasyonBulkModal = () => {
    const existingOverlay = document.getElementById('enf-bulk-modal-overlay');
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'enf-bulk-modal-overlay';
    overlay.className = 'ekstre-modal-overlay';
    overlay.addEventListener('click', (ev) => {
        if (ev.target === overlay) overlay.remove();
    });

    overlay.innerHTML = `
        <div class="ekstre-modal-card" role="dialog" aria-modal="true" style="width: min(520px, 100%);">
            <div class="ekstre-modal-header">
                <h3>
                    <i class="fas fa-file-import" style="color: #0284c7;"></i>
                    <span>Toplu Enflasyon Verisi Yapıştır</span>
                </h3>
                <button type="button" class="ekstre-modal-close" aria-label="Kapat" onclick="document.getElementById('enf-bulk-modal-overlay')?.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="enf-bulk-form" class="ekstre-modal-body">
                <div class="ekstre-field">
                    <label for="enf-bulk-text">Her satıra bir dönem ve aylık oran (%) yazın veya yapıştırın</label>
                    <textarea id="enf-bulk-text" class="takip-note-textarea" style="min-height: 150px; font-family: monospace; font-size: 13px;" placeholder="Örnek formatlar:&#10;2026-07 2,45&#10;08.2026 1.92&#10;Eylül 2026 %2,10"></textarea>
                </div>
                <div id="enf-bulk-preview" class="takip-target-status-bar">
                    <span><i class="fas fa-info-circle" style="margin-right:6px;"></i>YYYY-AA, AA.YYYY veya Türkçe ay adı formatları otomatik tanınır.</span>
                </div>
                <div class="ekstre-modal-footer" style="margin: 0.25rem -1.35rem -1.25rem -1.35rem;">
                    <button type="button" class="ekstre-ghost-btn" onclick="document.getElementById('enf-bulk-modal-overlay')?.remove()">İptal</button>
                    <button type="submit" class="btn" id="enf-bulk-submit" style="padding: 9px 22px;">
                        <i class="fas fa-check" style="margin-right: 6px; color: #ffffff !important;"></i>İçe Aktar
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);
    const textarea = document.getElementById('enf-bulk-text');
    const preview = document.getElementById('enf-bulk-preview');

    const refreshPreview = () => {
        const { items, skipped } = parseBulkEnflasyonLines(textarea.value);
        if (!textarea.value.trim()) {
            preview.className = 'takip-target-status-bar';
            preview.innerHTML = '<span><i class="fas fa-info-circle" style="margin-right:6px;"></i>YYYY-AA, AA.YYYY veya Türkçe ay adı formatları otomatik tanınır.</span>';
            return;
        }
        if (items.length === 0) {
            preview.className = 'takip-target-status-bar';
            preview.innerHTML = `<span style="color:#dc2626;"><i class="fas fa-exclamation-triangle" style="margin-right:6px;"></i>Geçerli satır algılanamadı (${skipped.length} satır atlandı).</span>`;
        } else {
            preview.className = 'takip-target-status-bar in-zone';
            preview.innerHTML = `<span><i class="fas fa-check-circle" style="margin-right:6px;"></i><strong>${items.length} dönem</strong> algılandı (${formatEnfPeriodLabel(items[0].tarih, true)} – ${formatEnfPeriodLabel(items[items.length - 1].tarih, true)}).</span>${skipped.length > 0 ? `<span style="color:#b45309;">${skipped.length} atlandı</span>` : ''}`;
        }
    };

    textarea.addEventListener('input', refreshPreview);

    const onKeyDown = (ke) => {
        if (ke.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', onKeyDown);
        }
    };
    document.addEventListener('keydown', onKeyDown);

    document.getElementById('enf-bulk-form').addEventListener('submit', (ev) => {
        ev.preventDefault();
        const { items } = parseBulkEnflasyonLines(textarea.value);
        if (items.length === 0) {
            window.showToast('İçe aktarılacak geçerli enflasyon satırı bulunamadı.', 'warning');
            return;
        }
        if (!Array.isArray(State.data.enflasyonListesi)) State.data.enflasyonListesi = [];
        let added = 0, updated = 0;
        items.forEach((it, idx) => {
            const existingIdx = State.data.enflasyonListesi.findIndex(x => x.tarih === it.tarih);
            if (existingIdx !== -1) {
                State.data.enflasyonListesi[existingIdx].oran = it.oran;
                updated++;
            } else {
                State.data.enflasyonListesi.push({
                    id: 'enf_' + (Date.now() + idx),
                    tarih: it.tarih,
                    oran: it.oran
                });
                added++;
            }
        });
        State.save();
        document.removeEventListener('keydown', onKeyDown);
        overlay.remove();
        window.showToast(`${added} yeni dönem eklendi${updated > 0 ? `, ${updated} dönem güncellendi` : ''}.`, 'success');
        if (typeof renderPage === 'function') renderPage();
    });

    setTimeout(() => textarea.focus(), 30);
};

window.addEnflasyon = (e) => {
    if (e) e.preventDefault();
    const tarihEl = document.getElementById('i-enf-tarih');
    const oranEl = document.getElementById('i-enf-oran');
    if (!tarihEl || !oranEl) {
        window.openEnflasyonModal(null);
        return;
    }
    const tarih = tarihEl.value;
    const oran = parseEnfRate(oranEl.value);
    if (!tarih || isNaN(oran)) {
        window.showToast('Lütfen tarih ve oran giriniz.', 'warning');
        return;
    }
    if (!Array.isArray(State.data.enflasyonListesi)) State.data.enflasyonListesi = [];
    const existingIdx = State.data.enflasyonListesi.findIndex(x => x.tarih === tarih);
    if (existingIdx !== -1) {
        State.data.enflasyonListesi[existingIdx].oran = oran;
    } else {
        State.data.enflasyonListesi.push({ id: 'enf_' + Date.now(), tarih, oran });
    }
    State.save();
    if (typeof renderPage === 'function') renderPage();
};

window.deleteEnflasyon = async (id) => {
    if (await window.showConfirm('Bu enflasyon verisini silmek istediğinize emin misiniz?', 'Evet, Sil')) {
        State.data.enflasyonListesi = (State.data.enflasyonListesi || []).filter(x => String(x.id) !== String(id));
        State.save();
        if (typeof renderPage === 'function') renderPage();
        window.showToast('Enflasyon verisi silindi.', 'info');
    }
};

window.renderEnflasyonData = () => {
    if (typeof renderPage === 'function') renderPage();
};

const renderVeriler = (container) => {
    window.enfViewMode = window.enfViewMode || 'list';
    window.enfChartMode = window.enfChartMode || 'cum';
    window.enfYearFilter = window.enfYearFilter || 'all';
    window.enfSort = window.enfSort || { col: 'tarih', asc: false };

    const { asc, monthRateMap, missingMonths } = buildEnflasyonAnalytics();
    const yearsDesc = [...new Set(asc.map(x => x.year))].sort((a, b) => b.localeCompare(a));
    if (window.enfYearFilter !== 'all' && !yearsDesc.includes(window.enfYearFilter)) {
        window.enfYearFilter = 'all';
    }

    const fmtPct2 = (val, showPlus = false) => {
        if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return '-';
        const s = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(val));
        if (val < 0) return '%-' + s;
        return (showPlus && val > 0 ? '%+' : '%') + s;
    };
    const fmtTL = (val, dec = 0) => {
        if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return '-';
        return '₺' + new Intl.NumberFormat('tr-TR', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(val);
    };

    // --- 4 KPI Cards ---
    const latest = asc.length > 0 ? asc[asc.length - 1] : null;
    const latestYearItems = latest ? asc.filter(x => x.year === latest.year) : [];
    const latestYearAvg = latestYearItems.length > 0
        ? (latestYearItems.reduce((s, x) => s + x.oran, 0) / latestYearItems.length)
        : null;

    // Annual (12m) or annualized rate
    let annualRate = null;
    let annualIsExact12 = false;
    let annualMonthsUsed = 0;
    if (latest) {
        if (latest.yoy !== null) {
            annualRate = latest.yoy;
            annualIsExact12 = true;
            annualMonthsUsed = 12;
        } else {
            // Count consecutive trailing months up to 12
            let factor = 1;
            let cnt = 0;
            for (let k = 0; k < 12; k++) {
                const ym = addMonthsYm(latest.tarih, -k);
                if (monthRateMap[ym] === undefined) break;
                factor *= (1 + monthRateMap[ym] / 100);
                cnt++;
            }
            if (cnt > 0) {
                annualMonthsUsed = cnt;
                annualRate = (Math.pow(factor, 12 / cnt) - 1) * 100;
            }
        }
    }

    // Portfolio real return vs inflation
    let portfoyReelPct = null;
    let portfoyNominalPct = null;
    let portfoyEnfEsik = 0;
    let hasPortfoyData = false;
    try {
        if (typeof calculatePortfoy === 'function') {
            const { portfoyBilgileri } = calculatePortfoy(State.data.ekstre || [], (m) => State.getFiyat(m), State.data.nakitHareketleri || []);
            if (portfoyBilgileri && portfoyBilgileri.enflasyonAnapara > 0) {
                hasPortfoyData = true;
                portfoyReelPct = (portfoyBilgileri.reelGetiriEnflasyon || 0) * 100;
                portfoyNominalPct = (portfoyBilgileri.nominalGetiri || 0) * 100;
                portfoyEnfEsik = portfoyBilgileri.enflasyonAnapara || 0;
            }
        }
    } catch (e) { }

    const momDiffTxt = latest && latest.momDiff !== null
        ? `Önceki aya göre ${latest.momDiff >= 0 ? '+' : ''}${new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(latest.momDiff)} puan`
        : (latest ? 'İlk kayıt dönemi' : 'Veri eklenmemiş');
    const momDiffColor = latest && latest.momDiff !== null ? (latest.momDiff <= 0 ? '#059669' : '#dc2626') : 'var(--text-secondary)';

    const kpiHtml = `
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-icon-box ${latest && latest.oran > 3 ? 'red' : 'navy'}"><i class="fas fa-calendar-day"></i></div>
                <div class="kpi-info">
                    <div class="kpi-label">Son Açıklanan Ay${latest ? ` (${formatEnfPeriodLabel(latest.tarih, true)})` : ''}</div>
                    <div class="kpi-value" style="color:${latest ? (latest.oran >= 0 ? 'var(--danger-color)' : 'var(--success-color)') : 'var(--text-primary)'};">${latest ? fmtPct2(latest.oran) : '-'}</div>
                    <div class="kpi-sub" style="color:${momDiffColor};">${momDiffTxt}</div>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon-box slate"><i class="fas fa-calendar-check"></i></div>
                <div class="kpi-info">
                    <div class="kpi-label">Yıl İçi Kümülatif (${latest ? latest.year : 'YTD'})</div>
                    <div class="kpi-value">${latest ? fmtPct2(latest.ytd) : '-'}</div>
                    <div class="kpi-sub">${latestYearItems.length} ay kayıtlı${latestYearAvg !== null ? ` · Aylık ort. ${fmtPct2(latestYearAvg)}` : ''}</div>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon-box red"><i class="fas fa-fire-flame-curved"></i></div>
                <div class="kpi-info">
                    <div class="kpi-label">${annualIsExact12 ? 'Yıllık Enflasyon (Son 12 Ay)' : 'Yıllıklandırılmış Trend'}</div>
                    <div class="kpi-value" style="color: var(--danger-color);">${annualRate !== null ? fmtPct2(annualRate) : '-'}</div>
                    <div class="kpi-sub">${annualIsExact12 ? 'Ardışık son 12 ay bileşik' : (annualMonthsUsed > 0 ? `Son ${annualMonthsUsed} ay bazlı projeksiyon` : 'Yeterli veri yok')}${latest ? ` · Seri: ${fmtPct2(latest.cum)}` : ''}</div>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon-box ${hasPortfoyData ? (portfoyReelPct >= 0 ? 'green' : 'red') : 'navy'}"><i class="fas fa-shield-halved"></i></div>
                <div class="kpi-info">
                    <div class="kpi-label">${hasPortfoyData ? 'Portföy Reel Getiri (Enf.)' : 'Alım Gücü Endeksi (100 ₺)'}</div>
                    <div class="kpi-value" style="color:${hasPortfoyData ? (portfoyReelPct >= 0 ? 'var(--success-color)' : 'var(--danger-color)') : 'var(--text-primary)'};">${hasPortfoyData ? fmtPct2(portfoyReelPct, true) : (latest ? fmtTL(latest.index100, 2) : '-')}</div>
                    <div class="kpi-sub">${hasPortfoyData ? `Nominal: ${fmtPct2(portfoyNominalPct, true)} · Eşik: ${fmtTL(portfoyEnfEsik, 0)}` : (latest ? `${formatEnfPeriodLabel(asc[0].tarih, true)} bazlı · ${asc.length} dönem` : 'Henüz veri yok')}</div>
                </div>
            </div>
        </div>
    `;

    // --- Missing Months Warning Banner ---
    const visibleMissing = missingMonths.slice(0, 6);
    const missingBannerHtml = missingMonths.length > 0 ? `
        <div class="enf-alert-banner">
            <div class="enf-alert-left">
                <i class="fas fa-triangle-exclamation" style="color: #d97706;"></i>
                <span><strong>${missingMonths.length} eksik dönem</strong> tespit edildi — portföy reel getiri doğruluğu için tamamlayın:</span>
            </div>
            <div class="enf-alert-chips">
                ${visibleMissing.map(ym => `<button type="button" class="enf-missing-chip" onclick="window.openEnflasyonModal(null, '${ym}')" title="${formatEnfPeriodLabel(ym)} verisini ekle"><i class="fas fa-plus"></i> ${formatEnfPeriodLabel(ym, true)}</button>`).join('')}
                ${missingMonths.length > 6 ? `<span style="font-size:12px; font-weight:600; color:#b45309;">+${missingMonths.length - 6} dönem daha</span>` : ''}
            </div>
        </div>
    ` : '';

    // --- Filtered List & Sorting ---
    const filteredAsc = window.enfYearFilter === 'all' ? asc : asc.filter(x => x.year === window.enfYearFilter);
    const listSorted = [...filteredAsc].sort((a, b) => {
        const col = window.enfSort?.col || 'tarih';
        const ascDir = !!window.enfSort?.asc;
        if (col === 'tarih') return ascDir ? a.tarih.localeCompare(b.tarih) : b.tarih.localeCompare(a.tarih);
        const vA = a[col];
        const vB = b[col];
        const aMiss = vA === null || vA === undefined || isNaN(vA);
        const bMiss = vB === null || vB === undefined || isNaN(vB);
        if (aMiss && bMiss) return b.tarih.localeCompare(a.tarih);
        if (aMiss) return 1;
        if (bMiss) return -1;
        const diff = ascDir ? (vA - vB) : (vB - vA);
        return diff !== 0 ? diff : b.tarih.localeCompare(a.tarih);
    });

    const sortCol = window.enfSort?.col || 'tarih';
    const sortAsc = !!window.enfSort?.asc;
    const thCls = (col) => `takip-th-sortable${sortCol === col ? ' takip-th-sorted' : ''}`;
    const thTitle = (col, base) => `${base}${sortCol === col ? (sortAsc ? ' (Artan)' : ' (Azalan)') : ''}`;

    const rateBadgeClass = (r) => {
        if (r < 2) return 'enf-rate-low';
        if (r < 4) return 'enf-rate-mid';
        return 'enf-rate-high';
    };

    const matrixHeatClass = (r) => {
        if (r < 2) return 'enf-heat-1';
        if (r < 3.5) return 'enf-heat-2';
        if (r < 5.5) return 'enf-heat-3';
        return 'enf-heat-4';
    };

    let tableContentHtml = '';
    if (window.enfViewMode === 'matrix') {
        const matrixRowsHtml = yearsDesc.length === 0
            ? `<tr><td colspan="14" style="padding:2.2rem;"><div class="ekstre-empty-state"><i class="fas fa-table-cells"></i><strong>Henüz enflasyon verisi yok</strong></div></td></tr>`
            : yearsDesc.map(y => {
                let yearFactor = 1;
                let filledMonths = 0;
                const cells = [];
                for (let m = 1; m <= 12; m++) {
                    const ym = `${y}-${String(m).padStart(2, '0')}`;
                    const rate = monthRateMap[ym];
                    if (rate !== undefined) {
                        yearFactor *= (1 + rate / 100);
                        filledMonths++;
                        cells.push(`<td class="enf-matrix-cell ${matrixHeatClass(rate)}" onclick="window.openEnflasyonModal(null, '${ym}')" title="${formatEnfPeriodLabel(ym)}: ${fmtPct2(rate)} — Düzenlemek için tıklayın">${new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(rate)}</td>`);
                    } else {
                        cells.push(`<td class="enf-matrix-empty" onclick="window.openEnflasyonModal(null, '${ym}')" title="${formatEnfPeriodLabel(ym)} verisi ekle">+</td>`);
                    }
                }
                const yearTotal = filledMonths > 0 ? (yearFactor - 1) * 100 : null;
                return `
                    <tr>
                        <td style="font-weight: 800 !important; color: #113A5D !important;">${y}</td>
                        ${cells.join('')}
                        <td style="text-align: right !important; font-weight: 800 !important; color: ${yearTotal !== null && yearTotal >= 0 ? 'var(--danger-color)' : 'var(--success-color)'} !important;" title="${filledMonths}/12 ay verisi">${yearTotal !== null ? fmtPct2(yearTotal) : '-'}</td>
                    </tr>
                `;
            }).join('');

        tableContentHtml = `
            <div class="takip-table-scroll">
                <table class="dash-table compact-table enf-table enf-matrix-table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th style="width: 66px;">Yıl</th>
                            ${ENF_MONTHS_SHORT_TR.map(m => `<th>${m}</th>`).join('')}
                            <th style="text-align: right !important; width: 92px;">Yıllık</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${matrixRowsHtml}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        const listRowsHtml = listSorted.length === 0
            ? `<tr><td colspan="7" style="padding:2.2rem;"><div class="ekstre-empty-state"><i class="fas fa-chart-line"></i><strong>Gösterilecek enflasyon verisi bulunamadı</strong><span>Sağ üstteki "Veri Ekle" veya "Toplu Yapıştır" butonlarını kullanabilirsiniz.</span></div></td></tr>`
            : listSorted.map(item => {
                const safeId = window.escapeHtml(item.id);
                const momHtml = item.momDiff !== null
                    ? `<span class="enf-delta-tag" style="color:${item.momDiff <= 0 ? '#059669' : '#dc2626'};" title="Bir önceki aya göre fark">${item.momDiff > 0 ? '+' : ''}${new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.momDiff)}</span>`
                    : '';
                const reel100 = 100 / item.cumFactor;
                return `
                    <tr data-tarih="${item.tarih}">
                        <td style="text-align: left !important;">
                            <span class="enf-period-main">${formatEnfPeriodLabel(item.tarih)}</span>
                            <span class="enf-period-code">${item.tarih}</span>
                        </td>
                        <td style="text-align: right !important;">
                            <span class="enf-rate-pill ${rateBadgeClass(item.oran)}">${fmtPct2(item.oran)}</span>${momHtml}
                        </td>
                        <td style="text-align: right !important; font-weight: 600 !important; color: var(--text-primary) !important;">${fmtPct2(item.ytd)}</td>
                        <td style="text-align: right !important; font-weight: 600 !important; color: ${item.yoy !== null ? 'var(--danger-color)' : 'var(--text-secondary)'} !important;" title="${item.yoy !== null ? 'Ardışık son 12 ay bileşik' : '12 ardışık ay tamamlandığında hesaplanır'}">${item.yoy !== null ? fmtPct2(item.yoy) : '-'}</td>
                        <td style="text-align: right !important; font-weight: 700 !important; color: ${item.cum >= 0 ? 'var(--danger-color)' : 'var(--success-color)'} !important;">${fmtPct2(item.cum)}</td>
                        <td style="text-align: right !important; font-weight: 600 !important;" title="Başlangıçtaki 100 ₺'nin reel değeri: ${fmtTL(reel100, 2)}">${fmtTL(item.index100, 2)}</td>
                        <td style="text-align: center !important;">
                            <div class="ekstre-row-actions">
                                <button type="button" class="ekstre-action-btn edit" onclick="window.openEnflasyonModal('${safeId}')" title="Düzenle">
                                    <i class="fas fa-pen"></i>
                                </button>
                                <button type="button" class="ekstre-action-btn delete" onclick="window.deleteEnflasyon('${safeId}')" title="Sil">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

        // Summary footer for filtered rows
        let footerHtml = '';
        if (filteredAsc.length > 0) {
            const avgMonthly = filteredAsc.reduce((s, x) => s + x.oran, 0) / filteredAsc.length;
            const periodCompound = (filteredAsc.reduce((f, x) => f * (1 + x.oran / 100), 1) - 1) * 100;
            const maxRow = filteredAsc.reduce((m, x) => x.oran > m.oran ? x : m, filteredAsc[0]);
            const minRow = filteredAsc.reduce((m, x) => x.oran < m.oran ? x : m, filteredAsc[0]);
            footerHtml = `
                <tfoot>
                    <tr class="total-row">
                        <td style="text-align: left !important;">ÖZET (${filteredAsc.length} dönem)</td>
                        <td style="text-align: right !important;" title="En Yüksek: ${formatEnfPeriodLabel(maxRow.tarih, true)} (${fmtPct2(maxRow.oran)}) · En Düşük: ${formatEnfPeriodLabel(minRow.tarih, true)} (${fmtPct2(minRow.oran)})">Ort: ${fmtPct2(avgMonthly)}</td>
                        <td colspan="2" style="text-align: right !important;">Dönem Bileşik:</td>
                        <td style="text-align: right !important;" class="text-danger">${fmtPct2(periodCompound)}</td>
                        <td style="text-align: right !important;">${fmtTL(100 * (1 + periodCompound / 100), 2)}</td>
                        <td></td>
                    </tr>
                </tfoot>
            `;
        }

        tableContentHtml = `
            <div class="takip-table-scroll">
                <table class="dash-table compact-table enf-table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th class="${thCls('tarih')}" style="text-align: left !important;" onclick="window.toggleEnfSort('tarih')" title="${thTitle('tarih', 'Döneme Göre Sırala')}">Dönem</th>
                            <th class="${thCls('oran')}" style="text-align: right !important;" onclick="window.toggleEnfSort('oran')" title="${thTitle('oran', 'Aylık Enflasyona Göre Sırala')}">Aylık (%)</th>
                            <th class="${thCls('ytd')}" style="text-align: right !important;" onclick="window.toggleEnfSort('ytd')" title="${thTitle('ytd', 'Yıl İçi Kümülatife Göre Sırala')}">Yıl İçi (YTD)</th>
                            <th class="${thCls('yoy')}" style="text-align: right !important;" onclick="window.toggleEnfSort('yoy')" title="${thTitle('yoy', 'Son 12 Ay Yıllık Enflasyona Göre Sırala')}">Son 12 Ay</th>
                            <th class="${thCls('cum')}" style="text-align: right !important;" onclick="window.toggleEnfSort('cum')" title="${thTitle('cum', 'Genel Kümülatife Göre Sırala')}">Genel Kümülatif</th>
                            <th class="${thCls('index100')}" style="text-align: right !important;" onclick="window.toggleEnfSort('index100')" title="${thTitle('index100', '100 TL Alım Gücü Karşılığı')}">100 ₺ Karşılığı</th>
                            <th style="width: 84px;">İşlem</th>
                        </tr>
                    </thead>
                    <tbody id="enf-data-tbody">
                        ${listRowsHtml}
                    </tbody>
                    ${footerHtml}
                </table>
            </div>
        `;
    }

    const periodOptionsAsc = asc.map(x => `<option value="${x.tarih}">${formatEnfPeriodLabel(x.tarih)}</option>`).join('');
    const calcDefaultStart = asc.length > 0 ? asc[0].tarih : '';
    const calcDefaultEnd = asc.length > 0 ? asc[asc.length - 1].tarih : '';

    container.innerHTML = `
        <div class="page-section active" style="display: flex; flex-direction: column; gap: 0.95rem; padding: 0;">
            ${kpiHtml}
            ${missingBannerHtml}

            <!-- Analytics Row: Trend Chart + Purchasing Power Calculator -->
            <div class="enf-analytics-grid">
                <div class="enf-panel-card">
                    <div class="enf-panel-header">
                        <span class="enf-panel-title">
                            <i class="fas fa-chart-column" style="color: #0284c7;"></i>
                            <span>Enflasyon Trendi${window.enfYearFilter !== 'all' ? ` (${window.enfYearFilter})` : ''}</span>
                        </span>
                        <div class="ekstre-segmented">
                            <button type="button" class="ekstre-seg-btn ${window.enfChartMode !== 'yoy' ? 'active' : ''}" onclick="window.setEnfChartMode('cum')">Aylık & Kümülatif</button>
                            <button type="button" class="ekstre-seg-btn ${window.enfChartMode === 'yoy' ? 'active' : ''}" onclick="window.setEnfChartMode('yoy')">Aylık & Yıllık (12 Ay)</button>
                        </div>
                    </div>
                    <div class="enf-chart-canvas-wrap">
                        ${filteredAsc.length > 0
                            ? `<canvas id="enflasyon-trend-chart"></canvas>`
                            : `<div class="ekstre-empty-state" style="padding: 2rem;"><i class="fas fa-chart-area"></i><span>Grafik için enflasyon verisi ekleyin</span></div>`
                        }
                    </div>
                </div>

                <div class="enf-panel-card">
                    <div class="enf-panel-header">
                        <span class="enf-panel-title">
                            <i class="fas fa-calculator" style="color: #059669;"></i>
                            <span>Alım Gücü Hesaplayıcı</span>
                        </span>
                    </div>
                    <div class="ekstre-field">
                        <label for="enf-calc-amount">Başlangıç Tutarı (₺)</label>
                        <input type="number" id="enf-calc-amount" class="form-control" value="100000" min="0" step="1000">
                    </div>
                    <div class="enf-calc-grid">
                        <div class="ekstre-field">
                            <label for="enf-calc-start">Başlangıç Dönemi</label>
                            <select id="enf-calc-start" class="ekstre-select" style="width: 100%; height: 40px;">
                                ${periodOptionsAsc || '<option value="">Veri yok</option>'}
                            </select>
                        </div>
                        <div class="ekstre-field">
                            <label for="enf-calc-end">Hedef Dönem</label>
                            <select id="enf-calc-end" class="ekstre-select" style="width: 100%; height: 40px;">
                                ${periodOptionsAsc || '<option value="">Veri yok</option>'}
                            </select>
                        </div>
                    </div>
                    <div id="enf-calc-output" class="enf-calc-results"></div>
                </div>
            </div>

            <!-- Main Data Card -->
            <div class="glass ekstre-card-shell">
                <div class="ekstre-toolbar-top">
                    <div class="ekstre-tab-group">
                        <button type="button" class="ekstre-tab-pill ${window.enfViewMode !== 'matrix' ? 'active' : ''}" onclick="window.setEnfViewMode('list')">
                            <i class="fas fa-list-ul"></i>
                            <span>Detaylı Liste</span>
                            <span class="ekstre-tab-count">${asc.length}</span>
                        </button>
                        <button type="button" class="ekstre-tab-pill ${window.enfViewMode === 'matrix' ? 'active' : ''}" onclick="window.setEnfViewMode('matrix')">
                            <i class="fas fa-table-cells"></i>
                            <span>Yıllık Matris</span>
                            <span class="ekstre-tab-count">${yearsDesc.length}</span>
                        </button>
                    </div>

                    <div style="display: flex; align-items: center; gap: 0.55rem; flex-wrap: wrap;">
                        ${window.enfViewMode !== 'matrix' && yearsDesc.length > 0 ? `
                        <select class="ekstre-select" aria-label="Yıl filtresi" onchange="window.setEnfYearFilter(this.value)">
                            <option value="all" ${window.enfYearFilter === 'all' ? 'selected' : ''}>Tüm Yıllar (${asc.length})</option>
                            ${yearsDesc.map(y => `<option value="${y}" ${window.enfYearFilter === y ? 'selected' : ''}>${y} Yılı</option>`).join('')}
                        </select>
                        ` : ''}
                        <button type="button" class="ekstre-ghost-btn" onclick="window.openEnflasyonBulkModal()" title="Çoklu dönem enflasyon verisi yapıştır">
                            <i class="fas fa-file-import"></i>
                            <span>Toplu Yapıştır</span>
                        </button>
                        <button type="button" class="btn ekstre-primary-cta" onclick="window.openEnflasyonModal(null)">
                            <i class="fas fa-plus" style="color: #ffffff !important;"></i>
                            <span>Veri Ekle</span>
                        </button>
                    </div>
                </div>

                ${tableContentHtml}
            </div>
        </div>
    `;

    // --- Wire Live Purchasing Power Calculator ---
    const calcAmt = document.getElementById('enf-calc-amount');
    const calcStart = document.getElementById('enf-calc-start');
    const calcEnd = document.getElementById('enf-calc-end');
    const calcOut = document.getElementById('enf-calc-output');

    if (calcStart && calcDefaultStart) calcStart.value = calcDefaultStart;
    if (calcEnd && calcDefaultEnd) calcEnd.value = calcDefaultEnd;

    const updateEnfCalc = () => {
        if (!calcOut) return;
        const amt = parseFloat(String(calcAmt?.value || '0').replace(',', '.')) || 0;
        const sYm = calcStart?.value || '';
        const eYm = calcEnd?.value || '';

        if (!sYm || !eYm || asc.length === 0) {
            calcOut.innerHTML = '<div class="enf-calc-row"><span>Hesaplama için en az bir dönem verisi gerekir.</span></div>';
            return;
        }
        const fromYm = sYm <= eYm ? sYm : eYm;
        const toYm = sYm <= eYm ? eYm : sYm;
        const rangeItems = asc.filter(x => x.tarih >= fromYm && x.tarih <= toYm);
        const factor = rangeItems.reduce((f, x) => f * (1 + x.oran / 100), 1);
        const compPct = (factor - 1) * 100;
        const requiredAmt = amt * factor;
        const realValue = factor > 0 ? (amt / factor) : amt;
        const erosionPct = factor > 0 ? ((1 / factor) - 1) * 100 : 0;

        calcOut.innerHTML = `
            <div class="enf-calc-row">
                <span>Bileşik Enflasyon (${rangeItems.length} ay)</span>
                <strong style="color: #dc2626;">${fmtPct2(compPct)}</strong>
            </div>
            <div class="enf-calc-divider"></div>
            <div class="enf-calc-row">
                <span>Alım Gücünü Koruyan Tutar</span>
                <strong style="color: #113A5D;">${fmtTL(requiredAmt, 0)}</strong>
            </div>
            <div class="enf-calc-row">
                <span>Sabit Paranın Reel Karşılığı</span>
                <strong style="color: #059669;">${fmtTL(realValue, 0)} <span style="font-size:11.5px; color:#dc2626; font-weight:600;">(${fmtPct2(erosionPct)})</span></strong>
            </div>
        `;
    };

    calcAmt?.addEventListener('input', updateEnfCalc);
    calcStart?.addEventListener('change', updateEnfCalc);
    calcEnd?.addEventListener('change', updateEnfCalc);
    updateEnfCalc();

    // --- Render Chart.js Trend Graph ---
    if (window._enflasyonChartInstance) {
        try { window._enflasyonChartInstance.destroy(); } catch (e) { }
        window._enflasyonChartInstance = null;
    }

    const chartCanvas = document.getElementById('enflasyon-trend-chart');
    if (chartCanvas && filteredAsc.length > 0 && typeof Chart !== 'undefined') {
        const labels = filteredAsc.map(x => formatEnfPeriodLabel(x.tarih, true));
        const monthlyData = filteredAsc.map(x => Number(x.oran.toFixed(2)));

        const useYoy = window.enfChartMode === 'yoy';
        const hasAnyYoy = filteredAsc.some(x => x.yoy !== null);
        const lineData = useYoy
            ? filteredAsc.map(x => hasAnyYoy ? (x.yoy !== null ? Number(x.yoy.toFixed(2)) : null) : Number(x.ytd.toFixed(2)))
            : filteredAsc.map(x => Number(x.cum.toFixed(2)));
        const lineLabel = useYoy ? (hasAnyYoy ? 'Son 12 Ay (%)' : 'Yıl İçi YTD (%)') : 'Kümülatif (%)';

        window._enflasyonChartInstance = new Chart(chartCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        type: 'bar',
                        label: 'Aylık Enflasyon (%)',
                        data: monthlyData,
                        backgroundColor: 'rgba(2, 132, 199, 0.72)',
                        hoverBackgroundColor: 'rgba(3, 105, 161, 0.92)',
                        borderRadius: 6,
                        maxBarThickness: 36,
                        yAxisID: 'y'
                    },
                    {
                        type: 'line',
                        label: lineLabel,
                        data: lineData,
                        borderColor: '#dc2626',
                        backgroundColor: 'rgba(220, 38, 38, 0.08)',
                        borderWidth: 2.5,
                        pointRadius: 3.5,
                        pointBackgroundColor: '#dc2626',
                        tension: 0.25,
                        spanGaps: true,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    datalabels: { display: false },
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: { boxWidth: 12, usePointStyle: true, font: { size: 12, weight: '600' } }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                if (ctx.parsed.y === null || ctx.parsed.y === undefined) return `${ctx.dataset.label}: -`;
                                return `${ctx.dataset.label}: %${new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(ctx.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 11.5 } }
                    },
                    y: {
                        position: 'left',
                        beginAtZero: true,
                        title: { display: true, text: 'Aylık (%)', font: { size: 11 } },
                        ticks: { callback: (v) => '%' + v, font: { size: 11 } },
                        grid: { color: 'rgba(148, 163, 184, 0.16)' }
                    },
                    y1: {
                        position: 'right',
                        beginAtZero: true,
                        title: { display: true, text: lineLabel, font: { size: 11 } },
                        ticks: { callback: (v) => '%' + v, font: { size: 11 } },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    }
};

window.toggleInlineAnaliz = () => {
    const row = document.getElementById('inline-analiz-row');
    if (!row && typeof window.openAkisModal === 'function') {
        window.openAkisModal({ hisse: window.currentSelectedHisse });
        return;
    }
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

// --- 100% FIREBASE PDF RAPOR YÖNETİMİ (FIRESTORE CHUNKED STORAGE) ---
window._pdfBlobCache = window._pdfBlobCache || {};

window.uploadPdfToFirebase = async (file, hisse, meta = {}) => {
    if (!currentUser) {
        throw new Error('Dosya yüklemek için giriş yapmalısınız.');
    }
    const cleanHisse = String(hisse || '').trim().toUpperCase();
    if (!/^[A-Z0-9]{2,12}$/.test(cleanHisse)) {
        throw new Error('Geçersiz hisse kodu.');
    }
    if (!file || !/\.pdf$/i.test(file.name)) {
        throw new Error('Lütfen yalnızca PDF dosyası seçin.');
    }
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('Dosya boyutu 10 MB sınırını aşıyor.');
    }

    const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const res = String(reader.result || '');
            resolve(res.includes(',') ? res.split(',')[1] : res);
        };
        reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    });

    if (!base64Data.startsWith('JVBERi0')) {
        throw new Error('Seçilen dosya geçerli bir PDF değil.');
    }

    const CHUNK_SIZE = 500000; // ~500 KB per Firestore doc (safely below 1 MiB limit)
    const chunks = [];
    for (let i = 0; i < base64Data.length; i += CHUNK_SIZE) {
        chunks.push(base64Data.slice(i, i + CHUNK_SIZE));
    }

    const reportId = 'pdf_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const reportRef = db.collection('app_data').doc(currentUser.uid).collection('pdf_reports').doc(reportId);

    // Upload chunks in batches (max 10 concurrent writes)
    for (let i = 0; i < chunks.length; i += 10) {
        const batch = db.batch();
        const slice = chunks.slice(i, i + 10);
        slice.forEach((chunkStr, offset) => {
            const idx = i + offset;
            batch.set(reportRef.collection('chunks').doc(String(idx)), { idx, data: chunkStr });
        });
        await batch.commit();
    }

    const record = {
        id: reportId,
        hisse: cleanHisse,
        name: (meta.name || '').trim() || file.name.replace(/\.pdf$/i, ''),
        tarih: (meta.tarih || '').trim() || new Date().toISOString().split('T')[0],
        company: (meta.company || '').trim() || '-',
        notText: (meta.notText || '').trim() || '',
        fileName: file.name,
        size: file.size,
        chunkCount: chunks.length,
        createdAt: Date.now()
    };

    await reportRef.set(record);

    if (!State.data.uploadedReports) State.data.uploadedReports = [];
    State.data.uploadedReports.push(record);
    State.save();

    return record;
};

window.openFirebasePdf = async (reportId) => {
    if (!currentUser) {
        window.showToast('PDF görüntülemek için giriş yapmalısınız.', 'warning');
        return;
    }
    if (window._pdfBlobCache[reportId]) {
        window.open(window._pdfBlobCache[reportId], '_blank');
        return;
    }

    // Open blank window synchronously inside click gesture to avoid popup blockers
    const previewWin = window.open('', '_blank');
    if (previewWin) {
        previewWin.document.write('<div style="font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;color:#113A5D;font-size:15px;">PDF Firebase\'den yükleniyor...</div>');
        previewWin.document.close();
    }

    try {
        const chunksSnap = await db
            .collection('app_data')
            .doc(currentUser.uid)
            .collection('pdf_reports')
            .doc(reportId)
            .collection('chunks')
            .orderBy('idx', 'asc')
            .get();

        if (chunksSnap.empty) {
            if (previewWin) previewWin.close();
            window.showToast('PDF dosyası bulunamadı.', 'error');
            return;
        }

        let fullBase64 = '';
        chunksSnap.forEach(doc => { fullBase64 += (doc.data().data || ''); });

        const binaryStr = atob(fullBase64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        window._pdfBlobCache[reportId] = blobUrl;

        if (previewWin && !previewWin.closed) {
            previewWin.location.href = blobUrl;
        } else {
            window.open(blobUrl, '_blank');
        }
    } catch (err) {
        console.error('Firebase PDF açma hatası:', err);
        if (previewWin && !previewWin.closed) previewWin.close();
        window.showToast('PDF açılamadı: ' + (err.message || 'Bağlantı hatası'), 'error');
    }
};

window.deleteFirebasePdf = async (reportId) => {
    if (!(await window.showConfirm('Bu PDF raporunu kalıcı olarak silmek istediğinize emin misiniz?'))) return;
    try {
        if (currentUser) {
            const reportRef = db.collection('app_data').doc(currentUser.uid).collection('pdf_reports').doc(reportId);
            const chunksSnap = await reportRef.collection('chunks').get();
            const batch = db.batch();
            chunksSnap.forEach(doc => batch.delete(doc.ref));
            batch.delete(reportRef);
            await batch.commit();
        }
        if (window._pdfBlobCache[reportId]) {
            URL.revokeObjectURL(window._pdfBlobCache[reportId]);
            delete window._pdfBlobCache[reportId];
        }
        State.data.uploadedReports = (State.data.uploadedReports || []).filter(r => r.id !== reportId);
        State.save();
        if (typeof renderPage === 'function') renderPage();
        window.showToast('PDF raporu silindi.', 'info');
    } catch (err) {
        console.error('Firebase PDF silme hatası:', err);
        window.showToast('PDF silinirken hata oluştu: ' + (err.message || ''), 'error');
    }
};

// --- 100% BROWSER & FIREBASE CLOUD BİLANÇO UPLOAD / SYNC ---
const CLOUD_FINANCIALS_CACHE_KEY = 'yunvest_cloud_financials_v1';
window._cloudFinancialsMeta = window._cloudFinancialsMeta || {};
window._compiledStockDataBackup = window._compiledStockDataBackup || null;

window.ensureXlsxLoaded = () => {
    if (window.XLSX && typeof window.XLSX.read === 'function') {
        return Promise.resolve(window.XLSX);
    }
    if (window._xlsxLoadPromise) return window._xlsxLoadPromise;
    window._xlsxLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'js/xlsx.core.min.js';
        script.async = true;
        script.onload = () => {
            if (window.XLSX && typeof window.XLSX.read === 'function') resolve(window.XLSX);
            else reject(new Error('Tablo ayrıştırıcı yüklenemedi.'));
        };
        script.onerror = () => {
            window._xlsxLoadPromise = null;
            reject(new Error('Tablo ayrıştırıcı dosyasına erişilemedi (js/xlsx.core.min.js).'));
        };
        document.head.appendChild(script);
    });
    return window._xlsxLoadPromise;
};

window.parseBilancoWorkbook = (workbook, XLSXLib) => {
    const xlsxUtil = (XLSXLib || window.XLSX).utils;
    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('Dosyada okunabilir çalışma sayfası bulunamadı.');
    }

    const parseSheet = (sheetNamesToTry, isIncomeStatement = false) => {
        let sName = null;
        for (const name of sheetNamesToTry) {
            const found = workbook.SheetNames.find(sn => sn.toLowerCase().includes(name.toLowerCase()));
            if (found) { sName = found; break; }
        }
        if (!sName) return null;

        const sheet = workbook.Sheets[sName];
        const data = xlsxUtil.sheet_to_json(sheet, { header: 1 });
        if (!data || data.length === 0) return null;

        const formatNum = (val) => {
            if (val === undefined || val === null || val === '') return '-';
            if (typeof val === 'number') return new Intl.NumberFormat('tr-TR').format(val);
            return val;
        };

        const numPeriods = Math.max(0, (data[0] ? data[0].length : 1) - 1);
        const rawHeaders = [];
        for (let i = 0; i <= numPeriods; i++) rawHeaders.push(data[0][i] || '');

        let maxYear = 0;
        for (let i = 1; i <= numPeriods; i++) {
            const h = String(rawHeaders[i] || '');
            const parts = h.split('/');
            if (parts.length > 0) {
                const year = parseInt(parts[0], 10);
                if (!isNaN(year) && year > maxYear) maxYear = year;
            }
        }

        const cutoffYear = maxYear > 0 ? maxYear - 5 : 0;
        const keepIndices = [0];
        for (let i = 1; i <= numPeriods; i++) {
            const h = String(rawHeaders[i] || '');
            const parts = h.split('/');
            const year = parseInt(parts[0], 10);
            if (isNaN(year) || year >= cutoffYear) keepIndices.push(i);
        }

        const result = { headers: keepIndices.map(idx => rawHeaders[idx]), rows: [] };
        for (let i = 1; i < data.length; i++) {
            if (!data[i] || !data[i][0]) continue;
            const row = [String(data[i][0])];
            for (let j = 1; j < keepIndices.length; j++) {
                const cIdx = keepIndices[j];
                let val = data[i][cIdx];
                if (val === undefined || val === null || val === '') val = '-';
                else if (typeof val === 'number') val = formatNum(val);
                row.push(val);
            }
            result.rows.push(row);
        }

        if (!isIncomeStatement) {
            const getValueFlex = (rIndex, cIndex) => {
                if (rIndex === -1 || !data[rIndex]) return 0;
                const v = data[rIndex][cIndex];
                if (typeof v === 'number') return v;
                if (typeof v === 'string') {
                    const parsed = parseFloat(v.replace(/\./g, '').replace(/,/g, '.'));
                    return isNaN(parsed) ? 0 : parsed;
                }
                return 0;
            };
            const findRowIndex = (searchName) => {
                const cleanSearch = searchName.toLowerCase().replace(/[ıiİI\s]/g, '');
                for (let i = 0; i < data.length; i++) {
                    if (!data[i] || !data[i][0]) continue;
                    const cleanRow = String(data[i][0]).toLowerCase().replace(/[ıiİI\s]/g, '');
                    if (cleanRow.includes(cleanSearch)) return i;
                }
                return -1;
            };
            const idxKisa = findRowIndex('Kısa Vadeli Borçlanmalar');
            const idxKisa2 = findRowIndex('Uzun Vadeli Borçlanmaların Kısa Vadeli Kısımları');
            const idxUzun = findRowIndex('Uzun Vadeli Borçlanmalar');
            const idxNakit = findRowIndex('Nakit ve Nakit Benzerleri');
            const idxFinYat = findRowIndex('Finansal Yatırımlar');

            const rowFinBorc = ['Sistem_Fin_Borc_Eklemesi'];
            const rowNetBorc = ['Sistem_Net_Borc_Eklemesi'];
            for (let j = 1; j < keepIndices.length; j++) {
                const i = keepIndices[j];
                const finBorc = getValueFlex(idxKisa, i) + getValueFlex(idxKisa2, i) + getValueFlex(idxUzun, i);
                const netBorc = finBorc - getValueFlex(idxNakit, i) - getValueFlex(idxFinYat, i);
                rowFinBorc.push(formatNum(finBorc));
                rowNetBorc.push(formatNum(netBorc));
            }
            result.rows.push(rowFinBorc, rowNetBorc);
        }

        const cleanStr = (s) => String(s).toLocaleLowerCase('tr-TR').replace(/\s+/g, '');
        const idxBrutKar = result.rows.findIndex(r => r[0] && cleanStr(r[0]) === 'brütkar(zarar)');
        const idxGenelYon = result.rows.findIndex(r => r[0] && cleanStr(r[0]).includes('genelyönetim'));
        const idxPazarlama = result.rows.findIndex(r => r[0] && cleanStr(r[0]).includes('pazarlama'));
        const idxArge = result.rows.findIndex(r => r[0] && cleanStr(r[0]).includes('araştırma'));
        const idxAmort1 = result.rows.findIndex(r => r[0] && cleanStr(r[0]).includes('amortismangiderleri'));
        const idxAmort2 = result.rows.findIndex(r => r[0] && cleanStr(r[0]).includes('amortisman'));
        const hasFavok = result.rows.some(r => r[0] && cleanStr(r[0]) === 'favök');

        if (!hasFavok && idxBrutKar !== -1) {
            const parseVal = (str) => {
                if (!str || str === '-') return 0;
                if (typeof str === 'number') return str;
                return parseFloat(String(str).replace(/\./g, '').replace(/,/g, '.')) || 0;
            };
            const rowFavok = ['FAVÖK'];
            const rowEsasFaal = ['Esas Faaliyet Karı'];
            for (let i = 1; i < result.headers.length; i++) {
                const bk = parseVal(result.rows[idxBrutKar][i]);
                const gy = idxGenelYon !== -1 ? parseVal(result.rows[idxGenelYon][i]) : 0;
                const pz = idxPazarlama !== -1 ? parseVal(result.rows[idxPazarlama][i]) : 0;
                const ar = idxArge !== -1 ? parseVal(result.rows[idxArge][i]) : 0;
                const esasK = bk + gy + pz + ar;
                const am = idxAmort1 !== -1 ? Math.abs(parseVal(result.rows[idxAmort1][i])) : (idxAmort2 !== -1 ? Math.abs(parseVal(result.rows[idxAmort2][i])) : 0);
                rowFavok.push(formatNum(esasK + am));
                rowEsasFaal.push(formatNum(esasK));
            }
            result.rows.push(rowFavok, rowEsasFaal);
        }

        return result;
    };

    const parsedBilanco = parseSheet(['Bilanço', 'Bilanço (TL)', workbook.SheetNames[0]], false);
    const parsedGelirYillik = parseSheet(['Gelir Tablosu (Yıllıklan', 'Gelir Tablosu (Yıllık)', 'Yıllıklan', 'Yıllık'], true);
    const parsedGelirDonemsel = parseSheet(['Gelir Tablosu (Dönemsel)', 'Gelir Tablosu (Yıllık)', 'Gelir Tablosu'], true);
    const parsedGelirCeyrek = parseSheet(['Gelir Tablosu (Çeyreklik)'], true);
    const parsedNakitDonemsel = parseSheet(['Nakit Akış (Dönemsel)', 'Nakit Akım (Dönemsel)', 'Nakit Akış Tablosu', 'Nakit Akım Tablosu', 'Nakit Akış', 'Nakit Akım'], true);
    const parsedNakitCeyrek = parseSheet(['Nakit Akış (Çeyreklik)', 'Nakit Akım (Çeyreklik)'], true);
    const parsedNakitYillik = parseSheet(['Nakit Akış (Yıllıklan', 'Nakit Akım (Yıllıklan'], true);

    if (!parsedBilanco || !parsedBilanco.rows || parsedBilanco.rows.length < 3) {
        throw new Error('Geçerli bir bilanço sayfası algılanamadı.');
    }

    const parsed = {
        bilanco: parsedBilanco,
        gelirDonemsel: parsedGelirDonemsel || parsedBilanco,
        gelirYillik: parsedGelirYillik || parsedGelirDonemsel || parsedBilanco,
        gelirCeyrek: parsedGelirCeyrek || parsedBilanco,
        nakitAkim: parsedNakitYillik || parsedNakitDonemsel || parsedNakitCeyrek || null
    };
    if (parsedNakitDonemsel) parsed.nakitDonemsel = parsedNakitDonemsel;
    if (parsedNakitCeyrek) parsed.nakitCeyrek = parsedNakitCeyrek;
    if (parsedNakitYillik) parsed.nakitYillik = parsedNakitYillik;

    const sheetsFound = ['Bilanço'];
    if (parsedGelirDonemsel || parsedGelirYillik || parsedGelirCeyrek) sheetsFound.push('Gelir Tablosu');
    if (parsedNakitYillik || parsedNakitDonemsel || parsedNakitCeyrek) sheetsFound.push('Nakit Akışı');

    return {
        parsed,
        meta: {
            latestPeriod: String(parsedBilanco.headers[1] || '-'),
            periodsCount: Math.max(0, parsedBilanco.headers.length - 1),
            sheetCount: workbook.SheetNames.length,
            sheetsFound
        }
    };
};

window.hydrateLocalCloudFinancials = () => {
    try {
        if (!window.stockData) window.stockData = {};
        if (!window._compiledStockDataBackup) {
            window._compiledStockDataBackup = {};
            Object.keys(window.stockData).forEach(k => { window._compiledStockDataBackup[k] = window.stockData[k]; });
        }
        const raw = localStorage.getItem(CLOUD_FINANCIALS_CACHE_KEY);
        if (!raw) return;
        const cached = JSON.parse(raw);
        if (!cached || typeof cached !== 'object') return;
        Object.entries(cached).forEach(([sym, entry]) => {
            if (entry && entry.data && entry.data.bilanco) {
                window.stockData[sym] = entry.data;
                window._cloudFinancialsMeta[sym] = {
                    updatedAt: entry.updatedAt || 0,
                    latestPeriod: entry.latestPeriod || '',
                    fileName: entry.fileName || ''
                };
            }
        });
    } catch (e) {
        console.warn('Cloud financials cache read warning:', e);
    }
};

window.initCloudFinancialsSync = () => {
    window.hydrateLocalCloudFinancials();
    if (window._unsubscribeCloudFinancials) {
        try { window._unsubscribeCloudFinancials(); } catch (e) { }
        window._unsubscribeCloudFinancials = null;
    }
    if (!currentUser || typeof db === 'undefined') return;

    window._unsubscribeCloudFinancials = db
        .collection('app_data')
        .doc(currentUser.uid)
        .collection('stock_financials')
        .onSnapshot((snap) => {
            if (!window.stockData) window.stockData = {};
            const cacheObj = {};
            const freshMeta = {};
            snap.forEach((doc) => {
                try {
                    const d = doc.data();
                    if (!d || !d.payloadJson) return;
                    const sym = String(d.hisse || doc.id || '').trim().toUpperCase();
                    if (!sym) return;
                    const parsed = JSON.parse(d.payloadJson);
                    if (parsed && parsed.bilanco) {
                        window.stockData[sym] = parsed;
                        const meta = {
                            updatedAt: d.updatedAt || 0,
                            latestPeriod: d.latestPeriod || (parsed.bilanco.headers && parsed.bilanco.headers[1]) || '',
                            fileName: d.fileName || ''
                        };
                        freshMeta[sym] = meta;
                        cacheObj[sym] = { ...meta, data: parsed };
                    }
                } catch (e) {
                    console.warn('Cloud financial doc parse warning:', doc.id, e);
                }
            });

            // Restore compiled baseline for any stock removed from cloud
            Object.keys(window._cloudFinancialsMeta || {}).forEach((oldSym) => {
                if (!freshMeta[oldSym]) {
                    if (window._compiledStockDataBackup && window._compiledStockDataBackup[oldSym]) {
                        window.stockData[oldSym] = window._compiledStockDataBackup[oldSym];
                    } else {
                        delete window.stockData[oldSym];
                    }
                }
            });

            window._cloudFinancialsMeta = freshMeta;
            try { localStorage.setItem(CLOUD_FINANCIALS_CACHE_KEY, JSON.stringify(cacheObj)); } catch (e) { }
            if (typeof window.recalculateHedefFiyatlar === 'function') window.recalculateHedefFiyatlar();
            if (typeof renderPage === 'function') renderPage();
        }, (err) => {
            console.warn('Cloud financials snapshot error:', err);
        });
};

window.saveCloudFinancials = async (hisse, parsed, meta = {}) => {
    const sym = String(hisse || '').trim().toUpperCase();
    if (!/^[A-Z0-9]{2,12}$/.test(sym)) throw new Error('Geçersiz hisse kodu.');
    if (!parsed || !parsed.bilanco) throw new Error('Geçersiz bilanço verisi.');

    const payloadJson = JSON.stringify(parsed);
    if (payloadJson.length > 950000) {
        throw new Error('Dosya verisi bulut sınırını (950 KB) aşıyor.');
    }

    const updatedAt = Date.now();
    const latestPeriod = meta.latestPeriod || (parsed.bilanco.headers && parsed.bilanco.headers[1]) || '';
    const fileName = meta.fileName || 'bilanco.xlsx';

    if (!window.stockData) window.stockData = {};
    if (!window._compiledStockDataBackup) {
        window._compiledStockDataBackup = {};
        Object.keys(window.stockData).forEach(k => { window._compiledStockDataBackup[k] = window.stockData[k]; });
    }

    window.stockData[sym] = parsed;
    window._cloudFinancialsMeta[sym] = { updatedAt, latestPeriod, fileName };

    try {
        const prevCache = JSON.parse(localStorage.getItem(CLOUD_FINANCIALS_CACHE_KEY) || '{}') || {};
        prevCache[sym] = { updatedAt, latestPeriod, fileName, data: parsed };
        localStorage.setItem(CLOUD_FINANCIALS_CACHE_KEY, JSON.stringify(prevCache));
    } catch (e) { }

    if (currentUser && typeof db !== 'undefined') {
        await db.collection('app_data').doc(currentUser.uid).collection('stock_financials').doc(sym).set({
            hisse: sym,
            latestPeriod,
            fileName,
            updatedAt,
            payloadJson
        });
    }

    if (typeof window.recalculateHedefFiyatlar === 'function') window.recalculateHedefFiyatlar();
    return { sym, latestPeriod, updatedAt };
};

window.deleteCloudFinancials = async (hisse) => {
    const sym = String(hisse || '').trim().toUpperCase();
    if (!sym) return;
    if (!(await window.showConfirm(`${sym} için buluta yüklenen güncel bilanço verisini kaldırmak istediğinize emin misiniz?`, 'Evet, Kaldır'))) return;

    try {
        if (currentUser && typeof db !== 'undefined') {
            await db.collection('app_data').doc(currentUser.uid).collection('stock_financials').doc(sym).delete();
        }
        delete window._cloudFinancialsMeta[sym];
        if (window._compiledStockDataBackup && window._compiledStockDataBackup[sym]) {
            window.stockData[sym] = window._compiledStockDataBackup[sym];
        } else if (window.stockData) {
            delete window.stockData[sym];
        }
        try {
            const prevCache = JSON.parse(localStorage.getItem(CLOUD_FINANCIALS_CACHE_KEY) || '{}') || {};
            delete prevCache[sym];
            localStorage.setItem(CLOUD_FINANCIALS_CACHE_KEY, JSON.stringify(prevCache));
        } catch (e) { }
        if (typeof window.recalculateHedefFiyatlar === 'function') window.recalculateHedefFiyatlar();
        window.showToast(`${sym} bulut bilanço kaydı kaldırıldı.`, 'info');
        if (typeof renderPage === 'function') renderPage();
    } catch (err) {
        window.showToast('Bulut bilançosu kaldırılamadı: ' + (err.message || ''), 'error');
    }
};

window.openBilancoUploadModal = (prefillHisse = '') => {
    const existingOverlay = document.getElementById('bilanco-upload-modal-overlay');
    if (existingOverlay) existingOverlay.remove();

    const initSym = String(prefillHisse || window.currentSelectedHisse || '').trim().toUpperCase();
    const overlay = document.createElement('div');
    overlay.id = 'bilanco-upload-modal-overlay';
    overlay.className = 'ekstre-modal-overlay';
    overlay.addEventListener('click', (ev) => { if (ev.target === overlay) overlay.remove(); });

    overlay.innerHTML = `
        <div class="ekstre-modal-card" role="dialog" aria-modal="true" style="width: min(520px, 100%);">
            <div class="ekstre-modal-header">
                <h3>
                    <i class="fas fa-cloud-arrow-up" style="color: #0284c7;"></i>
                    <span>Bilanço & Mali Tablo Yükle</span>
                </h3>
                <button type="button" class="ekstre-modal-close" aria-label="Kapat" onclick="document.getElementById('bilanco-upload-modal-overlay')?.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="bilanco-upload-form" class="ekstre-modal-body">
                <div class="ekstre-field">
                    <label for="bum-hisse">Hisse Kodu</label>
                    <input type="text" id="bum-hisse" class="form-control" list="bist-hisse-list" style="text-transform:uppercase; font-weight:700;" placeholder="Örn: AKSA, THYAO" value="${window.escapeHtml(initSym)}" autocomplete="off" required>
                </div>

                <div class="ekstre-field">
                    <label>Mali Tablo Dosyası (.xlsx / .xls)</label>
                    <div id="bum-dropzone" class="akis-dropzone">
                        <i class="fas fa-cloud-arrow-up" style="font-size:26px; color:#0284c7;"></i>
                        <strong id="bum-drop-title">Fintables dosyasını buraya sürükleyin veya seçin</strong>
                        <span id="bum-drop-sub" style="font-size:12px; opacity:0.82;">Bilanço, Gelir Tablosu ve Nakit Akışı sayfaları otomatik okunur</span>
                    </div>
                    <input type="file" id="bum-file-input" accept=".xlsx,.xls" style="display:none;">
                </div>

                <div id="bum-preview" class="takip-target-status-bar">
                    <span><i class="fas fa-info-circle" style="margin-right:6px;"></i>Yüklenen veriler buluta kaydedilir; Özet Rapor, Değerleme ve Takip Listesi anında güncellenir.</span>
                </div>

                <div class="ekstre-modal-footer" style="margin: 0.25rem -1.35rem -1.25rem -1.35rem;">
                    <button type="button" class="ekstre-ghost-btn" onclick="document.getElementById('bilanco-upload-modal-overlay')?.remove()">İptal</button>
                    <button type="submit" id="bum-submit-btn" class="btn" style="padding: 9px 22px;" disabled>
                        <i class="fas fa-check" style="margin-right: 6px; color: #ffffff !important;"></i>Kaydet ve Güncelle
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    const inpHisse = document.getElementById('bum-hisse');
    const dropzone = document.getElementById('bum-dropzone');
    const fileInput = document.getElementById('bum-file-input');
    const dropTitle = document.getElementById('bum-drop-title');
    const dropSub = document.getElementById('bum-drop-sub');
    const previewBox = document.getElementById('bum-preview');
    const submitBtn = document.getElementById('bum-submit-btn');

    let parsedResult = null;
    let pickedFileName = '';

    // Start lazy-loading SheetJS immediately when modal opens so parsing feels instantaneous
    window.ensureXlsxLoaded().catch(() => { });

    const tryDetectTickerFromFilename = (fname) => {
        const base = String(fname || '').replace(/\.[^.]+$/, '').toUpperCase();
        const tokens = base.split(/[^A-Z0-9]+/).filter(Boolean);
        const validSet = new Set((State.bistStocks && State.bistStocks.length > 0) ? State.bistStocks : (window.defaultStocksArray || []));
        for (const t of tokens) {
            if (validSet.has(t)) return t;
        }
        return '';
    };

    const handleFilePicked = async (file) => {
        if (!file) return;
        pickedFileName = file.name;
        parsedResult = null;
        submitBtn.disabled = true;

        dropzone.classList.remove('has-file');
        dropTitle.textContent = file.name;
        dropSub.textContent = 'Dosya ayrıştırılıyor...';
        previewBox.className = 'takip-target-status-bar above-zone';
        previewBox.innerHTML = '<span><i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i>Finansal tablolar okunuyor...</span>';

        if (!inpHisse.value.trim()) {
            const detected = tryDetectTickerFromFilename(file.name);
            if (detected) inpHisse.value = detected;
        }

        try {
            const XLSXLib = await window.ensureXlsxLoaded();
            const arrBuf = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(new Uint8Array(reader.result));
                reader.onerror = () => reject(new Error('Dosya okunamadı.'));
                reader.readAsArrayBuffer(file);
            });
            const wb = XLSXLib.read(arrBuf, { type: 'array' });
            const { parsed, meta } = window.parseBilancoWorkbook(wb, XLSXLib);
            parsedResult = { parsed, meta };

            const sizeKb = Math.max(1, Math.round(JSON.stringify(parsed).length / 1024));
            dropzone.classList.add('has-file');
            dropSub.textContent = `${meta.sheetCount} çalışma sayfası okundu · ~${sizeKb} KB`;
            previewBox.className = 'takip-target-status-bar in-zone';
            previewBox.innerHTML = `<span><i class="fas fa-check-circle" style="margin-right:6px;"></i><strong>${meta.sheetsFound.join(' · ')}</strong> hazır (${meta.periodsCount} dönem)</span><strong>Son: ${window.escapeHtml(meta.latestPeriod)}</strong>`;
            submitBtn.disabled = false;
        } catch (err) {
            dropSub.textContent = 'Dosya ayrıştırılamadı';
            previewBox.className = 'takip-target-status-bar';
            previewBox.innerHTML = `<span style="color:#dc2626;"><i class="fas fa-exclamation-triangle" style="margin-right:6px;"></i>${window.escapeHtml(err.message || 'Dosya okunamadı.')}</span>`;
        }
    };

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) handleFilePicked(f);
    });
    fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) handleFilePicked(fileInput.files[0]);
    });

    const onKeyDown = (ke) => {
        if (ke.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onKeyDown); }
    };
    document.addEventListener('keydown', onKeyDown);

    document.getElementById('bilanco-upload-form').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const sym = (inpHisse.value || '').trim().toUpperCase();
        if (!sym || !parsedResult) {
            window.showToast('Lütfen geçerli bir hisse kodu ve mali tablo dosyası seçin.', 'warning');
            return;
        }
        submitBtn.disabled = true;
        previewBox.className = 'takip-target-status-bar above-zone';
        previewBox.innerHTML = '<span><i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i>Buluta kaydediliyor ve değerlemeler güncelleniyor...</span>';
        try {
            await window.saveCloudFinancials(sym, parsedResult.parsed, {
                latestPeriod: parsedResult.meta.latestPeriod,
                fileName: pickedFileName
            });
            document.removeEventListener('keydown', onKeyDown);
            overlay.remove();
            window.showToast(`${sym} mali tabloları (${parsedResult.meta.latestPeriod}) güncellendi!`, 'success');
            if (typeof renderPage === 'function') renderPage();
        } catch (err) {
            submitBtn.disabled = false;
            previewBox.className = 'takip-target-status-bar';
            previewBox.innerHTML = `<span style="color:#dc2626;"><i class="fas fa-exclamation-triangle" style="margin-right:6px;"></i>${window.escapeHtml(err.message || 'Kayıt başarısız.')}</span>`;
            window.showToast(err.message || 'Bilanço kaydedilemedi.', 'error');
        }
    });
};

window.updateFirebasePdfMeta = async (reportId, updates) => {
    const list = State.data.uploadedReports || [];
    const idx = list.findIndex(r => String(r.id) === String(reportId));
    if (idx === -1) return false;
    const updated = {
        ...list[idx],
        name: (updates.name || '').trim() || list[idx].name,
        tarih: (updates.tarih || '').trim() || list[idx].tarih,
        company: (updates.company || '').trim() || '-',
        notText: (updates.notText || '').trim()
    };
    list[idx] = updated;
    State.save();
    try {
        if (currentUser && typeof db !== 'undefined') {
            await db.collection('app_data').doc(currentUser.uid).collection('pdf_reports').doc(reportId).set(updated, { merge: true });
        }
    } catch (e) {
        console.warn('Firestore PDF metadata update warning:', e);
    }
    return true;
};

window.openAkisModal = (opts = {}) => {
    const existingOverlay = document.getElementById('akis-modal-overlay');
    if (existingOverlay) existingOverlay.remove();

    const hisse = String(opts.hisse || window.currentSelectedHisse || '').trim().toUpperCase();
    const editType = opts.editType || null; // 'analiz' | 'firebase_pdf' | null
    const editId = opts.editId || null;
    const todayStr = new Date().toISOString().split('T')[0];

    let existingItem = null;
    if (editType === 'analiz' && editId) {
        existingItem = (State.data.analizler || []).find(a => String(a.id) === String(editId)) || null;
    } else if (editType === 'firebase_pdf' && editId) {
        existingItem = (State.data.uploadedReports || []).find(r => String(r.id) === String(editId)) || null;
    }

    let modalMode = opts.mode || 'analiz'; // 'analiz' | 'pdf' | 'kisisel'
    if (existingItem) {
        if (editType === 'firebase_pdf') modalMode = 'pdf';
        else modalMode = existingItem.isKisiselNot ? 'kisisel' : 'analiz';
    }

    const initTarih = existingItem ? (existingItem.tarih || todayStr) : todayStr;
    const initBaslik = existingItem
        ? (editType === 'firebase_pdf' ? (existingItem.name || '') : (existingItem.baslik && existingItem.baslik !== '-' ? existingItem.baslik : ''))
        : '';
    const initAuthor = existingItem
        ? (editType === 'firebase_pdf' ? (existingItem.company && existingItem.company !== '-' ? existingItem.company : '') : (existingItem.borsaci && existingItem.borsaci !== '-' ? existingItem.borsaci : ''))
        : '';
    const initLink = (existingItem && editType === 'analiz') ? (existingItem.baglanti || '') : '';
    const initNote = existingItem ? (existingItem.notText || '') : '';

    // Refresh author suggestions datalist
    const allAuthors = new Set();
    (State.data.analizler || []).forEach(a => { if (a.borsaci && a.borsaci !== '-' && !a.isKisiselNot) allAuthors.add(a.borsaci.trim()); });
    (State.data.uploadedReports || []).forEach(r => { if (r.company && r.company !== '-') allAuthors.add(r.company.trim()); });
    let authorDl = document.getElementById('analiz-borsaci-list');
    if (!authorDl) {
        authorDl = document.createElement('datalist');
        authorDl.id = 'analiz-borsaci-list';
        document.body.appendChild(authorDl);
    }
    authorDl.innerHTML = [...allAuthors].sort((a, b) => a.localeCompare(b, 'tr')).map(a => `<option value="${window.escapeHtml(a)}">`).join('');

    const overlay = document.createElement('div');
    overlay.id = 'akis-modal-overlay';
    overlay.className = 'ekstre-modal-overlay';
    overlay.addEventListener('click', (ev) => { if (ev.target === overlay) overlay.remove(); });

    const isEditing = !!existingItem;
    const modalHeading = isEditing
        ? (editType === 'firebase_pdf' ? `${hisse} · PDF Raporunu Düzenle` : `${hisse} · Akış Kaydını Düzenle`)
        : `${hisse} · Yeni Akış Kaydı`;

    overlay.innerHTML = `
        <div class="ekstre-modal-card" role="dialog" aria-modal="true" style="width: min(560px, 100%);">
            <div class="ekstre-modal-header">
                <h3>
                    <i class="fas ${isEditing ? 'fa-pen-to-square' : 'fa-stream'}" style="color: #0284c7;"></i>
                    <span>${window.escapeHtml(modalHeading)}</span>
                </h3>
                <button type="button" class="ekstre-modal-close" aria-label="Kapat" onclick="document.getElementById('akis-modal-overlay')?.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="akis-modal-form" class="ekstre-modal-body">
                ${editType !== 'firebase_pdf' ? `
                <div class="ekstre-segmented" id="am-mode-tabs" style="width:100%; display:grid; grid-template-columns:${isEditing ? '1fr 1fr' : '1fr 1fr 1fr'}; height:40px;">
                    <button type="button" class="ekstre-seg-btn ${modalMode === 'analiz' ? 'active' : ''}" data-mode="analiz" style="justify-content:center;"><i class="fas fa-link"></i> Analiz / Link</button>
                    ${!isEditing ? `<button type="button" class="ekstre-seg-btn ${modalMode === 'pdf' ? 'active' : ''}" data-mode="pdf" style="justify-content:center;"><i class="fas fa-file-pdf" style="color:#dc2626;"></i> PDF Rapor</button>` : ''}
                    <button type="button" class="ekstre-seg-btn ${modalMode === 'kisisel' ? 'active' : ''}" data-mode="kisisel" style="justify-content:center;"><i class="fas fa-thumbtack" style="color:#d97706;"></i> Kişisel Not</button>
                </div>` : ''}

                <div id="am-link-section" class="ekstre-field">
                    <label for="am-link" style="display:flex; justify-content:space-between; align-items:center;">
                        <span>Bağlantı (YouTube, X, KAP veya Web)</span>
                        <span id="am-platform-pill"></span>
                    </label>
                    <input type="text" id="am-link" class="form-control" placeholder="https://..." value="${window.escapeHtml(initLink)}">
                </div>

                <div id="am-pdf-section" class="ekstre-field" style="display:none;">
                    <label>PDF Rapor Dosyası (Maks. 10 MB)</label>
                    <div id="am-dropzone" class="akis-dropzone">
                        <i class="fas fa-cloud-arrow-up" style="font-size:24px; color:#0284c7;"></i>
                        <strong id="am-dropzone-title">PDF dosyasını buraya sürükleyin veya tıklayıp seçin</strong>
                        <span id="am-dropzone-sub" style="font-size:12px; opacity:0.8;">Yalnızca .pdf dosyaları · Buluta güvenle kaydedilir</span>
                    </div>
                    <input type="file" id="am-pdf-input" accept="application/pdf" style="display:none;">
                </div>

                <div class="ekstre-form-grid-2">
                    <div class="ekstre-field">
                        <label for="am-baslik">Başlık</label>
                        <input type="text" id="am-baslik" class="form-control" placeholder="Örn: 2026/6 Bilanço Değerlendirmesi" value="${window.escapeHtml(initBaslik)}">
                    </div>
                    <div class="ekstre-field">
                        <label for="am-tarih">Tarih</label>
                        <input type="date" id="am-tarih" class="form-control" value="${window.escapeHtml(initTarih)}" required>
                    </div>
                </div>

                <div id="am-author-section" class="ekstre-field">
                    <label for="am-author">Analist / Aracı Kurum</label>
                    <input type="text" id="am-author" list="analiz-borsaci-list" class="form-control" placeholder="Örn: Ak Yatırım, İş Yatırım, Analist Adı" value="${window.escapeHtml(initAuthor)}" autocomplete="off">
                </div>

                <div class="ekstre-field">
                    <label for="am-not">Notlar & Önemli Çıkarımlar</label>
                    <textarea id="am-not" class="takip-note-textarea" style="min-height:115px;" placeholder="Raporun öne çıkan noktaları, hedef fiyat veya kişisel yatırım teziniz...">${window.escapeHtml(initNote)}</textarea>
                </div>

                <div id="am-status" style="display:none; font-size:13px; font-weight:600;"></div>

                <div class="ekstre-modal-footer" style="margin: 0.25rem -1.35rem -1.25rem -1.35rem;">
                    <button type="button" class="ekstre-ghost-btn" onclick="document.getElementById('akis-modal-overlay')?.remove()">İptal</button>
                    <button type="submit" id="am-submit-btn" class="btn" style="padding: 9px 22px;">
                        <i class="fas fa-check" style="margin-right: 6px; color: #ffffff !important;"></i>${isEditing ? 'Değişiklikleri Kaydet' : 'Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    const linkSec = document.getElementById('am-link-section');
    const pdfSec = document.getElementById('am-pdf-section');
    const authorSec = document.getElementById('am-author-section');
    const inpLink = document.getElementById('am-link');
    const inpBaslik = document.getElementById('am-baslik');
    const inpTarih = document.getElementById('am-tarih');
    const inpAuthor = document.getElementById('am-author');
    const inpNote = document.getElementById('am-not');
    const inpPdf = document.getElementById('am-pdf-input');
    const dropzone = document.getElementById('am-dropzone');
    const dropTitle = document.getElementById('am-dropzone-title');
    const dropSub = document.getElementById('am-dropzone-sub');
    const platPill = document.getElementById('am-platform-pill');
    const statusEl = document.getElementById('am-status');
    const submitBtn = document.getElementById('am-submit-btn');

    let selectedFile = null;

    const refreshModeUI = () => {
        linkSec.style.display = (modalMode === 'analiz') ? 'flex' : 'none';
        pdfSec.style.display = (modalMode === 'pdf' && !isEditing) ? 'flex' : 'none';
        authorSec.style.display = (modalMode === 'kisisel') ? 'none' : 'flex';
        overlay.querySelectorAll('#am-mode-tabs button').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-mode') === modalMode);
        });
    };

    const updatePlatformBadge = () => {
        if (!platPill) return;
        const val = (inpLink.value || '').trim().toLowerCase();
        if (!val) { platPill.innerHTML = ''; return; }
        if (val.includes('youtube.com') || val.includes('youtu.be')) {
            platPill.innerHTML = '<span class="akis-source-badge akis-badge-youtube"><i class="fab fa-youtube"></i> YouTube</span>';
        } else if (val.includes('twitter.com') || val.includes('x.com')) {
            platPill.innerHTML = '<span class="akis-source-badge akis-badge-x"><i class="fa-brands fa-x-twitter"></i> X / Twitter</span>';
        } else if (val.includes('kap.org.tr')) {
            platPill.innerHTML = '<span class="akis-source-badge akis-badge-kap"><i class="fas fa-landmark"></i> KAP</span>';
        } else {
            platPill.innerHTML = '<span class="akis-source-badge akis-badge-link"><i class="fas fa-globe"></i> Web</span>';
        }
    };

    const setPickedFile = (file) => {
        if (!file) return;
        selectedFile = file;
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        dropzone.classList.add('has-file');
        dropTitle.textContent = file.name;
        dropSub.textContent = `${sizeMb} MB · Yüklemeye hazır`;
        if (!inpBaslik.value.trim()) {
            inpBaslik.value = file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ');
        }
    };

    if (dropzone && inpPdf) {
        dropzone.addEventListener('click', () => inpPdf.click());
        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            if (f) setPickedFile(f);
        });
        inpPdf.addEventListener('change', () => {
            if (inpPdf.files && inpPdf.files[0]) setPickedFile(inpPdf.files[0]);
        });
    }

    overlay.querySelectorAll('#am-mode-tabs button').forEach(b => {
        b.addEventListener('click', () => {
            modalMode = b.getAttribute('data-mode') || 'analiz';
            refreshModeUI();
        });
    });

    inpLink.addEventListener('input', updatePlatformBadge);
    refreshModeUI();
    updatePlatformBadge();

    const onKeyDown = (ke) => {
        if (ke.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onKeyDown); }
    };
    document.addEventListener('keydown', onKeyDown);

    document.getElementById('akis-modal-form').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const baslik = (inpBaslik.value || '').trim();
        const tarih = (inpTarih.value || '').trim() || todayStr;
        const author = (inpAuthor.value || '').trim();
        const link = (inpLink.value || '').trim();
        const notText = (inpNote.value || '').trim();

        // Case 1: Editing existing Firebase PDF metadata
        if (editType === 'firebase_pdf' && existingItem) {
            await window.updateFirebasePdfMeta(existingItem.id, {
                name: baslik || existingItem.fileName || 'Rapor.pdf',
                tarih,
                company: author || '-',
                notText
            });
            document.removeEventListener('keydown', onKeyDown);
            overlay.remove();
            window.showToast('PDF raporu bilgileri güncellendi.', 'success');
            if (typeof renderPage === 'function') renderPage();
            return;
        }

        // Case 2: New PDF Upload
        if (modalMode === 'pdf' && !isEditing) {
            if (!selectedFile) {
                window.showToast('Lütfen yüklenecek bir PDF dosyası seçin.', 'warning');
                return;
            }
            submitBtn.disabled = true;
            statusEl.style.display = 'block';
            statusEl.style.color = '#0369a1';
            statusEl.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i>PDF buluta yükleniyor...';
            try {
                await window.uploadPdfToFirebase(selectedFile, hisse, {
                    name: baslik || selectedFile.name.replace(/\.pdf$/i, ''),
                    tarih,
                    company: author || '-',
                    notText
                });
                document.removeEventListener('keydown', onKeyDown);
                overlay.remove();
                window.showToast('PDF raporu başarıyla yüklendi.', 'success');
                if (typeof renderPage === 'function') renderPage();
            } catch (err) {
                submitBtn.disabled = false;
                statusEl.style.color = '#dc2626';
                statusEl.textContent = 'Hata: ' + (err.message || 'Yükleme başarısız');
                window.showToast(err.message || 'PDF yüklenemedi.', 'error');
            }
            return;
        }

        // Case 3: Kişisel Not or Analiz / Link
        const isKisiselNot = modalMode === 'kisisel';
        const activeUser = (typeof currentUser !== 'undefined' ? currentUser : null) || window.currentUser;
        const activeUserName = (activeUser && (activeUser.displayName || (activeUser.email ? activeUser.email.split('@')[0] : ''))) || 'Kişisel Not';

        if (isKisiselNot) {
            if (!notText && !baslik) {
                window.showToast('Lütfen not veya başlık girin.', 'warning');
                inpNote.focus();
                return;
            }
        } else {
            if (!author && !baslik && !link) {
                window.showToast('Lütfen en azından Analist/Kurum, Başlık veya Bağlantı girin.', 'warning');
                inpAuthor.focus();
                return;
            }
        }

        const payload = {
            tarih,
            hisse,
            borsaci: isKisiselNot ? activeUserName : (author || '-'),
            baslik: baslik || (isKisiselNot ? 'Kişisel Yatırım Notu' : '-'),
            baglanti: isKisiselNot ? '' : link,
            notText,
            isKisiselNot
        };

        if (!State.data.analizler) State.data.analizler = [];
        if (editType === 'analiz' && existingItem) {
            const idx = State.data.analizler.findIndex(a => String(a.id) === String(existingItem.id));
            if (idx !== -1) State.data.analizler[idx] = { ...State.data.analizler[idx], ...payload };
            window.showToast('Akış kaydı güncellendi.', 'success');
        } else {
            State.data.analizler.push({ ...payload, id: Date.now() });
            window.showToast(isKisiselNot ? 'Kişisel not eklendi.' : 'Analiz kaydı eklendi.', 'success');
        }

        State.save();
        document.removeEventListener('keydown', onKeyDown);
        overlay.remove();
        if (typeof renderPage === 'function') renderPage();
    });

    setTimeout(() => {
        if (modalMode === 'kisisel') inpNote.focus();
        else if (modalMode === 'analiz') inpLink.focus();
        else inpBaslik.focus();
    }, 30);
};

window.saveUnifiedAnaliz = async () => {
    const fileInput = document.getElementById('upload-file');
    const status = document.getElementById('upload-status');
    const baslik = (document.getElementById('analiz-baslik') ? document.getElementById('analiz-baslik').value.trim() : '');
    const baglanti = (document.getElementById('analiz-baglanti') ? document.getElementById('analiz-baglanti').value.trim() : '');
    const borsaci = (document.getElementById('analiz-borsaci') ? document.getElementById('analiz-borsaci').value.trim() : '');
    const tarih = (document.getElementById('analiz-tarih') ? document.getElementById('analiz-tarih').value.trim() : '');
    const notText = (document.getElementById('analiz-not') ? document.getElementById('analiz-not').value.trim() : '');
    const hisse = (document.getElementById('analiz-hisse') ? document.getElementById('analiz-hisse').value.trim().toUpperCase() : (window.currentSelectedHisse || ''));

    const akisTipiRadio = document.querySelector('input[name="akisTipi"]:checked');
    const akisTipi = akisTipiRadio ? akisTipiRadio.value : 'analiz';
    
    let isKisiselNot = false;
    let finalBorsaci = borsaci;
    let finalTarih = tarih;
    let finalBaslik = baslik;
    
    const activeUser = currentUser || window.currentUser;
    const activeUserName = (activeUser && (activeUser.displayName || (activeUser.email ? activeUser.email.split('@')[0] : ''))) || 'Kişisel Not';
    if (akisTipi === 'kisisel') {
        isKisiselNot = true;
        finalBorsaci = activeUserName;
        const d = new Date();
        finalTarih = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        finalBaslik = '-';
    } else {
        isKisiselNot = !!(activeUserName && borsaci === activeUserName);
    }

    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        if (!hisse) {
            if (status) { status.style.display = 'block'; status.style.color = 'var(--danger-color)'; status.innerText = 'Lütfen Hisse kodunu doldurun.'; }
            return;
        }
        if (status) { status.style.display = 'block'; status.style.color = 'var(--text-primary)'; status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Firebase\'e yükleniyor...'; }

        const file = fileInput.files[0];
        try {
            await window.uploadPdfToFirebase(file, hisse, {
                name: baslik || file.name.replace(/\.pdf$/i, ''),
                tarih: tarih || new Date().toISOString().split('T')[0],
                company: borsaci || '-',
                notText: notText || ''
            });

            if (status) { status.style.color = 'var(--success-color)'; status.innerText = 'Firebase\'e başarıyla yüklendi!'; }
            window.showToast('PDF raporu Firebase\'e yüklendi.', 'success');

            fileInput.value = '';
            if (fileInput.previousElementSibling) {
                fileInput.previousElementSibling.innerHTML = '<span class="fa-stack" style="font-size: 8px; width: 2em; height: 2em;"><i class="fas fa-folder-open fa-stack-2x" style="color: #ffffff;"></i></span><span style="margin-left: 5px;">PDF Seç</span>';
            }
            if (document.getElementById('analiz-baslik')) document.getElementById('analiz-baslik').value = '';
            if (document.getElementById('analiz-borsaci')) document.getElementById('analiz-borsaci').value = '';
            if (document.getElementById('analiz-not')) document.getElementById('analiz-not').value = '';

            const row = document.getElementById('inline-analiz-row');
            if (row) row.style.display = 'none';
            window.currentEditingAnalizId = null;
            if (typeof renderPage === 'function') renderPage();
        } catch (error) {
            console.error('Firebase PDF yükleme hatası:', error);
            const msg = error.message || 'Yükleme sırasında hata oluştu.';
            if (status) { status.style.color = 'var(--danger-color)'; status.innerText = 'Hata: ' + msg; }
            window.showToast(msg, 'error');
        }
    } else {
        if (isKisiselNot) {
            if (!notText || !hisse) { window.showToast('Lütfen Hisse ve Notlar alanlarını doldurun.', 'warning'); return; }
        } else {
            if (!tarih || !borsaci || !hisse) { window.showToast('Lütfen Tarih, Analist/Şirket ve Hisse alanlarını doldurun.', 'warning'); return; }
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
            window.showToast('Form alanları yüklenemedi.', 'error');
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
                window.showToast('Lütfen Hisse ve Notlar alanlarını doldurun.', 'warning');
                return;
            }
        } else {
            if (!tarih || !borsaci || !hisse) {
                window.showToast('Lütfen Tarih, Analist ve Hisse alanlarını doldurun.', 'warning');
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
        window.showToast('Hata oluştu: ' + e.message, 'error');
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
        if (bEl) {
            bEl.value = analiz.borsaci;
            bEl.blur(); // Fix: Prevent browser from auto-focusing this field
        }
        const hEl = document.getElementById('analiz-hisse');
        if (hEl) hEl.value = analiz.hisse;
        const bslEl = document.getElementById('analiz-baslik');
        if (bslEl) bslEl.value = analiz.baslik || '';
        const lEl = document.getElementById('analiz-baglanti');
        if (lEl) lEl.value = analiz.baglanti || '';
        const nEl = document.getElementById('analiz-not');
        if (nEl) nEl.value = analiz.notText || '';

        const radioAnaliz = document.querySelector('input[name="akisTipi"][value="analiz"]') || document.querySelector('input[name="notTipi"][value="analiz"]');
        const radioKisisel = document.querySelector('input[name="akisTipi"][value="kisisel"]') || document.querySelector('input[name="notTipi"][value="kisisel"]');
        const detayAlanlari = document.getElementById('akis-genel-inputs') || document.getElementById('analiz-detay-alanlari');

        if (analiz.isKisiselNot) {
            if (radioKisisel) radioKisisel.checked = true;
            if (detayAlanlari) detayAlanlari.style.display = 'none';
        } else {
            if (radioAnaliz) radioAnaliz.checked = true;
            if (detayAlanlari) detayAlanlari.style.display = 'flex';
        }

        if (lEl && !analiz.isKisiselNot) {
            setTimeout(() => { 
                if (lEl) {
                    lEl.focus(); 
                    lEl.select(); // Highlight text to make focus obvious
                }
            }, 50);
            setTimeout(() => { if (lEl) lEl.focus(); }, 150);
        }
        else if (nEl) {
            setTimeout(() => { if (nEl) nEl.focus(); }, 50);
        }
    }, 50);
};

window.deleteAnaliz = async (id) => {
    if (!(await window.showConfirm('Bu analizi silmek istediğinize emin misiniz?'))) return;
    State.data.analizler = State.data.analizler.filter(a => String(a.id) !== String(id));
    State.save();
    renderPage();
    window.showToast('Analiz kaydı silindi.', 'info');
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
        list.style.boxShadow = 'var(--shadow-lg)';
        list.style.marginTop = '5px';
        // Give list a massive z-index
        list.style.zIndex = '99999';
        list.style.background = 'var(--dropdown-bg)';
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
                item.style.color = 'var(--text-primary)';
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
                item.style.background = 'var(--overlay-bg)';
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
        const safeHref = window.sanitizeUrl(a.baglanti);
        const linkHtml = safeHref ? `<a href="${window.escapeHtml(safeHref)}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-color); text-decoration: none;"><i class="fas fa-external-link-alt"></i> Link</a>` : '-';
        return `
            <tr>
                <td style="text-align: right; white-space: nowrap; width: 100px; color: var(--text-secondary);">${window.escapeHtml(a.tarih ? a.tarih.split('-').reverse().join('.') : '')}</td>
                <td style="text-align: left; word-break: break-word; width: 140px; padding-left: 10px; color: var(--text-secondary);">${window.escapeHtml((a.borsaci || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}]/gu, '').trim())}</td>
                <td style="text-align: left; font-weight: bold; white-space: nowrap; width: 100px; padding-left: 10px;">${window.escapeHtml(a.hisse)}</td>
                <td style="text-align: left; white-space: nowrap; width: 100px; padding-left: 10px;">${linkHtml}</td>
                <td style="text-align: left; word-break: break-word; width: 100%;">${window.escapeHtml(a.notText || '')}</td>
                <td style="text-align: center; white-space: nowrap; width: 90px;">
                    <div style="display: flex; gap: 0.5rem; justify-content: center;">
                        <button class="btn btn-icon" style="color: var(--accent-color);" onclick="window.editAnaliz(${a.id})" title="Düzenle"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-icon" style="background: transparent; color: var(--text-secondary); padding: 2px; font-size: 14px; border: none;" onclick="window.deleteAnaliz(${a.id})" title="Sil"><i class="fas fa-trash-alt"></i></button>
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
                    <button class="btn" style="font-size: 13.5px; padding: 0.35rem 0.85rem; background: var(--success-color);" onclick="window.toggleInlineAnaliz()">+</button>
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
                            <tr id="inline-analiz-row" style="display: none; background: #eff6ff;">
                                <td><input type="date" id="analiz-tarih" class="form-control" style="width:100%; font-size:13px !important; font-weight:normal !important; padding:4px; text-align:right; color-scheme: light;" value="${today}"></td>
                                <td><input type="text" id="analiz-borsaci" list="analiz-borsaci-list" class="form-control" style="width:100%; font-size:13px !important; font-weight:normal !important; padding:4px; text-align:left;" placeholder="Analist"></td>
                                <td><input type="text" id="analiz-hisse" list="bist-hisse-list" class="form-control" style="width:100%; font-size:13px !important; font-weight:normal !important; padding:4px; text-transform:uppercase; text-align:left;" placeholder="Hisse"></td>
                                <td><input type="text" id="analiz-baglanti" class="form-control" style="width:100%; font-size:13px !important; font-weight:normal !important; padding:4px; text-align:left;" placeholder="Link"></td>
                                <td><input type="text" id="analiz-not" class="form-control" style="width:100%; font-size:13px !important; font-weight:normal !important; padding:4px;" placeholder="Not..."></td>
                                <td style="text-align: center;">
                                    <div style="display: flex; gap: 0.5rem; justify-content: center;">
                                        <button class="btn" style="background: var(--success-color); color: var(--btn-text); padding: 3px 8px !important; font-size: 13px !important; font-weight: 600 !important; min-width: 0 !important; width: fit-content !important; border-radius: 4px; border: none; cursor: pointer; box-sizing: border-box !important;" onclick="window.addAnaliz()">Kaydet</button>
                                        <button class="btn" style="background: var(--danger-color); color: #fff; padding: 3px 8px !important; font-size: 13px !important; font-weight: 600 !important; min-width: 0 !important; width: fit-content !important; border-radius: 4px; border: none; cursor: pointer; box-sizing: border-box !important;" onclick="window.toggleInlineAnaliz()">İptal</button>
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
            window.showToast('Profil güncellendi!', 'success');
        }).catch(err => window.showToast(err.message, 'error'));
    });

    document.getElementById('password-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newPass = document.getElementById('profile-new-password').value;
        currentUser.updatePassword(newPass).then(() => {
            window.showToast('Parola başarıyla güncellendi!', 'success');
            document.getElementById('password-form').reset();
        }).catch(err => window.showToast(err.message, 'error'));
    });
};
window.getGBHF = (hisse) => {
    if (!State.data.araDegerleme || !State.data.araDegerleme[hisse]) return null;
    const qKeys = Object.keys(State.data.araDegerleme[hisse]).sort((a, b) => {
        const [yA, mA] = a.split('/').map(Number);
        const [yB, mB] = b.split('/').map(Number);
        if (yA !== yB) return yB - yA;
        return mB - mA;
    });

    const ctx = window.getDegerlemeStockContext(hisse);
    if (!ctx.sData) return null;

    for (const period of qKeys) {
        const d = State.data.araDegerleme[hisse][period];
        if (!d || Object.keys(d).length === 0) continue;
        if (ctx.sData.gelirCeyrek && ctx.sData.gelirCeyrek.headers && ctx.sData.gelirCeyrek.headers.includes(period)) {
            continue;
        }
        const res = window.computeDegerlemePeriod(period, d, ctx);
        if (res.hasHedef) {
            return {
                hedefFiyat: res.hedefFiyatTL,
                potansiyel: res.potansiyelPct !== null ? res.potansiyelPct : 0,
                period
            };
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
            const gColor = guncelPct >= 0 ? '#059669' : '#dc2626';
            const guncelFiyatHtml = `<td style="text-align: right !important;">${fmtDec(guncelFiyat)}<br><span style="color:${gColor}; font-size:10px;">${guncelPct > 0 ? '+' : ''}${guncelPct.toFixed(2)}%</span></td>`;

            const renderCell = (year) => {
                if (!hData[year]) return `<td style="text-align: right !important;">-</td><td style="text-align: right !important;">-</td>`;
                const color = hData[year].potansiyel > 0 ? '#059669' : '#dc2626';
                return `<td style="text-align: right !important;">${fmtDec(hData[year].hedefFiyat)}</td><td style="text-align: right !important; color:${color} !important; font-weight:bold;">${fmtPct(hData[year].potansiyel)}</td>`;
            };

            let gbhfHtml = `<td style="text-align: right !important;">-</td><td style="text-align: right !important;">-</td>`;
            if (gbhfData) {
                const color = gbhfData.potansiyel > 0 ? '#059669' : '#dc2626';
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
            <p style="font-size:0.85rem; color:var(--text-secondary);"><i class="fas fa-info-circle"></i> Tablodaki değerler, Hisseler > Anasayfa > Değerleme panelinde girdiğiniz tahminlere göre otomatik hesaplanır ve buraya yansır.</p>
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
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.25rem 0.3rem; border-bottom: 1px solid var(--surface-border);">
              <span style="color: var(--text-primary); font-weight: 600; font-size: 13.5px;">${hisse}</span>
                <i class="fas fa-trash-alt" style="cursor: pointer; color: var(--text-secondary); font-size: 13px; padding: 4px;" onclick="window.removeHisseFromTakipModal('${hisse}')"></i>
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
        window.showToast('Geçersiz hisse kodu: ' + val, 'warning');
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
        window.showToast('Bu hisse zaten takip listesinde.', 'info');
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
    const ascDefaultCols = new Set(['hisse', 'fk', 'fdFavok', 'pdDd', 'netBorcFavok']);
    if (window.takipSort.col === col) {
        window.takipSort.asc = !window.takipSort.asc;
    } else {
        window.takipSort = { col: col, asc: ascDefaultCols.has(col) };
    }
    if (typeof window.updateTakipViewOnly === 'function') window.updateTakipViewOnly();
    else if (typeof renderPage === 'function') renderPage();
};

const getTakipSortIcon = () => '';

window.setTakipFilter = (key, val) => {
    if (key === 'sahiplik') window.takipFilterSahiplik = val;
    else if (key === 'quick') window.takipFilterQuick = val;
    else if (key === 'yildiz') window.takipFilterYildiz = !!val;
    else if (key === 'yearMode') window.takipYearMode = val;
    else if (key === 'pinStars') window.takipPinStars = !!val;
    if (typeof renderPage === 'function') renderPage();
};

window.resetTakipFilters = () => {
    window.takipSearchQuery = '';
    window.takipFilterSahiplik = 'all';
    window.takipFilterQuick = 'all';
    window.takipFilterYildiz = false;
    window.takipSort = { col: null, asc: true };
    if (typeof renderPage === 'function') renderPage();
};

window.toggleTakipStar = (hisse, ev) => {
    if (ev) ev.stopPropagation();
    const starred = State.toggleTakipYildiz(hisse);
    if (typeof window.updateTakipViewOnly === 'function') {
        window.updateTakipViewOnly();
    } else if (typeof renderPage === 'function') {
        renderPage();
    }
    window.showToast(starred ? `${hisse} yıldızlılara eklendi.` : `${hisse} yıldızlılardan çıkarıldı.`, 'info', 1800);
};

window.quickAddTakipHisse = (ev) => {
    if (ev) ev.preventDefault();
    const input = document.getElementById('takip-quick-add-input');
    if (!input) return;
    const val = (input.value || '').trim().toUpperCase();
    if (!val) return;

    const hasBistList = State.bistStocks && State.bistStocks.length > 0;
    const validStocks = hasBistList ? State.bistStocks : (window.defaultStocksArray || []);
    if (hasBistList && !validStocks.includes(val)) {
        window.showToast('Geçerli bir BİST hisse kodu seçiniz: ' + val, 'warning');
        return;
    }
    if (!hasBistList && !/^[A-Z0-9]{3,6}$/.test(val)) {
        window.showToast('Geçersiz hisse kodu: ' + val, 'warning');
        return;
    }

    if (!State.data.takipListesi) State.data.takipListesi = [];
    if (State.data.takipListesi.includes(val)) {
        window.showToast(val + ' zaten takip listenizde.', 'info');
        input.value = '';
        return;
    }

    State.addTakip(val);
    input.value = '';
    if (typeof window.updateGlobalHisseDropdown === 'function') window.updateGlobalHisseDropdown();
    if (typeof window.fetchGuncelFiyatlar === 'function' && (!window.livePrices || !window.livePrices[val])) {
        try { window.fetchGuncelFiyatlar(); } catch (e) { }
    }
    window.showToast(val + ' takip listesine eklendi.', 'success');
    if (typeof renderPage === 'function') renderPage();
};

window.removeTakipFromTable = async (hisse, ev) => {
    if (ev) ev.stopPropagation();
    if (!hisse) return;
    if (await window.showConfirm(`${hisse} hissesini takip listesinden çıkarmak istediğinize emin misiniz?`, 'Evet, Çıkar')) {
        State.removeTakip(hisse);
        if (window.currentSelectedHisse === hisse) window.currentSelectedHisse = null;
        if (typeof window.updateGlobalHisseDropdown === 'function') window.updateGlobalHisseDropdown();
        window.showToast(`${hisse} takip listesinden çıkarıldı.`, 'info');
        if (typeof renderPage === 'function') renderPage();
    }
};

window.openTakipDetailModal = (hisse, ev) => {
    if (ev) ev.stopPropagation();
    const sym = String(hisse || '').trim().toUpperCase();
    if (!sym) return;

    const existingOverlay = document.getElementById('takip-detail-modal-overlay');
    if (existingOverlay) existingOverlay.remove();

    const td = window.tickerData && window.tickerData[sym];
    const fiyat = td && td.c ? td.c : (State.getFiyat(sym) || 0);
    const gunluk = td && td.chp !== undefined && td.chp !== null ? td.chp : null;
    const gbhf = typeof window.getGBHF === 'function' ? window.getGBHF(sym) : null;
    const currentTarget = (State.data.takipAlimHedefleri && State.data.takipAlimHedefleri[sym]) ? State.data.takipAlimHedefleri[sym] : '';
    const currentNote = (State.data.hisseNotlari && State.data.hisseNotlari[sym]) ? State.data.hisseNotlari[sym] : '';
    const fmtDecLocal = (v) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

    const overlay = document.createElement('div');
    overlay.id = 'takip-detail-modal-overlay';
    overlay.className = 'ekstre-modal-overlay';
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });

    const safeSym = window.escapeHtml(sym);
    const safeNote = window.escapeHtml(currentNote);
    const gunlukTxt = gunluk !== null && !isNaN(gunluk)
        ? `<span style="font-weight:700; color:${gunluk > 0 ? '#059669' : (gunluk < 0 ? '#dc2626' : '#64748b')};">(${gunluk > 0 ? '%+' : (gunluk < 0 ? '%-' : '%')}${fmtDecLocal(Math.abs(gunluk))})</span>`
        : '';

    overlay.innerHTML = `
        <div class="ekstre-modal-card" role="dialog" aria-modal="true">
            <div class="ekstre-modal-header">
                <h3>
                    <i class="fas fa-crosshairs" style="color: #0284c7;"></i>
                    <span>${safeSym} — Alım Hedefi & Not</span>
                </h3>
                <button type="button" class="ekstre-modal-close" aria-label="Kapat" onclick="document.getElementById('takip-detail-modal-overlay')?.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="takip-detail-modal-form" class="ekstre-modal-body">
                <div class="ekstre-hint-bar" style="justify-content: space-between;">
                    <span>Güncel Fiyat: <strong style="color:#0f172a;">₺${fmtDecLocal(fiyat)}</strong> ${gunlukTxt}</span>
                    ${gbhf && gbhf.hedefFiyat ? `<span>G. B. Hedef (${window.escapeHtml(gbhf.period || '')}): <strong style="color:#059669;">₺${fmtDecLocal(gbhf.hedefFiyat)}</strong></span>` : ''}
                </div>

                <div class="ekstre-field">
                    <label for="tdm-alim-hedef">Kişisel Alım Hedef Fiyatı (₺)</label>
                    <input type="number" id="tdm-alim-hedef" class="form-control" step="any" min="0" placeholder="Örn: ${fiyat > 0 ? (fiyat * 0.9).toFixed(2) : '100.00'}" value="${currentTarget !== '' ? currentTarget : ''}">
                    <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-top:4px;">
                        ${fiyat > 0 ? `
                        <button type="button" class="ekstre-shortcut-pill" data-pct="0.95">-%5 (₺${fmtDecLocal(fiyat * 0.95)})</button>
                        <button type="button" class="ekstre-shortcut-pill" data-pct="0.90">-%10 (₺${fmtDecLocal(fiyat * 0.90)})</button>
                        <button type="button" class="ekstre-shortcut-pill" data-pct="0.85">-%15 (₺${fmtDecLocal(fiyat * 0.85)})</button>
                        ` : ''}
                        <button type="button" class="ekstre-shortcut-pill danger" id="tdm-clear-target">Hedefi Temizle</button>
                    </div>
                </div>

                <div id="tdm-target-status" class="takip-target-status-bar">
                    <span>Hedef fiyat girildiğinde alım bölgesine olan mesafe burada görünür.</span>
                </div>

                <div class="ekstre-field">
                    <label for="tdm-not">Kişisel Hisse Notu</label>
                    <textarea id="tdm-not" class="takip-note-textarea" placeholder="Bilanço beklentisi, alım stratejisi, destek/direnç veya takip notlarınız...">${safeNote}</textarea>
                </div>

                <div class="ekstre-modal-footer" style="margin: 0.25rem -1.35rem -1.25rem -1.35rem;">
                    <button type="button" class="ekstre-ghost-btn" onclick="document.getElementById('takip-detail-modal-overlay')?.remove()">İptal</button>
                    <button type="submit" class="btn" style="padding: 9px 22px;">
                        <i class="fas fa-check" style="margin-right: 6px; color: #ffffff !important;"></i>Kaydet
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    const inpTarget = document.getElementById('tdm-alim-hedef');
    const inpNote = document.getElementById('tdm-not');
    const statusBox = document.getElementById('tdm-target-status');

    const updateTargetStatus = () => {
        const tVal = parseFloat(String(inpTarget.value || '').replace(',', '.'));
        if (!tVal || isNaN(tVal) || tVal <= 0) {
            statusBox.className = 'takip-target-status-bar';
            statusBox.innerHTML = '<span><i class="fas fa-info-circle" style="margin-right:6px;"></i>Alım hedef fiyatı tanımlı değil.</span>';
            return;
        }
        if (fiyat <= 0) {
            statusBox.className = 'takip-target-status-bar above-zone';
            statusBox.innerHTML = `<span>Alım Hedefi: <strong>₺${fmtDecLocal(tVal)}</strong></span><span>Canlı fiyat bekleniyor</span>`;
            return;
        }
        const diffPct = ((fiyat - tVal) / tVal) * 100;
        if (fiyat <= tVal) {
            statusBox.className = 'takip-target-status-bar in-zone';
            statusBox.innerHTML = `<span><i class="fas fa-check-circle" style="margin-right:6px;"></i><strong>Alım Bölgesinde!</strong> Güncel fiyat hedefin altında.</span><strong>%${fmtDecLocal(Math.abs(diffPct))} iskonto</strong>`;
        } else {
            statusBox.className = 'takip-target-status-bar above-zone';
            statusBox.innerHTML = `<span><i class="fas fa-hourglass-half" style="margin-right:6px;"></i>Alım hedefine ulaşmak için geri çekilme gerekiyor.</span><strong>Hedefin +%${fmtDecLocal(diffPct)} üstünde</strong>`;
        }
    };

    overlay.querySelectorAll('[data-pct]').forEach(btn => {
        btn.addEventListener('click', () => {
            const mult = parseFloat(btn.getAttribute('data-pct'));
            if (fiyat > 0 && mult > 0) {
                inpTarget.value = (fiyat * mult).toFixed(2);
                updateTargetStatus();
            }
        });
    });

    document.getElementById('tdm-clear-target')?.addEventListener('click', () => {
        inpTarget.value = '';
        updateTargetStatus();
    });

    inpTarget.addEventListener('input', updateTargetStatus);
    updateTargetStatus();

    const onKeyDown = (ke) => {
        if (ke.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', onKeyDown);
        }
    };
    document.addEventListener('keydown', onKeyDown);

    document.getElementById('takip-detail-modal-form').addEventListener('submit', (se) => {
        se.preventDefault();
        if (!State.data.takipAlimHedefleri || Array.isArray(State.data.takipAlimHedefleri)) {
            State.data.takipAlimHedefleri = {};
        }
        const tVal = parseFloat(String(inpTarget.value || '').replace(',', '.'));
        if (!isNaN(tVal) && tVal > 0) {
            State.data.takipAlimHedefleri[sym] = tVal;
        } else {
            delete State.data.takipAlimHedefleri[sym];
        }

        if (!State.data.hisseNotlari) State.data.hisseNotlari = {};
        const trimmedNote = (inpNote.value || '').trim();
        if (trimmedNote) {
            State.data.hisseNotlari[sym] = inpNote.value;
        } else {
            delete State.data.hisseNotlari[sym];
        }

        State.save();
        document.removeEventListener('keydown', onKeyDown);
        overlay.remove();
        window.showToast(`${sym} hedef ve not bilgileri kaydedildi.`, 'success');
        if (typeof window.updateTakipViewOnly === 'function') window.updateTakipViewOnly();
        else if (typeof renderPage === 'function') renderPage();
    });

    setTimeout(() => inpTarget.focus(), 30);
};

const renderAnasayfa = (container) => {
    try {
        window.takipTab = window.takipTab || 'degerleme';
        window.takipFilterSahiplik = window.takipFilterSahiplik || 'all';
        window.takipFilterQuick = window.takipFilterQuick || 'all';
        window.takipFilterYildiz = !!window.takipFilterYildiz;
        window.takipYearMode = window.takipYearMode || 'all';
        if (window.takipPinStars === undefined) window.takipPinStars = true;
        window.takipSearchQuery = window.takipSearchQuery || '';
        window.takipSort = window.takipSort || { col: null, asc: true };

        window.setTakipTab = (tab) => {
            window.takipTab = tab;
            if (typeof renderPage === 'function') renderPage();
        };

        if (window.recalculateHedefFiyatlar) window.recalculateHedefFiyatlar();

        const fmtDec = (val) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(val);
        const fmtPct = (val) => {
            const num = val * 100;
            const formatted = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(Math.round(Math.abs(num)));
            return num < 0 ? '%-' + formatted : '%' + formatted;
        };
        const fmtPctDec = (val, showPlus = false) => {
            if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return '-';
            const formatted = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Math.abs(val));
            if (val < 0) return '%-' + formatted;
            return (showPlus && val > 0 ? '%+' : '%') + formatted;
        };
        const fmtCurrency = (val, symbol) => {
            if (val === 0 || isNaN(val) || !val || !isFinite(val)) return '-';
            return symbol + ' ' + new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(Math.round(val));
        };
        const fmtMet = (val) => {
            if (val === 0 || isNaN(val) || !val || !isFinite(val)) return '-';
            return fmtDec(val);
        };
        const fmtNullableDec = (val) => {
            if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return '-';
            return fmtDec(val);
        };
        const calcMedian = (arr) => {
            const clean = arr.filter(v => v !== null && v !== undefined && !isNaN(v) && isFinite(v)).sort((a, b) => a - b);
            if (clean.length === 0) return null;
            const mid = Math.floor(clean.length / 2);
            return clean.length % 2 !== 0 ? clean[mid] : (clean[mid - 1] + clean[mid]) / 2;
        };
        const calcAvg = (arr) => {
            const clean = arr.filter(v => v !== null && v !== undefined && !isNaN(v) && isFinite(v));
            if (clean.length === 0) return null;
            return clean.reduce((s, v) => s + v, 0) / clean.length;
        };

        const computeAllTakipData = () => {
            const takipList = State.data.takipListesi ? [...State.data.takipListesi] : [];
            const dolarKuru = State.getFiyat('DOLAR') || 1;
            const starredSet = new Set((State.data.takipYildizlar || []).map(s => String(s).trim().toUpperCase()));
            const alimHedefleri = State.data.takipAlimHedefleri || {};
            const hisseNotlari = State.data.hisseNotlari || {};

            // Map active portfolio holdings so watchlist knows what's already held
            const portfoyMap = {};
            try {
                const { portfoyList } = calculatePortfoy(State.data.ekstre || [], (m) => State.getFiyat(m), State.data.nakitHareketleri || []);
                (portfoyList || []).forEach(p => {
                    if (!p || p.isNakit || !p.menkul) return;
                    const sym = String(p.menkul).trim().toUpperCase();
                    if ((p.adet || 0) > 0.0001) {
                        portfoyMap[sym] = {
                            inPortfoy: true,
                            portfoyOrani: (p.portfoyOrani || 0) * 100,
                            karYuzde: (p.karYuzde || 0) * 100,
                            guncelTutar: p.guncelTutar || 0,
                            adet: p.adet || 0
                        };
                    }
                });
            } catch (e) { }

            return takipList.map(rawHisse => {
                const hisse = String(rawHisse).trim().toUpperCase();
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
                let netBorcFavok = null, favokMarji = null, netKarMarji = null, roe = null;
                let araHedefFiyat = -Infinity, araPotansiyel = -Infinity, araPeriod = null;
                const sData = (window.stockData && window.stockData[hisse]) ? window.stockData[hisse] : null;

                if (sData) {
                    const getVal = (sheet, rowName) => {
                        if (!sheet || !sheet.rows) return 0;
                        const searchStr = rowName.toLowerCase().replace(/[öçşğıü]/g, '');
                        const exactRow = sheet.rows.find(r => r[0] && r[0].toString().toLowerCase().replace(/[öçşğıü]/g, '').trim() === searchStr.trim());
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
                        sData.bilanco.rows.forEach((r, idx) => {
                            if (!r[0]) return;
                            const rName = r[0].toString().toLocaleLowerCase('tr-TR');
                            if (rName.includes('finansal borçlar') && !rName.includes('kısımlar') && !rName.includes('ksmlar') && idx < sData.bilanco.rows.length - 2) {
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
                    netBorcFavok = favok !== 0 ? (netBorc / favok) : null;

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

                    let satislar = getVal(sData.gelirYillik, 'Satış Gelirleri');
                    if (satislar === 0) satislar = getVal(sData.gelirYillik, 'Hasılat');
                    if (satislar > 0 && favok !== 0) favokMarji = (favok / satislar) * 100;
                    if (satislar > 0 && yilliklandirilmisNetKar !== 0) netKarMarji = (yilliklandirilmisNetKar / satislar) * 100;
                    if (anaOrtaklikOzkaynaklar > 0 && yilliklandirilmisNetKar !== 0) roe = (yilliklandirilmisNetKar / anaOrtaklikOzkaynaklar) * 100;

                    const gbhfData = typeof window.getGBHF === 'function' ? window.getGBHF(hisse) : null;
                    if (gbhfData) {
                        araHedefFiyat = gbhfData.hedefFiyat;
                        araPotansiyel = gbhfData.potansiyel / 100;
                        araPeriod = gbhfData.period;
                    }
                }

                const hData = (State.data.hedefFiyatlar && State.data.hedefFiyatlar[hisse]) ? State.data.hedefFiyatlar[hisse] : null;
                const getPot = (y) => (hData && hData[y] && hData[y].potansiyel !== undefined) ? hData[y].potansiyel : -Infinity;
                const getHf = (y) => (hData && hData[y] && hData[y].hedefFiyat !== undefined) ? hData[y].hedefFiyat : -Infinity;

                const pot2026 = getPot('2026'), pot2027 = getPot('2027'), pot2028 = getPot('2028'), pot2029 = getPot('2029'), pot2030 = getPot('2030');
                const hf2026 = getHf('2026'), hf2027 = getHf('2027'), hf2028 = getHf('2028'), hf2029 = getHf('2029'), hf2030 = getHf('2030');

                const hasDegerleme = araPotansiyel !== -Infinity || pot2026 !== -Infinity || pot2027 !== -Infinity || pot2028 !== -Infinity || pot2029 !== -Infinity || pot2030 !== -Infinity;
                const hasOran = piyasaDegeri > 0 || fk !== 0 || fdFavok !== 0 || pdDd !== 0;

                const pInfo = portfoyMap[hisse] || null;
                const isStarred = starredSet.has(hisse);
                const rawTarget = parseFloat(alimHedefleri[hisse]);
                const alimHedefi = (!isNaN(rawTarget) && rawTarget > 0) ? rawTarget : null;
                const alimBolgesinde = alimHedefi !== null && fiyat > 0 && fiyat <= alimHedefi;
                const alimMesafePct = (alimHedefi !== null && fiyat > 0) ? ((fiyat - alimHedefi) / alimHedefi) * 100 : null;
                const notText = String(hisseNotlari[hisse] || '').trim();

                return {
                    hisse, fiyat, gunlukYuzde,
                    piyasaDegeri, piyasaDegeriUsd: piyasaDegeri / dolarKuru, firmaDegeri,
                    fdFavok, fk, pdDd, netBorcFavok, favokMarji, netKarMarji, roe,
                    araHedefFiyat, araPotansiyel, araPeriod,
                    hf2026, pot2026, hf2027, pot2027, hf2028, pot2028, hf2029, pot2029, hf2030, pot2030,
                    hasDegerleme, hasOran,
                    inPortfoy: !!pInfo,
                    portfoyOrani: pInfo ? pInfo.portfoyOrani : 0,
                    portfoyKarYuzde: pInfo ? pInfo.karYuzde : 0,
                    isStarred, alimHedefi, alimBolgesinde, alimMesafePct, notText
                };
            });
        };

        const filterAndSort = (allItems) => {
            const q = (window.takipSearchQuery || '').trim().toUpperCase();
            const sahF = window.takipFilterSahiplik || 'all';
            const quickF = window.takipFilterQuick || 'all';
            const yildizF = !!window.takipFilterYildiz;

            const filtered = allItems.filter(it => {
                if (sahF === 'portfoy' && !it.inPortfoy) return false;
                if (sahF === 'izleme' && it.inPortfoy) return false;
                if (yildizF && !it.isStarred) return false;

                const primaryPot = it.araPotansiyel !== -Infinity ? it.araPotansiyel : it.pot2026;
                if (quickF === 'alim_bolgesi' && !it.alimBolgesinde) return false;
                if (quickF === 'alim_tanimli' && it.alimHedefi === null) return false;
                if (quickF === 'pozitif_pot' && !(primaryPot !== -Infinity && primaryPot > 0)) return false;
                if (quickF === 'yuksek_pot' && !(primaryPot !== -Infinity && primaryPot >= 0.5)) return false;
                if (quickF === 'yukselen' && !(it.gunlukYuzde !== null && it.gunlukYuzde > 0)) return false;
                if (quickF === 'dusen' && !(it.gunlukYuzde !== null && it.gunlukYuzde < 0)) return false;
                if (quickF === 'degerlemeli' && !it.hasDegerleme) return false;
                if (quickF === 'notlu' && !it.notText) return false;

                if (q) {
                    const hay = `${it.hisse} ${it.notText}`.toUpperCase();
                    if (!hay.includes(q)) return false;
                }
                return true;
            });

            const zeroIsMissingCols = new Set(['piyasaDegeri', 'piyasaDegeriUsd', 'firmaDegeri', 'fdFavok', 'fk', 'pdDd', 'fiyat']);
            const isMissingVal = (col, v) => {
                if (v === null || v === undefined || v === -Infinity || isNaN(v) || !isFinite(v)) return true;
                if (zeroIsMissingCols.has(col) && v === 0) return true;
                return false;
            };

            const multiLevelSort = (a, b) => {
                if (b.araPotansiyel !== a.araPotansiyel) return b.araPotansiyel - a.araPotansiyel;
                if (b.pot2026 !== a.pot2026) return b.pot2026 - a.pot2026;
                if (b.pot2027 !== a.pot2027) return b.pot2027 - a.pot2027;
                if (b.pot2028 !== a.pot2028) return b.pot2028 - a.pot2028;
                if (b.pot2029 !== a.pot2029) return b.pot2029 - a.pot2029;
                if (b.pot2030 !== a.pot2030) return b.pot2030 - a.pot2030;
                return a.hisse.localeCompare(b.hisse);
            };

            const col = window.takipSort && window.takipSort.col ? window.takipSort.col : null;
            const asc = !!(window.takipSort && window.takipSort.asc);
            const pinStars = !!window.takipPinStars;

            filtered.sort((a, b) => {
                if (pinStars && a.isStarred !== b.isStarred) {
                    return a.isStarred ? -1 : 1;
                }
                if (!col) return multiLevelSort(a, b);
                if (col === 'hisse') {
                    const diff = asc ? a.hisse.localeCompare(b.hisse) : b.hisse.localeCompare(a.hisse);
                    return diff !== 0 ? diff : multiLevelSort(a, b);
                }
                const aMiss = isMissingVal(col, a[col]);
                const bMiss = isMissingVal(col, b[col]);
                if (aMiss && bMiss) return multiLevelSort(a, b);
                if (aMiss) return 1;
                if (bMiss) return -1;
                const diff = asc ? (a[col] - b[col]) : (b[col] - a[col]);
                return (diff !== 0 && !isNaN(diff)) ? diff : multiLevelSort(a, b);
            });

            return filtered;
        };

        const buildKpiHtml = (allItems, visibleItems) => {
            const isFiltered = visibleItems.length !== allItems.length;
            const src = visibleItems.length > 0 ? visibleItems : allItems;

            const portfoyCount = allItems.filter(x => x.inPortfoy).length;
            const izlemeCount = allItems.length - portfoyCount;
            const starCount = allItems.filter(x => x.isStarred).length;
            const alimZoneCount = allItems.filter(x => x.alimBolgesinde).length;

            const gunlukVals = src.map(x => x.gunlukYuzde).filter(v => v !== null && v !== undefined && !isNaN(v));
            const avgGunluk = calcAvg(gunlukVals);
            const upCount = gunlukVals.filter(v => v > 0).length;
            const downCount = gunlukVals.filter(v => v < 0).length;

            // Find highest potential leader (prefer G.B., fallback 2026)
            let leader = null;
            let leaderPot = -Infinity;
            let leaderHf = 0;
            let leaderLabel = 'G. B.';
            src.forEach(it => {
                if (it.araPotansiyel !== -Infinity && it.araPotansiyel > leaderPot) {
                    leader = it;
                    leaderPot = it.araPotansiyel;
                    leaderHf = it.araHedefFiyat;
                    leaderLabel = it.araPeriod ? `G. B. ${it.araPeriod}` : 'G. B.';
                }
            });
            if (!leader) {
                src.forEach(it => {
                    if (it.pot2026 !== -Infinity && it.pot2026 > leaderPot) {
                        leader = it;
                        leaderPot = it.pot2026;
                        leaderHf = it.hf2026;
                        leaderLabel = '2026';
                    }
                });
            }

            // Tab-contextual 4th card
            let card4Html = '';
            if (window.takipTab === 'degerleme') {
                const medAra = calcMedian(src.map(x => x.araPotansiyel !== -Infinity ? x.araPotansiyel : null));
                const med2026 = calcMedian(src.map(x => x.pot2026 !== -Infinity ? x.pot2026 : null));
                const primaryMed = medAra !== null ? medAra : med2026;
                const primaryMedLabel = medAra !== null ? 'G. B. Medyan Potansiyel' : '2026 Medyan Potansiyel';
                const degCount = src.filter(x => x.hasDegerleme).length;
                card4Html = `
                    <div class="kpi-card">
                        <div class="kpi-icon-box slate"><i class="fas fa-scale-balanced"></i></div>
                        <div class="kpi-info">
                            <div class="kpi-label">${primaryMedLabel}</div>
                            <div class="kpi-value" style="color:${primaryMed !== null ? (primaryMed >= 0 ? 'var(--success-color)' : 'var(--danger-color)') : 'var(--text-primary)'};">${primaryMed !== null ? fmtPct(primaryMed) : '-'}</div>
                            <div class="kpi-sub">${med2026 !== null ? `2026 Medyan: ${fmtPct(med2026)} · ` : ''}${degCount} Analizli${alimZoneCount > 0 ? ` · ${alimZoneCount} Alım Böl.` : ''}</div>
                        </div>
                    </div>
                `;
            } else {
                const medFk = calcMedian(src.map(x => x.fk > 0 ? x.fk : null));
                const medFd = calcMedian(src.map(x => x.fdFavok > 0 ? x.fdFavok : null));
                const medPd = calcMedian(src.map(x => x.pdDd > 0 ? x.pdDd : null));
                const medRoe = calcMedian(src.map(x => x.roe));
                card4Html = `
                    <div class="kpi-card">
                        <div class="kpi-icon-box slate"><i class="fas fa-scale-balanced"></i></div>
                        <div class="kpi-info">
                            <div class="kpi-label">Liste Medyan F/K</div>
                            <div class="kpi-value">${medFk !== null ? fmtDec(medFk) : '-'}</div>
                            <div class="kpi-sub">FD/FAVÖK: ${medFd !== null ? fmtDec(medFd) : '-'} · PD/DD: ${medPd !== null ? fmtDec(medPd) : '-'}${medRoe !== null ? ` · ROE: ${fmtPctDec(medRoe)}` : ''}</div>
                        </div>
                    </div>
                `;
            }

            const gunlukColor = avgGunluk === null ? 'var(--text-primary)' : (avgGunluk > 0 ? 'var(--success-color)' : (avgGunluk < 0 ? 'var(--danger-color)' : 'var(--text-primary)'));
            const gunlukBoxClass = (avgGunluk !== null && avgGunluk < 0) ? 'red' : 'green';
            const leaderSafe = leader ? window.escapeHtml(leader.hisse) : '';

            return `
                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-icon-box navy"><i class="fas fa-binoculars"></i></div>
                        <div class="kpi-info">
                            <div class="kpi-label">Takip & Portföy</div>
                            <div class="kpi-value">${isFiltered ? `${visibleItems.length} / ${allItems.length}` : `${allItems.length} Hisse`}</div>
                            <div class="kpi-sub">${portfoyCount} Portföyde · ${izlemeCount} İzlemede${starCount > 0 ? ` · ${starCount} ★` : ''}</div>
                        </div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon-box ${gunlukBoxClass}"><i class="fas fa-chart-line"></i></div>
                        <div class="kpi-info">
                            <div class="kpi-label">Günlük Nabız</div>
                            <div class="kpi-value" style="color: ${gunlukColor};">${avgGunluk !== null ? fmtPctDec(avgGunluk, true) : '-'}</div>
                            <div class="kpi-sub">${upCount} Yükselen · ${downCount} Düşen${alimZoneCount > 0 ? ` · <strong style="color:#059669;">${alimZoneCount} Alım Böl.</strong>` : ''}</div>
                        </div>
                    </div>
                    <div class="kpi-card ${leader ? 'takip-kpi-clickable' : ''}" ${leader ? `onclick="window.goToHisse('${leaderSafe}')" title="${leaderSafe} detay sayfasına git"` : ''}>
                        <div class="kpi-icon-box green"><i class="fas fa-bullseye"></i></div>
                        <div class="kpi-info">
                            <div class="kpi-label">En Yüksek Potansiyel (${window.escapeHtml(leaderLabel)})</div>
                            <div class="kpi-value" style="color: ${leader ? (leaderPot >= 0 ? 'var(--success-color)' : 'var(--danger-color)') : 'var(--text-primary)'};">${leader ? `${leaderSafe} · ${fmtPct(leaderPot)}` : '-'}</div>
                            <div class="kpi-sub">${leader ? `₺${fmtDec(leader.fiyat)} → ₺${fmtDec(leaderHf)}` : 'Değerleme verisi bulunamadı'}</div>
                        </div>
                    </div>
                    ${card4Html}
                </div>
            `;
        };

        const buildTableHtml = (allItems, visibleItems) => {
            const isDeg = window.takipTab === 'degerleme';
            const isCompactYears = isDeg && window.takipYearMode === 'compact';
            const activeYears = isCompactYears ? ['2026', '2027'] : ['2026', '2027', '2028', '2029', '2030'];

            // Detect predominant G.B. period for header sub-tag
            const periodCounts = {};
            visibleItems.forEach(it => { if (it.araPeriod) periodCounts[it.araPeriod] = (periodCounts[it.araPeriod] || 0) + 1; });
            const topPeriod = Object.entries(periodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

            const sortCol = window.takipSort?.col || null;
            const sortAsc = !!window.takipSort?.asc;
            const thSortAttr = (col, labelTitle) => {
                const isSorted = sortCol === col;
                const dirTxt = isSorted ? (sortAsc ? ' (Artan)' : ' (Azalan)') : '';
                return {
                    cls: `takip-th-sortable${isSorted ? ' takip-th-sorted' : ''}`,
                    title: `${labelTitle || col}${dirTxt}`
                };
            };

            const getHeatClass = (pot) => {
                if (pot === -Infinity || pot === null || isNaN(pot)) return '';
                if (pot >= 1.0) return 'takip-heat-high';
                if (pot >= 0.5) return 'takip-heat-mid';
                if (pot <= -0.15) return 'takip-heat-neg';
                return '';
            };

            const formatGunluk = (val) => {
                if (val === null || val === undefined || isNaN(val)) return `<td style="text-align: right !important;">-</td>`;
                const color = val > 0 ? '#059669' : (val < 0 ? '#dc2626' : 'var(--text-primary)');
                const formatted = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(val));
                const prefix = val > 0 ? '%+' : (val < 0 ? '%-' : '%');
                return `<td style="text-align: right !important; color:${color} !important; font-weight:700;">${prefix}${formatted}</td>`;
            };

            const renderPotPair = (hf, pot, tooltipStr = '') => {
                if (hf === -Infinity || pot === -Infinity) {
                    return `<td style="text-align: right !important;">-</td><td style="text-align: right !important;">-</td>`;
                }
                const color = pot > 0 ? '#059669' : '#dc2626';
                const heatCls = getHeatClass(pot);
                const tt = tooltipStr ? ` title="${window.escapeHtml(tooltipStr)}"` : '';
                return `<td style="text-align: right !important; color:${color} !important; font-weight:700;"${tt}>${fmtDec(hf)}</td><td class="${heatCls}" style="text-align: right !important; color:${color} !important; font-weight:700;"${tt}>${fmtPct(pot)}</td>`;
            };

            const formatNetBorcFavok = (val) => {
                if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return `<td style="text-align: right !important;">-</td>`;
                let color = 'var(--text-muted)';
                let fw = '500';
                if (val <= 0) { color = '#059669'; fw = '700'; }
                else if (val > 5) { color = '#dc2626'; fw = '700'; }
                else if (val > 3) { color = '#d97706'; fw = '600'; }
                const tt = val <= 0 ? 'Net Nakit Pozisyonu' : 'Net Borç / FAVÖK';
                return `<td style="text-align: right !important; color:${color} !important; font-weight:${fw};" title="${tt}">${fmtDec(val)}</td>`;
            };

            const formatMarginCell = (val, highThreshold = 25) => {
                if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return `<td style="text-align: right !important;">-</td>`;
                let color = 'var(--text-muted)';
                let fw = '500';
                if (val >= highThreshold) { color = '#059669'; fw = '700'; }
                else if (val < 0) { color = '#dc2626'; fw = '700'; }
                return `<td style="text-align: right !important; color:${color} !important; font-weight:${fw};">${fmtPctDec(val)}</td>`;
            };

            const colspan = isDeg ? (5 + 2 + activeYears.length * 2) : 15;
            let rowsHtml = '';

            if (allItems.length === 0) {
                rowsHtml = `<tr><td colspan="${colspan}" style="padding: 2.5rem;"><div class="ekstre-empty-state"><i class="fas fa-binoculars"></i><strong>Takip listeniz henüz boş</strong><span>Yukarıdaki kutudan hisse kodu girerek hemen takip etmeye başlayabilirsiniz.</span></div></td></tr>`;
            } else if (visibleItems.length === 0) {
                rowsHtml = `<tr><td colspan="${colspan}" style="padding: 2.5rem;"><div class="ekstre-empty-state"><i class="fas fa-filter"></i><strong>Seçili filtrelere uygun hisse bulunamadı</strong><button type="button" class="ekstre-ghost-btn reset" style="margin-top:6px;" onclick="window.resetTakipFilters()"><i class="fas fa-rotate-left"></i> Filtreleri Sıfırla</button></div></td></tr>`;
            } else {
                visibleItems.forEach((item, i) => {
                    const safeHisse = window.escapeHtml(item.hisse);
                    const safeNotePreview = item.notText ? window.escapeHtml(item.notText.slice(0, 140) + (item.notText.length > 140 ? '…' : '')) : '';

                    const badges = [];
                    if (item.inPortfoy) {
                        const karTxt = `${item.portfoyKarYuzde >= 0 ? '%+' : '%-'}${fmtDec(Math.abs(item.portfoyKarYuzde))}`;
                        badges.push(`<span class="takip-mini-pill takip-pill-portfoy" title="Portföyde · Ağırlık: %${fmtDec(item.portfoyOrani)} · Getiri: ${karTxt}">P %${Math.round(item.portfoyOrani)}</span>`);
                    }
                    if (item.alimBolgesinde) {
                        badges.push(`<span class="takip-mini-pill takip-pill-alim-hit" onclick="window.openTakipDetailModal('${safeHisse}', event)" title="Alım Bölgesinde! Hedef: ₺${fmtDec(item.alimHedefi)}">ALIM</span>`);
                    } else if (item.alimHedefi !== null) {
                        const distTxt = item.alimMesafePct !== null ? ` (+%${fmtDec(item.alimMesafePct)})` : '';
                        badges.push(`<span class="takip-mini-pill takip-pill-alim" onclick="window.openTakipDetailModal('${safeHisse}', event)" title="Alım Hedefi: ₺${fmtDec(item.alimHedefi)}${distTxt}">₺${fmtDec(item.alimHedefi)}</span>`);
                    }
                    if (item.notText) {
                        badges.push(`<span class="takip-mini-pill takip-pill-not" onclick="window.openTakipDetailModal('${safeHisse}', event)" title="Not: ${safeNotePreview}"><i class="fas fa-sticky-note"></i></span>`);
                    }

                    const restHtml = isDeg ? `
                        ${renderPotPair(item.araHedefFiyat, item.araPotansiyel, item.araPeriod ? `Gelecek Bilanço Dönemi: ${item.araPeriod}` : '')}
                        ${activeYears.map(y => renderPotPair(item['hf' + y], item['pot' + y])).join('')}
                    ` : `
                        <td style="text-align: right !important;">${fmtCurrency(item.piyasaDegeri, '₺')}</td>
                        <td style="text-align: right !important;">${fmtCurrency(item.piyasaDegeriUsd, '$')}</td>
                        <td style="text-align: right !important;">${fmtCurrency(item.firmaDegeri, '₺')}</td>
                        <td style="text-align: right !important;">${fmtMet(item.fdFavok)}</td>
                        <td style="text-align: right !important;">${fmtMet(item.fk)}</td>
                        <td style="text-align: right !important;">${fmtMet(item.pdDd)}</td>
                        ${formatNetBorcFavok(item.netBorcFavok)}
                        ${formatMarginCell(item.favokMarji, 25)}
                        ${formatMarginCell(item.netKarMarji, 15)}
                        ${formatMarginCell(item.roe, 30)}
                    `;

                    const targetBtnClass = item.alimBolgesinde ? 'in-zone' : ((item.alimHedefi !== null || item.notText) ? 'has-data' : '');
                    const targetBtnTitle = item.alimBolgesinde
                        ? `Alım Bölgesinde (Hedef: ₺${fmtDec(item.alimHedefi)}) — Düzenle`
                        : ((item.alimHedefi !== null || item.notText) ? 'Alım Hedefi & Notu Düzenle' : 'Alım Hedefi veya Not Ekle');

                    rowsHtml += `
                        <tr data-hisse="${safeHisse}">
                            <td class="takip-sticky-1" style="text-align: center !important;">${i + 1}</td>
                            <td class="takip-sticky-2" style="text-align: left !important;">
                                <div class="takip-symbol-cell">
                                    <div class="takip-symbol-main">
                                        <button type="button" class="takip-star-btn ${item.isStarred ? 'starred' : ''}" onclick="window.toggleTakipStar('${safeHisse}', event)" title="${item.isStarred ? 'Yıldızı kaldır' : 'Öncelikli olarak yıldızla'}">
                                            <i class="${item.isStarred ? 'fas' : 'far'} fa-star"></i>
                                        </button>
                                        <span class="takip-ticker-name" onclick="window.goToHisse('${safeHisse}')">${safeHisse}</span>
                                    </div>
                                    ${badges.length > 0 ? `<div class="takip-symbol-badges">${badges.join('')}</div>` : ''}
                                </div>
                            </td>
                            <td class="takip-sticky-3" style="text-align: right !important; font-weight: 600; color: var(--text-primary) !important;">${item.fiyat > 0 ? fmtDec(item.fiyat) : '-'}</td>
                            ${formatGunluk(item.gunlukYuzde)}
                            ${restHtml}
                            <td style="text-align: center !important;">
                                <div class="ekstre-row-actions">
                                    <button type="button" class="takip-action-btn target ${targetBtnClass}" onclick="window.openTakipDetailModal('${safeHisse}', event)" title="${window.escapeHtml(targetBtnTitle)}">
                                        <i class="fas fa-crosshairs"></i>
                                    </button>
                                    <button type="button" class="takip-action-btn buy" onclick="window.openEkstreModal(null, '${safeHisse}')" title="${safeHisse} için hızlı alım işlemi ekle">
                                        <i class="fas fa-plus-circle"></i>
                                    </button>
                                    <button type="button" class="takip-action-btn remove" onclick="window.removeTakipFromTable('${safeHisse}', event)" title="${safeHisse} takip listesinden çıkar">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
            }

            // Build Median/Average Footer Row
            let tfootHtml = '';
            if (visibleItems.length > 0) {
                const medGunluk = calcMedian(visibleItems.map(x => x.gunlukYuzde));
                const avgGunluk = calcAvg(visibleItems.map(x => x.gunlukYuzde));
                const gunlukFootColor = medGunluk === null ? '' : (medGunluk > 0 ? 'text-success' : (medGunluk < 0 ? 'text-danger' : ''));

                if (isDeg) {
                    const renderPotFoot = (arr) => {
                        const med = calcMedian(arr);
                        const avg = calcAvg(arr);
                        const cls = med === null ? '' : (med >= 0 ? 'text-success' : 'text-danger');
                        const tt = avg !== null ? `Ortalama: ${fmtPct(avg)}` : '';
                        return `<td style="text-align: right !important;">-</td><td class="${cls}" style="text-align: right !important;" title="${tt}">${med !== null ? fmtPct(med) : '-'}</td>`;
                    };
                    tfootHtml = `
                        <tfoot>
                            <tr class="total-row">
                                <td class="takip-sticky-1"></td>
                                <td class="takip-sticky-2" style="text-align: left !important;">MEDYAN (${visibleItems.length})</td>
                                <td class="takip-sticky-3"></td>
                                <td class="${gunlukFootColor}" style="text-align: right !important;" title="${avgGunluk !== null ? 'Ortalama: ' + fmtPctDec(avgGunluk, true) : ''}">${medGunluk !== null ? fmtPctDec(medGunluk, true) : '-'}</td>
                                ${renderPotFoot(visibleItems.map(x => x.araPotansiyel !== -Infinity ? x.araPotansiyel : null))}
                                ${activeYears.map(y => renderPotFoot(visibleItems.map(x => x['pot' + y] !== -Infinity ? x['pot' + y] : null))).join('')}
                                <td></td>
                            </tr>
                        </tfoot>
                    `;
                } else {
                    const renderMetFoot = (arr, formatter, suffix = '') => {
                        const med = calcMedian(arr);
                        const avg = calcAvg(arr);
                        const tt = avg !== null ? `Ortalama: ${formatter(avg)}${suffix}` : '';
                        return `<td style="text-align: right !important;" title="${tt}">${med !== null ? formatter(med) + suffix : '-'}</td>`;
                    };
                    tfootHtml = `
                        <tfoot>
                            <tr class="total-row">
                                <td class="takip-sticky-1"></td>
                                <td class="takip-sticky-2" style="text-align: left !important;">MEDYAN (${visibleItems.length})</td>
                                <td class="takip-sticky-3"></td>
                                <td class="${gunlukFootColor}" style="text-align: right !important;" title="${avgGunluk !== null ? 'Ortalama: ' + fmtPctDec(avgGunluk, true) : ''}">${medGunluk !== null ? fmtPctDec(medGunluk, true) : '-'}</td>
                                ${renderMetFoot(visibleItems.map(x => x.piyasaDegeri > 0 ? x.piyasaDegeri : null), v => fmtCurrency(v, '₺'))}
                                ${renderMetFoot(visibleItems.map(x => x.piyasaDegeriUsd > 0 ? x.piyasaDegeriUsd : null), v => fmtCurrency(v, '$'))}
                                ${renderMetFoot(visibleItems.map(x => x.firmaDegeri > 0 ? x.firmaDegeri : null), v => fmtCurrency(v, '₺'))}
                                ${renderMetFoot(visibleItems.map(x => x.fdFavok > 0 ? x.fdFavok : null), fmtDec)}
                                ${renderMetFoot(visibleItems.map(x => x.fk > 0 ? x.fk : null), fmtDec)}
                                ${renderMetFoot(visibleItems.map(x => x.pdDd > 0 ? x.pdDd : null), fmtDec)}
                                ${renderMetFoot(visibleItems.map(x => x.netBorcFavok), fmtDec)}
                                ${renderMetFoot(visibleItems.map(x => x.favokMarji), fmtPctDec)}
                                ${renderMetFoot(visibleItems.map(x => x.netKarMarji), fmtPctDec)}
                                ${renderMetFoot(visibleItems.map(x => x.roe), fmtPctDec)}
                                <td></td>
                            </tr>
                        </tfoot>
                    `;
                }
            }

            const thHisse = thSortAttr('hisse', 'Hisse Koduna Göre Sırala');
            const thFiyat = thSortAttr('fiyat', 'Güncel Fiyata Göre Sırala');
            const thGunluk = thSortAttr('gunlukYuzde', 'Günlük Değişime Göre Sırala');
            const thAraHf = thSortAttr('araHedefFiyat', topPeriod ? `Gelecek Bilanço (${topPeriod}) Hedef Fiyat` : 'Gelecek Bilanço Hedef Fiyat');
            const thAraPot = thSortAttr('araPotansiyel', topPeriod ? `Gelecek Bilanço (${topPeriod}) Potansiyel` : 'Gelecek Bilanço Potansiyel');

            const degHeadersHtml = `
                <th class="${thAraHf.cls}" onclick="window.toggleTakipSort('araHedefFiyat')" title="${window.escapeHtml(thAraHf.title)}">G. B. H. F.${topPeriod ? `<span class="takip-period-tag">${window.escapeHtml(topPeriod)}</span>` : ''}</th>
                <th class="${thAraPot.cls}" onclick="window.toggleTakipSort('araPotansiyel')" title="${window.escapeHtml(thAraPot.title)}">G. B. Pot.${topPeriod ? `<span class="takip-period-tag">${window.escapeHtml(topPeriod)}</span>` : ''}</th>
                ${activeYears.map(y => {
                    const thHf = thSortAttr('hf' + y, `${y} Hedef Fiyat`);
                    const thPot = thSortAttr('pot' + y, `${y} Potansiyel`);
                    return `
                        <th class="${thHf.cls}" onclick="window.toggleTakipSort('hf${y}')" title="${window.escapeHtml(thHf.title)}">${y} H. F.</th>
                        <th class="${thPot.cls}" onclick="window.toggleTakipSort('pot${y}')" title="${window.escapeHtml(thPot.title)}">${y} Pot.</th>
                    `;
                }).join('')}
            `;

            const oranCols = [
                { col: 'piyasaDegeri', label: 'Piyasa Değeri', title: 'Piyasa Değeri (TL)' },
                { col: 'piyasaDegeriUsd', label: 'Piyasa Değeri $', title: 'Piyasa Değeri (USD)' },
                { col: 'firmaDegeri', label: 'Firma Değeri', title: 'Firma Değeri (TL)' },
                { col: 'fdFavok', label: 'FD/FAVÖK', title: 'Firma Değeri / Yıllıklandırılmış FAVÖK' },
                { col: 'fk', label: 'F/K', title: 'Fiyat / Kazanç' },
                { col: 'pdDd', label: 'PD/DD', title: 'Piyasa Değeri / Defter Değeri' },
                { col: 'netBorcFavok', label: 'Net Borç/FAVÖK', title: 'Net Borç / FAVÖK (Negatif = Net Nakit)' },
                { col: 'favokMarji', label: 'FAVÖK Marjı', title: 'Yıllıklandırılmış FAVÖK / Satışlar (%)' },
                { col: 'netKarMarji', label: 'Net Kâr Marjı', title: 'Yıllıklandırılmış Net Kâr / Satışlar (%)' },
                { col: 'roe', label: 'ROE', title: 'Özsermaye Kârlılığı (%)' }
            ];
            const oranHeadersHtml = oranCols.map(c => {
                const st = thSortAttr(c.col, c.title);
                return `<th class="${st.cls}" onclick="window.toggleTakipSort('${c.col}')" title="${window.escapeHtml(st.title)}">${c.label}</th>`;
            }).join('');

            return `
                <div class="takip-table-scroll">
                    <table class="dash-table compact-table takip-table" style="text-align: center;">
                        <thead style="position: sticky; top: 0; z-index: 10; background: var(--table-header-bg);">
                            <tr>
                                <th class="takip-sticky-1">S.N</th>
                                <th class="takip-sticky-2 ${thHisse.cls}" style="text-align: left !important;" onclick="window.toggleTakipSort('hisse')" title="${window.escapeHtml(thHisse.title)}">Hisse</th>
                                <th class="takip-sticky-3 ${thFiyat.cls}" onclick="window.toggleTakipSort('fiyat')" title="${window.escapeHtml(thFiyat.title)}">Fiyat</th>
                                <th class="${thGunluk.cls}" onclick="window.toggleTakipSort('gunlukYuzde')" title="${window.escapeHtml(thGunluk.title)}">Gün %</th>
                                ${isDeg ? degHeadersHtml : oranHeadersHtml}
                                <th style="width: 96px;">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                        ${tfootHtml}
                    </table>
                </div>
            `;
        };

        const allItems = computeAllTakipData();
        const visibleItems = filterAndSort(allItems);

        const degCount = allItems.filter(x => x.hasDegerleme).length;
        const oranCount = allItems.filter(x => x.hasOran).length;
        const starCount = allItems.filter(x => x.isStarred).length;
        const hasActiveFilters = !!(
            (window.takipSearchQuery && window.takipSearchQuery.trim()) ||
            window.takipFilterSahiplik !== 'all' ||
            window.takipFilterQuick !== 'all' ||
            window.takipFilterYildiz ||
            (window.takipSort && window.takipSort.col)
        );

        container.innerHTML = `
            <div class="page-section active" style="display: flex; flex-direction: column; gap: 0.9rem; padding: 0;">
                <div id="takip-kpi-wrap">
                    ${buildKpiHtml(allItems, visibleItems)}
                </div>

                <div class="glass ekstre-card-shell">
                    <!-- Top Toolbar -->
                    <div class="ekstre-toolbar-top">
                        <div class="ekstre-tab-group">
                            <button type="button" class="ekstre-tab-pill ${window.takipTab === 'degerleme' ? 'active' : ''}" onclick="window.setTakipTab('degerleme')">
                                <i class="fas fa-bullseye"></i>
                                <span>Değerleme</span>
                                <span class="ekstre-tab-count">${degCount}</span>
                            </button>
                            <button type="button" class="ekstre-tab-pill ${window.takipTab === 'oranlar' ? 'active' : ''}" onclick="window.setTakipTab('oranlar')">
                                <i class="fas fa-chart-pie"></i>
                                <span>Oranlar</span>
                                <span class="ekstre-tab-count">${oranCount}</span>
                            </button>
                        </div>

                        <div style="display: flex; align-items: center; gap: 0.55rem; flex-wrap: wrap;">
                            <form class="takip-quick-add-form" onsubmit="window.quickAddTakipHisse(event)">
                                <input type="text" id="takip-quick-add-input" class="takip-quick-add-input" list="bist-hisse-list" placeholder="Hisse ekle (Örn: AKSA)" autocomplete="off">
                                <button type="submit" class="btn ekstre-primary-cta" style="height: 36px; padding: 0 0.85rem;">
                                    <i class="fas fa-plus" style="color: #ffffff !important;"></i>
                                    <span>Ekle</span>
                                </button>
                            </form>
                            <span id="takip-edit-btn" class="fas fa-pen" style="color: var(--text-secondary); cursor: pointer; font-size: 13px; width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; background: #ffffff; border: 1px solid #cbd5e1;" title="Takip Listesini Toplu Düzenle" onclick="window.toggleTakipEditModal(event)"></span>
                        </div>
                    </div>

                    <!-- Filter Bar -->
                    <div class="ekstre-filter-bar">
                        <div class="ekstre-filter-left">
                            <div class="ekstre-search-wrap">
                                <i class="fas fa-search"></i>
                                <input type="text" id="takip-search-input" class="ekstre-search-input" placeholder="Hisse veya not ara..." value="${window.escapeHtml(window.takipSearchQuery || '')}" oninput="window.filterTakipTable(this.value)">
                                <button type="button" id="takip-search-clear-btn" class="ekstre-search-clear" style="display: ${window.takipSearchQuery ? 'inline-flex' : 'none'};" onclick="const inp=document.getElementById('takip-search-input'); if(inp){inp.value=''; inp.focus();} window.filterTakipTable('');" title="Aramayı temizle">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>

                            <div class="ekstre-segmented" role="group" aria-label="Portföy filtresi">
                                <button type="button" class="ekstre-seg-btn ${window.takipFilterSahiplik === 'all' ? 'active' : ''}" onclick="window.setTakipFilter('sahiplik', 'all')">Tümü</button>
                                <button type="button" class="ekstre-seg-btn ${window.takipFilterSahiplik === 'portfoy' ? 'active' : ''}" onclick="window.setTakipFilter('sahiplik', 'portfoy')">Portföyde</button>
                                <button type="button" class="ekstre-seg-btn ${window.takipFilterSahiplik === 'izleme' ? 'active' : ''}" onclick="window.setTakipFilter('sahiplik', 'izleme')">İzlemede</button>
                            </div>

                            <button type="button" class="takip-star-filter-btn ${window.takipFilterYildiz ? 'active' : ''}" onclick="window.setTakipFilter('yildiz', ${!window.takipFilterYildiz})" title="Sadece yıldızlı hisseleri göster">
                                <i class="${window.takipFilterYildiz ? 'fas' : 'far'} fa-star" style="color: #f59e0b;"></i>
                                <span>Yıldızlı${starCount > 0 ? ` (${starCount})` : ''}</span>
                            </button>

                            <select class="ekstre-select" aria-label="Hızlı filtre" onchange="window.setTakipFilter('quick', this.value)">
                                <option value="all" ${window.takipFilterQuick === 'all' ? 'selected' : ''}>Tüm Fırsatlar</option>
                                <option value="alim_bolgesi" ${window.takipFilterQuick === 'alim_bolgesi' ? 'selected' : ''}>Alım Bölgesindekiler</option>
                                <option value="alim_tanimli" ${window.takipFilterQuick === 'alim_tanimli' ? 'selected' : ''}>Alım Hedefi Tanımlılar</option>
                                <option value="pozitif_pot" ${window.takipFilterQuick === 'pozitif_pot' ? 'selected' : ''}>Pozitif Potansiyelli</option>
                                <option value="yuksek_pot" ${window.takipFilterQuick === 'yuksek_pot' ? 'selected' : ''}>%50+ Yüksek Potansiyel</option>
                                <option value="yukselen" ${window.takipFilterQuick === 'yukselen' ? 'selected' : ''}>Bugün Yükselenler</option>
                                <option value="dusen" ${window.takipFilterQuick === 'dusen' ? 'selected' : ''}>Bugün Düşenler (Fırsat)</option>
                                <option value="degerlemeli" ${window.takipFilterQuick === 'degerlemeli' ? 'selected' : ''}>Değerlemesi Olanlar</option>
                                <option value="notlu" ${window.takipFilterQuick === 'notlu' ? 'selected' : ''}>Notu Olanlar</option>
                            </select>
                        </div>

                        <div class="ekstre-filter-right">
                            ${window.takipTab === 'degerleme' ? `
                            <div class="ekstre-segmented" role="group" aria-label="Yıl görünümü">
                                <button type="button" class="ekstre-seg-btn ${window.takipYearMode === 'compact' ? 'active' : ''}" onclick="window.setTakipFilter('yearMode', 'compact')" title="Gelecek Bilanço + 2026 ve 2027">Özet</button>
                                <button type="button" class="ekstre-seg-btn ${window.takipYearMode !== 'compact' ? 'active' : ''}" onclick="window.setTakipFilter('yearMode', 'all')" title="2026–2030 tüm yıllar">Tüm Yıllar</button>
                            </div>
                            ` : ''}

                            <button type="button" class="takip-pin-toggle-btn ${window.takipPinStars ? 'active' : ''}" onclick="window.setTakipFilter('pinStars', ${!window.takipPinStars})" title="Yıldızlı hisseleri tablonun en üstünde sabitle">
                                <i class="fas fa-thumbtack"></i>
                                <span>★ Üstte</span>
                            </button>

                            <span id="takip-reset-wrap" style="display: ${hasActiveFilters ? 'inline-flex' : 'none'};">
                                <button type="button" class="ekstre-ghost-btn reset" onclick="window.resetTakipFilters()" title="Tüm filtre ve sıralamayı sıfırla">
                                    <i class="fas fa-rotate-left"></i>
                                    <span>Sıfırla</span>
                                </button>
                            </span>
                        </div>
                    </div>

                    <div id="takip-table-wrap">
                        ${buildTableHtml(allItems, visibleItems)}
                    </div>
                </div>
            </div>
        `;

        window.updateTakipViewOnly = () => {
            const kpiWrap = document.getElementById('takip-kpi-wrap');
            const tableWrap = document.getElementById('takip-table-wrap');
            if (!kpiWrap || !tableWrap) {
                if (typeof renderPage === 'function') renderPage();
                return;
            }
            const freshAll = computeAllTakipData();
            const freshVisible = filterAndSort(freshAll);
            kpiWrap.innerHTML = buildKpiHtml(freshAll, freshVisible);
            tableWrap.innerHTML = buildTableHtml(freshAll, freshVisible);

            const clearBtn = document.getElementById('takip-search-clear-btn');
            if (clearBtn) clearBtn.style.display = window.takipSearchQuery ? 'inline-flex' : 'none';

            const resetWrap = document.getElementById('takip-reset-wrap');
            if (resetWrap) {
                const anyActive = !!(
                    (window.takipSearchQuery && window.takipSearchQuery.trim()) ||
                    window.takipFilterSahiplik !== 'all' ||
                    window.takipFilterQuick !== 'all' ||
                    window.takipFilterYildiz ||
                    (window.takipSort && window.takipSort.col)
                );
                resetWrap.style.display = anyActive ? 'inline-flex' : 'none';
            }

            // Update star count badge on the star filter button if present
            const starBtnSpan = document.querySelector('.takip-star-filter-btn span');
            if (starBtnSpan) {
                const sc = freshAll.filter(x => x.isStarred).length;
                starBtnSpan.textContent = sc > 0 ? `Yıldızlı (${sc})` : 'Yıldızlı';
            }
        };
    } catch (err) {
        container.innerHTML = `<div style="padding: 20px; color: var(--danger-color); font-family: monospace; font-size: 14px;">
            <h3>Takip Listesi Yüklenirken Hata Oluştu!</h3>
            <p>${err.message}</p>
            <pre style="margin-top: 10px; color: #991b1b;">${err.stack}</pre>
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
            window.showToast('Lütfen geçerli bir BİST hisse kodu giriniz veya listeden seçiniz.', 'warning');
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

window.forceSyncToWeb = async () => {
    if (!currentUser) {
        window.showToast("Web'e eşitlemek için giriş yapmalısınız!", 'warning');
        return;
    }
    if (!State.data || !State.data.ekstre || State.data.ekstre.length === 0) {
        window.showToast("Eşitlenecek yerel veri bulunamadı!", 'warning');
        return;
    }
    if (await window.showConfirm("Bu işlem bilgisayarınızdaki TÜM verileri zorla Web'e yükleyecek. Emin misiniz?", "Evet, Yükle")) {
        State.data.dataUpdated = Date.now();
        State.data.lastUpdated = Date.now() + (1000 * 60 * 60 * 24 * 365 * 10);
        State.pruneHisseFiyatlari();
        db.collection('app_data').doc(currentUser.uid).set(State.data).then(() => {
            window.showToast("Verileriniz başarıyla Web'e yüklendi!", 'success');
        }).catch(err => {
            window.showToast("Hata oluştu: " + err.message, 'error');
        });
    }
};

window.importData = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
        try {
            const importedData = JSON.parse(ev.target.result);
            if (!importedData || typeof importedData !== 'object') throw new Error("Geçersiz veri");

            if (await window.showConfirm("Dosyadan yüklediğiniz veriler mevcut verilerinizle BİRLEŞTİRECEK. Onaylıyor musunuz?", "Evet, Birleştir")) {
                const mergeData = (target, source) => {
                    for (const key of Object.keys(source)) {
                        if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
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
                window.showToast("Veriler başarıyla birleştirildi!", "success");
                if (typeof renderPage === 'function') renderPage();
            }
        } catch (err) {
            window.showToast("Dosya okunamadı: " + err.message, "error");
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
            window.showToast(hisseKodu + ' takip listesinde bulunamadı!', 'warning');
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

window.removeTakip = async (hisse) => {
    if (!hisse) return;
    if (await window.showConfirm(hisse + ' hissesini takip listesinden çıkarmak istediğinize emin misiniz?')) {
        State.removeTakip(hisse);
        window.currentSelectedHisse = null;
        if (typeof window.updateGlobalHisseDropdown === 'function') window.updateGlobalHisseDropdown();
        if (typeof renderPage === 'function') renderPage();
        window.showToast(hisse + ' takip listesinden çıkarıldı.', 'info');
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
            dropdownHtml += `<div class="hisse-menu-item" style="padding: 0.3rem 0.8rem; cursor: pointer; border-bottom: 1px solid var(--table-border); font-size: 13px; color: var(--text-primary);" onclick="window.openHisseFromDropdown('${h}')">${h}</div>`;
        });
        dropdownHtml += `<div style="display:flex; justify-content:flex-end; align-items:center; padding: 0.3rem 0.8rem;">
            <div style="font-size: 1rem; font-weight:bold; cursor: pointer; color: var(--accent-color);" onclick="document.getElementById('hisse-modal').style.display='flex'; window.hideHisseDropdown(); document.getElementById('modal-hisse-input').focus();">+</div>
            <div style="font-size: 1.5rem; font-weight:bold; cursor: pointer; color: var(--danger-color); margin-top:-4px;" onclick="window.openRemoveModal()">-</div>
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
            const isCollapsed = sidebar.classList.toggle('collapsed');
            sidebar.classList.toggle('expanded', !isCollapsed);
            try { localStorage.setItem('yunvest_sidebar_collapsed', String(isCollapsed)); } catch (e) {}
        }
    }
};

window.toggleUserMenu = (e) => {
    if (e) e.stopPropagation();
    const card = document.getElementById('user-dropdown-card');
    const pill = document.getElementById('user-name-btn');
    if (!card || !pill) return;
    const isOpen = card.classList.toggle('open');
    pill.classList.toggle('open', isOpen);
};

window.closeUserMenu = () => {
    const card = document.getElementById('user-dropdown-card');
    const pill = document.getElementById('user-name-btn');
    if (card) card.classList.remove('open');
    if (pill) pill.classList.remove('open');
};

document.addEventListener('click', (e) => {
    const wrap = document.getElementById('user-menu-wrap');
    if (wrap && !wrap.contains(e.target)) {
        window.closeUserMenu();
    }
});

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
    // update active nav (both desktop sidebar & mobile bottom nav)
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll(`.nav-btn[data-target="${currentPage}"]`).forEach(b => b.classList.add('active'));

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

    // Market Ticker Strip visibility + Fixed Dark Top Header Active Page Badge
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
        topBar.classList.toggle('ticker-hidden', currentPage !== 'anasayfa');
    }
    const headerTitleEl = document.getElementById('header-active-title');
    const headerIconEl = document.getElementById('header-active-icon');
    const pageMeta = {
        anasayfa: { title: 'Takip Listesi', icon: 'fas fa-list-ul' },
        hisse_degerleme: { title: window.currentSelectedHisse ? `${window.currentSelectedHisse} · Değerleme` : 'Hisse Değerleme', icon: 'fas fa-gem' },
        analizler: { title: 'Analizler', icon: 'fas fa-magnifying-glass-chart' },
        portfoy: { title: 'Portföy', icon: 'fas fa-briefcase' },
        hisse_islemleri: { title: 'Ekstreler', icon: 'fas fa-receipt' },
        veriler: { title: 'Enflasyon Verileri', icon: 'fas fa-chart-line' },
        notlar: { title: 'Notlarım', icon: 'fas fa-sticky-note' },
        ayarlar: { title: 'Hesap Ayarları', icon: 'fas fa-user-cog' },
        hisse_detay: { title: window.currentSelectedHisse || 'Hisse Detay', icon: 'fas fa-chart-bar' }
    };
    const meta = pageMeta[currentPage] || { title: 'YUNVest', icon: 'fas fa-chart-pie' };
    if (headerTitleEl) headerTitleEl.textContent = meta.title;
    if (headerIconEl) headerIconEl.className = meta.icon;

    switch (currentPage) {
        case 'anasayfa': renderAnasayfa(container); break;
        case 'hisse_degerleme': {
            if (!window.currentSelectedHisse) {
                const takipSorted = (State.data && State.data.takipListesi ? [...State.data.takipListesi] : []).sort((a, b) => a.localeCompare(b));
                const degKeys = Object.keys((State.data && State.data.degerleme) || {}).sort((a, b) => a.localeCompare(b));
                const stockKeys = Object.keys(window.stockData || {}).sort((a, b) => a.localeCompare(b));
                window.currentSelectedHisse = takipSorted.find(s => degKeys.includes(s)) || takipSorted[0] || degKeys[0] || stockKeys[0] || 'AKSA';
            }
            window.currentHisseTab = 'Değerleme';
            if (headerTitleEl) headerTitleEl.textContent = `${window.currentSelectedHisse} · Değerleme`;
            renderHisseler(container);
            break;
        }
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
            <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: var(--text-primary);">Notlarım</h2>
            <button class="btn" style="background: var(--accent-color); color: #fff;" onclick="window.openNoteModal()"><i class="fas fa-plus"></i> Yeni Not Ekle</button>
        </div>
        <div id="notes-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; align-items: start; margin-top: -10px;">
        </div>
    `;

    const grid = document.getElementById('notes-grid');
    const notes = State.data.notlar || [];

    if (notes.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 4rem 1rem; background: var(--surface-color); border-radius: 12px; border: 1px dashed var(--input-border);">
            <i class="fas fa-sticky-note" style="font-size: 3rem; opacity: 0.5; margin-bottom: 1rem;"></i><br>
            Henüz hiç not eklemediniz.<br>
            <span style="font-size: 0.9rem; opacity: 0.7;">Fikirlerinizi, al-sat stratejilerinizi veya hatırlatıcılarınızı buraya kaydedebilirsiniz.</span>
        </div>`;
    } else {
        notes.sort((a, b) => b.timestamp - a.timestamp).forEach(note => {
            const card = document.createElement('div');
            card.className = 'dash-card';
            card.style.cssText = `position: relative; display: flex; flex-direction: column; background: var(--surface-color); padding: 1.5rem; border-radius: 12px; border-left: 4px solid ${note.color || 'var(--accent-color)'}; box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06); transition: transform 0.2s, box-shadow 0.2s;`;
            card.onmouseover = () => { card.style.transform = 'translateY(-3px)'; card.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.12)'; };
            card.onmouseout = () => { card.style.transform = 'none'; card.style.boxShadow = '0 2px 10px rgba(15, 23, 42, 0.06)'; };

            const dateStr = new Date(note.timestamp).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

            const urlRegex = /(https?:\/\/[^\s<]+)/g;
            const formattedContent = (note.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>').replace(urlRegex, '<a href="$1" target="_blank" style="color: var(--accent-color); text-decoration: underline;">$1</a>');
            const formattedTitle = (note.title || 'Başlıksız').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem;">
                    <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: var(--text-primary); word-break: break-word;">${formattedTitle}</h3>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: -0.2rem; margin-right: -0.5rem;">
                        <button class="btn" style="background: transparent; color: var(--danger-color); padding: 0.25rem 0.5rem; font-size: 13.5px;" onclick="window.deleteNote('${note.id}')" title="Sil"><i class="fas fa-trash-alt"></i></button>
                        <div style="position: relative;">
                            <button class="btn" style="background: transparent; color: var(--text-secondary); padding: 0.25rem 0.5rem; font-size: 13.5px;" onclick="window.toggleNoteColorMenu('${note.id}', event)" title="Renk Seçenekleri"><i class="fas fa-ellipsis-v"></i></button>
                            <div id="note-color-menu-${note.id}" style="display: none; position: absolute; right: 0; top: 100%; background: var(--dropdown-bg); border: 1px solid var(--surface-border); border-radius: 8px; box-shadow: var(--shadow-lg); z-index: 10; padding: 0.5rem; min-width: 150px;">
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
                <div id="note-content-display-${note.id}" style="color: var(--text-secondary); font-size: 14px; line-height: 1.6; word-break: break-word; margin-bottom: 6px; cursor: text;" ondblclick="window.enterNoteEditMode('${note.id}')">${formattedContent}</div>
                <textarea id="note-content-edit-${note.id}" class="form-control" style="display:none; width: 100%; font-size: 14px; line-height: 1.6; font-family: inherit; resize: vertical; margin-bottom: 6px; min-height: 100px; box-sizing: border-box;" onblur="window.saveNoteInline('${note.id}')"></textarea>
                <div style="font-size: 12px; color: var(--text-secondary); text-align: right; border-top: 1px solid var(--table-border); padding-top: 6px; margin-bottom: -0.5rem;"><i class="far fa-clock"></i> ${dateStr}</div>
            `;
            grid.appendChild(card);
        });
    }

    if (!document.getElementById('note-modal')) {
        const modal = document.createElement('div');
        modal.id = 'note-modal';
        modal.className = 'app-container';
        modal.style.cssText = 'display: none; justify-content: center; align-items: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(4px); z-index: 2000; opacity: 0; transition: opacity 0.3s;';
        modal.innerHTML = `
            <div class="glass" style="width: 92%; max-width: 500px; height: min(680px, 86vh); display: flex; flex-direction: column; padding: 1.25rem; border-radius: 12px; position: relative; transform: scale(0.95); transition: transform 0.3s;">
                <h3 id="note-modal-title" style="margin-top: 0; margin-bottom: 0.85rem; color: var(--text-primary); font-size: 18px; flex-shrink: 0;">Yeni Not Ekle</h3>
                <input type="hidden" id="note-id-input" value="">
                <input type="text" id="note-title-input" placeholder="Not Başlığı (İsteğe bağlı)" style="width: 100%; padding: 0.6rem 0.75rem; margin-bottom: 0.6rem; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 8px; color: var(--text-primary); outline: none; font-size: 15px; flex-shrink: 0;">
                <textarea id="note-content-input" placeholder="Notunuzu buraya yazın..." style="width: 100%; flex: 1; padding: 0.65rem 0.75rem; margin-bottom: 0.65rem; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 8px; color: var(--text-primary); outline: none; font-family: inherit; font-size: 14px; resize: none; line-height: 1.5;"></textarea>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.85rem; align-items: center; flex-shrink: 0;">
                    <label style="color: var(--text-secondary); font-size: 13.5px; font-weight: 500;">Etiket Rengi:</label>
                    <div style="display: flex; gap: 0.35rem;" id="note-color-picker">
                        <div class="color-swatch active" data-color="#3498db" style="width:18px; height:18px; border-radius:50%; background:#3498db; cursor:pointer; border: 2px solid #0f172a;"></div>
                        <div class="color-swatch" data-color="#2ecc71" style="width:18px; height:18px; border-radius:50%; background:#2ecc71; cursor:pointer; border: 2px solid transparent;"></div>
                        <div class="color-swatch" data-color="#e74c3c" style="width:18px; height:18px; border-radius:50%; background:#e74c3c; cursor:pointer; border: 2px solid transparent;"></div>
                        <div class="color-swatch" data-color="#f1c40f" style="width:18px; height:18px; border-radius:50%; background:#f1c40f; cursor:pointer; border: 2px solid transparent;"></div>
                        <div class="color-swatch" data-color="#9b59b6" style="width:18px; height:18px; border-radius:50%; background:#9b59b6; cursor:pointer; border: 2px solid transparent;"></div>
                    </div>
                    <input type="hidden" id="note-color-input" value="#3498db">
                </div>
                <div style="display: flex; gap: 0.6rem; flex-shrink: 0;">
                    <button class="btn" style="flex: 1; background: var(--success-color); padding: 0.55rem; font-size: 14px;" onclick="window.saveNote()"><i class="fas fa-check"></i> Kaydet</button>
                    <button class="btn" style="flex: 1; background: var(--overlay-hover); color: var(--text-primary); border: 1px solid var(--surface-border); box-shadow: none; padding: 0.55rem; font-size: 14px;" onclick="window.closeNoteModal()">İptal</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.querySelectorAll('#note-color-picker .color-swatch').forEach(sw => {
            sw.addEventListener('click', (e) => {
                document.querySelectorAll('#note-color-picker .color-swatch').forEach(s => s.style.border = '2px solid transparent');
                e.target.style.border = '2px solid #0f172a';
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
        swatches[0].style.border = '2px solid #0f172a';
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
        setTimeout(() => contentInput.style.borderColor = 'var(--input-border)', 2000);
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

window.deleteNote = async (id) => {
    if (!(await window.showConfirm('Bu notu silmek istediğinize emin misiniz?'))) return;
    if (State.data.notlar) {
        State.data.notlar = State.data.notlar.filter(n => n.id !== id);
        State.save();
        if (currentPage === 'notlar') renderPage();
        window.showToast('Not silindi.', 'info');
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

window.isFetchingTickerData = false;
window.fetchTickerData = async () => {
    if (window.isFetchingTickerData) return;
    window.isFetchingTickerData = true;
    try {
        let tData = {};
        try {
            const trRes = await window.fetchWithTimeout('https://scanner.tradingview.com/global/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ symbols: { tickers: ['OANDA:XAUUSD', 'FX:USDTRY', 'FX_IDC:EURTRY'] }, columns: ['close', 'change'] })
            });
            if (trRes.ok) {
                const trJson = await trRes.json();
                const usd = trJson.data.find(x => x.s === 'FX:USDTRY');
                const eur = trJson.data.find(x => x.s === 'FX_IDC:EURTRY');
                const ons = trJson.data.find(x => x.s === 'OANDA:XAUUSD');

                window.latestMarketBenchmarks = window.latestMarketBenchmarks || {};
                if (usd) {
                    tData['USD'] = { Selling: usd.d[0].toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), Change: usd.d[1] };
                    window.latestMarketBenchmarks.dolar = Number(usd.d[0].toFixed(2));
                }
                if (eur) tData['EUR'] = { Selling: eur.d[0].toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), Change: eur.d[1] };
                if (ons) tData['ons'] = { Selling: ons.d[0].toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), Change: ons.d[1] };

                if (usd && ons) {
                    const graPrice = (ons.d[0] * usd.d[0]) / 31.1035;
                    const graChange = ((1 + ons.d[1] / 100) * (1 + usd.d[1] / 100) - 1) * 100;
                    tData['gram-altin'] = { Selling: graPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), Change: graChange };
                    window.latestMarketBenchmarks.gramAltin = Number(graPrice.toFixed(2));
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
                        const badgeCls = change > 0 ? 'pos' : (change < 0 ? 'neg' : 'flat');
                        let displayChange = isNaN(change) ? '0,00' : change.toFixed(2).replace('.', ',');
                        if (change > 0 && !displayChange.startsWith('+')) displayChange = '+' + displayChange;
                        changeHtml = `<span class="ticker-change-badge ${badgeCls}">%${displayChange}</span>`;
                    }

                    const val = item.data.Selling || item.data.Buying || 0;

                    return `<div class="ticker-pill-item">
                        <span class="ticker-pill-label">${item.label}</span>
                        <div class="ticker-pill-value-row">
                            <span>${val}</span> ${changeHtml}
                        </div>
                    </div>`;
                }).join('');
            }
        };

        // İlk render (Truncgil verileri + Loading yazıları)
        renderTicker();

        const fetchTV = async (market, symbol) => {
            try {
                const r = await window.fetchWithTimeout(`https://scanner.tradingview.com/${market}/scan`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ symbols: { tickers: [symbol] }, columns: ['close', 'change'] }),
                    timeout: 2500
                });
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
            if (x) {
                xu100 = x;
                window.latestMarketBenchmarks = window.latestMarketBenchmarks || {};
                const parsedXu = parseFloat(String(x.Selling).replace(/\./g, '').replace(',', '.'));
                if (!isNaN(parsedXu)) window.latestMarketBenchmarks.bist100 = Number(parsedXu.toFixed(2));
            }
            if (b) brent = b;
            renderTicker();
        });

    } catch (e) {
        console.error('Ticker verisi alınamadı:', e);
    } finally {
        window.isFetchingTickerData = false;
    }
};

let isAppInitialized = false;
const initApp = () => {
    if (isAppInitialized) return;
    isAppInitialized = true;

    ensureDatalist();

    document.documentElement.setAttribute('data-theme', 'light');
    document.body.setAttribute('data-theme', 'light');
    try { localStorage.setItem('borsa_theme', 'light'); localStorage.setItem('yunvest_theme', 'light'); } catch (e) {}

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
    document.getElementById('auth-submit-btn').innerText = isLoginMode ? 'Sisteme Giriş Yap' : 'Kayıt Ol';
    document.getElementById('auth-toggle').innerHTML = isLoginMode ?
        'Hesabınız yok mu? <span>Kayıt Olun</span>' :
        'Zaten hesabınız var mı? <span>Giriş Yapın</span>';

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
            else window.showToast(err.message, 'error');
            btn.innerText = originalBtnText;
            btn.disabled = false;
        });
    } else {
        if (errorDiv) { errorDiv.style.display = 'block'; errorDiv.innerText = "Yeni üye alımı güvenlik nedeniyle kapatılmıştır."; }
        else window.showToast("Yeni üye alımı güvenlik nedeniyle kapatılmıştır.", "warning");
        btn.innerText = originalBtnText;
        btn.disabled = false;
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('borsa_app_data');
    localStorage.removeItem('yunvest_cloud_financials_v1');
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
        window.currentUser = user;
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        let displayName = user.displayName;
        if (!displayName && user.email) {
            displayName = user.email.split('@')[0];
            displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        }
        const unEl = document.getElementById('user-name');
        const finalName = displayName || 'Kullanıcı';
        if (unEl) unEl.innerText = finalName;
        const avatarEl = document.getElementById('user-avatar-letter');
        if (avatarEl) avatarEl.innerText = finalName.charAt(0).toUpperCase();
        const ddNameEl = document.getElementById('dropdown-user-name');
        if (ddNameEl) ddNameEl.innerText = finalName;
        const ddEmailEl = document.getElementById('dropdown-user-email');
        if (ddEmailEl) ddEmailEl.innerText = user.email || '';

        // Restore persisted sidebar collapse state on desktop
        try {
            const sidebar = document.getElementById('primary-sidebar');
            if (sidebar && window.innerWidth > 768 && localStorage.getItem('yunvest_sidebar_collapsed') === 'true') {
                sidebar.classList.add('collapsed');
                sidebar.classList.remove('expanded');
            }
        } catch (e) {}

        window.setTheme = () => {
            document.documentElement.setAttribute('data-theme', 'light');
            document.body.setAttribute('data-theme', 'light');
            try { localStorage.setItem('borsa_theme', 'light'); localStorage.setItem('yunvest_theme', 'light'); } catch (e) {}
        };
        initApp();
        if (typeof window.initCloudFinancialsSync === 'function') window.initCloudFinancialsSync();
        State.init(renderPage);
    } else {
        currentUser = null;
        window.currentUser = null;
        if (window._unsubscribeCloudFinancials) {
            try { window._unsubscribeCloudFinancials(); } catch (e) { }
            window._unsubscribeCloudFinancials = null;
        }
        if (window._pdfBlobCache) {
            Object.values(window._pdfBlobCache).forEach(url => { try { URL.revokeObjectURL(url); } catch (e) {} });
            window._pdfBlobCache = {};
        }
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
            div.onmouseover = () => div.style.background = 'var(--overlay-bg)';
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
        dropdown.innerHTML = '<div style="padding: 0.5rem; color: var(--text-secondary); font-size: 13px; white-space: nowrap; text-align: center;">Listeniz boş</div>';
    } else {
        dropdown.innerHTML = takipList.map(hisse =>
            `<button class="nav-btn" style="text-align: left; width: 100%; border-radius: 6px; font-size: 13.5px; padding: 0.5rem 1rem;" onclick="window.goToHisse('${hisse}'); if(window.hideSidebarTakip) window.hideSidebarTakip(true);">${hisse}</button>`
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

    const allHisseler = new Set([
        ...Object.keys(State.data.degerleme || {}),
        ...Object.keys(State.data.araDegerleme || {})
    ]);

    for (const hisse of allHisseler) {
        const ctx = window.getDegerlemeStockContext(hisse);
        if (!ctx.sData) continue;

        State.data.hedefFiyatlar[hisse] = {};

        const years = ['2026', '2027', '2028', '2029', '2030'];
        if (State.data.degerleme && State.data.degerleme[hisse]) {
            years.forEach(y => {
                const d = State.data.degerleme[hisse][y];
                if (!d) return;
                const res = window.computeDegerlemePeriod(y, d, ctx);
                if (res.hasHedef) {
                    State.data.hedefFiyatlar[hisse][y] = {
                        hedefFiyat: res.hedefFiyatTL,
                        potansiyel: res.potansiyelRatio !== null ? res.potansiyelRatio : 0
                    };
                } else {
                    delete State.data.hedefFiyatlar[hisse][y];
                }
            });
        }

        if (State.data.araDegerleme && State.data.araDegerleme[hisse]) {
            Object.keys(State.data.araDegerleme[hisse]).forEach(y => {
                const d = State.data.araDegerleme[hisse][y];
                if (!d) return;
                const res = window.computeDegerlemePeriod(y, d, ctx);
                if (res.hasHedef) {
                    State.data.hedefFiyatlar[hisse][y] = {
                        hedefFiyat: res.hedefFiyatTL,
                        potansiyel: res.potansiyelRatio !== null ? res.potansiyelRatio : 0
                    };
                } else {
                    delete State.data.hedefFiyatlar[hisse][y];
                }
            });
        }
    }
};


window.uploadRapor = async () => {
    const fileInput = document.getElementById('upload-file');
    const hisse = window.currentSelectedHisse || (State.ui && State.ui.selectedHisse);
    const ad = document.getElementById('upload-ad')?.value.trim() || '';
    const tarih = document.getElementById('upload-tarih')?.value.trim() || '';
    const sirket = document.getElementById('upload-sirket')?.value.trim() || '';
    const status = document.getElementById('upload-status');

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        if (status) { status.style.color = 'var(--danger-color)'; status.innerText = 'Lütfen bir dosya seçin.'; }
        return;
    }
    if (!hisse) {
        if (status) { status.style.color = 'var(--danger-color)'; status.innerText = 'Lütfen Hisse kodunu doldurun.'; }
        return;
    }

    if (status) { status.style.color = 'var(--text-primary)'; status.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Firebase'e yükleniyor, lütfen bekleyin...`; }

    try {
        await window.uploadPdfToFirebase(fileInput.files[0], hisse, {
            name: ad || fileInput.files[0].name.replace(/\.pdf$/i, ''),
            tarih: tarih || new Date().toISOString().split('T')[0],
            company: sirket || '-'
        });
        if (status) {
            status.style.color = 'var(--success-color)';
            status.innerHTML = `<i class="fas fa-check-circle"></i> Dosyanız Firebase'e başarıyla yüklendi.`;
        }
        window.showToast('PDF raporu Firebase\'e yüklendi.', 'success');
        fileInput.value = '';
        const label = fileInput.previousElementSibling;
        if (label) label.innerHTML = '<i class="fas fa-folder-open"></i> Bir Dosya Seç';
        if (document.getElementById('upload-sn')) document.getElementById('upload-sn').value = '';
        if (document.getElementById('upload-ad')) document.getElementById('upload-ad').value = '';
        if (document.getElementById('upload-tarih')) document.getElementById('upload-tarih').value = '';
        if (document.getElementById('upload-sirket')) document.getElementById('upload-sirket').value = '';
        if (typeof renderPage === 'function') renderPage();
    } catch (error) {
        console.error('Upload Error:', error);
        if (status) {
            status.style.color = 'var(--danger-color)';
            status.innerHTML = `<i class="fas fa-times-circle"></i> Hata: ${window.escapeHtml(error.message || 'Yükleme hatası')}`;
        }
        window.showToast(error.message || 'Yükleme sırasında hata oluştu.', 'error');
    }
};

// Takip listesi linkleri icin ozel CSS
(function () {
    if (!document.getElementById('takip-link-style')) {
        const style = document.createElement('style');
        style.id = 'takip-link-style';
        style.textContent = `
            table td.takip-hisse-link[onclick] {
                color: var(--text-primary) !important;
                font-weight: 500 !important;
                cursor: pointer !important;
                text-decoration: none !important;
                transition: color 0.2s ease !important;
            }
            table td.takip-hisse-link[onclick]:hover {
                color: var(--accent-color) !important;
                text-decoration: underline !important;
            }
            .takip-table th {
                color: var(--text-primary) !important;
            }
        `;
        document.head.appendChild(style);
    }
})();
