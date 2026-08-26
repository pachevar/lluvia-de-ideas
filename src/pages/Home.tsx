import { useEffect, useState } from 'react';
import PromoVideoSection from '../components/landing/PromoVideoSection';
import PromoTipsModal from '../components/landing/PromoTipsModal';
import LandingTopBar from '../components/landing/LandingTopBar';
import { usePortalConfig } from '../context/PortalConfigContext';

export default function Home() {
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

      {/* Top Banner Header Neon */}
      <LandingTopBar slogan="Descubre el ecosistema educativo" />

      {/* HERO SECTION */}
      <section className="landing-hero">
        <div className="landing-hero-backdrop"></div>
        <div className="landing-hero-content">
          <span 
            className="hero-pill-badge"
            onClick={() => setIsPromoModalOpen(true)}
            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            title="Haz clic para ver videos de guía y consejos"
          >
            <span>✨ Conoce más de nuestra potente herramienta</span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>🎬 Ver Consejos ➔</span>
          </span>
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

        {/* BOTÓN CONOCE MÁS DE NUESTRA POTENTE HERRAMIENTA */}
        <div className="know-more-cta-container">
          <button 
            className="know-more-btn"
            onClick={() => setIsPromoModalOpen(true)}
            title="Ver videos explicativos y consejos de la plataforma"
          >
            <span className="know-more-icon">✨</span>
            <span>Conoce más de nuestra potente herramienta</span>
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

      {/* SECCIÓN DESCRIPTIVA 1: SUTZ DESCUBRE */}
      <section id="section-sutz" className="landing-feature-section feature-sutz">
        <div className="feature-container">
          <div className="feature-card-left card-glass">
            <div 
              className="sutz-illustration-box section-img-interactive"
              style={{ 
                background: sutzSec.bgImage ? undefined : 'radial-gradient(circle at 50% 50%, #00386b 0%, #0f172a 100%)',
                borderColor: 'rgba(56, 189, 248, 0.4)' 
              }}
            >
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
