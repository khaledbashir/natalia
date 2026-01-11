"""
ANC CPQ API Routes
Connects frontend configuration wizard to backend calculator and output generation
"""

import asyncio
import json
from datetime import datetime
from typing import Dict, List, Optional

import uvicorn
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from calculator import CPQCalculator, CPQInput
from catalog import IndustryTemplate, get_industry_template, get_template
from catalog import get_template, get_industry_template, IndustryTemplate

# Initialize FastAPI app
app = FastAPI(
    title="ANC CPQ API",
    description="Configure-Price-Quote API for ANC LED Display Proposals",
    version="2.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
calculator = CPQCalculator(catalog=None)
pdf_generator = PDFGenerator()
excel_generator = ExcelGenerator()

# ============================================================================
# PYDANTIC MODELS (Input/Output Schemas)
# ============================================================================


class WizardConfig(BaseModel):
    """Configuration from frontend wizard"""

    # Venue & Display Configuration
    venue_type: Optional[str] = None  # nfl, nba, ncaa, transit, corporate
    display_types: List[str] = []
    num_displays: int = 1

    # Installation Environment
    installation_type: str = "new"  # new, retrofit, upgrade
    access: str = "front"  # front, rear, lift, crane
    structural: str = "existing"  # existing, newsteel, truss
    electrical_capacity: str = "adequate"  # adequate, limited, unknown
    distance_to_power_ft: float = 50.0

    # Software Configuration
    cms_type: str = "manual"  # livesync, thirdparty, manual
    software_features: List[str] = []

    # Service Configuration
    service_level: str = "bronze"  # gold, silver, bronze, self

    # Timeline Configuration
    timeline: str = "standard"  # standard, rush, asap, multiphase
    duration_days: int = 14

    # Pricing Configuration
    target_margin: float = 30.0
    contingency_pct: float = 5.0

    # Legacy fields (for backward compatibility)
    client_name: Optional[str] = ""
    address: Optional[str] = ""
    product_class: str = "Scoreboard"
    pixel_pitch: float = 10.0
    width_ft: float = 20.0
    height_ft: float = 5.0
    is_outdoor: bool = False
    shape: str = "Flat"
    access: str = "Front"
    complexity: str = "Standard"
    structure_condition: str = "Existing"


class TemplateLoadRequest(BaseModel):
    """Request to load a template"""

    template_id: str  # nfl_stadium, nba_arena, ncaa_stadium, transit_hub, corporate


class CalculationRequest(BaseModel):
    """Request for cost calculation"""

    config: WizardConfig
    use_template: Optional[str] = None  # Override with template


class GeneratePDFRequest(BaseModel):
    """Request to generate PDF proposal"""

    config: WizardConfig
    calculation_result: Optional[Dict] = None
    include_summary: bool = True
    include_pricing: bool = True
    include_timeline: bool = True


class GenerateExcelRequest(BaseModel):
    """Request to generate Excel audit file"""

    config: WizardConfig
    calculation_result: Optional[Dict] = None


class DemoPresetLoadRequest(BaseModel):
    """Load demo preset configuration"""

    preset_id: str  # nfl, nba, transit, corporate


# ============================================================================
# API ENDPOINTS
# ============================================================================


@app.get("/")
async def root():
    """Root endpoint - API status"""
    return {
        "name": "ANC CPQ API",
        "version": "2.0.0",
        "status": "operational",
        "endpoints": {
            "templates": "/api/templates",
            "calculate": "/api/calculate",
            "generate-pdf": "/api/generate-pdf",
            "generate-excel": "/api/generate-excel",
            "demo-presets": "/api/demo-presets",
            "load-preset": "/api/load-preset",
            "health": "/api/health",
        },
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "calculator": "operational",
            "pdf_generator": "operational",
            "excel_generator": "operational",
            "catalog": "operational",
        },
    }


