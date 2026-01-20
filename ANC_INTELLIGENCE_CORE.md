# ANC CPQ - Intelligence Core & Logic Blueprint

**Target Platform:** OwnLLM / AnythingLLM
**Subject:** Subject Matter Expert (SME) Knowledge Base for ANC Proposal Automation

---

## 🏗️ 1. Project Mission
Automate the 4-hour manual process of building LED screen proposals into a 5-minute conversational workflow. The system must produce two outputs:
1.  **Pretty PDF**: Client-facing, branded executive summary.
2.  **Ugly Excel**: Internal "Audit Trail" with all 18 categories of math for estimators to verify.

## 🧮 2. The "Golden Formulas" (Ugly Math)
The AI must use these precise multipliers. Do NOT hallucinate prices.

### A. HARDWARE (Category 1)
- **Base Rate**: Based on Pixel Pitch (10mm, 6mm, 4mm, 1.5mm) and Environment (Indoor/Outdoor).
- **Ribbon Board Surcharge**: +20% (custom cabinet engineering).

### B. STRUCTURAL (Categories 2-3)
- **Materials**: `Hardware Cost × 20%`. 
    - *Modifiers*: New Steel (+15%), Rigging (+10%), Curved (+5%).
- **Labor**: `(Hardware + Materials) × 15%`.
    - *Modifiers*: Union (+15%), Prevailing (+10%).

### C. ELECTRICAL & DATA (Categories 5-6)
- **PDUs**: 1.5 units per display (approx. $2,500/unit).
- **Cabling**: $15/ft based on distance (Close: 50ft, Medium: 150ft, Far: 300ft).
- **Subcontracting**: ~80 hours labor per project at $150/hr.

### D. PROFESSIONAL SERVICES (Categories 10-13)
- **Project Management**: `Subtotal × 8%`. Adjust for complexity (Standard, High, Very High).
- **General Conditions**: `Subtotal × 5%`.
- **Submittals**: $2,500 per display type.

### E. THE FINALE
- **Margin**: Applied to the final subtotal (default is 30% or `Sell Price = Cost / (1 - Margin)`).
- **Contingency**: +5% if project is both `Outdoor` AND `NewSteel`.
- **Timeline Surcharge**: Rush (+20%), ASAP (+50%).

## 📝 3. Conversational "Interviewer" Logic
The AI should act as a consultant. If variables are missing, it MUST ask:
1.  **Venue Details**: Name and address.
2.  **Product Class**: Scoreboard, Ribbon, Center-Hung, Vomitory?
3.  **Environment**: Indoor or Outdoor? (Critical for IP rating and structural wind loads).
4.  **Service Access**: Front or Rear? (Impacts labor cost).
5.  **Steel Condition**: Existing or New Steel? (Huge pricing driver).
6.  **Labor Requirement**: Union or Non-Union?

## 🛠️ 4. System Architecture (OwnLLM Integration)
- **Thread Notes**: Use the side-panel editor to draft the proposal text.
- **Agents**: Use the `@anc` agent to run mathematical calculations.
- **CRM**: Track every proposal as a card in the "ANC Sales Pipeline."
- **Export**: Trigger PDF generation using the ANC-branded template.

---
**Institutional Note**: This logic belongs to ANC Sports Enterprises. All calculations must be verified by a human estimator before client delivery.
