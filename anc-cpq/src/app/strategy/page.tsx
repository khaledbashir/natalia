'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Database, 
  Zap, 
  Settings, 
  Lock, 
  FileText, 
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Layout,
  RefreshCw,
  Cpu
} from 'lucide-react';

const StrategyPage = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const sections = [
    { id: 'logic', title: 'Logic Architecture', icon: Cpu },
    { id: 'security', title: 'Data Security', icon: ShieldCheck },
    { id: 'salesforce', title: 'Salesforce Roadmap', icon: RefreshCw },
    { id: 'faq', title: 'Strategy FAQ', icon: HelpCircle },
  ];

  const faqs = [
    {
      q: "How did you build the pricing if the primary Excel documentation remains internal?",
      a: "The architecture utilizes a 'Modular Logic Injection' framework. We have engineered the core algorithm based on documented industry standards and the specific business rules identified in preliminary strategy sessions (e.g., structural factor loading, labor multipliers, and environment-based surcharges). This ensures the infrastructure is fully prepared to ingest proprietary ANC data via secure API or encrypted file upload once enterprise-level data agreements are in place."
    },
    {
      q: "Is our proprietary logic and margin structure protected?",
      a: "Absolutely. The system is designed with strict Data Sovereignty in mind. The computational logic layer is decoupled from the user-facing AI interface. This ensures that sensitive margin structures, multiplier tables, and vendor-specific costs are processed within a secure, private runtime environment and are never utilized for model training or exposed to external third-party services."
    },
    {
      q: "How are enterprise-wide cost updates managed?",
      a: "The system features a Centralized Policy Management interface. Cost-basis updates—such as shifts in raw material costs or labor rate adjustments—are governed at the administrative level. Once a global change is committed, the engine ensures that all subsequent project generations across the organization utilize the updated valuation parameters, ensuring institutional consistency."
    },
    {
      q: "Can this system handle large-scale, multi-zone implementations (e.g., Integrated Stadium Systems)?",
      a: "The logic engine is built for scalability. It supports 'Nested Configuration hierarchies' where a single master proposal can encompass multiple complex subsystems (Main Display, 360 Ribbon, Vomitory placements) while maintaining individual technical specifications and synchronized labor requirements."
    },
    {
      q: "What is the strategic roadmap for CRM integration?",
      a: "The architecture is 'Platform-Agnostic' and API-first. The roadmap includes an automated Enterprise Bridge that allows the system to populate from CRM opportunity objects. This ensures that client data, historical context, and project goals flow seamlessly into the CPQ engine, minimizing manual entry errors and maintaining data integrity across the sales cycle."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#003366] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded shadow-inner">
               <span className="text-[#003366] font-black text-xl tracking-tighter">ANC</span>
            </div>
            <span className="font-medium tracking-tight border-l border-white/20 pl-3 ml-1 hidden md:block">
              Strategy & Implementation Portal
            </span>
          </div>
          <div className="flex gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
            {sections.map((s) => (
              <a 
                key={s.id} 
                href={`#${s.id}`} 
                className="text-sm font-semibold hover:text-blue-300 transition-colors uppercase tracking-widest"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <header className="mb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-[#003366] px-4 py-2 rounded-full text-sm font-bold mb-6">
            <ShieldCheck size={16} /> 
            PHASE 1: STRATEGIC VALIDATION & ENGINE ARCHITECTURE
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            The <span className="text-[#003366]">ANC CPQ</span> <br/>Logic Engine
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Bridging the gap between legacy estimation workflows and next-generation institutional intelligence.
          </p>
        </header>

        {/* Logic Section */}
        <section id="logic" className="mb-24 scroll-mt-24">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200 border border-slate-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-[#003366] p-3 rounded-2xl text-white">
                <Cpu size={32} />
              </div>
              <h2 className="text-3xl font-bold italic tracking-tight uppercase">Modular Logic Infrastructure</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <p className="text-lg text-slate-700 mb-6 font-bold leading-relaxed border-l-4 border-[#003366] pl-4">
                  Data Sovereignty & Intellectual Property Management
                </p>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  The primary directive of this architecture is the absolute protection of ANC's proprietary computational logic. Unlike standard "black-box" models, this system utilizes a <span className="text-[#003366] font-bold">Decoupled Formula Engine.</span> 
                </p>
                <ul className="space-y-4">
                  {[
                    "Abstraction Layer: Logic processing is strictly separated from user-facing AI.",
                    "Institutional Compliance: Engineered for full alignment with legacy Excel validation.",
                    "Precision Governance: Centralized management of multipliers and labor rates.",
                    "Auditable Provenance: Every output is traceable to specific engineering business rules."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 font-semibold text-sm">
                      <div className="mt-1 flex-shrink-0 text-[#003366]">
                        <ArrowRight size={14} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-widest">Pricing Waterfall Logic</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-sm font-semibold text-slate-500">Manual Override</span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-tighter">100% Priority</span>
                   </div>
                   <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-sm font-semibold text-slate-500">ANC Master Sheet</span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-tighter">API Connected</span>
                   </div>
                   <div className="flex justify-between items-center opacity-50">
                      <span className="text-sm font-semibold text-slate-500 text-strikethrough">Public Web Data</span>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-tighter">Strictly Restricted</span>
                   </div>
                </div>
                <div className="mt-8 p-4 bg-[#003366] rounded-xl text-white text-xs font-medium leading-relaxed">
                  "The architecture reflects the institutional trust of ANC's senior estimators. We have built an interface that preserves rigorous engineering standards while enhancing throughput."
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="mb-24 scroll-mt-24">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                title: "IP Protection", 
                desc: "Your formulas never leave the secure application layer. It's a black box to the AI.",
                icon: Lock
              },
              { 
                title: "Local Excellence", 
                desc: "The system creates a 'Perfect PDF' instantly, saving days of formatting manually.",
                icon: FileText
              },
              { 
                title: "Internal Audit", 
                desc: "Every proposal creates a hidden Excel file for your team to check the math.",
                icon: Layout
              }
            ].map((card, i) => (
              <div key={i} className="bg-[#003366] text-white p-8 rounded-3xl shadow-lg border-t-4 border-blue-400">
                <card.icon className="mb-4 text-blue-300" size={32} />
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salesforce Roadmap */}
        <section id="salesforce" className="mb-24 scroll-mt-24">
          <div className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-blue-100 opacity-20 pointer-events-none">
              <RefreshCw size={120} />
            </div>
            <h2 className="text-3xl font-black text-[#003366] mb-8">Salesforce Integration Roadmap</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-1 bg-blue-200"></div>
              <div className="space-y-12 pl-12">
                {[
                  { step: "Phase 1: Direct Entry", detail: "Estimator fills out the 5-minute wizard based on sales notes." },
                  { step: "Phase 2: One-Way Connector", detail: "Salesforce triggers the system with Client Name and Venue details." },
                  { step: "Phase 3: Automated Proposal", detail: "AI reads the Salesforce opportunity brief and auto-fills 80% of the wizard." }
                ].map((item, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[3.5rem] mt-1 bg-[#003366] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                      {i + 1}
                    </div>
                    <h4 className="font-bold text-slate-900 text-lg">{item.step}</h4>
                    <p className="text-slate-600">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-24 scroll-mt-24">
          <h2 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-3">
             <HelpCircle className="text-[#003366]" size={32} /> 
             The "Pre-Meeting" FAQ
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-300 transition-colors shadow-sm">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left p-6 flex justify-between items-center"
                >
                  <span className="font-bold text-slate-800 text-lg leading-tight pr-8">{faq.q}</span>
                  <ChevronDown className={`shrink-0 text-slate-400 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-6 text-slate-600 border-t border-slate-50 pt-2 leading-relaxed animate-in fade-in duration-300">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Footer/Handover */}
        <footer className="text-center pt-12 border-t border-slate-200">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[.25em] mb-4">Implementation Partner</p>
          <div className="inline-block bg-[#003366] text-white px-8 py-4 rounded-2xl font-black tracking-widest text-lg">
             B A S H E E R
          </div>
          <p className="mt-8 text-slate-500 text-sm">
            © 2026 ANC Automated Proposal Initiative. All proprietary logic protected.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default StrategyPage;

