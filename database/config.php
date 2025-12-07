<?php
$host = "localhost"; // 
$user = "seha_sehatin_db";
$pass = "testing123@@##"; 
$dbname = "seha_sehatin_db"; // nama database 

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]));
}
?>
