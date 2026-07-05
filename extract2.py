import json
import re

found = False
with open('C:/Users/YUNUS/.gemini/antigravity-ide/brain/0c89ead6-7e8f-46ab-bce6-477f7b2f24b3/.system_generated/logs/transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'TOOL_RESULTS':
                for tr in data.get('tool_results', []):
                    out_str = tr.get('output', '')
                    if 'Showing lines 1 to 589' in out_str and '<!DOCTYPE html>' in out_str:
                        # Process out_str
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
                        found = True
                        break
            if found:
                break
        except Exception as e:
            pass
