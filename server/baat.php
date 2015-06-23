<?php 
    //enable CORS
    header("Access-Control-Allow-Origin: *");

    $gatekeeper = 'http://gatekeeper1.geonorge.no';
    $duration = 60;

    if (isset($_GET['type']) && $_GET['type'] == 'token') {

        //this should work, but doesn't on internal network
        //$ip = $_SERVER["REMOTE_ADDR"];
        $ip = '92.62.32.90';

        $url = "$gatekeeper/BaatGatekeeper/gktoken?ip=$ip&min=$duration";
        echo file_get_contents($url);

    } else {
        echo "Nooo";
    }
 ?>