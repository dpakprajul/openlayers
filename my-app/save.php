<?php
include 'db.php';

$names = $_POST['id'];
$cond = $_POST['nuclide'];
$loc = $_POST['locality'];
$lat = $_POST['latitude'];
$long = $_POST['longitude'];

$add_query = "INSERT INTO public.entries(names, cond, loc, geom) VALUES ('$names', '$cond', '$loc', ST_MakePoint($long,$lat))";
$query = pg_query($dbcon,$add_query);

if ($query){
    echo json_encode(array("statusCode"=>200));
} else {
    echo json_encode(array("statusCode"=>201));

}
?>