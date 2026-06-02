<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\settings;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\App;

class Report extends Mailable
{
    use Queueable, SerializesModels;

    public $reportData;
    public $startDate;
    public $endDate;
    public $report;
    public $debug;
    public $headerLogo;
    public $footerLogo;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($data, $startDate, $endDate, $report)
    {
        $this->debug = App::hasDebugModeEnabled();
        $this->reportData = $data;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->report = $report;

        $setting = settings::where('company_id', $report->company_id)->first();
        $this->headerLogo = $setting->display_custom_header_img ?? null;
        $this->footerLogo = $setting->display_custom_footer_img ?? null;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $view = $this->view('emails.report_mail');
        if ($this->debug) {
            Log::info("build " . print_r($this->reportData, true));
        }
        foreach ($this->reportData as $singleReport) {
            try {
                $repData = $singleReport['data'];
                if ($this->debug) {
                    Log::info("foreach " . print_r($repData, true));
                }
                if (!empty($repData) && is_array($repData) && count($repData) > 0) {
                    Log::info("Creating CSV...");
                    if ($this->debug) {
                        Log::info("DATA: " . print_r($repData, true));
                    }
                    Log::info("Current working directory: " . getcwd());
                    $reportName = str_replace(' ', '_', $singleReport['info']->name ?? bin2hex(openssl_random_pseudo_bytes(16)));
                    $filename = storage_path("app/public/{$reportName}.csv");
                    $file = fopen($filename, "w");

                    if ($file == false) {
                        Log::error("Could not open file: " . $filename);
                        $view->attachData("No data available for this period", "error.txt");
                        return $view;
                    }

                    $keys = array_keys(get_object_vars($repData[0]));
                    fputcsv($file, $keys);
                    Log::info("Filling CSV {$filename}");
                    foreach ($repData as $record) {
                        $values = array_values(get_object_vars($record));
                        fputcsv($file, $values);
                    }
                    Log::info("Saving CSV {$filename}");

                    fclose($file);
                    $view->attach($filename);
                    Log::info("Attached CSV {$filename}");
                }
                if (!empty($repData) && !is_array($repData)) {
                    Log::info("Current working directory: " . getcwd());
                    $reportName = str_replace(' ', '_', $singleReport['info']->name ?? bin2hex(openssl_random_pseudo_bytes(16)));
                    $filename = storage_path("app/public/{$reportName}.csv");
                    $file = fopen($filename, "w");

                    if ($file == false) {
                        Log::error("Could not open file: " . $filename);
                        $view->attachData("No data available for this period", "error.txt");
                        return $view;
                    }
                    fwrite($file, $repData);
                    fclose($file);
                    $view->attach($filename);
                }
            } catch (\Throwable $th) {
                Log::error("Error creating CSV: " . $th->getMessage());
            }
        }
        Log::info("View Created");
        return $view;
    }
}
