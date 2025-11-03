import React, { useEffect, useMemo, useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { HOME_SECTION_TITLES } from '../../constants/homeSections';
import { sanitizeEmbedUrl, normalizeTags, upsertFeaturedVideo } from '../../services/videos';

const HERO_COLLECTION = 'hero';
const HERO_DOC_ID = 'featured';

const HeroForm = ({ currentTitle, currentVideoUrl, currentTag, currentTags = [], onSuccess, onError, setFeedback }) => {
  const initialNormalizedTags = useMemo(() => {
    if (Array.isArray(currentTags) && currentTags.length > 0) {
      return normalizeTags(currentTags);
    }
    if (typeof currentTag === 'string' && currentTag.trim().length > 0) {
      return normalizeTags([currentTag]);
    }
    return [];
  }, [currentTags, currentTag]);

  const [formData, setFormData] = useState(() => ({
    title: currentTitle ?? '',
    videoUrl: currentVideoUrl ?? '',
    tags: initialNormalizedTags
  }));
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    setFormData({
      title: currentTitle ?? '',
      videoUrl: currentVideoUrl ?? '',
      tags: initialNormalizedTags
    });
    setStatus('idle');
  }, [currentTitle, currentVideoUrl, initialNormalizedTags]);

  const isTitleValid = formData.title.trim().length >= 10;
  const sanitizedVideoUrl = useMemo(() => sanitizeEmbedUrl(formData.videoUrl), [formData.videoUrl]);
  const isVideoValid = sanitizedVideoUrl.length > 0;
  const normalizedTags = useMemo(() => normalizeTags(formData.tags), [formData.tags]);
  const isTagValid = normalizedTags.length > 0;
  const initialTagsSignature = useMemo(() => initialNormalizedTags.slice().sort().join('|'), [initialNormalizedTags]);
  const currentTagsSignature = useMemo(() => normalizedTags.slice().sort().join('|'), [normalizedTags]);
  const isDirty =
    formData.title.trim() !== (currentTitle ?? '').trim() ||
    sanitizedVideoUrl !== (currentVideoUrl ?? '')?.trim() ||
    currentTagsSignature !== initialTagsSignature;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagToggle = (tag) => {
    setFormData((prev) => {
      const hasTag = prev.tags.includes(tag);
      const nextTags = hasTag ? prev.tags.filter((value) => value !== tag) : [...prev.tags, tag];
      return { ...prev, tags: nextTags };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isTitleValid || !isVideoValid || !isTagValid || !isDirty) return;

    try {
      setStatus('saving');
      const heroDocRef = doc(db, HERO_COLLECTION, HERO_DOC_ID);
      await setDoc(
        heroDocRef,
        {
          title: formData.title.trim(),
          videoUrl: sanitizedVideoUrl,
          tag: normalizedTags[0],
          tags: normalizedTags,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        },
        { merge: true }
      );
      await upsertFeaturedVideo({
        title: formData.title.trim(),
        embedUrl: sanitizedVideoUrl,
        tags: normalizedTags
      });
      setStatus('success');
      setFormData((prev) => ({ ...prev, videoUrl: sanitizedVideoUrl, tags: normalizedTags }));
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
          onChange={handleInputChange}
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
          onChange={handleInputChange}
          placeholder="https://www.youtube.com/embed/XXXXXXXXXXX"
          required
        />
        {!isVideoValid ? (
          <p className="admin-form__hint">Usa el link de inserción (Embed) de YouTube, formato youtube.com/embed/ID.</p>
        ) : null}
      </div>

      <div className="admin-form__field">
        <span>Etiquetas vinculadas</span>
        <div className="video-form__tags">
          {HOME_SECTION_TITLES.map((tag) => {
            const isActive = formData.tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                className={`video-form__tag${isActive ? ' is-active' : ''}`}
                onClick={() => handleTagToggle(tag)}
                aria-pressed={isActive}
              >
                {tag}
              </button>
            );
          })}
        </div>
        {!isTagValid ? <p className="admin-form__hint">Selecciona al menos una etiqueta para sincronizar la portada.</p> : null}
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
        <button
          type="submit"
          disabled={!isDirty || !isTitleValid || !isVideoValid || !isTagValid || status === 'saving'}
        >
          {status === 'saving' ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {status === 'success' ? <span className="admin-form__status admin-form__status--success">Cambios guardados.</span> : null}
        {status === 'error' ? <span className="admin-form__status admin-form__status--error">Ocurrió un error. Intenta de nuevo.</span> : null}
      </div>
    </form>
  );
};

export default HeroForm;
