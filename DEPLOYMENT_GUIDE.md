# Deployment Guide - Mahindra and Mahindra Tool

## Issue
The application deployed on Vercel (https://mahindra-mahindra.vercel.app/) cannot access data because the frontend is trying to connect to `localhost:8000`, which only works on your local machine.

## Solution
The code has been updated to use environment variables for the API URL. Now you need to:

### 1. Deploy the Backend

Your backend needs to be accessible from the internet. Here are some free/easy options:

#### Option A: Render (Recommended)
1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: mahindra-backend (or any name)
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click "Create Web Service"
6. Once deployed, copy your backend URL (e.g., `https://mahindra-backend.onrender.com`)

#### Option B: Railway
1. Go to https://railway.app and sign up
2. Create new project from GitHub repo
3. Select the backend folder
4. Railway will auto-detect Python and deploy
5. Copy your backend URL

#### Option C: Vercel Serverless (More Complex)
Convert the FastAPI backend to serverless functions (requires code changes)

### 2. Configure Frontend Environment Variable on Vercel

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: Your deployed backend URL (e.g., `https://mahindra-backend.onrender.com`)
   - **Environment**: Production (and Preview if needed)
4. Click **Save**
5. Go to **Deployments** → Click the three dots on latest deployment → **Redeploy**

### 3. Local Development

For local development, the `.env` file is already configured to use `http://localhost:8000`.

To run locally:
```bash
# Terminal 1 - Backend
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

## Code Changes Made

1. **Created** `frontend/src/config.js` - Centralized API configuration
2. **Updated** All M&M components to use `apiUrl()` helper function instead of hardcoded URLs
3. **Created** `.env` and `.env.example` files for environment variables
4. **Backend CORS** - Already configured to allow all origins

## Files Changed
- `frontend/src/config.js` (new)
- `frontend/src/components/M_M/Reports.jsx`
- `frontend/src/components/M_M/SmartFactoryChecksheet.jsx`
- `frontend/src/components/M_M/RatingScales.jsx`
- `frontend/.env` (new)
- `frontend/.env.example` (new)

## Next Steps

1. **Deploy the backend** using one of the options above
2. **Set the environment variable** on Vercel
3. **Redeploy the frontend** on Vercel
4. Test the application at https://mahindra-mahindra.vercel.app/

The application should now work from any device/location!
