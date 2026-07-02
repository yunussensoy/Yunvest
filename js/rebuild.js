const fs = require('fs');
let app = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

// 1. Varlıklarım tablosunda Kar/Zarar% -> Kar/Zarar <br> %
app = app.replace('<th>Kar/Zarar%</th>', '<th>Kar/Zarar <br> %</th>');
app = app.replace('<th>Kar/Zarar(%)</th>', '<th>Kar/Zarar<br>%</th>');

// 1b. Varlıklarım tablosundaki hisse adlarına tıklayınca sayfalara gitsin
app = app.replace(/<td style="text-align: left; font-weight: bold; color: var\(--accent-color\);">\$\{hisse\}<\/td>/g, 
                 '<td style="text-align: left; font-weight: bold; color: var(--accent-color); cursor: pointer;" onclick="window.goToHisse(\'${hisse}\')">${hisse}</td>');
app = app.replace(/<td style="text-align: left; font-weight: bold; color: var\(--accent-color\);">\$\{p.hisse\}<\/td>/g, 
                 '<td style="text-align: left; font-weight: bold; color: var(--accent-color); cursor: pointer;" onclick="window.goToHisse(\'${p.hisse}\')">${p.hisse}</td>');


// 2. Takip Listesi font sizes and blue links
// In renderAnasayfa, "Takip Listesi" title to 18px
app = app.replace('<h3>Takip Listesi</h3>', '<h3 style="font-size: 18px;">Takip Listesi</h3>');

// Table header font size to 14px
// Wait, we can do this via CSS or inline for "S.N." 
app = app.replace('<th>S.N.</th>', '<th style="font-size: 14px;">S.N.</th>');
// Or just replace all <th> inside the takip-table
app = app.replace(/<table class="dash-table compact-table" style="text-align: center;" id="takip-table">\s*<thead>\s*<tr>\s*(<th[\s\S]*?<\/tr>)/, (match, p1) => {
    return match.replace(/<th>/g, '<th style="font-size: 14px;">');
});

// Link blue for hisse names in takip list
app = app.replace(/<td style="text-align: left; font-weight: bold; color: var\(--accent-color\);">\$\{hisse\}<\/td>/g, 
                  '<td style="text-align: left; font-weight: bold; color: #3498db;">${hisse}</td>'); // Changed from accent-color to blue


// 3. Hisse Notları tablosunda sütun başlıklarını 14px yapalım
app = app.replace(/<table class="dash-table compact-table" id="notlar-table">\s*<thead>\s*<tr>\s*(<th[\s\S]*?<\/tr>)/, (match, p1) => {
    return match.replace(/<th>/g, '<th style="font-size: 14px;">');
});
app = app.replace(/<table class="dash-table compact-table" id="notlar-table">\s*<thead>\s*<tr>\s*<th style="width: 15%;">/g, 
                  '<table class="dash-table compact-table" id="notlar-table"><thead><tr><th style="width: 15%; font-size: 14px;">');

// Hisse Notları: işlemin yanında olan + nın yanına bir + daha ekleyelim (Kişisel Not)
// The original: <button class="btn btn-icon" style="color: var(--success-color);" onclick="window.showAnalizEkleModal('${hisse}')"><i class="fas fa-plus"></i></button>
app = app.replace(/<button class="btn btn-icon" style="color: var\(--success-color\);" onclick="window\.showAnalizEkleModal\('\$\{hisse\}'\)"><i class="fas fa-plus"><\/i><\/button>/g,
                  `<button class="btn btn-icon" style="color: var(--success-color);" onclick="window.showAnalizEkleModal('\${hisse}')"><i class="fas fa-plus"></i></button>
                   <button class="btn btn-icon" style="color: var(--accent-color); margin-left: 5px;" onclick="window.showKisiselNotModal('\${hisse}')" title="Kişisel Not Ekle"><i class="fas fa-plus"></i></button>`);

// Analist sütununun verilerinde insan simgesi varya onu kaldıralım verileri sola hizalayalım.
// vertical-align: top
app = app.replace(/<td style="text-align: center;">\s*<i class="fas fa-user-tie".*?<\/i>\s*\$\{analiz.analist\}\s*<\/td>/g,
                  '<td style="text-align: left; vertical-align: top;">${analiz.analist}</td>');
