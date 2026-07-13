import os

files_to_check = [
    r"e:\Yunvest\js\app_v48.js",
    r"e:\Yunvest\js\renderHisse.js"
]

for filepath in files_to_check:
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace var(--surface-border) in Chart.js options with rgba(128,128,128,0.2)
    # Chart.js can't render CSS variables natively in canvas for grid lines/ticks unless explicitly fetched.
    content = content.replace("color: 'var(--surface-border)'", "color: 'rgba(128,128,128,0.2)'")
    content = content.replace("color: 'var(--text-secondary)'", "color: 'rgba(128,128,128,0.8)'")
    content = content.replace("color: 'var(--text-primary)'", "color: 'rgba(128,128,128,0.9)'")
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print("Fixed grid colors")
