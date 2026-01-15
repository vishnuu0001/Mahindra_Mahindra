from database import SessionLocal, RatingScale

db = SessionLocal()
count = db.query(RatingScale).count()
print(f'Database has {count} rating scales')

sample = db.query(RatingScale).first()
if sample:
    print(f'\nSample record:')
    print(f'  ID: {sample.id}')
    print(f'  Dimension: {sample.dimension_name}')
    print(f'  Level: {sample.level}')
    print(f'  Rating Name: {sample.rating_name}')
    print(f'  Description: {sample.digital_maturity_description[:50]}...')
    print(f'  Business Relevance: {sample.business_relevance}')
else:
    print('No data found!')

db.close()
