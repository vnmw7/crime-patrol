# Emergency Ping Test Script
# This script starts the backend and tests the emergency ping functionality

Write-Host "🚨 Crime Patrol Emergency Ping Test Suite" -ForegroundColor Red
Write-Host "============================================" -ForegroundColor Yellow

# Change to backend directory
Set-Location "c:\projects\crime-patrol\backend"

Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
npm install

Write-Host "🚀 Starting backend server..." -ForegroundColor Green
# Start server in background
$serverJob = Start-Job -ScriptBlock {
    Set-Location "c:\projects\crime-patrol\backend"
    npm start
}

# Wait for server to start
Write-Host "⏳ Waiting for server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test server connectivity
Write-Host "🔍 Testing server connectivity..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/emergency/pings" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend server is running and responding!" -ForegroundColor Green
        
        # Run emergency ping test
        Write-Host "🚨 Testing emergency ping functionality..." -ForegroundColor Red
        node test-emergency-ping.js
        
        Write-Host "`n🎯 Emergency Dashboard Available:" -ForegroundColor Magenta
        Write-Host "   👉 http://localhost:3000/emergency-dashboard.html" -ForegroundColor Blue
        
        Write-Host "`n✅ Emergency ping functionality is ready!" -ForegroundColor Green
        Write-Host "📱 You can now test the PANIC button in the mobile app." -ForegroundColor Cyan
        
    } else {
        Write-Host "❌ Server responded with status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Cannot connect to backend server!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔧 Server Management:" -ForegroundColor Yellow
Write-Host "  • Server Job ID: $($serverJob.Id)" -ForegroundColor Gray
Write-Host "  • To stop server: Stop-Job $($serverJob.Id); Remove-Job $($serverJob.Id)" -ForegroundColor Gray
Write-Host "  • To view logs: Receive-Job $($serverJob.Id)" -ForegroundColor Gray

Write-Host "`n🚨 Emergency Ping Implementation Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Yellow

# Keep script running to maintain server
Write-Host "Press Ctrl+C to stop the server and exit..." -ForegroundColor Yellow
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # Cleanup
    Stop-Job $serverJob -ErrorAction SilentlyContinue
    Remove-Job $serverJob -ErrorAction SilentlyContinue
    Write-Host "`n🛑 Server stopped." -ForegroundColor Red
}
