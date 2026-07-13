import re, json
import sys

def run():
    with open('e:/Yunvest/js/stock_data_compiled.js', 'r', encoding='utf-8') as f:
        text = f.read()
    
    # We find the YEOTK string
    idx = text.find('"YEOTK":{')
    if idx == -1:
        print("YEOTK not found")
        return
    
    # Extract just enough text to likely contain the whole object
    s = text[idx:idx+300000]
    
    # Simple brace counting to extract the JSON object
    brace_count = 0
    in_string = False
    escape = False
    start_idx = s.find('{')
    end_idx = -1
    
    for i in range(start_idx, len(s)):
        char = s[i]
        if escape:
            escape = False
            continue
        if char == '\\':
            escape = True
            continue
        if char == '"':
            in_string = not in_string
            continue
        
        if not in_string:
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0:
                    end_idx = i
                    break
                    
    if end_idx == -1:
        print("Could not parse object")
        return
        
    obj_str = s[start_idx:end_idx+1]
    
    try:
        data = json.loads(obj_str)
        rows = data.get('bilanco', {}).get('rows', [])
        fb = 0
        nakit = 0
        fy = 0
        
        for r in rows:
            if not r[0]: continue
            name = str(r[0]).lower()
            try:
                val_str = str(r[1]).replace('.', '').replace(',', '.')
                val = float(val_str) if r[1] and r[1] != '-' else 0
            except:
                val = 0
                
            if 'finansal bor' in name and 'kısım' not in name and 'ksmlar' not in name:
                fb += val
                print(f"FB: {name} -> {val}")
            if 'nakit ve nakit' in name:
                nakit += val
                print(f"Nakit: {name} -> {val}")
            if 'finansal yatırımlar' in name:
                fy += val
                print(f"FY: {name} -> {val}")
                
        print(f"Total FB: {fb}")
        print(f"Total Nakit: {nakit}")
        print(f"Total FY: {fy}")
        print(f"Net Borc: {fb - nakit - fy}")
        
    except Exception as e:
        print(f"Error parsing: {e}")

if __name__ == '__main__':
    run()
