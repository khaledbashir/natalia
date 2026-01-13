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
        // 1. Try environment variable (best for production)
        let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        
        // 2. Fallback: Try Host header (works great behind proxies like Traefik/Easypanel)
        if (!baseUrl) {
            const host = req.headers.get('host');
            const proto = req.headers.get('x-forwarded-proto') || 'https';
            if (host && !host.includes('localhost') && !host.includes('0.0.0.0')) {
                baseUrl = `${proto}://${host}`;
            }
        }
        
        // 3. Fallback: Request origin (might be 0.0.0.0 in Docker, but better than nothing)
        if (!baseUrl) {
            baseUrl = req.nextUrl.origin;
        }

        // Remove trailing slash if present
        baseUrl = baseUrl.replace(/\/$/, '');

        const shareUrl = `${baseUrl}/share/${shareId}`;
        
        console.log('Share URL:', shareUrl, '| Source:', process.env.NEXT_PUBLIC_BASE_URL ? 'ENV' : 'Headers');
        
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
