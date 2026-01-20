import subprocess
import sys
from pathlib import Path
# Ensure project root is on PYTHONPATH for imports during tests
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


def test_generate_and_load(tmp_path):
    # Create sample
    res = subprocess.run([sys.executable, 'scripts/generate_dummy_master_excel.py'], check=True)
    p = Path('samples/master_excel_dummy.xlsx')
    assert p.exists()

    # Import and load
    from src.master_sheet import load_master_excel
    data = load_master_excel(p)
    assert 'Hardware' in data
    assert len(data['Hardware']) >= 1

    # Run the validator
    res = subprocess.run([sys.executable, 'scripts/validate_master_excel.py', str(p)])
    assert res.returncode == 0
