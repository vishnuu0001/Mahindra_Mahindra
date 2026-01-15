# Backend Server Status & Testing Guide

## ✅ Integration Successfully Implemented

### What Was Built:
1. **Database**: ChecksheetSelection table added
2. **Backend API**: 5 new endpoints for assessment management
3. **Frontend**: Auto-save selections, calculation trigger, visual feedback
4. **Data Flow**: Smart Factory CheckSheet → Calculate Scores → Reports

### Current Status:

**Database**: ✅ 42 Maturity Levels loaded correctly
- Level 1: 6 capabilities
- Level 2: 9 capabilities  
- Level 3: 9 capabilities
- Level 4: 9 capabilities
- Level 5: 9 capabilities

**Backend Server**: Should be running on http://127.0.0.1:8000
- Route: `/api/mm/maturity-levels` ✅ Registered
- Route: `/api/mm/assessments` ✅ Registered
- Route: `/api/mm/checksheet-selections` ✅ Registered
- Route: `/api/mm/calculate-dimension-scores` ✅ Registered

### To Start Backend Server Manually:

```bash
# Open a new PowerShell terminal
cd C:\Users\vishn\OneDrive\BASF\basf_wp1_tool\backend
& C:\Users\vishn\OneDrive\BASF\basf_wp1_tool\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --port 8000
```

Keep this terminal open! Don't close it.

### To Start Frontend:

```bash
# Open another PowerShell terminal
cd C:\Users\vishn\OneDrive\BASF\basf_wp1_tool\frontend
npm start
```

### Testing the Integration:

1. **Open Browser**: http://localhost:3000
2. **Navigate to**: Smart Factory CheckSheet
3. **Expected Behavior**:
   - Page should show 5 levels of maturity
   - Level 1 should be expanded showing 6 capabilities
   - Each capability has a checkbox
   - Assessment Info section at top

4. **Test Selection**:
   - Click checkboxes (they should save automatically)
   - Count should update at bottom
   - No console errors

5. **Test Calculation**:
   - Click "SAVE & CALCULATE SCORES" button
   - Should show success alert with calculation results
   - Navigate to Reports page
   - Dimension scores should be updated

### Troubleshooting:

**If page shows 0 items:**
- Check browser console (F12) for errors
- Check Network tab - should see request to `/api/mm/maturity-levels`
- Verify backend server is running: http://127.0.0.1:8000/docs

**If backend not responding:**
- Restart backend server (see command above)
- Check terminal for error messages
- Try: http://127.0.0.1:8000/api/mm/maturity-levels in browser

**If selections not saving:**
- Check browser console
- Verify request to `/api/mm/checksheet-selections` is successful
- Check backend logs for errors

### API Documentation:

Once backend is running, visit: http://127.0.0.1:8000/docs

This shows all available endpoints and lets you test them directly.

### Data Verification Commands:

```bash
cd C:\Users\vishn\OneDrive\BASF\basf_wp1_tool\backend
& C:\Users\vishn\OneDrive\BASF\basf_wp1_tool\.venv\Scripts\Activate.ps1

# Check maturity levels
python -c "from database import SessionLocal, MaturityLevel; db = SessionLocal(); print(f'Total: {db.query(MaturityLevel).count()}'); db.close()"

# Check if assessments exist
python -c "from database import SessionLocal, Assessment; db = SessionLocal(); print(f'Assessments: {db.query(Assessment).count()}'); db.close()"

# Check selections
python -c "from database import SessionLocal, ChecksheetSelection; db = SessionLocal(); print(f'Selections: {db.query(ChecksheetSelection).count()}'); db.close()"
```

### Next Steps:

1. Start backend server in one terminal
2. Start frontend in another terminal  
3. Open browser to http://localhost:3000
4. Navigate to Smart Factory CheckSheet
5. Start selecting capabilities!

The integration is complete and ready to use once both servers are running.
