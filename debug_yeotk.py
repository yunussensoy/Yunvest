import json

f = open('e:/Yunvest/js/stock_data_compiled.js', 'r', encoding='utf-8')
content = f.read()
start = content.find('window.stockData = ') + 19
content = content[start:]

# Remove the trailing semicolon or anything after it
if content.endswith(';'):
    content = content[:-1]

data = json.loads(content)
yeotk = data.get('YEOTK', {})
rows = yeotk.get('bilanco', {}).get('rows', [])

odenmis = 0
finBorc = 0
nakit = 0
finYat = 0

for r in rows:
    name = str(r[0]).lower() if r[0] else ''
    if not name: continue
    
    try:
        val = str(r[1]).replace('.', '').replace(',', '.')
        val = float(val) if val and val != '-' else 0
    except:
        val = 0
        
    if 'ödenmiş sermaye' in name:
        odenmis = val
    if 'finansal borçlar' in name and 'kısımlar' not in name.replace('ı', 'i'):
        finBorc += val
    if 'nakit ve nakit' in name:
        nakit += val
    if 'finansal yatırımlar' in name:
        finYat += val

print(f"Odenmis Sermaye: {odenmis}")
print(f"Finansal Borclar: {finBorc}")
print(f"Nakit: {nakit}")
print(f"Finansal Yatirimlar: {finYat}")
