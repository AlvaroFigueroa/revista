import { useEffect, useMemo, useState } from 'react';
import { subscribeToNews } from '../services/news';

const DEFAULT_LIMIT = 5;

export const NEWS_STATUS = Object.freeze({
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

export function useNews({ tag, limit = DEFAULT_LIMIT } = {}) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState(NEWS_STATUS.idle);
  const [error, setError] = useState(null);

  const normalizedTag = useMemo(() => (typeof tag === 'string' ? tag.trim() : ''), [tag]);
  const effectiveLimit = useMemo(() => ensurePositiveInt(limit, DEFAULT_LIMIT), [limit]);

  useEffect(() => {
    setStatus(NEWS_STATUS.loading);
    setError(null);

    const unsubscribe = subscribeToNews({
      tag: normalizedTag,
      limit: effectiveLimit,
      onNext: (docs) => {
        setItems(docs);
        setStatus(docs.length === 0 ? NEWS_STATUS.empty : NEWS_STATUS.ready);
      },
      onError: (subscriptionError) => {
        setError(subscriptionError);
        setStatus(NEWS_STATUS.error);
      }
    });

    return () => unsubscribe?.();
  }, [normalizedTag, effectiveLimit]);

  return { items, status, error, tag: normalizedTag, limit: effectiveLimit };
}
