# ANC CPQ Pricing Engine Reference

## 1. Base Hardware Rates (per SqFt)
*   **Standard Indoor**: $800
*   **Ribbon Board**: $1,200
*   **Center Hung**: +30% on base rate
*   **Vomitory**: +15% on base rate
*   **Outdoor Premium**: +$200 per SqFt

## 2. Pixel Pitch Modifiers
*   **Fine Pitch (<= 4mm)**: +$400 per SqFt premium
*   **Ultra Fine (<= 2.5mm)**: +$800 per SqFt premium
*   **Standard (10mm)**: Base rate
*   **Coarse (16mm)**: -15% on base rate

## 3. Structural Costs (% of Hardware Cost)
*   **Base Rate**: 20%
*   **Outdoor Modifier**: +5% (Wind Load)
*   **New Steel Required**: +15%
*   **Rigging/Flown**: +10%
*   **Curved Configuration**: +5%

## 4. Labor Costs (% of Hardware + Structural)
*   **Base Rate**: 15%
*   **Union Labor**: +15% (30% total)
*   **Prevailing Wage**: +10% (25% total)
*   **Rear Access**: +2% (Installation complexity)

## 5. Expenses & Financials
*   **Shipping & Logistics**: 5% of Hardware Cost
*   **Performance Bond**: 1% of Total Contract
*   **Target Margin**: 30% (Default)
*   **Markup Calculation**: `Sell Price = Total Cost / (1 - Target Margin)`

## 6. Power Calculations
*   **Indoor**: 35 Watts per SqFt
*   **Outdoor**: 65 Watts per SqFt
*   **Amps (120V)**: totalWatts / 120

## 7. Cost Breakdown Distribution (Sell Price)
*   Hardware: 95% of Base Hardware Sell
*   Structural Materials: 65% of Structural Sell
*   Structural Labor: 35% of Structural Sell
*   LED Installation: 45% of Labor Sell
*   CMS Equipment: 5% of Hardware Sell
*   Project Management: 20% of Expense Sell
*   Travel & Expenses: 40% of Expense Sell
*   Engineering: 15% of Expense Sell
*   Final Commissioning: 30% of Labor Sell
*   Remaining % distributed to Materials/Labor/Permits.
