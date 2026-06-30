const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const hisse = process.argv[2];
if (!hisse) {
    console.error("Hisse argumani eksik");
    process.exit(1);
}

const filePath = path.join(__dirname, '..', 'Hisse_Verileri', 'Bilanco', `${hisse}.xlsx`);
if (!fs.existsSync(filePath)) {
    console.log(JSON.stringify({ error: "File not found: " + filePath }));
    process.exit(0);
}

try {
    const workbook = xlsx.readFile(filePath);
    const bilancoSheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[bilancoSheetName], { header: 1 });

    const formatExcelNum = (val) => {
        if (val === undefined || val === null || val === '') return '-';
        if (typeof val === 'number') return new Intl.NumberFormat('tr-TR').format(val);
        return val;
    };

    const getValue = (rIndex, cIndex) => {
        if(!data[rIndex]) return 0;
        const v = data[rIndex][cIndex];
        if(typeof v === 'number') return v;
        if(typeof v === 'string') {
            const parsed = parseFloat(v.replace(/\./g, '').replace(/,/g, '.'));
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    };

    const extractRow = (label, rIndex) => {
        const arr = [label];
        for(let i=1; i<=5; i++) arr.push(formatExcelNum(data[rIndex][i]));
        return arr;
    };

    const bilanco = {
        headers: ['Kalem', ...data[0].slice(1, 6)],
        rows: []
    };

    bilanco.rows.push(extractRow('Dönen Varlıklar', 23));
    bilanco.rows.push(extractRow('Duran Varlıklar', 46));
    bilanco.rows.push(extractRow('Toplam Varlıklar', 47));
    bilanco.rows.push(extractRow('Kısa Vadeli Yükümlülükler', 65));
    bilanco.rows.push(extractRow('Uzun Vadeli Yükümlülükler', 83));

    const rowFinBorc = ['Finansal Borç'];
    const rowNetBorc = ['Net Borç'];
    for(let i=1; i<=5; i++) {
        const finBorc = getValue(49, i) + getValue(67, i); // 50+68
        const netBorc = finBorc - getValue(2, i) - getValue(4, i); // FinBorc - 3 - 5
        rowFinBorc.push(formatExcelNum(finBorc));
        rowNetBorc.push(formatExcelNum(netBorc));
    }
    bilanco.rows.push(rowFinBorc);
    bilanco.rows.push(rowNetBorc);

    console.log(JSON.stringify({ bilanco }));
} catch(e) {
    console.log(JSON.stringify({ error: e.message }));
}
