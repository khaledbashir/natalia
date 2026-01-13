import { NextRequest, NextResponse } from 'next/server';
import { AI_MODELS, DEFAULT_MODEL } from '../../../../lib/ai-models';

export async function POST(request: NextRequest) {
  try {
    const { message, history = [], currentState = {}, selectedModel = DEFAULT_MODEL } = await request.json();
    
    const modelConfig = AI_MODELS[selectedModel];
    if (!modelConfig) {
      return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }

    // Build messages for the AI model
    const messages = [
      { role: "system", content: `You are the ANC Project Assistant. Think through your reasoning process step by step, then provide your final answer. Your thinking should be detailed and show your analysis process.` },
      ...history.map((h: any) => ({
        role: h.role,
        content: h.content,
      })),
      { role: "user", content: message },
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
        let content = '';

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
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta;

                if (delta?.reasoning_content) {
                  reasoningContent += delta.reasoning_content;
                  // Send thinking updates
                  const thinkingUpdate = {
                    type: 'thinking',
                    content: reasoningContent,
                  };
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(thinkingUpdate)}\n\n`));
                }

                if (delta?.content) {
                  content += delta.content;
                  // Send content updates
                  const contentUpdate = {
                    type: 'content',
                    content: content,
                  };
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(contentUpdate)}\n\n`));
                }
              } catch (e) {
                console.error('Error parsing streaming data:', e);
              }
            }
          }
        }

        // Send final completion message
        const finalUpdate = {
          type: 'complete',
          reasoning: reasoningContent,
          content: content,
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalUpdate)}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
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