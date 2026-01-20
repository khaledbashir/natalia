# CPQ Platform Customization Evaluation
## For Client-Specific Requirements Analysis

**Evaluation Date:** January 15, 2026  
**Platform:** ANC CPQ (Configure, Price, Quote) System  
**Tech Stack:** Next.js Frontend + Python/FastAPI Backend

---

## EXECUTIVE SUMMARY

This CPQ platform has **strong foundational architecture** suitable for enterprise customization. It provides:
- ✅ **Decoupled UI components** — Chat and Preview are independently injectable
- ✅ **Structured output capability** — JSON extraction already in state-machine
- ✅ **PDF/Excel generation** — Both modules exist (ReportLab + openpyxl)
- ✅ **File attachment support** — Binary blob responses already implemented
- ⚠️ **Limited Salesforce scaffolding** — Placeholder exists, needs build-out

**Customization Complexity:** **MEDIUM** — Core architecture supports all 5 requirements with 2-3 weeks of focused work.

---

## DETAILED EVALUATION

### 1. UI CUSTOMIZATION: "Live Preview Step"

**VERDICT:** ✅ **HIGHLY DECOUPLED — READY FOR INJECTION**

#### Current Architecture:
```
HomePage (page.tsx)
  ├── Left Panel (40% width)
  │   ├── ConversationalWizard (AI mode)
  │   ├── Wizard (Form mode)
  │   └── SalesforceSimulator (API mode)
  └── Right Panel (60% width)
      └── Preview Component (INDEPENDENT)
```

