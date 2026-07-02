const fs = require('fs');
const path = require('path');
const brainDir = 'C:\\Users\\YUNUS\\.gemini\\antigravity-ide\\brain';
const dirs = fs.readdirSync(brainDir);
const prompts = [];

dirs.forEach(d => {
    const tPath = path.join(brainDir, d, '.system_generated', 'logs', 'transcript.jsonl');
    if (fs.existsSync(tPath)) {
        const content = fs.readFileSync(tPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach(l => {
            if (l.includes('"type":"USER_INPUT"')) {
                try {
                    const obj = JSON.parse(l);
                    if (obj.type === 'USER_INPUT') {
                        let text = obj.content;
                        if (text.includes('<USER_REQUEST>')) {
                            text = text.split('<USER_REQUEST>')[1].split('</USER_REQUEST>')[0].trim();
                        }
                        prompts.push({
                            date: obj.created_at,
                            text: text
                        });
                    }
                } catch(e) {}
            }
        });
    }
});

prompts.sort((a,b) => a.date.localeCompare(b.date));
fs.writeFileSync('e:\\Yunvest\\js\\all_prompts.txt', prompts.map(p => p.date + ' | ' + p.text.replace(/\n/g, ' ')).join('\n'), 'utf8');
