const fs = require('fs');
let txt = fs.readFileSync('e:\\Yunvest\\js\\app_v45.js', 'utf8');

const search = `        } else {
            fiyat = State.getFiyat(hisse);
        }
                \${renderCell('2028')}
                <td style="text-align: center;" onclick="event.stopPropagation()">
                    <button class="btn btn-icon" style="color: var(--danger-color);" onclick="window.removeHisseFromTakip('\${hisse}')"><i class="fas fa-trash-alt" style="font-size: 11px;"></i></button>
                </td>`;

const replace = `        } else {
            fiyat = State.getFiyat(hisse);
        }
        
        const hData = State.data.hedefFiyatlar && State.data.hedefFiyatlar[hisse] ? State.data.hedefFiyatlar[hisse] : null;
        const renderCell = (year) => {
            if (!hData || !hData[year]) return \`<td style="text-align: center;">-</td><td style="text-align: center;">-</td>\`;
            const color = hData[year].potansiyel > 0 ? '#2ecc71' : '#e74c3c';
            return \`<td style="text-align: center;">\${fmtDec(hData[year].hedefFiyat)}</td><td style="text-align: center; color:\${color}; font-weight:bold;">\${fmtPct(hData[year].potansiyel)}</td>\`;
        };
        
        rowsHtml += \`
            <tr style="cursor: pointer;" onclick="window.goToHisse('\${hisse}')">
                <td style="text-align: center;">\${i + 1}</td>
                <td style="text-align: left; font-weight: bold; color: var(--accent-color);">\${hisse}</td>
                <td style="text-align: center;">\${fmtDec(fiyat)}</td>
                \${renderCell('2026')}
                \${renderCell('2027')}
                \${renderCell('2028')}
                <td style="text-align: center;" onclick="event.stopPropagation()">
                    <button class="btn btn-icon" style="color: var(--danger-color); padding: 0.1rem 0.3rem;" onclick="window.removeHisseFromTakip('\${hisse}')"><i class="fas fa-trash-alt" style="font-size: 11px;"></i></button>
                </td>`;

txt = txt.replace(search, replace);
fs.writeFileSync('e:\\Yunvest\\js\\app_v45.js', txt, 'utf8');
console.log(txt.includes("padding: 0.1rem 0.3rem;") ? "Fixed!" : "Not found string");
