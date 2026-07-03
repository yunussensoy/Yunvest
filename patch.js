const fs = require('fs');
let code = fs.readFileSync('js/app_v45.js', 'utf8').replace(/\r\n/g, '\n');

// Injection 1: Initialize data synchronously
const target1 = `    init(callback) {\n        if (this.unsubscribe) this.unsubscribe();\n        let isInitialLoad = true;`;
const replacement1 = `    init(callback) {\n        if (this.unsubscribe) this.unsubscribe();\n        let isInitialLoad = true;\n        this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));`;
if (code.includes(target1)) {
    code = code.replace(target1, replacement1);
} else {
    console.log("target1 not found");
}

// Injection 2: Add error handler to onSnapshot
const target2 = `            if (callback && isInitialLoad) {\n                callback();\n                isInitialLoad = false;\n            }\n        });\n    },`;
const replacement2 = `            if (callback && isInitialLoad) {\n                callback();\n                isInitialLoad = false;\n            }\n        }, (error) => {\n            console.error("Firebase Hatasi:", error);\n            const localData = localStorage.getItem('borsa_app_data');\n            if (localData) {\n                try {\n                    this.data = { ...DEFAULT_STATE, ...JSON.parse(localData) };\n                } catch(e) {\n                    this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));\n                }\n            }\n            if (window.IMPORT_EKSTRE_DATA && window.IMPORT_EKSTRE_DATA.length > 0) {\n                this.data.ekstre = window.IMPORT_EKSTRE_DATA;\n                this.data.takipListesi = Array.from(new Set([...(this.data.takipListesi||[]), ...(window.IMPORT_TAKIP_DATA||[])]));\n                window.IMPORT_EKSTRE_DATA = null;\n                if (window.IMPORT_NAKIT_DATA && window.IMPORT_NAKIT_DATA.length > 0) {\n                    this.data.nakitHareketleri = window.IMPORT_NAKIT_DATA;\n                    window.IMPORT_NAKIT_DATA = null;\n                }\n            }\n            if (callback && isInitialLoad) {\n                callback();\n                isInitialLoad = false;\n            }\n        });\n    },`;
if (code.includes(target2)) {
    code = code.replace(target2, replacement2);
} else {
    console.log("target2 not found");
}

fs.writeFileSync('js/app_v45.js', code);
console.log("Patch applied.");
