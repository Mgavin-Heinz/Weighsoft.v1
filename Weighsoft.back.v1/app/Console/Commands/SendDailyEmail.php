<?php

// namespace App\Console\Commands;

// use Illuminate\Console\Command;
// use App\Models\Reporting;
// use Communicator;
// use DB;
// use Mail;
// use Illuminate\Support\Facades\Log;
// use App\Http\Controllers\ReportingController;

//TODO:Remove
//class SendDailyEmail extends Command {

    // /**
    //  * The name and signature of the console command.
    //  *
    //  * @var string
    //  */
    // protected $signature = 'picahoo:sendemail {--report=} {days?}';

    // /**
    //  * The console command description.
    //  *
    //  * @var string
    //  */
    // protected $description = 'Send Daily Email';

    // /**
    //  * Create a new command instance.
    //  *
    //  * @return void
    //  */
    // public function __construct() {
    //     parent::__construct();
    // }

    // /**
    //  * Execute the console command.
    //  *
    //  * @return mixed
    //  */
    // public function handle() {
       
    //     // $days = $this->argument('days');
    //     //$days = ($days == null || $days == "" ? 1 : $days);
    //     if($this->argument('days')) {
    //         $days = $this->argument('days');
    //         //$days = ($days == null || $days == "" ? 1 : $days);
    //         $start = date("Y-m-d H:i:s", strtotime(date("Y-m-d H:i:s", mktime(0, 0, 0)) . " - $days day"));
    //         $end = date("Y-m-d H:i:s", strtotime(date("Y-m-d H:i:s", mktime(23, 59, 59)) . " - $days day"));
    //     } 
    //     else if($this->option('report')){
    //         $report_id = $this->option('report');
    //         $report = DB::table('reporting')->where('id',$report_id)->first();
    //         $start = $report->last_report_on ?  $report->last_report_on : '0000-00-00 00:00:00';
    //         $end = date("Y-m-d H:i:s", strtotime(date("Y-m-d H:i:s", mktime(23, 59, 59))));
    //     }
    //     // $Emails = json_decode(env('SEND_MAIL'), true);
    //     // $Emails = $report->email;
    //     $Emails = explode(',', $report->email);
    //     $ReportText = $this->MakeTable($this->TransactionReport($start, $end));
    //     $ReportText .= "<br><hr>";
    //     $Sql = "Select * from (
    //             Select (select site_name from sites where id = site_id) `Site`, `description` `Exception Type`, 
    //             count(1) `Occurances` 
    //             from exceptions
    //             where created_at between '$start' and '$end'
    //             group by (select site_name from sites where id = site_id), `code`
    //             union all
    //             Select (select site_name from sites where id = site_id) `Site`, 'No Fingerprint Scanner', count(1) `Occurances`
    //             from weighingtransactions where created_at between '$start' and '$end'
    //             group by (select site_name from sites where id = site_id), 'No Fingerprint Scanner') Exceptions
    //             order by `Site`, `Exception Type`";
    //     $ReportText .= $this->MakeTable($this->RunSql($Sql));
    //     foreach ($Emails as $email) {
    //         $this->SendEmail($email, "Weighsoft Transaction Report for " . $start, $email, $ReportText, "Send to " . print_r($email, true), "Greetings Weighsoft");
    //     }
    // }

    // public function TransactionReport($start, $end) {
    //     $data = new \stdClass();
    //     $data->DateRange = new \stdClass();
    //     $data->DateRange->startDate = $start;
    //     $data->DateRange->endDate = $end;
    //     $data->id = 3;
    //     $rep = new ReportingController();
    //     $Report = $rep->GetData($data);
    //     return $Report['data'];
    // }

    // public function RunSql($Sql) {
    //     $results = DB::select(DB::raw($Sql), array());
    //     return $results;
    // }

    // public function MakeTable($Report) {
    //     $ReportText = "No Data";
    //     if (count($Report) > 0) {
    //         $ReportText = "<table class='minimalistBlack'><thead><tr><th>";
    //         $ReportText .= implode('</th><th>', array_keys((array) $Report[0]));
    //         $ReportText .= "</th></tr></thead><tbody>";
    //         foreach ($Report as $row) {
    //             $ReportText .= "<tr><td>" . implode("</td><td>", (array) $row) . "</td></tr>";
    //         }
    //         $ReportText .= "</tbody></table>";
    //     }
    //     return $ReportText;
    // }

    // public function SendEmail($email, $subject, $username, $introtext, $closingtext, $signature) {
    //   // Communicator::sendEmail($email, $html2, $subject);
    //     print_r($username);

        
    //     $data = array(
    //         'username' => $username,
    //         'introtext' => $introtext,
    //         'closingtext' => $closingtext
    //     );

    //     Mail::send('emails.report_mail', $data ,function ($message) use ($email, $subject) {
    //         $message->to($email)->subject($subject);

    //     });
    // }

//}
