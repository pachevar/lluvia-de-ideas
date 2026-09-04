import React, { useState, useRef, useEffect } from 'react';
import type { PortalConfig } from '../../types';
import { uploadImageWithFallback } from '../../utils/imageUpload';
import { saveArchetypeAsset, deleteArchetypeAsset } from '../../services/archetypeAssetsService';
import './AdminTabViajeDelHeroe.css';

interface AdminTabViajeDelHeroeProps {
  localConfig: PortalConfig | null;
  setLocalConfig: React.Dispatch<React.SetStateAction<PortalConfig | null>>;
}

const ARCHETYPES_LIST = [
  { id: 'protagonista', name: 'El Héroe / Protagonista', subtitle: 'Motor del cambio y portador del arco dramático', icon: '🦸' },
  { id: 'mentor', name: 'El Mentor', subtitle: 'Guardián de la sabiduría y catalizador moral', icon: '🧙‍♂️' },
  { id: 'sombra', name: 'La Sombra / El Antagonista', subtitle: 'Espejo oscuro y fuerza opuesta ineludible', icon: '🌑' },
  { id: 'aliado', name: 'El Aliado y el Escudero', subtitle: 'Ancla emocional y contrapunto humano', icon: '🛡️' },
  { id: 'heraldo', name: 'El Heraldo', subtitle: 'Llamada al cambio que destruye el statu quo', icon: '⚡' },
  { id: 'embaucador', name: 'El Camaleón / Embaucador', subtitle: 'Ambigüedad moral y sabiduría caótica', icon: '🎭' }
];

const JOURNEY_STAGES = [
  { id: 'mundo_ordinario', name: '01. El Mundo Ordinario', subtitle: 'Zona de confort y estado inicial', icon: '🏡' },
  { id: 'llamada_umbral', name: '02. La Llamada & El Umbral', subtitle: 'Ruptura del equilibrio y cruce a lo desconocido', icon: '⚡' },
  { id: 'abismo_crisis', name: '03. El Abismo / La Crisis', subtitle: 'Muerte del ego y confrontación suprema', icon: '🔥' },
  { id: 'transformacion', name: '04. La Transformación & El Elixir', subtitle: 'Renacimiento y sabiduría integrada', icon: '🌟' }
];

