import React, { useEffect, useMemo, useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { sanitizeEmbedUrl } from '../../services/videos';

const HERO_COLLECTION = 'hero';
const HERO_DOC_ID = 'featured';

const HeroForm = ({ currentTitle, currentVideoUrl, onSuccess, onError, setFeedback }) => {
  const [formData, setFormData] = useState(() => ({
    title: currentTitle ?? '',
    videoUrl: currentVideoUrl ?? ''
  }));
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    setFormData({
      title: currentTitle ?? '',
      videoUrl: currentVideoUrl ?? ''
    });
    setStatus('idle');
  }, [currentTitle, currentVideoUrl]);

  const isTitleValid = formData.title.trim().length >= 10;
  const sanitizedVideoUrl = useMemo(() => sanitizeEmbedUrl(formData.videoUrl), [formData.videoUrl]);
  const isVideoValid = sanitizedVideoUrl.length > 0;
  const isDirty = formData.title.trim() !== (currentTitle ?? '').trim() || sanitizedVideoUrl !== (currentVideoUrl ?? '')?.trim();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isTitleValid || !isVideoValid || !isDirty) return;

    try {
      setStatus('saving');
      const heroDocRef = doc(db, HERO_COLLECTION, HERO_DOC_ID);
      await setDoc(
        heroDocRef,
        {
          title: formData.title.trim(),
          videoUrl: sanitizedVideoUrl,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        },
        { merge: true }
      );
      setStatus('success');
      setFormData((prev) => ({ ...prev, videoUrl: sanitizedVideoUrl }));
      setFeedback?.({ type: 'success', text: 'Hero actualizado correctamente.' });
      onSuccess?.();
    } catch (error) {
      console.error('No pudimos actualizar el hero', error);
      setStatus('error');
      setFeedback?.({ type: 'error', text: 'No pudimos actualizar el hero. Intenta nuevamente.' });
      onError?.(error);
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form__field">
        <label htmlFor="hero-title">Título destacado</label>
        <textarea
          id="hero-title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          minLength={10}
          maxLength={220}
          required
        />
        <small>{formData.title.trim().length} / 220 caracteres</small>
        {!isTitleValid ? <p className="admin-form__hint">Escribe al menos 10 caracteres.</p> : null}
      </div>

      <div className="admin-form__field">
        <label htmlFor="hero-video-url">URL del video (embed de YouTube)</label>
        <input
          id="hero-video-url"
          type="url"
          name="videoUrl"
          value={formData.videoUrl}
          onChange={handleChange}
          placeholder="https://www.youtube.com/embed/XXXXXXXXXXX"
          required
        />
        {!isVideoValid ? (
          <p className="admin-form__hint">Usa el link de inserción (Embed) de YouTube, formato youtube.com/embed/ID.</p>
        ) : null}
      </div>

      {isVideoValid ? (
        <div className="admin-form__preview" aria-label="Previsualización del video">
          <iframe
            src={sanitizedVideoUrl}
            title="Previsualización"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      ) : null}

      <div className="admin-form__actions">
        <button type="submit" disabled={!isDirty || !isTitleValid || !isVideoValid || status === 'saving'}>
          {status === 'saving' ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {status === 'success' ? <span className="admin-form__status admin-form__status--success">Cambios guardados.</span> : null}
        {status === 'error' ? <span className="admin-form__status admin-form__status--error">Ocurrió un error. Intenta de nuevo.</span> : null}
      </div>
    </form>
  );
};

export default HeroForm;
