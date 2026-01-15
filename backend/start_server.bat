@echo off
cd /d "C:\Users\vishn\OneDrive\BASF\basf_wp1_tool\backend"
call "C:\Users\vishn\OneDrive\BASF\basf_wp1_tool\.venv\Scripts\activate.bat"
python -m uvicorn main:app --reload --port 8000
