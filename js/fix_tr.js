const fs = require('fs');
let content = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

// Replace standard broken patterns
content = content.replace(/\uFFFDzet Rapor/g, 'Özet Rapor');
content = content.replace(/Bilan\uFFFDo/g, 'Bilanço');
content = content.replace(/Nakit Ak\uFFFDm Tablosu/g, 'Nakit Akım Tablosu');
content = content.replace(/De\uFFFDY?erleme/g, 'Değerleme');
content = content.replace(/Likidite Oranlar\uFFFD/g, 'Likidite Oranları');
content = content.replace(/Kald\uFFFDa\uFFFD Oranlar\uFFFD/g, 'Kaldıraç Oranları');
content = content.replace(/Kald\uFFFDra\uFFFD Oranlar\uFFFD/g, 'Kaldıraç Oranları');
content = content.replace(/Karl\uFFFDl\uFFFDk Oranlar\uFFFD/g, 'Karlılık Oranları');
content = content.replace(/Di\uFFFDY?er Kalemler/g, 'Diğer Kalemler');
content = content.replace(/Yat\uFFFDr\uFFFDmc\uFFFD Sunumu/g, 'Yatırımcı Sunumu');
content = content.replace(/Ara\uFFFDY?t\uFFFDrma Raporu/g, 'Araştırma Raporu');
content = content.replace(/Ayl\uFFFDk Enflasyon/g, 'Aylık Enflasyon');
content = content.replace(/Hedef Portf\uFFFDy/g, 'Hedef Portföy');
content = content.replace(/Fon Fiyatlar\uFFFD/g, 'Fon Fiyatları');
content = content.replace(/Hen\uFFFDz/g, 'Henüz');
content = content.replace(/yap\uFFFDlmam\uFFFD/g, 'yapılmamış');
content = content.replace(/bo\uFFFD\./g, 'boş.');
content = content.replace(/Yukar\uFFFDdan/g, 'Yukarıdan');
content = content.replace(/eklenmi\uFFFD/g, 'eklenmiş');
content = content.replace(/i\uFFFDin/g, 'için');

// Also update validTabs
content = content.replace(/const validTabs = \[.*?\];/, 
    "const validTabs = ['Özet Rapor', 'Gelir Tablosu', 'Bilanço', 'Nakit Akım Tablosu', 'Raporlar', 'Değerleme', 'Likidite Oranları', 'Kaldıraç Oranları', 'Faaliyet Etkinlik Oranları', 'Karlılık Oranları', 'Diğer Kalemler', 'Finansal Rapor', 'Faaliyet Raporu', 'Yatırımcı Sunumu', 'Araştırma Raporu', 'Özet Rapor Notları', 'Hisse Notları'];");

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', content, 'utf8');
console.log('Fixed U+FFFD characters in JS.');