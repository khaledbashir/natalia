'use client';
import { useState } from 'react';
import { CPQInput } from '../lib/types';
import { ChatInterface } from './ChatInterface';

interface ChatBoxProps {
    onParametersExtracted: (params: Partial<CPQInput>) => void;
}

export function ChatBox({ onParametersExtracted }: ChatBoxProps) {
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; thinking?: string; timestamp: number }>>([
        {
            role: 'assistant',
            content: 'Hey! Tell me about the LED display project you need a proposal for. For example: "I need a curved scoreboard for Barclays Center, 30x15 feet, outdoor rated."',
            timestamp: Date.now()
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (content: string) => {
        // Add user message
        const userMessage = {
            role: 'user' as const,
            content,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: content })
            });

            const data = await res.json();

            if (data.success && data.parameters) {
                // Map the AI response to CPQInput format
                const params: Partial<CPQInput> = {
                    clientName: data.parameters.clientName,
                    projectName: data.parameters.projectName,
                    productClass: data.parameters.productClass,
                    widthFt: data.parameters.widthFt,
                    heightFt: data.parameters.heightFt,
                    pixelPitch: data.parameters.pixelPitch,
                    environment: data.parameters.environment,
                    shape: data.parameters.shape,
                    access: data.parameters.access,
                    complexity: data.parameters.complexity
                };

                onParametersExtracted(params);

                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `Got it! I've configured the proposal for ${params.clientName || 'your project'}. Check the preview on the right - the price updates live as you adjust any parameters.`,
                    thinking: data.reasoning,
                    timestamp: Date.now()
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.rawResponse || 'I couldn\'t extract the parameters. Can you provide more details like dimensions, venue name, and display type?',
                    timestamp: Date.now()
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: Date.now()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Describe your LED display project..."
            showThinking={process.env.NEXT_PUBLIC_SHOW_REASONING !== 'false'}
        />
    );
}
