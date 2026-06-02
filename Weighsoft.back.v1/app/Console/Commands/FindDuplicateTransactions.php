<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FindDuplicateTransactions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'transactions:find-duplicates 
                            {--export : Export results to CSV file}
                            {--limit=100 : Limit number of results}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Find duplicate transaction numbers in the database';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Searching for duplicate transaction numbers...');
        
        $limit = (int) $this->option('limit');
        
        $duplicates = DB::select("
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
            ORDER BY duplicate_count DESC, transaction
            LIMIT ?
        ", [$limit]);

        if (empty($duplicates)) {
            $this->info('No duplicate transaction numbers found.');
            return 0;
        }

        $this->warn("Found " . count($duplicates) . " duplicate transaction numbers:");
        $this->newLine();

        $headers = ['Transaction', 'Count', 'First Created', 'Last Created', 'Seconds Between', 'Header IDs'];
        $rows = [];

        foreach ($duplicates as $duplicate) {
            $rows[] = [
                $duplicate->transaction,
                $duplicate->duplicate_count,
                $duplicate->first_created,
                $duplicate->last_created,
                $duplicate->seconds_between_duplicates ?? 'N/A',
                substr($duplicate->weighing_header_ids, 0, 50) . (strlen($duplicate->weighing_header_ids) > 50 ? '...' : '')
            ];
        }

        $this->table($headers, $rows);

        // Summary
        $totalDuplicates = array_sum(array_column($duplicates, 'duplicate_count'));
        $totalExtraHeaders = $totalDuplicates - count($duplicates);
        
        $this->newLine();
        $this->info("Summary:");
        $this->line("  - Unique duplicate transaction numbers: " . count($duplicates));
        $this->line("  - Total duplicate headers: " . $totalExtraHeaders);
        $this->line("  - Average duplicates per number: " . round($totalDuplicates / count($duplicates), 2));

        // Export to CSV if requested
        if ($this->option('export')) {
            $filename = storage_path('app/duplicate-transactions-' . date('Y-m-d-His') . '.csv');
            $fp = fopen($filename, 'w');
            
            // Write headers
            fputcsv($fp, ['Transaction', 'Duplicate Count', 'First Created', 'Last Created', 'Seconds Between', 'Header IDs', 'Created Dates']);
            
            // Write data
            foreach ($duplicates as $duplicate) {
                fputcsv($fp, [
                    $duplicate->transaction,
                    $duplicate->duplicate_count,
                    $duplicate->first_created,
                    $duplicate->last_created,
                    $duplicate->seconds_between_duplicates ?? 'N/A',
                    $duplicate->weighing_header_ids,
                    $duplicate->created_dates
                ]);
            }
            
            fclose($fp);
            $this->info("Results exported to: " . $filename);
        }

        Log::info('Duplicate transactions check completed', [
            'duplicate_count' => count($duplicates),
            'total_extra_headers' => $totalExtraHeaders
        ]);

        return 0;
    }
}

