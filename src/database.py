import os
import datetime
import json
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
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
