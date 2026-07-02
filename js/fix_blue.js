const fs = require('fs');
let app = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

// For Takip Listesi specifically:
// <td style="text-align: left; font-weight: bold; color: var(--accent-color);">${hisse}</td>
if (app.includes('color: var(--accent-color);">${hisse}</td>')) {
    // We only want to do it in renderAnasayfa for Takip Listesi.
    // The safest way is to do it globally for now since accent color was gold/yellow, 
    // but the user wants blue (#3498db) for link columns.
    app = app.replace(/color: var\(--accent-color\);">\$\{hisse\}<\/td>/g, 'color: #3498db;">${hisse}</td>');
    console.log('Fixed blue links for hisse');
}

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', app, 'utf8');
