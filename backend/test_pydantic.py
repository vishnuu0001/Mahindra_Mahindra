import sys
sys.path.insert(0, '/backend')

from database import SessionLocal, RatingScale
from main import RatingScaleResponse

db = SessionLocal()

# Get a sample rating scale from the database
scale = db.query(RatingScale).first()

print(f'Database object attributes:')
print(f'  id: {scale.id}')
print(f'  dimension_name: {scale.dimension_name}')
print(f'  level: {scale.level}')
print(f'  rating_name: {scale.rating_name}')
print(f'  digital_maturity_description: {scale.digital_maturity_description[:50]}...')
print(f'  business_relevance: {scale.business_relevance}')

# Try to create a Pydantic model from it
try:
    response_model = RatingScaleResponse.from_orm(scale)
    print(f'\n✓ Successfully created Pydantic model!')
    print(f'  Model dict: {response_model.dict()}')
except Exception as e:
    print(f'\n✗ Error creating Pydantic model: {e}')
    import traceback
    traceback.print_exc()

db.close()
