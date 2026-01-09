import React from 'react';
import { CPQInput, ProductClass, Environment, Shape, Access, Complexity } from '../lib/types';
import { User, MapPin, Monitor, Layers, Maximize, Zap, Hammer } from 'lucide-react';

interface WizardProps {
    data: CPQInput;
    onChange: (field: keyof CPQInput, value: any) => void;
}

export function Wizard({ data, onChange }: WizardProps) {
    return (
        <div className="bg-slate-900 border-r border-slate-800 h-full p-8 overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    ANC CPQ Engine
                </h1>
                <p className="text-slate-500 text-sm">Configure your display parameters</p>
            </header>

            <div className="space-y-8">
                {/* 1. Project Info */}
                <section className="space-y-4">
                    <h2 className="text-blue-500 font-semibold uppercase text-xs tracking-wider flex items-center gap-2">
                        <User size={14} /> Project Metadata
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        <input
                            type="text"
                            value={data.clientName}
                            onChange={(e) => onChange('clientName', e.target.value)}
                            placeholder="Client Name"
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <input
                            type="text"
                            value={data.projectName}
                            onChange={(e) => onChange('projectName', e.target.value)}
                            placeholder="Project / Location"
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </section>

                {/* 2. Display Config */}
                <section className="space-y-4">
                    <h2 className="text-blue-500 font-semibold uppercase text-xs tracking-wider flex items-center gap-2">
                        <Monitor size={14} /> Display Configuration
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-400 text-xs mb-2">Product Class</label>
                            <select
                                value={data.productClass}
                                onChange={(e) => onChange('productClass', e.target.value as ProductClass)}
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
                            >
                                <option value="Ribbon">Ribbon Board</option>
                                <option value="Scoreboard">Scoreboard</option>
                                <option value="CenterHung">Center Hung</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-xs mb-2">Pixel Pitch</label>
                            <select
                                value={data.pixelPitch}
                                onChange={(e) => onChange('pixelPitch', parseInt(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
                            >
                                <option value={10}>10mm</option>
                                <option value={6}>6mm</option>
                                <option value={4}>4mm</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-400 text-xs mb-2">Width (ft)</label>
                            <input
                                type="number"
                                value={data.widthFt}
                                onChange={(e) => onChange('widthFt', parseFloat(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-xs mb-2">Height (ft)</label>
                            <input
                                type="number"
                                value={data.heightFt}
                                onChange={(e) => onChange('heightFt', parseFloat(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>
                </section>

                {/* 3. Logic Drivers */}
                <section className="space-y-4 pt-4 border-t border-slate-800">
                    <h2 className="text-emerald-500 font-semibold uppercase text-xs tracking-wider flex items-center gap-2">
                        <Zap size={14} /> Cost Drivers
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <span className="text-sm text-slate-300">Environment</span>
                            <div className="flex bg-slate-900 rounded p-1">
                                {['Indoor', 'Outdoor'].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => onChange('environment', opt as Environment)}
                                        className={`px-3 py-1 text-xs rounded transition-all ${data.environment === opt
                                                ? 'bg-blue-600 text-white shadow'
                                                : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3">
                            <div>
                                <label className="block text-slate-400 text-xs mb-1">Shape / Structure</label>
                                <select
                                    value={data.shape}
                                    onChange={(e) => onChange('shape', e.target.value as Shape)}
                                    className="w-full bg-slate-900 border border-slate-600 text-white rounded px-2 py-1 text-sm"
                                >
                                    <option value="Flat">Flat (Standard)</option>
                                    <option value="Curved">Curved (+20% Struct)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-400 text-xs mb-1">Service Access</label>
                                <select
                                    value={data.access}
                                    onChange={(e) => onChange('access', e.target.value as Access)}
                                    className="w-full bg-slate-900 border border-slate-600 text-white rounded px-2 py-1 text-sm"
                                >
                                    <option value="Front">Front Access</option>
                                    <option value="Rear">Rear Access (+15% Labor)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
