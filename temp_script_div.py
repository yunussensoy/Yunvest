import sys

with open('js/app_v48.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Lines 2882/2883
old2882 = """<button class="btn" style="padding: 2px; width: 24px; height: 24px; background: #000000; color: var(--success-color); display: flex; align-items: center; justify-content: center; border-radius: 4px; border: none;" onclick="window.addAnaliz()" title="Kaydet"><i class="fas fa-save" style="font-size: 14px; color: var(--success-color) !important;"></i></button>"""
new2882 = """<div style="width: 24px; height: 24px; background: #000000; display: flex; align-items: center; justify-content: center; border-radius: 4px; cursor: pointer;" onclick="window.addAnaliz()" title="Kaydet"><i class="fas fa-save" style="font-size: 13px; color: var(--success-color) !important;"></i></div>"""
content = content.replace(old2882, new2882)

old2883 = """<button class="btn" style="padding: 2px; width: 24px; height: 24px; background: var(--danger-color); color: #ffffff; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: none;" onclick="window.toggleInlineAnaliz()" title="İptal"><i class="fas fa-times" style="font-size: 13px; color: #ffffff !important;"></i></button>"""
new2883 = """<div style="width: 24px; height: 24px; background: var(--danger-color); display: flex; align-items: center; justify-content: center; border-radius: 4px; cursor: pointer;" onclick="window.toggleInlineAnaliz()" title="İptal"><i class="fas fa-times" style="font-size: 13px; color: #ffffff !important;"></i></div>"""
content = content.replace(old2883, new2883)

# Lines 4105/4106
old4105 = """<button class="btn btn-icon" style="padding: 2px; width: 22px; height: 22px; background: #000000; color: var(--success-color); display: flex; align-items: center; justify-content: center; border-radius: 4px;" onclick="window.addAnaliz()" title="Kaydet"><i class="fas fa-save" style="font-size: 12px; color: var(--success-color) !important;"></i></button>"""
new4105 = """<div style="width: 22px; height: 22px; background: #000000; display: flex; align-items: center; justify-content: center; border-radius: 4px; cursor: pointer;" onclick="window.addAnaliz()" title="Kaydet"><i class="fas fa-save" style="font-size: 12px; color: var(--success-color) !important;"></i></div>"""
content = content.replace(old4105, new4105)

old4106 = """<button class="btn btn-icon" style="padding: 2px; width: 22px; height: 22px; background: var(--danger-color); color: #ffffff; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: none;" onclick="window.toggleInlineAnaliz()" title="İptal"><i class="fas fa-times" style="font-size: 11px; color: #ffffff !important;"></i></button>"""
new4106 = """<div style="width: 22px; height: 22px; background: var(--danger-color); display: flex; align-items: center; justify-content: center; border-radius: 4px; cursor: pointer;" onclick="window.toggleInlineAnaliz()" title="İptal"><i class="fas fa-times" style="font-size: 12px; color: #ffffff !important;"></i></div>"""
content = content.replace(old4106, new4106)

with open('js/app_v48.js', 'w', encoding='utf-8') as f:
    f.write(content)
