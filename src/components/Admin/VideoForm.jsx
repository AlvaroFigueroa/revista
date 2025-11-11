import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { HOME_SECTION_TITLES, EXCLUDED_EDITOR_TAGS } from '../../constants/homeSections';
import { NAVIGATION_TAGS } from '../../constants/navigationTags';
import { sanitizeEmbedUrl } from '../../services/videos';

const MIN_TITLE_LENGTH = 6;

const VideoForm = ({
  mode = 'create',
  defaultValues = null,
  onSubmit,
  onCancel,
  status = 'idle',
  errorMessage = null,
  onFeedback
}) => {
  const AVAILABLE_TAGS = useMemo(() => {
    const excluded = new Set(EXCLUDED_EDITOR_TAGS || []);
    const combined = [...HOME_SECTION_TITLES, ...Object.values(NAVIGATION_TAGS || {})];
    return Array.from(new Set(combined.filter((t) => typeof t === 'string' && t.trim().length > 0 && !excluded.has(t))));
  }, []);

  const AVAILABLE_TAGS_SET = useMemo(() => new Set(AVAILABLE_TAGS), [AVAILABLE_TAGS]);
  const [formData, setFormData] = useState(() => ({
    title: defaultValues?.title ?? '',
    embedUrl: defaultValues?.embedUrl ?? '',
    tags: defaultValues?.tags ?? []
  }));

  useEffect(() => {
    setFormData({
      title: defaultValues?.title ?? '',
      embedUrl: defaultValues?.embedUrl ?? '',
      tags: defaultValues?.tags ?? []
    });
  }, [defaultValues?.title, defaultValues?.embedUrl, defaultValues?.tags]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagToggle = (tag) => {
    setFormData((prev) => {
      const hasTag = prev.tags.includes(tag);
      return {
        ...prev,
        tags: hasTag ? prev.tags.filter((value) => value !== tag) : [...prev.tags, tag]
      };
    });
  };

  const sanitizedEmbedUrl = useMemo(() => sanitizeEmbedUrl(formData.embedUrl), [formData.embedUrl]);
  const isTitleValid = formData.title.trim().length >= MIN_TITLE_LENGTH;
  const areTagsValid = formData.tags.length > 0;
  const isEmbedValid = sanitizedEmbedUrl.length > 0;

  const isDirty = useMemo(() => {
    if (!defaultValues) return true;
    const initialTitle = defaultValues.title ?? '';
    const initialUrl = defaultValues.embedUrl ?? '';
    const initialTags = Array.isArray(defaultValues.tags) ? defaultValues.tags : [];

    const currentTitle = formData.title;
    const currentUrl = formData.embedUrl;
    const currentTags = formData.tags.slice().sort();
    const normalizedInitialTags = initialTags.slice().sort();

    return (
      currentTitle !== initialTitle ||
      currentUrl !== initialUrl ||
      currentTags.length !== normalizedInitialTags.length ||
      currentTags.some((tag, index) => tag !== normalizedInitialTags[index])
    );
  }, [defaultValues, formData.title, formData.embedUrl, formData.tags]);

  const canSubmit = isTitleValid && isEmbedValid && areTagsValid && isDirty && typeof onSubmit === 'function';

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      title: formData.title.trim(),
      embedUrl: sanitizedEmbedUrl,
      tags: formData.tags
    });
  };

  useEffect(() => {
    if (status === 'success') {
      const successText =
        mode === 'edit' ? 'Video actualizado correctamente.' : 'Video agregado correctamente.';
      onFeedback?.({ type: 'success', text: successText });
    } else if (status === 'error' && errorMessage) {
      onFeedback?.({ type: 'error', text: errorMessage });
    }
  }, [status, errorMessage, mode, onFeedback]);

  return (
    <form className="admin-form video-form" onSubmit={handleSubmit} noValidate>
      <fieldset disabled={status === 'saving'}>
        <legend>{mode === 'edit' ? 'Editar video' : 'Agregar nuevo video'}</legend>

        <div className="admin-form__field">
          <label htmlFor="video-title">Título del video</label>
          <input
            id="video-title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleInputChange}
            minLength={MIN_TITLE_LENGTH}
            maxLength={140}
            required
          />
          <small>{formData.title.trim().length} / 140 caracteres</small>
          {!isTitleValid ? (
            <p className="admin-form__hint">El título debe tener al menos {MIN_TITLE_LENGTH} caracteres.</p>
          ) : null}
        </div>

        <div className="admin-form__field">
          <label htmlFor="video-embed-url">URL embed de YouTube</label>
          <input
            id="video-embed-url"
            name="embedUrl"
            type="url"
            value={formData.embedUrl}
            onChange={handleInputChange}
            placeholder="https://www.youtube.com/embed/XXXXXXXXXXX"
            required
          />
          {!isEmbedValid ? (
            <p className="admin-form__hint">Usa el enlace de inserción (YouTube embed) con el formato youtube.com/embed/ID.</p>
          ) : null}
        </div>

        <div className="admin-form__field">
          <span>Etiquetas (elige al menos una)</span>
          <div className="video-form__tags">
            {AVAILABLE_TAGS.map((tag) => {
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
          {!areTagsValid ? (
            <p className="admin-form__hint">Selecciona al menos una etiqueta para organizar el video.</p>
          ) : null}
        </div>

        {typeof onCancel === 'function' ? (
          <div className="admin-form__actions">
            <button type="submit" disabled={!canSubmit}>
              {status === 'saving' ? 'Guardando…' : mode === 'edit' ? 'Guardar cambios' : 'Agregar video'}
            </button>
            <button type="button" onClick={onCancel} className="admin-form__secondary">
              Cancelar
            </button>
          </div>
        ) : (
          <div className="admin-form__actions">
            <button type="submit" disabled={!canSubmit}>
              {status === 'saving' ? 'Guardando…' : 'Guardar video'}
            </button>
          </div>
        )}

        {status === 'success' ? (
          <p className="admin-form__status admin-form__status--success" role="status">
            {mode === 'edit' ? 'Video actualizado correctamente.' : 'Video agregado correctamente.'}
          </p>
        ) : null}
        {status === 'error' && errorMessage ? (
          <p className="admin-form__status admin-form__status--error" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </fieldset>

      {isEmbedValid ? (
        <div className="video-form__preview" aria-label="Previsualización del video">
          <iframe
            src={sanitizedEmbedUrl}
            title="Previsualización del video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      ) : null}
    </form>
  );
};

VideoForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  defaultValues: PropTypes.shape({
    title: PropTypes.string,
    embedUrl: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string)
  }),
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  status: PropTypes.oneOf(['idle', 'saving', 'success', 'error']),
  errorMessage: PropTypes.string
};

export default VideoForm;
