import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Retrieve saved files from localStorage (this will only work on the client-side)
        const savedFiles = JSON.parse(localStorage.getItem('markdownFiles') || '[]');

        return NextResponse.json({ files: savedFiles });
    } catch (error) {
        return NextResponse.json({ error: 'Unable to retrieve saved files from localStorage' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { url, markdown } = await request.json();
        
        if (!url || !markdown) {
            return NextResponse.json({ error: 'URL and markdown content are required' }, { status: 400 });
        }

        // Save the markdown content to localStorage (client-side)
        let savedFiles = JSON.parse(localStorage.getItem('markdownFiles') || '[]');
        
        // Create a new file object to store URL and markdown content
        const newFile = { url, content: markdown };
        
        // Add to the saved files list
        savedFiles.push(newFile);
        localStorage.setItem('markdownFiles', JSON.stringify(savedFiles));

        return NextResponse.json({ message: 'File saved successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Unable to save file to localStorage' }, { status: 500 });
    }
}
