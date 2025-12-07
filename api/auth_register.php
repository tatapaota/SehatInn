<?php
include 'config.php';
header('Content-Type: application/json');

// Ambil data POST
$name = $_POST['username'] ?? '';
$email = $_POST['email'] ?? '';
$password_raw = $_POST['password'] ?? '';
$phone = $_POST['notelp'] ?? '';

if (!$name || !$email || !$password_raw || !$phone) {
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap"]);
    exit;
}

$password = password_hash($password_raw, PASSWORD_BCRYPT);

// Query INSERT
$sql = "INSERT INTO users (name, email, password, phone_number) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $name, $email, $password, $phone);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Registrasi berhasil"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}
