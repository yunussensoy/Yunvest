import sys

file_path = r'e:\Yunvest\yunvest\www\js\app_v49.js'
with open(file_path, 'r', encoding='utf-8') as f:
    c = f.read()

old_portfoy_header = '                    <div class="table-header">Portföy Bilgileri</div>'
old_nakit_row = '<td style="text-align:right !important; width:25%; border-right: 1px solid rgba(255, 255, 255, 0.03);"><div style="display:flex; justify-content:flex-end; align-items:center; gap:0.5rem;"><span id="nakit-text">${formatCurrency(guncelNakitTutar)}</span></div></td>'
old_hedef_row = '<td style="text-align:right !important;"><div style="display:flex; justify-content:flex-end; align-items:center; gap:0.5rem;"><span id="hedef-text">${formatCurrency(portfoyBilgileri.hedefPortfoy, 0)}</span></div></td>'
old_varliklar_header = '                    <div class="table-header">Varlıklarım</div>'

print('portfoy_header:', old_portfoy_header in c)
print('nakit_row:', old_nakit_row in c)
print('hedef_row:', old_hedef_row in c)
print('varliklar_header:', old_varliklar_header in c)
