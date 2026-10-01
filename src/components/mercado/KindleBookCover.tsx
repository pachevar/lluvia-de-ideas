import React from 'react';
import type { MercadoProduct } from '../../data/mercadoData';

interface KindleBookCoverProps {
  product: MercadoProduct;
  size?: 'sm' | 'md' | 'lg';
  showLookInsideBadge?: boolean;
  onClick?: () => void;
  className?: string;
}

const THEME_GRADIENTS: Record<string, string> = {
  amber: 'linear-gradient(145deg, #1c1304 0%, #3d2305 40%, #78350f 100%)',
  cyan: 'linear-gradient(145deg, #031525 0%, #0c3358 40%, #0369a1 100%)',
  purple: 'linear-gradient(145deg, #180929 0%, #2f104d 40%, #581c87 100%)',
  emerald: 'linear-gradient(145deg, #031e13 0%, #06402b 40%, #065f46 100%)',
  ruby: 'linear-gradient(145deg, #220606 0%, #4a0c0c 40%, #881337 100%)'
};

const THEME_ACCENTS: Record<string, string> = {
  amber: '#fbbf24',
  cyan: '#38bdf8',
  purple: '#c084fc',
  emerald: '#34d399',
  ruby: '#fb7185'
};

export const KindleBookCover: React.FC<KindleBookCoverProps> = ({
  product,
  size = 'md',
  showLookInsideBadge = true,
  onClick,
  className = ''
}) => {
  const theme = product.coverTheme || 'amber';
  const bgGradient = THEME_GRADIENTS[theme] || THEME_GRADIENTS.amber;
  const accentColor = THEME_ACCENTS[theme] || '#fbbf24';

  return (
    <div 
      className={`kindle-book-cover-wrapper size-${size} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={`Ver detalles de ${product.title}`}
    >
      <div className="kindle-book-3d">
        {/* Lomo y relieve de encuadernación 3D */}
        <div className="kindle-spine-shadow" aria-hidden="true" />
        <div className="kindle-book-pages-edge" aria-hidden="true" />
        
        {/* Contenido de la Portada */}
        <div className="kindle-cover-surface">
          {product.image ? (
            <div className="kindle-image-cover-box">
              <img 
                src={product.image} 
                alt={`Portada de ${product.title}`} 
                className="kindle-cover-real-img"
                loading="lazy"
              />
              <div className="kindle-cover-glare-overlay" aria-hidden="true" />
            </div>
          ) : (
            /* Portada Procedural Estilo Kindle Clásico de Lujo */
            <div 
              className="kindle-procedural-cover"
              style={{ background: bgGradient }}
            >
              {/* Marca de agua y textura de marco */}
              <div className="kindle-cover-frame-border" style={{ borderColor: `${accentColor}55` }}>
                {/* Cabecera de la editorial */}
                <div className="kindle-cover-header-tag">
                  <span className="kindle-editorial-stamp">EDITORIAL LLUVIA DE IDEAS</span>
                  <span className="kindle-series-tag">{product.categoryLabel}</span>
                </div>

                {/* Emblema central de la obra */}
                <div className="kindle-cover-emblem-wrap">
                  <div className="kindle-emblem-circle" style={{ borderColor: `${accentColor}88`, boxShadow: `0 0 20px ${accentColor}33` }}>
                    <span className="kindle-emblem-emoji">{product.icon}</span>
                  </div>
                </div>

                {/* Título de la obra con tipografía de libro */}
                <div className="kindle-cover-title-group">
                  <h4 className="kindle-cover-main-title" style={{ color: '#ffffff' }}>
                    {product.title}
                  </h4>
                  {product.gradeOrAge && (
                    <span className="kindle-cover-grade-sub" style={{ color: accentColor }}>
                      {product.gradeOrAge}
                    </span>
                  )}
                </div>

                {/* Pie de portada */}
                <div className="kindle-cover-footer-bar">
                  <span className="kindle-badge-format">EDICIÓN ILUSTRADA</span>
                  <span className="kindle-maya-motif">◈ ◈ ◈</span>
                </div>
              </div>

              {/* Brillo de papel / barniz uv */}
              <div className="kindle-cover-glare-overlay" aria-hidden="true" />
            </div>
          )}

          {/* Insignia Echar un vistazo / Look Inside en hover */}
          {showLookInsideBadge && (
            <div className="kindle-look-inside-badge">
              <span>👁️ Echar un vistazo</span>
            </div>
          )}

          {/* Etiqueta de formato Kindle en esquina */}
          <div className="kindle-corner-format-tag" title="Formato Libro Físico & Digital Kindle">
            <span>Kindle</span>
          </div>
        </div>

        {/* Sombra ambiental inferior */}
        <div className="kindle-ambient-shadow" aria-hidden="true" />
      </div>
    </div>
  );
};

export default KindleBookCover;
