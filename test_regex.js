const fs = require('fs');
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

// 1
js = js.replace(/if\s*\(\s*confirm\('Bu notu silmek istediğinize emin misiniz\?'\)\s*\)\s*\{([\s\S]*?renderUI\(\);\s*)\}/, "showThemeConfirm('Bu notu silmek istediğinize emin misiniz?', () => {$1});");

// 2 (y yılı)
js = js.replace(/if\s*\(\s*confirm\(y \+ ' yılı verilerini silmek istediğinize emin misiniz\?'\)\s*\)\s*\{([\s\S]*?renderUI\(\);\s*\}\s*)\}/, "showThemeConfirm(y + ' yılı verilerini silmek istediğinize emin misiniz?', () => {$1});");

// 3
js = js.replace(/if\s*\(\s*confirm\('Bu işlemi silmek istediğinize emin misiniz\?'\)\s*\)\s*\{([\s\S]*?renderPage\(\);\s*)\}/, "showThemeConfirm('Bu işlemi silmek istediğinize emin misiniz?', () => {$1});");

// 4
js = js.replace(/if\s*\(\s*confirm\('Bu nakit hareketini silmek istediğinize emin misiniz\?'\)\s*\)\s*\{([\s\S]*?renderPage\(\);\s*)\}/, "showThemeConfirm('Bu nakit hareketini silmek istediğinize emin misiniz?', () => {$1});");

// 5
js = js.replace(/if\s*\(\s*confirm\(hisse \+ ' hissesini takip listesinden çıkarmak istediğinize emin misiniz\?'\)\s*\)\s*\{([\s\S]*?renderPage\(\);\s*)\}/, "showThemeConfirm(hisse + ' hissesini takip listesinden çıkarmak istediğinize emin misiniz?', () => {$1});");

// 6
js = js.replace(/if\s*\(\!confirm\('Bu analizi silmek istediğinize emin misiniz\?'\)\)\s*return;\s*window\.themeConfirmAction\(\);/, "if (!window.themeConfirmAction) { showThemeConfirm('Bu analizi silmek istediğinize emin misiniz?', () => { window.deleteAnaliz(id); }); return; }\n        window.themeConfirmAction();");

fs.writeFileSync('e:/Yunvest/js/app_v45_test.js', js);
console.log('Test file created');
