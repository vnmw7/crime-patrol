@echo off
echo Starting Crime Patrol Emergency Backend Server...
echo.
echo Server will be available at: http://localhost:3000
echo Emergency Dashboard: file:///c:/projects/crime-patrol/backend/emergency-dashboard.html
echo.
cd /d "c:\projects\crime-patrol\backend"
node src/index.js
pause
