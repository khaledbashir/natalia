export type ProductClass = 'Ribbon' | 'Scoreboard' | 'CenterHung';
export type Environment = 'Indoor' | 'Outdoor';
export type Shape = 'Flat' | 'Curved';
export type Access = 'Front' | 'Rear';
export type Complexity = 'Standard' | 'High';

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

    // 9. Value-Add Fields
    structureCondition?: 'Existing' | 'NewSteel';
    unitCost?: number;
    targetMargin?: number;
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
