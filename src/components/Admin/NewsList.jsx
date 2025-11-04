import React from 'react';
import PropTypes from 'prop-types';

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  if (value?.toDate) {
    return value.toDate().toLocaleDateString('es-CL', { dateStyle: 'medium' });
  }
  if (typeof value === 'string' || value instanceof Date) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('es-CL', { dateStyle: 'medium' });
    }
  }
  return 'Sin fecha';
};

const NewsList = ({ items, status, onEdit, onDelete }) => {
  const isLoading = status === 'loading';

  if (isLoading) {
    return (
      <div className="admin-table__status" role="status">
        Cargando noticias…
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="admin-table__status" role="note">
        Aún no hay noticias registradas.
      </div>
    );
  }

  return (
    <table className="admin-table news-list">
      <thead>
        <tr>
          <th scope="col">Título</th>
          <th scope="col">Secciones</th>
          <th scope="col">Fecha</th>
          <th scope="col">Fuente</th>
          <th scope="col" aria-label="Acciones"></th>
        </tr>
      </thead>
      <tbody>
        {items.map((news) => (
          <tr key={news.id}>
            <td data-label="Título">{news.title}</td>
            <td data-label="Secciones">
              {Array.isArray(news.tags) && news.tags.length > 0 ? news.tags.join(', ') : 'Sin etiquetas'}
            </td>
            <td data-label="Fecha">{formatDate(news.articleDate)}</td>
            <td data-label="Fuente">{news.source || 'Sin fuente'}</td>
            <td data-label="Acciones">
              <div className="admin-table__actions">
                <button type="button" onClick={() => onEdit?.(news)}>
                  Editar
                </button>
                <button type="button" className="admin-table__danger" onClick={() => onDelete?.(news)}>
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

NewsList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      tags: PropTypes.arrayOf(PropTypes.string),
      articleDate: PropTypes.any,
      source: PropTypes.string
    })
  ),
  status: PropTypes.oneOf(['idle', 'loading', 'ready', 'empty', 'error']),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};

export default NewsList;
