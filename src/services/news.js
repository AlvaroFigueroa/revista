import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit as limitConstraint,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { normalizeTags } from './videos';

const NEWS_COLLECTION = 'news';

const newsCollectionRef = collection(db, NEWS_COLLECTION);

export const generateNewsId = () => doc(newsCollectionRef).id;

const trimText = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const ensureValidImageUrl = (value) => {
  const trimmed = trimText(value);
  if (trimmed.length === 0) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    return '';
  }
  return trimmed;
};

const buildSlug = (title) => {
  const base = trimText(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  const safe = base.length > 0 ? base : 'noticia';
  return `${safe}-${Date.now()}`;
};

const parseArticleDate = (value) => {
  if (!value) return null;
  if (value instanceof Timestamp) return value;
  if (value instanceof Date) return Timestamp.fromDate(value);
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return Timestamp.fromDate(parsed);
    }
  }
  return null;
};

export const createNews = async ({
  id,
  title,
  lead,
  body,
  imageUrl,
  tags,
  source,
  articleDate,
  slug
}) => {
  const trimmedTitle = trimText(title);
  const trimmedLead = trimText(lead);
  const trimmedBody = trimText(body);
  const trimmedSource = trimText(source);
  const normalizedTags = normalizeTags(tags);
  const validImageUrl = ensureValidImageUrl(imageUrl);
  const publishedAt = parseArticleDate(articleDate) ?? serverTimestamp();

  if (!trimmedTitle) {
    throw new Error('El título es obligatorio.');
  }
  if (!trimmedLead) {
    throw new Error('La bajada es obligatoria.');
  }
  if (!trimmedBody) {
    throw new Error('El artículo necesita contenido.');
  }
  if (!validImageUrl) {
    throw new Error('Debes proporcionar una URL válida para la fotografía.');
  }
  if (normalizedTags.length === 0) {
    throw new Error('Selecciona al menos una sección para la noticia.');
  }

  const now = serverTimestamp();
  const newsSlug = slug ? trimText(slug) : buildSlug(trimmedTitle);

  const payload = {
    title: trimmedTitle,
    lead: trimmedLead,
    body: trimmedBody,
    imageUrl: validImageUrl,
    tags: normalizedTags,
    source: trimmedSource || null,
    articleDate: publishedAt,
    createdAt: now,
    updatedAt: now,
    slug: newsSlug
  };

  const docRef = id ? doc(newsCollectionRef, id) : doc(newsCollectionRef);
  await setDoc(docRef, payload);
  return docRef;
};

export const updateNews = async (
  id,
  { title, lead, body, imageUrl, tags, source, articleDate, slug }
) => {
  if (!id) {
    throw new Error('El identificador de la noticia es obligatorio.');
  }

  const updates = {};

  if (typeof title === 'string') {
    const trimmed = trimText(title);
    if (!trimmed) {
      throw new Error('El título es obligatorio.');
    }
    updates.title = trimmed;
  }

  if (typeof lead === 'string') {
    const trimmed = trimText(lead);
    if (!trimmed) {
      throw new Error('La bajada es obligatoria.');
    }
    updates.lead = trimmed;
  }

  if (typeof body === 'string') {
    const trimmed = trimText(body);
    if (!trimmed) {
      throw new Error('El artículo necesita contenido.');
    }
    updates.body = trimmed;
  }

  if (typeof imageUrl === 'string') {
    const validImageUrl = ensureValidImageUrl(imageUrl);
    if (!validImageUrl) {
      throw new Error('Debes proporcionar una URL válida para la fotografía.');
    }
    updates.imageUrl = validImageUrl;
  }

  if (typeof source !== 'undefined') {
    updates.source = trimText(source) || null;
  }

  if (typeof tags !== 'undefined') {
    const normalizedTags = normalizeTags(tags);
    if (normalizedTags.length === 0) {
      throw new Error('Selecciona al menos una sección para la noticia.');
    }
    updates.tags = normalizedTags;
  }

  if (typeof articleDate !== 'undefined') {
    const parsed = parseArticleDate(articleDate);
    if (!parsed) {
      throw new Error('Debes proporcionar una fecha válida.');
    }
    updates.articleDate = parsed;
  }

  if (typeof slug === 'string' && slug.trim().length > 0) {
    updates.slug = slug.trim();
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  updates.updatedAt = serverTimestamp();

  const newsDocRef = doc(db, NEWS_COLLECTION, id);
  await updateDoc(newsDocRef, updates);
};

export const deleteNews = async (id) => {
  if (!id) {
    throw new Error('El identificador de la noticia es obligatorio.');
  }
  const newsDocRef = doc(db, NEWS_COLLECTION, id);
  await deleteDoc(newsDocRef);
};

export const subscribeToNews = ({ tag, limit = 5, onNext, onError }) => {
  if (typeof onNext !== 'function') {
    throw new Error('Debes proporcionar un callback onNext.');
  }

  const constraints = [orderBy('articleDate', 'desc'), orderBy('createdAt', 'desc')];

  if (tag && typeof tag === 'string') {
    constraints.unshift(where('tags', 'array-contains', tag.trim()));
  }

  if (Number.isInteger(limit) && limit > 0) {
    constraints.push(limitConstraint(limit));
  }

  const queryRef = query(newsCollectionRef, ...constraints);

  return onSnapshot(
    queryRef,
    (snapshot) => {
      const docs = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
      onNext(docs);
    },
    (error) => {
      console.error('No pudimos recuperar las noticias', error);
      onError?.(error);
    }
  );
};

export const getNewsBySlug = async (slug) => {
  if (!slug) return null;
  const trimmed = trimText(slug);
  if (!trimmed) return null;

  const slugQuery = query(newsCollectionRef, where('slug', '==', trimmed), limitConstraint(1));
  const snapshot = await getDocs(slugQuery);
  if (snapshot.empty) {
    return null;
  }
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
};
