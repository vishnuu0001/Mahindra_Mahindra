# ✅ Deployment Checklist

## Pre-Deployment Verification

### Backend Files Created/Modified:
- [x] `api/index.py` - Serverless entry point
- [x] `vercel.json` - Vercel configuration  
- [x] `requirements.txt` (root) - Python dependencies
- [x] `.vercelignore` - Exclude unnecessary files
- [x] `backend/database.py` - Modified for serverless (/tmp directory)
- [x] `backend/main.py` - Conditional startup event

### Frontend Files Created/Modified:
- [x] `frontend/src/config.js` - API URL configuration
- [x] `frontend/src/components/M_M/Reports.jsx` - Uses apiUrl()
- [x] `frontend/src/components/M_M/SmartFactoryChecksheet.jsx` - Uses apiUrl()
- [x] `frontend/src/components/M_M/RatingScales.jsx` - Uses apiUrl()
- [x] `frontend/src/components/M_M/Matrices.jsx` - Static (no API calls)
- [x] `frontend/.env` - Local development config
- [x] `frontend/.env.example` - Template for others
- [x] `frontend/.gitignore` - Excludes .env files

### Documentation:
- [x] `README.md` - Project overview
- [x] `QUICK_START.md` - 5-minute deployment guide
- [x] `DEPLOYMENT_GUIDE.md` - Detailed deployment instructions
- [x] `POSTGRESQL_MIGRATION.md` - Database upgrade guide
- [x] `DEPLOYMENT_CHECKLIST.md` - This file

---

## Deployment Steps

### Step 1: Commit and Push to GitHub ✓
```bash
git add .
git commit -m "Configure for Vercel serverless deployment"
git push origin main
```

### Step 2: Deploy Backend to Vercel ✓
- [ ] Go to https://vercel.com
- [ ] Click "Add New" → "Project"
- [ ] Import GitHub repository
- [ ] Project name: `mahindra-backend`
- [ ] Framework: Other
- [ ] Click "Deploy"
- [ ] Wait for deployment (~60 seconds)
- [ ] Copy backend URL: ____________________

### Step 3: Configure Frontend Environment ✓
- [ ] Go to frontend Vercel project (mahindra-mahindra)
- [ ] Settings → Environment Variables
- [ ] Add `VITE_API_URL` = (backend URL from Step 2)
- [ ] Environment: Production ✓
- [ ] Click "Save"

### Step 4: Redeploy Frontend ✓
- [ ] Go to Deployments
- [ ] Click ⋮ on latest deployment
- [ ] Click "Redeploy"
- [ ] Wait for deployment

### Step 5: Test Application ✓
- [ ] Open https://mahindra-mahindra.vercel.app/
- [ ] Login successfully
- [ ] Navigate to "Reports"
- [ ] Click "Refresh Simulated Data"
- [ ] Data loads successfully
- [ ] Navigate to "Smart Factory Checksheet"
- [ ] Checksheet loads with items
- [ ] Navigate to "Rating Scales"
- [ ] Scales display correctly
- [ ] Navigate to "Matrices"
- [ ] Matrices render properly

---

## Verification

### Backend API Check:
- [ ] Visit `https://your-backend.vercel.app/docs`
- [ ] Swagger UI loads
- [ ] Try `/api/mm/areas` endpoint
- [ ] Returns data successfully

### Frontend API Integration:
- [ ] Open browser DevTools (F12)
- [ ] Go to Network tab
- [ ] Navigate through app
- [ ] API calls go to correct backend URL
- [ ] No CORS errors
- [ ] Data loads successfully

### Cross-Device Test:
- [ ] Works on desktop browser
- [ ] Works on mobile browser
- [ ] Works on different networks
- [ ] Works from different locations

---

## Post-Deployment (Optional)

### Upgrade to PostgreSQL:
- [ ] Create Neon account (https://neon.tech)
- [ ] Create new database
- [ ] Copy connection string
- [ ] Add `DATABASE_URL` to Vercel environment variables
- [ ] Update `backend/database.py` (see POSTGRESQL_MIGRATION.md)
- [ ] Add `psycopg2-binary` to requirements.txt
- [ ] Redeploy backend
- [ ] Test data persistence

### Performance Monitoring:
- [ ] Enable Vercel Analytics
- [ ] Monitor API response times
- [ ] Check error rates
- [ ] Review function logs

### Security Review:
- [ ] Environment variables not exposed
- [ ] .env files in .gitignore
- [ ] CORS properly configured
- [ ] No sensitive data in logs

---

## Troubleshooting

### Backend Deployment Failed:
- Check Vercel build logs
- Verify all files committed to Git
- Check `api/index.py` syntax
- Verify `vercel.json` is valid JSON
- Check `requirements.txt` dependencies

### Frontend Can't Connect to Backend:
- Verify `VITE_API_URL` is set correctly
- Check it ends with your backend domain (no trailing slash)
- Redeploy frontend after setting variable
- Check browser console for CORS errors
- Verify backend is actually deployed and running

### Database Issues:
- Check backend logs in Vercel
- Verify database initializes correctly
- For persistence, migrate to PostgreSQL
- Check `/tmp` permissions in serverless

### No Data Showing:
- Click "Refresh Simulated Data" button
- Check API calls in browser Network tab
- Verify backend `/docs` endpoint works
- Check for JavaScript errors in console

---

## Success Criteria

✅ **Backend deployed** to Vercel serverless
✅ **Frontend deployed** to Vercel  
✅ **Environment variables** configured
✅ **API calls** working end-to-end
✅ **Data loading** in all views
✅ **No CORS errors**
✅ **Accessible** from anywhere
✅ **Fast response** times (<2 seconds)

---

## Next Steps After Deployment

1. **Share the link**: https://mahindra-mahindra.vercel.app/
2. **Monitor usage**: Check Vercel analytics
3. **Consider PostgreSQL**: For data persistence
4. **Add authentication**: If needed for production
5. **Custom domain**: Point your domain to Vercel (optional)
6. **CI/CD**: Auto-deploy on Git push (already configured!)

---

**Deployment Complete?** 🎉  
Check all boxes above, then you're live!

**Need Help?**  
See QUICK_START.md or DEPLOYMENT_GUIDE.md
