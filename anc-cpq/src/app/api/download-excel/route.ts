import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Proxy to internal backend server
    const backendUrl = 'http://localhost:8000/api/download/excel';
    const response = await fetch(backendUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Excel file not found' }, { status: 404 });
    }
    
    // Get the file data
    const fileData = await response.arrayBuffer();
    
    // Return the file with proper headers
    return new NextResponse(fileData, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="ANC_Expert_Estimation.xlsx"',
      },
    });
  } catch (error) {
    console.error('Excel download error:', error);
    return NextResponse.json({ error: 'Failed to download Excel file' }, { status: 500 });
  }
}