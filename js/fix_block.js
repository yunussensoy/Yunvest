const fs = require('fs');
let txt = fs.readFileSync('e:/Yunvest/js/app_v45.js', 'utf8');

const badChunk = `    document.getElementById('password-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newPass = document.getElementById('profile-new-password').value;
        currentUser.updatePassword(newPass).then(() => {
            alert('Parola başarıyla güncellendi!');
        const fmtPct = (val) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(val * 100) + '%';`;

const goodChunk = `    document.getElementById('profile-form').addEventListener('submit', (e) => {
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
        const fmtDec = (val) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(val);
        const fmtPct = (val) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(val * 100) + '%';`;

txt = txt.replace(badChunk, goodChunk);
fs.writeFileSync('e:/Yunvest/js/app_v45.js', txt, 'utf8');
console.log('Fixed block');
