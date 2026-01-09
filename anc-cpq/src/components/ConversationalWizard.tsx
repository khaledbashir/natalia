'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Bot, User, Upload, Plus, History, FileText, X, CheckCircle2, ChevronRight, MapPin } from 'lucide-react';
import { WIZARD_QUESTIONS } from '../lib/wizard-questions';
import { CPQInput } from '../lib/types';
import { ModelSelector } from './ModelSelector';
import { DEFAULT_MODEL } from '../lib/ai-models';
import clsx from 'clsx';

interface ConversationalWizardProps {
    onComplete: (params: Partial<CPQInput>) => void;
    onUpdate: (params: Partial<CPQInput>) => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    nextStep?: string;
    thinking?: string;
    suggestedOptions?: { value: string; label: string }[];
}

interface SavedProposal {
    id: string;
    name: string;
    timestamp: number;
    messages: Message[];
    state: Partial<CPQInput>;
}

const STORAGE_KEY = 'anc_cpq_session';
const HISTORY_KEY = 'anc_cpq_history';

const INITIAL_CPQ_STATE: CPQInput = {
    clientName: '',
    address: '',
    projectName: '',
    productClass: 'Scoreboard',
    widthFt: 0,
    heightFt: 0,
    pixelPitch: 10,
    environment: 'Indoor',
    shape: 'Flat',
    access: 'Front',
    complexity: 'Standard'
};

const getInitialMessage = (): Message => ({
    role: 'assistant',
    content: "Hi! I'm your ANC Sales Engineer. Tell me about the project you're working on today, or upload a client brief to get started.",
    thinking: "Initial greeting. Waiting for user input or document upload."
});

const PROGRESS_STEPS = [
    { id: 'client', label: 'CLIENT', fields: ['clientName', 'address'] },
    { id: 'product', label: 'SYSTEM', fields: ['productClass', 'pixelPitch'] },
    { id: 'dimensions', label: 'SPECS', fields: ['widthFt', 'heightFt'] },
    { id: 'config', label: 'DETAIL', fields: ['environment', 'shape', 'access'] }
];

