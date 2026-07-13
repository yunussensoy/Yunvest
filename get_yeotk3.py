import json, re

f = open('e:/Yunvest/js/stock_data_compiled.js', 'r', encoding='utf-8')
c = f.read()
idx = c.find('"YEOTK": {')
if idx == -1:
    print("YEOTK not found")
else:
    s = c[idx:idx+150000] # just grab a chunk

    odenmis = re.search(r'"Ödenmiş Sermaye",\s*\n\s*"([\d\.,\-]+)"', s)
    print("Odenmis:", odenmis.group(1) if odenmis else "None")

    fborc1 = re.search(r'"Kısa Vadeli Borçlanmalar",\s*\n\s*"([\d\.,\-]+)"', s)
    fborc2 = re.search(r'"Uzun Vadeli Borçlanmaların Kısa Vadeli Kısımları",\s*\n\s*"([\d\.,\-]+)"', s)
    fborc3 = re.search(r'"Uzun Vadeli Borçlanmalar",\s*\n\s*"([\d\.,\-]+)"', s)
    nakit = re.search(r'"Nakit ve Nakit Benzerleri",\s*\n\s*"([\d\.,\-]+)"', s)
    finyat = re.search(r'"Finansal Yatırımlar",\s*\n\s*"([\d\.,\-]+)"', s)

    print("Kisa Borc:", fborc1.group(1) if fborc1 else "0")
    print("Kisa2 Borc:", fborc2.group(1) if fborc2 else "0")
    print("Uzun Borc:", fborc3.group(1) if fborc3 else "0")
    print("Nakit:", nakit.group(1) if nakit else "0")
    print("FinYat:", finyat.group(1) if finyat else "0")
