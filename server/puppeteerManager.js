class PuppeteerManager {
    constructor(args) {
        this.url = args.url
        this.nrOfPages = args.nrOfPages
        this.subtitles = [];
        this.subtitlesDetails = {}
    }

    async runPuppeteer() {
        const puppeteer = require('puppeteer')
        let commands = []

        const browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-gpu",
            ]
        });

        let page = await browser.newPage()

        await page.setViewport({
            width: 1366,
            height: 768,
            deviceScaleFactor: 1,
        });
    
        await page.authenticate({'data[User][username]':'fliperapp','data[User][password]':'123456'});
        await page.goto("http://legendas.tv/login"); 
    
        await page.goto("http://legendas.tv/busca/os%20simpsons");
    
        let haveNext = false; 
        let links = []; 
    
        do {
            haveNext = false; 
            const urls = await page.$$eval("article:nth-child(1) > div:nth-child(6) > div > p:nth-child(1) > a", (el) => {     
            return el.map((a) => a.getAttribute("href"));
            }); 
        
            links = links.concat(urls); 
        
            const button_next_page = await page.$("resultado_busca > a"); 
            
            if (button_next_page) {
            
            await Promise.all(
                [
                page.waitForNavigation(),  
                page.$eval("resultado_busca > a", e => e.click()) 
                ]
            );
            haveNext = true; 
            }
        } while (haveNext);
    
        for (const url of links) {
            await page.goto(url); 
            await page.waitForSelector("div.container > div.middle.download"); 
        
            const title = await page.$eval("body > div.container > div.middle.download > section:nth-child(2) > h1", (title) => title.innerText);
            const downloads = await page.$eval("body > div.container > div.middle.download > section:nth-child(2) > aside:nth-child(3) > p > span", (title) => title.innerText);            
            const likes = await page.$eval("body > div.container > div.middle.download > section:nth-child(2) > aside:nth-child(4) > p:nth-child(1)", (title) => title.innerText);
            const dislikes = await page.$eval("body > div.container > div.middle.download > section:nth-child(2) > aside:nth-child(4) > p:nth-child(2)", (title) => title.innerText);
            const sender = await page.$eval("body > div.container > div.middle.download > section:nth-child(2) > aside:nth-child(2) > p > span.nume > a", (title) => title.innerText);
            const date = await page.$eval("body > div.container > div.middle.download > section:nth-child(2) > aside:nth-child(2) > p > span.date", (title) => title.innerText);
            const language = await page.$eval("body > div.container > div.middle.download > section:nth-child(2) > h1 > img", (title) => title.innerText);
            const downloadLink = await page.$eval("body > div.container > div.middle.download > section:nth-child(5) > button", (title) => title.innerText);
            
            const post = {
            title, 
            downloads,
            likes,
            dislikes,
            sender,
            date,
            language, 
            downloadLink
            };
        
            this.subtitles.push(post);

            this.subtitlesDetails = JSON.parse(JSON.stringify(this.subtitles))
            return true
        
        }

        console.log('done')
        await browser.close();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    async getSubtitles() {
        await this.runPuppeteer()
        return this.subtitlesDetails
    }
}

module.exports = { PuppeteerManager }