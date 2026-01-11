# ANC CPQ Engine - Bug Analysis Report

## Executive Summary

This report analyzes a real user session between a salesperson ("EXECUTIVE") and the AI assistant ("ANC ENGINEER") for the ANC CPQ (Configure-Price-Quote) web app. The analysis reveals critical issues in input parsing, state management, pricing logic, and address validation that significantly impact user experience and data integrity.

---

## Identified Issues

### ISSUE_01_INPUT_SNIPPET_AS_ADDRESS

**Description:**
The system treats web search result snippets, URLs, and SERP (Search Engine Results Page) titles as valid addresses without proper validation. Examples from the conversation:

- "The Plaza Hotel: Luxury Hotel Near Central Park | 5 Star Hotel in NYC: Ideally situated on Fifth Avenue, The Plaza's prestigious address continues to define elegance with"
- "Family-Friendly Hotel in New Orleans | Sheraton New Orleans Hotel: Situated less than 100 steps apart on historic Canal Street, the Sheraton New Orleans Hotel and New"
- "Sharm Plaza from $65. Sharm el-Sheikh Hotel Deals & Reviews: Guests had mixed experiences at the hotel. While many praised the friendly staff and beautiful locat"

**Likely Cause:**
- No input classification layer to distinguish between venue names, full addresses, and search snippets
- Missing schema validation for address fields (street, city, country)
- The entire user message is being treated as a single string slot without cleaning URLs, metadata, or descriptive text
- No regex patterns to strip common SERP artifacts like "— Reviews", "Hotel Deals & Reviews", "| 5 Star Hotel in NYC"

**Specific Fix:**
```typescript
// Add input classifier
enum MessageType {
  VENUE_NAME_ONLY,
  FULL_ADDRESS,
  SERP_SNIPPET,
  URL,
  CONFIRMATION,
  CHANGE_REQUEST,
  IRRELEVANT
}

function classifyUserMessage(message: string): MessageType {
  // Check for SERP patterns
  if (message.includes('|') || message.includes('—') || 
      message.includes('Reviews') || message.includes('Deals & Reviews') ||
      message.includes('Hotel in') || message.includes('Star Hotel')) {
    return MessageType.SERP_SNIPPET;
  }
  
  // Check for URLs
  if (message.match(/^https?:\/\//)) {
    return MessageType.URL;
  }
  
  // Check for confirmation
  if (message.toLowerCase().match(/^(yes|ok|confirmed|correct)$/)) {
    return MessageType.CONFIRMATION;
  }
  
  // Check for full address pattern (street, city, state/country)
  if (message.match(/\d+\s+\w+.*\b(Street|St|Ave|Avenue|Road|Rd|Blvd|Boulevard)\b.*\b(City|State|Country|[A-Z]{2})\b/i)) {
    return MessageType.FULL_ADDRESS;
  }
  
  // Default to venue name
  return MessageType.VENUE_NAME_ONLY;
}

// Add address validator
interface ValidatedAddress {
  venueName?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  isValid: boolean;
  confidence: number;
}

function validateAddress(input: string): ValidatedAddress {
  const cleaned = cleanAddressInput(input);
  
  // Extract structured components
  const streetMatch = cleaned.match(/(\d+\s+[\w\s]+(?:Street|St|Ave|Avenue|Road|Rd|Blvd|Boulevard))/i);
  const cityMatch = cleaned.match(/(?:in|at|,)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  const countryMatch = cleaned.match(/\b(USA|United States|Jordan|Egypt|Canada|UK|United Kingdom)\b/i);
  
  return {
    venueName: extractVenueName(cleaned),
    street: streetMatch?.[1],
    city: cityMatch?.[1],
    country: countryMatch?.[1],
    isValid: !!(streetMatch && cityMatch),
    confidence: calculateAddressConfidence(cleaned)
  };
}

function cleanAddressInput(input: string): string {
  return input
    .replace(/\s*—\s*Reviews.*$/g, '')
    .replace(/\s*\|\s*.*Hotel.*$/g, '')
    .replace(/\s*\|\s*\d+\s*Star\s*Hotel.*$/g, '')
    .replace(/\s*Hotel\s*Deals\s*&\s*Reviews.*$/g, '')
    .replace(/\s*from\s*\$\d+.*$/g, '')
    .replace(/\s*Guests\s*had.*$/g, '')
    .trim();
}
```

