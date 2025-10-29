import { useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const HERO_COLLECTION = 'hero';
const HERO_DOC_ID = 'featured';

const defaultContent = Object.freeze({
  title: 'Plan piloto de lechería inteligente reduce 18% la huella hídrica en Llanquihue',
  videoUrl: 'https://www.youtube.com/embed/_jDeXfDVK10?autoplay=1&mute=1&rel=0&playsinline=1'
});

export const HERO_STATUS = Object.freeze({
  loading: 'loading',
  ready: 'ready',
  empty: 'empty',
  error: 'error'
});

export function useHeroContent() {
  const [data, setData] = useState(defaultContent);
  const [status, setStatus] = useState(HERO_STATUS.loading);
  const [error, setError] = useState(null);

  useEffect(() => {
    const heroDocRef = doc(db, HERO_COLLECTION, HERO_DOC_ID);

    const unsubscribe = onSnapshot(
      heroDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const payload = snapshot.data();
          setData({
            title: typeof payload?.title === 'string' && payload.title.trim().length > 0 ? payload.title.trim() : defaultContent.title,
            videoUrl: typeof payload?.videoUrl === 'string' && payload.videoUrl.trim().length > 0 ? payload.videoUrl.trim() : defaultContent.videoUrl
          });
          setStatus(HERO_STATUS.ready);
        } else {
          setData(defaultContent);
          setStatus(HERO_STATUS.empty);
        }
      },
      (listenerError) => {
        console.error('No pudimos recuperar el contenido del hero', listenerError);
        setError(listenerError);
        setData(defaultContent);
        setStatus(HERO_STATUS.error);
      }
    );

    return unsubscribe;
  }, []);

  const isFallback = useMemo(() => status === HERO_STATUS.empty || status === HERO_STATUS.error, [status]);

  return { data, status, error, isFallback, heroDocRefPath: [HERO_COLLECTION, HERO_DOC_ID] };
}
