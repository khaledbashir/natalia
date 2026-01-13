// State machine implementation for ANC CPQ Engine

import { CPQInput } from './types';
import { ValidatedAddress, MessageType, classifyUserMessage, validateAddress, formatAddressForConfirmation } from './input-validator';

export interface Step {
  id: string;
  category: string;
  requiredFields: string[];
  validate: (state: Partial<CPQInput>) => boolean;
  isComplete: (state: Partial<CPQInput>) => boolean;
  prompt: string;
  allowedValues?: string[];
  targetField?: string;
}

export interface CPQSession {
  sessionId: string;
  currentStep: string;
  completedSteps: Set<string>;
  fields: Partial<CPQInput>;
  addressValidated?: ValidatedAddress;
  addressConfirmed?: boolean;
  pendingChange?: PendingChange;
  errorMessage?: string;
  lastUpdated: number;
}

export interface PendingChange {
  field: string;
  oldValue: any;
  newValue: any;
  requiresConfirmation: boolean;
}

// Define all steps in the wizard
export const STEPS: Step[] = [
  {
    id: 'clientName',
    category: 'metadata',
    requiredFields: ['clientName'],
    validate: (state) => !!state.clientName && state.clientName.trim().length > 0,
    isComplete: (state) => !!state.clientName && state.clientName.trim().length > 0,
    prompt: "What's the venue name?",
    targetField: 'clientName'
  },
  {
    id: 'address',
    category: 'metadata',
    requiredFields: ['address'],
    validate: (state) => !!state.address && state.address.trim().length > 0,
    isComplete: (state) => state.addressConfirmed === true,
    prompt: "What is the physical address of the venue?",
    targetField: 'address'
  },
  {
    id: 'productClass',
    category: 'display',
    requiredFields: ['productClass'],
    validate: (state) => !!state.productClass,
    isComplete: (state) => !!state.productClass,
    prompt: "What type of display are we building?",
    allowedValues: ['Scoreboard', 'Ribbon', 'CenterHung', 'Vomitory'],
    targetField: 'productClass'
  },
  {
    id: 'pixelPitch',
    category: 'display',
    requiredFields: ['pixelPitch'],
    validate: (state) => state.pixelPitch !== undefined && state.pixelPitch > 0,
    isComplete: (state) => state.pixelPitch !== undefined && state.pixelPitch > 0,
    prompt: "What is the required pixel pitch for the display?",
    allowedValues: ['2', '3', '4', '6', '8', '10', '12', '16', '20'],
    targetField: 'pixelPitch'
  },
  {
    id: 'widthFt',
    category: 'display',
    requiredFields: ['widthFt'],
    validate: (state) => state.widthFt !== undefined && state.widthFt > 0,
    isComplete: (state) => state.widthFt !== undefined && state.widthFt > 0,
    prompt: "What is the display width in feet?",
    targetField: 'widthFt'
  },
  {
    id: 'heightFt',
    category: 'display',
    requiredFields: ['heightFt'],
    validate: (state) => state.heightFt !== undefined && state.heightFt > 0,
    isComplete: (state) => state.heightFt !== undefined && state.heightFt > 0,
    prompt: "What is the display height in feet?",
    targetField: 'heightFt'
  },
  {
    id: 'environment',
    category: 'environment',
    requiredFields: ['environment'],
    validate: (state) => !!state.environment,
    isComplete: (state) => !!state.environment,
    prompt: "Where will this display be installed?",
    allowedValues: ['Indoor', 'Outdoor'],
    targetField: 'environment'
  },
  {
    id: 'shape',
    category: 'structure',
    requiredFields: ['shape'],
    validate: (state) => !!state.shape,
    isComplete: (state) => !!state.shape,
    prompt: "What shape configuration do you need?",
    allowedValues: ['Flat', 'Curved'],
    targetField: 'shape'
  },
  {
    id: 'mountingType',
    category: 'structure',
    requiredFields: ['mountingType'],
    validate: (state) => !!state.mountingType,
    isComplete: (state) => !!state.mountingType,
    prompt: "How will this display be mounted?",
    allowedValues: ['Wall', 'Ground', 'Rigging', 'Pole'],
    targetField: 'mountingType'
  },
  {
    id: 'access',
    category: 'access',
    requiredFields: ['access'],
    validate: (state) => !!state.access,
    isComplete: (state) => !!state.access,
    prompt: "What type of service access does this display require?",
    allowedValues: ['Front', 'Rear'],
    targetField: 'access'
  },
  {
    id: 'structureCondition',
    category: 'structure',
    requiredFields: ['structureCondition'],
    validate: (state) => !!state.structureCondition,
    isComplete: (state) => !!state.structureCondition,
    prompt: "Will we be mounting to existing usable steel, or is new primary steel required?",
    allowedValues: ['Existing', 'NewSteel'],
    targetField: 'structureCondition'
  },
  {
    id: 'laborType',
    category: 'labor',
    requiredFields: ['laborType'],
    validate: (state) => !!state.laborType,
    isComplete: (state) => !!state.laborType,
    prompt: "What are the labor requirements for this venue?",
    allowedValues: ['NonUnion', 'Union', 'Prevailing'],
    targetField: 'laborType'
  },
  {
    id: 'powerDistance',
    category: 'project',
    requiredFields: ['powerDistance'],
    validate: (state) => !!state.powerDistance,
    isComplete: (state) => !!state.powerDistance,
    prompt: "Approximate distance to the nearest power/data termination point?",
    allowedValues: ['Close', 'Medium', 'Far'],
    targetField: 'powerDistance'
  },
  {
    id: 'permits',
    category: 'project',
    requiredFields: ['permits'],
    validate: (state) => !!state.permits,
    isComplete: (state) => !!state.permits,
    prompt: "Who will handle the city/structural permits?",
    allowedValues: ['Client', 'ANC', 'Existing'],
    targetField: 'permits'
  },
  {
    id: 'controlSystem',
    category: 'project',
    requiredFields: ['controlSystem'],
    validate: (state) => !!state.controlSystem,
    isComplete: (state) => !!state.controlSystem,
    prompt: "Do you need a new control system (processors/sending boxes) included?",
    allowedValues: ['Include', 'None'],
    targetField: 'controlSystem'
  },
  {
    id: 'bondRequired',
    category: 'project',
    requiredFields: ['bondRequired'],
    validate: (state) => state.bondRequired === true || state.bondRequired === false,
    isComplete: (state) => state.bondRequired === true || state.bondRequired === false,
    prompt: "Is a Payment or Performance Bond required for this project?",
    allowedValues: ['Yes', 'No'],
    targetField: 'bondRequired'
  },
  {
    id: 'complexity',
    category: 'project',
    requiredFields: ['complexity'],
    validate: (state) => !!state.complexity && ['Standard', 'High'].includes(state.complexity),
    isComplete: (state) => !!state.complexity && ['Standard', 'High'].includes(state.complexity),
    prompt: "What is the overall install complexity?",
    allowedValues: ['Standard', 'High'],
    targetField: 'complexity'
  },
  {
    id: 'unitCost',
    category: 'pricing',
    requiredFields: ['unitCost'],
    validate: (state) => !!state.unitCost && state.unitCost > 0,
    isComplete: (state) => !!state.unitCost && state.unitCost > 0,
    prompt: "Do you have a target dollar per sq ft for the hardware?",
    targetField: 'unitCost'
  },
  {
    id: 'targetMargin',
    category: 'pricing',
    requiredFields: ['targetMargin'],
    validate: (state) => state.targetMargin !== undefined && state.targetMargin >= 0,
    isComplete: (state) => state.targetMargin !== undefined && state.targetMargin >= 0,
    prompt: "What is the target gross margin percentage?",
    targetField: 'targetMargin'
  },
  {
    id: 'serviceLevel',
    category: 'project',
    requiredFields: ['serviceLevel'],
    validate: (state) => !!state.serviceLevel && ['bronze', 'silver', 'gold'].includes(state.serviceLevel),
    isComplete: (state) => !!state.serviceLevel && ['bronze', 'silver', 'gold'].includes(state.serviceLevel),
    prompt: "What level of ongoing service is required?",
    allowedValues: ['bronze', 'silver', 'gold'],
    targetField: 'serviceLevel'
  }
];