**Key Strengths:**
- **Preview is a completely independent component** — Takes `input` and `result` props, renders standalone
- **Real-time reactivity** — Uses React state hooks; preview updates on every field change
- **No coupling to chat UI** — Preview doesn't know about ChatBox internals
- **Already has export UI** — PDF/Excel download buttons, share modal (see [Preview.tsx](anc-cpq/src/components/Preview.tsx#L1-L150))

**Injection Points for Custom UI:**
1. **Document Preview Pane (NEW)** — Insert between ConversationalWizard and existing Preview:
   ```tsx
   // Pseudo-code structure
   <main className="flex h-screen">
     <LeftPanel>
       <ConversationalWizard onUpdate={handleInputChange} />
     </LeftPanel>
     <MiddlePanel className="w-[30%]">
       <DocumentPreviewPane input={input} result={result} />  {/* NEW */}
     </MiddlePanel>
     <RightPanel>
       <Preview input={input} result={result} />
     </RightPanel>
   </main>
   ```

2. **Custom React Component Library** — Inject any React UI that consumes `CPQInput` and `CalculationResult`:
   - Pane can render interactive mockups, 3D visualizations, timeline estimates, etc.
   - Receives live calculation updates via parent state
   - No modification to ChatBox or Wizard needed

**What's Already There:**
- [Preview.tsx](anc-cpq/src/components/Preview.tsx) has modular sections:
  - `SpecsTable` component
  - `PricingTable` component  
  - Download UI with tabs
  - These are independently composable

**Potential Custom Additions:**
- Interactive 3D display preview (Babylon.js/Three.js)
- Live timeline visualization (Gantt chart)
- Customizable logo injection
- Approval workflow UI
- Annotatable markup layer

**Implementation Path:**
1. Create `DocumentPreviewPane.tsx` (2-3 hours)
2. Import into [page.tsx](anc-cpq/src/app/page.tsx) 
3. Pass `input` and `result` props
4. Adjust layout widths (currently 40/60, could be 40/30/30)

**Risk:** **LOW** — No breaking changes to existing UI. Pure composition.

---

### 2. STRUCTURED OUTPUT (JSON Enforcement + Calculation Middleware)

**VERDICT:** ✅ **EXTRACTION BUILT-IN — INJECTION POINT EXISTS**

#### Current Architecture:
The chat API **already extracts JSON parameters** from natural language:

```typescript
// From /api/chat/route.ts (lines 200-1308)
// The system prompt includes:
// "BULK EXTRACTION MODE (AGGRESSIVE):
//  When the user provides a long message containing answers to multiple questions, 
//  you MUST extract ALL recognizable values AT ONCE."

// Response format:
{
  "success": true,
  "parameters": {
    "clientName": "MSG",
    "projectName": "Madison Square Garden Ribbon",
    "productClass": "Ribbon",
    "widthFt": 40,
    "heightFt": 6,
    "pixelPitch": 10,
    "environment": "Outdoor",
    "shape": "Curved",
    "access": "Front",
    "complexity": "Standard"
  },
  "rawResponse": "Got it! I've configured the proposal..."
}
```

**Key Strengths:**
- **JSON extraction already in system prompt** — AI is configured to output structured params
- **Calculator accepts partial inputs** — [calculator.ts](anc-cpq/src/lib/calculator.ts) sanitizes and fills defaults
- **State machine validates** — [state-machine.ts](anc-cpq/src/lib/state-machine.ts) confirms field completeness
- **Unified pricing layer** — [pricing-service.ts](anc-cpq/src/lib/pricing-service.ts) is single calculation point

#### Where to Inject Middleware:

**Option A: Frontend (Recommended for Client Logic)**
```typescript
// In ConversationalWizard.tsx, after API response:
const response = await fetch('/api/chat', { /* ... */ });
const data = await response.json();

// INJECTION POINT: Calculation Middleware
const calculationResult = await runCalculationMiddleware(data.parameters);
// calculationResult = {
//   extractedVars: {...},
//   formulaResults: {...},
//   warnings: [...]
// }

// Then pass to onParametersExtracted()
onParametersExtracted(calculationResult.extractedVars);
```

**Option B: Backend (Recommended for Complex Formulas)**
```python
# In src/api_routes.py, create new endpoint:
@app.post("/api/calculate-with-formulas")
async def calculate_with_formulas(config: WizardConfig):
    """
    1. Extract JSON parameters
    2. Run Excel formulas (openpyxl evaluation)
    3. Return structured results
    """
    
    # Step 1: Validate extracted parameters
    params = CPQInput(**config.dict())
    
    # Step 2: RUN EXCEL FORMULAS
    # Load anc_internal_estimation.xlsx formula workbook
    wb = openpyxl.load_workbook('anc_internal_estimation.xlsx', data_only=False)
    ws = wb['Labor Analysis']
    
    # Inject parameters as variables
    ws['B2'].value = params.widthFt  # Width
    ws['B3'].value = params.heightFt  # Height
    # ... inject all params
    
    # Step 3: Evaluate formulas
    formula_results = {
        'labor_cost': ws['B20'].value,  # Formula cell
        'structural_cost': ws['B21'].value,
        'total': ws['B22'].value
    }
    
    return {
        'extracted_vars': params.dict(),
        'formula_results': formula_results,
        'calculated_price': params.calculate_price()
    }
```

**Current Excel Formula Workflow:**
- [excel_generator.py](src/excel_generator.py) has separate tabs for:
  - LED Hardware (formulas)
  - Structural Requirements (formulas)
  - Labor Analysis (formulas)
  - Electrical Systems (formulas)
  - Professional Services (formulas)

**Key Files:**
- Input validation: [input-validator.ts](anc-cpq/src/lib/input-validator.ts)
- State machine: [state-machine.ts](anc-cpq/src/lib/state-machine.ts#L200-L250)
- Calculator: [calculator.ts](anc-cpq/src/lib/calculator.ts)

**Implementation Path:**
1. Create middleware function `calculateWithFormulas()` (2-3 hours)
2. Inject at API response handler in ConversationalWizard (1 hour)
3. Test with complex formula scenarios (2 hours)
4. Cache formula results for performance (1 hour)

**Risk:** **MEDIUM**
- Openpyxl formula evaluation isn't perfect (some Excel functions won't evaluate)
- Alternative: Use `formulas` Python library or pycel for true Excel calculation
- Recommend exporting formulas to Python functions for reliability

**Recommended Enhancement:**
```python
# src/calculation_formulas.py
class StructuralMultiplier:
    """Extracted from Excel sheet"""
    
    @staticmethod
    def calculate(env: str, condition: str, shape: str) -> float:
        base = 0.20
        if env == "Outdoor":
            base += 0.05
        if condition == "NewSteel":
            base += 0.15
        if shape == "Curved":
            base += 0.05
        return base

# This mirrors rules in calculator.ts, making it version-controlled and testable
```

---

### 3. TEMPLATED PDF GENERATION

**VERDICT:** ✅ **MODULE EXISTS — READY FOR TEMPLATING**

#### Current PDF Architecture:
```
PDF Generation Flow:
  ChatBox → Preview (UI) 
    → handleDownload("pdf")
      → POST /api/pdf
        → Puppeteer screenshot route
          → /print page (headless render)
            → Returns ArrayBuffer
              → Browser download
```

**Current Implementation:**
- **Frontend:** [Preview.tsx](anc-cpq/src/components/Preview.tsx#L200-L250) calls `/api/pdf`
- **API Route:** [/api/pdf/route.ts](anc-cpq/src/app/api/pdf/route.ts) uses Puppeteer
- **Print Page:** [/print/page.tsx](anc-cpq/src/app/print/page.tsx) renders HTML template
- **Backend (Legacy):** [pdf_generator.py](src/pdf_generator.py) uses ReportLab

**Key Strengths:**
- **HTML-based (Puppeteer)** — Fully styleable with Tailwind CSS
- **Print-optimized** — Uses `@media print` CSS
- **Branded styling** — Dark blue (#003D82) already in SpecsTable
- **Two-path architecture:**
  1. **Puppeteer path (Current)** — Renders Next.js page as PDF
  2. **ReportLab path (Legacy)** — Python backend generation

#### Enhancement Path:

**Option A: Template Injection (Recommended)**
```tsx
// /app/print/page.tsx - Make it template-aware
export default function PrintPage({ searchParams }) {
  const data = JSON.parse(decodeURIComponent(searchParams.data));
  const template = searchParams.template || 'default'; // 'default' | 'minimal' | 'detailed'
  
  return (
    <>
      {template === 'default' && <DefaultTemplate data={data} />}
      {template === 'minimal' && <MinimalTemplate data={data} />}
      {template === 'detailed' && <DetailedTemplate data={data} />}
    </>
  );
}
```

**Option B: Styled Component Library**
```tsx
// /components/PDFTemplates/DefaultTemplate.tsx
export function DefaultTemplate({ data }: { data: CPQInput }) {
  return (
    <div className="print:bg-white">
      <header className="bg-brand-blue text-white p-8">
        <Logo />
        <h1>SALES PROPOSAL</h1>
      </header>
      
      <section className="p-8">
        <ClientInfo client={data.clientName} address={data.address} />
        <SpecsTable config={data} />
        <PricingTable result={calculateCPQ(data)} />
        <TermsAndConditions template={data.serviceLevel} />
      </section>
      
      <footer className="border-t text-xs text-gray-500 p-4">
        © 2026 ANC Sports. This proposal valid for 30 days.
      </footer>
    </div>
  );
}
```

**Option C: Dynamic Logo/Branding Injection**
```tsx
// Add to CPQInput type:
interface CPQInput {
  // ... existing fields
  brandingOverrides?: {
    logoUrl?: string;
    primaryColor?: string;
    companyName?: string;
    disclaimerText?: string;
  }
}

// In template:
<img src={data.brandingOverrides?.logoUrl || '/default-logo.png'} />
<style>{`
  :root {
    --primary: ${data.brandingOverrides?.primaryColor || '#003D82'};
  }
`}</style>
```

**File Reference:**
- Template component: `/anc-cpq/src/app/print/page.tsx`
- PDF API: `/anc-cpq/src/app/api/pdf/route.ts`
- Preview component (calls PDF): `/anc-cpq/src/components/Preview.tsx`

**Implementation Path:**
1. Extract print logic into template components (2 hours)
2. Create template variants (default/minimal/detailed) (3 hours)
3. Add branding override fields to CPQInput type (1 hour)
4. Wire template selector into Preview UI (1 hour)
5. Test Puppeteer rendering for each template (2 hours)

**Risk:** **LOW**
- Puppeteer can be finicky with CSS (use simpler Tailwind patterns)
- Chrome headless has memory issues with large PDFs (not issue for proposals)
- PDF file size grows with branding images (optimize with CDN)

**Testing Notes:**
- Test with both online and offline branding images
- Verify @media print styles work correctly
- Check signature block rendering (may need special handling)

---

### 4. EXCEL/CSV EXPORT (Raw Data Dump)

**VERDICT:** ✅ **FULLY IMPLEMENTED — FILE ATTACHMENT READY**

#### Current Architecture:
```
Export Flow:
  Preview.tsx → handleDownload("excel")
    → POST /api/download-excel
      → Proxies to Python backend (localhost:8000/api/download/excel)
        → ExcelGenerator.update_expert_estimator()
          → Returns binary XLSX blob
            → Browser download as attachment
```

**Current Implementation:**
- **API Route:** [/api/download-excel/route.ts](anc-cpq/src/app/api/download-excel/route.ts)
  - Returns `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - Content-Disposition: `attachment; filename="..."`
  - ✅ **File blob support confirmed**
  
- **Excel Generator:** [excel_generator.py](src/excel_generator.py) (648 lines)
  - 8 separate worksheets:
    1. Executive Summary
    2. LED Hardware (specs & costs)
    3. Structural Requirements
    4. Labor Analysis
    5. Electrical Systems
    6. Installation Assessment
    7. Professional Services
    8. Screen Detail (per-screen breakdown)

**Current Data Exported:**
```python
# From excel_generator.py
# Each tab includes:
# - Product specifications
# - Cost line items
# - Formulas (=SUM(), =A1*B1, etc.)
# - Structured data for further processing
```

**Key Strengths:**
- **Multi-tab structure** — Client sees calculation logic breakdown
- **Formula-based** — Easy to update if pricing rules change
- **Per-screen detail** — Supports multi-screen projects
- **Professional formatting** — Blue headers, borders, alignment

#### Enhancement Path:

**Option A: Dynamic CSV Export (NEW)**
```typescript
// /api/download-csv/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dataStr = decodeURIComponent(searchParams.data);
  const input = JSON.parse(dataStr);
  
  // Convert calculation to CSV rows
  const csv = [
    ['Parameter', 'Value'],
    ['Client Name', input.clientName],
    ['Address', input.address],
    ['Product Class', input.productClass],
    ['Dimensions', `${input.widthFt}' W x ${input.heightFt}' H`],
    ['Pixel Pitch', `${input.pixelPitch}mm`],
    ['Environment', input.environment],
    ['Shape', input.shape],
    [''],
    ['COSTS', ''],
    ['Hardware', result.hardwareCost],
    ['Structural', result.structuralCost],
    ['Labor', result.laborCost],
    ['Expenses', result.expenseCost],
    ['Bond', result.bondCost],
    [''],
    ['PRICING', ''],
    ['Cost Total', result.costTotal],
    ['Sell Price (30% margin)', result.sellPrice],
    ['Grand Total (+9.5%)', result.grandTotal],
  ].map(row => row.map(cell => `"${cell}"`).join(','))
   .join('\n');
  
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="ANC_Quote.csv"'
    }
  });
}
```

**Option B: JSON Export (Machine-Readable)**
```typescript
// /api/download-json/route.ts
export async function GET(request: NextRequest) {
  const data = extractFromRequest(request);
  
  return NextResponse.json({
    metadata: {
      exportDate: new Date().toISOString(),
      proposalId: generateId(),
      version: '1.0'
    },
    configuration: {
      clientName: data.clientName,
      address: data.address,
      // ... all CPQInput fields
    },
    calculations: {
      costBreakdown: {
        hardware: result.hardwareCost,
        structural: result.structuralCost,
        labor: result.laborCost,
        // ... all costs
      },
      pricing: {
        subtotal: result.costTotal,
        margin: 0.30,
        sellPrice: result.sellPrice,
      }
    },
    exported: {
      timestamp: Date.now(),
      format: 'json'
    }
  }, {
    headers: {
      'Content-Disposition': 'attachment; filename="quote.json"'
    }
  });
}
```

**Option C: Multi-Format Download (Recommended)**
```tsx
// /components/Preview.tsx - Enhance download UI
<div className="flex gap-2">
  <button onClick={() => handleDownload('pdf')}>📄 PDF</button>
  <button onClick={() => handleDownload('excel')}>📊 Excel</button>
  <button onClick={() => handleDownload('csv')}>📋 CSV</button>
  <button onClick={() => handleDownload('json')}>🔗 JSON</button>
