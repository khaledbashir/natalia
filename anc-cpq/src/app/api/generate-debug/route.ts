import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Proxy to internal backend server
    const backendUrl = 'http://localhost:8000/api/generate';
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: await request.text()
    });
    
    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers
    });
    
  } catch (error: any) {
    console.error('Debug proxy error:', error);
    return NextResponse.json({ 
      error: 'Debug proxy error', 
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}