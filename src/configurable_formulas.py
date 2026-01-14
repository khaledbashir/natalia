"""
ANC Configurable Formula Engine
Question-driven calculation system with placeholder formulas
that can be easily replaced with real ANC pricing data
"""

from dataclasses import dataclass
from typing import Dict, List, Optional, Any
from enum import Enum


class QuestionType(Enum):
    SELECT = "select"
    NUMBER = "number"
    BOOLEAN = "boolean"


@dataclass
class FormulaOption:
    """Each answer option maps to a specific formula"""

    value: str
    label: str
    formula_key: str  # References a formula in the formula bank
    description: str  # What this option means for pricing


@dataclass
class PricingQuestion:
    """Questions that drive pricing calculations"""

    id: str
    category: str  # LED, Structural, Labor, etc.
    question: str
    type: QuestionType
    options: List[FormulaOption]
    required: bool = True
    impact_description: str = ""  # How this affects total cost


@dataclass
class FormulaDefinition:
    """Defines how to calculate costs for each option"""

    key: str
    base_calculation: str  # Placeholder formula
    parameters: List[str]  # What variables it needs
    real_formula_note: str  # Where real ANC formula goes
    unit: str = ""  # $, hours, etc.


class ANCFormulaBank:
    """Bank of configurable formulas - PLACEHOLDER VALUES"""

    def __init__(self):
        self.formulas = {
            # LED HARDWARE FORMULAS
            "led_indoor_standard": FormulaDefinition(
                key="led_indoor_standard",
                base_calculation="sq_ft * 1800",  # Placeholder: $1800/sqft
                parameters=["sq_ft"],
                real_formula_note="REPLACE WITH: ANC actual cost per sqft for indoor displays",
                unit="$",
            ),
            "led_outdoor_standard": FormulaDefinition(
                key="led_outdoor_standard",
                base_calculation="sq_ft * 2000",  # Placeholder: $2000/sqft
                parameters=["sq_ft"],
                real_formula_note="REPLACE WITH: ANC actual cost per sqft for outdoor displays",
                unit="$",
            ),
            "led_fine_pitch": FormulaDefinition(
                key="led_fine_pitch",
                base_calculation="sq_ft * 2500",  # Placeholder: premium for fine pitch
                parameters=["sq_ft"],
                real_formula_note="REPLACE WITH: ANC fine pitch premium multiplier",
                unit="$",
            ),
            # STRUCTURAL FORMULAS
            "struct_existing_good": FormulaDefinition(
                key="struct_existing_good",
                base_calculation="hardware_cost * 0.15",  # Placeholder: 15% of hardware
                parameters=["hardware_cost"],
                real_formula_note="REPLACE WITH: ANC structural multiplier for good existing steel",
                unit="$",
            ),
            "struct_new_steel": FormulaDefinition(
                key="struct_new_steel",
                base_calculation="hardware_cost * 0.35 + 25000",  # Placeholder
                parameters=["hardware_cost"],
                real_formula_note="REPLACE WITH: ANC new steel calculation (materials + labor)",
                unit="$",
            ),
            # LABOR FORMULAS
            "labor_non_union": FormulaDefinition(
                key="labor_non_union",
                base_calculation="total_hours * 45",  # Placeholder: $45/hr
                parameters=["total_hours"],
                real_formula_note="REPLACE WITH: ANC non-union labor rates by region/season",
                unit="$",
            ),
            "labor_union": FormulaDefinition(
                key="labor_union",
                base_calculation="total_hours * 75",  # Placeholder: $75/hr
                parameters=["total_hours"],
                real_formula_note="REPLACE WITH: ANC union labor rates (local/travel/prevailing)",
                unit="$",
            ),
            # INSTALLATION ACCESS FORMULAS
            "access_front_only": FormulaDefinition(
                key="access_front_only",
                base_calculation="base_labor * 1.2",  # Placeholder: 20% premium
                parameters=["base_labor"],
                real_formula_note="REPLACE WITH: ANC front-access installation premium",
                unit="$",
            ),
            "access_rear_service": FormulaDefinition(
                key="access_rear_service",
                base_calculation="base_labor * 1.0",  # Placeholder: standard rate
                parameters=["base_labor"],
                real_formula_note="REPLACE WITH: ANC rear-access standard rates",
                unit="$",
            ),
            # ELECTRICAL FORMULAS
            "electrical_close_power": FormulaDefinition(
                key="electrical_close_power",
                base_calculation="5000 + (distance * 25)",  # Placeholder
                parameters=["distance"],
                real_formula_note="REPLACE WITH: ANC electrical run cost formula",
                unit="$",
            ),
            "electrical_far_power": FormulaDefinition(
                key="electrical_far_power",
                base_calculation="15000 + (distance * 50)",  # Placeholder
                parameters=["distance"],
                real_formula_note="REPLACE WITH: ANC long electrical run formula",
                unit="$",
            ),
            # PROJECT MANAGEMENT FORMULAS
            "pm_standard": FormulaDefinition(
                key="pm_standard",
                base_calculation="subtotal * 0.08",  # Placeholder: 8%
                parameters=["subtotal"],
                real_formula_note="REPLACE WITH: ANC PM overhead calculation",
                unit="$",
            ),
            "pm_complex": FormulaDefinition(
                key="pm_complex",
                base_calculation="subtotal * 0.12",  # Placeholder: 12%
                parameters=["subtotal"],
                real_formula_note="REPLACE WITH: ANC complex project PM rates",
                unit="$",
            ),
        }

    def get_formula(self, key: str) -> FormulaDefinition:
        return self.formulas.get(key, self.formulas["led_indoor_standard"])

    def calculate(self, formula_key: str, variables: Dict[str, float]) -> float:
        """Execute formula with given variables"""
        formula = self.get_formula(formula_key)

        # For now, use simple placeholder calculations
        # Natalia will replace these with real ANC formulas

        if formula_key == "led_indoor_standard":
            return variables.get("sq_ft", 0) * 1800
        elif formula_key == "led_outdoor_standard":
            return variables.get("sq_ft", 0) * 2000
        elif formula_key == "led_fine_pitch":
            return variables.get("sq_ft", 0) * 2500
        elif formula_key == "struct_existing_good":
            return variables.get("hardware_cost", 0) * 0.15
        elif formula_key == "struct_new_steel":
            return variables.get("hardware_cost", 0) * 0.35 + 25000
        elif formula_key == "labor_non_union":
            return variables.get("total_hours", 0) * 45
        elif formula_key == "labor_union":
            return variables.get("total_hours", 0) * 75
        elif formula_key == "access_front_only":
            return variables.get("base_labor", 0) * 1.2
        elif formula_key == "access_rear_service":
            return variables.get("base_labor", 0) * 1.0
        elif formula_key == "electrical_close_power":
            return 5000 + (variables.get("distance", 0) * 25)
        elif formula_key == "electrical_far_power":
            return 15000 + (variables.get("distance", 0) * 50)
        elif formula_key == "pm_standard":
            return variables.get("subtotal", 0) * 0.08
        elif formula_key == "pm_complex":
            return variables.get("subtotal", 0) * 0.12
        else:
            return 0.0


