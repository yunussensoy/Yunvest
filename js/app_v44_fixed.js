
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
    } catch(e) {
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
    const rightArrow = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor:pointer; color:#fff;"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

    let html = `<div style="background:#111216; border-radius:12px; border:1px solid rgba(255,255,255,0.05); overflow:hidden; font-family:var(--font-family);">
        <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; color:#fff; font-size:13px; text-align:right;">
                <thead>
                    <tr style="background:#111216; border-bottom:1px solid rgba(255,255,255,0.05);">
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
        html += `<th style="text-align:${i===0 ? 'left' : 'center'}; font-weight: 500;">${h}</th>`;
    });
    html += `</tr></thead><tbody>`;
    rows.forEach(r => {
        html += `<tr>`;
        r.forEach((cell, i) => {
            let align = i===0 ? 'left' : 'right';
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

const qHeaders = ['Kalem', '2023/12', '2024/3', '2024/6', '2024/9'];
const qRows = [
    ['Satış Gelirleri', '450.000', '480.000', '520.000', '580.000'],
    ['Brüt Kar', '120.000', '135.000', '150.000', '175.000'],
    ['Esas Faaliyet Karı', '90.000', '105.000', '118.000', '140.000'],
    ['FAVÖK', '95.000', '110.000', '125.000', '148.000'],
    ['Net Dönem Karı', '65.000', '78.000', '88.000', '110.000']
];
const tGelirQ = genTable('Gelir Tablosu (Çeyreklik)', qHeaders, qRows);
const tGelirY = genTable('Gelir Tablosu (Yıllıklandırılmış)', qHeaders, qRows.map(r => [r[0], r[1]+' (Y)', r[2]+' (Y)', r[3]+' (Y)', r[4]+' (Y)']));

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

const formatCurrency = (val, decimals = 2) => {
    if (val === null || val === undefined || isNaN(val)) return decimals === 0 ? ' 0' : ' 0,00';
    const isNegative = val < 0;
    const absVal = Math.abs(val);
    const numStr = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(absVal);
    return (isNegative ? '-' : '') + ' ' + numStr;
};
const formatPercent = (val, decimals = 2) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(val * 100) + '%';
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('tr-TR');
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
        } else {
            // Çıkış varsa oransal düşürme (Basitleştirilmiş)
            if (anapara - tutar > 0) {
                const oran = Math.abs(tutar) / (anapara - tutar);
                enflasyonAnapara -= (enflasyonAnapara * oran);
                virtualAltinGr -= (virtualAltinGr * oran);
                virtualDolar -= (virtualDolar * oran);
                virtualBist -= (virtualBist * oran);
            }
        }
    });

    const guncelAltin = getFiyat('Gram Altın') || 1;
    const guncelDolar = getFiyat('Dolar') > 1 ? getFiyat('Dolar') : 46.08;
    const guncelBist = getFiyat('BIST') || 1;

    const reelAltinDeger = virtualAltinGr * guncelAltin;
    const reelDolarDeger = virtualDolar * guncelDolar;
    const reelBistDeger = virtualBist * guncelBist;

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
    analizler: []
};

const State = {
    data: null,
    unsubscribe: null,

    init(callback) {
        if (this.unsubscribe) this.unsubscribe();
        let isInitialLoad = true;

        const processLoadedData = () => {
            if (!this.data.takipListesi) this.data.takipListesi = [];
            if (!this.data.analizler) this.data.analizler = [];
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
            }
        };

        if (!currentUser) {
            const localData = localStorage.getItem('borsa_app_data');
            if (localData) {
                try {
                    this.data = { ...DEFAULT_STATE, ...JSON.parse(localData) };
                } catch(e) {
                    this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
                }
            } else {
                this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
            }
            processLoadedData();
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
                } catch(e) {}
                
                if (!rescuedStr) rescuedStr = localStorage.getItem('borsa_app_data');

                if (rescuedStr) {
                    try {
                        const parsedLocal = JSON.parse(rescuedStr);
                        const localEkstreLen = parsedLocal.ekstre ? parsedLocal.ekstre.length : 0;
                        const fbEkstreLen = this.data.ekstre ? this.data.ekstre.length : 0;
                        
                        const useLocal = (parsedLocal.lastUpdated && this.data.lastUpdated && parsedLocal.lastUpdated > this.data.lastUpdated) || (!this.data.lastUpdated && localEkstreLen > fbEkstreLen);

                        if (useLocal) {
                            this.data = { ...this.data, ...parsedLocal };
                            this.save(); // Save rescued data back to Firebase
                            console.log("Rescued data from local system based on timestamp!");
                        }
                    } catch(e) {}
                }
                
                if (window.IMPORT_EKSTRE_DATA && window.IMPORT_EKSTRE_DATA.length > 0) {
                    this.data.ekstre = window.IMPORT_EKSTRE_DATA;
                    this.data.takipListesi = Array.from(new Set([...(this.data.takipListesi||[]), ...(window.IMPORT_TAKIP_DATA||[])]));
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
                    } catch(e) {
                        this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
                    }
                } else {
                    this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
                }
                
                if (window.IMPORT_EKSTRE_DATA && window.IMPORT_EKSTRE_DATA.length > 0) {
                    this.data.ekstre = window.IMPORT_EKSTRE_DATA;
                    this.data.takipListesi = Array.from(new Set([...(this.data.takipListesi||[]), ...(window.IMPORT_TAKIP_DATA||[])]));
                    window.IMPORT_EKSTRE_DATA = null;
                    if (window.IMPORT_NAKIT_DATA && window.IMPORT_NAKIT_DATA.length > 0) {
                        this.data.nakitHareketleri = window.IMPORT_NAKIT_DATA;
                        window.IMPORT_NAKIT_DATA = null;
                    }
                }
                
                processLoadedData();
                this.save();
            }
            if (callback && isInitialLoad) {
                callback();
                isInitialLoad = false;
            }
        });
    },

    save() {
        if (this.data) {
            this.data.lastUpdated = Date.now();
            // ROLLING BACKUP SYSTEM
            try {
                for (let i = 4; i >= 1; i--) {
                    const prev = localStorage.getItem(`borsa_app_data_backup_${i}`);
                    if (prev) localStorage.setItem(`borsa_app_data_backup_${i+1}`, prev);
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
    },


    // TAKİP LİSTESİ
    addTakip(menkul) {
        if (!this.data.takipListesi) this.data.takipListesi = [];
        if (!this.data.takipListesi.includes(menkul)) {
            this.data.takipListesi.push(menkul);
            this.save();
        }
    },
    removeTakip(menkul) {
        if (!this.data.takipListesi) this.data.takipListesi = [];
        this.data.takipListesi = this.data.takipListesi.filter(m => m !== menkul);
        this.save();
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
        
        this.save();
    },

    deleteEkstre(id) {
        this.data.ekstre = this.data.ekstre.filter(e => e.id !== id);
        this.save();
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
            this.save();
        }
    },

    addNakitHareket(islem) {
        this.data.nakitHareketleri.push({
            id: Date.now().toString(),
            ...islem
        });
        this.save();
    },
    deleteNakitHareket(id) {
        this.data.nakitHareketleri = this.data.nakitHareketleri.filter(n => n.id !== id);
        this.save();
    },
    updateNakitHareket(id, islem) {
        const index = this.data.nakitHareketleri.findIndex(n => n.id === id);
        if (index > -1) {
            this.data.nakitHareketleri[index] = { ...this.data.nakitHareketleri[index], ...islem };
            this.save();
        }
    },

    getFiyat(menkul) {
        if (!menkul) return 0;
        let m = menkul.trim().toUpperCase();
        if (m === 'NAKIT') return 1;
        const h = this.data.hisseFiyatlari.find(x => x.menkul.trim().toUpperCase() === m);
        return h ? h.fiyat : 0;
    },

    updateFiyat(menkul, fiyat, skipSave = false) {
        if (!menkul) return;
        let m = menkul.trim().toUpperCase();
        let hf = this.data.hisseFiyatlari.find(h => h.menkul.trim().toUpperCase() === m);
        if (hf) {
            hf.fiyat = parseFloat(fiyat);
            hf.tarih = new Date().toISOString();
        } else {
            this.data.hisseFiyatlari.push({ menkul: m, fiyat: parseFloat(fiyat), tarih: new Date().toISOString() });
        }
        if (!skipSave) this.save();
    }
};

const ensureDatalist = () => {
    let dl = document.getElementById('bist-hisse-list');
    if (!dl) {
        dl = document.createElement('datalist');
        dl.id = 'bist-hisse-list';
        document.body.appendChild(dl);
    }
    window.defaultStocksArray = ["HLGYO","KAYSE","OZRDN","FONET","AVGYO","METRO","DARDL","GOODY","CATES","KRGYO","CIMSA","MPARK","ARASE","AVTUR","BRSAN","IHAAS","ZRE20","ARFYE","MERKO","TDGYO","OFSYM","EGSER","AEFES","TCKRC","VERTU","HTTBT","RUZYE","EDIP","BIGCH","ISYAT","BALAT","MEYSU","TRGYO","KUTPO","SEGMN","BJKAS","INTEK","VBTYZ","AVPGY","GLBMD","IEYHO","BEYAZ","GENIL","PAMEL","MERIT","ISBIR","ARMGD","CEOEM","EUHOL","ALARK","HUNER","OPTGY","OZYSR","SODSN","SELEC","BARMA","UNLU","ENTRA","EDATA","TMSN","DURDO","LXGYO","EKSUN","KUYAS","ISCTR","ARCLK","DITAS","TSGYO","EKIZ","ACSEL","AKMGY","ADEL","GLCVY","AKSEN","RODRG","ETYAT","YONGA","PRKAB","ISMEN","VESTL","INFO","PNLSN","MAKIM","KCHOL","EKGYO","AYEN","GLYHO","AVOD","ALGYO","BRKVY","CLEBI","DOFER","AKHAN","BRISA","RUBNS","VAKBN","ISGYO","GLRMK","OSMEN","SUNTK","BASCM","GMTAS","BRMEN","SUWEN","AGESA","BULGS","GWIND","VKING","VERUS","MARTI","SMRTG","TRHOL","YATAS","CMENT","DMSAS","TUCLK","KARTN","CWENE","ZERGY","SKBNK","KRDMD","BANVT","ALKA","PINSU","TGSAS","KOPOL","FADE","TKFEN","SONME","PRKME","SELVA","AKSGY","LYDHO","EUPWR","PEKGY","EKOS","AYCES","QNBTR","ADGYO","TERA","YESIL","BIGTK","A1YEN","ASGYO","ESCAR","CRDFA","MARMR","VAKKO","KFEIN","KLSER","SVGYO","AYGAZ","KZGYO","AHGAZ","OYAKC","PSDTC","PKART","BALSU","EGEEN","LMKDC","BAKAB","DOCO","HATSN","ALCTL","LIDER","DIRIT","MHRGY","SURGY","EREGL","KRTEK","MOBTL","TEZOL","NATEN","BESTE","LOGO","GEDIK","DENGE","VKGYO","ISKPL","LILAK","AKFIS","HEDEF","PNSUT","MERCN","ALKLC","TURGG","PAPIL","ENPRA","BURVA","OYAYO","BEGYO","YKSLN","VAKFN","TLMAN","BESLR","UCAYM","POLTK","MSGYO","MAVI","EUKYO","ORCAY","CASA","AKYHO","TATGD","FORTE","HRKET","NETAS","KMPUR","BIOEN","ADESE","KAPLM","AYDEM","ULUFA","HATEK","ODAS","ANELE","KRVGD","ZPT10","OPX30","GOZDE","AGYO","PSGYO","GLDTR","PAHOL","GARFA","ULUUN","DURKN","ONRYT","SEKFK","DSTKF","KOCMT","INGRM","BSOKE","EUREN","GENKM","MEDTR","SNPAM","KUVVA","SANKO","AZTEK","SKTAS","KENT","JANTS","MEGAP","ULAS","OZKGY","VAKFA","FMIZP","AGROT","ANHYT","VRGYO","GENTS","BRKO","CEMZY","AKCNS","EGEPO","OPT25","AFYON","MIATK","GOKNR","TSKB","GRNYO","KONKA","SAMAT","LKMNH","LINK","ECOGR","BTCIM","ALBRK","TARKM","TRALT","KBORU","REEDR","FLAP","GUNDG","KTSKR","EGPRO","IHEVA","CVKMD","KLYPV","BOSSA","KOTON","ISFIN","DGGYO","GEDZA","GRTHO","VANGD","DOFRB","YGGYO","IZINV","KRPLS","TEHOL","TUPRS","AGHOL","APBDL","TMPOL","KONTR","NUGYO","TTRAK","HEKTS","AKBNK","DMLKT","IZFAS","PRZMA","TRMET","NIBAS","MARKA","OZSUB","FORMT","BAGFS","RNPOL","MNDRS","AKFYE","ALVES","LYDYE","QUAGR","SKYLP","RYSAS","KORDS","VSNMD","ARDYZ","ONCSM","ORMA","OYLUM","ZPBDL","GEREL","ENJSA","KRONT","BINHO","CANTE","FZLGY","TABGD","PENGD","ATAKP","BINBN","BAHKM","GARAN","FENER","RALYH","GMSTR","ARSAN","BASGZ","RYGYO","AVHOL","AHSGY","USDTR","ICUGS","MACKO","Z30KP","DUNYH","OBAMS","EBEBK","NTGAZ","DGNMO","SUMAS","AYES","DOGUB","SKYMD","MANAS","ISKUR","PARSN","HKTM","YIGIT","ARZUM","EMPAE","ZRGYO","DOAS","KATMR","TURSG","KLGYO","KLRHO","PASEU","KRDMB","TNZTP","BORLS","TAVHL","BRKSN","ULKER","KERVN","INVES","FRMPL","A1CAP","OTTO","BERA","BFREN","IZENR","KLSYN","YUNSA","TOASO","PKENT","SEYKM","EGEGY","ASTOR","PETKM","MZHLD","BNTAS","PENTA","ALTNY","DYOBY","GUBRF","ENDAE","MAGEN","TSPOR","CRFSA","ASUZU","CUSAN","ISSEN","ZEDUR","CMBTN","GESAN","LUKSK","KSTUR","ICBCT","ATEKS","PAGYO","EMKEL","ERBOS","KAREL","ODINE","YYAPI","TBORG","OPK30","MTRYO","APX30","MEPET","SEKUR","TCELL","BIGEN","QNBFK","ZGYO","ISDMR","AKFGY","INVEO","ISGLK","OBASE","DCTTR","YEOTK","LRSHO","SASA","KLNMA","ENERY","TRILC","IHYAY","SAYAS","SISE","INDES","KLMSN","TKNSA","MTRKS","ECZYT","CELHA","ANGEN","CONSE","SANEL","HURGZ","IHGZT","ESCOM","OTKAR","CGCAM","YAPRK","HOROZ","SAHOL","UFUK","EYGYO","CEMTS","RAYSG","SNICA","USAK","GZNMI","SERNT","PLTUR","SOKM","ALKIM","BAYRK","MRGYO","DMRGD","YYLGD","NUHCM","ATSYH","GRSEL","SEGYO","MNDTR","COSMO","ENSRI","ERCB","ENKAI","FRIGO","MMCAS","ASELS","KRSTL","KNFRT","ARENA","MOGAN","BUCIM","Z30KE","IDGYO","PRDGS","DOHOL","ALCAR","EGGUB","DNISI","ZPLIB","KCAER","QTEMZ","SDTTR","YBTAS","BIENY","MAKTK","BURCE","ISBTR","DAPGM","BRYAT","KRDMA","MEGMT","TUREX","BYDNR","BVSAN","ATAGY","GOLTS","BIMAS","ETILR","AKSUE","ANSGR","BIZIM","MARBL","YAYLA","EFOR","EMNIS","HDFGS","SAFKR","DERHL","TATEN","TTKOM","SRVGY","MRSHL","CEMAS","NETCD","KGYO","ZOREN","VESBE","BLUME","IMASM","POLHO","ALTIN","SNGYO","FROTO","TRCAS","ORGE","ALFAS","SILVR","MEKAG","GSDHO","PATEK","HALKB","SARKY","ATLAS","ARTMS","TUKAS","AAGYO","IHLAS","KONYA","GIPTA","MCARD","PCILT","ATATR","RGYAS","TEKTU","SMART","EUYO","SMRVA","AKSA","ELITE","YKBNK","KIMMR","BMSTL","BOBET","AKENR","ULUSE","KZBGY","INTEM","BRLSM","CCOLA","OZGYO","BMSCH","DEVA","GSDDE","DESPC","DESA","ERSU","MAALT","DAGI","IZMDC","KTLEV","PETUN","OSTIM","RTALB","DZGYO","IHLGM","OPTLR","MOPAS","PGSUS","DGATE","NTHOL","ZGOLD","SOKE","EKDMR","SANFM","ATATP","MGROS","ECILC","KARSN","GLRYH","OYYAT","LIDFA","OZATD","THYAO","DERIM","ZSR25","DOKTA","HUBVC","VKFYO","EPLAS","GATEG","GSRAY","AKGRT","KLKIM","TRENJ","BORSK","ESEN","ISGSY","BLCYT"];
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
    } catch(e) {
        console.error('TradingView Dolar/Altın çekilemedi:', e);
    }

    // 2. Hisse Senetleri
    let tvBasarili = false;
    try {
        const tvResponse = await fetch('https://scanner.tradingview.com/turkey/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: JSON.stringify({
                filter: [{"left":"type","operation":"in_range","right":["stock","dr","fund"]}],
                markets: ["turkey"],
                columns: ["name","close","change"],
                range: [0,5000]
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
                    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
                    `https://api.codetabs.com/v1/proxy/?quest=${targetUrl}`
                ];
                
                for (const proxy of proxies) {
                    try {
                        const yfResponse = await fetch(proxy);
                        if (!yfResponse.ok) continue;
                        const yfData = await yfResponse.json();
                        if (yfData && yfData.chart && yfData.chart.result && yfData.chart.result.length > 0) {
                            const fiyat = yfData.chart.result[0].meta.regularMarketPrice;
                            if (fiyat) {
                                State.updateFiyat(menkul, fiyat, true);
                                break;
                            }
                        }
                    } catch(err) {}
                }
            });
            await Promise.all(fetchPromises);
        }
    } catch(e2) {
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
                    } catch(err) {}
                }
            });
            await Promise.all(fetchPromises);
        }
    } catch(e) {}

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
    State.save();
    if (typeof renderPage === 'function' && (currentPage === 'giris' || currentPage === 'hedef' || currentPage === 'gorunum')) {
        renderPage();
    }
};

