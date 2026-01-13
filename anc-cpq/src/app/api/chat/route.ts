import { NextRequest, NextResponse } from "next/server";
import {
    classifyUserMessage,
    validateAddress,
    formatAddressForConfirmation,
    validateNumericInput,
    parseNumericInput,
    normalizePermitAnswer,
    MessageType
} from "../../../lib/input-validator";
import {
    processUserMessage,
    getCurrentStep,
    getNextIncompleteStep,
    isSessionComplete,
    getSessionProgress,
    STEPS
} from "../../../lib/state-machine";
import {
    calculatePrice,
    shouldRecalculatePrice,
    invalidatePriceCache
} from "../../../lib/pricing-service";

function getFriendlyFieldLabel(fieldId: string): string {
    const labels: Record<string, string> = {
        clientName: "Venue name",
        address: "Venue address",
        projectName: "Project name",
        productClass: "Display type",
        pixelPitch: "Pixel pitch",
        widthFt: "Display width",
        heightFt: "Display height",
        environment: "Environment",
        shape: "Shape",
        mountingType: "Mounting",
        access: "Service access",
        structureCondition: "Structure condition",
        laborType: "Labor",
        powerDistance: "Power/data distance",
        permits: "Permits",
        controlSystem: "Control system",
        bondRequired: "Bond",
        complexity: "Complexity",
        unitCost: "Unit cost",
        targetMargin: "Target margin",
        serviceLevel: "Service level",
    };
    return labels[fieldId] || fieldId;
}

function sanitizeAssistantMessage(message: string): string {
    if (!message) return message;

    let sanitized = message;

    // Replace common "Field 'x' locked to y" patterns with user-friendly confirmations
    sanitized = sanitized.replace(
        /Field\s+'([^']+)'\s+locked\s+to\s+([^\.\n]+)\.?/gi,
        (_m, fieldId, value) => `${getFriendlyFieldLabel(String(fieldId))} set to ${String(value).trim()}.`,
    );

    // Remove overly-robotic "proceeding" lines
    sanitized = sanitized.replace(/\s*Proceeding\s+to\s+'[^']+'\.?/gi, "");
    sanitized = sanitized.replace(/\s*Awaiting\s+input\s+for\s+'[^']+'\.?/gi, "");

    return sanitized.trim();
}

function looksLikeInternalAnalysisText(text: string): boolean {
    const t = (text || "").toLowerCase();
    return (
        t.includes("analysis of input") ||
        t.includes("analysis of input and state") ||
        t.includes("input analysis") ||
        t.includes("state analysis") ||
        t.includes("estimator reasoning") ||
        t.includes("current state") ||
        t.includes("updatedparams") ||
        t.includes("nextstep")
    );
}

function truncateText(text: string, maxChars: number): string {
    const trimmed = (text || "").trim();
    if (trimmed.length <= maxChars) return trimmed;
    return `${trimmed.slice(0, maxChars).trim()}\n\n[truncated ${trimmed.length - maxChars} chars]`;
}

function titleCaseLoose(input: string): string {
    const s = (input || "").trim();
    if (!s) return s;
    // Keep original casing if it looks intentionally cased (acronyms, camel case, etc.)
    if (/[A-Z]{2,}/.test(s) || /[a-z][A-Z]/.test(s)) return s;
    return s
        .toLowerCase()
        .split(/\s+/)
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
        .join(" ");
}

function extractThinkTagBlock(text: string): { thinking?: string; content: string } {
    if (!text) return { content: text };
    const match = text.match(/<think>([\s\S]*?)<\/think>/i);
    if (!match) return { content: text };
    const thinking = match[1]?.trim();
    const content = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    return { thinking, content };
}

function splitAnalysisPrefix(raw: string): { thinking?: string; content: string } {
    const text = (raw || "").trim();
    if (!text) return { content: text };

    const firstBrace = text.indexOf("{");
    if (firstBrace <= 0) {
        // No JSON prefix separation possible.
        return { content: text };
    }

    const prefix = text.slice(0, firstBrace).trim();
    const rest = text.slice(firstBrace).trim();

    // If the prefix looks like verbose analysis, move it into thinking.
    if (/\b(analysis|reasoning|state analysis|input analysis)\b/i.test(prefix)) {
        return { thinking: prefix, content: rest };
    }

    return { content: text };
}

function buildEstimatorThinking(params: {
    input: string;
    messageType: string;
    currentState: any;
    updatedParams?: Record<string, any>;
    nextStep?: string | null;
    rejectedFields?: string[];
    notes?: string[];
    rawModelExcerpt?: string;
}): string {
    const notes = (params.notes || []).filter(Boolean);
    const rejected = (params.rejectedFields || []).filter(Boolean);
    const updated = params.updatedParams || {};

    const statePreview = truncateText(JSON.stringify(params.currentState || {}, null, 2), 1200);
    const updatedPreview = truncateText(JSON.stringify(updated, null, 2), 800);
    const rawExcerpt = params.rawModelExcerpt
        ? truncateText(params.rawModelExcerpt, 800)
        : "";

    return [
        "**Estimator Reasoning (Debug)**",
        "",
        `1. **Input:** ${truncateText(params.input, 200)}`,
        `2. **MessageType:** ${params.messageType}`,
        `3. **Next Step:** ${params.nextStep ?? "(none)"}`,
        "",
        "**State Snapshot**",
        statePreview,
        "",
        "**Proposed Updates**",
        updatedPreview,
        rejected.length ? "\n**Rejected Fields**\n" + rejected.map((f) => `- ${f}`).join("\n") : "",
        notes.length ? "\n**Notes**\n" + notes.map((n) => `- ${n}`).join("\n") : "",
        rawExcerpt ? "\n**Raw Model Excerpt**\n" + rawExcerpt : "",
    ]
        .filter((line) => line !== "")
        .join("\n");
}

