import json
import os
from dataclasses import dataclass
from typing import Dict, Optional

# Constants matching TypeScript logic
CONFIG = {
    "multipliers": {
        "structural": 0.20,
        "labor": 0.15,
        "shipping": 0.05,
        "bond": 0.01
    },
    "defaults": {
        "margin": 0.30
    }
}

@dataclass
class CPQInput:
    client_name: str
    product_class: str 
    pixel_pitch: float
    width_ft: float
    height_ft: float
    is_outdoor: bool
    shape: str 
    access: str 
    complexity: str
    # Value-Add Fields
    unit_cost: Optional[float] = 0.0
    target_margin: Optional[float] = 0.0

class CPQCalculator:
    def __init__(self, catalog=None):
        self.catalog = catalog

    def calculate_quote(self, project_input: CPQInput) -> Dict:
        # 1. Secure Pricing Module (Industry Averages or Manual Override)
        base_rate = 0.0
        
        # Check for Manual Override first
        if project_input.unit_cost and float(project_input.unit_cost) > 0:
            base_rate = float(project_input.unit_cost)
        else:
            # Fallback to Industry Averages
            PRICING_TABLE = {
                10: { "Indoor": 1200.0, "Outdoor": 1800.0 }, # 10mm
                6:  { "Indoor": 1800.0, "Outdoor": 2400.0 }, # 6mm
                4:  { "Indoor": 2500.0, "Outdoor": 3200.0 }  # 4mm
            }
            
            # Default to 10mm Indoor if not found
            pitch_key = int(project_input.pixel_pitch) if int(project_input.pixel_pitch) in PRICING_TABLE else 10
            env_key = "Outdoor" if project_input.is_outdoor else "Indoor"
            
            base_rate = PRICING_TABLE.get(pitch_key, {}).get(env_key, 1200.0)
            
            # Ribbon surcharge
            if project_input.product_class == 'Ribbon': 
                base_rate *= 1.20 # 20% premium for custom cabinet

        
        # 2. Raw Costs (Internal)
        sq_ft = project_input.width_ft * project_input.height_ft
        raw_hardware_cost = sq_ft * base_rate
        
        # 3. Structural Rule (20% of Hardware)
        raw_structural_cost = raw_hardware_cost * CONFIG["multipliers"]["structural"]
        
        # 4. Labor Rule (15% of Hardware + Structural)
        raw_labor_cost = (raw_hardware_cost + raw_structural_cost) * CONFIG["multipliers"]["labor"]
        
        # 5. Expenses Rule (5% of Hardware)
        raw_expense_cost = raw_hardware_cost * CONFIG["multipliers"]["shipping"]
        
        # 6. Apply Margin (Manual or Default)
        margin = CONFIG["defaults"]["margin"]
        if project_input.target_margin and float(project_input.target_margin) > 0:
            margin = float(project_input.target_margin) / 100.0 # Convert 20 -> 0.20
            
        markup_factor = 1 / (1 - margin)
        
        hardware_cost = round(raw_hardware_cost * markup_factor)
        structural_cost = round(raw_structural_cost * markup_factor)
        labor_cost = round(raw_labor_cost * markup_factor)
        expense_cost = round(raw_expense_cost * markup_factor)
        
        # 7. Subtotal (Sum of marked-up lines)
        sub_total = hardware_cost + structural_cost + labor_cost + expense_cost
        
        # 8. Bond (1% of subtotal)
        bond_cost = round(sub_total * CONFIG["multipliers"]["bond"])

        # 9. Dynamic Contingency (Value Add)
        # "If New Steel + Outdoor -> Add 5% Risk Contingency"
        contingency_cost = 0
        if project_input.complexity == 'High' or (project_input.is_outdoor and project_input.structure_condition == 'NewSteel'):
             contingency_cost = round(sub_total * 0.05)
        
        # 10. Final Sell Price
        sell_price = sub_total + bond_cost + contingency_cost
        
        return {
            "inputs": project_input,
            "math": {
                "sq_ft": sq_ft,
                "base_rate": base_rate,
                "raw_hardware_cost": raw_hardware_cost,
                "raw_structural_cost": raw_structural_cost,
                "raw_labor_cost": raw_labor_cost,
                "raw_expense_cost": raw_expense_cost,
                "margin_pct": margin,
                "markup_factor": markup_factor,
                "hardware_cost": hardware_cost,
                "structural_cost": structural_cost,
                "labor_cost": labor_cost,
                "expense_cost": expense_cost,
                "bond_cost": bond_cost,
                "contingency_cost": contingency_cost,
                "sell_price": sell_price
            }
        }