/**
 * Create a new CPQ session
 */
export function createSession(sessionId: string): CPQSession {
  return {
    sessionId,
    currentStep: 'clientName',
    completedSteps: new Set<string>(),
    fields: {},
    addressConfirmed: false,
    lastUpdated: Date.now()
  };
}

/**
 * Get current step definition
 */
export function getCurrentStep(session: CPQSession): Step | undefined {
  return STEPS.find(s => s.id === session.currentStep);
}

/**
 * Get next incomplete step
 */
export function getNextIncompleteStep(session: CPQSession): Step | undefined {
  return STEPS.find(s => !s.isComplete(session.fields));
}

/**
 * Check if a field has changed
 */
export function detectFieldChange(
  session: CPQSession,
  field: string,
  newValue: any
): boolean {
  const currentValue = session.fields[field as keyof CPQInput];
  return currentValue !== undefined && currentValue !== newValue;
}

/**
 * Update field with change detection
 */
export function updateFieldWithChangeDetection(
  session: CPQSession,
  field: string,
  newValue: any,
  userMessage: string
): CPQSession {
  const isChange = detectFieldChange(session, field, newValue);
  
  if (isChange) {
    // Check if user explicitly requested the change
    const isExplicitChange = userMessage.toLowerCase().match(
      /^(change|update|modify|switch to|set to|i want to change)/i
    );
    
    if (!isExplicitChange) {
      return {
        ...session,
        pendingChange: {
          field,
          oldValue: session.fields[field as keyof CPQInput],
          newValue,
          requiresConfirmation: true
        },
        errorMessage: `You previously set ${field} to "${session.fields[field as keyof CPQInput]}". Would you like to change it to "${newValue}"?`
      };
    }
  }
  
  // Apply the change
  const updatedFields = {
    ...session.fields,
    [field]: newValue
  };
  
  // Mark step as complete if valid
  const step = STEPS.find(s => s.targetField === field);
  const completedSteps = new Set(session.completedSteps);
  if (step && step.validate(updatedFields)) {
    completedSteps.add(step.id);
  }
  
  return {
    ...session,
    fields: updatedFields,
    completedSteps,
    pendingChange: undefined,
    errorMessage: undefined,
    lastUpdated: Date.now()
  };
}

/**
 * Handle confirmation response
 */
export function handleConfirmationResponse(
  session: CPQSession,
  response: string
): CPQSession {
  if (!session.pendingChange) {
    return session;
  }
  
  const pendingChange = session.pendingChange!;
  
  if (response.toLowerCase().match(/^(yes|confirmed|ok|proceed)$/)) {
    const updatedFields = {
      ...session.fields,
      [pendingChange.field]: pendingChange.newValue
    };
    
    // Mark step as complete if valid
    const step = STEPS.find(s => s.targetField === pendingChange.field);
    const completedSteps = new Set(session.completedSteps);
    if (step && step.validate(updatedFields)) {
      completedSteps.add(step.id);
    }
    
    return {
      ...session,
      fields: updatedFields,
      completedSteps,
      pendingChange: undefined,
      errorMessage: undefined,
      lastUpdated: Date.now()
    };
  }
  
  // Reject the change
  return {
    ...session,
    pendingChange: undefined,
    errorMessage: `Keeping ${pendingChange.field} as "${pendingChange.oldValue}".`,
    lastUpdated: Date.now()
  };
}

/**
 * Process user message through state machine
 */
export function processUserMessage(
  session: CPQSession,
  message: string
): CPQSession {
  const messageType = classifyUserMessage(message);
  const currentStep = getCurrentStep(session);
  
  // Handle confirmation response
  if (messageType === MessageType.CONFIRMATION && session.pendingChange) {
    return handleConfirmationResponse(session, message);
  }
  
  // Handle address confirmation
  if (session.currentStep === 'address' && messageType === MessageType.CONFIRMATION) {
    if (session.addressValidated?.isValid) {
      const updatedSession = {
        ...session,
        addressConfirmed: true,
        completedSteps: new Set([...session.completedSteps, 'address']),
        errorMessage: undefined
      };
      
      // Move to next step
      const nextStep = getNextIncompleteStep(updatedSession);
      if (nextStep) {
        updatedSession.currentStep = nextStep.id;
      }
      
      return updatedSession;
    } else {
      return {
        ...session,
        errorMessage: 'Please provide a complete address with street, city, and country.'
      };
    }
  }
  
  // Handle SERP snippet for address
  if (session.currentStep === 'address' && messageType === MessageType.SERP_SNIPPET) {
    const validated = validateAddress(message);
    
    if (validated.isValid) {
      return {
        ...session,
        fields: {
          ...session.fields,
          clientName: validated.venueName || session.fields.clientName,
          address: `${validated.street}, ${validated.city}, ${validated.state || ''} ${validated.postalCode || ''}`.trim()
        },
        addressValidated: validated,
        errorMessage: formatAddressForConfirmation(validated)
      };
    } else {
      return {
        ...session,
        fields: {
          ...session.fields,
          clientName: validated.venueName || session.fields.clientName
        },
        addressValidated: validated,
        errorMessage: `I found "${validated.venueName || 'venue'}". Please provide the complete street address (e.g., 768 Fifth Avenue, New York, NY 10019).`
      };
    }
  }
  
  // Check if current step is already complete
  if (currentStep && currentStep.isComplete(session.fields)) {
    // Move to next incomplete step
    const nextStep = getNextIncompleteStep(session);
    if (nextStep) {
      return {
        ...session,
        currentStep: nextStep.id,
        lastUpdated: Date.now()
      };
    }
    return session;
  }
  
  // Process message for current step
  if (currentStep) {
    // Validate value against allowed values
    if (currentStep.allowedValues && !currentStep.allowedValues.includes(message)) {
      return {
        ...session,
        errorMessage: `Invalid value. Please choose from: ${currentStep.allowedValues.join(', ')}`
      };
    }
    
    // Update the field
    return updateFieldWithChangeDetection(session, currentStep.targetField || currentStep.id, message, message);
  }
  
  return session;
}

/**
 * Check if session is complete
 */
export function isSessionComplete(session: CPQSession): boolean {
  return STEPS.every(step => step.isComplete(session.fields));
}

/**
 * Get session progress percentage
 */
export function getSessionProgress(session: CPQSession): number {
  const completedSteps = STEPS.filter(step => step.isComplete(session.fields)).length;
  return Math.round((completedSteps / STEPS.length) * 100);
}