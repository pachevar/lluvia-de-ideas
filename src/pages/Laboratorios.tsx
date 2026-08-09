import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { usePortalConfig } from '../context/PortalConfigContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { formatDateSpanish } from '../utils/dateUtils';

// Helper
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
  return dates[moduleId - 1] || "";
};

export default function Laboratorios() {
  const { labId } = useParams<{ labId?: string }>();
  const navigate = useNavigate();
  const { config } = usePortalConfig();

  // Active laboratory sub-view: defaults to 'animacion-educativa'
  const activeSubLab = labId || 'animacion-educativa';

  const modulesList = config.laboratorios?.modules || [];
  const [activeLabModule, setActiveLabModule] = useState<number>(1);

  // Modal and form state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [regAgreed, setRegAgreed] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess(false);

    if (!regName.trim() || !regPhone.trim() || !regSchool.trim()) {
      setRegError('Por favor, completa todos los campos del formulario.');
      return;
    }

    if (!regAgreed) {
      setRegError('Debes aceptar el compromiso de asistencia para enviar el formulario.');
      return;
    }

    if (regPhone.trim().length !== 8) {
      setRegError('El número de teléfono debe tener exactamente 8 dígitos.');
      return;
    }

    setRegLoading(true);
    try {
      await addDoc(collection(db, 'inscripciones'), {
        name: regName.trim(),
        phone: '+502 ' + regPhone.trim(),
        school: regSchool.trim(),
        agreed: regAgreed,
        timestamp: new Date().toISOString()
      });
      setRegSuccess(true);
      setRegName('');
      setRegPhone('');
      setRegSchool('');
      setRegAgreed(false);
      setTimeout(() => {
        setIsRegisterModalOpen(false);
        setRegSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error("Error saving registration:", err);
      setRegError('Ocurrió un error al enviar tu inscripción. Inténtalo de nuevo.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="tab-pane animate-fade-in">
      {/* Encabezado y Selector de Sub-Laboratorios */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <span className="badge badge-tertiary">Centro de Innovación Educativa</span>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', margin: '10px 0' }}>Laboratorios Formativos</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto 25px', lineHeight: '1.5' }}>
          Espacios prácticos de formación y metodologías activas diseñados para potenciar la creatividad y la innovación docente en el aula.
        </p>

        {/* Submenú de Laboratorios */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${activeSubLab === 'animacion-educativa' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => navigate('/laboratorios/animacion-educativa')}
            style={{ borderRadius: '9999px', padding: '10px 20px', fontWeight: 'bold', fontSize: '0.9rem' }}
          >
            🎬 Animación Educativa
          </button>
          <button 
            className={`btn ${activeSubLab === 'robotica-educativa' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => navigate('/laboratorios/robotica-educativa')}
            style={{ borderRadius: '9999px', padding: '10px 20px', fontWeight: 'bold', fontSize: '0.9rem' }}
          >
            🤖 Robótica Educativa <small style={{ opacity: 0.8, fontSize: '0.7rem', marginLeft: '4px' }}>(Próximamente)</small>
          </button>
          <button 
            className={`btn ${activeSubLab === 'pensamiento-cientifico' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => navigate('/laboratorios/pensamiento-cientifico')}
            style={{ borderRadius: '9999px', padding: '10px 20px', fontWeight: 'bold', fontSize: '0.9rem' }}
          >
            🔬 Pensamiento Científico <small style={{ opacity: 0.8, fontSize: '0.7rem', marginLeft: '4px' }}>(Próximamente)</small>
          </button>
        </div>
      </div>

      {/* --- SUB-LABORATORIO 1: ANIMACIÓN EDUCATIVA (INFORMACIÓN ACTUAL) --- */}
      {(activeSubLab === 'animacion-educativa' || !activeSubLab) && (
        <section className="game-section lab-section-new animate-fade-in">
          <div className="section-intro">
            <span className="badge badge-primary">Módulo Activo 2026</span>
            <h2 className="gradient-text">Laboratorio de Animación Educativa</h2>
            <p className="lab-intro-lead">
              {config.laboratorios?.intro}
            </p>
          </div>

          <div className="lab-layout-container">
            {/* Desktop Layout */}
            <div className="lab-desktop-layout">
              <div className="lab-sidebar-tabs">
                {modulesList.map((mod) => (
                  <button
                    key={mod.id}
                    className={`lab-tab-button ${activeLabModule === mod.id ? 'active' : ''}`}
                    onClick={() => setActiveLabModule(mod.id)}
                  >
                    <span className="lab-tab-icon">{mod.icon}</span>
                    <span className="lab-tab-title-text">
                      <span className="lab-tab-num">Módulo {mod.id}</span>
                      <span className="lab-tab-name">{mod.title}</span>
                    </span>
                  </button>
                ))}
              </div>

              {(() => {
                const selectedMod = modulesList.find(m => m.id === activeLabModule) || modulesList[0];
                if (!selectedMod) return null;
                return (
                  <div className="lab-module-details-panel card-glass animate-fade-in" key={selectedMod.id}>
                    <div className="module-detail-header">
                      <span className="module-large-icon">{selectedMod.icon}</span>
                      <div>
                        <span className="module-detail-badge">Módulo {selectedMod.id}</span>
                        <h3>{selectedMod.title}</h3>
                      </div>
                    </div>

                    <div className="module-detail-content">
                      <div className="competency-box">
                        <h4>🎯 Competencia</h4>
                        <p>{selectedMod.competency}</p>
                      </div>

                      <div className="skills-box">
                        <h4>✨ Habilidades a Desarrollar</h4>
                        <ul className="skills-list">
                          {selectedMod.skills.map((skill, index) => (
                            <li key={index}>
                              <span className="skill-bullet">✦</span>
                              <span className="skill-text">{skill}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="module-detail-footer">
                      <p className="footer-callout">
                        💡 <em>Aplica estas metodologías activas y lidera el cambio pedagógico en tu aula.</em>
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Mobile Layout: Accordion */}
            <div className="lab-mobile-accordion">
              {modulesList.map((mod) => {
                const isOpen = activeLabModule === mod.id;
                return (
                  <div
                    key={mod.id}
                    className={`lab-accordion-item card-glass ${isOpen ? 'open' : ''}`}
                  >
                    <button
                      className="lab-accordion-header"
                      onClick={() => setActiveLabModule(isOpen ? 0 : mod.id)}
                    >
                      <span className="accordion-icon">{mod.icon}</span>
                      <div className="accordion-header-text">
                        <span className="accordion-num">Módulo {mod.id}</span>
                        <h3 className="accordion-title">{mod.title}</h3>
                      </div>
                      <span className="accordion-arrow">{isOpen ? '▲' : '▼'}</span>
                    </button>

                    {isOpen && (
                      <div className="lab-accordion-content animate-fade-in">
                        <div className="competency-box">
                          <h4>🎯 Competencia</h4>
                          <p>{mod.competency}</p>
                        </div>

                        <div className="skills-box">
                          <h4>✨ Habilidades a Desarrollar</h4>
                          <ul className="skills-list">
                            {mod.skills.map((skill, index) => (
                              <li key={index}>
                                <span className="skill-bullet">✦</span>
                                <span className="skill-text">{skill}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule */}
          <div className="lab-schedule-section">
            <div className="schedule-header">
              <span className="badge badge-primary">Calendario</span>
              <h3 className="gradient-text">📅 Cronograma del Laboratorio</h3>
              <p className="schedule-intro-text">
                Organiza tu agenda para asistir a las sesiones en vivo de cada módulo. Haz clic en cualquier tarjeta de fecha para ver los detalles del módulo correspondiente en el panel superior.
              </p>
              
              <div className="schedule-info-bar card-glass">
                <div className="schedule-info-item">
                  <span className="info-icon">⏰</span>
                  <div className="info-text">
                    <strong>Horario:</strong> 2:00 PM a 5:00 PM
                  </div>
                </div>
                <div className="schedule-info-item">
                  <span className="info-icon">📍</span>
                  <div className="info-text">
                    <strong>Lugar:</strong> Lugar céntrico por confirmar
                  </div>
                </div>
              </div>
            </div>
            
            <div className="schedule-grid">
              {modulesList.map((mod) => {
                const isUpcoming = mod.id > 8;
                const dateText = formatDateSpanish(mod.date || getModuleDate(mod.id));
                const timeText = mod.time || (isUpcoming ? "Por definir (con el grupo)" : "2:00 PM a 5:00 PM");
                const locationText = mod.location || "Lugar céntrico por confirmar";
                const typeText = mod.type || "Presencial";
                return (
                  <div
                    key={mod.id}
                    className={`schedule-card card-glass ${activeLabModule === mod.id ? 'active' : ''} ${isUpcoming ? 'upcoming-card' : ''}`}
                    onClick={() => {
                      setActiveLabModule(mod.id);
                      document.querySelector('.lab-section-new')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <div className="schedule-card-header">
                      <span className="schedule-mod-num">Módulo {mod.id}</span>
                      <span className="schedule-badge-type">{typeText}</span>
                    </div>
                    <h4 className="schedule-mod-title">{mod.title}</h4>
                    
                    <div className="schedule-card-details">
                      <div className="schedule-detail-row">
                        <span className="schedule-detail-icon">📅</span>
                        <span className="schedule-detail-text">
                          <strong>Fecha:</strong> {dateText}
                        </span>
                      </div>
                      <div className="schedule-detail-row">
                        <span className="schedule-detail-icon">⏰</span>
                        <span className="schedule-detail-text">
                          <strong>Horario:</strong> {timeText}
                        </span>
                      </div>
                      <div className="schedule-detail-row">
                        <span className="schedule-detail-icon">📍</span>
                        <span className="schedule-detail-text">
                          <strong>Lugar:</strong> {locationText}
                        </span>
                      </div>
                    </div>
                    
                    <span className="schedule-icon-bg">{mod.icon}</span>
                  </div>
                );
              })}
            </div>
            <div className="lab-registration-cta-row" style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
              <button className="btn btn-primary btn-large animate-pulse" onClick={() => setIsRegisterModalOpen(true)}>
                📝 Inscribirse al Laboratorio de Animación Educativa
              </button>
            </div>
          </div>
        </section>
      )}

      {/* --- SUB-LABORATORIO 2: ROBÓTICA EDUCATIVA (PRÓXIMAMENTE) --- */}
      {activeSubLab === 'robotica-educativa' && (
        <section className="game-section lab-section-new animate-fade-in">
          <div className="section-intro" style={{ textAlign: 'center' }}>
            <span className="badge badge-tertiary">Próximo Laboratorio</span>
            <h2 className="gradient-text">🤖 Laboratorio de Robótica Educativa</h2>
            <p className="lab-intro-lead" style={{ maxWidth: '700px', margin: '15px auto' }}>
              Espacio práctico de innovación tecnológica orientado al diseño de sensores, automatización básica y pensamiento computacional aplicable a proyectos escolares.
            </p>
          </div>

          <div className="card-glass" style={{ padding: '40px', borderRadius: '24px', textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '15px' }}>🤖🛠️⚙️</span>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-title)', marginBottom: '12px' }}>Próxima Apertura 2026</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '25px' }}>
              Estamos preparando la infraestructura de kits y módulos de formación en robótica para docentes. Al igual que el Laboratorio de Animación Educativa, contará con sesiones presenciales y certificación.
            </p>

            <button className="btn btn-primary" onClick={() => navigate('/laboratorios/animacion-educativa')}>
              🎬 Ver Laboratorio Activo de Animación Educativa ➔
            </button>
          </div>
        </section>
      )}

      {/* --- SUB-LABORATORIO 3: PENSAMIENTO CIENTÍFICO (PRÓXIMAMENTE) --- */}
      {activeSubLab === 'pensamiento-cientifico' && (
        <section className="game-section lab-section-new animate-fade-in">
          <div className="section-intro" style={{ textAlign: 'center' }}>
            <span className="badge badge-tertiary">Próximo Laboratorio</span>
            <h2 className="gradient-text">🔬 Laboratorio de Pensamiento Científico</h2>
            <p className="lab-intro-lead" style={{ maxWidth: '700px', margin: '15px auto' }}>
              Formación docente en formulación de hipótesis, experimentación STEAM, física recreativa y divulgación científica infantil.
            </p>
          </div>

          <div className="card-glass" style={{ padding: '40px', borderRadius: '24px', textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '15px' }}>🔬🪐🧪</span>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-title)', marginBottom: '12px' }}>Próxima Apertura 2026</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '25px' }}>
              Un espacio dedicado al método científico práctico, astronomía interactiva y maquetas vectoriales para el aula de clase.
            </p>

            <button className="btn btn-primary" onClick={() => navigate('/laboratorios/animacion-educativa')}>
              🎬 Ver Laboratorio Activo de Animación Educativa ➔
            </button>
          </div>
        </section>
      )}

      {/* Registration Modal */}
      {isRegisterModalOpen && createPortal(
        <div className="modal-overlay" onClick={() => setIsRegisterModalOpen(false)}>
          <div className="modal-content card-glass register-modal-content animate-zoom-in" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn" 
              onClick={() => setIsRegisterModalOpen(false)}
              aria-label="Cerrar formulario"
            >
              ✕
            </button>
            <div className="register-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="register-modal-icon" style={{ fontSize: '2rem' }}>📝</span>
                <h2 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>Inscripción al Laboratorio</h2>
              </div>
              <p className="register-modal-desc" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                Completa tus datos para reservar tu cupo en las sesiones presenciales de animación educativa.
              </p>

              <form onSubmit={handleRegisterSubmit} className="register-modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
                <div className="form-group-lab" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="reg-name" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-title)' }}>Nombre Completo</label>
                  <input 
                    id="reg-name"
                    type="text" 
                    placeholder="Escribe tu nombre y apellido"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    disabled={regLoading || regSuccess}
                    style={{ background: 'rgba(147, 51, 234, 0.04)', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.95rem', outline: 'none' }}
                  />
                </div>

                <div className="form-group-lab" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="reg-phone" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-title)' }}>Teléfono / WhatsApp</label>
                  <div className="phone-input-wrapper" style={{ display: 'flex', alignItems: 'stretch' }}>
                    <span className="phone-prefix" style={{ display: 'flex', alignItems: 'center', background: 'rgba(147, 51, 234, 0.08)', border: '1px solid var(--border-color)', borderRight: 'none', padding: '0 14px', borderRadius: '12px 0 0 12px', fontSize: '0.95rem', fontWeight: 650, color: 'var(--text-title)', userSelect: 'none' }}>
                      +502
                    </span>
                    <input 
                      id="reg-phone"
                      type="tel" 
                      placeholder="4567 8901"
                      maxLength={8}
                      value={regPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length <= 8) setRegPhone(val);
                      }}
                      required
                      disabled={regLoading || regSuccess}
                      style={{ flex: 1, background: 'rgba(147, 51, 234, 0.04)', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: '0 12px 12px 0', color: 'var(--text-main)', fontSize: '0.95rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div className="form-group-lab" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="reg-school" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-title)' }}>Colegio o Instituto de enseñanza</label>
                  <input 
                    id="reg-school"
                    type="text" 
                    placeholder="Nombre del establecimiento educativo"
                    value={regSchool}
                    onChange={(e) => setRegSchool(e.target.value)}
                    required
                    disabled={regLoading || regSuccess}
                    style={{ background: 'rgba(147, 51, 234, 0.04)', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.95rem', outline: 'none' }}
                  />
                </div>

                <div className="commitment-callout" style={{ background: 'rgba(245, 158, 11, 0.08)', borderLeft: '4px solid var(--warning)', padding: '12px 16px', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#b45309', lineHeight: '1.4' }}>
                    ⚠️ <strong>Nota de compromiso:</strong> El taller es completamente gratuito pero requiere de tu asistencia y participación constante en todas las sesiones presenciales del cronograma.
                  </p>
                </div>

                <div className="checkbox-lab-container" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '4px' }}>
                  <input 
                    id="reg-agree"
                    type="checkbox"
                    checked={regAgreed}
                    onChange={(e) => setRegAgreed(e.target.checked)}
                    disabled={regLoading || regSuccess}
                    style={{ marginTop: '3px', cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="reg-agree" style={{ fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer', lineHeight: '1.4' }}>
                    Acepto asistir presencialmente a los módulos y comprometerme con la formación.
                  </label>
                </div>

                {regError && <div className="form-error-banner" style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '10px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 600 }}>{regError}</div>}
                {regSuccess && (
                  <div className="form-success-banner" style={{ color: 'var(--secondary)', background: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '10px', fontSize: '0.9rem', textAlign: 'center', fontWeight: 700 }}>
                    🎉 ¡Inscripción enviada con éxito! Tu cupo ha sido reservado.
                  </div>
                )}

                <div className="register-form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => setIsRegisterModalOpen(false)}
                    disabled={regLoading}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-sm"
                    disabled={regLoading || regSuccess || !regAgreed}
                  >
                    {regLoading ? 'Enviando...' : 'Enviar Inscripción 🚀'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
