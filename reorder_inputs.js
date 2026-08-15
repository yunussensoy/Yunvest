const fs = require('fs');

let content = fs.readFileSync('e:/Yunvest/yunvest/js/app_v53.js', 'utf8');

const baslikBlock = `        <!-- 1. Başlık -->
        <div style="flex: 1.5; min-width: 200px;">
            <label style="font-size: 0.8rem; color: #cccccc;">Başlık (Opsiyonel)</label>
            <input type="text" id="analiz-baslik" class="form-control" style="width:100%;" placeholder="Not/Rapor/Video Başlığı">
        </div>`;

const linkBlock = `        <!-- 2. Link -->
        <div style="flex: 2; min-width: 250px;">
            <label style="font-size: 0.8rem; color: #cccccc;">Link</label>
            <input type="text" id="analiz-baglanti" class="form-control" style="width:100%;" placeholder="https://...">
        </div>`;

const dosyaBlock = `        <!-- 3. Dosya Ekle -->
        <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column;">
            <label style="font-size: 0.8rem; color: #cccccc;">Dosya Ekle (Opsiyonel)</label>
            <style>
                #upload-file { display: none; }
            </style>
            <label for="upload-file" class="upload-file-label" title="Bir Dosya Seç" style="padding: 3px 7px 3px 4px; background: #000000; color: #ffffff; display: flex; align-items: center; justify-content: center; border-radius: 4px; cursor: pointer; border: none; font-size: 12px; font-weight: normal; margin-top: 2px;">
                <span class="fa-stack" style="font-size: 8px; width: 2em; height: 2em;"><i class="fas fa-folder-open fa-stack-2x" style="color: #ffffff;"></i></span>
                <span style="margin-left: 5px;">PDF Seç</span>
            </label>
            <input type="file" id="upload-file" accept="application/pdf" onchange="const f = this.files[0]; if(f) this.previousElementSibling.innerHTML = '<i class=\\'fas fa-file-pdf\\' style=\\'color:var(--danger-color); font-size: 14px;\\'></i> <span style=\\'color: #fff; margin-left: 5px; font-size:11px;\\'>' + (f.name.length > 15 ? f.name.substring(0,15)+'...' : f.name) + '</span>'">
        </div>`;

const analistBlock = `        <!-- 4. Analist/Şirket -->
        <div style="flex: 1; min-width: 150px;">
            <label style="font-size: 0.8rem; color: #cccccc;">Analist/Şirket</label>
            <input type="text" id="analiz-borsaci" list="analiz-borsaci-list" class="form-control" style="width:100%;" placeholder="Örn: Ak Yatırım">
        </div>`;

const tarihBlock = `        <!-- 5. Tarih -->
        <div style="flex: 1; min-width: 120px;">
            <label style="font-size: 0.8rem; color: #cccccc;">Tarih</label>
            <input type="date" id="analiz-tarih" class="form-control" style="width:100%; color-scheme: dark;" value="\${today}">
        </div>`;

// Use regex to locate the entire akis-genel-inputs block and replace its inner HTML
const regex = /<div id="akis-genel-inputs" style="display: flex; gap: 1rem; flex-wrap: wrap;">([\s\S]*?)<\/div>\s*<!-- 6\. Notunuz -->/m;

const newInner = `
${linkBlock.replace('<!-- 2. Link -->', '<!-- 1. Link -->')}
        
${analistBlock.replace('<!-- 4. Analist/Şirket -->', '<!-- 2. Analist/Şirket -->')}
        
${tarihBlock.replace('<!-- 5. Tarih -->', '<!-- 3. Tarih -->')}
        
${baslikBlock.replace('<!-- 1. Başlık -->', '<!-- 4. Başlık -->')}
        
${dosyaBlock.replace('<!-- 3. Dosya Ekle -->', '<!-- 5. Dosya Ekle -->')}
    `;

content = content.replace(regex, `<div id="akis-genel-inputs" style="display: flex; gap: 1rem; flex-wrap: wrap;">${newInner}</div>
    
    <!-- 6. Notunuz -->`);

fs.writeFileSync('e:/Yunvest/yunvest/js/app_v53.js', content);
console.log('Reordered successfully.');
