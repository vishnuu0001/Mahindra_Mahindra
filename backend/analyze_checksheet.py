"""
Deep analysis of Smart Factory CheckSheet Excel data
"""
import pandas as pd
from database import SessionLocal, MaturityLevel

def analyze_excel():
    excel_path = r'C:\Users\vishn\OneDrive\BASF\basf_wp1_tool\frontend\src\components\M_M_Data\MM_Data.xlsx'
    
    print("="*80)
    print("SMART FACTORY CHECKSHEET - EXCEL ANALYSIS")
    print("="*80)
    
    df = pd.read_excel(excel_path, sheet_name='Smart Factory CheckSheet', header=None)
    
    print(f"\nShape: {df.shape[0]} rows × {df.shape[1]} columns")
    print("\n--- FIRST 25 ROWS (showing first 2 columns) ---\n")
    
    for i in range(min(25, len(df))):
        row = df.iloc[i]
        col0 = str(row[0]) if pd.notna(row[0]) else "nan"
        col1 = str(row[1]) if pd.notna(row[1]) else "nan"
        
        # Truncate for display
        col0_display = col0[:30] + "..." if len(col0) > 30 else col0
        col1_display = col1[:60] + "..." if len(col1) > 60 else col1
        
        print(f"Row {i:2d}: [{col0_display:35s}] | [{col1_display}]")
    
    # Identify structure
    print("\n--- LEVEL HEADERS DETECTED ---\n")
    for i in range(len(df)):
        col1 = str(df.iloc[i][1]) if pd.notna(df.iloc[i][1]) else ""
        if "Level" in col1 and ":" in col1:
            print(f"Row {i}: {col1}")
    
    # Count entries per level
    print("\n--- CAPABILITY ENTRIES PER LEVEL ---\n")
    level_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    current_level = None
    
    for i in range(len(df)):
        col1 = str(df.iloc[i][1]) if pd.notna(df.iloc[i][1]) else ""
        col0 = str(df.iloc[i][0]) if pd.notna(df.iloc[i][0]) else ""
        
        if "Level" in col1 and ":" in col1:
            # Extract level number
            level_part = col1.split(":")[0].strip()
            level_num = int(level_part.replace("Level", "").strip())
            current_level = level_num
        elif col0 != "nan" and col0 and current_level:
            # This is a capability entry
            level_counts[current_level] += 1
    
    for level, count in level_counts.items():
        print(f"Level {level}: {count} capabilities")

def analyze_database():
    print("\n" + "="*80)
    print("DATABASE - MATURITY LEVELS ANALYSIS")
    print("="*80 + "\n")
    
    db = SessionLocal()
    levels = db.query(MaturityLevel).all()
    
    print(f"Total MaturityLevels in database: {len(levels)}")
    
    if len(levels) == 0:
        print("\n⚠️  WARNING: No MaturityLevels found in database!")
        print("   Run: python load_simulated_data.py")
    else:
        print("\n--- FIRST 10 ENTRIES ---\n")
        for ml in levels[:10]:
            desc = ml.description[:50] + "..." if len(ml.description) > 50 else ml.description
            print(f"L{ml.level} {ml.sub_level:6s} - {ml.name:25s} - {desc}")
        
        # Count by level
        print("\n--- COUNT BY LEVEL ---\n")
        for level in [1, 2, 3, 4, 5]:
            count = db.query(MaturityLevel).filter(MaturityLevel.level == level).count()
            print(f"Level {level}: {count} items")
    
    db.close()

def compare():
    print("\n" + "="*80)
    print("COMPARISON & RECOMMENDATIONS")
    print("="*80 + "\n")
    
    # Expected structure from Excel
    expected = {
        1: 6,  # Level 1 should have 6 capabilities
        2: 9,  # Level 2 should have 9 capabilities
        3: 9,  # Level 3 should have 9 capabilities
        4: 9,  # Level 4 should have 9 capabilities
        5: 9   # Level 5 should have 9 capabilities
    }
    
    print("Expected structure (from previous analysis):")
    print("  Level 1: 6 capabilities")
    print("  Level 2: 9 capabilities")
    print("  Level 3: 9 capabilities")
    print("  Level 4: 9 capabilities")
    print("  Level 5: 9 capabilities")
    print("  TOTAL: 42 capabilities")
    
    db = SessionLocal()
    total_db = db.query(MaturityLevel).count()
    db.close()
    
    print(f"\nCurrent database: {total_db} capabilities")
    
    if total_db == 42:
        print("\n✅ Database has correct number of entries!")
    else:
        print(f"\n⚠️  Database has {total_db} entries, expected 42")
        print("   Action: Run refresh-simulated-data to reload from Excel")

if __name__ == "__main__":
    analyze_excel()
    analyze_database()
    compare()
