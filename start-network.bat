@echo off
echo ========================================
echo  Starting Full Stack - Network Access
echo ========================================
echo.
echo This will start BOTH backend and frontend servers.
echo Other computers on your network can access the application.
echo.

echo Step 1: Finding your IP address...
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    set IP=!IP:~1!
    echo Your IP Address: !IP!
    echo Other computers can access at: http://!IP!:5173
)
echo.

echo Step 2: Starting Backend Server...
start "Backend Server" cmd /k "cd /d "%~dp0backend" && call ..\.venv\Scripts\activate.bat && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo Step 3: Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ========================================
echo  Servers Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Network Access: http://YOUR_IP:5173
echo (Check the terminal windows for your IP address)
echo.
echo Press any key to close this window (servers will keep running)...
pause >nul
