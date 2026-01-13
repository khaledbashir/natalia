import { NextRequest, NextResponse } from 'next/server';
import { AI_MODELS, DEFAULT_MODEL } from '../../../../lib/ai-models';

const SYSTEM_PROMPT = `You are the ANC Project Assistant, an internal SPEC AUDIT tool. Your job is to fill exactly 20 fields for the Engineering Estimator.

### INTERNAL PERSONA (STRICT):
- Speak professionally and concisely.
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

### REASONING ENGINE (INTERNAL):
- ALWAYS start your output with a logic sequence reflecting your audit.
- In your reasoning, list:
  1. What was just extracted/verified from the user input.
  2. What is still missing from the list of 20 fields.
  3. Why you are choosing the next specific question (priority field).

### HISTORY & LOOP PREVENTION:
- DO NOT repeat questions found in the history.
- If you see a field has a value in 'currentState', it is VERIFIED. Forget about it. 
- If the user provides multiple pieces of data, update ALL of them in 'updatedParams'.

### RESPONSE FORMAT (MANDATORY):
- ONLY JSON. NO plain text before or after the JSON block.
- { 
    "reasoning": "LOGIC TRACE: Verified [X]. Missing [Y]. Next: [Z].",
    "message": "Feedback string", 
    "nextStep": "fieldId", 
    "suggestedOptions": [], 
    "updatedParams": {} 
  }
- **updatedParams MUST contain the field value the user just provided!**
- suggestedOptions is MANDATORY for selects and numbers.
- 'nextStep' MUST be one of the valid field IDs above.
- NEVER put JSON or code blocks inside the "message" field.
- **DO NOT EXPLAIN YOUR REASONING IN THE message FIELD. ONLY IN THE reasoning FIELD.**
- STOP immediately after the closing brace of the JSON. DO NOT EXPLAIN.`;

function cleanHistory(history: any[]): any[] {
  return history.map((h) => {
    let content = h.content || "";
    if (h.role === "assistant") {
      // 1. Remove JSON blocks
      content = content.replace(/```json[\s\S]*?```/g, "");
      // 2. Remove markdown fences
      content = content.replace(/```[\s\S]*?```/g, "");
      // 3. Remove thinking/details tags if they leaked into content
      content = content.replace(/<details[\s\S]*?<\/details>/gi, "");
      content = content.replace(/<think>[\s\S]*?<\/think>/gi, "");
      // 4. Remove any loose JSON-like structures that might confuse the model
      content = content.replace(/\{[\s\S]*\}/g, "");
      
      content = content.trim();
      
      // If we stripped everything, keep the original (better than empty)
      if (!content && h.content) content = h.content;
    }
    return { ...h, content };
  });
}

function extractJSON(text: string) {
  const cleaned = (text || "")
    .replace(/```json/gi, "```")
    .replace(/```/g, "");

  const normalizeCandidate = (candidate: string) =>
    candidate.replace(/([\{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');

  const isValidPayload = (obj: any) => {
    if (!obj || typeof obj !== "object") return false;
    if (typeof obj.message !== "string" || !obj.message.trim()) return false;
    if (typeof obj.nextStep !== "string" || !obj.nextStep.trim()) return false;
    if (obj.updatedParams === undefined) return false;
    if (typeof obj.updatedParams !== "object" || obj.updatedParams === null) return false;
    return true;
  };

  // Extract balanced {...} candidates (handles multiple JSON blocks, partial blocks, etc.)
  const candidates: string[] = [];
  let start = -1;
  let depth = 0;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      if (depth > 0) depth--;
      if (depth === 0 && start !== -1) {
        candidates.push(cleaned.slice(start, i + 1));
        start = -1;
      }
    }
  }

  let lastValid: any = null;
  for (const candidate of candidates) {
    try {
      const obj = JSON.parse(normalizeCandidate(candidate));
      if (isValidPayload(obj)) lastValid = obj;
    } catch {
      // ignore
    }
  }

  // Fallback: try parsing the widest brace span.
  if (!lastValid) {
    try {
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const obj = JSON.parse(normalizeCandidate(cleaned.substring(firstBrace, lastBrace + 1)));
        if (isValidPayload(obj)) lastValid = obj;
      }
    } catch {
      // ignore
    }
  }

  return lastValid;
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [], currentState = {}, selectedModel = DEFAULT_MODEL } = await request.json();
    
    const modelConfig = AI_MODELS[selectedModel];
    if (!modelConfig) {
      return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }

    // Clean history before sending to the model to prevent logic loops
    const cleanedHistory = cleanHistory(history);

    // Build messages for the AI model
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...cleanedHistory.map((h: any) => ({
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