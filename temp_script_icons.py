import sys

with open('js/app_v48.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Lines 2882
old_save_text = """<button class="btn" style="background: #000000; color: var(--success-color); padding: 0.5rem 1.5rem; border: 1px solid var(--success-color);" onclick="window.addAnaliz()"><i class="fas fa-save"></i> Kaydet</button>"""
new_save_text = """<button class="btn" style="padding: 4px; width: 28px; height: 28px; background: #000000; color: var(--success-color); display: flex; align-items: center; justify-content: center; border-radius: 4px; border: none;" onclick="window.addAnaliz()" title="Kaydet"><i class="fas fa-save" style="font-size: 14px; color: var(--success-color) !important;"></i></button>"""
content = content.replace(old_save_text, new_save_text)

# Line 2883
old_cancel_text = """<button class="btn" style="background: var(--danger-color); padding: 0.5rem 1.5rem;" onclick="window.toggleInlineAnaliz()"><i class="fas fa-times"></i> İptal</button>"""
new_cancel_text = """<button class="btn" style="padding: 4px; width: 28px; height: 28px; background: var(--danger-color); color: #ffffff; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: none;" onclick="window.toggleInlineAnaliz()" title="İptal"><i class="fas fa-times" style="font-size: 14px; color: #ffffff !important;"></i></button>"""
content = content.replace(old_cancel_text, new_cancel_text)

# Line 4106
old_cancel_icon = """<button class="btn btn-icon" style="color: var(--danger-color);" onclick="window.toggleInlineAnaliz()" title="İptal"><i class="fas fa-times"></i></button>"""
new_cancel_icon = """<button class="btn btn-icon" style="padding: 4px; width: 24px; height: 24px; background: var(--danger-color); color: #ffffff; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: none;" onclick="window.toggleInlineAnaliz()" title="İptal"><i class="fas fa-times" style="font-size: 12px; color: #ffffff !important;"></i></button>"""
content = content.replace(old_cancel_icon, new_cancel_icon)


with open('js/app_v48.js', 'w', encoding='utf-8') as f:
    f.write(content)
