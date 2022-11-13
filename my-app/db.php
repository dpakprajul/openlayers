<?php

$server = 'localhost';
$username = 'postgres';
$password = 'user';
$db_name = 'postgres';

$dbcon = pg_connect("host=$server port=5432 dbname=$db_name user=$username password=$password")

?>