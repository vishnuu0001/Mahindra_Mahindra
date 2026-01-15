import pandas as pd
import json

# Read the Matrices sheet
df = pd.read_excel('frontend/src/components/M_M_Data/MM_Data.xlsx', sheet_name='Matrices', header=None)

# Print all non-empty cells
print("Complete Matrices Content:\n")
for i in range(len(df)):
    row_content = []
    for j in range(len(df.columns)):
        val = df.iloc[i, j]
        if pd.notna(val):
            row_content.append(f"Col{j}: {val}")
    
    if row_content:
        print(f"\nRow {i}:")
        for item in row_content:
            print(f"  {item}")
