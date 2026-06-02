-- Script to Analyze Duplicate Transaction Numbers
-- This helps understand the pattern and impact of duplicates

-- Find duplicates with detailed information
SELECT 
    wh.transaction,
    COUNT(*) as duplicate_count,
    GROUP_CONCAT(
        CONCAT(
            BIN_TO_UUID(wh.id, TRUE), 
            ' (', wh.created_at, ')'
        ) 
        ORDER BY wh.created_at 
        SEPARATOR ' | '
    ) as header_details,
    MIN(wh.created_at) as first_created,
    MAX(wh.created_at) as last_created,
    TIMESTAMPDIFF(SECOND, MIN(wh.created_at), MAX(wh.created_at)) as seconds_between,
    s.name as settings_name,
    s.prefix,
    c.name as company_name,
    st.site_name
FROM weighingheaders wh
JOIN settings s ON s.id = wh.settings_id
JOIN companies c ON c.id = wh.company_id
JOIN sites st ON st.id = wh.site_id
WHERE wh.transaction IS NOT NULL
    AND wh.transaction != ''
GROUP BY wh.transaction, s.id, s.name, s.prefix, c.id, c.name, st.id, st.site_name
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, wh.transaction
LIMIT 100;

-- Find duplicates created within same minute (likely same request or retry)
SELECT 
    wh.transaction,
    COUNT(*) as duplicate_count,
    DATE_FORMAT(wh.created_at, '%Y-%m-%d %H:%i') as created_minute,
    GROUP_CONCAT(BIN_TO_UUID(wh.id, TRUE) ORDER BY wh.created_at) as header_ids,
    s.name as settings_name
FROM weighingheaders wh
JOIN settings s ON s.id = wh.settings_id
WHERE wh.transaction IS NOT NULL
    AND wh.transaction != ''
GROUP BY wh.transaction, DATE_FORMAT(wh.created_at, '%Y-%m-%d %H:%i'), s.id, s.name
HAVING COUNT(*) > 1
ORDER BY created_minute DESC, duplicate_count DESC
LIMIT 50;

-- Check if duplicates have different statuses (might indicate one is valid, one is not)
SELECT 
    wh.transaction,
    COUNT(*) as duplicate_count,
    GROUP_CONCAT(DISTINCT wh.status ORDER BY wh.status) as statuses,
    GROUP_CONCAT(DISTINCT CASE WHEN wh.deleted_at IS NOT NULL THEN 'DELETED' ELSE 'ACTIVE' END) as deletion_status
FROM weighingheaders wh
WHERE wh.transaction IS NOT NULL
    AND wh.transaction != ''
GROUP BY wh.transaction
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC
LIMIT 50;

