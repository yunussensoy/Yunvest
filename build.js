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
    'js',
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

console.log('Build complete. Files copied to www/');
