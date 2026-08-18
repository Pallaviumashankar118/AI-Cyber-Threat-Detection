@echo off
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║          AegisSOC – Backend Setup                   ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
echo [1/2] Installing Python dependencies...
cd /d "%~dp0backend"
pip install -r requirements.txt
echo.
echo [2/2] Starting FastAPI server...
echo.
echo  API:   http://localhost:8000
echo  Docs:  http://localhost:8000/docs
echo.
uvicorn main:app --reload --port 8000 --host 0.0.0.0
pause
