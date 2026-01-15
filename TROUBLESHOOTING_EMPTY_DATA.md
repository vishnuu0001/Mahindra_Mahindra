# 🔴 TROUBLESHOOTING: Empty Data Issue

## Problem
Your frontend is deployed and loading, but all pages show empty data (0 items, no reports, etc.)

## Quick Diagnosis

### Step 1: Access the Diagnostics Page
Open your browser and go to:
```
https://mahindra-mahindra-dd5u.vercel.app/?diagnostics
```

This will run automated tests and show you exactly what's wrong.

### Step 2: Check Browser Console
1. Open your deployed site
2. Press `F12` (or right-click → Inspect)
3. Go to "Console" tab
4. Look for these messages:

**If you see:**
```
🔧 API Configuration Loaded
🌐 VITE_API_URL: undefined
🎯 API_BASE_URL: http://localhost:8000
❌ API Connection: ERROR
```

**This means:** Environment variable is NOT set → See Fix #1 below

**If you see:**
```
🔧 API Configuration Loaded
🌐 VITE_API_URL: https://your-backend.vercel.app
✅ API Connection: SUCCESS
```

**This means:** API is connected but data is empty → See Fix #2 below

---

## Fix #1: Backend Not Deployed or Environment Variable Missing

### Check 1: Is the backend deployed?

1. Go to https://vercel.com/dashboard
2. Look for a project named `mahindra-backend` or similar
3. **If NO backend project exists** → You need to deploy it!

**Deploy Backend Now:**
```bash
# Make sure all files are committed
git add .
git commit -m "Add serverless backend"
git push

# Then go to Vercel:
# 1. Click "Add New" → "Project"
# 2. Import your repository
# 3. Deploy (it will auto-detect the backend)
# 4. Copy the URL (e.g., https://mahindra-backend-xyz.vercel.app)
```

### Check 2: Is the environment variable set?

1. Go to your **FRONTEND** project on Vercel (mahindra-mahindra)
2. Click Settings → Environment Variables
3. Look for `VITE_API_URL`

**If missing:**
1. Click "Add New"
2. Name: `VITE_API_URL`
3. Value: `https://your-backend-url.vercel.app` (NO trailing slash!)
4. Environment: Production ✓
5. Click "Save"
6. Go to Deployments → Click ⋮ on latest → "Redeploy"

**⚠️ IMPORTANT:** 
- Must be EXACTLY `VITE_API_URL` (case-sensitive!)
- NO trailing slash at the end
- Must be the backend URL, not the frontend URL

---

## Fix #2: Backend Deployed but Database Empty

If the API connection works but no data shows:

### Option A: Click "Refresh Simulated Data" Button

1. Login to your app
2. Go to "Reports" page
3. Click the green "REFRESH SIMULATED DATA" button
4. Wait for confirmation message
5. Data should appear

### Option B: Check Backend Logs

1. Go to Vercel → Your backend project
2. Click "Deployments" → Latest deployment
3. Click "View Function Logs"
4. Look for errors during database initialization

**Common issues:**
- Import errors → Check that all files are deployed
- Module not found → Reinstall dependencies
- Database errors → Check `/tmp` permissions

### Option C: Redeploy Backend

Sometimes the initial deployment doesn't initialize correctly:

1. Go to Vercel → Backend project
2. Deployments tab
3. Click ⋮ on latest deployment
4. Click "Redeploy"
5. Wait for deployment to complete
6. Test again

---

## Fix #3: CORS Errors

If browser console shows:
```
Access to fetch has been blocked by CORS policy
```

**Check:** Open `backend/main.py` and verify:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Should be "*" for testing
    allow_methods=["*"],
    allow_headers=["*"],
)
```

If it's different, fix it, commit, push, and redeploy.

---

## Verification Checklist

After applying fixes, verify:

- [ ] Backend project exists on Vercel
- [ ] Backend deployment shows "Ready" status
- [ ] Frontend project has `VITE_API_URL` environment variable set
- [ ] Frontend has been redeployed after setting variable
- [ ] Diagnostics page shows all green checkmarks
- [ ] Browser console shows `✅ API Connection: SUCCESS`
- [ ] Data appears after clicking "Refresh Simulated Data"

---

## Still Not Working?

### Test the Backend Directly

1. Get your backend URL from Vercel
2. Open: `https://your-backend.vercel.app/docs`
3. You should see Swagger API documentation
4. Try the `/api/mm/areas` endpoint
5. If it returns data → Backend works, frontend config is wrong
6. If it errors → Backend has deployment issues

### Common Mistakes

1. **Wrong URL in VITE_API_URL**
   - ❌ `http://localhost:8000` (only works locally)
   - ❌ `https://mahindra-mahindra.vercel.app` (that's the FRONTEND)
   - ✅ `https://mahindra-backend-xyz.vercel.app` (the BACKEND)

2. **Trailing Slash**
   - ❌ `https://backend.vercel.app/`
   - ✅ `https://backend.vercel.app`

3. **Not Redeploying Frontend**
   - Environment variables only apply to NEW deployments
   - You MUST redeploy after setting variables

4. **Backend Files Not Committed**
   - Check `api/index.py` is in your Git repository
   - Check `vercel.json` is in your Git repository
   - Run `git add .` and `git commit` and `git push`

---

## Quick Test Script

Open browser console on your site and run:

```javascript
// Test 1: Check environment
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);

// Test 2: Test API connection
fetch('https://your-backend-url.vercel.app/api/mm/areas')
  .then(r => r.json())
  .then(d => console.log('API Data:', d))
  .catch(e => console.error('API Error:', e));
```

Replace `your-backend-url` with your actual backend URL.

---

## Need More Help?

1. Run diagnostics: Add `?diagnostics` to your URL
2. Check browser console (F12) for error messages  
3. Check Vercel deployment logs
4. Verify all files from serverless conversion are deployed
5. Make sure you pushed ALL changes to GitHub

---

## Success Indicators

When everything is working correctly, you should see:

✅ Diagnostics page: All tests passing
✅ Console: `✅ API Connection: SUCCESS`
✅ Reports page: Shows maturity levels and areas
✅ Checksheet: Shows selectable items
✅ Rating Scales: Shows dimensions and ratings
✅ No CORS errors
✅ Data persists during the session

**Note:** Data will reset on each backend deployment (this is normal with SQLite in serverless). For persistence, migrate to PostgreSQL.
