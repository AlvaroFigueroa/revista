import React, { useEffect } from 'react';
import { useOpinions } from '../hooks/useOpinions';

const OpinionsPage = () => {
  const { items, status } = useOpinions({ limit: 50 });
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <section className="inner-page" aria-labelledby="opinions-title">
      <div className="inner-page__hero">
        <h1 id="opinions-title">Columna de opinión</h1>
        <p>Opiniones y columnas de especialistas invitad@s.</p>
      </div>
      <div className="inner-page__content">
        {status === 'loading' ? <p>Cargando opiniones…</p> : null}
        {status === 'empty' ? <p>No hay opiniones publicadas aún.</p> : null}
        {Array.isArray(items) && items.length > 0 ? (
          <ul className="opinions__grid" aria-label="Listado de opiniones">
            {items.map((op) => (
              <li key={op.id} className="opinions__item">
                <article className="opinion-card opinion-card--list">
                  <header className="opinion-card__header">
                    <div className="opinion-card__avatar" aria-hidden="true">
                      {op.imageUrl ? <img src={op.imageUrl} alt="" /> : <span className="opinion-card__placeholder" />}
                    </div>
                    <div className="opinion-card__author">
                      <strong className="opinion-card__name">{op.authorName || 'Autor/a'}</strong>
                      {op.authorTitle ? <span className="opinion-card__title">{op.authorTitle}</span> : null}
                    </div>
                  </header>
                  <h3 className="opinion-card__headline">{op.title}</h3>
                  {typeof op.body === 'string' && op.body.trim().length > 0 ? (
                    <div className="opinion-card__body">{op.body}</div>
                  ) : null}
                </article>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
};

export default OpinionsPage;
