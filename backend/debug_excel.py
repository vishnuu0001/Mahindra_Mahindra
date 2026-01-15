import pandas as pd

# Read the Rating Scales Excel sheet  
excel_file = 'frontend/src/components/M_M_Data/MM_Data.xlsx'
df = pd.read_excel(excel_file, sheet_name='Rating Scales', header=None)

print("Looking for dimension names in rows 0-10:")
for row_idx in range(11):
    print(f"\nRow {row_idx}:")
    row = df.iloc[row_idx]
    for col_idx in [0, 3, 6, 9, 12, 15, 18, 21, 24, 27]:
        if col_idx < len(row):
            val = row.iloc[col_idx]
            if pd.notna(val) and 'Digital Maturity' not in str(val):
                print(f"  Col {col_idx}: {val}")
