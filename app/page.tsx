"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ClipLoader } from "react-spinners"; 

export default function CrawlPage() {
    const [url, setUrl] = useState("");
    const [markdownContent, setMarkdownContent] = useState("");
    const [savedFiles, setSavedFiles] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState("");
    const [progress, setProgress] = useState(0);
    const [log, setLog] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [scrapeEntireSite, setScrapeEntireSite] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state for spinner
    const [pageCount, setPageCount] = useState(0); // Counter for pages scraped
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]); // For file selection
    const [selectAll, setSelectAll] = useState(false); // Select all state

    // Load saved files from localStorage
    useEffect(() => {
        const storedFiles = JSON.parse(localStorage.getItem('savedFiles') || '[]');
        setSavedFiles(storedFiles);
    }, []);

    // Handle form submission for scraping
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setProgress(0);
            setLog([]);
            setMarkdownContent("");
            setErrorMessage(null);
            setLoading(true); // Start loading spinner
            setPageCount(0); // Reset page counter

            const response = await axios.post("/api/crawl", { url, scrapeEntireSite });

            const markdown = response.data.markdown;
            const totalPagesScraped = response.data.pageCount; // Get the page count from the response

            setPageCount(totalPagesScraped); // Set the page count

            // Save to localStorage
            const fileName = url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            localStorage.setItem(fileName, markdown);
            const newSavedFiles = [...savedFiles, fileName];
            setSavedFiles(newSavedFiles);
            localStorage.setItem('savedFiles', JSON.stringify(newSavedFiles));

            setMarkdownContent(markdown);
            setLog((prevLog) => [...prevLog, `Crawling completed for ${url}, Pages scraped: ${totalPagesScraped}`]);
        } catch (error) {
            setErrorMessage("Unable to read markdown content.");
            setLog((prevLog) => [
                ...prevLog,
                `Error scraping: ${error instanceof Error ? error.message : "Unknown error"}`,
            ]);
        } finally {
            setLoading(false); // Stop loading spinner
        }
    };

    // Handle file selection from the list
    const handleFileSelect = (file: string) => {
        const markdown = localStorage.getItem(file);
        if (markdown) {
            setMarkdownContent(markdown);
            setSelectedFile(file);
            setErrorMessage(null);
        } else {
            setErrorMessage("Unable to read markdown content.");
        }
    };

    // Handle individual checkbox click
    const handleCheckboxChange = (file: string) => {
        setSelectedFiles(prev => 
            prev.includes(file) ? prev.filter(f => f !== file) : [...prev, file]
        );
    };

    // Handle Select All checkbox
    const handleSelectAll = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            setSelectedFiles(savedFiles); // Select all files
        } else {
            setSelectedFiles([]); // Deselect all files
        }
    };

    // Handle file downloads
    const handleDownload = () => {
        selectedFiles.forEach((file) => {
            const markdown = localStorage.getItem(file);
            if (markdown) {
                const blob = new Blob([markdown], { type: "text/markdown" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `${file}.md`;
                link.click();
            }
        });
    };

    return (
        <div
            className="min-h-screen p-6"
            style={{ 
              backgroundImage: 'url("/gradient-image.svg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
        >
            <h1 className="text-3xl font-extrabold text-center mb-6 text-white">Markdown Crawler</h1>

            <form onSubmit={handleSubmit} className="flex flex-col items-center mb-6 space-y-4">
                <Input
                    id="url"
                    placeholder="Enter URL (e.g. https://example.com)"
                    value={url}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                    className="w-full max-w-md"
                    required
                />

                <div className="flex items-center space-x-3">
                    <label htmlFor="scrapeSite" className="text-white">Scrape Entire Site (Up to 20 pages)</label>
                    <Switch
                        id="scrapeSite"
                        checked={scrapeEntireSite}
                        onCheckedChange={() => setScrapeEntireSite(!scrapeEntireSite)} 
                    />
                </div>

                <Button type="submit" className="w-full max-w-md">Crawl and Convert to Markdown</Button>
            </form>

            {loading && (
                <div className="flex justify-center mb-6">
                    <ClipLoader color={"#ffffff"} loading={loading} size={50} />
                </div>
            )}

            {progress > 0 && (
                <Progress value={progress} className="w-full max-w-md mx-auto mb-6" />
            )}

            {/* Page scrape counter */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-96">
                    <CardHeader>
                        <CardTitle>Saved Markdown Files</CardTitle>
                        <div className="flex items-center justify-start space-x-2">
                            <input
                                type="checkbox"
                                id="selectAll"
                                checked={selectAll}
                                onChange={handleSelectAll}
                            />
                            <label htmlFor="selectAll" className="text-white">Select All</label>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="min-h-48">
                            <ul className="space-y-2">
                                {savedFiles.map((file) => (
                                    <li key={file} className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedFiles.includes(file)}
                                            onChange={() => handleCheckboxChange(file)}
                                        />
                                        <Button
                                            variant={file === selectedFile ? "outline" : "ghost"}
                                            onClick={() => handleFileSelect(file)}
                                            className="w-full text-left"
                                        >
                                            {file}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </CardContent>
                    <div className="flex items-center justify-center w-full">
                        <Button className="m-4" onClick={handleDownload} disabled={selectedFiles.length === 0}>
                            Download Selected
                    </Button>
                    </div>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Markdown Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {errorMessage ? (
                            <p className="text-red-500">{errorMessage}</p>
                        ) : markdownContent ? (
                            <ScrollArea className="h-72 ">
                                <pre className="whitespace-pre-wrap">{markdownContent}</pre>
                            </ScrollArea>
                        ) : (
                            <p className="text-gray-500">Select a file to view its content</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {log.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-bold mb-2 text-white">Operation Log</h2>
                    <ul className="space-y-1">
                        {log.map((logEntry, index) => (
                            <li key={index}>
                                <Badge variant="outline">{logEntry}</Badge>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
