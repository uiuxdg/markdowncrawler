
# Markdown Crawler

## Overview

The Markdown Crawler is a web application that allows you to scrape web pages and convert their content into Markdown files. You can choose to scrape an entire website or just a specific page. The app uses the Next.js framework, TailwindCSS for styling, and Shadcn UI components for an improved user experience. It also supports downloading selected scraped Markdown files from local storage.

## Features

- **Page and Site Scraping**: You can scrape a specific page or an entire website (up to 20 pages).
- **Markdown Conversion**: Converts the main content of a web page into Markdown format.
- **File Storage**: Saves scraped pages as Markdown files in local storage.
- **File Selection and Download**: Select multiple Markdown files and download them at once.
- **Real-Time Page Scraping Counter**: Displays the progress and count of pages scraped in real-time.
- **User-Friendly UI**: Built with Shadcn UI components and TailwindCSS for a clean and intuitive user experience.

## Technologies Used

- **Next.js**: The React framework for building this app.
- **TypeScript**: Type safety and better developer experience.
- **TailwindCSS**: Utility-first CSS framework for styling.
- **Shadcn UI**: UI components used for forms, buttons, cards, and scroll areas.
- **Axios**: HTTP client for fetching data from URLs.
- **Cheerio**: Used for scraping HTML and converting it into Markdown.
- **Turndown**: A library to convert HTML content into Markdown.
- **React Spinners**: A spinner component to display during loading states.
- **LocalStorage**: For saving and retrieving Markdown files on the client side.

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/uiuxdg/markdowncrawler.git
    cd markdowncrawler
    ```

2. **Install dependencies** using pnpm:
    ```bash
    pnpm install
    ```

3. **Run the development server**:
    ```bash
    pnpm dev
    ```

4. **Open the application**:
    - Go to [http://localhost:3000](http://localhost:3000)

## Usage

1. Enter a URL you want to scrape.
2. Choose whether to scrape the entire site or just the given page.
3. Click "Crawl and Convert to Markdown".
4. Once the scraping completes, the converted Markdown file will be stored locally.
5. View and download the files from the file list.
6. You can select multiple files and download them as `.md` files.

### File Selection and Download

- Check the boxes next to the files you want to download.
- Use the "Select All" checkbox to select or deselect all files.
- Click the "Download Selected" button to download the chosen Markdown files.

## Code Structure

- **`app/`**: Contains the main app files.
- **`components/ui/`**: UI components from Shadcn, including `Button`, `Input`, `ScrollArea`, `Switch`, etc.
- **`app/api/crawl/route.ts`**: The API route for handling the scraping and returning Markdown content.
- **`public/`**: Public assets such as the background gradient.

## Limitations

- **Max Page Scraping**: The application is limited to scraping a maximum of 20 pages per request.
- **LocalStorage Limits**: Files are saved in the browser's local storage, which may have space limitations depending on the browser.

## Future Improvements

- Add support for scraping more than 25 pages.
- Improve error handling and feedback for users when scraping fails.
- Add more customization options for scraping, such as excluding specific HTML elements.

## License

This project is licensed under the MIT License.
