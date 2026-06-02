<?php

namespace App\Console;

use App\Jobs\RetryFailedInvoices;
use App\Jobs\SyncXeroInvoiceStatuses;
use App\Jobs\SyncXeroData;
use App\Models\Reporting;
use App\Services\ReportEmailer;
use Carbon\Carbon;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        //
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // $schedule->command('inspire')->hourly();
        //Log::info("Running scheduler");
        $reports = (new Reporting)->whereNotNull('schedule')->get();

        foreach ($reports as $report) {
            $schedule->command("reporting:email $report->id")->cron($report->schedule)->after(function() use ($report) {
                $time = Carbon::now();
                Reporting::where('id', $report->id)->update(['last_report_on' => $time->toDateTimeString()]);
            });
        }

        $schedule->job(new SyncXeroData)->everyFifteenMinutes();
        $schedule->job(new SyncXeroInvoiceStatuses)->everyFifteenMinutes();
        $schedule->job(new RetryFailedInvoices)->everyFiveMinutes();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
