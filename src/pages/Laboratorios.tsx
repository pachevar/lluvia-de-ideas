import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { usePortalConfig } from '../context/PortalConfigContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { formatDateSpanish } from '../utils/dateUtils';
import { soundEffects } from '../utils/soundEffects';
import '../styles/sutz-palette.css';
import './Laboratorios.css';

// Fechas predeterminadas para los módulos de formación
const getModuleDate = (moduleId: number): string => {
  const dates = [
    "Viernes, 12 de Junio",
    "Viernes, 3 de Julio",
    "Viernes, 17 de Julio",
    "Viernes, 31 de Julio",
    "Viernes, 14 de Agosto",
    "Viernes, 28 de Agosto",
    "Viernes, 11 de Septiembre",
    "Viernes, 25 de Septiembre",
    "Por acordar con el grupo (antes de finalizar sep.)",
    "Por acordar con el grupo (antes de finalizar sep.)"
  ];
  return dates[moduleId - 1] || "Fecha por acordar";
};

// Entregables pedagógicos y fases de formación para enriquecer la experiencia docente
const MODULE_EXTRAS: Record<number, { deliverable: string; phase: string; duration: string }> = {
  1: { deliverable: "Baraja de detonantes y mapa de estructuración rápida de cuentos en el aula", phase: "Fase 1: Narrativa y Creatividad", duration: "3 Horas Prácticas" },
  2: { deliverable: "Plantilla pedagógica del Viaje del Héroe adaptada al currículo del grado", phase: "Fase 1: Narrativa y Creatividad", duration: "3 Horas Prácticas" },
  3: { deliverable: "Guía de lectura dramatizada con paisajes sonoros y modulación vocal", phase: "Fase 1: Narrativa y Creatividad", duration: "3 Horas Prácticas" },
  4: { deliverable: "Caja de herramientas plásticas para autoconocimiento y clima escolar", phase: "Fase 2: Arte, Teatro y Expresión", duration: "3 Horas Prácticas" },
  5: { deliverable: "Personaje tridimensional articulado con materiales sostenibles y de descarte", phase: "Fase 2: Arte, Teatro y Expresión", duration: "3 Horas Prácticas" },
  6: { deliverable: "Secuencia didáctica de escritura creativa basada en relatos ancestrales", phase: "Fase 2: Arte, Teatro y Expresión", duration: "3 Horas Prácticas" },
  7: { deliverable: "Repertorio de dinámicas de presencia escénica y modulación vocal para captar la atención", phase: "Fase 2: Arte, Teatro y Expresión", duration: "3 Horas Prácticas" },
  8: { deliverable: "Guión técnico y storyboard secuencial completo para animación infantil", phase: "Fase 3: Animación y Proyecto Final", duration: "3 Horas Prácticas" },
  9: { deliverable: "Cortometraje stop-motion producido en equipo y montado con herramientas accesibles", phase: "Fase 3: Animación y Proyecto Final", duration: "3 Horas Prácticas" },
  10: { deliverable: "Rúbrica de evaluación formativa y plan para el festival de estreno con los alumnos", phase: "Fase 3: Animación y Proyecto Final", duration: "3 Horas Prácticas" }
};

