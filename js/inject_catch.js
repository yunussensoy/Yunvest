const fs = require('fs');
let txt = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

// Inject try-catch into renderHisseler
const funcDef = 'const renderHisseler = (container) => {';
const start = txt.indexOf(funcDef);
if (start !== -1) {
    const blockStart = start + funcDef.length;
    
    // Find the end of renderHisseler. It ends right before "const renderFolderContents = " or maybe "const renderHisseIslemleri"?
    // The safest way is to just wrap the body.
    let modified = txt.substring(0, blockStart) + 
                   '\n    try {\n' + 
                   txt.substring(blockStart);
                   
    // Now find the end of renderHisseler. It's exactly before "window.setHisseTab" wait no, setHisseTab is INSIDE.
    // Let's just find "const renderHisseIslemleri ="
    const nextFunc = modified.indexOf('const renderHisseIslemleri =');
    // The closing brace for renderHisseler is right before nextFunc.
    // Let's find the last '};' before nextFunc.
    const lastClosing = modified.lastIndexOf('};', nextFunc);
    
    if (lastClosing !== -1) {
        modified = modified.substring(0, lastClosing) + 
                   '    } catch(err) { console.error(err); alert("Hisse Sayfası Çöktü: " + err.message + "\\nLütfen bu mesajı uzmana iletin."); }\n' + 
                   modified.substring(lastClosing);
                   
        fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', modified, 'utf8');
        console.log("Try-catch injected into renderHisseler.");
    } else {
        console.log("Could not find closing brace.");
    }
} else {
    console.log("Could not find renderHisseler.");
}
