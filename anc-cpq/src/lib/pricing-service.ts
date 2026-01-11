import { CPQInput, CalculationResult } from './types';
import { calculateCPQ } from './calculator';

// Export singleton instance (Mocked for compatibility if used elsewhere as object)
class PricingService {
  calculatePrice(inputs: Partial<CPQInput>): CalculationResult {
      // 1. Sanitize Inputs for the core calculator
      // The core calculator expects a full CPQInput, but here we might have partials during chat.
      const safeInput: CPQInput = {
          clientName: inputs.clientName || 'Draft',
          address: inputs.address || '',
          projectName: inputs.projectName || 'Draft Project',
          
          productClass: inputs.productClass || 'Scoreboard',
          widthFt: inputs.widthFt || 10, // Default to avoid NaN
          heightFt: inputs.heightFt || 6,
          pixelPitch: inputs.pixelPitch || 6,
          environment: inputs.environment || 'Indoor',
          shape: inputs.shape || 'Flat',
          access: inputs.access || 'Front',
          complexity: inputs.complexity || 'Standard',
          
          // Pass through optional fields
          screens: inputs.screens,
          targetMargin: inputs.targetMargin,
          bondRequired: inputs.bondRequired,
          structureCondition: inputs.structureCondition,
          mountingType: inputs.mountingType,
          laborType: inputs.laborType,
          powerDistance: inputs.powerDistance,
          permits: inputs.permits,
          controlSystem: inputs.controlSystem
      };

      return calculateCPQ(safeInput);
  }
  
  invalidateCache() {}
  shouldRecalculate(f: any) { return true; }
}

export const pricingService = new PricingService();

/**
 * Convenience function to calculate price
 * NOW UNIFIED with calculator.ts
 */
export function calculatePrice(inputs: Partial<CPQInput>): CalculationResult {
  return pricingService.calculatePrice(inputs);
}

export function invalidatePriceCache(): void {
  pricingService.invalidateCache();
}

export function shouldRecalculatePrice(changedField: keyof CPQInput): boolean {
  return pricingService.shouldRecalculate(changedField);
}