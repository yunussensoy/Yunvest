import sys

with open('js/app_v48.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_str = """<button class="btn" style="background: var(--warning-color); padding: 4px 10px; font-size: 13px; position: absolute; right: 5px;" onclick="window.toggleInlineAnaliz()" title="Yeni Not Ekle"><i class="fas fa-plus"></i></button>"""
new_str = """<button class="btn" style="background: var(--warning-color); padding: 3px 8px; font-size: 12px; position: absolute; right: 5px;" onclick="window.toggleInlineAnaliz()" title="Yeni Not Ekle"><i class="fas fa-plus" style="font-size: 11px;"></i></button>"""

content = content.replace(old_str, new_str)

with open('js/app_v48.js', 'w', encoding='utf-8') as f:
    f.write(content)
