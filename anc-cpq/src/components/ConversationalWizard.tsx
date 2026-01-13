"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
    Send,
    Loader2,
    Bot,
    User,
    Upload,
    Plus,
    History,
    FileText,
    X,
    Trash2,
    CheckCircle2,
    ChevronRight,
    MapPin,
} from "lucide-react";
import { WIZARD_QUESTIONS } from "../lib/wizard-questions";
import { CPQInput } from "../lib/types";
import { ModelSelector } from "./ModelSelector";
import { DEFAULT_MODEL } from "../lib/ai-models";
import clsx from "clsx";

interface ConversationalWizardProps {
    onComplete: (params: Partial<CPQInput>) => void;
    onUpdate: (params: Partial<CPQInput>) => void;
    onProjectInit?: (id: number) => void;
}

interface Message {
    role: "user" | "assistant";
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
    askedQuestions?: Set<string>;
}

const STORAGE_KEY = "anc_cpq_session";
const HISTORY_KEY = "anc_cpq_history";

const SHOW_REASONING = process.env.NEXT_PUBLIC_SHOW_REASONING !== "false";

const INITIAL_CPQ_STATE: Partial<CPQInput> = {
    clientName: "",
    address: "",
    projectName: "",
};

const getInitialMessage = (): Message => ({
    role: "assistant",
    content: "Hey! Ready to configure a new display project. Just tell me the venue and I'll handle the rest — takes about 3 minutes. Let's go?",
    thinking: SHOW_REASONING
        ? "System initialized. Waiting for user to start the wizard flow."
        : undefined,
    suggestedOptions: [
        { value: "Proceed", label: "Start New Quote" }
    ]
});

const PROGRESS_STEPS = [
    { id: "metadata", label: "CLIENT", fields: ["clientName", "address"] },
    { id: "display", label: "DISPLAY", fields: ["productClass", "pixelPitch", "widthFt", "heightFt"] },
    { id: "config", label: "DETAILS", fields: ["environment", "shape", "access", "mountingType", "structureCondition"] },
    { id: "project", label: "LOGISTICS", fields: ["laborType", "powerDistance", "permits", "controlSystem", "bondRequired", "complexity", "unitCost", "targetMargin", "serviceLevel"] },
];

// Normalization helper for AI parameters
const normalizeParams = (params: any) => {
    if (!params) return {};
    const normalized: any = {};
    const aliasMap: Record<string, string> = {
        'pitch': 'pixelPitch',
        'width': 'widthFt',
        'height': 'heightFt',
        'class': 'productClass',
        'labor': 'laborType',
        'bond': 'bondRequired',
        'controls': 'controlSystem',
        'structure': 'structureCondition',
        'mounting': 'mountingType',
        'power': 'powerDistance',
        'permit': 'permits',
        'cost': 'unitCost',
        'margin': 'targetMargin',
        'service': 'serviceLevel'
    };

    Object.entries(params).forEach(([key, val]) => {
        // 1. Convert snake_case to camelCase
        let camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

        // 2. Map aliases and handle casing
        const lowerKey = camelKey.toLowerCase();
        if (aliasMap[lowerKey]) {
            camelKey = aliasMap[lowerKey];
        } else {
            // Check for direct match with standard IDs if not in aliasMap
            const standardIds = WIZARD_QUESTIONS.map(q => q.id);
            const match = standardIds.find(id => id.toLowerCase() === lowerKey);
            if (match) camelKey = match;
        }

        normalized[camelKey] = val;
    });
    return normalized;
};

