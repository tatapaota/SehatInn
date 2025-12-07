<?php
include 'config.php';
header('Content-Type: application/json');

$user_id = $_GET['user_id'];

$sql = "SELECT * FROM reminders WHERE user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$reminders = [];
while ($row = $result->fetch_assoc()) {
    $reminders[] = $row;
}

echo json_encode($reminders);
?>
