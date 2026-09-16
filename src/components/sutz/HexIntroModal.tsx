import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { CustomHexagon } from '../../types';
import { sutzAudio } from '../../utils/sutzSoundEffects';
import { getHexPillarInfo } from '../../utils/hexPillarUtils';
import './HexIntroModal.css';

interface HexIntroModalProps {
  hexagon: CustomHexagon;
  onClose: () => void;
  onEnter: (hex: CustomHexagon) => void;
}

export const HexIntroModal: React.FC<HexIntroModalProps> = ({ hexagon, onClose, onEnter }) => {
  const mountTimeRef = useRef<number>(Date.now());
  const intro = hexagon.introModal;
  const pillarInfo = getHexPillarInfo(hexagon);

  // Defaults inteligentes si el admin aún no ha personalizado algún campo
  const characterName = intro?.characterName?.trim() || 'Guardián de Sutz';
  const characterBadge = intro?.characterBadge?.trim() || 'Anfitrión del Saber';
  const welcomeTitle = intro?.welcomeTitle?.trim() || (hexagon.title ? `¡Explora ${hexagon.title}!` : '¡Bienvenido a este Destino!');
  const description = intro?.description?.trim() || 'Adéntrate en este espacio de aprendizaje interactivo. Descubre nuevos desafíos, herramientas y aventuras diseñadas para expandir tu conocimiento.';
  const buttonText = intro?.buttonText?.trim() || 'Continuar ➔';
  const characterImage = intro?.characterImage;

  // Pitch procedural único para cada personaje
  const charPitch = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < characterName.length; i++) {
      sum += characterName.charCodeAt(i);
    }
    return 270 + (sum % 6) * 32; // Rango armónico 270Hz - 430Hz
  }, [characterName]);

  // Efecto máquina de escribir (typewriter) letra por letra
  const [displayedDesc, setDisplayedDesc] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSkipTyping = () => {
    if (isTyping) {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      setDisplayedDesc(description);
      setIsTyping(false);
    }
  };

  useEffect(() => {
    setDisplayedDesc('');
    setIsTyping(true);
    let idx = 0;

    const typeNext = () => {
      if (idx < description.length) {
        const char = description[idx];
        idx++;
        setDisplayedDesc(description.slice(0, idx));

        // Rítmica sónica: cada 2 caracteres y que no sea espacio
        if (idx % 2 === 0 && char !== ' ') {
          sutzAudio.playDialogueBlip(charPitch);
        }

        let delay = 22;
        if (char === '.' || char === '!' || char === '?') {
          delay = 180;
        } else if (char === ',' || char === ';') {
          delay = 85;
        }

        typingTimerRef.current = setTimeout(typeNext, delay);
      } else {
        setIsTyping(false);
      }
    };

    typingTimerRef.current = setTimeout(typeNext, 130);

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [description, charPitch]);

  // Icono por defecto si no hay imagen de personaje
  const defaultEmoji = hexagon.layerInteractive?.type === 'icon' || hexagon.layerInteractive?.type === 'text'
    ? hexagon.layerInteractive.value
    : '🧙‍♂️';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter') onEnter(hexagon);
    if (isTyping && (e.key === ' ' || e.key === 'ArrowRight')) {
      handleSkipTyping();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    if (Date.now() - mountTimeRef.current < 450) return;
    onClose();
  };

  const handleOverlayTouchEnd = (e: React.TouchEvent) => {
    if (e.target !== e.currentTarget) return;
    if (Date.now() - mountTimeRef.current < 450) return;
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
        className="sutz-intro-modal-panel compact-streamlined" 
        onClick={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hex-intro-title"
      >
        {/* Encabezado Superior Compacto */}
        <div className="sutz-intro-header">
          <div className="sutz-intro-tag">
            <span className="sutz-intro-tag-dot"></span>
            {pillarInfo && (
              <span 
                style={{
                  background: pillarInfo.bgTint,
                  border: `1px solid ${pillarInfo.borderTint}`,
                  color: pillarInfo.color,
                  padding: '2px 7px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginRight: '6px'
                }}
              >
                <span>{pillarInfo.icon}</span>
                <span>{pillarInfo.label}</span>
              </span>
            )}
            <span className="sutz-intro-tag-label">DESTINO:</span>
            <span className="sutz-intro-tag-title">{hexagon.title || 'EXPLORACIÓN'}</span>
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

        {/* Cuerpo Principal: Personaje protagonista a la izquierda + Diálogo a la derecha */}
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

          {/* Lado B: Diálogo con efecto máquina de escribir y sonido */}
          <div className="sutz-intro-dialogue-stage">
            <div 
              className="sutz-intro-speech-bubble" 
              onClick={handleSkipTyping}
              title={isTyping ? "Toca para mostrar todo el texto de una vez" : undefined}
            >
              <div className="sutz-intro-speech-tail"></div>
              <h3 id="hex-intro-title" className="sutz-intro-title">{welcomeTitle}</h3>
              <p className="sutz-intro-description">
                {displayedDesc}
                {isTyping && <span className="sutz-typewriter-cursor">▍</span>}
              </p>
              {isTyping && (
                <div className="sutz-typewriter-hint">
                  <span>💬 Hablando... (toca para omitir)</span>
                </div>
              )}
            </div>

            <div className="sutz-intro-destination-meta">
              <span className="sutz-intro-meta-icon">📍</span>
              <span className="sutz-intro-meta-text">
                Ruta: <strong>{hexagon.action?.target || 'Destino libre'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Barra Inferior de Acciones Compacta */}
        <div className="sutz-intro-footer">
          <button 
            type="button" 
            className="btn btn-secondary sutz-intro-back-btn" 
            onClick={onClose}
          >
            Volver
          </button>
          <button 
            type="button" 
            className={`sutz-intro-enter-btn ${!isTyping ? 'ready-pulse' : ''}`} 
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
