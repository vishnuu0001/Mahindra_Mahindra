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

# Import after setting up the path
from main import app
from database import init_db, Base, engine

# Initialize database on cold start
try:
    Base.metadata.create_all(bind=engine)
    # Load seed data if needed
    from load_simulated_data import load_simulated_data
    from load_reports_data import load_reports_data
    
    try:
        load_simulated_data()
        load_reports_data()
        print("Database initialized with seed data")
    except Exception as e:
        print(f"Seed data already exists or error: {e}")
except Exception as e:
    print(f"Database initialization error: {e}")

# Export the FastAPI app for Vercel
# The app itself will be called by Vercel's Python runtime
# No need to reassign - just ensure it's imported above
