"use client";
import { useState, useMemo, useCallback } from "react";
import { CPQInput } from "../lib/types";
import { calculateCPQ } from "../lib/calculator";
import { Wizard } from "../components/Wizard";
import { Preview } from "../components/Preview";
import { ConversationalWizard } from "../components/ConversationalWizard";
import { SalesforceSimulator } from "../components/SalesforceSimulator";
import { MessageSquare, Settings, Database } from "lucide-react";

export default function Home() {
    // 1. Input mode toggle
    const [mode, setMode] = useState<"ai" | "form" | "salesforce">("ai");
    const [activeProjectId, setActiveProjectId] = useState<number | null>(null);

    // 2. Valid default state for the 8 variables
    const [input, setInput] = useState<CPQInput>({
        clientName: "",
        address: "",
        projectName: "",
        productClass: "Scoreboard" as any,
        widthFt: 0,
        heightFt: 0,
        pixelPitch: 0 as any,
        environment: "Indoor" as any,
        shape: "Flat" as any,
        access: "Front" as any,
        complexity: "Standard" as any,
    });

    // 3. Real-time Calculation (Memoized for performance)
    const result = useMemo(() => calculateCPQ(input), [input]);

    // 4. Handlers
    const handleInputChange = useCallback((field: keyof CPQInput, value: any) => {
        setInput((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleWizardUpdate = useCallback((params: Partial<CPQInput>) => {
        // If it looks like a full state reset or replacement, replace instead of merge
        if (params.clientName === "" && params.widthFt === 0) {
            setInput(params as CPQInput);
        } else {
            setInput((prev) => ({ ...prev, ...params }));
        }
    }, []);

    const handleWizardComplete = useCallback((params: Partial<CPQInput>) => {
        setInput((prev) => ({ ...prev, ...params }));
    }, []);

    return (
        <main className="flex h-screen w-full overflow-hidden font-sans">
            {/* Left Panel: AI Wizard or Manual Form (35% width) */}
            <div className="w-[35%] h-full shrink-0 z-10 relative shadow-xl bg-slate-900 flex flex-col">
                {/* Mode Toggle */}
                <div className="flex border-b border-slate-800">
                    <button
                        onClick={() => setMode("ai")}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all ${
                            mode === "ai"
                                ? "bg-slate-800 text-blue-400 border-b-2 border-blue-500"
                                : "text-slate-500 hover:text-slate-300"
                        }`}
                    >
                        <MessageSquare size={16} /> AI
                    </button>
                    <button
                        onClick={() => setMode("form")}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all ${
                            mode === "form"
                                ? "bg-slate-800 text-blue-400 border-b-2 border-blue-500"
                                : "text-slate-500 hover:text-slate-300"
                        }`}
                    >
                        <Settings size={16} /> Form
                    </button>
                    <button
                        onClick={() => setMode("salesforce")}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all ${
                            mode === "salesforce"
                                ? "bg-slate-800 text-blue-400 border-b-2 border-blue-500"
                                : "text-slate-500 hover:text-slate-300"
                        }`}
                    >
                        <Database size={16} /> SFDC
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-hidden">
                        {mode === "ai" ? (
                            <ConversationalWizard
                                onProjectInit={setActiveProjectId}
                                onComplete={handleWizardComplete}
                                onUpdate={handleWizardUpdate}
                            />
                        ) : mode === "form" ? (
                            <Wizard data={input} onChange={handleInputChange} />
                        ) : (
                            <div className="h-full flex flex-col justify-center items-center p-8 text-center bg-slate-900">
                                <Database
                                    size={48}
                                    className="text-slate-700 mb-4"
                                />
                                <h2 className="text-xl font-bold text-white mb-2">
                                    Salesforce Integration
                                </h2>
                                <p className="text-slate-400 text-sm mb-6">
                                    Simulation mode for automated opportunity
                                    triggers.
                                </p>
                                <div className="w-full max-w-sm">
                                    <SalesforceSimulator
                                        onLoadState={handleWizardUpdate}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Panel: Preview (65% width) */}
            <div className="w-[65%] h-full">
                <Preview
                    projectId={activeProjectId}
                    input={input}
                    result={result}
                    onUpdateField={handleInputChange}
                />
            </div>
        </main>
    );
}
