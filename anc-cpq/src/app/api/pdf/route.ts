import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const dataStr = encodeURIComponent(JSON.stringify(body));

        // Use dynamic require for puppeteer to avoid webpack bundling issues in Next.js API routes
        const puppeteer = require('puppeteer');

        // Launch Puppeteer
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();

        // Set viewport to a standard high-res size for consistent rendering
        await page.setViewport({ width: 1280, height: 1800 });

        // CRITICAL: Emulate print media to trigger @media print styles
        await page.emulateMediaType('print');

        // Navigate to the print page with data
        const PORT = process.env.PORT || 6789;
        const printUrl = `http://localhost:${PORT}/print?data=${dataStr}`;

        await page.goto(printUrl, {
            waitUntil: 'networkidle0', // Wait for all content to load
            timeout: 60000 // Increased timeout for stability
        });

        // Add some styles to ensure it prints nicely if needed
        await page.addStyleTag({
            content: `
                @page { size: A4; margin: 0; }
                body { margin: 0 !important; -webkit-print-color-adjust: exact !important; }
            `
        });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
        });

        await browser.close();

        // Return PDF
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="ANC_Proposal_${body.clientName || 'Proposal'}.pdf"`,
            },
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
