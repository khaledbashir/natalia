import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an expert Senior Sales Engineer at ANC Sports. Your goal is to configure a precise LED display system and gather all variables required for the "Estimator Logic" to calculate the final price.

### CONFIGURATION STRATEGY:
- **Fluid Extraction:** Your goal is to get to the Pricing as fast as possible. If a user provides multiple details (e.g., "Scoreboard for LSU in Baton Rouge"), extract ALL of them (clientName: LSU, address: Baton Rouge, productClass: Scoreboard) and move to the next MISSING detail.
- **Address Recognition:** When the user selects or types ANYTHING that looks like an address (contains street name, city, country, or recognizable location), IMMEDIATELY accept it as the address. Look for patterns like:
  - "123 Main St, City, State Zip"
  - "Sheraton Rd, Sharm El Sheikh"
  - "El Pasha Bay, Sharm el Sheikh, Egypt 46628"
  - Any text that includes street names, city names, or recognizable locations
- **Silence is Golden:** If you already have a value in the State, NEVER ask for it again.

### FIELD IDs:
**1. Identity:** clientName, address, projectName
**2. System:** productClass, pixelPitch, widthFt, heightFt, environment, shape, mountingType, access
**3. Costs:** structureCondition, laborType, powerDistance, electrical, permits, controlSystem, bondRequired, unitCost, targetMargin

### RESPONSE PROTOCOL (CRITICAL):
1. You MUST respond with a SINGLE JSON block ONLY.
2. IF nextStep is 'address' (waiting for user to select/type address):
   - You MUST set suggestedOptions to an EMPTY ARRAY [].
   - Do NOT provide product buttons (Scoreboard, Ribbon) yet.
   - Wait for the user to confirm the address first.
3. IF nextStep is ANY other question:
   - You MUST provide suggestedOptions (e.g., Scoreboard, Ribbon).
4. NEVER combine two steps. Finish 'address' completely before asking for 'productClass'.

### EXAMPLES:

**Intake (Venue Mentioned):**
User: "The Plaza in Sharm Al Shaukh"
{
  "message": "Got it, The Plaza. I've started the search for the specific address—please select the correct one below or type the street address.",
  "nextStep": "address",
  "suggestedOptions": [],
  "updatedParams": {
    "clientName": "The Plaza",
    "projectName": "The Plaza Install"
  }
}

**Address Selected (Accept Immediately):**
User: "Sheraton Rd, Sharm El Sheikh, Egypt"
{
  "message": "Address confirmed. What type of display are we building at this location?",
  "nextStep": "productClass",
  "suggestedOptions": [
    {"value": "Scoreboard", "label": "Scoreboard"},
    {"value": "Ribbon", "label": "Ribbon Board"},
    {"value": "CenterHung", "label": "Center Hung"},
    {"value": "Vomitory", "label": "Vomitory Display"}
  ],
  "updatedParams": {
    "address": "Sheraton Rd, Sharm El Sheikh, Egypt",
    "projectName": "The Plaza Install"
  }
}

**Direct Step (After Address Verified):**
User: "123 Main St, Baton Rouge"
{
  "message": "Street address confirmed. What type of display are we building at this location?",
  "nextStep": "productClass",
  "suggestedOptions": [
    {"value": "Scoreboard", "label": "Scoreboard"},
    {"value": "Ribbon", "label": "Ribbon Board"}
  ],
  "updatedParams": {
    "address": "123 Main St, Baton Rouge, LA"
  }
}


### EXAMPLES - YOU MUST FOLLOW THESE PATTERNS:

**Product Type (select):**
{
  "message": "What type of product are you looking for?",
  "nextStep": "productClass",
  "suggestedOptions": [
    {"value": "Scoreboard", "label": "Scoreboard"},
    {"value": "Ribbon", "label": "Ribbon Board"},
    {"value": "CenterHung", "label": "Center Hung"},
    {"value": "Vomitory", "label": "Vomitory Display"}
  ],
  "updatedParams": {}
}

**Pixel Pitch (select):**
{
  "message": "What is the required pixel pitch for the scoreboard?",
  "nextStep": "pixelPitch",
  "suggestedOptions": [
    {"value": "4", "label": "4mm (Ultra Fine)"},
    {"value": "6", "label": "6mm (Fine)"},
    {"value": "10", "label": "10mm (Standard)"},
    {"value": "16", "label": "16mm (Ribbon/Perimeter)"}
  ],
  "updatedParams": {}
}

