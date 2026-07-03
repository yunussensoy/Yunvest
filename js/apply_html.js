const fs = require('fs');
const filePath = 'js/app_v45.js';
let code = fs.readFileSync(filePath, 'utf8');

const targetStr = `                    <button type="submit" class="btn btn-danger" style="margin-top: 0.5rem;">Parolayı Güncelle</button>
                </form>
            </div>
        </div>
    \`;`;

const replacement = `                    <button type="submit" class="btn btn-danger" style="margin-top: 0.5rem;">Parolayı Güncelle</button>
                </form>
                
                <div style="height: 1px; background: var(--surface-border); margin: 2rem 0;"></div>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <h3 style="margin-bottom: 0.5rem; color: var(--text-primary); font-size: 1.1rem;"><i class="fas fa-database"></i> Veri Yedekleme ve Kurtarma</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.4;">Tüm hisse notlarınızı, değerlemelerinizi ve portföy geçmişinizi güvence altına almak için verilerinizi bilgisayarınıza indirebilirsiniz.</p>
                    <button class="btn" style="background: #28a745; display: flex; align-items: center; justify-content: center; gap: 0.5rem;" onclick="window.downloadBackup()"><i class="fas fa-download"></i> Tüm Verilerimi İndir (.json)</button>
                    
                    <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.4; margin-top: 1rem;">Daha önce indirdiğiniz bir yedeği sisteme yükleyerek tüm verilerinizi eski haline getirebilirsiniz. (Dikkat: Mevcut verilerinizin üzerine yazılır)</p>
                    <input type="file" id="backup-file-upload" accept=".json" style="display: none;" onchange="window.restoreBackup(event)">
                    <button class="btn" style="background: #ffc107; color: #000; display: flex; align-items: center; justify-content: center; gap: 0.5rem;" onclick="document.getElementById('backup-file-upload').click()"><i class="fas fa-upload"></i> Yedekten Geri Yükle</button>
                </div>
            </div>
        </div>
    \`;`;

let idx = code.indexOf(targetStr);
if (idx !== -1) {
    code = code.replace(targetStr, replacement);
    fs.writeFileSync(filePath, code, 'utf8');
    console.log("Successfully added HTML UI!");
} else {
    console.log("HTML Target not found. Check whitespace.");
}
