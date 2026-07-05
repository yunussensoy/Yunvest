const fs = require('fs');
let content = fs.readFileSync('js/app_v48.js', 'utf8');

// Replace table header
content = content.replace(/<tr><th style="font-size: 14px;">S\.N\.<\/th><th>Menkul<\/th>.+?<th>Ge.+?S.+?re<\/th><\/tr>/, `<tr><th style="font-size: 14px;">S.N.</th><th>Menkul</th><th>Güncel<br>Fiyat</th><th>Adet</th><th>Güncel<br>Maliyet</th><th>Güncel<br>Tutar</th><th>Kar/Zarar</th><th>Kar/Zarar <br> %</th></tr>`);

// Replace row HTML
const regexRow = /return `<tr>\s*<td>\$\{i \+ 1\}<\/td>\s*<td style="text-align: left;">\$\{p\.menkul\}<\/td>\s*<td style="\s*text-align:left;">\$\{tur\}<\/td>\s*\$\{fiyatHtml\}\s*<td>\$\{p\.adet\.toLocaleString\('tr-TR'\)\}<\/td>\s*<td>\$\{formatCurrency\(p\.guncelMaliyet\)\}<\/td>\s*<td>\$\{formatCurrency\(p\.netMaliyet\)\}<\/td>\s*<td>\$\{formatCurrency\(p\.odenenTutar, 0\)\}<\/td>\s*<td>\$\{formatCurrency\(p\.guncelTutar, 0\)\}<\/td>\s*<td class="\$\{p\.kar >= 0 \? 'text-success' : 'text-danger'\}">\$\{formatCurrency\(p\.kar, 0\)\}<\/td>\s*<td class="\$\{p\.kar >= 0 \? 'text-success' : 'text-danger'\}">\$\{formatPercent\(p\.karYuzde, 0\)\}<\/td>\s*<td>\$\{formatPercent\(p\.portfoyOrani, 0\)\}<\/td>\s*<td>\$\{formatDate\(p\.ilkAlimTarihi\)\}<\/td>\s*<td>\$\{p\.gecenSure\}<\/td>\s*<\/tr>`;/;

const newRow = `return \`<tr>
            <td>\${i + 1}</td>
            <td style="text-align: left;">\${p.menkul}</td>
            \${fiyatHtml}
            <td>\${p.adet.toLocaleString('tr-TR')}</td>
            <td>\${formatCurrency(p.guncelMaliyet)}</td>
            <td>\${formatCurrency(p.guncelTutar, 0)}</td>
            <td class="\${p.kar >= 0 ? 'text-success' : 'text-danger'}">\${formatCurrency(p.kar, 0)}</td>
            <td class="\${p.kar >= 0 ? 'text-success' : 'text-danger'}">\${formatPercent(p.karYuzde, 0)}</td>
        </tr>\`;`;

content = content.replace(regexRow, newRow);

// Replace total row
const regexTotal = /<tr class="total-row">\s*<td><\/td>\s*<td style="text-align:center;">TOPLAM<\/td>\s*<td colspan="5"><\/td>\s*<td>\$\{formatCurrency\(totalOdenen, 0\)\}<\/td>\s*<td>\$\{formatCurrency\(totalGuncel, 0\)\}<\/td>\s*<td class="\$\{totalKar >= 0 \? 'text-success' : 'text-danger'\}">\$\{formatCurrency\(totalKar, 0\)\}<\/td>\s*<td colspan="4"><\/td>\s*<\/tr>/;

const newTotal = `<tr class="total-row">
                                    <td></td>
                                    <td style="text-align:center;">TOPLAM</td>
                                    <td colspan="3"></td>
                                    <td>\${formatCurrency(totalGuncel, 0)}</td>
                                    <td class="\${totalKar >= 0 ? 'text-success' : 'text-danger'}">\${formatCurrency(totalKar, 0)}</td>
                                    <td></td>
                                </tr>`;

content = content.replace(regexTotal, newTotal);

fs.writeFileSync('js/app_v48.js', content, 'utf8');
console.log('Update complete.');
