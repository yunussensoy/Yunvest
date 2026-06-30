// js/excel_parser.js
// Runs in Electron renderer with nodeIntegration: true

window.parseExcelData = (selectedHisse) => {
    let xlsxNode, fsNode, pathNode;
    try {
        fsNode = require('fs');
        pathNode = require('path');
        
        let basePath = '';
        try { basePath = process.cwd(); } catch(e) { basePath = 'E:\\Yunvest'; }
        
        try {
            xlsxNode = require('xlsx');
        } catch(e1) {
            xlsxNode = require(pathNode.join(basePath, 'node_modules', 'xlsx'));
        }
    } catch(e) {
        console.error("Excel parser error: " + e.message);
        return false;
    }

    if (!window.stockData) window.stockData = {};
    if (!window.stockData[selectedHisse]) window.stockData[selectedHisse] = {};

    let basePath = '';
    try { basePath = process.cwd(); } catch(e) { basePath = 'E:\\Yunvest'; }

    const filePath = pathNode.join(basePath, 'Hisseler', selectedHisse, 'bilanco.xlsx');
    
    if (!fsNode.existsSync(filePath)) {
        console.error(`Excel file not found for ${selectedHisse} at ${filePath}`);
        console.log(`Excel file not found for ${selectedHisse} at ${filePath}`);
        return false;
    }

    try {
        const workbook = xlsxNode.readFile(filePath);
        
        // ----------------------------------------------------
        
        const parseSheet = (sheetNamesToTry, isIncomeStatement = false) => {
            let sName = null;
            for (let name of sheetNamesToTry) {
                const found = workbook.SheetNames.find(sn => sn.toLowerCase().includes(name.toLowerCase()));
                if (found) {
                    sName = found; break;
                }
            }
            if (!sName) return null;

            const sheet = workbook.Sheets[sName];
            const data = xlsxNode.utils.sheet_to_json(sheet, { header: 1 });
            if (!data || data.length === 0) return null;

            const formatExcelNum = (val) => {
                if (val === undefined || val === null || val === '') return '-';
                if (typeof val === 'number') return new Intl.NumberFormat('tr-TR').format(val);
                return val;
            };

            const numPeriods = Math.max(0, data[0].length - 1);
            let result = { headers: [], rows: [] };
            
            // Fintables has periods in data[0], starting from index 1
            // Is Yatirim also has periods in data[0], starting from index 1
            for (let i = 0; i <= numPeriods; i++) {
                result.headers.push(data[0][i] || '');
            }

            for (let i = 1; i < data.length; i++) {
                if (!data[i] || !data[i][0]) continue;
                let row = [data[i][0].toString()];
                for (let j = 1; j <= numPeriods; j++) {
                    let val = data[i][j];
                    if (val === undefined) val = '-';
                    else if (typeof val === 'number') val = formatExcelNum(val);
                    row.push(val);
                }
                result.rows.push(row);
            }

            // Calculate Net Borc and Finansal Borclar if Bilanço
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
                    for(let i=0; i<data.length; i++) {
                        if(!data[i] || !data[i][0]) continue;
                        const cleanRow = data[i][0].toString().toLowerCase().replace(/[ıiİI\s]/g, '');
                        if(cleanRow.includes(cleanSearch)) return i;
                    }
                    return -1;
                };

                const idxKisa = findRowIndex('Kısa Vadeli Borçlanmalar');
                const idxKisa2 = findRowIndex('Uzun Vadeli Borçlanmaların Kısa Vadeli Kısımları');
                const idxUzun = findRowIndex('Uzun Vadeli Borçlanmalar');
                const idxNakit = findRowIndex('Nakit ve Nakit Benzerleri');
                const idxFinYatirims = findRowIndex('Finansal Yatırımlar');

                const rowFinBorc = ['Sistem_Fin_Borc_Eklemesi'];
                const rowNetBorc = ['Sistem_Net_Borc_Eklemesi'];

                for (let i = 1; i <= numPeriods; i++) {
                    const kisa = idxKisa !== -1 ? getValueFlex(idxKisa, i) : 0;
                    const kisa2 = idxKisa2 !== -1 ? getValueFlex(idxKisa2, i) : 0;
                    const uzun = idxUzun !== -1 ? getValueFlex(idxUzun, i) : 0;
                    const nakit = idxNakit !== -1 ? getValueFlex(idxNakit, i) : 0;
                    const finYat = idxFinYatirims !== -1 ? getValueFlex(idxFinYatirims, i) : 0;
                    
                    const finBorc = kisa + kisa2 + uzun;
                    const netBorc = finBorc - nakit - finYat;
                    rowFinBorc.push(formatExcelNum(finBorc));
                    rowNetBorc.push(formatExcelNum(netBorc));
                }
                result.rows.push(rowFinBorc);
                result.rows.push(rowNetBorc);
            }

            // Calculate FAVÖK if Income Statement or combined sheet
            const cleanStr = (s) => s.toString().toLocaleLowerCase('tr-TR').replace(/\s+/g, '');
            const idxBrutKar = result.rows.findIndex(r => r[0] && cleanStr(r[0]) === 'brütkar(zarar)');
            const idxGenelYon = result.rows.findIndex(r => r[0] && cleanStr(r[0]).includes('genelyönetim'));
            const idxPazarlama = result.rows.findIndex(r => r[0] && cleanStr(r[0]).includes('pazarlama'));
            const idxArge = result.rows.findIndex(r => r[0] && cleanStr(r[0]).includes('araştırma'));
            
            const idxAmort1 = result.rows.findIndex(r => r[0] && cleanStr(r[0]).includes('amortismangiderleri'));
            const idxAmort2 = result.rows.findIndex(r => r[0] && cleanStr(r[0]).includes('amortisman'));
            
            const hasFavok = result.rows.findIndex(r => r[0] && cleanStr(r[0]) === 'favök') !== -1;
            
            if (!hasFavok && idxBrutKar !== -1) {
                const parseVal = (str) => {
                    if (!str || str === '-') return 0;
                    if (typeof str === 'number') return str;
                    return parseFloat(str.replace(/\./g, '').replace(/,/g, '.')) || 0;
                };

                const rowFavok = ['FAVÖK'];
                const rowEsasFaal = ['Esas Faaliyet Karı'];
                
                for (let i = 1; i <= result.headers.length - 1; i++) {
                    const bk = parseVal(result.rows[idxBrutKar][i]);
                    const gy = idxGenelYon !== -1 ? parseVal(result.rows[idxGenelYon][i]) : 0;
                    const pz = idxPazarlama !== -1 ? parseVal(result.rows[idxPazarlama][i]) : 0;
                    const ar = idxArge !== -1 ? parseVal(result.rows[idxArge][i]) : 0;
                    
                    // Giderler genelde eksi yazilir, o yuzden direkt topluyoruz.
                    const esasK = bk + gy + pz + ar;
                    
                    let am = 0;
                    if (idxAmort1 !== -1) {
                        am = Math.abs(parseVal(result.rows[idxAmort1][i]));
                    } else if (idxAmort2 !== -1) {
                        am = Math.abs(parseVal(result.rows[idxAmort2][i]));
                    }
                    
                    rowFavok.push(formatExcelNum(esasK + am));
                    rowEsasFaal.push(formatExcelNum(esasK));
                }
                result.rows.push(rowFavok);
                result.rows.push(rowEsasFaal);
            }

            return result;
        };

        const parsedBilanco = parseSheet(['Bilanço', 'Bilanço (TL)', workbook.SheetNames[0]], false);
        const parsedGelirYillik = parseSheet(['Yıllıklan', 'Yıllık'], true, true);
        const parsedGelirDonemsel = parseSheet(['Gelir Tablosu (Yıllık)', 'Gelir Tablosu (Dönemsel)', 'Gelir Tablosu'], true);
        const parsedGelirCeyrek = parseSheet(['Gelir Tablosu (Çeyreklik)'], true);
        const parsedNakitAkim = parseSheet(['Nakit Akım', 'Nakit Akım Tablosu'], false);

        if (parsedBilanco) {
            window.stockData[selectedHisse].bilanco = parsedBilanco;
            // Fallbacks for Is Yatirim single sheet structure
            window.stockData[selectedHisse].gelirDonemsel = parsedGelirDonemsel || parsedBilanco;
            window.stockData[selectedHisse].gelirYillik = parsedGelirYillik || parsedGelirDonemsel || parsedBilanco;
            window.stockData[selectedHisse].gelirCeyrek = parsedGelirCeyrek || parsedBilanco;
            window.stockData[selectedHisse].nakitAkim = parsedNakitAkim || parsedBilanco;
        }

        return true;
// Placeholder for future parsing:
        // 2. GELİR TABLOSU (DÖNEMSEL)
        // 3. GELİR TABLOSU (ÇEYREKLİK)
        // ...

        return true;
    } catch (e) {
        console.error(`Error parsing Excel for ${selectedHisse}:`, e);
        return false;
    }
};
