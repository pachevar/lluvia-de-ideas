import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';
import type { PortalConfig, LandingCardConfig, LandingSectionConfig } from '../../types';

interface AdminTabInicioProps {
  localConfig: PortalConfig;
  setLocalConfig?: React.Dispatch<React.SetStateAction<PortalConfig | null>>;
  updateField: (section: string, field: string, value: any) => void;
  updateStory: (index: number, field: string, value: string) => void;
}

type SectionKey = 'sutz' | 'creatika' | 'tek100' | 'lab';

const SECTIONS_INFO: { key: SectionKey; label: string; icon: string }[] = [
  { key: 'sutz', label: 'Sutz Descubre', icon: '☁️' },
  { key: 'creatika', label: 'Creatika', icon: '🎨' },
  { key: 'tek100', label: '100tek', icon: '⚡' },
  { key: 'lab', label: 'LAB', icon: '🧪' }
];

export default function AdminTabInicio({ localConfig, updateField, setLocalConfig }: AdminTabInicioProps) {
  const [activeSectionTab, setActiveSectionTab] = useState<SectionKey>('sutz');
  const [uploadingSectionKey, setUploadingSectionKey] = useState<string | null>(null);

  // Helper to safely get landingConfig with fallbacks
  const landingConfig = localConfig.landingConfig || {};
  const cards = landingConfig.cards || {};
  const sections = landingConfig.sections || {};

  const handleUpdateCard = (key: SectionKey, field: keyof LandingCardConfig, value: string) => {
    if (setLocalConfig) {
      setLocalConfig(prev => {
        if (!prev) return null;
        const prevLanding = prev.landingConfig || {};
        const prevCards = prevLanding.cards || {};
        return {
          ...prev,
          landingConfig: {
            ...prevLanding,
            cards: {
              ...prevCards,
              [key]: {
                ...(prevCards[key] || {}),
                [field]: value
              }
            }
          }
        };
      });
    } else {
      updateField('landingConfig', 'cards', {
        ...cards,
        [key]: {
          ...(cards[key] || {}),
          [field]: value
        }
      });
    }
  };

  const handleUpdateSection = (key: SectionKey, field: keyof LandingSectionConfig, value: any) => {
    if (setLocalConfig) {
      setLocalConfig(prev => {
        if (!prev) return null;
        const prevLanding = prev.landingConfig || {};
        const prevSections = prevLanding.sections || {};
        return {
          ...prev,
          landingConfig: {
            ...prevLanding,
            sections: {
              ...prevSections,
              [key]: {
                ...(prevSections[key] || {}),
                [field]: value
              }
            }
          }
        };
      });
    } else {
      updateField('landingConfig', 'sections', {
        ...sections,
        [key]: {
          ...(sections[key] || {}),
          [field]: value
        }
      });
    }
  };

  const handleUpdateBullet = (key: SectionKey, bulletIdx: number, value: string) => {
    const currentBullets = [...(sections[key]?.bullets || ['', '', ''])];
    currentBullets[bulletIdx] = value;
    handleUpdateSection(key, 'bullets', currentBullets);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: SectionKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSectionKey(key);
    try {
      const fileRef = ref(storage, `landing-assets/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);
      handleUpdateSection(key, 'bgImage', downloadUrl);
    } catch (err) {
      console.error('Error subiendo imagen de fondo:', err);
      alert('Error al subir la imagen.');
    } finally {
      setUploadingSectionKey(null);
    }
  };

  return (
    <div className="admin-card card-glass animate-fade-in">
      <h3>🏠 Configuración de la Landing Page de Inicio</h3>
      <p className="tab-section-desc">
        Personaliza los textos de las 4 Fichas Principales, los contenidos de sus secciones descriptivas e imágenes de fondo.
      </p>

      <div className="admin-form-section">
        <h4>Encabezado General</h4>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Slogan de la Empresa</label>
            <input 
              type="text" 
              value={localConfig.hero.slogan} 
              onChange={(e) => updateField('hero', 'slogan', e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* Editor para las 4 Fichas Principales y Secciones */}
      <div className="admin-form-section">
        <h4>Editor de Fichas y Secciones Principales</h4>
        <p className="admin-section-help">
          Selecciona una de las 4 áreas para editar la tarjeta del encabezado, el texto descriptivo y la imagen de fondo.
        </p>

        {/* Tab Selector */}
        <div className="admin-stories-tabs" style={{ marginBottom: '20px' }}>
          {SECTIONS_INFO.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              className={`admin-story-tab-button ${activeSectionTab === key ? 'active' : ''}`}
              onClick={() => setActiveSectionTab(key)}
            >
              <span className="story-tab-icon">{icon}</span>
              <div className="story-tab-info">
                <span className="story-tab-title">{label}</span>
                <span className="story-tab-role">Ficha y Sección</span>
              </div>
            </button>
          ))}
        </div>

        {/* Form para la sección seleccionada */}
        {(() => {
          const key = activeSectionTab;
          const cardData = cards[key] || {};
          const sectionData = sections[key] || {};
          const bullets = sectionData.bullets || ['', '', ''];

          return (
            <div className="admin-nested-card active animate-fade-in" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(15, 23, 42, 0.4)' }}>
              
              {/* Bloque 1: Ficha Principal (Tarjeta) */}
              <h5 style={{ color: 'var(--primary-color, #a855f7)', marginTop: 0, marginBottom: '14px', fontSize: '1.1rem' }}>
                🎴 Contenido de la Ficha (Tarjeta Superior)
              </h5>
              <div className="admin-form-row two-cols">
                <div className="admin-form-group">
                  <label>Título de la Ficha</label>
                  <input
                    type="text"
                    value={cardData.title || ''}
                    onChange={(e) => handleUpdateCard(key, 'title', e.target.value)}
                    placeholder="Ej. Sutz Descubre"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Etiqueta / Badge Superior</label>
                  <input
                    type="text"
                    value={cardData.badge || ''}
                    onChange={(e) => handleUpdateCard(key, 'badge', e.target.value)}
                    placeholder="Ej. Mundo Virtual"
                  />
                </div>
              </div>

              <div className="admin-form-row two-cols">
                <div className="admin-form-group">
                  <label>Tag Idioma / Destacado</label>
                  <input
                    type="text"
                    value={cardData.kicheTag || ''}
                    onChange={(e) => handleUpdateCard(key, 'kicheTag', e.target.value)}
                    placeholder="Ej. Nube en K'iche'"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Descripción Corta de la Ficha</label>
                  <input
                    type="text"
                    value={cardData.desc || ''}
                    onChange={(e) => handleUpdateCard(key, 'desc', e.target.value)}
                    placeholder="Resumen breve para la tarjeta..."
                  />
                </div>
              </div>

              <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '24px 0' }} />

              {/* Bloque 2: Sección Descriptiva e Imagen de Fondo */}
              <h5 style={{ color: '#38bdf8', marginTop: 0, marginBottom: '14px', fontSize: '1.1rem' }}>
                📄 Sección Descriptiva e Imagen de Fondo
              </h5>

              <div className="admin-form-row two-cols">
                <div className="admin-form-group">
                  <label>Título de la Sección</label>
                  <input
                    type="text"
                    value={sectionData.title || ''}
                    onChange={(e) => handleUpdateSection(key, 'title', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Etiqueta de la Sección (Tag)</label>
                  <input
                    type="text"
                    value={sectionData.badge || ''}
                    onChange={(e) => handleUpdateSection(key, 'badge', e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form-group" style={{ marginBottom: '18px' }}>
                <label>Descripción Completa de la Sección</label>
                <textarea
                  rows={3}
                  value={sectionData.body || ''}
                  onChange={(e) => handleUpdateSection(key, 'body', e.target.value)}
                  placeholder="Texto descriptivo para la sección..."
                />
              </div>

              {/* Imagen de Fondo de la Sección */}
              <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                <label>🖼️ Imagen de Fondo para la Tarjeta de la Sección</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    style={{ flex: 1 }}
                    value={sectionData.bgImage || ''}
                    onChange={(e) => handleUpdateSection(key, 'bgImage', e.target.value)}
                    placeholder="URL de la imagen o sube un archivo..."
                  />
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                    {uploadingSectionKey === key ? 'Subiendo...' : '📁 Subir Imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageUpload(e, key)}
                      disabled={uploadingSectionKey === key}
                    />
                  </label>
                </div>
                {sectionData.bgImage && (
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={sectionData.bgImage} 
                      alt="Vista previa" 
                      style={{ maxHeight: '100px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }} 
                    />
                  </div>
                )}
              </div>

              {/* Puntos Clave (Bullets) */}
              <div className="admin-form-group">
                <label>📌 Puntos Clave (Bullets)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                  <input
                    type="text"
                    value={bullets[0] || ''}
                    onChange={(e) => handleUpdateBullet(key, 0, e.target.value)}
                    placeholder="Punto 1..."
                  />
                  <input
                    type="text"
                    value={bullets[1] || ''}
                    onChange={(e) => handleUpdateBullet(key, 1, e.target.value)}
                    placeholder="Punto 2..."
                  />
                  <input
                    type="text"
                    value={bullets[2] || ''}
                    onChange={(e) => handleUpdateBullet(key, 2, e.target.value)}
                    placeholder="Punto 3..."
                  />
                </div>
              </div>

            </div>
          );
        })()}

      </div>

    </div>
  );
}
