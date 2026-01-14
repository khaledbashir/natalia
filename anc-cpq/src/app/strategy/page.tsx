'use client';

import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ShieldCheck,
  Database,
  Zap,
  Settings,
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
} from 'lucide-react';

const StrategyPage = () => {
  const [intakeMethod, setIntakeMethod] = useState('wizard');

  const naturalLanguageExample = {
    venue: "Madison Square Garden",
    address: "4 Pennsylvania Plaza, NY",
    details: {
      product: "scoreboard",
      pitch: "6mm",
      dimensions: "40 by 20 feet",
      environment: "indoor, flat",
      mounting: "wall mounted",
      installation: "front access",
      structure: "existing steel structure",
      labor: "union labor"
    },
    aiExtracted: ["Address identified & validated", "Product type: Scoreboard", "Pitch: 6mm confirmed", "Union labor requirement detected", "Missing: Power requirements", "Missing: Mounting height", "Missing: Content management system preference"]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="sticky top-0 z-50 bg-[#003366] text-white shadow-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg shadow-lg">
              <span className="text-[#003366] font-black text-xl tracking-tighter">ANC</span>
            </div>
            <span className="font-semibold tracking-tight text-sm md:text-base">Strategy & Implementation Portal</span>
          </div>
          <div className="hidden md:flex gap-2">
            <Badge variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 cursor-pointer">
              Phase 1: Validation
            </Badge>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-[#003366]/10 text-[#003366] px-4 py-2 rounded-full text-xs font-bold mb-6">
            <ShieldCheck size={14} />
            ENTERPRISE CPQ STRATEGY DOCUMENT
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            ANC <span className="text-[#003366]">Proposal Engine</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Transforming complex estimation workflows into intelligent, consistent, and scalable proposals.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { label: "Time Saved", value: "85%", icon: Clock, color: "bg-green-100 text-green-700" },
            { label: "Accuracy", value: "100%", icon: CheckCircle2, color: "bg-blue-100 text-blue-700" },
            { label: "Data Protection", value: "Zero", sub: "External Exposure", icon: Lock, color: "bg-purple-100 text-purple-700" },
            { label: "Users", value: "∞", icon: Users, color: "bg-orange-100 text-orange-700" },
          ].map((stat, i) => (
            <Card key={i} className="border-2 border-slate-200 hover:border-[#003366] transition-colors">
              <CardContent className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 ${stat.color}`}>
                  <stat.icon size={18} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                {stat.sub && <p className="text-[10px] text-slate-500 font-semibold">{stat.sub}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-16 border-2 border-slate-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-[#003366] to-[#004d99] text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Workflow className="w-6 h-6" />
              Intelligent Intake Methods
            </CardTitle>
            <CardDescription className="text-blue-100 text-base">
              Choose how you want to provide project specifications. The AI extracts and validates all requirements automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={intakeMethod} onValueChange={setIntakeMethod} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="wizard" className="gap-2">
                  <MessageSquare size={16} />
                  Question Wizard
                </TabsTrigger>
                <TabsTrigger value="form" className="gap-2">
                  <FileEdit size={16} />
                  Structured Form
                </TabsTrigger>
                <TabsTrigger value="natural" className="gap-2">
                  <Globe size={16} />
                  Natural Language
                </TabsTrigger>
              </TabsList>

              <TabsContent value="wizard" className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-[#003366] p-2 rounded-lg text-white">
                      <MessageSquare size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">Adaptive Question Wizard</h3>
                      <p className="text-slate-600 text-sm mb-4">Answer questions one at a time. The wizard adapts based on your answers, skipping irrelevant questions.</p>
                      <div className="space-y-3">
                        {[
                          "What type of venue are you working with?",
                          "What's the address? (Auto-validates & retrieves structural data)",
                          "What display product do you need?",
                          "What's the required pixel pitch?",
                          "Mounting location and method?",
                          "Union labor requirements?",
                        ].map((q, i) => (
                          <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${i === 0 ? 'bg-[#003366] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-white text-[#003366]' : 'bg-slate-100 text-slate-400'}`}>
                              {i + 1}
                            </div>
                            <span className="text-sm">{q}</span>
                            {i === 1 && <MapPin size={14} className="ml-auto text-yellow-400" />}
                            {i === 0 && <ArrowRight size={16} className="ml-auto opacity-50" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="form" className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#003366] p-2 rounded-lg text-white">
                      <FileEdit size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">Structured Form</h3>
                      <p className="text-slate-600 text-sm mb-4">Fill out all specifications at once. Best for experienced users who know exactly what they need.</p>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: "Venue Name", placeholder: "e.g., Madison Square Garden" },
                          { label: "Address", placeholder: "4 Pennsylvania Plaza, NY", icon: <MapPin size={14} className="text-[#003366]" /> },
                          { label: "Product Type", placeholder: "Scoreboard, Ribbon, etc." },
                          { label: "Pixel Pitch", placeholder: "6mm, 10mm, etc." },
                          { label: "Dimensions (ft)", placeholder: "40 x 20" },
                          { label: "Environment", placeholder: "Indoor/Outdoor" },
                        ].map((field, i) => (
                          <div key={i} className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 uppercase">{field.label}</label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder={field.placeholder}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366]"
                              />
                              {field.icon && <div className="absolute right-3 top-1/2 -translate-y-1/2">{field.icon}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          <Search size={12} className="mr-1" />
                          Address Lookup Active
                        </Badge>
                        <span className="text-xs">Auto-validates venue & retrieves structural data</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="natural" className="space-y-4">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg p-6 border border-slate-700">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-500 p-2 rounded-lg text-white">
                      <Globe size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">Natural Language Processing</h3>
                      <p className="text-slate-300 text-sm mb-4">Describe your project in plain English. The AI extracts all specifications and asks only what's missing.</p>

                      <div className="bg-slate-950/50 rounded-lg p-4 mb-4 font-mono text-sm leading-relaxed border border-slate-700">
                        <p>"Hi, I'm <span className="text-green-400 font-bold">Madison Square Garden</span>. Address is <span className="text-yellow-400 font-bold">4 Pennsylvania Plaza, NY</span>. I need a <span className="text-blue-400 font-bold">scoreboard</span>, <span className="text-purple-400 font-bold">6mm pitch</span>, <span className="text-orange-400 font-bold">40 by 20 feet</span>. It's indoor, flat, wall mounted. Technicians will use front access and we have existing steel structure. We need <span className="text-red-400 font-bold">union labor</span>."</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <CheckCircle2 size={16} className="text-green-500" />
                              AI Extracted Specifications
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {[
                              { label: "Venue", value: "Madison Square Garden" },
                              { label: "Address", value: "4 Pennsylvania Plaza, NY" },
                              { label: "Product", value: "Scoreboard" },
                              { label: "Pitch", value: "6mm" },
                              { label: "Dimensions", value: "40 × 20 ft" },
                              { label: "Environment", value: "Indoor" },
                              { label: "Mounting", value: "Wall-mounted, front access" },
                              { label: "Structure", value: "Existing steel" },
                              { label: "Labor", value: "Union required" },
                            ].map((item, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-slate-500">{item.label}</span>
                                <span className="font-semibold">{item.value}</span>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        <Card className="border-orange-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
                              <AlertTriangle size={16} />
                              Questions Remaining
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {[
                              "What are the power requirements?",
                              "What mounting height is preferred?",
                              "Content management system preference?",
                              "Timeline for installation?",
                              "Budget constraints?",
                              "Specific content requirements?",
                            ].map((q, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-orange-700">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                {q}
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </div>

                      <div className="mt-4 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-semibold text-blue-200 mb-2">
                          <MapPin size={16} />
                          Address Intelligence
                        </div>
                        <p className="text-xs text-blue-100">
                          Address validated against venue database. Structural data retrieved: Ceiling height 80ft, Catwalk access confirmed, Electrical service 480V available.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <Card className="border-2 border-[#003366] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-[#003366] p-2 rounded-lg text-white">
                  <Calculator size={20} />
                </div>
                Real-Time Pricing Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-semibold text-slate-700">Raw Materials</span>
                  <Badge variant="outline" className="bg-green-100 text-green-700">Calculated</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-semibold text-slate-700">Labor Hours</span>
                  <Badge variant="outline" className="bg-green-100 text-green-700">Union Rates</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-semibold text-slate-700">Environmental Factors</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700">Applied</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-semibold text-slate-700">Margin Multipliers</span>
                  <Badge variant="outline" className="bg-purple-100 text-purple-700">Protected</Badge>
                </div>
              </div>
              <Separator />
              <div className="p-4 bg-gradient-to-r from-[#003366]/10 to-blue-50 rounded-lg border border-[#003366]/20">
                <p className="text-sm font-semibold text-[#003366]">Every proposal follows the same formula</p>
                <p className="text-xs text-slate-600 mt-1">Margin structures are encrypted and never exposed to external AI services</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-slate-900 p-2 rounded-lg text-white">
                  <Database size={20} />
                </div>
                Institutional Knowledge Base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { icon: Building2, title: "Venue Templates", desc: "Pre-configured specs for stadium types" },
                  { icon: Layers, title: "Product Catalog", desc: "Complete inventory with current pricing" },
                  { icon: ClipboardCheck, title: "Checklist Library", desc: "Installation & commissioning tasks" },
                  { icon: Construction, title: "Labor Standards", desc: "Union rates and time estimates" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <item.icon size={16} className="text-[#003366] mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-16 border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <TrendingUp size={28} className="text-[#003366]" />
              Evolution Roadmap
            </CardTitle>
            <CardDescription className="text-base">
              Strategic phases for system enhancement and integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                {
                  phase: "Phase 2: CRM Integration",
                  status: "Planned",
                  items: [
                    { icon: Link2, title: "Salesforce Bridge", desc: "Auto-populate opportunities from CRM" },
                    { icon: Database, title: "Historical Data", desc: "Leverage past proposals for better estimates" },
                  ]
                },
                {
                  phase: "Phase 3: Supply Chain Intelligence",
                  status: "Planned",
                  items: [
                    { icon: Truck, title: "Vendor Lead Times", desc: "Real-time inventory & delivery estimates" },
                    { icon: AlertTriangle, title: "Risk Alerts", desc: "Flag potential supply chain issues early" },
                  ]
                },
                {
                  phase: "Phase 4: Project Management",
                  status: "Planned",
                  items: [
                    { icon: Users, title: "Team Assignment", desc: "Auto-assign crews based on project type" },
                    { icon: Clock, title: "Timeline Generation", desc: "Detailed project schedules from specs" },
                  ]
                },
                {
                  phase: "Phase 5: Analytics & Optimization",
                  status: "Planned",
                  items: [
                    { icon: BarChart3, title: "Win/Loss Analysis", desc: "Learn from proposal outcomes" },
                    { icon: Calculator, title: "Margin Intelligence", desc: "Optimize pricing based on market data" },
                  ]
                },
                {
                  phase: "Phase 6: Client Portal",
                  status: "Planned",
                  items: [
                    { icon: Globe, title: "Self-Service Configurator", desc: "Trusted partners can build quotes within guardrails" },
                    { icon: FileText, title: "Document Generation", desc: "Clients can download proposals directly" },
                  ]
                },
              ].map((phase, i) => (
                <div key={i} className="border-l-4 border-[#003366] pl-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-[#003366] text-white">{phase.phase}</Badge>
                    <Badge variant="outline" className="text-xs">{phase.status}</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {phase.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                        <item.icon size={18} className="text-[#003366] mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">{item.title}</p>
                          <p className="text-xs text-slate-600">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-16 border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <ShieldCheck size={28} className="text-[#003366]" />
              Security & Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                <Lock className="text-red-600 mb-3" size={24} />
                <h3 className="font-bold text-red-900 mb-2">Proprietary Logic</h3>
                <p className="text-sm text-red-700">Margin formulas and multiplier tables never leave the secure application layer</p>
              </div>
              <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle2 className="text-green-600 mb-3" size={24} />
                <h3 className="font-bold text-green-900 mb-2">Consistency</h3>
                <p className="text-sm text-green-700">Every proposal follows identical calculations regardless of who creates it</p>
              </div>
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
                <FileText className="text-blue-600 mb-3" size={24} />
                <h3 className="font-bold text-blue-900 mb-2">Full Audit Trail</h3>
                <p className="text-sm text-blue-700">Hidden validation blocks verify calculations on every generated proposal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-16 border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <HelpCircle size={28} className="text-[#003366]" />
              Common Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left font-semibold">
                  How is pricing calculated without access to internal Excel files?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600">
                  The system uses a modular logic framework based on documented industry standards and business rules from strategy sessions. The infrastructure is ready to ingest proprietary ANC data via secure API or encrypted upload when data agreements are in place.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left font-semibold">
                  Is our proprietary margin structure protected?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600">
                  Absolutely. The computational logic layer is decoupled from the AI interface. Margin structures, multiplier tables, and vendor costs are processed within a secure private environment and are never used for model training or exposed to external services.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left font-semibold">
                  How are cost updates managed across the organization?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600">
                  Centralized Policy Management allows admins to update cost basis globally. Once committed, all subsequent proposals use updated parameters, ensuring institutional consistency.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left font-semibold">
                  Can the system handle complex multi-zone installations?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600">
                  Yes. The engine supports nested configuration hierarchies where a single master proposal can include multiple subsystems (Main Display, Ribbon, Vomitory) while maintaining individual specs and synchronized labor requirements.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left font-semibold">
                  What is the CRM integration roadmap?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600">
                  The platform-agnostic, API-first architecture includes an Enterprise Bridge that auto-populates from CRM opportunity objects. Client data and historical context flow seamlessly into the CPQ engine.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <footer className="text-center pt-12 border-t border-slate-200">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Implementation Partner</p>
          <div className="inline-block bg-[#003366] text-white px-10 py-5 rounded-xl font-black tracking-widest text-xl shadow-lg">
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