---

### ISSUE_02_REPEATED_HEIGHT_PROMPT

**Description:**
The system repeatedly asks "What is the display height in feet?" even after receiving valid answers (30, 20, 30). This occurs multiple times in the conversation:

```
Executive: 30
ANC Engineer: What is the display height in feet?
Executive: 30
ANC Engineer: What is the display height in feet?
Executive: 30
ANC Engineer: What is the display height in feet?
Executive: 30
ANC Engineer: What is the display height in feet?
Executive: 20
ANC Engineer: What is the display height in feet?
Executive: 30
ANC Engineer: Where will this display be installed?
```

**Likely Cause:**
- Finite state machine (FSM) bug where steps are not being marked as complete
- Missing guardrails to prevent re-asking already satisfied questions
- State not properly persisted or validated before advancing
- The system may be treating each new message as a fresh input rather than checking if the field is already set

**Specific Fix:**
```typescript
// Define state machine with explicit step completion
interface CPQState {
  currentStep: string;
  completedSteps: Set<string>;
  fields: {
    clientName?: string;
    venueName?: string;
    address?: ValidatedAddress;
    addressConfirmed?: boolean;
    productClass?: 'Scoreboard' | 'Ribbon Board' | 'Center Hung' | 'Vomitory Display';
    pixelPitch?: number;
    widthFt?: number;
    heightFt?: number;
    // ... other fields
  };
}

// Step definition with validation
interface Step {
  id: string;
  requiredFields: string[];
  validate: (state: CPQState) => boolean;
  isComplete: (state: CPQState) => boolean;
  prompt: string;
}

const STEPS: Step[] = [
  {
    id: 'address',
    requiredFields: ['venueName', 'address'],
    validate: (state) => !!state.fields.venueName && !!state.fields.address?.isValid,
    isComplete: (state) => state.fields.addressConfirmed === true,
    prompt: 'Please provide the venue name and address'
  },
  {
    id: 'productClass',
    requiredFields: ['productClass'],
    validate: (state) => !!state.fields.productClass,
    isComplete: (state) => !!state.fields.productClass,
    prompt: 'What type of display are we building?'
  },
  {
    id: 'pixelPitch',
    requiredFields: ['pixelPitch'],
    validate: (state) => state.fields.pixelPitch && state.fields.pixelPitch > 0,
    isComplete: (state) => !!state.fields.pixelPitch,
    prompt: 'What is the required pixel pitch?'
  },
  {
    id: 'dimensions',
    requiredFields: ['widthFt', 'heightFt'],
    validate: (state) => state.fields.widthFt > 0 && state.fields.heightFt > 0,
    isComplete: (state) => !!state.fields.widthFt && !!state.fields.heightFt,
    prompt: 'What are the display dimensions?'
  }
];

// State transition logic
function processUserMessage(state: CPQState, message: string): CPQState {
  const currentStep = STEPS.find(s => s.id === state.currentStep);
  
  // Check if current step is already complete
  if (currentStep && currentStep.isComplete(state)) {
    // Move to next incomplete step
    const nextStep = STEPS.find(s => !s.isComplete(state));
    if (nextStep) {
      state.currentStep = nextStep.id;
    }
    return state;
  }
  
  // Process message for current step
  const updatedState = updateStateForStep(state, state.currentStep, message);
  
  // Validate and mark complete if valid
  const step = STEPS.find(s => s.id === state.currentStep);
  if (step && step.validate(updatedState)) {
    updatedState.completedSteps.add(state.currentStep);
    
    // Move to next step
    const nextStep = STEPS.find(s => !s.isComplete(updatedState));
    if (nextStep) {
      updatedState.currentStep = nextStep.id;
    }
  }
  
  return updatedState;
}
```

---

### ISSUE_03_PRICE_NOT_RECALCULATED

**Description:**
When the pixel pitch changes from 6mm to 4mm to 10mm, the final price remains constant at $648,000 throughout the conversation. The system announces "Recalculating final price..." but the price never changes:

```
ANC Engineer: Updating pixel pitch to 4mm. Recalculating final price...
Updated Final Price: $648,000

ANC Engineer: Updating pixel pitch to 10mm. Recalculating final price...
Updated Final Price: $648,000
```

