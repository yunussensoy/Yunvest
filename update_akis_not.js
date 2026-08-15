const fs = require('fs');
let d = fs.readFileSync('e:/Yunvest/yunvest/js/app_v53.js', 'utf8');

// 1. Add window.toggleAkisTipi inside or near window.saveUnifiedAnaliz
const toggleFunc = `
window.toggleAkisTipi = () => {
    const isKisisel = document.querySelector('input[name="akisTipi"][value="kisisel"]').checked;
    const genelInputs = document.getElementById('akis-genel-inputs');
    if(genelInputs) {
        genelInputs.style.display = isKisisel ? 'none' : 'flex';
    }
};
`;

if(!d.includes('window.toggleAkisTipi =')) {
    d = d.replace('window.saveUnifiedAnaliz = async () => {', toggleFunc + '\nwindow.saveUnifiedAnaliz = async () => {');
}

// 2. Update window.saveUnifiedAnaliz to read akisTipi
const saveLogicOld = `const hisse = (document.getElementById('analiz-hisse') ? document.getElementById('analiz-hisse').value.trim().toUpperCase() : (State.ui.selectedHisse || ''));

    const isKisiselNot = (borsaci === 'Yunus Şensoy' || (window.currentUser && borsaci === window.currentUser.displayName));`;

const saveLogicNew = `const hisse = (document.getElementById('analiz-hisse') ? document.getElementById('analiz-hisse').value.trim().toUpperCase() : (State.ui.selectedHisse || ''));

    const akisTipiRadio = document.querySelector('input[name="akisTipi"]:checked');
    const akisTipi = akisTipiRadio ? akisTipiRadio.value : 'analiz';
    
    let isKisiselNot = false;
    let finalBorsaci = borsaci;
    let finalTarih = tarih;
    let finalBaslik = baslik;
    
    if (akisTipi === 'kisisel') {
        isKisiselNot = true;
        finalBorsaci = window.currentUser ? window.currentUser.displayName : 'Yunus Şensoy';
        const d = new Date();
        finalTarih = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        finalBaslik = '-';
    } else {
        isKisiselNot = (borsaci === 'Yunus Şensoy' || (window.currentUser && borsaci === window.currentUser.displayName));
    }`;

d = d.replace(saveLogicOld, saveLogicNew);

// Also replace the variables used later in the else block:
d = d.replace('State.data.analizler[index] = { ...State.data.analizler[index], tarih, borsaci, hisse, baslik, baglanti, notText, isKisiselNot };', 'State.data.analizler[index] = { ...State.data.analizler[index], tarih: finalTarih, borsaci: finalBorsaci, hisse, baslik: finalBaslik, baglanti, notText, isKisiselNot };');
d = d.replace('State.data.analizler.push({ tarih, borsaci, hisse, baslik, baglanti, notText, isKisiselNot, id: Date.now() });', 'State.data.analizler.push({ tarih: finalTarih, borsaci: finalBorsaci, hisse, baslik: finalBaslik, baglanti, notText, isKisiselNot, id: Date.now() });');

// 3. Update the form HTML
// Use regex to locate the flex div under <input type="hidden" id="analiz-hisse" ...>
const htmlToReplaceOldRegex = /<input type="hidden" id="analiz-hisse" value="\$\{selectedHisse \|\| ''\}">\s*<div style="display: flex; gap: 1rem; flex-wrap: wrap;">/;
const htmlToReplaceNew = `<input type="hidden" id="analiz-hisse" value="\${selectedHisse || ''}">
    
    <div style="display: flex; gap: 1rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--table-border); padding-bottom: 0.5rem;">
        <label style="color: #cccccc; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
            <input type="radio" name="akisTipi" value="analiz" checked onchange="window.toggleAkisTipi()"> Genel Analiz/Rapor
        </label>
        <label style="color: #cccccc; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
            <input type="radio" name="akisTipi" value="kisisel" onchange="window.toggleAkisTipi()"> Kişisel Not
        </label>
    </div>

    <div id="akis-genel-inputs" style="display: flex; gap: 1rem; flex-wrap: wrap;">`;
d = d.replace(htmlToReplaceOldRegex, htmlToReplaceNew);

// 4. In window.editAnaliz, make sure to set the radio button correctly
const editAnalizOld = `const kisiselRadio = document.querySelector('input[name="notTipi"][value="kisisel"]');`;
const editAnalizNew = `const kisiselRadio = document.querySelector('input[name="notTipi"][value="kisisel"]');
        
        // Akış formu radio buttons
        const akisKisiselRadio = document.querySelector('input[name="akisTipi"][value="kisisel"]');
        const akisAnalizRadio = document.querySelector('input[name="akisTipi"][value="analiz"]');
        if (akisKisiselRadio && akisAnalizRadio) {
            if (analiz.isKisiselNot) {
                akisKisiselRadio.checked = true;
            } else {
                akisAnalizRadio.checked = true;
            }
            if(window.toggleAkisTipi) window.toggleAkisTipi();
        }`;
if(!d.includes('const akisKisiselRadio =')) {
    d = d.replace(editAnalizOld, editAnalizNew);
}

// 5. Change 16px to 12px for platform icons in the table
d = d.replace('<i class="fas fa-file-pdf" style="color: #3b82f6; font-size: 16px;"></i>', '<i class="fas fa-file-pdf" style="color: #3b82f6; font-size: 12px;"></i>');
d = d.replace('let platformIcon = \'<i class="fas fa-sticky-note" style="color: #888; font-size: 16px;"></i>\';', 'let platformIcon = \'<i class="fas fa-sticky-note" style="color: #888; font-size: 12px;"></i>\';');
d = d.replace('let iconStr = \'fas fa-external-link-alt" style="color: #888; font-size: 16px;\';', 'let iconStr = \'fas fa-external-link-alt" style="color: #888; font-size: 12px;\';');
d = d.replace('iconStr = \'fab fa-youtube" style="color:#FF0000; font-size: 16px;\';', 'iconStr = \'fab fa-youtube" style="color:#FF0000; font-size: 12px;\';');
d = d.replace('iconStr = \'fa-brands fa-x-twitter" style="color: var(--text-primary); font-size: 16px;\';', 'iconStr = \'fa-brands fa-x-twitter" style="color: var(--text-primary); font-size: 12px;\';');
d = d.replace('platformIcon = \'<i class="fas fa-user-edit" style="color: var(--accent-color); font-size: 16px;"></i>\';', 'platformIcon = \'<i class="fas fa-user-edit" style="color: var(--accent-color); font-size: 12px;"></i>\';');

fs.writeFileSync('e:/Yunvest/yunvest/js/app_v53.js', d);
console.log('Script execution complete');
