from typing import List
from calculator import ScreenInput
from engine import run_proposal_engine
import sys

def get_input(prompt, default=None):
    if default:
        user_in = input(f"{prompt} [{default}]: ")
        return user_in if user_in else default
    else:
        return input(f"{prompt}: ")

def get_bool(prompt):
    while True:
        val = input(f"{prompt} (y/n): ").lower()
        if val in ['y', 'yes']: return True
        if val in ['n', 'no']: return False

def main():
    print("==========================================")
    print("   ANC PROPOSAL GENERATOR - WIZARD v1.0   ")
    print("==========================================")
    
    client_name = get_input("Client Name")
    project_addr = get_input("Project Address")
    
    screens = []
    
    while True:
        print("\n--- ADDING A SCREEN ---")
        
        # Product Selection Mock (List a few IDs)
        print("Available Mock Products:")
        print("  11: Reserve Level Ribbon (10mm)")
        print("  111: Scoreboard Replacement (10mm)")
        
        try:
            prod_id = int(get_input("Enter Product ID used", "11"))
        except:
            print("Invalid ID. Using 11.")
            prod_id = 11

        qty = int(get_input("Quantity", "1"))
        width = float(get_input("Width (ft)", "20"))
        height = float(get_input("Height (ft)", "5"))
        
        # Logic Triggers
        is_outdoor = get_bool("Is this screen OUTDOORS?")
        mount_type = get_input("Mounting Type (Wall, Pole, Header)", "Wall")
        
        # Soft Cost Drivers
        crew = int(get_input("Est. Install Crew Size", "2"))
        dist_power = float(get_input("Distance to Power (ft)", "50"))
        
        screens.append(ScreenInput(
            product_id=prod_id,
            quantity=qty,
            custom_width_ft=width,
            custom_height_ft=height,
            is_outdoor=is_outdoor,
            mounting_type=mount_type,
            crew_size=crew,
            distance_from_power=dist_power
        ))
        
        if not get_bool("Add another screen?"):
            break
            
    print("\n\nReady to generate proposal...")
    print(f"Client: {client_name}")
    print(f"Screens: {len(screens)}")
    
    if get_bool("Generate Output Files now?"):
        run_proposal_engine(screens)
        print("\nSUCCESS! Files generated:")
        print(" - anc_internal_estimation.xlsx")
        print(" - anc_client_proposal.pdf")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nWizard cancelled.")
        sys.exit(0)
