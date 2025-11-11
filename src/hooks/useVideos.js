import { useEffect, useMemo, useState } from 'react';
import { subscribeToVideos, sanitizeEmbedUrl } from '../services/videos';

const DEFAULT_LIMIT = 10;

export const VIDEOS_STATUS = Object.freeze({
  idle: 'idle',
  loading: 'loading',
  ready: 'ready',
  empty: 'empty',
  error: 'error'
});

const normalizeLimit = (value) => {
  if (value === null || value === undefined) return null;
  if (Number.isInteger(value) && value > 0) return value;
  return DEFAULT_LIMIT;
};

export function useVideos({ tag, limit = DEFAULT_LIMIT } = {}) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState(VIDEOS_STATUS.idle);
  const [error, setError] = useState(null);

  const parseError = (fireError) => {
    if (!fireError) return null;

    const base = {
      message: fireError.message || 'No pudimos cargar los videos. Intenta nuevamente.',
      code: fireError.code || 'unknown',
      original: fireError,
      requiresIndex: false,
      indexUrl: null
    };

    if (fireError.code === 'failed-precondition' && typeof fireError.message === 'string') {
      const urlMatch = fireError.message.match(/https:\/\/console\.firebase\.google\.com\S+/);
      if (urlMatch) {
        return {
          ...base,
          requiresIndex: true,
          indexUrl: urlMatch[0],
          message:
            'Esta consulta necesita un índice compuesto en Firestore antes de poder ejecutarse.'
        };
      }
    }

    return base;
  };

  const effectiveLimit = useMemo(() => normalizeLimit(limit), [limit]);
  const normalizedTag = useMemo(() => (typeof tag === 'string' ? tag.trim() : ''), [tag]);

  useEffect(() => {
    setStatus(VIDEOS_STATUS.loading);
    setError(null);

    const unsubscribe = subscribeToVideos({
      tag: normalizedTag,
      limit: effectiveLimit,
      onNext: (docs) => {
        // Normalizar URL y deduplicar por ID de YouTube (preferido) o embedUrl canónico
        const normalized = docs.map((v) => {
          const safeUrl = typeof v.embedUrl === 'string' ? sanitizeEmbedUrl(v.embedUrl) : '';
          const m = safeUrl.match(/embed\/([\-\w]{11})/);
          const ytId = m ? m[1] : null;
          return { ...v, embedUrl: safeUrl, _ytId: ytId };
        });

        const seen = new Set();
        const uniqueVideos = [];
        for (const v of normalized) {
          const key = v._ytId || (v.embedUrl ? `url:${v.embedUrl}` : `doc:${v.id}`);
          if (seen.has(key)) continue;
          seen.add(key);
          uniqueVideos.push(v);
        }

        setItems(uniqueVideos);
        setStatus(uniqueVideos.length === 0 ? VIDEOS_STATUS.empty : VIDEOS_STATUS.ready);
      },
      onError: (subscriptionError) => {
        setError(parseError(subscriptionError));
        setStatus(VIDEOS_STATUS.error);
      }
    });

    return () => unsubscribe?.();
  }, [normalizedTag, effectiveLimit]);

  return { items, status, error, tag: normalizedTag, limit: effectiveLimit };
}
