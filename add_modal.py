import re
import os

modal_html = """
    <!-- Takip Düzenle Modal -->
    <div id="takip-edit-modal" class="app-container" style="display: none; justify-content: center; align-items: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000;">
        <div class="glass" style="padding: 1.5rem; width: 400px; max-width: 90%; border-radius: var(--border-radius); position: relative; display: flex; flex-direction: column; gap: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
            <i class="fas fa-times" style="position: absolute; top: 1rem; right: 1rem; cursor: pointer; color: var(--text-secondary);" onclick="document.getElementById('takip-edit-modal').style.display='none'"></i>
            
            <h3 style="margin: 0; color: #ffffff; font-size: 16px;">Takip Listesi Düzenle</h3>
            
            <div style="position: relative; display: flex; gap: 0.5rem;">
                <input type="text" id="takip-edit-arama-input" class="modern-input" placeholder="Hisse ara (Örn: THYAO)..." style="flex: 1; font-size: 14px; text-transform: uppercase;">
                <button class="btn" style="padding: 0 1rem;" onclick="window.addHisseToTakipFromModal()"><i class="fas fa-plus"></i></button>
                <div id="takip-edit-autocomplete-list" style="display:none; position:absolute; top:100%; left:0; right:40px; background:var(--surface-color); border:1px solid var(--surface-border); border-top:none; z-index:1001; max-height:200px; overflow-y:auto; flex-direction:column; border-radius: 0 0 8px 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"></div>
            </div>

            <div id="takip-edit-list-container" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 300px; overflow-y: auto; padding-right: 5px; margin-top: 0.5rem;">
                <!-- Hisse listesi JS ile dolacak -->
            </div>
        </div>
    </div>
"""

files_to_modify = ["e:/Yunvest/yunvest/index.html", "e:/Yunvest/yunvest/www/index.html"]

for filepath in files_to_modify:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    if "takip-edit-modal" not in content:
        # Insert before </body>
        content = content.replace("</body>", modal_html + "\n</body>")
        
        # Also bump JS version to -18
        content = content.replace("v=20260727-17", "v=20260727-18")
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
            print(f"Added modal to {filepath}")
    else:
        print(f"Modal already in {filepath}")

