const fs = require('fs');
const { JSDOM } = require('jsdom');
const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="main-content"></div><div id="theme-confirm-modal"></div></body></html>`, { runScripts: 'dangerously' });
global.window = dom.window;
global.document = dom.window.document;
dom.window.firebase = { 
    initializeApp: () => ({ 
        firestore: () => ({ 
            collection: () => ({ doc: () => ({ onSnapshot: () => {} }) }) 
        }) 
    }) 
};
window.State = {
    activeView: 'hisse',
    selectedHisse: 'THYAO',
    data: {
        analizler: [
            { id: 123456789, tarih: '2026-07-04', borsaci: 'Ali', hisse: 'THYAO', baglanti: 'https://youtube.com/a', notText: 'Test' }
        ],
        takipListesi: [],
        tickerData: []
    },
    getFiyat: ()=>10,
    save: ()=>{}
};
const script = fs.readFileSync('e:/Yunvest/js/app_v45.js', 'utf8');
dom.window.eval(script);
window.currentSelectedHisse = 'THYAO';
window.currentHisseTab = 'Hisse Notları';
window.renderHisseler(document.getElementById('main-content'));
console.log('Hisse Notlari render success?', document.getElementById('main-content').innerHTML.includes('İşlem'));
console.log('Includes S.N. center?', document.getElementById('main-content').innerHTML.includes('vertical-align:top; width:1%; white-space:nowrap;">1</td>'));
