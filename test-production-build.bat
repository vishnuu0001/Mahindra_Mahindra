@echo off
echo ========================================
echo   BUILD AND TEST PRODUCTION VERSION
echo ========================================
echo.
echo This will build the production version and test it locally
echo before deploying to Vercel.
echo.

cd /d "%~dp0frontend"

echo Step 1: Building production bundle...
echo This may take a minute...
echo.
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Build failed! Check the errors above.
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.
echo Step 2: Installing serve (if needed)...
call npm install -g serve >nul 2>&1

echo.
echo Step 3: Starting local production server...
echo.
echo 📍 Open your browser to: http://localhost:3000
echo.
echo Test the following:
echo   1. Generate Report button
echo   2. Download CSV button
echo   3. View Roadmap button
echo.
echo If all buttons work, you can deploy to Vercel.
echo.
echo Press Ctrl+C to stop the server when done testing.
echo.

call serve -s build -p 3000
