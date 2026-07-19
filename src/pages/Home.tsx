import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalConfig } from '../context/PortalConfigContext';
import type { StoryConfig, CustomHexagon } from '../types';
import { HexagonGrid } from '../components/map/HexagonGrid';
import { getCandidateHexes } from '../utils/hexUtils';


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

export default function Home() {
  const { config, loading } = usePortalConfig();
  const navigate = useNavigate();
  const [activeStory, setActiveStory] = useState<StoryConfig | null>(null);

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
  
  // Calcular tierras inexploradas
  const candidateCoords = getCandidateHexes(activeCells);
  const unexploredCells: CustomHexagon[] = candidateCoords.map(({ row, col }) => ({
    id: `unexplored-${row}-${col}`,
    row,
    col,
    title: 'Tierra Inexplorada',
    glowColor: 'rgba(255,255,255,0.2)', // Brillo sutil
    layerBg: { type: 'color', value: 'rgba(0,0,0,0.5)' }, // Negro semi-transparente
    layerDeco: { type: 'none', value: '' },
    layerInteractive: { type: 'text', value: '☁️' }, // Niebla/Nubes
    action: { type: 'none', target: '' }
  }));

  const cells = [...activeCells, ...unexploredCells];

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', background: 'transparent' }}>
        <div style={{ width: '50px', height: '50px', border: '5px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '20px', color: 'var(--primary-color)', fontWeight: 'bold' }}>Cargando Mundo Virtual...</p>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="home-map-container animate-fade-in" style={{ padding: 0 }}>
      <HexagonGrid cells={cells} onHexClick={handleHexClick} />

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
