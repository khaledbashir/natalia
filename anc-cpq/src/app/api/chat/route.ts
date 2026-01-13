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

const SYSTEM_PROMPT = `You are the ANC Project Assistant, an internal SPEC AUDIT tool. Your job is to fill exactly 21 fields for the Engineering Estimator.

### INTERNAL PERSONA (STRICT):
- Speak to the Estimator/Engineer (e.g., "Specs received. Calculating 'pixelPitch' requirements...").
- Do NOT use fluff. No "How can I help you?". No "Great choice!".
- Use specific field identifiers (e.g., "Field 'productClass' locked to Ribbon.").

### SPEC AUDIT LOGIC (CRITICAL):
1. **ALWAYS UPDATE STATE:** When a user provides a value, you MUST include it in 'updatedParams'. Example: User says "Ribbon" → updatedParams: {"productClass": "Ribbon"}
2. **Never Backtrack:** If a field has a value in 'currentState', NEVER ask for it again.
3. **Extraction:** If user provides multiple values (e.g., "10mm Ribbon"), update BOTH in updatedParams.
4. **Next Logic:** Always point 'nextStep' to the FIRST null or empty field in the sequence.

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

### EXAMPLE:
User: "Ribbon"
CurrentState: {"clientName": "MSG", "address": "NYC", "projectName": "Install", "productClass": ""}
Response: {"message": "Field 'productClass' locked to Ribbon. Proceeding to 'pixelPitch'.", "nextStep": "pixelPitch", "suggestedOptions": [{"value": "6", "label": "6mm"}, {"value": "10", "label": "10mm"}], "updatedParams": {"productClass": "Ribbon"}}
`;

