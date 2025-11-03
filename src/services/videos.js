import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit as limitConstraint,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../firebase';

const VIDEOS_COLLECTION = 'videos';
const YOUTUBE_EMBED_REGEX = /^https:\/\/(www\.)?youtube\.com\/embed\/[\-\w]{11}(?:[?&].*)?$/i;
const YOUTUBE_SHORT_REGEX = /^https:\/\/(youtu\.be\/)([\-\w]{11})(?:\?.*)?$/i;
const YOUTUBE_WATCH_REGEX = /^https:\/\/(www\.)?youtube\.com\/(?:watch|shorts)\?([^#]+)$/i;
const YOUTUBE_ID_REGEX = /v=([\-\w]{11})/;

const videosCollectionRef = collection(db, VIDEOS_COLLECTION);

export const sanitizeEmbedUrl = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (trimmed.length === 0) return '';

  if (YOUTUBE_EMBED_REGEX.test(trimmed)) {
    return trimmed;
  }

  const shortMatch = trimmed.match(YOUTUBE_SHORT_REGEX);
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[2]}`;
  }

  const watchMatch = trimmed.match(YOUTUBE_WATCH_REGEX);
  if (watchMatch) {
    const params = new URLSearchParams(watchMatch[2]);
    const videoId = params.get('v');
    if (videoId && videoId.length === 11) {
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // shorts/feature?si= etc. may not include v param, try capture from path if present
    const idFromRegex = trimmed.match(/[?&]v=([\-\w]{11})/);
    if (idFromRegex) {
      return `https://www.youtube.com/embed/${idFromRegex[1]}`;
    }
  }

  const standaloneId = trimmed.match(/([\-\w]{11})$/);
  if (standaloneId) {
    return `https://www.youtube.com/embed/${standaloneId[1]}`;
  }
  return '';
};

export const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
    .filter((tag, index, array) => tag.length > 0 && array.indexOf(tag) === index);
};

export const createVideo = async ({ title, embedUrl, tags }) => {
  const trimmedTitle = typeof title === 'string' ? title.trim() : '';
  const validEmbedUrl = sanitizeEmbedUrl(embedUrl);
  const normalizedTags = normalizeTags(tags);

  if (trimmedTitle.length < 6) {
    throw new Error('El título debe tener al menos 6 caracteres.');
  }

  if (!validEmbedUrl) {
    throw new Error('Debes proporcionar un enlace embed válido de YouTube.');
  }

  if (normalizedTags.length === 0) {
    throw new Error('Selecciona al menos una etiqueta para el video.');
  }

  const now = serverTimestamp();
  return addDoc(videosCollectionRef, {
    title: trimmedTitle,
    embedUrl: validEmbedUrl,
    tags: normalizedTags,
    createdAt: now,
    updatedAt: now
  });
};

export const updateVideo = async (id, { title, embedUrl, tags }) => {
  if (!id) {
    throw new Error('El identificador del video es obligatorio.');
  }

  const updates = {};

  if (typeof title === 'string') {
    const trimmed = title.trim();
    if (trimmed.length < 6) {
      throw new Error('El título debe tener al menos 6 caracteres.');
    }
    updates.title = trimmed;
  }

  if (typeof embedUrl === 'string') {
    const validEmbedUrl = sanitizeEmbedUrl(embedUrl);
    if (!validEmbedUrl) {
      throw new Error('Debes proporcionar un enlace embed válido de YouTube.');
    }
    updates.embedUrl = validEmbedUrl;
  }

  if (typeof tags !== 'undefined') {
    const normalizedTags = normalizeTags(tags);
    if (normalizedTags.length === 0) {
      throw new Error('Selecciona al menos una etiqueta para el video.');
    }
    updates.tags = normalizedTags;
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  updates.updatedAt = serverTimestamp();

  const videoDocRef = doc(db, VIDEOS_COLLECTION, id);
  await updateDoc(videoDocRef, updates);
};

export const deleteVideo = async (id) => {
  if (!id) {
    throw new Error('El identificador del video es obligatorio.');
  }

  const videoDocRef = doc(db, VIDEOS_COLLECTION, id);
  await deleteDoc(videoDocRef);
};

const FEATURED_VIDEO_ID = 'hero-featured';

export const upsertFeaturedVideo = async ({ title, embedUrl, tags }) => {
  const trimmedTitle = typeof title === 'string' ? title.trim() : '';
  const validEmbedUrl = sanitizeEmbedUrl(embedUrl);
  const normalizedTags = normalizeTags(tags);

  if (!trimmedTitle || !validEmbedUrl || normalizedTags.length === 0) {
    throw new Error('El hero requiere título, video y al menos una etiqueta para sincronizarse.');
  }

  const featuredDocRef = doc(db, VIDEOS_COLLECTION, FEATURED_VIDEO_ID);

  await setDoc(
    featuredDocRef,
    {
      title: trimmedTitle,
      embedUrl: validEmbedUrl,
      tags: normalizedTags,
      isFeatured: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
};

export const subscribeToVideos = ({ tag, limit = 10, onNext, onError }) => {
  if (typeof onNext !== 'function') {
    throw new Error('Debes proporcionar un callback onNext.');
  }

  const constraints = [];

  if (tag && typeof tag === 'string') {
    constraints.push(where('tags', 'array-contains', tag.trim()));
  }

  constraints.push(orderBy('createdAt', 'desc'));

  if (Number.isInteger(limit) && limit > 0) {
    constraints.push(limitConstraint(limit));
  }

  const videosQuery = query(videosCollectionRef, ...constraints);

  return onSnapshot(
    videosQuery,
    (snapshot) => {
      const items = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data()
      }));
      onNext(items);
    },
    (error) => {
      console.error('Error al escuchar videos', error);
      onError?.(error);
    }
  );
};
