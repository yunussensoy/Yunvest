import os

index_path = r"e:\Yunvest\index.html"

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    ("color: #fff;", "color: var(--btn-text);"),
    ("color: #ffffff;", "color: var(--btn-text);"),
    ("color:#fff;", "color:var(--btn-text);"),
    ("rgba(255,255,255,0.05)", "var(--surface-border)"),
    ("rgba(255, 255, 255, 0.05)", "var(--surface-border)"),
    ("rgba(255,255,255,0.1)", "var(--overlay-bg)"),
    ("rgba(255, 255, 255, 0.1)", "var(--overlay-bg)"),
    ("rgba(255,255,255,0.02)", "var(--table-row-bg)"),
    ("rgba(255, 255, 255, 0.02)", "var(--table-row-bg)")
]

for old, new in replacements:
    content = content.replace(old, new)

with open(index_path, "w", encoding="utf-8") as f:
    f.write(content)

print("index.html patched")
