@echo off
echo ========================================
echo   RESTARTING SERVERS FOR NETWORK ACCESS
echo ========================================
echo.
echo This will:
echo 1. Stop the current frontend server
echo 2. Restart it with network access enabled
echo.

echo Killing existing Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Getting your IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    echo Your IP: %%a
)

echo.
echo Starting Backend Server (if not already running)...
start "Backend Server" cmd /k "cd /d "%~dp0backend" && call ..\.venv\Scripts\activate.bat && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo.
echo Starting Frontend Server with Network Access...
start "Frontend Server" cmd /k "cd /d "%~dp0frontend" && set HOST=0.0.0.0 && npm start"

echo.
echo ========================================
echo   SERVERS RESTARTED!
echo ========================================
echo.
echo Access from this computer: http://localhost:3000
echo Access from other computers: http://YOUR_IP:3000
echo.
echo Check the terminal windows for your IP address
echo.
pause
