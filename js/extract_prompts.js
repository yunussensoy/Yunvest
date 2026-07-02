const fs = require('fs');
const path = require('path');
const brainDir = 'C:\\Users\\YUNUS\\.gemini\\antigravity-ide\\brain';
const dirs = fs.readdirSync(brainDir);
const prompts = [];

dirs.forEach(d => {
    const tPath = path.join(brainDir, d, '.system_generated', 'logs', 'transcript.jsonl');
    if (fs.existsSync(tPath)) {
        const content = fs.readFileSync(tPath, 'utf8');
        const matches = content.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/g);
        if (matches) {
            matches.forEach(m => {
                const text = m.replace(/<\/?USER_REQUEST>/g, '').trim().replace(/\n/g, ' ');
                prompts.push(text);
            });
        }
    }
});

const unique = [...new Set(prompts)];
console.log(unique.join('\n'));
