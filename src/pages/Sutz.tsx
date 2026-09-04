import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalConfig } from '../context/PortalConfigContext';
import { useAuth } from '../context/AuthContext';
import { useSutzResources } from '../context/SutzResourcesContext';
import { formatSutzResource } from '../data/sutzResources';
import { AuthModal } from '../components/auth/AuthModal';
import type { StoryConfig, CustomHexagon } from '../types';
import { HexagonGrid } from '../components/map/HexagonGrid';
import { getCandidateHexes } from '../utils/hexUtils';
import { TechTreeModal } from '../components/sutz/TechTreeModal';
import { sutzAudio } from '../utils/sutzSoundEffects';
import './Sutz.css';

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
    default: return camazotzTitulo;
  }
};

// Reliquias Ancestrales Mayas para la Mochila del Estudiante
interface MayanRelic {
  id: string;
  name: string;
  icon: string;
  category: string;
  rarity: 'Común' | 'Rara' | 'Épica' | 'Legendaria';
  desc: string;
  bonus: string;
  unlockedStoryId?: string;
  unlockedLevel?: number;
}

const MAYAN_RELICS: MayanRelic[] = [
  {
    id: 'relic_jade_sun',
    name: 'Disco Solar de Jade',
    icon: '☀️',
    category: 'Cosmología',
    rarity: 'Legendaria',
    desc: 'Esculpido por los primeros astrónomos mayas. Canaliza la luz primordial de Kinich Ahau.',
    bonus: '+15% velocidad de acumulación de Sabiduría',
    unlockedStoryId: 'ququmatz'
  },
  {
    id: 'relic_quetzal_feather',
    name: 'Pluma del Quetzal Celeste',
    icon: '🪶',
    category: 'Naturaleza',
    rarity: 'Épica',
    desc: 'Símbolo del dios del viento y la creación. Inspira ideas avanzadas en el Árbol Tecnológico.',
    bonus: 'Desbloquea rutas secretas en el Códice',
    unlockedStoryId: 'juracan'
  },
  {
    id: 'relic_golden_cacao',
    name: 'Semilla Sagrada de Cacao',
    icon: '🍫',
    category: 'Economía Ancestral',
    rarity: 'Rara',
    desc: 'El grano divino de intercambio. Aumenta la generosidad y el flujo de oro en las misiones.',
    bonus: '+50 monedas en cada misión completada',
    unlockedLevel: 2
  },
  {
    id: 'relic_obsidian_mirror',
    name: 'Espejo de Obsidiana Ahumada',
    icon: '🪞',
    category: 'Misticismo',
    rarity: 'Épica',
    desc: 'Refleja la verdad oculta tras el velo terrenal. Disipa la niebla del mapa con mayor rapidez.',
    bonus: 'Revela hexágonos inexplorados a su alrededor',
    unlockedStoryId: 'camazotz'
  },
  {
    id: 'relic_holy_corn',
    name: 'Mazorca Primordial de Maíz',
    icon: '🌽',
    category: 'Origen Humano',
    rarity: 'Legendaria',
    desc: 'El elemento fundacional con el que los Dioses Creadores formaron la carne de la humanidad.',
    bonus: '+100 XP instantáneo al sincronizar progreso',
    unlockedStoryId: 'ixmukanne'
  },
  {
    id: 'relic_thunder_scepter',
    name: 'Cetro del Trueno de Juracán',
    icon: '⚡',
    category: 'Fuerza Elemental',
    rarity: 'Épica',
    desc: 'Artefacto cargado con la fuerza de tres tormentas. Despierta el vigor mental del estudiante.',
    bonus: 'Regeneración continua de Energía',
    unlockedStoryId: 'juracan'
  },
  {
    id: 'relic_xibalba_crystal',
    name: 'Cristal de Ixkik',
    icon: '💎',
    category: 'Linaje Heroico',
    rarity: 'Rara',
    desc: 'Gema que atestigua la victoria de la vida sobre la oscuridad subterránea de Xibalbá.',
    bonus: '+5 gemas al completar cuentos',
    unlockedStoryId: 'ixkik'
  },
  {
    id: 'relic_zero_tablet',
    name: 'Tablilla del Cero Maya',
    icon: '🐚',
    category: 'Matemáticas Mayas',
    rarity: 'Legendaria',
    desc: 'El descubrimiento del concepto de la nada y el infinito. La cúspide de la ciencia mesoamericana.',
    bonus: 'Multiplicador x2 en puntos de sabiduría',
    unlockedLevel: 4
  }
];

