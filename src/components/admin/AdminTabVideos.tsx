import { useState } from 'react';
import type { PortalConfig, PromoVideoItem } from '../../types';
import PromoTipsModal from '../landing/PromoTipsModal';
import { usePortalConfig } from '../../context/PortalConfigContext';
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
  const { saveConfigToFirestore } = usePortalConfig();
  const [activeSubtab, setActiveSubtab] = useState<'main' | 'modal'>('main');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4500);
  };

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
      title: 'Conoce Nuestro Potente Ecosistema Educativo',
      videoId: 'HMFybOP8gec',
      description: 'Nuestra plataforma unifica libros de texto, experiencias pedagógicas interactivas y recursos de aprendizaje adaptativo.',
      bullets: [
        'Acceso instantáneo a materiales digitales y actividades para cada grado.',
        'Diseño interactivo adaptado para docentes, estudiantes y administradores.',
        'Herramientas inclusivas con enfoque cultural en idioma K\'iche\' y Español.'
      ],
      visible: true
    },
    {
      id: 'sutz',
      tabLabel: 'Mundo Virtual Sutz',
      icon: '☁️',
      title: 'Sutz: Nube de Aprendizaje Adaptativo',
      videoId: 'HMFybOP8gec',
      description: 'En idioma K\'iche\', Sutz significa Nube. Es un ecosistema interactivo basado en un mapa hexagonal de descubrimientos.',
      bullets: [
        'Navega por biomas, montañas y desafíos lógicos.',
        'Progresión personalizada al ritmo real de cada estudiante.',
        'Evaluaciones gamificadas sin estrés ni presión.'
      ],
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

  const handleSaveMainVideo = async () => {
    if (!localConfig) return;
    setIsSaving(true);
    try {
      await saveConfigToFirestore(localConfig);
      showFeedback('✨ ¡Video promocional de inicio guardado permanentemente en Firestore!');
    } catch (err) {
      console.error('Error saving main video:', err);
      showFeedback('❌ Error al guardar en Firestore.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Bullet points handlers
  const handleBulletChange = (index: number, value: string) => {
    const currentBullets = [...(tipForm.bullets || [])];
    currentBullets[index] = value;
    setTipForm({ ...tipForm, bullets: currentBullets });
  };

  const handleAddBulletField = () => {
    setTipForm({ ...tipForm, bullets: [...(tipForm.bullets || []), ''] });
  };

  const handleRemoveBulletField = (index: number) => {
    const currentBullets = (tipForm.bullets || []).filter((_, i) => i !== index);
    setTipForm({ ...tipForm, bullets: currentBullets });
  };

  // Handlers for modal tips list with instant Firestore persistence
  const handleSaveTip = async () => {
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

    const updatedList = [...tipsList];
    if (editingTipIndex !== null) {
      updatedList[editingTipIndex] = newTip;
    } else {
      updatedList.push(newTip);
    }

    if (!localConfig) return;
    const updatedConfig: PortalConfig = {
      ...localConfig,
      landingConfig: {
        ...localConfig.landingConfig,
        promoVideos: {
          ...localConfig.landingConfig?.promoVideos,
          tipsList: updatedList
        }
      }
    };

    setLocalConfig(updatedConfig);
    setIsSaving(true);
    try {
      await saveConfigToFirestore(updatedConfig);
      showFeedback(`✨ ¡Tema «${newTip.tabLabel}» guardado y sincronizado en Firestore!`);
      setEditingTipIndex(null);
      setTipForm({ tabLabel: '', icon: '🎬', title: '', youtubeUrl: '', description: '', bullets: [''] });
    } catch (err) {
      console.error('Error saving tip:', err);
      showFeedback('❌ Error al guardar el tema en Firestore.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTip = (index: number) => {
    const item = tipsList[index];
    setEditingTipIndex(index);
    setTipForm({ ...item, bullets: item.bullets && item.bullets.length > 0 ? [...item.bullets] : [''] });
  };

  const handleDeleteTip = async (index: number) => {
    const targetTitle = tipsList[index].title;
    if (!window.confirm(`¿Estás seguro de eliminar el consejo "${targetTitle}"?`)) return;
    const updatedList = tipsList.filter((_, i) => i !== index);

    if (!localConfig) return;
    const updatedConfig: PortalConfig = {
      ...localConfig,
      landingConfig: {
        ...localConfig.landingConfig,
        promoVideos: {
          ...localConfig.landingConfig?.promoVideos,
          tipsList: updatedList
        }
      }
    };

    setLocalConfig(updatedConfig);
    try {
      await saveConfigToFirestore(updatedConfig);
      showFeedback(`🗑️ Tema «${targetTitle}» eliminado y actualizado en Firestore.`);
    } catch (err) {
      console.error('Error deleting tip:', err);
      showFeedback('❌ Error al eliminar el tema en Firestore.', 'error');
    }
  };

  const handleToggleVisibility = async (index: number) => {
    const updatedList = [...tipsList];
    const newState = !updatedList[index].visible;
    updatedList[index] = {
      ...updatedList[index],
      visible: newState
    };

    if (!localConfig) return;
    const updatedConfig: PortalConfig = {
      ...localConfig,
      landingConfig: {
        ...localConfig.landingConfig,
        promoVideos: {
          ...localConfig.landingConfig?.promoVideos,
          tipsList: updatedList
        }
      }
    };

    setLocalConfig(updatedConfig);
    try {
      await saveConfigToFirestore(updatedConfig);
      showFeedback(`👁️ Visibilidad de «${updatedList[index].tabLabel}» actualizada en Firestore.`);
    } catch (err) {
      console.error('Error toggling visibility:', err);
    }
  };

  const handleMoveTip = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= tipsList.length) return;
    const updatedList = [...tipsList];
    const temp = updatedList[index];
    updatedList[index] = updatedList[newIndex];
    updatedList[newIndex] = temp;

    if (!localConfig) return;
    const updatedConfig: PortalConfig = {
      ...localConfig,
      landingConfig: {
        ...localConfig.landingConfig,
        promoVideos: {
          ...localConfig.landingConfig?.promoVideos,
          tipsList: updatedList
        }
      }
    };

    setLocalConfig(updatedConfig);
    try {
      await saveConfigToFirestore(updatedConfig);
      showFeedback('↕️ Orden de temas actualizado en Firestore.');
    } catch (err) {
      console.error('Error moving tip:', err);
    }
  };

  return (
    <div className="admin-tab-videos animate-fade-in">
      
      {/* Banner de Encabezado Premium */}
      <div className="videos-header-banner">
        <div className="videos-banner-text">
          <h3><span>🎬</span> Gestor de Videos, Enlaces & Modal de Consejos</h3>
          <p>Personaliza los enlaces de YouTube, videos de Shorts y temas explicativos del portal en tiempo real con guardado directo en Firestore.</p>
          {feedbackMsg && (
            <div style={{
              background: feedbackMsg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: `1px solid ${feedbackMsg.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              color: feedbackMsg.type === 'success' ? '#6ee7b7' : '#fca5a5',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 700,
              marginTop: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {feedbackMsg.text}
            </div>
          )}
        </div>

        <div className="videos-subtabs">
          <button
            className={`videos-subtab-btn ${activeSubtab === 'main' ? 'active' : ''}`}
            onClick={() => setActiveSubtab('main')}
          >
            📱 Video Shorts Inicio
          </button>
          <button
            className={`videos-subtab-btn ${activeSubtab === 'modal' ? 'active' : ''}`}
            onClick={() => setActiveSubtab('modal')}
          >
            💡 Modal Consejos (`PromoTips`)
          </button>
        </div>
      </div>

      {/* PESTAÑA 1: VIDEO PROMOCIONAL DE INICIO */}
      {activeSubtab === 'main' && (
        <div className="video-edit-grid">
          
          <div className="premium-form-card">
            <h3 className="premium-card-title">
              <span>⚙️</span> Configuración del Video en la Página de Inicio
            </h3>

            <div className="form-field-group">
              <label className="form-field-label">
                <span>Insignia Superior (Badge):</span>
                <span className="form-field-hint">Aparece en la pastilla sobre el título</span>
              </label>
              <input 
                type="text" 
                value={mainBadge}
                onChange={(e) => updateMainField('mainBadge', e.target.value)}
                placeholder="Ej: 🎬 Video Promocional"
                className="premium-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-field-label">
                <span>Título Principal de la Sección:</span>
                <span className="form-field-hint">Título con destello neón</span>
              </label>
              <input 
                type="text" 
                value={mainTitle}
                onChange={(e) => updateMainField('mainTitle', e.target.value)}
                placeholder="Ej: Conoce Nuestro Ecosistema Educativo"
                className="premium-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-field-label">
                <span>Enlace de YouTube o Shorts:</span>
                <span className="form-field-hint">Pega cualquier enlace público</span>
              </label>
              <div className="youtube-url-input-wrapper">
                <input 
                  type="text" 
                  value={mainYoutubeUrl}
                  onChange={(e) => handleMainUrlChange(e.target.value)}
                  placeholder="https://youtube.com/shorts/HMFybOP8gec"
                  className="premium-input"
                />
              </div>
              <div className="youtube-extracted-badge">
                <span>✨</span> YouTube ID Detectado: <strong>{mainShortId}</strong>
              </div>
            </div>

            <div className="form-field-group">
              <label className="form-field-label">
                <span>Descripción Promocional:</span>
                <span className="form-field-hint">Párrafo explicativo del video</span>
              </label>
              <textarea 
                rows={4}
                value={mainDescription}
                onChange={(e) => updateMainField('mainDescription', e.target.value)}
                placeholder="Párrafo invitando a ver el video promocional..."
                className="premium-textarea"
              />
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={handleSaveMainVideo}
                disabled={isSaving}
                style={{ padding: '12px 28px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <span>{isSaving ? '⏳' : '💾'}</span>
                <span>{isSaving ? 'Guardando en Firestore...' : 'Guardar Video de Inicio en Firestore'}</span>
              </button>
            </div>
          </div>

          {/* Previsualizador de Video en Vivo estilo Celular */}
          <div className="video-preview-card">
            <div className="preview-card-header">
              <span className="premium-card-title" style={{ fontSize: '1rem', border: 'none', padding: 0 }}>
                📱 Vista Previa en Vivo
              </span>
              <span className="preview-badge-live">● EN VIVO</span>
            </div>
            
            <div className="phone-mockup-mini">
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#ffffff', margin: 0, fontWeight: 900 }}>
                💡 Temas & Videos Explicativos del Modal (`PromoTipsModal`)
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
                Administra las pestañas con videos de YouTube y consejos interactivos para los usuarios.
              </p>
            </div>
            
            <button 
              className="btn btn-secondary btn-portal-preview"
              onClick={() => setIsTestModalOpen(true)}
              style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(129, 140, 248, 0.3))', borderColor: 'rgba(56, 189, 248, 0.5)' }}
            >
              <span>👁️</span> Probar Modal en Vivo
            </button>
          </div>

          {/* Formulario de Creación / Edición Premium */}
          <div className="premium-form-card">
            <h4 className="premium-card-title">
              <span>{editingTipIndex !== null ? '✏️' : '➕'}</span>
              <span>{editingTipIndex !== null ? `Editando Tema #${editingTipIndex + 1}` : 'Agregar Nuevo Tema en Video'}</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gap: '1.25rem' }}>
              <div className="form-field-group">
                <label className="form-field-label">Icono:</label>
                <input 
                  type="text" 
                  value={tipForm.icon || '🎬'} 
                  onChange={(e) => setTipForm({ ...tipForm, icon: e.target.value })}
                  className="premium-input"
                  style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: 'bold' }}
                />
              </div>

              <div className="form-field-group">
                <label className="form-field-label">Nombre de Pestaña:</label>
                <input 
                  type="text" 
                  value={tipForm.tabLabel || ''} 
                  onChange={(e) => setTipForm({ ...tipForm, tabLabel: e.target.value })}
                  placeholder="Ej: Bienvenida al Ecosistema"
                  className="premium-input"
                />
              </div>

              <div className="form-field-group">
                <label className="form-field-label">Título Explicativo:</label>
                <input 
                  type="text" 
                  value={tipForm.title || ''} 
                  onChange={(e) => setTipForm({ ...tipForm, title: e.target.value })}
                  placeholder="Ej: Conoce Nuestro Potente Ecosistema Educativo"
                  className="premium-input"
                />
              </div>
            </div>

            <div className="form-field-group">
              <label className="form-field-label">Enlace o ID de YouTube:</label>
              <input 
                type="text" 
                value={tipForm.youtubeUrl || tipForm.videoId || ''} 
                onChange={(e) => {
                  const url = e.target.value;
                  const id = extractYouTubeId(url);
                  setTipForm({ ...tipForm, youtubeUrl: url, videoId: id });
                }}
                placeholder="Pega enlace de YouTube (Shorts o Video normal)..."
                className="premium-input"
              />
              <div className="youtube-extracted-badge">
                <span>✨</span> YouTube ID: <strong>{extractYouTubeId(tipForm.youtubeUrl || tipForm.videoId || '')}</strong>
              </div>
            </div>

            <div className="form-field-group">
              <label className="form-field-label">Descripción Informativa:</label>
              <textarea 
                rows={3}
                value={tipForm.description || ''} 
                onChange={(e) => setTipForm({ ...tipForm, description: e.target.value })}
                placeholder="Resumen instructivo del tema..."
                className="premium-textarea"
              />
            </div>

            {/* Puntos Clave (Bullets) Dinámicos */}
            <div className="form-field-group">
              <label className="form-field-label">
                <span>Puntos Clave / Viñetas (Bullets):</span>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={handleAddBulletField}
                  style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                >
                  ➕ Añadir Punto Clave
                </button>
              </label>

              <div className="bullets-editor-list">
                {(tipForm.bullets || []).map((bullet, bIdx) => (
                  <div key={bIdx} className="bullet-editor-row">
                    <input 
                      type="text"
                      value={bullet}
                      onChange={(e) => handleBulletChange(bIdx, e.target.value)}
                      placeholder={`Punto clave ${bIdx + 1}...`}
                      className="premium-input"
                    />
                    {(tipForm.bullets || []).length > 1 && (
                      <button 
                        className="btn-remove-bullet"
                        onClick={() => handleRemoveBulletField(bIdx)}
                        title="Eliminar punto clave"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-primary"
                onClick={handleSaveTip}
                disabled={isSaving}
                style={{ padding: '12px 28px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <span>{isSaving ? '⏳' : '💾'}</span>
                <span>
                  {isSaving 
                    ? 'Guardando en Firestore...' 
                    : (editingTipIndex !== null ? 'Guardar Tema en Firestore' : 'Agregar y Guardar Tema en Firestore')}
                </span>
              </button>

              {editingTipIndex !== null && (
                <button 
                  className="btn btn-secondary"
                  disabled={isSaving}
                  onClick={() => {
                    setEditingTipIndex(null);
                    setTipForm({ tabLabel: '', icon: '🎬', title: '', youtubeUrl: '', description: '', bullets: [''] });
                  }}
                >
                  Cancelar Edición
                </button>
              )}
            </div>
          </div>

          {/* Lista de Tarjetas de Consejos Existentes */}
          <div className="tips-grid-list">
            <h4 style={{ color: '#ffffff', margin: '0 0 10px 0', fontSize: '1.15rem', fontWeight: 800 }}>
              Lista de Temas Configurados ({tipsList.length})
            </h4>

            {tipsList.map((tip, idx) => (
              <div key={tip.id || idx} className={`tip-card-item ${tip.visible === false ? 'hidden-state' : ''}`}>
                <div className="tip-card-left">
                  <div className="tip-card-icon-badge">{tip.icon}</div>
                  <div className="tip-card-meta">
                    <h4>
                      <span>{tip.title}</span>
                      <span className="tip-tab-chip">Pestaña: {tip.tabLabel}</span>
                    </h4>
                    <p>{tip.description || 'Sin descripción'}</p>
                    <div className="tip-card-bullets-preview">
                      <span className="bullet-pill-mini">📹 ID: {tip.videoId}</span>
                      {(tip.bullets || []).map((b, bIdx) => (
                        <span key={bIdx} className="bullet-pill-mini">✨ {b}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="tip-card-actions">
                  <button 
                    className="btn-icon-action"
                    onClick={() => handleMoveTip(idx, 'up')}
                    disabled={idx === 0}
                    title="Mover arriba"
                  >
                    ⬆️
                  </button>
                  <button 
                    className="btn-icon-action"
                    onClick={() => handleMoveTip(idx, 'down')}
                    disabled={idx === tipsList.length - 1}
                    title="Mover abajo"
                  >
                    ⬇️
                  </button>
                  <button 
                    className={`btn-icon-action ${tip.visible !== false ? 'visibility-on' : 'visibility-off'}`}
                    onClick={() => handleToggleVisibility(idx)}
                    title={tip.visible !== false ? 'Ocultar tema' : 'Mostrar tema'}
                  >
                    {tip.visible !== false ? '👁️ Visible' : '🙈 Oculto'}
                  </button>
                  <button 
                    className="btn-icon-action"
                    onClick={() => handleEditTip(idx)}
                    title="Editar tema"
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    className="btn-icon-action delete"
                    onClick={() => handleDeleteTip(idx)}
                    title="Eliminar tema"
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
        tipsList={tipsList}
      />

    </div>
  );
}
