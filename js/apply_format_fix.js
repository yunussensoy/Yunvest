const fs = require('fs');
let txt = fs.readFileSync('e:/Yunvest/js/app_v45.js', 'utf8');

// Replace Eylemler text
txt = txt.replace(
    'html += `<tr><td style="text-align:left; font-weight:bold; color:var(--text-secondary);">Eylemler</td>`;',
    'html += `<tr><td style="text-align:left; font-weight:bold; color:var(--text-secondary);"></td>`;'
);

// Replace formatCurrency
txt = txt.replace(
    /const formatCurrency = \(val, decimals = 2\) => \{[\s\S]*?\};\n/,
    `const formatCurrency = (val, decimals = 2, symbol = '₺') => {
    if (val === null || val === undefined || isNaN(val)) return decimals === 0 ? (symbol === '€' ? '0'+symbol : symbol+'0') : (symbol === '€' ? '0,00'+symbol : symbol+'0,00');
    const isNegative = val < 0;
    const absVal = Math.abs(val);
    const numStr = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(absVal);
    return (isNegative ? '-' : '') + (symbol === '€' ? numStr + symbol : symbol + numStr);
};\n`
);

// Replace formatDate
txt = txt.replace(
    /const formatDate = \(dateStr\) => \{[\s\S]*?\};\n/,
    `const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if(isNaN(d)) return dateStr;
    const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    const day = d.getDate().toString().padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear().toString().slice(2);
    return \`\${day} \${month} \${year}\`;
};\n`
);

// Update Değerleme display currency format
txt = txt.replace(
    /displayVal = currencySymbol \+ new Intl\.NumberFormat\('tr-TR', \{ maximumFractionDigits:2 \}\)\.format\(numVal\);/g,
    `displayVal = currencySymbol === '€' ? new Intl.NumberFormat('tr-TR', { maximumFractionDigits:2 }).format(numVal) + '€' : currencySymbol + new Intl.NumberFormat('tr-TR', { maximumFractionDigits:2 }).format(numVal);`
);

fs.writeFileSync('e:/Yunvest/js/app_v45.js', txt, 'utf8');
console.log('Update Complete');