</div>
```

**File Attachment Verification:**
- ✅ **PDF**: [/api/pdf/route.ts](anc-cpq/src/app/api/pdf/route.ts) returns binary
- ✅ **Excel**: [/api/download-excel/route.ts](anc-cpq/src/app/api/download-excel/route.ts) returns binary
- ✅ **CSV**: Can be added as plain text (standard MIME type)
- ✅ **JSON**: Can be added as application/json

**Implementation Path:**
1. Add CSV endpoint (1 hour)
2. Add JSON endpoint (1 hour)
3. Enhance Preview download UI tabs (1 hour)
4. Test all 4 download formats (1 hour)
5. Add file type icons/labels (30 min)

**Risk:** **VERY LOW**
- File attachment is standard HTTP behavior
- All content types already in use elsewhere
- CSV/JSON generation is trivial compared to PDF

**Alternative (No Code Changes):**
The Python backend already generates Excel with full data. You could:
1. Open the Excel file in Python
2. `export_to_csv(df)` using pandas
3. Return both XLSX and CSV in a ZIP
```python
# Add to excel_generator.py
def export_as_zip(self, project_data):
    import zipfile
    with zipfile.ZipFile('export.zip', 'w') as z:
        z.write('proposal.xlsx')
        z.write('data.csv')
    return 'export.zip'
