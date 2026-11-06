import React, { useState, useEffect, useRef } from 'react';
import type { User } from 'firebase/auth';
import type { UserProfile } from '../../context/AuthContext';
import type { StudentVideoItem, VideoCategory } from '../../types';
import ImageFramingModal from '../common/ImageFramingModal';
import { uploadImageWithFallback } from '../../utils/imageUpload';
import { extractYouTubeId } from '../admin/AdminTabVideos';
import { soundEffects } from '../../utils/soundEffects';
import './VideoEditorModal.css';

interface VideoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newVideo: StudentVideoItem) => Promise<void> | void;
  initialData?: Partial<StudentVideoItem>;
  currentUser?: User | null;
  userProfile?: UserProfile | null;
}

type DeliveryMode = 'drive' | 'youtube';

export const VideoEditorModal: React.FC<VideoEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  currentUser,
  userProfile
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form states
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState<VideoCategory>(initialData?.category || 'cortometraje');
  const [team, setTeam] = useState(initialData?.team || '');
  const [school, setSchool] = useState(initialData?.school || '');
  const [grade, setGrade] = useState(initialData?.grade || '');
  const [duration, setDuration] = useState(initialData?.duration || '05:00');
  const [synopsis, setSynopsis] = useState(initialData?.synopsis || '');

  // Delivery mode (Opción A: Drive escolar / master centralizado o YouTube directo)
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(
    initialData?.driveUrl ? 'drive' : (initialData?.videoUrl ? 'youtube' : 'drive')
  );
  const [driveUrl, setDriveUrl] = useState(initialData?.driveUrl || '');
  const [youtubeUrl, setYoutubeUrl] = useState(initialData?.videoUrl || '');

  // Thumbnail / Poster
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(initialData?.thumbnailUrl || '');
  const [imageFramingSource, setImageFramingSource] = useState<File | string | null>(null);
  const [isUploadingThumb, setIsUploadingThumb] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Session / Creator identity
  const userFallbackName = userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Creador Escolar';
  const resolvedSchool = userProfile?.institution || school || 'Comunidad Escolar Sutz';

  // Synchronize initialData
  useEffect(() => {
    if (initialData) {
      if (initialData.title !== undefined) setTitle(initialData.title);
      if (initialData.category !== undefined) setCategory(initialData.category);
      if (initialData.team !== undefined) setTeam(initialData.team);
      if (initialData.school !== undefined) setSchool(initialData.school);
      if (initialData.grade !== undefined) setGrade(initialData.grade);
      if (initialData.duration !== undefined) setDuration(initialData.duration);
      if (initialData.synopsis !== undefined) setSynopsis(initialData.synopsis);
      if (initialData.thumbnailUrl !== undefined) setThumbnailUrl(initialData.thumbnailUrl);
      if (initialData.driveUrl) {
        setDriveUrl(initialData.driveUrl);
        setDeliveryMode('drive');
      }
      if (initialData.videoUrl) {
        setYoutubeUrl(initialData.videoUrl);
      }
    } else {
      if (userProfile?.institution && !school) {
        setSchool(userProfile.institution);
      }
      if (!team) {
        setTeam(userFallbackName);
      }
    }
  }, [initialData, userProfile, userFallbackName]);

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

  const resolvedYtId = extractYouTubeId(youtubeUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Por favor ingresa el título de la producción escolar.');
      return;
    }
    if (!team.trim()) {
      alert('Por favor ingresa los créditos del equipo realizador.');
      return;
    }

    if (deliveryMode === 'drive' && !driveUrl.trim()) {
      alert('Por favor ingresa el enlace compartido de Google Drive o Dropbox con el archivo del video.');
      return;
    }

    if (deliveryMode === 'youtube' && !youtubeUrl.trim()) {
      alert('Por favor ingresa el enlace de YouTube del video.');
      return;
    }

    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const finalYtId = deliveryMode === 'youtube' ? resolvedYtId : undefined;
      const finalVideoUrl = deliveryMode === 'youtube' 
        ? youtubeUrl.trim() 
        : (driveUrl.trim() || 'https://youtube.com');

      // Si se envía por Google Drive, entra en pipeline 'pendiente_revision' para masterización en canal de la editorial
      const calculatedStatus = initialData?.status || (deliveryMode === 'drive' ? 'pendiente_revision' : 'aprobado');

      const newVideoItem: StudentVideoItem = {
        id: initialData?.id || `video-${Date.now()}`,
        title: title.trim(),
        team: team.trim(),
        school: school.trim() || resolvedSchool,
        grade: grade.trim() || '',
        category,
        synopsis: synopsis.trim() || 'Producción audiovisual estudiantil para la Gran Sala.',
        videoUrl: finalVideoUrl,
        youtubeId: finalYtId,
        thumbnailUrl: thumbnailUrl.trim() || (finalYtId ? `https://img.youtube.com/vi/${finalYtId}/hqdefault.jpg` : ''),
        duration: duration.trim() || '05:00',
        awardBadge: initialData?.awardBadge || '',
        concursoId: initialData?.concursoId || '',
        views: initialData?.views || 1,
        featured: initialData?.featured || false,
        publishedAt: initialData?.publishedAt || now,
        driveUrl: deliveryMode === 'drive' ? driveUrl.trim() : undefined,
        status: calculatedStatus,
        authorEmail: currentUser?.email || undefined
      };

      await onSave(newVideoItem);
      soundEffects.playSuccessFanfare();
      onClose();
    } catch (err) {
      console.error('[VideoEditorModal] Error guardando video:', err);
      alert('Hubo un error al procesar la producción. Por favor intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryLabel = (cat: VideoCategory) => {
    switch (cat) {
      case 'cortometraje': return 'Cortometraje de Ficción';
      case 'documental': return 'Documental Comunitario';
      case 'reportaje': return 'Reportaje Periodístico Escolar';
      case 'animacion': return 'Animación / Stop-Motion';
      default: return cat;
    }
  };

  return (
    <div className="gg-modal-overlay video-editor-overlay" onClick={onClose}>
      <div 
        className="video-editor-container" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* HEADER */}
        <header className="video-editor-header">
          <div className="video-header-title">
            <span className="video-header-icon">🎬</span>
            <div>
              <h2>Gran Sala · Postular Producción Audiovisual</h2>
              <p>Postula tu cortometraje, reportaje o documental para estreno en el Canal Oficial Editorial</p>
            </div>
          </div>

          <div className="video-header-actions">
            <div className="video-tabs-switch">
              <button
                type="button"
                className={`video-tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
                onClick={() => {
                  soundEffects.playClick();
                  setActiveTab('editor');
                }}
              >
                <span>🎬</span>
                <span>Ficha de Rodaje</span>
              </button>
              <button
                type="button"
                className={`video-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => {
                  soundEffects.playClick();
                  setActiveTab('preview');
                }}
              >
                <span>👁️</span>
                <span>Vista en Gran Sala</span>
              </button>
            </div>

            <button
              type="button"
              className="video-close-btn"
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
        <div className="video-editor-body">
          {activeTab === 'editor' ? (
            <form id="video-form" onSubmit={handleSubmit} className="video-form-layout">
              {/* SESIÓN DEL REALIZADOR */}
              <div className="video-session-badge-bar">
                <span className="session-user-badge">
                  🟢 Realizador: <strong>{userFallbackName}</strong>
                  {resolvedSchool && <small> · {resolvedSchool}</small>}
                </span>
                <span className="session-mode-note">
                  ✨ Proyecto postulado bajo el Sello y Canal Oficial de la Editorial Lluvia de Ideas
                </span>
              </div>

              {/* BLOQUE PRINCIPAL: PÓSTER Y METADATOS */}
              <div className="video-hero-studio-row">
                {/* COLUMNA 1: PÓSTER / MINIATURA 16:9 */}
                <div className="video-poster-col">
                  <div className="video-poster-card">
                    <span className="video-poster-label">🎞️ Póster o Fotograma 16:9 *</span>

                    <div
                      className={`video-poster-preview-box ${thumbnailUrl ? 'has-poster' : ''}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) setImageFramingSource(file);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      title="Haz clic para seleccionar el póster o fotograma"
                    >
                      {thumbnailUrl ? (
                        <div className="poster-art-wrapper">
                          <img src={thumbnailUrl} alt={title || 'Póster'} className="poster-art-img" />
                          <div className="poster-art-hover-overlay">
                            <span>🔄 Cambiar o Re-encuadrar</span>
                          </div>
                          <div className="poster-play-badge">▶</div>
                        </div>
                      ) : (
                        <div className="poster-art-placeholder">
                          <span className="placeholder-poster-icon">🎥</span>
                          <strong>Póster o Fotograma Oficial</strong>
                          <small>Arrastra o haz clic aquí<br />Formato 16:9 panorámico</small>
                          <span className="poster-framing-badge">📐 Encuadre de cine automático</span>
                        </div>
                      )}
                    </div>

                    <div className="video-poster-cta-row">
                      <button
                        type="button"
                        className="btn btn-primary video-upload-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        disabled={isUploadingThumb}
                      >
                        <span>{isUploadingThumb ? '⏳' : '🖼️'}</span>
                        <span>{isUploadingThumb ? 'Procesando...' : (thumbnailUrl ? 'Cambiar Póster' : 'Elegir Póster')}</span>
                      </button>

                      {thumbnailUrl && (
                        <button
                          type="button"
                          className="btn btn-danger video-clear-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            soundEffects.playClick();
                            setThumbnailUrl('');
                          }}
                          title="Eliminar miniatura"
                        >
                          🗑️
                        </button>
                      )}
                    </div>

                    <input
                      id="video-poster-file-input"
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

                {/* COLUMNA 2: FICHA DE PRODUCCIÓN & MODO DE ENTREGA */}
                <div className="video-metadata-col">
                  {/* Título de la Producción */}
                  <div className="video-field">
                    <label htmlFor="video-title">📌 Título de la Producción Audiovisual *</label>
                    <input
                      id="video-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ejemplo: Guardianes del Maíz: Memoria y Tradición"
                      required
                    />
                  </div>

                  {/* Categoría y Duración */}
                  <div className="video-fields-row">
                    <div className="video-field">
                      <label htmlFor="video-category">🎬 Categoría Audiovisual *</label>
                      <select
                        id="video-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as VideoCategory)}
                      >
                        <option value="cortometraje">🎬 Cortometraje de Ficción</option>
                        <option value="documental">🌲 Documental Comunitario</option>
                        <option value="reportaje">🎤 Reportaje Periodístico Escolar</option>
                        <option value="animacion">🎞️ Animación / Stop-Motion</option>
                      </select>
                    </div>

                    <div className="video-field">
                      <label htmlFor="video-duration">⏱️ Duración Estimada</label>
                      <input
                        id="video-duration"
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Ej: 04:30 min o 12:00 min"
                      />
                    </div>
                  </div>

                  {/* Equipo y Colegio */}
                  <div className="video-fields-row">
                    <div className="video-field">
                      <label htmlFor="video-team">👥 Equipo Realizador / Créditos *</label>
                      <input
                        id="video-team"
                        type="text"
                        value={team}
                        onChange={(e) => setTeam(e.target.value)}
                        placeholder="Ej: Dirección: Sofía Ramos · Guión: Mateo Morales"
                        required
                      />
                    </div>

                    <div className="video-field">
                      <label htmlFor="video-school">🏫 Colegio / Comunidad y Grado</label>
                      <input
                        id="video-school"
                        type="text"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder="Ej: Colegio San Agustín · 5to Bachillerato"
                      />
                    </div>
                  </div>

                  {/* SELECTOR DEL MODO DE ENTREGA (OPCIÓN A CENTRALIZADA) */}
                  <div className="video-delivery-card">
                    <span className="delivery-card-title">🚀 Modo de Entrega del Video (Canal Central)</span>
                    <p className="delivery-card-desc">
                      Almacenamos y proyectamos todas las producciones bajo el Canal Oficial de la Editorial para consolidar audiencia, vistas y calidad técnica.
                    </p>

                    <div className="delivery-mode-tabs">
                      <button
                        type="button"
                        className={`delivery-tab-btn ${deliveryMode === 'drive' ? 'active' : ''}`}
                        onClick={() => {
                          soundEffects.playClick();
                          setDeliveryMode('drive');
                        }}
                      >
                        <span>📁 Google Drive / Dropbox</span>
                        <small>Master Original (Recomendado)</small>
                      </button>

                      <button
                        type="button"
                        className={`delivery-tab-btn ${deliveryMode === 'youtube' ? 'active' : ''}`}
                        onClick={() => {
                          soundEffects.playClick();
                          setDeliveryMode('youtube');
                        }}
                      >
                        <span>▶ YouTube Existente</span>
                        <small>Enlace Directo</small>
                      </button>
                    </div>

                    {deliveryMode === 'drive' ? (
                      <div className="delivery-input-box animate-fade-in">
                        <label htmlFor="video-drive-url">
                          🔗 Enlace compartido de Google Drive, OneDrive o Dropbox con el archivo MP4 *
                        </label>
                        <input
                          id="video-drive-url"
                          type="url"
                          value={driveUrl}
                          onChange={(e) => setDriveUrl(e.target.value)}
                          placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                          required={deliveryMode === 'drive'}
                        />
                        <span className="delivery-note">
                          💡 Asegúrate de configurar el enlace en <strong>«Cualquiera con el enlace puede ver»</strong>. Nuestro equipo editorial agregará la cortinilla oficial de la Gran Sala y lo estrenará en el canal central de YouTube.
                        </span>
                      </div>
                    ) : (
                      <div className="delivery-input-box animate-fade-in">
                        <label htmlFor="video-youtube-url">
                          🔗 Enlace de YouTube del video escolar *
                        </label>
                        <input
                          id="video-youtube-url"
                          type="url"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
                          required={deliveryMode === 'youtube'}
                        />
                        {resolvedYtId && (
                          <span className="delivery-yt-detected">
                            ✅ ID de YouTube identificado: <code>{resolvedYtId}</code>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Sinopsis y Memoria de Rodaje */}
                  <div className="video-field">
                    <label htmlFor="video-synopsis">
                      📝 Sinopsis y Memoria de Rodaje
                    </label>
                    <textarea
                      id="video-synopsis"
                      rows={3}
                      value={synopsis}
                      onChange={(e) => setSynopsis(e.target.value)}
                      placeholder="Describe la trama del cortometraje o el tema del documental: ¿De qué trata? ¿Qué locaciones usaron? ¿Cuál es el mensaje que quieren comunicar?"
                    />
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* TAB VISTA PREVIA: CINE INMERSIVO */
            <div className="video-preview-layout animate-fade-in">
              <div className="video-preview-screen-box">
                {resolvedYtId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${resolvedYtId}?rel=0&modestbranding=1`}
                    title={title || 'Vista Previa'}
                    className="video-preview-iframe"
                    allowFullScreen
                  />
                ) : (
                  <div className="video-preview-placeholder">
                    {thumbnailUrl ? (
                      <img src={thumbnailUrl} alt="Póster" className="video-preview-poster-bg" />
                    ) : (
                      <div className="preview-no-poster">
                        <span>🎬</span>
                      </div>
                    )}
                    <div className="video-preview-overlay">
                      <div className="preview-play-icon">▶</div>
                      <span className="preview-dur-pill">⏱️ {duration}</span>
                      <span className="preview-cat-pill">🎬 {getCategoryLabel(category).toUpperCase()}</span>
                      {deliveryMode === 'drive' && (
                        <div className="preview-drive-banner">
                          <span>📦 Proyecto en archivo Master · Estreno en Canal Editorial</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* FICHA TÉCNICA EN VISTA PREVIA */}
              <div className="video-preview-details">
                <div className="video-preview-badges">
                  <span className="cat-badge">🎬 {getCategoryLabel(category).toUpperCase()}</span>
                  <span className="dur-badge">⏱️ {duration}</span>
                  <span className="status-badge">
                    {deliveryMode === 'drive' ? '🟡 Postulado al Canal Central' : '🟢 Publicado en Gran Sala'}
                  </span>
                </div>

                <h2 className="preview-video-title">{title || 'Título de la Producción'}</h2>
                <p className="preview-team">👥 {team || 'Equipo Realizador'}</p>
                <p className="preview-school">{school || resolvedSchool}</p>

                <div className="preview-synopsis-box">
                  <h4>Sinopsis del Proyecto</h4>
                  <p>{synopsis.trim() || 'Sinopsis aún no redactada. Comparte la historia de tu proyecto audiovisual.'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="video-editor-footer">
          <div className="video-footer-note">
            <span>🛡️ Las producciones se exhiben en la Gran Sala bajo los estándares del ecosistema editorial</span>
          </div>

          <div className="video-footer-buttons">
            <button
              type="button"
              className="btn btn-secondary video-btn-cancel"
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
              form="video-form"
              className="btn btn-primary video-btn-submit"
              disabled={isSaving || isUploadingThumb}
            >
              <span>{isSaving ? '⏳' : '🎬'}</span>
              <span>{isSaving ? 'Postulando...' : 'Postular Producción'}</span>
            </button>
          </div>
        </footer>
      </div>

      {/* MODAL DE ENCUADRE DE PÓSTER 16:9 */}
      <ImageFramingModal
        isOpen={!!imageFramingSource}
        imageSrc={imageFramingSource}
        title="Encuadre de Póster / Fotograma · Gran Sala"
        subtitle="Ajusta el zoom, panea o rota la imagen para obtener un póster cinematográfico en proporción 16:9."
        aspectRatio={16 / 9}
        allowedAspectRatios={[
          { label: '16:9 Panorámico Cine', ratio: 16 / 9, icon: '🎬' },
          { label: '4:3 Clásico', ratio: 4 / 3, icon: '📺' },
          { label: '1:1 Cuadrado', ratio: 1, icon: '⏹️' },
          { label: 'Libre / Original', ratio: null, icon: '🔄' }
        ]}
        targetWidth={1280}
        targetHeight={720}
        onSave={async (framedFile) => {
          setIsUploadingThumb(true);
          setImageFramingSource(null);
          try {
            const { url } = await uploadImageWithFallback(framedFile, 'gran_galeria_videos', 1280, 720, 0.82);
            setThumbnailUrl(url);
            soundEffects.playSuccessFanfare();
          } catch (err) {
            console.error('[VideoEditorModal] Error al procesar póster:', err);
            alert('No se pudo procesar la imagen del póster. Intenta con otra.');
          } finally {
            setIsUploadingThumb(false);
          }
        }}
        onClose={() => setImageFramingSource(null)}
      />
    </div>
  );
};

export default VideoEditorModal;

