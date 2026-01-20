"""Attach an existing master sheet (samples/master_excel_realistic_dummy.xlsx) to the ANC Demo org and run validation."""
from pathlib import Path
import os, sys, shutil, datetime
os.environ.setdefault('DATABASE_URL', 'sqlite:///./local_dev.db')
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.database import SessionLocal, init_db, Organization
from src.master_sheet import load_master_excel, validate_master_data

init_db()
db = SessionLocal()
org = db.query(Organization).filter(Organization.name == 'ANC Demo').first()
if not org:
    print('ANC Demo org not found. Run scripts/create_demo_org.py first.')
    sys.exit(1)

src = Path('samples/master_excel_realistic_dummy.xlsx')
if not src.exists():
    print('Source master sheet not found at', src)
    sys.exit(1)

uploads_dir = Path('uploads')
uploads_dir.mkdir(exist_ok=True)
ts = datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')
dest = uploads_dir / f'master_uploaded_{org.id}_{ts}.xlsx'
shutil.copy(src, dest)
org.master_sheet_path = str(dest)
db.commit()
print(f'Attached master sheet to org: {dest}')

# Validate
sheets = load_master_excel(dest)
report = validate_master_data(sheets)
print('Validation report:')
import json
print(json.dumps(report, indent=2))

# Update demo credentials doc
cred_path = Path('docs/DEMO_CREDENTIALS.md')
if cred_path.exists():
    text = cred_path.read_text()
    if 'Master Sheet Path' in text:
        # replace existing path
        lines = text.splitlines()
        new_lines = []
        for ln in lines:
            if ln.startswith('- Master Sheet Path:'):
                new_lines.append(f'- Master Sheet Path: {org.master_sheet_path}')
            else:
                new_lines.append(ln)
        cred_path.write_text('\n'.join(new_lines))
        print('Updated docs/DEMO_CREDENTIALS.md')
else:
    cred_path.parent.mkdir(parents=True, exist_ok=True)
    cred_path.write_text(f"# Demo Credentials\n\n- Org: {org.name} (id: {org.id})\n- Master Sheet Path: {org.master_sheet_path}\n")
    print('Wrote docs/DEMO_CREDENTIALS.md')

print('Done')
