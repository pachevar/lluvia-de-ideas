import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCompass, FaExpand, FaCompress } from 'react-icons/fa';
import './AtlasAnatomia.css';
import { soundEffects } from '../utils/soundEffects';

export const AtlasAnatomia: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    soundEffects.playClick();
    navigate('/sutz');
  };

  const toggleFullscreen = () => {
    soundEffects.playClick();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.warn('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.warn('Exit fullscreen error:', err);
      });
    }
  };

  return (
    <div className="atlas-portal-wrapper" ref={containerRef}>
      <header className="atlas-portal-header">
        <div className="atlas-header-left">
          <button
            onClick={handleBack}
            className="atlas-back-button"
            title="Volver al Mapa de Sutz"
          >
            <span className="atlas-back-icon-wrap">
              <FaCompass className="atlas-back-icon" size={15} />
            </span>
            <div className="atlas-back-text-group">
              <span className="atlas-back-label">Volver al Mapa</span>
              <span className="atlas-back-sublabel">Sutz Virtual</span>
            </div>
          </button>
          <div className="atlas-brand-info">
            <h1 className="atlas-title">Cuerpo Humano Virtual 3D</h1>
            <span className="atlas-badge">Interactivo · 3,400+ Piezas</span>
          </div>
        </div>

        <div className="atlas-header-right">
          <button
            onClick={toggleFullscreen}
            className="atlas-action-btn"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
            <span className="desktop-only">{isFullscreen ? 'Ventana' : 'Pantalla Completa'}</span>
          </button>
        </div>
      </header>

      <div className="atlas-iframe-container">
        {loading && (
          <div className="atlas-loading-overlay">
            <div className="atlas-spinner" />
            <p>Cargando cuerpo humano virtual 3D...</p>
          </div>
        )}
        <iframe
          src="/atlas/index.html"
          className="atlas-iframe"
          title="Cuerpo Humano Virtual 3D"
          allow="fullscreen; accelerometer; gyroscope"
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
};

export default AtlasAnatomia;
