@echo off
echo ========================================
echo  Starting Backend with Network Access
echo ========================================
echo.
echo This will start the backend server accessible from other computers.
echo.

cd /d "%~dp0backend"

echo Activating virtual environment...
call ..\.venv\Scripts\activate.bat

echo.
echo Starting Uvicorn server...
echo Server will be accessible at:
echo   - Local:   http://localhost:8000
echo   - Network: http://YOUR_IP:8000
echo.
echo To find your IP address, run: ipconfig
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
