<?php
require_once 'config.php';
if (!isset($_SESSION['user_id'])) { echo json_encode(['error'=>'Not logged in']); exit; }
$user_id = intval($_SESSION['user_id']);

$query = "SELECT r.reminder_id, r.remind_time, r.is_sent, m.med_id, m.med_name, m.dosage
          FROM reminders r JOIN medications m ON r.med_id = m.med_id
          WHERE r.user_id = ? ORDER BY r.remind_time ASC";
$stmt = $mysqli->prepare($query);
$stmt->bind_param('i', $user_id);
$stmt->execute();
$res = $stmt->get_result();
$rows = $res->fetch_all(MYSQLI_ASSOC);
echo json_encode(['ok'=>true,'data'=>$rows]);
$stmt->close();
?>
