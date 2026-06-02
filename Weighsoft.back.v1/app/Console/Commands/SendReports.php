<?php

namespace App\Console\Commands;

use App\Services\ReportEmailer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendReports extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reporting:email {reportId}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send report email';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @param ReportEmailer $reportEmailer
     * @return int
     */
    public function handle(ReportEmailer $reportEmailer): int
    {
        try {
            $reportEmailer->SendReportEmails($this->argument('reportId'));
        } catch (\Exception $e) {
            //Log::error($e);
            return -1;
        }
        return 0;
    }
}
