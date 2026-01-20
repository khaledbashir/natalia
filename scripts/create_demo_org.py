"""Create a demo organization, demo user (Natalia), attach placeholder master Excel, and seed a demo project.
Run: python scripts/create_demo_org.py
"""
from pathlib import Path
import sys
import os
# Force local sqlite DB for demo provisioning to avoid external DB dependencies in dev
os.environ.setdefault('DATABASE_URL', 'sqlite:///./local_dev.db')
# Ensure project root is on PYTHONPATH for script execution
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.database import SessionLocal, init_db, Organization, User, Membership, Project
from src.master_sheet import load_master_excel, validate_master_data
import shutil
import datetime
import secrets


def main():
    init_db()
    db = SessionLocal()

    # 1) Create org
    org_name = 'ANC Demo'
    org = db.query(Organization).filter(Organization.name == org_name).first()
    if not org:
        org = Organization(name=org_name)
        db.add(org)
        db.commit()
        db.refresh(org)
        print(f"Created org: {org.name} (id={org.id})")
    else:
        print(f"Org already exists: {org.name} (id={org.id})")

    # 2) Create demo user (Natalia) and membership
    email = 'natalia@anc-demo.test'
    user = db.query(User).filter(User.email == email).first()
    if not user:
        api_key = secrets.token_urlsafe(24)
        user = User(email=email, full_name='Natalia Kovaleva', api_key=api_key)
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created user: {user.email}")
    else:
        print(f"User exists: {user.email}")

    membership = db.query(Membership).filter(Membership.user_id == user.id, Membership.organization_id == org.id).first()
    if not membership:
        membership = Membership(user_id=user.id, organization_id=org.id, role='admin')
        db.add(membership)
        db.commit()
        print(f"Added membership: {user.email} -> {org.name} (admin)")
    else:
        print(f"Membership exists: {user.email} -> {org.name}")

    # 3) Attach placeholder master excel
    samples = Path('samples/master_excel_dummy.xlsx')
    uploads_dir = Path('uploads')
    uploads_dir.mkdir(exist_ok=True)
    ts = datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')
    dest = uploads_dir / f'master_uploaded_{org.id}_{ts}.xlsx'
    shutil.copy(samples, dest)
    org.master_sheet_path = str(dest)
    db.commit()
    print(f"Attached master sheet to org: {dest}")

    # 4) Validate uploaded master sheet
    data = load_master_excel(dest)
    report = validate_master_data(data)
    print("Validation report:", report)

    # 5) Seed a demo project
    demo_proj = Project(client_name='Demo Client - ANC', state={'demo': True, 'screens': []}, organization_id=org.id)
    db.add(demo_proj)
    db.commit()
    db.refresh(demo_proj)
    print(f"Seeded demo project: id={demo_proj.id}")

    # 6) Dump demo credentials
    cred_path = Path('docs/DEMO_CREDENTIALS.md')
    cred_path.parent.mkdir(parents=True, exist_ok=True)
    cred_path.write_text(f"# Demo Credentials\n\n- Org: {org.name} (id: {org.id})\n- Natalia Admin Email: {user.email}\n- API Key: {user.api_key}\n- Seed Project ID: {demo_proj.id}\n- Master Sheet Path: {org.master_sheet_path}\n")
    print("Wrote docs/DEMO_CREDENTIALS.md")

    db.close()


if __name__ == '__main__':
    main()
