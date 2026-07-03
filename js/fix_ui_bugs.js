const fs = require('fs');
let app = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

// 1. Fix the top header percentage display
const searchHeader = `display: \${Math.abs(hDegisim) > 0 ? "block" : "none"}`;
const replaceHeader = `display: flex; align-items: center; gap: 0.3rem;`;

if (app.includes(searchHeader)) {
    app = app.replace(searchHeader, replaceHeader);
    // Let's also ensure the icon logic handles exactly 0 cleanly (maybe caret-right)
    app = app.replace(/<i class="fas fa-caret-\$\{isPos \? 'up' : 'down'\}"><\/i>/g, 
                      `<i class="fas \${hDegisim === 0 ? 'fa-minus' : (isPos ? 'fa-caret-up' : 'fa-caret-down')}"></i>`);
    console.log('✅ Fixed percentage display');
} else {
    console.log('❌ Could not find percentage display code');
}

// 2. Fix the charts cOpts for data labels
const searchOpts = `const cOpts = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { display: false },
                        tooltip: { enabled: true }
                    },
                    scales: { 
                        x: { ticks: { color: '#888', font: {size: 10} }, grid: { display:false } }, 
                        y: { ticks: { display: false }, grid: { display: false }, border: {display: false} }
                    }
                };`;

const replaceOpts = `const cOpts = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { display: false },
                        tooltip: { enabled: true },
                        datalabels: {
                            display: true,
                            color: '#fff',
                            font: { size: 10, weight: 'bold' },
                            anchor: 'end',
                            align: 'top',
                            formatter: (value) => {
                                if (value === 0 || !value) return '';
                                if (Math.abs(value) >= 1e9) return (value / 1e9).toFixed(1) + 'Mly';
                                if (Math.abs(value) >= 1e6) return (value / 1e6).toFixed(1) + 'M';
                                return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(value);
                            }
                        }
                    },
                    scales: { 
                        x: { ticks: { color: '#888', font: {size: 10} }, grid: { display:false } }, 
                        y: { ticks: { display: false }, grid: { display: false }, border: {display: false} }
                    }
                };`;

if (app.includes(searchOpts)) {
    app = app.replace(searchOpts, replaceOpts);
    console.log('✅ Fixed cOpts data labels');
} else {
    console.log('❌ Could not find cOpts');
    // Fallback regex
    const regOpts = /const cOpts = \{[\s\S]*?y: \{ ticks: \{ display: false \}, grid: \{ display: false \}, border: \{display: false\} \}\s*\}\s*\};/m;
    if (app.match(regOpts)) {
        app = app.replace(regOpts, replaceOpts);
        console.log('✅ Fixed cOpts via regex');
    }
}

fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', app, 'utf8');
