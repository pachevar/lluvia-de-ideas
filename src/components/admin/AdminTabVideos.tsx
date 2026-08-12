import { useState } from 'react';
import type { PortalConfig, PromoVideoItem } from '../../types';
import PromoTipsModal from '../landing/PromoTipsModal';
import './AdminTabVideos.css';

interface AdminTabVideosProps {
  localConfig: PortalConfig;
  setLocalConfig: React.Dispatch<React.SetStateAction<PortalConfig | null>>;
}

export function extractYouTubeId(input: string): string {
  if (!input) return 'HMFybOP8gec';
  const trimmed = input.trim();
  
  const shortsMatch = trimmed.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];
  
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  
  const beMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (beMatch) return beMatch[1];
  
  const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  
  if (trimmed.length === 11 && !trimmed.includes('/')) return trimmed;
  
  return trimmed;
}

export default function AdminTabVideos({ localConfig, setLocalConfig }: AdminTabVideosProps) {
  const [activeSubtab, setActiveSubtab] = useState<'main' | 'modal' | 'custom'>('main');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // Form state for creating/editing a tip item
  const [editingTipIndex, setEditingTipIndex] = useState<number | null>(null);
  const [tipForm, setTipForm] = useState<Partial<PromoVideoItem>>({
    tabLabel: '',
    icon: '🎬',
    title: '',
    youtubeUrl: '',
    description: '',
    bullets: ['']
  });

  const promoVideos = localConfig.landingConfig?.promoVideos || {};
  const mainShortId = promoVideos.mainShortId || 'HMFybOP8gec';
  const mainTitle = promoVideos.mainTitle || 'Conoce Nuestro Ecosistema Educativo';
  const mainBadge = promoVideos.mainBadge || '🎬 Video Promocional';
  const mainDescription = promoVideos.mainDescription || 'Te invitamos a ver nuestro video promocional para conocer cómo nuestras plataformas, libros interactivos y herramientas digitales transforman el aprendizaje en el aula.';
  const mainYoutubeUrl = promoVideos.mainYoutubeUrl || `https://youtube.com/shorts/${mainShortId}`;

  const defaultTipsList: PromoVideoItem[] = [
    {
      id: 'welcome',
      tabLabel: 'Bienvenida al Ecosistema',
      icon: '🌟',
      title: 'Conoce Nuestra Potente Herramienta',
      videoId: 'HMFybOP8gec',
      description: 'Nuestra plataforma unifica libros de texto, experiencias pedagógicas interactivas y recursos de aprendizaje adaptativo.',
      bullets: ['Acceso instantáneo a materiales digitales.', 'Diseño interactivo adaptado.', 'Enfoque inclusivo en K\'iche\' y Español.'],
      visible: true
    },
    {
      id: 'sutz',
      tabLabel: 'Mundo Virtual Sutz',
      icon: '☁️',
      title: 'Sutz: Nube de Aprendizaje Adaptativo',
      videoId: 'HMFybOP8gec',
      description: 'En idioma K\'iche\', Sutz significa Nube. Es un ecosistema interactivo basado en un mapa hexagonal de descubrimientos.',
      bullets: ['Navega por biomas y desafíos lógicos.', 'Progresión personalizada al ritmo real.', 'Evaluaciones gamificadas sin estrés.'],
      visible: true
    }
  ];

  const tipsList: PromoVideoItem[] = promoVideos.tipsList || defaultTipsList;

  // Handlers for main video section
  const handleMainUrlChange = (url: string) => {
    const extractedId = extractYouTubeId(url);
    setLocalConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        landingConfig: {
          ...prev.landingConfig,
          promoVideos: {
            ...prev.landingConfig?.promoVideos,
            mainYoutubeUrl: url,
            mainShortId: extractedId
          }
        }
      };
    });
  };

  const updateMainField = (field: string, value: string) => {
    setLocalConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        landingConfig: {
          ...prev.landingConfig,
          promoVideos: {
            ...prev.landingConfig?.promoVideos,
            [field]: value
          }
        }
      };
    });
  };

  // Handlers for modal tips list
  const handleSaveTip = () => {
    if (!tipForm.title || !tipForm.tabLabel) {
      alert('Por favor completa el título y el nombre de la pestaña.');
      return;
    }

    const videoId = extractYouTubeId(tipForm.youtubeUrl || tipForm.videoId || '');
    const newTip: PromoVideoItem = {
      id: tipForm.id || `tip-${Date.now()}`,
      tabLabel: tipForm.tabLabel || 'Nuevo Video',
      icon: tipForm.icon || '🎬',
      title: tipForm.title || '',
      videoId: videoId,
      youtubeUrl: tipForm.youtubeUrl || `https://youtube.com/watch?v=${videoId}`,
      description: tipForm.description || '',
      bullets: (tipForm.bullets || []).filter(b => b.trim() !== ''),
      visible: tipForm.visible ?? true
    };

    let updatedList = [...tipsList];
    if (editingTipIndex !== null) {
      updatedList[editingTipIndex] = newTip;
    } else {
      updatedList.push(newTip);
    }

    setLocalConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        landingConfig: {
          ...prev.landingConfig,
          promoVideos: {
            ...prev.landingConfig?.promoVideos,
            tipsList: updatedList
          }
        }
      };
    });

    setEditingTipIndex(null);
    setTipForm({ tabLabel: '', icon: '🎬', title: '', youtubeUrl: '', description: '', bullets: [''] });
  };

  const handleEditTip = (index: number) => {
    const item = tipsList[index];
    setEditingTipIndex(index);
    setTipForm({ ...item });
  };

  const handleDeleteTip = (index: number) => {
    if (!window.confirm(`¿Estás seguro de eliminar el consejo "${tipsList[index].title}"?`)) return;
    const updatedList = tipsList.filter((_, i) => i !== index);
    setLocalConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        landingConfig: {
          ...prev.landingConfig,
          promoVideos: {
            ...prev.landingConfig?.promoVideos,
            tipsList: updatedList
          }
        }
      };
    });
  };

  const handleToggleVisibility = (index: number) => {
    const updatedList = [...tipsList];
    updatedList[index] = {
      ...updatedList[index],
      visible: !updatedList[index].visible
    };
    setLocalConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        landingConfig: {
          ...prev.landingConfig,
          promoVideos: {
            ...prev.landingConfig?.promoVideos,
            tipsList: updatedList
          }
        }
      };
    });
  };

  const handleMoveTip = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= tipsList.length) return;
    const updatedList = [...tipsList];
    const temp = updatedList[index];
    updatedList[index] = updatedList[newIndex];
    updatedList[newIndex] = temp;

    setLocalConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        landingConfig: {
          ...prev.landingConfig,
          promoVideos: {
            ...prev.landingConfig?.promoVideos,
            tipsList: updatedList
          }
        }
      };
    });
  };

  return (
    <div className="admin-tab-videos animate-fade-in">
      
      {/* Sub-pestañas Internas */}
      <div className="videos-subtabs">
        <button
          className={`videos-subtab-btn ${activeSubtab === 'main' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('main')}
        >
          📱 Video Promocional Shorts (Inicio)
        </button>
        <button
          className={`videos-subtab-btn ${activeSubtab === 'modal' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('modal')}
        >
          🎬 Modal de Consejos & Recorridos
        </button>
      </div>

      {/* PESTAÑA 1: VIDEO PROMOCIONAL DE INICIO */}
      {activeSubtab === 'main' && (
        <div className="video-edit-grid">
          
          <div className="form-group-card card-glass">
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '1.25rem' }}>
              ⚙️ Configuración del Video en la Landing Page
            </h3>

            <div className="form-row">
              <label>Etiqueta / Badge Superior:</label>
              <input 
                type="text" 
                value={mainBadge}
                onChange={(e) => updateMainField('mainBadge', e.target.value)}
                placeholder="Ej: 🎬 Video Promocional"
                className="form-control"
              />
            </div>

            <div className="form-row">
              <label>Título Principal de la Sección:</label>
              <input 
                type="text" 
                value={mainTitle}
                onChange={(e) => updateMainField('mainTitle', e.target.value)}
                placeholder="Ej: Conoce Nuestro Ecosistema Educativo"
                className="form-control"
              />
            </div>

            <div className="form-row">
              <label>Enlace de YouTube o Shorts:</label>
              <input 
                type="text" 
                value={mainYoutubeUrl}
                onChange={(e) => handleMainUrlChange(e.target.value)}
                placeholder="Pega aquí cualquier link: https://youtube.com/shorts/HMFybOP8gec"
                className="form-control"
              />
              <div className="youtube-extractor-notice" style={{ marginTop: '8px' }}>
                <span>✨</span> YouTube Video ID detectado: <strong>{mainShortId}</strong>
              </div>
            </div>

            <div className="form-row">
              <label>Descripción / Párrafo Informativo:</label>
              <textarea 
                rows={4}
                value={mainDescription}
                onChange={(e) => updateMainField('mainDescription', e.target.value)}
                placeholder="Párrafo invitando a ver el video promocional..."
                className="form-control"
              />
            </div>
          </div>

          {/* Previsualizador en Vivo */}
          <div className="video-preview-box">
            <span className="video-preview-title">
              👁️ Previsualización en Vivo de Shorts
            </span>
            <div className="video-preview-frame">
              <iframe
                src={`https://www.youtube.com/embed/${mainShortId}?autoplay=0&rel=0`}
                title="Preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

        </div>
      )}

      {/* PESTAÑA 2: MODAL DE CONSEJOS Y RECORRIDOS */}
      {activeSubtab === 'modal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0 }}>
                🎬 Consejos & Recorridos en Video (`PromoTipsModal`)
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                Configura los temas que aparecen cuando los usuarios abren el modal de consejos en el portal.
              </p>
            </div>
            
            <button 
              className="btn btn-secondary"
              onClick={() => setIsTestModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              👁️ Probar Modal en Vivo
            </button>
          </div>

          {/* Formulario de Creación / Edición */}
          <div className="form-group-card card-glass">
            <h4 style={{ color: '#38bdf8', marginBottom: '1rem' }}>
              {editingTipIndex !== null ? '✏️ Editar Tema de Video' : '➕ Agregar Nuevo Tema de Video'}
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Icono:</label>
                <input 
                  type="text" 
                  value={tipForm.icon || '🎬'} 
                  onChange={(e) => setTipForm({ ...tipForm, icon: e.target.value })}
                  className="form-control"
                  style={{ textAlign: 'center', fontSize: '1.2rem' }}
                />
              </div>

              <div>
                <label>Nombre de la Pestaña:</label>
                <input 
                  type="text" 
                  value={tipForm.tabLabel || ''} 
                  onChange={(e) => setTipForm({ ...tipForm, tabLabel: e.target.value })}
                  placeholder="Ej: Bienvenida al Ecosistema"
                  className="form-control"
                />
              </div>

              <div>
                <label>Título Explicativo:</label>
                <input 
                  type="text" 
                  value={tipForm.title || ''} 
                  onChange={(e) => setTipForm({ ...tipForm, title: e.target.value })}
                  placeholder="Ej: Conoce Nuestra Potente Herramienta"
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row" style={{ marginTop: '1rem' }}>
              <label>Enlace o ID de YouTube:</label>
              <input 
                type="text" 
                value={tipForm.youtubeUrl || tipForm.videoId || ''} 
                onChange={(e) => {
                  const url = e.target.value;
                  const id = extractYouTubeId(url);
                  setTipForm({ ...tipForm, youtubeUrl: url, videoId: id });
                }}
                placeholder="Pega aquí cualquier enlace de YouTube o Shorts..."
                className="form-control"
              />
              <div className="youtube-extractor-notice" style={{ marginTop: '6px' }}>
                <span>✨</span> ID Extraído: <strong>{extractYouTubeId(tipForm.youtubeUrl || tipForm.videoId || '')}</strong>
              </div>
            </div>

            <div className="form-row">
              <label>Descripción Breve:</label>
              <textarea 
                rows={2}
                value={tipForm.description || ''} 
                onChange={(e) => setTipForm({ ...tipForm, description: e.target.value })}
                placeholder="Resumen instructivo del tema..."
                className="form-control"
              />
            </div>

            <div style={{ marginTop: '1rem' }}>
              <button 
                className="btn btn-primary"
                onClick={handleSaveTip}
              >
                {editingTipIndex !== null ? '💾 Guardar Tema' : '➕ Agregar a la Lista'}
              </button>
              {editingTipIndex !== null && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingTipIndex(null);
                    setTipForm({ tabLabel: '', icon: '🎬', title: '', youtubeUrl: '', description: '', bullets: [''] });
                  }}
                  style={{ marginLeft: '10px' }}
                >
                  Cancelar Edición
                </button>
              )}
            </div>
          </div>

          {/* Lista de Consejos Existentes */}
          <div className="tips-list-container">
            <h4 style={{ color: '#ffffff', margin: 0 }}>Lista de Temas Configurados ({tipsList.length})</h4>
            
            {tipsList.map((tip, idx) => (
              <div key={tip.id || idx} className={`tip-item-card ${tip.visible === false ? 'hidden-item' : ''}`}>
                <div className="tip-item-info">
                  <span className="tip-item-icon">{tip.icon}</span>
                  <div className="tip-item-details">
                    <h4>{tip.tabLabel} — <span style={{ color: '#38bdf8' }}>{tip.title}</span></h4>
                    <p>{tip.description || 'Sin descripción'}</p>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>YouTube ID: {tip.videoId}</span>
                  </div>
                </div>

                <div className="tip-item-actions">
                  <button 
                    className="action-btn-icon"
                    onClick={() => handleMoveTip(idx, 'up')}
                    disabled={idx === 0}
                    title="Mover arriba"
                  >
                    ⬆️
                  </button>
                  <button 
                    className="action-btn-icon"
                    onClick={() => handleMoveTip(idx, 'down')}
                    disabled={idx === tipsList.length - 1}
                    title="Mover abajo"
                  >
                    ⬇️
                  </button>
                  <button 
                    className="action-btn-icon"
                    onClick={() => handleToggleVisibility(idx)}
                    title={tip.visible !== false ? 'Ocultar tema' : 'Mostrar tema'}
                  >
                    {tip.visible !== false ? '👁️ Visible' : '🙈 Oculto'}
                  </button>
                  <button 
                    className="action-btn-icon"
                    onClick={() => handleEditTip(idx)}
                    title="Editar"
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    className="action-btn-icon delete"
                    onClick={() => handleDeleteTip(idx)}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Modal de prueba en vivo */}
      <PromoTipsModal 
        isOpen={isTestModalOpen} 
        onClose={() => setIsTestModalOpen(false)} 
      />

    </div>
  );
}
