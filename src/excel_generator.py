import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

class ExcelGenerator:
    def __init__(self):
        pass

    def update_expert_estimator(self, project_data, output_path="anc_internal_estimation.xlsx"):
        """
        Generates a multi-tab Excel file with internal pricing breakdowns.
        """
        wb = openpyxl.Workbook()
        
        # 1. Dashboard / Summary Tab
        ws_summary = wb.active
        ws_summary.title = "Executive Summary"
        self._generate_summary_tab(ws_summary, project_data)
        
        # 2. Detailed Tabs per Screen
        for idx, screen_data in enumerate(project_data):
            # Create a tab for each screen
            # Excel sheet names must be short and unique
            sheet_name = f"Screen {idx + 1}"
            ws_detail = wb.create_sheet(title=sheet_name)
            self._generate_detail_tab(ws_detail, screen_data, idx + 1)
            
        wb.save(output_path)
        print(f"Excel generated at: {output_path}")

    def _generate_summary_tab(self, ws, project_data):
        # Styles
        header_font = Font(bold=True, color="FFFFFF", size=12)
        header_fill = PatternFill(start_color="003D82", end_color="003D82", fill_type="solid") # ANC Blue
        
        # Headers
        headers = ["#", "Product Class", "Dimensions", "Pixel Pitch", "Sell Price", "Annual Service"]
        for col, h in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=h)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center")
            ws.column_dimensions[get_column_letter(col)].width = 20

        # Data Rows
        total_sell = 0
        
        for idx, item in enumerate(project_data):
            row = idx + 2
            inp = item['inputs']
            summary = item['summary']
            
            sell_price = summary.get('final_sell_price', 0)
            service = summary.get('annual_service', 0)
            
            total_sell += sell_price
            
            ws.cell(row=row, column=1, value=idx + 1)
            ws.cell(row=row, column=2, value=inp.product_class)
            ws.cell(row=row, column=3, value=f"{inp.width_ft}' x {inp.height_ft}'")
            ws.cell(row=row, column=4, value=f"{inp.pixel_pitch}mm")
            ws.cell(row=row, column=5, value=sell_price).number_format = "$#,##0.00"
            ws.cell(row=row, column=6, value=service).number_format = "$#,##0.00"

        # Totals Row
        t_row = len(project_data) + 3
        ws.cell(row=t_row, column=1, value="GRAND TOTAL").font = Font(bold=True)
        ws.cell(row=t_row, column=5, value=total_sell).number_format = "$#,##0.00"
        ws.cell(row=t_row, column=5).font = Font(bold=True, size=14)

    def _generate_detail_tab(self, ws, item, screen_num):
        # Styles
        section_font = Font(bold=True, size=11, color="003D82")
        
        # Title
        inp = item['inputs']
        ws.cell(row=1, column=1, value=f"Screen {screen_num}: {inp.product_class} ({inp.width_ft}x{inp.height_ft})").font = Font(bold=True, size=14)
        
        # Header
        headers = ["Category", "Description", "Raw Cost (Int)", "Calculation Logic", "Sell Price (Ext)"]
        for col, h in enumerate(headers, 1):
            cell = ws.cell(row=3, column=col, value=h)
            cell.font = Font(bold=True, color="FFFFFF")
            cell.fill = PatternFill(start_color="666666", end_color="666666", fill_type="solid")
            ws.column_dimensions[get_column_letter(col)].width = 25
        ws.column_dimensions['B'].width = 40
        ws.column_dimensions['D'].width = 60

        # We need to map the flat list of 18 items back to their source details to get the "Calculation Logic" string.
        # This is a bit manual but precise.
        
        details = item['details']
        breakdown = item['cost_breakdown'] # Key is "1. Hardware", Val is Cost
        
        # Mapping Map: breakdown_key -> (detail_obj_key, sub_key)
        # detail_obj_key is key in 'details' (e.g. 'structural')
        # sub_key is key inside that object (e.g. 'structural_materials') WITHOUT 'raw_cost'
        
        mapping = [
            ("1. Hardware", "hardware", None), 
            ("2. Structural Materials", "structural", "structural_materials"),
            ("3. Structural Labor", "structural", "structural_labor"),
            ("4. LED Installation", "led_installation", None),
            ("5. Electrical Materials", "electrical", "electrical_materials"),
            ("6. Electrical Labor", "electrical", "electrical_labor"),
            ("7. CMS Equipment", "cms", "cms_equipment"),
            ("8. CMS Installation", "cms", "cms_installation"),
            ("9. CMS Commissioning", "cms", "cms_commissioning"),
            ("10. Project Management", "project_management", None),
            ("11. General Conditions", "general_conditions", None),
            ("12. Travel & Expenses", "travel", None),
            ("13. Submittals", "submittals", None),
            ("14. Engineering", "engineering", None),
            ("15. Permits", "permits", None),
            ("16. Final Commissioning", "final_commissioning", None),
            # Bond and Contingency are calc'd at end, might not be in 'details' effectively or different format
        ]

        row = 4
        
        for label, detail_key, sub_key in mapping:
            # 1. Get Sell Price
            sell_price = breakdown.get(label, 0)
            
            # 2. Get Raw Details
            raw_obj = {}
            if detail_key in details:
                parent = details[detail_key]
                if sub_key:
                    raw_obj = parent.get(sub_key, {})
                else:
                    raw_obj = parent # Assuming it's the direct object if no sub_key
            
            # If the mapping failed (e.g. key mismatch), robust fallback
            if not raw_obj and isinstance(details.get(detail_key), dict):
                 # Try to see if it has 'raw_cost' directly
                 if 'raw_cost' in details[detail_key]:
                     raw_obj = details[detail_key]

            description = raw_obj.get('description', '')
            raw_cost = raw_obj.get('raw_cost', 0)
            logic = raw_obj.get('calculation', '')

            # Write Row
            ws.cell(row=row, column=1, value=label)
            ws.cell(row=row, column=2, value=description)
            ws.cell(row=row, column=3, value=raw_cost).number_format = "$#,##0.00"
            ws.cell(row=row, column=4, value=logic)
            ws.cell(row=row, column=5, value=sell_price).number_format = "$#,##0.00"
            
            row += 1

        # Add Bond & Contingency (Special cases)
        ws.cell(row=row, column=1, value="17. Bond")
        ws.cell(row=row, column=5, value=breakdown.get("17. Bond", 0)).number_format = "$#,##0.00"
        row += 1
        
        ws.cell(row=row, column=1, value="18. Contingency")
        ws.cell(row=row, column=4, value=f"{item['pricing'].get('contingency_pct', 0)*100}% of Subtotal")
        ws.cell(row=row, column=5, value=breakdown.get("18. Contingency", 0)).number_format = "$#,##0.00"
        row += 1
        
        # Totals
        row += 1
        ws.cell(row=row, column=1, value="TOTAL SELL PRICE").font = Font(bold=True)
        ws.cell(row=row, column=5, value=item['summary']['final_sell_price']).number_format = "$#,##0.00"
        ws.cell(row=row, column=5).font = Font(bold=True, size=12)


