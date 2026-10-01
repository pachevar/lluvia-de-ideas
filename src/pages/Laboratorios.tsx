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

  const scrollToSchedule = () => {
    soundEffects.playClick();
    const el = document.getElementById('cronograma-laboratorio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
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
                <p className="lab-hero-lead">
                  {config.laboratorios?.intro || 'Transforma tu práctica docente mediante experiencias de aprendizaje basadas en la narrativa, el juego y la producción de animación en el aula.'}
                </p>
              </header>

              {/* Barra de Métricas y Características del Taller */}
              <section className="lab-stats-grid">
                <div className="lab-stat-card">
                  <div className="lab-stat-icon-wrap">🎓</div>
                  <div className="lab-stat-info">
                    <span className="lab-stat-val">10 Módulos</span>
                    <span className="lab-stat-label">Progresivos y prácticos</span>
                  </div>
                </div>

                <div className="lab-stat-card">
                  <div className="lab-stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                    <span style={{ color: '#10b981' }}>⏱️</span>
                  </div>
                  <div className="lab-stat-info">
                    <span className="lab-stat-val">30 Horas</span>
                    <span className="lab-stat-label">3h presenciales por sesión</span>
                  </div>
                </div>

                <div className="lab-stat-card">
                  <div className="lab-stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.12)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                    <span style={{ color: '#f59e0b' }}>📍</span>
                  </div>
                  <div className="lab-stat-info">
                    <span className="lab-stat-val">Modalidad Viva</span>
                    <span className="lab-stat-label">Presencial en grupo</span>
                  </div>
                </div>

                <div className="lab-stat-card">
                  <div className="lab-stat-icon-wrap" style={{ background: 'rgba(192, 132, 252, 0.12)', borderColor: 'rgba(192, 132, 252, 0.3)' }}>
                    <span style={{ color: '#c084fc' }}>📜</span>
                  </div>
                  <div className="lab-stat-info">
                    <span className="lab-stat-val">Certificación</span>
                    <span className="lab-stat-label">Acreditado por Lluvia de Ideas</span>
                  </div>
                </div>
              </section>

              {/* VISOR DINÁMICO DE MÓDULOS */}
              <section className="lab-showcase-wrapper">
                <div className="lab-showcase-header">
                  <div className="lab-showcase-header-left">
                    <span className="lab-showcase-tag">Programa Formativo Modular</span>
                    <h2 className="lab-showcase-title">Ruta de Formación y Competencias</h2>
                  </div>

                  {/* Botones de navegación Anterior / Siguiente */}
                  <div className="lab-module-arrows">
                    <button 
                      type="button"
                      className="lab-module-arrow-btn"
                      onClick={handlePrevModule}
                      disabled={activeLabModule <= 1}
                      title="Módulo anterior"
                    >
                      ◀ Anterior
                    </button>
                    <button 
                      type="button"
                      className="lab-module-arrow-btn"
                      onClick={handleNextModule}
                      disabled={activeLabModule >= modulesList.length}
                      title="Siguiente módulo"
                    >
                      Siguiente ▶
                    </button>
                  </div>
                </div>

                {/* Riel Horizontal de Módulos (1 a 10) */}
                <div className="lab-modules-rail">
                  {modulesList.map((mod) => {
                    const isActive = activeLabModule === mod.id;
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        className={`lab-rail-item ${isActive ? 'active' : ''}`}
                        onClick={() => handleSelectModule(mod.id)}
                        title={`Ver Módulo ${mod.id}: ${mod.title}`}
                      >
                        <span className="lab-rail-icon">{mod.icon}</span>
                        <div className="lab-rail-text">
                          <span className="lab-rail-num">Módulo {mod.id}</span>
                          <span className="lab-rail-title">{mod.title}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Ficha de Detalle del Módulo Activo */}
                {currentMod && (
                  <article className="lab-card-detail animate-fade-in" key={currentMod.id}>
                    
                    {/* Cabecera del Módulo */}
                    <div className="lab-detail-header-row">
                      <div className="lab-detail-big-icon">
                        {currentMod.icon}
                      </div>
                      <div className="lab-detail-meta">
                        <div className="lab-detail-badge-row">
                          <span className="lab-detail-mod-badge">Módulo {currentMod.id} de {modulesList.length}</span>
                          {currentExtras?.phase && (
                            <span className="lab-detail-phase-badge">{currentExtras.phase}</span>
                          )}
                          {currentExtras?.duration && (
                            <span className="lab-detail-phase-badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                              ⏱️ {currentExtras.duration}
                            </span>
                          )}
                        </div>
                        <h3 className="lab-detail-title">{currentMod.title}</h3>
                      </div>
                    </div>

                    {/* Tarjeta de Competencia Pedagógica */}
                    <div className="lab-competency-card">
                      <h4 className="lab-competency-title">
                        <span>🎯</span> Competencia Docente Central
                      </h4>
                      <p className="lab-competency-text">
                        {currentMod.competency}
                      </p>
                    </div>

                    {/* Habilidades y Destrezas Clave en Chips */}
                    <div className="lab-skills-container">
                      <h4 className="lab-skills-title">
                        <span>✨</span> Habilidades a Desarrollar
                      </h4>
                      <div className="lab-skills-chips">
                        {currentMod.skills.map((skill, idx) => (
                          <div className="lab-skill-chip" key={idx}>
                            <span className="lab-skill-bullet">✦</span>
                            <span>{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Entregable / Producto del Taller */}
                    {currentExtras?.deliverable && (
                      <div className="lab-competency-card" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                        <h4 className="lab-competency-title" style={{ color: '#34d399' }}>
                          <span>📦</span> Producto Aplicable al Aula (Entregable Docente)
                        </h4>
                        <p className="lab-competency-text" style={{ color: '#e2e8f0', fontSize: '0.98rem' }}>
                          {currentExtras.deliverable}
                        </p>
                      </div>
                    )}

                    {/* Barra de Acciones del Módulo */}
                    <div className="lab-card-actions">
                      <div className="lab-date-quick-badge">
                        <span>📅 Fecha programada:</span>
                        <strong>{formatDateSpanish(currentMod.date || getModuleDate(currentMod.id))}</strong>
                      </div>

                      <div className="lab-card-btns">
                        <button
                          type="button"
                          className="btn-jump-schedule"
                          onClick={scrollToSchedule}
                        >
                          <span>📅</span>
                          <span>Ver en Cronograma</span>
                        </button>

                        <button
                          type="button"
                          className="btn-register-highlight"
                          onClick={() => {
                            soundEffects.playClick();
                            setIsRegisterModalOpen(true);
                          }}
                        >
                          <span>📝</span>
                          <span>Inscribirme al Taller</span>
                        </button>
                      </div>
                    </div>
                  </article>
                )}
              </section>

              {/* CRONOGRAMA INTERACTIVO DE SESIONES */}
              <section id="cronograma-laboratorio" className="lab-schedule-box">
                <div className="lab-schedule-header-wrap">
                  <span className="lab-schedule-badge">Agenda Formativa</span>
                  <h2 className="lab-schedule-title">📅 Cronograma de Sesiones Presenciales</h2>
                  <p className="lab-schedule-desc">
                    Haz clic en cualquier fecha para previsualizar los detalles del módulo en el visor superior. La formación está diseñada para acompañarte paso a paso sin saturar tus tiempos lectivos.
                  </p>

                  {/* Barra Logística Rápida */}
                  <div className="lab-logistics-bar">
                    <div className="lab-logistics-item">
                      <span>⏰</span>
                      <span><strong>Horario:</strong> 2:00 PM a 5:00 PM</span>
                    </div>
                    <div className="lab-logistics-item">
                      <span>📍</span>
                      <span><strong>Sede:</strong> Lugar céntrico de la Ciudad</span>
                    </div>
                    <div className="lab-logistics-item">
                      <span>🎟️</span>
                      <span><strong>Cupo:</strong> Limitado a docentes inscritos</span>
                    </div>
                  </div>
                </div>

                {/* Grilla de Tarjetas de Sesión */}
                <div className="lab-schedule-grid">
                  {modulesList.map((mod) => {
                    const isUpcoming = mod.id > 8;
                    const isSelected = activeLabModule === mod.id;
                    const dateText = formatDateSpanish(mod.date || getModuleDate(mod.id));
                    const timeText = mod.time || (isUpcoming ? "Por definir con el grupo" : "2:00 PM a 5:00 PM");
                    const locationText = mod.location || "Lugar céntrico por confirmar";
                    const typeText = mod.type || "Presencial";

                    return (
                      <div
                        key={mod.id}
                        className={`lab-schedule-card ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          handleSelectModule(mod.id);
                          const el = document.querySelector('.lab-showcase-wrapper');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        title={`Clic para ver detalles pedagógicos del Módulo ${mod.id}`}
                      >
                        <div className="lab-card-top-info">
                          <span className="lab-card-mod-num">Módulo {mod.id}</span>
                          <span className="lab-card-type-badge">{typeText}</span>
                        </div>

                        <h3 className="lab-card-title">{mod.title}</h3>

                        <div className="lab-card-rows">
                          <div className="lab-card-row">
                            <span>📅</span>
                            <span><strong>Fecha:</strong> {dateText}</span>
                          </div>
                          <div className="lab-card-row">
                            <span>⏰</span>
                            <span><strong>Horario:</strong> {timeText}</span>
                          </div>
                          <div className="lab-card-row">
                            <span>📍</span>
                            <span><strong>Sede:</strong> {locationText}</span>
                          </div>
                        </div>

                        <span className="lab-card-watermark">{mod.icon}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Llamado Central a la Inscripción */}
                <div className="lab-main-cta-box">
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
              </section>
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
