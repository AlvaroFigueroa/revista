import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const OpinionModal = ({ opinion, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  if (!opinion) return null;
  const { title, body, imageUrl, authorName, authorTitle } = opinion;

  return createPortal(
    <div
      className="video-modal"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="opinion-modal-title"
    >
      <div className="video-modal__content" style={{ maxWidth: '980px' }}>
        <div className="video-modal__header">
          <h2 id="opinion-modal-title">{title || 'Columna de opinión'}</h2>
          <button onClick={onClose} className="video-modal__close" aria-label="Cerrar">
            <X size={24} />
          </button>
        </div>
        <div style={{ padding: '1.2rem 1.5rem', overflowY: 'auto' }}>
          <header style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: '#e5e7eb' }}>
              {imageUrl ? (
                <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : null}
            </div>
            <div>
              <strong style={{ display: 'block' }}>{authorName || 'Autor/a'}</strong>
              {authorTitle ? <span style={{ color: '#475569', fontSize: '0.9rem' }}>{authorTitle}</span> : null}
            </div>
          </header>
          {typeof body === 'string' ? (
            <article style={{ color: '#1e293b', lineHeight: 1.8, fontSize: '1.02rem' }}>
              {body.split('\n').map((p, idx) => (
                <p key={idx} style={{ margin: '0 0 1rem' }}>{p}</p>
              ))}
            </article>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
};

OpinionModal.propTypes = {
  opinion: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    body: PropTypes.string,
    imageUrl: PropTypes.string,
    authorName: PropTypes.string,
    authorTitle: PropTypes.string,
  }),
  onClose: PropTypes.func,
};

export default OpinionModal;
