import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import './styles/videoGrid.css';
import { Routes, Route, Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLogin';
import { useVideos, VIDEOS_STATUS } from './hooks/useVideos';
import { useAdminRole, ADMIN_ROLE_STATUS } from './hooks/useAdminRole';
import { useHeroContent, HERO_STATUS } from './hooks/useHeroContent';
import { useNews, NEWS_STATUS } from './hooks/useNews';
import { NAVIGATION_TAGS } from './constants/navigationTags';
import { getNewsBySlug } from './services/news';
import VideoModal from './components/VideoModal';

const TAG_TO_PATH = Object.entries(NAVIGATION_TAGS).reduce((accumulator, [path, label]) => {
  if (typeof label === 'string' && label.trim().length > 0) {
    accumulator[label.trim()] = path;
  }
  return accumulator;
}, {});

const resolvePrimaryTag = (tags) => {
  if (!Array.isArray(tags)) return null;
  for (const tagValue of tags) {
    const normalized = typeof tagValue === 'string' ? tagValue.trim() : '';
    if (normalized && TAG_TO_PATH[normalized]) {
      return {
        path: TAG_TO_PATH[normalized],
        label: normalized,
      };
    }
  }
  return null;
};

const getPreferredPathForTags = (tags) => resolvePrimaryTag(tags)?.path ?? null;

const toJSDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value.toDate === 'function') {
    const parsed = value.toDate();
    return parsed instanceof Date && !Number.isNaN(parsed.getTime()) ? parsed : null;
  }
  return null;
};

const splitBodyIntoParagraphs = (body) => {
  if (typeof body !== 'string') return [];
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
};

