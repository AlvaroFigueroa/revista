<?php
declare(strict_types=1);

// -----------------------------------------------------------------------------
// Formulario standalone para subir fotografías de noticias.
// Copia este archivo a public_html/news-image-upload.php y protégelo con
// autenticación HTTP básica desde cPanel para que solo administradores tengan
// acceso. Las imágenes quedarán disponibles en /uploads/noticias/ y podrás
// pegar la URL resultante en el panel React.
// -----------------------------------------------------------------------------

$uploadDir = __DIR__ . '/../public_html/uploads/noticias/';
$publicBaseUrl = 'https://www.markae.cl/uploads/noticias/';
$allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
$maxSize = 5 * 1024 * 1024; // 5MB

$result = null;
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['image'])) {
        $error = 'No se recibió ningún archivo.';
    } else {
        $file = $_FILES['image'];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            $error = 'Ocurrió un error en la subida (código ' . $file['error'] . ').';
        } else {
            if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
                $error = 'No se pudo preparar el directorio de destino.';
            } else {
                $mimeType = mime_content_type($file['tmp_name']);
                if (!in_array($mimeType, $allowedMime, true)) {
                    $error = 'Formato no permitido. Usa JPG, PNG o WebP.';
                } elseif ($file['size'] > $maxSize) {
                    $error = 'La imagen supera los 5 MB permitidos.';
                } else {
                    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg');
                    $uniqueName = 'news-' . date('YmdHis') . '-' . bin2hex(random_bytes(4)) . '.' . $extension;
                    $destination = rtrim($uploadDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $uniqueName;

                    if (move_uploaded_file($file['tmp_name'], $destination)) {
                        chmod($destination, 0644);
                        $result = [
                            'name' => $uniqueName,
                            'url' => $publicBaseUrl . $uniqueName
                        ];
                    } else {
                        $error = 'No se pudo guardar el archivo en el servidor.';
                    }
                }
            }
        }
    }
}

function sendUrlToParent(array $result): void
{
    $allowedOrigins = [
        'https://www.markae.cl',
        'https://markae.cl',
        'http://localhost:5173',
        'http://127.0.0.1:5173'
    ];

    $requestedOrigin = $_GET['origin'] ?? '';
    if ($requestedOrigin && in_array($requestedOrigin, $allowedOrigins, true)) {
        echo '<script>
          if (window.opener && typeof window.opener.postMessage === "function") {
            window.opener.postMessage({ type: "news-image-uploaded", url: ' . json_encode($result['url']) . ' }, ' . json_encode($requestedOrigin) . ');
          }
        </script>';
    }
}

?><!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <title>Subir fotografía de noticia</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
        :root {
            color-scheme: light dark;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
            padding: 2rem;
        }
        .card {
            background: #ffffff;
            max-width: 520px;
            width: 100%;
            padding: 2rem;
            border-radius: 18px;
            box-shadow: 0 24px 64px -32px rgba(15, 23, 42, 0.2);
        }
        h1 {
            margin-top: 0;
            font-size: 1.5rem;
        }
        form {
            display: grid;
            gap: 1rem;
        }
        label {
            font-weight: 600;
            display: block;
        }
        input[type="file"],
        button,
        .result {
            width: 100%;
        }
        input[type="file"] {
            padding: 0.6rem;
            border-radius: 10px;
            border: 1px solid #cbd5f5;
            background: #f8fafc;
        }
        button {
            background: #1d4ed8;
            color: #ffffff;
            border: none;
            border-radius: 10px;
            padding: 0.75rem 1rem;
            font-size: 1rem;
            cursor: pointer;
        }
        button:hover {
            background: #1e40af;
        }
        .message {
            border-radius: 10px;
            padding: 0.9rem 1rem;
            font-size: 0.95rem;
        }
        .message--error {
            background: #fee2e2;
            color: #b91c1c;
        }
        .message--success {
            background: #dcfce7;
            color: #166534;
        }
        .result {
            display: grid;
            gap: 0.4rem;
        }
        code {
            background: rgba(15, 23, 42, 0.08);
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            word-break: break-all;
        }
        small {
            color: #475569;
        }
    </style>
</head>
<body>
<div class="card">
    <h1>Subir fotografía de noticia</h1>
    <p>Selecciona la imagen en formato JPG, PNG o WebP (máximo 5 MB). Al guardar verás la URL lista para pegar en el panel.</p>

    <?php if ($error !== null): ?>
        <div class="message message--error" role="alert">
            <?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?>
        </div>
    <?php endif; ?>

    <?php if ($result !== null): ?>
        <div class="message message--success" role="status">
            ¡Imagen subida correctamente!
        </div>
        <div class="result">
            <div>
                <span>URL pública:</span>
                <code><?= htmlspecialchars($result['url'], ENT_QUOTES, 'UTF-8'); ?></code>
            </div>
            <div>
                <span>Nombre de archivo:</span>
                <code><?= htmlspecialchars($result['name'], ENT_QUOTES, 'UTF-8'); ?></code>
            </div>
            <small>Pega la URL en el campo “Fotografía (URL)” del panel de noticias.</small>
        </div>
    <?php endif; ?>

    <form method="post" enctype="multipart/form-data">
        <div>
            <label for="image">Elige la fotografía</label>
            <input type="file" id="image" name="image" accept="image/jpeg,image/png,image/webp" required />
        </div>
        <button type="submit">Subir imagen</button>
    </form>
    <?php if ($result !== null): ?>
        <?php sendUrlToParent($result); ?>
        <p style="margin-top: 1rem; font-weight: 600;">URL enviada al panel (si la ventana original estaba abierta).</p>
    <?php endif; ?>
</div>
</body>
</html>
