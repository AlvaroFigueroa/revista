import { useEffect, useMemo, useState } from 'react';
import { subscribeToVideos } from '../services/videos';

const DEFAULT_LIMIT = 10;

export const VIDEOS_STATUS = Object.freeze({
  idle: 'idle',
  loading: 'loading',
  ready: 'ready',
  empty: 'empty',
  error: 'error'
});

const ensurePositiveInt = (value, fallback) => {
  if (Number.isInteger(value) && value > 0) return value;
  return fallback;
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

  const effectiveLimit = useMemo(() => ensurePositiveInt(limit, DEFAULT_LIMIT), [limit]);
  const normalizedTag = useMemo(() => (typeof tag === 'string' ? tag.trim() : ''), [tag]);

  useEffect(() => {
    setStatus(VIDEOS_STATUS.loading);
    setError(null);

    const unsubscribe = subscribeToVideos({
      tag: normalizedTag,
      limit: effectiveLimit,
      onNext: (docs) => {
        setItems(docs);
        setStatus(docs.length === 0 ? VIDEOS_STATUS.empty : VIDEOS_STATUS.ready);
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
