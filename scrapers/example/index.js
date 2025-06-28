import { PuppeteerCrawler, Dataset } from 'crawlee';

const run = async () => {
  const crawler = new PuppeteerCrawler({
    async requestHandler({ page, request }) {
      const title = await page.title();
      await Dataset.pushData({
        title,
        domain: new URL(request.url).hostname,
      });
    },
  });

  await crawler.run(['https://example.com']);
};

run();
