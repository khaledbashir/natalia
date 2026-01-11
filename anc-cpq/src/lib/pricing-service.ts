// Pricing service with automatic recalculation when fields change

import { CPQInput, CalculationResult } from './types';

// Pixel pitch cost multiplier (finer pitch = higher cost)
const PIXEL_PITCH_MULTIPLIERS: Record<number, number> = {
  2: 2.0,   // Ultra fine
  3: 1.8,
  4: 1.5,   // Fine
  6: 1.0,   // Baseline
  8: 0.8,
  10: 0.6,  // Standard
  12: 0.5,
  16: 0.4,  // Ribbon/Perimeter
  20: 0.3
};

// Product class multipliers
const PRODUCT_CLASS_MULTIPLIERS: Record<string, number> = {
  'Scoreboard': 1.0,
  'Ribbon': 1.2,
  'CenterHung': 1.3,
  'Vomitory': 1.1
};

// Environment multipliers
const ENVIRONMENT_MULTIPLIERS: Record<string, number> = {
  'Indoor': 1.0,
  'Outdoor': 1.15  // Weatherproofing surcharge
};

// Shape multipliers
const SHAPE_MULTIPLIERS: Record<string, number> = {
  'Flat': 1.0,
  'Curved': 1.2  // Custom framing
};

// Mounting type multipliers
const MOUNTING_MULTIPLIERS: Record<string, number> = {
  'Wall': 1.0,
  'Ground': 1.05,
  'Rigging': 1.25,
  'Pole': 1.15
};

// Access multipliers (affects labor)
const ACCESS_MULTIPLIERS: Record<string, number> = {
  'Front': 1.0,
  'Rear': 1.15
};

// Structure condition multipliers
const STRUCTURE_MULTIPLIERS: Record<string, number> = {
  'Existing': 1.0,
  'NewSteel': 1.3  // Significant cost increase
};

// Labor type multipliers
const LABOR_MULTIPLIERS: Record<string, number> = {
  'NonUnion': 1.0,
  'Union': 1.3,
  'Prevailing': 1.5
};

// Power distance costs
const POWER_DISTANCE_COSTS: Record<string, number> = {
  'Close': 0,
  'Medium': 3500,
  'Far': 12000
};

// Permit costs
const PERMIT_COSTS: Record<string, number> = {
  'Client': 0,
  'ANC': 5000,
  'Existing': 0
};

// Control system costs
const CONTROL_SYSTEM_COSTS: Record<string, number> = {
  'Include': 15000,
  'None': 0
};

// Bond percentage
const BOND_PERCENTAGE = 0.01;

// Contingency percentage (New Steel + Outdoor)
const CONTINGENCY_PERCENTAGE = 0.05;

// Default margin
const DEFAULT_MARGIN = 0.30;

interface PricingCache {
  key: string;
  result: CalculationResult;
  timestamp: number;
}

class PricingService {
  private cache: Map<string, PricingCache> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate cache key from pricing inputs
   */
  private generateCacheKey(inputs: Partial<CPQInput>): string {
    const relevantFields = [
      inputs.productClass,
      inputs.pixelPitch,
      inputs.widthFt,
      inputs.heightFt,
      inputs.environment,
      inputs.shape,
      inputs.mountingType,
      inputs.access,
      inputs.structureCondition,
      inputs.laborType,
      inputs.powerDistance,
      inputs.permits,
      inputs.controlSystem,
      inputs.bondRequired,
      inputs.unitCost,
      inputs.targetMargin
    ];
    return JSON.stringify(relevantFields);
  }

  /**
   * Check if cache entry is valid
   */
  private isCacheValid(cacheEntry: PricingCache): boolean {
    return Date.now() - cacheEntry.timestamp < this.cacheTimeout;
  }

