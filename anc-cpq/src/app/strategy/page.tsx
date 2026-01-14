'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const StrategyPage = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Executive Overview' },
    { id: 'capabilities', label: 'Current Capabilities' },
    { id: 'architecture', label: 'Technical SOW' },
    { id: 'growth', label: 'Strategic Roadmap' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = menuItems.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(menuItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex">
      {/* Sidebar Navigation */}
      <aside className="fixed top-0 left-0 w-80 h-screen border-r border-slate-100 bg-slate-50/50 hidden lg:flex flex-col p-8 z-50">
        <div className="mb-12">
          <div className="bg-[#003366] text-white px-3 py-1 font-black text-xl tracking-tighter rounded inline-block mb-2">
            ANC
          </div>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block">Strategic Assessment</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">SOW | Version 1.0.5</p>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all border-l-2 ${activeSection === item.id
                  ? 'border-[#003366] text-[#003366] bg-white'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-100">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            Confidential & Proprietary <br />
            © 2026 ANC Sports
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-80 min-h-screen px-8 md:px-20 py-24 max-w-5xl">
        {/* Executive Overview */}
        <section id="overview" className="mb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Badge variant="outline" className="mb-6 border-[#003366]/30 text-[#003366] px-4 py-1 font-bold rounded-none uppercase tracking-widest text-[10px]">
            Section 01: Vision & ROI
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black text-[#003366] mb-8 tracking-tighter leading-tight">
            THE STATEMENT <br />OF WORK.
          </h1>
          <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mb-12">
            This document outlines the strategic implementation of the ANC Proposal Engine—a high-fidelity automation pipeline designed to eliminate the manual loops of institution-scale estimation.
          </p>

          <div className="grid md:grid-cols-2 gap-12 pt-12 border-t border-slate-100">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-[#003366] uppercase tracking-widest">Business Objectives</h3>
              <ul className="space-y-4 text-sm text-slate-600 font-medium">
                <li className="flex gap-4">
                  <span className="text-[#003366] font-black">01</span>
                  <span>Eliminate the 4-hour manual bottleneck in the proposal cycle.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-[#003366] font-black">02</span>
                  <span>Enable precision scaling to projects involving 40+ concurrent screens.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-[#003366] font-black">03</span>
                  <span>Codify institutional pricing logic to prevent human variance.</span>
                </li>
              </ul>
            </div>
            <div className="bg-slate-50 p-8 flex flex-col justify-center border border-slate-100">
              <span className="text-4xl font-black text-[#003366] mb-2">95.4%</span>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Measured Velocity Increase</p>
              <Separator className="my-4 bg-slate-200" />
              <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">
                Reduction in turnaround time from manual Excel loops to automated synthesis.
              </p>
            </div>
          </div>
        </section>

        {/* Current Capabilities */}
        <section id="capabilities" className="mb-32 pt-20">
          <Badge variant="outline" className="mb-6 border-[#003366]/30 text-[#003366] px-4 py-1 font-bold rounded-none uppercase tracking-widest text-[10px]">
            Section 02: Operational Today
          </Badge>
          <h2 className="text-3xl font-black text-[#003366] tracking-tighter uppercase mb-12">Built Capabilities</h2>

          <div className="grid grid-cols-1 gap-12">
            {[
              {
                title: "Geospatial Intake IQ",
                features: ["Venue Auto-Identification", "Address Verification", "Serper API Integration"],
                benefit: "Eliminates the 'Google Search' loop for project site details, ensuring structural data matches exact physical coordinates instantly."
              },
              {
                title: "Contextual Extraction Wizard",
                features: ["Natural Language Processing", "Spec Sheet OCR", "Multi-Screen Support"],
                benefit: "Converts conversational client briefs or text-heavy bid documents into structured engineering data points without manual typing."
              },
              {
                title: "Recursive Calculation Engine",
                features: ["Automated Pricing Multipliers", "Formula Integrity", "State Persistence"],
                benefit: "Ensures every project follows the exact same fiscal logic. State persistence allows estimators to handle 40+ screens over multiple sessions without data loss."
              },
              {
                title: "Dual Asset Synthesis",
                features: ["Branded Executive PDF", "Audit-Ready Excel", "Formula Preservation"],
                benefit: "Provides the client with a premium branded proposal while simultaneously generating a ~20-tab Excel backup for internal auditor validation."
              }
            ].map((cap, i) => (
              <div key={i} className="group border-b border-slate-100 pb-12 last:border-0">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-full md:w-1/3">
                    <h3 className="text-lg font-black text-[#003366] uppercase tracking-tight mb-4 group-hover:text-blue-600 transition-colors">{cap.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {cap.features.map((f, j) => (
                        <Badge key={j} className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none px-2 py-0 text-[8px] font-black uppercase tracking-tighter rounded-none">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Core Benefit</p>
                    <p className="text-slate-600 font-medium leading-relaxed italic border-l-4 border-slate-100 pl-6">
                      "{cap.benefit}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Architecture */}
        <section id="architecture" className="mb-32 pt-20">
          <Badge variant="outline" className="mb-6 border-[#003366]/30 text-[#003366] px-4 py-1 font-bold rounded-none uppercase tracking-widest text-[10px]">
            Section 03: Logic & Architecture
          </Badge>
          <h2 className="text-3xl font-black text-[#003366] tracking-tighter uppercase mb-12">Technical Framework</h2>

          <div className="space-y-12">
            <p className="text-lg text-slate-600 font-medium max-w-3xl">
              The engine operates on a proprietary recursive logic loop that isolates sensitive financial multipliers from the generative interface.
            </p>

            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  title: "Fiscal Rule: 20% Structural Overhead",
                  content: "As derived from institutional best practices, the engine applies a recursive 20% multiplier to the base LED hardware cost for structural materials. This is an immutable logic gate that can only be overridden by designated estimators."
                },
                {
                  title: "Fiscal Rule: 15% Installation Multiplier",
                  content: "Labor and installation costs are indexed at 15% of the total hardware + materials sum. This logic provides a consistent 'SOW Baseline' for all out-of-town or complex stadium projects."
                },
                {
                  title: "Logic Firewall Isolation",
                  content: "Crucially, the 'Intelligence' (LLM) only handles communication and extraction. The 'Logic' (Pricing Engine) is a separate, private Python module. Not a single dollar value is 'guessed' by AI."
                },
                {
                  title: "Database Cascade Protocol",
                  content: "A strict data governance layer ensures that project deletions trigger a full recursive purge of all associated shared proposals and temporary calculations, maintaining 100% data hygiene."
                }
              ].map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-slate-100 py-4">
                  <AccordionTrigger className="text-sm font-black text-[#003366] hover:no-underline uppercase tracking-widest text-left">
                    {item.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-500 font-medium leading-relaxed pt-4">
                    {item.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Strategic Growth (Roadmap) */}
        <section id="growth" className="mb-32 pt-20">
          <Badge variant="outline" className="mb-6 border-[#003366]/30 text-[#003366] px-4 py-1 font-bold rounded-none uppercase tracking-widest text-[10px]">
            Section 04: The Roadmap
          </Badge>
          <h2 className="text-3xl font-black text-[#003366] tracking-tighter uppercase mb-8 text-center md:text-left">Strategic Roadmap</h2>
          <p className="text-slate-600 font-medium max-w-2xl mb-12 text-center md:text-left">
            While V1 is fully operational for estimation speed, the system is architected for a multi-phase integration into the broader ANC ecosystem.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-slate-100 rounded-none shadow-none bg-slate-900 text-white p-8 space-y-4 md:col-span-2 group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full"></div>
              <Badge className="bg-blue-500 text-white border-none rounded-none text-[8px] font-black uppercase tracking-widest">Phase 02: Synergy</Badge>
              <h3 className="text-2xl font-black uppercase tracking-tight">Salesforce CRM Integration</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xl">
                The target objective for Q1 is the automated triggering of proposals based on Salesforce Lead status. This will bypass the manual portal, generating spec sheets the moment an opportunity is created.
              </p>
            </Card>

            <Card className="border-slate-100 rounded-none shadow-none bg-slate-50 p-8 space-y-4 hover:border-[#003366]/30 transition-all group">
              <Badge variant="outline" className="border-[#003366]/30 text-[#003366] rounded-none text-[8px] font-black uppercase tracking-widest">Phase 03: Supply</Badge>
              <h3 className="text-xl font-black uppercase text-[#003366] tracking-tight group-hover:text-blue-600 transition-colors">Vendor Inventory Sync</h3>
              <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed">
                Direct API connection to vendor catalogs to ensure quoted hardware pixel pitches and availability are perpetually up-to-date.
              </p>
            </Card>

            <Card className="border-slate-100 rounded-none shadow-none bg-slate-50 p-8 space-y-4 hover:border-[#003366]/30 transition-all group">
              <Badge variant="outline" className="border-[#003366]/30 text-[#003366] rounded-none text-[8px] font-black uppercase tracking-widest">Phase 04: Analytics</Badge>
              <h3 className="text-xl font-black uppercase text-[#003366] tracking-tight group-hover:text-blue-600 transition-colors">Lifecycle Analytics</h3>
              <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed">
                Win/Loss intelligence tied back to technical screen specifications to optimize competitive bidding logic over time.
              </p>
            </Card>
          </div>
        </section>

        {/* Footer SOW Footer */}
        <footer className="pt-24 pb-12 border-t border-slate-100 mt-24">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 group">
            <div className="space-y-4">
              <span className="text-[10px] font-black text-slate-400 tracking-[0.4em] uppercase">Strategic Partner</span>
              <h3 className="text-3xl font-black tracking-[0.2em] text-[#003366] group-hover:tracking-[0.25em] transition-all uppercase">Basheer</h3>
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed text-center md:text-right">
              ANC Sports Enterprises, LLC <br />
              Authorized Personnel Only <br />
              CLASSIFIED: STRATEGIC_ASSET_ANC_INTELLIGENCE
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default StrategyPage;