**Likely Cause:**
- Pricing function not actually being called when "recalculating" is announced
- Pricing logic using only a subset of state (e.g., ignoring pixel pitch)
- Cached price not being invalidated when fields change
- The pricing calculation may be based on unit cost ($1800/sq ft) and area (3000 sq ft) only, without considering pixel pitch impact on hardware costs

**Specific Fix:**
```typescript
// Centralized pricing function
interface PricingInputs {
  productClass: string;
  pixelPitch: number;
  widthFt: number;
  heightFt: number;
  mounting: string;
  structure: 'Existing' | 'NewSteel';
  labor: 'Union' | 'NonUnion';
  electricalDistance: 'Close' | 'Medium' | 'Far';
  permits: 'Client' | 'ANC';
  controls: 'New' | 'Existing' | 'None';
  bondRequired: boolean;
  unitCost: number;
  targetMargin: number;
}

interface PricingResult {
  hardwareCost: number;
  structuralCost: number;
  laborCost: number;
  electricalCost: number;
  permitCost: number;
  controlCost: number;
  bondCost: number;
  subtotal: number;
  margin: number;
  sellPrice: number;
  breakdown: {
    [key: string]: number;
  };
}

// Pixel pitch cost multiplier (example values)
const PIXEL_PITCH_MULTIPLIERS: Record<number, number> = {
  4: 1.5,   // Higher cost for finer pitch
  6: 1.0,   // Baseline
  8: 0.8,   // Lower cost for coarser pitch
  10: 0.6   // Lowest cost
};

function calculatePrice(inputs: PricingInputs): PricingResult {
  const areaSqFt = inputs.widthFt * inputs.heightFt;
  
  // Apply pixel pitch multiplier to hardware cost
  const pitchMultiplier = PIXEL_PITCH_MULTIPLIERS[inputs.pixelPitch] || 1.0;
  const adjustedUnitCost = inputs.unitCost * pitchMultiplier;
  
  // Calculate hardware cost
  const hardwareCost = areaSqFt * adjustedUnitCost;
  
  // Calculate structural cost based on mounting and structure
  const structuralCost = calculateStructuralCost(
    hardwareCost,
    inputs.mounting,
    inputs.structure
  );
  
  // Calculate labor cost
  const laborCost = calculateLaborCost(
    hardwareCost + structuralCost,
    inputs.labor,
    inputs.mounting
  );
  
  // Calculate electrical cost
  const electricalCost = calculateElectricalCost(
    areaSqFt,
    inputs.electricalDistance
  );
  
  // Calculate permit cost
  const permitCost = calculatePermitCost(
    hardwareCost,
    inputs.permits
  );
  
  // Calculate control system cost
  const controlCost = calculateControlCost(
    areaSqFt,
    inputs.controls
  );
  
  // Calculate subtotal
  const subtotal = hardwareCost + structuralCost + laborCost + 
                  electricalCost + permitCost + controlCost;
  
  // Calculate margin
  const marginAmount = subtotal * (inputs.targetMargin / 100);
  
  // Calculate bond cost
  const bondCost = inputs.bondRequired ? subtotal * 0.01 : 0;
  
  // Calculate sell price
  const sellPrice = subtotal + marginAmount + bondCost;
  
  return {
    hardwareCost,
    structuralCost,
    laborCost,
    electricalCost,
    permitCost,
    controlCost,
    bondCost,
    subtotal,
    margin: marginAmount,
    sellPrice,
    breakdown: {
      'Hardware': hardwareCost,
      'Structure': structuralCost,
      'Labor': laborCost,
      'Electrical': electricalCost,
      'Permits': permitCost,
      'Controls': controlCost,
      'Bond': bondCost,
      'Margin': marginAmount
    }
  };
}

// State management with price invalidation
interface CPQState {
  // ... existing fields
  pricing?: PricingResult;
  pricingInputs?: PricingInputs;
  lastPricingUpdate?: number;
}

function updateFieldAndRecalculate<T>(
  state: CPQState,
  field: keyof PricingInputs,
  value: T
): CPQState {
  // Update the field
  if (!state.pricingInputs) {
    state.pricingInputs = {} as PricingInputs;
  }
  state.pricingInputs[field] = value as any;
  
  // Invalidate cached price
  state.pricing = undefined;
  
  // Recalculate if all required fields are present
  if (hasAllPricingInputs(state.pricingInputs)) {
    state.pricing = calculatePrice(state.pricingInputs);
    state.lastPricingUpdate = Date.now();
  }
  
  return state;
}
```