# QUESTION BANK - Maps user answers to specific formulas
ANC_QUESTIONS = [
    # LED DISPLAY QUESTIONS
    PricingQuestion(
        id="environment",
        category="LED Hardware",
        question="Is this display for indoor or outdoor use?",
        type=QuestionType.SELECT,
        options=[
            FormulaOption(
                "indoor", "Indoor", "led_indoor_standard", "Standard indoor LED panels"
            ),
            FormulaOption(
                "outdoor",
                "Outdoor",
                "led_outdoor_standard",
                "Weatherproof outdoor panels (+15%)",
            ),
        ],
        impact_description="Outdoor displays require weatherproofing and special mounting",
    ),
    PricingQuestion(
        id="pixel_pitch",
        category="LED Hardware",
        question="What pixel pitch do you need?",
        type=QuestionType.SELECT,
        options=[
            FormulaOption(
                "16",
                "16mm (Coarse/Outdoor)",
                "led_outdoor_standard",
                "Standard outdoor viewing",
            ),
            FormulaOption(
                "10",
                "10mm (Standard)",
                "led_indoor_standard",
                "Standard indoor viewing",
            ),
            FormulaOption(
                "6", "6mm (Fine)", "led_fine_pitch", "Close viewing applications (+25%)"
            ),
            FormulaOption(
                "4", "4mm (Ultra Fine)", "led_fine_pitch", "Very close viewing (+50%)"
            ),
        ],
        impact_description="Finer pixel pitch increases cost significantly",
    ),
    # STRUCTURAL QUESTIONS
    PricingQuestion(
        id="structure_condition",
        category="Structural Requirements",
        question="What's the condition of the existing structure for mounting?",
        type=QuestionType.SELECT,
        options=[
            FormulaOption(
                "existing-good",
                "Existing Structure - Good Condition",
                "struct_existing_good",
                "Use existing steel with minor modifications",
            ),
            FormulaOption(
                "existing-repair",
                "Existing Structure - Requires Repair",
                "struct_existing_good",
                "Structural reinforcement needed",
            ),
            FormulaOption(
                "new-steel",
                "New Steel Structure Required",
                "struct_new_steel",
                "Complete new steel framework (+$25k base)",
            ),
        ],
        impact_description="New steel significantly increases structural costs",
    ),
    # LABOR QUESTIONS
    PricingQuestion(
        id="labor_type",
        category="Labor Analysis",
        question="What are the labor requirements for this venue?",
        type=QuestionType.SELECT,
        options=[
            FormulaOption(
                "non-union",
                "Non-Union (Standard)",
                "labor_non_union",
                "Standard labor rates",
            ),
            FormulaOption(
                "union",
                "Union Labor Required",
                "labor_union",
                "Union wage rates (+67%)",
            ),
            FormulaOption(
                "prevailing",
                "Prevailing Wage",
                "labor_union",
                "Government wage requirements (+78%)",
            ),
        ],
        impact_description="Union requirements significantly increase labor costs",
    ),
    # INSTALLATION ACCESS QUESTIONS
    PricingQuestion(
        id="service_access",
        category="Installation Assessment",
        question="Will technicians access the display from the front or rear for service?",
        type=QuestionType.SELECT,
        options=[
            FormulaOption(
                "front",
                "Front Access Only",
                "access_front_only",
                "Service from front only (+20% labor)",
            ),
            FormulaOption(
                "rear",
                "Rear Access Available",
                "access_rear_service",
                "Standard rear service access",
            ),
            FormulaOption(
                "both",
                "Both Front and Rear Access",
                "access_rear_service",
                "Optimal service access",
            ),
        ],
        impact_description="Front-only access increases installation complexity",
    ),
    # ELECTRICAL QUESTIONS
    PricingQuestion(
        id="power_distance",
        category="Electrical Systems",
        question="How far is the display location from the main electrical panel?",
        type=QuestionType.SELECT,
        options=[
            FormulaOption(
                "close",
                "Under 50 feet",
                "electrical_close_power",
                "Short electrical run",
            ),
            FormulaOption(
                "medium",
                "50-150 feet",
                "electrical_close_power",
                "Medium electrical run",
            ),
            FormulaOption(
                "far",
                "Over 150 feet",
                "electrical_far_power",
                "Long electrical run (+$10k base)",
            ),
        ],
        impact_description="Longer electrical runs require more materials and labor",
    ),
    # PROJECT COMPLEXITY QUESTIONS
    PricingQuestion(
        id="complexity",
        category="Professional Services",
        question="What's the overall installation complexity?",
        type=QuestionType.SELECT,
        options=[
            FormulaOption(
                "standard", "Standard", "pm_standard", "Typical installation complexity"
            ),
            FormulaOption(
                "high",
                "High Complexity",
                "pm_complex",
                "Complex installation (+50% PM)",
            ),
        ],
        impact_description="Complex installations require more project management oversight",
    ),
]

