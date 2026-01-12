import json
import math
import os
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional

# Constants matching TypeScript logic
CONFIG = {
    "multipliers": {"structural": 0.20, "labor": 0.15, "shipping": 0.05, "bond": 0.01},
    "defaults": {"margin": 0.30},
}


class VenueType(str, Enum):
    NFL = "nfl"
    NBA = "nba"
    NCAA = "ncaa"
    TRANSIT = "transit"
    CORPORATE = "corporate"


class ServiceLevel(str, Enum):
    GOLD = "gold"
    SILVER = "silver"
    BRONZE = "bronze"
    SELF = "self"


class Timeline(str, Enum):
    STANDARD = "standard"
    RUSH = "rush"
    ASAP = "asap"
    MULTIPHASE = "multiphase"


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
    structure_condition: Optional[str] = "Existing"
    # NEW: ANC-specific fields
    labor_type: Optional[str] = "NonUnion"
    power_distance: Optional[str] = "Close"
    permits: Optional[str] = "Client"
    control_system: Optional[str] = "Include"
    bond_required: Optional[bool] = False
    venue_type: Optional[str] = "corporate"
    display_types: Optional[List[str]] = None
    installation_type: Optional[str] = "new"
    electrical_capacity: Optional[str] = "adequate"
    distance_to_power_ft: Optional[float] = 50.0
    cms_type: Optional[str] = "manual"
    software_features: Optional[List[str]] = None
    service_level: Optional[str] = "bronze"
    timeline: Optional[str] = "standard"
    num_displays: Optional[int] = 1
    team_size: Optional[int] = 4
    duration_days: Optional[int] = 14
    contingency_pct: Optional[float] = 5.0


