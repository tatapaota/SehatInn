<?php
// config.php
session_start();

define('DB_HOST', 'sql306.infinityfree.com'); // atau host dari InfinityFree
define('DB_USER', 'if0_40254380');
define('DB_PASS', '4u0zxciQOYOyE');
define('DB_NAME', 'if0_40254380_sehatin_db');

$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed']);
    exit;
}
$mysqli->set_charset('utf8mb4');
header('Content-Type: application/json; charset=utf-8');
?>
