import sys
import re

with open('js/app_v49.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace big inline form buttons
content = re.sub(
    r'<div style="background: #000000; width: 24px !important;[^>]+onclick="window\.addAnaliz\(\)"[^>]+><i class="fas fa-save"[^>]+></i></div>',
    r'<button class="btn" style="background: var(--success-color); color: var(--btn-text); padding: 0.4rem 1.2rem; border-radius: 4px; border: none; cursor: pointer;" onclick="window.addAnaliz()"><i class="fas fa-save"></i> Kaydet</button>',
    content
)

content = re.sub(
    r'<div style="background: var\(--danger-color\); width: 24px !important;[^>]+onclick="window\.toggleInlineAnaliz\(\)"[^>]+><i class="fas fa-times"[^>]+></i></div>',
    r'<button class="btn" style="background: var(--danger-color); color: #fff; padding: 0.4rem 1.2rem; border-radius: 4px; border: none; cursor: pointer;" onclick="window.toggleInlineAnaliz()"><i class="fas fa-times"></i> İptal</button>',
    content
)

# Replace small inline form buttons
content = re.sub(
    r'<div style="background: #000000; width: 22px !important;[^>]+onclick="window\.addAnaliz\(\)"[^>]+><i class="fas fa-save"[^>]+></i></div>',
    r'<button class="btn" style="background: var(--success-color); color: var(--btn-text); padding: 0.3rem 0.8rem; font-size: 12px; border-radius: 4px; border: none; cursor: pointer;" onclick="window.addAnaliz()"><i class="fas fa-save"></i> Kaydet</button>',
    content
)

content = re.sub(
    r'<div style="background: var\(--danger-color\); width: 22px !important;[^>]+onclick="window\.toggleInlineAnaliz\(\)"[^>]+><i class="fas fa-times"[^>]+></i></div>',
    r'<button class="btn" style="background: var(--danger-color); color: #fff; padding: 0.3rem 0.8rem; font-size: 12px; border-radius: 4px; border: none; cursor: pointer;" onclick="window.toggleInlineAnaliz()"><i class="fas fa-times"></i> İptal</button>',
    content
)

with open('js/app_v49.js', 'w', encoding='utf-8') as f:
    f.write(content)
