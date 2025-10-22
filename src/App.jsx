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

const Hero = () => {
  return (
    <section className="hero" aria-labelledby="hero-featured">
      <div className="hero__content">
        <div className="hero__media" aria-label="Video destacado">
          <div className="hero__video">
            <iframe
              src="https://www.youtube.com/embed/_jDeXfDVK10?autoplay=1&mute=1&rel=0&playsinline=1"
              title="Video destacado"
              frameBorder="0"
              allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        <div className="hero__text">
          <h2 id="hero-featured">MARKA E: Plataforma digital del sur de Chile</h2>
          <p>Conoce el proyecto informativo de Agencia MARKA PM que reúne noticias, entrevistas y análisis del ecosistema empresarial sureño, con foco en innovación, sostenibilidad y desarrollo regional.</p>
          <hr />
          <ul className="hero__highlights">
            <li><span>•</span> Empresas sureñas lanzan agenda 2025 para digitalizar procesos productivos.</li>
            <li><span>•</span> Pymes turísticas de La Araucanía apuestan por experiencias sostenibles con apoyo de MARKA E.</li>
            <li><span>•</span> Foro empresarial en Puerto Montt reúne líderes para debatir innovación y capital humano.</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

const RecentVideos = () => {
  const videos = [
    { id: 1, label: 'Miniatura', date: '15 oct 2025' },
    { id: 2, label: 'Miniatura', date: '12 oct 2025' },
    { id: 3, label: 'Miniatura', date: '08 oct 2025' },
  ];

  return (
    <section className="videos" aria-labelledby="recent-videos">
      <div className="videos__header">
        <h2 id="recent-videos">Videos recientes</h2>
      </div>
      <div className="videos__grid">
        {videos.map((video) => (
          <article key={video.id} className="video-card">
            <div className="video-card__thumbnail">{video.label}</div>
            <div className="video-card__meta">{video.date}</div>
          </article>
        ))}
      </div>
    </section>
  );
};

const WrittenHighlights = () => {
  const articles = [
    {
      id: 1,
      title: 'Título de la noticia',
      excerpt: 'Extracto de la noticia',
    },
    {
      id: 2,
      title: 'Título de la noticia',
      excerpt: 'Extracto de la noticia',
    },
  ];

  return (
    <section className="written" aria-labelledby="written-highlights">
      <div className="written__header">
        <h2 id="written-highlights">Noticias escritas destacadas</h2>
      </div>
      <div className="written__grid">
        {articles.map((article) => (
          <article key={article.id} className="written-card">
            <div className="written-card__image">Imagen</div>
            <div className="written-card__content">
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const Newsletter = () => {
  return (
    <section className="newsletter" aria-labelledby="newsletter">
      <h2 id="newsletter">Newsletter / Suscripción</h2>
      <input
        type="email"
        placeholder="Tu correo electrónico"
        className="newsletter__field"
        aria-label="Correo electrónico"
      />
    </section>
  );
};

const SocialFeed = () => {
  return (
    <section className="social" aria-labelledby="social-feed">
      <h2 id="social-feed">Feed Redes Sociales</h2>
      <div className="social__feed" role="presentation">
        <span></span>
        <span></span>
      </div>
    </section>
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
      <main>
        <Hero />
        <RecentVideos />
        <WrittenHighlights />
        <Newsletter />
        <SocialFeed />
      </main>
      <Footer />
    </div>
  );
}

export default App;
