import React, { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHeroContent } from '../hooks/useHeroContent';
import HeroForm from '../components/Admin/HeroForm';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { data, status, isFallback } = useHeroContent();

  const handleSuccess = useCallback(() => {
    // noop by ahora; el onSnapshot del hook reactualiza automáticamente
  }, []);

  const currentVideoUrl = useMemo(() => data.videoUrl ?? '', [data.videoUrl]);
  const currentTitle = useMemo(() => data.title ?? '', [data.title]);

  return (
    <section className="admin-dashboard" aria-labelledby="admin-dashboard-title">
      <header className="admin-dashboard__header">
        <div>
          <h1 id="admin-dashboard-title">Panel de administración</h1>
          <p>Gestiona el contenido destacado del sitio sin modificar la estructura visual.</p>
          {isFallback ? (
            <p className="admin-dashboard__hint" role="note">
              Mostrando el contenido base. Cualquier cambio que guardes reemplazará este contenido inmediatamente.
            </p>
          ) : null}
        </div>
        <div className="admin-dashboard__user">
          <span>
            Sesión iniciada como <strong>{user?.email}</strong>
          </span>
          <button type="button" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="admin-dashboard__content">
        {status === 'loading' ? (
          <p className="admin-dashboard__status" role="status">
            Cargando contenido actual…
          </p>
        ) : null}
        <HeroForm currentTitle={currentTitle} currentVideoUrl={currentVideoUrl} onSuccess={handleSuccess} />
      </div>
    </section>
  );
};

export default AdminDashboard;
