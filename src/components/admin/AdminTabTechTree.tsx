import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';
import type { PortalConfig, TechNode } from '../../types';
import { generateDefaultTechTree } from '../../utils/techTreeUtils';

interface AdminTabTechTreeProps {
  localConfig: PortalConfig;
  updateField: (section: keyof PortalConfig, field: string, value: unknown) => void;
}

export default function AdminTabTechTree({ localConfig, updateField }: AdminTabTechTreeProps) {
  const [selectedColumn, setSelectedColumn] = useState<number>(1);
  const [uploadingNodeId, setUploadingNodeId] = useState<string | null>(null);

  const techNodes: Record<string, TechNode> = localConfig.techTreeNodes || generateDefaultTechTree();

  // Get nodes for selected column
  const currentColumnNodes = Object.values(techNodes).filter(n => n.col === selectedColumn);
  currentColumnNodes.sort((a, b) => a.indexInCol - b.indexInCol);

  const handleNodeChange = (nodeId: string, field: keyof TechNode, value: unknown) => {
    const updatedMap = { ...techNodes };
    if (updatedMap[nodeId]) {
      updatedMap[nodeId] = {
        ...updatedMap[nodeId],
        [field]: value
      };
    }
    updateField('techTreeNodes' as keyof PortalConfig, '', updatedMap);
  };

  const handleImageUpload = async (nodeId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingNodeId(nodeId);
    try {
      const fileRef = ref(storage, `tech_tree_images/${nodeId}_${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      handleNodeChange(nodeId, 'image', url);
    } catch (err) {
      console.error("Error subiendo imagen de tecnología a Firebase Storage:", err);
      alert("Error al subir la imagen a Firebase Storage.");
    } finally {
      setUploadingNodeId(null);
    }
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

            {/* Sección de Imagen Personalizada y Formulario */}
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '14px', marginBottom: '12px' }}>
              {/* Lado Izquierdo: Vista Previa y Botón de Subida a Firebase */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: 'rgba(10, 15, 30, 0.9)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  {node.image ? (
                    <img src={node.image} alt={node.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '2rem' }}>{node.icon || '⚙️'}</span>
                  )}
                  {uploadingNodeId === node.id && (
                    <div style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: 'rgba(0, 0, 0, 0.75)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#38bdf8',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}>
                      Subiendo...
                    </div>
                  )}
                </div>

                <label 
                  className="btn btn-glass"
                  style={{
                    fontSize: '0.68rem',
                    padding: '4px 6px',
                    width: '100%',
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderColor: 'rgba(56, 189, 248, 0.4)',
                    color: '#38bdf8',
                    fontWeight: 700
                  }}
                >
                  {uploadingNodeId === node.id ? '⏳ Subiendo...' : '📁 Subir Imagen'}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(node.id, e)}
                    disabled={uploadingNodeId === node.id}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* Lado Derecho: Campos Principales */}
              <div>
                <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '3px' }}>
                    Título de la Tecnología
                  </label>
                  <input 
                    type="text"
                    value={node.title || ''}
                    onChange={(e) => handleNodeChange(node.id, 'title', e.target.value)}
                    placeholder="Ej. Inteligencia Artificial Maya"
                    style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '6px 10px', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '8px' }}>
                  <div className="admin-form-group">
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '3px' }}>
                      Ícono
                    </label>
                    <input 
                      type="text"
                      value={node.icon || '⚙️'}
                      onChange={(e) => handleNodeChange(node.id, 'icon', e.target.value)}
                      style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '6px', borderRadius: '8px', textAlign: 'center', fontSize: '1.1rem' }}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '3px' }}>
                      URL de Imagen (o usa botón)
                    </label>
                    <input 
                      type="text"
                      value={node.image || ''}
                      onChange={(e) => handleNodeChange(node.id, 'image', e.target.value)}
                      placeholder="https://..."
                      style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '6px 10px', borderRadius: '8px', fontSize: '0.78rem' }}
                    />
                  </div>
                </div>
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
