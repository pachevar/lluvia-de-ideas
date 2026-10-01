import React, { useState } from 'react';
import type { PortalConfig } from '../../types';
import { formatDateSpanish, formatTime12h, parseTimeRange } from '../../utils/dateUtils';

interface AdminTabLaboratoriosProps {
  localConfig: PortalConfig;
  setLocalConfig: React.Dispatch<React.SetStateAction<PortalConfig | null>>;
  updateModule: (index: number, field: string, value: unknown) => void;
  updateModuleSkill: (moduleIndex: number, skillIndex: number, value: string) => void;
}

const EMOJI_PRESETS = ['🎬', '📜', '🎭', '🎨', '🤖', '🎙️', '💡', '✂️', '📱', '🏆', '📐', '🔬', '🚀', '🎪', '🧩', '🌟'];

const PHASE_PRESETS = [
  'Fase 1: Narrativa y Creatividad',
  'Fase 2: Arte, Teatro y Expresión',
  'Fase 3: Animación y Proyecto Final',
  'Fase Formativa',
  'Taller Especial STEAM'
];

export default function AdminTabLaboratorios({ localConfig, setLocalConfig, updateModule, updateModuleSkill }: AdminTabLaboratoriosProps) {
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);

  const modules = localConfig.laboratorios.modules || [];
  const currentMod = modules[selectedModuleIdx];

  const handlePrevModule = () => {
    if (selectedModuleIdx > 0) {
      setSelectedModuleIdx(selectedModuleIdx - 1);
    }
  };

  const handleNextModule = () => {
    if (selectedModuleIdx < modules.length - 1) {
      setSelectedModuleIdx(selectedModuleIdx + 1);
    }
  };

  return (
    <div className="admin-card card-glass animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
        <h3 style={{ margin: 0 }}>🧪 LAB: Gestión y Edición de Módulos Formativos</h3>
        <span style={{ 
          background: 'rgba(56, 189, 248, 0.15)', 
          color: '#38bdf8', 
          border: '1px solid rgba(56, 189, 248, 0.35)', 
          padding: '4px 12px', 
          borderRadius: '999px', 
          fontSize: '0.8rem', 
          fontWeight: 800 
        }}>
          {modules.length} Módulos Activos
        </span>
      </div>
      <p className="tab-section-desc">
        Configura los textos pedagógicos, competencias, habilidades, entregables de aula, cronogramas y fechas de cada módulo formativo con actualización instantánea.
      </p>

      {/* Introducción General */}
      <div className="admin-form-section">
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📖</span> Introducción General del Taller
        </h4>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Párrafo Introductorio de Animación Educativa</label>
            <textarea 
              rows={3} 
              value={localConfig.laboratorios.intro} 
              placeholder="Escribe la descripción general de bienvenida al laboratorio..."
              onChange={(e) => {
                setLocalConfig((prev) => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    laboratorios: {
                      ...prev.laboratorios,
                      intro: e.target.value
                    }
                  };
                });
              }} 
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Este párrafo se muestra dentro del desplegable &quot;Descripción y Enfoque Pedagógico&quot;.
            </span>
          </div>
        </div>
      </div>

      {/* Gestor Maestro / Detalle de Módulos */}
      <div className="admin-form-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <div>
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🗂️</span> Editor de Módulos (1 al {modules.length})
            </h4>
            <p className="admin-section-help" style={{ margin: '4px 0 0 0' }}>
              Haz clic en cualquier módulo de la barra para editar sus textos, entregables y fechas en tiempo real.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={handlePrevModule}
              disabled={selectedModuleIdx <= 0}
              style={{ padding: '6px 12px', fontSize: '0.82rem' }}
            >
              ◀ Módulo Anterior
            </button>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={handleNextModule}
              disabled={selectedModuleIdx >= modules.length - 1}
              style={{ padding: '6px 12px', fontSize: '0.82rem' }}
            >
              Siguiente Módulo ▶
            </button>
          </div>
        </div>

        {/* Barra de Selección Rápida de Módulos */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          overflowX: 'auto', 
          paddingBottom: '10px', 
          marginBottom: '20px',
          WebkitOverflowScrolling: 'touch'
        }}>
          {modules.map((mod, modIdx) => {
            const isActive = selectedModuleIdx === modIdx;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => setSelectedModuleIdx(modIdx)}
                style={{
                  flex: '0 0 auto',
                  background: isActive ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(14, 165, 233, 0.35) 100%)' : 'rgba(255, 255, 255, 0.05)',
                  border: isActive ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.84rem',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 2px 10px rgba(56, 189, 248, 0.25)' : 'none'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{mod.icon}</span>
                <span>Mod {mod.id}</span>
              </button>
            );
          })}
        </div>

        <div className="admin-master-detail-layout">
          {/* Master Selector Sidebar */}
          <div className="admin-modules-selector-list">
            {modules.map((mod, modIdx) => (
              <button
                key={mod.id}
                type="button"
                className={`admin-module-selector-card ${selectedModuleIdx === modIdx ? 'active' : ''}`}
                onClick={() => setSelectedModuleIdx(modIdx)}
              >
                <span className="module-selector-badge">Módulo {mod.id}</span>
                <div className="module-selector-details">
                  <span className="module-selector-icon">{mod.icon}</span>
                  <span className="module-selector-title">{mod.title || `Sin Título`}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Detail Editor Form */}
          {currentMod && (() => {
            const mod = currentMod;
            const modIdx = selectedModuleIdx;
            return (
              <div className="admin-module-detail-editor admin-nested-card active animate-fade-in" style={{ padding: '24px' }}>
                <div className="admin-nested-header" style={{ marginBottom: '20px' }}>
                  <span className="admin-nested-icon" style={{ fontSize: '2rem' }}>{mod.icon}</span>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '1.15rem' }}>Editando Módulo {mod.id}: {mod.title}</h5>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configuración pedagógica, habilidades, cronograma y sesión</span>
                  </div>
                </div>

                {/* 1. SECCIÓN: IDENTIDAD DEL MÓDULO */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
                  <h6 style={{ fontSize: '0.88rem', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 14px 0' }}>
                    1. Identidad del Módulo
                  </h6>

                  <div className="admin-form-row two-cols-small">
                    <div className="admin-form-group">
                      <label>Título del Módulo</label>
                      <input 
                        type="text" 
                        value={mod.title} 
                        placeholder="Ej: Fundamentos del Stop-Motion"
                        onChange={(e) => updateModule(modIdx, 'title', e.target.value)} 
                      />
                    </div>
                    <div className="admin-form-group max-width-100">
                      <label>Emoji / Icono</label>
                      <input 
                        type="text" 
                        value={mod.icon} 
                        onChange={(e) => updateModule(modIdx, 'icon', e.target.value)} 
                        style={{ textAlign: 'center', fontSize: '1.2rem' }}
                      />
                    </div>
                  </div>

                  {/* Selector rápido de emojis */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>Sugeridos:</span>
                    {EMOJI_PRESETS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => updateModule(modIdx, 'icon', emoji)}
                        style={{
                          background: mod.icon === emoji ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                          border: mod.icon === emoji ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '6px',
                          padding: '3px 7px',
                          cursor: 'pointer',
                          fontSize: '0.95rem'
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <div className="admin-form-row two-cols" style={{ marginTop: '16px' }}>
                    <div className="admin-form-group">
                      <label>Fase Pedagógica</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <select
                          value={PHASE_PRESETS.includes(mod.phase || '') ? (mod.phase || '') : 'Personalizada'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val !== 'Personalizada') {
                              updateModule(modIdx, 'phase', val);
                            }
                          }}
                          style={{
                            flex: '0 0 160px',
                            background: 'rgba(255, 255, 255, 0.8)',
                            color: '#000',
                            border: '1px solid var(--border-color)',
                            borderRadius: '10px',
                            padding: '8px 10px',
                            fontSize: '0.85rem'
                          }}
                        >
                          {PHASE_PRESETS.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                          <option value="Personalizada">Otra fase...</option>
                        </select>
                        <input 
                          type="text" 
                          value={mod.phase || ''} 
                          placeholder="Ej: Fase 1: Narrativa y Creatividad"
                          onChange={(e) => updateModule(modIdx, 'phase', e.target.value)} 
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>

                    <div className="admin-form-group">
                      <label>Duración Estimada</label>
                      <input 
                        type="text" 
                        value={mod.duration || '3 Horas Prácticas'} 
                        placeholder="Ej: 3 Horas Prácticas"
                        onChange={(e) => updateModule(modIdx, 'duration', e.target.value)} 
                      />
                    </div>
                  </div>
                </div>

                {/* 2. SECCIÓN: ENFOQUE PEDAGÓGICO Y ENTREGABLE */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
                  <h6 style={{ fontSize: '0.88rem', color: '#f472b6', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 14px 0' }}>
                    2. Enfoque Pedagógico, Habilidades y Producto
                  </h6>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>🎯 Competencia Principal Docente</label>
                      <textarea 
                        rows={3} 
                        value={mod.competency} 
                        placeholder="Describe la competencia metodológica o pedagógica que el docente adquiere..."
                        onChange={(e) => updateModule(modIdx, 'competency', e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="admin-form-row" style={{ marginTop: '14px' }}>
                    <div className="admin-form-group">
                      <label>✨ Habilidades Clave a Desarrollar (4 Aspectos)</label>
                      <span className="field-helper-text" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
                        Puntos concretos que se despliegan en la columna de habilidades de este módulo.
                      </span>
                      <div className="admin-skills-inputs-grid">
                        {(mod.skills || []).map((skill, skillIdx) => (
                          <div key={skillIdx} className="skill-input-row">
                            <span className="skill-idx-label">{skillIdx + 1}</span>
                            <input 
                              type="text" 
                              value={skill} 
                              placeholder={`Habilidad ${skillIdx + 1}`}
                              onChange={(e) => updateModuleSkill(modIdx, skillIdx, e.target.value)} 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-row" style={{ marginTop: '14px' }}>
                    <div className="admin-form-group">
                      <label>📦 Producto / Entregable para el Aula</label>
                      <textarea 
                        rows={2}
                        value={mod.deliverable || ''} 
                        placeholder="Ej: Baraja de detonantes y mapa de estructuración rápida de cuentos en el aula..."
                        onChange={(e) => updateModule(modIdx, 'deliverable', e.target.value)} 
                      />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        Describe el artefacto pedagógico tangible que los maestros se llevan listo para aplicar.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. SECCIÓN: CRONOGRAMA, FECHA Y MODALIDAD */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '16px' }}>
                  <h6 style={{ fontSize: '0.88rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 14px 0' }}>
                    3. Cronograma, Horario y Lugar de la Sesión
                  </h6>
                  
                  <div className="admin-form-row two-cols">
                    {/* Selector de Fecha */}
                    <div className="admin-form-group">
                      {(() => {
                        const isDateSelector = /^\d{4}-\d{2}-\d{2}$/.test(mod.date || '');
                        return (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <label style={{ margin: 0 }}>📅 Fecha de la Sesión</label>
                              <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--primary)', userSelect: 'none' }}>
                                <input 
                                  type="checkbox" 
                                  checked={isDateSelector} 
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      updateModule(modIdx, 'date', '2026-06-12');
                                    } else {
                                      updateModule(modIdx, 'date', formatDateSpanish(mod.date || '') || 'Viernes, 12 de Junio');
                                    }
                                  }} 
                                  style={{ width: 'auto', margin: 0 }}
                                />
                                Usar calendario 📅
                              </label>
                            </div>
                            {isDateSelector ? (
                              <div>
                                <input 
                                  type="date" 
                                  value={mod.date || '2026-06-12'} 
                                  onChange={(e) => updateModule(modIdx, 'date', e.target.value)} 
                                />
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                                  Vista: <strong style={{ color: '#38bdf8' }}>{formatDateSpanish(mod.date || '2026-06-12')}</strong>
                                </span>
                              </div>
                            ) : (
                              <input 
                                type="text" 
                                value={mod.date || ''} 
                                placeholder="Ej: Viernes, 12 de Junio o Por acordar..."
                                onChange={(e) => updateModule(modIdx, 'date', e.target.value)} 
                              />
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {/* Selector de Horario */}
                    <div className="admin-form-group">
                      {(() => {
                        const { start24, end24, isRange } = parseTimeRange(mod.time || '');
                        return (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <label style={{ margin: 0 }}>⏰ Horario de la Sesión</label>
                              <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--primary)', userSelect: 'none' }}>
                                <input 
                                  type="checkbox" 
                                  checked={isRange} 
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      updateModule(modIdx, 'time', '2:00 PM a 5:00 PM');
                                    } else {
                                      updateModule(modIdx, 'time', mod.time || '2:00 PM a 5:00 PM');
                                    }
                                  }} 
                                  style={{ width: 'auto', margin: 0 }}
                                />
                                Usar selector de horas ⏰
                              </label>
                            </div>
                            {isRange ? (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <input 
                                    type="time" 
                                    value={start24 || '14:00'} 
                                    onChange={(e) => {
                                      const startVal = e.target.value;
                                      const endVal = end24 || '17:00';
                                      updateModule(modIdx, 'time', `${formatTime12h(startVal)} a ${formatTime12h(endVal)}`);
                                    }} 
                                    style={{ flex: 1 }}
                                  />
                                  <span style={{ color: 'var(--text-muted)' }}>a</span>
                                  <input 
                                    type="time" 
                                    value={end24 || '17:00'} 
                                    onChange={(e) => {
                                      const startVal = start24 || '14:00';
                                      const endVal = e.target.value;
                                      updateModule(modIdx, 'time', `${formatTime12h(startVal)} a ${formatTime12h(endVal)}`);
                                    }} 
                                    style={{ flex: 1 }}
                                  />
                                </div>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                                  Vista: <strong style={{ color: '#10b981' }}>{mod.time}</strong>
                                </span>
                              </div>
                            ) : (
                              <input 
                                type="text" 
                                value={mod.time || ''} 
                                placeholder="Ej: 2:00 PM a 5:00 PM o Por acordar..."
                                onChange={(e) => updateModule(modIdx, 'time', e.target.value)} 
                              />
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="admin-form-row two-cols" style={{ marginTop: '14px' }}>
                    <div className="admin-form-group">
                      <label>📍 Sede / Lugar de Trabajo</label>
                      <input 
                        type="text" 
                        value={mod.location || ''} 
                        placeholder="Ej: Lugar céntrico de la Ciudad"
                        onChange={(e) => updateModule(modIdx, 'location', e.target.value)} 
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>🎟️ Modalidad / Tipo</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                          value={['Presencial', 'Virtual', 'Híbrido'].includes(mod.type || '') ? (mod.type || '') : 'Otro'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val !== 'Otro') {
                              updateModule(modIdx, 'type', val);
                            }
                          }}
                          style={{
                            flex: '0 0 130px',
                            background: 'rgba(255, 255, 255, 0.8)',
                            color: '#000',
                            border: '1px solid var(--border-color)',
                            borderRadius: '10px',
                            padding: '8px 10px',
                            fontSize: '0.85rem'
                          }}
                        >
                          <option value="Presencial">Presencial</option>
                          <option value="Virtual">Virtual</option>
                          <option value="Híbrido">Híbrido</option>
                          <option value="Otro">Otro...</option>
                        </select>
                        <input 
                          type="text" 
                          value={mod.type || ''} 
                          placeholder="Ej: Presencial"
                          onChange={(e) => updateModule(modIdx, 'type', e.target.value)} 
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* VISTA PREVIA RÁPIDA */}
                <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      👀 Vista Previa en Vivo de la Cabecera
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                      Solo título e ícono (minimalista)
                    </span>
                  </div>
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)', 
                    border: '1px solid rgba(56, 189, 248, 0.25)', 
                    borderRadius: '14px', 
                    padding: '14px 20px', 
                    textAlign: 'center' 
                  }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{mod.icon}</span>
                      <span>{mod.title || `Módulo ${mod.id}`}</span>
                    </h3>
                  </div>
                </div>

              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
