import React, { useState, useEffect } from 'react';
import type { StudentArtItem } from '../../types';
import { soundEffects } from '../../utils/soundEffects';

interface ArtPieceModalProps {
  artItem: StudentArtItem;
  onClose: () => void;
  onLike?: (id: string) => void;
}

export const ArtPieceModal: React.FC<ArtPieceModalProps> = ({ artItem, onClose, onLike }) => {
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(artItem.likes || 0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleLikeClick = () => {
    if (!liked) {
      soundEffects.playSuccessFanfare();
      setLiked(true);
      setLikeCount(prev => prev + 1);
      if (onLike) onLike(artItem.id);
    } else {
      soundEffects.playClick();
      setLiked(false);
      setLikeCount(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="gg-modal-overlay" onClick={onClose}>
      <div 
        className="gg-art-modal" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button 
          type="button" 
          className="gg-art-modal-close" 
          onClick={onClose}
          aria-label="Cerrar museo"
        >
          ✕
        </button>

        <div className="gg-art-modal-grid">
          {/* Lado Izquierdo: Sala de Exhibición con Iluminación Focal */}
          <div className="gg-museum-gallery-chamber">
            <div className="museum-spotlight"></div>
            
            <div className={`museum-frame ${isZoomed ? 'zoomed' : ''}`}>
              <img 
                src={artItem.imageUrl} 
                alt={artItem.title} 
                className="museum-artwork-img"
                onClick={() => setIsZoomed(!isZoomed)}
                title={isZoomed ? 'Click para alejar' : 'Click para ampliar'}
              />
            </div>

            <div className="museum-zoom-hint">
              <span>🔍 {isZoomed ? 'Click en la obra para ajustar' : 'Click en la obra para zoom en detalle'}</span>
            </div>
          </div>

          {/* Lado Derecho: Cédula Museográfica de la Obra */}
          <div className="gg-museum-placard">
            <div className="placard-inner">
              {artItem.awardBadge && (
                <div className="gg-art-award-tag animate-bounce-subtle">
                  <span>{artItem.awardBadge}</span>
                </div>
              )}

              <h2 className="placard-title">{artItem.title}</h2>

              <div className="placard-artist-row">
                <div className="placard-artist-avatar">🎨</div>
                <div>
                  <h4 className="placard-artist-name">{artItem.artist}</h4>
                  <p className="placard-artist-school">
                    {artItem.artistGrade ? `${artItem.artistGrade} · ` : ''}
                    {artItem.artistSchool || 'Colegio Participante'}
                  </p>
                </div>
              </div>

              <div className="placard-specs-grid">
                <div className="spec-card">
                  <span className="spec-label">TÉCNICA</span>
                  <strong className="spec-val">{artItem.technique.toUpperCase()}</strong>
                </div>
                {artItem.dimensions && (
                  <div className="spec-card">
                    <span className="spec-label">DIMENSIONES</span>
                    <strong className="spec-val">{artItem.dimensions}</strong>
                  </div>
                )}
                <div className="spec-card">
                  <span className="spec-label">EXHIBICIÓN</span>
                  <strong className="spec-val">Museo Virtual Sutz</strong>
                </div>
              </div>

              <div className="placard-desc-box">
                <h4>Declaración de la Obra</h4>
                <p>{artItem.description || 'Obra creada por el estudiante para la Gran Galería de Sutz.'}</p>
              </div>

              <div className="placard-actions">
                <button 
                  type="button" 
                  className={`gg-reaction-btn ${liked ? 'liked' : ''}`}
                  onClick={handleLikeClick}
                >
                  <span>{liked ? '❤️' : '🤍'}</span>
                  <span>{likeCount} Apreciaciones</span>
                </button>

                <button 
                  type="button"
                  className="gg-reaction-btn secondary"
                  onClick={() => {
                    soundEffects.playClick();
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                      alert('¡Enlace de la obra copiado!');
                    }
                  }}
                >
                  <span>🔗</span>
                  <span>Compartir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
