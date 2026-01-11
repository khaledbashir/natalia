<file_path>
natalia/src/anc_products.py
</file_path>

<edit_description>
Create ANC Products Catalog with real products from website analysis (LG, Samsung, LiveSync, service packages)
</edit_description>

"""
ANC Products Catalog
Real ANC products and services based on website analysis
Source: ANC.com
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional


class DisplayCategory(str, Enum):
    CENTER_HUNG = "center_hung"
    RIBBON = "ribbon"
    SCOREBOARD = "scoreboard"
    FINE_PITCH = "fine_pitch"
    ENDZONE = "endzone"
    KIOSK = "kiosk"
    FACADE = "facade"


class SoftwareType(str, Enum):
    LIVESYNC = "livesync"
    THIRD_PARTY = "third_party"
    MANUAL = "manual"


class ServiceLevel(str, Enum):
    GOLD = "gold"  # 24/7 Full Support
    SILVER = "silver"  # Event-Only Support
    BRONZE = "bronze"  # Basic Maintenance
    SELF = "self"  # Self-Service


class InstallationType(str, Enum):
    NEW = "new"
    RETROFIT = "retrofit"
    UPGRADE = "upgrade"


class AccessMethod(str, Enum):
    FRONT = "front"
    REAR = "rear"
    LIFT = "lift"
    CRANE = "crane"


@dataclass
class ProductSpec:
    """Product specification details"""

    name: str
    manufacturer: str
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
    features: List[str]
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
    key_features: List[str]


# ============================================================================
# ANC DISPLAY PRODUCTS
# ============================================================================

ANC_PRODUCTS: Dict[str, DisplayProduct] = {
    # ------------------- CENTER HUNG DISPLAYS -------------------
    "lg_gppa062_outdoor_6mm": DisplayProduct(
        spec=ProductSpec(
            name="LG GPPA062 Outdoor",
            manufacturer="LG",
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
            manufacturer="LG",
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
            manufacturer="Samsung",
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
        min_order_sqft=100.0,
    ),

    # ------------------- RIBBON BOARDS -------------------
    "ribbon_concourse_10mm": DisplayProduct(
        spec=ProductSpec(
            name="Concourse Ribbon Display",
            manufacturer="LG",
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
        min_order_sqft=50.0,
    ),

    "ribbon_premium_6mm": DisplayProduct(
        spec=ProductSpec(
            name="Premium Fascia Ribbon",
            manufacturer="LG",
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
        typical_applications=[
            "Premium Suites",
            "Club Level Fascia",
            "VIP Areas",
        ],
        min_order_sqft=50.0,
    ),

    "ribbon_vomitory_10mm": DisplayProduct(
        spec=ProductSpec(
            name="Vomitory Entrance Ribbon",
            manufacturer="LG",
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
        min_order_sqft=50.0,
    ),

    # ------------------- SCOREBOARDS -------------------
    "scoreboard_4k_main": DisplayProduct(
        spec=ProductSpec(
            name="Main Center Hung Scoreboard 4K",
            manufacturer="Daktronics",
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
        min_order_sqft=100.0,
    ),

    "scoreboard_traditional": DisplayProduct(
        spec=ProductSpec(
            name="Traditional Scoreboard",
            manufacturer="Daktronics",
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
        min_order_sqft=100.0,
    ),

    # ------------------- ENDZONE DISPLAYS -------------------
    "endzone_large_format_4k": DisplayProduct(
        spec=ProductSpec(
            name="Endzone Wall Display 4K",
            manufacturer="LG",
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
        min_order_sqft=100.0,
    ),

    # ------------------- DIGITAL KIOSKS -------------------
    "kiosk_interactive_55": DisplayProduct(
        spec=ProductSpec(
            name='Interactive Digital Kiosk 55"',
            manufacturer="LG",
            category=DisplayCategory.KIOSK,
            pixel_pitch_mm=0.55,
            brightness_nits=500,
            ip_rating="IP54",
            typical_resolutions=["4K"],
            weight_per_sqft=0.0,
            power_consumption_watts_per_sqft=0.0,
        ),
        base_price_per_sqft=0.0,
        installation_time_hours_per_sqft=0.0,
        typical_applications=[
            "Transit Hub Wayfinding",
            "Corporate Information",
            "Museum Interactives",
        ],
        min_order_sqft=1,  # Per unit
        bulk_discount_threshold=5,
        bulk_discount_pct=0.10,  # 10% discount for 5+ units
    ),

    "kiosk_information_43": DisplayProduct(
        spec=ProductSpec(
            name='Information Display Kiosk 43"',
            manufacturer="Samsung",
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
        typical_applications=[
            "Train Stations",
            "Airports",
            "Shopping Centers",
        ],
        min_order_sqft=1,
        bulk_discount_threshold=5,
        bulk_discount_pct=0.10,
    ),

    # ------------------- EXTERIOR FACADE -------------------
    "facade_outdoor_6mm": DisplayProduct(
        spec=ProductSpec(
            name="Exterior Facade Display",
            manufacturer="Barco",
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
        min_order_sqft=100.0,
    ),
}


# ============================================================================
# ANC SOFTWARE & CMS
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
        one_time_cost=10000.0,
        features=[
            "Basic control equipment",
            "Manual switching",
            "Simple content playback",
        ],
    ),
}


# ============================================================================
# ANC SERVICE PACKAGES
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
        key_features=[
            "Complete coverage",
            "Game-day execution",
            "Priority support",
        ],
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
        key_features=[
            "Event-focused",
            "Staffing included",
            "Comprehensive support",
        ],
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
        key_features=[
            "Basic coverage",
            "Remote focus",
            "Scheduled maintenance",
        ],
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
        key_features=[
            "Training provided",
            "On-demand support",
            "No ongoing cost",
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


def calculate_bulk_discount(total_sqft: float, product_id: str) -> float:
    """
    Calculate bulk discount percentage if applicable
    """
    product = get_product_by_id(product_id)
    if not product:
        return 0.0

    if product.bulk_discount_threshold and total_sqft >= product.bulk_discount_threshold:
        return product.bulk_discount_pct or 0.0

    return 0.0


def get_recommended_product_for_venue(
    venue_type: str, display_category: DisplayCategory
) -> Optional[str]:
    """
    Get recommended product ID based on venue type and display category
    """
    venue_mappings = {
        "nfl": {
            DisplayCategory.CENTER_HUNG: "lg_gppa062_outdoor_6mm",
            DisplayCategory.RIBBON: "ribbon_premium_6mm",
            DisplayCategory.SCOREBOARD: "scoreboard_4k_main",
        },
        "nba": {
            DisplayCategory.CENTER_HUNG: "lg_finepitch_indoor_1.5mm",
            DisplayCategory.FINE_PITCH: "lg_finepitch_indoor_1.5mm",
            DisplayCategory.RIBBON: "ribbon_premium_6mm",
        },
        "ncaa": {
            DisplayCategory.SCOREBOARD: "scoreboard_4k_main",
            DisplayCategory.RIBBON: "ribbon_concourse_10mm",
        },
        "transit": {
            DisplayCategory.FACADE: "facade_outdoor_6mm",
            DisplayCategory.KIOSK: "kiosk_information_43",
        },
        "corporate": {
            DisplayCategory.FINE_PITCH: "lg_finepitch_indoor_1.5mm",
            DisplayCategory.KIOSK: "kiosk_interactive_55",
        },
    }

    mappings = venue_mappings.get(venue_type.lower(), {})
    return mappings.get(display_category)


def get_display_summary(product_id: str) -> Dict[str, any]:
    """
    Get summary of display for UI display
    """
    product = get_product_by_id(product_id)
    if not product:
        return {}

    return {
        "name": product.spec.name,
        "manufacturer": product.spec.manufacturer,
        "category": product.spec.category.value,
        "pixel_pitch": product.spec.pixel_pitch_mm,
        "brightness": product.spec.brightness_nits,
        "ip_rating": product.spec.ip_rating,
        "resolutions": product.spec.typical_resolutions,
        "certifications": {
            "uefa": product.spec.uefa_certified,
            "nfl": product.spec.nfl_certified,
        },
        "price_per_sqft": product.base_price_per_sqft,
        "typical_applications": product.typical_applications,
    }


def get_software_summary(software_type: str) -> Dict[str, any]:
    """
    Get summary of software for UI display
    """
    software = get_software_by_type(software_type)
    if not software:
        return {}

    cost_display = f"${software.annual_cost:,.2f}/year" if software.license_model in ["per_screen", "per_venue"] else f"${software.one_time_cost:,.2f}"

    return {
        "name": software.name,
        "type": software.type.value,
        "license_model": software.license_model,
        "cost_display": cost_display,
        "features": software.features,
        "max_displays": software.max_displays,
    }


def get_service_summary(level: str) -> Dict[str, any]:
    """
    Get summary of service package for UI display
    """
    pkg = get_service_package(level)
    if not pkg:
        return {}

    return {
        "level": pkg.level.value,
        "name": pkg.name,
        "annual_cost_pct": pkg.annual_cost_pct,
        "includes": pkg.includes,
        "response_time_hours": pkg.response_time_hours,
        "response_time_display": f"{pkg.response_time_hours} hours" if pkg.response_time_hours < 24 else "Next business day",
        "on_site_availability": pkg.on_site_availability,
        "game_day_operations": pkg.game_day_operations,
        "preventative_maintenance": pkg.preventative_maintenance,
        "key_features": pkg.key_features,
    }


# Export for easy access
__all__ = [
    "ANC_PRODUCTS",
    "ANC_SOFTWARE",
    "ANC_SERVICE_PACKAGES",
    "DisplayCategory",
    "SoftwareType",
    "ServiceLevel",
    "ProductSpec",
    "DisplayProduct",
    "SoftwareLicense",
    "ServicePackage",
    "get_product_by_id",
    "get_products_by_category",
    "get_software_by_type",
    "get_service_package",
    "calculate_bulk_discount",
    "get_recommended_product_for_venue",
    "get_display_summary",
    "get_software_summary",
    "get_service_summary",
]
