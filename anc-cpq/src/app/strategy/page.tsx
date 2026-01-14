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
import {
  ShieldCheck,
  Database,
  Zap,
  Lock,
  FileText,
  ArrowRight,
  HelpCircle,
  Cpu,
  BarChart3,
  Globe,
  Monitor,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  FileEdit,
  MapPin,
  Search,
  Clock,
  Users,
  AlertTriangle,
  Workflow,
  Truck,
  Wrench,
  Calculator,
  ClipboardCheck,
  Link2,
  GitBranch,
  Layers,
  Building2,
  HardHat,
  Construction,
  Factory,
  Building,
  Sparkles,
  Command,
  Target,
} from 'lucide-react';

const StrategyPage = () => {
  const [activeTab, setActiveTab] = useState('vision');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const kpis = [
    { label: "Velocity", value: "85%", sub: "Estimation Time Reduction", icon: Zap, color: "from-blue-500 to-cyan-400" },
    { label: "Precision", value: "99.9%", sub: "Calculation Accuracy", icon: Target, color: "from-purple-500 to-indigo-400" },
    { label: "Security", value: "IronClad", sub: "Proprietary Logic Shield", icon: Lock, color: "from-emerald-500 to-teal-400" },
    { label: "Scalability", value: "Enterprise", sub: "Multi-Region Ready", icon: Globe, color: "from-orange-500 to-amber-400" },
  ];

  const phases = [
    {
      title: "Tactical Alpha (Current)",
      description: "Establishing the core estimation logic and data normalization engine.",
      status: "active",
      items: [
        { icon: Calculator, label: "Recursive Pricing Engine" },
        { icon: MapPin, label: "Geospatial Address Intelligence" },
        { icon: FileText, label: "Automated PDF/Excel Synthesis" },
      ]
    },
    {
      title: "Phase 2: CRM Neural Link",
      description: "Deep integration with Salesforce and historical project databases.",
      status: "planned",
      items: [
        { icon: Link2, label: "Salesforce Bi-Directional Bridge" },
        { icon: GitBranch, label: "Historical Win-Loss Analytics" },
        { icon: Database, label: "Institutional Memory Sync" },
      ]
    },
    {
      title: "Phase 3: Logic Autonomous",
      description: "Expanding to full project lifecycle and supply chain awareness.",
      status: "planned",
      items: [
        { icon: Truck, label: "Vendor Lead-Time Oracle" },
        { icon: Users, label: "Automated Crew Allocation" },
        { icon: AlertTriangle, label: "Proactive Risk Mitigation" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      {/* Premium Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-[#020617]/80 backdrop-blur-md border-white/10' : 'bg-transparent border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white p-2 rounded-lg flex items-center justify-center">
                <span className="text-[#003366] font-black text-xl tracking-tighter">ANC</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-white leading-none">STRATEGIC COMMAND</span>
              <span className="text-[10px] text-blue-400 font-bold tracking-[0.2em] uppercase mt-1">Implementation Portal</span>
            </div>
          </div>
          <div className="flex gap-4">
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 px-3 py-1 transition-all pointer-events-none">
              v1.2.0 • PRODUCTION
            </Badge>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl aspect-square bg-blue-600/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Badge variant="outline" className="mb-8 border-blue-500/30 text-blue-400 px-4 py-1.5 bg-blue-500/5 rounded-full backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles size={14} className="mr-2 inline-block" />
            ENTERPRISE CPQ ARCHITECTURE
          </Badge>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700">
            STRATEGY <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">WITHOUT</span> LIMITS.
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            The next generation of ANC proposal intelligence. Transforming human complex calculation into autonomous enterprise-grade precision.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {kpis.map((kpi, i) => (
              <div key={i} className="group relative p-[1px] rounded-2xl bg-white/5 hover:bg-gradient-to-br transition-all duration-500 overflow-hidden hover:from-blue-500/50 hover:to-cyan-400/50">
                <div className="relative h-full bg-[#0f172a]/95 rounded-2xl p-6 backdrop-blur-xl flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} p-[1px] mb-4 group-hover:scale-110 transition-transform duration-500`}>
                    <div className="w-full h-full bg-[#0f172a] rounded-xl flex items-center justify-center">
                      <kpi.icon className="text-blue-400" size={20} />
                    </div>
                  </div>
                  <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-1">{kpi.label}</span>
                  <span className="text-3xl font-black text-white mb-1">{kpi.value}</span>
                  <span className="text-[10px] font-bold text-blue-400/80">{kpi.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20 pb-40">
        <Tabs defaultValue="overview" className="space-y-12">
          <div className="flex justify-center">
            <TabsList className="bg-slate-900/50 border border-white/5 p-1 rounded-full h-auto backdrop-blur-md">
              <TabsTrigger value="overview" className="rounded-full px-8 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all text-sm font-bold">THE VISION</TabsTrigger>
              <TabsTrigger value="intelligence" className="rounded-full px-8 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all text-sm font-bold">CORE INTELLIGENCE</TabsTrigger>
              <TabsTrigger value="roadmap" className="rounded-full px-8 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all text-sm font-bold">EVOLUTION ROADMAP</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 backdrop-blur-md">
                  <Badge className="bg-blue-500/20 text-blue-300 mb-4 px-3 py-0.5 pointer-events-none">EXECUTIVE SUMMARY</Badge>
                  <h3 className="text-3xl font-black text-white mb-4">Institutional Consistency. <br />Digitally Codified.</h3>
                  <p className="text-slate-400 leading-relaxed font-medium">
                    The ANC CPQ Strategy is not just a calculator—it is the digital embodiment of your organizational knowledge. By decoupling proprietary logic from the user interface, we ensure that every proposal is inherently accurate, secure, and professional.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { title: "Legacy Problem", value: "Fractured Excel files, inconsistent margins, and slow turnarounds.", type: "negative" },
                    { title: "ANC Solution", value: "Unified cloud logic, autonomous validation, and instant generation.", type: "positive" }
                  ].map((it, i) => (
                    <div key={i} className={`p-6 rounded-2xl border ${it.type === 'negative' ? 'border-red-500/10 bg-red-500/5' : 'border-emerald-500/10 bg-emerald-500/5'}`}>
                      <h4 className={`text-xs font-black uppercase tracking-wider mb-2 ${it.type === 'negative' ? 'text-red-400' : 'text-emerald-400'}`}>{it.title}</h4>
                      <p className="text-sm font-medium text-slate-300">{it.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-4 bg-blue-600/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="relative p-1 rounded-3xl bg-gradient-to-br from-white/10 to-white/0 border border-white/10 overflow-hidden shadow-2xl">
                  <div className="bg-[#0f172a] p-8 rounded-[1.4rem]">
                    <div className="flex items-center justify-between mb-8">
                      <div className="text-sm font-black tracking-widest text-slate-500">SYSTEM ARCHITECTURE</div>
                      <Badge variant="outline" className="border-blue-500/30 text-blue-400">ENCRYPTED LAYER</Badge>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: "User Input Engine", status: "Active", width: "100%", color: "bg-blue-500" },
                        { label: "Pydantic Validation Proxy", status: "Active", width: "100%", color: "bg-blue-500" },
                        { label: "Recursive Margin Module", status: "Encrypted", width: "100%", color: "bg-purple-500" },
                        { label: "PDF/Excel Synthesis", status: "Active", width: "100%", color: "bg-cyan-500" }
                      ].map((bar, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1">
                            <span className="text-slate-400">{bar.label}</span>
                            <span className={bar.color.replace('bg-', 'text-')}>{bar.status}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${bar.color} rounded-full transition-all duration-1000 delay-${i * 200}`} style={{ width: bar.width }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="intelligence">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Smart Intake Wizard",
                  icon: MessageSquare,
                  desc: "Adaptive question flows that learn the project type and hide irrelevant noise. Optimized for speed and completeness.",
                  features: ["Context-Aware Questions", "Field Dependency Logic", "Real-time Validation"]
                },
                {
                  title: "Geospatial Lookup",
                  icon: MapPin,
                  desc: "Automatic venue identification. Pulls historical structural data and electrical requirements based on the physical address.",
                  features: ["Serper.dev Integration", "Structural Data Retrieval", "Labor Zone Verification"]
                },
                {
                  title: "Proprietary Engine",
                  icon: Calculator,
                  desc: "The 'Golden Formula' layer. High-precision calculations for LED hardware, labor, and margins—fully nested and recursive.",
                  features: ["Margin Shielding", "Dynamic Union Rates", "Multi-Component Handling"]
                }
              ].map((item, i) => (
                <Card key={i} className="bg-white/5 border-white/5 backdrop-blur-sm group hover:bg-white/10 transition-all duration-500">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <item.icon className="text-blue-400" size={24} />
                    </div>
                    <CardTitle className="text-xl font-bold text-white">{item.title}</CardTitle>
                    <CardDescription className="text-slate-400 font-medium">{item.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {item.features.map((feat, j) => (
                        <div key={j} className="flex items-center gap-3 text-sm font-semibold text-slate-300">
                          <CheckCircle2 size={16} className="text-blue-500" />
                          {feat}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="roadmap">
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 via-purple-600 to-transparent opacity-20 hidden md:block"></div>
              <div className="space-y-12">
                {phases.map((phase, i) => (
                  <div key={i} className="relative md:pl-24 group">
                    <div className={`hidden md:flex absolute left-6 top-0 w-5 h-5 rounded-full border-4 border-[#020617] items-center justify-center z-10 transition-all duration-500 group-hover:scale-125 ${phase.status === 'active' ? 'bg-blue-500 ring-4 ring-blue-500/20' : 'bg-slate-800'}`}></div>
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-8 backdrop-blur-md group-hover:bg-white/10 transition-all duration-500">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-black text-white uppercase tracking-tight">{phase.title}</h3>
                          <p className="text-slate-400 font-medium max-w-xl">{phase.description}</p>
                        </div>
                        <Badge className={`${phase.status === 'active' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'} font-bold uppercase tracking-widest text-[10px] px-3 py-1`}>
                          {phase.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-6">
                        {phase.items.map((it, j) => (
                          <div key={j} className="flex items-center gap-3 p-4 rounded-xl bg-slate-950/50 border border-white/5 group-hover:border-blue-500/20 transition-colors">
                            <it.icon size={18} className="text-blue-400" />
                            <span className="text-sm font-bold text-slate-300">{it.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Security Section Overhaul */}
        <div className="mt-40">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Security By Design.</h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto">Proprietary business intelligence is protected by an architectural firewall between user experience and logic.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10 group hover:border-red-500/20 transition-all">
              <Lock className="text-red-500 mb-6" size={32} />
              <h3 className="text-xl font-black text-white mb-3">Logic Firewall</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">Margin structures and multiplier tables are processed server-side in an isolated environment. Zero exposure to external AI services.</p>
            </div>
            <div className="p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10 group hover:border-blue-500/20 transition-all">
              <ShieldCheck className="text-blue-500 mb-6" size={32} />
              <h3 className="text-xl font-black text-white mb-3">Institutional Proof</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">Hidden parity blocks in PDF and Excel exports verify calculation integrity, preventing unauthorized modifications.</p>
            </div>
            <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 group hover:border-emerald-500/20 transition-all">
              <CheckCircle2 className="text-emerald-500 mb-6" size={32} />
              <h3 className="text-xl font-black text-white mb-3">Audit Transparency</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">Every proposal is logged with a full metadata trace, ensuring 100% accountability for every generated quotation.</p>
            </div>
          </div>
        </div>

        {/* Premium FAQ */}
        <div className="mt-40 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Strategy FAQ.</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {[
              {
                q: "How does the system ensure pricing accuracy without legacy files?",
                a: "The architecture uses a recursive logic framework built from validated business rules. It can ingest live encrypted CSV or API data from your official supply chain partners in milliseconds."
              },
              {
                q: "Is the proprietary information protected from AI learning?",
                a: "Yes. Our implementation uses an 'Input-Only' pattern for LLMs. The AI never sees your margins or costs. It only extracts data from descriptions; the actual math happens in a traditional, secure Python layer."
              },
              {
                q: "What is the primary benefit for the sales engineering team?",
                a: "Velocity and Consistency. A complex multi-screen proposal that used to take 4 hours now takes 90 seconds, with the guarantee that the math matches institutional standards perfectly."
              }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-white/5 bg-white/5 rounded-2xl px-6">
                <AccordionTrigger className="text-left font-bold py-6 text-slate-200 hover:text-white hover:no-underline">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-slate-400 font-medium pb-6 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Footer Signature */}
        <footer className="mt-60 text-center border-t border-white/5 pt-20">
          <div className="inline-flex flex-col items-center">
            <span className="text-[10px] font-black text-blue-400 tracking-[0.5em] uppercase mb-8">Strategic Partner</span>
            <div className="relative group">
              <div className="absolute -inset-4 bg-blue-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-white/5 border border-white/10 px-12 py-6 rounded-2xl backdrop-blur-md">
                <span className="text-3xl font-black tracking-[0.2em] text-white">B A S H E E R</span>
              </div>
            </div>
            <p className="mt-12 text-slate-600 text-[10px] font-bold tracking-widest uppercase">
              © 2026 ANC AUTOMATED PROPOSAL INITIATIVE • ALL RIGHTS RESERVED
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default StrategyPage;