export function ConversationalWizard({
    onComplete,
    onUpdate,
    onProjectInit,
}: ConversationalWizardProps) {
    const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [cpqState, setCpqState] = useState<Partial<CPQInput>>(INITIAL_CPQ_STATE);
    const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
    const [showHistory, setShowHistory] = useState(false);
    const [savedProposals, setSavedProposals] = useState<SavedProposal[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
    const [showAddressInput, setShowAddressInput] = useState(false);
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);
    const [expandedThinking, setExpandedThinking] = useState<number | null>(
        null,
    );
    const [streamingThinking, setStreamingThinking] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [projectId, setProjectId] = useState<number | null>(null);
    const [searchStep, setSearchStep] = useState(1);
    const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());
    const [lastFieldUpdated, setLastFieldUpdated] = useState<string | null>(null);

    // Refs
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch All Projects (History)
    const fetchHistory = useCallback(async () => {
        try {
            const res = await fetch("/api/projects");
            if (res.ok) {
                const data = await res.json();
                const historyAsProposals: SavedProposal[] = data.map((p: any) => ({
                    id: p.id.toString(),
                    name: p.client_name || "Untitled Project",
                    timestamp: new Date(p.created_at).getTime(),
                    state: p.state || {},
                    messages: [] // Don't need all messages for the list
                }));
                setSavedProposals(historyAsProposals);
            }
        } catch (e) {
            console.error("Failed to fetch project history", e);
        }
    }, []);

    // Load session from Server (DB) or Create New
    const initSession = useCallback(async () => {
        const savedId = localStorage.getItem("anc_project_id");
        if (savedId) {
            try {
                // Resume existing session
                const res = await fetch(`/api/projects/${savedId}`);
                if (res.ok) {
                    const data = await res.json();
                    setProjectId(data.id);
                    if (onProjectInit) onProjectInit(data.id);
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
            const res = await fetch("/api/projects", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setProjectId(data.id);
                if (onProjectInit) onProjectInit(data.id);
                localStorage.setItem("anc_project_id", data.id.toString());
            }
        } catch (e) {
            console.error("Failed to create project:", e);
        }
    }, [onUpdate, onProjectInit]);

    useEffect(() => {
        initSession();
        fetchHistory();
    }, [initSession, fetchHistory]);

    // Handle history toggle
    useEffect(() => {
        if (showHistory) {
            fetchHistory();
        }
    }, [showHistory, fetchHistory]);

    // Save state to Server (DB) on changes
    useEffect(() => {
        if (projectId && Object.keys(cpqState).length > 0) {
            const timeoutId = setTimeout(() => {
                fetch(`/api/projects/${projectId}/state`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(cpqState),
                }).catch((e) => console.error("Failed to auto-save state", e));
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
            setSearchStep(1);
            return;
        }

        setSearchStep(1);
        searchTimeoutRef.current = setTimeout(() => {
            setIsSearchingAddress(true);
            setSearchStep(2);
            fetch(
                `/api/search-places?query=${encodeURIComponent(trimmedQuery)}`,
            )
                .then((res) => res.json())
                .then((data) => {
                    setSearchStep(3);
                    setAddressSuggestions(data.results || []);
                    setIsSearchingAddress(false);
                    setSearchStep(4);
                })
                .catch(() => {
                    setIsSearchingAddress(false);
                    setSearchStep(1);
                });
        }, 300);
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            let text = "";

            // Check if it's a PDF
            if (
                file.type === "application/pdf" ||
                file.name.toLowerCase().endsWith(".pdf")
            ) {
                // Parse PDF using API
                const formData = new FormData();
                formData.append("file", file);

                const pdfRes = await fetch("/api/parse-pdf", {
                    method: "POST",
                    body: formData,
                });

                if (!pdfRes.ok) {
                    throw new Error("Failed to parse PDF");
                }

                const pdfData = await pdfRes.json();
                text = pdfData.text;
            } else {
                // Read as text for .txt, .md files
                const reader = new FileReader();
                text = await new Promise<string>((resolve, reject) => {
                    reader.onload = (event) =>
                        resolve(event.target?.result as string);
                    reader.onerror = reject;
                    reader.readAsText(file);
                });
            }

            // Send to AI for extraction
            const userMsg: Message = {
                role: "user",
                content: `[Document Uploaded: ${file.name}]`,
            };
            setMessages((prev) => [...prev, userMsg]);

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: `Analyze this brief and extract project details: ${text.slice(0, 5000)}`,
                    history: messages,
                    currentState: cpqState,
                    selectedModel,
                }),
            });

            const data = await res.json();
            setIsUploading(false);
            if (data.message) {
                // Track the question that was asked to prevent duplicates
                if (data.nextStep) {
                    setAskedQuestions(prev => new Set([...prev, data.nextStep]));
                }
                
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: data.message,
                        nextStep: data.nextStep,
                        thinking: SHOW_REASONING ? data.thinking : undefined,
                        suggestedOptions: data.suggestedOptions,
                    },
                ]);
            }
            if (data.updatedParams) {
                // Normalize keys and handle common AI aliases for progress tracking
                const normalizedParams: any = {};
                const aliasMap: Record<string, string> = {
                    'pitch': 'pixelPitch',
                    'width': 'widthFt',
                    'height': 'heightFt',
                    'class': 'productClass',
                    'labor': 'laborType',
                    'bond': 'bondRequired',
                    'controls': 'controlSystem'
                };

                Object.entries(data.updatedParams).forEach(([key, val]) => {
                    // 1. Convert snake_case to camelCase
                    let camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

                    // 2. Map aliases to standard field IDs
                    if (aliasMap[camelKey.toLowerCase()]) {
                        camelKey = aliasMap[camelKey.toLowerCase()];
                    }

                    normalizedParams[camelKey] = val;
                });

                const newState = { ...cpqState, ...normalizedParams };
                setCpqState(newState);
                onUpdate(newState);
            }
        } catch (err) {
            console.error(err);
            setIsUploading(false);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "I had trouble reading that file. Could you try a different format or paste the text directly?",
                },
            ]);
        }
    };

    const handleSend = async (text: string, isAddressSelection = false) => {
        if (!text.trim()) return;

        // Get current widget definition BEFORE using it
        const currentNextStep = messages[messages.length - 1]?.nextStep;
        const widgetDef = WIZARD_QUESTIONS.find((q) => q.id === currentNextStep);

        // If this is an address selection (from autocomplete), extract just the address portion
        let updatedText = text;
        let currentStateToSend = cpqState;

        if (isAddressSelection && addressSuggestions.length > 0) {
            const selected = addressSuggestions.find(
                (item) => item.display_name === text,
            );
            if (selected) {
                // Parse the display_name to extract just the address portion
                // Format is typically: "Venue Name - Description... | Additional: Address, City, State Zip"
                // Or: "Title: Description... City, State Zip"
                const displayName = selected.display_name;

                // Try to extract address after common patterns
                let cleanAddress = displayName;

                // Look for patterns like "768 5th Ave, New York, NY 10019" at the end
                const zipMatch = displayName.match(
                    /[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}/,
                );
                if (zipMatch) {
                    // Use the portion containing the address (usually after the last pipe or colon, or containing the zip)
                    const addressPart = zipMatch[0].trim();
                    // Also extract venue name from the beginning
                    const venueName = displayName
                        .split(/[|:]/)[0]
                        .trim()
                        .split(/[:,-]/)[0]
                        .trim();

                        const productClass = cpqState.productClass || 'Display';
                        const newState = {
                            ...cpqState,
                            clientName: venueName,
                            address: addressPart,
                            projectName: `${venueName} - ${productClass}`,
                        };
                        setCpqState(newState);
                        onUpdate(newState);
                    updatedText = addressPart;
                    currentStateToSend = newState;
                } else {
                    // Fallback: use last 3 parts as address
                    const parts = displayName.split(",");
                    if (parts.length >= 3) {
                        const venueName = parts[0]
                            .trim()
                            .split(/[|-]/)[0]
                            .trim();
                        const addressPart = parts.slice(-3).join(",").trim();

                        const newState = {
                            ...cpqState,
                            clientName: venueName,
                            address: addressPart,
                        };
                        setCpqState(newState);
                        onUpdate(newState);
                        updatedText = addressPart;
                        currentStateToSend = newState;
                    } else {
                        // Just use the whole thing but clean up
                        const venueName = displayName.split(/[|-]/)[0].trim();
                        const productClass = cpqState.productClass || 'Display';
                        const newState = {
                            ...cpqState,
                            clientName: venueName,
                            address: displayName,
                            projectName: `${venueName} - ${productClass}`,
                        };
                        setCpqState(newState);
                        onUpdate(newState);
                        updatedText = displayName;
                        currentStateToSend = newState;
                    }
                }
            }
        }

        const userMsg: Message = { role: "user", content: updatedText };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        // Client-side extraction for number fields to prevent loops
        let extractedValue: any = null;
        if (widgetDef && widgetDef.type === "number") {
            const numValue = parseFloat(updatedText);
            if (!isNaN(numValue)) {
                extractedValue = { [widgetDef.id]: numValue };
            }
        }

        // Save User Message to DB
        if (projectId) {
            fetch(`/api/projects/${projectId}/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userMsg),
            }).catch((e) => console.error("Failed to log user message", e));
        }

        try {
            // Try streaming first as default professional behavior
            if (process.env.NEXT_PUBLIC_ENABLE_STREAMING !== "false") {
                await handleStreamingChat(updatedText, currentStateToSend);
                return;
            }
            
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: updatedText,
                    history: messages,
                    currentState: { ...currentStateToSend, askedQuestions: Array.from(askedQuestions) },
                    selectedModel,
                }),
            });

            if (!res.ok) throw new Error("API Error");

            const data = await res.json();
            setIsLoading(false);

            // Apply client-side extracted value first, then AI's updates
            if (extractedValue) {
                data.updatedParams = {
                    ...extractedValue,
                    ...data.updatedParams,
                };
            }

            if (
                data.updatedParams &&
                Object.keys(data.updatedParams).length > 0
            ) {
                const normalized = normalizeParams(data.updatedParams);
                
                // Track the last field updated to control UI signals
                const updatedKeys = Object.keys(normalized);
                if (updatedKeys.length > 0) {
                    setLastFieldUpdated(updatedKeys[updatedKeys.length - 1]);
                }

                const newState = {
                    ...currentStateToSend,
                    ...normalized,
                };

                // Sync projectName when clientName or productClass changes
                if (normalized.clientName || normalized.productClass) {
                    const clientName = normalized.clientName || currentStateToSend.clientName || 'Unknown';
                    const productClass = normalized.productClass || currentStateToSend.productClass || 'Display';
                    newState.projectName = `${clientName} - ${productClass}`;
                }

                // Special handling for screens
                if (normalized.screens && Array.isArray(normalized.screens)) {
                    newState.screens = normalized.screens;
                }
                setCpqState(newState);
                onUpdate(newState);
            }

            if (data.message) {
                // GUARDRAIL: Validate nextStep against known field IDs
                const VALID_FIELD_IDS = WIZARD_QUESTIONS.map(q => q.id);
                let validatedNextStep = data.nextStep;

                // Use merged state (includes just-updated params) for accurate field detection
                const mergedState = {
                    ...cpqState,
                    ...normalizeParams(data.updatedParams || {})
                };

                if (data.nextStep && !VALID_FIELD_IDS.includes(data.nextStep) && data.nextStep !== 'confirm') {
                    console.warn(`⚠️ AI hallucinated unknown field '${data.nextStep}'. Falling back to next incomplete field.`);
                    // Find next incomplete field using MERGED state (not stale cpqState)
                    const nextIncomplete = WIZARD_QUESTIONS.find(q => {
                        const currentVal = mergedState[q.id as keyof CPQInput];
                        // 0 is a valid value for numeric fields.
                        return currentVal === undefined || currentVal === null || currentVal === '';
                    });
                    validatedNextStep = nextIncomplete?.id || 'confirm';
                }

                // Defensive: If next step is numeric, FORCE clear options
                let finalOptions = data.suggestedOptions;
                const nextStepDef = WIZARD_QUESTIONS.find(q => q.id === validatedNextStep);
                if (nextStepDef && nextStepDef.type === 'number') {
                    finalOptions = [];
                }

                const assistantMsg = {
                    role: "assistant" as const,
                    content: data.message,
                    nextStep: validatedNextStep,
                    thinking: SHOW_REASONING ? data.thinking : undefined,
                    suggestedOptions: finalOptions,
                };
                setMessages((prev) => [...prev, assistantMsg]);

                // Track asked questions to prevent repeat prompts
                if (validatedNextStep) {
                    setAskedQuestions((prev) => new Set([...prev, validatedNextStep]));
                }

                // Save Assistant Message to DB
                if (projectId) {
                    fetch(`/api/projects/${projectId}/message`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(assistantMsg),
                    }).catch((e) =>
                        console.error("Failed to log assistant message", e),
                    );
                }
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setIsLoading(false);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "Hmm, something went wrong on my end. Try sending that again, or refresh if it keeps happening.",
                },
            ]);
        }
    };

    const handleStreamingChat = async (text: string, currentStateToSend: any) => {
        setIsStreaming(true);
        setStreamingThinking('');
        
        try {
            const response = await fetch("/api/chat/stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    history: messages,
                    currentState: { ...currentStateToSend, askedQuestions: Array.from(askedQuestions) },
                    selectedModel,
                }),
            });

            if (!response.ok) throw new Error('Streaming failed');
            
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let finalContent = '';
            let finalThinking = '';
            let finalNextStep = '';
            let finalSuggestedOptions = [];
            let finalUpdatedParams = {};
            
            if (reader) {
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
                                
                                if (parsed.type === 'thinking') {
                                    setStreamingThinking(parsed.content);
                                } else if (parsed.type === 'content') {
                                    finalContent = parsed.content;
                                } else if (parsed.type === 'complete') {
                                    // Extraction logic to ensure ZERO JSON leaks into the UI
                                    finalContent = parsed.message || parsed.content || finalContent;
                                    
                                    // If we somehow still have raw JSON in finalContent, force extract the 'message' field
                                    if (finalContent.includes('{') || finalContent.trim().startsWith('{')) {
                                        try {
                                            const innerParsed = JSON.parse(finalContent.match(/\{[\s\S]*\}/)?.[0] || '{}');
                                            if (innerParsed.message) finalContent = innerParsed.message;
                                        } catch (e) {
                                            // Final fallback: strip anything between braces
                                            finalContent = finalContent.replace(/\{[\s\S]*\}/g, '').trim();
                                        }
                                    }

                                    finalThinking = parsed.reasoning || "";
                                    finalNextStep = parsed.nextStep || "";
                                    finalSuggestedOptions = parsed.suggestedOptions || [];
                                    finalUpdatedParams = parsed.updatedParams || {};
                                }
                            } catch (e) {
                                console.error('Error parsing streaming data:', e);
                            }
                        }
                    }
                }
            }
            
            // Process the final response
            setStreamingThinking('');
            setIsStreaming(false);
            setIsLoading(false);

            if (Object.keys(finalUpdatedParams).length > 0) {
                const normalized = normalizeParams(finalUpdatedParams);
                const newState = { ...currentStateToSend, ...normalized };
                setCpqState(newState);
                onUpdate(newState);
            }
            
            const finalMessage: Message = {
                role: "assistant",
                content: finalContent,
                nextStep: finalNextStep,
                suggestedOptions: finalSuggestedOptions,
                thinking: SHOW_REASONING ? finalThinking : undefined,
            };
            
            setMessages(prev => [...prev, finalMessage]);

            if (finalNextStep) {
                setAskedQuestions((prev) => new Set([...prev, finalNextStep]));
            }

            // Save Assistant Message to DB
            if (projectId) {
                fetch(`/api/projects/${projectId}/message`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(finalMessage),
                }).catch((e) =>
                    console.error("Failed to log assistant message", e),
                );
            }
            
        } catch (error) {
            console.error('Streaming chat error:', error);
        } finally {
            setIsStreaming(false);
            setStreamingThinking('');
        }
    };

    const handleNewProposal = async () => {
        // Clear local project ID so initSession creates a new one
        localStorage.removeItem("anc_project_id");
        localStorage.removeItem(STORAGE_KEY);

        setMessages([getInitialMessage()]);
        setCpqState(INITIAL_CPQ_STATE);

        // Force full reset in parent component
        onUpdate(INITIAL_CPQ_STATE);

        // Initialize a totally new session on the server
        try {
            const res = await fetch("/api/projects", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setProjectId(data.id);
                if (onProjectInit) onProjectInit(data.id);
                localStorage.setItem("anc_project_id", data.id.toString());
            }
        } catch (e) {
            console.error("Failed to create new project:", e);
        }
    };

    const handleLoadProposal = async (prop: SavedProposal) => {
        try {
            const res = await fetch(`/api/projects/${prop.id}`);
            if (res.ok) {
                const data = await res.json();
                setProjectId(data.id);
                if (onProjectInit) onProjectInit(data.id);
                localStorage.setItem("anc_project_id", data.id.toString());
                
                if (data.messages && data.messages.length > 0) {
                    setMessages(data.messages);
                } else {
                    setMessages([getInitialMessage()]);
                }
                
                if (data.state) {
                    setCpqState(data.state);
                    onUpdate(data.state);
                }
                setShowHistory(false);
            }
        } catch (e) {
            console.error("Failed to load proposal", e);
            alert("Failed to load project from server");
        }
    };

    const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Don't trigger load when clicking delete
        
        if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) {
            return;
        }

        try {
            const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            if (res.ok) {
                // If it's the current project, reset to new
                if (projectId?.toString() === id) {
                    handleNewProposal();
                }
                // Refresh history
                fetchHistory();
            } else {
                alert("Failed to delete project");
            }
        } catch (e) {
            console.error("Delete error:", e);
        }
    };

    // Compute current step for widget rendering (used in JSX)
    const currentNextStep = messages[messages.length - 1]?.nextStep;
    const widgetDef = WIZARD_QUESTIONS.find((q) => q.id === currentNextStep);

    // Progress calculation
    const totalFields = WIZARD_QUESTIONS.filter(q => q.required).length;
    const filledFields = WIZARD_QUESTIONS.filter(q => {
        if (!q.required) return false;
        const val = cpqState[q.id as keyof CPQInput];
        return val !== undefined && val !== null && val !== '' && val !== 0;
    }).length;
    const progress = Math.round((filledFields / totalFields) * 100);

    // Step status calculation
    const getStepStatus = (step: typeof PROGRESS_STEPS[0]) => {
        const stepFields = step.fields;
        const completedInStep = stepFields.filter(field => {
            const val = cpqState[field as keyof CPQInput];
            return val !== undefined && val !== null && val !== '' && val !== 0;
        }).length;
        
        if (completedInStep === stepFields.length) return 'complete';
        if (completedInStep > 0) return 'active';
        return 'pending';
    };

    return (
        <div className="flex flex-col h-full bg-[#03060a] overflow-hidden relative border-r border-slate-800">
            {/* COMPACT PROGRESS HEADER */}
            <div className="bg-[#03060a] border-b border-white/5 px-5 py-3 z-20">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <div className="px-1.5 py-0.5 bg-[#0047AB] rounded-sm text-[9px] font-black text-white tracking-widest leading-none">
                            {progress}%
                        </div>
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">
                            Verification Progress
                        </span>
                    </div>
                    <div className="flex gap-1.5">
                        <ModelSelector
                            selectedModel={selectedModel}
                            onModelChange={setSelectedModel}
                        />
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="p-1 text-slate-600 hover:text-blue-400 transition-colors"
                        >
                            <History size={14} />
                        </button>
                        <button
                            onClick={handleNewProposal}
                            className="p-1 text-slate-600 hover:text-blue-400 transition-colors shadow-sm"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>

                {/* SLIM Progress Bar */}
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden mb-3">
                    <div
                        className={clsx(
                            "h-full transition-all duration-700 ease-in-out",
                            progress === 100 ? "bg-emerald-500" : "bg-[#0047AB]"
                        )}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* TINY Milestone Progress */}
                <div className="flex justify-between px-1">
                    {PROGRESS_STEPS.map((step) => {
                        const status = getStepStatus(step);
                        return (
                            <div key={step.id} className="flex items-center gap-1.5">
                                <div
                                    className={clsx(
                                        "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                        status === "complete" ? "bg-blue-500" : status === "active" ? "bg-amber-500 animate-pulse" : "bg-slate-800",
                                    )}
                                />
                                <span className={clsx(
                                    "text-[7px] font-black tracking-widest uppercase",
                                    status === "complete" ? "text-slate-400" : status === "active" ? "text-slate-200" : "text-slate-700"
                                )}>
                                    {step.label}
                                </span>
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
                        <button
                            onClick={() => setShowHistory(false)}
                            className="text-slate-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {savedProposals.length === 0 && (
                            <p className="text-slate-500 text-xs italic">
                                No saved configs yet...
                            </p>
                        )}
                        {savedProposals.map((p) => (
                            <div key={p.id} className="relative group/item">
                                <button
                                    onClick={() => handleLoadProposal(p)}
                                    className="w-full bg-slate-800/50 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/50 text-left transition-all group"
                                >
                                    <p className="text-white font-bold text-sm mb-1 group-hover:text-blue-400 transition-colors uppercase pr-8">
                                        {p.name}
                                    </p>
                                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">
                                        {new Date(p.timestamp).toLocaleString()}
                                    </p>
                                </button>
                                <button
                                    onClick={(e) => handleDeleteProject(p.id, e)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all hover:bg-red-400/10 rounded-lg"
                                    title="Delete project"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-8 py-10 space-y-12 scroll-smooth bg-[#03060a]"
            >
                <div className="max-w-4xl mx-auto space-y-12">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={clsx(
                                "flex flex-col gap-3",
                                msg.role === "user" ? "items-end" : "items-start",
                            )}
                        >
                            <div className="flex items-center gap-2 mb-0.5 px-2 opacity-80">
                                {msg.role === "assistant" ? (
                                    <>
                                        <div className="w-6 h-6 bg-blue-600/10 rounded-md flex items-center justify-center border border-blue-500/20">
                                            <Bot
                                                size={14}
                                                className="text-blue-400"
                                            />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            ANC LOGIC ENGINE
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            SPEC AUDITOR
                                        </span>
                                        <div className="w-6 h-6 bg-slate-800 rounded-md flex items-center justify-center border border-slate-700">
                                            <User
                                                size={14}
                                                className="text-slate-400"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <div
                                className={clsx(
                                    "max-w-[96%] w-full rounded-2xl px-6 py-4.5 text-[15px] leading-[1.6] shadow-2xl transition-all",
                                    msg.role === "user"
                                        ? "bg-[#0047AB] text-white border border-blue-400/20 rounded-tr-sm"
                                        : "bg-[#0a0f16] backdrop-blur-md text-slate-100 border border-slate-800/50 rounded-tl-sm",
                                )}
                            >
                                <div className="whitespace-pre-wrap font-medium tracking-tight">
                                    {msg.content}
                                </div>

                            {/* VENUE VERIFIED CARD - Show only for the message that actually CAPTURED the address */}
                            {msg.role === "assistant" &&
                                i === messages.length - 1 && 
                                lastFieldUpdated === 'address' &&
                                cpqState.address && (
                                    <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-start gap-3 animate-in zoom-in-95 duration-500">
                                        <div className="bg-green-500/20 p-2 rounded-lg">
                                            <CheckCircle2
                                                size={16}
                                                className="text-green-400"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">
                                                    Location Verified
                                                </span>
                                                <div className="h-px flex-1 bg-green-500/20" />
                                            </div>
                                            <p className="text-xs text-slate-300 font-bold leading-tight">
                                                {cpqState.clientName || "Venue"}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-medium">
                                                {cpqState.address}
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {/* VISUAL CONFIRMATION CARD (Value-Add) */}
                            {msg.nextStep === "confirm" && (
                                <div className="mt-4 bg-slate-900/50 rounded-xl p-4 border border-blue-500/30 font-mono text-xs text-blue-200">
                                    <div className="flex justify-between items-center mb-2 border-b border-blue-500/20 pb-2">
                                        <span className="font-bold text-blue-400">
                                            CONFIRM CONFIGURATION
                                        </span>
                                        <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold">
                                            DRAFT
                                        </span>
                                    </div>
                                    <div className="space-y-1 mb-3">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">
                                                Dimensions:
                                            </span>
                                            <span className="font-bold text-white">
                                                {cpqState.widthFt}' W x{" "}
                                                {cpqState.heightFt}' H
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">
                                                Pixel Pitch:
                                            </span>
                                            <span className="font-bold text-white">
                                                {cpqState.pixelPitch}mm
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">
                                                Product:
                                            </span>
                                            <span className="font-bold text-white">
                                                {cpqState.productClass} (
                                                {cpqState.environment})
                                            </span>
                                        </div>
                                        {/* Power Calculation (Value-Add) */}
                                        <div className="flex justify-between pt-2 border-t border-blue-500/20 mt-2">
                                            <span className="text-amber-400 font-bold">
                                                Est. Power:
                                            </span>
                                            <span className="font-bold text-amber-300">
                                                {Math.round(
                                                    ((cpqState.widthFt || 0) *
                                                        (cpqState.heightFt ||
                                                            0) *
                                                        (cpqState.environment ===
                                                            "Outdoor"
                                                            ? 60
                                                            : 30)) /
                                                    120,
                                                )}{" "}
                                                Amps (120V)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* EXPERT WIDGETS */}
                            {msg.role === "assistant" &&
                                i === messages.length - 1 &&
                                (msg.suggestedOptions || widgetDef) && (
                                    <div className="mt-4 pt-4 border-t border-slate-700/30">
                                        {((msg.suggestedOptions &&
                                            msg.suggestedOptions.length > 0) ||
                                            (widgetDef &&
                                                widgetDef.type === "select" &&
                                                widgetDef.options)) && (
                                                <div className="flex flex-wrap gap-2">
                                                    {(msg.suggestedOptions &&
                                                        msg.suggestedOptions.length > 0
                                                        ? msg.suggestedOptions
                                                        : widgetDef?.options || []
                                                    ).map((opt) => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() =>
                                                                handleSend(
                                                                    String(
                                                                        opt.value,
                                                                    ),
                                                                )
                                                            }
                                                            className="px-5 py-2.5 bg-[#03060a] hover:bg-[#0047AB] text-slate-200 hover:text-white border border-slate-800 hover:border-blue-500 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 group"
                                                        >
                                                            {opt.label}{" "}
                                                            <ChevronRight
                                                                size={12}
                                                                className="text-slate-600 group-hover:text-white"
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        {widgetDef &&
                                            widgetDef.type === "number" &&
                                            (!msg.suggestedOptions ||
                                                msg.suggestedOptions.length ===
                                                0) && (
                                                <div className="flex gap-2 items-center">
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (
                                                                    e.key ===
                                                                    "Enter"
                                                                ) {
                                                                    handleSend(
                                                                        (
                                                                            e.target as HTMLInputElement
                                                                        ).value,
                                                                    );
                                                                    (
                                                                        e.target as HTMLInputElement
                                                                    ).value = "";
                                                                }
                                                            }}
                                                            className="w-24 bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 pr-8 text-xs focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-slate-700 font-bold"
                                                        />
                                                        {(widgetDef.id === "widthFt" || widgetDef.id === "heightFt") && (
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">ft</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            const wrapper = e
                                                                .currentTarget
                                                                .previousElementSibling as HTMLDivElement;
                                                            const input = wrapper?.querySelector('input') as HTMLInputElement;
                                                            if (input) {
                                                                handleSend(input.value);
                                                                input.value = "";
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-[#003D82] hover:bg-[#002a5c] text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
                                                    >
                                                        Confirm
                                                    </button>
                                                </div>
                                            )}
                                        {widgetDef &&
                                            widgetDef.type === "text" &&
                                            (!msg.suggestedOptions ||
                                                msg.suggestedOptions.length ===
                                                0) && (
                                                <div className="flex flex-col gap-2 w-full">
                                                    {/* Show address suggestions if we have them (from auto-search) */}
                                                    {widgetDef.id === "address" && addressSuggestions.length > 0 && !isSearchingAddress && (
                                                        <div className="animate-in fade-in slide-in-from-top-2">
                                                            <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                                                {addressSuggestions.length} locations found for "{cpqState.clientName}"
                                                            </p>
                                                            <div className="bg-slate-900 border border-slate-600 rounded-xl overflow-hidden shadow-2xl">
                                                                {addressSuggestions.slice(0, 5).map((item, idx) => (
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
                                                                                    {item.display_name?.split(",")?.[0]?.trim() || "N/A"}
                                                                                </p>
                                                                                <p className="text-[10px] text-slate-500 mt-0.5">
                                                                                    {item.display_name?.split(",")?.slice(1)?.join(",")?.trim() || ""}
                                                                                </p>
                                                                            </div>
                                                                            <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            <button
                                                                onClick={() => setAddressSuggestions([])}
                                                                className="mt-2 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                                                            >
                                                                None of these? Type address manually below ↓
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Show searching spinner */}
                                                    {widgetDef.id === "address" && isSearchingAddress && (
                                                        <div className="bg-[#0f1420] border border-blue-500/30 rounded-xl overflow-hidden shadow-2xl animate-in fade-in scale-95 transition-all w-full">
                                                            <div className="p-3 bg-blue-600/10 border-b border-blue-500/20 flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                                                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">
                                                                        Active Search Engine
                                                                    </p>
                                                                </div>
                                                                <span className="text-[9px] text-blue-500/50 font-mono">ANC-LOCATE-V4</span>
                                                            </div>
                                                            <div className="p-5 space-y-4">
                                                                <div className="flex items-center gap-4">
                                                                    <p className="text-xs font-bold text-white">
                                                                        Locating <span className="text-blue-400 italic">"{cpqState.clientName || "venue"}"</span>
                                                                    </p>
                                                                </div>
                                                                <div className="space-y-3 pl-1 border-l border-slate-800">
                                                                    <div className="flex items-center gap-3">
                                                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Initialization started</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        {searchStep >= 2 ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Loader2 size={12} className="text-blue-400 animate-spin" />}
                                                                        <span className={clsx("text-[9px] font-bold uppercase tracking-widest", searchStep >= 2 ? "text-slate-500" : "text-blue-400")}>
                                                                            Querying Global Venue Database
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        {searchStep >= 3 ? <CheckCircle2 size={12} className="text-emerald-500" /> : searchStep === 2 ? <Loader2 size={12} className="text-blue-400 animate-spin" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-800 ml-1" />}
                                                                        <span className={clsx("text-[9px] font-bold uppercase tracking-widest", searchStep >= 3 ? "text-slate-500" : searchStep === 2 ? "text-blue-400" : "text-slate-800")}>
                                                                            Fetching Precise Coordinates
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        {searchStep >= 4 ? <CheckCircle2 size={12} className="text-emerald-500" /> : searchStep === 3 ? <Loader2 size={12} className="text-blue-400 animate-spin" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-800 ml-1" />}
                                                                        <span className={clsx("text-[9px] font-bold uppercase tracking-widest", searchStep >= 4 ? "text-slate-500" : searchStep === 3 ? "text-blue-400" : "text-slate-800")}>
                                                                            Normalizing Address String
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Show text input only when NOT showing auto-suggestions OR for non-address fields */}
                                                    {(widgetDef.id !== "address" || (addressSuggestions.length === 0 && !isSearchingAddress)) && (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder={
                                                                    widgetDef.id ===
                                                                        "clientName"
                                                                        ? "e.g. Madison Square Garden"
                                                                        : widgetDef.id ===
                                                                              "address"
                                                                              ? "Paste full address or search again..."
                                                                        : "Type here..."
                                                                }
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (
                                                                        e.key ===
                                                                        "Enter"
                                                                    ) {
                                                                        const inputEl =
                                                                            e.currentTarget as HTMLInputElement;
                                                                        const val =
                                                                            inputEl.value;
                                                                        handleSend(val);
                                                                        inputEl.value = "";
                                                                    }
                                                                }}
                                                                className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-slate-700 font-bold"
                                                            />

                                                            {widgetDef.id === "address" && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        const inputEl =
                                                                            e.currentTarget
                                                                                .previousElementSibling as HTMLInputElement;
                                                                        const val = inputEl?.value || "";
                                                                        if (!val.trim()) return;
                                                                        handleSend(val);
                                                                        inputEl.value = "";
                                                                    }}
                                                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors border border-slate-700"
                                                                >
                                                                    Search
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    const input = widgetDef.id === "address" 
                                                                        ? e.currentTarget.previousElementSibling?.previousElementSibling as HTMLInputElement
                                                                        : e.currentTarget.previousElementSibling as HTMLInputElement;
                                                                    if (!input?.value) return;
                                                                    handleSend(input.value);
                                                                    input.value = "";
                                                                }}
                                                                className="px-5 py-2 bg-[#003D82] hover:bg-[#002a5c] text-white rounded-lg text-[10px] font-black hover:bg-blue-500 transition-colors uppercase tracking-widest shadow-lg"
                                                            >
                                                                Next
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                )}
                        </div>
                        {SHOW_REASONING && msg.thinking && msg.role === "assistant" && (
                            <div className="px-2 mt-2">
                                <details className="group/thinking" open={i === messages.length - 1}>
                                    <summary className="cursor-pointer flex items-center gap-2 text-[10px] text-[#0047AB] font-black uppercase tracking-[0.2em] hover:text-blue-400 transition-colors list-none select-none py-2">
                                        <div className="w-2 h-[1px] bg-blue-600/50 group-open/thinking:w-4 transition-all"></div>
                                        <span>Logic Engine Trace</span>
                                        <ChevronDown size={10} className="ml-auto opacity-40 group-open/thinking:rotate-180 transition-transform" />
                                    </summary>
                                    <div className="mt-1 pl-4 border-l border-white/5">
                                        <div className="text-[10px] text-slate-500 font-mono leading-relaxed bg-[#05080f]/50 p-4 rounded-lg border border-white/5 max-w-[98%] shadow-inner whitespace-pre-wrap">
                                            {msg.thinking}
                                        </div>
                                    </div>
                                </details>
                            </div>
                        )}
                        
                        {/* Streaming thinking display */}
                        {isStreaming && streamingThinking && i === messages.length - 1 && (
                            <div className="px-2 mt-2">
                                <div className="flex items-center gap-3 py-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                    <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em]">
                                        Executing Logic Audit...
                                    </span>
                                </div>
                                <div className="mt-1 pl-4 border-l border-blue-500/20">
                                    <div className="text-[10px] text-blue-300/60 font-mono whitespace-pre-wrap bg-blue-500/5 p-4 rounded-lg border border-blue-500/10 max-w-[95%]">
                                        {streamingThinking}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {(isLoading || isUploading) && (
                    <div className="flex flex-col gap-3 mt-4">
                        <div className="flex items-start gap-3">
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
                                    {isUploading
                                        ? "Reading document..."
                                        : (isStreaming || streamingThinking)
                                        ? "Logic Engine Analysis..."
                                        : "Processing..."}
                                </span>
                            </div>
                        </div>
                        
                        {streamingThinking && (
                            <div className="ml-11 bg-slate-800/30 rounded-xl p-4 border border-blue-500/10 max-w-[90%] animate-in fade-in slide-in-from-top-1 duration-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-black text-blue-400/80 uppercase tracking-widest">Live Reasoning Stream</span>
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono leading-relaxed whitespace-pre-wrap">
                                    {streamingThinking}
                                    <span className="inline-block w-1.5 h-3 bg-blue-500/50 animate-pulse ml-1 align-middle"></span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Compact Input Area */}
            <div className="p-3 bg-[#03060a] border-t border-white/5 shadow-2xl">
                <div className="flex gap-2 items-center">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-blue-400 rounded-lg border border-slate-800 transition-all active:scale-95 disabled:opacity-50"
                        title="Upload client brief"
                    >
                        <Upload size={16} />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".txt,.md,.pdf"
                        onChange={handleFileUpload}
                    />
                    <div className="flex-1 relative group">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !isLoading) handleSend(input);
                            }}
                            disabled={isLoading || isUploading}
                            placeholder={isUploading ? "Analyzing Brief..." : "Respond or ask a question..."}
                            className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500/50 outline-none placeholder:text-slate-600 font-medium transition-all group-hover:bg-slate-900"
                        />
                        <button
                            onClick={() => handleSend(input)}
                            disabled={!input.trim() || isLoading || isUploading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-400 disabled:text-slate-700 transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
                <div className="mt-2 flex justify-center">
                   <p className="text-[8px] font-bold text-slate-700 uppercase tracking-[0.2em] flex items-center gap-1">
                      <span className="w-1 h-1 bg-green-500/40 rounded-full animate-pulse"></span>
                      {projectId ? "Logic Vault Active" : "Initializing..."}
                   </p>
                </div>
            </div>
        </div>
    );
}
