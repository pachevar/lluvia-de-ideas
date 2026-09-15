import React from 'react';
import type { CustomHexagon } from '../../types';
import './HexIntroModal.css';

interface HexIntroModalProps {
  hexagon: CustomHexagon;
  onClose: () => void;
  onEnter: (hex: CustomHexagon) => void;
}

export const HexIntroModal: React.FC<HexIntroModalProps> = ({ hexagon, onClose, onEnter }) => {
  const mountTimeRef = React.useRef<number>(Date.now());
  const intro = hexagon.introModal;

  // Defaults inteligentes si el admin aún no ha personalizado algún campo
  const characterName = intro?.characterName?.trim() || 'Guardián de Sutz';
  const characterBadge = intro?.characterBadge?.trim() || 'Anfitrión del Saber';
  const welcomeTitle = intro?.welcomeTitle?.trim() || (hexagon.title ? `¡Explora ${hexagon.title}!` : '¡Bienvenido a este Destino!');
  const description = intro?.description?.trim() || 'Adéntrate en este espacio de aprendizaje interactivo. Descubre nuevos desafíos, herramientas y aventuras diseñadas para expandir tu conocimiento.';
  const buttonText = intro?.buttonText?.trim() || 'Continuar a la Página ➔';
  const characterImage = intro?.characterImage;

  // Icono por defecto si no hay imagen de personaje
  const defaultEmoji = hexagon.layerInteractive?.type === 'icon' || hexagon.layerInteractive?.type === 'text'
    ? hexagon.layerInteractive.value
    : '🧙‍♂️';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter') onEnter(hexagon);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    // Guard contra clics fantasma en móvil tras abrir por long-press
    if (Date.now() - mountTimeRef.current < 450) {
      return;
    }
    onClose();
  };

  const handleOverlayTouchEnd = (e: React.TouchEvent) => {
    if (e.target !== e.currentTarget) return;
    if (Date.now() - mountTimeRef.current < 450) {
      return;
    }
    e.preventDefault();
    onClose();
  };

  return (
    <div 
      className="sutz-modal-overlay" 
      onClick={handleOverlayClick} 
      onTouchEnd={handleOverlayTouchEnd}
      onKeyDown={handleKeyDown} 
      tabIndex={-1}
    >
      <div 
        className="sutz-intro-modal-panel" 
        onClick={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hex-intro-title"
      >
        {/* Encabezado Superior */}
        <div className="sutz-intro-header">
          <div className="sutz-intro-tag">
            <span className="sutz-intro-tag-dot"></span>
            <span>DESTINO SELECCIONADO: {hexagon.title || 'EXPLORACIÓN'}</span>
          </div>
          <button 
            type="button" 
            className="sutz-modal-close-btn" 
            onClick={onClose} 
            title="Cerrar y volver al mapa"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo Principal: Personaje + Diálogo Explicativo */}
        <div className="sutz-intro-body">
          {/* Lado A: Avatar / Ilustración del Personaje */}
          <div className="sutz-intro-character-stage">
            <div className="sutz-intro-character-frame">
              {characterImage ? (
                <img 
                  src={characterImage} 
                  alt={characterName} 
                  className="sutz-intro-character-img" 
                  loading="eager"
                />
              ) : (
                <div className="sutz-intro-character-fallback">
                  <span className="fallback-emoji">{defaultEmoji}</span>
                </div>
              )}
              <div className="sutz-intro-character-pedestal"></div>
            </div>

            <div className="sutz-intro-character-info">
              <h4 className="sutz-intro-char-name">{characterName}</h4>
              <span className="sutz-intro-char-badge">{characterBadge}</span>
            </div>
          </div>

          {/* Lado B: Mensaje de Bienvenida y Explicación */}
          <div className="sutz-intro-dialogue-stage">
            <div className="sutz-intro-speech-bubble">
              <div className="sutz-intro-speech-tail"></div>
              <h3 id="hex-intro-title" className="sutz-intro-title">{welcomeTitle}</h3>
              <p className="sutz-intro-description">{description}</p>
            </div>

            <div className="sutz-intro-destination-meta">
              <span className="sutz-intro-meta-icon">📍</span>
              <span className="sutz-intro-meta-text">
                Ruta asignada: <strong>{hexagon.action?.target || 'Destino libre'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Barra Inferior de Acciones */}
        <div className="sutz-intro-footer">
          <button 
            type="button" 
            className="btn btn-secondary sutz-intro-back-btn" 
            onClick={onClose}
          >
            Volver al Mapa
          </button>
          <button 
            type="button" 
            className="sutz-intro-enter-btn" 
            onClick={() => onEnter(hexagon)}
            autoFocus
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};
