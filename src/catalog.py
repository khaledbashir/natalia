"""
ANC Product Catalog
Comprehensive product database based on ANC's actual offerings
Source: ANC website analysis and industry standards
"""

from dataclasses import dataclass
from enum import Enum
from typing import Dict, List, Optional


class Manufacturer(str, Enum):
    LG = "lg"
    SAMSUNG = "samsung"
    SONY = "sony"
    DAKTRONICS = "daktronics"
    BARCO = "barco"
    UNIQLED = "uniqled"


class DisplayCategory(str, Enum):
    CENTER_HUNG = "center_hung"
    RIBBON = "ribbon"
    SCOREBOARD = "scoreboard"
    FINE_PITCH = "fine_pitch"
    ENDZONE = "endzone"
    KIOSK = "kiosk"
    FACADE = "facade"


class ServiceLevel(str, Enum):
    GOLD = "gold"  # 24/7 Full Support
    SILVER = "silver"  # Event-Only Support
    BRONZE = "bronze"  # Basic Maintenance
    SELF = "self"  # Self-Service


class SoftwareType(str, Enum):
    LIVESYNC = "livesync"
    THIRD_PARTY = "third_party"
    MANUAL = "manual"
    RECOMMEND = "recommend"


@dataclass
class ProductSpec:
    """Product specification details"""

    name: str
    manufacturer: Manufacturer
    category: DisplayCategory
    pixel_pitch_mm: float
    brightness_nits: int
    ip_rating: str
    typical_resolutions: List[str]
    uefa_certified: bool = False
    nfl_certified: bool = False
    weight_per_sqft: float = 0.0
    power_consumption_watts_per_sqft: float = 0.0


@dataclass
class DisplayProduct:
    """Complete LED display product with pricing"""

    spec: ProductSpec
    base_price_per_sqft: float  # USD per square foot
    installation_time_hours_per_sqft: float
    maintenance_annual_pct: float = 0.05  # 5% of cost annually
    warranty_years: int = 5
    typical_applications: List[str] = None
    min_order_sqft: Optional[float] = None
    bulk_discount_threshold: Optional[float] = None
    bulk_discount_pct: Optional[float] = None


@dataclass
class SoftwareLicense:
    """Software/CMS licensing options"""

    name: str
    type: SoftwareType
    license_model: str  # "per_screen", "per_venue", "enterprise"
    annual_cost: float
    one_time_cost: float = 0.0
    features: List[str] = None
    max_displays: Optional[int] = None


@dataclass
class ServicePackage:
    """Service and support packages"""

    level: ServiceLevel
    name: str
    annual_cost_pct: float  # Percentage of project value annually
    includes: List[str]
    response_time_hours: int
    on_site_availability: str
    game_day_operations: bool = False
    preventative_maintenance: bool = False


# ============================================================================
# ANC DISPLAY PRODUCTS
# ============================================================================

