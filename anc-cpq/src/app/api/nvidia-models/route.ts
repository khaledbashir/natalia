import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        // Import model configurations
        const { AI_MODELS, NVIDIA_CONFIG } = await import('../../../lib/ai-models');
        const response = await fetch(NVIDIA_CONFIG.modelsEndpoint, {
            headers: {
                'Authorization': `Bearer ${NVIDIA_CONFIG.apiKey}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`NVIDIA API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Filter for chat completion models and format them
        const models = data.data
            ?.filter((model: any) => model.id && !model.id.includes('embedding'))
            .map((model: any) => ({
                id: model.id,
                name: model.id.split('/').pop() || model.id,
                provider: 'nvidia' as const
            })) || [];

        return NextResponse.json({ models });
    } catch (error) {
        console.error('Error fetching NVIDIA models:', error);
        return NextResponse.json({ error: 'Failed to fetch models', models: [] }, { status: 500 });
    }
}