**Width (number with common options):**
{
  "message": "What is the display width in feet?",
  "nextStep": "widthFt",
  "suggestedOptions": [
    {"value": "20", "label": "20 ft"},
    {"value": "40", "label": "40 ft"},
    {"value": "60", "label": "60 ft"},
    {"value": "100", "label": "100 ft"},
    {"value": "200", "label": "200 ft"}
  ],
  "updatedParams": {}
}

**Height (number with common options):**
{
  "message": "What is the display height in feet?",
  "nextStep": "heightFt",
  "suggestedOptions": [
    {"value": "3", "label": "3 ft"},
    {"value": "10", "label": "10 ft"},
    {"value": "20", "label": "20 ft"},
    {"value": "30", "label": "30 ft"},
    {"value": "40", "label": "40 ft"}
  ],
  "updatedParams": {}
}

**Environment (select):**
{
  "message": "Where will this display be installed?",
  "nextStep": "environment",
  "suggestedOptions": [
    {"value": "Indoor", "label": "Indoor"},
    {"value": "Outdoor", "label": "Outdoor"}
  ],
  "updatedParams": {}
}

**Shape (select):**
{
  "message": "What shape configuration do you need?",
  "nextStep": "shape",
  "suggestedOptions": [
    {"value": "Flat", "label": "Flat Panel"},
    {"value": "Curved", "label": "Curved Display"}
  ],
  "updatedParams": {}
}

**Mounting Type (select):**
{
  "message": "How will this display be mounted?",
  "nextStep": "mountingType",
  "suggestedOptions": [
    {"value": "Wall", "label": "Wall Mount"},
    {"value": "Ground", "label": "Ground Stack"},
    {"value": "Rigging", "label": "Rigged/Flown"},
    {"value": "Pole", "label": "Pole Mount"}
  ],
  "updatedParams": {}
}

**Access (select):**
{
  "message": "What type of service access does this display require?",
  "nextStep": "access",
  "suggestedOptions": [
    {"value": "Front", "label": "Front Access"},
    {"value": "Rear", "label": "Rear Access"}
  ],
  "updatedParams": {}
}

**Structure Condition (For "Structural Materials" Line Item):**
{
  "message": "Will we be mounting to existing usable steel, or is new primary steel required?",
  "nextStep": "structureCondition",
  "suggestedOptions": [
    {"value": "Existing", "label": "Existing Structure (Usable)"},
    {"value": "NewSteel", "label": "New Steel Required"}
  ],
  "updatedParams": {}
}

**Labor Type (For "Structural Labor" Line Item):**
{
  "message": "What are the labor requirements for this venue?",
  "nextStep": "laborType",
  "suggestedOptions": [
    {"value": "NonUnion", "label": "Non-Union (Standard)"},
    {"value": "Union", "label": "Union Labor Required"},
    {"value": "Prevailing", "label": "Prevailing Wage"}
  ],
  "updatedParams": {}
}

**Power/Data Distance (For "Electrical & Data" Line Item):**
{
  "message": "Approximate distance to the nearest power/data termination point?",
  "nextStep": "powerDistance",
  "suggestedOptions": [
    {"value": "Close", "label": "Under 50 ft"},
    {"value": "Medium", "label": "50 - 150 ft"},
    {"value": "Far", "label": "Over 150 ft (New Run)"}
  ],
  "updatedParams": {}
}

**Permits (select):**
{
  "message": "Who will handle the city/structural permits?",
  "nextStep": "permits",
  "suggestedOptions": [
    {"value": "Client", "label": "Client Handles Permits"},
    {"value": "ANC", "label": "ANC Handles Permits"}
  ],
  "updatedParams": {}
}

**Control System (select):**
{
  "message": "Do you need a new control system (processors/sending boxes) included?",
  "nextStep": "controlSystem",
  "suggestedOptions": [
    {"value": "Include", "label": "Yes, Include Controls"},
    {"value": "None", "label": "No, Use Existing"}
  ],
  "updatedParams": {}
}

**Performance Bond (Hidden Cost in Excel):**
{
  "message": "Is a Payment or Performance Bond required for this project?",
  "nextStep": "bondRequired",
  "suggestedOptions": [
    {"value": "No", "label": "No"},
    {"value": "Yes", "label": "Yes (Add ~1.5%)"}
  ],
  "updatedParams": {}
}