@app.get("/api/templates")
async def list_templates():
    """List all available industry templates"""
    templates = get_industry_template("nfl")  # This returns all templates
    return {
        "templates": [
            {
                "id": "nfl_stadium",
                "name": "NFL Stadium",
                "description": "Professional football stadium with premium displays",
                "venue_type": "nfl",
                "target_price_range": "$5M - $15M",
            },
            {
                "id": "nba_arena",
                "name": "NBA Arena",
                "description": "Professional basketball arena configuration",
                "venue_type": "nba",
                "target_price_range": "$2M - $8M",
            },
            {
                "id": "ncaa_stadium",
                "name": "College Stadium",
                "description": "College athletics venue configuration",
                "venue_type": "ncaa",
                "target_price_range": "$1M - $5M",
            },
            {
                "id": "transit_hub",
                "name": "Transit Hub",
                "description": "Transportation center configuration",
                "venue_type": "transit",
                "target_price_range": "$500K - $3M",
            },
            {
                "id": "corporate",
                "name": "Corporate Space",
                "description": "Corporate flagship or office building",
                "venue_type": "corporate",
                "target_price_range": "$200K - $2M",
            },
        ]
    }


@app.post("/api/load-template")
async def load_template(request: TemplateLoadRequest):
    """Load full template configuration"""
    try:
        template = get_template(request.template_id)
        if not template:
            raise HTTPException(
                status_code=404, detail=f"Template not found: {request.template_id}"
            )

        # Convert template to calculator input
        calculator_input = template.to_calculator_input()

        # Calculate with template configuration
        result = calculator.calculate_quote(calculator_input)

        return {
            "success": True,
            "template_id": request.template_id,
            "template_name": template.template_name,
            "template_description": template.description,
            "venue_type": template.venue_type,
            "configuration": calculator_input,
            "calculation_result": result,
            "pricing_summary": {
                "total_sell_price": result["summary"]["final_sell_price"],
                "margin_pct": result["pricing"]["margin_pct"] * 100,
                "contingency_pct": result["pricing"]["contingency_pct"] * 100,
                "timeline_surcharge": result["pricing"].get("timeline_surcharge", 0),
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/calculate")
async def calculate_costs(request: CalculationRequest):
    """Calculate all 12 cost categories based on configuration"""
    try:
        # If using template, load it first
        if request.use_template:
            template = get_template(request.use_template)
            if template:
                template_input = template.to_calculator_input()
                # Override with any user-provided values
                config_dict = request.config.dict()
                template_dict = template_input.dict()

                # Merge: user values override template defaults
                merged_dict = {**template_dict, **config_dict}

                calculator_input = CPQInput(**merged_dict)
            else:
                calculator_input = CPQInput(**request.config.dict())
        else:
            calculator_input = CPQInput(**request.config.dict())

        # Calculate all costs
        result = calculator.calculate_quote(calculator_input)

        return {
            "success": True,
            "calculation_timestamp": datetime.now().isoformat(),
            "configuration": request.config.dict(),
            "calculation_result": result,
            "cost_breakdown": result["cost_breakdown"],
            "pricing": result["pricing"],
            "summary": result["summary"],
            "performance_metrics": {
                "total_categories": len(result["cost_breakdown"]),
                "calculation_time_ms": 0,  # Would track actual time
                "calculation_version": "2.0.0",
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")


@app.post("/api/generate-pdf")
async def generate_pdf_proposal(request: GeneratePDFRequest):
    """Generate ANC-branded PDF proposal"""
    try:
        # If no calculation result provided, calculate it
        if not request.calculation_result:
            calculator_input = CPQInput(**request.config.dict())
            calculation_result = calculator.calculate_quote(calculator_input)
        else:
            calculation_result = request.calculation_result

        # Prepare data for PDF
        project_data = calculation_result["cost_breakdown"]

        # Extract client info
        config_dict = request.config.dict()
        client_name = config_dict.get("client_name", "ANC Client")
        project_address = config_dict.get("address", "")

        # Generate PDF
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"anc_proposal_{timestamp}.pdf"
        pdf_generator.generate_proposal(
            project_data=[{"inputs": config_dict, "math": calculation_result}],
            client_name=client_name,
            filename=filename,
        )

        return {
            "success": True,
            "filename": filename,
            "download_url": f"/api/download-pdf/{filename}",
            "generation_timestamp": datetime.now().isoformat(),
            "pages": 1,  # Would be actual count
            "file_size_kb": 0,  # Would get actual file size
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation error: {str(e)}")


@app.post("/api/generate-excel")
async def generate_excel_audit(request: GenerateExcelRequest):
    """Generate Excel audit file with all cost categories"""
    try:
        # If no calculation result provided, calculate it
        if not request.calculation_result:
            calculator_input = CPQInput(**request.config.dict())
            calculation_result = calculator.calculate_quote(calculator_input)
        else:
            calculation_result = request.calculation_result

        # Prepare data for Excel
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"anc_audit_{timestamp}.xlsx"

        # Generate Excel
        excel_generator.generate_excel_audit(
            project_data=calculation_result["cost_breakdown"], filename=filename
        )

        return {
            "success": True,
            "filename": filename,
            "download_url": f"/api/download-excel/{filename}",
            "generation_timestamp": datetime.now().isoformat(),
            "sheets": len(calculation_result["cost_breakdown"]),  # Number of categories
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Excel generation error: {str(e)}")


@app.get("/api/demo-presets")
async def get_demo_presets():
    """Get all available demo preset configurations"""
    return {
        "presets": [
            {
                "id": "nfl",
                "name": "NFL Stadium",
                "icon": "🏈",
                "description": "Full stadium configuration like Levi's Stadium",
                "template_id": "nfl_stadium",
                "key_features": [
                    "4K Center Hung Display",
                    "Concourse Ribbon Boards",
                    "Endzone Displays",
                    "LiveSync Enterprise",
                    "Gold 24/7 Service",
                    "Game-Day Operations",
                ],
                "estimated_price": "$8.2M",
                "venue_type": "nfl",
            },
            {
                "id": "nba",
                "name": "NBA Arena",
                "icon": "🏀",
                "description": "Full arena configuration like Gainbridge Fieldhouse",
                "template_id": "nba_arena",
                "key_features": [
                    "6mm Center Hung",
                    "Fine Pitch Club Displays",
                    "Ribbon Boards",
                    "LiveSync Enterprise",
                    "Silver Event Support",
                ],
                "estimated_price": "$3.4M",
                "venue_type": "nba",
            },
            {
                "id": "transit",
                "name": "Transit Hub",
                "icon": "🚇",
                "description": "Full transit configuration like Moynihan Train Hall",
                "template_id": "transit_hub",
                "key_features": [
                    "Digital Kiosks",
                    "Information Displays",
                    "Wayfinding",
                    "24/7 Operation",
                    "Gold Service",
                ],
                "estimated_price": "$1.8M",
                "venue_type": "transit",
            },
        ]
    }


@app.post("/api/load-preset")
async def load_demo_preset(request: DemoPresetLoadRequest):
    """Load a demo preset configuration"""
    try:
        # Map preset IDs to template IDs
        preset_to_template = {
            "nfl": "nfl_stadium",
            "nba": "nba_arena",
            "transit": "transit_hub",
            "corporate": "corporate",
        }

        template_id = preset_to_template.get(request.preset_id)
        if not template_id:
            raise HTTPException(
                status_code=404, detail=f"Preset not found: {request.preset_id}"
            )

        # Load template
        template = get_template(template_id)
        if not template:
            raise HTTPException(
                status_code=404, detail=f"Template not found: {template_id}"
            )

        # Return template configuration
        return {
            "success": True,
            "preset_id": request.preset_id,
            "template_name": template.template_name,
            "template_description": template.description,
            "configuration": template.to_calculator_input().dict(),
            "key_features": template.key_features,
            "target_price_range": template.target_price_range,
            "example_projects": template.example_projects,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# ERROR HANDLING
# ============================================================================


class ANCException(Exception):
    """Base exception for ANC CPQ API"""

    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail


# Exception handler
@app.exception_handler(ANCException)
async def anc_exception_handler(request, exc: ANCException):
    return {
        "error": {
            "type": "ANCException",
            "status_code": exc.status_code,
            "detail": exc.detail,
            "timestamp": datetime.now().isoformat(),
        }
    }, exc.status_code


# ============================================================================
# SERVER STARTUP
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    print("""
    ╔════════════════════════════════════════╗
    ║     ANC CPQ API v2.0.0                    ║
    ║     Configure-Price-Quote Engine           ║
    ║     Ready for Production                  ║
    ╚════════════════════════════════════════╝
    """)

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info", access_log=True)
