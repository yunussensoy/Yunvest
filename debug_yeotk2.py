import os

content = open('e:/Yunvest/js/stock_data_compiled.js', 'r', encoding='utf-8').read()

yeotk_start = content.find('"YEOTK":')
if yeotk_start != -1:
    yeotk_end = content.find('}},', yeotk_start)
    if yeotk_end == -1:
        yeotk_end = content.find('}}}', yeotk_start)
    
    yeotk_str = content[yeotk_start:yeotk_end+5]
    print(yeotk_str[:500])
    
    import re
    # find odenmis sermaye
    match = re.search(r'"Ödenmiş Sermaye",\s*"([\d\.,]+)"', yeotk_str, re.IGNORECASE)
    if match: print("Odenmis Sermaye:", match.group(1))

    match = re.search(r'"Kısa Vadeli Borçlanmalar",\s*"([\d\.,\-]+)"', yeotk_str, re.IGNORECASE)
    if match: print("Kisa Borc:", match.group(1))

    match = re.search(r'"Uzun Vadeli Borçlanmaların Kısa Vadeli Kısımları",\s*"([\d\.,\-]+)"', yeotk_str, re.IGNORECASE)
    if match: print("Kisa2 Borc:", match.group(1))

    match = re.search(r'"Uzun Vadeli Borçlanmalar",\s*"([\d\.,\-]+)"', yeotk_str, re.IGNORECASE)
    if match: print("Uzun Borc:", match.group(1))

    match = re.search(r'"Nakit ve Nakit Benzerleri",\s*"([\d\.,\-]+)"', yeotk_str, re.IGNORECASE)
    if match: print("Nakit:", match.group(1))

    match = re.search(r'"Finansal Yatırımlar",\s*"([\d\.,\-]+)"', yeotk_str, re.IGNORECASE)
    if match: print("FinYat:", match.group(1))
