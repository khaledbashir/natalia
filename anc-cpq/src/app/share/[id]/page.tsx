'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CPQInput, CalculationResult } from '../../../lib/types';
import { calculateCPQ } from '../../../lib/calculator';
import { ANCLogo } from '../../../components/ANCLogo';

type TabId = 'overview' | 'specs' | 'pricing' | 'download';

interface Tab {
    id: TabId;
    label: string;
}

const TABS: Tab[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'specs', label: 'Technical Specs' },
    { id: 'pricing', label: 'Investment' },
    { id: 'download', label: 'Documents' },
];

import { 
    Loader2, 
    AlertCircle,
    Calendar,
    ArrowRight,
    Download,
    CheckCircle2
} from 'lucide-react';

const BRAND_BLUE = "#003D82";

export default function SharePage() {
    const params = useParams();
    const shareId = params.id as string;
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<{ input: CPQInput; result: CalculationResult } | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        async function fetchShareData() {
            try {
                const res = await fetch(`/api/share?id=${shareId}`);
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Failed to load proposal');
                }
                const shareData = await res.json();
                // Recalculate to ensure fresh pricing
                const result = calculateCPQ(shareData.input);
                setData({ input: shareData.input, result });
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }
        
        if (shareId) {
            fetchShareData();
        }
    }, [shareId]);

    const handleDownloadPDF = async () => {
        if (!data) return;
        setDownloading(true);
        try {
            const res = await fetch('/api/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data.input)
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ANC_Proposal_${data.input.clientName?.replace(/\s+/g, '_') || 'Proposal'}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }
        } catch (e) {
            console.error('Download failed:', e);
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading proposal...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Proposal Not Found</h1>
                    <p className="text-slate-600 mb-6">{error || 'This share link may have expired or is invalid.'}</p>
                    <a 
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                    >
                        Go to ANC CPQ <ArrowRight size={16} />
                    </a>
                </div>
            </div>
        );
    }

    const { input, result } = data;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const grandTotal = result.sellPrice * 1.095;

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
            {/* Sidebar Navigation */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">
                {/* Logo Header */}
                <div className="p-8 border-b border-slate-100">
                    <ANCLogo />
                </div>

                {/* Client Info Card - Clean text only */}
                <div className="px-8 py-6 border-b border-slate-100">
                    <h2 className="font-bold text-slate-900 text-lg">
                        {input.clientName || 'Client Proposal'}
                    </h2>
                    {input.address && (
                        <p className="text-sm text-slate-500 mt-1">
                            {input.address}
                        </p>
                    )}
                </div>

                {/* Navigation Tabs - Text only, clean */}
                <nav className="flex-1 px-4 py-6">
                    <ul className="space-y-1">
                        {TABS.map((tab) => (
                            <li key={tab.id}>
                                <button
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-left px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all border-l-2 ${
                                        activeTab === tab.id
                                            ? 'border-blue-700 text-blue-900 bg-blue-50'
                                            : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-8 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wide">
                        <span>{today}</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-5xl mx-auto p-12">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Hero Section */}
                            <div className="relative h-64 rounded-xl overflow-hidden shadow-sm">
                                <img 
                                    src="https://cdn.prod.website-files.com/64caca97442a1792de3841aa/6631277bd57be13a558a8862_76ers-Enhanced-NR-42310a0e8f-p-800.jpg"
                                    alt="Venue Preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                                    <div>
                                        <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-wide">
                                            LED Display System Proposal
                                        </h1>
                                        <p className="text-white/80 font-medium">
                                            Prepared for {input.clientName || 'Client'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                {/* Quick Stats - Clean Text */}
                                <div className="grid grid-cols-3 divide-x divide-slate-100">
                                    <div className="p-8">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">
                                            Dimensions
                                        </p>
                                        <p className="text-3xl font-bold text-slate-900">
                                            {result.sqFt.toLocaleString()} <span className="text-lg text-slate-400 font-normal">sq ft</span>
                                        </p>
                                    </div>
                                    <div className="p-8">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">
                                            Resolution
                                        </p>
                                        <p className="text-3xl font-bold text-slate-900">
                                            {input.pixelPitch} <span className="text-lg text-slate-400 font-normal">mm</span>
                                        </p>
                                    </div>
                                    <div className="p-8">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">
                                            Configuration
                                        </p>
                                        <p className="text-3xl font-bold text-slate-900">
                                            {input.productClass}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Investment Preview */}
                            <div className="bg-[#003D82] rounded-xl p-8 text-white shadow-lg shadow-blue-900/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-2">Total Investment</p>
                                        <p className="text-4xl font-bold">
                                            ${grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </p>
                                        <p className="text-blue-200 text-xs mt-2 opacity-80">
                                            Includes hardware, installation, and support
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('pricing')}
                                        className="px-8 py-3 bg-white text-[#003D82] hover:bg-white/90 rounded-lg font-bold text-sm transition-colors uppercase tracking-wide"
                                    >
                                        View Breakdown
                                    </button>
                                </div>
                            </div>

                            {/* Features - Simple List */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Scope of Work</h2>
                                <ul className="grid grid-cols-2 gap-y-4 gap-x-8">
                                    {[
                                        'Premium LED Hardware Supply',
                                        'Professional Installation Services',
                                        'Standard Manufacturer Warranty',
                                        'Control System Integration',
                                        'Structural Design & Engineering',
                                        'Project Management'
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-slate-700 font-medium">
                                            <div className="w-1.5 h-1.5 bg-[#003D82] rounded-full" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Reference Projects Gallery */}
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Venue Portfolio</h2>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="rounded-xl overflow-hidden h-40 shadow-sm border border-slate-100 group">
                                        <img 
                                            src="https://cdn.prod.website-files.com/64caca97442a1792de3841aa/6511e036d48d4ff32b7aa69b_do1-p-800.avif" 
                                            alt="Project 1" 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="rounded-xl overflow-hidden h-40 shadow-sm border border-slate-100 group">
                                        <img 
                                            src="https://cdn.prod.website-files.com/64caca97442a1792de3841aa/66e9a2ef799dda554994d95b_IMG_0933-p-800.jpg" 
                                            alt="Project 2" 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="rounded-xl overflow-hidden h-40 shadow-sm border border-slate-100 group">
                                        <img 
                                            src="https://cdn.prod.website-files.com/64caca97442a1792de3841aa/66ff1523f71891c4c9246f7c_20240726_GB_NYY_46-email.JPG" 
                                            alt="Project 3" 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                </div>
                                <p className="text-right text-xs text-slate-400 mt-2 font-medium">
                                    Examples of ANC premium integrations
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Technical Specs Tab */}
                    {activeTab === 'specs' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100">
                                    <h2 className="text-lg font-bold text-slate-900">Technical Specifications</h2>
                                    <p className="text-sm text-slate-500">Detailed configuration for your display system</p>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {[
                                        { label: 'Product Category', value: `${input.productClass} Display System` },
                                        { label: 'Active Dimensions', value: `${input.widthFt}' W × ${input.heightFt}' H` },
                                        { label: 'Total Area', value: `${result.sqFt.toLocaleString()} sq ft` },
                                        { label: 'Pixel Pitch', value: `${input.pixelPitch}mm SMD LED` },
                                        { label: 'Environment Rating', value: input.environment },
                                        { label: 'Panel Configuration', value: `${input.shape} Array` },
                                        { label: 'Service Access', value: `${input.access} Access` },
                                        { label: 'Mounting Type', value: input.mountingType || 'TBD' },
                                        { label: 'Power Requirement', value: `~${result.powerAmps} Amps @ 120V` },
                                        { label: 'Labor Classification', value: input.laborType || 'Standard' },
                                        { label: 'Control System', value: input.controlSystem === 'Include' ? 'Included' : 'Not Included' },
                                    ].map((row, idx) => (
                                        <div key={idx} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                                            <span className="text-slate-600 font-medium">{row.label}</span>
                                            <span className="font-bold text-slate-900">{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pricing Tab */}
                    {activeTab === 'pricing' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100">
                                    <h2 className="text-lg font-bold text-slate-900">Investment Breakdown</h2>
                                    <p className="text-sm text-slate-500">Detailed cost analysis for your project</p>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {[
                                        { label: 'LED Display Hardware', value: result.hardwareCost, highlight: true },
                                        { label: 'Structural Materials & Fabrication', value: result.structuralCost },
                                        { label: 'Installation Labor', value: result.laborCost },
                                        { label: 'Shipping & Logistics', value: result.expenseCost },
                                        { label: 'Engineering & Bonds', value: result.bondCost },
                                        { label: 'Project Management', value: result.pmCost },
                                        { label: 'Contingency', value: result.contingencyCost },
                                    ].map((row, idx) => (
                                        <div key={idx} className={`flex items-center justify-between px-6 py-4 ${row.highlight ? 'bg-blue-50' : 'hover:bg-slate-50'} transition-colors`}>
                                            <span className={`font-medium ${row.highlight ? 'text-blue-900' : 'text-slate-600'}`}>{row.label}</span>
                                            <span className={`font-bold ${row.highlight ? 'text-blue-900 text-lg' : 'text-slate-900'}`}>
                                                ${row.value.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 bg-slate-50 border-t border-slate-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-slate-600 font-medium">Subtotal</span>
                                        <span className="font-bold text-slate-900 text-lg">${result.sellPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-blue-600 rounded-xl text-white">
                                        <span className="font-bold">Project Grand Total</span>
                                        <span className="text-2xl font-black">
                                            ${grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Download Tab */}
                    {activeTab === 'download' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                                <h2 className="text-lg font-bold text-slate-900 mb-6 uppercase tracking-wider">Proposal Documents</h2>
                                <div className="space-y-4">
                                    <button
                                        onClick={handleDownloadPDF}
                                        disabled={downloading}
                                        className="w-full flex items-center justify-between p-6 border-2 border-slate-100 rounded-lg hover:border-[#003D82] hover:bg-slate-50 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-slate-100 p-3 rounded text-slate-500 group-hover:text-[#003D82] transition-colors">
                                                {downloading ? (
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                ) : (
                                                    <Download className="w-6 h-6" />
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-slate-900 text-lg">
                                                    {downloading ? 'Generatng PDF...' : 'Download Full Proposal'}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    PDF Format
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Contact CTA */}
                            <div className="bg-slate-900 rounded-xl p-8 text-white">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <h3 className="font-bold text-lg uppercase tracking-wider mb-2">Ready to proceed?</h3>
                                        <p className="text-slate-400 text-sm">Contact your ANC representative to finalize the order and schedule installation.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
