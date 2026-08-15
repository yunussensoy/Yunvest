const fs = require('fs');
const file = 'e:/Yunvest/yunvest/js/app_v53.js';
let d = fs.readFileSync(file, 'utf8');

const saveUnifiedLogic = `
window.saveUnifiedAnaliz = async () => {
    const fileInput = document.getElementById('upload-file');
    const status = document.getElementById('upload-status');
    const baslik = (document.getElementById('analiz-baslik') ? document.getElementById('analiz-baslik').value.trim() : '');
    const baglanti = (document.getElementById('analiz-baglanti') ? document.getElementById('analiz-baglanti').value.trim() : '');
    const borsaci = (document.getElementById('analiz-borsaci') ? document.getElementById('analiz-borsaci').value.trim() : '');
    const tarih = (document.getElementById('analiz-tarih') ? document.getElementById('analiz-tarih').value.trim() : '');
    const notText = (document.getElementById('analiz-not') ? document.getElementById('analiz-not').value.trim() : '');
    const hisse = (document.getElementById('analiz-hisse') ? document.getElementById('analiz-hisse').value.trim().toUpperCase() : (State.ui.selectedHisse || ''));

    const isKisiselNot = (borsaci === 'Yunus Şensoy' || (window.currentUser && borsaci === window.currentUser.displayName));

    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        if (!hisse) {
            if (status) { status.style.display = 'block'; status.style.color = 'var(--danger-color)'; status.innerText = 'Lütfen Hisse kodunu doldurun.'; }
            return;
        }
        if (status) { status.style.display = 'block'; status.style.color = 'var(--text-primary)'; status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GitHub\\'a yükleniyor...'; }

        const file = fileInput.files[0];
        const toBase64 = (f) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(f);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });

        try {
            const base64Content = await toBase64(file);
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileContent: base64Content, fileName: file.name, hisse: hisse })
            });

            if (response.ok) {
                if (status) { status.style.color = 'var(--success-color)'; status.innerText = 'Başarıyla yüklendi!'; }
                if (!window.stockReports) window.stockReports = {};
                if (!window.stockReports[hisse]) window.stockReports[hisse] = [];
                window.stockReports[hisse].push({
                    name: baslik || file.name,
                    tarih: tarih || '-',
                    company: borsaci || '-',
                    file: file.name
                });
                
                fileInput.value = '';
                if(fileInput.previousElementSibling) {
                    fileInput.previousElementSibling.innerHTML = '<span class="fa-stack" style="font-size: 8px; width: 2em; height: 2em;"><i class="fas fa-folder-open fa-stack-2x" style="color: #ffffff;"></i></span><span style="margin-left: 5px;">PDF Seç</span>';
                }
                
                if (typeof renderPage === 'function') renderPage();
            } else {
                const errText = await response.text();
                if (status) { status.style.color = 'var(--danger-color)'; status.innerText = 'Hata: ' + errText; }
            }
        } catch (error) {
            console.error('Yükleme hatası:', error);
            if (status) { status.style.color = 'var(--danger-color)'; status.innerText = 'Yükleme sırasında hata oluştu.'; }
        }
    } else {
        if (isKisiselNot) {
            if (!notText || !hisse) { alert('Lütfen Hisse ve Notlar alanlarını doldurun.'); return; }
        } else {
            if (!tarih || !borsaci || !hisse) { alert('Lütfen Tarih, Analist/Şirket ve Hisse alanlarını doldurun.'); return; }
        }

        if (!State.data.analizler) State.data.analizler = [];

        if (window.currentEditingAnalizId) {
            const index = State.data.analizler.findIndex(a => String(a.id) === String(window.currentEditingAnalizId));
            if (index !== -1) {
                State.data.analizler[index] = { ...State.data.analizler[index], tarih, borsaci, hisse, baslik, baglanti, notText, isKisiselNot };
            }
            window.currentEditingAnalizId = null;
        } else {
            State.data.analizler.push({ tarih, borsaci, hisse, baslik, baglanti, notText, isKisiselNot, id: Date.now() });
        }
        
        if(document.getElementById('analiz-baslik')) document.getElementById('analiz-baslik').value = '';
        if(document.getElementById('analiz-baglanti')) document.getElementById('analiz-baglanti').value = '';
        if(document.getElementById('analiz-borsaci')) document.getElementById('analiz-borsaci').value = '';
        if(document.getElementById('analiz-not')) document.getElementById('analiz-not').value = '';
        
        State.save();
        if (typeof renderPage === 'function') renderPage();
    }
};
`;

if (!d.includes('window.saveUnifiedAnaliz =')) {
    d = d.replace('window.addAnaliz = () => {', saveUnifiedLogic + '\\nwindow.addAnaliz = () => {');
}

const htmlToReplace = fs.readFileSync('e:/Yunvest/yunvest/new_html.txt', 'utf8');

const startMarker = '<div id="inline-analiz-row" class="glass" style="display: none; flex-direction: column;';
const startIdx = d.indexOf(startMarker);

// Find the precise end of the block.
// The end of the block is the end of the `if/else` block inside the `forEach` loop.
// The code looks like this:
//                         }
//                     });
//                     tableHtml += '</tbody></table></div></div></div>';
const search1 = "                        }";
const search2 = "                    });";
const blockString = search1 + '\\r\\n' + search2;
let endIdx = d.indexOf(search2, startIdx);
if (endIdx !== -1) {
    // We want to slice right before `                    });`
    // Wait, the new_html.txt ends with `                        }`!
    // So the replacement should replace everything up to but NOT including `                    });`
    const chunkToReplace = d.substring(startIdx, endIdx);
    d = d.replace(chunkToReplace, htmlToReplace + '\\r\\n');
    fs.writeFileSync(file, d);
    console.log("Success!");
} else {
    // try with \n
    const blockString2 = search1 + '\\n' + search2;
    endIdx = d.indexOf(search2, startIdx);
    if (endIdx !== -1) {
        const chunkToReplace = d.substring(startIdx, endIdx);
        d = d.replace(chunkToReplace, htmlToReplace + '\\n');
        fs.writeFileSync(file, d);
        console.log("Success with \\n!");
    } else {
        console.log("Failed to find end block.");
    }
}
