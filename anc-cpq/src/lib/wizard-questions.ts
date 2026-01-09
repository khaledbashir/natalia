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
        question: "What's the client or venue name?",
        type: 'text',
        required: true
    },
    {
        id: 'projectName',
        category: 'metadata',
        question: "What's the project name or location?",
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
            { value: 'CenterHung', label: 'Center Hung', impact: '+30% base rate' }
        ],
        required: true,
        formulaImpact: 'Affects base rate per sqft'
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
    {
        id: 'pixelPitch',
        category: 'display',
        question: "What pixel pitch do you need?",
        type: 'select',
        options: [
            { value: '10', label: '10mm (Standard)', impact: 'Base rate' },
            { value: '6', label: '6mm (Fine)', impact: '+25% rate' },
            { value: '4', label: '4mm (Ultra Fine)', impact: '+50% rate' }
        ],
        required: true,
        formulaImpact: 'Affects cost per sqft'
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
    // Labor
    {
        id: 'installEquipment',
        category: 'labor',
        question: "What equipment will be used for installation?",
        type: 'select',
        options: [
            { value: 'Ladder', label: 'Ladder (under 20ft)', impact: 'Standard' },
            { value: 'ScissorLift', label: 'Scissor Lift (20-40ft)', impact: '+$500/day' },
            { value: 'Crane', label: 'Crane (over 40ft)', impact: '+$2000/day' }
        ],
        required: true,
        formulaImpact: 'Affects equipment rental costs'
    },
    {
        id: 'crewSize',
        category: 'labor',
        question: "How many crew members needed on site?",
        type: 'select',
        options: [
            { value: '2', label: '2 (Small install)', impact: 'Standard' },
            { value: '4', label: '4 (Medium install)', impact: '2x labor' },
            { value: '6', label: '6+ (Large install)', impact: '3x labor' }
        ],
        required: true
    },
    // Project
    {
        id: 'includePermits',
        category: 'project',
        question: "Are permits included in this quote?",
        type: 'select',
        options: [
            { value: 'yes', label: 'Yes - Include permits', impact: '+$2,500 avg' },
            { value: 'no', label: 'No - Client handles permits', impact: 'Excluded' }
        ],
        required: true
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
    }
];

export interface WizardState {
    currentStep: number;
    answers: Record<string, string | number>;
    isComplete: boolean;
}