function isLikelyStreetAddress(address: unknown): boolean {
    if (typeof address !== "string") return false;
    const trimmed = address.trim();
    if (!trimmed) return false;

    // Check for multiple components (comma separated) - standard for international addresses
    const parts = trimmed.split(',').map(p => p.trim());
    if (parts.length >= 3) return true;

    // Look for street number + street name pattern or common tokens
    const hasNumber = /\d+/.test(trimmed);
    const hasStreetType =
        /\b(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|way|court|ct|place|pl|parkway|pkwy|plaza|coast|governorate|district|highway|hwy|sq|square|circle|cir|al|alley|province)\b/i.test(
            trimmed,
        );

    return (parts.length >= 2 && (hasNumber || hasStreetType)) || (trimmed.length > 25);
}

async function computeNextStepFromState(state: any): Promise<string> {
    const { WIZARD_QUESTIONS } = await import("../../../lib/wizard-questions");

    for (const q of WIZARD_QUESTIONS) {
        const value = state?.[q.id];

        // Optional questions should never block completion.
        if (q.required === false) {
            continue;
        }

        // Treat address as incomplete unless it looks like a true street address.
        if (q.id === "address") {
            if (!isLikelyStreetAddress(value)) return "address";
            continue;
        }

        // 0 is a valid value for numeric fields (do not treat it as missing).
        if (value === undefined || value === null || value === "") {
            return q.id;
        }
    }

    return "confirm";
}

