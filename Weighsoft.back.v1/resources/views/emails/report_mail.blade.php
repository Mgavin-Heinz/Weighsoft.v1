<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{--    <link rel="stylesheet" href="../../css/report.css" />--}}
    <style>
        div.container {
            margin: 20px;
            padding: 10px;
        }
    </style>

    <title>Laravel</title>
</head>
<body>
<div class="container">
    <h1>WeighSoft Reporting</h1>
    <h2>{{$report->name}}</h2>
    @if(count($reportData) > 0)
        <p>
            We have attached your CSV report.
        </p>
        <p>
            From: {{$startDate->toDateTimeLocalString()}}
            <br />
            To: {{$endDate->toDateTimeLocalString()}}
        </p>
    @else
        <p>No data to report.</p>
    @endif
    <p>
        Kind regards
        <br/>
        The WeighSoft Team
    </p>
</div>
</body>
</html>