export default function Sutz() {
  const { config, loading } = usePortalConfig();
  const { user, userProfile } = useAuth();
  const { 
    resources, 
    addResources,
    completedStories, 
    grantStoryCompletion,
    level,
    currentLevelXP,
    nextLevelXP,
    xpPercentage,
    badges,
    quests
  } = useSutzResources();
  const navigate = useNavigate();

  // Estados de Modales Gamificados
  const [activeStory, setActiveStory] = useState<StoryConfig | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTechTreeOpen, setIsTechTreeOpen] = useState(false);
  const [isCodexModalOpen, setIsCodexModalOpen] = useState(false);
  const [isQuestsModalOpen, setIsQuestsModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [selectedRelic, setSelectedRelic] = useState<MayanRelic | null>(null);

  // Audio State
  const [isAudioMuted, setIsAudioMuted] = useState(() => sutzAudio.getMuted());

  // Controles de mapa para botón de Centrar/Radar
  const mapControlsRef = useRef<{ zoomIn: () => void; zoomOut: () => void; centerView: () => void } | null>(null);

  useEffect(() => {
    document.body.classList.add('home-page-active');
    return () => {
      document.body.classList.remove('home-page-active');
    };
  }, []);

  const storiesList = config.stories || [];

  const handleHexClick = (hex: CustomHexagon) => {
    sutzAudio.playClick();
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
          if (story) {
            sutzAudio.playOpenModal();
            setActiveStory(story);
          }
        }
        break;
      default:
        break;
    }
  };

  // Generación de celdas para el mapa
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

  // Determinar rango del estudiante según nivel
  const getRankTitle = (lvl: number) => {
    if (lvl >= 10) return 'Gran Maestro de Sutz 👑';
    if (lvl >= 7) return 'Sacerdote del Tiempo 🏛️';
    if (lvl >= 5) return 'Guardián del Códice 🛡️';
    if (lvl >= 3) return 'Navegante de la Niebla 🧭';
    return 'Sabio Iniciado 📜';
  };

  const handleToggleAudio = () => {
    const muted = sutzAudio.toggleMute();
    setIsAudioMuted(muted);
  };

  const handleOpenModal = (type: 'profile' | 'tree' | 'codex' | 'quests' | 'inventory') => {
    sutzAudio.playOpenModal();
    // Cerrar otros para que no se sobrepongan
    setIsProfileModalOpen(type === 'profile');
    setIsTechTreeOpen(type === 'tree');
    setIsCodexModalOpen(type === 'codex');
    setIsQuestsModalOpen(type === 'quests');
    setIsInventoryModalOpen(type === 'inventory');
  };

  const handleCloseModals = () => {
    sutzAudio.playCloseModal();
    setIsProfileModalOpen(false);
    setIsTechTreeOpen(false);
    setIsCodexModalOpen(false);
    setIsQuestsModalOpen(false);
    setIsInventoryModalOpen(false);
    setSelectedRelic(null);
  };

  const handleClaimQuest = (questTitle: string) => {
    sutzAudio.playReward();
    addResources({ puntos: 150, monedas: 60, gemas: 5 });
    alert(`🎉 ¡Recompensa reclamada por completar: "${questTitle}"! (+150 Sabiduría, +60 Monedas, +5 Gemas)`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', background: '#060913' }}>
        <div style={{ width: '50px', height: '50px', border: '5px solid rgba(56,189,248,0.2)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '20px', color: '#38bdf8', fontWeight: 'bold' }}>Cargando Mundo Virtual de Sutz...</p>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="sutz-game-container">
      
      {/* ==========================================================================
          1. BARRA SUPERIOR GAMER INTEGRADA (TOP GAME HUD)
          ========================================================================== */}
      <header className="sutz-top-game-hud">
        
        {/* Izquierda: Cápsula de Héroe / Perfil del Estudiante */}
        <div className="sutz-hud-left">
          <div 
            className="sutz-hero-capsule" 
            onClick={() => handleOpenModal('profile')}
            title="Toca para ver tu perfil y estadísticas de juego"
          >
            <div className="sutz-hero-avatar-wrap">
              <div className="sutz-hero-avatar-frame">
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt="Avatar" className="sutz-hero-avatar-img" />
                ) : (
                  <span>{studentNickname.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <span className="sutz-hero-lvl-badge">LVL {level}</span>
            </div>

            <div className="sutz-hero-info">
              <div className="sutz-hero-name-row">
                <span className="sutz-hero-name">{studentNickname}</span>
                <span className="sutz-hero-rank-tag">{getRankTitle(level)}</span>
              </div>
              <div className="sutz-hero-bars">
                <div className="sutz-energy-gauge" title="Energía de Exploración disponible">
                  <span className="sutz-energy-icon">⚡</span>
                  <span>{100 + level * 5}</span>
                </div>
                <div className="sutz-xp-mini-gauge" title={`Experiencia: ${currentLevelXP}/${nextLevelXP} XP (${xpPercentage}%)`}>
                  <div className="sutz-xp-bar-bg">
                    <div className="sutz-xp-bar-fill" style={{ width: `${xpPercentage}%` }}></div>
                  </div>
                  <span>{xpPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Centro: Bandeja de Recursos 3D Gamificados */}
        <div className="sutz-hud-center">
          {/* Pergaminos / Popol Vuh */}
          <div 
            className="sutz-res-pod pergaminos" 
            onClick={() => handleOpenModal('codex')}
            title="Códice del Popol Vuh: Haz clic para ver los cuentos ancestrales descubiertos"
          >
            <div className="sutz-res-icon-circle">📜</div>
            <div className="sutz-res-val-wrap">
              <span className="sutz-res-val">{completedStories.length} / {storiesList.length || 5}</span>
              <span className="sutz-res-label">Códices</span>
            </div>
          </div>

          {/* Sabiduría / Puntos */}
          <div 
            className="sutz-res-pod puntos" 
            onClick={() => handleOpenModal('tree')}
            title="Sabiduría Acumulada: Úsala para desbloquear ramas en el Árbol Tecnológico"
          >
            <div className="sutz-res-icon-circle">⚡</div>
            <div className="sutz-res-val-wrap">
              <span className="sutz-res-val">{formatSutzResource(resources.puntos)}</span>
              <span className="sutz-res-label">Sabiduría</span>
            </div>
          </div>

          {/* Monedas de Oro */}
          <div 
            className="sutz-res-pod monedas" 
            onClick={() => handleOpenModal('quests')}
            title="Monedas Doradas: Gánalas completando misiones y descubriendo enigmas"
          >
            <div className="sutz-res-icon-circle">🪙</div>
            <div className="sutz-res-val-wrap">
              <span className="sutz-res-val">{formatSutzResource(resources.monedas)}</span>
              <span className="sutz-res-label">Oro Maya</span>
            </div>
            <span className="sutz-res-plus-btn" title="Completar retos para conseguir oro">+</span>
          </div>

          {/* Gemas Místicas */}
          <div 
            className="sutz-res-pod gemas" 
            onClick={() => handleOpenModal('inventory')}
            title="Gemas de Aprendizaje: Cristales cósmicos de sabiduría superior"
          >
            <div className="sutz-res-icon-circle">💎</div>
            <div className="sutz-res-val-wrap">
              <span className="sutz-res-val">{formatSutzResource(resources.gemas)}</span>
              <span className="sutz-res-label">Gemas</span>
            </div>
            <span className="sutz-res-badge-spark">TOP</span>
          </div>
        </div>

        {/* Derecha: Estado de Mundo, Sonido y Salir */}
        <div className="sutz-hud-right">
          <div className="sutz-world-pill">
            <span className="sutz-world-icon">☁️</span>
            <div className="sutz-world-text">
              <span className="sutz-world-title">Sutz Descubre</span>
              <span className="sutz-world-sub">{mapCompletionPercent}% Descubierto</span>
            </div>
          </div>

          {/* Botón de Audio */}
          <button 
            className="sutz-hud-action-btn"
            onClick={handleToggleAudio}
            title={isAudioMuted ? 'Activar Efectos de Sonido' : 'Silenciar Audio'}
            aria-label="Conmutar sonido"
          >
            {isAudioMuted ? '🔇' : '🔊'}
          </button>

          {/* Botón de Salir al Portal */}
          <button 
            className="sutz-hud-action-btn home-btn"
            onClick={() => { sutzAudio.playClick(); navigate('/'); }}
            title="Regresar a la página principal del Portal Educativo"
          >
            <span>🏠</span>
            <span>Inicio</span>
          </button>
        </div>
      </header>

      {/* ==========================================================================
          MAPA HEXAGONAL PRINCIPAL (CAMPO DE EXPLORACIÓN)
          ========================================================================== */}
      <HexagonGrid 
        cells={cells} 
        onHexClick={handleHexClick}
        onTransformReady={(controls) => {
          mapControlsRef.current = controls;
        }}
      />

      {/* ==========================================================================
          2. BARRA INFERIOR DE ACCIÓN GAMIFICADA (BOTTOM ACTION DOCK)
          ========================================================================== */}
      <div className="sutz-bottom-dock-container">
        <nav className="sutz-bottom-dock">
          {/* 1. PERFIL */}
          <button 
            className={`sutz-dock-item ${isProfileModalOpen ? 'active' : ''}`}
            onClick={() => handleOpenModal('profile')}
            title="Perfil del Estudiante, Títulos y Medallas"
          >
            <div className="sutz-dock-icon-disc">👤</div>
            <span className="sutz-dock-label">Perfil</span>
          </button>

          {/* 2. ÁRBOL TEC */}
          <button 
            className={`sutz-dock-item tree ${isTechTreeOpen ? 'active' : ''}`}
            onClick={() => handleOpenModal('tree')}
            title="Árbol de Tecnología Maya y Ciencias (30 Columnas)"
          >
            <div className="sutz-dock-icon-disc">🌳</div>
            <span className="sutz-dock-label">Árbol Tec</span>
            <span className="sutz-dock-badge">30</span>
          </button>

          {/* 3. CÓDICE POPOL VUH */}
          <button 
            className={`sutz-dock-item ${isCodexModalOpen ? 'active' : ''}`}
            onClick={() => handleOpenModal('codex')}
            title="Biblioteca de Leyendas del Popol Vuh"
          >
            <div className="sutz-dock-icon-disc">📜</div>
            <span className="sutz-dock-label">Códice</span>
            <span className="sutz-dock-badge">{completedStories.length}</span>
          </button>

          {/* 4. MISIONES */}
          <button 
            className={`sutz-dock-item quests ${isQuestsModalOpen ? 'active' : ''}`}
            onClick={() => handleOpenModal('quests')}
            title="Misiones Diarias y Retos de Conocimiento"
          >
            <div className="sutz-dock-icon-disc">🎯</div>
            <span className="sutz-dock-label">Misiones</span>
            {quests.some(q => q.completed) && <span className="sutz-dock-badge">!</span>}
          </button>

          {/* 5. MOCHILA / RELIQUIAS */}
          <button 
            className={`sutz-dock-item ${isInventoryModalOpen ? 'active' : ''}`}
            onClick={() => handleOpenModal('inventory')}
            title="Mochila del Explorador: Reliquias y Artefactos Ancestrales"
          >
            <div className="sutz-dock-icon-disc">🎒</div>
            <span className="sutz-dock-label">Mochila</span>
          </button>

          {/* 6. RADAR / CENTRAR */}
          <button 
            className="sutz-dock-item"
            onClick={() => {
              sutzAudio.playClick();
              if (mapControlsRef.current) {
                mapControlsRef.current.centerView();
              }
            }}
            title="Centrar Vista del Mapa en el Reino de Sutz"
          >
            <div className="sutz-dock-icon-disc">🧭</div>
            <span className="sutz-dock-label">Radar</span>
          </button>
        </nav>
      </div>

      {/* ==========================================================================
          3. MODALES DE JUEGO (GAME CARD MODALS)
          ========================================================================== */}

      {/* --- MODAL 1: PERFIL DEL ESTUDIANTE --- */}
      {isProfileModalOpen && (
        <div className="sutz-modal-overlay" onClick={handleCloseModals}>
          <div className="sutz-game-card-modal" onClick={e => e.stopPropagation()}>
            <div className="sutz-modal-header">
              <div className="sutz-modal-title-group">
                <div className="sutz-modal-icon-badge">🛡️</div>
                <div>
                  <h3 className="sutz-modal-heading">Expediente del Estudiante</h3>
                  <p className="sutz-modal-subheading">{getRankTitle(level)}</p>
                </div>
              </div>
              <button className="sutz-modal-close-btn" onClick={handleCloseModals} aria-label="Cerrar">✕</button>
            </div>

            <div className="sutz-modal-body">
              {/* Tarjeta de Avatar y Nivel */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="sutz-hero-avatar-wrap" style={{ width: '64px', height: '64px' }}>
                  <div className="sutz-hero-avatar-frame" style={{ width: '64px', height: '64px', fontSize: '1.8rem' }}>
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt="Avatar" className="sutz-hero-avatar-img" />
                    ) : (
                      <span>{studentNickname.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="sutz-hero-lvl-badge" style={{ fontSize: '0.75rem', bottom: '-6px' }}>LVL {level}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#f8fafc' }}>{studentNickname}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
                    <span>Progreso de Sabiduría</span>
                    <strong>{currentLevelXP} / {nextLevelXP} XP</strong>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(15,23,42,0.8)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ height: '100%', width: `${xpPercentage}%`, background: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)' }}></div>
                  </div>
                </div>
              </div>

              {/* Estadísticas de Expedición */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '14px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '1.5rem' }}>🗺️</span>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#34d399', marginTop: '2px' }}>{mapCompletionPercent}%</div>
                  <small style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Explorado</small>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '14px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '1.5rem' }}>📜</span>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>{completedStories.length}/{storiesList.length}</div>
                  <small style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Códices</small>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '14px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '1.5rem' }}>⚡</span>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fbbf24', marginTop: '2px' }}>{resources.puntos}</div>
                  <small style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Sabiduría</small>
                </div>
              </div>

              {/* Medallas e Insignias de Honor */}
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Insignias Alcanzadas</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {badges.map(b => (
                    <div 
                      key={b.id}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '6px 12px', 
                        borderRadius: '12px', 
                        background: b.unlocked ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.03)',
                        border: b.unlocked ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                        opacity: b.unlocked ? 1 : 0.4,
                        filter: b.unlocked ? 'none' : 'grayscale(1)'
                      }}
                      title={`${b.title}: ${b.desc}`}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{b.icon}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: b.unlocked ? '#e2e8f0' : '#64748b' }}>{b.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!user ? (
                <button 
                  style={{ 
                    marginTop: '8px', 
                    padding: '12px', 
                    borderRadius: '14px', 
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)', 
                    color: '#ffffff', 
                    border: '1px solid rgba(255,255,255,0.3)', 
                    fontWeight: 900, 
                    fontSize: '0.88rem', 
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(37,99,235,0.4)'
                  }}
                  onClick={() => { setIsAuthModalOpen(true); setIsProfileModalOpen(false); }}
                >
                  🔐 Iniciar Sesión para Guardar Progreso en la Nube
                </button>
              ) : (
                <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '10px 14px', borderRadius: '12px', color: '#34d399', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>☁️</span>
                  <span>Conectado como <strong>{user.email}</strong>. Tu progreso se sincroniza en tiempo real.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: CÓDICE ANCESTRAL DEL POPOL VUH --- */}
      {isCodexModalOpen && (
        <div className="sutz-modal-overlay" onClick={handleCloseModals}>
          <div className="sutz-game-card-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="sutz-modal-header">
              <div className="sutz-modal-title-group">
                <div className="sutz-modal-icon-badge" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}>📜</div>
                <div>
                  <h3 className="sutz-modal-heading">Códice del Popol Vuh</h3>
                  <p className="sutz-modal-subheading">Crónicas de los Dioses y la Creación del Mundo Maya</p>
                </div>
              </div>
              <button className="sutz-modal-close-btn" onClick={handleCloseModals} aria-label="Cerrar">✕</button>
            </div>

            <div className="sutz-modal-body">
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0' }}>
                Explora las 5 narraciones fundamentales del Popol Vuh. Cada crónica leída desbloquea pergaminos sagrados, gemas de éter y sabiduría para tu viaje en Sutz.
              </p>

              <div className="sutz-codex-grid">
                {storiesList.map((story: StoryConfig) => {
                  const isUnlocked = completedStories.includes(story.id);
                  return (
                    <div 
                      key={story.id} 
                      className="sutz-codex-card"
                      onClick={() => {
                        handleCloseModals();
                        setActiveStory(story);
                        sutzAudio.playOpenModal();
                      }}
                    >
                      <div className="sutz-codex-thumb">
                        <img src={getStoryImage(story.id, story.imageOverride)} alt={story.title} />
                      </div>
                      <h4 className="sutz-codex-title">{story.title}</h4>
                      <span className={`sutz-codex-status ${isUnlocked ? 'unlocked' : 'locked'}`}>
                        {isUnlocked ? '✨ Leído (+120 Sabiduría)' : '🔒 Por Descubrir'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: TABLÓN DE MISIONES Y DESAFÍOS --- */}
      {isQuestsModalOpen && (
        <div className="sutz-modal-overlay" onClick={handleCloseModals}>
          <div className="sutz-game-card-modal" onClick={e => e.stopPropagation()}>
            <div className="sutz-modal-header">
              <div className="sutz-modal-title-group">
                <div className="sutz-modal-icon-badge" style={{ background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' }}>🎯</div>
                <div>
                  <h3 className="sutz-modal-heading">Tablón de Misiones</h3>
                  <p className="sutz-modal-subheading">Retos Pedagógicos y Recompensas de Sabiduría</p>
                </div>
              </div>
              <button className="sutz-modal-close-btn" onClick={handleCloseModals} aria-label="Cerrar">✕</button>
            </div>

            <div className="sutz-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {quests.map(q => (
                  <div 
                    key={q.id}
                    style={{ 
                      background: 'rgba(255,255,255,0.04)', 
                      borderRadius: '16px', 
                      padding: '14px 16px', 
                      border: q.completed ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                      boxShadow: q.completed ? '0 4px 16px rgba(16,185,129,0.2)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{q.icon}</span>
                        <div>
                          <strong style={{ fontSize: '0.92rem', color: '#ffffff' }}>{q.title}</strong>
                          <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#94a3b8' }}>{q.desc}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 900, color: q.completed ? '#34d399' : '#fbbf24' }}>
                        {q.progress} / {q.target}
                      </span>
                    </div>

                    <div style={{ marginTop: '10px', height: '6px', background: 'rgba(15,23,42,0.8)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${Math.min(100, Math.round((q.progress / q.target) * 100))}%`, 
                          background: q.completed ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' : 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)' 
                        }}
                      ></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Recompensa: <strong>+{q.rewardXp} XP • 🪙 60 • 💎 5</strong></span>
                      {q.completed ? (
                        <button 
                          style={{ 
                            padding: '6px 14px', 
                            borderRadius: '10px', 
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                            color: '#ffffff', 
                            fontWeight: 900, 
                            border: '1px solid #ffffff', 
                            cursor: 'pointer',
                            fontSize: '0.76rem',
                            boxShadow: '0 2px 8px rgba(16,185,129,0.5)'
                          }}
                          onClick={() => handleClaimQuest(q.title)}
                        >
                          🏆 Reclamar
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>En Progreso ⏳</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: MOCHILA / INVENTARIO DE RELIQUIAS --- */}
      {isInventoryModalOpen && (
        <div className="sutz-modal-overlay" onClick={handleCloseModals}>
          <div className="sutz-game-card-modal" onClick={e => e.stopPropagation()}>
            <div className="sutz-modal-header">
              <div className="sutz-modal-title-group">
                <div className="sutz-modal-icon-badge" style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}>🎒</div>
                <div>
                  <h3 className="sutz-modal-heading">Mochila del Explorador</h3>
                  <p className="sutz-modal-subheading">Reliquias Sagradas y Tesoros Ancestrales Mayas</p>
                </div>
              </div>
              <button className="sutz-modal-close-btn" onClick={handleCloseModals} aria-label="Cerrar">✕</button>
            </div>

            <div className="sutz-modal-body">
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0' }}>
                Toca cualquier reliquia para inspeccionar sus atributos sagrados y las bonificaciones de aprendizaje que otorga en tu travesía.
              </p>

              <div className="sutz-inventory-grid">
                {MAYAN_RELICS.map(relic => {
                  const isUnlocked = relic.unlockedStoryId 
                    ? completedStories.includes(relic.unlockedStoryId) 
                    : (relic.unlockedLevel ? level >= relic.unlockedLevel : true);

                  return (
                    <div 
                      key={relic.id} 
                      className={`sutz-relic-slot ${isUnlocked ? 'has-item' : ''}`}
                      onClick={() => {
                        sutzAudio.playClick();
                        setSelectedRelic(relic);
                      }}
                      title={isUnlocked ? relic.name : 'Reliquia bloqueada'}
                    >
                      <span className="sutz-relic-icon" style={{ opacity: isUnlocked ? 1 : 0.3, filter: isUnlocked ? 'none' : 'grayscale(1)' }}>
                        {relic.icon}
                      </span>
                      <span className="sutz-relic-name" style={{ color: isUnlocked ? '#fef08a' : '#64748b' }}>
                        {isUnlocked ? relic.name : '???'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Detalle de Reliquia Seleccionada */}
              {selectedRelic && (
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '14px', border: '1.5px solid rgba(245,158,11,0.5)', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '2rem' }}>{selectedRelic.icon}</span>
                    <div>
                      <h4 style={{ margin: '0', fontSize: '1rem', color: '#fef08a' }}>{selectedRelic.name}</h4>
                      <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800 }}>{selectedRelic.category} • Rareza {selectedRelic.rarity}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '8px 0 6px 0', lineHeight: 1.4 }}>{selectedRelic.desc}</p>
                  <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '8px', padding: '6px 10px', fontSize: '0.74rem', color: '#34d399', fontWeight: 800 }}>
                    ✨ {selectedRelic.bonus}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: ÁRBOL DE TECNOLOGÍA (30 COLUMNAS) --- */}
      <TechTreeModal 
        isOpen={isTechTreeOpen}
        onClose={() => setIsTechTreeOpen(false)}
        nodesMap={config.techTreeNodes}
      />

      {/* --- MODAL DE AUTENTICACIÓN --- */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* --- MODAL DE HISTORIA INDIVIDUAL DEL POPOL VUH --- */}
      {activeStory && (
        <div 
          className="sutz-modal-overlay" 
          onClick={() => { 
            sutzAudio.playReward();
            grantStoryCompletion(activeStory.id); 
            setActiveStory(null); 
          }}
        >
          <div className="sutz-game-card-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="sutz-modal-header">
              <div className="sutz-modal-title-group">
                <div className="sutz-modal-icon-badge" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)' }}>📖</div>
                <div>
                  <h3 className="sutz-modal-heading">{activeStory.title}</h3>
                  <p className="sutz-modal-subheading">✨ {activeStory.role}</p>
                </div>
              </div>
              <button 
                className="sutz-modal-close-btn" 
                onClick={() => { 
                  sutzAudio.playReward();
                  grantStoryCompletion(activeStory.id); 
                  setActiveStory(null); 
                }}
              >
                ✕
              </button>
            </div>

            <div className="sutz-modal-body">
              <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ width: '130px', height: '170px', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 24px rgba(0,0,0,0.7)', flexShrink: 0, margin: '0 auto' }}>
                  <img src={getStoryImage(activeStory.id, activeStory.imageOverride)} alt={activeStory.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.55, color: '#e2e8f0', margin: '0 0 14px 0' }}>
                    {activeStory.summary}
                  </p>
                  <div style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '10px', padding: '8px 12px', fontSize: '0.78rem', color: '#38bdf8' }}>
                    🎁 <strong>Recompensa de lectura:</strong> +1 Pergamino, +120 Puntos de Sabiduría, +50 Monedas, +10 Gemas.
                  </div>
                </div>
              </div>

              <button 
                style={{ 
                  marginTop: '8px', 
                  padding: '12px 20px', 
                  borderRadius: '14px', 
                  background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)', 
                  color: '#ffffff', 
                  border: '1px solid rgba(255,255,255,0.4)', 
                  fontWeight: 900, 
                  fontSize: '0.92rem', 
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(37,99,235,0.5)',
                  width: '100%'
                }}
                onClick={() => { 
                  sutzAudio.playReward();
                  grantStoryCompletion(activeStory.id); 
                  setActiveStory(null); 
                }}
              >
                Completado, Continuar Explorando 👍
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
