const fs = require('fs');
let txt = fs.readFileSync('e:/Yunvest/js/app_v45.js', 'utf8');

const recalculateFunc = `
window.recalculateHedefFiyatlar = () => {
    if (!State.data.degerleme) return;
    if (!State.data.hedefFiyatlar) State.data.hedefFiyatlar = {};
    
    const getVal = (sheet, rowName) => {
        if (!sheet || !sheet.rows) return 0;
        const searchStr = rowName.toLowerCase().replace(/[öçşğıü]/g, '');
        const row = sheet.rows.find(r => {
            if (!r[0]) return false;
            const t = r[0].toLowerCase().replace(/[öçşğıü]/g, '');
            return t.includes(searchStr);
        });
        if (!row) return 0;
        const v = row[1];
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
            const p = parseFloat(v.replace(/\\./g, '').replace(/,/g, '.'));
            return isNaN(p) ? 0 : p;
        }
        return 0;
    };

    for (const hisse of Object.keys(State.data.degerleme)) {
        if (window.parseExcelData && (!window.stockData || !window.stockData[hisse] || !window.stockData[hisse].bilanco)) {
            try { window.parseExcelData(hisse); } catch(e) {}
        }
        const sData = (window.stockData && window.stockData[hisse]) ? window.stockData[hisse] : null;
        if (!sData) continue;

        let finansalBorclarTotal = 0;
        let nakitTotal = 0;
        if (sData.bilanco && sData.bilanco.rows) {
            sData.bilanco.rows.forEach(r => {
                if (!r[0]) return;
                const rName = r[0].toLocaleLowerCase('tr-TR');
                if (rName.includes('finansal borçlar') && !rName.includes('kısımlar') && !rName.includes('ksmlar') && (!sData.bilanco.rows.length || sData.bilanco.rows.indexOf(r) < sData.bilanco.rows.length - 2)) {
                    const val = typeof r[1] === 'number' ? r[1] : parseFloat((r[1]||'').replace(/\\./g, '').replace(/,/g, '.')) || 0;
                    finansalBorclarTotal += val;
                }
                if (rName.includes('nakit ve nakit benzerleri') || rName.includes('nakit ve nakit değerler')) {
                    const val = typeof r[1] === 'number' ? r[1] : parseFloat((r[1]||'').replace(/\\./g, '').replace(/,/g, '.')) || 0;
                    nakitTotal += val;
                }
            });
        }
        const netBorc = finansalBorclarTotal - nakitTotal;
        const odenmisSermaye = getVal(sData.bilanco, 'Ödenmiş Sermaye');
        const guncelFiyat = parseFloat(State.getFiyat(hisse)) || 0;
        const usdtry = parseFloat(State.getFiyat('USDTRY')) || 32.50;
        const eurKuru = window.euroKuru || 35.00;
        const usdKuru = window.dolarKuru || 32.50;

        if (!State.data.hedefFiyatlar[hisse]) State.data.hedefFiyatlar[hisse] = {};

        const years = ['2026', '2027', '2028'];
        years.forEach(y => {
            const d = State.data.degerleme[hisse][y];
            if (!d) return;
            const pNum = (val) => (val === undefined || val === null || val === '') ? null : parseFloat(val);
            const curCurrency = d.currency || 'TRY';
            
            let ySatis = pNum(d['Satış Gelirleri']);
            let yFavokMarji = pNum(d['FAVÖK Marjı']);
            let yNetKarMarji = pNum(d['Net Kar Marjı']);
            let yFdFavok = pNum(d['FD/FAVÖK']);
            let yFk = pNum(d['F/K']);
            let yPdDd = pNum(d['PD/DD']);
            let yOzkaynak = pNum(d['Özkaynaklar']);
            
            let favok = (ySatis !== null && yFavokMarji !== null) ? ySatis * (yFavokMarji/100) : null;
            let netKar = (ySatis !== null && yNetKarMarji !== null) ? ySatis * (yNetKarMarji/100) : null;
            
            let pd1 = (favok !== null && yFdFavok !== null) ? (favok * yFdFavok) - netBorc : null;
            let pd2 = (netKar !== null && yFk !== null) ? (netKar * yFk) : null;
            let pd3 = (yOzkaynak !== null && yPdDd !== null) ? (yOzkaynak * yPdDd) : null;
            
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
};
`;

if (!txt.includes('window.recalculateHedefFiyatlar')) {
    txt += '\\n' + recalculateFunc + '\\n';
}

txt = txt.replace(
    'const renderAnasayfa = (container) => {\\n    let takipList',
    'const renderAnasayfa = (container) => {\\n    if (window.recalculateHedefFiyatlar) window.recalculateHedefFiyatlar();\\n    let takipList'
);

txt = txt.replace(
    'const renderHedef = (container) => {\\n    let rowsHtml',
    'const renderHedef = (container) => {\\n    if (window.recalculateHedefFiyatlar) window.recalculateHedefFiyatlar();\\n    let rowsHtml'
);

fs.writeFileSync('e:/Yunvest/js/app_v45.js', txt, 'utf8');
console.log('Update Complete');
