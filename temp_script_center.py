import sys
import re

with open('js/app_v49.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Lines 2882/2883 (Big inline form)
old_save_2882 = r'<button class="btn" style="background: var\(--success-color\); color: var\(--btn-text\); padding: 2px 6px; height: 26px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; border-radius: 4px; border: none; cursor: pointer;" onclick="window\.addAnaliz\(\)"><i class="fas fa-save" style="margin-right: 4px;"></i> Kaydet</button>'
new_save_2882 = r'<button class="btn" style="background: var(--success-color); color: var(--btn-text); padding: 2px 6px 2px 4px; height: 26px; display: inline-flex; gap: 4px; align-items: center; justify-content: center; font-size: 12px; border-radius: 4px; border: none; cursor: pointer;" onclick="window.addAnaliz()"><i class="fas fa-save"></i> Kaydet</button>'
content = re.sub(old_save_2882, new_save_2882, content)


# Lines 4105/4106 (Small inline form)
old_save_4105 = r'<button class="btn" style="background: var\(--success-color\); color: var\(--btn-text\); padding: 2px 6px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; border-radius: 4px; border: none; cursor: pointer;" onclick="window\.addAnaliz\(\)"><i class="fas fa-save" style="margin-right: 4px;"></i> Kaydet</button>'
new_save_4105 = r'<button class="btn" style="background: var(--success-color); color: var(--btn-text); padding: 2px 6px 2px 4px; height: 24px; display: inline-flex; gap: 4px; align-items: center; justify-content: center; font-size: 11px; border-radius: 4px; border: none; cursor: pointer;" onclick="window.addAnaliz()"><i class="fas fa-save"></i> Kaydet</button>'
content = re.sub(old_save_4105, new_save_4105, content)


with open('js/app_v49.js', 'w', encoding='utf-8') as f:
    f.write(content)