// --- PAGES ---
const renderPortfoy = (container) => {
    const { portfoyList, arsivList, portfoyBilgileri } = calculatePortfoy(State.data.ekstre, (m) => State.getFiyat(m), State.data.nakitHareketleri);
    
    let totalOdenen = 0, totalGuncel = 0, totalKar = 0;
    let hissePortfoyTutar = 0, fonPortfoyTutar = 0;
    
    const filteredPortfoy = portfoyList.filter(p => !p.isNakit);

    const portfoyHtml = filteredPortfoy.map((p, i) => {
        totalOdenen += p.odenenTutar;
        totalKar += p.kar;
        totalGuncel += p.guncelTutar;
        
        if (p.menkul.length === 3) fonPortfoyTutar += p.guncelTutar;
        else hissePortfoyTutar += p.guncelTutar;

        const tur = p.menkul.length === 3 ? 'Fon' : 'Hisse';
        let fiyatHtml = `<td>${formatCurrency(p.guncelFiyat)}</td>`;
        if (tur === 'Fon') {
            fiyatHtml = `<td>${formatCurrency(p.guncelFiyat)}</td>`;
        }

        return `<tr>
            <td>${i + 1}</td>
            <td style="text-align: left;">${p.menkul}</td>
            <td style="  text-align:left;">${tur}</td>
            ${fiyatHtml}
            <td>${p.adet.toLocaleString('tr-TR')}</td>
            <td>${formatCurrency(p.guncelMaliyet)}</td>
            <td>${formatCurrency(p.netMaliyet)}</td>
            <td>${formatCurrency(p.odenenTutar, 0)}</td>
            <td>${formatCurrency(p.guncelTutar, 0)}</td>
            <td class="${p.kar >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(p.kar, 0)}</td>
            <td class="${p.kar >= 0 ? 'text-success' : 'text-danger'}">${formatPercent(p.karYuzde, 0)}</td>
            <td>${formatPercent(p.portfoyOrani, 0)}</td>
            <td>${formatDate(p.ilkAlimTarihi)}</td>
            <td>${p.gecenSure}</td>
        </tr>`;
    }).join('');

    let arsivKarTotal = 0;
    const arsivHtml = arsivList.map((a, i) => {
        arsivKarTotal += a.kar;
        return `<tr>
            <td>${i+1}</td>
            <td style="text-align: left;">${a.menkul}</td>
            <td>${a.adet}</td>
            <td>${formatCurrency(a.alisFiyati)}</td>
            <td>${formatCurrency(a.satisFiyati)}</td>
            <td class="${a.kar >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(a.kar, 0)}</td>
            <td class="${a.kar >= 0 ? 'text-success' : 'text-danger'}">${formatPercent(a.karYuzde, 0)}</td>
            <td>${formatDate(a.ilkAlimTarihi)}</td>
            <td>${formatDate(a.sonSatimTarihi)}</td>
            <td>${a.tasimaSuresi}</td>
        </tr>`;
    }).join('');

    const nakitItem = portfoyList.find(p => p.isNakit);
    const guncelNakitTutar = nakitItem ? nakitItem.guncelTutar : 0;

    
    window.switchPortfoyTab = (tabId) => {
        document.querySelectorAll('.portfoy-tab-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.portfoy-tab-btn').forEach(btn => {
            btn.style.background = 'rgba(255,255,255,0.05)';
            btn.style.color = 'var(--text-secondary)';
        });
        const target = document.getElementById('portfoy-' + tabId); if (target) target.style.display = 'flex';
        const activeBtn = document.querySelector(`.portfoy-tab-btn[data-tab="${tabId}"]`);
        if(activeBtn) {
            activeBtn.style.background = 'var(--accent-color)';
            activeBtn.style.color = '#fff';
        }
    };

    const html = `
        <div class="page-section active" style="display: flex; flex-direction: column; gap: 40px;">
            
            

            <div id="portfoy-bilgiler" class="portfoy-tab-content" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 0;">
                <div class="table-container glass" style="margin-bottom: 0;">
                    <div class="table-header">Portföy Bilgileri</div>
                <div class="flex-row" style="align-items: center; gap: 1rem;">
                    <table class="dash-table compact-table" style="flex: 1; border-right: 1px solid rgba(255, 255, 255, 0.03);">
                        <tbody>
                            <tr>
    <td style="text-align:left;">Nakit</td>
    <td><div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
        <span id="nakit-text">${formatCurrency(guncelNakitTutar, 0)}</span>
        <button id="nakit-edit-btn" class="btn" style="padding:0.1rem 0.3rem; font-size:12px; background:var(--accent-color);" onclick="window.toggleNakitEdit()"><i class="fas fa-edit"></i></button>
        <form id="inline-nakit-form" style="display:none; margin:0; gap:0.2rem; align-items:center;" onsubmit="window.saveInlineNakit(event, ${guncelNakitTutar})">
            <input type="number" step="0.01" id="inline-nakit-input" value="${guncelNakitTutar}" style="width: 80px; padding: 2px; font-size: 12px; background:rgba(0,0,0,0.3); color:#fff; border:1px solid var(--surface-border); border-radius:4px; text-align:right;">
            <button type="submit" class="btn" style="padding:0.1rem 0.3rem; font-size:12px;"><i class="fas fa-check"></i></button>
            <button type="button" class="btn" style="padding:0.1rem 0.3rem; font-size:12px; background:rgba(255,255,255,0.1);" onclick="window.toggleNakitEdit()"><i class="fas fa-times"></i></button>
        </form>
    </div></td>
</tr>
                            <tr><td style="text-align:left;">Hisse Portföyü</td><td>${formatCurrency(hissePortfoyTutar, 0)}</td></tr>
                            <tr><td style="text-align:left;">Fon Portföyü</td><td>${formatCurrency(fonPortfoyTutar, 0)}</td></tr>
                            <tr><td style="text-align:left;">Toplam Portföy</td><td>${formatCurrency(portfoyBilgileri.toplamPortfoy, 0)}</td></tr>
                            <tr><td style="text-align:left;">Anapara</td><td>${formatCurrency(portfoyBilgileri.anapara, 0)}</td></tr>
                            <tr><td style="text-align:left;">Kar</td><td class="${portfoyBilgileri.kar >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(portfoyBilgileri.kar, 0)}</td></tr>
                        </tbody>
                    </table>
                    <table class="dash-table compact-table" style="flex: 1;">
                        <tbody>
                            <tr><td style="text-align:left;">Nominal Getiri Oranı</td><td class="${portfoyBilgileri.nominalGetiri >= 0 ? 'text-success' : 'text-danger'}">${formatPercent(portfoyBilgileri.nominalGetiri)}</td></tr>
                            <tr><td style="text-align:left;">Reel Getiri Oranı (Enflasyon)</td><td class="${portfoyBilgileri.reelGetiriEnflasyon >= 0 ? 'text-success' : 'text-danger'}">${formatPercent(portfoyBilgileri.reelGetiriEnflasyon)}</td></tr>
                            <tr><td style="text-align:left;">BIST 100'e Göre Reel Getiri Oranı</td><td class="${portfoyBilgileri.reelGetiriBist >= 0 ? 'text-success' : 'text-danger'}">${formatPercent(portfoyBilgileri.reelGetiriBist)}</td></tr>
                            <tr><td style="text-align:left;">Dolar Kuruna Göre Reel Getiri Oranı</td><td class="${portfoyBilgileri.reelGetiriDolar >= 0 ? 'text-success' : 'text-danger'}">${formatPercent(portfoyBilgileri.reelGetiriDolar)}</td></tr>
                            <tr><td style="text-align:left;">Gram Altına Göre Reel Getiri Oranı</td><td class="${portfoyBilgileri.reelGetiriAltin >= 0 ? 'text-success' : 'text-danger'}">${formatPercent(portfoyBilgileri.reelGetiriAltin)}</td></tr>
                            <tr>
    <td style="text-align:left;">Hedef Portföy</td>
    <td><div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
        <span id="hedef-text">${formatCurrency(portfoyBilgileri.hedefPortfoy, 0)}</span>
        <button id="hedef-edit-btn" class="btn" style="padding:0.1rem 0.3rem; font-size:12px; background:var(--accent-color);" onclick="window.toggleHedefEdit()"><i class="fas fa-edit"></i></button>
        <form id="inline-hedef-form" style="display:none; margin:0; gap:0.2rem; align-items:center; width:100%; justify-content:flex-end;" onsubmit="window.saveInlineHedef(event)">
            <input type="number" step="1" id="inline-hedef-input" value="${portfoyBilgileri.hedefPortfoy}" style="width: 100px; padding: 2px; font-size: 12px; background:rgba(0,0,0,0.3); color:#fff; border:1px solid var(--surface-border); border-radius:4px; text-align:right;">
            <button type="submit" class="btn" style="padding:0.1rem 0.3rem; font-size:12px;"><i class="fas fa-check"></i></button>
            <button type="button" class="btn" style="padding:0.1rem 0.3rem; font-size:12px; background:rgba(255,255,255,0.1);" onclick="window.toggleHedefEdit()"><i class="fas fa-times"></i></button>
        </form>
    </div></td>
</tr>
                            <tr><td style="text-align:left;">Hedefe Ulaşmak İçin Gereken Artış %</td><td>${formatPercent(portfoyBilgileri.hedefArtis, 0)}</td></tr>
                        </tbody>
                    </table>
                    <div style="width: 180px; height: 180px; display: flex; justify-content: center; align-items: center; padding-left: 1rem;">
                        <canvas id="chart-ozet"></canvas>
                    </div>
                </div>
            </div>

            </div>
            </div>

            <div id="portfoy-varliklar" class="portfoy-tab-content" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 0;">
                <div class="table-container glass" style="margin-bottom: 0;">
                    <div class="table-header">Varlıklarım</div>
                <div class="flex-row" style="align-items: center; gap: 1rem;">
                    <div style="flex: 2.5; overflow-x: auto;">
                        <table>
                            <thead>
                                <tr><th>S.N.</th><th>Menkul</th><th>Tür</th><th>Güncel<br>Fiyat</th><th>Adet</th><th>Güncel<br>Maliyet</th><th>Net<br>Maliyet</th><th>Ödenen<br>Tutar</th><th>Güncel<br>Tutar</th><th>Kar/Zarar</th><th>Kar/Zarar%</th><th>Portföy<br>Oranı</th><th>İlk Alım<br>Tarihi</th><th>Geçen<br>Süre</th></tr>
                            </thead>
                            <tbody>
                                ${portfoyHtml}
                                <tr class="total-row">
                                    <td></td>
                                    <td style="text-align:center;">TOPLAM</td>
                                    <td colspan="5"></td>
                                    <td>${formatCurrency(totalOdenen, 0)}</td>
                                    <td>${formatCurrency(totalGuncel, 0)}</td>
                                    <td class="${totalKar >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(totalKar, 0)}</td>
                                    <td colspan="4"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="width: 220px; height: 220px; display: flex; justify-content: center; align-items: center; padding-left: 1rem;">
                        <canvas id="chart-varliklar"></canvas>
                    </div>
                </div>
            </div>

            </div>
            </div>

            <div id="portfoy-arsiv" class="portfoy-tab-content" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 0;">
                <div class="table-container glass" style="margin-bottom: 0;">
                    <div class="table-header">Arşiv</div>
<table class="dash-table compact-table" style="min-width: 1000px;">
                    <thead>
                        <tr><th>S.N.</th><th>Menkul</th><th>Adet</th><th>Alış Fiyatı</th><th>Satış Fiyatı</th><th>Kar / Zarar</th><th>Kar / Zarar %</th><th>İlk Alım Tarihi</th><th>Son Satım Tarihi</th><th>Taşıma Süresi</th></tr>
                    </thead>
                    <tbody>
                        ${arsivHtml}
                        <tr class="total-row">
                            <td></td>
                            <td style="text-align:center;">TOPLAM</td>
                            <td colspan="3"></td>
                            <td class="${arsivKarTotal >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(arsivKarTotal, 0)}</td>
                            <td colspan="4"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            </div>

        </div>
    `;
    container.innerHTML = html;


    window.toggleHedefEdit = () => {
        const text = document.getElementById('hedef-text');
        const form = document.getElementById('inline-hedef-form');
        const btn = document.getElementById('hedef-edit-btn');
        if(form.style.display === 'none') {
            text.style.display = 'none';
            if(btn) btn.style.display = 'none';
            form.style.display = 'flex';
            form.style.gap = '0.5rem';
        } else {
            text.style.display = 'inline';
            if(btn) btn.style.display = 'inline-block';
            form.style.display = 'none';
        }
    };
    window.saveInlineHedef = (e) => {
        e.preventDefault();
        const yeniHedef = parseFloat(document.getElementById('inline-hedef-input').value);
        State.data.hedefPortfoyTL = yeniHedef;
        State.save();
        if (typeof renderPage === "function") renderPage();
    };

    window.toggleNakitEdit = () => {
        const text = document.getElementById('nakit-text');
        const form = document.getElementById('inline-nakit-form');
        const btn = document.getElementById('nakit-edit-btn');
        if(form.style.display === 'none') {
            text.style.display = 'none';
            if(btn) btn.style.display = 'none';
            form.style.display = 'flex';
            form.style.gap = '0.5rem';
        } else {
            text.style.display = 'inline';
            if(btn) btn.style.display = 'inline-block';
            form.style.display = 'none';
        }
    };
    window.saveInlineNakit = (e) => {
        e.preventDefault();
        const inputVal = document.getElementById('inline-nakit-input').value;
        if (!inputVal) return window.toggleNakitEdit();
        State.data.manuelNakitTutar = parseFloat(inputVal) || 0;
        State.save();
        if (typeof renderPage === "function") renderPage();
    };

    if (window.Chart) {
        if (window.ChartDataLabels) Chart.register(ChartDataLabels);

        if (window.chartOzetInstance) window.chartOzetInstance.destroy();
        if (window.chartVarliklarInstance) window.chartVarliklarInstance.destroy();

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
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            position: 'bottom', 
                            labels: { 
                                color: '#fff',
                                font: { size: 9 },
                                boxWidth: 10,
                                boxHeight: 10,
                                padding: 15
                            } 
                        },
                        datalabels: {
                            color: '#fff',
                            font: { size: 9 },
                            formatter: (value, ctx) => {
                                let sum = 0;
                                ctx.chart.data.datasets[0].data.forEach(d => sum += d);
                                if (sum === 0 || value === 0) return '';
                                return (value * 100 / sum).toFixed(0) + '%';
                            }
                        }
                    }
                }
            });
        }

        const ctxVarliklar = document.getElementById('chart-varliklar');
        if (ctxVarliklar && filteredPortfoy.length > 0) {
            const labels = filteredPortfoy.map(p => p.menkul);
            const data = filteredPortfoy.map(p => p.guncelTutar);
            const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
            
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
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { 
                            position: 'bottom', 
                            labels: { 
                                color: '#fff', 
                                font: { size: 9 },
                                boxWidth: 10,
                                boxHeight: 10,
                                padding: 10
                            } 
                        },
                        datalabels: {
                            color: '#fff',
                            font: { size: 9 },
                            formatter: (value, ctx) => {
                                let sum = 0;
                                ctx.chart.data.datasets[0].data.forEach(d => sum += d);
                                if (sum === 0 || value === 0) return '';
                                let pct = (value * 100 / sum).toFixed(0);
                                return pct < 3 ? '' : pct + '%'; // 3%'ten kucukse yazma kalabalik olmasin
                            }
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
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 0.5rem; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 0.5rem;">
                        <div style="display:flex; gap: 4px;">
                            ${colors.map(col => `<div onclick="window.changeGenelNotColor('${not.id}', '${col}')" style="width:15px; height:15px; border-radius:50%; background:${col}; cursor:pointer; border: 1px solid rgba(0,0,0,0.2);"></div>`).join('')}
                        </div>
                        <i class="fas fa-trash" style="cursor:pointer; color: rgba(0,0,0,0.5);" onclick="window.deleteGenelNot('${not.id}')"></i>
                    </div>
                </div>
            `).join('');

            contentHtml = `
                <div style="padding: 1rem; display: flex; flex-direction: column; height: 100%;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0;">
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
                          if (ozR && ozR.length > i + 4) {
                              previousOz = parseTRNumber(ozR[i+4]);
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
                    if (chartSatislar[l] > chartSatislar[l-1]) buyumePuan += 2;
                    if (chartFavok[l] > chartFavok[l-1]) buyumePuan += 2;
                    if (chartNetKar[l] > chartNetKar[l-1]) buyumePuan += 2;
                    
                    // Karlılık (BKM, FKM, NKM)
                    if (chartBKM[l] > chartBKM[l-1]) karlilikPuan += 2;
                    if (chartFKM[l] > chartFKM[l-1]) karlilikPuan += 2;
                    if (chartNKM[l] > chartNKM[l-1]) karlilikPuan += 2;
                    
                    // Borçluluk (Cari Oran artmışsa iyi, Kaldıraç düşmüşse iyi)
                    if (chartCari[l] > chartCari[l-1]) borclulukPuan += 3;
                    if (chartKaldirac[l] < chartKaldirac[l-1]) borclulukPuan += 3;
                }
                
                // Kaynak Dağılımı (pctOz, pctKisa, pctUzun)
                const vOzCurrent = sData.bilanco.rows.find(x => x[0] && x[0].toLocaleLowerCase('tr-TR').includes('ana ortaklığa ait özkaynaklar'));
                const vKisaCurrent = sData.bilanco.rows.find(x => x[0] && x[0].toLocaleLowerCase('tr-TR').includes('toplam kısa vadeli'));
                const vUzunCurrent = sData.bilanco.rows.find(x => x[0] && x[0].toLocaleLowerCase('tr-TR').includes('toplam uzun vadeli'));
                
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
                .compact-table th { font-size: 0.85rem !important; font-weight: 600 !important; color: #ffffff !important; height: 39px; }
                .compact-table td:first-child { font-size: 0.85rem !important; font-weight: 500 !important; color: #cccccc !important; }
                .compact-table tr { height: 39px !important; }
                .compact-table td { font-size: 0.85rem !important; font-weight: 500 !important; color: #cccccc; height: 34px !important; line-height: 1 !important; }
                /* nav-btn override removed to protect main sidebar */
                .nav-dropdown-content a { font-size: 0.85rem !important; font-weight: 600 !important; }
                .dash-title { font-size: 0.85rem !important; font-weight: 600 !important; color: #ffffff !important; }
                .compact-card { padding: 1.2rem !important; }
                .gauge-container { display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; width: 80px; height: 50px; }
                .gauge-bg { position: absolute; width: 100%; height: 100%; border-radius: 40px 40px 0 0; border: 8px solid rgba(255,255,255,0.1); border-bottom: none; box-sizing: border-box; }
                .gauge-fill { position: absolute; width: 100%; height: 100%; border-radius: 40px 40px 0 0; border: 8px solid #2ecc71; border-bottom: none; box-sizing: border-box; transform-origin: bottom center; transform: rotate(0deg); transition: transform 1s; }
                .gauge-text { position: absolute; bottom: 0; font-size: 1.1rem; font-weight: 700; color: #fff; line-height: 1; }
                .gauge-label { font-size: 0.7rem; color: #aaa; margin-top: 4px; text-align: center; }
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
                    
                    <!-- Row 2: Çeyreklik Bar Grafikleri -->
                    <div style="display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; overflow: hidden;">
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="font-size: 0.85rem; font-weight: 500;">Çeyreklik Satışlar</div>
                            <div style="flex:1; min-height:180px; min-width: 0; position:relative;"><canvas id="chart-ceyreklik-satislar"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="font-size: 0.85rem; font-weight: 500;">Çeyreklik FAVÖK</div>
                            <div style="flex:1; min-height:180px; min-width: 0; position:relative;"><canvas id="chart-ceyreklik-favok"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="font-size: 0.85rem; font-weight: 500;">Çeyreklik Net Kar</div>
                            <div style="flex:1; min-height:180px; min-width: 0; position:relative;"><canvas id="chart-ceyreklik-netkar"></canvas></div>
                        </div>
                    </div>

                    <!-- Row 3: Çarpanlar, Karne, Şirket Detayları -->
                    <div style="display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; align-items: stretch;">
                        
                        <!-- Çarpanlar -->
                        <div class="dash-card compact-card" style="margin-bottom:0; display:flex; flex-direction:column;">
                            <div class="dash-title" style="font-size: 0.85rem; font-weight: 500; margin-bottom: 1rem;">Çarpanlar</div>
                            <table class="dash-table compact-table" style="flex: 1;">
                                <tbody>
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                        <td >F/K</td>
                                        <td style=" text-align: right;">${fmtDec(fk)}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                        <td >FD/FAVÖK</td>
                                        <td style=" text-align: right;">${fmtDec(fdFavok)}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                        <td >PD/DD</td>
                                        <td style=" text-align: right;">${fmtDec(pdDd)}</td>
                                    </tr>
                                    
                                    <tr>
                                        <td >Net Borç / FAVÖK</td>
                                        <td style=" text-align: right;">${fmtDec(netBorcFavok)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Kaynak Dağılımı -->
                        <div class="dash-card compact-card" style="margin-bottom:0; display:flex; flex-direction:column;">
                            <div class="dash-title" style="font-size: 0.85rem; font-weight: 500; margin-bottom: 0.8rem;">Kaynak Dağılımı</div>
                            <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
                                <div style="display:flex; height: 12px; border-radius: 6px; overflow:hidden; margin-bottom: 1.5rem;">
                                    <div style="width:${pctOz}%; background:#6c5ce7;" title="Özkaynaklar: %${pctOz}"></div>
                                    <div style="width:${pctKisa}%; background:#fd79a8;" title="Kısa Vade Yükümlülükler: %${pctKisa}"></div>
                                    <div style="width:${pctUzun}%; background:#636e72;" title="Uzun Vade Yükümlülükler: %${pctUzun}"></div>
                                </div>
                                <div style="display:flex; flex-wrap:wrap; justify-content:center; gap: 1rem; font-size: 0.75rem; color:#aaa;">
                                    <div style="display:flex; align-items:center; gap:4px;"><div style="width:8px;height:8px;border-radius:50%;background:#6c5ce7;"></div>Özkaynaklar: %${pctOz}</div>
                                    <div style="display:flex; align-items:center; gap:4px;"><div style="width:8px;height:8px;border-radius:50%;background:#fd79a8;"></div>Kısa Vade Yük.: %${pctKisa}</div>
                                    <div style="display:flex; align-items:center; gap:4px;"><div style="width:8px;height:8px;border-radius:50%;background:#636e72;"></div>Uzun Vade Yük.: %${pctUzun}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Şirket Detayları -->
                        <div class="dash-card compact-card" style="margin-bottom:0; display:flex; flex-direction:column;">
                            <div class="dash-title" style="font-size: 0.85rem; font-weight: 500; margin-bottom: 1rem;">Şirket Detayları</div>
                            <table class="dash-table compact-table" style="flex: 1;">
                                <tbody>
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                        <td >Hisse Başına Kar</td>
                                        <td style=" text-align: right;">${fmtDec(hbk)}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                        <td >Ödenmiş Sermaye</td>
                                        <td style=" text-align: right;">${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(odenmisSermaye)}</td>
                                    </tr>
                                    <tr>
                                        <td >Piyasa Değeri</td>
                                        <td style=" text-align: right;">${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(piyasaDegeri)}</td>
                                    </tr>
                                    <tr>
                                        <td >Piyasa Değeri $</td>
                                        <td style=" text-align: right;">$${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(piyasaDegeriUsd)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Row 4: Line Grafikler -->
                    <div style="display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem;">
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="font-size: 0.85rem; font-weight: 500;">Brüt Kar Marjı (Çeyreklik)</div>
                            <div style="flex: 1; min-height: 150px; position: relative;">
                                <canvas id="chart-bkm"></canvas>
                            </div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="font-size: 0.85rem; font-weight: 500;">FAVÖK Marjı (Çeyreklik)</div>
                            <div style="flex: 1; min-height: 150px; position: relative;">
                                <canvas id="chart-fkm"></canvas>
                            </div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="font-size: 0.85rem; font-weight: 500;">Net Kar Marjı (Çeyreklik)</div>
                            <div style="flex: 1; min-height: 150px; position: relative;">
                                <canvas id="chart-nkm"></canvas>
                            </div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="font-size: 0.85rem; font-weight: 500;">Cari Oran</div>
                            <div style="flex: 1; min-height: 150px; position: relative;">
                                <canvas id="chart-cari"></canvas>
                            </div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="font-size: 0.85rem; font-weight: 500;">Kaldıraç Oranı</div>
                            <div style="flex: 1; min-height: 150px; position: relative;">
                                <canvas id="chart-kaldirac"></canvas>
                            </div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="font-size: 0.85rem; font-weight: 500;">Özkaynak Karlılığı</div>
                            <div style="flex: 1; min-height: 150px; position: relative;">
                                <canvas id="chart-roe"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                `;
                
                window.shouldRenderDashboardCharts = true;
                window.dashboardChartData = {
                    labels: chartLabels,
                    satislar: chartSatislar,
                    favok: chartFavok,
                    netkar: chartNetKar,
                      bkm: chartBKM, fkm: chartFKM, nkm: chartNKM,
                      cari: chartCari, kaldirac: chartKaldirac, roe: chartROE
                  };
            } else if (activeTab === 'Gelir Tablosu') {
                let tGelirDynamic = tGelirY;
                if (sData.gelirYillik) tGelirDynamic = genTable('Gelir Tablosu (Yıllık)', sData.gelirYillik.headers, sData.gelirYillik.rows);
                contentHtml = `
                <style>
                .compact-table { table-layout: auto !important; width: 100%; }
                .compact-table th, .compact-table td { padding: 0.4rem 0.3rem !important; white-space: nowrap; font-size: 0.8rem !important; }
                .compact-card { padding: 1rem 0.5rem !important; }
                </style>
                <div style="display:flex; flex-direction:column; gap: 1rem; margin-top: 0;">
                    ${tGelirDynamic}
                </div>
                `;
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
            } else if (['Finansal Rapor', 'Faaliyet Raporu', 'Yatırımcı Sunumu', 'Araştırma Raporu'].includes(activeTab)) {
                contentHtml = `
                <div style="display:flex; gap: 1rem; padding-top: 0; height: calc(100vh - 250px);">
                    <div class="dash-card" style="flex:1; margin-bottom: 0; display:flex; flex-direction:column; padding:0; overflow:hidden;" id="rapor-viewer-container">
                        <div style="flex:1; display:flex; justify-content:center; align-items:center; opacity:0.5; font-style:italic;">Yükleniyor...</div>
                    </div>
                </div>
                `;
                
                setTimeout(() => {
                    if (window.loadRapor) {
                        window.loadRapor(activeTab, 'pdf');
                    }
                }, 100);
            } else if (activeTab === 'Hisse Notları') {
                let analizler = State.data.analizler || [];
                // Filter only for the selected hisse
                analizler = analizler.filter(a => (a.hisse || '').toUpperCase() === selectedHisse.toUpperCase());
                analizler = window.sortAnalizler([...analizler]);

                function getMediaEmbedHtml(url) {
                    if (!url) return '';
                    const ytMatch = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
                    if (ytMatch && ytMatch[2].length === 11) {
                        const videoId = ytMatch[2];
                        return `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                                    <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
                                            src="https://www.youtube.com/embed/${videoId}" 
                                            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
                                    </iframe>
                                </div>`;
                    }
                    const twMatch = url.match(/^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/);
                    if (twMatch) {
                        return `<div class="glass" style="padding: 1rem; border-radius: 8px; border-left: 4px solid #1DA1F2; display: flex; align-items: center; gap: 1rem;">
                                    <i class="fab fa-twitter" style="color: #1DA1F2; font-size: 32px;"></i>
                                    <div>
                                        <div style="font-weight: bold; margin-bottom: 0.3rem;">X (Twitter) Bağlantısı</div>
                                        <a href="${url}" target="_blank" style="color: var(--accent-color); text-decoration: none;">Gönderiyi Görüntüle <i class="fas fa-external-link-alt"></i></a>
                                    </div>
                                </div>`;
                    }
                    return `<div class="glass" style="padding: 1rem; border-radius: 8px; border-left: 4px solid var(--text-secondary); display: flex; align-items: center; gap: 1rem;">
                                <i class="fas fa-link" style="color: var(--text-secondary); font-size: 32px;"></i>
                                <div>
                                    <div style="font-weight: bold; margin-bottom: 0.3rem;">Dış Bağlantı</div>
                                    <a href="${url}" target="_blank" style="color: var(--accent-color); text-decoration: none;">Bağlantıya Git <i class="fas fa-external-link-alt"></i></a>
                                </div>
                            </div>`;
                }

                let cardRows = analizler.map(a => {
                    const leftSideHtml = a.baglanti ? `<div style="flex: 1; min-width: 300px; max-width: 500px;">${getMediaEmbedHtml(a.baglanti)}</div>` : '';
                    return `
                        <div class="glass" style="display: flex; gap: 2rem; padding: 1.5rem; border-radius: 12px; flex-wrap: wrap; margin-bottom: 1rem; border-left: 4px solid var(--accent-color);">
                            ${leftSideHtml}
                            <div style="flex: 2; min-width: 300px; display: flex; flex-direction: column;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.8rem; margin-bottom: 1rem;">
                                    <div>
                                        <div style="font-size: 1.1rem; color: var(--text-secondary); margin-top: 0.3rem;"><i class="fas fa-user" style="color: var(--accent-color);"></i> ${a.borsaci || 'Anonim'}</div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.8rem;"><i class="fas fa-calendar-alt"></i> ${a.tarih ? a.tarih.split('-').reverse().join('.') : ''}</div>
                                        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                                            <button class="btn btn-icon" style="color: var(--warning-color); padding: 6px !important; font-size: 14px;" onclick="window.editAnaliz('${a.id}')" title="Düzenle"><i class="fas fa-edit"></i></button>
                                            <button class="btn btn-icon" style="color: var(--danger-color); padding: 6px !important; font-size: 14px;" onclick="window.deleteAnaliz('${a.id}')" title="Sil"><i class="fas fa-trash"></i></button>
                                        </div>
                                    </div>
                                </div>
                                <div style="font-size: 1.05rem; line-height: 1.6; color: #e0e0e0; white-space: pre-wrap; flex-grow: 1;">${a.notText || '<span style="opacity:0.5; font-style:italic;">Özet not eklenmemiş.</span>'}</div>
                            </div>
                        </div>
                    `;
                }).join('');
                
                if (analizler.length === 0) {
                    cardRows = `<div style="text-align: center; padding: 3rem; opacity: 0.5; font-size: 1.1rem;">Henüz eklenmiş bir analiz bulunmuyor.</div>`;
                }

                const today = new Date().toISOString().split('T')[0];

                contentHtml = `
                <div style="display:flex; flex-direction:column; gap: 1rem; padding-top: 0; height: calc(100vh - 250px);">
                    
                    <div style="display: flex; justify-content: flex-end; margin-bottom: 0.5rem;">
                        <button class="btn" style="background: var(--success-color); font-weight: 600; padding: 0.5rem 1rem;" onclick="window.toggleInlineAnaliz()"><i class="fas fa-plus"></i> Yeni Not Ekle</button>
                    </div>

                    <!-- Yeni Not Ekleme Formu (Gizli) -->
                    <div id="inline-analiz-row" class="glass" style="display: none; flex-direction: column; gap: 1rem; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid var(--accent-color);">
                        <div style="font-weight: bold; font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">Analiz / Not Ekle</div>
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <div style="flex: 1; min-width: 150px;">
                                <label style="font-size: 0.8rem; color: var(--text-secondary);">Tarih</label>
                                <input type="date" id="analiz-tarih" class="form-control" style="width:100%;" value="${today}">
                            </div>
                            <div style="flex: 1; min-width: 150px;">
                                <label style="font-size: 0.8rem; color: var(--text-secondary);">Analist</label>
                                <input type="text" id="analiz-borsaci" list="analiz-borsaci-list" class="form-control" style="width:100%;" placeholder="Analist Adı">
                            </div>
                            <!-- Gizli Hisse Inputu: Zaten secili hissedeyiz, ondan sabit kalacak -->
                            <input type="hidden" id="analiz-hisse" value="${selectedHisse}">
                            
                            <div style="flex: 2; min-width: 250px;">
                                <label style="font-size: 0.8rem; color: var(--text-secondary);">Bağlantı (YouTube, X, vs.)</label>
                                <input type="text" id="analiz-baglanti" class="form-control" style="width:100%;" placeholder="https://youtube.com/...">
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="font-size: 0.8rem; color: var(--text-secondary);">Özet Notlar</label>
                            <textarea id="analiz-not" class="form-control" style="width:100%; height: 120px; resize: vertical;" placeholder="Bu analizden / videodan çıkardığınız özet notlar..."></textarea>
                        </div>
                        <div style="display: flex; gap: 0.8rem; justify-content: flex-end; margin-top: 0.5rem;">
                            <button class="btn" style="background: var(--success-color); padding: 0.5rem 1.5rem;" onclick="window.addAnaliz()"><i class="fas fa-check"></i> Kaydet</button>
                            <button class="btn" style="background: var(--danger-color); padding: 0.5rem 1.5rem;" onclick="window.toggleInlineAnaliz()"><i class="fas fa-times"></i> İptal</button>
                        </div>
                    </div>

                    <!-- Kartların Listelendiği Alan -->
                    <div style="flex: 1; overflow-y: auto; padding-right: 0.5rem;">
                        ${cardRows}
                    </div>
                </div>
                `;
            }
            container.innerHTML = `
                <div class="page-section active" style="display: flex; flex-direction: column; gap: 1rem; padding: 0 1rem; padding-top: 0.5rem; height: 100%;">
                    ${contentHtml}
                </div>
            `;

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
                        tooltip: { enabled: true }
                    },
                    scales: { 
                        x: { ticks: { color: '#888', font: {size: 10} }, grid: { display:false } }, 
                        y: { ticks: { display: false }, grid: { display: false }, border: {display: false} }
                    }
                };

                
                          if (document.getElementById('chart-bkm')) {
                              const commonOpts = {
                                  responsive: true, maintainAspectRatio: false,
                                  plugins: { legend: { display: false } },
                                  scales: {
                                      x: { ticks: { font: { size: 10 }, color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                                      y: { ticks: { font: { size: 10 }, color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                                  }
                              };
                              const pinkColor = '#d6336c';
                              
                              const createChart = (id, data, label) => {
                                  new Chart(document.getElementById(id).getContext('2d'), {
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
                              
                              createChart('chart-bkm', dData.bkm, 'Brüt Kar Marjı (%)');
                              createChart('chart-fkm', dData.fkm, 'FAVÖK Marjı (%)');
                              createChart('chart-nkm', dData.nkm, 'Net Kar Marjı (%)');
                              createChart('chart-cari', dData.cari, 'Cari Oran');
                              createChart('chart-kaldirac', dData.kaldirac, 'Kaldıraç Oranı (%)');
                              createChart('chart-roe', dData.roe, 'Özkaynak Karlılığı (%)');
                          }

                  const ctxSatislar = document.getElementById('chart-ceyreklik-satislar');
                if (ctxSatislar) {
                    new Chart(ctxSatislar, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                data: dData.satislar,
                                backgroundColor: '#4da6ff',
                                borderRadius: 4,
                                barPercentage: 0.6
                            }]
                        },
                        options: cOpts
                    });
                }

                const ctxFavok = document.getElementById('chart-ceyreklik-favok');
                if (ctxFavok) {
                    new Chart(ctxFavok, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                data: dData.favok,
                                backgroundColor: '#4da6ff',
                                borderRadius: 4,
                                barPercentage: 0.6
                            }]
                        },
                        options: cOpts
                    });
                }

                const ctxNetKar = document.getElementById('chart-ceyreklik-netkar');
                if (ctxNetKar) {
                    new Chart(ctxNetKar, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                data: dData.netkar,
                                backgroundColor: '#4da6ff',
                                borderRadius: 4,
                                barPercentage: 0.6
                            }]
                        },
                        options: cOpts
                    });
                }
                
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

window.setHisseTab = (tab) => {
        activeTab = tab;
        window.currentHisseTab = tab;
        renderUI();
    };

    renderUI();
};


const renderHisseIslemleri = (container) => {
    window.currentEditId = window.currentEditId || null;

    const sortedEkstre = [...State.data.ekstre].sort((a, b) => {
        if (a.menkul === 'NAKİT' && b.menkul !== 'NAKİT') return -1;
        if (b.menkul === 'NAKİT' && a.menkul !== 'NAKİT') return 1;
        if (a.menkul !== b.menkul) return a.menkul.localeCompare(b.menkul);
        return new Date(b.tarih) - new Date(a.tarih);
    });

    const hisseFonEkstre = sortedEkstre.filter(e => e.menkul !== 'NAKİT');

    const ekstreRows = hisseFonEkstre.map((e, i) => {
        const isFon = e.menkul.length === 3;
        const tur = isFon ? 'Fon' : 'Hisse';

        if (e.id === window.currentEditId) {
            return `<tr style="background: rgba(0,0,0,0.4);">
                <td>${i + 1}</td>
                <td><input type="date" id="edit-tarih" class="form-control" style="width:100%; font-size:12px; padding:2px; text-align:right;" value="${e.tarih}"></td>
                <td>
                    <select id="edit-tur" class="form-control" style="width:100%; font-size:12px; padding:2px;" onchange="window.updateEditDatalist()">
                        <option value="Hisse" ${!isFon ? 'selected' : ''}>Hisse</option>
                        <option value="Fon" ${isFon ? 'selected' : ''}>Fon</option>
                    </select>
                </td>
                <td><input type="text" id="edit-menkul" class="form-control" style="width:100%; font-size:12px; padding:2px;" value="${e.menkul}" list="${isFon ? 'fon-list' : 'bist-hisse-list'}"></td>
                <td><input type="number" step="0.000001" id="edit-fiyat" class="form-control" style="width:100%; font-size:12px; padding:2px;" value="${e.fiyat}"></td>
                <td><input type="number" step="0.0001" id="edit-adet" class="form-control" style="width:100%; font-size:12px; padding:2px;" value="${e.adet}"></td>
                <td><input type="text" id="edit-tutar" class="form-control" style="width:100%; font-size:12px; padding:2px;" value="${formatCurrency(e.fiyat * Math.abs(e.adet), 0)}" disabled></td>
                <td>
                    <button class="btn" style="padding: 0.1rem 0.3rem; font-size: 12px; background: var(--accent-color);" onclick="window.saveEditEkstre('${e.id}')">Kaydet</button>
                    <button class="btn" style="padding: 0.1rem 0.3rem; font-size: 12px; background: rgba(255,255,255,0.1);" onclick="window.cancelEdit()">İptal</button>
                </td>
            </tr>`;
        }
        return `<tr>
            <td>${i + 1}</td>
            <td style="text-align: right;">${formatDate(e.tarih)}</td>
            <td style="font-weight:600; color: #fff; text-align:left;">${tur}</td>
            <td style="font-weight:600; color: #fff; text-align:left;">${e.menkul}</td>
            <td>${formatCurrency(e.fiyat)}</td>
            <td class="${e.adet >= 0 ? 'text-success' : 'text-danger'}">${e.adet}</td>
            <td>${formatCurrency(e.fiyat * Math.abs(e.adet), 0)}</td>
            <td>
                <button class="btn" style="padding: 0.1rem 0.3rem; font-size: 12px; background: var(--warning-color);" onclick="window.setEditEkstre('${e.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger" style="padding: 0.1rem 0.3rem; font-size: 12px; background: transparent;" onclick="window.deleteEkstre('${e.id}')" title="Sil"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');

    const todayStr = new Date().toISOString().split('T')[0];
    
    const fonSet = new Set();
    State.data.ekstre.forEach(e => {
        if (e.menkul !== 'NAKIT' && e.menkul.length === 3) fonSet.add(e.menkul);
    });
    let fonDatalistOptions = '';
    fonSet.forEach(fon => {
        fonDatalistOptions += `<option value="${fon}">`;
    });

    container.innerHTML = `
        <datalist id="fon-list">${fonDatalistOptions}</datalist>
        <div class="page-section active">
            <div class="table-container glass" style="overflow-x: auto;">
                <div class="table-header">
                    <span>Hisse ve Fon Hareketleri</span>
                    <button class="btn" style="font-size: 12px; padding: 0.3rem 0.8rem; background: var(--success-color);" onclick="window.toggleInlineForm('hisse')">+</button>
                </div>
                <table style="table-layout: fixed; width: 100%;">
                    <thead>
                        <tr><th style="width: 5%;">S.N.</th><th style="width: 15%; text-align: right;">Tarih</th><th style="width: 8%; text-align: left;">Tür</th><th style="width: 12%; text-align: left;">Menkul</th><th style="width: 14%;">Fiyat</th><th style="width: 15%;">Adet</th><th style="width: 13%;">Tutar</th><th style="width: 18%;">İşlem</th></tr>
                    </thead>
                    <tbody id="hisse-tbody">
                        <tr id="inline-hisse-row" style="display: none; background: rgba(0,0,0,0.4);">
                            <td>-</td>
                            <td><input type="date" id="i-tarih" class="form-control" style="width:100%; font-size:12px; padding:4px; text-align:right;" value="${todayStr}"></td>
                            <td>
                                <select id="i-tur" class="form-control" style="width:100%; font-size:12px; padding:4px;" onchange="window.updateInlineDatalist()">
                                    <option value="Hisse" selected>Hisse</option>
                                    <option value="Fon">Fon</option>
                                </select>
                            </td>
                            <td><input type="text" id="i-menkul" class="form-control" style="width:100%; font-size:12px; padding:4px;" placeholder="Hisse Adı" list="bist-hisse-list" autocomplete="off"></td>
                            <td><input type="number" step="0.000001" id="i-fiyat" class="form-control" style="width:100%; font-size:12px; padding:4px;" placeholder="Fiyat"></td>
                            <td><input type="number" step="0.0001" id="i-adet" class="form-control" style="width:100%; font-size:12px; padding:4px;" placeholder="Adet"></td>
                            <td><input type="text" id="i-tutar" class="form-control" style="width:100%; font-size:12px; padding:4px;" placeholder="Tutar" disabled></td>
                            <td>
                                <button class="btn" id="i-submit-btn" style="padding: 0.2rem 0.5rem; font-size: 12px; background: var(--accent-color);" onclick="window.saveInlineHisse()">Ekle</button>
                                <button class="btn" style="padding: 0.2rem 0.5rem; font-size: 12px; background: rgba(255,255,255,0.1);" onclick="window.toggleInlineForm('hisse')">İptal</button>
                            </td>
                        </tr>
                        ${ekstreRows}
                    </tbody>
                </table>
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

    if(document.getElementById('edit-fiyat')) {
        document.getElementById('edit-fiyat').addEventListener('input', () => calcTutar('edit-fiyat', 'edit-adet', 'edit-tutar'));
        document.getElementById('edit-adet').addEventListener('input', () => calcTutar('edit-fiyat', 'edit-adet', 'edit-tutar'));
    }

    window.toggleInlineForm = (type) => {
        const row = document.getElementById(`inline-${type}-row`);
        row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
        window.cancelEdit();
    };

    window.deleteEkstre = (id) => {
        if(confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
            State.deleteEkstre(id);
            if (typeof renderPage === 'function') renderPage();
        }
    };

    window.setEditEkstre = (id) => {
        window.currentEditId = id;
        if (typeof renderPage === 'function') renderPage();
    };
    window.cancelEdit = () => {
        if(window.currentEditId) {
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
};

const renderNakitIslemleri = (container) => {
    window.currentNakitEditId = window.currentNakitEditId || null;
    
    const nakitHareketleriList = [...(State.data.nakitHareketleri || [])].sort((a,b) => new Date(b.tarih) - new Date(a.tarih));
    const nakitRows = nakitHareketleriList.map((n, i) => {
        if (n.id === window.currentNakitEditId) {
            return `<tr style="background: rgba(0,0,0,0.4);">
                <td>${i+1}</td>
                <td><input type="date" id="edit-n-tarih" class="form-control" style="width:100%; font-size:12px; padding:2px; text-align:right;" value="${n.tarih}"></td>
                <td><input type="number" step="0.01" id="edit-n-tutar" class="form-control" style="width:100%; font-size:12px; padding:2px;" value="${n.tutar}"></td>
                <td><input type="number" step="0.01" id="edit-n-bist" class="form-control" style="width:100%; font-size:12px; padding:2px;" value="${n.bist100 || ''}"></td>
                <td><input type="number" step="0.01" id="edit-n-dolar" class="form-control" style="width:100%; font-size:12px; padding:2px;" value="${n.dolar || ''}"></td>
                <td><input type="number" step="0.01" id="edit-n-altin" class="form-control" style="width:100%; font-size:12px; padding:2px;" value="${n.gramAltin || ''}"></td>
                <td>
                    <button class="btn" style="padding: 0.1rem 0.3rem; font-size: 12px; background: var(--accent-color);" onclick="window.saveEditNakit('${n.id}')">Kaydet</button>
                    <button class="btn" style="padding: 0.1rem 0.3rem; font-size: 12px; background: rgba(255,255,255,0.1);" onclick="window.cancelNakitEdit()">İptal</button>
                </td>
            </tr>`;
        }
        return `<tr>
            <td>${i+1}</td><td style="text-align: right;">${formatDate(n.tarih)}</td><td class="${n.tutar >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(n.tutar, 0)}</td><td>${formatNumber(n.bist100)}</td><td>${formatNumber(n.dolar)}</td><td>${formatNumber(n.gramAltin)}</td>
            <td>
                <button class="btn" style="padding: 0.1rem 0.3rem; font-size: 12px; background: var(--warning-color);" onclick="window.setEditNakit('${n.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger" style="padding: 0.1rem 0.3rem; font-size: 12px; background: transparent;" onclick="window.deleteNakit('${n.id}')" title="Sil"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');

    const todayStr = new Date().toISOString().split('T')[0];

    container.innerHTML = `
        <div class="page-section active">
            <div class="table-container glass" style="overflow-x: auto;">
                <div class="table-header">
                    <span>Nakit Hareketleri</span>
                    <button class="btn" style="font-size: 12px; padding: 0.3rem 0.8rem; background: var(--success-color);" onclick="window.toggleInlineForm('nakit')">+</button>
                </div>
                <table style="table-layout: fixed; width: 100%;">
                    <thead>
                        <tr><th style="width: 5%;">S.N.</th><th style="width: 15%; text-align: right;">Tarih</th><th style="width: 15%;">Tutar</th><th style="width: 15%;">XU100</th><th style="width: 15%;">USDTRY</th><th style="width: 15%;">GRAMALTIN</th><th style="width: 20%;">İşlem</th></tr>
                    </thead>
                    <tbody id="nakit-tbody">
                        <tr id="inline-nakit-row" style="display: none; background: rgba(0,0,0,0.4);">
                            <td>-</td>
                            <td><input type="date" id="n-tarih" class="form-control" style="width:100%; font-size:12px; padding:4px; text-align:right;" value="${todayStr}"></td>
                            <td><input type="number" step="0.01" id="n-tutar" class="form-control" style="width:100%; font-size:12px; padding:4px;" placeholder="Tutar"></td>
                            <td><input type="number" step="0.01" id="n-bist" class="form-control" style="width:100%; font-size:12px; padding:4px;" placeholder="XU100"></td>
                            <td><input type="number" step="0.01" id="n-dolar" class="form-control" style="width:100%; font-size:12px; padding:4px;" placeholder="Dolar"></td>
                            <td><input type="number" step="0.01" id="n-altin" class="form-control" style="width:100%; font-size:12px; padding:4px;" placeholder="GRAMALTIN"></td>
                            <td>
                                <button class="btn" id="n-submit-btn" style="padding: 0.2rem 0.5rem; font-size: 12px; background: var(--accent-color);" onclick="window.saveInlineNakitEntry()">Ekle</button>
                                <button class="btn" style="padding: 0.2rem 0.5rem; font-size: 12px; background: rgba(255,255,255,0.1);" onclick="window.toggleInlineForm('nakit')">İptal</button>
                            </td>
                        </tr>
                        ${nakitRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    window.toggleInlineForm = (type) => {
        const row = document.getElementById(`inline-${type}-row`);
        if(row) {
            row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
        }
        window.cancelNakitEdit();
    };

    window.deleteNakit = (id) => {
        if(confirm('Bu nakit hareketini silmek istediğinize emin misiniz?')) {
            State.deleteNakitHareket(id);
            if (typeof renderPage === 'function') renderPage();
        }
    };
    window.setEditNakit = (id) => {
        window.currentNakitEditId = id;
        if (typeof renderPage === 'function') renderPage();
    };
    window.cancelNakitEdit = () => {
        if(window.currentNakitEditId) {
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
            gramAltin: parseFloat(document.getElementById('edit-n-altin').value) || 0
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
            gramAltin: parseFloat(document.getElementById('n-altin').value) || 0
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
            <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 4px; margin-bottom: 0.5rem;">
                <span>${fon}</span>
                <div style="display:flex; align-items:center; gap: 0.5rem;">
                    <input type="number" step="0.000001" id="v-fon-input-${fon}" value="${pFiyat}" class="form-control" style="width: 100px; text-align:right;">
                    <button class="btn" style="padding: 0.2rem 0.5rem; background: var(--accent-color);" onclick="State.updateFiyat('${fon}', document.getElementById('v-fon-input-${fon}').value); alert('Güncellendi!');"><i class="fas fa-check"></i></button>
                </div>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="page-section active" style="display: flex; flex-direction: column; gap: 2rem;">
            
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <!-- Hedef Portföy -->
                <div class="glass" style="flex: 1; padding: 2rem; min-width: 300px;">
                    <h3 style="color: var(--accent-color); margin-bottom: 1rem;">Hedef Portföy</h3>
                    <div style="display:flex; gap: 0.5rem;">
                        <input type="number" step="1" id="v-hedef-input" value="${hedefPortfoy}" class="form-control" style="width:100%;">
                        <button class="btn" style="background: var(--success-color);" onclick="State.data.hedefPortfoyTL = parseFloat(document.getElementById('v-hedef-input').value) || 0; State.save(); alert('Kaydedildi!');">Kaydet</button>
                    </div>
                </div>

                <!-- Fon Fiyatları -->
                <div class="glass" style="flex: 1; padding: 2rem; min-width: 300px;">
                    <h3 style="color: var(--accent-color); margin-bottom: 1rem;">Fon Fiyatları</h3>
                    <div style="max-height: 200px; overflow-y: auto; padding-right: 0.5rem;">
                        ${fonHtml || '<p style="color:var(--text-secondary);">Portföyde fon bulunmuyor.</p>'}
                    </div>
                </div>
            </div>

            <!-- Enflasyon -->
            <div class="glass" style="padding: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin-bottom: 0.5rem; color: var(--accent-color);">Aylık Enflasyon Verileri</h3>
                    <button class="btn" style="font-size: 12px; padding: 0.3rem 0.8rem; background: var(--success-color);" onclick="window.toggleEnfForm()">+</button>
                </div>
                
                <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                    <table style="width: 100%;">
                        <thead style="position: sticky; top: 0; background: var(--bg-card); z-index: 10;">
                            <tr>
                                <th style="text-align:center;">Dönem (Yıl-Ay)</th>
                                <th style="text-align:right;">Aylık Enflasyon (%)</th>
                                <th style="text-align:right;">Kümülatif Enflasyon (%)</th>
                                <th style="text-align:center; width: 80px;">İşlem</th>
                            </tr>
                        </thead>
                        <tbody id="enf-form-tbody">
                            <tr id="enf-form-row" style="display:none; background: rgba(255,255,255,0.05);">
                                <td style="text-align:center;">
                                    <input type="month" id="i-enf-tarih" class="form-control" style="padding:2px 5px; font-size:12px; height:auto; width:100%;" required>
                                </td>
                                <td style="text-align:right;">
                                    <input type="number" id="i-enf-oran" class="form-control" step="0.01" style="padding:2px 5px; font-size:12px; height:auto; width:100%; text-align:right;" required>
                                </td>
                                <td style="text-align:right; color: var(--text-secondary);">-</td>
                                <td style="text-align:center;">
                                    <div style="display:flex; gap:0.2rem; justify-content:center;">
                                        <button class="btn" style="padding:0.2rem; background:var(--accent-color);" onclick="window.addEnflasyon(event)" title="Kaydet"><i class="fas fa-check"></i></button>
                                        <button class="btn btn-danger" style="padding:0.2rem;" onclick="window.toggleEnfForm()" title="İptal"><i class="fas fa-times"></i></button>
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
    }, 50);
};

window.toggleInlineAnaliz = () => {
    const row = document.getElementById('inline-analiz-row');
    if(row) {
        row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
        if (row.style.display === 'table-row') {
            document.getElementById('analiz-borsaci').focus();
        }
    }
};

window.sortAnalizler = (analizlerList) => {
    return analizlerList.sort((a, b) => {
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

        const tarih = tarihEl.value;
        const borsaci = borsaciEl.value.trim();
        const hisse = hisseEl.value.trim().toUpperCase();
        const baglanti = baglantiEl ? baglantiEl.value.trim() : '';
        const notText = notTextEl ? notTextEl.value.trim() : '';
        
        if (!tarih || !borsaci || !hisse) {
            alert('Lütfen Tarih, Analist ve Hisse alanlarını doldurun.');
            return;
        }
        
        if (!State.data.analizler) State.data.analizler = [];
        
        State.data.analizler.push({
            tarih,
            borsaci,
            hisse,
            baglanti,
            notText,
            id: Date.now()
        });
        
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
        
        // Ensure inline row stays visible after renderPage
        setTimeout(() => {
            const row = document.getElementById('inline-analiz-row');
            if (row) row.style.display = 'table-row';
        }, 50);

    } catch (e) {
        alert('Hata oluştu: ' + e.message);
        console.error(e);
    }
};

window.editAnaliz = (id) => {
    const analiz = State.data.analizler.find(a => a.id === id);
    if (!analiz) return;
    
    State.data.analizler = State.data.analizler.filter(a => a.id !== id);
    State.save();
    renderPage();
    
    setTimeout(() => {
        const row = document.getElementById('inline-analiz-row');
        if(row) row.style.display = 'table-row';
        
        const tEl = document.getElementById('analiz-tarih');
        if(tEl) tEl.value = analiz.tarih;
        const bEl = document.getElementById('analiz-borsaci');
        if(bEl) bEl.value = analiz.borsaci;
        const hEl = document.getElementById('analiz-hisse');
        if(hEl) hEl.value = analiz.hisse;
        const lEl = document.getElementById('analiz-baglanti');
        if(lEl) lEl.value = analiz.baglanti || '';
        const nEl = document.getElementById('analiz-not');
        if(nEl) nEl.value = analiz.notText || '';
        
        if(bEl) bEl.focus();
    }, 50);
};

window.deleteAnaliz = (id) => {
    if (!confirm('Bu analizi silmek istediğinize emin misiniz?')) return;
    State.data.analizler = State.data.analizler.filter(a => a.id !== id);
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
    
    const handler = function() {
        let val = this.value.toUpperCase();
        list.innerHTML = '';
        
        let matches = [];
        if (!val) {
            // Show all if empty
            matches = optionsList;
        } else {
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
            matches.forEach(match => {
                const item = document.createElement('div');
                item.style.padding = '10px 15px';
                item.style.cursor = 'pointer';
                item.style.color = '#fff';
                item.style.textAlign = 'left';
                
                if (val) {
                    item.innerHTML = `<strong>${match.substr(0, val.length)}</strong>${match.substr(val.length)}`;
                } else {
                    item.innerHTML = match;
                }
                
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    input.value = match;
                    list.style.display = 'none';
                    if (tableContainer) {
                        tableContainer.style.overflow = '';
                        tableContainer.style.overflowX = 'auto';
                        tableContainer.style.overflowY = 'auto';
                    }
                });
                item.addEventListener('mouseover', () => item.style.background = 'rgba(255,255,255,0.1)');
                item.addEventListener('mouseout', () => item.style.background = 'transparent');
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
    
    input.addEventListener('input', handler);
    input.addEventListener('focus', handler);
    input.addEventListener('click', (e) => { e.stopPropagation(); handler.call(input); });
    
    document.addEventListener('click', (e) => {
        if (e.target !== input && !list.contains(e.target)) {
            list.style.display = 'none';
            const tableContainer = input.closest('.table-container');
            if (tableContainer) {
                tableContainer.style.overflow = '';
                tableContainer.style.overflowX = 'auto';
                tableContainer.style.overflowY = 'auto';
            }
        }
    });
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
                <td style="text-align: right; white-space: nowrap; width: 100px;">${a.tarih ? a.tarih.split('-').reverse().join('.') : ''}</td>
                <td style="text-align: left; white-space: nowrap; width: 140px; padding-left: 10px;">${a.borsaci}</td>
                <td style="text-align: left; font-weight: bold; white-space: nowrap; width: 100px; padding-left: 10px;">${a.hisse}</td>
                <td style="text-align: left; white-space: nowrap; width: 100px; padding-left: 10px;">${linkHtml}</td>
                <td style="text-align: left; word-break: break-word; width: 100%;">${a.notText || ''}</td>
                <td style="text-align: center; white-space: nowrap; width: 90px;">
                    <div style="display: flex; gap: 0.5rem; justify-content: center;">
                        <button class="btn btn-icon" style="color: var(--accent-color);" onclick="window.editAnaliz(${a.id})" title="Düzenle"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-icon" style="color: var(--danger-color);" onclick="window.deleteAnaliz(${a.id})" title="Sil"><i class="fas fa-trash"></i></button>
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
        
        <div class="page-section active" style="display: flex; flex-direction: column; gap: 1rem; max-width: 1200px; margin: 0 auto; padding: 0 1rem; padding-top: 0.5rem; height: 100%;">
            
            <div class="table-container glass" style="flex: 1; overflow-y: auto;">
                <div class="table-header" style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.5rem; border-bottom: 1px solid var(--surface-border); margin-bottom: 0.5rem;">
                    <span>Takip Edilen Analizler</span>
                    <button class="btn" style="font-size: 12px; padding: 0.3rem 0.8rem; background: var(--success-color);" onclick="window.toggleInlineAnaliz()">+</button>
                </div>
                <div style="overflow-x: auto;">
                    <table class="dash-table" style="table-layout: fixed; width: 100%;">
                        <thead>
                            <tr>
                                <th style="text-align: center; color: var(--accent-color); width: 100px; white-space: nowrap;">Tarih</th>
                                <th style="text-align: center; color: var(--accent-color); width: 140px; white-space: nowrap;">Analist</th>
                                <th style="text-align: center; color: var(--accent-color); width: 100px; white-space: nowrap;">Hisse</th>
                                <th style="text-align: center; color: var(--accent-color); width: 100px; white-space: nowrap;">Bağlantı</th>
                                <th style="text-align: left; color: var(--accent-color); width: 100%;">Not</th>
                                <th style="text-align: center; color: var(--accent-color); width: 90px; white-space: nowrap;">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr id="inline-analiz-row" style="display: none; background: rgba(0,0,0,0.4);">
                                <td><input type="date" id="analiz-tarih" class="form-control" style="width:100%; font-size:12px; padding:4px; text-align:right;" value="${today}"></td>
                                <td><input type="text" id="analiz-borsaci" list="analiz-borsaci-list" class="form-control" style="width:100%; font-size:12px; padding:4px; text-align:left;" placeholder="Analist"></td>
                                <td><input type="text" id="analiz-hisse" list="bist-hisse-list" class="form-control" style="width:100%; font-size:12px; padding:4px; text-transform:uppercase; text-align:left;" placeholder="Hisse"></td>
                                <td><input type="text" id="analiz-baglanti" class="form-control" style="width:100%; font-size:12px; padding:4px; text-align:left;" placeholder="Link"></td>
                                <td><input type="text" id="analiz-not" class="form-control" style="width:100%; font-size:12px; padding:4px;" placeholder="Not..."></td>
                                <td style="text-align: center;">
                                    <div style="display: flex; gap: 0.5rem; justify-content: center;">
                                        <button class="btn btn-icon" style="color: var(--success-color);" onclick="window.addAnaliz()" title="Kaydet"><i class="fas fa-check"></i></button>
                                        <button class="btn btn-icon" style="color: var(--danger-color);" onclick="window.toggleInlineAnaliz()" title="İptal"><i class="fas fa-times"></i></button>
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
            </div>
        </div>
    `;

    db.collection('users').doc(currentUser.uid).get().then(doc => {
        if(doc.exists && doc.data().phone) {
            document.getElementById('profile-phone').value = doc.data().phone;
        }
    });

    document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = document.getElementById('profile-name').value;
        const newPhone = document.getElementById('profile-phone').value;
        currentUser.updateProfile({ displayName: newName }).then(() => {
            const unEl = document.getElementById('user-name');
            if(unEl) unEl.innerText = newName;
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

const renderHedef = (container) => {
    let rowsHtml = '';
    
    if (State.data.hedefFiyatlar) {
        let sn = 1;
        const fmtDec = (val) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(val);
        const fmtPct = (val) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(val * 100) + '%';
        
        for (const hisse of Object.keys(State.data.hedefFiyatlar).sort()) {
            const hData = State.data.hedefFiyatlar[hisse];
            if (!hData['2026'] && !hData['2027'] && !hData['2028']) continue;
            
            const guncelFiyat = parseFloat(State.getFiyat(hisse)) || 0;
            
            const renderCell = (year) => {
                if (!hData[year]) return `<td>-</td><td>-</td>`;
                const color = hData[year].potansiyel > 0 ? '#2ecc71' : '#e74c3c';
                return `<td>${fmtDec(hData[year].hedefFiyat)}</td><td style="color:${color}; font-weight:bold;">${fmtPct(hData[year].potansiyel)}</td>`;
            };

            rowsHtml += `<tr>
                <td>${sn++}</td>
                <td style="text-align: left; font-weight:bold; cursor:pointer; color:var(--accent-color); text-decoration:underline;" onclick="window.goToHisse('${hisse}')">${hisse}</td>
                <td>${fmtDec(guncelFiyat)}</td>
                ${renderCell('2026')}
                ${renderCell('2027')}
                ${renderCell('2028')}
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
                            <th>2026<br>Hedef Fiyat</th>
                            <th>2026<br>Potansiyel</th>
                            <th>2027<br>Hedef Fiyat</th>
                            <th>2027<br>Potansiyel</th>
                            <th>2028<br>Hedef Fiyat</th>
                            <th>2028<br>Potansiyel</th>
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
    window.scrollTo(0,0);
};

window.openHisseFromDropdown = (h) => {
    window.currentSelectedHisse = h;
    if (currentPage !== 'hisse_detay') window.currentHisseTab = 'Özet Rapor';
    window.hideHisseDropdown();
    document.querySelectorAll('#primary-sidebar .nav-btn').forEach(btn => btn.classList.remove('active'));
    currentPage = 'hisse_detay';
    if (typeof renderPage === 'function') renderPage();
    window.scrollTo(0,0);
};
window.addHisseToTakip = () => {
    const input = document.getElementById('anasayfa-arama-input');
    if (!input) return;
    const hisseKodu = input.value.trim().toUpperCase();
    if (hisseKodu) {
        if (!State.data.takipListesi) State.data.takipListesi = [];
        if (!State.data.takipListesi.includes(hisseKodu)) {
            State.data.takipListesi.push(hisseKodu);
            State.save();
            input.value = '';
            if(currentPage === 'anasayfa') renderPage();
        } else {
            alert('Bu hisse zaten takip listesinde.');
        }
    }
};

window.removeHisseFromTakip = (hisseKodu) => {
    document.getElementById('theme-confirm-message').innerText = hisseKodu + ' takip listesinden çikarilacak. Emin misiniz?';
    window.themeConfirmAction = () => {
        State.removeTakip(hisseKodu);
        if(currentPage === 'anasayfa') renderPage();
        if(window.updateSecondarySidebar) window.updateSecondarySidebar();
    };
    document.getElementById('theme-confirm-modal').style.display = 'flex';
};

const renderAnasayfa = (container) => {
    let takipList = State.data.takipListesi || [];
    
    // Sort alphabetically
    takipList = [...takipList].sort((a, b) => a.localeCompare(b));

    const fmtDec = (val) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(val);
    const fmtPct = (val) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(val * 100) + '%';
    
    let rowsHtml = '';
    takipList.forEach((hisse, i) => {
        let fiyat = 0;
        const td = window.tickerData && window.tickerData[hisse];
        if (td) {
            fiyat = td.c || 0;
        } else {
            fiyat = State.getFiyat(hisse);
        }
        
        const hData = State.data.hedefFiyatlar && State.data.hedefFiyatlar[hisse] ? State.data.hedefFiyatlar[hisse] : null;
        const renderCell = (year) => {
            if (!hData || !hData[year]) return `<td style="text-align: center;">-</td><td style="text-align: center;">-</td>`;
            const color = hData[year].potansiyel > 0 ? '#2ecc71' : '#e74c3c';
            return `<td style="text-align: center;">${fmtDec(hData[year].hedefFiyat)}</td><td style="text-align: center; color:${color}; font-weight:bold;">${fmtPct(hData[year].potansiyel)}</td>`;
        };
        
        rowsHtml += `
            <tr style="cursor: pointer;" onclick="window.goToHisse('${hisse}')">
                <td style="text-align: center;">${i + 1}</td>
                <td style="text-align: left; font-weight: bold; color: var(--accent-color);">${hisse}</td>
                <td style="text-align: center;">${fmtDec(fiyat)}</td>
                ${renderCell('2026')}
                ${renderCell('2027')}
                ${renderCell('2028')}
                <td style="text-align: center;" onclick="event.stopPropagation()">
                    <button class="btn btn-icon" style="color: var(--danger-color);" onclick="window.removeHisseFromTakip('${hisse}')"><i class="fas fa-trash-alt" style="font-size: 11px;"></i></button>
                </td>
            </tr>
        `;
    });

    if (takipList.length === 0) {
        rowsHtml = `<tr><td colspan="10" style="text-align: center; padding: 2rem;">Takip listeniz boş. Yukarıdan hisse ekleyebilirsiniz.</td></tr>`;
    }

    container.innerHTML = `
        <div class="page-section active" style="display: flex; flex-direction: column; height: 100%; padding: 0px;">

            <!-- Takip Listesi Tablosu -->
            <div class="glass" style="flex: 1; overflow-y: auto; padding: 1rem;">
                <h3 class="table-header">Takip Listesi</h3>
                <div style="overflow-x: auto;">
                    <table class="dash-table compact-table" style="text-align: center;">
                        <thead>
                            <tr>
                                <th style="text-align: center;">S.N</th>
                                <th style="text-align: center;">Hisse</th>
                                <th style="text-align: center;">Fiyat</th>
                                <th style="text-align: center;">2026<br>Hedef Fiyat</th>
                                <th style="text-align: center;">2026<br>Potansiyel</th>
                                <th style="text-align: center;">2027<br>Hedef Fiyat</th>
                                <th style="text-align: center;">2027<br>Potansiyel</th>
                                <th style="text-align: center;">2028<br>Hedef Fiyat</th>
                                <th style="text-align: center;">2028<br>Potansiyel</th>
                                <th style="text-align: center;">İşlem</th>
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
};

// --- APP ENTRY & ROUTING ---
let currentPage = 'anasayfa';




window.confirmAddHisse = () => {
    const input = document.getElementById('modal-hisse-input');
    if (!input) return;
    const hisseKodu = input.value.trim().toUpperCase();
    if (hisseKodu) {
        const defaultStocks = ["THYAO","KCHOL","TUPRS","AKBNK","GARAN","ISCTR","YKBNK","SISE","BIMAS","FROTO","EREGL","SAHOL","ASELS","TCELL","ENKAI","PGSUS","PETKM","TOASO","TTKOM","ARCLK"];
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
        const sortedTakip = [...State.data.takipListesi].sort((a,b) => a.localeCompare(b));
        sortedTakip.forEach(h => {
            dropdownHtml += `<div class="hisse-menu-item" style="padding: 0.3rem 0.8rem; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.65rem; color: #eee;" onclick="window.openHisseFromDropdown('${h}')">${h}</div>`;
        });
        dropdownHtml += `<div style="display:flex; justify-content:space-between; align-items:center; padding: 0.3rem 0.8rem;">
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
    window.scrollTo(0,0);
};

// deleted bad goToGiris


window.toggleSidebar = () => {
    const sidebar = document.getElementById('primary-sidebar');
    if (sidebar) sidebar.classList.toggle('collapsed');
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
    if(homeBtn) homeBtn.classList.add('active');
    currentPage = 'anasayfa';
    if (typeof renderPage === 'function') renderPage();
};

const renderPage = () => {
    // update active nav
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.nav-btn[data-target="${currentPage}"]`);
    if(activeBtn) activeBtn.classList.add('active');

    const container = document.getElementById('main-content');
    if(!container) return;
    
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
        case 'analizler': renderAnalizler(container); break;
        case 'hisse_detay': renderHisseler(container); break;
        case 'ayarlar': renderAyarlar(container); break;
        default: renderAnasayfa(container); break;
    }
};


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
                    tData['gram-altin'] = { Selling: graPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), Change: null };
                }
            }
        } catch(e) { console.error(e); }

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
                        changeHtml = `<span style="font-size: 0.65rem; font-weight: 400; color: ${color}; margin-left: 0.3rem;">%${displayChange}</span>`;
                    }

                    const val = item.data.Selling || item.data.Buying || 0;
                    
                    return `<div style="display: flex; flex-direction: column; align-items: flex-start; min-width: 100px; flex: 1; justify-content: center;">
                        <span style="color: var(--text-secondary); font-size: 0.75rem; font-weight: 500; margin-bottom: 0.1rem; letter-spacing: 0.5px;">${item.label}</span>
                        <div style="font-size: 0.75rem; font-weight: 400; color: var(--text-primary);">
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
            } catch(e) {}
            return null;
        };

        // XU100 ve BRENT'i arka planda çekip tekrar renderla
        Promise.all([fetchTV('turkey', 'BIST:XU100'), fetchTV('global', 'FX:UKOIL')]).then(([x, b]) => {
            if (x) xu100 = x;
            if (b) brent = b;
            renderTicker();
        });

    } catch(e) {
        console.error('Ticker verisi alınamadı:', e);
    }
};

const initApp = () => {
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
    if(!isLoginMode) {
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
    const name = document.getElementById('auth-name').value;
    const phone = document.getElementById('auth-phone').value;

    if (isLoginMode) {
        auth.signInWithEmailAndPassword(email, password).catch(err => alert(err.message));
    } else {
        auth.createUserWithEmailAndPassword(email, password)
            .then(cred => {
                cred.user.updateProfile({ displayName: name }).catch(console.error);
                return db.collection('users').doc(cred.user.uid).set({
                    displayName: name,
                    phone: phone,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            })
            .catch(err => alert(err.message));
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    auth.signOut();
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
        if(State.unsubscribe) State.unsubscribe();
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
    }
});


document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#primary-sidebar .nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.getAttribute('data-target');
            if(target) {
                currentPage = target;
                if(target !== 'hisse_detay') window.closeSecondarySidebar();
                renderPage();
            }
        });
    });
});


// Setup Custom Autocomplete for Search Box
const setupSearchAutocomplete = () => {
    const input = document.getElementById('anasayfa-arama-input');
    const list = document.getElementById('search-autocomplete-list');
    if(!input || !list) return;
    
    input.addEventListener('input', function() {
        let val = this.value.toUpperCase();
        list.innerHTML = '';
        if (!val) {
            list.style.display = 'none';
            return;
        }
        
        window.defaultStocksArray = ["HLGYO","KAYSE","OZRDN","FONET","AVGYO","METRO","DARDL","GOODY","CATES","KRGYO","CIMSA","MPARK","ARASE","AVTUR","BRSAN","IHAAS","ZRE20","ARFYE","MERKO","TDGYO","OFSYM","EGSER","AEFES","TCKRC","VERTU","HTTBT","RUZYE","EDIP","BIGCH","ISYAT","BALAT","MEYSU","TRGYO","KUTPO","SEGMN","BJKAS","INTEK","VBTYZ","AVPGY","GLBMD","IEYHO","BEYAZ","GENIL","PAMEL","MERIT","ISBIR","ARMGD","CEOEM","EUHOL","ALARK","HUNER","OPTGY","OZYSR","SODSN","SELEC","BARMA","UNLU","ENTRA","EDATA","TMSN","DURDO","LXGYO","EKSUN","KUYAS","ISCTR","ARCLK","DITAS","TSGYO","EKIZ","ACSEL","AKMGY","ADEL","GLCVY","AKSEN","RODRG","ETYAT","YONGA","PRKAB","ISMEN","VESTL","INFO","PNLSN","MAKIM","KCHOL","EKGYO","AYEN","GLYHO","AVOD","ALGYO","BRKVY","CLEBI","DOFER","AKHAN","BRISA","RUBNS","VAKBN","ISGYO","GLRMK","OSMEN","SUNTK","BASCM","GMTAS","BRMEN","SUWEN","AGESA","BULGS","GWIND","VKING","VERUS","MARTI","SMRTG","TRHOL","YATAS","CMENT","DMSAS","TUCLK","KARTN","CWENE","ZERGY","SKBNK","KRDMD","BANVT","ALKA","PINSU","TGSAS","KOPOL","FADE","TKFEN","SONME","PRKME","SELVA","AKSGY","LYDHO","EUPWR","PEKGY","EKOS","AYCES","QNBTR","ADGYO","TERA","YESIL","BIGTK","A1YEN","ASGYO","ESCAR","CRDFA","MARMR","VAKKO","KFEIN","KLSER","SVGYO","AYGAZ","KZGYO","AHGAZ","OYAKC","PSDTC","PKART","BALSU","EGEEN","LMKDC","BAKAB","DOCO","HATSN","ALCTL","LIDER","DIRIT","MHRGY","SURGY","EREGL","KRTEK","MOBTL","TEZOL","NATEN","BESTE","LOGO","GEDIK","DENGE","VKGYO","ISKPL","LILAK","AKFIS","HEDEF","PNSUT","MERCN","ALKLC","TURGG","PAPIL","ENPRA","BURVA","OYAYO","BEGYO","YKSLN","VAKFN","TLMAN","BESLR","UCAYM","POLTK","MSGYO","MAVI","EUKYO","ORCAY","CASA","AKYHO","TATGD","FORTE","HRKET","NETAS","KMPUR","BIOEN","ADESE","KAPLM","AYDEM","ULUFA","HATEK","ODAS","ANELE","KRVGD","ZPT10","OPX30","GOZDE","AGYO","PSGYO","GLDTR","PAHOL","GARFA","ULUUN","DURKN","ONRYT","SEKFK","DSTKF","KOCMT","INGRM","BSOKE","EUREN","GENKM","MEDTR","SNPAM","KUVVA","SANKO","AZTEK","SKTAS","KENT","JANTS","MEGAP","ULAS","OZKGY","VAKFA","FMIZP","AGROT","ANHYT","VRGYO","GENTS","BRKO","CEMZY","AKCNS","EGEPO","OPT25","AFYON","MIATK","GOKNR","TSKB","GRNYO","KONKA","SAMAT","LKMNH","LINK","ECOGR","BTCIM","ALBRK","TARKM","TRALT","KBORU","REEDR","FLAP","GUNDG","KTSKR","EGPRO","IHEVA","CVKMD","KLYPV","BOSSA","KOTON","ISFIN","DGGYO","GEDZA","GRTHO","VANGD","DOFRB","YGGYO","IZINV","KRPLS","TEHOL","TUPRS","AGHOL","APBDL","TMPOL","KONTR","NUGYO","TTRAK","HEKTS","AKBNK","DMLKT","IZFAS","PRZMA","TRMET","NIBAS","MARKA","OZSUB","FORMT","BAGFS","RNPOL","MNDRS","AKFYE","ALVES","LYDYE","QUAGR","SKYLP","RYSAS","KORDS","VSNMD","ARDYZ","ONCSM","ORMA","OYLUM","ZPBDL","GEREL","ENJSA","KRONT","BINHO","CANTE","FZLGY","TABGD","PENGD","ATAKP","BINBN","BAHKM","GARAN","FENER","RALYH","GMSTR","ARSAN","BASGZ","RYGYO","AVHOL","AHSGY","USDTR","ICUGS","MACKO","Z30KP","DUNYH","OBAMS","EBEBK","NTGAZ","DGNMO","SUMAS","AYES","DOGUB","SKYMD","MANAS","ISKUR","PARSN","HKTM","YIGIT","ARZUM","EMPAE","ZRGYO","DOAS","KATMR","TURSG","KLGYO","KLRHO","PASEU","KRDMB","TNZTP","BORLS","TAVHL","BRKSN","ULKER","KERVN","INVES","FRMPL","A1CAP","OTTO","BERA","BFREN","IZENR","KLSYN","YUNSA","TOASO","PKENT","SEYKM","EGEGY","ASTOR","PETKM","MZHLD","BNTAS","PENTA","ALTNY","DYOBY","GUBRF","ENDAE","MAGEN","TSPOR","CRFSA","ASUZU","CUSAN","ISSEN","ZEDUR","CMBTN","GESAN","LUKSK","KSTUR","ICBCT","ATEKS","PAGYO","EMKEL","ERBOS","KAREL","ODINE","YYAPI","TBORG","OPK30","MTRYO","APX30","MEPET","SEKUR","TCELL","BIGEN","QNBFK","ZGYO","ISDMR","AKFGY","INVEO","ISGLK","OBASE","DCTTR","YEOTK","LRSHO","SASA","KLNMA","ENERY","TRILC","IHYAY","SAYAS","SISE","INDES","KLMSN","TKNSA","MTRKS","ECZYT","CELHA","ANGEN","CONSE","SANEL","HURGZ","IHGZT","ESCOM","OTKAR","CGCAM","YAPRK","HOROZ","SAHOL","UFUK","EYGYO","CEMTS","RAYSG","SNICA","USAK","GZNMI","SERNT","PLTUR","SOKM","ALKIM","BAYRK","MRGYO","DMRGD","YYLGD","NUHCM","ATSYH","GRSEL","SEGYO","MNDTR","COSMO","ENSRI","ERCB","ENKAI","FRIGO","MMCAS","ASELS","KRSTL","KNFRT","ARENA","MOGAN","BUCIM","Z30KE","IDGYO","PRDGS","DOHOL","ALCAR","EGGUB","DNISI","ZPLIB","KCAER","QTEMZ","SDTTR","YBTAS","BIENY","MAKTK","BURCE","ISBTR","DAPGM","BRYAT","KRDMA","MEGMT","TUREX","BYDNR","BVSAN","ATAGY","GOLTS","BIMAS","ETILR","AKSUE","ANSGR","BIZIM","MARBL","YAYLA","EFOR","EMNIS","HDFGS","SAFKR","DERHL","TATEN","TTKOM","SRVGY","MRSHL","CEMAS","NETCD","KGYO","ZOREN","VESBE","BLUME","IMASM","POLHO","ALTIN","SNGYO","FROTO","TRCAS","ORGE","ALFAS","SILVR","MEKAG","GSDHO","PATEK","HALKB","SARKY","ATLAS","ARTMS","TUKAS","AAGYO","IHLAS","KONYA","GIPTA","MCARD","PCILT","ATATR","RGYAS","TEKTU","SMART","EUYO","SMRVA","AKSA","ELITE","YKBNK","KIMMR","BMSTL","BOBET","AKENR","ULUSE","KZBGY","INTEM","BRLSM","CCOLA","OZGYO","BMSCH","DEVA","GSDDE","DESPC","DESA","ERSU","MAALT","DAGI","IZMDC","KTLEV","PETUN","OSTIM","RTALB","DZGYO","IHLGM","OPTLR","MOPAS","PGSUS","DGATE","NTHOL","ZGOLD","SOKE","EKDMR","SANFM","ATATP","MGROS","ECILC","KARSN","GLRYH","OYYAT","LIDFA","OZATD","THYAO","DERIM","ZSR25","DOKTA","HUBVC","VKFYO","EPLAS","GATEG","GSRAY","AKGRT","KLKIM","TRENJ","BORSK","ESEN","ISGSY","BLCYT"];
        const validStocks = (State.bistStocks && State.bistStocks.length > 0) ? State.bistStocks : defaultStocks;
        
        let matches = validStocks.filter(s => s.startsWith(val));
        if (matches.length === 0) {
            list.style.display = 'none';
            return;
        }
        
        // limit to 15 suggestions
        matches.slice(0, 15).forEach(hisse => {
            let div = document.createElement('div');
            div.innerHTML = `<strong style="color: var(--accent-color);">${hisse.substr(0, val.length)}</strong>${hisse.substr(val.length)}`;
            div.style.padding = '0.5rem 1rem';
            div.style.cursor = 'pointer';
            div.style.fontSize = '12px';
            div.style.color = '#fff';
            div.className = 'autocomplete-item';
            div.onmouseover = () => div.style.background = 'rgba(255,255,255,0.1)';
            div.onmouseout = () => div.style.background = 'transparent';
            
            div.addEventListener('click', function(e) {
                input.value = hisse;
                list.style.display = 'none';
            });
            list.appendChild(div);
        });
        list.style.display = 'flex';
    });

    // Hide when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target !== input && e.target !== list) {
            list.style.display = 'none';
        }
    });
};

setTimeout(setupSearchAutocomplete, 1000);

let takipHideTimeout = null;

window.showSidebarTakip = (btn) => {
    if (takipHideTimeout) clearTimeout(takipHideTimeout);
    const dropdown = document.getElementById('sidebar-takip-dropdown');
    if (!dropdown) return;
    
    const takipList = (State.data.takipListesi || []).slice().sort((a,b) => a.localeCompare(b));
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




window.goToPortfoyTab = (tabId) => {
    currentPage = 'portfoy';
    if (typeof renderPage === 'function') renderPage();
    if (typeof window.switchPortfoyTab === 'function') {
        window.switchPortfoyTab(tabId);
    }
    document.querySelectorAll('#primary-sidebar .nav-btn').forEach(btn => btn.classList.remove('active'));
};