# DOCUMENTATION FOR NATALIA
ANC_FORMULA_DOCUMENTATION = """
ANC SPORTS ENTERPRISES - FORMULA REPLACEMENT GUIDE

PLACEHOLDER VALUES CURRENTLY USED:
- LED Hardware: $1,800-$2,500/sq ft (industry standard)
- Structural: 15-35% of hardware cost
- Labor: $45-75/hour (varies by union status)
- Electrical: $5,000-$15,000 + distance costs
- Project Management: 8-12% of subtotal

TO REPLACE WITH REAL ANC FORMULAS:

1. LED HARDWARE FORMULAS:
   Current: sq_ft * 1800 (placeholder)
   Replace with: ANC actual cost per sqft by:
   - Indoor vs Outdoor
   - Pixel pitch (4mm, 6mm, 10mm, 16mm)
   - Product type (Scoreboard, Ribbon, etc.)

2. STRUCTURAL FORMULAS:
   Current: hardware_cost * 0.15 (placeholder)
   Replace with: ANC actual structural calculations for:
   - Existing good steel
   - Existing steel requiring repair
   - New steel structure
   - Foundation requirements

3. LABOR FORMULAS:
   Current: hours * 45/75 (placeholder)
   Replace with: ANC actual labor rates:
   - Non-union rates by region/season
   - Union local rates
   - Union travel rates
   - Prevailing wage rates
   - Crew composition and hourly rates

4. INSTALLATION ACCESS FORMULAS:
   Current: base_labor * 1.2 (placeholder)
   Replace with: ANC actual access premiums:
   - Front-only service access
   - Rear service access
   - Crane requirements
   - Rigging complexity

5. ELECTRICAL FORMULAS:
   Current: 5000 + (distance * 25) (placeholder)
   Replace with: ANC actual electrical costs:
   - PDU specifications and costs
   - Cable/conduit per foot costs
   - Licensed electrician rates
   - Panel upgrade requirements

6. PROJECT MANAGEMENT FORMULAS:
   Current: subtotal * 0.08 (placeholder)
   Replace with: ANC actual PM overhead:
   - Standard project management rates
   - Complex project multipliers
   - Duration-based adjustments

NEXT STEPS FOR NATALIA:
1. Replace the base_calculation strings in FormulaDefinition objects
2. Update the calculate() method in ANCFormulaBank
3. Test with known ANC projects to validate
4. Adjust question options if needed based on real data
"""
