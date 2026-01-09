from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
import json
from calculator import CPQCalculator, CPQInput
from excel_generator import ExcelGenerator
from pdf_generator import PDFGenerator
from database import init_db, get_db, Project, Message, SessionLocal
from sqlalchemy.orm import Session
import datetime

app = FastAPI()

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Initialization ---
@app.on_event("startup")
def on_startup():
    init_db()

# --- Pydantic Models ---
class ScreenRequest(BaseModel):
    client_name: str = ""
    width_ft: float
    height_ft: float
    pixel_pitch: float
    is_outdoor: bool
    product_class: str
    shape: str
    access: str
    complexity: str
    unit_cost: float = 0.0
    target_margin: float = 0.0
    structure_condition: str = "Existing"

class ProjectRequest(BaseModel):
    client_name: str
    screens: List[ScreenRequest]
    project_id: Optional[int] = None # Link to DB Project

class ChatMessage(BaseModel):
    role: str
    content: str
    thinking: Optional[str] = None

class ChatRequest(BaseModel):
    project_id: Optional[int] = None
    message: str
    history: List[ChatMessage] # For context window
    current_state: Dict

# --- API Endpoints ---

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
    """Retrieve full project state and history"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Sort messages by timestamp
    messages = [{"role": m.role, "content": m.content, "thinking": m.thinking, "timestamp": m.timestamp.isoformat()} for m in sorted(project.messages, key=lambda x: x.timestamp)]
    
    return {
        "id": project.id,
        "client_name": project.client_name,
        "state": project.state,
        "messages": messages,
        "created_at": project.created_at.isoformat()
    }

@app.put("/api/projects/{project_id}/state")
def update_project_state(project_id: int, state: Dict, db: Session = Depends(get_db)):
    """Auto-save project state from wizard"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project.state = state
    # Update helpful metadata if available
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
        project_id=project.id,
        role=msg.role,
        content=msg.content,
        thinking=msg.thinking
    )
    db.add(new_msg)
    db.commit()
    return {"status": "logged"}

@app.post("/api/generate")
async def generate_proposal(req: ProjectRequest, db: Session = Depends(get_db)):
    try:
        calc = CPQCalculator()
        project_data = []

        # Save Configuration State if project_id is provided
        if req.project_id:
            project = db.query(Project).filter(Project.id == req.project_id).first()
            if project:
                # Update project name if client name changed
                project.client_name = req.client_name
                db.commit()

        for s in req.screens:
            inp = CPQInput(
                client_name=req.client_name,
                product_class=s.product_class,
                pixel_pitch=s.pixel_pitch,
                width_ft=s.width_ft,
                height_ft=s.height_ft,
                is_outdoor=s.is_outdoor,
                shape=s.shape,
                access=s.access,
                complexity=s.complexity,
                unit_cost=s.unit_cost,
                target_margin=s.target_margin,
                structure_condition=s.structure_condition
            )
            
            result = calc.calculate_quote(inp)
            project_data.append(result)

        # Generate Files
        excel_gen = ExcelGenerator()
        excel_gen.update_expert_estimator(project_data, output_path="anc_internal_estimation.xlsx")
        
        pdf_gen = PDFGenerator()
        pdf_gen.generate_proposal(project_data, req.client_name, filename="anc_client_proposal.pdf")

        return {
            "status": "success",
            "message": "Files Generated",
            "files": ["anc_internal_estimation.xlsx", "anc_client_proposal.pdf"],
            "data": project_data
        }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download/excel")
async def download_excel():
    file_path = "anc_internal_estimation.xlsx"
    if os.path.exists(file_path):
        return FileResponse(file_path, filename="ANC_Expert_Estimation.xlsx", media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    return HTTPException(status_code=404, detail="File not found")

@app.get("/api/download/pdf")
async def download_pdf():
    file_path = "anc_client_proposal.pdf"
    if os.path.exists(file_path):
        return FileResponse(file_path, filename="ANC_Proposal.pdf", media_type='application/pdf')
    return HTTPException(status_code=404, detail="File not found")