ANC_PRODUCTS: Dict[str, DisplayProduct] = {
    # ------------------- CENTER HUNG DISPLAYS -------------------
    "lg_gppa062_outdoor_6mm": DisplayProduct(
        spec=ProductSpec(
            name="LG GPPA062 Outdoor",
            manufacturer=Manufacturer.LG,
            category=DisplayCategory.CENTER_HUNG,
            pixel_pitch_mm=6.0,
            brightness_nits=6000,
            ip_rating="IP67",
            typical_resolutions=["4K", "8K"],
            uefa_certified=True,
            nfl_certified=True,
            weight_per_sqft=35.0,
            power_consumption_watts_per_sqft=180.0,
        ),
        base_price_per_sqft=1800.0,
        installation_time_hours_per_sqft=0.8,
        typical_applications=[
            "NFL Stadiums",
            "NBA Arenas",
            "College Stadiums",
            "High-traffic outdoor venues",
        ],
        min_order_sqft=100.0,
    ),
    "lg_finepitch_indoor_1.5mm": DisplayProduct(
        spec=ProductSpec(
            name="LG Fine Pitch Indoor",
            manufacturer=Manufacturer.LG,
            category=DisplayCategory.FINE_PITCH,
            pixel_pitch_mm=1.5,
            brightness_nits=1200,
            ip_rating="IP20",
            typical_resolutions=["4K", "8K"],
            weight_per_sqft=25.0,
            power_consumption_watts_per_sqft=90.0,
        ),
        base_price_per_sqft=3500.0,
        installation_time_hours_per_sqft=1.2,
        typical_applications=[
            "Club Level Displays",
            "Hospitality Suites",
            "Premium Seating Areas",
            "Corporate Lobbies",
        ],
        min_order_sqft=50.0,
    ),
    "samsung_indoor_4mm": DisplayProduct(
        spec=ProductSpec(
            name="Samsung Indoor Series",
            manufacturer=Manufacturer.SAMSUNG,
            category=DisplayCategory.CENTER_HUNG,
            pixel_pitch_mm=4.0,
            brightness_nits=1000,
            ip_rating="IP20",
            typical_resolutions=["4K", "8K"],
            weight_per_sqft=30.0,
            power_consumption_watts_per_sqft=120.0,
        ),
        base_price_per_sqft=2500.0,
        installation_time_hours_per_sqft=0.9,
        typical_applications=["NBA Arenas", "Indoor Arenas", "Convention Centers"],
    ),
    # ------------------- RIBBON BOARDS -------------------
    "ribbon_concourse_10mm": DisplayProduct(
        spec=ProductSpec(
            name="Concourse Ribbon Display",
            manufacturer=Manufacturer.LG,
            category=DisplayCategory.RIBBON,
            pixel_pitch_mm=10.0,
            brightness_nits=4000,
            ip_rating="IP65",
            typical_resolutions=["HD"],
            weight_per_sqft=28.0,
            power_consumption_watts_per_sqft=150.0,
        ),
        base_price_per_sqft=900.0,
        installation_time_hours_per_sqft=0.6,
        typical_applications=[
            "Fascia Displays",
            "Concourse Advertising",
            "Walkway Signage",
            "Transit Hub Information",
        ],
    ),
    "ribbon_premium_6mm": DisplayProduct(
        spec=ProductSpec(
            name="Premium Fascia Ribbon",
            manufacturer=Manufacturer.LG,
            category=DisplayCategory.RIBBON,
            pixel_pitch_mm=6.0,
            brightness_nits=5000,
            ip_rating="IP65",
            typical_resolutions=["4K"],
            weight_per_sqft=32.0,
            power_consumption_watts_per_sqft=160.0,
        ),
        base_price_per_sqft=1400.0,
        installation_time_hours_per_sqft=0.7,
        typical_applications=["Premium Suites", "Club Level Fascia", "VIP Areas"],
    ),
    "ribbon_vomitory_10mm": DisplayProduct(
        spec=ProductSpec(
            name="Vomitory Entrance Ribbon",
            manufacturer=Manufacturer.LG,
            category=DisplayCategory.RIBBON,
            pixel_pitch_mm=10.0,
            brightness_nits=4500,
            ip_rating="IP65",
            typical_resolutions=["HD"],
            weight_per_sqft=30.0,
            power_consumption_watts_per_sqft=155.0,
        ),
        base_price_per_sqft=1100.0,
        installation_time_hours_per_sqft=0.65,
        typical_applications=[
            "Entrance Displays",
            "Vomitory Signage",
            "Tunnel Advertising",
        ],
    ),
    # ------------------- SCOREBOARDS -------------------
    "scoreboard_4k_main": DisplayProduct(
        spec=ProductSpec(
            name="Main Center Hung Scoreboard 4K",
            manufacturer=Manufacturer.DAKTRONICS,
            category=DisplayCategory.SCOREBOARD,
            pixel_pitch_mm=4.0,
            brightness_nits=7000,
            ip_rating="IP67",
            typical_resolutions=["4K"],
            nfl_certified=True,
            weight_per_sqft=40.0,
            power_consumption_watts_per_sqft=200.0,
        ),
        base_price_per_sqft=2200.0,
        installation_time_hours_per_sqft=1.0,
        typical_applications=[
            "NFL Stadiums",
            "Major League Baseball",
            "College Football",
        ],
    ),
    "scoreboard_traditional": DisplayProduct(
        spec=ProductSpec(
            name="Traditional Scoreboard",
            manufacturer=Manufacturer.DAKTRONICS,
            category=DisplayCategory.SCOREBOARD,
            pixel_pitch_mm=10.0,
            brightness_nits=8000,
            ip_rating="IP67",
            typical_resolutions=["HD"],
            weight_per_sqft=35.0,
            power_consumption_watts_per_sqft=180.0,
        ),
        base_price_per_sqft=800.0,
        installation_time_hours_per_sqft=0.5,
        typical_applications=[
            "High School Fields",
            "College Practice Fields",
            "Minor League Stadiums",
        ],
    ),
    # ------------------- ENDZONE DISPLAYS -------------------
    "endzone_large_format_4k": DisplayProduct(
        spec=ProductSpec(
            name="Endzone Wall Display 4K",
            manufacturer=Manufacturer.LG,
            category=DisplayCategory.ENDZONE,
            pixel_pitch_mm=4.0,
            brightness_nits=7000,
            ip_rating="IP67",
            typical_resolutions=["4K"],
            nfl_certified=True,
            weight_per_sqft=38.0,
            power_consumption_watts_per_sqft=190.0,
        ),
        base_price_per_sqft=2000.0,
        installation_time_hours_per_sqft=0.9,
        typical_applications=[
            "NFL Endzone Displays",
            "College Football",
            "Soccer Stadiums",
        ],
    ),
    # ------------------- DIGITAL KIOSKS -------------------
    "kiosk_interactive_55": DisplayProduct(
        spec=ProductSpec(
            name='Interactive Digital Kiosk 55"',
            manufacturer=Manufacturer.LG,
            category=DisplayCategory.KIOSK,
            pixel_pitch_mm=0.55,
            brightness_nits=500,
            ip_rating="IP54",
            typical_resolutions=["4K"],
            weight_per_sqft=0.0,  # Not applicable
            power_consumption_watts_per_sqft=0.0,
        ),
        base_price_per_sqft=0.0,  # Fixed price per unit
        installation_time_hours_per_sqft=0.0,
        typical_applications=[
            "Transit Hub Wayfinding",
            "Corporate Information",
            "Museum Interactives",
        ],
    ),
    "kiosk_information_43": DisplayProduct(
        spec=ProductSpec(
            name='Information Display Kiosk 43"',
            manufacturer=Manufacturer.SAMSUNG,
            category=DisplayCategory.KIOSK,
            pixel_pitch_mm=1.5,
            brightness_nits=800,
            ip_rating="IP54",
            typical_resolutions=["4K"],
            weight_per_sqft=0.0,
            power_consumption_watts_per_sqft=0.0,
        ),
        base_price_per_sqft=0.0,
        installation_time_hours_per_sqft=0.0,
        typical_applications=["Train Stations", "Airports", "Shopping Centers"],
    ),
    # ------------------- EXTERIOR FACADE -------------------
    "facade_outdoor_6mm": DisplayProduct(
        spec=ProductSpec(
            name="Exterior Facade Display",
            manufacturer=Manufacturer.BARCO,
            category=DisplayCategory.FACADE,
            pixel_pitch_mm=6.0,
            brightness_nits=6000,
            ip_rating="IP68",
            typical_resolutions=["4K", "8K"],
            weight_per_sqft=35.0,
            power_consumption_watts_per_sqft=175.0,
        ),
        base_price_per_sqft=1600.0,
        installation_time_hours_per_sqft=1.1,
        typical_applications=[
            "Building Facades",
            "Times Square Displays",
            "Downtown Signage",
        ],
    ),
}


