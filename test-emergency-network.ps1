# Emergency Ping Network Connectivity Test
# This PowerShell script helps test the complete emergency ping setup

Write-Host "🚨 Crime Patrol Emergency Ping Network Test 🚨" -ForegroundColor Red
Write-Host "===============================================" -ForegroundColor Red
Write-Host ""

# Check if backend server is running
Write-Host "🔍 Checking if backend server is running..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend server is running!" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend server is not running or not accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🚀 Starting backend server..." -ForegroundColor Yellow
    
    # Try to start the backend server
    $backendPath = Join-Path $PSScriptRoot "."
    Push-Location $backendPath
    
    Write-Host "📂 Current directory: $(Get-Location)" -ForegroundColor Gray
    Write-Host "🏃 Running: npm start" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔄 Starting server in background..." -ForegroundColor Cyan
    
    # Start server in background
    Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Minimized -WorkingDirectory $backendPath
    
    # Wait a bit for server to start
    Write-Host "⏳ Waiting 5 seconds for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Check again
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Backend server started successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to start backend server automatically" -ForegroundColor Red
        Write-Host "💡 Please manually run 'npm start' in the backend directory" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter when the server is running to continue..."
    }
    
    Pop-Location
}

Write-Host ""

# Test emergency endpoint connectivity
Write-Host "🧪 Testing emergency endpoint connectivity..." -ForegroundColor Yellow

$testPayload = @{
    latitude = 14.5995
    longitude = 120.9842
    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    userId = "powershell-test-user"
    emergencyContact = "+639485685828"
    accuracy = 10
    testMode = $true
} | ConvertTo-Json

$endpoints = @(
    @{
        url = "http://localhost:3000/api/emergency/location"
        description = "Local development server (localhost)"
    },
    @{
        url = "http://10.0.2.2:3000/api/emergency/location"
        description = "Android emulator route (10.0.2.2)"
    }
)

foreach ($endpoint in $endpoints) {
    Write-Host ""
    Write-Host "📡 Testing: $($endpoint.description)" -ForegroundColor Cyan
    Write-Host "   URL: $($endpoint.url)" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $endpoint.url -Method POST -Body $testPayload -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
        
        Write-Host "   ✅ SUCCESS - Server responded correctly" -ForegroundColor Green
        Write-Host "   📄 Status Code: $($response.StatusCode)" -ForegroundColor Gray
        Write-Host "   📄 Response: $($response.Content)" -ForegroundColor Gray
        
    } catch {
        Write-Host "   ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Message -like "*refused*") {
            Write-Host "   💡 Suggestion: Backend server might not be running on port 3000" -ForegroundColor Yellow
        } elseif ($_.Exception.Message -like "*timeout*") {
            Write-Host "   💡 Suggestion: Server is slow to respond or network issue" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "🔧 Network Configuration Summary:" -ForegroundColor Cyan
Write-Host "─" * 50 -ForegroundColor Gray
Write-Host "• localhost:3000       - Local development & iOS simulator" -ForegroundColor White
Write-Host "• 10.0.2.2:3000       - Android emulator access to host" -ForegroundColor White
Write-Host "• [YOUR_IP]:3000      - Physical device access" -ForegroundColor White

# Get local IP address
Write-Host ""
Write-Host "🌐 Your computer's IP addresses:" -ForegroundColor Cyan
$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -ne "127.0.0.1" }
foreach ($ip in $ips) {
    Write-Host "   $($ip.IPAddress) ($($ip.InterfaceAlias))" -ForegroundColor White
}

Write-Host ""
Write-Host "📱 Mobile App Configuration:" -ForegroundColor Cyan
Write-Host "─" * 50 -ForegroundColor Gray
Write-Host "• For Android Emulator: Use http://10.0.2.2:3000/api/emergency/location" -ForegroundColor Green
Write-Host "• For iOS Simulator: Use http://localhost:3000/api/emergency/location" -ForegroundColor Green
Write-Host "• For Physical Device: Use http://[ONE_OF_THE_IPS_ABOVE]:3000/api/emergency/location" -ForegroundColor Yellow

Write-Host ""
Write-Host "✅ Network connectivity test completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. 🏃 Make sure the backend server is running (npm start)" -ForegroundColor White
Write-Host "2. 📱 Test the emergency button in your mobile app" -ForegroundColor White
Write-Host "3. 📊 Check the backend console for incoming requests" -ForegroundColor White
Write-Host "4. 🔍 Monitor the emergency dashboard at http://localhost:3000/dashboard" -ForegroundColor White

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
