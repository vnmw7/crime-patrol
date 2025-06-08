@echo off
echo 🚨 Starting Crime Patrol Backend Server...
echo ==========================================

cd /d "c:\projects\crime-patrol\backend"

echo 📦 Installing dependencies (if needed)...
call npm install

echo 🚀 Starting server on port 3000...
call npm start

pause
