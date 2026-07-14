import sys
import re

with open('js/app_v49.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Restore Big inline form buttons (Lines 2882/2883)
old_save_2882 = r'<button style="background: var\(--success-color\); color: var\(--btn-text\); padding: 2px 6px !important; height: 26px !important; width: fit-content !important; min-width: 0 !important; display: inline-flex; gap: 4px; align-items: center; justify-content: center; font-size: 12px; border-radius: 4px; border: none; cursor: pointer; box-sizing: border-box !important;" onclick="window\.addAnaliz\(\)"><i class="fas fa-save"></i> Kaydet</button>'
new_save_2882 = r'<button class="btn" style="background: var(--success-color); color: var(--btn-text); padding: 4px 8px !important; font-size: 13px !important; min-width: 0 !important; width: fit-content !important; border-radius: 4px; border: none; cursor: pointer; box-sizing: border-box !important;" onclick="window.addAnaliz()">Kaydet</button>'
content = re.sub(old_save_2882, new_save_2882, content)

old_cancel_2883 = r'<button style="background: var\(--danger-color\); color: #fff; padding: 2px 6px !important; height: 26px !important; width: fit-content !important; min-width: 0 !important; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; border-radius: 4px; border: none; cursor: pointer; box-sizing: border-box !important;" onclick="window\.toggleInlineAnaliz\(\)">İptal</button>'
new_cancel_2883 = r'<button class="btn" style="background: var(--danger-color); color: #fff; padding: 4px 8px !important; font-size: 13px !important; min-width: 0 !important; width: fit-content !important; border-radius: 4px; border: none; cursor: pointer; box-sizing: border-box !important;" onclick="window.toggleInlineAnaliz()">İptal</button>'
content = re.sub(old_cancel_2883, new_cancel_2883, content)


# Restore Small inline form buttons (Lines 4105/4106)
old_save_4105 = r'<button style="background: var\(--success-color\); color: var\(--btn-text\); padding: 2px 6px !important; height: 24px !important; width: fit-content !important; min-width: 0 !important; display: inline-flex; gap: 4px; align-items: center; justify-content: center; font-size: 11px; border-radius: 4px; border: none; cursor: pointer; box-sizing: border-box !important;" onclick="window\.addAnaliz\(\)"><i class="fas fa-save"></i> Kaydet</button>'
new_save_4105 = r'<button class="btn" style="background: var(--success-color); color: var(--btn-text); padding: 2px 6px !important; font-size: 12px !important; min-width: 0 !important; width: fit-content !important; border-radius: 4px; border: none; cursor: pointer; box-sizing: border-box !important;" onclick="window.addAnaliz()">Kaydet</button>'
content = re.sub(old_save_4105, new_save_4105, content)

old_cancel_4106 = r'<button style="background: var\(--danger-color\); color: #fff; padding: 2px 6px !important; height: 24px !important; width: fit-content !important; min-width: 0 !important; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; border-radius: 4px; border: none; cursor: pointer; box-sizing: border-box !important;" onclick="window\.toggleInlineAnaliz\(\)">İptal</button>'
new_cancel_4106 = r'<button class="btn" style="background: var(--danger-color); color: #fff; padding: 2px 6px !important; font-size: 12px !important; min-width: 0 !important; width: fit-content !important; border-radius: 4px; border: none; cursor: pointer; box-sizing: border-box !important;" onclick="window.toggleInlineAnaliz()">İptal</button>'
content = re.sub(old_cancel_4106, new_cancel_4106, content)


with open('js/app_v49.js', 'w', encoding='utf-8') as f:
    f.write(content)
