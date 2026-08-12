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
                  <button className="facade-play-btn" aria-label="Reproducir video promocional">
                    <span className="play-icon-triangle">▶</span>
                  </button>
                  <span className="facade-play-label">VER VIDEO PROMOCIONAL</span>
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
