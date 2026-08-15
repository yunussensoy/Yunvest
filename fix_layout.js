const fs = require('fs');

let content = fs.readFileSync('e:/Yunvest/yunvest/js/app_v53.js', 'utf8');

// Replace dash-card div wrapper
content = content.replace(
    '<div class="dash-card" style="padding-bottom: 20px;">',
    '<div class="dash-card" style="display: flex; flex-direction: column; flex: 1; padding-bottom: 0; margin-bottom: 0; min-height: 0;">'
);

// Replace table-container custom-scroll div
content = content.replace(
    '<div class="table-container custom-scroll" style="overflow-x: auto; overflow-y: auto; height: calc(100vh - 240px);">',
    '<div class="table-container custom-scroll" style="overflow-x: auto; overflow-y: auto; flex: 1; min-height: 0;">'
);

// We should also make sure page-section active has min-height: 0, which is around line 3601
// Actually, it has "overflow-y: auto;". If we remove overflow-y: auto from page-section, it won't scroll, but the table inside will scroll!
// Let's modify the container in renderHisseler
content = content.replace(
    '<div class="page-section active" style="display: flex; flex-direction: column; gap: 1rem; padding: 0; flex: 1; overflow-y: auto;">',
    '<div class="page-section active" style="display: flex; flex-direction: column; gap: 1rem; padding: 0; flex: 1; overflow: hidden; min-height: 0;">'
);

fs.writeFileSync('e:/Yunvest/yunvest/js/app_v53.js', content);
console.log('Layout fixed successfully');
