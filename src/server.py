from dotenv import load_dotenv
import os

# Load environment variables from .env file BEFORE any local imports
# Search in current dir and parent dir
load_dotenv()
if not os.environ.get("DATABASE_URL"):
    parent_env = os.path.join(os.path.dirname(os.getcwd()), ".env")
    if os.path.exists(parent_env):
        load_dotenv(parent_env)

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import json
import datetime
from calculator import CPQCalculator, CPQInput
from excel_generator import ExcelGenerator
from pdf_generator import PDFGenerator
from database import (
    init_db,
    get_db,
    Project,
    Message,
    SharedProposal,
    SessionLocal,
    Organization,
    User,
    Membership,
    create_invite,
    consume_invite,
)
from sqlalchemy.orm import Session
import secrets
import string

app = FastAPI()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Log validation errors for debugging"""
    print(f"Validation error for {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(exc.body)},
    )


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
    is_outdoor: bool
    mounting_type: Optional[str] = "Wall"
    structure_condition: Optional[str] = "Existing"
    labor_type: Optional[str] = "NonUnion"
    power_distance: Optional[str] = "Close"
    target_margin: Optional[float] = 30.0
    venue_type: Optional[str] = "corporate"
    shape: Optional[str] = "Flat"
    access: Optional[str] = "Rear"
    complexity: Optional[str] = "Standard"
    permits: Optional[str] = "Client"
    control_system: Optional[str] = "Include"
    bond_required: Optional[bool] = False
    unit_cost: Optional[float] = 0.0
    id: Optional[Any] = None


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


@app.get("/api/projects")
def list_projects(db: Session = Depends(get_db)):
    """List all projects"""
    projects = db.query(Project).all()
    return projects


# --- Organization & Membership Endpoints ---
@app.post("/api/orgs")
def create_organization(name: str, db: Session = Depends(get_db)):
    """Create a new organization"""
    existing = db.query(Organization).filter(Organization.name == name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Organization already exists")
    org = Organization(name=name)
    db.add(org)
    db.commit()
    db.refresh(org)
    return {"id": org.id, "name": org.name}


@app.get("/api/orgs")
def list_orgs(db: Session = Depends(get_db)):
    orgs = db.query(Organization).all()
    return [{"id": o.id, "name": o.name} for o in orgs]


@app.get("/api/orgs/{org_id}/members")
def list_org_members(org_id: int, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    members = []
    for m in org.members:
        members.append({"email": m.user.email, "full_name": m.user.full_name, "role": m.role})
    return {"organization": org.name, "members": members}


class InviteRequest(BaseModel):
    email: str
    role: str = "member"


@app.post("/api/orgs/{org_id}/invites")
def create_org_invite(org_id: int, req: InviteRequest, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    invite = create_invite(db, req.email, org_id, role=req.role, ttl_days=7)
    return {"token": invite.token, "invite_url": f"{os.getenv('NEXT_PUBLIC_BASE_URL','http://localhost:3000')}/invite/{invite.token}", "expires_at": invite.expires_at.isoformat()}


class AcceptInviteRequest(BaseModel):
    token: str
    email: str
    full_name: Optional[str] = None


@app.post("/api/invite/accept")
def accept_invite(req: AcceptInviteRequest, db: Session = Depends(get_db)):
    invite = consume_invite(db, req.token)
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found or expired")

    # Create or fetch user
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # generate a simple API key for now
        api_key = secrets.token_urlsafe(24)
        user = User(email=req.email, full_name=req.full_name or req.email.split('@')[0], api_key=api_key)
        db.add(user)
        db.commit()
        db.refresh(user)

    # Create membership
    membership = db.query(Membership).filter(Membership.user_id == user.id, Membership.organization_id == invite.organization_id).first()
    if not membership:
        membership = Membership(user_id=user.id, organization_id=invite.organization_id, role=invite.role)
        db.add(membership)
        db.commit()
    # Delete invite after consumption
    db.delete(invite)
    db.commit()

    return {"status": "accepted", "user": {"email": user.email, "full_name": user.full_name, "api_key": user.api_key}}


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


@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project and its associated data"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return {"status": "success", "message": f"Project {project_id} deleted"}


@app.post("/api/projects/{project_id}/save")
@app.put("/api/projects/{project_id}/state")
def save_project_state(project_id: int, state: Dict, db: Session = Depends(get_db)):
    """Save project state"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Store state as JSON string
    project.state = state
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
        # Use the existing working CPQCalculator instead of the missing configurable one
        calc = CPQCalculator()
        project_data = []

        for s in req.screens:
            # Create CPQInput for the working calculator
            inp = CPQInput(
                client_name=req.client_name,
                product_class=s.product_class,
                pixel_pitch=float(s.pixel_pitch),
                width_ft=s.width_ft,
                height_ft=s.height_ft,
                is_outdoor=s.is_outdoor,
                shape=s.shape,
                access=s.access,
                complexity=s.complexity,
                target_margin=s.target_margin,
                structure_condition=s.structure_condition,
                labor_type=s.labor_type,
                power_distance=s.power_distance,
                venue_type=s.venue_type,
                service_level=req.service_level,
                timeline=req.timeline,
                permits=s.permits or req.permits,
                control_system=s.control_system or req.control_system,
                bond_required=s.bond_required or req.bond_required,
                unit_cost=s.unit_cost,
            )

            # Calculate using the working CPQCalculator
            result = calc.calculate_quote(inp)

            # Add pixel dimensions for Excel generator
            pixel_pitch_mm = float(s.pixel_pitch)
            width_pixels = int((s.width_ft * 304.8) / pixel_pitch_mm)
            height_pixels = int((s.height_ft * 304.8) / pixel_pitch_mm)

            # Add calculated dimensions to result
            if "inputs" in result:
                # result["inputs"] is a dataclass instance in CPQCalculator
                setattr(result["inputs"], "width_px", width_pixels)
                setattr(result["inputs"], "height_px", height_pixels)
                setattr(result["inputs"], "total_sqft", s.width_ft * s.height_ft)
                setattr(result["inputs"], "indoor", not s.is_outdoor)
                setattr(result["inputs"], "mounting_type", s.mounting_type)

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

        result = {
            "status": "success",
            "message": "Files Generated",
            "files": ["anc_internal_estimation.xlsx", "anc_client_proposal.pdf"],
            "data": project_data,
        }

        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/send-proposal')
