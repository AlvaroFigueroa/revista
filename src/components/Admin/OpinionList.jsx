import React from 'react';
import PropTypes from 'prop-types';

const OpinionList = ({ items, status, onEdit, onDelete }) => {
  const isLoading = status === 'loading';
  if (isLoading) return <div className="admin-table__status">Cargando opiniones…</div>;
  if (!items || items.length === 0) return <div className="admin-table__status">No hay opiniones registradas.</div>;

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Título</th>
          <th>Autor</th>
          <th>Actualizado</th>
          <th aria-label="Acciones"></th>
        </tr>
      </thead>
      <tbody>
        {items.map((op) => {
          const updatedAtLabel = op.updatedAt?.toDate ? op.updatedAt.toDate().toLocaleString('es-CL') : '—';
          return (
            <tr key={op.id}>
              <td data-label="Título">{op.title}</td>
              <td data-label="Autor">{op.authorName}{op.authorTitle ? `, ${op.authorTitle}` : ''}</td>
              <td data-label="Actualizado">{updatedAtLabel}</td>
              <td data-label="Acciones">
                <div className="admin-table__actions">
                  <button type="button" onClick={() => onEdit?.(op)}>Editar</button>
                  <button type="button" className="admin-table__danger" onClick={() => onDelete?.(op)}>Eliminar</button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

OpinionList.propTypes = {
  items: PropTypes.array,
  status: PropTypes.oneOf(['idle','loading','ready','empty','error']),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default OpinionList;