  /**
   * Calculate base rate per sq ft
   */
  private calculateBaseRate(inputs: Partial<CPQInput>): number {
    const baseRate = inputs.unitCost || 800;
    
    // Apply pixel pitch multiplier
    const pitchMultiplier = PIXEL_PITCH_MULTIPLIERS[inputs.pixelPitch || 10] || 1.0;
    
    // Apply product class multiplier
    const classMultiplier = PRODUCT_CLASS_MULTIPLIERS[inputs.productClass || 'Scoreboard'] || 1.0;
    
    return baseRate * pitchMultiplier * classMultiplier;
  }

  /**
   * Calculate hardware cost
   */
  private calculateHardwareCost(inputs: Partial<CPQInput>): number {
    const widthFt = inputs.widthFt || 0;
    const heightFt = inputs.heightFt || 0;
    const areaSqFt = widthFt * heightFt;
    
    const baseRate = this.calculateBaseRate(inputs);
    return Math.round(areaSqFt * baseRate);
  }

  /**
   * Calculate structural cost
   */
  private calculateStructuralCost(
    hardwareCost: number,
    inputs: Partial<CPQInput>
  ): number {
    const baseStructural = hardwareCost * 0.20; // 20% of hardware
    
    // Apply shape multiplier
    const shapeMultiplier = SHAPE_MULTIPLIERS[inputs.shape || 'Flat'] || 1.0;
    
    // Apply mounting multiplier
    const mountingMultiplier = MOUNTING_MULTIPLIERS[inputs.mountingType || 'Wall'] || 1.0;
    
    // Apply structure condition multiplier
    const structureMultiplier = STRUCTURE_MULTIPLIERS[inputs.structureCondition || 'Existing'] || 1.0;
    
    return Math.round(baseStructural * shapeMultiplier * mountingMultiplier * structureMultiplier);
  }

  /**
   * Calculate labor cost
   */
  private calculateLaborCost(
    hardwareCost: number,
    structuralCost: number,
    inputs: Partial<CPQInput>
  ): number {
    const baseLabor = (hardwareCost + structuralCost) * 0.15; // 15% of hardware + structural
    
    // Apply access multiplier
    const accessMultiplier = ACCESS_MULTIPLIERS[inputs.access || 'Front'] || 1.0;
    
    // Apply labor type multiplier
    const laborMultiplier = LABOR_MULTIPLIERS[inputs.laborType || 'NonUnion'] || 1.0;
    
    return Math.round(baseLabor * accessMultiplier * laborMultiplier);
  }

  /**
   * Calculate electrical cost
   */
  private calculateElectricalCost(inputs: Partial<CPQInput>): number {
    const powerDistance = inputs.powerDistance || 'Close';
    return POWER_DISTANCE_COSTS[powerDistance] || 0;
  }

  /**
   * Calculate permit cost
   */
  private calculatePermitCost(inputs: Partial<CPQInput>): number {
    const permits = inputs.permits || 'Client';
    return PERMIT_COSTS[permits] || 0;
  }

  /**
   * Calculate control system cost
   */
  private calculateControlSystemCost(inputs: Partial<CPQInput>): number {
    const controlSystem = inputs.controlSystem || 'None';
    return CONTROL_SYSTEM_COSTS[controlSystem] || 0;
  }

  /**
   * Calculate contingency cost
   */
  private calculateContingencyCost(
    subtotal: number,
    inputs: Partial<CPQInput>
  ): number {
    // Only add contingency if New Steel AND Outdoor
    if (inputs.structureCondition === 'NewSteel' && inputs.environment === 'Outdoor') {
      return Math.round(subtotal * CONTINGENCY_PERCENTAGE);
    }
    return 0;
  }

  /**
   * Calculate bond cost
   */
  private calculateBondCost(
    subtotal: number,
    inputs: Partial<CPQInput>
  ): number {
    if (inputs.bondRequired) {
      return Math.round(subtotal * BOND_PERCENTAGE);
    }
    return 0;
  }

