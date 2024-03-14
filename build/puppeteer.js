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
    browser = await puppeteer_1.default.launch({
        args: ['--no-sandbox'],
    });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVwcGV0ZWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3B1cHBldGVlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwwREFBcUQ7QUFFckQsSUFBSSxPQUFnQixDQUFDO0FBQ3JCLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztBQUV6QixLQUFLLEtBQUs7SUFDTixJQUFJLFlBQVk7UUFBRSxPQUFPO0lBQ3pCLE9BQU8sR0FBRyxNQUFNLG1CQUFTLENBQUMsTUFBTSxDQUFDO1FBQzdCLElBQUksRUFBRSxDQUFDLGNBQWMsQ0FBQztLQUN6QixDQUFDLENBQUM7SUFDSCxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLENBQUMsRUFBRSxDQUFDO0FBRUcsS0FBSyxVQUFVLE9BQU8sQ0FBQyxHQUFXO0lBQ3JDLElBQUksQ0FBQyxZQUFZO1FBQUUsTUFBTSxjQUFjLEVBQUUsQ0FBQztJQUMxQyxNQUFNLEdBQUcsR0FBRyxNQUFNLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNwQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDcEIsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDO0FBTEQsMEJBS0M7QUFFTSxLQUFLLFVBQVUsYUFBYSxDQUFDLEdBQVc7SUFDM0MsSUFBSSxDQUFDLFlBQVk7UUFBRSxNQUFNLGNBQWMsRUFBRSxDQUFDO0lBQzFDLE1BQU0sSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ25DLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDakUsQ0FBQztBQUpELHNDQUlDO0FBRUQsU0FBUyxjQUFjO0lBQ25CLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDekIsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRTtZQUM5QixJQUFJLFlBQVksRUFBRSxDQUFDO2dCQUNmLE9BQU8sRUFBRSxDQUFDO2dCQUNWLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM1QixDQUFDO1FBQ0wsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ1osQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDIn0=