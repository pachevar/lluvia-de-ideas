import { useState } from 'react';
import './PromoVideoSection.css';

interface PromoVideoSectionProps {
  videoId?: string;
  title?: string;
  badge?: string;
  description?: string;
}

export default function PromoVideoSection({
  videoId = 'HMFybOP8gec',
  title = 'Conoce Nuestro Ecosistema Educativo',
  badge = '🎬 Video Promocional',
  description = 'Te invitamos a ver nuestro video promocional para conocer cómo nuestras plataformas, libros interactivos y herramientas digitales transforman el aprendizaje en el aula.'
}: PromoVideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <section className="promo-video-section animate-fade-in">
      <div className="promo-video-backdrop"></div>
      
      <div className="promo-video-container">
        
        {/* Encabezado de la Sección */}
        <div className="promo-video-header">
          <span className="promo-video-badge">{badge}</span>
          <h2 className="promo-video-title">
            <span className="highlight-text">{title}</span>
          </h2>
          <p className="promo-video-description">
            {description}
          </p>
        </div>

        {/* Rejilla de Muestra: Frame de Celular + Características */}
        <div className="promo-video-grid">
          
          {/* Mockup de Teléfono con el YouTube Short */}
          <div className="phone-mockup-wrapper">
            <div className="phone-notch">
              <div className="phone-speaker"></div>
            </div>
            <div className="phone-screen-container">
              {isPlaying ? (
                <iframe
                  src={embedUrl}
                  title="Video Promocional Lluvia de Ideas"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="video-facade-container" onClick={() => setIsPlaying(true)} role="button" tabIndex={0}>
                  <img src={thumbnailUrl} alt={title} className="facade-thumbnail" loading="lazy" decoding="async" />
                  <div className="facade-overlay-gradient"></div>
                  <div className="facade-content-wrapper">
                    <div className="play-btn-pulse-container">
                      <div className="play-pulse-ring ring-1"></div>
                      <div className="play-pulse-ring ring-2"></div>
                      <div className="play-pulse-ring ring-3"></div>
                      <button className="facade-play-btn" aria-label="Reproducir video promocional">
                        <div className="play-btn-glow"></div>
                        <svg className="play-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72L9.5 4.28a1 1 0 0 0-1.5.86z" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="facade-play-badge">
                      <span className="badge-pulse-dot"></span>
                      <span className="facade-play-text">VER VIDEO PROMOCIONAL</span>
                      <svg className="badge-arrow-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tarjeta Informativa Promocional */}
          <div className="promo-features-card">
            <div className="promo-feature-item">
              <span className="promo-feature-icon">🚀</span>
              <div className="promo-feature-text">
                <h4>Innovación Pedagógica</h4>
                <p>Integración armónica de libros impresos con experiencias interactivas virtuales en idioma K'iche' y español.</p>
              </div>
            </div>

            <div className="promo-feature-item">
              <span className="promo-feature-icon">🧠</span>
              <div className="promo-feature-text">
                <h4>Neurociencia Aplicada</h4>
                <p>Estrategias docentes diseñadas según las etapas reales de maduración cerebral y desarrollo cognitivo.</p>
              </div>
            </div>

            <div className="promo-feature-item">
              <span className="promo-feature-icon">📱</span>
              <div className="promo-feature-text">
                <h4>Multi-Dispositivo</h4>
                <p>Acceso continuo desde teléfonos celulares, tabletas y computadoras en cualquier aula escolar.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
