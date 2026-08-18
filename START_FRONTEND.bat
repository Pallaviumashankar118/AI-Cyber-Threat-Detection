@echo off
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║          AegisSOC – Frontend Setup                  ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
echo [1/2] Installing npm dependencies...
cd /d "%~dp0frontend"
call npm install
echo.
echo [2/2] Starting development server...
echo.
echo  Dashboard: http://localhost:3000
echo  Login:     admin@aegissoc.com / password123
echo.
call npm run dev
pause