const SYSTEM_PROMPT = `You are the ANC Project Assistant, an internal SPEC AUDIT tool. Your job is to fill exactly 20 fields for the Engineering Estimator.

### INTERNAL PERSONA (STRICT):
- Speak professionally and concisely (e.g., "Client confirmed. Proceeding to next specification.")
- Do NOT use fluff. No "How can I help you?". No "Great choice!".
- DO NOT use technical field names in your responses. Use user-friendly language instead.
- When confirming a field, use natural language: "Client name set to Madison Square." NOT "Field 'clientName' locked to Madison Square."

### SPEC AUDIT LOGIC (CRITICAL):

**BULK EXTRACTION MODE (AGGRESSIVE):**
- When the user provides a long message containing answers to multiple questions, you MUST extract ALL recognizable values AT ONCE.
- Scan the message for ANY field values mentioned (use the cheat sheet below).
- Add them ALL to 'updatedParams'.
- Then set 'nextStep' to the FIRST EMPTY/MISSING field after merging with currentState.
- Examples:
  - User: "I need a 10mm ribbon board, 40ft wide, outdoor use, wall mounted, front access, existing structure, standard complexity, bronze service, client is MSG at 4 Pennsylvania Plaza"
  - updatedParams: { "clientName": "MSG", "address": "4 Pennsylvania Plaza", "productClass": "Ribbon", "pixelPitch": "10", "widthFt": 40, "environment": "Outdoor", "mountingType": "Wall", "access": "Front", "structureCondition": "Existing", "complexity": "Standard", "serviceLevel": "bronze" }
  - nextStep: "heightFt" (first missing field after those)
  - User: "Outdoor scoreboard 50x25, 6mm, curved, rear access, union labor, close power, client handles permits, no controls, no bond"
  - updatedParams: { "productClass": "Scoreboard", "widthFt": 50, "heightFt": 25, "pixelPitch": "6", "environment": "Outdoor", "shape": "Curved", "access": "Rear", "laborType": "Union", "powerDistance": "Close", "permits": "Client", "controlSystem": "None", "bondRequired": false }
  - nextStep: "mountingType" (first missing field after those)
- If the user's message contains answers to MANY questions (e.g., 10+ fields), extract ALL and jump directly to "confirm" or the first missing.

**STATE AWARENESS:**
- Check 'currentState' to see what's already filled.
- DO NOT ask about fields that already have values.
- ALWAYS skip to the FIRST empty/missing field.

**CONFIRM AREA LOGIC:**
- If user confirms an address selection, set both 'clientName' AND 'address' and MOVE TO THE NEXT STEP (e.g., 'productClass').
- NEVER ask for 'address' again after a valid confirmation.

**NEXT LOGIC:**
- Always point 'nextStep' to the FIRST null or empty field in the sequence AFTER your bulk extractions.

### THE ONLY 20 VALID FIELDS (IN ORDER):
1. clientName
2. address
3. productClass (Scoreboard, Ribbon, CenterHung, Vomitory)
4. pixelPitch (4, 6, 10, 16)
5. widthFt (number)
6. heightFt (number)
7. environment (Indoor, Outdoor)
8. shape (Flat, Curved)
9. mountingType (Wall, Ground, Rigging, Pole)
10. access (Front, Rear)
11. structureCondition (Existing, NewSteel)
12. laborType (NonUnion, Union, Prevailing)
13. powerDistance (Close, Medium, Far)
14. permits (Client, ANC)
15. controlSystem (Include, None)
16. bondRequired (Yes, No)
17. complexity (Standard, High)
18. unitCost (number, optional)
19. targetMargin (number, optional)
20. serviceLevel (bronze, silver, gold)

**(projectName is automatically synced to clientName, do NOT ask for it)**

### FIELD RECOGNITION CHEAT SHEET:
- "mm", "pitch", "pixel" → pixelPitch
- "wide", "width", "ft wide" → widthFt
- "high", "height", "tall", "ft high" → heightFt
- "indoor", "outdoor" → environment
- "wall", "ground", "rig", "rigging", "flown", "pole" → mountingType
- "front access", "rear access", "service front", "service rear" → access
- "existing", "new steel", "new structure" → structureCondition
- "union", "non-union", "nonunion", "prevailing", "prevailing wage" → laborType
- "power", "distance", "termination" → powerDistance
- "permit" → permits
- "control", "processor", "sending box" → controlSystem
- "bond", "performance bond", "payment bond" → bondRequired
- "curved", "radius" → shape = Curved
- "flat", "standard" → shape = Flat

### CRITICAL WARNING:
- DO NOT invent fields that are not in this list.
- There is NO 'depth', 'depthFt', 'resolution', 'brightness', or any other field.
- If user mentions something not in the list, ignore it and proceed to the next valid field.

### RESPONSE FORMAT (MANDATORY):
- ONLY JSON.
- { "message": "Feedback string", "nextStep": "fieldId", "suggestedOptions": [], "updatedParams": {} }
- **updatedParams MUST contain the field value the user just provided!** Never leave it empty if user gave a valid answer.
- suggestedOptions is MANDATORY for selects and numbers.
- 'nextStep' MUST be one of the 21 valid field IDs above.

### EXAMPLES:

**Example 1: Single value**
User: "Ribbon"
CurrentState: {"clientName": "MSG", "address": "NYC", "projectName": "Install", "productClass": ""}
Response: {"message": "Display type set to Ribbon. What pixel pitch do you need?", "nextStep": "pixelPitch", "suggestedOptions": [{"value": "6", "label": "6mm"}, {"value": "10", "label": "10mm"}], "updatedParams": {"productClass": "Ribbon"}}

**Example 2: BULK EXTRACTION (Skip to first missing question)**
User: "I need a scoreboard for MSG, 10mm pitch, 80ft wide by 25ft high, outdoor installation, wall mounted with rear access, existing structure, non-union labor"
CurrentState: {}
Response: {
  "message": "Got it. I've captured: Scoreboard, 10mm, 80x25ft, outdoor, wall mount, rear access, existing structure, non-union. What's address?",
  "nextStep": "address",
  "suggestedOptions": [],
  "updatedParams": {
    "clientName": "MSG",
    "productClass": "Scoreboard",
    "pixelPitch": 10,
    "widthFt": 80,
    "heightFt": 25,
    "environment": "Outdoor",
    "mountingType": "Wall",
    "access": "Rear",
    "structureCondition": "Existing",
    "laborType": "NonUnion"
  }
}

**Example 3: ALL 20 ANSWERS (Jump directly to confirm)**
User: "Madison Square Garden, 4 Pennsylvania Plaza New York NY 10001, Scoreboard, 10mm, 80ft wide, 25ft high, Outdoor, Curved, Wall mount, Front access, Existing structure, Union labor, Medium distance, ANC handles permits, Include controls, Yes bond, High complexity, $1500/sqft, 25% margin, Bronze service"
CurrentState: {}
Response: {
  "message": "I've captured all 20 specifications. Please confirm to generate your proposal.",
  "nextStep": "confirm",
  "suggestedOptions": [
    {"value": "Confirmed", "label": "CONFIRM & GENERATE PDF"},
    {"value": "Edit", "label": "Edit Specifications"}
  ],
  "updatedParams": {
    "clientName": "Madison Square Garden",
    "address": "4 Pennsylvania Plaza New York NY 10001",
    "productClass": "Scoreboard",
    "pixelPitch": 10,
    "widthFt": 80,
    "heightFt": 25,
    "environment": "Outdoor",
    "shape": "Curved",
    "mountingType": "Wall",
    "access": "Front",
    "structureCondition": "Existing",
    "laborType": "Union",
    "powerDistance": "Medium",
    "permits": "ANC",
    "controlSystem": "Include",
    "bondRequired": "Yes",
    "complexity": "High",
    "unitCost": 1500,
    "targetMargin": 25,
    "serviceLevel": "bronze"
  }
}
`;

/**
 * UNIFIED step inference - single source of truth
 * Analyzes AI message to determine what step it's asking about
 * Returns null if it can't determine (falls back to state-based computation)
 */
