# Deployment Instructions - Rating Scales Fix

## Changes Made

### 1. Added New API Endpoint: `/api/mm/refresh-rating-scales`
- Loads rating scales data from Excel file into database
- Parses the 'Rating Scales' sheet from MM_Data.xlsx
- Creates rating scale entries for all dimensions and maturity levels

### 2. Added Master Refresh Endpoint: `/api/mm/refresh-all-data`
- Single endpoint to refresh ALL data types:
  - Reports (Areas and Dimensions)
  - Rating Scales (all dimensions and levels)
  - Maturity Levels (Smart Factory Checksheet)
- Returns comprehensive results for all operations

### 3. Updated Reports Component
- Modified "REFRESH SIMULATED DATA" button to call `/api/mm/refresh-all-data`
- Shows detailed success message with counts for all data types

### 4. Fixed Excel File Path Issue
- **CRITICAL**: Copied `MM_Data.xlsx` from `frontend/src/components/M_M_Data/` to `backend/` directory
- Updated all three refresh endpoints to read from `backend/MM_Data.xlsx`
- This ensures Excel file is included in Vercel backend deployment

## Files Modified

1. **backend/main.py**
   - Added `/api/mm/refresh-rating-scales` endpoint
   - Added `/api/mm/refresh-all-data` master endpoint
   - Updated Excel paths in all refresh endpoints

2. **frontend/src/components/M_M/Reports.jsx**
   - Updated refresh button to use new master endpoint
   - Enhanced success message display

3. **backend/MM_Data.xlsx** (NEW)
   - Copied from frontend directory
   - Contains all source data sheets

## Deployment Steps

### Backend Deployment (Vercel)

1. Ensure `backend/MM_Data.xlsx` exists
2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```
   
3. Verify deployment at: https://mahindraservicesapi.vercel.app/

### Frontend Deployment (Already Deployed)

No changes needed - frontend already deployed at:
- https://mahindragcp.vercel.app/
- https://mahindra-mahindra.vercel.app/

## Testing the Fix

1. **Visit Frontend**: https://mahindragcp.vercel.app/
2. **Navigate to Reports page**
3. **Click "REFRESH SIMULATED DATA"** button
4. **Wait for success message** showing:
   - 📊 Reports: X Areas, Y Dimensions
   - ⭐ Rating Scales: X Dimensions, Y Ratings
   - 📈 Maturity Levels: X Items

5. **Navigate to Rating Scales page**
6. **Verify data appears** (should see 10 dimensions with 5 levels each = 50 ratings)

## API Endpoints (All POST methods)

```
POST /api/mm/refresh-all-data          # Master endpoint (RECOMMENDED)
POST /api/mm/refresh-reports-data      # Areas & Dimensions only
POST /api/mm/refresh-rating-scales     # Rating Scales only
POST /api/mm/refresh-simulated-data    # Maturity Levels only
```

## Expected Results

After clicking refresh:
- Areas: ~10 areas
- Dimensions: ~80-90 dimensions
- Rating Scales: 10 dimensions × 5 levels = 50 ratings
- Maturity Levels: ~100+ items

## Troubleshooting

### If "Excel file not found" error:
1. Verify `backend/MM_Data.xlsx` exists in deployment
2. Check Vercel build logs for file inclusion
3. May need to add to `.vercelignore` exclusions

### If Rating Scales still empty:
1. Check browser console for errors
2. Test endpoint directly: `POST https://mahindraservicesapi.vercel.app/api/mm/refresh-all-data`
3. Verify Excel sheet name is "Rating Scales" (case-sensitive)

## Notes

- Database is SQLite in `/tmp` - resets on each deployment
- Must click "REFRESH SIMULATED DATA" after every backend redeployment
- Consider auto-loading data on first API call (future enhancement)
- For production, migrate to PostgreSQL (see POSTGRESQL_MIGRATION.md)
