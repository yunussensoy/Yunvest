const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const html = fs.readFileSync('e:/Yunvest/index_updated.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });

dom.window.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, length: 0, key: () => null };
dom.window.db = { collection: () => ({ doc: () => ({ get: async () => ({ exists: true, data: () => ({}) }), set: async () => {}, onSnapshot: (cb) => { return ()=>{}; } }) }) };
dom.window.currentUser = {uid: '123'};
dom.window.firebase = { initializeApp: () => {}, firestore: () => dom.window.db, auth: () => ({ onAuthStateChanged: (cb) => cb(dom.window.currentUser) }) };

dom.window.addEventListener('error', (e) => {
    console.log('RUNTIME ERROR:', e.message, e.filename, e.lineno);
});

try {
    let code = fs.readFileSync('e:/Yunvest/js/app_v45.js', 'utf8');
    // Replace const State with window.State so we can mock it
    code = code.replace('const State = {', 'window.State = {');
    const script = dom.window.document.createElement('script');
    script.textContent = code;
    dom.window.document.body.appendChild(script);
    
    dom.window.State.data = {
        hisseFiyatlari: [], ekstre: [], nakitHareketleri: [], takipListesi: [], hedefler: {}, genelNotlar: []
    };
    dom.window.State.getFiyat = () => 10;
    dom.window.stockData = {}; 
    
    setTimeout(() => {
        try {
            console.log('Testing goToHisse("THYAO")...');
            dom.window.goToHisse("THYAO");
            if (dom.window.document.getElementById('main-content').innerHTML.trim() === '') {
                console.log('MAIN CONTENT IS EMPTY AFTER goToHisse!');
            } else {
                console.log('MAIN CONTENT IS POPULATED AFTER goToHisse!');
            }
        } catch(e) {
            console.error('goToHisse EXECUTION ERROR', e);
        }
    }, 500);
} catch(e) {
    console.error('EVAL ERROR', e);
}
