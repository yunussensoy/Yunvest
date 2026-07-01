const fs = require('fs');

// 1. Modify index.html
let html = fs.readFileSync('e:/Yunvest/index.html', 'utf8');
const alertModal = `
    <!-- Theme Compatible Alert Modal -->
    <div id="theme-alert-modal" class="app-container" style="display: none; justify-content: center; align-items: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000;">
        <div class="glass" style="padding: 2rem; width: 350px; text-align: center; border-radius: var(--border-radius); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="font-size: 3rem; color: var(--accent-color); margin-bottom: 1rem;"><i class="fas fa-info-circle"></i></div>
            <h3 style="margin-bottom: 1rem; color: var(--text-primary); font-weight: 600;">Bilgi</h3>
            <p id="theme-alert-message" style="margin-bottom: 1.5rem; color: var(--text-secondary); font-size: 13px; line-height: 1.5;"></p>
            <div style="display: flex; justify-content: center;">
                <button class="btn" style="width: 100%; background: var(--accent-color); color: #fff;" onclick="document.getElementById('theme-alert-modal').style.display='none';">Tamam</button>
            </div>
        </div>
    </div>
`;
if (!html.includes('id="theme-alert-modal"')) {
    html = html.replace('<!-- Theme Compatible Confirm Modal -->', alertModal + '\n    <!-- Theme Compatible Confirm Modal -->');
    fs.writeFileSync('e:/Yunvest/index.html', html);
    console.log('Added alert modal to index.html');
}

// 2. Modify app_v45.js
let js = fs.readFileSync('e:/Yunvest/js/app_v45.js', 'utf8');

// Insert globals at the top
const globals = `
window.showThemeConfirm = (message, action) => {
    const msgEl = document.getElementById('theme-confirm-message');
    if (msgEl) msgEl.textContent = message;
    window.themeConfirmAction = action;
    const modal = document.getElementById('theme-confirm-modal');
    if (modal) modal.style.display = 'flex';
    else {
        if (confirm(message)) action();
    }
};

window.alert = function(msg) {
    const alertModal = document.getElementById('theme-alert-modal');
    if (alertModal) {
        document.getElementById('theme-alert-message').innerText = msg;
        alertModal.style.display = 'flex';
    } else {
        console.log("ALERT: " + msg);
    }
};
`;

if (!js.includes('window.showThemeConfirm')) {
    js = globals + '\n' + js;
}

// Replace confirm usages block by block
js = js.replace(/if\s*\(\s*confirm\('Bu notu silmek istediğinize emin misiniz\?'\)\s*\)\s*\{([\s\S]*?renderUI\(\);\s*)\}/, "showThemeConfirm('Bu notu silmek istediğinize emin misiniz?', () => {$1});");
js = js.replace(/if\s*\(\s*confirm\(y \+ ' yılı verilerini silmek istediğinize emin misiniz\?'\)\s*\)\s*\{([\s\S]*?renderPage\(\);\s*)\}/, "showThemeConfirm(y + ' yılı verilerini silmek istediğinize emin misiniz?', () => {$1});");
js = js.replace(/if\s*\(\s*confirm\('Bu işlemi silmek istediğinize emin misiniz\?'\)\s*\)\s*\{([\s\S]*?renderPage\(\);\s*)\}/, "showThemeConfirm('Bu işlemi silmek istediğinize emin misiniz?', () => {$1});");
js = js.replace(/if\s*\(\s*confirm\('Bu nakit hareketini silmek istediğinize emin misiniz\?'\)\s*\)\s*\{([\s\S]*?renderPage\(\);\s*)\}/, "showThemeConfirm('Bu nakit hareketini silmek istediğinize emin misiniz?', () => {$1});");
js = js.replace(/if\s*\(\s*confirm\(hisse \+ ' hissesini takip listesinden çıkarmak istediğinize emin misiniz\?'\)\s*\)\s*\{([\s\S]*?renderPage\(\);\s*)\}/, "showThemeConfirm(hisse + ' hissesini takip listesinden çıkarmak istediğinize emin misiniz?', () => {$1});");

// Replace deleteAnaliz fallback confirm
js = js.replace(/if\s*\(\!confirm\('Bu analizi silmek istediğinize emin misiniz\?'\)\)\s*return;\s*window\.themeConfirmAction\(\);/, "if (!window.themeConfirmAction) { showThemeConfirm('Bu analizi silmek istediğinize emin misiniz?', () => { window.deleteAnaliz(id); }); return; } window.themeConfirmAction();");

fs.writeFileSync('e:/Yunvest/js/app_v45.js', js);
console.log('Updated app_v45.js');
