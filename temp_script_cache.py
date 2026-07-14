import sys

# 1. Update sw.js cache version
with open('sw.js', 'r', encoding='utf-8') as f:
    sw_content = f.read()

sw_content = sw_content.replace("'yunvest-pwa-cache-v9'", "'yunvest-pwa-cache-v10'")

with open('sw.js', 'w', encoding='utf-8') as f:
    f.write(sw_content)

# 2. Update app_v48.js (Enflasyon buttons to div)
with open('js/app_v48.js', 'r', encoding='utf-8') as f:
    app_content = f.read()

old3670 = """<button class="btn" style="padding: 4px; width: 24px; height: 24px; background: #000000; color: var(--success-color); display: flex; align-items: center; justify-content: center; border-radius: 4px;" onclick="window.addEnflasyon(event)" title="Kaydet"><i class="fas fa-save" style="font-size: 12px; color: var(--success-color) !important;"></i></button>"""
new3670 = """<div style="width: 24px; height: 24px; background: #000000; display: flex; align-items: center; justify-content: center; border-radius: 4px; cursor: pointer;" onclick="window.addEnflasyon(event)" title="Kaydet"><i class="fas fa-save" style="font-size: 13px; color: var(--success-color) !important;"></i></div>"""
app_content = app_content.replace(old3670, new3670)

old3671 = """<button class="btn btn-danger" style="padding: 2px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 4px;" onclick="window.toggleEnfForm()" title="İptal"><i class="fas fa-times" style="font-size: 13px;"></i></button>"""
new3671 = """<div style="width: 24px; height: 24px; background: var(--danger-color); display: flex; align-items: center; justify-content: center; border-radius: 4px; cursor: pointer;" onclick="window.toggleEnfForm()" title="İptal"><i class="fas fa-times" style="font-size: 13px; color: #ffffff !important;"></i></div>"""
app_content = app_content.replace(old3671, new3671)

with open('js/app_v48.js', 'w', encoding='utf-8') as f:
    f.write(app_content)
