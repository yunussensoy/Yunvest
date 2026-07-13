import re

f = open('e:/Yunvest/js/stock_data_compiled.js', 'r', encoding='utf-8')
c = f.read()

idx = c.find('"YEOTK": {')
if idx != -1:
    s = c[idx:idx+150000]
    for line in s.split('\n'):
        if 'Ödenmiş Sermaye' in line or 'Sermaye' in line:
            print(line.strip())
        if 'Kısa Vadeli Borçlanmalar' in line:
            print(line.strip())
        if 'Uzun Vadeli Borçlanmalar' in line:
            print(line.strip())
        if 'Nakit ve Nakit Benzerleri' in line:
            print(line.strip())
