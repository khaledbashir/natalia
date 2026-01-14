"""
ANC Configurable Calculator
Question-driven pricing engine with placeholder formulas
that Natalia can easily replace with real ANC data
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from configurable_formulas import (
    ANCFormulaBank,
    ANC_QUESTIONS,
    FormulaDefinition,
    ANC_FORMULA_DOCUMENTATION,
)
from calculator import CPQInput


@dataclass
class QuestionAnswer:
    question_id: str
    answer_value: str
    answer_label: str
    formula_key: str


@dataclass
class CalculationResult:
    category: str
    description: str
    raw_cost: float
    calculation: str
    formula_key: str
    real_formula_note: str


class ANCConfigurableCalculator:
    """Question-driven calculator with placeholder formulas for ANC"""

    def __init__(self):
        self.formula_bank = ANCFormulaBank()
        self.questions = ANC_QUESTIONS

    def calculate_quote(self, project_input: CPQInput) -> Dict[str, Any]:
        """Main calculation method using question-driven formulas"""

        # Convert CPQInput to question answers
        question_answers = self._map_input_to_answers(project_input)

        # Calculate each category using question-driven formulas
        results = {}

        # 1. LED Hardware
        led_results = self._calculate_led_hardware(project_input, question_answers)
        results.update(led_results)

        # 2. Structural Requirements
        structural_results = self._calculate_structural(project_input, question_answers)
        results.update(structural_results)

        # 3. LED Installation Labor
        led_labor_result = self._calculate_led_installation(
            project_input, question_answers
        )
        results["led_installation"] = led_labor_result

        # 4. Electrical Systems
        electrical_results = self._calculate_electrical(project_input, question_answers)
        results.update(electrical_results)

        # 5. CMS Systems
        cms_results = self._calculate_cms(project_input, question_answers)
        results.update(cms_results)

        # 6. Project Management
        pm_result = self._calculate_project_management(project_input, question_answers)
        results["project_management"] = pm_result

        # 7. General Conditions
        gc_result = self._calculate_general_conditions(project_input, question_answers)
        results["general_conditions"] = gc_result

        # 8. Travel & Expenses
        travel_result = self._calculate_travel(project_input, question_answers)
        results["travel"] = travel_result

        # 9. Submittals
        submittals_result = self._calculate_submittals(project_input, question_answers)
        results["submittals"] = submittals_result

        # 10. Engineering
        engineering_result = self._calculate_engineering(
            project_input, question_answers
        )
        results["engineering"] = engineering_result

        # 11. Permits
        permits_result = self._calculate_permits(project_input, question_answers)
        results["permits"] = permits_result

        # 12. Final Commissioning
        commissioning_result = self._calculate_final_commissioning(
            project_input, question_answers
        )
        results["final_commissioning"] = commissioning_result

        # 13. Bond (optional)
        bond_result = self._calculate_bond(project_input, question_answers)
        results["bond"] = bond_result

        # 14. Contingency
        contingency_result = self._calculate_contingency(
            project_input, question_answers
        )
        results["contingency"] = contingency_result

        # 15. Service Contract
        service_result = self._calculate_service_contract(
            project_input, question_answers
        )
        results["service_contract"] = service_result

        # Calculate totals and summary
        return self._compile_results(results, project_input)

    def _map_input_to_answers(self, project_input: CPQInput) -> List[QuestionAnswer]:
        """Convert CPQInput to question-based answers"""
        answers = []

        # Environment (Indoor/Outdoor)
        if project_input.is_outdoor:
            answers.append(
                QuestionAnswer(
                    "environment", "outdoor", "Outdoor", "led_outdoor_standard"
                )
            )
        else:
            answers.append(
                QuestionAnswer("environment", "indoor", "Indoor", "led_indoor_standard")
            )

        # Pixel Pitch
        pitch_map = {4: "4", 6: "6", 10: "10", 16: "16"}
        pitch_str = pitch_map.get(int(project_input.pixel_pitch), "10")
        if int(project_input.pixel_pitch) <= 6:
            answers.append(
                QuestionAnswer(
                    "pixel_pitch", pitch_str, f"{pitch_str}mm", "led_fine_pitch"
                )
            )
        elif project_input.is_outdoor:
            answers.append(
                QuestionAnswer(
                    "pixel_pitch", pitch_str, f"{pitch_str}mm", "led_outdoor_standard"
                )
            )
        else:
            answers.append(
                QuestionAnswer(
                    "pixel_pitch", pitch_str, f"{pitch_str}mm", "led_indoor_standard"
                )
            )

        # Structure Condition
        if project_input.structure_condition == "newsteel":
            answers.append(
                QuestionAnswer(
                    "structure_condition",
                    "new-steel",
                    "New Steel Structure Required",
                    "struct_new_steel",
                )
            )
        else:
            answers.append(
                QuestionAnswer(
                    "structure_condition",
                    "existing-good",
                    "Existing Structure - Good Condition",
                    "struct_existing_good",
                )
            )

        # Labor Type
        if project_input.labor_type == "Union":
            answers.append(
                QuestionAnswer(
                    "labor_type", "union", "Union Labor Required", "labor_union"
                )
            )
        elif project_input.labor_type == "Prevailing":
            answers.append(
                QuestionAnswer(
                    "labor_type", "prevailing", "Prevailing Wage", "labor_union"
                )
            )
        else:
            answers.append(
                QuestionAnswer(
                    "labor_type", "non-union", "Non-Union (Standard)", "labor_non_union"
                )
            )

        # Service Access (default to rear for now)
        answers.append(
            QuestionAnswer(
                "service_access", "rear", "Rear Access Available", "access_rear_service"
            )
        )

        # Power Distance
        if project_input.power_distance == "Far":
            answers.append(
                QuestionAnswer(
                    "power_distance", "far", "Over 150 feet", "electrical_far_power"
                )
            )
        elif project_input.power_distance == "Medium":
            answers.append(
                QuestionAnswer(
                    "power_distance", "medium", "50-150 feet", "electrical_close_power"
                )
            )
        else:
            answers.append(
                QuestionAnswer(
                    "power_distance", "close", "Under 50 feet", "electrical_close_power"
                )
            )

        # Project Complexity (default to standard)
        answers.append(
            QuestionAnswer("complexity", "standard", "Standard", "pm_standard")
        )

        return answers

    def _calculate_led_hardware(
        self, project_input: CPQInput, answers: List[QuestionAnswer]
    ) -> Dict[str, CalculationResult]:
        """Calculate LED hardware costs based on questions"""
        sq_ft = project_input.width_ft * project_input.height_ft

        # Find the LED formula from answers
        led_answer = next(
            (a for a in answers if a.question_id in ["environment", "pixel_pitch"]),
            None,
        )
        if led_answer and led_answer.formula_key in ["led_fine_pitch"]:
            formula_key = "led_fine_pitch"
        elif led_answer and project_input.is_outdoor:
            formula_key = "led_outdoor_standard"
        else:
            formula_key = "led_indoor_standard"

        raw_cost = self.formula_bank.calculate(formula_key, {"sq_ft": sq_ft})
        formula = self.formula_bank.get_formula(formula_key)

        return {
            "hardware": CalculationResult(
                category="Hardware",
                description="LED display panels, cabinets, mounting hardware",
                raw_cost=raw_cost,
                calculation=f"{sq_ft} sq ft × ${raw_cost / sq_ft:.0f}/sq ft",
                formula_key=formula_key,
                real_formula_note=formula.real_formula_note,
            )
        }

    def _calculate_structural(
        self, project_input: CPQInput, answers: List[QuestionAnswer]
    ) -> Dict[str, CalculationResult]:
        """Calculate structural costs based on questions"""
        hardware_cost = self.formula_bank.calculate(
            "led_indoor_standard",
            {"sq_ft": project_input.width_ft * project_input.height_ft},
        )

        # Find structural formula from answers
        struct_answer = next(
            (a for a in answers if a.question_id == "structure_condition"), None
        )
        if struct_answer and struct_answer.formula_key == "struct_new_steel":
            formula_key = "struct_new_steel"
        else:
            formula_key = "struct_existing_good"

        # Calculate materials and labor separately
        materials_cost = self.formula_bank.calculate(
            formula_key, {"hardware_cost": hardware_cost}
        )

        # Split into materials and labor (approximate split)
        if formula_key == "struct_new_steel":
            materials_raw = materials_cost * 0.6  # 60% materials
            labor_raw = materials_cost * 0.4  # 40% labor
        else:
            materials_raw = materials_cost * 0.5  # 50% materials
            labor_raw = materials_cost * 0.5  # 50% labor

        formula = self.formula_bank.get_formula(formula_key)

        return {
            "structural_materials": CalculationResult(
                category="Structural Materials",
                description="Steel, truss, concrete, fasteners",
                raw_cost=materials_raw,
                calculation=f"Hardware cost × {materials_raw / hardware_cost:.0%} (condition factor)",
                formula_key=f"{formula_key}_materials",
                real_formula_note=formula.real_formula_note,
            ),
            "structural_labor": CalculationResult(
                category="Structural Labor",
                description="Structural installation labor",
                raw_cost=labor_raw,
                calculation=f"Hardware cost × {labor_raw / hardware_cost:.0%} (labor factor)",
                formula_key=f"{formula_key}_labor",
                real_formula_note=formula.real_formula_note,
            ),
        }

    def _calculate_led_installation(
        self, project_input: CPQInput, answers: List[QuestionAnswer]
    ) -> CalculationResult:
        """Calculate LED installation labor based on questions"""
        sq_ft = project_input.width_ft * project_input.height_ft

        # Base installation hours (placeholder)
        base_hours = sq_ft * 0.5  # 0.5 hours per sq ft placeholder

        # Apply access modifier
        access_answer = next(
            (a for a in answers if a.question_id == "service_access"), None
        )
        if access_answer and access_answer.formula_key == "access_front_only":
            total_hours = base_hours * 1.2  # 20% premium for front access
            access_note = " (+20% front access premium)"
        else:
            total_hours = base_hours
            access_note = ""

        # Labor cost based on union status
        labor_answer = next((a for a in answers if a.question_id == "labor_type"), None)
        if labor_answer and labor_answer.formula_key == "labor_union":
            hourly_rate = 75  # Placeholder union rate
            formula_key = "labor_union"
        else:
            hourly_rate = 45  # Placeholder non-union rate
            formula_key = "labor_non_union"

        raw_cost = self.formula_bank.calculate(
            formula_key, {"total_hours": total_hours}
        )
        formula = self.formula_bank.get_formula(formula_key)

        return CalculationResult(
            category="LED Installation (Labor)",
            description="Display mounting, alignment, testing",
            raw_cost=raw_cost,
            calculation=f"{total_hours:.1f} hours × blended rate ${hourly_rate}/hr{access_note}",
            formula_key=formula_key,
            real_formula_note=formula.real_formula_note,
        )

    def _calculate_electrical(
        self, project_input: CPQInput, answers: List[QuestionAnswer]
    ) -> Dict[str, CalculationResult]:
        """Calculate electrical costs based on questions"""

        # Base electrical costs (placeholder)
        pdu_cost = 5000
        switch_cost = 5000

        # Distance-based costs
        power_answer = next(
            (a for a in answers if a.question_id == "power_distance"), None
        )
        if power_answer and power_answer.formula_key == "electrical_far_power":
            distance = 200  # Assume far distance
            formula_key = "electrical_far_power"
            cabling_cost = distance * 50  # $50/ft placeholder
        else:
            distance = 100  # Assume medium distance
            formula_key = "electrical_close_power"
            cabling_cost = distance * 25  # $25/ft placeholder

        materials_cost = self.formula_bank.calculate(
            formula_key, {"distance": distance}
        )

        # Split materials and labor
        materials_raw = pdu_cost + cabling_cost + switch_cost
        electrical_labor_hours = 80  # Placeholder hours
        labor_raw = self.formula_bank.calculate(
            "labor_union", {"total_hours": electrical_labor_hours}
        )

        formula = self.formula_bank.get_formula(formula_key)

        return {
            "electrical_materials": CalculationResult(
                category="Electrical & Data - Materials",
                description="PDUs, cabling, switches, equipment",
                raw_cost=materials_raw,
                calculation=f"PDU: ${pdu_cost} + Cabling: ${cabling_cost} + Switches: ${switch_cost}",
                formula_key=f"{formula_key}_materials",
                real_formula_note=formula.real_formula_note,
            ),
            "electrical_labor": CalculationResult(
                category="Electrical & Data - Subcontracting",
                description="Licensed electrical contractor installation",
                raw_cost=labor_raw,
                calculation=f"{electrical_labor_hours} hours × $150/hr",
                formula_key="electrical_labor",
                real_formula_note="REPLACE WITH: ANC licensed electrician rates",
            ),
        }

    def _calculate_cms(
        self, project_input: CPQInput, answers: List[QuestionAnswer]
    ) -> Dict[str, CalculationResult]:
        """Calculate CMS costs (placeholder for now)"""
        # Placeholder CMS calculations
        cms_equipment_cost = 0  # Assume client provides
        player_cost = 3500
        installation_hours = 20
        commissioning_hours = 10

        cms_installation_cost = self.formula_bank.calculate(
            "labor_union", {"total_hours": installation_hours}
        )
        cms_commissioning_cost = self.formula_bank.calculate(
            "labor_union", {"total_hours": commissioning_hours}
        )

        return {
            "cms_equipment": CalculationResult(
                category="CMS - Equipment",
                description="LiveSync licenses, servers, content players",
                raw_cost=cms_equipment_cost + player_cost,
                calculation=f"CMS: ${cms_equipment_cost} + Players: ${player_cost}",
                formula_key="cms_equipment",
                real_formula_note="REPLACE WITH: ANC CMS pricing and licensing costs",
            ),
            "cms_installation": CalculationResult(
                category="CMS - Installation",
                description="CMS setup and configuration",
                raw_cost=cms_installation_cost,
                calculation=f"{installation_hours} hours × $150/hr",
                formula_key="cms_installation",
                real_formula_note="REPLACE WITH: ANC CMS setup rates",
            ),
            "cms_commissioning": CalculationResult(
                category="CMS - Commissioning",
                description="CMS testing and final configuration",
                raw_cost=cms_commissioning_cost,
                calculation=f"{commissioning_hours} hours × $150/hr",
                formula_key="cms_commissioning",
                real_formula_note="REPLACE WITH: ANC CMS commissioning rates",
            ),
        }

    def _calculate_project_management(
        self, project_input: CPQInput, answers: List[QuestionAnswer]
    ) -> CalculationResult:
        """Calculate project management costs"""

        # Get subtotal of all previous categories
        subtotal = self._get_running_subtotal(
            project_input,
            answers,
            exclude=[
                "project_management",
                "general_conditions",
                "travel",
                "submittals",
                "engineering",
                "permits",
                "final_commissioning",
                "bond",
                "contingency",
                "service_contract",
            ],
        )

        # Find complexity from answers
        complexity_answer = next(
            (a for a in answers if a.question_id == "complexity"), None
        )
        if complexity_answer and complexity_answer.formula_key == "pm_complex":
            formula_key = "pm_complex"
        else:
            formula_key = "pm_standard"

        raw_cost = self.formula_bank.calculate(formula_key, {"subtotal": subtotal})
        formula = self.formula_bank.get_formula(formula_key)

        return CalculationResult(
            category="Project Management",
            description="PM oversight and coordination",
            raw_cost=raw_cost,
            calculation=f"Subtotal × {raw_cost / subtotal:.0%} (complexity factor)",
            formula_key=formula_key,
            real_formula_note=formula.real_formula_note,
        )

    def _calculate_general_conditions(
        self, project_input: CPQInput, answers: List[QuestionAnswer]
    ) -> CalculationResult:
        """Calculate general conditions"""
        subtotal = self._get_running_subtotal(
            project_input,
            answers,
            exclude=[
                "general_conditions",
                "travel",
                "submittals",
                "engineering",
                "permits",
                "final_commissioning",
                "bond",
                "contingency",
                "service_contract",
            ],
        )

        # Duration factor (placeholder)
        duration_factor = 1.0
        base_overhead = subtotal * 0.05  # 5% placeholder
        raw_cost = base_overhead * duration_factor

        return CalculationResult(
            category="General Conditions",
            description="Insurance, bonds, overhead",
            raw_cost=raw_cost,
            calculation=f"Subtotal × 5% × {duration_factor:.2f} (duration factor)",
            formula_key="general_conditions",
            real_formula_note="REPLACE WITH: ANC general conditions calculation",
        )

    def _calculate_travel(
        self, project_input: CPQInput, answers: List[QuestionAnswer]
    ) -> CalculationResult:
        """Calculate travel expenses (placeholder)"""
        # Placeholder travel calculation
        flights = 3200
        hotel = 11200
        per_diem = 4200
        raw_cost = flights + hotel + per_diem

        return CalculationResult(
            category="Travel & Expenses",
            description="Flights, hotels, per diem for installation team",
            raw_cost=raw_cost,
            calculation=f"Flights: ${flights} + Hotel: ${hotel} + Per Diem: ${per_diem}",
            formula_key="travel_expenses",
            real_formula_note="REPLACE WITH: ANC travel cost calculation by venue type",
        )

    def _calculate_submittals(
        self, project_input: CPQInput, answers: List[QuestionAnswer]
    ) -> CalculationResult:
        """Calculate submittals costs"""
        num_displays = 1  # For now, single display
        base_per_display = 2500

        raw_cost = base_per_display * num_displays

        return CalculationResult(
            category="Submittals",
            description="Engineering documents, permits paperwork",
            raw_cost=raw_cost,
            calculation=f"${base_per_display} × {num_displays} displays × 1.00",
            formula_key="submittals",
            real_formula_note="REPLACE WITH: ANC submittal cost by project complexity",
        )

    def _calculate_engineering(
        self, project_input: CPQInput, answers: List[QuestionAnswer]
    ) -> CalculationResult:
        """Calculate engineering costs"""
        structural_eng = 0
        electrical_eng = 10000 if project_input.venue_type in ["nfl", "nba"] else 0

        raw_cost = structural_eng + electrical_eng

        return CalculationResult(
            category="Engineering",
            description="Structural and electrical engineering studies",
            raw_cost=raw_cost,
            calculation=f"Structural: ${structural_eng} + Electrical: ${electrical_eng}",
            formula_key="engineering",
            real_formula_note="REPLACE WITH: ANC engineering rates by discipline and venue",
        )

    def _calculate_permits(
        self, project_input: CPQInput, answers: List[QuestionAnswer]
    ) -> CalculationResult:
        """Calculate permit costs"""
        # Get project value for permit calculation
        project_value = self._get_running_subtotal(
            project_input,
            answers,
            exclude=["permits", "bond", "contingency", "service_contract"],
        )

        # Base permit: 2% of project value (placeholder)
        base_permit = project_value * 0.02

        # Venue multiplier (placeholder)
        venue_multipliers = {
            "nfl": 1.5,
            "nba": 1.4,
            "ncaa": 1.2,
            "transit": 1.3,
            "corporate": 1.0,
        }

        multiplier = venue_multipliers.get(project_input.venue_type, 1.0)
        raw_cost = base_permit * multiplier

        return CalculationResult(
            category="Permits",
            description="Local jurisdiction permitting costs",
            raw_cost=raw_cost,
            calculation=f"Project Value × 2% × {multiplier:.2f} (venue factor)",
            formula_key="permits",
            real_formula_note="REPLACE WITH: ANC permit rates by jurisdiction and venue type",
        )

    def _calculate_final_commissioning(
        self, project_input: CPQInput, answers: List[QuestionAnswer]
    ) -> CalculationResult:
        """Calculate final commissioning costs"""
        testing_hours = 20  # Placeholder
        testing_equipment = 5000  # Placeholder
        hourly_rate = 150  # Placeholder

        labor_cost = testing_hours * hourly_rate
        raw_cost = labor_cost + testing_equipment

        return CalculationResult(
            category="Installation & Commissioning (Final)",
            description="Final testing, calibration, and handoff",
            raw_cost=raw_cost,
            calculation=f"{testing_hours} hours × ${hourly_rate}/hr + Equipment: ${testing_equipment}",
            formula_key="final_commissioning",
            real_formula_note="REPLACE WITH: ANC final commissioning rates and equipment costs",
        )

    def _calculate_bond(
        self, project_input: CPQInput, answers: List[QuestionAnswer]
    ) -> CalculationResult:
        """Calculate bond costs (placeholder - usually 0)"""
        raw_cost = 0  # Bond not required by default

        return CalculationResult(
            category="Bond",
            description="Payment/Performance bond",
            raw_cost=raw_cost,
            calculation="Bond not required",
            formula_key="bond",
            real_formula_note="REPLACE WITH: ANC bond calculation when required",
        )

    def _calculate_contingency(
        self, project_input: CPQInput, answers: List[QuestionAnswer]
    ) -> CalculationResult:
        """Calculate contingency"""
        subtotal = self._get_running_subtotal(
            project_input, answers, exclude=["contingency", "service_contract"]
        )
        contingency_pct = (
            project_input.contingency_pct / 100
            if project_input.contingency_pct
            else 0.05
        )
        raw_cost = subtotal * contingency_pct

        return CalculationResult(
            category="Contingency",
            description="Project contingency buffer",
            raw_cost=raw_cost,
            calculation=f"Subtotal × {contingency_pct * 100:.0f}% (contingency)",
            formula_key="contingency",
            real_formula_note="REPLACE WITH: ANC contingency calculation methodology",
        )

    def _calculate_service_contract(
        self, project_input: CPQInput, answers: List[QuestionAnswer]
    ) -> CalculationResult:
        """Calculate annual service contract"""
        # Get final project value for service calculation
        project_value = self._get_running_subtotal(
            project_input, answers, exclude=["service_contract"]
        )

        # Service level multipliers (placeholder)
        service_multipliers = {"bronze": 0.05, "silver": 0.08, "gold": 0.15}

        multiplier = service_multipliers.get(project_input.service_level, 0.05)
        raw_cost = project_value * multiplier

        return CalculationResult(
            category="Service Contract (Annual)",
            description=f"Ongoing service package ({project_input.service_level.upper()})",
            raw_cost=raw_cost,
            calculation=f"Project Value × {multiplier * 100:.0f}% (Service Level: {project_input.service_level})",
            formula_key="service_contract",
            real_formula_note="REPLACE WITH: ANC service contract pricing by level",
        )

    def _get_running_subtotal(
        self,
        project_input: CPQInput,
        answers: List[QuestionAnswer],
        exclude: List[str] = None,
    ) -> float:
        """Calculate running subtotal excluding specified categories"""
        if exclude is None:
            exclude = []

        # This is a simplified version - in real implementation would track running total
        # For now, return a placeholder based on typical project size
        sq_ft = project_input.width_ft * project_input.height_ft
        return sq_ft * 2000  # Placeholder: $2000/sq ft average