```

---

### 5. INTEGRATION POINTS (Salesforce + API Gateway)

**VERDICT:** ⚠️ **SCAFFOLDING EXISTS — NEEDS BUILD-OUT**

#### Current Architecture:
```
Frontend Modes:
  1. AI (ConversationalWizard) ✅ Fully implemented
  2. Form (Wizard) ✅ Fully implemented
  3. Salesforce (SalesforceSimulator) ⚠️ PLACEHOLDER ONLY
```

**What Exists:**
- [SalesforceSimulator.tsx](anc-cpq/src/components/SalesforceSimulator.tsx) component
- Mentioned in [page.tsx](anc-cpq/src/app/page.tsx) as a mode
- **BUT:** Just a mock UI; no actual Salesforce integration

**What's Missing:**
- ❌ Salesforce OAuth flow
- ❌ SOAP/REST API calls to Salesforce
- ❌ Opportunity/Quote object creation
- ❌ Webhook handlers for Salesforce outbound messages

#### Enhancement Path:

**Phase 1: Salesforce API Client (Week 1)**
```typescript
// /lib/salesforce-client.ts
import jsforce from 'jsforce';

class SalesforceClient {
  private conn: any;
  
  async authenticate(clientId: string, clientSecret: string, username: string, password: string) {
    this.conn = new jsforce.Connection({
      clientId,
      clientSecret,
      redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/salesforce/callback`
    });
    
    await this.conn.login(username, password);
  }
  
  async createOpportunity(input: CPQInput, result: CalculationResult) {
    return await this.conn.sobject('Opportunity').create({
      Name: `${input.clientName} - ${input.projectName}`,
      Amount: result.sellPrice,
      StageName: 'Proposal',
      CloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      Description: JSON.stringify(input),
      CustomField__c: result.grandTotal
    });
  }
  
  async createQuote(opportunityId: string, input: CPQInput, result: CalculationResult) {
    return await this.conn.sobject('Quote').create({
      OpportunityId: opportunityId,
      Name: `Quote - ${input.projectName}`,
      Subtotal: result.costTotal,
      GrandTotal: result.sellPrice
    });
  }
}

export const sfClient = new SalesforceClient();
```

**Phase 2: OAuth Flow (Week 1)**
```typescript
// /app/api/auth/salesforce/route.ts
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  
  if (code) {
    // Exchange code for access token
    const token = await exchange SalesforceAuthCode(code);
    // Store in session/database
    response.cookies.set('sf_token', token);
  }
  
  // Redirect to dashboard
  return NextResponse.redirect('/');
}
```

**Phase 3: API Endpoint for Salesforce Push (Week 2)**
```typescript
// /app/api/salesforce/push-quote/route.ts
export async function POST(request: NextRequest) {
  const { input, result, opportunityId } = await request.json();
  
  try {
    // Authenticate with stored token
    const client = new SalesforceClient();
    
    // Create Quote in Salesforce
    const quote = await client.createQuote(opportunityId, input, result);
    
    // Attach calculation data as attachment
    await client.attachCalculationData(quote.id, result);
    
    return NextResponse.json({
      success: true,
      sfQuoteId: quote.id,
      sfOpportunityId: opportunityId
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Phase 4: UI Integration (Week 2)**
```tsx
// /components/SalesforceIntegration.tsx
export function SalesforceIntegration({ input, result }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [opportunityId, setOpportunityId] = useState('');
  
  const handlePushToSalesforce = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/salesforce/push-quote', {
        method: 'POST',
        body: JSON.stringify({ input, result, opportunityId })
      });
      
      const data = await res.json();
      setStatus('success');
      // Show Salesforce link
    } catch {
      setStatus('error');
    }
  };
  
