const fs = require('fs');
const buffer = fs.readFileSync('e:\\Yunvest\\.git\\index');
let offset = 12; 
const entriesCount = buffer.readUInt32BE(8);
for (let i = 0; i < entriesCount; i++) {
    offset += 40; 
    offset += 20; // sha
    const flags = buffer.readUInt16BE(offset); offset += 2;
    let nameEnd = offset;
    while(buffer[nameEnd] !== 0) nameEnd++;
    const name = buffer.toString('utf8', offset, nameEnd);
    if (name.startsWith('js/')) console.log(name);
    
    // For Git index V2 padding:
    const entryLen = nameEnd - (offset - 62) + 1;
    const padding = 8 - (entryLen % 8);
    offset = nameEnd + (padding === 8 ? 0 : padding);
}