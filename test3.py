import re

f = open('e:/Yunvest/js/stock_data_compiled.js', 'r', encoding='utf-8')
c = f.read()
idx = c.find('"YEOTK": {')
s = c[idx:idx+350000]
next_idx = s.find('},\n  "')
if next_idx != -1:
    s = s[:next_idx]

def extract_all(pattern):
    matches = re.finditer(pattern, s, re.IGNORECASE)
    total = 0
    for m in matches:
        v = m.group(1).replace('.', '').replace(',', '.')
        try:
            total += float(v)
        except:
            pass
    return total

finansal_borclar = extract_all(r'"\s*Finansal Borçlar\s*",\s*"([^"]+)"')
nakit = extract_all(r'"\s*Nakit ve Nakit Benzerleri\s*",\s*"([^"]+)"')
finyat = extract_all(r'"\s*Finansal Yatırımlar\s*",\s*"([^"]+)"')

net_borc_degerleme = finansal_borclar - nakit - finyat
print(f"Finansal Borclar: {finansal_borclar}")
print(f"Nakit: {nakit}")
print(f"FinYat: {finyat}")
print(f"Net Borc (Degerleme Logic): {net_borc_degerleme}")

firm_val = 557000000 * 0.167 * 10
print("Firm Val USD:", firm_val)

usd_kuru = 33
odenmis = 355000000

# NEW FIX (Converts NetBorc to USD)
net_borc_usd = net_borc_degerleme / usd_kuru
market_cap_usd = firm_val - net_borc_usd
target_new = (market_cap_usd / odenmis) * usd_kuru
print("Target New:", target_new)

# OLD BUGGY FIX (Subtracts TL from USD directly)
market_cap_old = firm_val - net_borc_degerleme
target_old = (market_cap_old / odenmis) * usd_kuru
print("Target Old:", target_old)

