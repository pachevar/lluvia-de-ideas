import React, { useState, useEffect, useRef } from 'react';
import type { User } from 'firebase/auth';
import type { UserProfile } from '../../context/AuthContext';
import type { StudentArtItem, ArtTechnique } from '../../types';
import ImageFramingModal from '../common/ImageFramingModal';
import { uploadImageWithFallback } from '../../utils/imageUpload';
import { soundEffects } from '../../utils/soundEffects';
import './ObraEditorModal.css';

interface ObraEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newArt: StudentArtItem) => Promise<void> | void;
  initialData?: Partial<StudentArtItem>;
  currentUser?: User | null;
  userProfile?: UserProfile | null;
  centralFolderUrl?: string; // Enlace a la carpeta central de Google Drive
}

export const ObraEditorModal: React.FC<ObraEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  currentUser,
  userProfile,
  centralFolderUrl
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form states
  const [title, setTitle] = useState(initialData?.title || '');
  const [technique, setTechnique] = useState<ArtTechnique>(initialData?.technique || 'digital');
  const [dimensions, setDimensions] = useState(initialData?.dimensions || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [imageUrl, setImageUrl] = useState<string>(initialData?.imageUrl || '');
  const [driveUrl, setDriveUrl] = useState<string>(initialData?.driveUrl || '');

  // Framing & Upload states
  const [imageFramingSource, setImageFramingSource] = useState<File | string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Session / Artist identity
  const userFallbackName = userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Artista Escolar';
  const [usePseudonym, setUsePseudonym] = useState<boolean>(
    Boolean(initialData?.artist && initialData.artist !== 'Artista Escolar' && initialData.artist !== userFallbackName)
  );
  const [pseudonym, setPseudonym] = useState<string>(
    initialData?.artist && initialData.artist !== 'Artista Escolar' ? initialData.artist : ''
  );

  const artistPseudonyms = [
    'Pincel del Viento',
    'Paleta Cósmica',
    'Sombra y Luz',
    'Matiz de Selva',
    'Ojo de Obsidiana',
    'Color de Jaguar',
    'Trazo Celeste',
    'Alquimista Visual'
  ];

  const handleRandomPseudonym = () => {
    soundEffects.playClick();
    const randomIndex = Math.floor(Math.random() * artistPseudonyms.length);
    setPseudonym(artistPseudonyms[randomIndex]);
    if (!usePseudonym) setUsePseudonym(true);
  };

  // Synchronize on initialData changes
  useEffect(() => {
    if (initialData) {
      if (initialData.title !== undefined) setTitle(initialData.title);
      if (initialData.technique !== undefined) setTechnique(initialData.technique);
      if (initialData.dimensions !== undefined) setDimensions(initialData.dimensions);
      if (initialData.description !== undefined) setDescription(initialData.description);
      if (initialData.imageUrl !== undefined) setImageUrl(initialData.imageUrl);
      if (initialData.driveUrl !== undefined) setDriveUrl(initialData.driveUrl);
      if (initialData.artist) {
        setPseudonym(initialData.artist);
        setUsePseudonym(initialData.artist !== userFallbackName);
      }
    }
  }, [initialData, userFallbackName]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !imageFramingSource) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, imageFramingSource]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Por favor escribe un título para tu obra.');
      return;
    }
    if (!imageUrl.trim()) {
      alert('Por favor selecciona o sube la imagen de tu obra artística.');
      return;
    }

    const resolvedArtist = usePseudonym
      ? (pseudonym.trim() || 'Artista Anónimo')
      : userFallbackName;
    const resolvedSchool = userProfile?.institution || initialData?.artistSchool || 'Comunidad Estudiantil Sutz';

    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const calculatedStatus = initialData?.status || (driveUrl.trim() ? 'pendiente_revision' : 'aprobado');

      const newArtwork: StudentArtItem = {
        id: initialData?.id || `art-${Date.now()}`,
        title: title.trim(),
        artist: resolvedArtist,
        artistGrade: initialData?.artistGrade || '',
        artistSchool: resolvedSchool,
        technique,
        dimensions: dimensions.trim() || 'Técnica libre',
        description: description.trim() || 'Obra artística creada para la Gran Galería escolar.',
        imageUrl: imageUrl.trim(),
        awardBadge: initialData?.awardBadge || '',
        concursoId: initialData?.concursoId || '',
        likes: initialData?.likes || 0,
        views: initialData?.views || 1,
        featured: initialData?.featured || false,
        publishedAt: initialData?.publishedAt || now,
        driveUrl: driveUrl.trim() || undefined,
        status: calculatedStatus,
        authorEmail: currentUser?.email || undefined
      };

      await onSave(newArtwork);
      soundEffects.playSuccessFanfare();
      onClose();
    } catch (err) {
      console.error('[ObraEditorModal] Error guardando la obra:', err);
      alert('Hubo un problema al guardar la obra. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const getTechniqueLabel = (tech: ArtTechnique) => {
    switch (tech) {
      case 'digital': return 'Ilustración Digital';
      case 'acuarela': return 'Acuarela';
      case 'oleo': return 'Óleo / Lienzo';
      case 'lapiz': return 'Grafito / Lápiz';
      case 'mixta': return 'Técnica Mixta';
      case 'escultura': return 'Escultura / Modelado';
      case 'pastel': return 'Pastel / Tizas';
      case 'grabado': return 'Grabado / Xilografía';
      default: return tech;
    }
  };

  return (
    <div className="gg-modal-overlay obra-editor-overlay" onClick={onClose}>
      <div 
        className="obra-editor-container" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* HEADER */}
        <header className="obra-editor-header">
          <div className="obra-header-title">
            <span className="obra-header-icon">🎨</span>
            <div>
              <h2>Taller de Artes Visuales · Crear Gran Obra</h2>
              <p>Sube tu pintura, ilustración o escultura a la Gran Galería escolar</p>
            </div>
          </div>

          <div className="obra-header-actions">
            <div className="obra-tabs-switch">
              <button
                type="button"
                className={`obra-tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
                onClick={() => {
                  soundEffects.playClick();
                  setActiveTab('editor');
                }}
              >
                <span>🖌️</span>
                <span>Ficha & Lienzo</span>
              </button>
              <button
                type="button"
                className={`obra-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => {
                  soundEffects.playClick();
                  setActiveTab('preview');
                }}
              >
                <span>👁️</span>
                <span>Vista en Museo</span>
              </button>
            </div>

            <button
              type="button"
              className="obra-close-btn"
              onClick={() => {
                soundEffects.playClick();
                onClose();
              }}
              aria-label="Cerrar taller"
            >
              ✕
            </button>
          </div>
        </header>

        {/* BODY */}
        <div className="obra-editor-body">
          {activeTab === 'editor' ? (
            <form id="obra-form" onSubmit={handleSubmit} className="obra-form-layout">
              {/* SESIÓN DEL ARTISTA */}
              <div className="obra-session-badge-bar">
                <span className="session-user-badge">
                  🟢 Artista: <strong>{userFallbackName}</strong>
                  {userProfile?.institution && <small> · {userProfile.institution}</small>}
                </span>
                <span className="session-mode-note">
                  ✨ Obra vinculada a tu cuenta en la Gran Galería
                </span>
              </div>

              {/* BLOQUE PRINCIPAL: ESTUDIO DE LIENZO Y FICHA TÉCNICA */}
              <div className="obra-hero-studio-row">
                {/* COLUMNA 1: LIENZO Y SUBIDA DE LA IMAGEN */}
                <div className="obra-canvas-studio-col">
                  <div className="obra-canvas-card">
                    <span className="obra-canvas-label">🖼️ Lienzo / Fotografía de la Obra *</span>

                    <div
                      className={`obra-canvas-preview-box ${imageUrl ? 'has-art' : ''}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) setImageFramingSource(file);
                      }}
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      title="Haz clic para seleccionar o cambiar la imagen"
                    >
                      {imageUrl ? (
                        <div className="canvas-art-wrapper">
                          <img src={imageUrl} alt={title || 'Obra artística'} className="canvas-art-img" />
                          <div className="canvas-art-hover-overlay">
                            <span>🔄 Cambiar o Re-encuadrar</span>
                          </div>
                        </div>
                      ) : (
                        <div className="canvas-art-placeholder">
                          <span className="placeholder-art-icon">🎨</span>
                          <strong>Cargar Fotografía o Ilustración</strong>
                          <small>Arrastra o haz clic aquí<br />Formatos: JPG, PNG, WEBP</small>
                          <span className="canvas-framing-badge">📐 Encuadre libre y alta resolución</span>
                        </div>
                      )}
                    </div>

                    <div className="obra-canvas-cta-row">
                      <button
                        type="button"
                        className="btn btn-primary obra-upload-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        disabled={isUploadingImage}
                      >
                        <span>{isUploadingImage ? '⏳' : '🖼️'}</span>
                        <span>{isUploadingImage ? 'Procesando...' : (imageUrl ? 'Cambiar Imagen' : 'Elegir Imagen')}</span>
                      </button>

                      {imageUrl && (
                        <button
                          type="button"
                          className="btn btn-danger obra-clear-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            soundEffects.playClick();
                            setImageUrl('');
                          }}
                          title="Eliminar imagen"
                        >
                          🗑️
                        </button>
                      )}
                    </div>

                    <input
                      id="obra-file-input"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setImageFramingSource(file);
                        e.target.value = '';
                      }}
                    />
                  </div>
                </div>

                {/* COLUMNA 2: FICHA TÉCNICA Y DATOS DE LA OBRA */}
                <div className="obra-metadata-col">
                  {/* Título de la Obra */}
                  <div className="obra-field">
                    <label htmlFor="obra-title">📌 Título de la Obra *</label>
                    <input
                      id="obra-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ejemplo: El Susurro de las Ceibas Sagradas"
                      required
                    />
                  </div>

                  {/* Técnica y Dimensiones */}
                  <div className="obra-fields-row">
                    <div className="obra-field">
                      <label htmlFor="obra-technique">🎨 Técnica Artística *</label>
                      <select
                        id="obra-technique"
                        value={technique}
                        onChange={(e) => setTechnique(e.target.value as ArtTechnique)}
                      >
                        <option value="digital">💻 Ilustración Digital</option>
                        <option value="acuarela">🖌️ Acuarela</option>
                        <option value="oleo">🎨 Óleo / Lienzo</option>
                        <option value="lapiz">✏️ Grafito / Lápiz</option>
                        <option value="mixta">🧩 Técnica Mixta</option>
                        <option value="escultura">🗿 Escultura / Modelado</option>
                        <option value="pastel">🖍️ Pastel / Tizas</option>
                        <option value="grabado">📜 Grabado / Xilografía</option>
                      </select>
                    </div>

                    <div className="obra-field">
                      <label htmlFor="obra-dimensions">📏 Dimensiones / Formato</label>
                      <input
                        id="obra-dimensions"
                        type="text"
                        value={dimensions}
                        onChange={(e) => setDimensions(e.target.value)}
                        placeholder="Ej: 50 x 70 cm, A3 o 3840x2160 px"
                      />
                    </div>
                  </div>

                  {/* Firma / Seudónimo del Artista */}
                  <div className="obra-pseudonym-card">
                    <div className="pseudonym-checkbox-row">
                      <input
                        id="obra-use-pseudonym"
                        type="checkbox"
                        checked={usePseudonym}
                        onChange={(e) => setUsePseudonym(e.target.checked)}
                      />
                      <label htmlFor="obra-use-pseudonym">
                        Firmar con un <strong>Seudónimo o Firma Artística</strong>
                      </label>
                    </div>

                    {usePseudonym && (
                      <div className="pseudonym-input-group animate-fade-in">
                        <input
                          type="text"
                          value={pseudonym}
                          onChange={(e) => setPseudonym(e.target.value)}
                          placeholder="Tu firma artística o seudónimo..."
                          maxLength={35}
                        />
                        <button
                          type="button"
                          className="pseudonym-dice-btn"
                          onClick={handleRandomPseudonym}
                          title="Sugerir firma artística"
                        >
                          🎲 Sugerir
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Declaración de la Obra / Inspiración */}
                  <div className="obra-field obra-field-statement">
                    <label htmlFor="obra-description">
                      📝 Declaración del Artista / Inspiración de la Obra
                    </label>
                    <textarea
                      id="obra-description"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Comparte la historia detrás de tu creación: ¿Qué te inspiró? ¿Qué mensaje o emociones buscas transmitir con los colores y formas? ¿Qué materiales utilizaste?"
                    />
                  </div>

                  {/* CONSERVACIÓN EN ALTA RESOLUCIÓN: CARPETA CENTRAL GOOGLE DRIVE */}
                  <div className="obra-drive-card">
                    <div className="obra-drive-card-header">
                      <div className="obra-drive-title-area">
                        <span className="obra-drive-icon">📁</span>
                        <div>
                          <div className="obra-drive-badge-line">
                            <span className="obra-drive-badge">Conservación & Imprenta</span>
                            {driveUrl && <span className="obra-drive-linked-badge">✓ Máster Vinculado</span>}
                          </div>
                          <h4 className="obra-drive-title">Fotografía Original en Alta Resolución (Google Drive)</h4>
                        </div>
                      </div>

                      {centralFolderUrl && (
                        <a
                          href={centralFolderUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary obra-open-drive-btn"
                          title="Abrir la carpeta central de Google Drive de la editorial"
                        >
                          <span>📂</span>
                          <span>Abrir Carpeta Central de Drive ↗</span>
                        </a>
                      )}
                    </div>

                    <p className="obra-drive-desc">
                      La Gran Galería comprime automáticamente tu imagen a WebP para que cargue al instante en la web. Para que tu obra pueda ser impresa en diplomas, catálogos físicos o participar en bienales, deposita tu fotografía original (JPG/PNG en alta calidad) en nuestra carpeta central o nubes y pega su enlace aquí.
                    </p>

                    <div className="obra-field obra-drive-input-row">
                      <label htmlFor="obra-drive-url">
                        🔗 Enlace compartido de la foto original (Google Drive / OneDrive):
                      </label>
                      <input
                        id="obra-drive-url"
                        type="url"
                        value={driveUrl}
                        onChange={(e) => setDriveUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/... o enlace de tu nube"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* TAB VISTA PREVIA: SALA DE MUSEO INMERSIVA */
            <div className="obra-preview-chamber-layout animate-fade-in">
              <div className="obra-preview-gallery">
                <div className="museum-spotlight"></div>
                
                <div className="museum-frame">
                  {imageUrl ? (
                    <img src={imageUrl} alt={title || 'Obra'} className="museum-artwork-img" />
                  ) : (
                    <div className="preview-empty-frame">
                      <span>🎨</span>
                      <p>Sube una imagen en la pestaña «Ficha & Lienzo» para verla enmarcada</p>
                    </div>
                  )}
                </div>

                <div className="museum-zoom-hint">
                  <span>✨ Iluminación focal de la Gran Galería</span>
                </div>
              </div>

              {/* CÉDULA MUSEOGRÁFICA EN VISTA PREVIA */}
              <div className="obra-preview-placard">
                <div className="gg-art-award-tag">
                  <span>🏛️ Exhibición Oficial</span>
                </div>

                <h2 className="placard-title">{title || 'Título de tu Obra'}</h2>

                <div className="placard-artist-row">
                  <div className="placard-artist-avatar">🎨</div>
                  <div>
                    <h4 className="placard-artist-name">
                      {usePseudonym ? (pseudonym.trim() || 'Artista Anónimo') : userFallbackName}
                    </h4>
                    <p className="placard-artist-school">
                      {userProfile?.institution || 'Comunidad Estudiantil Sutz'}
                    </p>
                  </div>
                </div>

                <div className="placard-specs-grid">
                  <div className="spec-card">
                    <span className="spec-label">TÉCNICA</span>
                    <strong className="spec-val">{getTechniqueLabel(technique).toUpperCase()}</strong>
                  </div>
                  <div className="spec-card">
                    <span className="spec-label">DIMENSIONES</span>
                    <strong className="spec-val">{dimensions.trim() || 'Formato Libre'}</strong>
                  </div>
                  <div className="spec-card">
                    <span className="spec-label">COLECCIÓN</span>
                    <strong className="spec-val">Gran Galería Sutz</strong>
                  </div>
                </div>

                <div className="placard-desc-box">
                  <h4>Declaración de la Obra</h4>
                  <p>{description.trim() || 'Sin descripción todavía. Escribe unas palabras sobre tu inspiración.'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="obra-editor-footer">
          <div className="obra-footer-note">
            <span>🛡️ Tu obra se integrará con tu autoría y ficha técnica en la Gran Galería</span>
          </div>

          <div className="obra-footer-buttons">
            <button
              type="button"
              className="btn btn-secondary obra-btn-cancel"
              onClick={() => {
                soundEffects.playClick();
                onClose();
              }}
              disabled={isSaving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              form="obra-form"
              className="btn btn-primary obra-btn-submit"
              disabled={isSaving || isUploadingImage || !imageUrl}
            >
              <span>{isSaving ? '⏳' : '🎨'}</span>
              <span>{isSaving ? 'Publicando...' : 'Publicar Gran Obra'}</span>
            </button>
          </div>
        </footer>
      </div>

      {/* MODAL DE ENCUADRE Y AJUSTE DE IMAGEN */}
      <ImageFramingModal
        isOpen={!!imageFramingSource}
        imageSrc={imageFramingSource}
        title="Encuadre y Centrado de Obra · Gran Galería"
        subtitle="Ajusta el zoom, panea o rota tu obra artística para preservarla con máxima fidelidad."
        aspectRatio={null}
        allowedAspectRatios={[
          { label: 'Libre / Original', ratio: null, icon: '🔄' },
          { label: '4:3 Clásico', ratio: 4 / 3, icon: '🖼️' },
          { label: '1:1 Cuadrado', ratio: 1, icon: '⏹️' },
          { label: '3:4 Retrato', ratio: 3 / 4, icon: '📱' },
          { label: '16:9 Panorámico', ratio: 16 / 9, icon: '🌅' }
        ]}
        targetWidth={1200}
        targetHeight={1200}
        onSave={async (framedFile) => {
          setIsUploadingImage(true);
          setImageFramingSource(null);
          try {
            const { url } = await uploadImageWithFallback(framedFile, 'gran_galeria_arte', 1200, 1200, 0.82);
            setImageUrl(url);
            soundEffects.playSuccessFanfare();
          } catch (err) {
            console.error('[ObraEditorModal] Error al procesar imagen:', err);
            alert('No se pudo procesar la imagen de la obra. Por favor intenta con otra.');
          } finally {
            setIsUploadingImage(false);
          }
        }}
        onClose={() => setImageFramingSource(null)}
      />
    </div>
  );
};

export default ObraEditorModal;

