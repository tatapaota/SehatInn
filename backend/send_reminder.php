<?php
require_once 'config.php';
$WABLAS_TOKEN = "2kxDtikDZnMCHtRqoSsvSae7r7FNCoGO0QxMI7u0tcFvu5IhjTtkV4W"; 

// Ambil reminders yang waktunya <= NOW() dan belum dikirim
$sql = "SELECT r.reminder_id, r.remind_time, u.user_id, u.name, u.phone_number, m.med_name, m.dosage
        FROM reminders r
        JOIN users u ON r.user_id = u.user_id
        JOIN medications m ON r.med_id = m.med_id
        WHERE r.is_sent = 0 AND r.remind_time <= NOW()
        LIMIT 200";

$res = $mysqli->query($sql);
$sent = [];
while ($row = $res->fetch_assoc()) {
    // Format nomor: ubah 08123... -> 628123...
    $phone = preg_replace('/[^0-9+]/','', $row['phone_number']);
    if (strpos($phone, '0') === 0) $phone = '62' . substr($phone, 1);
    $msg = "Halo {$row['name']}, waktunya minum {$row['med_name']} ({$row['dosage']}).";
    // kirim via Wablas
    $ch = curl_init("https://api.wablas.com/send-message");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(['phone'=>$phone,'message'=>$msg]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: $WABLAS_TOKEN"]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $resp = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);
    if ($err === '') $sent[] = intval($row['reminder_id']);
}
// Update is_sent untuk yang sukses
if (!empty($sent)) {
    $ids = implode(',', $sent);
    $mysqli->query("UPDATE reminders SET is_sent = 1 WHERE reminder_id IN ($ids)");
}
echo json_encode(['checked'=> $res->num_rows, 'sent'=> count($sent)]);
?>
