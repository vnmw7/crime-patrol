# mobile-dev-setup.ps1
# Script to setup Mobile development environment
# Created on: March 23, 2025

# Navigate to the Mobile directory from the project root
Set-Location -Path $PSScriptRoot\..
Set-Location -Path .\Mobile

Write-Host "Starting Mobile development setup..." -ForegroundColor Green

# Clean prebuild
Write-Host "Cleaning prebuild..." -ForegroundColor Yellow
npx expo prebuild --clean

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Mobile development setup completed!" -ForegroundColor Green