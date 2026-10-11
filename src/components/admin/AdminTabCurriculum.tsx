import React, { useState, useMemo } from 'react';
import type { PortalConfig } from '../../types';
import { type AdminTabType } from './adminNavConfig';
import { 
  SUTZ_CURRICULUM_MODULES, 
  getCurriculumCoverageSummary,
  type SutzPillarId
} from '../../config/sutzCurriculumConfig';
import './AdminTabCurriculum.css';

interface AdminTabCurriculumProps {
  localConfig: PortalConfig;
  setActiveAdminTab: (tab: AdminTabType) => void;
  onSelectHexForEditing?: (row: number, col: number) => void;
}

const PILLAR_COLORS: Record<SutzPillarId, { bg: string; text: string; border: string }> = {
  sutz: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.35)' },
  creatika: { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.35)' },
  '100tek': { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' },
  lab: { bg: 'rgba(14, 165, 233, 0.15)', text: '#38bdf8', border: 'rgba(14, 165, 233, 0.35)' },
  mercado: { bg: 'rgba(20, 184, 166, 0.15)', text: '#2dd4bf', border: 'rgba(20, 184, 166, 0.35)' },
  tienda: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.35)' }
};

export default function AdminTabCurriculum({
  localConfig,
  setActiveAdminTab,
  onSelectHexForEditing
}: AdminTabCurriculumProps) {
  const mapData = localConfig?.map || [];

  const coverage = useMemo(() => {
    return getCurriculumCoverageSummary(mapData);
  }, [mapData]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const toggleModuleExpanded = (code: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const handleCopyCode = (code: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }).catch(err => {
      console.warn('Error al copiar código:', err);
    });
  };

  const handleGoToHexInMap = (row: number, col: number) => {
    if (onSelectHexForEditing) {
      onSelectHexForEditing(row, col);
    }
    setActiveAdminTab('mapa');
  };

  // KPIs Totales
  const totalChallenges = useMemo(() => {
    return SUTZ_CURRICULUM_MODULES.reduce((acc, m) => acc + (m.challenges?.length || 0), 0);
  }, []);

  const totalProjects = useMemo(() => {
    return SUTZ_CURRICULUM_MODULES.reduce((acc, m) => acc + (m.projects?.length || 0), 0);
  }, []);

  // Filtrado de elementos
  const filteredItems = useMemo(() => {
    return coverage.items.filter(({ module, isActive }) => {
      // Filtro de estado
      if (statusFilter === 'active' && !isActive) return false;
      if (statusFilter === 'inactive' && isActive) return false;

      // Filtro de pilar
      if (selectedPillar !== 'todos' && module.pillarId !== selectedPillar) return false;

      // Búsqueda por texto
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchCode = module.code.toLowerCase().includes(q);
        const matchTitle = module.title.toLowerCase().includes(q);
        const matchRoute = module.route.toLowerCase().includes(q);
        const matchComp = (module.pedagogicalCompetency || '').toLowerCase().includes(q);
        const matchSummary = (module.summary || '').toLowerCase().includes(q);
        const matchChallenges = (module.challenges || []).some(ch => 
          ch.code.toLowerCase().includes(q) || ch.title.toLowerCase().includes(q)
        );
        const matchProjects = (module.projects || []).some(pr => 
          pr.code.toLowerCase().includes(q) || pr.title.toLowerCase().includes(q)
        );
        if (!matchCode && !matchTitle && !matchRoute && !matchComp && !matchSummary && !matchChallenges && !matchProjects) {
          return false;
        }
      }

      return true;
    });
  }, [coverage.items, statusFilter, selectedPillar, searchTerm]);

  return (
    <div className="curriculum-tab-container animate-fade-in">
      {/* Banner Principal de Identidad Curricular */}
      <div className="curriculum-banner">
        <div className="curriculum-banner-top">
          <div className="curriculum-banner-title">
            <span className="curriculum-banner-icon">📋</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3>Catálogo Curricular & Códigos SUTZ-CODE</h3>
                <span className="curriculum-badge-sutzcode">
                  🏷️ Estándar Oficial SUTZ-CODE
                </span>
              </div>
              <p className="curriculum-banner-desc">
                Estructura de codificación unificada <code>[PILAR]-[MÓDULO]-[TIPO][CORRELATIVO]</code>. Identifica de manera práctica qué contenido posee cada código, consulta sus retos pedagógicos asociados y monitorea en tiempo real qué contenidos están <strong>activos</strong> o <strong>inactivos</strong> en el mapa virtual.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveAdminTab('mapa')}
              style={{ fontWeight: 700 }}
              title="Abrir el editor del mapa virtual"
            >
              🗺️ Ir al Editor del Mapa
            </button>
          </div>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="curriculum-kpis-grid">
        <div className="curriculum-kpi-card">
          <div className="curriculum-kpi-icon">📦</div>
          <div className="curriculum-kpi-info">
            <span className="curriculum-kpi-value">{coverage.totalModules}</span>
            <span className="curriculum-kpi-label">Contenidos Totales</span>
          </div>
        </div>

        <div className="curriculum-kpi-card active-card">
          <div className="curriculum-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>🟢</div>
          <div className="curriculum-kpi-info">
            <span className="curriculum-kpi-value" style={{ color: '#34d399' }}>
              {coverage.activeCount} <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>({coverage.activePercentage}%)</span>
            </span>
            <span className="curriculum-kpi-label">Activos en el Mapa</span>
          </div>
        </div>

        <div className="curriculum-kpi-card inactive-card">
          <div className="curriculum-kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>⚪</div>
          <div className="curriculum-kpi-info">
            <span className="curriculum-kpi-value" style={{ color: '#fbbf24' }}>
              {coverage.inactiveCount}
            </span>
            <span className="curriculum-kpi-label">Inactivos / Por Ubicar</span>
          </div>
        </div>

        <div className="curriculum-kpi-card">
          <div className="curriculum-kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>🎯</div>
          <div className="curriculum-kpi-info">
            <span className="curriculum-kpi-value">{totalChallenges}</span>
            <span className="curriculum-kpi-label">Retos Curriculares</span>
          </div>
        </div>

        <div className="curriculum-kpi-card">
          <div className="curriculum-kpi-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>📁</div>
          <div className="curriculum-kpi-info">
            <span className="curriculum-kpi-value">{totalProjects}</span>
            <span className="curriculum-kpi-label">Proyectos Escolares</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="curriculum-toolbar">
        <div className="curriculum-toolbar-row">
          <div className="curriculum-search-box">
            <span className="curriculum-search-icon">🔍</span>
            <input
              type="text"
              className="curriculum-search-input"
              placeholder="Buscar por código (ej: TEK-ATLAS), nombre, pilar, ruta o competencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro de Estado en el Mapa */}
          <div className="curriculum-filter-chips">
            <button
              type="button"
              className={`curriculum-filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              Todos ({coverage.totalModules})
            </button>
            <button
              type="button"
              className={`curriculum-filter-chip status-active ${statusFilter === 'active' ? 'active' : ''}`}
              onClick={() => setStatusFilter('active')}
            >
              🟢 Activos ({coverage.activeCount})
            </button>
            <button
              type="button"
              className={`curriculum-filter-chip status-inactive ${statusFilter === 'inactive' ? 'active' : ''}`}
              onClick={() => setStatusFilter('inactive')}
            >
              ⚪ Inactivos ({coverage.inactiveCount})
            </button>
          </div>
        </div>

        {/* Filtro por Reino / Pilar */}
        <div className="curriculum-toolbar-row" style={{ paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="curriculum-filter-chips">
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, marginRight: '4px' }}>
              Reino:
            </span>
            <button
              type="button"
              className={`curriculum-filter-chip ${selectedPillar === 'todos' ? 'active' : ''}`}
              onClick={() => setSelectedPillar('todos')}
            >
              🌐 Todos los Pilares
            </button>
            <button
              type="button"
              className={`curriculum-filter-chip ${selectedPillar === '100tek' ? 'active' : ''}`}
              onClick={() => setSelectedPillar('100tek')}
            >
              ⚡ 100tek
            </button>
            <button
              type="button"
              className={`curriculum-filter-chip ${selectedPillar === 'creatika' ? 'active' : ''}`}
              onClick={() => setSelectedPillar('creatika')}
            >
              ✨ Creatika
            </button>
            <button
              type="button"
              className={`curriculum-filter-chip ${selectedPillar === 'sutz' ? 'active' : ''}`}
              onClick={() => setSelectedPillar('sutz')}
            >
              ☁️ Sutz
            </button>
            <button
              type="button"
              className={`curriculum-filter-chip ${selectedPillar === 'lab' ? 'active' : ''}`}
              onClick={() => setSelectedPillar('lab')}
            >
              🧪 LAB
            </button>
            <button
              type="button"
              className={`curriculum-filter-chip ${selectedPillar === 'mercado' ? 'active' : ''}`}
              onClick={() => setSelectedPillar('mercado')}
            >
              🛍️ Mercado
            </button>
            <button
              type="button"
              className={`curriculum-filter-chip ${selectedPillar === 'tienda' ? 'active' : ''}`}
              onClick={() => setSelectedPillar('tienda')}
            >
              📚 Tienda
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas de Contenido Curricular */}
      <div className="curriculum-modules-grid">
        {filteredItems.map(({ module, isActive, assignedHexes }) => {
          const pillarTheme = PILLAR_COLORS[module.pillarId] || { bg: 'rgba(255,255,255,0.1)', text: '#cbd5e1', border: 'rgba(255,255,255,0.2)' };
          const isExpanded = Boolean(expandedModules[module.code]);
          const challengesCount = module.challenges?.length || 0;
          const projectsCount = module.projects?.length || 0;

          return (
            <div key={module.code} className="curriculum-card">
              {/* Header de la Tarjeta */}
              <div className="curriculum-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="curriculum-code-badge"
                    onClick={(e) => handleCopyCode(module.code, e)}
                    title="Clic para copiar código SUTZ-CODE"
                  >
                    <span>{module.code}</span>
                    <span className="curriculum-copy-icon">
                      {copiedCode === module.code ? '✅ Copiado' : '📋'}
                    </span>
                  </button>

                  <span 
                    className="curriculum-pillar-badge"
                    style={{ background: pillarTheme.bg, color: pillarTheme.text, border: `1px solid ${pillarTheme.border}` }}
                  >
                    {module.pillarName}
                  </span>
                </div>

                <span className={`curriculum-status-badge ${isActive ? 'active' : 'inactive'}`}>
                  {isActive ? '🟢 Activo en Mapa' : '⚪ Inactivo'}
                </span>
              </div>

              {/* Contenido Principal */}
              <div className="curriculum-card-main">
                <div className="curriculum-card-icon">{module.icon}</div>
                <div className="curriculum-card-titles">
                  <h4 className="curriculum-card-title" title={module.title}>
                    {module.title}
                  </h4>
                  <span className="curriculum-card-route">
                    {module.route}
                  </span>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <span style={{ 
                      fontSize: '0.68rem', 
                      background: 'rgba(255,255,255,0.06)', 
                      padding: '1px 6px', 
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      color: '#94a3b8' 
                    }}>
                      Tipo: {module.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resumen & Competencia */}
              <p className="curriculum-card-desc">
                {module.summary}
              </p>

              {module.pedagogicalCompetency && (
                <div className="curriculum-card-competency">
                  <span className="curriculum-competency-label">Competencia Clave</span>
                  {module.pedagogicalCompetency}
                </div>
              )}

              {/* Botón Acordeón de Retos & Proyectos */}
              {(challengesCount > 0 || projectsCount > 0) && (
                <div style={{ marginTop: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => toggleModuleExpanded(module.code)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '4px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{isExpanded ? '▼' : '►'}</span>
                    <span>
                      {challengesCount > 0 ? `🎯 ${challengesCount} Retos` : ''} 
                      {challengesCount > 0 && projectsCount > 0 ? ' · ' : ''}
                      {projectsCount > 0 ? `📁 ${projectsCount} Proyectos` : ''}
                    </span>
                  </button>

                  {isExpanded && (
                    <div style={{ 
                      marginTop: '8px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '8px', 
                      background: 'rgba(0,0,0,0.25)', 
                      padding: '10px', 
                      borderRadius: '8px' 
                    }}>
                      {/* Retos */}
                      {challengesCount > 0 && (
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#a78bfa', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                            Retos Gamificados
                          </div>
                          {module.challenges.map(ch => (
                            <div 
                              key={ch.code}
                              style={{ 
                                fontSize: '0.75rem', 
                                padding: '4px 6px', 
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <strong style={{ color: '#ffffff' }}>{ch.code}</strong>: {ch.title}
                              </div>
                              <div style={{ display: 'flex', gap: '4px', opacity: 0.8, fontSize: '0.7rem' }}>
                                <span>⭐ {ch.rewards?.puntosXp || 0} XP</span>
                                <span>💎 {ch.rewards?.gemas || 0}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Proyectos */}
                      {projectsCount > 0 && (
                        <div style={{ marginTop: '4px' }}>
                          <div style={{ fontSize: '0.72rem', color: '#f472b6', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                            Proyectos Escolares
                          </div>
                          {module.projects.map(pr => (
                            <div 
                              key={pr.code}
                              style={{ 
                                fontSize: '0.75rem', 
                                padding: '4px 6px', 
                                borderBottom: '1px solid rgba(255,255,255,0.05)'
                              }}
                            >
                              <strong style={{ color: '#ffffff' }}>{pr.code}</strong>: {pr.title}
                              <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                                Entrega: {pr.deliverableType}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Footer: Presencia en Mapa & Acciones */}
              <div className="curriculum-card-footer">
                <div>
                  {isActive ? (
                    <div className="curriculum-hex-coords">
                      <span>Ubicado en:</span>
                      {assignedHexes.map(hex => (
                        <span key={hex.id} className="curriculum-hex-chip">
                          Hex ({hex.row}, {hex.col})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      Sin celda asignada en el mapa
                    </span>
                  )}
                </div>

                <div>
                  {isActive ? (
                    <button
                      type="button"
                      className="curriculum-card-btn"
                      onClick={() => {
                        const first = assignedHexes[0];
                        if (first) handleGoToHexInMap(first.row, first.col);
                        else setActiveAdminTab('mapa');
                      }}
                      title="Ver y editar este hexágono en el mapa virtual"
                    >
                      👁️ Ver en Mapa
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="curriculum-card-btn locate-btn"
                      onClick={() => setActiveAdminTab('mapa')}
                      title="Ir al editor del mapa para ubicar este contenido"
                    >
                      🗺️ Ubicar en Mapa
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="curriculum-empty-state">
          <span className="curriculum-empty-icon">🔍</span>
          <h4>No se encontraron contenidos con los filtros seleccionados</h4>
          <p>Prueba ajustando el término de búsqueda o cambiando el filtro de estado o pilar.</p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedPillar('todos');
              setStatusFilter('all');
            }}
            style={{ marginTop: '10px' }}
          >
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  );
}
