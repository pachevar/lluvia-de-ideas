import React, { useState, useEffect } from 'react';
import type { StudentTextItem } from '../../types';
import { soundEffects } from '../../utils/soundEffects';

interface ReadingModalProps {
  textItem: StudentTextItem;
  onClose: () => void;
  onLike?: (id: string) => void;
}

export const ReadingModal: React.FC<ReadingModalProps> = ({ textItem, onClose, onLike }) => {
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [fontSize, setFontSize] = useState<number>(18);
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(textItem.likes || 0);

  // Close with Escape key
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
      if (onLike) onLike(textItem.id);
    } else {
      soundEffects.playClick();
      setLiked(false);
      setLikeCount(prev => Math.max(0, prev - 1));
    }
  };

  const wordCount = textItem.content.trim().split(/\s+/).length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="gg-modal-overlay" onClick={onClose}>
      <div 
        className={`gg-reader-modal theme-${theme}`} 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Barra de Herramientas del Lector */}
        <header className="gg-reader-toolbar">
          <div className="gg-reader-meta-chips">
            <span className="gg-reader-genre-chip">
              📖 {textItem.genre.toUpperCase()}
            </span>
            <span className="gg-reader-stats-chip">
              ⏱️ {readTimeMin} min de lectura ({wordCount} palabras)
            </span>
          </div>

          <div className="gg-reader-controls">
            {/* Control de Tema */}
            <div className="gg-reader-theme-toggle" title="Cambiar fondo de lectura">
              <button 
                type="button"
                className={`theme-btn dark ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                🌙
              </button>
              <button 
                type="button"
                className={`theme-btn sepia ${theme === 'sepia' ? 'active' : ''}`}
                onClick={() => setTheme('sepia')}
              >
                📜
              </button>
              <button 
                type="button"
                className={`theme-btn light ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                ☀️
              </button>
            </div>

            {/* Control de Tamaño de Letra */}
            <div className="gg-reader-font-controls">
              <button 
                type="button" 
                onClick={() => setFontSize(f => Math.max(14, f - 2))}
                title="Reducir tamaño de letra"
              >
                A-
              </button>
              <span className="font-size-indicator">{fontSize}px</span>
              <button 
                type="button" 
                onClick={() => setFontSize(f => Math.min(26, f + 2))}
                title="Aumentar tamaño de letra"
              >
                A+
              </button>
            </div>

            {/* Botón Cerrar */}
            <button 
              type="button" 
              className="gg-reader-close-btn" 
              onClick={onClose}
              aria-label="Cerrar lectura"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Contenido Principal de Lectura */}
        <div className="gg-reader-body">
          {/* Cabecera de la Obra */}
          <div className="gg-reader-header-article">
            {textItem.awardBadge && (
              <div className="gg-reader-award-banner animate-bounce-subtle">
                <span>{textItem.awardBadge}</span>
              </div>
            )}
            
            <h1 className="gg-reader-story-title">{textItem.title}</h1>
            
            <div className="gg-reader-author-strip">
              <div className="gg-reader-author-avatar">
                {textItem.authorAvatar ? (
                  <img src={textItem.authorAvatar} alt={textItem.author} />
                ) : (
                  <span>✍️</span>
                )}
              </div>
              <div className="gg-reader-author-info">
                <span className="author-name">{textItem.author}</span>
                <span className="author-details">
                  {textItem.authorGrade ? `${textItem.authorGrade} · ` : ''}
                  {textItem.authorSchool || 'Estudiante'}
                </span>
              </div>
            </div>

            {textItem.synopsis && (
              <div className="gg-reader-synopsis-box">
                <p><strong>Sinopsis:</strong> {textItem.synopsis}</p>
              </div>
            )}
          </div>

          <hr className="gg-reader-divider" />

          {/* Texto de la Historia (Estilo Wattpad / Libro Digital) */}
          <article 
            className="gg-reader-article-content" 
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}
          >
            {textItem.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </article>

          {/* Pie de Lectura y Reacciones */}
          <footer className="gg-reader-footer">
            <div className="gg-reader-congrats">
              <h4>¡Has terminado de leer esta obra estudiantil!</h4>
              <p>Apoya el talento del autor dejando tu reacción.</p>
            </div>

            <div className="gg-reader-actions-bar">
              <button 
                type="button" 
                className={`gg-reaction-btn ${liked ? 'liked' : ''}`}
                onClick={handleLikeClick}
              >
                <span>{liked ? '❤️' : '🤍'}</span>
                <span>{likeCount} Me gusta</span>
              </button>

              <button 
                type="button" 
                className="gg-reaction-btn secondary"
                onClick={() => {
                  soundEffects.playClick();
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    alert('¡Enlace de la obra copiado al portapapeles!');
                  }
                }}
              >
                <span>🔗</span>
                <span>Compartir</span>
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