# ============================================================================
# SOFTWARE & CMS
# ============================================================================

ANC_SOFTWARE: Dict[str, SoftwareLicense] = {
    "livesync_per_screen": SoftwareLicense(
        name="LiveSync Venue Control - Per Screen",
        type=SoftwareType.LIVESYNC,
        license_model="per_screen",
        annual_cost=2000.0,
        features=[
            "Multi-screen synchronization",
            "24/7 scheduling",
            "Live sports integration",
            "Data feed integration (scoring, social media)",
            "Emergency messaging",
            "Advertising management",
            "User role management",
            "Remote access",
            "Analytics dashboard",
        ],
        max_displays=9999,
    ),
    "livesync_per_venue": SoftwareLicense(
        name="LiveSync Venue Control - Enterprise",
        type=SoftwareType.LIVESYNC,
        license_model="per_venue",
        annual_cost=50000.0,
        features=[
            "Unlimited displays per venue",
            "Full venue control",
            "Multi-venue management",
            "API access",
            "Custom integrations",
            "Priority support",
            "Advanced analytics",
            "Content library management",
            "Automated scheduling",
        ],
        max_displays=None,  # Unlimited
    ),
    "third_party_cms": SoftwareLicense(
        name="Third-Party CMS Integration",
        type=SoftwareType.THIRD_PARTY,
        license_model="per_venue",
        one_time_cost=25000.0,
        annual_cost=0.0,
        features=[
            "Integration with existing CMS",
            "Standard display drivers",
            "Basic scheduling",
            "Content management",
        ],
    ),
    "manual_control": SoftwareLicense(
        name="Manual Control System",
        type=SoftwareType.MANUAL,
        license_model="per_venue",
        annual_cost=0.0,
        one_time_cost=10000.0,
        features=[
            "Basic control equipment",
            "Manual switching",
            "Simple content playback",
        ],
    ),
}


