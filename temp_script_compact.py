import sys
import re

with open('js/app_v49.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all inline Analiz buttons to be extremely compact
old_save_2882 = r'<button class="btn" style="background: var\(--success-color\); color: var\(--btn-text\); padding: 0\.2rem 0\.6rem; font-size: 13px; border-radius: 4px; border: none; cursor: pointer;" onclick="window\.addAnaliz\(\)"><i class="fas fa-save"></i> Kaydet</button>'
new_save_2882 = r'<button class="btn" style="background: var(--success-color); color: var(--btn-text); padding: 2px 6px; height: 26px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; border-radius: 4px; border: none; cursor: pointer;" onclick="window.addAnaliz()"><i class="fas fa-save" style="margin-right: 4px;"></i> Kaydet</button>'
content = re.sub(old_save_2882, new_save_2882, content)

old_cancel_2883 = r'<button class="btn" style="background: var\(--danger-color\); color: #fff; padding: 0\.2rem 0\.6rem; font-size: 13px; border-radius: 4px; border: none; cursor: pointer;" onclick="window\.toggleInlineAnaliz\(\)">İptal</button>'
new_cancel_2883 = r'<button class="btn" style="background: var(--danger-color); color: #fff; padding: 2px 6px; height: 26px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; border-radius: 4px; border: none; cursor: pointer;" onclick="window.toggleInlineAnaliz()">İptal</button>'
content = re.sub(old_cancel_2883, new_cancel_2883, content)


# Small ones
old_save_4105 = r'<button class="btn" style="background: var\(--success-color\); color: var\(--btn-text\); padding: 0\.1rem 0\.4rem; font-size: 12px; border-radius: 4px; border: none; cursor: pointer;" onclick="window\.addAnaliz\(\)"><i class="fas fa-save"></i> Kaydet</button>'
new_save_4105 = r'<button class="btn" style="background: var(--success-color); color: var(--btn-text); padding: 2px 6px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; border-radius: 4px; border: none; cursor: pointer;" onclick="window.addAnaliz()"><i class="fas fa-save" style="margin-right: 4px;"></i> Kaydet</button>'
content = re.sub(old_save_4105, new_save_4105, content)

old_cancel_4106 = r'<button class="btn" style="background: var\(--danger-color\); color: #fff; padding: 0\.1rem 0\.4rem; font-size: 12px; border-radius: 4px; border: none; cursor: pointer;" onclick="window\.toggleInlineAnaliz\(\)">İptal</button>'
new_cancel_4106 = r'<button class="btn" style="background: var(--danger-color); color: #fff; padding: 2px 6px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; border-radius: 4px; border: none; cursor: pointer;" onclick="window.toggleInlineAnaliz()">İptal</button>'
content = re.sub(old_cancel_4106, new_cancel_4106, content)


with open('js/app_v49.js', 'w', encoding='utf-8') as f:
    f.write(content)
