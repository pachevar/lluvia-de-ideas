import React, { useState } from 'react';
import type { PortalConfig } from '../../types';
import { formatDateSpanish, formatTime12h, parseTimeRange } from '../../utils/dateUtils';

interface AdminTabLaboratoriosProps {
  localConfig: PortalConfig;
  setLocalConfig: React.Dispatch<React.SetStateAction<PortalConfig | null>>;
  updateModule: (index: number, field: string, value: any) => void;
  updateModuleSkill: (moduleIndex: number, skillIndex: number, value: string) => void;
}

export default function AdminTabLaboratorios({ localConfig, setLocalConfig, updateModule, updateModuleSkill }: AdminTabLaboratoriosProps) {
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);

  return (
    <div className="admin-card card-glass animate-fade-in">
      <h3>🧪 Configuración del Laboratorio de Animación Educativa</h3>
      <p className="tab-section-desc">Configura los textos introductorios, competencias y habilidades de los 10 módulos formativos del laboratorio de animación.</p>

      <div className="admin-form-section">
        <h4>Introducción del Laboratorio</h4>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Párrafo Introductorio de Animación Educativa</label>
            <textarea 
              rows={3} 
              value={localConfig.laboratorios.intro} 
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
          </div>
        </div>
      </div>

      <div className="admin-form-section">
        <h4>Módulos Formativos (10 Módulos)</h4>
        <p className="admin-section-help">Selecciona un módulo en la lista lateral para editar su información detallada de manera individual.</p>

        <div className="admin-master-detail-layout">
          {/* Master Selector Sidebar */}
          <div className="admin-modules-selector-list">
            {localConfig.laboratorios.modules.map((mod, modIdx) => (
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
          {localConfig.laboratorios.modules[selectedModuleIdx] && (() => {
            const mod = localConfig.laboratorios.modules[selectedModuleIdx];
            const modIdx = selectedModuleIdx;
            return (
              <div className="admin-module-detail-editor admin-nested-card active animate-fade-in">
                <div className="admin-nested-header">
                  <span className="admin-nested-icon">{mod.icon}</span>
                  <h5>Editando Módulo {mod.id}: {mod.title}</h5>
                </div>

                <div className="admin-form-row two-cols-small">
                  <div className="admin-form-group">
                    <label>Título del Módulo</label>
                    <input 
                      type="text" 
                      value={mod.title} 
                      onChange={(e) => updateModule(modIdx, 'title', e.target.value)} 
                    />
                  </div>
                  <div className="admin-form-group max-width-100">
                    <label>Emoji / Icono</label>
                    <input 
                      type="text" 
                      value={mod.icon} 
                      onChange={(e) => updateModule(modIdx, 'icon', e.target.value)} 
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Competencia Principal</label>
                    <textarea 
                      rows={3} 
                      value={mod.competency} 
                      onChange={(e) => updateModule(modIdx, 'competency', e.target.value)} 
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Habilidades a Desarrollar</label>
                    <span className="field-helper-text" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Edita los 4 aspectos clave que los docentes desarrollarán en este módulo.</span>
                    <div className="admin-skills-inputs-grid">
                      {mod.skills.map((skill, skillIdx) => (
                        <div key={skillIdx} className="skill-input-row">
                          <span className="skill-idx-label">{skillIdx + 1}</span>
                          <input 
                            type="text" 
                            value={skill} 
                            onChange={(e) => updateModuleSkill(modIdx, skillIdx, e.target.value)} 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cronograma Card Editor */}
                <div className="admin-form-section" style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <h5 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '6px' }}>📅 Cronograma del Módulo</h5>
                  <p className="admin-section-help" style={{ marginBottom: '16px' }}>Modifica la información que se muestra en la tarjeta de fecha para este módulo.</p>
                  
                  <div className="admin-form-row two-cols">
                    <div className="admin-form-group">
                      {(() => {
                        const isDateSelector = /^\d{4}-\d{2}-\d{2}$/.test(mod.date || '');
                        return (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <label style={{ margin: 0 }}>Fecha de la Sesión</label>
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
                                  Vista: <strong>{formatDateSpanish(mod.date || '2026-06-12')}</strong>
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
                    <div className="admin-form-group">
                      {(() => {
                        const { start24, end24, isRange } = parseTimeRange(mod.time || '');
                        return (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <label style={{ margin: 0 }}>Horario de la Sesión</label>
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
                                  Vista: <strong>{mod.time}</strong>
                                </span>
                              </div>
                            ) : (
                              <input 
                                type="text" 
                                value={mod.time || ''} 
                                placeholder="Ej: 2:00 PM a 5:00 PM"
                                onChange={(e) => updateModule(modIdx, 'time', e.target.value)} 
                              />
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="admin-form-row two-cols" style={{ marginTop: '12px' }}>
                    <div className="admin-form-group">
                      <label>Lugar</label>
                      <input 
                        type="text" 
                        value={mod.location || ''} 
                        placeholder="Ej: Lugar céntrico por confirmar"
                        onChange={(e) => updateModule(modIdx, 'location', e.target.value)} 
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Modalidad / Tipo</label>
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
                            flex: '0 0 140px',
                            background: 'rgba(255, 255, 255, 0.8)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          <option value="Presencial" style={{ color: '#000' }}>Presencial</option>
                          <option value="Virtual" style={{ color: '#000' }}>Virtual</option>
                          <option value="Híbrido" style={{ color: '#000' }}>Híbrido</option>
                          <option value="Otro" style={{ color: '#000' }}>Otro...</option>
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
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