# ============================================================================
# SERVICE PACKAGES
# ============================================================================

ANC_SERVICE_PACKAGES: Dict[str, ServicePackage] = {
    "gold_24x7": ServicePackage(
        level=ServiceLevel.GOLD,
        name="Gold - 24/7 Full Support",
        annual_cost_pct=0.15,  # 15% of project value annually
        includes=[
            "On-site technicians (permanently stationed)",
            "24/7/365 technical support hotline",
            "Game-day operations staffing",
            "Preventative maintenance (monthly)",
            "Content support and scheduling",
            "2-hour response time SLA",
            "Priority parts replacement",
            "Firmware updates",
            "Training sessions",
        ],
        response_time_hours=2,
        on_site_availability="24/7",
        game_day_operations=True,
        preventative_maintenance=True,
    ),
    "silver_event_only": ServicePackage(
        level=ServiceLevel.SILVER,
        name="Silver - Event-Only Support",
        annual_cost_pct=0.08,  # 8% of project value annually
        includes=[
            "Event day staffing",
            "On-site technician coordination",
            "Basic maintenance",
            "Remote support",
            "24-hour response time SLA",
            "Scheduled maintenance (quarterly)",
            "Content scheduling support",
            "Emergency response",
        ],
        response_time_hours=24,
        on_site_availability="Event days only",
        game_day_operations=True,
        preventative_maintenance=True,
    ),
    "bronze_basic": ServicePackage(
        level=ServiceLevel.BRONZE,
        name="Bronze - Basic Maintenance",
        annual_cost_pct=0.05,  # 5% of project value annually
        includes=[
            "Preventative maintenance",
            "Remote support",
            "48-hour response time SLA",
            "Scheduled maintenance (semi-annual)",
            "Phone support (business hours)",
            "Basic troubleshooting",
            "Firmware updates",
        ],
        response_time_hours=48,
        on_site_availability="As scheduled",
        game_day_operations=False,
        preventative_maintenance=True,
    ),
    "self_service": ServicePackage(
        level=ServiceLevel.SELF,
        name="Self-Service",
        annual_cost_pct=0.0,  # No annual cost
        includes=[
            "Training provided at installation",
            "Documentation and manuals",
            "Support available on-demand ($150/hour)",
            "Software updates included",
            "Best practices guide",
        ],
        response_time_hours=72,
        on_site_availability="None",
        game_day_operations=False,
        preventative_maintenance=False,
    ),
}


