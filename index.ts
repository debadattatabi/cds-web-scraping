import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import axios, { AxiosError } from 'axios';
import { JSDOM } from 'jsdom';

const url ='https://eschenker.dbschenker.com/app/tracking-public/?refNumber=TWTPE0000255929';

function fetchPage(url: string): Promise<string | undefined> {
  const HTMLData = axios
    .get(url, {timeout: 2000})
    .then(res => res.data)
    .catch((error: AxiosError) => {
      console.error(`There was an error with ${error.config}.`);
      console.error(error.toJSON());
    });

  return HTMLData;
}

async function fetchFromWebOrCache(url: string, ignoreCache = false) {
  // If the cache folder doesn't exist, create it
  if (!existsSync(resolve(__dirname, '.cache'))) {
    mkdirSync('.cache');
  }
  console.log(`Getting data for ${url}...`);
  if (
    !ignoreCache &&
    existsSync(
      resolve(__dirname, `.cache/${Buffer.from(url).toString('base64')}.html`),
    )
  ) {
    console.log(`I read ${url} from cache`);
    const HTMLData = await readFile(
      resolve(__dirname, `.cache/${Buffer.from(url).toString('base64')}.html`),
      { encoding: 'utf8' },
    );
    const dom = new JSDOM(HTMLData);
    return dom.window.document;
  } else {
    console.log(`I fetched ${url} fresh`);
    const HTMLData = await fetchPage(url);
    if (!ignoreCache && HTMLData) {
      writeFile(
        resolve(
          __dirname,
          `.cache/${Buffer.from(url).toString('base64')}.html`,
        ),
        HTMLData,
        { encoding: 'utf8' },
      );
    }
    // return HTMLData;
    const dom = new JSDOM(HTMLData);
    return dom.window.document;
  }
}

// function extractData(document: Document) {
//   const writingLinks: HTMLDivElement[] = Array.from(
//     document.querySelectorAll('mb15'),
//   );
//   console.log('writingLinks >>>> ', writingLinks)
//   return writingLinks.map(link => {
//     return {
//       title: link.text, 
//       url: link.href,
//     };
//   });
// }

function saveData(filename: string, data: any) {
  if (!existsSync(resolve(__dirname, 'data'))) {
    mkdirSync('data');
  }
  writeFile(resolve(__dirname, `data/${filename}.json`), JSON.stringify(data), {
    encoding: 'utf8',
  });
}

async function getData() {
  const document = await fetchFromWebOrCache(
    // 'https://eschenker.dbschenker.com/app/tracking-public/?language_region=en-US_US'
    url,
    true,
  );
  // const data = extractData(document);
  // const data = document.querySelectorAll('.mb15');
  saveData('cds-scraps', document);
}

getData();