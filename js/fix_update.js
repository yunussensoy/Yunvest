const fs = require('fs');
let app = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

const regexUpdate = /updateFiyat\(menkul, fiyat, skipSave = false\) \{[\s\S]*?if \(!skipSave\) this\.save\(\);\s*\}/m;

const newUpdate = `updateFiyat(menkul, fiyat, skipSave = false) {
        if (!menkul) return;
        if (!this.data) this.data = {};
        if (!this.data.hisseFiyatlari) this.data.hisseFiyatlari = [];
        let m = menkul.trim().toUpperCase();
        let hf = this.data.hisseFiyatlari.find(h => h.menkul && h.menkul.trim().toUpperCase() === m);
        if (hf) {
            hf.fiyat = parseFloat(fiyat);
            hf.tarih = new Date().toISOString();
        } else {
            this.data.hisseFiyatlari.push({ menkul: m, fiyat: parseFloat(fiyat), tarih: new Date().toISOString() });
        }
        if (!skipSave) this.save();
    }`;

if (app.match(regexUpdate)) {
    app = app.replace(regexUpdate, newUpdate);
    console.log("✅ Fixed updateFiyat");
} else {
    console.log("❌ Could not match updateFiyat");
}

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', app, 'utf8');
