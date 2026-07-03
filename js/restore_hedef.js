const fs = require('fs');
let txt = fs.readFileSync('e:/Yunvest/js/app_v45.js', 'utf8');

const brokenCode = `            alert('Parola başarıyla güncellendi!');
        const fmtPct = (val) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(val * 100) + '%';`;

const restoredCode = `            alert('Parola başarıyla güncellendi!');
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

txt = txt.replace(brokenCode, restoredCode);

fs.writeFileSync('e:/Yunvest/js/app_v45.js', txt, 'utf8');
console.log('Restored broken renderHedef code');
