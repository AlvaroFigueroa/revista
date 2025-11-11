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
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';

const OPINIONS_COLLECTION = 'opinions';
const opinionsCollectionRef = collection(db, OPINIONS_COLLECTION);

export const generateOpinionId = () => doc(opinionsCollectionRef).id;

const trim = (v) => (typeof v === 'string' ? v.trim() : '');
const ensureUrl = (v) => {
  const t = trim(v);
  if (!t) return '';
  return /^https?:\/\//i.test(t) ? t : '';
};

export const createOpinion = async ({ id, title, body, imageUrl, authorName, authorTitle }) => {
  const payload = {
    title: trim(title),
    body: trim(body),
    imageUrl: ensureUrl(imageUrl),
    authorName: trim(authorName),
    authorTitle: trim(authorTitle),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (!payload.title) throw new Error('El título es obligatorio.');
  if (!payload.body) throw new Error('El cuerpo es obligatorio.');
  if (!payload.imageUrl) throw new Error('Debes subir una imagen válida.');
  if (!payload.authorName) throw new Error('El nombre del autor es obligatorio.');

  const ref = id ? doc(opinionsCollectionRef, id) : doc(opinionsCollectionRef);
  await setDoc(ref, payload);
  return ref;
};

export const updateOpinion = async (id, updatesIn) => {
  if (!id) throw new Error('Falta ID de la opinión');
  const updates = {};
  if (typeof updatesIn.title === 'string') updates.title = trim(updatesIn.title);
  if (typeof updatesIn.body === 'string') updates.body = trim(updatesIn.body);
  if (typeof updatesIn.imageUrl === 'string') {
    const url = ensureUrl(updatesIn.imageUrl);
    if (!url) throw new Error('URL de imagen inválida.');
    updates.imageUrl = url;
  }
  if (typeof updatesIn.authorName === 'string') updates.authorName = trim(updatesIn.authorName);
  if (typeof updatesIn.authorTitle !== 'undefined') updates.authorTitle = trim(updatesIn.authorTitle);
  if (Object.keys(updates).length === 0) return;
  updates.updatedAt = serverTimestamp();
  await updateDoc(doc(db, OPINIONS_COLLECTION, id), updates);
};

export const deleteOpinion = async (id) => {
  if (!id) throw new Error('Falta ID de la opinión');
  await deleteDoc(doc(db, OPINIONS_COLLECTION, id));
};

export const subscribeToOpinions = ({ limit = 10, onNext, onError }) => {
  const q = query(
    opinionsCollectionRef,
    orderBy('createdAt', 'desc'),
    limitConstraint(limit)
  );
  return onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onNext?.(docs);
    },
    (e) => onError?.(e)
  );
};

export const fetchOpinions = async ({ limit = 20 } = {}) => {
  const q = query(
    opinionsCollectionRef,
    orderBy('createdAt', 'desc'),
    limitConstraint(limit)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
