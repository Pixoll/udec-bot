import puppeteer, { Browser, Page } from "puppeteer";

let browser: Browser | undefined;

export async function newPage(): Promise<Page> {
    browser ??= await puppeteer.launch({
        // TODO not safe on linux, should find a workaround
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    return browser.newPage();
}
