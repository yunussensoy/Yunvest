const fs = require('fs');
let content = fs.readFileSync('js/app_v48.js', 'utf8');

// Replace table header
const oldHeader = `<tr><th style="font-size: 14px;">S.N.</th><th>Menkul</th><th>TǬr</th><th>GǬncel<br>Fiyat</th><th>Adet</th><th>GǬncel<br>Maliyet</th><th>Net<br>Maliyet</th><th>-denen<br>Tutar</th><th>GǬncel<br>Tutar</th><th>Kar/Zarar</th><th>Kar/Zarar <br> %</th><th>Portfy<br>Oran</th><th>lk Alm<br>Tarihi</th><th>Geen<br>SǬre</th></tr>`;
const newHeader = `<tr><th style="font-size: 14px;">S.N.</th><th>Menkul</th><th>GǬncel<br>Fiyat</th><th>Adet</th><th>GǬncel<br>Maliyet</th><th>GǬncel<br>Tutar</th><th>Kar/Zarar</th><th>Kar/Zarar <br> %</th></tr>`;
content = content.replace(oldHeader, newHeader);

// Replace row HTML
const oldRow = `return \`<tr>
            <td>\${i + 1}</td>
            <td style="text-align: left;">\${p.menkul}</td>
            <td style="  text-align:left;">\${tur}</td>
            \${fiyatHtml}
            <td>\${p.adet.toLocaleString('tr-TR')}</td>
            <td>\${formatCurrency(p.guncelMaliyet)}</td>
            <td>\${formatCurrency(p.netMaliyet)}</td>
            <td>\${formatCurrency(p.odenenTutar, 0)}</td>
            <td>\${formatCurrency(p.guncelTutar, 0)}</td>
            <td class="\${p.kar >= 0 ? 'text-success' : 'text-danger'}">\${formatCurrency(p.kar, 0)}</td>
            <td class="\${p.kar >= 0 ? 'text-success' : 'text-danger'}">\${formatPercent(p.karYuzde, 0)}</td>
            <td>\${formatPercent(p.portfoyOrani, 0)}</td>
            <td>\${formatDate(p.ilkAlimTarihi)}</td>
            <td>\${p.gecenSure}</td>
        </tr>\`;`;

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
content = content.replace(oldRow, newRow);

// Replace total row
const oldTotal = `<tr class="total-row">
                                    <td></td>
                                    <td style="text-align:center;">TOPLAM</td>
                                    <td colspan="5"></td>
                                    <td>\${formatCurrency(totalOdenen, 0)}</td>
                                    <td>\${formatCurrency(totalGuncel, 0)}</td>
                                    <td class="\${totalKar >= 0 ? 'text-success' : 'text-danger'}">\${formatCurrency(totalKar, 0)}</td>
                                    <td colspan="4"></td>
                                </tr>`;

const newTotal = `<tr class="total-row">
                                    <td></td>
                                    <td style="text-align:center;">TOPLAM</td>
                                    <td colspan="3"></td>
                                    <td>\${formatCurrency(totalGuncel, 0)}</td>
                                    <td class="\${totalKar >= 0 ? 'text-success' : 'text-danger'}">\${formatCurrency(totalKar, 0)}</td>
                                    <td></td>
                                </tr>`;
content = content.replace(oldTotal, newTotal);

fs.writeFileSync('js/app_v48.js', content, 'utf8');
console.log('Update complete.');
