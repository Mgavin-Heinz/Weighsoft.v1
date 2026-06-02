<?php

namespace App\Services;

use App\Models\BusinessPartner;
use App\Models\Product;
use App\Models\XeroSettings;
use Illuminate\Support\Facades\Log;
use XeroAPI\XeroPHP\Api\IdentityApi;
use XeroAPI\XeroPHP\Configuration;

class XeroAuthService
{
    private function getOAuthProvider(): \League\OAuth2\Client\Provider\GenericProvider
    {
        return new \League\OAuth2\Client\Provider\GenericProvider([
            'clientId'                => config('xero.client_id'),
            'clientSecret'            => config('xero.client_secret'),
            'redirectUri'             => config('xero.redirect_uri'),
            'urlAuthorize'            => 'https://login.xero.com/identity/connect/authorize',
            'urlAccessToken'          => 'https://identity.xero.com/connect/token',
            'urlResourceOwnerDetails' => 'https://api.xero.com/api.xro/2.0/Organisation',
        ]);
    }

    public function getAuthorizationUrl(int $companyId): string
    {
        $provider = $this->getOAuthProvider();

        $options = [
            'scope' => implode(' ', config('xero.scopes')),
            'state' => encrypt($companyId),
        ];

        return $provider->getAuthorizationUrl($options);
    }

    public function handleCallback(string $code, string $state): array
    {
        $companyId = decrypt($state);
        $provider = $this->getOAuthProvider();

        $token = $provider->getAccessToken('authorization_code', [
            'code' => $code,
        ]);

        $config = Configuration::getDefaultConfiguration()->setAccessToken($token->getToken());
        $identityApi = new IdentityApi(new \GuzzleHttp\Client(), $config);
        $connections = $identityApi->getConnections();

        if (empty($connections)) {
            throw new \Exception('No Xero tenants returned from OAuth flow.');
        }

        $refreshToken = $token->getRefreshToken();
        if (empty($refreshToken)) {
            Log::warning("Xero OAuth returned NO refresh token for company {$companyId}. Check that 'offline_access' scope is requested.");
        }

        $tenants = [];
        foreach ($connections as $conn) {
            $tenants[] = [
                'tenant_id'   => $conn->getTenantId(),
                'tenant_name' => $conn->getTenantName(),
            ];
        }

        $settings = XeroSettings::updateOrCreate(
            ['company_id' => $companyId],
            [
                'access_token'     => $token->getToken(),
                'refresh_token'    => $refreshToken,
                'token_expires_at' => now()->addSeconds($token->getExpires() - time()),
            ]
        );

        if (count($tenants) === 1) {
            $result = $this->selectTenant($companyId, $tenants[0]['tenant_id'], $tenants[0]['tenant_name']);

            if (!empty($result['requires_strategy'])) {
                // Single tenant but it's a different org -- caller must show strategy page
                $result['tenants']   = $tenants;
                $result['settings']  = $settings->fresh();
                return $result;
            }

            Log::info("Xero connected for company {$companyId}: {$tenants[0]['tenant_name']} (refresh_token present: " . (!empty($refreshToken) ? 'yes' : 'no') . ")");
        } else {
            Log::info("Xero OAuth returned " . count($tenants) . " tenants for company {$companyId}. Awaiting user selection.");
        }

        return [
            'settings'   => $settings->fresh(),
            'tenants'    => $tenants,
            'company_id' => $companyId,
        ];
    }

    /**
     * Attempt to select a Xero tenant for the given company.
     *
     * If the new tenant differs from the currently stored one, this method does NOT
     * commit and instead returns ['requires_strategy' => true, ...counts...] so the
     * caller can present the user with a strategy choice (Reset Links / Keep Links).
     *
     * If this is a first-time connection or the same tenant is being re-authorised,
     * the tenant is committed immediately and ['requires_strategy' => false] is returned.
     */
    public function selectTenant(int $companyId, string $tenantId, string $tenantName): array
    {
        $settings  = XeroSettings::where('company_id', $companyId)->firstOrNew(['company_id' => $companyId]);
        $oldTenant = $settings->xero_tenant_id;
        $oldName   = $settings->organization_name;

        if ($oldTenant && $oldTenant !== $tenantId) {
            // Tenant is changing -- do NOT commit yet, return data for strategy page
            return [
                'requires_strategy' => true,
                'old_name'          => $oldName,
                'new_name'          => $tenantName,
                'tenant_id'         => $tenantId,
                'company_id'        => $companyId,
                'counts'            => $this->getTenantChangeCounts($companyId),
            ];
        }

        // First-time connection or same tenant re-auth: commit immediately
        $settings->fill([
            'xero_tenant_id'          => $tenantId,
            'organization_name'       => $tenantName,
            'previous_xero_tenant_id' => $oldTenant,
        ])->save();

        Log::info("Xero tenant set for company {$companyId}: {$tenantName} ({$tenantId})");

        return ['requires_strategy' => false];
    }

