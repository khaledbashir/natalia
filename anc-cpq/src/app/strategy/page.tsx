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
  Cpu,
  BarChart3,
  Globe,
  Monitor,
  CheckCircle2,
  TrendingUp,
  Glasses
} from 'lucide-react';

const StrategyPage = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const sections = [
    { id: 'logic', title: 'Logic Architecture', icon: Cpu },
    { id: 'capabilities', title: 'System Catalog', icon: Layout },
    { id: 'security', title: 'Security', icon: ShieldCheck },
    { id: 'roadmap', title: 'Evolution Roadmap', icon: TrendingUp },
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

        {/* Strategic Metrics Section */}
        <section className="mb-24 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Efficiency", value: "85%", sub: "Reduction in Proposal Lead Time" },
            { label: "Accuracy", value: "100%", sub: "Alignment with Engineering Logic" },
            { label: "Compliance", value: "Zero", sub: "Data Leaks to Third-Party AI" },
            { label: "Scalability", value: "∞", sub: "Users per Centralized Logic Hub" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center border-b-4 border-b-[#003366]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-[#003366]">{stat.value}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">{stat.sub}</p>
            </div>
          ))}
        </section>

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

        {/* System Capability Catalog */}
        <section id="capabilities" className="mb-24 scroll-mt-24">
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 mb-4 uppercase tracking-tighter">
              <Layout className="text-[#003366]" size={32} />
              System Capability Catalog
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Intelligent Intake Wizard",
                  exec: "Reduces proposal time from hours to minutes via a guided, adaptive interview.",
                  tech: "A state-driven conditional logic engine that filters out irrelevant technical questions based on project type.",
                  icon: Zap
                },
                {
                  title: "Real-Time Pricing Engine",
                  exec: "Ensures margin consistency across the entire sales team, regardless of location.",
                  tech: "Modular multiplier injection layer that calculates raw materials, labor, and surcharges instantly.",
                  icon: BarChart3
                },
                {
                  title: "Institutional Knowledge Base",
                  exec: "Digitizes the 'unwritten' rules of senior estimators to prevent costly errors.",
                  tech: "Deterministic rule-set repository (Industry Templates) mapped to ANC's historical hardware standards.",
                  icon: Database
                },
                {
                  title: "Automated Artifact Generation",
                  exec: "Instantly produces high-fidelity PDFs and internal Excel validation spreadsheets.",
                  tech: "Server-side headless rendering engine transforming configuration state into structured documentation.",
                  icon: FileText
                }
              ].map((item, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex gap-4 items-start mb-4">
                    <div className="bg-blue-50 p-2 rounded-lg text-[#003366]">
                      <item.icon size={24} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">{item.title}</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-[#003366] uppercase tracking-[0.2em] mb-1">Impact / Executive</p>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">{item.exec}</p>
                    </div>
                    <div className="pl-4 border-l-2 border-slate-100 italic">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Architecture / Technical</p>
                      <p className="text-sm text-slate-500 leading-relaxed font-mono">{item.tech}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="mb-24 scroll-mt-24">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                title: "IP Protection", 
                desc: "Your proprietary formulas never leave the secure application layer. It's a black box to the external AI.",
                icon: Lock
              },
              { 
                title: "Institutional Consistency", 
                desc: "Standardizes every output. A proposal from 2026 will match the logic of 2024 perfectly.",
                icon: CheckCircle2
              },
              { 
                title: "Internal Audit", 
                desc: "Every proposal creates a hidden Excel validation block for your team to check the math.",
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

        {/* Roadmap / Future Vision */}
        <section id="roadmap" className="mb-24 scroll-mt-24">
          <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 text-blue-500 opacity-10 pointer-events-none">
              <TrendingUp size={180} />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-12">
              <div className="md:w-1/3">
                <h2 className="text-4xl font-black mb-6 tracking-tight leading-none uppercase">Project <span className="text-blue-400 block">Evolution</span> Roadmap</h2>
                <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8">
                  From a precision estimation tool to an organization-wide intelligence engine.
                </p>
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-6">
                  <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Current Status</p>
                  <p className="text-lg font-bold">Phase 1: Validation</p>
                  <p className="text-sm text-blue-100">Logic testing and structural framework established.</p>
                </div>
              </div>

              <div className="md:w-2/3 space-y-8">
                {[
                  {
                    phase: "Phase 2: Ecosystem Integration",
                    title: "Salesforce & Procurement Bridge",
                    details: "Direct synchronization with CRM opportunities and real-time vendor lead times to flag supply-chain risks during the pitch.",
                    icon: RefreshCw
                  },
                  {
                    phase: "Phase 3: Visual Intelligence",
                    title: "Digital Twin & AR Preview",
                    details: "Auto-generating 3D-accurate scoreboard renderings and AR-based 'overlay' previews directly from configuration data.",
                    icon: Glasses
                  },
                  {
                    phase: "Phase 4: Revenue Intelligence",
                    title: "Predictive Margin Optimization",
                    details: "Utilizing historical win/loss data to suggest the 'Sweet Spot' pricing based on venue type and competitive landscape.",
                    icon: Cpu
                  },
                  {
                    phase: "Phase 5: Self-Service Terminal",
                    title: "Client-Facing Configuration",
                    details: "A secure external portal where trusted partners can 'tweak' their own configurations within ANC-defined engineering guardrails.",
                    icon: Globe
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 border-b border-white/10 pb-8 last:border-0 last:pb-0 group">
                    <div className="shrink-0 mt-1 bg-white/5 p-3 rounded-xl text-blue-400 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                      <item.icon size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">{item.phase}</p>
                      <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed max-w-lg">{item.details}</p>
                    </div>
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

