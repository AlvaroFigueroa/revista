import { addDoc, collection, deleteDoc, doc, getDocs, limit as limitConstraint, onSnapshot, orderBy, query, serverTimestamp, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';

const EVENTS_COLLECTION = 'events';
const eventsCollectionRef = collection(db, EVENTS_COLLECTION);

const trim = (v) => (typeof v === 'string' ? v.trim() : '');

export const generateEventId = () => doc(eventsCollectionRef).id;

export const parseStartAt = ({ date, time }) => {
  // date: 'YYYY-MM-DD', time: 'HH:mm' (24h)
  const d = trim(date);
  const t = trim(time);
  if (!d) return null;
  const iso = t ? `${d}T${t}:00` : `${d}T00:00:00`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return Timestamp.fromDate(parsed);
};

export const createEvent = async ({ id, title, location, description, date, time, ctaUrl }) => {
  const payload = {
    title: trim(title),
    location: trim(location),
    description: trim(description),
    ctaUrl: trim(ctaUrl) || '',
    startAt: parseStartAt({ date, time }),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  if (!payload.title) throw new Error('El título es obligatorio.');
  if (!payload.startAt) throw new Error('Debes definir fecha y hora válidas.');

  const ref = id ? doc(eventsCollectionRef, id) : doc(eventsCollectionRef);
  await setDoc(ref, payload);
  return ref;
};

export const updateEvent = async (id, updatesIn) => {
  if (!id) throw new Error('Falta ID del evento');
  const updates = {};
  if (typeof updatesIn.title === 'string') updates.title = trim(updatesIn.title);
  if (typeof updatesIn.location === 'string') updates.location = trim(updatesIn.location);
  if (typeof updatesIn.description === 'string') updates.description = trim(updatesIn.description);
  if (typeof updatesIn.ctaUrl === 'string') updates.ctaUrl = trim(updatesIn.ctaUrl);
  if (typeof updatesIn.date !== 'undefined' || typeof updatesIn.time !== 'undefined') {
    const startAt = parseStartAt({ date: updatesIn.date, time: updatesIn.time });
    if (!startAt) throw new Error('Fecha u hora inválidas.');
    updates.startAt = startAt;
  }
  if (Object.keys(updates).length === 0) return;
  updates.updatedAt = serverTimestamp();
  await updateDoc(doc(db, EVENTS_COLLECTION, id), updates);
};

export const deleteEvent = async (id) => {
  if (!id) throw new Error('Falta ID del evento');
  await deleteDoc(doc(db, EVENTS_COLLECTION, id));
};

export const subscribeToUpcomingEvents = ({ limit = 6, onNext, onError }) => {
  const now = Timestamp.fromDate(new Date());
  const q = query(
    eventsCollectionRef,
    where('startAt', '>=', now),
    orderBy('startAt', 'asc'),
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

export const fetchUpcomingEvents = async ({ limit = 20 } = {}) => {
  const now = Timestamp.fromDate(new Date());
  const q = query(
    eventsCollectionRef,
    where('startAt', '>=', now),
    orderBy('startAt', 'asc'),
    limitConstraint(limit)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
