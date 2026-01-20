# ANC Enterprise Estimator Platform - Master Checklist ✅

**Contract Date:** January 16, 2026  
**Last Updated:** January 20, 2026  
**Status:** 🔄 **In Progress**

---

## 📋 Project Overview
Transform the existing Natalia prototype into the production-ready **ANC Enterprise Estimator Platform** — a CPQ engine that produces:

- **Client-Facing PDF:** Polished, ANC-branded budget proposal
- **Internal Audit Excel:** Detailed breakdowns and visible formulas for estimator validation

> NOTE: We currently do NOT have the **Master Excel** nor **brand assets**. All deliverables will be scaffolded using dummy data and placeholder branding so the app is ready for a quick swap once real assets arrive.

---

## 🚀 Phase 1 — Foundation & Setup (Week 1)
Goal: Environment ready, logic workshop complete

### 1.1 Pre-Development Checklist
- [ ] **Signed NDA** received from Natalia (owner: Legal)
- [ ] **Master Excel** (unredacted, full formulas) received (owner: Estimator)
- [ ] **Brand Assets** (Hi-res SVG/PNG, color swatches, fonts) received (owner: Design)
- [ ] Add team to ANC Slack workspace (`ahmadbasheerr@gmail.com`) (owner: PM)

### 1.2 Server Infrastructure
- [ ] VPS provisioned on **DigitalOcean / Easypanel** (owner: DevOps)
- [ ] Docker + deployment pipeline configured (owner: DevOps)
- [ ] PostgreSQL DB connected & migrations ready (owner: Backend)
- [ ] Daily automated backups enabled (owner: DevOps)
- [ ] SSL/HTTPS configured (owner: DevOps)
- [ ] Security, monitoring, and alerting (Sentry / Prometheus) (owner: DevOps)

### 1.3 Logic Workshop (2–3 hrs with Estimators)
- [ ] Walk through all Excel formulas with Natalia's team (capture formulas line-by-line)
- [ ] Document the ~18 calculation categories and conditional rules
- [ ] Confirm structure: materials % (20%), labor % (15%), contingency rules
- [ ] Record PM & General Conditions formulas

---

## 🧮 Phase 2 — "Math Interceptor" Logic Engine (Week 1–2)
Goal: Complete formula engine matching Master Excel

### 2.1 Core Calculator Module (`src/calculator.py`)
- [ ] Implement base structure (16 categories)
- [ ] Hardware cost: PixelPitch × SqFt
- [ ] Structural Materials = Hardware × 20%
- [ ] Structural Labor = (HW + Materials) × 15%
- [ ] LED Installation Labor, Electrical, CMS, PM, Permits, Commissioning
- [ ] Validate ALL formulas against Master Excel (CRITICAL — automated comparisons)

### 2.2 Modifiers & Edge Cases
- [ ] Outdoor vs Indoor multipliers
- [ ] New Steel (+15%) vs Existing Steel
- [ ] Union (+15%)/Prevailing (+10%) labor
- [ ] Curved screen (+5%), Rigging mount (+10%)
- [ ] Timeline surcharges (Rush +20%, ASAP +50%)
- [ ] Ribbon Board surcharge (+20%), Bond logic, Contingency rules

### 2.3 Margin & Final Pricing
- [ ] Default 30% margin calculation
- [ ] Sell Price = Cost / (1 - Margin)
- [ ] Configurable margin per line item
- [ ] Lock margin visibility on client outputs (only visible in internal Excel)

---

## 📄 Phase 3 — Dual Output Generation (Week 2)
Goal: PDF template coded, Excel template finalized

### 3.1 Client-Facing PDF ("Pretty")
- [ ] Basic PDF generation via `src/pdf_generator.py` using ReportLab (owner: Backend)
- [ ] Apply ANC branding (Logo, Colors, Fonts) — placeholder until real assets arrive
- [ ] Match approved template layout (header, client info, per-screen tables, totals)
- [ ] Add Scope of Work / Terms / Signature block
- [ ] Endpoint: `POST /api/download-pdf`

### 3.2 Internal Audit Excel ("Ugly")
- [ ] Multi-tab Excel via `src/excel_generator.py` (OpenPyXL)
- [ ] Tabs: Executive Summary, LED Hardware, Structural, Labor, Electrical, Installation, Professional Services, Per-Screen Details
- [ ] Ensure formulas are visible and match Master Excel
- [ ] Endpoint: `POST /api/download-excel`

---

## 💬 Phase 4 — Conversational Interface (Week 2–3)
Goal: AI-driven intake wizard fully functional

### 4.1 System Prompt & AI Logic
- [ ] System prompt tuned for CPQ Expert (21 required fields)
- [ ] AI interview flow: sequential Qs, multi-value handling, product class detection

### 4.2 Frontend Wizard (Next.js)
- [ ] Conversational chat interface with multi-screen management (`anc-cpq` app)
- [ ] Real-time preview panel (Add/Edit/Remove screens)
- [ ] Address autocomplete & mobile responsiveness
- [ ] Buttons: PDF download, Excel download, Share link

### 4.3 API Integration
- [ ] `/api/generate` — Calculate proposal (returns structured JSON + breakdown)
- [ ] `/api/download-excel` — internal spreadsheet
- [ ] `/api/download-pdf` — client PDF
- [ ] `/api/projects` — Save/Load projects
- [ ] `/api/share` — Generate shareable links
- [ ] Add rate limiting + input validation/sanitization

