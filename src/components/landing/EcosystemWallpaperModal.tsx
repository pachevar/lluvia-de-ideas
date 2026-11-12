import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { soundEffects } from '../../utils/soundEffects';
import './EcosystemWallpaperModal.css';

interface EcosystemWallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RAINDROPS = [
  { left: '6%', height: '70px', duration: '4.8s', delay: '0s' },
  { left: '12%', height: '95px', duration: '5.6s', delay: '1.1s' },
  { left: '19%', height: '65px', duration: '4.2s', delay: '2.4s' },
  { left: '26%', height: '110px', duration: '6.1s', delay: '0.6s' },
  { left: '34%', height: '80px', duration: '5.1s', delay: '3.0s' },
  { left: '43%', height: '75px', duration: '4.5s', delay: '1.7s' },
  { left: '52%', height: '105px', duration: '5.9s', delay: '0.3s' },
  { left: '61%', height: '72px', duration: '4.7s', delay: '2.1s' },
  { left: '69%', height: '90px', duration: '5.4s', delay: '0.9s' },
  { left: '77%', height: '68px', duration: '4.3s', delay: '3.4s' },
  { left: '85%', height: '100px', duration: '5.7s', delay: '1.4s' },
  { left: '92%', height: '82px', duration: '5.0s', delay: '2.7s' },
];

export const EcosystemWallpaperModal: React.FC<EcosystemWallpaperModalProps> = ({
  isOpen,
  onClose,
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [hideControls, setHideControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleFullscreen = async () => {
    soundEffects.playClick();
    try {
      if (!document.fullscreenElement && stageRef.current) {
        await stageRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Si el navegador restringe fullscreen, el modal 80% sigue activo
    }
  };

  return createPortal(
    <div
      className="eco-wall-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Modo fondo de pantalla: Ecosistema Educativo de Lluvia de Ideas"
    >
      <div
        ref={stageRef}
        className="eco-wall-stage"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Capas atmosféricas */}
        <div className="eco-aurora eco-aurora-1" />
        <div className="eco-aurora eco-aurora-2" />
        <div className="eco-aurora eco-aurora-3" />
        <div className="eco-grid-overlay" />

        {/* Lluvia luminosa de ideas */}
        <div className="eco-rain-layer" aria-hidden="true">
          {RAINDROPS.map((drop, index) => (
            <span
              key={index}
              className="eco-raindrop"
              style={{
                left: drop.left,
                height: drop.height,
                animationDuration: drop.duration,
                animationDelay: drop.delay,
              }}
            />
          ))}
        </div>

        {/* Globo Terráqueo & Órbitas Local-Global SVG */}
        <div className="eco-globe-layer" aria-hidden="true">
          <svg
            className="eco-globe-svg"
            viewBox="0 0 500 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="ecoGlobeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.24" />
                <stop offset="65%" stopColor="#0ea5e9" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="ecoRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            <circle cx="250" cy="250" r="220" fill="url(#ecoGlobeGlow)" />

            {/* Esfera central y paralelos */}
            <circle cx="250" cy="250" r="138" stroke="rgba(125, 211, 252, 0.35)" strokeWidth="1.5" />
            <ellipse cx="250" cy="250" rx="138" ry="48" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.2" />
            <ellipse cx="250" cy="250" rx="138" ry="96" stroke="rgba(56, 189, 248, 0.18)" strokeWidth="1.2" />
            <ellipse cx="250" cy="250" rx="58" ry="138" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.2" />
            <ellipse cx="250" cy="250" rx="108" ry="138" stroke="rgba(56, 189, 248, 0.18)" strokeWidth="1.2" />

            {/* Anillo orbital exterior */}
            <g className="eco-orbit-ring-1">
              <circle
                cx="250"
                cy="250"
                r="196"
                stroke="url(#ecoRingGrad)"
                strokeWidth="1.6"
                strokeDasharray="10 14"
              />
              <circle cx="446" cy="250" r="6" fill="#fbbf24" />
              <circle cx="54" cy="250" r="5" fill="#38bdf8" />
            </g>

            {/* Anillo orbital inclinado */}
            <g className="eco-orbit-ring-2">
              <ellipse
                cx="250"
                cy="250"
                rx="222"
                ry="88"
                transform="rotate(-24 250 250)"
                stroke="rgba(52, 211, 153, 0.48)"
                strokeWidth="1.5"
              />
              <circle cx="250" cy="162" r="5" fill="#34d399" />
            </g>

            {/* Pulso central */}
            <circle
              className="eco-orbit-pulse"
              cx="250"
              cy="250"
              r="164"
              stroke="rgba(251, 191, 36, 0.26)"
              strokeWidth="1.2"
            />

            {/* Arcos energéticos local -> global */}
            <path
              className="eco-arc-flow"
              d="M 122 288 Q 250 130 388 220"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              className="eco-arc-flow"
              d="M 150 185 Q 260 330 370 295"
              stroke="#34d399"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* Puntos de origen local */}
            <circle cx="122" cy="288" r="5" fill="#fbbf24" />
            <circle cx="388" cy="220" r="5" fill="#38bdf8" />
            <circle cx="150" cy="185" r="4.5" fill="#34d399" />
            <circle cx="370" cy="295" r="4.5" fill="#a78bfa" />
          </svg>
        </div>

        {/* Barra superior de controles */}
        <div className={`eco-wall-controls ${hideControls ? 'hidden-ui' : ''}`}>
          <div className="eco-wall-status-pill">
            <span className="eco-live-dot" />
            <span>MODO FONDO DE PANTALLA</span>
          </div>

          <div className="eco-wall-btn-group">
            <button
              type="button"
              className="eco-wall-btn"
              onClick={toggleFullscreen}
              title="Proyectar en pantalla completa"
            >
              <span>{isFullscreen ? '🗗' : '⛶'}</span>
              <span>{isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}</span>
            </button>

            <button
              type="button"
              className="eco-wall-btn"
              onClick={() => {
                soundEffects.playClick();
                setHideControls(true);
              }}
              title="Ocultar botones para dejar solo el fondo animado"
            >
              <span>👁️</span>
              <span>Ocultar controles</span>
            </button>

            <button
              type="button"
              className="eco-wall-btn close-btn"
              onClick={() => {
                soundEffects.playClick();
                onClose();
              }}
              aria-label="Cerrar fondo animado"
            >
              <span>✕</span>
              <span>Cerrar</span>
            </button>
          </div>
        </div>

        {/* Mensaje Central Animado */}
        <div className="eco-wall-center">
          <div className="eco-kicker">
            <span>🌧️</span>
            <span>Visión Viva · Lluvia de Ideas</span>
          </div>

          <h2 className="eco-main-headline">
            Ecosistema Educativo de Lluvia de Ideas
          </h2>

          <div className="eco-horizon-divider" aria-hidden="true" />

          <p className="eco-sub-headline">
            Creando <strong>soluciones locales</strong> a escala <strong>global</strong>
          </p>

          <div className="eco-pillars-strip">
            <span className="eco-pillar-node">☁️ Sutz Descubre</span>
            <span className="eco-pillar-node">🎨 Creatika</span>
            <span className="eco-pillar-node">⚡ 100tek STEAM</span>
            <span className="eco-pillar-node">🧪 LAB Educativo</span>
          </div>
        </div>

        {hideControls && (
          <button
            type="button"
            className="eco-restore-hint"
            onClick={() => setHideControls(false)}
          >
            Mostrar controles
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};

export default EcosystemWallpaperModal;

