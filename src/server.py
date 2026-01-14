from dotenv import load_dotenv
import os

# Load environment variables from .env file BEFORE any local imports
# Search in current dir and parent dir
load_dotenv()
if not os.environ.get("DATABASE_URL"):
    parent_env = os.path.join(os.path.dirname(os.getcwd()), ".env")
    if os.path.exists(parent_env):
        load_dotenv(parent_env)

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import json
import datetime
from anc_configurable_calculator import ANCConfigurableCalculator
from excel_generator import ExcelGenerator
from pdf_generator import PDFGenerator
from database import init_db, get_db, Project, Message, SharedProposal, SessionLocal
from sqlalchemy.orm import Session
import secrets
import string

app = FastAPI()


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ANC CPQ Backend"}


@app.get("/api/db-status")
def get_db_status(db: Session = Depends(get_db)):
    """Diagnostic endpoint to check database connectivity"""
    try:
        from sqlalchemy import text

        db.execute(text("SELECT 1"))
        return {
            "status": "connected",
            "database": str(db.get_bind()).split("@")[-1],  # Show hostname only
            "engine": str(db.get_bind()).split(":")[0]
            if ":" in str(db.get_bind())
            else "unknown",
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "url_detected": os.getenv("DATABASE_URL")[:15] + "..."
            if os.getenv("DATABASE_URL")
            else "None",
        }


# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()


# Pydantic Models
class SearchRequest(BaseModel):
    query: str


class ChatMessage(BaseModel):
    role: str
    content: str
    thinking: Optional[str] = None


class ChatRequest(BaseModel):
    project_id: Optional[int] = None
    message: str
    history: List[ChatMessage]  # For context window
    current_state: Dict


class ShareRequest(BaseModel):
    project_id: Optional[int] = None
    input: Dict
    result: Dict


# Project models for proposal generation
class ScreenInput(BaseModel):
    product_class: str
    pixel_pitch: str
    width_ft: float
    height_ft: float
    indoor: bool
    mounting_type: str
    structure_condition: str
    labor_type: str
    power_distance: str
    target_margin: float
    venue_type: str


class ProjectRequest(BaseModel):
    client_name: str
    screens: List[ScreenInput]
    service_level: str = "bronze"
    timeline: str = "standard"
    permits: str = "client"
    control_system: str = "include"
    bond_required: bool = False


# --- API Endpoints ---


@app.get("/api/search-places")
async def search_places(query: str):
    """Compatibility endpoint for the frontend autocomplete.

    Accepts a plain query string via `?query=` and returns the same payload shape
    as `/api/search-address`.
    """
    try:
        return await search_address(SearchRequest(query=query))
    except Exception as e:
        print(f"Search places error: {e}")
        return {"results": []}


@app.post("/api/search-address")
async def search_address(req: SearchRequest):
    """
    Perform a high-precision address search using Serper.dev (web search)
    with a robust fallback to Nominatim.
    """
    import httpx
    import os

    query = req.query.strip()
    if not query:
        return {"results": []}

    results = []

    # 1) Try Serper.dev (Google-powered) first
    try:
        serper_key = os.getenv("SERPER_API_KEY")
        if serper_key:
            async with httpx.AsyncClient() as client:
                r = await client.post(
                    "https://google.serper.dev/places",
                    headers={
                        "X-API-KEY": serper_key,
                        "Content-Type": "application/json",
                    },
                    json={"q": query, "num": 5},
                    timeout=5.0,
                )
                r.raise_for_status()
                data = r.json()

                for place in data.get("places", []):
                    # Use displayName if title missing
                    title = place.get("title") or place.get("displayName", "Unknown")
                    address = place.get("address", "")
                    lat = place.get("latitude")
                    lng = place.get("longitude")

                    if lat is not None and lng is not None:
                        results.append(
                            {
                                "title": title,
                                "address": address,
                                "lat": float(lat),
                                "lng": float(lng),
                            }
                        )
    except Exception as e:
        print(f"Serper search error: {e}")

    # 2) Fallback to Nominatim (OpenStreetMap) if Serper fails or returns empty
    if not results:
        try:
            async with httpx.AsyncClient() as client:
                r = await client.get(
                    "https://nominatim.openstreetmap.org/search",
                    params={
                        "q": query,
                        "format": "json",
                        "addressdetails": 1,
                        "limit": 5,
                    },
                    headers={"User-Agent": "ANC-Proposal-System/1.0"},
                    timeout=5.0,
                )
                r.raise_for_status()
                data = r.json()

                for place in data:
                    # Build a readable address
                    address_parts = []
                    addr = place.get("address", {})
                    if addr.get("name"):
                        address_parts.append(addr["name"])
                    if addr.get("road"):
                        address_parts.append(addr["road"])
                    if addr.get("city"):
                        address_parts.append(addr["city"])
                    if addr.get("state"):
                        address_parts.append(addr["state"])
                    if addr.get("postcode"):
                        address_parts.append(addr["postcode"])

                    results.append(
                        {
                            "title": place.get("display_name", "")
                            .split(",")[0]
                            .strip(),
                            "address": ", ".join(address_parts),
                            "lat": float(place.get("lat", 0)),
                            "lng": float(place.get("lon", 0)),
                        }
                    )
        except Exception as e:
            print(f"Nominatim error: {e}")

    return {"results": results[:5]}


@app.post("/api/projects")
def create_project(client_name: str = "New Project", db: Session = Depends(get_db)):
    """Create a new empty project session"""
    new_project = Project(client_name=client_name, state={})
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return {"id": new_project.id, "client_name": new_project.client_name}


