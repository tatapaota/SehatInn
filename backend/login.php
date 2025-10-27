<?php
require_once 'config.php';
$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$pass = $data['password'] ?? '';

if (!$email || !$pass) {
    echo json_encode(['error'=>'Email & password required']); exit;
}

$stmt = $mysqli->prepare("SELECT user_id, password_hash, name, phone_number FROM users WHERE email = ?");
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->bind_result($user_id, $hash, $name, $phone);
if ($stmt->fetch()) {
    if (password_verify($pass, $hash)) {
        $_SESSION['user_id'] = $user_id;
        echo json_encode(['ok'=>true, 'user'=>['user_id'=>$user_id,'name'=>$name,'phone'=>$phone]]);
    } else {
        echo json_encode(['error'=>'Wrong credentials']);
    }
} else {
    echo json_encode(['error'=>'User not found']);
}
$stmt->close();
?>
