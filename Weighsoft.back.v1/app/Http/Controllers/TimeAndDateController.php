<?php

namespace App\Http\Controllers;

use DateTime;
use DateInterval;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use function round;
use function shell_exec;

class TimeAndDateController extends Controller
{
    public function set(Request $request): JsonResponse
    {
        $output = "OS not found";
        $os =  strtoupper(substr(php_uname(), 0, 3));
        $host = $request->getHttpHost();
        if($host == "localhost" || $host == "127.0.0.1")
        {
            return response()->json("Cannot set time on localhost");
        }
        //Log::info("OS is $os", ["TimeAndDateController"]);
        if ($os == "LIN") {
            $data = $request->all();
            $correctValue = round($data[0] / 1000);
            $dt = new DateTime("@$correctValue");
            $output = shell_exec("date +'%b %d, %Y %r'");
            $newDate = $dt->format('Y-m-d H:i:s') . "Z";
            $input = "date -s '$newDate'";
            $output2 = shell_exec($input);
            //Log::info(print_r($output2, true), ["TimeAndDateController","LIN"]);
        }
        if ($os == "WIN") {
            $data = $request->all();
            $correctValue = round($data[0] / 1000);
            $dt = new DateTime("@$correctValue");
            $hours = 2; // For SA time as linux is 2 hours behind
            $modified = (clone $dt)->add(new DateInterval("PT{$hours}H"));
            $output = shell_exec("date /T");
            $output .= " ";
            $output .= shell_exec("time /T");
            $newDate = $modified->format('Y-m-d');
            $newTime = $modified->format('H:i:s');
            $input = "date $newDate";
            $output2 = shell_exec($input);
            $input2 = "time $newTime";
            $output3 = shell_exec($input2);
            // Log::info(print_r($output2, true), ["TimeAndDateController","WIN"]);
            // Log::info(print_r($output3, true), ["TimeAndDateController","WIN"]);
            //$output = $output2 . " " . $output3;
        }
        return response()->json($output);
    }
}
