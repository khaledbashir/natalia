# CPQ Platform: Architecture & Decision Trees

Quick reference for customization decisions and implementation flows.

---

## HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS FRONTEND                            │
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │  page.tsx (Main Layout)                                      │   │
│ ├──────────────────────────────────────────────────────────────┤   │
│ │ Left (35%)       │ Middle (25%)        │ Right (40%)         │   │
│ ├──────────────────┼────────────────────┼────────────────────┤   │
│ │ • Wizard         │ • DocumentPreview   │ • Preview & Export │   │
│ │ • Chat Input     │   (NEW)             │   (EXISTING)       │   │
│ │ • Controls       │ • Status Display    │ • PDF/Excel        │   │
│ └──────────────────┴────────────────────┴────────────────────┘   │
│                           │                                        │
│  API Routes (/api/*)      │                                        │
│  ├─ /chat               ──┼──> AI Extraction + Prompt Response    │
│  ├─ /calculate          ──┼──> Pricing Engine (memoized)          │
│  ├─ /pdf                ──┼──> Puppeteer Screenshot               │
│  ├─ /download-excel    ──┼──> Proxy to Python Backend             │
│  ├─ /download-csv      ──┼──> (NEW) CSV Generation                │
│  └─ /salesforce/*      ──┼──> (NEW) CRM Integration               │
└────────────────────────────┼─────────────────────────────────────┘
                             │
           ┌─────────────────┴──────────────────┐
           │                                    │
   PYTHON FASTAPI BACKEND              (OPTIONAL)
   ┌─────────────────────────┐         STRIPE/PAYMENT
   │ src/api_routes.py       │
   ├─────────────────────────┤
   │ • Calculator            │         ┌──────────────────┐
   │ • Catalog/Templates     │         │ EXTERNAL APIS    │
   │ • PDF Generator         │         ├──────────────────┤
   │ • Excel Generator       │         │ • Salesforce     │
   │ • Database Persistence  │         │ • N8N Workflows  │
   └─────────────────────────┘         │ • Google Maps    │
           │                           └──────────────────┘
      ┌────┴──────┐
      │  DATABASE │
      └───────────┘
```

---

## DECISION TREE: Which Customization First?

```
START: Client Requirements Analysis
│
├─ Does client want LIVE PREVIEW in UI?
│  ├─ YES → Start with UI Customization (1-2 days)
│  │        Then add calculation middleware
│  └─ NO  → Skip to calculation requirements
│
├─ Does client have COMPLEX EXCEL FORMULAS?
│  ├─ YES → Priority 2: Calculation Middleware (2-3 days)
│  │        ├─ Mirror formulas in Python
│  │        ├─ Test thoroughly
│  │        └─ Wire to API
│  └─ NO  → Use existing calculator
│
├─ Does client need BRANDED PDFs with custom templates?
│  ├─ YES → Priority 3: PDF Templates (2-3 days)
│  │        ├─ Create component-based templates
│  │        ├─ Test Puppeteer rendering
│  │        └─ Add template selector
│  └─ NO  → Use existing PDF (Puppeteer default)
│
├─ Does client require DATA EXPORTS (CSV/JSON)?
│  ├─ YES → Priority 4: Add CSV endpoint (1 day)
│  │        └─ Already have Excel; CSV is trivial addition
│  └─ NO  → Skip export customization
│
└─ Does client want SALESFORCE integration?
   ├─ YES → Priority 5: Salesforce Client + OAuth (5-7 days)
   │        ├─ Coordinate with client's SF admin
   │        ├─ Test sandbox auth flow
   │        ├─ Map CPQInput → SF Opportunity/Quote schema
   │        └─ Implement webhook receiver
   └─ NO  → Integration complete

RECOMMENDED SEQUENCE FOR MOST CLIENTS:
1. UI Customization (preview pane)
2. Calculation Middleware (formula validation)
3. PDF Templates (branding)
4. CSV Export (data dump)
5. Salesforce (if needed)

Total: 14-20 days with full customization
```

---

## DEPENDENCY GRAPH

```
┌──────────────────────────────────────────────────────────────┐
│                    types.ts (CPQInput)                       │
│                    └─ Core type definitions                  │
└──────────────┬───────────────────────────────────────────────┘
               │
       ┌───────┼───────┐
       │       │       │
       ▼       ▼       ▼
   INPUT    STATE      PRICING
  VALIDATOR MACHINE   SERVICE
       │       │       │
       └───────┼───────┘
               │
       ┌───────┼───────┐
       │       │       │
       ▼       ▼       ▼
  CALCULATOR  CHAT  PREVIEW
  (Core)      API   (UI)
       │       │       │
       └───────┼───────┘
               │
   ┌───────────┼───────────┐
   │           │           │
   ▼           ▼           ▼
 PDF       EXCEL      SALESFORCE
PUPPETEER  EXPORT     (Optional)
```

**Key Takeaway:** Modify types.ts → Everything else updates automatically.

---

## FILE MODIFICATION PRIORITY

```
TIER 1: Foundation (Required for any customization)
├─ types.ts
│  └─ Add brandingOverrides, customFields, etc.
└─ calculator.ts
   └─ Ensure formula logic matches client specs

TIER 2: UI/UX (For preview requirement)
├─ page.tsx
│  └─ Adjust layout widths, add new panels
├─ components/DocumentPreviewPane.tsx (NEW)
│  └─ Create custom preview component
└─ components/Preview.tsx
   └─ Minor tweaks for new layout

TIER 3: Calculation Pipeline (For formula customization)
├─ src/calculation_middleware.py (NEW)
│  └─ Add complex formula evaluation
├─ src/api_routes.py
│  └─ Add /api/calculate-with-formulas endpoint
└─ components/ConversationalWizard.tsx
   └─ Hook up middleware to chat response

TIER 4: Exports (For multi-format requirement)
├─ app/api/download-csv/route.ts (NEW)
│  └─ CSV generation
├─ app/api/download-json/route.ts (NEW)
│  └─ JSON export
└─ components/Preview.tsx
   └─ Add export format tabs

TIER 5: CRM Integration (If Salesforce needed)
├─ lib/salesforce-client.ts (NEW)
│  └─ OAuth + CRUD operations
├─ app/api/salesforce/push-quote/route.ts (NEW)
│  └─ Create opportunity/quote
├─ app/api/salesforce/webhooks/route.ts (NEW)
│  └─ Inbound sync from SF
└─ components/SalesforceButton.tsx (NEW)
   └─ Push UI

TIER 6: PDF Templating (For branded proposals)
├─ components/PDFTemplates/DefaultTemplate.tsx (NEW)
├─ components/PDFTemplates/MinimalTemplate.tsx (NEW)
├─ app/print/page.tsx
│  └─ Template selector logic
└─ app/api/pdf/route.ts
   └─ Minor updates for template param
```

---

## DEPLOYMENT CHECKLIST

### Before First Client Deployment:

```
INFRASTRUCTURE
├─ [ ] Database: Set up PostgreSQL for persistent storage
├─ [ ] Caching: Add Redis for calculation memoization
├─ [ ] File Storage: S3 or similar for PDF/Excel files
├─ [ ] CDN: CloudFlare for branding images
└─ [ ] Monitoring: Sentry for error tracking

SECURITY
├─ [ ] SSL/TLS: HTTPS only (via Traefik/nginx)
├─ [ ] CORS: Whitelist client domains
├─ [ ] Auth: Implement proper session management
├─ [ ] Data: Encrypt PII (client names, addresses)
├─ [ ] Validation: Sanitize all user inputs
└─ [ ] Secrets: Use .env for API keys, never commit

TESTING
├─ [ ] Unit tests: Calculator formulas
├─ [ ] Integration tests: Chat → Export flow
├─ [ ] E2E tests: Full wizard → PDF download
├─ [ ] Performance: Load testing (100+ concurrent users)
├─ [ ] PDF rendering: Test all templates in Chrome headless
└─ [ ] Salesforce: Test auth flow in sandbox

COMPLIANCE
├─ [ ] GDPR: Data deletion policies
├─ [ ] HIPAA: If healthcare-related
├─ [ ] Payment: PCI-DSS if handling cards
└─ [ ] Audit: Document all integrations
```

---

## COMMON PITFALLS & FIXES

### Pitfall 1: Puppeteer PDF Rendering Breaks with CSS

**Symptom:** PDF looks fine in browser, but Puppeteer output is corrupted.

**Root Cause:** Puppeteer's Chrome engine has limited CSS support for certain properties.

**Fix:**
```tsx
// Avoid (may not render correctly):
className="bg-gradient-to-r from-blue-500 to-purple-500"

// Use (safe):
className="bg-blue-900"

// For print-specific styling:
@media print {
  body { -webkit-print-color-adjust: exact !important; }
}
```

---

### Pitfall 2: Excel Formula Evaluation Fails

**Symptom:** Openpyxl reads formulas as text, doesn't calculate.

**Root Cause:** Openpyxl doesn't evaluate formulas; it reads them as-is.

**Fix:**
```python
# WRONG:
wb = openpyxl.load_workbook('template.xlsx', data_only=False)
value = ws['B5'].value  # Returns "=SUM(B1:B4)" as string

# RIGHT: Extract formula logic, implement in Python
def calculate_sum(ws, row_start, row_end):
    return sum(ws[f'B{i}'].value for i in range(row_start, row_end + 1))

# OR: Use pycel for evaluation
from pycel import ExcelCompiler
excel = ExcelCompiler(filename='template.xlsx')
```

---

### Pitfall 3: Salesforce Token Expires During Session

**Symptom:** User works fine, then "Unauthorized" error 2 hours later.

**Root Cause:** OAuth tokens have 2-hour TTL; refresh token not rotated.

**Fix:**
```typescript
class SalesforceClient {
  private async refreshTokenIfNeeded() {
    const expiresAt = localStorage.getItem('sf_token_expires_at');
    
    if (Date.now() > parseInt(expiresAt || '0')) {
      const newToken = await this.requestNewToken();
      localStorage.setItem('sf_access_token', newToken);
      localStorage.setItem('sf_token_expires_at', Date.now() + 7200000);
    }
  }
}
```

---

### Pitfall 4: Chat Response Hangs on Large Projects

**Symptom:** AI takes 30+ seconds to respond for complex configurations.

**Root Cause:** State machine checking all 20 fields sequentially.

**Fix:**
```typescript
// Optimize state machine lookups
// Use Set instead of array for O(1) lookup
const completedFields = new Set(state.completedSteps);
const nextMissing = WIZARD_QUESTIONS.find(q => !completedFields.has(q.id));
```

---

### Pitfall 5: File Download Headers Cause Issues in Safari

**Symptom:** File downloads work in Chrome, but Safari shows corrupted display.

**Root Cause:** Content-Disposition header needs special handling for Safari.

**Fix:**
```typescript
// Use different headers for different browsers
const userAgent = request.headers.get('user-agent') || '';
const isSafari = userAgent.includes('Safari');

const disposition = isSafari
  ? 'inline; filename*=UTF-8\'\'proposal.pdf'  // Safari needs UTF-8 encoding
  : 'attachment; filename="proposal.pdf"';     // Standard for others
```

---

## COST ESTIMATION TABLE

| Feature | Effort | Cost (@ $150/hr) | ROI |
|---------|--------|-----------------|-----|
| UI Preview Pane | 8 hrs | $1,200 | High (client sees value immediately) |
| Calculation Middleware | 12 hrs | $1,800 | High (solves formula issues) |
| PDF Templates | 10 hrs | $1,500 | Medium (nice-to-have branding) |
| CSV/JSON Export | 4 hrs | $600 | Low (data dump only) |
| Salesforce Integration | 24 hrs | $3,600 | High (closes deals in CRM) |
| **Total** | **58 hrs** | **$8,700** | **High** |

**Timeline:** 2-3 person-weeks  
**Recommended Phasing:** Start with UI + Middleware, add Salesforce when org is ready

---

## SUCCESS METRICS

### For the Client:

```
✓ Proposal generation time: < 3 minutes (chat mode)
✓ PDF accuracy: 100% match with Excel calculations
✓ Export formats: 4+ (PDF, Excel, CSV, JSON)
✓ Salesforce sync: < 5 second latency
✓ User adoption: > 80% of sales team using daily
```

### For Your Team:

```
✓ Code maintainability: All formulas version-controlled
✓ Test coverage: > 80% for calculation layer
✓ Performance: PDF generation < 10 seconds
✓ Uptime: > 99.5% availability
✓ Documentation: Every customization documented
```

---

## QUICK START: 30-MINUTE SETUP

For basic evaluation without heavy customization:

1. **Add DocumentPreviewPane** (10 min)
   ```bash
   cp CPQ_IMPLEMENTATION_TEMPLATES.md#section-1 anc-cpq/src/components/
   ```

2. **Update page.tsx layout** (5 min)
   ```tsx
   <main className="flex h-screen">
     <LeftPanel w-[35%] />
     <DocumentPreviewPane w-[25%] /> {/* NEW */}
     <RightPanel flex-1 />
   </main>
   ```

3. **Add CSV endpoint** (10 min)
   ```bash
   cp CPQ_IMPLEMENTATION_TEMPLATES.md#section-4 anc-cpq/src/app/api/
   ```

4. **Test end-to-end** (5 min)
   ```bash
   npm run dev
   # Test: Chat → Preview → Download CSV
   ```

**Result:** Working CPQ with 3-panel UI + CSV export in 30 minutes.

---

## CONTACT & ESCALATION

**For Issues During Implementation:**

| Issue | Owner | Time |
|-------|-------|------|
| Puppeteer crashes | Frontend lead | +2 hours |
| Formula logic mismatch | Data engineer | +4 hours |
| Salesforce auth fails | CRM specialist | +3 hours |
| Performance degradation | DevOps | +2 hours |
| Database schema changes | Database admin | +1 hour |

**Escalation Path:**
1. Check this document's "Common Pitfalls" section
2. Search git history for similar issues
3. Test in staging before production
4. Reach out to client's tech lead for clarification
5. Document solution for future reference

---

**Last Updated:** 2026-01-15  
**Maintained By:** [Your Team]  
**Next Review:** 2026-02-15
