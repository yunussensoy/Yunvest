const fs = require('fs');

let app = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

// The main task is the "Kişisel Analiz" modal.
// In the current `app_v45.js`, the "Hisse Notları" table might just be a template.
// Let's replace the `showAnalizEkleModal` call in the HTML template.

const searchPlus = `onclick="window.showAnalizEkleModal('\${hisse}')"><i class="fas fa-plus"></i></button>`;
const replacePlus = `onclick="window.showAnalizEkleModal('\${hisse}')" title="Kurum Analizi"><i class="fas fa-plus"></i></button>
<button class="btn btn-icon" style="color: var(--accent-color); margin-left: 5px;" onclick="window.showKisiselNotModal('\${hisse}')" title="Kişisel Not Ekle"><i class="fas fa-plus"></i></button>`;

if (app.includes(searchPlus)) {
    app = app.replace(searchPlus, replacePlus);
    console.log('Added second plus button!');
} else {
    // maybe it has double quotes for \${hisse}?
    const searchPlus2 = `onclick="window.showAnalizEkleModal('\${p.hisse}')"><i class="fas fa-plus"></i></button>`;
    if (app.includes(searchPlus2)) {
        app = app.replace(searchPlus2, searchPlus2 + `\n<button class="btn btn-icon" style="color: var(--accent-color); margin-left: 5px;" onclick="window.showKisiselNotModal('\${p.hisse}')" title="Kişisel Not Ekle"><i class="fas fa-plus"></i></button>`);
        console.log('Added second plus button! (p.hisse)');
    }
}

// Analist name formatting
const searchAnalist = `<td style="text-align: center;">\n                <i class="fas fa-user-tie"`;
if (app.includes(searchAnalist)) {
    app = app.replace(searchAnalist, `<td style="text-align: left; vertical-align: top;">\n                `);
    console.log('Fixed analist alignment');
}

// Check "Analist" header
const searchAnalistTh = `<th>Analist</th>`;
if (app.includes(searchAnalistTh)) {
    app = app.replace(searchAnalistTh, `<th style="font-size: 14px;">Analist</th>`);
    app = app.replace(`<th>Tarih</th>`, `<th style="font-size: 14px;">Tarih</th>`);
    app = app.replace(`<th>Bağlantı</th>`, `<th style="font-size: 14px;">Bağlantı</th>`);
    app = app.replace(`<th>Notlar</th>`, `<th style="font-size: 14px;">Notlar</th>`);
    console.log('Fixed headers to 14px');
}

// Raporlar loading string
if (app.includes('Buluttan raporlar yükleniyor')) {
    app = app.replace(/Buluttan raporlar yükleniyor/g, 'Raporlar aranıyor...');
    console.log('Fixed raporlar string');
}

fs.writeFileSync('e:\\Yunvest\\js\\app_v45_updated.js', app, 'utf8');
console.log('Saved app_v45_updated.js');

// Now let's handle index.html for Kişisel Not Modal
let html = fs.readFileSync('e:\\Yunvest\\index.html', 'utf8');

if (html.includes('>YŞ<')) {
    html = html.replace('>YŞ<', '>Y<');
    console.log('Fixed YŞ logo');
}

if (html.includes('window.closeModal(\'analiz-modal\'); if(window.editingAnalizIndex > -1) State.data.analizler[window.currentHisse].splice(window.editingAnalizIndex, 1);')) {
    html = html.replace('window.closeModal(\'analiz-modal\'); if(window.editingAnalizIndex > -1) State.data.analizler[window.currentHisse].splice(window.editingAnalizIndex, 1);', 'window.closeModal(\'analiz-modal\');');
    console.log('Fixed iptal bug');
}

fs.writeFileSync('e:\\Yunvest\\index_updated.html', html, 'utf8');
console.log('Saved index_updated.html');