---

### ISSUE_04_UNSAFE_ADDRESS_CONFIRMATION

**Description:**
The system confirms addresses that are clearly not valid structured addresses:

```
Executive: The Plaza Hotel: Luxury Hotel Near Central Park | 5 Star Hotel in NYC: Ideally situated on Fifth Avenue, The Plaza's prestigious address continues to define elegance with
ANC Engineer: Address confirmed. What type of display are we building at this location?
```

The system treats this SERP snippet as a confirmed address without extracting the actual street address (768 Fifth Avenue, New York, NY).

**Likely Cause:**
- No validation that address contains street, city, and country components
- The system may be checking only that a venue name was provided, not that a valid address exists
- Missing requirement for explicit confirmation of structured address components

**Specific Fix:**
```typescript
// Strict address validation
interface AddressComponents {
  venueName: string;
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

function isAddressValid(address: Partial<AddressComponents>): boolean {
  return !!(
    address.venueName &&
    address.street &&
    address.city &&
    address.country &&
    // Validate street has a number and name
    address.street.match(/^\d+\s+[\w\s]+/) &&
    // Validate city is not a generic term
    !['Hotel', 'Resort', 'Plaza'].includes(address.city) &&
    // Validate country is a real country
    VALID_COUNTRIES.includes(address.country)
  );
}

// Require explicit confirmation of structured address
function confirmAddress(state: CPQState, userConfirmation: string): CPQState {
  const address = state.fields.address;
  
  if (!isAddressValid(address)) {
    return {
      ...state,
      fields: {
        ...state.fields,
        addressConfirmed: false
      },
      errorMessage: 'Please provide a complete address with street, city, and country.'
    };
  }
  
  // Only confirm if user explicitly confirms
  if (userConfirmation.toLowerCase().match(/^(yes|confirmed|correct|ok)$/)) {
    return {
      ...state,
      fields: {
        ...state.fields,
        addressConfirmed: true
      }
    };
  }
  
  return state;
}

// Display address for confirmation
function formatAddressForConfirmation(address: AddressComponents): string {
  return `
**Please confirm the address:**
- Venue: ${address.venueName}
- Street: ${address.street}
- City: ${address.city}
- State: ${address.state || 'N/A'}
- Country: ${address.country}
- Postal Code: ${address.postalCode || 'N/A'}

Type "Confirmed" to proceed, or provide corrections.
  `.trim();
}
```

---

### ISSUE_05_CONFUSED_MOUNTING_VS_STRUCTURE

**Description:**
The system confuses mounting type (Ground/Rigging/Wall) with structure condition (Existing/New Steel). In the conversation:

```
Executive: Rigging
ANC Engineer: Will we be mounting to existing usable steel, or is new primary steel required?

Executive: Ground
ANC Engineer: I understand 'Ground' was your answer for mounting type. To clarify for the structural estimate: Will we be mounting to existing usable steel, or is new primary steel required?
```

The user provides mounting type (Rigging/Ground) but the system interprets it as structure condition.

**Likely Cause:**
- Missing clear separation between mounting type and structure condition in the state schema
- The system may be using a single field for both concepts
- No validation to ensure the correct field is being updated based on the current question

**Specific Fix:**
```typescript
// Separate fields for mounting and structure
interface CPQState {
  // ... existing fields
  mountingType?: 'Ground' | 'Rigging' | 'Wall' | 'Ceiling';
  structureCondition?: 'Existing' | 'NewSteel';
}

// Step definitions with clear field mapping
const STEPS: Step[] = [
  // ... other steps
  {
    id: 'mounting',
    requiredFields: ['mountingType'],
    validate: (state) => !!state.fields.mountingType,
    isComplete: (state) => !!state.fields.mountingType,
    prompt: 'How will this display be mounted?',
    allowedValues: ['Ground', 'Rigging', 'Wall', 'Ceiling'],
    targetField: 'mountingType'
  },
  {
    id: 'structure',
    requiredFields: ['structureCondition'],
    validate: (state) => !!state.fields.structureCondition,
    isComplete: (state) => !!state.fields.structureCondition,
    prompt: 'Will we be mounting to existing usable steel, or is new primary steel required?',
    allowedValues: ['Existing', 'NewSteel'],
    targetField: 'structureCondition'
  }
];

// Field update with validation
function updateField(
  state: CPQState,
  stepId: string,
  value: string
): CPQState {
  const step = STEPS.find(s => s.id === stepId);
  
  if (!step) {
    return state;
  }
  
  // Validate value against allowed values
  if (step.allowedValues && !step.allowedValues.includes(value)) {
    return {
      ...state,
      errorMessage: `Invalid value. Please choose from: ${step.allowedValues.join(', ')}`
    };
  }
  
  // Update the correct field
  return {
    ...state,
    fields: {
      ...state.fields,
      [step.targetField]: value
    }
  };
}
```

