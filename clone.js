// clone.js
import scrape from 'website-scraper'; // only as ESM, no CommonJS

const options = {
    urls: ['https://thiepcuoionline.net/quang-vinh-nhat-ha/'],
    directory: 'cuoi2'
};

// with async/await
const result = await scrape(options);

// with promise
scrape(options).then((result) => {});