function inferStepFromMessage(message: string): string | null {
    if (!message) return null;

    const lower = message.toLowerCase();

    // 1. Check for Confirmation/Finalizing (highest priority)
    if (
        (lower.includes("confirm") && lower.includes("configuration")) ||
        lower.includes("draws approx") ||
        (lower.includes("all required") && lower.includes("confirm")) ||
        lower.includes("ready to generate")
    ) {
        return "confirm";
    }

    // 2. Check for Starting
    if (lower.includes("proceed") || lower.includes("shall we proceed") || lower.includes("let's start")) {
        return "clientName";
    }

    // 3. Address detection
    const isAskingForAddress =
        (lower.includes("select the correct one") ||
            (lower.includes("address") && (lower.includes("?") || lower.includes("where is")))) &&
        !lower.includes("confirmed") &&
        !lower.includes("verified") &&
        !lower.includes("got it");
    if (isAskingForAddress) return "address";

    // 4. Field-specific detection (ordered to avoid false positives)
    // We only infer if the message EXPLICITLY asks the question
    // EXPANDED patterns to catch more variations the AI might use
    const fieldPatterns = [
        { step: "clientName", patterns: ["venue name", "client name", "what's the venue", "what is the venue", "client's name"], exclude: ["set to", "confirmed", "captured"] },
        { step: "productClass", patterns: ["type of display", "what type of display", "kind of display", "display type", "what display"], exclude: ["locked", "set to", "confirmed", "capturing", "captured", "width", "height", "pitch"] },
        { step: "pixelPitch", patterns: ["pixel pitch", "what pitch", "pitch do you need", "what mm", "how fine"], exclude: ["locked", "set to", "confirmed", "capturing", "captured"] },
        { step: "widthFt", patterns: ["width in feet", "how wide", "display width", "what's the width", "what is the width"], exclude: ["locked", "set to", "confirmed", "capturing", "captured", "height"] },
        { step: "heightFt", patterns: ["height in feet", "how high", "how tall", "display height", "what's the height", "what is the height"], exclude: ["locked", "set to", "confirmed", "capturing", "captured", "width"] },
        { step: "environment", patterns: ["indoor or outdoor", "indoor/outdoor", "environment", "indoor outdoor", "inside or outside"], exclude: ["locked", "set to", "confirmed", "capturing", "captured"] },
        { step: "shape", patterns: ["shape", "curved or flat", "flat or curved", "flat curved", "curved flat"], exclude: ["locked", "set to", "confirmed", "capturing", "captured"] },
        { step: "mountingType", patterns: ["mounting type", "how will it be mounted", "rigged or flown", "wall or ground", "how is it mounted", "mounting method"], exclude: ["locked", "set to", "confirmed", "capturing", "captured"] },
        { step: "access", patterns: ["front or rear access", "service access", "front rear", "access type", "serviceable from"], exclude: ["locked", "set to", "confirmed", "capturing", "captured"] },
        { step: "structureCondition", patterns: ["existing structure", "new steel", "mounting to existing", "structure condition", "existing or new"], exclude: ["locked", "set to", "confirmed", "capturing", "captured"] },
        { step: "laborType", patterns: ["labor requirements", "union labor", "labor type", "union or non", "prevailing wage"], exclude: ["locked", "set to", "confirmed", "capturing", "captured"] },
        { step: "powerDistance", patterns: ["distance to power", "power/data termination", "power distance", "how far is power", "power termination"], exclude: ["locked", "set to", "confirmed", "capturing", "captured"] },
        { step: "permits", patterns: ["permits", "handle the city", "who handles permit", "permit responsibility"], exclude: ["locked", "set to", "confirmed", "capturing", "captured"] },
        { step: "controlSystem", patterns: ["control system", "processors", "include control", "need control", "control processor"], exclude: ["locked", "set to", "confirmed", "capturing", "captured"] },
        { step: "bondRequired", patterns: ["performance bond", "bond required", "require a bond", "bonding requirement"], exclude: ["locked", "set to", "confirmed", "capturing", "captured"] },
        { step: "complexity", patterns: ["install complexity", "complexity level", "standard or high", "high complexity"], exclude: ["locked", "set to", "confirmed", "capturing", "captured"] },
        { step: "unitCost", patterns: ["unit cost", "cost per square", "price per sqft", "cost per sqft"], exclude: ["locked", "set to", "confirmed", "capturing", "captured"] },
        { step: "targetMargin", patterns: ["target margin", "profit margin", "margin percentage", "what margin"], exclude: ["locked", "set to", "confirmed", "capturing", "captured"] },
        { step: "serviceLevel", patterns: ["service level", "ongoing maintenance", "bronze silver gold", "service tier"], exclude: ["locked", "set to", "confirmed", "capturing", "captured"] },
    ];

    for (const { step, patterns, exclude } of fieldPatterns) {
        const matchesPattern = patterns.some(p => lower.includes(p));
        const hasExclusion = exclude.some(e => lower.includes(e));

        if (matchesPattern && !hasExclusion) {
            return step;
        }
    }

    return null;
}

