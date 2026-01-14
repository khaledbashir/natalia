'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const StrategyPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const metrics = [
    { label: "Cycle Velocity", value: "85%", sub: "Reduction in Proposal Turnaround", detail: "4 Hours → 9 Minutes" },
    { label: "Estimation Precision", value: "100%", sub: "Formula-Based Accuracy", detail: "Zero Manual Error Risk" },
    { label: "Unit Capacity", value: "25x", sub: "Annual Proposal Output", detail: "Per Estimator Scaling" },
    { label: "Logic Security", value: "100%", sub: "Isolated IP Protection", detail: "Strict Logic Firewall" },
  ];

  const logicRules = [
    { title: "The 20% Structural Standard", desc: "Materials calculated as a base 20% of LED hardware cost, with dynamic modifiers for curved or rigged deployments." },
    { title: "Recursive Labor Logic", desc: "15% labor overhead applied to combined hardware and materials, indexed for Union vs. Non-Union zones." },
    { title: "Dynamic Contingency", desc: "Automated +5% safety buffer triggered exclusively for Outdoor + New Steel infrastructure projects." },
    { title: "Revenue Integrity", desc: "Nested margins applied to subtotal ensuring 100% calculation consistency across different screen classes." }
  ];

  const testingScenarios = [
    { name: "Happy Path Protocol", status: "Verified", summary: "Linear progression from raw address to completed PDF/Excel synthesis." },
    { name: "Multi-Value Extraction", status: "Verified", summary: "Natural language parsing of complex configurations (e.g., '10mm outdoor ribbon board 40ft wide')." },
    { name: "Zero Value Integrity", status: "Verified", summary: "Ensuring 0 values are handled as valid inputs rather than null triggers." },
    { name: "Database Cascades", status: "Verified", summary: "History pruning ensures all associated messages and shares are wiped upon deletion." }
  ];

  const features = [
    {
      title: "Geospatial Intelligence",
      description: "Automatic venue identification and structural data retrieval based on precise physical addresses using Google Serper.",
      status: "Operational"
    },
    {
      title: "Recursive Calculation Engine",
      description: "High-precision pricing for multi-screen LED systems, including hardware, labor, and nested margins.",
      status: "Operational"
    },
    {
      title: "Intelligent Intake Wizard",
      description: "A context-aware questioning framework that adapts to project specificities in real-time.",
      status: "Operational"
    },
    {
      title: "Executive Document Synthesis",
      description: "Instant generation of professional PDF and Excel proposals with preserved formulas and institutional consistency.",
      status: "Operational"
    }
  ];

  const futureRoadmap = [
    {
      phase: "Phase II: Platform Synergy",
      description: "Deep-level integration with Salesforce CRM and historical project win/loss analytics.",
      time: "Strategic Horizon"
    },
    {
      phase: "Phase III: Supply Chain Autonomy",
      description: "Real-time vendor inventory tracking and proactive lead-time mitigation modules.",
      time: "Strategic Horizon"
    },
    {
      phase: "Phase IV: Lifecycle Intelligence",
      description: "Expanding capabilities into automated crew allocation and project management scheduling.",
      time: "Strategic Horizon"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#003366]/10 font-sans">
      {/* Executive Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/90 backdrop-blur-md border-slate-200' : 'bg-transparent border-transparent'}`}>
        <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#003366] text-white px-3 py-1 font-black text-xl tracking-tighter rounded">
              ANC
            </div>
            <div className="hidden sm:block">
              <span className="font-bold tracking-tight text-[#003366] block leading-none">STRATEGIC ASSESSMENT</span>
              <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1">Proposal Engine Demo</span>
            </div>
          </div>
          <div className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
            DOCUMENT ID: ANC-2026-XQ
          </div>
        </div>
      </nav>

      {/* Proposal Header / Hero */}
      <header className="relative pt-48 pb-24 border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-8 text-center md:text-left">
          <Badge variant="outline" className="mb-6 border-[#003366]/30 text-[#003366] px-4 py-1 font-bold rounded-none uppercase tracking-widest text-[10px]">
            EXECUTIVE DEMO PRESENTATION
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-[#003366] mb-8 tracking-tighter leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
            PROPOSAL INTELLIGENCE <br />SYSTEM OVERVIEW.
          </h1>
          <p className="text-xl text-slate-600 font-medium leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 max-w-2xl">
            This portal summarizes the core technical logic, quantified ROI, and operational integrity of the ANC Proposal Engine—transitioning estimation from manual labor to automated precision.
          </p>

          <div className="flex flex-wrap items-center gap-8 justify-center md:justify-start">
            <div className="inline-flex items-center gap-3 border-l-2 border-[#003366] pl-6 py-2">
              <span className="text-sm font-black text-[#003366]">PREPARED BY</span>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">ANC Strategic Initiatives Team</span>
            </div>
            <div className="inline-flex items-center gap-3 border-l-2 border-slate-200 pl-6 py-2">
              <span className="text-sm font-black text-[#003366]">SYSTEM STATUS</span>
              <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Production Ready</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-24 space-y-32">
        {/* Quantified ROI */}
        <section className="space-y-12">
          <div className="text-center md:text-left space-y-4">
            <h2 className="text-2xl font-black text-[#003366] tracking-tight uppercase">Operational ROI Analysis</h2>
            <div className="w-16 h-1 bg-[#003366] mx-auto md:mx-0"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((m, i) => (
              <div key={i} className="p-6 border border-slate-100 bg-slate-50/30 text-center">
                <span className="text-3xl font-black text-[#003366] block mb-1">{m.value}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">{m.label}</span>
                <p className="text-xs text-slate-600 font-bold leading-tight uppercase">{m.sub}</p>
                <Badge variant="secondary" className="mt-4 bg-[#003366]/5 text-[#003366] rounded-none text-[8px] border-none font-black">{m.detail}</Badge>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Logic Framework */}
        <section className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-[#003366] tracking-tight uppercase">Technical Logic Framework</h2>
            <div className="w-16 h-1 bg-[#003366]"></div>
            <p className="text-slate-500 font-medium pt-2">
              The system eliminates estimation variance by codifying institutional pricing rules into a server-side recursive loop.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {logicRules.map((rule, i) => (
              <div key={i} className="space-y-3 border-l-2 border-slate-100 pl-6 group">
                <h3 className="text-sm font-black text-[#003366] uppercase tracking-widest group-hover:text-blue-600 transition-colors">{rule.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{rule.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Current Capabilities Section */}
        <section className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-[#003366] tracking-tight uppercase">Operational Assets</h2>
            <div className="w-16 h-1 bg-[#003366]"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <Card key={i} className="border-slate-200 rounded-none shadow-none hover:border-[#003366]/40 transition-colors group">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-[#003366] tracking-[0.2em] uppercase">{feature.status}</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#003366] group-hover:translate-x-1 transition-transform">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* The Workflow Process */}
        <section className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-[#003366] tracking-tight uppercase">The Synthesis Process</h2>
            <div className="w-16 h-1 bg-[#003366]"></div>
          </div>

          <div className="relative border-l border-slate-200 pl-10 space-y-16">
            {[
              {
                step: "Intake & Discovery",
                desc: "Data is ingested via natural language, structured forms, or adaptive wizards. The system automatically identifies missing project constraints using context-aware extraction."
              },
              {
                step: "Computational Logic",
                desc: "Proprietary ANC margin structures and engineering requirements are processed server-side. Zero data exposure to external LLMs; the AI only drives the conversation."
              },
              {
                step: "Synthesis & Verification",
                desc: "Results are validated against institutional standards before being compiled into multi-component proposal documents (PDF/Excel) with full formula preservation."
              }
            ].map((it, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[45px] top-0 w-2 h-2 bg-[#003366] ring-8 ring-white"></div>
                <h3 className="text-lg font-bold text-[#003366] mb-2">{it.step}</h3>
                <p className="text-slate-600 font-medium max-w-xl text-sm leading-relaxed">{it.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Verification & Testing */}
        <section className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-[#003366] tracking-tight uppercase">System Verification</h2>
            <div className="w-16 h-1 bg-[#003366]"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testingScenarios.map((test, i) => (
              <div key={i} className="p-8 border border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-black text-[#003366] uppercase tracking-[0.2em]">{test.name}</h4>
                  <Badge className="bg-emerald-100 text-emerald-800 border-none rounded-none text-[8px] font-black uppercase tracking-widest">{test.status}</Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{test.summary}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Future Value / Upsell */}
        <section className="bg-slate-900 text-white p-12 md:p-20 group relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] font-black tracking-[0.4em] text-blue-400 uppercase">Strategic Evolution</span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">THE FUTURE OF <br />ANC INTELLIGENCE.</h2>
            </div>

            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
              Beyond the current demonstration, the system is designed to scale into a holistic business intelligence platform, integrating directly with supply chains and sales operations.
            </p>

            <div className="space-y-6 pt-12 border-t border-white/10">
              {futureRoadmap.map((roadmap, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-white/5 last:border-0">
                  <div className="space-y-1">
                    <h4 className="font-bold text-white">{roadmap.phase}</h4>
                    <p className="text-sm text-slate-400">{roadmap.description}</p>
                  </div>
                  <Badge variant="outline" className="border-white/20 text-blue-400 rounded-none text-[9px] w-fit">
                    {roadmap.time}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Assessment */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-black text-[#003366] tracking-tight uppercase">Operational Security</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">Proprietary business intelligence is isolated behind a tactical logic firewall.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 border border-slate-100 bg-slate-50/50">
              <h4 className="text-sm font-black text-[#003366] uppercase tracking-widest mb-4">Logic Isolation</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">Financial multipliers and margin curves are processed in an isolated Python environment, never shared with AI providers.</p>
            </div>
            <div className="p-8 border border-slate-100 bg-slate-50/50">
              <h4 className="text-sm font-black text-[#003366] uppercase tracking-widest mb-4">Export Integrity</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">PDF and Excel exports contain hidden verification blocks that ensure calculation transparency and auditability.</p>
            </div>
            <div className="p-8 border border-slate-100 bg-slate-50/50">
              <h4 className="text-sm font-black text-[#003366] uppercase tracking-widest mb-4">Data Governance</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">Full metadata tracing for every generated quotation, providing 100% accountability for the proposal lifecycle.</p>
            </div>
          </div>
        </section>

        {/* Final Conclusion / Footnote */}
        <footer className="pt-24 pb-12 text-center space-y-12">
          <Separator className="bg-slate-100" />
          <div className="space-y-8">
            <span className="text-[10px] font-black text-slate-400 tracking-[0.5em] uppercase">Strategic Partner</span>
            <h3 className="text-3xl font-black tracking-[0.25em] text-[#003366]">BASHEER</h3>
            <div className="max-w-xs mx-auto text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              © 2026 ANC AUTOMATED PROPOSAL INITIATIVE <br />
              DEPLOYMENT STATUS: JAN 14 STABLE BUILD <br />
              DOCUMENT CLASSIFICATION: CONFIDENTIAL
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default StrategyPage;
