# Deploying to Vercel - Fix Guide

## Issue: Buttons Not Working on https://mahindragcp.vercel.app/

The buttons (Generate Report, Download CSV, View Roadmap) are not working because of configuration issues. Follow these steps to fix:

## Solution 1: Rebuild and Redeploy

### Step 1: Build Production Bundle Locally (Test First)

```powershell
cd frontend
npm run build
```

This will:
- Use `.env.production` file
- Set `REACT_APP_API_URL=https://mahindraservicesapi.vercel.app`
- Create optimized production build in `frontend/build/`

### Step 2: Test Production Build Locally

```powershell
# Install serve if you don't have it
npm install -g serve

# Serve the production build
serve -s build -p 3000
```

Open http://localhost:3000 and test if the buttons work.

### Step 3: Deploy to Vercel

**Option A: Using Vercel CLI**
```powershell
# Install Vercel CLI if not installed
npm install -g vercel

# Deploy from frontend folder
cd frontend
vercel --prod
```

**Option B: Using Git (Recommended)**
```powershell
# Commit changes
git add .
git commit -m "Fix production API configuration"
git push

# Vercel will auto-deploy if connected to your Git repo
```

## Solution 2: Set Environment Variable in Vercel Dashboard

If rebuilding doesn't work, manually set the environment variable:

1. Go to https://vercel.com/dashboard
2. Select your project: `mahindragcp`
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://mahindraservicesapi.vercel.app`
   - **Environments**: Select **Production**, **Preview**, **Development**
5. Click **Save**
6. Go to **Deployments** tab
7. Click the **...** menu on the latest deployment
8. Select **Redeploy**

## Verify the Fix

After redeployment, check in the browser console (F12):

1. You should see:
   ```
   🔧 API Configuration Loaded
   🎯 Mode: production
   🌐 API_BASE_URL: https://mahindraservicesapi.vercel.app
   🔗 REACT_APP_API_URL: https://mahindraservicesapi.vercel.app (from environment)
   ```

2. You should see:
   ```
   ✅ API Connection: SUCCESS
   ```

3. If you see errors, check:
   - Network tab for failed API calls
   - Console for JavaScript errors
   - CORS errors (backend should allow your frontend domain)

## Common Issues

### Issue: "API Connection: FAILED"
**Cause**: Backend API is down or not accessible
**Solution**: Check https://mahindraservicesapi.vercel.app/docs - should load

### Issue: CORS Error
**Cause**: Backend doesn't allow requests from your frontend domain
**Solution**: Backend already has `allow_origins=["*"]` so this shouldn't happen

### Issue: Buttons Still Don't Work
**Cause**: JavaScript errors in production build
**Solution**: 
1. Open browser console (F12)
2. Click a button
3. Look for red error messages
4. Share the error here for debugging

## Files Updated

✅ `.env.production` - Sets production API URL
✅ `config.js` - Uses correct environment variables
✅ `package.json` - Has proxy for development

## Quick Test Commands

```powershell
# Test production build locally
cd frontend
npm run build
npx serve -s build

# Deploy to Vercel
vercel --prod
```

## Expected Behavior After Fix

- ✅ Generate Report button → Downloads HTML report
- ✅ Download CSV button → Downloads CSV file  
- ✅ View Roadmap button → Opens modal (not new window)

All buttons should work on https://mahindragcp.vercel.app/ after redeployment.
