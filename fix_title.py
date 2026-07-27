import os

files = ['js/app_v50.js', 'www/js/app_v50.js', 'js/app_v49.js', 'www/js/app_v49.js']
old_str = """<div class="table-header" style="font-size:15px; display:flex; align-items:center; font-weight: 700; color: #ffffff !important; justify-content: space-between; width: 100%;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">Takip Listesi</div>
                    <span id="takip-edit-btn" class="fas fa-pen" style="color: var(--text-secondary); cursor: pointer; font-size: 13px; margin-left: auto; padding: 4px;" onclick="window.toggleTakipEditModal(event)"></span>
                </div>"""

new_str = """<div class="table-header" style="position: relative; font-size:15px; display:flex; align-items:center; font-weight: 700; color: #ffffff !important; justify-content: center; width: 100%;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">Takip Listesi</div>
                    <span id="takip-edit-btn" class="fas fa-pen" style="position: absolute; right: 0; color: var(--text-secondary); cursor: pointer; font-size: 13px; padding: 4px;" onclick="window.toggleTakipEditModal(event)"></span>
                </div>"""

for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # normalize newlines for replacement
        if old_str in content:
            content = content.replace(old_str, new_str)
            print(f'Replaced exactly in {f}')
        else:
            old_str_crlf = old_str.replace('\n', '\r\n')
            new_str_crlf = new_str.replace('\n', '\r\n')
            if old_str_crlf in content:
                content = content.replace(old_str_crlf, new_str_crlf)
                print(f'Replaced CRLF in {f}')
            else:
                print(f'Not found in {f}')
                
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
            
    except Exception as e:
        print(f'Failed {f}: {e}')
