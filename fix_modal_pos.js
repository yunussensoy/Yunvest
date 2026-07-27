const fs = require('fs');
const files = [
    'e:/Yunvest/yunvest/js/app_v50.js',
    'e:/Yunvest/yunvest/www/js/app_v50.js',
    'e:/Yunvest/yunvest/js/app_v49.js',
    'e:/Yunvest/yunvest/www/js/app_v49.js'
];

const oldPenStr = '<i class="fas fa-pen" style="color: var(--text-secondary); cursor: pointer; font-size: 11px; margin-left: auto; padding: 4px;" onclick="window.openTakipEditModal()"></i>';
const newPenStr = '<i class="fas fa-pen" style="color: var(--text-secondary); cursor: pointer; font-size: 11px; margin-left: auto; padding: 4px;" onclick="window.openTakipEditModal(event)"></i>';

const oldFunc = `window.openTakipEditModal = () => {
        document.getElementById('takip-edit-modal').style.display = 'flex';`;
const newFunc = `window.openTakipEditModal = (event) => {
        const modal = document.getElementById('takip-edit-modal');
        const glass = document.getElementById('takip-edit-glass');
        modal.style.display = 'block';
        if (event && event.target) {
            const rect = event.target.getBoundingClientRect();
            // Position exactly below the pen icon
            glass.style.top = (rect.bottom + 10) + 'px';
            // Align right edge of the box with the right edge of the pen icon
            glass.style.left = (rect.right - 250) + 'px';
        }`;

for (let file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'latin1'); // latin1 maps 1-1 to cp1254 bytes
        content = content.replace(oldPenStr, newPenStr);
        content = content.replace(oldFunc, newFunc);
        fs.writeFileSync(file, content, 'latin1');
    }
}
