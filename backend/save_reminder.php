<?php
require_once 'config.php';
if (!isset($_SESSION['user_id'])) { echo json_encode(['error'=>'Not logged in']); exit; }
$user_id = intval($_SESSION['user_id']);

$data = json_decode(file_get_contents('php://input'), true);
$med_name = trim($data['med_name'] ?? '');
$dosage = trim($data['dosage'] ?? '');
$remind_time = trim($data['remind_time'] ?? ''); // expect ISO string or 'YYYY-MM-DD HH:MM:SS'

if (!$med_name || !$remind_time) { echo json_encode(['error'=>'Missing fields']); exit; }

// 1) insert medication
$stmt = $mysqli->prepare("INSERT INTO medications (user_id, med_name, dosage) VALUES (?, ?, ?)");
$stmt->bind_param('iss', $user_id, $med_name, $dosage);
if (!$stmt->execute()) { echo json_encode(['error'=>'DB error: '.$mysqli->error]); exit; }
$med_id = $stmt->insert_id;
$stmt->close();

// 2) insert reminder
// Normalize remind_time if ISO provided
$dt = date('Y-m-d H:i:s', strtotime($remind_time));

$stmt2 = $mysqli->prepare("INSERT INTO reminders (user_id, med_id, remind_time) VALUES (?, ?, ?)");
$stmt2->bind_param('iis', $user_id, $med_id, $dt);
if ($stmt2->execute()) {
    echo json_encode(['ok'=>true,'reminder_id'=>$stmt2->insert_id]);
} else {
    echo json_encode(['error'=>'DB error: '.$mysqli->error]);
}
$stmt2->close();
?>