  return (
    <div>
      <input 
        placeholder="Salesforce Opportunity ID"
        value={opportunityId}
        onChange={e => setOpportunityId(e.target.value)}
      />
      <button 
        onClick={handlePushToSalesforce}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Pushing...' : 'Send to Salesforce'}
      </button>
    </div>
  );
}
```

#### API Gateway / Webhook Structure:

**Current State:**
- ✅ Next.js API routes handle all endpoints
- ✅ CORS middleware configured in [api_routes.py](src/api_routes.py)
- ❌ No unified API gateway (Kong, Tyk, Apigee)
- ❌ No webhook handler for inbound Salesforce events

**Recommended Architecture:**
```
Salesforce (OAuth + REST)
    ↓
  [API Gateway - Optional layer]
    ↓
  Next.js API Routes (/api/salesforce/*)
    ↓
  Python FastAPI Backend (src/api_routes.py)
    ↓
  Database / Calculations
```

**To Add Webhooks (for Salesforce → ANC updates):**
```typescript
// /app/api/webhooks/salesforce/route.ts
export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-salesforce-signature');
  
  // Verify webhook signature
  if (!verifySalesforceSignature(signature, request)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const event = await request.json();
  
  // Handle events
  switch (event.type) {
    case 'quote.updated':
      // Sync quote changes back to CPQ
      break;
    case 'opportunity.closed':
      // Archive proposal
      break;
  }
  
  return NextResponse.json({ success: true });
}
```

#### Implementation Timeline:

| Phase | Task | Effort | Notes |
|-------|------|--------|-------|
| 1 | Install jsforce library | 30 min | Add to package.json |
| 2 | Create SalesforceClient | 4 hours | Handle auth, CRUD |
| 3 | OAuth flow UI | 3 hours | Login button + callback |
| 4 | Push quote endpoint | 3 hours | Create Quote/Opportunity |
| 5 | Preview UI button | 2 hours | Wire to endpoint |
| 6 | Webhook receiver | 2 hours | For future inbound sync |
| **Total** | | **14-16 hours** | **~2 days focused** |

**Risk Assessment:**

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Salesforce org config unknown | HIGH | Coordinate with client's SF admin early |
| Custom field mappings | MEDIUM | Document required Salesforce schema upfront |
| OAuth token refresh | MEDIUM | Implement refresh token rotation |
| Quote PDF in SF | LOW | Use Salesforce ContentVersion API |

**Testing Checklist:**
- [ ] Salesforce sandbox auth works
- [ ] Opportunity created with correct fields
- [ ] Quote synced to opportunity
- [ ] Calculations round-trip correctly
- [ ] Webhook signature validation works
- [ ] Token refresh on expiry

#### Alternative: Lightweight (No OAuth)

If client doesn't want OAuth complexity:
```typescript
// Simple API key approach
const sfApiKey = process.env.SALESFORCE_API_KEY;
const sfOrgId = process.env.SALESFORCE_ORG_ID;

fetch(`https://${sfOrgId}.salesforce.com/services/apexrest/cpq/quote`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${sfApiKey}` },
  body: JSON.stringify({ input, result })
})
```
**Simpler:** 4-6 hours, but less flexible for multiple users.

---

## IMPLEMENTATION ROADMAP

### **Week 1: Foundation**
- [ ] Evaluate exact client Excel formulas → Mirror in Python functions
- [ ] Design Document Preview component
- [ ] Set up Salesforce dev org / sandbox access
- [ ] Audit [calculator.ts](anc-cpq/src/lib/calculator.ts) rules vs. client specs

### **Week 2: Core Customizations**
- [ ] Implement UI injection (Document Preview Pane)
- [ ] Add calculation middleware with formula evaluation
- [ ] Create PDF template variants
- [ ] Implement CSV/JSON export endpoints
- [ ] Build SalesforceClient and OAuth flow

### **Week 3: Integration & Testing**
- [ ] End-to-end testing (Chat → Calculation → Exports → Salesforce)
- [ ] Performance testing (payload sizes, PDF generation time)
- [ ] Security audit (CORS, token handling)
- [ ] Client UAT and feedback loop

---

## TECHNOLOGY STACK RECOMMENDATIONS

| Requirement | Current | Recommended | Notes |
|-------------|---------|-------------|-------|
| **UI Framework** | React 18 | ✅ Continue | Solid, has good component patterns |
| **PDF Generation** | Puppeteer | Puppeteer or WeasyPrint | Puppeteer works fine, alternative: WeasyPrint (better HTML/CSS) |
| **Excel Formulas** | openpyxl | `formulas` lib + openpyxl | openpyxl alone won't evaluate formulas; use `formulas` package |
| **CRM Integration** | — | jsforce (official SF lib) | Mature, well-maintained |
| **API Gateway** | None | Kong or Traefik | Optional; good for multi-tenant scaling |
| **Webhooks** | — | ngrok (dev) → production gateway | ngrok for testing; production needs proper setup |

---

## RISK MATRIX

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Excel formula migration breaks | MEDIUM | HIGH | Test formulas line-by-line; create Python unit tests |
| Puppeteer PDF rendering issues | LOW | MEDIUM | Use simpler CSS; test on target HTML |
| Salesforce auth complexity | MEDIUM | MEDIUM | Use sandbox for development; start with API key approach |
| Performance (large PDFs) | LOW | MEDIUM | Optimize images; lazy-load calculations |
| Data loss on file export | LOW | CRITICAL | Implement backup; use database for long-term storage |

---

## CONCLUSION

**This CPQ platform is highly customizable for enterprise needs.** All 5 client requirements are achievable with the existing architecture:

1. ✅ **UI Preview** — Pure React composition; 2-3 days
2. ✅ **JSON + Middleware** — Extraction built-in; 3-4 days
3. ✅ **PDF Templating** — Puppeteer ready; 2-3 days
4. ✅ **Excel/CSV Export** — Already exists; add CSV in 1 day
5. ⚠️ **Salesforce** — Needs development; 5-7 days

**Total Effort:** 14-20 days of focused development (2-3 person-weeks)

**Recommendation:** Start with UI customization + calculation middleware (highest ROI), then add Salesforce once client's org is ready.

---

## APPENDIX: Key File Cross-Reference

| Feature | Frontend | Backend | API Route |
|---------|----------|---------|-----------|
| **Chat Input** | [ConversationalWizard.tsx](anc-cpq/src/components/ConversationalWizard.tsx) | — | [/api/chat/route.ts](anc-cpq/src/app/api/chat/route.ts) |
| **Calculation** | [calculator.ts](anc-cpq/src/lib/calculator.ts) | [calculator.py](src/calculator.py) | — |
| **UI Preview** | [Preview.tsx](anc-cpq/src/components/Preview.tsx) | — | — |
| **PDF Export** | [Preview.tsx](anc-cpq/src/components/Preview.tsx) | — | [/api/pdf/route.ts](anc-cpq/src/app/api/pdf/route.ts) |
| **Excel Export** | [Preview.tsx](anc-cpq/src/components/Preview.tsx) | [excel_generator.py](src/excel_generator.py) | [/api/download-excel/route.ts](anc-cpq/src/app/api/download-excel/route.ts) |
| **State Management** | [state-machine.ts](anc-cpq/src/lib/state-machine.ts) | — | — |
| **Type Definitions** | [types.ts](anc-cpq/src/lib/types.ts) | — | — |

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-15  
**Prepared For:** Client Requirement Evaluation
