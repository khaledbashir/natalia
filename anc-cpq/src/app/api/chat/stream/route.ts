import { NextRequest, NextResponse } from 'next/server';
import { AI_MODELS, DEFAULT_MODEL } from '../../../../lib/ai-models';
import { randomUUID } from 'crypto';

const SYSTEM_PROMPT = `You are the ANC Project Assistant. Your goal: Collect 20 specifications for display engineering.

### RULES:
- Use professional, concise language. No technical IDs in messages.
- Always check 'currentState' and skip fields already filled.
- Prioritize fields in the order listed below.
- ALL-IN-ONE EXTRACTION: If the user provides multiple values in a single message, you MUST extract ALL of them into 'updatedParams' immediately.
- Value Extraction: Extract ONLY the business values (e.g., {"clientName": "Madison Square Garden"} instead of {"clientName": "Hi, I'm madison..."}). Strip all conversational fluff.
- DO NOT ask for fields if you can find them in the 'Input' or 'history'.

### 20 REQUIRED FIELDS (PRIORITY ORDER):
1. clientName (Venue or organization name)
2. address (Full physical location)
3. productClass (Choices: Scoreboard, Ribbon, CenterHung, Vomitory)
4. pixelPitch (Choices: 4, 6, 10, 16)
5. widthFt (Number)
6. heightFt (Number)
7. environment (Choices: Indoor, Outdoor)
8. shape (Choices: Flat, Curved)
9. mountingType (Choices: Wall, Ground, Rigging, Pole)
10. access (Choices: Front, Rear)
11. structureCondition (Choices: Existing, NewSteel)
12. laborType (Choices: NonUnion, Union, Prevailing)
13. powerDistance (Choices: Close, Medium, Far)
14. permits (Choices: Client, ANC, Existing)
15. controlSystem (Choices: Include, None)
16. bondRequired (Choices: Yes, No)
17. complexity (Choices: Standard, High)
18-20. unitCost, targetMargin, serviceLevel (bronze/silver/gold)

### RESPONSE FORMAT:
- Output a single JSON block.
{
  "reasoning": "Logic trace (brief)",
  "message": "Assistant feedback/question (Plain text only)",
  "nextStep": "fieldId",
  "suggestedOptions": [],
  "updatedParams": {}
}
- suggestedOptions is MANDATORY for all select fields.
- updatedParams: Essential! Include ALL values extracted from user input.
- NEVER put markdown fences or codes inside the 'message' or 'reasoning'.`;

const NARRATION_SYSTEM_PROMPT = `You are a professional assistant.
Acknowledge the captured data and ask the next question provided in the JSON input.
Format: [Acknowledgment]. [Question].
Rules: Plain text only. Concise. No technical IDs.`;

const VALID_FIELD_IDS_IN_ORDER = [
  "clientName",
  "address",
  "productClass",
  "pixelPitch",
  "widthFt",
  "heightFt",
  "environment",
  "shape",
  "mountingType",
  "access",
  "structureCondition",
  "laborType",
  "powerDistance",
  "permits",
  "controlSystem",
  "bondRequired",
  "complexity",
  "unitCost",
  "targetMargin",
  "serviceLevel",
] as const;

function computeNextStepFromState(state: any): string {
  for (const field of VALID_FIELD_IDS_IN_ORDER) {
    const val = state?.[field];
    if (val === undefined || val === null || val === "") return field;
  }
  return "confirm";
}

function sanitizePlainMessage(input: unknown): string {
  const text = String(input ?? "").trim();
  if (!text) return "";
  // Never allow markdown fenced blocks or JSON blobs to be shown in chat bubbles.
  return text
    .replace(/```json[\s\S]*?```/gi, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\{[\s\S]*\}/g, "")
    .trim();
}

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
    // Preserve any prior raw reasoning_content so GLM can keep continuity when enabled.
    const reasoning_content = typeof h.thinking === "string" ? h.thinking : undefined;
    return { ...h, content, reasoning_content };
  });
}

function parseNarrationOutput(text: string): { notes: string; question: string } | null {
  const raw = String(text ?? "").trim();
  if (!raw) return null;

  const notesMatch = raw.match(/\bNOTES\s*:\s*([\s\S]*?)\bQUESTION\s*:\s*/i);
  const questionMatch = raw.match(/\bQUESTION\s*:\s*([\s\S]*)$/i);

  const notes = (notesMatch?.[1] ?? "").trim();
  const question = (questionMatch?.[1] ?? "").trim();

  if (!question) return null;
  return {
    notes: sanitizePlainMessage(notes),
    question: sanitizePlainMessage(question),
  };
}

