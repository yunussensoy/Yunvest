const fs = require('fs');
let app = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

const regexSnapshot = /this\.unsubscribe = window\.db\.collection\('users'\)\.doc\(userId\)\.onSnapshot\(\(doc\) => \{([\s\S]*?)\}\);/m;

const replacement = `this.unsubscribe = window.db.collection('users').doc(userId).onSnapshot((doc) => {
$1
}, (error) => {
    console.error("Firebase Snapshot Error:", error);
    this.data = this.load() || {};
    processLoadedData();
    if(callback) callback();
});`;

if (app.match(regexSnapshot)) {
    app = app.replace(regexSnapshot, replacement);
    console.log("✅ Patched Firebase onSnapshot to handle errors");
}

// Also ensure State.data is initialized before any fetches
app = app.replace(/data: null,/g, "data: {},");
app = app.replace(/if \(!this\.data\) this\.data = \{\};/g, ""); // Clean up any existing redundant checks
app = app.replace(/init\(callback\) \{/, "init(callback) {\n        if(!this.data) this.data = this.load() || {};");

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', app, 'utf8');
