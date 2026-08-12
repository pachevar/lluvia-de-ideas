import { useState } from 'react';
import './PromoTipsModal.css';

interface PromoTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VideoTopic {
  id: string;
  tabLabel: string;
  icon: string;
  title: string;
  videoId: string;
  description: string;
  bullets: string[];
}

const VIDEO_TOPICS: VideoTopic[] = [
  {
    id: 'welcome',
    tabLabel: 'Bienvenida al Ecosistema',
    icon: '🌟',
    title: 'Conoce Nuestra Potente Herramienta',
    videoId: 'HMFybOP8gec',
    description: 'Nuestra plataforma unifica libros de texto, experiencias pedagógicas interactivas y recursos de aprendizaje adaptativo para revolucionar la enseñanza en el aula.',
    bullets: [
      'Acceso instantáneo a materiales digitales y actividades para cada grado.',
      'Diseño interactivo adaptado para docentes, estudiantes y administradores.',
      'Herramientas inclusivas con enfoque cultural en idioma K\'iche\' y Español.'
    ]
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
    ]
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
    ]
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
    ]
  }
];

export default function PromoTipsModal({ isOpen, onClose }: PromoTipsModalProps) {
  const [activeTopic, setActiveTopic] = useState<VideoTopic>(VIDEO_TOPICS[0]);

  if (!isOpen) return null;

  const embedUrl = `https://www.youtube.com/embed/${activeTopic.videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  return (
    <div className="promo-tips-overlay animate-fade-in" onClick={onClose}>
      <div className="promo-tips-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header del Modal */}
        <div className="promo-tips-header">
          <h3>
            <span>🎬</span> Ecosistema Educativo: Videos & Consejos
          </h3>
          <button className="promo-tips-close-btn" onClick={onClose} title="Cerrar modal">
            ✕
          </button>
        </div>

        {/* Pestañas de Selección de Tema */}
        <div className="promo-tips-tabs">
          {VIDEO_TOPICS.map((topic) => (
            <button
              key={topic.id}
              className={`promo-tip-tab ${activeTopic.id === topic.id ? 'active' : ''}`}
              onClick={() => setActiveTopic(topic)}
            >
              <span>{topic.icon}</span>
              <span>{topic.tabLabel}</span>
            </button>
          ))}
        </div>

        {/* Cuerpo del Modal: Video + Explicación */}
        <div className="promo-tips-body">
          <div className="promo-tips-video-box">
            <iframe
              src={embedUrl}
              title={activeTopic.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>

          <div className="promo-tips-info-box">
            <div>
              <h4 className="promo-tips-info-title">
                {activeTopic.icon} {activeTopic.title}
              </h4>
              <p className="promo-tips-info-desc">
                {activeTopic.description}
              </p>
              <ul className="promo-tips-bullets">
                {activeTopic.bullets.map((bullet, idx) => (
                  <li key={idx}>
                    <span>✨</span> {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="promo-tips-footer">
          <button className="promo-tips-understood-btn" onClick={onClose}>
            ¡Entendido, explorar la plataforma! ➔
          </button>
        </div>

      </div>
    </div>
  );
}
