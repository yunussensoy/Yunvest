const fs = require('fs');
const files = [
    'e:/Yunvest/yunvest/js/app_v50.js',
    'e:/Yunvest/yunvest/www/js/app_v50.js',
    'e:/Yunvest/yunvest/js/app_v49.js',
    'e:/Yunvest/yunvest/www/js/app_v49.js'
];

for (let file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'latin1');
        
        let oldFuncRegex = /window\.openTakipEditModal\s*=\s*\(event\)\s*=>\s*\{[\s\S]*?setTimeout\(\(\)\s*=>\s*document\.getElementById\('takip-edit-arama-input'\)\.focus\(\),\s*100\);\s*\};/g;

        let newFunc = `window.toggleTakipEditModal = (event) => {
        const modal = document.getElementById('takip-edit-modal');
        const glass = document.getElementById('takip-edit-glass');
        const btn = document.getElementById('takip-edit-btn');
        
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
            if (btn) {
                btn.className = 'fas fa-pen';
                btn.innerHTML = '';
            }
        } else {
            modal.style.display = 'block';
            if (event && event.target) {
                const rect = (btn ? btn.getBoundingClientRect() : event.target.getBoundingClientRect());
                glass.style.top = (rect.bottom + 10) + 'px';
                glass.style.left = (rect.right - 250) + 'px';
            }
            if (btn) {
                btn.className = '';
                btn.innerHTML = 'Kaydet';
                btn.style.fontSize = '12px';
            }
            document.getElementById('takip-edit-arama-input').value = '';
            document.getElementById('takip-edit-autocomplete-list').style.display = 'none';
            window.renderTakipEditList();
            setTimeout(() => document.getElementById('takip-edit-arama-input').focus(), 100);
        }
    };`;
    
        // replace old function
        content = content.replace(oldFuncRegex, newFunc);
        
        // replace pen html
        let oldPenRegex = /<i class="fas fa-pen" style="color: var\(--text-secondary\); cursor: pointer; font-size: 11px; margin-left: auto; padding: 4px;" onclick="window\.openTakipEditModal\(event\)"><\/i>/g;
        let newPen = `<span id="takip-edit-btn" class="fas fa-pen" style="color: var(--text-secondary); cursor: pointer; font-size: 13px; margin-left: auto; padding: 4px;" onclick="window.toggleTakipEditModal(event)"></span>`;
        
        content = content.replace(oldPenRegex, newPen);
        
        fs.writeFileSync(file, content, 'latin1');
    }
}