# ============================================================================
# INDUSTRY TEMPLATES
# ============================================================================


@dataclass
class IndustryTemplate:
    """Pre-configured venue templates for quick setup"""

    venue_type: str
    template_name: str
    description: str
    typical_displays: List[str]  # Product IDs
    default_software: str
    default_service: str
    default_margin_pct: float
    target_price_range: str
    includes: List[str]
    example_projects: List[str]


ANC_INDUSTRY_TEMPLATES: Dict[str, IndustryTemplate] = {
    "nfl_stadium": IndustryTemplate(
        venue_type="NFL Stadium",
        template_name="NFL Stadium Template",
        description="Professional football stadium configuration with premium displays and full-service support",
        typical_displays=[
            "lg_gppa062_outdoor_6mm",
            "ribbon_concourse_10mm",
            "ribbon_premium_6mm",
            "endzone_large_format_4k",
        ],
        default_software="livesync_per_venue",
        default_service="gold_24x7",
        default_margin_pct=0.30,
        target_price_range="$5M - $15M",
        includes=[
            "Center Hung 4K display",
            "Concourse ribbon boards",
            "Endzone displays",
            "LiveSync Enterprise license",
            "Gold 24/7 service package",
            "Game-day operations staffing",
            "10-year warranty",
        ],
        example_projects=[
            "Levi's Stadium - San Francisco 49ers",
            "M&T Bank Stadium - Baltimore Ravens",
            "Northwest Stadium - Washington Commanders",
        ],
    ),
    "nba_arena": IndustryTemplate(
        venue_type="NBA Arena",
        template_name="NBA Arena Template",
        description="Professional basketball arena with fine pitch displays and event support",
        typical_displays=[
            "lg_finepitch_indoor_1.5mm",
            "samsung_indoor_4mm",
            "ribbon_premium_6mm",
            "ribbon_concourse_10mm",
        ],
        default_software="livesync_per_venue",
        default_service="silver_event_only",
        default_margin_pct=0.32,
        target_price_range="$2M - $8M",
        includes=[
            "Center Hung 6mm or 4mm display",
            "Fine pitch club displays",
            "Premium ribbon boards",
            "LiveSync Enterprise license",
            "Silver event support package",
            "5-year warranty",
        ],
        example_projects=[
            "Gainbridge Fieldhouse - Indiana Pacers",
            "Rocket Mortgage FieldHouse",
            "American Airlines Center",
        ],
    ),
    "ncaa_stadium": IndustryTemplate(
        venue_type="NCAA Stadium",
        template_name="College Stadium Template",
        description="College athletics venue with standard displays and basic support",
        typical_displays=[
            "scoreboard_4k_main",
            "ribbon_concourse_10mm",
            "ribbon_vomitory_10mm",
        ],
        default_software="livesync_per_screen",
        default_service="bronze_basic",
        default_margin_pct=0.28,
        target_price_range="$1M - $5M",
        includes=[
            "Main scoreboard display",
            "Concourse ribbon boards",
            "Vomitory displays",
            "LiveSync per-screen license",
            "Bronze basic maintenance",
            "7-year warranty",
        ],
        example_projects=[
            "University of Texas",
            "University of Notre Dame",
            "University of Arkansas",
        ],
    ),
    "transit_hub": IndustryTemplate(
        venue_type="Transit Hub",
        template_name="Transit Hub Template",
        description="Transportation center with information displays and 24/7 operation",
        typical_displays=[
            "kiosk_information_43",
            "kiosk_interactive_55",
            "facade_outdoor_6mm",
        ],
        default_software="livesync_per_venue",
        default_service="gold_24x7",
        default_margin_pct=0.25,
        target_price_range="$500K - $3M",
        includes=[
            "Digital information kiosks",
            "Interactive wayfinding",
            "Exterior facade displays",
            "LiveSync Enterprise license",
            "Gold 24/7 service package",
            "Emergency messaging integration",
            "Daily maintenance",
        ],
        example_projects=[
            "Moynihan Train Hall",
            "Westfield World Trade Center",
            "Pier 17 - Seaport District NYC",
        ],
    ),
    "corporate": IndustryTemplate(
        venue_type="Corporate",
        template_name="Corporate Space Template",
        description="Corporate flagship or office building with premium displays",
        typical_displays=[
            "lg_finepitch_indoor_1.5mm",
            "samsung_indoor_4mm",
            "kiosk_interactive_55",
        ],
        default_software="third_party_cms",
        default_service="bronze_basic",
        default_margin_pct=0.30,
        target_price_range="$200K - $2M",
        includes=[
            "Fine pitch lobby displays",
            "Interactive kiosks",
            "Digital signage",
            "Third-party CMS integration",
            "Bronze basic maintenance",
            "5-year warranty",
        ],
        example_projects=[
            "JP Morgan Chase Flagship",
            "Wells Fargo Center Exterior Facade",
            "Corporate retail spaces",
        ],
    ),
}


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================