app = app.replace(/<td style="text-align: center;">\$\{analiz.analist\}<\/td>/g,
                  '<td style="text-align: left; vertical-align: top;">${analiz.analist}</td>');
app = app.replace(/<td>\$\{analiz.notlar.replace\(/g, '<td style="vertical-align: top;">${analiz.notlar.replace(');

// 4. Kişisel analiz penceresi
const kisiselAnalizHTML = `
window.showKisiselNotModal = (hisse) => {
    window.showAnalizEkleModal(hisse);
    setTimeout(() => {
        const kurumSelect = document.getElementById('analiz-kurum');
        if(kurumSelect) {
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
            
            // Trigger change event to hide/show fields
            kurumSelect.dispatchEvent(new Event('change'));
        }
    }, 100);
};
`;

if(!app.includes('window.showKisiselNotModal')) {
    app = app.replace('window.showAnalizEkleModal = (hisse) => {', kisiselAnalizHTML + '\nwindow.showAnalizEkleModal = (hisse) => {');
}

// kurumSelect onchange logic for "Yunus Şensoy"
const analizLogicSearch = `    document.getElementById('analiz-hedef').value = '';
    document.getElementById('analiz-tavsiye').value = 'AL';`;

const analizLogicReplace = `    document.getElementById('analiz-hedef').value = '';
    document.getElementById('analiz-tavsiye').value = 'AL';
    
    document.getElementById('analiz-kurum').addEventListener('change', (e) => {
        const isKisisel = e.target.value === 'Yunus Şensoy' || e.target.value === 'Kişisel Analiz';
        const els = ['analiz-tarih', 'analiz-hedef', 'analiz-tavsiye', 'analiz-link'].map(id => document.getElementById(id).parentElement);
        els.forEach(el => {
            if(el) el.style.display = isKisisel ? 'none' : 'block';
        });
        if(isKisisel) {
            document.getElementById('analiz-tarih').value = '';
            document.getElementById('analiz-hedef').value = '';
            document.getElementById('analiz-link').value = '';
            document.getElementById('analiz-tavsiye').value = '';
        }
    });`;
if(!app.includes("e.target.value === 'Yunus Şensoy'")) {
    app = app.replace(analizLogicSearch, analizLogicReplace);
}

// Sort personal note to 1st row (Kişisel Not 1. satırda olsun)
app = app.replace('const analizler = State.data.analizler[hisse] || [];',
                  `let analizler = (State.data.analizler[hisse] || []).slice();
                   analizler.sort((a,b) => {
                       if (a.analist === 'Yunus Şensoy' && b.analist !== 'Yunus Şensoy') return -1;
                       if (a.analist !== 'Yunus Şensoy' && b.analist === 'Yunus Şensoy') return 1;
                       return 0;
                   });`);

// 5. Analiz iptal silinme hatası
// Originally: window.deleteAnaliz(...) was being called on cancel? No, wait. 
// "analz düzenleme simgesine tıkladığımda iptal dediğimde analiz siliniyor"
// Let's check how edit was done.
const editAnalizSearch = `        State.data.analizler[window.currentHisse].splice(window.editingAnalizIndex, 1);`;
// When editing, if user cancels, it shouldn't splice! Wait, splice is in `saveAnaliz`. 
// If it's a "cancel" button inside modal:
app = app.replace(`onclick="window.closeModal('analiz-modal'); if(window.editingAnalizIndex > -1) State.data.analizler[window.currentHisse].splice(window.editingAnalizIndex, 1);"`,
                  `onclick="window.closeModal('analiz-modal');"`);

// 6. Raporlar Buluttan yükleniyor...
app = app.replace(`buluttan raporlar yükleniyor`, `Raporlar aranıyor...`);
app = app.replace(`Buluttan Raporlar Yükleniyor...`, `Raporlar aranıyor...`);
app = app.replace(`Buluttan raporlar yükleniyor`, `Raporlar aranıyor...`);


// 7. TCKRC Hesaplama $ euro (I will implement a robust target price calculator inside update_modals.js or app_v45.js later, 
// for now let's just make sure the UI is ready).

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', app, 'utf8');
console.log('App updated');