---

### ISSUE_06_REPEATED_PERMIT_QUESTION

**Description:**
The system repeatedly asks "Who will handle the city/structural permits?" even after receiving valid answers:

```
Executive: Existing
ANC Engineer: Who will handle the city/structural permits?

Executive: Existing
ANC Engineer: Who will handle the city/structural permits?

Executive: NewSteel
ANC Engineer: Who will handle the city/structural permits?

Executive: Existing
ANC Engineer: Who will handle the city/structural permits?

Executive: Existing
ANC Engineer: Who will handle the city/structural permits?
```

**Likely Cause:**
- Similar to ISSUE_02, this is a state machine bug where the step is not being marked complete
- The user's answers may not match the expected format (e.g., "Existing" vs "Client" vs "ANC")
- No validation that the answer is one of the allowed values

**Specific Fix:**
```typescript
// Define allowed values for permits
const PERMIT_OPTIONS = ['Client', 'ANC', 'Existing'] as const;
type PermitOption = typeof PERMIT_OPTIONS[number];

// Normalize user input
function normalizePermitAnswer(input: string): PermitOption | null {
  const normalized = input.toLowerCase().trim();
  
  // Map common variations to standard values
  if (normalized.match(/^(client|customer|owner)$/)) {
    return 'Client';
  }
  if (normalized.match(/^(anc|vendor|contractor)$/)) {
    return 'ANC';
  }
  if (normalized.match(/^(existing|already|done)$/)) {
    return 'Existing';
  }
  
  // Check if it's already a valid option
  if (PERMIT_OPTIONS.includes(input as PermitOption)) {
    return input as PermitOption;
  }
  
  return null;
}

// Step with validation
const PERMIT_STEP: Step = {
  id: 'permits',
  requiredFields: ['permits'],
  validate: (state) => {
    const value = state.fields.permits;
    return PERMIT_OPTIONS.includes(value as PermitOption);
  },
  isComplete: (state) => {
    const value = state.fields.permits;
    return PERMIT_OPTIONS.includes(value as PermitOption);
  },
  prompt: 'Who will handle the city/structural permits?',
  allowedValues: PERMIT_OPTIONS,
  targetField: 'permits'
};

// Process user message with normalization
function processPermitAnswer(state: CPQState, message: string): CPQState {
  const normalized = normalizePermitAnswer(message);
  
  if (!normalized) {
    return {
      ...state,
      errorMessage: `Please choose from: ${PERMIT_OPTIONS.join(', ')}`
    };
  }
  
  return {
    ...state,
    fields: {
      ...state.fields,
      permits: normalized
    },
    completedSteps: new Set([...state.completedSteps, 'permits'])
  };
}
```

---

### ISSUE_07_INCONSISTENT_PRODUCT_CLASS

**Description:**
The system accepts conflicting product class inputs without clarification:

```
Executive: Ribbon
ANC Engineer: Got it, Ribbon Board. What is the required pixel pitch for the display?

Executive: CenterHung
ANC Engineer: Got it, Center Hung. What is the required pixel pitch for the display?
```

The user changes from Ribbon to CenterHung, and the system accepts it without asking for confirmation or explaining the implications.

**Likely Cause:**
- No validation that product class changes are intentional
- Missing confirmation step when changing a previously set field
- The system may be treating each message as a fresh input rather than detecting a change request

