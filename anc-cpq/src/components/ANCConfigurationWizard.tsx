'use client';

import { useState, useMemo } from 'react';
import {
  Building,
  Monitor,
  Wrench,
  Laptop,
  Shield,
  Clock,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Check,
  Trophy,
  Medal,
  GraduationCap,
  Train,
  Building2,
  ArrowRight,
  Plus,
  Trash2,
  Settings
} from 'lucide-react';

// Types for ANC Configuration
interface VenueType {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  specs: {
    minResolution: string;
    requiresControlRoom?: boolean;
    requiresFinePitch?: boolean;
    requires24x7?: boolean;
    typicalDisplays: string[];
  };
}

interface DisplayType {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  sizePrompt?: string;
  options?: string[];
}

interface ScreenConfig {
  id: string;
  displayType: string;
  widthFt: number;
  heightFt: number;
  pixelPitch: string;
  productClass: string;
  indoor: boolean;
}

interface WizardConfig {
  step: number;
  venueType: string | null;
  screens: ScreenConfig[];
  installation: {
    type: string;
    access: string;
    structural: string;
    electrical: string;
    distanceToPower: number;
  };
  software: {
    cms: string;
    features: string[];
  };
  service: string;
  timeline: {
    duration: string;
    deadline?: string;
  };
  pricing: {
    margin: string;
    contingency: string;
  };
}

const ANC_WIZARD_STEPS = [
  { id: 'venue', title: 'Venue Type', icon: Building },
  { id: 'displays', title: 'Display Configuration', icon: Monitor },
  { id: 'installation', title: 'Installation Assessment', icon: Wrench },
  { id: 'software', title: 'Software & Control', icon: Laptop },
  { id: 'service', title: 'Service & Support', icon: Shield },
  { id: 'timeline', title: 'Project Timeline', icon: Clock },
  { id: 'pricing', title: 'Pricing Parameters', icon: DollarSign }
];

const VENUE_TYPES: VenueType[] = [
  {
    id: 'nfl',
    label: 'NFL Stadium',
    icon: <Trophy className="w-8 h-8" />,
    description: 'Professional football stadium (e.g., Levi\'s Stadium)',
    specs: {
      minResolution: '4mm',
      requiresControlRoom: true,
      typicalDisplays: ['Center Hung 4K', 'Ribbon Boards', 'Endzone Displays']
    }
  },
  {
    id: 'nba',
    label: 'NBA Arena',
    icon: <Medal className="w-8 h-8" />,
    description: 'Professional basketball arena (e.g., Gainbridge Fieldhouse)',
    specs: {
      minResolution: '6mm',
      requiresControlRoom: true,
      typicalDisplays: ['Center Hung Scoreboard', 'LED Rings', 'Baseline Displays']
    }
  },
  {
    id: 'ncaa',
    label: 'NCAA Venue',
    icon: <GraduationCap className="w-8 h-8" />,
    description: 'College sports venue (e.g., Cameron Indoor)',
    specs: {
      minResolution: '10mm',
      requiresControlRoom: false,
      typicalDisplays: ['Center Hung', 'Ribbon Boards', 'Sideline Displays']
    }
  },
  {
    id: 'transit',
    label: 'Transit Hub',
    icon: <Train className="w-8 h-8" />,
    description: 'Airport, train station, or transit facility',
    specs: {
      minResolution: '6mm',
      requires24x7: true,
      typicalDisplays: ['Information Boards', 'Video Walls', 'Kiosks']
    }
  },
  {
    id: 'corporate',
    label: 'Corporate',
    icon: <Building2 className="w-8 h-8" />,
    description: 'Corporate office, conference center, or retail',
    specs: {
      minResolution: '4mm',
      requiresFinePitch: true,
      typicalDisplays: ['Boardroom Video Wall', 'Lobby Displays', 'Conference Rooms']
    }
  }
];

const DISPLAY_TYPES: DisplayType[] = [
  {
    id: 'scoreboard',
    label: 'Scoreboard',
    icon: <Trophy className="w-6 h-6" />,
    description: 'Primary game display with scoring',
    sizePrompt: 'Typical: 20-40\' wide, 8-15\' high'
  },
  {
    id: 'ribbon',
    label: 'Ribbon Board',
    icon: <Medal className="w-6 h-6" />,
    description: '360-degree continuous display',
    sizePrompt: 'Typical: 200-800\' long, 2-4\' high'
  },
  {
    id: 'centerhung',
    label: 'Center Hung',
    icon: <Building className="w-6 h-6" />,
    description: 'Four-sided display suspended from ceiling',
    sizePrompt: 'Typical: 25-35\' wide, 15-25\' high'
  },
  {
    id: 'videowall',
    label: 'Video Wall',
    icon: <Monitor className="w-6 h-6" />,
    description: 'High-resolution presentation wall',
    sizePrompt: 'Typical: 10-30\' wide, 6-15\' high'
  },
  {
    id: 'kiosk',
    label: 'Kiosk/Directory',
    icon: <Settings className="w-6 h-6" />,
    description: 'Interactive wayfinding or advertising',
    sizePrompt: 'Typical: 4-8\' wide, 6-10\' high'
  }
];

