// Question definitions for the Conversational Wizard
export interface WizardQuestion {
    id: string;
    category: 'metadata' | 'display' | 'environment' | 'structure' | 'access' | 'labor' | 'project';
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
    {
        id: 'mountingType',
        category: 'structure',
        question: "How will this be mounted?",
        type: 'select',
        options: [
            { value: 'Wall', label: 'Wall Mount', impact: 'Standard' },
            { value: 'Ground', label: 'Ground Stack', impact: '+5%' },
            { value: 'Rigging', label: 'Rigged/Flown', impact: '+25%' }
        ],
        required: true,
        formulaImpact: 'Affects structural engineering requirements'
    },
    // Access
    {
        id: 'access',
        category: 'access',
        question: "Will technicians service from the front or rear?",
        type: 'select',
        options: [
            { value: 'Front', label: 'Front Access', impact: '+10% labor' },
            { value: 'Rear', label: 'Rear Access', impact: '+15% labor' }
        ],
        required: true,
        formulaImpact: 'Rear access requires more complex installation'
    },
    // Structure Condition (NEW - was missing)
    {
        id: 'structureCondition',
        category: 'structure',
        question: "Will we be mounting to existing usable steel, or is new primary steel required?",
        type: 'select',
        options: [
            { value: 'Existing', label: 'Existing Structure (Usable)', impact: 'Standard' },
            { value: 'NewSteel', label: 'New Steel Required', impact: '+$15,000-50,000' }
        ],
        required: true,
        formulaImpact: 'New steel significantly increases structural costs'
    },
    // Labor Type (NEW - was missing)
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
    // Power Distance (NEW - was missing)
    {
        id: 'powerDistance',
        category: 'project',
        question: "Approximate distance to the nearest power/data termination point?",
        type: 'select',
        options: [
            { value: 'Close', label: 'Under 50 ft', impact: 'Standard' },
            { value: 'Medium', label: '50 - 150 ft', impact: '+$2,000-5,000' },
            { value: 'Far', label: 'Over 150 ft (New Run)', impact: '+$8,000-15,000' }
        ],
        required: true,
        formulaImpact: 'Longer runs require more cable and labor'
    },
    // Permits (NEW - was missing)
    {
        id: 'permits',
        category: 'project',
        question: "Who will handle the city/structural permits?",
        type: 'select',
        options: [
            { value: 'Client', label: 'Client Handles Permits', impact: 'Excluded' },
            { value: 'ANC', label: 'ANC Handles Permits', impact: '+$2,500-10,000' }
        ],
        required: true,
        formulaImpact: 'Permit handling adds administrative costs'
    },
    // Control System (NEW - was missing)
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
    // Performance Bond (NEW - was missing)
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
        id: 'unitCost',
        category: 'project',
        question: "Do you have a target dollar per sq ft for the hardware?",
        type: 'number',
        required: false
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
        question: "What level of ongoing service is required?",
        type: 'select',
        options: [
            { value: 'bronze', label: 'Bronze' },
            { value: 'silver', label: 'Silver' },
            { value: 'gold', label: 'Gold' }
        ],
        required: true
    }
];

export interface WizardState {
    currentStep: number;
    answers: Record<string, string | number>;
    isComplete: boolean;
}
