import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useOpinions } from '../hooks/useOpinions';
import OpinionModal from '../components/Opinion/OpinionModal';

const OpinionsPage = () => {
  const [limit, setLimit] = useState(24);
  const { items, status } = useOpinions({ limit });
  const [selected, setSelected] = useState(null);
  const openOpinion = useCallback((op) => setSelected(op), []);
  const closeOpinion = useCallback(() => setSelected(null), []);
  const [search, setSearch] = useState('');
  const [author, setAuthor] = useState('Todos');

  const authorOptions = useMemo(() => {
    const set = new Set();
    (items || []).forEach((op) => {
      if (op?.authorName && typeof op.authorName === 'string') set.add(op.authorName.trim());
    });
    return ['Todos', ...Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))];
  }, [items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (items || []).filter((op) => {
      if (author !== 'Todos' && (op.authorName || '').trim() !== author) return false;
      if (!term) return true;
      const haystack = `${op.title || ''} ${op.body || ''} ${op.authorName || ''} ${op.authorTitle || ''}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [items, search, author]);

  const handleLoadMore = () => setLimit((n) => Math.min(n + 24, 200));
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <section className="inner-page" aria-labelledby="opinions-title">
      <div className="inner-page__hero">
        <h1 id="opinions-title">Columna de opinión</h1>
        <p>Opiniones y columnas de especialistas invitados.</p>
      </div>
      <div className="inner-page__content">
        <div className="opinions__filters" role="region" aria-label="Filtros de opiniones">
          <label className="opinions__filter-group">
            <span>Autor</span>
            <select value={author} onChange={(e) => setAuthor(e.target.value)}>
              {authorOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
          <label className="opinions__filter-group opinions__filter-group--search">
            <span>Buscar</span>
            <input
              type="search"
              placeholder="Palabra clave…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        {status === 'loading' ? <p>Cargando opiniones…</p> : null}
        {status === 'empty' ? <p>No hay opiniones publicadas aún.</p> : null}
        {Array.isArray(filtered) && filtered.length > 0 ? (
          <ul className="opinions__grid" aria-label="Listado de opiniones">
            {filtered.map((op) => (
              <li key={op.id} className="opinions__item">
                <button
                  type="button"
                  className="opinion-card opinion-card--square"
                  onClick={() => openOpinion(op)}
                  aria-label={`Abrir columna: ${op.title}`}
                >
                  <div className="opinion-card__square-media" aria-hidden="true">
                    {op.imageUrl ? <img src={op.imageUrl} alt="" /> : <span className="opinion-card__placeholder" />}
                  </div>
                  <div className="opinion-card__square-content">
                    <div className="opinion-card__author">
                      <strong className="opinion-card__name">{op.authorName || 'Autor/a'}</strong>
                      {op.authorTitle ? <span className="opinion-card__title">{op.authorTitle}</span> : null}
                    </div>
                    <h3 className="opinion-card__headline opinion-card__headline--clamp">{op.title}</h3>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="opinions__actions">
          <button type="button" className="opinions__loadmore" onClick={handleLoadMore} disabled={status === 'loading'}>
            Ver más
          </button>
        </div>

        {selected ? (
          <OpinionModal opinion={selected} onClose={closeOpinion} />
        ) : null}
      </div>
    </section>
  );
};

export default OpinionsPage;
