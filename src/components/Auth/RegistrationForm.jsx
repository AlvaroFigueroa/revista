import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const initialFormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
};

const RegistrationForm = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Por favor ingresa tu nombre.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setStatus('loading');
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      setStatus('success');
      setFormData(initialFormState);
    } catch (submitError) {
      setStatus('error');
      setError(submitError.message || 'No pudimos crear tu cuenta. Inténtalo nuevamente.');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2>Crear cuenta</h2>
      <p className="auth-form__subtitle">Regístrate para acceder a contenidos exclusivos.</p>

      <label>
        Nombre completo
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Tu nombre"
          autoComplete="name"
          required
        />
      </label>

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
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          required
        />
      </label>

      <label>
        Confirmar contraseña
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Repite la contraseña"
          autoComplete="new-password"
          required
        />
      </label>

      {error ? (
        <p className="auth-form__error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="auth-form__submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Creando cuenta…' : 'Registrarme'}
      </button>

      {status === 'success' ? (
        <p className="auth-form__success" role="status">
          ¡Cuenta creada! Ya puedes explorar el sitio.
        </p>
      ) : null}
    </form>
  );
};

export default RegistrationForm;
