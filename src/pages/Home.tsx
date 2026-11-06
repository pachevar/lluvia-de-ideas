import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PromoVideoSection from '../components/landing/PromoVideoSection';
import PromoTipsModal from '../components/landing/PromoTipsModal';
import LandingTopBar from '../components/landing/LandingTopBar';
import { usePortalConfig } from '../context/PortalConfigContext';
import { soundEffects } from '../utils/soundEffects';
import './HomeSections.css';

export default function Home() {
  const navigate = useNavigate();
  const { config } = usePortalConfig();

  const [isPromoModalOpen, setIsPromoModalOpen] = useState(() => {
    const hasSeen = sessionStorage.getItem('hasSeenPromoModal');
    if (!hasSeen) {
      sessionStorage.setItem('hasSeenPromoModal', 'true');
      return true;
    }
    return false;
  });

  useEffect(() => {
    document.body.classList.add('home-page-active');
    return () => {
      document.body.classList.remove('home-page-active');
    };
  }, []);

  const landingConfig = config.landingConfig || {};
  const cardsConf = landingConfig.cards || {};
  const sectionsConf = landingConfig.sections || {};

  const mainCards = [
    {
      id: 'sutz',
      targetId: 'section-sutz',
      route: '/sutz',
      title: cardsConf.sutz?.title || 'Sutz Descubre',
      badge: cardsConf.sutz?.badge || 'Mundo Virtual · Comunidad Escolar',
      kicheTag: cardsConf.sutz?.kicheTag || "Nube en K'iche'",
      desc: cardsConf.sutz?.desc || 'Un mundo virtual que evoluciona con el aprendizaje interactivo de estudiantes y docentes.',
      icon: '☁️',
      colorClass: 'card-gradient-blue',
      accentColor: '#38bdf8'
    },
    {
      id: 'creatika',
      targetId: 'section-creatika',
      route: '/creatika',
      title: cardsConf.creatika?.title || 'Creatika',
      badge: cardsConf.creatika?.badge || 'Expresión & Arte',
      kicheTag: cardsConf.creatika?.kicheTag || 'Creatividad',
      desc: cardsConf.creatika?.desc || 'Suite de herramientas para el desarrollo de la creatividad y las habilidades artísticas y estéticas.',
      icon: '🎨',
      colorClass: 'card-gradient-crimson',
      accentColor: '#fb7185'
    },
    {
      id: '100tek',
      targetId: 'section-tek100',
      route: '/100tek/sistema-solar',
      title: cardsConf.tek100?.title || '100tek',
      badge: cardsConf.tek100?.badge || 'Metodología STEAM',
      kicheTag: cardsConf.tek100?.kicheTag || 'Ciencia & STEM',
      desc: cardsConf.tek100?.desc || 'Espacio para la metodología STEAM o STEM con simulaciones 3D y lógica.',
      icon: '⚡',
      colorClass: 'card-gradient-purple',
      accentColor: '#c084fc'
    },
    {
      id: 'lab',
      targetId: 'section-lab',
      route: '/laboratorios',
      title: cardsConf.lab?.title || 'LAB',
      badge: cardsConf.lab?.badge || 'Integración Educativa',
      kicheTag: cardsConf.lab?.kicheTag || 'Talleres & Materiales',
      desc: cardsConf.lab?.desc || 'Talleres y materiales originales para una perfecta integración educativa.',
      icon: '🧪',
      colorClass: 'card-gradient-orange',
      accentColor: '#fb923c'
    }
  ];

  const scrollToSection = (targetId: string) => {
    soundEffects.playClick();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavigate = (route: string) => {
    soundEffects.playClick();
    navigate(route);
  };

  // Section configs with fallbacks
  const sutzSec = sectionsConf.sutz || {};
  const creatikaSec = sectionsConf.creatika || {};
  const tek100Sec = sectionsConf.tek100 || {};
  const labSec = sectionsConf.lab || {};

  return (
    <div className="landing-page-wrapper animate-fade-in">

      {/* Top Banner Header Neon */}
      <LandingTopBar slogan="Descubre el ecosistema educativo" />

      {/* HERO SECTION */}
      <section className="landing-hero">
        <div className="landing-hero-backdrop"></div>
        <div className="landing-hero-content">
          <span 
            className="hero-pill-badge"
            onClick={() => {
              soundEffects.playClick();
              setIsPromoModalOpen(true);
            }}
            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            title="Haz clic para ver videos de guía y consejos"
          >
            <span>✨ Conoce más de nuestro potente ecosistema educativo</span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>🎬 Ver Consejos ➔</span>
          </span>
          <h1 className="hero-main-title">
            ¡Explora, aprende y crea con <span className="highlight-text">Lluvia de Ideas</span>!
          </h1>
          <p className="hero-description hero-description-prominent">
            Elige una experiencia para ingresar de inmediato o desplázate para conocer más información.
          </p>
        </div>
      </section>

      {/* LAS 4 FICHAS PRINCIPALES (CARDS CON ACCIÓN DIRECTA Y SCROLL) */}
      <section className="landing-cards-section">
        <div className="landing-cards-container">
          {mainCards.map((card) => (
            <div 
              key={card.id} 
              className={`prime-card ${card.colorClass}`}
              onMouseEnter={() => soundEffects.playHover()}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div className="prime-card-icon-container">
                  <span className="prime-card-icon">{card.icon}</span>
                  <span className="prime-card-kiche-badge">{card.kicheTag}</span>
                </div>
                <div className="prime-card-content">
                  <span className="prime-card-badge">{card.badge}</span>
                  <h3 className="prime-card-title">{card.title}</h3>
                  <p className="prime-card-desc">{card.desc}</p>
                </div>
              </div>

              <div className="prime-card-footer" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  className="btn-primary"
                  onClick={() => handleNavigate(card.route)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    background: `linear-gradient(90deg, ${card.accentColor}, #ffffff)`,
                    color: '#0b1120',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Entrar a Jugar / Explorar</span>
                  <span>🚀</span>
                </button>
                <button
                  onClick={() => scrollToSection(card.targetId)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    padding: '4px',
                    textAlign: 'center'
                  }}
                >
                  Ver detalles de la sección ▾
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* BOTÓN CONOCE MÁS DE NUESTRA POTENTE HERRAMIENTA */}
        <div className="know-more-cta-container">
          <button 
            className="know-more-btn"
            onClick={() => {
              soundEffects.playClick();
              setIsPromoModalOpen(true);
            }}
            title="Ver videos explicativos y consejos de la plataforma"
          >
            <span className="know-more-icon">✨</span>
            <span>Conoce más de nuestro potente ecosistema educativo</span>
            <span className="know-more-arrow">🎬 ➔</span>
          </button>
        </div>
      </section>

      {/* MODAL DE CONSEJOS Y VIDEOS INTERACTIVOS */}
      <PromoTipsModal 
        isOpen={isPromoModalOpen} 
        onClose={() => setIsPromoModalOpen(false)} 
        tipsList={landingConfig.promoVideos?.tipsList}
      />

      {/* MÓDULO VIDEO PROMOCIONAL (YOUTUBE SHORTS) */}
      <PromoVideoSection 
        videoId={landingConfig.promoVideos?.mainShortId}
        title={landingConfig.promoVideos?.mainTitle}
        badge={landingConfig.promoVideos?.mainBadge}
        description={landingConfig.promoVideos?.mainDescription}
      />

      {/* =========================================================================
          SECCIÓN PRINCIPAL 1: SUTZ DESCUBRE (MUNDO VIRTUAL HEXAGONAL)
          ========================================================================= */}
      <section id="section-sutz" className="hs-section hs-sutz">
        <div className="hs-container">
          {/* Showcase Visual Interactivo */}
          <div className="hs-showcase-col">
            <div
              className="hs-visual-card"
              onClick={() => handleNavigate('/sutz')}
              title="Haz clic para explorar el Mundo Virtual Sutz"
            >
              {sutzSec.bgImage && (
                <div
                  className="hs-visual-bg"
                  style={{ backgroundImage: `url("${sutzSec.bgImage}")` }}
                />
              )}
              <div className="hs-visual-overlay" />

              <div className="hs-visual-content">
                <div className="hs-visual-top">
                  <div className="hs-visual-badge">
                    <span>☁️</span>
                    <span>Mundo Virtual Sutz</span>
                  </div>
                  <span className="hs-visual-status">✦ Adaptativo</span>
                </div>

                <div className="hs-visual-center">
                  <span className="hs-visual-big-icon">☁️</span>
                  <div className="hs-visual-label-box">
                    <strong>Sutz Descubre</strong>
                    <small>Territorio Hexagonal & Biomas</small>
                  </div>
                </div>

                <div className="hs-visual-bottom">
                  <div className="hs-visual-pills">
                    <span className="hs-visual-pill-tag">🌲 Bioma Ancestral</span>
                    <span className="hs-visual-pill-tag">📜 Mitos Popol Vuh</span>
                    <span className="hs-visual-pill-tag">🗺️ 6 Reinos</span>
                  </div>
                  <div className="hs-visual-hint">
                    <span>Explorar territorio interactivo</span>
                    <span>➔</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna de Texto y Accesos Estructurados */}
          <div className="hs-content-col">
            <div className="hs-kicker-badge">
              <span className="hs-kicker-dot" />
              <span>{sutzSec.badge || 'Mundo Virtual · Ecosistema Adaptativo'}</span>
            </div>

            <div className="hs-title-row">
              <h2 className="hs-title">
                <span className="hs-title-gradient">{sutzSec.title || 'Sutz Descubre'}</span>
              </h2>
              <p className="hs-subtitle">Sutz = Nube en idioma K'iche'</p>
            </div>

            <p className="hs-body">
              {sutzSec.body || "Un mundo virtual inmersivo que evoluciona con el estudiante y su aprendizaje. A través de un mapa hexagonal interactivo, articula desafíos pedagógicos, exploración de biomas vivos y la riqueza cosmogónica del Popol Vuh al ritmo de cada aula."}
            </p>

            {/* Matriz de Características Bento */}
            <div className="hs-highlights-grid">
              <div className="hs-highlight-item">
                <div className="hs-highlight-icon-box">🗺️</div>
                <div className="hs-highlight-text">
                  <span className="hs-highlight-title">Navegación Hexagonal</span>
                  <span className="hs-highlight-desc">Descubrimiento de biomas, montañas, valles y desafíos gamificados por niveles.</span>
                </div>
              </div>

              <div className="hs-highlight-item">
                <div className="hs-highlight-icon-box">📜</div>
                <div className="hs-highlight-text">
                  <span className="hs-highlight-title">Cosmovisión y Raíces Culturales</span>
                  <span className="hs-highlight-desc">Integración viva de leyendas del Popol Vuh y saberes ancestrales con rigor curricular.</span>
                </div>
              </div>

              <div className="hs-highlight-item">
                <div className="hs-highlight-icon-box">📈</div>
                <div className="hs-highlight-text">
                  <span className="hs-highlight-title">Aprendizaje Adaptativo</span>
                  <span className="hs-highlight-desc">Rutas formativas dinámicas que responden en tiempo real al ritmo de cada alumno.</span>
                </div>
              </div>
            </div>

            {/* Hub de Accesos Directos */}
            <div className="hs-actions-hub">
              <button
                className="hs-btn-primary"
                onClick={() => handleNavigate('/sutz')}
                title="Entrar al Mundo Virtual Sutz"
              >
                <span>☁️ Entrar al Mundo Virtual Sutz</span>
                <span className="hs-btn-arrow">➔</span>
              </button>

              <div className="hs-submodules-row">
                <button
                  className="hs-submodule-pill"
                  onClick={() => handleNavigate('/libros')}
                  title="Ver Cuentos del Popol Vuh"
                >
                  <span>📖 Cuentos del Popol Vuh</span>
                  <span className="sub-arrow">➔</span>
                </button>
                <button
                  className="hs-submodule-pill"
                  onClick={() => handleNavigate('/sutz')}
                  title="Ver Mapa Hexagonal"
                >
                  <span>🗺️ Explorar Mapa Hexagonal</span>
                  <span className="sub-arrow">➔</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECCIÓN PRINCIPAL 2: CREATIKA (EXPRESIÓN, ARTE & NARRATIVA)
          ========================================================================= */}
      <section id="section-creatika" className="hs-section hs-creatika">
        <div className="hs-container reversed">
          {/* Showcase Visual Interactivo */}
          <div className="hs-showcase-col">
            <div
              className="hs-visual-card"
              onClick={() => handleNavigate('/creatika')}
              title="Haz clic para entrar a la Suite Creatika"
            >
              {creatikaSec.bgImage && (
                <div
                  className="hs-visual-bg"
                  style={{ backgroundImage: `url("${creatikaSec.bgImage}")` }}
                />
              )}
              <div className="hs-visual-overlay" />

              <div className="hs-visual-content">
                <div className="hs-visual-top">
                  <div className="hs-visual-badge">
                    <span>🎨</span>
                    <span>Suite Creatika</span>
                  </div>
                  <span className="hs-visual-status" style={{ color: '#fb7185', background: 'rgba(251, 113, 133, 0.15)' }}>✦ Creatividad</span>
                </div>

                <div className="hs-visual-center">
                  <span className="hs-visual-big-icon">🎨</span>
                  <div className="hs-visual-label-box">
                    <strong>Estudio Creativo</strong>
                    <small>Arte, Narrativa & Personajes</small>
                  </div>
                </div>

                <div className="hs-visual-bottom">
                  <div className="hs-visual-pills">
                    <span className="hs-visual-pill-tag">🎭 12 Arquetipos</span>
                    <span className="hs-visual-pill-tag">🎰 Viaje del Héroe</span>
                    <span className="hs-visual-pill-tag">🎨 Cromática</span>
                  </div>
                  <div className="hs-visual-hint">
                    <span>Ingresar a la suite creativa</span>
                    <span>➔</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna de Texto y Accesos Estructurados */}
          <div className="hs-content-col">
            <div className="hs-kicker-badge">
              <span className="hs-kicker-dot" />
              <span>{creatikaSec.badge || 'Suite Creativa & Narrativa'}</span>
            </div>

            <div className="hs-title-row">
              <h2 className="hs-title">
                <span className="hs-title-gradient">{creatikaSec.title || 'Creatika'}</span>
              </h2>
              <p className="hs-subtitle">Expresión, Arte & Pensamiento Divergente</p>
            </div>

            <p className="hs-body">
              {creatikaSec.body || 'Laboratorio integral de herramientas para el desarrollo del pensamiento creativo, la sensibilidad plástica y la narrativa literaria. Estimula la composición cromática, la estructura dramática de historias y el modelado dimensional de personajes.'}
            </p>

            {/* Matriz de Características Bento */}
            <div className="hs-highlights-grid">
              <div className="hs-highlight-item">
                <div className="hs-highlight-icon-box">🎭</div>
                <div className="hs-highlight-text">
                  <span className="hs-highlight-title">Creación de Personajes</span>
                  <span className="hs-highlight-desc">Taller guiado por neurodiseño en 4 etapas: arquetipos, heridas, biografías y dimensiones.</span>
                </div>
              </div>

              <div className="hs-highlight-item">
                <div className="hs-highlight-icon-box">🎰</div>
                <div className="hs-highlight-text">
                  <span className="hs-highlight-title">Máquina de Cuentos</span>
                  <span className="hs-highlight-desc">Generador interactivo de tramas dramáticas estructuradas bajo el Viaje del Héroe.</span>
                </div>
              </div>

              <div className="hs-highlight-item">
                <div className="hs-highlight-icon-box">🎨</div>
                <div className="hs-highlight-text">
                  <span className="hs-highlight-title">Teoría del Color</span>
                  <span className="hs-highlight-desc">Explorador de armonías visuales, temperaturas cromáticas y sensibilidad estética.</span>
                </div>
              </div>
            </div>

            {/* Hub de Accesos Directos */}
            <div className="hs-actions-hub">
              <button
                className="hs-btn-primary"
                onClick={() => handleNavigate('/creatika')}
                title="Abrir la Suite Creatika"
              >
                <span>✨ Abrir Suite Creatika</span>
                <span className="hs-btn-arrow">➔</span>
              </button>

              <div className="hs-submodules-row">
                <button
                  className="hs-submodule-pill"
                  onClick={() => handleNavigate('/creatika/personajes')}
                  title="Abrir Laboratorio de Creación de Personajes"
                >
                  <span>🎭 Creación de Personajes</span>
                  <span className="sub-arrow">➔</span>
                </button>
                <button
                  className="hs-submodule-pill"
                  onClick={() => handleNavigate('/creatika/maquina-de-cuentos')}
                  title="Abrir Máquina de Cuentos"
                >
                  <span>🎰 Máquina de Cuentos</span>
                  <span className="sub-arrow">➔</span>
                </button>
                <button
                  className="hs-submodule-pill"
                  onClick={() => handleNavigate('/creatika/teoria-del-color')}
                  title="Abrir Laboratorio de Teoría del Color"
                >
                  <span>🎨 Teoría del Color</span>
                  <span className="sub-arrow">➔</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECCIÓN PRINCIPAL 3: 100TEK (CIENCIA, LÓGICA & METODOLOGÍA STEAM)
          ========================================================================= */}
      <section id="section-tek100" className="hs-section hs-100tek">
        <div className="hs-container">
          {/* Showcase Visual Interactivo */}
          <div className="hs-showcase-col">
            <div
              className="hs-visual-card"
              onClick={() => handleNavigate('/100tek/sistema-solar')}
              title="Haz clic para explorar el Sistema Solar 3D"
            >
              {tek100Sec.bgImage && (
                <div
                  className="hs-visual-bg"
                  style={{ backgroundImage: `url("${tek100Sec.bgImage}")` }}
                />
              )}
              <div className="hs-visual-overlay" />

              <div className="hs-visual-content">
                <div className="hs-visual-top">
                  <div className="hs-visual-badge">
                    <span>⚡</span>
                    <span>100TEK · STEAM</span>
                  </div>
                  <span className="hs-visual-status" style={{ color: '#c084fc', background: 'rgba(192, 132, 252, 0.15)' }}>✦ Ciencia 3D</span>
                </div>

                <div className="hs-visual-center">
                  <span className="hs-visual-big-icon">⚡</span>
                  <div className="hs-visual-label-box">
                    <strong>Laboratorio STEAM</strong>
                    <small>Simulación Espacial & Anatomía</small>
                  </div>
                </div>

                <div className="hs-visual-bottom">
                  <div className="hs-visual-pills">
                    <span className="hs-visual-pill-tag">🫀 +3,400 Estructuras</span>
                    <span className="hs-visual-pill-tag">🪐 Órbitas 3D</span>
                    <span className="hs-visual-pill-tag">🔢 Lógica Numérica</span>
                  </div>
                  <div className="hs-visual-hint">
                    <span>Explorar simulaciones 3D</span>
                    <span>➔</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna de Texto y Accesos Estructurados */}
          <div className="hs-content-col">
            <div className="hs-kicker-badge">
              <span className="hs-kicker-dot" />
              <span>{tek100Sec.badge || 'Ciencia, Lógica & Metodología STEAM'}</span>
            </div>

            <div className="hs-title-row">
              <h2 className="hs-title">
                <span className="hs-title-gradient">{tek100Sec.title || '100TEK'}</span>
              </h2>
              <p className="hs-subtitle">Rigor Deductivo & Curiosidad Científica</p>
            </div>

            <p className="hs-body">
              {tek100Sec.body || 'Entorno interactivo para la exploración viva de conceptos astronómicos, anatómicos y físico-matemáticos. Diseñado para transformar ideas abstractas en simulaciones tridimensionales de alta fidelidad, cultivando el pensamiento analítico y la curiosidad por el cosmos.'}
            </p>

            {/* Matriz de Características Bento */}
            <div className="hs-highlights-grid">
              <div className="hs-highlight-item">
                <div className="hs-highlight-icon-box">🫀</div>
                <div className="hs-highlight-text">
                  <span className="hs-highlight-title">Cuerpo Humano Virtual 3D</span>
                  <span className="hs-highlight-desc">Atlas anatómico en español con más de 3,400 órganos, capas diseccionables y despiece.</span>
                </div>
              </div>

              <div className="hs-highlight-item">
                <div className="hs-highlight-icon-box">🪐</div>
                <div className="hs-highlight-text">
                  <span className="hs-highlight-title">Sistema Solar Interactivo</span>
                  <span className="hs-highlight-desc">Simulador orbital 3D con velocidades reales, atmósferas y datos astronómicos precisos.</span>
                </div>
              </div>

              <div className="hs-highlight-item">
                <div className="hs-highlight-icon-box">🔢</div>
                <div className="hs-highlight-text">
                  <span className="hs-highlight-title">Razonamiento & Secuencias</span>
                  <span className="hs-highlight-desc">Desafíos lógicos y cálculo de patrones para fortalecer el pensamiento matemático abstracto.</span>
                </div>
              </div>
            </div>

            {/* Hub de Accesos Directos */}
            <div className="hs-actions-hub">
              <button
                className="hs-btn-primary"
                onClick={() => handleNavigate('/atlas')}
                title="Explorar el Cuerpo Humano Virtual 3D"
              >
                <span>🫀 Explorar Cuerpo Humano 3D</span>
                <span className="hs-btn-arrow">➔</span>
              </button>

              <div className="hs-submodules-row">
                <button
                  className="hs-submodule-pill"
                  onClick={() => handleNavigate('/100tek/sistema-solar')}
                  title="Abrir Simulador del Sistema Solar 3D"
                >
                  <span>🪐 Sistema Solar 3D</span>
                  <span className="sub-arrow">➔</span>
                </button>
                <button
                  className="hs-submodule-pill"
                  onClick={() => handleNavigate('/100tek/secuencias-numericas')}
                  title="Abrir Retos de Secuencias Numéricas"
                >
                  <span>🔢 Secuencias Numéricas</span>
                  <span className="sub-arrow">➔</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECCIÓN PRINCIPAL 4: LAB (INTEGRACIÓN DOCENTE & PEDAGÓGICA)
          ========================================================================= */}
      <section id="section-lab" className="hs-section hs-lab">
        <div className="hs-container reversed">
          {/* Showcase Visual Interactivo */}
          <div className="hs-showcase-col">
            <div
              className="hs-visual-card"
              onClick={() => handleNavigate('/laboratorios')}
              title="Haz clic para ver los Laboratorios Docentes"
            >
              {labSec.bgImage && (
                <div
                  className="hs-visual-bg"
                  style={{ backgroundImage: `url("${labSec.bgImage}")` }}
                />
              )}
              <div className="hs-visual-overlay" />

              <div className="hs-visual-content">
                <div className="hs-visual-top">
                  <div className="hs-visual-badge">
                    <span>🧪</span>
                    <span>LAB Formativo</span>
                  </div>
                  <span className="hs-visual-status" style={{ color: '#fb923c', background: 'rgba(251, 146, 60, 0.15)' }}>✦ Pedagogía</span>
                </div>

                <div className="hs-visual-center">
                  <span className="hs-visual-big-icon">🧪</span>
                  <div className="hs-visual-label-box">
                    <strong>Centro Pedagógico</strong>
                    <small>Talleres Docentes & Gamificación</small>
                  </div>
                </div>

                <div className="hs-visual-bottom">
                  <div className="hs-visual-pills">
                    <span className="hs-visual-pill-tag">🧪 Talleres Prácticos</span>
                    <span className="hs-visual-pill-tag">🎲 Bingotenango</span>
                    <span className="hs-visual-pill-tag">🧠 Neuroaprendizaje</span>
                  </div>
                  <div className="hs-visual-hint">
                    <span>Explorar recursos para docentes</span>
                    <span>➔</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna de Texto y Accesos Estructurados */}
          <div className="hs-content-col">
            <div className="hs-kicker-badge">
              <span className="hs-kicker-dot" />
              <span>{labSec.badge || 'Integración Docente & Pedagógica'}</span>
            </div>

            <div className="hs-title-row">
              <h2 className="hs-title">
                <span className="hs-title-gradient">{labSec.title || 'LAB Formativo'}</span>
              </h2>
              <p className="hs-subtitle">Metodologías Activas & Dinámicas de Aula</p>
            </div>

            <p className="hs-body">
              {labSec.body || 'Ecosistema de capacitación y recursos didácticos originales diseñados para fortalecer la labor del maestro contemporáneo. Combina talleres metodológicos, rúbricas de evaluación activa y dinámicas lúdicas de refuerzo escolar aplicadas al aula.'}
            </p>

            {/* Matriz de Características Bento */}
            <div className="hs-highlights-grid">
              <div className="hs-highlight-item">
                <div className="hs-highlight-icon-box">🧪</div>
                <div className="hs-highlight-text">
                  <span className="hs-highlight-title">Talleres y Guías Docentes</span>
                  <span className="hs-highlight-desc">Propuestas metodológicas transversales, recursos descargables y rúbricas pedagógicas.</span>
                </div>
              </div>

              <div className="hs-highlight-item">
                <div className="hs-highlight-icon-box">🎲</div>
                <div className="hs-highlight-text">
                  <span className="hs-highlight-title">Bingotenango Gamificado</span>
                  <span className="hs-highlight-desc">Dinámica lúdica digital para el repaso interactivo y competitivo de saberes en comunidad.</span>
                </div>
              </div>

              <div className="hs-highlight-item">
                <div className="hs-highlight-icon-box">🧠</div>
                <div className="hs-highlight-text">
                  <span className="hs-highlight-title">Neurociencia en el Aula</span>
                  <span className="hs-highlight-desc">Pautas neurocognitivas para optimizar la atención, memoria y gestión emocional escolar.</span>
                </div>
              </div>
            </div>

            {/* Hub de Accesos Directos */}
            <div className="hs-actions-hub">
              <button
                className="hs-btn-primary"
                onClick={() => handleNavigate('/laboratorios')}
                title="Conocer los Laboratorios y Talleres"
              >
                <span>🧪 Ver Laboratorios y Talleres</span>
                <span className="hs-btn-arrow">➔</span>
              </button>

              <div className="hs-submodules-row">
                <button
                  className="hs-submodule-pill"
                  onClick={() => handleNavigate('/juegos/bingo')}
                  title="Abrir Bingotenango"
                >
                  <span>🎲 Jugar Bingotenango</span>
                  <span className="sub-arrow">➔</span>
                </button>
                <button
                  className="hs-submodule-pill"
                  onClick={() => handleNavigate('/neurociencia')}
                  title="Ver Guía de Neurociencia Educativa"
                >
                  <span>🧠 Neurociencia Aula</span>
                  <span className="sub-arrow">➔</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
