import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Routes, Route, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const navRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = useMemo(
    () => [
      { label: 'Inicio', path: '/' },
      {
        label: 'Acuicultura',
        key: 'acuicultura',
        submenu: [
          { label: 'Salmonicultura', path: '/acuicultura/salmonicultura' },
          { label: 'Mitilicultura', path: '/acuicultura/mitilicultura' },
        ],
      },
      { label: 'Lechería', path: '/lecheria' },
      {
        label: 'Turismo',
        key: 'turismo',
        submenu: [
          { label: 'Operadores turísticos', path: '/turismo/operadores' },
          { label: 'Hotelería y gastronomía', path: '/turismo/hoteleria-gastronomia' },
          { label: 'Oferta turística', path: '/turismo/oferta' },
        ],
      },
      { label: 'Economía y desarrollo', path: '/economia-desarrollo' },
      { label: 'Contacto', path: '/contacto' },
    ],
    []
  );

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveSubmenu(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setActiveSubmenu(null);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    setActiveSubmenu(null);
  }, [location.pathname]);

  const toggleSubmenu = (key) => {
    setActiveSubmenu((current) => (current === key ? null : key));
  };

  const handleNavigate = (path) => {
    setActiveSubmenu(null);
    navigate(path);
  };

  return (
    <header className="header">
      <div className="header__top">
        <div className="header__logo">
          <img src="/imagenes/logo.png" alt="marka_e" className="header__logo-image" />
          <span className="sr-only">marka_e medio digital</span>
        </div>

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

      <nav className="header__nav" aria-label="Menú principal" ref={navRef}>
        <ul>
          {menuItems.map((item) => {
            if (item.submenu) {
              const isOpen = activeSubmenu === item.key;
              return (
                <li
                  key={item.label}
                  className={`header__nav-item--has-submenu ${isOpen ? 'is-open' : ''}`}
                >
                  <button
                    type="button"
                    className={`header__nav-button ${isOpen ? 'is-active' : ''}`}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    aria-controls={`submenu-${item.key}`}
                    onClick={() => toggleSubmenu(item.key)}
                  >
                    {item.label}
                  </button>
                  {isOpen ? (
                    <ul
                      id={`submenu-${item.key}`}
                      className="header__submenu"
                      aria-label={`Submenú de ${item.label}`}
                    >
                      {item.submenu.map((subItem) => (
                        <li key={subItem.label}>
                          <button type="button" onClick={() => handleNavigate(subItem.path)}>
                            {subItem.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            }

            return (
              <li key={item.label}>
                <Link to={item.path} onClick={() => setActiveSubmenu(null)}>
                  {item.label}
                </Link>
              </li>
            );
          })}
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
      title: '¿Puede el entrenamiento con ejercicios de fuerza ser un aliado en el tratamiento del cáncer de mama?',
      excerpt:
        'El ensayo clínico Neo Strong, liderado por FALP junto a la UFRO y la Universidad Cruzeiro do Sul, evalúa cómo el entrenamiento de fuerza durante la quimioterapia ayuda a mujeres con cáncer de mama a mantener energía, masa muscular y calidad de vida.',
      image: '/imagenes/Gissela Castillo (5) (1).png',
    },
    {
      id: 2,
      title: 'Bci es reconocido como la empresa más innovadora en el sector bancario en Chile',
      excerpt:
        'El ranking Most Innovative Companies destacó a Bci por liderar la innovación bancaria con un ecosistema digital de pagos, alianzas con startups y procesos que generan valor a clientes y colaboradores.',
      image: '/imagenes/premiacion1.png',
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
            <div className="written-card__image">
              <img src={article.image} alt={article.title} />
            </div>
            <div className="written-card__content">
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
              <a href="#" className="written-card__cta">Leer más</a>
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
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/acuicultura/salmonicultura">Acuicultura</Link></li>
            <li><Link to="/lecheria">Lechería</Link></li>
            <li><Link to="/turismo/operadores">Turismo</Link></li>
            <li><Link to="/economia-desarrollo">Economía y desarrollo</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
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

const Layout = () => (
  <div>
    <Header />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);

const HomePage = () => (
  <>
    <Hero />
    <RecentVideos />
    <WrittenHighlights />
    <Newsletter />
    <SocialFeed />
  </>
);

const SalmoniculturaPage = () => (
  <section className="inner-page" aria-labelledby="salmonicultura-title">
    <div className="inner-page__hero inner-page__hero--acuicultura">
      <h1 id="salmonicultura-title">Salmonicultura</h1>
      <p>
        Reportes y entrevistas sobre producción de salmón, innovación en cultivo offshore, regulaciones y sostenibilidad
        ambiental en el sur de Chile.
      </p>
    </div>
    <div className="inner-page__content">
      <article>
        <h2>Últimas notas</h2>
        <p>
          Muy pronto publicaremos artículos destacados, fichas técnicas y material audiovisual con el que podrás seguir la
          actualidad del sector.
        </p>
      </article>
    </div>
  </section>
);

const MitiliculturaPage = () => (
  <section className="inner-page" aria-labelledby="mitilicultura-title">
    <div className="inner-page__hero inner-page__hero--acuicultura">
      <h1 id="mitilicultura-title">Mitilicultura</h1>
      <p>
        Cobertura de la industria de los choritos: exportaciones, certificaciones, proyectos asociativos y desarrollo
        territorial en Chiloé y Aysén.
      </p>
    </div>
    <div className="inner-page__content">
      <article>
        <h2>Agenda editorial</h2>
        <p>
          Estamos recopilando historias de productores, casos de innovación logística y oportunidades de inversión que
          estarán disponibles en esta sección.
        </p>
      </article>
    </div>
  </section>
);

const LecheriaPage = () => (
  <section className="inner-page" aria-labelledby="lecheria-title">
    <div className="inner-page__hero inner-page__hero--negocios">
      <h1 id="lecheria-title">Lechería</h1>
      <p>
        Historias, tendencias y reportes de la cadena láctea: productividad, bienestar animal, procesamiento y nuevos
        mercados.
      </p>
    </div>
    <div className="inner-page__content">
      <article>
        <h2>Próximamente</h2>
        <p>
          Aquí encontrarás entrevistas a cooperativas, análisis de precios y soluciones tecnológicas que impactan al
          sector.
        </p>
      </article>
    </div>
  </section>
);

const TurismoOperadoresPage = () => (
  <section className="inner-page" aria-labelledby="turismo-operadores-title">
    <div className="inner-page__hero inner-page__hero--turismo">
      <h1 id="turismo-operadores-title">Operadores turísticos</h1>
      <p>
        Novedades de agencias, tour operadores y experiencias guiadas que impulsan el desarrollo turístico sustentable en
        el sur austral.
      </p>
    </div>
    <div className="inner-page__content">
      <article>
        <h2>Historias en construcción</h2>
        <p>
          Estamos preparando un directorio interactivo y casos de éxito de operadores locales para ayudar a conectar la
          oferta con nuevos visitantes.
        </p>
      </article>
    </div>
  </section>
);

const TurismoHoteleriaPage = () => (
  <section className="inner-page" aria-labelledby="turismo-hoteleria-title">
    <div className="inner-page__hero inner-page__hero--turismo">
      <h1 id="turismo-hoteleria-title">Hotelería y gastronomía</h1>
      <p>
        Cobertura de alojamientos, restaurantes, innovación culinaria y capacitación de capital humano para fortalecer la
        identidad gastronómica de la macrozona sur.
      </p>
    </div>
    <div className="inner-page__content">
      <article>
        <h2>Guías de referencia</h2>
        <p>
          Próximamente publicaremos rankings, reseñas y notas multimedia con chefs, hoteleros y emprendimientos locales.
        </p>
      </article>
    </div>
  </section>
);

const TurismoOfertaPage = () => (
  <section className="inner-page" aria-labelledby="turismo-oferta-title">
    <div className="inner-page__hero inner-page__hero--turismo">
      <h1 id="turismo-oferta-title">Oferta turística</h1>
      <p>
        Agenda de panoramas, rutas y productos turísticos innovadores que ofrece la Patagonia y el sur de Chile durante
        todo el año.
      </p>
    </div>
    <div className="inner-page__content">
      <article>
        <h2>Próximos lanzamientos</h2>
        <p>
          Estamos organizando un catálogo de experiencias y alianzas con municipios para impulsar el turismo territorial.
        </p>
      </article>
    </div>
  </section>
);

const EconomiaPage = () => (
  <section className="inner-page" aria-labelledby="economia-title">
    <div className="inner-page__hero inner-page__hero--negocios">
      <h1 id="economia-title">Economía y desarrollo</h1>
      <p>
        Análisis macro y microeconómicos, políticas públicas y proyectos estratégicos que impactan al crecimiento regional
        del sur de Chile.
      </p>
    </div>
    <div className="inner-page__content">
      <article>
        <h2>Notas en preparación</h2>
        <p>
          Pronto compartiremos informes de inversión, financiamiento para pymes y entrevistas con líderes empresariales y
          académicos.
        </p>
      </article>
    </div>
  </section>
);

const ContactoPage = () => (
  <section className="inner-page" aria-labelledby="contacto-title">
    <div className="inner-page__hero inner-page__hero--contacto">
      <h1 id="contacto-title">Contacto</h1>
      <p>
        Escríbenos para prensa, pauta comercial o alianzas estratégicas. Nuestro equipo responderá a la brevedad.
      </p>
    </div>
    <div className="inner-page__content">
      <article>
        <h2>Datos de contacto</h2>
        <p>Email: hola@marka-e.cl</p>
        <p>Teléfono: +56 9 5555 5555</p>
        <p>Dirección: Puerto Varas, Región de Los Lagos.</p>
      </article>
    </div>
  </section>
);

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="acuicultura/salmonicultura" element={<SalmoniculturaPage />} />
        <Route path="acuicultura/mitilicultura" element={<MitiliculturaPage />} />
        <Route path="lecheria" element={<LecheriaPage />} />
        <Route path="turismo/operadores" element={<TurismoOperadoresPage />} />
        <Route path="turismo/hoteleria-gastronomia" element={<TurismoHoteleriaPage />} />
        <Route path="turismo/oferta" element={<TurismoOfertaPage />} />
        <Route path="economia-desarrollo" element={<EconomiaPage />} />
        <Route path="contacto" element={<ContactoPage />} />
      </Route>
    </Routes>
  );
}

export default App;
