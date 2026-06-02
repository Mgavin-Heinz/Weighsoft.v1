#!/bin/bash
# Xero Connect 404 - Troubleshooting Script
# Run this on the deployment server (e.g. via SSH: bash xero-connect-troubleshoot.sh)
# Requires: Docker, curl (for step 3)

set -e

CONTAINER="${WEIGHSOFT_BACK_CONTAINER:-weighsoftv1-back}"
HOSTNAME="${WEIGHSOFT_HOST:-thelab}"
COMPANY_ID="${COMPANY_ID:-21}"

echo "=============================================="
echo "Xero Connect 404 - Troubleshooting"
echo "=============================================="
echo "Container: $CONTAINER"
echo "Host: $HOSTNAME"
echo "Company ID: $COMPANY_ID"
echo ""

# Step 1: Run route list
echo "--- Step 1: Verify Xero routes are registered ---"
if docker exec "$CONTAINER" php artisan route:list --path=xero 2>/dev/null; then
    echo ""
    echo "Routes found. If empty above, run: docker exec $CONTAINER php artisan route:clear"
else
    echo "ERROR: Could not run route:list. Is the container running?"
    echo "  Check: docker ps | grep $CONTAINER"
    exit 1
fi

# Step 2: Clear caches
echo ""
echo "--- Step 2: Clear Laravel caches ---"
docker exec "$CONTAINER" php artisan optimize:clear
echo "Caches cleared."

# Step 3: Test connect endpoint (requires JWT token)
echo ""
echo "--- Step 3: Test connect endpoint ---"
echo "To test manually, run (replace YOUR_JWT_TOKEN with a valid token):"
echo "  curl -k \"https://$HOSTNAME/api/xero/connect/$COMPANY_ID?token=YOUR_JWT_TOKEN\""
echo ""
echo "Expected responses:"
echo "  - 200 + JSON with auth_url -> route works"
echo "  - 404 -> route not found (cache or deployment issue)"
echo "  - 401 -> auth problem, not routing"
echo ""

# Step 4: Check backend logs
echo "--- Step 4: Recent backend logs ---"
docker logs "$CONTAINER" --tail=50 2>&1

echo ""
echo "=============================================="
echo "Troubleshooting complete."
echo "If 404 persists, rebuild and redeploy the backend image."
echo "=============================================="
