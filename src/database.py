import os
import datetime
import json
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Boolean, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from typing import Optional
from dotenv import load_dotenv

# Try to load env vars if not already loaded
load_dotenv()
if not os.environ.get("DATABASE_URL"):
    # Try looking in parent directory as well (for start.sh context)
    load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env'))

# 1. Setup Database Connection
# Default to sqlite for local dev if DATABASE_URL is not set (e.g. during build)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./local_dev.db")

# Safety: If DATABASE_URL starts with postgres://, replace with postgresql://
# (psycopg2/SQLAlchemy 1.4+ requirement)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Debug: Log which database we're connecting to
print(f"Database URL: {DATABASE_URL[:50]}..." if len(DATABASE_URL) > 50 else f"Database URL: {DATABASE_URL}")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. Define Models

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    # Organization scoping
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True, index=True)

    # Metadata
    client_name = Column(String, index=True, nullable=True)
    project_name = Column(String, nullable=True)
    
    # State Snapshot (The full CPQInput JSON)
    state = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    messages = relationship("Message", back_populates="project", cascade="all, delete-orphan")
    shares = relationship("SharedProposal", back_populates="project", cascade="all, delete-orphan")
    organization = relationship("Organization")

class SharedProposal(Base):
    __tablename__ = "shared_proposals"

    id = Column(String, primary_key=True, index=True) # The unique shareId
    project_id = Column(Integer, ForeignKey("projects.id"))
    
    # Snapshot of context for this specific share
    input_data = Column(JSON)
    result_data = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime)

    # Relationships
    project = relationship("Project", back_populates="shares")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    
    role = Column(String) # 'user' or 'assistant' or 'system'
    content = Column(Text)
    thinking = Column(Text, nullable=True) # For GLM/Reasoning models
    
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="messages")

# Multi-tenant models
class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Optional path to the uploaded Master Excel for this organization
    master_sheet_path = Column(String, nullable=True)

    members = relationship("Membership", back_populates="organization", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    api_key = Column(String, unique=True, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    memberships = relationship("Membership", back_populates="user", cascade="all, delete-orphan")

class Membership(Base):
    __tablename__ = "memberships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    role = Column(String, nullable=False, default="member")  # admin | member
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="memberships")
    organization = relationship("Organization", back_populates="members")

class InviteToken(Base):
    __tablename__ = "invite_tokens"
    __table_args__ = (UniqueConstraint('token', name='uq_invite_token'),)

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, nullable=False, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    role = Column(String, nullable=False, default="member")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime)

    organization = relationship("Organization")

# 3. Create Tables
def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")

# Helper to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Invite & user helpers
import secrets
import string
from sqlalchemy.orm import Session

def generate_invite_token(length: int = 28) -> str:
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def create_invite(db: Session, email: str, organization_id: int, role: str = "member", ttl_days: int = 7) -> InviteToken:
    token = generate_invite_token()
    invites = db.query(InviteToken).filter(InviteToken.email == email, InviteToken.organization_id == organization_id).all()
    # expire existing invites for this email/org
    for inv in invites:
        db.delete(inv)
    import datetime
    expires = datetime.datetime.utcnow() + datetime.timedelta(days=ttl_days)
    invite = InviteToken(token=token, email=email, organization_id=organization_id, role=role, expires_at=expires)
    db.add(invite)
    db.commit()
    db.refresh(invite)
    return invite


def consume_invite(db: Session, token: str):
    import datetime
    invite = db.query(InviteToken).filter(InviteToken.token == token).first()
    if not invite:
        return None
    if invite.expires_at and invite.expires_at < datetime.datetime.utcnow():
        # expired
        db.delete(invite)
        db.commit()
        return None
    # return invite data (caller will create user and membership)
    return invite


def get_user_by_api_key(db: Session, api_key: str):
    return db.query(User).filter(User.api_key == api_key).first()
