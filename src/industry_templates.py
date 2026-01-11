"""
ANC Industry Templates
Pre-configured venue templates for one-click demo scenarios
Based on ANC's actual case studies and pricing models
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional


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


class TimelineType(str, Enum):
    STANDARD = "standard"
    RUSH = "rush"
    ASAP = "asap"
    MULTIPHASE = "multiphase"


@dataclass
class DisplayConfig:
    """Individual display configuration"""

    product_id: str
    quantity: int = 1
    width_ft: float
    height_ft: float
    pixel_pitch_mm: float
    notes: Optional[str] = None


@dataclass
class IndustryTemplate:
    """
    Complete venue configuration template
    Pre-configured for one-click demo scenarios
    """

    template_id: str
    venue_type: VenueType
    name: str
    description: str
    target_price_range: str

    # Display configurations
    displays: List[DisplayConfig]

    # Software configuration
    cms_type: str
    software_features: List[str]

    # Installation environment
    installation_type: str  # new, retrofit, upgrade
    access_method: str  # front, rear, lift, crane
    structural_support: str  # existing, newsteel, truss
    electrical_capacity: str  # adequate, limited, unknown
    distance_to_power_ft: float

    # Service configuration
    service_level: ServiceLevel

    # Timeline configuration
    timeline_type: TimelineType
    duration_weeks: int

    # Pricing configuration
    target_margin_pct: float
    contingency_pct: float

    # Project metadata
    typical_project_value_range: str
    example_projects: List[str]
    key_features: List[str]
    installation_complexity: str  # Standard, High, Very High

    def to_calculator_input(self) -> Dict[str, Any]:
        """
        Convert template to input format for calculator
        Compatible with CPQInput from calculator.py
        """
        return {
            "venue_type": self.venue_type.value,
            "display_types": [d.product_id for d in self.displays],
            "num_displays": len(self.displays),
            "cms_type": self.cms_type,
            "software_features": self.software_features,
            "service_level": self.service_level.value,
            "timeline": self.timeline_type.value,
            "duration_days": self.duration_weeks * 7,
            "target_margin": self.target_margin_pct * 100,  # Convert 0.30 to 30
            "contingency_pct": self.contingency_pct * 100,  # Convert 0.05 to 5
            "installation_type": self.installation_type,
            "access": self.access_method,
            "structure_condition": self.structural_support,
            "electrical_capacity": self.electrical_capacity,
            "distance_to_power_ft": self.distance_to_power_ft,
            "complexity": self.installation_complexity,
            "team_size": 6 if self.venue_type == VenueType.NFL else 4,
            "product_class": "CenterHung"
            if "centerhung" in self.displays[0].product_id
            else "Ribbon",
            "pixel_pitch": self.displays[0].pixel_pitch_mm,
            "width_ft": self.displays[0].width_ft,
            "height_ft": self.displays[0].height_ft,
            "is_outdoor": self.venue_type in [VenueType.NFL, VenueType.TRANSIT],
        }


# ============================================================================
# INDUSTRY TEMPLATES
# ============================================================================

ANC_INDUSTRY_TEMPLATES: Dict[str, IndustryTemplate] = {
    # ------------------------------------------------------------------------
    # NFL STADIUM TEMPLATE
    # ------------------------------------------------------------------------
    "nfl_stadium": IndustryTemplate(
        template_id="nfl_stadium",
        venue_type=VenueType.NFL,
        name="NFL Stadium Template",
        description="Professional football stadium configuration with premium displays, full-service support, and game-day operations",
        target_price_range="$5M - $15M",
        # Displays: Large 4K center hung, ribbons, endzone displays
        displays=[
            DisplayConfig(
                product_id="lg_gppa062_outdoor_6mm",
                quantity=1,
                width_ft=40.0,
                height_ft=30.0,
                pixel_pitch_mm=6.0,
                notes="Main center hung 4K display - UEFA certified",
            ),
            DisplayConfig(
                product_id="ribbon_concourse_10mm",
                quantity=2,
                width_ft=500.0,  # Continuous ribbon length
                height_ft=3.0,
                pixel_pitch_mm=10.0,
                notes="Fascia concourse ribbon boards",
            ),
            DisplayConfig(
                product_id="ribbon_premium_6mm",
                quantity=2,
                width_ft=200.0,  # Premium ribbon length
                height_ft=2.5,
                pixel_pitch_mm=6.0,
                notes="Premium suite-level ribbon displays",
            ),
            DisplayConfig(
                product_id="endzone_large_format_4k",
                quantity=2,
                width_ft=44.0,
                height_ft=11.0,
                pixel_pitch_mm=4.0,
                notes="Large format endzone displays (2x)",
            ),
        ],
        # Software: LiveSync Enterprise
        cms_type="livesync_per_venue",
        software_features=[
            "24/7 Scheduling",
            "Live Sports Integration",
            "Data Feeds (Scoring, Social Media)",
            "Emergency Messaging",
            "Multi-Screen Synchronization",
            "Advertising Management",
            "User Role Management",
            "Content Analytics",
        ],
        # Installation: Complex outdoor installation
        installation_type="new",  # New construction or major retrofit
        access_method="crane",  # Crane required for center hung
        structural_support="newsteel",  # New steel structure
        electrical_capacity="adequate",  # NFL stadiums have adequate power
        distance_to_power_ft=150.0,  # Average distance in stadium
        # Service: Gold 24/7 full support
        service_level=ServiceLevel.GOLD,
        # Timeline: Standard 8-12 weeks
        timeline_type=TimelineType.STANDARD,
        duration_weeks=10,
        # Pricing: 30% margin, 5% contingency
        target_margin_pct=0.30,
        contingency_pct=0.05,
        # Metadata
        typical_project_value_range="$5M - $15M",
        example_projects=[
            "Levi's Stadium - San Francisco 49ers (2024)",
            "M&T Bank Stadium - Baltimore Ravens",
            "Northwest Stadium - Washington Commanders",
        ],
        key_features=[
            "NFL's largest 4K video boards",
            "10-year parts and labor warranty",
            "Ross Video Control Integration",
            "Rights to sell in-venue advertising",
            "Ongoing technical support and game-day operations",
        ],
        installation_complexity="Very High",
    ),
    # ------------------------------------------------------------------------
    # NBA ARENA TEMPLATE
    # ------------------------------------------------------------------------
    "nba_arena": IndustryTemplate(
        template_id="nba_arena",
        venue_type=VenueType.NBA,
        name="NBA Arena Template",
        description="Professional basketball arena with fine pitch displays for clubs, ribbon boards, and event support",
        target_price_range="$2M - $8M",
        # Displays: Center hung 6mm, fine pitch clubs, ribbons
        displays=[
            DisplayConfig(
                product_id="samsung_indoor_4mm",
                quantity=1,
                width_ft=30.0,
                height_ft=25.0,
                pixel_pitch_mm=4.0,
                notes="Center hung 4K/6mm display",
            ),
            DisplayConfig(
                product_id="lg_finepitch_indoor_1.5mm",
                quantity=4,
                width_ft=15.0,  # Fine pitch club displays
                height_ft=8.0,
                pixel_pitch_mm=1.5,
                notes="Fine pitch club and hospitality displays (4x)",
            ),
            DisplayConfig(
                product_id="ribbon_premium_6mm",
                quantity=2,
                width_ft=300.0,
                height_ft=2.5,
                pixel_pitch_mm=6.0,
                notes="Premium club-level ribbon displays",
            ),
            DisplayConfig(
                product_id="ribbon_concourse_10mm",
                quantity=1,
                width_ft=200.0,
                height_ft=3.0,
                pixel_pitch_mm=10.0,
                notes="Concourse concourse ribbon",
            ),
        ],
        # Software: LiveSync Enterprise
        cms_type="livesync_per_venue",
        software_features=[
            "24/7 Scheduling",
            "Live Sports Integration",
            "Data Feeds (Scoring, Social Media)",
            "Multi-Screen Synchronization",
            "Advertising Management",
            "Content Library Management",
            "Remote Access",
        ],
        # Installation: Indoor arena installation
        installation_type="retrofit",  # Typically retrofits in existing arenas
        access_method="lift",  # Lift needed for center hung
        structural_support="existing",  # Existing structure
        electrical_capacity="adequate",
        distance_to_power_ft=100.0,
        # Service: Silver event-only support
        service_level=ServiceLevel.SILVER,
        # Timeline: Standard 8-12 weeks
        timeline_type=TimelineType.STANDARD,
        duration_weeks=8,
        # Pricing: 32% margin (higher for arenas), 5% contingency
        target_margin_pct=0.32,
        contingency_pct=0.05,
        # Metadata
        typical_project_value_range="$2M - $8M",
        example_projects=[
            "Gainbridge Fieldhouse - Indiana Pacers + Indiana Fever (2010)",
            "Rocket Mortgage FieldHouse",
            "American Airlines Center",
        ],
        key_features=[
            "4mm center hung with underbelly",
            "600+ sq ft of fine pitch technology",
            "Six massive endzone wall displays",
            "Selfie wall and VIP displays",
            "Ongoing service since 2010 for Pacers",
        ],
        installation_complexity="High",
    ),
    # ------------------------------------------------------------------------
    # NCAA STADIUM TEMPLATE
    # ------------------------------------------------------------------------
    "ncaa_stadium": IndustryTemplate(
        template_id="ncaa_stadium",
        venue_type=VenueType.NCAA,
        name="College Stadium Template",
        description="College athletics venue with standard displays and basic maintenance package",
        target_price_range="$1M - $5M",
        # Displays: Scoreboard, ribbons, concourse displays
        displays=[
            DisplayConfig(
                product_id="scoreboard_4k_main",
                quantity=1,
                width_ft=35.0,
                height_ft=25.0,
                pixel_pitch_mm=4.0,
                notes="Main center hung scoreboard 4K",
            ),
            DisplayConfig(
                product_id="ribbon_concourse_10mm",
                quantity=2,
                width_ft=400.0,
                height_ft=3.0,
                pixel_pitch_mm=10.0,
                notes="Concourse ribbon boards (2x)",
            ),
            DisplayConfig(
                product_id="ribbon_vomitory_10mm",
                quantity=4,
                width_ft=20.0,  # Vomitory displays
                height_ft=10.0,
                pixel_pitch_mm=10.0,
                notes="Vomitory entrance displays (4x)",
            ),
        ],
        # Software: LiveSync Per Screen
        cms_type="livesync_per_screen",
        software_features=[
            "24/7 Scheduling",
            "Live Sports Integration",
            "Data Feeds (Scoring)",
            "Multi-Screen Synchronization",
            "Basic Advertising Management",
        ],
        # Installation: Standard outdoor installation
        installation_type="retrofit",  # Often retrofit in existing stadiums
        access_method="front",  # Front access typical
        structural_support="existing",
        electrical_capacity="limited",  # May need upgrades
        distance_to_power_ft=120.0,
        # Service: Bronze basic maintenance
        service_level=ServiceLevel.BRONZE,
        # Timeline: Standard 8-12 weeks
        timeline_type=TimelineType.STANDARD,
        duration_weeks=8,
        # Pricing: 28% margin, 5% contingency
        target_margin_pct=0.28,
        contingency_pct=0.05,
        # Metadata
        typical_project_value_range="$1M - $5M",
        example_projects=[
            "University of Texas - Darrell K Royal Stadium",
            "University of Notre Dame - Notre Dame Stadium",
            "University of Arkansas - Razorback Stadium",
        ],
        key_features=[
            "4K video scoreboard",
            "Concourse ribbon boards",
            "Vomitory displays",
            "10-year warranty",
            "Basic maintenance package",
        ],
        installation_complexity="Standard",
    ),
    # ------------------------------------------------------------------------
    # TRANSIT HUB TEMPLATE
    # ------------------------------------------------------------------------
    "transit_hub": IndustryTemplate(
        template_id="transit_hub",
        venue_type=VenueType.TRANSIT,
        name="Transit Hub Template",
        description="Transportation center with information displays, wayfinding, and 24/7 operation",
        target_price_range="$500K - $3M",
        # Displays: Kiosks, information displays, facade
        displays=[
            DisplayConfig(
                product_id="kiosk_information_43",
                quantity=10,
                width_ft=0.0,  # Fixed size kiosks
                height_ft=0.0,
                pixel_pitch_mm=1.5,
                notes="Information display kiosks (10x)",
            ),
            DisplayConfig(
                product_id="kiosk_interactive_55",
                quantity=5,
                width_ft=0.0,  # Fixed size kiosks
                height_ft=0.0,
                pixel_pitch_mm=0.55,
                notes="Interactive wayfinding kiosks (5x)",
            ),
            DisplayConfig(
                product_id="facade_outdoor_6mm",
                quantity=2,
                width_ft=30.0,  # Exterior facade
                height_ft=20.0,
                pixel_pitch_mm=6.0,
                notes="Exterior building facade displays (2x)",
            ),
        ],
        # Software: LiveSync Enterprise
        cms_type="livesync_per_venue",
        software_features=[
            "24/7 Scheduling",
            "Emergency Messaging",
            "Data Feeds (Arrivals, Departures)",
            "Wayfinding Integration",
            "Multi-Screen Synchronization",
            "User Role Management",
            "Remote Access",
        ],
        # Installation: Complex installation in transit environment
        installation_type="upgrade",  # Upgrading existing infrastructure
        access_method="lift",  # Lift required
        structural_support="existing",
        electrical_capacity="limited",  # Usually needs electrical work
        distance_to_power_ft=80.0,  # Shorter distances in stations
        # Service: Gold 24/7 (transit requires 24/7)
        service_level=ServiceLevel.GOLD,
        # Timeline: Rush (transit projects often fast-tracked)
        timeline_type=TimelineType.RUSH,
        duration_weeks=6,
        # Pricing: 25% margin, 5% contingency
        target_margin_pct=0.25,
        contingency_pct=0.05,
        # Metadata
        typical_project_value_range="$500K - $3M",
        example_projects=[
            "Moynihan Train Hall - NYC (2021)",
            "Westfield World Trade Center",
            "Pier 17 - Seaport District NYC",
        ],
        key_features=[
            "Digital information kiosks",
            "Interactive wayfinding",
            "24/7 operation required",
            "Emergency messaging integration",
            "Daily maintenance schedule",
        ],
        installation_complexity="High",
    ),
    # ------------------------------------------------------------------------
    # CORPORATE TEMPLATE
    # ------------------------------------------------------------------------
    "corporate": IndustryTemplate(
        template_id="corporate",
        venue_type=VenueType.CORPORATE,
        name="Corporate Space Template",
        description="Corporate flagship, office building, or retail space with premium displays and basic support",
        target_price_range="$200K - $2M",
        # Displays: Fine pitch displays, kiosks, digital signage
        displays=[
            DisplayConfig(
                product_id="lg_finepitch_indoor_1.5mm",
                quantity=2,
                width_ft=20.0,  # Lobby displays
                height_ft=12.0,
                pixel_pitch_mm=1.5,
                notes="Fine pitch lobby displays (2x)",
            ),
            DisplayConfig(
                product_id="samsung_indoor_4mm",
                quantity=3,
                width_ft=15.0,  # Office displays
                height_ft=10.0,
                pixel_pitch_mm=4.0,
                notes="Office digital signage (3x)",
            ),
            DisplayConfig(
                product_id="kiosk_interactive_55",
                quantity=2,
                width_ft=0.0,
                height_ft=0.0,
                pixel_pitch_mm=0.55,
                notes="Interactive reception kiosks (2x)",
            ),
        ],
        # Software: Third-party CMS (corporate often uses existing systems)
        cms_type="third_party_cms",
        software_features=[
            "Content Management",
            "Scheduling",
            "Remote Access",
            "Basic Analytics",
        ],
        # Installation: Standard corporate installation
        installation_type="retrofit",
        access_method="front",  # Front access typical
        structural_support="truss",  # Truss systems common in corporate
        electrical_capacity="adequate",
        distance_to_power_ft=50.0,
        # Service: Bronze basic maintenance
        service_level=ServiceLevel.BRONZE,
        # Timeline: Standard
        timeline_type=TimelineType.STANDARD,
        duration_weeks=6,
        # Pricing: 30% margin, 5% contingency
        target_margin_pct=0.30,
        contingency_pct=0.05,
        # Metadata
        typical_project_value_range="$200K - $2M",
        example_projects=[
            "JP Morgan Chase Flagship Branch",
            "Wells Fargo Center Exterior Facade",
            "Corporate retail flagship spaces",
        ],
        key_features=[
            "Fine pitch lobby displays",
            "Interactive kiosks",
            "Digital signage",
            "Integration with existing CMS",
            "5-year warranty",
        ],
        installation_complexity="Standard",
    ),
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================


def get_template(template_id: str) -> Optional[IndustryTemplate]:
    """Retrieve template by ID"""
    return ANC_INDUSTRY_TEMPLATES.get(template_id)


def get_templates_by_venue_type(venue_type: VenueType) -> List[IndustryTemplate]:
    """Get all templates for a venue type"""
    return [t for t in ANC_INDUSTRY_TEMPLATES.values() if t.venue_type == venue_type]


def get_all_templates() -> Dict[str, IndustryTemplate]:
    """Get all industry templates"""
    return ANC_INDUSTRY_TEMPLATES


def get_template_summary(template_id: str) -> Optional[Dict[str, Any]]:
    """Get summary of template for quick display"""
    template = get_template(template_id)
    if not template:
        return None

    return {
        "template_id": template.template_id,
        "name": template.name,
        "venue_type": template.venue_type.value,
        "description": template.description,
        "target_price": template.target_price_range,
        "num_displays": len(template.displays),
        "service_level": template.service_level.value,
        "timeline_weeks": template.duration_weeks,
        "target_margin": f"{template.target_margin_pct * 100:.0f}%",
        "example_projects": template.example_projects,
        "key_features": template.key_features,
    }


def get_recommended_template_for_budget(budget: float) -> Optional[IndustryTemplate]:
    """
    Recommend template based on budget
    Returns best match for given budget range
    """
    # Parse budget to get numeric value
    if isinstance(budget, str):
        budget_str = budget.replace("$", "").replace("M", "000000").replace("K", "000")
        budget = float(budget_str)

    for template in ANC_INDUSTRY_TEMPLATES.values():
        # Parse template price range
        price_range = template.target_price_range
        min_price = float(
            price_range.split("-")[0].replace("$", "").replace("M", "000000")
        )
        max_price = float(
            price_range.split("-")[1].replace("$", "").replace("M", "000000")
        )

        # Check if budget falls within range
        if min_price <= budget <= max_price:
            return template

    # Return default if no match
    return get_template("nfl_stadium")


def create_custom_template(
    name: str, venue_type: VenueType, **kwargs
) -> IndustryTemplate:
    """
    Create custom template based on base template with overrides
    Allows users to start from template and modify
    """
    base_template = get_templates_by_venue_type(venue_type)[0]
    if not base_template:
        raise ValueError(f"No template found for venue type: {venue_type}")

    # Override with custom values
    return IndustryTemplate(
        template_id=f"custom_{venue_type.value}",
        venue_type=venue_type,
        name=name,
        description=f"Custom configuration based on {base_template.name}",
        target_price_range="Custom",
        displays=kwargs.get("displays", base_template.displays),
        cms_type=kwargs.get("cms_type", base_template.cms_type),
        software_features=kwargs.get(
            "software_features", base_template.software_features
        ),
        installation_type=kwargs.get(
            "installation_type", base_template.installation_type
        ),
        access_method=kwargs.get("access_method", base_template.access_method),
        structural_support=kwargs.get(
            "structural_support", base_template.structural_support
        ),
        electrical_capacity=kwargs.get(
            "electrical_capacity", base_template.electrical_capacity
        ),
        distance_to_power_ft=kwargs.get(
            "distance_to_power_ft", base_template.distance_to_power_ft
        ),
        service_level=kwargs.get("service_level", base_template.service_level),
        timeline_type=kwargs.get("timeline_type", base_template.timeline_type),
        duration_weeks=kwargs.get("duration_weeks", base_template.duration_weeks),
        target_margin_pct=kwargs.get(
            "target_margin_pct", base_template.target_margin_pct
        ),
        contingency_pct=kwargs.get("contingency_pct", base_template.contingency_pct),
        typical_project_value_range="Custom",
        example_projects=[],
        key_features=kwargs.get("key_features", []),
        installation_complexity=kwargs.get("installation_complexity", "Standard"),
    )

    )

# Export for easy access
__all__ = [
    "ANC_INDUSTRY_TEMPLATES",
    "VenueType",
    "ServiceLevel",
    "TimelineType",
    "IndustryTemplate",
    "DisplayConfig",
    "get_template",
    "get_templates_by_venue_type",
    "get_all_templates",
    "get_template_summary",
    "get_recommended_template_for_budget",
    "create_custom_template",
]
