const fs = require('fs');
let content = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

const tableStr = '<table class="dash-table compact-table" style="text-align: center;" id="takip-table">';
const cssInject = `<style>#takip-table th, #takip-table td { padding: 2px 6px !important; height: auto !important; }</style>
                    <table class="dash-table compact-table" style="text-align: center;" id="takip-table">`;

// Remove any existing injected styles to be safe
content = content.replace(/<style>#takip-table th, #takip-table td \{[^}]*\}<\/style>\s*/g, '');

content = content.replace(tableStr, cssInject);

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', content, 'utf8');
console.log("Injected tight padding.");
