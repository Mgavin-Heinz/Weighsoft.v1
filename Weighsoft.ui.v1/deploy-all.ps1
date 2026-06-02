# Simple Deploy Script for Weighsoft
# Set $buildBackend and $buildFrontend to control what gets built

$ErrorActionPreference = "Stop"

# ============================================
# CONFIGURE THESE:
# ============================================
$buildBackend = 1   # Set to 1 to build backend, 0 to skip
$buildFrontend = 1  # Set to 1 to build frontend, 0 to skip
# ============================================

function Write-ErrorAndExit {
    param(
        [string]$Message,
        [string]$Details = ""
    )
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Red
    Write-Host "  ERROR: $Message" -ForegroundColor Red
    if ($Details) {
        Write-Host "  $Details" -ForegroundColor Red
    }
    Write-Host "==================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Deployment ABORTED!" -ForegroundColor Red
    exit 1
}

function Test-CommandSuccess {
    param(
        [string]$CommandName
    )
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorAndExit "$CommandName failed" "Exit code: $LASTEXITCODE"
    }
}

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Weighsoft Deploy" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = "$PSScriptRoot\..\Weighsoft.back.v1"
$frontendPath = "$PSScriptRoot"

try {
    # Build Backend
    if ($buildBackend -eq 1) {
        Write-Host "[1/3] Building Backend..." -ForegroundColor Yellow
        
        if (-not (Test-Path $backendPath)) {
            Write-ErrorAndExit "Backend path not found" "$backendPath"
        }
        
        if (-not (Test-Path "$backendPath\build.bat")) {
            Write-ErrorAndExit "Backend build.bat not found" "$backendPath\build.bat"
        }
        
        Push-Location $backendPath
        try {
            & .\build.bat
            Test-CommandSuccess "Backend build"
            Write-Host "  Backend build SUCCESS" -ForegroundColor Green
            Write-Host ""
        }
        finally {
            Pop-Location
        }
    } else {
        Write-Host "[1/3] Skipping Backend build" -ForegroundColor Gray
        Write-Host ""
    }

    # Build Frontend
    if ($buildFrontend -eq 1) {
        Write-Host "[2/3] Building Frontend..." -ForegroundColor Yellow
        
        if (-not (Test-Path "$frontendPath\build.bat")) {
            Write-ErrorAndExit "Frontend build.bat not found" "$frontendPath\build.bat"
        }
        
        Push-Location $frontendPath
        try {
            & .\build.bat
            Test-CommandSuccess "Frontend build"
            Write-Host "  Frontend build SUCCESS" -ForegroundColor Green
            Write-Host ""
        }
        finally {
            Pop-Location
        }
    } else {
        Write-Host "[2/3] Skipping Frontend build" -ForegroundColor Gray
        Write-Host ""
    }

    # Deploy
    Write-Host "[3/3] Deploying..." -ForegroundColor Yellow
    
    if (-not (Test-Path "$frontendPath\deploy.ps1")) {
        Write-ErrorAndExit "Deploy script not found" "$frontendPath\deploy.ps1"
    }
    
    Push-Location $frontendPath
    try {
        & .\deploy.ps1
        Test-CommandSuccess "Deployment"
        Write-Host "  Deployment SUCCESS" -ForegroundColor Green
        Write-Host ""
    }
    finally {
        Pop-Location
    }

    # Success!
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "  DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Red
    Write-Host "  UNEXPECTED ERROR" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "==================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Deployment ABORTED!" -ForegroundColor Red
    exit 1
}

