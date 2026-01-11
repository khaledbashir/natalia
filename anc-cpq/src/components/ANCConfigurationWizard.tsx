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
  ArrowRight
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

interface WizardConfig {
  step: number;
  venueType: string | null;
  displayTypes: string[];
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
  { id: 'displays', title: 'Display Types', icon: Monitor },
  { id: 'environment', title: 'Installation Environment', icon: Wrench },
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
      requiresFinePitch: true,
      typicalDisplays: ['Center Hung 6mm', 'Fine Pitch Club Displays', 'Ribbon Boards']
    }
  },
  {
    id: 'ncaa',
    label: 'College Stadium',
    icon: <GraduationCap className="w-8 h-8" />,
    description: 'College athletics venue',
    specs: {
      minResolution: '10mm',
      typicalDisplays: ['Scoreboard', 'Ribbon Boards', 'Concourse Displays']
    }
  },
  {
    id: 'transit',
    label: 'Transit Hub',
    icon: <Train className="w-8 h-8" />,
    description: 'Train station, airport, or transportation center (e.g., Moynihan Train Hall)',
    specs: {
      minResolution: '6mm',
      requires24x7: true,
      typicalDisplays: ['Digital Kiosks', 'Information Displays', 'Wayfinding']
    }
  },
  {
    id: 'corporate',
    label: 'Corporate Space',
    icon: <Building2 className="w-8 h-8" />,
    description: 'Flagship branch, office building, or retail space (e.g., JP Morgan Chase)',
    specs: {
      minResolution: '4mm',
      typicalDisplays: ['Digital Signage', 'Interactive Displays']
    }
  }
];

const DISPLAY_TYPES: DisplayType[] = [
  {
    id: 'centerhung',
    label: 'Center Hung Display',
    icon: <div className="w-8 h-8 rounded-full border-4 border-blue-500 bg-blue-100" />,
    description: 'Main center-mounted display with 4-sided viewing',
    sizePrompt: 'Enter dimensions (e.g., 40\' x 30\')',
    options: ['4K Resolution', '6mm Pitch', 'Underbelly Display', 'LED Rings']
  },
  {
    id: 'ribbon',
    label: 'Ribbon Boards',
    icon: <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-700 rounded" />,
    description: 'Fascia or concourse LED displays',
    sizePrompt: 'Enter length (e.g., 500\' continuous)',
    options: ['10mm Standard', '6mm Premium', '4K Capable']
  },
  {
    id: 'scoreboard',
    label: 'Main Scoreboard',
    icon: <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold">SB</div>,
    description: 'Traditional scoreboard with video capability',
    options: ['Video Display', 'Traditional Scoreboard', 'Hybrid']
  },
  {
    id: 'finepitch',
    label: 'Fine Pitch Displays',
    icon: <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded" />,
    description: 'High-resolution displays for premium areas (clubs, hospitality)',
    options: ['1.5mm Ultra-HD', '2.5mm', '3mm']
  },
  {
    id: 'endzone',
    label: 'Endzone Displays',
    icon: <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-xs">EZ</div>,
    description: 'Large format wall displays for football fields',
    sizePrompt: 'Typical size: 44\' x 11\''
  },
  {
    id: 'kiosks',
    label: 'Digital Kiosks',
    icon: <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-white text-xs">KIOSK</div>,
    description: 'Interactive or informational kiosks',
    options: ['Touchscreen', 'Information Only', 'Wayfinding']
  }
];

