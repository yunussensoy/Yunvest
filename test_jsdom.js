const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

const html = fs.readFileSync('www/index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable", url: "http://localhost:3000/" });

dom.window.addEventListener('error', (event) => {
    console.error('JSDOM ERROR:', event.error);
});
dom.window.addEventListener('unhandledrejection', (event) => {
    console.error('JSDOM PROMISE ERROR:', event.reason);
});

setTimeout(() => {
    console.log("JSDOM Ready. Testing click AKSEN...");
    try {
        dom.window.goToHisse('AKSEN');
        console.log("goToHisse finished without throwing.");
    } catch (e) {
        console.error("ERROR IN goToHisse:", e);
    }
}, 3000);

setTimeout(() => {
    console.log("Done");
    process.exit(0);
}, 8000);
