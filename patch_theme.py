import os

css_path = r"e:\Yunvest\css\styles.css"
js_path = r"e:\Yunvest\js\app_v48.js"

# 1. Update CSS
with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

root_vars = """:root {
    --bg-color: #0b0c10;
    --bg-gradient: linear-gradient(135deg, #13151a 0%, #0b0c10 100%);
    --surface-color: rgba(31, 33, 40, 0.6);
    --surface-border: rgba(255, 255, 255, 0.08);
    --table-border: rgba(255, 255, 255, 0.03);
    --text-primary: #f0f2f5;
    --text-secondary: #a0aab2;
    --accent-color: #4facfe;
    --accent-glow: rgba(79, 172, 254, 0.4);
    --success-color: #00e676;
    --danger-color: #ff1744;
    --font-family: 'Inter', sans-serif;
    --border-radius: 12px;
    --transition: all 0.3s ease;
    
    --table-header-bg: rgba(0, 0, 0, 0.2);
    --table-row-bg: rgba(255, 255, 255, 0.02);
    --table-row-hover-bg: rgba(255, 255, 255, 0.05);
    --total-row-bg: rgba(0, 0, 0, 0.3);
    --input-bg: rgba(0, 0, 0, 0.2);
    --dropdown-bg: #333333;
    --overlay-bg: rgba(255, 255, 255, 0.05);
    --overlay-hover: rgba(255, 255, 255, 0.1);
    --btn-text: #fff;
    --text-muted: #cccccc;
    --nav-dropdown-bg: #333333;
    --bottom-nav-bg: rgba(15, 17, 22, 0.95);
}"""

light_vars = """[data-theme="light"] {
    --bg-color: #f0f2f5;
    --bg-gradient: linear-gradient(135deg, #e0e5ec 0%, #f0f2f5 100%);
    --surface-color: rgba(255, 255, 255, 0.7);
    --surface-border: rgba(0, 0, 0, 0.1);
    --table-border: rgba(0, 0, 0, 0.05);
    --text-primary: #1f2128;
    --text-secondary: #5c677d;
    --accent-color: #2196f3;
    --accent-glow: rgba(33, 150, 243, 0.4);
    --success-color: #00c853;
    --danger-color: #d50000;
    
    --table-header-bg: rgba(0, 0, 0, 0.05);
    --table-row-bg: rgba(0, 0, 0, 0.01);
    --table-row-hover-bg: rgba(0, 0, 0, 0.04);
    --total-row-bg: rgba(0, 0, 0, 0.08);
    --input-bg: rgba(255, 255, 255, 0.6);
    --dropdown-bg: #ffffff;
    --overlay-bg: rgba(0, 0, 0, 0.05);
    --overlay-hover: rgba(0, 0, 0, 0.08);
    --btn-text: #fff;
    --text-muted: #5c677d;
    --nav-dropdown-bg: #ffffff;
    --bottom-nav-bg: rgba(255, 255, 255, 0.95);
}"""

# Replace root variables
css_content = css_content.replace(css_content.split("}")[0] + "}", root_vars, 1)

# Replace light theme variables
start_idx = css_content.find('[data-theme="light"]')
end_idx = css_content.find('}', start_idx) + 1
css_content = css_content[:start_idx] + light_vars + css_content[end_idx:]

# Perform CSS replacements
css_replacements = [
    ("color: #ffffff", "color: var(--text-primary)"),
    ("color: #fff", "color: var(--btn-text)"),
    ("color: #cccccc", "color: var(--text-muted)"),
    ("color: #ccc;", "color: var(--text-muted);"),
    ("background: rgba(0, 0, 0, 0.2)", "background: var(--table-header-bg)"),
    ("background: rgba(0, 0, 0, 0.3)", "background: var(--total-row-bg)"),
    ("background: rgba(255, 255, 255, 0.02)", "background: var(--table-row-bg)"),
    ("background: rgba(255, 255, 255, 0.05)", "background: var(--overlay-bg)"),
    ("background: rgba(255, 255, 255, 0.1)", "background: var(--overlay-hover)"),
    ("background: rgba(255,255,255,0.1)", "background: var(--overlay-hover)"),
    ("border: 1px solid rgba(255,255,255,0.05)", "border: 1px solid var(--surface-border)"),
    ("background: rgba(255,255,255,0.03)", "background: var(--overlay-bg)"),
    ("background: var(--bg-dark)", "background: var(--surface-color)"),
    ("background-color: #333333", "background-color: var(--nav-dropdown-bg)"),
    ("background-color: #1f2128", "background-color: var(--dropdown-bg)"),
    ("background: rgba(15, 17, 22, 0.95)", "background: var(--bottom-nav-bg)"),
    ("border-bottom: 1px solid rgba(255, 255, 255, 0.05)", "border-bottom: 1px solid var(--table-border)"),
    ("border-bottom: 1px solid rgba(255,255,255,0.03)", "border-bottom: 1px solid var(--table-border)"),
    ("border-bottom: 1px solid rgba(255,255,255,0.05)", "border-bottom: 1px solid var(--table-border)"),
    ("border: 1px solid rgba(255,255,255,0.1)", "border: 1px solid var(--surface-border)"),
    ("background: rgba(255, 255, 255, 0.2)", "background: var(--surface-border)"),
    ("background: rgba(255, 255, 255, 0.4)", "background: var(--surface-border)")
]

for old, new in css_replacements:
    css_content = css_content.replace(old, new)

with open(css_path, "w", encoding="utf-8") as f:
    f.write(css_content)

# 2. Update JS inline styles
with open(js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

js_replacements = [
    ("color:#fff", "color:var(--text-primary)"),
    ("color: #fff", "color: var(--text-primary)"),
    ("color:white", "color:var(--text-primary)"),
    ("color: white", "color: var(--text-primary)"),
    ("background:rgba(255,255,255,0.1)", "background:var(--input-bg)"),
    ("background: rgba(255,255,255,0.1)", "background: var(--input-bg)"),
    ("background:rgba(0,0,0,0.2)", "background:var(--table-header-bg)"),
    ("background: rgba(0,0,0,0.2)", "background: var(--table-header-bg)"),
    ("border-bottom: 1px solid rgba(255,255,255,0.05)", "border-bottom: 1px solid var(--table-border)"),
    ("border-bottom:1px solid rgba(255,255,255,0.05)", "border-bottom:1px solid var(--table-border)"),
    ("border-bottom:1px solid rgba(255,255,255,0.1)", "border-bottom:1px solid var(--table-border)"),
    ("border:1px solid rgba(255,255,255,0.2)", "border:1px solid var(--surface-border)"),
    ("border-bottom: 1px solid rgba(255,255,255,0.1)", "border-bottom: 1px solid var(--table-border)"),
    ("background: rgba(255,255,255,0.05)", "background: var(--overlay-bg)"),
    ("background:rgba(255,255,255,0.05)", "background:var(--overlay-bg)"),
    ("background: rgba(0,0,0,0.1)", "background: var(--overlay-bg)"),
    ("color: rgba(255,255,255,0.5)", "color: var(--text-secondary)"),
    ("grid: { color: 'rgba(255,255,255,0.05)' }", "grid: { color: 'var(--surface-border)' }"),
    ("background: rgba(15, 17, 22, 0.6)", "background: var(--surface-color)")
]

for old, new in js_replacements:
    js_content = js_content.replace(old, new)

with open(js_path, "w", encoding="utf-8") as f:
    f.write(js_content)

print("Theme patched successfully!")