const INSTALLATION_OPTIONS = {
  type: [
    { value: 'new', label: 'New Construction', impact: 'Standard timeline', cost: 'Base pricing' },
    { value: 'retrofit', label: 'Retrofit / Replacement', impact: '+2-4 weeks', cost: '+15% labor' },
    { value: 'upgrade', label: 'Existing Infrastructure Upgrade', impact: 'Variable', cost: '+20% labor' }
  ],
  access: [
    { value: 'front', label: 'Front Access', cost: '+10% labor', icon: '🔓' },
    { value: 'rear', label: 'Rear Access', cost: '+15% labor', icon: '🔙' },
    { value: 'lift', label: 'Lift Required', cost: '+25% labor', icon: '🚜' },
    { value: 'crane', label: 'Crane Required', cost: '+40% labor', icon: '🏗️' }
  ],
  structural: [
    { value: 'existing', label: 'Existing Steel Structure', cost: 'Base pricing' },
    { value: 'newsteel', label: 'New Steel Required', cost: '+30% structural' },
    { value: 'truss', label: 'Truss System', cost: '+20% structural' },
    { value: 'unknown', label: 'Unknown - Needs Assessment', cost: 'TBD' }
  ],
  electrical: [
    { value: 'adequate', label: 'Adequate (200A+ available)', cost: 'Base pricing' },
    { value: 'limited', label: 'Limited (100-200A)', cost: '+$15K electrical upgrades' },
    { value: 'unknown', label: 'Unknown - Needs Assessment', cost: 'TBD' }
  ]
};

const CMS_OPTIONS = [
  {
    value: 'livesync',
    label: 'LiveSync (ANC Platform)',
    icon: '🔵',
    cost: '$5K/venue license + $2K/display annually',
    description: 'ANC\'s proprietary venue control platform with multi-screen synchronization'
  },
  {
    value: 'thirdparty',
    label: 'Third-Party CMS',
    icon: '🔗',
    cost: '$25K one-time license',
    description: 'Integration with existing CMS platform'
  },
  {
    value: 'manual',
    label: 'Manual Control',
    icon: '👥',
    cost: '$10K basic equipment',
    description: 'No centralized software, manual control only'
  },
  {
    value: 'recommend',
    label: 'Needs Recommendation',
    icon: '💡',
    cost: 'TBD',
    description: 'ANC to recommend best option based on requirements'
  }
];

const SOFTWARE_FEATURES = [
  '24/7 Scheduling',
  'Live Sports Integration',
  'Data Feeds (Scoring, Social Media)',
  'Emergency Messaging',
  'Multi-Screen Synchronization',
  'Advertising Management',
  'User Role Management',
  'Content Analytics',
  'Remote Access'
];

const SERVICE_PACKAGES = [
  {
    id: 'gold',
    label: 'Gold - 24/7 Full Support',
    icon: Shield,
    cost: '15% of project value annually',
    features: [
      'On-site Technicians (permanently)',
      '24/7/365 technical support hotline',
      'Game-day operations staffing',
      'Preventative maintenance (monthly)',
      'Content support and scheduling',
      '2-hour response time SLA'
    ],
    badge: 'Recommended for NFL Stadiums'
  },
  {
    id: 'silver',
    label: 'Silver - Event-Only Support',
    icon: Shield,
    cost: '8% of project value annually',
    features: [
      'Event day staffing',
      'Basic maintenance',
      'Remote support',
      '24-hour response time SLA'
    ],
    badge: 'Good for NBA/NCAA Venues'
  },
  {
    id: 'bronze',
    label: 'Bronze - Basic Maintenance',
    icon: Shield,
    cost: '5% of project value annually',
    features: [
      'Preventative maintenance',
      'Remote support',
      '48-hour response time SLA'
    ],
    badge: 'Suitable for Transit/Corporate'
  },
  {
    id: 'self',
    label: 'Self-Service',
    icon: Wrench,
    cost: 'No ongoing cost',
    features: [
      'Training provided',
      'Support available on-demand'
    ],
    badge: 'For Internal Teams'
  }
];

