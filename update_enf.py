import sys

file_paths = [r'e:\Yunvest\yunvest\www\js\app_v49.js', r'e:\Yunvest\yunvest\js\app_v49.js']

old_enf_html = """            <!-- Enflasyon -->
            <div class="glass" style="padding: 8px 1rem; margin-top: 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0;">
                    <div style="font-size: 14px; font-weight: bold; color: var(--text-primary); text-align: left;">Aylık Enflasyon Verileri</div>
                    <button class="btn" style="font-size: 12px; padding: 0.3rem 0.8rem; background: var(--warning-color); color: #fff;" onclick="window.toggleEnfForm()">+</button>
                </div>
                
                <div class="table-container" style="max-height: 400px; overflow-y: auto; margin-bottom: 0;">"""

new_enf_html = """            <!-- Enflasyon -->
            <div class="table-container glass" style="margin-bottom: 0;">
                <div class="table-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <span>Aylık Enflasyon Verileri</span>
                    <button class="btn btn-icon" style="color: var(--accent-color); font-size: 14px; padding: 4px;" onclick="window.toggleEnfForm()" title="Ekle"><i class="fas fa-plus"></i></button>
                </div>
                
                <div style="max-height: 400px; overflow-y: auto; margin-bottom: 0;">"""

for fp in file_paths:
    with open(fp, 'r', encoding='utf-8') as f:
        c = f.read()
    
    if old_enf_html in c:
        c = c.replace(old_enf_html, new_enf_html)
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f'Successfully updated {fp}')
    else:
        print(f'Could not find the target HTML in {fp}')
