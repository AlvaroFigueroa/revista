<?php
$to = 'contacto@markae.cl';
$subject = 'Nuevo mensaje desde el formulario de contacto';

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$company = trim($_POST['company'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
    header('Location: /contacto?status=error');
    exit;
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
    header('Location: /contacto?status=ok');
} else {
    header('Location: /contacto?status=error');
}
exit;
