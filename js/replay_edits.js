const fs = require('fs');

const edits = JSON.parse(fs.readFileSync('e:\\Yunvest\\js\\app_v45_edits.json', 'utf8'));
let content = fs.readFileSync('e:\\Yunvest\\js\\app_v44_final.js', 'utf8');

let successCount = 0;
let failCount = 0;

for (let i = 0; i < edits.length; i++) {
    const edit = edits[i];
    
    if (edit.tool === 'replace_file_content') {
        const target = edit.args.TargetContent;
        const replace = edit.args.ReplacementContent;
        
        if (content.includes(target)) {
            content = content.replace(target, replace);
            successCount++;
        } else {
            console.log(`Edit ${i} failed (replace_file_content)`);
            failCount++;
        }
    } else if (edit.tool === 'multi_replace_file_content') {
        const chunks = edit.args.ReplacementChunks;
        let allChunksFound = true;
        
        for (const chunk of chunks) {
            if (!content.includes(chunk.TargetContent)) {
                allChunksFound = false;
                break;
            }
        }
        
        if (allChunksFound) {
            for (const chunk of chunks) {
                content = content.replace(chunk.TargetContent, chunk.ReplacementContent);
            }
            successCount++;
        } else {
            console.log(`Edit ${i} failed (multi_replace_file_content)`);
            failCount++;
        }
    }
}

console.log(`Success: ${successCount}, Fail: ${failCount}`);
fs.writeFileSync('e:\\Yunvest\\js\\app_v45_reconstructed.js', content, 'utf8');
