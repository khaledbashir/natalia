import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Dynamic import for pdf-parse (CommonJS module)
        const pdf = require('pdf-parse');

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Parse PDF
        const data = await pdf(buffer);

        return NextResponse.json({
            text: data.text,
            pages: data.numpages,
            info: data.info
        });
    } catch (error) {
        console.error('PDF parsing error:', error);
        return NextResponse.json({
            error: 'Failed to parse PDF',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
