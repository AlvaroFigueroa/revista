import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="header__top">
        <div className="header__logo">marka_e</div>

        <div className="header__search">
          <span className="header__search-icon" aria-hidden>🔍</span>
          <input type="search" placeholder="Buscar" aria-label="Buscar en la revista" />
        </div>

        <div className="header__actions" aria-label="Acciones del usuario">
          <button className="header__action" aria-label="Buscar">
            🔍
          </button>
          <button className="header__action" aria-label="Notificaciones">
            🔔
          </button>
          <button className="header__action" aria-label="Perfil">
            👤
          </button>
        </div>
      </div>

      <nav className="header__nav" aria-label="Menú principal">
        <ul>
          <li><a href="#">Inicio</a></li>
          <li><a href="#">Acuicultura</a></li>
          <li><a href="#">Lechería</a></li>
          <li><a href="#">Agricultura</a></li>
          <li><a href="#">Turismo</a></li>
          <li><a href="#">Multimedia</a></li>
          <li><a href="#">Contacto</a></li>
        </ul>
      </nav>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__brand">
          <h3>marka_e</h3>
          <p>
            Plataforma de noticias y análisis sobre acuicultura, lechería, agricultura y turismo en América Latina.
          </p>
        </div>

        <div className="footer__section">
          <h4>Menú navegación completa</h4>
          <ul>
            <li><a href="#">Inicio</a></li>
            <li><a href="#">Acuicultura</a></li>
            <li><a href="#">Lechería</a></li>
            <li><a href="#">Agricultura</a></li>
            <li><a href="#">Turismo</a></li>
            <li><a href="#">Multimedia</a></li>
            <li><a href="#">Contacto</a></li>
          </ul>
        </div>

        <div className="footer__section">
          <h4>Datos legales / privacidad</h4>
          <ul>
            <li><a href="#">Aviso legal</a></li>
            <li><a href="#">Política de privacidad</a></li>
            <li><a href="#">Términos de uso</a></li>
            <li><a href="#">Cookies</a></li>
          </ul>
        </div>

        <div className="footer__section">
          <h4>Redes sociales</h4>
          <ul>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">YouTube</a></li>
            <li><a href="#">LinkedIn</a></li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} marka_e. Todos los derechos reservados.</span>
        <span>Desarrollado para profesionales del sector agro y turismo sostenible.</span>
      </div>
    </footer>
  );
};

function App() {
  return (
    <div>
      <Header />
      <main />
      <Footer />
    </div>
  );
}

export default App;
