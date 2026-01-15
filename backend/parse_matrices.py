import pandas as pd

# Read the Matrices sheet
df = pd.read_excel('frontend/src/components/M_M_Data/MM_Data.xlsx', sheet_name='Matrices', header=None)

# Process the data
categories = []
current_category = None
current_subcategory = None

for i in range(len(df)):
    col0 = df.iloc[i, 0]
    col1 = df.iloc[i, 1]
    col2 = df.iloc[i, 2]
    col3 = df.iloc[i, 3]
    
    # Check if it's a main category (row 1, 14, 23, etc.)
    if pd.notna(col0) and pd.isna(col1) and pd.isna(col2) and pd.isna(col3):
        if 'Operations' in str(col0) or 'Quality' in str(col0) or 'Assets' in str(col0):
            current_category = str(col0).strip()
            categories.append({
                'category': current_category,
                'metrics': []
            })
            print(f'\n=== CATEGORY: {current_category} ===')
    elif pd.notna(col0):
        metric_text = str(col0).strip()
        if current_category and metric_text:
            print(f'  • {metric_text}')

print(f'\n\nTotal categories found: {len(categories)}')
