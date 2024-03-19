import puppeteer, { Browser, Page } from 'puppeteer';

let browser: Browser;
let browserReady = false;

void async function (): Promise<void> {
    if (browserReady) return;
    browser = await puppeteer.launch({
        args: ['--no-sandbox'],
    });
    browserReady = true;
}();

export async function openTab(url: string): Promise<Page> {
    if (!browserReady) await waitForBrowser();
    const tab = await browser.newPage();
    await tab.goto(url);
    return tab;
}

function waitForBrowser(): Promise<void> {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (browserReady) {
                resolve();
                clearInterval(interval);
            }
        }, 200);
    });
}
