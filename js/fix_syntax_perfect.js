const fs = require('fs');
let txt = fs.readFileSync('e:/Yunvest/js/app_v45.js', 'utf8');
let lines = txt.split('\\n'); // oops, wait, txt.split('\n')

// The broken lines to replace are from index 3335 to 3341 (inclusive)
// Wait, I should not use fixed line numbers because I might have off-by-one errors.

const insertBlock = `                <div style="height: 1px; background: var(--surface-border); margin: 2rem 0;"></div>

                <form id="password-form" style="display: flex; flex-direction: column; gap: 1rem;">
                    <h3 style="margin-bottom: 0.5rem; color: var(--text-primary); font-size: 1.1rem;">Parola Güncelleme</h3>
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.3rem; display: block;">Yeni Parola</label>
                        <input type="password" id="profile-new-password" class="form-control" required minlength="6">
                    </div>
                    <button type="submit" class="btn btn-danger" style="margin-top: 0.5rem;">Parolayı Güncelle</button>
                </form>
            </div>
        </div>
    \`;

    db.collection('users').doc(currentUser.uid).get().then(doc => {
        if(doc.exists && doc.data().phone) {
            document.getElementById('profile-phone').value = doc.data().phone;
        }
    });

    document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = document.getElementById('profile-name').value;
        const newPhone = document.getElementById('profile-phone').value;
        currentUser.updateProfile({ displayName: newName }).then(() => {
            const unEl = document.getElementById('user-name');
            if(unEl) unEl.innerText = newName;
            return db.collection('users').doc(currentUser.uid).set({ phone: newPhone, displayName: newName }, { merge: true });
        }).then(() => {
            alert('Profil güncellendi!');
        }).catch(err => alert(err.message));
    });

    document.getElementById('password-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newPass = document.getElementById('profile-new-password').value;
        currentUser.updatePassword(newPass).then(() => {
            alert('Parola başarıyla güncellendi!');
            document.getElementById('password-form').reset();
        }).catch(err => alert(err.message));
    });
};

const renderHedef = (container) => {
    if (window.recalculateHedefFiyatlar) window.recalculateHedefFiyatlar();
    let rowsHtml = '';
    
    if (State.data.hedefFiyatlar) {
        let sn = 1;
        const fmtDec = (val) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(val);`;

const brokenBlock = `
    });
    document.getElementById('password-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newPass = document.getElementById('profile-new-password').value;
        currentUser.updatePassword(newPass).then(() => {
            alert('Parola başarıyla güncellendi!');`;

txt = txt.replace(brokenBlock, '\\n' + insertBlock);

fs.writeFileSync('e:/Yunvest/js/app_v45.js', txt, 'utf8');
console.log('Fixed syntax and restored logic successfully.');
