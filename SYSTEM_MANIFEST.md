# ANC CPQ System Manifest & Technical Breakdown

>**Status**: Production Ready
>**Version**: v1.2 (Includes Dynamic Contingency & Secure Pricing)
>**Architecture**: React (Next.js) Frontend + Python (FastAPI) Calculation Engine

## 1. THE "BRAIN" (Logic & State)

### State Management (`CPQInput`)
The application tracks a strict set of variables in the React `session_state` (via `ConversationalWizard.tsx`), ensuring no "hallucinated" data enters the pipeline.

**Core Variables:**
- **Metadata**: `clientName`, `address`, `projectName` (Context)
- **Product**: `productClass` (Scoreboard/Ribbon), `pixelPitch` (4/6/10/16mm)
- **Dimensions**: `widthFt`, `heightFt` (Exact sizes)
- **Configuration**: `environment` (Indoor/Outdoor), `shape` (Flat/Curved), `access` (Front/Rear)
- **Value-Add Logic**: `structureCondition` (New/Existing), `unitCost` (Manual Override), `targetMargin` (%)

### Logic Flow
1.  **Initialization**: Loads `INITIAL_CPQ_STATE` (Default: Indoor 10mm Scoreboard).
2.  **Conversational Loop**:
    *   User input is sent to `POST /api/chat`.
    *   **AI Processing**: The LLM (GLM-4.7) analyzes the text against the `Expert Reasoning` prompt.
    *   **Inference Engine**: If the AI fails to return JSON (e.g., "dumb model" fallback), a regex-based inference engine detects context keywords (e.g., "installed" -> Environment) to force-render interactive buttons.
    *   **State Update**: Valid JSON responses update `cpqState`.
3.  **Completion**: Once all 10 fields are filled, the "Generate Proposal" button unlocks.

### Multi-Screen Logic
*   **Backend Support**: The `ProjectRequest` model (`server.py`) accepts a `screens` list, allowing for infinite multi-zone configurations (e.g., Main + Ribbon + Vomitory).
*   **Frontend Implementation**: Currently configured as a linear flow (Single Screen focus), but the data structure is built to support appending multiple `ScreenConfig` objects to the payload before generation.

## 2. THE "CALCULATOR" (Math & Pricing)

### Pricing Logic (`calculator.py`)
Pricing is determined by a **"Waterfalls"** logic:
1.  **Manual Override**: Checks `unit_cost`. If user entered a value (e.g., $1200), **this takes 100% precedence**.
2.  **Industry Average Fallback** (if no manual input):
    ```python
    PRICING_TABLE = {
        10: { "Indoor": 1200.0, "Outdoor": 1800.0 }, # 10mm
        6:  { "Indoor": 1800.0, "Outdoor": 2400.0 }, # 6mm
        4:  { "Indoor": 2500.0, "Outdoor": 3200.0 }  # 4mm
    }
    ```
3.  **Ribbon Surcharge**: If `product_class == 'Ribbon'`, applies a **1.2x (20%)** multiplier to the base rate.

### Power Calculation (Amperage)
*   **Logic**: Handled by the **AI Reasoning Layer** (`route.ts`), not the Python backend.
*   **Formula**:
    *   **Outdoor**: `(Area_SqFt * 60 Watts) / 120 Volts`
    *   **Indoor**: `(Area_SqFt * 30 Watts) / 120 Volts`
*   **Display**: Shown in the "Visual Confirmation Card" before PDF generation.

### Dynamic Contingency (5%)
*   **Trigger Condition**: `(Structure == 'NewSteel') AND (Environment == 'Outdoor')`
*   **Logic**:
    ```python
    if project_input.is_outdoor and project_input.structure_condition == 'NewSteel':
         contingency_cost = round(sub_total * 0.05) # Add 5% Risk Buffer
    ```
    *This creates a hidden "safety net" for complex outdoor installs.*

## 3. THE "EXCEL BRIDGE" (`excel_generator.py`)

### Cell Targeting Strategy
The system **injects raw values** into your specific "Expert Estimator" template (`ABCDE-SPECS-NK-12.12-1.xlsx`), preserving all your complex downstream formulas.