const TIMELINE_OPTIONS = [
  {
    value: 'standard',
    label: 'Standard (8-12 weeks)',
    cost: 'Base pricing',
    multiplier: 1.0,
    description: 'Normal project timeline'
  },
  {
    value: 'rush',
    label: 'Rush (4-6 weeks)',
    cost: '+20% total project cost',
    multiplier: 1.2,
    description: 'Accelerated schedule with premium pricing'
  },
  {
    value: 'asap',
    label: 'ASAP (2-4 weeks)',
    cost: '+50% total project cost',
    multiplier: 1.5,
    description: 'Emergency installation with significant premium'
  },
  {
    value: 'multiphase',
    label: 'Multi-Phase (6+ months)',
    cost: 'Per-phase pricing',
    multiplier: 1.0,
    description: 'Phased installation over extended period'
  }
];

const MARGIN_OPTIONS = ['25%', '30%', '35%', '40%'];
const CONTINGENCY_OPTIONS = ['None', '5% (Standard)', '10% (High Risk)'];

interface ANCConfigurationWizardProps {
  onComplete: (config: WizardConfig) => void;
  onUpdate: (config: Partial<WizardConfig>) => void;
  initialConfig?: Partial<WizardConfig>;
}

export function ANCConfigurationWizard({ onComplete, onUpdate, initialConfig = {} }: ANCConfigurationWizardProps) {
  const [config, setConfig] = useState<WizardConfig>({
    step: 1,
    venueType: initialConfig.venueType || null,
    displayTypes: initialConfig.displayTypes || [],
    installation: initialConfig.installation || {
      type: '',
      access: '',
      structural: '',
      electrical: '',
      distanceToPower: 0
    },
    software: initialConfig.software || {
      cms: '',
      features: []
    },
    service: initialConfig.service || '',
    timeline: initialConfig.timeline || {
      duration: '',
      deadline: ''
    },
    pricing: initialConfig.pricing || {
      margin: '30%',
      contingency: '5% (Standard)'
    }
  });

  const currentStepData = ANC_WIZARD_STEPS[config.step - 1];
  const progress = ((config.step - 1) / ANC_WIZARD_STEPS.length) * 100;

  const isStepValid = useMemo(() => {
    switch (config.step) {
      case 1:
        return config.venueType !== null;
      case 2:
        return config.displayTypes.length > 0;
      case 3:
        return config.installation.type !== '' &&
               config.installation.access !== '' &&
               config.installation.structural !== '' &&
               config.installation.electrical !== '';
      case 4:
        return config.software.cms !== '';
      case 5:
        return config.service !== '';
      case 6:
        return config.timeline.duration !== '';
      case 7:
        return true; // Pricing has defaults
      default:
        return false;
    }
  }, [config]);

  const handleNext = () => {
    if (config.step < ANC_WIZARD_STEPS.length) {
      const newStep = config.step + 1;
      setConfig(prev => ({ ...prev, step: newStep }));
      onUpdate({ ...config, step: newStep });
    } else {
      onComplete(config);
    }
  };

  const handleBack = () => {
    if (config.step > 1) {
      const newStep = config.step - 1;
      setConfig(prev => ({ ...prev, step: newStep }));
      onUpdate({ ...config, step: newStep });
    }
  };

  const toggleDisplayType = (displayId: string) => {
    const updated = config.displayTypes.includes(displayId)
      ? config.displayTypes.filter(id => id !== displayId)
      : [...config.displayTypes, displayId];

    setConfig(prev => ({ ...prev, displayTypes: updated }));
    onUpdate({ ...config, displayTypes: updated });
  };

  const toggleSoftwareFeature = (feature: string) => {
    const updated = config.software.features.includes(feature)
      ? config.software.features.filter(f => f !== feature)
      : [...config.software.features, feature];

    setConfig(prev => ({ ...prev, software: { ...prev.software, features: updated } }));
    onUpdate({ ...config, software: { ...config.software, features: updated } });
  };

  const updateConfig = (updates: Partial<WizardConfig>) => {
    const updated = { ...config, ...updates };
    setConfig(updated);
    onUpdate(updated);
  };

  const renderStep = () => {
    switch (config.step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              What type of venue is this project for?
            </h3>
            <p className="text-sm text-gray-600">
              Select the venue type to auto-configure appropriate display specifications and requirements
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {VENUE_TYPES.map((venue) => (
                <button
                  key={venue.id}
                  onClick={() => updateConfig({ venueType: venue.id })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    config.venueType === venue.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-blue-600">{venue.icon}</div>
                    <h4 className="font-semibold text-gray-900">{venue.label}</h4>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{venue.description}</p>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-600" />
                      <span className="text-gray-700">Min Resolution: {venue.specs.minResolution}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-600" />
                      <span className="text-gray-700">
                        Typical: {venue.specs.typicalDisplays[0]}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Which display types are needed?
            </h3>
            <p className="text-sm text-gray-600">
              Select all that apply. Multiple selections are supported.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DISPLAY_TYPES.map((display) => (
                <button
                  key={display.id}
                  onClick={() => toggleDisplayType(display.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    config.displayTypes.includes(display.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div>{display.icon}</div>
                    <h4 className="font-semibold text-gray-900">{display.label}</h4>
                    {config.displayTypes.includes(display.id) && (
                      <Check className="w-5 h-5 text-blue-600 ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{display.description}</p>
                  {display.options && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {display.options.map((opt) => (
                        <span key={opt} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Tip:</strong> For comprehensive venue coverage, consider combining multiple display types
                (e.g., Center Hung + Ribbon Boards + Fine Pitch for premium areas)
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              What are the installation conditions?
            </h3>
            <p className="text-sm text-gray-600">
              These factors significantly impact cost, timeline, and resource requirements
            </p>

            <div className="space-y-6">
              {/* Installation Type */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Installation Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {INSTALLATION_OPTIONS.type.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateConfig({
                        installation: { ...config.installation, type: option.value }
                      })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        config.installation.type === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-semibold text-sm text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{option.impact}</div>
                      <div className="text-xs text-blue-600 mt-1 font-medium">{option.cost}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Access Method */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Installation Access Method
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {INSTALLATION_OPTIONS.access.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateConfig({
                        installation: { ...config.installation, access: option.value }
                      })}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        config.installation.access === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="font-semibold text-sm text-gray-900">{option.label}</div>
                      <div className="text-xs text-blue-600 mt-1 font-medium">{option.cost}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Structural Support */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Structural Support Available
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {INSTALLATION_OPTIONS.structural.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateConfig({
                        installation: { ...config.installation, structural: option.value }
                      })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        config.installation.structural === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-semibold text-sm text-gray-900">{option.label}</div>
                      <div className="text-xs text-blue-600 mt-1 font-medium">{option.cost}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Electrical Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Electrical Capacity Available
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {INSTALLATION_OPTIONS.electrical.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateConfig({
                        installation: { ...config.installation, electrical: option.value }
                      })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        config.installation.electrical === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-semibold text-sm text-gray-900">{option.label}</div>
                      <div className="text-xs text-blue-600 mt-1 font-medium">{option.cost}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance to Power */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Average Distance to Power Distribution
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="2000"
                    value={config.installation.distanceToPower}
                    onChange={(e) => updateConfig({
                      installation: { ...config.installation, distanceToPower: parseInt(e.target.value) || 0 }
                    })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter distance in feet"
                  />
                  <span className="text-sm text-gray-600">feet</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  This affects cabling and electrical infrastructure costs
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Content management and control system requirements?
            </h3>

            <div className="space-y-6">
              {/* CMS Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Content Management System
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CMS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateConfig({
                        software: { ...config.software, cms: option.value }
                      })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        config.software.cms === option.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{option.icon}</span>
                        <h4 className="font-semibold text-gray-900">{option.label}</h4>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{option.description}</p>
                      <div className="text-sm text-blue-600 font-medium">{option.cost}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Software Features */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Required Software Features
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  Select all features needed for your venue operations
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SOFTWARE_FEATURES.map((feature) => (
                    <button
                      key={feature}
                      onClick={() => toggleSoftwareFeature(feature)}
                      className={`p-3 rounded-lg border text-left text-sm transition-all ${
                        config.software.features.includes(feature)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {config.software.features.includes(feature) && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 mt-0.5">💡</div>
                  <div>
                    <p className="text-sm text-blue-900 font-semibold">ANC LiveSync Recommendation</p>
                    <p className="text-sm text-blue-800">
                      For comprehensive venue control, LiveSync provides unified management of all displays,
                      real-time data integration, and professional-grade scheduling capabilities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              What level of ongoing support is needed?
            </h3>
            <p className="text-sm text-gray-600">
              Based on ANC's Venue Services offerings
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SERVICE_PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => updateConfig({ service: pkg.id })}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    config.service === pkg.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-blue-600 mt-1">
                      <pkg.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{pkg.label}</h4>
                      <div className="text-sm text-blue-600 font-medium mt-1">{pkg.cost}</div>
                    </div>
                  </div>

                  {pkg.badge && (
                    <div className="mb-3">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        {pkg.badge}
                      </span>
                    </div>
                  )}

                  <ul className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                        <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              What is the required timeline?
            </h3>

            <div className="space-y-6">
              {/* Duration Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Installation Duration
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TIMELINE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateConfig({
                        timeline: { ...config.timeline, duration: option.value }
                      })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        config.timeline.duration === option.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                      <p className="text-xs text-gray-600 mb-2">{option.description}</p>
                      <div className="text-sm text-blue-600 font-medium">{option.cost}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Target Completion Date (Optional)
                </label>
                <input
                  type="date"
                  value={config.timeline.deadline || ''}
                  onChange={(e) => updateConfig({
                    timeline: { ...config.timeline, deadline: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Specify a hard deadline if project has fixed date requirements
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="text-yellow-600">⚠️</div>
                  <div>
                    <p className="text-sm text-yellow-900 font-semibold">Timeline Impact on Pricing</p>
                    <p className="text-sm text-yellow-800">
                      Rush and ASAP timelines incur significant premium costs (20-50%) due to resource
                      reallocation and overtime considerations. Standard timeline provides best value.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Pricing and margin configuration
            </h3>

            <div className="space-y-6">
              {/* Target Margin */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Target Margin
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {MARGIN_OPTIONS.map((margin) => (
                    <button
                      key={margin}
                      onClick={() => updateConfig({
                        pricing: { ...config.pricing, margin }
                      })}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        config.pricing.margin === margin
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-semibold">{margin}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Recommended: 30% for most ANC projects. Higher margins for high-risk projects.
                </p>
              </div>

              {/* Contingency Buffer */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Contingency Buffer
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {CONTINGENCY_OPTIONS.map((contingency) => (
                    <button
                      key={contingency}
                      onClick={() => updateConfig({
                        pricing: { ...config.pricing, contingency }
                      })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        config.pricing.contingency === contingency
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-semibold text-sm text-gray-900">{contingency}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Adds buffer to project total for unforeseen circumstances. 5% is standard.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="text-green-600 mt-0.5">✅</div>
                  <div>
                    <p className="text-sm text-green-900 font-semibold">Configuration Complete</p>
                    <p className="text-sm text-green-800">
                      Click "Generate Proposal" to calculate all costs and produce ANC-branded
                      PDF and Excel audit files. All calculations use ANC's pricing logic.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <currentStepData.icon className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">
                Step {config.step} of {ANC_WIZARD_STEPS.length}: {currentStepData.title}
              </h2>
            </div>
            <div className="text-sm text-gray-600">
              {Math.round(progress)}% Complete
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-4">
            {ANC_WIZARD_STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    idx + 1 === config.step
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                      : idx + 1 < config.step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {idx + 1 < config.step ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                {idx < ANC_WIZARD_STEPS.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-1 ${
                      idx + 1 < config.step ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {renderStep()}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={config.step === 1}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
              config.step === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!isStepValid}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
              !isStepValid
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {config.step === ANC_WIZARD_STEPS.length ? (
              <>
                Generate Proposal
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
