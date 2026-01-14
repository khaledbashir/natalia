import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Proxy to internal backend server
    const backendUrl = 'http://localhost:8000/api/download/pdf';
    const response = await fetch(backendUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'PDF file not found' }, { status: 404 });
    }
    
    // Get the file data
    const fileData = await response.arrayBuffer();
    
    // Return the file with proper headers
    return new NextResponse(fileData, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="ANC_Proposal.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF download error:', error);
    return NextResponse.json({ error: 'Failed to download PDF file' }, { status: 500 });
  }
}