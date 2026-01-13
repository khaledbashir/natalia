import { NextRequest, NextResponse } from 'next/server';
import { CPQInput, CalculationResult } from '../../../lib/types';
import { calculateCPQ } from '../../../lib/calculator';

// Simple in-memory storage for share links (in production, use a database)
const shareStorage = new Map<string, { input: CPQInput; result: CalculationResult; timestamp: number }>();

// Clean up old entries (older than 7 days)
function cleanupOldEntries() {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  for (const [id, data] of shareStorage.entries()) {
    if (data.timestamp < sevenDaysAgo) {
      shareStorage.delete(id);
    }
  }
}

// Generate a simple share ID
function generateShareId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('id');

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }

    const shareData = shareStorage.get(shareId);

    if (!shareData) {
      return NextResponse.json(
        { error: 'Share link not found or expired' },
        { status: 404 }
      );
    }

    // Return the shared data
    return NextResponse.json({
      input: shareData.input,
      result: shareData.result
    });

  } catch (error) {
    console.error('Share GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, result } = body;

    if (!input || !result) {
      return NextResponse.json(
        { error: 'Input and result are required' },
        { status: 400 }
      );
    }

    // Validate the input data
    const requiredFields = [
      'clientName', 'address', 'productClass', 'pixelPitch',
      'widthFt', 'heightFt', 'environment', 'shape', 'mountingType',
      'access', 'structureCondition', 'laborType', 'powerDistance',
      'permits', 'controlSystem', 'bondRequired', 'complexity', 'serviceLevel'
    ];

    const missingFields = requiredFields.filter(field => !input[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate share ID and store data
    const shareId = generateShareId();
    
    shareStorage.set(shareId, {
      input: input as CPQInput,
      result: result as CalculationResult,
      timestamp: Date.now()
    });

    // Clean up old entries periodically
    cleanupOldEntries();

    // Return the share URL
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/share/${shareId}`;
    
    return NextResponse.json({
      shareId,
      shareUrl,
      success: true
    });

  } catch (error) {
    console.error('Share POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}