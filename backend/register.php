<?php
require_once 'config.php';
$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    echo json_encode(['error'=>'Invalid input']); exit;
}
$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$pass = $data['password'] ?? '';

if (!$name || !$email || !$phone || !$pass) {
    echo json_encode(['error'=>'All fields required']); exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['error'=>'Invalid email']); exit;
}

$password_hash = password_hash($pass, PASSWORD_DEFAULT);

$stmt = $mysqli->prepare("INSERT INTO users (name, phone_number, email, password_hash) VALUES (?, ?, ?, ?)");
$stmt->bind_param('ssss', $name, $phone, $email, $password_hash);
if ($stmt->execute()) {
    $user_id = $stmt->insert_id;
    $_SESSION['user_id'] = $user_id;
    echo json_encode(['ok'=>true, 'user_id'=>$user_id]);
} else {
    if ($mysqli->errno === 1062) {
        echo json_encode(['error'=>'Email already registered']);
    } else {
        echo json_encode(['error'=>'DB error: '.$mysqli->error]);
    }
}
$stmt->close();
?>
