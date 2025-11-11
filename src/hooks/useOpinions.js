import { useEffect, useState } from 'react';
import { subscribeToOpinions } from '../services/opinions';

export const OPINIONS_STATUS = Object.freeze({ idle: 'idle', loading: 'loading', ready: 'ready', empty: 'empty', error: 'error' });

export function useOpinions({ limit = 10 } = {}) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState(OPINIONS_STATUS.idle);
  const [error, setError] = useState(null);

  useEffect(() => {
    setStatus(OPINIONS_STATUS.loading);
    setError(null);
    const unsub = subscribeToOpinions({ limit, onNext: (docs) => {
      setItems(docs);
      setStatus(docs.length === 0 ? OPINIONS_STATUS.empty : OPINIONS_STATUS.ready);
    }, onError: (e) => {
      setError(e);
      setStatus(OPINIONS_STATUS.error);
    }});
    return () => unsub?.();
  }, [limit]);

  return { items, status, error };
}