CRITICAL: If you ask a question WITHOUT suggestedOptions, the user will see NO BUTTONS and have a terrible experience. ALWAYS include suggestedOptions.`;

function inferStepFromMessage(message: string): string | null {
  if (!message) return null;
  
  // CRITICAL: Only analyze the QUESTION part, not the acknowledgment
  // Split on "." or "?" to isolate the actual question
  const parts = message.split(/[.!]\s*/);
  const questionPart = parts.find(p => p.includes('?')) || parts[parts.length - 1] || message;
  const lower = questionPart.toLowerCase();

  // 1. Check for Confirmation/Finalizing
  if ((lower.includes('confirm') && lower.includes('configuration')) || lower.includes('draws approx')) {
    return 'confirm';
  }

  // 2. Check for Specific Questions (High Priority)
  // Product Type
  if (lower.includes('type of display') || lower.includes('what product') || lower.includes('type of product')) return 'productClass';

  // Dimensions
  if (lower.includes('width') || lower.includes('how wide')) return 'widthFt';
  if (lower.includes('height') || lower.includes('how high') || lower.includes('how tall')) return 'heightFt';

  // Pixel Pitch
  if (lower.includes('pixel') || lower.includes('pitch')) return 'pixelPitch';

  // Shape (Check BEFORE environment to prevent "outdoor" in acknowledgment overriding "shape" question)
  if (lower.includes('shape') || lower.includes('configuration')) return 'shape';

  // Environment (Only if the question is explicitly about indoor/outdoor)
  if (lower.includes('installed') || lower.includes('indoor or outdoor') || lower.includes('environment')) return 'environment';

  // Mounting
  if (lower.includes('mount') || lower.includes('rigged') || lower.includes('flown')) return 'mountingType';

  // Access
  if (lower.includes('access') || lower.includes('service') || lower.includes('technician')) return 'access';

  // Structure
  if (lower.includes('steel') || lower.includes('structural')) return 'structureCondition';

  // Labor
  if (lower.includes('union') || lower.includes('labor') || lower.includes('prevailing')) return 'laborType';

  // Power Distance
  if (lower.includes('power') || lower.includes('termination') || lower.includes('distance')) return 'powerDistance';

  // Permits
  if (lower.includes('permit')) return 'permits';

  // Control System
  if (lower.includes('control') || lower.includes('processor')) return 'controlSystem';

  // Bond
  if (lower.includes('bond')) return 'bondRequired';

  // Address (Lowest Priority - only if explicitly asking)
  if (lower.includes('select the correct one') || lower.includes('enter the address') || (lower.includes('address') && lower.includes('?'))) return 'address';

  return null;
}

function extractJSON(text: string) {
  try {
    // 1. Try to find the EXACT JSON block first (greedy match)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const potentialJson = jsonMatch[0];
      try {
        return JSON.parse(potentialJson);
      } catch (e) {
        // 2. If parsing failed, try it again with more cleanup
        const cleaned = potentialJson.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
        try {
          return JSON.parse(cleaned);
        } catch (e2) {
          console.error("JSON Parse Error:", e2);
        }
      }
    }

    // 3. Last ditch: If text is just a string, return a fallback message
    // BUT try to infer the next step from the text content to keep the UI interactive
    if (text && !text.includes('{')) {
      const lower = text.toLowerCase();
      let inferredStep = null;
      let inferredOptions = null;

      // Smart Inference Logic for "dumb" models
      // NOTE: Order matters greatly here to avoid false positives. 
      // Specific phrases should be checked before generic ones.
      
      // CONFIRMATION (Very specific)
      // Avoid matching "Address confirmed" or "Specs confirmed"
      if ((lower.includes('confirm') && lower.includes('configuration')) || lower.includes('draws approx')) {
        inferredStep = 'confirm';
        inferredOptions = [
          { "value": "Confirmed", "label": "CONFIRM & GENERATE PDF" },
          { "value": "Edit", "label": "Edit Specifications" }
        ];
      }
      // ADDRESS (Specific)
      // "Address Confirmed" should NOT trigger address mode (which hides buttons)
      else if ((lower.includes('address') && !lower.includes('confirm')) || lower.includes('street') || lower.includes('select the correct one')) {
        inferredStep = 'address';
        inferredOptions = [];
      } 
      // STRUCTURE & LABOR (Specific)
      else if (lower.includes('structure') || lower.includes('steel')) {
        inferredStep = 'structureCondition';
        inferredOptions = [
          { "value": "Existing", "label": "Existing Structure (Usable)" },
          { "value": "NewSteel", "label": "New Steel Required" }
        ];
      } else if (lower.includes('labor') || lower.includes('union')) {
        inferredStep = 'laborType';
        inferredOptions = [
          { "value": "NonUnion", "label": "Non-Union (Standard)" },
          { "value": "Union", "label": "Union Labor Required" },
          { "value": "Prevailing", "label": "Prevailing Wage" }
        ];
      } 
      // SPECS (Width/Height/Pitch)
      else if (lower.includes('width')) {
        inferredStep = 'widthFt';
        inferredOptions = [
          { "value": "20", "label": "20 ft" },
          { "value": "40", "label": "40 ft" },
          { "value": "60", "label": "60 ft" },
          { "value": "100", "label": "100 ft" },
          { "value": "200", "label": "200 ft" }
        ];
      } else if (lower.includes('height')) {
        inferredStep = 'heightFt';
        inferredOptions = [
          { "value": "3", "label": "3 ft" },
          { "value": "10", "label": "10 ft" },
          { "value": "20", "label": "20 ft" },
          { "value": "30", "label": "30 ft" },
          { "value": "40", "label": "40 ft" }
        ];
      } else if (lower.includes('pitch')) {
        inferredStep = 'pixelPitch';
        inferredOptions = [
          { "value": "4", "label": "4mm (Ultra Fine)" },
          { "value": "6", "label": "6mm (Fine)" },
          { "value": "10", "label": "10mm (Standard)" },
          { "value": "16", "label": "16mm (Ribbon/Perimeter)" }
        ];
      } 
      // ENVIRONMENT & SHAPE
      else if (lower.includes('environment') || lower.includes('indoor') || lower.includes('outdoor')) {
        inferredStep = 'environment';
        inferredOptions = [
          { "value": "Indoor", "label": "Indoor" },
          { "value": "Outdoor", "label": "Outdoor" }
        ];
      } else if (lower.includes('shape') || lower.includes('curve')) {
        inferredStep = 'shape';
        inferredOptions = [
          { "value": "Flat", "label": "Flat Panel" },
          { "value": "Curved", "label": "Curved Display" }
        ];
      }
      // ACCESS & MOUNTING (Specific terms)
      else if (lower.includes('access') || lower.includes('service')) {
        inferredStep = 'access';
        inferredOptions = [
          { "value": "Front", "label": "Front Access" },
          { "value": "Rear", "label": "Rear Access" }
        ];
      } else if (lower.includes('mounting') || lower.includes('rigged') || lower.includes('flown') || lower.includes('pole mount')) {
        inferredStep = 'mountingType'; // 'mount' is too generic, used 'mounting'
        inferredOptions = [
          { "value": "Wall", "label": "Wall Mount" },
          { "value": "Ground", "label": "Ground Stack" },
          { "value": "Rigging", "label": "Rigged/Flown" },
          { "value": "Pole", "label": "Pole Mount" }
        ];
      }
      // COSTING (Permits, Bond, Control, Price)
      else if (lower.includes('permit')) {
        inferredStep = 'permits';
        inferredOptions = [
          { "value": "Client", "label": "Client Handles Permits" },
          { "value": "ANC", "label": "ANC Handles Permits" }
        ];
      } else if (lower.includes('control')) {
        inferredStep = 'controlSystem';
        inferredOptions = [
          { "value": "Include", "label": "Yes, Include Controls" },
          { "value": "None", "label": "No, Use Existing" }
        ];
      } else if (lower.includes('bond')) {
        inferredStep = 'bondRequired';
        inferredOptions = [
          { "value": "No", "label": "No" },
          { "value": "Yes", "label": "Yes (Add ~1.5%)" }
        ];
      } else if (lower.includes('cost') || lower.includes('price') || lower.includes('unit cost')) {
        inferredStep = 'unitCost';
        inferredOptions = [
          { "value": "1200", "label": "$1,200 (Standard)" },
          { "value": "1800", "label": "$1,800 (Premium)" },
          { "value": "Manual", "label": "Enter Custom Amount" }
        ];
      } else if (lower.includes('margin') || lower.includes('profit')) {
        inferredStep = 'targetMargin';
        inferredOptions = [
          { "value": "15", "label": "15% (Standard)" },
          { "value": "20", "label": "20% (Target)" },
          { "value": "25", "label": "25% (High)" }
        ];
      } 
      // PRODUCT CLASS (Last Resort - Generic Terms)
      else if (lower.includes('product') || lower.includes('type') || lower.includes('ribbon') || lower.includes('scoreboard')) {
        inferredStep = 'productClass';
        inferredOptions = [
          { "value": "Scoreboard", "label": "Scoreboard" },
          { "value": "Ribbon", "label": "Ribbon Board" },
          { "value": "CenterHung", "label": "Center Hung" },
          { "value": "Vomitory", "label": "Vomitory Display" }
        ];
      }

      return {
        message: text.trim(),
        updatedParams: {},
        nextStep: inferredStep,
        suggestedOptions: inferredOptions // Dynamically inject options if missing
      };
    }

    return null;
  } catch (e) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, history, currentState, selectedModel = 'glm-4.7' } = await request.json();

    // Import model configurations
    const { AI_MODELS, NVIDIA_CONFIG } = await import('../../../lib/ai-models');

    // Determine which model config to use
    let modelConfig = AI_MODELS[selectedModel];
    let isNvidiaModel = false;

    if (!modelConfig) {
      // Check if it's an NVIDIA model
      isNvidiaModel = true;
      modelConfig = {
        id: selectedModel,
        name: selectedModel,
        provider: 'nvidia' as const,
        endpoint: NVIDIA_CONFIG.endpoint,
        apiKey: NVIDIA_CONFIG.apiKey,
        supportsThinking: false
      };
    }

    const contextMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map((h: any) => ({
        role: h.role,
        content: h.content,
        ...(h.thinking && modelConfig.supportsThinking && { reasoning_content: h.thinking })
      })),
      {
        role: 'user',
        content: `Input: "${message}"\nState: ${JSON.stringify(currentState)}`
      }
    ];

    // Build request body based on provider
    const requestBody: any = {
      model: modelConfig.id,
      messages: contextMessages,
      temperature: 0.1
    };

    // Add thinking support for ZhipuAI
    if (modelConfig.supportsThinking) {
      requestBody.thinking = { type: "enabled", clear_thinking: false };
    }

    const response = await fetch(modelConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${modelConfig.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) throw new Error(await response.text());

    const data = await response.json();
    const choice = data.choices?.[0];
    const thinking = choice?.message?.reasoning_content || "Thinking...";
    let rawContent = choice?.message?.content || "{}";

    // Clean markdown if present
    rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = extractJSON(rawContent);

    if (parsed) {
      // HARD GUARDRAIL: Override suggestedOptions with authoritative source
      if (parsed.nextStep || parsed.message) {
        try {
          // A. Infer if AI is jumping the gun on address
          // Run the smarter inference logic to validate/correct the step
          const inferredStep = inferStepFromMessage(parsed.message);
          
          if (inferredStep && inferredStep !== parsed.nextStep) {
              console.log(`Step Correction: AI said '${parsed.nextStep}' but message implies '${inferredStep}'. Overriding.`);
              parsed.nextStep = inferredStep;
          }

          // Legacy Guardrails (Keep as fallback)
          const msgLower = (parsed.message || "").toLowerCase();
          const matchesAddressKeywords = msgLower.includes('address') ||
            msgLower.includes('select the correct one') ||
            msgLower.includes('search') ||
            msgLower.includes('street');
            
          const isConfirmation = msgLower.includes('found') || 
                                 msgLower.includes('confirmed') || 
                                 msgLower.includes('verified') ||
                                 msgLower.includes('got it');

          const isAskingForAddress = matchesAddressKeywords && !isConfirmation;

          // Only force address if we didn't already infer a better step (like productClass)
          if (isAskingForAddress && parsed.nextStep !== 'address' && !inferredStep) {
            console.log("Guardrail: Forcing nextStep to address based on message context.");
            parsed.nextStep = 'address';
          }

          const { WIZARD_QUESTIONS } = await import('../../../lib/wizard-questions');
          const questionDef = WIZARD_QUESTIONS.find(q => q.id === parsed.nextStep);
          if (questionDef && questionDef.options) {
            parsed.suggestedOptions = questionDef.options;
          } else if (parsed.nextStep === 'clientName' || parsed.nextStep === 'address') {
            parsed.suggestedOptions = [];
          }
        } catch (e) {
          console.error("Guardrail import error:", e);
        }
      }
      return NextResponse.json({ ...parsed, thinking });
    } else {
      const cleanMessage = rawContent.replace(/\{[\s\S]*\}/g, '').trim();
      return NextResponse.json({
        message: cleanMessage || "I'm having trouble processing that, but I'm still here to help!",
        updatedParams: {},
        nextStep: null,
        thinking
      });
    }

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