    /**
     * Commit a tenant switch after the user has chosen a strategy.
     * Call clearXeroIds() before this if strategy === 'reset'.
     */
    public function commitTenantSwitch(int $companyId, string $tenantId, string $tenantName): void
    {
        $settings = XeroSettings::where('company_id', $companyId)->firstOrNew(['company_id' => $companyId]);

        $settings->fill([
            'xero_tenant_id'          => $tenantId,
            'organization_name'       => $tenantName,
            'previous_xero_tenant_id' => $settings->xero_tenant_id,
        ])->save();

        Log::info("Xero tenant committed for company {$companyId}: {$tenantName} ({$tenantId})");
    }

    /**
     * Count how many WeighSoft records still carry Xero IDs for this company.
     * Used to populate the tenant-switch strategy page so the user knows the impact.
     */
    public function getTenantChangeCounts(int $companyId): array
    {
        return [
            'bp_count'      => BusinessPartner::where('company_id', $companyId)->whereNotNull('xero_contact_id')->count(),
            'product_count' => Product::where('company_id', $companyId)->whereNotNull('xero_item_id')->count(),
        ];
    }

    /**
     * Clear all Xero link IDs from business partners and products for a company.
     * Called when the user selects the "Reset Links" strategy on tenant switch,
     * or unconditionally on Disconnect.
     */
    public function clearXeroIds(int $companyId): void
    {
        BusinessPartner::where('company_id', $companyId)
            ->update(['xero_contact_id' => null, 'xero_synced_at' => null]);

        Product::where('company_id', $companyId)
            ->update(['xero_item_id' => null, 'xero_synced_at' => null]);

        Log::info("Xero IDs cleared for all business partners and products in company {$companyId}.");
    }

    public function refreshAccessToken(XeroSettings $settings): XeroSettings
    {
        $provider = $this->getOAuthProvider();

        try {
            $newToken = $provider->getAccessToken('refresh_token', [
                'refresh_token' => $settings->refresh_token,
            ]);

            $settings->update([
                'access_token'     => $newToken->getToken(),
                'refresh_token'    => $newToken->getRefreshToken(),
                'token_expires_at' => now()->addSeconds($newToken->getExpires() - time()),
            ]);

            return $settings->fresh();
        } catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {
            Log::warning("Xero refresh token expired for company {$settings->company_id}: {$e->getMessage()}");

            $settings->update([
                'access_token'      => null,
                'refresh_token'     => null,
                'token_expires_at'  => null,
                'xero_tenant_id'    => null,
                'organization_name' => null,
            ]);

            throw new \Exception('Xero session expired. Please reconnect.', 401, $e);
        }
    }

    public function getApiInstance(int $companyId): \XeroAPI\XeroPHP\Api\AccountingApi
    {
        $settings = XeroSettings::where('company_id', $companyId)->first();

        if (!$settings || !$settings->isConnected()) {
            throw new \Exception('Xero is not connected for this company.');
        }

        if ($settings->isTokenExpired()) {
            Log::info("Xero access token expired for company {$companyId}, refreshing.");
            $settings = $this->refreshAccessToken($settings);
        }

        $config = Configuration::getDefaultConfiguration()->setAccessToken($settings->access_token);

        return new \XeroAPI\XeroPHP\Api\AccountingApi(new \GuzzleHttp\Client(), $config);
    }

    public function getTenantId(int $companyId): string
    {
        $settings = XeroSettings::where('company_id', $companyId)->first();

        if (!$settings || !$settings->xero_tenant_id) {
            throw new \Exception('Xero tenant not configured for this company.');
        }

        return $settings->xero_tenant_id;
    }

    public function disconnect(int $companyId): void
    {
        $settings = XeroSettings::where('company_id', $companyId)->first();

        if ($settings) {
            $oldTenant = $settings->xero_tenant_id;

            $settings->update([
                'access_token'            => null,
                'refresh_token'           => null,
                'token_expires_at'        => null,
                'xero_tenant_id'          => null,
                'organization_name'       => null,
                'previous_xero_tenant_id' => $oldTenant,
            ]);

            // Always clear stale IDs on disconnect -- user made an explicit choice to disconnect
            $this->clearXeroIds($companyId);

            Log::info("Xero disconnected for company {$companyId} (was tenant: {$oldTenant}). All Xero link IDs cleared.");
        }
    }
}