function extractJSON(text: string) {
  const cleaned = (text || "")
    .replace(/```json/gi, "```")
    .replace(/```/g, "");

  const normalizeCandidate = (candidate: string) => {
    let fixed = candidate.trim().replace(/([\{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
    
    // Repair truncated JSON: handle open quotes and braces
    let openQuotes = (fixed.match(/"/g) || []).length;
    if (openQuotes % 2 !== 0) {
      fixed += '"';
    }
    
    let openBraces = (fixed.match(/\{/g) || []).length;
    let closedBraces = (fixed.match(/\}/g) || []).length;
    if (openBraces > closedBraces) {
      fixed += '}'.repeat(openBraces - closedBraces);
    }
    return fixed;
  };

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
    const requestId = randomUUID();
    const {
      message,
      history = [],
      currentState = {},
      selectedModel = DEFAULT_MODEL,
      mode = "audit",
      narration,
    } = await request.json();
    
    const modelConfig = AI_MODELS[selectedModel];
    if (!modelConfig) {
      return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }

    // Clean history before sending to the model to prevent logic loops
    const cleanedHistory = cleanHistory(history);

    // Build messages for the AI model
    const messages =
      mode === "narrate"
        ? [
            { role: "system", content: NARRATION_SYSTEM_PROMPT },
            // In narration mode, history often hurts (it increases repetition risk). Keep it minimal.
            { role: "user", content: JSON.stringify(narration ?? {}) },
          ]
        : [
            { role: "system", content: SYSTEM_PROMPT },
            ...cleanedHistory.map((h: any) => {
              if (h.role === "assistant" && typeof h.reasoning_content === "string") {
                return {
                  role: h.role,
                  content: h.content,
                  reasoning_content: h.reasoning_content,
                };
              }
              return { role: h.role, content: h.content };
            }),
            { role: "user", content: `Input: "${message}"\nState: ${JSON.stringify(currentState)}` },
          ];

    // Build request body
    const body: any = {
        model: modelConfig.id,
        messages,
        temperature: mode === "narrate" ? 0.4 : 0.1,
        stream: true,
    };

    // Only enable native thinking for models that explicitly support it (GLM-4.7)
    if (modelConfig.supportsThinking) {
        body.thinking = {
            type: "enabled",
            clear_thinking: false,
        };
    }

    // Create streaming response
    const response = await fetch(modelConfig.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${modelConfig.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const bodyText = await response.text();
      console.error(`[chat/stream] upstream_error requestId=${requestId} status=${response.status} body=${bodyText}`);
      return NextResponse.json(
        {
          error: "Upstream model error",
          requestId,
          status: response.status,
        },
        { status: 502 },
      );
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
        let fullText = '';
        let reasoningContent = '';
        let buffer = '';

        // Stream the model's raw reasoning_content (GLM thinking). This is NOT modified.

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            if (trimmedLine.startsWith('data: ')) {
              const data = trimmedLine.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsedChunk = JSON.parse(data);
                const delta = parsedChunk.choices?.[0]?.delta;

                if (delta?.reasoning_content) {
                  reasoningContent += delta.reasoning_content;
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: "thinking", content: reasoningContent })}\n\n`,
                    ),
                  );
                }

                if (delta?.content) {
                  fullText += delta.content;
                  if (mode === "narrate") {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ type: "content", content: fullText })}\n\n`,
                      ),
                    );
                  }
                }
              } catch (e) {
                // Silently skip parse errors
              }
            }
          }
        }

        if (mode === "narrate") {
          const safeText = sanitizePlainMessage(fullText);
          const nextStep = typeof narration?.nextStep === "string" ? narration.nextStep : "";
          const suggestedOptions = Array.isArray(narration?.suggestedOptions)
            ? narration.suggestedOptions
            : [];

          if (!safeText) {
            console.error(
              `[chat/stream] narration_empty requestId=${requestId} raw=${fullText}`,
            );
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  requestId,
                  error: "Narration model returned empty/unsafe output.",
                })}\n\n`,
              ),
            );
            controller.close();
            return;
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                message: safeText,
                nextStep,
                suggestedOptions,
                updatedParams: {},
                reasoning: reasoningContent,
              })}\n\n`,
            ),
          );
        } else {
          // Final extraction (ABSOLUTE: never send raw model JSON to the client as message)
          const parsed = extractJSON(fullText);
          const { WIZARD_QUESTIONS } = await import("../../../../lib/wizard-questions");

          if (!parsed) {
            console.error(
              `[chat/stream] invalid_json requestId=${requestId} raw=${fullText}`,
            );
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  requestId,
                  error:
                    "Model output was not valid JSON for SPEC AUDIT. Check server logs for raw output.",
                })}\n\n`,
              ),
            );
            controller.close();
            return;
          }

          const nextStep =
            (parsed?.nextStep &&
              typeof parsed.nextStep === "string" &&
              VALID_FIELD_IDS_IN_ORDER.includes(parsed.nextStep as any))
              ? parsed.nextStep
              : computeNextStepFromState(currentState);

          const questionDef = WIZARD_QUESTIONS.find((q) => q.id === nextStep);
          const suggestedOptions = questionDef?.options || [];

          const safeReasoning =
            (parsed?.reasoning && typeof parsed.reasoning === "string"
              ? parsed.reasoning
              : "").trim();

          if (parsed) {
            const safeMessage =
              sanitizePlainMessage(parsed.message) ||
              questionDef?.question ||
              "I have updated the project specifications. What is the next required detail?";
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "complete",
                  message: safeMessage,
                  nextStep,
                  suggestedOptions,
                  updatedParams: parsed.updatedParams || {},
                  // Prefer the model's raw reasoning_content stream; fall back to JSON reasoning if present.
                  reasoning: reasoningContent || safeReasoning,
                })}\n\n`,
              ),
            );
          }
        }

        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
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