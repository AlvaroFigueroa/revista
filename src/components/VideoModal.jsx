import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const VideoModal = ({ videoUrl, title, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Opción A: no usar autoplay ni forzar mute. También eliminamos esos parámetros si vienen en la URL.
  const getEmbedUrlWithAutoplay = (url) => {
    if (!url) return '';
    try {
      const [base, query] = url.split('?');
      if (!query) return base;
      const params = new URLSearchParams(query);
      params.delete('autoplay');
      params.delete('mute');
      const cleaned = params.toString();
      return cleaned ? `${base}?${cleaned}` : base;
    } catch (error) {
      console.error('Error al procesar la URL del video:', error);
      return url;
    }
  };

  return createPortal(
    <div 
      className="video-modal" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
    >
      <div className="video-modal__content">
        <div className="video-modal__header">
          <h2 id="video-modal-title">{title || 'Reproduciendo video'}</h2>
          <button 
            onClick={onClose} 
            className="video-modal__close"
            aria-label="Cerrar reproductor de video"
          >
            <X size={24} />
          </button>
        </div>
        <div className="video-modal__player">
          <iframe
            src={getEmbedUrlWithAutoplay(videoUrl)}
            title={title || 'Reproductor de video'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            playsInline
            webkitallowfullscreen
            mozallowfullscreen
            referrerPolicy="origin"
          ></iframe>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default VideoModal;
