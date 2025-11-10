import React, { useMemo } from 'react';
import { VIDEOS_STATUS } from '../hooks/useVideos';
import VideoCard from './VideoCard';

const VideoSection = ({ videos, status, error, title }) => {
  const normalizedVideos = useMemo(() => {
    if (!Array.isArray(videos)) return [];
    return videos.map(video => ({
      ...video,
      title: typeof video.title === 'string' && video.title.trim().length > 0 
        ? video.title.trim() 
        : 'Video sin título',
      embedUrl: typeof video.embedUrl === 'string' ? video.embedUrl.trim() : ''
    }));
  }, [videos]);

  if (status === VIDEOS_STATUS.loading) {
    return <p role="status">Cargando videos...</p>;
  }

  if (status === VIDEOS_STATUS.error) {
    return (
      <div role="alert">
        <p>No se pudieron cargar los videos.</p>
        {error?.message && <p>{error.message}</p>}
      </div>
    );
  }

  if (normalizedVideos.length === 0) {
    return <p role="note">No hay videos disponibles para esta sección.</p>;
  }

  return (
    <section className="videos" aria-label={`Videos de ${title}`} style={styles.videosSection}>
      <div style={styles.videosContainer}>
        <header className="section-heading" style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.titleBadge}>Videos</span>
            <span>{title}</span>
          </h2>
        </header>
        
        <div className="videos__grid" role="list" style={styles.videosGrid}>
          {normalizedVideos.map((video) => (
            <VideoCard 
              key={video.id} 
              video={video}
              onClick={(v) => {
                if (v?.embedUrl) {
                  // Aquí podrías abrir un modal con el video
                  window.open(v.embedUrl, '_blank');
                }
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const styles = {
  videosSection: {
    width: '100%',
    maxWidth: '100%',
    margin: '0',
    padding: '2rem 0',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box',
    overflow: 'hidden'
  },
  videosContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
    width: '100%',
    boxSizing: 'border-box'
  },
  sectionHeader: {
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e2e8f0'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#0f172a',
    margin: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  titleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '9999px',
    padding: '0.25rem 0.75rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    lineHeight: '1.25',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  videosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
    width: '100%',
    boxSizing: 'border-box'
  }
};

export default VideoSection;
