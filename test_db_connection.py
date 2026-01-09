import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print(f"Checking connection to: {DATABASE_URL}")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))
        version = result.fetchone()[0]
        print(f"✅ Success! Connected to database.")
        print(f"Database version: {version}")
        
        # Check if tables exist
        result = connection.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"))
        tables = [row[0] for row in result.fetchall()]
        print(f"Tables found: {tables}")
        
except Exception as e:
    print(f"❌ Connection Failed!")
    print(f"Error: {e}")
