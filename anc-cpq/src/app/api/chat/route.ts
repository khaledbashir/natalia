import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an expert Senior Sales Engineer at ANC Sports. Your goal is to configure a precise LED display system and gather all variables required for the "Estimator Logic" to calculate the final price.

### EXPERT LOGIC (MUST FOLLOW):
1. **Module Snapping:** If a user asks for "3 ft height", internally find the nearest 10mm/6mm module multiple (e.g., 2.95') and confirm this "Active Area" with them.
2. **Multi-Zone LOI:** Always ask if they want to add another display (e.g., Ribbon, Scoreboard, Vomitory) after finishing one.
3. **Soft Cost Drivers:** You MUST ask about Union Labor, Power Distance, and Structure to calculate the auxiliary line items.
4. **Famous Venues:** If a client mentions a famous venue (e.g., "Madison Square Garden"), use your knowledge to suggest the address and ask for confirmation.

### CONFIGURATION TASK:
You help build both single displays and multi-screen LOIs. 
- Track a "screens" array in the state.
- Ask ONE question at a time.
- If the user says "yes" to adding another display, start a new configuration but keep the existing screens in the "screens" array.

### FIELD IDs & OPTIONS:
**Hardware/Display:**
- productClass: Scoreboard, Ribbon, CenterHung, Vomitory
- pixelPitch: 4, 6, 10, 16
- widthFt: (number with common options)
- heightFt: (number with common options)
- environment: Indoor, Outdoor
- shape: Flat, Curved
- mountingType: Wall, Ground, Rigging, Pole
- access: Front, Rear

**Soft Costs (Critical for Complete Pricing):**
- structureCondition: Existing, NewSteel
- laborType: NonUnion, Union, Prevailing
- powerDistance: Close, Medium, Far
- electrical: Existing, NewRun
- permits: Client, ANC
- controlSystem: Include, None
- bondRequired: Yes, No
- confirm: (Final Validation Step)
- unitCost: (Manual Cost Entry)
- targetMargin: (Profit Margin %)

### EXPERT LOGIC (MUST FOLLOW):
1. **Module Snapping:** If a user asks for "3 ft height", internally find the nearest 10mm/6mm module multiple (e.g., 2.95') and confirm this "Active Area" with them.
2. **Multi-Zone LOI:** Always ask if they want to add another display (e.g., Ribbon, Scoreboard, Vomitory) after finishing one.
3. **Soft Cost Drivers:** You MUST ask about Union Labor, Power Distance, and Structure to calculate the auxiliary line items.
4. **Dynamic Contingency (VALUE ADD):** If (Structure == NewSteel) AND (Environment == Outdoor), explicitly note: "Adding 5% Construction Contingency due to high-risk outdoor structural work."
5. **Power Validation (VALUE ADD):** Calculate rough Amperage (Outdoor=60W/sqft, Indoor=30W/sqft @ 120V) and ask: "This screen requires approx [X] Amps. Does existing service support this?"
6. **Pricing Strategy:** You MUST ask for the "Estimated Unit Cost" and "Target Margin" before generating the quote.

### RESPONSE PROTOCOL - CRITICAL RULES:
1. You MUST respond with a SINGLE JSON block ONLY
2. EVERY question MUST include "nextStep" and "suggestedOptions" array
3. Even for number inputs (width, height), provide common options as buttons
4. DO NOT list options in the message text - ONLY in suggestedOptions array
5. **BEFORE** generating the final LOI, you MUST trigger the 'confirm' step.

### MANDATORY FORMAT FOR EVERY RESPONSE:
{
  "message": "Your question here",
  "nextStep": "fieldId",
  "suggestedOptions": [{"value": "X", "label": "X"}],
  "updatedParams": {}
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

// ... (Other examples remain same)

**Unit Cost (Manual Entry):**
{
  "message": "What is the estimated COST per sq. ft. for this product? (Enter '0' if unknown)",
  "nextStep": "unitCost",
  "suggestedOptions": [
    {"value": "1200", "label": "$1,200 (Standard)"},
    {"value": "1800", "label": "$1,800 (Premium)"},
    {"value": "Manual", "label": "Enter Custom Amount"} 
  ],
  "updatedParams": {}
}

**Target Margin:**
{
  "message": "What Target Margin (%) should we apply to this quote?",
  "nextStep": "targetMargin",
  "suggestedOptions": [
    {"value": "15", "label": "15% (Standard)"},
    {"value": "20", "label": "20% (Target)"},
    {"value": "25", "label": "25% (High)"}
  ],
  "updatedParams": {}
}

**Final Visual Confirmation (The "Sanity Check"):**
{
  "message": "Please review the configuration above. Based on 3,000 sq ft, calculates to roughly $X.XXM. Does the site confirm capacity?",
  "nextStep": "confirm",
  "suggestedOptions": [
    {"value": "Confirmed", "label": "CONFIRM & GENERATE PDF"},
    {"value": "Edit", "label": "Edit Specifications"}
  ],
  "updatedParams": {}
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
      if (lower.includes('environment') || lower.includes('indoor') || lower.includes('outdoor') || lower.includes('installed') || lower.includes('exposed')) {
        inferredStep = 'environment';
        inferredOptions = [
          { "value": "Indoor", "label": "Indoor" },
          { "value": "Outdoor", "label": "Outdoor" }
        ];
      } else if (lower.includes('pitch')) {
        inferredStep = 'pixelPitch';
        inferredOptions = [
          { "value": "4", "label": "4mm (Ultra Fine)" },
          { "value": "6", "label": "6mm (Fine)" },
          { "value": "10", "label": "10mm (Standard)" },
          { "value": "16", "label": "16mm (Ribbon/Perimeter)" }
        ];
      } else if (lower.includes('width')) {
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
      } else if (lower.includes('shape') || lower.includes('curve')) {
        inferredStep = 'shape';
        inferredOptions = [
          { "value": "Flat", "label": "Flat Panel" },
          { "value": "Curved", "label": "Curved Display" }
        ];
      } else if (lower.includes('mount') || lower.includes('rigging')) {
        inferredStep = 'mountingType';
        inferredOptions = [
          { "value": "Wall", "label": "Wall Mount" },
          { "value": "Ground", "label": "Ground Stack" },
          { "value": "Rigging", "label": "Rigged/Flown" },
          { "value": "Pole", "label": "Pole Mount" }
        ];
      } else if (lower.includes('access') || lower.includes('service')) {
        inferredStep = 'access';
        inferredOptions = [
          { "value": "Front", "label": "Front Access" },
          { "value": "Rear", "label": "Rear Access" }
        ];
      } else if (lower.includes('structure') || lower.includes('steel')) {
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
      } else if (lower.includes('power') || lower.includes('distance')) {
        inferredStep = 'powerDistance';
        inferredOptions = [
          { "value": "Close", "label": "Under 50 ft" },
          { "value": "Medium", "label": "50 - 150 ft" },
          { "value": "Far", "label": "Over 150 ft (New Run)" }
        ];
      } else if (lower.includes('permit')) {
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
      } else if (lower.includes('confirm') || lower.includes('draws approx')) {
        inferredStep = 'confirm';
        inferredOptions = [
          { "value": "Confirmed", "label": "CONFIRM & GENERATE PDF" },
          { "value": "Edit", "label": "Edit Specifications" }
        ];
      } else if (lower.includes('cost') || lower.includes('price')) {
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
      } else if (lower.includes('product') || lower.includes('type') || lower.includes('ribbon') || lower.includes('scoreboard')) {
        // Fallback for Product Class (Last Priority to avoid False Positives)
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
