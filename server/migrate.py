#!/usr/bin/env python3
"""
Simple migration script for UmukoziHR Resume Tailor v1.2
Creates database tables if they don't exist.
"""
import os
import sys
from pathlib import Path

# Add the server directory to the path so we can import our modules
server_dir = Path(__file__).parent
sys.path.insert(0, str(server_dir))

from app.db.database import engine, Base
from app.db.models import User, Profile, Job, Run

def create_tables():
    """Create all database tables"""
    try:
        print("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
        
        # Test connection
        from app.db.database import SessionLocal
        db = SessionLocal()
        
        # Check if tables were created
        from sqlalchemy import text
        if "postgresql" in str(engine.url):
            # PostgreSQL
            result = db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
            tables = [row[0] for row in result.fetchall()]
        elif "sqlite" in str(engine.url):
            # SQLite
            result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
            tables = [row[0] for row in result.fetchall()]
        else:
            tables = []
        
        expected_tables = ['users', 'profiles', 'jobs', 'runs']
        created_tables = [table for table in expected_tables if table in tables]
        
        print(f"Created tables: {created_tables}")
        
        if len(created_tables) == len(expected_tables):
            print("All required tables created successfully!")
        else:
            missing = set(expected_tables) - set(created_tables)
            print(f"Missing tables: {missing}")
        
        db.close()
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        print("Make sure PostgreSQL is running and the DATABASE_URL is correct.")
        sys.exit(1)

def check_connection():
    """Check if we can connect to the database"""
    try:
        from app.db.database import SessionLocal
        db = SessionLocal()
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        db.close()
        print("Database connection successful!")
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        print("Please check your DATABASE_URL and ensure PostgreSQL is running.")
        return False

if __name__ == "__main__":
    print("UmukoziHR Resume Tailor v1.2 Migration")
    print("=====================================")
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    db_url = os.getenv("DATABASE_URL", "sqlite:///./umukozihr.db")
    print(f"Database URL: {db_url}")
    
    if check_connection():
        create_tables()
        print("\nMigration completed! You can now start the server.")
    else:
        print("\nTip: Make sure your database is running and your credentials are correct.")
        sys.exit(1)