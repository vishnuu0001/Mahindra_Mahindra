from sqlalchemy import inspect
from database import engine

inspector = inspect(engine)
columns = inspector.get_columns('rating_scales')

print('rating_scales table columns:')
for col in columns:
    print(f"  {col['name']}: {col['type']}")
