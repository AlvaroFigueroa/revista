import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdminRole, ADMIN_ROLE_STATUS } from '../hooks/useAdminRole';

const ProtectedRoute = () => {
  const { user, initializing } = useAuth();
  const { status: roleStatus, isAdmin } = useAdminRole();
  const location = useLocation();

  const isLoading =
    initializing ||
    roleStatus === ADMIN_ROLE_STATUS.idle ||
    roleStatus === ADMIN_ROLE_STATUS.loading;

  if (isLoading) {
    return (
      <div className="auth-loading" role="status" aria-live="polite">
        Verificando sesión…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
