const fs = require('fs');

// 1. REVERT STYLES.CSS
let css = fs.readFileSync('e:\\Yunvest\\css\\styles.css', 'utf8');

// compact-table
css = css.replace('.compact-table th, .compact-table td { padding: 3px 6px !important; white-space: nowrap; }',
                  '.compact-table th, .compact-table td { padding: 0.6rem 0.5rem !important; white-space: nowrap; }');
                  
css = css.replace('.compact-table th { font-size: 13px !important; font-weight: 600 !important; color: #ffffff !important; text-align: center; }',
                  '.compact-table th { font-size: 13px !important; font-weight: 600 !important; color: #ffffff !important; height: 39px; text-align: center; }');

css = css.replace('.compact-table tr { height: auto !important; }',
                  '.compact-table tr { height: 39px !important; }');

css = css.replace('.compact-table td { font-size: 13px !important; font-weight: 500 !important; color: #cccccc; line-height: 1.2 !important; text-align: center; }',
                  '.compact-table td { font-size: 13px !important; font-weight: 500 !important; color: #cccccc; height: 34px !important; line-height: 1 !important; text-align: center; }');

// std-table
css = css.replace('padding: 4px 6px !important;', 'padding: 8px 5px !important;');
css = css.replace('padding: 4px 6px !important;', 'padding: 8px 5px !important;');

fs.writeFileSync('e:\\Yunvest\\css\\styles.css', css, 'utf8');
console.log("Reverted styles.css");

// 2. RESTORE app_v45.js from app_v44_final.js
let app = fs.readFileSync('e:\\Yunvest\\js\\app_v44_final.js', 'utf8');

// 3. FIX the Takip Listesi button padding so the user gets what they originally wanted
const targetButton = `<button class="btn btn-icon" style="color: var(--danger-color);" onclick="window.removeHisseFromTakip('\${hisse}')">`;
const fixedButton = `<button class="btn btn-icon" style="color: var(--danger-color); padding: 0.1rem 0.3rem;" onclick="window.removeHisseFromTakip('\${hisse}')">`;

if (app.includes(targetButton)) {
    app = app.replace(targetButton, fixedButton);
    console.log("Fixed Takip Listesi button padding!");
} else {
    console.log("Target button not found in app_v44_final.js. Here is what is there:");
    const match = app.match(/window\.removeHisseFromTakip.*?<\/button>/);
    if(match) console.log(match[0]);
}

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', app, 'utf8');
console.log("Restored app_v45.js successfully.");
