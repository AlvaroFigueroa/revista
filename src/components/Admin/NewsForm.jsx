import { NAVIGATION_TAGS } from '../../constants/navigationTags';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { HOME_SECTION_TITLES, EXCLUDED_EDITOR_TAGS } from '../../constants/homeSections';
import { uploadNewsImage, UploadError } from '../../services/uploads';

const ARTICLE_ID_MIN_LENGTH = 6;

const toInputDate = (value) => {
  if (!value) return '';
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
    return '';
  }
  if (value?.toDate) {
    return value.toDate().toISOString().slice(0, 10);
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return '';
};

const formatPreviewDate = (value) => {
  if (!value) return '';
  let date;
  if (value?.toDate) {
    date = value.toDate();
  } else if (typeof value === 'string') {
    date = new Date(value);
  } else if (value instanceof Date) {
    date = value;
  }

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('es-CL', { dateStyle: 'medium' });
};

const getInitialState = (defaults) => ({
  id: defaults?.id ?? '',
  title: defaults?.title ?? '',
  lead: defaults?.lead ?? '',
  body: defaults?.body ?? '',
  source: defaults?.source ?? '',
  articleDate: toInputDate(defaults?.articleDate) ?? '',
  tags: Array.isArray(defaults?.tags) ? defaults.tags : [],
  imageUrl: defaults?.imageUrl ?? ''
});

