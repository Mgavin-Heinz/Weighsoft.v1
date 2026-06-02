# PowerShell Deployment Script for Weighsoft
# This script automates the deployment process using SSH key authentication

Write-Host "Starting Weighsoft deployment..." -ForegroundColor Green

# SSH key authentication
$sshKey = "$env:USERPROFILE\.ssh\weighsoft_deploy"

if (Test-Path $sshKey) {
    Write-Host "Using SSH key authentication..." -ForegroundColor Green
    
    # Pull and restart containers
    Write-Host "[1/4] Pulling and restarting containers..." -ForegroundColor Cyan
    ssh -i $sshKey pi@100.72.251.104 "cd ~/weighsoft && sudo docker compose pull && sudo docker compose up -d"
    
    # Clear Laravel caches
    Write-Host "[2/4] Clearing Laravel caches..." -ForegroundColor Cyan
    ssh -i $sshKey pi@100.72.251.104 "sudo docker exec weighsoftv1-back php artisan optimize:clear"

    # Restart proxy so Nginx re-resolves container DNS after recreate
    Write-Host "[3/4] Restarting proxy..." -ForegroundColor Cyan
    ssh -i $sshKey pi@100.72.251.104 "cd ~/weighsoft && sudo docker compose restart proxy"

    Write-Host "[4/4] Verifying routes..." -ForegroundColor Cyan
    ssh -i $sshKey pi@100.72.251.104 "sudo docker exec weighsoftv1-back php artisan route:list --path=xero --columns=method,uri 2>/dev/null | head -20"

    Write-Host "Deployment completed successfully!" -ForegroundColor Green
} else {
    Write-Host "SSH key not found at $sshKey" -ForegroundColor Red
    Write-Host "Please run the SSH setup commands first." -ForegroundColor Yellow
    exit 1
}
