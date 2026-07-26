import sys
import re

with open('js/app_v49.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. HTML Insertion
html_to_add = """
                    <!-- Faaliyet Karý -->
                    <div style="display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; align-items: stretch; margin-bottom: 1rem;">
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 0.85rem; font-weight: 500; padding-right: 20px;">
                                <span>Faaliyet Karý (Çeyreklik)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-ceyreklik-faaliyet"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 0.85rem; font-weight: 500; padding-right: 20px;">
                                <span>Faaliyet Karý (Dönemsel)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-donemsel-faaliyet"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 0.85rem; font-weight: 500; padding-right: 20px;">
                                <span>Faaliyet Karý (Yýllýklandýrýlmýþ)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-yillik-faaliyet"></canvas></div>
                        </div>
                    </div>
                    <div class="dash-card" style="margin-bottom:1rem; display:flex; flex-direction:column; padding: 1.2rem;">
                        <div class="dash-title" style="position:relative; font-size: 0.85rem; font-weight: 500; padding-right: 20px;">
                            <span>Faaliyet Karý</span>
                            <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                        </div>
                        <div style="flex:1; min-height:400px; min-width: 0; position:relative;"><canvas id="chart-combined-faaliyet"></canvas></div>
                    </div>

                    <!-- FAVÖK -->
                    <div style="display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; align-items: stretch; margin-bottom: 1rem;">
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 0.85rem; font-weight: 500; padding-right: 20px;">
                                <span>FAVÖK (Çeyreklik)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-ceyreklik-favok2"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 0.85rem; font-weight: 500; padding-right: 20px;">
                                <span>FAVÖK (Dönemsel)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-donemsel-favok"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 0.85rem; font-weight: 500; padding-right: 20px;">
                                <span>FAVÖK (Yýllýklandýrýlmýþ)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-yillik-favok"></canvas></div>
                        </div>
                    </div>
                    <div class="dash-card" style="margin-bottom:1rem; display:flex; flex-direction:column; padding: 1.2rem;">
                        <div class="dash-title" style="position:relative; font-size: 0.85rem; font-weight: 500; padding-right: 20px;">
                            <span>FAVÖK</span>
                            <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                        </div>
                        <div style="flex:1; min-height:400px; min-width: 0; position:relative;"><canvas id="chart-combined-favok"></canvas></div>
                    </div>

                    <!-- Net Kar -->
                    <div style="display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; align-items: stretch; margin-bottom: 1rem;">
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 0.85rem; font-weight: 500; padding-right: 20px;">
                                <span>Net Kar (Çeyreklik)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-ceyreklik-netkar2"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 0.85rem; font-weight: 500; padding-right: 20px;">
                                <span>Net Kar (Dönemsel)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-donemsel-netkar"></canvas></div>
                        </div>
                        <div class="dash-card" style="margin-bottom:0; display:flex; flex-direction:column; padding: 1.2rem;">
                            <div class="dash-title" style="position:relative; font-size: 0.85rem; font-weight: 500; padding-right: 20px;">
                                <span>Net Kar (Yýllýklandýrýlmýþ)</span>
                                <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                            </div>
                            <div style="flex:1; min-height:250px; min-width: 0; position:relative;"><canvas id="chart-yillik-netkar"></canvas></div>
                        </div>
                    </div>
                    <div class="dash-card" style="margin-bottom:1rem; display:flex; flex-direction:column; padding: 1.2rem;">
                        <div class="dash-title" style="position:relative; font-size: 0.85rem; font-weight: 500; padding-right: 20px;">
                            <span>Net Kar</span>
                            <i class="fas fa-expand" style="position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-secondary);" title="Büyüt" onclick="window.toggleExpandCard(this)"></i>
                        </div>
                        <div style="flex:1; min-height:400px; min-width: 0; position:relative;"><canvas id="chart-combined-netkar"></canvas></div>
                    </div>
"""
target_html = '                        <div style="flex:1; min-height:400px; min-width: 0; position:relative;"><canvas id="chart-combined-brut"></canvas></div>\n                    </div>\n                </div>\n                ;'
if target_html in code:
    code = code.replace(target_html, '                        <div style="flex:1; min-height:400px; min-width: 0; position:relative;"><canvas id="chart-combined-brut"></canvas></div>\n                    </div>\n' + html_to_add + '                </div>\n                ;')
else:
    print("Failed to inject HTML")

# 2. JS Initialization Insertion
js_to_add = """
                // --- Faaliyet Karý ---
                const ctxFaaliyetCeyreklik = document.getElementById('chart-ceyreklik-faaliyet');
                if (ctxFaaliyetCeyreklik) { let ex = Chart.getChart(ctxFaaliyetCeyreklik); if (ex) ex.destroy(); new Chart(ctxFaaliyetCeyreklik, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.faaliyet, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }

                const ctxFaaliyetDonemsel = document.getElementById('chart-donemsel-faaliyet');
                if (ctxFaaliyetDonemsel) { let ex = Chart.getChart(ctxFaaliyetDonemsel); if (ex) ex.destroy(); new Chart(ctxFaaliyetDonemsel, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.dFaaliyet, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }

                const ctxFaaliyetYillik = document.getElementById('chart-yillik-faaliyet');
                if (ctxFaaliyetYillik) { let ex = Chart.getChart(ctxFaaliyetYillik); if (ex) ex.destroy(); new Chart(ctxFaaliyetYillik, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.yFaaliyet, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }

                const ctxFaaliyetCombined = document.getElementById('chart-combined-faaliyet');
                if (ctxFaaliyetCombined) { let ex = Chart.getChart(ctxFaaliyetCombined); if (ex) ex.destroy(); new Chart(ctxFaaliyetCombined, { type: 'bar', data: { labels: labels, datasets: [{ label: 'Çeyreklik', data: dData.faaliyet, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }, { label: 'Dönemsel', data: dData.dFaaliyet, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }, { label: 'Yýllýklandýrýlmýþ', data: dData.yFaaliyet, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, callbacks: { label: function(c) { let v = c.raw; return c.dataset.label + ': ' + (v ? new Intl.NumberFormat('tr-TR').format(v) : '-'); } } }, datalabels: { display: false } }, scales: { x: { ticks: { color: '#ccc', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#ccc', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } } } } }); }

                // --- FAVÖK ---
                const ctxFavokCeyreklik2 = document.getElementById('chart-ceyreklik-favok2');
                if (ctxFavokCeyreklik2) { let ex = Chart.getChart(ctxFavokCeyreklik2); if (ex) ex.destroy(); new Chart(ctxFavokCeyreklik2, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.favok, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }

                const ctxFavokDonemsel = document.getElementById('chart-donemsel-favok');
                if (ctxFavokDonemsel) { let ex = Chart.getChart(ctxFavokDonemsel); if (ex) ex.destroy(); new Chart(ctxFavokDonemsel, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.dFavok, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }

                const ctxFavokYillik = document.getElementById('chart-yillik-favok');
                if (ctxFavokYillik) { let ex = Chart.getChart(ctxFavokYillik); if (ex) ex.destroy(); new Chart(ctxFavokYillik, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.yFavok, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }

                const ctxFavokCombined = document.getElementById('chart-combined-favok');
                if (ctxFavokCombined) { let ex = Chart.getChart(ctxFavokCombined); if (ex) ex.destroy(); new Chart(ctxFavokCombined, { type: 'bar', data: { labels: labels, datasets: [{ label: 'Çeyreklik', data: dData.favok, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }, { label: 'Dönemsel', data: dData.dFavok, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }, { label: 'Yýllýklandýrýlmýþ', data: dData.yFavok, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, callbacks: { label: function(c) { let v = c.raw; return c.dataset.label + ': ' + (v ? new Intl.NumberFormat('tr-TR').format(v) : '-'); } } }, datalabels: { display: false } }, scales: { x: { ticks: { color: '#ccc', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#ccc', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } } } } }); }

                // --- Net Kar ---
                const ctxNetKarCeyreklik2 = document.getElementById('chart-ceyreklik-netkar2');
                if (ctxNetKarCeyreklik2) { let ex = Chart.getChart(ctxNetKarCeyreklik2); if (ex) ex.destroy(); new Chart(ctxNetKarCeyreklik2, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.netkar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }

                const ctxNetKarDonemsel = document.getElementById('chart-donemsel-netkar');
                if (ctxNetKarDonemsel) { let ex = Chart.getChart(ctxNetKarDonemsel); if (ex) ex.destroy(); new Chart(ctxNetKarDonemsel, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.dNetKar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }

                const ctxNetKarYillik = document.getElementById('chart-yillik-netkar');
                if (ctxNetKarYillik) { let ex = Chart.getChart(ctxNetKarYillik); if (ex) ex.destroy(); new Chart(ctxNetKarYillik, { type: 'bar', data: { labels: labels, datasets: [{ data: dData.yNetKar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }, options: barOpts }); }

                const ctxNetKarCombined = document.getElementById('chart-combined-netkar');
                if (ctxNetKarCombined) { let ex = Chart.getChart(ctxNetKarCombined); if (ex) ex.destroy(); new Chart(ctxNetKarCombined, { type: 'bar', data: { labels: labels, datasets: [{ label: 'Çeyreklik', data: dData.netkar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }, { label: 'Dönemsel', data: dData.dNetKar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }, { label: 'Yýllýklandýrýlmýþ', data: dData.yNetKar, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1, borderRadius: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, callbacks: { label: function(c) { let v = c.raw; return c.dataset.label + ': ' + (v ? new Intl.NumberFormat('tr-TR').format(v) : '-'); } } }, datalabels: { display: false } }, scales: { x: { ticks: { color: '#ccc', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#ccc', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } } } } }); }
"""

target_js = "                const ctxFavok = document.getElementById('chart-ceyreklik-favok');"
if target_js in code:
    code = code.replace(target_js, js_to_add + "\n" + target_js)
else:
    print("Failed to inject JS")

with open('js/app_v49.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
