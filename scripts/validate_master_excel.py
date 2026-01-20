"""Validate a Master Excel file against the local calculator logic for basic checks.
Usage: python scripts/validate_master_excel.py [path/to/master.xlsx]
"""
import sys
from pathlib import Path
# Ensure project root is on PYTHONPATH so `src` package is importable when running scripts directly
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.master_sheet import load_master_excel


def validate(path: Path):
    data = load_master_excel(path)
    mismatches = []

    hardware = data.get("Hardware", [])
    structural = {r['screen_id']: r for r in data.get('Structural', [])}

    for row in hardware:
        sid = row['screen_id']
        sqft = row['sqft']
        base = row['base_rate']
        expected_hw = sqft * base
        if abs(expected_hw - row['hardware_cost']) > 0.01:
            mismatches.append((sid, 'hardware_cost', expected_hw, row['hardware_cost']))
        s = structural.get(sid)
        if s:
            expected_struct = expected_hw * s['structural_pct']
            if abs(expected_struct - s['structural_cost']) > 0.01:
                mismatches.append((sid, 'structural_cost', expected_struct, s['structural_cost']))

    if mismatches:
        print("Validation failed with mismatches:")
        for m in mismatches:
            print(m)
        return 1
    print("Validation passed — no mismatches found.")
    return 0


if __name__ == '__main__':
    p = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('samples/master_excel_dummy.xlsx')
    if not p.exists():
        print(f"File not found: {p}")
        sys.exit(2)
    code = validate(p)
    sys.exit(code)
