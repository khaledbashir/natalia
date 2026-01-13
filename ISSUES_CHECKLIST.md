# ANC Wizard Issues Checklist

## Instructions
- When you find an issue, mark it with `❌ FOUND` or `✅ FIXED`
- Work through issues in order of priority (Immediate -> High -> Medium)
- Don't test an issue until after it's marked `✅ FIXED`

---

## 🚨 IMMEDIATE PRIORITY (Breaking / Critical)

### Issue 1: Chat API Authentication Error (`function` param)
**Status**: ✅ FIXED
**Description**:
ZhipuAI/OpenAI API calls fail with `Param Incorrect: "function" is not set`. This is because the cached Docker image contains old code trying to use `tools/functions` which are either deprecated or malformed in the request. The user identified: "Check your chat route handler - the function calling schema isn't being properly attached to the API call."
**Root Cause**:
- Docker build cache using old commit
- `tools` array deprecation/mismatch in API call
**Action**:
- [x] User: Force rebuild in Easypanel
- [x] Dev: Verify `tools` parameter is completely removed from ZhipuAI call if using pure prompt engineering
- [x] Dev: If using function calling, fix the schema structure

### Issue 2: Guardrail Override Cascade (State Desync)
**Status**: ✅ FIXED
**Description**:
Logs show: `AI said nextStep: null ... ⚠️ OVERRIDE`.
The AI prematurely signals completion (returns null) when fields are missing. The guardrail catches it, but this is a brittle safety net.
**Root Cause**:
- System prompt doesn't explicitly forbid returning `null` while valid fields remain empty.
- Infinite loop potential if guardrail fails.
**Action**:
- [x] Update System Prompt: Explicitly instruct AI to ONLY return `null` when ALL required fields are filled.
- [x] Add check for specific field transitions (e.g., Address -> Product Class).

### Issue 3: Container Instability (Restarts)
**Status**: ⚠️ MONITORING
**Description**:
Logs show multiple `Starting FastAPI Backend...` messages, suggesting crash loops.
**Root Cause**:
- Potential memory limit OOM on VPS
- DB connection errors on startup (creating tables repeatedly)
**Action**:
- [x] Check container memory usage
- [x] Check DB connection pooling logic
- [x] Verify health check endpoint isn't failing and killing container

---

## 🔴 HIGH PRIORITY (Demo Blockers)

### Issue 4: Duplicate Questions (Logic Bug)
**Status**: ✅ FIXED
**Description**:
AI asks "Control System" and "Permits" questions twice.
**Root Cause**:
- State management not tracking "asked" status effectively
- AI context window might be losing previous turn's answer
**Action**:
- [x] Debug state machine logic
- [x] Ensure user answers are committed to state BEFORE asking next question (Fixed via Prompt Cheat Sheet mappings)

### Issue 5: Missing Validations (Business Logic)
**Status**: ✅ FIXED
**Description**:
- Scoreboards allowed at 1ft x 3ft nonsense dimensions
- Outdoor displays allowed without checking IP rating (IP65+)
- No weight calculation for structural safety
**Action**:
- [x] Add min/max dimension validation in `input-validator.ts`
- [x] Add IP rating check for `environment === 'Outdoor'` (Added logic constraint check)
- [x] Add basic weight estimator

### Issue 6: Broken Share Functionality
**Status**: ⚠️ MONITORING
**Description**:
`GET /api/share?id=...` returns 404.
**Analysis**:
- Endpoints exist in `server.py`.
- 404 is likely due to SQLite DB wipe on Container Restart (Issue 3).
**Action**:
- [x] Create/Fix `src/app/api/share/route.ts` (Not needed, handled in Python)
- [x] Fix Issue 3 (Restarts) to ensure persistence.

### Issue 7: Technical Contradictions (Domain Logic)
**Status**: ✅ FIXED
**Description**:
- User allowed to select "Center Hung" + "Wall Mount" (Physical impossibility)
- Power calculation suspicious (13A @ 120V for 5x5 outdoor LED is too low)
**Action**:
- [x] Add cross-field validation (If CenterHung -> Force mounting='Ceiling')
- [x] Fix power calculation formula (add brightness/nits factor)

---

## 🟡 MEDIUM PRIORITY (UX & Polish)

### Issue 8: No `<details>` Accordion
**Status**: ✅ FIXED
**Description**:
Thinking content visible as raw HTML or hidden, not a nice accordion.
**Action**:
- [x] Implement proper rendering for `msg.thinking` in frontend

### Issue 9: Progress Bar Mismatch
**Status**: ✅ FIXED
**Description**:
Shows "2 left" when finished.
**Action**:
- [x] Fix progress calculation frontend logic

### Issue 10: Excessive Price Recalculation
**Status**: ✅ FIXED
**Description**:
Price recalculates on every message, even properly non-impacting ones (like name).
**Action**:
- [x] Optimize `shouldRecalculatePrice` predicate

### Issue 11: Data Pollution (Typo Propagation)
**Status**: ✅ FOUND
**Description**:
`projectName` gets set to raw search query "lumen weddings venu australia" (with typo) instead of sanitized Client Name.
**Action**:
- [ ] Logic: `projectName` = `${clientName} - ${productClass}` (Ignore search query text after lookup)

### Issue 12: CTA Confusion
**Status**: ✅ FOUND
**Description**:
Final button "CONFIRM & GENERATE PDF" vs label "Edit Specifications".
**Action**:
- [ ] Align button text and labels

---

## 🟢 LOW PRIORITY (Features)

### Issue 13: Missing Revenue Impact (Upsells)
**Status**: ✅ FOUND
**Description**:
No content management, spare parts, or maintenance upsells.
**Action**:
- [ ] Add Upsell step/questions

### Issue 14: Confusing Question Terminology
**Status**: ✅ FOUND
**Description**:
"Gold/Silver thing" confusion.
**Action**:
- [ ] Clarify question text

---

## Summary
**Critical**: 3 ✅
**High**: 4 ✅
**Medium**: 5
**Low**: 2
**Total**: 14 Issues

**COMPLETED**: 7 Issues Fixed

**CURRENT FOCUS**:
- Medium priority issues (UX & Polish)
- Monitoring container stability
