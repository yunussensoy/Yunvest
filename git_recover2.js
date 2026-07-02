const fs = require('fs');
const zlib = require('zlib');

try {
    const buffer = fs.readFileSync('e:\\Yunvest\\.git\\index');
    let offset = 12; 
    const entriesCount = buffer.readUInt32BE(8);
    let targetSha = null;

    for (let i = 0; i < entriesCount; i++) {
        let entryStart = offset;
        offset += 40; 
        
        const shaBuffer = buffer.subarray(offset, offset + 20);
        const shaHex = shaBuffer.toString('hex');
        offset += 20;
        
        const flags = buffer.readUInt16BE(offset); 
        offset += 2;
        
        let nameEnd = offset;
        while(buffer[nameEnd] !== 0) nameEnd++;
        const name = buffer.toString('utf8', offset, nameEnd);
        
        if (name === 'js/app_v45.js') {
            console.log('Found app_v45.js in Git index!');
            console.log('SHA:', shaHex);
            targetSha = shaHex;
            break;
        }
        
        // V2 padding
        const entryLen = nameEnd - entryStart + 1;
        const padding = 8 - (entryLen % 8);
        offset = nameEnd + (padding === 8 ? 0 : padding);
    }

    if (targetSha) {
        const objPath = 'e:\\Yunvest\\.git\\objects\\' + targetSha.substring(0,2) + '\\' + targetSha.substring(2);
        if (fs.existsSync(objPath)) {
            const compressed = fs.readFileSync(objPath);
            const decompressed = zlib.inflateSync(compressed);
            // format is "blob <size>\0<content>"
            const nullByte = decompressed.indexOf(0);
            const content = decompressed.subarray(nullByte + 1).toString('utf8');
            fs.writeFileSync('e:\\Yunvest\\js\\app_v45_git.js', content, 'utf8');
            console.log("Successfully recovered app_v45.js from Git into js/app_v45_git.js!");
            console.log("Recovered size:", content.length);
        } else {
            console.log("Object file not found:", objPath);
        }
    } else {
        console.log("Could not find js/app_v45.js in Git index.");
    }
} catch(e) {
    console.error(e);
}
