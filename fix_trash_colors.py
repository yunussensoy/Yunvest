import os

files = ['js/app_v49.js', 'www/js/app_v49.js', 'js/app_v50.js', 'www/js/app_v50.js', 'index.html', 'www/index.html']

for f in files:
    try:
        if not os.path.exists(f): continue
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # We need to find all occurrences of trash icons with --danger-color or #000000 and change to #888888 and transparent.
        import re
        # Pattern for danger buttons
        content = re.sub(r'color:\s*var\(--danger-color\)([^\>]*?fa-trash-alt)', r'color: var(--text-secondary)\1', content)
        content = re.sub(r'color:\s*#e74c3c([^\>]*?fa-trash-alt)', r'color: var(--text-secondary)\1', content)
        content = re.sub(r'color:\s*red([^\>]*?fa-trash-alt)', r'color: var(--text-secondary)\1', content)
        
        # also the style attribute in fa-trash itself
        content = re.sub(r'<i class="fas fa-trash-alt"[^>]*?color:\s*var\(--danger-color\)[^>]*?>', lambda m: m.group(0).replace('var(--danger-color)', 'var(--text-secondary)'), content)
        content = re.sub(r'<i class="fas fa-trash-alt"[^>]*?color:\s*#e74c3c[^>]*?>', lambda m: m.group(0).replace('#e74c3c', 'var(--text-secondary)'), content)
        
        # Some are just color: #888888, let's change to var(--text-secondary)
        content = re.sub(r'<i class="fas fa-trash-alt"[^>]*?color:\s*#888888[^>]*?>', lambda m: m.group(0).replace('#888888', 'var(--text-secondary)'), content)

        # specifically for the takip list modal
        old_takip_trash = '<i class="fas fa-trash-alt" style="cursor: pointer; color: #888888; font-size: 12px; padding: 4px;" onclick="window.removeHisseFromTakipModal('
        new_takip_trash = '<i class="fas fa-trash-alt" style="cursor: pointer; color: var(--text-secondary); font-size: 13px; padding: 4px;" onclick="window.removeHisseFromTakipModal('
        content = content.replace(old_takip_trash, new_takip_trash)

        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f'Processed {f}')
    except Exception as e:
        print(f'Failed {f}: {e}')
