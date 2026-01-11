export type ProductClass = 'Ribbon' | 'Scoreboard' | 'CenterHung' | 'Vomitory';
export type Environment = 'Indoor' | 'Outdoor';
export type Shape = 'Flat' | 'Curved';
export type Access = 'Front' | 'Rear';
export type Complexity = 'Standard' | 'High';
export type MountingType = 'Wall' | 'Ground' | 'Rigging' | 'Pole';
export type LaborType = 'NonUnion' | 'Union' | 'Prevailing';
export type PowerDistance = 'Close' | 'Medium' | 'Far';
export type PermitType = 'Client' | 'ANC' | 'Existing';
export type ControlSystem = 'Include' | 'None';

export interface ScreenConfig {
    id: string;
    productClass: ProductClass;
    widthFt: number;
    heightFt: number;
    pixelPitch: number;
    environment: Environment;
    shape: Shape;
    access: Access;
    complexity: Complexity;
}

export interface CPQInput {
    // 1. Metadata
    clientName: string;
    address: string;
    projectName: string;
    addressConfirmed?: boolean;

    // 2. Class (Main screen or aggregate)
    productClass: ProductClass;

    // 3. Dimensions
    widthFt: number;
    heightFt: number;

    // 4. Pitch
    pixelPitch: number;

    // 5. Environment
    environment: Environment;

    // 6. Shape
    shape: Shape;

    // 7. Access
    access: Access;

    // 8. Complexity
    complexity: Complexity;

    // 9. Structure & Mounting
    mountingType?: MountingType;
    structureCondition?: 'Existing' | 'NewSteel';

    // 10. Labor
    laborType?: LaborType;

    // 11. Project
    powerDistance?: PowerDistance;
    permits?: PermitType;
    controlSystem?: ControlSystem;
    bondRequired?: boolean;

    // 12. Pricing
    unitCost?: number;
    targetMargin?: number;

    // 13. Multi-screen
    screens?: ScreenConfig[];
}

export interface CalculationResult {
    sqFt: number;
    hardwareCost: number;
    structuralCost: number;
    laborCost: number;
    pmCost: number;
    expenseCost: number;
    bondCost: number;
    totalCost: number;
    sellPrice: number;
    margin: number;
    contingencyCost: number;
    powerAmps: number;
}
