<?php
$to = 'contacto@markae.cl';
$subject = 'Nuevo mensaje desde el formulario de contacto';

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$company = trim($_POST['company'] ?? '');
$message = trim($_POST['message'] ?? '');

$redirectUrl = '/contacto';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    renderJson(false, 'Método no permitido.');
}

if ($name === '' || $email === '' || $message === '') {
    renderJson(false, 'Por favor completa todos los campos obligatorios e inténtalo nuevamente.');
}

$body = "Nombre: {$name}\n" .
        "Correo: {$email}\n" .
        "Empresa: {$company}\n" .
        "Mensaje:\n{$message}\n";

$headers = "From: revista@markae.cl\r\n" .
           "Reply-To: {$email}\r\n" .
           'X-Mailer: PHP/' . phpversion();

$mailSent = mail($to, $subject, $body, $headers);

if ($mailSent) {
    renderJson(true, '¡Gracias! Tu mensaje fue enviado correctamente. Te contactaremos pronto.');
}

renderJson(false, 'No pudimos enviar tu mensaje. Intenta nuevamente más tarde o escríbenos a contacto@markae.cl.');

function renderJson(bool $status, string $message): void
{
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'status' => $status,
        'message' => $message,
    ]);
    exit;
}
