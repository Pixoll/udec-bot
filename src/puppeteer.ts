import puppeteer, { Browser, Page } from 'puppeteer';

let browser: Browser;
let browserReady = false;

void async function (): Promise<void> {
    if (browserReady) return;
    browser = await puppeteer.launch({ headless: true });
    browserReady = true;
}();

export async function openTab(url: string): Promise<Page> {
    if (!browserReady) await waitForBrowser();
    const tab = await browser.newPage();
    await tab.goto(url);
    return tab;
}

export async function getTabWithUrl(url: string): Promise<Page | null> {
    if (!browserReady) await waitForBrowser();
    const tabs = await browser.pages();
    return tabs.find(page => page.url().startsWith(url)) ?? null;
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