def send_proposal(payload: Dict, db: Session = Depends(get_db)):
    """Generate proposal files and simulate sending by writing to outbox."""
    # Expect payload: { client_name, screens: [...], recipient_email }
    recipient = payload.get('recipient_email')
    if not recipient:
        raise HTTPException(status_code=400, detail='recipient_email required')

    # Reuse generation logic
    try:
        req = ProjectRequest(**{k: payload[k] for k in ['client_name', 'screens', 'service_level', 'timeline'] if k in payload})
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'Invalid payload: {e}')

    # Call internal generator logic (duplicate of /api/generate behavior)
    calc = CPQCalculator()
    project_data = []
    for s in req.screens:
        inp = CPQInput(
            client_name=req.client_name,
            product_class=s.product_class,
            pixel_pitch=float(s.pixel_pitch),
            width_ft=s.width_ft,
            height_ft=s.height_ft,
            is_outdoor=s.is_outdoor,
            shape=s.shape,
            access=s.access,
            complexity=s.complexity,
            target_margin=s.target_margin,
            structure_condition=s.structure_condition,
            labor_type=s.labor_type,
            power_distance=s.power_distance,
            venue_type=s.venue_type,
            service_level=req.service_level,
            timeline=req.timeline,
            permits=s.permits or req.permits,
            control_system=s.control_system or req.control_system,
            bond_required=s.bond_required or req.bond_required,
            unit_cost=s.unit_cost,
        )
        result = calc.calculate_quote(inp)
        project_data.append(result)

    excel_gen = ExcelGenerator()
    excel_gen.update_expert_estimator(project_data, output_path='anc_internal_estimation.xlsx')
    pdf_gen = PDFGenerator()
    pdf_gen.generate_proposal(project_data, req.client_name, filename='anc_client_proposal.pdf')

    from src.server_email import send_proposal_to_outbox
    out_path = send_proposal_to_outbox(recipient, ['anc_client_proposal.pdf', 'anc_internal_estimation.xlsx'], metadata={'client': req.client_name})

    return {'status': 'sent', 'outbox': out_path}

    except Exception as e:
        print(f"Error in generate_proposal: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload-master")
async def upload_master_file(org_id: Optional[int] = None, file: Optional["UploadFile"] = None, db: Session = Depends(get_db)):
    """Upload a Master Excel file, run basic validation, and attach it to an organization if provided."""
    from fastapi import UploadFile
    from pathlib import Path
    import datetime

    if file is None:
        raise HTTPException(status_code=400, detail="No file uploaded")

    uploads_dir = Path("uploads")
    uploads_dir.mkdir(exist_ok=True)
    ts = datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S")
    safe_name = uploads_dir / f"master_uploaded_{org_id or 'anon'}_{ts}.xlsx"

    with safe_name.open("wb") as f:
        contents = await file.read()
        f.write(contents)

    # Load and validate
    from src.master_sheet import load_master_excel, validate_master_data

    try:
        data = load_master_excel(safe_name)
        report = validate_master_data(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {e}")

    # Attach to organization if provided
    if org_id:
        org = db.query(Organization).filter(Organization.id == org_id).first()
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")
        org.master_sheet_path = str(safe_name)
        db.commit()

    return {"status": "uploaded", "path": str(safe_name), "report": report}


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
