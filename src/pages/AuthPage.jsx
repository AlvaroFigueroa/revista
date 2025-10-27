import React, { useState } from 'react';
import LoginForm from '../components/Auth/LoginForm';
import RegistrationForm from '../components/Auth/RegistrationForm';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <section className="auth" aria-labelledby="auth-title">
      <div className="auth__container">
        <header className="auth__header">
          <h1 id="auth-title">Bienvenido a MARKA E</h1>
          <p className="auth__intro">
            Crea tu cuenta para acceder a boletines sectoriales, descargar reportes y guardar tus contenidos favoritos.
          </p>
        </header>

        <div className="auth__tabs" role="tablist" aria-label="Cambiar entre iniciar sesión o registrarse">
          <button
            type="button"
            className={`auth__tab ${activeTab === 'login' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'login'}
            onClick={() => setActiveTab('login')}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`auth__tab ${activeTab === 'register' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'register'}
            onClick={() => setActiveTab('register')}
          >
            Registrarme
          </button>
        </div>

        <div className="auth__content">
          {activeTab === 'login' ? <LoginForm /> : <RegistrationForm />}
        </div>
      </div>
    </section>
  );
};

export default AuthPage;
