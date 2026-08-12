import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoEditorial from '../assets/logo editorial.png';
import { usePortalConfig } from '../context/PortalConfigContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/auth/AuthModal';

export default function Home() {
  const { config } = usePortalConfig();
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
      title: cardsConf.sutz?.title || 'Sutz Descubre',
      badge: cardsConf.sutz?.badge || 'Mundo Virtual',
      kicheTag: cardsConf.sutz?.kicheTag || "Nube en K'iche'",
      desc: cardsConf.sutz?.desc || 'Un mundo virtual que evoluciona con el estudiante y su aprendizaje.',
      icon: '☁️',
      colorClass: 'card-gradient-blue'
    },
    {
      id: 'creatika',
      targetId: 'section-creatika',
      title: cardsConf.creatika?.title || 'Creatika',
      badge: cardsConf.creatika?.badge || 'Expresión & Arte',
      kicheTag: cardsConf.creatika?.kicheTag || 'Creatividad',
      desc: cardsConf.creatika?.desc || 'Suite de herramientas para el desarrollo de la creatividad y las habilidades artísticas y estéticas.',
      icon: '🎨',
      colorClass: 'card-gradient-crimson'
    },
    {
      id: '100tek',
      targetId: 'section-tek100',
      title: cardsConf.tek100?.title || '100tek',
      badge: cardsConf.tek100?.badge || 'Metodología STEAM',
      kicheTag: cardsConf.tek100?.kicheTag || 'Ciencia & STEM',
      desc: cardsConf.tek100?.desc || 'Espacio para la metodología STEAM o STEM.',
      icon: '⚡',
      colorClass: 'card-gradient-purple'
    },
    {
      id: 'lab',
      targetId: 'section-lab',
      title: cardsConf.lab?.title || 'LAB',
      badge: cardsConf.lab?.badge || 'Integración Educativa',
      kicheTag: cardsConf.lab?.kicheTag || 'Talleres & Materiales',
      desc: cardsConf.lab?.desc || 'Talleres y materiales originales para una perfecta integración educativa.',
      icon: '🧪',
      colorClass: 'card-gradient-orange'
    }
  ];

  const scrollToSection = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Section configs with fallbacks
  const sutzSec = sectionsConf.sutz || {};
  const creatikaSec = sectionsConf.creatika || {};
  const tek100Sec = sectionsConf.tek100 || {};
  const labSec = sectionsConf.lab || {};

  return (
    <div className="landing-page-wrapper animate-fade-in">
      
      {/* Top Banner Header (Estilo Prime) */}
      <header className="landing-top-bar">
        <div className="landing-top-bar-content">
          <div className="landing-brand">
            <img src={logoEditorial} alt="Editorial Lluvia de Ideas" className="landing-logo" />
            <span className="landing-brand-name">Editorial Lluvia de Ideas</span>
          </div>
          <div className="landing-top-links">
            <span className="landing-top-slogan">Descubre el ecosistema educativo</span>
            <div className="landing-top-actions">
              <button 
                className="top-btn top-btn-sutz" 
                onClick={() => navigate('/sutz')}
                title="Explorar el mundo virtual Sutz"
              >
                <span className="top-btn-icon">☁️</span>
                <span className="btn-text-full">Probar Sutz</span>
                <span className="btn-text-short">Sutz</span>
              </button>

              <button 
                className="top-btn top-btn-neuro" 
                onClick={() => navigate('/neurociencia')}
                title="Neurociencia Educativa aplicada al Aula: Guía Práctica por Etapas de Desarrollo"
              >
                <span className="top-btn-icon">🧠</span>
                <span className="btn-text-full">Neurociencia Aula</span>
                <span className="btn-text-short">🧠 Neuro</span>
              </button>

              {user ? (
                <div className="top-user-menu">
                  <button 
                    className="top-btn top-btn-user"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <span className="top-user-avatar">
                      {userProfile?.photoURL ? (
                        <img src={userProfile.photoURL} alt="Avatar" />
                      ) : (
                        (userProfile?.displayName || user.email || 'U').charAt(0).toUpperCase()
                      )}
                    </span>
                    <span className="top-user-name">
                      {userProfile?.displayName || user.email?.split('@')[0] || 'Mi Cuenta'}
                    </span>
                    <span className="top-user-caret">▾</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="top-user-dropdown card-glass animate-fade-in">
                      <div className="dropdown-user-info">
                        <strong>{userProfile?.displayName || 'Usuario'}</strong>
                        <p>{user.email}</p>
                        <span className="user-role-badge">
                          {userProfile?.role === 'teacher' ? '🍎 Docente' : '🎓 Estudiante'}
                        </span>
                      </div>
                      <hr className="dropdown-divider" />
                      <button 
                        className="dropdown-item danger" 
                        onClick={() => { 
                          logout(); 
                          setIsUserMenuOpen(false); 
                        }}
                      >
                        🚪 Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  className="top-btn top-btn-login" 
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  <span className="top-btn-icon">👤</span>
                  <span className="btn-text-full">Iniciar Sesión</span>
                  <span className="btn-text-short">Entrar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modal de Autenticación */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* HERO SECTION */}
      <section className="landing-hero">
        <div className="landing-hero-backdrop"></div>
        <div className="landing-hero-content">
          <span className="hero-pill-badge">✨ Bienvenido a un universo de herramientas educativas</span>
          <h1 className="hero-main-title">
            ¡Explora, aprende y crea con <span className="highlight-text">Lluvia de Ideas</span>!
          </h1>
          <p className="hero-description hero-description-prominent">
            Haz clic en cualquiera de las fichas para ver más información.
          </p>
        </div>
      </section>

      {/* LAS 4 FICHAS PRINCIPALES (CARDS CON NAVEGACIÓN ACTIVA) */}
      <section className="landing-cards-section">
        <div className="landing-cards-container">
          {mainCards.map((card) => (
            <div 
              key={card.id} 
              className={`prime-card ${card.colorClass}`}
              onClick={() => scrollToSection(card.targetId)}
              style={{ cursor: 'pointer' }}
              title={`Ver sección ${card.title}`}
            >
              <div className="prime-card-icon-container">
                <span className="prime-card-icon">{card.icon}</span>
                <span className="prime-card-kiche-badge">{card.kicheTag}</span>
              </div>
              <div className="prime-card-content">
                <span className="prime-card-badge">{card.badge}</span>
                <h3 className="prime-card-title">{card.title}</h3>
                <p className="prime-card-desc">{card.desc}</p>
                <div className="prime-card-footer">
                  <span className="prime-card-cta">Ver información ➔</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN DESCRIPTIVA 1: SUTZ DESCUBRE */}
      <section id="section-sutz" className="landing-feature-section feature-sutz">
        <div className="feature-container">
          <div className="feature-card-left card-glass">
            <div className="sutz-illustration-box section-img-interactive">
              {sutzSec.bgImage && (
                <div 
                  className="section-img-bg" 
                  style={{ backgroundImage: `url("${sutzSec.bgImage}")` }}
                />
              )}
              {sutzSec.bgImage && <div className="section-img-overlay"></div>}

              <div className="section-box-content">
                <div className="cloud-glow-effect">☁️</div>
                <div className="sutz-badge-floating">
                  <span>Idioma K'iche'</span>
                  <strong>SUTZ = NUBE</strong>
                </div>
                <div className="hex-map-preview">
                  <div className="hex-mini hex-1">🌲</div>
                  <div className="hex-mini hex-2">📚</div>
                  <div className="hex-mini hex-3">🌋</div>
                  <div className="hex-mini hex-4">✨</div>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-info-right">
            <span className="feature-tag">{sutzSec.badge || 'MUNDO VIRTUAL'}</span>
            <h2 className="feature-title">
              <span className="gradient-text-blue">{sutzSec.title || 'Sutz Descubre'}</span>
            </h2>
            <p className="feature-body">
              {sutzSec.body || "Un mundo virtual que evoluciona con el estudiante y su aprendizaje. En idioma K'iche', Sutz significa Nube. Es un mapa hexagonal interactivo diseñado para adaptar el conocimiento, las leyendas culturales y las lecciones didácticas al ritmo de cada alumno."}
            </p>
            <ul className="feature-bullets">
              {(sutzSec.bullets && sutzSec.bullets.length > 0 ? sutzSec.bullets : [
                'Aprendizaje Evolutivo: Adaptación constante según el avance del estudiante.',
                'Navegación Hexagonal: Descubrimiento de biomas, montañas, bosques y desafíos.',
                'Raíces Culturales: Integración de la mitología del Popol Vuh y saberes ancestrales.'
              ]).map((bullet, idx) => (
                <li key={idx}>🔹 {bullet}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SECCIÓN DESCRIPTIVA 2: CREATIKA */}
      <section id="section-creatika" className="landing-feature-section feature-creatika" style={{ background: '#0b1120' }}>
        <div className="feature-container">
          <div className="feature-card-left card-glass">
            <div 
              className="sutz-illustration-box section-img-interactive" 
              style={{ 
                background: creatikaSec.bgImage ? undefined : 'radial-gradient(circle at 50% 50%, #881337 0%, #0f172a 100%)',
                borderColor: 'rgba(251, 113, 133, 0.4)' 
              }}
            >
              {creatikaSec.bgImage && (
                <div 
                  className="section-img-bg" 
                  style={{ backgroundImage: `url("${creatikaSec.bgImage}")` }}
                />
              )}
              {creatikaSec.bgImage && <div className="section-img-overlay"></div>}

              <div className="section-box-content">
                <div className="cloud-glow-effect">🎨</div>
                <div className="sutz-badge-floating" style={{ borderColor: 'rgba(251, 113, 133, 0.4)' }}>
                  <span style={{ color: '#fb7185' }}>Herramientas Creativas</span>
                  <strong>Arte & Narrativa</strong>
                </div>
                <div className="hex-map-preview">
                  <div className="hex-mini hex-1">🎨</div>
                  <div className="hex-mini hex-2">🎰</div>
                  <div className="hex-mini hex-3">🖌️</div>
                  <div className="hex-mini hex-4">🎭</div>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-info-right">
            <span className="feature-tag" style={{ color: '#fb7185' }}>{creatikaSec.badge || 'EXPRESIÓN & ARTE'}</span>
            <h2 className="feature-title">
              <span className="gradient-text-crimson" style={{ background: 'linear-gradient(90deg, #fb7185, #e11d48)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {creatikaSec.title || 'Creatika'}
              </span>
            </h2>
            <p className="feature-body">
              {creatikaSec.body || 'Suite de herramientas para el desarrollo de la creatividad y las habilidades artísticas y estéticas. Estimula el pensamiento divergente, la composición cromática y la creación literaria interactiva.'}
            </p>
            <ul className="feature-bullets">
              {(creatikaSec.bullets && creatikaSec.bullets.length > 0 ? creatikaSec.bullets : [
                'Código del Estudiante: Manifiesto de autonomía, criterio ético y pensamiento crítico.',
                'Código Docente: Marco interactivo de competencias para el maestro contemporáneo.',
                'Teoría del Color: Explorador interactivo de armonías visuales y sensibilidad estética.',
                'Máquina de Cuentos: Generador creativo para la escritura de narrativas originales.'
              ]).map((bullet, idx) => (
                <li key={idx}>🎨 {bullet}</li>
              ))}
            </ul>

            <div className="creatika-submodules-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
              <button 
                className="btn btn-glass"
                onClick={() => navigate('/creatika/codigo-estudiante')}
                style={{ borderColor: 'rgba(56, 189, 248, 0.5)', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700 }}
              >
                🎓 Código del Estudiante ↗
              </button>
              <button 
                className="btn btn-glass"
                onClick={() => navigate('/creatika/codigo-docente')}
                style={{ borderColor: 'rgba(251, 113, 133, 0.5)', color: '#fb7185', fontSize: '0.85rem', fontWeight: 700 }}
              >
                📜 Código Docente ↗
              </button>
              <button 
                className="btn btn-glass"
                onClick={() => navigate('/creatika/maquina-de-cuentos')}
                style={{ fontSize: '0.85rem', fontWeight: 700 }}
              >
                🎰 Máquina de Cuentos ↗
              </button>
              <button 
                className="btn btn-glass"
                onClick={() => navigate('/creatika/teoria-del-color')}
                style={{ fontSize: '0.85rem', fontWeight: 700 }}
              >
                🎨 Teoría del Color ↗
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DESCRIPTIVA 3: 100TEK */}
      <section id="section-tek100" className="landing-feature-section feature-100tek">
        <div className="feature-container">
          <div className="feature-card-left card-glass">
            <div 
              className="sutz-illustration-box section-img-interactive" 
              style={{ 
                background: tek100Sec.bgImage ? undefined : 'radial-gradient(circle at 50% 50%, #581c87 0%, #0f172a 100%)',
                borderColor: 'rgba(192, 132, 252, 0.4)' 
              }}
            >
              {tek100Sec.bgImage && (
                <div 
                  className="section-img-bg" 
                  style={{ backgroundImage: `url("${tek100Sec.bgImage}")` }}
                />
              )}
              {tek100Sec.bgImage && <div className="section-img-overlay"></div>}

              <div className="section-box-content">
                <div className="cloud-glow-effect">⚡</div>
                <div className="sutz-badge-floating" style={{ borderColor: 'rgba(192, 132, 252, 0.4)' }}>
                  <span style={{ color: '#c084fc' }}>Innovación STEM</span>
                  <strong>Ciencia & Lógica</strong>
                </div>
                <div className="hex-map-preview">
                  <div className="hex-mini hex-1">🪐</div>
                  <div className="hex-mini hex-2">🔢</div>
                  <div className="hex-mini hex-3">⚡</div>
                  <div className="hex-mini hex-4">🔬</div>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-info-right">
            <span className="feature-tag" style={{ color: '#c084fc' }}>{tek100Sec.badge || 'METODOLOGÍA STEAM / STEM'}</span>
            <h2 className="feature-title">
              <span className="gradient-text-purple" style={{ background: 'linear-gradient(90deg, #c084fc, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {tek100Sec.title || '100tek'}
              </span>
            </h2>
            <p className="feature-body">
              {tek100Sec.body || 'Espacio para la metodología STEAM o STEM (Science, Technology, Engineering, Arts, Mathematics). Integra simulaciones astronómicas, secuencias lógicas y pensamiento computacional.'}
            </p>
            <ul className="feature-bullets">
              {(tek100Sec.bullets && tek100Sec.bullets.length > 0 ? tek100Sec.bullets : [
                'Sistema Solar 3D: Simulación del espacio para la comprensión de fenómenos astronómicos.',
                'Secuencias Numéricas: Desafíos para fortalecer el razonamiento matemático abstracto.',
                'Pensamiento Científico: Enfoque interdisciplinario centrado en la investigación.'
              ]).map((bullet, idx) => (
                <li key={idx}>⚡ {bullet}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SECCIÓN DESCRIPTIVA 4: LAB */}
      <section id="section-lab" className="landing-feature-section feature-lab" style={{ background: '#0b1120' }}>
        <div className="feature-container reverse">
          <div className="feature-info-right">
            <span className="feature-tag" style={{ color: '#fb923c' }}>{labSec.badge || 'INTEGRACIÓN EDUCATIVA'}</span>
            <h2 className="feature-title">
              <span className="gradient-text-orange">{labSec.title || 'LAB'}</span>
            </h2>
            <p className="feature-body">
              {labSec.body || 'Talleres y materiales originales para una perfecta integración educativa. Recursos diseñados para facilitar la labor docente y enriquecer las dinámicas en el aula.'}
            </p>
            <ul className="feature-bullets">
              {(labSec.bullets && labSec.bullets.length > 0 ? labSec.bullets : [
                'Materiales Didácticos: Recursos pedagógicos alineados a las competencias clave.',
                'Animación Educativa: Laboratorios audiovisuales que potencian la comprensión.',
                'Talleres Integrales: Guías metodológicas para docentes y estudiantes.'
              ]).map((bullet, idx) => (
                <li key={idx}>🧪 {bullet}</li>
              ))}
            </ul>
          </div>

          <div className="feature-card-left card-glass">
            <div 
              className="sutz-illustration-box section-img-interactive" 
              style={{ 
                background: labSec.bgImage ? undefined : 'radial-gradient(circle at 50% 50%, #7c2d12 0%, #0f172a 100%)',
                borderColor: 'rgba(251, 146, 60, 0.4)' 
              }}
            >
              {labSec.bgImage && (
                <div 
                  className="section-img-bg" 
                  style={{ backgroundImage: `url("${labSec.bgImage}")` }}
                />
              )}
              {labSec.bgImage && <div className="section-img-overlay"></div>}

              <div className="section-box-content">
                <div className="cloud-glow-effect">🧪</div>
                <div className="sutz-badge-floating" style={{ borderColor: 'rgba(251, 146, 60, 0.4)' }}>
                  <span style={{ color: '#fb923c' }}>Laboratorio Docente</span>
                  <strong>Talleres & Materiales</strong>
                </div>
                <div className="hex-map-preview">
                  <div className="hex-mini hex-1">🧪</div>
                  <div className="hex-mini hex-2">📖</div>
                  <div className="hex-mini hex-3">🎬</div>
                  <div className="hex-mini hex-4">💡</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
