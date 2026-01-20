# Master Sheet Guide — How to Replace & Validate the Master Excel

Goal: Make it trivial to swap the placeholder Master Excel with the real one and validate it automatically.

---

## 1) Quick: Generate the placeholder (already in repo)
- Run: python scripts/generate_dummy_master_excel.py
- This creates: `samples/master_excel_dummy.xlsx`
- Use it to test the UI, importer, and validation flows without sharing sensitive data.

## 2) Uploading the real Master Excel (recommended flow)
- Endpoint: `POST /api/upload-master`
  - Form fields:
    - `file` (binary upload, `.xlsx`)
    - `org_id` (optional, integer) — if provided the uploaded file will be attached to the organization record
- Response: JSON `{ status, path, report }` where `report` contains mismatches and summary metrics

Example using curl:

curl -F "file=@/path/to/MASTER.xlsx" -F "org_id=1" http://localhost:8000/api/upload-master

## 3) What the validator checks (baseline)
- The initial validator looks for these sheets: `Hardware`, `Structural`, `Labor` (names are case-sensitive)
- It validates simple numeric parity:
  - `hardware_cost` ~= `sqft * base_rate`
  - `structural_cost` ~= `hardware_cost * structural_pct`
  - `labor_cost` ~= `(hardware_cost + structural_cost) * labor_pct`
- Mismatches are reported with `screen_id`, `field`, `expected`, and `found` values

Note: The validator is intentionally lightweight to start; after we receive the real Master Excel, we'll extend it to do formula-by-formula verification per the exact layout.

## 4) UI: Upload via browser
- The admin UI available at: `/orgs/{orgId}/upload` (Next.js frontend) allows file selection and will show the validation report in the browser.

## 5) Replacing the Master Excel
- Simply upload the new file via the UI or the API endpoint; the report will show any mismatches.
- If `org_id` is provided, the Organization record's `master_sheet_path` will be updated to the uploaded file path.

## 6) Local validation & tests
- Run: python scripts/validate_master_excel.py samples/master_excel_dummy.xlsx
- Run integration: python scripts/run_integration_test.py

## 7) Next improvements (after we get real sheet)
- Add full formula-by-formula comparison using cell formulas (not just evaluated values)
- Report mapping from Master sheet columns → expected fields (configurable mapping UI)
- Automatic acceptance gating (only accept when mismatches < threshold)

---

If you want, I can add a small UI in the admin panel that shows the last uploaded Master sheet and a one-click "Replace with new file" flow — do you want that next?