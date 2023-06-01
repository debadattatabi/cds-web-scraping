// import puppeteer library
import puppeteer, { Puppeteer } from 'puppeteer';
import fs from 'fs';
import { load } from 'cheerio';

async function exec (container: string, mbl: string): Promise<any> {
    const url = 'https://eschenker.dbschenker.com/app/tracking-public/?language_region=en-US_US';
    const browser = await puppeteer.launch({headless: 'new'});
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto(url);

    // Type into search box
    await page.type(".visi-input",`${mbl}`);

    // Wait and click on first result
    const searchResultSelector = '.visi-btn';
    await page.waitForSelector(searchResultSelector);
    await page.click(searchResultSelector);

    let source = await page.content();

    // const $ = load(source);

    // print the json file
    fs.writeFile(`./data/${container}.${mbl}.json`, source, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Successfully written data to file");
      });
    browser.close();
}

// get the command line arguments
exec(process.argv[2] || '', process.argv[3] || '');