import { useState } from 'react';
import type { PromoVideoItem } from '../../types';
import { soundEffects } from '../../utils/soundEffects';
import './PromoTipsModal.css';

interface PromoTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipsList?: PromoVideoItem[];
}

const DEFAULT_VIDEO_TOPICS: PromoVideoItem[] = [
  {
    id: 'welcome',
    tabLabel: 'Bienvenida al Ecosistema',
    icon: '🌟',
    title: 'Conoce Nuestro Potente Ecosistema Educativo',
    videoId: 'HMFybOP8gec',
    description: 'Nuestra plataforma unifica libros de texto, experiencias pedagógicas interactivas y recursos de aprendizaje adaptativo para revolucionar la enseñanza en el aula.',
    bullets: [
      'Acceso instantáneo a materiales digitales y actividades para cada grado.',
      'Diseño interactivo adaptado para docentes, estudiantes y administradores.',
      'Herramientas inclusivas con enfoque cultural en idioma K\'iche\' y Español.'
    ],
    visible: true
  },
  {
    id: 'sutz',
    tabLabel: 'Mundo Virtual Sutz',
    icon: '☁️',
    title: 'Sutz: Nube de Aprendizaje Adaptativo',
    videoId: 'HMFybOP8gec',
    description: 'En idioma K\'iche\', Sutz significa Nube. Es un ecosistema interactivo basado en un mapa hexagonal de descubrimientos.',
    bullets: [
      'Navega por biomas, montañas y desafíos lógicos.',
      'Progresión personalizada al ritmo real de cada estudiante.',
      'Evaluaciones gamificadas sin estrés ni presión.'
    ],
    visible: true
  },
  {
    id: 'neuro',
    tabLabel: 'Neurociencia Educativa',
    icon: '🧠',
    title: 'Guía Práctica por Etapas de Desarrollo',
    videoId: 'HMFybOP8gec',
    description: 'Fundamentado en los descubrimientos más recientes de la neurodidáctica aplicados directamente al aula de clases.',
    bullets: [
      'Respeto al ritmo biológico y neurodesarrollo infantil.',
      'Micro-actividades para potenciar la concentración y memoria de trabajo.',
      'Estrategias de aprendizaje emocional y pensamiento crítico.'
    ],
    visible: true
  },
  {
    id: 'creatika',
    tabLabel: 'Suite Creatika',
    icon: '🎨',
    title: 'Expresión Creativa & Narrativa',
    videoId: 'HMFybOP8gec',
    description: 'Herramientas interactivas de escritura creativa, exploración de color y pensamiento divergente.',
    bullets: [
      'Máquina de Cuentos para la creación literaria.',
      'Laboratorio interactivo de Teoría del Color.',
      'Manifiesto del Código del Estudiante y Código Docente.'
    ],
    visible: true
  }
];

