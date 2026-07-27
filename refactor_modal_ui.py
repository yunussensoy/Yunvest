import re

# 1. Update HTML files
html_files = ["e:/Yunvest/yunvest/index.html", "e:/Yunvest/yunvest/www/index.html"]

old_h3 = '<h3 style="margin: 0; color: #ffffff; font-size: 16px;">Takip Listesi Düzenle</h3>'
new_h3 = '<h3 style="margin: 0; color: #ffffff; font-size: 15px;">Takip Listesi Düzenle</h3>'

old_input = '<input type="text" id="takip-edit-arama-input" class="modern-input" placeholder="Hisse ara (Örn: THYAO)..." style="flex: 1; font-size: 14px; text-transform: uppercase;">'
new_input = '<input type="text" id="takip-edit-arama-input" class="modern-input" placeholder="Hisse ara (Örn: THYAO)..." style="flex: 1; font-size: 13px; text-transform: uppercase;">'

old_plus_btn = '<button class="btn" style="padding: 0 1rem;" onclick="window.addHisseToTakipFromModal()"><i class="fas fa-plus"></i></button>'
new_plus_btn = '<i class="fas fa-plus" style="padding: 0 0.5rem; cursor: pointer; color: var(--text-secondary); font-size: 13px; display: flex; align-items: center;" onclick="window.addHisseToTakipFromModal()"></i>'

for filepath in html_files:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    content = content.replace(old_h3, new_h3)
    content = content.replace(old_input, new_input)
    content = content.replace(old_plus_btn, new_plus_btn)
    
    # Bump version
    content = re.sub(r'v=20260727-18', 'v=20260727-19', content)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)


# 2. Update JS files
js_files = ["e:/Yunvest/yunvest/js/app_v49.js", "e:/Yunvest/yunvest/www/js/app_v49.js"]

old_js_list_item = """<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 1rem; background: var(--surface-color); border-radius: 8px; border: 1px solid var(--surface-border);">
                <span style="color: var(--text-primary); font-weight: 500; font-size: 14px;">${hisse}</span>
                <button class="btn btn-icon" style="padding: 4px; background: transparent; color: var(--text-secondary);" onclick="window.removeHisseFromTakipModal('${hisse}')">
                    <i class="fas fa-trash-alt" style="font-size: 14px;"></i>
                </button>
            </div>"""

new_js_list_item = """<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 1rem; background: var(--surface-color); border-radius: 8px; border: 1px solid var(--surface-border);">
                <span style="color: var(--text-primary); font-weight: 500; font-size: 13px;">${hisse}</span>
                <i class="fas fa-trash-alt" style="cursor: pointer; color: var(--text-secondary); font-size: 13px;" onclick="window.removeHisseFromTakipModal('${hisse}')"></i>
            </div>"""

for filepath in js_files:
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()
        
    content = content.replace(old_js_list_item, new_js_list_item)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print("Updates applied.")
