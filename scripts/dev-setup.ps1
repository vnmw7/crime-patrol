# mobile-dev-setup.ps1
# Script to setup Mobile development environment
# Created on: March 23, 2025

Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

choco install -y microsoft-openjdk17

# Set execution policy for this process only
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Install Android Studio
Write-Host "Installing Android Studio..." -ForegroundColor Yellow

# Create a directory for downloads if it doesn't exist
$downloadDir = "$env:TEMP\android-studio-setup"
New-Item -ItemType Directory -Force -Path $downloadDir | Out-Null

# Download Android Studio
$androidStudioUrl = "https://redirector.gvt1.com/edgedl/android/studio/install/2022.3.1.20/android-studio-2022.3.1.20-windows.exe"
$installerPath = "$downloadDir\android-studio-installer.exe"
Write-Host "Downloading Android Studio installer..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $androidStudioUrl -OutFile $installerPath

# Install Android Studio silently
Write-Host "Running Android Studio installer..." -ForegroundColor Yellow
Start-Process -FilePath $installerPath -ArgumentList "/S" -Wait

# Set environment variables
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "%LOCALAPPDATA%\Android\Sdk", "User")

# Add platform-tools to Path
$envPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
$platformToolsPath = "%LOCALAPPDATA%\Android\Sdk\platform-tools"
if (-not $envPath.Contains($platformToolsPath)) {
    [System.Environment]::SetEnvironmentVariable("Path", "$envPath;$platformToolsPath", "User")
}

# Navigate to the Mobile directory from the project root
Set-Location -Path $PSScriptRoot\..
Set-Location -Path .\Mobile

Write-Host "Starting Mobile development setup..." -ForegroundColor Green

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Mobile development setup completed!" -ForegroundColor Green