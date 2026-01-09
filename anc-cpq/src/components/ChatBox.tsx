'use client';
import { useState } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { CPQInput } from '../lib/types';

interface ChatBoxProps {
    onParametersExtracted: (params: Partial<CPQInput>) => void;
}

export function ChatBox({ onParametersExtracted }: ChatBoxProps) {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: 'Hey! Tell me about the LED display project you need a proposal for. For example: "I need a curved scoreboard for Barclays Center, 30x15 feet, outdoor rated."' }
    ]);

    const handleSubmit = async () => {
        if (!message.trim() || isLoading) return;

        const userMessage = message;
        setMessage('');
        setHistory(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
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
                setHistory(prev => [...prev, {
                    role: 'ai',
                    content: `Got it! I've configured the proposal for ${params.clientName || 'your project'}. Check the preview on the right - the price updates live as you adjust any parameters.`
                }]);
            } else {
                setHistory(prev => [...prev, {
                    role: 'ai',
                    content: data.rawResponse || 'I couldn\'t extract the parameters. Can you provide more details like dimensions, venue name, and display type?'
                }]);
            }
        } catch (error) {
            setHistory(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4">
                {history.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-200'
                            }`}>
                            {msg.role === 'ai' && <Bot size={14} className="inline mr-2 text-blue-400" />}
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 rounded-2xl px-4 py-3 text-slate-400">
                            <Loader2 size={16} className="animate-spin inline mr-2" />
                            Analyzing your request...
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-800">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="Describe your LED display project..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-all"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
