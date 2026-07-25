import sys

file_paths = [r'e:\Yunvest\yunvest\www\index.html', r'e:\Yunvest\yunvest\index.html']

old_menu = '<button class="nav-btn" data-target="veriler"><i class="fas fa-database"></i> <span class="nav-text">Enflasyon</span></button>'
new_menu = '<button class="nav-btn" data-target="veriler"><i class="fas fa-chart-line"></i> <span class="nav-text">Enflasyon Verileri</span></button>'

for fp in file_paths:
    try:
        with open(fp, 'r', encoding='utf-8') as f:
            c = f.read()
        
        if old_menu in c:
            c = c.replace(old_menu, new_menu)
            with open(fp, 'w', encoding='utf-8') as f:
                f.write(c)
            print(f'Successfully updated {fp}')
        else:
            print(f'Could not find old_menu in {fp}')
    except Exception as e:
        print(f'Error updating {fp}: {e}')
