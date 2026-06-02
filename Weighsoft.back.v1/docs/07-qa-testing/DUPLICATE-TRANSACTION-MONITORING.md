# Duplicate Transaction ID Monitoring

## Overview

After implementing the fix for duplicate transaction IDs, monitoring has been added to track transaction number generation and identify any remaining issues.

## Logging

### Transaction Counter Increment Logging

**Location:** `WeighingHeadersController::store()`

**Logs:**
1. **Before increment:** Logs current_id before incrementing
2. **After increment:** Logs success/failure of counter save
3. **Transaction generation:** Logs the generated transaction number
4. **Header creation:** Logs successful header creation or errors

**Log Levels:**
- `Log::info()` - Normal operation (counter increment, transaction generation, header creation)
- `Log::error()` - Critical failures (counter save fails, header creation fails after counter increment)

### Example Log Entries

**Successful flow:**
```
[INFO] Transaction counter increment attempt: company_id=12, site_id=20, settings_id=20, current_id_before=11947, current_id_after=11948
[INFO] Transaction number generated: transaction=JF11948, current_id_used=11948, prefix=JF
[INFO] Weighing header created successfully: weighing_header_id=xxx, transaction=JF11948
```

**Failure scenario:**
```
[ERROR] CRITICAL: Failed to increment transaction counter: company_id=12, site_id=20, settings_id=20, current_id=11948
```

**Header creation failure (after counter increment):**
```
[ERROR] CRITICAL: Weighing header creation failed after counter increment: transaction=JF11948, current_id=11948, error=...
```

## Monitoring Commands

### Find Duplicate Transactions

**Artisan Command:**
```bash
php artisan transactions:find-duplicates
```

**Options:**
- `--limit=100` - Limit number of results (default: 100)
- `--export` - Export results to CSV file

**Example:**
```bash
# Find top 50 duplicates
php artisan transactions:find-duplicates --limit=50

# Export all duplicates to CSV
php artisan transactions:find-duplicates --export
```

**Output:**
- Lists duplicate transaction numbers
- Shows count, timestamps, and header IDs
- Provides summary statistics

### SQL Queries

**Location:** `database/scripts/`

1. **`identify-duplicate-transactions.sql`**
   - Find all duplicate transaction numbers
   - Summary statistics
   - Duplicates by settings

2. **`analyze-duplicate-transactions.sql`**
   - Detailed duplicate analysis
   - Duplicates created within same minute
   - Status and deletion analysis

## Monitoring Checklist

### Daily Monitoring

- [ ] Check application logs for counter increment failures
- [ ] Check for header creation failures after counter increment
- [ ] Run `transactions:find-duplicates` to check for new duplicates

### Weekly Monitoring

- [ ] Review log patterns for any anomalies
- [ ] Check if duplicate count is decreasing (should be zero after fix)
- [ ] Analyze any remaining duplicates to understand root cause

### Monthly Monitoring

- [ ] Run full duplicate analysis SQL queries
- [ ] Review transaction counter values vs actual transaction numbers
- [ ] Check for any gaps in transaction numbering

## Log Analysis

### Search Logs for Issues

**Find counter increment failures:**
```bash
grep "CRITICAL: Failed to increment transaction counter" storage/logs/laravel.log
```

**Find header creation failures:**
```bash
grep "CRITICAL: Weighing header creation failed after counter increment" storage/logs/laravel.log
```

**Find all transaction-related errors:**
```bash
grep -i "transaction.*error\|error.*transaction" storage/logs/laravel.log
```

### Log Retention

- Keep logs for at least 30 days
- Archive logs older than 30 days
- Monitor log file size to prevent disk space issues

## Expected Behavior After Fix

### Before Fix
- Duplicates occurred when counter save failed after header creation
- No error handling or logging
- Duplicates accumulated over time

### After Fix
- Counter is incremented BEFORE header creation
- If counter save fails, request fails with clear error message
- No duplicates should occur (counter is reserved before use)
- Any gaps in numbering are acceptable (better than duplicates)

### Success Metrics

- **Zero new duplicates** after fix deployment
- **Counter increment failures** should be logged and investigated
- **Header creation failures** after counter increment should be rare (indicates database issues)

## Troubleshooting

### If Counter Increment Fails

**Symptoms:**
- Error log: "CRITICAL: Failed to increment transaction counter"
- User sees error: "Failed to reserve transaction number"

**Possible Causes:**
1. Database connection issues
2. Transaction record locked
3. Database constraint violation
4. Disk space issues

**Actions:**
1. Check database connectivity
2. Check database logs
3. Verify transaction record exists
4. Check disk space

### If Header Creation Fails After Counter Increment

**Symptoms:**
- Error log: "CRITICAL: Weighing header creation failed after counter increment"
- Counter is incremented but no header exists

**Impact:**
- Transaction number is "used" (gap in numbering)
- No duplicate will occur (counter already incremented)
- User sees error, can retry

**Actions:**
1. Investigate header creation failure
2. Check database constraints
3. Verify data validity
4. Consider manual cleanup if needed

## Cleanup of Existing Duplicates

### Identifying Duplicates

Use the provided SQL scripts or Artisan command to identify existing duplicates.

### Handling Duplicates

**Options:**
1. **Mark duplicates:** Add a flag to identify which is the "primary" record
2. **Delete duplicates:** Remove duplicate records (risky - need to verify which is correct)
3. **Rename duplicates:** Change transaction numbers of duplicates (requires business logic)
4. **Leave as-is:** If duplicates don't cause business issues, leave them

**Recommendation:**
- Review duplicates with business users
- Determine which records are valid
- Create cleanup script based on business rules
- Test cleanup script on staging first

## Related Documentation

- **[DUPLICATE-TRANSACTION-ID-ANALYSIS.md](./DUPLICATE-TRANSACTION-ID-ANALYSIS.md)** - Root cause analysis
- **[VERIFICATION-RESULTS-ANALYSIS.md](./VERIFICATION-RESULTS-ANALYSIS.md)** - Verification results
- **[DUPLICATE-TRANSACTION-ID-VERIFICATION.md](./DUPLICATE-TRANSACTION-ID-VERIFICATION.md)** - Verification process