/**
 * Extract JSON from AI response, with fallback inference for non-JSON responses
 */
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
                const cleaned = potentialJson.replace(
                    /[\u0000-\u001F\u007F-\u009F]/g,
                    "",
                );
                try {
                    return JSON.parse(cleaned);
                } catch (e2) {
                    console.error("JSON Parse Error:", e2);
                }
            }
        }

        // 3. Last ditch: If text is just a string, return a fallback message.
        // IMPORTANT: if it looks like internal analysis/reasoning, do NOT surface it.
        if (text && !text.includes("{")) {
            if (/\b(analysis|reasoning|state analysis|input analysis)\b/i.test(text)) {
                return null;
            }
            const inferredStep = inferStepFromMessage(text);

            return {
                message: text.trim(),
                updatedParams: {},
                nextStep: inferredStep,
                suggestedOptions: undefined, // Will be populated from WIZARD_QUESTIONS
            };
        }

        return null;
    } catch (e) {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const {
            message,
            history,
            currentState,
            selectedModel = "glm-4.7",
        } = await request.json();

        // Import model configurations
        const { AI_MODELS, NVIDIA_CONFIG } =
            await import("../../../lib/ai-models");

        // Determine which model config to use
        let modelConfig = AI_MODELS[selectedModel];
        let isNvidiaModel = false;

        if (!modelConfig) {
            // Check if it's an NVIDIA model
            isNvidiaModel = true;
            modelConfig = {
                id: selectedModel,
                name: selectedModel,
                provider: "nvidia" as const,
                endpoint: NVIDIA_CONFIG.endpoint,
                apiKey: NVIDIA_CONFIG.apiKey,
                supportsThinking: false,
            };
        }

        // Classify user message type
        const messageType = classifyUserMessage(message);

        // SIMPLE: If current step is address and user gives venue name, auto-search for it
        const currentStep = await computeNextStepFromState(currentState || {});
        const isAddressStep = currentStep === "address";

        // When user provides a venue name (short text, not full address), search for it
        if (isAddressStep && messageType === MessageType.VENUE_NAME_ONLY) {
            const venueName = message.trim();
            console.log(`🔍 Auto-searching address for venue: "${venueName}"`);

            try {
                // Call search-places API internally
                const searchUrl = new URL("http://localhost:3000/api/search-places");
                searchUrl.searchParams.set("query", venueName);

                const searchRes = await fetch(searchUrl.toString());
                const searchData = await searchRes.json();

                if (searchData.results && searchData.results.length > 0) {
                    const bestMatch = searchData.results[0];
                    const foundAddress = bestMatch.display_name || bestMatch.address || bestMatch.title;

                    return NextResponse.json({
                        message: `I found **${bestMatch.title}** at:\n${foundAddress}\n\nIs this correct?`,
                        nextStep: "address",
                        suggestedOptions: [
                            { value: foundAddress, label: "✓ Yes, use this address" },
                            { value: "No", label: "✗ No, search again" }
                        ],
                        updatedParams: {
                            clientName: venueName
                        }
                    });
                }
            } catch (e) {
                console.error("Auto-search failed:", e);
            }

            // Fallback: ask for address manually
            return NextResponse.json({
                message: `I couldn't find "${venueName}" automatically. Please provide the full address:`,
                nextStep: "address",
                suggestedOptions: [],
                updatedParams: {
                    clientName: venueName
                }
            });
        }

        // Handle SERP snippets for address (when user pastes search results)
        if (messageType === MessageType.SERP_SNIPPET) {
            const validated = validateAddress(message);

            if (validated.isValid) {
                // Extract venue name and ask for confirmation
                return NextResponse.json({
                    message: formatAddressForConfirmation(validated),
                    nextStep: "address",
                    suggestedOptions: [],
                    updatedParams: {
                        clientName: validated.venueName || currentState.clientName
                    },
                });
            } else {
                // Ask for complete address
                return NextResponse.json({
                    message: `I found "${validated.venueName || 'venue'}".Please provide the complete street address(e.g., 768 Fifth Avenue, New York, NY 10019).`,
                    nextStep: "address",
                    suggestedOptions: [],
                    updatedParams: {
                        clientName: validated.venueName || currentState.clientName
                    },
                });
            }
        }

        // Validate numeric inputs
        const currentStep = STEPS.find((s: any) => s.id === currentState.nextStep);
        if (currentStep && ['pixelPitch', 'widthFt', 'heightFt', 'unitCost', 'targetMargin'].includes(currentStep.id)) {
            const numericValidation = parseNumericInput(currentStep.id, message);

            if (!numericValidation.valid) {
                return NextResponse.json({
                    message: numericValidation.error || "Please enter a valid number.",
                    nextStep: currentStep.id,
                    suggestedOptions: currentStep.allowedValues || [],
                    updatedParams: {},
                });
            }
        }

        // Validate permit answers
        if (currentStep && currentStep.id === 'permits') {
            const normalizedPermit = normalizePermitAnswer(message);

            if (!normalizedPermit) {
                return NextResponse.json({
                    message: "Please choose from: Client, ANC, or Existing",
                    nextStep: "permits",
                    suggestedOptions: [
                        { value: "Client", label: "Client Handles Permits" },
                        { value: "ANC", label: "ANC Handles Permits" },
                        { value: "Existing", label: "Existing Permits" }
                    ],
                    updatedParams: {},
                });
            }
        }

        const contextMessages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...history.map((h: any) => ({
                role: h.role,
                content: h.content,
                ...(h.thinking &&
                    modelConfig.supportsThinking && {
                    reasoning_content: h.thinking,
                }),
            })),
            {
                role: "user",
                content: `Input: "${message}"\nState: ${JSON.stringify(currentState)} \nMessageType: ${messageType} `,
            },
        ];

        // Build request body based on provider
        const requestBody: any = {
            model: modelConfig.id,
            messages: contextMessages,
            temperature: 0.1,
        };

        // Add thinking support for ZhipuAI
        if (modelConfig.supportsThinking) {
            requestBody.thinking = { type: "enabled", clear_thinking: false };
        }

        // SPECIAL CASE: User confirming an address (e.g., clicked "Yes, use this address")
        // Skip the AI call, just save the address and move to next step
        const isAddressConfirmation = isAddressStep && (
            message.toLowerCase() === "yes" ||
            message.toLowerCase().includes("correct") ||
            message.toLowerCase().includes("use this address") ||
            (message.includes(",") && message.length > 30 && !message.includes("No"))
        );

        if (isAddressConfirmation) {
            console.log("✅ Address confirmed. Moving to next step.");

            const mergedState = {
                ...(currentState || {}),
                address: message,
            };

            // Sync projectName
            if (mergedState.clientName) {
                mergedState.projectName = mergedState.clientName;
            }

            const { WIZARD_QUESTIONS } = await import("../../../lib/wizard-questions");
            const nextStep = await computeNextStepFromState(mergedState);
            const questionDef = WIZARD_QUESTIONS.find((q) => q.id === nextStep);

            return NextResponse.json({
                message: `Address confirmed. ${questionDef?.question || "What's next?"}`,
                updatedParams: {
                    address: message
                },
                nextStep,
                suggestedOptions: questionDef?.options || [],
            });
        }

        const response = await fetch(modelConfig.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${modelConfig.apiKey} `,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error(await response.text());

        const data = await response.json();
        const choice = data.choices?.[0];
        const providerThinking: string | undefined = choice?.message?.reasoning_content;
        let rawContent = choice?.message?.content || "";

        // Extract <think> blocks (some providers include them inside content).
        const thinkTag = extractThinkTagBlock(rawContent);
        rawContent = thinkTag.content;

        // If the model returns verbose analysis before a JSON object, split it into thinking.
        const analysisSplit = splitAnalysisPrefix(rawContent);
        rawContent = analysisSplit.content;

        // Clean markdown fences if present
        rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();

        const parsed = extractJSON(rawContent);

        const baseThinkingParts = [providerThinking, thinkTag.thinking, analysisSplit.thinking]
            .filter((p) => typeof p === "string" && p.trim().length > 0)
            .map((p) => String(p).trim());

        const allowReasoning = process.env.SHOW_REASONING === "true";

        if (parsed) {
            // Normalize + harden model output (never trust it for UX text or step logic)
            parsed.message = sanitizeAssistantMessage(parsed.message || "");

            parsed.updatedParams = parsed.updatedParams || {};

            const rejectedFields: string[] = [];
            const thinkingNotes: string[] = [];

            // SERVER-SIDE VALIDATION & NORMALIZATION
            try {
                const { WIZARD_QUESTIONS } = await import("../../../lib/wizard-questions");
                const validFieldIds = new Set(WIZARD_QUESTIONS.map(q => q.id));

                // 1. Normalize Keys (Handle common AI hallucinations/aliases)
                const normalizedParams: Record<string, any> = {};
                const aliasMap: Record<string, string> = {
                    'class': 'productClass',
                    'product': 'productClass',
                    'displayType': 'productClass',
                    'display_type': 'productClass',
                    'type': 'productClass',
                    'pitch': 'pixelPitch',
                    'width': 'widthFt',
                    'height': 'heightFt',
                    'labor': 'laborType',
                    'bond': 'bondRequired',
                    'controls': 'controlSystem',
                    'structure': 'structureCondition',
                    'mounting': 'mountingType',
                    'power': 'powerDistance',
                    'permit': 'permits',
                    'cost': 'unitCost',
                    'margin': 'targetMargin',
                    'service': 'serviceLevel'
                };

                for (const [key, value] of Object.entries(parsed.updatedParams)) {
                    let targetKey = key;
                    
                    // Convert snake_case to camelCase first
                    targetKey = targetKey.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
                    
                    // Check aliases
                    if (aliasMap[targetKey.toLowerCase()]) {
                        targetKey = aliasMap[targetKey.toLowerCase()];
                    }

                    // 2. Validate & Filter
                    if (validFieldIds.has(targetKey)) {
                        // Type coercion
                        const questionDef = WIZARD_QUESTIONS.find(q => q.id === targetKey);
                        if (questionDef?.type === 'number') {
                             if (typeof value === 'string') {
                                const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
                                if (!isNaN(numValue)) {
                                    normalizedParams[targetKey] = numValue;
                                }
                            } else if (typeof value === 'number') {
                                normalizedParams[targetKey] = value;
                            }
                        } else {
                            normalizedParams[targetKey] = value;
                        }
                    } else {
                        rejectedFields.push(String(key));
                    }
                }
                parsed.updatedParams = normalizedParams;

                // Backup Numeric Extraction (if AI missed it but it was a simple number response)
                const currentStepId = await computeNextStepFromState(currentState || {});
                const currentQuestion = WIZARD_QUESTIONS.find(q => q.id === currentStepId);
                
                if (currentQuestion?.type === 'number' && Object.keys(parsed.updatedParams).length === 0) {
                    const numericMatch = message.match(/\b\d+(\.\d+)?\b/);
                    if (numericMatch) {
                        const val = parseFloat(numericMatch[0]);
                        parsed.updatedParams[currentQuestion.id] = val;
                        thinkingNotes.push(`Backup extraction caught value ${val} for ${currentQuestion.id}`);
                    }
                }
            } catch (e) {
                console.error("Field validation error:", e);
                thinkingNotes.push("Field validation threw; see server logs.");
            }

            // Sync projectName with clientName (user doesn't want separate prompt)
            if (parsed.updatedParams.clientName || currentState?.clientName) {
                parsed.updatedParams.projectName = parsed.updatedParams.clientName || currentState.clientName;
            }

            // Reject partial addresses (e.g., "New York, NY 10001")
            if (Object.prototype.hasOwnProperty.call(parsed.updatedParams, "address")) {
                const candidate = parsed.updatedParams.address;
                if (!isLikelyStreetAddress(candidate)) {
                    delete parsed.updatedParams.address;
                    parsed.message =
                        "I need the full street address (e.g., 4 Pennsylvania Plaza, New York, NY 10001).";
                }
            }

            // CRITITAL FALLBACK: If we are stuck on clientName and AI didn't catch it, assume message IS the name
            if (!parsed.updatedParams.clientName && !currentState?.clientName) {
                const currentStepCheck = await computeNextStepFromState(currentState || {});
                if (currentStepCheck === 'clientName' && message && typeof message === 'string') {
                     // Check if message is a confirmation or irrelevant
                     const isGeneric = /^(proceed|start|go|hello|hi|hey)$/i.test(message.trim());
                     const isQuestion = message.includes('?');
                     
                     if (!isGeneric && !isQuestion) {
                         const name = titleCaseLoose(message);
                         console.log(`Fallback: Extracted clientName='${name}' from raw message`);
                         parsed.updatedParams.clientName = name;
                         parsed.updatedParams.projectName = name;
                         thinkingNotes.push(`Fallback: Forced clientName extraction from raw message: "${name}"`);
                     }
                }
            }

            // Check if pricing should be recalculated
            if (parsed.updatedParams) {
                const changedFields = Object.keys(parsed.updatedParams);
                const needsRecalculation = changedFields.some(field =>
                    shouldRecalculatePrice(field as any)
                );

                if (needsRecalculation) {
                    invalidatePriceCache();
                    console.log("Price recalculation triggered by field changes:", changedFields);
                }
            }

            // HARD GUARDRAIL: Override suggestedOptions with authoritative source
            if (parsed.nextStep || parsed.message) {
                try {
                    const { WIZARD_QUESTIONS } =
                        await import("../../../lib/wizard-questions");

                    const mergedState = {
                        ...(currentState || {}),
                        ...(parsed.updatedParams || {}),
                    };

                    // DEBUG: Log merged state to understand what's happening
                    console.log("🔍 GUARDRAIL DEBUG:");
                    console.log("   currentState:", JSON.stringify(currentState || {}, null, 2));
                    console.log("   updatedParams:", JSON.stringify(parsed.updatedParams || {}, null, 2));
                    console.log("   mergedState:", JSON.stringify(mergedState, null, 2));
                    console.log("   AI said nextStep:", parsed.nextStep);

                    // Compute the authoritative next step from the merged state.
                    const computedNextStep = await computeNextStepFromState(mergedState);
                    
                    console.log("   COMPUTED nextStep:", computedNextStep);
                    
                    // BULLETPROOF: ALWAYS use the computed step, NEVER trust AI
                    if (parsed.nextStep !== computedNextStep) {
                        console.log(`   ⚠️ OVERRIDE: AI said '${parsed.nextStep}' but state says '${computedNextStep}'`);
                    }
                    parsed.nextStep = computedNextStep;
                    thinkingNotes.push(`Authoritative nextStep computed from merged state: ${computedNextStep}`);

                    // A. Infer if AI is jumping the gun on address
                    // Run the smarter inference logic to validate/correct the step
                    const inferredStep = inferStepFromMessage(parsed.message);

                    const inferredDef = inferredStep
                        ? WIZARD_QUESTIONS.find((q) => q.id === inferredStep)
                        : undefined;
                    const inferredIsOptional = inferredDef?.required === false;

                    if (inferredStep && inferredStep !== parsed.nextStep && !inferredIsOptional) {
                        console.log(
                            `Step Correction: AI said '${parsed.nextStep}' but message implies '${inferredStep}'. Overriding.`,
                        );
                        parsed.nextStep = inferredStep;
                        thinkingNotes.push(`Step corrected from '${computedNextStep}' to '${inferredStep}' based on message context.`);
                    }

                    // Legacy Guardrails (Keep as fallback)
                    const msgLower = (parsed.message || "").toLowerCase();
                    const matchesAddressKeywords =
                        msgLower.includes("address") ||
                        msgLower.includes("select the correct one") ||
                        msgLower.includes("search") ||
                        msgLower.includes("street");

                    const isConfirmation =
                        msgLower.includes("found") ||
                        msgLower.includes("confirmed") ||
                        msgLower.includes("verified") ||
                        msgLower.includes("got it");

                    const isAskingForAddress =
                        matchesAddressKeywords && !isConfirmation;

                    // Only force address if we didn't already infer a better step (like productClass)
                    if (
                        isAskingForAddress &&
                        parsed.nextStep !== "address" &&
                        !inferredStep
                    ) {
                        console.log(
                            "Guardrail: Forcing nextStep to address based on message context.",
                        );
                        parsed.nextStep = "address";
                        thinkingNotes.push("Guardrail forced nextStep to 'address' based on keywords.");
                    }

                    // --- FORCE MESSAGE SYNC WITH STEP ---
                    // BULLETPROOF: The message MUST match the computed step.
                    // If AI is asking a question for a DIFFERENT field, REPLACE IT.

                    const questionDef = WIZARD_QUESTIONS.find(
                        (q) => q.id === parsed.nextStep,
                    );

                    // Check what field the AI's message is asking about
                    const messageInferredStep = inferStepFromMessage(parsed.message || "");
                    
                    // If AI is asking about the WRONG field, force the correct question
                    if (questionDef && messageInferredStep && messageInferredStep !== parsed.nextStep) {
                        console.log(`🚨 MESSAGE DESYNC: AI asks about '${messageInferredStep}' but computed step is '${parsed.nextStep}'. FORCING correct question.`);
                        parsed.message = questionDef.question;
                        thinkingNotes.push(`Forced message because AI asked about '${messageInferredStep}' instead of '${parsed.nextStep}'.`);
                    }
                    
                    // Also check for generic stale messages (legacy check)
                    const currentStepBeforeThisTurn = currentState?.nextStep || 'clientName';
                    const stepAdvanced = parsed.nextStep !== currentStepBeforeThisTurn;
                    const messageStillMatchesOldStep = currentStepBeforeThisTurn === 'clientName' && 
                                                     (parsed.message || "").toLowerCase().includes("venue name");

                    // Force message update if we advanced step via fallback but message is stale
                    if (stepAdvanced && messageStillMatchesOldStep && questionDef) {
                        console.log(`Step advanced to ${parsed.nextStep} but message was stale. Updating message.`);
                        parsed.message = questionDef.question;
                        thinkingNotes.push("Forced message update because step advanced but message was stale.");
                    }

                    // Standard overrides
                    if (questionDef && looksLikeInternalAnalysisText(parsed.message || "")) {
                        parsed.message = questionDef.question;
                    }
                    if (questionDef && questionDef.options) {
                        parsed.suggestedOptions = questionDef.options;
                    } else if (
                        parsed.nextStep === "clientName" ||
                        parsed.nextStep === "address" ||
                        parsed.nextStep === "projectName"
                    ) {
                        parsed.suggestedOptions = [];
                    }

                    // If the model is outputting transitional/robotic text, always replace with the canonical question.
                    const isAskingQuestion =
                        msgLower.includes("proceeding to") ||
                        msgLower.includes("locked to") ||
                        msgLower.includes("set to") ||
                        msgLower.includes("next") ||
                        msgLower.includes("awaiting input");

                    // Stronger check: Does the message actually ask the NEW question?
                    // If not, and we are not confirming, append or replace.
                    const asksCorrectQuestion = questionDef ? (parsed.message || "").toLowerCase().includes(questionDef.question.toLowerCase().split(' ').slice(0, 3).join(' ')) : true;

                    if ((isAskingQuestion || !asksCorrectQuestion) && questionDef && parsed.nextStep !== "confirm") {
                        // If completely off, replace. If just missing, append.
                        if (isAskingQuestion) {
                            parsed.message = questionDef.question;
                        } else {
                            const alreadyAsking = (parsed.message || "").includes("?");
                            if (!alreadyAsking) {
                                parsed.message = `${(parsed.message || "").trim()} ${questionDef.question}`.trim();
                            } else if (!asksCorrectQuestion && stepAdvanced) {
                                // If asking WRONG question (e.g. asking for name when step is address), REPLACE
                                parsed.message = questionDef.question;
                            }
                        }
                    }

                    if (parsed.nextStep === "confirm") {
                        parsed.suggestedOptions = [
                            { value: "Confirmed", label: "CONFIRM & GENERATE PDF" },
                            { value: "Edit", label: "Edit Specifications" },
                        ];
                        if (!parsed.message) {
                            parsed.message =
                                "All required specs are captured. Confirm to generate the proposal, or edit any field.";
                        }
                    }
                } catch (e) {
                    console.error("Guardrail import error:", e);
                    thinkingNotes.push("Guardrail import error; see server logs.");
                }
            }

            const thinking = allowReasoning
                ? baseThinkingParts.join("\n\n") ||
                buildEstimatorThinking({
                    input: message,
                    messageType: String(messageType),
                    currentState,
                    updatedParams: parsed.updatedParams,
                    nextStep: parsed.nextStep,
                    rejectedFields,
                    notes: thinkingNotes,
                })
                : undefined;

            return NextResponse.json({
                ...parsed,
                ...(thinking ? { thinking } : {}),
            });
        } else {
            // Fallback: If the model didn't follow JSON, keep the wizard moving deterministically.
            const { WIZARD_QUESTIONS } = await import("../../../lib/wizard-questions");

            const fallbackUpdatedParams: Record<string, any> = {};

            // Minimal extraction: if we're missing clientName, treat a plain user message as venue name.
            const stateNext = await computeNextStepFromState(currentState || {});
            if (stateNext === "clientName" && !currentState?.clientName && typeof message === "string") {
                const name = titleCaseLoose(message);
                fallbackUpdatedParams.clientName = name;
                fallbackUpdatedParams.projectName = name;
            }
            // Ensure projectName is always synced in fallback too
            if (fallbackUpdatedParams.clientName || currentState?.clientName) {
                fallbackUpdatedParams.projectName = fallbackUpdatedParams.clientName || currentState.clientName;
            }

            const mergedState = {
                ...(currentState || {}),
                ...fallbackUpdatedParams,
            };
            const nextStep = await computeNextStepFromState(mergedState);
            const questionDef = WIZARD_QUESTIONS.find((q) => q.id === nextStep);

            const fallbackMessage = questionDef?.question || "What's the next required specification?";
            const suggestedOptions = questionDef?.options || [];

            const thinking = allowReasoning
                ? baseThinkingParts.join("\n\n") ||
                buildEstimatorThinking({
                    input: message,
                    messageType: String(messageType),
                    currentState,
                    updatedParams: fallbackUpdatedParams,
                    nextStep,
                    notes: [
                        "Model response was not valid JSON; used deterministic fallback.",
                    ],
                    rawModelExcerpt: rawContent,
                })
                : undefined;

            return NextResponse.json({
                message: fallbackMessage,
                updatedParams: fallbackUpdatedParams,
                nextStep,
                suggestedOptions,
                ...(thinking ? { thinking } : {}),
            });
        }
    } catch (error) {
        console.error("Chat API Error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error details:", errorMessage, error instanceof Error ? error.stack : "no stack");

        // Return structured error so client can decide how to handle it
        return NextResponse.json(
            {
                message: "I'm having trouble connecting to the ANC brain. Please check your connection and try again.",
                updatedParams: {},
                nextStep: null,
                error: errorMessage,
            },
            { status: 500 },
        );
    }
}
