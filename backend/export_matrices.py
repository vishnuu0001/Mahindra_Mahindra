import pandas as pd
import json
import os

# Get proper path
backend_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(backend_dir)
excel_path = os.path.join(project_root, 'frontend', 'src', 'components', 'M_M_Data', 'MM_Data.xlsx')

# Read the Matrices sheet
df = pd.read_excel(excel_path, sheet_name='Matrices', header=None)

# Structure the data
matrices_data = {
    "maturity_levels": {
        "L1": "",
        "L2": "",
        "L3": ""
    },
    "categories": []
}

# Get maturity level descriptions from row 0
if pd.notna(df.iloc[0, 1]):
    matrices_data["maturity_levels"]["L1"] = str(df.iloc[0, 1]).strip()
if pd.notna(df.iloc[0, 2]):
    matrices_data["maturity_levels"]["L2"] = str(df.iloc[0, 2]).strip()
if pd.notna(df.iloc[0, 3]):
    matrices_data["maturity_levels"]["L3"] = str(df.iloc[0, 3]).strip()

# Parse categories and metrics
current_category = None
current_metric = None

for i in range(1, len(df)):
    col0_val = df.iloc[i, 0]
    
    if pd.notna(col0_val):
        text = str(col0_val).strip()
        
        # Check if it's a category header
        if any(keyword in text for keyword in ['Operations & Flow', 'Quality & Traceability', 'Assets, Maintenance & Energy']):
            current_category = {
                "name": text,
                "metrics": []
            }
            matrices_data["categories"].append(current_category)
        elif current_category is not None:
            # It's a metric or description
            current_category["metrics"].append(text)

# Save to JSON
with open('matrices_data.json', 'w', encoding='utf-8') as f:
    json.dump(matrices_data, f, indent=2, ensure_ascii=False)

print("Matrices data saved to matrices_data.json")
print(json.dumps(matrices_data, indent=2, ensure_ascii=False))
