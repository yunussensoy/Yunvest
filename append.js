const fs = require('fs');
const content = `\nwindow.uploadRapor = () => {
    const fileInput = document.getElementById('upload-file');
    const hisse = document.getElementById('upload-hisse').value.trim().toUpperCase();
    const ad = document.getElementById('upload-ad').value.trim();
    const tarih = document.getElementById('upload-tarih').value.trim();
    const sirket = document.getElementById('upload-sirket').value.trim();
    const status = document.getElementById('upload-status');

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        if(status) { status.style.color = 'var(--danger-color)'; status.innerText = 'Lütfen bir dosya seçin.'; }
        return;
    }
    if (!hisse || !ad || !tarih || !sirket) {
        if(status) { status.style.color = 'var(--danger-color)'; status.innerText = 'Lütfen Hisse, Ad, Tarih ve Yatırım Şirketi bilgilerini doldurun.'; }
        return;
    }

    const file = fileInput.files[0];
    
    // Format characters
    const formatStr = (str) => {
        return str.toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/\\s+/g, '_');
    };
    
    const newFileName = \`\${formatStr(ad)}-\${formatStr(tarih)}-\${formatStr(sirket)}.pdf\`;
    
    // Trigger download of the renamed file
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = newFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    if(status) { 
        status.style.color = 'var(--success-color)'; 
        status.innerHTML = \`Dosya indirildi: <b>\${newFileName}</b>. Lütfen indirilen bu dosyayı <b>Hisseler/\${hisse}</b> klasörüne taşıyın.\`; 
    }
    
    // Clear inputs
    fileInput.value = '';
    const label = fileInput.previousElementSibling;
    if (label) label.innerHTML = '<i class="fas fa-folder-open"></i> Bir Dosya Seç';
    document.getElementById('upload-ad').value = '';
    document.getElementById('upload-tarih').value = '';
    document.getElementById('upload-sirket').value = '';
};\n`;
fs.appendFileSync('e:/Yunvest/yunvest/js/app_v49.js', content, 'utf8');
