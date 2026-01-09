import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
// export const dynamic = 'force-dynamic'; // Already present or redundant with the move


const EXTRACTION_PROMPT = `You are an expert document parser. Analyze the following text extracted from a client RFP or project brief for an LED display project.

Extract the following fields and return ONLY valid JSON:
{
  "clientName": "Company or venue name",
  "projectName": "Project or venue name",
  "productClass": "Scoreboard, Ribbon, or CenterHung (infer from context)",
  "widthFt": number or null,
  "heightFt": number or null,
  "pixelPitch": number in mm or null,
  "environment": "Indoor or Outdoor (infer from context)",
  "shape": "Flat or Curved",
  "access": "Front or Rear",
  "notes": "Any other relevant details"
}

If a field cannot be determined, use null. Be intelligent about inferring values from context.
For dimensions, convert to feet if given in other units.
For pixel pitch, look for values like "10mm", "P10", "6mm pitch" etc.

Document Text:
`;

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse PDF
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(buffer);
        const extractedText = pdfData.text;

        if (!extractedText || extractedText.trim().length === 0) {
            return NextResponse.json({
                error: 'Could not extract text from PDF. It may be image-based or empty.',
                extractedText: ''
            }, { status: 400 });
        }

        // Send to GLM-4.7 for intelligent extraction
        const response = await fetch('https://api.z.ai/api/coding/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 8c313c111b47423aa91781479cf0af6e.LfWV1laJpyWEHH1z'
            },
            body: JSON.stringify({
                model: 'glm-4.7',
                messages: [
                    { role: 'system', content: 'You are a document parsing assistant. Extract structured data from text.' },
                    { role: 'user', content: EXTRACTION_PROMPT + extractedText.substring(0, 8000) } // Limit chars
                ],
                temperature: 0.1 // Low temperature for precise extraction
            })
        });

        if (!response.ok) {
            throw new Error('LLM API Error: ' + await response.text());
        }

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content || '{}';

        // Clean up JSON
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const extractedFields = JSON.parse(content);
            return NextResponse.json({
                success: true,
                extractedFields,
                rawText: extractedText.substring(0, 500) + '...' // Preview
            });
        } catch (e) {
            return NextResponse.json({
                success: false,
                error: 'Failed to parse extraction result',
                rawText: extractedText.substring(0, 500),
                llmResponse: content
            });
        }

    } catch (error: any) {
        console.error('Upload Brief Error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to process document'
        }, { status: 500 });
    }
}
