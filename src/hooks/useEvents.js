import { useEffect, useState } from 'react';
import { subscribeToUpcomingEvents } from '../services/events';

export const EVENTS_STATUS = Object.freeze({ idle: 'idle', loading: 'loading', ready: 'ready', empty: 'empty', error: 'error' });

export function useEvents({ limit = 6 } = {}) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState(EVENTS_STATUS.idle);
  const [error, setError] = useState(null);

  useEffect(() => {
    setStatus(EVENTS_STATUS.loading);
    setError(null);
    const unsub = subscribeToUpcomingEvents({ limit, onNext: (docs) => {
      setItems(docs);
      setStatus(docs.length === 0 ? EVENTS_STATUS.empty : EVENTS_STATUS.ready);
    }, onError: (e) => {
      setError(e);
      setStatus(EVENTS_STATUS.error);
    }});
    return () => unsub?.();
  }, [limit]);

  return { items, status, error };
}
