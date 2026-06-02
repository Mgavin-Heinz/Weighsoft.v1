<?php

namespace App\Http\Controllers;

use App\Models\XeroSettings;
use App\Services\XeroAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class XeroCallbackController extends Controller
{
    public function callback(Request $request)
    {
        try {
            $authService = app(XeroAuthService::class);
            $result = $authService->handleCallback(
                $request->get('code'),
                $request->get('state')
            );

            $tenants = $result['tenants'];

            // Single tenant that requires a strategy choice (tenant is changing)
            if (!empty($result['requires_strategy'])) {
                return response(
                    $this->buildTenantSwitchStrategyPage(
                        $result['old_name'],
                        $result['new_name'],
                        $result['tenant_id'],
                        $result['company_id'],
                        $result['counts']
                    ),
                    200
                )->header('Content-Type', 'text/html');
            }

            // Single tenant, same org or first connection -- already committed
            if (count($tenants) === 1) {
                return response($this->buildClosePopupPage('Connected to ' . e($tenants[0]['tenant_name'])), 200)
                    ->header('Content-Type', 'text/html');
            }

            // Multiple tenants -- let user choose
            return response($this->buildTenantSelectionPage($tenants, $result['company_id']), 200)
                ->header('Content-Type', 'text/html');
        } catch (\Exception $e) {
            Log::error("Xero callback failed: {$e->getMessage()}");
            return response(
                '<html><body><script>window.close();</script><p>Xero connection failed: ' . e($e->getMessage()) . '</p></body></html>',
                200
            )->header('Content-Type', 'text/html');
        }
    }

    /**
     * Called when the user picks an organisation from the multi-tenant selection page.
     * If the selected tenant differs from the current one, we show the strategy page
     * instead of committing immediately.
     */
    public function selectTenant(Request $request)
    {
        try {
            $companyId  = $request->input('company_id');
            $tenantId   = $request->input('tenant_id');
            $tenantName = $request->input('tenant_name');

            if (!$companyId || !$tenantId || !$tenantName) {
                throw new \Exception('Missing required fields.');
            }

            $authService = app(XeroAuthService::class);
            $result = $authService->selectTenant((int) $companyId, $tenantId, $tenantName);

            if (!empty($result['requires_strategy'])) {
                return response(
                    $this->buildTenantSwitchStrategyPage(
                        $result['old_name'],
                        $result['new_name'],
                        $result['tenant_id'],
                        $result['company_id'],
                        $result['counts']
                    ),
                    200
                )->header('Content-Type', 'text/html');
            }

            return response($this->buildClosePopupPage('Connected to ' . e($tenantName)), 200)
                ->header('Content-Type', 'text/html');
        } catch (\Exception $e) {
            Log::error("Xero tenant selection failed: {$e->getMessage()}");
            return response(
                '<html><body><p style="color:red;">Failed to select tenant: ' . e($e->getMessage()) . '</p></body></html>',
                200
            )->header('Content-Type', 'text/html');
        }
    }

    /**
     * Handles the strategy form submission from the tenant-switch strategy page.
     * strategy=reset  -> clear all Xero IDs first, then commit
     * strategy=keep   -> commit only, existing IDs are untouched
     */
    public function confirmTenantSwitch(Request $request)
    {
        try {
            $companyId  = (int) $request->input('company_id');
            $tenantId   = $request->input('tenant_id');
            $tenantName = $request->input('tenant_name');
            $strategy   = $request->input('strategy'); // 'reset' or 'keep'

            if (!$companyId || !$tenantId || !$tenantName || !in_array($strategy, ['reset', 'keep'])) {
                throw new \Exception('Missing or invalid fields.');
            }

            $authService = app(XeroAuthService::class);

            if ($strategy === 'reset') {
                $authService->clearXeroIds($companyId);
                Log::info("Tenant switch strategy=reset applied for company {$companyId}.");
            } else {
                Log::info("Tenant switch strategy=keep applied for company {$companyId}. Existing Xero IDs retained.");
            }

            $authService->commitTenantSwitch($companyId, $tenantId, $tenantName);

            return response($this->buildClosePopupPage('Connected to ' . e($tenantName)), 200)
                ->header('Content-Type', 'text/html');
        } catch (\Exception $e) {
            Log::error("Xero confirm tenant switch failed: {$e->getMessage()}");
            return response(
                '<html><body><p style="color:red;">Failed to switch tenant: ' . e($e->getMessage()) . '</p></body></html>',
                200
            )->header('Content-Type', 'text/html');
        }
    }

    // -------------------------------------------------------------------------
    // Private HTML builders
    // -------------------------------------------------------------------------

    private function buildTenantSelectionPage(array $tenants, int $companyId): string
    {
        $baseUrl = '/api/xero/select-tenant';
        $rows = '';

        foreach ($tenants as $tenant) {
            $tenantId   = e($tenant['tenant_id']);
            $tenantName = e($tenant['tenant_name']);
            $rows .= <<<ROW
                <tr>
                    <td style="padding:12px 16px;border-bottom:1px solid #e0e0e0;">{$tenantName}</td>
                    <td style="padding:12px 16px;border-bottom:1px solid #e0e0e0;text-align:right;">
                        <form method="POST" action="{$baseUrl}" style="margin:0;">
                            <input type="hidden" name="company_id" value="{$companyId}">
                            <input type="hidden" name="tenant_id" value="{$tenantId}">
                            <input type="hidden" name="tenant_name" value="{$tenantName}">
                            <button type="submit" style="
                                background:#c0392b;color:#fff;border:none;padding:8px 20px;
                                border-radius:4px;cursor:pointer;font-size:14px;
                            ">Select</button>
                        </form>
                    </td>
                </tr>
ROW;
        }

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Select Xero Organisation</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:30px;background:#f5f5f5;">
    <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;">
        <div style="background:#c0392b;color:#fff;padding:20px;text-align:center;">
            <h2 style="margin:0;font-size:18px;">Select Xero Organisation</h2>
            <p style="margin:8px 0 0;font-size:13px;opacity:0.9;">Your Xero account has access to multiple organisations. Please select which one to connect to WeighSoft.</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
            {$rows}
        </table>
        <div style="padding:16px;text-align:center;">
            <button onclick="window.close();" style="
                background:#888;color:#fff;border:none;padding:8px 20px;
                border-radius:4px;cursor:pointer;font-size:13px;
            ">Cancel</button>
        </div>
    </div>
</body>
</html>
HTML;
    }

    private function buildTenantSwitchStrategyPage(
        ?string $oldName,
        string  $newName,
        string  $tenantId,
        int     $companyId,
        array   $counts
    ): string {
        $baseUrl     = '/api/xero/confirm-tenant-switch';
        $oldNameSafe = e($oldName ?? 'previous organisation');
        $newNameSafe = e($newName);
        $tenantIdSafe = e($tenantId);
        $bpCount     = (int) ($counts['bp_count'] ?? 0);
        $prodCount   = (int) ($counts['product_count'] ?? 0);

        $impactLine = '';
        if ($bpCount > 0 || $prodCount > 0) {
            $parts = [];
            if ($bpCount > 0) {
                $parts[] = "<strong>{$bpCount} business partner</strong> " . ($bpCount === 1 ? 'link' : 'links');
            }
            if ($prodCount > 0) {
                $parts[] = "<strong>{$prodCount} product</strong> " . ($prodCount === 1 ? 'link' : 'links');
            }
            $impactLine = '<p style="margin:0 0 16px;color:#555;font-size:14px;">This company has ' . implode(' and ', $parts) . ' mapped to the old organisation.</p>';
        }

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Switching Xero Organisation</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:30px;background:#f5f5f5;">
    <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.12);overflow:hidden;">

        <!-- Header -->
        <div style="background:#c0392b;color:#fff;padding:20px;text-align:center;">
            <h2 style="margin:0;font-size:18px;">Switching Xero Organisation</h2>
        </div>

        <!-- From / To -->
        <div style="padding:20px 24px 4px;border-bottom:1px solid #eee;">
            <table style="width:100%;font-size:14px;border-collapse:collapse;">
                <tr>
                    <td style="padding:4px 8px 4px 0;color:#888;width:50px;">From:</td>
                    <td style="padding:4px 0;color:#333;font-weight:600;">{$oldNameSafe}</td>
                </tr>
                <tr>
                    <td style="padding:4px 8px 4px 0;color:#888;">To:</td>
                    <td style="padding:4px 0;color:#c0392b;font-weight:600;">{$newNameSafe}</td>
                </tr>
            </table>
        </div>

        <!-- Impact warning -->
        <div style="padding:16px 24px 0;">
            {$impactLine}
            <p style="margin:0 0 20px;color:#555;font-size:14px;">Choose how to handle existing Xero links:</p>
        </div>

        <!-- Option 1: Reset Links -->
        <div style="margin:0 16px 12px;border:2px solid #27ae60;border-radius:6px;overflow:hidden;">
            <div style="background:#f0faf4;padding:12px 16px 8px;">
                <p style="margin:0 0 4px;font-weight:700;font-size:14px;color:#1e8449;">Reset Links &mdash; Recommended</p>
                <p style="margin:0 0 10px;font-size:13px;color:#555;">WeighSoft data is kept. Xero link IDs are cleared. The next sync will re-match records by name, or create new records in <em>{$newNameSafe}</em>.</p>
            </div>
            <form method="POST" action="{$baseUrl}" style="margin:0;">
                <input type="hidden" name="company_id" value="{$companyId}">
                <input type="hidden" name="tenant_id" value="{$tenantIdSafe}">
                <input type="hidden" name="tenant_name" value="{$newNameSafe}">
                <input type="hidden" name="strategy" value="reset">
                <div style="padding:8px 16px 12px;background:#f0faf4;">
                    <button type="submit" style="
                        background:#27ae60;color:#fff;border:none;padding:9px 24px;
                        border-radius:4px;cursor:pointer;font-size:14px;font-weight:600;width:100%;
                    ">Reset Links and Connect to {$newNameSafe}</button>
                </div>
            </form>
        </div>

        <!-- Option 2: Keep Links -->
        <div style="margin:0 16px 12px;border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;">
            <div style="padding:12px 16px 8px;">
                <p style="margin:0 0 4px;font-weight:700;font-size:14px;color:#555;">Keep Existing Links</p>
                <p style="margin:0 0 4px;font-size:13px;color:#555;">No data is changed. Only use this if you are re-authorising the same organisation after a token refresh.</p>
                <p style="margin:0 0 10px;font-size:12px;color:#e67e22;font-weight:600;">Warning: if this is a different organisation, syncs may fail or create duplicate records.</p>
            </div>
            <form method="POST" action="{$baseUrl}" style="margin:0;">
                <input type="hidden" name="company_id" value="{$companyId}">
                <input type="hidden" name="tenant_id" value="{$tenantIdSafe}">
                <input type="hidden" name="tenant_name" value="{$newNameSafe}">
                <input type="hidden" name="strategy" value="keep">
                <div style="padding:8px 16px 12px;">
                    <button type="submit" style="
                        background:#888;color:#fff;border:none;padding:9px 24px;
                        border-radius:4px;cursor:pointer;font-size:13px;width:100%;
                    ">Keep Existing Links and Connect</button>
                </div>
            </form>
        </div>

        <!-- Cancel -->
        <div style="padding:4px 16px 20px;text-align:center;">
            <button onclick="window.close();" style="
                background:none;color:#888;border:1px solid #ccc;padding:8px 24px;
                border-radius:4px;cursor:pointer;font-size:13px;
            ">Cancel &mdash; Keep Current Connection</button>
        </div>

    </div>
</body>
</html>
HTML;
    }

    private function buildClosePopupPage(string $message): string
    {
        $messageSafe = e($message);
        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Connected</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:30px;background:#f5f5f5;text-align:center;">
    <div style="max-width:400px;margin:40px auto;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);padding:30px;">
        <div style="color:#27ae60;font-size:40px;margin-bottom:12px;">&#10003;</div>
        <p style="margin:0 0 16px;font-size:15px;color:#333;">{$messageSafe}</p>
        <p style="margin:0;font-size:13px;color:#888;">This window will close automatically&hellip;</p>
    </div>
    <script>window.close();</script>
</body>
</html>
HTML;
    }
}
