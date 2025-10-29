import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      const redirectTo = location.state?.from?.pathname || '/admin';
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const email = formData.email.trim();
    if (!email) {
      setError('Ingresa tu correo electrónico.');
      return;
    }
    if (!formData.password) {
      setError('Ingresa tu contraseña.');
      return;
    }

    try {
      setStatus('loading');
      await login(email, formData.password);
    } catch (submitError) {
      let message = 'No pudimos iniciar sesión. Verifica tus credenciales.';
      if (submitError?.code === 'auth/invalid-credential' || submitError?.code === 'auth/wrong-password') {
        message = 'Correo o contraseña incorrectos. Intenta nuevamente.';
      } else if (submitError?.code === 'auth/user-not-found') {
        message = 'No encontramos una cuenta con ese correo.';
      }
      setError(message);
      setStatus('idle');
    }
  };

  return (
    <section className="admin-login" aria-labelledby="admin-login-title">
      <div className="admin-login__card">
        <header className="admin-login__header">
          <h1 id="admin-login-title">Panel de administración</h1>
          <p>Ingresa con tu cuenta autorizada para editar el contenido destacado.</p>
        </header>
        <form className="admin-login__form" onSubmit={handleSubmit} noValidate>
          <label>
            Correo electrónico
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>
          {error ? (
            <p className="admin-login__error" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="admin-login__submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Ingresando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AdminLoginPage;
