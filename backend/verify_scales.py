from database import SessionLocal, RatingScale

db = SessionLocal()
scales = db.query(RatingScale).filter(RatingScale.dimension_name == 'Asset Connectivity and OEE').all()

print('\nAsset Connectivity and OEE - Rating Scales:\n')
for s in scales:
    desc = s.digital_maturity_description[:100] + '...' if len(s.digital_maturity_description) > 100 else s.digital_maturity_description
    bus = (s.business_relevance[:80] + '...') if s.business_relevance and len(s.business_relevance) > 80 else (s.business_relevance or "N/A")
    print(f'Level {s.level}: {s.rating_name}')
    print(f'  Description: {desc}')
    print(f'  Business: {bus}\n')

db.close()
