'use client';
import React, { useState } from 'react';
import { CPQInput } from '../lib/types';
import { Terminal, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface SalesforceSimulatorProps {
    onLoadState: (state: Partial<CPQInput>) => void;
}

export function SalesforceSimulator({ onLoadState }: SalesforceSimulatorProps) {
    const [json, setJson] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSimulate = () => {
        try {
            const data = JSON.parse(json);
            onLoadState(data);
            setStatus('success');
            setTimeout(() => setStatus('idle'), 2000);
        } catch (e: any) {
            setStatus('error');
            setErrorMsg(e.message);
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const loadExample = () => {
        const example = {
            clientName: "Golden State Warriors",
            projectName: "Chase Center - Main Bowl",
            address: "1 Warriors Way, San Francisco, CA 94158",
            productClass: "Scoreboard",
            widthFt: 100,
            heightFt: 50,
            pixelPitch: 4,
            environment: "Indoor",
            shape: "Curved",
            access: "Front"
        };
        setJson(JSON.stringify(example, null, 2));
    };

    return (
        <div className="p-4 bg-slate-900 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-3 text-blue-400">
                <Terminal size={18} />
                <h3 className="text-sm font-bold tracking-tight">Salesforce Trigger Simulator</h3>
            </div>

            <textarea
                value={json}
                onChange={(e) => setJson(e.target.value)}
                placeholder='Paste Salesforce JSON payload here...'
                className="w-full h-32 bg-slate-950 text-emerald-400 font-mono text-xs p-3 rounded border border-slate-700 focus:border-blue-500 outline-none resize-none mb-3"
            />

            <div className="flex gap-2">
                <button
                    onClick={handleSimulate}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium text-sm transition-all shadow-sm"
                >
                    {status === 'success' ? <CheckCircle size={16} /> : <Send size={16} />}
                    {status === 'success' ? 'Triggered!' : 'Trigger Payload'}
                </button>
                <button
                    onClick={loadExample}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium border border-slate-700 transition-all"
                >
                    Load Sample
                </button>
            </div>

            {status === 'error' && (
                <div className="mt-2 flex items-center gap-2 text-rose-500 text-[10px] font-medium bg-rose-500/10 p-2 rounded">
                    <AlertCircle size={12} />
                    {errorMsg}
                </div>
            )}
        </div>
    );
}
