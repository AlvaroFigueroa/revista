import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const OpinionCard = ({ opinion }) => {
  if (!opinion) return null;
  const { title, imageUrl, authorName, authorTitle } = opinion;
  return (
    <article className="opinion-card" aria-label="Columna de opinión">
      <header className="opinion-card__header">
        <div className="opinion-card__avatar" aria-hidden="true">
          {imageUrl ? <img src={imageUrl} alt="" /> : <span className="opinion-card__placeholder" />}
        </div>
        <div className="opinion-card__author">
          <strong className="opinion-card__name">{authorName || 'Autor/a'}</strong>
          {authorTitle ? <span className="opinion-card__title">{authorTitle}</span> : null}
        </div>
      </header>
      <h3 className="opinion-card__headline">{title}</h3>
      <div className="opinion-card__cta">
        <Link to="/columna-de-opinion" className="opinion-card__link">Leer más →</Link>
      </div>
    </article>
  );
};

OpinionCard.propTypes = {
  opinion: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    body: PropTypes.string,
    imageUrl: PropTypes.string,
    authorName: PropTypes.string,
    authorTitle: PropTypes.string,
  })
};

export default OpinionCard;
