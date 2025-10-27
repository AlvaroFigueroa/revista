<?php
$to = 'contacto@markae.cl';
$subject = 'Nueva suscripción al newsletter';

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');

if ($name === '' || $email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo 'Datos inválidos. Revisa el nombre y el correo.';
    exit;
}

$body = "Nombre: {$name}\n" .
        "Correo: {$email}\n" .
        "Fecha: " . date('Y-m-d H:i:s') . "\n";

$headers = "From: newsletter@markae.cl\r\n" .
           "Reply-To: {$email}\r\n" .
           'X-Mailer: PHP/' . phpversion();

$mailSent = mail($to, $subject, $body, $headers);

if ($mailSent) {
    echo '¡Gracias por suscribirte! Muy pronto recibirás novedades.';
} else {
    http_response_code(500);
    echo 'No pudimos registrar tu suscripción. Inténtalo más tarde.';
}