**Specific Fix:**
```typescript
// Detect field changes
function detectFieldChange(
  state: CPQState,
  field: string,
  newValue: any
): boolean {
  const currentValue = state.fields[field];
  return currentValue !== undefined && currentValue !== newValue;
}

// Require confirmation for field changes
function updateFieldWithConfirmation(
  state: CPQState,
  field: string,
  newValue: any,
  userMessage: string
): CPQState {
  const isChange = detectFieldChange(state, field, newValue);
  
  if (isChange) {
    // Check if user explicitly requested the change
    const isExplicitChange = userMessage.toLowerCase().match(
      /^(change|update|modify|switch to|set to)/i
    );
    
    if (!isExplicitChange) {
      return {
        ...state,
        pendingChange: {
          field,
          oldValue: state.fields[field],
          newValue,
          requiresConfirmation: true
        },
        message: `You previously set ${field} to "${state.fields[field]}". Would you like to change it to "${newValue}"?`
      };
    }
  }
  
  // Apply the change
  return {
    ...state,
    fields: {
      ...state.fields,
      [field]: newValue
    },
    pendingChange: undefined
  };
}

// Handle confirmation response
function handleConfirmationResponse(
  state: CPQState,
  response: string
): CPQState {
  if (!state.pendingChange) {
    return state;
  }
  
  if (response.toLowerCase().match(/^(yes|confirmed|ok|proceed)$/)) {
    return {
      ...state,
      fields: {
        ...state.fields,
        [state.pendingChange.field]: state.pendingChange.newValue
      },
      pendingChange: undefined
    };
  }
  
  // Reject the change
  return {
    ...state,
    pendingChange: undefined,
    message: `Keeping ${state.pendingChange.field} as "${state.pendingChange.oldValue}".`
  };
}
```

---

### ISSUE_08_MISSING_NUMERIC_VALIDATION

**Description:**
The system accepts numeric inputs without proper validation:

```
Executive: 4
ANC Engineer: What is the display width in feet?

Executive: 40
ANC Engineer: Got it, 40 ft. What is the display height in feet?

Executive: 30
ANC Engineer: Got it, 30 ft. Where will this display be installed?
```

While these values seem reasonable, there's no validation that:
- Pixel pitch is within valid range (typically 2-20mm)
- Dimensions are within realistic bounds (e.g., not 1000ft x 1000ft)
- Values are positive numbers

**Likely Cause:**
- Missing schema validation for numeric fields
- No range checks for pixel pitch, dimensions, or other numeric inputs
- The system may be accepting any number without context validation

**Specific Fix:**
```typescript
// Define validation rules for numeric fields
interface NumericFieldRule {
  min?: number;
  max?: number;
  allowedValues?: number[];
  unit?: string;
  description: string;
}

const NUMERIC_FIELD_RULES: Record<string, NumericFieldRule> = {
  pixelPitch: {
    min: 2,
    max: 20,
    allowedValues: [2, 3, 4, 6, 8, 10, 12, 16, 20],
    unit: 'mm',
    description: 'Pixel pitch must be between 2-20mm'
  },
  widthFt: {
    min: 1,
    max: 500,
    unit: 'ft',
    description: 'Width must be between 1-500 feet'
  },
  heightFt: {
    min: 1,
    max: 500,
    unit: 'ft',
    description: 'Height must be between 1-500 feet'
  },
  unitCost: {
    min: 100,
    max: 10000,
    unit: '$/sq ft',
    description: 'Unit cost must be between $100-$10,000 per sq ft'
  },
  targetMargin: {
    min: 0,
    max: 100,
    unit: '%',
    description: 'Margin must be between 0-100%'
  }
};

// Validate numeric input
function validateNumericInput(
  field: string,
  value: number
): { valid: boolean; error?: string } {
  const rule = NUMERIC_FIELD_RULES[field];
  
  if (!rule) {
    return { valid: true };
  }
  
  // Check if value is a number
  if (isNaN(value)) {
    return { valid: false, error: 'Please enter a valid number' };
  }
  
  // Check minimum
  if (rule.min !== undefined && value < rule.min) {
    return {
      valid: false,
      error: `${field} must be at least ${rule.min}${rule.unit || ''}`
    };
  }
  
  // Check maximum
  if (rule.max !== undefined && value > rule.max) {
    return {
      valid: false,
      error: `${field} must be at most ${rule.max}${rule.unit || ''}`
    };
  }
  
  // Check allowed values
  if (rule.allowedValues && !rule.allowedValues.includes(value)) {
    return {
      valid: false,
      error: `${field} must be one of: ${rule.allowedValues.join(', ')}${rule.unit || ''}`
    };
  }
  
  return { valid: true };
}

// Parse and validate numeric input
function parseNumericInput(
  field: string,
  input: string
): { valid: boolean; value?: number; error?: string } {
  // Extract number from input
  const match = input.match(/(\d+(?:\.\d+)?)/);
  
  if (!match) {
    return { valid: false, error: 'Please enter a valid number' };
  }
  
  const value = parseFloat(match[1]);
  const validation = validateNumericInput(field, value);
  
  if (!validation.valid) {
    return { valid: false, error: validation.error };
  }
  
  return { valid: true, value };
}
```

