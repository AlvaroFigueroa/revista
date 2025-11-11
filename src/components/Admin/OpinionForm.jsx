import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { uploadNewsImage, UploadError } from '../../services/uploads';
import { generateOpinionId } from '../../services/opinions';

const getInitial = (defaults) => ({
  id: defaults?.id || generateOpinionId(),
  title: defaults?.title || '',
  body: defaults?.body || '',
  imageUrl: defaults?.imageUrl || '',
  authorName: defaults?.authorName || '',
  authorTitle: defaults?.authorTitle || ''
});

const OpinionForm = ({ mode = 'create', defaultValues = null, status = 'idle', errorMessage = null, onSubmit, onCancel, onFeedback }) => {
  const [formData, setFormData] = useState(() => getInitial(defaultValues));
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(defaultValues?.imageUrl || '');
  const [localError, setLocalError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormData(getInitial(defaultValues));
    setImageFile(null);
    setImagePreview(defaultValues?.imageUrl || '');
    setLocalError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [defaultValues?.id, defaultValues?.title, defaultValues?.body, defaultValues?.imageUrl, defaultValues?.authorName, defaultValues?.authorTitle]);

  useEffect(() => {
    if (!imageFile) return undefined;
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    if (status === 'success') {
      onFeedback?.({ type: 'success', text: mode === 'edit' ? 'Opinión actualizada.' : 'Opinión publicada.' });
    } else if (status === 'error' && errorMessage) {
      onFeedback?.({ type: 'error', text: errorMessage });
    }
  }, [status, errorMessage, mode, onFeedback]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(formData.imageUrl || '');
      return;
    }
    setImageFile(file);
  };

  const trimmed = useMemo(() => ({
    id: (formData.id || '').trim(),
    title: (formData.title || '').trim(),
    body: (formData.body || '').trim(),
    imageUrl: (formData.imageUrl || '').trim(),
    authorName: (formData.authorName || '').trim(),
    authorTitle: (formData.authorTitle || '').trim()
  }), [formData]);

  const valid = trimmed.id && trimmed.title && trimmed.body && (imageFile || trimmed.imageUrl) && trimmed.authorName;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid || typeof onSubmit !== 'function') return;
    try {
      let finalUrl = trimmed.imageUrl;
      if (imageFile) finalUrl = await uploadNewsImage(imageFile, trimmed.id);
      await onSubmit({ id: trimmed.id, title: trimmed.title, body: trimmed.body, imageUrl: finalUrl, authorName: trimmed.authorName, authorTitle: trimmed.authorTitle });
    } catch (err) {
      const msg = err instanceof UploadError ? err.message : (err?.message || 'No pudimos guardar la opinión.');
      setLocalError(msg);
      onFeedback?.({ type: 'error', text: msg });
    }
  };

  return (
    <form className="admin-form opinion-form" onSubmit={handleSubmit} noValidate>
      <fieldset disabled={status === 'saving'}>
        <legend>{mode === 'edit' ? 'Editar opinión' : 'Agregar opinión'}</legend>

        <div className="admin-form__field">
          <label htmlFor="op-id">Identificador</label>
          <input id="op-id" name="id" type="text" value={trimmed.id} readOnly />
        </div>

        <div className="admin-form__field">
          <label htmlFor="op-title">Título</label>
          <input id="op-title" name="title" type="text" value={formData.title} onChange={handleChange} required />
        </div>

        <div className="admin-form__field">
          <label htmlFor="op-body">Cuerpo de la opinión</label>
          <textarea id="op-body" name="body" rows={8} value={formData.body} onChange={handleChange} required />
        </div>

        <div className="admin-form__field">
          <label htmlFor="op-author-name">Autor/a</label>
          <input id="op-author-name" name="authorName" type="text" value={formData.authorName} onChange={handleChange} required />
        </div>

        <div className="admin-form__field">
          <label htmlFor="op-author-title">Cargo</label>
          <input id="op-author-title" name="authorTitle" type="text" value={formData.authorTitle} onChange={handleChange} />
        </div>

        {localError ? (
          <p className="admin-form__status admin-form__status--error" role="alert">{localError}</p>
        ) : null}

        <div className="admin-form__field">
          <label htmlFor="op-image">Imagen (avatar)</label>
          <input id="op-image" name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} ref={fileInputRef} />
          <div className="news-form__alternate-url">
            <label htmlFor="op-image-url">O URL</label>
            <input id="op-image-url" name="imageUrl" type="url" placeholder="https://..." value={formData.imageUrl} onChange={handleChange} />
          </div>
          {imagePreview ? (
            <figure className="news-form__preview" aria-label="Previsualización">
              <img src={imagePreview} alt="Previsualización" />
            </figure>
          ) : null}
        </div>

        <div className="admin-form__actions">
          <button type="submit" disabled={!valid || status === 'saving'}>{status === 'saving' ? 'Guardando…' : 'Guardar'}</button>
          {onCancel ? (
            <button type="button" className="admin-form__secondary" onClick={onCancel}>Cancelar</button>
          ) : null}
        </div>
      </fieldset>
    </form>
  );
};

OpinionForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  defaultValues: PropTypes.object,
  status: PropTypes.oneOf(['idle', 'saving', 'success', 'error']),
  errorMessage: PropTypes.string,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  onFeedback: PropTypes.func
};

export default OpinionForm;
