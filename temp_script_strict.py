import sys
import re

with open('js/app_v48.js', 'r', encoding='utf-8') as f:
    content = f.read()

style_24 = 'width: 24px !important; height: 24px !important; max-width: 24px !important; max-height: 24px !important; min-width: 24px !important; min-height: 24px !important; padding: 0 !important; margin: 0 !important; display: flex; align-items: center; justify-content: center; border-radius: 4px; cursor: pointer; box-sizing: border-box !important; line-height: 1 !important;'

content = re.sub(r'style=\"width: 24px; height: 24px; background: #000000;[^\"]+\"', f'style="background: #000000; {style_24}"', content)
content = re.sub(r'style=\"width: 24px; height: 24px; background: var\(--danger-color\);[^\"]+\"', f'style="background: var(--danger-color); {style_24}"', content)

style_22 = 'width: 22px !important; height: 22px !important; max-width: 22px !important; max-height: 22px !important; min-width: 22px !important; min-height: 22px !important; padding: 0 !important; margin: 0 !important; display: flex; align-items: center; justify-content: center; border-radius: 4px; cursor: pointer; box-sizing: border-box !important; line-height: 1 !important;'

content = re.sub(r'style=\"width: 22px; height: 22px; background: #000000;[^\"]+\"', f'style="background: #000000; {style_22}"', content)
content = re.sub(r'style=\"width: 22px; height: 22px; background: var\(--danger-color\);[^\"]+\"', f'style="background: var(--danger-color); {style_22}"', content)

with open('js/app_v48.js', 'w', encoding='utf-8') as f:
    f.write(content)
