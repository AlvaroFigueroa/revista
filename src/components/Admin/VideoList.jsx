import React from 'react';
import PropTypes from 'prop-types';

const VideoList = ({ items, onEdit, onDelete, status }) => {
  const isLoading = status === 'loading';

  if (isLoading) {
    return (
      <div className="admin-table__status" role="status">
        Cargando videos…
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="admin-table__status" role="note">
        No hay videos registrados para esta etiqueta todavía.
      </div>
    );
  }

  return (
    <table className="admin-table video-list">
      <thead>
        <tr>
          <th scope="col">Título</th>
          <th scope="col">Etiquetas</th>
          <th scope="col">Actualizado</th>
          <th scope="col" aria-label="Acciones"></th>
        </tr>
      </thead>
      <tbody>
        {items.map((video) => {
          const updatedAtLabel = video.updatedAt?.toDate
            ? video.updatedAt.toDate().toLocaleString('es-CL')
            : 'Sin fecha';

          return (
            <tr key={video.id}>
              <td data-label="Título">{video.title}</td>
              <td data-label="Etiquetas">
                {Array.isArray(video.tags) && video.tags.length > 0 ? video.tags.join(', ') : 'Sin etiquetas'}
              </td>
              <td data-label="Actualizado">{updatedAtLabel}</td>
              <td data-label="Acciones">
                <div className="admin-table__actions">
                  <button type="button" onClick={() => onEdit?.(video)}>
                    Editar
                  </button>
                  <button type="button" className="admin-table__danger" onClick={() => onDelete?.(video)}>
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

VideoList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      embedUrl: PropTypes.string.isRequired,
      tags: PropTypes.arrayOf(PropTypes.string),
      createdAt: PropTypes.any,
      updatedAt: PropTypes.any
    })
  ),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  status: PropTypes.oneOf(['idle', 'loading', 'ready', 'empty', 'error'])
};

export default VideoList;
