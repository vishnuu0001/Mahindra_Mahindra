"""
Vercel Serverless Entry Point for FastAPI Backend
This file adapts the FastAPI application to work with Vercel's serverless functions.
"""
import sys
import os
from pathlib import Path

# Set the VERCEL environment variable
os.environ['VERCEL'] = '1'

# Add the backend directory to the path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Import the FastAPI app
try:
    from main import app
    print("✅ FastAPI app imported successfully")
except Exception as e:
    print(f"❌ Error importing FastAPI app: {e}")
    raise

# Initialize database tables (but don't fail if seed data errors)
try:
    from database import Base, engine
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")
except Exception as e:
    print(f"⚠️ Database initialization warning: {e}")

# The app is now available for Vercel to call