def get_product_by_id(product_id: str) -> Optional[DisplayProduct]:
    """Retrieve product by ID"""
    return ANC_PRODUCTS.get(product_id)


def get_products_by_category(category: DisplayCategory) -> List[DisplayProduct]:
    """Get all products in a category"""
    return [prod for prod in ANC_PRODUCTS.values() if prod.spec.category == category]


def get_software_by_type(software_type: SoftwareType) -> Optional[SoftwareLicense]:
    """Retrieve software by type"""
    for sw in ANC_SOFTWARE.values():
        if sw.type == software_type:
            return sw
    return None


def get_service_package(level: ServiceLevel) -> Optional[ServicePackage]:
    """Retrieve service package by level"""
    for pkg in ANC_SERVICE_PACKAGES.values():
        if pkg.level == level:
            return pkg
    return None


def get_industry_template(venue_type: str) -> Optional[IndustryTemplate]:
    """Get template by venue type"""
    for template in ANC_INDUSTRY_TEMPLATES.values():
        if (
            template.venue_type == venue_type
            or venue_type in template.template_name.lower()
        ):
            return template
    return None


def calculate_bulk_discount(total_sqft: float, product_id: str) -> float:
    """
    Calculate bulk discount percentage if applicable
    """
    product = get_product_by_id(product_id)
    if not product:
        return 0.0

    if (
        product.bulk_discount_threshold
        and total_sqft >= product.bulk_discount_threshold
    ):
        return product.bulk_discount_pct or 0.0

    return 0.0


def get_recommended_product_for_venue(
    venue_type: str, display_category: DisplayCategory
) -> Optional[str]:
    """
    Get recommended product ID based on venue type and display category
    """
    template = get_industry_template(venue_type)
    if not template:
        return None

    # Match display category to products in template
    for display_id in template.typical_displays:
        product = get_product_by_id(display_id)
        if product and product.spec.category == display_category:
            return display_id

    # Fallback to category default
    category_products = get_products_by_category(display_category)
    if category_products:
        return list(category_products)[0].__dict__.get(
            "__product_id", list(ANC_PRODUCTS.keys())[0]
        )

    return None


# Export constants for easy access
__all__ = [
    "ANC_PRODUCTS",
    "ANC_SOFTWARE",
    "ANC_SERVICE_PACKAGES",
    "ANC_INDUSTRY_TEMPLATES",
    "get_product_by_id",
    "get_products_by_category",
    "get_software_by_type",
    "get_service_package",
    "get_industry_template",
    "calculate_bulk_discount",
    "get_recommended_product_for_venue",
]
