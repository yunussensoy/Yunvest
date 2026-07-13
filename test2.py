import re

f = open('e:/Yunvest/js/stock_data_compiled.js', 'r', encoding='utf-8')
c = f.read()

idx = c.find('"YEOTK": {')
s = c[idx:idx+350000]
next_idx = s.find('},\n  "')
if next_idx != -1:
    s = s[:next_idx]

for line in s.split('\n'):
    if 'borc' in line.lower() or 'borç' in line.lower() or 'nakit' in line.lower() or 'sermaye' in line.lower() or 'finansal' in line.lower():
        print(line.strip())