const ARTICLE_DATE_FORMATTER = new Intl.DateTimeFormat('es-CL', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const HERO_HIGHLIGHTS_LIMIT = 5;

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
        <Link
          to="/"
          className="header__logo"
          aria-label="Ir al inicio"
          onClick={() => {
            setActiveSubmenu(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <img src="/imagenes/logo.png" alt="marka_e" className="header__logo-image" />
          <span className="sr-only">marka_e medio digital</span>
        </Link>

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
            href="https://www.instagram.com/markae_md/"
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
          <a
            className="header__social-link header__social-link--youtube"
            href="https://www.youtube.com/@Markae_MD"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">YouTube</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21.58 7.2a2.51 2.51 0 0 0-1.77-1.78C18.35 5 12 5 12 5s-6.35 0-7.81.42A2.51 2.51 0 0 0 2.42 7.2 26.26 26.26 0 0 0 2 12a26.26 26.26 0 0 0 .42 4.8 2.51 2.51 0 0 0 1.77 1.78C5.65 19 12 19 12 19s6.35 0 7.81-.42a2.51 2.51 0 0 0 1.77-1.78A26.26 26.26 0 0 0 22 12a26.26 26.26 0 0 0-.42-4.8zM10 15.5v-7l6 3.5-6 3.5z" />
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
  const {
    items: heroNewsItems,
    status: heroNewsStatus,
    error: heroNewsError,
  } = useNews({ limit: HERO_HIGHLIGHTS_LIMIT });

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

  const heroHighlights = useMemo(() => {
    if (!Array.isArray(heroNewsItems)) return [];

    return heroNewsItems.slice(0, HERO_HIGHLIGHTS_LIMIT).map((article, index) => {
      const title =
        typeof article.title === 'string' && article.title.trim().length > 0
          ? article.title.trim()
          : 'Noticia sin título';
      const slug = typeof article.slug === 'string' && article.slug.trim().length > 0 ? article.slug.trim() : null;
      const preferredPath = getPreferredPathForTags(article.tags);
      const href = slug ? (preferredPath ? `${preferredPath}/${slug}` : `/noticias/${slug}`) : null;

      return {
        id: article.id ?? `hero-highlight-${index}`,
        title,
        href,
      };
    });
  }, [heroNewsItems]);

  const loading = status === HERO_STATUS.loading;

  return (
    <section className="hero" aria-labelledby="hero-featured">
      <div className="hero__content">
        <div className="hero__primary hero__panel hero__panel--feature">
          <div className="hero__panel-header" aria-hidden="true">
            <span className="title-badge title-badge--compact">Noticia destacada</span>
          </div>
          <div className="hero__feature-heading">
            <h2 id="hero-featured">
              <span className="hero__feature-title-main">
                {titleMain}
              </span>
              {titleSub ? <span className="hero__feature-title-sub">{titleSub}</span> : null}
            </h2>
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
          <ul
            className="hero__highlights"
            aria-label="Otras noticias relevantes"
            data-mobile-visible-count="2"
          >
            {heroNewsStatus === NEWS_STATUS.loading ? (
              <li className="hero__highlight hero__highlight--status" role="status">
                <span>Cargando otras noticias…</span>
              </li>
            ) : heroNewsStatus === NEWS_STATUS.error ? (
              <li className="hero__highlight hero__highlight--status" role="alert">
                <span>No pudimos cargar otras noticias.</span>
                {heroNewsError?.message ? <small>{heroNewsError.message}</small> : null}
              </li>
            ) : heroHighlights.length === 0 ? (
              <li className="hero__highlight hero__highlight--status" role="note">
                <span>Pronto añadiremos más noticias en esta sección.</span>
              </li>
            ) : (
              heroHighlights.map((item, index) => {
                const mobileHiddenProps = index >= 2 ? { 'data-mobile-hidden': true } : {};
                if (index === 0) {
                  return (
                    <li key={item.id} {...mobileHiddenProps}>
                      <span>•</span>
                      <div className="hero__highlight-content">
                        {item.href ? (
                          <Link to={item.href} className="hero__highlight-title">
                            {item.title}
                          </Link>
                        ) : (
                          <span className="hero__highlight-title">{item.title}</span>
                        )}
                        {item.href ? (
                          <Link to={item.href} className="hero__highlight-cta" aria-label={`Leer más sobre ${item.title}`}>
                            Leer más →
                          </Link>
                        ) : null}
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={item.id} {...mobileHiddenProps}>
                    <span>•</span>
                    <div className="hero__highlight-content hero__highlight-content--compact">
                      {item.href ? (
                        <Link to={item.href} className="hero__highlight-title">
                          {item.title}
                        </Link>
                      ) : (
                        <span className="hero__highlight-title">{item.title}</span>
                      )}
                      {item.href ? (
                        <Link
                          to={item.href}
                          className="hero__highlight-cta hero__highlight-cta--inline"
                          aria-label={`Leer más sobre ${item.title}`}
                        >
                          Leer más →
                        </Link>
                      ) : null}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </section>
  );
};

const OTHER_NEWS_TAG = 'Otras noticias y comunicados de prensa';
const OTHER_NEWS_LIMIT = 10;
const SECTION_NEWS_LIMIT = 10;
const FALLBACK_NEWS_IMAGE = 'https://placehold.co/640x360?text=Noticia';

const DETAIL_STATUS = Object.freeze({
  loading: 'loading',
  ready: 'ready',
  notFound: 'not_found',
  error: 'error',
});

const normalizeNewsArticle = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const title =
    typeof raw.title === 'string' && raw.title.trim().length > 0 ? raw.title.trim() : 'Noticia sin título';
  const lead = typeof raw.lead === 'string' ? raw.lead.trim() : '';
  const bodyParagraphs = splitBodyIntoParagraphs(raw.body);
  const imageUrl =
    typeof raw.imageUrl === 'string' && raw.imageUrl.trim().length > 0 ? raw.imageUrl.trim() : FALLBACK_NEWS_IMAGE;
  const tags = Array.isArray(raw.tags) ? raw.tags : [];
  const publishedAt = toJSDate(raw.articleDate) ?? toJSDate(raw.updatedAt) ?? toJSDate(raw.createdAt);
  const createdAt = toJSDate(raw.createdAt);
  const source = typeof raw.source === 'string' && raw.source.trim().length > 0 ? raw.source.trim() : null;
  const slug = typeof raw.slug === 'string' && raw.slug.trim().length > 0 ? raw.slug.trim() : null;

  return {
    id: raw.id ?? null,
    title,
    lead,
    bodyParagraphs,
    imageUrl,
    tags,
    publishedAt,
    createdAt,
    source,
    slug,
  };
};

const NewsDetailPage = ({ sectionPath = null }) => {
  const { slug } = useParams();
  const [status, setStatus] = useState(DETAIL_STATUS.loading);
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  useEffect(() => {
    let isMounted = true;

    const fetchArticle = async () => {
      if (!slug) {
        if (!isMounted) return;
        setArticle(null);
        setStatus(DETAIL_STATUS.notFound);
        return;
      }

      if (isMounted) {
        setStatus(DETAIL_STATUS.loading);
        setError(null);
      }

      try {
        const rawArticle = await getNewsBySlug(slug);
        if (!isMounted) return;

        if (!rawArticle) {
          setArticle(null);
          setStatus(DETAIL_STATUS.notFound);
          return;
        }

        const normalized = normalizeNewsArticle(rawArticle);
        setArticle(normalized);
        setStatus(DETAIL_STATUS.ready);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError);
        setStatus(DETAIL_STATUS.error);
      }
    };

    fetchArticle();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const fallbackSectionLabel =
    sectionPath && typeof NAVIGATION_TAGS[sectionPath] === 'string' ? NAVIGATION_TAGS[sectionPath] : null;
  const fallbackBackHref = sectionPath ?? '/';
  const fallbackBackLabel = fallbackSectionLabel ? `Volver a ${fallbackSectionLabel}` : 'Volver al inicio';

  if (status !== DETAIL_STATUS.ready || !article) {
    const isLoading = status === DETAIL_STATUS.loading;
    const isNotFound = status === DETAIL_STATUS.notFound;

    return (
      <section className="inner-page news-detail" aria-labelledby="news-detail-title">
        <div className="inner-page__hero inner-page__hero--article">
          <h1 id="news-detail-title">
            {isLoading ? 'Cargando noticia…' : isNotFound ? 'Noticia no encontrada' : 'No pudimos cargar la noticia'}
          </h1>
          <p>
            {isLoading
              ? 'Estamos recuperando la información de esta noticia.'
              : isNotFound
              ? 'Revisa que la dirección sea correcta o vuelve a la sección correspondiente.'
              : 'Revisa tu conexión o vuelve a intentarlo más tarde.'}
          </p>
        </div>
        <div className="inner-page__content">
          {status === DETAIL_STATUS.error && error?.message ? (
            <p className="news-detail__status" role="alert">
              {error.message}
            </p>
          ) : null}
          <div className="news-feature__actions">
            <Link to={fallbackBackHref} className="news-feature__back">
              ← {fallbackBackLabel}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const primaryTag = resolvePrimaryTag(article.tags);
  const sectionLabel = primaryTag?.label ?? fallbackSectionLabel ?? 'Noticias';
  const sectionHref = primaryTag?.path ?? fallbackBackHref;
  const backLabel = primaryTag?.label && primaryTag.path ? `Volver a ${primaryTag.label}` : fallbackBackLabel;
  const publishedDate = article.publishedAt ? ARTICLE_DATE_FORMATTER.format(article.publishedAt) : null;
  const hasBody = Array.isArray(article.bodyParagraphs) && article.bodyParagraphs.length > 0;
  const fallbackParagraph = article.lead || 'Pronto añadiremos más detalles de esta noticia.';

  return (
    <section className="inner-page news-detail" aria-labelledby="news-detail-title">
      <div className="inner-page__hero inner-page__hero--article">
        <span className="title-badge">{sectionLabel}</span>
        <h1 id="news-detail-title">{article.title}</h1>
        {article.lead ? <p>{article.lead}</p> : null}
      </div>

      <div className="inner-page__content">
        <article className="news-feature news-feature--detail" aria-label={`Detalle de ${article.title}`}>
          <div className="news-feature__grid">
            <figure className="news-feature__photo">
              <img src={article.imageUrl} alt={article.title} />
            </figure>
            <header className="news-feature__headline">
              <h2 className="sr-only">Metadatos de la noticia</h2>
              <ul className="news-feature__meta">
                {sectionLabel ? <li>Sección: {sectionLabel}</li> : null}
                {publishedDate ? <li>Fecha: {publishedDate}</li> : null}
                {article.source ? <li>Fuente: {article.source}</li> : null}
              </ul>
            </header>
            <div className="news-feature__content">
              {hasBody
                ? article.bodyParagraphs.map((paragraph, index) => (
                    <p key={`paragraph-${index}`}>{paragraph}</p>
                  ))
                : <p>{fallbackParagraph}</p>}
            </div>
          </div>
        </article>

        <div className="news-feature__actions">
          <Link to={sectionHref} className="news-feature__back">
            ← {backLabel}
          </Link>
        </div>
      </div>
    </section>
  );
};

const RECENT_VIDEOS_TAG = 'Videos recientes';
const MAX_HOME_VIDEOS = 10;

// Componente de tarjeta de video reutilizable
const VideoCard = ({ video, onClick }) => {
  const title = typeof video.title === 'string' && video.title.trim().length > 0 
    ? video.title.trim() 
    : 'Video sin título';
  const embedUrl = typeof video.embedUrl === 'string' && video.embedUrl.trim().length > 0 
    ? video.embedUrl.trim() 
    : '';
  
  // Extraer la miniatura del video de YouTube
  const thumbnailUrl = useMemo(() => {
    if (!embedUrl) return '';
    try {
      const url = new URL(embedUrl);
      const videoId = url.pathname.split('/').pop();
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    } catch {
      return '';
    }
  }, [embedUrl]);

  return (
    <article 
      className="video-card" 
      role="listitem"
      onClick={() => onClick(video)}
      style={{
        cursor: 'pointer',
        width: '100%',
        maxWidth: '100%',
        margin: '0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        border: '1px solid #e2e8f0'
      }}
      aria-label={`Ver video: ${title}`}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%', /* Proporción 16:9 */
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #f1f5f9',
        flexShrink: '0'
      }}>
        {thumbnailUrl ? (
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={thumbnailUrl} 
              alt={`Miniatura de ${title}`} 
              loading="lazy"
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60px',
              height: '60px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: '2',
              transition: 'all 0.2s ease',
              opacity: '0.9'
            }} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        ) : (
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#e2e8f0'
          }}>
            <svg viewBox="0 0 24 24" width="48" height="48" fill="#94a3b8">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        )}
      </div>
      <div style={{
        padding: '12px',
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <h3 style={{
          fontSize: '0.95rem',
          fontWeight: '600',
          color: '#1e293b',
          margin: '0',
          display: '-webkit-box',
          WebkitLineClamp: '2',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minHeight: '2.8em',
          lineHeight: '1.4',
          letterSpacing: '-0.01em',
          wordBreak: 'break-word'
        }}>{title}</h3>
      </div>
    </article>
  );
};

const RecentVideos = () => {
  const { data: heroData } = useHeroContent();

  const activeTag = useMemo(() => {
    if (typeof heroData?.tag === 'string' && heroData.tag.trim().length > 0) {
      return heroData.tag.trim();
    }
    return RECENT_VIDEOS_TAG;
  }, [heroData?.tag]);

  const { items, status, error } = useVideos({ tag: activeTag, limit: MAX_HOME_VIDEOS });

  const [selectedVideo, setSelectedVideo] = useState(null);

  const handleVideoClick = useCallback((video) => {
    if (video?.embedUrl) {
      setSelectedVideo(video);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  const normalizedItems = useMemo(() => {
    const uniqueItems = [];
    const seenIds = new Set();
    
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item?.id && !seenIds.has(item.id)) {
          seenIds.add(item.id);
          uniqueItems.push(item);
        }
      }
    }
    
    const safeItems = uniqueItems.slice(0, MAX_HOME_VIDEOS);
    
    const filled = safeItems.map((item) => ({
      ...item,
      _internalKey: `video-${item.id}`,
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
    <section className="videos videos--home" aria-labelledby="recent-videos">
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
      <div className="videos__grid videos__grid--home" role="list">
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
            <VideoCard 
              key={video._internalKey}
              video={{
                ...video,
                title,
                embedUrl
              }}
              onClick={handleVideoClick}
            />
          );
        })}
      </div>
      {selectedVideo && (
        <VideoModal
          videoUrl={selectedVideo.embedUrl}
          title={selectedVideo.title}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
};

const truncateText = (text, maxLength = 180) => {
  if (typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
};

const SectionNewsPage = ({ tag, heroVariant = '', title, intro, headingId }) => {
  const { items, status, error } = useNews({ tag, limit: SECTION_NEWS_LIMIT });
  const {
    items: videoItems,
    status: videosStatus,
    error: videosError,
  } = useVideos({ tag, limit: null });

  const [selectedVideo, setSelectedVideo] = useState(null);

  const handleVideoClick = useCallback((video) => {
    if (video?.embedUrl) {
      setSelectedVideo(video);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);
  
  // Asegurar que el contenedor principal ocupe todo el ancho
  useEffect(() => {
    const mainContent = document.querySelector('.inner-page');
    const innerContent = document.querySelector('.inner-page__content');
    
    if (mainContent) {
      mainContent.style.maxWidth = '100%';
      mainContent.style.padding = '0';
      mainContent.style.margin = '0';
    }
    
    if (innerContent) {
      innerContent.style.maxWidth = '100%';
      innerContent.style.padding = '0';
      innerContent.style.margin = '0';
    }
    
    // Aplicar estilos específicos para la sección de videos
    const videosSection = document.querySelector('.videos');
    if (videosSection) {
      videosSection.style.width = '100%';
      videosSection.style.maxWidth = '100%';
      videosSection.style.margin = '0 auto';
      videosSection.style.padding = '2rem 0 3rem';
      videosSection.style.backgroundColor = '#f8fafc';
      videosSection.style.boxSizing = 'border-box';
    }
    
    // Asegurar que el grid de videos ocupe todo el ancho
    const videosGrid = document.querySelector('.videos__grid');
    if (videosGrid) {
      videosGrid.style.maxWidth = '1400px';
      videosGrid.style.margin = '0 auto';
      videosGrid.style.padding = '0 2rem';
      videosGrid.style.display = 'grid';
      videosGrid.style.gridTemplateColumns = 'repeat(4, minmax(240px, 1fr))';
      videosGrid.style.gap = '1.5rem';
      videosGrid.style.width = '100%';
      videosGrid.style.boxSizing = 'border-box';
    }
    
    // Asegurar que los títulos de las tarjetas de video tengan el mismo estilo
    const videoTitles = document.querySelectorAll('.video-card__title');
    videoTitles.forEach(title => {
      title.style.fontSize = '0.95rem';
      title.style.fontWeight = '600';
      title.style.color = '#1e293b';
      title.style.margin = '0';
      title.style.display = '-webkit-box';
      title.style.WebkitLineClamp = '2';
      title.style.WebkitBoxOrient = 'vertical';
      title.style.overflow = 'hidden';
      title.style.textOverflow = 'ellipsis';
      title.style.minHeight = '2.8em';
      title.style.lineHeight = '1.4';
      title.style.letterSpacing = '-0.01em';
      title.style.wordBreak = 'break-word';
    });
    
    // Restaurar estilos al desmontar
    return () => {
      if (mainContent) {
        mainContent.style.maxWidth = '';
        mainContent.style.padding = '';
        mainContent.style.margin = '';
      }
      
      if (innerContent) {
        innerContent.style.maxWidth = '';
        innerContent.style.padding = '';
        innerContent.style.margin = '';
      }
    };
  }, [tag]); // Se ejecuta cuando cambia el tag de la sección

  const normalizedItems = useMemo(() => {
    if (!Array.isArray(items)) return [];

    return items.map((article, index) => {
      const titleText =
        typeof article.title === 'string' && article.title.trim().length > 0
          ? article.title.trim()
          : 'Noticia sin título';
      const leadText = typeof article.lead === 'string' ? article.lead.trim() : '';
      const bodyText = typeof article.body === 'string' ? article.body.trim() : '';
      const excerptSource = leadText.length > 0 ? leadText : bodyText;
      const excerpt = truncateText(
        excerptSource.length > 0 ? excerptSource : 'Pronto añadiremos más detalles de esta noticia.'
      );
      const imageUrl =
        typeof article.imageUrl === 'string' && article.imageUrl.trim().length > 0
          ? article.imageUrl.trim()
          : FALLBACK_NEWS_IMAGE;
      const slug = typeof article.slug === 'string' && article.slug.trim().length > 0 ? article.slug.trim() : null;

      const preferredPath = getPreferredPathForTags(article.tags);
      const detailHref = slug && preferredPath ? `${preferredPath}/${slug}` : slug ? `/noticias/${slug}` : null;

      return {
        id: article.id ?? `section-article-${index}`,
        title: titleText,
        excerpt,
        imageUrl,
        detailHref,
      };
    });
  }, [items]);

  const normalizedVideos = useMemo(() => {
    if (!Array.isArray(videoItems) || videoItems.length === 0) return [];

    const seen = new Set();

    return videoItems
      .filter((video) => {
        const embedUrl = typeof video.embedUrl === 'string' ? video.embedUrl.trim() : '';
        const uniqueKey = embedUrl.length > 0 ? embedUrl : video.id ?? '';
        if (!uniqueKey) return false;
        if (seen.has(uniqueKey)) return false;
        seen.add(uniqueKey);
        return true;
      })
      .map((video, index) => {
        const titleText =
          typeof video.title === 'string' && video.title.trim().length > 0
            ? video.title.trim()
            : 'Video sin título';
        const embedUrl = typeof video.embedUrl === 'string' ? video.embedUrl.trim() : '';

        return {
          id: video.id ?? `section-video-${index}`,
          title: titleText,
          embedUrl,
        };
      });
  }, [videoItems]);

  const videosMessage = (() => {
    if (videosStatus === VIDEOS_STATUS.error) {
      return videosError?.message || 'No pudimos cargar los videos de esta sección.';
    }
    if (videosStatus === VIDEOS_STATUS.loading) {
      return 'Cargando videos de esta sección…';
    }
    if (normalizedVideos.length === 0) {
      return 'Aún no hay videos asociados a esta sección.';
    }
    return null;
  })();

  const heroClassName = heroVariant.length > 0 ? `inner-page__hero ${heroVariant}` : 'inner-page__hero';

  return (
    <section className="inner-page" aria-labelledby={headingId} style={{
      maxWidth: '100%',
      padding: '0',
      margin: '0',
      width: '100%'
    }}>
      <div className={heroClassName}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          width: '100%'
        }}>
          <h1 id={headingId}>{title}</h1>
          <p>{intro}</p>
        </div>
      </div>

      <div className="inner-page__content" style={{
        maxWidth: '100%',
        padding: '0',
        margin: '0',
        width: '100%'
      }}>
        {status === NEWS_STATUS.loading ? (
          <p role="status">Cargando noticias…</p>
        ) : status === NEWS_STATUS.error ? (
          <div role="alert">
            <p>No pudimos cargar las noticias de esta sección.</p>
            {error?.message ? <p>{error.message}</p> : null}
          </div>
        ) : normalizedItems.length === 0 ? (
          <p role="note">Aún no hay noticias registradas para esta sección.</p>
        ) : (
          <div className="written__grid">
            {normalizedItems.map((article) => (
              <article key={article.id} className="written-card written-card--compact">
                <div className="written-card__image">
                  <img src={article.imageUrl} alt={article.title} loading="lazy" />
                </div>
                <div className="written-card__content">
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  {article.detailHref ? (
                    <Link
                      to={article.detailHref}
                      className="written-card__cta"
                      aria-label={`Leer más sobre ${article.title}`}
                    >
                      Leer más
                    </Link>
                  ) : (
                    <span className="written-card__cta" aria-disabled="true">
                      Leer más
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {tag && normalizedVideos.length > 0 && (
          <section className="videos" aria-label={`Videos de ${title}`}>
            <div className="videos__container">
              <header className="section-heading">
                <h2>
                  <span className="title-badge">Videos</span>
                  <span>{title}</span>
                </h2>
              </header>
              <div className="videos__grid">
                {normalizedVideos.map((video) => (
                  <VideoCard 
                    key={video.id}
                    video={video}
                    onClick={handleVideoClick}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
      
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
};

const AcuiculturaPage = () => (
  <SectionNewsPage
    tag={NAVIGATION_TAGS['/acuicultura'] ?? 'Acuicultura'}
    heroVariant="inner-page__hero--acuicultura"
    title="Acuicultura"
    intro="Reportes, innovación y políticas públicas que marcan la agenda de la industria acuícola."
    headingId="acuicultura-title"
  />
);

const SalmoniculturaPage = () => (
  <SectionNewsPage
    tag={NAVIGATION_TAGS['/acuicultura/salmonicultura']}
    heroVariant="inner-page__hero--acuicultura"
    title="Salmonicultura"
    intro="Producción, sostenibilidad y proyecciones de la industria del salmón."
    headingId="salmonicultura-title"
  />
);

const MitiliculturaPage = () => (
  <SectionNewsPage
    tag={NAVIGATION_TAGS['/acuicultura/mitilicultura']}
    heroVariant="inner-page__hero--acuicultura"
    title="Mitilicultura"
    intro="Noticias sobre el cultivo y la agregación de valor de los choritos."
    headingId="mitilicultura-title"
  />
);

const LecheriaPage = () => (
  <SectionNewsPage
    tag={NAVIGATION_TAGS['/lecheria']}
    heroVariant="inner-page__hero--negocios"
    title="Lechería"
    intro="Cobertura integral de la cadena láctea, sus cooperativas y tecnologías."
    headingId="lecheria-title"
  />
);

const TurismoPage = () => (
  <SectionNewsPage
    tag={NAVIGATION_TAGS['/turismo']}
    heroVariant="inner-page__hero--turismo"
    title="Turismo"
    intro="Estrategias, experiencias y políticas que fortalecen la oferta turística del sur de Chile."
    headingId="turismo-title"
  />
);

const TurismoOperadoresPage = () => (
  <SectionNewsPage
    tag={NAVIGATION_TAGS['/turismo/operadores']}
    heroVariant="inner-page__hero--turismo"
    title="Operadores turísticos"
    intro="Actualidad y buenas prácticas de agencias y guías especializados."
    headingId="turismo-operadores-title"
  />
);

const TurismoHoteleriaPage = () => (
  <SectionNewsPage
    tag={NAVIGATION_TAGS['/turismo/hoteleria-gastronomia']}
    heroVariant="inner-page__hero--turismo"
    title="Hotelería y gastronomía"
    intro="Tendencias culinarias y de hospitalidad que potencian el turismo del sur."
    headingId="turismo-hoteleria-title"
  />
);

const TurismoOfertaPage = () => (
  <SectionNewsPage
    tag={NAVIGATION_TAGS['/turismo/oferta']}
    heroVariant="inner-page__hero--turismo"
    title="Oferta turística"
    intro="Rutas, panoramas y experiencias que posicionan a la macrozona sur."
    headingId="turismo-oferta-title"
  />
);

const EconomiaPage = () => (
  <SectionNewsPage
    tag={NAVIGATION_TAGS['/economia-desarrollo']}
    heroVariant="inner-page__hero--negocios"
    title="Economía y desarrollo"
    intro="Inversiones, políticas públicas y proyectos estratégicos para la región."
    headingId="economia-title"
  />
);

const EconomiaIDPage = () => (
  <SectionNewsPage
    tag={NAVIGATION_TAGS['/economia-desarrollo/id']}
    heroVariant="inner-page__hero--negocios"
    title="I+D"
    intro="Innovación, ciencia aplicada y transferencia tecnológica desde el sur."
    headingId="economia-id-title"
  />
);

const EconomiaTecnologiaPage = () => (
  <SectionNewsPage
    tag={NAVIGATION_TAGS['/economia-desarrollo/tecnologia']}
    heroVariant="inner-page__hero--negocios"
    title="Tecnología"
    intro="Digitalización, automatización y soluciones inteligentes para la industria."
    headingId="economia-tecnologia-title"
  />
);

const EconomiaServiciosPage = () => (
  <SectionNewsPage
    tag={NAVIGATION_TAGS['/economia-desarrollo/servicios']}
    heroVariant="inner-page__hero--negocios"
    title="Servicios"
    intro="Proveedores y plataformas que acompañan el crecimiento empresarial."
    headingId="economia-servicios-title"
  />
);

const PymesPage = () => (
  <SectionNewsPage
    tag={NAVIGATION_TAGS['/pymes']}
    heroVariant="inner-page__hero--negocios"
    title="PyME's"
    intro="Historias de emprendimiento, financiamiento y escalamiento en la macrozona sur."
    headingId="pymes-title"
  />
);

const WrittenHighlights = () => {
  const { items, status, error } = useNews({ tag: OTHER_NEWS_TAG, limit: OTHER_NEWS_LIMIT });

  const normalizedItems = useMemo(() => {
    if (!Array.isArray(items)) return [];

    return items.slice(0, OTHER_NEWS_LIMIT).map((item, index) => {
      const title =
        typeof item.title === 'string' && item.title.trim().length > 0 ? item.title.trim() : 'Noticia sin título';
      const imageUrl =
        typeof item.imageUrl === 'string' && item.imageUrl.trim().length > 0
          ? item.imageUrl.trim()
          : FALLBACK_NEWS_IMAGE;
      const slug = typeof item.slug === 'string' && item.slug.trim().length > 0 ? item.slug.trim() : null;

      return {
        id: item.id ?? `news-${index}`,
        title,
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
          <p className="footer__brand-meta">Desde 2023 impulsando el periodismo especializado para la macrozona sur.</p>
        </div>

        <div className="footer__section">
          <h4>Secciones principales</h4>
          <ul>
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/acuicultura/salmonicultura">Acuicultura</Link>
            </li>
            <li>
              <Link to="/lecheria">Lechería</Link>
            </li>
            <li>
              <Link to="/turismo/operadores">Turismo</Link>
            </li>
            <li>
              <Link to="/economia-desarrollo">Economía y desarrollo</Link>
            </li>
            <li>
              <Link to="/pymes">PyME's</Link>
            </li>
            <li>
              <Link to="/contacto">Contacto</Link>
            </li>
          </ul>
        </div>

        <div className="footer__section footer__section--team">
          <h4>Equipo Marka-E</h4>
          <ul className="footer__list footer__list--roles">
            <li className="footer__list-item">
              <span className="footer__item-label">Diseño web e informática</span>
              <span className="footer__item-value">Álvaro Figueroa Zapata</span>
            </li>
            <li className="footer__list-item">
              <span className="footer__item-label">Desarrollo software</span>
              <span className="footer__item-value">Cristóbal Figueroa</span>
            </li>
            <li className="footer__list-item">
              <span className="footer__item-label">Periodista área acuícola</span>
              <span className="footer__item-value">Adrián Maldonado</span>
            </li>
            <li className="footer__list-item">
              <span className="footer__item-label">Publicista</span>
              <span className="footer__item-value">Guillermo Vera Yáñez</span>
            </li>
            <li className="footer__list-item">
              <span className="footer__item-label">Director</span>
              <span className="footer__item-value">David Rivas Freire</span>
            </li>
          </ul>
        </div>

        <div className="footer__section footer__section--partners">
          <h4>Empresas partner</h4>
          <ul className="footer__list">
            <li>
              <a href="https://www.codecland.com" target="_blank" rel="noopener noreferrer">
                Codecland IT Solutions
              </a>
            </li>
            <li>
              <a href="https://www.agenciamarka.cl" target="_blank" rel="noopener noreferrer">
                Agencia Marka, desarrollo audiovisual
              </a>
            </li>
          </ul>
        </div>

        <div className="footer__section">
          <h4>Datos legales y privacidad</h4>
          <ul>
            <li>
              <a href="#">Aviso legal</a>
            </li>
            <li>
              <a href="#">Política de privacidad</a>
            </li>
            <li>
              <a href="#">Términos de uso</a>
            </li>
            <li>
              <a href="#">Cookies</a>
            </li>
          </ul>
        </div>

        <div className="footer__section">
          <h4>Redes sociales</h4>
          <ul>
            <li>
              <a href="https://www.instagram.com/markae_md/" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com/@Markae_MD" target="_blank" rel="noopener noreferrer">
                YouTube
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </li>
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
        <Route path="acuicultura" element={<AcuiculturaPage />} />
        <Route path="acuicultura/salmonicultura" element={<SalmoniculturaPage />} />
        <Route
          path="acuicultura/salmonicultura/:slug"
          element={<NewsDetailPage sectionPath="/acuicultura/salmonicultura" />}
        />
        <Route path="acuicultura/mitilicultura" element={<MitiliculturaPage />} />
        <Route
          path="acuicultura/mitilicultura/:slug"
          element={<NewsDetailPage sectionPath="/acuicultura/mitilicultura" />}
        />
        <Route path="acuicultura/:slug" element={<NewsDetailPage sectionPath="/acuicultura" />} />
        <Route path="lecheria" element={<LecheriaPage />} />
        <Route path="lecheria/:slug" element={<NewsDetailPage sectionPath="/lecheria" />} />
        <Route path="turismo" element={<TurismoPage />} />
        <Route path="turismo/operadores" element={<TurismoOperadoresPage />} />
        <Route path="turismo/operadores/:slug" element={<NewsDetailPage sectionPath="/turismo/operadores" />} />
        <Route path="turismo/hoteleria-gastronomia" element={<TurismoHoteleriaPage />} />
        <Route
          path="turismo/hoteleria-gastronomia/:slug"
          element={<NewsDetailPage sectionPath="/turismo/hoteleria-gastronomia" />}
        />
        <Route path="turismo/oferta" element={<TurismoOfertaPage />} />
        <Route path="turismo/oferta/:slug" element={<NewsDetailPage sectionPath="/turismo/oferta" />} />
        <Route path="turismo/:slug" element={<NewsDetailPage sectionPath="/turismo" />} />
        <Route path="nosotros" element={<NosotrosPage />} />
        <Route path="pymes" element={<PymesPage />} />
        <Route path="pymes/:slug" element={<NewsDetailPage sectionPath="/pymes" />} />
        <Route path="economia-desarrollo" element={<EconomiaPage />} />
        <Route path="economia-desarrollo/id" element={<EconomiaIDPage />} />
        <Route path="economia-desarrollo/id/:slug" element={<NewsDetailPage sectionPath="/economia-desarrollo/id" />} />
        <Route path="economia-desarrollo/marka-e" element={<MarkaELaunchPage />} />
        <Route path="economia-desarrollo/marka-e/:slug" element={<NewsDetailPage sectionPath="/economia-desarrollo/marka-e" />} />
        <Route path="economia-desarrollo/tecnologia" element={<EconomiaTecnologiaPage />} />
        <Route
          path="economia-desarrollo/tecnologia/:slug"
          element={<NewsDetailPage sectionPath="/economia-desarrollo/tecnologia" />}
        />
        <Route path="economia-desarrollo/servicios" element={<EconomiaServiciosPage />} />
        <Route
          path="economia-desarrollo/servicios/:slug"
          element={<NewsDetailPage sectionPath="/economia-desarrollo/servicios" />}
        />
        <Route path="economia-desarrollo/:slug" element={<NewsDetailPage sectionPath="/economia-desarrollo" />} />
        <Route path="contacto" element={<ContactoPage />} />
        <Route path="auth" element={<AuthPage />} />
      </Route>
      <Route path="noticias/:slug" element={<NewsDetailPage />} />
      <Route path="admin/login" element={<AdminLoginPage />} />
      <Route path="admin" element={<ProtectedRoute />}>
        <Route index element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