**Target Map:**
*   **Product Class** -> `C5`
*   **Active Height** -> `F5`
*   **Active Width** -> `G5`
*   **Pixel Pitch** -> `H5`
*   **Cost Per Sq. Ft.** -> **`P5`** (Critical Overwrite)

### Manual vs. Default Logic
The Python script is "dumb" but obedient. It simply writes whatever the `Calculation Engine` determined as the `base_rate`.
*   If you entered "$1,000" in chat -> `math_data['base_rate']` is 1000 -> Excel P5 becomes 1000.
*   If you left it blank -> `math_data['base_rate']` is 1200 (Table lookup) -> Excel P5 becomes 1200.

**Formula Recalculation:** We only write **INPUTS**. When you open the Excel file, Excel's native engine instantly recalculates the "Total Sell Price" based on these new inputs.

## 4. THE "PDF ENGINE" (`pdf_generator.py`)

### Generation Tech
*   **Library**: `ReportLab` (Python-based PDF generation standard). It creates a vector-based PDF from scratch, guaranteeing pixel-perfect layout regardless of screen size.
*   **Layout**: Uses a `Table`-based layout with "ANC Blue" (#3b82f6) branding headers.

### Visual Confirmation Card
*   **Logic Location**: `ConversationalWizard.tsx` (Frontend).
*   **Trigger**: When `msg.nextStep === 'confirm'`.
*   **Purpose**: Acts as a "Gatekeeper" to prevent generating bad PDFs. It forces the user to review the Amperage and Dimensions one last time.

### Line Items
*   **Bundled Pricing**: The PDF currently shows a **Single "Installed Price"** line item (Hardware + Structural + Labor + Expenses + Bond + Margin).
*   **Strategic Choice**: This prevents "sticker shock" on individual line items (like Labor) and presents a clean, executive-summary style proposal.

## 5. UI/UX FEATURES

### Progress Bar
*   **Implementation**: A dynamic Tailwind CSS `div` width.
*   **Math**: `(filled_fields_count / 10) * 100` percent. It visually reinforces momentum to keep the user engaged.

### Reset Project
*   **Action**: `window.location.reload()`.
*   **Effect**: This is a "Hard Reset". It completely wipes the React memory state and clears the chat history, ensuring a fresh start for a new client without any lingering variable pollution.

### Expert Reasoning Toggle
*   **Implementation**: A React State boolean (`showThinking`).
*   **Data Source**: The "thinking" field from the AI response (e.g., from GLM-4.7's `reasoning_content` or a custom parsed field). It allows you to peek "behind the curtain" to see *why* the AI suggested a specific option.

## 6. DATA PERSISTENCE & STORAGE

### Current Architecture: "Client-Side First"
The system currently does **NOT** use an external SQL database (Postgres/MySQL) to minimize deployment complexity and maintenance overhead for this demo phase.

1.  **Session Persistence (RAM)**:
    *   **Mechanism**: React `useState` hooks.
    *   **Duration**: Active while the browser tab is open.

2.  **User State Persistence (Browser)**:
    *   **Mechanism**: `localStorage` (Keys: `anc_cpq_session`, `anc_cpq_history`).
    *   **Function**: Autosaves the current wizard progress and stores "Previous Proposals". This ensures users don't lose data on refresh.

3.  **File Storage (Ephemeral)**:
    *   **Mechanism**: Server-side file generation (`/src/*.xlsx`, `/src/*.pdf`).
    *   **Behavior**: Files are generated on-the-fly and served to the user. In a containerized (EasyPanel) environment without persistent volumes, these files are temporary and exist only for the duration of the container's lifecycle.

### Future Scalability (Production Path)
To move to a centralized enterprise model, the following upgrades are recommended:
*   **Database**: Connect a PostgreSQL instance to store `ProjectRequest` and `CalculationResult` objects permanently.
*   **Object Storage**: Use AWS S3 (or MinIO) to store generated PDFs/Excels instead of the local container filesystem.
