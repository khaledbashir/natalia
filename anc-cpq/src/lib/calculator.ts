import { CPQInput, CalculationResult, ScreenConfig } from './types';

// Configuration (Embedded for client-side speed, could be fetched)
const CONFIG = {
    multipliers: {
        structural: 0.20, // Always 20% of hardware cost
        labor: 0.15,      // 15% of (Hardware + Structural)
        shipping: 0.05,
        bond: 0.01
    },
    defaults: {
        margin: 0.30
    }
};

export function calculateScreen(config: Partial<ScreenConfig> | CPQInput): CalculationResult {
    const input = config as any;
    // 1. Base Rate Lookup
    let baseRate = 800;
    if (input.productClass === 'Ribbon') baseRate = 1200;
    if (input.pixelPitch <= 6) baseRate += 200;

    // 2. Raw Costs (Internal)
    const sqFt = (input.widthFt || 0) * (input.heightFt || 0);
    const rawHardwareCost = sqFt * baseRate;

    // 3. Structural Rule (20% of Hardware)
    const rawStructuralCost = rawHardwareCost * CONFIG.multipliers.structural;

    // 4. Labor Rule (15% of Hardware + Structural)
    const rawLaborCost = (rawHardwareCost + rawStructuralCost) * CONFIG.multipliers.labor;

    // 5. Expenses Rule (5% of Hardware)
    const rawExpenseCost = rawHardwareCost * CONFIG.multipliers.shipping;

    // 6. Apply Margin (30%) to each line item
    const markupFactor = 1 / (1 - CONFIG.defaults.margin);

    const hardwareCost = Math.round(rawHardwareCost * markupFactor);
    const structuralCost = Math.round(rawStructuralCost * markupFactor);
    const laborCost = Math.round(rawLaborCost * markupFactor);
    const expenseCost = Math.round(rawExpenseCost * markupFactor);

    // 7. Subtotal (Sum of marked-up lines)
    const subTotal = hardwareCost + structuralCost + laborCost + expenseCost;

    // 7. Dynamic Contingency Logic (Value-Add Feature)
    // If New Steel AND Outdoor -> High Risk -> Add 5% Construction Contingency
    let contingencyCost = 0;
    // Note: structureCondition isn't in standard types yet, so we assume 'NewSteel' string check or default to safe
    // If input has structureCondition (from CPQInput cast), use it.
    if ((input as any).structureCondition === 'NewSteel' && input.environment === 'Outdoor') {
        contingencyCost = Math.round(subTotal * 0.05);
    }

    // 8. Bond (1% of subtotal)
    const bondCost = Math.round(subTotal * CONFIG.multipliers.bond);

    // 9. Final Sell Price
    const sellPrice = subTotal + contingencyCost + bondCost;

    // 10. Technical Validation: Power Estimation (Amps @ 120V)
    // Outdoor ~ 60W/sqft, Indoor ~ 30W/sqft
    const wattsPerSqFt = input.environment === 'Outdoor' ? 60 : 30;
    const totalWatts = sqFt * wattsPerSqFt;
    // Amps = Watts / Volts. Assuming 120V standard calculation base (conservative)
    const powerAmps = Math.round(totalWatts / 120);

    return {
        sqFt,
        hardwareCost,
        structuralCost,
        laborCost,
        pmCost: 0,
        expenseCost,
        bondCost,
        contingencyCost,
        totalCost: subTotal,
        sellPrice,
        margin: CONFIG.defaults.margin,
        powerAmps
    };
}

export function calculateCPQ(input: CPQInput): CalculationResult {
    if (input.screens && input.screens.length > 0) {
        // Aggregate multi-screen results
        const results = input.screens.map(s => calculateScreen(s));

        return results.reduce((acc, curr) => ({
            sqFt: acc.sqFt + curr.sqFt,
            hardwareCost: acc.hardwareCost + curr.hardwareCost,
            structuralCost: acc.structuralCost + curr.structuralCost,
            laborCost: acc.laborCost + curr.laborCost,
            pmCost: 0,
            expenseCost: acc.expenseCost + curr.expenseCost,
            bondCost: acc.bondCost + curr.bondCost,
            totalCost: acc.totalCost + curr.totalCost,
            sellPrice: acc.sellPrice + curr.sellPrice,
            margin: CONFIG.defaults.margin,
            contingencyCost: (acc.contingencyCost || 0) + (curr.contingencyCost || 0),
            powerAmps: (acc.powerAmps || 0) + (curr.powerAmps || 0)
        }), {
            sqFt: 0, hardwareCost: 0, structuralCost: 0, laborCost: 0,
            pmCost: 0, expenseCost: 0, bondCost: 0, totalCost: 0, sellPrice: 0,
            margin: CONFIG.defaults.margin,
            contingencyCost: 0,
            powerAmps: 0
        });
    }

    // Default to single screen logic
    return calculateScreen(input);
}
