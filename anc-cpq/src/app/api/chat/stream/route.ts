import { NextRequest, NextResponse } from 'next/server';
import { AI_MODELS, DEFAULT_MODEL } from '../../../../lib/ai-models';

const SYSTEM_PROMPT = `You are the ANC Project Assistant, an internal SPEC AUDIT tool. Your job is to fill exactly 20 fields for the Engineering Estimator.

### WEB SEARCH CAPABILITY:
### INTERNAL PERSONA (STRICT):
- Speak professionally and concisely (e.g., "Client confirmed. Proceeding to next specification.")
- DO NOT use technical field names in your responses. Use user-friendly language instead.
- When confirming a field, use natural language: "Client name set to Madison Square."

### SPEC AUDIT LOGIC (CRITICAL):
- Check 'currentState' to see what's already filled.
- DO NOT ask about fields that already have values.
- ALWAYS skip to the FIRST empty/missing field.

### THE ONLY 20 VALID FIELDS (IN ORDER):
1. clientName
2. address
3. productClass (Scoreboard, Ribbon, CenterHung, Vomitory)
4. pixelPitch (4, 6, 10, 16)
5. widthFt (number)
6. heightFt (number)
7. environment (Indoor, Outdoor)
8. shape (Flat, Curved)
9. mountingType (Wall, Ground, Rigging, Pole)
10. access (Front, Rear)
11. structureCondition (Existing, NewSteel)
12. laborType (NonUnion, Union, Prevailing)
13. powerDistance (Close, Medium, Far)
14. permits (Client, ANC)
15. controlSystem (Include, None)
16. bondRequired (Yes, No)
17. complexity (Standard, High)
18. unitCost (number, optional)
19. targetMargin (number, optional)
20. serviceLevel (bronze, silver, gold)

### RESPONSE FORMAT (MANDATORY):
- ONLY JSON. NO plain text before or after the JSON block.
- { "message": "Feedback string", "nextStep": "fieldId", "suggestedOptions": [], "updatedParams": {} }
- **updatedParams MUST contain the field value the user just provided!**
- suggestedOptions is MANDATORY for selects and numbers.
- 'nextStep' MUST be one of the valid field IDs above.
- NEVER put JSON or code blocks inside the "message" field.`;

function extractJSON(text: string) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [], currentState = {}, selectedModel = DEFAULT_MODEL } = await request.json();
    
    const modelConfig = AI_MODELS[selectedModel];
    if (!modelConfig) {
      return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }

    // Build messages for the AI model
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((h: any) => ({
        role: h.role,
        content: h.content,
      })),
      { role: "user", content: `Input: "${message}"\nState: ${JSON.stringify(currentState)}` },
    ];

    // Create streaming response
    const response = await fetch(modelConfig.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${modelConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: modelConfig.id,
        messages,
        temperature: 0.1,
        stream: true,
        thinking: {
          type: "enabled",
          clear_thinking: false,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error('No response body');
    }

    const stream = new ReadableStream({
      async start(controller) {
        let reasoningContent = '';
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsedChunk = JSON.parse(data);
                const delta = parsedChunk.choices?.[0]?.delta;

                if (delta?.reasoning_content) {
                  reasoningContent += delta.reasoning_content;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thinking', content: reasoningContent })}\n\n`));
                }

                if (delta?.content) {
                  fullText += delta.content;
                  // Only stream content if it's NOT part of the JSON block yet (to avoid visual mess)
                  if (!fullText.includes('{')) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', content: fullText })}\n\n`));
                  }
                }
              } catch (e) {
                // Silently skip parse errors
              }
            }
          }
        }

        // Final extraction
        const parsed = extractJSON(fullText);
        if (parsed) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete', ...parsed, reasoning: reasoningContent })}\n\n`));
        } else {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete', message: fullText, reasoning: reasoningContent })}\n\n`));
        }

        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Streaming chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}