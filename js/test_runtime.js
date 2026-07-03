const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const html = fs.readFileSync('e:/Yunvest/index_updated.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
dom.window.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    length: 0,
    key: () => null
};
dom.window.db = { collection: () => ({ doc: () => ({ get: async () => ({ exists: true, data: () => ({}) }), set: async () => {} }) }) };
dom.window.currentUser = {uid: '123'};

dom.window.addEventListener('error', (e) => {
    console.log('RUNTIME ERROR:', e.message, e.filename, e.lineno);
});

try {
    const code = fs.readFileSync('e:/Yunvest/js/app_v45.js', 'utf8');
    const script = dom.window.document.createElement('script');
    script.textContent = code;
    dom.window.document.body.appendChild(script);
    
    setTimeout(() => {
        if (dom.window.document.getElementById('main-content').innerHTML.trim() === '') {
            console.log('MAIN CONTENT IS EMPTY!');
        } else {
            console.log('MAIN CONTENT IS POPULATED!');
        }
    }, 1000);
} catch(e) {
    console.error('EVAL ERROR', e);
}
