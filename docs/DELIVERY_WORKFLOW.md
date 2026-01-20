# ANC Enterprise Estimator — Delivery Workflow (A → Z)

**Purpose:** Simple, client-friendly overview of how the ANC Enterprise Estimator is delivered and how it will work day-to-day once live. Use this to explain the process to Natalia or any stakeholder.

---

## 🚀 Executive Summary
- Goal: Convert a client brief (email / Salesforce / uploaded Excel) into a polished **client PDF** + an **internal audit Excel** using trusted estimator math.  
- Output: Client-facing PDF (branded) + Internal Excel with visible formulas + project saved in org workspace.  
- Timeline (pilot): 2–3 weeks for Phase 1 (foundation + math engine + basic UI).

---

## 🧩 Roles & Access
- **Admin (Org Owner)**: Invite members, set brand, manage Salesforce keys, control access.  
- **Estimator**: Answers math/installation questions, validates Excel, approves proposals.  
- **Proposal Team**: Reviews & polishes PDFs for client delivery.  
- **Client / Guest**: Receives share link (expiring) or email of final PDF.

---

## 🔔 Trigger Options (How a Proposal Starts)
- Manual: Estimator creates new project and runs the intake wizard.  
- Upload: Estimator uploads a Master Excel or CSV and selects a template.  
- Salesforce: (Optional / later) Opportunity triggers proposal creation via Salesforce webhook.

---

## Step-by-step Delivery Flow (A → Z)
1. **Create Organization & Invite Team** ✅
   - Admin creates org and invites estimators / proposal people. Invites are email tokens.  

2. **Create Project / Start Intake** 🧾
   - Estimator starts a new project, enters client basic info (name, site), or selects Salesforce opportunity (if connected).  

3. **Wizard: Guided Q&A** 💬
   - The system asks a short set of required questions per screen: indoor/outdoor, pixel pitch, width, height, access, mounting, timeline, labor type, etc.  
   - Support for multi-screen projects (add/edit/remove screens).  

4. **Product Matching & Defaults** 🛠️
   - System picks catalog product options using the answers and applies base rates per pixel pitch / environment.  

5. **Math Interceptor (Calculation Engine)** 🧮
   - Apply formula logic (hardware → structural → labor → expenses → contingency → bond → margins).  
   - Edge-case modifiers applied: union, new steel, curved, rigging, rush/ASAP surcharges.  

6. **Validation & Estimator Review** ✅
   - Estimator reviews the internal breakdown (line items + formulas visible). If needed, manual overrides may be used (e.g., `unit_cost`).  

7. **Generate Outputs** 📄
   - **Client PDF**: Pretty, branded, with per-screen summaries + scope + signature block.  
   - **Internal Excel**: Multi-tab workbook with visible formulas for audit & sign-off.  

8. **Share & Approve** 🔗
   - Generate time-limited share link or email PDF to client. Internal approvers sign-off in-app or via the audit Excel.  

9. **Archive & Analytics** 📊
   - Store closed proposal in org archive for comparison, reports, and historical analytics (conversion rates, margins, etc.).

10. **Optional: Push to Salesforce** 🔁
   - (Post-launch) Push final proposal to Opportunity, log activity, or attach outputs.

---

## ✅ Acceptance Criteria (What 'Done' Looks Like)
- Proposal generates a branded PDF identical in structure to the sample approved template.  
- Internal Excel matches estimator math line-by-line for the test scenarios.  
- Estimator can override/approve the final numbers prior to client delivery.  
- Role-based access: only org members see org projects; invited guests can accept with tokens.  
- Upload/validate Master Excel: import returns a validation report (no major mismatches for baseline cases).

---

## 🔒 Security & Compliance Notes
- Org separation prevents cross-client data visibility.  
- Invite tokens and API keys are issued per user and can be rotated.  
- Shared links are time-limited and can be revoked.

---

## 🛠️ Developer & Operational Notes (Short)
- API endpoints: `/api/generate`, `/api/download-pdf`, `/api/download-excel`, `/api/orgs/*`, `/api/invite/*`, `/api/upload-master` (planned).  
- CI runs validation pipeline (`scripts/run_integration_test.py`) to ensure a Master Excel can be ingested.  
- DB design: Projects scoped to `organizations`, memberships control access.

---

## 📅 Recommended Timeline (Phases)
- Week 1: Foundation (org & invites, placeholder master Excel, basic wizard)  
- Week 2: Math engine finish + internal Excel generation + API `/generate`  
- Week 3: PDF skin + UAT + iterate based on estimator feedback  

---

## ✅ Project Checklist (track progress)
- [ ] **NDA signed** (Legal)
- [x] **Placeholder Master Excel** generated (`scripts/generate_dummy_master_excel.py`)
- [ ] **Real Master Excel** received from client / uploaded via `/api/upload-master`
- [ ] **Brand assets** uploaded to `assets/branding/` (logo.svg, colors.json)
- [x] **Organization created** and Natalia invited (Org Admin) (demo org seeded)
- [ ] **Logic Workshop** (2–3 hrs with Estimators & PM)


### Demo
- Demo org seeded and demo user created: See `docs/DEMO_CREDENTIALS.md` for credentials and seed project ID.
- [ ] **Calculator unit tests** covering each cost category (hardware, structural, labor, etc.)
- [ ] **Upload endpoint + validation** (`/api/upload-master`) — implemented ✅
- [ ] **Intake wizard** (frontend) complete and connected to `/api/generate`
- [ ] **Client PDF templates** implemented and tested (Puppeteer / ReportLab)
- [ ] **Internal Excel** generation verified (OpenPyXL), formulas visible
- [ ] **Share link & email proposal** flow (send PDF to client)
- [ ] **Optional: Salesforce Integration** (OAuth + push quote)

---

## 📌 Quick Checklist to Show Client
- NDA signed ✅  
- Master Excel delivered (or live workshop scheduled) ⏳  
- Branding assets delivered (logo & colors) ⏳  
- Live demo scheduled (after Phase 1) ✅/TBD  

---

## 🤝 Handover (What we’ll deliver at launch)
- Fully functioning intake wizard and preview pane.  
- Client PDF + Internal Audit Excel generator.  
- Organization & membership management + invite/accept flow.  
- Validator & upload flow for Master Excel.  

**Next: Schedule a 2–3 hour logic workshop and provide Master Excel + branding assets so we can finish Phase 1.**

---

*File created for client-facing use and internal clarity. Keep this as the single source of truth when presenting the project flow.*
