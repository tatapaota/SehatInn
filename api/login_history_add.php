<?php
include "config.php";

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data["user_id"];
$ip = $_SERVER["REMOTE_ADDR"];
$user_agent = $_SERVER["HTTP_USER_AGENT"];

$sql = "INSERT INTO login_history (user_id, ip_address, user_agent) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iss", $user_id, $ip, $user_agent);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}