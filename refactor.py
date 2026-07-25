import sys

file_paths = [r'e:\Yunvest\yunvest\www\js\app_v49.js', r'e:\Yunvest\yunvest\js\app_v49.js']

for fp in file_paths:
    with open(fp, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for i, line in enumerate(lines):
        if 'Portföy Bilgileri' in line and 'table-header' in line:
            lines[i] = '''                    <div class="table-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Portföy Bilgileri</span>
                        <div>
                            <button id="portfoy-edit-btn" class="btn btn-icon" style="color: var(--accent-color); font-size: 14px; padding: 4px;" onclick="window.togglePortfoyEdit()" title="Düzenle"><i class="fas fa-edit"></i></button>
                            <button id="portfoy-save-btn" class="btn btn-icon" style="color: var(--success-color); font-size: 14px; padding: 4px; display: none;" onclick="window.savePortfoyEdit()" title="Kaydet"><i class="fas fa-save"></i></button>
                        </div>
                    </div>\n'''
        elif '<span id="nakit-text">' in line and 'guncelNakitTutar' in line:
            lines[i] = '''                                    <td style="text-align:right !important; width:25%; border-right: 1px solid rgba(255, 255, 255, 0.03);">
                                        <div style="display:flex; justify-content:flex-end; align-items:center; gap:0.5rem;">
                                            <span id="nakit-text">${formatCurrency(guncelNakitTutar)}</span>
                                            <input type="number" step="0.01" id="inline-nakit-input" class="form-control glass-input" style="display:none; width: 100px; text-align: right; padding: 2px 4px; font-size: 12px; height: 24px;" value="${State.data.manuelNakitTutar || 0}" onkeydown="if(event.key==='Enter') window.savePortfoyEdit()">
                                        </div>
                                    </td>\n'''
        elif '<span id="hedef-text">' in line and 'hedefPortfoy' in line:
            lines[i] = '''                                    <td style="text-align:right !important;">
                                        <div style="display:flex; justify-content:flex-end; align-items:center; gap:0.5rem;">
                                            <span id="hedef-text">${formatCurrency(portfoyBilgileri.hedefPortfoy, 0)}</span>
                                            <input type="number" id="inline-hedef-input" class="form-control glass-input" style="display:none; width: 100px; text-align: right; padding: 2px 4px; font-size: 12px; height: 24px;" value="${portfoyBilgileri.hedefPortfoy}" onkeydown="if(event.key==='Enter') window.savePortfoyEdit()">
                                        </div>
                                    </td>\n'''
        elif '<div class="table-header">Varlıklarım</div>' in line:
            lines[i] = '''                    <div class="table-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Varlıklarım</span>
                        <div>
                            <button id="varliklar-edit-btn" class="btn btn-icon" style="color: var(--accent-color); font-size: 14px; padding: 4px;" onclick="window.toggleVarliklarEdit()" title="Düzenle"><i class="fas fa-edit"></i></button>
                            <button id="varliklar-save-btn" class="btn btn-icon" style="color: var(--success-color); font-size: 14px; padding: 4px; display: none;" onclick="window.saveVarliklarEdit()" title="Kaydet"><i class="fas fa-save"></i></button>
                        </div>
                    </div>\n'''
        elif 'let fiyatHtml = `<td style="text-align: right !important;">${formatCurrency(p.guncelFiyat)}</td>`;' in line:
            if 'if (tur === \'Fon\')' in lines[i+1]:
                lines[i] = '''        let fiyatHtml = `<td style="text-align: right !important;">${formatCurrency(p.guncelFiyat)}</td>`;\n'''
                lines[i+1] = '''        if (tur === 'Fon') {
            if (p.menkul === 'PRY') {
                fiyatHtml = `<td style="text-align: right !important;">
                    <div style="display:flex; justify-content:flex-end; align-items:center; gap:0.5rem;">
                        <span class="pry-text">${formatCurrency(p.guncelFiyat)}</span>
                        <input type="number" step="0.000001" class="form-control glass-input inline-pry-input" style="display:none; width: 80px; text-align: right; padding: 2px 4px; font-size: 12px; height: 24px;" value="${p.guncelFiyat}" onkeydown="if(event.key==='Enter') window.saveVarliklarEdit()">
                    </div>
                </td>`;
            } else {
                fiyatHtml = `<td style="text-align: right !important;">${formatCurrency(p.guncelFiyat)}</td>`;
            }
        }\n'''
                lines[i+2] = ''
    
    content = "".join(lines)
    
    func_new = """    window.togglePortfoyEdit = () => {
        const isEditing = document.getElementById('portfoy-save-btn').style.display !== 'none';
        
        document.getElementById('nakit-text').style.display = isEditing ? 'inline' : 'none';
        document.getElementById('inline-nakit-input').style.display = isEditing ? 'none' : 'inline-block';
        
        document.getElementById('hedef-text').style.display = isEditing ? 'inline' : 'none';
        document.getElementById('inline-hedef-input').style.display = isEditing ? 'none' : 'inline-block';
        
        document.getElementById('portfoy-edit-btn').style.display = isEditing ? 'inline-block' : 'none';
        document.getElementById('portfoy-save-btn').style.display = isEditing ? 'none' : 'inline-block';
        
        if (!isEditing) {
            document.getElementById('inline-nakit-input').focus();
        }
    };
    
    window.savePortfoyEdit = () => {
        const nakitVal = document.getElementById('inline-nakit-input').value;
        const hedefVal = document.getElementById('inline-hedef-input').value;
        
        if (nakitVal !== '') State.data.manuelNakitTutar = parseFloat(nakitVal) || 0;
        if (hedefVal !== '') State.data.hedefPortfoyTL = parseFloat(hedefVal) || 0;
        
        State.save();
        if (typeof renderPage === "function") renderPage();
    };

    window.toggleVarliklarEdit = () => {
        const isEditing = document.getElementById('varliklar-save-btn').style.display !== 'none';
        
        const pryText = document.querySelector('.pry-text');
        const pryInput = document.querySelector('.inline-pry-input');
        
        if (pryText && pryInput) {
            pryText.style.display = isEditing ? 'inline' : 'none';
            pryInput.style.display = isEditing ? 'none' : 'inline-block';
        }
        
        document.getElementById('varliklar-edit-btn').style.display = isEditing ? 'inline-block' : 'none';
        document.getElementById('varliklar-save-btn').style.display = isEditing ? 'none' : 'inline-block';
        
        if (!isEditing && pryInput) {
            pryInput.focus();
        }
    };
    
    window.saveVarliklarEdit = () => {
        const pryInput = document.querySelector('.inline-pry-input');
        if (pryInput && pryInput.value !== '') {
            State.data.manuelFonFiyatlari = State.data.manuelFonFiyatlari || {};
            State.data.manuelFonFiyatlari['PRY'] = parseFloat(pryInput.value.replace(',', '.'));
            State.save();
            if (typeof renderPage === "function") renderPage();
        }
    };"""

    # Remove toggleHedefEdit, saveInlineHedef, toggleNakitEdit, saveInlineNakit
    import re
    content = re.sub(r"window\.toggleHedefEdit = \(\) => \{[\s\S]*?window\.saveInlineNakit = \(e\) => \{[\s\S]*?renderPage\(\);\s*\};", func_new, content)

    # Remove Veri Girisi elements
    veri_regex = r"<div style=\"display: flex; gap: 1rem; flex-wrap: wrap;\">[\s\S]*?<!-- Hedef Portföy -->[\s\S]*?</div>\s*</div>\s*</div>"
    content = re.sub(veri_regex, "", content)
    
    with open(fp, 'w', encoding='utf-8') as f:
        f.write(content)

print('Refactor successful')
