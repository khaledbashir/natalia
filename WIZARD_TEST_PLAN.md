# ANC CPQ Wizard - Comprehensive Test Plan

## What We Built

This is a conversational AI wizard for ANC (a LED display company) that guides sales engineers through creating project proposals. Instead of a boring form, users chat with an "ANC Engineer" AI that:

1. **Asks questions conversationally** - "What venue needs a display?" vs "Enter client name:"
2. **Auto-fills data** - Type "Madison Square Garden" and it automatically finds the address
3. **Extracts from documents** - Upload a PDF brief and it pulls out specs
4. **Tracks progress** - Shows 21 fields across 4 categories (Client, Display, Details, Logistics)
5. **Handles edge cases** - Validates inputs, corrects AI hallucinations, maintains state

### Recent Bug Fixes (What to Verify)

| Fix | What It Does |
|-----|--------------|
| **Progress calculation** | 0 values are now valid (e.g., width=0 means "not set" not "error") |
| **Field validation** | AI can't invent fake fields like "resolution" or "brightness" anymore |
| **Step inference** | Unified logic prevents AI from jumping to wrong questions |
| **Type coercion** | AI sending "10" for width now converts to number 10 automatically |

---

## Test Scenarios - Run These in Order

### Scenario 1: Happy Path (Basic Flow)

**Expected behavior:** Clean, linear progression through all questions

```
1. Click "Start New Quote"
2. Type: "Madison Square Garden"
   ✅ Should auto-search and find address
   ✅ Select the suggested address
3. Type: "Ribbon board"
   ✅ Should set productClass to "Ribbon"
4. Type: "40 feet wide by 10 feet high"
   ✅ Should extract both numbers and move on
5. Type: "10mm"
   ✅ Should set pixel pitch
6. Continue through all questions clicking options or typing answers
```

**What to watch for:**
- Progress bar increments smoothly (4-5% per question)
- No repeating questions
- Next step always matches what AI is asking

---

### Scenario 2: Zero Value Test

**Expected behavior:** Accept 0 as valid input for numeric fields

```
1. Start fresh or click "New Proposal" (+ button)
2. Proceed to width question
3. Type: "0"
```

**What to watch for:**
- ❌ If it says "please enter a number" or rejects it → **BUG**
- ✅ Should accept 0 and move to next question
- ✅ Progress bar should NOT say 0 fields complete when you have answers

---

### Scenario 3: AI Hallucination Test

**Expected behavior:** Reject made-up fields

```
1. At any point, type something irrelevant like:
   "I want it to be 5000 nits brightness with HDR support"
   OR
   "The resolution should be 4K with 120Hz refresh rate"
```

**What to watch for:**
- Console (F12) should show warning: `AI attempted to set unknown field 'brightness', rejecting`
- ✅ AI should ignore the nonsense and ask the next valid question
- ❌ If wizard gets stuck or asks about "brightness" → **BUG**

---

### Scenario 4: Multi-Value Extraction

**Expected behavior:** Parse multiple values from one message

```
1. At product class question, type:
   "I need a 10mm ribbon board, 40ft wide, indoor use"
```

**What to watch for:**
- ✅ Should extract: productClass=Ribbon, pixelPitch=10, widthFt=40, environment=Indoor
- ✅ Should skip to the next unanswered question (not ask about those 4 again)
- Progress bar should jump 4 steps at once

---

### Scenario 5: Address Auto-Search

**Expected behavior:** Find venue addresses automatically

```
1. Type: "Staples Center" (or any famous venue)
```

**What to watch for:**
- ✅ Should show "Searching Address..." spinner
- ✅ Should display address suggestions with venue name
- ✅ Clicking a suggestion should fill both clientName AND address
- ❌ If it searches repeatedly for same venue → **BUG**

---

### Scenario 6: Document Upload

**Expected behavior:** Extract specs from uploaded files

```
1. Click the upload icon (📎)
2. Upload any .txt, .md, or PDF file with project details
```

**What to watch for:**
- ✅ Should show "Analyzing Brief..." then extracted data
- ✅ Should jump to appropriate next question
- ❌ If error "trouble reading that file" for valid text/PDF → **BUG**

---

### Scenario 7: Edit/Change Mode

**Expected behavior:** Modify previous answers

```
1. Complete several questions
2. Type: "Actually, change the width to 60 feet"
   OR
   "Update: make it outdoor instead of indoor"
```

**What to watch for:**
- ✅ Should update the field and continue
- ✅ Progress bar should stay correct
- ❌ If it asks the same question again immediately → **BUG**

---

### Scenario 8: Confirmation State

**Expected behavior:** Final review before PDF generation

```
1. Complete all required fields
2. Should reach "confirm" step with summary
```

**What to watch for:**
- ✅ Should show configuration summary with dimensions, pitch, etc.
- ✅ Should show "CONFIRM & GENERATE PDF" button
- ✅ Progress bar should show 100%
- ❌ If it keeps asking more questions → **BUG**

---

## Edge Cases to Try

| Input | Expected Result |
|-------|-----------------|
| "skip" or "I don't know" | Should ask again or provide options |
| Gibberish: "asdf jkl;" | Should clarify or provide options |
| Numbers only: "6" | Should infer context from current question |
| Very long message (500+ chars) | Should process without hanging |
| Rapid-fire messages | Should queue and process in order |

---

## What to Report Back

### Critical Bugs (Stop Everything)
- Wizard completely stuck/infinite loop
- Progress bar at 100% but still asking questions
- Data not saving between questions
- Console errors (red text in F12 dev tools)

### Medium Issues
- AI asks same question multiple times
- Step doesn't match what AI is saying
- Auto-search triggers repeatedly
- Wrong options shown for current question

### Minor Issues
- Typos in AI messages
- UI formatting glitches
- Spacing/visual weirdness
- Confusing confirmation messages

### UX/Confusion
- Questions that don't make sense
- Missing options you'd expect
- Unclear what to do next
- AI seems "dumb" or misses obvious context

---

## Console Logs to Check

Open browser DevTools (F12) → Console tab and watch for:

**Normal logs:**
```
Step Correction: AI said 'X' but message implies 'Y'
Price recalculation triggered by field changes
```

**Warning signs:**
```
AI attempted to set unknown field 'XXX'
Field 'nextStep' is not valid
JSON Parse Error
Hallucination fallback triggered
```

---

## After Testing, Report:

1. **Which scenarios passed/failed**
2. **Any unexpected behavior** (even if you're not sure it's a bug)
3. **Console errors** (copy-paste anything red in F12)
4. **What AI model you used** (dropdown in top-right)
5. **Did the wizard complete successfully?** (reached confirm step)

---

## Pro Tips

- **Refresh the page** between test scenarios for clean state
- **Click the "+" button** (top-right) to start fresh proposal
- **Watch the thinking bubble** (click "Show Expert Reasoning" to see AI logic)
- **Check progress bar** - it's the quickest way to spot if something broke
- **Type fast** - try to break it with rapid inputs

**Time budget:** 10-15 minutes for full test suite

Let me know what breaks 🔥
