const fs = require('fs');
const edits = JSON.parse(fs.readFileSync('e:\\Yunvest\\js\\app_v45_edits.json', 'utf8'));

const relevantEdits = edits.filter(e => {
    const str = JSON.stringify(e);
    return str.includes('Geleceğe İlişkin') || str.includes('Kişisel Analiz') || str.includes('Yunus Şensoy') || str.includes('TCKRC');
});

let out = '';
relevantEdits.forEach(e => {
    out += `\n\n=== DATE: ${e.date} ===\n`;
    const str = JSON.stringify(e);
    // Find all "ReplacementContent":"..." in the string and extract the content
    const matches = str.match(/"ReplacementContent":"(.*?)"/g);
    if (matches) {
        matches.forEach(m => {
            let content = m.substring(22, m.length - 1);
            // Replace escaped characters
            content = content.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\t/g, '\t');
            out += '\n--- CHUNK ---\n' + content;
        });
    }
});

fs.writeFileSync('e:\\Yunvest\\js\\extracted_features.txt', out, 'utf8');
