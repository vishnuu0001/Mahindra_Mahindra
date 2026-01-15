import pandas as pd

excel_path = r'C:\Users\vishn\OneDrive\BASF\basf_wp1_tool\frontend\src\components\M_M_Data\MM_Data.xlsx'
df = pd.read_excel(excel_path, sheet_name='Reports', header=None)

print("Analyzing Reports sheet structure:\n")
for idx, row in df.iterrows():
    if idx >= 3 and idx <= 15:
        print(f'Row {idx}: Col0=[{row[0]}] Col1=[{row[1]}] Col8=[{row[8]}]')
