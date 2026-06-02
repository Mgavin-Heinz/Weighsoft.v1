<?php

//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);
// open the file in a binary mode
$ip = $_GET["ip"];
$time = $_GET["time"];
$url = "http://$ip/html/cam_pic.php?time=$time&pDelay=64000";
header("Content-Type: image/jpeg");

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0);
curl_setopt($ch, CURLOPT_TIMEOUT, 2400);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.1 Safari/537.11');
$res = curl_exec($ch);
$rescode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($rescode == 404 || $res == false) {
    $im = imagecreate(400, 400);
    $bg = imagecolorallocate($im, 255, 255, 255);
    $textcolor = imagecolorallocate($im, 0, 0, 255);
    imagestring($im, 5, 120, 200, 'Camera not found!', $textcolor);
    imagejpeg($im);
    imagedestroy($im);
}
curl_close($ch);
echo $res;
//echo "HH";
?>
