# Database Tables

| Table | Engine | Rows | Collation | Notes |
|---|---|---|---|---|
| `axelsetups` | MyISAM | 3 | utf8_unicode_ci | Axle configuration setups per company |
| `axletypes` | MyISAM | 4 | utf8_unicode_ci | Axle type weight limits per company |
| `businesspartners` | InnoDB | 564 | utf8_unicode_ci | Customers / suppliers. SoftDeletes. Xero contact sync |
| `cameras` | InnoDB | 11 | utf8_unicode_ci | IP cameras per workstation/weighbridge. SoftDeletes |
| `companies` | InnoDB | 9 | utf8_unicode_ci | Top-level tenants. SoftDeletes |
| `contracts` | InnoDB | 145 | latin1_swedish_ci | Tonnage contracts linked to business partner + product. SoftDeletes |
| `contract_transactions` | InnoDB | 1,952 | latin1_swedish_ci | Weighing transactions consumed against a contract. UUID PK. SoftDeletes |
| `errorlog` | InnoDB | 0 | utf8_bin | Scale / device errors per workstation |
| `exceptions` | InnoDB | 701 | utf8_bin | Weighing exceptions per workstation |
| `grades` | InnoDB | 4 | utf8_unicode_ci | Product grade classifications per company |
| `hauliers` | InnoDB | 715 | utf8_unicode_ci | Transport companies. SoftDeletes. Links to business partner |
| `migrations` | InnoDB | 44 | utf8_unicode_ci | Laravel migration tracking (do not edit manually) |
| `pallets` | InnoDB | 4 | utf8_unicode_ci | Pallet types with charge amounts. PK = `pallet_id` |
| `products` | InnoDB | 184 | utf8_unicode_ci | Products with purchase/sale price. SoftDeletes. Xero item sync |
| `reporting` | InnoDB | 12 | latin1_swedish_ci | Saved report definitions (JSON filters). SoftDeletes |
| `rfid_vehicles` | InnoDB | 4 | utf8_unicode_ci | RFID-tagged vehicles linked to hauliers (Smart Hauliers) |
| `settings` | MyISAM | 11 | utf8_unicode_ci | Weighing configuration per company (20 custom fields, feature flags) |
| `sites` | InnoDB | 12 | utf8_unicode_ci | Sites under a company. SoftDeletes |
| `tares` | InnoDB | 0 | utf8_unicode_ci | Stored tare weights per registration number |
| `transactions` | InnoDB | 19 | utf8_bin | Sequential transaction number counter per settings/site |
| `users` | InnoDB | 12 | utf8_unicode_ci | System users with JWT auth and fingerprint |
| `usertypes` | InnoDB | 7 | utf8_unicode_ci | Role definitions with per-module permission flags |
| `weighbridges` | InnoDB | 13 | utf8_unicode_ci | Physical scales / weighbridges. SoftDeletes |
| `weighingcameras` | InnoDB | 0 | latin1_swedish_ci | Camera snapshots (base64) linked to weighing transactions |
| `weighingcameras_old` | InnoDB | 0 | latin1_swedish_ci | Legacy camera snapshot table (deprecated, do not use) |
| `weighingheaders` | InnoDB | 20,702 | utf8_unicode_ci | **Core table.** One record per weighing. UUID PK (BINARY 16). SoftDeletes |
| `weighingtransactions` | InnoDB | 40,777 | utf8_unicode_ci | Individual axle weight readings per weighing. UUID PK (BINARY 16) |
| `workstations` | InnoDB | 17 | utf8_unicode_ci | Operator workstations with boom/light relay IPs. SoftDeletes |

## Xero Integration Tables
> Created by `database_scripts/12-addXeroIntegration.sql`. Not present until that script is run.

| Table | Notes |
|---|---|
| `xero_settings` | Xero OAuth tokens (encrypted), sync directions, per company |
| `xero_invoice_queue` | Invoice queue with retry logic and status tracking |
| `xero_sync_log` | Audit log of sync operations (no timestamps column) |
