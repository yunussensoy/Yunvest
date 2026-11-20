const fs = require('fs');
const path = require('path');

const wwwDir = path.join(__dirname, 'www');

// Clean or create www directory
if (fs.existsSync(wwwDir)) {
    fs.rmSync(wwwDir, { recursive: true, force: true });
}
fs.mkdirSync(wwwDir);

// Run the script to automatically update the reports lists
console.log('Updating stock reports...');
require('child_process').execSync('node update_reports.js', { stdio: 'inherit' });

const itemsToCopy = [
    'index.html',
    'manifest.json',
    'sw.js',
    'css',
    'img',
    'Hisseler'
];

itemsToCopy.forEach(item => {
    const src = path.join(__dirname, item);
    const dest = path.join(wwwDir, item);
    if (fs.existsSync(src)) {
        fs.cpSync(src, dest, { recursive: true });
        console.log(`Copied ${item}`);
    } else {
        console.warn(`Warning: ${item} not found.`);
    }
});

// Copy only active web JS files into www/js (exclude legacy app_v52.js, unused prices_compiled.js, etc.)
const wwwJsDir = path.join(wwwDir, 'js');
fs.mkdirSync(wwwJsDir, { recursive: true });
['stock_data_compiled.js', 'custom_autocomplete.js', 'app_v53.js'].forEach(jsFile => {
    const src = path.join(__dirname, 'js', jsFile);
    const dest = path.join(wwwJsDir, jsFile);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`Copied js/${jsFile}`);
    }
});

console.log('Build complete. Files copied to www/');