---

## Test Cases

### Test Case 1: SERP Snippet as Address
**Input:** "The Plaza Hotel: Luxury Hotel Near Central Park | 5 Star Hotel in NYC: Ideally situated on Fifth Avenue, The Plaza's prestigious address continues to define elegance with"

**Expected Behavior:**
- System classifies as SERP snippet
- Extracts venue name: "The Plaza Hotel"
- Does NOT confirm address
- Prompts for structured address: "Please provide the street address for The Plaza Hotel (e.g., 768 Fifth Avenue, New York, NY)"

**Current Behavior:** ❌ Confirms address without validation

---

### Test Case 2: Repeated Height Question
**Input Sequence:**
1. User: "30"
2. System: "What is the display height in feet?"
3. User: "30"
4. System: "What is the display height in feet?"

**Expected Behavior:**
- After first "30", system validates and marks height as complete
- Moves to next question (e.g., "Where will this display be installed?")
- Does NOT ask height again

**Current Behavior:** ❌ Repeats height question multiple times

---

### Test Case 3: Price Recalculation
**Input Sequence:**
1. Configure: 100' x 30', 6mm, $1800/sq ft, 20% margin
2. System calculates: $648,000
3. User: "4" (change pixel pitch to 4mm)
4. System: "Updating pixel pitch to 4mm. Recalculating..."

**Expected Behavior:**
- Price increases due to finer pixel pitch (e.g., to ~$972,000 with 1.5x multiplier)
- System shows updated price with breakdown

**Current Behavior:** ❌ Price remains $648,000

---

### Test Case 4: Address Confirmation
**Input:** "The Plaza Hotel: Luxury Hotel Near Central Park | 5 Star Hotel in NYC: Ideally situated on Fifth Avenue, The Plaza's prestigious address continues to define elegance with"

**Expected Behavior:**
- System extracts: Venue="The Plaza Hotel"
- System prompts: "I found The Plaza Hotel. Please provide the street address (e.g., 768 Fifth Avenue, New York, NY)"
- User provides: "768 Fifth Avenue, New York, NY"
- System displays for confirmation:
  ```
  Venue: The Plaza Hotel
  Street: 768 Fifth Avenue
  City: New York
  State: NY
  Country: USA
  ```
- User confirms: "Confirmed"
- System marks address as confirmed

**Current Behavior:** ❌ Confirms SERP snippet as valid address

---

### Test Case 5: Mounting vs Structure Confusion
**Input Sequence:**
1. System: "How will this display be mounted?"
2. User: "Rigging"
3. System: "Got it, Rigging. What type of service access does this display require?"
4. System: "Will we be mounting to existing usable steel, or is new primary steel required?"
5. User: "Ground"

**Expected Behavior:**
- System recognizes "Ground" is not a valid answer for structure condition
- System prompts: "Please choose: Existing or NewSteel"
- System does NOT interpret "Ground" as structure condition

**Current Behavior:** ❌ System interprets "Ground" as mounting type again

---

## Implementation Priority

### High Priority (Critical)
1. **ISSUE_01_INPUT_SNIPPET_AS_ADDRESS** - Prevents invalid addresses from being confirmed
2. **ISSUE_02_REPEATED_HEIGHT_PROMPT** - Causes infinite loops and poor UX
3. **ISSUE_03_PRICE_NOT_RECALCULATED** - Results in incorrect pricing

### Medium Priority (Important)
4. **ISSUE_04_UNSAFE_ADDRESS_CONFIRMATION** - Data integrity issue
5. **ISSUE_05_CONFUSED_MOUNTING_VS_STRUCTURE** - Confusing UX
6. **ISSUE_06_REPEATED_PERMIT_QUESTION** - Similar to ISSUE_02

### Low Priority (Nice to Have)
7. **ISSUE_07_INCONSISTENT_PRODUCT_CLASS** - UX improvement
8. **ISSUE_08_MISSING_NUMERIC_VALIDATION** - Edge case handling

---

## Architecture Recommendations

