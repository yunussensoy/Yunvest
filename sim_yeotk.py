import os, json, re

c = open('e:/Yunvest/js/stock_data_compiled.js', 'r', encoding='utf-8').read()
idx = c.find('"YEOTK": {')
s = c[idx:idx+150000]

def extract_val(pattern):
    m = re.search(pattern, s)
    if m:
        v = m.group(1).replace('.', '').replace(',', '.')
        return float(v) if v and v != '-' else 0
    return 0

osermaye = extract_val(r'"Ödenmiş Sermaye",\s*\n\s*"([\d\.,\-]+)"')
fborc1 = extract_val(r'"Kısa Vadeli Borçlanmalar",\s*\n\s*"([\d\.,\-]+)"')
fborc2 = extract_val(r'"Uzun Vadeli Borçlanmaların Kısa Vadeli Kısımları",\s*\n\s*"([\d\.,\-]+)"')
fborc3 = extract_val(r'"Uzun Vadeli Borçlanmalar",\s*\n\s*"([\d\.,\-]+)"')
nakit = extract_val(r'"Nakit ve Nakit Benzerleri",\s*\n\s*"([\d\.,\-]+)"')
finyat = extract_val(r'"Finansal Yatırımlar",\s*\n\s*"([\d\.,\-]+)"')

fin_borc = fborc1 + fborc2 + fborc3
net_borc = fin_borc - nakit - finyat

print(f"Odenmis Sermaye: {osermaye}")
print(f"Finansal Borclar: {fin_borc}")
print(f"Nakit: {nakit}")
print(f"Finansal Yatirimlar: {finyat}")
print(f"Net Borc: {net_borc}")

ciro_usd = 557000000
favok_marji = 16.7
fd_favok = 10
usd_kuru = 33

favok_usd = ciro_usd * (favok_marji / 100)
firm_value_usd = favok_usd * fd_favok

# OLD BUGGY METHOD
market_cap_old = firm_value_usd - net_borc
hedef_old = (market_cap_old / osermaye) if osermaye else 0
print(f"Old Buggy Hedef (no conversion, just TL subtracted from USD): {hedef_old}")

# NEW FIXED METHOD
net_borc_usd = net_borc / usd_kuru
market_cap_usd = firm_value_usd - net_borc_usd
hedef_new = (market_cap_usd * usd_kuru) / osermaye if osermaye else 0
print(f"New Fixed Hedef (net borc converted to USD): {hedef_new}")

# WHAT IF THE USER DID THIS IN EXCEL?
market_cap_tl_user = (firm_value_usd * usd_kuru) - net_borc
hedef_user = market_cap_tl_user / osermaye if osermaye else 0
print(f"Target if FirmValue in USD is converted to TL first: {hedef_user}")

