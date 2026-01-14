// Question definitions for the Conversational Wizard - ENHANCED for Natalia's workflow
export interface WizardQuestion {
    id: string;
    category: 'metadata' | 'display' | 'environment' | 'structure' | 'access' | 'labor' | 'project' | 'installation';
    question: string;
    type: 'text' | 'select' | 'number';
    options?: { value: string; label: string; impact?: string }[];
    required: boolean;
    formulaImpact?: string; // Description of how this affects pricing
}

export const WIZARD_QUESTIONS: WizardQuestion[] = [
    // Metadata
    {
        id: 'clientName',
        category: 'metadata',
        question: "What's the venue name?",
        type: 'text',
        required: true
    },
    {
        id: 'address',
        category: 'metadata',
        question: "What is the physical address of the venue?",
        type: 'text',
        required: true
    },

    // Display
    {
        id: 'productClass',
        category: 'display',
        question: "What type of display do you need?",
        type: 'select',
        options: [
            { value: 'Scoreboard', label: 'Scoreboard', impact: 'Standard rate' },
            { value: 'Ribbon', label: 'Ribbon Board', impact: '+20% base rate' },
            { value: 'CenterHung', label: 'Center Hung', impact: '+30% base rate' },
            { value: 'Vomitory', label: 'Vomitory', impact: '+15% base rate' }
        ],
        required: true,
        formulaImpact: 'Affects base rate per sqft'
    },
    {
        id: 'pixelPitch',
        category: 'display',
        question: "What pixel pitch do you need?",
        type: 'select',
        options: [
            { value: '10', label: '10mm (Standard)', impact: 'Base rate' },
            { value: '6', label: '6mm (Fine)', impact: '+25% rate' },
            { value: '4', label: '4mm (Ultra Fine)', impact: '+50% rate' },
            { value: '16', label: '16mm (Coarse)', impact: '-15% rate' }
        ],
        required: true,
        formulaImpact: 'Affects cost per sqft'
    },
    {
        id: 'widthFt',
        category: 'display',
        question: "What's the display width (in feet)?",
        type: 'number',
        required: true
    },
    {
        id: 'heightFt',
        category: 'display',
        question: "What's the display height (in feet)?",
        type: 'number',
        required: true
    },

    // NEW: Installation Assessment Section (Critical for Natalia's workflow)
    {
        id: 'installationEnvironment',
        category: 'installation',
        question: "Is this installation indoor or outdoor?",
        type: 'select',
        options: [
            { value: 'Indoor', label: 'Indoor - Controlled Environment', impact: 'Standard installation' },
            { value: 'Outdoor', label: 'Outdoor - Weather Exposure', impact: '+Weather protection required' }
        ],
        required: true,
        formulaImpact: 'Outdoor requires weatherproofing and special mounting'
    },
    {
        id: 'serviceAccess',
        category: 'installation',
        question: "Will technicians access the display from the front or rear for service?",
        type: 'select',
        options: [
            { value: 'Front', label: 'Front Access Only', impact: '+Service complexity' },
            { value: 'Rear', label: 'Rear Access Available', impact: 'Standard service access' },
            { value: 'Both', label: 'Both Front and Rear Access', impact: 'Optimal service access' }
        ],
        required: true,
        formulaImpact: 'Front-only access increases service time and complexity'
    },
    {
        id: 'mountingComplexity',
        category: 'installation',
        question: "How will the display be mounted?",
        type: 'select',
        options: [
            { value: 'WallFlat', label: 'Flat Wall Mount - Simple', impact: 'Standard mounting' },
            { value: 'WallCustom', label: 'Custom Wall Mount - Complex', impact: '+Custom steel required' },
            { value: 'GroundStack', label: 'Ground Stacked - Floor Mount', impact: '+Support structure needed' },
            { value: 'RiggedFlown', label: 'Rigged/Flown from Structure', impact: '+Engineering review required' },
            { value: 'PoleMount', label: 'Pole Mounted - Freestanding', impact: '+Foundation and pole required' }
        ],
        required: true,
        formulaImpact: 'Complex mounting increases structural engineering requirements'
    },
    {
        id: 'structureCondition',
        category: 'installation',
        question: "What's the condition of the existing structure for mounting?",
        type: 'select',
        options: [
            { value: 'ExistingGood', label: 'Existing Structure - Good Condition', impact: 'Standard structural analysis' },
            { value: 'ExistingPoor', label: 'Existing Structure - Requires Repair', impact: '+Structural reinforcement needed' },
            { value: 'NewSteel', label: 'New Steel Structure Required', impact: '+$15,000-50,000 for new steel' },
            { value: 'Foundation', label: 'New Foundation Required', impact: '+Foundation engineering and construction' }
        ],
        required: true,
        formulaImpact: 'Poor existing structure or new steel significantly increases costs'
    },
    {
        id: 'craneAccess',
        category: 'installation',
        question: "Is crane access available for equipment installation?",
        type: 'select',
        options: [
            { value: 'CraneAvailable', label: 'Yes - Crane access available', impact: 'Standard equipment installation' },
            { value: 'CraneRental', label: 'No - Crane rental required', impact: '+$5,000-15,000 crane rental' },
            { value: 'ManualOnly', label: 'Manual installation only (no crane)', impact: '+Manual handling time' }
        ],
        required: true,
        formulaImpact: 'Crane rental adds significant cost to installation'
    },
    {
        id: 'powerDistance',
        category: 'installation',
        question: "How far is the display location from the main electrical panel?",
        type: 'select',
        options: [
            { value: 'Close', label: 'Under 50 feet - Close', impact: 'Standard electrical run' },
            { value: 'Medium', label: '50-150 feet - Medium distance', impact: '+$2,000-5,000 for additional conduit' },
            { value: 'Far', label: 'Over 150 feet - New electrical run required', impact: '+$8,000-15,000 for new feeder' }
        ],
        required: true,
        formulaImpact: 'Longer electrical runs require more materials and labor'
    },
    {
        id: 'workingHours',
        category: 'installation',
        question: "Are there any restrictions on working hours for installation?",
        type: 'select',
        options: [
            { value: 'Standard', label: 'Standard business hours (7AM-6PM)', impact: 'Standard labor rates' },
            { value: 'Restricted', label: 'Restricted hours (evenings/weekends only)', impact: '+Overtime rates required' },
            { value: 'EventSchedule', label: 'Event schedule dependent', impact: '+Premium rates for event coordination' }
        ],
        required: true,
        formulaImpact: 'Restricted hours increase labor costs due to overtime rates'
    },
    {
        id: 'weatherProtection',
        category: 'installation',
        question: "Is weather protection required during installation?",
        type: 'select',
        options: [
            { value: 'None', label: 'No - Indoor installation', impact: 'No weather protection needed' },
            { value: 'Basic', label: 'Yes - Basic weather protection', impact: '+Weather contingency planning' },
            { value: 'Full', label: 'Yes - Full weather protection system', impact: '+$10,000-25,000 for weather protection' }
        ],
        required: true,
        formulaImpact: 'Weather protection adds significant cost for outdoor installations'
    },
    {
        id: 'sitePreparation',
        category: 'installation',
        question: "What level of site preparation is required?",
        type: 'select',
        options: [
            { value: 'Minimal', label: 'Minimal - Ready for installation', impact: 'No additional site work' },
            { value: 'Moderate', label: 'Moderate - Some preparation needed', impact: '+Site cleanup and preparation' },
            { value: 'Extensive', label: 'Extensive - Major site work required', impact: '+$5,000-20,000 for site preparation' }
        ],
        required: true,
        formulaImpact: 'Extensive site preparation adds significant cost'
    },

    // Environment
    {
        id: 'environment',
        category: 'environment',
        question: "Is this display for indoor or outdoor use?",
        type: 'select',
        options: [
            { value: 'Indoor', label: 'Indoor', impact: 'Standard' },
            { value: 'Outdoor', label: 'Outdoor', impact: '+15% (weatherproofing)' }
        ],
        required: true,
        formulaImpact: 'Outdoor adds weatherproofing surcharge'
    },

    // Structure
    {
        id: 'shape',
        category: 'structure',
        question: "Will this be a flat panel or curved display?",
        type: 'select',
        options: [
            { value: 'Flat', label: 'Flat Panel', impact: '+5% structural' },
            { value: 'Curved', label: 'Curved Display', impact: '+20% structural' }
        ],
        required: true,
        formulaImpact: 'Curved requires custom framing'
    },

    // Labor Type
    {
        id: 'laborType',
        category: 'labor',
        question: "What are the labor requirements for this venue?",
        type: 'select',
        options: [
            { value: 'NonUnion', label: 'Non-Union (Standard)', impact: 'Base rate' },
            { value: 'Union', label: 'Union Labor Required', impact: '+30% labor' },
            { value: 'Prevailing', label: 'Prevailing Wage', impact: '+50% labor' }
        ],
        required: true,
        formulaImpact: 'Union/Prevailing wage significantly increases labor costs'
    },

    // Project
    {
        id: 'permits',
        category: 'project',
        question: "Who will handle the city/structural permits?",
        type: 'select',
        options: [
            { value: 'Client', label: 'Client Handles Permits', impact: 'Excluded' },
            { value: 'ANC', label: 'ANC Handles Permits', impact: '+$2,500-10,000' },
            { value: 'Existing', label: 'Existing Permits In Place', impact: 'No change' }
        ],
        required: true,
        formulaImpact: 'Permit handling adds administrative costs'
    },
    {
        id: 'controlSystem',
        category: 'project',
        question: "Do you need a new control system (processors/sending boxes) included?",
        type: 'select',
        options: [
            { value: 'Include', label: 'Yes, Include Controls', impact: '+$5,000-25,000' },
            { value: 'None', label: 'No, Use Existing', impact: 'Excluded' }
        ],
        required: true,
        formulaImpact: 'Control systems add significant hardware costs'
    },
    {
        id: 'bondRequired',
        category: 'project',
        question: "Is a Payment or Performance Bond required for this project?",
        type: 'select',
        options: [
            { value: 'No', label: 'No', impact: 'Standard' },
            { value: 'Yes', label: 'Yes (Add ~1.5%)', impact: '+1.5% of total' }
        ],
        required: true,
        formulaImpact: 'Bonds add percentage-based cost'
    },
    {
        id: 'complexity',
        category: 'project',
        question: "What's the overall install complexity?",
        type: 'select',
        options: [
            { value: 'Standard', label: 'Standard', impact: 'Base PM rate' },
            { value: 'High', label: 'High Complexity', impact: '+25% PM' }
        ],
        required: true,
        formulaImpact: 'Affects project management overhead'
    },
    {
        id: 'targetMargin',
        category: 'project',
        question: "What is the target gross margin percentage?",
        type: 'number',
        required: false
    },
    {
        id: 'serviceLevel',
        category: 'project',
        question: "What level of technical support & warranty coverage is needed?",
        type: 'select',
        options: [
            { value: 'bronze', label: 'Bronze (Standard Support - 8x5 M-F)' },
            { value: 'silver', label: 'Silver (Priority Support - 24/7 + Extended Warranty)' },
            { value: 'gold', label: 'Gold (On-Site + Dedicated Engineer)' }
        ],
        required: true,
        formulaImpact: 'Higher service levels increase recurring service revenue'
    },

    // Upsells
    {
        id: 'contentManagement',
        category: 'project',
        question: "Would you like a content management system (CMS) subscription for content updates?",
        type: 'select',
        options: [
            { value: 'None', label: 'No, Client manages content' },
            { value: 'Basic', label: 'Basic CMS (+$5,000/yr)' },
            { value: 'Premium', label: 'Premium CMS + Creative (+$15,000/yr)' }
        ],
        required: false,
        formulaImpact: 'CMS provides recurring revenue and keeps content fresh'
    },
    {
        id: 'spareParts',
        category: 'project',
        question: "Would you like a spare parts kit included for quick repairs?",
        type: 'select',
        options: [
            { value: 'None', label: 'No spare parts' },
            { value: 'Basic', label: 'Basic Kit (+$3,000)' },
            { value: 'Premium', label: 'Extended Kit (+$8,000)' }
        ],
        required: false,
        formulaImpact: 'Spare parts reduce downtime and increase parts revenue'
    },
    {
        id: 'maintenance',
        category: 'project',
        question: "Would you like to include a maintenance agreement?",
        type: 'select',
        options: [
            { value: 'None', label: 'No maintenance agreement' },
            { value: 'Basic', label: 'Annual Preventive Maintenance (+$5,000/yr)' },
            { value: 'Premium', label: 'Priority Response + Preventive (+$12,000/yr)' }
        ],
        required: false,
        formulaImpact: 'Maintenance agreements provide recurring revenue and peace of mind'
    }
];

export interface WizardState {
    currentStep: number;
    answers: Record<string, string | number>;
    isComplete: boolean;
}