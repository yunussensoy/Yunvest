const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8'); 
const dom = new JSDOM(html, { runScripts: "outside-only" });

dom.window.firebase = {
    initializeApp: () => {},
    auth: () => ({
        onAuthStateChanged: () => {}
    }),
    firestore: () => ({
        collection: () => ({ doc: () => ({ set: async () => {}, onSnapshot: () => {} }) })
    })
};
dom.window.db = dom.window.firebase.firestore();
dom.window.auth = dom.window.firebase.auth();
dom.window.Chart = function() {};
dom.window.document.body.innerHTML = html; // ensure body elements are there

const scripts = [
    'js/excel_parser_v2.js',
    'js/stock_data_compiled.js',
    'js/app_v49.js'
];

for (let s of scripts) {
    let code = fs.readFileSync(s, 'utf8');
    if (s === 'js/app_v49.js') {
        code += '\nwindow.State = State;\nwindow.DEFAULT_STATE = DEFAULT_STATE;\nwindow.goToHisse = goToHisse;\n';
    }
    try {
        dom.window.eval(code);
    } catch(e) {
        console.error("Error evaluating " + s, e);
    }
}

dom.window.currentUser = { uid: 'test' };
dom.window.State.data = JSON.parse(JSON.stringify(dom.window.DEFAULT_STATE || {}));
if(!dom.window.State.data.hisseFiyatlari) dom.window.State.data.hisseFiyatlari = [];
if(!dom.window.State.data.takipListesi) dom.window.State.data.takipListesi = [];
if(!dom.window.State.data.ekstre) dom.window.State.data.ekstre = [];
if(!dom.window.State.data.portfoyGecmisi) dom.window.State.data.portfoyGecmisi = [];
if(!dom.window.State.data.genelNotlar) dom.window.State.data.genelNotlar = [];

try {
    dom.window.goToHisse('AKSEN');
    console.log("goToHisse finished successfully without throwing!");
} catch (e) {
    console.error("ERROR IN goToHisse:", e);
}
