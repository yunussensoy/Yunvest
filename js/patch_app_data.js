const fs = require('fs');
let app = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

const regex = /this\.unsubscribe = db\.collection\('app_data'\)\.doc\(currentUser\.uid\)\.onSnapshot\(\(doc\) => \{([\s\S]*?)\}\);/m;

const replacement = `this.unsubscribe = db.collection('app_data').doc(currentUser.uid).onSnapshot((doc) => {
$1
}, (error) => {
    console.error("Firebase Snapshot Error (app_data):", error);
    if (!this.data) this.data = this.load() || {};
    processLoadedData();
    if (callback) callback();
});`;

if (app.match(regex)) {
    app = app.replace(regex, replacement);
    console.log("✅ Patched app_data onSnapshot");
} else {
    console.log("❌ Could not match app_data onSnapshot");
}

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', app, 'utf8');
