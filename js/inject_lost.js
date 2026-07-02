const fs = require('fs');

function applyFeature(appContent, searchStr, replaceStr, desc) {
    if (appContent.includes(searchStr)) {
        appContent = appContent.replace(searchStr, replaceStr);
        console.log('✅ Applied:', desc);
    } else {
        console.log('❌ Failed to find:', desc);
    }
    return appContent;
}

function applyRegexFeature(appContent, regex, replaceStr, desc) {
    if (regex.test(appContent)) {
        appContent = appContent.replace(regex, replaceStr);
        console.log('✅ Applied (regex):', desc);
    } else {
        console.log('❌ Failed to find (regex):', desc);
    }
    return appContent;
}

let app = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

// 1. TCKRC Hedef Fiyat Hesaplama (Excel vs Dolar ciro)
// I will implement a global check for "TCKRC" inside renderHisse.
// But first, let's just make the "Hisse Notları" modal work properly.

app = applyRegexFeature(app, /<h3>Hisse Notları<\/h3>/, '<h3 style="font-size: 14px;">Hisse Notları</h3>', 'Hisse Notları başlık 14px');

app = applyRegexFeature(app, /<th style="width: 15%;">Tarih<\/th>/, '<th style="width: 15%; font-size: 14px;">Tarih</th>', 'Hisse Notları Tarih 14px');
app = applyRegexFeature(app, /<th style="width: 20%;">Analist<\/th>/, '<th style="width: 20%; font-size: 14px;">Analist</th>', 'Hisse Notları Analist 14px');
app = applyRegexFeature(app, /<th style="width: 50%;">Notlar<\/th>/, '<th style="width: 50%; font-size: 14px;">Notlar</th>', 'Hisse Notları Notlar 14px');
app = applyRegexFeature(app, /<th style="width: 15%;">Bağlantı<\/th>/, '<th style="width: 15%; font-size: 14px;">Bağlantı</th>', 'Hisse Notları Bağlantı 14px');

app = applyRegexFeature(app, /<th style="width: 15%; font-size: 14px;">Tarih<\/th>/, '<th style="width: 15%; font-size: 14px;">Tarih</th>', 'Hisse Notları Tarih 14px');


app = applyRegexFeature(app, 
    /<button class="btn btn-icon" style="color: var\(--success-color\);" onclick="window\.showAnalizEkleModal\('\$\{hisse\}'\)"><i class="fas fa-plus"><\/i><\/button>/,
    `<button class="btn btn-icon" style="color: var(--success-color);" onclick="window.showAnalizEkleModal('\${hisse}')" title="Kurum Analizi"><i class="fas fa-plus"></i></button>
     <button class="btn btn-icon" style="color: var(--accent-color); margin-left: 5px;" onclick="window.showKisiselNotModal('\${hisse}')" title="Kişisel Not Ekle"><i class="fas fa-plus"></i></button>`,
    'İkinci + butonu'
);


// Modals Logic - window.showAnalizEkleModal is missing in app_v45.js? Let's check index.html!
let html = fs.readFileSync('e:\\Yunvest\\index.html', 'utf8');

html = applyRegexFeature(html, />YŞ</, '>Y<', 'Logo YŞ to Y');

// Kişisel Analiz modal logic is actually in index.html scripts!
const modalLogic = `
window.showKisiselNotModal = function(hisse) {
    document.getElementById('analiz-hisse').value = hisse;
    const kurumSelect = document.getElementById('analiz-kurum');
    let exists = false;
    for(let i=0; i<kurumSelect.options.length; i++){
        if(kurumSelect.options[i].value === 'Yunus Şensoy') exists = true;
    }
    if(!exists) {
        const opt = document.createElement('option');
        opt.value = 'Yunus Şensoy';
        opt.text = 'Kişisel Analiz (Yunus Şensoy)';
        kurumSelect.appendChild(opt);
    }
    kurumSelect.value = 'Yunus Şensoy';
    document.getElementById('analiz-tarih').value = '';
    document.getElementById('analiz-hedef').value = '';
    document.getElementById('analiz-tavsiye').value = '';
    document.getElementById('analiz-link').value = '';
    
    // Hide fields
    const els = ['analiz-tarih', 'analiz-hedef', 'analiz-tavsiye', 'analiz-link'].map(id => document.getElementById(id).parentElement);
    els.forEach(el => { if(el) el.style.display = 'none'; });
    
    window.openModal('analiz-modal');
};

window.showAnalizEkleModal = function(hisse) {
    document.getElementById('analiz-hisse').value = hisse;
    document.getElementById('analiz-kurum').value = '';
    document.getElementById('analiz-tarih').value = '';
    document.getElementById('analiz-hedef').value = '';
    document.getElementById('analiz-tavsiye').value = 'AL';
    document.getElementById('analiz-link').value = '';
    
    // Show fields
    const els = ['analiz-tarih', 'analiz-hedef', 'analiz-tavsiye', 'analiz-link'].map(id => document.getElementById(id).parentElement);
    els.forEach(el => { if(el) el.style.display = 'block'; });

    window.openModal('analiz-modal');
};
`;

if (!html.includes('showKisiselNotModal')) {
    html = html.replace('</script>', '\n' + modalLogic + '\n</script>');
    console.log('✅ Added showKisiselNotModal to index.html');
}

// Analiz İptal Butonu hatası
html = applyRegexFeature(html, /onclick="window\.closeModal\('analiz-modal'\); if\(window\.editingAnalizIndex > -1\) State\.data\.analizler\[window\.currentHisse\]\.splice\(window\.editingAnalizIndex, 1\);"/,
                        `onclick="window.closeModal('analiz-modal');"`, 'Analiz iptal silinme hatası');

fs.writeFileSync('e:\\Yunvest\\index.html', html, 'utf8');

// Back to app_v45.js

// Analist vertical alignment and icon
app = applyRegexFeature(app, /<td style="text-align: center;">\s*<i class="fas fa-user-tie".*?<\/i>\s*\$\{analiz.analist\}\s*<\/td>/,
                            '<td style="text-align: left; vertical-align: top;">${analiz.analist}</td>', 'Analist icon removal and align');
app = applyRegexFeature(app, /<td style="text-align: center;">\$\{analiz.analist\}<\/td>/g,
                            '<td style="text-align: left; vertical-align: top;">${analiz.analist}</td>', 'Analist left align');

// Tarih, Notlar, Bağlantı vertical align
app = applyRegexFeature(app, /<td>\$\{analiz.notlar/g, '<td style="vertical-align: top;">${analiz.notlar', 'Notlar vertical align');
app = applyRegexFeature(app, /<td style="text-align: center;">\$\{analiz.tarih\}/g, '<td style="text-align: center; vertical-align: top;">${analiz.tarih}', 'Tarih vertical align');
app = applyRegexFeature(app, /<td style="text-align: center;">\s*<a href="\$\{analiz.link\}"/g, '<td style="text-align: center; vertical-align: top;"><a href="${analiz.link}"', 'Link vertical align');


fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', app, 'utf8');
console.log('Done!');
