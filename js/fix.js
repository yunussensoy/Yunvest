const fs = require('fs');
let content = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

// 1. Memory Leak Fixes
content = content.replace(/new Chart\(document\.getElementById\(id\)\.getContext\('2d'\), \{/g, 
`let chartCanvas = document.getElementById(id);
                                  let existingChart = Chart.getChart(chartCanvas);
                                  if (existingChart) existingChart.destroy();
                                  new Chart(chartCanvas.getContext('2d'), {`);

content = content.replace(/new Chart\(ctxSatislar, \{/g, 
`let exS = Chart.getChart(ctxSatislar); if (exS) exS.destroy();
                    new Chart(ctxSatislar, {`);

content = content.replace(/new Chart\(ctxFavok, \{/g, 
`let exF = Chart.getChart(ctxFavok); if (exF) exF.destroy();
                    new Chart(ctxFavok, {`);

content = content.replace(/new Chart\(ctxNetKar, \{/g, 
`let exN = Chart.getChart(ctxNetKar); if (exN) exN.destroy();
                    new Chart(ctxNetKar, {`);

// 2. Hisse Font Sizes
content = content.replace(/<h1 style="margin: 0; font-size: 1\.5rem; font-weight: 600; letter-spacing: 1px; color: #fff;">\$\{selectedHisse\}<\/h1>/g, 
`<h1 style="margin: 0; font-size: 1.2rem; font-weight: 700; letter-spacing: 1px; color: #fff;">${'${selectedHisse}'}</h1>`);

content = content.replace(/<div style="font-size: 1\.5rem; font-weight: bold; color: #fff;">/g, 
`<div style="font-size: 1.2rem; font-weight: bold; color: #fff;">`);

content = content.replace(/<div id="hisse-header-change" style="font-size: 1rem;/g, 
`<div id="hisse-header-change" style="font-size: 0.9rem;`);

// 3. Disable Sign Up
content = content.replace(/auth\.createUserWithEmailAndPassword\(email, password\)[\s\S]*?\}, \{ merge\: true \}\)\;\s*\}\)\s*\.catch\(err => \{/g, 
`alert("Yeni üye alımı güvenlik nedeniyle kapatılmıştır.");
                btn.innerText = originalBtnText;
                btn.disabled = false;
            }).catch(err => {`);

// 4. Ticker Font Sizes
content = content.replace(/font-size: 0\.65rem/g, `font-size: 13px`);
content = content.replace(/font-size: 0\.75rem/g, `font-size: 13px`);

// Write back
fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', content, 'utf8');
console.log("Done");