  /**
   * Calculate power estimation (Amps @ 120V)
   */
  private calculatePowerAmps(inputs: Partial<CPQInput>): number {
    const widthFt = inputs.widthFt || 0;
    const heightFt = inputs.heightFt || 0;
    const areaSqFt = widthFt * heightFt;
    
    // Outdoor ~ 60W/sqft, Indoor ~ 30W/sqft
    const wattsPerSqFt = inputs.environment === 'Outdoor' ? 60 : 30;
    const totalWatts = areaSqFt * wattsPerSqFt;
    
    // Amps = Watts / Volts (assuming 120V)
    return Math.round(totalWatts / 120);
  }

  /**
   * Calculate complete pricing
   */
  public calculatePrice(inputs: Partial<CPQInput>): CalculationResult {
    const cacheKey = this.generateCacheKey(inputs);
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached.result;
    }
    
    // Calculate costs
    const hardwareCost = this.calculateHardwareCost(inputs);
    const structuralCost = this.calculateStructuralCost(hardwareCost, inputs);
    const laborCost = this.calculateLaborCost(hardwareCost, structuralCost, inputs);
    const electricalCost = this.calculateElectricalCost(inputs);
    const permitCost = this.calculatePermitCost(inputs);
    const controlCost = this.calculateControlSystemCost(inputs);
    
    // Calculate subtotal
    const subtotal = hardwareCost + structuralCost + laborCost + electricalCost + permitCost + controlCost;
    
    // Calculate contingency
    const contingencyCost = this.calculateContingencyCost(subtotal, inputs);
    
    // Calculate bond
    const bondCost = this.calculateBondCost(subtotal, inputs);
    
    // Calculate margin
    const margin = inputs.targetMargin !== undefined ? inputs.targetMargin / 100 : DEFAULT_MARGIN;
    const marginAmount = subtotal * margin;
    
    // Calculate sell price
    const sellPrice = subtotal + marginAmount + contingencyCost + bondCost;
    
    // Calculate power amps
    const powerAmps = this.calculatePowerAmps(inputs);
    
    // Calculate area
    const sqFt = (inputs.widthFt || 0) * (inputs.heightFt || 0);
    
    const result: CalculationResult = {
      sqFt,
      hardwareCost,
      structuralCost,
      laborCost,
      pmCost: 0,
      expenseCost: electricalCost,
      bondCost,
      contingencyCost,
      totalCost: subtotal,
      sellPrice,
      margin,
      powerAmps
    };
    
    // Cache result
    this.cache.set(cacheKey, {
      key: cacheKey,
      result,
      timestamp: Date.now()
    });
    
    return result;
  }

  /**
   * Invalidate cache (call when fields change)
   */
  public invalidateCache(): void {
    this.cache.clear();
  }

  /**
   * Check if pricing should be recalculated based on changed field
   */
  public shouldRecalculate(changedField: keyof CPQInput): boolean {
    const pricingFields: (keyof CPQInput)[] = [
      'productClass',
      'pixelPitch',
      'widthFt',
      'heightFt',
      'environment',
      'shape',
      'mountingType',
      'access',
      'structureCondition',
      'laborType',
      'powerDistance',
      'permits',
      'controlSystem',
      'bondRequired',
      'unitCost',
      'targetMargin'
    ];
    
    return pricingFields.includes(changedField);
  }
}

// Export singleton instance
export const pricingService = new PricingService();

/**
 * Convenience function to calculate price
 */
export function calculatePrice(inputs: Partial<CPQInput>): CalculationResult {
  return pricingService.calculatePrice(inputs);
}

/**
 * Convenience function to invalidate cache
 */
export function invalidatePriceCache(): void {
  pricingService.invalidateCache();
}

/**
 * Convenience function to check if recalculation is needed
 */
export function shouldRecalculatePrice(changedField: keyof CPQInput): boolean {
  return pricingService.shouldRecalculate(changedField);
}