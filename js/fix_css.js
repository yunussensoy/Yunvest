const fs = require('fs');
let css = fs.readFileSync('e:\\Yunvest\\css\\styles.css', 'utf8');

// compact-table (Takip Listesi, Hisse İşlemleri vs.)
css = css.replace('.compact-table th, .compact-table td { padding: 0.6rem 0.5rem !important; white-space: nowrap; }',
                  '.compact-table th, .compact-table td { padding: 3px 6px !important; white-space: nowrap; }');
                  
css = css.replace('.compact-table th { font-size: 13px !important; font-weight: 600 !important; color: #ffffff !important; height: 39px; text-align: center; }',
                  '.compact-table th { font-size: 13px !important; font-weight: 600 !important; color: #ffffff !important; text-align: center; }');

css = css.replace('.compact-table tr { height: 39px !important; }',
                  '.compact-table tr { height: auto !important; }');

css = css.replace('.compact-table td { font-size: 13px !important; font-weight: 500 !important; color: #cccccc; height: 34px !important; line-height: 1 !important; text-align: center; }',
                  '.compact-table td { font-size: 13px !important; font-weight: 500 !important; color: #cccccc; line-height: 1.2 !important; text-align: center; }');

// std-table (Diğer genel tablolar)
css = css.replace(/padding: 8px 5px !important;/g, 'padding: 4px 6px !important;');

fs.writeFileSync('e:\\Yunvest\\css\\styles.css', css, 'utf8');
console.log("styles.css made compact again.");
