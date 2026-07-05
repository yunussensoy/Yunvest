import re
import json

with open('C:/Users/YUNUS/.gemini/antigravity-ide/brain/0c89ead6-7e8f-46ab-bce6-477f7b2f24b3/.system_generated/logs/transcript.jsonl', 'r', encoding='utf-8') as f:
    text = f.read()

# We need to find the raw string in the file and decode it.
# Actually, since it's jsonl, let's just parse each line and search its string representation.
for line in text.splitlines():
    if 'Showing lines 1 to 589' in line and '<!DOCTYPE html>' in line:
        data = json.loads(line)
        # Find the string inside the json object
        def find_output(obj):
            if isinstance(obj, dict):
                for k, v in obj.items():
                    if isinstance(v, str) and 'Showing lines 1 to 589' in v:
                        return v
                    res = find_output(v)
                    if res: return res
            elif isinstance(obj, list):
                for v in obj:
                    res = find_output(v)
                    if res: return res
            return None
        
        out_str = find_output(data)
        if out_str:
            lines = out_str.split('\n')
            out_lines = []
            started = False
            for ln in lines:
                if '1: <!DOCTYPE html>' in ln:
                    started = True
                if not started: continue
                if 'The above content does NOT show' in ln or 'The above content shows the entire' in ln:
                    break
                
                m = re.match(r'^\\d+:\\s(.*)$', ln)
                if m:
                    out_lines.append(m.group(1))
                elif re.match(r'^\\d+:$', ln):
                    out_lines.append('')
                else:
                    out_lines.append(ln)
            
            with open('index_original.html', 'w', encoding='utf-8') as outf:
                outf.write('\n'.join(out_lines))
            print(f"Recovered {len(out_lines)} lines to index_original.html")
            break
