const fs = require('fs');

function replaceInFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'latin1');
    
    // 1. Update font-size in window.toggleTakipEditModal -> Kaydet button
    content = content.replace(/btn\.innerHTML = 'Kaydet';\s*btn\.style\.fontSize = '12px';/, "btn.innerHTML = 'Kaydet';\n                btn.style.fontSize = '11px';");
    
    // 2. Update list items: ${hisse} span font-size from 13px to 12px
    content = content.replace(/<span style="color: var\(--text-primary\); font-weight: 500; font-size: 13px;">\$\{hisse\}<\/span>/g, '<span style="color: var(--text-primary); font-weight: 500; font-size: 12px;">${hisse}</span>');
    
    // 3. Update trash icon font-size from 13px to 12px
    content = content.replace(/<i class="fas fa-trash-alt" style="cursor: pointer; color: var\(--text-secondary\); font-size: 13px; padding: 4px;"/g, '<i class="fas fa-trash-alt" style="cursor: pointer; color: var(--text-secondary); font-size: 12px; padding: 4px;"');

    // 4. In HTML, update title from 15px to 14px, input from 13px to 12px, plus icon from 13px to 12px.
    // Plus icon:
    content = content.replace(/<i class="fas fa-plus" style="padding: 0 0\.5rem; cursor: pointer; color: var\(--text-secondary\); font-size: 13px; display: flex; align-items: center;"/g, '<i class="fas fa-plus" style="padding: 0 0.5rem; cursor: pointer; color: var(--text-secondary); font-size: 12px; display: flex; align-items: center;"');
    
    // Input:
    content = content.replace(/id="takip-edit-arama-input" class="form-control" placeholder="Hisse ara \(Örn: THYAO\)\.\.\." style="flex: 1; font-size: 13px;/g, 'id="takip-edit-arama-input" class="form-control" placeholder="Hisse ara (Örn: THYAO)..." style="flex: 1; font-size: 12px;');
    
    // Title:
    content = content.replace(/<h3 style="margin: 0; color: #ffffff; font-size: 15px;">Takip Listesi Düzenle<\/h3>/g, '<h3 style="margin: 0; color: #ffffff; font-size: 14px;">Takip Listesi Düzenle</h3>');
    
    // Add specific CSS for the focus if not exists
    if (!content.includes('#takip-edit-arama-input:focus')) {
        let styleInjection = `
            <style>
                #takip-edit-arama-input:focus {
                    border-color: var(--accent-color) !important;
                    box-shadow: 0 0 0 1px var(--accent-color) !important;
                }
            </style>
            <h3 style="margin: 0; color: #ffffff; font-size: 14px;">Takip Listesi Düzenle</h3>`;
        content = content.replace(/<h3 style="margin: 0; color: #ffffff; font-size: 14px;">Takip Listesi Düzenle<\/h3>/, styleInjection);
    }
    
    fs.writeFileSync(file, content, 'latin1');
}

const htmlFiles = [
    'e:/Yunvest/yunvest/index.html',
    'e:/Yunvest/yunvest/www/index.html'
];
htmlFiles.forEach(replaceInFile);

const jsFiles = [
    'e:/Yunvest/yunvest/js/app_v50.js',
    'e:/Yunvest/yunvest/www/js/app_v50.js',
    'e:/Yunvest/yunvest/js/app_v49.js',
    'e:/Yunvest/yunvest/www/js/app_v49.js'
];
jsFiles.forEach(replaceInFile);

console.log("Done");
