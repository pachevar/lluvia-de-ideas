import React, { useState, useMemo } from 'react';
import type { TechNode } from '../../types';
import { getNodesByColumn } from '../../utils/techTreeUtils';
import { TECH_TREE_COLUMNS_META } from '../../data/techTreeData';
import './TechTreeModal.css';

interface TechTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodesMap?: Record<string, TechNode>;
}

export const TechTreeModal: React.FC<TechTreeModalProps> = ({
  isOpen,
  onClose,
  nodesMap = {}
}) => {
  const [selectedColumn, setSelectedColumn] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectNode, setInspectNode] = useState<TechNode | null>(null);

  // Group nodes by column (1 to 30)
  const columnsData = useMemo(() => {
    return getNodesByColumn(nodesMap);
  }, [nodesMap]);

  if (!isOpen) return null;

  const handleColumnJump = (col: number) => {
    setSelectedColumn(col);
    const element = document.getElementById(`tech-column-${col}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  };

  return (
    <div className="tech-tree-modal-overlay" onClick={onClose}>
      <div className="tech-tree-modal-container card-glass animate-zoom-in" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Bar */}
        <div className="tech-tree-header">
          <div className="tech-tree-header-info">
            <div className="tech-tree-badge-tag">
              <span className="badge-pill-cyan">🌳 SUTZ TECH TREE</span>
              <span className="badge-pill-glass">30 COLUMNAS • 267 NODOS</span>
            </div>
            <h2 className="tech-tree-title">Árbol Tecnológico de Sutz</h2>
            <p className="tech-tree-subtitle">
              Navega por la matriz de evolución del conocimiento. Cada columna se desbloquea al dominar los nodos antecedentes.
            </p>
          </div>
          <button className="tech-tree-close-btn" onClick={onClose} aria-label="Cerrar Árbol Tecnológico">
            ✕
          </button>
        </div>

        {/* Toolbar & Fast Column Jump Navigator */}
        <div className="tech-tree-toolbar">
          <div className="tech-tree-column-selector">
            <span className="selector-label">Ir a Columna:</span>
            <button 
              className={`col-jump-btn ${selectedColumn === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedColumn('all')}
            >
              Todas (1-30)
            </button>
            <div className="col-scroll-bar">
              {Array.from({ length: 30 }, (_, idx) => idx + 1).map((col) => (
                <button
                  key={col}
                  className={`col-jump-pill ${selectedColumn === col ? 'active' : ''} ${col === 1 ? 'root-col' : ''} ${col >= 16 ? 'tier2-col' : ''}`}
                  onClick={() => handleColumnJump(col)}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          <div className="tech-tree-search">
            <input 
              type="text" 
              placeholder="🔍 Buscar tecnología..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tech-tree-search-input"
            />
          </div>
        </div>

        {/* Scrollable Columns Grid View */}
        <div className="tech-tree-grid-viewport">
          <div className="tech-tree-columns-container">
            {Array.from({ length: 30 }, (_, idx) => idx + 1).map((col) => {
              const nodesInCol = columnsData[col] || [];
              const isFiltered = selectedColumn !== 'all' && selectedColumn !== col;
              
              if (isFiltered) return null;

              const colMeta = TECH_TREE_COLUMNS_META[col] || { title: `Columna ${col}`, tier: `Col ${col}`, badgeColor: '#38bdf8' };

              return (
                <div key={col} id={`tech-column-${col}`} className={`tech-tree-column col-tier-${col === 1 ? '1' : col <= 15 ? '6' : '12'}`}>
                  {/* Column Header Header */}
                  <div className="column-header" style={{ borderColor: colMeta.badgeColor }}>
                    <span className="column-number" style={{ color: colMeta.badgeColor }}>COL {col}</span>
                    <span className="column-count-badge" style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '6px' }}>
                      {col === 1 ? '3 Nodos' : col <= 15 ? '6 Nodos' : '12 Nodos'}
                    </span>
                  </div>

                  {/* Nodes in this column */}
                  <div className="column-nodes-list">
                    {nodesInCol.map((node) => {
                      const matchesSearch = searchQuery === '' || 
                        node.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        node.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());

                      if (!matchesSearch) return null;

                      return (
                        <div 
                          key={node.id} 
                          className={`tech-node-card card-glass ${node.unlocked ? 'unlocked' : 'locked'}`}
                          onClick={() => setInspectNode(node)}
                        >
                          {/* Lado Izquierdo: Marco de Imagen Personalizada */}
                          <div className="tech-node-left-frame">
                            {node.image ? (
                              <img src={node.image} alt={node.title} className="tech-node-custom-img" />
                            ) : (
                              <div className="tech-node-placeholder-frame">
                                <span className="tech-node-placeholder-icon">{node.icon}</span>
                                <span className="tech-node-placeholder-badge">SUBIR IMG</span>
                              </div>
                            )}
                          </div>

                          {/* Lado Derecho: Textos y Metadatos */}
                          <div className="tech-node-right-content">
                            <div className="tech-node-top">
                              <span className="tech-node-id">{node.id}</span>
                              <span className="tech-node-status-pill">{node.unlocked ? '🔓' : '🔒'}</span>
                            </div>
                            <h4 className="tech-node-title">{node.title}</h4>
                            <p className="tech-node-desc">{node.shortDescription}</p>
                            <div className="tech-node-footer">
                              <span className="tech-node-status-badge">
                                {node.unlocked ? 'Disponible' : 'Requerido'}
                              </span>
                              {node.parents && node.parents.length > 0 && (
                                <span className="tech-node-parents-count" title={`Depende de ${node.parents.length} tecnologías`}>
                                  🔗 {node.parents.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Inspector Drawer Modal */}
        {inspectNode && (
          <div className="node-inspector-overlay" onClick={() => setInspectNode(null)}>
            <div className="node-inspector-card card-glass animate-zoom-in" onClick={(e) => e.stopPropagation()}>
              <button className="node-inspector-close" onClick={() => setInspectNode(null)}>✕</button>
              
              <div className="inspector-header">
                <div className="inspector-icon-ring">
                  {inspectNode.image ? (
                    <img src={inspectNode.image} alt={inspectNode.title} className="inspector-img" />
                  ) : (
                    <span className="inspector-emoji">{inspectNode.icon}</span>
                  )}
                </div>
                <div className="inspector-meta">
                  <span className="badge-pill-cyan">COLUMNA {inspectNode.col} • NODO {inspectNode.indexInCol}</span>
                  <h3 className="inspector-title">{inspectNode.title}</h3>
                </div>
              </div>

              <hr className="inspector-divider" />

              <div className="inspector-body">
                <div className="inspector-block">
                  <strong>📝 Descripción General</strong>
                  <p>{inspectNode.shortDescription}</p>
                </div>

                <div className="inspector-block">
                  <strong>🔗 Dependencias (Tecnologías Antecedentes)</strong>
                  {inspectNode.parents && inspectNode.parents.length > 0 ? (
                    <div className="inspector-parents-list">
                      {inspectNode.parents.map(pId => {
                        const parentNode = nodesMap[pId];
                        return (
                          <div key={pId} className="parent-pill-card">
                            <span>{parentNode ? parentNode.icon : '⚙️'}</span>
                            <strong>{parentNode ? parentNode.title : pId}</strong>
                            <small>({pId})</small>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="no-parents-text">🌱 Nodo Raíz Principal (Sin dependencias previas)</p>
                  )}
                </div>
              </div>

              <div className="inspector-footer">
                <button className="btn btn-primary" onClick={() => setInspectNode(null)}>
                  Entendido, Explorar Árbol 👍
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
