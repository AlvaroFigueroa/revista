import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!formData.email.trim()) {
      setError('Ingresa tu correo electrónico.');
      return;
    }

    if (!formData.password) {
      setError('Ingresa tu contraseña.');
      return;
    }

    try {
      setStatus('loading');
      await login(formData.email.trim(), formData.password);
      setStatus('success');
    } catch (submitError) {
      setStatus('error');
      let message = 'No pudimos iniciar sesión. Verifica tus credenciales.';

      if (submitError.code === 'auth/invalid-credential' || submitError.code === 'auth/wrong-password') {
        message = 'Correo o contraseña incorrectos. Intenta nuevamente.';
      } else if (submitError.code === 'auth/user-not-found') {
        message = 'No encontramos una cuenta con ese correo.';
      }

      setError(message);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2>Iniciar sesión</h2>
      <p className="auth-form__subtitle">Accede con tu cuenta registrada.</p>

      <label>
        Correo electrónico
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="tu@correo.com"
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
          placeholder="Tu contraseña"
          autoComplete="current-password"
          required
        />
      </label>

      {error ? (
        <p className="auth-form__error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="auth-form__submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Ingresando…' : 'Entrar'}
      </button>

      {status === 'success' ? (
        <p className="auth-form__success" role="status">
          Sesión iniciada correctamente.
        </p>
      ) : null}
    </form>
  );
};

export default LoginForm;
