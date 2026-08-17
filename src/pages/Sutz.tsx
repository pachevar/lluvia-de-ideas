import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalConfig } from '../context/PortalConfigContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/auth/AuthModal';
import type { StoryConfig, CustomHexagon } from '../types';
import { HexagonGrid } from '../components/map/HexagonGrid';
import { getCandidateHexes } from '../utils/hexUtils';
import { TechTreeModal } from '../components/sutz/TechTreeModal';

import camazotzTitulo from '../cuentos/Camazotz titulo.png';
import ixkikTitulo from '../cuentos/Ixkik titulo.png';
import ixmukanneTitulo from '../cuentos/Ixmukanne titulo.png';
import juracanTitulo from '../cuentos/Juracan titulo.png';
import ququmatzTitulo from '../cuentos/Ququmatz titulo.png';

const getStoryImage = (storyId: string, imageOverride?: string) => {
  if (imageOverride) return imageOverride;
  switch (storyId) {
    case 'camazotz': return camazotzTitulo;
    case 'ixkik': return ixkikTitulo;
    case 'ixmukanne': return ixmukanneTitulo;
    case 'juracan': return juracanTitulo;
    case 'ququmatz': return ququmatzTitulo;
    default: return '';
  }
};

export default function Sutz() {
  const { config, loading } = usePortalConfig();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const [activeStory, setActiveStory] = useState<StoryConfig | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGamerHudOpen, setIsGamerHudOpen] = useState(false);
  const [isTechTreeOpen, setIsTechTreeOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('home-page-active');
    return () => {
      document.body.classList.remove('home-page-active');
    };
  }, []);

  const storiesList = config.stories || [];

  const handleHexClick = (hex: CustomHexagon) => {
    if (!hex.action || hex.action.type === 'none') return;
    
    switch (hex.action.type) {
      case 'navigate':
        navigate(hex.action.target);
        break;
      case 'external':
        window.open(hex.action.target, '_blank');
        break;
      case 'modal':
        if (hex.action.target.startsWith('story-')) {
          const storyId = hex.action.target.replace('story-', '');
          const story = storiesList.find((s: StoryConfig) => s.id === storyId);
          if (story) setActiveStory(story);
        }
        break;
      default:
        break;
    }
  };

  // Generate cells for the map
  const activeCells = config.map ? [...config.map] : [];
  const candidateCoords = getCandidateHexes(activeCells);
  const unexploredCells: CustomHexagon[] = candidateCoords.map(({ row, col }) => ({
    id: `unexplored-${row}-${col}`,
    row,
    col,
    title: 'Tierra Inexplorada',
    glowColor: 'rgba(255,255,255,0.2)',
    layerBg: { type: 'color', value: 'rgba(0,0,0,0.5)' },
    layerDeco: { type: 'none', value: '' },
    layerInteractive: { type: 'text', value: '☁️' },
    action: { type: 'none', target: '' }
  }));

  const cells = [...activeCells, ...unexploredCells];
  const totalCellsCount = activeCells.length + candidateCoords.length;
  const mapCompletionPercent = totalCellsCount > 0 ? Math.round((activeCells.length / totalCellsCount) * 100) : 0;
  const studentNickname = userProfile?.displayName || (user?.email ? user.email.split('@')[0] : 'Estudiante Explorador');

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', background: 'transparent' }}>
        <div style={{ width: '50px', height: '50px', border: '5px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '20px', color: 'var(--primary-color)', fontWeight: 'bold' }}>Cargando Sutz (Mundo Virtual)...</p>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="home-map-container animate-fade-in" style={{ padding: 0, position: 'relative' }}>
      
      {/* HUD Superior de Recursos Gamer (Estilo Juego de Recursos) */}
      <div className="sutz-top-hud-bar">
        {/* Bloque 1: Avatar / Nivel / Energía Hero Box */}
        <div className="hud-hero-box">
          <div className="hud-castle-badge">
            <span className="hud-badge-icon">🏛️</span>
            <span className="hud-badge-lvl">5</span>
          </div>
          <div className="hud-hero-bars">
            <div className="hud-energy-pill">
              <span className="hud-energy-icon">⚡</span>
              <span className="hud-energy-val">120</span>
              <div className="hud-energy-bar"><div style={{ width: '80%' }}></div></div>
            </div>
            <div className="hud-hero-subtag">
              <span className="hud-sword-icon">⚔️</span> 10,127
            </div>
          </div>
        </div>

        {/* Bloque 2: Recursos Educativos y de Juego (Píldoras Flotantes) */}
        <div className="hud-resources-group">
          {/* Pergaminos / Cuentos Popol Vuh */}
          <div className="hud-resource-pill" title="Cuentos Popol Vuh Completados">
            <span className="hud-res-icon">📜</span>
            <div className="hud-res-text">
              <span className="hud-res-val">5 / 5</span>
            </div>
          </div>

          {/* Puntos de Sabiduría / Conocimiento */}
          <div className="hud-resource-pill" title="Puntos de Conocimiento Sutz">
            <span className="hud-res-icon">⚡</span>
            <div className="hud-res-text">
              <span className="hud-res-val">850</span>
              <span className="hud-res-unit">◈</span>
            </div>
          </div>

          {/* Monedas de Oro Sutz */}
          <div className="hud-resource-pill" title="Monedas de Oro Sutz">
            <span className="hud-res-icon">🪙</span>
            <div className="hud-res-text">
              <span className="hud-res-val">2.8K</span>
            </div>
          </div>

          {/* Gemas / Cristales */}
          <div className="hud-resource-pill premium" title="Gemas de Aprendizaje">
            <span className="hud-res-icon">💎</span>
            <div className="hud-res-text">
              <span className="hud-res-val">260</span>
            </div>
            <span className="hud-res-badge">NUEVO</span>
          </div>
        </div>
      </div>

      {/* Sutz Header HUD Badge (Esquina Superior Derecha) */}
      <div className="sutz-top-right-wrapper">
        <div className="sutz-hud-badge">
          <span className="sutz-hud-icon">☁️</span>
          <div className="sutz-hud-text">
            <h1 className="sutz-hud-title">Sutz Descubre</h1>
            <p className="sutz-hud-subtitle">Mundo Virtual</p>
          </div>
        </div>
      </div>

      {/* Menús Desplegables Laterales Gamer (Inician Cerrados) */}
      <div className="sutz-lateral-triggers">
        {/* Botón 1: Desplegable de Perfil del Estudiante */}
        <div className="sutz-drawer-group">
          <button 
            className={`sutz-gamer-panel-toggle ${isGamerHudOpen ? 'active' : ''}`}
            onClick={() => setIsGamerHudOpen(!isGamerHudOpen)}
            title={isGamerHudOpen ? 'Ocultar perfil del estudiante' : 'Mostrar perfil del estudiante'}
          >
            <span className="hud-toggle-icon">{isGamerHudOpen ? '◀' : '🛡️'}</span>
            <span className="hud-toggle-label">PERFIL</span>
          </button>

          {isGamerHudOpen && (
            <div className="sutz-gamer-card card-glass animate-fade-in">
              {/* Header del Perfil Gamer */}
              <div className="gamer-profile-header">
                <div className="gamer-avatar-ring">
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="Avatar" className="gamer-avatar-img" />
                  ) : (
                    <span className="gamer-avatar-fallback">
                      {studentNickname.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="gamer-level-badge">LVL 5</span>
                </div>
                <div className="gamer-profile-meta">
                  <h3 className="gamer-username">
                    {studentNickname}
                  </h3>
                  <span className="gamer-title-rank">
                    🎓 Perfil del Estudiante
                  </span>
                </div>
              </div>

              <hr className="gamer-divider" />

              {/* Barra de Experiencia */}
              <div className="gamer-stat-block">
                <div className="stat-label-row">
                  <span>Nivel de Experiencia</span>
                  <strong>1,450 / 2,000 XP</strong>
                </div>
                <div className="gamer-progress-bar">
                  <div className="gamer-progress-fill xp-fill" style={{ width: '72.5%' }}></div>
                </div>
              </div>

              {/* Porcentaje de Desarrollo del Mapa */}
              <div className="gamer-stat-block">
                <div className="stat-label-row">
                  <span>Desarrollo del Mapa</span>
                  <strong>{mapCompletionPercent}% Explorado</strong>
                </div>
                <div className="gamer-progress-bar">
                  <div className="gamer-progress-fill map-fill" style={{ width: `${mapCompletionPercent}%` }}></div>
                </div>
              </div>

              {/* Malla de Estadísticas Rápidas */}
              <div className="gamer-stats-grid">
                <div className="gamer-mini-stat">
                  <span className="mini-stat-icon">📜</span>
                  <div className="mini-stat-data">
                    <small>Cuentos</small>
                    <strong>5 / 5</strong>
                  </div>
                </div>
                <div className="gamer-mini-stat">
                  <span className="mini-stat-icon">⚡</span>
                  <div className="mini-stat-data">
                    <small>Puntos</small>
                    <strong>850 PTS</strong>
                  </div>
                </div>
              </div>

              {/* Fila de Insignias */}
              <div className="gamer-badges-section">
                <span className="gamer-section-label">Insignias Alcanzadas</span>
                <div className="gamer-badges-row">
                  <span className="gamer-badge-pill" title="Mundo Sutz">☁️ Sutz</span>
                  <span className="gamer-badge-pill" title="Popol Vuh Scholar">📜 Mitología</span>
                  <span className="gamer-badge-pill" title="Innovador STEAM">⚡ STEM</span>
                  <span className="gamer-badge-pill" title="Teoría del Color">🎨 Arte</span>
                </div>
              </div>

              {!user && (
                <button 
                  className="gamer-login-cta-btn"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  🔐 Iniciar Sesión para Guardar Progreso
                </button>
              )}
            </div>
          )}
        </div>

        {/* Botón 2: Desplegable Independiente de Árbol de Tecnología */}
        <div className="sutz-drawer-group">
          <button 
            className="sutz-gamer-panel-toggle tech-tree-trigger"
            onClick={() => setIsTechTreeOpen(true)}
            title="Abrir Árbol de Tecnología (30 Columnas)"
          >
            <span className="hud-toggle-icon">🌳</span>
            <span className="hud-toggle-label">ÁRBOL TEC</span>
          </button>
        </div>
      </div>

      {/* Mapa Hexagonal */}
      <HexagonGrid cells={cells} onHexClick={handleHexClick} />

      {/* Modal de Autenticación */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* Modal del Árbol Tecnológico */}
      <TechTreeModal 
        isOpen={isTechTreeOpen}
        onClose={() => setIsTechTreeOpen(false)}
        nodesMap={config.techTreeNodes}
      />

      {/* Story Modal (Popol Vuh) */}
      {activeStory && (
        <div className="modal-overlay" onClick={() => setActiveStory(null)} style={{ zIndex: 1000 }}>
          <div className="modal-content card-glass animate-zoom-in" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn" 
              onClick={() => setActiveStory(null)}
              aria-label="Cerrar detalles del cuento"
            >
              ✕
            </button>
            <div className="modal-grid">
              <div className="modal-left-book">
                <div className="book-3d-showcase">
                  <img src={getStoryImage(activeStory.id, activeStory.imageOverride)} alt={activeStory.title} className="modal-book-image" />
                  <div className="book-spine-showcase"></div>
                </div>
              </div>
              <div className="modal-right-info">
                <span className="modal-role-badge">✨ {activeStory.role}</span>
                <h2 className="gradient-text modal-story-title">{activeStory.title}</h2>
                <div className="modal-divider"></div>
                <p className="modal-story-summary">{activeStory.summary}</p>
                <div className="modal-actions-footer">
                  <button className="btn btn-primary" onClick={() => setActiveStory(null)}>
                    Entendido, Seguir Explorando 👍
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
