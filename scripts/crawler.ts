import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

// Base URL of the site to scrape
const baseUrl = 'https://example.com';

// API URL to convert HTML to Markdown
const markdownApiUrl = 'https://your-api.com/convert';

// Set to store visited URLs
const visited = new Set<string>();

// Helper function to save markdown file
const saveMarkdown = (pageUrl: string, markdown: string) => {
    const fileName = path.basename(pageUrl) || 'index';
    const filePath = path.join('markdown-pages', `${fileName}.md`);
    
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, markdown);
    console.log(`Saved: ${filePath}`);
};

// Function to scrape a single page
const scrapePage = async (url: string) => {
    try {
        // Mark the URL as visited
        visited.add(url);

        // Fetch the page HTML
        const response = await axios.get(url);
        const html = response.data;

        // Send the HTML to the markdown conversion API
        const apiResponse = await axios.post(markdownApiUrl, { html });
        const markdown = apiResponse.data.markdown;

        // Save the markdown content to a file
        saveMarkdown(url, markdown);

        // Parse the HTML and find internal links
        const $ = cheerio.load(html);
        const links = $("a[href^='/'], a[href^='" + baseUrl + "']");

        // Visit each link found
        links.each((_, link) => {
            const href = $(link).attr('href');
            const fullUrl = href?.startsWith('http') ? href : `${baseUrl}${href}`;
            if (href && !visited.has(fullUrl)) {
                scrapePage(fullUrl);  // Recursively scrape each found page
            }
        });
    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
    }
};

// Start the scraping process from the base URL
scrapePage(baseUrl);
