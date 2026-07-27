import os

files = ['js/app_v49.js', 'www/js/app_v49.js', 'js/app_v50.js', 'www/js/app_v50.js']

bad_ac = '''div.innerHTML = `<strong style="color: var(--text-secondary);">${hisse.substr(0, val.length)}</strong>${hisse.substr(val.length)}`;
            div.style.padding = '0.25rem 1rem';
            div.style.cursor = 'pointer';
            div.style.fontSize = '12px';
            div.style.color = 'var(--text-secondary)';'''

good_ac = '''div.innerHTML = `<strong style="color: #ffffff;">${hisse.substr(0, val.length)}</strong>${hisse.substr(val.length)}`;
            div.style.padding = '0.5rem 1rem';
            div.style.cursor = 'pointer';
            div.style.fontSize = '12px';
            div.style.color = 'var(--text-secondary)';'''

bad_list_item = '''          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.25rem; border-bottom: 1px solid var(--surface-border);">
              <span style="color: var(--text-primary); font-weight: 500; font-size: 12px;">${hisse}</span>'''

good_list_item = '''          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.15rem 0.25rem; border-bottom: 1px solid var(--surface-border);">
              <span style="color: var(--text-secondary); font-weight: 500; font-size: 12px;">${hisse}</span>'''

for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # 1. REVERT AUTOCOMPLETE
        if bad_ac in content:
            content = content.replace(bad_ac, good_ac)
        else:
            content = content.replace(bad_ac.replace('\n', '\r\n'), good_ac.replace('\n', '\r\n'))

        # 2. FIX TAKIP EDIT LIST
        if bad_list_item in content:
            content = content.replace(bad_list_item, good_list_item)
        else:
            content = content.replace(bad_list_item.replace('\n', '\r\n'), good_list_item.replace('\n', '\r\n'))
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f'Processed {f}')
    except Exception as e:
        print(f'Failed {f}: {e}')
