const fs = require('fs');
const path = require('path');
const brainDir = 'C:\\Users\\YUNUS\\.gemini\\antigravity-ide\\brain';
const dirs = fs.readdirSync(brainDir);
const edits = [];

dirs.forEach(d => {
    const tPath = path.join(brainDir, d, '.system_generated', 'logs', 'transcript.jsonl');
    if (fs.existsSync(tPath)) {
        const lines = fs.readFileSync(tPath, 'utf8').split('\n');
        lines.forEach(l => {
            if (l.includes('replace_file_content') && l.includes('app_v45.js')) {
                try {
                    const obj = JSON.parse(l);
                    if (obj.tool_calls) {
                        obj.tool_calls.forEach(tc => {
                            if ((tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') &&
                                tc.args.TargetFile && tc.args.TargetFile.includes('app_v45.js')) {
                                edits.push({
                                    date: obj.created_at,
                                    tool: tc.name,
                                    args: tc.args
                                });
                            }
                        });
                    }
                } catch(e){}
            }
        });
    }
});

edits.sort((a,b) => a.date.localeCompare(b.date));
console.log(`Found ${edits.length} edits on app_v45.js`);
if (edits.length > 0) {
    fs.writeFileSync('e:\\Yunvest\\js\\app_v45_edits.json', JSON.stringify(edits, null, 2));
}
