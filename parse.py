with open('index_raw.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# text literally contains string "\r\n"
lines = text.split('\\r\\n')

out_lines = []
for line in lines:
    import re
    m = re.match(r'^\\d+:\\s(.*)$', line)
    if m:
        out_lines.append(m.group(1).replace('\\"', '"'))
    elif re.match(r'^\\d+:$', line):
        out_lines.append('')
    else:
        out_lines.append(line.replace('\\"', '"'))

with open('index_original.html', 'w', encoding='utf-8') as f:
    f.write('\\n'.join(out_lines))
print(f"Wrote {len(out_lines)} lines to index_original.html")
