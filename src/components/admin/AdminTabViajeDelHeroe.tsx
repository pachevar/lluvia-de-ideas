import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { PortalConfig } from '../../types';
import { uploadImageWithFallback } from '../../utils/imageUpload';
import { saveArchetypeAsset, deleteArchetypeAsset } from '../../services/archetypeAssetsService';
import ImageFramingModal from '../common/ImageFramingModal';
import './AdminTabViajeDelHeroe.css';

interface AdminTabViajeDelHeroeProps {
  localConfig: PortalConfig | null;
  setLocalConfig: React.Dispatch<React.SetStateAction<PortalConfig | null>>;
}

export interface CanonicalArchetypeAdminItem {
  id: string;
  alias?: string;
  name: string;
  subtitle: string;
  icon: string;
  category: 'luz' | 'sombra' | 'catalizador';
  color: string;
}

export const ARCHETYPES_LIST: CanonicalArchetypeAdminItem[] = [
  {
    id: 'heroe',
    alias: 'protagonista',
    name: 'El Héroe / La Heroína',
    subtitle: 'Motor del cambio, superación y sacrificio ético',
    icon: '🦸',
    category: 'luz',
    color: '#38bdf8'
  },
  {
    id: 'mentor',
    name: 'El Mentor / El Sabio',
    subtitle: 'Guardián del saber, guía y catalizador moral',
    icon: '🧙‍♂️',
    category: 'luz',
    color: '#a855f7'
  },
  {
    id: 'sombra',
    name: 'La Sombra / El Antagonista',
    subtitle: 'El espejo oscuro y la fuerza opuesta ineludible',
    icon: '🌑',
    category: 'sombra',
    color: '#f43f5e'
  },
  {
    id: 'picaro',
    alias: 'embaucador',
    name: 'El Pícaro / Embaucador',
    subtitle: 'El bufón sagrado, burla al ego y sabiduría caótica',
    icon: '🃏',
    category: 'catalizador',
    color: '#fb923c'
  },
  {
    id: 'guardian',
    name: 'El Guardián del Umbral',
    subtitle: 'La prueba de acceso, centinela y filtro de madurez',
    icon: '🚪',
    category: 'sombra',
    color: '#eab308'
  },
  {
    id: 'aliado',
    name: 'El Aliado / El Escudero',
    subtitle: 'El ancla de humanidad, lealtad y contrapunto ético',
    icon: '🤝',
    category: 'luz',
    color: '#22c55e'
  },
  {
    id: 'camaleon',
    name: 'El Camaleón / El Metamorfo',
    subtitle: 'La duda magnética, máscara móvil y lealtad incierta',
    icon: '🦎',
    category: 'sombra',
    color: '#06b6d4'
  },
  {
    id: 'heraldo',
    name: 'El Heraldo / El Mensajero',
    subtitle: 'El trueno del cambio y llamada inevitable a la aventura',
    icon: '⚡',
    category: 'catalizador',
    color: '#f97316'
  },
  {
    id: 'inocente',
    name: 'El Inocente / El Soñador',
    subtitle: 'La mirada pura, fe incorruptible y anhelo de armonía',
    icon: '🕊️',
    category: 'luz',
    color: '#38bdf8'
  },
  {
    id: 'rebelde',
    name: 'El Rebelde / El Forajido',
    subtitle: 'La ruptura de cadenas, fuego revolucionario y transgresión',
    icon: '🔥',
    category: 'sombra',
    color: '#ef4444'
  },
  {
    id: 'amante',
    name: 'El Amante / El Conector',
    subtitle: 'La devoción pasional, vulnerabilidad y búsqueda de unión',
    icon: '💖',
    category: 'catalizador',
    color: '#ec4899'
  },
  {
    id: 'soberano',
    name: 'El Soberano / El Gobernante',
    subtitle: 'La responsabilidad del orden, prosperidad y legado',
    icon: '👑',
    category: 'luz',
    color: '#eab308'
  }
];

