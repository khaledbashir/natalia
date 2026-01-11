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
        """
        Generate Excel file with audit trail that matches the preview exactly.
        Includes all cost breakdowns and calculations visible in the preview.
        """
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Internal Audit Trail"
        
        # Headers matching the professional "Expert Estimator" standard
        headers = [
            "Screen / Category", "Dimensions", "Area (SqFt)", "Base $/SqFt", 
            "Raw HW Cost", "Structural (20%)", "Labor (15%)", "Expenses (5%)", 
            "Margin %", "HW Price", "Str Price", "Labor Price", "Exp Price",
            "Subtotal", "Bond (1%)", "Contingency (5%)", "GRAND TOTAL SELL"
        ]
        
        header_font = Font(bold=True, color="FFFFFF", size=11)
        header_fill = PatternFill(start_color="003D82", end_color="003D82", fill_type="solid")
        header_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        
        # Set up header row
        for col, h in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=h)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = header_alignment
            ws.column_dimensions[get_column_letter(col)].width = 16

        # Create border style for data cells
        thin_border = Border(
            left=Side(style='thin'),
            right=Side(style='thin'),
            top=Side(style='thin'),
            bottom=Side(style='thin')
        )

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
            # E: Raw HW Cost = Area * Base Rate
            ws.cell(row=row, column=5, value=f"=C{row}*D{row}")
            
            # F: Structural (20% of HW)
            ws.cell(row=row, column=6, value=f"=E{row}*0.20")
            
            # G: Labor (15% of HW + Str)
            ws.cell(row=row, column=7, value=f"=(E{row}+F{row})*0.15")
            
            # H: Expenses (5% of HW)
            ws.cell(row=row, column=8, value=f"=E{row}*0.05")
            
            # I: Margin % (as decimal, e.g., 0.15 for 15%)
            margin_pct = math.get('margin_pct', 0)
            # Convert percentage format if needed (e.g., if it's 15, convert to 0.15)
            if margin_pct > 1:
                margin_pct = margin_pct / 100
            ws.cell(row=row, column=9, value=margin_pct)
            
            # Applying Margin per Line Item (Transparent Markup)
            # J: HW Price = Raw HW / (1 - Margin)
            ws.cell(row=row, column=10, value=f"=IFERROR(E{row}/(1-I{row}), E{row})")
            
            # K: Str Price = Raw Str / (1 - Margin)
            ws.cell(row=row, column=11, value=f"=IFERROR(F{row}/(1-I{row}), F{row})")
            
            # L: Labor Price = Raw Labor / (1 - Margin)
            ws.cell(row=row, column=12, value=f"=IFERROR(G{row}/(1-I{row}), G{row})")
            
            # M: Exp Price = Raw Exp / (1 - Margin)
            ws.cell(row=row, column=13, value=f"=IFERROR(H{row}/(1-I{row}), H{row})")
            
            # N: Subtotal
            ws.cell(row=row, column=14, value=f"=SUM(J{row}:M{row})")
            
            # O: Bond (1% of Subtotal)
            ws.cell(row=row, column=15, value=f"=N{row}*0.01")
            
            # P: Contingency (5% of Subtotal) - or value from math data
            contingency_pct = math.get('contingency_pct', 0.05)
            ws.cell(row=row, column=16, value=f"=N{row}*{contingency_pct}")
            
            # Q: Grand Total Sell
            ws.cell(row=row, column=17, value=f"=N{row}+O{row}+P{row}")
            
            # Format currency cells and add borders
            currency_cols = [4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17]
            for col in range(1, 18):
                cell = ws.cell(row=row, column=col)
                cell.border = thin_border
                
                if col in currency_cols and col != 9:  # Not margin column
                    cell.number_format = '$#,##0'
                elif col == 9:  # Margin percentage
                    cell.number_format = '0.0%'
                
                cell.alignment = Alignment(horizontal="right" if col > 1 else "left")
            
            row += 1

        # Total Row
        total_row = row
        ws.cell(row=total_row, column=1, value="AGGREGATE PROJECT TOTAL")
        ws.cell(row=total_row, column=1).font = Font(bold=True, size=11)
        
        total_border = Border(
            top=Side(style='double'),
            left=Side(style='thin'),
            right=Side(style='thin'),
            bottom=Side(style='double')
        )
        
        # Sum columns for totals: N, O, P, Q (14, 15, 16, 17)
        for col in range(14, 18):
            letter = get_column_letter(col)
            cell = ws.cell(row=total_row, column=col)
            cell.value = f"=SUM({letter}2:{letter}{total_row-1})"
            cell.font = Font(bold=True, size=11, color="FFFFFF")
            cell.fill = PatternFill(start_color="003D82", end_color="003D82", fill_type="solid")
            cell.number_format = '$#,##0'
            cell.border = total_border
            cell.alignment = Alignment(horizontal="right")

        # Add borders to total row label
        for col in range(1, 14):
            cell = ws.cell(row=total_row, column=col)
            cell.border = total_border
            if col == 1:
                cell.font = Font(bold=True, size=11, color="FFFFFF")
                cell.fill = PatternFill(start_color="003D82", end_color="003D82", fill_type="solid")

        wb.save(filename)
        print(f"Excel audit file generated: {filename}")
