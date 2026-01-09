import streamlit as st
import pandas as pd
from engine import run_proposal_engine
from calculator import ScreenInput
import os

st.set_page_config(page_title="ANC Proposal Generator", layout="wide")

st.title("ANC Automated Proposal System")
st.markdown("### Generate Branded Proposals & Specifications")

# Sidebar for Project Info
st.sidebar.header("Project Details")
client_name = st.sidebar.text_input("Client Name", "Test Client")
project_addr = st.sidebar.text_input("Project Address", "123 Venue Blvd")

# Catalog Data (Mock)
PRODUCTS = {
    11: "Reserve Level Ribbon (10mm)",
    111: "Scoreboard Replacement (10mm)",
    1231: "Pavilion Scoreboard (10mm)",
    131: "Out of Town Scoreboard (10mm)"
}

if "screens" not in st.session_state:
    st.session_state.screens = []

# Input Form
st.subheader("Add a Screen")
c1, c2, c3 = st.columns(3)
with c1:
    prod_id = st.selectbox("Product", options=list(PRODUCTS.keys()), format_func=lambda x: PRODUCTS[x])
    qty = st.number_input("Quantity", 1, 100, 1)
with c2:
    width = st.number_input("Width (ft)", 5.0, 5000.0, 20.0)
    height = st.number_input("Height (ft)", 1.0, 500.0, 5.0)
with c3:
    is_outdoor = st.checkbox("Outdoor Screen?")
    mount = st.selectbox("Mounting", ["Wall", "Pole", "Header"])

st.markdown("**(Soft Cost Drivers)**")
c4, c5 = st.columns(2)
crew = c4.number_input("Install Crew Size", 2, 20, 2)
pwr_dist = c5.number_input("Dist. to Power (ft)", 0, 5000, 50)

if st.button("Add Screen to List"):
    s_in = ScreenInput(
        product_id=prod_id, quantity=qty, 
        custom_width_ft=width, custom_height_ft=height,
        is_outdoor=is_outdoor, mounting_type=mount,
        crew_size=crew, distance_from_power=pwr_dist
    )
    st.session_state.screens.append(s_in)
    st.success("Screen Added!")

# Display Current List
if st.session_state.screens:
    st.markdown("---")
    st.subheader(f"Current Config ({len(st.session_state.screens)} Screens)")
    
    # Simple DataFrame view
    view_data = []
    for i, s in enumerate(st.session_state.screens):
        view_data.append({
            "Product": PRODUCTS.get(s.product_id, s.product_id),
            "Qty": s.quantity,
            "Size": f"{s.custom_width_ft}x{s.custom_height_ft}",
            "Type": "Outdoor" if s.is_outdoor else "Indoor",
            "Mount": s.mounting_type
        })
    st.table(pd.DataFrame(view_data))

    if st.button("GENERATE PROPOSAL", type="primary"):
        with st.spinner("Running Engine..."):
            try:
                results = run_proposal_engine(st.session_state.screens)
                
                # Metrics
                total_cost = sum(r['costs']['total_cost'] for r in results)
                sell_price = sum(r['pricing']['final_sell_price'] for r in results)
                margin = (sell_price - total_cost) / sell_price if sell_price else 0
                
                c1, c2, c3 = st.columns(3)
                c1.metric("Total Sell Price", f"${sell_price:,.2f}")
                c2.metric("Total Cost", f"${total_cost:,.2f}")
                c3.metric("Margin", f"{margin*100:.1f}%")
                
                # Check for files
                if os.path.exists("anc_client_proposal.pdf"):
                    with open("anc_client_proposal.pdf", "rb") as f:
                        st.download_button("Download PDF Proposal", f, "proposal.pdf", "application/pdf")
                
                if os.path.exists("anc_internal_estimation.xlsx"):
                    with open("anc_internal_estimation.xlsx", "rb") as f:
                        st.download_button("Download Excel Audit", f, "audit.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                        
            except Exception as e:
                st.error(f"Error: {e}")