export default function PromoTipsModal({ isOpen, onClose, tipsList }: PromoTipsModalProps) {
  const activeList = (tipsList && tipsList.length > 0 ? tipsList : DEFAULT_VIDEO_TOPICS).filter(t => t.visible !== false);
  const [activeTopic, setActiveTopic] = useState<PromoVideoItem>(activeList[0] || DEFAULT_VIDEO_TOPICS[0]);

  if (!isOpen) return null;

  const currentTopic = activeList.find(t => t.id === activeTopic?.id) || activeList[0] || DEFAULT_VIDEO_TOPICS[0];
  const currentIndex = Math.max(0, activeList.findIndex(t => t.id === currentTopic.id));
  const embedUrl = `https://www.youtube.com/embed/${currentTopic.videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  const handleSelectTab = (topic: PromoVideoItem) => {
    soundEffects.playClick();
    setActiveTopic(topic);
  };

  const handlePrevTopic = () => {
    if (currentIndex > 0) {
      handleSelectTab(activeList[currentIndex - 1]);
    }
  };

  const handleNextTopic = () => {
    if (currentIndex < activeList.length - 1) {
      handleSelectTab(activeList[currentIndex + 1]);
    }
  };

  const handleClose = () => {
    soundEffects.playClick();
    onClose();
  };

  return (
    <div className="promo-tips-overlay animate-fade-in" onClick={onClose}>
      <div className="promo-tips-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header del Modal */}
        <div className="promo-tips-header">
          <h3>
            <span>🎬</span> Ecosistema Educativo: Videos & Consejos
          </h3>
          <button className="promo-tips-close-btn" onClick={handleClose} title="Cerrar modal">
            ✕
          </button>
        </div>

        {/* Selector de Tema para Móviles: Dropdown táctil con flechas ◀ ▶ y puntos de paso */}
        <div className="promo-tips-mobile-nav">
          <div className="mobile-nav-top-meta">
            <span className="mobile-nav-badge">
              <span>Tema {currentIndex + 1} de {activeList.length}</span>
            </span>
            <div className="mobile-nav-dots">
              {activeList.map((t, idx) => (
                <button
                  type="button"
                  key={t.id}
                  className={`nav-dot ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => handleSelectTab(t)}
                  title={t.tabLabel}
                  aria-label={`Ir al tema ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="mobile-nav-picker-row">
            <button
              className="mobile-nav-btn"
              onClick={handlePrevTopic}
              disabled={currentIndex <= 0}
              aria-label="Tema anterior"
            >
              ◀
            </button>

            <div className="mobile-dropdown-wrapper">
              <span className="mobile-dropdown-icon">{currentTopic.icon}</span>
              <select
                className="promo-tips-mobile-select"
                value={currentTopic.id}
                onChange={(e) => {
                  const selected = activeList.find(t => t.id === e.target.value);
                  if (selected) handleSelectTab(selected);
                }}
              >
                {activeList.map((t, idx) => (
                  <option key={t.id} value={t.id}>
                    {idx + 1}. {t.icon} {t.tabLabel}
                  </option>
                ))}
              </select>
              <span className="mobile-dropdown-arrow">▼</span>
            </div>

            <button
              className="mobile-nav-btn"
              onClick={handleNextTopic}
              disabled={currentIndex >= activeList.length - 1}
              aria-label="Tema siguiente"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Pestañas de Selección de Tema para Pantallas Medianas y Grandes */}
        <div className="promo-tips-tabs">
          {activeList.map((topic) => (
            <button
              key={topic.id}
              className={`promo-tip-tab ${currentTopic.id === topic.id ? 'active' : ''}`}
              onClick={() => handleSelectTab(topic)}
            >
              <span>{topic.icon}</span>
              <span>{topic.tabLabel}</span>
            </button>
          ))}
        </div>

        {/* Cuerpo del Modal: Video / Imagen + Explicación */}
        <div className="promo-tips-body">
          <div className="promo-tips-video-box">
            {currentTopic.mediaType === 'image' && currentTopic.imageUrl ? (
              <div className="promo-tips-image-wrapper">
                <img
                  src={currentTopic.imageUrl}
                  alt={currentTopic.title}
                  className="promo-tips-image-media"
                />
                <div className="promo-tips-image-badge">
                  <span>📸</span> Imagen Ilustrativa
                </div>
              </div>
            ) : (
              <iframe
                src={embedUrl}
                title={currentTopic.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            )}
          </div>

          <div className="promo-tips-info-box">
            <div>
              <h4 className="promo-tips-info-title">
                {currentTopic.icon} {currentTopic.title}
              </h4>
              <p className="promo-tips-info-desc">
                {currentTopic.description}
              </p>
              <ul className="promo-tips-bullets">
                {(currentTopic.bullets || []).map((bullet, idx) => (
                  <li key={idx}>
                    <span>✨</span> {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer del Modal con Navegación Móvil Rápida */}
        <div className="promo-tips-footer">
          <div className="promo-tips-mobile-footer-nav">
            <button
              className="btn-mobile-nav-foot"
              onClick={handlePrevTopic}
              disabled={currentIndex <= 0}
            >
              ◀ Anterior
            </button>
            <button
              className="btn-mobile-nav-foot"
              onClick={handleNextTopic}
              disabled={currentIndex >= activeList.length - 1}
            >
              Siguiente ▶
            </button>
          </div>

          <button className="promo-tips-understood-btn" onClick={handleClose}>
            ¡Entendido, explorar la plataforma! ➔
          </button>
        </div>

      </div>
    </div>
  );
}
