import os

filepath = r"e:\Yunvest\js\app_v48.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Fix 1: Add finYatTotal to netBorc
target1 = """                    let nakitTotal = 0;
                    sData.bilanco.rows.forEach(r => {"""
replacement1 = """                    let nakitTotal = 0;
                    let finYatTotal = 0;
                    sData.bilanco.rows.forEach(r => {"""
content = content.replace(target1, replacement1)

target2 = """                        if (rName.includes('nakit ve nakit benzerleri') || rName.includes('nakit ve nakit değerler')) {
                            const val = typeof r[1] === 'number' ? r[1] : parseFloat((r[1]||'').replace(/\./g, '').replace(/,/g, '.')) || 0;
                            nakitTotal += val;
                        }
                    });
                    netBorc = finansalBorclarTotal - nakitTotal;"""
replacement2 = """                        if (rName.includes('nakit ve nakit benzerleri') || rName.includes('nakit ve nakit değerler')) {
                            const val = typeof r[1] === 'number' ? r[1] : parseFloat((r[1]||'').replace(/\./g, '').replace(/,/g, '.')) || 0;
                            nakitTotal += val;
                        }
                        if (rName.includes('finansal yatırımlar')) {
                            const val = typeof r[1] === 'number' ? r[1] : parseFloat((r[1]||'').replace(/\./g, '').replace(/,/g, '.')) || 0;
                            finYatTotal += val;
                        }
                    });
                    netBorc = finansalBorclarTotal - nakitTotal - finYatTotal;"""
content = content.replace(target2, replacement2)

# Fix 2: Convert netBorc to selected currency
target3 = """                        // Calculate PDs
                        let validPDs = [];
                        if (hasFavok && d.fd_favok !== undefined && d.fd_favok !== '') {
                            validPDs.push((favok * (parseFloat(d.fd_favok) || 0)) - netBorc);
                        }"""
replacement3 = """                        // Calculate PDs
                        let validPDs = [];
                        
                        let currentNetBorc = netBorc;
                        if (curCurrency === 'USD') currentNetBorc = netBorc / usdKuru;
                        else if (curCurrency === 'EUR') currentNetBorc = netBorc / eurKuru;

                        if (hasFavok && d.fd_favok !== undefined && d.fd_favok !== '') {
                            validPDs.push((favok * (parseFloat(d.fd_favok) || 0)) - currentNetBorc);
                        }"""
content = content.replace(target3, replacement3)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Degerleme calculation patched!")
