const fs = require('fs');
let app = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

const regexFetch = /State\.data\.hisseFiyatlari\.forEach\(/g;
app = app.replace(regexFetch, "(State.data.hisseFiyatlari || []).forEach(");

const regexFetch2 = /State\.data\.ekstre\.forEach\(/g;
app = app.replace(regexFetch2, "(State.data.ekstre || []).forEach(");

// Just in case, let's fix any other direct access without checking
// Wait, the safest way is to ensure `this.data` ALWAYS has these arrays.
const initRegex = /if\(!this\.data\) this\.data = this\.load\(\) \|\| \{\};/;
const safeInit = `if(!this.data) this.data = this.load() || {};
        if (!this.data.hisseFiyatlari) this.data.hisseFiyatlari = [];
        if (!this.data.ekstre) this.data.ekstre = [];
        if (!this.data.takipListesi) this.data.takipListesi = [];
        if (!this.data.analizler) this.data.analizler = [];
        if (!this.data.hedefFiyatlar) this.data.hedefFiyatlar = {};`;

app = app.replace(initRegex, safeInit);

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', app, 'utf8');
console.log("✅ Fixed array iterators");
