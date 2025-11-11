import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { generateEventId } from '../../services/events';

const getInitial = (defaults) => ({
  id: defaults?.id || generateEventId(),
  title: defaults?.title || '',
  location: defaults?.location || '',
  description: defaults?.description || '',
  date: defaults?.date || '',
  time: defaults?.time || '',
  ctaUrl: defaults?.ctaUrl || ''
});

const EventForm = ({ mode = 'create', defaultValues = null, status = 'idle', errorMessage = null, onSubmit, onCancel, onFeedback }) => {
  const [formData, setFormData] = useState(() => getInitial(defaultValues));
  const [localError, setLocalError] = useState(null);
  const mounted = useRef(true);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  useEffect(() => {
    setFormData(getInitial(defaultValues));
    setLocalError(null);
  }, [defaultValues?.id, defaultValues?.title, defaultValues?.location, defaultValues?.description, defaultValues?.date, defaultValues?.time, defaultValues?.ctaUrl]);

  useEffect(() => {
    if (status === 'success') {
      onFeedback?.({ type: 'success', text: mode === 'edit' ? 'Evento actualizado.' : 'Evento publicado.' });
    } else if (status === 'error' && errorMessage) {
      onFeedback?.({ type: 'error', text: errorMessage });
    }
  }, [status, errorMessage, mode, onFeedback]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const trimmed = useMemo(() => ({
    id: (formData.id || '').trim(),
    title: (formData.title || '').trim(),
    location: (formData.location || '').trim(),
    description: (formData.description || '').trim(),
    date: (formData.date || '').trim(),
    time: (formData.time || '').trim(),
    ctaUrl: (formData.ctaUrl || '').trim()
  }), [formData]);

  const valid = trimmed.id && trimmed.title && trimmed.date; // time opcional pero recomendado

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid || typeof onSubmit !== 'function') return;
    try {
      await onSubmit({ ...trimmed });
    } catch (err) {
      const msg = err?.message || 'No pudimos guardar el evento.';
      setLocalError(msg);
      onFeedback?.({ type: 'error', text: msg });
    }
  };

  return (
    <form className="admin-form event-form" onSubmit={handleSubmit} noValidate>
      <fieldset disabled={status === 'saving'}>
        <legend>{mode === 'edit' ? 'Editar evento' : 'Agregar evento'}</legend>

        <div className="admin-form__field">
          <label htmlFor="ev-id">Identificador</label>
          <input id="ev-id" name="id" type="text" value={trimmed.id} readOnly />
        </div>

        <div className="admin-form__field">
          <label htmlFor="ev-title">Título</label>
          <input id="ev-title" name="title" type="text" value={formData.title} onChange={handleChange} required />
        </div>

        <div className="admin-form__field">
          <label htmlFor="ev-location">Lugar</label>
          <input id="ev-location" name="location" type="text" value={formData.location} onChange={handleChange} />
        </div>

        <div className="admin-form__field">
          <label htmlFor="ev-date">Fecha</label>
          <input id="ev-date" name="date" type="date" value={formData.date} onChange={handleChange} required />
        </div>

        <div className="admin-form__field">
          <label htmlFor="ev-time">Hora</label>
          <input id="ev-time" name="time" type="time" value={formData.time} onChange={handleChange} />
        </div>

        <div className="admin-form__field">
          <label htmlFor="ev-description">Descripción</label>
          <textarea id="ev-description" name="description" rows={5} value={formData.description} onChange={handleChange} />
        </div>

        <div className="admin-form__field">
          <label htmlFor="ev-cta">URL de inscripción (opcional)</label>
          <input id="ev-cta" name="ctaUrl" type="url" placeholder="https://..." value={formData.ctaUrl} onChange={handleChange} />
        </div>

        {localError ? (
          <p className="admin-form__status admin-form__status--error" role="alert">{localError}</p>
        ) : null}

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

EventForm.propTypes = {
  mode: PropTypes.oneOf(['create','edit']),
  defaultValues: PropTypes.object,
  status: PropTypes.oneOf(['idle','saving','success','error']),
  errorMessage: PropTypes.string,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  onFeedback: PropTypes.func
};

export default EventForm;