### 1. Structured State Model
```typescript
interface CPQSession {
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
  currentStep: string;
  completedSteps: string[];
  fields: {
    // Client/Venue
    clientName?: string;
    venueName?: string;
    address?: AddressComponents;
    addressConfirmed?: boolean;
    
    // Product
    productClass?: ProductClass;
    pixelPitch?: number;
    widthFt?: number;
    heightFt?: number;
    shape?: 'Flat' | 'Curved';
    
    // Installation
    mountingType?: MountingType;
    structureCondition?: StructureCondition;
    serviceAccess?: 'Front' | 'Rear';
    
    // Labor & Permits
    laborType?: 'Union' | 'NonUnion';
    electricalDistance?: 'Close' | 'Medium' | 'Far';
    permits?: 'Client' | 'ANC' | 'Existing';
    
    // Controls & Bond
    controls?: 'New' | 'Existing' | 'None';
    bondRequired?: boolean;
    
    // Pricing
    unitCost?: number;
    targetMargin?: number;
  };
  pricing?: PricingResult;
  pendingChange?: PendingChange;
  errorMessage?: string;
}
```

### 2. Input Processing Pipeline
```
User Input
    ↓
[Classifier] → Determine message type
    ↓
[Validator] → Validate against current step
    ↓
[Normalizer] → Clean and normalize input
    ↓
[State Updater] → Update session state
    ↓
[Price Calculator] → Recalculate if needed
    ↓
[Response Generator] → Generate appropriate response
```

### 3. Finite State Machine
```typescript
class CPQStateMachine {
  private state: CPQSession;
  private steps: Step[];
  
  constructor(initialState: CPQSession) {
    this.state = initialState;
    this.steps = defineSteps();
  }
  
  processMessage(message: string): CPQResponse {
    const messageType = classifyMessage(message);
    const currentStep = this.getCurrentStep();
    
    // Handle different message types
    switch (messageType) {
      case MessageType.CONFIRMATION:
        return this.handleConfirmation(message);
      case MessageType.CHANGE_REQUEST:
        return this.handleChangeRequest(message);
      case MessageType.SERP_SNIPPET:
        return this.handleSERPSnippet(message);
      default:
        return this.handleRegularInput(message, currentStep);
    }
  }
  
  private handleRegularInput(message: string, step: Step): CPQResponse {
    const normalized = normalizeInput(message, step);
    const validated = validateInput(normalized, step);
    
    if (!validated.valid) {
      return {
        message: validated.error || 'Invalid input',
        state: this.state
      };
    }
    
    // Update state
    this.state = updateState(this.state, step.targetField, normalized);
    
    // Recalculate price if needed
    if (shouldRecalculatePrice(step.targetField)) {
      this.state.pricing = calculatePrice(this.state.fields);
    }
    
    // Move to next step
    const nextStep = this.getNextStep();
    if (nextStep) {
      this.state.currentStep = nextStep.id;
    }
    
    return {
      message: nextStep ? nextStep.prompt : 'Configuration complete',
      state: this.state
    };
  }
}
```

### 4. Pricing Service
```typescript
class PricingService {
  private cache: Map<string, PricingResult> = new Map();
  
  calculate(inputs: PricingInputs): PricingResult {
    const cacheKey = this.generateCacheKey(inputs);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const result = this.performCalculation(inputs);
    this.cache.set(cacheKey, result);
    
    return result;
  }
  
  private performCalculation(inputs: PricingInputs): PricingResult {
    // Implementation of pricing logic
    // ...
  }
  
  private generateCacheKey(inputs: PricingInputs): string {
    return JSON.stringify(inputs);
  }
  
  invalidateCache(): void {
    this.cache.clear();
  }
}
```

---

## Conclusion

The ANC CPQ Engine has several critical issues that impact user experience and data integrity. The most severe problems are:

1. **Input parsing** - Treating SERP snippets as valid addresses
2. **State management** - Repeated questions and infinite loops
3. **Pricing logic** - Not recalculating when fields change

Implementing the recommended fixes will significantly improve the system's reliability and user experience. The proposed architecture provides a solid foundation for addressing these issues and preventing similar problems in the future.

---

**Report Generated:** 2026-01-11
**Analyzed Session:** Executive vs ANC Engineer conversation log
**Total Issues Identified:** 8
**Critical Issues:** 3
**Recommended Implementation Timeline:** 2-3 weeks for high-priority fixes