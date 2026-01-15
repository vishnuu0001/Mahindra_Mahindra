"""
Reinitialize database with new ChecksheetSelection table
"""
from database import Base, engine, SessionLocal
from database import Area, Dimension, MaturityLevel, RatingScale, Assessment, DimensionAssessment, ChecksheetSelection

def reinit_db():
    print("Reinitializing database with new schema...")
    
    # Create all tables (will create new tables only, existing tables remain)
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database reinitialized successfully!")
    print("\nNew table added: checksheet_selections")
    
    # Verify tables exist
    db = SessionLocal()
    try:
        ml_count = db.query(MaturityLevel).count()
        area_count = db.query(Area).count()
        dim_count = db.query(Dimension).count()
        cs_count = db.query(ChecksheetSelection).count()
        
        print(f"\nCurrent data:")
        print(f"  MaturityLevels: {ml_count}")
        print(f"  Areas: {area_count}")
        print(f"  Dimensions: {dim_count}")
        print(f"  ChecksheetSelections: {cs_count}")
    finally:
        db.close()

if __name__ == "__main__":
    reinit_db()
