import os

filepath = r"e:\Yunvest\js\app_v48.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Fix 1: Add sermaye to rows
target1 = """                    { key: 'pd_dd', label: 'PD/DD', type: 'decimal' },
                    { key: 'hedef_fiyat', label: 'Hedef Fiyat', readonly: true, isTarget: true, type: 'target' },"""

replacement1 = """                    { key: 'pd_dd', label: 'PD/DD', type: 'decimal' },
                    { key: 'sermaye', label: 'Ödenmiş Sermaye*', type: 'decimal', placeholder: 'Bilanço verisi' },
                    { key: 'hedef_fiyat', label: 'Hedef Fiyat', readonly: true, isTarget: true, type: 'target' },"""
content = content.replace(target1, replacement1)


# Fix 2: Add placeholder logic for sermaye in the cell rendering
# Wait, the cell rendering doesn't natively support placeholders easily without tweaking, 
# but it uses `type: 'decimal'` which renders an input. 
# Let's find where the input is generated.
target_input = """                                            <input type="${r.type === 'percent' || r.type==='decimal' ? 'number' : 'text'}" 
                                                value="${val}" 
                                                onchange="window.updateDegerlemeInput('${selectedHisse}', '${y}', '${r.key}', this.value)"
                                                style="width: 100%; padding:4px; text-align:center; border:1px solid var(--border-color); border-radius:4px; background: var(--bg-color); color: var(--text-color);"
                                            />"""
# We can just leave the input generation as is. If the user doesn't enter anything, it uses the bilanco one.

# Fix 3: Use currentOdenmisSermaye
target2 = """                        let hedefFiyatTL = 0;
                        let hasHedef = false;
                        
                        if (validPDs.length > 0 && odenmisSermaye > 0) {
                            let hedefFiyatForeign = avgPD / odenmisSermaye;"""
                            
replacement2 = """                        let hedefFiyatTL = 0;
                        let hasHedef = false;
                        
                        let currentOdenmisSermaye = odenmisSermaye;
                        if (d.sermaye !== undefined && d.sermaye !== '') {
                            currentOdenmisSermaye = parseFloat(d.sermaye) || currentOdenmisSermaye;
                        }
                        
                        if (validPDs.length > 0 && currentOdenmisSermaye > 0) {
                            let hedefFiyatForeign = avgPD / currentOdenmisSermaye;"""
content = content.replace(target2, replacement2)


# Let's also patch the display value for sermaye if it's not edited, it should ideally show the bilanco value?
# If we want it to show the bilanco value when not edited, we can do:
target3 = """                        if (r.key === 'potansiyel') {
                            if (hasHedef && guncelFiyat > 0) {
                                displayVal = val = potansiyelNum;
                            } else {
                                displayVal = val = '---';
                            }
                        }"""
replacement3 = """                        if (r.key === 'potansiyel') {
                            if (hasHedef && guncelFiyat > 0) {
                                displayVal = val = potansiyelNum;
                            } else {
                                displayVal = val = '---';
                            }
                        }
                        if (r.key === 'sermaye' && !editMode && (d.sermaye === undefined || d.sermaye === '')) {
                            displayVal = odenmisSermaye;
                        }
"""
content = content.replace(target3, replacement3)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Degerleme sermaye override patched!")
