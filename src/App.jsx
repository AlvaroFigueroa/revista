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
    { id: 1, title: 'MARKA E | Reporte agroindustrial', url: 'https://www.youtube.com/embed/MwqM5lto7hQ?autoplay=1&mute=1&rel=0&playsinline=1' },
    { id: 2, title: 'MARKA E | Innovación en turismo rural', url: 'https://www.youtube.com/embed/J38Hgv9mUVU?autoplay=1&mute=1&rel=0&playsinline=1' },
    { id: 3, title: 'MARKA E | Talento y sostenibilidad', url: 'https://www.youtube.com/embed/uEaZiaooeXA?autoplay=1&mute=1&rel=0&playsinline=1' }
  ];

  return (
    <section className="videos" aria-labelledby="recent-videos">
      <div className="videos__header">
        <h2 id="recent-videos">Videos recientes</h2>
      </div>
      <div className="videos__grid">
        {videos.map((video) => (
          <article key={video.id} className="video-card">
            <div className="video-card__player">
              <iframe
                src={video.url}
                title={video.title}
                frameBorder="0"
                allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <div className="video-card__meta">{video.title}</div>
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
      title: 'Bci lidera ranking Most Innovative Companies',
      excerpt: 'El banco fue reconocido como la empresa más innovadora en Chile por su ecosistema de innovación, IA generativa y colaboración con startups.',
      image: '/images/bci/innovacion-bci.jpg'
    },
    {
      id: 2,
      title: 'Metodología del ranking valora impacto y cultura',
      excerpt: 'La medición del ESE Business School destaca estrategia, cultura y procesos de innovación que refuerzan el liderazgo regional de Bci.',
      image: '/images/bci/innovacion-bci.jpg'
    }
  ];

  return (
    <section className="written" aria-labelledby="written-highlights">
      <div className="written__header">
        <h2 id="written-highlights">Noticias escritas destacadas</h2>
      </div>
      <div className="written__grid">
        {articles.map((article) => (
          <article key={article.id} className="written-card">
            <div className="written-card__image">
              <img
                src={article.image}
                alt={article.title}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = '/images/fallback.svg';
                }}
              />
            </div>
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
  const posts = [
    {
      id: 1,
      network: 'Instagram',
      badge: 'IG',
      handle: '@marka_e',
      message: 'Recorriendo plantas productivas en Valdivia para documentar procesos innovadores de economía circular.',
      time: 'Hace 2 horas'
    },
    {
      id: 2,
      network: 'LinkedIn',
      badge: 'IN',
      handle: 'MARKA E | Negocios',
      message: 'Compartimos los aprendizajes del último Foro Empresarial de Puerto Montt sobre talento senior y digitalización.',
      time: 'Hace 5 horas'
    },
    {
      id: 3,
      network: 'YouTube Shorts',
      badge: 'YT',
      handle: '@marka_e',
      message: 'Mini reportaje: emprendedoras de turismo rural en Chiloé cuentan cómo diversifican su oferta todo el año.',
      time: 'Ayer'
    }
  ];

  return (
    <section className="social" aria-labelledby="social-feed">
      <h2 id="social-feed">Feed Redes Sociales</h2>
      <div className="social__feed" role="list">
        {posts.map((post) => (
          <article key={post.id} className="social-post" role="listitem">
            <div className="social-post__header">
              <span className={`social-post__badge social-post__badge--${post.badge.toLowerCase()}`}>{post.badge}</span>
              <div className="social-post__meta">
                <strong>{post.network}</strong>
                <span>{post.handle}</span>
              </div>
              <span className="social-post__time">{post.time}</span>
            </div>
            <p className="social-post__message">{post.message}</p>
            <button type="button" className="social-post__cta" aria-label={`Abrir publicación en ${post.network}`}>
              Ver publicación
            </button>
          </article>
        ))}
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
