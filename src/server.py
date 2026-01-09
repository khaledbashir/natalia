from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
import uvicorn
import os
from calculator import CPQCalculator, CPQInput
from excel_generator import ExcelGenerator
# Note: PDF Generator update deferred to next step, assumes we have a placeholder or update later
# For now, we will comment out PDF generation to focus on Excel/Logic validation

app = FastAPI()

# CORS for Next.js (Port 3000)
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:6789"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
app.mount("/ui", StaticFiles(directory=static_dir, html=True), name="static")

class ScreenRequest(BaseModel):
    # The 8 Variables mapping
    # 1. Metadata (handled in ProjectRequest)
    # 2. Product Class
    product_class: str 
    # 4. Pixel Pitch
    pixel_pitch: float
    # 3. Dimensions
    width_ft: float
    height_ft: float
    # 5. Environment
    is_outdoor: bool
    # 6. Shape
    shape: str
    # 7. Access
    access: str
    # 8. Complexity
    complexity: str
    # 9. Value-Add Fields
    unit_cost: float = 0.0
    target_margin: float = 0.0
    structure_condition: str = 'Existing'

class ProjectRequest(BaseModel):
    client_name: str
    screens: List[ScreenRequest]

@app.post("/api/generate")
async def generate_proposal(project: ProjectRequest):
    try:
        # 1. Init Engine
        # We need a dummy catalog for now as per refactor plan
        calc = CPQCalculator(catalog=None)
        
        calculated_results = []
        
        for s in project.screens:
            inp = CPQInput(
                client_name=project.client_name,
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
            calculated_results.append(result)
            
        # 2. Generate Auditor File (Excel)
        excel_gen = ExcelGenerator()
        # Attempt to update the user's specific template if it exists
        excel_gen.update_expert_estimator(calculated_results, template_path="ABCDE-SPECS-NK-12.12-1.xlsx", output_path="anc_internal_estimation.xlsx")
        
        # 3. Generate Publisher File (PDF)
        from pdf_generator import PDFGenerator
        pdf_gen = PDFGenerator()
        # Note: We need to pass the client name which is in project.client_name
        pdf_gen.generate_proposal(calculated_results, project.client_name, "anc_client_proposal.pdf")
        
        return {
            "status": "success",
            "message": "Files Generated",
            "download_pdf": "/api/download/pdf",
            "download_excel": "/api/download/excel"
        }
            
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download/excel")
async def download_excel():
    return FileResponse("anc_internal_estimation.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename="Estimation_Audit.xlsx")

@app.get("/")
async def root():
    return FileResponse(os.path.join(static_dir, "index.html"))

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
