'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
    FileText, 
    Settings, 
    DollarSign, 
    Download, 
    Loader2, 
    AlertCircle,
    Building2,
    MapPin,
    Layers,
    Zap,
    Calendar,
    CheckCircle2,
    ArrowRight,
    Monitor,
    Wrench,
    Shield
} from 'lucide-react';
import { CPQInput, CalculationResult } from '../../../lib/types';
import { calculateCPQ } from '../../../lib/calculator';
import { ANCLogo } from '../../../components/ANCLogo';

type TabId = 'overview' | 'specs' | 'pricing' | 'download';

interface Tab {
    id: TabId;
    label: string;
    icon: React.ReactNode;
}

const TABS: Tab[] = [
    { id: 'overview', label: 'Overview', icon: <FileText size={18} /> },
    { id: 'specs', label: 'Technical Specs', icon: <Settings size={18} /> },
    { id: 'pricing', label: 'Investment', icon: <DollarSign size={18} /> },
    { id: 'download', label: 'Documents', icon: <Download size={18} /> },
];

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
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar Navigation */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">
                {/* Logo Header */}
                <div className="p-6 border-b border-slate-100">
                    <ANCLogo />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                        Project Proposal
                    </p>
                </div>

                {/* Client Info Card */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-bold text-slate-900 text-sm truncate">
                                {input.clientName || 'Client Proposal'}
                            </h2>
                            {input.address && (
                                <p className="text-xs text-slate-500 mt-0.5 flex items-start gap-1">
                                    <MapPin size={10} className="mt-0.5 flex-shrink-0" />
                                    <span className="truncate">{input.address}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <nav className="flex-1 p-4">
                    <ul className="space-y-1">
                        {TABS.map((tab) => (
                            <li key={tab.id}>
                                <button
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar size={12} />
                        <span>Generated {today}</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-4xl mx-auto p-8">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-8 border-b border-slate-100">
                                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                                        LED Display System Proposal
                                    </h1>
                                    <p className="text-slate-600">
                                        Custom digital display solution for {input.clientName || 'your venue'}
                                    </p>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-3 divide-x divide-slate-100">
                                    <div className="p-6 text-center">
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                            <Monitor className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {result.sqFt.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                                            Square Feet
                                        </p>
                                    </div>
                                    <div className="p-6 text-center">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                            <Zap className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {input.pixelPitch}mm
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                                            Pixel Pitch
                                        </p>
                                    </div>
                                    <div className="p-6 text-center">
                                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                            <Layers className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {input.productClass}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                                            Display Type
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Investment Preview */}
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-200 text-sm font-medium mb-1">Total Investment</p>
                                        <p className="text-4xl font-bold">
                                            ${grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </p>
                                        <p className="text-blue-200 text-xs mt-2">
                                            Includes hardware, installation, and support
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('pricing')}
                                        className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                                    >
                                        View Breakdown <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                                <h2 className="text-lg font-bold text-slate-900 mb-6">What's Included</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { icon: <Monitor size={18} />, label: 'Premium LED Hardware' },
                                        { icon: <Wrench size={18} />, label: 'Professional Installation' },
                                        { icon: <Shield size={18} />, label: 'Warranty & Support' },
                                        { icon: <Settings size={18} />, label: 'Control System Integration' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-blue-600">
                                                {item.icon}
                                            </div>
                                            <span className="font-medium text-slate-700">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
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
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                                <h2 className="text-lg font-bold text-slate-900 mb-6">Download Documents</h2>
                                <div className="space-y-4">
                                    <button
                                        onClick={handleDownloadPDF}
                                        disabled={downloading}
                                        className="w-full flex items-center gap-4 p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                    >
                                        <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                            {downloading ? (
                                                <Loader2 className="w-7 h-7 text-red-600 animate-spin" />
                                            ) : (
                                                <FileText className="w-7 h-7 text-red-600" />
                                            )}
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {downloading ? 'Generating PDF...' : 'Download PDF Proposal'}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                Complete proposal with technical specs and pricing
                                            </p>
                                        </div>
                                        <Download className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Contact CTA */}
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
                                <div className="flex items-center gap-4 mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                    <div>
                                        <h3 className="font-bold text-lg">Ready to proceed?</h3>
                                        <p className="text-slate-400 text-sm">Contact your ANC representative to finalize the order</p>
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
