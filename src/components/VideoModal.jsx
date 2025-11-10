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
            src={videoUrl}
            title={title || 'Reproductor de video'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default VideoModal;
