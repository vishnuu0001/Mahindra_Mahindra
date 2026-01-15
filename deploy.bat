@echo off
echo ===============================================
echo Mahindra Backend Deployment
echo ===============================================
echo.
echo Checking for Vercel CLI...
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Vercel CLI not found
    echo Install with: npm install -g vercel
    echo.
    pause
    exit /b 1
)

echo Vercel CLI found!
echo.
echo Deploying to production...
echo.
vercel --prod

echo.
echo ===============================================
echo Deployment Complete!
echo ===============================================
echo.
echo Backend API: https://mahindraservicesapi.vercel.app/
echo Frontend: https://mahindragcp.vercel.app/
echo.
echo NEXT STEP: Click "REFRESH SIMULATED DATA" button
echo in the app to load all data.
echo.
pause
