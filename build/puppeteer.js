"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTabWithUrl = exports.openTab = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
let browser;
let browserReady = false;
void async function () {
    if (browserReady)
        return;
    browser = await puppeteer_1.default.launch({ headless: true });
    browserReady = true;
}();
async function openTab(url) {
    if (!browserReady)
        await waitForBrowser();
    const tab = await browser.newPage();
    await tab.goto(url);
    return tab;
}
exports.openTab = openTab;
async function getTabWithUrl(url) {
    if (!browserReady)
        await waitForBrowser();
    const tabs = await browser.pages();
    return tabs.find(page => page.url().startsWith(url)) ?? null;
}
exports.getTabWithUrl = getTabWithUrl;
function waitForBrowser() {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (browserReady) {
                resolve();
                clearInterval(interval);
            }
        }, 200);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVwcGV0ZWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3B1cHBldGVlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwwREFBcUQ7QUFFckQsSUFBSSxPQUFnQixDQUFDO0FBQ3JCLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztBQUV6QixLQUFLLEtBQUs7SUFDTixJQUFJLFlBQVk7UUFBRSxPQUFPO0lBQ3pCLE9BQU8sR0FBRyxNQUFNLG1CQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDckQsWUFBWSxHQUFHLElBQUksQ0FBQztBQUN4QixDQUFDLEVBQUUsQ0FBQztBQUVHLEtBQUssVUFBVSxPQUFPLENBQUMsR0FBVztJQUNyQyxJQUFJLENBQUMsWUFBWTtRQUFFLE1BQU0sY0FBYyxFQUFFLENBQUM7SUFDMUMsTUFBTSxHQUFHLEdBQUcsTUFBTSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQztBQUxELDBCQUtDO0FBRU0sS0FBSyxVQUFVLGFBQWEsQ0FBQyxHQUFXO0lBQzNDLElBQUksQ0FBQyxZQUFZO1FBQUUsTUFBTSxjQUFjLEVBQUUsQ0FBQztJQUMxQyxNQUFNLElBQUksR0FBRyxNQUFNLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNuQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO0FBQ2pFLENBQUM7QUFKRCxzQ0FJQztBQUVELFNBQVMsY0FBYztJQUNuQixPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ3pCLE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUU7WUFDOUIsSUFBSSxZQUFZLEVBQUUsQ0FBQztnQkFDZixPQUFPLEVBQUUsQ0FBQztnQkFDVixhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDNUIsQ0FBQztRQUNMLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNaLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyJ9