// Input classifier and validation utilities for ANC CPQ Engine

export enum MessageType {
  VENUE_NAME_ONLY = 'VENUE_NAME_ONLY',
  FULL_ADDRESS = 'FULL_ADDRESS',
  SERP_SNIPPET = 'SERP_SNIPPET',
  URL = 'URL',
  CONFIRMATION = 'CONFIRMATION',
  CHANGE_REQUEST = 'CHANGE_REQUEST',
  IRRELEVANT = 'IRRELEVANT'
}

export interface ValidatedAddress {
  venueName?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isValid: boolean;
  confidence: number;
  rawInput: string;
}

export interface NumericFieldRule {
  min?: number;
  max?: number;
  allowedValues?: number[];
  unit?: string;
  description: string;
}

// Valid countries list (simplified for demo)
const VALID_COUNTRIES = [
  'USA', 'United States', 'US',
  'Canada', 'CA',
  'UK', 'United Kingdom', 'GB',
  'Jordan', 'JO',
  'Egypt', 'EG',
  'UAE', 'United Arab Emirates',
  'Australia', 'AU',
  'Germany', 'DE',
  'France', 'FR',
  'Italy', 'IT',
  'Spain', 'ES',
  'Japan', 'JP',
  'China', 'CN'
];

// Numeric field validation rules
export const NUMERIC_FIELD_RULES: Record<string, NumericFieldRule> = {
  pixelPitch: {
    min: 2,
    max: 20,
    allowedValues: [2, 3, 4, 6, 8, 10, 12, 16, 20],
    unit: 'mm',
    description: 'Pixel pitch must be between 2-20mm'
  },
  widthFt: {
    min: 0,
    max: 500,
    unit: 'ft',
    description: 'Width must be between 0-500 feet'
  },
  heightFt: {
    min: 0,
    max: 500,
    unit: 'ft',
    description: 'Height must be between 0-500 feet'
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

/**
 * Classify user message type
 */
export function classifyUserMessage(message: string): MessageType {
  if (!message || message.trim().length === 0) {
    return MessageType.IRRELEVANT;
  }

  const trimmed = message.trim().toLowerCase();

  // Check for URLs
  if (trimmed.match(/^https?:\/\//)) {
    return MessageType.URL;
  }

  // Check for confirmation
  if (trimmed.match(/^(yes|ok|confirmed|correct|sure|proceed)$/)) {
    return MessageType.CONFIRMATION;
  }

  // Check for change request
  if (trimmed.match(/^(change|update|modify|switch to|set to|i want to change)/i)) {
    return MessageType.CHANGE_REQUEST;
  }

  // Check for SERP patterns (search result snippets)
  if (isSERPSnippet(message)) {
    return MessageType.SERP_SNIPPET;
  }

  // Check for full address pattern (street, city, state/country)
  if (isFullAddress(message)) {
    return MessageType.FULL_ADDRESS;
  }

  // Default to venue name
  return MessageType.VENUE_NAME_ONLY;
}

/**
 * Check if message looks like a SERP snippet
 */
function isSERPSnippet(message: string): boolean {
  const lower = message.toLowerCase();
  
  // Common SERP patterns
  const serpPatterns = [
    /\s*\|\s*/, // Pipe separator
    /\s*—\s*/, // Em dash separator
    /reviews/i,
    /deals & reviews/i,
    /star hotel/i,
    /hotel in/i,
    /from \$\d+/i, // Price pattern
    /guests had/i,
    /ideally situated/i,
    /prestigious address/i,
    /define elegance/i,
    /write a review/i,
    /the best/i,
    /located in one of/i,
    /business district/i
  ];

  return serpPatterns.some(pattern => pattern.test(lower));
}

/**
 * Check if message looks like a full address
 */
function isFullAddress(message: string): boolean {
  const trimmed = message.trim();
  const parts = trimmed.split(',').map(p => p.trim());
  
  // If it has multiple parts (comma separated), it's likely an address or venue result
  if (parts.length >= 3) return true;

  // Look for street number + street name pattern
  const hasNumber = /\d+/.test(trimmed);
  const hasStreetType = /\b(street|st|ave|avenue|road|rd|blvd|boulevard|lane|ln|drive|dr|way|court|ct|place|pl|plaza|coast|governorate|district|al|pasha)\b/i.test(trimmed);

  return (parts.length >= 2 && (hasNumber || hasStreetType));
}

/**
 * Clean address input by removing SERP artifacts
 */
export function cleanAddressInput(input: string): string {
  return input
    .replace(/\s*—\s*Reviews.*$/gi, '')
    .replace(/\s*\|\s*.*Hotel.*$/gi, '')
    .replace(/\s*\|\s*\d+\s*Star\s*Hotel.*$/gi, '')
    .replace(/\s*Hotel\s*Deals\s*&\s*Reviews.*$/gi, '')
    .replace(/\s*from\s*\$\d+.*$/gi, '')
    .replace(/\s*Guests\s*had.*$/gi, '')
    .replace(/\s*Ideally\s*situated.*$/gi, '')
    .replace(/\s*prestigious\s*address.*$/gi, '')
    .replace(/\s*define\s*elegance.*$/gi, '')
    .replace(/\s*Write\s*a\s*review.*$/gi, '')
    .replace(/\s*The\s*Best.*$/gi, '')
    .replace(/\s*Located\s*in\s*one\s*of.*$/gi, '')
    .replace(/\s*business\s*district.*$/gi, '')
    .trim();
}

/**
 * Extract venue name from input
 */
function extractVenueName(input: string): string | undefined {
  // Try to extract venue name before common separators
  const parts = input.split(/[|:—,-]/);
  if (parts.length > 0) {
    const venueName = parts[0].trim();
    // Remove common suffixes
    return venueName
      .replace(/\s*(Hotel|Resort|Plaza|Center|Centre|Stadium|Arena|Hall|Building)$/i, '')
      .trim();
  }
  return undefined;
}

/**
 * Validate and extract address components
 */
export function validateAddress(input: string): ValidatedAddress {
  const cleaned = cleanAddressInput(input);
  
  // Extract structured components
  const streetMatch = cleaned.match(/(\d+\s+[\w\s]+(?:Street|St|Ave|Avenue|Road|Rd|Blvd|Boulevard|Lane|Ln|Drive|Dr|Way|Court|Ct|Place|Pl))/i);
  const cityMatch = cleaned.match(/(?:in|at|,)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  const stateMatch = cleaned.match(/\b([A-Z]{2})\b/);
  const zipMatch = cleaned.match(/\b(\d{5}(?:-\d{4})?)\b/);
  const countryMatch = cleaned.match(/\b(USA|United States|Jordan|Egypt|Canada|UK|United Kingdom|UAE|Australia|Germany|France|Italy|Spain|Japan|China)\b/i);
  
  const venueName = extractVenueName(cleaned);
  const street = streetMatch?.[1];
  const city = cityMatch?.[1];
  const state = stateMatch?.[1];
  const postalCode = zipMatch?.[1];
  const country = countryMatch?.[1];
  
  // Calculate confidence based on components found
  let confidence = 0;
  if (venueName) confidence += 0.2;
  if (street) confidence += 0.3;
  if (city) confidence += 0.2;
  if (state) confidence += 0.1;
  if (postalCode) confidence += 0.1;
  if (country) confidence += 0.1;
  
  // Validate that we have minimum required components
  const isValid = !!(street && city && country && VALID_COUNTRIES.includes(country));
  
  return {
    venueName,
    street,
    city,
    state,
    country,
    postalCode,
    isValid,
    confidence,
    rawInput: input
  };
}

/**
 * Validate numeric input against field rules
 */
export function validateNumericInput(
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

/**
 * Parse and validate numeric input from string
 */
export function parseNumericInput(
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

/**
 * Normalize permit answer
 */
export function normalizePermitAnswer(input: string): string | null {
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
  const validOptions = ['Client', 'ANC', 'Existing'];
  if (validOptions.includes(input)) {
    return input;
  }
  
  return null;
}

/**
 * Format address for confirmation display
 */
export function formatAddressForConfirmation(address: ValidatedAddress): string {
  if (!address.isValid) {
    return 'Invalid address. Please provide a complete address with street, city, and country.';
  }
  
  return `
**Please confirm the address:**
- Venue: ${address.venueName || 'N/A'}
- Street: ${address.street || 'N/A'}
- City: ${address.city || 'N/A'}
- State: ${address.state || 'N/A'}
- Country: ${address.country || 'N/A'}
- Postal Code: ${address.postalCode || 'N/A'}

Type "Confirmed" to proceed, or provide corrections.
  `.trim();
}