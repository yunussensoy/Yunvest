const fs = require('fs');
let app = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

const targetStr = `            if (!this.data.takipListesi) this.data.takipListesi = [];
            if (!this.data.analizler) this.data.analizler = [];`;
const newStr = `            if (!this.data.takipListesi) this.data.takipListesi = [];
            if (!this.data.analizler) this.data.analizler = [];
            if (!this.data.hisseFiyatlari) this.data.hisseFiyatlari = [];`;

if (app.includes(targetStr)) {
    app = app.replace(targetStr, newStr);
    console.log("✅ Fixed hisseFiyatlari initialization");
} else {
    console.log("❌ Could not find initialization string");
}

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', app, 'utf8');