export default function ANCConfigurationWizard() {
  const [config, setConfig] = useState<WizardConfig>({
    step: 0,
    venueType: null,
    screens: [{
      id: '1',
      displayType: '',
      widthFt: 0,
      heightFt: 0,
      pixelPitch: '',
      productClass: '',
      indoor: true
    }],
    installation: {
      type: '',
      access: '',
      structural: '',
      electrical: '',
      distanceToPower: 0
    },
    software: {
      cms: '',
      features: []
    },
    service: '',
    timeline: {
      duration: '',
      deadline: ''
    },
    pricing: {
      margin: '',
      contingency: ''
    }
  });

  const addScreen = () => {
    const newScreen: ScreenConfig = {
      id: String(config.screens.length + 1),
      displayType: '',
      widthFt: 0,
      heightFt: 0,
      pixelPitch: '',
      productClass: '',
      indoor: true
    };
    
    setConfig(prev => ({
      ...prev,
      screens: [...prev.screens, newScreen]
    }));
  };

  const removeScreen = (screenId: string) => {
    if (config.screens.length > 1) {
      setConfig(prev => ({
        ...prev,
        screens: prev.screens.filter(screen => screen.id !== screenId)
      }));
    }
  };

  const updateScreen = (screenId: string, updates: Partial<ScreenConfig>) => {
    setConfig(prev => ({
      ...prev,
      screens: prev.screens.map(screen => 
        screen.id === screenId ? { ...screen, ...updates } : screen
      )
    }));
  };

  const nextStep = () => {
    if (config.step < ANC_WIZARD_STEPS.length - 1) {
      setConfig(prev => ({ ...prev, step: prev.step + 1 }));
    }
  };

  const prevStep = () => {
    if (config.step > 0) {
      setConfig(prev => ({ ...prev, step: prev.step - 1 }));
    }
  };

  const renderStep = () => {
    switch (config.step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Venue Type</h2>
              <p className="text-gray-600">Choose the type of facility for your LED display</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {VENUE_TYPES.map((venue) => (
                <button
                  key={venue.id}
                  onClick={() => setConfig(prev => ({ ...prev, venueType: venue.id }))}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    config.venueType === venue.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="text-blue-600">{venue.icon}</div>
                    <h3 className="font-semibold text-gray-900">{venue.label}</h3>
                    <p className="text-sm text-gray-600">{venue.description}</p>
                    <div className="text-xs text-blue-600 font-medium">
                      Min: {venue.specs.minResolution}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Display Configuration</h2>
              <p className="text-gray-600">Configure each display screen for your project</p>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Display Screens</h3>
              <button
                onClick={addScreen}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Screen
              </button>
            </div>

            <div className="space-y-6">
              {config.screens.map((screen, index) => (
                <div key={screen.id} className="p-6 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Screen {index + 1}</h4>
                    {config.screens.length > 1 && (
                      <button
                        onClick={() => removeScreen(screen.id)}
                        className="flex items-center gap-2 px-3 py-1 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Type
                      </label>
                      <select
                        value={screen.displayType}
                        onChange={(e) => updateScreen(screen.id, { displayType: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Display Type</option>
                        {DISPLAY_TYPES.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {screen.displayType && (
                        <p className="text-sm text-gray-500 mt-1">
                          {DISPLAY_TYPES.find(t => t.id === screen.displayType)?.sizePrompt}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pixel Pitch
                      </label>
                      <select
                        value={screen.pixelPitch}
                        onChange={(e) => updateScreen(screen.id, { pixelPitch: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Pixel Pitch</option>
                        <option value="4">4mm (Ultra Fine)</option>
                        <option value="6">6mm (Fine)</option>
                        <option value="10">10mm (Standard)</option>
                        <option value="16">16mm (Coarse)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Width (feet)
                      </label>
                      <input
                        type="number"
                        value={screen.widthFt || ''}
                        onChange={(e) => updateScreen(screen.id, { widthFt: Number(e.target.value) })}
                        placeholder="20"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height (feet)
                      </label>
                      <input
                        type="number"
                        value={screen.heightFt || ''}
                        onChange={(e) => updateScreen(screen.id, { heightFt: Number(e.target.value) })}
                        placeholder="12"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Installation Assessment</h2>
              <p className="text-gray-600">Evaluate site conditions and installation requirements</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Installation Environment
                </label>
                <select
                  value={config.installation.type}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    installation: { ...prev.installation, type: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Environment</option>
                  <option value="indoor">Indoor - Controlled Environment</option>
                  <option value="outdoor">Outdoor - Weather Exposure</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Access Method
                </label>
                <select
                  value={config.installation.access}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    installation: { ...prev.installation, access: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Access Method</option>
                  <option value="front">Front Access Only</option>
                  <option value="rear">Rear Access Available</option>
                  <option value="both">Both Front and Rear Access</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Structural Condition
                </label>
                <select
                  value={config.installation.structural}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    installation: { ...prev.installation, structural: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Structural Condition</option>
                  <option value="existing-good">Existing Structure - Good Condition</option>
                  <option value="existing-repair">Existing Structure - Requires Repair</option>
                  <option value="new-steel">New Steel Structure Required</option>
                  <option value="foundation">New Foundation Required</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Power Distance (feet)
                </label>
                <input
                  type="number"
                  value={config.installation.distanceToPower || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    installation: { ...prev.installation, distanceToPower: Number(e.target.value) }
                  }))}
                  placeholder="75"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      default:
        return <div>Step {config.step + 1} content</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {ANC_WIZARD_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index <= config.step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index < config.step ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <div className="ml-2">
                <div className="text-sm font-medium text-gray-900">{step.title}</div>
              </div>
              {index < ANC_WIZARD_STEPS.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={config.step === 0}
          className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>
        
        <button
          onClick={nextStep}
          disabled={config.step === ANC_WIZARD_STEPS.length - 1}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}