export default function Laboratorios() {
  const { labId } = useParams<{ labId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { config } = usePortalConfig();

  // Detección de vista: Si la URL no especifica un taller, estamos en el LOBBY
  let activeSubLab = labId;
  if (!activeSubLab) {
    const path = location.pathname;
    if (path.includes('animacion-educativa')) activeSubLab = 'animacion-educativa';
    else if (path.includes('robotica-educativa')) activeSubLab = 'robotica-educativa';
    else if (path.includes('pensamiento-cientifico')) activeSubLab = 'pensamiento-cientifico';
    else activeSubLab = 'lobby';
  }

  const isLobby = activeSubLab === 'lobby';

  const modulesList = config.laboratorios?.modules || [];
  const [activeLabModule, setActiveLabModule] = useState<number>(1);
  const [activeScheduleModule, setActiveScheduleModule] = useState<number>(1);

  // Control de secciones desplegables: Únicamente Ruta de Formación y Competencias abierta por defecto al abrir o refrescar
  const [openAccordions, setOpenAccordions] = useState<{
    desc: boolean;
    features: boolean;
    modules: boolean;
    schedule: boolean;
  }>({
    desc: false,      // Plegado por defecto para ganar espacio
    features: false,  // Plegado por defecto para ganar espacio
    modules: true,    // ÚNICO abierto por defecto para navegación inmediata
    schedule: false   // Plegado por defecto para ahorrar espacio
  });

  const toggleAccordion = (key: 'desc' | 'features' | 'modules' | 'schedule') => {
    soundEffects.playClick();
    setOpenAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Gestos táctiles para dispositivos móviles (deslizar a la izquierda o derecha)
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchEndModule = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Solo activamos swipe horizontal si el desplazamiento horizontal es superior al vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
      if (diffX > 0) {
        handleNextModule();
      } else {
        handlePrevModule();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  const handleTouchEndSchedule = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
      if (diffX > 0) {
        handleNextSchedule();
      } else {
        handlePrevSchedule();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Estados del modal de inscripción
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [regAgreed, setRegAgreed] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  const currentMod = modulesList.find(m => m.id === activeLabModule) || modulesList[0];
  const currentExtras = currentMod ? MODULE_EXTRAS[currentMod.id] : undefined;

  const scheduleMod = modulesList.find(m => m.id === activeScheduleModule) || modulesList[0];
  const scheduleModExtras = scheduleMod ? MODULE_EXTRAS[scheduleMod.id] : undefined;

  const handleGoToWorkshop = (subLab: string) => {
    soundEffects.playClick();
    navigate(`/laboratorios/${subLab}`);
  };

  const handleBackToLobby = () => {
    soundEffects.playClick();
    navigate('/laboratorios');
  };

  const handleSelectModule = (id: number) => {
    soundEffects.playClick();
    setActiveLabModule(id);
  };

  const handlePrevModule = () => {
    if (activeLabModule > 1) {
      handleSelectModule(activeLabModule - 1);
    }
  };

  const handleNextModule = () => {
    if (activeLabModule < modulesList.length) {
      handleSelectModule(activeLabModule + 1);
    }
  };

  const handleSelectScheduleModule = (id: number) => {
    soundEffects.playClick();
    setActiveScheduleModule(id);
  };

  const handlePrevSchedule = () => {
    if (activeScheduleModule > 1) {
      handleSelectScheduleModule(activeScheduleModule - 1);
    }
  };

  const handleNextSchedule = () => {
    if (activeScheduleModule < modulesList.length) {
      handleSelectScheduleModule(activeScheduleModule + 1);
    }
  };

  const scrollToSchedule = () => {
    soundEffects.playClick();
    setOpenAccordions(prev => ({ ...prev, schedule: true }));
    setTimeout(() => {
      const el = document.getElementById('cronograma-laboratorio');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess(false);

    if (!regName.trim() || !regPhone.trim() || !regSchool.trim()) {
      setRegError('Por favor completa todos los campos del formulario.');
      return;
    }

    if (!regAgreed) {
      setRegError('Debes aceptar el compromiso de asistencia presencial.');
      return;
    }

    if (regPhone.trim().length !== 8) {
      setRegError('El número de teléfono debe tener exactamente 8 dígitos (ej. 4567 8901).');
      return;
    }

    setRegLoading(true);
    soundEffects.playClick();

    try {
      await addDoc(collection(db, 'inscripciones'), {
        name: regName.trim(),
        phone: '+502 ' + regPhone.trim(),
        school: regSchool.trim(),
        lab: activeSubLab,
        agreed: regAgreed,
        timestamp: new Date().toISOString()
      });
      soundEffects.playSuccessFanfare();
      setRegSuccess(true);
      setRegName('');
      setRegPhone('');
      setRegSchool('');
      setRegAgreed(false);
      setTimeout(() => {
        setIsRegisterModalOpen(false);
        setRegSuccess(false);
      }, 3500);
    } catch (err: unknown) {
      console.error("Error guardando inscripción:", err);
      setRegError('Ocurrió un error al enviar tu inscripción. Inténtalo de nuevo.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="lab-page-container animate-fade-in">

      {/* =========================================================================
          CASO A: LOBBY DE TALLERES DISPONIBLES (/laboratorios)
          ========================================================================= */}
      {isLobby ? (
        <section className="lab-lobby-section animate-fade-in">
          <header className="lab-hero-header">
            <span className="lab-hero-badge">
              <span>🏛️</span> Centro de Innovación y Formación Docente
            </span>
            <h1 className="lab-hero-title">Lobby de Talleres Formativos</h1>
            <p className="lab-hero-lead">
              Selecciona el laboratorio formativo en el que deseas participar. Espacios prácticos de metodologías activas diseñados para potenciar la creatividad docente en el aula y acreditados con certificación oficial.
            </p>
          </header>

          {/* Grilla de Talleres del Lobby */}
          <div className="lab-lobby-grid">

            {/* TALLER 1: ANIMACIÓN EDUCATIVA (ACTIVO) */}
            <div 
              className="lab-lobby-card card-active-workshop"
              onClick={() => handleGoToWorkshop('animacion-educativa')}
            >
              <div>
                <span className="lab-lobby-card-badge status-active">
                  <span>🟢</span> Taller Activo 2026 · Inscripciones Abiertas
                </span>
                <span className="lab-lobby-icon">🎬</span>
                <h3 className="lab-lobby-card-title">Laboratorio de Animación Educativa</h3>
                <p className="lab-lobby-card-desc">
                  10 módulos prácticos de narrativa, arquetipos del Viaje del Héroe, arte terapia, modelado de personajes y producción de animación stop-motion con tus estudiantes.
                </p>
                <div className="lab-lobby-pills">
                  <span className="lab-lobby-pill-tag">📅 Inicia Junio 2026</span>
                  <span className="lab-lobby-pill-tag">⏱️ 30 Horas Prácticas</span>
                  <span className="lab-lobby-pill-tag">🎓 10 Módulos</span>
                  <span className="lab-lobby-pill-tag">🎟️ 100% Becado</span>
                </div>
              </div>

              <button 
                type="button" 
                className="lab-lobby-card-btn btn-enter-active"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGoToWorkshop('animacion-educativa');
                }}
              >
                <span>🚀 Entrar al Taller de Animación Educativa ➔</span>
              </button>
            </div>

            {/* TALLER 2: ROBÓTICA EDUCATIVA (PRÓXIMAMENTE) */}
            <div 
              className="lab-lobby-card card-robotics"
              onClick={() => handleGoToWorkshop('robotica-educativa')}
            >
              <div>
                <span className="lab-lobby-card-badge status-upcoming">
                  <span>🟡</span> Próxima Apertura 2026
                </span>
                <span className="lab-lobby-icon">🤖</span>
                <h3 className="lab-lobby-card-title">Laboratorio de Robótica Educativa</h3>
                <p className="lab-lobby-card-desc">
                  Pensamiento computacional, circuitos de papel, sensores básicos, mecanismos simples y automatización aplicable a proyectos escolares STEAM.
                </p>
                <div className="lab-lobby-pills">
                  <span className="lab-lobby-pill-tag">🔌 Circuitos de papel</span>
                  <span className="lab-lobby-pill-tag">🧠 Algoritmos sin pantallas</span>
                  <span className="lab-lobby-pill-tag">⚙️ Mecanismos STEAM</span>
                </div>
              </div>

              <button 
                type="button" 
                className="lab-lobby-card-btn btn-enter-preview"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGoToWorkshop('robotica-educativa');
                }}
              >
                <span>🛠️ Ver Detalles y Pre-Inscripción ➔</span>
              </button>
            </div>

            {/* TALLER 3: PENSAMIENTO CIENTÍFICO (PRÓXIMAMENTE) */}
            <div 
              className="lab-lobby-card card-science"
              onClick={() => handleGoToWorkshop('pensamiento-cientifico')}
            >
              <div>
                <span className="lab-lobby-card-badge status-upcoming" style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: '#38bdf8', color: '#38bdf8' }}>
                  <span>🔵</span> Próxima Apertura 2026
                </span>
                <span className="lab-lobby-icon">🔬</span>
                <h3 className="lab-lobby-card-title">Laboratorio de Pensamiento Científico</h3>
                <p className="lab-lobby-card-desc">
                  El método científico como aventura de indagación para la infancia: hipótesis visuales, cosmología mesoamericana, experimentos de física recreativa y divulgación escolar.
                </p>
                <div className="lab-lobby-pills">
                  <span className="lab-lobby-pill-tag">🔍 Indagación infantil</span>
                  <span className="lab-lobby-pill-tag">🌌 Astronomía práctica</span>
                  <span className="lab-lobby-pill-tag">📊 Registro científico</span>
                </div>
              </div>

              <button 
                type="button" 
                className="lab-lobby-card-btn btn-enter-preview"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGoToWorkshop('pensamiento-cientifico');
                }}
              >
                <span>🔭 Ver Detalles y Pre-Inscripción ➔</span>
              </button>
            </div>

          </div>

          {/* Barra de Garantías del Lobby */}
          <div className="lab-stats-grid">
            <div className="lab-stat-card">
              <div className="lab-stat-icon-wrap">📜</div>
              <div className="lab-stat-info">
                <span className="lab-stat-val">Acreditación Oficial</span>
                <span className="lab-stat-label">Diploma respaldado por Editorial Lluvia de Ideas</span>
              </div>
            </div>
            <div className="lab-stat-card">
              <div className="lab-stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                <span style={{ color: '#10b981' }}>💡</span>
              </div>
              <div className="lab-stat-info">
                <span className="lab-stat-val">100% Práctico</span>
                <span className="lab-stat-label">Materiales y proyectos listos para tu aula</span>
              </div>
            </div>
            <div className="lab-stat-card">
              <div className="lab-stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.12)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                <span style={{ color: '#f59e0b' }}>🎟️</span>
              </div>
              <div className="lab-stat-info">
                <span className="lab-stat-val">Beca Docente</span>
                <span className="lab-stat-label">Formación sin costo para colegios asociados</span>
              </div>
            </div>
          </div>
        </section>
      ) : (

        /* =========================================================================
            CASO B: DENTRO DE UN TALLER ESPECÍFICO (CON BOTÓN VOLVER AL LOBBY)
            ========================================================================= */
        <main className="animate-fade-in">
          
          {/* Barra Superior con Botón de Regreso al Lobby */}
          <div className="lab-top-nav-bar">
            <button 
              type="button" 
              className="lab-back-to-lobby-btn"
              onClick={handleBackToLobby}
              title="Regresar a la selección de talleres"
            >
              <span>← Volver al Lobby de Talleres</span>
            </button>

            <div className="lab-workshop-breadcrumb">
              <span>Lobby de Laboratorios</span>
              <span>/</span>
              <strong>
                {activeSubLab === 'animacion-educativa' && '🎬 Animación Educativa'}
                {activeSubLab === 'robotica-educativa' && '🤖 Robótica Educativa'}
                {activeSubLab === 'pensamiento-cientifico' && '🔬 Pensamiento Científico'}
              </strong>
            </div>
          </div>

          {/* --- TALLER ACTIVO: ANIMACIÓN EDUCATIVA --- */}
          {activeSubLab === 'animacion-educativa' && (
            <div className="animate-fade-in">
              <header className="lab-hero-header">
                <span className="lab-hero-badge">
                  <span>🎬</span> Taller Activo 2026 · Formación Presencial
                </span>
                <h1 className="lab-hero-title">Laboratorio de Animación Educativa</h1>
              </header>

              <div className="lab-accordions-container">

                {/* ==============================================================
                    DESPLEGABLE 1: DESCRIPCIÓN DEL LABORATORIO
                    ============================================================== */}
                <div className="lab-accordion-item">
                  <button
                    type="button"
                    className={`lab-accordion-header ${openAccordions.desc ? 'active' : ''}`}
                    onClick={() => toggleAccordion('desc')}
                    aria-expanded={openAccordions.desc}
                  >
                    <div className="lab-accordion-title-wrap">
                      <span className="lab-accordion-icon">📖</span>
                      <div className="lab-accordion-headings">
                        <h2 className="lab-accordion-title">Descripción y Enfoque Pedagógico</h2>
                        <span className="lab-accordion-subtitle">Fundamentación, metodología activa y beneficios para el aula</span>
                      </div>
                    </div>
                    <div className="lab-accordion-right-meta">
                      <span className="lab-accordion-status-badge">
                        {openAccordions.desc ? 'Ocultar' : 'Ver detalle'}
                      </span>
                      <span className={`lab-accordion-chevron ${openAccordions.desc ? 'open' : ''}`}>▼</span>
                    </div>
                  </button>

                  {openAccordions.desc && (
                    <div className="lab-accordion-body animate-fade-in">
                      <div className="lab-desc-content-grid">
                        <div className="lab-desc-text-col">
                          <p className="lab-desc-p">
                            {config.laboratorios?.intro || 'Transforma tu práctica docente mediante experiencias de aprendizaje basadas en la narrativa, el juego y la producción de animación en el aula.'}
                          </p>
                        </div>
                        <div className="lab-desc-pillars-col">
                          <div className="lab-desc-pillar">
                            <span className="lab-desc-pillar-icon">🎨</span>
                            <div>
                              <strong>Expresión Socioemocional</strong>
                              <p>Modelado de personajes y gestión de emociones a través del arte y la plástica.</p>
                            </div>
                          </div>
                          <div className="lab-desc-pillar">
                            <span className="lab-desc-pillar-icon">✍️</span>
                            <div>
                              <strong>Narrativa y Lectoescritura</strong>
                              <p>Estructuración dramática, guiones creativos y mitos ancestrales mesoamericanos.</p>
                            </div>
                          </div>
                          <div className="lab-desc-pillar">
                            <span className="lab-desc-pillar-icon">🎬</span>
                            <div>
                              <strong>Producción Audiovisual Accesible</strong>
                              <p>Stop-motion en el aula con materiales de bajo costo y dispositivos móviles.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ==============================================================
                    DESPLEGABLE 2: CARACTERÍSTICAS DEL PROGRAMA / MODALIDAD
                    ============================================================== */}
                <div className="lab-accordion-item">
                  <button
                    type="button"
                    className={`lab-accordion-header ${openAccordions.features ? 'active' : ''}`}
                    onClick={() => toggleAccordion('features')}
                    aria-expanded={openAccordions.features}
                  >
                    <div className="lab-accordion-title-wrap">
                      <span className="lab-accordion-icon">⚡</span>
                      <div className="lab-accordion-headings">
                        <h2 className="lab-accordion-title">Características del Laboratorio</h2>
                        <span className="lab-accordion-subtitle">Duración, modalidad, becas y acreditación oficial</span>
                      </div>
                    </div>
                    <div className="lab-accordion-right-meta">
                      <span className="lab-accordion-status-badge">
                        {openAccordions.features ? 'Ocultar' : 'Ver detalle'}
                      </span>
                      <span className={`lab-accordion-chevron ${openAccordions.features ? 'open' : ''}`}>▼</span>
                    </div>
                  </button>

                  {openAccordions.features && (
                    <div className="lab-accordion-body animate-fade-in">
                      <div className="lab-features-grid">
                        <div className="lab-feature-box">
                          <span className="lab-feature-icon">🎓</span>
                          <div>
                            <strong>10 Módulos Formativos</strong>
                            <p>Ruta progresiva de tres fases: narrativa, expresión plástica y producción final.</p>
                          </div>
                        </div>
                        <div className="lab-feature-box">
                          <span className="lab-feature-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>⏱️</span>
                          <div>
                            <strong>30 Horas Prácticas</strong>
                            <p>10 sesiones presenciales intensivas de 3 horas prácticas cada una.</p>
                          </div>
                        </div>
                        <div className="lab-feature-box">
                          <span className="lab-feature-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>📍</span>
                          <div>
                            <strong>Modalidad Presencial Viva</strong>
                            <p>Dinámicas vivenciales, trabajo en equipo y experimentación con materiales reales.</p>
                          </div>
                        </div>
                        <div className="lab-feature-box">
                          <span className="lab-feature-icon" style={{ background: 'rgba(192, 132, 252, 0.12)', color: '#c084fc' }}>📜</span>
                          <div>
                            <strong>Certificación Curricular</strong>
                            <p>Diploma oficial acreditado y respaldado por Editorial Lluvia de Ideas.</p>
                          </div>
                        </div>
                        <div className="lab-feature-box">
                          <span className="lab-feature-icon" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>🎟️</span>
                          <div>
                            <strong>Beca del 100%</strong>
                            <p>Formación sin costo para docentes de instituciones educativas vinculadas.</p>
                          </div>
                        </div>
                        <div className="lab-feature-box">
                          <span className="lab-feature-icon" style={{ background: 'rgba(234, 179, 8, 0.12)', color: '#eab308' }}>📦</span>
                          <div>
                            <strong>Materiales Incluidos</strong>
                            <p>Kits plásticos, guías de aula y plantillas descargables para tus alumnos.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ==============================================================
                    DESPLEGABLE 3: RUTA DE FORMACIÓN Y COMPETENCIAS
                    (Navegación con botones y texto "Módulo X", título abajo, columnas horizontales y gestos táctiles)
                    ============================================================== */}
                <div className="lab-accordion-item">
                  <button
                    type="button"
                    className={`lab-accordion-header ${openAccordions.modules ? 'active' : ''}`}
                    onClick={() => toggleAccordion('modules')}
                    aria-expanded={openAccordions.modules}
                  >
                    <div className="lab-accordion-title-wrap">
                      <span className="lab-accordion-icon">🎯</span>
                      <div className="lab-accordion-headings">
                        <h2 className="lab-accordion-title">Ruta de Formación y Competencias</h2>
                        <span className="lab-accordion-subtitle">
                          Módulo activo: <strong>Módulo {activeLabModule} de {modulesList.length}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="lab-accordion-right-meta">
                      <span className="lab-accordion-status-badge">
                        {openAccordions.modules ? 'Ocultar' : 'Ver detalle'}
                      </span>
                      <span className={`lab-accordion-chevron ${openAccordions.modules ? 'open' : ''}`}>▼</span>
                    </div>
                  </button>

                  {openAccordions.modules && currentMod && (
                    <div 
                      className="lab-accordion-body animate-fade-in"
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEndModule}
                    >
                      <div className="lab-mobile-swipe-hint">
                        <span>👈 Desliza horizontalmente para cambiar de módulo 👉</span>
                      </div>

                      {/* 1. Botones Anterior / Siguiente con texto "Módulo X" en medio */}
                      <div className="lab-mod-nav-bar">
                        <button 
                          type="button"
                          className="lab-nav-arrow-btn"
                          onClick={handlePrevModule}
                          disabled={activeLabModule <= 1}
                          title="Ir al módulo anterior"
                        >
                          ◀ Anterior
                        </button>

                        <div className="lab-nav-mid-badge">
                          <span className="lab-nav-mid-label">MÓDULO</span>
                          <span className="lab-nav-mid-num">{activeLabModule} <small>/ {modulesList.length}</small></span>
                        </div>

                        <button 
                          type="button"
                          className="lab-nav-arrow-btn"
                          onClick={handleNextModule}
                          disabled={activeLabModule >= modulesList.length}
                          title="Ir al siguiente módulo"
                        >
                          Siguiente ▶
                        </button>
                      </div>

                      {/* Contenido animado al cambiar de módulo */}
                      <div className="lab-module-content-animated" key={activeLabModule}>
                        {/* 2. Título del módulo abajo de los botones */}
                        <div className="lab-active-mod-header">
                          <div className="lab-mod-tags-row">
                            <span className="lab-mod-phase-tag">{currentExtras?.phase || 'Fase Formativa'}</span>
                            <span className="lab-mod-dur-tag">⏱️ {currentExtras?.duration || '3 Horas'}</span>
                            <span className="lab-mod-date-tag">📅 {formatDateSpanish(currentMod.date || getModuleDate(currentMod.id))}</span>
                          </div>
                          <h3 className="lab-active-mod-title">
                            <span className="lab-active-mod-icon">{currentMod.icon}</span>
                            <span>{currentMod.title}</span>
                          </h3>
                        </div>

                        {/* 3. Despliegue de la información de forma horizontal (eliminando los cuadros de títulos anteriores) */}
                        <div className="lab-mod-horizontal-grid">
                          
                          {/* Columna 1: Competencia Docente */}
                          <div className="lab-horizontal-col col-competency">
                            <div className="lab-col-header">
                              <span className="lab-col-icon">🎯</span>
                              <h4 className="lab-col-title">Competencia Docente</h4>
                            </div>
                            <p className="lab-col-text">
                              {currentMod.competency}
                            </p>
                          </div>

                          {/* Columna 2: Habilidades a Desarrollar */}
                          <div className="lab-horizontal-col col-skills">
                            <div className="lab-col-header">
                              <span className="lab-col-icon">✨</span>
                              <h4 className="lab-col-title">Habilidades Clave</h4>
                            </div>
                            <div className="lab-col-chips">
                              {currentMod.skills.map((skill, idx) => (
                                <span className="lab-col-chip" key={idx}>
                                  <span className="lab-chip-bullet">✦</span> {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Columna 3: Entregable para el Aula */}
                          <div className="lab-horizontal-col col-deliverable">
                            <div className="lab-col-header">
                              <span className="lab-col-icon">📦</span>
                              <h4 className="lab-col-title">Producto de Aula</h4>
                            </div>
                            <p className="lab-col-text">
                              {currentExtras?.deliverable || "Secuencia didáctica y artefactos aplicables directamente a tus alumnos."}
                            </p>
                          </div>

                          {/* Columna 4: Sesión e Inscripción */}
                          <div className="lab-horizontal-col col-action">
                            <div className="lab-col-header">
                              <span className="lab-col-icon">🎟️</span>
                              <h4 className="lab-col-title">Sesión y Reserva</h4>
                            </div>
                            <div className="lab-col-date-text">
                              {formatDateSpanish(currentMod.date || getModuleDate(currentMod.id))}
                            </div>
                            <div className="lab-col-time-text">
                              ⏰ 2:00 PM a 5:00 PM · Presencial
                            </div>
                            <button
                              type="button"
                              className="btn-register-highlight"
                              onClick={() => {
                                soundEffects.playClick();
                                setIsRegisterModalOpen(true);
                              }}
                            >
                              <span>📝 Inscribirme al Taller</span>
                            </button>
                            <button
                              type="button"
                              className="lab-toolbar-btn"
                              style={{ marginTop: '8px', width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
                              onClick={() => {
                                handleSelectScheduleModule(currentMod.id);
                                scrollToSchedule();
                              }}
                            >
                              <span>📅 Ver en Cronograma</span>
                            </button>
                          </div>

                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* ==============================================================
                    DESPLEGABLE 4: CRONOGRAMA DE SESIONES PRESENCIALES
                    (Repite la lógica: botones con texto "Sesión X", título abajo y columnas horizontales)
                    ============================================================== */}
                <div id="cronograma-laboratorio" className="lab-accordion-item">
                  <button
                    type="button"
                    className={`lab-accordion-header ${openAccordions.schedule ? 'active' : ''}`}
                    onClick={() => toggleAccordion('schedule')}
                    aria-expanded={openAccordions.schedule}
                  >
                    <div className="lab-accordion-title-wrap">
                      <span className="lab-accordion-icon">📅</span>
                      <div className="lab-accordion-headings">
                        <h2 className="lab-accordion-title">Cronograma de Sesiones Presenciales</h2>
                        <span className="lab-accordion-subtitle">
                          Sesión seleccionada: <strong>Sesión {activeScheduleModule} de {modulesList.length}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="lab-accordion-right-meta">
                      <span className="lab-accordion-status-badge">
                        {openAccordions.schedule ? 'Ocultar' : 'Ver detalle'}
                      </span>
                      <span className={`lab-accordion-chevron ${openAccordions.schedule ? 'open' : ''}`}>▼</span>
                    </div>
                  </button>

                  {openAccordions.schedule && scheduleMod && (
                    <div 
                      className="lab-accordion-body animate-fade-in"
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEndSchedule}
                    >
                      <div className="lab-mobile-swipe-hint">
                        <span>👈 Desliza horizontalmente para cambiar de fecha 👉</span>
                      </div>

                      {/* 1. Botones Anterior / Siguiente con texto "Sesión X" en medio */}
                      <div className="lab-mod-nav-bar">
                        <button 
                          type="button"
                          className="lab-nav-arrow-btn"
                          onClick={handlePrevSchedule}
                          disabled={activeScheduleModule <= 1}
                          title="Ir a la sesión anterior"
                        >
                          ◀ Anterior
                        </button>

                        <div className="lab-nav-mid-badge">
                          <span className="lab-nav-mid-label">SESIÓN</span>
                          <span className="lab-nav-mid-num">{activeScheduleModule} <small>/ {modulesList.length}</small></span>
                        </div>

                        <button 
                          type="button"
                          className="lab-nav-arrow-btn"
                          onClick={handleNextSchedule}
                          disabled={activeScheduleModule >= modulesList.length}
                          title="Ir a la siguiente sesión"
                        >
                          Siguiente ▶
                        </button>
                      </div>

                      {/* Contenido animado al cambiar de sesión */}
                      <div className="lab-module-content-animated" key={activeScheduleModule}>
                        {/* 2. Título de la sesión abajo de los botones */}
                        <div className="lab-active-mod-header">
                          <div className="lab-mod-tags-row">
                            <span className="lab-mod-phase-tag">{scheduleModExtras?.phase || 'Fase Formativa'}</span>
                            <span className="lab-mod-dur-tag">Modalidad Presencial</span>
                            <span className="lab-mod-date-tag">Sesión Oficial 2026</span>
                          </div>
                          <h3 className="lab-active-mod-title">
                            <span className="lab-active-mod-icon">{scheduleMod.icon}</span>
                            <span>Módulo {scheduleMod.id}: {scheduleMod.title}</span>
                          </h3>
                        </div>

                      {/* 3. Despliegue de la información de la sesión de forma horizontal */}
                      <div className="lab-mod-horizontal-grid">

                        {/* Columna 1: Fecha Programada */}
                        <div className="lab-horizontal-col col-schedule-date">
                          <div className="lab-col-header">
                            <span className="lab-col-icon">📅</span>
                            <h4 className="lab-col-title">Fecha Programada</h4>
                          </div>
                          <div className="lab-col-date-text" style={{ fontSize: '1.15rem', color: '#38bdf8' }}>
                            {formatDateSpanish(scheduleMod.date || getModuleDate(scheduleMod.id))}
                          </div>
                          <p className="lab-col-text" style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>
                            {scheduleMod.id > 8 ? "Fecha y horario acordados con el grupo docente" : "Sesión formal de viernes formativo"}
                          </p>
                        </div>

                        {/* Columna 2: Horario y Duración */}
                        <div className="lab-horizontal-col col-schedule-time">
                          <div className="lab-col-header">
                            <span className="lab-col-icon">⏰</span>
                            <h4 className="lab-col-title">Horario</h4>
                          </div>
                          <div className="lab-col-date-text" style={{ fontSize: '1.15rem', color: '#10b981' }}>
                            {scheduleMod.time || (scheduleMod.id > 8 ? "Por acordar con el grupo" : "2:00 PM a 5:00 PM")}
                          </div>
                          <p className="lab-col-text" style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>
                            3 horas prácticas presenciales de producción en aula.
                          </p>
                        </div>

                        {/* Columna 3: Sede de Trabajo */}
                        <div className="lab-horizontal-col col-schedule-venue">
                          <div className="lab-col-header">
                            <span className="lab-col-icon">📍</span>
                            <h4 className="lab-col-title">Sede de Trabajo</h4>
                          </div>
                          <div className="lab-col-date-text" style={{ fontSize: '1.05rem', color: '#fbbf24' }}>
                            {scheduleMod.location || "Lugar céntrico de la Ciudad"}
                          </div>
                          <p className="lab-col-text" style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>
                            Salón equipado con mesas, iluminación y herramientas.
                          </p>
                        </div>

                        {/* Columna 4: Reserva y Disponibilidad */}
                        <div className="lab-horizontal-col col-action">
                          <div className="lab-col-header">
                            <span className="lab-col-icon">🎟️</span>
                            <h4 className="lab-col-title">Disponibilidad</h4>
                          </div>
                          <div className="lab-status-badge-inline">
                            🟢 Convocatoria Abierta
                          </div>
                          <button
                            type="button"
                            className="btn-register-highlight"
                            onClick={() => {
                              soundEffects.playClick();
                              setIsRegisterModalOpen(true);
                            }}
                          >
                            <span>📝 Reservar Mi Cupo</span>
                          </button>
                        </div>

                      </div>
                    </div>

                      {/* Selector rápido de sesiones (1 a 10) compacto para saltar directamente */}
                      <div className="lab-schedule-quick-chips">
                        <span className="lab-quick-chips-label">Saltar a sesión:</span>
                        <div className="lab-chips-row">
                          {modulesList.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              className={`lab-quick-session-btn ${activeScheduleModule === m.id ? 'active' : ''}`}
                              onClick={() => handleSelectScheduleModule(m.id)}
                              title={`Sesión ${m.id}: ${m.title}`}
                            >
                              S{m.id}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Llamado Central a la Inscripción */}
                      <div className="lab-main-cta-box" style={{ marginTop: '28px' }}>
                        <h3 className="lab-main-cta-title">¿Listo para innovar en tu aula de clases?</h3>
                        <p className="lab-main-cta-desc">
                          El taller es 100% becado por Editorial Lluvia de Ideas para docentes comprometidos con la educación transformadora. Reserva tu plaza antes del inicio de módulo.
                        </p>
                        <button 
                          type="button" 
                          className="btn-main-register"
                          onClick={() => {
                            soundEffects.playClick();
                            setIsRegisterModalOpen(true);
                          }}
                        >
                          <span>📝</span>
                          <span>Inscribirme al Laboratorio de Animación ➔</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* --- TALLER: ROBÓTICA EDUCATIVA (PRÓXIMAMENTE) --- */}
          {activeSubLab === 'robotica-educativa' && (
            <div className="animate-fade-in">
              <div className="lab-upcoming-card">
                <span className="lab-upcoming-icon-stack">🤖🛠️⚙️</span>
                <span className="lab-hero-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: '#f59e0b', color: '#fbbf24' }}>
                  Próxima Apertura 2026
                </span>
                <h2 className="lab-upcoming-title">Laboratorio de Robótica Educativa</h2>
                <p className="lab-upcoming-lead">
                  Diseño de sensores básicos, automatización accesible, pensamiento computacional y metodologías STEAM con proyectos que los estudiantes pueden ensamblar en la escuela.
                </p>

                <div className="lab-upcoming-pillars">
                  <div className="lab-pillar-item">
                    <span>🔌</span>
                    <span>Circuitos de papel y electrónica básica</span>
                  </div>
                  <div className="lab-pillar-item">
                    <span>🧠</span>
                    <span>Lógica y algoritmos sin pantallas</span>
                  </div>
                  <div className="lab-pillar-item">
                    <span>⚙️</span>
                    <span>Mecanismos simples y servomotores</span>
                  </div>
                  <div className="lab-pillar-item">
                    <span>🏆</span>
                    <span>Retos de resolución colaborativa</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button 
                    type="button"
                    className="btn-main-register"
                    onClick={() => {
                      soundEffects.playClick();
                      setIsRegisterModalOpen(true);
                    }}
                  >
                    <span>🔔</span>
                    <span>Avisarme cuando abra inscripciones</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn-jump-schedule"
                    onClick={handleBackToLobby}
                  >
                    <span>← Volver al Lobby de Talleres</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- TALLER: PENSAMIENTO CIENTÍFICO (PRÓXIMAMENTE) --- */}
          {activeSubLab === 'pensamiento-cientifico' && (
            <div className="animate-fade-in">
              <div className="lab-upcoming-card">
                <span className="lab-upcoming-icon-stack">🔬🪐🧪</span>
                <span className="lab-hero-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: '#38bdf8', color: '#38bdf8' }}>
                  Próxima Apertura 2026
                </span>
                <h2 className="lab-upcoming-title">Laboratorio de Pensamiento Científico</h2>
                <p className="lab-upcoming-lead">
                  El método científico transformado en una aventura de indagación para la infancia: hipótesis visuales, astronomía mesoamericana, experimentos de física lúdica y maquetas didácticas.
                </p>

                <div className="lab-upcoming-pillars">
                  <div className="lab-pillar-item">
                    <span>🔍</span>
                    <span>Indagación y formulación de preguntas</span>
                  </div>
                  <div className="lab-pillar-item">
                    <span>🌌</span>
                    <span>Cosmología y astronomía práctica</span>
                  </div>
                  <div className="lab-pillar-item">
                    <span>💧</span>
                    <span>Fenómenos naturales y medio ambiente</span>
                  </div>
                  <div className="lab-pillar-item">
                    <span>📊</span>
                    <span>Registro y divulgación escolar</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button 
                    type="button"
                    className="btn-main-register"
                    onClick={() => {
                      soundEffects.playClick();
                      setIsRegisterModalOpen(true);
                    }}
                  >
                    <span>🔔</span>
                    <span>Avisarme cuando abra inscripciones</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn-jump-schedule"
                    onClick={handleBackToLobby}
                  >
                    <span>← Volver al Lobby de Talleres</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      )}

      {/* =========================================================================
          MODAL DE INSCRIPCIÓN REDISEÑADO
          ========================================================================= */}
      {isRegisterModalOpen && createPortal(
        <div 
          className="lab-modal-overlay" 
          onClick={() => setIsRegisterModalOpen(false)}
        >
          <div 
            className="lab-modal-card animate-zoom-in" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              className="lab-modal-close" 
              onClick={() => {
                soundEffects.playClick();
                setIsRegisterModalOpen(false);
              }}
              aria-label="Cerrar formulario"
            >
              ✕
            </button>

            <div className="lab-modal-header">
              <span className="lab-modal-badge">Inscripción Oficial Docente</span>
              <h3 className="lab-modal-title">Reserva de Cupo</h3>
              <p className="lab-modal-desc">
                Completa tus datos para confirmar tu participación en las sesiones de los Laboratorios Formativos de Editorial Lluvia de Ideas.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit}>
              <div className="lab-form-group">
                <label htmlFor="reg-name">Nombre Completo del Docente</label>
                <input 
                  id="reg-name"
                  type="text" 
                  className="lab-form-input"
                  placeholder="Ej. Prof. María Morales Gómez"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  autoComplete="name"
                  required
                  disabled={regLoading || regSuccess}
                />
              </div>

              <div className="lab-form-group">
                <label htmlFor="reg-phone">Teléfono / WhatsApp (Guatemala)</label>
                <div className="lab-phone-row">
                  <span className="lab-phone-prefix">+502</span>
                  <input 
                    id="reg-phone"
                    type="tel" 
                    className="lab-form-input lab-phone-input"
                    placeholder="4567 8901"
                    maxLength={8}
                    value={regPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      if (val.length <= 8) setRegPhone(val);
                    }}
                    autoComplete="tel"
                    required
                    disabled={regLoading || regSuccess}
                  />
                </div>
              </div>

              <div className="lab-form-group">
                <label htmlFor="reg-school">Establecimiento Educativo / Colegio</label>
                <input 
                  id="reg-school"
                  type="text" 
                  className="lab-form-input"
                  placeholder="Nombre de la escuela o instituto donde impartes clases"
                  value={regSchool}
                  onChange={(e) => setRegSchool(e.target.value)}
                  required
                  disabled={regLoading || regSuccess}
                />
              </div>

              <div className="lab-commitment-box">
                ⚠️ <strong>Nota de Compromiso:</strong> La formación es gratuita y becada, pero los cupos son limitados. Aceptas asistir con puntualidad a las sesiones presenciales del cronograma.
              </div>

              <label className="lab-checkbox-row" htmlFor="reg-agree">
                <input 
                  id="reg-agree"
                  type="checkbox"
                  checked={regAgreed}
                  onChange={(e) => setRegAgreed(e.target.checked)}
                  disabled={regLoading || regSuccess}
                />
                <span>Confirmo mi compromiso de asistencia a los módulos presenciales.</span>
              </label>

              {regError && (
                <div style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '14px', textAlign: 'center', fontWeight: 700 }}>
                  ⚠️ {regError}
                </div>
              )}

              {regSuccess && (
                <div style={{ color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '14px', borderRadius: '12px', fontSize: '0.92rem', marginBottom: '14px', textAlign: 'center', fontWeight: 800 }}>
                  🎉 ¡Inscripción enviada exitosamente! Te contactaremos vía WhatsApp para confirmar los detalles de la primera sesión.
                </div>
              )}

              <button 
                type="submit" 
                className="lab-form-submit-btn"
                disabled={regLoading || regSuccess || !regAgreed}
              >
                {regLoading ? 'Enviando Inscripción...' : 'Confirmar Mi Inscripción 🚀'}
              </button>
            </form>
          </div>
        </div>
      , document.body)}

    </div>
  );
}
