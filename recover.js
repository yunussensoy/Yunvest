const fs = require('fs');
const content = fs.readFileSync('C:\\\\Users\\\\YUNUS\\\\.gemini\\\\antigravity-ide\\\\brain\\\\0c89ead6-7e8f-46ab-bce6-477f7b2f24b3\\\\.system_generated\\\\logs\\\\transcript.jsonl', 'utf8');
const lines = content.split('\n');
let foundContent = null;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Showing lines 1 to 589') && lines[i].includes('<!DOCTYPE html>')) {
        let jsonLine = lines[i];
        try {
            let obj = JSON.parse(jsonLine);
            if (obj.content) foundContent = obj.content;
        } catch(e) {}
    }
}

if (!foundContent) {
    console.log("Could not find the view_file block via JSON parsing. Trying regex...");
    const match = content.match(/Showing lines 1 to 589.*?1: <!DOCTYPE html>(.*?)The above content does NOT show/s);
    if (match) {
        foundContent = '1: <!DOCTYPE html>' + match[1];
    }
}

if (foundContent) {
    const outLines = [];
    const sourceLines = foundContent.split('\n');
    let started = false;
    for (let line of sourceLines) {
        if (line.includes('1: <!DOCTYPE html>')) started = true;
        if (!started) continue;
        if (line.includes('The above content does NOT show')) break;
        
        let match = line.match(/^(\d+):\s(.*)$/);
        if (match) {
            outLines.push(match[2]);
        } else if (line.match(/^(\d+):$/)) {
            outLines.push('');
        }
    }
    fs.writeFileSync('index_original.html', outLines.join('\n'));
    console.log("Recovered successfully to index_original.html");
} else {
    console.log("Failed to recover.");
}
