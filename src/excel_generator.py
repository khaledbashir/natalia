import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter
from typing import List, Dict

class ExcelGenerator:
    def __init__(self):
        pass

    
    def update_expert_estimator(self, project_data: List[Dict], template_path: str = "template.xlsx", output_path: str = "anc_internal_estimation.xlsx"):
        """
        Updates the 'Expert Estimator' template by overwriting specific cells 
        with the user's configured data.
        """
        try:
            # 1. Load Workbook (Try to load template, else create new)
            try:
                wb = openpyxl.load_workbook(template_path)
            except FileNotFoundError:
                # Fallback if template is missing (for testing without file)
                wb = openpyxl.Workbook()
                ws = wb.active
                ws.title = "Expert Estimator"
                # Add some context labels so the fallback file makes sense
                ws['E5'] = "Active Height:"
                ws['F5'] = "Active Width:"
                ws['D5'] = "Pixel Pitch:"
            
            ws = wb.active

            # 2. Extract Primary Config (Assumes single screen or primary screen logic for the summary tab)
            # The User's prompt implies Row 5 contains the main variables for the main screen.
            primary_data = project_data[0]['inputs']
            math_data = project_data[0]['math']
            
            # 3. Overwrite Target Cells (USER SPECIFIED MAPPING)
            # "Target Cell: Explicitly targets the specific cells (e.g., F5 for Height, G5 for Width)."
            
            # Height @ F5
            ws['F5'] = primary_data.height_ft
            
            # Width @ G5 (Based on user prompt implying F & G are dimensions)
            # "Actual Data (in Export): 1215.22 ft Width x 2.95 ft Height (Row 5)."
            # Wait, user said "F5 for Height". Let's assume G5 is Width as they are usually adjacent.
            ws['G5'] = primary_data.width_ft
            
            # Pixel Pitch (Commonly nearby, let's put it in E5 or look for it. logic safe to put in H5 for now)
            # If the template has it elsewhere, this overwrites H5.
            ws['H5'] = primary_data.pixel_pitch
            
            # Product Class
            ws['C5'] = primary_data.product_class
            
            # Secure Costs Injection (Cost Sq. Ft at P5)
            # The User pointed out Row 5, Column P is "Cost Sq. Ft"
            if 'base_rate' in math_data:
                ws['P5'] = math_data['base_rate']

            # Dynamic Contingency (Value Add) writing to a specific cell if needed
            # Assuming K5 is for specific notes or contingency
            if 'contingencyCost' in item:
                 ws['K5'] = math_data['contingencyCost']
            
            # 4. Save/Export
            wb.save(output_path)
            print(f"Values overwritten: Width={primary_data.width_ft}, Height={primary_data.height_ft}")
            
        except Exception as e:
            print(f"Excel Update Error: {e}")
            # Fallback to the audit generator if the template logic explodes
            self.generate_audit_file(project_data, output_path)

    def generate_audit_file(self, project_data: List[Dict], filename: str = "anc_internal_estimation.xlsx"):
        # project_data is a list of results from CPQCalculator.calculate_quote
        
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Internal Audit Trail"
        
        # Headers matching the professional "Expert Estimator" standard
        headers = [
            "Screen / Category", "Dimensions", "Area (SqFt)", "Base $/SqFt", 
            "Raw HW Cost", "Structural (20%)", "Labor (15% HW+Str)", "Expenses (5% HW)", 
            "Margin %", "HW Price", "Str Price", "Labor Price", "Exp Price",
            "Subtotal", "Bond (1%)", "Contingency (5%)", "GRAND TOTAL SELL"
        ]
        
        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="003D82", end_color="003D82", fill_type="solid")
        
        for col, h in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=h)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center")
            ws.column_dimensions[get_column_letter(col)].width = 18

        row = 2
        for item in project_data:
            math = item['math']
            inp = item['inputs']
            
            # Static Values
            ws.cell(row=row, column=1, value=f"{inp.product_class} ({inp.pixel_pitch}mm)")
            ws.cell(row=row, column=2, value=f"{inp.width_ft}' x {inp.height_ft}'")
            ws.cell(row=row, column=3, value=math['sq_ft'])
            ws.cell(row=row, column=4, value=math['base_rate'])
            
            # Formulas for Raw Costs (Visible Math Trail)
            # E: Raw HW Cost = SqFt * Rate
            ws.cell(row=row, column=5, value=f"=C{row}*D{row}")
            
            # F: Structural (20% of HW)
            ws.cell(row=row, column=6, value=f"=E{row}*0.20")
            
            # G: Labor (15% of HW + Str)
            ws.cell(row=row, column=7, value=f"=(E{row}+F{row})*0.15")
            
            # H: Expenses (5% of HW)
            ws.cell(row=row, column=8, value=f"=E{row}*0.05")
            
            # I: Margin %
            ws.cell(row=row, column=9, value=math['margin_pct'])
            
            # Applying Margin per Line Item (Transparent Markup)
            # J: HW Price = Raw HW / (1 - Margin)
            ws.cell(row=row, column=10, value=f"=E{row}/(1-I{row})")
            
            # K: Str Price = Raw Str / (1 - Margin)
            ws.cell(row=row, column=11, value=f"=F{row}/(1-I{row})")
            
            # L: Labor Price = Raw Labor / (1 - Margin)
            ws.cell(row=row, column=12, value=f"=G{row}/(1-I{row})")
            
            # M: Exp Price = Raw Exp / (1 - Margin)
            ws.cell(row=row, column=13, value=f"=H{row}/(1-I{row})")
            
            # N: Subtotal
            ws.cell(row=row, column=14, value=f"=SUM(J{row}:M{row})")
            
            # O: Bond (1% of Subtotal)
            ws.cell(row=row, column=15, value=f"=N{row}*0.01")
            
            # P: Contingency (Value Add)
            # Check if this item has contingency cost. If so, put it here.
            contingency = math.get('contingencyCost', 0)
            ws.cell(row=row, column=16, value=contingency)
            
            # Q: Grand Total Sell
            ws.cell(row=row, column=17, value=f"=N{row}+O{row}+P{row}")
            
            # Formatting
            for col in range(5, 18):
                if col != 9: # Skip Margin %
                    ws.cell(row=row, column=col).number_format = '#,##0'
            
            row += 1

        # Total Row
        ws.cell(row=row, column=1, value="AGGREGATE PROJECT TOTAL")
        ws.cell(row=row, column=1).font = Font(bold=True)
        for col in range(14, 18): # Sum Subtotal, Bond, Contingency, Grand Total
            letter = get_column_letter(col)
            ws.cell(row=row, column=col, value=f"=SUM({letter}2:{letter}{row-1})")
            ws.cell(row=row, column=col).font = Font(bold=True)
            ws.cell(row=row, column=col).number_format = '#,##0'

        wb.save(filename)
