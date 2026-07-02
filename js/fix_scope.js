const fs = require('fs');
let txt = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

// 1. Remove my injected try-catch
txt = txt.replace('const renderHisseler = (container) => {\n    try {\n', 'const renderHisseler = (container) => {\n');
txt = txt.replace('    } catch(err) { console.error(err); alert("Hisse Sayfası Çöktü: " + err.message + "\\nLütfen bu mesajı uzmana iletin."); }\n', '');

// 2. Remove the inner try-catch that causes the scope bug
// Remove the 'try {' right before 'const odenmisSermaye'
const trySearch = `            try {
            const odenmisSermaye = getVal(sData.bilanco, 'Ödenmiş Sermaye');`;
const tryReplace = `            const odenmisSermaye = getVal(sData.bilanco, 'Ödenmiş Sermaye');`;
txt = txt.replace(trySearch, tryReplace);

// Remove the catch block
const catchSearch = `            const tGuncelDynamic = genTable('Güncel Metrikler', ['Metrik', 'Değer'], gRows);
            } catch(err) {
                console.error(err);
                contentHtml = '<div style="padding: 3rem; color: #fff; text-align: center; background: rgba(0,0,0,0.2); border-radius: 12px; margin: 1rem;"><i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger-color); margin-bottom: 1rem;"></i><h3 style="margin-bottom: 0.5rem;">Veri Bulunamadı veya Hesaplanamadı</h3><p style="color: var(--text-secondary); margin-bottom: 1rem;">Bu hisseye ait bilanço/gelir tablosu verileri eksik veya hatalı olabilir.</p><p style="font-size: 11px; opacity: 0.5;">Hata: ' + err.message + '</p></div>';
            }

            if (activeTab === hName || activeTab === 'Özet Rapor') {`;
const catchReplace = `            const tGuncelDynamic = genTable('Güncel Metrikler', ['Metrik', 'Değer'], gRows);

            if (activeTab === hName || activeTab === 'Özet Rapor') {`;
txt = txt.replace(catchSearch, catchReplace);

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', txt, 'utf8');
console.log("Scope bug fixed.");