export const JOURNEY_STAGES = [
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
  const [archetypeCategoryFilter, setArchetypeCategoryFilter] = useState<'todos' | 'luz' | 'sombra' | 'catalizador'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Estado del modal interactivo de encuadre y centrado
  const [framingItem, setFramingItem] = useState<{
    id: string;
    type: 'archetype' | 'journey';
    title: string;
    imageSrc: string | File;
  } | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Auto-migración silenciosa y sincronización de alias al montar
  useEffect(() => {
    if (!localConfig) return;
    const archs = localConfig.archetypeImages || {};
    Object.entries(archs).forEach(([id, url]) => {
      if (url) {
        saveArchetypeAsset(id, url, 'archetype').catch(() => {});
        // Mantener sincronizados los alias
        if (id === 'heroe') saveArchetypeAsset('protagonista', url, 'archetype').catch(() => {});
        if (id === 'protagonista') saveArchetypeAsset('heroe', url, 'archetype').catch(() => {});
        if (id === 'picaro') saveArchetypeAsset('embaucador', url, 'archetype').catch(() => {});
        if (id === 'embaucador') saveArchetypeAsset('picaro', url, 'archetype').catch(() => {});
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

  // Resuelve la URL considerando ID primario y alias histórico
  const resolveArchetypeUrl = (item: CanonicalArchetypeAdminItem) => {
    if (archetypeImages[item.id]) return archetypeImages[item.id];
    if (item.alias && archetypeImages[item.alias]) return archetypeImages[item.alias];
    return '';
  };

  const handleFileUpload = async (id: string, file: File, type: 'archetype' | 'journey') => {
    if (!file) return;

    try {
      setUploadingId(id);

      const folder = type === 'archetype' ? 'archetypes-assets' : 'journey-assets';
      // Compresión WebP optimizada: 800x800 con calidad 0.78, asegurando nitidez y peso liviano (~30-50KB)
      const { url } = await uploadImageWithFallback(file, folder, 800, 800, 0.78);

      // Guardar en su propio documento individual en Firestore (hasta 1 MiB libre por asset)
      await saveArchetypeAsset(id, url, type);

      // Si es arquetipo con alias, asegurar sincronización bidireccional en Firestore
      if (type === 'archetype') {
        const item = ARCHETYPES_LIST.find(a => a.id === id || a.alias === id);
        const aliasId = item?.alias && item.id === id ? item.alias : (item?.id !== id ? item?.id : null);
        if (aliasId) {
          await saveArchetypeAsset(aliasId, url, 'archetype');
        }

        const updated = {
          ...archetypeImages,
          [id]: url,
          ...(aliasId ? { [aliasId]: url } : {})
        };
        setLocalConfig(prev => prev ? { ...prev, archetypeImages: updated } : null);

        try {
          const localSaved = JSON.parse(localStorage.getItem('local_archetype_images') || '{}');
          localSaved[id] = url;
          if (aliasId) localSaved[aliasId] = url;
          localStorage.setItem('local_archetype_images', JSON.stringify(localSaved));
        } catch {}
      } else {
        const updated = { ...journeyImages, [id]: url };
        setLocalConfig(prev => prev ? { ...prev, journeyStageImages: updated } : null);
      }

      triggerFeedback('✓ ¡Imagen comprimida y guardada permanentemente en Firestore y Firebase Storage!');
    } catch (err: any) {
      console.error('Error procesando imagen del arquetipo:', err);
      alert(`Error al procesar o guardar la imagen: ${err?.message || 'Error desconocido'}`);
    } finally {
      setUploadingId(null);
    }
  };

  const handleFramingSave = async (framedFile: File) => {
    if (!framingItem) return;
    const { id, type } = framingItem;
    setFramingItem(null);
    await handleFileUpload(id, framedFile, type);
  };

  const handleUrlChange = (id: string, url: string, type: 'archetype' | 'journey') => {
    if (type === 'archetype') {
      const item = ARCHETYPES_LIST.find(a => a.id === id || a.alias === id);
      const aliasId = item?.alias && item.id === id ? item.alias : (item?.id !== id ? item?.id : null);
      const updated = {
        ...archetypeImages,
        [id]: url,
        ...(aliasId ? { [aliasId]: url } : {})
      };
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
        const item = ARCHETYPES_LIST.find(a => a.id === id || a.alias === id);
        const aliasId = item?.alias && item.id === id ? item.alias : (item?.id !== id ? item?.id : null);
        if (aliasId) {
          await saveArchetypeAsset(aliasId, currentUrl, 'archetype');
        }

        try {
          const localSaved = JSON.parse(localStorage.getItem('local_archetype_images') || '{}');
          localSaved[id] = currentUrl;
          if (aliasId) localSaved[aliasId] = currentUrl;
          localStorage.setItem('local_archetype_images', JSON.stringify(localSaved));
        } catch {}
      }

      triggerFeedback('✓ URL guardada y sincronizada permanentemente en Firestore');
    } catch (err: any) {
      console.error('Error al guardar URL:', err);
      alert(`Error al guardar la URL en Firestore: ${err?.message || 'Error desconocido'}`);
    }
  };

  const handleRemove = async (id: string, type: 'archetype' | 'journey') => {
    try {
      await deleteArchetypeAsset(id);

      if (type === 'archetype') {
        const item = ARCHETYPES_LIST.find(a => a.id === id || a.alias === id);
        const aliasId = item?.alias && item.id === id ? item.alias : (item?.id !== id ? item?.id : null);
        if (aliasId) {
          await deleteArchetypeAsset(aliasId).catch(() => {});
        }

        const updated = { ...archetypeImages };
        delete updated[id];
        if (aliasId) delete updated[aliasId];

        setLocalConfig(prev => prev ? { ...prev, archetypeImages: updated } : null);
        try {
          const localSaved = JSON.parse(localStorage.getItem('local_archetype_images') || '{}');
          delete localSaved[id];
          if (aliasId) delete localSaved[aliasId];
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
      const promises: Promise<void>[] = [];
      Object.entries(archetypeImages).forEach(([id, url]) => {
        if (url) promises.push(saveArchetypeAsset(id, url, 'archetype'));
      });
      Object.entries(journeyImages).forEach(([id, url]) => {
        if (url) promises.push(saveArchetypeAsset(id, url, 'journey'));
      });
      await Promise.all(promises);

      triggerFeedback('✓ ¡Todos los 12 arquetipos y etapas quedaron blindados permanentemente en Firestore!');
    } catch (err: any) {
      console.error('Error al guardar en Firestore:', err);
      alert(`Error al sincronizar con Firestore: ${err?.message || 'Error desconocido'}`);
    } finally {
      setSavingGlobal(false);
    }
  };

  // Filtrado de arquetipos en Gerencia
  const filteredArchetypes = useMemo(() => {
    return ARCHETYPES_LIST.filter(arch => {
      const matchCat = archetypeCategoryFilter === 'todos' || arch.category === archetypeCategoryFilter;
      const matchQuery =
        arch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        arch.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        arch.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [archetypeCategoryFilter, searchQuery]);

  return (
    <div className="admin-viaje-container animate-fade-in">
      {/* Header Card con Botón Guardar en Producción */}
      <div className="admin-viaje-header-card">
        <div className="admin-viaje-header-text">
          <h3>🦸 Galería Canónica de Arquetipos & Viaje del Héroe (Gerencia)</h3>
          <p>
            Desde aquí administras de forma oficial y centralizada las ilustraciones canónicas de los <strong>12 arquetipos clásicos</strong> y las <strong>4 etapas dramáticas</strong>.
            Cada archivo se <strong>optimiza automáticamente a formato WebP ligero</strong> y se guarda permanentemente en <strong>Firebase Storage y Firestore</strong>,
            alimentando en tiempo real la página pública de <em>Creación de Personajes</em> sin riesgo de desincronización.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href="/creatika/creacion-de-personajes"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-view-live-btn"
            title="Abrir la sección de Creación de Personajes en una nueva pestaña"
          >
            👁️ Ver Creación de Personajes ↗
          </a>

          <button 
            className="admin-viaje-save-btn"
            onClick={handleSaveToDatabase}
            disabled={savingGlobal}
            title="Guardar y blindar toda la configuración en Firestore"
          >
            <span>{savingGlobal ? '⏳ Guardando...' : '💾 Blindar Todo en Firestore'}</span>
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
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>✅</span> {saveSuccessMsg}
        </div>
      )}

      {/* Sub-pestañas: Arquetipos Canónicos vs Etapas del Viaje */}
      <div className="admin-viaje-subtabs">
        <button 
          className={`admin-subtab-btn ${activeSubTab === 'arquetipos' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('arquetipos')}
        >
          <span>🎭</span> 12 Arquetipos Canónicos ({ARCHETYPES_LIST.length})
        </button>
        <button 
          className={`admin-subtab-btn ${activeSubTab === 'etapas' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('etapas')}
        >
          <span>🗺️</span> 4 Etapas del Viaje del Héroe ({JOURNEY_STAGES.length})
        </button>
      </div>

      {/* Sección 1: 12 Arquetipos Canónicos */}
      {activeSubTab === 'arquetipos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Barra de Filtros y Búsqueda en Gerencia */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '14px',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '14px 20px',
            borderRadius: '16px'
          }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'todos', label: 'Todos (12)' },
                { id: 'luz', label: '☀️ Orden & Guía (5)' },
                { id: 'sombra', label: '🌑 Sombras & Retos (4)' },
                { id: 'catalizador', label: '⚡ Catalizadores (3)' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setArchetypeCategoryFilter(cat.id as any)}
                  style={{
                    background: archetypeCategoryFilter === cat.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.06)',
                    color: archetypeCategoryFilter === cat.id ? '#090e1a' : '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '7px 14px',
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div style={{ flex: '1 1 240px', maxWidth: '340px' }}>
              <input
                type="text"
                placeholder="Buscar arquetipo por nombre o función..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(2, 6, 23, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: '10px',
                  color: '#fff',
                  padding: '8px 14px',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          {/* Cuadrícula de Arquetipos */}
          <div className="admin-archetypes-grid">
            {filteredArchetypes.map((arch) => {
              const currentImg = resolveArchetypeUrl(arch);
              const isUploadingThis = uploadingId === arch.id;

              return (
                <div key={arch.id} className="admin-arch-card" style={{ borderColor: currentImg ? `${arch.color}55` : undefined }}>
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
                        <small>Sin imagen oficial (Usa fallback público)</small>
                      </div>
                    )}
                    <div className="admin-arch-preview-overlay" />
                    <span className="admin-arch-badge-tag" style={{ borderLeft: `3px solid ${arch.color}` }}>
                      {arch.icon} {arch.name.split('/')[0].trim()}
                    </span>
                  </div>

                  {/* Body / Controls */}
                  <div className="admin-arch-body">
                    <div>
                      <div className="admin-arch-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc' }}>{arch.name}</h4>
                        {currentImg ? (
                          <span className="admin-saved-badge">✓ Guardado</span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                            Por Defecto
                          </span>
                        )}
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
                        <span>📷</span> {isUploadingThis ? 'Comprimiendo WebP...' : (currentImg ? 'Cambiar Imagen' : 'Subir Imagen')}
                      </button>

                      {currentImg && (
                        <button
                          className="admin-framing-btn"
                          onClick={() => setFramingItem({
                            id: arch.id,
                            type: 'archetype',
                            title: `Encuadrar y Centrar: ${arch.name}`,
                            imageSrc: currentImg
                          })}
                          title="Ajustar encuadre, zoom y rotación de esta imagen"
                        >
                          <span>🎯</span> Centrar
                        </button>
                      )}

                      {currentImg && (
                        <button
                          className="admin-delete-img-btn"
                          onClick={() => handleRemove(arch.id, 'archetype')}
                          title="Eliminar imagen personalizada de la base de datos"
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
                          if (file) {
                            setFramingItem({
                              id: arch.id,
                              type: 'archetype',
                              title: `Encuadrar y Centrar: ${arch.name}`,
                              imageSrc: file
                            });
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>

                    {/* Campo de URL Directa con Botón Guardar */}
                    <div className="admin-url-input-group">
                      <label>Enlace Directo (URL o CDN):</label>
                      <div className="admin-url-input-row">
                        <input
                          type="url"
                          className="admin-url-input"
                          placeholder="https://ejemplo.com/arquetipo.webp"
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
        </div>
      )}

      {/* Sección 2: Etapas del Viaje del Héroe */}
      {activeSubTab === 'etapas' && (
        <div className="admin-archetypes-grid">
          {JOURNEY_STAGES.map((stage) => {
            const currentImg = journeyImages[stage.id] || '';
            const isUploadingThis = uploadingId === stage.id;

            return (
              <div key={stage.id} className="admin-arch-card">
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
                  <span className="admin-arch-badge-tag">{stage.icon} {stage.name}</span>
                </div>

                <div className="admin-arch-body">
                  <div>
                    <div className="admin-arch-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>{stage.name}</h4>
                      {currentImg && <span className="admin-saved-badge">✓ Guardado</span>}
                    </div>
                    <p className="admin-arch-subtitle">{stage.subtitle}</p>
                  </div>

                  <div className="admin-upload-actions-row">
                    <button
                      className="admin-file-upload-btn"
                      onClick={() => fileInputRefs.current[stage.id]?.click()}
                      disabled={isUploadingThis}
                    >
                      <span>📷</span> {isUploadingThis ? 'Comprimiendo WebP...' : (currentImg ? 'Cambiar Imagen' : 'Subir Imagen')}
                    </button>

                    {currentImg && (
                      <button
                        className="admin-framing-btn"
                        onClick={() => setFramingItem({
                          id: stage.id,
                          type: 'journey',
                          title: `Encuadrar y Centrar: ${stage.name}`,
                          imageSrc: currentImg
                        })}
                        title="Ajustar encuadre, zoom y rotación de esta etapa"
                      >
                        <span>🎯</span> Centrar
                      </button>
                    )}

                    {currentImg && (
                      <button
                        className="admin-delete-img-btn"
                        onClick={() => handleRemove(stage.id, 'journey')}
                        title="Eliminar imagen de la etapa"
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
                        if (file) {
                          setFramingItem({
                            id: stage.id,
                            type: 'journey',
                            title: `Encuadrar y Centrar: ${stage.name}`,
                            imageSrc: file
                          });
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>

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

      {/* Módulo de Encuadre y Centrado Profesional */}
      <ImageFramingModal
        isOpen={!!framingItem}
        imageSrc={framingItem?.imageSrc || null}
        title={framingItem?.title || 'Encuadre y Centrado Profesional'}
        subtitle="Arrastra la imagen para centrar el área focal, haz zoom o rota según sea necesario."
        aspectRatio={1}
        targetWidth={800}
        targetHeight={800}
        onSave={handleFramingSave}
        onClose={() => setFramingItem(null)}
      />
    </div>
  );
}
