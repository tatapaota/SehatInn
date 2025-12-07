<?php
include 'config.php';

// Ambil jadwal yang waktunya sudah tiba
$sql = "SELECT s.*, u.name, u.phone_number
        FROM schedules s
        JOIN users u ON s.user_id = u.id
        WHERE s.date = CURDATE() AND s.time <= CURTIME() AND s.status = 'belum'";
$result = $conn->query($sql);

$FONNTE_TOKEN = "ISI_TOKEN_FONNTE_KAMU";

while ($row = $result->fetch_assoc()) {
    $phone = preg_replace('/[^0-9]/', '', $row['phone_number']);
    if (strpos($phone, '0') === 0) $phone = '62' . substr($phone, 1);
    
    $msg = "Halo {$row['name']}, waktunya minum obat {$row['med_name']} ({$row['dosage']}).";

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => "https://api.fonnte.com/send",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => [
            "target" => $phone,
            "message" => $msg
        ],
        CURLOPT_HTTPHEADER => ["Authorization: $FONNTE_TOKEN"]
    ]);
    $response = curl_exec($ch);
    curl_close($ch);

    // Update status jadi 'sudah'
    $conn->query("UPDATE schedules SET status='sudah' WHERE id={$row['id']}");
}
?>
