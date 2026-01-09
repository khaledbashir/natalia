'use client';
import { useState, useEffect } from 'react';
import { AI_MODELS, DEFAULT_MODEL, NVIDIA_CONFIG } from '../lib/ai-models';
import { ChevronDown } from 'lucide-react';

interface NvidiaModel {
    id: string;
    name: string;
    provider: 'nvidia';
}

export function ModelSelector({
    selectedModel,
    onModelChange
}: {
    selectedModel: string;
    onModelChange: (modelId: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [nvidiaModels, setNvidiaModels] = useState<NvidiaModel[]>([]);
    const [isLoadingNvidia, setIsLoadingNvidia] = useState(false);

    useEffect(() => {
        // Fetch NVIDIA models on mount
        const fetchNvidiaModels = async () => {
            setIsLoadingNvidia(true);
            try {
                const res = await fetch('/api/nvidia-models');
                const data = await res.json();
                setNvidiaModels(data.models || []);
            } catch (error) {
                console.error('Failed to fetch NVIDIA models:', error);
            } finally {
                setIsLoadingNvidia(false);
            }
        };

        fetchNvidiaModels();
    }, []);

    const allModels = [
        ...Object.values(AI_MODELS),
        ...nvidiaModels.map(m => ({
            id: m.id,
            name: m.name,
            provider: 'nvidia' as const,
            endpoint: NVIDIA_CONFIG.endpoint,
            apiKey: NVIDIA_CONFIG.apiKey
        }))
    ];

    const currentModel = allModels.find(m => m.id === selectedModel) || AI_MODELS[DEFAULT_MODEL];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold text-slate-300 transition-colors"
            >
                <span className="text-blue-400">{currentModel.name}</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full mt-2 right-0 w-64 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="p-2 border-b border-slate-700">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">AI Model</p>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {/* Built-in models */}
                            {Object.values(AI_MODELS).map(model => (
                                <button
                                    key={model.id}
                                    onClick={() => {
                                        onModelChange(model.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-xs hover:bg-slate-700 transition-colors ${selectedModel === model.id ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300'
                                        }`}
                                >
                                    <div className="font-bold">{model.name}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                                        {model.provider}
                                    </div>
                                </button>
                            ))}

                            {/* NVIDIA models */}
                            {isLoadingNvidia && (
                                <div className="px-4 py-3 text-xs text-slate-500 italic">
                                    Loading NVIDIA models...
                                </div>
                            )}
                            {nvidiaModels.length > 0 && (
                                <>
                                    <div className="px-4 py-2 border-t border-slate-700">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">NVIDIA</p>
                                    </div>
                                    {nvidiaModels.map(model => (
                                        <button
                                            key={model.id}
                                            onClick={() => {
                                                onModelChange(model.id);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-xs hover:bg-slate-700 transition-colors ${selectedModel === model.id ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300'
                                                }`}
                                        >
                                            <div className="font-bold">{model.name}</div>
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
