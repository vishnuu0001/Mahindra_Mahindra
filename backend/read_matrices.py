import pandas as pd
import json

# Read the Matrices sheet
df = pd.read_excel('frontend/src/components/M_M_Data/MM_Data.xlsx', sheet_name='Matrices', header=None)

print(f'Shape: {df.shape}')
print('\nFirst 25 rows with all columns:')

for i in range(min(25, len(df))):
    row_data = []
    for j in range(len(df.columns)):
        val = df.iloc[i, j]
        if pd.notna(val):
            row_data.append(f'Col{j}: {str(val)[:80]}')
    if row_data:
        print(f'\nRow {i}:')
        for item in row_data:
            print(f'  {item}')
