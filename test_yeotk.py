import json, re

f = open('e:/Yunvest/js/stock_data_compiled.js', 'r', encoding='utf-8')
c = f.read()

# find YEOTK section
idx = c.find('"YEOTK": {')
if idx == -1:
    print("YEOTK not found")
else:
    s = c[idx:idx+350000] # just grab a large chunk
    # The end of YEOTK is before the next stock, e.g., "YYAPI":
    next_idx = s.find('},\n  "')
    if next_idx != -1:
        s = s[:next_idx]
    
    # Now parse values
    def get_val(name):
        # looks like: "    Ödenmiş Sermaye",\n      "355.000.000",
        # or maybe the value is on the same line? Fintables array format:
        # ["    Ödenmiş Sermaye", "355.000.000", ...]
        # Wait! It's a JSON array of arrays!
        pattern = r'"\s*' + name + r'\s*",\s*"([^"]+)"'
        m = re.search(pattern, s, re.IGNORECASE)
        if m:
            v = m.group(1).replace('.', '').replace(',', '.')
            try:
                return float(v)
            except:
                return 0
        return 0

    odenmis = get_val('Ödenmiş Sermaye')
    if odenmis == 0:
        odenmis = get_val('Sermaye')
    
    kisa = get_val('Kısa Vadeli Borçlanmalar')
    kisa2 = get_val('Uzun Vadeli Borçlanmaların Kısa Vadeli Kısımları')
    uzun = get_val('Uzun Vadeli Borçlanmalar')
    nakit = get_val('Nakit ve Nakit Benzerleri')
    finyat = get_val('Finansal Yatırımlar')

    print(f"Odenmis Sermaye: {odenmis}")
    print(f"Kisa Borc: {kisa}")
    print(f"Kisa2 Borc: {kisa2}")
    print(f"Uzun Borc: {uzun}")
    print(f"Nakit: {nakit}")
    print(f"FinYat: {finyat}")

    fin_borc = kisa + kisa2 + uzun
    net_borc = fin_borc - nakit - finyat
    print(f"Net Borc: {net_borc}")

    ciro = 557000000
    favok = ciro * 0.167
    firm_val = favok * 10
    
    # 67.70 in user's calculation
    # Let's find target price using new formula
    if odenmis > 0:
        # new formula:
        net_borc_usd = net_borc / 33
        mc_usd = firm_val - net_borc_usd
        target_new = (mc_usd / odenmis) * 33
        print(f"New formula (USD): {target_new}")
        
        # old buggy formula
        mc_old = firm_val - net_borc
        target_old = (mc_old / odenmis) * 33
        print(f"Old formula (TL subtracted from USD): {target_old}")
        
        # TL FIRST FORMULA (User's Excel probably does this)
        firm_val_tl = firm_val * 33
        mc_user = firm_val_tl - net_borc
        target_user = mc_user / odenmis
        print(f"Excel formula (TL): {target_user}")
