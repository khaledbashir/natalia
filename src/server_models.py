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
