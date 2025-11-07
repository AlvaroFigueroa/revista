<?php
declare(strict_types=1);

// -----------------------------------------------------------------------------
// upload-news-image.php
// Script para manejar la subida de imágenes de noticias desde el panel React.
// Copia este archivo a public_html/upload-news-image.php y protégelo con un
// token sencillo mediante el encabezado X-Upload-Token.
// -----------------------------------------------------------------------------

$allowedOrigins = [
    'https://www.markae.cl',
    'https://markae.cl',
    'https://www.web.markae.cl',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5175',
    'http://127.0.0.1:5175'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-Upload-Token');
header('Vary: Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

const UPLOAD_TOKEN = 'Tmarkae21@21@';

$token = $_SERVER['HTTP_X_UPLOAD_TOKEN'] ?? '';
if (!hash_equals(UPLOAD_TOKEN, $token)) {
    http_response_code(401);
    echo json_encode(['error' => 'Token de autenticación inválido.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

$uploadDir = __DIR__ . '/uploads/noticias/';
$publicBaseUrl = 'https://www.markae.cl/uploads/noticias/';
$allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
$maxSize = 5 * 1024 * 1024; // 5 MB

if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No se recibió ningún archivo.']);
    exit;
}

$file = $_FILES['image'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Error en la subida (código ' . $file['error'] . ').']);
    exit;
}

if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo preparar el directorio de destino.']);
    exit;
}

$mimeType = mime_content_type($file['tmp_name']);
if (!in_array($mimeType, $allowedMime, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Formato no permitido. Usa JPG, PNG o WebP.']);
    exit;
}

if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'La imagen supera los 5 MB permitidos.']);
    exit;
}

$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg');
$uniqueName = 'news-' . date('YmdHis') . '-' . bin2hex(random_bytes(4)) . '.' . $extension;
$destination = rtrim($uploadDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $uniqueName;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo guardar el archivo en el servidor.']);
    exit;
}

chmod($destination, 0644);

echo json_encode([
    'name' => $uniqueName,
    'url' => $publicBaseUrl . $uniqueName
]);