function inferStepFromMessage(message: string): string | null {
    if (!message) return null;

    // CRITICAL: Only analyze the QUESTION part, not the acknowledgment
    // Split on "." or "?" to isolate the actual question
    const parts = message.split(/[.!]\s*/);
    const questionPart =
        parts.find((p) => p.includes("?")) ||
        parts[parts.length - 1] ||
        message;
    const lower = questionPart.toLowerCase();

    // 0. Check for Starting
    if (lower.includes("proceed") || lower.includes("shall we proceed")) {
        return "clientName";
    }

    // 1. Check for Confirmation/Finalizing
    if (
        (lower.includes("confirm") && lower.includes("configuration")) ||
        lower.includes("draws approx")
    ) {
        return "confirm";
    }

    // Product Type
    if (
        (lower.includes("type of display") ||
            lower.includes("what product") ||
            lower.includes("type of product")) &&
        !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")
    )
        return "productClass";

    // Dimensions - ONLY match if asking, NOT acknowledging
    if ((lower.includes("width") || lower.includes("how wide")) && !lower.includes("locked") && !lower.includes("set")) return "widthFt";
    if (
        (lower.includes("height") || lower.includes("how high") || lower.includes("how tall")) &&
        !lower.includes("locked") && !lower.includes("set")
    )
        return "heightFt";

    // Pixel Pitch
    if ((lower.includes("pixel") || lower.includes("pitch")) && !lower.includes("locked") && !lower.includes("set")) return "pixelPitch";

    // Shape (Check BEFORE environment to prevent "outdoor" in acknowledgment overriding "shape" question)
    if ((lower.includes("shape") || lower.includes("configuration")) && !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed"))
        return "shape";

    // Environment (Only if the question is explicitly about indoor/outdoor)
    if (
        (lower.includes("installed") ||
            lower.includes("indoor or outdoor") ||
            lower.includes("environment")) &&
        !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")
    )
        return "environment";

    // Structure
    if (
        (lower.includes("existing") || lower.includes("steel") || lower.includes("mounting to")) &&
        !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")
    )
        return "structureCondition";

    // Mounting
    if (
        (lower.includes("mount") ||
            lower.includes("rigged") ||
            lower.includes("flown")) &&
        !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")
    )
        return "mountingType";

    // Access
    if (
        (lower.includes("access") ||
            lower.includes("service") ||
            lower.includes("technician")) &&
        !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")
    )
        return "access";

    // Permits
    if (lower.includes("permit") && !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")) return "permits";

    // Labor
    if (
        (lower.includes("union") ||
            lower.includes("labor") ||
            lower.includes("prevailing")) &&
        !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")
    )
        return "laborType";

    // Power Distance
    if (
        (lower.includes("power") ||
            lower.includes("termination") ||
            lower.includes("distance")) &&
        !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")
    )
        return "powerDistance";

    // Control System
    if ((lower.includes("control") || lower.includes("processor")) && !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed"))
        return "controlSystem";

    // Complexity
    if (lower.includes("complexity") && !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")) return "complexity";

    // Costing & Service
    if (lower.includes("cost") && !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")) return "unitCost";
    if (lower.includes("margin") && !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")) return "targetMargin";
    if (lower.includes("service") && !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")) return "serviceLevel";

    // Bond
    if (lower.includes("bond") && !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")) return "bondRequired";

    // Address (Lowest Priority - only if explicitly asking)
    if (
        (lower.includes("select the correct one") ||
            lower.includes("enter the address") ||
            (lower.includes("address") && lower.includes("?"))) &&
        !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")
    )
        return "address";

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
        // BUT try to infer the next step from the text content to keep the UI interactive
        if (text && !text.includes("{")) {
            const lower = text.toLowerCase();
            let inferredStep = null;
            let inferredOptions = null;

            // Smart Inference Logic for "dumb" models
            // NOTE: Order matters greatly here to avoid false positives.
            // Specific phrases should be checked before generic ones.

            // CONFIRMATION (Very specific)
            // Avoid matching "Address confirmed" or "Specs confirmed"
            if (
                (lower.includes("confirm") &&
                    lower.includes("configuration")) ||
                lower.includes("draws approx")
            ) {
                inferredStep = "confirm";
                inferredOptions = [
                    { value: "Confirmed", label: "CONFIRM & GENERATE PDF" },
                    { value: "Edit", label: "Edit Specifications" },
                ];
            }
            // ADDRESS (Specific)
            // "Address Confirmed" should NOT trigger address mode (which hides buttons)
            else if (
                ((lower.includes("address") && !lower.includes("confirm")) ||
                    lower.includes("street") ||
                    lower.includes("select the correct one")) &&
                !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")
            ) {
                inferredStep = "address";
                inferredOptions = [];
            }
            // STRUCTURE & LABOR (Specific)
            else if ((lower.includes("structure") || lower.includes("steel")) && !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")) {
                inferredStep = "structureCondition";
                inferredOptions = [
                    { value: "Existing", label: "Existing Structure (Usable)" },
                    { value: "NewSteel", label: "New Steel Required" },
                ];
            } else if ((lower.includes("labor") || lower.includes("union")) && !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")) {
                inferredStep = "laborType";
                inferredOptions = [
                    { value: "NonUnion", label: "Non-Union (Standard)" },
                    { value: "Union", label: "Union Labor Required" },
                    { value: "Prevailing", label: "Prevailing Wage" },
                ];
            }
            // SPECS (Width/Height/Pitch) - ONLY match if actually ASKING for the value
            // Do NOT match acknowledgments like "Field 'widthFt' locked to 40"
            else if (lower.includes("width") && !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")) {
                inferredStep = "widthFt";
                inferredOptions = [
                    { value: "20", label: "20 ft" },
                    { value: "40", label: "40 ft" },
                    { value: "60", label: "60 ft" },
                    { value: "100", label: "100 ft" },
                    { value: "200", label: "200 ft" },
                ];
            } else if (lower.includes("height") && !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")) {
                inferredStep = "heightFt";
                inferredOptions = [
                    { value: "3", label: "3 ft" },
                    { value: "10", label: "10 ft" },
                    { value: "20", label: "20 ft" },
                    { value: "30", label: "30 ft" },
                    { value: "40", label: "40 ft" },
                ];
            } else if (lower.includes("pitch") && !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")) {
                inferredStep = "pixelPitch";
                inferredOptions = [
                    { value: "4", label: "4mm (Ultra Fine)" },
                    { value: "6", label: "6mm (Fine)" },
                    { value: "10", label: "10mm (Standard)" },
                    { value: "16", label: "16mm (Ribbon/Perimeter)" },
                ];
            }
            // ENVIRONMENT & SHAPE
            else if (
                (lower.includes("environment") ||
                    lower.includes("indoor") ||
                    lower.includes("outdoor")) &&
                !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")
            ) {
                inferredStep = "environment";
                inferredOptions = [
                    { value: "Indoor", label: "Indoor" },
                    { value: "Outdoor", label: "Outdoor" },
                ];
            } else if ((lower.includes("shape") || lower.includes("curve")) && !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")) {
                inferredStep = "shape";
                inferredOptions = [
                    { value: "Flat", label: "Flat Panel" },
                    { value: "Curved", label: "Curved Display" },
                ];
            }
            // ACCESS & MOUNTING (Specific terms)
            else if ((lower.includes("access") || lower.includes("service")) && !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")) {
                inferredStep = "access";
                inferredOptions = [
                    { value: "Front", label: "Front Access" },
                    { value: "Rear", label: "Rear Access" },
                ];
            } else if (
                (lower.includes("mounting") ||
                    lower.includes("rigged") ||
                    lower.includes("flown") ||
                    lower.includes("pole mount")) &&
                !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")
            ) {
                inferredStep = "mountingType"; // 'mount' is too generic, used 'mounting'
                inferredOptions = [
                    { value: "Wall", label: "Wall Mount" },
                    { value: "Ground", label: "Ground Stack" },
                    { value: "Rigging", label: "Rigged/Flown" },
                    { value: "Pole", label: "Pole Mount" },
                ];
            }
            // COSTING (Permits, Bond, Control, Price)
            else if (lower.includes("permit") && !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")) {
                inferredStep = "permits";
                inferredOptions = [
                    { value: "Client", label: "Client Handles Permits" },
                    { value: "ANC", label: "ANC Handles Permits" },
                ];
            } else if (lower.includes("control") && !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")) {
                inferredStep = "controlSystem";
                inferredOptions = [
                    { value: "Include", label: "Yes, Include Controls" },
                    { value: "None", label: "No, Use Existing" },
                ];
            } else if (lower.includes("bond") && !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")) {
                inferredStep = "bondRequired";
                inferredOptions = [
                    { value: "No", label: "No" },
                    { value: "Yes", label: "Yes (Add ~1.5%)" },
                ];
            } else if (
                (lower.includes("cost") ||
                    lower.includes("price") ||
                    lower.includes("unit cost")) &&
                !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")
            ) {
                inferredStep = "unitCost";
                inferredOptions = [
                    { value: "1200", label: "$1,200 (Standard)" },
                    { value: "1800", label: "$1,800 (Premium)" },
                    { value: "Manual", label: "Enter Custom Amount" },
                ];
            } else if ((lower.includes("margin") || lower.includes("profit")) && !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")) {
                inferredStep = "targetMargin";
                inferredOptions = [
                    { value: "15", label: "15% (Standard)" },
                    { value: "20", label: "20% (Target)" },
                    { value: "25", label: "25% (High)" },
                ];
            }
            // PRODUCT CLASS (Last Resort - Generic Terms)
            else if (
                (lower.includes("product") ||
                    lower.includes("type") ||
                    lower.includes("ribbon") ||
                    lower.includes("scoreboard")) &&
                !lower.includes("locked") && !lower.includes("set") && !lower.includes("confirmed")
            ) {
                inferredStep = "productClass";
                inferredOptions = [
                    { value: "Scoreboard", label: "Scoreboard" },
                    { value: "Ribbon", label: "Ribbon Board" },
                    { value: "CenterHung", label: "Center Hung" },
                    { value: "Vomitory", label: "Vomitory Display" },
                ];
            }

            return {
                message: text.trim(),
                updatedParams: {},
                nextStep: inferredStep,
                suggestedOptions: inferredOptions, // Dynamically inject options if missing
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
                    // A. Infer if AI is jumping the gun on address
                    // Run the smarter inference logic to validate/correct the step
                    const inferredStep = inferStepFromMessage(parsed.message);

                    if (inferredStep && inferredStep !== parsed.nextStep) {
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

                    const { WIZARD_QUESTIONS } =
                        await import("../../../lib/wizard-questions");
                    const questionDef = WIZARD_QUESTIONS.find(
                        (q) => q.id === parsed.nextStep,
                    );
                    if (questionDef && questionDef.options) {
                        parsed.suggestedOptions = questionDef.options;
                    } else if (
                        parsed.nextStep === "clientName" ||
                        parsed.nextStep === "address"
                    ) {
                        parsed.suggestedOptions = [];
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
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