export default function AdminTabViajeDelHeroe({
  localConfig,
  setLocalConfig
}: AdminTabViajeDelHeroeProps) {
  const [activeSubTab, setActiveSubTab] = useState<'arquetipos' | 'etapas'>('arquetipos');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Auto-migración silenciosa de imágenes previas a la colección dedicada
  useEffect(() => {
    if (!localConfig) return;
    const archs = localConfig.archetypeImages || {};
    Object.entries(archs).forEach(([id, url]) => {
      if (url) {
        saveArchetypeAsset(id, url, 'archetype').catch(() => {});
      }
    });
    const stages = localConfig.journeyStageImages || {};
    Object.entries(stages).forEach(([id, url]) => {
      if (url) {
        saveArchetypeAsset(id, url, 'journey').catch(() => {});
      }
    });
  }, []);

  if (!localConfig) return null;

  const archetypeImages = localConfig.archetypeImages || {};
  const journeyImages = localConfig.journeyStageImages || {};

  const triggerFeedback = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 4500);
  };

  const handleFileUpload = async (id: string, file: File, type: 'archetype' | 'journey') => {
    if (!file) return;

    try {
      setUploadingId(id);

      const folder = type === 'archetype' ? 'archetypes-assets' : 'journey-assets';
      // Compresión optimizada para fichas (720x720, calidad 0.72) para mantener el peso en ~25-45KB
      const { url } = await uploadImageWithFallback(file, folder, 720, 720, 0.72);

      // Guardar en su propio documento individual en Firestore (hasta 1 MiB libre por asset)
      await saveArchetypeAsset(id, url, type);

      // Actualizar estado local
      if (type === 'archetype') {
        const updated = { ...archetypeImages, [id]: url };
        setLocalConfig(prev => prev ? { ...prev, archetypeImages: updated } : null);
        try {
          const localSaved = JSON.parse(localStorage.getItem('local_archetype_images') || '{}');
          localSaved[id] = url;
          localStorage.setItem('local_archetype_images', JSON.stringify(localSaved));
        } catch {}
      } else {
        const updated = { ...journeyImages, [id]: url };
        setLocalConfig(prev => prev ? { ...prev, journeyStageImages: updated } : null);
      }

      triggerFeedback('✓ ¡Imagen guardada permanentemente en Firestore!');
    } catch (err: any) {
      console.error('Error procesando imagen del viaje del héroe:', err);
      alert(`Error al procesar o guardar la imagen: ${err?.message || 'Error desconocido'}`);
    } finally {
      setUploadingId(null);
    }
  };

  const handleUrlChange = (id: string, url: string, type: 'archetype' | 'journey') => {
    if (type === 'archetype') {
      const updated = { ...archetypeImages, [id]: url };
      setLocalConfig(prev => prev ? { ...prev, archetypeImages: updated } : null);
    } else {
      const updated = { ...journeyImages, [id]: url };
      setLocalConfig(prev => prev ? { ...prev, journeyStageImages: updated } : null);
    }
  };

  const handleSaveUrl = async (id: string, type: 'archetype' | 'journey') => {
    try {
      const currentUrl = type === 'archetype' ? archetypeImages[id] : journeyImages[id];
      if (!currentUrl) return;

      await saveArchetypeAsset(id, currentUrl, type);

      if (type === 'archetype') {
        try {
          const localSaved = JSON.parse(localStorage.getItem('local_archetype_images') || '{}');
          localSaved[id] = currentUrl;
          localStorage.setItem('local_archetype_images', JSON.stringify(localSaved));
        } catch {}
      }

      triggerFeedback('✓ URL guardada y sincronizada en Firestore');
    } catch (err: any) {
      console.error('Error al guardar URL:', err);
      alert(`Error al guardar la URL en Firestore: ${err?.message || 'Error desconocido'}`);
    }
  };

  const handleRemove = async (id: string, type: 'archetype' | 'journey') => {
    try {
      await deleteArchetypeAsset(id);

      if (type === 'archetype') {
        const updated = { ...archetypeImages };
        delete updated[id];
        setLocalConfig(prev => prev ? { ...prev, archetypeImages: updated } : null);
        try {
          const localSaved = JSON.parse(localStorage.getItem('local_archetype_images') || '{}');
          delete localSaved[id];
          localStorage.setItem('local_archetype_images', JSON.stringify(localSaved));
        } catch {}
      } else {
        const updated = { ...journeyImages };
        delete updated[id];
        setLocalConfig(prev => prev ? { ...prev, journeyStageImages: updated } : null);
      }
      triggerFeedback('✓ Imagen eliminada de Firestore');
    } catch (err: any) {
      console.error('Error al remover imagen:', err);
      alert(`Error al eliminar de Firestore: ${err?.message || 'Error desconocido'}`);
    }
  };

  const handleSaveToDatabase = async () => {
    try {
      setSavingGlobal(true);
      // Guardar todos los arquetipos y etapas en sus documentos dedicados
      const promises: Promise<void>[] = [];
      Object.entries(archetypeImages).forEach(([id, url]) => {
        if (url) promises.push(saveArchetypeAsset(id, url, 'archetype'));
      });
      Object.entries(journeyImages).forEach(([id, url]) => {
        if (url) promises.push(saveArchetypeAsset(id, url, 'journey'));
      });
      await Promise.all(promises);

      triggerFeedback('✓ ¡Todos los arquetipos y etapas quedaron blindados en Firestore!');
    } catch (err: any) {
      console.error('Error al guardar en Firestore:', err);
      alert(`Error al sincronizar con Firestore: ${err?.message || 'Error desconocido'}`);
    } finally {
      setSavingGlobal(false);
    }
  };

  return (
    <div className="admin-viaje-container animate-fade-in">
      {/* Header Card con Botón Guardar en Producción */}
      <div className="admin-viaje-header-card">
        <div className="admin-viaje-header-text">
          <h3>🦸 El Viaje del Héroe & Arquetipos (Base de Datos Oficial)</h3>
          <p>
            Gestiona y publica las imágenes oficiales para las fichas de personajes y etapas dramáticas. Al subir una imagen o guardar una URL, queda <strong>almacenada permanentemente en Firestore y Firebase Storage</strong> y se transmite en tiempo real a la sección pública.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href="/creatika/construyendo-personaje"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-view-live-btn"
            title="Abrir la sección de personajes en una nueva pestaña"
          >
            👁️ Ver Sección en Vivo ↗
          </a>

          <button 
            className="admin-viaje-save-btn"
            onClick={handleSaveToDatabase}
            disabled={savingGlobal}
            title="Guardar toda la configuración en la base de datos"
          >
            <span>{savingGlobal ? '⏳ Guardando...' : '💾 Guardar en Base de Datos'}</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.2)',
          border: '1px solid #22c55e',
          color: '#86efac',
          padding: '14px 20px',
          borderRadius: '12px',
          fontWeight: 700,
          textAlign: 'center'
        }}>
          {saveSuccessMsg}
        </div>
      )}

      {/* Subtabs: Arquetipos vs Etapas */}
      <div className="admin-viaje-subtabs">
        <button
          className={`admin-subtab-btn ${activeSubTab === 'arquetipos' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('arquetipos')}
        >
          <span>🎭</span> Arquetipos de Personajes ({ARCHETYPES_LIST.length})
        </button>
        <button
          className={`admin-subtab-btn ${activeSubTab === 'etapas' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('etapas')}
        >
          <span>🗺️</span> Etapas del Viaje del Héroe ({JOURNEY_STAGES.length})
        </button>
      </div>

      {/* Sección 1: Arquetipos */}
      {activeSubTab === 'arquetipos' && (
        <div className="admin-archetypes-grid">
          {ARCHETYPES_LIST.map((arch) => {
            const currentImg = archetypeImages[arch.id] || '';
            const isUploadingThis = uploadingId === arch.id;

            return (
              <div key={arch.id} className="admin-arch-card">
                {/* Visual Banner Preview */}
                <div className="admin-arch-preview-wrap">
                  {currentImg ? (
                    <img 
                      src={currentImg} 
                      alt={arch.name} 
                      className="admin-arch-preview-img" 
                      loading="lazy" 
                    />
                  ) : (
                    <div className="admin-arch-default-box">
                      <span className="admin-arch-default-icon">{arch.icon}</span>
                      <small>Sin imagen configurada</small>
                    </div>
                  )}
                  <div className="admin-arch-preview-overlay" />
                  <span className="admin-arch-badge-tag">{arch.icon} {arch.name.split('/')[0]}</span>
                </div>

                {/* Body / Controls */}
                <div className="admin-arch-body">
                  <div>
                    <div className="admin-arch-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>{arch.name}</h4>
                      {currentImg && <span className="admin-saved-badge">✓ Guardado</span>}
                    </div>
                    <p className="admin-arch-subtitle">{arch.subtitle}</p>
                  </div>

                  {/* Acciones de Carga */}
                  <div className="admin-upload-actions-row">
                    <button
                      className="admin-file-upload-btn"
                      onClick={() => fileInputRefs.current[arch.id]?.click()}
                      disabled={isUploadingThis}
                    >
                      <span>📷</span> {isUploadingThis ? 'Comprimiendo y Subiendo...' : (currentImg ? 'Cambiar Imagen' : 'Subir Imagen')}
                    </button>

                    {currentImg && (
                      <button
                        className="admin-delete-img-btn"
                        onClick={() => handleRemove(arch.id, 'archetype')}
                        title="Eliminar imagen de la base de datos"
                      >
                        🗑️
                      </button>
                    )}

                    <input
                      ref={el => { fileInputRefs.current[arch.id] = el; }}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(arch.id, file, 'archetype');
                      }}
                    />
                  </div>

                  {/* Campo de URL Directa con Botón Guardar */}
                  <div className="admin-url-input-group">
                    <label>Enlace Directo (URL):</label>
                    <div className="admin-url-input-row">
                      <input
                        type="url"
                        className="admin-url-input"
                        placeholder="https://ejemplo.com/heroe.webp"
                        value={currentImg}
                        onChange={(e) => handleUrlChange(arch.id, e.target.value, 'archetype')}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveUrl(arch.id, 'archetype')}
                        onBlur={() => handleSaveUrl(arch.id, 'archetype')}
                      />
                      <button 
                        type="button" 
                        className="admin-url-save-btn" 
                        onClick={() => handleSaveUrl(arch.id, 'archetype')}
                        title="Guardar URL en la base de datos"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sección 2: Etapas del Viaje */}
      {activeSubTab === 'etapas' && (
        <div className="admin-archetypes-grid">
          {JOURNEY_STAGES.map((stage) => {
            const currentImg = journeyImages[stage.id] || '';
            const isUploadingThis = uploadingId === stage.id;

            return (
              <div key={stage.id} className="admin-arch-card">
                {/* Visual Banner Preview */}
                <div className="admin-arch-preview-wrap">
                  {currentImg ? (
                    <img 
                      src={currentImg} 
                      alt={stage.name} 
                      className="admin-arch-preview-img" 
                      loading="lazy" 
                    />
                  ) : (
                    <div className="admin-arch-default-box">
                      <span className="admin-arch-default-icon">{stage.icon}</span>
                      <small>Sin imagen configurada</small>
                    </div>
                  )}
                  <div className="admin-arch-preview-overlay" />
                  <span className="admin-arch-badge-tag">{stage.icon} {stage.name.split('.')[1] || stage.name}</span>
                </div>

                {/* Body / Controls */}
                <div className="admin-arch-body">
                  <div>
                    <div className="admin-arch-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>{stage.name}</h4>
                      {currentImg && <span className="admin-saved-badge">✓ Guardado</span>}
                    </div>
                    <p className="admin-arch-subtitle">{stage.subtitle}</p>
                  </div>

                  {/* Acciones de Carga */}
                  <div className="admin-upload-actions-row">
                    <button
                      className="admin-file-upload-btn"
                      onClick={() => fileInputRefs.current[stage.id]?.click()}
                      disabled={isUploadingThis}
                    >
                      <span>📷</span> {isUploadingThis ? 'Comprimiendo y Subiendo...' : (currentImg ? 'Cambiar Imagen' : 'Subir Imagen')}
                    </button>

                    {currentImg && (
                      <button
                        className="admin-delete-img-btn"
                        onClick={() => handleRemove(stage.id, 'journey')}
                        title="Eliminar imagen de la base de datos"
                      >
                        🗑️
                      </button>
                    )}

                    <input
                      ref={el => { fileInputRefs.current[stage.id] = el; }}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(stage.id, file, 'journey');
                      }}
                    />
                  </div>

                  {/* Campo de URL Directa con Botón Guardar */}
                  <div className="admin-url-input-group">
                    <label>Enlace Directo (URL):</label>
                    <div className="admin-url-input-row">
                      <input
                        type="url"
                        className="admin-url-input"
                        placeholder="https://ejemplo.com/etapa.webp"
                        value={currentImg}
                        onChange={(e) => handleUrlChange(stage.id, e.target.value, 'journey')}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveUrl(stage.id, 'journey')}
                        onBlur={() => handleSaveUrl(stage.id, 'journey')}
                      />
                      <button 
                        type="button" 
                        className="admin-url-save-btn" 
                        onClick={() => handleSaveUrl(stage.id, 'journey')}
                        title="Guardar URL en la base de datos"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
