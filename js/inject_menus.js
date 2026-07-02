const fs = require('fs');

let app = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

// 1. Remove Menus
const oldTabsHtml = `let tabsHtml = makeBtn('Özet Rapor') + 
                       makeDropdown('Finansal Tablolar', ['Bilanço', 'Gelir Tablosu', 'Nakit Akım Tablosu']) +
                       makeDropdown('Oran Analizi', ['Likidite Oranları', 'Kaldıraç Oranları', 'Faaliyet Etkinlik Oranları', 'Karlılık Oranları']) +
                       makeBtn('Diğer Kalemler') +
                       makeDropdown('Raporlar', ['Finansal Rapor', 'Faaliyet Raporu', 'Yatırımcı Sunumu', 'Araştırma Raporu']) +
                       makeBtn('Değerleme') + makeBtn('Hisse Notları');`;
const newTabsHtml = `let tabsHtml = makeBtn('Özet Rapor') + 
                       makeBtn('Raporlar') +
                       makeBtn('Değerleme') + makeBtn('Hisse Notları');`;

if (app.includes(oldTabsHtml)) {
    app = app.replace(oldTabsHtml, newTabsHtml);
    console.log('✅ Replaced tabsHtml');
} else {
    console.log('❌ Failed to replace tabsHtml, searching regex...');
    // regex fallback
    app = app.replace(/let tabsHtml = makeBtn\('Özet Rapor'\).*?makeBtn\('Hisse Notları'\);/s, newTabsHtml);
}

// 2. Remove from validTabs
const oldValidTabs = `const validTabs = ['Özet Rapor', 'Gelir Tablosu', 'Bilanço', 'Nakit Akım Tablosu', 'Raporlar', 'Değerleme', 'Likidite Oranları', 'Kaldıraç Oranları', 'Faaliyet Etkinlik Oranları', 'Karlılık Oranları', 'Diğer Kalemler', 'Finansal Rapor', 'Faaliyet Raporu', 'Yatırımcı Sunumu', 'Araştırma Raporu', 'Özet Rapor Notları', 'Hisse Notları'];`;
const newValidTabs = `const validTabs = ['Özet Rapor', 'Raporlar', 'Değerleme', 'Hisse Notları'];`;
if (app.includes(oldValidTabs)) {
    app = app.replace(oldValidTabs, newValidTabs);
    console.log('✅ Replaced validTabs');
} else {
    app = app.replace(/const validTabs = \['Özet Rapor'.*?'Hisse Notları'\];/, newValidTabs);
}

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', app, 'utf8');
