const fs = require('fs');
let content = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

// Replace validTabs and activeTab initialization
const regex = /const validTabs = \[[^;]+\];\s*let activeTab = window\.currentHisseTab \|\| '[^']+';\s*if \(\!validTabs\.includes\(activeTab\)\) \{\s*activeTab = '[^']+';\s*window\.currentHisseTab = activeTab;\s*\}/;

const replacement = `const validTabs = ['Özet Rapor', 'Gelir Tablosu', 'Bilanço', 'Nakit Akım Tablosu', 'Raporlar', 'Değerleme', 'Likidite Oranları', 'Kaldıraç Oranları', 'Faaliyet Etkinlik Oranları', 'Karlılık Oranları', 'Diğer Kalemler', 'Finansal Rapor', 'Faaliyet Raporu', 'Yatırımcı Sunumu', 'Araştırma Raporu', 'Özet Rapor Notları', 'Hisse Notları'];
    let activeTab = window.currentHisseTab || 'Özet Rapor';
    if (!validTabs.includes(activeTab)) {
        activeTab = 'Özet Rapor';
        window.currentHisseTab = activeTab;
    }`;

content = content.replace(regex, replacement);

// Replace all occurrences of setting currentHisseTab to broken 'zet Rapor' strings
content = content.replace(/window\.currentHisseTab = '[^']+zet Rapor'/g, "window.currentHisseTab = 'Özet Rapor'");

// Fix Takip Listesi table padding. Look for `<!-- Takip Listesi Tablosu -->` block and add style padding
content = content.replace(/<table class="dash-table compact-table" style="text-align: center;">/g, '<table class="dash-table compact-table" style="text-align: center;" id="takip-table">');

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', content, 'utf8');
console.log("Fixed routing blocks and table.");