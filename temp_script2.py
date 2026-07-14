import sys

# Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_str = """<button style="background: var(--success-color); border: none; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: var(--btn-text); cursor: pointer;" onclick="window.addHisseToTakip(); document.getElementById('search-autocomplete-list').style.display='none';"><i class="fas fa-plus" style="font-size: 12px;"></i></button>"""
new_str = """<button style="background: var(--warning-color); border: none; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: var(--btn-text); cursor: pointer;" onclick="window.addHisseToTakip(); document.getElementById('search-autocomplete-list').style.display='none';"><i class="fas fa-plus" style="font-size: 12px;"></i></button>"""
content = content.replace(old_str, new_str)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

# Update app_v48.js
with open('js/app_v48.js', 'r', encoding='utf-8') as f:
    app_content = f.read()

old_app = """<button class="btn" style="background: var(--success-color); padding: 4px 10px; font-size: 14px; position: absolute; right: 5px;" onclick="window.toggleInlineAnaliz()" title="Yeni Not Ekle"><i class="fas fa-plus"></i></button>"""
new_app = """<button class="btn" style="background: var(--warning-color); padding: 4px 10px; font-size: 14px; position: absolute; right: 5px;" onclick="window.toggleInlineAnaliz()" title="Yeni Not Ekle"><i class="fas fa-plus"></i></button>"""
app_content = app_content.replace(old_app, new_app)

with open('js/app_v48.js', 'w', encoding='utf-8') as f:
    f.write(app_content)
