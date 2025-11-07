const NEWS_UPLOAD_ENDPOINT = 'https://www.markae.cl/upload-news-image.php';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/webp']);
const ARTICLE_ID_PATTERN = /^[a-zA-Z0-9_-]{6,}$/;

class UploadError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'UploadError';
    this.status = options.status ?? null;
    this.payload = options.payload ?? null;
  }
}

const ensureEndpointAvailable = () => {
  if (!NEWS_UPLOAD_ENDPOINT || typeof NEWS_UPLOAD_ENDPOINT !== 'string') {
    throw new UploadError('El endpoint de subida no está configurado.');
  }
};

const validateFile = (file) => {
  if (!(file instanceof File)) {
    throw new UploadError('Debes adjuntar un archivo de imagen válido.');
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new UploadError('Formato de imagen no permitido. Solo se aceptan JPEG, PNG o WebP.');
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new UploadError('La imagen supera los 5MB permitidos.');
  }
};

const validateArticleId = (articleId) => {
  if (typeof articleId !== 'string' || !ARTICLE_ID_PATTERN.test(articleId)) {
    throw new UploadError(
      'No pudimos determinar el identificador interno del artículo. Intenta guardar nuevamente.'
    );
  }
};

export const uploadNewsImage = async (file, articleId) => {
  ensureEndpointAvailable();
  validateFile(file);
  validateArticleId(articleId);

  const payload = new FormData();
  payload.append('image', file);
  payload.append('articleId', articleId);

  const response = await fetch(NEWS_UPLOAD_ENDPOINT, {
    method: 'POST',
    headers: {
      'X-Upload-Token': 'Tmarkae21@21@'
    },
    body: payload
  });

  if (!response.ok) {
    let detail = null;
    try {
      detail = await response.json();
    } catch (error) {
      // ignored, fallback to text
      try {
        detail = await response.text();
      } catch (innerError) {
        detail = null;
      }
    }

    throw new UploadError('No pudimos subir la imagen. Intenta nuevamente.', {
      status: response.status,
      payload: detail
    });
  }

  const data = await response.json();
  if (!data?.url) {
    throw new UploadError('El servidor no retornó la URL de la imagen.');
  }

  return data.url;
};

export { UploadError };
