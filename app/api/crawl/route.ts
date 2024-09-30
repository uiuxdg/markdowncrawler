import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

// Initialize Turndown Service with custom rules
const turndownService = new TurndownService();

// Rule to remove links but retain their text
turndownService.addRule('removeLinks', {
    filter: 'a',
    replacement: (content) => content, // Return only the text content, ignoring the href
});

// Rule to remove inline CSS styles and style tags
turndownService.addRule('removeStyles', {
    filter: (node) => node.nodeName === 'STYLE' || (node.nodeName === 'DIV' && node.getAttribute('style')) ? true : false,
    replacement: () => '', // Remove any inline styles or style tags
});

// Rule to remove script and link tags (e.g., external CSS)
turndownService.addRule('removeScriptsAndLinks', {
    filter: (node) => node.nodeName === 'SCRIPT' || node.nodeName === 'LINK',
    replacement: () => '', // Remove script and link tags
});

// Helper function to scrape page recursively with a 25-page limit
const crawlAndScrape = async (url: string, visited: Set<string>, scrapeEntireSite: boolean, pageCount: number = 0, onProgress: (count: number) => void) => {
    if (pageCount >= 20) return { markdown: '', pageCount };

    try {
        console.log(`Fetching HTML from ${url}`);

        // Fetch the HTML content
        const response = await axios.get(url);
        const html = response.data;

        // Load HTML into cheerio
        const $ = cheerio.load(html);

        // Remove unwanted elements (style, script, links)
        $('style, script, link').remove(); // Remove styles, scripts, and link tags

        // Extract the main content, avoiding unwanted elements (navbar, footer, etc.)
        const mainContent = $('main').html() || $('body').html() || '';

        // Convert the main content to markdown
        const markdown = turndownService.turndown(mainContent);

        console.log(`Markdown content scraped for ${url}`);

        // Update progress
        onProgress(pageCount + 1);

        // Recursively crawl other linked pages if required
        if (scrapeEntireSite && pageCount < 20) {
            const links = $('a[href]').map((i, link) => $(link).attr('href')).get();
            for (const link of links) {
                const absoluteUrl = new URL(link, url).href;
                if (!visited.has(absoluteUrl) && absoluteUrl.startsWith(url)) {
                    visited.add(absoluteUrl);
                    await crawlAndScrape(absoluteUrl, visited, scrapeEntireSite, pageCount + 1, onProgress);
                }
            }
        }

        return { markdown, pageCount: pageCount + 1 };
    } catch (error) {
        console.error(`Error crawling and scraping ${url}:`, error);
        throw new Error(`Failed to scrape the page at ${url}`);
    }
};

export async function POST(request: Request) {
    const { url, scrapeEntireSite } = await request.json();

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const visited = new Set<string>();
        visited.add(url);

        let pageCount = 0;
        const onProgress = (count: number) => {
            pageCount = count; // Update the pageCount
        };

        // Scrape the page and get the markdown content
        const { markdown } = await crawlAndScrape(url, visited, scrapeEntireSite, pageCount, onProgress);

        return NextResponse.json({ markdown, pageCount });
    } catch (error) {
        console.error('Error during scraping operation:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        } else {
            return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
        }
    }
}
