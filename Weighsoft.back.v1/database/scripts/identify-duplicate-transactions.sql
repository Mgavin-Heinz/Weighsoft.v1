-- Script to Identify Duplicate Transaction Numbers
-- Run this to find all duplicate transaction numbers in the database

-- Find all duplicate transaction numbers
SELECT 
    transaction,
    COUNT(*) as duplicate_count,
    GROUP_CONCAT(BIN_TO_UUID(id, TRUE) ORDER BY created_at) as weighing_header_ids,
    GROUP_CONCAT(created_at ORDER BY created_at) as created_dates,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created,
    TIMESTAMPDIFF(SECOND, MIN(created_at), MAX(created_at)) as seconds_between_duplicates
FROM weighingheaders
WHERE transaction IS NOT NULL
    AND transaction != ''
GROUP BY transaction
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, transaction;

-- Summary statistics
SELECT 
    COUNT(DISTINCT transaction) as total_duplicate_transaction_numbers,
    SUM(duplicate_count - 1) as total_duplicate_headers,
    AVG(duplicate_count) as avg_duplicates_per_number,
    MAX(duplicate_count) as max_duplicates_for_single_number
FROM (
    SELECT 
        transaction,
        COUNT(*) as duplicate_count
    FROM weighingheaders
    WHERE transaction IS NOT NULL
        AND transaction != ''
    GROUP BY transaction
    HAVING COUNT(*) > 1
) as duplicates;

-- Find duplicates by settings (to see which settings are most affected)
SELECT 
    s.name as settings_name,
    s.prefix,
    COUNT(DISTINCT wh.transaction) as duplicate_transaction_count,
    SUM(duplicate_counts.duplicate_count - 1) as total_duplicate_headers
FROM weighingheaders wh
JOIN settings s ON s.id = wh.settings_id
JOIN (
    SELECT 
        transaction,
        COUNT(*) as duplicate_count
    FROM weighingheaders
    WHERE transaction IS NOT NULL
        AND transaction != ''
    GROUP BY transaction
    HAVING COUNT(*) > 1
) as duplicate_counts ON duplicate_counts.transaction = wh.transaction
GROUP BY s.id, s.name, s.prefix
ORDER BY total_duplicate_headers DESC;

