import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHeroContent, HERO_STATUS } from '../hooks/useHeroContent';
import HeroForm from '../components/Admin/HeroForm';
import VideoForm from '../components/Admin/VideoForm';
import VideoList from '../components/Admin/VideoList';
import { HOME_SECTION_TITLES } from '../constants/homeSections';
import { createVideo, updateVideo, deleteVideo, fetchVideosPage } from '../services/videos';

import NewsForm from '../components/Admin/NewsForm';
import NewsList from '../components/Admin/NewsList';
import { useNews, NEWS_STATUS } from '../hooks/useNews';
import { createNews, updateNews, deleteNews, generateNewsId } from '../services/news';

const DEFAULT_VIDEOS_TAG =
  HOME_SECTION_TITLES.find((title) => title === 'Videos recientes') ?? HOME_SECTION_TITLES[0];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { data, status: heroStatus, isFallback } = useHeroContent();

  // Por defecto mostrar todos los videos (últimos 10)
  const [selectedTag, setSelectedTag] = useState('Todas');

  // Estado local para listado con paginación manual (administración)
  const [adminVideos, setAdminVideos] = useState([]);
  const [adminStatus, setAdminStatus] = useState('idle'); // idle|loading|ready|empty|error
  const [adminError, setAdminError] = useState(null);
  const [adminCursor, setAdminCursor] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Carga inicial o cuando cambia la etiqueta
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setAdminStatus('loading');
      setAdminError(null);
      try {
        const tagForQuery = selectedTag === 'Todas' ? '' : selectedTag;
        const { items, cursor } = await fetchVideosPage({ tag: tagForQuery, limit: 10, after: null });
        if (cancelled) return;
        setAdminVideos(items);
        setAdminCursor(cursor);
        setAdminStatus(items.length === 0 ? 'empty' : 'ready');
      } catch (e) {
        if (cancelled) return;
        setAdminError(e);
        setAdminStatus('error');
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedTag]);

  const handleLoadMore = useCallback(async () => {
    if (!adminCursor) return;
    setIsLoadingMore(true);
    try {
      const tagForQuery = selectedTag === 'Todas' ? '' : selectedTag;
      const { items, cursor } = await fetchVideosPage({ tag: tagForQuery, limit: 10, after: adminCursor });
      setAdminVideos((prev) => prev.concat(items));
      setAdminCursor(cursor);
    } catch (e) {
      setAdminError(e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [adminCursor, selectedTag]);

  const [newsTagFilter, setNewsTagFilter] = useState('');
  const {
    items: newsItems,
    status: newsStatus,
    error: newsError
  } = useNews({
    tag: newsTagFilter,
    limit: 25
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formDefaults, setFormDefaults] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formStatus, setFormStatus] = useState('idle');
  const [formError, setFormError] = useState(null);
  const [formInstanceKey, setFormInstanceKey] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const [isNewsFormOpen, setIsNewsFormOpen] = useState(false);
  const [newsFormMode, setNewsFormMode] = useState('create');
  const [newsFormDefaults, setNewsFormDefaults] = useState(null);
  const [editingNews, setEditingNews] = useState(null);
  const [newsFormStatus, setNewsFormStatus] = useState('idle');
  const [newsFormError, setNewsFormError] = useState(null);
  const [newsFormInstanceKey, setNewsFormInstanceKey] = useState(0);

  const handleHeroSuccess = useCallback(() => {
    // El contenido del hero se actualiza automáticamente con el onSnapshot del hook.
  }, []);

  const currentVideoUrl = useMemo(() => data.videoUrl ?? '', [data.videoUrl]);
  const currentTitle = useMemo(() => data.title ?? '', [data.title]);
  const currentTag = useMemo(() => data.tag ?? '', [data.tag]);
  const currentTags = useMemo(() => (Array.isArray(data.tags) ? data.tags : data.tag ? [data.tag] : []), [data.tags, data.tag]);

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
    setFormError(null);
  }, []);

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

  const resetNewsFormState = useCallback(() => {
    setNewsFormStatus('idle');
    setNewsFormError(null);
  }, []);

  const openNewsCreateForm = useCallback(() => {
    setNewsFormMode('create');
    setEditingNews(null);
    setNewsFormDefaults({
      id: generateNewsId(),
      title: '',
      lead: '',
      body: '',
      source: '',
      imageUrl: '',
      articleDate: '',
      tags: newsTagFilter ? [newsTagFilter] : []
    });
    setIsNewsFormOpen(true);
    resetNewsFormState();
    setNewsFormInstanceKey((prev) => prev + 1);
  }, [newsTagFilter, resetNewsFormState]);

  const openNewsEditForm = useCallback(
    (news) => {
      setNewsFormMode('edit');
      setEditingNews(news);
      setNewsFormDefaults({
        id: news.id ?? '',
        title: news.title ?? '',
        lead: news.lead ?? '',
        body: news.body ?? '',
        source: news.source ?? '',
        imageUrl: news.imageUrl ?? '',
        articleDate: news.articleDate ?? '',
        tags: Array.isArray(news.tags) ? news.tags : []
      });
      setIsNewsFormOpen(true);
      resetNewsFormState();
      setNewsFormInstanceKey((prev) => prev + 1);
    },
    [resetNewsFormState]
  );

  const closeNewsForm = useCallback(() => {
    setIsNewsFormOpen(false);
    setNewsFormMode('create');
    setEditingNews(null);
    setNewsFormDefaults(null);
    resetNewsFormState();
  }, [resetNewsFormState]);

  const handleNewsSubmit = async (payload) => {
    setNewsFormStatus('saving');
    setNewsFormError(null);

    try {
      if (newsFormMode === 'edit' && editingNews?.id) {
        const { id: _ignoredId, ...updates } = payload;
        await updateNews(editingNews.id, updates);
        setNewsFormStatus('success');
        window.setTimeout(() => closeNewsForm(), 800);
      } else {
        const { id: articleId, ...newsPayload } = payload;
        await createNews({ id: articleId, ...newsPayload });
        setNewsFormStatus('success');
        setNewsFormDefaults({
          id: generateNewsId(),
          title: '',
          lead: '',
          body: '',
          source: '',
          imageUrl: '',
          articleDate: '',
          tags: payload.tags && payload.tags.length > 0 ? payload.tags : newsTagFilter ? [newsTagFilter] : []
        });
        setNewsFormInstanceKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error('No pudimos guardar la noticia', error);
      setNewsFormStatus('error');
      setNewsFormError(error.message || 'No pudimos guardar la noticia. Intenta nuevamente.');
    }
  };

  const handleNewsDelete = async (news) => {
    if (!news?.id) return;
    const confirmation = window.confirm(`¿Eliminar la noticia “${news.title}”?`);
    if (!confirmation) return;

    try {
      await deleteNews(news.id);
      setFeedback({ type: 'success', text: 'Noticia eliminada correctamente.' });
      scheduleFeedbackClear();
    } catch (error) {
      console.error('No pudimos eliminar la noticia', error);
      setFeedback({
        type: 'error',
        text: error.message || 'No pudimos eliminar la noticia. Intenta nuevamente.'
      });
      scheduleFeedbackClear();
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
    const value = event.target.value;
    setSelectedTag(value);
  };

  const handleNewsTagChange = (event) => {
    const value = event.target.value;
    setNewsTagFilter(value === 'Todas' ? '' : value);
  };

  const videosStatusForList = adminStatus;

  const newsStatusForList =
    newsStatus === NEWS_STATUS.ready && newsItems.length === 0 ? NEWS_STATUS.empty : newsStatus;

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
            currentTag={currentTag}
            currentTags={currentTags}
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
                  <option value="Todas">Todas</option>
                  {HOME_SECTION_TITLES.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </header>

          {adminError ? (
            <div className="admin-dashboard__status admin-dashboard__status--error" role="alert">
              <p>{adminError.message || 'No pudimos cargar los videos. Intenta nuevamente.'}</p>
              {adminError.requiresIndex && adminError.indexUrl ? (
                <p>
                  Crea el índice compuesto desde{' '}
                  <a href={adminError.indexUrl} target="_blank" rel="noopener noreferrer">
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
            items={adminVideos}
            status={videosStatusForList}
            onEdit={openEditForm}
            onDelete={handleDelete}
          />

          <div className="admin-table__footer">
            <button type="button" onClick={handleLoadMore} disabled={!adminCursor || isLoadingMore}>
              {isLoadingMore ? 'Cargando…' : adminCursor ? 'Cargar más' : 'No hay más resultados'}
            </button>
          </div>

          {feedback ? (
            <p
              className={`admin-dashboard__status admin-dashboard__status--${feedback.type}`}
              role={feedback.type === 'error' ? 'alert' : 'status'}
            >
              {feedback.text}
            </p>
          ) : null}
        </article>

        <article className="admin-dashboard__module admin-dashboard__module--news">
          <header className="admin-dashboard__module-header">
            <div>
              <h2>Noticias (Otras noticias)</h2>
              <p className="admin-dashboard__helper">
                Publica artículos con fotografía, bajada en negrita y etiquetas por sección. Se mostrarán en las páginas
                correspondientes y en la portada.
              </p>
            </div>
            <div className="admin-dashboard__module-actions">
              <label className="admin-dashboard__select">
                <span>Filtrar por sección</span>
                <select value={newsTagFilter || 'Todas'} onChange={handleNewsTagChange}>
                  <option value="Todas">Todas</option>
                  {HOME_SECTION_TITLES.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" onClick={isNewsFormOpen ? closeNewsForm : openNewsCreateForm}>
                {isNewsFormOpen ? 'Cerrar formulario' : 'Agregar noticia'}
              </button>
            </div>
          </header>

          {newsError ? (
            <div className="admin-dashboard__status admin-dashboard__status--error" role="alert">
              <p>{newsError.message || 'No pudimos cargar las noticias. Intenta nuevamente.'}</p>
            </div>
          ) : null}

          {isNewsFormOpen ? (
            <NewsForm
              key={newsFormInstanceKey}
              mode={newsFormMode}
              defaultValues={newsFormDefaults}
              status={newsFormStatus}
              errorMessage={newsFormError}
              onSubmit={handleNewsSubmit}
              onCancel={closeNewsForm}
              onFeedback={(payload) => {
                setFeedback(payload);
                scheduleFeedbackClear();
              }}
            />
          ) : null}

          <NewsList items={newsItems} status={newsStatusForList} onEdit={openNewsEditForm} onDelete={handleNewsDelete} />

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
