import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Routes, Route, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLogin';
import { useVideos, VIDEOS_STATUS } from './hooks/useVideos';
import { useAdminRole, ADMIN_ROLE_STATUS } from './hooks/useAdminRole';
import { useHeroContent, HERO_STATUS } from './hooks/useHeroContent';
import { useNews, NEWS_STATUS } from './hooks/useNews';

const FinancialTicker = () => {
  const [indicators, setIndicators] = useState(null);
  const [status, setStatus] = useState('loading');

  const normalizeValue = (raw) => {
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchIndicators = async () => {
      try {
        const response = await fetch('https://mindicador.cl/api');
        if (!response.ok) {
          throw new Error('Respuesta inválida del servicio de indicadores');
        }

        const json = await response.json();
        if (!isMounted) return;

        setIndicators({
          uf: normalizeValue(json?.uf?.valor),
          dolar: normalizeValue(json?.dolar?.valor),
          euro: normalizeValue(json?.euro?.valor),
        });
        setStatus('ready');
      } catch (error) {
        if (!isMounted) return;
        console.error('No pudimos obtener indicadores financieros', error);
        setStatus('error');
      }
    };

    fetchIndicators();
    const intervalId = window.setInterval(fetchIndicators, 15 * 60 * 1000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const ufFormatter = useMemo(
    () =>
      new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  const clpFormatter = useMemo(
    () =>
      new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    []
  );

  const formatCurrency = (value, formatter) =>
    typeof value === 'number' ? formatter.format(value) : '--';

  if (status === 'ready' && indicators) {
    return (
      <div className="financial-ticker" aria-live="polite">
        <span className="financial-ticker__item">
          <span className="financial-ticker__label">UF</span>
          <span>{formatCurrency(indicators.uf, ufFormatter)}</span>
        </span>
        <span className="financial-ticker__item">
          <span className="financial-ticker__label">USD</span>
          <span>{formatCurrency(indicators.dolar, clpFormatter)}</span>
        </span>
        <span className="financial-ticker__item">
          <span className="financial-ticker__label">EUR</span>
          <span>{formatCurrency(indicators.euro, clpFormatter)}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="financial-ticker financial-ticker--status" aria-live="polite">
      <span>{status === 'error' ? 'Indicadores no disponibles' : 'Cargando indicadores…'}</span>
    </div>
  );
};

const MarkaELaunchPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <section className="inner-page" aria-labelledby="markae-launch-title">
      <h1 id="markae-launch-title" className="sr-only">
        Lanzamiento Marka-E
      </h1>

      <article className="news-feature news-feature--id" aria-label="Lanzamiento de la plataforma Marka-E">
        <div className="news-feature__grid">
          <figure className="news-feature__photo">
            <img
              src="/imagenes/noticias%20prensa/prensa%201.jpeg"
              alt="Equipo de Agencia Marka durante el lanzamiento de la plataforma Marka-E"
            />
          </figure>

          <header className="news-feature__headline">
            <h2>Marka-E lanza su nueva plataforma de noticias empresariales desde el sur de Chile</h2>
            <ul className="news-feature__meta">
              <li>Sección: Comunicados de prensa</li>
              <li>Fecha: 15 de noviembre de 2025</li>
              <li>Fuente: Agencia Marka</li>
            </ul>
          </header>

          <div className="news-feature__content">
            <p className="news-feature__lead">
              <strong>
                Este 15 de noviembre, Agencia Marka presentará su nueva plataforma de noticias, Marka-E, que busca convertirse
                en un espacio de información y conexión para el mundo productivo de la zona sur de Chile.
              </strong>
            </p>
            <p>
              Puerto Montt, octubre de 2025.— El próximo 15 de noviembre iniciará sus operaciones Marka-E, una nueva plataforma
              digital de noticias empresariales creada para difundir el acontecer económico y productivo del sur de Chile, con
              una visión que también abarca temas de interés nacional e internacional.
            </p>
            <p>
              El proyecto es una iniciativa conjunta entre David Rivas, director de Marka-E y fundador de Agencia Marka, y
              Álvaro Figueroa, líder de la empresa tecnológica CodecLand, quienes unen sus experiencias en comunicación y
              desarrollo digital para dar vida a este espacio informativo.
            </p>
            <p>
              Marka-E está pensada como una ventana pluralista que busca aportar al desarrollo regional desde la información,
              promoviendo la visibilidad de las grandes empresas y también de las pequeñas y medianas empresas (PyMEs). Entre sus
              principales áreas de cobertura se encuentran la acuicultura, el turismo, la lechería y las historias de
              emprendimiento que impulsan la economía del sur del país.
            </p>
            <p>
              Con un enfoque moderno, dinámico y digital, Marka-E aspira a transformarse en un referente informativo que fortalezca
              los lazos entre el sector productivo, la innovación y la comunidad, entregando contenido relevante, riguroso y de
              calidad.
            </p>
          </div>

          <aside className="news-feature__aside" aria-label="Más comunicados de prensa">
            <h3>Más comunicados</h3>
            <ul>
              <li>Marka-E convocará a empresas regionales para su primera agenda editorial colaborativa.</li>
              <li>CodecLand presentará workshops sobre transformación digital para PyMEs del sur.</li>
              <li>Agencia Marka anuncia alianzas estratégicas con medios regionales y gremios productivos.</li>
              <li>Red de emprendimiento local prepara ciclo de entrevistas especiales con Marka-E.</li>
            </ul>
          </aside>
        </div>
      </article>

      <div className="news-feature__actions">
        <Link to="/" className="news-feature__back">
          Volver al inicio
        </Link>
      </div>
    </section>
  );
};

const Header = () => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navRef = useRef(null);
  const profileMenuRef = useRef(null);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isAdmin, status: adminStatus } = useAdminRole();

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
      {
        label: 'Economía y desarrollo',
        key: 'economia',
        submenu: [
          { label: 'I+D', path: '/economia-desarrollo/id' },
          { label: 'Tecnología', path: '/economia-desarrollo/tecnologia' },
          { label: 'Servicios', path: '/economia-desarrollo/servicios' },
        ],
      },
      { label: "PyME's", path: '/pymes' },
      { label: 'Nosotros', path: '/nosotros' },
      { label: 'Contacto', path: '/contacto' },
    ],
    []
  );

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveSubmenu(null);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setActiveSubmenu(null);
        setProfileMenuOpen(false);
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
    setProfileMenuOpen(false);
  }, [location.pathname]);

  const toggleSubmenu = (key) => {
    setActiveSubmenu((current) => (current === key ? null : key));
  };

  const handleNavigate = (path) => {
    setActiveSubmenu(null);
    navigate(path);
  };

  const goToAuth = () => {
    navigate('/auth');
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen((current) => !current);
  };

  const closeProfileMenu = () => {
    setProfileMenuOpen(false);
  };

  const handleGoToAdmin = () => {
    closeProfileMenu();
    navigate('/admin');
  };

  const handleLogout = async () => {
    closeProfileMenu();
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isAdminReady =
    adminStatus === ADMIN_ROLE_STATUS.ready || adminStatus === ADMIN_ROLE_STATUS.error;

  const profileLabel = useMemo(() => {
    if (!user) return '';
    return user.displayName || user.email || '';
  }, [user]);

  const profileInitial = useMemo(() => {
    const label = profileLabel.trim();
    return label.length > 0 ? label.charAt(0).toUpperCase() : '';
  }, [profileLabel]);

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

        <div className="header__ticker" aria-label="Indicadores financieros del día">
          <FinancialTicker />
        </div>

        <div className="header__social" aria-label="Redes sociales">
          <a
            className="header__social-link header__social-link--instagram"
            href="https://www.instagram.com/marka_e"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">Instagram</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.75A4.25 4.25 0 1 1 7.75 12 4.25 4.25 0 0 1 12 7.75zm0 2a2.25 2.25 0 1 0 2.25 2.25A2.25 2.25 0 0 0 12 9.75zm5.5-3a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" />
            </svg>
          </a>
          <a
            className="header__social-link header__social-link--facebook"
            href="https://www.facebook.com/markae"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">Facebook</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22 12a10 10 0 1 0-11.5 9.87v-6.98H8.5V12h2v-1.7c0-2 1.2-3.1 3-3.1a12.4 12.4 0 0 1 1.8.16v2h-1c-1 0-1.3.62-1.3 1.25V12h2.24l-.36 2.89h-1.88v6.98A10 10 0 0 0 22 12z" />
            </svg>
          </a>
          <a
            className="header__social-link header__social-link--x"
            href="https://twitter.com/marka_e"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">X (antes Twitter)</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 3.5h3.2l5.2 6.6 4.8-6.6H20l-6.2 8.3L20 20.5h-3.2l-5.4-7-5 7H4l6.3-8.7z" />
            </svg>
          </a>
        </div>

        <div className="header__actions" aria-label="Acciones del usuario">
          {user ? (
            <div className="header__profile" ref={profileMenuRef}>
              <button
                type="button"
                className={`header__profile-toggle${isProfileMenuOpen ? ' is-open' : ''}`}
                onClick={toggleProfileMenu}
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
              >
                <span className="header__profile-avatar" aria-hidden="true">
                  {profileInitial || 'U'}
                </span>
                <span className="header__profile-name" aria-live="polite">
                  {`Hola, ${profileLabel}`}
                </span>
                <span className="header__profile-chevron" aria-hidden="true">
                  {isProfileMenuOpen ? '▲' : '▼'}
                </span>
              </button>
              {isProfileMenuOpen ? (
                <div className="header__profile-menu" role="menu">
                  {isAdminReady && isAdmin ? (
                    <button
                      type="button"
                      className="header__profile-item header__profile-item--highlight"
                      onClick={handleGoToAdmin}
                      role="menuitem"
                    >
                      <span className="header__profile-item-icon" aria-hidden="true">
                        ⚙️
                      </span>
                      Panel de administración
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="header__profile-item"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    role="menuitem"
                  >
                    <span className="header__profile-item-icon" aria-hidden="true">
                      ↩️
                    </span>
                    {isLoggingOut ? 'Cerrando…' : 'Cerrar sesión'}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <button type="button" className="header__auth-button" onClick={goToAuth}>
              Iniciar sesión
            </button>
          )}
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

const BannerSlot = ({ label, imageSrc, mobileImageSrc, alt, href }) => {
  const desktopSrc = imageSrc ? encodeURI(imageSrc) : null;
  const mobileSrc = mobileImageSrc ? encodeURI(mobileImageSrc) : null;
  const hasMedia = desktopSrc || mobileSrc;

  const content = hasMedia ? (
    <picture className="banner-slot__picture">
      {mobileSrc && <source srcSet={mobileSrc} media="(max-width: 640px)" />}
      {desktopSrc && <source srcSet={desktopSrc} media="(min-width: 641px)" />}
      <img
        src={desktopSrc || mobileSrc}
        alt={alt || label}
        className="banner-slot__image"
        loading="lazy"
      />
      <span className="sr-only">{label}</span>
    </picture>
  ) : (
    <span>{label}</span>
  );

  return (
    <section
      className={`banner-slot${hasMedia ? ' banner-slot--has-media' : ''}`}
      aria-label={label}
      role="complementary"
    >
      {href ? (
        <a
          className="banner-slot__link"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </section>
  );
};

const Hero = () => {
  const { data, status } = useHeroContent();

  const heroTitle = useMemo(() => {
    if (typeof data.title === 'string' && data.title.trim().length > 0) {
      return data.title.trim();
    }
    return 'Marka-E lanza su nueva plataforma de noticias empresariales desde el sur de Chile';
  }, [data.title]);

  const [titleMain, titleSub] = useMemo(() => {
    const separator = '—';
    if (heroTitle.includes(separator)) {
      const [main, sub] = heroTitle.split(separator);
      return [main.trim(), sub.trim()];
    }
    return [heroTitle, ''];
  }, [heroTitle]);

  const heroVideoUrl = useMemo(() => {
    if (typeof data.videoUrl === 'string' && data.videoUrl.trim().length > 0) {
      return data.videoUrl.trim();
    }
    return 'https://www.youtube.com/embed/_jDeXfDVK10?autoplay=1&mute=1&rel=0&playsinline=1';
  }, [data.videoUrl]);

  const heroTag = useMemo(() => {
    if (typeof data.tag === 'string' && data.tag.trim().length > 0) {
      return data.tag.trim();
    }
    return 'Videos recientes';
  }, [data.tag]);

  const loading = status === HERO_STATUS.loading;

  return (
    <section className="hero" aria-labelledby="hero-featured">
      <div className="hero__content">
        <div className="hero__primary hero__panel hero__panel--feature">
          <div className="hero__panel-header" aria-hidden="true">
            <span className="title-badge title-badge--compact">{heroTag}</span>
          </div>
          <div className="hero__feature-heading">
            <h2 id="hero-featured">
              <span className="hero__feature-title-main">
                {titleMain}
              </span>
              {titleSub ? <span className="hero__feature-title-sub">{titleSub}</span> : null}
            </h2>
            <Link
              to="/economia-desarrollo/marka-e"
              className="hero__feature-cta"
              aria-label="Leer más sobre el lanzamiento de la plataforma Marka-E"
            >
              Leer más → →
            </Link>
          </div>
          <div className="hero__media" aria-label="Video destacado">
            <div className="hero__video">
              {loading ? (
                <div className="hero__video-placeholder" role="status" aria-live="polite">
                  Cargando video destacado…
                </div>
              ) : (
                <iframe
                  src={heroVideoUrl}
                  title="Video destacado"
                  frameBorder="0"
                  allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>
        </div>
        <div className="hero__aside hero__panel hero__panel--highlights">
          <div className="hero__panel-header" aria-hidden="true">
            <span className="title-badge title-badge--compact">Otras noticias</span>
          </div>
          <p className="hero__highlights-intro">
            Seleccionamos titulares breves para complementar la cobertura diaria con iniciativas y programas que están
            marcando la pauta empresarial en el sur de Chile.
          </p>
          <ul
            className="hero__highlights"
            aria-label="Otras noticias relevantes"
            data-mobile-visible-count="2"
          >
            <li>
              <span>•</span>
              <div className="hero__highlight-content">
                <Link to="/economia-desarrollo/id" className="hero__highlight-title">
                  Puerto Varas se consolida como polo biotecnológico del sur con nuevo StartupLab Los Lagos
                </Link>
                <Link to="/economia-desarrollo/id" className="hero__highlight-cta" aria-label="Leer más sobre Puerto Varas se consolida como polo biotecnológico">
                  Leer más →
                </Link>
              </div>
            </li>
            <li><span>•</span> Corfo y el Gobierno Regional cofinancian la adopción de tecnologías limpias y capacitación técnica.</li>
            <li data-mobile-hidden><span>•</span> Productores proyectan replicar la iniciativa en 120 predios antes de finalizar 2025.</li>
            <li data-mobile-hidden><span>•</span> Gremios lácteos impulsan feria tecnológica itinerante con demostraciones de maquinaria y software agrícola.</li>
            <li data-mobile-hidden><span>•</span> Los Lagos prepara hub de innovación acuícola para acelerar startups con capital semilla regional.</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

const OTHER_NEWS_TAG = 'Otras noticias y comunicados de prensa';
const OTHER_NEWS_LIMIT = 10;
const FALLBACK_NEWS_IMAGE = 'https://placehold.co/640x360?text=Noticia';

const RECENT_VIDEOS_TAG = 'Videos recientes';
const MAX_HOME_VIDEOS = 10;

const RecentVideos = () => {
  const { data: heroData } = useHeroContent();

  const activeTag = useMemo(() => {
    if (typeof heroData?.tag === 'string' && heroData.tag.trim().length > 0) {
      return heroData.tag.trim();
    }
    return RECENT_VIDEOS_TAG;
  }, [heroData?.tag]);

  const { items, status, error } = useVideos({ tag: activeTag, limit: MAX_HOME_VIDEOS });

  const normalizedItems = useMemo(() => {
    const safeItems = Array.isArray(items) ? items.slice(0, MAX_HOME_VIDEOS) : [];
    const filled = safeItems.map((item, index) => ({
      ...item,
      _internalKey: item.id ?? `video-${index}`,
    }));

    for (let index = filled.length; index < MAX_HOME_VIDEOS; index += 1) {
      filled.push({
        id: `placeholder-${index}`,
        _internalKey: `placeholder-${index}`,
        isPlaceholder: true,
      });
    }

    return filled;
  }, [items]);

  const loading = status === VIDEOS_STATUS.loading;
  const hasError = status === VIDEOS_STATUS.error;
  const isEmpty = status === VIDEOS_STATUS.empty;

  const statusMessage = (() => {
    if (hasError) {
      return error?.message
        ? `${error.message}. Mostramos espacios reservados.`
        : 'No pudimos cargar los videos. Mostramos espacios reservados.';
    }
    if (isEmpty) {
      return 'Aún no hay videos asociados a esta etiqueta. Mantendremos los espacios disponibles.';
    }
    if (loading) {
      return 'Cargando videos seleccionados…';
    }
    return null;
  })();

  const statusRole = hasError ? 'alert' : loading ? 'status' : 'note';

  return (
    <section className="videos" aria-labelledby="recent-videos">
      <div className="videos__header section-heading">
        <h2 id="recent-videos">
          <span className="title-badge">Videos recientes</span>
        </h2>
      </div>
      {statusMessage ? (
        <p
          className={`videos__status videos__status--${hasError ? 'error' : loading ? 'loading' : 'note'}`}
          role={statusRole}
        >
          {statusMessage}
        </p>
      ) : null}
      <div className="videos__grid" role="list">
        {normalizedItems.map((video) => {
          if (video.isPlaceholder) {
            return (
              <article
                key={video._internalKey}
                className="video-card video-card--placeholder"
                role="listitem"
                aria-label="Video disponible próximamente"
              >
                <div className="video-card__player video-card__player--placeholder">
                  <div className="video-card__player-overlay">Video disponible próximamente</div>
                </div>
                <div className="video-card__meta video-card__meta--placeholder">Reserva para próximos contenidos</div>
              </article>
            );
          }

          const title = typeof video.title === 'string' && video.title.trim().length > 0 ? video.title : 'Video sin título';
          const embedUrl = typeof video.embedUrl === 'string' ? video.embedUrl : '';

          return (
            <article key={video._internalKey} className="video-card" role="listitem">
              <div className="video-card__player">
                <iframe
                  src={embedUrl}
                  title={title}
                  frameBorder="0"
                  allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="video-card__meta">{title}</div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

const truncateText = (text, maxLength = 180) => {
  if (typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
};

const WrittenHighlights = () => {
  const { items, status, error } = useNews({ tag: OTHER_NEWS_TAG, limit: OTHER_NEWS_LIMIT });

  const normalizedItems = useMemo(() => {
    if (!Array.isArray(items)) return [];

    return items.slice(0, OTHER_NEWS_LIMIT).map((item, index) => {
      const title =
        typeof item.title === 'string' && item.title.trim().length > 0 ? item.title.trim() : 'Noticia sin título';
      const lead = typeof item.lead === 'string' ? item.lead : '';
      const body = typeof item.body === 'string' ? item.body : '';
      const excerptSource = lead.trim().length > 0 ? lead : body;
      const excerpt = truncateText(
        excerptSource.length > 0 ? excerptSource : 'Pronto añadiremos más detalles de esta noticia.'
      );
      const imageUrl =
        typeof item.imageUrl === 'string' && item.imageUrl.trim().length > 0
          ? item.imageUrl.trim()
          : FALLBACK_NEWS_IMAGE;
      const slug = typeof item.slug === 'string' && item.slug.trim().length > 0 ? item.slug.trim() : null;

      return {
        id: item.id ?? `news-${index}`,
        title,
        excerpt,
        imageUrl,
        slug,
      };
    });
  }, [items]);

  return (
    <section className="written" aria-labelledby="written-highlights">
      <div className="written__header section-heading">
        <h2 id="written-highlights">
          <span className="title-badge">Otras noticias y comunicados de prensa</span>
        </h2>
      </div>
      <div className="written__grid">
        {status === NEWS_STATUS.loading ? (
          <p className="written__status" role="status">
            Cargando noticias…
          </p>
        ) : status === NEWS_STATUS.error ? (
          <div className="written__status written__status--error" role="alert">
            <p>No pudimos cargar las noticias. Intenta nuevamente.</p>
            {error?.message ? <p>{error.message}</p> : null}
          </div>
        ) : normalizedItems.length === 0 ? (
          <p className="written__status" role="note">
            Aún no hay noticias registradas en esta sección.
          </p>
        ) : (
          normalizedItems.map((article) => {
            const href = article.slug ? `/noticias/${article.slug}` : null;
            return (
              <article key={article.id} className="written-card">
                <div className="written-card__image">
                  <img src={article.imageUrl} alt={article.title} loading="lazy" />
                </div>
                <div className="written-card__content">
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  {href ? (
                    <Link to={href} className="written-card__cta" aria-label={`Leer más sobre ${article.title}`}>
                      Leer más
                    </Link>
                  ) : (
                    <span className="written-card__cta" aria-disabled="true">
                      Leer más
                    </span>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

const Newsletter = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/suscripcion.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData).toString(),
      });

      if (!response.ok) {
        throw new Error('Error al registrar la suscripción');
      }

      const text = await response.text();
      setStatus('success');
      setMessage(text || '¡Gracias por suscribirte! Revisa tu correo para confirmar.');
      setFormData({ name: '', email: '' });
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('No pudimos registrar tu suscripción. Inténtalo nuevamente más tarde.');
    }
  };

  return (
    <section className="newsletter" aria-labelledby="newsletter">
      <div className="newsletter__layout">
        <div className="newsletter__content">
          <div className="section-heading">
            <h2 id="newsletter">
              <span className="title-badge">Newsletter / Suscripción gratis</span>
            </h2>
          </div>
          <p className="newsletter__intro">
            Recibe un resumen mensual con entrevistas, reportajes y agenda de eventos del ecosistema empresarial del sur de Chile.
          </p>
          <form className="newsletter__form" onSubmit={handleSubmit}>
            <div className="newsletter__group">
              <label htmlFor="newsletter-name" className="sr-only">
                Nombre completo
              </label>
              <input
                id="newsletter-name"
                name="name"
                type="text"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="newsletter__group">
              <label htmlFor="newsletter-email" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="newsletter__submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Enviando…' : 'Suscribirme'}
            </button>
          </form>
          {status !== 'idle' && message ? (
            <p className={`newsletter__message newsletter__message--${status}`} role="status">
              {message}
            </p>
          ) : null}
        </div>
        <aside className="newsletter__banner" aria-label="Espacio disponible para banner publicitario">
          <span>Espacio para banner</span>
        </aside>
      </div>
    </section>
  );
};

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setFeedback('');

    try {
      const response = await fetch('/contacto.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });

      const contentType = response.headers.get('content-type') ?? '';

      if (contentType.includes('application/json')) {
        const result = await response.json();

        if (!response.ok || !result.status) {
          throw new Error(result.message || 'No pudimos enviar tu mensaje.');
        }

        setStatus('success');
        setFeedback(result.message || '¡Gracias! Tu mensaje fue enviado correctamente.');
        setFormData({ name: '', email: '', company: '', message: '' });
        return;
      }

      const text = await response.text();
      const trimmed = text.trim();

      if (!response.ok) {
        throw new Error(trimmed.slice(0, 140) || 'El servidor respondió con un error desconocido.');
      }

      if (trimmed.startsWith('<?php')) {
        throw new Error(
          'El servidor devolvió código PHP sin ejecutar. Ejecuta la aplicación en un servidor con soporte PHP para procesar contacto.php.'
        );
      }

      if (trimmed.startsWith('<')) {
        throw new Error('El servidor devolvió HTML inesperado. Revisa la configuración del backend.');
      }

      setStatus('success');
      setFeedback(trimmed || '¡Gracias! Tu mensaje fue enviado correctamente.');
      setFormData({ name: '', email: '', company: '', message: '' });
    } catch (error) {
      console.error(error);
      setStatus('error');
      setFeedback(error.message || 'No pudimos enviar tu mensaje. Intenta nuevamente más tarde.');
    }
  };

  return (
    <form className={`contact-form contact-form--${status}`} onSubmit={handleSubmit}>
      <div className="contact-form__group">
        <label htmlFor="contact-name">Nombre completo</label>
        <input
          id="contact-name"
          name="name"
          type="text"
          placeholder="Tu nombre"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="contact-form__group">
        <label htmlFor="contact-email">Correo electrónico</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          placeholder="tu@correo.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="contact-form__group">
        <label htmlFor="contact-company">Empresa / organización</label>
        <input
          id="contact-company"
          name="company"
          type="text"
          placeholder="Nombre de tu empresa"
          value={formData.company}
          onChange={handleChange}
        />
      </div>
      <div className="contact-form__group">
        <label htmlFor="contact-message">Mensaje</label>
        <textarea
          id="contact-message"
          name="message"
          rows="5"
          placeholder="Cuéntanos en qué podemos ayudarte"
          value={formData.message}
          onChange={handleChange}
          required
        ></textarea>
      </div>
      <button type="submit" className="contact-form__submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Enviando…' : 'Enviar mensaje'}
      </button>
      {status !== 'idle' && feedback ? (
        <p className={`contact-form__feedback contact-form__feedback--${status === 'success' ? 'success' : 'error'}`}>
          {feedback}
        </p>
      ) : null}
    </form>
  );
};

const EventsFeed = () => {
  const events = [
    {
      id: 1,
      name: 'Agenda PyME Los Lagos',
      date: '4 noviembre, 09:00',
      dateTime: '2025-11-04T09:00:00-03:00',
      location: 'Puerto Varas · Centro de Eventos Arena',
      description: 'Encuentro para PyME’s del agro y turismo con rondas de negocios, asesoría financiera y talleres prácticos.'
    },
    {
      id: 2,
      name: 'Cumbre Innovación Agroalimentaria',
      date: '7 noviembre, 10:30',
      dateTime: '2025-11-07T10:30:00-03:00',
      location: 'Valdivia · Parque Saval',
      description: 'Panel sobre biotecnología aplicada, sustentabilidad hídrica y nuevos modelos de exportación para el sur de Chile.'
    },
    {
      id: 3,
      name: 'Seminario Talento Digital Austral',
      date: '12 noviembre, 15:00',
      dateTime: '2025-11-12T15:00:00-03:00',
      location: 'Online · Transmisión en vivo',
      description: 'Foro con empresas tecnológicas y universidades para abordar reconversión laboral, IA generativa y ciberseguridad.'
    }
  ];

  return (
    <section className="events" aria-labelledby="events-feed">
      <div className="section-heading">
        <h2 id="events-feed">
          <span className="title-badge">Próximos eventos</span>
        </h2>
      </div>
      <div className="events__grid" role="list">
        {events.map((event) => (
          <article key={event.id} className="event-card" role="listitem">
            <header className="event-card__header">
              <h3>{event.name}</h3>
              <time dateTime={event.dateTime}>{event.date}</time>
            </header>
            <p className="event-card__location">{event.location}</p>
            <p className="event-card__description">{event.description}</p>
            <button type="button" className="event-card__cta">Reservar cupo</button>
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
          <img src="/imagenes/markae%20blanco.png" alt="marka_e medio digital" className="footer__logo" />
          <p>
            Plataforma de noticias y análisis sobre acuicultura, lechería, agricultura y turismo en la zona sur de Chile.
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
            <li><Link to="/pymes">PyME's</Link></li>
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
        <span>&copy; {new Date().getFullYear()} marka_e. Todos los derechos reservados.</span>
        <span>
          Desarrollado por{' '}
          <a href="https://www.agenciamarka.cl" target="_blank" rel="noopener noreferrer">
            Agencia Marka
          </a>{' '}
          &amp;{' '}
          <a href="https://www.codecland.com" target="_blank" rel="noopener noreferrer">
            Codecland
          </a>
        </span>
      </div>
    </footer>
  );
};

const Layout = () => (
  <div className="app-shell">
    <Header />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);

const HomePage = () => (
  <>
    <BannerSlot
      label="Espacio Banner 1"
      imageSrc="/imagenes/banner-animacion-1.gif"
      mobileImageSrc="/imagenes/Codeclan_Responsive.gif"
      alt="Banner animado principal"
      href="https://www.codecland.com"
    />
    <Hero />
    <WrittenHighlights />
    <BannerSlot
      label="Espacio Banner 2"
      imageSrc="/imagenes/banner-aqualider.gif"
      mobileImageSrc="/imagenes/Aqualider_responsive.gif"
      alt="Banner Aqualider"
      href="https://www.aqualider.cl"
    />
    <RecentVideos />
    <Newsletter />
    <EventsFeed />
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

const PymesPage = () => (
  <section className="inner-page" aria-labelledby="pymes-title">
    <div className="inner-page__hero inner-page__hero--negocios">
      <h1 id="pymes-title">PyME's</h1>
      <p>
        Reportajes, herramientas y casos de innovación aplicada al desarrollo de pequeñas y medianas empresas del sur de
        Chile.
      </p>
    </div>
    <div className="inner-page__content">
      <article>
        <h2>Contenido en preparación</h2>
        <p>
          Próximamente encontrarás guías de financiamiento, historias de emprendimiento regional y directorios de apoyo
          para PyME's.
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

const EconomiaIDPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
  <section className="inner-page" aria-labelledby="economia-id-title">
    <h1 id="economia-id-title" className="sr-only">
      I+D destacado
    </h1>

    <article className="news-feature news-feature--id" aria-label="StartupLab Los Lagos">
      <div className="news-feature__grid">
        <figure className="news-feature__photo">
          <img src="/imagenes/economia/startup-lab-01.jpg" alt="Equipo de StartupLab Los Lagos en Puerto Varas" />
        </figure>

        <header className="news-feature__headline">
          <h2>Puerto Varas se consolida como polo biotecnológico del sur con nuevo StartupLab Los Lagos</h2>
          <ul className="news-feature__meta">
            <li>Sección: Economía y desarrollo / I+D</li>
            <li>Fecha: 30 de octubre de 2025</li>
            <li>Fuente: Depto. de Comunicaciones de Corfo Los Lagos</li>
          </ul>
        </header>

        <div className="news-feature__content">
          <p className="news-feature__lead">
            <strong>
              Corfo aprobó el proyecto StartupLab Los Lagos, liderado por Patagonia Biotech HUB y con base en Puerto Varas, que
              busca posicionar a la región como referente nacional en biotecnología aplicada y desarrollo sostenible. La
              iniciativa contempla una inversión de US$ 4,3 millones y reúne a empresas, instituciones públicas y actores del
              ecosistema científico-tecnológico.
            </strong>
          </p>
          <p>
            En el marco de su estrategia de descentralización de la innovación, Corfo aprobó el proyecto StartupLab Los Lagos,
            que será implementado por Patagonia Biotech HUB, encabezado por KuraBiotech. El nuevo centro tendrá su sede en
            Puerto Varas, donde se construirá un espacio de 1.000 m², con laboratorios especializados y áreas colaborativas
            orientadas al desarrollo biotecnológico.
          </p>
          <p>
            El StartupLab impulsará la innovación en sectores como acuicultura, agroindustria, silvicultura, energías limpias y
            biomedicina animal, con alcance en red hacia las regiones de La Araucanía, Los Ríos, Aysén y Magallanes.
          </p>
          <p>
            El proyecto cuenta con un presupuesto total de US$ 4,3 millones, de los cuales US$ 2,5 millones provienen de Corfo y
            US$ 1,8 millones del sector privado, con la participación de KuraBiotech, Veterquímica, Multi X, Genera4,
            Acuanativa, y el apoyo de instituciones como la Municipalidad de Puerto Varas, Sofofa Hub, Endeavor y BancoEstado.
          </p>
          <p>
            El seremi de Economía de Los Lagos, Luis Cárdenas, calificó la iniciativa como “un día histórico para la región”,
            destacando su aporte a la diversificación productiva y la economía del conocimiento. En tanto, el director regional
            de Corfo, Eduardo Arancibia, señaló que el StartupLab “posiciona a Los Lagos como un polo de biotecnología aplicada
            al desarrollo sostenible, con una mirada hacia el mundo”.
          </p>
          <p>
            El alcalde de Puerto Varas, Tomás Gárate, resaltó que el proyecto “consolidará a la ciudad como un referente en
            investigación aplicada e innovación con impacto territorial”, mientras que el CEO de KuraBiotech, Eduardo Wallach,
            subrayó que “Puerto Varas ya no es una promesa, sino un epicentro real del emprendimiento y la biotecnología en
            Chile”.
          </p>
          <p>
            Con esta aprobación, Corfo fortalece su red nacional de hubs de innovación, promoviendo el desarrollo tecnológico
            desde las regiones hacia todo el país.
          </p>
        </div>

        <aside className="news-feature__aside" aria-label="Otras noticias de I+D">
          <h3>Otras noticias</h3>
          <ul>
            <li>Startups acuícolas de Los Lagos aceleran transferencia tecnológica con apoyo de Endeavor.</li>
            <li>Universidad Austral inaugura centro de prototipado para bioeconomía circular.</li>
            <li>Hub de innovación energética lanza convocatoria para proyectos de hidrógeno verde.</li>
            <li>Laboratorio regional desarrolla biosensores para monitoreo de ecosistemas lacustres.</li>
          </ul>
        </aside>
      </div>
    </article>

    <div className="news-feature__actions">
      <Link to="/" className="news-feature__back">
        Volver al inicio
      </Link>
    </div>
  </section>
  );
};

const EconomiaTecnologiaPage = () => (
  <section className="inner-page" aria-labelledby="economia-tecnologia-title">
    <div className="inner-page__hero inner-page__hero--negocios">
      <h1 id="economia-tecnologia-title">Tecnología</h1>
      <p>
        Transformación digital, automatización y soluciones inteligentes que modernizan la gestión empresarial en el sur del
        país.
      </p>
    </div>
    <div className="inner-page__content">
      <article>
        <h2>Reportes en preparación</h2>
        <p>
          Pronto publicaremos notas sobre software, hardware y servicios tecnológicos adoptados por empresas regionales para
          mejorar su productividad.
        </p>
      </article>
    </div>
  </section>
);

const EconomiaServiciosPage = () => (
  <section className="inner-page" aria-labelledby="economia-servicios-title">
    <div className="inner-page__hero inner-page__hero--negocios">
      <h1 id="economia-servicios-title">Servicios</h1>
      <p>
        Plataformas y proveedores especializados que acompañan el crecimiento de las pymes y grandes empresas del sur.
      </p>
    </div>
    <div className="inner-page__content">
      <article>
        <h2>Sección en construcción</h2>
        <p>
          En breve incluiremos guías y directorios de servicios financieros, logísticos, profesionales y de consultoría para
          apoyar la gestión empresarial.
        </p>
      </article>
    </div>
  </section>
);

const NosotrosPage = () => (
  <section className="inner-page" aria-labelledby="nosotros-title">
    <div className="inner-page__hero inner-page__hero--corporativo">
      <h1 id="nosotros-title">Proyecto MARKA-E</h1>
      <p>
        MARKA-E es la plataforma digital creada por Agencia Marka para difundir el dinamismo empresarial y económico del sur
        de Chile, con un enfoque informativo transparente y colaborativo.
      </p>
    </div>
    <div className="inner-page__content">
      <article>
        <h2>1. Qué es MARKA-E</h2>
        <p>
          MARKA-E es una nueva plataforma digital desarrollada por Agencia Marka en Puerto Montt, orientada a la difusión de
          noticias empresariales y económicas. Su propósito es entregar información actual, objetiva y de calidad sobre el
          quehacer productivo del país, con especial enfoque en la zona sur de Chile. A través de reportajes, entrevistas y
          contenidos audiovisuales, MARKA-E busca mostrar el aporte de las empresas y organizaciones al desarrollo económico
          y social del territorio.
        </p>
      </article>
      <article>
        <h2>2. Enfoque informativo y contenidos</h2>
        <p>
          El portal <a href="https://www.markae.cl" target="_blank" rel="noopener noreferrer">www.markae.cl</a> reúne
          contenidos que abordan el mundo empresarial desde una mirada local y global, destacando experiencias,
          innovaciones y desafíos de distintos sectores productivos. Las noticias estarán centradas en áreas clave como la
          acuicultura, la lechería, el turismo y las pequeñas y medianas empresas (Pymes), relevando su rol en la generación
          de empleo, inversión y crecimiento regional. MARKA-E pone en valor el trabajo de quienes impulsan la economía del
          sur y contribuyen al posicionamiento de Chile como referente en diversas industrias.
        </p>
      </article>
      <article>
        <h2>3. Una vitrina para la economía del sur de Chile</h2>
        <p>
          MARKA-E nace como una plataforma de difusión abierta y colaborativa, que busca conectar al sector empresarial con
          la comunidad y los medios. Su objetivo es visibilizar las contribuciones y buenas prácticas de las empresas en
          cada rubro, promoviendo un relato positivo y constructivo sobre el desarrollo regional. Con una línea editorial
          informativa y transparente, MARKA-E se proyecta como un punto de encuentro entre la empresa, la innovación y el
          territorio.
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
        Completa el formulario o escríbenos directamente. Estamos disponibles para alianzas, pauta y consultas
        comerciales.
      </p>
    </div>
    <div className="inner-page__content inner-page__content--split">
      <article className="contact-card">
        <div className="section-heading">
          <h2>
            <span className="title-badge">Información de contacto</span>
          </h2>
        </div>
        <ul className="contact-details" aria-label="Datos de contacto de MARKA E">
          <li>
            <span className="contact-details__label">Correo</span>
            <a href="mailto:contacto@markae.cl">contacto@markae.cl</a>
          </li>
          <li>
            <span className="contact-details__label">Teléfono</span>
            <a href="tel:+56962636276">+56 9 6263 6276</a>
          </li>
        </ul>
      </article>

      <article className="contact-form-card">
        <div className="section-heading">
          <h2>
            <span className="title-badge">Escríbenos</span>
          </h2>
        </div>
        <ContactForm />
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
        <Route path="nosotros" element={<NosotrosPage />} />
        <Route path="pymes" element={<PymesPage />} />
        <Route path="economia-desarrollo" element={<EconomiaPage />} />
        <Route path="economia-desarrollo/id" element={<EconomiaIDPage />} />
        <Route path="economia-desarrollo/marka-e" element={<MarkaELaunchPage />} />
        <Route path="economia-desarrollo/tecnologia" element={<EconomiaTecnologiaPage />} />
        <Route path="economia-desarrollo/servicios" element={<EconomiaServiciosPage />} />
        <Route path="contacto" element={<ContactoPage />} />
        <Route path="auth" element={<AuthPage />} />
      </Route>
      <Route path="admin/login" element={<AdminLoginPage />} />
      <Route path="admin" element={<ProtectedRoute />}>
        <Route index element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
