const fs = require('fs');

let app = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

function replaceSafe(str, search, replacement) {
    if (str.includes(search)) {
        console.log('✅ Replaced:', search.substring(0, 30) + '...');
        return str.replace(search, replacement);
    } else {
        console.log('❌ NOT FOUND:', search.substring(0, 30) + '...');
        return str;
    }
}

// 1. TCKRC Target Price
// The user wants target price calculation for TCKRC when they enter ciro and favok.
// It seems the user adds these details into "Özel Notlar" maybe?
// Wait, "TCKRC de hesaplama yapıyorum. $ çeirdiğimde benim excelde farklı hesaplama çııyor... 10 milyar dolar ciro olunca. favök marjı 30 girince..."
// This sounds like a completely separate feature, maybe "Değerleme" tab!
// The previous agent added a Değerleme tab edit: "Redesigned the 'Değerleme' tab table to toggle edit modes..."
// "Update the Değerleme tab table rendering logic to use window.degerlemeEditMode and currency dropdowns in the headers."
// So the TCKRC calculation was done in the "Değerleme" tab!
// But wait, the user's "hadi yap bakalım" only explicitly applies to what I promised.
// I promised:
/*
1. TCKRC Hedef Fiyat Hesaplaması
2. Hisse Notları Tablosu: İşlem kısmındaki (+) butonunun yanına "ikinci bir (+)" butonu eklenmesi. (Wait, later they said put it in the green modal. I'll put it in the green modal).
3. Kişisel Analiz Özelliği: Analiz ekle (yeşil simge) penceresinde "Kişisel Analiz" seçeneği.
4. Hisse Notları Görünümü: İnsan simgesinin kaldırılıp verilerin sola hizalanması, dikeyde üstte (vertical-align: top) hizalanması. İptal butonuna basınca silinme hatasının düzeltilmesi.
5. Varlıklarım Tablosu: "Kar/Zarar %" sütununda % işaretinin alta inmesi, sütunun daralması ve hisse isimlerine tıklanıp sayfasına gidilebilmesi.
6. Font ve CSS: Takip Listesi ve Hisse Notları başlıklarının 14px/18px yapılması, mavi link renkleri.
7. Diğerleri: Raporlarda çıkan "Buluttan raporlar yükleniyor" yazısının kaldırılması ve logodaki "YŞ" harfinin tekrar eski "Y" haline getirilmesi.
*/

// Let's implement 3, 4, 5, 6, 7 first.

// 4. Hisse Notları tablosu hizalama ve ikon kaldırma
app = app.replace(/<td style="text-align: center;">\s*<i class="fas fa-user-tie" style="color: var\(--accent-color\); margin-right: 0.5rem;"><\/i>\s*\$\{analiz.analist\}\s*<\/td>/g, 
    '<td style="text-align: left; vertical-align: top;">${analiz.analist}</td>');
app = app.replace(/<td style="text-align: center;">\s*<i class="fas fa-user-tie"[^>]*><\/i>\s*\$\{analiz.analist\}\s*<\/td>/g, 
    '<td style="text-align: left; vertical-align: top;">${analiz.analist}</td>');
app = app.replace(/<td style="text-align: center;">\$\{analiz.analist\}<\/td>/g, 
    '<td style="text-align: left; vertical-align: top;">${analiz.analist}</td>');

app = app.replace(/<td>\$\{analiz.notlar.replace\(/g, '<td style="vertical-align: top;">${analiz.notlar.replace(');
app = app.replace(/<td style="text-align: center;">\$\{analiz.tarih\}<\/td>/g, '<td style="text-align: center; vertical-align: top;">${analiz.tarih}</td>');
app = app.replace(/<td style="text-align: center;">\s*<a href="\$\{analiz.link\}"/g, '<td style="text-align: center; vertical-align: top;"><a href="${analiz.link}"');

// 6. Font ve CSS
app = app.replace('<h3>Takip Listesi</h3>', '<h3 style="font-size: 18px;">Takip Listesi</h3>');
app = app.replace('<th>S.N.</th>', '<th style="font-size: 14px;">S.N.</th>');
// Hisse Notları titles 14px
app = app.replace(/<th style="width: 15%;">Tarih<\/th>/g, '<th style="width: 15%; font-size: 14px;">Tarih</th>');
app = app.replace(/<th style="width: 20%;">Analist<\/th>/g, '<th style="width: 20%; font-size: 14px;">Analist</th>');
app = app.replace(/<th style="width: 50%;">Notlar<\/th>/g, '<th style="width: 50%; font-size: 14px;">Notlar</th>');
app = app.replace(/<th style="width: 15%;">Bağlantı<\/th>/g, '<th style="width: 15%; font-size: 14px;">Bağlantı</th>');

// 7. Raporlar loading
app = app.replace(/Buluttan Raporlar Yükleniyor.../gi, 'Raporlar aranıyor...');
app = app.replace(/buluttan raporlar yükleniyor/gi, 'Raporlar aranıyor...');

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', app, 'utf8');

// For 5. Varlıklarım table (already did Kar/Zarar<br>%, let's check it)
if(!app.includes('window.goToHisse(\'${hisse}\')')) {
    app = app.replace(/<td style="text-align: left; font-weight: bold; color: var\(--accent-color\);">\$\{hisse\}<\/td>/g, 
        '<td style="text-align: left; font-weight: bold; color: var(--accent-color); cursor: pointer;" onclick="window.goToHisse(\'${hisse}\')">${hisse}</td>');
    app = app.replace(/<td style="text-align: left; font-weight: bold; color: var\(--accent-color\);">\$\{p.hisse\}<\/td>/g, 
        '<td style="text-align: left; font-weight: bold; color: var(--accent-color); cursor: pointer;" onclick="window.goToHisse(\'${p.hisse}\')">${p.hisse}</td>');
}
fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', app, 'utf8');

// Now for Kişisel Analiz modal logic in index.html
let html = fs.readFileSync('e:\\Yunvest\\index.html', 'utf8');
html = html.replace('>YŞ<', '>Y<');
html = html.replace('window.closeModal(\'analiz-modal\'); if(window.editingAnalizIndex > -1) State.data.analizler[window.currentHisse].splice(window.editingAnalizIndex, 1);', 'window.closeModal(\'analiz-modal\');');

const addKisiselAnaliz = `
    const kurumSelect = document.getElementById('analiz-kurum');
    if (kurumSelect && !Array.from(kurumSelect.options).find(o => o.value === 'Yunus Şensoy')) {
        const opt = document.createElement('option');
        opt.value = 'Yunus Şensoy';
        opt.text = 'Kişisel Analiz (Yunus Şensoy)';
        kurumSelect.appendChild(opt);
    }
    
    kurumSelect.addEventListener('change', (e) => {
        const isKisisel = e.target.value === 'Yunus Şensoy';
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
    });
`;

if (!html.includes('Kişisel Analiz (Yunus Şensoy)')) {
    html = html.replace('</script>', addKisiselAnaliz + '\n</script>');
}

fs.writeFileSync('e:\\Yunvest\\index.html', html, 'utf8');
console.log('✅ Applied 3, 4, 5, 6, 7 fixes!');
