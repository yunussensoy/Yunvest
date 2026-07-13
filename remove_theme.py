import re

css_path = r"e:\Yunvest\css\styles.css"
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

# Remove the light theme block entirely
css_content = re.sub(r'\[data-theme="light"\]\s*\{[^}]*\}', '', css_content, flags=re.DOTALL)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)

html_path = r"e:\Yunvest\index.html"
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

# The wrapper has a button and a submenu div. So it's <div class="theme-menu-wrapper" ...> ... <button> ... <div class="theme-submenu"> ... </div> ... </div>
# Safest is to find the exact start and find its corresponding end manually or with a strict regex.
pattern = r'<div class="theme-menu-wrapper".*?<div class="theme-submenu.*?</div>\s*</div>'
html_content = re.sub(pattern, '', html_content, flags=re.DOTALL)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Light theme UI and CSS removed successfully!")
