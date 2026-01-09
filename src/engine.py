from typing import List
import json
from catalog import ProductCatalog
from calculator import CostCalculator, ScreenInput

def run_proposal_engine(inputs: List[ScreenInput]):
    # 1. Init Catalog
    catalog_path = "/root/.gemini/antigravity/brain/19969d02-0a9d-4271-8642-fdc57ea4b842/mock_led_data.json"
    catalog = ProductCatalog(catalog_path)
    
    # 2. Init Calculator
    calculator = CostCalculator(catalog)
    
    # 3. Process Items
    results = []
    project_total_price = 0
    project_total_cost = 0
    
    print(f"--- Processing {len(inputs)} Screens ---")
    
    for i, screen_in in enumerate(inputs):
        try:
            line_item = calculator.calculate_line_item(screen_in)
            results.append(line_item)
            
            p_price = line_item['pricing']['final_sell_price']
            p_cost = line_item['costs']['total_cost']
            
            project_total_price += p_price
            project_total_cost += p_cost
            
            print(f"Screen {i+1} [{line_item['specs']['product_name']}]")
            print(f"  > Dimensions: {line_item['specs']['width_ft']}w x {line_item['specs']['height_ft']}h")
            print(f"  > Cost: ${p_cost:,.2f}")
            print(f"  > Price: ${p_price:,.2f} (Margin: {line_item['pricing']['target_margin_pct']}%)")
            print("-" * 30)
            
        except Exception as e:
            print(f"Error processing screen {i+1}: {e}")

    # 4. Summary
    print("=== Project Summary ===")
    print(f"Total Project Cost: ${project_total_cost:,.2f}")
    print(f"Total Sell Price:   ${project_total_price:,.2f}")
    if project_total_price > 0:
        gross_margin = (project_total_price - project_total_cost) / project_total_price
        print(f"Blended Margin:     {gross_margin*100:.2f}%")
        
    return results

if __name__ == "__main__":
    # Test Run with Mock Inputs
    test_inputs = [
        # Screen 1: Outdoor Pole Mount
        ScreenInput(
            product_id=11, 
            quantity=1, 
            is_outdoor=True, 
            mounting_type="Pole",
            distance_from_power=200
        ),
        # Screen 2: Indoor Wall Mount
        ScreenInput(
            product_id=111,
            quantity=2,
            is_outdoor=False,
            mounting_type="Wall",
            distance_from_data=50
        )
    ]
    
    output = run_proposal_engine(test_inputs)
    
    # Dump to JSON
    with open("output_test.json", "w") as f:
        json.dump(output, f, indent=2)

    # Generate Excel Audit
    from excel_generator import ExcelGenerator
    excel_gen = ExcelGenerator()
    excel_gen.generate_audit_file(output, "anc_internal_estimation.xlsx")

    # Generate PDF Proposal
    from pdf_generator import PDFGenerator
    pdf_gen = PDFGenerator()
    pdf_gen.generate_proposal(output, "anc_client_proposal.pdf")
