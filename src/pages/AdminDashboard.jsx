import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHeroContent, HERO_STATUS } from '../hooks/useHeroContent';
import HeroForm from '../components/Admin/HeroForm';
import VideoForm from '../components/Admin/VideoForm';
import VideoList from '../components/Admin/VideoList';
import { HOME_SECTION_TITLES } from '../constants/homeSections';
import { useVideos, VIDEOS_STATUS } from '../hooks/useVideos';
import { createVideo, updateVideo, deleteVideo } from '../services/videos';

const DEFAULT_VIDEOS_TAG =
  HOME_SECTION_TITLES.find((title) => title === 'Videos recientes') ?? HOME_SECTION_TITLES[0];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { data, status: heroStatus, isFallback } = useHeroContent();

  const [selectedTag, setSelectedTag] = useState(DEFAULT_VIDEOS_TAG);
  const { items: videos, status: videosStatus, error: videosError } = useVideos({
    tag: selectedTag,
    limit: 10
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formDefaults, setFormDefaults] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formStatus, setFormStatus] = useState('idle');
  const [formError, setFormError] = useState(null);
  const [formInstanceKey, setFormInstanceKey] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const handleHeroSuccess = useCallback(() => {
    // El contenido del hero se actualiza automáticamente con el onSnapshot del hook.
  }, []);

  const currentVideoUrl = useMemo(() => data.videoUrl ?? '', [data.videoUrl]);
  const currentTitle = useMemo(() => data.title ?? '', [data.title]);

  const scheduleFeedbackClear = useCallback(() => {
    window.setTimeout(() => setFeedback(null), 4000);
  }, []);

  const resetFormState = useCallback(() => {
    setFormStatus('idle');
    setFormError(null);
  }, []);

  const openCreateForm = useCallback(() => {
    setFormMode('create');
    setEditingVideo(null);
    setFormDefaults({
      title: '',
      embedUrl: '',
      tags: selectedTag ? [selectedTag] : []
    });
    setIsFormOpen(true);
    resetFormState();
    setFormInstanceKey((prev) => prev + 1);
  }, [resetFormState, selectedTag]);

  const openEditForm = useCallback((video) => {
    setFormMode('edit');
    setEditingVideo(video);
    setFormDefaults({
      title: video.title ?? '',
      embedUrl: video.embedUrl ?? '',
      tags: Array.isArray(video.tags) ? video.tags : []
    });
    setIsFormOpen(true);
    resetFormState();
    setFormInstanceKey((prev) => prev + 1);
  }, [resetFormState]);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setFormMode('create');
    setEditingVideo(null);
    setFormDefaults(null);
    resetFormState();
  }, [resetFormState]);

  const handleFormSubmit = async (payload) => {
    setFormStatus('saving');
    setFormError(null);

    try {
      if (formMode === 'edit' && editingVideo) {
        await updateVideo(editingVideo.id, payload);
        setFormStatus('success');
        window.setTimeout(() => closeForm(), 800);
      } else {
        await createVideo(payload);
        setFormStatus('success');
        setFormDefaults({
          title: '',
          embedUrl: '',
          tags:
            Array.isArray(payload.tags) && payload.tags.length > 0
              ? payload.tags
              : selectedTag
              ? [selectedTag]
              : []
        });
        setFormInstanceKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error('No pudimos guardar el video', error);
      setFormStatus('error');
    }
  };

  const handleDelete = async (video) => {
    if (!video?.id) return;
    const confirmation = window.confirm(`¿Eliminar el video “${video.title}”?`);
    if (!confirmation) return;

    try {
      await deleteVideo(video.id);
      setFeedback({ type: 'success', text: 'Video eliminado correctamente.' });
      scheduleFeedbackClear();
    } catch (error) {
      console.error('No pudimos eliminar el video', error);
      setFeedback({
        type: 'error',
        text: error.message || 'No pudimos eliminar el video. Intenta nuevamente.'
      });
      scheduleFeedbackClear();
    }
  };

  const handleTagChange = (event) => {
    setSelectedTag(event.target.value);
  };

  const videosStatusForList =
    videosStatus === VIDEOS_STATUS.ready && videos.length === 0 ? VIDEOS_STATUS.empty : videosStatus;

  return (
    <section className="admin-dashboard" aria-labelledby="admin-dashboard-title">
      <header className="admin-dashboard__header">
        <div>
          <h1 id="admin-dashboard-title">Panel de administración</h1>
          <p>Gestiona el contenido destacado del sitio sin modificar la estructura visual.</p>
          {isFallback ? (
            <p className="admin-dashboard__hint" role="note">
              Mostrando el contenido base. Cualquier cambio que guardes reemplazará este contenido inmediatamente.
            </p>
          ) : null}
        </div>
        <div className="admin-dashboard__user">
          <div className="admin-dashboard__user-info">
            <span>
              Sesión iniciada como <strong>{user?.email}</strong>
            </span>
            <Link to="/" className="admin-dashboard__link" target="_blank" rel="noopener noreferrer">
              Ver sitio
            </Link>
          </div>
          <button type="button" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="admin-dashboard__modules">
        <article className="admin-dashboard__module admin-dashboard__module--hero">
          <header className="admin-dashboard__module-header">
            <h2>Hero de portada</h2>
            {heroStatus === HERO_STATUS.loading ? (
              <span className="admin-dashboard__status" role="status">
                Cargando contenido actual…
              </span>
            ) : null}
          </header>
          <HeroForm
            currentTitle={currentTitle}
            currentVideoUrl={currentVideoUrl}
            onSuccess={handleHeroSuccess}
            setFeedback={(payload) => {
              setFeedback(payload);
              scheduleFeedbackClear();
            }}
          />
        </article>

        <article className="admin-dashboard__module admin-dashboard__module--videos">
          <header className="admin-dashboard__module-header">
            <div>
              <h2>Videos recientes en portada</h2>
              <p className="admin-dashboard__helper">
                Asigna etiquetas a cada video. La portada consume hasta 10 videos de la etiqueta seleccionada.
              </p>
            </div>
            <div className="admin-dashboard__module-actions">
              <label className="admin-dashboard__select">
                <span>Etiqueta</span>
                <select value={selectedTag} onChange={handleTagChange}>
                  {HOME_SECTION_TITLES.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" onClick={isFormOpen ? closeForm : openCreateForm}>
                {isFormOpen ? 'Cerrar formulario' : 'Agregar video'}
              </button>
            </div>
          </header>

          {videosError ? (
            <div className="admin-dashboard__status admin-dashboard__status--error" role="alert">
              <p>{videosError.message || 'No pudimos cargar los videos. Intenta nuevamente.'}</p>
              {videosError.requiresIndex && videosError.indexUrl ? (
                <p>
                  Crea el índice compuesto desde{' '}
                  <a href={videosError.indexUrl} target="_blank" rel="noopener noreferrer">
                    este enlace en la consola de Firebase
                  </a>
                  . Una vez generado, vuelve a intentar cargar la etiqueta.
                </p>
              ) : null}
            </div>
          ) : null}

          {isFormOpen ? (
            <VideoForm
              key={formInstanceKey}
              mode={formMode}
              defaultValues={formDefaults}
              status={formStatus}
              errorMessage={formError}
              onSubmit={handleFormSubmit}
              onCancel={closeForm}
              onFeedback={(payload) => {
                setFeedback(payload);
                scheduleFeedbackClear();
              }}
            />
          ) : null}

          <VideoList
            items={videos}
            status={videosStatusForList}
            onEdit={openEditForm}
            onDelete={handleDelete}
          />

          {feedback ? (
            <p
              className={`admin-dashboard__status admin-dashboard__status--${feedback.type}`}
              role={feedback.type === 'error' ? 'alert' : 'status'}
            >
              {feedback.text}
            </p>
          ) : null}
        </article>
      </div>
    </section>
  );
};

export default AdminDashboard;
