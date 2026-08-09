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
  const [isGamerHudOpen, setIsGamerHudOpen] = useState(true);
  const [isTechTreeOpen, setIsTechTreeOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('home-page-active');
    return () => {
      document.body.classList.remove('home-page-active');
    };
  }, []);

  const storiesList = config.stories || [];

  const handleHexClick = (hex: any) => {
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
      
      {/* Sutz Header HUD Badge Centrado */}
      <div className="sutz-hud-center-wrapper">
        <div className="sutz-hud-badge">
          <span className="sutz-hud-icon">☁️</span>
          <div className="sutz-hud-text">
            <h1 className="sutz-hud-title">Sutz Descubre</h1>
            <p className="sutz-hud-subtitle">
              Explora nuestro universo mitológico y educativo.
            </p>
          </div>
        </div>
      </div>

      {/* Botón Volver a Inicio (Esquina Superior Derecha) */}
      <button 
        className="sutz-back-btn btn btn-glass" 
        onClick={() => navigate('/')}
        title="Volver a Inicio"
      >
        🏠 Inicio
      </button>

      {/* Panel HUD Lateral Flotante de Estrategia / Perfil de Estudiante */}
      <div className={`sutz-gamer-panel ${isGamerHudOpen ? 'expanded' : 'collapsed'}`}>
        <button 
          className="sutz-gamer-panel-toggle"
          onClick={() => setIsGamerHudOpen(!isGamerHudOpen)}
          title={isGamerHudOpen ? 'Ocultar panel de perfil' : 'Mostrar panel de perfil'}
        >
          <span className="hud-toggle-icon">{isGamerHudOpen ? '◀' : '🛡️'}</span>
          <span className="hud-toggle-label">{isGamerHudOpen ? 'PANEL' : 'PERFIL'}</span>
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
                    {(userProfile?.displayName || user?.email || 'E').charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="gamer-level-badge">LVL 5</span>
              </div>
              <div className="gamer-profile-meta">
                <h3 className="gamer-username">
                  {userProfile?.displayName || (user ? user.email?.split('@')[0] : 'Invitado Explorador')}
                </h3>
                <span className="gamer-title-rank">
                  {user ? '🛡️ Explorador K\'iche\'' : '☁️ Modo Vista Previa'}
                </span>
              </div>
            </div>

            <hr className="gamer-divider" />

            {/* Botón Árbol de Tecnología */}
            <button 
              className="tech-tree-open-btn"
              onClick={() => setIsTechTreeOpen(true)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(168, 85, 247, 0.25) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                color: '#ffffff',
                padding: '10px 14px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)',
                transition: 'all 0.25s ease'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>🌳</span> Árbol Tecnológico (30 Cols)
            </button>

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
