const fs = require('fs');
let content = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');
let before = content.length;

// Remove the specific style tag block injected by fix_padding.js
content = content.replace(/<style>#takip-table th, #takip-table td \{ padding: 4px 8px !important; \}<\/style>\s*<table class="dash-table compact-table" style="text-align: center;" id="takip-table">/g, '<table class="dash-table compact-table" style="text-align: center;" id="takip-table">');

// Also try a more generic removal if whitespace differs
content = content.replace(/<style>#takip-table th, #takip-table td \{ padding: [^}]+ \}<\/style>\s*<table/g, '<table');

let after = content.length;
fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', content, 'utf8');

console.log('Reverted ' + (before - after) + ' characters related to padding style tag.');
