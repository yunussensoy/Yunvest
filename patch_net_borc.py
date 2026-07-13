import os

files_to_check = [
    r"e:\Yunvest\js\app_v48.js",
    r"e:\Yunvest\js\renderHisse.js"
]

target_block = """                        if (name === 'net borç' || name === 'net bor') {
                            const fBorc = getB('finansal borçlar');
                            const nakit = getB('nakit ve nakit');
                            return { v1: fBorc.v1 - nakit.v1, v2: fBorc.v2 - nakit.v2 };
                        }"""

replacement_block = """                        if (name === 'net borç' || name === 'net bor') {
                            const fBorc = getB('finansal borçlar');
                            const nakit = getB('nakit ve nakit');
                            const finYat = getB('finansal yatırımlar');
                            return { v1: fBorc.v1 - nakit.v1 - finYat.v1, v2: fBorc.v2 - nakit.v2 - finYat.v2 };
                        }"""

for filepath in files_to_check:
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace(target_block, replacement_block)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print("Net borc formulu guncellendi")
