const fs = require('fs');
let txt = fs.readFileSync('e:/Yunvest/js/app_v45.js', 'utf8');

// 1. Remove script tag from stockHeaderHtml
txt = txt.replace(
    /<script>[\s\S]*?if \('\$\{selectedHisse\}'\) \{[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?fetch\('https:\/\/scanner\.tradingview\.com\/turkey\/scan'[\s\S]*?<\/script>/,
    ''
);

// 2. Add the fetch logic after container.innerHTML assignment
const targetStr = 'container.innerHTML = `\n            ${stockHeaderHtml}\n            <div style="display: flex; gap: 0.5rem; padding: 0.5rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); flex-wrap: wrap; align-items: center; background: rgba(0,0,0,0.1);">\n                ${tabsHtml}\n            </div>\n            <div class="page-section active" style="display: flex; flex-direction: column; gap: 1rem; padding: 0 1rem; padding-top: 0.5rem; flex: 1; overflow-y: auto;">\n                ${contentHtml}\n            </div>\n        `;';

const replaceStr = targetStr + `\n
        if (selectedHisse) {
            setTimeout(() => {
                fetch('https://scanner.tradingview.com/turkey/scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ symbols: { tickers: ['BIST:' + selectedHisse] }, columns: ['close', 'change'] })
                }).then(res => res.json()).then(data => {
                    if (data && data.data && data.data.length > 0) {
                        const change = data.data[0].d[1];
                        const changeEl = document.getElementById('hisse-header-change');
                        const borderEl = document.getElementById('hisse-header-border');
                        if (changeEl) {
                            const isPos = change >= 0;
                            const color = isPos ? 'var(--success-color)' : 'var(--danger-color)';
                            changeEl.style.color = color;
                            changeEl.style.display = 'block';
                            let changeStr = Math.abs(change).toFixed(2).replace('.', ',');
                            if (isPos && change > 0) changeStr = '+' + changeStr;
                            else if (!isPos) changeStr = '-' + changeStr;
                            changeEl.innerHTML = '<i class="fas fa-caret-' + (isPos ? 'up' : 'down') + '"></i> %' + changeStr;
                            if(borderEl) borderEl.style.borderLeftColor = color;
                        }
                    }
                }).catch(e => {
                    const changeEl = document.getElementById('hisse-header-change');
                    if (changeEl) changeEl.innerHTML = '-';
                });
            }, 100);
        }
`;

txt = txt.replace(targetStr, replaceStr);

fs.writeFileSync('e:/Yunvest/js/app_v45.js', txt, 'utf8');
console.log('Fixed header script injection');
