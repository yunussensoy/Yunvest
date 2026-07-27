const fs = require('fs');

function replaceInFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'latin1');
    
    // Pattern 1: <button ...><i class="fas fa-trash-alt" ...></i></button>
    // We want to replace the whole button with a clean button.
    const buttonPattern1 = /<button class="btn btn-danger" style="padding: 2px 4px; font-size: 12px; background: #000000; color: var\(--danger-color\); border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; border: none;" onclick="(.*?)" title="Sil"><i class="fas fa-trash-alt" style="color: var\(--danger-color\) !important;"><\/i><\/button>/g;
    content = content.replace(buttonPattern1, '<button class="btn" style="padding: 2px 4px; font-size: 12px; background: transparent; color: #888888; border: none;" onclick="$1" title="Sil"><i class="fas fa-trash-alt"></i></button>');
    
    const buttonPattern2 = /<button class="btn btn-icon" style="background: #000000; color: var\(--danger-color\); padding: 2px !important; font-size: 14px; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; border: none;" onclick="(.*?)" title="Sil"><i class="fas fa-trash-alt" style="color: var\(--danger-color\) !important;"><\/i><\/button>/g;
    content = content.replace(buttonPattern2, '<button class="btn btn-icon" style="background: transparent; color: #888888; padding: 2px !important; font-size: 14px; border: none;" onclick="$1" title="Sil"><i class="fas fa-trash-alt"></i></button>');
    
    const buttonPattern3 = /<button class="btn btn-icon" style="background: #000000; color: var\(--danger-color\); padding: 2px; font-size: 14px; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; border: none;" onclick="(.*?)" title="Sil"><i class="fas fa-trash-alt" style="color: var\(--danger-color\) !important;"><\/i><\/button>/g;
    content = content.replace(buttonPattern3, '<button class="btn btn-icon" style="background: transparent; color: #888888; padding: 2px; font-size: 14px; border: none;" onclick="$1" title="Sil"><i class="fas fa-trash-alt"></i></button>');
    
    const buttonPattern4 = /<button class="btn btn-icon" style="padding: 2px; background: #000000; color: var\(--danger-color\); display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; border: none;" onclick="(.*?)"><i class="fas fa-trash-alt" style="color: var\(--danger-color\) !important;"><\/i><\/button>/g;
    content = content.replace(buttonPattern4, '<button class="btn btn-icon" style="padding: 2px; background: transparent; color: #888888; border: none;" onclick="$1"><i class="fas fa-trash-alt"></i></button>');

    // Pattern 5: standalone <i> trash icons in Ara Degerleme and Degerleme
    const iconPattern1 = /<i class="fas fa-trash-alt" style="cursor:pointer; color:var\(--danger-color\); background:#000000; border-radius:3px; padding:2px 3px; font-size:12px;" onclick="(.*?)" title="Sil"><\/i>/g;
    content = content.replace(iconPattern1, '<i class="fas fa-trash-alt" style="cursor:pointer; color:#888888; background:transparent; padding:2px 3px; font-size:12px;" onclick="$1" title="Sil"></i>');

    // Remove any remaining red colors from trash cans if missed
    content = content.replace(/color:\s*var\(--danger-color\)([^>]*?fa-trash-alt)/g, 'color: #888888$1');

    fs.writeFileSync(file, content, 'latin1');
}

const jsFiles = [
    'e:/Yunvest/yunvest/js/app_v50.js',
    'e:/Yunvest/yunvest/www/js/app_v50.js',
    'e:/Yunvest/yunvest/js/app_v49.js',
    'e:/Yunvest/yunvest/www/js/app_v49.js'
];
jsFiles.forEach(replaceInFile);

console.log("Done");