const NewsForm = ({
  mode = 'create',
  defaultValues = null,
  status = 'idle',
  errorMessage = null,
  onSubmit,
  onCancel,
  onFeedback
}) => {
  const [formData, setFormData] = useState(() => getInitialState(defaultValues));
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(() => defaultValues?.imageUrl ?? '');
  const [localError, setLocalError] = useState(null);
  const fileInputRef = useRef(null);
  const excludedTagsSet = useMemo(() => new Set(EXCLUDED_EDITOR_TAGS), []);
  const combinedTags = useMemo(() => {
    const raw = [...HOME_SECTION_TITLES, ...Object.values(NAVIGATION_TAGS)];
    return Array.from(new Set(raw.filter((tag) => !excludedTagsSet.has(tag))));
  }, [excludedTagsSet]);

  useEffect(() => {
    setFormData(getInitialState(defaultValues));
    setImageFile(null);
    setImagePreview(defaultValues?.imageUrl ?? '');
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [
    defaultValues?.id,
    defaultValues?.title,
    defaultValues?.lead,
    defaultValues?.body,
    defaultValues?.source,
    defaultValues?.articleDate,
    defaultValues?.tags,
    defaultValues?.imageUrl
  ]);

  useEffect(() => {
    if (!imageFile) return undefined;
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  useEffect(() => {
    if (status === 'success') {
      const successText = mode === 'edit' ? 'Noticia actualizada correctamente.' : 'Noticia creada correctamente.';
      onFeedback?.({ type: 'success', text: successText });
      setLocalError(null);
      if (mode === 'create') {
        setFormData(getInitialState(defaultValues));
        setImageFile(null);
        setImagePreview(defaultValues?.imageUrl ?? '');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } else if (status === 'error' && errorMessage) {
      setLocalError(errorMessage);
      onFeedback?.({ type: 'error', text: errorMessage });
    }
  }, [status, errorMessage, mode, defaultValues, onFeedback]);

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

  const resetFile = () => {
    setImageFile(null);
    setImagePreview(defaultValues?.imageUrl ?? '');
    setFormData((prev) => ({
      ...prev,
      imageUrl: defaultValues?.imageUrl ?? ''
    }));
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      resetFile();
      return;
    }
    setImageFile(file);
    setLocalError(null);
  };

  const trimmedId = (formData.id ?? '').trim();
  const trimmedTitle = formData.title.trim();
  const trimmedLead = formData.lead.trim();
  const trimmedBody = formData.body.trim();
  const trimmedSource = formData.source.trim();
  const trimmedDate = formData.articleDate.trim();

  const isIdValid = trimmedId.length >= ARTICLE_ID_MIN_LENGTH;
  const isTitleValid = trimmedTitle.length > 0;
  const isLeadValid = trimmedLead.length > 0;
  const isBodyValid = trimmedBody.length > 0;
  const areTagsValid = Array.isArray(formData.tags) && formData.tags.length > 0;
  const isDateValid = trimmedDate.length > 0;
  const isImageProvided = Boolean(imageFile || formData.imageUrl.trim());

  const formSnapshot = useMemo(() => JSON.stringify(getInitialState(defaultValues)), [defaultValues]);
  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        ...formData,
        articleDate: trimmedDate,
        title: trimmedTitle,
        lead: trimmedLead,
        body: trimmedBody,
        source: trimmedSource,
        imageUrl: imageFile ? '' : formData.imageUrl
      }),
    [formData, trimmedTitle, trimmedLead, trimmedBody, trimmedSource, trimmedDate, imageFile]
  );
  const isDirty = formSnapshot !== currentSnapshot || Boolean(imageFile);

  const canSubmit =
    typeof onSubmit === 'function' &&
    isIdValid &&
    isTitleValid &&
    isLeadValid &&
    isBodyValid &&
    areTagsValid &&
    isDateValid &&
    isImageProvided &&
    isDirty &&
    status !== 'saving';

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setLocalError(null);

    try {
      let finalImageUrl = formData.imageUrl ?? '';
      if (imageFile) {
        finalImageUrl = await uploadNewsImage(imageFile, trimmedId);
      }

      await onSubmit({
        id: trimmedId,
        title: trimmedTitle,
        lead: trimmedLead,
        body: trimmedBody,
        source: trimmedSource,
        articleDate: trimmedDate,
        tags: formData.tags,
        imageUrl: finalImageUrl
      });
    } catch (error) {
      console.error('No pudimos procesar la noticia', error);
      if (error instanceof UploadError) {
        setLocalError(error.message);
        onFeedback?.({ type: 'error', text: error.message });
      } else {
        const fallbackMessage = error?.message || 'Ocurrió un error al guardar la noticia. Intenta nuevamente.';
        setLocalError(fallbackMessage);
        onFeedback?.({ type: 'error', text: fallbackMessage });
      }
    }
  };

  return (
    <form className="admin-form news-form" onSubmit={handleSubmit} noValidate>
      <fieldset disabled={status === 'saving'}>
        <legend>{mode === 'edit' ? 'Editar noticia' : 'Agregar nueva noticia'}</legend>

        <div className="admin-form__field">
          <label htmlFor="news-id">Identificador interno</label>
          <input id="news-id" name="id" type="text" value={formData.id} onChange={handleInputChange} readOnly />
          <small>Se utiliza para almacenar la imagen y sincronizar con Firestore.</small>
          {!isIdValid ? (
            <p className="admin-form__hint">
              No se pudo generar el identificador de la noticia. Cierra y vuelve a abrir el formulario.
            </p>
          ) : null}
        </div>

        <div className="admin-form__field">
          <label htmlFor="news-title">Título</label>
          <input
            id="news-title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          <small>{`Caracteres: ${trimmedTitle.length}`}</small>
          {!isTitleValid ? <p className="admin-form__hint">Ingresa un título para la noticia.</p> : null}
        </div>

        <div className="admin-form__field">
          <label htmlFor="news-lead">Bajada (se mostrará en negrita)</label>
          <textarea
            id="news-lead"
            name="lead"
            value={formData.lead}
            onChange={handleInputChange}
            required
          />
          <small>{`Caracteres: ${trimmedLead.length}`}</small>
          {!isLeadValid ? <p className="admin-form__hint">La bajada es obligatoria.</p> : null}
        </div>

        <div className="admin-form__field">
          <label htmlFor="news-body">Artículo completo</label>
          <textarea
            id="news-body"
            name="body"
            value={formData.body}
            onChange={handleInputChange}
            rows={10}
            required
          />
          <small>{`Caracteres: ${trimmedBody.length}`}</small>
          {!isBodyValid ? <p className="admin-form__hint">El artículo necesita contenido.</p> : null}
        </div>

        <div className="admin-form__field news-form__grid">
          <label htmlFor="news-date">Fecha</label>
          <input
            id="news-date"
            name="articleDate"
            type="date"
            value={formData.articleDate}
            onChange={handleInputChange}
            required
          />
          {!isDateValid ? <p className="admin-form__hint">Selecciona la fecha de publicación.</p> : null}
        </div>

        <div className="admin-form__field">
          <label htmlFor="news-source">Fuente (se mostrará en ficha)</label>
          <input
            id="news-source"
            name="source"
            type="text"
            value={formData.source}
            onChange={handleInputChange}
            maxLength={120}
          />
        </div>

        <div className="admin-form__field">
          <span>Secciones (elige al menos una)</span>
          <div className="video-form__tags">
            {combinedTags.map((tag) => {
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
            <p className="admin-form__hint">Selecciona al menos una sección para clasificar la noticia.</p>
          ) : null}
        </div>

        <div className="admin-form__field news-form__field--file">
          <label htmlFor="news-image">Fotografía principal</label>
          <input
            id="news-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <small>Formatos permitidos: JPG, PNG o WebP. Máximo 5MB.</small>
          <div className="news-form__alternate-url">
            <label htmlFor="news-image-url">O pega la URL de una imagen existente</label>
            <input
              id="news-image-url"
              name="imageUrl"
              type="url"
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={handleInputChange}
            />
          </div>
          {imagePreview ? (
            <figure className="news-form__preview" aria-label="Previsualización de la imagen">
              <img src={imagePreview} alt="Previsualización de la noticia" />
              {defaultValues?.imageUrl && imageFile ? (
                <figcaption>Mostrando imagen seleccionada. Si cancelas, se conservará la anterior.</figcaption>
              ) : null}
            </figure>
          ) : null}
          {imageFile && mode === 'edit' ? (
            <button type="button" className="news-form__reset" onClick={resetFile}>
              Usar la fotografía original
            </button>
          ) : null}
          {!isImageProvided ? (
            <p className="admin-form__hint">Selecciona o conserva una fotografía para la noticia.</p>
          ) : null}
        </div>

        <div className="news-form__summary" role="note">
          <h3>Previsualización de metadatos</h3>
          <ul>
            <li>
              <span>Secciones:</span> {areTagsValid ? formData.tags.join(', ') : 'Sin etiquetas'}
            </li>
            <li>
              <span>Fecha:</span> {formatPreviewDate(formData.articleDate) || 'Sin fecha definida'}
            </li>
            <li>
              <span>Fuente:</span> {trimmedSource || 'Sin fuente especificada'}
            </li>
          </ul>
        </div>

        <div className="admin-form__actions">
          <button type="submit" disabled={!canSubmit}>
            {status === 'saving' ? 'Guardando…' : mode === 'edit' ? 'Guardar cambios' : 'Publicar noticia'}
          </button>
          {typeof onCancel === 'function' ? (
            <button type="button" className="admin-form__secondary" onClick={onCancel}>
              Cancelar
            </button>
          ) : null}
        </div>

        {status === 'success' ? (
          <p className="admin-form__status admin-form__status--success" role="status">
            {mode === 'edit' ? 'Noticia actualizada correctamente.' : 'Noticia creada correctamente.'}
          </p>
        ) : null}

        {status === 'error' && (localError || errorMessage) ? (
          <p className="admin-form__status admin-form__status--error" role="alert">
            {localError || errorMessage}
          </p>
        ) : null}
      </fieldset>
    </form>
  );
};

NewsForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  defaultValues: PropTypes.shape({
    title: PropTypes.string,
    lead: PropTypes.string,
    body: PropTypes.string,
    source: PropTypes.string,
    articleDate: PropTypes.any,
    tags: PropTypes.arrayOf(PropTypes.string),
    imageUrl: PropTypes.string,
    id: PropTypes.string
  }),
  status: PropTypes.oneOf(['idle', 'saving', 'success', 'error']),
  errorMessage: PropTypes.string,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  onFeedback: PropTypes.func
};

export default NewsForm;
