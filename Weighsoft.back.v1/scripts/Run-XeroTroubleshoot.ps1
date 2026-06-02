# Xero Connect 404 - Troubleshooting Script (PowerShell)
# Runs diagnostic steps on the deployment server via SSH
# Usage: .\Run-XeroTroubleshoot.ps1
# Or with custom server: $env:WEIGHSOFT_SSH_TARGET = "user@host"; .\Run-XeroTroubleshoot.ps1

$ErrorActionPreference = "Stop"
$sshKey = "$env:USERPROFILE\.ssh\weighsoft_deploy"
$sshTarget = if ($env:WEIGHSOFT_SSH_TARGET) { $env:WEIGHSOFT_SSH_TARGET } else { "pi@100.72.251.104" }
$container = "weighsoftv1-back"

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "Xero Connect 404 - Troubleshooting" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "Target: $sshTarget" -ForegroundColor Gray
Write-Host ""

if (-not (Test-Path $sshKey)) {
    Write-Host "ERROR: SSH key not found at $sshKey" -ForegroundColor Red
    Write-Host "Set WEIGHSOFT_SSH_TARGET for custom server (e.g. user@host)" -ForegroundColor Yellow
    exit 1
}

# Step 1: Run route list
Write-Host "--- Step 1: Verify Xero routes are registered ---" -ForegroundColor Yellow
ssh -i $sshKey $sshTarget "sudo docker exec $container php artisan route:list --path=xero"
Write-Host ""

# Step 2: Clear caches
Write-Host "--- Step 2: Clear Laravel caches ---" -ForegroundColor Yellow
ssh -i $sshKey $sshTarget "sudo docker exec $container php artisan optimize:clear"
Write-Host "Caches cleared." -ForegroundColor Green
Write-Host ""

# Step 3: Test connect endpoint instructions
Write-Host "--- Step 3: Test connect endpoint ---" -ForegroundColor Yellow
Write-Host "To test manually (replace YOUR_JWT_TOKEN with token from browser localStorage):" -ForegroundColor Gray
Write-Host '  curl -k "https://thelab/api/xero/connect/21?token=YOUR_JWT_TOKEN"' -ForegroundColor Gray
Write-Host ""
Write-Host "Expected: 200 + auth_url = OK | 404 = route not found | 401 = auth issue" -ForegroundColor Gray
Write-Host ""

# Step 4: Check backend logs
Write-Host "--- Step 4: Recent backend logs ---" -ForegroundColor Yellow
ssh -i $sshKey $sshTarget "sudo docker logs $container --tail=50"
Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "Troubleshooting complete. Try Connect button again." -ForegroundColor Green
Write-Host "If 404 persists, rebuild and redeploy the backend." -ForegroundColor Gray
Write-Host "==============================================" -ForegroundColor Cyan
