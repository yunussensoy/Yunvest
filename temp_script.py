import sys

with open('js/app_v48.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Line 2763
old1 = """<i class="fas fa-check" style="cursor:pointer; color:#ffffff; background:var(--success-color); border-radius:3px; padding:2px 3px; font-size:12px;" onclick="window.toggleDegerlemeEdit('${y}')" title="Kaydet"></i>"""
new1 = """<i class="fas fa-save" style="cursor:pointer; color:var(--success-color); background:#000000; border-radius:3px; padding:2px 3px; font-size:12px;" onclick="window.toggleDegerlemeEdit('${y}')" title="Kaydet"></i>"""
content = content.replace(old1, new1)

# Line 2882
old2 = """<button class="btn" style="background: var(--success-color); padding: 0.5rem 1.5rem;" onclick="window.addAnaliz()"><i class="fas fa-check"></i> Kaydet</button>"""
new2 = """<button class="btn" style="background: #000000; color: var(--success-color); padding: 0.5rem 1.5rem; border: 1px solid var(--success-color);" onclick="window.addAnaliz()"><i class="fas fa-save"></i> Kaydet</button>"""
content = content.replace(old2, new2)

# Line 3564
old3 = """<button class="btn" style="padding: 4px; width: 28px; height: 28px; background: var(--success-color); color: #ffffff; display: flex; align-items: center; justify-content: center; border-radius: 4px;" onclick="State.updateFiyat('${fon}', document.getElementById('v-fon-input-${fon}').value);" title="Kaydet"><i class="fas fa-check" style="font-size: 13px; color: #ffffff !important;"></i></button>"""
new3 = """<button class="btn" style="padding: 4px; width: 28px; height: 28px; background: #000000; color: var(--success-color); display: flex; align-items: center; justify-content: center; border-radius: 4px;" onclick="State.updateFiyat('${fon}', document.getElementById('v-fon-input-${fon}').value);" title="Kaydet"><i class="fas fa-save" style="font-size: 13px; color: var(--success-color) !important;"></i></button>"""
content = content.replace(old3, new3)

# Line 3579
old4 = """<button class="btn btn-icon" style="padding: 4px; width: 28px; height: 28px; background: var(--success-color); color: #ffffff; display: flex; align-items: center; justify-content: center; border-radius: 4px;" onclick="State.data.manuelNakitTutar = parseFloat(document.getElementById('v-nakit-input').value.replace(/\\\\./g, '').replace(',', '.')) || 0; State.save();" title="Kaydet"><i class="fas fa-check" style="font-size: 13px; color: #ffffff !important;"></i></button>"""
new4 = """<button class="btn btn-icon" style="padding: 4px; width: 28px; height: 28px; background: #000000; color: var(--success-color); display: flex; align-items: center; justify-content: center; border-radius: 4px;" onclick="State.data.manuelNakitTutar = parseFloat(document.getElementById('v-nakit-input').value.replace(/\\\\./g, '').replace(',', '.')) || 0; State.save();" title="Kaydet"><i class="fas fa-save" style="font-size: 13px; color: var(--success-color) !important;"></i></button>"""
content = content.replace(old4, new4)

# Line 3594
old5 = """<button class="btn btn-icon" style="padding: 4px; width: 28px; height: 28px; background: var(--success-color); color: #ffffff; display: flex; align-items: center; justify-content: center; border-radius: 4px;" onclick="State.data.hedefPortfoyTL = parseFloat(document.getElementById('v-hedef-input').value.replace(/\\\\./g, '').replace(',', '.')) || 0; State.save();" title="Kaydet"><i class="fas fa-check" style="font-size: 13px; color: #ffffff !important;"></i></button>"""
new5 = """<button class="btn btn-icon" style="padding: 4px; width: 28px; height: 28px; background: #000000; color: var(--success-color); display: flex; align-items: center; justify-content: center; border-radius: 4px;" onclick="State.data.hedefPortfoyTL = parseFloat(document.getElementById('v-hedef-input').value.replace(/\\\\./g, '').replace(',', '.')) || 0; State.save();" title="Kaydet"><i class="fas fa-save" style="font-size: 13px; color: var(--success-color) !important;"></i></button>"""
content = content.replace(old5, new5)

# Line 3670
old6 = """<button class="btn" style="padding: 4px; width: 24px; height: 24px; background: var(--success-color); color: #ffffff; display: flex; align-items: center; justify-content: center; border-radius: 4px;" onclick="window.addEnflasyon(event)" title="Kaydet"><i class="fas fa-check" style="font-size: 12px; color: #ffffff !important;"></i></button>"""
new6 = """<button class="btn" style="padding: 4px; width: 24px; height: 24px; background: #000000; color: var(--success-color); display: flex; align-items: center; justify-content: center; border-radius: 4px;" onclick="window.addEnflasyon(event)" title="Kaydet"><i class="fas fa-save" style="font-size: 12px; color: var(--success-color) !important;"></i></button>"""
content = content.replace(old6, new6)

# Line 4105
old7 = """<button class="btn btn-icon" style="padding: 4px; width: 24px; height: 24px; background: var(--success-color); color: #ffffff; display: flex; align-items: center; justify-content: center; border-radius: 4px;" onclick="window.addAnaliz()" title="Kaydet"><i class="fas fa-check" style="font-size: 12px; color: #ffffff !important;"></i></button>"""
new7 = """<button class="btn btn-icon" style="padding: 4px; width: 24px; height: 24px; background: #000000; color: var(--success-color); display: flex; align-items: center; justify-content: center; border-radius: 4px;" onclick="window.addAnaliz()" title="Kaydet"><i class="fas fa-save" style="font-size: 12px; color: var(--success-color) !important;"></i></button>"""
content = content.replace(old7, new7)

with open('js/app_v48.js', 'w', encoding='utf-8') as f:
    f.write(content)