export function ConversationalWizard({ onComplete, onUpdate }: ConversationalWizardProps) {
    const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cpqState, setCpqState] = useState<Partial<CPQInput>>({});
    const [showHistory, setShowHistory] = useState(false);
    const [savedProposals, setSavedProposals] = useState<SavedProposal[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Model selection
    const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);

    // Hydrate model selection from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('selectedAIModel');
            if (saved) setSelectedModel(saved);
        }
    }, []);

    // Save model selection to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('selectedAIModel', selectedModel);
        }
    }, [selectedModel]);

    // Calculate Progress
    const totalFields = 10;
    const filledFields = Object.keys(cpqState).filter(k => {
        const val = cpqState[k as keyof CPQInput];
        return val !== undefined && val !== null && val !== '' && val !== 0;
    }).length;
    const progress = Math.min(100, Math.round((filledFields / totalFields) * 100));

    const getStepStatus = (step: typeof PROGRESS_STEPS[0]) => {
        const filled = step.fields.filter(f => {
            const val = cpqState[f as keyof CPQInput];
            return val !== undefined && val !== null && val !== '' && val !== 0;
        });
        if (filled.length === step.fields.length) return 'complete';
        if (filled.length > 0) return 'active';
        return 'pending';
    };

    const [expandedThinking, setExpandedThinking] = useState<number | null>(null);
    const [projectId, setProjectId] = useState<number | null>(null);

    // Load session from Server (DB) or Create New
    useEffect(() => {
        const initSession = async () => {
            const savedId = localStorage.getItem('anc_project_id');
            if (savedId) {
                try {
                    // Resume existing session
                    const res = await fetch(`/api/projects/${savedId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setProjectId(data.id);
                        if (data.messages && data.messages.length > 0) {
                            setMessages(data.messages);
                        }
                        if (data.state) {
                            setCpqState(data.state);
                            onUpdate(data.state);
                        }
                        return;
                    }
                } catch (e) {
                    console.error("Failed to resume session:", e);
                }
            }

            // Create New Session if resume failed or no ID
            try {
                const res = await fetch('/api/projects', { method: 'POST' });
                if (res.ok) {
                    const data = await res.json();
                    setProjectId(data.id);
                    localStorage.setItem('anc_project_id', data.id.toString());
                }
            } catch (e) {
                console.error("Failed to create project:", e);
            }
        };

        initSession();
    }, []);

    // Save state to Server (DB) on changes
    useEffect(() => {
        if (projectId && Object.keys(cpqState).length > 0) {
            const timeoutId = setTimeout(() => {
                fetch(`/api/projects/${projectId}/state`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cpqState)
                }).catch(e => console.error("Failed to auto-save state", e));
            }, 1000); // Debounce save
            return () => clearTimeout(timeoutId);
        }
    }, [cpqState, projectId]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        // Auto-focus input after messages update (unless uploading)
        if (!isUploading && !isLoading && inputRef.current) {
            inputRef.current.focus();
        }
    }, [messages, isUploading, isLoading]);

    const debouncedSearch = useCallback((query: string) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        const trimmedQuery = query.trim();
        if (trimmedQuery.length <= 3) {
            setAddressSuggestions([]);
            return;
        }

        searchTimeoutRef.current = setTimeout(() => {
            setIsSearchingAddress(true);
            fetch(`/api/search-places?query=${encodeURIComponent(trimmedQuery)}`)
                .then(res => res.json())
                .then(data => {
                    setAddressSuggestions(data.results || []);
                    setIsSearchingAddress(false);
                })
                .catch(() => setIsSearchingAddress(false));
        }, 300);
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            let text = '';

            // Check if it's a PDF
            if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                // Parse PDF using API
                const formData = new FormData();
                formData.append('file', file);

                const pdfRes = await fetch('/api/parse-pdf', {
                    method: 'POST',
                    body: formData
                });

                if (!pdfRes.ok) {
                    throw new Error('Failed to parse PDF');
                }

                const pdfData = await pdfRes.json();
                text = pdfData.text;
            } else {
                // Read as text for .txt, .md files
                const reader = new FileReader();
                text = await new Promise<string>((resolve, reject) => {
                    reader.onload = (event) => resolve(event.target?.result as string);
                    reader.onerror = reject;
                    reader.readAsText(file);
                });
            }

            // Send to AI for extraction
            const userMsg: Message = { role: 'user', content: `[Document Uploaded: ${file.name}]` };
            setMessages(prev => [...prev, userMsg]);

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Analyze this brief and extract project details: ${text.slice(0, 5000)}`,
                    history: messages,
                    currentState: cpqState,
                    selectedModel
                })
            });

            const data = await res.json();
            setIsUploading(false);
            if (data.message) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.message, nextStep: data.nextStep, thinking: data.thinking, suggestedOptions: data.suggestedOptions }]);
            }
            if (data.updatedParams) {
                const newState = { ...cpqState, ...data.updatedParams };
                setCpqState(newState);
                onUpdate(newState);
            }
        } catch (err) {
            console.error(err);
            setIsUploading(false);
            setMessages(prev => [...prev, { role: 'assistant', content: "I had trouble reading that file. Could you try a different format or paste the text directly?" }]);
        }
    };

    const handleSend = async (text: string, isAddressSelection = false) => {
        if (!text.trim()) return;

        // If this is an address selection (from autocomplete), extract just the address portion
        let updatedText = text;
        let currentStateToSend = cpqState;

        if (isAddressSelection && addressSuggestions.length > 0) {
            const selected = addressSuggestions.find(item => item.display_name === text);
            if (selected) {
                // Parse the display_name to extract just the address portion
                // Format is typically: "Venue Name - Description... | Additional: Address, City, State Zip"
                // Or: "Title: Description... City, State Zip"
                const displayName = selected.display_name;
                
                // Try to extract address after common patterns
                let cleanAddress = displayName;
                
                // Look for patterns like "768 5th Ave, New York, NY 10019" at the end
                const zipMatch = displayName.match(/[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}/);
                if (zipMatch) {
                    // Use the portion containing the address (usually after the last pipe or colon, or containing the zip)
                    const addressPart = zipMatch[0].trim();
                    // Also extract venue name from the beginning
                    const venueName = displayName.split(/[|:]/)[0].trim().split(/[:,-]/)[0].trim();
                    
                    const newState = { ...cpqState, clientName: venueName, address: addressPart };
                    setCpqState(newState);
                    onUpdate(newState);
                    updatedText = addressPart;
                    currentStateToSend = newState;
                } else {
                    // Fallback: use last 3 parts as address
                    const parts = displayName.split(',');
                    if (parts.length >= 3) {
                        const venueName = parts[0].trim().split(/[|-]/)[0].trim();
                        const addressPart = parts.slice(-3).join(',').trim();
                        
                        const newState = { ...cpqState, clientName: venueName, address: addressPart };
                        setCpqState(newState);
                        onUpdate(newState);
                        updatedText = addressPart;
                        currentStateToSend = newState;
                    } else {
                        // Just use the whole thing but clean up
                        const venueName = displayName.split(/[|-]/)[0].trim();
                        const newState = { ...cpqState, clientName: venueName, address: displayName };
                        setCpqState(newState);
                        onUpdate(newState);
                        updatedText = displayName;
                        currentStateToSend = newState;
                    }
                }
            }
        }

        setAddressSuggestions([]);
        const userMsg: Message = { role: 'user', content: updatedText };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // Client-side extraction for number fields to prevent loops
        let extractedValue: any = null;
        if (widgetDef && widgetDef.type === 'number') {
            const numValue = parseFloat(updatedText);
            if (!isNaN(numValue)) {
                extractedValue = { [widgetDef.id]: numValue };
            }
        }

        // Save User Message to DB
        if (projectId) {
            fetch(`/api/projects/${projectId}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userMsg)
            }).catch(e => console.error("Failed to log user message", e));
        }

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: updatedText,  // Use updatedText which contains clean address
                    history: [...messages, userMsg],
                    currentState: currentStateToSend,
                    selectedModel
                })
            });

            if (!res.ok) throw new Error('API Error');

            const data = await res.json();
            setIsLoading(false);

            // Apply client-side extracted value first, then AI's updates
            if (extractedValue) {
                data.updatedParams = { ...extractedValue, ...data.updatedParams };
            }

            if (data.updatedParams && Object.keys(data.updatedParams).length > 0) {
                const newState = { ...currentStateToSend, ...data.updatedParams };
                // Special handling for screens to ensure it's always an array if present
                if (data.updatedParams.screens && Array.isArray(data.updatedParams.screens)) {
                    newState.screens = data.updatedParams.screens;
                }
                setCpqState(newState);
                onUpdate(newState);
            }

            if (data.message) {
                const assistantMsg = {
                    role: 'assistant' as const,
                    content: data.message,
                    nextStep: data.nextStep,
                    thinking: data.thinking,
                    suggestedOptions: data.suggestedOptions
                };
                setMessages(prev => [...prev, assistantMsg]);

                // AUTO-SEARCH: If the AI transitions to address, trigger the search immediately
                // using the user's input or the extracted client name.
                if (data.nextStep === 'address') {
                    const searchQuery = data.updatedParams?.clientName || data.updatedParams?.address || text;
                    if (searchQuery) {
                        debouncedSearch(searchQuery);
                    }
                }

                // Save Assistant Message to DB
                if (projectId) {
                    fetch(`/api/projects/${projectId}/message`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(assistantMsg)
                    }).catch(e => console.error("Failed to log assistant message", e));
                }
            }

        } catch (error) {
            console.error('Chat Error:', error);
            setIsLoading(false);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to the ANC brain. Please check your connection." }]);
        }
    };

    const handleNewProposal = () => {
        // Save current proposal to history before clearing
        if (messages.length > 1) {
            const newProposal: SavedProposal = {
                id: Math.random().toString(36).substr(2, 9),
                name: cpqState.clientName || cpqState.projectName || 'Untitled Proposal',
                timestamp: Date.now(),
                messages,
                state: cpqState
            };
            const updatedHistory = [newProposal, ...savedProposals];
            setSavedProposals(updatedHistory);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        }

        setMessages([getInitialMessage()]);
        setCpqState({});

        // Force full reset in parent component
        onUpdate({
            clientName: '',
            address: '',
            projectName: '',
            productClass: 'Scoreboard',
            widthFt: 0,
            heightFt: 0,
            pixelPitch: 10,
            environment: 'Indoor',
            shape: 'Flat',
            access: 'Front',
            complexity: 'Standard'
        });
        localStorage.removeItem(STORAGE_KEY);
    };

    const handleLoadProposal = (prop: SavedProposal) => {
        setMessages(prop.messages);
        setCpqState(prop.state);
        onUpdate(prop.state);
        setShowHistory(false);
    };

    const currentNextStep = messages[messages.length - 1]?.nextStep;
    const widgetDef = WIZARD_QUESTIONS.find(q => q.id === currentNextStep);

    return (
        <div className="flex flex-col h-full bg-[#0a0a0f] overflow-hidden relative border-r border-slate-800">
            {/* PROGRESS HEADER */}
            <div className="bg-[#0a0a0f] border-b border-white/5 p-4 z-20">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <div className="px-2 py-0.5 bg-[#003D82] rounded text-[10px] font-black text-white tracking-widest leading-none">
                            {progress}%
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Complete</span>
                    </div>
                    <div className="flex gap-2">
                        <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
                        <button onClick={() => setShowHistory(!showHistory)} className="p-1.5 text-slate-500 hover:text-white transition-colors">
                            <History size={16} />
                        </button>
                        <button onClick={handleNewProposal} className="p-1.5 text-slate-500 hover:text-white transition-colors">
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div
                        className="h-full bg-[#003D82] transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Milestone Chips */}
                <div className="flex justify-between">
                    {PROGRESS_STEPS.map((step) => {
                        const status = getStepStatus(step);
                        return (
                            <div key={step.id} className="flex flex-col items-center gap-1.5 opacity-80">
                                <div className={clsx(
                                    "w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-500",
                                    status === 'complete' ? "bg-blue-600 border-blue-500 text-white" :
                                        status === 'active' ? "border-blue-400 bg-blue-500/10 text-blue-400 animate-pulse" :
                                            "border-slate-700 text-slate-700"
                                )}>
                                    {status === 'complete' ? <CheckCircle2 size={12} /> : <div className="w-1 h-1 rounded-full bg-current" />}
                                </div>
                                <span className={clsx(
                                    "text-[8px] font-black tracking-widest uppercase",
                                    status === 'complete' ? "text-slate-300" :
                                        status === 'active' ? "text-blue-400" :
                                            "text-slate-600"
                                )}>{step.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* History Overlay */}
            {showHistory && (
                <div className="absolute inset-0 bg-slate-900/95 z-30 p-6 backdrop-blur-sm overflow-y-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <History size={16} /> Previous Configurations
                        </h2>
                        <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                    </div>
                    <div className="space-y-3">
                        {savedProposals.length === 0 && <p className="text-slate-500 text-xs italic">No saved configs yet...</p>}
                        {savedProposals.map((p) => (
                            <button key={p.id} onClick={() => handleLoadProposal(p)} className="w-full bg-slate-800/50 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/50 text-left transition-all group">
                                <p className="text-white font-bold text-sm mb-1 group-hover:text-blue-400 transition-colors uppercase">{p.name}</p>
                                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">{new Date(p.timestamp).toLocaleString()}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                {messages.map((msg, i) => (
                    <div key={i} className={clsx("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
                        <div className="flex items-center gap-2 mb-1 px-2">
                            {msg.role === 'assistant' ? (
                                <>
                                    <div className="w-6 h-6 bg-blue-600/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                                        <Bot size={14} className="text-blue-400" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ANC Engineer</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Executive</span>
                                    <div className="w-6 h-6 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                                        <User size={14} className="text-slate-400" />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className={clsx(
                            "max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm",
                            msg.role === 'user'
                                ? "bg-[#003D82] text-white border border-blue-900/50"
                                : "bg-[#1a1a24] text-slate-200 border border-slate-700/50"
                        )}>
                            <div className="whitespace-pre-wrap font-medium">{msg.content}</div>

                            {/* VENUE VERIFIED CARD - Show only once when address is first confirmed */}
                            {msg.role === 'assistant' && i === messages.length - 1 && msg.nextStep !== 'address' && cpqState.address && !msg.content.includes('Location Verified') && (
                                <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-start gap-3 animate-in zoom-in-95 duration-500">
                                    <div className="bg-green-500/20 p-2 rounded-lg">
                                        <CheckCircle2 size={16} className="text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Location Verified</span>
                                            <div className="h-px flex-1 bg-green-500/20" />
                                        </div>
                                        <p className="text-xs text-slate-300 font-bold leading-tight">{cpqState.clientName || 'Venue'}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">{cpqState.address}</p>
                                    </div>
                                </div>
                            )}

                            {/* VISUAL CONFIRMATION CARD (Value-Add) */}
                            {msg.nextStep === 'confirm' && (
                                <div className="mt-4 bg-slate-900/50 rounded-xl p-4 border border-blue-500/30 font-mono text-xs text-blue-200">
                                    <div className="flex justify-between items-center mb-2 border-b border-blue-500/20 pb-2">
                                        <span className="font-bold text-blue-400">CONFIRM CONFIGURATION</span>
                                        <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold">DRAFT</span>
                                    </div>
                                    <div className="space-y-1 mb-3">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Dimensions:</span>
                                            <span className="font-bold text-white">{cpqState.widthFt}' W x {cpqState.heightFt}' H</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Pixel Pitch:</span>
                                            <span className="font-bold text-white">{cpqState.pixelPitch}mm</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Product:</span>
                                            <span className="font-bold text-white">{cpqState.productClass} ({cpqState.environment})</span>
                                        </div>
                                        {/* Power Calculation (Value-Add) */}
                                        <div className="flex justify-between pt-2 border-t border-blue-500/20 mt-2">
                                            <span className="text-amber-400 font-bold">Est. Power:</span>
                                            <span className="font-bold text-amber-300">
                                                {Math.round(((cpqState.widthFt || 0) * (cpqState.heightFt || 0) * (cpqState.environment === 'Outdoor' ? 60 : 30)) / 120)} Amps (120V)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* EXPERT WIDGETS */}
                            {msg.role === 'assistant' && i === messages.length - 1 && (msg.suggestedOptions || widgetDef) && (
                                <div className="mt-4 pt-4 border-t border-slate-700/30">
                                    {((msg.suggestedOptions && msg.suggestedOptions.length > 0) || (widgetDef && widgetDef.type === 'select' && widgetDef.options)) && (
                                        <div className="flex flex-wrap gap-2">
                                            {((msg.suggestedOptions && msg.suggestedOptions.length > 0) ? msg.suggestedOptions : (widgetDef?.options || [])).map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => handleSend(String(opt.value))}
                                                    className="px-4 py-1.5 bg-[#0f1420] hover:bg-[#003D82] text-slate-300 hover:text-white border border-slate-700 hover:border-[#003D82] rounded-full text-[11px] font-bold transition-all shadow-sm flex items-center gap-1.5 group"
                                                >
                                                    {opt.label} <ChevronRight size={10} className="text-slate-600 group-hover:text-white" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {widgetDef && widgetDef.type === 'number' && (!msg.suggestedOptions || msg.suggestedOptions.length === 0) && (
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="0"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSend((e.target as HTMLInputElement).value);
                                                        (e.target as HTMLInputElement).value = '';
                                                    }
                                                }}
                                                className="w-24 bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-slate-700 font-bold"
                                            />
                                            <button
                                                onClick={(e) => {
                                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                    handleSend(input.value);
                                                    input.value = '';
                                                }}
                                                className="px-4 py-2 bg-[#003D82] hover:bg-[#002a5c] text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    )}
                                    {widgetDef && widgetDef.type === 'text' && (!msg.suggestedOptions || msg.suggestedOptions.length === 0) && (
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder={widgetDef.id === 'clientName' ? "Enter venue or client name..." : "Enter details..."}
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const inputEl = e.currentTarget as HTMLInputElement;
                                                            const val = inputEl.value;
                                                            if (widgetDef.id === 'clientName' && val.trim()) {
                                                                // Auto-search for address when client name is entered
                                                                handleSend(val);
                                                                inputEl.value = '';
                                                                // Trigger address search
                                                                debouncedSearch(val);
                                                            } else {
                                                                handleSend(val);
                                                                inputEl.value = '';
                                                            }
                                                            setAddressSuggestions([]);
                                                        }
                                                    }}
                                                    className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-slate-700 font-bold"
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                        if (widgetDef.id === 'clientName' && input.value.trim()) {
                                                            // Auto-search for address when client name is entered
                                                            handleSend(input.value);
                                                            debouncedSearch(input.value);
                                                        } else {
                                                            handleSend(input.value);
                                                        }
                                                        setAddressSuggestions([]);
                                                        input.value = '';
                                                    }}
                                                    className="px-5 py-2 bg-[#003D82] hover:bg-[#002a5c] text-white rounded-lg text-[10px] font-black hover:bg-blue-500 transition-colors uppercase tracking-widest shadow-lg"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                            
                                            {/* AUTO-SEARCH RESULTS CARD */}
                                            {(isSearchingAddress || (addressSuggestions.length > 0 && cpqState.clientName)) && (
                                                <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                                                    {isSearchingAddress && (
                                                        <div className="bg-[#0f1420] border border-blue-500/30 rounded-xl p-4 flex items-center gap-4">
                                                            <div className="relative">
                                                                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin"></div>
                                                                <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-t-blue-300/50 rounded-full animate-spin [animation-duration:1.5s]"></div>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Searching Address...</p>
                                                                <p className="text-[10px] text-slate-500">Looking up {cpqState.clientName || 'venue'} in our database</p>
                                                            </div>
                                                            <div className="ml-auto flex gap-1">
                                                                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0s]"></div>
                                                                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                                                                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {addressSuggestions.length > 0 && !isSearchingAddress && (
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest flex items-center gap-2">
                                                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                                                {addressSuggestions.length} verified addresses found
                                                            </p>
                                                            <div className="bg-slate-900 border border-slate-600 rounded-xl overflow-hidden shadow-2xl">
                                                                {addressSuggestions.map((item, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => {
                                                                            handleSend(item.display_name, true);
                                                                            setAddressSuggestions([]);
                                                                        }}
                                                                        className="w-full text-left p-4 hover:bg-slate-800 transition-all border-b border-slate-800 last:border-0 group"
                                                                    >
                                                                        <div className="flex items-start gap-3">
                                                                            <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                                                                                <MapPin className="w-4 h-4 text-blue-400" />
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <p className="text-xs text-white font-bold group-hover:text-blue-300 transition-colors">
                                                                                    {item.display_name.split(',')[0].trim()}
                                                                                </p>
                                                                                <p className="text-[10px] text-slate-500 mt-0.5">
                                                                                    {item.display_name.split(',').slice(1).join(',').trim()}
                                                                                </p>
                                                                            </div>
                                                                            <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {msg.thinking && msg.role === 'assistant' && (
                            <div className="px-5 mt-1 border-l border-slate-700/50">
                                <button
                                    onClick={() => setExpandedThinking(expandedThinking === i ? null : i)}
                                    className="flex items-center gap-2 group"
                                >
                                    <div className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-blue-500 transition-colors" />
                                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest group-hover:text-slate-400 transition-colors">
                                        {expandedThinking === i ? 'Hide Reasoning' : 'Show Expert Reasoning'}
                                    </span>
                                </button>
                                {expandedThinking === i && (
                                    <div className="mt-2 text-[10px] text-slate-500 font-medium leading-relaxed max-w-[90%] bg-slate-800/20 p-2 rounded-lg border border-slate-700/20 animate-in fade-in slide-in-from-top-1">
                                        {msg.thinking}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {(isLoading || isUploading) && (
                    <div className="flex items-start gap-3 mt-4">
                        <div className="w-8 h-8 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                            <Bot size={16} className="text-blue-400" />
                        </div>
                        <div className="bg-slate-800/40 rounded-2xl px-5 py-3 border border-slate-700/30 flex items-center gap-4">
                            <div className="flex gap-1.5">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                                {isUploading ? 'Analyzing Brief...' : 'Expert Estimator Thinking'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0a0a0f] border-t border-white/5 space-y-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
                        title="Upload client brief"
                    >
                        <Upload size={18} />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".txt,.md,.pdf"
                        onChange={handleFileUpload}
                    />
                    <div className="flex-1 relative">
                        <div className="relative flex items-center">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                            placeholder={isUploading ? "Extracting project data..." : "Reply to the ANC Engineer..."}
                            disabled={isLoading || isUploading}
                            className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-5 py-3 text-sm focus:ring-1 focus:ring-blue-500/50 outline-none disabled:opacity-50 placeholder:text-slate-600 font-medium shadow-inner"
                        />
                        <button
                            onClick={() => handleSend(input)}
                            disabled={isLoading || isUploading || !input.trim()}
                            className="absolute right-2 p-2 bg-[#003D82] hover:bg-[#002a5c] text-white rounded-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                            <Send size={16} />
                        </button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center">
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">ANC Proposal Engine v4.8</p>
                </div>
            </div>
        </div>
    );
}
