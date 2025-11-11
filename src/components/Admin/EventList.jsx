import React from 'react';
import PropTypes from 'prop-types';

const EventList = ({ items, status, onEdit, onDelete }) => {
  const isLoading = status === 'loading';
  if (isLoading) return <div className="admin-table__status">Cargando eventos…</div>;
  if (!items || items.length === 0) return <div className="admin-table__status">No hay eventos próximos.</div>;

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Título</th>
          <th>Fecha</th>
          <th>Lugar</th>
          <th aria-label="Acciones"></th>
        </tr>
      </thead>
      <tbody>
        {items.map((ev) => {
          const when = ev.startAt?.toDate ? ev.startAt.toDate().toLocaleString('es-CL') : '—';
          return (
            <tr key={ev.id}>
              <td data-label="Título">{ev.title}</td>
              <td data-label="Fecha">{when}</td>
              <td data-label="Lugar">{ev.location || '—'}</td>
              <td data-label="Acciones">
                <div className="admin-table__actions">
                  <button type="button" onClick={() => onEdit?.(ev)}>Editar</button>
                  <button type="button" className="admin-table__danger" onClick={() => onDelete?.(ev)}>Eliminar</button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

EventList.propTypes = {
  items: PropTypes.array,
  status: PropTypes.oneOf(['idle','loading','ready','empty','error']),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default EventList;
