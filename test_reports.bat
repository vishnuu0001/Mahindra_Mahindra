@echo off
echo ===============================================
echo Testing Reports Features Locally
echo ===============================================
echo.
echo Starting backend server...
cd backend
start cmd /k "python -m uvicorn main:app --reload --port 8000"
echo Backend starting on http://localhost:8000
echo.
timeout /t 3
echo.
echo Starting frontend dev server...
cd ..\frontend
start cmd /k "npm run dev"
echo Frontend starting on http://localhost:5173
echo.
echo ===============================================
echo Test the following features:
echo.
echo 1. Navigate to Reports page
echo 2. Click "REFRESH SIMULATED DATA" to load data
echo 3. Test GENERATE REPORT button
echo 4. Test DOWNLOAD CSV button
echo 5. Test VIEW ROADMAP button
echo.
echo Press any key when done testing...
pause >nul
echo.
echo Stopping servers...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *uvicorn*" 2>nul
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *vite*" 2>nul
echo Done!
