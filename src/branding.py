"""
ANC Sports Enterprises - Brand Configuration
=============================================
All visual branding assets and constants for the Enterprise Estimator Platform.
Update these values when brand assets are received from the client.
"""

# =============================================================================
# BRAND IDENTITY
# =============================================================================

COMPANY = {
    "name": "ANC SPORTS ENTERPRISES, LLC",
    "short_name": "ANC",
    "tagline": "Premium LED Display Solutions",
    "address": "...",  # TODO: Get from client
    "phone": "...",  # TODO: Get from client
    "email": "...",  # TODO: Get from client
    "website": "https://ancsports.com",
}

# =============================================================================
# COLOR PALETTE
# =============================================================================
# TODO: Update with actual brand hex codes from Natalia

COLORS = {
    # Primary Colors
    "primary": "#3b82f6",       # ANC Blue (placeholder - update with actual)
    "primary_dark": "#1e3a5f",  # Dark Blue for headers
    "primary_light": "#60a5fa", # Light Blue for accents
    
    # Neutral Colors
    "white": "#ffffff",
    "black": "#000000",
    "gray_dark": "#1e293b",     # Dark slate for table headers
    "gray_medium": "#6b7280",
    "gray_light": "#f3f4f6",
    
    # Status Colors
    "success": "#10b981",
    "warning": "#f59e0b",
    "error": "#ef4444",
}

# =============================================================================
# TYPOGRAPHY
# =============================================================================
# TODO: Update if custom fonts provided (TTF/OTF files)

FONTS = {
    "primary": "Helvetica",
    "heading": "Helvetica-Bold",
    "monospace": "Courier",
    # Custom fonts (if provided)
    "custom_ttf": None,  # Path to custom font file if provided
}

FONT_SIZES = {
    "title": 24,
    "heading1": 18,
    "heading2": 14,
    "body": 11,
    "small": 9,
    "label": 10,
}

# =============================================================================
# LOGO
# =============================================================================
# TODO: Replace with actual ANC logo when received

LOGO = {
    "path_svg": "static/anc_logo.svg",      # SVG preferred for quality
    "path_png": "static/anc_logo.png",      # PNG fallback
    "width": 150,                            # Default width in PDF
    "height": 50,                            # Default height in PDF
    "placeholder": True,                     # Set to False when real logo loaded
}

# =============================================================================
# PDF LAYOUT
# =============================================================================

PDF_LAYOUT = {
    "page_size": "LETTER",  # LETTER or A4
    "margins": {
        "top": 30,
        "bottom": 30,
        "left": 28,
        "right": 28,
    },
    "table_column_widths": [266, 110, 60, 40, 80],  # Total = 556pt for LETTER
}

# =============================================================================
# DOCUMENT TEMPLATES
# =============================================================================

TEMPLATES = {
    # PDF Sections
    "proposal_title": "SALES QUOTATION",
    "header_text": "ANC SPORTS ENTERPRISES",
    
    # Standard Terms
    "payment_terms": "50% Deposit, 40% Shipping, 10% Completion",
    "validity_days": 30,  # Quote valid for X days
    
    # Exclusions (Standard)
    "standard_exclusions": [
        "Primary power to site",
        "Permits (unless noted)",
        "Data runs > 300ft",
    ],
    
    # Inclusions (Standard)
    "standard_inclusions": [
        "LED Hardware",
        "Standard Structural/Labor (as specified)",
        "Shipping",
    ],
}

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def get_color(name: str) -> str:
    """Get a brand color by name, with fallback."""
    return COLORS.get(name, COLORS["primary"])

def get_font(name: str) -> str:
    """Get a font family by name, with fallback."""
    return FONTS.get(name, FONTS["primary"])

def is_branding_complete() -> bool:
    """Check if all required branding assets are configured."""
    checks = [
        LOGO.get("placeholder") is False,
        COMPANY.get("address") != "...",
        COLORS.get("primary") != "#3b82f6",  # Changed from placeholder
    ]
    return all(checks)

# =============================================================================
# LOAD NOTIFICATION
# =============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("ANC Brand Configuration Status")
    print("=" * 60)
    print(f"Company: {COMPANY['name']}")
    print(f"Primary Color: {COLORS['primary']}")
    print(f"Logo Ready: {'Yes' if not LOGO['placeholder'] else 'PENDING'}")
    print(f"Branding Complete: {'✓ YES' if is_branding_complete() else '✗ PENDING ASSETS'}")
    print("=" * 60)
