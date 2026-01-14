import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG: Raw request received ===');
    const rawBody = await request.text();
    console.log('Raw body:', rawBody);
    
    const body = JSON.parse(rawBody);
    console.log('Parsed body:', JSON.stringify(body, null, 2));
    
    // Forward to the actual backend
    const backendUrl = 'http://localhost:8000/api/generate';
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: rawBody
    });
    
    const backendData = await backendResponse.text();
    console.log('Backend response:', backendResponse.status, backendData);
    
    return new NextResponse(backendData, {
      status: backendResponse.status,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Debug proxy error:', error);
    return NextResponse.json({ 
      error: 'Debug proxy error', 
      details: error.message 
    }, { status: 500 });
  }
}