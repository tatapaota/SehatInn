<?php
include 'config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['user_id']) || !isset($data['med_name']) || !isset($data['time']) || !isset($data['date'])) {
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap (Butuh Date & Time)"]);
    exit;
}

$user_id = $data['user_id'];
$med_name = $data['med_name'];
$dosage = $data['dosage'] ?? '-';
$time = $data['time'];
$date = $data['date'];

$full_datetime = $date . ' ' . $time . ':00';

$sql = "INSERT INTO reminders (user_id, med_name, dosage, reminder_time) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("isss", $user_id, $med_name, $dosage, $full_datetime);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Pengingat disimpan"]);
} else {
    echo json_encode(["status" => "error", "message" => "Database Error: " . $stmt->error]);
}