@app.get("/api/projects/{project_id}")
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get project state"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {
        "id": project.id,
        "client_name": project.client_name,
        "state": project.state,
    }


@app.post("/api/projects/{project_id}/save")
def save_project_state(project_id: int, state: Dict, db: Session = Depends(get_db)):
    """Save project state"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Convert dict to JSON string for database storage
    project.state = json.dumps(state) if isinstance(state, dict) else state
    if "clientName" in state:
        project.client_name = state["clientName"]

    db.commit()
    return {"status": "saved"}


@app.post("/api/projects/{project_id}/message")
def save_message(project_id: int, msg: ChatMessage, db: Session = Depends(get_db)):
    """Log a chat message to history"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    new_msg = Message(
        project_id=project_id,
        role=msg.role,
        content=msg.content,
        thinking=msg.thinking,
        timestamp=datetime.datetime.utcnow(),
    )
    db.add(new_msg)
    db.commit()
    return {"status": "logged"}


@app.post("/api/share")
def create_share(req: ShareRequest, db: Session = Depends(get_db)):
    """Create a persistent shared proposal link"""
    # Generate a unique share ID (11 chars, similar to YouTube IDs)
    alphabet = string.ascii_letters + string.digits
    share_id = "".join(secrets.choice(alphabet) for _ in range(11))

    # Parse timeline
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(days=30)

    new_share = SharedProposal(
        share_id=share_id,
        input_data=req.input,
        result_data=req.result,
        expires_at=expires_at,
    )
    db.add(new_share)
    db.commit()
    db.refresh(new_share)

    return {
        "share_id": share_id,
        "share_url": f"{os.getenv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')}/share/{share_id}",
    }


@app.get("/api/share/{share_id}")
def get_share(share_id: str, db: Session = Depends(get_db)):
    """Retrieve a shared proposal by ID"""
    share = db.query(SharedProposal).filter(SharedProposal.share_id == share_id).first()
    if not share:
        raise HTTPException(status_code=404, detail="Share not found")

    if datetime.datetime.utcnow() > share.expires_at:
        raise HTTPException(status_code=410, detail="Share has expired")

    return {
        "input": share.input_data,
        "result": share.result_data,
        "createdAt": share.created_at.isoformat(),
        "expiresAt": share.expires_at.isoformat(),
    }


@app.post("/api/generate")
async def generate_proposal(req: ProjectRequest, db: Session = Depends(get_db)):
    try:
        # Use the new configurable calculator instead of old CPQCalculator
        calc = ANCConfigurableCalculator()
        project_data = []

        for s in req.screens:
            # Create input data for the configurable calculator
            screen_data = {
                "client_name": req.client_name,
                "product_class": s.product_class,
                "pixel_pitch": float(s.pixel_pitch),
                "width_ft": s.width_ft,
                "height_ft": s.height_ft,
                "indoor": s.indoor,
                "mounting_type": s.mounting_type,
                "structure_condition": s.structure_condition,
                "labor_type": s.labor_type,
                "power_distance": s.power_distance,
                "target_margin": s.target_margin,
                "venue_type": s.venue_type,
                "service_level": req.service_level,
                "timeline": req.timeline,
                "permits": req.permits,
                "control_system": req.control_system,
                "bond_required": req.bond_required,
                "contingency_pct": 5.0,  # Default 5%
            }

            # Calculate using the new configurable calculator
            result = calc.calculate_quote_from_dict(screen_data)

            # Add pixel dimensions for Excel generator
            pixel_pitch_mm = float(s.pixel_pitch)
            width_pixels = int((s.width_ft * 304.8) / pixel_pitch_mm)
            height_pixels = int((s.height_ft * 304.8) / pixel_pitch_mm)

            # Add calculated dimensions to result
            if "inputs" in result:
                result["inputs"].width_px = width_pixels
                result["inputs"].height_px = height_pixels
                result["inputs"].total_sqft = s.width_ft * s.height_ft
                result["inputs"].indoor = s.indoor
                result["inputs"].mounting_type = s.mounting_type

            project_data.append(result)

        # Generate Files
        excel_gen = ExcelGenerator()
        excel_gen.update_expert_estimator(
            project_data, output_path="anc_internal_estimation.xlsx"
        )

        pdf_gen = PDFGenerator()
        pdf_gen.generate_proposal(
            project_data, req.client_name, filename="anc_client_proposal.pdf"
        )

        return {
            "status": "success",
            "message": "Files Generated",
            "files": ["anc_internal_estimation.xlsx", "anc_client_proposal.pdf"],
            "data": project_data,
        }

    except Exception as e:
        print(f"Error in generate_proposal: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/download/excel")
async def download_excel():
    file_path = "anc_internal_estimation.xlsx"
    if os.path.exists(file_path):
        return FileResponse(
            file_path,
            filename="ANC_Expert_Estimation.xlsx",
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
    return HTTPException(status_code=404, detail="File not found")


@app.get("/api/download/pdf")
async def download_pdf():
    file_path = "anc_client_proposal.pdf"
    if os.path.exists(file_path):
        return FileResponse(
            file_path, filename="ANC_Proposal.pdf", media_type="application/pdf"
        )
    return HTTPException(status_code=404, detail="File not found")


# Add startup and shutdown events
@app.on_event("startup")
async def startup_event():
    init_db()
    print("Database initialized")


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ANC CPQ Backend"}


# Run the server
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
