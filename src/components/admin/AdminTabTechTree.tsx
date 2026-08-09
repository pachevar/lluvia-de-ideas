import { useState } from 'react';
import type { PortalConfig, TechNode } from '../../types';
import { generateDefaultTechTree } from '../../utils/techTreeUtils';

interface AdminTabTechTreeProps {
  localConfig: PortalConfig;
  updateField: (section: keyof PortalConfig, field: string, value: any) => void;
}

export default function AdminTabTechTree({ localConfig, updateField }: AdminTabTechTreeProps) {
  const [selectedColumn, setSelectedColumn] = useState<number>(1);

  const techNodes: Record<string, TechNode> = localConfig.techTreeNodes || generateDefaultTechTree();

  // Get nodes for selected column
  const currentColumnNodes = Object.values(techNodes).filter(n => n.col === selectedColumn);
  currentColumnNodes.sort((a, b) => a.indexInCol - b.indexInCol);

  const handleNodeChange = (nodeId: string, field: keyof TechNode, value: any) => {
    const updatedMap = { ...techNodes };
    if (updatedMap[nodeId]) {
      updatedMap[nodeId] = {
        ...updatedMap[nodeId],
        [field]: value
      };
    }
    updateField('techTreeNodes' as keyof PortalConfig, '', updatedMap);
  };

  const handleResetTechTree = () => {
    if (window.confirm('¿Deseas restablecer las 30 columnas del Árbol Tecnológico a su estructura predeterminada en blanco?')) {
      const defaultTree = generateDefaultTechTree();
      updateField('techTreeNodes' as keyof PortalConfig, '', defaultTree);
    }
  };

  return (
    <div className="admin-tab-tech-tree animate-fade-in">
      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>🌳 Árbol Tecnológico de Sutz (30 Columnas / 267 Nodos)</h2>
          <p className="admin-subtitle" style={{ color: '#94a3b8', margin: 0 }}>
            Gestiona los títulos, íconos, descripciones e imágenes de las tecnologías de cada columna.
          </p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={handleResetTechTree}
          style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
        >
          🔄 Restablecer Estructura Predeterminada
        </button>
      </div>

      {/* Selector de Columna (1 a 30) */}
      <div className="admin-form-section card-glass" style={{ padding: '16px', marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#38bdf8' }}>1. Seleccionar Columna a Editar:</h4>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px' }}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map(col => (
            <button
              key={col}
              className={`btn ${selectedColumn === col ? 'btn-primary' : 'btn-glass'}`}
              onClick={() => setSelectedColumn(col)}
              style={{
                minWidth: '38px',
                padding: '6px 12px',
                fontSize: '0.82rem',
                fontWeight: 800
              }}
            >
              COL {col}
            </button>
          ))}
        </div>
        <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#cbd5e1' }}>
          {selectedColumn === 1 && '📌 Columna 1 (Raíz): 3 Tecnologías Base.'}
          {selectedColumn >= 2 && selectedColumn <= 15 && `📌 Columna ${selectedColumn}: 6 Tecnologías (Despliegan 2:1 desde antecedentes).`}
          {selectedColumn >= 16 && `📌 Columna ${selectedColumn}: 12 Tecnologías (Se duplican de 6 a 12, cada una vinculada a 3 antecedentes).`}
        </div>
      </div>

      {/* Nodos de la Columna Seleccionada */}
      <div className="admin-nodes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {currentColumnNodes.map((node) => (
          <div key={node.id} className="admin-node-editor-card card-glass" style={{ padding: '18px', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="badge-pill-cyan" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                {node.id} • NODO {node.indexInCol}
              </span>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={!!node.unlocked}
                  onChange={(e) => handleNodeChange(node.id, 'unlocked', e.target.checked)}
                />
                Desbloqueado
              </label>
            </div>

            {/* Form Fields */}
            <div className="admin-form-group" style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '4px' }}>
                Título de la Tecnología
              </label>
              <input 
                type="text"
                value={node.title || ''}
                onChange={(e) => handleNodeChange(node.id, 'title', e.target.value)}
                placeholder="Ej. Inteligencia Artificial Maya"
                style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '8px', borderRadius: '10px', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px', marginBottom: '10px' }}>
              <div className="admin-form-group">
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Ícono
                </label>
                <input 
                  type="text"
                  value={node.icon || '⚙️'}
                  onChange={(e) => handleNodeChange(node.id, 'icon', e.target.value)}
                  style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '8px', borderRadius: '10px', textAlign: 'center', fontSize: '1.2rem' }}
                />
              </div>
              <div className="admin-form-group">
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  URL Imagen (Opcional)
                </label>
                <input 
                  type="text"
                  value={node.image || ''}
                  onChange={(e) => handleNodeChange(node.id, 'image', e.target.value)}
                  placeholder="https://..."
                  style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '8px', borderRadius: '10px', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Descripción Corta
              </label>
              <textarea 
                rows={2}
                value={node.shortDescription || ''}
                onChange={(e) => handleNodeChange(node.id, 'shortDescription', e.target.value)}
                placeholder="Descripción del nodo tecnológico..."
                style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '8px', borderRadius: '10px', fontSize: '0.82rem', resize: 'vertical' }}
              />
            </div>

            {node.parents && node.parents.length > 0 && (
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px' }}>
                🔗 Depende de: <strong style={{ color: '#38bdf8' }}>{node.parents.join(', ')}</strong>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
