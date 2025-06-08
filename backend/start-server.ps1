# PowerShell script to start the Crime Patrol backend server
Write-Host "Starting Crime Patrol Backend Server..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Emergency endpoint: http://localhost:3000/api/emergency/location" -ForegroundColor Yellow
Write-Host "For Android emulator use: http://10.0.2.2:3000/api/emergency/location" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

# Navigate to backend directory and start server
Set-Location -Path (Join-Path $PSScriptRoot ".")
npm start
