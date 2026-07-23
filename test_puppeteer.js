const puppeteer = require('puppeteer');
(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({executablePath: 'C:\\Users\\YUNUS\\.cache\\puppeteer\\chrome\\win64-150.0.7871.24\\chrome-win64\\chrome.exe', headless: 'new'});
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    console.log('Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', {waitUntil: 'networkidle2'});
    
    console.log('Wait a bit...');
    await new Promise(r => setTimeout(r, 2000));
    
    // Attempt to log in or click if needed, but errors might just pop up on load
    // The user says "hisse sayfası açılmadı". Maybe they click a stock from autocomplete.
    console.log('Typing AKSEN in search...');
    await page.type('#anasayfa-arama-input', 'AKSEN');
    await page.keyboard.press('Enter');
    
    console.log('Wait a bit more...');
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('Done');
    await browser.close();
})();
