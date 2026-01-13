import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

// In-memory store for dev (in production, use Redis or DB)
// For now, we'll use a simple file-based approach via the existing projects API
const shareStore = new Map<string, any>();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        // Generate a unique share ID (URL-safe)
        const shareId = randomBytes(8).toString('base64url');
        
        // Store the proposal data
        const shareData = {
            id: shareId,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            input: body.input,
            result: body.result,
            clientName: body.input?.clientName || 'Proposal',
            projectName: body.input?.projectName || body.input?.clientName || 'Project',
        };
        
        // Store in memory (will persist as long as server runs)
        shareStore.set(shareId, shareData);
        
        // Build the share URL
        // In production: Set NEXT_PUBLIC_BASE_URL in Easypanel env vars
        // Example: https://your-domain.com
        // If not set, falls back to request origin (works for testing but share links break on prod)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
        const shareUrl = `${baseUrl}/share/${shareId}`;
        
        console.log('Share URL generated:', shareUrl, '(baseUrl:', baseUrl, ')');
        
        return NextResponse.json({
            success: true,
            shareId,
            shareUrl,
            expiresAt: shareData.expiresAt,
        });
        
    } catch (error) {
        console.error('Share API Error:', error);
        return NextResponse.json(
            { error: 'Failed to create share link' },
            { status: 500 }
        );
    }
}

// GET endpoint to retrieve shared proposal data
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
        return NextResponse.json({ error: 'Missing share ID' }, { status: 400 });
    }
    
    const data = shareStore.get(id);
    
    if (!data) {
        return NextResponse.json({ error: 'Share link not found or expired' }, { status: 404 });
    }
    
    // Check expiration
    if (new Date(data.expiresAt) < new Date()) {
        shareStore.delete(id);
        return NextResponse.json({ error: 'Share link has expired' }, { status: 410 });
    }
    
    return NextResponse.json(data);
}
