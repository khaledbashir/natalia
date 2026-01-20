"""Run the simple integration test for master-excel pipeline without requiring pytest.
"""
import subprocess
import sys
from pathlib import Path

# 1. Generate sample
subprocess.run([sys.executable, 'scripts/generate_dummy_master_excel.py'], check=True)

p = Path('samples/master_excel_dummy.xlsx')
if not p.exists():
    print('Sample file missing')
    sys.exit(2)

# 2. Validate
res = subprocess.run([sys.executable, 'scripts/validate_master_excel.py', str(p)])
if res.returncode != 0:
    print('Validation failed')
    sys.exit(res.returncode)

print('Integration test passed.')