class CPQCalculator:
    def __init__(self, catalog=None):
        self.catalog = catalog

    def _get_base_rate(self, project_input: CPQInput) -> float:
        """Calculate base rate per square foot based on product specs"""
        # Check for Manual Override first
        if project_input.unit_cost and float(project_input.unit_cost) > 0:
            return float(project_input.unit_cost)

        # Fallback to Industry Averages (ANC Pricing)
        PRICING_TABLE = {
            10: {"Indoor": 1200.0, "Outdoor": 1800.0},  # 10mm
            6: {"Indoor": 1800.0, "Outdoor": 2400.0},  # 6mm
            4: {"Indoor": 2500.0, "Outdoor": 3200.0},  # 4mm
            1.5: {"Indoor": 3500.0, "Outdoor": 4500.0},  # 1.5mm Fine Pitch
        }

        # Default to 10mm Indoor if not found
        pitch_key = (
            int(project_input.pixel_pitch)
            if int(project_input.pixel_pitch) in PRICING_TABLE
            else 10
        )
        env_key = "Outdoor" if project_input.is_outdoor else "Indoor"

        base_rate = PRICING_TABLE.get(pitch_key, {}).get(env_key, 1200.0)

        # Ribbon surcharge
        if project_input.product_class == "Ribbon":
            base_rate *= 1.20  # 20% premium for custom cabinet

        return base_rate

    def _calculate_hardware_cost(
        self, project_input: CPQInput, base_rate: float
    ) -> Dict:
        """Category 1: Hardware - LED display panels, cabinets"""
        sq_ft = project_input.width_ft * project_input.height_ft
        num_displays = project_input.num_displays or 1

        raw_hardware_cost = sq_ft * base_rate * num_displays

        return {
            "category": "Hardware",
            "description": "LED display panels, cabinets, mounting hardware",
            "raw_cost": raw_hardware_cost,
            "calculation": f"{sq_ft} sq ft × ${base_rate}/sq ft × {num_displays} displays",
        }

    def _calculate_structural_costs(
        self, project_input: CPQInput, hardware_cost: float
    ) -> Dict:
        """Category 2-3: Structural Materials & Labor"""
        # Structural Materials
        structural_material_multiplier = 1.0
        if project_input.structure_condition == "NewSteel":
            structural_material_multiplier = 1.3
        elif project_input.installation_type == "retrofit":
            structural_material_multiplier = 1.15

        raw_structural_materials = hardware_cost * 0.20 * structural_material_multiplier

        # Structural Labor (Union/Prevailing Wage Handling)
        structural_labor_multiplier = 1.0
        if project_input.labor_type == "Union":
            structural_labor_multiplier = 1.3
        elif project_input.labor_type == "Prevailing":
            structural_labor_multiplier = 1.5

        if project_input.access == "Rear":
            structural_labor_multiplier += 0.15

        raw_structural_labor = (
            (hardware_cost + raw_structural_materials)
            * 0.15
            * structural_labor_multiplier
        )

        return {
            "structural_materials": {
                "category": "Structural Materials",
                "description": "Steel, truss, concrete, fasteners",
                "raw_cost": raw_structural_materials,
                "calculation": f"Hardware cost × 20% × {structural_material_multiplier:.2f} (condition factor)",
            },
            "structural_labor": {
                "category": "Structural Labor",
                "description": "Structural installation labor",
                "raw_cost": raw_structural_labor,
                "calculation": f"(Hardware + Structural Materials) × 15% × {structural_labor_multiplier:.2f} (access factor)",
            },
        }

    def _calculate_led_installation(
        self, project_input: CPQInput, hardware_cost: float
    ) -> Dict:
        """Category 4: LED Installation Labor"""
        # Base installation hours per square foot
        hours_per_sqft = 0.5
        sq_ft = project_input.width_ft * project_input.height_ft
        num_displays = project_input.num_displays or 1

        # Complexity multiplier
        complexity_multiplier = 1.0
        if project_input.complexity == "High":
            complexity_multiplier = 1.5

        # Access multiplier
        access_multiplier = 1.0
        if project_input.access == "rear":
            access_multiplier = 1.15
        elif project_input.access == "crane":
            access_multiplier = 1.4

        total_hours = (
            sq_ft
            * hours_per_sqft
            * num_displays
            * complexity_multiplier
            * access_multiplier
        )

        # Labor rates
        lead_tech_rate = 150.0
        tech_rate = 100.0

        raw_led_labor = (total_hours * 0.2 * lead_tech_rate) + (
            total_hours * 0.8 * tech_rate
        )

        return {
            "category": "LED Installation (Labor)",
            "description": "Display mounting, alignment, testing",
            "raw_cost": raw_led_labor,
            "calculation": f"{total_hours:.1f} hours × blended rate ${(lead_tech_rate * 0.2 + tech_rate * 0.8):.2f}/hr",
        }

    def _calculate_electrical_data(
        self, project_input: CPQInput, num_displays: int
    ) -> Dict:
        """Category 5-6: Electrical & Data (Materials + Subcontracting)"""
        # PDUs - 1.5 per display
        num_pdus = math.ceil(num_displays * 1.5)
        pdu_cost = num_pdus * 2500.0  # $2,500 per PDU

        # Cabling - $15 per foot per display
        distance_map = {"Close": 50.0, "Medium": 150.0, "Far": 300.0}
        distance = distance_map.get(project_input.power_distance, 50.0)
        cabling_cost = num_displays * distance * 15.0

        # Data switches - 1 per 4 displays
        num_switches = math.ceil(num_displays / 4.0)
        switch_cost = num_switches * 5000.0  # $5,000 per switch

        electrical_materials = pdu_cost + cabling_cost + switch_cost

        # Electrical Subcontracting
        electrical_labor_hours = num_pdus * 40.0  # 40 hours per PDU
        electrical_labor_rate = 150.0  # Licensed electrician
        raw_electrical_labor = electrical_labor_hours * electrical_labor_rate

        # Electrical upgrades if capacity limited
        electrical_upgrades = 0.0
        if project_input.electrical_capacity == "limited":
            electrical_upgrades = 15000.0  # New panel installation

        return {
            "electrical_materials": {
                "category": "Electrical & Data - Materials",
                "description": "PDUs, cabling, switches, equipment",
                "raw_cost": electrical_materials + electrical_upgrades,
                "calculation": f"PDU: ${pdu_cost:,.0f} + Cabling: ${cabling_cost:,.0f} + Switches: ${switch_cost:,.0f} + Upgrades: ${electrical_upgrades:,.0f}",
            },
            "electrical_labor": {
                "category": "Electrical & Data - Subcontracting",
                "description": "Licensed electrical contractor installation",
                "raw_cost": raw_electrical_labor,
                "calculation": f"{electrical_labor_hours:.0f} hours × ${electrical_labor_rate:.0f}/hr",
            },
        }

    def _calculate_cms_costs(self, project_input: CPQInput, num_displays: int) -> Dict:
        """Category 7-9: CMS Equipment, Installation, Commissioning"""
        # CMS Equipment
        if project_input.control_system == "Include":
            cms_equipment_cost = 25000.0
        else:
            cms_equipment_cost = 0.0

        # Content Players - 1 per 3 displays
        num_players = math.ceil(num_displays / 3.0)
        player_cost = num_players * 3500.0  # $3,500 per player

        total_cms_equipment = cms_equipment_cost + player_cost

        # CMS Installation
        cms_installation_hours = num_displays * 20.0
        cms_installation_cost = cms_installation_hours * 150.0  # $150/hr

        # CMS Commissioning
        cms_commissioning_hours = num_displays * 10.0
        cms_commissioning_cost = cms_commissioning_hours * 150.0

        return {
            "cms_equipment": {
                "category": "CMS - Equipment",
                "description": "LiveSync licenses, servers, content players",
                "raw_cost": total_cms_equipment,
                "calculation": f"CMS: ${cms_equipment_cost:,.0f} + Players: ${player_cost:,.0f}",
            },
            "cms_installation": {
                "category": "CMS - Installation",
                "description": "CMS setup and configuration",
                "raw_cost": cms_installation_cost,
                "calculation": f"{cms_installation_hours:.0f} hours × $150/hr",
            },
            "cms_commissioning": {
                "category": "CMS - Commissioning",
                "description": "CMS testing and final configuration",
                "raw_cost": cms_commissioning_cost,
                "calculation": f"{cms_commissioning_hours:.0f} hours × $150/hr",
            },
        }

    def _calculate_project_management(
        self, total_subtotal: float, complexity: str, duration_days: int
    ) -> Dict:
        """Category 10: Project Management"""
        # Base PM: 8% of total
        base_pm = total_subtotal * 0.08

        # Complexity multipliers
        complexity_multipliers = {"Standard": 1.0, "High": 1.5, "Very High": 2.0}
        complexity_factor = complexity_multipliers.get(complexity, 1.0)

        # Duration factor (longer projects = more PM overhead)
        duration_factor = max(1.0, duration_days / 14.0)

        pm_cost = round(base_pm * complexity_factor * duration_factor)

        return {
            "category": "Project Management",
            "description": "PM oversight and coordination",
            "raw_cost": pm_cost,
            "calculation": f"Subtotal × 8% × {complexity_factor:.2f} (complexity) × {duration_factor:.2f} (duration)",
        }

    def _calculate_general_conditions(
        self, total_subtotal: float, duration_days: int
    ) -> Dict:
        """Category 11: General Conditions"""
        # Base overhead: 5% of subtotal
        base_overhead = total_subtotal * 0.05

        # Duration factor
        duration_factor = max(1.0, duration_days / 14.0)

        general_conditions_cost = round(base_overhead * duration_factor)

        return {
            "category": "General Conditions",
            "description": "Insurance, bonds, overhead",
            "raw_cost": general_conditions_cost,
            "calculation": f"Subtotal × 5% × {duration_factor:.2f} (duration factor)",
        }

    def _calculate_travel_expenses(
        self, venue_type: str, team_size: int, duration_days: int
    ) -> Dict:
        """Category 12: Travel & Expenses"""
        # Location-based rates (simplified - would need actual location for precise calc)
        location_rates = {
            "nfl": {"flight": 400, "hotel": 200, "per_diem": 75},
            "nba": {"flight": 300, "hotel": 180, "per_diem": 70},
            "ncaa": {"flight": 350, "hotel": 160, "per_diem": 65},
            "transit": {"flight": 500, "hotel": 250, "per_diem": 85},
            "corporate": {"flight": 200, "hotel": 150, "per_diem": 60},
        }

        rates = location_rates.get(venue_type, location_rates["corporate"])

        # One round trip for flights
        flight_cost = rates["flight"] * team_size * 2

        # Hotel for duration
        hotel_cost = rates["hotel"] * team_size * duration_days

        # Per diem for duration
        per_diem_cost = rates["per_diem"] * team_size * duration_days

        total_travel = round(flight_cost + hotel_cost + per_diem_cost)

        return {
            "category": "Travel & Expenses",
            "description": "Flights, hotels, per diem for installation team",
            "raw_cost": total_travel,
            "calculation": f"Flights: ${flight_cost:,.0f} + Hotel: ${hotel_cost:,.0f} + Per Diem: ${per_diem_cost:,.0f}",
        }

    def _calculate_submittals(self, num_displays: int, complexity: str) -> Dict:
        """Category 13: Submittals"""
        # Base: $2,500 per display type
        base_per_display = 2500.0

        # Complexity multiplier
        complexity_multipliers = {"Standard": 1.0, "High": 1.5, "Very High": 2.0}

        submittals_cost = round(
            base_per_display
            * num_displays
            * complexity_multipliers.get(complexity, 1.0)
        )

        return {
            "category": "Submittals",
            "description": "Engineering documents, permits paperwork",
            "raw_cost": submittals_cost,
            "calculation": f"${base_per_display:,.0f} × {num_displays} displays × {complexity_multipliers.get(complexity, 1.0):.2f}",
        }

    def _calculate_engineering(self, venue_type: str, structure_condition: str) -> Dict:
        """Category 14: Engineering"""
        engineering_cost = 0

        # Structural engineering
        if venue_type in ["nfl", "nba"] or structure_condition == "newsteel":
            engineering_cost += 15000.0

        # Electrical engineering
        if venue_type in ["nfl", "nba"]:
            engineering_cost += 10000.0

        return {
            "category": "Engineering",
            "description": "Structural and electrical engineering studies",
            "raw_cost": engineering_cost,
            "calculation": f"Structural: ${15000.0 if structure_condition == 'newsteel' else 0.0} + Electrical: ${10000.0 if venue_type in ['nfl', 'nba'] else 0.0}",
        }

    def _calculate_permits(self, venue_type: str, project_value: float) -> Dict:
        """Category 15: Permits"""
        # Base permit: 2% of project value
        base_permit = project_value * 0.02

        # Venue type multipliers
        venue_multipliers = {
            "nfl": 1.5,
            "nba": 1.3,
            "ncaa": 1.2,
            "transit": 1.8,
            "corporate": 1.0,
        }

        permit_cost = round(base_permit * venue_multipliers.get(venue_type, 1.0))

        return {
            "category": "Permits",
            "description": "Local jurisdiction permitting costs",
            "raw_cost": permit_cost,
            "calculation": f"Project Value × 2% × {venue_multipliers.get(venue_type, 1.0):.2f} (venue factor)",
        }

    def _calculate_installation_commissioning(
        self, num_displays: int, complexity: str, team_size: int, duration_days: int
    ) -> Dict:
        """Category 16: Final Installation & Commissioning"""
        # Final testing and calibration
        testing_hours = num_displays * 20.0

        # Complexity multiplier
        complexity_multiplier = 1.0
        if complexity == "High":
            complexity_multiplier = 1.5

        total_testing_hours = testing_hours * complexity_multiplier

        # Lead technician rate
        lead_rate = 150.0
        commissioning_cost = round(total_testing_hours * lead_rate)

        # Equipment testing (test equipment rental)
        testing_equipment = 5000.0

        return {
            "category": "Installation & Commissioning (Final)",
            "description": "Final testing, calibration, and handoff",
            "raw_cost": commissioning_cost + testing_equipment,
            "calculation": f"{total_testing_hours:.0f} hours × $150/hr + Equipment: ${testing_equipment:,.0f}",
        }

    def _calculate_service_annual(
        self, service_level: str, project_value: float
    ) -> Dict:
        """Calculate annual service contract cost"""
        service_multipliers = {
            "gold": 0.15,  # 15% of project value annually
            "silver": 0.08,  # 8% of project value annually
            "bronze": 0.05,  # 5% of project value annually
            "self": 0.0,
        }

        multiplier = service_multipliers.get(service_level, 0.0)
        annual_service_cost = round(project_value * multiplier)

        return {
            "category": "Service Contract (Annual)",
            "description": f"Ongoing service package ({service_level.upper()})",
            "raw_cost": annual_service_cost,
            "calculation": f"Project Value × {multiplier * 100:.0f}% (Service Level: {service_level})",
        }

    def _apply_timeline_multiplier(self, total_cost: float, timeline: str) -> float:
        """Apply rush timeline multipliers"""
        timeline_multipliers = {
            "standard": 1.0,
            "rush": 1.2,  # +20%
            "asap": 1.5,  # +50%
            "multiphase": 1.0,
        }

        multiplier = timeline_multipliers.get(timeline, 1.0)
        surcharge = round(total_cost * (multiplier - 1.0))

        return {
            "original_cost": total_cost,
            "multiplier": multiplier,
            "surcharge": surcharge,
            "total_with_surcharge": round(total_cost * multiplier),
        }

    def calculate_quote(self, project_input: CPQInput) -> Dict:
        """Complete 16-category cost calculation for ANC proposals"""

        # Extract parameters with defaults
        num_displays = project_input.num_displays or 1
        team_size = project_input.team_size or 4
        duration_days = project_input.duration_days or 14
        venue_type = project_input.venue_type or "nfl"
        service_level = project_input.service_level or "bronze"
        timeline = project_input.timeline or "standard"
        contingency_pct = (project_input.contingency_pct or 5.0) / 100.0

        # 1. Hardware Costs
        base_rate = self._get_base_rate(project_input)
        hardware = self._calculate_hardware_cost(project_input, base_rate)
        raw_hardware = hardware["raw_cost"]

        # 2-3. Structural Materials & Labor
        structural = self._calculate_structural_costs(project_input, raw_hardware)
        raw_structural = (
            structural["structural_materials"]["raw_cost"]
            + structural["structural_labor"]["raw_cost"]
        )

        # 4. LED Installation
        led_install = self._calculate_led_installation(project_input, raw_hardware)
        raw_led_install = led_install["raw_cost"]

        # 5-6. Electrical & Data
        electrical = self._calculate_electrical_data(project_input, num_displays)
        raw_electrical = (
            electrical["electrical_materials"]["raw_cost"]
            + electrical["electrical_labor"]["raw_cost"]
        )

        # 7-9. CMS Equipment, Installation, Commissioning
        cms = self._calculate_cms_costs(project_input, num_displays)
        raw_cms = (
            cms["cms_equipment"]["raw_cost"]
            + cms["cms_installation"]["raw_cost"]
            + cms["cms_commissioning"]["raw_cost"]
        )

        # Subtotal of hard costs
        subtotal_before_soft = (
            raw_hardware + raw_structural + raw_led_install + raw_electrical + raw_cms
        )

        # 10-13. Professional Services
        pm = self._calculate_project_management(
            subtotal_before_soft, project_input.complexity, duration_days
        )
        raw_pm = pm["raw_cost"]

        submittals = self._calculate_submittals(num_displays, project_input.complexity)
        raw_submittals = submittals["raw_cost"]

        engineering = self._calculate_engineering(
            venue_type, project_input.structure_condition
        )
        raw_engineering = engineering["raw_cost"]

        # 14-15. Soft Costs
        travel = self._calculate_travel_expenses(venue_type, team_size, duration_days)
        raw_travel = travel["raw_cost"]

        # Permits (calculated after total value is known)

        # 16. Final Installation & Commissioning
        final_install = self._calculate_installation_commissioning(
            num_displays, project_input.complexity, team_size, duration_days
        )
        raw_final_install = final_install["raw_cost"]

        # Total before markup
        total_before_markup = (
            subtotal_before_soft
            + raw_pm
            + raw_submittals
            + raw_engineering
            + raw_travel
            + raw_final_install
        )

        # 10. Apply Margin
        margin = CONFIG["defaults"]["margin"]
        if project_input.target_margin and float(project_input.target_margin) > 0:
            margin = float(project_input.target_margin) / 100.0

        markup_factor = 1 / (1 - margin)

        # Markup all categories
        marked_up = {
            "hardware": round(raw_hardware * markup_factor),
            "structural_materials": round(
                structural["structural_materials"]["raw_cost"] * markup_factor
            ),
            "structural_labor": round(
                structural["structural_labor"]["raw_cost"] * markup_factor
            ),
            "led_installation": round(raw_led_install * markup_factor),
            "electrical_materials": round(
                electrical["electrical_materials"]["raw_cost"] * markup_factor
            ),
            "electrical_labor": round(
                electrical["electrical_labor"]["raw_cost"] * markup_factor
            ),
            "cms_equipment": round(cms["cms_equipment"]["raw_cost"] * markup_factor),
            "cms_installation": round(
                cms["cms_installation"]["raw_cost"] * markup_factor
            ),
            "cms_commissioning": round(
                cms["cms_commissioning"]["raw_cost"] * markup_factor
            ),
            "project_management": round(raw_pm * markup_factor),
            "submittals": round(raw_submittals * markup_factor),
            "engineering": round(raw_engineering * markup_factor),
            "travel_expenses": round(raw_travel * markup_factor),
            "final_commissioning": round(raw_final_install * markup_factor),
        }

        # Calculate marked-up totals
        total_marked_up = sum(marked_up.values())

        # General Conditions (5% of total marked-up)
        general_conditions = self._calculate_general_conditions(
            total_marked_up, duration_days
        )
        raw_general = general_conditions["raw_cost"]
        marked_up["general_conditions"] = round(raw_general * markup_factor)

        # Update total with general conditions
        total_marked_up += marked_up["general_conditions"]

        # Permits (2% of total)
        permits = self._calculate_permits(venue_type, total_marked_up)
        raw_permits = permits["raw_cost"]
        marked_up["permits"] = round(raw_permits * markup_factor)

        # Update total with permits
        total_marked_up += marked_up["permits"]

        # Bond (1.5% of subtotal if required)
        bond_multiplier = 0.015 if project_input.bond_required else 0.0
        bond_cost = round(total_marked_up * bond_multiplier)
        marked_up["bond"] = bond_cost

        # Final subtotal
        subtotal = total_marked_up + bond_cost

        # 16. Apply Contingency
        contingency_cost = round(subtotal * contingency_pct)
        marked_up["contingency"] = contingency_cost

        # Final sell price
        sell_price = subtotal + contingency_cost

        # Timeline multiplier
        timeline_result = self._apply_timeline_multiplier(sell_price, timeline)
        final_sell_price = timeline_result["total_with_surcharge"]

        # Annual service contract
        service_contract = self._calculate_service_annual(
            service_level, final_sell_price
        )

        return {
            "inputs": project_input,
            "pricing": {
                "margin_pct": margin,
                "markup_factor": markup_factor,
                "contingency_pct": contingency_pct,
                "timeline_multiplier": timeline_result["multiplier"],
                "timeline_surcharge": timeline_result["surcharge"],
            },
            "cost_breakdown": {
                "1. Hardware": marked_up["hardware"],
                "2. Structural Materials": marked_up["structural_materials"],
                "3. Structural Labor": marked_up["structural_labor"],
                "4. LED Installation": marked_up["led_installation"],
                "5. Electrical Materials": marked_up["electrical_materials"],
                "6. Electrical Labor": marked_up["electrical_labor"],
                "7. CMS Equipment": marked_up["cms_equipment"],
                "8. CMS Installation": marked_up["cms_installation"],
                "9. CMS Commissioning": marked_up["cms_commissioning"],
                "10. Project Management": marked_up["project_management"],
                "11. General Conditions": marked_up["general_conditions"],
                "12. Travel & Expenses": marked_up["travel_expenses"],
                "13. Submittals": marked_up["submittals"],
                "14. Engineering": marked_up["engineering"],
                "15. Permits": marked_up["permits"],
                "16. Final Commissioning": marked_up["final_commissioning"],
                "17. Bond": marked_up["bond"],
                "18. Contingency": marked_up["contingency"],
            },
            "summary": {
                "subtotal": subtotal,
                "contingency": contingency_cost,
                "timeline_surcharge": timeline_result["surcharge"],
                "final_sell_price": final_sell_price,
                "annual_service": service_contract["raw_cost"],
            },
            "details": {
                "hardware": hardware,
                "structural": structural,
                "led_installation": led_install,
                "electrical": electrical,
                "cms": cms,
                "project_management": pm,
                "travel": travel,
                "submittals": submittals,
                "engineering": engineering,
                "permits": permits,
                "final_commissioning": final_install,
                "general_conditions": general_conditions,
                "service_contract": service_contract,
                "timeline": timeline_result,
            },
        }
