const fs = require('fs');
let content = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

// Fix accidental boYld
content = content.replace(/bo\uFFFDY?ld/g, 'bold');
content = content.replace(/boYld/g, 'bold');
content = content.replace(/bo.Y?ld/g, 'bold'); // match any corrupted 'bold'

// Inject CSS for Takip Table
const tableStr = '<table class="dash-table compact-table" style="text-align: center;" id="takip-table">';
const cssInject = `<style>#takip-table th, #takip-table td { padding: 4px 8px !important; }</style>
                    <table class="dash-table compact-table" style="text-align: center;" id="takip-table">`;
content = content.replace(tableStr, cssInject);

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', content, 'utf8');
console.log("Fixed padding and typo.");
