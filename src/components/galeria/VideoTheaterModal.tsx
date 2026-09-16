import React, { useEffect } from 'react';
import type { StudentVideoItem } from '../../types';
import { extractYouTubeId } from '../admin/AdminTabVideos';

interface VideoTheaterModalProps {
  videoItem: StudentVideoItem;
  onClose: () => void;
}

export const VideoTheaterModal: React.FC<VideoTheaterModalProps> = ({ videoItem, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const ytId = videoItem.youtubeId || extractYouTubeId(videoItem.videoUrl || '');

  return (
    <div className="gg-modal-overlay" onClick={onClose}>
      <div 
        className="gg-theater-modal" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button 
          type="button" 
          className="gg-theater-close-btn" 
          onClick={onClose}
          aria-label="Cerrar sala de cine"
        >
          ✕
        </button>

        {/* Sala de Cine: Pantalla 16:9 */}
        <div className="gg-theater-screen-wrapper">
          {ytId ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
              title={videoItem.title}
              className="gg-theater-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="gg-theater-fallback">
              <p>No se pudo cargar el reproductor para este enlace de video.</p>
              <a 
                href={videoItem.videoUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
              >
                Abrir video en pestaña externa ↗
              </a>
            </div>
          )}
        </div>

        {/* Ficha Técnica y Créditos del Cortometraje / Reportaje */}
        <div className="gg-theater-info">
          <div className="gg-theater-header">
            {videoItem.awardBadge && (
              <div className="gg-video-award-tag animate-bounce-subtle">
                <span>{videoItem.awardBadge}</span>
              </div>
            )}
            <div className="gg-theater-meta">
              <span className="gg-video-cat-badge">🎬 {videoItem.category.toUpperCase()}</span>
              {videoItem.duration && (
                <span className="gg-video-dur-badge">⏱️ {videoItem.duration}</span>
              )}
            </div>
            <h2 className="gg-theater-title">{videoItem.title}</h2>
          </div>

          <div className="gg-theater-credits-grid">
            <div className="credit-card">
              <span className="credit-label">EQUIPO / REALIZADORES</span>
              <strong className="credit-val">{videoItem.team}</strong>
            </div>
            {videoItem.school && (
              <div className="credit-card">
                <span className="credit-label">COLEGIO / COMUNIDAD</span>
                <strong className="credit-val">{videoItem.school}</strong>
              </div>
            )}
            {videoItem.grade && (
              <div className="credit-card">
                <span className="credit-label">GRADO</span>
                <strong className="credit-val">{videoItem.grade}</strong>
              </div>
            )}
          </div>

          {videoItem.synopsis && (
            <div className="gg-theater-synopsis">
              <h4>Sinopsis</h4>
              <p>{videoItem.synopsis}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
