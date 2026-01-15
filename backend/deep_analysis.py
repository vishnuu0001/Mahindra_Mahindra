"""
Deep Analysis Script for MM_Data.xlsx and Database Verification
"""
import pandas as pd
import os
from database import SessionLocal, MaturityLevel, Area, Dimension, RatingScale
from sqlalchemy import inspect

def analyze_excel_structure():
    """Analyze complete Excel file structure"""
    excel_path = r'C:\Users\vishn\OneDrive\BASF\basf_wp1_tool\frontend\src\components\M_M_Data\MM_Data.xlsx'
    
    print("="*80)
    print("EXCEL FILE STRUCTURE ANALYSIS")
    print("="*80)
    
    xl = pd.ExcelFile(excel_path)
    print(f"\nTotal Sheets: {len(xl.sheet_names)}")
    print(f"Sheet Names: {xl.sheet_names}\n")
    
    for sheet in xl.sheet_names:
        df = pd.read_excel(excel_path, sheet_name=sheet, header=None)
        print(f"{sheet}:")
        print(f"  Dimensions: {df.shape[0]} rows x {df.shape[1]} columns")
        print(f"  Non-empty cells: {df.notna().sum().sum()}")
        print()

def analyze_smart_factory_checksheet():
    """Deep analysis of Smart Factory CheckSheet"""
    excel_path = r'C:\Users\vishn\OneDrive\BASF\basf_wp1_tool\frontend\src\components\M_M_Data\MM_Data.xlsx'
    
    print("="*80)
    print("SMART FACTORY CHECKSHEET DETAILED ANALYSIS")
    print("="*80)
    
    df = pd.read_excel(excel_path, sheet_name='Smart Factory CheckSheet', header=None)
    print(f"\nShape: {df.shape[0]} rows x {df.shape[1]} columns\n")
    
    # Find maturity levels structure
    print("Maturity Level Structure:")
    for i in range(min(50, len(df))):
        row_values = df.iloc[i].tolist()
        if any(pd.notna(v) for v in row_values[:3]):
            print(f"Row {i}: {row_values[:6]}")
    
    # Count non-empty rows per column
    print("\nNon-empty cells per column:")
    for col in range(min(10, df.shape[1])):
        count = df.iloc[:, col].notna().sum()
        if count > 0:
            print(f"  Column {col}: {count} non-empty cells")

def analyze_reports_sheet():
    """Deep analysis of Reports sheet"""
    excel_path = r'C:\Users\vishn\OneDrive\BASF\basf_wp1_tool\frontend\src\components\M_M_Data\MM_Data.xlsx'
    
    print("\n" + "="*80)
    print("REPORTS SHEET DETAILED ANALYSIS")
    print("="*80)
    
    df = pd.read_excel(excel_path, sheet_name='Reports', header=None)
    print(f"\nShape: {df.shape[0]} rows x {df.shape[1]} columns\n")
    
    # Look for area headers and dimension patterns
    print("Key Data Rows (Areas and Dimensions):")
    for i in range(min(40, len(df))):
        row_values = df.iloc[i].tolist()
        # Print rows with significant data
        if any(pd.notna(v) and str(v).strip() for v in row_values[:5]):
            print(f"Row {i}: {row_values[:6]}")

def verify_database():
    """Verify SQLite database structure and content"""
    print("\n" + "="*80)
    print("DATABASE VERIFICATION")
    print("="*80)
    
    db = SessionLocal()
    
    # Check database file location
    print(f"\nDatabase: SQLite at backend/manufacturing.db")
    print(f"Database file exists: {os.path.exists('manufacturing.db')}")
    
    # Count records
    ml_count = db.query(MaturityLevel).count()
    area_count = db.query(Area).count()
    dim_count = db.query(Dimension).count()
    rs_count = db.query(RatingScale).count()
    
    print(f"\nRecord Counts:")
    print(f"  MaturityLevels: {ml_count}")
    print(f"  Areas: {area_count}")
    print(f"  Dimensions: {dim_count}")
    print(f"  RatingScales: {rs_count}")
    
    # Sample data
    print("\nSample MaturityLevel Record:")
    ml = db.query(MaturityLevel).first()
    if ml:
        print(f"  ID: {ml.id}, Level: {ml.level}, Name: {ml.name}")
        print(f"  Sub-level: {ml.sub_level}, Category: {ml.category}")
        print(f"  Description: {ml.description[:100]}...")
    
    print("\nAll Areas with Dimensions:")
    areas = db.query(Area).all()
    for area in areas:
        dim_count = len(area.dimensions)
        print(f"\n  {area.name} (Desired Level: {area.desired_level})")
        print(f"  Dimensions: {dim_count}")
        for dim in area.dimensions[:5]:
            print(f"    - {dim.name}: Current={dim.current_level}, Desired={dim.desired_level}")
        if dim_count > 5:
            print(f"    ... and {dim_count - 5} more dimensions")
    
    # Check MaturityLevel distribution
    print("\nMaturityLevel Distribution:")
    for level in [1, 2, 3, 4, 5]:
        count = db.query(MaturityLevel).filter(MaturityLevel.level == level).count()
        print(f"  Level {level}: {count} capabilities")
    
    db.close()

def analyze_data_relationships():
    """Analyze relationships between sheets"""
    excel_path = r'C:\Users\vishn\OneDrive\BASF\basf_wp1_tool\frontend\src\components\M_M_Data\MM_Data.xlsx'
    
    print("\n" + "="*80)
    print("DATA RELATIONSHIP ANALYSIS")
    print("="*80)
    
    # Read both sheets
    checksheet_df = pd.read_excel(excel_path, sheet_name='Smart Factory CheckSheet', header=None)
    reports_df = pd.read_excel(excel_path, sheet_name='Reports', header=None)
    
    print("\nAnalyzing relationship between Smart Factory CheckSheet and Reports...")
    print(f"CheckSheet has {checksheet_df.shape} shape")
    print(f"Reports has {reports_df.shape} shape")
    
    print("\nExpected Flow:")
    print("  1. Smart Factory CheckSheet defines maturity levels (1-5) with capabilities")
    print("  2. Reports sheet defines Areas (Press Shop, Assembly, etc.) with dimensions")
    print("  3. Each dimension in Reports should map to current/desired maturity levels")
    print("  4. User selections in CheckSheet should influence Reports dimension scores")

if __name__ == "__main__":
    analyze_excel_structure()
    analyze_smart_factory_checksheet()
    analyze_reports_sheet()
    verify_database()
    analyze_data_relationships()
    
    print("\n" + "="*80)
    print("ANALYSIS COMPLETE")
    print("="*80)
