const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

app.get('/scrape', async (req, res) => {
    const url = "https://www.tokopedia.com/sayurmini-microgreen/product";

    try {
        // Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: true, // change to false if you want to see the browser
            args: [
                '--disable-http2' // Disabling HTTP/2 for Puppeteer
            ]
        });

        const page = await browser.newPage();

        // Set a user-agent string that doesn't support HTTP/2 (optional)
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');

        // Go to the target URL
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Wait for the selector to appear in the page
        await page.waitForSelector('div.css-54k5sq');

        // Extract data using page.evaluate
        const data = await page.evaluate(() => {
            let results = [];
            document.querySelectorAll('div.css-54k5sq').forEach(item => {
                try {
                    const productNameElement = item.querySelector('div.prd_link-product-name.css-3um8ox');
                    const productName = productNameElement ? productNameElement.innerText.trim() : '';

                    const imageElement = item.querySelector('.css-1q90pod');
                    const imageUrl = imageElement ? imageElement.getAttribute("src") : '';

                    const hrefElement = item.querySelector('div.css-19oqosi a');
                    const productUrl = hrefElement ? hrefElement.getAttribute("href") : '';

                    const priceElement = item.querySelector('div.prd_link-product-price.css-h66vau');
                    const productPrice = priceElement ? priceElement.innerText.trim() : '';

                    if (productName) {
                        results.push({ 'productName': productName,  'imageUrl': imageUrl,'productUrl': productUrl , 'productPrice':productPrice});
 
                    }
                } catch (error) {
                    console.error(`Error parsing item: ${error.message}`);
                }
            });
            return results;
        });

         // Send the scraped data as JSON response
         res.json({ url, products: data });
        // Close the browser
        await browser.close();

       

    } catch (error) {
        console.error('Error scraping the URL:', error.message);
        res.status(500).json({ error: 'Failed to scrape the URL' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
