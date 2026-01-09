'use client';
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Preview } from '../../components/Preview';
import { CPQInput, CalculationResult } from '../../lib/types';
import { calculateCPQ } from '../../lib/calculator';

function PrintContent() {
    const searchParams = useSearchParams();
    const dataStr = searchParams.get('data');

    if (!dataStr) {
        return <div className="p-8 text-slate-500">No proposal data provided.</div>;
    }

    try {
        let decoded = '';
        try {
            decoded = decodeURIComponent(dataStr);
        } catch (e) {
            // Fallback for cases where it's already decoded or partially malformed
            decoded = dataStr;
        }

        const input: CPQInput = JSON.parse(decoded);

        // Ensure required fields exist to prevent render crashes
        if (!input || typeof input !== 'object') {
            throw new Error('Invalid data structure');
        }

        // Recalculate result to ensure validity
        const result: CalculationResult = calculateCPQ(input);

        return (
            <div className="absolute top-0 left-0 w-full h-auto bg-white print-container">
                <style jsx global>{`
                    /* Hide EVERYTHING identified as a UI element */
                    .flex.justify-between.items-center.mb-6,
                    .print\:hidden,
                    button,
                    select,
                    input,
                    [role="toolbar"],
                    .animate-pulse {
                        display: none !important;
                    }
                    
                    /* Force background colors and remove padding/margins */
                    @media print {
                        body, html {
                            background: white !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .print-container {
                            width: 100% !important;
                        }
                    }

                    /* Reset container styles from Preview component */
                    .bg-slate-200, .bg-slate-100 {
                        background-color: transparent !important;
                        padding: 0 !important;
                    }
                    .shadow-2xl {
                        box-shadow: none !important;
                    }
                    .h-full, .min-h-screen {
                        height: auto !important;
                    }
                    .p-6, .p-16 {
                        padding: 0 !important;
                    }
                `}</style>
                <Preview input={input} result={result} />
            </div>
        );
    } catch (e) {
        console.error('Print Data Error:', e);
        return (
            <div className="p-10 border-2 border-red-500 bg-red-50 rounded-xl m-10">
                <h1 className="text-xl font-bold text-red-700 mb-2">Proposal Generation Error</h1>
                <p className="text-sm text-red-600 mb-4">The proposal data could not be processed for printing.</p>
                <pre className="text-xs bg-black/5 p-4 rounded overflow-auto max-h-40">
                    {e instanceof Error ? e.message : String(e)}
                </pre>
            </div>
        );
    }
}

export default function PrintPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PrintContent />
        </Suspense>
    );
}
