import re
import sys

app_path = "e:/Yunvest/yunvest/www/js/app_v49.js"

with open(app_path, "r", encoding="windows-1254") as f:
    content = f.read()

bad_part = """        if (matches.length === 0) {
            list.style.display = 'none';
            return;
        }
        
            div.style.fontSize = '12px';"""

good_part = """        if (matches.length === 0) {
            list.style.display = 'none';
            return;
        }
        
        matches.slice(0, 10).forEach(hisse => {
            let div = document.createElement('div');
            div.innerHTML = `<strong style="color: var(--accent-color);">${hisse.substr(0, val.length)}</strong>${hisse.substr(val.length)}`;
            div.style.padding = '0.5rem 1rem';
            div.style.cursor = 'pointer';
            div.style.fontSize = '12px';"""

content = content.replace(bad_part, good_part)

onclick_bad = """            div.addEventListener('click', function(e) {
                input.value = hisse;
                list.style.display = 'none';
            });"""

onclick_good = """            div.addEventListener('click', function(e) {
                e.stopPropagation();
                input.value = hisse;
                list.style.display = 'none';
                window.addHisseToTakipFromModal();
            });"""
            
content = content.replace(onclick_bad, onclick_good)

with open(app_path, "w", encoding="windows-1254") as f:
    f.write(content)

with open("e:/Yunvest/yunvest/js/app_v49.js", "w", encoding="windows-1254") as f:
    f.write(content)

print("Fixed syntax in app_v49.js")
