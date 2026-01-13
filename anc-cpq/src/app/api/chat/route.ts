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

function isLikelyStreetAddress(address: unknown): boolean {
    if (typeof address !== "string") return false;
    const trimmed = address.trim();
    if (!trimmed) return false;

    // Prefer a true street address.
    const hasNumber = /\b\d{1,6}\b/.test(trimmed);
    const hasStreetType =
        /\b(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|way|court|ct|place|pl|parkway|pkwy|plaza)\b/i.test(
            trimmed,
        );

    // Also accept a common venue-style address that includes city/state/zip (e.g., "Madison Square Garden, New York, NY 10001").
    const hasCityStateZip = /,\s*[^,]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/.test(trimmed);

    return (hasNumber && hasStreetType) || hasCityStateZip;
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

        if (value === undefined || value === null || value === "" || value === 0) {
            return q.id;
        }
    }

    return "confirm";
}

const SYSTEM_PROMPT = `You are the ANC Project Assistant, an internal SPEC AUDIT tool. Your job is to fill exactly 21 fields for the Engineering Estimator.

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

**CONFIRMATION FLOW:**
- If user confirms an address selection, set both 'clientName' AND 'address' and MOVE TO THE NEXT STEP (e.g., 'projectName').
- NEVER ask for 'address' again after a valid confirmation.

**NEXT LOGIC:**
- Always point 'nextStep' to the FIRST null or empty field in the sequence AFTER your bulk extractions.

### THE ONLY 21 VALID FIELDS (IN ORDER):
1. clientName
2. address
3. projectName
4. productClass (Scoreboard, Ribbon, CenterHung, Vomitory)
5. pixelPitch (4, 6, 10, 16)
6. widthFt (number)
7. heightFt (number) <-- NOTE: There is NO 'depth' field. LED displays are 2D only.
8. environment (Indoor, Outdoor)
9. shape (Flat, Curved)
10. mountingType (Wall, Ground, Rigging, Pole)
11. access (Front, Rear)
12. structureCondition (Existing, NewSteel)
13. laborType (NonUnion, Union, Prevailing)
14. powerDistance (Close, Medium, Far)
15. permits (Client, ANC)
16. controlSystem (Include, None)
17. bondRequired (Yes, No)
18. complexity (Standard, High)
19. unitCost (number, optional)
20. targetMargin (number, optional)
21. serviceLevel (bronze, silver, gold)

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

**Example 3: ALL 21 ANSWERS (Jump directly to confirm)**
User: "Madison Square Garden, 4 Pennsylvania Plaza New York NY 10001, MSG Install, Scoreboard, 10mm, 80ft wide, 25ft high, Outdoor, Curved, Wall mount, Front access, Existing structure, Union labor, Medium distance, ANC handles permits, Include controls, Yes bond, High complexity, $1500/sqft, 25% margin, Bronze service"
CurrentState: {}
Response: {
  "message": "I've captured all 21 specifications. Please confirm to generate your proposal.",
  "nextStep": "confirm",
  "suggestedOptions": [
    {"value": "Confirmed", "label": "CONFIRM & GENERATE PDF"},
    {"value": "Edit", "label": "Edit Specifications"}
  ],
  "updatedParams": {
    "clientName": "Madison Square Garden",
    "address": "4 Pennsylvania Plaza New York NY 10001",
    "projectName": "MSG Install",
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
        (lower.includes("all required") && lower.includes("confirm"))
    ) {
        return "confirm";
    }

    // 2. Check for Starting
    if (lower.includes("proceed") || lower.includes("shall we proceed")) {
        return "clientName";
    }

    // 3. Address detection (needs careful handling)
    const isAskingForAddress =
        (lower.includes("select the correct one") ||
            lower.includes("enter the address") ||
            (lower.includes("address") && lower.includes("?"))) &&
        !lower.includes("confirmed") &&
        !lower.includes("verified");
    if (isAskingForAddress) return "address";

    // 4. Field-specific detection (ordered to avoid false positives)
    const fieldPatterns = [
        { step: "productClass", patterns: ["type of display", "what product", "kind of display"], exclude: ["locked", "set to", "confirmed"] },
        { step: "widthFt", patterns: ["width", "how wide"], exclude: ["locked", "set to", "confirmed"] },
        { step: "heightFt", patterns: ["height", "how high", "how tall"], exclude: ["locked", "set to", "confirmed"] },
        { step: "pixelPitch", patterns: ["pixel", "pitch"], exclude: ["locked", "set to", "confirmed"] },
        { step: "shape", patterns: ["shape", "curved"], exclude: ["locked", "set to", "confirmed", "environment"] },
        { step: "environment", patterns: ["indoor or outdoor", "environment type"], exclude: ["locked", "set to", "confirmed"] },
        { step: "structureCondition", patterns: ["existing structure", "new steel", "mounting to"], exclude: ["locked", "set to", "confirmed"] },
        { step: "mountingType", patterns: ["mounting", "mounted", "rigged", "flown"], exclude: ["locked", "set to", "confirmed"] },
        { step: "access", patterns: ["access", "service access", "technician"], exclude: ["locked", "set to", "confirmed"] },
        { step: "permits", patterns: ["permit", "who will handle"], exclude: ["locked", "set to", "confirmed"] },
        { step: "laborType", patterns: ["labor", "union", "prevailing wage"], exclude: ["locked", "set to", "confirmed"] },
        { step: "powerDistance", patterns: ["power", "termination", "distance to"], exclude: ["locked", "set to", "confirmed"] },
        { step: "controlSystem", patterns: ["control system", "processor", "include controls"], exclude: ["locked", "set to", "confirmed"] },
        { step: "bondRequired", patterns: ["bond", "performance bond", "payment bond"], exclude: ["locked", "set to", "confirmed"] },
        { step: "complexity", patterns: ["complexity", "install complexity"], exclude: ["locked", "set to", "confirmed"] },
        { step: "unitCost", patterns: ["unit cost", "cost per", "target dollar"], exclude: ["locked", "set to", "confirmed"] },
        { step: "targetMargin", patterns: ["margin", "profit", "gross margin"], exclude: ["locked", "set to", "confirmed"] },
        { step: "serviceLevel", patterns: ["service level", "ongoing service"], exclude: ["locked", "set to", "confirmed"] },
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

        // 3. Last ditch: If text is just a string, return a fallback message
        // Use the unified inference function for consistency
        if (text && !text.includes("{")) {
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

        // Handle SERP snippets for address
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
                    thinking: "Detected SERP snippet. Extracted venue name and asking for address confirmation."
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
                    thinking: "Detected SERP snippet but address is incomplete. Asking for complete address."
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
                    thinking: `Numeric validation failed for ${currentStep.id}: ${numericValidation.error} `
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
                    thinking: "Permit answer validation failed. Asking for valid option."
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
        const thinking = choice?.message?.reasoning_content || "Thinking...";
        let rawContent = choice?.message?.content || "{}";

        // Clean markdown and thinking tags if present
        rawContent = rawContent
            .replace(/<think>[\s\S]*?<\/think>/gi, "") // Strip <think>...</think> blocks
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const parsed = extractJSON(rawContent);

        if (parsed) {
            // Normalize + harden model output (never trust it for UX text or step logic)
            parsed.message = sanitizeAssistantMessage(parsed.message || "");

            parsed.updatedParams = parsed.updatedParams || {};

            // SERVER-SIDE VALIDATION: Reject unknown fields completely
            try {
                const { WIZARD_QUESTIONS } = await import("../../../lib/wizard-questions");
                const validFieldIds = new Set(WIZARD_QUESTIONS.map(q => q.id));

                // Filter out any fields the AI hallucinated
                const cleanedParams: Record<string, any> = {};
                for (const [key, value] of Object.entries(parsed.updatedParams)) {
                    if (validFieldIds.has(key)) {
                        // Type coercion: ensure numeric fields are numbers
                        const questionDef = WIZARD_QUESTIONS.find(q => q.id === key);
                        if (questionDef?.type === 'number' && typeof value === 'string') {
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue)) {
                                cleanedParams[key] = numValue;
                            } else {
                                console.warn(`Invalid numeric value for ${key}: ${value}, skipping`);
                            }
                        } else {
                            cleanedParams[key] = value;
                        }
                    } else {
                        console.warn(`AI attempted to set unknown field '${key}', rejecting`);
                    }
                }
                parsed.updatedParams = cleanedParams;
            } catch (e) {
                console.error("Field validation error:", e);
            }

            // Derive projectName from clientName (avoid redundant question)
            if (
                (parsed.updatedParams.clientName || currentState?.clientName) &&
                !parsed.updatedParams.projectName &&
                !currentState?.projectName
            ) {
                const derivedProjectName = parsed.updatedParams.clientName || currentState.clientName;
                parsed.updatedParams.projectName = derivedProjectName;
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

                    // Compute the authoritative next step from the merged state.
                    const computedNextStep = await computeNextStepFromState(mergedState);
                    parsed.nextStep = computedNextStep;

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
                    }
                    const questionDef = WIZARD_QUESTIONS.find(
                        (q) => q.id === parsed.nextStep,
                    );
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

                    if (isAskingQuestion && questionDef) {
                        parsed.message = questionDef.question;
                    } else if (questionDef && parsed.nextStep !== "confirm") {
                        // If the assistant responded without asking the actual question, append it.
                        const alreadyAsking = (parsed.message || "").includes("?");
                        if (!alreadyAsking) {
                            parsed.message = `${(parsed.message || "").trim()} ${questionDef.question}`.trim();
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
                }
            }
            return NextResponse.json({ ...parsed, thinking });
        } else {
            const cleanMessage = rawContent.replace(/\{[\s\S]*\}/g, "").trim();
            return NextResponse.json({
                message:
                    cleanMessage ||
                    "I'm having trouble processing that, but I'm still here to help!",
                updatedParams: {},
                nextStep: null,
                thinking,
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
                thinking: `Error: ${errorMessage}`,
                error: errorMessage,
            },
            { status: 500 },
        );
    }
}
