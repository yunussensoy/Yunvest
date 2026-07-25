import sys

file_path = r'e:\Yunvest\yunvest\www\js\app_v49.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# YouTube fix
old_youtube = """                                    if (a.baglanti.includes('youtube.com') || a.baglanti.includes('youtu.be')) { text = a.baslik || 'YouTube Linki'; icon = 'fas fa-play" style="color:#fff; background:#FF0000; display:inline-flex; justify-content:center; align-items:center; width:16px; height:11px; border-radius:3px; border:1px solid #000; font-size:6px; padding-left:1px; margin-right:1px;'; }
                                    else if (a.baglanti.includes('twitter.com') || a.baglanti.includes('x.com')) { text = a.baslik || 'X Linki'; icon = 'fa-brands fa-x-twitter" style="color: var(--text-primary); font-size: 11px;'; }
                                    linkHtml = `<a href="${a.baglanti}" target="_blank" style="color: var(--accent-color); text-decoration: none; word-break: break-word;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'"><i class="${icon}"></i> ${text}</a>`;"""

new_youtube = """                                    if (a.baglanti.includes('youtube.com') || a.baglanti.includes('youtu.be')) { text = a.baslik || 'YouTube Linki'; icon = 'fas fa-play" style="color:#fff; background:#FF0000; display:flex; justify-content:center; align-items:center; width:16px; height:11px; border-radius:3px; border:1px solid #000; font-size:6px; flex-shrink:0; margin-top:3px;'; }
                                    else if (a.baglanti.includes('twitter.com') || a.baglanti.includes('x.com')) { text = a.baslik || 'X Linki'; icon = 'fa-brands fa-x-twitter" style="color: var(--text-primary); font-size: 12px; flex-shrink:0; margin-top:2px;'; }
                                    linkHtml = `<a href="${a.baglanti}" target="_blank" style="color: var(--accent-color); text-decoration: none; word-break: break-word; display: flex; align-items: flex-start; gap: 5px;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'"><i class="${icon}"></i> <span style="line-height: 1.3;">${text}</span></a>`;"""

content = content.replace(old_youtube, new_youtube)

# Layout fix
old_layout = """            stockHeaderHtml = `
            <div id="hisse-header-border" class="glass" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; border-radius: 12px; border-left: 5px solid ${hColor}; margin: 0 1rem 0 1rem; flex-shrink: 0;">
                <div>
                    <h1 style="margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: 1px; color: var(--text-primary);">${selectedHisse}</h1>
                </div>
                <div style="display: flex; align-items: baseline; gap: 0.8rem;">
                    <div style="font-size: 1.2rem; font-weight: bold; color: var(--text-primary);">${new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(hFiyat)} ₺</div>
                    <div id="hisse-header-change" style="font-size: 0.9rem; font-weight: 600; color: ${hColor}; display: block;">
                        <i class="fas fa-caret-${isPos ? 'up' : 'down'}"></i> %${initChangeStr}
                    </div>
                </div>
            </div>
            `;
        }

        container.innerHTML = `
            ${stockHeaderHtml}
            <div style="display: flex; gap: 0.5rem; padding: 0.5rem 1rem; border-bottom: 1px solid var(--table-border); flex-wrap: wrap; align-items: center; background: var(--overlay-bg);">
                ${tabsHtml}
            </div>
            <div class="page-section active" style="display: flex; flex-direction: column; gap: 1rem; padding: 0 1rem; padding-top: 0.5rem; flex: 1; overflow-y: auto;">
                ${contentHtml}
            </div>"""

new_layout = """            stockHeaderHtml = `
            <div id="hisse-header-border" class="glass" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-radius: 0; border-left: 5px solid ${hColor}; margin: 0; flex-shrink: 0;">
                <div>
                    <h1 style="margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: 1px; color: var(--text-primary);">${selectedHisse}</h1>
                </div>
                <div style="display: flex; align-items: baseline; gap: 0.8rem;">
                    <div style="font-size: 1.2rem; font-weight: bold; color: var(--text-primary);">${new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(hFiyat)} ₺</div>
                    <div id="hisse-header-change" style="font-size: 0.9rem; font-weight: 600; color: ${hColor}; display: block;">
                        <i class="fas fa-caret-${isPos ? 'up' : 'down'}"></i> %${initChangeStr}
                    </div>
                </div>
            </div>
            `;
        }

        container.innerHTML = `
            ${stockHeaderHtml}
            <div style="display: flex; gap: 0.5rem; padding: 0.5rem 1rem; border-bottom: 1px solid var(--table-border); flex-wrap: wrap; align-items: center; background: var(--overlay-bg);">
                ${tabsHtml}
            </div>
            <div class="page-section active" style="display: flex; flex-direction: column; gap: 1rem; padding: 0.5rem 0 1rem 0; flex: 1; overflow-y: auto;">
                ${contentHtml}
            </div>"""

content = content.replace(old_layout, new_layout)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
