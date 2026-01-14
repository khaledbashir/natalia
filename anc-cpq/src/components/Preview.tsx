'use client';
import React, { useState, useEffect } from 'react';
import { CPQInput, CalculationResult, ScreenConfig } from '../lib/types';
import { Download, Layers, ShieldCheck, Clock, Zap, FileText, Table2, Share2, Loader2 } from 'lucide-react';
import { ANCLogo } from './ANCLogo';
import { calculateScreen } from '../lib/calculator';
import { ExcelPreview } from './ExcelPreview';
import { Button } from '@/components/ui/button';

interface PreviewProps {
  input: CPQInput;
  result: CalculationResult;
  projectId?: number;
  onUpdateField?: (field: keyof CPQInput, value: any) => void;
  initialShowPricing?: boolean;
}

const BRAND_BLUE = "#003D82";

// --- Helper Components for Professional Styling ---

const SectionTitle = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`flex items-center gap-4 mb-3 print:mb-6 ${className}`}>
    <h3 className="text-[10px] font-black tracking-[0.25em] text-slate-400 uppercase">{children}</h3>
    <div className="flex-1 h-[1px] bg-slate-100" />
  </div>
);

const SpecsTable = ({ config }: { config: Partial<ScreenConfig> | CPQInput }) => {
  const getPixelResolution = (dimensionFt: number, pitchMm: number) => {
    const dimensionMm = dimensionFt * 304.8;
    return Math.round(dimensionMm / pitchMm);
  };

  const pixelResH = getPixelResolution(config.heightFt || 0, config.pixelPitch || 0);
  const pixelResW = getPixelResolution(config.widthFt || 0, config.pixelPitch || 0);

  return (
    <div className="rounded-lg overflow-hidden border border-slate-200 mb-6 print:mb-10 shadow-sm">
      <table className="w-full text-[12px] border-collapse">
        <thead>
          <tr style={{ backgroundColor: BRAND_BLUE }} className="text-white uppercase tracking-widest font-extrabold">
            <th className="py-2.5 px-4 text-left border-r border-blue-900/20">Parameter</th>
            <th className="py-2.5 px-4 text-right">Technical Specification</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-[#F8FAFC]">
            <td className="py-2.5 px-4 font-bold text-slate-800 border-r border-slate-200">Product Category</td>
            <td className="py-2.5 px-4 text-right font-medium text-slate-600 uppercase">
              {config.productClass} Display System
            </td>
          </tr>
          <tr className="bg-white">
            <td className="py-2.5 px-4 font-bold text-slate-800 border-r border-slate-200">Pixel Pitch</td>
            <td className="py-2.5 px-4 text-right font-medium text-slate-600">{config.pixelPitch}mm (SMD LED)</td>
          </tr>
          <tr className="bg-[#F8FAFC]">
            <td className="py-2.5 px-4 font-bold text-slate-800 border-r border-slate-200">Active Dimensions</td>
            <td className="py-2.5 px-4 text-right font-medium text-slate-600">{config.widthFt}' W x {config.heightFt}' H</td>
          </tr>
          <tr className="bg-white">
            <td className="py-2.5 px-4 font-bold text-slate-800 border-r border-slate-200">Total Resolution</td>
            <td className="py-2.5 px-4 text-right font-medium text-slate-600">{pixelResW}px (W) x {pixelResH}px (H)</td>
          </tr>
          <tr className="bg-[#F8FAFC]">
            <td className="py-2.5 px-4 font-bold text-slate-800 border-r border-slate-200">Face Coverage / Shape</td>
            <td className="py-2.5 px-4 text-right font-medium text-slate-600">{config.shape} Configuration</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const PricingTable = ({ result, showFooter = true, titleSuffix = "" }: { result: CalculationResult, showFooter?: boolean, titleSuffix?: string }) => (
  <div className="rounded-lg overflow-hidden border border-slate-200 shadow-sm mb-6 print:mb-10">
    <table className="w-full text-[12px] border-collapse">
      <thead>
        <tr style={{ backgroundColor: BRAND_BLUE }} className="text-white uppercase tracking-widest font-extrabold">
          <th className="py-2.5 px-4 text-left border-r border-blue-900/20">Category Description {titleSuffix}</th>
          <th className="py-2.5 px-4 text-right">Investment</th>
        </tr>
      </thead>
      <tbody className="text-slate-700">
        <tr className="bg-white border-b border-slate-100">
          <td className="py-2.5 px-4 font-bold text-slate-900 border-r border-slate-200 text-[11px]">ANC Digital Display Hardware</td>
          <td className="py-2.5 px-4 text-right font-black text-slate-900">${result.hardwareCost.toLocaleString()}</td>
        </tr>
        <tr className="bg-[#F8FAFC] border-b border-slate-100">
          <td className="py-2.5 px-4 border-r border-slate-200 text-[11px] text-slate-500 font-medium">Structural Materials & Custom Fabrication</td>
          <td className="py-2.5 px-4 text-right font-bold text-slate-600">${result.structuralCost.toLocaleString()}</td>
        </tr>
        <tr className="bg-white border-b border-slate-100">
          <td className="py-2.5 px-4 border-r border-slate-200 text-[11px] text-slate-500 font-medium">Installation Labor & Professional Services</td>
          <td className="py-2.5 px-4 text-right font-bold text-slate-600">${result.laborCost.toLocaleString()}</td>
        </tr>
        <tr className="bg-[#F8FAFC] border-b border-slate-100">
          <td className="py-2.5 px-4 border-r border-slate-200 text-[11px] text-slate-500 font-medium">Shipping, Logistics & Project Expenses</td>
          <td className="py-2.5 px-4 text-right font-bold text-slate-600">${result.expenseCost.toLocaleString()}</td>
        </tr>
        <tr className="bg-white">
          <td className="py-2.5 px-4 border-r border-slate-200 text-[11px] text-slate-500 font-medium">Engineering, Bonds & Submittals</td>
          <td className="py-2.5 px-4 text-right font-bold text-slate-600">${result.bondCost.toLocaleString()}</td>
        </tr>
      </tbody>
      {showFooter && (
        <tfoot>
          <tr className="bg-slate-50 border-t-2 border-slate-900/10">
            <td className="py-2.5 px-4 text-right font-black uppercase tracking-widest text-slate-400 border-r border-slate-200">Subtotal</td>
            <td className="py-2.5 px-4 text-right font-black text-lg text-slate-900">${result.sellPrice.toLocaleString()}</td>
          </tr>
          <tr style={{ backgroundColor: BRAND_BLUE }}>
            <td className="py-3 px-4 text-right font-black uppercase tracking-[0.2em] text-white/50 border-r border-white/10 text-[10px]">Project Grand Total</td>
            <td className="py-3 px-4 text-right font-black text-2xl text-white">${(result.sellPrice * 1.095).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
          </tr>
        </tfoot>
      )}
    </table>
  </div>
);

// --- Main Preview Component ---

export default function Preview({ input, result, projectId, onUpdateField, initialShowPricing = true }: PreviewProps) {
  const [today, setToday] = useState('');
  const [referenceNum, setReferenceNum] = useState('');
  const [showPricing, setShowPricing] = useState(initialShowPricing);
  const [activeTab, setActiveTab] = useState<'pdf' | 'excel'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    setReferenceNum(Math.floor(100000 + Math.random() * 900000).toString());
  }, []);

  const handleDownload = async (type: 'pdf' | 'excel') => {
    setIsGenerating(true);
    try {
      if (type === 'pdf') {
        const res = await fetch('/api/pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });

        if (res.ok) {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ANC_Proposal_${input.clientName?.replace(/\s+/g, '_') || 'Draft'}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } else {
          alert('PDF Generation Failed');
        }
      } else {
        // EXCEL GENERATION
        const payload = {
          client_name: input.clientName || "Proposal",
          screens: (input.screens && input.screens.length > 0) ? input.screens.map(s => ({
            product_class: s.productClass,
            pixel_pitch: String(s.pixelPitch),
            width_ft: s.widthFt,
            height_ft: s.heightFt,
            is_outdoor: s.environment === 'Outdoor',
            shape: s.shape,
            access: s.access,
            complexity: s.complexity,
            structure_condition: s.structureCondition || 'Existing',
            labor_type: s.laborType || 'NonUnion',
            power_distance: s.powerDistance || 'Close',
            mounting_type: s.mountingType || input.mountingType || 'Wall',
            venue_type: input.venueType || 'corporate',
            target_margin: input.targetMargin || 30.0,
            permits: s.permits || 'Client',
            control_system: s.controlSystem || 'Include',
            bond_required: !!s.bondRequired
          })) : [{
            product_class: input.productClass,
            pixel_pitch: String(input.pixelPitch),
            width_ft: input.widthFt,
            height_ft: input.heightFt,
            is_outdoor: input.environment === 'Outdoor',
            shape: input.shape,
            access: input.access,
            complexity: input.complexity,
            structure_condition: input.structureCondition || 'Existing',
            unit_cost: input.unitCost || 0,
            target_margin: input.targetMargin || 0,
            labor_type: input.laborType || 'NonUnion',
            power_distance: input.powerDistance || 'Close',
            mounting_type: input.mountingType || 'Wall',
            venue_type: input.venueType || 'corporate',
            permits: input.permits || 'Client',
            control_system: input.controlSystem || 'Include',
            bond_required: !!input.bondRequired
          }],
          service_level: input.serviceLevel || 'bronze',
          timeline: input.timeline || 'standard',
          permits: input.permits || 'client',
          control_system: input.controlSystem || 'include',
          bond_required: !!input.bondRequired
        };

        const genRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (genRes.ok) {
          const downloadRes = await fetch('/api/download/excel');
          if (downloadRes.ok) {
            const blob = await downloadRes.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ANC_Audit_Trail_${input.clientName?.replace(/\s+/g, '_') || 'Proposal'}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }
        } else {
          alert("Excel Generation Failed on Backend");
        }
      }
    } catch (e) {
      console.error(e);
      alert("Error connecting to generator");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: input,
          result: result,
          project_id: projectId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setShareUrl(data.shareUrl);
        setShowShareModal(true);
      } else {
        alert('Failed to create share link');
      }
    } catch (e) {
      console.error(e);
      alert('Error creating share link');
    } finally {
      setIsSharing(false);
    }
  };

  const isMultiScreen = input.screens && input.screens.length > 0;

  return (
    <div className="h-full bg-slate-200 p-6 overflow-y-auto flex flex-col items-center">
      <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                .brand-font { font-family: 'Inter', sans-serif; }
                @media print {
                    body, html { background: white !important; margin: 0 !important; padding: 0 !important; }
                    .no-print { display: none !important; }
                    .page-break { page-break-after: always; padding-top: 1rem; }
                    .shadow-2xl { box-shadow: none !important; }
                }
            `}</style>

      {/* Toolbar */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 print:hidden flex-col md:flex-row gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-200">
            <ShieldCheck className="text-blue-600" size={20} />
          </div>
          <div>
            <span className="block text-slate-900 text-sm font-bold tracking-tight">Project Proposal</span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-2 bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`px-4 py-2 rounded-lg font-bold text-[11px] transition-all flex items-center gap-2 ${activeTab === 'pdf'
              ? 'bg-[#003D82] text-white shadow-lg shadow-blue-900/20'
              : 'bg-transparent text-slate-600 hover:bg-slate-50'
              }`}
          >
            <FileText size={14} /> PDF
          </button>
          <button
            onClick={() => setActiveTab('excel')}
            className={`px-4 py-2 rounded-lg font-bold text-[11px] transition-all flex items-center gap-2 ${activeTab === 'excel'
              ? 'bg-[#003D82] text-white shadow-lg shadow-blue-900/20'
              : 'bg-transparent text-slate-600 hover:bg-slate-50'
              }`}
          >
            <Table2 size={14} /> EXCEL
          </button>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setShowPricing(!showPricing)} className="bg-white hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl font-bold shadow-sm border border-slate-200 text-[11px] transition-all h-9">
            {showPricing ? 'HIDE INVESTMENT' : 'SHOW INVESTMENT'}
          </Button>

          <Button
            onClick={() => handleDownload('excel')}
            disabled={isGenerating}
            className="bg-white hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl font-bold shadow-sm border border-slate-200 text-[11px] transition-all flex items-center gap-2 h-9"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Layers size={14} />} EXPORT EXCEL
          </Button>

          <Button
            onClick={() => handleDownload('pdf')}
            disabled={isGenerating}
            className="bg-[#003D82] hover:bg-blue-900 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-900/20 text-[11px] transition-all flex items-center gap-2 h-9"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} DOWNLOAD PDF
          </Button>

          <Button
            onClick={handleShare}
            disabled={isSharing || !result}
            variant="outline"
            className="flex items-center gap-2 h-9 rounded-xl font-bold text-[11px]"
          >
            {isSharing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            SHARE
          </Button>
        </div>
      </div>

      {/* CONTENT DISPLAY BASED ON ACTIVE TAB */}
      {activeTab === 'excel' ? (
        <div className="w-full max-w-4xl">
          <ExcelPreview input={input} result={result} />
        </div>
      ) : (
        <div className="w-full max-w-4xl bg-white shadow-2xl relative brand-font print:shadow-none print:w-full print:max-w-none print:m-0">
          {/* PDF Preview */}

          {/* PAGE 1: HEADER & OVERVIEW */}
          <div className="min-h-[1056px] relative p-16 print:p-20 flex flex-col">
            <div className="flex justify-between items-start mb-16">
              <div className="flex flex-col gap-8">
                <ANCLogo className="h-[48px] w-auto" color={BRAND_BLUE} />
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">
                    {input.clientName || 'PROSPECT NAME'}
                  </h1>
                  <p className="text-xs text-slate-400 font-medium mt-1 tracking-tight">{input.address || input.projectName || 'Project Location Details'}</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <h2 className="text-[10px] font-black tracking-[0.3em] mb-4 text-slate-400 uppercase">Document Information</h2>
                <div className="grid grid-cols-1 gap-1">
                  <p className="text-[10px] text-slate-700 font-bold uppercase tracking-wider"><span className="text-slate-400 font-bold mr-2">DATE:</span> {today}</p>
                  <p className="text-[10px] text-slate-700 font-bold uppercase tracking-wider"><span className="text-slate-400 font-bold mr-2">REF:</span> ANC-{referenceNum}</p>
                  <p className="text-[10px] font-bold mt-2 px-2 py-1 bg-slate-100 rounded inline-block" style={{ color: BRAND_BLUE }}>
                    {isMultiScreen ? "PROJECT PROPOSAL" : "SALES QUOTATION"}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-[2px] w-16 mb-8" style={{ background: BRAND_BLUE }} />

            <div className="prose prose-slate max-w-none mb-12">
              <p className="text-xs text-slate-600 leading-relaxed text-justify font-medium">
                This memorandum ("Document") sets forth the summary terms and technical specifications by which <strong>{input.clientName || 'Purchaser'}</strong> ("Purchaser"), and ANC Sports Enterprises, LLC ("ANC") agree to proceed with the procurement and installation of the LED Display Systems described herein. The technical parameters and investment values presented represent the final engineering estimates for professional venue deployment.
              </p>
            </div>

            {/* RENDER CONTENT BLOCKS */}
            {!isMultiScreen ? (
              <>
                <SectionTitle>Technical Specifications</SectionTitle>
                <SpecsTable config={input} />

                {showPricing && (
                  <>
                    <div className="h-8" />
                    <SectionTitle>Investment Summary</SectionTitle>
                    <PricingTable result={result} />
                  </>
                )}
              </>
            ) : (
              <div className="space-y-16">
                {input.screens?.map((screen, idx) => {
                  const screenResult = calculateScreen(screen);
                  return (
                    <div key={idx} className={idx > 0 && idx % 2 === 0 ? "page-break pt-8" : ""}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm" style={{ backgroundColor: BRAND_BLUE }}>
                          {idx + 1}
                        </div>
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                          {screen.productClass} <span className="text-slate-300">/ Pitch {screen.pixelPitch}mm</span>
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <SectionTitle>Specifications</SectionTitle>
                        <SpecsTable config={screen} />
                        {showPricing && (
                          <>
                            <SectionTitle>Investment Breakout</SectionTitle>
                            <PricingTable result={screenResult} showFooter={false} titleSuffix={`- ${screen.productClass}`} />
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Aggregate Total if Multi-Screen */}
            {isMultiScreen && showPricing && (
              <div className="mt-16 bg-slate-50 p-8 rounded-2xl border border-slate-200">
                <SectionTitle>Project Aggregate Investment</SectionTitle>
                <PricingTable result={result} titleSuffix="(All Displays)" />
                <div className="grid grid-cols-3 gap-6 mt-4">
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 bg-white p-3 rounded-lg border border-slate-100">
                    <Zap size={14} className="text-amber-500" /> Professional Grade
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 bg-white p-3 rounded-lg border border-slate-100">
                    <ShieldCheck size={14} className="text-emerald-500" /> Full Warranty Included
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 bg-white p-3 rounded-lg border border-slate-100">
                    <Clock size={14} className="text-blue-500" /> Validity: 30 Days
                  </div>
                </div>
              </div>
            )}

            {/* PAGE FOOTER (PAGE 1) */}
            <div className="mt-auto pt-10 border-t border-slate-100 flex justify-between items-center">
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                Page 01 of {isMultiScreen ? '03' : '02'} | ANC {new Date().getFullYear()}
              </div>
              <div className="flex gap-4 items-center">
                <div className="h-[12px]">
                  <ANCLogo className="h-full w-auto opacity-20" color="#000" />
                </div>
                <span className="text-[9px] text-slate-300 font-bold">CONFIDENTIAL MEMORANDUM</span>
              </div>
            </div>
          </div>

          {/* TERMS PAGE */}
          <div className="page-break min-h-[1056px] relative p-16 print:p-20 flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <ANCLogo className="h-[30px] w-auto" color={BRAND_BLUE} />
              <h2 className="text-[10px] font-black tracking-[0.3em] text-slate-300 uppercase">Terms & Execution</h2>
            </div>

            <div className="grid grid-cols-2 gap-16">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest mb-8 pb-2 border-b-2 border-slate-100" style={{ color: BRAND_BLUE }}>Payment Schedule</h4>
                <div className="space-y-6">
                  {[
                    { pct: "50%", label: "Deposit upon execution", detail: "Procurement kick-off" },
                    { pct: "40%", label: "Shipping Milestone", detail: "Prior to logistics departure" },
                    { pct: "10%", label: "Final Commissioning", detail: "Net 15 upon acceptance" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="text-lg font-black text-slate-900 w-12 pt-0.5">{item.pct}</div>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-tight">{item.label}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest mb-8 pb-2 border-b-2 border-slate-100" style={{ color: BRAND_BLUE }}>Clarifications</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-bold text-slate-900 mb-1 leading-tight">Project Exclusions</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Union labor (unless specified), primary power feed, structural reinforcement, and data conduit infrastructure.</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-900 mb-1 leading-tight">Tax & Logistics</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Estimated tax is calculated at 9.5%. Final shipping costs may vary based on fuel surcharges at time of departure.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-24">
              <h4 className="text-xs font-black uppercase tracking-widest mb-12 text-center text-slate-300">Authorized Execution</h4>
              <div className="grid grid-cols-2 gap-24">
                <div className="border-t-2 border-slate-900 pt-4">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">ANC Sports Enterprises, LLC</p>
                  <p className="text-[9px] text-slate-400 font-bold mt-1">Authorized Signature</p>
                </div>
                <div className="border-t-2 border-slate-200 pt-4">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{input.clientName || 'Purchaser'}</p>
                  <p className="text-[9px] text-slate-400 font-bold mt-1">Acceptance Signature</p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-10 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-bold">
              <div>NY 914.696.2100 | TX 940.464.2320</div>
              <div className="tracking-widest uppercase">WWW.ANC.COM</div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] no-print">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-slate-900">Share Proposal</h3>
            <p className="text-sm text-slate-500 mb-4">Copy this link to share the proposal:</p>
            <div className="flex items-center gap-2 mb-6">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 p-2 border border-slate-200 rounded text-sm bg-slate-50 focus:outline-none"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert('Link copied to clipboard!');
                }}
                size="sm"
                className="bg-[#003D82] hover:bg-blue-900"
              >
                Copy
              </Button>
            </div>
            <Button
              onClick={() => setShowShareModal(false)}
              variant="outline"
              className="w-full border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}