---

## 🔗 Phase 5 — Optional Integrations (Post-Launch)
Items for Launch Accelerator ($800) or future retainer

- [ ] Salesforce integration: OAuth, push quote to Opportunity, activity logging
- [ ] Email proposal directly to client
- [ ] Multi-currency support
- [ ] Historical proposal archive & comparison tool
- [ ] Approval workflow & internal sign-off

---

## ✅ Phase 6 — Testing & UAT (Week 3–4)
Goal: System validated and ready for production

### 6.1 Backend Testing
- [ ] Unit tests for calculator functions (`tests/test_calculator.py`)
- [ ] Integration tests for endpoints
- [ ] Load testing for concurrency
- [ ] Edge case validation (zeros, max values)

### 6.2 User Acceptance Testing
- [ ] Walkthrough with Natalia/Estimator team
- [ ] Run 3–5 real scenarios and reconcile with historical Excel
- [ ] Collect UAT feedback & iterate
- [ ] Final sign-off from ANC

### 6.3 Documentation
- [ ] User Guide (how to create proposals)
- [ ] Admin Guide (how to update formulas & templates)
- [ ] API docs (endpoints + examples)
- [ ] Troubleshooting FAQ

---

## 🚢 Phase 7 — Deployment & Handoff (Week 4)
Goal: Live in production; project milestone complete

### 7.1 Production Deployment
- [ ] Code review & CI passing
- [ ] Deploy to Easypanel production (owner: DevOps)
- [ ] DNS + SSL verification
- [ ] Performance monitoring & alerts

### 7.2 Knowledge Transfer
- [ ] On-call training session with ANC team
- [ ] Record walkthrough video & share assets securely
- [ ] Share credentials securely (vault)

### 7.3 Project Closure
- [ ] Obtain UAT sign-off signature
- [ ] Release milestone payment
- [ ] Transition to $500/mo retainer (support)

---

## 📊 Current Status Summary
| Phase | Status | Completion |
|---|---:|---:|
| Phase 1: Foundation | 🔄 In Progress | 40% |
| Phase 2: Math Engine | ✅ Mostly Done | 85% |
| Phase 3: Outputs | 🔄 In Progress | 50% |
| Phase 4: Interface | 🔄 In Progress | 60% |
| Phase 5: Integrations | ⏳ Not Started | 0% |
| Phase 6: Testing | ⏳ Not Started | 0% |
| Phase 7: Deployment | ⏳ Not Started | 0% |

---

## ⚠️ Missing Assets / Placeholders
- **Master Excel**: not yet received — `samples/master_excel_dummy.xlsx` will be used as placeholder. (Generated via `scripts/generate_dummy_master_excel.py`)
- **Branding**: not yet received — placeholder logo at `assets/branding/placeholder_logo.svg` and `assets/branding/README.md` describe required assets.
- **Salesforce Credentials**: pending
- **Scripts added (placeholders & validation):**
  - `scripts/generate_dummy_master_excel.py` — creates placeholder workbook
  - `scripts/validate_master_excel.py` — simple validator comparing core buckets to expected values
  - `src/master_sheet.py` — loader converting workbook to structured JSON
  - `tests/test_master_sheet_integration.py` — integration test for the above pipeline

**Master Sheet Handling (Added)**
- `POST /api/upload-master` — file upload endpoint with validation and org attachment
- Admin UI: `/orgs/{orgId}/upload` — upload file and view validation report in the browser
- `docs/MASTER_SHEET_GUIDE.md` — instructions to replace and validate the Master Excel

> Tip: Run `python scripts/generate_dummy_master_excel.py` then `python scripts/validate_master_excel.py` to verify baseline parity. The validator is intentionally lightweight and will be extended to support full formula-by-formula validation once the real Master Excel is available.

---

## 🧭 Next Immediate Steps
1. **Receive Master Excel** from Natalia and validate formulas (owner: Estimator & Backend)  
2. **Schedule Logic Workshop** (2–3 hrs) to confirm edge cases and formula exceptions  
3. **Apply ANC branding** to `src/pdf_generator.py` & frontend templates using provided assets (owner: Design)
4. **Local validation (done)** — Generate the placeholder workbook and validate the pipeline: `python scripts/generate_dummy_master_excel.py && python scripts/validate_master_excel.py` (owner: Backend)

> Note: The placeholder generator and validator are in the repo — follow the `assets/branding/README.md` when placing real branding assets.

---

## 🤝 Handover
**Completed:**
- Core CPQ calculator engine implemented (16 categories) — `src/calculator.py` ✅
- Excel generator with multi-tab audit output — `src/excel_generator.py` ✅
- PDF generator with base layout — `src/pdf_generator.py` (placeholder branding) ✅
- Next.js frontend with conversational wizard scaffold — `anc-cpq` ✅
- FastAPI/Next.js endpoints scaffolded for generate/download/share ✅

**Next:**
- Receive Master Excel & Branding assets (critical)  
- Run formula-by-formula validation and fix any mismatches  
- Complete client-facing PDF template styling and test Puppeteer render  
- Schedule UAT and finalize deployment checklist

**Last modified by:** Ahmad Basheer
**Next check-in:** TBD (pending Slack invite)

---

*File created automatically to track progress and act as the single source of truth for the ANC Enterprise Estimator Platform.*
