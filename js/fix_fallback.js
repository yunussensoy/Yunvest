const fs = require('fs');
let app = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

const regex = /\}, \(error\) => \{[\s\S]*?\}\);/m;

const replacement = `}, (error) => {
    console.error("Firebase Snapshot Error (app_data):", error);
    // Load from localStorage as fallback
    const localData = localStorage.getItem('borsa_app_data');
    if (localData) {
        try {
            this.data = { ...DEFAULT_STATE, ...JSON.parse(localData) };
        } catch(e) {
            this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
        }
    } else {
        this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
    processLoadedData();
    if (callback) callback();
});`;

if (app.match(regex)) {
    app = app.replace(regex, replacement);
    console.log("✅ Fixed Firebase error handler fallback");
} else {
    console.log("❌ Could not match error handler");
}

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', app, 'utf8');
