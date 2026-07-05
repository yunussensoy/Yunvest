with open('C:/Users/YUNUS/.gemini/antigravity-ide/brain/0c89ead6-7e8f-46ab-bce6-477f7b2f24b3/.system_generated/logs/transcript.jsonl', 'r', encoding='utf-8') as f:
    text = f.read()

import re
match = re.search(r'Showing lines 1 to 589.*?(1: <!DOCTYPE html>.*?)(?:The above content does NOT show|The above content shows the entire)', text, re.DOTALL)
if match:
    with open('index_raw.txt', 'w', encoding='utf-8') as f:
        f.write(match.group(1))
    print("Found via regex and wrote to index_raw.txt")
else:
    print("Not found via regex")
